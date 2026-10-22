/* Module b09: Market History explorer, Medicare premiums, mortgage calculators and tank-model stories,
   Mortgage Master (MM), Mortgage Master Quiz (MMQ) and Compounding vs. Speculation (CVSS).
   Structure, sequence and math follow the functional specs; drawings and wording are new. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt, FIN = EFA.fin, U = EFA.util;

  EFA.css('b09', `
  .b09-full { position: absolute; inset: 0; width: 1600px; height: 900px; overflow: visible; }
  .b09-head { position: absolute; left: 0; right: 0; top: 52px; display: grid; justify-items: center; gap: 14px; text-align: center; padding: 0 120px; }
  .stage .b09-head .st-h1 { font-size: 58px; }
  .stage .b09-head .st-h1.two { font-size: 50px; line-height: 1.16; }
  .b09-f { transition: opacity .8s ease; }
  .b09-f.is-off { transition-duration: .3s; }
  .b09-f0.is-off { transition-duration: 0s; }
  .b09-box { background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 14px; box-shadow: 0 10px 26px rgba(13,30,58,.08); padding: 16px 26px; font: 700 26px/1.32 "DM Sans", sans-serif; color: #0d1e3a; box-sizing: border-box; }
  .b09-card { background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 12px 32px rgba(13,30,58,.08); box-sizing: border-box; }
  .b09-link { color: #8a6e22; border-bottom: 3px solid #b8972e; cursor: pointer; padding-bottom: 1px; }
  .b09-link:hover { color: #0d1e3a; }
  .b09-tlink { font: 700 18px/1.2 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #8a6e22; background: none; border: 0; border-bottom: 2px solid #d5bd68; padding: 2px 0; cursor: pointer; }
  .b09-tlink:hover { color: #0d1e3a; border-color: #b8972e; }
  .b09-ghost { background: transparent !important; color: #0d1e3a !important; border-color: #cbd5e3 !important; }
  .b09-ghost:hover { border-color: #b8972e !important; background: #f0e6c4 !important; }
  .stage .st-input.b09-in { width: 200px; text-align: right; flex: 0 0 auto; }
  .stage .st-input.b09-in[readonly] { background: #e3e8f0; border-color: #e3e8f0; color: #0d1e3a; cursor: default; box-shadow: none; }
  .stage .b09-sel { height: 52px; border: 1.5px solid #cbd5e3; border-radius: 10px; background: #fff; padding: 0 12px; font: 600 20px/1 "DM Sans", sans-serif; color: #0d1e3a; box-sizing: border-box; cursor: pointer; }
  .stage .b09-sel:focus { outline: none; border-color: #b8972e; box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .b09-frow { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 70px; border-bottom: 1px solid rgba(13,30,58,.1); }
  .b09-frow:last-child { border-bottom: 0; }
  .b09-frow > .lb { font: 700 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; display: flex; align-items: center; gap: 12px; min-width: 0; }
  .b09-dot { display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; border: 2px solid #b8972e; padding: 0; flex: 0 0 auto; cursor: pointer; background: #0d1e3a; color: #f7f5f1; box-shadow: 0 3px 8px rgba(13,30,58,.18); transition: transform .2s ease, background .2s ease; }
  .b09-dot:hover { background: #b8972e; color: #0d1e3a; transform: scale(1.08); }
  .b09-dot svg { width: 16px; height: 16px; display: block; }
  .b09-out { border: 3px solid #b8972e; border-radius: 14px; background: #fff; padding: 16px 24px; text-align: center; font: 700 30px/1.25 "DM Sans", sans-serif; color: #0d1e3a; box-sizing: border-box; }
  .b09-out .num { color: #8a6e22; }
  .b09-para { font: 600 23px/1.5 "DM Sans", sans-serif; color: #0d1e3a; margin: 0; text-align: center; }
  .b09-para .num { font-weight: 700; }
  .b09-disc { position: absolute; left: 110px; bottom: 66px; width: 900px; }
  .b09-modal { position: absolute; inset: 0; z-index: 31; background: rgba(13,30,58,.38); display: grid; place-items: center; animation: scr-in .2s ease both; }
  .b09-modal-in { background: #fffdf8; border-radius: 16px; border: 1px solid #d6cfc4; box-shadow: 0 30px 80px rgba(8,20,42,.35); overflow: hidden; max-height: 840px; display: grid; grid-template-rows: auto 1fr auto; }
  .b09-modal-h { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 20px 28px; background: #0d1e3a; color: #f7f5f1; font: 600 30px/1.15 "Cormorant Garamond", Georgia, serif; }
  .b09-modal-b { padding: 24px 28px; display: grid; gap: 14px; overflow: auto; font: 500 21px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }
  .b09-modal-f { display: flex; justify-content: flex-end; gap: 12px; padding: 0 28px 24px; }
  .b09-x { width: 44px; height: 44px; border-radius: 999px; border: 1px solid rgba(247,245,241,.4); background: transparent; color: #f7f5f1; font: 400 28px/1 "DM Sans", sans-serif; cursor: pointer; }
  .b09-x:hover { background: #b8972e; color: #0d1e3a; border-color: #b8972e; }
  .b09-scroll { overflow: auto; border-radius: 14px; border: 1px solid #d6cfc4; background: #fffdf8; box-shadow: 0 12px 32px rgba(13,30,58,.08); }
  .b09-scroll .st-table th { position: sticky; top: 0; z-index: 1; }
  .b09-chk { appearance: none; -webkit-appearance: none; width: 26px; height: 26px; margin: 0; border: 2px solid #2b4c80; border-radius: 6px; background: #fff; cursor: pointer; position: relative; flex: 0 0 auto; }
  .b09-chk:checked { background: #0d1e3a; border-color: #0d1e3a; }
  .b09-chk:checked::after { content: ""; position: absolute; left: 7px; top: 2px; width: 7px; height: 13px; border: solid #d5bd68; border-width: 0 3.5px 3.5px 0; transform: rotate(45deg); }
  .b09-chk:focus-visible { outline: 2px solid #b8972e; outline-offset: 2px; }
  /* quiz (mm1, mmq1) */
  .b09-quiz { position: absolute; left: 170px; right: 170px; top: 184px; display: grid; gap: 18px; }
  .b09-qrow { display: flex; align-items: center; gap: 22px; }
  .b09-tf { width: 112px; height: 84px; border: 0; padding: 0; background: transparent; cursor: pointer; flex: 0 0 auto; transition: transform .2s ease; }
  .b09-tf:hover { transform: scale(1.06); }
  .b09-tf svg { width: 112px; height: 84px; display: block; }
  .b09-qrow .b09-box { flex: 1; min-height: 88px; display: flex; align-items: center; font-size: 29px; padding: 16px 30px; }
  /* word cloud (mm2) */
  .b09-pop { opacity: 0; transform: translateY(10px) scale(.9); transition: opacity 1s ease, transform 1s cubic-bezier(.2,.8,.25,1.15); }
  .b09-pop.on { opacity: 1; transform: none; }
  .b09-tag { display: inline-flex; align-items: center; justify-content: center; padding: 15px 34px; border-radius: 999px; background: #0d1e3a; color: #f7f5f1; font: 700 28px/1.1 "DM Sans", sans-serif; letter-spacing: .02em; box-shadow: 0 10px 22px rgba(13,30,58,.16); white-space: nowrap; }
  .b09-tag.alt { background: #1d3863; }
  .b09-tag.lt { background: #fffdf8; color: #0d1e3a; border: 2px solid #2b4c80; box-shadow: 0 8px 18px rgba(13,30,58,.1); }
  /* pie labels (mm4) */
  .b09-lab { position: absolute; transform: translate(-50%, -50%); text-align: center; font: 700 27px/1.18 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #f7f5f1; white-space: nowrap; }
  .b09-lab.dark { color: #0d1e3a; }
  .b09-lab.link, .b09-w.link { cursor: pointer; }
  .b09-w { transition: filter .25s ease; }
  .b09-w.link:hover { filter: brightness(1.07); }
  /* reasons with pictures (mm6, mmq2) */
  .b09-rrow { position: absolute; display: flex; align-items: center; gap: 20px; }
  .b09-rrow .b09-box { font-size: 31px; padding: 18px 30px; }
  .b09-ico { width: 112px; height: 84px; flex: 0 0 auto; }
  .b09-ico svg { width: 112px; height: 84px; display: block; }
  .b09-pic { position: absolute; }
  .b09-pic svg { width: 100%; height: 100%; display: block; overflow: visible; }
  .b09-med { position: absolute; border-radius: 50%; background: #fffdf8; border: 1px solid #d6cfc4; box-shadow: 0 18px 40px rgba(13,30,58,.10); display: grid; place-items: center; overflow: hidden; }
  .b09-med svg { width: 74%; height: 74%; }
  /* what you know (mm3) */
  .b09-orbit { position: absolute; width: 0; height: 0; transition: transform 1s linear; }
  .b09-mark { position: absolute; width: 88px; height: 88px; left: -44px; top: -44px; transition: transform 1s linear; }
  .b09-mark svg { width: 100%; height: 100%; display: block; }
  .b09-bigbox { position: absolute; left: 360px; top: 150px; width: 880px; height: 660px; transition: transform 1s ease; }
  .b09-bigbox.down { transform: translateY(820px); }
  .b09-bigbox svg, .b09-smallbox svg { width: 100%; height: 100%; display: block; overflow: visible; }
  .b09-smallbox { position: absolute; }
  `);

  /* ------------------------------------------------------------------ */
  /* shared helpers                                                       */
  /* ------------------------------------------------------------------ */

  /** Per-client values shared across screens and modules. Namespace "case"; rates are stored as
   *  fractions (0.06), money as plain dollars, years as integers. Key names follow the specs. */
  const NS = 'case';
  const shared = {
    get(k, d) { const v = EFA.clients.get(NS, k, d); return v == null ? d : v; },
    set(k, v) { EFA.clients.set(NS, k, v); }
  };

  /** Session memory (kept while the library is open, not saved per client). */
  const session = { quiz: [null, null, null, null, null], mm10Return: false };

  /** Safe read of EFA.data by dotted path. */
  function data(path, def) {
    try {
      let o = EFA.data;
      for (const k of path.split('.')) { if (o == null) return def; o = o[k]; }
      return o == null ? def : o;
    } catch (e) { return def; }
  }

  const m0 = (v) => F.money(v);
  const m2 = (v) => F.money(v, { dp: 2 });
  const N = (s) => `<span class="num">${s}</span>`;
  /** percent number (6 = 6%) as text, trailing zeros trimmed */
  const pTxt = (v, dp) => (isFinite(v) ? String(+(+v).toFixed(dp == null ? 2 : dp)) : '–') + '%';
  /** fraction as percent with fixed decimals */
  const fTxt = (f, dp) => F.pct(f, dp == null ? 2 : dp);

  /** keep numerals in DM Sans and keep wording editable after a partial refresh */
  function refresh(el) { if (!el) return; EFA.numify(el); if (EFA.edit && EFA.edit.on) EFA.edit.arm(el); }

  /* ---------- numeric inputs (local state; screens decide what is remembered) ---------- */
  function fmtIn(o, v) {
    if (v == null || !isFinite(v)) return '';
    switch (o.type) {
      case 'money': return F.money(v, { dp: o.dp || 0 });
      case 'pct': return pTxt(v, o.dp == null ? 2 : o.dp);
      case 'int': return F.int(v);
      default: return F.num(v, o.dp || 0);
    }
  }
  function rawIn(o, v) { if (v == null || !isFinite(v)) return ''; return String(+(+v).toFixed(o.dp == null ? 2 : Math.max(o.dp, 0))); }
  function parseIn(o, s, prev) {
    let v = F.parse(s);
    if (!isFinite(v)) return prev;
    if (o.type === 'int') v = Math.round(v);
    else v = +v.toFixed(o.dp == null ? 2 : o.dp);
    if (o.min != null) v = Math.max(o.min, v);
    if (o.max != null) v = Math.min(o.max, v);
    return v;
  }
  /** input HTML. o: {id, type, dp, min, max, readonly, w, cls} */
  function inp(o, v) {
    return `<input class="st-input b09-in ${o.cls || ''}" data-in="${o.id}" inputmode="decimal" autocomplete="off" spellcheck="false" ${o.readonly ? 'readonly tabindex="-1"' : ''} value="${U.esc(fmtIn(o, v))}"${o.w ? ` style="width:${o.w}px"` : ''}>`;
  }
  /** bind inputs: specs [{id,...}], state object, onChange(id, value) after blur/Enter */
  function bindIn(root, specs, state, onChange, onFirstClick) {
    specs.forEach((o) => {
      const el = root.querySelector(`[data-in="${o.id}"]`);
      if (!el || o.readonly) return;
      el.addEventListener('focus', () => { el.value = rawIn(o, state[o.id]); requestAnimationFrame(() => { try { el.select(); } catch (e) { /* ignore */ } }); });
      el.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') el.blur(); });
      el.addEventListener('blur', () => {
        const v = parseIn(o, el.value, state[o.id]);
        const changed = v !== state[o.id];
        state[o.id] = v; el.value = fmtIn(o, v);
        if (onChange) onChange(o.id, v, changed);
      });
      if (onFirstClick && o.disclose) el.addEventListener('mousedown', () => onFirstClick(o.id, el));
    });
  }
  function setIn(root, o, v) { const el = root.querySelector(`[data-in="${o.id}"]`); if (el && el !== document.activeElement) el.value = fmtIn(o, v); }

  /* ---------- small modal inside the stage (not closed by Escape unless asked) ---------- */
  function modal(ctx, o) {
    const m = document.createElement('div');
    m.className = 'b09-modal ' + (o.cls || '');
    const btns = (o.buttons || []).map((b, i) => `<button type="button" class="st-pill ${b.ghost ? 'b09-ghost' : ''}" data-mb="${i}">${b.html || ctx.t(b.key)}</button>`).join('');
    m.innerHTML = `<div class="b09-modal-in" style="width:${o.width || 600}px">
        ${o.title != null ? `<div class="b09-modal-h"><span>${o.title}</span>${o.closeX ? '<button type="button" class="b09-x" data-mx="1" aria-label="Close">&times;</button>' : ''}</div>` : ''}
        <div class="b09-modal-b">${o.body || ''}</div>
        ${btns ? `<div class="b09-modal-f">${btns}</div>` : ''}
      </div>`;
    ctx.el.appendChild(m);
    let onEsc = null;
    const close = () => { if (!m.parentNode) return; m.remove(); if (onEsc) document.removeEventListener('keydown', onEsc, true); if (o.onClose) o.onClose(); };
    if (o.esc) {
      onEsc = (e) => {
        if (!document.body.contains(m)) { document.removeEventListener('keydown', onEsc, true); return; }
        if (e.key === 'Escape' && !(EFA.edit && EFA.edit.on)) { e.stopPropagation(); e.preventDefault(); close(); }
      };
      document.addEventListener('keydown', onEsc, true);
    }
    (o.buttons || []).forEach((b, i) => ctx.on(m.querySelector(`[data-mb="${i}"]`), 'click', () => b.onClick ? b.onClick(close, m) : close()));
    const x = m.querySelector('[data-mx]'); if (x) x.addEventListener('click', close);
    refresh(m);
    m.close = close;
    return m;
  }

  /* ---------- shared-component bridges (guarded until the libraries land) ---------- */
  const lib = {
    ready(name) {
      const map = { worksheet: () => EFA.worksheet, overlays: () => EFA.overlays, bullets: () => EFA.bullets, pem: () => EFA.pem };
      try { return !!(map[name] && map[name]()); } catch (e) { return false; }
    }
  };

  /* ------------------------------------------------------------------ */
  /* drawing kit (flat duotone, navy and gold on paper)                   */
  /* ------------------------------------------------------------------ */
  const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${P.shadow}"/>`;
  let gid = 0; const nid = (p) => `b09${p || 'g'}${++gid}`;

  /** question mark as a stroked path, centered on (cx, cy), height about 2.3 x s */
  function qPath(cx, cy, s, color, w) {
    const x = (v) => (cx + v * s).toFixed(1), y = (v) => (cy + v * s).toFixed(1);
    return `<path d="M${x(-0.62)},${y(-0.55)} C${x(-0.62)},${y(-1.05)} ${x(-0.3)},${y(-1.3)} ${x(0.04)},${y(-1.3)} C${x(0.42)},${y(-1.3)} ${x(0.66)},${y(-1.04)} ${x(0.66)},${y(-0.7)} C${x(0.66)},${y(-0.36)} ${x(0.42)},${y(-0.2)} ${x(0.2)},${y(-0.06)} C${x(0.04)},${y(0.04)} ${x(0.02)},${y(0.18)} ${x(0.02)},${y(0.42)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${x(0.02)}" cy="${y(0.98)}" r="${(w * 0.62).toFixed(1)}" fill="${color}"/>`;
  }

  /** true / false / unanswered icon (96 x 72) */
  function tfIcon(state) {
    const id = nid('tf');
    if (state == null) {
      return `<svg viewBox="0 0 96 72" aria-hidden="true"><circle cx="48" cy="38" r="31" fill="rgba(13,30,58,.10)"/>
        <circle cx="48" cy="36" r="30" fill="${P.paper}" stroke="${P.navy3}" stroke-width="4"/>${qPath(48, 36, 13.5, P.navy, 6)}</svg>`;
    }
    if (state) {
      return `<svg viewBox="0 0 96 72" aria-hidden="true"><defs><radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${P.goldLt}"/><stop offset="1" stop-color="${P.gold}"/></radialGradient></defs>
        <circle cx="48" cy="38" r="31" fill="rgba(13,30,58,.14)"/><circle cx="48" cy="36" r="30" fill="url(#${id})"/>
        <path d="M34.5 37.5 44 47 62 27" fill="none" stroke="${P.navy}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    return `<svg viewBox="0 0 96 72" aria-hidden="true"><defs><radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${P.navy4}"/><stop offset="1" stop-color="${P.navy}"/></radialGradient></defs>
      <circle cx="48" cy="38" r="31" fill="rgba(13,30,58,.14)"/><circle cx="48" cy="36" r="30" fill="url(#${id})"/>
      <path d="M37 25 59 47M59 25 37 47" fill="none" stroke="${P.cream}" stroke-width="7" stroke-linecap="round"/></svg>`;
  }

  /** glossy round bullet with a gold star (96 x 72) */
  function starIcon() {
    const id = nid('st');
    const pts = [];
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 7.6 : 17.5; const [x, y] = A.pt(48, 37, r, i * 36); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    return `<svg viewBox="0 0 96 72" aria-hidden="true"><defs><radialGradient id="${id}" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="${P.navy4}"/><stop offset=".6" stop-color="${P.navy3}"/><stop offset="1" stop-color="${P.navy}"/></radialGradient></defs>
      <circle cx="48" cy="38.5" r="31" fill="rgba(13,30,58,.14)"/><circle cx="48" cy="36" r="30" fill="url(#${id})"/>
      <ellipse cx="41" cy="22" rx="15" ry="7" fill="#fff" opacity=".14"/>
      <polygon points="${pts.join(' ')}" fill="${P.goldLt}" stroke="${P.gold}" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  }

  /** a single bill in a stack */
  function bill(x, y, w, h) {
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.08}" fill="${P.goldPale}" stroke="${P.goldDeep}" stroke-width="3"/>
      <rect x="${x + h * 0.1}" y="${y + h * 0.1}" width="${w - h * 0.2}" height="${h * 0.8}" rx="${h * 0.05}" fill="none" stroke="${P.gold}" stroke-width="2"/>
      <ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${h * 0.26}" ry="${h * 0.3}" fill="${P.goldLt}" stroke="${P.goldDeep}" stroke-width="2"/>
      <circle cx="${x + h * 0.3}" cy="${y + h / 2}" r="${h * 0.09}" fill="${P.gold}"/><circle cx="${x + w - h * 0.3}" cy="${y + h / 2}" r="${h * 0.09}" fill="${P.gold}"/></g>`;
  }
  const art = {
    cashStack() {
      let b = '';
      for (let i = 0; i < 5; i++) b += bill(40 + i * 7, 112 - i * 15, 236, 104);
      return `<svg viewBox="0 0 330 240" aria-hidden="true">${shadow(166, 226, 146, 10)}
        <rect x="40" y="128" width="236" height="92" rx="9" fill="${P.goldLt}" stroke="${P.goldDeep}" stroke-width="3"/>
        <path d="M42 150h232M42 172h232M42 194h232" stroke="${P.goldDeep}" stroke-width="1.5" opacity=".5"/>
        ${b}
        <rect x="148" y="48" width="44" height="172" rx="4" fill="${P.navy}"/><rect x="148" y="118" width="44" height="12" fill="${P.gold}"/></svg>`;
    },
    noSign() {
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="80" fill="rgba(247,245,241,.35)" stroke="${P.navy}" stroke-width="18"/>
        <path d="M45 45 155 155" stroke="${P.navy}" stroke-width="18" stroke-linecap="round"/></svg>`;
    },
    scale() {
      const pan = (cx) => `<path d="M${cx - 62},170 Q${cx},214 ${cx + 62},170 Z" fill="${P.navy3}"/><path d="M${cx - 62},170 H${cx + 62}" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/>`;
      const strings = (cx, bx) => `<path d="M${bx},76 L${cx - 56},170 M${bx},76 L${cx + 56},170" stroke="${P.navy4}" stroke-width="3"/>`;
      const house = `<g transform="translate(46 104)"><rect x="12" y="30" width="48" height="36" fill="${P.paper}" stroke="${P.navy}" stroke-width="3"/><path d="M2 34 36 6l34 28" fill="${P.navy}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/><rect x="30" y="44" width="12" height="22" fill="${P.gold}"/></g>`;
      let cash = '';
      for (let i = 0; i < 4; i++) cash += `<rect x="${246 - i * 2}" y="${150 - i * 11}" width="76" height="20" rx="3" fill="${P.goldPale}" stroke="${P.goldDeep}" stroke-width="2.5"/><ellipse cx="${284 - i * 2}" cy="${160 - i * 11}" rx="6" ry="7" fill="${P.goldLt}"/>`;
      return `<svg viewBox="0 0 370 330" aria-hidden="true">${shadow(185, 314, 120, 9)}
        <path d="M120 312 L250 312 L226 286 L144 286 Z" fill="${P.navy}"/>
        <rect x="178" y="70" width="14" height="220" rx="5" fill="${P.navy4}"/>
        <rect x="58" y="66" width="254" height="13" rx="6" fill="${P.navy}"/>
        ${strings(84, 70)}${strings(284, 300)}${pan(84)}${pan(284)}${house}${cash}
        <circle cx="185" cy="72" r="15" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="3"/><circle cx="185" cy="42" r="10" fill="${P.gold}"/></svg>`;
    },
    wheelchair() {
      const spokes = [0, 30, 60, 90, 120, 150].map((a) => { const [x1, y1] = A.pt(128, 196, 64, a), [x2, y2] = A.pt(128, 196, 64, a + 180); return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)}L${x2.toFixed(1)},${y2.toFixed(1)}"/>`; }).join('');
      return `<svg viewBox="0 0 300 300" aria-hidden="true">${shadow(170, 282, 118, 9)}
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M100 58 L116 150 L222 150" stroke="${P.navy}" stroke-width="13"/>
          <path d="M100 58 L70 54" stroke="${P.navy}" stroke-width="11"/>
          <path d="M126 112 L204 112" stroke="${P.navy3}" stroke-width="9"/>
          <path d="M222 150 L238 226 L272 228" stroke="${P.navy}" stroke-width="11"/>
          <path d="M236 228 L244 254" stroke="${P.navy}" stroke-width="7"/>
          <g stroke="${P.navy4}" stroke-width="3">${spokes}</g>
          <circle cx="128" cy="196" r="72" stroke="${P.navy}" stroke-width="11"/>
          <circle cx="128" cy="196" r="58" stroke="${P.goldLt}" stroke-width="4"/>
        </g>
        <path d="M112 136 H224 V150 H116 Z" fill="${P.gold}"/>
        <path d="M98 66 L110 136 L124 136 L112 64 Z" fill="${P.gold}"/>
        <circle cx="128" cy="196" r="13" fill="${P.gold}" stroke="${P.navy}" stroke-width="4"/>
        <circle cx="246" cy="258" r="18" fill="${P.paper}" stroke="${P.navy}" stroke-width="7"/><circle cx="246" cy="258" r="4.5" fill="${P.navy}"/></svg>`;
    },
    jobSign() {
      return `<svg viewBox="0 0 240 300" aria-hidden="true">${shadow(120, 288, 54, 7)}
        <rect x="113" y="160" width="14" height="128" rx="3" fill="${P.navy4}"/>
        <path d="M120 16 L222 190 H18 Z" fill="${P.navy}" stroke="${P.navy}" stroke-width="16" stroke-linejoin="round"/>
        <path d="M120 40 L202 178 H38 Z" fill="${P.goldLt}" stroke="${P.goldLt}" stroke-width="6" stroke-linejoin="round"/>
        <rect x="90" y="110" width="60" height="44" rx="6" fill="${P.navy}"/>
        <path d="M107 110 v-8 a5 5 0 0 1 5 -5 h16 a5 5 0 0 1 5 5 v8" fill="none" stroke="${P.navy}" stroke-width="6"/>
        <path d="M90 128 H150" stroke="${P.goldLt}" stroke-width="3"/><rect x="115" y="123" width="10" height="10" rx="2" fill="${P.gold}"/></svg>`;
    },
    askSigns() {
      return `<svg viewBox="0 0 360 360" aria-hidden="true">${shadow(184, 344, 150, 10)}
        <rect x="74" y="150" width="12" height="194" rx="3" fill="${P.navy4}"/>
        <rect x="178" y="110" width="12" height="234" rx="3" fill="${P.navy4}"/>
        <rect x="278" y="180" width="12" height="164" rx="3" fill="${P.navy4}"/>
        <g transform="rotate(45 184 96)"><rect x="132" y="44" width="104" height="104" rx="12" fill="${P.goldLt}" stroke="${P.navy}" stroke-width="8"/></g>
        ${qPath(186, 98, 22, P.navy, 11)}
        <circle cx="80" cy="150" r="54" fill="${P.navy}" stroke="${P.navy3}" stroke-width="6"/>
        ${qPath(81, 150, 17, P.cream, 9)}
        <rect x="226" y="166" width="118" height="84" rx="10" fill="${P.paper}" stroke="${P.navy}" stroke-width="7"/>
        ${qPath(285, 208, 14, P.gold, 8)}</svg>`;
    },
    /** open cardboard box with "everything you know" printed on two faces (copy keys) */
    box(ctx) {
      const id = nid('bx');
      return `<svg viewBox="0 0 400 400" aria-hidden="true">
        <defs>
          <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset="1" stop-color="#c9ab52"/></linearGradient>
          <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.gold}"/><stop offset="1" stop-color="${P.goldDeep}"/></linearGradient>
          <linearGradient id="${id}i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.navy}"/><stop offset="1" stop-color="${P.navy3}"/></linearGradient>
        </defs>
        ${shadow(206, 368, 172, 15)}
        <g stroke="${P.goldDeep}" stroke-width="3" stroke-linejoin="round">
          <path d="M160 150 L350 150 L362 78 L172 78 Z" fill="${P.goldPale}"/>
          <path d="M60 200 L160 150 L350 150 L250 200 Z" fill="url(#${id}i)"/>
          <path d="M60 200 L160 150 L120 84 L18 132 Z" fill="${P.goldPale}"/>
          <path d="M250 200 L350 150 L392 104 L294 152 Z" fill="${P.goldLt}"/>
          <path d="M250 200 L350 150 L350 310 L250 360 Z" fill="url(#${id}s)"/>
          <path d="M60 200 L250 200 L250 360 L60 360 Z" fill="url(#${id}f)"/>
          <path d="M60 200 L250 200 L238 250 L46 250 Z" fill="${P.goldPale}"/>
        </g>
        <path d="M150 250 V360" stroke="${P.goldDeep}" stroke-width="2" opacity=".35"/>
        <g font-family="DM Sans, sans-serif" font-weight="700" fill="${P.navy}" text-anchor="middle" letter-spacing="2">
          <text x="155" y="292" font-size="25">${ctx.t('boxA', { tag: 'tspan' })}</text>
          <text x="155" y="326" font-size="25">${ctx.t('boxB', { tag: 'tspan' })}</text>
        </g>
        <g transform="translate(301 262) skewY(-26.57)" font-family="DM Sans, sans-serif" font-weight="700" fill="${P.navy}" text-anchor="middle" opacity=".85">
          <text x="0" y="0" font-size="12.5" letter-spacing=".5">${ctx.t('boxA', { tag: 'tspan' })}</text>
          <text x="0" y="17" font-size="12.5" letter-spacing=".5">${ctx.t('boxB', { tag: 'tspan' })}</text>
        </g></svg>`;
    },
    mark() {
      const id = nid('mk');
      const bar = (rot) => `<rect x="-11" y="-44" width="22" height="88" rx="11" transform="rotate(${rot})" fill="url(#${id})" stroke="${P.goldDeep}" stroke-width="3"/>`;
      return `<svg viewBox="-50 -50 100 100" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset=".55" stop-color="${P.gold}"/><stop offset="1" stop-color="${P.goldDeep}"/></linearGradient></defs>
        <g transform="translate(2 4)" opacity=".18">${bar(45).replace(/url\([^)]*\)/, P.navy)}${bar(-45).replace(/url\([^)]*\)/, P.navy)}</g>
        ${bar(45)}${bar(-45)}<circle cx="-8" cy="-18" r="4" fill="#fff" opacity=".45"/></svg>`;
    }
  };

  /* ------------------------------------------------------------------ */
  /* mm1 / mmq1: mortgage beliefs, true or false                         */
  /* ------------------------------------------------------------------ */
  const QUIZ_COPY = {
    head: 'Mortgage Beliefs: True or False?',
    s1: 'Putting more money down saves you more over the long run than putting less down.',
    s2: 'A 15-year mortgage saves you more money than a 30-year mortgage.',
    s3: 'Paying extra on your principal is a smart way to save money.',
    s4: 'Your interest rate is the biggest factor in what your mortgage really costs.',
    s5a: 'A home that is paid off is more', s5w: 'secure', s5b: 'than a home that is 100% financed.',
    tfAria: 'Mark this statement true or false'
  };
  function quizRender(ctx, withLink) {
    const row = (k) => {
      const text = k < 4 ? ctx.t('s' + (k + 1))
        : `<span>${ctx.t('s5a')} ${withLink ? ctx.t('s5w', { cls: 'b09-link', attrs: 'data-sec="1"' }) : ctx.t('s5w')} ${ctx.t('s5b')}</span>`;
      return `<div class="b09-qrow b09-f is-off" data-row="${k}">
          <button type="button" class="b09-tf" data-tf="${k}" aria-label="${U.esc(ctx.text('tfAria'))}">${tfIcon(session.quiz[k])}</button>
          <div class="b09-box">${text}</div></div>`;
    };
    ctx.el.innerHTML = `<div class="b09-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
      <div class="b09-quiz">${[0, 1, 2, 3, 4].map(row).join('')}</div>`;
    ctx.on(ctx.$$('[data-tf]'), 'click', (e, n) => {
      const k = +n.dataset.tf;
      session.quiz[k] = !session.quiz[k];
      n.innerHTML = tfIcon(session.quiz[k]);
    });
    if (withLink) ctx.on(ctx.$('[data-sec]'), 'click', () => ctx.next());
  }
  function quizStep(ctx, n, dir) {
    ctx.$$('[data-row]').forEach((r) => ctx.show(r, n > +r.dataset.row));
    if (n === 0 && dir === 0 && session.quiz.every((a) => a != null)) ctx.goStep(5);
  }
  EFA.screen('mm1', {
    title: 'Mortgage beliefs: true or false',
    steps: 6,
    copy: Object.assign({}, QUIZ_COPY, {
      _notes: 'Five beliefs most homeowners were taught. There is no score and no wrong answer yet.\n\n- Click forward to reveal each statement, then click its circle: once for true, again for false.\n- Ask: Which of these did someone you trust tell you, and which did you test for yourself?\nPAUSE\n\n- The rest of Mortgage Master puts each belief to the test with real numbers.'
    }),
    render(ctx) { quizRender(ctx, false); },
    step: quizStep
  });
  EFA.screen('mmq1', {
    title: 'Mortgage beliefs quiz',
    steps: 6,
    copy: Object.assign({}, QUIZ_COPY, {
      _notes: 'Five beliefs most homeowners were taught. There is no score; the point is to notice which ones feel true.\n\n- Click forward to reveal each statement, then click its circle: once for true, again for false.\n- Ask: Which of these would you have marked true a year ago?\nPAUSE\n\n- Click the word "secure" in the last statement to talk about what security really means.'
    }),
    render(ctx) { quizRender(ctx, true); },
    step: quizStep
  });

  /* ------------------------------------------------------------------ */
  /* mm2: too many mortgage choices                                      */
  /* ------------------------------------------------------------------ */
  EFA.screen('mm2', {
    title: 'Too many mortgage choices',
    copy: {
      head: 'So many choices. Which one is right for you?',
      l15: '15-Year Mortgages', lneg: 'Negative Amortization', lball: 'Balloons', lpre: 'Pre-Payments',
      lbi: 'Bi-Weekly Payments', lcash: 'Cash',
      l30: '30-Year Mortgages', larm: 'ARMs', lio: 'Interest Only', lrate: 'Rate Options',
      close: 'Your home is likely the largest purchase you will ever make,\nand how you pay for it can quietly transfer wealth away from you.',
      _notes: 'There are dozens of ways to finance a home, and most people choose one because someone told them to.\n\n- Let the options fill the screen. Say nothing until the last line appears.\n- Ask: When you chose your current mortgage, how many of these did anyone walk you through?\nPAUSE'
    },
    render(ctx) {
      const tag = (k, d, cls) => `<div class="b09-pop" data-d="${d}" style="height:106px;display:grid;place-items:center"><span class="b09-tag ${cls || ''}">${ctx.t(k)}</span></div>`;
      ctx.el.innerHTML = `
        <div class="b09-card" style="position:absolute;left:110px;right:110px;top:50px;height:566px;padding:24px 30px">
          <h2 class="st-h2" style="text-align:center;font-style:italic;font-size:46px;margin:0 0 18px">${ctx.t('head')}</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 24px;align-items:start">
            <div>${tag('l15', 1600)}${tag('lneg', 2600, 'alt')}${tag('lball', 1100)}${tag('lpre', 3000, 'alt')}</div>
            <div><div class="b09-pop" data-d="200" style="height:212px;display:grid;place-items:center">${A.ill.house({ w: 270 })}</div>${tag('lbi', 5000, 'lt')}${tag('lcash', 1800, 'lt')}</div>
            <div>${tag('l30', 3600, 'alt')}${tag('larm', 1300)}${tag('lio', 2200, 'alt')}${tag('lrate', 4400)}</div>
          </div>
        </div>
        <p class="b09-pop" data-d="5200" style="position:absolute;left:110px;right:110px;top:660px;margin:0;text-align:center;font:600 38px/1.28 'Cormorant Garamond',Georgia,serif;color:${P.navy}">${ctx.t('close')}</p>`;
      const all = ctx.$$('[data-d]');
      if (EFA.edit && EFA.edit.on) { all.forEach((n) => n.classList.add('on')); return; }
      all.forEach((n) => ctx.timeout(() => n.classList.add('on'), +n.dataset.d));
    }
  });

  /* ------------------------------------------------------------------ */
  /* mm3: everything you know (box and orbiting mark)                    */
  /* ------------------------------------------------------------------ */
  EFA.screen('mm3', {
    title: 'What you already know',
    steps: 3,
    copy: {
      head: 'We tend to accept what we already know as the whole truth.',
      boxA: 'EVERYTHING', boxB: 'YOU KNOW',
      _notes: 'The box is everything you know about mortgages today. Most of us treat it as the whole story.\n\n- First click: the mark travels outside the box. That is where better answers often sit.\n- Second click: the box grows. That is what today is for.\n- Ask: What if the best answer for your home sits outside what you have been told so far?\nPAUSE'
    },
    render(ctx) {
      const cx = 800, cy = 540, R = 215;
      ctx.el.innerHTML = `<div class="b09-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b09-smallbox" style="left:${cx - 180}px;top:${cy - 180}px;width:360px;height:360px">${art.box(ctx)}</div>
        <div class="b09-orbit" style="left:${cx}px;top:${cy}px"><div class="b09-mark" style="transform:translate(0,-${R}px)">${art.mark()}</div></div>
        <div class="b09-bigbox down">${art.box(ctx)}</div>`;
      ctx._mm3 = { R };
    },
    step(ctx, n) {
      const R = ctx._mm3.R, a = n >= 1 ? -120 : 0;
      const orbit = ctx.$('.b09-orbit'), mark = ctx.$('.b09-mark');
      orbit.style.transform = `rotate(${a}deg)`;
      mark.style.transform = `translate(0,-${R}px) rotate(${-a}deg)`;
      ctx.$('.b09-bigbox').classList.toggle('down', n < 2);
    }
  });

  /* ------------------------------------------------------------------ */
  /* mm4: three kinds of money, transferred in focus                     */
  /* ------------------------------------------------------------------ */
  EFA.screen('mm4', {
    title: 'Three kinds of money: transferred',
    copy: {
      acc: 'Accumulated\nMoney', life: 'Lifestyle\nMoney', xfer: 'Transferred\nMoney',
      _notes: 'A mortgage is one of the biggest sources of transferred money in most families: interest that leaves the circle and never comes back.\n\n- Ask: Over the life of your loan, how many of your dollars will leave the family for good?\nPAUSE\n\n- Click Transferred Money to open Major Wealth Transfers when it fits the conversation.'
    },
    render(ctx) {
      const cx = 800, cy = 448, r = 344;
      const sl = [{ k: 'acc', a0: -60, a1: 60 }, { k: 'xfer', a0: 60, a1: 180 }, { k: 'life', a0: 180, a1: 300 }];
      const g = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
      const fill = { acc: 'url(#b09ma)', life: 'url(#b09mc)', xfer: 'url(#b09mg)' };
      let paths = '', labs = '';
      sl.forEach((s) => {
        const mid = (s.a0 + s.a1) / 2, e = s.k === 'xfer' ? 16 : 4;
        const dx = e * Math.sin(mid * Math.PI / 180), dy = -e * Math.cos(mid * Math.PI / 180);
        const on = s.k === 'xfer';
        paths += `<path class="b09-w ${on ? 'link' : ''}" data-k="${s.k}" d="${A.wedge(cx + dx, cy + dy, r, s.a0 + 0.6, s.a1 - 0.6)}" fill="${fill[s.k]}"/>`;
        const [lx, ly] = A.pt(cx + dx, cy + dy, r * 0.55, mid);
        labs += `<div class="b09-lab ${on ? 'dark link' : ''}" data-k="${s.k}" style="left:${lx}px;top:${ly}px">${ctx.t(s.k)}</div>`;
      });
      ctx.el.innerHTML = `<svg class="b09-full" viewBox="0 0 1600 900"><defs>${g('b09mg', P.goldLt, P.gold)}${g('b09ma', P.navy4, P.navy3)}${g('b09mc', P.navy3, P.navy)}</defs>
          <circle cx="${cx}" cy="${cy + 10}" r="${r + 6}" fill="rgba(13,30,58,.08)"/>${paths}</svg>${labs}`;
      ctx.on(ctx.$$('[data-k="xfer"]'), 'click', () => ctx.jump('MWT', 'mwt1'));
    }
  });

  /* ------------------------------------------------------------------ */
  /* mm6: three reasons to consider a mortgage                           */
  /* ------------------------------------------------------------------ */
  EFA.screen('mm6', {
    title: 'Three reasons to consider a mortgage',
    steps: 4,
    copy: {
      head: 'Why carry a mortgage at all?\nPlenty of arguments say not to, yet three deserve a closer look.',
      r1: 'You do not have the cash to buy the home outright.',
      r2: 'The tax deductions.',
      r3: 'A possible spread between what borrowing costs and what your money can earn.',
      disc: 'Mortgage interest is deductible only if you itemize, within current limits, and any spread between borrowing costs and returns is not guaranteed.',
      _notes: 'Paying cash feels safe, and there are still good reasons people choose to borrow. Three come up most often.\n\n- Click forward to reveal each reason.\n- Ask: Which of these three describes your situation today?\nPAUSE'
    },
    render(ctx) {
      const row = (k, top, w) => `<div class="b09-rrow b09-f is-off" data-r="${k}" style="left:130px;top:${top}px"><span class="b09-ico">${starIcon()}</span><div class="b09-box" ${w ? `style="width:${w}px"` : 'style="max-width:660px"'}>${ctx.t('r' + k)}</div></div>`;
      ctx.el.innerHTML = `<div class="b09-head"><h1 class="st-h1 two">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${row(1, 246)}${row(2, 424)}${row(3, 580, 680)}
        <div class="b09-pic b09-f is-off" data-p="1" style="left:1040px;top:206px;width:390px;height:284px">${art.cashStack()}</div>
        <div class="b09-pic b09-f is-off" data-p="1" style="left:1124px;top:196px;width:228px;height:228px">${art.noSign()}</div>
        <div class="b09-pic b09-f is-off" data-p="2" style="left:640px;top:360px;width:250px;height:222px">${A.ill.taxes()}</div>
        <div class="b09-pic b09-f is-off" data-p="3" style="left:1010px;top:478px;width:420px;height:375px">${art.scale()}</div>
        <p class="st-disclaimer b09-disc b09-f is-off" data-p="2" style="bottom:40px">${ctx.t('disc')} ${bridge.disc(['notAdvice'])}</p>`;
    },
    step(ctx, n) {
      ctx.$$('[data-r]').forEach((e) => ctx.show(e, n >= +e.dataset.r));
      ctx.$$('[data-p]').forEach((e) => ctx.show(e, n >= +e.dataset.p));
    }
  });

  /* ------------------------------------------------------------------ */
  /* mmq2: three life events that argue for a mortgage                   */
  /* ------------------------------------------------------------------ */
  EFA.screen('mmq2', {
    title: 'Three life events that argue for a mortgage',
    steps: 4,
    copy: {
      head: 'Plenty of arguments say skip the mortgage.\nThree of life\'s surprises make the case for one.',
      r1: 'A disability that keeps you from working.',
      r2: 'Losing your job.',
      r3: 'An unpredictable world.',
      _notes: 'On paper, a paid-off home looks safest. Life does not always cooperate with paper.\n\n- Click forward to reveal each life event.\n- Ask: If your paycheck stopped tomorrow, where would the next twelve months of house payments come from?\nPAUSE\n\n- Equity is hard to reach when you need it most. Cash you control is not.'
    },
    render(ctx) {
      const row = (k, top) => `<div class="b09-rrow b09-f is-off" data-r="${k}" style="left:452px;top:${top}px"><span class="b09-ico">${starIcon()}</span><div class="b09-box" style="max-width:520px">${ctx.t('r' + k)}</div></div>`;
      ctx.el.innerHTML = `<div class="b09-head"><h1 class="st-h1 two">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${row(1, 268)}${row(2, 418)}${row(3, 552)}
        <div class="b09-med b09-f is-off" data-p="1" style="left:70px;top:430px;width:350px;height:350px">${art.wheelchair()}</div>
        <div class="b09-pic b09-f is-off" data-p="2" style="left:1120px;top:228px;width:236px;height:295px">${art.jobSign()}</div>
        <div class="b09-pic b09-f is-off" data-p="3" style="left:1130px;top:500px;width:330px;height:330px">${art.askSigns()}</div>`;
    },
    step(ctx, n) {
      ctx.$$('[data-r]').forEach((e) => ctx.show(e, n >= +e.dataset.r));
      ctx.$$('[data-p]').forEach((e) => ctx.show(e, n >= +e.dataset.p));
    }
  });

  /* ------------------------------------------------------------------ */
  /* calculator styles                                                    */
  /* ------------------------------------------------------------------ */
  EFA.css('b09c', `
  .b09-dd { position: relative; }
  .b09-dd-b { width: 100%; height: 52px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 1.5px solid #cbd5e3; border-radius: 10px; background: #fff; padding: 0 10px 0 14px; font: 600 20px/1.1 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; text-align: left; box-sizing: border-box; }
  .b09-dd-b:hover { border-color: #b8972e; }
  .b09-dd-v { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
  .b09-dd-m { position: absolute; left: 0; min-width: 100%; top: 58px; z-index: 25; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 12px; box-shadow: 0 18px 40px rgba(13,30,58,.2); padding: 6px; display: grid; gap: 2px; max-height: 430px; overflow: auto; box-sizing: border-box; }
  .b09-dd-o { text-align: left; border: 0; background: transparent; border-radius: 8px; padding: 11px 14px; font: 600 19px/1.2 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; white-space: nowrap; }
  .b09-dd-o:hover { background: #e3e8f0; }
  .b09-dd-o[aria-selected="true"] { background: #0d1e3a; color: #f7f5f1; }
  .b09-chev { flex: 0 0 auto; color: #8a6e22; }
  .stage .b09-range { -webkit-appearance: none; appearance: none; height: 10px; border-radius: 999px; background: linear-gradient(to right, #b8972e var(--p, 0%), #e3e8f0 var(--p, 0%)); outline: none; cursor: pointer; margin: 0; }
  .stage .b09-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 32px; height: 32px; border-radius: 50%; background: #0d1e3a; border: 4px solid #d5bd68; box-shadow: 0 3px 10px rgba(13,30,58,.3); cursor: grab; }
  .stage .b09-range::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%; background: #0d1e3a; border: 4px solid #d5bd68; cursor: grab; }
  .b09-calc { position: absolute; left: 50%; transform: translateX(-50%); min-width: 220px; }
  .b09-panel { position: absolute; padding: 10px 34px; }
  .b09-res { position: absolute; padding: 26px 34px; display: grid; gap: 18px; }
  .b09-note { font: 500 19px/1.4 "DM Sans", sans-serif; color: #667389; text-align: center; margin: 0; padding: 8px 0 6px; }
  /* mort1 */
  .b09-ibar { position: absolute; left: 110px; right: 110px; top: 126px; height: 92px; display: grid; grid-template-columns: repeat(3, 1fr); align-items: center; padding: 0 20px; }
  .b09-ib { display: flex; align-items: center; justify-content: center; gap: 18px; }
  .b09-ib > label, .b09-ib > .lb { font: 700 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b09-ib .st-input.b09-in { width: 180px; }
  .b09-tbl { width: 100%; border-collapse: collapse; }
  .stage table.b09-tbl td.c, .stage table.b09-tbl th.c { text-align: center; }
  .stage .b09-tbl tr.b09-ys td { border-top: 2px solid #d5bd68; }
  .stage .b09-tbl td.yr { color: #8a6e22; font-weight: 700; }
  /* bars inside result panels */
  .b09-mini { display: block; }
  .b09-pp { height: 22px; border-radius: 999px; background: #e3e8f0; overflow: hidden; box-shadow: inset 0 1px 3px rgba(13,30,58,.12); }
  .b09-pp > i { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #d5bd68, #b8972e); transition: width .45s ease; }
  /* mm11 */
  .b09-half { position: absolute; left: 110px; right: 110px; }
  .b09-tab { display: inline-flex; align-items: center; gap: 10px; border-radius: 12px 12px 0 0; padding: 10px 22px; border: 1.5px solid #cbd5e3; border-bottom: 0; background: #fff; color: #0d1e3a; font: 700 19px/1.1 "DM Sans", sans-serif; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; }
  .b09-tab[aria-pressed="true"] { background: #0d1e3a; color: #f7f5f1; border-color: #0d1e3a; }
  .b09-tab .lamp { width: 12px; height: 12px; border-radius: 50%; background: #cbd5e3; }
  .b09-tab[aria-pressed="true"] .lamp { background: #d5bd68; }
  .b09-cols { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; align-items: end; }
  .b09-col { display: grid; gap: 10px; justify-items: center; text-align: center; }
  .b09-col .cap { font: 700 19px/1.2 "DM Sans", sans-serif; color: #0d1e3a; min-height: 48px; display: flex; align-items: flex-end; justify-content: center; padding: 2px 8px; border-radius: 8px; }
  .b09-col .cap.click { cursor: pointer; color: #8a6e22; border-bottom: 2px dotted #b8972e; border-radius: 0; }
  .b09-col .cap.hl, .b09-sent.hl { background: #f0e6c4; }
  .stage .b09-col .st-input.b09-in { width: 210px; }
  .b09-red { font: 700 30px/1 "DM Sans", sans-serif; color: #8a6e22; height: 52px; display: flex; align-items: center; justify-content: center; min-width: 200px; border-radius: 10px; background: #fff; border: 2px solid #b8972e; padding: 0 12px; box-sizing: border-box; }
  .b09-sent { font: 600 22px/1.4 "DM Sans", sans-serif; color: #0d1e3a; margin: 0; padding: 6px 12px; border-radius: 8px; transition: background .3s ease; }
  .b09-sent .num { font-weight: 700; }
  /* mm13 */
  .b09-dg { position: absolute; left: 150px; width: 1300px; top: 268px; height: 500px; }
  .b09-dbox { position: absolute; display: grid; align-content: center; justify-items: center; gap: 8px; text-align: center; padding: 12px; box-sizing: border-box; }
  .b09-dbox .cap { font: 700 19px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b09-dbox .val { font: 700 30px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b09-dbox .st-input.b09-in { width: 172px; height: 50px; }
  .b09-rbox { position: absolute; padding: 20px 24px; display: grid; gap: 10px; align-content: center; box-sizing: border-box; }
  .b09-rbox p { margin: 0; font: 600 19px/1.42 "DM Sans", sans-serif; color: #0d1e3a; }
  .b09-rbox .big { font: 700 34px/1.1 "DM Sans", sans-serif; color: #0d1e3a; text-align: center; }
  .b09-rbox .big .num:first-child { color: #8a6e22; }
  /* mimt1 */
  .b09-mi { position: absolute; transition: left .7s cubic-bezier(.45,.05,.2,1), width .7s cubic-bezier(.45,.05,.2,1); }
  .b09-mi .b09-frow { min-height: 60px; }
  .b09-mi .b09-frow > .lb { font-size: 21px; }
  .b09-mi .b09-frow .op { display: inline-block; width: 22px; color: #8a6e22; font-weight: 700; text-align: center; }
  .b09-tip { position: relative; }
  .b09-tip .tipx { display: none; position: absolute; left: 0; top: calc(100% + 8px); z-index: 20; width: 420px; background: #0d1e3a; color: #f7f5f1; font: 500 17px/1.45 "DM Sans", sans-serif; padding: 12px 16px; border-radius: 10px; box-shadow: 0 12px 28px rgba(13,30,58,.25); white-space: normal; }
  .b09-tip:hover .tipx { display: block; }
  .b09-mres { position: absolute; display: grid; gap: 16px; transition: opacity .8s ease .25s; }
  .stage .b09-tiers .st-table { font-size: 17px; }
  .stage .b09-tiers .st-table th { font-size: 12px; padding: 9px 8px; }
  .stage .b09-tiers .st-table td { padding: 8px 8px; }
  .b09-tiers th.pd { cursor: pointer; text-decoration: underline dotted #d5bd68; text-underline-offset: 4px; }
  .b09-ext { font: 700 18px/1.2 "DM Sans", sans-serif; color: #8a6e22; text-decoration: none; border-bottom: 2px solid #d5bd68; justify-self: center; }
  .b09-ext:hover { color: #0d1e3a; }
  .b09-verify { font: 600 22px/1.4 "DM Sans", sans-serif; color: #667389; text-align: center; padding: 24px; }
  `);

  /* ------------------------------------------------------------------ */
  /* bridges to the shared components (docs/components.md)                */
  /* ------------------------------------------------------------------ */
  const LIB = () => EFA.lib || {};
  const bridge = {
    /** worksheet object as documented: {heading (HTML), size, columns:[{field, header (HTML), type, dp, width}], rows, filter, disclosures} */
    worksheet(ctx, ws) { const W = LIB().worksheet; if (W && W.open) { W.open(ctx, ws); return true; } return false; },
    /** the component's own "Documentation" opener; data is the worksheet object or a function returning it (null = open nothing) */
    docButton(ctx, o) { const W = LIB().worksheet; return W && W.button ? W.button(ctx, o) : ''; },
    /** return-rate notice on the first focus of a rate field in a screen visit */
    guard(ctx, field) { const D = LIB().disclosure; if (D && D.guard) D.guard(ctx, field); },
    /** historic inflation: the round opener, or open now; onUse receives the average as a fraction */
    inflationDot(ctx, onUse) { const I = LIB().inflation; return I && I.link ? I.link(ctx, { look: 'dot', onUse }) : ''; },
    inflationOpen(ctx, onUse) { const I = LIB().inflation; if (I && I.open) { I.open(ctx, { onUse }); return true; } return false; },
    /** shared compliance wording by topic (editable once, everywhere) */
    disc(topics) { const D = LIB().disclosure; return D && D.html ? D.html(topics) : ''; },
    /** dart-shaped bullet glyph */
    dart(size) { const B = LIB().bullets; return B && B.dart ? B.dart({ size }) : ''; }
  };
  /** a disclaimer paragraph: this screen's own sentence(s) followed by shared topic wording */
  function discLine(ctx, keys, topics, style) {
    const own = (keys || []).map((k) => ctx.t(k)).join(' ');
    return `<p class="st-disclaimer" style="margin:0;${style || ''}">${own}${own && topics && topics.length ? ' ' : ''}${topics && topics.length ? bridge.disc(topics) : ''}</p>`;
  }
  /** worksheet column helper: [field, headerKey, type, dp] -> column object with the header from copy */
  const wsCols = (ctx, list) => list.map(([field, key, type, dp, width]) => Object.assign({ field, header: ctx.t(key), type: type || 'money' }, dp != null ? { dp } : {}, width ? { width } : {}));

  /* ---------- dropdown whose option labels are editable copy ---------- */
  const CHEV = '<svg class="b09-chev" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function ddHTML(o) {
    return `<div class="b09-dd" data-dd="${o.id}" style="width:${o.w || 280}px">
      <button type="button" class="b09-dd-b"><span class="b09-dd-v">${o.items[o.value] || ''}</span>${CHEV}</button>
      <div class="b09-dd-m" hidden>${o.items.map((h, i) => `<button type="button" class="b09-dd-o" data-v="${i}" aria-selected="${i === o.value}">${h}</button>`).join('')}</div></div>`;
  }
  function ddBind(root, id, onPick) {
    const box = root.querySelector(`[data-dd="${id}"]`); if (!box) return;
    const btn = box.querySelector('.b09-dd-b'), menu = box.querySelector('.b09-dd-m');
    const outside = (e) => { if (!box.contains(e.target)) close(); };
    const close = () => { menu.hidden = true; document.removeEventListener('mousedown', outside, true); };
    btn.addEventListener('click', (e) => {
      if (EFA.edit && EFA.edit.on && e.target.closest('[data-cp]')) return;
      if (menu.hidden) { menu.hidden = false; document.addEventListener('mousedown', outside, true); } else close();
    });
    menu.querySelectorAll('.b09-dd-o').forEach((o) => o.addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      close();
      box.querySelector('.b09-dd-v').innerHTML = o.innerHTML;
      menu.querySelectorAll('.b09-dd-o').forEach((x) => x.setAttribute('aria-selected', String(x === o)));
      onPick(+o.dataset.v);
    }));
  }

  /* ------------------------------------------------------------------ */
  /* finance engines used by the mortgage screens                         */
  /* ------------------------------------------------------------------ */
  /** level monthly payment, end of month (positive); amount/n when the rate is 0 */
  const pmt = (i, n, pv) => (n <= 0 ? 0 : (i === 0 ? pv / n : pv * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1)));
  /** future value of a level end-of-period deposit */
  const fvDep = (i, n, d) => (i === 0 ? d * n : d * (Math.pow(1 + i, n) - 1) / i);
  /** mort1 schedule exactly as specified (no rounding inside the loop) */
  function mortSchedule(loan, ratePct, years) {
    const i = ratePct / 100 / 12, n = Math.max(0, Math.round(12 * years));
    if (n <= 0) return { payment: 0, rows: [] };
    const pay = pmt(i, n, loan);
    let bal = loan, year = 1; const rows = [];
    for (let m = 0; m < n; m++) {
      if (m > 0 && m % 12 === 0) year += 1;
      const interest = bal * i, start = bal;
      bal = bal + interest - pay;
      rows.push({ month: m + 1, start, payment: pay, interest: Math.max(interest, 0), principal: Math.max(pay - interest, 0), end: Math.max(bal, 0), year });
    }
    return { payment: pay, rows };
  }
  /** mm11 engine: investment vs mortgage cost three ways, plus the four worksheets */
  function financeVsInvest(o) {
    const i = o.rInv / 12, m = 12 * o.N;
    const rN = o.rLoan * (1 - o.tax), rUse = o.isNCB ? rN : o.rLoan;
    const pay = pmt(rUse / 12, m, o.L);
    const growth = (x) => (i === 0 ? x * m : x * (Math.pow(1 + i, m) - 1) / i);
    const F = o.isLump ? o.L * Math.pow(1 + i, m) : growth(pay);
    let bal = o.L, cum = 0, T = 0; const years = [];
    for (let y = 1; y <= o.N; y++) {
      let yi = 0, yl = 0;
      for (let k = 0; k < 12; k++) {
        let interest = 0;
        if (bal > 0) { interest = bal * rUse / 12; yi += interest; cum += interest; bal = bal + interest - pay; } else { bal = 0; }
        yl += T * i; T = T * (1 + i) + interest;
      }
      years.push({ year: y, yearInt: yi, cumInt: cum, yearLost: yl, T });
    }
    const cost = [pay * 12 * o.N, growth(pay), T];
    const q = o.isToggleRate ? o.rInv : rUse;
    const Q = q === 0 ? pay * m : pay * (Math.pow(1 + q / 12, m) - 1) / (q / 12);
    return { i, m, rN, rUse, pay, F, cost, years, q, Q };
  }
  /** mm13 engine */
  function sideFund(L, rPct, Spct) {
    const j = rPct / 100 / 12, s = Spct / 100 / 12;
    const P15 = pmt(j, 180, L), P30 = pmt(j, 360, L), D = P15 - P30;
    return { j, s, P15, P30, D, V15: fvDep(s, 180, P15), V30: fvDep(s, 360, D) };
  }
  /** month-by-month deposit growth rows (mm11 / mm13 worksheets) */
  function depositRows(i, n, deposit, start) {
    const rows = []; let bal = start || 0;
    for (let k = 1; k <= n; k++) { const interest = bal * i, end = bal + interest + deposit; rows.push({ month: k, start: bal, interest, deposit, end }); bal = end; }
    return rows;
  }
  EFA.engines = EFA.engines || {};
  EFA.engines.mortgageMath = { pmt, fvDep, mortSchedule, financeVsInvest, sideFund, depositRows };

  /* ------------------------------------------------------------------ */
  /* mort1: monthly amortization schedule                                */
  /* ------------------------------------------------------------------ */
  EFA.screen('mort1', {
    title: 'Mortgage amortization schedule',
    copy: {
      head: 'Where Each Payment Goes',
      lLoan: 'Loan Amount', lRate: 'Rate', lTerm: 'Term (Years)',
      cMonth: 'Month', cStart: 'Starting Balance', cPay: 'Monthly Payment', cInt: 'Monthly Interest', cPrin: 'Monthly Principal', cEnd: 'Ending Balance', cYear: 'Year',
      wsTitle: 'Mortgage Amortization Schedule',
      disc: 'Fixed-rate loan with payments at the end of each month. Taxes, insurance and mortgage insurance are not included.',
      _notes: 'Early in a mortgage, most of every payment is interest. The principal barely moves for years.\n\n- Scroll the first few years with the client, then jump ahead to the middle of the loan.\n- Ask: How many years go by before half of your payment builds your own equity?\nPAUSE'
    },
    render(ctx) {
      const st = { loan: 250000, rate: 6, term: 30 };
      const specs = [{ id: 'loan', type: 'money', min: 0 }, { id: 'rate', type: 'pct', dp: 2, min: 0 }, { id: 'term', type: 'int', min: 0, dp: 0 }];
      const cell = (k, o) => `<div class="b09-ib"><span class="lb">${ctx.t(k)}</span>${inp(o, st[o.id])}</div>`;
      const cols = ['cMonth', 'cStart', 'cPay', 'cInt', 'cPrin', 'cEnd', 'cYear'];
      let sched = null;
      const sheet = () => ({
        heading: ctx.t('wsTitle'), size: 'full',
        columns: wsCols(ctx, [['month', 'cMonth', 'int', null, 96], ['start', 'cStart'], ['payment', 'cPay'], ['interest', 'cInt'], ['principal', 'cPrin'], ['end', 'cEnd'], ['year', 'cYear', 'year', null, 96]]),
        rows: sched.rows.map((r) => ({ month: r.month, start: r.start, payment: r.payment, interest: r.interest, principal: r.principal, end: r.end, year: r.year }))
      });
      ctx.el.innerHTML = `
        <div class="b09-head" style="top:34px"><h1 class="st-h1" style="font-size:52px">${ctx.t('head')}</h1></div>
        <div class="b09-card b09-ibar">${cell('lLoan', specs[0])}${cell('lRate', specs[1])}${cell('lTerm', specs[2])}</div>
        <div class="b09-scroll" style="position:absolute;left:110px;right:110px;top:238px;height:528px">
          <table class="st-table b09-tbl"><thead><tr>${cols.map((k, j) => `<th class="${j === 0 || j === 6 ? 'c' : ''}" style="${j === 0 || j === 6 ? 'width:110px' : ''}">${ctx.t(k)}</th>`).join('')}</tr></thead><tbody></tbody></table>
        </div>
        <div style="position:absolute;left:110px;right:110px;top:778px;display:flex;justify-content:center">${bridge.docButton(ctx, { data: () => sheet() })}</div>
        ${discLine(ctx, ['disc'], ['hypothetical'], 'position:absolute;left:110px;right:330px;top:832px')}`;
      const draw = () => {
        sched = mortSchedule(st.loan, st.rate, st.term);
        ctx.$('tbody').innerHTML = sched.rows.map((r) => `<tr class="${r.month > 1 && r.month % 12 === 1 ? 'b09-ys' : ''}"><td class="c">${r.month}</td><td>${m0(r.start)}</td><td>${m0(r.payment)}</td><td>${m0(r.interest)}</td><td>${m0(r.principal)}</td><td>${m0(r.end)}</td><td class="c yr">${r.year}</td></tr>`).join('');
      };
      draw();
      bindIn(ctx.el, specs, st, () => draw());
    }
  });

  /* ------------------------------------------------------------------ */
  /* mm7: inflation shrinks a future payment                              */
  /* ------------------------------------------------------------------ */
  const SWAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="M17 20l4-4-4-4"/><path d="M21 16H7"/></svg>';
  EFA.screen('mm7', {
    title: 'Inflation and a fixed payment',
    copy: {
      head: 'Before you race to pay off your mortgage,\nweigh what inflation does. Here is an example.',
      lPay: 'Monthly House Payment', lEq: 'Current Equity Position', lInf: 'Inflation Rate',
      dotMode: 'Switch between a monthly payment and an equity position',
      calc: 'Calculate',
      r1Pay: 'Measured in today\'s purchasing power, that same monthly payment would feel like',
      r1EqA: 'Measured in today\'s purchasing power, your equity of', r1EqB: 'today would be worth',
      yr1: 'year from now', yrN: 'years from now',
      autoOn: 'AutoStep - On', autoOff: 'AutoStep - Off',
      disc: 'Assumes the same inflation rate every year; actual inflation varies from year to year.',
      _notes: 'A fixed mortgage payment gets lighter every year that prices rise. Paying it off early means paying with today\'s full-value dollars.\n\n- Press AutoStep and let the years roll by.\n- Ask: If your payment will feel smaller every year, why rush to pay it with your most valuable dollars?\nPAUSE\n\n- The round icon beside the first label switches to an equity view; the one beside Inflation Rate opens historical inflation.'
    },
    render(ctx) {
      const st = { amount: shared.get('house_pmt_or_equity', 750), inf: +(shared.get('case_file_ror_inflation', 0.03) * 100).toFixed(4), years: 0, mode: 'pay', shown: false, auto: false };
      const specs = [{ id: 'amount', type: 'money', dp: 0, min: 0 }, { id: 'inf', type: 'pct', dp: 2 }];
      ctx.el.innerHTML = `
        <div class="b09-head"><h1 class="st-h1 two">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b09-card b09-panel" style="left:400px;width:800px;top:236px">
          <div class="b09-frow"><span class="lb"><span data-lab="1"></span><button type="button" class="b09-dot" data-dot="mode" aria-label="${U.esc(ctx.text('dotMode'))}">${SWAP}</button></span>${inp(specs[0], st.amount)}</div>
          <div class="b09-frow"><span class="lb">${ctx.t('lInf')}${bridge.inflationDot(ctx, (f) => { st.inf = +(f * 100).toFixed(2); shared.set('case_file_ror_inflation', f); setIn(ctx.el, specs[1], st.inf); calc(); })}</span>${inp(specs[1], st.inf)}</div>
        </div>
        <button type="button" class="st-pill b09-calc" data-calc="1" style="top:424px">${ctx.t('calc')}</button>
        <div class="b09-card b09-res b09-f is-off" data-res="1" style="left:240px;width:1120px;top:422px;justify-items:center;text-align:center">
          <p class="b09-para" data-r1="1" style="font-size:25px"></p>
          <div style="font:700 50px/1.1 'DM Sans',sans-serif;color:${P.navy}" data-r2="1"></div>
          <div class="b09-pp" style="width:820px"><i data-pp="1" style="width:100%"></i></div>
          <div style="display:flex;align-items:center;gap:28px;margin-top:6px">
            <input type="range" class="b09-range" data-yrs="1" min="1" max="100" step="1" value="1" style="width:560px">
            <button type="button" class="st-pill" data-auto="1" style="min-width:210px"></button>
          </div>
        </div>
        ${discLine(ctx, ['disc'], ['hypothetical'], 'position:absolute;left:110px;right:330px;top:832px')}`;
      const lab = () => { ctx.$('[data-lab]').innerHTML = ctx.t(st.mode === 'pay' ? 'lPay' : 'lEq'); refresh(ctx.$('[data-lab]')); };
      function calc() {
        const v = st.amount / Math.pow(1 + st.inf / 100, st.years);
        ctx.$('[data-r1]').innerHTML = st.mode === 'pay' ? ctx.t('r1Pay') : `${ctx.t('r1EqA')} ${N(m0(st.amount))} ${ctx.t('r1EqB')}`;
        ctx.$('[data-r2]').innerHTML = `${N(st.years)} ${ctx.t(st.years === 1 ? 'yr1' : 'yrN')} <span class="num" style="color:${P.goldDeep};margin-left:10px">${m2(v)}</span>`;
        ctx.$('[data-pp]').style.width = (st.amount > 0 ? Math.max(0, Math.min(100, v / st.amount * 100)) : 0) + '%';
        const r = ctx.$('[data-yrs]'); r.value = Math.max(1, st.years); r.style.setProperty('--p', ((Math.max(1, st.years) - 1) / 99 * 100) + '%');
        ctx.$('[data-auto]').innerHTML = ctx.t(st.auto ? 'autoOff' : 'autoOn');
        refresh(ctx.$('[data-res]'));
      }
      const tick = () => {
        if (!st.auto) return;
        if (st.years >= 100) { st.auto = false; calc(); return; }
        st.years += 1; calc();
        ctx.timeout(tick, 500);
      };
      lab(); calc();
      bindIn(ctx.el, specs, st, (id, v) => {
        if (id === 'amount') shared.set('house_pmt_or_equity', v);
        if (id === 'inf') shared.set('case_file_ror_inflation', v / 100);
        calc();
      });
      ctx.on(ctx.$('[data-dot="mode"]'), 'click', () => { st.mode = st.mode === 'pay' ? 'eq' : 'pay'; lab(); calc(); });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { st.shown = true; ctx.show('[data-res]', true); ctx.$('[data-calc]').hidden = true; calc(); });
      ctx.$('[data-yrs]').addEventListener('input', (e) => { st.years = +e.target.value; calc(); });
      ctx.$('[data-yrs]').addEventListener('keydown', (e) => e.stopPropagation());
      ctx.on(ctx.$('[data-auto]'), 'click', () => { st.auto = !st.auto; calc(); if (st.auto) ctx.timeout(tick, 500); });
    }
  });

  /* ------------------------------------------------------------------ */
  /* mm9: opportunity cost of the down payment                           */
  /* ------------------------------------------------------------------ */
  /** two-bar picture: base amount, and base plus growth (numbers only) */
  function twoBars(a, b, w, h) {
    const max = Math.max(a, b, 1), bw = 120, gap = 70, x0 = (w - 2 * bw - gap) / 2, base = h - 18, top = 52;
    const hh = (v) => Math.max(2, (base - top) * Math.max(0, v) / max);
    const lab = (x, y, v, c) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="22" fill="${c}">${m0(v)}</text>`;
    const ha = hh(a), hb = hh(b), hab = hh(Math.min(a, b));
    return `<svg class="b09-mini" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
      <line x1="10" x2="${w - 10}" y1="${base}" y2="${base}" stroke="${P.rule}" stroke-width="2"/>
      <rect x="${x0}" y="${base - ha}" width="${bw}" height="${ha}" rx="8" fill="${P.navy}"/>
      <rect x="${x0 + bw + gap}" y="${base - hb}" width="${bw}" height="${hb}" rx="8" fill="${P.gold}"/>
      <rect x="${x0 + bw + gap}" y="${base - hab}" width="${bw}" height="${hab}" rx="8" fill="${P.navy}"/>
      ${lab(x0 + bw / 2, base - ha - 14, a, P.navy)}${lab(x0 + bw * 1.5 + gap, base - hb - 14, b, P.goldDeep)}</svg>`;
  }
  EFA.screen('mm9', {
    title: 'Opportunity cost of the down payment',
    copy: {
      head: 'What has your down payment cost you?\nMeasure the growth it gave up.',
      lDown: 'Down Payment Paid', lRor: 'Investment Rate of Return', lYrs: 'Years Since Purchase',
      calc: 'Calculate',
      outA: 'Opportunity cost so far:',
      pA: 'Had you invested your', pB: 'instead, at', pC: 'for', pD: 'years, it could have grown by', pE: 'on top of the', pF: 'itself. That growth is the price of putting the money into the house.',
      disc: 'Assumes one fixed rate of return, compounded monthly; the costs of investing are left out.',
      _notes: 'A down payment feels like progress, yet the money stops earning the day it goes into the house.\n\n- Enter the client\'s real down payment and years in the home.\n- Ask: Is that money earning anything for you today, and could you reach it if you needed it?\nPAUSE'
    },
    render(ctx) {
      const st = { down: shared.get('house_down_payment', 20000), ror: +(shared.get('case_file_ror_accumulation', 0.06) * 100).toFixed(4), yrs: shared.get('house_years_since_purchase', 5), shown: false };
      const specs = [{ id: 'down', type: 'money', min: 0 }, { id: 'ror', type: 'pct', dp: 2, max: 12 }, { id: 'yrs', type: 'int', dp: 0, min: 0 }];
      const row = (k, o) => `<div class="b09-frow"><span class="lb">${ctx.t(k)}</span>${inp(o, st[o.id])}</div>`;
      ctx.el.innerHTML = `
        <div class="b09-head"><h1 class="st-h1 two">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b09-card b09-panel" style="left:400px;width:800px;top:226px">${row('lDown', specs[0])}${row('lRor', specs[1])}${row('lYrs', specs[2])}</div>
        <button type="button" class="st-pill b09-calc" data-calc="1" style="top:476px">${ctx.t('calc')}</button>
        <div class="b09-card b09-res b09-f is-off" data-res="1" style="left:200px;width:1200px;top:470px;grid-template-columns:1fr 330px;align-items:center;gap:10px 34px;padding:22px 34px">
          <div style="display:grid;gap:16px"><div class="b09-out" data-out="1"></div><p class="b09-para" data-par="1" style="text-align:left;font-size:22px"></p></div>
          <div data-bars="1"></div>
        </div>
        ${discLine(ctx, ['disc'], ['hypothetical'], 'position:absolute;left:110px;right:330px;top:832px')}`;
      const calc = () => {
        const i = st.ror / 100 / 12, n = 12 * st.yrs;
        const X = st.down * (Math.pow(1 + i, n) - 1);
        ctx.$('[data-out]').innerHTML = `${ctx.t('outA')} ${N(m0(X))}`;
        ctx.$('[data-par]').innerHTML = `${ctx.t('pA')} ${N(m0(st.down))} ${ctx.t('pB')} ${N(pTxt(st.ror))} ${ctx.t('pC')} ${N(F.int(st.yrs))} ${ctx.t('pD')} ${N(m0(X))} ${ctx.t('pE')} ${N(m0(st.down))} ${ctx.t('pF')}`;
        ctx.$('[data-bars]').innerHTML = twoBars(st.down, st.down + X, 330, 250);
        refresh(ctx.$('[data-res]'));
      };
      calc();
      bindIn(ctx.el, specs, st, (id, v) => {
        if (id === 'down') shared.set('house_down_payment', v);
        if (id === 'ror') shared.set('case_file_ror_accumulation', v / 100);
        if (id === 'yrs') shared.set('house_years_since_purchase', v);
        calc();
      });
      bridge.guard(ctx, '[data-in="ror"]');
      ctx.on(ctx.$('[data-calc]'), 'click', () => { st.shown = true; ctx.show('[data-res]', true); ctx.$('[data-calc]').hidden = true; calc(); });
    }
  });

  /* ------------------------------------------------------------------ */
  /* mm10: the home as a store of money                                  */
  /* ------------------------------------------------------------------ */
  /** home-value picture: cost basis (purchase + improvements) vs market value */
  function basisBars(P0, I, V, w, h) {
    const max = Math.max(P0 + I, V, 1), bw = 120, gap = 70, x0 = (w - 2 * bw - gap) / 2, base = h - 18, top = 52;
    const hh = (v) => Math.max(2, (base - top) * Math.max(0, v) / max);
    const lab = (x, y, v, c) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="22" fill="${c}">${m0(v)}</text>`;
    const hp = hh(P0), hi = hh(P0 + I) - hh(P0), hv = hh(V);
    return `<svg class="b09-mini" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
      <line x1="10" x2="${w - 10}" y1="${base}" y2="${base}" stroke="${P.rule}" stroke-width="2"/>
      <rect x="${x0}" y="${base - hp}" width="${bw}" height="${hp}" rx="8" fill="${P.navy}"/>
      ${I > 0 ? `<rect x="${x0}" y="${base - hp - hi}" width="${bw}" height="${hi}" rx="6" fill="${P.navy4}"/>` : ''}
      <rect x="${x0 + bw + gap}" y="${base - hv}" width="${bw}" height="${hv}" rx="8" fill="${P.gold}"/>
      ${lab(x0 + bw / 2, base - hp - hi - 14, P0 + I, P.navy)}${lab(x0 + bw * 1.5 + gap, base - hv - 14, V, P.goldDeep)}</svg>`;
  }
  /** Excel-style RATE with no payments has the closed form (fv / pv)^(1/n) - 1 */
  const rateLump = (n, pv, fv) => (n > 0 && pv > 0 && fv >= 0 ? Math.pow(fv / pv, 1 / n) - 1 : 0);
  EFA.screen('mm10', {
    title: 'The home as a store of money',
    copy: {
      head: 'Is your home a smart place\nto keep your savings?',
      lMkt: 'Current Market Value', lPur: 'Original Purchase Price', lImp: 'Improvements/Expenses', lYrs: 'Years Since House Purchase',
      dotImp: 'List the improvements and expenses',
      calc: 'Calculate', avse: 'Appreciation vs. Equity',
      outA: 'Equivalent Compound Interest Return:',
      pA: 'Your gain of', pB: 'over', pC: 'years works out to an annual compound return of', pD: 'over that time.',
      pQ: 'How does that compare with inflation, and with what your other savings earned over the same years?',
      dlgTitle: 'Capital Improvements', cDesc: 'Description', cAmt: 'Amount', add: 'Add', save: 'Save & Return',
      defItem: 'Improvements/Expenses', delAria: 'Remove this item',
      disc: 'A home is not a liquid investment, and this comparison is for education only.',
      _notes: 'Most people call their home their best investment. Here we measure it like one.\n\n- Enter the purchase price, what has gone into the home since, and today\'s value.\n- Ask: How does that return compare with inflation over the same years?\nPAUSE\n\n- Appreciation vs. Equity shows why the home grows the same with or without equity in it.'
    },
    render(ctx) {
      const list = () => { const l = shared.get('house_improvements_list', null); return Array.isArray(l) ? l : [{ desc: ctx.text('defItem'), amount: 25000 }]; };
      const total = (l) => l.reduce((s, x) => s + (+x.amount || 0), 0);
      const st = { mkt: shared.get('house_current_market_value', 150000), pur: shared.get('house_purchase_price', 100000), imp: total(list()), yrs: shared.get('house_years_since_purchase', 5) };
      const restore = session.mm10Return; session.mm10Return = false;
      st.shown = restore;
      const specs = [{ id: 'mkt', type: 'money', min: 0 }, { id: 'pur', type: 'money', min: 0 }, { id: 'imp', type: 'money' }, { id: 'yrs', type: 'int', dp: 0, min: 0 }];
      const row = (k, o, extra) => `<div class="b09-frow"><span class="lb">${ctx.t(k)}${extra || ''}</span>${inp(o, st[o.id])}</div>`;
      ctx.el.innerHTML = `
        <div class="b09-head"><h1 class="st-h1 two">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b09-card b09-panel" style="left:400px;width:800px;top:222px">${row('lMkt', specs[0])}${row('lPur', specs[1])}${row('lImp', specs[2], `<button type="button" class="b09-dot" data-dot="imp" aria-label="${U.esc(ctx.text('dotImp'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.5" cy="6.5" r="1.3" fill="currentColor"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor"/><circle cx="4.5" cy="17.5" r="1.3" fill="currentColor"/></svg></button>`)}${row('lYrs', specs[3])}</div>
        <button type="button" class="st-pill b09-calc" data-calc="1" style="top:540px" ${st.shown ? 'hidden' : ''}>${ctx.t('calc')}</button>
        <div class="b09-card b09-res b09-f ${st.shown ? '' : 'is-off'}" data-res="1" style="left:160px;width:1280px;top:530px;grid-template-columns:1fr 330px;align-items:center;gap:10px 30px;padding:18px 30px">
          <div style="display:grid;gap:12px"><div class="b09-out" data-out="1" style="font-size:28px"></div><p class="b09-para" data-par="1" style="text-align:left;font-size:21px;line-height:1.42"></p></div>
          <div data-bars="1"></div>
        </div>
        <div style="position:absolute;left:0;right:0;top:796px;display:flex;justify-content:center" class="b09-f ${st.shown ? '' : 'is-off'}" data-avse-w="1"><button type="button" class="st-pill" data-avse="1">${ctx.t('avse')}</button></div>
        ${discLine(ctx, ['disc'], ['past'], 'position:absolute;left:110px;right:330px;top:852px')}`;
      const calc = () => {
        const X = rateLump(st.yrs, st.pur + st.imp, st.mkt);
        const G = st.mkt - st.pur - st.imp;
        ctx.$('[data-out]').innerHTML = `${ctx.t('outA')} ${N(fTxt(X, 2))}`;
        ctx.$('[data-par]').innerHTML = `${ctx.t('pA')} ${N(m0(G))} ${ctx.t('pB')} ${N(F.int(st.yrs))} ${ctx.t('pC')} ${N(fTxt(X, 2))} ${ctx.t('pD')} ${ctx.t('pQ')}`;
        ctx.$('[data-bars]').innerHTML = basisBars(st.pur, st.imp, st.mkt, 330, 236);
        refresh(ctx.$('[data-res]'));
      };
      calc();
      const setTotal = (newTotal) => {
        const l = list().map((x) => Object.assign({}, x));
        const old = total(l);
        if (!l.length) l.push({ desc: ctx.text('defItem'), amount: newTotal });
        else l[0].amount = (+l[0].amount || 0) + (newTotal - old);
        shared.set('house_improvements_list', l);
        st.imp = total(l);
      };
      bindIn(ctx.el, specs, st, (id, v, changed) => {
        if (!changed) return;
        if (id === 'mkt') shared.set('house_current_market_value', v);
        if (id === 'pur') shared.set('house_purchase_price', v);
        if (id === 'yrs') shared.set('house_years_since_purchase', v);
        if (id === 'imp') { setTotal(v); setIn(ctx.el, specs[2], st.imp); }
        calc();
      });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { st.shown = true; ctx.show('[data-res]', true); ctx.show('[data-avse-w]', true); ctx.$('[data-calc]').hidden = true; calc(); });
      ctx.on(ctx.$('[data-avse]'), 'click', () => { session.mm10Return = st.shown; ctx.jump('AVSE', 'avse1'); });
      ctx.on(ctx.$('[data-dot="imp"]'), 'click', () => openList());

      /* capital improvements list editor */
      function openList() {
        let items = list().map((x) => ({ desc: x.desc, amount: +x.amount || 0 }));
        let dirty = false;
        const ov = ctx.overlay({ title: ctx.t('dlgTitle'), html: '<div data-li="1"></div>' });
        const box = ov.querySelector('[data-li]');
        ov.querySelector('.st-overlay-in').style.width = '900px';
        const draw = (focusLast) => {
          box.innerHTML = `<div class="b09-scroll" style="max-height:460px;box-shadow:none">
              <table class="st-table b09-tbl"><thead><tr><th style="width:68%">${ctx.t('cDesc')}</th><th>${ctx.t('cAmt')}</th><th style="width:70px"></th></tr></thead>
              <tbody>${items.map((x, k) => `<tr><td><input class="st-input" data-d="${k}" value="${U.esc(x.desc)}" style="height:44px;font-size:19px"></td>
                <td><input class="st-input b09-in" data-a="${k}" value="${U.esc(m0(x.amount))}" inputmode="decimal" style="height:44px;width:100%;font-size:19px"></td>
                <td class="c"><button type="button" class="b09-x" data-del="${k}" aria-label="${U.esc(ctx.text('delAria'))}" style="color:${P.navy};border-color:${P.mist2};font-size:22px">&times;</button></td></tr>`).join('')}</tbody></table></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px">
              <button type="button" class="st-pill b09-ghost" data-add="1">+ ${ctx.t('add')}</button>
              <div style="font:700 22px/1 'DM Sans',sans-serif;color:${P.navy}">${N(m0(total(items)))}</div>
              <button type="button" class="st-pill" data-save="1">${ctx.t('save')}</button></div>`;
          box.querySelectorAll('[data-d]').forEach((el) => { el.addEventListener('keydown', (e) => e.stopPropagation()); el.addEventListener('input', () => { items[+el.dataset.d].desc = el.value; dirty = true; }); });
          box.querySelectorAll('[data-a]').forEach((el) => {
            el.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') el.blur(); });
            el.addEventListener('focus', () => { el.value = String(items[+el.dataset.a].amount); el.select(); });
            el.addEventListener('blur', () => { const v = F.parse(el.value); if (isFinite(v)) { items[+el.dataset.a].amount = Math.round(v); dirty = true; } draw(); });
          });
          box.querySelectorAll('[data-del]').forEach((b) => ctx.on(b, 'click', () => { items.splice(+b.dataset.del, 1); dirty = true; draw(); }));
          ctx.on(box.querySelector('[data-add]'), 'click', () => { items.push({ desc: '', amount: 0 }); dirty = true; draw(true); });
          ctx.on(box.querySelector('[data-save]'), 'click', () => {
            if (dirty) { shared.set('house_improvements_list', items); st.imp = total(items); setIn(ctx.el, specs[2], st.imp); calc(); }
            ov.close();
          });
          refresh(box);
          if (focusLast) { const d = box.querySelectorAll('[data-d]'); if (d.length) d[d.length - 1].focus(); }
        };
        draw();
      }
    }
  });

  /* ------------------------------------------------------------------ */
  /* mm11: cost of financing vs investment opportunity                   */
  /* ------------------------------------------------------------------ */
  EFA.screen('mm11', {
    title: 'Cost of financing vs investment opportunity',
    copy: {
      head: 'Compare What Financing Costs With Your Investment Opportunities',
      tInv: 'An Investment', tMtg: 'A Mortgage',
      cLump: 'Lump Sum Invested', cMonthly: 'Monthly Deposit', cRor: 'Investment Rate of Return', cYrs: 'Number of Years',
      cOppLump: 'Opportunity Cost of Lump Sum', cOppMonthly: 'Opportunity Cost of Monthly Payments',
      sLumpA: 'A lump sum of', sMonA: 'A monthly deposit of', sB: 'invested for', sC: 'years would grow to',
      cLoan: 'Mortgage Loan Amount', cRate: 'Loan Rate', cNcbA: 'N.C.B. @', cNcbB: 'Tax Rate', cPay: 'Monthly Payment',
      cost0: 'Total of All Payments (Principal + Interest)', cost1: 'What the Payments Could Have Grown To', cost2: 'Future Value of Interest Paid (Transferred Dollars)',
      mA: 'Investing', mB: 'each month for', mC: 'years at', mD: 'would grow to',
      toggleRate: 'Toggle Rate',
      taxTitle: 'Net Cost of Borrowing',
      taxBody: 'Enter your effective tax bracket. The loan rate is reduced by that bracket to reflect a possible mortgage-interest deduction. The deduction applies only if you itemize, within current limits, so treat the result as an estimate.',
      taxLabel: 'Effective Tax Bracket', taxGo: 'Calculate', cancel: 'Cancel',
      docTitle: 'Pick a worksheet', ws0: 'Lump Sum Growth', ws1: 'Monthly Deposit Growth', ws2: 'Payments Growing at the Loan Rate', ws3: 'Future Value of Interest Paid',
      wMonth: 'Month', wStart: 'Starting Balance', wInt: 'Monthly Interest', wEnd: 'Ending Balance', wDep: 'Monthly Deposit', wPay: 'Monthly Payment',
      wYear: 'Year', wYI: 'Interest This Year', wCI: 'Interest To Date', wLost: 'Lost Growth This Year', wT: 'Transferred To Date',
      disc: 'Assumes fixed rates; the costs of investing are left out. Any benefit from the mortgage-interest deduction depends on itemizing and current limits.',
      _notes: 'Every mortgage dollar has two prices: the interest, and what the dollar could have earned instead.\n\n- Turn on An Investment first, then A Mortgage.\n- Click the cost label to cycle: total payments, what those payments could grow to, and the future value of the interest alone.\n- Ask: Which of those three numbers did your lender show you?\nPAUSE'
    },
    render(ctx) {
      const st = {
        L: shared.get('house_purchase_price', 100000), rInv: +(shared.get('case_file_ror_accumulation', 0.06) * 100).toFixed(4), N: shared.get('mortgage_term_in_years', 30),
        rLoan: +(shared.get('mortgage_interest_rate', 0.06) * 100).toFixed(4), tax: +(shared.get('case_file_ror_taxes', 0.30) * 100).toFixed(4),
        isLump: true, isNCB: false, costMode: 0, isToggleRate: false, showInv: false, showMtg: false
      };
      st.L2 = st.L; st.N2 = st.N;
      const sp = {
        L: { id: 'L', type: 'money', min: 0 }, Lpay: { id: 'Lpay', type: 'money', readonly: true }, rInv: { id: 'rInv', type: 'pct', dp: 2, max: 12 },
        N: { id: 'N', type: 'int', dp: 0, min: 0 }, N2: { id: 'N2', type: 'int', dp: 0, min: 0 }, L2: { id: 'L2', type: 'money', min: 0 },
        rLoan: { id: 'rLoan', type: 'pct', dp: 3 }, rN: { id: 'rN', type: 'pct', dp: 2, readonly: true }, pay: { id: 'pay', type: 'money', dp: 0, readonly: true }
      };
      ctx.el.innerHTML = `
        <div class="b09-head" style="top:36px"><h1 class="st-h1" style="font-size:48px">${ctx.t('head')}</h1></div>
        <div class="b09-half" style="top:118px">
          <button type="button" class="b09-tab" data-tab="inv" aria-pressed="false"><span class="lamp"></span>${ctx.t('tInv')}</button>
          <div class="b09-card b09-f is-off" data-pan="inv" style="padding:22px 26px 14px;border-top-left-radius:0">
            <div class="b09-cols">
              <div class="b09-col"><span class="cap click" data-lumpcap="1"></span><span data-lumpin="1"></span></div>
              <div class="b09-col"><span class="cap" data-rorcap="1">${ctx.t('cRor')}</span>${inp(sp.rInv, st.rInv)}</div>
              <div class="b09-col"><span class="cap">${ctx.t('cYrs')}</span>${inp(sp.N, st.N)}</div>
              <div class="b09-col"></div>
              <div class="b09-col"><span class="cap" data-oppcap="1"></span><span class="b09-red" data-F="1"></span></div>
            </div>
            <p class="b09-sent" data-isent="1" style="margin-top:14px;text-align:center"></p>
          </div>
        </div>
        <div class="b09-half" style="top:440px">
          <button type="button" class="b09-tab" data-tab="mtg" aria-pressed="false"><span class="lamp"></span>${ctx.t('tMtg')}</button>
          <div class="b09-card b09-f is-off" data-pan="mtg" style="padding:22px 26px 14px;border-top-left-radius:0;position:relative">
            <div class="b09-cols">
              <div class="b09-col"><span class="cap">${ctx.t('cLoan')}</span>${inp(sp.L2, st.L)}</div>
              <div class="b09-col"><span class="cap click" data-ratecap="1"></span><span data-ratein="1"></span></div>
              <div class="b09-col"><span class="cap">${ctx.t('cYrs')}</span>${inp(sp.N2, st.N)}</div>
              <div class="b09-col"><span class="cap">${ctx.t('cPay')}</span>${inp(sp.pay, 0)}</div>
              <div class="b09-col"><span class="cap click" data-costcap="1"></span><span class="b09-red" data-cost="1"></span></div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:14px">
              <p class="b09-sent" data-msent="1" style="width:80%"></p>
              <button type="button" class="st-pill b09-ghost" data-tr="1" aria-pressed="false">${ctx.t('toggleRate')}</button>
            </div>
          </div>
        </div>
        <div style="position:absolute;left:0;right:0;top:768px;display:flex;justify-content:center">${bridge.docButton(ctx, { data: () => { chooser(); return null; } })}</div>
        ${discLine(ctx, ['disc'], ['hypothetical', 'notAdvice'], 'position:absolute;left:110px;right:330px;top:814px')}`;
      const res = () => financeVsInvest({ L: st.L, rInv: st.rInv / 100, N: st.N, rLoan: st.rLoan / 100, tax: st.tax / 100, isNCB: st.isNCB, isLump: st.isLump, isToggleRate: st.isToggleRate });
      const bindNew = () => {
        const fresh = Object.values(sp).filter((o) => { const e = ctx.el.querySelector(`[data-in="${o.id}"]`); return e && !e.dataset.bound; });
        bindIn(ctx.el, fresh, st, onChange);
        fresh.forEach((o) => { ctx.el.querySelector(`[data-in="${o.id}"]`).dataset.bound = '1'; });
      };
      const draw = () => {
        const r = res();
        ctx.$('[data-lumpcap]').innerHTML = ctx.t(st.isLump ? 'cLump' : 'cMonthly');
        const li = ctx.$('[data-lumpin]'), want = st.isLump ? 'L' : 'Lpay';
        if (!li.querySelector(`[data-in="${want}"]`)) { li.innerHTML = inp(sp[want], st.isLump ? st.L : r.pay); bindNew(); }
        else setIn(ctx.el, sp[want], st.isLump ? st.L : r.pay);
        ctx.$('[data-oppcap]').innerHTML = ctx.t(st.isLump ? 'cOppLump' : 'cOppMonthly');
        ctx.$('[data-F]').innerHTML = N(m0(r.F));
        ctx.$('[data-isent]').innerHTML = `${ctx.t(st.isLump ? 'sLumpA' : 'sMonA')} ${N(m0(st.isLump ? st.L : r.pay))} ${ctx.t('sB')} ${N(F.int(st.N))} ${ctx.t('sC')} ${N(m0(r.F))}`;
        ctx.$('[data-rorcap]').classList.toggle('hl', st.isToggleRate);
        ctx.$('[data-ratecap]').innerHTML = st.isNCB ? `${ctx.t('cNcbA')} ${N(pTxt(st.tax))} ${ctx.t('cNcbB')}` : ctx.t('cRate');
        const ri = ctx.$('[data-ratein]'), wantR = st.isNCB ? 'rN' : 'rLoan';
        if (!ri.querySelector(`[data-in="${wantR}"]`)) { ri.innerHTML = inp(sp[wantR], st.isNCB ? r.rN * 100 : st.rLoan); bindNew(); }
        else setIn(ctx.el, sp[wantR], st.isNCB ? r.rN * 100 : st.rLoan);
        setIn(ctx.el, sp.pay, r.pay); setIn(ctx.el, sp.L2, st.L); setIn(ctx.el, sp.N, st.N); setIn(ctx.el, sp.N2, st.N);
        ctx.$('[data-costcap]').innerHTML = ctx.t('cost' + st.costMode);
        ctx.$('[data-cost]').innerHTML = N(m0(r.cost[st.costMode]));
        ctx.$('[data-msent]').innerHTML = `${ctx.t('mA')} ${N(m0(r.pay))} ${ctx.t('mB')} ${N(F.int(st.N))} ${ctx.t('mC')} ${N(pTxt(r.q * 100, 3))} ${ctx.t('mD')} ${N(m0(r.Q))}`;
        ctx.$('[data-msent]').classList.toggle('hl', st.isToggleRate);
        ctx.$('[data-tr]').setAttribute('aria-pressed', String(st.isToggleRate));
        ctx.$('[data-tr]').classList.toggle('b09-ghost', !st.isToggleRate);
        refresh(ctx.el);
      };
      function onChange(id, v) {
        if (id === 'L' || id === 'L2') { st.L = st.L2 = v; shared.set('house_purchase_price', v); }
        if (id === 'rInv') shared.set('case_file_ror_accumulation', v / 100);
        if (id === 'N' || id === 'N2') { st.N = st.N2 = v; shared.set('mortgage_term_in_years', v); }
        if (id === 'rLoan') shared.set('mortgage_interest_rate', v / 100);
        draw();
      }
      draw(); bindNew();
      bridge.guard(ctx, '[data-in="rInv"]');
      const tab = (k, on) => { ctx.$(`[data-tab="${k}"]`).setAttribute('aria-pressed', String(on)); ctx.show(`[data-pan="${k}"]`, on); };
      ctx.on(ctx.$('[data-tab="inv"]'), 'click', () => { st.showInv = !st.showInv; tab('inv', st.showInv); });
      ctx.on(ctx.$('[data-tab="mtg"]'), 'click', () => { st.showMtg = !st.showMtg; tab('mtg', st.showMtg); });
      ctx.on(ctx.$('[data-lumpcap]'), 'click', () => { st.isLump = !st.isLump; draw(); });
      ctx.on(ctx.$('[data-costcap]'), 'click', () => { st.costMode = (st.costMode + 1) % 3; draw(); });
      ctx.on(ctx.$('[data-tr]'), 'click', () => { st.isToggleRate = !st.isToggleRate; draw(); });
      ctx.on(ctx.$('[data-ratecap]'), 'click', () => {
        if (st.isNCB) { st.isNCB = false; draw(); return; }
        const tsp = { id: 'tax', type: 'pct', dp: 2, min: 0, max: 100 }, tmp = { tax: st.tax };
        const m = modal(ctx, {
          title: ctx.t('taxTitle'), width: 680,
          body: `<p style="margin:0">${ctx.t('taxBody')}</p><div class="b09-frow" style="border:0"><span class="lb">${ctx.t('taxLabel')}</span>${inp(tsp, st.tax)}</div>`,
          buttons: [{ key: 'cancel', ghost: true }, { key: 'taxGo', onClick: (close) => {
            const v = parseIn(tsp, m.querySelector('[data-in="tax"]').value, tmp.tax);
            st.tax = v; shared.set('case_file_ror_taxes', v / 100); st.isNCB = true; close(); draw();
          } }]
        });
        bindIn(m, [tsp], tmp, () => {});
        setTimeout(() => { try { m.querySelector('[data-in="tax"]').focus(); } catch (e) { /* ignore */ } }, 60);
      });
      function chooser() {
        const pick = modal(ctx, {
          title: ctx.t('docTitle'), width: 640, esc: true, closeX: true,
          body: [0, 1, 2, 3].map((k) => `<button type="button" class="st-pill b09-ghost" data-ws="${k}" style="justify-content:flex-start;padding-left:22px">${ctx.t('ws' + k)}</button>`).join('')
        });
        pick.querySelectorAll('[data-ws]').forEach((b) => ctx.on(b, 'click', () => { pick.close(); bridge.worksheet(ctx, sheet(+b.dataset.ws)); }));
      }
      function sheet(k) {
        const r = res();
        if (k === 0) {
          const rows = []; let bal = st.L;
          for (let x = 1; x <= r.m; x++) { const it = bal * r.i, end = bal + it; rows.push({ month: x, start: bal, interest: it, end }); bal = end; }
          return { heading: ctx.t('ws0'), size: 'medium', filter: 'month', rows, columns: wsCols(ctx, [['month', 'wMonth', 'int'], ['start', 'wStart', 'money', 2], ['interest', 'wInt', 'money', 2], ['end', 'wEnd', 'money', 2]]) };
        }
        if (k === 1 || k === 2) {
          const rows = depositRows(k === 1 ? r.i : r.rUse / 12, r.m, r.pay, 0);
          return { heading: ctx.t('ws' + k), size: 'medium', filter: 'month', rows, columns: wsCols(ctx, [['month', 'wMonth', 'int'], ['start', 'wStart', 'money', 2], ['interest', 'wInt', 'money', 2], ['deposit', k === 1 ? 'wDep' : 'wPay', 'money', 2], ['end', 'wEnd', 'money', 2]]) };
        }
        return { heading: ctx.t('ws3'), size: 'medium', rows: r.years.map((x) => ({ year: x.year, yi: x.yearInt, ci: x.cumInt, lost: x.yearLost, t: x.T })), columns: wsCols(ctx, [['year', 'wYear', 'year'], ['yi', 'wYI', 'money', 2], ['ci', 'wCI', 'money', 2], ['lost', 'wLost', 'money', 2], ['t', 'wT', 'money', 2]]) };
      }
    }
  });

  /* ------------------------------------------------------------------ */
  /* mm13: 15-year vs 30-year with a side fund                           */
  /* ------------------------------------------------------------------ */
  EFA.screen('mm13', {
    title: '15-year vs 30-year with a side fund',
    copy: {
      head: '“Once the house is paid off, then I’ll really start saving.”',
      intro: 'Here is a 15-year loan and a 30-year loan side by side over the same thirty years. Change the amount and the rate, then look at the gap.',
      bLoan: 'Loan Amount', bRate: 'Loan Rate', b15: '15-Year Payment', b30: '30-Year Payment', bDiff: 'Monthly Difference',
      calc: 'Calculate', sfr: 'Side Fund ROR',
      r15A: 'Once the 15-year loan is paid off at year 15, its full', r15B: 'payment is free to invest each month through year 30.',
      r30A: 'The 30-year payment is', r30B: 'lower each month, so that', r30C: 'is invested monthly from the start through year 30.',
      at: 'at',
      sfrTitle: 'Side Fund Rate of Return', sfrBody: 'Enter the rate of return to assume for the side fund.', sfrLabel: 'Side Fund ROR', sfrGo: 'Calculate',
      docTitle: 'Pick a worksheet', ws15: '15-Year Side Fund', ws30: '30-Year Side Fund',
      wMonth: 'Month', wStart: 'Starting Balance', wInt: 'Monthly Interest', wDep: 'Monthly Deposit', wEnd: 'Ending Balance',
      disc: 'Assumes one fixed rate of return on the side fund, with deposits at the end of each month. This is not a recommendation of a loan term.',
      _notes: 'Many people plan to start saving once the house is paid off. The 30-year loan lets you start on day one.\n\n- Enter the client\'s loan amount and rate, then Calculate.\n- Ask: Which would you rather have at year 30: a paid-off house and fifteen years of saving, or a paid-off house and thirty years of saving?\nPAUSE\n\n- Side Fund ROR changes the assumed return; the screens that follow carry these numbers forward.'
    },
    render(ctx) {
      const st = { L: shared.get('house_purchase_price', 100000), r: +(shared.get('mortgage_interest_rate', 0.06) * 100).toFixed(4), S: +(shared.get('case_file_ror_accumulation', 0.06) * 100).toFixed(4), shown: false };
      const copyToC2M = () => {
        shared.set('c2m_loan_1_amount', st.L); shared.set('c2m_loan_2_amount', st.L);
        shared.set('c2m_loan_1_rate', st.r / 100); shared.set('c2m_loan_2_rate', st.r / 100);
        shared.set('mm_side_fund_ror', st.S / 100);
      };
      copyToC2M();
      const sp = { L: { id: 'L', type: 'money', min: 0 }, r: { id: 'r', type: 'pct', dp: 3, min: 0 } };
      const box = (x, y, w, h, inner, cls) => `<div class="b09-card b09-dbox ${cls || ''}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${inner}</div>`;
      const W = 1300, H = 500, px = (f) => f * W, py = (f) => f * H;
      const arrow = (x1, y1, x2, y2, c, bend) => {
        const mx = (x1 + x2) / 2, d = `M${x1},${y1} C${mx + bend},${y1} ${mx - bend},${y2} ${x2 - 14},${y2}`;
        return `<path d="${d}" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round"/>
          <path d="M-20,-14 L6,0 L-20,14 Z" transform="translate(${x2 - 8},${y2})" fill="${c}"/>`;
      };
      const sheet = (is15) => {
        const r = sideFund(st.L, st.r, st.S);
        return { heading: ctx.t(is15 ? 'ws15' : 'ws30'), size: 'medium', filter: 'month', rows: depositRows(r.s, is15 ? 180 : 360, is15 ? r.P15 : r.D, 0),
          columns: wsCols(ctx, [['month', 'wMonth', 'int'], ['start', 'wStart', 'money', 2], ['interest', 'wInt', 'money', 2], ['deposit', 'wDep', 'money', 2], ['end', 'wEnd', 'money', 2]]) };
      };
      ctx.el.innerHTML = `
        <div class="b09-head" style="top:32px"><h1 class="st-h1" style="font-size:50px;font-style:italic">${ctx.t('head')}</h1></div>
        <div class="b09-box" style="position:absolute;left:110px;right:110px;top:128px;font-size:23px;font-weight:600;text-align:center">${ctx.t('intro')}</div>
        <div class="b09-dg">
          <svg class="b09-full" viewBox="0 0 ${W} ${H}" style="width:${W}px;height:${H}px" aria-hidden="true">
            ${arrow(px(0.22) + 216, py(0.23) + 34, px(0.45), py(-0.02) + 73, P.steel, 46)}
            ${arrow(px(0.22) + 216, py(0.23) + 86, px(0.45), py(0.46) + 73, P.navy4, 46)}
          </svg>
          ${box(0, py(0.23), 216, 120, `<span class="cap">${ctx.t('bLoan')}</span>${inp(sp.L, st.L)}`)}
          ${box(px(0.22), py(0.23), 216, 120, `<span class="cap">${ctx.t('bRate')}</span>${inp(sp.r, st.r)}`)}
          ${box(px(0.45), py(-0.02), 216, 146, `<span class="cap">${ctx.t('b15')}</span><span class="val" data-v="P15"></span>`)}
          ${box(px(0.45), py(0.46), 216, 146, `<span class="cap">${ctx.t('b30')}</span><span class="val" data-v="P30"></span>`)}
          ${box(px(0.28), py(0.775), 450, 96, `<div style="display:flex;align-items:center;gap:22px"><span class="cap">${ctx.t('bDiff')}</span><span class="val" data-v="D" style="color:${P.goldDeep}"></span></div>`)}
          <button type="button" class="st-pill" data-calc="1" style="position:absolute;left:${px(0.75)}px;top:${py(0.28) + 20}px;min-width:220px">${ctx.t('calc')}</button>
          <div class="b09-card b09-rbox b09-f is-off" data-res="1" style="left:${px(0.635)}px;top:${py(-0.04)}px;width:474px;height:232px"><p data-t15="1"></p><div class="big" data-v15="1"></div></div>
          <div class="b09-card b09-rbox b09-f is-off" data-res="1" style="left:${px(0.635)}px;top:${py(0.46)}px;width:474px;height:232px"><p data-t30="1"></p><div class="big" data-v30="1"></div></div>
        </div>
        <div class="b09-f is-off" data-res="1" style="position:absolute;left:0;right:0;top:784px;display:flex;justify-content:center;align-items:center;gap:48px">
          <button type="button" class="st-pill" data-sfr="1">${ctx.t('sfr')}</button>${bridge.docButton(ctx, { data: () => { chooser(); return null; } })}
        </div>
        ${discLine(ctx, ['disc'], ['hypothetical'], 'position:absolute;left:110px;right:330px;top:842px')}`;
      const calc = () => {
        const r = sideFund(st.L, st.r, st.S);
        ctx.$('[data-v="P15"]').innerHTML = N(m2(r.P15)); ctx.$('[data-v="P30"]').innerHTML = N(m2(r.P30)); ctx.$('[data-v="D"]').innerHTML = N(m2(r.D));
        ctx.$('[data-t15]').innerHTML = `${ctx.t('r15A')} ${N(m2(r.P15))} ${ctx.t('r15B')}`;
        ctx.$('[data-t30]').innerHTML = `${ctx.t('r30A')} ${N(m2(r.D))} ${ctx.t('r30B')} ${N(m2(r.D))} ${ctx.t('r30C')}`;
        const big = (v) => `${N(m0(v))} <span style="font-size:24px;font-weight:600">${ctx.t('at')}</span> ${N(pTxt(st.S, 2))}`;
        ctx.$('[data-v15]').innerHTML = big(r.V15); ctx.$('[data-v30]').innerHTML = big(r.V30);
        refresh(ctx.el);
        return r;
      };
      calc();
      bindIn(ctx.el, [sp.L, sp.r], st, (id, v, changed) => {
        if (!changed) return;
        if (id === 'L') shared.set('house_purchase_price', v);
        if (id === 'r') shared.set('mortgage_interest_rate', v / 100);
        st.S = st.r;               // as specified: editing amount or rate resets the side-fund rate to the loan rate
        copyToC2M(); calc();
      });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { st.shown = true; ctx.show('[data-res]', true); ctx.$('[data-calc]').hidden = true; calc(); });
      ctx.on(ctx.$('[data-sfr]'), 'click', () => {
        const ssp = { id: 'S', type: 'pct', dp: 2 }, tmp = { S: st.S };
        const m = modal(ctx, {
          title: ctx.t('sfrTitle'), width: 600,
          body: `<p style="margin:0">${ctx.t('sfrBody')}</p><div class="b09-frow" style="border:0"><span class="lb">${ctx.t('sfrLabel')}</span>${inp(ssp, st.S)}</div>`,
          buttons: [{ key: 'sfrGo', onClick: (close) => { st.S = parseIn(ssp, m.querySelector('[data-in="S"]').value, tmp.S); shared.set('mm_side_fund_ror', st.S / 100); close(); calc(); } }]
        });
        bindIn(m, [ssp], tmp, () => {});
        setTimeout(() => { try { m.querySelector('[data-in="S"]').focus(); } catch (e) { /* ignore */ } }, 60);
      });
      function chooser() {
        const pick = modal(ctx, {
          title: ctx.t('docTitle'), width: 600, esc: true, closeX: true,
          body: ['ws15', 'ws30'].map((k) => `<button type="button" class="st-pill b09-ghost" data-ws="${k}" style="justify-content:flex-start;padding-left:22px">${ctx.t(k)}</button>`).join('')
        });
        pick.querySelectorAll('[data-ws]').forEach((b) => ctx.on(b, 'click', () => { pick.close(); bridge.worksheet(ctx, sheet(b.dataset.ws === 'ws15')); }));
      }
    }
  });

  /* ------------------------------------------------------------------ */
  /* mimt1: Medicare income-related premiums                              */
  /* ------------------------------------------------------------------ */
  /** Medicare tier table from EFA.data.medicare (shape in the data brief); null while figures are being verified */
  function medicareTable() {
    const m = data('medicare', null);
    if (!m || !Array.isArray(m.irmaa) || m.irmaa.length < 6 || !isFinite(m.year)) return null;
    const tiers = m.irmaa.slice(0, 6);
    const hiOf = (r) => (Array.isArray(r) ? r[1] : (r && typeof r === 'object' ? (r.hi != null ? r.hi : r.max) : null));
    const bounds = (fs) => tiers.slice(0, 5).map((t) => hiOf(t[fs]));
    const T = { 0: bounds('single'), 1: bounds('mfj'), 3: tiers[0].hoh ? bounds('hoh') : bounds('single') };
    // married filing separately: only three tiers carry ranges (lowest, the one below the top, the top)
    const mfsIdx = tiers.map((t, k) => (t.mfs ? k : -1)).filter((k) => k >= 0);
    const mfsTiers = mfsIdx.length === 3 ? mfsIdx.map((k) => k + 1) : [1, 5, 6];
    T[2] = [hiOf(tiers[mfsTiers[0] - 1].mfs), hiOf(tiers[mfsTiers[1] - 1].mfs)];
    const B = tiers.map((t) => t.partBTotal), D = tiers.map((t) => t.partDAdd || 0);
    const ok = [0, 1, 2, 3].every((fs) => T[fs].every((v) => isFinite(v))) && B.every((v) => isFinite(v)) && D.every((v) => isFinite(v));
    if (!ok) return null;
    return { year: m.year, magiYear: isFinite(m.magiYearUsed) ? m.magiYearUsed : m.year - 2, T, B, D };
  }
  /** tier lookup and costs exactly as specified */
  function irmaa(tb, fs, magi, partDBase) {
    if (!(fs in tb.T)) fs = 1;
    const T = tb.T[fs], k = T.length;
    const th = (t) => T[Math.max(1, Math.min(t, k)) - 1];
    let t = 1;
    if (fs === 2) { while (t < 3 && magi > th(t)) t++; if (t > 1) t += 3; }   // MFS uses tiers 1, 5 and 6
    else { while (t < 6 && magi > th(t)) t++; }
    const cost = (tt, annual) => { const c = Math.max(1, Math.min(6, tt)) - 1; return (tb.B[c] + partDBase + tb.D[c]) * (annual ? 12 : 1); };
    return { tier: t, monthly: cost(t, false), annual: cost(t, true), room: Math.max(0, th(t) - magi) };
  }
  EFA.screen('mimt1', {
    title: 'Medicare premiums and income',
    copy: {
      head: 'Will Your Income Raise Your Medicare Premiums?',
      noteA: 'Enter figures from your', noteB: 'tax return to estimate your', noteC: 'Medicare premiums.',
      noteNo: 'Medicare premium tables are being verified. You can still enter figures; estimates appear once the tables are in place.',
      lFs: 'Filing Status', fs0: 'Single', fs1: 'Married Filing Jointly', fs2: 'Married Filing Separately', fs3: 'Head of Household',
      lGross: 'Gross Income', lAdj: 'Adjustments to Income', lAgi: 'Adjusted Gross Income', lTei: 'Tax-Exempt Interest', lMagi: 'Modified Adjusted Gross Income',
      opMinus: '-', opEq: '=', opPlus: '+',
      tipGross: 'Every kind of taxable income: wages, interest and dividends, business income, retirement distributions, Social Security that is taxable, and so on.',
      tipAdj: 'Deductions taken before adjusted gross income, such as deductible IRA or HSA contributions, student loan interest and certain educator expenses.',
      calc: 'Calculate',
      rHeadA: 'Your estimated', rHeadB: 'Medicare premiums',
      rMon: 'Monthly premium per person', rAnn: 'Annual premium per person', rRoom: 'Room before next tier',
      hTier: 'Premium Tier (MAGI)', hB: 'Part B', hD: 'Part D', hMon: 'Monthly Premium', hAnn: 'Annual Premium',
      tipD: 'Click to add a Part D base premium',
      ssa: 'Read the Social Security guidance on Medicare premiums',
      pdTitle: 'Part D Base Premium', pdBody: 'Part D base premiums vary by plan. Enter the monthly base premium for your plan.', pdLabel: 'Monthly Base Premium', pdGo: 'Calculate',
      verify: 'Figures being verified',
      disc: 'Estimates per person, based on the published Medicare premium tiers for the premium year, which look back to the tax return from two years earlier. Part D base premiums vary by plan.',
      _notes: 'Medicare premiums are means-tested. A single large withdrawal or capital gain can raise them two years later.\n\n- Enter figures from the tax return two years before the premium year.\n- Ask: Is there a year coming up when your income could jump, from a sale, a pension lump sum or a large IRA withdrawal?\nPAUSE\n\n- Room before next tier shows how much more income fits before the premium steps up.'
    },
    render(ctx) {
      const tb = medicareTable();
      const st = { fs: shared.get('tax_filing_status', 1), gross: shared.get('mimt_gross_income', 0), adj: shared.get('mimt_adjustments', 0), tei: shared.get('mimt_tax_exempt_interest', 0), pd: 0, shown: false };
      const sp = { gross: { id: 'gross', type: 'money', min: 0 }, adj: { id: 'adj', type: 'money', min: 0 }, agi: { id: 'agi', type: 'money', readonly: true }, tei: { id: 'tei', type: 'money', min: 0 }, magi: { id: 'magi', type: 'money', readonly: true } };
      const agi = () => st.gross - st.adj, magi = () => agi() + st.tei;
      const row = (k, o, op, tip) => `<div class="b09-frow"><span class="lb ${tip ? 'b09-tip' : ''}"><span class="op">${op ? ctx.t(op) : ''}</span>${ctx.t(k)}${tip ? `<span class="tipx">${ctx.t(tip)}</span>` : ''}</span>${inp(o, o.readonly ? (o.id === 'agi' ? agi() : magi()) : st[o.id])}</div>`;
      const note = tb ? `${ctx.t('noteA')} ${N(tb.magiYear)} ${ctx.t('noteB')} ${N(tb.year)} ${ctx.t('noteC')}` : ctx.t('noteNo');
      ctx.el.innerHTML = `
        <div class="b09-head" style="top:38px"><h1 class="st-h1" style="font-size:52px">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b09-card b09-panel b09-mi" data-mi="1" style="left:320px;width:960px;top:176px;padding:6px 34px 10px">
          <p class="b09-note">${note}</p>
          <div class="b09-frow"><span class="lb"><span class="op"></span>${ctx.t('lFs')}</span>${ddHTML({ id: 'fs', items: [0, 1, 2, 3].map((k) => ctx.t('fs' + k)), value: st.fs, w: 330 })}</div>
          ${row('lGross', sp.gross, null, 'tipGross')}${row('lAdj', sp.adj, 'opMinus', 'tipAdj')}${row('lAgi', sp.agi, 'opEq')}${row('lTei', sp.tei, 'opPlus')}${row('lMagi', sp.magi)}
        </div>
        <button type="button" class="st-pill b09-calc" data-calc="1" style="top:640px">${ctx.t('calc')}</button>
        <div class="b09-mres b09-f is-off" data-res="1" style="left:832px;width:660px;top:176px">
          <div class="b09-card" style="padding:16px 26px 8px">
            <h3 class="st-h3" style="font-size:28px;margin:0 0 4px">${ctx.t('rHeadA')} <span data-y="1"></span> ${ctx.t('rHeadB')}</h3>
            <div data-rc="1"></div>
          </div>
          <div class="b09-card b09-tiers" style="padding:12px 14px" data-tiers="1"></div>
          <a class="b09-ext" href="https://www.ssa.gov/benefits/medicare/medicare-premiums.html" target="_blank" rel="noopener">${ctx.t('ssa')}</a>
        </div>
        ${discLine(ctx, ['disc'], ['notAdvice'], 'position:absolute;left:110px;right:330px;top:832px')}`;
      const layout = () => {
        const mi = ctx.$('[data-mi]');
        if (st.shown) { mi.style.left = '108px'; mi.style.width = '700px'; } else { mi.style.left = '320px'; mi.style.width = '960px'; }
      };
      const calc = () => {
        setIn(ctx.el, sp.agi, agi()); setIn(ctx.el, sp.magi, magi());
        ctx.$('[data-y]').innerHTML = tb ? N(tb.year) : '';
        if (!tb) {
          ctx.$('[data-rc]').innerHTML = `<div class="b09-verify">${ctx.t('verify')}</div>`;
          ctx.$('[data-tiers]').innerHTML = `<div class="b09-verify">${ctx.t('verify')}</div>`;
          refresh(ctx.$('[data-res]')); return;
        }
        const r = irmaa(tb, st.fs, magi(), st.pd);
        const line = (k, v) => `<div class="b09-frow" style="min-height:52px"><span class="lb" style="font-size:20px">${ctx.t(k)}</span><span style="font:700 26px/1 'DM Sans',sans-serif;color:${P.navy}">${N(m0(v))}</span></div>`;
        ctx.$('[data-rc]').innerHTML = line('rMon', r.monthly) + line('rAnn', r.annual) + line('rRoom', r.room);
        const fs = (st.fs in tb.T) ? st.fs : 1, T = tb.T[fs];
        const cost = (t) => { const c = t - 1; return { b: tb.B[c], d: st.pd + tb.D[c], mon: tb.B[c] + st.pd + tb.D[c] }; };
        const rows = [];
        if (fs === 2) {
          rows.push({ t: 1, lo: 0, hi: T[0] }); rows.push({ t: 5, lo: T[0] + 1, hi: T[1] }); rows.push({ t: 6, lo: T[1] + 1, hi: null });
        } else {
          rows.push({ t: 1, lo: 0, hi: T[0] });
          for (let t = 2; t <= 5; t++) rows.push({ t, lo: T[t - 2] + 1, hi: T[t - 1] });
          rows.push({ t: 6, lo: T[4] + 1, hi: null });
        }
        ctx.$('[data-tiers]').innerHTML = `<table class="st-table"><thead><tr><th style="text-align:left">${ctx.t('hTier')}</th><th>${ctx.t('hB')}</th><th class="pd b09-tip" data-pd="1">${ctx.t('hD')}<span class="tipx" style="left:auto;right:-60px;width:300px;text-transform:none;letter-spacing:0;font-size:16px;font-weight:500">${ctx.t('tipD')}</span></th><th>${ctx.t('hMon')}</th><th>${ctx.t('hAnn')}</th></tr></thead>
          <tbody>${rows.map((x) => { const c = cost(x.t); return `<tr class="${x.t === r.tier ? 'hl' : ''}"><td style="text-align:left;white-space:nowrap">${m0(x.lo)} ${x.hi == null ? '+' : '- ' + m0(x.hi)}</td><td>${m0(c.b)}</td><td>${m0(c.d)}</td><td>${m0(c.mon)}</td><td>${m0(c.mon * 12)}</td></tr>`; }).join('')}</tbody></table>`;
        ctx.on(ctx.$('[data-pd]'), 'click', openPd);
        refresh(ctx.$('[data-res]'));
      };
      function openPd() {
        const psp = { id: 'pd', type: 'money', min: 0 }, tmp = { pd: st.pd };
        const m = modal(ctx, {
          title: ctx.t('pdTitle'), width: 600, esc: true, closeX: true,
          body: `<p style="margin:0">${ctx.t('pdBody')}</p><div class="b09-frow" style="border:0"><span class="lb">${ctx.t('pdLabel')}</span>${inp(psp, st.pd)}</div>`,
          buttons: [{ key: 'pdGo', onClick: (close) => { const v = parseIn(psp, m.querySelector('[data-in="pd"]').value, tmp.pd); close(); if (v !== st.pd) { st.pd = v; calc(); } } }]
        });
        bindIn(m, [psp], tmp, () => {});
      }
      layout(); calc();
      if (!st.shown) ctx.show('[data-res]', false);
      ddBind(ctx.el, 'fs', (v) => { st.fs = v; shared.set('tax_filing_status', v); calc(); });
      bindIn(ctx.el, [sp.gross, sp.adj, sp.tei], st, (id, v) => {
        shared.set({ gross: 'mimt_gross_income', adj: 'mimt_adjustments', tei: 'mimt_tax_exempt_interest' }[id], v);
        calc();
      });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { st.shown = true; layout(); ctx.$('[data-calc]').hidden = true; ctx.show('[data-res]', true); calc(); });
    }
  });


  /* ------------------------------------------------------------------ */
  /* market history explorer (mh1), exposed as EFA.engines.marketHistory  */
  /* ------------------------------------------------------------------ */
  EFA.css('b09m', `
  .b09-mh { display: grid; grid-template-columns: 4fr 3fr; gap: 0 40px; height: 100%; box-sizing: border-box; }
  .b09-mh-l { display: grid; grid-template-rows: auto auto auto auto auto auto 1fr; align-content: start; gap: 10px; min-width: 0; }
  .b09-mh-cap { font: 700 15px/1.2 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6e22; margin-top: 6px; }
  .b09-mh-sel { display: flex; align-items: center; gap: 18px; padding: 16px 20px; }
  .b09-mh-sel .lb { font: 700 17px/1 "DM Sans", sans-serif; color: #0d1e3a; letter-spacing: .04em; }
  .stage .b09-mh-sel select.b09-sel { width: 112px; }
  .b09-mh-lim { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px 18px; padding: 16px 20px; }
  .b09-lim { display: grid; gap: 8px; justify-items: start; }
  .b09-lim label { display: flex; align-items: center; gap: 10px; font: 700 18px/1.15 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; white-space: nowrap; }
  .stage .b09-lim .st-input.b09-in { width: 112px; height: 44px; font-size: 19px; }
  .stage .b09-lim .st-input.b09-in:disabled { background: #e3e8f0; color: #667389; border-color: #e3e8f0; }
  .b09-mh-caprow { display: grid; grid-template-columns: 1fr 160px 160px; gap: 14px; align-items: end; padding: 0 20px; margin-top: 6px; }
  .b09-mh-caprow span { font: 700 15px/1.2 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6e22; }
  .b09-mh-caprow span + span { text-align: right; padding-right: 8px; }
  .b09-mh-stats { padding: 6px 20px; }
  .b09-st { display: grid; grid-template-columns: 1fr 160px 160px; gap: 14px; align-items: center; min-height: 56px; border-bottom: 1px solid rgba(13,30,58,.1); }
  .b09-st:last-child { border-bottom: 0; }
  .b09-st .lb { font: 700 19px/1.25 "DM Sans", sans-serif; color: #0d1e3a; }
  .b09-st .v { font: 700 21px/1 "DM Sans", sans-serif; color: #0d1e3a; text-align: right; background: #e3e8f0; border-radius: 9px; padding: 11px 12px; }
  .b09-st .v.gold { background: #f0e6c4; color: #8a6e22; }
  .b09-amt { color: #8a6e22; border-bottom: 2px dotted #b8972e; cursor: pointer; }
  .b09-mh-act { display: flex; align-items: center; gap: 30px; padding: 2px 4px; }
  .b09-mh-r { display: grid; grid-template-rows: auto 1fr; gap: 10px; min-height: 0; min-width: 0; }
  .b09-mh-title { text-align: center; }
  .stage .b09-mh-r table.st-table { font-size: 17px; }
  .stage .b09-mh-r table.st-table th { font-size: 12px; padding: 10px 8px; line-height: 1.25; vertical-align: bottom; }
  .stage .b09-mh-r table.st-table td { padding: 8px 10px; }
  .stage .b09-mh-r table.st-table td.neg { color: #8a4b2e; }
  .b09-mh-verify { display: grid; place-items: center; text-align: center; height: 100%; padding: 30px; font: 600 22px/1.45 "DM Sans", sans-serif; color: #667389; }
  .b09-src { display: grid; gap: 12px; }
  .b09-src-row { display: grid; grid-template-columns: 250px 1fr; gap: 18px; padding: 10px 0; border-bottom: 1px solid rgba(13,30,58,.1); }
  .b09-src-row:last-child { border-bottom: 0; }
  .b09-src-row .k { font: 700 18px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b09-src-row .t { font: 400 17px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }
  .b09-src-row .t .u { display: block; font-size: 14px; color: #667389; overflow-wrap: anywhere; }
  `);

  const MH_MARKETS = ['DJIA', 'SP500P', 'SP500T', 'R2000', 'NASDAQ', 'MSCIW', 'GOVT10', 'MUNI20', 'CORP30'];
  /** where each market may live in EFA.data.history (first match wins) */
  const MH_KEYS = {
    DJIA: ['markets.DJIA', 'markets.djia', 'djiaPriceReturn', 'djia'],
    SP500P: ['markets.SP500P', 'markets.sp500Price', 'markets.sp500PriceReturn', 'sp500PriceReturn'],
    SP500T: ['markets.SP500T', 'markets.sp500Total', 'markets.sp500TotalReturn', 'sp500TotalReturn'],
    R2000: ['markets.R2000', 'markets.russell2000', 'russell2000'],
    NASDAQ: ['markets.NASDAQ', 'markets.nasdaq', 'markets.nasdaqComposite', 'nasdaqAnnual'],
    MSCIW: ['markets.MSCIW', 'markets.msciWorld', 'msciWorld'],
    GOVT10: ['markets.GOVT10', 'markets.govt10', 'markets.tsy10yYield', 'tsy10yYield'],
    MUNI20: ['markets.MUNI20', 'markets.muni20', 'markets.muni20Yield', 'muni20Yield'],
    CORP30: ['markets.CORP30', 'markets.corp30', 'markets.corpAaaYield', 'markets.aaaYield', 'corpAaaYield', 'aaaYield']
  };
  /** any of [[year, v]], {year: v}, {data|series|values: [...]}, {years:[], values:[]} -> {year: v} */
  function yearMap(x) {
    if (!x) return null;
    let pairs = null;
    if (Array.isArray(x)) pairs = x.map((r) => (Array.isArray(r) ? [+r[0], +r[1]] : (r && typeof r === 'object' ? [+r.year, +(r.value != null ? r.value : (r.r != null ? r.r : r.rate))] : null))).filter(Boolean);
    else if (typeof x === 'object') {
      const inner = x.data || x.series || x.values || x.returns || x.yields;
      if (Array.isArray(x.years) && Array.isArray(x.values)) pairs = x.years.map((y, i) => [+y, +x.values[i]]);
      else if (inner) return yearMap(inner);
      else pairs = Object.keys(x).filter((k) => /^\d{4}$/.test(k)).map((k) => [+k, +x[k]]);
    }
    if (!pairs) return null;
    pairs = pairs.filter((p) => isFinite(p[0]) && isFinite(p[1]));
    if (pairs.length < 2) return null;
    const pctUnits = pairs.some((p) => Math.abs(p[1]) > 2);
    const m = {};
    pairs.forEach(([y, v]) => { m[y] = pctUnits ? v / 100 : v; });
    return m;
  }
  function mhRaw(id) {
    for (const k of MH_KEYS[id] || []) {
      const v = data('history.' + k, null);
      const m = yearMap(v);
      if (m) return { map: m, key: k };
    }
    return null;
  }
  /** {R, first, last, T, P, keys} for a market, or null while its figures are being verified */
  function mhSeries(id) {
    if (id === 'SP500T') {
      const t = mhRaw('SP500T'), pr = mhRaw('SP500P');
      if (!t || !pr) return null;
      const years = Object.keys(t.map).map(Number).filter((y) => y in pr.map).sort((a, b) => a - b);
      if (years.length < 2) return null;
      return { R: t.map, T: t.map, P: pr.map, first: years[0], last: years[years.length - 1], keys: [t.key, pr.key] };
    }
    const r = mhRaw(id); if (!r) return null;
    const years = Object.keys(r.map).map(Number).sort((a, b) => a - b);
    return { R: r.map, first: years[0], last: years[years.length - 1], keys: [r.key] };
  }
  /** the engine, exactly as specified (limits applied in the fixed order; partial multi-year blocks never credited) */
  function mhCompute(p) {
    const S = mhSeries(p.market); if (!S) return null;
    let start = Math.round(p.start), end = Math.round(p.end);
    if (!(start >= S.first)) start = S.first;
    if (!(end <= S.last)) end = S.last;
    if (end < start) end = start;
    const amt = p.amount;
    const isT = p.market === 'SP500T';
    const useT = isT && !p.excludeDiv && p.isPartic;
    const rows = []; let bc = 0, bg = 1, ag = amt, lg = amt, sa = 0, sl = 0;
    for (let y = start; y <= end; y++) {
      const base = isT ? (useT ? S.T[y] : S.P[y]) : S.R[y];
      if (!isFinite(base)) continue;
      let lim = base, act = base, credit = true;
      if (p.isMY && p.myYears > 0) {
        bc += 1; bg *= (1 + lim);
        if (bc % p.myYears === 0) { lim = bg - 1; bc = 0; bg = 1; } else { lim = 0; credit = false; }
      }
      if (credit) {
        if (p.isFloor && lim < p.floor) lim = p.floor;
        if (p.isBuffer && lim < 0) lim = Math.min(lim + p.buffer, 0);
        if (p.isPartic && lim > 0) lim *= p.partic;
        if (p.isCap && lim > p.cap) lim = p.cap;
        if (p.isSpread && lim > 0) lim = Math.max(lim - p.spread, 0);
        if (p.isFee) lim -= p.fee;
      }
      if (isT && !useT) {
        const D = S.T[y] - S.P[y];
        act += D;
        if (!p.excludeDiv && credit) lim += D;
      }
      ag *= (1 + act); lg *= (1 + lim); sa += act; sl += lim;
      rows.push({ year: y, act, lim, ag, lg });
    }
    const n = rows.length;
    const comp = (g) => (n > 0 && amt > 0 && g > 0 ? Math.pow(g / amt, 1 / n) - 1 : 0);
    return { start, end, rows, n, avgA: n ? sa / n : 0, avgL: n ? sl / n : 0, compA: comp(ag), compL: comp(lg), growA: ag, growL: lg, limited: rows.map((r) => r.lim) };
  }

  const MH_COPY = {
    head: 'Market History',
    capSel: 'Select Market', capLim: 'Optional Limits', capStats: 'Market Statistics', capAct: 'Actual', capLimd: 'Limited',
    lStart: 'Start', lEnd: 'End',
    mkDJIA: 'Dow Jones Industrials', mkSP500P: 'S&P 500 Price', mkSP500T: 'S&P 500 Total Return', mkR2000: 'Russell 2000', mkNASDAQ: 'NASDAQ Composite',
    mkMSCIW: 'MSCI World Equity', mkGOVT10: '10-Year Govt Bonds', mkMUNI20: '20-Year Muni Bonds', mkCORP30: '30-Year Corp Bonds',
    limFloor: 'Floor', limBuffer: 'Buffer', limCap: 'Cap', limPartic: 'Participation', limSpread: 'Spread', limFee: 'Fee', limMY: 'Multi-Year', limDiv: 'Exclude Dividends',
    stN: 'Number of years selected', stAvg: 'Average return for the period', stComp: 'Compound (effective annual) return', stGrowA: '', stGrowB: 'grows to',
    title: 'Market Returns',
    cYear: 'Year', cAnn: 'Annual Return %', cLim: 'Limited Return %', cInvB: 'Investment', cLimInv: 'Limited $ Investment',
    source: 'Source', srcTitle: 'Where These Figures Come From', srcCover: 'Years covered', srcOk: 'OK', srcNone: 'Figures being verified',
    amtTitle: 'What starting amount would you like to use?', amtLabel: 'Starting Amount', amtGo: 'Calculate',
    use: 'Use Result',
    verify: 'Figures for this market are being verified. Choose another market to continue.',
    wsTitle: 'Annual Market Returns',
    disc: 'Index returns are shown for illustration; an index cannot be invested in directly, and "limited" returns apply hypothetical crediting limits that do not represent any specific product.',
    _notes: 'Real markets do not deliver their average. Here is what actually happened, year by year, and what the same years look like with limits on the upside and the downside.\n\n- Pick a market and a span of years that matters to the client, such as the ten years before they retire.\n- Turn on a floor and a cap and compare the compound returns.\n- Ask: Which matters more to you over the next ten years: the best year, or never having a terrible one?\nPAUSE'
  };
  /** copy of the explorer always resolves in mh1's namespace, wherever it is embedded */
  const tm = (k, o) => EFA.cp('mh1', k, Object.assign({ def: MH_COPY[k] }, o || {}));
  const tmText = (k) => (EFA.wording ? EFA.wording.get('mh1', k, MH_COPY[k]) : MH_COPY[k]);

  /** render the explorer into el. opts: { overlay: bool, onUse(list of limited returns) } */
  function mhMount(ctx, el, opts) {
    opts = opts || {};
    const ov = !!opts.overlay;
    const avail = MH_MARKETS.filter((id) => mhSeries(id));
    const st = {
      market: avail.length ? avail[0] : 'DJIA', start: null, end: null, amount: 1,
      isFloor: false, floor: 0, isBuffer: false, buffer: 0, isCap: false, cap: 100, isPartic: false, partic: 70,
      isSpread: false, spread: 0, isFee: false, fee: 0, isMY: false, myYears: 2, excludeDiv: false
    };
    const LIMS = [['Floor', 'floor', 'limFloor'], ['Buffer', 'buffer', 'limBuffer'], ['Cap', 'cap', 'limCap'], ['Partic', 'partic', 'limPartic'],
      ['Spread', 'spread', 'limSpread'], ['Fee', 'fee', 'limFee'], ['MY', 'myYears', 'limMY']];
    const limSpec = (f) => (f === 'myYears' ? { id: f, type: 'int', dp: 0, min: 1 } : { id: f, type: 'pct', dp: 2 });
    const params = () => ({
      market: st.market, start: st.start, end: st.end, amount: st.amount, excludeDiv: st.excludeDiv,
      isFloor: st.isFloor, floor: st.floor / 100, isBuffer: st.isBuffer, buffer: st.buffer / 100, isCap: st.isCap, cap: st.cap / 100,
      isPartic: st.isPartic, partic: st.partic / 100, isSpread: st.isSpread, spread: st.spread / 100, isFee: st.isFee, fee: st.fee / 100,
      isMY: st.isMY, myYears: Math.max(0, Math.round(st.myYears))
    });
    const resetYears = () => {
      const S = mhSeries(st.market);
      if (!S) { st.start = st.end = null; return; }
      if (st.start == null || st.start < S.first) st.start = S.first;
      if (st.end == null || st.end < S.first || st.end > S.last) st.end = S.last;
      if (st.start > S.last) st.start = S.first;
    };
    resetYears();
    const yearOpts = (sel) => { const S = mhSeries(st.market); if (!S) return ''; let h = ''; for (let y = S.first; y <= S.last; y++) h += `<option value="${y}" ${y === sel ? 'selected' : ''}>${y}</option>`; return h; };
    el.innerHTML = `<div class="b09-mh">
      <div class="b09-mh-l">
        <div class="b09-mh-cap">${tm('capSel')}</div>
        <div class="b09-card b09-mh-sel">
          ${ddHTML({ id: 'mkt', items: MH_MARKETS.map((id) => tm('mk' + id)), value: MH_MARKETS.indexOf(st.market), w: ov ? 300 : 330 })}
          <span class="lb">${tm('lStart')}</span><select class="b09-sel" data-yr="start"></select>
          <span class="lb">${tm('lEnd')}</span><select class="b09-sel" data-yr="end"></select>
        </div>
        <div class="b09-mh-cap">${tm('capLim')}</div>
        <div class="b09-card b09-mh-lim">
          ${LIMS.map(([k, f, key]) => `<div class="b09-lim"><label><input type="checkbox" class="b09-chk" data-chk="is${k}">${tm(key)}</label>${inp(limSpec(f), st[f])}</div>`).join('')}
          <div class="b09-lim" data-divw="1"><label><input type="checkbox" class="b09-chk" data-chk="excludeDiv">${tm('limDiv')}</label></div>
        </div>
        <div class="b09-mh-caprow"><span>${tm('capStats')}</span><span>${tm('capAct')}</span><span>${tm('capLimd')}</span></div>
        <div class="b09-card b09-mh-stats" data-stats="1"></div>
        <div class="b09-mh-act">
          ${ov ? `<button type="button" class="st-pill" data-use="1">${tm('use')}</button>` : bridge.docButton(ctx, { data: () => sheet() })}
          <button type="button" class="b09-tlink" data-src="1" style="text-transform:none;letter-spacing:.01em;font-size:19px;font-weight:600">${tm('source')}</button>
        </div>
      </div>
      <div class="b09-mh-r">
        <h2 class="st-h3 b09-mh-title">${tm('title')}</h2>
        <div class="b09-scroll" data-tbl="1" style="min-height:0"></div>
      </div></div>`;
    const $ = (s) => el.querySelector(s), $$ = (s) => Array.from(el.querySelectorAll(s));
    const pct = (v) => fTxt(v, 2);
    function draw() {
      const S = mhSeries(st.market);
      $('[data-yr="start"]').innerHTML = yearOpts(st.start); $('[data-yr="end"]').innerHTML = yearOpts(st.end);
      $('[data-divw]').style.visibility = st.market === 'SP500T' ? 'visible' : 'hidden';
      LIMS.forEach(([k, f]) => { const i = $(`[data-in="${f}"]`); if (i) i.disabled = !st['is' + k]; });
      const r = S ? mhCompute(params()) : null;
      if (r) { st.start = r.start; st.end = r.end; }
      const v = (x, gold) => `<span class="v ${gold ? 'gold' : ''}">${x}</span>`;
      $('[data-stats]').innerHTML = r ? `
        <div class="b09-st"><span class="lb">${tm('stN')}</span>${v(N(r.n))}${v(N(r.n), true)}</div>
        <div class="b09-st"><span class="lb">${tm('stAvg')}</span>${v(N(pct(r.avgA)))}${v(N(pct(r.avgL)), true)}</div>
        <div class="b09-st"><span class="lb">${tm('stComp')}</span>${v(N(pct(r.compA)))}${v(N(pct(r.compL)), true)}</div>
        <div class="b09-st"><span class="lb"><span class="b09-amt num" data-amt="1">${m0(st.amount)}</span> ${tm('stGrowB')}</span>${v(N(m2(r.growA)))}${v(N(m2(r.growL)), true)}</div>`
        : `<div class="b09-mh-verify" style="min-height:220px">${tm('verify')}</div>`;
      const cols = ov ? 3 : 5;
      $('[data-tbl]').innerHTML = r ? `<table class="st-table b09-tbl"><thead><tr><th class="c" style="width:70px">${tm('cYear')}</th><th>${tm('cAnn')}</th><th>${tm('cLim')}</th>${ov ? '' : `<th><span class="num">${m0(st.amount)}</span> ${tm('cInvB')}</th><th>${tm('cLimInv')}</th>`}</tr></thead>
        <tbody>${r.rows.map((x) => `<tr><td class="c">${x.year}</td><td class="${x.act < 0 ? 'neg' : ''}">${pct(x.act)}</td><td class="${x.lim < 0 ? 'neg' : ''}">${pct(x.lim)}</td>${ov ? '' : `<td>${m2(x.ag)}</td><td>${m2(x.lg)}</td>`}</tr>`).join('')}</tbody></table>`
        : `<div class="b09-mh-verify" data-cols="${cols}">${tm('srcNone')}</div>`;
      const a = $('[data-amt]'); if (a) a.addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) amountDialog(); });
      refresh(el);
    }
    function sheet() {
      const r = mhCompute(params()); if (!r) return null;
      return {
        heading: tm('wsTitle'), size: 'medium', disclosures: ['past', 'hypothetical', 'license'],
        columns: [
          { field: 'year', header: tm('cYear'), type: 'year' },
          { field: 'act', header: tm('cAnn'), type: 'pct', dp: 2 },
          { field: 'lim', header: tm('cLim'), type: 'pct', dp: 2 },
          { field: 'ag', header: `<span class="num">${m0(st.amount)}</span> ${tm('cInvB')}`, type: 'money', dp: 2 },
          { field: 'lg', header: tm('cLimInv'), type: 'money', dp: 2 }
        ],
        rows: r.rows.map((x) => ({ year: x.year, act: x.act, lim: x.lim, ag: x.ag, lg: x.lg }))
      };
    }
    function amountDialog() {
      const asp = { id: 'amount', type: 'money', min: 0 }, tmp = { amount: st.amount };
      const m = modal(ctx, {
        title: tm('amtTitle'), width: 640,
        body: `<div class="b09-frow" style="border:0"><span class="lb">${tm('amtLabel')}</span>${inp(asp, st.amount)}</div>`,
        buttons: [{ html: tm('amtGo'), onClick: (close) => { st.amount = parseIn(asp, m.querySelector('[data-in="amount"]').value, tmp.amount); close(); draw(); } }]
      });
      bindIn(m, [asp], tmp, () => {});
      setTimeout(() => { try { m.querySelector('[data-in="amount"]').focus(); } catch (e) { /* ignore */ } }, 60);
    }
    function sourcesDialog() {
      const srcs = (EFA.data && EFA.data.sources) || {};
      const rows = MH_MARKETS.map((id) => {
        const S = mhSeries(id);
        let body;
        if (!S) body = tm('srcNone');
        else {
          const recs = S.keys.map((k) => srcs['history.' + k] || srcs['history.' + k.split('.')[0]] || null).filter(Boolean);
          body = recs.map((s) => `${U.esc(s.publisher || '')}${s.title ? ': ' + U.esc(s.title) : ''}${s.url ? `<span class="u">${U.esc(s.url)}</span>` : ''}`).join('<br>')
            + `<span class="u">${tm('srcCover')} <span class="num">${S.first}-${S.last}</span></span>`;
        }
        return `<div class="b09-src-row"><span class="k">${tm('mk' + id)}</span><span class="t">${body}</span></div>`;
      }).join('');
      modal(ctx, { title: tm('srcTitle'), width: 1080, body: `<div class="b09-src">${rows}</div>`, buttons: [{ html: tm('srcOk') }] });
    }
    // wiring
    ddBind(el, 'mkt', (i) => { st.market = MH_MARKETS[i]; resetYears(); draw(); });
    $$('[data-yr]').forEach((s) => {
      s.addEventListener('change', () => { st[s.dataset.yr] = +s.value; draw(); });
      s.addEventListener('keydown', (e) => e.stopPropagation());
    });
    $$('[data-chk]').forEach((c) => c.addEventListener('change', () => { if (EFA.edit && EFA.edit.on) { c.checked = !c.checked; return; } st[c.dataset.chk] = c.checked; draw(); }));
    bindIn(el, LIMS.map(([, f]) => limSpec(f)), st, () => draw());
    ctx.on(el.querySelector('[data-src]'), 'click', sourcesDialog);
    const use = el.querySelector('[data-use]');
    if (use) ctx.on(use, 'click', () => { const r = mhCompute(params()); if (r && opts.onUse) opts.onUse(r.limited.slice()); });
    draw();
    return { draw, state: st, compute: () => mhCompute(params()) };
  }
  /** open the explorer in a large closable dialog (90% wide) with "Use Result" */
  function mhOpen(ctx, opts) {
    opts = opts || {};
    const m = modal(ctx, { title: opts.title || '', width: 1440, esc: true, closeX: true, body: '<div data-mhbox="1" style="height:700px"></div>', cls: 'b09-mhdlg' });
    m.querySelector('.b09-modal-b').style.overflow = 'visible';
    mhMount(ctx, m.querySelector('[data-mhbox]'), { overlay: true, onUse: (list) => { m.close(); if (opts.onUse) opts.onUse(list); } });
    return m;
  }
  EFA.engines.marketHistory = {
    /** [{ id, available, first, last }] in list order */
    markets() { return MH_MARKETS.map((id) => { const S = mhSeries(id); return { id, available: !!S, first: S ? S.first : null, last: S ? S.last : null }; }); },
    series: mhSeries,
    compute: mhCompute,
    mount: mhMount,
    /** open(ctx, { title (HTML), onUse(list of limited annual returns as fractions) }) */
    open: mhOpen
  };

  EFA.screen('mh1', {
    title: 'Historical index returns explorer',
    copy: MH_COPY,
    render(ctx) {
      ctx.el.innerHTML = `<div data-mh="1" style="position:absolute;left:90px;right:90px;top:40px;height:752px"></div>
        <p class="st-disclaimer" style="position:absolute;left:90px;right:330px;top:812px;margin:0">${tm('disc')} ${bridge.disc(['past'])}</p>`;
      mhMount(ctx, ctx.$('[data-mh]'), { overlay: false });
    }
  });

  /* ------------------------------------------------------------------ */
  /* cvss1: steady compounding vs speculative returns                    */
  /* ------------------------------------------------------------------ */
  EFA.css('b09v', `
  .b09-cv-bar { position: absolute; left: 230px; right: 230px; top: 772px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; align-items: center; justify-items: center; }
  .b09-cv-bar .st-pill { min-width: 170px; }
  .b09-cv-in { position: absolute; left: 440px; width: 720px; top: 210px; padding: 14px 34px; }
  .b09-cv-in .b09-frow > .lb { flex: 0 0 70%; }
  .b09-cv-tg { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #b8972e; background: #0d1e3a; padding: 0; cursor: pointer; flex: 0 0 auto; box-shadow: 0 3px 8px rgba(13,30,58,.2); }
  .b09-cv-tg.off { background: #fff; }
  .b09-cv-tbl { position: absolute; left: 190px; right: 190px; top: 150px; max-height: 600px; }
  .stage .b09-cv-tbl td.ed { color: #8a6e22; cursor: pointer; text-decoration: underline dotted #b8972e; text-underline-offset: 4px; }
  .stage .b09-cv-tbl td.ed:hover { background: #f0e6c4 !important; }
  .stage .b09-cv-tbl td.ed.neg { color: #8a4b2e; }
  .b09-cv-q { position: absolute; left: 150px; right: 150px; top: 170px; display: grid; gap: 22px; }
  .b09-cv-qrow { display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 18px; }
  .b09-cv-qrow .b09-box { font-size: 30px; line-height: 1.35; padding: 22px 30px; }
  .b09-cv-ans { justify-self: center; min-width: 320px; text-align: center; background: linear-gradient(135deg, #d5bd68, #b8972e); color: #0d1e3a; border-radius: 14px; padding: 16px 30px; font: 700 40px/1.1 "DM Sans", sans-serif; box-shadow: 0 12px 26px rgba(13,30,58,.14); }
  .b09-cv-g { position: absolute; left: 150px; top: 140px; width: 1300px; height: 610px; }
  .b09-cv-leg { position: absolute; left: 120px; top: 22px; display: grid; gap: 8px; background: rgba(255,253,248,.95); border: 1px solid #d6cfc4; border-radius: 12px; padding: 12px 18px; box-shadow: 0 8px 20px rgba(13,30,58,.08); font: 700 19px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b09-cv-leg span { display: flex; align-items: center; gap: 12px; }
  .b09-cv-tip { position: absolute; pointer-events: none; background: #0d1e3a; color: #f7f5f1; font: 600 17px/1.2 "DM Sans", sans-serif; padding: 8px 12px; border-radius: 8px; white-space: nowrap; transform: translate(-50%, -130%); }
  .b09-cv-dlg .b09-frow > .lb { flex: 1; }
  `);
  /** cvss1 math, exactly as specified; rows: [{c, s}] returns as fractions */
  function cvRecalc(st) {
    const first = st.lump ? st.initBal : st.annual;
    st.rows.forEach((r, k) => {
      const prev = st.rows[k - 1];
      const cs = k === 0 ? first : prev.cE + (st.lump ? 0 : st.annual);
      const ss = k === 0 ? first : prev.sE + (st.lump ? 0 : st.annual);
      r.cE = cs * (1 + r.c); r.sE = ss * (1 + r.s); r.d = r.cE - r.sE;
    });
  }
  function cvBuild(st) {
    st.rows = [];
    for (let k = 0; k < Math.max(0, Math.round(st.years)); k++) st.rows.push({ c: st.ror / 100, s: st.ror / 100 });
    cvRecalc(st);
  }
  /** loss-recovery questions; returns {ok, reason ('a' | 'b'), target, base, best, ans1, ans2} */
  function cvQuestions(st) {
    const R = st.rows, Y = R.length;
    let e = 0; R.forEach((r, k) => { if (r.s < 0) e = k + 1; });
    if (!e || e === Y) return { ok: false, reason: 'a' };
    let best = Math.max(...R.slice(0, e).map((r) => r.s));
    if (!(best > 0) || best > 0.12) best = 0.12;   // spec: 0 or above 12% -> 12%; a negative best is treated the same way
    if (!(R[e].sE > 0) || !(R[e - 1].sE > 0)) return { ok: false, reason: 'b' };
    const target = R[Y - 1].cE, base = R[e - 1].sE, n = Y - e;
    const ratio = target / base;
    const ans1 = Math.round((Math.pow(ratio, 1 / n) - 1) * 100 * 100) / 100;
    const ans2 = ratio > 0 ? Math.round(Math.log(ratio) / Math.log(1 + best)) : 0;
    return { ok: true, e, target, base, best, n, ans1, ans2 };
  }
  /** "Yes" in the conditions dialog: sample returns with gains first and one deep loss mid-way */
  function cvExample(st) {
    const Y = st.rows.length, mid = Math.ceil(Y / 2) - 1;
    let x = st.dlgRate / 100;
    for (let j = 0; j < Y; j++) {
      const r = st.rows[j];
      r.c = x; r.s = x;
      if (j === 0) r.s = 0.10; else if (j === 1) r.s = 0.11; else if (j === mid) r.s = -0.50;
      x = Math.round((x + 0.01) * 1e6) / 1e6; if (x > 0.12) x = 0.05;
    }
    cvRecalc(st);
  }
  EFA.engines.compoundingVsSpeculation = { recalc: cvRecalc, build: cvBuild, questions: cvQuestions, example: cvExample };

  EFA.screen('cvss1', {
    title: 'Steady compounding vs speculation',
    steps: 1,
    copy: {
      head: 'Steady Growth Beats Big Swings',
      lInit: 'Initial Balance', lAnnual: 'Annual Contribution', lRor: 'Rate of Return', lYears: 'Years to Project',
      tgAria: 'Switch between an initial balance and an annual contribution',
      calc: 'Calculate', results: 'Results', inputs: 'Inputs', shuffle: 'Shuffle', questions: 'Questions', graph: 'Graph',
      hYear: 'Year', hCRor: 'Compounding ROR', hCBal: 'Compounding EOY Balance', hSRor: 'Speculation ROR', hSBal: 'Speculation EOY Balance', hDiff: 'Difference',
      serC: 'Compounding', serS: 'Speculation',
      q1a: 'What yearly return would this account need to climb back to the steady account\'s balance of', q1b: '?',
      q2a: 'If it earned', q2b: 'a year, its best return before the last loss, how long until it reaches', q2c: '?',
      yrs: 'years',
      eRate: 'Interest Rate', eYears: '# of Years', eInfl: 'Inflate', eCancel: 'Cancel', eMarket: 'Market History', eEnter: 'Enter',
      mTitle: 'Historical Market Returns',
      cTitle: 'The questions need a loss to work with',
      cA: 'The recovery questions need at least one negative Speculation return somewhere before the final year. Would you like sample returns filled in for you? Choose Yes for sample returns, or No to edit the returns by hand. Either way, press Questions again afterwards.',
      cB: 'The Speculation balance has to stay above zero in the year after its last loss. Please change the returns and try again.',
      cNo: 'No', cYes: 'Yes', cOk: 'Ok',
      wsTitle: 'Compounding vs. Speculation',
      disc: 'Returns are hypothetical; historical and "limited" index returns do not predict future results, and an index cannot be invested in directly.',
      _notes: 'Two accounts can show the same average return and end up far apart. A loss hurts more than an equal gain helps.\n\n- Calculate, then click any Speculation ROR to type a loss, or load real market years with Market History.\n- Press Questions and reveal each answer.\n- Ask: How many good years would it take to make up for one bad one, right before you retire?\nPAUSE'
    },
    render(ctx) {
      const def = EFA.screens.cvss1;
      def.steps = 1;
      const st = { lump: true, initBal: 50000, annual: 5000, ror: 5, years: 5, dlgRate: 5, dlgYears: 99, dlgInflate: 0, view: 'inputs', q: null, legend: true, rows: [] };
      cvBuild(st);
      ctx._cv = st;
      const sp = { initBal: { id: 'initBal', type: 'money', min: 0 }, annual: { id: 'annual', type: 'money', min: 0 }, ror: { id: 'ror', type: 'pct', dp: 2, max: 12 }, years: { id: 'years', type: 'int', dp: 0, min: 1, max: 100 } };
      ctx.el.innerHTML = `
        <div class="b09-head" style="top:38px"><h1 class="st-h1" style="font-size:56px">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b09-view" data-v="inputs">
          <div class="b09-card b09-cv-in">
            <div class="b09-frow"><span class="lb" data-amtlab="1"></span><span style="display:flex;align-items:center;gap:14px"><button type="button" class="b09-cv-tg" data-tg="1" aria-label="${U.esc(ctx.text('tgAria'))}"></button><span data-amtin="1"></span></span></div>
            <div class="b09-frow"><span class="lb">${ctx.t('lRor')}</span>${inp(sp.ror, st.ror)}</div>
            <div class="b09-frow"><span class="lb">${ctx.t('lYears')}</span>${inp(sp.years, st.years)}</div>
          </div>
          <button type="button" class="st-pill b09-calc" data-calc="1" style="top:520px">${ctx.t('calc')}</button>
        </div>
        <div class="b09-view" data-v="results" hidden><div class="b09-scroll b09-cv-tbl" data-tbl="1"></div></div>
        <div class="b09-view" data-v="questions" hidden><div class="b09-cv-q" data-q="1"></div></div>
        <div class="b09-view" data-v="graph" hidden><div class="b09-cv-g" data-g="1"></div></div>
        <div class="b09-cv-bar">
          <button type="button" class="st-pill" data-nav="results">${ctx.t('results')}</button>
          <button type="button" class="st-pill b09-ghost" data-nav="shuffle">${ctx.t('shuffle')}</button>
          <button type="button" class="st-pill b09-ghost" data-nav="questions">${ctx.t('questions')}</button>
          <button type="button" class="st-pill b09-ghost" data-nav="graph">${ctx.t('graph')}</button>
          <span data-print="1">${bridge.docButton(ctx, { data: () => sheet(), look: 'pill' })}</span>
        </div>
        ${discLine(ctx, ['disc'], ['hypothetical'], 'position:absolute;left:110px;right:330px;top:846px')}`;
      const amtRow = () => {
        const id = st.lump ? 'initBal' : 'annual';
        ctx.$('[data-amtlab]').innerHTML = ctx.t(st.lump ? 'lInit' : 'lAnnual');
        ctx.$('[data-amtin]').innerHTML = inp(sp[id], st[id]);
        ctx.$('[data-tg]').classList.toggle('off', !st.lump);
        bindIn(ctx.$('[data-amtin]'), [sp[id]], st, () => { cvBuild(st); paint(); });
        refresh(ctx.$('[data-amtlab]'));
      };
      const pct = (v) => fTxt(v, 2);
      function table() {
        ctx.$('[data-tbl]').innerHTML = `<table class="st-table b09-tbl"><thead><tr><th class="c" style="width:90px">${ctx.t('hYear')}</th><th>${ctx.t('hCRor')}</th><th>${ctx.t('hCBal')}</th><th>${ctx.t('hSRor')}</th><th>${ctx.t('hSBal')}</th><th>${ctx.t('hDiff')}</th></tr></thead>
          <tbody>${st.rows.map((r, k) => `<tr><td class="c">${k + 1}</td><td class="ed ${r.c < 0 ? 'neg' : ''}" data-ed="c${k}">${pct(r.c)}</td><td>${m0(r.cE)}</td><td class="ed ${r.s < 0 ? 'neg' : ''}" data-ed="s${k}">${pct(r.s)}</td><td>${m0(r.sE)}</td><td>${m0(r.d)}</td></tr>`).join('')}</tbody></table>`;
        ctx.$$('[data-ed]').forEach((td) => ctx.on(td, 'click', () => editDialog(td.dataset.ed[0], +td.dataset.ed.slice(1))));
        refresh(ctx.$('[data-tbl]'));
      }
      function chart() {
        const box = ctx.$('[data-g]'), W = 1300, H = 610, pad = { l: 120, r: 40, t: 30, b: 60 };
        const n = st.rows.length; if (!n) { box.innerHTML = ''; return; }
        const all = st.rows.flatMap((r) => [r.cE, r.sE]);
        let lo = Math.min(0, ...all), hi = Math.max(...all); if (hi === lo) hi = lo + 1;
        const step = Math.pow(10, Math.floor(Math.log10((hi - lo) / 5))); const nice = [1, 2, 2.5, 5, 10].map((m) => m * step).find((s) => (hi - lo) / s <= 6) || step * 10;
        lo = Math.floor(lo / nice) * nice; hi = Math.ceil(hi / nice) * nice;
        const X = (i) => pad.l + (n === 1 ? (W - pad.l - pad.r) / 2 : i * (W - pad.l - pad.r) / (n - 1));
        const Yv = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - lo) / (hi - lo));
        let g = '';
        for (let v = lo; v <= hi + 1e-9; v += nice) g += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${Yv(v)}" y2="${Yv(v)}" stroke="${P.rule}" stroke-width="1"/><text x="${pad.l - 14}" y="${Yv(v) + 6}" text-anchor="end" font-family="DM Sans, sans-serif" font-size="17" fill="#667389">${m0(v)}</text>`;
        const every = Math.max(1, Math.ceil(n / 30));
        st.rows.forEach((r, i) => { if (i % every === 0 || i === n - 1) g += `<text x="${X(i)}" y="${H - pad.b + 30}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="16" fill="#667389">${i + 1}</text>`; });
        const line = (key, c) => `<path d="${st.rows.map((r, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Yv(r[key]).toFixed(1)}`).join('')}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
        const circ = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="${P.navy}" stroke="#fff" stroke-width="2.5"/>`;
        const tri = (x, y) => `<path d="M${x},${y - 9} L${x + 8.5},${y + 6} L${x - 8.5},${y + 6} Z" fill="${P.gold}" stroke="#fff" stroke-width="2"/>`;
        let marks = '';
        st.rows.forEach((r, i) => {
          marks += `<g data-pt="c${i}">${circ(X(i), Yv(r.cE))}<circle cx="${X(i)}" cy="${Yv(r.cE)}" r="16" fill="transparent"/></g>`;
          marks += `<g data-pt="s${i}">${tri(X(i), Yv(r.sE))}<circle cx="${X(i)}" cy="${Yv(r.sE)}" r="16" fill="transparent"/></g>`;
        });
        box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;overflow:visible" aria-hidden="true">${g}${line('cE', P.navy)}${line('sE', P.gold)}${marks}</svg>
          <div class="b09-cv-leg" ${st.legend ? '' : 'hidden'}><span><svg width="34" height="16" viewBox="0 0 34 16"><path d="M2 8H32" stroke="${P.navy}" stroke-width="4"/><circle cx="17" cy="8" r="6" fill="${P.navy}"/></svg>${ctx.t('serC')}</span><span><svg width="34" height="18" viewBox="0 0 34 18"><path d="M2 9H32" stroke="${P.gold}" stroke-width="4"/><path d="M17,2 L24,14 L10,14 Z" fill="${P.gold}"/></svg>${ctx.t('serS')}</span></div>
          <div class="b09-cv-tip" hidden></div>`;
        const tip = box.querySelector('.b09-cv-tip');
        box.querySelectorAll('[data-pt]').forEach((p) => {
          const k = p.dataset.pt[0], i = +p.dataset.pt.slice(1), r = st.rows[i];
          p.addEventListener('mouseenter', () => { tip.hidden = false; tip.innerHTML = `${ctx.t(k === 'c' ? 'serC' : 'serS')}: ${N(m0(k === 'c' ? r.cE : r.sE))}`; tip.style.left = X(i) + 'px'; tip.style.top = Yv(k === 'c' ? r.cE : r.sE) + 'px'; refresh(tip); });
          p.addEventListener('mouseleave', () => { tip.hidden = true; });
        });
        box.querySelector('svg').addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; st.legend = !st.legend; box.querySelector('.b09-cv-leg').hidden = !st.legend; });
        refresh(box);
      }
      function questionsView() {
        const q = st.q;
        ctx.$('[data-q]').innerHTML = `
          <div class="b09-cv-qrow b09-f is-off" data-qs="0"><span>${bridge.dart(110)}</span><div class="b09-box">${ctx.t('q1a')} ${N(m0(q.target))}${ctx.t('q1b')}</div></div>
          <div class="b09-cv-ans b09-f is-off" data-qs="1">${N(String(+q.ans1.toFixed(2)) + '%')}</div>
          <div class="b09-cv-qrow b09-f is-off" data-qs="2"><span>${bridge.dart(110)}</span><div class="b09-box">${ctx.t('q2a')} ${N(pTxt(q.best * 100, 2))} ${ctx.t('q2b')} ${N(m0(q.target))}${ctx.t('q2c')}</div></div>
          <div class="b09-cv-ans b09-f is-off" data-qs="3">${N(q.ans2)} ${ctx.t('yrs')}</div>`;
        refresh(ctx.$('[data-q]'));
      }
      function setView(v) {
        st.view = v;
        ctx.$$('[data-v]').forEach((e) => { e.hidden = e.dataset.v !== v; });
        const b = (k) => ctx.$(`[data-nav="${k}"]`);
        b('results').innerHTML = ctx.t(v === 'results' ? 'inputs' : 'results');
        ['shuffle', 'questions', 'graph'].forEach((k) => { b(k).style.visibility = v === 'inputs' ? 'hidden' : 'visible'; });
        ctx.$('[data-print]').style.visibility = v === 'results' ? 'visible' : 'hidden';
        if (v !== 'questions' && def.steps !== 1) { def.steps = 1; ctx.goStep(0); }
        refresh(ctx.$('.b09-cv-bar'));
      }
      function paint() {
        if (st.view === 'results') table();
        if (st.view === 'graph') chart();
      }
      function conditions(reason) {
        const m = modal(ctx, {
          title: ctx.t('cTitle'), width: 760,
          body: `<p style="margin:0">${ctx.t(reason === 'a' ? 'cA' : 'cB')}</p>`,
          buttons: reason === 'a'
            ? [{ key: 'cNo', ghost: true }, { key: 'cYes', onClick: (close) => { cvExample(st); close(); setView('results'); table(); } }]
            : [{ key: 'cOk' }]
        });
        return m;
      }
      function runQuestions() {
        const q = cvQuestions(st);
        if (!q.ok) { conditions(q.reason); return; }
        st.q = q;
        questionsView();
        setView('questions');
        def.steps = 4; ctx.goStep(0);
      }
      function editDialog(col, k) {
        const esp = { rate: { id: 'dlgRate', type: 'pct', dp: 2 }, yrs: { id: 'dlgYears', type: 'int', dp: 0, min: 1 }, inf: { id: 'dlgInflate', type: 'pct', dp: 2 } };
        const tmp = { dlgRate: st.dlgRate, dlgYears: st.dlgYears, dlgInflate: st.dlgInflate };
        const m = modal(ctx, {
          title: null, width: 660, cls: 'b09-cv-dlg',
          body: `<div class="b09-frow"><span class="lb">${ctx.t('eRate')}</span>${inp(esp.rate, tmp.dlgRate)}</div>
            <div class="b09-frow"><span class="lb">${ctx.t('eYears')}</span>${inp(esp.yrs, tmp.dlgYears)}</div>
            <div class="b09-frow"><span class="lb">${ctx.t('eInfl')}<button type="button" class="b09-dot" data-infl="1" aria-label="${U.esc(ctx.text('eInfl'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17.5l5.2-5.2 3.6 3.1L20 8"/><path d="M14.6 8H20v5.4"/></svg></button></span>${inp(esp.inf, tmp.dlgInflate)}</div>`,
          buttons: [
            { key: 'eCancel', ghost: true },
            { key: 'eMarket', ghost: true, onClick: (close) => {
              mhOpen(ctx, { title: ctx.t('mTitle'), onUse: (list) => {
                for (let j = 0; j < list.length && k + j < st.rows.length; j++) st.rows[k + j][col] = list[j];
                cvRecalc(st); close(); setView('results'); table();
              } });
            } },
            { key: 'eEnter', onClick: (close) => {
              ['dlgRate', 'dlgYears', 'dlgInflate'].forEach((id) => { const o = Object.values(esp).find((x) => x.id === id); st[id] = parseIn(o, m.querySelector(`[data-in="${id}"]`).value, tmp[id]); });
              const count = Math.min(st.rows.length - k, Math.round(st.dlgYears));
              let rate = st.dlgRate / 100;
              for (let j = 0; j < count; j++) { st.rows[k + j][col] = rate; rate = rate * (1 + st.dlgInflate / 100); }
              cvRecalc(st); close(); table();
            } }
          ]
        });
        bindIn(m, Object.values(esp), tmp, () => {});
        ctx.on(m.querySelector('[data-infl]'), 'click', () => {
          bridge.inflationOpen(ctx, (f) => { tmp.dlgInflate = +(f * 100).toFixed(2); setIn(m, esp.inf, tmp.dlgInflate); });
        });
      }
      function sheet() {
        return {
          heading: ctx.t('wsTitle'), size: 'medium',
          columns: wsCols(ctx, [['year', 'hYear', 'year'], ['c', 'hCRor', 'pct', 2], ['cE', 'hCBal', 'money', 0], ['s', 'hSRor', 'pct', 2], ['sE', 'hSBal', 'money', 0], ['d', 'hDiff', 'money', 0]]),
          rows: st.rows.map((r, k) => ({ year: k + 1, c: r.c, cE: r.cE, s: r.s, sE: r.sE, d: r.d }))
        };
      }
      amtRow();
      bindIn(ctx.el, [sp.ror, sp.years], st, () => { cvBuild(st); paint(); if (st.view === 'questions') setView('results'); });
      bridge.guard(ctx, '[data-in="ror"]');
      ctx.on(ctx.$('[data-tg]'), 'click', () => { st.lump = !st.lump; amtRow(); });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { cvRecalc(st); setView('results'); table(); });
      ctx.on(ctx.$('[data-nav="results"]'), 'click', () => { if (st.view === 'results') setView('inputs'); else { cvRecalc(st); setView('results'); table(); } });
      ctx.on(ctx.$('[data-nav="shuffle"]'), 'click', () => {
        const R = st.rows; if (!R.length) return;
        const last = R[R.length - 1].s;
        for (let k = R.length - 1; k > 0; k--) R[k].s = R[k - 1].s;
        R[0].s = last; cvRecalc(st);
        if (st.view === 'questions') { setView('results'); table(); } else paint();
      });
      ctx.on(ctx.$('[data-nav="questions"]'), 'click', runQuestions);
      ctx.on(ctx.$('[data-nav="graph"]'), 'click', () => { setView('graph'); chart(); });
      setView('inputs');
    },
    step(ctx, n) {
      const st = ctx._cv; if (!st) return;
      if (st.view !== 'questions') { if (n > 0) ctx.goStep(0); return; }
      ctx.$$('[data-qs]').forEach((e) => ctx.show(e, n >= +e.dataset.qs));
    },
    leave(ctx) { EFA.screens.cvss1.steps = 1; }
  });



  /* ------------------------------------------------------------------ */
  /* mm5: wealth transfers happen either way                              */
  /* ------------------------------------------------------------------ */
  EFA.css('b09b', `
  .b09-brow { display: grid; grid-template-columns: 124px 1fr; align-items: center; gap: 22px; }
  .b09-brow .bul { display: grid; place-items: center; }
  .b09-split { display: grid; grid-template-columns: 22% 1fr; align-items: center; padding: 22px 30px; }
  .b09-split .k { font: 700 22px/1.25 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6e22; }
  .b09-split .x { padding-left: 2em; font: 700 27px/1.38 "DM Sans", sans-serif; color: #0d1e3a; border-left: 2px solid #f0e6c4; }
  .b09-qbox { padding: 22px 30px; display: grid; gap: 10px; }
  .b09-qbox .top { font: 700 29px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b09-qbox .sub { padding-left: 2em; font: 600 25px/1.4 "DM Sans", sans-serif; color: #2b4c80; }
  .b09-why { position: absolute; left: 240px; width: 1120px; display: grid; gap: 0; }
  .b09-why .pr { display: grid; grid-template-columns: 96px 1fr; align-items: center; gap: 20px; }
  .b09-why .pr .b09-box { font-size: 29px; }
  .b09-why .an { height: 102px; display: flex; justify-content: flex-start; align-items: flex-start; padding-left: 260px; margin-top: -5px; }
  .b09-why .an .b09-ans { background: linear-gradient(135deg, #d5bd68, #b8972e); color: #0d1e3a; border-radius: 14px; padding: 16px 30px; font: 700 29px/1.25 "DM Sans", sans-serif; box-shadow: 0 12px 26px rgba(13,30,58,.14); }
  `);
  EFA.screen('mm5', {
    title: 'Wealth transfers happen either way',
    copy: {
      head: 'However you pay for your home,\nsome of your wealth leaves your hands.',
      k1: 'Financing', x1: 'You pay interest to the lender for the use of its money.',
      k2: 'Paying Cash', x2: 'You avoid paying interest, yet you give up the interest that money could have earned. Once it is in the house, it earns nothing.',
      close: 'Seeing where a mortgage leaks wealth\nhelps you avoid losses you don’t need to take.',
      _notes: 'Borrowing costs interest. Paying cash costs the growth that cash could have earned. Either way, money leaves.\n\n- Ask: Which of these two costs has anyone ever shown you in dollars?\nPAUSE\n\n- The question is never whether wealth transfers, only how much and to whom.'
    },
    render(ctx) {
      const row = (k) => `<div class="b09-brow"><span class="bul">${bridge.dart(120)}</span><div class="b09-box b09-split"><span class="k">${ctx.t('k' + k)}</span><span class="x">${ctx.t('x' + k)}</span></div></div>`;
      ctx.el.innerHTML = `<div class="b09-head"><h1 class="st-h1 two">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div style="position:absolute;left:150px;right:150px;top:262px;display:grid;gap:40px">${row(1)}${row(2)}</div>
        <p style="position:absolute;left:110px;right:110px;top:648px;margin:0;text-align:center;font:600 42px/1.25 'Cormorant Garamond',Georgia,serif;color:${P.navy}">${ctx.t('close')}</p>`;
    }
  });

  /* ------------------------------------------------------------------ */
  /* mm8: the lender gains as you build equity; opportunity cost         */
  /* ------------------------------------------------------------------ */
  EFA.screen('mm8', {
    title: 'Equity and opportunity cost',
    copy: {
      head: 'The lender gains as your equity builds. You hand over\nprincipal as well as interest: dollars that could have been\ninvested and compounding for you.',
      t1: 'What does “opportunity cost” mean for you?', s1a: '… is your down payment earning anything right now?', s1b: '… could you reach that money the day you needed it?',
      t2: 'How much would your down payment be worth today if you had invested it instead?', s2a: '… that difference is what you gave up.',
      _notes: 'Every dollar of equity is a dollar that stopped working for you and started sitting in the walls.\n\n- Ask: Is your down payment earning anything today? Could you reach it if you needed it tomorrow?\nPAUSE\n\n- The next screen puts a number on that question.'
    },
    render(ctx) {
      const box = (top, subs) => `<div class="b09-box b09-qbox"><span class="top">${ctx.t(top)}</span>${subs.map((k) => `<span class="sub">${ctx.t(k)}</span>`).join('')}</div>`;
      ctx.el.innerHTML = `<div class="b09-head" style="top:44px"><h1 class="st-h1" style="font-size:46px;line-height:1.2">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div style="position:absolute;left:200px;right:200px;top:300px;display:grid;gap:36px">
          <div class="b09-brow"><span class="bul">${bridge.dart(120)}</span>${box('t1', ['s1a', 's1b'])}</div>
          <div class="b09-brow"><span class="bul">${bridge.dart(120)}</span>${box('t2', ['s2a'])}</div>
        </div>`;
    }
  });

  /* ------------------------------------------------------------------ */
  /* mm12: why people pick a 15-year mortgage                            */
  /* ------------------------------------------------------------------ */
  EFA.screen('mm12', {
    title: 'Why people pick a 15-year mortgage',
    steps: 4,
    copy: {
      head: 'Why do people choose a 15-year mortgage\nover a 30-year mortgage?',
      p1: 'The most common reason is…', a1: 'the interest they expect to save.',
      p2: 'The common belief is…', a2: 'a shorter loan makes borrowing cheaper.',
      p3: 'Taken all the way, that reasoning says the best choice is…', a3: 'buying the home outright with cash.',
      _notes: 'Follow the logic of the 15-year loan to its end and it says to pay cash, which we have already seen gives up growth and control.\n\n- Click forward to reveal each answer.\n- Ask: If less interest were the whole story, why would anyone ever borrow at all?\nPAUSE'
    },
    render(ctx) {
      const grp = (k) => `<div class="pr"><span>${bridge.dart(96)}</span><div class="b09-box">${ctx.t('p' + k)}</div></div>
        <div class="an"><span class="b09-ans b09-f b09-f0 is-off" data-a="${k}">${ctx.t('a' + k)}</span></div>`;
      ctx.el.innerHTML = `<div class="b09-head"><h1 class="st-h1 two">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b09-why" style="top:236px">${grp(1)}${grp(2)}${grp(3)}</div>`;
    },
    step(ctx, n) { ctx.$$('[data-a]').forEach((e) => ctx.show(e, n >= +e.dataset.a)); }
  });

  /* ------------------------------------------------------------------ */
  /* tank-model engines: down payment (mdp1), extra payments (mep1),     */
  /* how long to finance (mhl1), two mortgages incl. interest-only (cmp1) */
  /* ------------------------------------------------------------------ */
  const zero = (x) => (Math.abs(x) < 0.0049 ? 0 : x);
  /** FVend(i, n, p, pv) = pv(1+i)^n + p((1+i)^n - 1)/i (p * n when i = 0) */
  const fvEnd = (i, n, p, pv) => (i === 0 ? pv + p * n : pv * Math.pow(1 + i, n) + p * (Math.pow(1 + i, n) - 1) / i);
  /** mdp1: down payment kept in the tanks vs paid into the house */
  function mdpModel(o) {
    const term = o.term || 360, d = o.downPct / 100;
    const L0 = o.house * (1 - d), R0 = o.house * d, S0 = R0;
    const iL = o.loanRate / 1200, iR = o.riskRate / 1200, iS = o.safeRate / 1200, iH = o.apprRate / 1200;
    const pay = pmt(iL, term, L0);
    // the original adds the down fraction d as a monthly deposit in FVend; it is negligible and left out here
    const ref = Math.max(1e6, o.house * Math.pow(1 + iH, term), fvEnd(iR, term, 0, R0), fvEnd(iS, term, 0, S0));
    const rows = [{ loan: L0, risk: R0, safe: S0, house: o.house, payment: 0, riskE: R0 * (1 + iR), safeE: S0 * (1 + iS), houseE: o.house * (1 + iH) }];
    let loanEnd = L0, riskEnd = rows[0].riskE, safeEnd = rows[0].safeE, houseEnd = rows[0].houseE;
    for (let m = 1; m <= term; m++) {
      const ls = loanEnd, grown = ls * (1 + iL);
      let payment = 0;
      if (grown >= pay + d) { payment = pay; loanEnd = zero(ls - (pay - ls * iL)); }
      else if (ls > 0) { payment = Math.min(pay, grown); loanEnd = zero(ls - (payment - ls * iL)); }
      else { payment = 0; loanEnd = 0; }
      riskEnd *= (1 + iR); safeEnd *= (1 + iS); houseEnd *= (1 + iH);
      rows.push({ loan: loanEnd, risk: riskEnd, safe: safeEnd, house: houseEnd, payment });
    }
    const at = (m) => {
      m = Math.max(0, Math.min(term, Math.round(m)));
      const r = rows[m];
      return { m, risk: r.risk, safe: r.safe, loan: r.loan, house: r.house, outflow: m < term ? r.payment : 0 };
    };
    return { term, ref, pay, L0, R0, S0, rows, at, houseRef: o.house / ref * 100 };
  }
  /** mep1: the same extra amount onto the loan, into the safe tank, or into the risk tank */
  function mepModel(o, prevRef) {
    const term = Math.max(1, Math.round(o.term || 360));
    const iL = o.loanRate / 1200, iR = o.riskRate / 1200, iS = o.safeRate / 1200, iH = o.apprRate / 1200;
    const pay = pmt(iL, term, o.loanInit), W = pay + o.extra;
    const ref = Math.max(prevRef || 1e6, o.house * Math.pow(1 + iH, term), fvEnd(iR, term, o.extra, o.riskInit), fvEnd(iS, term, o.extra, o.safeInit));
    const r0 = { loan: o.loanInit, refLoan: o.loanInit, risk: o.riskInit * (1 + iR), refRisk: o.riskInit * (1 + iR), safe: o.safeInit * (1 + iS), refSafe: o.safeInit * (1 + iS), house: o.house * (1 + iH), req: 0, ext: 0, refReq: 0, c: 0 };
    const rows = [r0];
    let L = null, Fr = null, Fs = null;
    for (let m = 1; m <= term; m++) {
      const p = rows[m - 1], r = {};
      const start = p.loan, g = start * (1 + iL);
      if (g >= W) { r.req = pay; r.ext = o.extra; r.loan = zero(start - (r.req + r.ext - start * iL)); }
      else if (start > 0) { r.req = Math.min(pay, g); r.ext = g - r.req; r.loan = zero(start - (r.req + r.ext - start * iL)); }
      else { r.req = 0; r.ext = 0; r.loan = 0; }
      r.refReq = pay; r.refLoan = zero(p.refLoan - (pay - p.refLoan * iL));
      r.c = r.ext;
      r.risk = (p.risk + r.c) * (1 + iR); r.refRisk = p.refRisk * (1 + iR);
      r.safe = (p.safe + r.c) * (1 + iS); r.refSafe = p.refSafe * (1 + iS);
      r.house = p.house * (1 + iH);
      if (L == null && r.loan === 0) L = m;
      if (Fr == null && r.refLoan < r.risk) Fr = m;
      if (Fs == null && r.refLoan < r.safe) Fs = m;
      rows.push(r);
    }
    // a freedom point that never happens is placed at the end of the term
    L = L == null ? term : L; Fr = Fr == null ? term : Fr; Fs = Fs == null ? term : Fs;
    const at = (m, mode) => {
      m = Math.max(0, Math.min(term, Math.round(m)));
      const r = rows[m];
      if (mode === 'risk') return { m, risk: r.risk, safe: r.refSafe, house: r.house, loan: r.refLoan, outflow: r.refReq, contribution: r.c, total: r.risk + r.refSafe + r.house, diff: r.risk - o.riskInit };
      if (mode === 'safe') return { m, risk: r.refRisk, safe: r.safe, house: r.house, loan: r.refLoan, outflow: r.refReq, contribution: r.c, total: r.refRisk + r.safe + r.house, diff: r.safe - o.safeInit };
      return { m, risk: r.refRisk, safe: r.refSafe, house: r.house, loan: r.loan, outflow: r.req + r.ext, contribution: 0, total: 0, diff: 0 };
    };
    return { term, ref, pay, L, Fr, Fs, rows, at, houseRef: o.house / ref * 100 };
  }
  /** mhl1: pay cash vs finance 100% (no contributions; tank scale 2.5 x the house) */
  function mhlModel(o) {
    const term = Math.max(1, Math.round(o.term || 360));
    const iL = o.loanRate / 1200, iR = o.riskRate / 1200, iS = o.safeRate / 1200, iH = o.apprRate / 1200;
    const pay = pmt(iL, term, o.loanInit), ref = 2.5 * o.house;
    const rows = [{ loan: o.loanInit, riskS: o.riskInit, risk: o.riskInit * (1 + iR), safeS: o.safeInit, safe: o.safeInit * (1 + iS), houseS: o.house, house: o.house * (1 + iH), req: 0 }];
    for (let m = 1; m <= term; m++) {
      const p = rows[m - 1], r = {};
      const start = p.loan, g = start * (1 + iL);
      if (start > 0 && g >= pay) { r.req = pay; r.loan = zero(start - (pay - start * iL)); }
      else if (start > 0) { r.req = Math.min(pay, g); r.loan = zero(start - (r.req - start * iL)); }
      else { r.req = 0; r.loan = 0; }
      r.risk = p.risk * (1 + iR); r.safe = p.safe * (1 + iS); r.house = p.house * (1 + iH);
      rows.push(r);
    }
    const at = (m) => {
      m = Math.max(0, Math.min(term, Math.round(m)));
      const r = rows[m];
      return m === 0 ? { m, risk: r.riskS, safe: r.safeS, house: r.houseS, loan: r.loan, outflow: 0 }
        : { m, risk: r.risk, safe: r.safe, house: r.house, loan: r.loan, outflow: m < term ? r.req : 0 };
    };
    return { term, ref, pay, rows, at, houseRef: o.house / ref * 100 };
  }
  /** cmp1: mortgages A and B (conventional or interest-only) and where the monthly extra goes */
  function cmpModel(o, prevRef) {
    const sel = o.selected === 'B' ? 'B' : 'A';
    const M = { A: o.A, B: o.B };
    const payOf = (k) => { const x = M[k], i = x.rate / 1200; return x.io ? i * x.amount : pmt(i, Math.round(x.term), x.amount); };
    const pay = { A: payOf('A'), B: payOf('B') };
    const e = o.extra + (sel === 'B' ? pay.A - pay.B : 0);
    const N = Math.max(1, Math.round(M[sel].term));
    const iR = o.riskRate / 1200, iS = o.safeRate / 1200, iH = o.apprRate / 1200;
    const ref = Math.max(prevRef || 1e6, o.house * Math.pow(1 + iH, N), fvEnd(iR, N, e, o.riskInit), fvEnd(iS, N, e, o.safeInit));
    const loans = {};
    ['A', 'B'].forEach((k) => {
      const i = M[k].rate / 1200, W = pay[k] + e;   // each loan's own payment plus the extra (fix: the original tested B against A's payment)
      const rows = [{ loan: M[k].amount, ref: M[k].amount, req: 0, ext: 0 }];
      for (let m = 1; m <= N; m++) {
        const p = rows[m - 1], r = {};
        const start = p.loan, g = start * (1 + i);
        if (g >= W) { r.req = pay[k]; r.ext = e; r.loan = zero(start - (r.req + r.ext - start * i)); }
        else if (start > 0) { r.req = Math.min(pay[k], g); r.ext = g - r.req; r.loan = zero(start - (r.req + r.ext - start * i)); }
        else { r.req = 0; r.ext = 0; r.loan = 0; }
        r.ref = zero(p.ref - (pay[k] - p.ref * i));
        rows.push(r);
      }
      loans[k] = rows;
    });
    const S = loans[sel];
    const tanks = [{ risk: o.riskInit * (1 + iR), refRisk: o.riskInit * (1 + iR), safe: o.safeInit * (1 + iS), refSafe: o.safeInit * (1 + iS), house: o.house * (1 + iH), c: 0 }];
    let L = null, Fr = null, Fs = null;
    for (let m = 1; m <= N; m++) {
      const p = tanks[m - 1], c = S[m].ext;
      const t = { c, risk: (p.risk + c) * (1 + iR), refRisk: p.refRisk * (1 + iR), safe: (p.safe + c) * (1 + iS), refSafe: p.refSafe * (1 + iS), house: p.house * (1 + iH) };
      tanks.push(t);
      if (L == null && S[m].loan === 0) L = m;
      if (Fr == null && S[m].ref < t.risk) Fr = m;
      if (Fs == null && S[m].ref < t.safe) Fs = m;
    }
    L = L == null ? N : L; Fr = Fr == null ? N : Fr; Fs = Fs == null ? N : Fs;
    const at = (m, mode) => {
      m = Math.max(0, Math.min(N, Math.round(m)));
      const t = tanks[m], l = S[m];
      if (mode === 'risk') return { m, risk: t.risk, safe: t.refSafe, house: t.house, loan: l.ref, outflow: m ? pay[sel] : 0, contribution: t.c, total: t.risk + t.refSafe + t.house, diff: t.risk - o.riskInit };
      if (mode === 'safe') return { m, risk: t.refRisk, safe: t.safe, house: t.house, loan: l.ref, outflow: m ? pay[sel] : 0, contribution: t.c, total: t.refRisk + t.safe + t.house, diff: t.safe - o.safeInit };
      return { m, risk: t.refRisk, safe: t.refSafe, house: t.house, loan: l.loan, outflow: l.req + l.ext, contribution: 0, total: 0, diff: 0 };
    };
    return { N, ref, pay, e, sel, L, Fr, Fs, loans, tanks, at, houseRef: o.house / ref * 100, diffPay: pay.A - pay.B };
  }
  EFA.engines.tankModels = { mdp: mdpModel, mep: mepModel, mhl: mhlModel, cmp: cmpModel, fvEnd };


  /* ------------------------------------------------------------------ */
  /* tank-model screens (shared Personal Economic Model, docs/pem.md)     */
  /* ------------------------------------------------------------------ */
  EFA.css('b09t', `
  .b09-strip { position: absolute; left: 70px; right: 70px; top: 12px; height: 158px; display: grid; grid-template-columns: 70% 30%; padding: 12px 22px; box-sizing: border-box; transition: opacity .5s ease; }
  .b09-sgrid { display: grid; grid-template-columns: 96px repeat(4, 1fr); grid-template-rows: 26px 1fr 1fr; gap: 6px 14px; align-items: center; }
  .b09-sgrid .h { font: 700 15px/1.1 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #8a6e22; text-align: right; padding-right: 6px; }
  .b09-sgrid .rc { font: 700 17px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b09-sgrid .st-input.b09-in { width: 100%; height: 44px; font-size: 19px; padding: 0 12px; }
  .b09-sright { display: grid; align-content: center; gap: 12px; padding-left: 26px; border-left: 1px solid rgba(13,30,58,.1); margin-left: 14px; }
  .b09-sright .rw { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
  .b09-sright .lb { font: 700 17px/1.1 "DM Sans", sans-serif; color: #0d1e3a; white-space: nowrap; }
  .stage .b09-sright .st-input.b09-in { width: 150px; height: 44px; font-size: 19px; }
  .b09-mo { display: flex; align-items: center; gap: 12px; flex: 1; justify-content: flex-end; }
  .b09-mo .b09-range { width: 220px; }
  .b09-mo .num { min-width: 46px; text-align: right; font: 700 19px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b09-pemhost { position: absolute; left: 0; right: 0; top: 176px; bottom: 56px; }
  .b09-pemwait { position: absolute; left: 70px; width: 760px; top: 60px; height: 520px; display: grid; place-items: center; text-align: center; border: 2px dashed #d5bd68; border-radius: 18px; background: rgba(255,253,248,.7); font: 600 22px/1.45 "DM Sans", sans-serif; color: #667389; padding: 40px; box-sizing: border-box; }
  .b09-side { position: absolute; left: 930px; width: 580px; top: 204px; display: grid; gap: 16px; transition: opacity .5s ease; }
  .b09-side h2 { margin: 0 0 4px; }
  .b09-ev { display: grid; grid-template-columns: 58px 1fr; align-items: center; gap: 14px; }
  .b09-ev .b09-box { width: 100%; font-size: 23px; line-height: 1.35; padding: 14px 22px; }
  .b09-ev .b09-box .num { color: #8a6e22; }
  .b09-ev .sub { display: block; font-size: 20px; color: #2b4c80; margin-top: 2px; }
  .b09-reset { position: absolute; left: 608px; top: 800px; }
  .b09-seg { display: inline-flex; border: 1.5px solid #cbd5e3; border-radius: 999px; padding: 4px; gap: 4px; background: #fff; }
  .b09-seg button { border: 0; border-radius: 999px; padding: 8px 18px; background: transparent; color: #0d1e3a; font: 600 17px/1.1 "DM Sans", sans-serif; cursor: pointer; }
  .b09-seg button[aria-checked="true"] { background: #0d1e3a; color: #f7f5f1; }
  .b09-cmpr { position: absolute; left: 1130px; width: 420px; top: 14px; display: grid; gap: 8px; }
  .b09-cmpr .rw { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 50px; border-bottom: 1px solid rgba(13,30,58,.08); }
  .b09-cmpr .lb { font: 700 17px/1.15 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b09-cmpr .st-input.b09-in { width: 160px; height: 44px; font-size: 19px; }
  .b09-cmpr .ro { font: 700 21px/1 "DM Sans", sans-serif; color: #0d1e3a; background: #e3e8f0; border-radius: 9px; padding: 11px 14px; min-width: 132px; text-align: right; }
  .b09-cmpr .b09-ev .b09-box { font-size: 19px; padding: 11px 16px; }
  .b09-cmpr .b09-mo .b09-range { width: 200px; }
  .b09-hit { width: 100%; height: 100%; border: 0; background: transparent; cursor: pointer; padding: 0; }
  `);

  const TANK_COPY = {
    cInit: 'Initial', cRate: 'Rate', cBal: 'Balance', tRisk: 'Risk Tank', tSafe: 'Safe Tank', tLoan: 'Loan Tank', tHouse: 'House', lMonth: 'Month',
    pemWait: 'The tank diagram appears here once the shared Personal Economic Model is installed. Everything else on this screen already works.'
  };
  const TANK_SPECS = (ro) => [
    { id: 'riskRate', type: 'pct', dp: 0, max: 12 }, { id: 'safeRate', type: 'pct', dp: 0, max: 12 }, { id: 'loanRate', type: 'pct', dp: 3, min: 0 }, { id: 'apprRate', type: 'pct', dp: 0 },
    { id: 'riskInit', type: 'money', min: 0, readonly: !!ro }, { id: 'safeInit', type: 'money', min: 0, readonly: !!ro }, { id: 'loanInit', type: 'money', min: 0, readonly: !!ro }, { id: 'house', type: 'money', min: 0 }
  ];
  /** the input grid: captions Initial / Rate / Balance against the four tanks */
  function tankGrid(ctx, st, specs) {
    return `<div class="b09-sgrid">
      <span class="h">${ctx.t('cInit')}</span>${['tRisk', 'tSafe', 'tLoan', 'tHouse'].map((k) => `<span class="h" style="text-align:center;padding:0">${ctx.t(k)}</span>`).join('')}
      <span class="rc">${ctx.t('cRate')}</span>${specs.slice(0, 4).map((o) => inp(o, st[o.id])).join('')}
      <span class="rc">${ctx.t('cBal')}</span>${specs.slice(4).map((o) => inp(o, st[o.id])).join('')}
    </div>`;
  }
  const monthHTML = (ctx) => `<div class="rw"><span class="lb">${ctx.t('lMonth')}</span><span class="b09-mo"><input type="range" class="b09-range" data-month="1" min="0" max="360" step="1" value="0"><span class="num" data-mnum="1">0</span></span></div>`;
  function syncMonth(ctx, m, term) {
    const r = ctx.$('[data-month]'); if (!r) return;
    r.max = term; r.value = m; r.style.setProperty('--p', (term ? m / term * 100 : 0) + '%');
    const n = ctx.$('[data-mnum]'); if (n) n.textContent = m;
  }
  /** mount the shared model (guarded): quiet notice while pem.js is still a placeholder */
  function pemMount(ctx, host, cfg) {
    const L = EFA.lib && EFA.lib.pem;
    if (!L || typeof L.mount !== 'function') { host.innerHTML = `<div class="b09-pemwait">${ctx.t('pemWait')}</div>`; return null; }
    try { return L.mount(ctx, host, cfg); } catch (e) { console.error(e); host.innerHTML = `<div class="b09-pemwait">${ctx.t('pemWait')}</div>`; return null; }
  }
  /** feed one month of a tank model into the diagram */
  function pemShow(p, v, ref, houseRef, extra) {
    if (!p) return;
    const lv = (x) => Math.max(0, Math.min(100, (x / ref) * 100));
    try {
      p.set(Object.assign({
        risk: lv(v.risk), safe: lv(v.safe), house: lv(v.house), borrow: lv(v.loan),
        riskBalance: Math.round(v.risk), safeBalance: Math.round(v.safe), houseBalance: Math.round(v.house), bfBalance: Math.round(v.loan),
        outflow: Math.round(v.outflow || 0), contribution: Math.round(v.contribution || 0), houseRef
      }, extra || {}), { ms: 0 });
    } catch (e) { console.error(e); }
  }
  /** month animation: run(from, to, ms) adds one month every ms/(to - from); finish(t) jumps; later(fn, ms) runs
   *  within the current step; stop() cancels everything (called at every step change) */
  function monthAnim(ctx, setMonth) {
    let stepTok = 0, runTok = 0;
    return {
      stop() { stepTok++; runTok++; },
      finish(t) { runTok++; setMonth(t); },
      later(fn, ms) { const my = stepTok; ctx.timeout(() => { if (my === stepTok) fn(); }, ms); },
      run(from, to, ms, done) {
        const my = ++runTok, st = stepTok;
        setMonth(from);
        if (from >= to) { if (done) done(); return; }
        const dt = Math.max(4, ms / (to - from)); let m = from;
        const tick = () => { if (my !== runTok || st !== stepTok) return; m += 1; setMonth(m); if (m >= to) { if (done) done(); return; } ctx.timeout(tick, dt); };
        ctx.timeout(tick, dt);
      }
    };
  }
  /** an events panel whose rows persist (so their fades are not restarted on every animation tick) */
  function evPanel(ctx, box, count) {
    box.innerHTML = Array.from({ length: count }, (_, k) => evRow('', `data-evr="${k}"`)).join('');
    const last = [];
    return (rows) => {
      for (let k = 0; k < count; k++) {
        const r = rows[k], row = box.querySelector(`[data-evr="${k}"]`);
        if (r && last[k] !== r[0]) { row.querySelector('.b09-box').innerHTML = r[0]; last[k] = r[0]; refresh(row); }
        ctx.show(row, !!(r && r[1]));
        row.style.display = r ? '' : 'none';
      }
    };
  }
  const PEM_BASE = { labels: false, links: false, scenarioPicker: false, borrowSource: false, lifestyleStrip: false, showBorrowed: true, showHouse: true, collateral: 'house', altBalance: true, sliders: false, chevrons: false };
  const pemFrame = () => ({ zoom: { fit: ['risk', 'safe', 'borrowed', 'house'], pad: 1 }, width: 0.55, expanded: false, panel: '.b09-pemhide', expandShows: ['lifestyle'], toggle: true });
  const evRow = (inner, attrs) => `<div class="b09-ev b09-f is-off" ${attrs || ''}><span>${bridge.dart(52)}</span><div class="b09-box">${inner}</div></div>`;
  const pemPlay = (p, name, on) => { if (!p) return; try { if (on) { if (!p.playing(name)) p.play(name); } else p.stop(name); } catch (e) { console.error(e); } };

  /* ---------- mdp1: down payment vs keeping the money ---------- */
  EFA.screen('mdp1', {
    title: 'Down payment vs keeping the money',
    steps: 2,
    copy: Object.assign({}, TANK_COPY, {
      lDown: 'Down Payment %', head: 'Down Payment Facts',
      f1: 'A larger down payment lowers your monthly payment.',
      f2: 'Money tied up in a down payment earns no return.',
      f3: 'A larger down payment leaves your home’s value unchanged.',
      f4: 'Putting more down leaves you with less control of your money.',
      reset: 'Reset',
      disc: 'Rates for the risk and safe tanks and for the home’s value are assumptions, and this is not a recommendation on the size of a down payment.',
      _notes: 'The same house, the same loan rate, two choices for the down payment money: put it in the house, or keep it working in your tanks.\n\n- Click forward to run thirty years of payments.\n- Ask: Thirty years from now, which version of you has more choices?\nPAUSE'
    }),
    render(ctx) {
      const D = { riskRate: 8, safeRate: 5, loanRate: 4, apprRate: 0, house: 500000, downPct: 20 };
      const st = ctx._t = Object.assign({ month: 0 }, D);
      const specs = TANK_SPECS(true), dsp = { id: 'downPct', type: 'pct', dp: 0, min: 0, max: 100 };
      const derive = () => { st.riskInit = st.safeInit = st.house * st.downPct / 100; st.loanInit = st.house * (1 - st.downPct / 100); };
      derive();
      ctx.el.innerHTML = `
        <div class="b09-card b09-strip b09-pemhide">${tankGrid(ctx, st, specs)}
          <div class="b09-sright">${monthHTML(ctx)}<div class="rw"><span class="lb">${ctx.t('lDown')}</span>${inp(dsp, st.downPct)}</div></div></div>
        <div class="b09-pemhost" data-host="1"></div>
        <div class="b09-side b09-pemhide">
          <h2 class="st-h2" style="font-size:40px">${ctx.t('head')}</h2>
          ${[1, 2, 3, 4].map((k) => evRow(ctx.t('f' + k), 'data-fact="1"')).join('')}
        </div>
        <button type="button" class="st-pill b09-reset" data-reset="1" hidden>${ctx.t('reset')}</button>
        ${discLine(ctx, ['disc'], ['hypothetical'], 'position:absolute;left:70px;right:330px;top:858px')}`;
      const p = ctx._pem = pemMount(ctx, ctx.$('[data-host]'), Object.assign({}, PEM_BASE, { pad: [0, 0, 0, 0], frame: pemFrame() }));
      const recalc = () => { derive(); ctx._model = mdpModel(st); specs.slice(4, 7).forEach((o) => setIn(ctx.el, o, st[o.id])); show(st.month); };
      const show = (m) => {
        const M = ctx._model; st.month = Math.max(0, Math.min(M.term, Math.round(m)));
        syncMonth(ctx, st.month, M.term);
        pemShow(p, M.at(st.month), M.ref, M.houseRef);
      };
      ctx._show = show; ctx._recalc = recalc; ctx._defaults = () => { Object.assign(st, D, { month: 0 }); specs.forEach((o) => setIn(ctx.el, o, st[o.id])); setIn(ctx.el, dsp, st.downPct); };
      ctx._anim = monthAnim(ctx, show);
      recalc();
      bindIn(ctx.el, specs.concat([dsp]), st, () => recalc());
      ctx.$('[data-month]').addEventListener('input', (e) => show(+e.target.value));
      ctx.$('[data-month]').addEventListener('keydown', (e) => e.stopPropagation());
      ctx.on(ctx.$('[data-reset]'), 'click', () => ctx.goStep(0));
    },
    step(ctx, n, dir) {
      const p = ctx._pem, st = ctx._t;
      ctx._anim.stop();
      ctx.$('[data-reset]').hidden = n === 0;
      ctx.$$('[data-fact]').forEach((e) => ctx.show(e, n >= 1));
      pemPlay(p, 'MEPLifestylePlusLoan', false); pemPlay(p, 'MEPLifestyleOnly', false);
      if (n === 0) { ctx._defaults(); st.month = 0; ctx._recalc(); return; }
      const M = ctx._model;
      if (dir > 0) {
        const flow = st.downPct / 100 < 1 ? 'MEPLifestylePlusLoan' : 'MEPLifestyleOnly';
        pemPlay(p, flow, true);
        ctx._anim.run(0, M.term, 16 * M.term, () => pemPlay(p, flow, false));
      } else ctx._anim.finish(M.term);
    }
  });

  /* ---------- mep1: extra payments vs a side tank ---------- */
  const MODES = ['risk', 'safe', 'loan'];
  const HL = { loan: 'borrowed', safe: 'safe', risk: 'risk' };
  EFA.screen('mep1', {
    title: 'Extra mortgage payments vs a side tank',
    steps: 9,
    copy: Object.assign({}, TANK_COPY, {
      lTerm: 'Mortgage Term', lExtra: 'Extra Payment', mRisk: 'Risk', mSafe: 'Safe', mLoan: 'Loan', head: 'Significant Events',
      e0Loan: 'Freedom point: the loan is paid off in month', e0Tank: 'Freedom point: month', e0Sooner: 'months sooner',
      e1: 'Months you keep control of the extra payments and the tank’s value:',
      e2: 'Paying extra left the home’s value unchanged.',
      e3Loan: 'Assets created by the extra payments:', e3TankA: 'Potential total assets, including the house, at the end of year',
      e4Risk: 'Potential difference between paying extra on the loan and funding the risk tank:', e4Safe: 'Potential difference between paying extra on the loan and funding the safe tank:',
      reset: 'Reset',
      disc: 'Assumed rates for the tanks and the loan; side-tank returns are not guaranteed, and this is not advice to prepay or to skip a mortgage payment.',
      _notes: 'The same extra amount each month, three places to put it: onto the loan, into the safe tank, or into the risk tank.\n\n- Click forward through all three runs. The freedom point is the month the tank could pay the loan off.\n- Ask: If both paths reach a paid-off house, which one leaves the money in your hands along the way?\nPAUSE'
    }),
    render(ctx) {
      const D = { riskRate: 8, riskInit: 0, safeRate: 5, safeInit: 0, loanRate: 4, loanInit: 400000, apprRate: 0, house: 500000, term: 360, extra: 1000, mode: 'loan' };
      const st = ctx._t = Object.assign({ month: 0 }, D);
      let ref = 1e6;
      const specs = TANK_SPECS(false), tsp = { id: 'term', type: 'int', dp: 0, min: 1 }, esp = { id: 'extra', type: 'money', min: 0 };
      ctx.el.innerHTML = `
        <div class="b09-card b09-strip b09-pemhide">${tankGrid(ctx, st, specs)}
          <div class="b09-sright">${monthHTML(ctx)}<div class="rw"><span class="lb">${ctx.t('lTerm')}</span>${inp(tsp, st.term)}</div><div class="rw"><span class="lb">${ctx.t('lExtra')}</span>${inp(esp, st.extra)}</div></div></div>
        <div class="b09-pemhost" data-host="1"></div>
        <div class="b09-side b09-pemhide" style="top:196px;gap:12px">
          <div class="b09-seg" role="radiogroup" style="justify-self:start">${MODES.map((m) => `<button type="button" role="radio" data-mode="${m}">${ctx.t('m' + m[0].toUpperCase() + m.slice(1))}</button>`).join('')}</div>
          <h2 class="st-h2" style="font-size:38px">${ctx.t('head')}</h2>
          <div data-evs="1" style="display:grid;gap:12px"></div>
        </div>
        <button type="button" class="st-pill b09-reset" data-reset="1" hidden>${ctx.t('reset')}</button>
        ${discLine(ctx, ['disc'], ['hypothetical'], 'position:absolute;left:70px;right:330px;top:858px')}`;
      const p = ctx._pem = pemMount(ctx, ctx.$('[data-host]'), Object.assign({}, PEM_BASE, { pad: [0, 0, 0, 0], frame: pemFrame() }));
      let hl = null;
      const events = () => {
        const M = ctx._model, m = st.month, mode = st.mode, v = M.at(m, mode);
        const F = mode === 'risk' ? M.Fr : M.Fs, end = m >= M.term;
        const e0 = mode === 'loan' ? `${ctx.t('e0Loan')} ${N(M.L)}.` : `${ctx.t('e0Tank')} ${N(F)}.<span class="sub">(${N(M.L - F)} ${ctx.t('e0Sooner')})</span>`;
        const rows = [
          [e0, m >= (mode === 'loan' ? M.L : F)],
          [`${ctx.t('e1')} ${N(mode === 'loan' ? 0 : F)}`, end],
          [ctx.t('e2'), end],
          [mode === 'loan' ? `${ctx.t('e3Loan')} ${N(m0(0))}` : `${ctx.t('e3TankA')} ${N(Math.round(M.term / 12))}: ${N(m0(v.total))}`, end]
        ];
        if (mode !== 'loan') rows.push([`${ctx.t(mode === 'risk' ? 'e4Risk' : 'e4Safe')} ${N(m0(v.diff))}`, end]);
        if (!ctx._ev) ctx._ev = evPanel(ctx, ctx.$('[data-evs]'), 5);
        ctx._ev(rows);
      };
      const show = (m) => {
        const M = ctx._model; st.month = Math.max(0, Math.min(M.term, Math.round(m)));
        syncMonth(ctx, st.month, M.term);
        pemShow(p, M.at(st.month, st.mode), M.ref, M.houseRef);
        events();
      };
      const setMode = (mode) => {
        st.mode = mode;
        ctx.$$('[data-mode]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === mode)));
        if (p) { try { p.unhighlight(); hl = p.highlight(HL[mode]); } catch (e) { console.error(e); } }
        show(st.month);
      };
      const recalc = () => { ctx._model = mepModel(st, ref); ref = ctx._model.ref; show(st.month); };
      ctx._show = show; ctx._setMode = setMode; ctx._recalc = recalc;
      ctx._defaults = () => { Object.assign(st, D, { month: 0 }); specs.forEach((o) => setIn(ctx.el, o, st[o.id])); setIn(ctx.el, tsp, st.term); setIn(ctx.el, esp, st.extra); };
      ctx._anim = monthAnim(ctx, show);
      recalc(); setMode(st.mode);
      bindIn(ctx.el, specs.concat([tsp, esp]), st, () => recalc());
      ctx.$('[data-month]').addEventListener('input', (e) => show(+e.target.value));
      ctx.$('[data-month]').addEventListener('keydown', (e) => e.stopPropagation());
      ctx.$$('[data-mode]').forEach((b) => ctx.on(b, 'click', () => setMode(b.dataset.mode)));
      ctx.on(ctx.$('[data-reset]'), 'click', () => ctx.goStep(0));
    },
    step(ctx, n, dir) {
      const p = ctx._pem, st = ctx._t, A = ctx._anim;
      A.stop();
      ['MEPExtraToLoan', 'MEPExtraToSafeTank', 'MEPExtraToRiskTank', 'MEPLifestyleOnly', 'MEPLifestylePlusLoan'].forEach((f) => pemPlay(p, f, false));
      ctx.$('[data-reset]').hidden = n !== 8;
      if (n === 0) { ctx._defaults(); ctx._recalc(); ctx._setMode('loan'); ctx._show(0); return; }
      const M = ctx._model, T = M.term;
      const modeOf = [null, 'loan', 'loan', 'safe', 'safe', 'safe', 'risk', 'risk', 'risk'][n];
      if (st.mode !== modeOf) ctx._setMode(modeOf);
      const endMonth = [0, M.L, T, 0, M.Fs, T, 0, M.Fr, T][n];
      if (!(dir > 0)) { A.finish(endMonth); return; }
      const flowFor = (name, ms) => { pemPlay(p, name, true); A.later(() => pemPlay(p, name, false), ms); };
      if (n === 1) { flowFor('MEPExtraToLoan', 4000); A.run(0, M.L, 4000); }
      else if (n === 2) { A.finish(M.L); flowFor('MEPLifestyleOnly', 4000); A.run(M.L, T, 4000); }
      else if (n === 3 || n === 6) { A.finish(0); }
      else if (n === 4 || n === 7) { const F = n === 4 ? M.Fs : M.Fr; flowFor(n === 4 ? 'MEPExtraToSafeTank' : 'MEPExtraToRiskTank', 4000); A.run(0, F, 4000); }
      else if (n === 5 || n === 8) {
        const F = n === 5 ? M.Fs : M.Fr, f = n === 5 ? 'MEPExtraToSafeTank' : 'MEPExtraToRiskTank';
        A.finish(F); pemPlay(p, f, true);
        A.run(F, M.L, 2000);
        A.later(() => { pemPlay(p, f, false); pemPlay(p, 'MEPLifestylePlusLoan', true); A.run(Math.max(M.L, st.month), T, 4000, () => pemPlay(p, 'MEPLifestylePlusLoan', false)); }, 2500);
      }
    }
  });

  /* ---------- mhl1: paying cash vs 100% financing over time ---------- */
  EFA.screen('mhl1', {
    title: 'Paying cash vs 100% financing',
    steps: 8,
    copy: Object.assign({}, TANK_COPY, {
      lSpan: 'Timespan', hCash: 'Paying Cash', hFin: '100% Financing',
      f0Cash: 'There is nothing to pay each month.',
      f0Fin: 'Weigh what borrowing costs against what your savings and investments can earn.',
      f0CmpA: 'Compare the balances after', f0CmpB: 'years.',
      f0Wide: 'Stretching the financing period widens your opportunity.',
      f1: 'Stretching the financing period keeps more control in your hands.',
      f2: 'Your home gains or loses value the same way however you pay for it, and that part is out of your hands.',
      f3Fall: 'Home values can fall.', f3Rise: 'Home values can rise.',
      reset: 'Reset',
      disc: 'Assumed rates of return and home price changes; returns are not guaranteed, financing involves risk, and this is not a lending recommendation.',
      _notes: 'First the house bought with cash, then the same house financed 100% while the money stays in your tanks.\n\n- Click forward through both stories. Notice the house moves the same way in each.\n- Ask: If the house does the same thing either way, where would you rather your money be?\nPAUSE'
    }),
    render(ctx) {
      const D = { riskRate: 6, riskInit: 500000, safeRate: 4, safeInit: 500000, loanRate: 4, loanInit: 0, apprRate: 0, house: 500000, term: 360 };
      const st = ctx._t = Object.assign({ month: 0, fin: false, f3: 'fall' }, D);
      const specs = TANK_SPECS(false), tsp = { id: 'term', type: 'int', dp: 0, min: 2 };
      ctx.el.innerHTML = `
        <div class="b09-card b09-strip b09-pemhide">${tankGrid(ctx, st, specs)}
          <div class="b09-sright">${monthHTML(ctx)}<div class="rw"><span class="lb">${ctx.t('lSpan')}</span>${inp(tsp, st.term)}</div></div></div>
        <div class="b09-pemhost" data-host="1"></div>
        <div class="b09-side b09-pemhide">
          <h2 class="st-h2" style="font-size:42px" data-mh="1"></h2>
          <div data-facts="1" style="display:grid;gap:14px">${[0, 1, 2, 3].map((k) => evRow('', `data-f="${k}"`)).join('')}</div>
        </div>
        <button type="button" class="st-pill b09-reset" data-reset="1" hidden>${ctx.t('reset')}</button>
        ${discLine(ctx, ['disc'], ['hypothetical'], 'position:absolute;left:70px;right:330px;top:858px')}`;
      const p = ctx._pem = pemMount(ctx, ctx.$('[data-host]'), Object.assign({}, PEM_BASE, { pad: [0, 0, 0, 0], frame: pemFrame() }));
      const show = (m) => {
        const M = ctx._model; st.month = Math.max(0, Math.min(M.term, Math.round(m)));
        syncMonth(ctx, st.month, M.term);
        pemShow(p, M.at(st.month), M.ref, M.houseRef);
      };
      const recalc = () => { ctx._model = mhlModel(st); show(st.month); };
      ctx._show = show; ctx._recalc = recalc;
      ctx._set = (vals) => { Object.assign(st, vals); specs.forEach((o) => setIn(ctx.el, o, st[o.id])); setIn(ctx.el, tsp, st.term); };
      ctx._defaults = () => ctx._set(Object.assign({ month: 0, fin: false, f3: 'fall' }, D));
      ctx._anim = monthAnim(ctx, show);
      recalc();
      bindIn(ctx.el, specs.concat([tsp]), st, () => recalc());
      ctx.$('[data-month]').addEventListener('input', (e) => show(+e.target.value));
      ctx.$('[data-month]').addEventListener('keydown', (e) => e.stopPropagation());
      ctx.on(ctx.$('[data-reset]'), 'click', () => ctx.goStep(0));
    },
    step(ctx, n, dir) {
      const p = ctx._pem, st = ctx._t, A = ctx._anim;
      A.stop(); pemPlay(p, 'MEPLifestyleOnly', false); pemPlay(p, 'MEPLifestylePlusLoan', false);
      ctx.$('[data-reset]').hidden = n !== 7;
      // absolute state for the step (the end state of its animation)
      const fin = n >= 4, H = st.house;
      if (n === 0) ctx._defaults();
      else if (fin) ctx._set({ fin: true, riskInit: H, safeInit: H, loanInit: H, apprRate: 4 });
      else ctx._set({ fin: false, riskInit: 500000, safeInit: 500000, loanInit: 0, apprRate: [0, 0, -4, 4][n] });
      ctx._recalc();
      const T = ctx._model.term, half = Math.round(T / 2);
      const facts = [null, null, null, null];
      if (n >= 1 && n <= 3) { facts[0] = ctx.t('f0Cash'); facts[1] = ctx.t('f1'); facts[2] = ctx.t('f2'); }
      if (n >= 2 && n <= 3) facts[3] = ctx.t(n === 2 ? 'f3Fall' : 'f3Rise');
      if (n === 4) facts[0] = ctx.t('f0Fin');
      if (n === 5) facts[0] = `${ctx.t('f0CmpA')} ${N(+(T / 24).toFixed(1))} ${ctx.t('f0CmpB')}`;
      if (n === 6) facts[0] = `${ctx.t('f0CmpA')} ${N(+(T / 12).toFixed(1))} ${ctx.t('f0CmpB')}`;
      if (n === 7) { facts[0] = ctx.t('f0Wide'); facts[1] = ctx.t('f1'); facts[2] = ctx.t('f2'); }
      ctx.$('[data-mh]').innerHTML = ctx.t(fin ? 'hFin' : 'hCash');
      facts.forEach((h, k) => { const row = ctx.$(`[data-f="${k}"]`); if (h) row.querySelector('.b09-box').innerHTML = h; ctx.show(row, !!h); });
      refresh(ctx.$('.b09-side'));
      const endMonth = [0, T, T, T, 0, half, T, T][n];
      if (!(dir > 0)) { A.finish(endMonth); return; }
      if (n === 1) { pemPlay(p, 'MEPLifestyleOnly', true); A.later(() => pemPlay(p, 'MEPLifestyleOnly', false), 4000); A.run(0, T, 4000); }
      else if (n === 5) { pemPlay(p, 'MEPLifestylePlusLoan', true); A.later(() => pemPlay(p, 'MEPLifestylePlusLoan', false), 2000); A.run(0, half, 2000); }
      else if (n === 6) { A.finish(half); pemPlay(p, 'MEPLifestylePlusLoan', true); A.later(() => pemPlay(p, 'MEPLifestylePlusLoan', false), 2000); A.run(half, T, 2000); }
      else A.finish(endMonth);
    }
  });

  /* ---------- cmp1: two mortgages, conventional or interest-only ---------- */
  EFA.screen('cmp1', {
    title: 'Two mortgages, including interest-only',
    copy: Object.assign({}, TANK_COPY, {
      lSel: 'Selected Mortgage', selA: 'A', selB: 'B', lTerm: 'Mortgage Term', lType: 'Mortgage Type', typeIO: 'Interest Only', typeConv: 'Conventional',
      lCalc: 'Calculated Payment', lDiff: 'Payment Difference', lExtra: 'Extra Payment', lFund: 'Fund Tank', mRisk: 'Risk', mSafe: 'Safe', mLoan: 'Loan',
      e0Loan: 'Freedom point: the loan is paid off in month', e0Tank: 'Freedom point: month', e0Sooner: 'months sooner',
      e1Loan: 'Paying extra left the home’s value unchanged.', e1TankA: 'Potential total assets, including the house, at the end of year',
      e2Loan: 'Assets created by the extra payments:', e2Risk: 'Potential difference between paying extra on the loan and funding the risk tank:', e2Safe: 'Potential difference between paying extra on the loan and funding the safe tank:',
      pliAria: 'Show the safe tank as cash value life insurance',
      disc: 'Assumed rates; interest-only payments do not reduce the loan balance, and insurance values depend on the policy.',
      _notes: 'Two ways to set up the same home loan, and three places for the money the lower payment frees up.\n\n- Set mortgage B to interest only, select it, then choose where the difference goes.\n- Ask: Which matters more to you: the lowest balance on the loan, or the most money under your own control?\nPAUSE\n\n- Click the safe tank to show it as cash value life insurance.'
    }),
    render(ctx) {
      const st = ctx._t = { riskRate: 8, riskInit: 0, safeRate: 5, safeInit: 0, apprRate: 2, house: 500000, extra: 0, mode: 'loan', selected: 'A', month: 0,
        A: { rate: 4, amount: 400000, term: 360, io: false }, B: { rate: 4, amount: 400000, term: 360, io: false } };
      let ref = 1e6;
      const cur = () => st[st.selected];
      st.loanRate = cur().rate; st.loanInit = cur().amount; st.term = cur().term;
      const specs = [
        { id: 'riskRate', type: 'pct', dp: 2 }, { id: 'safeRate', type: 'pct', dp: 2 }, { id: 'loanRate', type: 'pct', dp: 3, min: 0 }, { id: 'apprRate', type: 'pct', dp: 2 },
        { id: 'riskInit', type: 'money', min: 0 }, { id: 'safeInit', type: 'money', min: 0 }, { id: 'loanInit', type: 'money', min: 0 }, { id: 'house', type: 'money', min: 0 }
      ];
      const tsp = { id: 'term', type: 'int', dp: 0, min: 1 }, esp = { id: 'extra', type: 'money', min: 0 };
      const seg = (attr, list) => `<div class="b09-seg" role="radiogroup">${list.map(([v, k]) => `<button type="button" role="radio" ${attr}="${v}">${ctx.t(k)}</button>`).join('')}</div>`;
      ctx.el.innerHTML = `
        <div class="b09-card b09-strip" style="right:500px;grid-template-columns:1fr">${tankGrid(ctx, st, specs)}</div>
        <div class="b09-pemhost" data-host="1" style="right:480px"></div>
        <div class="b09-cmpr">
          <div class="b09-card" style="padding:4px 18px">
            ${monthHTML(ctx)}
            <div class="rw"><span class="lb">${ctx.t('lSel')}</span>${seg('data-sel', [['A', 'selA'], ['B', 'selB']])}</div>
            <div class="rw"><span class="lb">${ctx.t('lTerm')}</span>${inp(tsp, st.term)}</div>
            <div class="rw"><span class="lb">${ctx.t('lType')}</span><button type="button" class="st-pill b09-ghost" data-io="1" style="min-width:170px"></button></div>
            <div class="rw"><span class="lb">${ctx.t('lCalc')}</span><span class="ro num" data-pay="1"></span></div>
            <div class="rw" data-diffrow="1"><span class="lb">${ctx.t('lDiff')}</span><span class="ro num" data-diff="1"></span></div>
            <div class="rw"><span class="lb">${ctx.t('lExtra')}</span>${inp(esp, st.extra)}</div>
            <div class="rw" style="border:0"><span class="lb">${ctx.t('lFund')}</span>${seg('data-mode', [['risk', 'mRisk'], ['safe', 'mSafe'], ['loan', 'mLoan']])}</div>
          </div>
          <div data-evs="1" style="display:grid;gap:10px;margin-top:6px"></div>
        </div>
        ${discLine(ctx, ['disc'], ['hypothetical'], 'position:absolute;left:70px;right:500px;top:852px')}`;
      const p = ctx._pem = pemMount(ctx, ctx.$('[data-host]'), Object.assign({}, PEM_BASE, { links: true, pad: [0, 10, 0, 10], view: { fit: ['risk', 'safe', 'borrowed', 'house'], pad: 1 } }));
      if (p) {
        try {
          const hit = p.place(`<button type="button" class="b09-hit" aria-label="${U.esc(ctx.text('pliAria'))}"></button>`, 'safe');
          if (hit) hit.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; p.set({ pli: !p.get('pli') }); });
        } catch (e) { console.error(e); }
      }
      const events = () => {
        const M = ctx._model, m = st.month, mode = st.mode, v = M.at(m, mode), F = mode === 'risk' ? M.Fr : M.Fs, end = m >= M.N;
        const e0 = mode === 'loan' ? `${ctx.t('e0Loan')} ${N(M.L)}.` : `${ctx.t('e0Tank')} ${N(F)}.<span class="sub">(${N(M.L - F)} ${ctx.t('e0Sooner')})</span>`;
        const rows = [
          [e0, m >= (mode === 'loan' ? M.L : F)],
          [mode === 'loan' ? ctx.t('e1Loan') : `${ctx.t('e1TankA')} ${N(Math.round(M.N / 12))}: ${N(m0(v.total))}`, end],
          [mode === 'loan' ? `${ctx.t('e2Loan')} ${N(m0(0))}` : `${ctx.t(mode === 'risk' ? 'e2Risk' : 'e2Safe')} ${N(m0(v.diff))}`, end]
        ];
        if (!ctx._ev) ctx._ev = evPanel(ctx, ctx.$('[data-evs]'), 3);
        ctx._ev(rows);
      };
      const show = (m) => {
        const M = ctx._model; st.month = Math.max(0, Math.min(M.N, Math.round(m)));
        syncMonth(ctx, st.month, M.N);
        pemShow(p, M.at(st.month, st.mode), M.ref, M.houseRef);
        events();
      };
      const recalc = () => {
        const c = cur(); c.rate = st.loanRate; c.amount = st.loanInit; c.term = st.term;
        ctx._model = cmpModel(st, ref); ref = ctx._model.ref;
        const M = ctx._model;
        ctx.$('[data-pay]').textContent = m0(M.pay[st.selected]);
        ctx.$('[data-diff]').textContent = m0(M.diffPay);
        ctx.$('[data-diffrow]').style.visibility = st.selected === 'B' ? 'visible' : 'hidden';
        ctx.$('[data-io]').innerHTML = ctx.t(c.io ? 'typeIO' : 'typeConv');
        ctx.$('[data-io]').classList.toggle('b09-ghost', !c.io);
        ctx.$$('[data-sel]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.sel === st.selected)));
        ctx.$$('[data-mode]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === st.mode)));
        if (p) { try { p.unhighlight(); p.highlight(HL[st.mode]); } catch (e) { console.error(e); } }
        show(st.month);
        refresh(ctx.$('.b09-cmpr'));
      };
      recalc();
      bindIn(ctx.el, specs.concat([tsp, esp]), st, () => recalc());
      ctx.$('[data-month]').addEventListener('input', (e) => show(+e.target.value));
      ctx.$('[data-month]').addEventListener('keydown', (e) => e.stopPropagation());
      ctx.$$('[data-sel]').forEach((b) => ctx.on(b, 'click', () => {
        st.selected = b.dataset.sel; const c = cur();
        st.loanRate = c.rate; st.loanInit = c.amount; st.term = c.term;
        setIn(ctx.el, specs[2], st.loanRate); setIn(ctx.el, specs[6], st.loanInit); setIn(ctx.el, tsp, st.term);
        recalc();
      }));
      ctx.on(ctx.$('[data-io]'), 'click', () => { cur().io = !cur().io; recalc(); });
      ctx.$$('[data-mode]').forEach((b) => ctx.on(b, 'click', () => { st.mode = b.dataset.mode; recalc(); }));
    }
  });


  /* engines shared with later builders */
  EFA.engines = EFA.engines || {};
})();
