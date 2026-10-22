/* Module b15: Term Insurance 101 (PTI: pti1, pti2), Time and Money (TNM), the TLS question cards
   (tls1-3, also ig1), Understanding Policy Loans (upl1, atc3), Trading Cars (tradecar1-3), the TVM
   calculator (tvm1), Umbrella Insurance (umbins1), Wealth and Income Potential (wip1, wip2), the
   Whiteboard (wb1), Wills and Trusts (wills1), the partner disclosure page (fwdisc1) and the Income
   Game (ig2). Structure, sequence, interactions and math follow the clean-room specs; drawings and
   wording are new. Engines exposed: EFA.engines.tradeCars, .tnm, .tvm, .wip, .umbrella, .upl. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt;
  const esc = EFA.util.esc;
  let gid = 0; const nid = (p) => `b15${p || 'g'}${++gid}`;
  const N = (s) => `<span class="num">${s}</span>`;
  const m0 = (v) => F.money(v);
  const m2 = (v) => F.money(v, { dp: 2 });
  const isNum = (v) => typeof v === 'number' && isFinite(v);
  const HYPO = 'Hypothetical illustration only. It is not a guarantee or a projection of any specific product, and actual results will vary.';
  const LOANS = 'Policy loans and withdrawals reduce the cash value and death benefit, accrue interest, and may cause the policy to lapse.';

  EFA.css('b15', `
  .b15-full { position: absolute; inset: 0; width: 1600px; height: 900px; overflow: visible; }
  .b15-head { position: absolute; left: 0; right: 0; top: 50px; display: grid; justify-items: center; gap: 22px; text-align: center; padding: 0 130px; pointer-events: none; }
  .b15-head > * { pointer-events: auto; }
  .b15-head .st-h1 { font-size: 62px; max-width: 1340px; }
  .b15-head .st-h1.sm { font-size: 54px; line-height: 1.08; }
  .b15-fade { transition: opacity .8s ease, transform .8s ease; }
  .stage .b15-fade.is-off { transition: opacity .3s ease, transform .3s ease; }
  .stage .b15-snap.is-off { transition: none !important; }
  .b15-card { position: absolute; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 14px 34px rgba(13,30,58,.08); box-sizing: border-box; }
  .b15-flow { position: static; }
  .b15-band { margin: -1px -1px 0; padding: 16px 26px; border-radius: 16px 16px 0 0; background: #0d1e3a; color: #f7f5f1; text-align: center; font: 600 30px/1.15 "Cormorant Garamond", Georgia, serif; }
  .b15-band.sm { font-size: 26px; padding: 12px 20px; }
  .b15-form { display: grid; }
  .stage .b15-form .st-field { display: grid; grid-template-columns: 1fr 210px; align-items: center; gap: 22px; padding: 11px 0; border-bottom: 1px solid rgba(13,30,58,.10); }
  .stage .b15-form .st-field:last-child { border-bottom: 0; }
  .stage .b15-form .st-field > label, .stage .b15-form .st-field > .lb { font: 700 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; letter-spacing: .01em; text-transform: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stage .b15-form .st-input { text-align: right; height: 50px; }
  .stage .b15-form.tight .st-field { padding: 6px 0; gap: 14px; grid-template-columns: 1fr 150px; }
  .stage .b15-form.tight .st-field > label { font-size: 18px; }
  .stage .b15-form.tight .st-input { height: 40px; font-size: 18px; padding: 0 10px; border-radius: 8px; }
  .stage .b15-form .st-field > label.b15-lk { color: #8a6e22; cursor: pointer; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 5px; }
  .stage .b15-form .st-field > label.b15-lk:hover { color: #0d1e3a; }
  .b15-rows { display: grid; }
  .b15-rows .r { display: flex; justify-content: space-between; align-items: baseline; gap: 24px; padding: 14px 4px; border-bottom: 1px solid rgba(13,30,58,.10); }
  .b15-rows .r:last-child { border-bottom: 0; }
  .b15-rows .r .k { font: 700 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-rows .r .v { font: 700 30px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-rows .r.hl { background: #f0e6c4; border-radius: 10px; border-bottom-color: transparent; padding-left: 16px; padding-right: 16px; }
  .b15-rows .r.hl .v { color: #8a6e22; }
  .b15-calc { min-width: 230px; min-height: 54px !important; font-size: 19px !important; letter-spacing: .04em; }
  .b15-link { font: 600 19px/1 "DM Sans", sans-serif; letter-spacing: .05em; color: #8a6e22; cursor: pointer; border: 0; background: none; padding: 4px 2px 3px; border-bottom: 1.5px dotted currentColor; }
  .b15-link:hover { color: #0d1e3a; }
  .b15-link[disabled] { opacity: .35; cursor: default; pointer-events: none; }
  .b15-doclink { display: inline-flex; align-items: center; gap: 8px; border-bottom: 0; }
  .b15-doclink > [data-cp] { border-bottom: 1.5px dotted currentColor; padding-bottom: 2px; }
  .b15-disc { position: absolute; left: 110px; bottom: 30px; width: 1120px; margin: 0; }
  .b15-disc.c { left: 50%; transform: translateX(-50%); text-align: center; width: 1180px; }
  .b15-pending { display: grid; justify-items: center; align-content: center; gap: 16px; text-align: center; color: #667389; font: 500 20px/1.45 "DM Sans", sans-serif; }
  .b15-pending .dot { width: 50px; height: 50px; border-radius: 50%; border: 3px solid #cbd5e3; border-top-color: #b8972e; animation: b15spin 1.4s linear infinite; }
  @keyframes b15spin { to { transform: rotate(360deg); } }
  .b15-med { position: absolute; border-radius: 50%; background: #fffdf8; border: 1px solid #d6cfc4; box-shadow: 0 18px 40px rgba(13,30,58,.10); display: grid; place-items: center; overflow: hidden; }
  .b15-lab { position: absolute; transform: translate(-50%, -50%); text-align: center; font: 700 25px/1.18 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #f7f5f1; white-space: nowrap; }
  .b15-lab.dark { color: #0d1e3a; }
  .b15-lab.sm { font-size: 21px; letter-spacing: .08em; }
  .b15-x { position: absolute; }
  .b15-modal { position: absolute; inset: 0; z-index: 35; background: rgba(13,30,58,.42); display: grid; place-items: center; animation: scr-in .25s ease both; }
  .b15-modal-in { width: 800px; background: #fffdf8; border-radius: 16px; border: 1px solid #d6cfc4; box-shadow: 0 30px 80px rgba(8,20,42,.35); overflow: hidden; }
  .b15-modal-b { padding: 30px 38px 10px; font: 500 22px/1.5 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-modal-f { display: flex; justify-content: flex-end; padding: 16px 30px 26px; }
  .b15-menu { position: absolute; z-index: 36; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 10px; box-shadow: 0 12px 30px rgba(8,20,42,.25); padding: 6px; }
  .b15-menu button { display: block; border: 0; background: transparent; padding: 10px 22px; font: 600 18px/1 "DM Sans", sans-serif; color: #0d1e3a; border-radius: 7px; }
  .b15-menu button:hover { background: #f0e6c4; }
  .b15-choose { display: grid; gap: 16px; padding: 10px 6px 18px; justify-items: stretch; }
  .b15-choose .st-pill { min-height: 64px; font-size: 21px; }
  .b15-check h3 { margin: 6px 0 12px; font: 600 30px/1.15 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; border-bottom: 2px solid #b8972e; padding-bottom: 8px; }
  .b15-check ol { margin: 0 0 22px; padding-left: 34px; display: grid; gap: 9px; font: 500 20px/1.42 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-check ol li::marker { font-weight: 700; color: #8a6e22; }
  .b15-check .sub { margin: 0 0 18px; font: 600 21px/1.4 "DM Sans", sans-serif; color: #8a6e22; }
  .b15-check .fine { display: grid; gap: 8px; margin-top: 8px; padding-top: 14px; border-top: 1px solid rgba(13,30,58,.12); }
  .b15-check .fine p { margin: 0; font: 400 15px/1.45 "DM Sans", sans-serif; color: #667389; }
  .b15-check .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 44px; }

  /* question card (tls1-3, ig1) */
  .b15-q { position: absolute; inset: 0; }
  .b15-q-txt { position: absolute; left: 190px; top: 50%; width: 690px; transform: translateY(-50%); display: grid; gap: 34px; }
  .b15-q-txt .st-h1 { font-size: 76px; line-height: 1.06; }
  .b15-q-art { position: absolute; left: 960px; top: 92px; width: 430px; height: 720px; }
  .b15-q-art svg { width: 100%; height: 100%; overflow: visible; }

  /* loan calculator (tradecar2) */
  .b15-lc { position: absolute; left: 50%; top: 196px; width: 860px; transform: translateX(-50%); display: grid; justify-items: center; gap: 26px; transition: transform .9s cubic-bezier(.3,.1,.2,1); }
  .b15-lc.lo { transform: translate(-50%, 86px); }
  .stage .b15-lc .b15-form .st-field { padding: 15px 0; grid-template-columns: 1fr 250px; }
  .stage .b15-lc .b15-form .st-field > label { font-size: 27px; }
  .stage .b15-lc .b15-form .st-input { height: 60px; font-size: 27px; }
  .b15-lc .b15-rows .r .k { font-size: 25px; }
  .b15-lc .b15-rows .r .v { font-size: 34px; }
  .b15-lc .in { position: relative; width: 860px; padding: 12px 44px; }
  .b15-lc .res { position: relative; width: 780px; overflow: hidden; }

  /* disclosure page (fwdisc1) */
  .b15-fwd { left: 190px; right: 190px; top: 196px; bottom: 96px; overflow: auto; padding: 40px 54px; display: grid; gap: 20px; align-content: start; overscroll-behavior: contain; }
  .b15-fwd p { margin: 0; font: 400 22px/1.6 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-fwd p.lead { font-weight: 700; }

  /* whiteboard (wb1) */
  .b15-wb-cv { position: absolute; inset: 0; width: 1600px; height: 900px; touch-action: none; cursor: crosshair; }
  .b15-wb-cv.paused { pointer-events: none; }
  .b15-wb-cv.erase { cursor: cell; }
  .b15-wb-bar { position: absolute; right: 22px; top: 18px; z-index: 6; display: flex; align-items: center; gap: 6px; padding: 8px; border-radius: 16px; background: rgba(13,30,58,.94); box-shadow: 0 14px 34px rgba(8,20,42,.28); }
  .b15-wb-bar.v { flex-direction: column; }
  .b15-wb-bar .sep { width: 1px; height: 30px; background: rgba(247,245,241,.18); margin: 0 3px; }
  .b15-wb-bar.v .sep { width: 30px; height: 1px; margin: 3px 0; }
  .b15-wb-b { width: 46px; height: 46px; border-radius: 11px; border: 0; background: transparent; color: #f7f5f1; display: grid; place-items: center; padding: 0; transition: background .2s ease, color .2s ease; }
  .b15-wb-b:hover { background: rgba(247,245,241,.12); }
  .b15-wb-b[aria-pressed="true"] { background: #b8972e; color: #0d1e3a; }
  .b15-wb-b svg { width: 26px; height: 26px; }
  .b15-wb-sel { height: 40px; border-radius: 10px; border: 1px solid rgba(247,245,241,.3); background: #14284a; color: #f7f5f1; font: 600 16px/1 "DM Sans", sans-serif; padding: 0 8px; }
  .b15-wb-col { position: relative; width: 46px; height: 46px; border-radius: 11px; display: grid; place-items: center; cursor: pointer; }
  .b15-wb-col:hover { background: rgba(247,245,241,.12); }
  .b15-wb-col .sw { width: 26px; height: 26px; border-radius: 50%; border: 3px solid #f7f5f1; box-sizing: border-box; }
  .b15-wb-col input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .b15-wb-tip { position: absolute; z-index: 7; padding: 7px 12px; border-radius: 8px; background: #0d1e3a; color: #f7f5f1; font: 600 15px/1 "DM Sans", sans-serif; letter-spacing: .04em; white-space: nowrap; pointer-events: none; transform: translateX(-50%); }
  .b15-wb-tips { display: none; }
  .b15-wb-hint { position: absolute; left: 50%; bottom: 46px; transform: translateX(-50%); font: 600 15px/1 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #8a6e22; opacity: .8; transition: opacity .8s ease; pointer-events: none; }
  `);

  /* ------------------------------------------------------------------ */
  /* infrastructure                                                       */
  /* ------------------------------------------------------------------ */

  /** Per-visit screen state: kept across re-renders of the same screen (wording edits, a client
   *  switch), started fresh each time the presenter arrives at the screen. Never saved per client. */
  const VS = {};
  function visit(ctx) {
    const pl = EFA.player || {};
    const tok = (pl.pres ? pl.pres.key : '') + ':' + pl.idx + ':' + ((pl.stack || []).length);
    let v = VS[ctx.id];
    if (!v || v.tok !== tok || !v.leftAt || Date.now() - v.leftAt > 160) v = VS[ctx.id] = { tok, s: {} };
    v.leftAt = 0;
    return v.s;
  }
  /** register a screen; marks the moment the presenter leaves it (see visit) */
  function screen(id, def) {
    const own = def.leave;
    def.leave = function (ctx) { if (VS[id]) VS[id].leftAt = Date.now(); if (own) own.call(this, ctx); };
    EFA.screen(id, def);
  }

  /** Per-client values shared across screens and presentations (the client's "case file").
   *  Namespace "case"; rates are fractions (0.06), money plain dollars, ages and years integers. */
  const CASE = 'case';
  const Case = {
    get(k, d) { const v = EFA.clients.get(CASE, k, d); return v == null || (typeof v === 'number' && !isFinite(v)) ? d : v; },
    set(k, v) { EFA.clients.set(CASE, k, v); }
  };

  /** Fields. cField: bound to a case key (several inputs may share one key). sField: per-visit screen
   *  state. Both use ctx.field for the look, parsing and limits. */
  function cField(ctx, o) {
    const key = o.key || o.id, v = Case.get(key, o.value);
    ctx.remember('f.' + o.id, v);
    (ctx._b15c = ctx._b15c || []).push({ id: o.id, key });
    return ctx.field(Object.assign({}, o, { value: v }));
  }
  function sField(ctx, vs, o) {
    const v = vs[o.id] != null ? vs[o.id] : o.value;
    vs[o.id] = v;
    ctx.remember('f.' + o.id, v);
    (ctx._b15s = ctx._b15s || []).push(o.id);
    return ctx.field(Object.assign({}, o, { value: v }));
  }
  /** keep stores in sync; call once per render, before the screen's own onFields handlers */
  function bindStores(ctx, vs) {
    const last = {};
    (ctx._b15c || []).forEach((c) => { last[c.id] = ctx.mem('f.' + c.id); });
    ctx.onFields((vals) => {
      const changedKeys = {};
      (ctx._b15c || []).forEach((c) => {
        const v = vals[c.id];
        if (isNum(v) && v !== last[c.id]) { changedKeys[c.key] = v; }
        last[c.id] = v;
      });
      Object.keys(changedKeys).forEach((key) => {
        Case.set(key, changedKeys[key]);
        (ctx._b15c || []).forEach((c) => { if (c.key === key && vals[c.id] !== changedKeys[key]) { ctx.setField(c.id, changedKeys[key]); vals[c.id] = changedKeys[key]; last[c.id] = changedKeys[key]; } });
      });
      if (vs) (ctx._b15s || []).forEach((id) => { vs[id] = vals[id]; });
    });
  }
  const fieldInput = (ctx, id) => ctx.$(`[data-field="${id}"] input`);
  /** make a field's label act as a link (opens a helper) instead of focusing the input */
  function labelLink(ctx, id, fn) {
    const lb = ctx.$(`[data-field="${id}"] > label`);
    if (!lb) return;
    lb.classList.add('b15-lk');
    lb.removeAttribute('for');
    ctx.on(lb, 'click', (e) => { e.preventDefault(); fn(); });
  }
  /** typed values above a cap are replaced by the cap while typing (rate fields cap at 12%) */
  function capWhileTyping(ctx, id, capPct) {
    const inp = fieldInput(ctx, id); if (!inp) return;
    inp.addEventListener('input', () => { const v = F.parse(inp.value); if (isFinite(v) && v > capPct) inp.value = String(capPct); });
  }

  /** A field the screen focuses by itself (upl1) must not trap the presenter: PageDown / PageUp (what
   *  presentation clickers send) always move the build on; arrows do too until the presenter types. */
  function clickerSafe(ctx, id) {
    const inp = fieldInput(ctx, id); if (!inp) return;
    let typed = false;
    inp.addEventListener('focus', () => { typed = false; });
    inp.addEventListener('input', () => { typed = true; });
    inp.addEventListener('keydown', (e) => {
      const fwd = e.key === 'PageDown' || (!typed && e.key === 'ArrowRight');
      const back = e.key === 'PageUp' || (!typed && e.key === 'ArrowLeft');
      if (!fwd && !back) return;
      e.preventDefault(); inp.blur();
      if (fwd) ctx.next(); else ctx.prev();
    });
  }

  /** keep numerals in DM Sans and wording editable after a partial redraw */
  function refresh(el) { if (!el) return; EFA.numify(el); if (EFA.edit && EFA.edit.on) EFA.edit.arm(el); }

  /** small modal that only closes with its button (no x, Escape ignored) */
  function okModal(ctx, html, okKey, onOk) {
    const m = document.createElement('div');
    m.className = 'b15-modal';
    m.innerHTML = `<div class="b15-modal-in"><div class="b15-modal-b">${html}</div><div class="b15-modal-f"><button type="button" class="st-pill b15-calc">${ctx.t(okKey)}</button></div></div>`;
    ctx.el.appendChild(m);
    const block = (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); } };
    document.addEventListener('keydown', block, true);
    const close = () => { m.remove(); document.removeEventListener('keydown', block, true); if (onOk) onOk(); };
    m.querySelector('button').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) close(); });
    m.close = close;
    refresh(m);
    return m;
  }

  /** one-item "Copy" context menu */
  function copyMenu(ctx, x, y, getText) {
    ctx.$$('.b15-menu').forEach((n) => n.remove());
    const m = document.createElement('div'); m.className = 'b15-menu';
    m.style.left = x + 'px'; m.style.top = y + 'px';
    m.innerHTML = `<button type="button">${ctx.t('copy')}</button>`;
    ctx.el.appendChild(m);
    const off = (e) => { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('pointerdown', off, true); } };
    document.addEventListener('pointerdown', off, true);
    m.querySelector('button').addEventListener('click', () => {
      const txt = getText();
      try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).catch(() => {}); } catch (e) { /* clipboard unavailable */ }
      ctx.toast(ctx.text('copied'));
      m.remove(); document.removeEventListener('pointerdown', off, true);
    });
  }
  /** stage coordinates (1600 x 900) of a pointer event */
  function stageXY(ctx, e) {
    const st = ctx.el.closest('.stage') || ctx.el; const r = st.getBoundingClientRect();
    return { x: (e.clientX - r.left) * 1600 / r.width, y: (e.clientY - r.top) * 900 / r.height };
  }

  /* ---------- shared components (EFA.lib, docs/components.md), guarded so a screen never breaks ---------- */
  const LIB = () => EFA.lib || {};
  /** Documentation worksheet. data: {heading, size, columns:[{field, header, type, dp}], rows, highlight, ...} */
  function openSheet(ctx, data) {
    const w = LIB().worksheet;
    if (!w) { ctx.toast(ctx.text('loadingWs')); return; }
    try { w.open(ctx, data); } catch (e) { console.error(e); }
  }
  /** the shared "Documentation" opener (wired by the component); data may be a function */
  const docButton = (ctx, data, o) => { const w = LIB().worksheet; return w ? w.button(ctx, Object.assign({ data }, o || {})) : ''; };
  /** our own opener that uses the component's (editable) word, for screens that first ask which worksheet */
  const docLink = (cls) => `<button type="button" class="b15-link b15-doclink ${cls || ''}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M4 9h16M4 14.5h16M10 9v11.5"/></svg>${EFA.cp('_lib_worksheet', 'open')}</button>`;
  /** columns for a worksheet from [field, copyKey, type, dp] */
  const sheetCols = (ctx, list) => list.map(([field, key, type, dp]) => ({ field, header: ctx.t(key), type: type || 'money', dp: dp != null ? dp : (type && type !== 'money' ? undefined : 2) }));
  /** return-rate notice: first focus of the field in a screen visit (one notice per visit) */
  function guardRate(ctx, id) { const d = LIB().disclosure; if (d) d.guard(ctx, id); }
  function discOnce(ctx, then) { const d = LIB().disclosure; if (d) d.once(ctx, 'rate', then); else if (then) then(); }
  /** compliance lines by topic, from the shared wording (hypothetical, guarantees, tax, loans, notAdvice) */
  const discLine = (topics, o) => { const d = LIB().disclosure; return d ? d.line(topics, o) : ''; };
  const discHtml = (topic) => { const d = LIB().disclosure; return d ? d.html(topic) : ''; };
  const infLink = (ctx, o) => { const i = LIB().inflation; return i ? i.link(ctx, o) : ''; };
  function infOpen(ctx, o) { const i = LIB().inflation; if (i) i.open(ctx, o); else ctx.toast(ctx.text('loadingTool')); }
  const leLink = (ctx, o) => { const l = LIB().lifeExpectancy; return l ? l.link(ctx, o) : ''; };
  function leOpen(ctx, o) { const l = LIB().lifeExpectancy; if (l) l.open(ctx, o); else ctx.toast(ctx.text('loadingTool')); }
  const dart = (size) => { const b = LIB().bullets; return b ? b.dart({ size: size || 30 }) : ''; };
  const COMMON = {
    loadingWs: 'The worksheet is still loading. Try again in a moment.',
    loadingTool: 'This tool is still loading. Try again in a moment.',
    copy: 'Copy', copied: 'Copied'
  };
  const withCommon = (copy) => Object.assign({}, COMMON, copy);

  /* chart helpers */
  function niceScale(lo, hi, ticks) {
    if (!(hi > lo)) hi = lo + 1;
    const raw = (hi - lo) / (ticks || 5), mag = Math.pow(10, Math.floor(Math.log10(raw))), nrm = raw / mag;
    const step = (nrm <= 1 ? 1 : nrm <= 2 ? 2 : nrm <= 2.5 ? 2.5 : nrm <= 5 ? 5 : 10) * mag;
    return { lo: Math.floor(lo / step + 1e-9) * step, hi: Math.ceil(hi / step - 1e-9) * step, step };
  }
  const axMoney = (v) => {
    const a = Math.abs(v), s = v < 0 ? '-' : '';
    if (a >= 1e6) return s + '$' + F.num(a / 1e6, a % 1e6 ? (a % 1e5 ? 2 : 1) : 0) + 'M';
    if (a >= 1e3) return s + '$' + F.num(a / 1e3, a % 1e3 ? 1 : 0) + 'K';
    return s + '$' + F.num(a, 0);
  };

  /* ------------------------------------------------------------------ */
  /* Question card (app-tls1): tls1, tls2, tls3, ig1                      */
  /* ------------------------------------------------------------------ */
  /** a gold question mark with banknote engraving, standing on a stack of coins */
  function qMarkArt() {
    const id = nid('q');
    const cx = 215, cy = 236, r = 126, sw = 86;
    const [x0, y0] = A.pt(cx, cy, r, -72), [x1, y1] = A.pt(cx, cy, r, 138);
    const f1 = (n) => n.toFixed(1);
    const d = `M${f1(x0)},${f1(y0)}A${r},${r} 0 1 1 ${f1(x1)},${f1(y1)}C${f1(x1 - 33)},${f1(y1 + 30)} 215,${f1(y1 + 22)} 215,${f1(y1 + 82)}L215,470`;
    const ext = [12, 10, 8, 6, 4, 2].map((k) => `<path d="${d}" transform="translate(${k} ${k})" fill="none" stroke="${P.goldDeep}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    const coin = (x, y, top) => {
      const rx = 68, ry = 21, t = 16;
      let s = `<path d="M${x - rx},${y}A${rx},${ry} 0 0 0 ${x + rx},${y}L${x + rx},${y + t}A${rx},${ry} 0 0 1 ${x - rx},${y + t}Z" fill="${P.goldDeep}"/>`;
      for (let k = -5; k <= 5; k++) {
        const xx = x + k * 11.6, yy = y + ry * Math.sqrt(Math.max(0, 1 - Math.pow((k * 11.6) / rx, 2)));
        s += `<path d="M${f1(xx)},${f1(yy + 2)}v${t - 5}" stroke="${P.gold}" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>`;
      }
      s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}c)" stroke="${P.goldDeep}" stroke-width="2"/>`;
      s += `<ellipse cx="${x}" cy="${y}" rx="${rx - 13}" ry="${ry - 5.5}" fill="none" stroke="${P.goldDeep}" stroke-width="1.6" opacity=".6"/>`;
      if (top) {
        let st = '';
        for (let i = 0; i < 10; i++) {
          const a = (i * 36 - 90) * Math.PI / 180, rr = i % 2 ? 9 : 22;
          st += `${i ? 'L' : 'M'}${f1(x + rr * Math.cos(a))},${f1(y + rr * Math.sin(a) * (ry / rx) * 1.4)}`;
        }
        s += `<path d="${st}Z" fill="${P.goldDeep}" opacity=".55"/>`;
      }
      return s;
    };
    return `<svg viewBox="0 0 430 720" aria-hidden="true"><defs>
        <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset=".5" stop-color="${P.gold}"/><stop offset="1" stop-color="#9c7f26"/></linearGradient>
        <linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldPale}"/><stop offset=".6" stop-color="${P.goldLt}"/><stop offset="1" stop-color="${P.gold}"/></linearGradient>
        <radialGradient id="${id}h" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${P.goldPale}" stop-opacity=".95"/><stop offset=".7" stop-color="${P.goldPale}" stop-opacity=".35"/><stop offset="1" stop-color="${P.goldPale}" stop-opacity="0"/></radialGradient>
        <pattern id="${id}p" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(34)"><path d="M0,6.5h13" stroke="${P.goldDeep}" stroke-width="1.3" opacity=".5"/></pattern>
        <pattern id="${id}w" width="40" height="18" patternUnits="userSpaceOnUse"><path d="M0,9 C10,1 20,1 20,9 S30,17 40,9" fill="none" stroke="${P.goldPale}" stroke-width="1.4" opacity=".75"/></pattern>
        <mask id="${id}m"><path d="${d}" fill="none" stroke="#fff" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></mask>
      </defs>
      <circle cx="225" cy="330" r="300" fill="url(#${id}h)"/>
      <ellipse cx="226" cy="684" rx="124" ry="16" fill="${P.shadow}"/>
      ${ext}
      <path d="${d}" fill="none" stroke="url(#${id}g)" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
      <g mask="url(#${id}m)">
        <rect x="0" y="0" width="430" height="560" fill="url(#${id}p)"/>
        <rect x="0" y="0" width="430" height="560" fill="url(#${id}w)" opacity=".7"/>
        <path d="${d}" transform="translate(-17 -15)" fill="none" stroke="${P.goldPale}" stroke-width="22" stroke-linecap="round" opacity=".55"/>
        <path d="${d}" fill="none" stroke="${P.navy}" stroke-width="2.6" stroke-dasharray="16 9" opacity=".32"/>
      </g>
      ${coin(219, 652)}${coin(211, 634)}${coin(217, 616)}${coin(214, 598, true)}
    </svg>`;
  }
  function questionCard(ctx) {
    ctx.el.innerHTML = `<div class="b15-q">
        <div class="b15-q-txt">${ctx.t('q', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule" style="width:120px;height:4px"></div>
        <div class="b15-q-art">${qMarkArt()}</div>
      </div>`;
  }
  const QCARDS = {
    tls1: { title: 'Question card: how much coverage', q: 'How much coverage do you really need?',
      notes: 'Every plan starts here. Before we talk about price or products, we need to know what your family would need.\n\n- Ask: If something happened to you tomorrow, how much would your family need, and for how long?\nPAUSE' },
    tls2: { title: 'Question card: what coverage costs', q: 'What does that coverage really cost?',
      notes: 'Now that we know how much, the next question is cost. Price is more than the premium; it is also what that premium could have done for you.\n\n- Ask: When you think about the cost of coverage, are you thinking about this year, or about every year you will own it?\nPAUSE' },
    tls3: { title: 'Question card: rate of return', q: 'What rate of return is your money really earning?',
      notes: 'Coverage and cost are two legs of the stool. The third is return: what your dollars earn while they sit inside your plan.\n\n- Ask: Do you know the rate your money is earning today, after costs and taxes?\nPAUSE' },
    ig1: { title: 'Income Game: typical or rare', q: 'Do you think your income is typical, or is it rare?',
      notes: 'Most people underestimate where they stand. This question sets up the reveal on the next screen.\n\n- Ask: Compared with every household in America, where do you think your income falls?\nPAUSE\n\n- Let the client commit to an answer before you move on.' }
  };
  Object.keys(QCARDS).forEach((id) => {
    const c = QCARDS[id];
    screen(id, { title: c.title, copy: { q: c.q, _notes: c.notes }, render(ctx) { questionCard(ctx); } });
  });

  /* ------------------------------------------------------------------ */
  /* Trading Cars                                                         */
  /* ------------------------------------------------------------------ */
  const goldGrad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a || P.goldLt}"/><stop offset="1" stop-color="${b || P.gold}"/></linearGradient>`;
  const navyGrad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a || P.navy4}"/><stop offset="1" stop-color="${b || P.navy2}"/></linearGradient>`;
  function head(ctx, key, cls) { return `<div class="b15-head">${ctx.t(key, { tag: 'h1', cls: 'st-h1 ' + (cls || '') })}<hr class="st-rule"></div>`; }

  /* tradecar1: the circle of wealth with the car-financing slices (app-fincars1 with the heading "Trading Cars") */
  screen('tradecar1', {
    title: 'Trading Cars: what a financed car takes from your circle',
    copy: {
      head: 'Trading Cars',
      whole: 'Your Circle\nof Wealth', opp: 'Opportunity\nCost', int: 'Interest', prin: 'Car Debt\nPrincipal',
      _notes: 'Every financed car takes three slices out of your circle: the principal, the interest, and what those dollars could have earned for you instead. Trade cars every few years and the slices keep coming back.\n\n- Ask: Most people see the payment. How many people ever see the opportunity cost?\nPAUSE'
    },
    render(ctx) {
      const cx = 600, cy = 524, r = 296;
      const ids = { n: nid('n'), a: nid('a'), b: nid('b'), c: nid('c') };
      const sl = [
        { k: 'opp', a0: 0, a1: 60, f: `url(#${ids.a})` },
        { k: 'int', a0: 60, a1: 120, f: `url(#${ids.b})` },
        { k: 'prin', a0: 120, a1: 180, f: `url(#${ids.c})` }
      ];
      const ex = 9;
      let paths = `<path d="${A.wedge(cx, cy, r, 180.6, 359.4)}" fill="url(#${ids.n})"/>`, labs = '';
      sl.forEach((s) => {
        const mid = (s.a0 + s.a1) / 2, dx = ex * Math.sin(mid * Math.PI / 180), dy = -ex * Math.cos(mid * Math.PI / 180);
        paths += `<path d="${A.wedge(cx + dx, cy + dy, r, s.a0 + 0.8, s.a1 - 0.8)}" fill="${s.f}"/>`;
        const [lx, ly] = A.pt(cx + dx, cy + dy, r * (s.k === 'int' ? 0.63 : 0.67), mid);
        labs += `<div class="b15-lab dark sm" style="left:${lx}px;top:${ly}px">${ctx.t(s.k)}</div>`;
      });
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <svg class="b15-full" viewBox="0 0 1600 900"><defs>
          ${goldGrad(ids.a, P.goldPale, P.goldLt)}${goldGrad(ids.b, P.goldLt, P.gold)}${goldGrad(ids.c, P.gold, P.goldDeep)}${navyGrad(ids.n, P.navy3, P.navy)}</defs>
          <circle cx="${cx}" cy="${cy + 10}" r="${r + 12}" fill="rgba(13,30,58,.07)"/>${paths}</svg>
        <div class="b15-lab" style="left:${cx - r * 0.5}px;top:${cy}px;font-size:28px">${ctx.t('whole')}</div>${labs}
        <div class="b15-med" style="left:1060px;top:330px;width:400px;height:400px"><div style="width:84%">${A.ill.car()}</div></div>`;
    }
  });

  /* tradecar2: car loan payment and interest (app-fincars2). The loan is kept in the client's case
     file (car_financed_amount / _interest_rate / _term_in_months) so tradecar3 can read it. */
  const carPmt = (P0, rate, n) => { const i = rate / 12; if (!(n > 0)) return 0; return i === 0 ? P0 / n : P0 * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1); };
  const carLoan = () => ({
    amt: Case.get('car_financed_amount', 30000),
    rate: Case.get('car_financed_interest_rate', 0.06),
    n: Math.max(1, Math.round(Case.get('car_financed_term_in_months', 60)))
  });
  screen('tradecar2', {
    title: 'Car loan payment and interest calculator',
    steps: 2,
    copy: {
      head: 'Is the Interest Working for You, or for the Lender?',
      lAmt: 'Amount Financed', lRate: 'Interest Rate', lN: 'Number of Payments',
      calc: 'Calculate', resHead: 'Here is what this loan asks of you',
      rPay: 'Monthly Payments', rTot: 'Total Amount Paid', rInt: 'Total Interest Paid',
      disc: 'Example for illustration only. Your actual loan terms, rate and payments will vary.',
      _notes: 'Put real numbers on the car you drive today, or the next one you plan to buy.\n\n- Enter the amount financed, the rate and the number of payments, then Calculate.\n- Ask: That interest goes to someone. Would you rather it worked for the lender, or for you?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head', 'sm')}
        <div class="b15-lc">
          <div class="b15-card b15-flow in"><div class="b15-form">
            ${cField(ctx, { id: 'car_financed_amount', label: 'lAmt', type: 'money', value: 30000, min: 0 })}
            ${cField(ctx, { id: 'car_financed_interest_rate', label: 'lRate', type: 'pct', value: 0.06, min: 0, max: 0.4, dp: 2 })}
            ${cField(ctx, { id: 'car_financed_term_in_months', label: 'lN', type: 'int', value: 60, min: 1, max: 600 })}
          </div></div>
          <button type="button" class="st-pill b15-calc b15-fade calc">${ctx.t('calc')}</button>
          <div class="b15-card b15-flow res b15-fade" style="margin-top:-80px">
            ${ctx.t('resHead', { tag: 'div', cls: 'b15-band' })}
            <div class="b15-rows" style="padding:6px 28px 14px">
              <div class="r"><span class="k">${ctx.t('rPay')}</span><span class="v num" data-o="pay"></span></div>
              <div class="r"><span class="k">${ctx.t('rTot')}</span><span class="v num" data-o="tot"></span></div>
              <div class="r hl"><span class="k">${ctx.t('rInt')}</span><span class="v num" data-o="int"></span></div>
            </div>
          </div>
        </div>
        ${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer b15-disc c' })}`;
      bindStores(ctx);
      ctx.onFields((v) => {
        const n = Math.max(1, Math.round(v.car_financed_term_in_months));
        const pay = carPmt(v.car_financed_amount, v.car_financed_interest_rate, n), tot = pay * n;
        ctx.$('[data-o="pay"]').textContent = m0(pay);
        ctx.$('[data-o="tot"]').textContent = m0(tot);
        ctx.$('[data-o="int"]').textContent = m0(tot - v.car_financed_amount);
      });
      ctx.on(ctx.$('.calc'), 'click', () => ctx.next());
    },
    step(ctx, n) {
      ctx.show('.calc', n === 0); ctx.show('.res', n === 1);
      ctx.$('.b15-lc').classList.toggle('lo', n === 0);
    }
  });

  /* tradecar3: a lifetime of financed cars, interest and the growth it gave up.
     Engine (tradecar3.md, Calculations); exposed as EFA.engines.tradeCars. */
  function tradeCars(p) {
    const Y = Math.max(1, Math.round(p.Y)), L = Math.max(0, Math.round(p.L)), life = Math.max(1, p.life);
    const term = Math.max(1, Math.round(p.term)), lr = p.loanRate, r = p.r;
    const N = Math.ceil(L / Y);
    const cars = [];
    for (let c = 1; c <= N; c++) {
      const prev = cars[c - 2];
      const year = c === 1 ? 1 : prev.year + Y;
      const cost = c === 1 ? p.P0 : p.P0 * Math.pow(1 + p.f, year - 1);
      /* straight-line depreciation; a car older than its useful life trades in at zero, never below */
      const trade = c === 1 ? 0 : Math.max(0, prev.cost * (life - Y) / life);
      const after = cost - trade, tax = after * p.tax;
      cars.push({ car: c, year, month: 12 * (year - 1) + 1, cost, trade, after, tax, adj: after + tax });
    }
    const M = N ? N * Y * 12 + Math.max(0, term - 12 * Y) : 0;
    const carAt = new Array(M + 2).fill(0), doneAt = new Array(M + 2).fill(0);
    if (M) carAt[1] = 1;
    let counter = 1;
    for (let i = 0; i < M; i++) {
      if ((i + 1) % (12 * Y) === 0 && counter <= N) {
        doneAt[i + 1] = counter; counter++;
        if (counter <= N) carAt[Math.min(i + 2, M)] = counter;
      }
    }
    const rows = [], cum = [0], cumO = [0];
    let prevEnd = 0, pay = 0, cumInt = 0, cumOC = 0;
    for (let m = 1; m <= M; m++) {
      const car = carAt[m], added = car ? cars[car - 1].adj : 0;
      const start = m === 1 ? added : added + prevEnd;
      if (car > 0) pay = carPmt(start, lr, term);
      const payment = start > 0.10 ? pay : 0;
      const interest = start * lr / 12, principal = payment - interest;
      const end = Math.max(0, start - principal);
      cumInt += interest;
      const oc = interest * Math.pow(1 + r / 12, M - m) - interest;
      cumOC += oc;
      const total = cumOC + cumInt;
      rows.push({ m, car, added, start, payment, interest, principal, end, cumInt, oc, cumOC, total });
      if (doneAt[m]) { cum[doneAt[m]] = total; cumO[doneAt[m]] = cumOC; }
      if (m === M) { cum[N] = total; cumO[N] = cumOC; }
      prevEnd = end;
    }
    const perCar = [];
    for (let c = 1; c <= N; c++) {
      perCar.push({ car: c, amount: (cum[c] || 0) - (cum[c - 1] || 0), cumulative: cum[c] || 0,
        oc: (cumO[c] || 0) - (cumO[c - 1] || 0), cumOC: cumO[c] || 0 });
    }
    return { N, Y, L, M, cars, rows, perCar, total: rows.length ? rows[rows.length - 1].total : 0 };
  }
  EFA.engines = EFA.engines || {};
  EFA.engines.tradeCars = tradeCars;

  screen('tradecar3', {
    title: 'Lifetime cost of trading financed cars',
    steps: 2,
    copy: withCommon({
      head: 'Why Car Makers Love to Finance Cars',
      intro: 'Let us look at the total interest on the financed cars still ahead of you, and at what that interest could have grown to if it had stayed with you.',
      lRor: 'Investment Return Rate', lYb: 'Years Between Trades', lYl: 'Car Buying Years Left', lInf: 'Inflation Rate', lTax: 'Sales Tax', lLife: 'Car Life in Years',
      calc: 'Calculate',
      s1a: 'You will pay for', s1b: 'cars over the next', s1c: 'years.',
      s2a: 'Had the interest on those loans been invested at', s2b: ', it could have grown to', s2c: '.',
      gCar: 'Car', gAmt: 'Interest at Opportunity Cost',
      modify: 'Modify Assumptions', doc: 'Documentation',
      chTitle: 'Choose a worksheet', ch1: 'Purchase Cost of Each Car', ch2: 'Monthly Balances and Payments', ch3: 'Opportunity Cost of Interest',
      w1: 'Purchase Cost of Each Car', w2: 'Monthly Balances and Payments', w3: 'Opportunity Cost of Interest by Car',
      cCar: 'Car #', cYear: 'Year', cMonth: 'Month', cNew: 'New Car Cost', cTrade: 'Trade In Value', cAfter: 'After Trade Cost', cTax: 'Sales Tax', cAdj: 'Adjusted Cost',
      cAdded: 'Adjusted Car Cost', cBom: 'Balance B.O.M.', cPay: 'Monthly Payment', cInt: 'Monthly Interest', cPrin: 'Monthly Principal', cEom: 'Balance E.O.M.',
      cCumInt: 'Cumulative Interest', cOc: 'Opportunity Cost of Interest', cCumOc: 'Cumulative Opportunity Cost', cTot: 'Interest + Opportunity Cost',
      cOcCar: 'Opportunity Cost of Car', cOcCum: 'Cumulative Opportunity Costs',
      disc: HYPO,
      _notes: 'Most families do not finance one car; they finance a lifetime of cars, and each trade rolls the old balance into the new loan.\n\n- Calculate, then read the total aloud and let it land.\nPAUSE\n\n- Ask: What could that money do for you if it stayed in your circle?'
    }),
    render(ctx) {
      const vs = visit(ctx);
      ctx.el.innerHTML = `${head(ctx, 'head', 'sm')}
        <div class="b15-tc3 s0 b15-fade">
          <div class="b15-card b15-flow intro">${ctx.t('intro', { tag: 'p' })}</div>
          <div class="b15-card b15-flow in"><div class="b15-form">
            ${cField(ctx, { id: 'case_file_ror_accumulation', label: 'lRor', type: 'pct', value: 0.06, min: 0, max: 0.12, dp: 2 })}
            ${sField(ctx, vs, { id: 'yb', label: 'lYb', type: 'int', value: 4, min: 1, max: 40 })}
            ${sField(ctx, vs, { id: 'yl', label: 'lYl', type: 'int', value: 20, min: 0, max: 80 })}
            ${cField(ctx, { id: 'case_file_ror_inflation', label: 'lInf', type: 'pct', value: 0.03, dp: 2 })}
            ${sField(ctx, vs, { id: 'tax', label: 'lTax', type: 'pct', value: 0.10, min: 0, max: 0.5, dp: 2 })}
            ${sField(ctx, vs, { id: 'life', label: 'lLife', type: 'int', value: 6, min: 1, max: 40 })}
          </div></div>
          <button type="button" class="st-pill b15-calc calc">${ctx.t('calc')}</button>
        </div>
        <div class="b15-tc3 s1 b15-fade">
          <div class="b15-card b15-flow res">
            <p class="sn">${ctx.t('s1a')} ${N('<b data-o="n"></b>')} ${ctx.t('s1b')} ${N('<b data-o="y"></b>')} ${ctx.t('s1c')}</p>
            <p class="sn">${ctx.t('s2a')} ${N('<b data-o="r"></b>')}${ctx.t('s2b')} ${N('<b data-o="t" class="gold"></b>')}${ctx.t('s2c')}</p>
            <div class="grid"><div class="gh">${ctx.t('gCar')}</div><div class="gh">${ctx.t('gAmt')}</div><div class="gb" data-o="grid"></div></div>
          </div>
          <div class="act"><button type="button" class="st-pill b15-calc mod">${ctx.t('modify')}</button>${docLink('doc')}</div>
        </div>
        ${discLine(['hypothetical'], { cls: 'b15-disc c' })}`;
      const inf = ctx.$('[data-field="case_file_ror_inflation"]');
      if (inf) {
        inf.classList.add('b15-hasico');
        inf.querySelector('label').insertAdjacentHTML('afterend', `<span class="b15-ico">${infLink(ctx, { field: 'case_file_ror_inflation' })}</span>`);
      }
      capWhileTyping(ctx, 'case_file_ror_accumulation', 12);
      guardRate(ctx, 'case_file_ror_accumulation');
      bindStores(ctx, vs);
      ctx.on(ctx.$('.calc'), 'click', () => ctx.next());
      ctx.on(ctx.$('.mod'), 'click', () => ctx.prev());
      ctx.on(ctx.$('.doc'), 'click', () => tc3Docs(ctx));
    },
    step(ctx, n) {
      if (n === 1) tc3Draw(ctx);
      ctx.show('.s0', n === 0); ctx.show('.s1', n === 1);
    }
  });
  function tc3Inputs(ctx) {
    const v = ctx.values(), loan = carLoan();
    return { Y: v.yb, L: v.yl, life: v.life, tax: v.tax, f: v.case_file_ror_inflation, P0: loan.amt, loanRate: loan.rate, term: loan.n, r: v.case_file_ror_accumulation };
  }
  function tc3Draw(ctx) {
    const p = tc3Inputs(ctx), R = tradeCars(p);
    ctx._tc3 = R;
    ctx.$('[data-o="n"]').textContent = F.int(R.N);
    ctx.$('[data-o="y"]').textContent = F.int(R.L);
    ctx.$('[data-o="r"]').textContent = F.pct(p.r, 2);
    ctx.$('[data-o="t"]').textContent = m0(R.total);
    ctx.$('[data-o="grid"]').innerHTML = R.perCar.map((c) => `<div class="c num">${c.car}</div><div class="a num">${c.amount === 0 ? '<span class="ul"></span>' : m0(c.amount)}</div>`).join('') +
      `<div class="c"></div><div class="a num tot"><span class="ul">${m0(R.total)}</span></div>`;
    refresh(ctx.el);
  }
  /** the documentation chooser, then the chosen worksheet (sizes as in the spec: medium, full, small) */
  function tc3Docs(ctx) {
    const R = ctx._tc3 || tradeCars(tc3Inputs(ctx));
    const ov = ctx.overlay({ title: ctx.t('chTitle'), html: `<div class="b15-choose">
        <button type="button" class="st-pill" data-w="1">${ctx.t('ch1')}</button>
        <button type="button" class="st-pill" data-w="2">${ctx.t('ch2')}</button>
        <button type="button" class="st-pill" data-w="3">${ctx.t('ch3')}</button></div>` });
    ov.querySelector('.st-overlay-in').style.width = '640px';
    ov.querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      const w = b.dataset.w; ov.close();
      if (w === '1') {
        openSheet(ctx, { heading: ctx.t('w1'), size: 'medium', filter: 'year',
          columns: sheetCols(ctx, [['car', 'cCar', 'int'], ['year', 'cYear', 'year'], ['month', 'cMonth', 'int'], ['cost', 'cNew'], ['trade', 'cTrade'], ['after', 'cAfter'], ['tax', 'cTax'], ['adj', 'cAdj']]),
          rows: R.cars.map((c) => ({ car: c.car, year: c.year, month: c.month, cost: c.cost, trade: c.trade, after: c.after, tax: c.tax, adj: c.adj })) });
      } else if (w === '2') {
        openSheet(ctx, { heading: ctx.t('w2'), size: 'full', filter: 'm',
          columns: sheetCols(ctx, [['m', 'cMonth', 'int'], ['car', 'cCar', 'int'], ['added', 'cAdded'], ['start', 'cBom'], ['payment', 'cPay'], ['interest', 'cInt'], ['principal', 'cPrin'], ['end', 'cEom'], ['cumInt', 'cCumInt'], ['oc', 'cOc'], ['cumOC', 'cCumOc'], ['total', 'cTot']]),
          rows: R.rows.map((r) => ({ m: r.m, car: r.car || '', added: r.car ? r.added : '', start: r.start, payment: r.payment, interest: r.interest, principal: r.principal, end: r.end, cumInt: r.cumInt, oc: r.oc, cumOC: r.cumOC, total: r.total })) });
      } else {
        openSheet(ctx, { heading: ctx.t('w3'), size: 'small', filter: false,
          columns: sheetCols(ctx, [['car', 'cCar', 'int'], ['oc', 'cOcCar'], ['cum', 'cOcCum']]),
          rows: R.perCar.map((c) => ({ car: c.car, oc: c.oc, cum: c.cumOC })) });
      }
    }));
  }
  EFA.css('b15-tc3', `
  .b15-tc3 { position: absolute; left: 50%; top: 172px; width: 1000px; transform: translateX(-50%); display: grid; justify-items: center; gap: 20px; }
  .b15-tc3 .intro { width: 980px; padding: 18px 34px; }
  .b15-tc3 .intro p { margin: 0; text-align: center; font: 700 24px/1.4 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-tc3 .in { width: 760px; padding: 4px 36px; }
  .stage .b15-tc3 .b15-form .st-field { padding: 7px 0; }
  .stage .b15-tc3 .b15-form .st-input { height: 46px; }
  .stage .b15-form .st-field.b15-hasico { grid-template-columns: auto 1fr 210px; }
  .b15-ico { width: 30px; height: 30px; border: 0; padding: 0; background: transparent; border-radius: 50%; display: grid; place-items: center; cursor: pointer; justify-self: start; }
  .b15-ico:hover { transform: scale(1.08); }
  .b15-tc3 .res { width: 1000px; padding: 22px 44px 18px; text-align: center; }
  .b15-tc3 .res .sn { margin: 0 0 12px; font: 700 26px/1.38 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-tc3 .res .sn b { font-weight: 700; }
  .b15-tc3 .res .gold { color: #8a6e22; }
  .b15-tc3 .grid { display: grid; grid-template-columns: 40% 60%; max-height: 392px; overflow: auto; margin: 4px auto 0; width: 760px; border-top: 2px solid #0d1e3a; overscroll-behavior: contain; }
  .b15-tc3 .grid .gh { font: 700 17px/1 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6e22; padding: 14px 0 10px; }
  .b15-tc3 .grid .gb { display: contents; }
  .b15-tc3 .grid .c, .b15-tc3 .grid .a { font: 700 24px/1.2 "DM Sans", sans-serif; color: #0d1e3a; padding: 4px 0; }
  .b15-tc3 .grid .a.tot { color: #8a6e22; font-size: 30px; padding-top: 10px; }
  .b15-tc3 .grid .ul { display: inline-block; min-width: 210px; border-bottom: 2.5px solid #0d1e3a; padding-bottom: 6px; }
  .b15-tc3 .grid .a.tot .ul { border-bottom: 0; border-top: 2.5px solid #0d1e3a; padding: 10px 0 0; }
  .b15-tc3 .act { display: flex; align-items: center; justify-content: center; gap: 80px; }
  `);

  /* ------------------------------------------------------------------ */
  /* Umbrella Insurance (umbins1)                                          */
  /* ------------------------------------------------------------------ */
  function umbrella(v) {
    const years = Math.max(0, v.end - v.begin);
    const fvAt = (V) => V * Math.pow(1 + v.rate, years);
    const pctOf = (prem, lim) => (lim > 0 ? prem / lim : null);
    const rows = []; let prev = 0;
    for (let m = 0; m < years; m++) {
      const add = m === 0 ? v.assets : 0, boy = prev + add, int = boy * v.rate, eoy = boy + int;
      rows.push({ age: v.begin + m, add, boy, int, eoy, year: m + 1 }); prev = eoy;
    }
    return { years, cost: fvAt(v.assets), curPct: pctOf(v.curPrem, v.curLim), altPct: pctOf(v.altPrem, v.altLim), rows };
  }
  EFA.engines.umbrella = umbrella;
  screen('umbins1', {
    title: 'Umbrella liability insurance and the cost of a claim',
    copy: withCommon({
      tCur: 'Current', tAlt: 'Alternative',
      rLim: 'Coverage Limits', rAssets: 'Value of Attachable Assets', rPrem: 'Annual Premium', rOc: 'Opportunity Cost %',
      foot: 'Premium as a % of Coverage', footCalc: 'Calculate', none: 'None',
      ageA: 'Measure what a claim could cost you from age', ageB: 'to age',
      calc: 'Calculate',
      r1: 'A single lawsuit could ultimately cost you',
      r2a: 'That is the', r2b: 'of exposed assets, plus the growth they could have earned at', r2c: 'for', r2d: 'years.',
      checklist: 'Checklist', doc: 'Documentation',
      ckTitle: 'Umbrella Insurance Checklist', ckLiab: 'Liability Coverage', ckProp: 'Personal Property',
      l1: 'Do your current policies cover you adequately?',
      l2: 'Does your current coverage qualify you for an umbrella policy?',
      l3: 'Do you already have an umbrella policy?',
      l4: 'If so, is that umbrella sufficient and cost-efficient?',
      l5: 'Do you have special exposures, such as a pool or guard dogs, that call for additional coverage?',
      l6: 'What recommendations have been made on your liability coverage?',
      p1: 'Does the amount of coverage fit the assets you own?',
      p2: 'Do you have replacement-cost protection?',
      p3: 'Do high-value items need scheduled riders (floaters)?',
      p4: 'Do you need coverage for disasters such as flood or earthquake?',
      p5: 'Are there endorsements that would pay losses at replacement cost?',
      p6: 'What recommendations have been made on your property coverage?',
      d1: 'These calculators illustrate general principles. They are not a solicitation or a recommendation; before acting on any of them, consult an appropriately licensed professional.',
      d2: 'This material is not tax or legal advice. Talk with your own tax and legal professionals about your situation.',
      d3: 'Projections are hypothetical, are not guaranteed, and depend on the information you supply.',
      wsTitle: 'Attachable Assets at Interest', cAge: 'Age', cAdd: 'Attachable Assets', cBoy: 'Assets at Interest B.O.Y.', cInt: 'Interest on Assets', cEoy: 'Assets at Interest E.O.Y.', cYear: 'Year',
      disc: HYPO,
      _notes: 'An umbrella policy is one of the least expensive protections you can own, and one of the most overlooked.\n\n- Compare the current and alternative coverage, then Calculate the cost of a claim.\n- Ask: If a lawsuit took what you have built, what would that cost your family over time?\nPAUSE\n\n- Open the Checklist to walk through liability and property coverage together.'
    }),
    render(ctx) {
      const vs = visit(ctx);
      const pair = (l, c, r) => `<div class="row"><div class="cell">${l}</div><div class="mid">${ctx.t(c)}</div><div class="cell">${r}</div></div>`;
      ctx.el.innerHTML = `<div class="b15-umb">
          <div class="tabs"><div class="tab">${ctx.t('tCur')}</div><div class="tab">${ctx.t('tAlt')}</div></div>
          <div class="b15-card b15-flow main">
            ${pair(cField(ctx, { id: 'cLim', key: 'umbrella_current_coverage_limits', type: 'money', value: 0, min: 0 }), 'rLim', cField(ctx, { id: 'aLim', key: 'umbrella_alt_coverage_limits', type: 'money', value: 1000000, min: 0 }))}
            ${pair(cField(ctx, { id: 'vL', key: 'umbrella_insured_value', type: 'money', value: 1000000, min: 0 }), 'rAssets', cField(ctx, { id: 'vR', key: 'umbrella_insured_value', type: 'money', value: 1000000, min: 0 }))}
            ${pair(cField(ctx, { id: 'cPrem', key: 'umbrella_current_premium', type: 'money', value: 0, min: 0 }), 'rPrem', cField(ctx, { id: 'aPrem', key: 'umbrella_alt_premium', type: 'money', value: 300, min: 0 }))}
            ${pair(cField(ctx, { id: 'ocL', key: 'case_file_ror_accumulation', type: 'pct', value: 0.06, min: 0, max: 0.12, dp: 2 }), 'rOc', cField(ctx, { id: 'ocR', key: 'case_file_ror_accumulation', type: 'pct', value: 0.06, min: 0, max: 0.12, dp: 2 }))}
            <div class="foot"><div class="fv" data-side="cur"><button type="button" class="st-pill fc">${ctx.t('footCalc')}</button><span class="pv num" data-o="cur"></span></div>
              <div class="mid">${ctx.t('foot')}</div>
              <div class="fv" data-side="alt"><button type="button" class="st-pill fc">${ctx.t('footCalc')}</button><span class="pv num" data-o="alt"></span></div></div>
          </div>
          <div class="ages">${ctx.t('ageA')} ${cField(ctx, { id: 'ab', key: 'umbrella_example_working_years_age_begin', type: 'int', value: 45, min: 0, max: 120 })} ${ctx.t('ageB')} ${cField(ctx, { id: 'ae', key: 'umbrella_example_working_years_age_end', type: 'int', value: 65, min: 0, max: 120 })}</div>
          <div class="out">
            <button type="button" class="st-pill b15-calc calc b15-fade">${ctx.t('calc')}</button>
            <div class="b15-card b15-flow res b15-fade"><p>${ctx.t('r1')} ${N('<b class="gold" data-o="cost"></b>')}</p>
              <p class="sm">${ctx.t('r2a')} ${N('<b data-o="v"></b>')} ${ctx.t('r2b')} ${N('<b data-o="r"></b>')} ${ctx.t('r2c')} ${N('<b data-o="n"></b>')} ${ctx.t('r2d')}</p></div>
          </div>
          <div class="links b15-fade"><button type="button" class="b15-link ck">${ctx.t('checklist')}</button>${docButton(ctx, () => umbSheet(ctx))}</div>
        </div>
        ${discLine(['hypothetical'], { cls: 'b15-disc c' })}`;
      ['ocL', 'ocR'].forEach((id) => { capWhileTyping(ctx, id, 12); guardRate(ctx, id); });
      bindStores(ctx, vs);
      const draw = (v) => {
        if (v.ab > v.ae) { ctx.setField('ae', v.ab); Case.set('umbrella_example_working_years_age_end', v.ab); v.ae = v.ab; }
        const R = umbrella({ assets: v.vL, rate: v.ocL, begin: v.ab, end: v.ae, curPrem: v.cPrem, curLim: v.cLim, altPrem: v.aPrem, altLim: v.aLim });
        ctx._umb = R;
        const pt = (x) => (x == null ? ctx.text('none') : F.pct(x, 2));
        ctx.$('[data-o="cur"]').textContent = pt(R.curPct);
        ctx.$('[data-o="alt"]').textContent = pt(R.altPct);
        ctx.$('[data-o="cost"]').textContent = m0(R.cost);
        ctx.$('[data-o="v"]').textContent = m0(v.vL);
        ctx.$('[data-o="r"]').textContent = F.pct(v.ocL, 2);
        ctx.$('[data-o="n"]').textContent = F.int(R.years);
        ['cur', 'alt'].forEach((s) => { const fv = ctx.$(`[data-side="${s}"]`); fv.classList.toggle('on', !!vs['shown_' + s]); });
        ctx.show('.calc', !vs.result); ctx.show('.res', !!vs.result); ctx.show('.links', !!vs.result);
        refresh(ctx.el);
      };
      ctx.onFields(draw);
      ctx.on(ctx.$$('.fc'), 'click', (e, b) => { vs['shown_' + b.parentNode.dataset.side] = true; draw(ctx.values()); });
      ctx.on(ctx.$('.calc'), 'click', () => { vs.result = true; draw(ctx.values()); });
      ctx.on(ctx.$('.ck'), 'click', () => umbChecklist(ctx));
    }
  });
  function umbSheet(ctx) {
    const R = ctx._umb || umbrella({ assets: 0, rate: 0, begin: 0, end: 0 });
    return { heading: ctx.t('wsTitle'), size: 'medium',
      columns: sheetCols(ctx, [['age', 'cAge', 'age'], ['add', 'cAdd'], ['boy', 'cBoy'], ['int', 'cInt'], ['eoy', 'cEoy'], ['year', 'cYear', 'year']]),
      rows: R.rows.map((r) => ({ age: r.age, add: r.add, boy: r.boy, int: r.int, eoy: r.eoy, year: r.year })) };
  }
  function umbChecklist(ctx) {
    const li = (keys) => `<ol>${keys.map((k) => `<li>${ctx.t(k)}</li>`).join('')}</ol>`;
    ctx.overlay({ title: ctx.t('ckTitle'), wide: true, html: `<div class="b15-check">
      <div class="cols"><div><h3>${ctx.t('ckLiab')}</h3>${li(['l1', 'l2', 'l3', 'l4', 'l5', 'l6'])}</div>
      <div><h3>${ctx.t('ckProp')}</h3>${li(['p1', 'p2', 'p3', 'p4', 'p5', 'p6'])}</div></div>
      <div class="fine">${ctx.t('d1', { tag: 'p' })}${ctx.t('d2', { tag: 'p' })}${ctx.t('d3', { tag: 'p' })}</div></div>` });
  }
  EFA.css('b15-umb', `
  .b15-umb { position: absolute; left: 160px; right: 160px; top: 52px; display: grid; justify-items: center; }
  .b15-umb .tabs { width: 100%; display: flex; justify-content: space-between; padding: 0 32px; box-sizing: border-box; }
  .b15-umb .tab { width: 300px; text-align: center; padding: 14px 0 12px; border-radius: 14px 14px 0 0; background: #0d1e3a; color: #f7f5f1; font: 600 32px/1 "Cormorant Garamond", Georgia, serif; letter-spacing: .02em; }
  .b15-umb .tab:last-child { background: #b8972e; color: #0d1e3a; }
  .b15-umb .main { width: 100%; padding: 14px 32px 0; }
  .b15-umb .row { display: grid; grid-template-columns: 300px 1fr 300px; align-items: center; gap: 24px; padding: 10px 0; border-bottom: 1px solid rgba(13,30,58,.10); }
  .b15-umb .mid { text-align: center; font: 700 24px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b15-umb .st-input { text-align: right; height: 54px; font-size: 24px; }
  .b15-umb .foot { display: grid; grid-template-columns: 300px 1fr 300px; align-items: center; gap: 24px; margin: 0 -32px; padding: 16px 32px; border-top: 2px solid #0d1e3a; background: #f7f5f1; border-radius: 0 0 16px 16px; }
  .b15-umb .foot .mid { font-size: 22px; color: #8a6e22; }
  .b15-umb .fv { display: grid; justify-items: end; align-items: center; min-height: 52px; }
  .b15-umb .fv > * { grid-area: 1 / 1; transition: opacity .6s ease; }
  .b15-umb .fv .pv { font: 700 34px/1 "DM Sans", sans-serif; color: #0d1e3a; opacity: 0; padding-right: 14px; }
  .b15-umb .fv.on .pv { opacity: 1; }
  .b15-umb .fv.on .fc { opacity: 0; pointer-events: none; }
  .b15-umb .fc { min-height: 46px; padding: 6px 22px; font-size: 17px; }
  .b15-umb .ages { margin-top: 26px; display: flex; align-items: center; gap: 16px; font: 700 28px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b15-umb .ages .st-field { display: inline-grid; width: 96px; }
  .stage .b15-umb .ages .st-input { text-align: center; padding: 0 6px; height: 52px; font-size: 26px; }
  .b15-umb .out { margin-top: 24px; display: grid; justify-items: center; width: 100%; }
  .b15-umb .out > * { grid-area: 1 / 1; }
  .b15-umb .calc { margin-top: 20px; align-self: start; justify-self: center; }
  .b15-umb .res { width: 1060px; padding: 20px 40px; text-align: center; min-height: 150px; display: grid; align-content: center; gap: 10px; }
  .b15-umb .res p { margin: 0; font: 700 30px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-umb .res p.sm { font-size: 23px; font-weight: 600; color: #3b4a63; }
  .b15-umb .res .gold { color: #8a6e22; font-size: 38px; }
  .b15-umb .links { margin-top: 22px; display: flex; gap: 120px; }
  `);

  /* ------------------------------------------------------------------ */
  /* Wealth and Income Potential (wip1, wip2)                              */
  /* ------------------------------------------------------------------ */
  /** wip1.md: whole year's income deposited at the start of the year */
  function wipPotential(v) {
    const n = Math.max(0, Math.round(v.ret - v.age));
    let income = v.inc, wealth = v.sav, ip = 0; const rows = [];
    for (let j = 1; j <= n; j++) {
      ip += income;
      const boy = income + wealth, int = boy * v.ror;
      wealth = boy + int;
      rows.push({ year: j, income, ip, boy, int, eoy: wealth, age: v.age + j });
      income = income * (1 + v.g);
    }
    return { n, income: Math.round(ip * 100) / 100, wealth: Math.round(wealth * 100) / 100, rows };
  }
  /** wip2.md: savings share grows; taxes, debt and lifestyle are tracked with their lost growth */
  function wipSpend(v) {
    const n = Math.max(0, Math.round(v.ret - v.age));
    let income = v.inc, bal = v.sav, ocT = 0, ocD = 0, ocL = 0, cT = 0, cD = 0, cL = 0; const rows = [];
    for (let k = 1; k <= n; k++) {
      const dep = income * v.sS, boy = bal + dep, gr = boy * v.ror, eoy = boy + gr;
      const t = income * v.sT, d = income * v.sD, l = income * v.sL;
      ocT = (ocT + t) * (1 + v.ror); ocD = (ocD + d) * (1 + v.ror); ocL = (ocL + l) * (1 + v.ror);
      cT += t; cD += d; cL += l;
      rows.push({ year: k, income, dep, boy, gr, eoy, t, cT, ocT, l, cL, ocL, d, cD, ocD, age: v.age + k, pts: { sav: Math.round(eoy), tax: -Math.round(ocT), debt: -Math.round(ocD), life: -Math.round(ocL) } });
      bal = eoy; income = income * (1 + v.g);
    }
    const last = rows[rows.length - 1];
    return { n, rows, saved: last ? Math.round(last.eoy) : Math.round(v.sav), spent: last ? Math.round(last.ocT + last.ocL + last.ocD) : 0 };
  }
  /** wip2.md rebalancing: the four shares always total 100 */
  function rebalance(sh, changed) {
    const s = Object.assign({}, sh);
    const c = (x) => Math.max(0, Math.min(1, x));
    s[changed] = c(s[changed]);
    const order = { sT: ['sS', 'sL', 'sD'], sL: ['sS', 'sD', 'sT'], sD: ['sS', 'sL', 'sT'], sS: ['sL', 'sD', 'sT'] }[changed];
    const others = (k) => ['sT', 'sD', 'sL', 'sS'].filter((x) => x !== k).reduce((a, x) => a + s[x], 0);
    for (let i = 0; i < order.length; i++) {
      const k = order[i];
      const v = 1 - (others(k));
      if (i === order.length - 1) { s[k] = Math.max(0, 1 - s[changed]); break; }
      if (v >= 0) { s[k] = v; break; }
      s[k] = 0;
    }
    Object.keys(s).forEach((k) => { s[k] = Math.round(s[k] * 1e6) / 1e6; });
    return s;
  }
  EFA.engines.wip = { potential: wipPotential, spend: wipSpend, rebalance };

  screen('wip1', {
    title: 'Wealth and income potential to retirement',
    steps: 2,
    copy: withCommon({
      head: 'Wealth and Income Potential',
      lAge: 'Current Age', lRet: 'Retirement Age', lInc: 'Current Income', lG: 'Income Growth', lSav: 'Current Savings', lRor: 'Investment Return',
      calc: 'Calculate', doc: 'Documentation',
      rA: 'By age', rB: ', you could earn', rC: 'over your working life: your income potential. Saved and invested, those same dollars could grow to', rD: ': your wealth potential.',
      cYear: 'Year', cInc: 'Annual Income', cIp: 'Cumulative Income Potential', cBoy: 'Wealth Potential B.O.Y.', cInt: 'Annual Interest Earned', cEoy: 'Wealth Potential E.O.Y.', cAge: 'Age at End of Year',
      disc: HYPO,
      _notes: 'Before we talk about where your money goes, look at how much will pass through your hands.\n\n- Calculate, then pause on the two numbers.\nPAUSE\n\n- Ask: Of everything you will earn, how much do you expect to keep?'
    }),
    render(ctx) {
      const vs = visit(ctx);
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="b15-wip">
          <div class="b15-card b15-flow in"><div class="b15-form">
            ${cField(ctx, { id: 'case_file_current_age', label: 'lAge', type: 'int', value: 42, min: 0, max: 100 })}
            ${cField(ctx, { id: 'case_file_retirement_age', label: 'lRet', type: 'int', value: 65, min: 0, max: 100 })}
            ${cField(ctx, { id: 'case_file_current_income', label: 'lInc', type: 'money', value: 102000, min: 0 })}
            ${cField(ctx, { id: 'case_file_ror_inflation', label: 'lG', type: 'pct', value: 0.03, max: 0.12, dp: 2 })}
            ${cField(ctx, { id: 'case_file_accumulated_savings', label: 'lSav', type: 'money', value: 88000, min: 0 })}
            ${cField(ctx, { id: 'case_file_ror_accumulation', label: 'lRor', type: 'pct', value: 0.06, min: 0, max: 0.12, dp: 2 })}
          </div></div>
          <div class="out"><button type="button" class="st-pill b15-calc calc b15-fade">${ctx.t('calc')}</button>
            <div class="b15-card b15-flow res b15-fade"><p>${ctx.t('rA')} ${N('<b data-o="r"></b>')}${ctx.t('rB')} ${N('<b data-o="ip"></b>')} ${ctx.t('rC')} ${N('<b class="gold" data-o="wp"></b>')}${ctx.t('rD')}</p></div></div>
          <div class="doc b15-fade">${docButton(ctx, () => wipSheet(ctx))}</div>
        </div>
        ${discLine(['hypothetical'], { cls: 'b15-disc c' })}`;
      capWhileTyping(ctx, 'case_file_ror_inflation', 12);
      capWhileTyping(ctx, 'case_file_ror_accumulation', 12);
      guardRate(ctx, 'case_file_ror_accumulation');
      bindStores(ctx, vs);
      ctx.onFields((v) => {
        const R = ctx._wip = wipPotential({ age: v.case_file_current_age, ret: v.case_file_retirement_age, inc: v.case_file_current_income, g: v.case_file_ror_inflation, sav: v.case_file_accumulated_savings, ror: v.case_file_ror_accumulation });
        ctx.$('[data-o="r"]').textContent = F.int(v.case_file_retirement_age);
        ctx.$('[data-o="ip"]').textContent = m0(R.income);
        ctx.$('[data-o="wp"]').textContent = m0(R.wealth);
        refresh(ctx.$('.res'));
      });
      ctx.on(ctx.$('.calc'), 'click', () => ctx.next());
    },
    step(ctx, n) { ctx.show('.calc', n === 0); ctx.show('.res', n === 1); ctx.show('.doc', n === 1); }
  });
  function wipSheet(ctx) {
    const R = ctx._wip || { rows: [] };
    return { heading: ctx.t('head'), size: 'full',
      columns: sheetCols(ctx, [['year', 'cYear', 'year'], ['income', 'cInc'], ['ip', 'cIp'], ['boy', 'cBoy'], ['int', 'cInt'], ['eoy', 'cEoy'], ['age', 'cAge', 'age']]),
      rows: R.rows.map((r) => ({ year: r.year, income: r.income, ip: r.ip, boy: r.boy, int: r.int, eoy: r.eoy, age: r.age })) };
  }
  EFA.css('b15-wip', `
  .b15-wip { position: absolute; left: 50%; top: 178px; width: 1040px; transform: translateX(-50%); display: grid; justify-items: center; gap: 22px; }
  .b15-wip .in { width: 700px; padding: 4px 36px; }
  .stage .b15-wip .b15-form .st-field { padding: 8px 0; }
  .b15-wip .out { display: grid; justify-items: center; width: 100%; }
  .b15-wip .out > * { grid-area: 1 / 1; }
  .b15-wip .res { width: 1040px; padding: 24px 46px; text-align: center; }
  .b15-wip .res p { margin: 0; font: 700 27px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-wip .res .gold { color: #8a6e22; }
  `);

  const WIP_COL = { sav: P.gold, tax: P.navy, debt: P.navy4, life: P.steel };
  screen('wip2', {
    title: 'Wealth potential vs. where the income goes',
    copy: withCommon({
      head: 'Wealth Potential vs. Expenditures',
      alloc: 'Income Allocation', lTax: 'Taxes', lDebt: 'Debt Services', lLife: 'Lifestyle', lSav: 'Savings',
      apply: 'Apply Changes',
      init: 'Initial Assumptions', lAge: 'Current Age', lRet: 'Retirement Age', lInc: 'Current Income', lG: 'Income Growth', lCsav: 'Current Savings', lRor: 'Rate of Return',
      gSav: 'Savings', gTax: 'Taxes', gDebt: 'Debt Svc', gLife: 'Lifestyle',
      tSav: 'Savings:', tSpent: 'Spent:', doc: 'Documentation',
      cYear: 'Year', cInc: 'Annual Earned Income', cDep: 'Savings Deposit B.O.Y.', cBoy: 'Savings Balance B.O.Y.', cGr: 'Annual Account Growth', cEoy: 'Savings Balance E.O.Y.',
      cT: 'Taxes Paid', cCT: 'Cumulative Taxes Paid', cOT: 'Taxes with Lost Opportunity Cost', cL: 'Lifestyle Consumption', cCL: 'Cumulative Lifestyle', cOL: 'Lifestyle with Lost Opportunity Cost',
      cD: 'Debt and Other Expenses', cCD: 'Cumulative Debt and Expenses', cOD: 'Debt and Expenses with Lost Opportunity Cost', cAge: 'Age at End of Year',
      disc: 'Lost opportunity cost shows what spent dollars could have grown to at the assumed rate of return. It is not a recommendation to avoid paying taxes.',
      _notes: 'Every dollar you earn goes one of four ways: taxes, debt, lifestyle or savings. Above the line is what you keep. Below the line is what the rest could have become.\n\n- Enter how the income is split today, then Apply Changes.\n- Ask: Which of these four would you most like to change?\nPAUSE'
    }),
    render(ctx) {
      const vs = visit(ctx);
      const sq = (k) => `<i class="sq" style="background:${WIP_COL[k]}"></i>`;
      ctx.el.innerHTML = `${head(ctx, 'head', 'sm')}
        <div class="b15-wip2">
          <div class="left">
            <div class="b15-card b15-flow">${ctx.t('alloc', { tag: 'div', cls: 'b15-band sm' })}<div class="b15-form tight shares" style="padding:4px 18px 8px">
              ${cField(ctx, { id: 'sT', key: 'wip_taxes_percent', label: 'lTax', type: 'pct', value: 0, min: 0, max: 1, dp: 1 })}
              ${cField(ctx, { id: 'sD', key: 'wip_expenses_percent', label: 'lDebt', type: 'pct', value: 0, min: 0, max: 1, dp: 1 })}
              ${cField(ctx, { id: 'sL', key: 'wip_lifestyle_percent', label: 'lLife', type: 'pct', value: 0, min: 0, max: 1, dp: 1 })}
              ${cField(ctx, { id: 'sS', key: 'wip_savings_percent', label: 'lSav', type: 'pct', value: 1, min: 0, max: 1, dp: 1 })}
            </div></div>
            <div class="apply"><button type="button" class="st-pill ap b15-fade">${ctx.t('apply')}</button></div>
            <div class="b15-card b15-flow">${ctx.t('init', { tag: 'div', cls: 'b15-band sm' })}<div class="b15-form tight" style="padding:4px 18px 8px">
              ${cField(ctx, { id: 'case_file_current_age', label: 'lAge', type: 'int', value: 42, min: 0, max: 100 })}
              ${cField(ctx, { id: 'case_file_retirement_age', label: 'lRet', type: 'int', value: 65, min: 0, max: 100 })}
              ${cField(ctx, { id: 'case_file_current_income', label: 'lInc', type: 'money', value: 102000, min: 0 })}
              ${cField(ctx, { id: 'case_file_ror_inflation', label: 'lG', type: 'pct', value: 0.03, max: 0.12, dp: 2 })}
              ${cField(ctx, { id: 'case_file_accumulated_savings', label: 'lCsav', type: 'money', value: 88000, min: 0 })}
              ${cField(ctx, { id: 'case_file_ror_accumulation', label: 'lRor', type: 'pct', value: 0.06, min: 0, max: 0.12, dp: 2 })}
            </div></div>
          </div>
          <div class="b15-card b15-flow chart"><div class="plot"></div>
            <div class="legend">${['sav', 'life', 'debt', 'tax'].map((k) => `<div class="lg">${sq(k)}${ctx.t({ sav: 'gSav', life: 'gLife', debt: 'gDebt', tax: 'gTax' }[k])}</div>`).join('')}</div>
            <div class="tip" hidden></div></div>
          <div class="totals"><span class="k">${ctx.t('tSav')}</span><span class="v sv num" data-o="saved"></span><span class="k">${ctx.t('tSpent')}</span><span class="v sp num" data-o="spent"></span>${docButton(ctx, () => wip2Sheet(ctx, vs))}</div>
        </div>
        <p class="st-disclaimer b15-disc" style="width:1240px">${ctx.t('disc')} ${discHtml('hypothetical')}</p>`;
      /* color keys beside the share labels */
      [['sT', 'tax'], ['sD', 'debt'], ['sL', 'life'], ['sS', 'sav']].forEach(([id, k]) => {
        const lb = ctx.$(`[data-field="${id}"] > label`); if (lb) lb.insertAdjacentHTML('afterend', sq(k));
      });
      ['case_file_ror_inflation', 'case_file_ror_accumulation'].forEach((id) => capWhileTyping(ctx, id, 12));
      guardRate(ctx, 'case_file_ror_accumulation');
      bindStores(ctx, vs);
      const read = () => {
        const v = ctx.values();
        return { age: v.case_file_current_age, ret: v.case_file_retirement_age, inc: v.case_file_current_income, g: v.case_file_ror_inflation, sav: v.case_file_accumulated_savings, ror: v.case_file_ror_accumulation, sT: v.sT, sD: v.sD, sL: v.sL, sS: v.sS };
      };
      const apply = () => { vs.applied = read(); vs.dirty = false; wip2Draw(ctx, vs); };
      if (!vs.applied) vs.applied = read();
      let first = true;
      ctx.onFields(() => { if (first) { first = false; wip2Draw(ctx, vs); return; } vs.dirty = true; ctx.show('.ap', true); });
      /* rebalance the four shares when one of them is committed */
      ['sT', 'sD', 'sL', 'sS'].forEach((id) => {
        const inp = fieldInput(ctx, id); if (!inp) return;
        inp.addEventListener('focusout', () => setTimeout(() => {
          const v = ctx.values();
          const s = rebalance({ sT: v.sT, sD: v.sD, sL: v.sL, sS: v.sS }, id);
          ['sT', 'sD', 'sL', 'sS'].forEach((k) => { if (s[k] !== v[k]) { ctx.setField(k, s[k]); Case.set({ sT: 'wip_taxes_percent', sD: 'wip_expenses_percent', sL: 'wip_lifestyle_percent', sS: 'wip_savings_percent' }[k], s[k]); } });
          vs.dirty = true; ctx.show('.ap', true);
        }, 0));
      });
      ctx.on(ctx.$('.ap'), 'click', apply);
      ctx.show('.ap', !!vs.dirty);
    }
  });
  /** uses the last applied calculation, as in the original */
  function wip2Sheet(ctx, vs) {
    const R = wipSpend(vs.applied);
    const cols = [['year', 'cYear', 'year'], ['income', 'cInc'], ['dep', 'cDep'], ['boy', 'cBoy'], ['gr', 'cGr'], ['eoy', 'cEoy'], ['t', 'cT'], ['cT', 'cCT'], ['ocT', 'cOT'], ['l', 'cL'], ['cL', 'cCL'], ['ocL', 'cOL'], ['d', 'cD'], ['cD', 'cCD'], ['ocD', 'cOD'], ['age', 'cAge', 'age']];
    return { heading: ctx.t('head'), size: 'full', columns: sheetCols(ctx, cols),
      rows: R.rows.map((r) => { const o = {}; cols.forEach(([f]) => { o[f] = r[f]; }); return o; }) };
  }
  function wip2Draw(ctx, vs) {
    const R = wipSpend(vs.applied);
    ctx.$('[data-o="saved"]').textContent = m0(R.saved);
    ctx.$('[data-o="spent"]').textContent = m0(R.spent);
    ctx.show('.ap', !!vs.dirty);
    const plot = ctx.$('.plot'), W = 1040, H = 600, pl = 118, pr = 16, pt = 22, pb = 46;
    const n = Math.max(1, R.n);
    const pos = R.rows.map((r) => r.pts.sav), neg = R.rows.map((r) => r.pts.tax + r.pts.debt + r.pts.life);
    const sc = niceScale(Math.min(0, ...neg), Math.max(1, ...pos), 6);
    const Y = (v) => pt + (H - pt - pb) * (sc.hi - v) / (sc.hi - sc.lo);
    const band = (W - pl - pr) / n, bw = band * 1.04;
    let g = '';
    for (let v = sc.lo; v <= sc.hi + 1e-6; v += sc.step) g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#d6cfc4" stroke-width="1"/><text x="${pl - 12}" y="${Y(v) + 6}" text-anchor="end" font-family="DM Sans, sans-serif" font-weight="700" font-size="17" fill="#3b4a63">${axMoney(Math.round(v))}</text>`;
    R.rows.forEach((r, i) => {
      const x = pl + i * band;
      if ((i + 1) % 5 === 0 || i === 0) g += `<line x1="${x + band / 2}" x2="${x + band / 2}" y1="${pt}" y2="${H - pb}" stroke="#e3e8f0" stroke-width="1"/><text x="${x + band / 2}" y="${H - pb + 30}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="18" fill="#3b4a63">${r.year}</text>`;
    });
    let bars = '';
    R.rows.forEach((r, i) => {
      const x = pl + i * band - (bw - band) / 2;
      const seg = (k, a, b) => { const y0 = Y(Math.max(a, b)), y1 = Y(Math.min(a, b)); return Math.abs(b - a) < 0.5 ? '' : `<rect class="b15-bar" data-i="${i}" data-k="${k}" x="${x.toFixed(2)}" y="${y0.toFixed(2)}" width="${bw.toFixed(2)}" height="${(y1 - y0).toFixed(2)}" fill="${WIP_COL[k]}"/>`; };
      bars += seg('sav', 0, r.pts.sav);
      let y = 0;
      [['tax', r.pts.tax], ['debt', r.pts.debt], ['life', r.pts.life]].forEach(([k, v]) => { bars += seg(k, y, y + v); y += v; });
    });
    g += bars + `<line x1="${pl}" x2="${W - pr}" y1="${Y(0)}" y2="${Y(0)}" stroke="#0d1e3a" stroke-width="2.5"/>`;
    plot.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${g}</svg>`;
    const tip = ctx.$('.tip'), card = ctx.$('.chart');
    const names = { sav: 'gSav', tax: 'gTax', debt: 'gDebt', life: 'gLife' };
    plot.querySelectorAll('.b15-bar').forEach((b) => {
      b.addEventListener('mousemove', (e) => {
        const r = R.rows[+b.dataset.i], k = b.dataset.k;
        const val = k === 'sav' ? r.eoy : k === 'tax' ? r.ocT : k === 'debt' ? r.ocD : r.ocL;
        tip.innerHTML = `${ctx.t(names[k])} <b class="num">${m2(Math.abs(val))}</b>`;
        const p = stageXY(ctx, e), cr = card.getBoundingClientRect(), sr = (ctx.el.closest('.stage') || ctx.el).getBoundingClientRect(), s = 1600 / sr.width;
        const cx = (cr.left - sr.left) * s, cy = (cr.top - sr.top) * s;
        tip.style.left = Math.min(p.x - cx + 16, 760) + 'px'; tip.style.top = (p.y - cy - 54) + 'px'; tip.hidden = false;
      });
      b.addEventListener('mouseleave', () => { tip.hidden = true; });
      b.addEventListener('click', () => { const lg = ctx.$('.legend'); lg.classList.toggle('is-off'); });
    });
    refresh(ctx.el);
  }
  EFA.css('b15-wip2', `
  .b15-wip2 { position: absolute; left: 66px; right: 66px; top: 136px; bottom: 74px; display: grid; grid-template-columns: 360px 1fr; grid-template-rows: 1fr auto; gap: 14px 26px; }
  .b15-wip2 .left { grid-row: 1 / span 2; display: grid; align-content: start; gap: 10px; }
  .b15-wip2 .sq { width: 18px; height: 18px; border-radius: 4px; display: inline-block; justify-self: end; }
  .stage .b15-wip2 .b15-form.shares .st-field { grid-template-columns: 1fr 22px 112px; gap: 12px; }
  .stage .b15-wip2 .b15-form.tight .st-field { grid-template-columns: 1fr 132px; }
  .stage .b15-wip2 .b15-form .st-field { padding: 5px 0; }
  .stage .b15-wip2 .b15-form .st-field > label, .stage .b15-wip2 .b15-form .st-field > .lb { font-size: 19px; }
  .stage .b15-wip2 .b15-form .st-input { height: 38px; font-size: 18px; }
  .stage .b15-wip2 .b15-band.sm { padding-top: 9px; padding-bottom: 9px; }
  .stage .b15-wip2 .b15-form.shares .st-field { grid-template-columns: 1fr 22px 112px; }
  .b15-wip2 .apply { display: flex; justify-content: flex-end; min-height: 44px; }
  .b15-wip2 .apply .st-pill { min-height: 42px; padding: 6px 20px; font-size: 16px; background: #b8972e; border-color: #b8972e; color: #0d1e3a; }
  .b15-wip2 .chart { position: relative; padding: 16px 18px 8px; display: grid; place-items: center; }
  .b15-wip2 .chart svg { display: block; }
  .b15-wip2 .b15-bar { cursor: pointer; }
  .b15-wip2 .b15-bar:hover { filter: brightness(1.12); }
  .b15-wip2 .legend { position: absolute; left: 150px; top: 30px; background: #fff; border: 1px solid #d6cfc4; border-radius: 10px; padding: 10px 16px; display: grid; gap: 8px; box-shadow: 0 6px 18px rgba(13,30,58,.08); transition: opacity .4s ease; }
  .b15-wip2 .legend .lg { display: flex; align-items: center; gap: 10px; font: 700 18px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-wip2 .tip { position: absolute; z-index: 3; padding: 9px 14px; border-radius: 9px; background: #0d1e3a; color: #f7f5f1; font: 600 17px/1.2 "DM Sans", sans-serif; white-space: nowrap; pointer-events: none; box-shadow: 0 8px 20px rgba(8,20,42,.25); }
  .b15-wip2 .tip b { color: #d5bd68; margin-left: 6px; }
  .b15-wip2 .totals { display: flex; align-items: baseline; justify-content: center; gap: 14px; }
  .b15-wip2 .totals .k { font: 700 24px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-wip2 .totals .v { font: 700 32px/1 "DM Sans", sans-serif; margin-right: 34px; }
  .b15-wip2 .totals .sv { color: #8a6e22; }
  .b15-wip2 .totals .sp { color: #2b4c80; }
  `);

  /* ------------------------------------------------------------------ */
  /* fwdisc1: closing disclosure page of the reverse mortgage presentations */
  /* (partner screen built generically: no lender names or logos)          */
  /* ------------------------------------------------------------------ */
  screen('fwdisc1', {
    title: 'Disclosure',
    copy: {
      head: 'Disclosure',
      p1: 'This presentation is for educational purposes only. It is not a commitment to lend, an offer of credit, or tax or legal advice.',
      p2: 'A reverse mortgage is a loan. You keep title to your home and must continue to live in it as your primary residence, pay property taxes and homeowners insurance, and keep the home in good repair. If these obligations are not met, the loan can become due.',
      p3: 'Interest and fees are added to the loan balance over time. As the balance grows, the equity left for you and your heirs goes down.',
      p4: 'The loan generally becomes due when the last borrower sells the home, moves out permanently or passes away. Your heirs may repay the loan or sell the home to satisfy it.',
      p5: 'Figures in this presentation are hypothetical illustrations. Actual loan amounts, rates, fees and terms depend on the borrowers\' ages, the value of the home, current interest rates, program limits and lender approval.',
      p6: 'Program requirements, including any counseling required before you apply, are explained by the lender. Talk with your own tax and legal professionals about how a reverse mortgage fits your situation.',
      p7: 'Lender licensing and contact disclosures are provided in the lender\'s own loan materials.',
      _notes: 'Close by giving the client time with the disclosure. Every home equity conversation ends with the rules in plain view.\n\n- Ask: Is there anything on this page you would like me to explain further?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="b15-card b15-fwd">${['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'].map((k, i) => ctx.t(k, { tag: 'p', cls: i === 0 ? 'lead' : '' })).join('')}</div>`;
      const pnl = ctx.$('.b15-fwd');
      pnl.addEventListener('keydown', (e) => e.stopPropagation());
    }
  });

  /* ------------------------------------------------------------------ */
  /* wb1: whiteboard with its own drawing layer (auto-enabled here)       */
  /* ------------------------------------------------------------------ */
  const WB_ICON = {
    pencil: '<path d="M4 20l1.2-5L16 4.2l3.8 3.8L9 18.8z"/><path d="M14 6.2l3.8 3.8"/>',
    arrow: '<path d="M5 19L19 5"/><path d="M10 5h9v9"/>',
    line: '<path d="M5 19L19 5"/>',
    ellipse: '<ellipse cx="12" cy="12" rx="8.5" ry="6"/>',
    fEllipse: '<ellipse cx="12" cy="12" rx="8.5" ry="6" fill="currentColor"/>',
    rect: '<rect x="3.5" y="6" width="17" height="12" rx="1.5"/>',
    fRect: '<rect x="3.5" y="6" width="17" height="12" rx="1.5" fill="currentColor"/>',
    eraser: '<path d="M9 20h11"/><path d="M3.8 14.6l9.4-9.4 6 6-8.6 8.6H8.9z"/><path d="M8.6 9.8l6 6"/>',
    undo: '<path d="M9 5L4 10l5 5"/><path d="M4 10h10a6 6 0 0 1 0 12h-3"/>',
    redo: '<path d="M15 5l5 5-5 5"/><path d="M20 10H10a6 6 0 0 0 0 12h3"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    play: '<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
    orient: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 3.5V8h-4.5"/>',
    clear: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'
  };
  const wbIcon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${WB_ICON[k]}</svg>`;
  function wbPaint(g, s) {
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = s.c; g.lineWidth = s.w;
    const fillIt = () => { if (s.fill) { g.fillStyle = s.fillC; g.fill(); } g.stroke(); };
    if (s.t === 'pencil') {
      if (s.pts.length < 2) { g.fillStyle = s.c; g.beginPath(); g.arc(s.pts[0].x, s.pts[0].y, s.w / 2, 0, Math.PI * 2); g.fill(); }
      else { g.beginPath(); s.pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.stroke(); }
    } else if (s.t === 'line' || s.t === 'arrow') {
      g.beginPath(); g.moveTo(s.x0, s.y0); g.lineTo(s.x1, s.y1); g.stroke();
      if (s.t === 'arrow') {
        const a = Math.atan2(s.y1 - s.y0, s.x1 - s.x0), L = Math.max(16, s.w * 3.6);
        g.beginPath(); g.moveTo(s.x1 - L * Math.cos(a - 0.45), s.y1 - L * Math.sin(a - 0.45)); g.lineTo(s.x1, s.y1); g.lineTo(s.x1 - L * Math.cos(a + 0.45), s.y1 - L * Math.sin(a + 0.45)); g.stroke();
      }
    } else if (s.t === 'rect') {
      g.beginPath(); g.rect(Math.min(s.x0, s.x1), Math.min(s.y0, s.y1), Math.abs(s.x1 - s.x0), Math.abs(s.y1 - s.y0)); fillIt();
    } else if (s.t === 'ellipse') {
      g.beginPath(); g.ellipse((s.x0 + s.x1) / 2, (s.y0 + s.y1) / 2, Math.max(0.5, Math.abs(s.x1 - s.x0) / 2), Math.max(0.5, Math.abs(s.y1 - s.y0) / 2), 0, 0, Math.PI * 2); fillIt();
    }
    g.restore();
  }
  function segDist(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L)) : 0;
    return Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
  }
  function wbHit(s, x, y) {
    const tol = s.w / 2 + 9;
    if (s.t === 'pencil') { if (s.pts.length < 2) return Math.hypot(x - s.pts[0].x, y - s.pts[0].y) < tol; for (let i = 1; i < s.pts.length; i++) if (segDist(x, y, s.pts[i - 1].x, s.pts[i - 1].y, s.pts[i].x, s.pts[i].y) < tol) return true; return false; }
    if (s.t === 'line' || s.t === 'arrow') return segDist(x, y, s.x0, s.y0, s.x1, s.y1) < tol;
    const l = Math.min(s.x0, s.x1), r = Math.max(s.x0, s.x1), t = Math.min(s.y0, s.y1), b = Math.max(s.y0, s.y1);
    if (s.t === 'rect') {
      if (s.fill && x >= l && x <= r && y >= t && y <= b) return true;
      return [[l, t, r, t], [r, t, r, b], [r, b, l, b], [l, b, l, t]].some(([a, c, d, e]) => segDist(x, y, a, c, d, e) < tol);
    }
    const cx = (l + r) / 2, cy = (t + b) / 2, rx = Math.max(1, (r - l) / 2), ry = Math.max(1, (b - t) / 2);
    const q = Math.hypot((x - cx) / rx, (y - cy) / ry);
    if (s.fill && q <= 1) return true;
    return Math.abs(q - 1) * Math.min(rx, ry) < tol;
  }
  screen('wb1', {
    title: 'Whiteboard',
    copy: {
      tWidth: 'Stroke Width', tColor: 'Stroke Color', tPencil: 'Pencil', tArrow: 'Arrow', tLine: 'Line', tEllipse: 'Ellipse', tFEllipse: 'Filled Ellipse',
      tRect: 'Rectangle', tFRect: 'Filled Rectangle', tEraser: 'Eraser', tUndo: 'Undo', tRedo: 'Redo', tPause: 'Pause', tOrient: 'Change Orientation', tClear: 'Clear',
      hint: 'Choose a tool and draw anywhere on the page',
      _notes: 'A blank page for working ideas out together. Pick a tool from the toolbar and sketch right on the screen.\n\n- Alt+A pauses the pen so clicks pass through; the drawing clears when you leave this page.\n- Ask: Can you sketch for me how money moves through your household today?\nPAUSE'
    },
    render(ctx) {
      const prefs = EFA.util.LS.get('efa.b15.wb', null) || { w: 5, c: '#b3402e' };
      const S = ctx._wb = { tool: 'pencil', w: prefs.w, c: prefs.c, fillC: P.navy, shapes: [], undo: [], redo: [], paused: false, vert: false, cur: null };
      const tools = [['pencil', 'tPencil'], ['arrow', 'tArrow'], ['line', 'tLine'], ['ellipse', 'tEllipse'], ['fEllipse', 'tFEllipse'], ['rect', 'tRect'], ['fRect', 'tFRect'], ['eraser', 'tEraser']];
      const tipKeys = ['tWidth', 'tColor'].concat(tools.map((t) => t[1]), ['tUndo', 'tRedo', 'tPause', 'tOrient', 'tClear']);
      ctx.el.innerHTML = `<canvas class="b15-wb-cv" width="3200" height="1800"></canvas>
        <div class="b15-wb-bar">
          <select class="b15-wb-sel" data-tip="tWidth" aria-label="Stroke width">${[1, 3, 5, 10, 15, 20].map((w) => `<option value="${w}" ${w === S.w ? 'selected' : ''}>${w}</option>`).join('')}</select>
          <label class="b15-wb-col" data-tip="tColor"><span class="sw" style="background:${S.c}"></span><input type="color" value="${S.c}" aria-label="Stroke color"></label>
          <span class="sep"></span>
          ${tools.map(([k, tk]) => `<button type="button" class="b15-wb-b" data-tool="${k}" data-tip="${tk}" aria-pressed="${k === S.tool}">${wbIcon(k)}</button>`).join('')}
          <span class="sep"></span>
          <button type="button" class="b15-wb-b" data-act="undo" data-tip="tUndo">${wbIcon('undo')}</button>
          <button type="button" class="b15-wb-b" data-act="redo" data-tip="tRedo">${wbIcon('redo')}</button>
          <span class="sep"></span>
          <button type="button" class="b15-wb-b" data-act="pause" data-tip="tPause" aria-pressed="false">${wbIcon('pause')}</button>
          <button type="button" class="b15-wb-b" data-act="orient" data-tip="tOrient">${wbIcon('orient')}</button>
          <button type="button" class="b15-wb-b" data-act="clear" data-tip="tClear">${wbIcon('clear')}</button>
        </div>
        <div class="b15-wb-tip" hidden></div>
        <div class="b15-wb-tips">${tipKeys.map((k) => ctx.t(k, { attrs: `data-tipk="${k}"` })).join('')}</div>
        <div class="b15-wb-hint">${ctx.t('hint')}</div>`;
      const cv = ctx.$('.b15-wb-cv'), g = cv.getContext('2d'); g.scale(2, 2);
      const bar = ctx.$('.b15-wb-bar'), tip = ctx.$('.b15-wb-tip');
      const redraw = () => { g.clearRect(0, 0, 1600, 900); S.shapes.forEach((s) => wbPaint(g, s)); if (S.cur) wbPaint(g, S.cur); };
      const savePrefs = () => EFA.util.LS.set('efa.b15.wb', { w: S.w, c: S.c });
      const pushUndo = (op) => { S.undo.push(op); S.redo = []; };
      const pt = (e) => stageXY(ctx, e);
      const hideHint = () => ctx.show('.b15-wb-hint', false);
      cv.addEventListener('pointerdown', (e) => {
        if (S.paused || (EFA.edit && EFA.edit.on) || e.button > 0) return;
        cv.setPointerCapture(e.pointerId); const p = pt(e); hideHint();
        if (S.tool === 'eraser') { S.erasing = []; eraseAt(p); return; }
        const base = { c: S.c, w: S.w, fillC: S.fillC };
        S.cur = S.tool === 'pencil' ? Object.assign(base, { t: 'pencil', pts: [p] })
          : Object.assign(base, { t: S.tool.replace(/^f/, '').toLowerCase(), fill: /^f/.test(S.tool), x0: p.x, y0: p.y, x1: p.x, y1: p.y });
        redraw();
      });
      cv.addEventListener('pointermove', (e) => {
        if (S.erasing) { eraseAt(pt(e)); return; }
        if (!S.cur) return; const p = pt(e);
        if (S.cur.t === 'pencil') S.cur.pts.push(p); else { S.cur.x1 = p.x; S.cur.y1 = p.y; }
        redraw();
      });
      const end = () => {
        if (S.erasing) { if (S.erasing.length) pushUndo({ t: 'del', items: S.erasing }); S.erasing = null; return; }
        if (!S.cur) return;
        const s = S.cur; S.cur = null;
        const tiny = s.t !== 'pencil' && Math.hypot(s.x1 - s.x0, s.y1 - s.y0) < 3;
        if (!tiny) { S.shapes.push(s); pushUndo({ t: 'add', s }); }
        redraw();
      };
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
      function eraseAt(p) {
        for (let i = S.shapes.length - 1; i >= 0; i--) {
          if (wbHit(S.shapes[i], p.x, p.y)) { S.erasing.push({ s: S.shapes[i], i }); S.shapes.splice(i, 1); }
        }
        redraw();
      }
      const setTool = (k) => { S.tool = k; ctx.$$('[data-tool]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.tool === k)); cv.classList.toggle('erase', k === 'eraser'); };
      const setPause = (on) => { S.paused = on; cv.classList.toggle('paused', on); const b = ctx.$('[data-act="pause"]'); b.setAttribute('aria-pressed', on); b.innerHTML = wbIcon(on ? 'play' : 'pause'); };
      ctx._wbPause = () => setPause(!S.paused);
      ctx.$$('[data-tool]').forEach((b) => b.addEventListener('click', () => setTool(b.dataset.tool)));
      ctx.$('[data-act="undo"]').addEventListener('click', () => {
        const op = S.undo.pop(); if (!op) return;
        if (op.t === 'add') S.shapes.splice(S.shapes.lastIndexOf(op.s), 1);
        else if (op.t === 'del') op.items.slice().reverse().forEach((it) => S.shapes.splice(Math.min(it.i, S.shapes.length), 0, it.s));
        else if (op.t === 'clear') S.shapes = op.items.slice();
        S.redo.push(op); redraw();
      });
      ctx.$('[data-act="redo"]').addEventListener('click', () => {
        const op = S.redo.pop(); if (!op) return;
        if (op.t === 'add') S.shapes.push(op.s);
        else if (op.t === 'del') op.items.forEach((it) => { const j = S.shapes.indexOf(it.s); if (j >= 0) S.shapes.splice(j, 1); });
        else if (op.t === 'clear') S.shapes = [];
        S.undo.push(op); redraw();
      });
      ctx.$('[data-act="pause"]').addEventListener('click', () => setPause(!S.paused));
      ctx.$('[data-act="orient"]').addEventListener('click', () => { S.vert = !S.vert; bar.classList.toggle('v', S.vert); tip.hidden = true; });
      ctx.$('[data-act="clear"]').addEventListener('click', () => { if (!S.shapes.length) return; S.undo.push({ t: 'clear', items: S.shapes.slice() }); S.redo = []; S.shapes = []; redraw(); });
      ctx.$('.b15-wb-sel').addEventListener('change', (e) => { S.w = +e.target.value; savePrefs(); });
      ctx.$('.b15-wb-sel').addEventListener('keydown', (e) => e.stopPropagation());
      const colIn = ctx.$('.b15-wb-col input');
      colIn.addEventListener('input', () => { S.c = colIn.value; ctx.$('.b15-wb-col .sw').style.background = S.c; savePrefs(); });
      /* tooltips: the wording comes from the (editable) tip labels */
      ctx.$$('[data-tip]').forEach((b) => {
        b.addEventListener('mouseenter', () => {
          const src = ctx.$(`[data-tipk="${b.dataset.tip}"]`); if (!src) return;
          tip.textContent = src.textContent;
          const br = b.getBoundingClientRect(), sr = (ctx.el.closest('.stage') || ctx.el).getBoundingClientRect(), sc = 1600 / sr.width;
          const x = (br.left + br.width / 2 - sr.left) * sc, y = (br.bottom - sr.top) * sc + 10;
          tip.style.left = Math.min(1530, Math.max(70, x)) + 'px'; tip.style.top = (S.vert ? (br.top - sr.top) * sc + 8 : y) + 'px';
          if (S.vert) { tip.style.left = ((br.left - sr.left) * sc - 12) + 'px'; tip.style.transform = 'translateX(-100%)'; } else tip.style.transform = '';
          tip.hidden = false;
        });
        b.addEventListener('mouseleave', () => { tip.hidden = true; });
      });
      const onKey = (e) => { if (e.altKey && (e.code === 'KeyA' || e.key === 'a' || e.key === 'A')) { e.preventDefault(); setPause(!S.paused); } };
      document.addEventListener('keydown', onKey);
      ctx._wbOff = () => { document.removeEventListener('keydown', onKey); savePrefs(); };
      redraw();
    },
    leave(ctx) { if (ctx._wbOff) ctx._wbOff(); }
  });
  EFA.css('b15-wb', `body.editing .b15-wb-tips { display: flex; flex-wrap: wrap; gap: 10px 16px; position: absolute; right: 22px; top: 92px; width: 760px; justify-content: flex-end; font: 600 14px/1 "DM Sans", sans-serif; color: #0d1e3a; }`);

  /* ------------------------------------------------------------------ */
  /* tvm1: time-value-of-money solver with a 10-key pad                   */
  /* ------------------------------------------------------------------ */
  const r2 = (x) => Math.round(x * 100) / 100;
  /** tvm1.md: FV = PV x (1+i)^n + PMT x (1 + i t) x fvifa; returns the solved value (rates as fractions) */
  function tvmRateSearch(v) {
    const n = v.n, t = v.t, PV = v.PV, PMT = v.PMT, FV = v.FV;
    if (!(n > 0)) return 0;
    const g = (j) => (j === 0 ? -PV - PMT * n + FV : -PV * Math.pow(1 + j, n) - PMT * (1 + j * t) * (Math.pow(1 + j, n) - 1) / j + FV);
    const attempt = (guess) => {
      let p = guess, m1 = g(p), q = m1 <= 0 ? 2 * p : p / 2, m2 = g(q);
      for (let k = 0; k < 100; k++) {
        if (m2 === m1) { p += q > p ? -0.00001 : 0.00001; m1 = g(p); if (m2 === m1) return null; }
        const next = q - (q - p) * m2 / (m2 - m1);
        if (!isFinite(next)) return null;
        const gn = g(next);
        if (Math.abs(gn) < 1e-7) return next;
        p = q; m1 = m2; q = next; m2 = gn;
      }
      return null;
    };
    for (let guess = 0.1; guess < 1 - 1e-9; guess = Math.round((guess + 0.1) * 10) / 10) {
      const j = attempt(guess);
      if (j != null && isFinite(j)) return j;
    }
    return 0;
  }
  function tvmSolve(v) {
    const m = v.m, t = v.t, n = v.n;
    const fvifa = (i) => (i === 0 ? n : (Math.pow(1 + i, n) - 1) / i);
    const i = v.rate / m;
    switch (v.solveFor) {
      case 'FV': return v.PV * Math.pow(1 + i, n) + v.PMT * (1 + i * t) * fvifa(i);
      case 'PV': { const p = Math.pow(1 + i, n); return p === 0 ? 0 : (v.FV - v.PMT * (1 + i * t) * fvifa(i)) / p; }
      case 'Pmt': { const den = (1 + i * t) * fvifa(i); return den === 0 ? 0 : (v.FV - v.PV * Math.pow(1 + i, n)) / den; }
      case 'Period': {
        if (i === 0 && v.PMT !== 0) return r2((v.FV - v.PV) / v.PMT);
        if (i <= 0) return 0;
        const x = (v.PMT * (1 + i * t) + v.FV * i) / (v.PV * i + v.PMT * (1 + i * t));
        if (!(x > 0) || !isFinite(x)) return 0;
        return r2(Math.log(x) / Math.log(1 + i));
      }
      case 'Rate': return r2(m * tvmRateSearch(v) * 100) / 100;
      default: return 0;
    }
  }
  function tvmSheet(v) {
    const j = v.rate / v.m, beg = v.t === 1, rows = [];
    const cB = beg && v.PMT > 0 ? v.PMT : 0, wB = beg && v.PMT <= 0 ? Math.abs(v.PMT) : 0;
    const cE = !beg && v.PMT > 0 ? v.PMT : 0, wE = !beg && v.PMT <= 0 ? Math.abs(v.PMT) : 0;
    let prev = v.PV, cc = 0, cw = 0, cg = 0;
    const count = Math.max(1, Math.ceil(v.n - 1e-9));
    for (let p = 1; p <= count && p <= 20000; p++) {
      const init = prev, bop = init + cB - wB, gr = bop * j, eop = bop + gr + cE - wE;
      cc += cB + cE; cw += wB + wE; cg += gr;
      rows.push({ p, init, cB, wB, bop, j, gr, cE, wE, eop, cc, cw, cg }); prev = eop;
    }
    return rows;
  }
  EFA.engines.tvm = { solve: tvmSolve, rate: tvmRateSearch, worksheet: tvmSheet };

  /** 10-key expression evaluator: + - lowest, * / higher, ^ highest (left to right), unary minus tightest */
  function evalExpr(src) {
    const s = String(src).replace(/\s+/g, ''); let i = 0;
    const fail = () => { throw new Error('bad expression'); };
    function primary() {
      if (s.startsWith('PI', i)) { i += 2; return Math.PI; }
      if (s[i] === 'E' && !/[0-9.]/.test(s[i - 1] || '')) { i += 1; return Math.E; }
      if (s[i] === '(') { i++; const v = expr(); if (s[i] !== ')') fail(); i++; return v; }
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i));
      if (!m) fail(); i += m[0].length; return parseFloat(m[0]);
    }
    function unary() { if (s[i] === '-') { i++; return -unary(); } if (s[i] === '+') { i++; return unary(); } return primary(); }
    function power() { let v = unary(); while (s[i] === '^') { i++; v = Math.pow(v, unary()); } return v; }
    function term() { let v = power(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const r = power(); v = op === '*' ? v * r : v / r; } return v; }
    function expr() { let v = term(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const r = term(); v = op === '+' ? v + r : v - r; } return v; }
    const v = expr(); if (i !== s.length || !isFinite(v)) fail(); return v;
  }
  EFA.engines.tvm.evaluate = evalExpr;
  const fmtEntry = (e) => {
    if (!e) return '0';
    const neg = e[0] === '-', body = neg ? e.slice(1) : e;
    const [a, b] = body.split('.');
    const ia = (a || '0').replace(/^0+(?=\d)/, '');
    return (neg ? '-' : '') + ia.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (b != null ? '.' + b : '');
  };
  const TVM_FREQ = [{ v: 1, key: 'cA' }, { v: 12, key: 'cM' }, { v: 52, key: 'cW' }, { v: 360, key: 'cD' }];
  const TVM_TIME = [{ v: 1, key: 'tB' }, { v: 0, key: 'tE' }];
  const TVM_FIELD = { PV: 'PV', Pmt: 'PMT', Period: 'period', Rate: 'rate', FV: 'FV' };
  function dropdown(ctx, id, opts, cur) {
    return `<div class="b15-dd" data-dd="${id}"><button type="button" class="b15-dd-b">${opts.map((o) => `<span class="o" data-v="${o.v}" ${o.v === cur ? '' : 'hidden'}>${ctx.t(o.key)}</span>`).join('')}<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="b15-dd-l" hidden>${opts.map((o) => `<button type="button" data-v="${o.v}">${ctx.t(o.key)}</button>`).join('')}</div></div>`;
  }
  function bindDropdown(ctx, id, onPick) {
    const dd = ctx.$(`[data-dd="${id}"]`); if (!dd) return;
    const list = dd.querySelector('.b15-dd-l');
    const close = (e) => { if (!dd.contains(e.target)) { list.hidden = true; document.removeEventListener('pointerdown', close, true); } };
    ctx.on(dd.querySelector('.b15-dd-b'), 'click', () => { list.hidden = !list.hidden; if (!list.hidden) document.addEventListener('pointerdown', close, true); });
    list.querySelectorAll('button').forEach((b) => ctx.on(b, 'click', () => {
      const v = +b.dataset.v; dd.querySelectorAll('.b15-dd-b .o').forEach((o) => { o.hidden = +o.dataset.v !== v; });
      list.hidden = true; document.removeEventListener('pointerdown', close, true); onPick(v);
    }));
  }
  screen('tvm1', {
    title: 'Time-value-of-money calculator',
    copy: withCommon({
      head: 'TVM+ Calculator', instr: 'Choose the value you want to solve for, then enter the values you know.',
      oPV: 'PV', oPmt: 'Pmt', oPer: 'Period', oRate: 'Rate', oFV: 'FV',
      lPV: 'Present Value', lPmt: 'Contribution/Withdrawal', lPer: 'Number of Periods', lRate: 'Annual Interest Rate', lFV: 'Future Value', lComp: 'Compound Interest', lTime: 'Payments Made at the',
      cA: 'Annually', cM: 'Monthly', cW: 'Weekly', cD: 'Daily', tB: 'Beginning', tE: 'End',
      head10: '10 Key Calculator', kC: 'C', kCE: 'CE', err: 'Calculation error',
      show10: 'Show 10 Key', hide10: 'Hide 10 Key', infl: 'Inflation History', le: 'Life Expectancy', doc: 'Documentation',
      ws: 'TVM Worksheet', wP: 'Period', wInit: 'Initial Value B.O.P.', wCB: 'Contribution B.O.P.', wWB: 'Withdrawal B.O.P.', wBop: 'Balance B.O.P.', wJ: 'Periodic Rate', wG: 'Growth',
      wCE: 'Contribution E.O.P.', wWE: 'Withdrawal E.O.P.', wEop: 'Balance E.O.P.', wCC: 'Cumulative Contributions', wCW: 'Cumulative Withdrawals', wCG: 'Cumulative Growth/Interest',
      disc: 'Calculations use the rates and amounts you enter. They are hypothetical, not a guarantee or a projection of any specific product.',
      _notes: 'A working calculator for any question about time and money: what a sum grows to, what it takes to get there, or how long it will last.\n\n- Pick the unknown, enter what you know, and the answer fills in.\n- Ask: What number would you most like to know today?\nPAUSE'
    }),
    render(ctx) {
      const vs = visit(ctx);
      if (!vs.init) Object.assign(vs, { init: true, solveFor: 'FV', PV: 0, PMT: 0, period: 0, rate: 0, FV: 0, m: 1, t: 1, ten: false, entry: '', hist: '' });
      ctx.remember('f.solveFor', vs.solveFor);
      const B = (k, key, ico) => `<button type="button" class="st-pill b15-tvm-side" data-side="${k}">${ico || ''}${ctx.t(key)}</button>`;
      const check = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const xIco = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
      const key = (k, label, cls) => `<button type="button" class="k ${cls || ''}" data-k="${esc(k)}">${label}</button>`;
      const back = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M9 6h11v12H9l-6-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9.5l5 5M17 9.5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      ctx.el.innerHTML = `
        <div class="b15-tvm-sides">${B('ten', 'show10', check).replace('</button>', '')}<span class="alt">${xIco}${ctx.t('hide10')}</span></button>
          ${infLink(ctx, { canUseResult: false, look: 'pill', cls: 'b15-tvm-lib' })}
          ${leLink(ctx, { canUseResult: false, look: 'pill', cls: 'b15-tvm-lib', age: () => Case.get('case_file_current_age', 42), spouseAge: () => Case.get('case_file_spouse_age', 40) })}</div>
        <div class="b15-tvm tvm b15-fade">
          ${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}
          ${ctx.t('instr', { tag: 'p', cls: 'instr' })}
          <div class="sel">${ctx.choice({ id: 'solveFor', options: [{ value: 'PV', key: 'oPV' }, { value: 'Pmt', key: 'oPmt' }, { value: 'Period', key: 'oPer' }, { value: 'Rate', key: 'oRate' }, { value: 'FV', key: 'oFV' }], value: vs.solveFor })}</div>
          <div class="b15-card b15-flow card"><div class="b15-form">
            ${sField(ctx, vs, { id: 'PV', label: 'lPV', type: 'money', value: 0, dp: 2 })}
            ${sField(ctx, vs, { id: 'PMT', label: 'lPmt', type: 'money', value: 0, dp: 2 })}
            ${sField(ctx, vs, { id: 'period', label: 'lPer', type: 'num', value: 0, min: 0, dp: 0 })}
            ${sField(ctx, vs, { id: 'rate', label: 'lRate', type: 'pct', value: 0, dp: 2 })}
            ${sField(ctx, vs, { id: 'FV', label: 'lFV', type: 'money', value: 0, dp: 2 })}
            <div class="st-field dd">${ctx.t('lComp', { tag: 'span', cls: 'lb' })}${dropdown(ctx, 'm', TVM_FREQ, vs.m)}</div>
            <div class="st-field dd">${ctx.t('lTime', { tag: 'span', cls: 'lb' })}${dropdown(ctx, 't', TVM_TIME, vs.t)}</div>
          </div></div>
          <div class="doc">${docButton(ctx, () => tvmDocs(ctx))}</div>
        </div>
        <div class="b15-tvm ten b15-fade">
          ${ctx.t('head10', { tag: 'h1', cls: 'st-h1' })}
          <div class="b15-card b15-flow pad">
            <div class="hist num"></div>
            <input class="st-input disp" readonly tabindex="-1" aria-label="Display">
            <div class="keys">
              <div class="kr">${key('7', '7')}${key('8', '8')}${key('9', '9')}<span class="gap"></span>${key('/', '&divide;', 'op')}${key('back', back, 'op')}${key('C', ctx.t('kC'), 'op')}</div>
              <div class="kr">${key('4', '4')}${key('5', '5')}${key('6', '6')}<span class="gap"></span>${key('*', '&times;', 'op')}${key('neg', '&plusmn;', 'op')}${key('CE', ctx.t('kCE'), 'op')}</div>
              <div class="kr">${key('1', '1')}${key('2', '2')}${key('3', '3')}<span class="gap"></span>${key('+', '+', 'op')}${key('-', '&minus;', 'op')}${key('^', '^', 'op')}</div>
              <div class="kr">${key('0', '0', 'w2')}${key('.', '.')}<span class="gap"></span>${key('=', '=', 'w3 eq')}</div>
            </div>
          </div>
        </div>
        ${discLine(['hypothetical'], { cls: 'b15-disc' })}`;
      bindStores(ctx, vs);
      /* solve on every edit */
      const solve = () => {
        const v = ctx.values();
        const per = vs.solveFor === 'Period' ? v.period : Math.max(0, Math.round(v.period));
        const inp = { solveFor: vs.solveFor, PV: r2(v.PV), PMT: r2(v.PMT), n: per, rate: v.rate, FV: r2(v.FV), m: vs.m, t: vs.t };
        let out;
        try { out = tvmSolve(inp); } catch (e) { out = NaN; }
        const fid = TVM_FIELD[vs.solveFor];
        if (isNum(out) && Math.abs(out) < 1e-9) out = 0; // floating-point dust never shows as "-$0.00"
        if (isNum(out)) { ctx.setField(fid, out); vs[fid] = out; inp[{ PV: 'PV', PMT: 'PMT', period: 'n', rate: 'rate', FV: 'FV' }[fid]] = out; }
        const f = ctx._fields.find((x) => x.id === 'period'); if (f) f.dp = vs.solveFor === 'Period' ? 2 : 0;
        const pinp = fieldInput(ctx, 'period'); if (pinp && document.activeElement !== pinp) { const pv = vs.solveFor === 'Period' ? (isNum(out) ? out : v.period) : per; pinp.value = F.num(pv, vs.solveFor === 'Period' ? 2 : 0); }
        ctx._tvm = inp;
        ctx.show('.doc', inp.n > 0);
        ctx.$$('.b15-tvm.tvm [data-field]').forEach((n) => {
          const solved = n.dataset.field === fid, i2 = n.querySelector('input');
          n.classList.toggle('solved', solved); if (i2) i2.readOnly = solved;
        });
      };
      ctx.onFields((vals) => { if (vals.solveFor && vals.solveFor !== vs.solveFor) vs.solveFor = vals.solveFor; solve(); });
      bindDropdown(ctx, 'm', (v) => { vs.m = v; solve(); });
      bindDropdown(ctx, 't', (v) => { vs.t = v; solve(); });
      /* right-click Copy */
      ['PV', 'PMT', 'period', 'rate', 'FV'].forEach((id) => {
        const inp = fieldInput(ctx, id); if (!inp) return;
        inp.addEventListener('contextmenu', (e) => { e.preventDefault(); const p = stageXY(ctx, e); copyMenu(ctx, p.x, p.y, () => inp.value); });
      });
      /* side buttons: the 10-key toggle (inflation and life expectancy openers are the shared ones, view only) */
      const tenOn = (on) => {
        vs.ten = on; ctx.show('.tvm', !on); ctx.show('.ten', on);
        const b = ctx.$('[data-side="ten"]'); b.classList.toggle('on', on);
        if (on) tenRefresh();
      };
      ctx.on(ctx.$('[data-side="ten"]'), 'click', () => tenOn(!vs.ten));
      /* 10-key */
      const disp = ctx.$('.disp'), hist = ctx.$('.hist');
      const tenRefresh = () => { if (vs.err) { disp.value = ctx.text('err'); } else disp.value = fmtEntry(vs.entry); hist.textContent = vs.hist.replace(/\*/g, '×').replace(/\//g, '÷'); };
      const press = (k) => {
        vs.err = false;
        if (/^[0-9]$/.test(k)) { if (k === '0' && vs.entry === '') return tenRefresh(); vs.entry += k; }
        else if (k === '.') { if (!vs.entry.includes('.')) vs.entry = (vs.entry === '' || vs.entry === '-' ? vs.entry + '0' : vs.entry) + '.'; }
        else if (['+', '-', '*', '/', '^'].includes(k)) { vs.hist += (vs.entry || '') + k; vs.entry = ''; }
        else if (k === 'back') vs.entry = vs.entry.slice(0, -1);
        else if (k === 'neg') vs.entry = vs.entry.startsWith('-') ? vs.entry.slice(1) : '-' + (vs.entry || '');
        else if (k === 'C' || k === 'CE') { vs.entry = ''; vs.hist = ''; }
        else if (k === '=') {
          try { const r = evalExpr(vs.hist + (vs.entry || '')); vs.entry = String(+r.toFixed(6)); if (/e/i.test(vs.entry)) vs.entry = r.toFixed(6).replace(/\.?0+$/, ''); vs.hist = ''; }
          catch (e) { vs.err = true; vs.entry = ''; vs.hist = ''; }
        }
        tenRefresh();
      };
      ctx.$$('.keys .k').forEach((b) => ctx.on(b, 'click', () => press(b.dataset.k)));
      disp.addEventListener('contextmenu', (e) => { e.preventDefault(); const p = stageXY(ctx, e); copyMenu(ctx, p.x, p.y, () => disp.value); });
      const KEYMAP = { Enter: '=', '=': '=', Backspace: 'back' };
      const keyOf = (e) => (/^[0-9.+\-*/^]$/.test(e.key) ? e.key : KEYMAP[e.key]);
      const down = (e) => {
        if (!vs.ten || (EFA.edit && EFA.edit.on) || e.ctrlKey || e.metaKey || e.altKey) return;
        const tg = e.target; if (tg && (tg.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) && !tg.classList.contains('disp'))) return;
        const k = keyOf(e); if (!k) return;
        e.preventDefault(); e.stopPropagation();
        if (e.repeat) return;
        const el = ctx.$(`.keys .k[data-k="${CSS.escape(k)}"]`); if (el) el.classList.add('down');
        press(k);
      };
      const up = (e) => { const k = keyOf(e); if (!k) return; const el = ctx.$(`.keys .k[data-k="${CSS.escape(k)}"]`); if (el) el.classList.remove('down'); };
      document.addEventListener('keydown', down, true); document.addEventListener('keyup', up, true);
      ctx._tvmOff = () => { document.removeEventListener('keydown', down, true); document.removeEventListener('keyup', up, true); };
      ctx.show('.tvm', !vs.ten); ctx.show('.ten', vs.ten); ctx.$('[data-side="ten"]').classList.toggle('on', vs.ten);
      tenRefresh();
    },
    leave(ctx) { if (ctx._tvmOff) ctx._tvmOff(); }
  });
  /** TVM Worksheet data: the solved value's column is highlighted */
  function tvmDocs(ctx) {
    const v = ctx._tvm || { PV: 0, PMT: 0, n: 0, rate: 0, FV: 0, m: 1, t: 1, solveFor: 'FV' };
    const rows = tvmSheet(v);
    const jdp = v.m === 1 ? 2 : v.m === 12 ? 4 : 5;
    const cols = [['p', 'wP', 'year'], ['init', 'wInit'], ['cB', 'wCB'], ['wB', 'wWB'], ['bop', 'wBop'], ['j', 'wJ', 'num', jdp], ['gr', 'wG'], ['cE', 'wCE'], ['wE', 'wWE'], ['eop', 'wEop'], ['cc', 'wCC'], ['cw', 'wCW'], ['cg', 'wCG']];
    const pmtCol = v.t === 1 ? (v.PMT > 0 ? 'cB' : 'wB') : (v.PMT > 0 ? 'cE' : 'wE');
    const hl = { PV: 'init', Pmt: pmtCol, Period: 'p', Rate: 'j', FV: 'eop' }[v.solveFor];
    return { heading: ctx.t('ws'), size: 'full', highlight: hl, filter: 'p', columns: sheetCols(ctx, cols),
      rows: rows.map((r) => { const o = {}; cols.forEach(([f]) => { o[f] = f === 'j' ? +r.j.toFixed(jdp) : r[f]; }); return o; }) };
  }
  EFA.css('b15-tvm', `
  .b15-tvm-sides { position: absolute; right: 64px; top: 116px; width: 250px; display: grid; gap: 70px; z-index: 2; }
  .b15-tvm-sides .st-pill { width: 100%; gap: 10px; min-height: 56px; font-size: 18px; box-shadow: 0 8px 18px rgba(13,30,58,.18); }
  .b15-tvm-sides .st-pill .alt { display: none; align-items: center; gap: 10px; }
  .b15-tvm-sides .st-pill.on > [data-cp], .b15-tvm-sides .st-pill.on > svg { display: none; }
  .b15-tvm-sides .st-pill.on .alt { display: inline-flex; }
  .b15-tvm-sides .st-pill.on { background: #b8972e; border-color: #b8972e; color: #0d1e3a; }
  .b15-tvm { position: absolute; left: 390px; width: 880px; top: 46px; display: grid; justify-items: center; }
  .b15-tvm .st-h1 { font-size: 58px; }
  .b15-tvm .instr { margin: 22px 0 0; font: 700 22px/1.3 "DM Sans", sans-serif; color: #3b4a63; text-align: center; }
  .b15-tvm .sel { margin-top: 20px; }
  .stage .b15-tvm .sel .st-seg-b { padding: 11px 26px; font-size: 19px; }
  .b15-tvm .card { width: 680px; margin-top: 24px; padding: 6px 34px; }
  .stage .b15-tvm .b15-form .st-field { grid-template-columns: 1fr 230px; padding: 9px 0; }
  .stage .b15-tvm .b15-form .st-field.solved .st-input { background: #f0e6c4; border-style: dashed; border-color: #b8972e; cursor: not-allowed; color: #8a6e22; }
  .stage .b15-tvm .b15-form .st-field.dd > .lb { font: 700 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; letter-spacing: .01em; text-transform: none; }
  .b15-tvm .doc { margin-top: 18px; }
  .b15-dd { position: relative; }
  .b15-dd-b { width: 100%; height: 50px; border: 1.5px solid #cbd5e3; border-radius: 10px; background: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 12px 0 14px; font: 600 20px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-dd-b:hover { border-color: #b8972e; }
  .b15-dd-l { position: absolute; right: 0; top: 54px; z-index: 5; width: 100%; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 10px; box-shadow: 0 14px 30px rgba(8,20,42,.2); padding: 6px; display: grid; }
  .b15-dd-l button { text-align: left; border: 0; background: transparent; padding: 10px 12px; border-radius: 7px; font: 600 19px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-dd-l button:hover { background: #f0e6c4; }
  .b15-tvm.ten { width: 920px; left: 340px; }
  .b15-tvm .pad { margin-top: 26px; padding: 30px 40px 26px; width: 760px; display: grid; justify-items: stretch; gap: 10px; }
  .b15-tvm .hist { min-height: 34px; text-align: right; font: 700 22px/34px "DM Sans", sans-serif; color: #667389; padding-right: 6px; overflow: hidden; white-space: nowrap; }
  .stage .b15-tvm .disp { height: 72px; text-align: right; font: 700 40px/1 "DM Sans", sans-serif; background: #f7f5f1; cursor: default; }
  .b15-tvm .keys { display: grid; gap: 14px; margin-top: 14px; justify-content: center; }
  .b15-tvm .kr { display: flex; gap: 16px; align-items: center; }
  .b15-tvm .kr .gap { width: 30px; }
  .b15-tvm .k { width: 86px; height: 86px; border-radius: 50%; border: 1px solid #d6cfc4; background: #fffdf8; color: #0d1e3a; font: 700 30px/1 "DM Sans", sans-serif; display: grid; place-items: center; padding: 0; box-shadow: 0 6px 14px rgba(13,30,58,.14); transition: transform .12s ease, background .15s ease, color .15s ease, box-shadow .15s ease; }
  .b15-tvm .k.op { background: #e3e8f0; font-size: 28px; }
  .b15-tvm .k.w2 { width: 188px; border-radius: 43px; }
  .b15-tvm .k.w3 { width: 290px; border-radius: 43px; }
  .b15-tvm .k.eq { background: #b8972e; border-color: #b8972e; }
  .b15-tvm .k:hover, .b15-tvm .k.down { transform: translateY(-2px); background: #0d1e3a; color: #fff; box-shadow: 0 10px 20px rgba(13,30,58,.22); }
  .b15-tvm .k.down { transform: translateY(1px); }
  `);

  /* ------------------------------------------------------------------ */
  /* tnm1: Time and Money (present, ideal and revised strategies)        */
  /* Engine per tnm1.md, exposed as EFA.engines.tnm.                     */
  /* ------------------------------------------------------------------ */
  const tz = (x) => (Math.abs(x) < 0.0049 ? 0 : x);
  /** c: {A0, LE, inc, S, B0, ra, rd, f, R}; o: {retireAge, save, lifestyle, ra, rd, delay, solving} */
  function tnmProject(c, o) {
    const K = Math.max(c.LE - c.A0 + 1, 1), rows = [];
    let prevEnd = 0;
    for (let k = 0; k < K; k++) {
      const age = c.A0 + k, start = k === 0 ? c.B0 : prevEnd;
      let contrib = 0, withdraw = 0;
      if (age < o.retireAge) contrib = k >= o.delay ? o.save * Math.pow(1 + c.f, k) : 0;
      else { const need = o.lifestyle * Math.pow(1 + c.f, k); withdraw = o.solving ? need : Math.min(start, need); }
      const begin = tz(start + contrib - withdraw);
      const growth = tz(begin * (age >= o.retireAge ? o.rd : o.ra));
      const end = tz(begin + growth);
      rows.push({ k, age, start, contrib, withdraw, begin, growth, end, year: k + 1 });
      prevEnd = end;
    }
    return rows;
  }
  /** first-year saving that brings the life-expectancy balance to zero (secant search) */
  function tnmSolve(c, o, prev) {
    const iLE = Math.max(c.LE - c.A0, 0), iR = Math.max(o.retireAge - c.A0, 0);
    const run = (x, solving) => tnmProject(c, Object.assign({}, o, { save: x, solving }));
    const endAt = (x) => { const r = run(x, true); return r[Math.min(iLE, r.length - 1)].end; };
    let x0 = 0, f0 = endAt(x0), x1 = c.S + 5001, f1 = endAt(x1), ok = false;
    for (let it = 0; it < 99; it++) {
      if ((f1 - f0) * f1 === 0) { ok = true; break; }
      const step = (x1 - x0) / (f1 - f0) * f1;
      if (!isFinite(step)) break;
      if (Math.abs(step) < 0.0049) { ok = true; break; }
      x0 = x1; f0 = f1; x1 = x1 - step; f1 = endAt(x1);
    }
    const solved = run(x1, true);
    const res = prev || {};
    if (ok) {
      res.x = x1;
      /* Ideal: the solved first-year saving; Revised: the first actual deposit, in then-dollars */
      res.saving = o.kind === 'revised' ? (solved[o.delay] ? solved[o.delay].contrib : 0) : x1;
      res.bal = iR > 0 ? (solved[Math.min(iR - 1, solved.length - 1)] || { end: 0 }).end : 0;
    }
    return { rows: run(x1, false), x: x1, saving: res.saving, bal: res.bal, ok };
  }
  function tnmRun(c, rv, keep) {
    keep = keep || {};
    const present = tnmProject(c, { retireAge: c.R, save: c.S, lifestyle: c.inc, ra: c.ra, rd: c.rd, delay: 0, solving: false });
    const iR = Math.max(c.R - c.A0, 0);
    const curBal = iR < present.length ? present[iR].begin + present[iR].withdraw : present[present.length - 1].end;
    const ideal = tnmSolve(c, { retireAge: c.R, lifestyle: c.inc, ra: c.ra, rd: c.rd, delay: 0 }, keep.ideal = keep.ideal || {});
    const revised = tnmSolve(c, { kind: 'revised', retireAge: rv.retireAt, lifestyle: rv.lifestyle, ra: c.ra, rd: c.rd, delay: rv.delay }, keep.revised = keep.revised || {});
    const fund = (L) => tnmSolve(c, { retireAge: c.A0 + 1, lifestyle: L, ra: c.rd, rd: c.rd, delay: 0 }, {}).rows;
    const fA = fund(c.inc), fR = rv.lifestyle === c.inc ? fA : fund(rv.lifestyle);
    const lumps = (rows, F2) => rows.map((r, k) => (k === 0 ? F2[0].begin + c.inc - r.start : F2[k].start - r.start));
    return {
      present: { rows: present, lump: lumps(present, fA) },
      ideal: { rows: ideal.rows, lump: lumps(ideal.rows, fA), saving: ideal.saving, bal: ideal.bal },
      revised: { rows: revised.rows, lump: lumps(revised.rows, fR), saving: revised.saving, bal: revised.bal },
      curSaving: c.S, curBal
    };
  }
  EFA.engines.tnm = { project: tnmProject, solve: tnmSolve, run: tnmRun };

  screen('tnm1', {
    title: 'Time and Money: present, ideal and revised strategies',
    copy: withCommon({
      head: 'Time and Money',
      pres: 'Present Assumptions', lAge: 'Current Age', lInc: 'Current Income', lSave: 'Annual Saving', lAcc: 'Accumulated $', lRa: 'Accumulation', lRd: 'Distribution', lInf: 'Inflation Rate', lRet: 'Retirement Age', lLe: 'Life Expectancy',
      calc: 'Calculate',
      rev: 'Revised Assumptions', rvDelayA: 'Delay Saving for', rvDelayB: 'Years', rvRetire: 'Retire at Age', rvLife: 'Retirement Lifestyle',
      ph: 'What does your retirement strategy look like over time?', phSub: 'Enter your present assumptions, then Calculate to see three strategies side by side.',
      sIdeal: 'Ideal', sPresent: 'Present', sRevised: 'Revised',
      sumCS: 'Current Saving @', sumIS: 'Ideal Saving @', sumRS: 'Revised Saving @', sumCB: 'Current Balance @', sumIB: 'Ideal Balance @', sumRB: 'Revised Balance @',
      tipStrategy: 'Strategy', tipAge: 'Age', tipC: 'Contribution', tipW: 'Withdrawal', tipB: 'Balance E.O.Y.', tipI: 'Ideal E.O.Y.', tipD: 'Difference', tipL: 'Lump Sum Requirement',
      doc: 'Documentation', chTitle: 'Choose a strategy', chIdeal: 'Ideal Strategy', chPresent: 'Present Strategy', chRevised: 'Revised Strategy',
      wsTail: 'Projection Worksheet', cAge: 'Age', cInit: 'Initial Value', cC: 'Contribution', cW: 'Withdrawal', cBoy: 'Balance B.O.Y.', cG: 'Annual Growth', cEoy: 'Balance E.O.Y.', cL: 'Lump Sum Requirement', cY: 'Years',
      disc: 'Rates of return, inflation and income needs are assumptions.',
      _notes: 'Time is the one input you cannot buy back. This screen shows what today\'s saving produces, what it would take to fund the life you want, and what changes when you move the levers.\n\n- Calculate, then use the sliders: delay saving, retire later, or adjust the lifestyle.\n- Ask: Which of these three levers feels most within your control?\nPAUSE'
    }),
    render(ctx) {
      const vs = visit(ctx);
      ctx.el.innerHTML = `<div class="b15-tnm">
          <div class="b15-head" style="top:34px"><h1 class="st-h1" style="font-size:54px">${ctx.t('head')}</h1></div>
          ${docLink('doc')}
          <div class="left">
            <div class="b15-card b15-flow">${ctx.t('pres', { tag: 'div', cls: 'b15-band sm' })}<div class="b15-form tight" style="padding:2px 16px 6px">
              ${cField(ctx, { id: 'case_file_current_age', label: 'lAge', type: 'int', value: 42, min: 1, max: 110 })}
              ${cField(ctx, { id: 'case_file_current_income', label: 'lInc', type: 'money', value: 102000, min: 0 })}
              ${cField(ctx, { id: 'case_file_annual_savings', label: 'lSave', type: 'money', value: 6000, min: 0 })}
              ${cField(ctx, { id: 'case_file_accumulated_savings', label: 'lAcc', type: 'money', value: 88000, min: 0 })}
              ${cField(ctx, { id: 'case_file_ror_accumulation', label: 'lRa', type: 'pct', value: 0.06, min: 0, max: 0.12, dp: 2 })}
              ${cField(ctx, { id: 'case_file_ror_distribution', label: 'lRd', type: 'pct', value: 0.05, min: 0, max: 0.12, dp: 2 })}
              ${cField(ctx, { id: 'case_file_ror_inflation', label: 'lInf', type: 'pct', value: 0.03, dp: 2 })}
              ${cField(ctx, { id: 'case_file_retirement_age', label: 'lRet', type: 'int', value: 65, min: 1, max: 120 })}
              ${cField(ctx, { id: 'case_file_life_expectancy', label: 'lLe', type: 'int', value: 84, min: 1, max: 120 })}
            </div></div>
            <button type="button" class="st-pill b15-calc calc">${ctx.t('calc')}</button>
            <div class="b15-card b15-flow rv">${ctx.t('rev', { tag: 'div', cls: 'b15-band sm' })}
              <div class="blk"><div class="ln">${ctx.t('rvDelayA')} <input class="mini num" data-rv="delay" inputmode="numeric"> ${ctx.t('rvDelayB')}</div><input type="range" data-rs="delay" step="1"></div>
              <div class="blk"><div class="ln">${ctx.t('rvRetire')} <input class="mini num" data-rv="retireAt" inputmode="numeric"></div><input type="range" data-rs="retireAt" step="1"></div>
              <div class="blk"><div class="ln">${ctx.t('rvLife')} <input class="mini wide num" data-rv="lifestyle" inputmode="decimal"></div><input type="range" data-rs="lifestyle" step="1000"></div>
            </div>
          </div>
          <div class="b15-card b15-flow chart">
            <div class="ph">${ctx.t('ph', { tag: 'p', cls: 'q' })}${ctx.t('phSub', { tag: 'p', cls: 's' })}</div>
            <div class="plot"></div>
            <div class="legend"><span class="lg"><i class="sw ideal"></i>${ctx.t('sIdeal')}</span><span class="lg"><i class="sw ln pres"></i>${ctx.t('sPresent')}</span><span class="lg"><i class="sw ln rev"></i>${ctx.t('sRevised')}</span></div>
            <div class="sum">
              <span class="k">${ctx.t('sumCS')} ${N('<b data-a="cs"></b>')}</span><span class="v num" data-o="cs"></span>
              <span class="k ideal">${ctx.t('sumIS')} ${N('<b data-a="is"></b>')}</span><span class="v num" data-o="is"></span>
              <span class="k rev">${ctx.t('sumRS')} ${N('<b data-a="rs"></b>')}</span><span class="v num" data-o="rs"></span>
              <span class="k">${ctx.t('sumCB')} ${N('<b data-a="cb"></b>')}</span><span class="v num" data-o="cb"></span>
              <span class="k ideal">${ctx.t('sumIB')} ${N('<b data-a="ib"></b>')}</span><span class="v num" data-o="ib"></span>
              <span class="k rev">${ctx.t('sumRB')} ${N('<b data-a="rb"></b>')}</span><span class="v num" data-o="rb"></span>
            </div>
            <div class="tip" hidden></div>
          </div>
        </div>
        <p class="st-disclaimer b15-disc" style="left:58px;bottom:16px;width:1180px">${discHtml('hypothetical')} ${ctx.t('disc')}</p>`;
      ctx.$('.doc').disabled = !vs.calc;
      ['case_file_ror_accumulation', 'case_file_ror_distribution'].forEach((id) => { capWhileTyping(ctx, id, 12); guardRate(ctx, id); });
      labelLink(ctx, 'case_file_ror_inflation', () => infOpen(ctx, { field: 'case_file_ror_inflation' }));
      labelLink(ctx, 'case_file_life_expectancy', () => leOpen(ctx, { field: 'case_file_life_expectancy', age: () => ctx.values().case_file_current_age, spouseAge: () => Case.get('case_file_spouse_age', 40) }));
      bindStores(ctx, vs);
      const redraw = () => tnmDraw(ctx, vs);
      const soon = EFA.util.debounce(redraw, 500);
      ctx._tnmSoon = soon;
      ctx.onFields(() => { if (vs.calc) redraw(); });
      ctx.on(ctx.$('.calc'), 'click', () => {
        const c = tnmCase(ctx);
        vs.calc = true; vs.rv = { delay: 0, retireAt: c.R, lifestyle: c.inc };
        ctx.$('.doc').disabled = false; redraw();
      });
      /* revised levers: sliders move live, inline inputs commit on blur; both recalc after 500 ms */
      ['delay', 'retireAt', 'lifestyle'].forEach((k) => {
        const sl = ctx.$(`[data-rs="${k}"]`), inp = ctx.$(`[data-rv="${k}"]`);
        sl.addEventListener('input', () => { vs.rv[k] = +sl.value; inp.value = k === 'lifestyle' ? m0(vs.rv[k]) : String(vs.rv[k]); soon(); });
        sl.addEventListener('keydown', (e) => e.stopPropagation());
        inp.addEventListener('focus', () => { inp.value = String(vs.rv[k]); inp.select(); });
        inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
        inp.addEventListener('blur', () => {
          let v = F.parse(inp.value); if (!isFinite(v)) v = vs.rv[k];
          v = Math.max(+sl.min, Math.min(k === 'lifestyle' ? Infinity : +sl.max, Math.round(v)));
          vs.rv[k] = v; tnmLevers(ctx, vs); soon();
        });
      });
      ctx.on(ctx.$('.doc'), 'click', () => tnmDocs(ctx, vs));
      const winRe = () => { if (vs.calc) redraw(); };
      window.addEventListener('resize', winRe);
      ctx._tnmOff = () => window.removeEventListener('resize', winRe);
      tnmShow(ctx, vs);
      if (vs.calc) ctx.timeout(redraw, 0);
    },
    leave(ctx) { if (ctx._tnmOff) ctx._tnmOff(); }
  });
  function tnmCase(ctx) {
    const v = ctx.values();
    return { A0: Math.round(v.case_file_current_age), LE: Math.round(v.case_file_life_expectancy), inc: v.case_file_current_income, S: v.case_file_annual_savings, B0: v.case_file_accumulated_savings,
      ra: v.case_file_ror_accumulation, rd: v.case_file_ror_distribution, f: v.case_file_ror_inflation, R: Math.round(v.case_file_retirement_age) };
  }
  function tnmShow(ctx, vs) {
    ctx.show('.calc', !vs.calc); ctx.show('.rv', !!vs.calc);
    ctx.show('.ph', !vs.calc); ctx.show('.plot', !!vs.calc); ctx.show('.legend', !!vs.calc && !vs.noLegend); ctx.show('.sum', !!vs.calc);
  }
  /** refresh slider bounds from the client fields and show the lever values */
  function tnmLevers(ctx, vs) {
    const c = tnmCase(ctx), rv = vs.rv;
    const b = { delay: [0, Math.max(0, c.R - c.A0 - 1)], retireAt: [c.A0, Math.max(c.A0, c.LE)], lifestyle: [0, Math.max(1000, 2 * c.inc)] };
    Object.keys(b).forEach((k) => {
      const sl = ctx.$(`[data-rs="${k}"]`), inp = ctx.$(`[data-rv="${k}"]`);
      rv[k] = Math.max(b[k][0], k === 'lifestyle' ? rv[k] : Math.min(b[k][1], rv[k]));
      sl.min = b[k][0]; sl.max = b[k][1]; sl.value = rv[k];
      if (document.activeElement !== inp) inp.value = k === 'lifestyle' ? m0(rv[k]) : String(rv[k]);
    });
    return c;
  }
  const TNM_COL = { ideal: P.steel, idealPost: P.navy4, present: P.navy, revised: P.gold };
  function tnmDraw(ctx, vs) {
    if (!vs.rv) return;
    tnmShow(ctx, vs);
    const c = tnmLevers(ctx, vs);
    const R = ctx._tnmR = tnmRun(c, vs.rv, vs.keep = vs.keep || {});
    /* summary */
    const set = (k, a, v) => { ctx.$(`[data-a="${k}"]`).textContent = a; ctx.$(`[data-o="${k}"]`).textContent = m0(v); };
    set('cs', c.A0, R.curSaving); set('is', c.A0, R.ideal.saving); set('rs', c.A0 + vs.rv.delay, R.revised.saving);
    set('cb', c.R, R.curBal); set('ib', c.R, R.ideal.bal); set('rb', vs.rv.retireAt, R.revised.bal);
    /* chart */
    const plot = ctx.$('.plot'), W = 1080, H = 572, pl = 112, pr = 14, pt = 20, pb = 44;
    const rows = R.ideal.rows, K = rows.length;
    const all = [].concat(R.ideal.rows, R.present.rows, R.revised.rows).map((r) => r.end);
    const sc = niceScale(0, Math.max(1, ...all), 6);
    const Y = (v) => pt + (H - pt - pb) * (sc.hi - v) / (sc.hi - sc.lo);
    const band = (W - pl - pr) / K, X = (i) => pl + band * (i + 0.5);
    let g = '';
    for (let v = sc.lo; v <= sc.hi + 1e-6; v += sc.step) g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="#d6cfc4" stroke-width="1"/><text x="${pl - 12}" y="${(Y(v) + 6).toFixed(1)}" text-anchor="end" font-family="DM Sans, sans-serif" font-weight="700" font-size="17" fill="#3b4a63">${axMoney(Math.round(v))}</text>`;
    const every = K > 30 ? 5 : K > 15 ? 2 : 1;
    rows.forEach((r, i) => { if (r.age % every === 0) g += `<line x1="${X(i).toFixed(1)}" x2="${X(i).toFixed(1)}" y1="${pt}" y2="${H - pb}" stroke="#e3e8f0" stroke-width="1"/><text x="${X(i).toFixed(1)}" y="${H - pb + 28}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="17" fill="#3b4a63">${r.age}</text>`; });
    rows.forEach((r, i) => {
      const y = Y(Math.max(0, r.end)), h = Y(0) - y, bw = band * 0.72;
      g += `<rect class="hit" data-s="ideal" data-i="${i}" x="${(X(i) - bw / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" rx="2" fill="${r.age < c.R ? TNM_COL.ideal : TNM_COL.idealPost}" opacity="${r.age < c.R ? 1 : 0.78}"/>`;
    });
    const line = (key, rs, col, w) => {
      const d = rs.map((r, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(Math.max(0, r.end)).toFixed(1)}`).join('');
      return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>` +
        rs.map((r, i) => `<circle class="hit" data-s="${key}" data-i="${i}" cx="${X(i).toFixed(1)}" cy="${Y(Math.max(0, r.end)).toFixed(1)}" r="9" fill="${col}" fill-opacity="0" stroke="none"/>`).join('');
    };
    g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(0)}" y2="${Y(0)}" stroke="#0d1e3a" stroke-width="2"/>`;
    g += line('present', R.present.rows, TNM_COL.present, 4) + line('revised', R.revised.rows, TNM_COL.revised, 5);
    plot.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${g}</svg>`;
    const tip = ctx.$('.tip'), card = ctx.$('.chart');
    const names = { ideal: 'sIdeal', present: 'sPresent', revised: 'sRevised' };
    plot.querySelectorAll('.hit').forEach((n) => {
      n.addEventListener('mouseenter', () => {
        const s = n.dataset.s, i = +n.dataset.i, sr = R[s], row = sr.rows[i], ie = R.ideal.rows[i].end;
        const line2 = (k, v) => `<div class="tr"><span>${ctx.t(k)}</span><b class="num">${m0(v)}</b></div>`;
        tip.innerHTML = `<div class="th"><i class="sw ${s === 'ideal' ? 'ideal' : 'ln ' + (s === 'present' ? 'pres' : 'rev')}"></i>${ctx.t(names[s])} ${ctx.t('tipStrategy')}</div>
          <div class="tr age">${ctx.t('tipAge')} <b class="num">${row.age}</b></div>
          ${line2('tipC', row.contrib)}${line2('tipW', row.withdraw)}${line2('tipB', row.end)}${line2('tipI', ie)}${line2('tipD', s === 'ideal' ? 0 : row.end - ie)}${line2('tipL', sr.lump[i])}`;
        const left = X(i) + 26 + 18 > W - 330 ? X(i) - 330 : X(i) + 34;
        tip.style.left = left + 'px'; tip.style.top = Math.max(16, Math.min(300, Y(Math.max(0, row.end)) - 80)) + 'px'; tip.hidden = false;
      });
      n.addEventListener('mouseleave', () => { tip.hidden = true; });
      n.addEventListener('click', () => { vs.noLegend = !vs.noLegend; ctx.show('.legend', !vs.noLegend); });
    });
    refresh(ctx.el);
  }
  function tnmDocs(ctx, vs) {
    if (!vs.calc || !ctx._tnmR) return;
    const ov = ctx.overlay({ title: ctx.t('chTitle'), html: `<div class="b15-choose">
      <button type="button" class="st-pill" data-w="ideal">${ctx.t('chIdeal')}</button>
      <button type="button" class="st-pill" data-w="present">${ctx.t('chPresent')}</button>
      <button type="button" class="st-pill" data-w="revised">${ctx.t('chRevised')}</button></div>` });
    ov.querySelector('.st-overlay-in').style.width = '600px';
    ov.querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      const s = b.dataset.w, R = ctx._tnmR[s]; ov.close();
      const cols = [['age', 'cAge', 'age'], ['start', 'cInit', 'money', 0], ['contrib', 'cC', 'money', 0], ['withdraw', 'cW', 'money', 0], ['begin', 'cBoy', 'money', 0], ['growth', 'cG', 'money', 0], ['end', 'cEoy', 'money', 0], ['lump', 'cL', 'money', 0], ['year', 'cY', 'year']];
      openSheet(ctx, { heading: `${ctx.t({ ideal: 'sIdeal', present: 'sPresent', revised: 'sRevised' }[s])} ${ctx.t('wsTail')}`, size: 'full', columns: sheetCols(ctx, cols),
        rows: R.rows.map((r, i) => ({ age: r.age, start: r.start, contrib: r.contrib, withdraw: r.withdraw, begin: r.begin, growth: r.growth, end: r.end, lump: R.lump[i], year: r.year })) });
    }));
  }
  EFA.css('b15-tnm', `
  .b15-tnm { position: absolute; inset: 0; }
  .b15-tnm .doc { position: absolute; right: 58px; top: 92px; }
  .b15-tnm .left { position: absolute; left: 56px; top: 130px; width: 352px; display: grid; gap: 12px; }
  .stage .b15-tnm .b15-form.tight .st-field { grid-template-columns: 1fr 128px; padding: 4px 0; }
  .stage .b15-tnm .b15-form.tight .st-field > label { font-size: 17.5px; }
  .stage .b15-tnm .b15-form.tight .st-input { height: 38px; font-size: 18px; }
  .b15-tnm .calc { justify-self: center; margin-top: 16px; }
  .b15-tnm .rv { padding-bottom: 6px; }
  .b15-tnm .rv .blk { padding: 7px 18px 3px; }
  .b15-tnm .rv .ln { display: flex; align-items: center; gap: 8px; font: 700 18px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-tnm .mini { width: 52px; height: 32px; border: 1.5px solid #cbd5e3; border-radius: 7px; text-align: center; font: 700 17px/1 "DM Sans", sans-serif; color: #0d1e3a; background: #fff; padding: 0 4px; }
  .b15-tnm .mini.wide { width: 120px; text-align: right; padding-right: 8px; }
  .b15-tnm .mini:focus { outline: none; border-color: #b8972e; }
  .b15-tnm input[type=range] { width: 100%; margin: 6px 0 2px; accent-color: #b8972e; height: 22px; }
  .b15-tnm .chart { position: absolute; left: 428px; right: 56px; top: 130px; bottom: 58px; padding: 14px 18px 10px; }
  .b15-tnm .ph { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 14px; text-align: center; padding: 0 120px; }
  .b15-tnm .ph .q { margin: 0; font: 600 46px/1.15 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b15-tnm .ph .s { margin: 0; font: 500 21px/1.45 "DM Sans", sans-serif; color: #667389; }
  .b15-tnm .plot svg { display: block; margin: 0 auto; }
  .b15-tnm .hit { cursor: pointer; }
  .b15-tnm rect.hit:hover { filter: brightness(1.1); }
  .b15-tnm .legend { position: absolute; left: 150px; top: 26px; display: flex; gap: 22px; padding: 8px 14px; background: rgba(255,253,248,.92); border: 1px solid #d6cfc4; border-radius: 10px; }
  .b15-tnm .lg { display: inline-flex; align-items: center; gap: 9px; font: 700 19px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-tnm .sw { display: inline-block; width: 22px; height: 16px; border-radius: 3px; background: linear-gradient(90deg, #8aa3c7 50%, #2b4c80 50%); }
  .b15-tnm .sw.ln { height: 5px; border-radius: 3px; background: #0d1e3a; }
  .b15-tnm .sw.ln.rev { background: #b8972e; height: 6px; }
  .b15-tnm .sum { display: grid; grid-template-columns: auto auto auto auto auto auto; justify-content: space-between; gap: 6px 14px; padding: 8px 10px 0; border-top: 1px solid rgba(13,30,58,.12); margin-top: 4px; }
  .b15-tnm .sum .k { text-align: right; font: 700 16px/1.25 "DM Sans", sans-serif; color: #3b4a63; white-space: nowrap; }
  .b15-tnm .sum .k.ideal { color: #4f6d9c; }
  .b15-tnm .sum .k.rev { color: #8a6e22; }
  .b15-tnm .sum .v { text-align: right; font: 700 19px/1.25 "DM Sans", sans-serif; color: #0d1e3a; min-width: 112px; }
  .b15-tnm .tip { position: absolute; z-index: 4; width: 310px; padding: 12px 16px; border-radius: 12px; background: #0d1e3a; color: #f7f5f1; box-shadow: 0 14px 30px rgba(8,20,42,.3); pointer-events: none; display: grid; gap: 4px; }
  .b15-tnm .tip .th { display: flex; align-items: center; gap: 10px; font: 700 17px/1.2 "DM Sans", sans-serif; color: #d5bd68; margin-bottom: 4px; }
  .b15-tnm .tip .tr { display: flex; justify-content: space-between; gap: 12px; font: 500 15px/1.3 "DM Sans", sans-serif; }
  .b15-tnm .tip .tr b { font-weight: 700; }
  .b15-tnm .tip .tr.age { justify-content: flex-start; gap: 6px; font-weight: 700; }
  `);

  /* ------------------------------------------------------------------ */
  /* upl1: borrow against the policy, invest at a spread                  */
  /* ------------------------------------------------------------------ */
  /** upl1.md: spread = return - loan rate; with deductible loan interest the after-tax spread adds back rate x bracket */
  function uplSpread(v) {
    const spread = v.inv - v.loanRate;
    return { spread, dollars: spread * v.amt, t40: spread + v.loanRate * 0.40, t30: spread + v.loanRate * 0.30, t20: spread + v.loanRate * 0.20 };
  }
  EFA.engines.upl = { spread: uplSpread };
  /* straight or gently curved arrows with simple heads, geometry computed here */
  function arrowHead(x1, y1, a, col, L, Wd) {
    L = L || 24; Wd = Wd || 13;
    const bx = x1 - L * Math.cos(a), by = y1 - L * Math.sin(a);
    const nx = -Math.sin(a) * Wd, ny = Math.cos(a) * Wd;
    return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)}L${(bx + nx).toFixed(1)},${(by + ny).toFixed(1)}L${(bx - nx).toFixed(1)},${(by - ny).toFixed(1)}Z" fill="${col}"/>`;
  }
  function arrowSvg(o) {
    const col = o.col || P.navy, w = o.w || 6;
    const [x0, y0] = o.from, [x1, y1] = o.to;
    const L = 24;
    if (o.via) {
      const [cx, cy] = o.via, a1 = Math.atan2(y1 - cy, x1 - cx);
      const ex = x1 - L * 0.8 * Math.cos(a1), ey = y1 - L * 0.8 * Math.sin(a1);
      return `<path d="M${x0},${y0}Q${cx},${cy} ${ex.toFixed(1)},${ey.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>${arrowHead(x1, y1, a1, col)}`;
    }
    const a = Math.atan2(y1 - y0, x1 - x0), sx = o.both ? x0 + L * 0.8 * Math.cos(a) : x0, sy = o.both ? y0 + L * 0.8 * Math.sin(a) : y0;
    const ex = x1 - (o.dash ? 0 : L * 0.8) * Math.cos(a), ey = y1 - (o.dash ? 0 : L * 0.8) * Math.sin(a);
    return `<path d="M${sx.toFixed(1)},${sy.toFixed(1)}L${ex.toFixed(1)},${ey.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''}/>` +
      (o.dash ? '' : arrowHead(x1, y1, a, col)) + (o.both ? arrowHead(x0, y0, a + Math.PI, col) : '');
  }
  const UPL_BEN = ['Tax-Deferred Growth', 'Tax-Advantaged Distributions', 'Competitive Crediting', 'High Contribution Limits', 'Additional Benefits', 'Collateral Opportunities',
    'Insurer-Backed Guarantees', 'Downside Protection', 'Contractual Loan Provision', 'Flexible Loan Repayment', 'Liquidity, Use and Control', 'Deductible Contributions'];
  const uplCopy = {
    insH: 'Insurance Company', insSub: 'Policy Loan', lAmt: 'Amount', lRate: 'Int. Rate',
    lien: 'Lien', loan: 'Loan', interest: 'Interest',
    polTop: 'Cash Value\nLife Insurance', polLab: 'Crediting Rate', oppTop: 'Financial\nOpportunity', oppLab: 'Return',
    benH: 'List of Benefits', showAll: 'Show All', reset: 'Reset',
    bot5: 'Taxable Growth', bot6: 'You have three options for that taxable growth.',
    valOr: 'or', valYr: '/ year',
    aUp: 'Repay Loan\nPrincipal', aRight: 'Add to\nOpportunity', aLeft: 'Purchase More Cash\nValue Insurance',
    exH: 'After-Tax Spread', ex1a: 'If the loan interest can be written off as a cost of investing, your pre-tax spread of', ex1b: 'turns into these after-tax spreads:',
    ex40: 'in a 40% tax bracket', ex30: 'in a 30% tax bracket', ex20: 'in a 20% tax bracket',
    ex5: 'The spread grows after tax because the loan interest is written off.',
    ex6a: 'This assumes the', ex6b: 'opportunity return is already an after-tax figure.',
    exBack: 'Click to return to the list of benefits.',
    ast: 'Interest on a policy loan may be deductible when the borrowed money is invested, under the investment interest rules. Please confirm with your tax professional before relying on it.',
    ok: 'Ok',
    distNote: 'Distributions from a properly structured policy are income-tax-free.',
    _notes: 'A cash value policy can be collateral. The insurer lends against it, the money goes to work in an outside opportunity, and the difference between what it earns and what the loan costs is the spread.\n\n- Build it step by step: crediting rate, return, the loan, then the interest.\n- Ask: If your money could earn in two places at once, what would you do with the spread?\nPAUSE\n\n- Click the spread to show the after-tax view; Show All jumps to the full picture.'
  };
  UPL_BEN.forEach((b, i) => { uplCopy['b' + (i + 1)] = b; });
  /* hand-off from a calling screen (cvs1 passes the opportunity's name and its benefit list):
     EFA.handoff = Object.assign(EFA.handoff || {}, { upl1: { title: 'Real Estate', benefits: [{ label, on }] } }) before ctx.jump('UPL', 'upl1') */
  let uplHand = null;
  function uplHandoff() {
    const pl = EFA.player || {}, sig = JSON.stringify(pl.stack || []);
    const h = EFA.handoff && EFA.handoff.upl1;
    if (h && (pl.stack || []).length) { uplHand = { sig, data: h }; delete EFA.handoff.upl1; }
    else if (h) delete EFA.handoff.upl1;
    if (uplHand && (uplHand.sig !== sig || !(pl.stack || []).length)) uplHand = null;
    return uplHand ? uplHand.data : null;
  }
  screen('upl1', {
    title: 'Understanding policy loans: borrow, invest, keep the spread',
    steps: 10,
    copy: uplCopy,
    render(ctx) {
      const vs = visit(ctx);
      const hand = uplHandoff();
      if (!vs.ben) vs.ben = hand && Array.isArray(hand.benefits) ? hand.benefits.map((b) => ({ label: String(b.label || ''), on: !!b.on })) : UPL_BEN.map(() => ({ on: false }));
      const bub = (x, y, s, tone) => { const b = LIB().bubble; return b ? b.circle({ x, y, size: s, tone }) : ''; };
      const PC = [250, 438], PR = 190, OC = [1012, 470], OR = 150;
      const pt2 = (c, r, a) => A.pt(c[0], c[1], r, a);
      const lienA = pt2(PC, PR + 6, 42), loanB = pt2(OC, OR + 8, 318), intA = pt2(OC, OR + 8, 346);
      const lines = `
        <g class="u-lien b15-fade">${arrowSvg({ from: [478, 238], to: lienA, col: P.navy4, w: 5, dash: '2 11' })}</g>
        <g class="u-loan b15-fade">${arrowSvg({ from: [808, 246], to: loanB, both: true, col: P.navy })}</g>
        <g class="u-int b15-fade">${arrowSvg({ from: intA, to: [856, 168], col: P.navy4 })}</g>
        <g class="u-up b15-fade">${arrowSvg({ from: [640, 694], to: [640, 252], col: P.gold, w: 8 })}</g>
        <g class="u-right b15-fade">${arrowSvg({ from: [858, 786], via: [1006, 790], to: pt2(OC, OR + 6, 196), col: P.gold, w: 8 })}</g>
        <g class="u-left b15-fade">${arrowSvg({ from: [422, 786], via: [258, 790], to: pt2(PC, PR + 6, 168), col: P.gold, w: 8 })}</g>`;
      const benRows = vs.ben.map((b, i) => `<button type="button" class="ben ${b.on ? 'on' : ''}" data-b="${i}">${b.label ? esc(b.label) : ctx.t('b' + (i + 1))}</button>`).join('');
      ctx.el.innerHTML = `
        <svg class="b15-full u-svg" viewBox="0 0 1600 900">${lines}</svg>
        ${bub(PC[0], PC[1], PR * 2, 'navy')}${bub(OC[0], OC[1], OR * 2, 'gold')}
        <div class="u-circ pol" style="left:${PC[0] - PR}px;top:${PC[1] - PR}px;width:${PR * 2}px;height:${PR * 2}px">
          ${ctx.t('polTop', { tag: 'div', cls: 'top' })}
          <div class="u-in b15-fade s1">${sField(ctx, vs, { id: 'creditingRate', label: 'polLab', type: 'pct', value: 0, dp: 2 })}</div>
        </div>
        <div class="u-circ opp" style="left:${OC[0] - OR}px;top:${OC[1] - OR}px;width:${OR * 2}px;height:${OR * 2}px">
          ${hand && hand.title ? `<div class="top">${esc(hand.title)}</div>` : ctx.t('oppTop', { tag: 'div', cls: 'top' })}
          <div class="u-in b15-fade s2">${sField(ctx, vs, { id: 'investmentRate', label: 'oppLab', type: 'pct', value: 0, dp: 2 })}</div>
        </div>
        <div class="b15-card u-ins b15-fade">
          ${ctx.t('insH', { tag: 'h3', cls: 'st-h3' })}${ctx.t('insSub', { tag: 'div', cls: 'sub' })}
          <div class="b15-form">${sField(ctx, vs, { id: 'loanAmount', label: 'lAmt', type: 'money', value: 0, min: 0 })}${sField(ctx, vs, { id: 'loanRate', label: 'lRate', type: 'pct', value: 0, dp: 2 })}</div>
        </div>
        <div class="u-tag u-lien b15-fade" style="left:356px;top:226px">${ctx.t('lien')}</div>
        <div class="u-tag u-loan b15-fade" style="left:742px;top:292px">${ctx.t('loan')}</div>
        <div class="u-tag u-int b15-fade" style="left:930px;top:206px">${ctx.t('interest')}<button type="button" class="ast" aria-label="Note on interest">*</button></div>
        <div class="u-otag u-up b15-fade" style="left:660px;top:430px">${ctx.t('aUp')}</div>
        <div class="u-otag u-right b15-fade" style="left:1030px;top:700px">${ctx.t('aRight')}</div>
        <div class="u-otag u-left b15-fade" style="left:78px;top:700px">${ctx.t('aLeft')}</div>
        <div class="b15-card u-ben">
          <div class="list">${ctx.t('benH', { tag: 'div', cls: 'b15-band sm' })}<div class="rows">${benRows}</div>
            <div class="btns"><button type="button" class="st-pill sa">${ctx.t('showAll')}</button><button type="button" class="st-pill rs">${ctx.t('reset')}</button></div></div>
          <div class="exp" hidden>${ctx.t('exH', { tag: 'div', cls: 'b15-band sm' })}<div class="ex">
            <p>${ctx.t('ex1a')} ${N('<b data-o="sp"></b>')} ${ctx.t('ex1b')}</p>
            <p class="t"><b class="num">&gt; <span data-o="t40"></span></b> ${ctx.t('ex40')}</p>
            <p class="t"><b class="num">&gt; <span data-o="t30"></span></b> ${ctx.t('ex30')}</p>
            <p class="t"><b class="num">&gt; <span data-o="t20"></span></b> ${ctx.t('ex20')}</p>
            <p>${ctx.t('ex5')}</p>
            <p>${ctx.t('ex6a')} ${N('<b data-o="inv"></b>')} ${ctx.t('ex6b')}</p>
            <p class="back">${ctx.t('exBack')}</p></div></div>
        </div>
        <div class="u-bot b15-fade">
          <div class="lab"><span class="l5">${ctx.t('bot5')}</span><span class="l6">${ctx.t('bot6')}</span></div>
          <button type="button" class="val num"><span data-o="vp"></span> ${ctx.t('valOr')} <span data-o="vd"></span> ${ctx.t('valYr')}</button>
        </div>
        <p class="st-disclaimer b15-disc u-disc">${ctx.t('distNote')} ${discHtml('loans')} ${discHtml('guarantees')} ${discHtml('hypothetical')}</p>`;
      bindStores(ctx, vs);
      ctx.onFields((v) => {
        const S = uplSpread({ inv: v.investmentRate, loanRate: v.loanRate, amt: v.loanAmount });
        const pc = (x) => F.pct(x, 2);
        ctx.$('[data-o="vp"]').textContent = pc(S.spread);
        ctx.$('[data-o="vd"]').textContent = m0(S.dollars);
        ctx.$('[data-o="sp"]').textContent = pc(S.spread);
        ctx.$('[data-o="t40"]').textContent = pc(S.t40);
        ctx.$('[data-o="t30"]').textContent = pc(S.t30);
        ctx.$('[data-o="t20"]').textContent = pc(S.t20);
        ctx.$('[data-o="inv"]').textContent = pc(v.investmentRate);
      });
      const showExp = (on) => { vs.exp = on; ctx.$('.u-ben .list').hidden = on; ctx.$('.u-ben .exp').hidden = !on; };
      ctx.on(ctx.$$('.ben'), 'click', (e, b) => { const i = +b.dataset.b; vs.ben[i].on = !vs.ben[i].on; b.classList.toggle('on', vs.ben[i].on); });
      ctx.on(ctx.$('.rs'), 'click', () => { vs.ben.forEach((b) => { b.on = false; }); ctx.$$('.ben').forEach((b) => b.classList.remove('on')); });
      ctx.on(ctx.$('.sa'), 'click', () => { showExp(false); ctx.goStep(9); });
      ctx.on(ctx.$('.val'), 'click', () => showExp(ctx.step > 4 ? !vs.exp : false));
      ctx.on(ctx.$('.u-ben .exp'), 'click', () => showExp(false));
      ctx.on(ctx.$('.ast'), 'click', () => { if (ctx.$('.b15-modal')) ctx.$('.b15-modal').close(); else okModal(ctx, ctx.t('ast', { tag: 'p', attrs: 'style="margin:0"' }), 'ok'); });
      showExp(!!vs.exp);
      ['creditingRate', 'investmentRate', 'loanAmount', 'loanRate'].forEach((id) => clickerSafe(ctx, id));
    },
    step(ctx, n, dir) {
      const vis = (sel, on) => ctx.$$(sel).forEach((el) => {
        const off = el.classList.contains('is-off');
        if (!on && !off && dir < 0) { el.style.transition = 'none'; el.classList.add('is-off'); void el.offsetWidth; el.style.transition = ''; }
        else el.classList.toggle('is-off', !on);
      });
      vis('.s1', n >= 1); vis('.s2', n >= 2); vis('.u-ins, .u-lien, .u-loan', n >= 3); vis('.u-int', n >= 4);
      vis('.u-bot', n >= 5); vis('.u-up', n >= 7); vis('.u-right', n >= 8); vis('.u-left', n >= 9);
      ctx.$('.u-bot .l5').hidden = n >= 6; ctx.$('.u-bot .l6').hidden = n < 6;
      if (n <= 4 && ctx.$('.u-ben .exp') && !ctx.$('.u-ben .exp').hidden) { ctx.$('.u-ben .list').hidden = false; ctx.$('.u-ben .exp').hidden = true; }
      const sel = (id, ms) => ctx.timeout(() => { const i = fieldInput(ctx, id); if (i && i.isConnected && !(EFA.edit && EFA.edit.on)) { i.focus(); i.select(); } }, ms);
      if (dir > 0) {
        if (n === 1) sel('creditingRate', 800);
        if (n === 2) { let sync = true; discOnce(ctx, () => sel('investmentRate', sync ? 800 : 200)); sync = false; }
        if (n === 3) sel('loanAmount', 800);
      }
    }
  });
  EFA.css('b15-upl', `
  .u-svg { pointer-events: none; z-index: 1; }
  .u-svg .u-up { }
  .stage .lib-bub { z-index: 0; }
  .u-circ { position: absolute; z-index: 2; display: grid; align-content: center; justify-items: center; gap: 14px; text-align: center; border-radius: 50%; }
  .u-circ .top { font: 700 28px/1.15 "DM Sans", sans-serif; letter-spacing: .04em; text-transform: uppercase; color: #f7f5f1; }
  .u-circ.opp .top { font-size: 23px; color: #0d1e3a; }
  .u-circ .u-in { width: 64%; }
  .stage .u-circ .st-field { justify-items: center; gap: 8px; }
  .stage .u-circ .st-field > label { font: 700 17px/1 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #d5bd68; }
  .stage .u-circ.opp .st-field > label { color: #0d1e3a; }
  .stage .u-circ .st-input { text-align: center; font-size: 26px; font-weight: 700; height: 54px; width: 160px; }
  .stage .u-circ.opp .st-input { width: 132px; }
  .u-ins { left: 450px; top: 34px; width: 390px; padding: 14px 26px 8px; z-index: 2; text-align: center; }
  .u-ins .st-h3 { font-size: 30px; }
  .u-ins .sub { font: 700 15px/1 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6e22; margin: 6px 0 4px; }
  .stage .u-ins .b15-form .st-field { grid-template-columns: 1fr 170px; padding: 7px 0; text-align: left; }
  .stage .u-ins .b15-form .st-input { height: 46px; }
  .u-tag { position: absolute; z-index: 3; font: 700 19px/1 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #2b4c80; display: flex; align-items: center; gap: 4px; }
  .u-tag .ast { border: 0; background: none; color: #b3402e; font: 700 34px/1 "DM Sans", sans-serif; padding: 0 4px; cursor: pointer; transform: translateY(4px); }
  .u-tag .ast:hover { color: #0d1e3a; }
  .u-otag { position: absolute; z-index: 3; padding: 10px 16px; border-radius: 12px; background: #fffdf8; border: 1.5px solid #b8972e; box-shadow: 0 8px 20px rgba(13,30,58,.10); font: 700 17px/1.25 "DM Sans", sans-serif; letter-spacing: .06em; text-transform: uppercase; color: #0d1e3a; text-align: center; }
  .u-ben { left: 1192px; top: 64px; width: 348px; z-index: 2; overflow: hidden; }
  .u-ben .rows { display: grid; gap: 6px; padding: 10px 12px 4px; }
  .u-ben .ben { min-height: 41px; border: 1.5px solid #cbd5e3; border-radius: 9px; background: #fff; text-align: left; padding: 6px 12px; font: 700 16px/1.15 "DM Sans", sans-serif; color: #0d1e3a; transition: background .25s ease, border-color .25s ease; }
  .u-ben .ben:hover { border-color: #b8972e; }
  .u-ben .ben.on { background: linear-gradient(90deg, #d5bd68, #f0e6c4); border-color: #b8972e; }
  .u-ben .btns { display: flex; justify-content: space-between; padding: 10px 12px 14px; }
  .u-ben .btns .st-pill { min-height: 40px; padding: 6px 20px; font-size: 16px; }
  .u-ben .btns .rs { background: transparent; color: #0d1e3a; border-color: #cbd5e3; }
  .u-ben .exp { cursor: pointer; }
  .u-ben .ex { padding: 14px 20px 18px; display: grid; gap: 12px; }
  .u-ben .ex p { margin: 0; font: 600 18px/1.4 "DM Sans", sans-serif; color: #0d1e3a; }
  .u-ben .ex p.t { font-size: 19px; padding-left: 10px; border-left: 3px solid #b8972e; }
  .u-ben .ex p.t b { color: #8a6e22; font-size: 22px; }
  .u-ben .ex p.back { font: 500 14px/1.3 "DM Sans", sans-serif; color: #667389; }
  .u-bot { position: absolute; left: 640px; top: 684px; transform: translateX(-50%); z-index: 3; display: grid; justify-items: center; gap: 18px; }
  .u-bot .lab { padding: 10px 22px; border-radius: 12px; background: #0d1e3a; color: #f7f5f1; font: 700 19px/1.2 "DM Sans", sans-serif; letter-spacing: .04em; white-space: nowrap; }
  .u-bot .val { min-width: 430px; padding: 14px 28px; border-radius: 999px; border: 2px solid #b8972e; background: #fffdf8; font: 700 27px/1 "DM Sans", sans-serif; color: #0d1e3a; box-shadow: 0 10px 24px rgba(13,30,58,.12); cursor: pointer; }
  .u-bot .val:hover { background: #f0e6c4; }
  .u-disc { left: 60px !important; bottom: 10px !important; width: 1180px !important; font-size: 12.5px !important; line-height: 1.35 !important; }
  `);

  /* ------------------------------------------------------------------ */
  /* ig2: the Income Game (IRS Statistics of Income by AGI percentile)    */
  /* ------------------------------------------------------------------ */
  /** safe lookup of the percentile dataset; null until EFA.data carries a verified copy */
  function soiData() {
    const D = EFA.data || {};
    const cand = [D.history && D.history.incomeTaxShares, D.soi, D.irsSoi, D.incomePercentiles, D.history && D.history.soi, D.history && D.history.incomePercentiles];
    for (const c of cand) {
      if (!c) continue;
      const list = Array.isArray(c) ? c : (c.groups || c.percentiles || c.rows);
      if (!Array.isArray(list)) continue;
      const pick = (o, keys) => { for (const k of keys) if (o && o[k] != null && isFinite(+o[k])) return +o[k]; return null; };
      const grp = (g) => { const m = /^top\s*(\d+(?:\.\d+)?)$/i.exec(String(g && g.group || '')); return m ? +m[1] / 100 : null; };
      const rows = list.map((g) => ({ top: pick(g, ['top', 'pct', 'percentile']) != null ? pick(g, ['top', 'pct', 'percentile']) : grp(g), agi: pick(g, ['agiFloor', 'agi', 'threshold', 'agiThreshold', 'splitPoint', 'minAgi']), share: pick(g, ['shareOfIncomeTax', 'share', 'taxShare', 'shareOfTax', 'incomeTaxShare']), returns: pick(g, ['returns', 'households', 'count', 'numberOfReturns']) }))
        .filter((r) => r.top != null && r.agi != null && r.share != null);
      if (!rows.length) continue;
      const norm = (x) => (x > 1 ? x / 100 : x);
      return { year: c.taxYear || c.year || null, asOf: c.asOf || c.current || c.retrieved || null, rows: rows.map((r) => ({ top: norm(r.top), agi: r.agi, share: norm(r.share), returns: r.returns })) };
    }
    return null;
  }
  const IG_TOPS = [0.01, 0.05, 0.10, 0.25, 0.50];
  screen('ig2', {
    title: 'The Income Game',
    copy: {
      head: 'The Income Game', source: 'Source',
      h1: 'In the Top', h2: 'AGI Split Point', h3: 'Share of Taxes Paid',
      r1: '1%', r2: '5%', r3: '10%', r4: '25%', r5: '50%',
      mh: 'Million Households',
      pending: 'These IRS figures are being verified. The board will fill in as soon as they are confirmed.',
      srcTitle: 'Source', srcA: 'These figures come from IRS Statistics of Income individual income tax data, ranked by adjusted gross income percentile, for tax year', srcB: '. Data current as of',
      srcPending: 'The IRS Statistics of Income percentile tables for the most recent tax year are being verified for this screen.',
      _notes: 'Let the client guess each threshold before you reveal it. The point lands on its own: a fairly modest income puts a household in a top group, and that group carries most of the federal income tax.\n\n- Type the client\'s guess, then click the question mark to reveal.\n- Ask: Were you surprised by where your income falls?\nPAUSE'
    },
    render(ctx) {
      const S = soiData();
      const vs = visit(ctx);
      vs.rev = vs.rev || {};
      const rowOf = (top) => (S ? S.rows.find((r) => Math.abs(r.top - top) < 1e-6) : null);
      const pill = (k) => `<button type="button" class="pill" data-rv="${k}">?</button>`;
      const rows = IG_TOPS.map((top, i) => {
        const d = rowOf(top);
        return `<div class="row" data-i="${i}">
          <div class="c1">${ctx.t('r' + (i + 1))}</div>
          <div class="c2"><input class="guess num" inputmode="decimal" autocomplete="off" placeholder="?????" aria-label="Guess">
            <span class="slot">${pill('a' + i)}<b class="ans num" hidden>${d ? m0(d.agi) : ''}</b></span></div>
          <div class="c3"><span class="slot">${pill('s' + i)}<button type="button" class="share num" hidden>${d ? F.pct(d.share, 1) : ''}</button></span>
            <span class="hh" hidden>${d && d.returns ? `${N(F.num(d.returns >= 1e5 ? d.returns / 1e6 : d.returns, 1))} ${ctx.t('mh')}` : ''}</span></div>
        </div>`;
      }).join('');
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <button type="button" class="b15-link b15-ig-src">${ctx.t('source')}</button>
        <div class="b15-card b15-ig">
          <div class="hd"><div>${ctx.t('h1')}</div><div>${ctx.t('h2')}</div><div>${ctx.t('h3')}</div></div>
          ${rows}
        </div>
        ${S ? '' : `<p class="b15-ig-pend">${ctx.t('pending')}</p>`}`;
      ctx.$$('.guess').forEach((inp) => {
        inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
        inp.addEventListener('focus', () => { const v = F.parse(inp.value); inp.value = isFinite(v) ? String(v) : ''; });
        inp.addEventListener('blur', () => { const v = F.parse(inp.value); inp.value = isFinite(v) ? m0(Math.round(v)) : ''; });
      });
      const apply = () => {
        Object.keys(vs.rev).forEach((k) => {
          const i = +k.slice(1), row = ctx.$(`.row[data-i="${i}"]`); if (!row) return;
          if (k[0] === 'a') { row.querySelector('[data-rv^="a"]').hidden = true; row.querySelector('.ans').hidden = false; }
          if (k[0] === 's') { row.querySelector('[data-rv^="s"]').hidden = true; row.querySelector('.share').hidden = false; }
          if (k[0] === 'h') { row.querySelector('.hh').hidden = false; row.querySelector('.share').classList.add('done'); }
        });
      };
      ctx.on(ctx.$$('.pill'), 'click', (e, b) => { if (!S) { ctx.toast(ctx.text('pending')); return; } vs.rev[b.dataset.rv] = true; apply(); });
      ctx.on(ctx.$$('.share'), 'click', (e, b) => { const i = +b.closest('.row').dataset.i; vs.rev['h' + i] = true; apply(); });
      ctx.on(ctx.$('.b15-ig-src'), 'click', () => {
        const body = S && S.year ? `<p class="src">${ctx.t('srcA')} ${N(esc(S.year))}${S.asOf ? `${ctx.t('srcB')} ${N(esc(S.asOf))}.` : '.'}</p>` : `<p class="src">${ctx.t('srcPending')}</p>`;
        const ov = ctx.overlay({ title: ctx.t('srcTitle'), html: `<div class="b15-ig-srcb">${body}</div>` });
        ov.querySelector('.st-overlay-in').style.width = '860px';
      });
      apply();
    }
  });
  EFA.css('b15-ig', `
  .b15-ig-src { position: absolute; right: 80px; top: 26px; }
  .b15-ig { left: 80px; right: 80px; top: 168px; height: 640px; display: grid; grid-template-rows: 70px repeat(5, 1fr); overflow: hidden; }
  .b15-ig .hd, .b15-ig .row { display: grid; grid-template-columns: 1fr 4fr 2fr; align-items: center; }
  .b15-ig .hd { background: #0d1e3a; color: #f7f5f1; border-radius: 16px 16px 0 0; margin: -1px -1px 0; font: 700 20px/1 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; text-align: center; }
  .b15-ig .row { border-bottom: 1px solid rgba(13,30,58,.10); }
  .b15-ig .row:nth-child(odd) { background: rgba(227,232,240,.35); }
  .b15-ig .row:last-child { border-bottom: 0; }
  .b15-ig .c1 { text-align: center; font: 700 38px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-ig .c2 { display: flex; align-items: center; justify-content: center; gap: 34px; }
  .b15-ig .c3 { display: grid; justify-items: center; gap: 6px; }
  .b15-ig .guess { width: 250px; height: 58px; border: 1.5px solid #cbd5e3; border-radius: 10px; background: #fff; text-align: right; padding: 0 16px; font: 700 28px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-ig .guess::placeholder { color: #a8b3c4; letter-spacing: .1em; }
  .b15-ig .guess:focus { outline: none; border-color: #b8972e; box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .b15-ig .slot { width: 250px; height: 58px; display: grid; place-items: center; }
  .b15-ig .pill { width: 240px; height: 54px; border-radius: 999px; border: 0; background: linear-gradient(180deg, #2b4c80, #0d1e3a); color: #d5bd68; font: 700 30px/1 "DM Sans", sans-serif; box-shadow: 0 8px 18px rgba(13,30,58,.25); transition: transform .2s ease, color .2s ease; }
  .b15-ig .pill:hover { color: #fff; transform: translateY(-2px); }
  .b15-ig .ans { font: 700 34px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-ig .share { border: 0; background: none; font: 700 38px/1 "DM Sans", sans-serif; color: #8a6e22; cursor: pointer; border-bottom: 2px dotted #b8972e; padding: 0 2px 2px; }
  .b15-ig .share.done { border-bottom-color: transparent; cursor: default; }
  .b15-ig .hh { font: 600 17px/1 "DM Sans", sans-serif; color: #3b4a63; }
  .b15-ig-pend { position: absolute; left: 50%; bottom: 40px; transform: translateX(-50%); margin: 0; width: 1100px; text-align: center; font: 500 18px/1.4 "DM Sans", sans-serif; color: #667389; }
  .b15-ig-srcb .src { margin: 0; font: 500 21px/1.55 "DM Sans", sans-serif; color: #0d1e3a; }
  `);

  /* ------------------------------------------------------------------ */
  /* atc3: two situations where borrowing against a policy makes sense    */
  /* ------------------------------------------------------------------ */
  screen('atc3', {
    title: 'When borrowing against a policy makes sense',
    copy: {
      head: 'When Borrowing Against\nYour Policy Makes Sense',
      t1: 'Major Capital Purchases', d1: 'Anything you cannot pay for in full out of your monthly cash flow.',
      t2: 'Investment Opportunities', d2: 'A chance to put dollars to work with the potential to earn more than the policy itself is crediting.',
      _notes: 'There are two good reasons to borrow against a policy: to buy something you would otherwise finance, and to take advantage of an opportunity when it shows up.\n\n- Ask: In the last few years, which of these two came up for you, and how did you pay for it?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head', 'sm')}
        <div class="b15-atc">${[1, 2].map((i) => `<div class="row"><span class="bul">${dart(74)}</span><div class="b15-card b15-flow card">${ctx.t('t' + i, { tag: 'div', cls: 't' })}${ctx.t('d' + i, { tag: 'div', cls: 'd' })}</div></div>`).join('')}</div>
        ${discLine(['loans', 'hypothetical'], { cls: 'b15-disc c' })}`;
    }
  });
  EFA.css('b15-atc', `
  .b15-atc { position: absolute; left: 50%; top: 292px; transform: translateX(-50%); display: grid; gap: 44px; }
  .b15-atc .row { display: grid; grid-template-columns: 74px 1000px; gap: 26px; align-items: center; }
  .b15-atc .bul { display: grid; place-items: center; }
  .b15-atc .card { padding: 26px 36px 28px; display: grid; gap: 12px; border-left: 6px solid #b8972e; }
  .b15-atc .t { font: 600 48px/1.05 "Cormorant Garamond", Georgia, serif; color: #8a6e22; }
  .b15-atc .d { font: 700 25px/1.4 "DM Sans", sans-serif; color: #0d1e3a; }
  `);

  /* ------------------------------------------------------------------ */
  /* wills1: why a will (and maybe a trust) matters, with a checklist     */
  /* ------------------------------------------------------------------ */
  screen('wills1', {
    title: 'Why a will (and maybe a trust) matters',
    copy: {
      p1: 'A will may be the most important document you ever sign.',
      p2: 'Many adults have never signed a valid will.',
      p3: 'Without a will, a court, not you, may decide who receives your assets and who raises your minor children.',
      p4: 'Beyond a valid will, you may need a trust to make sure your wishes are carried out.',
      p5: 'Who is the beneficiary on your life insurance today? The answer may surprise you.',
      checklist: 'Checklist',
      ckTitle: 'Wills and Trusts Checklist', ckSub: 'Please go over this list with your estate attorney.',
      ckT: 'Trusts', ckW: 'Will Planning Review',
      t1: 'Gather the records of every trust in which you are a grantor or a beneficiary.',
      t2: 'Review the benefits of revocable and irrevocable trusts.',
      t3: 'Does your financial and income tax picture call for additional trusts?',
      t4: 'Does your estate tax exposure call for additional trusts?',
      t5: 'Do personal or family circumstances call for one, such as liability exposure or a child with special needs?',
      t6: 'Are your choices of trustee still the right ones?',
      t7: 'Have your trusts been reviewed against your state\'s law?',
      t8: 'How do today\'s tax rules affect your trusts?',
      w1: 'The signed will itself has been examined.',
      w2: 'Trusts for some beneficiaries, rather than outright gifts.',
      w3: 'Periodic income for some beneficiaries.',
      w4: 'Whether the will uses the unlimited marital deduction as effectively as practical.',
      w5: 'Provisions for marital and non-marital trusts in the will.',
      w6: 'Custody of minor children.',
      w7: 'Holding a minor\'s share until adulthood.',
      w8: 'Guardianship or a trust for a beneficiary with a disability, or one who cannot manage their own affairs.',
      w9: 'Funeral or memorial wishes.',
      w10: 'Which assets will pay debts, funeral and administration costs.',
      w11: 'Whether the will is up to date.',
      w12: 'A bypass trust provision.',
      w13: 'Charitable bequests.',
      w14: 'Successor or alternate beneficiaries.',
      w15: 'A common disaster provision.',
      w16: 'Referral to legal and tax counsel when needed.',
      d1: 'This checklist is for discussion only. It is not a solicitation or a recommendation; before acting, consult appropriately licensed professionals.',
      d2: 'This is not tax or legal advice. Your estate attorney and tax professional can advise you on your own situation and on current law.',
      d3: 'Any projections are hypothetical, are not guaranteed, and depend on the information you supply.',
      _notes: 'A will is not about death. It is about who decides: you, or a court.\n\n- Walk the five points, then open the Checklist to review it together or hand it to the estate attorney.\n- Ask: When did you last check who is named as the beneficiary on your life insurance?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b15-wills">
          ${[1, 2, 3, 4, 5].map((i) => `<div class="row"><span class="bul">${dart(92)}</span>${ctx.t('p' + i, { tag: 'div', cls: 'b15-card b15-flow card' })}</div>`).join('')}
          <button type="button" class="b15-link ck">${ctx.t('checklist')}</button>
        </div>`;
      ctx.on(ctx.$('.ck'), 'click', () => {
        const li = (keys) => `<ol>${keys.map((k) => `<li>${ctx.t(k)}</li>`).join('')}</ol>`;
        const ov = ctx.overlay({ title: ctx.t('ckTitle'), wide: true, html: `<div class="b15-check">
          ${ctx.t('ckSub', { tag: 'p', cls: 'sub' })}
          <div class="cols"><div><h3>${ctx.t('ckT')}</h3>${li(['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'])}</div>
          <div><h3>${ctx.t('ckW')}</h3>${li(Array.from({ length: 16 }, (_, i) => 'w' + (i + 1)))}</div></div>
          <div class="fine">${ctx.t('d1', { tag: 'p' })}${ctx.t('d2', { tag: 'p' })}${ctx.t('d3', { tag: 'p' })}</div></div>` });
        ov.querySelector('.st-overlay-in').style.maxHeight = '810px';
      });
    }
  });
  EFA.css('b15-wills', `
  .b15-wills { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: grid; gap: 22px; justify-items: center; }
  .b15-wills .row { display: grid; grid-template-columns: 92px 1120px; gap: 26px; align-items: center; }
  .b15-wills .bul { display: grid; place-items: center; }
  .b15-wills .card { padding: 22px 32px; font: 700 29px/1.32 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-wills .ck { margin-top: 16px; font-size: 22px; }
  `);

  /* ------------------------------------------------------------------ */
  /* pti1: key facts on term coverage, with protection shields on the PEM */
  /* ------------------------------------------------------------------ */
  const PTI_FACTS = [[0, 'f0'], [2, 'f2'], [4, 'f4'], [5, 'f5'], [6, 'f6'], [7, 'f7'], [8, 'f8']];
  /* shields over the model, as rectangles in model coordinates (left/top in % of the 67 x 36.5 em box,
     w/h in em), converted from the spec's stage positions (panel at top 2%, scaled 90%) */
  const PTI_SHIELDS = {
    bf: { left: 61.3, top: 31.9, w: 8.9, h: 11.1 },
    cap: { left: 2.8, top: 28.6, w: 11.7, h: 13.9 },
    life: { left: 47.0, top: 72.2, w: 5.6, h: 6.7 }
  };
  function shieldArt() {
    const pem = LIB().pem;
    if (pem && pem.art && pem.art.shield) { try { return pem.art.shield({}); } catch (e) { /* fall through to our own */ } }
    const id = nid('sh');
    return `<svg viewBox="0 0 100 120" width="100%" height="100%" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.navy4}"/><stop offset="1" stop-color="${P.navy3}"/></linearGradient></defs>
      <path d="M50 4 L92 18 C92 64 76 96 50 116 C24 96 8 64 8 18 Z" fill="url(#${id})" fill-opacity=".86" stroke="${P.gold}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M50 16 L80 26 C80 60 68 86 50 102 C32 86 20 60 20 26 Z" fill="none" stroke="${P.goldLt}" stroke-width="2.5" opacity=".7"/>
      <path d="M34 60 L46 72 L68 46" fill="none" stroke="${P.goldLt}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  screen('pti1', {
    title: 'Key facts on term coverage, with protection shields',
    steps: 10,
    copy: {
      head: 'What Every Term Insurance Buyer Should Know',
      f0: 'A lender may require term coverage as security for money you borrow.',
      f2: 'It can protect your family against the loss of your future income and the obligations of your lifestyle, such as the mortgage, credit balances and final expenses.',
      f4: 'The death benefit is generally income-tax-free to your beneficiary under current tax law, subject to applicable requirements.',
      f5: 'It has the lowest starting premium for a given amount of coverage.',
      f6: 'It is built to last for a limited period of time.',
      f7: 'Very few term policies ever pay a death claim.',
      f8: 'Financially, the best day to own term coverage is the day it starts.',
      pemLoading: 'The economic model is loading.',
      _notes: 'Term insurance does an important job, and it is built for a limited time. Walk the facts one at a time.\n\n- On the model, show what term coverage protects: first the borrowed money, then your lifetime earning power and your lifestyle.\nPAUSE\n\n- Ask: Which of these facts had you never heard before?'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head', 'sm')}
        <div class="b15-pti list">${PTI_FACTS.map(([id, k]) => `<div class="row b15-fade" data-at="${id + 1}"><span class="bul">${dart(70)}</span>${ctx.t(k, { tag: 'div', cls: 'b15-card b15-flow card' })}</div>`).join('')}</div>
        <div class="b15-pti-pem b15-fade is-off"></div>`;
      const host = ctx.$('.b15-pti-pem');
      const pemLib = LIB().pem;
      ctx._pem = null;
      if (pemLib && pemLib.mount) {
        try {
          ctx._pem = pemLib.mount(ctx, host, { labels: false, links: true, collateral: 'house', showBorrowed: true, borrowSource: false, showHouse: true,
            risk: 33, safe: 33, house: 60, borrow: 50, standardLiving: false, scenarioPicker: false });
          const pem = ctx._pem;
          ctx._shields = Object.keys(PTI_SHIELDS).map((k) => {
            const el = pem.place(`<div class="b15-shield">${shieldArt()}</div>`, PTI_SHIELDS[k], { cls: 'b15-sh-' + k });
            return { k, el };
          });
        } catch (e) { console.error(e); ctx._pem = null; }
      }
      if (!ctx._pem) host.innerHTML = `<div class="b15-pending" style="position:absolute;inset:0"><span class="dot"></span>${ctx.t('pemLoading', { tag: 'p', attrs: 'style="margin:0"' })}</div>`;
    },
    step(ctx, n) {
      const pemMode = n === 2 || n === 4;
      ctx.show('.b15-pti', !pemMode);
      ctx.show('.b15-pti-pem', pemMode);
      ctx.$$('.b15-pti .row').forEach((r) => r.classList.toggle('is-off', !(n >= +r.dataset.at)));
      (ctx._shields || []).forEach(({ k, el }) => { if (el && el.style) { const on = n === 4 || (n === 2 && k === 'bf'); el.style.opacity = on ? '1' : '0'; el.style.pointerEvents = 'none'; } });
    }
  });
  EFA.css('b15-pti', `
  .b15-pti { position: absolute; left: 160px; right: 160px; top: 168px; display: grid; gap: 16px; transition: opacity .5s ease; }
  .b15-pti .row { display: grid; grid-template-columns: 70px 1fr; gap: 22px; align-items: center; }
  .b15-pti .bul { display: grid; place-items: center; }
  .b15-pti .card { padding: 15px 28px; font: 700 25px/1.32 "DM Sans", sans-serif; color: #0d1e3a; }
  .b15-pti-pem { position: absolute; left: 90px; right: 90px; top: 134px; bottom: 40px; }
  .b15-shield { width: 100%; height: 100%; filter: drop-shadow(0 6px 10px rgba(13,30,58,.35)); }
  .b15-shield svg { display: block; }
  [class*="b15-sh-"] { transition: opacity .5s ease; }
  `);

  /* ------------------------------------------------------------------ */
  /* pti2: how long the proceeds would last (the shared app-how-long screen) */
  /* ------------------------------------------------------------------ */
  if (LIB().howLong && LIB().howLong.screen) {
    LIB().howLong.screen('pti2', {
      title: 'How long would the policy proceeds last',
      notes: 'Before we talk about new coverage, see how far the coverage and savings already in place would carry your family.\n\n- Enter the coverage in force today and the savings set aside, then Calculate.\n- Ask: Is that enough time for the people who depend on you?\nPAUSE'
    });
  } else {
    screen('pti2', { title: 'How long would the policy proceeds last', copy: { loading: 'This calculator is loading.' },
      render(ctx) { ctx.el.innerHTML = `<div class="b15-pending" style="position:absolute;inset:0"><span class="dot"></span>${ctx.t('loading', { tag: 'p', attrs: 'style="margin:0"' })}</div>`; } });
  }
})();
