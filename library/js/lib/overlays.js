/* Shared components: disclosures (Joshua's compliance lines by topic, and the return-rate notice),
   the historic inflation lookup, per-client values shared across screens (case data), and the small
   modal plumbing that worksheet.js and life.js reuse (EFA.lib._).
   API and examples: docs/components.md. All wording is editable (pseudo-screens _lib_disclosure, _lib_inflation). */
(function () {
  'use strict';
  const EFA = window.EFA = window.EFA || {};
  const L = EFA.lib = EFA.lib || {};
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* =====================================================================================
     Internal plumbing shared by the lib files (EFA.lib._). Not for screens.
     ===================================================================================== */
  let seq = 0;
  const uid = (p) => `${p || 'l'}${(++seq).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const editing = () => !!(EFA.edit && EFA.edit.on);
  const cp = (sid, key, o) => EFA.cp(sid, key, o);
  /** resolved plain text of a lib copy key (active wording set, then Standard, then the default) */
  const text = (sid, key) => {
    const d = EFA.screens && EFA.screens[sid];
    const def = d && d.copy && d.copy[key] != null ? d.copy[key] : '';
    return EFA.wording ? EFA.wording.get(sid, key, def) : def;
  };
  /** plain text of rendered copy HTML (for file names, CSV headers, aria labels) */
  function plain(html) {
    const d = document.createElement('div');
    d.innerHTML = html == null ? '' : String(html).replace(/<br\s*\/?>/gi, ' ');
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }
  /** a screen's own words: HTML as given, or one of the screen's copy keys rendered with ctx.t */
  function asHTML(ctx, v) {
    if (v == null) return '';
    if (typeof v !== 'string' || !ctx || !/^[\w.-]+$/.test(v)) return v;
    const d = EFA.screens && EFA.screens[ctx.id];
    return d && d.copy && Object.prototype.hasOwnProperty.call(d.copy, v) ? ctx.t(v) : v;
  }
  /** after replacing part of an overlay: digits out of the serif face, or arm editing */
  function refresh(node) {
    if (!node) return;
    if (editing()) { if (EFA.edit.arm) EFA.edit.arm(node); } else if (EFA.numify) EFA.numify(node);
  }
  /** register a lib pseudo-screen that only holds editable copy */
  function copyScreen(sid, title, copy) {
    EFA.screen(sid, {
      title, copy,
      render(ctx) {
        // a plain wording sheet, in case this id is ever placed in a presentation
        ctx.el.innerHTML = `<div class="lib-sheet">${Object.keys(copy).map((k) => cp(sid, k, { tag: 'p', cls: 'lib-sheet-v' })).join('')}</div>`;
      }
    });
  }

  /** delegated wiring: one listener per event type on ctx.el; returns the token for data-lib="..." */
  function wire(ctx, ev, fn) {
    const el = ctx.el;
    const reg = el.__libWire || (el.__libWire = {});
    if (!reg[ev]) {
      const map = reg[ev] = new Map();
      el.addEventListener(ev, (e) => {
        const t = e.target && e.target.closest ? e.target.closest('[data-lib]') : null;
        if (!t || !el.contains(t)) return;
        const h = map.get(t.getAttribute('data-lib'));
        if (!h || editing()) return;
        h(e, t);
      });
    }
    const tok = uid('w');
    reg[ev].set(tok, fn);
    return tok;
  }

  /* ----- screen visits: state that lasts while the presenter stays on one screen, even across re-renders ----- */
  const V = { stage: null, key: '', id: 0, obs: null, sid: -1, state: {}, leave: new Map() };
  const posKey = () => { const P = EFA.player; return P && P.pres ? `${P.pres.key}:${P.idx}` : ''; };
  function runLeave(fns) { fns.forEach((f) => { try { f(); } catch (e) { /* best effort cleanup */ } }); }
  function visit() {
    const P = EFA.player, st = P && P.stage;
    if (st !== V.stage) {
      if (V.obs) V.obs.disconnect();
      V.leave.forEach(runLeave); V.leave.clear();
      V.obs = null; V.stage = st; V.key = posKey(); V.id++;
      if (st && typeof MutationObserver === 'function') {
        V.obs = new MutationObserver((muts) => {
          let added = false;
          muts.forEach((m) => {
            m.removedNodes.forEach((n) => { const fns = V.leave.get(n); if (fns) { V.leave.delete(n); runLeave(fns); } });
            m.addedNodes.forEach((n) => { if (n.classList && n.classList.contains('screen')) added = true; });
          });
          if (added) { const k = posKey(); if (k !== V.key) { V.key = k; V.id++; } }
        });
        V.obs.observe(st, { childList: true });
      }
    }
    return V.id;
  }
  /** per-visit state: visitState('inf:infl', () => ({ pair: [] })) */
  function visitState(name, init) {
    const id = visit();
    if (V.sid !== id) { V.sid = id; V.state = {}; }
    if (!Object.prototype.hasOwnProperty.call(V.state, name)) V.state[name] = init ? init() : {};
    return V.state[name];
  }
  /** run fn when this screen element leaves the stage (screen change or re-render) */
  function onLeave(el, fn) {
    visit();
    if (!el) return;
    const a = V.leave.get(el) || [];
    a.push(fn); V.leave.set(el, a);
  }

  /* ----- keys while a lib modal is open: slide navigation keys stay inside the modal ----- */
  const NAV = new Set(['ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp', ' ', 'Spacebar', 'Home', 'End', 'Backspace']);
  function keyGuard(root, o) {
    o = o || {};
    const onKey = (e) => {
      if (!root.isConnected) { document.removeEventListener('keydown', onKey, true); return; }
      if (editing()) return;
      const t = e.target;
      const typing = !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)));
      if (e.key === 'Escape' && o.blockEscape) { e.stopPropagation(); e.preventDefault(); return; }
      if (o.onEnter && !typing && (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar')) { e.stopPropagation(); e.preventDefault(); o.onEnter(); return; }
      if (typing) return;
      if (NAV.has(e.key)) e.stopPropagation(); // the default action (scrolling, pressing a focused button) still happens
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }

  /** a ctx.overlay with the lib look; cleans up when the screen leaves */
  function panel(ctx, o) {
    let un = null, closed = false;
    const ov = ctx.overlay({
      title: `<span data-serif>${o.title}</span>`, html: o.html, cls: 'lib-modal ' + (o.cls || ''),
      onClose: () => {
        if (closed) return; closed = true;
        if (un) un();
        if (o.onClose && ctx.el.isConnected) { try { o.onClose(); } catch (e) { console.error(e); } }
      }
    });
    un = keyGuard(ov);
    onLeave(ctx.el, () => { if (!closed && ov.close) ov.close(); });
    return ov;
  }

  /** put a value into a ctx.field and let the screen's onFields handlers run (as if typed) */
  function applyField(ctx, id, v) {
    if (!id || !ctx.setField) return;
    ctx.setField(id, v);
    const inp = ctx.el.querySelector(`[data-field="${String(id).replace(/["\\]/g, '\\$&')}"] input`);
    if (inp) inp.dispatchEvent(new Event('blur'));
  }

  /** small icons drawn in code (stroke = currentColor) */
  const ic = (d, s) => `<svg class="lib-ic" viewBox="0 0 24 24" width="${s || 20}" height="${s || 20}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON = {
    check: ic('<path d="M5 12.5l4.6 4.6L19 7.6"/>', 22),
    trend: ic('<path d="M4 17.5l5.2-5.2 3.6 3.1L20 8"/><path d="M14.6 8H20v5.4"/>', 16),
    glass: ic('<path d="M7 3.5h10M7 20.5h10"/><path d="M8 3.5c0 4.6 4 5.2 4 8.5s-4 3.9-4 8.5M16 3.5c0 4.6-4 5.2-4 8.5s4 3.9 4 8.5"/>', 16),
    sheet: ic('<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M4 9h16M4 14.5h16M10 9v11.5"/>', 20),
    down: ic('<path d="M12 4v11"/><path d="M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19.5h14"/>', 20)
  };

  /** the opener for a popup: look 'dot' (small round icon), 'text' (text link) or 'pill' */
  function opener(ctx, o, d, open) {
    o = o || {};
    const tok = wire(ctx, 'click', (e) => { e.preventDefault(); open(); });
    const look = o.look || 'dot';
    const st = o.style ? ` style="${esc(o.style)}"` : '';
    const cls = o.cls ? ' ' + o.cls : '';
    if (look === 'dot') return `<button type="button" class="lib-dot${cls}" data-lib="${tok}" aria-label="${esc(o.label != null ? plain(asHTML(ctx, o.label)) : text(d.sid, d.key))}"${st}>${d.icon}</button>`;
    const label = o.label != null ? asHTML(ctx, o.label) : cp(d.sid, d.key);
    if (look === 'pill') return `<button type="button" class="st-pill lib-pill${cls}" data-lib="${tok}"${st}>${label}</button>`;
    return `<button type="button" class="lib-link${cls}" data-lib="${tok}"${st}>${d.linkIcon || ''}${label}</button>`;
  }

  L._ = { esc, uid, editing, cp, text, plain, asHTML, refresh, copyScreen, wire, visit, visitState, onLeave, keyGuard, panel, applyField, ICON, opener };

  /* =====================================================================================
     CSS shared by every lib modal and opener
     ===================================================================================== */
  EFA.css('lib-overlays', `
  .stage .st-overlay.lib-modal { z-index: 32; }
  .stage .lib-modal .st-overlay-in { width: 980px; }
  .stage .lib-modal .st-overlay-h { padding: 20px 26px 20px 30px; font-size: 32px; }
  .stage .lib-modal .st-overlay-b { padding: 26px 30px 28px; }
  .stage .lib-box { background: var(--cream); border: 1px solid var(--rule); border-radius: 12px; padding: 18px 20px; box-shadow: 0 6px 18px rgba(13,30,58,.06); }
  .stage .lib-box p { margin: 0; }
  .stage .lib-cap { margin: 0 0 10px; font: 700 14px/1.2 var(--f-body); letter-spacing: .18em; text-transform: uppercase; color: var(--gold-deep); text-align: center; }
  .stage .lib-row { display: flex; align-items: center; gap: 14px; }
  .stage .lib-row.end { justify-content: flex-end; }
  .stage .lib-row.split { justify-content: space-between; }
  .stage .lib-pill .lib-ic, .stage .lib-link .lib-ic { flex: 0 0 auto; }
  .stage .lib-pill { gap: 10px; }
  .stage .st-pill.lib-ghost { background: transparent; color: var(--navy); border-color: var(--mist-2); }
  .stage .lib-link { display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent; padding: 4px 2px; color: var(--gold-deep); font: 600 19px/1.2 var(--f-body); letter-spacing: .01em; }
  .stage .lib-link > [data-cp] { border-bottom: 1.5px dotted currentColor; }
  .stage .lib-link:hover { color: var(--navy); }
  .stage .lib-dot { display: inline-grid; place-items: center; width: 30px; height: 30px; padding: 0; border-radius: 999px; border: 2px solid var(--gold); background: var(--navy); color: var(--cream); vertical-align: middle; box-shadow: 0 3px 8px rgba(13,30,58,.18); transition: transform .2s ease, background .2s ease; }
  .stage .lib-dot:hover { background: var(--gold); color: var(--navy); transform: scale(1.08); }
  .stage .lib-pending { display: grid; gap: 10px; justify-items: center; text-align: center; padding: 34px 30px; }
  .stage .lib-pending p { margin: 0; max-width: 620px; font: 400 21px/1.5 var(--f-body); color: var(--navy); }
  .stage .lib-pending .lib-pend-mark { width: 54px; height: 54px; border-radius: 999px; border: 2px dashed var(--gold); display: grid; place-items: center; color: var(--gold-deep); }
  .stage .lib-sheet { position: absolute; left: 110px; right: 110px; top: 70px; bottom: 80px; columns: 2; column-gap: 50px; overflow: hidden; }
  .stage .lib-sheet-v { margin: 0 0 12px; font: 400 16px/1.45 var(--f-body); color: var(--navy); break-inside: avoid; }

  /* disclosure notice */
  .stage .st-overlay.lib-disc { z-index: 36; }
  .stage .lib-disc .st-overlay-in { width: 760px; }
  .stage .lib-disc .st-overlay-b { display: grid; gap: 18px; padding: 34px 44px 30px; }
  .stage .lib-disc-head { margin: 0; text-align: center; font: 700 21px/1.35 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--navy); }
  .stage .lib-disc-body { margin: 0; font: 400 20px/1.6 var(--f-body); color: var(--navy); }
  .stage .lib-disc-rule { width: 64px; height: 3px; background: var(--gold); border: 0; margin: 0 auto; }
  .stage .lib-disc-line { margin: 0; }

  /* inflation lookup */
  .stage .lib-inf .st-overlay-in { width: 1020px; }
  .stage .lib-inf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
  .stage .lib-inf-scroll { height: 470px; overflow: auto; border: 1px solid var(--rule); border-radius: 12px; background: #fff; overscroll-behavior: contain; }
  .stage table.lib-inf-tab { font-size: 19px; }
  .stage table.lib-inf-tab th { position: sticky; top: 0; z-index: 1; }
  .stage table.lib-inf-tab th.c, .stage table.lib-inf-tab td.c { text-align: center; }
  .stage table.lib-inf-tab tbody tr { cursor: pointer; }
  .stage table.lib-inf-tab tbody tr:hover td { background: var(--mist); }
  .stage table.lib-inf-tab tbody tr.span td { background: var(--gold-pale); }
  .stage table.lib-inf-tab tbody tr.pick td { background: var(--gold); color: var(--navy); font-weight: 700; }
  .stage .lib-inf-side { display: grid; gap: 16px; }
  .stage .lib-inf-help { font: 400 20px/1.5 var(--f-body); color: var(--navy); }
  .stage .lib-inf-res { display: grid; gap: 10px; }
  .stage .lib-inf-res .ln { font: 500 20px/1.4 var(--f-body); color: var(--navy); }
  .stage .lib-inf-res .ln b { font-weight: 700; }
  .stage .lib-inf-avg { display: grid; gap: 4px; margin-top: 6px; padding-top: 14px; border-top: 1px solid var(--rule); }
  .stage .lib-inf-avg .k { font: 700 13px/1.2 var(--f-body); letter-spacing: .16em; text-transform: uppercase; color: var(--gold-deep); }
  .stage .lib-inf-avg .v { font: 700 46px/1 var(--f-body); color: var(--navy); }
  .stage .lib-src { font: 400 18px/1.55 var(--f-body); color: var(--navy); }
  .stage .lib-src .url { display: block; margin-top: 10px; font-size: 15px; color: var(--muted); overflow-wrap: anywhere; }
  .stage .lib-inf-foot { margin-top: 22px; min-height: 48px; }
  .stage .lib-scroll::-webkit-scrollbar { width: 12px; height: 12px; }
  .stage .lib-scroll::-webkit-scrollbar-track { background: #f1f3f7; }
  .stage .lib-scroll::-webkit-scrollbar-thumb { background: #b9c3d2; border-radius: 999px; border: 3px solid #f1f3f7; }
  .stage .lib-scroll::-webkit-scrollbar-thumb:hover { background: var(--gold); }
  .stage .lib-scroll::-webkit-scrollbar-corner { background: #f1f3f7; }
  `);

  /* =====================================================================================
     EFA.lib.disclosure: compliance lines by topic + the return-rate notice
     ===================================================================================== */
  const DS = '_lib_disclosure';
  const TOPICS = ['hypothetical', 'guarantees', 'tax', 'loans', 'notAdvice', 'past', 'license'];
  copyScreen(DS, 'Shared wording: disclosures', {
    'notice.title': 'Disclosure',
    'notice.head': 'Investment values rise and fall',
    'notice.body': 'The figures on this screen are a hypothetical illustration. They assume one fixed rate of return every year, and real investments never move in a straight line: returns and the value of the principal both rise and fall over time. The illustration leaves out the costs of investing, such as fees and expenses, and it does not represent any particular investment or product. Actual results will vary.',
    'notice.ok': 'OK',
    hypothetical: 'This is a hypothetical illustration for discussion only. It is not a guarantee, and it is not a projection of any specific product. Actual results will vary.',
    guarantees: 'Guarantees of insurance and annuity products are backed by the claims-paying ability of the issuing insurer.',
    tax: 'Life insurance death benefits are generally income-tax-free under current tax law, subject to applicable requirements.',
    loans: 'Policy loans and withdrawals reduce the cash value and the death benefit, and they may cause the policy to lapse. If a policy is classified as a modified endowment contract (MEC), loans and withdrawals are taxed differently.',
    notAdvice: 'This is not tax or legal advice. Please talk with a qualified tax professional about your own situation.',
    past: 'Past performance does not guarantee future results.',
    license: 'Joshua Edwards is a licensed life and annuity insurance producer, CA Insurance License #0G52544, and does not offer securities or investment advice.'
  });

  function topicList(topics) {
    const list = (Array.isArray(topics) ? topics : [topics]).filter(Boolean);
    list.forEach((t) => { if (TOPICS.indexOf(t) < 0) console.warn('EFA.lib.disclosure: unknown topic "' + t + '". Topics: ' + TOPICS.join(', ')); });
    return list.filter((t) => TOPICS.indexOf(t) >= 0);
  }

  /** open the return-rate notice now; only its OK button closes it */
  function openNotice(ctx, o) {
    o = o || {};
    visit();
    const ov = document.createElement('div');
    ov.className = 'st-overlay lib-modal lib-disc';
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = `<div class="st-overlay-in"><div class="st-overlay-h"><span data-serif>${cp(DS, 'notice.title')}</span></div>
      <div class="st-overlay-b">
        ${cp(DS, 'notice.head', { tag: 'p', cls: 'lib-disc-head' })}
        <hr class="lib-disc-rule">
        ${cp(DS, 'notice.body', { tag: 'p', cls: 'lib-disc-body' })}
        <div class="lib-row end"><button type="button" class="st-pill lib-pill lib-disc-ok">${ICON.check}${cp(DS, 'notice.ok')}</button></div>
      </div></div>`;
    ctx.el.appendChild(ov);
    let done = false, un = null;
    const close = () => {
      if (done) return; done = true;
      if (un) un();
      ov.remove();
      if (o.onClose && ctx.el.isConnected) { try { o.onClose(); } catch (e) { console.error(e); } }
    };
    const ok = ov.querySelector('.lib-disc-ok');
    ok.addEventListener('click', () => { if (!editing()) close(); });
    un = keyGuard(ov, { blockEscape: true, onEnter: close });
    refresh(ov);
    setTimeout(() => { if (ok.isConnected && !editing()) ok.focus({ preventScroll: true }); }, 30);
    return { el: ov, close };
  }

  /** shared per-visit flags: 'open' (notice showing) or 'done' (acknowledged) */
  function flagState(flag) {
    const S = visitState('disc', () => ({}));
    const f = S[flag];
    if (f && f.status === 'open' && !(f.el && f.el.isConnected)) delete S[flag]; // dropped by a re-render before OK
    return S;
  }

  L.disclosure = {
    topics: TOPICS.slice(),
    html(topic, o) { o = o || {}; return topicList(topic).map((t) => cp(DS, t, { tag: o.tag || 'span', cls: o.cls })).join(' '); },
    text(topic) { return topicList(topic).map((t) => text(DS, t)).join(' '); },
    line(topics, o) {
      o = o || {};
      const tag = o.tag || 'p';
      return `<${tag} class="st-disclaimer lib-disc-line${o.cls ? ' ' + o.cls : ''}"${o.style ? ` style="${esc(o.style)}"` : ''}>${topicList(topics).map((t) => cp(DS, t)).join(' ')}</${tag}>`;
    },
    open(ctx, o) { return openNotice(ctx, o); },
    once(ctx, flag, then) {
      flag = flag || 'rate';
      const S = flagState(flag);
      const f = S[flag];
      if (f && f.status === 'done') { if (then) then(); return; }
      if (f && f.status === 'open') return;
      const rec = S[flag] = { status: 'open', el: null };
      rec.el = openNotice(ctx, { onClose: () => { rec.status = 'done'; if (then) then(); } }).el;
    },
    guard(ctx, field, o) {
      o = o || {};
      const flag = o.flag || 'rate';
      const el = ctx.el;
      const reg = el.__libGuards || (el.__libGuards = new Set());
      const rk = (typeof field === 'string' ? field : uid('g')) + '|' + flag;
      if (reg.has(rk)) return; // already guarded on this screen
      reg.add(rk);
      // a ctx.field id (any characters), else a CSS selector, else the input element itself
      const hit = (t) => {
        if (typeof field !== 'string') return t === field;
        const box = t.closest && t.closest('[data-field]');
        if (box && box.getAttribute('data-field') === field) return true;
        try { return !!(t.matches && t.matches(field)); } catch (err) { return false; }
      };
      el.addEventListener('focusin', (e) => {
        const t = e.target;
        if (!t || editing() || !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
        if (!hit(t)) return;
        const S = flagState(flag);
        if (S[flag]) return; // open now, or already acknowledged in this visit
        const rec = S[flag] = { status: 'open', el: null };
        rec.el = openNotice(ctx, {
          onClose: () => {
            rec.status = 'done';
            setTimeout(() => { if (t.isConnected) { t.focus({ preventScroll: true }); if (t.select) t.select(); } }, 200);
          }
        }).el;
      });
    }
  };

  /* =====================================================================================
     EFA.lib.caseData: per-client values shared across screens (the original's case data)
     ===================================================================================== */
  const NS = 'case';
  L.caseData = {
    get(key, def) { if (!EFA.clients) return def; const v = EFA.clients.get(NS, key, undefined); return v === undefined || v === null ? def : v; },
    set(key, v) { if (EFA.clients && EFA.clients.get(NS, key, undefined) !== v) EFA.clients.set(NS, key, v); },
    field(ctx, o) {
      o = Object.assign({}, o || {});
      const key = o.key || o.id, id = o.id || o.key;
      const shared = L.caseData.get(key, undefined);
      if (shared !== undefined && (typeof shared !== 'number' || isFinite(shared)) && ctx.mem('f.' + id) !== shared) ctx.remember('f.' + id, shared);
      let last = ctx.mem('f.' + id, o.value);
      ctx.onFields((vals) => {
        const v = vals[id];
        if (v === undefined || v === last) return;
        last = v; L.caseData.set(key, v);
      });
      delete o.key;
      return ctx.field(Object.assign(o, { id }));
    }
  };

  /* =====================================================================================
     EFA.lib.inflation: historic inflation lookup (CPI-U), "Use Result" into a field
     ===================================================================================== */
  const IS = '_lib_inflation';
  copyScreen(IS, 'Shared wording: inflation history', {
    link: 'Inflation History',
    title: 'Historical Inflation Rates',
    caption: 'Annual Inflation',
    'col.year': 'Year',
    'col.rate': 'Inflation Rate %',
    help: 'Click any two years to see the average yearly inflation for that stretch of time.',
    'res.from': 'From the start of',
    'res.to': 'through the end of',
    'res.avg': 'Average annual inflation',
    'res.one': 'Now click a second year.',
    source: 'Source',
    back: 'Return',
    use: 'Use Result',
    'source.text': 'U.S. Bureau of Labor Statistics, Consumer Price Index for All Urban Consumers (CPI-U), U.S. city average, all items, index base 1982-84 = 100. Each year\'s rate is the percent change in the annual average index from the year before, rounded to one decimal place as the Bureau publishes it.',
    pending: 'These inflation figures are being verified. They will appear here as soon as they are confirmed.'
  });

  /** [{year, rate}] with rate in percent (3.2), from EFA.data; null when not loaded */
  function inflationSeries() {
    const D = EFA.data || {}, H = D.history || {};
    const pairs = (raw) => {
      if (!Array.isArray(raw)) return null;
      const out = raw.map((r) => Array.isArray(r) ? { year: +r[0], v: +r[1] } : (r && typeof r === 'object' ? { year: +r.year, v: +(r.rate != null ? r.rate : r.value) } : null))
        .filter((r) => r && isFinite(r.year) && isFinite(r.v));
      return out.length ? out.sort((a, b) => a.year - b.year) : null;
    };
    let rows = pairs(H.cpiUAnnualChange || D.cpiUAnnualChange);
    if (rows) {
      const frac = rows.every((r) => Math.abs(r.v) < 1);
      rows = rows.map((r) => ({ year: r.year, rate: Math.round((frac ? r.v * 100 : r.v) * 1e4) / 1e4 }));
    } else {
      const idx = pairs(H.cpiU || D.cpiU);
      if (idx && idx.length > 1) {
        rows = [];
        for (let i = 1; i < idx.length; i++) {
          if (idx[i].year !== idx[i - 1].year + 1 || !idx[i - 1].v) continue;
          rows.push({ year: idx[i].year, rate: Math.round((idx[i].v / idx[i - 1].v - 1) * 1000) / 10 });
        }
      }
    }
    return rows && rows.length >= 2 ? rows : null;
  }
  function inflationAverage(y1, y2) {
    const s = inflationSeries(); if (!s) return null;
    const a = Math.min(y1, y2), b = Math.max(y1, y2);
    const span = s.filter((r) => r.year >= a && r.year <= b);
    if (!span.length) return null;
    const avg = span.reduce((t, r) => t + r.rate, 0) / span.length;
    return Number(avg.toFixed(2));
  }
  function inflationSource() {
    const S = (EFA.data && EFA.data.sources) || {};
    return S['history.cpiUAnnualChange'] || S['history.cpiU'] || null;
  }
  const pendingHTML = (sid) => `<div class="lib-pending"><span class="lib-pend-mark">${ICON.trend}</span>${cp(sid, 'pending', { tag: 'p' })}</div>`;

  function openInflation(ctx, o) {
    o = o || {};
    const S = visitState('inf:' + (o.instance || o.field || 'default'), () => ({ pair: [] }));
    let source = false;
    const data = inflationSeries();
    const canUse = o.canUseResult !== false;
    if (!data) return panel(ctx, { title: cp(IS, 'title'), cls: 'lib-inf lib-inf-none', html: pendingHTML(IS), onClose: o.onClose });
    const valid = new Set(data.map((r) => r.year));
    S.pair = S.pair.filter((y) => valid.has(y));
    const body = data.map((r) => `<tr data-y="${r.year}"><td class="c">${r.year}</td><td>${r.rate.toFixed(2)}</td></tr>`).join('');
    const ov = panel(ctx, {
      title: cp(IS, 'title'), cls: 'lib-inf', onClose: o.onClose,
      html: `<div class="lib-inf-grid">
          <div><p class="lib-cap">${cp(IS, 'caption')}</p>
            <div class="lib-inf-scroll lib-scroll"><table class="st-table lib-inf-tab"><thead><tr><th class="c">${cp(IS, 'col.year')}</th><th>${cp(IS, 'col.rate')}</th></tr></thead><tbody>${body}</tbody></table></div></div>
          <div class="lib-inf-side"></div>
        </div>
        <div class="lib-row split lib-inf-foot"><div class="lib-inf-src"></div><div class="lib-row lib-inf-act"></div></div>`
    });
    const side = ov.querySelector('.lib-inf-side'), src = ov.querySelector('.lib-inf-src'), act = ov.querySelector('.lib-inf-act');
    const scroller = ov.querySelector('.lib-inf-scroll');
    const span = () => { const p = S.pair.slice().sort((a, b) => a - b); return p; };
    const draw = () => {
      const p = span();
      ov.querySelectorAll('tbody tr').forEach((tr) => {
        const y = +tr.dataset.y;
        tr.classList.toggle('pick', S.pair.indexOf(y) >= 0);
        tr.classList.toggle('span', p.length === 2 && y > p[0] && y < p[1]);
      });
      const avg = p.length === 2 ? inflationAverage(p[0], p[1]) : null;
      if (source) {
        const rec = inflationSource();
        side.innerHTML = `<div class="lib-box lib-src">${cp(IS, 'source.text')}${rec && rec.url ? `<span class="url">${esc(rec.url)}</span>` : ''}</div>`;
        src.innerHTML = '';
        act.innerHTML = `<button type="button" class="st-pill lib-pill lib-ghost" data-act="back">${cp(IS, 'back')}</button>`;
      } else {
        side.innerHTML = `<div class="lib-box">${cp(IS, 'help', { tag: 'p', cls: 'lib-inf-help' })}</div>
          ${p.length ? `<div class="lib-box lib-inf-res">
            <p class="ln">${cp(IS, 'res.from')} <b class="num">${p[0]}</b></p>
            ${p.length === 2 ? `<p class="ln">${cp(IS, 'res.to')} <b class="num">${p[1]}</b></p>
              <div class="lib-inf-avg"><span class="k">${cp(IS, 'res.avg')}</span><span class="v num">${avg == null ? '' : avg.toFixed(2) + '%'}</span></div>` : cp(IS, 'res.one', { tag: 'p', cls: 'ln' })}
          </div>` : ''}`;
        src.innerHTML = `<button type="button" class="lib-link" data-act="source">${cp(IS, 'source')}</button>`;
        act.innerHTML = canUse && p.length === 2 && avg != null ? `<button type="button" class="st-pill lib-pill" data-act="use">${ICON.check}${cp(IS, 'use')}</button>` : '';
      }
      refresh(side); refresh(src); refresh(act);
    };
    ov.querySelector('tbody').addEventListener('click', (e) => {
      if (editing()) return;
      const tr = e.target.closest('tr[data-y]'); if (!tr) return;
      if (S.pair.length >= 2) S.pair = [];
      S.pair.push(+tr.dataset.y);
      source = false; draw();
    });
    ov.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || editing()) return;
      const a = b.dataset.act;
      if (a === 'source') { source = true; draw(); }
      else if (a === 'back') { source = false; draw(); }
      else if (a === 'use') {
        const p = span(); const avg = inflationAverage(p[0], p[1]); if (avg == null) return;
        const frac = Math.round(avg * 100) / 10000;
        applyField(ctx, o.field, frac);
        if (o.onUse) { try { o.onUse(frac); } catch (err) { console.error(err); } }
        ov.close();
      }
    });
    draw();
    // show the last pick, or the most recent years when nothing is picked yet
    const first = S.pair.length ? ov.querySelector(`tr[data-y="${Math.min.apply(null, S.pair)}"]`) : null;
    scroller.scrollTop = first ? Math.max(0, first.offsetTop - 120) : scroller.scrollHeight;
    return ov;
  }

  L.inflation = {
    link(ctx, o) { return opener(ctx, o, { sid: IS, key: 'link', icon: ICON.trend }, () => openInflation(ctx, o)); },
    open(ctx, o) { return openInflation(ctx, o); },
    series() { const s = inflationSeries(); return s ? s.map((r) => ({ year: r.year, rate: r.rate })) : null; },
    average(y1, y2) { return inflationAverage(y1, y2); }
  };
})();
