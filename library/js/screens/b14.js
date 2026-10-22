/* b14: Safe Account Benefits, Savings Efficiency, Sequence Risk, Social Security Early or Late,
   Spender Saver Wealth Creator, Four Financial Stages, Structured Income Streams, Tax Master,
   Tax Thresholds, Taxable Accounts 101, Taxation of Social Security, Term Insurance.
   Structure, sequence and math follow the screen specs; drawings and wording are new. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt;
  EFA.engines = EFA.engines || {};

  EFA.css('b14', `
  .stage .b14-head { position: absolute; left: 0; right: 0; top: 44px; display: grid; justify-items: center; gap: 12px; text-align: center; padding: 0 150px; pointer-events: none; }
  .stage .b14-head > * { pointer-events: auto; }
  .stage .b14-head .st-h1 { font-size: 60px; }
  .stage .b14-panel { position: absolute; box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 14px 36px rgba(13,30,58,.08); }
  .stage .b14-form { padding: 12px 30px; display: grid; }
  .stage .b14-row { display: grid; grid-template-columns: minmax(0,1fr) 220px; align-items: center; column-gap: 20px; min-height: 58px; border-bottom: 1px solid rgba(13,30,58,.09); }
  .stage .b14-row:last-child { border-bottom: 0; }
  .stage .b14-row.keep { border-bottom: 1px solid rgba(13,30,58,.09); }
  .stage .b14-row.wide { grid-template-columns: minmax(0,1fr) 340px; }
  .stage .b14-lab { font: 600 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; display: flex; align-items: center; gap: 12px; min-width: 0; }
  .stage .b14-lab > span[data-cp] { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
  .stage .b14-row .st-field { gap: 0; }
  .stage .b14-row .st-input, .stage .b14-in { height: 46px; text-align: right; font-size: 21px; }
  .stage .b14-ro { height: 46px; display: flex; align-items: center; justify-content: flex-end; padding: 0 14px; border-radius: 10px; background: #f0e6c4; font: 700 21px/1 "DM Sans", sans-serif; color: #0d1e3a; box-sizing: border-box; }
  .stage .b14-ro.quiet { background: #e3e8f0; }
  .stage .b14-cv .st-input { text-align: center; font-size: 22px; }
  .stage .b14-dot { flex: 0 0 auto; width: 26px; height: 26px; border-radius: 50%; border: 0; padding: 0; background: radial-gradient(circle at 35% 30%, #2b4c80, #0d1e3a 72%); box-shadow: 0 3px 8px rgba(13,30,58,.35); cursor: pointer; position: relative; transition: transform .2s ease; }
  .stage .b14-dot::after { content: ""; position: absolute; left: 9px; top: 9px; width: 8px; height: 8px; border-radius: 50%; background: #d5bd68; }
  .stage .b14-dot:hover { transform: scale(1.14); }
  .stage .b14-link { background: none; border: 0; padding: 0 0 2px; font: 600 19px/1.2 "DM Sans", sans-serif; color: #8a6e22; border-bottom: 1.5px dotted currentColor; cursor: pointer; letter-spacing: .02em; }
  .stage .b14-link:hover { color: #0d1e3a; }
  .stage .b14-pill-gold { background: #b8972e !important; border-color: #b8972e !important; color: #0d1e3a !important; }
  .stage .b14-pill-gold:hover { background: #0d1e3a !important; border-color: #0d1e3a !important; color: #f7f5f1 !important; }
  .stage .b14-pill-ghost { background: transparent !important; color: #0d1e3a !important; border-color: #cbd5e3 !important; }
  .stage .b14-pill-ghost:hover { border-color: #b8972e !important; background: #fffdf8 !important; }
  .stage .b14-med { position: absolute; border-radius: 50%; background: #fffdf8; border: 1px solid #d6cfc4; box-shadow: 0 18px 40px rgba(13,30,58,.10); display: grid; place-items: center; overflow: hidden; }
  .stage .b14-med svg { width: 70%; height: 70%; }
  .stage .b14-fade { transition: opacity .8s ease; }
  .stage .b14-fade.is-off { transition-duration: .3s; }
  .stage .b14-abs { position: absolute; }
  .stage .b14-center { position: absolute; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 22px; }
  .stage .b14-disc { position: absolute; left: 160px; right: 160px; text-align: center; margin: 0; }
  .stage .b14-big { font: 700 34px/1.1 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b14-gold { color: #8a6e22; }
  .stage .b14-wait { display: grid; place-items: center; gap: 10px; text-align: center; color: #667389; font: 500 20px/1.4 "DM Sans", sans-serif; }
  .stage .b14-wait .ring { width: 46px; height: 46px; border-radius: 50%; border: 4px solid #e3e8f0; border-top-color: #b8972e; animation: b14spin 1.2s linear infinite; }
  @keyframes b14spin { to { transform: rotate(360deg); } }
  /* dropdown */
  .stage .b14-dd { position: relative; }
  .stage .b14-dd-b { width: 100%; height: 46px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 14px; border: 1.5px solid #cbd5e3; border-radius: 10px; background: #fff; font: 600 20px/1 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; text-align: left; box-sizing: border-box; }
  .stage .b14-dd-b:hover { border-color: #b8972e; }
  .stage .b14-dd-b .v { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
  .stage .b14-dd-b .ph { color: #667389; font-weight: 500; }
  .stage .b14-dd-b svg { flex: 0 0 auto; transition: transform .2s ease; }
  .stage .b14-dd.open .b14-dd-b svg { transform: rotate(180deg); }
  .stage .b14-dd-l { position: absolute; z-index: 25; left: 0; right: 0; top: calc(100% + 6px); max-height: 320px; overflow: auto; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 12px; box-shadow: 0 18px 40px rgba(13,30,58,.2); padding: 6px; display: grid; gap: 2px; }
  .stage .b14-dd-o { border: 0; background: transparent; text-align: left; padding: 10px 12px; border-radius: 8px; font: 500 19px/1.2 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; }
  .stage .b14-dd-o:hover { background: #e3e8f0; }
  .stage .b14-dd-o[aria-selected="true"] { background: #0d1e3a; color: #f7f5f1; }
  .stage .b14-dd.big .b14-dd-b { height: 64px; font: 700 28px/1 "DM Sans", sans-serif; border-radius: 14px; padding: 0 20px; background: #fffdf8; }
  .stage .b14-dd.big .b14-dd-o { font-size: 22px; padding: 12px 16px; }
  /* bullet text (rows come from EFA.lib.bullets) */
  .stage .b14-btxt { font: 500 21px/1.35 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b14-btxt.sm { font-size: 19px; }
  .stage .b14-ph { font: 700 15px/1.2 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6e22; border-bottom: 2px solid #b8972e; padding-bottom: 8px; margin: 0 0 4px; }
  /* scrolling tables */
  .stage .b14-tw { position: absolute; overflow: auto; border-radius: 12px; border: 1px solid #d6cfc4; background: #fffdf8; box-shadow: 0 10px 28px rgba(13,30,58,.06); }
  .stage .b14-tw .st-table th { position: sticky; top: 0; z-index: 2; }
  .stage .b14-tw .st-table td, .stage .b14-tw .st-table th { white-space: nowrap; }
  .stage .b14-tw .st-table tr.sel td { background: #f0e6c4 !important; }
  .stage .b14-tw .st-table tbody tr.pick { cursor: pointer; }
  .stage .b14-tw .st-table tbody tr.pick:hover td { background: #e3e8f0; }
  /* charts */
  .stage .b14-chart { position: absolute; }
  .stage .b14-chart svg { display: block; overflow: visible; }
  .stage .b14-legend { position: absolute; display: grid; gap: 6px; padding: 10px 14px; background: rgba(255,253,248,.94); border: 1px solid #d6cfc4; border-radius: 10px; font: 600 17px/1.2 "DM Sans", sans-serif; color: #0d1e3a; transition: opacity .3s ease; }
  .stage .b14-legend .k { display: inline-block; width: 26px; height: 0; border-top: 5px solid; vertical-align: middle; margin-right: 10px; border-radius: 3px; }
  .stage .b14-tip { position: absolute; pointer-events: none; padding: 8px 12px; background: #0d1e3a; color: #f7f5f1; border-radius: 8px; font: 600 15px/1.35 "DM Sans", sans-serif; white-space: nowrap; box-shadow: 0 10px 24px rgba(8,20,42,.3); opacity: 0; transition: opacity .15s ease; z-index: 6; }
  .stage .b14-tip.on { opacity: 1; }
  .stage .b14-tip .sw { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
  /* modal inside the stage (no close icon) */
  .stage .b14-modal { position: absolute; inset: 0; z-index: 32; background: rgba(13,30,58,.38); display: grid; place-items: center; animation: scr-in .2s ease both; }
  .stage .b14-modal-in { width: 640px; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 30px 80px rgba(8,20,42,.35); overflow: hidden; }
  .stage .b14-modal-h { padding: 20px 28px; background: #0d1e3a; color: #f7f5f1; font: 600 30px/1.1 "Cormorant Garamond", Georgia, serif; }
  .stage .b14-modal-b { padding: 18px 28px 8px; }
  .stage .b14-modal-f { display: flex; justify-content: space-between; gap: 14px; padding: 16px 28px 24px; }
  .stage .b14-info { background: #fff; border: 1px solid #e3e8f0; border-radius: 12px; padding: 16px 18px; font: 500 19px/1.45 "DM Sans", sans-serif; color: #0d1e3a; box-shadow: 0 6px 16px rgba(13,30,58,.05); }
  .stage .b14-info p { margin: 0 0 8px; }
  .stage .b14-info p:last-child { margin-bottom: 0; }
  `);

  /* ---------- per-client values shared across screens (namespace and units match the other builders:
     original key names, percentages as fractions, money in dollars, ages as whole years) ---------- */
  const CASE = 'case';
  const cget = (key, def) => { const v = EFA.clients.get(CASE, key, def); return v == null ? def : v; };
  const cset = (key, v) => EFA.clients.set(CASE, key, v);
  const isNum = (v) => typeof v === 'number' && isFinite(v);

  /** a calculator field whose value is shared with every screen that uses the same case key (EFA.lib.caseData) */
  function sfield(ctx, o) {
    const C = EFA.lib && EFA.lib.caseData;
    if (C && C.field) return C.field(ctx, { key: o.key, id: o.id, type: o.type, value: o.def, min: o.min, max: o.max, dp: o.dp, suffix: o.suffix });
    const v = cget(o.key, o.def);
    ctx.remember('f.' + o.id, v);
    (ctx._b14shared = ctx._b14shared || {})[o.id] = o.key;
    return ctx.field({ id: o.id, type: o.type, value: v, min: o.min, max: o.max, dp: o.dp, suffix: o.suffix });
  }
  /** a screen-local field (not kept between visits); st holds its current value for quick re-renders */
  function lfield(ctx, o, st) {
    const v = st && st[o.id] != null ? st[o.id] : o.def;
    ctx.remember('f.' + o.id, v);
    return ctx.field({ id: o.id, type: o.type, value: v, min: o.min, max: o.max, dp: o.dp, suffix: o.suffix });
  }
  function syncShared(ctx, vals) {
    Object.entries(ctx._b14shared || {}).forEach(([id, key]) => { if (isNum(vals[id])) cset(key, vals[id]); });
  }
  const inputOf = (ctx, id) => ctx.$(`[data-field="${id}"] input`);

  /* ---------- state that survives a re-render of the same screen (wording edits) but resets on a new
     visit (another screen, a jump, or the player being closed and opened again) ---------- */
  const VISIT = {};
  const posKey = () => { const pl = EFA.player; return pl && pl.pres ? `${pl.pres.key}:${pl.idx}` : ''; };
  function visitState(ctx, init) {
    const v = VISIT[ctx.id], pos = posKey(), stage = EFA.player && EFA.player.stage;
    if (v && v.rerender && v.pos === pos && v.stage === stage) { v.rerender = false; return v.s; }
    const s = init();
    VISIT[ctx.id] = { s, pos, stage, rerender: false };
    return s;
  }
  function markLeft(ctx) {
    const v = VISIT[ctx.id]; if (!v) return;
    const pl = EFA.player;
    v.rerender = !!(pl && pl.open_ && pl.stage === v.stage && posKey() === v.pos);
  }

  /* ---------- verified figures (EFA.data) through a safe lookup ---------- */
  function dget(path) {
    let o = EFA.data;
    for (const p of path.split('.')) { if (o == null) return null; o = o[p]; }
    return o == null ? null : o;
  }
  function dfirst(paths) { for (const p of paths) { const v = dget(p); if (v != null) return v; } return null; }
  /** normalise an annual series to {first, last, values[]} from [[year, v]...], {year: v} or {first, values} */
  function series(raw) {
    if (!raw) return null;
    let pairs = [];
    if (Array.isArray(raw)) {
      if (!raw.length) return null;
      if (Array.isArray(raw[0])) pairs = raw.map((r) => [+r[0], +r[1]]);
      else if (typeof raw[0] === 'object') pairs = raw.map((r) => [+(r.year != null ? r.year : r.y), +(r.value != null ? r.value : (r.rate != null ? r.rate : (r.r != null ? r.r : r.v)))]);
      else return null;
    } else if (typeof raw === 'object') {
      if (Array.isArray(raw.values) && raw.first != null) pairs = raw.values.map((v, i) => [+raw.first + i, +v]);
      else if (Array.isArray(raw.data)) return series(raw.data);
      else pairs = Object.keys(raw).filter((k) => /^\d{4}$/.test(k)).map((k) => [+k, +raw[k]]);
    }
    pairs = pairs.filter((p) => isFinite(p[0]) && isFinite(p[1])).sort((a, b) => a[0] - b[0]);
    if (!pairs.length) return null;
    const first = pairs[0][0], last = pairs[pairs.length - 1][0];
    const values = []; const map = {};
    pairs.forEach(([y, v]) => { map[y] = v; });
    for (let y = first; y <= last; y++) values.push(map[y] != null ? map[y] : NaN);
    return { first, last, values, at: (y) => map[y] };
  }

  /* ---------- shared components (EFA.lib, docs/components.md) through guarded calls ---------- */
  const LIB = (name) => (EFA.lib && EFA.lib[name]) || null;
  /** the shared dart bullet glyph */
  function glyph(size) { const B = LIB('bullets'); try { return B ? B.dart({ size: size || 30 }) : ''; } catch (e) { console.error(e); return ''; } }
  /** shared bullet list; items are HTML strings. o: {from, every, reveal, size, gap, text, boxed, cls, style} */
  function blist(ctx, items, o) {
    const B = LIB('bullets');
    if (B && B.list) return B.list(ctx, items, o);
    return `<div class="${o.cls || ''}" style="display:grid;gap:${o.gap || 18}px;${o.style || ''}">${items.map((h) => `<div class="${o.text || 'st-body'}">${h}</div>`).join('')}</div>`;
  }
  function reveal(ctx, n, root) { const B = LIB('bullets'); if (B && B.reveal) B.reveal(ctx, n, root); }
  /** compliance lines by topic (editable once, shown everywhere) */
  function discLine(topics, o) { const D = LIB('disclosure'); return D && D.line ? D.line(topics, o || {}) : ''; }
  /** Documentation worksheet (EFA.lib.worksheet.open; data in its documented format) */
  function openSheet(ctx, data) {
    const W = LIB('worksheet');
    if (!W || !W.open) { ctx.toast(ctx.text('_loading')); return; }
    try { W.open(ctx, data); } catch (e) { console.error(e); }
  }
  /** the rate-of-return notice on the first touch of a return field in a screen visit */
  function guardRor(ctx, id) { const D = LIB('disclosure'); if (D && D.guard) { try { D.guard(ctx, id); } catch (e) { console.error(e); } } }
  /** round opener for the historic inflation lookup; o = {field} or {onUse, instance} */
  function infDot(ctx, o) { const I = LIB('inflation'); return I && I.link ? I.link(ctx, Object.assign({ look: 'dot' }, o)) : ''; }
  /** a .st-disclaimer paragraph: '@topic' items are the shared compliance lines, others are this screen's copy keys */
  function discP(ctx, items, style) {
    const D = LIB('disclosure');
    const parts = items.map((k) => (k[0] === '@' ? (D && D.html ? D.html(k.slice(1)) : '') : ctx.t(k))).filter(Boolean);
    return `<p class="st-disclaimer b14-disc" style="${style || ''}">${parts.join(' ')}</p>`;
  }
  /** round opener for the life expectancy helper (empty until js/lib/life.js is loaded) */
  function leDot(ctx, o) { const L = LIB('lifeExpectancy'); return L && L.link ? L.link(ctx, Object.assign({ look: 'dot' }, o)) : ''; }

  /* ---------- small UI builders ---------- */
  const chev = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
  /** form row: label (copy key) left, control right; o.dot adds the small round helper button */
  function frow(ctx, labKey, control, o) {
    o = o || {};
    const dot = o.dot ? `<button type="button" class="b14-dot" data-dot="${o.dot}" aria-label="${ctx.esc(ctx.text(o.dotLabel || labKey))}"></button>` : '';
    return `<div class="b14-row ${o.cls || ''}" ${o.attrs || ''}><span class="b14-lab"><label${o.forId ? ` for="${o.forId}"` : ''} style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ctx.t(labKey)}</label>${dot}${o.after || ''}</span>${control}</div>`;
  }
  const fid = (ctx, id) => `f-${ctx.id}-${id}`;
  /** custom dropdown whose labels are editable copy keys. options: [{value, key} | {value, num}] */
  function dropdown(ctx, o) {
    const cur = o.options.find((op) => String(op.value) === String(o.value));
    const lab = (op) => (op.key ? ctx.t(op.key) : `<span class="num">${ctx.esc(String(op.num))}</span>`);
    return `<div class="b14-dd ${o.cls || ''}" data-dd="${o.id}">
      <button type="button" class="b14-dd-b" aria-haspopup="listbox"><span class="v">${cur ? lab(cur) : (o.placeholder ? `<span class="ph">${ctx.t(o.placeholder)}</span>` : '')}</span>${chev}</button>
      <div class="b14-dd-l" role="listbox" hidden>${o.options.map((op) => `<button type="button" role="option" class="b14-dd-o" data-v="${ctx.esc(String(op.value))}" aria-selected="${cur === op}">${lab(op)}</button>`).join('')}</div>
    </div>`;
  }
  function bindDropdown(ctx, id, onPick) {
    const dd = ctx.$(`[data-dd="${id}"]`); if (!dd) return;
    const list = dd.querySelector('.b14-dd-l');
    const close = () => { list.hidden = true; dd.classList.remove('open'); document.removeEventListener('pointerdown', outside, true); };
    const outside = (e) => { if (!dd.contains(e.target)) close(); };
    ctx.on(dd.querySelector('.b14-dd-b'), 'click', () => {
      if (!list.hidden) { close(); return; }
      list.hidden = false; dd.classList.add('open');
      const sel = list.querySelector('[aria-selected="true"]'); if (sel) list.scrollTop = Math.max(0, sel.offsetTop - list.clientHeight / 2);
      document.addEventListener('pointerdown', outside, true);
    });
    ctx.on(Array.from(list.querySelectorAll('.b14-dd-o')), 'click', (e, b) => { close(); onPick(b.dataset.v); });
  }
  /** bullet row: shared glyph + rounded text box */

  const med = (svg, x, y, d, cls) => `<div class="b14-med ${cls || ''}" style="left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px">${svg}</div>`;
  const money = (v, dp) => F.money(v, { dp: dp || 0 });
  const pctTrim = (f, maxDp) => { if (!isNum(f)) return '–'; const v = +(f * 100).toFixed(maxDp == null ? 2 : maxDp); return F.num(v, Math.abs(v % 1) > 1e-9 ? (Math.abs((v * 10) % 1) > 1e-9 ? 2 : 1) : 0) + '%'; };
  const wait = (ctx) => `<div class="b14-wait"><span class="ring"></span>${ctx.t('_wait')}</div>`;
  /** join copy fragments and values into one sentence; a fragment starting with punctuation attaches without a space */
  function sentence(ctx, parts) {
    let out = '';
    parts.forEach((p, i) => {
      let html, txt;
      if (typeof p === 'string') { html = ctx.t(p); txt = ctx.text(p); } else { html = `<span class="num ${p.cls || 'b14-v'}">${p.v}</span>`; txt = p.v; }
      if (i && !/^[,.;:!?)]/.test(txt)) out += ' ';
      out += html;
    });
    return out;
  }

  /* ---------- illustrations (flat duotone, navy and gold on paper) ---------- */
  const shd = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${P.shadow}"/>`;
  const svgv = (vb, body) => `<svg viewBox="${vb}" aria-hidden="true">${body}</svg>`;
  const ART = {
    vault() {
      const spokes = [0, 60, 120, 180, 240, 300].map((a) => { const [x, y] = A.pt(150, 112, 30, a); return `<path d="M150 112L${x.toFixed(1)} ${y.toFixed(1)}"/>`; }).join('');
      return svgv('0 0 260 230', `${shd(130, 212, 104, 9)}
        <rect x="34" y="22" width="192" height="176" rx="16" fill="${P.navy}"/>
        <rect x="48" y="36" width="164" height="148" rx="10" fill="${P.navy3}" stroke="${P.goldLt}" stroke-width="3"/>
        <circle cx="150" cy="112" r="40" fill="${P.navy}" stroke="${P.gold}" stroke-width="7"/>
        <g stroke="${P.goldLt}" stroke-width="5" stroke-linecap="round">${spokes}</g>
        <circle cx="150" cy="112" r="11" fill="${P.gold}"/>
        <rect x="64" y="70" width="14" height="28" rx="4" fill="${P.gold}"/><rect x="64" y="128" width="14" height="28" rx="4" fill="${P.gold}"/>
        <rect x="52" y="196" width="34" height="12" rx="3" fill="${P.navy}"/><rect x="174" y="196" width="34" height="12" rx="3" fill="${P.navy}"/>`);
    },
    scissors() {
      return svgv('0 0 260 230', `${shd(130, 210, 100, 9)}
        <g transform="rotate(-8 130 110)"><rect x="36" y="58" width="190" height="100" rx="10" fill="${P.goldPale}" stroke="${P.goldDeep}" stroke-width="3"/>
        <circle cx="131" cy="108" r="28" fill="none" stroke="${P.goldDeep}" stroke-width="3"/>
        <text x="131" y="120" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="34" fill="${P.goldDeep}">$</text>
        <path d="M44 132H218" stroke="${P.navy}" stroke-width="3" stroke-dasharray="9 8" stroke-linecap="round"/></g>
        <g transform="translate(150 132) rotate(-18)">
          <path d="M0 -6 L92 -26 L96 -16 L4 6Z" fill="${P.navy}"/><path d="M0 6 L92 26 L96 16 L4 -6Z" fill="${P.navy3}"/>
          <circle cx="0" cy="0" r="6" fill="${P.goldLt}"/>
          <circle cx="-30" cy="-22" r="18" fill="none" stroke="${P.gold}" stroke-width="9"/><circle cx="-30" cy="22" r="18" fill="none" stroke="${P.gold}" stroke-width="9"/>
          <path d="M-14 -14 0 -4M-14 14 0 4" stroke="${P.gold}" stroke-width="8" stroke-linecap="round"/></g>`);
    },
    growth() {
      const bars = [[52, 54], [92, 78], [132, 104], [172, 134]].map(([x, h], i) => `<rect x="${x}" y="${186 - h}" width="30" height="${h}" rx="5" fill="${i === 3 ? P.gold : [P.navy4, P.navy3, P.navy][i]}"/>`).join('');
      return svgv('0 0 260 230', `${shd(130, 204, 104, 9)}
        <path d="M34 188H230" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/>${bars}
        <path d="M46 120C92 116 140 88 196 40" fill="none" stroke="${P.goldDeep}" stroke-width="6" stroke-linecap="round"/>
        <path d="M178 36 200 36 200 58" fill="none" stroke="${P.goldDeep}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="70" cy="56" r="27" fill="${P.navy}"/><text x="70" y="67" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="30" fill="${P.goldLt}">%</text>`);
    },
    nestEgg() {
      const twigs = [0, 1, 2, 3, 4].map((i) => `<path d="M${40 + i * 8} ${150 + (i % 2) * 6}C${90 + i * 10} ${196 - i * 3} ${170 - i * 8} ${196 - i * 3} ${222 - i * 8} ${150 + ((i + 1) % 2) * 6}" fill="none" stroke="${i % 2 ? P.navy3 : P.navy}" stroke-width="7" stroke-linecap="round"/>`).join('');
      return svgv('0 0 260 230', `${shd(130, 210, 100, 9)}
        <ellipse cx="130" cy="98" rx="52" ry="68" fill="${P.gold}"/>
        <ellipse cx="112" cy="74" rx="14" ry="24" fill="${P.goldPale}" opacity=".75"/>
        <path d="M30 146C60 202 200 202 230 146" fill="${P.navy2}"/>${twigs}
        <path d="M36 146h188" stroke="${P.navy}" stroke-width="8" stroke-linecap="round"/>`);
    },
    hourglass() {
      return svgv('0 0 220 260', `${shd(110, 244, 86, 8)}
        <rect x="34" y="18" width="152" height="18" rx="6" fill="${P.navy}"/><rect x="34" y="216" width="152" height="18" rx="6" fill="${P.navy}"/>
        <path d="M54 36h112c0 52-40 66-40 90s40 38 40 90H54c0-52 40-66 40-90S54 88 54 36z" fill="${P.paper}" stroke="${P.navy}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M70 60h80c-6 26-28 38-34 54h-12c-6-16-28-28-34-54z" fill="${P.gold}"/>
        <path d="M110 118v58" stroke="${P.gold}" stroke-width="4" stroke-dasharray="3 7" stroke-linecap="round"/>
        <path d="M62 210c10-24 30-34 48-34s38 10 48 34z" fill="${P.gold}"/>
        <path d="M44 36v180M176 36v180" stroke="${P.navy3}" stroke-width="6" stroke-linecap="round"/>`);
    },
    /** a benefit check; big = the larger, later check */
    check(big) {
      const s = big ? 1.12 : 0.92;
      return svgv('0 0 260 220', `${shd(130, 202, 104 * s, 8)}
        <g transform="translate(130 112) scale(${s}) translate(-130 -112)">
        <rect x="26" y="52" width="208" height="112" rx="10" fill="${P.paper}" stroke="${P.navy}" stroke-width="4"/>
        <rect x="26" y="52" width="208" height="24" rx="10" fill="${P.navy}"/><rect x="26" y="66" width="208" height="10" fill="${P.navy}"/>
        <path d="M46 102h96M46 122h70" stroke="${P.mist2}" stroke-width="7" stroke-linecap="round"/>
        <rect x="150" y="92" width="66" height="34" rx="6" fill="${big ? P.gold : P.goldPale}" stroke="${P.goldDeep}" stroke-width="2.5"/>
        <path d="M46 146c14-12 22-12 26-2s14 8 22-4 14-6 18 2" fill="none" stroke="${P.navy3}" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M160 146h56" stroke="${P.navy}" stroke-width="2.5"/></g>`);
    },
    ssCard() {
      return svgv('0 0 260 220', `${shd(130, 202, 100, 8)}
        <rect x="30" y="40" width="200" height="132" rx="14" fill="${P.navy}"/>
        <rect x="44" y="54" width="172" height="104" rx="8" fill="${P.paper}"/>
        <circle cx="86" cy="96" r="22" fill="${P.gold}"/><path d="M60 140c6-18 18-24 26-24s20 6 26 24" fill="${P.gold}"/>
        <path d="M126 82h70M126 102h58M126 122h70" stroke="${P.mist2}" stroke-width="7" stroke-linecap="round"/>
        <path d="M126 142h40" stroke="${P.goldLt}" stroke-width="7" stroke-linecap="round"/>`);
    },
    blocks() {
      const b = [[40, 150, P.navy4], [82, 122, P.navy3], [124, 94, P.navy], [166, 66, P.gold]].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="56" height="${190 - y}" rx="6" fill="${c}" stroke="${P.paper}" stroke-width="3"/>`).join('');
      return svgv('0 0 260 230', `${shd(130, 206, 104, 9)}${b}
        <path d="M30 192h200" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/>
        <path d="M54 130 96 102 138 74 180 46" fill="none" stroke="${P.goldDeep}" stroke-width="5" stroke-dasharray="4 10" stroke-linecap="round"/>
        <circle cx="194" cy="36" r="13" fill="${P.goldLt}" stroke="${P.goldDeep}" stroke-width="3"/>`);
    },
    calendar() {
      let cells = '';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) cells += `<rect x="${58 + c * 38}" y="${100 + r * 30}" width="26" height="18" rx="4" fill="${(r * 4 + c) % 5 === 3 ? P.gold : P.mist}"/>`;
      return svgv('0 0 260 230', `${shd(130, 210, 100, 9)}
        <rect x="40" y="40" width="180" height="160" rx="14" fill="${P.paper}" stroke="${P.navy}" stroke-width="4"/>
        <path d="M40 54a14 14 0 0 1 14-14h152a14 14 0 0 1 14 14v28H40z" fill="${P.navy}"/>
        <rect x="74" y="26" width="12" height="30" rx="6" fill="${P.gold}"/><rect x="174" y="26" width="12" height="30" rx="6" fill="${P.gold}"/>${cells}
        <g transform="translate(196 176)"><circle r="30" fill="${P.gold}" stroke="${P.paper}" stroke-width="4"/><text y="11" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="30" fill="${P.navy}">$</text></g>`);
    },
    shield() {
      return svgv('0 0 240 250', `${shd(120, 234, 84, 8)}
        <path d="M120 18 206 50v64c0 56-36 94-86 112-50-18-86-56-86-112V50z" fill="${P.navy}"/>
        <path d="M120 36 190 62v52c0 46-29 77-70 93-41-16-70-47-70-93V62z" fill="none" stroke="${P.gold}" stroke-width="5"/>
        <path d="M120 82c-10-14-36-12-36 10 0 20 22 32 36 44 14-12 36-24 36-44 0-22-26-24-36-10z" fill="${P.gold}"/>
        <path d="M86 168h68" stroke="${P.goldLt}" stroke-width="6" stroke-linecap="round"/>`);
    },
    sapling() {
      const coins = [0, 1, 2, 3, 4].map((i) => `<ellipse cx="120" cy="${186 - i * 16}" rx="52" ry="13" fill="${i % 2 ? P.goldLt : P.gold}" stroke="${P.goldDeep}" stroke-width="2.5"/>`).join('');
      return svgv('0 0 240 230', `${shd(120, 210, 86, 8)}
        <path d="M68 186v-64M172 186v-64" stroke="${P.goldDeep}" stroke-width="2.5"/>${coins}
        <path d="M120 116C120 86 118 64 120 40" stroke="${P.navy}" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M120 74C96 74 76 60 72 36 98 36 118 50 120 74z" fill="${P.navy3}"/>
        <path d="M120 60C144 58 164 42 168 18 142 18 122 34 120 60z" fill="${P.navy}"/>`);
    },
    barIcon() {
      const b = [[46, 40], [80, 62], [114, 88], [148, 120]].map(([x, h], i) => `<rect x="${x}" y="${176 - h}" width="24" height="${h}" rx="4" fill="${i === 3 ? P.gold : P.navy3}"/>`).join('');
      return svgv('0 0 220 220', `<rect x="14" y="14" width="192" height="192" rx="36" fill="${P.navy}"/>
        <rect x="30" y="30" width="160" height="160" rx="26" fill="${P.paper}"/>${b}
        <path d="M44 120C80 116 126 96 172 52" fill="none" stroke="${P.goldDeep}" stroke-width="5" stroke-linecap="round"/>
        <path d="M40 178h140" stroke="${P.navy}" stroke-width="4" stroke-linecap="round"/>`);
    },
    pieIcon() {
      return svgv('0 0 220 220', `<rect x="14" y="14" width="192" height="192" rx="36" fill="${P.navy}"/>
        <rect x="30" y="30" width="160" height="160" rx="26" fill="${P.paper}"/>
        <path d="${A.wedge(108, 114, 58, 0, 250)}" fill="${P.navy3}"/><path d="${A.wedge(116, 106, 58, 252, 360)}" fill="${P.gold}"/>
        <circle cx="108" cy="114" r="20" fill="${P.paper}"/>`);
    },
    indexIcon() {
      return svgv('0 0 220 220', `<rect x="14" y="14" width="192" height="192" rx="36" fill="${P.navy}"/>
        <rect x="30" y="30" width="160" height="160" rx="26" fill="${P.paper}"/>
        <path d="M46 150C62 126 70 168 86 140S110 96 124 120 150 70 172 60" fill="none" stroke="${P.mist2}" stroke-width="5" stroke-linecap="round"/>
        <path d="M46 156H86V136H124V112H150V84H174" fill="none" stroke="${P.gold}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M40 172h140" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/>`);
    }
  };

  /* ---------- line chart (house style) with legend and hover read-out ---------- */
  function niceScale(lo, hi, n) {
    if (hi === lo) hi = lo + 1;
    const raw = (hi - lo) / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || 10 * mag;
    return { lo: Math.floor(lo / step) * step, hi: Math.ceil(hi / step) * step, step };
  }
  const tri = (x, y, r) => `M${(x).toFixed(1)},${(y - r).toFixed(1)}L${(x + r * 0.95).toFixed(1)},${(y + r * 0.7).toFixed(1)}L${(x - r * 0.95).toFixed(1)},${(y + r * 0.7).toFixed(1)}Z`;
  function smoothPath(pts) {
    if (pts.length < 3) return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  }
  /** o: {w, h, pad, x:[labels], series:[{values, color, width, marker:'tri'|'dot', smooth}], yMin, yMax, yFmt, ticks} -> {svg, X, Y} */
  function lineChart(o) {
    const w = o.w, h = o.h, pad = Object.assign({ l: 118, r: 30, t: 24, b: 54 }, o.pad || {});
    const all = o.series.flatMap((s) => s.values).filter(isNum);
    const sc = niceScale(o.yMin != null ? o.yMin : Math.min(0, ...all), o.yMax != null ? o.yMax : Math.max(1, ...all), o.ticks || 5);
    const n = o.x.length;
    const X = (i) => pad.l + (n <= 1 ? 0 : (i * (w - pad.l - pad.r)) / (n - 1));
    const Y = (v) => pad.t + (h - pad.t - pad.b) * (1 - (v - sc.lo) / (sc.hi - sc.lo));
    const yf = o.yFmt || ((v) => F.money(v, { compact: Math.abs(v) >= 1e4 }));
    let g = '';
    for (let v = sc.lo; v <= sc.hi + sc.step / 2; v += sc.step) {
      const y = Y(v);
      g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${v === 0 ? P.navy : P.rule}" stroke-width="${v === 0 ? 2 : 1}" opacity="${v === 0 ? 0.5 : 0.8}"/>`;
      g += `<text x="${pad.l - 14}" y="${(y + 6).toFixed(1)}" text-anchor="end" font-family="DM Sans, sans-serif" font-size="17" fill="#667389">${yf(v)}</text>`;
    }
    const every = Math.max(1, Math.ceil(n / (o.xMax || 26)));
    o.x.forEach((lb, i) => {
      const x = X(i);
      g += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${h - pad.b}" y2="${h - pad.b - 8}" stroke="${P.navy}" stroke-width="1.5" opacity=".45"/>`;
      if (i % every === 0 || i === n - 1) g += `<text x="${x.toFixed(1)}" y="${h - pad.b + 28}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="16" fill="#667389">${lb}</text>`;
    });
    g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}" stroke="${P.navy}" stroke-width="2" opacity=".6"/>`;
    o.series.forEach((s) => {
      const pts = s.values.map((v, i) => [X(i), Y(isNum(v) ? v : 0)]);
      const d = s.smooth ? smoothPath(pts) : pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
      g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 5}" stroke-linejoin="round" stroke-linecap="round"/>`;
      if (s.marker) g += pts.map((p) => (s.marker === 'tri' ? `<path d="${tri(p[0], p[1], 8)}" fill="${s.color}" stroke="#fff" stroke-width="1.5"/>` : `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="5.5" fill="${s.color}" stroke="#fff" stroke-width="1.5"/>`)).join('');
    });
    return { svg: `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${g}</svg>`, X, Y, pad };
  }
  /** mount a chart with a legend (click the chart to hide/show it) and a hover read-out */
  function mountChart(ctx, box, o, names, valFmt) {
    const c = lineChart(o);
    box.innerHTML = c.svg + `<div class="b14-legend" style="left:${c.pad.l + 18}px;top:${c.pad.t + 8}px">${o.series.map((s, i) => `<div><span class="k" style="border-color:${s.color}"></span>${names[i]}</div>`).join('')}</div><div class="b14-tip"></div>`;
    const leg = box.querySelector('.b14-legend'), tip = box.querySelector('.b14-tip'), svg = box.querySelector('svg');
    ctx.on(box, 'click', () => leg.classList.toggle('is-off'));
    box.addEventListener('mousemove', (e) => {
      const r = svg.getBoundingClientRect(), k = o.w / r.width, x = (e.clientX - r.left) * k;
      const n = o.x.length; let i = Math.round(((x - c.pad.l) / (o.w - c.pad.l - c.pad.r)) * (n - 1));
      if (i < 0 || i > n - 1 || x < c.pad.l - 20) { tip.classList.remove('on'); return; }
      tip.innerHTML = `<div class="num">${o.x[i]}</div>` + o.series.map((s, j) => `<div><span class="sw" style="background:${s.color}"></span>${names[j]}: <span class="num">${valFmt(s.values[i])}</span></div>`).join('');
      const tx = c.X(i), ty = Math.min(...o.series.map((s) => c.Y(isNum(s.values[i]) ? s.values[i] : 0)));
      tip.style.left = Math.min(o.w - 260, tx + 16) + 'px'; tip.style.top = Math.max(0, ty - 70) + 'px';
      tip.classList.add('on');
    });
    box.addEventListener('mouseleave', () => tip.classList.remove('on'));
  }

  /* ==================================================================================== */
  /* ---------- engines (pure math, exposed for reuse) ---------- */

  /** term premiums plus their lost growth to a later age (app-termins2) */
  const termins2 = {
    /** extend a stored premium list to the coverage years by repeating the previous amount */
    schedule(list, years, def) {
      const n = Math.max(0, Math.round(years || 0));
      const out = (Array.isArray(list) ? list : []).slice(0, Math.max(n, 0)).map((v) => (isNum(+v) ? +v : 0));
      while (out.length < n) out.push(out.length ? out[out.length - 1] : (def == null ? 400 : def));
      return out;
    },
    /** o: {age, years, projectTo, ror (fraction), premiums[]} -> {rows, paid, opp, total} */
    calc(o) {
      const n = Math.max(0, Math.round(o.years || 0)), r = o.ror || 0, L = o.projectTo - o.age;
      const rows = []; let cp = 0, co = 0;
      for (let p = 0; p < n; p++) {
        const prem = +o.premiums[p] || 0;
        const opp = prem * Math.pow(1 + r, L - p) - prem;
        cp += prem; co += opp;
        rows.push({ year: p + 1, age: o.age + p, premium: prem, cumPrem: cp, opp, cumOpp: co, total: cp + co });
      }
      return { rows, paid: cp, opp: co, total: cp + co };
    },
    /** apply the premium dialog: from row s set the amount, growing by inflate each row, for periods rows */
    apply(list, s, amount, periods, inflate, years) {
      const out = list.slice(); let a = amount, i = s;
      const end = s + Math.max(1, Math.round(periods || 1));
      do { out[i] = a; a *= 1 + (inflate || 0); i++; } while (i < years && i < end);
      return out;
    }
  };
  EFA.engines.termins2 = termins2;

  /** opportunity cost of one premium after N years */
  const oneOpp = (P0, r, N) => P0 * Math.pow(1 + r, N) - P0;

  /** sequence of returns (shared by sr2 and sr3) */
  const seqRisk = {
    /** returns for N years from startYear, clamped to the series and padded by cycling */
    returns(s, startYear, N) {
      let st = Math.max(s.first, Math.min(startYear, s.last));
      let en = st + N - 1; if (en > s.last) en = s.last; if (en < st) en = st;
      const out = [];
      for (let y = st; y <= en; y++) { const v = s.values[y - s.first]; out.push(isNum(v) ? v : 0); }
      let i = 0; while (out.length < N && out.length) out.push(out[i++]);
      return out;
    },
    rotate(rA, offset) { const N = rA.length; return rA.map((_, t) => rA[(((t - offset) % N) + N) % N]); },
    /** saving years: no withdrawals; the historic path ends exactly at the goal */
    accumulation(goal, rA, offset) {
      const N = rA.length, Pp = rA.reduce((p, r) => p * (1 + r), 1);
      const g = Math.pow(Math.round(1e6 * Pp) / 1e6, 1 / N) - 1;
      const start = goal / Math.pow(1 + g, N);
      const rB = seqRisk.rotate(rA, offset);
      const rows = []; let a = start, b = start;
      for (let t = 0; t < N; t++) {
        const aB = a, bB = b;
        a = a * (1 + rA[t]); b = b * (1 + rB[t]);
        rows.push({ t, aBoy: aB, aWd: 0, aR: rA[t], aGrowth: a - aB, aEoy: a, bBoy: bB, bWd: 0, bR: rB[t], bGrowth: b - bB, bEoy: b, diff: Math.round(b - a) });
      }
      return { start, rows, rB };
    },
    /** one distribution path: withdrawals at the start of each year, rising with inflation */
    path(A0, W0, inf, r) {
      let b = A0, W = W0, income = 0, lastIdx = -1;
      const rows = [];
      for (let t = 0; t < r.length; t++) {
        let wd, after;
        if (b > W) { wd = W; after = b - W; b = after * (1 + r[t]); } else { wd = b; after = 0; b = 0; if (lastIdx < 0) lastIdx = t; }
        income += wd;
        rows.push({ wd, boy: after, r: r[t], growth: b - after, eoy: b });
        W *= 1 + inf;
      }
      return { rows, income, lastIdx };
    },
    distribution(A0, w, inf, rA, offset) {
      const rB = seqRisk.rotate(rA, offset), W0 = A0 * w;
      const pa = seqRisk.path(A0, W0, inf, rA), pb = seqRisk.path(A0, W0, inf, rB);
      const rows = pa.rows.map((ra, t) => ({ t, aWd: ra.wd, aBoy: ra.boy, aR: ra.r, aGrowth: ra.growth, aEoy: ra.eoy, bWd: pb.rows[t].wd, bBoy: pb.rows[t].boy, bR: pb.rows[t].r, bGrowth: pb.rows[t].growth, bEoy: pb.rows[t].eoy, diff: Math.round(pb.rows[t].eoy - ra.eoy) }));
      const avg = rA.reduce((s, v) => s + v, 0) / (rA.length || 1);
      return { rows, rB, W0, avg };
    },
    /** best and worst starting points over every rotation (R = retirement age, Y = start year) */
    extremes(A0, w, inf, rA, R, Y) {
      const N = rA.length, W0 = A0 * w;
      let worst = { age: 100, income: 1e8, s: 0 }, best = { age: 0, income: 0, s: 0 };
      for (let s = 0; s < N; s++) {
        const p = seqRisk.path(A0, W0, inf, seqRisk.rotate(rA, s));
        const lasts = p.lastIdx >= 0 ? R + p.lastIdx - 1 : R + N;
        const income = p.income + p.rows[N - 1].eoy;
        if (worst.age >= lasts && worst.income > income) worst = { age: lasts, income, s };
        if (best.age <= lasts && best.income < income) best = { age: lasts, income, s };
      }
      const year = (s) => Y + ((N - s) % N);   // recommended fix: rotation 0 starts in the start year
      return { best: Object.assign(best, { year: year(best.s) }), worst: Object.assign(worst, { year: year(worst.s) }) };
    }
  };
  EFA.engines.seqRisk = seqRisk;

  /** structured income streams: laddered blocks */
  const sis = {
    /** t = monthly income in today's dollars. blocks [{years, ror (fraction)}] */
    lump(t, Y, inf, blocks, annuitize, aR) {
      let lump = 0, cum = 0, start = Y; const beg = [];
      blocks.forEach((b) => {
        const n = Math.max(0, Math.round(b.years)), rm = b.ror / 12;
        const pay0 = t * Math.pow(1 + inf, start);
        let Lb;
        if (annuitize) {
          cum += 12 * n * pay0;
          const i = aR / 12;
          const need = i ? pay0 * (1 - Math.pow(1 + i, -12 * n)) / i : pay0 * 12 * n;
          Lb = need / Math.pow(1 + rm, 12 * start);
        } else {
          let S = 0;
          for (let a = 0; a < 12 * n; a++) { const W = t * Math.pow(1 + inf, start + Math.floor(a / 12)); S += W / Math.pow(1 + rm, a + 1); cum += W; }
          Lb = S / Math.pow(1 + rm, 12 * start);
        }
        lump += Lb; beg.push(Lb); start += n;
      });
      return { lump, cum, beg };
    },
    /** highest monthly income a lump sum F can fund (secant, as the original) */
    maxIncome(F0, Y, inf, blocks, annuitize, aR) {
      let t0 = 0, f0 = F0, t1 = 2000, run = sis.lump(t1, Y, inf, blocks, annuitize, aR), f1 = F0 - run.lump;
      for (let k = 0; k < 99; k++) {
        if (f1 === f0) break;
        const step = ((t1 - t0) / (f1 - f0)) * f1;
        if (Math.abs(step) < 0.0049) return Object.assign({ income: t1, ok: true }, run);
        t0 = t1; f0 = f1; t1 -= step; run = sis.lump(t1, Y, inf, blocks, annuitize, aR); f1 = F0 - run.lump;
      }
      return Object.assign({ income: t1, ok: Math.abs(f1) < 1 }, run);
    },
    /** year-by-year table (Year 0..T) */
    table(M, Y, inf, blocks, beg, annuitize) {
      const T = Y + blocks.reduce((s, b) => s + Math.max(0, Math.round(b.years)), 0);
      const rows = [];
      rows.push({ year: 0, monthly: null, annual: null, cum: null, blocks: beg.slice(), total: beg.reduce((s, v) => s + v, 0) });
      const grow = (b, y) => beg[b] * Math.pow(1 + blocks[b].ror / 12, 12 * y);
      for (let y = 1; y <= Y; y++) { const bl = blocks.map((_, b) => Math.round(grow(b, y))); rows.push({ year: y, monthly: 0, annual: 0, cum: 0, blocks: bl, total: Math.round(bl.reduce((s, v) => s + v, 0)) }); }
      let start = Y, cum = 0;
      blocks.forEach((blk, p) => {
        const n = Math.max(0, Math.round(blk.years)), r = blk.ror / 12;
        let B = beg[p] * Math.pow(1 + r, 12 * start);
        for (let y = start + 1; y <= start + n; y++) {
          const monthly = annuitize ? M * Math.pow(1 + inf, start) : M * Math.pow(1 + inf, y - 1);
          cum += 12 * monthly;
          if (!annuitize) B = r ? B * Math.pow(1 + r, 12) - monthly * (Math.pow(1 + r, 12) - 1) / r : B - 12 * monthly;
          const bl = blocks.map((_, b) => (b < p ? 0 : b === p ? (annuitize ? 0 : Math.round(B)) : Math.round(grow(b, y))));
          rows.push({ year: y, monthly: Math.round(monthly), annual: Math.round(12 * monthly), cum: Math.round(cum), blocks: bl, total: Math.round(bl.reduce((s, v) => s + v, 0)) });
        }
        start += n;
      });
      return rows;
    }
  };
  EFA.engines.sis = sis;

  /** cumulative Social Security benefits, early versus late, with yearly COLA */
  function sseolCalc(o) {
    const rows = []; const n = o.projectTo - o.earlyAge + 1, lateStart = o.lateAge - o.earlyAge;
    let e = o.earlyMonthly, l = 0, cE = 0, cL = 0;
    for (let r = 0; r < Math.max(0, n); r++) {
      const ea = 12 * e; cE += ea;
      if (r === lateStart && o.lateAge <= o.projectTo && o.lateAge >= o.earlyAge) l = o.lateMonthly;
      const la = 12 * l; cL += la;
      rows.push({ age: o.earlyAge + r, early: ea, cumE: cE, late: la, cumL: cL, diff: cE - cL, year: r + 1 });
      e *= 1 + o.cola; l *= 1 + o.cola;
    }
    return { rows, cumE: cE, cumL: cL, lateWins: rows.length ? rows[rows.length - 1].diff < 0 : false };
  }
  EFA.engines.sseol = { calc: sseolCalc };

  /** taxable part of Social Security benefits (provisional-income test). th = {single:{base,adjusted}, mfj:{base,adjusted}} */
  function ssTaxable(o, th) {
    const B = o.benefits, L2 = 0.5 * B, PI = L2 + o.other + o.exempt;
    let T17;
    if (o.status === 3) T17 = 0.85 * PI;
    else {
      const t = o.status === 1 ? th.mfj : th.single;
      const over = PI - t.base;
      if (over <= 0) return { taxable: 0, provisional: PI };
      const band = t.adjusted - t.base, above = Math.max(over - band, 0), inBand = Math.min(over, band);
      T17 = Math.min(L2, 0.5 * inBand) + Math.max(0.85 * above, 0);
    }
    return { taxable: Math.min(T17, 0.85 * B), provisional: PI };
  }
  EFA.engines.ssTaxable = ssTaxable;

  /* ==================================================================================== */
  /* ---------- screens ---------- */

  /* small numeric inputs outside ctx.field (dialogs, editable grids) */
  const fmtV = (type, v) => (!isNum(v) ? '' : type === 'money' ? F.money(v) : type === 'pct' ? F.pct(v, 2) : type === 'int' ? F.int(v) : String(v));
  const rawV = (type, v) => (!isNum(v) ? '' : type === 'pct' ? String(+(v * 100).toFixed(4)) : String(+(+v).toFixed(2)));
  function bindNum(inp, type, onSet, o) {
    o = o || {};
    inp.addEventListener('focus', () => { inp.value = rawV(type, inp._v); inp.select(); });
    const read = () => { let v = F.parse(inp.value, type === 'pct'); if (!isFinite(v)) v = inp._v; if (o.min != null) v = Math.max(o.min, v); if (o.max != null) v = Math.min(o.max, v); if (type === 'int') v = Math.round(v); inp._v = v; return v; };
    inp.addEventListener('blur', () => { const v = read(); inp.value = fmtV(type, v); onSet(v); });
    inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
    inp.addEventListener('input', () => { if (o.live) { const v = F.parse(inp.value, type === 'pct'); if (isFinite(v)) { inp._v = v; onSet(v); } } });
  }
  const numIn = (k, type, v, cls) => `<input class="st-input b14-in ${cls || ''}" data-k="${k}" data-type="${type}" inputmode="decimal" autocomplete="off" value="${fmtV(type, v)}">`;
  function initNum(root, k, v) { const inp = root.querySelector(`[data-k="${k}"]`); if (inp) inp._v = v; return inp; }

  /* ---------- Taxation of Social Security Benefits ---------- */
  EFA.screen('taxonss1', {
    title: 'How much of Social Security is taxable',
    copy: {
      head: 'Taxation of Social Security Benefits',
      lblStatus: 'Your Filing Status', lblBen: 'Total Social Security Benefits', lblOther: 'Other Income', lblExempt: 'Tax Exempt Interest', lblBracket: 'Tax Bracket',
      st0: 'Single Tax Payer', st1: 'Married Filing Jointly', st2: 'MFS Living Apart', st3: 'MFS Living Together',
      calc: 'Calculate',
      r1a: 'Based on these figures, about', r1b: 'of your Social Security benefits would be taxable.',
      r2a: 'If all of it is taxed at', r2b: ', the tax on your benefits would be about', r2c: '.',
      pending: 'The federal threshold figures for this test are being verified. Your result will appear here as soon as they are confirmed.',
      disc: 'A simplified estimate for discussion only. It applies one flat bracket and leaves out state taxes, deductions and other adjustments.',
      _wait: 'Figures being verified', _loading: 'This tool is still loading. Please try again in a moment.',
      _notes: 'Many people are surprised to learn their Social Security can be taxed. Other income, even tax-exempt interest, can pull more of your benefits into taxable income.\n\n- Ask: Has anyone ever shown you how your other income changes the tax on your Social Security?\nPAUSE\n\n- This is an estimate at one bracket. A tax professional confirms the exact figure.'
    },
    render(ctx) {
      const st = visitState(ctx, () => ({ shown: false }));
      const th = dget('ss.taxability');
      const ok = !!(th && th.single && th.mfj && isNum(th.single.base) && isNum(th.single.adjusted) && isNum(th.mfj.base) && isNum(th.mfj.adjusted));
      const status = cget('retirement_tax_filing_status_index', 1);
      ctx.el.innerHTML = `
        <div class="b14-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${med(ART.ssCard(), 210, 330, 180)}${med(A.ill.taxes(), 1390, 330, 180)}
        <div class="b14-panel b14-form" style="left:330px;top:162px;width:940px">
          ${frow(ctx, 'lblStatus', dropdown(ctx, { id: 'status', value: status, options: [0, 1, 2, 3].map((v) => ({ value: v, key: 'st' + v })) }), { cls: 'wide' })}
          ${frow(ctx, 'lblBen', sfield(ctx, { id: 'ben', key: 'retirement_ss_benefit_total', def: 24000, type: 'money', min: 0 }), { forId: fid(ctx, 'ben') })}
          ${frow(ctx, 'lblOther', sfield(ctx, { id: 'other', key: 'retirement_other_income', def: 50000, type: 'money', min: 0 }), { forId: fid(ctx, 'other') })}
          ${frow(ctx, 'lblExempt', sfield(ctx, { id: 'exempt', key: 'retirement_tax_exempt_interest', def: 0, type: 'money', min: 0 }), { forId: fid(ctx, 'exempt') })}
          ${frow(ctx, 'lblBracket', sfield(ctx, { id: 'bracket', key: 'retirement_tax_bracket', def: 0.25, type: 'pct', min: 0, max: 1, dp: 0 }), { forId: fid(ctx, 'bracket') })}
        </div>
        <div class="b14-center b14-calc" style="top:516px"><button type="button" class="st-pill b14-pill-gold" data-calc style="min-width:220px;font-size:20px">${ctx.t('calc')}</button></div>
        <div class="b14-panel b14-res" style="left:200px;top:516px;width:1200px;padding:28px 44px;display:grid;gap:22px;text-align:center"></div>
        ${discP(ctx, ['disc', '@notAdvice'], 'top:742px')}`;
      const res = ctx.$('.b14-res');
      const draw = () => {
        ctx.$('.b14-calc').hidden = st.shown; res.hidden = !st.shown;
        if (!st.shown) return;
        if (!ok) { res.innerHTML = `<p class="st-body" style="color:#667389">${ctx.t('pending')}</p>`; return; }
        const v = ctx.values();
        const out = ssTaxable({ benefits: v.ben || 0, other: v.other || 0, exempt: v.exempt || 0, status: cget('retirement_tax_filing_status_index', 1) }, th);
        const tax = out.taxable * (v.bracket || 0);
        res.innerHTML = `<p class="st-body" style="font-weight:600">${sentence(ctx, ['r1a', { v: money(out.taxable), cls: 'b14-gold' }, 'r1b'])}</p>
          <p class="st-body" style="font-weight:600">${sentence(ctx, ['r2a', { v: pctTrim(v.bracket || 0) }, 'r2b', { v: money(tax), cls: 'b14-gold' }, 'r2c'])}</p>`;
      };
      bindDropdown(ctx, 'status', (val) => { cset('retirement_tax_filing_status_index', +val); EFA.player.renderScreen({ noFade: true }); });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { st.shown = true; draw(); });
      ctx.onFields((vals) => { syncShared(ctx, vals); draw(); });
      draw();
    },
    leave: markLeft
  });

  /* ---------- Term Insurance 1: one year of premium ---------- */
  EFA.screen('termins1', {
    title: 'The real cost of one year of term premium',
    copy: {
      head: 'What Does Term Insurance Really Cost?',
      lblAge: 'Current Age', lblPrem: 'Premium For 1 Year', lblRor: 'Investment Return',
      calc: 'Calculate',
      resA: 'At age', resB: ", this year's premium will have cost you, in lost growth:",
      all: 'Show All Years',
      wsTitle: 'Opportunity Cost of a Single Premium Payment', wsAge: 'Age', wsOpp: 'Opportunity Cost',
      disc: 'It assumes a fixed rate of return. Term coverage may be exactly the protection you need; this shows only what one premium could have grown to if it had been invested instead.',
      _wait: 'Figures being verified', _loading: 'This tool is still loading. Please try again in a moment.',
      _notes: 'Every premium dollar has two costs: the dollar itself, and everything that dollar could have earned for you.\n\n- Ask: When you bought your coverage, did anyone show you the second cost?\nPAUSE\n\n- This is not a case against term insurance. It is about seeing the full price of any dollar that leaves.'
    },
    render(ctx) {
      const st = visitState(ctx, () => ({ shown: false }));
      ctx.el.innerHTML = `
        <div class="b14-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${med(ART.shield(), 252, 272, 214)}${med(ART.sapling(), 1348, 272, 214)}
        <div class="b14-panel b14-form" style="left:400px;top:168px;width:800px">
          ${frow(ctx, 'lblAge', sfield(ctx, { id: 'age', key: 'case_file_current_age', def: 42, type: 'int', min: 0, max: 120 }), { forId: fid(ctx, 'age') })}
          ${frow(ctx, 'lblPrem', sfield(ctx, { id: 'prem', key: 'term_annual_premium', def: 400, type: 'money', min: 0 }), { forId: fid(ctx, 'prem') })}
          ${frow(ctx, 'lblRor', sfield(ctx, { id: 'ror', key: 'case_file_ror_accumulation', def: 0.06, type: 'pct', min: 0, max: 0.12 }), { forId: fid(ctx, 'ror') })}
        </div>
        <div class="b14-center b14-calc" style="top:410px"><button type="button" class="st-pill b14-pill-gold" data-calc style="min-width:220px;font-size:20px">${ctx.t('calc')}</button></div>
        <div class="b14-res" style="position:absolute;left:160px;top:410px;width:1280px">
          <div class="b14-panel" style="position:relative;padding:16px 44px">
            <div class="b14-r1" style="display:flex;align-items:center;justify-content:space-between;gap:30px;min-height:84px;border-bottom:1px solid rgba(13,30,58,.1)"></div>
            <div class="b14-r2" style="display:flex;align-items:center;justify-content:space-between;gap:30px;min-height:84px"></div>
          </div>
          <div style="text-align:center;margin-top:22px"><button type="button" class="b14-link" data-all>${ctx.t('all')}</button></div>
        </div>
        ${discP(ctx, ['@hypothetical', 'disc'], 'top:700px')}`;
      const draw = () => {
        ctx.$('.b14-calc').hidden = st.shown; ctx.$('.b14-res').hidden = !st.shown;
        const v = ctx.values(), age = Math.round(v.age || 0), P0 = v.prem || 0, r = v.ror || 0;
        const ms = age >= 65 ? [[age + 10, 10], [age + 20, 20]] : [[65, 65 - age], [80, 80 - age]];
        ['.b14-r1', '.b14-r2'].forEach((sel, i) => {
          ctx.$(sel).innerHTML = `<span class="st-body">${sentence(ctx, ['resA', { v: F.int(ms[i][0]), cls: '' }, 'resB'])}</span><span class="b14-big b14-gold num">${money(Math.round(oneOpp(P0, r, ms[i][1])))}</span>`;
        });
      };
      ctx.on(ctx.$('[data-calc]'), 'click', () => { st.shown = true; draw(); });
      guardRor(ctx, 'ror');
      ctx.on(ctx.$('[data-all]'), 'click', () => {
        const v = ctx.values(), age = Math.round(v.age || 0), rows = [];
        for (let a = age, s = 0; a <= 100; a++, s++) rows.push({ age: a, opp: oneOpp(v.prem || 0, v.ror || 0, s) });
        openSheet(ctx, { heading: ctx.t('wsTitle'), size: 'small', columns: [{ field: 'age', header: ctx.t('wsAge'), type: 'age' }, { field: 'opp', header: ctx.t('wsOpp'), type: 'money', dp: 2 }], rows,
          assumptions: [{ label: ctx.t('lblPrem'), value: money(v.prem || 0) }, { label: ctx.t('lblRor'), value: pctTrim(v.ror || 0) }] });
      });
      ctx.onFields((vals) => { syncShared(ctx, vals); draw(); });
      draw();
    },
    leave: markLeft
  });

  /* ---------- Term Insurance 2 (app-termins2; OCMP shows the same screen) ---------- */
  EFA.screen('termins2', {
    title: 'Opportunity cost of a full term policy',
    copy: {
      head: 'What Is the Opportunity Cost of Term Insurance?',
      lblFace: 'Policy Face Value', lblAge: 'Current Age', lblYears: 'Years of Coverage', lblTo: 'Project to Age', lblRor: 'Investment Return',
      btnEnter: 'Enter Premiums', btnHide: 'Hide Premiums', tblTitle: 'Enter Premiums', colAge: 'Age', colPrem: 'Premium',
      r1a: 'The premiums you actually pay over', r1b: 'years of coverage will be:',
      r2a: 'At age', r2b: ', the opportunity cost of those', r2c: 'years of coverage will be:',
      total: 'Total', doc: 'Documentation',
      dlgTitle: 'Premium Schedule', dlgAmt: 'Amount', dlgPer: '# of Periods', dlgInf: 'Inflate Rate', cancel: 'Cancel', enter: 'Enter',
      wsTitle: 'Opportunity Cost of Term Insurance', wsAge: 'Age', wsPrem: 'Annual Premium', wsCumPrem: 'Cumulative Premiums', wsOpp: 'Opportunity Cost to Age', wsCumOpp: 'Cumulative Opportunity Cost to Age', wsTotal: 'Cumulative Premiums plus Cumulative Opportunity Cost', wsYear: 'Year',
      disc: 'It assumes a fixed rate of return on money not spent on premiums and is not a recommendation for or against any coverage.',
      _wait: 'Figures being verified', _loading: 'This tool is still loading. Please try again in a moment.',
      _notes: 'Term premiums are paid with real dollars, and each of those dollars could have kept working for you. This totals both costs over the life of the policy.\n\n- Click Enter Premiums to type the actual premium schedule from the illustration; click a row to change it.\n- Ask: If you could keep the protection and also recapture part of that cost, would that be worth a conversation?\nPAUSE'
    },
    render(ctx) {
      const st = visitState(ctx, () => ({ view: 'inputs', shown: false, sel: -1, periods: null, inflate: 0 }));
      ctx.el.innerHTML = `
        <div class="b14-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${med(ART.shield(), 250, 300, 220)}${med(ART.sapling(), 1350, 300, 220)}
        <div class="b14-panel b14-form b14-inp" style="left:400px;top:150px;width:800px">
          ${frow(ctx, 'lblFace', sfield(ctx, { id: 'face', key: 'term_face_value', def: 250000, type: 'money', min: 0 }), { forId: fid(ctx, 'face') })}
          ${frow(ctx, 'lblAge', sfield(ctx, { id: 'age', key: 'case_file_current_age', def: 42, type: 'int', min: 0, max: 120 }), { forId: fid(ctx, 'age') })}
          ${frow(ctx, 'lblYears', sfield(ctx, { id: 'years', key: 'term_years_of_coverage', def: 20, type: 'int', min: 0, max: 80 }), { forId: fid(ctx, 'years') })}
          ${frow(ctx, 'lblTo', sfield(ctx, { id: 'to', key: 'term_project_to_age', def: 85, type: 'int', min: 0, max: 120 }), { forId: fid(ctx, 'to') })}
          ${frow(ctx, 'lblRor', sfield(ctx, { id: 'ror', key: 'case_file_ror_accumulation', def: 0.06, type: 'pct', min: 0, max: 0.12 }), { forId: fid(ctx, 'ror') })}
        </div>
        <div class="b14-tblv" style="position:absolute;left:642px;top:146px;width:480px">
          <div class="st-h3" style="text-align:center;margin-bottom:12px">${ctx.t('tblTitle')}</div>
          <div class="b14-tw" style="position:relative;height:560px"><table class="st-table"><thead><tr><th style="text-align:center">${ctx.t('colAge')}</th><th>${ctx.t('colPrem')}</th></tr></thead><tbody class="b14-prem"></tbody></table></div>
        </div>
        <div class="b14-abs" style="left:400px;top:510px;width:222px;display:flex;justify-content:flex-start"><button type="button" class="st-pill b14-pill-gold" data-tog style="min-width:222px;font-size:19px"><span class="t-enter">${ctx.t('btnEnter')}</span><span class="t-hide">${ctx.t('btnHide')}</span></button></div>
        <div class="b14-res" style="position:absolute;left:110px;top:590px;width:1380px">
          <div class="b14-panel" style="position:relative;padding:10px 40px 12px">
            <div class="b14-r1" style="display:flex;align-items:center;justify-content:space-between;gap:30px;min-height:58px"></div>
            <div class="b14-r2" style="display:flex;align-items:center;justify-content:space-between;gap:30px;min-height:58px"></div>
            <div style="display:flex;justify-content:flex-end"><div class="b14-r3" style="display:flex;align-items:center;justify-content:space-between;gap:40px;min-width:420px;min-height:56px;border-top:2px solid #0d1e3a"></div></div>
          </div>
          <div style="display:flex;align-items:baseline;gap:28px;margin-top:16px"><button type="button" class="b14-link" data-doc>${ctx.t('doc')}</button>${discP(ctx, ['@hypothetical', 'disc'], 'position:static;flex:1;text-align:left;margin:0')}</div>
        </div>`;
      const vals = () => { const v = ctx.values(); return { age: Math.round(v.age || 0), years: Math.max(0, Math.round(v.years || 0)), to: Math.round(v.to || 0), ror: v.ror || 0 }; };
      const sched = () => { const v = vals(); return termins2.schedule(cget('case_file_term_premium_list', null), v.years, 400); };
      const calc = () => { const v = vals(); return termins2.calc({ age: v.age, years: v.years, projectTo: v.to, ror: v.ror, premiums: sched() }); };
      const drawTable = () => {
        const v = vals(), list = sched();
        ctx.$('.b14-prem').innerHTML = list.map((p, i) => `<tr class="pick ${i === st.sel ? 'sel' : ''}" data-row="${i}"><td style="text-align:center">${F.int(v.age + i)}</td><td>${money(p)}</td></tr>`).join('');
        ctx.$$('.b14-prem tr').forEach((tr) => ctx.on(tr, 'click', () => { st.sel = +tr.dataset.row; drawTable(); editRow(st.sel); }));
      };
      const drawRes = () => {
        const v = vals(), c = calc();
        ctx.$('.b14-r1').innerHTML = `<span class="st-body">${sentence(ctx, ['r1a', { v: F.int(v.years), cls: '' }, 'r1b'])}</span><span class="b14-big num">${money(c.paid)}</span>`;
        ctx.$('.b14-r2').innerHTML = `<span class="st-body">${sentence(ctx, ['r2a', { v: F.int(v.to), cls: '' }, 'r2b', { v: F.int(v.years), cls: '' }, 'r2c'])}</span><span class="b14-big num">${money(c.opp)}</span>`;
        ctx.$('.b14-r3').innerHTML = `<span class="st-label">${ctx.t('total')}</span><span class="b14-big b14-gold num" style="font-size:40px">${money(c.total)}</span>`;
      };
      const apply = () => {
        const tbl = st.view === 'table';
        ctx.$('.b14-inp').hidden = tbl; ctx.$('.b14-tblv').hidden = !tbl;
        ctx.$('.t-enter').hidden = tbl; ctx.$('.t-hide').hidden = !tbl;
        ctx.$('.b14-res').hidden = tbl || !st.shown;
        if (tbl) drawTable(); else if (st.shown) drawRes();
      };
      const editRow = (i) => {
        const v = vals(), list = sched();
        if (st.periods == null) st.periods = v.years;
        const dlg = document.createElement('div'); dlg.className = 'b14-modal';
        dlg.innerHTML = `<div class="b14-modal-in" role="dialog" aria-modal="true"><div class="b14-modal-h">${ctx.t('dlgTitle')}</div>
          <div class="b14-modal-b b14-form" style="padding:10px 28px">
            ${frow(ctx, 'dlgAmt', numIn('amt', 'money', list[i]))}
            ${frow(ctx, 'dlgPer', numIn('per', 'int', st.periods))}
            ${frow(ctx, 'dlgInf', numIn('inf', 'pct', st.inflate), { after: infDot(ctx, { instance: 'termins2', onUse: (x) => { const el = dlg.querySelector('[data-k="inf"]'); if (el) { el._v = x; el.value = fmtV('pct', x); } st.inflate = x; } }) })}
          </div>
          <div class="b14-modal-f"><button type="button" class="st-pill b14-pill-ghost" data-x style="min-width:150px">${ctx.t('cancel')}</button><button type="button" class="st-pill b14-pill-gold" data-ok style="min-width:150px">${ctx.t('enter')}</button></div></div>`;
        ctx.el.appendChild(dlg);
        const amt = initNum(dlg, 'amt', list[i]), per = initNum(dlg, 'per', st.periods), inf = initNum(dlg, 'inf', st.inflate);
        bindNum(amt, 'money', () => {}, { min: 0 }); bindNum(per, 'int', (x) => { st.periods = x; }, { min: 1 }); bindNum(inf, 'pct', (x) => { st.inflate = x; });
        const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); } };
        document.addEventListener('keydown', onKey, true);
        const close = () => { document.removeEventListener('keydown', onKey, true); dlg.remove(); };
        ctx.on(dlg.querySelector('[data-x]'), 'click', close);
        ctx.on(dlg.querySelector('[data-ok]'), 'click', () => {
          [amt, per, inf].forEach((x) => { if (document.activeElement === x) x.blur(); });
          st.periods = per._v; st.inflate = inf._v || 0;
          cset('case_file_term_premium_list', termins2.apply(sched(), i, amt._v || 0, st.periods, st.inflate, vals().years));
          close(); drawTable();
        });
        ctx.timeout(() => { amt.focus(); }, 60);
      };
      ctx.on(ctx.$('[data-tog]'), 'click', () => {
        if (st.view === 'table') { st.view = 'inputs'; st.shown = true; } else st.view = 'table';
        apply();
      });
      guardRor(ctx, 'ror');
      ctx.on(ctx.$('[data-doc]'), 'click', () => {
        const v = vals(), c = calc(), m = (f, k, x) => ({ field: f, header: x ? `${ctx.t(k)} <span class="num">${x}</span>` : ctx.t(k), type: 'money', dp: 2 });
        openSheet(ctx, {
          heading: ctx.t('wsTitle'), size: 'full',
          columns: [{ field: 'age', header: ctx.t('wsAge'), type: 'age' }, m('prem', 'wsPrem'), m('cumPrem', 'wsCumPrem'), m('opp', 'wsOpp', v.to), m('cumOpp', 'wsCumOpp', v.to), m('total', 'wsTotal'), { field: 'year', header: ctx.t('wsYear'), type: 'year' }],
          rows: c.rows.map((r) => ({ age: r.age, prem: r.premium, cumPrem: r.cumPrem, opp: r.opp, cumOpp: r.cumOpp, total: r.total, year: r.year })),
          assumptions: [{ label: ctx.t('lblFace'), value: money(ctx.values().face || 0) }, { label: ctx.t('lblRor'), value: pctTrim(v.ror) }]
        });
      });
      ctx.onFields((v) => { syncShared(ctx, v); apply(); });
      apply();
    },
    leave: markLeft
  });
  /* OCMP #1 renders the same app-termins2 component with no inputs: same screen, its own id */
  EFA.screen('ocmp1', Object.assign({}, EFA.screens.termins2, { id: undefined, title: 'Opportunity cost of term insurance premiums', copy: Object.assign({}, EFA.screens.termins2.copy) }));

  /* ---------- Savings Efficiency ---------- */
  EFA.screen('saveEff1', {
    title: 'Savings efficiency',
    copy: {
      head: 'Trimming Expenses Is Sound Money Management',
      lblInc: 'Annual Income', lblSav: 'Annual Savings', lblRor: 'ROR on Savings', lblInt: 'Interest on Savings', lblExp: 'Annual Expenses',
      calc: 'Calculate', cont: 'Continue', repeat: 'Repeat', togPct: '% to $', togAmt: '$ to %',
      c1: 'Reduce Expenses By', c2: 'Dollars Saved Each Year', c3a: 'Return Your', c3b: 'Savings Would Need to Earn', c4: "Let's Check the Math", of: 'of', eq: 'equals', c5: 'Proof',
      _loading: 'This tool is still loading. Please try again in a moment.',
      _notes: 'A dollar you stop wasting is a dollar you keep, with no market risk and no tax on the "gain."\n\n- Ask: What return would your savings have to earn to match a one percent cut in spending?\nPAUSE\n\n- Reveal the columns one at a time. Let the client say the answer before you show the proof.'
    },
    render(ctx) {
      const st = visitState(ctx, () => ({ phase: 0, cal: 0, pct: true, cutPct: 0.01, cutAmt: 1000 }));
      const W = 1280, unit = W / 6;
      const cols = [{ k: 1, w: unit }, { k: 2, w: unit }, { k: 3, w: unit }, { k: 4, w: 2 * unit }, { k: 5, w: unit }];
      ctx.el.innerHTML = `
        <div class="b14-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${med(ART.scissors(), 262, 300, 230)}${med(ART.growth(), 1338, 300, 230)}
        <div class="b14-panel b14-form" style="left:440px;top:150px;width:720px">
          ${frow(ctx, 'lblInc', sfield(ctx, { id: 'inc', key: 'case_file_current_income', def: 102000, type: 'money', min: 0 }), { forId: fid(ctx, 'inc') })}
          ${frow(ctx, 'lblSav', sfield(ctx, { id: 'sav', key: 'case_file_annual_savings', def: 6000, type: 'money', min: 0 }), { forId: fid(ctx, 'sav') })}
          ${frow(ctx, 'lblRor', sfield(ctx, { id: 'ror', key: 'case_file_ror_accumulation', def: 0.06, type: 'pct', min: 0, max: 0.12 }), { forId: fid(ctx, 'ror') })}
          ${frow(ctx, 'lblInt', '<div class="b14-ro quiet num" data-out="int"></div>')}
          ${frow(ctx, 'lblExp', '<div class="b14-ro quiet num" data-out="exp"></div>')}
          <button type="button" class="st-pill b14-pill-gold" data-calc style="position:absolute;right:30px;bottom:12px;width:220px;height:112px;border-radius:16px;font-size:24px">${ctx.t('calc')}</button>
        </div>
        <div class="b14-center b14-strip" style="top:474px"><button type="button" class="st-pill" data-c0 style="min-width:200px">${ctx.t('cont')}</button></div>
        <div class="b14-panel b14-resp" style="left:160px;top:530px;width:${W}px;height:248px;display:flex;overflow:hidden">
          ${cols.map((c, i) => `<div class="b14-col" data-col="${c.k}" style="position:relative;width:${c.w}px;${i ? 'border-left:1px solid rgba(13,30,58,.1);' : ''}">
            <div class="b14-cc" style="position:absolute;left:14px;right:14px;top:16px;text-align:center;font:600 17px/1.3 'DM Sans',sans-serif;color:#8a6e22"></div>
            <div class="b14-cv" style="position:absolute;left:10px;right:10px;top:104px;display:flex;justify-content:center;align-items:center;text-align:center"></div>
            <div class="b14-cb" style="position:absolute;left:0;right:0;bottom:16px;display:flex;justify-content:center"></div>
          </div>`).join('')}
        </div>
        <div class="b14-abs b14-tog" style="left:160px;top:790px;width:${W}px;display:flex;justify-content:center"><button type="button" class="st-pill b14-pill-ghost" data-mode style="min-height:38px;font-size:16px;padding:6px 18px"><span class="m-pct">${ctx.t('togPct')}</span><span class="m-amt">${ctx.t('togAmt')}</span></button></div>
        <div class="b14-abs b14-rep" style="left:160px;top:786px;width:${W}px;display:flex;justify-content:flex-end;pointer-events:none"><button type="button" class="st-pill" data-repeat style="min-width:160px;pointer-events:auto">${ctx.t('repeat')}</button></div>`;
      // column 1 holds the reduction input (percent or dollars)
      const c1v = ctx.$('[data-col="1"] .b14-cv');
      c1v.innerHTML = `<div class="m-pct" style="width:150px">${lfield(ctx, { id: 'cutPct', type: 'pct', def: 0.01, min: 0, max: 1 }, st)}</div><div class="m-amt" style="width:170px">${lfield(ctx, { id: 'cutAmt', type: 'money', def: 1000, min: 0 }, st)}</div>`;
      const calc = () => {
        const v = ctx.values(), sav = v.sav || 0, exp = (v.inc || 0) - sav;
        const savings = st.pct ? exp * (st.cutPct || 0) : (st.cutAmt || 0);
        return { sav, int: sav * (v.ror || 0), exp, savings, req: sav > 0 ? Math.round((savings / sav) * 100 * 100) / 100 : null };
      };
      const pctOut = (x) => (x == null ? '–' : F.num(x, Math.abs(x % 1) > 1e-9 ? (Math.abs((x * 10) % 1) > 1e-9 ? 2 : 1) : 0) + '%');
      const draw = () => {
        const c = calc();
        ctx.$('[data-out="int"]').textContent = money(c.int); ctx.$('[data-out="exp"]').textContent = money(c.exp);
        ctx.$$('[data-out]').forEach((n) => { n.style.visibility = st.phase >= 1 ? 'visible' : 'hidden'; });
        ctx.$('[data-calc]').hidden = st.phase >= 1;
        ctx.$('.b14-strip').hidden = st.phase !== 1;
        ctx.$('.b14-resp').hidden = st.phase < 2; ctx.$('.b14-tog').hidden = st.phase < 2;
        ctx.$('.b14-rep').hidden = !(st.phase >= 2 && st.cal === 4);
        ctx.$$('.m-pct').forEach((n) => { n.hidden = !st.pct; }); ctx.$$('.m-amt').forEach((n) => { n.hidden = st.pct; });
        const caps = { 1: ctx.t('c1'), 2: ctx.t('c2'), 3: sentence(ctx, ['c3a', { v: money(c.sav), cls: '' }, 'c3b']), 4: ctx.t('c4'), 5: ctx.t('c5') };
        const vals = {
          2: `<span class="b14-big num">${money(c.savings)}</span>`,
          3: `<span class="b14-big b14-gold num" style="font-size:40px">${pctOut(c.req)}</span>`,
          4: `<span class="st-body" style="font-weight:600"><span class="num">${pctOut(c.req)}</span> ${ctx.t('of')} <span class="num">${money(c.sav)}</span> ${ctx.t('eq')}</span>`,
          5: `<span class="b14-big b14-gold num" style="font-size:40px">${money(c.req == null ? NaN : c.sav * c.req / 100)}</span>`
        };
        for (let k = 1; k <= 5; k++) {
          const col = ctx.$(`[data-col="${k}"]`), open = k === 1 || st.cal >= k - 1;
          col.querySelector('.b14-cc').innerHTML = open ? caps[k] : '';
          if (k > 1) col.querySelector('.b14-cv').innerHTML = open ? vals[k] : '';
          col.querySelector('.b14-cb').innerHTML = (!open && k === st.cal + 2) ? `<button type="button" class="st-pill" data-cont style="min-width:150px">${ctx.t('cont')}</button>` : '';
          col.style.background = open && k > 1 && k === st.cal + 1 ? 'rgba(240,230,196,.35)' : '';
        }
        const b = ctx.$('[data-cont]'); if (b) ctx.on(b, 'click', () => { st.cal = Math.min(4, st.cal + 1); draw(); });
        EFA.numify(ctx.el);
      };
      ctx.on(ctx.$('[data-calc]'), 'click', () => { st.phase = 1; draw(); });
      ctx.on(ctx.$('[data-c0]'), 'click', () => { st.phase = 2; st.cal = 0; draw(); });
      ctx.on(ctx.$('[data-repeat]'), 'click', () => { st.cal = 0; draw(); });
      ctx.on(ctx.$('[data-mode]'), 'click', () => { st.pct = !st.pct; st.cal = 0; draw(); });
      guardRor(ctx, 'ror');
      ctx.onFields((v) => { syncShared(ctx, v); if (isNum(v.cutPct)) st.cutPct = v.cutPct; if (isNum(v.cutAmt)) st.cutAmt = v.cutAmt; draw(); });
      draw();
    },
    leave: markLeft
  });

  /* ---------- Tax Master launch pad ---------- */
  EFA.css('b14-tm', `
  .stage .b14-tmtxt { font: 600 33px/1.36 "DM Sans", sans-serif; color: #0d1e3a; column-gap: 26px !important; }
  .stage .b14-tiles { display: grid; grid-template-columns: repeat(3, 1fr); justify-items: center; }
  .stage .b14-tile-w { display: grid; justify-items: center; gap: 22px; }
  .stage .b14-tile { width: 232px; height: 232px; border: 0; padding: 0; background: transparent; cursor: pointer; border-radius: 42px; box-shadow: 0 18px 40px rgba(13,30,58,.18); transition: transform .25s ease, box-shadow .25s ease; }
  .stage .b14-tile:hover { transform: translateY(-4px); box-shadow: 0 24px 50px rgba(13,30,58,.24); }
  .stage .b14-tile svg { width: 100%; height: 100%; display: block; }
  .stage .b14-tile-w .b14-link { font-size: 22px; }
  `);
  EFA.screen('tm1', {
    title: 'Tax Master launch pad',
    copy: {
      s1: 'Compound interest is often called one of the wonders of the world, and you have likely heard just how powerful it can be.',
      s2: 'Like any good magic trick, the wow can hide a few details. They are worth a closer look before you count on it.',
      cap1: 'Compound Interest Tutorial', cap2: 'Buy Term, Invest the Difference', cap3: 'IFR Tutorial',
      _notes: 'Compounding is real, and it is powerful. The question is what quietly works against it: taxes, fees, timing and the cost of the money itself.\n\n- Ask: When you picture your money compounding, do you picture it before or after taxes?\nPAUSE\n\n- Pick the tutorial that fits the conversation. Each one returns here when it ends.'
    },
    render(ctx) {
      const tiles = [['cap1', ART.barIcon(), 'CIT', 'cit1'], ['cap2', ART.pieIcon(), 'BTID', 'btid1'], ['cap3', ART.indexIcon(), 'IFR', 'ifr1']];
      ctx.el.innerHTML = `
        ${blist(ctx, [ctx.t('s1'), ctx.t('s2')], { reveal: false, boxed: true, size: 96, gap: 28, text: 'b14-tmtxt', style: 'position:absolute;left:110px;top:62px;width:1380px' })}
        <div class="b14-abs b14-tiles" style="left:110px;top:476px;width:1380px">
          ${tiles.map(([k, art, key, sid]) => `<div class="b14-tile-w"><button type="button" class="b14-tile" data-go="${key}|${sid}" aria-label="${ctx.esc(ctx.text(k))}">${art}</button><button type="button" class="b14-link" data-go="${key}|${sid}">${ctx.t(k)}</button></div>`).join('')}
        </div>`;
      ctx.on(ctx.$$('[data-go]'), 'click', (e, n) => { const [k, s] = n.dataset.go.split('|'); ctx.jump(k, s); });
    }
  });

  /* ---------- Safe Account Benefits ---------- */
  EFA.css('b14-sab', `
  .stage .b14-ben { display: flex; align-items: center; gap: 12px; height: 52px; padding: 0 14px; border-radius: 11px; border: 1px solid #d6cfc4; background: #fffdf8; font: 600 17px/1.15 "DM Sans", sans-serif; color: #0d1e3a; transition: background .45s ease, border-color .45s ease, box-shadow .45s ease; box-sizing: border-box; }
  .stage .b14-ben .ck { width: 24px; height: 24px; flex: 0 0 auto; border-radius: 50%; border: 2px solid #cbd5e3; display: grid; place-items: center; box-sizing: border-box; transition: background .45s ease, border-color .45s ease; }
  .stage .b14-ben .ck svg { opacity: 0; transition: opacity .45s ease; }
  .stage .b14-ben.on { background: linear-gradient(120deg, #e3cf86, #b8972e); border-color: #b8972e; box-shadow: 0 8px 18px rgba(184,151,46,.26); font-weight: 700; }
  .stage .b14-ben.on .ck { background: #0d1e3a; border-color: #0d1e3a; }
  .stage .b14-ben.on .ck svg { opacity: 1; }
  .stage .b14-ctxt { font: 600 21px/1.36 "DM Sans", sans-serif; color: #0d1e3a; column-gap: 18px !important; }
  .stage .b14-pg { position: absolute; right: 20px; bottom: 20px; width: 56px; height: 56px; border-radius: 50%; border: 0; background: #0d1e3a; color: #f7f5f1; display: grid; place-items: center; box-shadow: 0 8px 20px rgba(13,30,58,.3); cursor: pointer; transition: background .2s ease, transform .2s ease; }
  .stage .b14-pg:hover { background: #b8972e; color: #0d1e3a; transform: translateY(-2px); }
  .stage .b14-empty { position: absolute; inset: 0; display: grid; place-items: center; align-content: center; gap: 22px; text-align: center; }
  .stage .b14-empty svg { width: 230px; height: 204px; }
  `);
  const SAB_BEN = ['tdg', 'tfd', 'cr', 'hc', 'ab', 'co', 'safe', 'nlp', 'glo', 'ulp', 'luc', 'dc'];
  const SAB_TYPES = ['cash', 'cd', 'fa', 'mm', 'cvli', 'sav'];
  const BANK = ['k.bank1', 'k.bank2', 'k.bank3', 'k.bank4', 'k.bank5', 'k.bank6'];
  const SAB = {
    cash: { hl: ['tfd', 'hc', 'co', 'safe', 'nlp', 'luc'], cons: BANK },
    cd: { hl: ['hc', 'co', 'safe', 'nlp'], cons: BANK.concat('k.cd7') },
    fa: { hl: ['tdg', 'hc', 'ab', 'safe', 'nlp'], cons: ['k.fa1', 'k.fa2', 'k.fa3', 'k.fa4', 'k.fa5', 'k.fa6'], disc: ['@guarantees', 'discFa'] },
    mm: { hl: ['hc', 'co', 'safe', 'nlp', 'luc'], cons: BANK },
    cvli: { hl: SAB_BEN.filter((b) => b !== 'dc'), cons: ['k.li1', 'k.li2', 'k.li3', 'k.li4', 'k.li5', 'k.li6', 'k.li7', 'k.li8', 'k.li9', 'k.li10', 'k.li11', 'k.li12'], disc: ['@loans', '@guarantees'] },
    sav: { hl: ['hc', 'co', 'safe', 'nlp', 'luc'], cons: BANK }
  };
  let sabJump = null;   // state handed back after the 10-minute lesson jump
  const check = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d5bd68" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  EFA.screen('sab1', {
    title: 'Safe account types compared',
    copy: {
      pick: 'Select account type..', 'ty.cash': 'Cash', 'ty.cd': 'Certificate of Deposit', 'ty.fa': 'Fixed Annuities', 'ty.mm': 'Money Market', 'ty.cvli': 'Cash Value Life Insurance', 'ty.sav': 'Savings Account',
      cons: 'Important Considerations', ben: 'Benefits',
      'b.tdg': 'Tax Deferred Growth', 'b.tfd': 'Tax Free Distribution', 'b.cr': 'Competitive Return', 'b.hc': 'High Contributions', 'b.ab': 'Additional Benefits', 'b.co': 'Collateral Opportunities', 'b.safe': 'Safe', 'b.nlp': 'No-Loss Provisions', 'b.glo': 'Guaranteed Loan Option', 'b.ulp': 'Unstructured Loan Payments', 'b.luc': 'Liquidity, Use and Control', 'b.dc': 'Deductible Contributions',
      'k.bank1': 'The return is usually modest.',
      'k.bank2': 'Interest earned is taxed as ordinary income.',
      'k.bank3': 'Borrowing against it still depends on a bank saying yes.',
      'k.bank4': 'A typical bank loan agreement lets the lender call the loan.',
      'k.bank5': 'Creditors can reach the balance.',
      'k.bank6': 'Quick access to borrowed money is not certain unless a credit line was set up ahead of time.',
      'k.cd7': 'Your money is committed for a fixed term, and cashing out early can cost a penalty.',
      'k.fa1': 'A common source of dependable retirement income, with guarantees backed by the claims-paying ability of the issuing insurer.',
      'k.fa2': 'Some contracts offer extra benefits, such as long-term care or life coverage, often at an added cost.',
      'k.fa3': 'Growth is generally tax-deferred until money comes out.',
      'k.fa4': 'Taking money out early can trigger a tax penalty plus the contract\'s surrender charges.',
      'k.fa5': 'Earnings are taxed as ordinary income when they come out.',
      'k.fa6': 'Held inside certain retirement accounts, contributions may be deductible or distributions tax-free, subject to that account\'s rules.',
      'k.li1': 'Optional riders can add cost.',
      'k.li2': 'Dividends are not guaranteed, but once credited they become cash value that is.',
      'k.li3': 'Growth inside the policy is generally not taxed as it builds.',
      'k.li4': 'Borrowing is a contractual right you alone control. Loans and withdrawals reduce cash value and death benefit and can cause a lapse.',
      'k.li5': 'Unpaid loans and withdrawals reduce the death benefit your family receives.',
      'k.li6': 'Cash value trails the premiums paid during the early funding years.',
      'k.li7': 'A disability waiver rider can keep premiums paid during illness or disability.',
      'k.li8': 'You decide when, and how much, to repay on a policy loan.',
      'k.li9': 'Funded and structured properly, money can generally be accessed income-tax-free under current tax law.',
      'k.li10': 'Many states shield cash values from creditors to some degree; protection depends on your state.',
      'k.li11': 'Paying too little in premiums, or leaning too hard on dividends or paid-up additions, can cause a lapse and create a tax bill.',
      'k.li12': 'The death benefit is generally income-tax-free to your beneficiaries under current tax law, subject to applicable requirements.',
      discFa: 'Withdrawals may be subject to surrender charges and, if taken early, a federal tax penalty.',
      empty: 'Choose an account type to see what comes with it.',
      lesson: '10-Minute Lesson',
      _notes: '"Safe" money is not all the same. Each account keeps your principal steady in its own way, and each comes with its own fine print.\n\n- Pick the account the client uses most today, then compare it with cash value life insurance.\n- Ask: Which of these benefits matter most to you, and which does your money have today?\nPAUSE\n\n- The 10-Minute Lesson opens the life insurance lesson and returns here.'
    },
    render(ctx) {
      const st = visitState(ctx, () => ({ type: null, page: 0 }));
      if (sabJump) { st.type = sabJump.type; st.page = sabJump.page; sabJump = null; }
      const ty = st.type && SAB[st.type] ? st.type : null, d = ty ? SAB[ty] : null;
      const pages = d ? Math.ceil(d.cons.length / 7) : 0;
      if (st.page > pages - 1) st.page = 0;
      const items = d ? d.cons.slice(st.page * 7, st.page * 7 + 7) : [];
      ctx.el.innerHTML = `
        <div class="b14-abs" style="left:110px;top:44px;width:600px">${dropdown(ctx, { id: 'type', cls: 'big', value: ty, placeholder: 'pick', options: SAB_TYPES.map((v) => ({ value: v, key: 'ty.' + v })) })}</div>
        <h2 class="st-h2 b14-abs" style="left:112px;top:132px">${ctx.t('cons')}</h2>
        <div class="b14-panel b14-cons" style="left:110px;top:206px;width:1040px;height:566px;padding:30px 40px">
          ${d ? `${blist(ctx, items.map((k) => ctx.t(k)), { reveal: false, size: 40, gap: items.length > 5 ? 12 : 20, text: 'b14-ctxt' })}
            ${pages > 1 ? `<button type="button" class="b14-pg" data-pg="${st.page ? 0 : 1}" aria-label="${st.page ? 'previous' : 'next'}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="${st.page ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg></button>` : ''}`
          : `<div class="b14-empty">${ART.vault()}<p class="st-body" style="color:#667389;margin:0">${ctx.t('empty')}</p></div>`}
        </div>
        ${d && d.disc ? discP(ctx, d.disc, `left:112px;right:auto;top:784px;width:${ty === 'cvli' ? 770 : 1030}px;text-align:left`) : ''}
        ${ty === 'cvli' ? `<div class="b14-abs" style="left:900px;top:786px;width:250px;display:flex;justify-content:flex-end"><button type="button" class="st-pill b14-pill-gold" data-lesson style="min-width:230px">${ctx.t('lesson')}</button></div>` : ''}
        <h3 class="st-h3 b14-abs" style="left:1188px;top:52px">${ctx.t('ben')}</h3>
        <div class="b14-abs" style="left:1186px;top:110px;width:306px;display:grid;gap:8px">
          ${SAB_BEN.map((b) => `<div class="b14-ben ${d && d.hl.includes(b) ? 'on' : ''}"><span class="ck">${check}</span>${ctx.t('b.' + b)}</div>`).join('')}
        </div>`;
      bindDropdown(ctx, 'type', (v) => { st.type = v; st.page = 0; EFA.player.renderScreen({ noFade: true }); });
      ctx.on(ctx.$('[data-pg]'), 'click', (e, n) => { st.page = +n.dataset.pg; EFA.player.renderScreen({ noFade: true }); });
      ctx.on(ctx.$('[data-lesson]'), 'click', () => { sabJump = { type: st.type, page: st.page }; ctx.jump('TMLI', 'tmli1'); });
    },
    leave: markLeft
  });

  /* ---------- Social Security: Early or Late? ---------- */
  EFA.css('b14-ss', `
  .stage .b14-verdict { margin: 12px auto 6px; width: 64%; border: 2px solid #b8972e; border-radius: 12px; padding: 12px 18px; text-align: center; font: 700 22px/1.3 "DM Sans", sans-serif; color: #0d1e3a; background: #fbf6e6; }
  .stage .b14-split { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; }
  .stage .b14-cola-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 18px; }
  `);
  /** COLA history as fractions (0.025 = 2.5%) */
  function colaSeries() {
    const s = series(dfirst(['ss.colaHistory', 'history.ssCola', 'history.colaHistory', 'ss.colaHist', 'history.ssColaHistory', 'history.cola']));
    if (!s) return null;
    if (s.values.some((v) => Math.abs(v) > 1)) { const k = (v) => v / 100; s.values = s.values.map(k); const at = s.at; s.at = (y) => (at(y) == null ? null : at(y) / 100); }
    return s;
  }
  EFA.screen('sseol1', {
    title: 'Social Security: claim early or late',
    copy: {
      head: 'Social Security: Early or Late?',
      lblEA: 'Early Benefit Age', lblEM: 'Early Monthly Benefit', lblLA: 'Late Benefit Age', lblLM: 'Late Monthly Benefit', lblCola: 'Cost of Living Adjustment', lblTo: 'Project to Age',
      lblCE: 'Cumulative Early Benefits', lblCL: 'Cumulative Late Benefits',
      vA: 'By age', vLate: ', waiting for the later benefit comes out ahead.', vEarly: ', starting the earlier benefit comes out ahead.',
      calc: 'Calculate', doc: 'Documentation', graph: 'Graph', ret: 'Return',
      serE: 'Early Benefits', serL: 'Late Benefits',
      wsTitle: 'Social Security: Early or Late?', wsAge: 'Age', wsE: 'Early Benefit', wsCE: 'Cumulative Early Benefits', wsL: 'Late Benefit', wsCL: 'Cumulative Late Benefits', wsD: 'Early Minus Late Benefits', wsYear: 'Year',
      colaTitle: 'Historic Social Security COLA Rates', colaYear: 'Year', colaRate: 'COLA Rate %',
      colaHelp: 'Click any two years to see the average cost-of-living adjustment across that span.',
      colaFrom: 'The period begins at the start of', colaTo: 'It runs through the end of', colaAvg: 'Average COLA for the period:',
      colaSrc: 'Source: Social Security Administration, Office of the Chief Actuary, history of cost-of-living adjustments.',
      source: 'Source', back: 'Return', use: 'Use Result',
      disc: 'Benefit amounts are your own estimates, and the cost-of-living adjustment is an assumption drawn from history, not a promise. This compares totals only; it does not calculate Social Security\'s own early or delayed claiming adjustments.',
      _wait: 'Figures being verified', _loading: 'This tool is still loading. Please try again in a moment.',
      _notes: 'Claiming early means a smaller check that starts sooner. Waiting means a larger check that starts later. The question is which pays you more by the age that matters to you.\n\n- Ask: How long do the people in your family tend to live?\nPAUSE\n\n- The round dot by Cost of Living Adjustment opens the history of increases; the dot by Project to Age opens the life expectancy helper.'
    },
    render(ctx) {
      const st = visitState(ctx, () => ({ shown: false, graph: false }));
      ctx.el.innerHTML = `
        <div class="b14-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b14-inv">
          ${med(ART.check(false), 236, 318, 212)}${med(ART.check(true), 1364, 318, 212)}
          <div class="b14-panel b14-form" style="left:360px;top:146px;width:880px">
            ${frow(ctx, 'lblEA', sfield(ctx, { id: 'ea', key: 'sseol_early_withdrawal_age', def: 62, type: 'int', min: 0, max: 120 }), { forId: fid(ctx, 'ea') })}
            ${frow(ctx, 'lblEM', sfield(ctx, { id: 'em', key: 'sseol_early_withdrawal_amount', def: 1400, type: 'money', min: 0 }), { forId: fid(ctx, 'em') })}
            ${frow(ctx, 'lblLA', sfield(ctx, { id: 'la', key: 'sseol_late_withdrawal_age', def: 70, type: 'int', min: 0, max: 120 }), { forId: fid(ctx, 'la') })}
            ${frow(ctx, 'lblLM', sfield(ctx, { id: 'lm', key: 'sseol_late_withdrawal_amount', def: 2500, type: 'money', min: 0 }), { forId: fid(ctx, 'lm') })}
            ${frow(ctx, 'lblCola', sfield(ctx, { id: 'cola', key: 'sseol_assumed_ror', def: 0.02, type: 'pct', min: 0, max: 0.2, dp: 1 }), { forId: fid(ctx, 'cola'), dot: 'cola' })}
            ${frow(ctx, 'lblTo', sfield(ctx, { id: 'to', key: 'case_file_project_to_age', def: 84, type: 'int', min: 0, max: 120 }), { forId: fid(ctx, 'to'), after: leDot(ctx, { field: 'to', onUse: (age) => cset('case_file_life_expectancy', age) }) })}
          </div>
          <div class="b14-center b14-calc" style="top:540px"><button type="button" class="st-pill b14-pill-gold" data-calc style="min-width:220px;font-size:20px">${ctx.t('calc')}</button></div>
          <div class="b14-res">
            <div class="b14-panel b14-form" style="left:360px;top:516px;width:880px;padding-bottom:16px">
              ${frow(ctx, 'lblCE', '<div class="b14-ro num" data-out="ce"></div>')}
              ${frow(ctx, 'lblCL', '<div class="b14-ro num" data-out="cl"></div>')}
              <div class="b14-verdict"></div>
            </div>
            <div class="b14-center" style="top:752px;gap:40px"><button type="button" class="b14-link" data-doc>${ctx.t('doc')}</button><button type="button" class="st-pill" data-graph style="min-width:140px;min-height:40px;font-size:16px">${ctx.t('graph')}</button></div>
          </div>
        </div>
        <div class="b14-gv">
          <div class="b14-panel b14-chart" style="left:110px;top:140px;width:1380px;height:620px;padding:16px"><div class="b14-cbox" style="position:relative;width:1348px;height:588px"></div></div>
          <div class="b14-center" style="top:778px"><button type="button" class="st-pill" data-ret style="min-width:170px">${ctx.t('ret')}</button></div>
        </div>
        <p class="st-disclaimer b14-disc" style="top:800px">${ctx.t('disc')}</p>`;
      const calc = () => { const v = ctx.values(); return sseolCalc({ earlyAge: Math.round(v.ea || 0), earlyMonthly: v.em || 0, lateAge: Math.round(v.la || 0), lateMonthly: v.lm || 0, cola: v.cola || 0, projectTo: Math.round(v.to || 0) }); };
      const draw = () => {
        ctx.$('.b14-inv').hidden = st.graph; ctx.$('.b14-gv').hidden = !st.graph;
        ctx.$('.b14-disc').style.top = st.graph ? '834px' : '800px';
        ctx.$('.b14-calc').hidden = st.shown; ctx.$('.b14-res').hidden = !st.shown;
        const c = calc(), v = ctx.values();
        ctx.$('[data-out="ce"]').textContent = money(c.cumE); ctx.$('[data-out="cl"]').textContent = money(c.cumL);
        ctx.$('.b14-verdict').innerHTML = sentence(ctx, ['vA', { v: F.int(Math.round(v.to || 0)), cls: '' }, c.lateWins ? 'vLate' : 'vEarly']);
        if (st.graph) {
          mountChart(ctx, ctx.$('.b14-cbox'), { w: 1348, h: 588, x: c.rows.map((r) => r.age), series: [{ values: c.rows.map((r) => r.cumE), color: P.navy, width: 5, smooth: true, marker: 'dot' }, { values: c.rows.map((r) => r.cumL), color: P.gold, width: 5, smooth: true, marker: 'tri' }], yMin: 0, yFmt: (v) => money(v) }, [ctx.t('serE'), ctx.t('serL')], (x) => money(x));
        }
      };
      ctx.on(ctx.$('[data-calc]'), 'click', () => { st.shown = true; draw(); });
      ctx.on(ctx.$('[data-graph]'), 'click', () => { st.graph = true; draw(); });
      ctx.on(ctx.$('[data-ret]'), 'click', () => { st.graph = false; draw(); });
      ctx.on(ctx.$('[data-doc]'), 'click', () => {
        const c = calc(), v = ctx.values();
        openSheet(ctx, { heading: ctx.t('wsTitle'), size: 'medium', disclosures: ['hypothetical'],
          columns: [['age', 'wsAge', 'age'], ['e', 'wsE'], ['ce', 'wsCE'], ['l', 'wsL'], ['cl', 'wsCL'], ['d', 'wsD'], ['year', 'wsYear', 'year']].map(([f, k, t]) => ({ field: f, header: ctx.t(k), type: t || 'money' })),
          rows: c.rows.map((r) => ({ age: r.age, e: r.early, ce: r.cumE, l: r.late, cl: r.cumL, d: r.diff, year: r.year })),
          assumptions: [{ label: ctx.t('lblCola'), value: pctTrim(v.cola || 0) }] });
      });
      ctx.on(ctx.$('[data-dot="cola"]'), 'click', () => colaOverlay(ctx, (avg) => { ctx.setField('cola', avg); cset('sseol_assumed_ror', avg); draw(); }));
      ctx.onFields((vals) => { syncShared(ctx, vals); draw(); });
      draw();
    },
    leave: markLeft
  });
  /** Historic Social Security COLA overlay (screen-specific): pick two years, see the average, use it */
  function colaOverlay(ctx, onUse) {
    const s = colaSeries();
    const pick = []; let src = false;
    const ov = ctx.overlay({ title: ctx.t('colaTitle'), html: '<div class="b14-cola"></div>' });
    const root = ov.querySelector('.b14-cola');
    const avg = () => { if (pick.length < 2) return null; const [a, b] = pick.slice().sort((x, y) => x - y); let sum = 0; for (let y = a; y <= b; y++) sum += s.at(y) || 0; return +((sum / (b - a + 1)) * 100).toFixed(1); };
    const draw = () => {
      if (!s) { root.innerHTML = wait(ctx); return; }
      const years = []; for (let y = s.first; y <= s.last; y++) if (isNum(s.at(y))) years.push(y);
      const [a, b] = pick.slice().sort((x, y) => x - y);
      const info = src ? `<div class="b14-info"><p>${ctx.t('colaSrc')}</p></div>`
        : `<div class="b14-info"><p>${ctx.t('colaHelp')}</p></div>${pick.length ? `<div class="b14-info" style="margin-top:16px"><p>${ctx.t('colaFrom')} <b class="num">${pick.length === 1 ? pick[0] : a}</b>.</p>${pick.length === 2 ? `<p>${ctx.t('colaTo')} <b class="num">${b}</b>.</p><p>${ctx.t('colaAvg')} <b class="num b14-gold" style="font-size:24px">${F.num(avg(), 1)}%</b></p>` : ''}</div>` : ''}`;
      root.innerHTML = `<div class="b14-split"><div class="b14-tw" style="position:relative;height:470px"><table class="st-table"><thead><tr><th style="text-align:center">${ctx.t('colaYear')}</th><th>${ctx.t('colaRate')}</th></tr></thead><tbody>${years.map((y) => `<tr class="pick ${pick.includes(y) ? 'sel' : ''}" data-y="${y}"><td style="text-align:center">${y}</td><td>${F.num(s.at(y) * 100, 1)}</td></tr>`).join('')}</tbody></table></div>
        <div>${info}</div></div>
        <div class="b14-cola-foot"><button type="button" class="b14-link" data-src>${ctx.t(src ? 'back' : 'source')}</button>${!src && pick.length === 2 ? `<button type="button" class="st-pill b14-pill-gold" data-use style="min-width:180px">${ctx.t('use')}</button>` : '<span></span>'}</div>`;
      root.querySelectorAll('tr[data-y]').forEach((tr) => tr.addEventListener('click', () => { if (EFA.edit.on) return; if (pick.length === 2) pick.length = 0; pick.push(+tr.dataset.y); const sc = root.querySelector('.b14-tw').scrollTop; draw(); root.querySelector('.b14-tw').scrollTop = sc; }));
      root.querySelector('[data-src]').addEventListener('click', () => { if (EFA.edit.on) return; src = !src; draw(); });
      const u = root.querySelector('[data-use]'); if (u) u.addEventListener('click', () => { if (EFA.edit.on) return; const v = avg(); ov.close(); onUse(v / 100); });
      EFA.numify(root);
    };
    draw();
  }

  /* ---------- Structured Income Streams ---------- */
  EFA.css('b14-sis', `
  .stage .b14-grid { position: absolute; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 14px; box-shadow: 0 10px 28px rgba(13,30,58,.06); overflow: hidden; }
  .stage .b14-grid .sc { max-height: 228px; overflow: auto; }
  .stage .b14-grid table { width: 100%; border-collapse: collapse; }
  .stage .b14-grid th { background: #0d1e3a; color: #f7f5f1; font: 700 13px/1.2 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; padding: 10px 12px; text-align: left; position: sticky; top: 0; z-index: 2; }
  .stage .b14-grid th.r { text-align: right; }
  .stage .b14-grid td { padding: 4px 8px; border-bottom: 1px solid rgba(13,30,58,.08); }
  .stage .b14-grid tbody tr:nth-child(even) td { background: rgba(227,232,240,.45); }
  .stage .b14-grid input { width: 100%; height: 38px; border: 1.5px solid transparent; border-radius: 8px; background: transparent; font: 500 19px/1 "DM Sans", sans-serif; color: #0d1e3a; padding: 0 10px; box-sizing: border-box; font-variant-numeric: lining-nums tabular-nums; }
  .stage .b14-grid input.n { text-align: right; }
  .stage .b14-grid input:hover { border-color: #cbd5e3; background: #fff; }
  .stage .b14-grid input:focus { outline: none; border-color: #b8972e; background: #fff; box-shadow: 0 0 0 3px rgba(184,151,46,.18); }
  .stage .b14-trash { width: 36px; height: 36px; border: 0; border-radius: 8px; background: transparent; color: #8a6e22; cursor: pointer; display: grid; place-items: center; }
  .stage .b14-trash:hover { background: #f0e6c4; color: #0d1e3a; }
  .stage .b14-grid .ft { display: flex; justify-content: flex-start; padding: 8px 12px; border-top: 1px solid #d6cfc4; background: #f7f5f1; }
  .stage .b14-chk { display: flex; align-items: center; gap: 14px; justify-content: flex-end; }
  .stage .b14-chk input[type=checkbox] { width: 26px; height: 26px; accent-color: #0d1e3a; cursor: pointer; }
  .stage .b14-sisres { font: 600 22px/1.5 "DM Sans", sans-serif; color: #0d1e3a; margin: 0; }
  .stage .b14-tight .b14-row { min-height: 54px; }
  .stage .b14-sisres .b14-v { font-weight: 700; }
  .stage .b14-rep { width: 100%; border-collapse: collapse; font: 500 16px/1.3 "DM Sans", sans-serif; color: #0d1e3a; font-variant-numeric: lining-nums tabular-nums; }
  .stage .b14-rep th { background: #0d1e3a; color: #f7f5f1; font: 700 12.5px/1.25 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; padding: 8px 10px; text-align: right; vertical-align: bottom; }
  .stage .b14-rep td { padding: 6px 10px; text-align: right; border-bottom: 1px solid rgba(13,30,58,.1); }
  .stage .b14-rep th:first-child, .stage .b14-rep td:first-child { text-align: center; }
  .stage .b14-rep tr.em td { background: #f0e6c4; font-weight: 700; }
  `);
  const trashSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
  const SIS_DEF = (ctx) => [0.02, 0.04, 0.06, 0.08].map((r, i) => ({ d: `${ctx.text('blk')} ${i + 1}`, n: 5, r }));
  /** unique block names: blanks become Block 1, Block 2...; duplicates get (2), (3).. */
  function blockNames(ctx, blocks) {
    let blank = 0; const seen = {};
    return blocks.map((b) => {
      let name = String(b.d || '').trim();
      if (!name) name = `${ctx.text('blk')} ${++blank}`;
      const k = name.toLowerCase();
      if (seen[k]) { seen[k]++; name = `${name} (${seen[k]})`; } else seen[k] = 1;
      return name;
    });
  }
  EFA.screen('sis1', {
    title: 'Structured income streams',
    copy: {
      lblDesired: 'Desired Income Stream', lblFunds: 'Initial Funds Available', lblYears: 'Years Until Income Needed', lblInf: 'Inflation Rate', lblAnn: 'Annuitize Distribution Phase', lblAR: 'ROR',
      grid: 'Structured Investment Blocks', colD: 'Description', colY: 'Years', colR: 'ROR', add: 'Add Block Item', newBlock: 'Investment Block', blk: 'Block',
      delQ: 'Delete the selected block?', yes: 'Yes', no: 'No',
      calc: 'Calculate', doc: 'Documentation', toMax: 'Calculate Max Income', toLump: 'Calculate Lump Sum',
      ls1: 'An initial lump sum of', ls2: 'is needed to provide an inflation-adjusted monthly income of', ls3: ', beginning', ls4: 'years from now and lasting', lsN: 'over the next', ls5: 'years, for a cumulative income of', ls6: ', based on the hypothetical assumptions entered.',
      mx1: 'An inflation-adjusted monthly income of', mxN: 'for the next', mx5: 'years, can be funded with an initial lump sum of', mx6: ', producing a cumulative income of',
      noConv: 'A maximum income could not be found for these assumptions. Please check the blocks and rates.',
      choose: 'Please choose..', optRep: 'Printed Report', optWs: 'Worksheet Data',
      wsTitle: 'Structured Income Stream Summary', wsYear: 'Year', wsMon: 'Monthly Income', wsAnn: 'Annual Income', wsCum: 'Cumulative Income', wsTot: 'Total Balance',
      repTitle: 'Structured Income Stream Summary Illustration', repBeg: 'Beginning Balances:', repInv: 'Total Invested:', repInc: 'Total Income:',
      repNote: 'This is a hypothetical illustration of a laddered income strategy based on the assumptions you entered. It is not guaranteed and does not represent any specific investment. Actual results will vary.',
      disc: 'Block rates, inflation and any annuity rate are assumptions, not guarantees. Annuity payouts depend on the issuing insurer\'s rates.',
      _wait: 'Figures being verified', _loading: 'This tool is still loading. Please try again in a moment.',
      _notes: 'Instead of one pile of money doing every job, each block has one job and one time frame. Money needed soon can stay safe; money needed later has time to grow.\n\n- Ask: Which would let you sleep better, one pile that has to do everything, or a plan where each dollar knows its job?\nPAUSE\n\n- Calculate Max Income flips the question: what income can the money you have fund?'
    },
    render(ctx) {
      const st = visitState(ctx, () => ({ shown: false, lumpMode: true, res: null }));
      const blocks = () => { const b = cget('sis_blocks_detail_view', null); return Array.isArray(b) && b.length ? b.map((x) => Object.assign({}, x)) : SIS_DEF(ctx); };
      const ann = !!cget('sis_annuitize_distribution_phase', false);
      ctx.el.innerHTML = `
        ${med(ART.blocks(), 210, 160, 196)}${med(ART.calendar(), 1390, 160, 196)}
        <div class="b14-panel b14-form b14-tight" style="left:330px;top:28px;width:940px">
          <div class="m-lump">${frow(ctx, 'lblDesired', sfield(ctx, { id: 'desired', key: 'sis_monthly_income_stream_desired', def: 8500, type: 'money', min: 0 }), { forId: fid(ctx, 'desired'), cls: 'keep' })}</div>
          <div class="m-max">${frow(ctx, 'lblFunds', sfield(ctx, { id: 'funds', key: 'sis_initial_funds_available', def: 1000000, type: 'money', min: 0 }), { forId: fid(ctx, 'funds'), cls: 'keep' })}</div>
          ${frow(ctx, 'lblYears', sfield(ctx, { id: 'years', key: 'sis_years_until_needed', def: 5, type: 'int', min: 0, max: 60 }), { forId: fid(ctx, 'years') })}
          ${frow(ctx, 'lblInf', sfield(ctx, { id: 'inf', key: 'case_file_ror_inflation', def: 0.03, type: 'pct', min: 0, max: 0.2 }), { forId: fid(ctx, 'inf'), after: infDot(ctx, { field: 'inf' }) })}
          <div class="b14-row" style="grid-template-columns:minmax(0,1fr) auto 220px"><span class="b14-lab"><input type="checkbox" data-ann ${ann ? 'checked' : ''} style="width:24px;height:24px;accent-color:#0d1e3a;margin:0 4px 0 0;cursor:pointer"><span class="ann-t" style="cursor:pointer">${ctx.t('lblAnn')}</span></span>
            <span class="b14-lab a-on" style="justify-content:flex-end">${ctx.t('lblAR')}</span><div class="a-on">${sfield(ctx, { id: 'aror', key: 'sis_annuity_ror', def: 0.05, type: 'pct', min: 0, max: 0.2 })}</div></div>
        </div>
        <div class="st-h3 b14-abs" style="left:330px;top:286px;width:940px;text-align:center">${ctx.t('grid')}</div>
        <div class="b14-grid" style="left:330px;top:328px;width:940px">
          <div class="sc"><table><thead><tr><th style="width:56px"></th><th>${ctx.t('colD')}</th><th class="r" style="width:130px">${ctx.t('colY')}</th><th class="r" style="width:150px">${ctx.t('colR')}</th></tr></thead><tbody class="b14-blk"></tbody></table></div>
          <div class="ft"><button type="button" class="st-pill b14-pill-ghost" data-add style="min-height:36px;font-size:15px;padding:4px 16px">${ctx.t('add')}</button></div>
        </div>
        <div class="b14-center b14-calc" style="top:628px"><button type="button" class="st-pill b14-pill-gold" data-calc style="min-width:220px;font-size:20px">${ctx.t('calc')}</button></div>
        <div class="b14-panel b14-res" style="left:110px;top:610px;width:1380px;padding:16px 34px"></div>
        <div class="b14-center b14-foot" style="top:752px;gap:40px"><button type="button" class="b14-link" data-doc>${ctx.t('doc')}</button><button type="button" class="st-pill" data-mode style="min-height:40px;font-size:16px;min-width:200px"><span class="m-lump">${ctx.t('toMax')}</span><span class="m-max">${ctx.t('toLump')}</span></button></div>
        ${discP(ctx, ['@hypothetical', 'disc', '@guarantees'], 'top:806px')}`;
      const hide = () => { if (st.shown) { st.shown = false; draw(); } };
      const drawGrid = () => {
        const b = blocks();
        ctx.$('.b14-blk').innerHTML = b.map((x, i) => `<tr data-i="${i}"><td><button type="button" class="b14-trash" data-del="${i}" aria-label="${ctx.esc(ctx.text('delQ'))}">${trashSvg}</button></td><td><input data-c="d" value="${ctx.esc(x.d || '')}" autocomplete="off"></td><td><input class="n" data-c="n" inputmode="decimal" value="${F.int(x.n)}"></td><td><input class="n" data-c="r" inputmode="decimal" value="${isNum(x.r) ? F.pct(x.r, 2) : ''}"></td></tr>`).join('');
        ctx.$$('.b14-blk tr').forEach((tr) => {
          const i = +tr.dataset.i;
          const commit = () => {
            const d = tr.querySelector('[data-c="d"]').value.trim(), n = Math.round(F.parse(tr.querySelector('[data-c="n"]').value)), rTxt = tr.querySelector('[data-c="r"]').value.trim(), r = F.parse(rTxt, true);
            if (d && isFinite(n) && n !== 0 && rTxt !== '' && isFinite(r)) { const all = blocks(); all[i] = { d, n, r }; cset('sis_blocks_detail_view', all); hide(); }
            const cur = blocks()[i]; if (cur) { tr.querySelector('[data-c="n"]').value = F.int(cur.n); tr.querySelector('[data-c="r"]').value = F.pct(cur.r, 2); }
          };
          tr.querySelectorAll('input').forEach((inp) => {
            inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
            inp.addEventListener('focus', () => { if (inp.dataset.c === 'r') { const v = F.parse(inp.value, true); inp.value = isFinite(v) ? String(+(v * 100).toFixed(4)) : ''; } inp.select(); });
            inp.addEventListener('change', commit);
            inp.addEventListener('blur', commit);
          });
          ctx.on(tr.querySelector('[data-del]'), 'click', () => confirmDel(i));
        });
      };
      const confirmDel = (i) => {
        const dlg = document.createElement('div'); dlg.className = 'b14-modal';
        dlg.innerHTML = `<div class="b14-modal-in" style="width:520px"><div class="b14-modal-b" style="padding:30px 32px 6px"><p class="st-body" style="font-weight:600;text-align:center">${ctx.t('delQ')}</p></div><div class="b14-modal-f" style="justify-content:center;gap:24px"><button type="button" class="st-pill b14-pill-ghost" data-no style="min-width:130px">${ctx.t('no')}</button><button type="button" class="st-pill b14-pill-gold" data-yes style="min-width:130px">${ctx.t('yes')}</button></div></div>`;
        ctx.el.appendChild(dlg);
        const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); } };
        const close = () => { document.removeEventListener('keydown', onKey, true); dlg.remove(); };
        document.addEventListener('keydown', onKey, true);
        ctx.on(dlg.querySelector('[data-no]'), 'click', close);
        ctx.on(dlg.querySelector('[data-yes]'), 'click', () => { const all = blocks(); all.splice(i, 1); cset('sis_blocks_detail_view', all); close(); hide(); drawGrid(); });
      };
      const inputs = () => {
        const v = ctx.values();
        return { Y: Math.max(0, Math.round(v.years || 0)), inf: v.inf || 0, ann: !!cget('sis_annuitize_distribution_phase', false), aR: v.aror || 0, desired: v.desired || 0, funds: v.funds || 0, blocks: blocks().map((b) => ({ years: Math.max(0, Math.round(b.n || 0)), ror: b.r || 0, d: b.d })) };
      };
      const compute = () => {
        const I = inputs();
        if (!I.blocks.length) return null;
        if (st.lumpMode) { const r = sis.lump(I.desired, I.Y, I.inf, I.blocks, I.ann, I.aR); return Object.assign({ M: I.desired, ok: true }, r, { I }); }
        const r = sis.maxIncome(I.funds, I.Y, I.inf, I.blocks, I.ann, I.aR); return Object.assign({ M: r.income }, r, { I });
      };
      const draw = () => {
        ctx.$$('.m-lump').forEach((n) => { n.hidden = !st.lumpMode; }); ctx.$$('.m-max').forEach((n) => { n.hidden = st.lumpMode; });
        const annOn = !!cget('sis_annuitize_distribution_phase', false);
        ctx.$$('.a-on').forEach((n) => { n.style.visibility = annOn ? 'visible' : 'hidden'; });
        ctx.$('.b14-calc').hidden = st.shown; ctx.$('.b14-res').hidden = !st.shown; ctx.$('.b14-foot').hidden = !st.shown;
        if (!st.shown) return;
        const r = st.res = compute();
        const res = ctx.$('.b14-res');
        if (!r) { res.innerHTML = ''; return; }
        if (!r.ok) { res.innerHTML = `<p class="b14-sisres">${ctx.t('noConv')}</p>`; return; }
        const D = r.I.blocks.reduce((s, b) => s + b.years, 0), Y = r.I.Y;
        const L = { v: money(r.lump), cls: 'b14-v b14-gold' }, Mv = { v: money(r.M), cls: 'b14-v' }, Cv = { v: money(r.cum), cls: 'b14-v' }, Dv = { v: F.int(D), cls: 'b14-v' }, Yv = { v: F.int(Y), cls: 'b14-v' };
        const timing = Y > 0 ? ['ls3', Yv, 'ls4', Dv] : [st.lumpMode ? 'lsN' : 'mxN', Dv];
        const parts = st.lumpMode ? ['ls1', L, 'ls2', Mv].concat(timing, ['ls5', Cv, 'ls6']) : ['mx1', Mv].concat(timing, ['mx5', L, 'mx6', Cv, 'ls6']);
        res.innerHTML = `<p class="b14-sisres">${sentence(ctx, parts)}</p>`;
      };
      const showWorksheet = () => {
        const r = st.res; if (!r || !r.ok) return;
        const names = blockNames(ctx, r.I.blocks), rows = sis.table(r.M, r.I.Y, r.I.inf, r.I.blocks, r.beg, r.I.ann);
        const cols = [{ field: 'year', header: ctx.t('wsYear'), type: 'year' }, { field: 'mon', header: ctx.t('wsMon'), type: 'money' }, { field: 'ann', header: ctx.t('wsAnn'), type: 'money' }, { field: 'cum', header: ctx.t('wsCum'), type: 'money' }]
          .concat(names.map((nm, i) => ({ field: 'b' + i, header: ctx.esc(nm), type: 'money' })), [{ field: 'tot', header: ctx.t('wsTot'), type: 'money' }]);
        openSheet(ctx, { heading: ctx.t('wsTitle'), size: 'full', columns: cols, disclosures: ['hypothetical', 'guarantees'],
          rows: rows.map((x) => Object.assign({ year: x.year, mon: x.monthly == null ? '' : x.monthly, ann: x.annual == null ? '' : x.annual, cum: x.cum == null ? '' : x.cum, tot: x.total }, Object.fromEntries(x.blocks.map((v, i) => ['b' + i, v])))) });
      };
      const showReport = () => {
        const r = st.res; if (!r || !r.ok) return;
        const names = blockNames(ctx, r.I.blocks), rows = sis.table(r.M, r.I.Y, r.I.inf, r.I.blocks, r.beg, r.I.ann);
        const head = `<tr><th>${ctx.t('wsYear')}</th><th>${ctx.t('wsMon')}</th><th>${ctx.t('wsAnn')}</th>${names.map((nm, i) => `<th>${ctx.esc(nm)}<br><span class="num">@ ${F.pct(r.I.blocks[i].ror, 2)}</span></th>`).join('')}<th>${ctx.t('wsTot')}</th></tr>`;
        const begRow = `<tr class="em"><td colspan="3" style="text-align:left">${ctx.t('repBeg')}</td>${rows[0].blocks.map((v) => `<td class="num">${money(v)}</td>`).join('')}<td class="num">${money(rows[0].total)}</td></tr>`;
        const body = rows.slice(1).map((x) => `<tr><td class="num">${x.year}</td><td class="num">${money(x.monthly)}</td><td class="num">${money(x.annual)}</td>${x.blocks.map((v) => `<td class="num">${money(v)}</td>`).join('')}<td class="num">${money(x.total)}</td></tr>`).join('');
        const span = 4 + names.length;
        const foot = `<tr class="em"><td colspan="${span - 1}" style="text-align:left">${ctx.t('repInv')}</td><td class="num">${money(r.lump)}</td></tr><tr class="em"><td colspan="${span - 1}" style="text-align:left">${ctx.t('repInc')}</td><td class="num">${money(r.cum)}</td></tr>`;
        ctx.overlay({ title: ctx.t('repTitle'), wide: true, html: `<table class="b14-rep"><thead>${head}</thead><tbody>${begRow}${body}${foot}</tbody></table><p class="st-disclaimer" style="font-style:italic;margin:16px 0 0">${ctx.t('repNote')}</p>${discLine(['guarantees', 'license'], { style: 'margin:8px 0 0' })}` });
      };
      ctx.on(ctx.$('[data-doc]'), 'click', () => {
        const dlg = document.createElement('div'); dlg.className = 'b14-modal';
        dlg.innerHTML = `<div class="b14-modal-in" style="width:560px"><div class="b14-modal-h">${ctx.t('choose')}</div><div class="b14-modal-f" style="justify-content:center;gap:22px;padding-top:26px"><button type="button" class="st-pill" data-o="rep" style="min-width:200px">${ctx.t('optRep')}</button><button type="button" class="st-pill" data-o="ws" style="min-width:200px">${ctx.t('optWs')}</button></div></div>`;
        ctx.el.appendChild(dlg);
        const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); } };
        const close = () => { document.removeEventListener('keydown', onKey, true); dlg.remove(); };
        document.addEventListener('keydown', onKey, true);
        dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
        ctx.on(Array.from(dlg.querySelectorAll('[data-o]')), 'click', (e, b) => { close(); if (b.dataset.o === 'rep') showReport(); else showWorksheet(); });
      });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { if (!blocks().length) return; st.shown = true; draw(); });
      ctx.on(ctx.$('[data-mode]'), 'click', () => { st.lumpMode = !st.lumpMode; st.shown = false; draw(); });
      ctx.on(ctx.$('[data-add]'), 'click', () => { const all = blocks(); all.push({ d: ctx.text('newBlock'), n: 5, r: 0 }); cset('sis_blocks_detail_view', all); hide(); drawGrid(); const sc = ctx.$('.b14-grid .sc'); sc.scrollTop = sc.scrollHeight; });
      ctx.$('[data-ann]').addEventListener('change', (e) => { cset('sis_annuitize_distribution_phase', e.target.checked); st.shown = false; draw(); });
      ctx.on(ctx.$('.ann-t'), 'click', () => { const cb = ctx.$('[data-ann]'); cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); });
      ctx.onFields((vals) => { syncShared(ctx, vals); const sig = JSON.stringify(vals); if (st.sig != null && sig !== st.sig) st.shown = false; st.sig = sig; draw(); });
      drawGrid(); draw();
    },
    leave: markLeft
  });

  /* ---------- Sequence Risk (sr1 assumptions, sr2 accumulation, sr3 distribution) ---------- */
  /* market codes (stored per client) and the verified series in EFA.data.history (see docs/data-sources-history.md;
     bond entries use each year's yield as that year's return, as the original did) */
  const MARKETS = [
    { code: 'DJIA', series: 'djiaPriceReturn' }, { code: 'SP500P', series: 'sp500PriceReturn' }, { code: 'SP500T', series: 'sp500TotalReturnSP' },
    { code: 'R2000', series: 'russell2000PriceReturn' }, { code: 'NASDAQ', series: 'nasdaqPriceReturn' }, { code: 'MSCIW', series: 'msciWorldGrossReturn' },
    { code: 'GOVT10', series: 'tsy10yYield', bond: true }, { code: 'MUNI20', series: 'muni20Yield', bond: true }, { code: 'CORP30', series: 'corpAaaYield', bond: true }
  ];
  function marketSeries(code) {
    const m = MARKETS.find((x) => x.code === code); if (!m) return null;
    const s = series(dget('history.' + m.series));
    if (!s) return null;
    if (s.values.some((v) => Math.abs(v) > 3)) s.values = s.values.map((v) => v / 100);   // percent numbers to fractions
    return s;
  }
  const marketsAvailable = () => MARKETS.filter((m) => marketSeries(m.code));
  /** the sr1 assumptions every sequence screen reads */
  function srCase() {
    const avail = marketsAvailable();
    let code = cget('risrm_market_index', 'SP500P');
    if (!avail.find((m) => m.code === code)) code = avail.length ? (avail.find((m) => m.code === 'SP500P') || avail[0]).code : code;
    const s = marketSeries(code);
    let year = cget('risrm_start_year', 1973);
    if (s && (!year || year < s.first)) year = s.first;
    if (s && year > s.last) year = s.last;
    return { goal: cget('retirement_asset_goal', 1000000), R: Math.round(cget('case_file_retirement_age', 65)), to: Math.round(cget('case_file_project_to_age', 84)), w: cget('risrm_withdrawal_rate', 0.04), inf: cget('case_file_ror_inflation', 0.03), code, s, year, avail };
  }
  const SR_MKT = { DJIA: 'Dow Jones Industrials', SP500P: 'S&P 500 (Price)', SP500T: 'S&P 500 (Total Return)', R2000: 'Russell 2000', NASDAQ: 'NASDAQ Composite', MSCIW: 'MSCI World', GOVT10: '10-Year Government Bonds', MUNI20: '20-Year Municipal Bonds', CORP30: '30-Year Corporate Bonds' };
  const srMktCopy = () => Object.assign(Object.fromEntries(Object.entries(SR_MKT).map(([k, v]) => ['m.' + k, v])), { bondNote: 'Bond figures use each year\'s average yield as that year\'s return.' });
  const isBond = (code) => !!(MARKETS.find((m) => m.code === code) || {}).bond;
  const SR_DISC = 'It uses historical index returns. Indexes are unmanaged and cannot be invested in directly, and these figures leave out fees and taxes.';

  EFA.screen('sr1', {
    title: 'Sequence-risk assumptions',
    copy: Object.assign({
      head: 'Assumptions',
      lblAssets: 'Total Assets', lblRet: 'Retirement Age', lblLE: 'Life Expectancy', lblW: 'Withdrawal %', lblInf: 'Inflation Rate', lblCum: 'Cumulative Retirement Income', lblMkt: 'Historic Market', lblYear: 'Starting Year',
      disc: SR_DISC,
      _wait: 'Figures being verified', _loading: 'This tool is still loading. Please try again in a moment.',
      _notes: 'Before we look at markets, we agree on the plan: how much you retire with, how long it has to last, and how much you take each year.\n\n- Ask: If the market dropped hard in your first year of retirement, how would that change your plans?\nPAUSE\n\n- Pick a market and a starting year; the next two screens use that real sequence of returns.'
    }, srMktCopy()),
    render(ctx) {
      const c = srCase();
      const mktCtl = c.avail.length ? dropdown(ctx, { id: 'mkt', cls: 'up', value: c.code, options: c.avail.map((m) => ({ value: m.code, key: 'm.' + m.code })) }) : `<div class="b14-ro quiet" style="justify-content:center;font-weight:500;font-size:17px;color:#667389">${ctx.t('_wait')}</div>`;
      const years = []; if (c.s) for (let y = c.s.first; y <= c.s.last; y++) years.push({ value: y, num: y });
      const yrCtl = c.s ? dropdown(ctx, { id: 'yr', cls: 'up', value: c.year, options: years }) : `<div class="b14-ro quiet" style="justify-content:center;font-weight:500;font-size:17px;color:#667389">${ctx.t('_wait')}</div>`;
      ctx.el.innerHTML = `
        <div class="b14-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${med(ART.nestEgg(), 248, 392, 232)}${med(ART.hourglass(), 1352, 392, 232)}
        <div class="b14-panel b14-form" style="left:420px;top:146px;width:760px">
          ${frow(ctx, 'lblAssets', sfield(ctx, { id: 'assets', key: 'retirement_asset_goal', def: 1000000, type: 'money', min: 0 }), { forId: fid(ctx, 'assets') })}
          ${frow(ctx, 'lblRet', sfield(ctx, { id: 'ret', key: 'case_file_retirement_age', def: 65, type: 'int', min: 0, max: 120 }), { forId: fid(ctx, 'ret') })}
          ${frow(ctx, 'lblLE', sfield(ctx, { id: 'to', key: 'case_file_project_to_age', def: 84, type: 'int', min: 0, max: 120 }), { forId: fid(ctx, 'to'), after: leDot(ctx, { field: 'to' }) })}
          ${frow(ctx, 'lblW', sfield(ctx, { id: 'w', key: 'risrm_withdrawal_rate', def: 0.04, type: 'pct', min: 0, max: 1 }), { forId: fid(ctx, 'w') })}
          ${frow(ctx, 'lblInf', sfield(ctx, { id: 'inf', key: 'case_file_ror_inflation', def: 0.03, type: 'pct', min: 0, max: 0.2 }), { forId: fid(ctx, 'inf'), after: infDot(ctx, { field: 'inf' }) })}
          ${frow(ctx, 'lblCum', '<div class="b14-ro num" data-out="cum"></div>')}
          ${frow(ctx, 'lblMkt', mktCtl, { cls: 'wide' })}
          ${frow(ctx, 'lblYear', yrCtl, { cls: 'wide' })}
        </div>
        ${discP(ctx, ['@hypothetical', '@past', 'disc'].concat(isBond(c.code) ? ['bondNote'] : []), 'top:782px')}`;
      const draw = () => {
        const v = ctx.values(), years = Math.round(v.to || 0) - Math.round(v.ret || 0) + 1;
        let w = (v.assets || 0) * (v.w || 0), tot = 0;
        for (let i = 0; i < years; i++) { tot += w; w *= 1 + (v.inf || 0); }
        ctx.$('[data-out="cum"]').textContent = money(tot);
      };
      bindDropdown(ctx, 'mkt', (code) => { cset('risrm_market_index', code); const s = marketSeries(code); const y = cget('risrm_start_year', 1973); if (s && (!y || y < s.first)) cset('risrm_start_year', s.first); else if (s && y > s.last) cset('risrm_start_year', s.last); EFA.player.renderScreen({ noFade: true }); });
      bindDropdown(ctx, 'yr', (y) => { cset('risrm_start_year', +y); EFA.player.renderScreen({ noFade: true }); });
      ctx.onFields((vals) => { syncShared(ctx, vals); draw(); });
      draw();
    }
  });

  EFA.css('b14-sr', `
  .stage .b14-cap { position: absolute; display: inline-flex; align-items: center; gap: 8px; padding: 7px 16px; border-radius: 10px; font: 700 16px/1.1 "DM Sans", sans-serif; letter-spacing: .06em; text-transform: uppercase; box-shadow: 0 6px 16px rgba(13,30,58,.08); }
  .stage .b14-cap.hist { background: #e3e8f0; color: #0d1e3a; border: 1px solid #cbd5e3; }
  .stage .b14-cap.shuf { background: #f0e6c4; color: #0d1e3a; border: 1px solid #d5bd68; }
  .stage .b14-seq .st-table td { font-size: 18px; padding: 8px 12px; }
  .stage .b14-seq .st-table td.h { background: rgba(227,232,240,.55) !important; }
  .stage .b14-seq .st-table tbody tr:nth-child(even) td.h { background: rgba(203,213,227,.55) !important; }
  .stage .b14-seq .st-table td.s { background: rgba(240,230,196,.5) !important; }
  .stage .b14-seq .st-table tbody tr:nth-child(even) td.s { background: rgba(240,230,196,.85) !important; }
  .stage .b14-seq .st-table td.a { text-align: center; font-weight: 700; }
  .stage .b14-seq .st-table td.neg { color: #8a2e22; }
  .stage .b14-seq .st-table th.c { text-align: center; }
  .stage .b14-bar { position: absolute; left: 110px; right: 110px; display: flex; justify-content: center; align-items: center; gap: 30px; }
  .stage .b14-bar .sep { width: 1px; height: 26px; background: #d6cfc4; }
  .stage .b14-arrow { width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid #cbd5e3; background: #fffdf8; color: #0d1e3a; display: grid; place-items: center; cursor: pointer; transition: all .2s ease; }
  .stage .b14-arrow:hover { background: #b8972e; border-color: #b8972e; }
  .stage .b14-stats { position: absolute; right: 110px; top: 40px; display: grid; gap: 6px; text-align: right; font: 600 19px/1.25 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b14-stats b { font-weight: 700; color: #8a6e22; }
  .stage .b14-lines { position: absolute; left: 110px; right: 110px; display: grid; gap: 8px; text-align: center; font: 700 21px/1.35 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b14-lines .b14-v { color: #8a6e22; }
  .stage .b14-sum ul { margin: 0 0 18px; padding-left: 22px; font: 500 18px/1.6 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b14-dd.up .b14-dd-l { top: auto; bottom: calc(100% + 6px); }
  `);
  const arrowL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const arrowR = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
  const pct2 = (r) => (isNum(r) ? F.pct(r, 2) : '–');
  const seqCopy = (dist) => Object.assign({
    head: dist ? 'Distribution Years' : 'Accumulation Years',
    capHist: 'Historic Return Sequence', capShuf: 'Shuffled Return Sequence',
    colWd: 'Withdrawal', colR: 'Rate of Return', colEoy: 'EOY Balance', colAge: 'Age', colDiff: 'Difference',
    shuffle: 'Shuffle', graph: 'Graph', results: 'Results', doc: 'Documentation', summary: 'Summary',
    serH: 'Historic Sequence', serS: 'Shuffled Sequence',
    wsTitle: dist ? 'Distribution Sequence of Returns' : 'Accumulation Sequence of Returns',
    wsHist: 'Historic', wsShuf: 'Shuffled', wsWd: 'BOY Withdrawal', wsBal: dist ? 'BOY Balance After Withdrawal' : 'BOY Balance', wsRate: 'Rate of Return', wsGrowth: 'Growth', wsEoy: 'EOY Balance', wsDiff: 'Difference', wsYear: 'Year', wsAge: 'Age',
    sumTitle: dist ? 'Sequence of Returns: Distribution Years' : 'Sequence of Returns: Accumulation Years',
    sumInit: 'Initial value of both scenarios:', sumStart: 'Starting age:', sumEnd: 'Ending age:', sumW: 'Initial withdrawal:', sumInf: 'Inflation rate:', sumMkt: 'Market and starting year:',
    disc: SR_DISC,
    _wait: 'Figures being verified', _loading: 'This tool is still loading. Please try again in a moment.'
  }, srMktCopy(), dist ? {
    fyw: 'First Year Withdrawal:', avg: 'Average Return:',
    bestA: 'Best starting point:', worstA: 'Worst starting point:', mid1: 'provides', mid2: 'in potential retirement income, and the money lasts to age', end: '.',
    _notes: 'Now the same returns meet withdrawals. Order suddenly matters: bad years early, while you are taking income, can run the money out years sooner.\n\n- Shuffle a few times and watch the ending balance and the last age change.\n- Ask: Since no one can choose the order their returns arrive in, what part of your income would you want protected from it?\nPAUSE'
  } : {
    ex1: 'The ending balance is the same no matter what order the returns arrive in.', ex2: 'That is because nothing is being withdrawn during the saving years.',
    _notes: 'While you are saving and not withdrawing, the order of good and bad years does not change where you end up.\n\n- Click Shuffle a few times; every shuffle lands on the same ending balance.\n- Ask: Does that match what you expected?\nPAUSE\n\n- Keep this picture in mind for the next screen.'
  });
  function seqScreen(dist) {
    return {
      title: dist ? 'Distribution years: order matters' : 'Accumulation years: order does not matter',
      copy: seqCopy(dist),
      render(ctx) {
        const st = visitState(ctx, () => ({ offset: 0, graph: false }));
        const c = srCase();
        const N = Math.max(1, c.to - c.R + 1);
        const heading = `<div class="b14-head" style="top:34px"><h1 class="st-h1" ${dist ? '' : 'data-tobottom style="cursor:pointer"'}>${ctx.t('head')}</h1></div>`;
        if (!c.s) {
          ctx.el.innerHTML = `${heading}<div class="b14-panel" style="left:110px;top:170px;width:1380px;height:540px;display:grid;place-items:center">${wait(ctx)}</div>${discP(ctx, ['@hypothetical', '@past', 'disc'], 'top:782px')}`;
          return;
        }
        const rA = seqRisk.returns(c.s, c.year, N);
        const startAge = dist ? c.R : c.R - N;
        const ages = rA.map((_, t) => startAge + t);
        const run = () => (dist ? seqRisk.distribution(c.goal, c.w, c.inf, rA, st.offset) : seqRisk.accumulation(c.goal, rA, st.offset));
        const sign = (o) => (o >= 0 ? '+' : '') + o;
        ctx.el.innerHTML = `${heading}
          ${dist ? `<div class="b14-stats"><div>${ctx.t('fyw')} <b class="num" data-out="fyw"></b></div><div>${ctx.t('avg')} <b class="num" data-out="avg"></b></div></div>` : ''}
          <div class="b14-tv">
            <span class="b14-cap hist" style="left:${110 + 8}px;top:122px">${ctx.t('capHist')}</span>
            <span class="b14-cap shuf" style="left:${110 + 4 * 172 + 8}px;top:122px">${ctx.t('capShuf')} <span class="num" data-out="off"></span></span>
            <div class="b14-tw b14-seq" style="left:110px;top:168px;width:1380px;height:470px"><table class="st-table"><thead><tr>
              <th>${ctx.t('colWd')}</th><th>${ctx.t('colR')}</th><th>${ctx.t('colEoy')}</th><th class="c">${ctx.t('colAge')}</th><th>${ctx.t('colWd')}</th><th>${ctx.t('colR')}</th><th>${ctx.t('colEoy')}</th><th>${ctx.t('colDiff')}</th>
            </tr></thead><tbody class="b14-sb"></tbody></table></div>
          </div>
          <div class="b14-gv"><div class="b14-panel" style="left:110px;top:122px;width:1380px;height:530px;padding:12px 16px"><div class="b14-cbox" style="position:relative;width:1348px;height:506px"></div></div></div>
          <div class="b14-lines" style="top:${dist ? 656 : 660}px"></div>
          <div class="b14-bar" style="top:742px">
            <span style="display:inline-flex;align-items:center;gap:14px"><button type="button" class="b14-arrow" data-sh="-1" aria-label="${ctx.esc(ctx.text('shuffle'))}">${arrowL}</button><button type="button" class="b14-link" data-sh="1">${ctx.t('shuffle')}</button><button type="button" class="b14-arrow" data-sh="1" aria-label="${ctx.esc(ctx.text('shuffle'))}">${arrowR}</button></span>
            <span class="sep"></span><button type="button" class="b14-link" data-gr><span class="g-on">${ctx.t('graph')}</span><span class="g-off">${ctx.t('results')}</span></button>
            <span class="sep"></span><button type="button" class="b14-link" data-doc>${ctx.t('doc')}</button>
            <span class="sep"></span><button type="button" class="b14-link" data-sum>${ctx.t('summary')}</button>
          </div>
          ${discP(ctx, ['@hypothetical', '@past', 'disc'].concat(isBond(c.code) ? ['bondNote'] : []), 'top:798px')}`;
        const ext = dist ? seqRisk.extremes(c.goal, c.w, c.inf, rA, c.R, c.year) : null;
        const extLine = (k, e) => sentence(ctx, [k, { v: String(e.year), cls: 'b14-v' }, 'mid1', { v: money(e.income), cls: 'b14-v' }, 'mid2', { v: F.int(e.age), cls: 'b14-v' }, 'end']);
        const draw = () => {
          const r = run();
          ctx.$('[data-out="off"]').textContent = sign(st.offset);
          ctx.$('.b14-tv').hidden = st.graph; ctx.$('.b14-gv').hidden = !st.graph;
          ctx.$('.g-on').hidden = st.graph; ctx.$('.g-off').hidden = !st.graph;
          if (dist) { ctx.$('[data-out="fyw"]').textContent = money(r.W0); ctx.$('[data-out="avg"]').textContent = pct2(r.avg); }
          ctx.$('.b14-sb').innerHTML = r.rows.map((x, t) => `<tr><td class="h">${money(x.aWd)}</td><td class="h ${x.aR < 0 ? 'neg' : ''}">${pct2(x.aR)}</td><td class="h">${money(x.aEoy)}</td><td class="a">${ages[t]}</td><td class="s">${money(x.bWd)}</td><td class="s ${x.bR < 0 ? 'neg' : ''}">${pct2(x.bR)}</td><td class="s">${money(x.bEoy)}</td><td class="${x.diff < 0 ? 'neg' : ''}">${money(x.diff)}</td></tr>`).join('');
          ctx.$('.b14-lines').innerHTML = dist ? `<div>${extLine('bestA', ext.best)}</div><div>${extLine('worstA', ext.worst)}</div>` : `<div>${ctx.t('ex1')}</div><div>${ctx.t('ex2')}</div>`;
          if (st.graph) mountChart(ctx, ctx.$('.b14-cbox'), { w: 1348, h: 506, x: ages, series: [{ values: r.rows.map((x) => x.aEoy), color: P.navy, width: 5 }, { values: r.rows.map((x) => x.bEoy), color: P.gold, width: 5, marker: 'tri' }], yMin: 0, yFmt: (v) => money(v) }, [ctx.t('serH'), ctx.t('serS')], (x) => money(x));
          EFA.numify(ctx.el);
        };
        const toBottom = () => { const w = ctx.$('.b14-tw'); if (w) w.scrollTop = w.scrollHeight; };
        ctx.on(ctx.$$('[data-sh]'), 'click', (e, n) => { st.offset += +n.dataset.sh; if (st.offset >= N || st.offset <= -N) st.offset = 0; draw(); });
        ctx.on(ctx.$('[data-gr]'), 'click', () => { st.graph = !st.graph; draw(); if (!st.graph) toBottom(); });
        ctx.on(ctx.$('[data-tobottom]'), 'click', toBottom);
        const wsData = () => {
          const r = run();
          const grp = (g, p) => [['Wd', 'wsWd'], ['Bal', 'wsBal'], ['Rate', 'wsRate'], ['Gr', 'wsGrowth'], ['Eoy', 'wsEoy']].map(([f, k]) => ({ field: p + f, header: `${ctx.t(g)} ${ctx.t(k)}`, type: f === 'Rate' ? 'pct' : 'money', dp: 2 }));
          return { heading: ctx.t('wsTitle'), size: 'full', disclosures: ['hypothetical', 'past', 'license'],
            columns: [{ field: 'age', header: ctx.t('wsAge'), type: 'age' }].concat(grp('wsHist', 'a'), grp('wsShuf', 'b'), [{ field: 'diff', header: ctx.t('wsDiff'), type: 'money', dp: 2 }, { field: 'year', header: ctx.t('wsYear'), type: 'year' }]),
            rows: r.rows.map((x, t) => ({ age: ages[t], aWd: x.aWd, aBal: x.aBoy, aRate: x.aR, aGr: x.aGrowth, aEoy: x.aEoy, bWd: x.bWd, bBal: x.bBoy, bRate: x.bR, bGr: x.bGrowth, bEoy: x.bEoy, diff: x.diff, year: t + 1 })),
            assumptions: [{ label: ctx.t('sumMkt'), value: `${ctx.text('m.' + c.code)}, ${c.year}` }, { label: ctx.t('wsShuf'), value: sign(st.offset) }] };
        };
        ctx.on(ctx.$('[data-doc]'), 'click', () => openSheet(ctx, wsData()));
        ctx.on(ctx.$('[data-sum]'), 'click', () => {
          const r = run(), m2 = (x) => money(x, 2);
          const init = dist ? c.goal : r.start;
          const items = [['sumInit', money(init, 2)], ['sumStart', F.int(startAge)], ['sumEnd', F.int(dist ? c.to : c.R)], ['sumW', pctTrim(c.w)], ['sumInf', pctTrim(c.inf)]];
          const lis = items.map(([k, v]) => `<li>${ctx.t(k)} <b class="num">${ctx.esc(v)}</b></li>`).join('') + `<li>${ctx.t('sumMkt')} <b>${ctx.t('m.' + c.code)}, <span class="num">${c.year}</span></b></li>` + (dist ? `<li>${extLine('bestA', ext.best)}</li><li>${extLine('worstA', ext.worst)}</li>` : '');
          const head = `<tr><th style="text-align:center">${ctx.t('colAge')}</th><th>${ctx.t('wsHist')} ${ctx.t('colWd')}</th><th>${ctx.t('wsHist')} ${ctx.t('colR')}</th><th>${ctx.t('wsHist')} ${ctx.t('colEoy')}</th><th>${ctx.t('wsShuf')} ${ctx.t('colWd')}</th><th>${ctx.t('wsShuf')} ${ctx.t('colR')}</th><th>${ctx.t('wsShuf')} ${ctx.t('colEoy')}</th><th>${ctx.t('colDiff')}</th></tr>`;
          const body = r.rows.map((x, t) => `<tr><td class="num">${ages[t]}</td><td class="num">${m2(x.aWd)}</td><td class="num">${pct2(x.aR)}</td><td class="num">${m2(x.aEoy)}</td><td class="num">${m2(x.bWd)}</td><td class="num">${pct2(x.bR)}</td><td class="num">${m2(x.bEoy)}</td><td class="num">${m2(x.diff)}</td></tr>`).join('');
          ctx.overlay({ title: ctx.t('sumTitle'), wide: true, html: `<div class="b14-sum"><ul>${lis}</ul><table class="b14-rep"><thead>${head}</thead><tbody>${body}</tbody></table>${discP(ctx, ['@hypothetical', '@past', 'disc'].concat(isBond(c.code) ? ['bondNote'] : [], ['@license']), 'position:static;margin:16px 0 0;text-align:left')}</div>` });
        });
        draw();
        ctx.timeout(toBottom, 250);
      },
      leave: markLeft
    };
  }
  EFA.screen('sr2', seqScreen(false));
  EFA.screen('sr3', seqScreen(true));

  /* ---------- Federal income tax thresholds since 1913 ---------- */
  function taxHistory() {
    const raw = dfirst(['history.taxThresholds', 'history.bracketThresholds', 'history.incomeTaxThresholds', 'history.bracketHistory', 'history.taxBrackets', 'history.federalBrackets']);
    if (!raw) return null;
    const rows = (Array.isArray(raw) ? raw : Object.keys(raw).map((k) => Object.assign({ year: +k }, raw[k]))).map((r) => {
      if (Array.isArray(r)) return { year: +r[0], low: +r[1], lowAt: +r[2], top: +r[3], topAt: +r[4] };
      const pick = (...ks) => { for (const k of ks) if (r[k] != null) return +r[k]; return NaN; };
      return { year: pick('year', 'y'), low: pick('lowRate', 'lowestRate', 'initialRate', 'low'), lowAt: pick('lowThreshold', 'lowestThreshold', 'lowUpTo', 'lowTop', 'lowAt'), top: pick('topRate', 'highestRate', 'top'), topAt: pick('topThreshold', 'highestThreshold', 'topFrom', 'topStart', 'topAt') };
    }).filter((r) => isNum(r.year)).sort((a, b) => a.year - b.year);
    if (!rows.length) return null;
    if (rows.some((r) => r.top > 1.5)) rows.forEach((r) => { r.low /= 100; r.top /= 100; });
    return rows;
  }
  EFA.screen('taxthresholds1', {
    title: 'History of federal income tax thresholds',
    copy: {
      head: 'Federal Income Tax Thresholds', to: 'to',
      colYear: 'Year', colLow: 'Initial Rate', colLowAt: 'Threshold for Lowest Bracket', colTop: 'Top Rate', colTopAt: 'Threshold for Highest Bracket',
      doc: 'Documentation', source: 'Source',
      srcTitle: 'Tax Rates Change', srcP1: 'For the early decades through 2008, these figures come from the IRS Statistics of Income historical table of the lowest and highest bracket rates and the income levels where those brackets apply. Later years come from the IRS annual tax rate schedules.',
      srcP2: 'This table is a conceptual tool to show how much tax rates have changed over time. Working out the actual tax for any past year is complicated, because the definition of taxable income has changed as well.',
      ok: 'Ok',
      wsTitle: 'Federal Income Tax Thresholds', wsYear: 'Tax Year', wsLow: 'Initial Percentage Rate', wsLowAt: 'Threshold For Lowest Bracket', wsTop: 'Top Percentage Rate', wsTopAt: 'Threshold For Top Bracket',
      _wait: 'Figures being verified', _loading: 'This tool is still loading. Please try again in a moment.',
      _notes: 'Tax rates are not carved in stone. Over the last century the top rate has moved up and down many times, and the brackets with it.\n\n- Scroll to a few eras: the 1940s, the 1980s, today.\n- Ask: If rates could change this much in the past, how confident are you about the rate you will pay in retirement?\nPAUSE'
    },
    render(ctx) {
      const rows = taxHistory();
      const yrs = rows ? `<div class="st-eyebrow" style="font-size:18px"><span class="num">${rows[0].year}</span> ${ctx.t('to')} <span class="num">${rows[rows.length - 1].year}</span></div>` : '';
      ctx.el.innerHTML = `
        <div class="b14-head" style="top:36px;gap:10px"><h1 class="st-h1">${ctx.t('head')}</h1>${yrs}<hr class="st-rule"></div>
        ${rows ? `<div class="b14-tw b14-tt" style="left:170px;top:196px;width:1260px;height:560px"><table class="st-table"><thead><tr><th style="text-align:center;width:120px">${ctx.t('colYear')}</th><th style="text-align:center">${ctx.t('colLow')}</th><th>${ctx.t('colLowAt')}</th><th style="text-align:center">${ctx.t('colTop')}</th><th>${ctx.t('colTopAt')}</th></tr></thead>
          <tbody>${rows.map((r) => `<tr><td style="text-align:center;font-weight:700">${r.year}</td><td style="text-align:center">${pct2(r.low)}</td><td>${money(r.lowAt)}</td><td style="text-align:center;font-weight:700">${pct2(r.top)}</td><td>${money(r.topAt)}</td></tr>`).join('')}</tbody></table></div>`
          : `<div class="b14-panel" style="left:170px;top:196px;width:1260px;height:560px;display:grid;place-items:center">${wait(ctx)}</div>`}
        <div class="b14-center" style="top:784px;gap:40px"><button type="button" class="b14-link" data-doc>${ctx.t('doc')}</button><button type="button" class="st-pill" data-src style="min-width:140px;min-height:40px;font-size:16px;box-shadow:0 6px 14px rgba(13,30,58,.25)">${ctx.t('source')}</button></div>`;
      ctx.on(ctx.$('[data-src]'), 'click', () => {
        const ov = ctx.overlay({ title: ctx.t('srcTitle'), html: `<div style="display:grid;gap:16px;font:500 20px/1.55 'DM Sans',sans-serif;color:#0d1e3a"><p style="margin:0">${ctx.t('srcP1')}</p><p style="margin:0">${ctx.t('srcP2')}</p><div style="display:flex;justify-content:flex-end"><button type="button" class="st-pill" data-ok style="min-width:140px">${ctx.t('ok')}</button></div></div>` });
        ov.querySelector('[data-ok]').addEventListener('click', () => { if (!EFA.edit.on) ov.close(); });
      });
      ctx.on(ctx.$('[data-doc]'), 'click', () => {
        if (!rows) return;
        openSheet(ctx, { heading: ctx.t('wsTitle'), size: 'medium', disclosures: ['notAdvice', 'license'],
          columns: [['year', 'wsYear', 'year'], ['low', 'wsLow', 'pct'], ['lowAt', 'wsLowAt', 'money'], ['top', 'wsTop', 'pct'], ['topAt', 'wsTopAt', 'money']].map(([f, k, t]) => ({ field: f, header: ctx.t(k), type: t, dp: 2 })),
          rows: rows.map((r) => ({ year: r.year, low: r.low, lowAt: r.lowAt, top: r.top, topAt: r.topAt })) });
      });
    }
  });

  /* ---------- Spender, Saver, Wealth Creator on the zero line ---------- */
  EFA.css('b14-sswc', `
  @keyframes b14in { from { opacity: 0; } to { opacity: 1; } }
  .stage .b14-st { opacity: 0; animation-name: b14in; animation-fill-mode: forwards; animation-timing-function: ease; }
  .stage .b14-plab { position: absolute; font: 700 40px/1 "DM Sans", sans-serif; letter-spacing: .01em; transition: opacity .6s ease; }
  .stage .b14-ann { transition: opacity .3s ease .3s; }
  .stage .b14-ann.is-off { transition-delay: 0s; }
  .stage .b14-ttl, .stage .b14-sn { transition: opacity .5s ease; }
  `);
  const ZL = { x0: 130, x1: 1060, y: 560, iw: (1060 - 130) / 6 };
  function sswcPattern(n) {
    const { x0, x1, y, iw } = ZL, an = (delay, dur) => `style="animation-delay:${delay}ms;animation-duration:${dur}ms"`;
    let g = '';
    if (n === 1) {
      const D = 190;
      for (let k = 0; k < 6; k++) {
        const xs = x0 + k * iw; let d = `M${xs},${y}V${y + D}`;
        for (let s = 1; s <= 5; s++) d += `H${(xs + (iw * s) / 5).toFixed(1)}V${(y + D - (D * s) / 5).toFixed(1)}`;
        g += `<g class="b14-st" ${an(300 * (k + 1), 100 * (k + 1))}><path d="${d}" fill="none" stroke="${P.navy3}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${xs}" cy="${y}" r="9" fill="${P.navy}"/></g>`;
      }
    } else if (n === 2) {
      const D = 190;
      for (let k = 0; k < 6; k++) {
        const xs = x0 + k * iw; let d = `M${xs},${y}`;
        for (let s = 1; s <= 5; s++) d += `V${(y - (D * s) / 5).toFixed(1)}H${(xs + (iw * s) / 5).toFixed(1)}`;
        d += `V${y}`;
        g += `<g class="b14-st" ${an(300 * (k + 1), 100 * (k + 1))}><path d="${d}" fill="none" stroke="${P.navy4}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/></g><circle class="b14-st" ${an(300 * Math.max(2, k + 1), 300)} cx="${(xs + iw).toFixed(1)}" cy="${y}" r="9" fill="${P.navy}"/>`;
      }
    } else if (n === 3) {
      const H = 200, cy = (x) => y - (y - H) * Math.pow((x - x0) / (x1 - x0), 2.2);
      let d = ''; for (let i = 0; i <= 60; i++) { const x = x0 + ((x1 - x0) * i) / 60; d += `${i ? 'L' : 'M'}${x.toFixed(1)},${cy(x).toFixed(1)}`; }
      g += `<path class="b14-st" ${an(300, 300)} d="${d}" fill="none" stroke="${P.gold}" stroke-width="9" stroke-linecap="round"/>`;
      [46, 42, 38, 34, 30].forEach((drop, i) => {
        const k = i + 1, xs = x0 + k * iw, xe = xs + iw * 0.8, yb = cy(xs) + drop, ye = cy(xe);
        let p = `M${xs.toFixed(1)},${cy(xs).toFixed(1)}V${yb.toFixed(1)}`;
        for (let s = 1; s <= 5; s++) p += `H${(xs + (iw * 0.8 * s) / 5).toFixed(1)}V${(yb - ((yb - ye) * s) / 5).toFixed(1)}`;
        g += `<path class="b14-st" ${an(300 * k, 300)} d="${p}" fill="none" stroke="${P.navy3}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
      });
      for (let k = 1; k <= 6; k++) { const xs = x0 + k * iw; g += `<circle class="b14-st" ${an(300 * k, 300)} cx="${xs.toFixed(1)}" cy="${cy(xs).toFixed(1)}" r="9" fill="${P.goldLt}" stroke="${P.goldDeep}" stroke-width="2.5"/>`; }
    }
    return g;
  }
  EFA.screen('sswc1', {
    title: 'Three money personalities on the zero line',
    steps: 4,
    copy: {
      head: 'Spender, Saver, Wealth Creator', zero: '0', debtor: 'Debtor', saver: 'Saver', wc: 'Wealth Creator', types: 'Three Types',
      b1: 'Spending runs ahead of income, so the Spender borrows and lives below the zero line.',
      b2: 'The Saver saves up first, spends it down, and hovers right at the zero line.',
      b3: 'The Wealth Creator keeps saving, borrows to buy, and stays above the zero line.',
      _notes: 'Picture a line at zero: nothing owed, nothing saved. Every family lives above it, on it, or below it.\n\n- Click once for each type. Let the client tell you which one sounds like them.\n- Ask: Which line looks most like the last ten years of your finances?\nPAUSE'
    },
    render(ctx) {
      const { x0, x1, y } = ZL;
      ctx.el.innerHTML = `
        <div class="b14-head" style="top:40px"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <svg class="b14-abs" style="left:0;top:0" width="1600" height="900" viewBox="0 0 1600 900">
          <rect x="${x0 - 30}" y="${y}" width="${x1 - x0 + 60}" height="220" fill="${P.mist}" opacity=".55" rx="6"/>
          <line x1="${x0 - 30}" x2="${x1 + 30}" y1="${y}" y2="${y}" stroke="${P.navy}" stroke-width="8" stroke-linecap="round"/>
          <g class="b14-pat"></g>
        </svg>
        <div class="b14-abs" style="left:${x0 - 76}px;top:${y - 26}px;font:700 42px/1 'DM Sans',sans-serif;color:#0d1e3a">${ctx.t('zero')}</div>
        <div class="b14-plab" data-p="1" style="left:${x0 + 10}px;top:${y - 120}px;color:#1d3863">${ctx.t('debtor')}</div>
        <div class="b14-plab" data-p="2" style="left:${x0 + 10}px;top:${y + 70}px;color:#2b4c80">${ctx.t('saver')}</div>
        <div class="b14-plab" data-p="3" style="left:${x0 + 10}px;top:${y - 300}px;color:#8a6e22">${ctx.t('wc')}</div>
        <div class="b14-abs" style="left:1110px;top:206px;width:400px;display:grid;gap:18px">
          <div class="b14-ph">${ctx.t('types')}</div>
          ${blist(ctx, [ctx.t('b1'), ctx.t('b2'), ctx.t('b3')], { from: 1, boxed: true, size: 40, gap: 16, text: 'b14-btxt' })}
        </div>`;
    },
    step(ctx, n) {
      ctx.$('.b14-pat').innerHTML = sswcPattern(n);
      [1, 2, 3].forEach((k) => ctx.show(`[data-p="${k}"]`, n === k));
      reveal(ctx, n);
    }
  });

  /* ---------- Four financial stages ---------- */
  const STAGES = ['sp', 'sv', 'wc', 'lp'];
  const LP = { x: 92, y: 150, w: 1000, h: 640, pl: 40, pr: 34, pt: 84, pb: 40 };
  const lpX = (x) => LP.x + LP.pl + ((x - 1) / 99) * (LP.w - LP.pl - LP.pr);
  const lpY = (v) => LP.y + LP.pt + ((30 - v) / 50) * (LP.h - LP.pt - LP.pb);
  const LP_CURVES = {
    sp: [[17, 0], [20, -12], [24, -6], [28, -14], [32, -5], [36, -13], [40, -7], [44, -15], [47, -4], [50, 0], [53, -11], [57, -5], [61, -14], [65, -6], [69, -13], [73, -4], [77, -12], [81, -6], [85, -15], [89, -7], [93, -12], [97, -5], [100, -5]],
    sv: [[17, 0], [21, 6], [25, 2], [29, 9], [33, 3], [37, 10], [41, 1], [45, 8], [49, -1], [53, 7], [57, 4], [61, 13], [65, 5], [69, 9], [73, 0], [77, 7], [81, 3], [85, 8], [89, 2], [93, 6], [97, 3], [100, 4]],
    wc: (() => { const p = []; for (let x = 17; x <= 100; x += 1) p.push([x, x <= 67 ? 25 * Math.pow((x - 17) / 50, 1.8) : 25 * Math.pow(Math.cos(((x - 67) / 33) * Math.PI / 2), 1.15)]); return p; })(),
    lp: (() => { const p = []; for (let x = 17; x <= 100; x += 1) p.push([x, x <= 67 ? 25 * Math.pow((x - 17) / 50, 1.8) : 25]); return p; })()
  };
  const lpPath = (pts) => smoothPath(pts.map(([x, v]) => [lpX(x), lpY(v)]));
  EFA.screen('sswclp1', {
    title: 'Four financial stages',
    steps: 5,
    copy: {
      sp: 'Spender', sv: 'Saver', wc: 'Wealth Creator', lp: 'Legacy Provider',
      t0: 'The Zero Line', t1: 'The Spender', t2: 'The Saver', t3: 'The Wealth Creator', t4: 'The Legacy Provider',
      aSI: 'Savings & Investments', aCL: 'Current Lifestyle', aRet: 'Retirement', aLE: 'Life Expectancy', aCeil: 'Lifestyle Ceiling', aLeg: 'Legacy',
      stage: 'Financial Stage:',
      'sp.1': 'Lives in debt, below the zero line.', 'sp.2': 'How much is earned does not change the pattern.', 'sp.3': 'Every after-tax dollar goes to spending.', 'sp.4': 'Purchases are financed.', 'sp.5': 'Never gets above zero.',
      'sv.1': 'Avoids debt and stays just above zero.', 'sv.2': 'Income is steady.', 'sv.3': 'Seldom uses credit.', 'sv.4': 'Now and then drifts near or below the zero line.',
      'wc.1': 'Aims to keep today\'s standard of living, adjusted for inflation, in retirement.', 'wc.2': 'Builds retirement money through workplace saving and investing.', 'wc.3': 'Borrows sensibly.', 'wc.4': 'Expects to spend everything down by the end.',
      'lp.1': 'Saves and invests while steering clear of avoidable losses.', 'lp.2': 'Caps spending at a chosen level.', 'lp.3': 'Borrows sensibly.', 'lp.4': 'Intends to create a legacy for the next generation.',
      _notes: 'Four stages, one line at zero. Most people never get past the second. Our work is to move you to the third, and if you choose, the fourth.\n\n- Click through each stage and let the client place themselves.\n- Ask: Which stage are you in today, and which one do you want to finish in?\nPAUSE'
    },
    render(ctx) {
      const cnt = { sp: 5, sv: 4, wc: 4, lp: 4 };
      const ann = (k, x, v, o) => `<div class="b14-abs b14-ann ${o.cls || ''}" data-a="${k}" style="left:${lpX(x) + (o.dx || 0)}px;top:${lpY(v) + (o.dy || 0)}px;font:700 ${o.fs || 21}px/1.15 'DM Sans',sans-serif;color:${o.c};${o.right ? 'transform:translateX(-100%);text-align:right;' : ''}white-space:nowrap">${ctx.t(k)}</div>`;
      const xm = (x, v) => { const X = lpX(x), Y = lpY(v); return `<path d="M${X - 10},${Y - 10}L${X + 10},${Y + 10}M${X + 10},${Y - 10}L${X - 10},${Y + 10}" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/>`; };
      let grid = ''; for (let v = -20; v <= 30; v += 10) grid += `<line x1="${LP.x + LP.pl}" x2="${LP.x + LP.w - LP.pr}" y1="${lpY(v)}" y2="${lpY(v)}" stroke="#e3e8f0" stroke-width="2"/>`;
      ctx.el.innerHTML = `
        <div class="b14-head" style="top:38px"><h1 class="st-h1" style="font-size:54px">${STAGES.map((k) => `<span data-h="${k}" style="transition:color .5s ease">${ctx.t(k)}</span>`).join('<span>, </span>')}</h1></div>
        <div class="b14-panel" style="left:${LP.x}px;top:${LP.y}px;width:${LP.w}px;height:${LP.h}px"></div>
        <div class="b14-abs" style="left:${LP.x}px;top:${LP.y + 22}px;width:${LP.w}px;text-align:center">${[0, 1, 2, 3, 4].map((i) => `<span class="st-h3 b14-ttl" data-t="${i}" style="position:absolute;left:0;right:0">${ctx.t('t' + i)}</span>`).join('')}</div>
        <svg class="b14-abs" style="left:0;top:0" width="1600" height="900" viewBox="0 0 1600 900">${grid}
          <g class="b14-lpc"></g>
          <line x1="${LP.x + LP.pl}" x2="${LP.x + LP.w - LP.pr}" y1="${lpY(0)}" y2="${lpY(0)}" stroke="${P.navy}" stroke-width="5"/>
          <g class="b14-ann" data-g="mk">${xm(67, 25)}${xm(100, 0)}</g>
        </svg>
        ${ann('aSI', 20, 14, { c: '#1d3863' })}
        ${ann('aCL', 52, -4, { c: '#2b4c80', dx: -60, dy: 0 })}
        ${ann('aRet', 67, 25, { c: '#0d1e3a', dx: -50, dy: -46 })}
        ${ann('aLE', 100, 0, { c: '#0d1e3a', right: true, dx: -8, dy: 18 })}
        ${ann('aCeil', 70, 20, { c: '#2b4c80', dx: 0, dy: 10 })}
        ${ann('aLeg', 100, 25, { c: '#8a6e22', right: true, dx: -6, dy: -40, fs: 24 })}
        <div class="b14-abs" style="left:1124px;top:206px;width:384px;display:grid;gap:16px">
          <div class="b14-stg b14-fade"><div class="b14-ph" style="margin-bottom:6px">${ctx.t('stage')}</div>${STAGES.map((k) => `<div class="st-h3 b14-gold b14-sn" data-sn="${k}" style="position:absolute">${ctx.t(k)}</div>`).join('')}</div>
          <div style="position:relative;margin-top:30px">${STAGES.map((k) => `<div class="b14-fade" data-bl="${k}" style="position:absolute;left:0;right:0;top:0">${blist(ctx, Array.from({ length: cnt[k] }, (_, i) => ctx.t(`${k}.${i + 1}`)), { reveal: false, boxed: true, size: 34, gap: 12, text: 'b14-btxt sm' })}</div>`).join('')}</div>
        </div>`;
    },
    step(ctx, n) {
      const cur = n === 0 ? null : STAGES[n - 1];
      const curve = (k, c, w) => `<path d="${lpPath(LP_CURVES[k])}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
      let g = '';
      if (n === 1) g = curve('sp', P.navy3, 6);
      if (n === 2) g = curve('sv', P.navy4, 6);
      if (n === 3) g = curve('wc', P.gold, 7);
      if (n === 4) g = `<path d="M${lpX(62)},${lpY(20)}H${lpX(100)}" stroke="${P.navy4}" stroke-width="5" stroke-dasharray="12 9" stroke-linecap="round"/>` + curve('lp', P.gold, 7);
      ctx.$('.b14-lpc').innerHTML = g;
      STAGES.forEach((k) => { const h = ctx.$(`[data-h="${k}"]`); if (h) h.style.color = k === cur ? '#b8972e' : ''; ctx.show(`[data-bl="${k}"]`, k === cur); ctx.show(`[data-sn="${k}"]`, k === cur); });
      ctx.show('.b14-stg', n > 0);
      [0, 1, 2, 3, 4].forEach((i) => ctx.show(`[data-t="${i}"]`, i === n));
      const a3 = n >= 3, a4 = n === 4;
      ['aSI', 'aCL', 'aRet', 'aLE'].forEach((k) => ctx.show(`[data-a="${k}"]`, a3));
      ctx.show('[data-g="mk"]', a3);
      ['aCeil', 'aLeg'].forEach((k) => ctx.show(`[data-a="${k}"]`, a4));
    }
  });

  /* ---------- money-flow model screens (EFA.lib.pem; docs/pem.md) ---------- */
  EFA.css('b14-pem', `
  .stage .b14-pemhost { position: absolute; }
  .stage .b14-side { position: absolute; display: grid; gap: 16px; align-content: start; }
  .stage .b14-side .b14-sh { font: 600 38px/1.12 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; margin: 0 0 6px; }
  .stage .b14-side .b14-sh2 { font: 700 17px/1.3 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #8a6e22; margin: 10px 0 0; }
  .stage .b14-pemwait { position: absolute; display: grid; place-items: center; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; }
  `);
  const PEM_BASE = { links: false, labels: false, scenarioPicker: false, lifestyleStrip: false, borrowSource: false, sliders: false };
  /** mount the shared model into host (selector or element); returns the instance or null while loading */
  function mountPem(ctx, host, config) {
    const L = LIB('pem');
    const el = typeof host === 'string' ? ctx.$(host) : host;
    if (!L || !L.mount) {
      const box = `<div class="b14-wait"><span class="ring"></span>${ctx.t('_pemwait')}</div>`;
      if (el) el.innerHTML = `<div class="b14-pemwait" style="inset:0">${box}</div>`;
      else ctx.el.insertAdjacentHTML('beforeend', `<div class="b14-pemwait" style="left:40px;top:120px;width:830px;height:640px">${box}</div>`);
      return null;
    }
    try { return L.mount(ctx, el, Object.assign({}, PEM_BASE, config)); } catch (e) { console.error(e); return null; }
  }
  const PEM_WAIT = 'The money-flow model is loading.';

  /* the three money habits on the model: shared frame (heading, model left, bullets right) */
  function sswcScreen(o) {
    return {
      title: o.title,
      steps: 4,
      copy: Object.assign({ _pemwait: PEM_WAIT }, o.copy),
      render(ctx) {
        ctx.el.innerHTML = `
          <div class="b14-head" style="top:36px;padding:0 520px 0 110px;justify-items:start;text-align:left"><h1 class="st-h1">${ctx.t('head')}</h1></div>
          <div class="b14-pemhost" style="left:24px;top:132px;width:1124px;height:700px"></div>
          <div class="b14-side" style="left:1172px;top:${o.panelTop || 196}px;width:384px">
            ${ctx.t('ph', { tag: 'h2', cls: 'b14-sh' })}
            ${blist(ctx, ['b1', 'b2', 'b3', 'b4'].map((k) => ctx.t(k)), { from: 0, boxed: true, size: 34, gap: 14, text: 'b14-btxt sm' })}
          </div>`;
        ctx.pem = mountPem(ctx, '.b14-pemhost', Object.assign({ view: 'full', align: 'center', pad: [0, 0, 0, 0] }, o.pem));
        if (ctx.pem && o.flows) ctx.pem.flow(o.flows, true);
      },
      step(ctx, n, dir) {
        reveal(ctx, n);
        if (ctx.pem) { try { o.step(ctx, ctx.pem, n, dir); } catch (e) { console.error(e); } }
      }
    };
  }
  EFA.screen('sswc2', sswcScreen({
    title: 'The Spender on the money-flow model',
    copy: {
      head: 'The Spender', ph: 'Life Below the Zero Line',
      b1: 'Every dollar earned goes to today\'s spending.',
      b2: 'There is nothing to pledge as collateral.',
      b3: 'Big-ticket items can only be bought on credit.',
      b4: 'What is borrowed gets paid back, with interest on top.',
      _notes: 'Here is the Spender on the model: income comes in, taxes come out, and everything left goes to today. Nothing builds up.\n\n- At the last click, watch the borrowed tank: every big purchase is borrowed, then paid back out of lifestyle, with interest.\n- Ask: When something big comes up, where does the money come from today?\nPAUSE'
    },
    pem: { showFuture: false, showQP: false, showHouse: false, showBorrowed: false, regulator: 100, remaining: 100, borrow: 0 },
    flows: ['incomeToFilter', 'incomeTaxOut', 'filterToOutflow'],
    step(ctx, p, n) {
      p.set({ showBorrowed: n >= 2 });
      if (n === 3) p.play('SSWCDebtorBorrow');
      else { p.stop('SSWCDebtorBorrow'); p.set({ borrow: 0, remaining: 100 }, { ms: 0 }); }
    }
  }));
  EFA.screen('sswc3', sswcScreen({
    title: 'The Saver on the money-flow model',
    copy: {
      head: 'The Saver', ph: 'Life on the Zero Line',
      b1: 'Puts money aside for later through a workplace plan.',
      b2: 'Builds a separate fund for upcoming lifestyle costs.',
      b3: 'Would rather pay cash than take on debt and interest.',
      b4: 'Draws savings down to pay cash, then refills them, with no interest earned on the money spent.',
      _notes: 'The Saver avoids debt, which is good. The cost is quieter: every dollar spent from savings stops earning, and the fund is rebuilt from scratch.\n\n- Click to fill the purchase fund, then to pay cash and start over.\n- Ask: When you pay cash, what happens to the growth that money would have kept earning?\nPAUSE'
    },
    pem: { regulator: 100, remaining: 100, borrow: 0, riskPreTax: 30, riskKeep: 70, house: 0, showBorrowed: true, showHouse: true, mcpFunds: true, mcpName: '' },
    flows: ['incomeToQP', 'incomeToFilter', 'incomeTaxOut', 'filterToOutflow'],
    step(ctx, p, n) {
      if (n === 1) { p.stop('SSWCSaverPayCash'); p.play('SSWCSaverEmergencyFund'); return; }
      p.stop('SSWCSaverEmergencyFund');
      if (n === 3) { p.play('SSWCSaverPayCash'); return; }
      p.stop('SSWCSaverPayCash');
      p.set({ house: n === 2 ? 30 : 0, mcpRemaining: 100 }, { ms: 0 });
    }
  }));
  EFA.screen('sswc4', sswcScreen({
    title: 'The Wealth Creator on the money-flow model',
    panelTop: 220,
    copy: {
      head: 'The Wealth Creator', ph: 'Life Above the Zero Line',
      b1: 'Sets aside enough to fund both today\'s and tomorrow\'s lifestyle.',
      b2: 'Spreads money across different kinds of accounts so capital stays within reach.',
      b3: 'Finances purchases with loans secured by savings.',
      b4: 'Pays the loan back, interest included, from everyday cash flow.',
      _notes: 'The Wealth Creator saves first and keeps the savings working. When a purchase comes up, the savings secure a loan instead of being spent, so they keep growing while the loan is repaid from cash flow.\n\n- Click to make the purchase, then to repay it and watch savings keep rising.\n- Ask: Which would you rather have at the end, an empty savings account or a repaid loan and savings that kept growing?\nPAUSE'
    },
    pem: { collateral: 'safe', borrow: 0, house: 0, regulator: 85, remaining: 100, riskPreTax: 60, riskKeep: 70, safe: 50, showBorrowed: true, showHouse: true, mcpFunds: true, mcpName: '' },
    flows: ['filterToSafe', 'incomeToQP', 'incomeToFilter', 'incomeTaxOut', 'filterToOutflow'],
    step(ctx, p, n) {
      if (n <= 1) { p.stop('SSWCWCBorrow'); p.stop('SSWCWCPayLoan'); p.set({ borrow: 0, safe: 50, remaining: 100 }, { ms: 0 }); return; }
      if (n === 2) { p.stop('SSWCWCPayLoan'); p.set({ safe: 50, remaining: 100 }, { ms: 0 }); p.play('SSWCWCBorrow'); return; }
      p.stop('SSWCWCBorrow');
      ctx.timeout(() => { if (ctx.step === 3) p.play('SSWCWCPayLoan'); }, 100);
    }
  }));

  /* taxable accounts: lesson frame (zoomed model left, panel right, expand toggle) */
  const TAF_FRAME = (expanded) => ({ zoom: { fit: ['income', 'filter', 'safe'], pad: 1.2 }, width: 0.56, expanded, panel: '.b14-tafp', expandShows: ['labels', 'lifestyle'], toggle: true });
  const TAF_PEM = { showBorrowed: false, showHouse: false, collateral: 'none', safeTax: 100 };
  EFA.screen('taf1', {
    title: 'How taxable accounts work',
    steps: 6,
    copy: {
      ph: 'How Taxable Accounts Work',
      b1: 'Money reaches the account only after it passes through the tax filter.',
      b2: 'Every dollar deposited has already been taxed.',
      b3: 'Earnings inside the account are taxed.',
      b4: 'That tax bill comes due every year.',
      _pemwait: PEM_WAIT,
      _notes: 'A taxable account is the most familiar place to save, and it has two tax stops: once on the way in, and again every year on the growth.\n\n- Click through: income, the tax filter, the deposit, then the growth that will be taxed.\n- Ask: How much of your savings growth goes to taxes each year, and where does that money come from?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b14-side b14-tafp b14-fade" style="left:900px;top:150px;width:620px">
          ${ctx.t('ph', { tag: 'h2', cls: 'b14-sh' })}
          ${blist(ctx, ['b1', 'b2', 'b3', 'b4'].map((k) => ctx.t(k)), { from: 2, boxed: true, size: 36, gap: 16, text: 'b14-btxt' })}
        </div>`;
      ctx.pem = mountPem(ctx, null, Object.assign({}, TAF_PEM, { safe: 10, safeTaxable: 10, frame: TAF_FRAME(true) }));
    },
    step(ctx, n, dir) {
      reveal(ctx, n);
      const p = ctx.pem; if (!p) return;
      p.expand(n === 0);
      const later = (fn) => ctx.timeout(() => { if (ctx.step === n) fn(); }, 100);
      if (n <= 1) { p.stopAll(); p.set({ safe: 10, safeTaxable: 10 }, { ms: 0 }); return; }
      if (n === 2) { p.stop('TASavingInTanks'); p.stop('TATaxableGrowth'); p.set({ safe: 10, safeTaxable: 10 }, { ms: 0 }); if (dir >= 0) p.play('TAIncome'); else p.stop('TAIncome'); return; }
      if (n === 3) { p.stop('TAIncome'); p.stop('TATaxableGrowth'); p.set({ safe: 10, safeTaxable: 10 }, { ms: 0 }); later(() => p.play('TASavingInTanks')); return; }
      if (n === 4) { p.stop('TAIncome'); p.stop('TASavingInTanks'); later(() => p.play('TATaxableGrowth')); return; }
      p.stop('TAIncome'); p.stop('TASavingInTanks');
      if (p.playing && p.playing('TATaxableGrowth')) p.stop('TATaxableGrowth'); else p.set({ safe: 60, safeTaxable: 70 }, { ms: 0 });
    }
  });
  EFA.screen('taf2', {
    title: 'Who pays the tax on a taxable account',
    steps: 6,
    copy: {
      ph: 'How Taxable Accounts Work',
      s1: 'When the Tax Comes Out of the Account', a1: 'The account ends up smaller.', a2: 'Growth compounds more slowly.',
      s2: 'When the Tax Comes Out of Today\'s Spending', c1: 'Less is left to spend now.', c2: 'The account can grow larger.',
      _pemwait: PEM_WAIT,
      _notes: 'The tax on a taxable account has to be paid by someone, every year. It either comes out of the account, or out of what you spend today.\n\n- First click: the tax comes out of the account, and the balance climbs in halting steps.\n- Later clicks: the tax comes out of lifestyle, so the account keeps all its growth, and you live on a little less.\n- Ask: Which of those two would you rather give up?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b14-side b14-tafp b14-fade" style="left:900px;top:130px;width:620px">
          ${ctx.t('ph', { tag: 'h2', cls: 'b14-sh' })}
          ${ctx.t('s1', { tag: 'div', cls: 'b14-sh2' })}
          ${blist(ctx, [{ html: ctx.t('a1'), at: 1 }, { html: ctx.t('a2'), at: 2 }], { boxed: true, size: 36, gap: 14, text: 'b14-btxt' })}
          <div class="b14-fade" data-s2>${ctx.t('s2', { tag: 'div', cls: 'b14-sh2' })}</div>
          ${blist(ctx, [{ html: ctx.t('c1'), at: 4 }, { html: ctx.t('c2'), at: 5 }], { boxed: true, size: 36, gap: 14, text: 'b14-btxt' })}
        </div>`;
      ctx.pem = mountPem(ctx, null, Object.assign({}, TAF_PEM, { safe: 10, safeTaxable: 10, frame: TAF_FRAME(false) }));
    },
    step(ctx, n) {
      reveal(ctx, n);
      ctx.show('[data-s2]', n >= 3);
      const p = ctx.pem; if (!p) return;
      const A = 'TATaxableGrowthFromAccount', B = 'TATaxableGrowthFromLifestyle';
      if (n === 0) { p.stopAll(); p.set({ safe: 10, safeTaxable: 10, regulator: 80 }, { ms: 0 }); return; }
      if (n <= 2) { p.stop(B); p.set({ regulator: 80 }, { ms: 0 }); p.play(A); return; }
      if (n === 3) { p.stop(A); p.stop(B); p.set({ safe: 70, safeTaxable: 70, regulator: 80 }, { ms: 0 }); return; }
      p.stop(A); p.play(B);
    }
  });
  EFA.screen('taf3', {
    title: 'Things to consider with taxable accounts',
    steps: 5,
    copy: {
      ph: 'Things To Consider',
      b1: 'Account rules can limit when you can get to the money.',
      b2: 'How much it can realistically earn.',
      b3: 'Inflation wears down what the money can buy.',
      b4: 'Creditors may be able to reach it.',
      _pemwait: PEM_WAIT,
      _notes: 'Taxes are only part of the picture. Before money goes into any account, it is worth asking four more questions.\n\n- Ask: Of these four, which one would worry you most if it happened next year?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b14-side b14-tafp b14-fade" style="left:900px;top:150px;width:620px">
          ${ctx.t('ph', { tag: 'h2', cls: 'b14-sh' })}
          ${blist(ctx, ['b1', 'b2', 'b3', 'b4'].map((k) => ctx.t(k)), { from: 1, boxed: true, size: 36, gap: 16, text: 'b14-btxt' })}
        </div>`;
      ctx.pem = mountPem(ctx, null, Object.assign({}, TAF_PEM, { safe: 40, safeTaxable: 40, frame: TAF_FRAME(false) }));
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /*@@SCREENS@@*/
})();
