/* Edwards Presentation Library: app shell, presentation player, wording editor, client files. */
(function () {
  'use strict';
  const EFA = window.EFA = window.EFA || {};
  const W = 1600, H = 900;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const escBr = (s) => esc(s).replace(/\n/g, '<br>');
  const debounce = (fn, ms) => { let t; const f = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; f.flush = (...a) => { clearTimeout(t); fn(...a); }; return f; };
  const uid = () => Math.random().toString(36).slice(2, 10);
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  EFA.util = { $, $$, esc, escBr, debounce, uid, LS, reduced };

  /** inject a module's stylesheet once: EFA.css('ct', '.ct-x{...}') */
  EFA.css = function (id, text) {
    if (document.getElementById('css-' + id)) return;
    const s = document.createElement('style'); s.id = 'css-' + id; s.textContent = text; document.head.appendChild(s);
  };

  /* ---------- screen registry ---------- */
  EFA.screens = {};
  /** Register a screen. def: {title, steps, copy:{key:text}, notes, render(ctx), step(ctx,n,dir), leave(ctx)} */
  EFA.screen = function (id, def) {
    const d = Object.assign({ steps: 1, copy: {} }, def, { id });
    d.copy = Object.assign({}, d.copy);
    if (def.notes != null && d.copy._notes == null) d.copy._notes = def.notes;
    EFA.screens[id] = d;
  };

  const catalog = EFA.catalog || { presentations: [], modules: {} };
  const presByKey = {};
  catalog.presentations.forEach((p) => { presByKey[p.key] = p; });

  /* ---------- toast ---------- */
  let toastEl, toastT;
  function toast(msg, ms) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), ms || 2600);
  }
  EFA.toast = toast;

  /* ---------- numerals never in the serif face: wrap digits in serif text with DM Sans ---------- */
  const SERIF_SEL = '.serif, .st-h1, .st-h2, .st-h3, .lib-title, .card-title, .ft-n, .bar-title .p, .logo-name, .eb-panel h3, [data-serif]';
  function numify(root) {
    if (!root || document.body.classList.contains('editing')) return;
    $$(SERIF_SEL, root).concat(root.matches && root.matches(SERIF_SEL) ? [root] : []).forEach((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      const nodes = []; let n;
      while ((n = walker.nextNode())) { if (/\d/.test(n.nodeValue) && !(n.parentElement && n.parentElement.closest('.num'))) nodes.push(n); }
      nodes.forEach((t) => {
        const frag = document.createDocumentFragment();
        t.nodeValue.split(/(\d[\d,.]*\d|\d)/).forEach((part, i) => {
          if (!part) return;
          if (i % 2) { const s = document.createElement('span'); s.className = 'num'; s.textContent = part; frag.appendChild(s); } else frag.appendChild(document.createTextNode(part));
        });
        t.parentNode.replaceChild(frag, t);
      });
    });
  }
  EFA.numify = numify;

  /* ---------- platform capabilities (db, user, downloads) ---------- */
  const Platform = {
    db: null, user: null, downloads: null, canEdit: false, known: false,
    init() {
      const c = window.claude;
      const use = (n) => (c && typeof c.use === 'function') ? Promise.resolve(c.use(n)).catch(() => null) : Promise.resolve(null);
      return Promise.all([use('db'), use('user'), use('downloads')]).then(async ([db, user, dl]) => {
        this.db = db; this.user = user; this.downloads = dl;
        if (user) {
          try { this.canEdit = !!((await user.isOwner()) || (await user.canEdit())); } catch (e) { this.canEdit = false; }
        } else {
          this.canEdit = true; // a standalone copy: edits stay on this device
        }
        this.known = true;
        return this;
      });
    }
  };
  EFA.platform = Platform;

  /* ---------- wording store: every editable line of text ---------- */
  const Wording = {
    sets: { standard: { id: 'standard', name: 'Standard' } },
    ov: {}, // ov[setId][screenId] = {key: text}
    active: 'standard', mode: 'local', db: null, subs: {}, readOnly: false, chains: {}, listeners: [],
    load() {
      const s = LS.get('efa.wording.v1', null);
      if (s) { this.sets = Object.assign({ standard: { id: 'standard', name: 'Standard' } }, s.sets || {}); this.ov = s.ov || {}; }
      this.active = LS.get('efa.wset', 'standard');
      if (!this.sets[this.active]) this.active = 'standard';
    },
    saveLocal() { LS.set('efa.wording.v1', { sets: this.sets, ov: this.ov }); },
    on(fn) { this.listeners.push(fn); },
    emit(kind) { this.listeners.forEach((fn) => { try { fn(kind); } catch (e) { console.error(e); } }); },
    /** resolved text: active set, then Standard, then the built-in default */
    get(sid, key, def) {
      const a = this.ov[this.active] && this.ov[this.active][sid] && this.ov[this.active][sid][key];
      if (a != null) return a;
      if (this.active !== 'standard') {
        const s = this.ov.standard && this.ov.standard[sid] && this.ov.standard[sid][key];
        if (s != null) return s;
      }
      return def == null ? '' : def;
    },
    base(sid, key, def) {
      if (this.active === 'standard') return def == null ? '' : def;
      const s = this.ov.standard && this.ov.standard[sid] && this.ov.standard[sid][key];
      return s != null ? s : (def == null ? '' : def);
    },
    isChanged(sid, key) { const a = this.ov[this.active] && this.ov[this.active][sid]; return !!(a && a[key] != null); },
    put(sid, key, text, def) {
      if (this.readOnly) return Promise.resolve(false);
      const set = this.active, base = this.base(sid, key, def);
      const m = (this.ov[set] = this.ov[set] || {});
      const sc = Object.assign({}, m[sid] || {});
      if (text === base) delete sc[key]; else sc[key] = text;
      if (Object.keys(sc).length) m[sid] = sc; else delete m[sid];
      this.saveLocal(); this.emit('copy');
      return this.persist(set, sid);
    },
    restoreScreen(sid) {
      const set = this.active;
      if (this.ov[set] && this.ov[set][sid]) { delete this.ov[set][sid]; this.saveLocal(); this.emit('copy'); return this.persist(set, sid); }
      return Promise.resolve(true);
    },
    persist(set, sid) {
      if (this.mode !== 'db') return Promise.resolve(true);
      const path = `wording/${set}/screens/${sid}`;
      const copy = (this.ov[set] && this.ov[set][sid]) || null;
      const prev = this.chains[path] || Promise.resolve();
      const run = prev.then(async () => {
        await this.ensureSetDoc(set);
        const ref = this.db.doc(path);
        if (copy) await ref.set({ copy, updated: Date.now() }); else await ref.delete();
        return true;
      }).catch((e) => { this.writeFailed(e); return false; });
      this.chains[path] = run;
      return run;
    },
    ensured: {},
    async ensureSetDoc(set) {
      if (this.ensured[set]) return;
      const s = this.sets[set] || { name: set };
      await this.db.doc(`wording/${set}`).set({ name: s.name, created: s.created || Date.now() });
      this.ensured[set] = true;
    },
    writeFailed(e) {
      console.warn('wording write failed', e);
      if (e && (e.code === 'invalid_argument' || e.code === 'revoked')) { this.readOnly = true; toast('This copy is view-only, so wording changes cannot be saved.'); }
      else toast('A wording change did not save. It is kept on this device and will retry on your next edit.');
    },
    setActive(id) {
      if (!this.sets[id]) id = 'standard';
      this.active = id; LS.set('efa.wset', id);
      if (this.mode === 'db') this.subscribeSet(id);
      this.emit('active');
    },
    async createSet(name) {
      const id = 'w' + Date.now().toString(36) + uid().slice(0, 4);
      this.sets[id] = { id, name: name || 'New wording set', created: Date.now() };
      this.ov[id] = this.ov[id] || {};
      this.saveLocal();
      if (this.mode === 'db') { try { await this.ensureSetDoc(id); } catch (e) { this.writeFailed(e); } }
      this.setActive(id); this.emit('sets');
      return id;
    },
    async renameSet(id, name) {
      if (!this.sets[id]) return;
      this.sets[id] = Object.assign({}, this.sets[id], { name });
      this.saveLocal(); this.emit('sets');
      if (this.mode === 'db') { try { await this.db.doc(`wording/${id}`).set({ name, created: this.sets[id].created || Date.now() }); this.ensured[id] = true; } catch (e) { this.writeFailed(e); } }
    },
    async deleteSet(id) {
      if (id === 'standard' || !this.sets[id]) return;
      const screens = Object.keys(this.ov[id] || {});
      delete this.sets[id]; delete this.ov[id];
      if (this.active === id) this.setActive('standard');
      this.saveLocal(); this.emit('sets');
      if (this.mode === 'db') {
        try {
          for (const sid of screens) await this.db.doc(`wording/${id}/screens/${sid}`).delete();
          await this.db.doc(`wording/${id}`).delete();
          if (this.subs[id]) { this.subs[id](); delete this.subs[id]; }
        } catch (e) { this.writeFailed(e); }
      }
    },
    changedCount(set) { const m = this.ov[set || this.active] || {}; return Object.values(m).reduce((s, sc) => s + Object.keys(sc).length, 0); },
    exportJSON() { return JSON.stringify({ app: 'edwards-presentation-library', version: 1, exported: new Date().toISOString(), sets: this.sets, wording: this.ov }, null, 2); },
    async importJSON(text) {
      const d = JSON.parse(text);
      if (!d || !d.sets || !d.wording) throw new Error('This file is not a wording export.');
      for (const [id, s] of Object.entries(d.sets)) {
        this.sets[id] = { id, name: s.name || id, created: s.created || Date.now() };
        this.ov[id] = Object.assign({}, this.ov[id] || {}, d.wording[id] || {});
      }
      this.saveLocal(); this.emit('sets'); this.emit('copy');
      if (this.mode === 'db') {
        for (const id of Object.keys(d.sets)) for (const sid of Object.keys(this.ov[id] || {})) await this.persist(id, sid);
      }
    },
    /** switch to the shared store once the platform answers */
    attachDb(db) {
      this.db = db; this.mode = 'db';
      const localSnapshot = { sets: JSON.parse(JSON.stringify(this.sets)), ov: JSON.parse(JSON.stringify(this.ov)) };
      let first = true;
      this.subs._sets = db.collection('wording').onSnapshot((snap) => {
        const sets = { standard: { id: 'standard', name: 'Standard' } };
        snap.docs.forEach((d) => { const v = d.data() || {}; sets[d.id] = { id: d.id, name: v.name || d.id, created: v.created || 0 }; this.ensured[d.id] = true; });
        if (first) {
          first = false;
          // one-time move of wording made on this device before the shared store answered
          if (snap.empty && Object.keys(localSnapshot.ov).some((k) => Object.keys(localSnapshot.ov[k] || {}).length)) {
            Object.assign(sets, localSnapshot.sets);
            this.sets = sets;
            (async () => { for (const set of Object.keys(localSnapshot.ov)) for (const sid of Object.keys(localSnapshot.ov[set] || {})) await this.persist(set, sid); })();
          }
        }
        this.sets = Object.assign(sets, Object.fromEntries(Object.entries(this.sets).filter(([k]) => !sets[k] && this.ov[k] && Object.keys(this.ov[k]).length)));
        if (!this.sets[this.active]) this.setActive('standard');
        this.saveLocal(); this.emit('sets');
      }, (e) => console.warn('wording sets subscription ended', e));
      this.subscribeSet('standard');
      if (this.active !== 'standard') this.subscribeSet(this.active);
    },
    subscribeSet(id) {
      if (!this.db || this.subs[id]) return;
      this.subs[id] = this.db.collection(`wording/${id}/screens`).onSnapshot((snap) => {
        const m = {};
        snap.docs.forEach((d) => { const v = d.data(); if (v && v.copy) m[d.id] = Object.assign({}, v.copy); });
        // keep any local edit that has not reached the store yet
        const pending = Object.keys(this.chains).filter((p) => p.startsWith(`wording/${id}/`));
        if (!pending.length || !snap.metadata.hasPendingWrites) this.ov[id] = m;
        this.saveLocal(); this.emit('copy');
      }, (e) => console.warn('wording subscription ended', e));
    }
  };
  EFA.wording = Wording;

  /* ---------- client files: remembered inputs per client ---------- */
  const Clients = {
    list: {}, active: null, scratch: {}, mode: 'local', db: null, chains: {},
    load() {
      const s = LS.get('efa.clients.v1', null);
      if (s) this.list = s.list || {};
      this.active = LS.get('efa.client', null);
      if (this.active && !this.list[this.active]) this.active = null;
      this.scratch = LS.get('efa.scratch.v1', {});
    },
    saveLocal() { LS.set('efa.clients.v1', { list: this.list }); LS.set('efa.scratch.v1', this.scratch); },
    get(sid, key, def) {
      const c = this.active && this.list[this.active];
      const src = c ? (c.data || {}) : this.scratch;
      const v = src[sid] && src[sid][key];
      return v === undefined ? def : v;
    },
    set(sid, key, val) {
      const c = this.active && this.list[this.active];
      const src = c ? (c.data = c.data || {}) : this.scratch;
      src[sid] = Object.assign({}, src[sid] || {}, { [key]: val });
      this.saveLocal();
      if (c && this.mode === 'db') this.persistSoon(this.active);
    },
    persistSoon: debounce(function (id) { Clients.persist(id); }, 700),
    persist(id) {
      const c = this.list[id]; if (!c || !this.db) return Promise.resolve();
      const path = `clients/${id}`;
      const prev = this.chains[path] || Promise.resolve();
      return (this.chains[path] = prev.then(() => this.db.doc(path).set({ name: c.name, created: c.created || Date.now(), wording: c.wording || null, data: c.data || {} })).catch((e) => console.warn('client save failed', e)));
    },
    create(name) {
      const id = 'c' + Date.now().toString(36) + uid().slice(0, 4);
      this.list[id] = { name: name || 'New client', created: Date.now(), data: {} };
      this.saveLocal(); this.persist(id); this.setActive(id);
      return id;
    },
    rename(id, name) { if (this.list[id]) { this.list[id].name = name; this.saveLocal(); this.persist(id); } },
    remove(id) {
      if (!this.list[id]) return;
      delete this.list[id]; if (this.active === id) this.setActive(null);
      this.saveLocal();
      if (this.db) this.db.doc(`clients/${id}`).delete().catch(() => {});
    },
    setActive(id) {
      this.active = id && this.list[id] ? id : null; LS.set('efa.client', this.active);
      const c = this.active && this.list[this.active];
      if (c && c.wording && Wording.sets[c.wording]) Wording.setActive(c.wording);
      Library.renderHeader();
    },
    linkWording(id, setId) { if (this.list[id]) { this.list[id].wording = setId; this.saveLocal(); this.persist(id); } },
    attachDb(db) {
      this.db = db; this.mode = 'db';
      db.collection('clients').onSnapshot((snap) => {
        const list = {};
        snap.docs.forEach((d) => { const v = d.data() || {}; list[d.id] = { name: v.name || 'Client', created: v.created || 0, wording: v.wording || null, data: v.data || {} }; });
        // keep local clients that have not reached the store yet
        Object.keys(this.list).forEach((k) => { if (!list[k]) { list[k] = this.list[k]; this.persist(k); } });
        this.list = list;
        if (this.active && !this.list[this.active]) this.active = null;
        this.saveLocal(); Library.renderHeader();
      }, (e) => console.warn('client subscription ended', e));
    }
  };
  EFA.clients = Clients;

  /* ---------- module loader ---------- */
  const loaded = {};
  function loadModule(name) {
    if (!loaded[name]) {
      loaded[name] = new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = `js/screens/${name}.js` + (window.EFA_BUILD ? '?v=' + window.EFA_BUILD : ''); s.onload = () => res(name); s.onerror = () => rej(new Error('Could not load ' + name));
        document.head.appendChild(s);
      });
    }
    return loaded[name];
  }
  function presReady(p) { return !!p && p.screens.length > 0 && p.screens.every((s) => catalog.modules[s.id]); }
  function ensureScreens(p) {
    const mods = new Set(p.screens.map((s) => catalog.modules[s.id]).filter(Boolean));
    return Promise.all(Array.from(mods).map(loadModule));
  }
  EFA.presReady = presReady;

  /* ---------- copy helpers shared by library and screens ---------- */
  const LIB = '_lib';
  const LIB_COPY = {
    'intro.eyebrow': 'Presentation Library',
    'intro.title': 'Concepts first. Numbers second.',
    'intro.lede': 'Every presentation in one place, ready to share on screen. Open one to begin; arrows move through it.',
    'feature.k': 'Circle Talk',
    'foot.line': 'Life & Annuities · Retirement Consulting · Estate Strategy'
  };
  function defaultFor(sid, key) {
    if (sid === LIB) {
      if (key.startsWith('p.')) { const p = presByKey[key.slice(2)]; return p ? p.name : ''; }
      return LIB_COPY[key] != null ? LIB_COPY[key] : '';
    }
    const d = EFA.screens[sid];
    return d && d.copy[key] != null ? d.copy[key] : '';
  }
  function cp(sid, key, o) {
    o = o || {};
    const txt = Wording.get(sid, key, o.def != null ? o.def : defaultFor(sid, key));
    const tag = o.tag || 'span';
    return `<${tag} data-cp="${esc(sid)}|${esc(key)}"${o.cls ? ` class="${o.cls}"` : ''}${o.attrs ? ' ' + o.attrs : ''}>${escBr(txt)}</${tag}>`;
  }
  const presName = (key) => Wording.get(LIB, 'p.' + key, presByKey[key] ? presByKey[key].name : key);
  EFA.cp = cp; EFA.presName = presName;

  function refreshCopy(root) {
    $$('[data-cp]', root || document).forEach((el) => {
      if (el === document.activeElement) return;
      const [sid, key] = el.dataset.cp.split('|');
      const txt = Wording.get(sid, key, defaultFor(sid, key));
      if (el.dataset.cpRaw === '1') { el.textContent = txt; return; }
      el.innerHTML = escBr(txt);
    });
    numify(root || document.body);
  }

  /* ---------- icons ---------- */
  const I = {
    home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    prev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    pen: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20c4 0 6-1 8-3l7-7a2.1 2.1 0 0 0-3-3l-7 7c-2 2-3 4-3 8"/></svg>',
    clear: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    notes: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14v16H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
    full: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    edit: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6L9 21H3v-6z"/></svg>',
    back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5 3 12l7 7"/><path d="M3 12h18"/></svg>',
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    star: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>'
  };
  EFA.icons = I;

  /* ---------- library ---------- */
  const CATS = [
    ['all', 'All'], ['transfers', 'Wealth Transfers'], ['accumulation', 'Accumulation'], ['distribution', 'Distribution'],
    ['protection', 'Protection'], ['life', 'Life Insurance'], ['home', 'Home Equity'], ['favs', 'Favorites']
  ];
  const CAT_LABEL = { transfers: 'Wealth Transfers', accumulation: 'Accumulation', distribution: 'Distribution', protection: 'Protection', life: 'Life Insurance', home: 'Home Equity', calc: 'Calculator' };
  const FEATURED = ['CT', 'CT2', 'CT3'];
  const Library = {
    el: null, cat: LS.get('efa.cat', 'all'), q: '', favs: LS.get('efa.favs', []),
    mount(root) {
      root.innerHTML = `
        <div class="lib" id="lib">
          <header class="lib-head"><div class="lib-head-in" id="libHead"></div></header>
          <main class="lib-main" id="libMain"></main>
        </div>`;
      this.el = $('#lib', root);
      this.renderHeader(); this.renderMain();
    },
    renderHeader() {
      const head = $('#libHead'); if (!head) return;
      const c = Clients.active && Clients.list[Clients.active];
      head.innerHTML = `
        <a class="logo" href="#" id="logoHome" aria-label="Library home">
          <span class="logo-mark" aria-hidden="true">E<b>F</b>A</span>
          <span class="logo-txt"><span class="logo-name">Edwards Financial &amp; Associates</span><span class="logo-sub">Protect · Grow · Legacy</span></span>
        </a>
        <div class="lib-tools">
          <label class="lib-search">${I.search}<span class="sr-only">Search presentations</span><input id="libQ" type="search" placeholder="Search presentations" value="${esc(this.q)}" autocomplete="off"></label>
          <button class="client-pill" id="clientPill" type="button" ${Platform.canEdit ? '' : 'hidden'} title="Client file for remembered inputs"><span class="k">Client</span><span>${esc(c ? c.name : 'None')}</span></button>
          <button class="ghost-pen" id="libPen" type="button" title="Edit wording (E)" aria-label="Edit wording" ${Platform.canEdit ? '' : 'hidden'}>${I.edit}</button>
        </div>`;
      $('#libQ').addEventListener('input', (e) => { this.q = e.target.value; this.renderGrid(); });
      $('#logoHome').addEventListener('click', (e) => { e.preventDefault(); this.q = ''; $('#libQ').value = ''; this.cat = 'all'; this.renderMain(); });
      const pill = $('#clientPill'); if (pill) pill.addEventListener('click', () => ClientPanel.toggle(pill));
      const pen = $('#libPen'); if (pen) pen.addEventListener('click', () => Edit.toggle());
      numify(head);
    },
    renderMain() {
      const main = $('#libMain'); if (!main) return;
      main.innerHTML = `
        <section class="lib-intro">
          ${cp(LIB, 'intro.eyebrow', { cls: 'eyebrow' })}
          <h1 class="lib-title">${cp(LIB, 'intro.title')}</h1>
          ${cp(LIB, 'intro.lede', { tag: 'p', cls: 'lib-lede' })}
        </section>
        <section class="feature" id="feature" aria-label="Circle Talk"></section>
        <section style="display:grid;gap:14px">
          <div class="chips" id="chips" role="toolbar" aria-label="Filter presentations"></div>
          <div class="grid" id="grid"></div>
        </section>
        <footer class="lib-foot">${cp(LIB, 'foot.line')}<span>edwardsfinancialassociates.com</span></footer>`;
      this.renderFeature(); this.renderChips(); this.renderGrid();
      numify(main);
    },
    renderFeature() {
      const f = $('#feature');
      const sub = { CT: 'For people still building', CT2: 'For people in or near retirement', CT3: 'For business owners' };
      f.innerHTML = FEATURED.filter((k) => presByKey[k]).map((k) => {
        const p = presByKey[k];
        return `<button class="feature-card" type="button" data-open="${k}">
          <span class="mini">${EFA.art && EFA.art.emblem ? EFA.art.emblem({ size: 96, label: false }) : ''}</span>
          <span class="ft"><span class="ft-k">${cp(LIB, 'feature.k')}</span><span class="ft-n">${cp(LIB, 'p.' + k)}</span><span class="ft-m">${cp(LIB, 'feature.sub.' + k, { def: sub[k] })}<br><span class="num">${p.screens.length}</span> screens</span></span>
        </button>`;
      }).join('');
      $$('[data-open]', f).forEach((b) => b.addEventListener('click', () => { if (!Edit.on) Player.open(b.dataset.open); }));
    },
    visible() {
      return catalog.presentations.filter((p) => !p.hidden && FEATURED.indexOf(p.key) < 0);
    },
    renderChips() {
      const list = this.visible();
      const count = (c) => c === 'all' ? list.length : c === 'favs' ? list.filter((p) => this.favs.includes(p.key)).length : list.filter((p) => p.cats.includes(c)).length;
      $('#chips').innerHTML = CATS.map(([k, label]) => `<button class="chip" type="button" data-cat="${k}" aria-pressed="${this.cat === k}">${esc(label)}<span class="ct num">${count(k)}</span></button>`).join('');
      $$('#chips .chip').forEach((b) => b.addEventListener('click', () => { this.cat = b.dataset.cat; LS.set('efa.cat', this.cat); this.renderChips(); this.renderGrid(); }));
    },
    renderGrid() {
      const g = $('#grid'); if (!g) return;
      const q = this.q.trim().toLowerCase();
      let list = this.visible();
      if (this.cat === 'favs') list = list.filter((p) => this.favs.includes(p.key));
      else if (this.cat !== 'all') list = list.filter((p) => p.cats.includes(this.cat));
      if (q) list = list.filter((p) => (presName(p.key) + ' ' + p.kw).toLowerCase().includes(q));
      list = list.slice().sort((a, b) => (presReady(b) - presReady(a)) || presName(a.key).localeCompare(presName(b.key)));
      g.innerHTML = list.length ? list.map((p) => {
        const ready = presReady(p);
        const cat = p.cats.filter((c) => c !== 'calc').map((c) => CAT_LABEL[c]).slice(0, 2).join(' · ') || 'Concept';
        return `<div class="card ${ready ? '' : 'is-pending'}" role="button" tabindex="0" data-key="${p.key}" aria-disabled="${!ready}">
          <span class="card-ic">${EFA.topicIcons ? EFA.topicIcons.svg(p.key) : ''}</span>
          <div class="card-body"><span class="card-cat">${esc(cat)}</span>
          <h3 class="card-title">${cp(LIB, 'p.' + p.key)}</h3>
          <span class="card-meta"><span><span class="num">${p.screens.length}</span> ${p.screens.length === 1 ? 'screen' : 'screens'}</span>${ready ? '' : '<span class="tag-pending">In build</span>'}</span></div>
          <button class="star" type="button" aria-label="Favorite" aria-pressed="${this.favs.includes(p.key)}" data-fav="${p.key}">${I.star}</button>
        </div>`;
      }).join('') : '<p class="empty">No presentations match that search.</p>';
      $$('.card', g).forEach((c) => {
        const open = () => { if (Edit.on) return; const p = presByKey[c.dataset.key]; if (presReady(p)) Player.open(p.key); else toast(`${presName(p.key)} is still being rebuilt.`); };
        c.addEventListener('click', (e) => { if (e.target.closest('[data-fav]') || e.target.closest('[data-cp]') && Edit.on) return; open(); });
        c.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === c) { e.preventDefault(); open(); } });
      });
      $$('[data-fav]', g).forEach((b) => b.addEventListener('click', (e) => {
        e.stopPropagation(); const k = b.dataset.fav;
        this.favs = this.favs.includes(k) ? this.favs.filter((x) => x !== k) : this.favs.concat(k);
        LS.set('efa.favs', this.favs); b.setAttribute('aria-pressed', this.favs.includes(k)); this.renderChips();
      }));
      numify(g);
      if (Edit.on) Edit.arm(g);
    }
  };
  EFA.library = Library;

  /* ---------- presenter notes formatting ---------- */
  function notesHTML(txt) {
    if (!txt) return '<p style="opacity:.6">No notes for this screen yet. Turn on editing (E) to add some.</p>';
    return txt.split(/\n\s*\n/).map((block) => {
      const lines = block.split('\n');
      if (lines.every((l) => /^\s*[-•]\s+/.test(l))) return '<ul>' + lines.map((l) => `<li>${esc(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('') + '</ul>';
      return lines.map((l) => /^\s*PAUSE\b/i.test(l) ? `<span class="pause">${esc(l.trim())}</span>` : `<p>${esc(l)}</p>`).join('');
    }).join('');
  }

  /* ---------- player ---------- */
  const Player = {
    el: null, stage: null, pres: null, idx: 0, step: 0, stack: [], ctx: null, def: null, open_: false, pen: false, notes: LS.get('efa.notes', false),
    async open(key, idx, step, opts) {
      const p = presByKey[key];
      if (!p) { toast('That presentation is not in the library.'); return; }
      opts = opts || {};
      if (!opts.keepStack) this.stack = [];
      try { await ensureScreens(p); } catch (e) { console.warn(e); }
      this.pres = p; this.idx = Math.max(0, Math.min(idx || 0, p.screens.length - 1)); this.step = step || 0;
      if (!this.open_) this.mount();
      this.renderScreen({ instantStep: !!opts.instant });
      LS.set('efa.recent', key);
    },
    mount() {
      this.open_ = true;
      document.body.classList.add('in-player');
      const el = document.createElement('div');
      el.className = 'player'; el.id = 'player';
      el.innerHTML = `
        <div class="stage-wrap" id="stageWrap">
          <div class="stage" id="stage" aria-live="polite">
            <div class="stage-brand" aria-hidden="true"><span class="m">E<b>F</b>A</span><span class="t">Edwards Financial &amp; Associates</span></div>
            <canvas class="pen-layer" id="penLayer" width="${W * 2}" height="${H * 2}"></canvas>
          </div>
        </div>
        <button class="return-pill" id="returnPill" type="button" hidden>${I.back}<span></span></button>
        <div class="notes" id="notes" hidden><div class="notes-h"><span>Presenter notes</span><span id="notesWhere"></span></div><div class="notes-body" id="notesBody"></div></div>
        <nav class="bar" id="bar" aria-label="Presentation controls">
          <button class="ctl" id="bHome" type="button" title="Library (Esc)" aria-label="Back to library">${I.home}</button>
          <div class="bar-title"><span class="p" id="bTitle"></span><span class="c" id="bCount"></span></div>
          <span class="sep"></span>
          <button class="ctl" id="bPrev" type="button" title="Back (Left arrow)" aria-label="Previous">${I.prev}</button>
          <div class="dots" id="bDots" aria-hidden="true"></div>
          <button class="ctl" id="bNext" type="button" title="Next (Right arrow or Space)" aria-label="Next">${I.next}</button>
          <span class="sep"></span>
          <button class="ctl" id="bPen" type="button" title="Pen (P)" aria-label="Pen" aria-pressed="false">${I.pen}</button>
          <span class="pen-colors" id="penColors" hidden>
            <button type="button" data-c="#b8972e" style="background:#b8972e" aria-label="Gold pen" aria-pressed="true"></button>
            <button type="button" data-c="#b3402e" style="background:#b3402e" aria-label="Red pen" aria-pressed="false"></button>
            <button type="button" data-c="#0d1e3a" style="background:#0d1e3a;border-color:#f7f5f1" aria-label="Navy pen" aria-pressed="false"></button>
          </span>
          <button class="ctl" id="bClear" type="button" title="Clear drawing (C)" aria-label="Clear drawing" hidden>${I.clear}</button>
          <button class="ctl" id="bNotes" type="button" title="Presenter notes (N)" aria-label="Presenter notes" aria-pressed="${this.notes}">${I.notes}</button>
          <button class="ctl" id="bFull" type="button" title="Full screen (F)" aria-label="Full screen">${I.full}</button>
          <button class="ctl ctl-subtle" id="bEdit" type="button" title="Edit wording (E)" aria-label="Edit wording" ${Platform.canEdit ? '' : 'hidden'}>${I.edit}</button>
        </nav>`;
      document.body.appendChild(el);
      this.el = el; this.stage = $('#stage', el);
      $('#bHome', el).addEventListener('click', () => this.close());
      $('#bPrev', el).addEventListener('click', () => this.prev());
      $('#bNext', el).addEventListener('click', () => this.next());
      $('#bPen', el).addEventListener('click', () => this.togglePen());
      $('#bClear', el).addEventListener('click', () => Pen.clear());
      $('#bNotes', el).addEventListener('click', () => this.toggleNotes());
      $('#bFull', el).addEventListener('click', () => this.fullscreen());
      $('#bEdit', el).addEventListener('click', () => Edit.toggle());
      $('#returnPill', el).addEventListener('click', () => this.back());
      $$('#penColors button', el).forEach((b) => b.addEventListener('click', () => { Pen.color = b.dataset.c; $$('#penColors button', el).forEach((x) => x.setAttribute('aria-pressed', x === b)); }));
      Pen.attach($('#penLayer', el), this.stage);
      this.fit = this.fit.bind(this);
      window.addEventListener('resize', this.fit); this.fit();
      // idle hide of the control bar
      let idleT; const wake = () => { el.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(() => { if (!Edit.on && !$('#bar:hover', el)) el.classList.add('idle'); }, 2600); };
      el.addEventListener('mousemove', wake); el.addEventListener('touchstart', wake, { passive: true }); wake();
      // clicks on empty stage space do nothing; edit mode blocks screen clicks except on wording
      this.stage.addEventListener('click', (e) => { if (Edit.on && !e.target.closest('[data-cp]') && !e.target.closest('input,select,textarea')) { e.stopPropagation(); e.preventDefault(); } }, true);
      $('#notes', el).hidden = !this.notes;
    },
    fit() {
      if (!this.stage) return;
      const r = $('#stageWrap').getBoundingClientRect();
      const s = Math.min((r.width - 24) / W, (r.height - 24) / H);
      this.scale = Math.max(0.1, s);
      this.stage.style.transform = `scale(${this.scale})`;
    },
    close() {
      if (Edit.on) Edit.toggle(false);
      this.leaveScreen();
      if (this.el) { window.removeEventListener('resize', this.fit); this.el.remove(); }
      this.el = null; this.stage = null; this.open_ = false; this.stack = [];
      document.body.classList.remove('in-player');
      Library.renderGrid();
    },
    leaveScreen() {
      if (this.ctx) { this.ctx.clearTimers(); if (this.def && this.def.leave) { try { this.def.leave(this.ctx); } catch (e) { console.error(e); } } }
      this.ctx = null; this.def = null;
    },
    entry() { return this.pres.screens[this.idx]; },
    renderScreen(opts) {
      opts = opts || {};
      this.leaveScreen(); Pen.clear();
      const entry = this.entry(); const def = EFA.screens[entry.id] || (catalog.aliases && EFA.screens[catalog.aliases[entry.id]]);
      $$('.screen', this.stage).forEach((n) => n.remove());
      const scr = document.createElement('div');
      scr.className = 'screen' + (opts.noFade || reduced() ? '' : ' enter');
      scr.dataset.screen = entry.id;
      this.stage.insertBefore(scr, this.stage.firstChild);
      this.def = def;
      if (!def) {
        scr.innerHTML = `<div class="pending-screen"><div class="box"><span class="st-eyebrow">Screen in the build queue</span><h2 class="st-h2">This screen is still being rebuilt.</h2><p class="st-small">${esc(presName(this.pres.key))} · screen <span class="num">${this.idx + 1}</span></p></div></div>`;
        this.updateBar(); this.updateNotes(); return;
      }
      const ctx = this.ctx = makeCtx(def, entry, this.pres, scr);
      this.step = Math.max(0, Math.min(this.step, (def.steps || 1) - 1));
      try { def.render(ctx); } catch (e) { console.error(e); scr.innerHTML = `<div class="pending-screen"><div class="box"><h2 class="st-h2">This screen hit a problem.</h2><p class="st-small">${esc(e.message)}</p></div></div>`; }
      ctx.step = this.step;
      if (def.step) {
        this.stage.classList.add('instant');
        try { def.step(ctx, this.step, 0); } catch (e) { console.error(e); }
        void this.stage.offsetWidth; // apply without animation
        requestAnimationFrame(() => this.stage && this.stage.classList.remove('instant'));
      }
      if (ctx._fields.length) ctx._bindFields();
      numify(scr);
      if (Edit.on) Edit.arm(scr);
      this.updateBar(); this.updateNotes();
    },
    applyStep(n, dir) {
      const def = this.def; if (!def) return;
      this.step = n; this.ctx.step = n;
      if (def.step) { try { def.step(this.ctx, n, dir); } catch (e) { console.error(e); } }
      numify(this.stage);
      this.updateBar();
    },
    next() {
      if (!this.pres) return;
      const steps = (this.def && this.def.steps) || 1;
      if (this.def && this.step < steps - 1) return this.applyStep(this.step + 1, 1);
      if (this.idx < this.pres.screens.length - 1) { this.idx++; this.step = 0; return this.renderScreen(); }
      if (this.stack.length) return this.back();
      toast(`End of ${presName(this.pres.key)}. Esc returns to the library.`);
    },
    prev() {
      if (!this.pres) return;
      if (this.def && this.step > 0) return this.applyStep(this.step - 1, -1);
      if (this.idx > 0) {
        this.idx--; const eid = this.entry().id; const d = EFA.screens[eid] || (catalog.aliases && EFA.screens[catalog.aliases[eid]]);
        this.step = d ? (d.steps || 1) - 1 : 0;
        return this.renderScreen();
      }
      if (this.stack.length) return this.back();
    },
    goStep(n) { if (this.def) this.applyStep(Math.max(0, Math.min(n, (this.def.steps || 1) - 1)), n > this.step ? 1 : -1); },
    goScreen(i) { if (!this.pres) return; this.idx = Math.max(0, Math.min(i, this.pres.screens.length - 1)); this.step = 0; this.renderScreen(); },
    jump(key, screenId, opts) {
      const t = presByKey[key];
      if (!t) { toast('That presentation is not in the library.'); return; }
      if (!presReady(t)) { toast(`${presName(key)} is still being rebuilt.`); return; }
      this.stack.push({ key: this.pres.key, idx: this.idx, step: this.step });
      let i = screenId ? t.screens.findIndex((s) => s.id === screenId && (!opts || !opts.v || s.v === opts.v)) : 0;
      this.open(key, Math.max(0, i), 0, { keepStack: true });
    },
    back() {
      const r = this.stack.pop(); if (!r) return;
      this.open(r.key, r.idx, r.step, { keepStack: true, instant: true });
    },
    updateBar() {
      if (!this.el) return;
      $('#bTitle', this.el).textContent = presName(this.pres.key);
      $('#bCount', this.el).innerHTML = `Screen <span class="num">${this.idx + 1}</span> of <span class="num">${this.pres.screens.length}</span>`;
      const steps = (this.def && this.def.steps) || 1;
      $('#bDots', this.el).innerHTML = steps > 1 ? Array.from({ length: steps }, (_, i) => `<i class="${i <= this.step ? 'on' : ''}"></i>`).join('') : '';
      const rp = $('#returnPill', this.el);
      if (this.stack.length) { const top = this.stack[this.stack.length - 1]; rp.hidden = false; $('span', rp).textContent = 'Back to ' + presName(top.key); } else rp.hidden = true;
      numify($('#bar', this.el));
    },
    updateNotes() {
      if (!this.el) return;
      const sid = this.def ? this.def.id : null;
      $('#notesWhere', this.el).textContent = sid ? `${presName(this.pres.key)} · ${this.idx + 1}` : '';
      const body = $('#notesBody', this.el);
      if (!sid) { body.innerHTML = ''; return; }
      const txt = Wording.get(sid, '_notes', defaultFor(sid, '_notes'));
      if (Edit.on) { body.innerHTML = `<div class="notes-raw" data-cp="${esc(sid)}|_notes" data-cp-raw="1"></div>`; $('.notes-raw', body).textContent = txt; Edit.arm(body); }
      else body.innerHTML = notesHTML(txt);
    },
    toggleNotes(force) {
      this.notes = force == null ? !this.notes : force; LS.set('efa.notes', this.notes);
      if (this.el) { $('#notes', this.el).hidden = !this.notes; $('#bNotes', this.el).setAttribute('aria-pressed', this.notes); }
    },
    togglePen(force) {
      this.pen = force == null ? !this.pen : force;
      if (!this.el) return;
      this.el.classList.toggle('pen-on', this.pen);
      $('#bPen', this.el).setAttribute('aria-pressed', this.pen);
      $('#penColors', this.el).hidden = !this.pen; $('#bClear', this.el).hidden = !this.pen;
    },
    fullscreen() {
      const d = document;
      try {
        if (d.fullscreenElement) d.exitFullscreen();
        else if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(() => toast('Full screen is not available in this window.'));
        else toast('Full screen is not available in this window.');
      } catch (e) { toast('Full screen is not available in this window.'); }
    }
  };
  EFA.player = Player;

  /* ---------- pen ---------- */
  const Pen = {
    canvas: null, g: null, color: '#b8972e', width: 5, drawing: false, last: null,
    attach(canvas, stage) {
      this.canvas = canvas; this.g = canvas.getContext('2d'); this.g.scale(2, 2);
      const pt = (e) => { const r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
      canvas.addEventListener('pointerdown', (e) => { if (!Player.pen) return; this.drawing = true; this.last = pt(e); canvas.setPointerCapture(e.pointerId); this.dot(this.last); });
      canvas.addEventListener('pointermove', (e) => { if (!this.drawing) return; const p = pt(e); this.line(this.last, p); this.last = p; });
      const end = () => { this.drawing = false; this.last = null; };
      canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    },
    dot(p) { const g = this.g; g.fillStyle = this.color; g.beginPath(); g.arc(p.x, p.y, this.width / 2, 0, Math.PI * 2); g.fill(); },
    line(a, b) { const g = this.g; g.strokeStyle = this.color; g.lineWidth = this.width; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); },
    clear() { if (this.g) this.g.clearRect(0, 0, W, H); }
  };

  /* ---------- per-screen context handed to every screen ---------- */
  function makeCtx(def, entry, pres, el) {
    const sid = def.id; const timers = new Set();
    const ctx = {
      id: sid, pres: pres.key, variant: entry.v || '', el, step: 0, W, H,
      fmt: EFA.fmt, fin: EFA.fin, art: EFA.art, chart: EFA.chart, toast, esc,
      get reduced() { return reduced(); },
      /** editable text as HTML: ctx.t('key', {tag, cls, attrs}) */
      t: (key, o) => cp(sid, key, Object.assign({}, o || {}, { def: def.copy[key] != null ? def.copy[key] : '' })),
      /** resolved plain text for a key */
      text: (key) => Wording.get(sid, key, def.copy[key] != null ? def.copy[key] : ''),
      /** values remembered per client (or for this device when no client is chosen) */
      mem: (key, d) => Clients.get(sid, key, d),
      remember: (key, v) => Clients.set(sid, key, v),
      next: () => Player.next(), prev: () => Player.prev(), goStep: (n) => Player.goStep(n),
      jump: (key, screenId, o) => Player.jump(key, screenId, o),
      timeout(fn, ms) { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; },
      clearTimers() { timers.forEach((t) => clearTimeout(t)); timers.clear(); },
      $: (s) => el.querySelector(s),
      $$: (s) => Array.from(el.querySelectorAll(s)),
      /** event helper that stays quiet while wording is being edited */
      on(target, ev, fn) {
        const els = typeof target === 'string' ? Array.from(el.querySelectorAll(target)) : (Array.isArray(target) ? target : [target]);
        els.forEach((n) => n && n.addEventListener(ev, (e) => { if (Edit.on && !(n.matches && n.matches('input,select,textarea'))) return; fn(e, n); }));
      },
      /** show/hide with the stage's fade */
      show(target, on) { (typeof target === 'string' ? Array.from(el.querySelectorAll(target)) : [target]).forEach((n) => n && n.classList.toggle('is-off', !on)); },
      /* ----- calculator fields ----- */
      _fields: [], _onFields: [],
      /** HTML for a labelled numeric field. opts: {id, label (copy key), type:'money'|'pct'|'int'|'num'|'years', value, min, max, dp, suffix} */
      field(o) {
        const id = o.id, v = ctx.mem('f.' + id, o.value);
        ctx._fields.push(Object.assign({}, o, { value: v }));
        return `<div class="st-field" data-field="${esc(id)}">${o.label ? ctx.t(o.label, { tag: 'label', attrs: `for="f-${esc(sid)}-${esc(id)}"` }) : ''}<input class="st-input" id="f-${esc(sid)}-${esc(id)}" inputmode="decimal" autocomplete="off" value="${esc(fmtField(o, v))}"></div>`;
      },
      /** segmented choice (small option sets): opts {id, label (copy key), options:[{value, key (copy key)}], value} */
      choice(o) {
        const v = ctx.mem('f.' + o.id, o.value);
        ctx._fields.push({ id: o.id, type: 'choice', value: v, options: o.options });
        return `<div class="st-field" data-field="${esc(o.id)}" data-choice="1">${o.label ? ctx.t(o.label, { tag: 'span', cls: 'lb' }) : ''}<div class="st-seg" role="radiogroup">${o.options.map((op) => `<button type="button" role="radio" class="st-seg-b" data-v="${esc(String(op.value))}" aria-checked="${String(op.value) === String(v)}">${ctx.t(op.key)}</button>`).join('')}</div></div>`;
      },
      /** full-stage panel (documentation tables, detail popups). Returns the panel element; Esc or the close button removes it. */
      overlay(o) {
        o = o || {};
        const ov = document.createElement('div'); ov.className = 'st-overlay' + (o.cls ? ' ' + o.cls : '');
        ov.innerHTML = `<div class="st-overlay-in ${o.wide ? 'wide' : ''}"><div class="st-overlay-h">${o.title || ''}<button type="button" class="st-overlay-x" aria-label="Close">&times;</button></div><div class="st-overlay-b">${o.html || ''}</div></div>`;
        el.appendChild(ov);
        const close = () => { ov.remove(); document.removeEventListener('keydown', onEsc, true); if (o.onClose) o.onClose(); };
        const onEsc = (e) => { if (e.key === 'Escape' && !Edit.on) { e.stopPropagation(); e.preventDefault(); close(); } };
        document.addEventListener('keydown', onEsc, true);
        ov.querySelector('.st-overlay-x').addEventListener('click', close);
        ov.addEventListener('click', (e) => { if (e.target === ov && !Edit.on) close(); });
        numify(ov); if (Edit.on) Edit.arm(ov);
        ov.close = close;
        return ov;
      },
      values() { const out = {}; ctx._fields.forEach((f) => { out[f.id] = f.value; }); return out; },
      onFields(fn) { ctx._onFields.push(fn); },
      setField(id, v) {
        const f = ctx._fields.find((x) => x.id === id); if (!f) return; f.value = v; ctx.remember('f.' + id, v);
        if (f.type === 'choice') { el.querySelectorAll(`[data-field="${id}"] .st-seg-b`).forEach((b) => b.setAttribute('aria-checked', b.dataset.v === String(v))); return; }
        const inp = el.querySelector(`[data-field="${id}"] input`); if (inp) inp.value = fmtField(f, v);
      },
      _bindFields() {
        const fire = () => { const vals = ctx.values(); ctx._onFields.forEach((fn) => { try { fn(vals); } catch (e) { console.error(e); } }); numify(el); };
        ctx._fields.forEach((f) => {
          if (f.type === 'choice') {
            el.querySelectorAll(`[data-field="${f.id}"] .st-seg-b`).forEach((btn) => btn.addEventListener('click', () => {
              if (Edit.on) return;
              const raw = btn.dataset.v, op = f.options.find((x) => String(x.value) === raw);
              f.value = op ? op.value : raw; ctx.remember('f.' + f.id, f.value);
              el.querySelectorAll(`[data-field="${f.id}"] .st-seg-b`).forEach((b) => b.setAttribute('aria-checked', b === btn));
              fire();
            }));
            return;
          }
          const inp = el.querySelector(`[data-field="${f.id}"] input`); if (!inp) return;
          const read = () => {
            let v = EFA.fmt.parse(inp.value, f.type === 'pct');
            if (!isFinite(v)) return false;
            if (f.min != null) v = Math.max(f.min, v); if (f.max != null) v = Math.min(f.max, v);
            f.value = v; ctx.remember('f.' + f.id, v); return true;
          };
          inp.addEventListener('input', debounce(() => { if (read()) fire(); }, 220));
          inp.addEventListener('blur', () => { read(); inp.value = fmtField(f, f.value); fire(); });
          inp.addEventListener('focus', () => { inp.value = rawField(f, f.value); inp.select(); });
          inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
        });
        setTimeout(fire, 0);
      }
    };
    return ctx;
  }
  function fmtField(f, v) {
    if (v == null || !isFinite(v)) return '';
    switch (f.type) {
      case 'money': return EFA.fmt.money(v, { dp: f.dp || 0 });
      case 'pct': return EFA.fmt.pct(v, f.dp == null ? 2 : f.dp);
      case 'int': case 'years': return EFA.fmt.int(v) + (f.suffix ? ' ' + f.suffix : '');
      default: return EFA.fmt.num(v, f.dp || 0) + (f.suffix ? ' ' + f.suffix : '');
    }
  }
  function rawField(f, v) { if (v == null || !isFinite(v)) return ''; return f.type === 'pct' ? String(+(v * 100).toFixed(4)) : String(+v.toFixed(f.dp || 2)); }

  /* ---------- wording editor (subtle, owner-only) ---------- */
  const Edit = {
    on: false, bar: null, panel: null, pop: null, focusText: '', status: '',
    toggle(force) {
      if (!Platform.canEdit) return;
      this.on = force == null ? !this.on : force;
      document.body.classList.toggle('editing', this.on);
      if (this.on) {
        this.showBar();
        // show raw text (no numeral spans) while editing
        refreshCopyRaw(document.body); this.arm(document.body);
        if (Player.open_) Player.updateNotes();
      } else {
        this.closePanel(); this.closePop();
        if (this.bar) { this.bar.remove(); this.bar = null; }
        $$('[data-cp]').forEach((n) => { n.removeAttribute('contenteditable'); n.removeAttribute('tabindex'); });
        if (Player.open_) { Player.renderScreen({ noFade: true }); }
        Library.renderMain(); Library.renderHeader();
      }
    },
    arm(root) {
      if (!this.on) return;
      const plain = supportsPlaintextOnly() ? 'plaintext-only' : 'true';
      $$('[data-cp]', root).forEach((n) => {
        if (n.dataset.cpArmed === '1' && n.getAttribute('contenteditable')) return;
        n.dataset.cpArmed = '1';
        if (n.closest('svg')) { n.setAttribute('data-cp-pop', ''); n.addEventListener('click', (e) => { if (!this.on) return; e.preventDefault(); e.stopPropagation(); this.openPop(n, e); }); return; }
        n.setAttribute('contenteditable', plain); n.setAttribute('spellcheck', 'true');
        n.addEventListener('focus', () => { this.focusText = editableText(n); });
        n.addEventListener('keydown', (e) => {
          e.stopPropagation();
          if (e.key === 'Escape') { if (n.dataset.cpRaw === '1') n.textContent = this.focusText; else n.innerHTML = escBr(this.focusText); n.blur(); }
          if (e.key === 'Enter' && !e.shiftKey && n.dataset.cpRaw !== '1') { e.preventDefault(); n.blur(); }
        });
        n.addEventListener('paste', (e) => { if (plain === 'true') { e.preventDefault(); const t = (e.clipboardData || window.clipboardData).getData('text'); document.execCommand('insertText', false, t); } });
        const save = () => { const [sid, key] = n.dataset.cp.split('|'); const txt = editableText(n); this.setStatus('Saving…'); Wording.put(sid, key, txt, defaultFor(sid, key)).then((ok) => this.setStatus(ok === false ? 'Not saved' : 'Saved')); syncTwins(n, txt); };
        const saveSoon = debounce(save, 700);
        n.addEventListener('input', saveSoon);
        n.addEventListener('blur', () => saveSoon.flush());
        n.addEventListener('click', (e) => e.stopPropagation());
      });
    },
    setStatus(s) { const el = this.bar && $('.eb-status', this.bar); if (el) el.textContent = s; },
    showBar() {
      if (this.bar) this.bar.remove();
      const b = document.createElement('div'); b.className = 'editbar'; b.setAttribute('role', 'toolbar'); b.setAttribute('aria-label', 'Wording editor');
      b.innerHTML = `<span class="lbl">Editing wording</span>
        <label class="sr-only" for="ebSet">Wording set</label><select id="ebSet"></select>
        <button class="eb-btn" type="button" id="ebSets">Sets</button>
        <button class="eb-btn" type="button" id="ebRestore" title="Put this screen back to its built-in or Standard wording">Restore screen</button>
        <span class="eb-status" aria-live="polite"></span>
        <button class="eb-btn primary" type="button" id="ebDone">Done</button>`;
      document.body.appendChild(b); this.bar = b;
      this.fillSets();
      $('#ebSet', b).addEventListener('change', (e) => { Wording.setActive(e.target.value); this.afterSetChange(); });
      $('#ebSets', b).addEventListener('click', () => this.togglePanel());
      $('#ebDone', b).addEventListener('click', () => this.toggle(false));
      const rb = $('#ebRestore', b); let armed = false, t;
      rb.addEventListener('click', () => {
        const sid = Player.open_ && Player.def ? Player.def.id : null;
        if (!sid) { toast('Open a screen to restore its wording.'); return; }
        if (!armed) { armed = true; rb.textContent = 'Confirm restore'; t = setTimeout(() => { armed = false; rb.textContent = 'Restore screen'; }, 4000); return; }
        clearTimeout(t); armed = false; rb.textContent = 'Restore screen';
        Wording.restoreScreen(sid).then(() => { this.setStatus('Restored'); Player.renderScreen({ noFade: true }); });
      });
    },
    fillSets() {
      const sel = this.bar && $('#ebSet', this.bar); if (!sel) return;
      const sets = Object.values(Wording.sets).sort((a, b) => (a.id === 'standard' ? -1 : b.id === 'standard' ? 1 : (a.name || '').localeCompare(b.name || '')));
      sel.innerHTML = sets.map((s) => `<option value="${esc(s.id)}" ${s.id === Wording.active ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
    },
    afterSetChange() {
      this.fillSets(); if (this.panel) this.renderPanel();
      if (Player.open_) Player.renderScreen({ noFade: true });
      Library.renderMain();
      refreshCopyRaw(document.body); this.arm(document.body);
    },
    togglePanel() { if (this.panel) this.closePanel(); else { this.panel = document.createElement('div'); this.panel.className = 'eb-panel'; document.body.appendChild(this.panel); this.renderPanel(); } },
    closePanel() { if (this.panel) { this.panel.remove(); this.panel = null; } },
    renderPanel() {
      const p = this.panel; if (!p) return;
      const sets = Object.values(Wording.sets).sort((a, b) => (a.id === 'standard' ? -1 : b.id === 'standard' ? 1 : (a.name || '').localeCompare(b.name || '')));
      p.innerHTML = `<h3>Wording sets</h3>
        <p class="eb-note">Standard is your everyday wording. A client set starts from Standard; change only what you want said differently for that client. Changes save as you type${Wording.mode === 'db' ? ' and follow you to any device.' : ' on this device.'}</p>
        <div class="eb-sets">${sets.map((s) => `<div class="eb-set ${s.id === Wording.active ? 'active' : ''}" data-id="${esc(s.id)}">
            <span class="n">${esc(s.name)}</span><span class="eb-note"><span class="num">${Wording.changedCount(s.id)}</span> changed</span>
            ${s.id === Wording.active ? '<span class="eb-note">In use</span>' : '<button class="eb-btn" type="button" data-use>Use</button>'}
            <button class="eb-btn" type="button" data-ren>Rename</button>
            ${s.id === 'standard' ? '' : '<button class="eb-btn" type="button" data-del>Delete</button>'}
          </div>`).join('')}</div>
        <div class="eb-row"><label class="sr-only" for="ebNew">New set name</label><input type="text" id="ebNew" placeholder="New set, e.g. a client's name"><button class="eb-btn primary" type="button" id="ebCreate">Create</button></div>
        <div class="eb-row"><button class="eb-btn" type="button" id="ebExport">Save a backup file</button><label class="eb-btn" style="cursor:pointer">Load a backup file<input type="file" id="ebImport" accept=".json,application/json" hidden></label><button class="eb-btn" type="button" id="ebClose">Close</button></div>
        <div id="ebMsg"></div>`;
      $$('.eb-set', p).forEach((row) => {
        const id = row.dataset.id;
        const use = $('[data-use]', row); if (use) use.addEventListener('click', () => { Wording.setActive(id); this.afterSetChange(); });
        $('[data-ren]', row).addEventListener('click', () => {
          row.innerHTML = `<input type="text" value="${esc(Wording.sets[id].name)}" aria-label="New name"><button class="eb-btn primary" type="button">Save</button>`;
          const inp = $('input', row); inp.focus(); inp.select();
          const go = () => { const v = inp.value.trim(); if (v) Wording.renameSet(id, v).then(() => { this.fillSets(); this.renderPanel(); }); };
          $('button', row).addEventListener('click', go); inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') go(); });
        });
        const del = $('[data-del]', row);
        if (del) del.addEventListener('click', () => {
          const msg = $('#ebMsg', p);
          msg.innerHTML = `<div class="eb-confirm eb-row">Delete "${esc(Wording.sets[id].name)}" and its wording?<button class="eb-btn primary" type="button" id="ebYes">Delete</button><button class="eb-btn" type="button" id="ebNo">Keep</button></div>`;
          $('#ebYes', p).addEventListener('click', () => Wording.deleteSet(id).then(() => this.afterSetChange()));
          $('#ebNo', p).addEventListener('click', () => { msg.innerHTML = ''; });
        });
      });
      const create = () => { const v = $('#ebNew', p).value.trim(); if (!v) return; Wording.createSet(v).then(() => this.afterSetChange()); };
      $('#ebCreate', p).addEventListener('click', create);
      $('#ebNew', p).addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') create(); });
      $('#ebClose', p).addEventListener('click', () => this.closePanel());
      $('#ebExport', p).addEventListener('click', async () => {
        const data = Wording.exportJSON(); const msg = $('#ebMsg', p);
        if (Platform.downloads) {
          try { await Platform.downloads.save({ filename: 'edwards-wording-backup.json', data }); msg.innerHTML = '<p class="eb-note">Backup saved.</p>'; return; } catch (e) { if (e && e.code === 'declined') return; }
        }
        msg.innerHTML = '<p class="eb-note">Copy this text and keep it somewhere safe:</p><textarea style="width:100%;min-height:120px" readonly></textarea>';
        const ta = $('textarea', msg); ta.value = data; ta.select();
      });
      $('#ebImport', p).addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = () => { Wording.importJSON(String(r.result)).then(() => { this.afterSetChange(); $('#ebMsg', p).innerHTML = '<p class="eb-note">Backup loaded.</p>'; }).catch((err) => { $('#ebMsg', p).innerHTML = `<p class="eb-note">${esc(err.message)}</p>`; }); };
        r.readAsText(f);
      });
      numify(p);
    },
    openPop(n, e) {
      this.closePop();
      const [sid, key] = n.dataset.cp.split('|');
      const pop = document.createElement('div'); pop.className = 'cp-pop';
      pop.innerHTML = `<textarea aria-label="Wording"></textarea><div class="eb-row"><button class="eb-btn primary" type="button">Save</button><button class="eb-btn" type="button">Cancel</button></div>`;
      $('textarea', pop).value = Wording.get(sid, key, defaultFor(sid, key));
      document.body.appendChild(pop); this.pop = pop;
      const x = Math.min(window.innerWidth - pop.offsetWidth - 12, Math.max(12, e.clientX - 20)), y = Math.min(window.innerHeight - pop.offsetHeight - 12, e.clientY + 14);
      pop.style.left = x + 'px'; pop.style.top = y + 'px';
      const [ok, no] = $$('button', pop);
      ok.addEventListener('click', () => { const v = $('textarea', pop).value.replace(/\n+$/, ''); Wording.put(sid, key, v, defaultFor(sid, key)).then(() => this.setStatus('Saved')); n.textContent = v; this.closePop(); });
      no.addEventListener('click', () => this.closePop());
      $('textarea', pop).addEventListener('keydown', (ev) => ev.stopPropagation());
      $('textarea', pop).focus();
    },
    closePop() { if (this.pop) { this.pop.remove(); this.pop = null; } }
  };
  EFA.edit = Edit;
  /** read what the person typed, ignoring CSS text-transform (innerText would return the uppercase rendering) */
  function editableText(el) {
    let out = '';
    const walk = (n) => {
      n.childNodes.forEach((c) => {
        if (c.nodeType === 3) out += c.nodeValue;
        else if (c.nodeName === 'BR') out += '\n';
        else if (/^(DIV|P)$/.test(c.nodeName)) { if (out && !out.endsWith('\n')) out += '\n'; walk(c); }
        else walk(c);
      });
    };
    walk(el);
    return out.replace(/\u00a0/g, ' ').replace(/\n+$/, '');
  }
  function supportsPlaintextOnly() { const d = document.createElement('div'); try { d.contentEditable = 'plaintext-only'; return d.contentEditable === 'plaintext-only'; } catch (e) { return false; } }
  function syncTwins(src, txt) { $$(`[data-cp="${CSS.escape(src.dataset.cp)}"]`).forEach((n) => { if (n !== src) { if (n.dataset.cpRaw === '1') n.textContent = txt; else n.innerHTML = escBr(txt); } }); }
  function refreshCopyRaw(root) {
    $$('[data-cp]', root).forEach((el) => {
      if (el === document.activeElement) return;
      const [sid, key] = el.dataset.cp.split('|');
      const txt = Wording.get(sid, key, defaultFor(sid, key));
      if (el.dataset.cpRaw === '1' || el.closest('svg')) el.textContent = txt; else el.innerHTML = escBr(txt);
    });
  }

  /* ---------- client panel ---------- */
  const ClientPanel = {
    el: null,
    toggle(anchor) { if (this.el) return this.close(); this.el = document.createElement('div'); this.el.className = 'eb-panel'; this.el.style.top = '78px'; document.body.appendChild(this.el); this.render(); },
    close() { if (this.el) { this.el.remove(); this.el = null; } },
    render() {
      const p = this.el; if (!p) return;
      const list = Object.entries(Clients.list).sort((a, b) => (a[1].name || '').localeCompare(b[1].name || ''));
      const sets = Object.values(Wording.sets);
      p.innerHTML = `<h3>Client files</h3>
        <p class="eb-note">A client file remembers the numbers you enter on calculators and the choices you make on screens, so the next meeting picks up where you left off. Only you can see client files.</p>
        <div class="eb-sets">
          <div class="eb-set ${!Clients.active ? 'active' : ''}"><span class="n">No client (scratch)</span>${!Clients.active ? '<span class="eb-note">In use</span>' : '<button class="eb-btn" type="button" data-none>Use</button>'}</div>
          ${list.map(([id, c]) => `<div class="eb-set ${id === Clients.active ? 'active' : ''}" data-id="${esc(id)}"><span class="n">${esc(c.name)}</span>
            <label class="sr-only" for="ws-${esc(id)}">Wording set</label><select id="ws-${esc(id)}" data-ws title="Wording set used with this client"><option value="">Wording: current</option>${sets.map((s) => `<option value="${esc(s.id)}" ${c.wording === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
            ${id === Clients.active ? '<span class="eb-note">In use</span>' : '<button class="eb-btn" type="button" data-use>Use</button>'}
            <button class="eb-btn" type="button" data-del>Delete</button></div>`).join('')}
        </div>
        <div class="eb-row"><label class="sr-only" for="cpNew">Client name</label><input type="text" id="cpNew" placeholder="New client file name"><button class="eb-btn primary" type="button" id="cpCreate">Create</button><button class="eb-btn" type="button" id="cpClose">Close</button></div>
        <div id="cpMsg"></div>`;
      const n = $('[data-none]', p); if (n) n.addEventListener('click', () => { Clients.setActive(null); this.render(); });
      $$('.eb-set[data-id]', p).forEach((row) => {
        const id = row.dataset.id;
        const u = $('[data-use]', row); if (u) u.addEventListener('click', () => { Clients.setActive(id); this.render(); });
        $('[data-ws]', row).addEventListener('change', (e) => { Clients.linkWording(id, e.target.value || null); if (id === Clients.active && e.target.value) { Wording.setActive(e.target.value); Library.renderMain(); } });
        $('[data-del]', row).addEventListener('click', () => {
          $('#cpMsg', p).innerHTML = `<div class="eb-confirm eb-row">Delete the file for "${esc(Clients.list[id].name)}"?<button class="eb-btn primary" type="button" id="cpYes">Delete</button><button class="eb-btn" type="button" id="cpNo">Keep</button></div>`;
          $('#cpYes', p).addEventListener('click', () => { Clients.remove(id); this.render(); });
          $('#cpNo', p).addEventListener('click', () => { $('#cpMsg', p).innerHTML = ''; });
        });
      });
      const create = () => { const v = $('#cpNew', p).value.trim(); if (!v) return; Clients.create(v); this.render(); };
      $('#cpCreate', p).addEventListener('click', create);
      $('#cpNew', p).addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') create(); });
      $('#cpClose', p).addEventListener('click', () => this.close());
    }
  };

  /* ---------- keyboard ---------- */
  function onKey(e) {
    const tgt = e.target;
    if (tgt && (tgt.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tgt.tagName))) return;
    const k = e.key;
    if (k === 'e' || k === 'E') { if (Platform.canEdit) { e.preventDefault(); Edit.toggle(); } return; }
    if (!Player.open_) { if (k === '/') { const q = $('#libQ'); if (q) { e.preventDefault(); q.focus(); } } return; }
    switch (k) {
      case 'ArrowRight': case 'PageDown': case ' ': case 'Spacebar': e.preventDefault(); Player.next(); break;
      case 'ArrowLeft': case 'PageUp': case 'Backspace': e.preventDefault(); Player.prev(); break;
      case 'Home': e.preventDefault(); Player.goScreen(0); break;
      case 'End': e.preventDefault(); Player.goScreen(Player.pres.screens.length - 1); break;
      case 'p': case 'P': Player.togglePen(); break;
      case 'c': case 'C': Pen.clear(); break;
      case 'n': case 'N': Player.toggleNotes(); break;
      case 'f': case 'F': Player.fullscreen(); break;
      case 'Escape':
        if (Edit.on) Edit.toggle(false);
        else if (Player.pen) Player.togglePen(false);
        else if (Player.stack.length) Player.back();
        else Player.close();
        break;
      default: break;
    }
  }

  /* ---------- boot ---------- */
  function boot() {
    Wording.load(); Clients.load();
    const app = document.getElementById('app');
    Library.mount(app);
    document.addEventListener('keydown', onKey);
    Wording.on((kind) => {
      if (kind === 'sets' && Edit.on) { Edit.fillSets(); if (Edit.panel) Edit.renderPanel(); }
      if (kind === 'copy' || kind === 'active') { if (Edit.on) refreshCopyRaw(document.body); else refreshCopy(document.body); if (Player.open_) { Player.updateBar(); if (!Edit.on) Player.updateNotes(); } }
    });
    Platform.init().then(() => {
      if (Platform.db) { Wording.attachDb(Platform.db); if (Platform.canEdit) Clients.attachDb(Platform.db); }
      Library.renderHeader();
      if (Player.el) { const b = $('#bEdit', Player.el); if (b) b.hidden = !Platform.canEdit; }
    });
    // deep link: #CT2 or #CT2-5
    const h = (location.hash || '').slice(1);
    const m = h.match(/^([A-Za-z0-9]+)(?:-(\d+))?$/);
    if (m && presByKey[m[1]] && presReady(presByKey[m[1]])) Player.open(m[1], m[2] ? parseInt(m[2], 10) - 1 : 0);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
