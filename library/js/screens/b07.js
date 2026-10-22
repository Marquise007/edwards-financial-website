/* Module b07: Government Intervention (gi1), History of Inflation (hoi1), Homeowners Insurance (homeins1),
   How Much is Enough (hm1-hm3), How Would You Like to Pay For It (evac1), Human Life Value (hlev1),
   IFR Tutorial (ifr1-ifr12), Income Tax (incTax1, incTax2), IUL Comparison Calculator (iulcc1, iulcc2).
   Structure, sequence and math follow the plain-words specs; drawings and wording are new. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, fmt = EFA.fmt;
  const esc = EFA.util.esc;
  const COST = '#b3402e';
  EFA.engines = EFA.engines || {};

  /* =====================================================================
     Styles
     ===================================================================== */
  EFA.css('b07', `
  .b07-head { position: absolute; left: 110px; right: 110px; top: 36px; display: grid; justify-items: center; gap: 12px; text-align: center; }
  .stage .b07-head .st-h1 { font-size: 56px; }
  .stage .b07-head.sm .st-h1 { font-size: 48px; }
  .b07-card { background: var(--paper); border: 1px solid var(--rule); border-radius: 14px; box-shadow: 0 10px 30px rgba(13,30,58,.07); box-sizing: border-box; }
  .b07-abs { position: absolute; box-sizing: border-box; }
  .b07-form { display: grid; padding: 14px 30px; }
  .b07-row { display: grid; grid-template-columns: 1fr 210px; align-items: center; column-gap: 24px; height: 52px; }
  .b07-row + .b07-row { border-top: 1px solid rgba(13,30,58,.07); }
  .b07-lb { font: 700 22px/1.15 var(--f-body); color: var(--navy); white-space: nowrap; display: flex; align-items: center; gap: 12px; min-width: 0; }
  .b07-in { height: 44px; width: 100%; box-sizing: border-box; border: 1.5px solid var(--mist-2); border-radius: 10px; background: #fff; padding: 0 14px;
    font: 600 22px/1 var(--f-body); color: var(--navy); text-align: right; font-variant-numeric: lining-nums tabular-nums; font-feature-settings: "lnum" 1, "tnum" 1; }
  .b07-in:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(184,151,46,.22); }
  .b07-in.txt { text-align: center; }
  .b07-in[disabled] { background: var(--cream); color: var(--muted); border-style: dashed; }
  .b07-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 50px; padding: 10px 30px; border-radius: 999px; border: 1px solid var(--navy);
    background: var(--navy); color: var(--cream); font: 600 20px/1.1 var(--f-body); letter-spacing: .02em; cursor: pointer; transition: background .2s ease, color .2s ease, transform .2s ease; }
  .b07-btn:hover { background: var(--gold); border-color: var(--gold); color: var(--navy); transform: translateY(-1px); }
  .b07-btn.sm { min-height: 36px; padding: 6px 16px; font-size: 16px; }
  .b07-btn.ghost { background: transparent; color: var(--navy); border-color: var(--mist-2); }
  .b07-btn.ghost:hover { border-color: var(--gold); background: var(--gold-pale); }
  .b07-btn[aria-pressed="true"] { background: var(--gold); border-color: var(--gold); color: var(--navy); }
  .b07-link { background: none; border: 0; padding: 0 0 2px; color: var(--gold-deep); font: 600 20px/1.2 var(--f-body); border-bottom: 1.5px dotted currentColor; cursor: pointer; letter-spacing: .01em; }
  .b07-link:hover { color: var(--navy); }
  .b07-link.big { font-size: 24px; }
  .b07-doclink { display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent; padding: 4px 2px; color: var(--gold-deep); font: 600 19px/1.2 var(--f-body); letter-spacing: .01em; cursor: pointer; }
  .b07-doclink > span { border-bottom: 1.5px dotted currentColor; }
  .b07-doclink:hover { color: var(--navy); }
  .b07-doclink svg { flex: 0 0 auto; }
  .b07-cost { color: ${COST}; }
  .b07-gain { color: var(--navy); }
  .b07-disc { position: absolute; left: 110px; bottom: 22px; max-width: 1040px; margin: 0; }
  .b07-hl { border: 3px solid var(--gold); border-radius: 14px; padding: 14px 26px; font: 600 34px/1.2 var(--f-display); color: var(--navy); background: #fff; }
  .b07-hl .num { font-weight: 700; color: var(--navy); }
  .b07-big { font: 700 30px/1.1 var(--f-body); color: var(--navy); }
  .b07-icon { width: 30px; height: 30px; border-radius: 50%; background: var(--navy); border: 0; padding: 0; display: inline-grid; place-items: center; cursor: pointer; flex: 0 0 auto; box-shadow: 0 3px 8px rgba(13,30,58,.25); }
  .b07-icon:hover { background: var(--gold); }
  .b07-icon svg { width: 18px; height: 18px; }
  .b07-scroll { overflow: auto; scrollbar-width: thin; scrollbar-color: var(--mist-2) transparent; }
  .b07-scroll::-webkit-scrollbar { width: 12px; height: 12px; }
  .b07-scroll::-webkit-scrollbar-thumb { background: var(--mist-2); border-radius: 6px; border: 3px solid var(--paper); }
  .b07-scroll thead th { position: sticky; top: 0; z-index: 2; }
  .b07-pend { color: var(--muted); font: 500 21px/1.45 var(--f-body); text-align: center; }
  .b07-skel { height: 14px; border-radius: 7px; background: linear-gradient(90deg, var(--mist) 0%, #eef1f6 50%, var(--mist) 100%); }
  .b07-modal { position: absolute; inset: 0; z-index: 35; background: rgba(13,30,58,.38); display: grid; place-items: center; animation: scr-in .2s ease both; }
  .b07-modal-in { background: var(--paper); border-radius: 16px; border: 1px solid var(--rule); box-shadow: 0 30px 80px rgba(8,20,42,.35); overflow: hidden; position: relative; }
  .b07-modal-h { padding: 20px 28px; background: var(--navy); color: var(--cream); font: 600 30px/1.1 var(--f-display); }
  .b07-modal-b { padding: 24px 30px; display: grid; gap: 16px; }
  .b07-modal-f { display: flex; justify-content: flex-end; gap: 12px; padding: 0 30px 24px; }
  .b07-x { position: absolute; right: 14px; top: 12px; width: 40px; height: 40px; border-radius: 999px; border: 1px solid var(--mist-2); background: #fff; color: var(--navy); font: 400 26px/1 var(--f-body); cursor: pointer; z-index: 2; }
  .b07-x:hover { background: var(--gold); border-color: var(--gold); }
  .b07-tip { position: absolute; z-index: 25; pointer-events: none; background: var(--navy); color: var(--cream); border-radius: 10px; padding: 8px 12px; font: 500 16px/1.3 var(--f-body);
    box-shadow: 0 10px 24px rgba(8,20,42,.3); white-space: nowrap; transform: translate(-50%, calc(-100% - 14px)); }
  .b07-tip b { display: block; font-weight: 700; color: var(--gold-lt); }
  .b07-ws-note { font: 600 16px/1.3 var(--f-body); color: var(--muted); }
  /* sliders */
  .b07-vs { position: absolute; width: 64px; touch-action: none; cursor: pointer; }
  .b07-vs-track { position: absolute; left: 50%; top: 0; bottom: 0; width: 10px; margin-left: -5px; border-radius: 5px; background: var(--mist-2); }
  .b07-vs-fill { position: absolute; left: 0; right: 0; top: 0; border-radius: 5px; background: var(--navy3, #1d3863); background: #1d3863; }
  .b07-vs-h { position: absolute; left: 50%; width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%; background: var(--gold); border: 3px solid #fff; box-shadow: 0 4px 12px rgba(13,30,58,.3); outline: none; }
  .b07-vs-h:focus-visible { box-shadow: 0 0 0 4px rgba(184,151,46,.35), 0 4px 12px rgba(13,30,58,.3); }
  .b07-vs-tip { position: absolute; left: 44px; top: 50%; transform: translateY(-50%); background: var(--navy); color: var(--cream); font: 700 16px/1 var(--f-body); border-radius: 6px; padding: 6px 8px; white-space: nowrap; }
  .b07-hs { position: absolute; height: 44px; touch-action: none; cursor: pointer; }
  .b07-hs .b07-vs-track { left: 0; right: 0; top: 50%; bottom: auto; width: auto; height: 10px; margin: -5px 0 0; }
  .b07-hs .b07-vs-fill { top: 0; bottom: 0; left: 0; right: auto; }
  .b07-hs .b07-vs-h { top: 50%; left: 0; }
  .b07-hs .b07-vs-tip { left: 50%; top: -34px; transform: translateX(-50%); }
  `);

  /* =====================================================================
     Small helpers
     ===================================================================== */
  const num = (s) => `<span class="num">${s}</span>`;
  const money = (v, dp) => fmt.money(v, { dp: dp || 0 });
  const pctTxt = (f, dp) => fmt.num(f * 100, dp == null ? 2 : dp) + '%';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const isNum = (v) => typeof v === 'number' && isFinite(v);

  /** safe lookup in EFA.data: first path that resolves wins */
  function D() {
    for (let i = 0; i < arguments.length; i++) {
      const parts = String(arguments[i]).split('.');
      let o = EFA.data;
      for (const p of parts) { if (o == null) break; o = o[p]; }
      if (o != null) return o;
    }
    return null;
  }

  /* ---------- per-client values shared across screens and presentations ("case data") ----------
     Same store as EFA.lib.caseData: EFA.clients namespace 'case', the original key names, money in
     dollars, percents as fractions. Keys other builders already use are reused so values stay in sync. */
  const CK = {
    age: ['case_file_current_age', 42], spouseAge: ['case_file_spouse_age', 40], retAge: ['case_file_retirement_age', 65],
    spouseLE: ['case_file_spouse_life_expectancy', 84],
    income: ['case_file_current_income', 102000], savings: ['case_file_accumulated_savings', 88000],
    rorDist: ['case_file_ror_distribution', 0.05, 1], rorAcc: ['case_file_ror_accumulation', 0.06, 1],
    infl: ['case_file_ror_inflation', 0.03, 1], tax: ['case_file_ror_taxes', 0.30, 1], years: ['time_period_in_years', 30],
    tempCov: ['temp_coverage_needed', 0],
    // the IFR tutorial set (account balance and taxable return are shared with the compound-interest screens)
    ifrB: ['account_balance', 100000], ifrR: ['taxable_return', 0.05, 1], ifrF: ['tax_favored_return', 0.05, 1],
    ifrO: ['opportunity_cost_return', 0.05, 1], ifrD: ['future_tax_bracket', 0.25, 1], ifrP: ['pay_down_period', 1],
    ifrName: ['increasing_strategy_name', ''], ifrFree: ['account2_tax_free', false], ifrIp: ['immediate_paydown_tax_free', false],
    // Income Tax (shared by incTax1 and incTax2)
    taxStatus: ['tax_filing_status', 1], taxGross: ['tax_gross_income', 0], taxStd: ['tax_use_standard_deduction', true],
    taxDed: ['tax_deduction_amount', null], taxTaxable: ['tax_taxable_income', 0]
  };
  const store = () => (EFA.lib && EFA.lib.caseData && EFA.lib.caseData.get) ? EFA.lib.caseData : { get: (k, d) => EFA.clients.get('case', k, d), set: (k, v) => EFA.clients.set('case', k, v) };
  const C = {
    get(name) {
      const [key, def, isPct] = CK[name];
      let v = store().get(key, def);
      if (v == null || v === '') return def;
      if (typeof def === 'number') { v = +v; if (!isFinite(v)) return def; if (isPct && Math.abs(v) > 1) v = v / 100; }
      return v;
    },
    set(name, v) { store().set(CK[name][0], v); }
  };
  EFA.engines.b07CaseKeys = Object.fromEntries(Object.entries(CK).map(([k, v]) => [k, v[0]]));

  /* ---------- shared components (EFA.lib, see docs/components.md), called through small guards ---------- */
  const LIB = (n) => (EFA.lib && EFA.lib[n]) || null;

  /** the "Documentation" opener: data is a function returning the worksheet object (read at click time) */
  function docBtn(ctx, data, style, look) {
    const ws = LIB('worksheet');
    if (ws && ws.button) return ws.button(ctx, { data, look: look || 'link', style });
    return `<button type="button" class="b07-doclink" data-docfb="1" style="${style || ''}">${ICON.sheet}<span>${ctx.t('doc')}</span></button>`;
  }
  /** open a worksheet now (used from choosers) */
  function openSheet(ctx, data) {
    const ws = LIB('worksheet');
    if (ws && ws.open) { try { ws.open(ctx, data); } catch (e) { console.error(e); } return; }
    ctx.toast(ctx.text('wsLoading'));
  }
  /** fallback wiring for docBtn while the shared worksheet is still loading */
  function wireDocFallback(ctx) { ctx.on(ctx.$$('[data-docfb]'), 'click', () => ctx.toast(ctx.text('wsLoading'))); }
  /** compliance line from the shared topics (hypothetical by default) */
  function discLine(ctx, topics, style) {
    const d = LIB('disclosure');
    if (d && d.line) return d.line(topics || ['hypothetical'], { cls: 'b07-disc', style: style || '' });
    return `<p class="st-disclaimer b07-disc" style="${style || ''}">${ctx.t('hypo')}</p>`;
  }
  /** first touch of a return-rate field opens the shared notice once per visit */
  function guardRate(ctx, el, flag) {
    const d = LIB('disclosure');
    if (d && d.guard && el) { try { d.guard(ctx, el, flag ? { flag } : undefined); } catch (e) { console.error(e); } }
  }
  /** a worksheet column: [field, copyKey, type, extra] -> column object */
  const col = (ctx, field, key, type, extra) => Object.assign({ field, header: ctx.t(key), type: type || 'money', dp: type === 'money' || !type ? 2 : undefined }, extra || {});

  /* ---------- fields: inputs bound to a stored value (several inputs may share one value) ---------- */
  function showVal(o, v) {
    if (o.type === 'text') return v == null ? '' : String(v);
    if (!isNum(v)) return '';
    switch (o.type) {
      case 'money': return fmt.money(v, { dp: o.dp || 0 });
      case 'pct': return fmt.num(v * 100, o.dp == null ? 2 : o.dp) + '%';
      case 'int': return String(Math.round(v));
      default: return fmt.num(v, o.dp || 0);
    }
  }
  function rawVal(o, v) {
    if (o.type === 'text') return v == null ? '' : String(v);
    if (!isNum(v)) return '';
    if (o.type === 'pct') return String(+(v * 100).toFixed(4));
    if (o.type === 'int') return String(Math.round(v));
    return String(+v.toFixed(o.dp || 2));
  }
  function parseVal(o, s) {
    if (o.type === 'text') return String(s);
    const v = fmt.parse(s, o.type === 'pct');
    if (!isFinite(v)) return NaN;
    if (o.type === 'int') return Math.round(v);
    if (o.type === 'money') { const k = Math.pow(10, o.dp || 0); return Math.round(v * k) / k; }
    if (o.type === 'pct') return Math.round(v * 1e6) / 1e6;
    return v;
  }
  /** HTML for one input. o: {id, type, get(), set(v), min, max, dp, cls, disclose, aria (copy key)} */
  function inp(ctx, o) {
    ctx._bf = ctx._bf || {};
    ctx._bf[o.id] = o;
    const v = o.get();
    return `<input class="b07-in ${o.type === 'text' ? 'txt' : ''} ${o.cls || ''}" data-bf="${esc(o.id)}" inputmode="${o.type === 'text' ? 'text' : 'decimal'}" autocomplete="off" spellcheck="false"${o.aria ? ` aria-label="${esc(ctx.text(o.aria))}"` : ''}${o.disabled ? ' disabled' : ''} value="${esc(showVal(o, v))}">`;
  }
  /** label + input row */
  function row(ctx, o, extra) {
    return `<div class="b07-row ${o.rowCls || ''}">${ctx.t(o.label, { tag: 'label', cls: 'b07-lb', attrs: `for="b07-${esc(ctx.id)}-${esc(o.id)}"` })}${inp(ctx, Object.assign({ aria: o.label }, o)).replace('<input ', `<input id="b07-${esc(ctx.id)}-${esc(o.id)}" `)}${extra || ''}</div>`;
  }
  /** wire every [data-bf] input under ctx.el. after(id, value) runs after each save. */
  function bindInputs(ctx, after) {
    ctx.$$('input[data-bf]').forEach((el) => {
      if (el._b07) return; el._b07 = 1;
      const o = ctx._bf[el.dataset.bf]; if (!o) return;
      el.addEventListener('focus', () => { el.value = rawVal(o, o.get()); setTimeout(() => { try { el.select(); } catch (e) { /* detached */ } }, 0); });
      if (o.disclose) guardRate(ctx, el, o.discFlag);
      el.addEventListener('input', () => {
        if (o.max == null || o.type === 'text') return;
        const v = parseVal(o, el.value);
        if (isFinite(v) && v > o.max) el.value = rawVal(o, o.max);
      });
      el.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); el.blur(); } });
      el.addEventListener('blur', () => {
        let v = parseVal(o, el.value);
        if (o.type !== 'text') {
          if (!isFinite(v)) v = el.value.trim() === '' ? (o.empty != null ? o.empty : 0) : o.get();
          if (o.max != null) v = Math.min(o.max, v);
          if (o.min != null) v = Math.max(o.min, v);
        }
        o.set(v);
        const nv = o.get();
        ctx.$$(`input[data-bf="${CSS.escape(o.id)}"]`).forEach((x) => { if (x !== document.activeElement || x === el) x.value = showVal(o, nv); });
        if (after) after(o.id, nv);
      });
    });
  }
  function setInput(ctx, id, v) {
    const o = ctx._bf && ctx._bf[id]; if (!o) return;
    o.set(v);
    ctx.$$(`input[data-bf="${CSS.escape(id)}"]`).forEach((x) => { x.value = showVal(o, o.get()); });
  }

  /* ---------- modal dialog inside the stage ----------
     o: {title (html), body (html), foot (html), width, closable (x + Esc), cls, onClose} -> element with .close() */
  function modal(ctx, o) {
    const m = document.createElement('div');
    m.className = 'b07-modal ' + (o.cls || '');
    m.innerHTML = `<div class="b07-modal-in" style="width:${o.width || 760}px">${o.closable ? '<button type="button" class="b07-x" aria-label="Close">&times;</button>' : ''}${o.title ? `<div class="b07-modal-h">${o.title}</div>` : ''}<div class="b07-modal-b">${o.body || ''}</div>${o.foot ? `<div class="b07-modal-f">${o.foot}</div>` : ''}</div>`;
    ctx.el.appendChild(m);
    const onKey = (e) => {
      if (EFA.edit && EFA.edit.on) return;
      if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); if (o.closable && o.esc !== false) close(); return; }
      const t = e.target, typing = !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)));
      if (!typing && /^(ArrowRight|ArrowLeft|PageDown|PageUp| |Spacebar|Home|End|Backspace)$/.test(e.key)) e.stopPropagation();
    };
    document.addEventListener('keydown', onKey, true);
    function close() { if (!m.isConnected) return; m.remove(); document.removeEventListener('keydown', onKey, true); if (o.onClose) o.onClose(); }
    const x = m.querySelector('.b07-x'); if (x) x.addEventListener('click', close);
    if (o.closable && o.backdrop !== false) m.addEventListener('click', (e) => { if (e.target === m && !(EFA.edit && EFA.edit.on)) close(); });
    m.close = close;
    EFA.numify(m);
    if (EFA.edit && EFA.edit.on) EFA.edit.arm(m);
    const prevLeave = ctx._b07leave; ctx._b07leave = () => { if (prevLeave) prevLeave(); document.removeEventListener('keydown', onKey, true); };
    return m;
  }

  /* ---------- sliders (vertical: value grows downward; horizontal: grows rightward) ----------
     o: {x, y, len, min, max, value, vertical, onInput(v)} -> html; call bindSlider after render */
  function slider(ctx, o) {
    const id = 'sl' + (ctx._slN = (ctx._slN || 0) + 1);
    ctx._sl = ctx._sl || {}; ctx._sl[id] = o;
    const pos = o.vertical ? `left:${o.x}px;top:${o.y}px;height:${o.len}px` : `left:${o.x}px;top:${o.y}px;width:${o.len}px`;
    return `<div class="${o.vertical ? 'b07-vs' : 'b07-hs'}" data-sl="${id}" style="${pos}"><div class="b07-vs-track"><div class="b07-vs-fill"></div></div><div class="b07-vs-h" tabindex="0" role="slider" aria-valuemin="${o.min}" aria-valuemax="${o.max}"><span class="b07-vs-tip num"></span></div></div>`;
  }
  function bindSliders(ctx) {
    ctx.$$('[data-sl]').forEach((el) => {
      if (el._b07) return; el._b07 = 1;
      const o = ctx._sl[el.dataset.sl]; const h = el.querySelector('.b07-vs-h');
      const paint = () => {
        const f = o.max > o.min ? (o.value - o.min) / (o.max - o.min) : 0;
        if (o.vertical) { h.style.top = (f * 100) + '%'; el.querySelector('.b07-vs-fill').style.height = (f * 100) + '%'; } else { h.style.left = (f * 100) + '%'; el.querySelector('.b07-vs-fill').style.width = (f * 100) + '%'; }
        h.querySelector('.b07-vs-tip').textContent = o.tip ? o.tip(o.value) : String(o.value);
        h.setAttribute('aria-valuenow', o.value);
      };
      o.set = (v, quiet) => { v = clamp(Math.round(v), o.min, o.max); const ch = v !== o.value; o.value = v; paint(); if (ch && !quiet && o.onInput) o.onInput(v); };
      o.setRange = (min, max) => { o.min = min; o.max = max; o.value = clamp(o.value, min, max); h.setAttribute('aria-valuemin', min); h.setAttribute('aria-valuemax', max); paint(); };
      const at = (e) => { const r = el.getBoundingClientRect(); const f = o.vertical ? (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width; return o.min + clamp(f, 0, 1) * (o.max - o.min); };
      el.addEventListener('pointerdown', (e) => { if (EFA.edit && EFA.edit.on) return; el.setPointerCapture(e.pointerId); o.drag = true; o.set(at(e)); h.focus({ preventScroll: true }); e.preventDefault(); });
      el.addEventListener('pointermove', (e) => { if (o.drag) o.set(at(e)); });
      const end = () => { o.drag = false; };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
      h.addEventListener('keydown', (e) => {
        const k = e.key; let d = 0;
        if (k === 'ArrowDown' || k === 'ArrowRight') d = 1; else if (k === 'ArrowUp' || k === 'ArrowLeft') d = -1;
        else if (k === 'PageDown') d = 5; else if (k === 'PageUp') d = -5;
        else if (k === 'Home') { e.stopPropagation(); e.preventDefault(); o.set(o.min); return; }
        else if (k === 'End') { e.stopPropagation(); e.preventDefault(); o.set(o.max); return; }
        if (!d) return;
        e.stopPropagation(); e.preventDefault(); o.set(o.value + d);
      });
      paint();
    });
  }

  /* ---------- hover tooltip for chart marks ---------- */
  function tipper(ctx) {
    let tip = null;
    return {
      show(e, html) {
        if (!tip) { tip = document.createElement('div'); tip.className = 'b07-tip'; ctx.el.appendChild(tip); }
        const r = ctx.el.getBoundingClientRect(), s = r.width / 1600;
        tip.innerHTML = html; tip.style.display = 'block';
        let x = (e.clientX - r.left) / s, y = (e.clientY - r.top) / s;
        x = clamp(x, 140, 1460);
        tip.style.left = x + 'px'; tip.style.top = Math.max(70, y) + 'px';
      },
      hide() { if (tip) tip.style.display = 'none'; }
    };
  }

  /* ---------- small drawn icons (no icon fonts) ---------- */
  const ICON = {
    hourglass: `<svg viewBox="0 0 24 24" fill="none" stroke="${P.cream}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10M7 21h10"/><path d="M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9"/></svg>`,
    rising: `<svg viewBox="0 0 24 24" fill="none" stroke="${P.cream}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18l5-5 4 3 7-8"/><path d="M15 8h5v5"/></svg>`,
    print: `<svg viewBox="0 0 24 24" fill="none" stroke="${P.cream}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/></svg>`,
    ext: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>`,
    sheet: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M4 9h16M4 14.5h16M10 9v11.5"/></svg>`,
    lines: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v16h16"/><path d="M7 15l4-4 3 2 6-6"/><path d="M7 18l5-3 3 1 5-4"/></svg>`,
    list: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/></svg>`
  };

  /** wording every calculator screen shares (merged into each screen's copy so Joshua can edit it per screen).
      These only show while a shared component is still loading. */
  const COMMON = {
    wsLoading: 'This panel is still loading. Please try again in a moment.',
    doc: 'Documentation',
    hypo: 'Hypothetical illustration only, not a guarantee or a projection of any specific product. Actual results will vary.'
  };
  const withCommon = (copy) => Object.assign({}, COMMON, copy);
  const leaveModals = (ctx) => { if (ctx._b07leave) ctx._b07leave(); };

  /* =====================================================================
     GI: gi1, the rules keep changing (federal acts since 1974)
     ===================================================================== */
  EFA.css('b07-gi', `
  .b07-gi { position: absolute; left: 160px; width: 1280px; top: 168px; height: 650px; overflow: hidden; display: grid; }
  .b07-gi .b07-scroll { height: 650px; }
  .stage .b07-gi .st-table td { font-size: 21px; padding: 11px 26px; }
  .stage .b07-gi .st-table th { font-size: 15px; padding: 15px 26px; }
  .stage .b07-gi .st-table th:first-child, .stage .b07-gi .st-table td:first-child { width: 75%; text-align: left; }
  .stage .b07-gi .st-table th:last-child, .stage .b07-gi .st-table td:last-child { width: 25%; text-align: center; }
  .b07-gi-pend { display: grid; gap: 22px; padding: 46px 60px; justify-items: center; }
  `);
  /** federal acts: accepts [{name, year}] / [{act, year}] / [[year, name]] under several possible keys */
  function taxActs() {
    const raw = D('history.taxActs', 'history.federalActs', 'taxActs', 'legislation.taxActs', 'history.taxLegislation');
    if (!Array.isArray(raw) || !raw.length) return null;
    const list = raw.map((x, i) => {
      if (Array.isArray(x)) return typeof x[0] === 'number' ? { year: x[0], name: x[1], i } : { year: x[1], name: x[0], i };
      return { year: +(x.year || x.enacted || x.y), name: x.name || x.act || x.title || '', acr: x.acronym || x.acr || '', i };
    }).filter((x) => x.name && isFinite(x.year));
    list.sort((a, b) => a.year - b.year || a.i - b.i);
    return list;
  }
  EFA.screen('gi1', {
    title: 'Federal tax-law change log',
    copy: {
      head: 'The Rules Keep Changing',
      colAct: 'Act', colYear: 'Enactment Year',
      pending: 'The list of federal acts is being verified against public law records. It will appear here as soon as it is confirmed.',
      _notes: 'Since ERISA in 1974, Congress has rewritten the tax and retirement rules again and again. Let the length of the list make the point; scroll slowly.\n\n- Ask: If the rules changed this often in the last fifty years, how sure are you that today\'s rules will still apply when you need your money?\nPAUSE\n\n- The point is not to predict the next change. It is to build a plan that can adapt to it.'
    },
    render(ctx) {
      const acts = taxActs();
      const body = acts
        ? acts.map((a) => `<tr><td>${esc(a.name)}${a.acr && a.name.indexOf('(' + a.acr + ')') < 0 ? ' (' + esc(a.acr) + ')' : ''}</td><td>${num(a.year)}</td></tr>`).join('')
        : `<tr><td colspan="2" style="background:var(--paper)"><div class="b07-gi-pend">${ctx.t('pending', { tag: 'p', cls: 'b07-pend', attrs: 'style="margin:0;max-width:760px"' })}${[78, 64, 84, 58, 72, 66, 80].map((w) => `<div class="b07-skel" style="width:${w}%"></div>`).join('')}</div></td></tr>`;
      ctx.el.innerHTML = `
        <div class="b07-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b07-gi b07-card"><div class="b07-scroll"><table class="st-table"><thead><tr><th>${ctx.t('colAct')}</th><th>${ctx.t('colYear')}</th></tr></thead><tbody>${body}</tbody></table></div></div>`;
    }
  });

  /* =====================================================================
     HOI: hoi1, annual inflation since 1914 with a two-year average picker
     ===================================================================== */
  EFA.css('b07-hoi', `
  .b07-hoi-l { position: absolute; left: 240px; width: 550px; top: 40px; display: grid; gap: 14px; }
  .stage .b07-hoi-l .st-h2 { text-align: center; font-size: 42px; }
  .b07-hoi-tab { height: 704px; }
  .stage .b07-hoi-tab .st-table td { font-size: 21px; padding: 9px 40px; cursor: pointer; transition: background .2s ease; }
  .stage .b07-hoi-tab .st-table th { padding: 14px 40px; font-size: 14px; }
  .stage .b07-hoi-tab .st-table th:first-child, .stage .b07-hoi-tab .st-table td:first-child { text-align: center; width: 40%; }
  .stage .b07-hoi-tab tbody tr:hover td { background: var(--mist) !important; }
  .stage .b07-hoi-tab tbody tr.span td { background: rgba(240,230,196,.5) !important; }
  .stage .b07-hoi-tab tbody tr.sel td { background: var(--gold-lt) !important; font-weight: 700; color: var(--navy); }
  .b07-hoi-r { position: absolute; left: 812px; width: 548px; top: 104px; display: grid; gap: 24px; align-content: start; }
  .b07-box { padding: 28px 32px; display: grid; gap: 14px; }
  .b07-hoi-instr { font: 500 25px/1.45 var(--f-body); color: var(--cream); margin: 0; }
  .b07-box.navy { background: var(--navy); border-color: var(--navy); }
  .b07-box .ey { font: 700 14px/1 var(--f-body); letter-spacing: .22em; text-transform: uppercase; color: var(--gold-lt); }
  .b07-hoi-res { display: grid; gap: 6px; }
  .b07-hoi-res .l { font: 500 22px/1.4 var(--f-body); color: var(--muted); }
  .b07-hoi-res .y { font: 700 44px/1.05 var(--f-body); color: var(--navy); }
  .b07-hoi-res .avg { font: 700 76px/1 var(--f-body); color: var(--gold-deep); margin-top: 6px; }
  .b07-hoi-src { font: 500 21px/1.5 var(--f-body); color: var(--navy); margin: 0; }
  .b07-hoi-foot { position: absolute; left: 812px; width: 548px; top: 760px; display: flex; justify-content: space-between; align-items: center; }
  `);
  /** BLS CPI-U annual-average percent change by year, rounded to one decimal as published */
  function inflationSeries() {
    const inf = LIB('inflation');
    if (inf && inf.series) { const s = inf.series(); if (Array.isArray(s) && s.length) return s.map((x) => ({ year: +x.year, rate: +x.rate })); }
    const direct = D('history.cpiUAnnualChange');   // fractions, one decimal of a percent as BLS prints it
    if (Array.isArray(direct) && direct.length > 10) {
      return direct.map(([y, f]) => ({ year: +y, rate: Math.round(f * 1000) / 10 })).filter((x) => x.year >= 1914 && isFinite(x.rate)).sort((a, b) => a.year - b.year);
    }
    const cpi = D('history.cpiU');
    if (!Array.isArray(cpi) || cpi.length < 10) return null;
    const by = {}; cpi.forEach(([y, v]) => { by[y] = v; });
    const out = [];
    Object.keys(by).map(Number).sort((a, b) => a - b).forEach((y) => {
      if (y < 1914 || by[y - 1] == null) return;
      out.push({ year: y, rate: Math.round((by[y] / by[y - 1] - 1) * 1000) / 10 });
    });
    return out;
  }
  EFA.engines.inflationHistory = inflationSeries;
  EFA.screen('hoi1', {
    title: 'Inflation history with two-year average',
    copy: {
      tableHead: 'Annual Inflation', colYear: 'Year', colRate: 'Inflation Rate %',
      instr: 'Pick a starting year and an ending year in the table to see the average inflation between them.',
      r1: 'Starting with the beginning of', r2: 'through the end of', r3: 'the average inflation for the period was',
      srcText: 'Source: U.S. Bureau of Labor Statistics, Consumer Price Index for All Urban Consumers (CPI-U), U.S. city average, all items, base period 1982-84 = 100. Annual inflation is the change in the annual average index from one year to the next.',
      srcLink: 'BLS Consumer Price Index data',
      source: 'Source', ret: 'Return',
      pending: 'Inflation figures are being verified against BLS data. They will appear here as soon as they are confirmed.',
      _notes: 'Every year since 1914, with its inflation rate. Pick any two years and the average appears.\n\n- Start with the year the client was born, or the year they started working, through last year.\n- Ask: What inflation rate are you assuming in your own plan, and where did that number come from?\nPAUSE'
    },
    render(ctx) {
      const series = inflationSeries();
      const srcUrl = (EFA.data && EFA.data.sources && EFA.data.sources['history.cpiU'] && EFA.data.sources['history.cpiU'].url) || 'https://www.bls.gov/cpi/';
      ctx.el.innerHTML = `
        <div class="b07-hoi-l">${ctx.t('tableHead', { tag: 'h2', cls: 'st-h2' })}
          <div class="b07-card b07-scroll b07-hoi-tab"><table class="st-table"><thead><tr><th>${ctx.t('colYear')}</th><th>${ctx.t('colRate')}</th></tr></thead><tbody>
          ${series ? series.map((r) => `<tr data-y="${r.year}"><td>${num(r.year)}</td><td>${num(r.rate.toFixed(2))}</td></tr>`).join('')
            : `<tr><td colspan="2" style="background:var(--paper);cursor:default"><div class="b07-gi-pend">${ctx.t('pending', { tag: 'p', cls: 'b07-pend', attrs: 'style="margin:0"' })}${[70, 56, 74, 62, 68].map((w) => `<div class="b07-skel" style="width:${w}%"></div>`).join('')}</div></td></tr>`}
          </tbody></table></div></div>
        <div class="b07-hoi-r">
          <div class="b07-card b07-box navy main-v"><p class="b07-hoi-instr">${ctx.t('instr')}</p></div>
          <div class="b07-card b07-box main-v res fade is-off"><div class="b07-hoi-res">
            <span class="l">${ctx.t('r1')}</span><span class="y a"></span>
            <span class="l two">${ctx.t('r2')}</span><span class="y b two"></span>
            <span class="l two">${ctx.t('r3')}</span><span class="avg two"></span></div></div>
          <div class="b07-card b07-box src-v" hidden><p class="b07-hoi-src">${ctx.t('srcText')}</p><a class="b07-link" href="${esc(srcUrl)}" target="_blank" rel="noopener">${ctx.t('srcLink')}</a></div>
        </div>
        <div class="b07-hoi-foot"><button type="button" class="b07-link" data-src="1">${ctx.t('source')}</button><button type="button" class="b07-btn sm" data-ret="1" hidden>${ctx.t('ret')}</button></div>`;
      const pair = [];
      const paint = () => {
        const sorted = pair.slice().sort((a, b) => a - b);
        ctx.$$('tr[data-y]').forEach((tr) => {
          const y = +tr.dataset.y;
          tr.classList.toggle('sel', pair.indexOf(y) >= 0);
          tr.classList.toggle('span', sorted.length === 2 && y > sorted[0] && y < sorted[1]);
        });
        ctx.show('.res', pair.length > 0);
        if (!pair.length) return;
        ctx.$('.res .a').innerHTML = num(sorted[0]);
        ctx.$$('.res .two').forEach((n) => { n.hidden = sorted.length < 2; });
        if (sorted.length === 2) {
          const [A0, B0] = sorted, inSpan = series.filter((r) => r.year >= A0 && r.year <= B0);
          const avg = inSpan.reduce((s, r) => s + r.rate, 0) / (B0 - A0 + 1);
          ctx.$('.res .b').innerHTML = num(B0);
          ctx.$('.res .avg').innerHTML = num(avg.toFixed(2) + '%');
        }
      };
      ctx.on(ctx.$$('tr[data-y]'), 'click', (e, tr) => {
        if (pair.length === 2) pair.length = 0;
        pair.push(+tr.dataset.y);
        paint();
      });
      const srcView = (on) => {
        ctx.$$('.main-v').forEach((n) => { n.hidden = on; });
        ctx.$('.src-v').hidden = !on; ctx.$('[data-ret]').hidden = !on; ctx.$('[data-src]').hidden = on;
      };
      ctx.on(ctx.$('[data-src]'), 'click', () => srcView(true));
      ctx.on(ctx.$('[data-ret]'), 'click', () => srcView(false));
    }
  });

  /* =====================================================================
     HOMEINS: homeins1, current vs. alternative homeowners policy
     ===================================================================== */
  EFA.css('b07-hi', `
  .b07-hi { position: absolute; left: 160px; width: 1280px; top: 34px; }
  .b07-hi-tabs { display: flex; justify-content: space-between; }
  .b07-hi-tab { width: 300px; height: 52px; display: grid; place-items: center; background: var(--navy); color: var(--cream); border-radius: 14px 14px 0 0;
    font: 700 21px/1 var(--f-body); letter-spacing: .14em; text-transform: uppercase; }
  .b07-hi-tab.alt { background: var(--gold); color: var(--navy); }
  .b07-hi-card { border-top-left-radius: 0; border-top-right-radius: 0; padding: 8px 34px 6px; }
  .b07-hi-row { display: grid; grid-template-columns: 230px 1fr 230px; align-items: center; height: 60px; column-gap: 26px; }
  .b07-hi-row + .b07-hi-row { border-top: 1px solid rgba(13,30,58,.07); }
  .b07-hi-row .lab { text-align: center; font: 700 23px/1.1 var(--f-body); color: var(--navy); }
  .b07-hi-row .b07-in { height: 46px; }
  .b07-hi-row.band { border-top: 2px solid var(--gold); height: 66px; }
  .b07-hi-row.band .lab { color: var(--gold-deep); }
  .b07-hi-pct { display: flex; justify-content: center; align-items: center; height: 46px; font: 700 26px/1 var(--f-body); color: var(--navy); }
  .b07-hi-age { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; font: 600 23px/1 var(--f-body); color: var(--navy); }
  .b07-hi-age .b07-in { width: 90px; text-align: center; }
  .b07-hi-act { margin-top: 18px; display: grid; justify-items: center; }
  .b07-hi-res { width: 1200px; display: grid; gap: 10px; }
  .b07-hi-text { height: 202px; padding: 18px 32px; background: var(--paper); display: grid; gap: 8px; align-content: center; }
  .b07-hi-text p { margin: 0; font: 700 21px/1.4 var(--f-body); color: var(--navy); }
  .b07-hi-text .v { color: var(--gold-deep); }
  .b07-hi-links { display: flex; justify-content: space-around; }
  .b07-chk { margin: 0; padding-left: 34px; display: grid; gap: 12px; font: 500 23px/1.4 var(--f-body); color: var(--navy); }
  .b07-chk li::marker { font-weight: 700; color: var(--gold-deep); }
  .b07-chk-disc { border-top: 1px solid var(--rule); padding-top: 16px; display: grid; gap: 8px; }
  .b07-chk-disc p { margin: 0; font: 400 16px/1.45 var(--f-body); color: var(--muted); }
  .b07-chk-disc b { color: var(--navy); }
  `);
  function homeinsCalc(v) {
    const r = v.oppRate, n = Math.max(0, Math.round(v.endAge - v.beginAge));
    const D0 = v.currentPremium - v.altPremium;
    const OC = n === 0 ? 0 : (r === 0 ? D0 * n : D0 * (1 + r) * (Math.pow(1 + r, n) - 1) / r);
    const rows = []; let E = 0, cc = 0, ca = 0;
    for (let i = 0; i < n; i++) {
      const S = E + D0, I = S * r; E = S + I; cc += v.currentPremium; ca += v.altPremium;
      rows.push({ age: v.beginAge + i, cur: v.currentPremium, cumCur: cc, alt: v.altPremium, cumAlt: ca, diff: D0, start: S, int: I, end: E, year: i + 1 });
    }
    return { n, D: D0, OC, TC: n * v.currentPremium, TA: n * v.altPremium, rows, pctCur: v.houseValue ? v.currentPremium / v.houseValue : null, pctAlt: v.houseValue ? v.altPremium / v.houseValue : null };
  }
  EFA.engines.homeins = homeinsCalc;
  EFA.screen('homeins1', {
    title: 'Homeowners insurance: current vs. alternative',
    copy: withCommon({
      tabCur: 'Current', tabAlt: 'Alternative',
      rLimits: 'Protection Limits', rValue: 'House Value', rDed: 'Deductible', rPrem: 'Annual Premium', rOpp: 'Opportunity Cost %', rPct: 'Premium as % of Value',
      none: 'None', calcSmall: 'Calculate',
      ageA: 'Compare from age', ageB: 'to age',
      calc: 'Calculate',
      s1: 'Your yearly difference in premiums is',
      s2: 'The opportunity cost of that difference is', s2b: 'That is', s2c: 'a year, growing at', s2d: 'for', s2e: 'years.',
      s3: 'Total premiums paid in the current scenario:',
      s4: 'Total premiums paid in the alternative scenario:',
      checklist: 'Checklist',
      chkTitle: 'Homeowners Insurance Checklist',
      c1: 'Confirm the dwelling coverage is enough to rebuild the home at today\'s costs.',
      c2: 'Confirm whether the policy pays replacement cost or actual cash value.',
      c3: 'Decide whether an inflation-guard endorsement is needed.',
      c4: 'Confirm the correct policy form is in force.',
      c5: 'Consider whether disaster coverage, such as flood or earthquake, is warranted.',
      c6: 'Review liability limits, including how an umbrella liability policy would fit.',
      c7: 'Make and record recommendations for the client.',
      dLabel: 'Disclosure:',
      d1: 'These calculators illustrate general principles. They are not a solicitation or a recommendation of any product or strategy. Please consult a properly licensed professional about your own situation.',
      d2: 'This material is not tax or legal advice.',
      d3: 'Projections are hypothetical and returns are not guaranteed. Results depend on the information you provide.',
      wsTitle: 'Premium Difference Accumulated at Interest',
      wAge: 'Age', wCur: 'Current Premiums', wCumCur: 'Total Current Premiums', wAlt: 'Alternative Premiums', wCumAlt: 'Total Alternative Premiums', wDiff: 'Difference in Premiums',
      wStart: 'Difference Balance, Start of Year', wInt: 'Interest on Balance', wEnd: 'Difference Balance, End of Year', wYear: 'Year',
      _notes: 'Most people never compare what a higher deductible saves them over time. Enter both policies, then a span of ages.\n\n- Ask: If you kept the difference in premiums and let it grow, what would it be worth by the time you retire?\nPAUSE\n\n- Use the Checklist to walk the coverage review before any change is made.'
    }),
    render(ctx) {
      const m = (k, d) => ctx.mem(k, d);
      const V = () => ({
        houseValue: m('houseValue', 200000), currentPremium: m('currentPremium', 1000), altPremium: m('altPremium', 500),
        oppRate: C.get('rorAcc'), beginAge: m('beginAge', 45), endAge: m('endAge', 65)
      });
      const per = (k, d, type, extra) => Object.assign({ id: k, type, get: () => ctx.mem(k, d), set: (v) => ctx.remember(k, v) }, extra || {});
      const F = {
        curLim: per('currentLimits', '150K/300K', 'text', { aria: 'rLimits' }), altLim: per('altLimits', '150K/300K', 'text', { aria: 'rLimits' }),
        value: per('houseValue', 200000, 'money', { aria: 'rValue', min: 0 }),
        curDed: per('currentDeductible', 250, 'money', { aria: 'rDed', min: 0 }), altDed: per('altDeductible', 1000, 'money', { aria: 'rDed', min: 0 }),
        curPrem: per('currentPremium', 1000, 'money', { aria: 'rPrem', min: 0 }), altPrem: per('altPremium', 500, 'money', { aria: 'rPrem', min: 0 }),
        opp: { id: 'oppRate', type: 'pct', aria: 'rOpp', max: 0.12, min: 0, disclose: true, get: () => C.get('rorAcc'), set: (v) => C.set('rorAcc', v) },
        a0: per('beginAge', 45, 'int', { aria: 'ageA', min: 1 }), a1: per('endAge', 65, 'int', { aria: 'ageB', min: 1 })
      };
      const rowH = (lab, l, r, cls) => `<div class="b07-hi-row ${cls || ''}">${l}${ctx.t(lab, { cls: 'lab' })}${r}</div>`;
      ctx.el.innerHTML = `
        <div class="b07-hi">
          <div class="b07-hi-tabs"><div class="b07-hi-tab">${ctx.t('tabCur')}</div><div class="b07-hi-tab alt">${ctx.t('tabAlt')}</div></div>
          <div class="b07-card b07-hi-card">
            ${rowH('rLimits', inp(ctx, F.curLim), inp(ctx, F.altLim))}
            ${rowH('rValue', inp(ctx, F.value), inp(ctx, F.value))}
            ${rowH('rDed', inp(ctx, F.curDed), inp(ctx, F.altDed))}
            ${rowH('rPrem', inp(ctx, F.curPrem), inp(ctx, F.altPrem))}
            ${rowH('rOpp', inp(ctx, F.opp), inp(ctx, F.opp))}
            ${rowH('rPct', `<div class="b07-hi-pct" data-side="cur"><button type="button" class="b07-btn sm ghost" data-pct="cur">${ctx.t('calcSmall')}</button><span class="v" hidden></span></div>`,
              `<div class="b07-hi-pct" data-side="alt"><button type="button" class="b07-btn sm ghost" data-pct="alt">${ctx.t('calcSmall')}</button><span class="v" hidden></span></div>`, 'band')}
          </div>
          <div class="b07-hi-age">${ctx.t('ageA')} ${inp(ctx, F.a0)} ${ctx.t('ageB')} ${inp(ctx, F.a1)}</div>
          <div class="b07-hi-act">
            <button type="button" class="b07-btn" data-calc="1">${ctx.t('calc')}</button>
            <div class="b07-hi-res" hidden>
              <div class="b07-card b07-scroll b07-hi-text"></div>
              <div class="b07-hi-links"><button type="button" class="b07-doclink" data-chk="1">${ICON.list}<span>${ctx.t('checklist')}</span></button>${docBtn(ctx, () => sheet())}</div>
            </div>
          </div>
        </div>
        ${discLine(ctx)}`;
      const shown = { cur: false, alt: false, res: false };
      const paint = () => {
        const v = V(), c = homeinsCalc(v);
        ['cur', 'alt'].forEach((s) => {
          const box = ctx.$(`.b07-hi-pct[data-side="${s}"]`), pv = s === 'cur' ? c.pctCur : c.pctAlt;
          box.querySelector('button').hidden = shown[s];
          const out = box.querySelector('.v'); out.hidden = !shown[s];
          out.innerHTML = pv == null ? ctx.t('none') : num(pctTxt(pv, 2));
        });
        ctx.$('[data-calc]').hidden = shown.res; ctx.$('.b07-hi-res').hidden = !shown.res;
        if (!shown.res) return;
        ctx.$('.b07-hi-text').innerHTML = `
          <p>${ctx.t('s1')} <span class="v">${num(money(c.D))}</span>.</p>
          <p>${ctx.t('s2')} <span class="v">${num(money(c.OC))}</span>. ${ctx.t('s2b')} ${num(money(c.D))} ${ctx.t('s2c')} ${num(pctTxt(v.oppRate, 2))} ${ctx.t('s2d')} ${num(c.n)} ${ctx.t('s2e')}</p>
          <p>${ctx.t('s3')} <span class="v">${num(money(c.TC))}</span></p>
          <p>${ctx.t('s4')} <span class="v">${num(money(c.TA))}</span></p>`;
        EFA.numify(ctx.$('.b07-hi-text'));
        if (EFA.edit && EFA.edit.on) EFA.edit.arm(ctx.$('.b07-hi-text'));
      };
      bindInputs(ctx, paint);
      ctx.on(ctx.$$('[data-pct]'), 'click', (e, b) => { shown[b.dataset.pct] = true; paint(); });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { shown.res = true; paint(); });
      ctx.on(ctx.$('[data-chk]'), 'click', () => {
        modal(ctx, {
          width: 1440, closable: true, title: ctx.t('chkTitle'),
          body: `<ol class="b07-chk">${[1, 2, 3, 4, 5, 6, 7].map((i) => `<li>${ctx.t('c' + i)}</li>`).join('')}</ol>
            <div class="b07-chk-disc"><p><b>${ctx.t('dLabel')}</b> ${ctx.t('d1')}</p><p>${ctx.t('d2')}</p><p>${ctx.t('d3')}</p></div>`
        });
      });
      function sheet() {
        const c = homeinsCalc(V());
        return {
          heading: ctx.t('wsTitle'), size: 'full',
          columns: [col(ctx, 'age', 'wAge', 'age', { width: 80 }), col(ctx, 'cur', 'wCur'), col(ctx, 'cumCur', 'wCumCur'), col(ctx, 'alt', 'wAlt'), col(ctx, 'cumAlt', 'wCumAlt'),
            col(ctx, 'diff', 'wDiff'), col(ctx, 'start', 'wStart'), col(ctx, 'int', 'wInt'), col(ctx, 'end', 'wEnd', 'money', { dp: 2 }), col(ctx, 'year', 'wYear', 'year', { width: 80 })],
          rows: c.rows, highlight: 'end'
        };
      }
      wireDocFallback(ctx);
      paint();
    },
    leave: leaveModals
  });

  /* =====================================================================
     Shared calculator layout (hm3, hlev1)
     ===================================================================== */
  EFA.css('b07-calc', `
  .b07-calc-card { position: absolute; }
  .b07-calc-act { position: absolute; left: 0; right: 0; display: grid; justify-items: center; }
  .b07-calc-res { position: absolute; padding: 26px 44px; display: grid; gap: 14px; justify-items: center; text-align: center; }
  .b07-calc-res p { margin: 0; font: 500 25px/1.45 var(--f-body); color: var(--navy); }
  .b07-calc-res .em { font-weight: 700; color: var(--gold-deep); }
  .b07-calc-res .small { font-size: 20px; color: var(--muted); }
  .b07-docl { position: absolute; }
  .b07-row.b07-r48 { height: 48px; }
  `);

  /* =====================================================================
     HM: hm3, coverage that funds an income rising with inflation
     ===================================================================== */
  /** lump sum X (added to savings) that funds W_k = income(1+i)^k, k = 0..N-1, drawn at the start of each year, ending at zero */
  function hm3Calc(v) {
    const r = v.ror, i = v.inflation, N = Math.round(v.spouseLE - v.spouseAge + 1);
    if (!(N > 0) || !isFinite(r) || r <= -1) return { ok: false, N };
    let pvNeed = 0;
    for (let k = 0; k < N; k++) pvNeed += v.income * Math.pow(1 + i, k) / Math.pow(1 + r, k);
    const X = pvNeed - v.savings;
    if (!isFinite(X)) return { ok: false, N };
    const rows = []; let B = v.savings + X;
    for (let k = 0; k < N; k++) {
      const W = v.income * Math.pow(1 + i, k), after = B - W, g = after * r, end = after + g;
      rows.push({ age: v.spouseAge + k, start: B, W, after, g, end }); B = end;
    }
    return { ok: true, X, N, rows };
  }
  EFA.engines.hmInflation = hm3Calc;
  EFA.screen('hm3', {
    title: 'How much is enough, counting inflation',
    steps: 2,
    copy: withCommon({
      head: 'How Much Is Enough Once Inflation Is Counted?',
      lIncome: 'Annual Income Required', lSavings: 'Accumulated Savings', lRor: 'Investment Return', lAge: 'Spouse Age', lLE: 'Spouse Life Expectancy', lInfl: 'Inflation Rate',
      calc: 'Calculate',
      r1: 'It would take', r2: 'of coverage, on top of the', r3: 'you have already saved, for your family to draw', r4: 'a year, rising with inflation, for the', r5: 'years required.',
      taxLine: 'Income taxes on the withdrawals are not considered.',
      fail: 'We could not reach an answer after many attempts. Please double-check that the assumptions are realistic.',
      wsTitle: 'How Much Is Enough Considering Inflation?',
      wAge: 'Spouse Age', wStart: 'Balance Before Withdrawal', wW: 'Annual Withdrawal', wAfter: 'Balance After Withdrawal', wG: 'Interest or Earnings', wEnd: 'Balance at End of Year',
      _notes: 'This answers the question most families never ask: how much would it really take for the income to keep its buying power for the rest of a spouse\'s life?\n\n- Ask: If your income stopped tomorrow, how many years would your family need it to continue, and should it keep up with prices?\nPAUSE\n\n- The life expectancy and inflation icons fill in those two rows from published tables.'
    }),
    render(ctx) {
      const F = {
        income: { id: 'income', label: 'lIncome', type: 'money', min: 0, get: () => C.get('income'), set: (v) => C.set('income', v) },
        savings: { id: 'savings', label: 'lSavings', type: 'money', min: 0, get: () => C.get('savings'), set: (v) => C.set('savings', v) },
        ror: { id: 'ror', label: 'lRor', type: 'pct', max: 0.12, disclose: true, get: () => C.get('rorDist'), set: (v) => C.set('rorDist', v) },
        age: { id: 'spouseAge', label: 'lAge', type: 'int', min: 1, max: 120, get: () => C.get('spouseAge'), set: (v) => C.set('spouseAge', v) },
        le: { id: 'spouseLE', label: 'lLE', type: 'int', min: 1, max: 125, get: () => C.get('spouseLE'), set: (v) => C.set('spouseLE', v) },
        infl: { id: 'inflation', label: 'lInfl', type: 'pct', get: () => C.get('infl'), set: (v) => C.set('infl', v) }
      };
      const vals = () => ({ income: F.income.get(), savings: F.savings.get(), ror: F.ror.get(), spouseAge: F.age.get(), spouseLE: F.le.get(), inflation: F.infl.get() });
      const leL = LIB('lifeExpectancy'), infL = LIB('inflation');
      const leIcon = leL && leL.link ? leL.link(ctx, { look: 'dot', onUse: (age) => { setInput(ctx, 'spouseLE', Math.round(+age)); paint(); } })
        : `<button type="button" class="b07-icon" data-fb="1" aria-label="${esc(ctx.text('lLE'))}">${ICON.hourglass}</button>`;
      const infIcon = infL && infL.link ? infL.link(ctx, { look: 'dot', onUse: (f) => { setInput(ctx, 'inflation', Math.round(+f * 1e6) / 1e6); paint(); } })
        : `<button type="button" class="b07-icon" data-fb="1" aria-label="${esc(ctx.text('lInfl'))}">${ICON.rising}</button>`;
      const lbl = (o, ic) => `<div class="b07-row"><span class="b07-lb">${ctx.t(o.label, { tag: 'label', attrs: `for="b07-hm3-${o.id}"` })}${ic || ''}</span>${inp(ctx, Object.assign({ aria: o.label }, o)).replace('<input ', `<input id="b07-hm3-${o.id}" `)}</div>`;
      const sheet = () => {
        const v = vals(), c = hm3Calc(v);
        return {
          heading: ctx.t('wsTitle'), size: 'full',
          columns: [col(ctx, 'age', 'wAge', 'age', { width: 90 }), col(ctx, 'start', 'wStart'), col(ctx, 'W', 'wW'), col(ctx, 'after', 'wAfter'), col(ctx, 'g', 'wG'), col(ctx, 'end', 'wEnd')],
          rows: c.ok ? c.rows : [],
          assumptions: [
            { label: ctx.t('lIncome'), value: money(v.income) }, { label: ctx.t('lSavings'), value: money(v.savings) },
            { label: ctx.t('lRor'), value: pctTxt(v.ror, 2) }, { label: ctx.t('lInfl'), value: pctTxt(v.inflation, 2) },
            { label: ctx.t('lAge'), value: String(v.spouseAge) }, { label: ctx.t('lLE'), value: String(v.spouseLE) }
          ]
        };
      };
      ctx.el.innerHTML = `
        <div class="b07-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b07-card b07-form b07-calc-card" style="left:400px;top:150px;width:800px">
          ${lbl(F.income)}${lbl(F.savings)}${lbl(F.ror)}${lbl(F.age)}${lbl(F.le, leIcon)}${lbl(F.infl, infIcon)}
        </div>
        <div class="b07-calc-act s0 fade" style="top:532px"><button type="button" class="b07-btn" data-calc="1">${ctx.t('calc')}</button></div>
        <div class="b07-card b07-calc-res s1 fade is-off" style="left:184px;top:524px;width:1232px"></div>
        <div class="s1 fade is-off" data-docw="1">${docBtn(ctx, sheet, 'position:absolute;right:200px;top:724px')}</div>
        ${discLine(ctx)}`;
      const paint = () => {
        const v = vals(), c = hm3Calc(v), box = ctx.$('.b07-calc-res');
        if (c.ok && ctx.step >= 1) C.set('tempCov', Math.round(c.X));
        box.innerHTML = c.ok
          ? `<p>${ctx.t('r1')} <span class="em">${num(money(c.X))}</span> ${ctx.t('r2')} ${num(money(v.savings))} ${ctx.t('r3')} ${num(money(v.income))} ${ctx.t('r4')} ${num(c.N)} ${ctx.t('r5')}</p><p class="small">${ctx.t('taxLine')}</p>`
          : `<p>${ctx.t('fail')}</p>`;
        ctx.$('[data-docw]').hidden = !c.ok;
        EFA.numify(box); if (EFA.edit && EFA.edit.on) EFA.edit.arm(box);
      };
      ctx._paint = paint;
      bindInputs(ctx, paint);
      ctx.on(ctx.$('[data-calc]'), 'click', () => ctx.next());
      ctx.on(ctx.$$('[data-fb]'), 'click', () => ctx.toast(ctx.text('wsLoading')));
      wireDocFallback(ctx);
      paint();
    },
    step(ctx, n) {
      if (n === 1 && ctx._paint) ctx._paint();
      ctx.show('.s0', n === 0); ctx.show('.s1', n === 1);
    },
    leave: leaveModals
  });

  /* =====================================================================
     HLEV: hlev1, human life economic value
     ===================================================================== */
  function hlevCalc(v) {
    const N = Math.round(v.retAge - v.age), g = v.g, rows = [];
    if (!(N > 0)) return { V: 0, N: Math.max(0, N), rows };
    let cum = 0;
    for (let k = 0; k < N; k++) {
      const grow = Math.pow(1 + g, k), inc = v.income * grow, mnt = inc * v.selfPct, fr = v.fringe * grow, sv = v.service * grow;
      const sup = inc - mnt + fr + sv, pv = sup / Math.pow(1 + v.d, k); cum += pv;
      rows.push({ age: v.age + k, inc, mnt: -mnt, fr, sv, sup, pv, cum, year: k + 1 });
    }
    return { V: Math.round(cum), N, rows };
  }
  EFA.engines.humanLifeValue = hlevCalc;
  EFA.screen('hlev1', {
    title: 'Human life economic value',
    copy: withCommon({
      head: 'Your Human Life Economic Value',
      lAge: 'Current Age', lRet: 'Retirement Age', lInc: 'Current Income', lG: 'Income Growth', lFr: 'Fringe Benefits Value', lSv: 'Family Services Value', lSelf: 'Self-Maintenance %', lD: 'After-Tax Return',
      calc: 'Calculate',
      headline: 'Your human life economic value is',
      explain: 'This is the estimated lump sum it would take to replace the lifetime income and services you provide your family, based on the assumptions shown.',
      wsTitle: 'Human Life Economic Value',
      wAge: 'Age', wInc: 'Annual Income', wMnt: 'Personal Maintenance Costs', wFr: 'Fringe Benefit Value', wSv: 'Service Replacement Costs', wSup: 'Annual Family Support', wPv: 'Present Value of Support', wCum: 'Cumulative Economic Value', wYear: 'Year',
      _notes: 'Your family insures the house and the car without a second thought. The most valuable asset in the home is the person who earns the income.\n\n- Ask: What would it take to replace everything you provide your family, year after year, until retirement?\nPAUSE\n\n- The result is a starting point for how much life insurance would truly protect them.'
    }),
    render(ctx) {
      const st = ctx._hl = ctx._hl || { g: 0.03, fringe: 0, service: 0, selfPct: 0.12, d: 0, shown: false };
      const F = [
        { id: 'age', label: 'lAge', type: 'int', min: 1, max: 100, get: () => C.get('age'), set: (v) => C.set('age', v) },
        { id: 'retAge', label: 'lRet', type: 'int', min: 1, max: 100, get: () => C.get('retAge'), set: (v) => C.set('retAge', v) },
        { id: 'income', label: 'lInc', type: 'money', min: 0, get: () => C.get('income'), set: (v) => C.set('income', v) },
        { id: 'g', label: 'lG', type: 'pct', get: () => st.g, set: (v) => { st.g = v; } },
        { id: 'fringe', label: 'lFr', type: 'money', min: 0, get: () => st.fringe, set: (v) => { st.fringe = v; } },
        { id: 'service', label: 'lSv', type: 'money', min: 0, get: () => st.service, set: (v) => { st.service = v; } },
        { id: 'selfPct', label: 'lSelf', type: 'pct', min: 0, max: 1, get: () => st.selfPct, set: (v) => { st.selfPct = v; } },
        { id: 'd', label: 'lD', type: 'pct', disclose: true, get: () => st.d, set: (v) => { st.d = v; } }
      ];
      ctx.el.innerHTML = `
        <div class="b07-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b07-card b07-form b07-calc-card" style="left:360px;top:142px;width:880px;padding-block:10px">${F.map((o) => row(ctx, Object.assign({ rowCls: 'b07-r48' }, o))).join('')}</div>
        <div class="b07-calc-act" data-calcw="1" style="top:590px"><button type="button" class="b07-btn" data-calc="1">${ctx.t('calc')}</button></div>
        <div class="b07-card b07-calc-res" data-res="1" hidden style="left:80px;top:576px;width:1440px;padding:22px 40px">
          <div class="b07-hl" style="width:1000px;box-sizing:border-box">${ctx.t('headline')} <span class="v"></span></div>
          ${ctx.t('explain', { tag: 'p', attrs: 'style="max-width:1200px"' })}
        </div>
        <div data-docw="1" hidden>${docBtn(ctx, () => sheet(), 'position:absolute;left:0;right:0;margin:auto;width:max-content;top:780px')}</div>
        ${discLine(ctx)}`;
      const vals = () => ({ age: F[0].get(), retAge: F[1].get(), income: F[2].get(), g: st.g, fringe: st.fringe, service: st.service, selfPct: st.selfPct, d: st.d });
      const paint = () => {
        ctx.$('[data-calcw]').hidden = st.shown; ctx.$('[data-res]').hidden = !st.shown; ctx.$('[data-docw]').hidden = !st.shown;
        if (!st.shown) return;
        ctx.$('[data-res] .v').innerHTML = num(money(hlevCalc(vals()).V));
      };
      bindInputs(ctx, paint);
      ctx.on(ctx.$('[data-calc]'), 'click', () => { st.shown = true; paint(); });
      function sheet() {
        const c = hlevCalc(vals());
        return {
          heading: ctx.t('wsTitle'), size: 'full',
          columns: [col(ctx, 'age', 'wAge', 'age', { width: 70 }), col(ctx, 'inc', 'wInc'), col(ctx, 'mnt', 'wMnt'), col(ctx, 'fr', 'wFr'), col(ctx, 'sv', 'wSv'), col(ctx, 'sup', 'wSup'),
            col(ctx, 'pv', 'wPv'), col(ctx, 'cum', 'wCum'), col(ctx, 'year', 'wYear', 'year', { width: 70 })],
          rows: c.rows, highlight: 'cum'
        };
      }
      wireDocFallback(ctx);
      paint();
    }
  });

  /* =====================================================================
     EVAC: evac1 (the app-prs5 child): compounding vs. amortizing interest
     ===================================================================== */
  /** monthly simulation, always 100 years. o: {capBal, capRate, capContrib, loanBal, loanRate, loanPmt, autoPmt, T}; rates as fractions */
  function prs5Calc(o) {
    const rl = o.loanRate / 12, rc = o.capRate / 12, T = Math.max(1, Math.round(o.T));
    let pmt = o.loanPmt;
    if (o.autoPmt) pmt = rl ? o.loanBal * rl / (1 - Math.pow(1 + rl, -12 * T)) : o.loanBal / (12 * T);
    let a = o.loanBal, s = o.capBal, c = o.capBal, IaI = 0, PaI = 0, TCO = 0, cumInt = 0, cumPrin = 0, cumEarn = 0;
    const years = [];
    for (let y = 1; y <= 100; y++) {
      let aInt = 0, aPrin = 0, aEarn = 0;
      for (let m = 0; m < 12; m++) {
        let j = 0, pay = 0, prin = 0;
        if (a > 0) { j = a * rl; pay = (a + j >= pmt) ? pmt : a + j; a = a + j - pay; prin = pay - j; }
        IaI = IaI * (1 + rc) + j; PaI = PaI * (1 + rc) + prin; TCO = TCO * (1 + rc) + pay;
        const earn = s * rc; s = s + earn + o.capContrib; c += o.capContrib;
        aInt += j; cumInt += j; aPrin += prin; cumPrin += prin; aEarn += earn; cumEarn += earn;
      }
      years.push({ y, aInt, cumInt, aEarn, cumEarn, diff: cumEarn - cumInt, loan: a, cap: s, IaI, PaI, TCO, aPrin, cumPrin, basis: c });
    }
    return { pmt, years, at: years[T - 1] };
  }
  EFA.engines.prs5 = prs5Calc;

  /** stacked column chart with an optional stepped line. o: {w, h, cats, series:[{key, values, color, hidden}], line:{values, plot, color}, every, cls} */
  function colChart(o) {
    const w = o.w, h = o.h, pad = { l: 104, r: 14, t: 16, b: 40 }, n = o.cats.length;
    const vis = o.series.filter((s) => !s.hidden);
    let max = 0;
    for (let i = 0; i < n; i++) { const tot = vis.reduce((t, s) => t + Math.max(0, s.values[i] || 0), 0); max = Math.max(max, tot); }
    if (o.line) max = Math.max(max, ...o.line.plot);
    const nice = (m) => { if (m <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(m))), f = m / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; };
    const yMax = nice(max), pw = w - pad.l - pad.r, ph = h - pad.t - pad.b, band = pw / n, cw = Math.max(2, band * (n > 40 ? 0.78 : 0.68));
    const Y = (v) => pad.t + ph * (1 - v / yMax);
    let g = '';
    for (let k = 0; k <= 4; k++) {
      const v = yMax * k / 4, y = Y(v);
      g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="#d6cfc4" stroke-width="1" opacity=".8"/>`;
      g += `<text x="${pad.l - 10}" y="${y + 5}" text-anchor="end" font-family="DM Sans, sans-serif" font-weight="700" font-size="15" fill="#0d1e3a">${money(v)}</text>`;
    }
    for (let i = 0; i < n; i += o.every) {
      const x = pad.l + band * (i + 0.5);
      g += `<line x1="${x}" x2="${x}" y1="${pad.t}" y2="${pad.t + ph}" stroke="#d6cfc4" stroke-width="1" opacity=".55"/>`;
      g += `<text x="${x}" y="${h - 12}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="15" fill="#0d1e3a">${o.cats[i]}</text>`;
    }
    for (let i = 0; i < n; i++) {
      let base = 0; const x = pad.l + band * i + (band - cw) / 2;
      o.series.forEach((s, si) => {
        if (s.hidden) return;
        const v = Math.max(0, s.values[i] || 0); if (!v) return;
        const y0 = Y(base), y1 = Y(base + v);
        g += `<rect class="mk" data-s="${si}" data-i="${i}" x="${x.toFixed(2)}" y="${y1.toFixed(2)}" width="${cw.toFixed(2)}" height="${Math.max(0.5, y0 - y1).toFixed(2)}" fill="${s.color}"/>`;
        base += v;
      });
    }
    if (o.line) {
      let d = '';
      o.line.plot.forEach((v, i) => { const x0 = pad.l + band * i, x1 = x0 + band, y = Y(v); d += (i ? `L${x0.toFixed(2)},${y.toFixed(2)}` : `M${x0.toFixed(2)},${y.toFixed(2)}`) + `L${x1.toFixed(2)},${y.toFixed(2)}`; });
      g += `<path d="${d}" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round" opacity=".85"/><path d="${d}" fill="none" stroke="${o.line.color}" stroke-width="4" stroke-linejoin="round"/>`;
      o.line.plot.forEach((v, i) => { g += `<rect class="mk" data-s="L" data-i="${i}" x="${(pad.l + band * i).toFixed(2)}" y="${(Y(v) - 7).toFixed(2)}" width="${band.toFixed(2)}" height="14" fill="transparent"/>`; });
    }
    g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${pad.t + ph}" y2="${pad.t + ph}" stroke="#0d1e3a" stroke-width="2"/>`;
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="${o.cls || ''}">${g}</svg>`;
  }

  EFA.css('b07-ev', `
  .b07-ev-tog { position: absolute; left: 110px; min-width: 300px; }
  .b07-ev-card { position: absolute; left: 110px; width: 430px; height: 278px; padding: 10px 22px; display: grid; align-content: center; }
  .b07-ev-r { display: grid; grid-template-columns: 1fr 156px; align-items: center; height: 51px; column-gap: 10px; }
  .b07-ev-r + .b07-ev-r { border-top: 1px solid rgba(13,30,58,.07); }
  .b07-ev-r .lb { font: 700 19px/1.1 var(--f-body); color: var(--navy); display: flex; align-items: center; gap: 8px; white-space: nowrap; }
  .b07-ev-r .b07-in { height: 40px; font-size: 19px; padding: 0 10px; }
  .b07-ev-r .val { text-align: right; font: 700 21px/1 var(--f-body); padding-right: 11px; }
  .b07-ev-r .val.gain { color: var(--gold-deep); }
  .b07-ev-r .val.cost { color: ${COST}; }
  .b07-ev-cyc { background: none; border: 0; padding: 0; font: 700 19px/1.1 var(--f-body); color: var(--gold-deep); border-bottom: 1.5px dotted currentColor; cursor: pointer; }
  .b07-ev-cyc:hover { color: var(--navy); }
  .b07-chk-b { width: 20px; height: 20px; accent-color: #0d1e3a; cursor: pointer; margin: 0; }
  .b07-ev-chart { position: absolute; left: 566px; width: 930px; height: 278px; cursor: pointer; }
  .b07-ev-ghost { position: absolute; border: 2px dashed var(--mist-2); border-radius: 14px; transition: opacity .6s ease; overflow: hidden; }
  .b07-ev-tf { position: absolute; right: 104px; display: flex; align-items: center; gap: 12px; font: 700 21px/1 var(--f-body); color: var(--navy); }
  .b07-ev-tf .b07-in { width: 76px; height: 40px; text-align: center; padding: 0 6px; }
  .b07-ev-panel { transition: opacity .6s ease; }
  `);
  EFA.screen('evac1', {
    title: 'Pay cash or borrow: compounding vs. amortizing',
    copy: withCommon({
      head: 'How Would You Like to Pay for It?',
      togCI: 'Compounding Interest', togAI: 'Amortizing Interest',
      lBal: 'Initial Balance', lRate: 'Interest Rate', lCont: 'Monthly Cont.', lEarned: 'Interest Earned', lFinal: 'Final Balance',
      syncBal: 'Keep both balances the same', syncRate: 'Keep both rates the same', autoPmt: 'Calculate the loan payment',
      v0: 'Interest Paid', v1: 'Interest at Int.', v2: 'Principal at Int.', v3: 'Purchase TCO',
      tf1: 'Timeframe', tf2: 'Years',
      sAnnEarn: 'Annual Interest Earned', sCumEarn: 'Cumulative Interest Earned', sBasis: 'Capital Basis',
      sAnnPaid: 'Annual Interest Paid', sCumPaid: 'Cumulative Interest Paid', sPrin: 'Cumulative Principal Paid',
      sLoi: 'Lost Growth on Interest Payments', sLop: 'Lost Growth on Principal Payments', sCash: 'Annual Cash Flow',
      wsTitle: 'Amortization and Compounding Schedule',
      wYear: 'Year', wAnnPaid: 'Annual Interest Paid', wCumPaid: 'Cumulative Interest Paid', wAnnEarn: 'Annual Interest Earned', wCumEarn: 'Cumulative Interest Earned', wDiff: 'Cumulative Difference (Earned - Paid)',
      wLoan: 'Loan Balance', wCap: 'Capital Balance', wPrin: 'Cumulative Principal Paid', wPaI: 'Principal Payments at Interest', wIaI: 'Interest Payments at Interest', wTCO: 'Total Cost of Ownership at Interest',
      _notes: 'Interest works both ways. When you save, it compounds for you. When you borrow, it amortizes against you, and every payment also gives up what that money could have earned.\n\n- Show Compounding Interest first, then Amortizing Interest. Click the cost label to walk from interest paid to the full cost of ownership.\nPAUSE\n\n- Ask: When you pay for something, do you think about what the payment costs you, or only what the purchase costs?\nPAUSE'
    }),
    render(ctx) {
      const mtg = ctx.variant === 'mortgage';
      const st = ctx._ev = {
        ci: false, ai: false, syncBal: true, syncRate: true, autoPmt: true, hideLoi: false,
        capBal: mtg ? 100000 : 30000, capRate: 0.05, capContrib: 0, T: mtg ? 30 : 5,
        loanBal: mtg ? 100000 : 30000, loanRate: 0.05, loanPmt: mtg ? 537 : 566, view: mtg ? 3 : 0
      };
      const re = () => recalc();
      const F = {
        capBal: { id: 'capBal', type: 'money', aria: 'lBal', min: 0, get: () => st.capBal, set: (v) => { st.capBal = v; if (st.syncBal) { st.loanBal = v; refresh('loanBal'); } } },
        capRate: { id: 'capRate', type: 'pct', aria: 'lRate', disclose: true, get: () => st.capRate, set: (v) => { st.capRate = v; if (st.syncRate) { st.loanRate = v; refresh('loanRate'); } } },
        capContrib: { id: 'capContrib', type: 'money', aria: 'lCont', get: () => st.capContrib, set: (v) => { st.capContrib = v; } },
        loanBal: { id: 'loanBal', type: 'money', aria: 'lBal', min: 0, get: () => st.loanBal, set: (v) => { st.loanBal = v; if (st.syncBal) { st.capBal = v; refresh('capBal'); } } },
        loanRate: { id: 'loanRate', type: 'pct', aria: 'lRate', get: () => st.loanRate, set: (v) => { st.loanRate = v; if (st.syncRate) { st.capRate = v; refresh('capRate'); } } },
        loanPmt: { id: 'loanPmt', type: 'money', aria: 'lCont', min: 0, get: () => st.loanPmt, set: (v) => { st.loanPmt = v; }, disabled: true },
        T: { id: 'T', type: 'int', aria: 'tf1', min: 1, max: 100, get: () => st.T, set: (v) => { st.T = v; if (ctx._sl) Object.values(ctx._sl).forEach((s) => s.set && s.set(v, true)); } }
      };
      function refresh(id) { const o = F[id]; ctx.$$(`input[data-bf="${id}"]`).forEach((x) => { x.value = showVal(o, o.get()); }); }
      /** faint silhouette of the card and chart that will appear in a panel's reserved space */
      const ghost = (up) => {
        let bars = '';
        for (let i = 0; i < 13; i++) { const hh = up ? 26 + Math.pow(1.19, i) * 18 : 34 + i * 15; bars += `<rect x="${492 + i * 66}" y="${246 - hh}" width="40" height="${hh}" rx="5" fill="${P.mist}"/>`; }
        return `<svg viewBox="0 0 1386 278" width="1382" height="274" style="display:block;opacity:.75"><rect x="10" y="10" width="408" height="254" rx="14" fill="${P.mist}" opacity=".6"/>
          ${[0, 1, 2, 3, 4].map((i) => `<rect x="34" y="${36 + i * 46}" width="${150 + (i % 2) * 40}" height="14" rx="7" fill="${P.mist2}" opacity=".6"/><rect x="290" y="${30 + i * 46}" width="104" height="26" rx="7" fill="#fff" opacity=".8"/>`).join('')}
          ${bars}<line x1="470" x2="1366" y1="246" y2="246" stroke="${P.mist2}" stroke-width="2"/></svg>`;
      };
      const chk = (k, labelKey) => `<label style="display:inline-flex"><input type="checkbox" class="b07-chk-b" data-ck="${k}" ${st[k] ? 'checked' : ''}><span class="sr-only">${ctx.t(labelKey)}</span></label>`;
      const r = (lab, right, extra) => `<div class="b07-ev-r"><span class="lb">${lab}${extra || ''}</span>${right}</div>`;
      ctx.el.innerHTML = `
        <div class="b07-head sm" style="top:26px;gap:10px"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <button type="button" class="b07-btn b07-ev-tog" data-tog="ci" aria-pressed="false" style="top:110px">${ctx.t('togCI')}</button>
        <div class="b07-ev-ghost g-ci" style="left:110px;top:166px;width:1386px;height:278px">${ghost(true)}</div>
        <div class="b07-ev-panel p-ci is-off">
          <div class="b07-card b07-ev-card" style="top:166px">
            ${r(ctx.t('lBal'), inp(ctx, F.capBal), chk('syncBal', 'syncBal'))}
            ${r(ctx.t('lRate'), inp(ctx, F.capRate), chk('syncRate', 'syncRate'))}
            ${r(ctx.t('lCont'), inp(ctx, F.capContrib))}
            ${r(ctx.t('lEarned'), '<span class="val gain" data-o="earned"></span>')}
            ${r(ctx.t('lFinal'), '<span class="val" data-o="capFinal"></span>')}
          </div>
          <div class="b07-ev-chart" data-chart="top" style="top:166px"></div>
        </div>
        <button type="button" class="b07-btn b07-ev-tog" data-tog="ai" aria-pressed="false" style="top:456px">${ctx.t('togAI')}</button>
        ${slider(ctx, { x: 566, y: 457, len: 600, min: 1, max: 100, value: st.T, onInput: (v) => { st.T = v; refresh('T'); re(); } })}
        <div class="b07-ev-tf" style="top:458px">${ctx.t('tf1')} ${inp(ctx, F.T)} ${ctx.t('tf2')}</div>
        <div class="b07-ev-ghost g-ai" style="left:110px;top:512px;width:1386px;height:278px">${ghost(false)}</div>
        <div class="b07-ev-panel p-ai is-off">
          <div class="b07-card b07-ev-card" style="top:512px">
            ${r(ctx.t('lBal'), inp(ctx, F.loanBal), chk('syncBal', 'syncBal'))}
            ${r(ctx.t('lRate'), inp(ctx, F.loanRate), chk('syncRate', 'syncRate'))}
            ${r(ctx.t('lCont'), inp(ctx, F.loanPmt), chk('autoPmt', 'autoPmt'))}
            ${r(`<button type="button" class="b07-ev-cyc" data-cyc="1">${[0, 1, 2, 3].map((i) => ctx.t('v' + i, { attrs: `data-v="${i}"` })).join('')}</button>`, '<span class="val cost" data-o="cost"></span>')}
            ${r(ctx.t('lFinal'), '<span class="val" data-o="loanFinal"></span>')}
          </div>
          <div class="b07-ev-chart" data-chart="bot" style="top:512px"></div>
        </div>
        ${docBtn(ctx, () => sheet(), 'position:absolute;left:0;right:0;margin:auto;width:max-content;top:806px')}
        ${discLine(ctx, ['hypothetical'], 'bottom:16px')}`;
      const tip = tipper(ctx);
      const COLS = { basis: P.navy3, earn: P.gold, prin: P.navy3, int: COST, lop: P.goldLt, loi: P.gold, line: P.steel };
      function recalc() {
        const res = prs5Calc(st), at = res.at, T = st.T, yrs = res.years.slice(0, T);
        if (st.autoPmt) { st.loanPmt = res.pmt; refresh('loanPmt'); }
        ctx.$('[data-o="earned"]').innerHTML = num(money(at.cumEarn));
        ctx.$('[data-o="capFinal"]').innerHTML = num(money(at.cap));
        ctx.$('[data-o="loanFinal"]').innerHTML = num(money(at.loan));
        ctx.$('[data-o="cost"]').innerHTML = num(money([at.cumInt, at.IaI, at.PaI, at.TCO][st.view]));
        ctx.$$('.b07-ev-cyc [data-v]').forEach((s) => { s.hidden = +s.dataset.v !== st.view; });
        const every = T > 50 ? 10 : T > 20 ? 5 : T > 10 ? 2 : 1, cats = yrs.map((y) => y.y);
        const v0 = st.view === 0;
        const top = [
          { key: v0 ? '' : 'sBasis', values: yrs.map((y) => v0 ? 0 : Math.max(0, y.basis)), color: COLS.basis },
          { key: v0 ? 'sAnnEarn' : 'sCumEarn', values: yrs.map((y) => Math.max(0, v0 ? y.aEarn : y.cumEarn)), color: COLS.earn }
        ];
        const z = yrs.map(() => 0);
        const V = st.view;
        const bot = [
          { key: 'sPrin', values: V === 2 || V === 3 ? yrs.map((y) => Math.max(0, y.cumPrin)) : z, color: COLS.prin },
          { key: V === 0 ? 'sAnnPaid' : 'sCumPaid', values: V === 0 ? yrs.map((y) => Math.max(0, y.aInt)) : (V === 1 || V === 3 ? yrs.map((y) => Math.max(0, y.cumInt)) : z), color: COLS.int },
          { key: 'sLop', values: V === 2 || V === 3 ? yrs.map((y) => Math.max(0, y.PaI - y.cumPrin)) : z, color: COLS.lop },
          { key: 'sLoi', values: V === 1 || V === 3 ? yrs.map((y) => Math.max(0, y.IaI - y.cumInt)) : z, color: COLS.loi, hidden: st.hideLoi }
        ];
        const L = yrs.map((y) => Math.max(0, y.aPrin + y.aInt));
        const cmax = Math.max(0, ...bot.flatMap((s) => s.values)), lmax = Math.max(0, ...L);
        const plot = L.map((l) => (lmax <= 0 ? 0 : (l === cmax ? cmax : cmax * l / lmax)));
        ctx._evData = { top, bot, L };
        ctx.$('[data-chart="top"]').innerHTML = colChart({ w: 930, h: 278, cats, series: top, every });
        ctx.$('[data-chart="bot"]').innerHTML = colChart({ w: 930, h: 278, cats, series: bot, every, line: { plot, color: COLS.line } });
      }
      const onMove = (which) => (e) => {
        const t = e.target.closest('.mk'); if (!t) { tip.hide(); return; }
        const d = ctx._evData, i = +t.dataset.i;
        if (t.dataset.s === 'L') { tip.show(e, `<b>${ctx.t('sCash')}</b>${num(money(Math.abs(d.L[i])))}`); return; }
        const s = d[which][+t.dataset.s]; if (!s || !s.key) { tip.hide(); return; }
        tip.show(e, `<b>${ctx.t(s.key)}</b>${num(money(Math.abs(s.values[i])))}`);
      };
      ['top', 'bot'].forEach((k) => {
        const c = ctx.$(`[data-chart="${k}"]`);
        c.addEventListener('mousemove', onMove(k)); c.addEventListener('mouseleave', () => tip.hide());
        ctx.on(c, 'click', () => { st.hideLoi = !st.hideLoi; recalc(); });
      });
      ctx.on(ctx.$$('[data-tog]'), 'click', (e, b) => {
        const k = b.dataset.tog; st[k] = !st[k]; b.setAttribute('aria-pressed', st[k]);
        ctx.show('.p-' + k, st[k]); ctx.show('.g-' + k, !st[k]);
      });
      ctx.$$('[data-ck]').forEach((cb) => cb.addEventListener('change', () => {
        const k = cb.dataset.ck; st[k] = cb.checked;
        ctx.$$(`[data-ck="${k}"]`).forEach((x) => { x.checked = st[k]; });
        if (k === 'syncBal' && st.syncBal) { st.loanBal = st.capBal; refresh('loanBal'); }
        if (k === 'syncRate' && st.syncRate) { st.loanRate = st.capRate; refresh('loanRate'); }
        if (k === 'autoPmt') ctx.$$('input[data-bf="loanPmt"]').forEach((x) => { x.disabled = st.autoPmt; });
        recalc();
      }));
      ctx.on(ctx.$('[data-cyc]'), 'click', () => { st.view = (st.view + 1) % 4; recalc(); });
      function sheet() {
        const res = prs5Calc(st);
        return {
          heading: ctx.t('wsTitle'), size: 'full',
          columns: [col(ctx, 'y', 'wYear', 'year', { width: 70 }), col(ctx, 'aInt', 'wAnnPaid'), col(ctx, 'cumInt', 'wCumPaid'), col(ctx, 'aEarn', 'wAnnEarn'), col(ctx, 'cumEarn', 'wCumEarn'),
            col(ctx, 'diff', 'wDiff'), col(ctx, 'loan', 'wLoan'), col(ctx, 'cap', 'wCap'), col(ctx, 'cumPrin', 'wPrin'), col(ctx, 'PaI', 'wPaI'), col(ctx, 'IaI', 'wIaI'), col(ctx, 'TCO', 'wTCO')],
          rows: res.years.slice(0, st.T)
        };
      }
      wireDocFallback(ctx);
      bindInputs(ctx, re);
      bindSliders(ctx);
      recalc();
    },
    leave(ctx) { leaveModals(ctx); }
  });

  /* =====================================================================
     IFR tutorial: engine (increasing, flat, immediate pay-down, reducing)
     ===================================================================== */
  /** one strategy, years 1..T. kind: 'inc' | 'flat' | 'imm' | 'red'. v: {B, T, P, r, f, o, t, d, taxFree, ipTaxFree, age}
      Taxes are paid from lifestyle at year end; the "lost opportunity" pot holds those taxes at rate o. */
  function ifrRun(kind, v) {
    const T = Math.max(1, Math.round(v.T)), P = clamp(Math.round(v.P || 1), 1, T), r = v.r, f = v.f, o = v.o, t = v.t, d = v.d;
    const B = v.B;
    let W = 0;
    if (kind === 'flat') W = B * r / (1 + r);
    else if (kind === 'red') W = r ? B * r / ((1 + r) * (1 - Math.pow(1 + r, -P))) : B / P;
    const free = kind === 'imm' ? !!v.ipTaxFree : !!v.taxFree;
    const rows = [];
    let bal = B, pot = 0, cumTax = 0, cumOE = 0, eoy2 = 0, cumInt2 = 0;
    for (let k = 1; k <= T; k++) {
      let wd = 0, boy, int1;
      if (kind === 'inc') { boy = bal; int1 = bal * r; bal = bal + int1; }
      else if (kind === 'flat') { wd = W; boy = B - W; int1 = W; bal = B; }
      else if (kind === 'imm') { wd = k === 1 ? B : 0; boy = bal - wd; int1 = 0; bal = 0; }
      else { if (bal < 0.0049) W = 0; wd = W; boy = bal - W; int1 = boy * r; bal = boy + int1; }
      const tax = int1 * t, potStart = pot, oe = pot * o;
      pot = pot + oe + tax; cumTax += tax; cumOE += oe;
      let boy2 = 0, int2 = 0;
      if (kind !== 'inc') { boy2 = eoy2 + wd; int2 = boy2 * f; eoy2 = boy2 + int2; cumInt2 += int2; }
      const deferred = kind === 'inc' || free ? 0 : cumInt2 * d;
      rows.push({
        k, age: (v.age || 0) + k - 1, wd, boy, int1, eoy: bal, tax, cumTax, potStart, oe, cumOE, pot,
        boy2, int2, eoy2, cumInt2, deferred,
        gross: bal + eoy2, net: bal + eoy2 - cumTax - cumOE - deferred,
        cBoy: boy + boy2, cInt: int1 + int2, netGrowth: bal - cumTax, cNet: bal + eoy2 - cumTax
      });
    }
    const last = rows[rows.length - 1];
    return { kind, W, rows, gross: last.gross, taxes: last.cumTax, oc: last.cumOE, deferred: last.deferred, net: last.net, at: (n) => rows[clamp(n, 1, T) - 1] };
  }
  const ifrAll = (v) => ({ inc: ifrRun('inc', v), flat: ifrRun('flat', v), imm: ifrRun('imm', v), red: ifrRun('red', v) });
  EFA.engines.ifr = { run: ifrRun, all: ifrAll };

  /** the client's IFR assumptions (shared case values) */
  function ifrVals() {
    const T = Math.max(1, Math.round(C.get('years')));
    return {
      age: C.get('age'), T, P: clamp(Math.round(C.get('ifrP')), 1, T), B: C.get('ifrB'),
      r: C.get('ifrR'), f: C.get('ifrF'), o: C.get('ifrO'), t: C.get('tax'), d: C.get('ifrD'),
      taxFree: !!C.get('ifrFree'), ipTaxFree: !!C.get('ifrIp')
    };
  }
  const stratName = (ctx) => { const n = C.get('ifrName'); return n && String(n).trim() ? String(n) : ctx.text('stratDef'); };
  /** the strategy name as HTML: the client's own name, or the editable default */
  const stratHTML = (ctx) => { const n = C.get('ifrName'); return n && String(n).trim() ? esc(String(n)) : ctx.t('stratDef'); };

  /* ---------- shapes that fill as the years pass ----------
     tri: apex at the top, a solid copy anchored at the apex grows (fills from the top down)
     rect: a solid block grows down from the top
     inv: inverted triangle drawn solid, with a pale copy anchored at the bottom point */
  const TONE = {
    acct: [P.navy3, P.mist], acct2: [P.navy4, P.mist], tax: [P.gold, P.goldPale], loc: [P.goldDeep, P.goldPale], dfr: [P.goldDeep, '#f3ead0']
  };
  function shapeSVG(kind, w, h, tone, cls, attrs) {
    const [solid, pale] = TONE[tone];
    const pts = kind === 'tri' ? `${w / 2},2 ${w - 2},${h - 2} 2,${h - 2}` : kind === 'inv' ? `2,2 ${w - 2},2 ${w / 2},${h - 2}` : null;
    const org = kind === 'inv' ? `${w / 2}px ${h}px` : `${w / 2}px 0px`;
    const body = (fill, k) => pts ? `<polygon points="${pts}" fill="${fill}" stroke="${fill}" stroke-width="3" stroke-linejoin="round" class="${k}"/>` : `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="10" fill="${fill}" class="${k}"/>`;
    const back = kind === 'inv' ? body(solid, 'back') : body(pale, 'back');
    const front = kind === 'inv' ? body(pale, 'front') : body(solid, 'front');
    return `<svg class="b07-shape ${cls || ''}" data-kind="${kind}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${attrs || ''} style="overflow:visible">
      ${kind !== 'inv' ? `<ellipse cx="${w / 2}" cy="${h + 8}" rx="${w * 0.46}" ry="7" fill="rgba(13,30,58,.10)"/>` : ''}
      ${back}<g class="mv" style="transform-origin:${org};transform:scale(${kind === 'rect' ? '1,0' : 0})">${front}</g>
      ${pts ? `<polygon points="${pts}" fill="none" stroke="rgba(13,30,58,.16)" stroke-width="1.5" stroke-linejoin="round"/>` : `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="10" fill="none" stroke="rgba(13,30,58,.16)" stroke-width="1.5"/>`}
    </svg>`;
  }
  /** set the filled fraction (0..1) of one shape */
  function setFill(svg, frac) {
    if (!svg) return;
    const g = svg.querySelector('.mv'), k = svg.dataset.kind, f = clamp(isFinite(frac) ? frac : 0, 0, 1);
    g.style.transform = k === 'rect' ? `scale(1,${f})` : `scale(${f})`;
  }

  EFA.css('b07-ifr', `
  .b07-shape .mv { transition: transform .45s cubic-bezier(.3,.7,.3,1); }
  .b07-ifr-name { background: none; border: 0; padding: 0 4px 4px; cursor: pointer; color: var(--navy); border-bottom: 2px dotted var(--gold); }
  .b07-ifr-name:hover { color: var(--gold-deep); }
  .b07-ifr-lab { position: absolute; text-align: center; font: 700 21px/1.2 var(--f-body); letter-spacing: .1em; text-transform: uppercase; color: var(--navy); }
  .b07-ifr-lab.link { cursor: pointer; color: var(--gold-deep); }
  .b07-ifr-lab.link > span:first-child { border-bottom: 1.5px dotted currentColor; }
  .b07-ifr-lab.link:hover { color: var(--navy); }
  .b07-ifr-lab .sub { display: block; margin-top: 6px; font-size: 16px; letter-spacing: .16em; color: var(--muted); }
  .b07-ifr-in { position: absolute; width: 124px; }
  .b07-ifr-in .b07-in { text-align: center; height: 46px; box-shadow: 0 6px 16px rgba(13,30,58,.18); }
  .b07-ifr-in.sm .b07-in { font-size: 19px; padding: 0 8px; height: 42px; }
  .b07-vcard { position: absolute; padding: 12px 20px; display: grid; }
  .b07-vcard .ln { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; padding: 7px 0; font: 600 19px/1.2 var(--f-body); color: var(--muted); }
  .b07-vcard .ln + .ln { border-top: 1px solid rgba(13,30,58,.07); }
  .b07-vcard .ln .v { font: 700 23px/1 var(--f-body); color: var(--navy); }
  .b07-vcard .ln .v.cost { color: ${COST}; }
  .b07-vcard.net { background: var(--navy); border-color: var(--navy); }
  .b07-vcard.net .ln { color: var(--mist-2); }
  .b07-vcard.net .ln .v { color: var(--gold-lt); font-size: 28px; }
  .b07-vcard.net .v.click { cursor: pointer; border-bottom: 2px dotted var(--gold-lt); }
  .b07-year { position: absolute; text-align: center; display: grid; gap: 2px; }
  .b07-year .k { font: 700 15px/1 var(--f-body); letter-spacing: .2em; text-transform: uppercase; color: var(--gold-deep); }
  .b07-year .n { font: 700 46px/1 var(--f-body); color: var(--navy); }
  .b07-bul { position: absolute; display: grid; grid-template-columns: 84px 1fr; align-items: center; column-gap: 22px; }
  .b07-bul .dart { display: grid; place-items: center; }
  .b07-bul .b07-card { padding: 20px 30px; font: 700 30px/1.35 var(--f-body); color: var(--navy); }
  .b07-cmp { width: 100%; border-collapse: collapse; font: 600 21px/1.3 var(--f-body); color: var(--navy); }
  .b07-cmp th { font: 700 14px/1.2 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); text-align: right; padding: 8px 10px; }
  .b07-cmp td { padding: 10px; text-align: right; }
  .b07-cmp td:first-child, .b07-cmp th:first-child { text-align: left; }
  .b07-cmp tr.diff td { border-top: 2px solid var(--navy); font-weight: 700; }
  .b07-good { color: var(--gold-deep) !important; }
  .b07-bad { color: ${COST} !important; }
  .b07-choose { display: flex; justify-content: center; gap: 22px; flex-wrap: wrap; }
  .b07-ifr-rn { display: grid; gap: 10px; }
  .b07-ifr-rn .b07-in { text-align: left; }
  .b07-ifr-err { color: ${COST}; font: 600 18px/1.3 var(--f-body); min-height: 24px; margin: 0; }
  `);

  /** rename dialog for the increasing-strategy name (no close button, no Escape) */
  function renameStrategy(ctx, after) {
    const m = modal(ctx, {
      width: 640, closable: false, title: ctx.t('rnTitle'),
      body: `<div class="b07-ifr-rn">${ctx.t('rnLabel', { tag: 'label', cls: 'b07-lb', attrs: 'for="b07-rn"' })}<input id="b07-rn" class="b07-in" autocomplete="off" value="${esc(stratName(ctx))}"><p class="b07-ifr-err" data-err="1"></p></div>`,
      foot: `<button type="button" class="b07-btn" data-save="1">${ctx.t('rnSave')}</button>`
    });
    const input = m.querySelector('#b07-rn');
    const save = () => {
      if (EFA.edit && EFA.edit.on) return;
      const v = input.value.trim();
      if (!v) { m.querySelector('[data-err]').innerHTML = ctx.t('rnErr'); return; }
      C.set('ifrName', v); m.close(); if (after) after();
    };
    m.querySelector('[data-save]').addEventListener('click', save);
    input.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') save(); });
    setTimeout(() => { input.focus(); input.select(); }, 40);
  }
  /** "choose a worksheet" dialog: items [{key (copy), sheet: () => worksheet}] */
  function chooser(ctx, items) {
    const m = modal(ctx, {
      width: 720, closable: true, title: ctx.t('chTitle'),
      body: `<div class="b07-choose">${items.map((it, i) => `<button type="button" class="b07-btn ghost" data-ch="${i}">${ctx.t(it.key)}</button>`).join('')}</div>`
    });
    m.querySelectorAll('[data-ch]').forEach((b) => b.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; const it = items[+b.dataset.ch]; m.close(); openSheet(ctx, it.sheet()); }));
  }
  /** comparison popup (flat or reducing vs. increasing) */
  function comparePopup(ctx, o) {
    const cls = (v, goodIfPositive) => (goodIfPositive ? (v > 0 ? 'b07-good' : 'b07-bad') : (v < 0 ? 'b07-good' : 'b07-bad'));
    const m = modal(ctx, {
      width: 620, closable: true,
      body: `<table class="b07-cmp" style="margin-top:34px"><thead><tr><th></th><th>${ctx.t('cmpNet')}</th><th>${ctx.t('cmpTax')}</th></tr></thead><tbody>
        <tr><td>${ctx.t(o.altKey)}</td><td>${num(money(o.altNet))}</td><td class="b07-bad">${num(money(o.altTax))}</td></tr>
        <tr><td>${stratHTML(ctx)}</td><td>${num(money(o.incNet))}</td><td class="b07-bad">${num(money(o.incTax))}</td></tr>
        <tr class="diff"><td>${ctx.t('cmpDiff')}</td><td class="${cls(o.dNet, true)}">${num(money(o.dNet))}</td><td class="${cls(o.dTax, false)}">${num(money(o.dTax))}</td></tr>
        </tbody></table>`,
      foot: `<button type="button" class="b07-btn" data-close="1">${ctx.t('cmpClose')}</button>`
    });
    m.querySelector('[data-close]').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) m.close(); });
  }
  /** a vertical-slider year picker. o: {x, y, len, T, onYear(n)} */
  function yearSlider(ctx, o) { return slider(ctx, { x: o.x, y: o.y, len: o.len, min: 1, max: o.T, value: o.value || 1, vertical: true, onInput: o.onYear }); }

  /** bullet graphic from the shared component (blank space of the same size while it loads) */
  function dart(size) {
    const b = LIB('bullets');
    return b && b.dart ? b.dart({ size }) : `<span style="display:inline-block;width:${size}px;height:${Math.round(size * 66 / 90)}px"></span>`;
  }
  /** bullet rows (dart + card) stacked in a block. keys: copy keys; o: {x, y, w, size, gap, cardStyle, cls} */
  function bulletRows(ctx, keys, o) {
    return `<div class="b07-bulwrap ${o.cls || ''}" style="position:absolute;left:${o.x}px;top:${o.y}px;width:${o.w}px;display:grid;gap:${o.gap == null ? 30 : o.gap}px">
      ${keys.map((k) => `<div class="b07-bul" style="position:relative"><span class="dart">${dart(o.size || 74)}</span><div class="b07-card" style="${o.cardStyle || ''}">${ctx.t(k)}</div></div>`).join('')}</div>`;
  }

  const IFR_COMMON = {
    stratDef: 'Compound Interest',
    rnTitle: 'Edit the Strategy Name', rnLabel: 'Strategy name', rnSave: 'Save', rnErr: 'Please enter a name for the strategy.',
    chTitle: 'Choose a Worksheet',
    acct2Note: 'Tax treatment of account 2 depends on the type of account and on meeting its requirements.'
  };

  /* ---------- ifr1: three ways to handle the tax ---------- */
  EFA.screen('ifr1', {
    title: 'IFR tutorial: three ways to handle the tax',
    copy: {
      head: 'When Your Taxable Account Earns Interest or Dividends, You Have Three Ways to Handle the Tax',
      w1: 'Increasing tax liability', w2: 'Pay a level tax', w3: 'Systematic tax reduction',
      c1: 'The illustration that follows compares compound growth in a taxable account with growth in a tax-favored account.',
      c2: 'It is hypothetical and should not be read as a forecast of how any investment will perform.',
      c3: 'It is not tied to any particular product, and it leaves out investment costs, which would reduce the results.',
      _notes: 'Every taxable account that earns interest leaves you a choice about the tax, whether you make it on purpose or not.\n\n- Read the three ways slowly. Most people have only ever known the first one.\n- Ask: Which of these three describes how your money is handled today?\nPAUSE'
    },
    render(ctx) {
      const li = (k, size) => `<div class="b07-ifr1-li"><span class="dart">${dart(size)}</span>${ctx.t(k)}</div>`;
      ctx.el.innerHTML = `
        <div class="b07-head" style="left:170px;right:170px;top:40px"><h1 class="st-h1" style="font-size:52px">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b07-card b07-ifr1-a">${li('w1', 66)}${li('w2', 66)}${li('w3', 66)}</div>
        <div class="b07-card b07-ifr1-b">${li('c1', 48)}${li('c2', 48)}${li('c3', 48)}</div>`;
    }
  });
  EFA.css('b07-ifr1', `
  .b07-ifr1-a { position: absolute; left: 472px; width: 656px; top: 236px; padding: 26px 40px; display: grid; gap: 18px; }
  .b07-ifr1-a .b07-ifr1-li { font: 700 36px/1.2 var(--f-body); color: var(--navy); }
  .b07-ifr1-b { position: absolute; left: 200px; width: 1200px; top: 552px; padding: 24px 38px; display: grid; gap: 14px; }
  .b07-ifr1-b .b07-ifr1-li { font: 700 23px/1.35 var(--f-body); color: var(--navy); }
  .b07-ifr1-li { display: grid; grid-template-columns: 74px 1fr; align-items: center; column-gap: 18px; }
  .b07-ifr1-li .dart { display: grid; place-items: center; }
  `);

  /* ---------- ifr2: initial assumptions ---------- */
  EFA.screen('ifr2', {
    title: 'IFR tutorial: initial assumptions',
    copy: withCommon({
      head: 'Initial Assumptions',
      lAge: 'Current Age', lT: 'Years of Accumulation', lB: 'Initial Account Balance', lR: 'Taxable Account Return (1)', lF: 'Tax-Favored Return (2)',
      lO: 'Opportunity Cost', lTax: 'Ordinary Tax Bracket', lD: 'Future Tax Bracket',
      fn1: '(1) Earnings in the taxable account are assumed to be taxed every year at your ordinary tax bracket.',
      fn2: '(2) Earnings in the tax-favored account are assumed to grow tax-deferred or tax-free, depending on the type of account and on meeting its requirements.',
      _notes: 'These few numbers drive every screen that follows. Use the client\'s real figures where you can.\n\n- Changing the taxable return also sets the tax-favored return and the opportunity cost to match, so the comparison stays fair.\n- Ask: What does your money earn today, and what tax bracket are you in?\nPAUSE'
    }),
    render(ctx) {
      const F = [
        { id: 'age', label: 'lAge', type: 'int', min: 1, max: 110, get: () => C.get('age'), set: (v) => C.set('age', v) },
        { id: 'T', label: 'lT', type: 'int', min: 1, max: 100, get: () => C.get('years'), set: (v) => { C.set('years', v); C.set('ifrP', v); } },
        { id: 'B', label: 'lB', type: 'money', min: 0, get: () => C.get('ifrB'), set: (v) => C.set('ifrB', v) },
        { id: 'r', label: 'lR', type: 'pct', disclose: true, get: () => C.get('ifrR'), set: (v) => { C.set('ifrR', v); C.set('ifrF', v); C.set('ifrO', v); } },
        { id: 'f', label: 'lF', type: 'pct', get: () => C.get('ifrF'), set: (v) => C.set('ifrF', v) },
        { id: 'o', label: 'lO', type: 'pct', get: () => C.get('ifrO'), set: (v) => C.set('ifrO', v) },
        { id: 'tax', label: 'lTax', type: 'pct', min: 0, max: 1, get: () => C.get('tax'), set: (v) => C.set('tax', v) },
        { id: 'd', label: 'lD', type: 'pct', min: 0, max: 1, get: () => C.get('ifrD'), set: (v) => C.set('ifrD', v) }
      ];
      ctx.el.innerHTML = `
        <div class="b07-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b07-card b07-form" style="position:absolute;left:360px;top:150px;width:880px;padding-block:10px">${F.map((o) => row(ctx, Object.assign({ rowCls: 'b07-r48' }, o))).join('')}</div>
        <div class="st-disclaimer" style="position:absolute;left:360px;width:880px;top:600px;display:grid;gap:6px;font-size:16px">${ctx.t('fn1', { tag: 'p', attrs: 'style="margin:0"' })}${ctx.t('fn2', { tag: 'p', attrs: 'style="margin:0"' })}</div>
        ${discLine(ctx, ['hypothetical'])}`;
      bindInputs(ctx, (id) => {
        if (id === 'r') ['f', 'o'].forEach((k) => setInput(ctx, k, C.get(k === 'f' ? 'ifrF' : 'ifrO')));
      });
    }
  });

  /* ---------- ifr3: compound growth triangle ---------- */
  EFA.screen('ifr3', {
    title: 'IFR tutorial: compound growth',
    copy: withCommon(Object.assign({}, IFR_COMMON, {
      boy: 'Beginning of Year 1', eoy: 'End of Year',
      explain: 'Your investment account grows larger every year because the interest it earns is reinvested, and that interest starts earning interest of its own.',
      wsTitle: 'Compound Interest Worksheet',
      wAge: 'Age', wStart: 'Balance at Start of Year', wInt: 'Annual Interest Earned', wEnd: 'Balance at End of Year', wYear: 'Year',
      _notes: 'This is compound interest before any tax: the account earns, the earnings stay in, and the triangle widens every year.\n\n- Drag the slider down to walk the years. Click the name at the top to call this strategy what the client calls it.\n- Ask: Where do you have money compounding like this today?\nPAUSE'
    })),
    render(ctx) {
      const v0 = ifrVals(), T = v0.T, TH = 410, TW = 330;
      const st = ctx._i3 = { n: 1 };
      const F = {
        B: { id: 'B', type: 'money', aria: 'boy', min: 0, get: () => C.get('ifrB'), set: (v) => C.set('ifrB', v) },
        r: { id: 'r', type: 'pct', aria: 'explain', disclose: true, get: () => C.get('ifrR'), set: (v) => C.set('ifrR', v) }
      };
      const sheet = () => {
        const v = ifrVals(); const rows = [];
        let b = v.B;
        for (let k = 0; k < v.T; k++) { const i = b * v.r; rows.push({ age: v.age + k, start: b, int: i, end: b + i, year: k + 1 }); b += i; }
        return { heading: ctx.t('wsTitle'), size: 'medium', columns: [col(ctx, 'age', 'wAge', 'age', { width: 80 }), col(ctx, 'start', 'wStart'), col(ctx, 'int', 'wInt'), col(ctx, 'end', 'wEnd'), col(ctx, 'year', 'wYear', 'year', { width: 80 })], rows, highlight: 'end' };
      };
      ctx.el.innerHTML = `
        <div class="b07-head" style="top:34px"><h1 class="st-h1"><button type="button" class="b07-ifr-name" data-rn="1">${stratHTML(ctx)}</button></h1></div>
        <div class="b07-card b07-abs" style="left:145px;top:140px;width:310px;padding:12px 18px">${inp(ctx, F.B)}</div>
        <div class="b07-abs" style="left:478px;top:150px;font:700 24px/50px var(--f-body);color:var(--navy)">${ctx.t('boy')}</div>
        <div class="b07-abs" style="left:135px;top:226px">${shapeSVG('tri', TW, TH, 'acct', 'g1')}</div>
        <div class="b07-ifr-in" style="left:${135 + TW / 2 - 62}px;top:${226 + TH * 0.56 - 23}px">${inp(ctx, F.r)}</div>
        <div class="b07-card b07-abs" style="left:600px;top:330px;width:690px;padding:36px 44px;font:500 30px/1.45 var(--f-body);color:var(--navy)">${ctx.t('explain')}</div>
        ${yearSlider(ctx, { x: 1392, y: 226, len: TH, T, onYear: (n) => { st.n = n; paint(); } })}
        <div class="b07-card b07-abs" style="left:145px;top:664px;width:310px;height:70px;display:grid;place-items:center;font:700 30px/1 var(--f-body);color:var(--navy)" data-eoy="1"></div>
        <div class="b07-abs" style="left:478px;top:674px;font:700 24px/50px var(--f-body);color:var(--navy)">${ctx.t('eoy')} <span class="num" data-n="1"></span></div>
        ${docBtn(ctx, sheet, 'position:absolute;left:1230px;top:684px')}
        ${discLine(ctx)}`;
      function paint() {
        const v = ifrVals(), n = clamp(st.n, 1, v.T);
        ctx.$('[data-eoy]').innerHTML = num(money(v.B * Math.pow(1 + v.r, n)));
        ctx.$('[data-n]').textContent = n;
        setFill(ctx.$('.g1'), n / v.T);
      }
      bindInputs(ctx, paint);
      bindSliders(ctx);
      wireDocFallback(ctx);
      ctx.on(ctx.$('[data-rn]'), 'click', () => renameStrategy(ctx, () => { ctx.$('[data-rn]').innerHTML = stratHTML(ctx); }));
      paint();
    },
    leave: leaveModals
  });

  /* ---------- ifr4: taxes grow with the account ---------- */
  EFA.screen('ifr4', {
    title: 'IFR tutorial: taxes grow with the account',
    copy: {
      c1: 'When interest keeps compounding inside a taxable investment, the balance can grow a great deal, and the tax you owe each year grows right along with it.',
      c2: 'On the next screen you will see that growth year by year, together with the rising tax and the opportunity cost lost on those tax payments.',
      _notes: 'Growth in a taxable account comes with a partner: the tax bill grows at the same pace.\n\n- Ask: When your account had its best year, what happened to your tax bill that year?\nPAUSE'
    },
    render(ctx) { ctx.el.innerHTML = bulletRows(ctx, ['c1', 'c2'], { x: 80, y: 230, w: 1440, gap: 60, cardStyle: 'font-size:34px;padding:30px 40px' }); }
  });

  /* ---------- ifr5: growth, increasing tax, and lost opportunity on the tax ---------- */
  EFA.screen('ifr5', {
    title: 'IFR tutorial: increasing tax and its opportunity cost',
    copy: withCommon(Object.assign({}, IFR_COMMON, {
      hTax: 'Interest Tax', hLoc: 'Lost Opportunity Cost\non Tax Paid', year: 'Year',
      boy: 'B.O.Y. Balance', ann: 'Annual Interest', eoy: 'E.O.Y. Balance',
      tAnn: 'Annual Tax Paid', tTot: 'Total Tax Paid', lAnn: 'Annual Opp. Cost', lTot: 'Total L.O.C.',
      net: 'Net (Balance - Taxes - LOC)',
      wsTitle: 'Compound Interest and Increasing Tax Worksheet',
      wAge: 'Age', wStart: 'Balance at Start of Year', wInt: 'Annual Interest Earned', wEnd: 'Balance at End of Year', wTax: 'Annual Taxes Paid', wCumTax: 'Cumulative Taxes Paid',
      wOE: 'Annual Opportunity Cost', wCumOE: 'Cumulative Lost Opportunity Cost', wNet: 'Net Growth', wYear: 'Year',
      _notes: 'Three triangles. The account grows, the tax on its interest grows with it, and every tax dollar paid gives up what it could have earned.\n\n- Walk the years with the slider. Then click the third heading to reveal the lost opportunity cost.\nPAUSE\n\n- Ask: Had anyone ever shown you what your taxes cost you beyond the check you write each April?\nPAUSE'
    })),
    render(ctx) {
      const v0 = ifrVals(), T = v0.T, TW = 300, TH = 390, Y0 = 172;
      const st = ctx._i5 = { n: 1, rev: false };
      const F = {
        B: { id: 'B', type: 'money', aria: 'boy', min: 0, get: () => C.get('ifrB'), set: (v) => C.set('ifrB', v) },
        r: { id: 'r', type: 'pct', aria: 'ann', disclose: true, get: () => C.get('ifrR'), set: (v) => C.set('ifrR', v) },
        t: { id: 't', type: 'pct', aria: 'hTax', min: 0, max: 1, get: () => C.get('tax'), set: (v) => C.set('tax', v) }
      };
      const cx = [200, 620, 1060];
      const sheet = () => {
        const v = ifrVals(), m = ifrRun('inc', v);
        return {
          heading: ctx.t('wsTitle'), size: 'full',
          columns: [col(ctx, 'age', 'wAge', 'age', { width: 80 }), col(ctx, 'boy', 'wStart'), col(ctx, 'int1', 'wInt'), col(ctx, 'eoy', 'wEnd'), col(ctx, 'tax', 'wTax'), col(ctx, 'cumTax', 'wCumTax'),
            col(ctx, 'oe', 'wOE'), col(ctx, 'cumOE', 'wCumOE'), col(ctx, 'net', 'wNet'), col(ctx, 'k', 'wYear', 'year', { width: 80 })],
          rows: m.rows, highlight: 'net'
        };
      };
      const ln = (k, o) => `<div class="ln">${ctx.t(k)}<span class="v ${o.cls || ''}" data-o="${o.id}"></span></div>`;
      ctx.el.innerHTML = `
        <div class="b07-abs" style="left:0;width:400px;top:26px;text-align:center"><button type="button" class="b07-ifr-name st-h2" data-rn="1" style="font-size:36px">${stratHTML(ctx)}</button></div>
        <div class="b07-card b07-abs" style="left:70px;top:90px;width:260px;padding:10px 14px">${inp(ctx, F.B)}</div>
        <div class="b07-ifr-lab" style="left:400px;width:440px;top:118px">${ctx.t('hTax')}</div>
        <div class="b07-ifr-lab link" data-rev="1" style="left:840px;width:440px;top:96px">${ctx.t('hLoc')}</div>
        <div class="b07-year" style="left:1320px;width:240px;top:60px">${ctx.t('year', { cls: 'k' })}<span class="n num" data-n="1"></span></div>
        <div class="b07-abs" style="left:${cx[0] - TW / 2}px;top:${Y0}px">${shapeSVG('tri', TW, TH, 'acct', 'g1')}</div>
        <div class="b07-abs" style="left:${cx[1] - TW / 2}px;top:${Y0}px">${shapeSVG('tri', TW, TH, 'tax', 'g2')}</div>
        <div class="b07-abs rev fade is-off" style="left:${cx[2] - TW / 2}px;top:${Y0}px">${shapeSVG('tri', TW, TH, 'loc', 'g3')}</div>
        <div class="b07-ifr-in" style="left:${cx[0] - 62}px;top:${Y0 + TH * 0.58 - 23}px">${inp(ctx, F.r)}</div>
        <div class="b07-ifr-in" style="left:${cx[1] - 62}px;top:${Y0 + TH * 0.58 - 23}px">${inp(ctx, F.t)}</div>
        ${yearSlider(ctx, { x: 1408, y: Y0, len: TH, T, onYear: (n) => { st.n = n; paint(); } })}
        <div class="b07-card b07-vcard" style="left:50px;top:590px;width:300px">${ln('boy', { id: 'boy' })}${ln('ann', { id: 'ann' })}${ln('eoy', { id: 'eoy' })}</div>
        <div class="b07-card b07-vcard" style="left:430px;top:590px;width:380px">${ln('tAnn', { id: 'tAnn', cls: 'cost' })}${ln('tTot', { id: 'tTot', cls: 'cost' })}</div>
        <div class="b07-card b07-vcard rev fade is-off" style="left:870px;top:590px;width:380px">${ln('lAnn', { id: 'lAnn', cls: 'cost' })}${ln('lTot', { id: 'lTot', cls: 'cost' })}</div>
        <div class="b07-card b07-vcard net" style="left:560px;top:722px;width:560px">${ln('net', { id: 'net' })}</div>
        ${docBtn(ctx, sheet, 'position:absolute;left:1316px;top:742px')}
        ${discLine(ctx, ['hypothetical'], 'max-width:1000px')}`;
      function paint() {
        const v = ifrVals(), n = clamp(st.n, 1, v.T), m = ifrRun('inc', v), row = m.at(n);
        const set = (id, val) => { ctx.$(`[data-o="${id}"]`).innerHTML = num(money(val)); };
        set('boy', row.boy); set('ann', row.int1); set('eoy', row.eoy);
        set('tAnn', row.tax); set('tTot', row.cumTax); set('lAnn', row.oe); set('lTot', row.cumOE);
        set('net', row.net);
        ctx.$('[data-n]').textContent = n;
        const fr = st.moved ? n / v.T : 0;
        ['.g1', '.g2', '.g3'].forEach((s) => setFill(ctx.$(s), s === '.g3' && !st.rev ? 0 : fr));
      }
      st.moved = true;
      bindInputs(ctx, paint);
      bindSliders(ctx);
      wireDocFallback(ctx);
      ctx.on(ctx.$('[data-rn]'), 'click', () => renameStrategy(ctx, () => { ctx.$('[data-rn]').innerHTML = stratHTML(ctx); }));
      ctx.on(ctx.$('[data-rev]'), 'click', () => {
        if (st.rev) return;
        st.rev = true; st.n = 1; st.moved = false;
        Object.values(ctx._sl).forEach((s) => s.set && s.set(1, true));
        ctx.show('.rev', true); ctx.$('[data-rev]').classList.remove('link');
        paint();
        ctx._i5slider = true;
      });
      const sl = Object.values(ctx._sl)[0]; const prev = sl.onInput;
      sl.onInput = (n) => { st.moved = true; prev(n); };
      paint();
    },
    leave: leaveModals
  });

  /* ---------- ifr6: the two alternatives ---------- */
  EFA.screen('ifr6', {
    title: 'IFR tutorial: the two alternatives',
    copy: {
      lead: 'Alternative Options:',
      c1: 'Flat tax: move only the earnings each year.',
      c2: 'Reducing tax: move principal and interest, all at once or over a number of years.',
      close: 'Let\'s look at each option on its own.',
      _notes: 'There are two ways to stop the tax from climbing: hold it level, or shrink it.\n\n- Ask: If you could keep your tax bill from growing every year, would that be worth a closer look?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b07-abs" style="left:160px;width:1280px;top:200px;display:grid;gap:34px">
          ${ctx.t('lead', { tag: 'p', attrs: 'style="margin:0;font:700 46px/1.15 var(--f-display);color:var(--navy)"' })}
          <div style="position:relative;height:300px">${bulletRows(ctx, ['c1', 'c2'], { x: 0, y: 0, w: 1152, gap: 34, cardStyle: 'font-size:34px;padding:28px 38px' })}</div>
          ${ctx.t('close', { tag: 'p', attrs: 'style="margin:0;font:700 46px/1.15 var(--f-display);color:var(--navy)"' })}
        </div>`;
    }
  });

  /* ---------- ifr7: flat tax explained ---------- */
  EFA.screen('ifr7', {
    title: 'IFR tutorial: flat tax explained',
    copy: Object.assign({}, IFR_COMMON, {
      head: 'Flat Tax Alternative',
      c1: 'To see the full value of the flat-tax approach, add the growth of the interest you move back to your original principal.',
      c2: 'The illustration moves each year\'s earnings from your starting investment (account 1) into a tax-favored account (account 2). Notice that the tax stays the same every year: it is flat.',
      _notes: 'The flat tax approach moves only the interest. The original principal stays put, so the tax on it stays the same every year.\n\n- Ask: What would it mean for you if your tax on this money never went up?\nPAUSE'
    }),
    render(ctx) {
      ctx.el.innerHTML = `<div class="b07-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${bulletRows(ctx, ['c1', 'c2'], { x: 80, y: 250, w: 1440, gap: 50, cardStyle: 'font-size:32px;padding:30px 40px' })}
        <p class="st-disclaimer b07-disc">${ctx.t('acct2Note')}</p>`;
    }
  });

  /* ---------- ifr9: reducing tax explained ---------- */
  EFA.screen('ifr9', {
    title: 'IFR tutorial: reducing tax explained',
    copy: Object.assign({}, IFR_COMMON, {
      head: 'Reducing Tax Alternative',
      c1: 'As the principal in your original account declines to zero, the earnings there, and the taxes paid on them, decline right along with it.',
      c2: 'The next screen shows interest and principal moving from your original account (account 1) into a tax-favorable account (account 2), along with the combined balance of both accounts.',
      _notes: 'The reducing approach moves principal and interest. As account 1 shrinks, so does the tax it creates.\n\n- Ask: If the tax could shrink a little every year instead of growing, how would that change your picture?\nPAUSE'
    }),
    render(ctx) {
      ctx.el.innerHTML = `<div class="b07-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${bulletRows(ctx, ['c1', 'c2'], { x: 80, y: 250, w: 1440, gap: 50, cardStyle: 'font-size:32px;padding:30px 40px' })}
        <p class="st-disclaimer b07-disc">${ctx.t('acct2Note')}</p>`;
    }
  });

  /* ---------- ifr12: takeaways ---------- */
  EFA.screen('ifr12', {
    title: 'IFR tutorial: takeaways',
    copy: {
      head: 'If You Hold a Taxable Investment Where Interest Compounds, Here Is What You Have Seen',
      c1: 'Compounding interest increases your taxes.',
      c2: 'Leveling the taxes means less of your wealth is transferred away.',
      c3: 'Moving both principal and earnings out of the taxable account to shrink the tax can cut the transfer even further, depending on how the other investment performs.',
      _notes: 'Three takeaways. The tax on a taxable account is a choice, and each choice moves a different amount of wealth away from the family.\n\n- Ask: Which of these approaches fits the way you want your money to work?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b07-head sm" style="left:170px;right:170px"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${bulletRows(ctx, ['c1', 'c2', 'c3'], { x: 80, y: 300, w: 1440, gap: 34, cardStyle: 'font-size:31px;padding:24px 38px' })}`;
    }
  });

  /* ---------- ifr8 / ifr10 shared frame ---------- */
  const IFR_ACCT = {
    a1: 'Taxable Account 1', taxH: 'Tax on Account 1\n& LOC on Tax', a2: 'Account 2', a2def: 'Tax Deferred', a2fav: 'Tax Favored', dfrH: 'Deferred Taxes', year: 'Year',
    boy: 'B.O.Y. Balance', ann: 'Annual Interest', eoy: 'E.O.Y. Balance',
    tAnn: 'Annual Tax Paid', tTot: 'Total Tax Paid', tLoc: 'L.O.C. on Tax', tDfr: 'Deferred Tax',
    net: 'Net of Accounts 1 + 2, Less Taxes and LOC',
    cmpNet: 'Net Result', cmpTax: 'Taxes Paid', cmpDiff: 'Difference', cmpClose: 'Close',
    chA1: 'Account 1', chA2: 'Account 2', chC: 'Combined',
    wAge: 'Age', wYear: 'Year', wWd: 'Withdrawal to Account 2', wBoy: 'Balance at Start of Year', wEarn: 'Annual Earnings', wEoy: 'Balance at End of Year',
    wTax: 'Annual Tax Paid From Lifestyle', wTotTax: 'Total Tax Paid From Lifestyle', wDep: 'Deposit From Account 1', wBoy2: 'Balance at Start of Year', wInt2: 'Annual Earnings',
    wEoy2: 'Balance at End of Year', wTax0: 'Annual Tax', wTot0: 'Total Tax', wCEarn: 'Combined Annual Earnings', wCEnd: 'Combined Balance at End of Year',
    wLoc: 'Lost Opportunity Cost on Tax', wDfr: 'Deferred Tax Liability', wNet: 'Net (Balance - Taxes - LOC - Deferred)'
  };
  const ROW1 = 22, GY = 156, GH = 370, CARDY = 552, NETY = 712, YRY = 104, SLY = 198;
  const X8 = { c1: 206, tax: 542, loc: 741, a2: 1004, dfr: 1274, yr: 1473 };
  /** the three worksheets of ifr8 / ifr10 */
  function acctSheets(ctx, m, keys) {
    const base = [col(ctx, 'age', 'wAge', 'age', { width: 70 })], yr = col(ctx, 'k', 'wYear', 'year', { width: 70 });
    return [
      { key: 'chA1', sheet: () => ({ heading: ctx.t(keys.a1), size: 'full', columns: base.concat([col(ctx, 'wd', 'wWd'), col(ctx, 'boy', 'wBoy'), col(ctx, 'int1', 'wEarn'), col(ctx, 'eoy', 'wEoy'), col(ctx, 'tax', 'wTax'), col(ctx, 'cumTax', 'wTotTax'), yr]), rows: m().rows }) },
      { key: 'chA2', sheet: () => ({ heading: ctx.t(keys.a2), size: 'full', columns: base.concat([col(ctx, 'wd', 'wDep'), col(ctx, 'boy2', 'wBoy2'), col(ctx, 'int2', 'wInt2'), col(ctx, 'eoy2', 'wEoy2'), col(ctx, 'z1', 'wTax0'), col(ctx, 'z2', 'wTot0'), yr]), rows: m().rows.map((r) => Object.assign({ z1: 0, z2: 0 }, r)) }) },
      { key: 'chC', sheet: () => ({ heading: ctx.t(keys.c), size: 'full', columns: base.concat([col(ctx, 'cInt', 'wCEarn'), col(ctx, 'gross', 'wCEnd'), col(ctx, 'cumTax', 'wTotTax'), col(ctx, 'cumOE', 'wLoc'), col(ctx, 'deferred', 'wDfr'), col(ctx, 'net', 'wNet'), yr]), rows: m().rows, highlight: 'net' }) }
    ];
  }
  /** cards row + net card of ifr8 / ifr10 */
  function acctCards(ctx, k1) {
    const ln = (k, id, cls) => `<div class="ln">${ctx.t(k)}<span class="v ${cls || ''}" data-o="${id}"></span></div>`;
    return `
      <div class="b07-card b07-vcard" style="left:26px;top:${CARDY}px;width:360px">${ln(k1[0], 'a1')}${ln(k1[1], 'a2')}${ln('eoy', 'a3')}</div>
      <div class="b07-card b07-vcard" style="left:422px;top:${CARDY}px;width:360px">${ln('tAnn', 't1', 'cost')}${ln('tTot', 't2', 'cost')}${ln('tLoc', 't3', 'cost')}</div>
      <div class="b07-card b07-vcard ac2" style="left:818px;top:${CARDY}px;width:360px">${ln(k1[2], 'b1')}${ln('ann', 'b2')}${ln('eoy', 'b3')}</div>
      <div class="b07-card b07-vcard ac2" style="left:1214px;top:${CARDY}px;width:360px">${ln('tAnn', 'd1', 'cost')}${ln('tTot', 'd2', 'cost')}${ln('tDfr', 'd3', 'cost')}</div>
      <div class="b07-card b07-vcard net" style="left:470px;top:${NETY}px;width:720px"><div class="ln">${ctx.t('net')}<span class="v click" data-o="net" role="button" tabindex="0"></span></div></div>`;
  }
  /** the account-2 header, graphics and outline (shared by ifr8 and ifr10) */
  function acct2Parts(ctx, F) {
    return `
      <div class="b07-ifr-lab link" data-a2="1" style="left:816px;width:388px;top:${ROW1 + 16}px"><span>${ctx.t('a2')}</span><span class="sub ac2">${ctx.t('a2def', { cls: 'a2def' })}${ctx.t('a2fav', { cls: 'a2fav' })}</span></div>
      <div class="b07-ifr-lab dfr" style="left:1204px;width:150px;top:${ROW1 + 16}px;font-size:17px">${ctx.t('dfrH')}</div>
      <div class="b07-abs dfr" style="left:822px;top:${GY - 12}px;width:526px;height:${GH + 30}px;border:2px solid var(--gold);border-radius:22px"></div>
      <div class="b07-abs ac2" style="left:${X8.a2 - 170}px;top:${GY}px">${shapeSVG('tri', 340, GH, 'acct2', 'gA2')}</div>
      <div class="b07-abs dfr" style="left:${X8.dfr - 60}px;top:${GY}px">${shapeSVG('tri', 120, GH, 'dfr', 'gDf')}</div>
      <div class="b07-ifr-in ac2" style="left:${X8.a2 - 62}px;top:${GY + GH * 0.6 - 23}px">${inp(ctx, F.f)}</div>`;
  }
  /** state of the account-2 label: 0 hidden, 1 tax-deferred, 2 tax-favored */
  function paintAcct2(ctx, state) {
    ctx.show('.ac2', state > 0);
    ctx.show('.dfr', state === 1);
    ctx.$$('.a2def').forEach((n) => { n.hidden = state === 2; });
    ctx.$$('.a2fav').forEach((n) => { n.hidden = state !== 2; });
  }

  /* ---------- ifr8: flat tax illustration ---------- */
  EFA.screen('ifr8', {
    title: 'IFR tutorial: flat tax illustration',
    copy: withCommon(Object.assign({}, IFR_COMMON, IFR_ACCT, {
      cmpAlt: 'Flat Tax Strategy',
      ws1: 'Flat Tax: Account 1', ws2: 'Flat Tax: Account 2', ws3: 'Flat Tax: Combined Accounts',
      _notes: 'Each year the interest moves out of account 1 at the start of the year, so account 1 stays level and its tax stays flat. Account 2 receives that interest and compounds.\n\n- Click Account 2 to reveal it; click again to switch between tax-deferred and tax-favored.\n- Click the net figure to compare with the increasing-tax strategy.\nPAUSE\n\n- Ask: How does a tax that never grows compare with one that grows every year?\nPAUSE'
    })),
    render(ctx) {
      const v0 = ifrVals(), T = v0.T;
      const st = ctx._i8 = { n: 1, a2: 0 };
      const F = {
        B: { id: 'B', type: 'money', aria: 'a1', min: 0, get: () => C.get('ifrB'), set: (v) => C.set('ifrB', v) },
        r: { id: 'r', type: 'pct', aria: 'a1', disclose: true, get: () => C.get('ifrR'), set: (v) => C.set('ifrR', v) },
        t: { id: 't', type: 'pct', aria: 'taxH', min: 0, max: 1, get: () => C.get('tax'), set: (v) => C.set('tax', v) },
        f: { id: 'f', type: 'pct', aria: 'a2', get: () => C.get('ifrF'), set: (v) => C.set('ifrF', v) }
      };
      const model = () => ifrRun('flat', ifrVals());
      ctx.el.innerHTML = `
        <div class="b07-ifr-lab" style="left:8px;width:396px;top:${ROW1}px">${ctx.t('a1')}</div>
        <div class="b07-card b07-abs" style="left:76px;top:${ROW1 + 38}px;width:260px;padding:10px 14px">${inp(ctx, F.B)}</div>
        <div class="b07-ifr-lab" style="left:404px;width:396px;top:${ROW1 + 16}px">${ctx.t('taxH')}</div>
        <div class="b07-year" style="left:1360px;width:226px;top:${YRY}px">${ctx.t('year', { cls: 'k' })}<span class="n num" data-n="1"></span></div>
        <div class="b07-abs" style="left:${X8.c1 - 150}px;top:${GY}px">${shapeSVG('rect', 300, GH, 'acct', 'gA1')}</div>
        <div class="b07-abs" style="left:${X8.tax - 110}px;top:${GY}px">${shapeSVG('rect', 220, GH, 'tax', 'gTx')}</div>
        <div class="b07-abs" style="left:${X8.loc - 50}px;top:${GY}px">${shapeSVG('tri', 100, GH, 'loc', 'gLc')}</div>
        <div class="b07-ifr-in" style="left:${X8.c1 - 62}px;top:${GY + GH / 2 - 23}px">${inp(ctx, F.r)}</div>
        <div class="b07-ifr-in" style="left:${X8.tax - 62}px;top:${GY + GH / 2 - 23}px">${inp(ctx, F.t)}</div>
        ${acct2Parts(ctx, F)}
        ${yearSlider(ctx, { x: X8.yr - 32, y: SLY, len: GY + GH - SLY, T, onYear: (n) => { st.n = n; paint(); } })}
        ${acctCards(ctx, ['boy', 'ann', 'boy'])}
        <button type="button" class="b07-doclink" data-docs="1" style="position:absolute;left:1300px;top:742px">${ICON.sheet}<span>${ctx.t('doc')}</span></button>
        ${discLine(ctx, ['hypothetical'], 'max-width:980px')}`;
      function paint() {
        const v = ifrVals(), n = clamp(st.n, 1, v.T), m = ifrRun('flat', v), row = m.at(n), inc = ifrRun('inc', v).at(n);
        const set = (id, val) => { const e = ctx.$(`[data-o="${id}"]`); if (e) e.innerHTML = num(money(val)); };
        set('a1', row.boy); set('a2', row.int1); set('a3', row.eoy);
        set('t1', row.tax); set('t2', row.cumTax); set('t3', row.cumOE);
        set('b1', row.boy2); set('b2', row.int2); set('b3', row.eoy2);
        set('d1', 0); set('d2', 0); set('d3', row.deferred);
        set('net', row.net);
        ctx.$('[data-n]').textContent = n;
        const fr = n / v.T;
        ['.gA1', '.gTx', '.gLc', '.gA2', '.gDf'].forEach((s) => setFill(ctx.$(s), fr));
        st.cmp = { altKey: 'cmpAlt', altNet: row.net, altTax: row.cumTax, incNet: inc.net, incTax: inc.cumTax, dNet: row.net - inc.net, dTax: row.cumTax - inc.cumTax };
        paintAcct2(ctx, st.a2);
      }
      bindInputs(ctx, paint);
      bindSliders(ctx);
      ctx.on(ctx.$('[data-a2]'), 'click', () => {
        st.a2 = st.a2 === 0 ? 1 : (st.a2 === 1 ? 2 : 1);
        C.set('ifrFree', st.a2 === 2);
        if (st.a2 === 1 && !ctx._i8shown) { ctx._i8shown = true; st.n = 1; Object.values(ctx._sl).forEach((s) => s.set && s.set(1, true)); }
        paint();
      });
      ctx.on(ctx.$('[data-o="net"]'), 'click', () => comparePopup(ctx, st.cmp));
      ctx.on(ctx.$('[data-docs]'), 'click', () => chooser(ctx, acctSheets(ctx, model, { a1: 'ws1', a2: 'ws2', c: 'ws3' })));
      paint();
    },
    leave: leaveModals
  });

  /** bold arrow pointing down and to the right (account 1 emptied at once, toward account 2) */
  function bigArrow() {
    const w = 360, h = 360;
    const tail = [62, 70], tip = [300, 300], ang = Math.atan2(tip[1] - tail[1], tip[0] - tail[0]);
    const nx = -Math.sin(ang), ny = Math.cos(ang), sw = 26, hw = 66, hl = 104;
    const bx = tip[0] - Math.cos(ang) * hl, by = tip[1] - Math.sin(ang) * hl;
    const p = (x, y) => `${x.toFixed(1)},${y.toFixed(1)}`;
    const poly = [p(tail[0] + nx * sw, tail[1] + ny * sw), p(bx + nx * sw, by + ny * sw), p(bx + nx * hw, by + ny * hw), p(tip[0], tip[1]), p(bx - nx * hw, by - ny * hw), p(bx - nx * sw, by - ny * sw), p(tail[0] - nx * sw, tail[1] - ny * sw)].join(' ');
    return `<svg viewBox="0 0 ${w} ${h + 20}" width="${w}" height="${h + 20}" aria-hidden="true">
      <ellipse cx="190" cy="${h + 6}" rx="150" ry="9" fill="rgba(13,30,58,.10)"/>
      <polygon points="${poly}" fill="${P.navy3}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="${p(bx + nx * hw, by + ny * hw)} ${p(tip[0], tip[1])} ${p(bx - nx * hw, by - ny * hw)}" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="${tail[0]}" cy="${tail[1]}" r="30" fill="${P.paper}" stroke="${P.navy}" stroke-width="5"/>
      <text x="${tail[0]}" y="${tail[1] + 9}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="26" fill="${P.navy}">$</text>
    </svg>`;
  }

  /* ---------- ifr10: reducing tax illustration ---------- */
  EFA.screen('ifr10', {
    title: 'IFR tutorial: reducing tax illustration',
    copy: withCommon(Object.assign({}, IFR_COMMON, IFR_ACCT, {
      wdr: 'B.O.Y. Withdrawal', dep: 'B.O.Y. Deposit',
      redA: 'Reduce Over', redB: 'Years',
      intro: 'First, let\'s look at what happens if everything moves at once, with the stroke of a pen.', ok: 'OK',
      cmpAlt: 'Reducing Strategy',
      ws1: 'Reducing Tax: Account 1', ws2: 'Reducing Tax: Account 2', ws3: 'Reducing Tax: Combined Accounts',
      wC: 'Combined Annual Earnings',
      _notes: 'Account 1 is emptied by equal withdrawals at the start of each year. As it shrinks, its interest and its tax shrink too, and every withdrawal goes on compounding in account 2.\n\n- Start with one year, the stroke of a pen. Then change Reduce Over to spread the move across several years.\n- Click the net figure to compare with the increasing-tax strategy.\nPAUSE\n\n- Ask: Would you rather your tax bill shrink each year, or grow?\nPAUSE'
    })),
    render(ctx) {
      const v0 = ifrVals(), T = v0.T;
      const st = ctx._i10 = { n: 1, a2: v0.taxFree ? 2 : 1, intro: v0.P === 1 };
      const F = {
        B: { id: 'B', type: 'money', aria: 'a1', min: 0, get: () => C.get('ifrB'), set: (v) => C.set('ifrB', v) },
        r: { id: 'r', type: 'pct', aria: 'a1', disclose: true, get: () => C.get('ifrR'), set: (v) => C.set('ifrR', v) },
        t: { id: 't', type: 'pct', aria: 'taxH', min: 0, max: 1, get: () => C.get('tax'), set: (v) => C.set('tax', v) },
        f: { id: 'f', type: 'pct', aria: 'a2', disclose: true, get: () => C.get('ifrF'), set: (v) => C.set('ifrF', v) },
        P: { id: 'P', type: 'int', aria: 'redA', min: 1, get: () => clamp(Math.round(C.get('ifrP')), 1, ifrVals().T), set: (v) => C.set('ifrP', clamp(Math.round(v), 1, ifrVals().T)) }
      };
      const model = () => ifrRun('red', ifrVals());
      ctx.el.innerHTML = `
        <div class="b07-ifr-lab" style="left:8px;width:396px;top:${ROW1}px">${ctx.t('a1')}</div>
        <div class="b07-card b07-abs" style="left:76px;top:${ROW1 + 38}px;width:260px;padding:10px 14px">${inp(ctx, F.B)}</div>
        <div class="b07-ifr-lab tri-on" style="left:404px;width:396px;top:${ROW1 + 16}px">${ctx.t('taxH')}</div>
        <div class="b07-card b07-abs" style="left:1372px;top:${ROW1 - 8}px;width:200px;padding:8px 14px;display:grid;gap:6px;justify-items:center;font:700 16px/1.1 var(--f-body);letter-spacing:.06em;text-transform:uppercase;color:var(--navy)">${ctx.t('redA')}<span style="display:flex;align-items:center;gap:10px;text-transform:none;letter-spacing:0;font-size:18px"><span style="width:70px">${inp(ctx, F.P)}</span>${ctx.t('redB')}</span></div>
        <div class="b07-year" style="left:1360px;width:226px;top:${YRY}px">${ctx.t('year', { cls: 'k' })}<span class="n num" data-n="1"></span></div>
        <div class="tri-on">
          <div class="b07-abs" data-inv="a1" style="left:${X8.c1 - 150}px;top:${GY}px;transform-origin:150px 0">${shapeSVG('inv', 300, GH, 'acct', 'gA1')}</div>
          <div class="b07-abs" data-inv="tx" style="left:${X8.tax - 110}px;top:${GY}px;transform-origin:110px 0">${shapeSVG('inv', 220, GH, 'tax', 'gTx')}</div>
          <div class="b07-abs" style="left:${X8.loc - 50}px;top:${GY}px">${shapeSVG('tri', 100, GH, 'loc', 'gLc')}</div>
          <div class="b07-ifr-in sm" style="left:${X8.c1 - 58}px;top:${GY + 14}px;width:116px">${inp(ctx, F.r)}</div>
          <div class="b07-ifr-in sm" style="left:${X8.tax - 58}px;top:${GY + 14}px;width:116px">${inp(ctx, F.t)}</div>
        </div>
        <div class="b07-abs arrow-on" style="left:${X8.c1 - 170}px;top:${GY - 4}px">${bigArrow()}</div>
        ${acct2Parts(ctx, F)}
        ${yearSlider(ctx, { x: X8.yr - 32, y: SLY, len: GY + GH - SLY, T, onYear: (n) => { st.n = n; paint(); } })}
        ${acctCards(ctx, ['wdr', 'ann', 'dep'])}
        <div class="b07-card b07-abs intro" style="left:60px;top:${GY - 6}px;width:1480px;height:${GH + 12}px;display:grid;place-content:center;justify-items:center;gap:30px;text-align:center;z-index:5">
          ${ctx.t('intro', { tag: 'p', attrs: 'style="margin:0;max-width:1100px;font:700 44px/1.3 var(--f-body);color:var(--navy)"' })}
          <button type="button" class="b07-btn" data-ok="1" style="min-width:160px">${ctx.t('ok')}</button>
        </div>
        <button type="button" class="b07-doclink" data-docs="1" style="position:absolute;left:1300px;top:742px">${ICON.sheet}<span>${ctx.t('doc')}</span></button>
        ${discLine(ctx, ['hypothetical'], 'max-width:980px')}`;
      function paint() {
        const v = ifrVals(), n = clamp(st.n, 1, v.T), m = ifrRun('red', v), row = m.at(n), inc = ifrRun('inc', v).at(n);
        const z = (x) => Math.max(0, x);
        const set = (id, val) => { const e = ctx.$(`[data-o="${id}"]`); if (e) e.innerHTML = num(money(z(val))); };
        set('a1', row.wd); set('a2', row.int1); set('a3', row.eoy);
        set('t1', row.tax); set('t2', row.cumTax); set('t3', row.cumOE);
        set('b1', row.wd); set('b2', row.int2); set('b3', row.eoy2);
        set('d1', 0); set('d2', 0); set('d3', row.deferred);
        set('net', row.net);
        ctx.$('[data-n]').textContent = n;
        const P1 = v.P, s = P1 / v.T, fr = n / v.T;
        ctx.$$('[data-inv]').forEach((d) => { d.style.transform = `scale(${s})`; });
        const pale = (n === 1 || n > P1) ? 1 : (P1 - n) / P1;
        setFill(ctx.$('.gA1'), pale); setFill(ctx.$('.gTx'), pale);
        ['.gLc', '.gA2', '.gDf'].forEach((q) => setFill(ctx.$(q), fr));
        ctx.show('.tri-on', P1 > 1); ctx.show('.arrow-on', P1 === 1);
        ctx.show('.intro', st.intro);
        st.cmp = { altKey: 'cmpAlt', altNet: z(row.net), altTax: z(row.cumTax), incNet: z(inc.net), incTax: z(inc.cumTax), dNet: row.net - inc.net, dTax: row.cumTax - inc.cumTax };
        paintAcct2(ctx, st.a2);
      }
      bindInputs(ctx, (id) => {
        if (id === 'P') { st.n = 1; Object.values(ctx._sl).forEach((x) => x.set && x.set(1, true)); }
        paint();
      });
      bindSliders(ctx);
      ctx.on(ctx.$('[data-ok]'), 'click', () => { st.intro = false; paint(); });
      ctx.on(ctx.$('[data-a2]'), 'click', () => { st.a2 = st.a2 === 2 ? 1 : 2; C.set('ifrFree', st.a2 === 2); paint(); });
      ctx.on(ctx.$('[data-o="net"]'), 'click', () => comparePopup(ctx, st.cmp));
      ctx.on(ctx.$('[data-docs]'), 'click', () => chooser(ctx, acctSheets(ctx, model, { a1: 'ws1', a2: 'ws2', c: 'ws3' })));
      paint();
    },
    leave: leaveModals
  });

  /* ---------- ifr11: four-strategy results summary ---------- */
  EFA.css('b07-ifr11', `
  .b07-s11 { position: absolute; left: 40px; width: 1520px; top: 150px; }
  .b07-s11-h { display: grid; grid-template-columns: 30% repeat(4, 1fr); align-items: end; height: 70px; }
  .b07-s11-h button { background: none; border: 0; cursor: pointer; font: 700 21px/1.2 var(--f-body); color: var(--navy); text-align: right; padding: 0 22px 8px 0; letter-spacing: .02em; }
  .b07-s11-h button:hover { color: var(--gold-deep); }
  .b07-s11-h .sub { display: block; font-size: 16px; font-weight: 600; color: var(--muted); }
  .b07-s11-r { display: grid; grid-template-columns: 30% repeat(4, 1fr); align-items: center; height: 64px; margin-top: 12px; transition: background .25s ease; }
  .b07-s11-r.hl { background: var(--gold-pale); border-color: var(--gold-lt); }
  .b07-s11-r .lab { font: 700 21px/1.2 var(--f-body); color: var(--navy); padding-left: 24px; cursor: pointer; }
  .b07-s11-r .lab:hover { color: var(--gold-deep); }
  .b07-s11-r .v { text-align: right; padding-right: 22px; font: 700 24px/1 var(--f-body); color: var(--navy); }
  .b07-s11-r .v.cost { color: ${COST}; }
  .b07-s11-r .ast { cursor: pointer; color: var(--gold-deep); font-weight: 700; margin-left: 4px; }
  .b07-s11-imp { margin-left: 30%; grid-template-columns: repeat(4, 1fr); }
  .b07-s11-imp .lab { padding-left: 0; text-align: right; padding-right: 22px; color: var(--gold-deep); }
  .b07-s11-imp .v { color: var(--gold-deep); }
  .b07-s11-docs { display: grid; grid-template-columns: 30% repeat(4, 1fr); margin-top: 16px; }
  .b07-s11-docs button { justify-self: end; margin-right: 16px; }
  .b07-colhl { position: absolute; top: 150px; height: 600px; border: 3px solid var(--gold); background: rgba(213,189,104,.18); border-radius: 16px; pointer-events: none; transition: opacity .3s ease, left .3s ease; }
  `);
  EFA.screen('ifr11', {
    title: 'IFR tutorial: summary of four strategies',
    copy: withCommon(Object.assign({}, IFR_COMMON, {
      head: 'Summary of Results at the End of Year', subA: 'Account 2 provides', subFav: 'tax-favored', subDef: 'tax-deferred', subB: 'withdrawals',
      cInc: 'Increasing Tax', cFlat: 'Flat Tax', cImm: 'Immediate Pay Down', cRed: 'Reducing Tax', cRedSub: 'Over', cRedSub2: 'Years', cRedSub1: 'Year',
      rBal: 'Balance of Account 1+2', rTax: 'Taxes Paid From Lifestyle', rOc: 'Opportunity Cost of Taxes', rDfr: 'Deferred Taxes', rNet: 'Net (Balance - Taxes & LOC)', rImp: 'Improvement:',
      ast: '*',
      sdTitle: 'Strategy Disclosure',
      sdBody: 'Current tax law generally limits the ability of an immediate pay-down to produce tax-free withdrawals. Before relying on this option, confirm with qualified financial and tax professionals that it is available for your situation.',
      sdClose: 'Close',
      vA1: 'Account 1', vA2: 'Account 2', vC: 'Combined Accounts', vO: 'Tax At Opportunity',
      tInc: 'Increasing Tax', tFlat: 'Flat Tax', tImm: 'Immediate Pay Down', tRed: 'Reducing Tax',
      wAge: 'Age', wYear: 'Year', wBoy: 'Balance at Start of Year', wInt: 'Annual Interest', wEoy: 'Balance at End of Year', wTax: 'Annual Tax', wCumTax: 'Cumulative Tax',
      wNetG: 'Net Growth (Balance - Cumulative Tax)', wPotS: 'Tax Pot at Start of Year', wOE: 'Opportunity Earnings on Tax', wCumOE: 'Cumulative Opportunity Earnings',
      wTaxIn: 'Tax Deposited From Account 1', wCumOrd: 'Cumulative Ordinary Tax', wPotE: 'Tax Pot at End of Year',
      wWd: 'Withdrawal to Account 2', wEarn: 'Annual Earnings', wTaxL: 'Annual Tax Paid From Lifestyle', wTotL: 'Total Tax Paid From Lifestyle',
      wDep: 'Deposit', wTax0: 'Annual Tax', wTot0: 'Total Tax', wCBoy: 'Combined Balance at Start of Year', wCInt: 'Combined Annual Earnings',
      wCEoy: 'Combined Balance at End of Year', wCNet: 'Net (Combined Balance - Cumulative Tax)',
      _notes: 'Four ways to handle the same account, side by side at the end of the period: let the tax increase, hold it flat, move everything at once, or reduce it over time.\n\n- Click a row or a column to highlight it while you talk. Click the subheading to switch account 2 between tax-favored and tax-deferred.\nPAUSE\n\n- Ask: Looking at the net row, which of these would you want working for your family?\nPAUSE'
    })),
    render(ctx) {
      const KS = ['inc', 'flat', 'imm', 'red'];
      const st = ctx._i11 = { row: -1, col: -1 };
      ctx.el.innerHTML = `
        <div class="b07-head sm" style="top:28px;gap:8px"><h1 class="st-h1">${ctx.t('head')} <span class="num" data-T="1"></span></h1>
          <button type="button" class="b07-link" data-sub="1" style="font-size:22px">${ctx.t('subA')} ${ctx.t('subFav', { cls: 'fav' })}${ctx.t('subDef', { cls: 'def' })} ${ctx.t('subB')}</button></div>
        <div class="b07-colhl" data-colhl="1" style="opacity:0"></div>
        <div class="b07-s11">
          <div class="b07-s11-h"><span></span>
            <button type="button" data-col="0">${ctx.t('cInc')}</button><button type="button" data-col="1">${ctx.t('cFlat')}</button>
            <button type="button" data-col="2">${ctx.t('cImm')}</button><button type="button" data-col="3">${ctx.t('cRed')}<span class="sub">${ctx.t('cRedSub')} <span class="num" data-P="1"></span> ${ctx.t('cRedSub2', { cls: 'pl' })}${ctx.t('cRedSub1', { cls: 'sg' })}</span></button></div>
          ${['rBal', 'rTax', 'rOc', 'rDfr', 'rNet'].map((k, i) => `<div class="b07-card b07-s11-r" data-row="${i}"><span class="lab" data-rl="${i}">${ctx.t(k)}</span>${KS.map((s) => `<span class="v ${i >= 1 && i <= 3 ? 'cost' : ''}" data-v="${i}-${s}"></span>`).join('')}</div>`).join('')}
          <div class="b07-card b07-s11-r b07-s11-imp" data-row="5"><span class="lab" data-rl="5">${ctx.t('rImp')}</span>${KS.slice(1).map((s) => `<span class="v" data-v="5-${s}"></span>`).join('')}</div>
          <div class="b07-s11-docs"><span></span>${KS.map((s) => `<button type="button" class="b07-doclink" data-doc11="${s}">${ICON.sheet}<span>${ctx.t('doc')}</span></button>`).join('')}</div>
        </div>
        ${discLine(ctx, ['hypothetical'], 'max-width:1000px')}`;
      function paint() {
        const v = ifrVals(), R = ifrAll(v);
        ctx.$('[data-T]').textContent = v.T; ctx.$('[data-P]').textContent = v.P;
        ctx.$$('.pl').forEach((n) => { n.hidden = v.P === 1; }); ctx.$$('.sg').forEach((n) => { n.hidden = v.P !== 1; });
        ctx.$$('.fav').forEach((n) => { n.hidden = !v.taxFree; }); ctx.$$('.def').forEach((n) => { n.hidden = v.taxFree; });
        KS.forEach((s) => {
          const m = R[s], vals = [m.gross, m.taxes, m.oc, m.deferred, m.net];
          vals.forEach((x, i) => {
            const cell = ctx.$(`[data-v="${i}-${s}"]`);
            cell.innerHTML = num(money(x)) + (s === 'imm' && i === 3 && v.taxFree ? `<span class="ast" data-ast="1" role="button" tabindex="0">${ctx.t('ast')}</span>` : '');
          });
          if (s !== 'inc') ctx.$(`[data-v="5-${s}"]`).innerHTML = num(money(m.net - R.inc.net));
        });
        const ast = ctx.$('[data-ast]');
        if (ast) ctx.on(ast, 'click', onAst);
        if (EFA.edit && EFA.edit.on) EFA.edit.arm(ctx.el);
      }
      function onAst() {
        C.set('ifrIp', !C.get('ifrIp'));
        paint();
        if (!ctx._i11disc) {
          ctx._i11disc = true;
          const m = modal(ctx, { width: 760, closable: false, title: ctx.t('sdTitle'), body: ctx.t('sdBody', { tag: 'p', attrs: 'style="margin:0;font:400 22px/1.55 var(--f-body);color:var(--navy)"' }), foot: `<button type="button" class="b07-btn" data-sdc="1">${ctx.t('sdClose')}</button>` });
          m.querySelector('[data-sdc]').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) m.close(); });
        }
      }
      ctx.on(ctx.$('[data-sub]'), 'click', () => { C.set('ifrFree', !C.get('ifrFree')); paint(); });
      ctx.on(ctx.$$('[data-rl]'), 'click', (e, n) => {
        const i = +n.dataset.rl; st.row = st.row === i ? -1 : i;
        ctx.$$('[data-row]').forEach((r) => r.classList.toggle('hl', +r.dataset.row === st.row));
      });
      ctx.on(ctx.$$('[data-col]'), 'click', (e, n) => {
        const i = +n.dataset.col; st.col = st.col === i ? -1 : i;
        const hl = ctx.$('[data-colhl]');
        if (st.col < 0) { hl.style.opacity = 0; return; }
        const x0 = 40 + 1520 * 0.3, cw = 1520 * 0.7 / 4;
        hl.style.left = (x0 + cw * st.col - 6) + 'px'; hl.style.width = (cw + 12) + 'px'; hl.style.opacity = 1;
      });
      const sheets = (s) => {
        const age = col(ctx, 'age', 'wAge', 'age', { width: 70 }), yr = col(ctx, 'k', 'wYear', 'year', { width: 70 });
        const T = { inc: 'tInc', flat: 'tFlat', imm: 'tImm', red: 'tRed' }[s];
        const head = (vk) => `${ctx.t(T)} ${ctx.t(vk)}`;
        const m = () => ifrRun(s, ifrVals());
        const opp = { key: 'vO', sheet: () => ({ heading: head('vO'), size: 'full', columns: [age, col(ctx, 'potStart', 'wPotS'), col(ctx, 'oe', 'wOE'), col(ctx, 'cumOE', 'wCumOE'), col(ctx, 'tax', 'wTaxIn'), col(ctx, 'cumTax', 'wCumOrd'), col(ctx, 'pot', 'wPotE'), yr], rows: m().rows }) };
        if (s === 'inc') {
          return [{ key: 'vA1', sheet: () => ({ heading: head('vA1'), size: 'full', columns: [age, col(ctx, 'boy', 'wBoy'), col(ctx, 'int1', 'wInt'), col(ctx, 'eoy', 'wEoy'), col(ctx, 'tax', 'wTax'), col(ctx, 'cumTax', 'wCumTax'), col(ctx, 'netGrowth', 'wNetG'), yr], rows: m().rows }) }, opp];
        }
        return [
          { key: 'vA1', sheet: () => ({ heading: head('vA1'), size: 'full', columns: [age, col(ctx, 'wd', 'wWd'), col(ctx, 'boy', 'wBoy'), col(ctx, 'int1', 'wEarn'), col(ctx, 'eoy', 'wEoy'), col(ctx, 'tax', 'wTaxL'), col(ctx, 'cumTax', 'wTotL'), yr], rows: m().rows }) },
          { key: 'vA2', sheet: () => ({ heading: head('vA2'), size: 'full', columns: [age, col(ctx, 'wd', 'wDep'), col(ctx, 'boy2', 'wBoy'), col(ctx, 'int2', 'wEarn'), col(ctx, 'eoy2', 'wEoy'), col(ctx, 'z1', 'wTax0'), col(ctx, 'z2', 'wTot0'), yr], rows: m().rows.map((r) => Object.assign({ z1: 0, z2: 0 }, r)) }) },
          { key: 'vC', sheet: () => ({ heading: head('vC'), size: 'full', columns: [age, col(ctx, 'cBoy', 'wCBoy'), col(ctx, 'cInt', 'wCInt'), col(ctx, 'gross', 'wCEoy'), col(ctx, 'tax', 'wTaxL'), col(ctx, 'cumTax', 'wTotL'), col(ctx, 'cNet', 'wCNet'), yr], rows: m().rows, highlight: 'cNet' }) },
          opp
        ];
      };
      ctx.on(ctx.$$('[data-doc11]'), 'click', (e, n) => chooser(ctx, sheets(n.dataset.doc11)));
      paint();
    },
    leave: leaveModals
  });

  /* =====================================================================
     INCTAX: federal income tax engine (tables from EFA.data.fed)
     ===================================================================== */
  const FS = ['single', 'mfj', 'mfs', 'hoh'];
  /** bracket tops end_1..end_6 and rates rate_1..rate_7 for a status (0..3); null while the tables are not loaded */
  function taxTables(status) {
    const f = D('fed'); if (!f || !f.brackets) return null;
    const b = f.brackets[FS[status]]; if (!Array.isArray(b) || b.length !== 7) return null;
    const ends = b.slice(0, 6).map((x) => +x.upTo), rates = b.map((x) => +x.rate);
    if (ends.some((x) => !isFinite(x)) || rates.some((x) => !isFinite(x))) return null;
    const base = []; ends.forEach((e, i) => { base.push(i === 0 ? e * rates[0] : base[i - 1] + (e - ends[i - 1]) * rates[i]); });
    return { year: +f.year, ends, rates, base };
  }
  /** standard deduction for the status and ticked boxes (with the 2025-2028 senior deduction) */
  function stdDeduction(o) {
    const f = D('fed'); if (!f || !f.standardDeduction || !f.additionalStdDeduction) return null;
    const key = FS[o.status], base = +f.standardDeduction[key];
    const per = +f.additionalStdDeduction[key === 'single' || key === 'hoh' ? 'unmarried' : 'married'];
    const capMap = f.additionalStdDeductionMaxBoxes || {}, cap = capMap[key] != null ? +capMap[key] : (key === 'mfj' ? 4 : 2);
    let boxes = (o.c65 ? 1 : 0) + (o.cBlind ? 1 : 0) + (key === 'mfj' ? (o.s65 ? 1 : 0) + (o.sBlind ? 1 : 0) : 0);
    boxes = Math.min(boxes, cap);
    let senior = 0; const sd = f.seniorDeduction, Y = +f.year;
    if (sd && Y >= +sd.firstYear && Y <= +sd.lastYear && key !== 'mfs') {
      const n = key === 'mfj' ? (o.c65 ? 1 : 0) + (o.s65 ? 1 : 0) : (o.c65 ? 1 : 0);
      if (n) {
        const thr = key === 'mfj' ? +sd.phaseoutStart.mfj : +sd.phaseoutStart.single;
        senior = Math.max(0, n * +sd.amount - n * +sd.phaseoutRate * Math.max(0, o.gross - thr));
      }
    }
    return base + per * boxes + senior;
  }
  /** tax, marginal and effective rate, headroom and the per-bracket split for a taxable income */
  function incomeTax(status, taxable) {
    const tb = taxTables(status); if (!tb) return null;
    const { ends, rates, base } = tb;
    let c = 7; for (let i = 0; i < 6; i++) { if (taxable <= ends[i]) { c = i + 1; break; } }
    const tax = taxable <= 0 ? 0 : (c === 1 ? taxable * rates[0] : base[c - 2] + (taxable - ends[c - 2]) * rates[c - 1]);
    let m = 7; for (let i = 0; i < 6; i++) { if (taxable < ends[i]) { m = i + 1; break; } }
    const split = [Math.min(tax, base[0])];
    for (let k = 2; k <= 6; k++) split.push(tax < base[k - 2] ? null : (tax > base[k - 1] ? base[k - 1] - base[k - 2] : tax - base[k - 2]));
    split.push(tax < base[5] ? null : tax - base[5]);
    return { year: tb.year, tax, marginal: rates[m - 1], effective: taxable > 0 ? tax / taxable : 0, headroom: m === 7 ? 0 : ends[m - 1] - taxable, split, tb };
  }
  EFA.engines.incomeTax = { tables: taxTables, standardDeduction: stdDeduction, compute: incomeTax, statuses: FS.slice() };

  EFA.css('b07-tax', `
  .b07-sel { height: 46px; width: 320px; border: 1.5px solid var(--mist-2); border-radius: 10px; background: #fff; padding: 0 12px; font: 600 20px/1 var(--f-body); color: var(--navy); }
  .b07-sel:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(184,151,46,.22); }
  .b07-edit-only { display: none; }
  body.editing .b07-edit-only { display: flex; flex-wrap: wrap; gap: 6px 12px; justify-content: flex-end; font: 600 14px/1.2 var(--f-body); color: var(--muted); max-width: 420px; }
  .b07-tx-row { display: grid; grid-template-columns: 1fr 320px; align-items: center; column-gap: 24px; min-height: 54px; }
  .b07-tx-row + .b07-tx-row { border-top: 1px solid rgba(13,30,58,.07); }
  .b07-tx-row .b07-in { width: 210px; justify-self: end; }
  .b07-tx-out { justify-self: end; width: 210px; text-align: right; font: 700 24px/1 var(--f-body); color: var(--navy); padding-right: 15px; }
  .b07-tx-boxes { display: flex; gap: 26px; justify-content: flex-end; font: 600 19px/1 var(--f-body); color: var(--navy); }
  .b07-tx-boxes label { display: inline-flex; align-items: center; gap: 7px; cursor: pointer; }
  .b07-tx-boxes .who { color: var(--muted); }
  .b07-tx-dl { display: inline-flex; align-items: center; gap: 10px; }
  .b07-tx-dl .b07-link { font-size: 22px; position: relative; }
  .b07-tx-dl .ext { color: var(--gold-deep); display: inline-grid; }
  .b07-tx-dl .b07-link .tipx { display: none; position: absolute; left: 0; top: calc(100% + 8px); background: var(--navy); color: var(--cream); font: 500 15px/1.35 var(--f-body); padding: 8px 12px; border-radius: 8px; width: 330px; z-index: 5; text-align: left; }
  .b07-tx-dl .b07-link:hover .tipx { display: block; }
  .b07-tx-res { position: absolute; left: 120px; width: 1360px; display: grid; grid-template-columns: 1fr 340px 300px; gap: 22px; align-items: end; }
  .b07-tx-card { padding: 20px 30px; display: grid; gap: 4px; }
  .b07-tx-card .ln { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 0; font: 600 24px/1.2 var(--f-body); color: var(--navy); }
  .b07-tx-card .ln + .ln { border-top: 1px solid rgba(13,30,58,.08); }
  .b07-tx-card .ln .v { font: 700 30px/1 var(--f-body); color: var(--navy); }
  .b07-tx-card .ln.big .v { color: var(--gold-deep); font-size: 36px; }
  .b07-tx-pan { padding: 14px 18px; }
  .b07-tx-pan h3 { margin: 0 0 8px; font: 700 14px/1.2 var(--f-body); letter-spacing: .16em; text-transform: uppercase; color: var(--gold-deep); text-align: center; }
  .b07-tx-pan .r { display: flex; justify-content: space-between; gap: 10px; font: 500 17px/1.75 var(--f-body); color: var(--navy); border-top: 1px solid rgba(13,30,58,.06); }
  .b07-tx-pan .r.on { background: var(--gold-pale); font-weight: 700; margin: 0 -8px; padding: 0 8px; border-radius: 6px; }
  .b07-tx-pan .r .rt { font-weight: 700; }
  `);
  const TAX_COPY = {
    stSingle: 'Single', stMfj: 'Married Filing Jointly', stMfs: 'Married Filing Separately', stHoh: 'Head of Household'
  };
  const statusKeys = ['stSingle', 'stMfj', 'stMfs', 'stHoh'];
  /** native dropdown; its option names stay editable through a row that only shows while wording is edited */
  const statusSelect = (ctx, id, val) => `<span style="display:grid;gap:6px;justify-items:end"><select class="b07-sel" id="${id}" aria-label="${esc(ctx.text('lStatus'))}">${statusKeys.map((k, i) => `<option value="${i}" ${i === val ? 'selected' : ''}>${esc(ctx.text(k))}</option>`).join('')}</select>
    <span class="b07-edit-only">${statusKeys.map((k) => ctx.t(k)).join('')}</span></span>`;

  /* ---------- incTax1: federal tax estimator ---------- */
  EFA.screen('incTax1', {
    title: 'Federal income tax estimator',
    copy: withCommon(Object.assign({}, TAX_COPY, {
      head: 'What Is Your Federal Tax Liability?',
      lStatus: 'Select your filing status', lGross: 'Enter Your Gross Income', lMagi: 'Enter Your Modified AGI',
      lStd: 'Standard Deduction', lItem: 'Itemized Deductions',
      tipToItem: 'Click to enter itemized deductions yourself. The amount field becomes editable.',
      tipToStd: 'Click to use the standard deduction. The amount is filled in for you and locked.',
      extTip: 'IRS standard deduction helper',
      lClient: 'Client:', lSpouse: 'Spouse:', l65: '65+', lBlind: 'Blind',
      lTaxable: 'Your Taxable Income',
      calc: 'Calculate',
      rTax: 'Federal Tax:', rMarg: 'Marginal Tax Rate:', rEff: 'Effective Tax Rate:', rRoom: 'Room to Next Bracket:',
      pBr: 'Marginal Tax Brackets', pYour: 'Your Tax',
      irs: 'IRS Tax Tables', use: 'Use Result',
      est: 'Estimate of regular federal income tax only. It leaves out credits, capital gains rates, the alternative minimum tax and state tax. The effective rate is measured against taxable income.',
      pending: 'The federal tax tables are being verified. The estimate will appear here as soon as they are confirmed.',
      _notes: 'A quick, plain estimate of federal income tax: your bracket, your average rate, and how much room is left before the next bracket.\n\n- Ask: Did you know that only the dollars above each line are taxed at the higher rate?\nPAUSE\n\n- Room to next bracket shows how much more income fits before the rate steps up.'
    })),
    render(ctx) {
      const calcMode = ctx.variant === 'calculator' || ctx.variant === 'us';
      const tb0 = taxTables(1);
      const st = ctx._tx = { shown: false, c65: false, cBlind: false, s65: false, sBlind: false };
      const status = () => clamp(Math.round(C.get('taxStatus')), 0, 3);
      const useStd = () => C.get('taxStd') !== false;
      const curSD = () => stdDeduction({ status: status(), gross: C.get('taxGross'), c65: st.c65, cBlind: st.cBlind, s65: st.s65, sBlind: st.sBlind });
      const ded = () => { const d = C.get('taxDed'); return d == null || !isFinite(d) ? (curSD() || 0) : d; };
      const F = {
        gross: { id: 'gross', type: 'money', aria: 'lGross', min: 0, get: () => C.get('taxGross'), set: (v) => C.set('taxGross', v) },
        ded: { id: 'ded', type: 'money', aria: 'lStd', min: 0, get: () => ded(), set: (v) => C.set('taxDed', v), disabled: useStd() }
      };
      const year = tb0 ? tb0.year : '';
      const taxUrl = 'https://www.irs.gov/instructions/i1040tt', sdUrl = 'https://www.irs.gov/help/ita/how-much-is-my-standard-deduction';
      ctx.el.innerHTML = `
        <div class="b07-head sm" style="top:28px"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b07-card b07-form" style="position:absolute;left:300px;top:${calcMode ? 120 : 126}px;width:1000px;padding:10px 32px">
          <div class="b07-tx-row">${ctx.t('lStatus', { tag: 'label', cls: 'b07-lb', attrs: 'for="b07-tx-st"' })}${statusSelect(ctx, 'b07-tx-st', status())}</div>
          <div class="b07-tx-row"><span class="b07-lb">${ctx.t('lGross', { cls: 'g-gross' })}${ctx.t('lMagi', { cls: 'g-magi' })}</span>${inp(ctx, F.gross)}</div>
          <div class="b07-tx-row std-only"><span></span><div class="b07-tx-boxes">
            <span class="who">${ctx.t('lClient')}</span><label><input type="checkbox" class="b07-chk-b" data-bx="c65">${ctx.t('l65')}</label><label><input type="checkbox" class="b07-chk-b" data-bx="cBlind">${ctx.t('lBlind')}</label>
            <span class="who mfj-only">${ctx.t('lSpouse')}</span><label class="mfj-only"><input type="checkbox" class="b07-chk-b" data-bx="s65">${ctx.t('l65')}</label><label class="mfj-only"><input type="checkbox" class="b07-chk-b" data-bx="sBlind">${ctx.t('lBlind')}</label></div></div>
          <div class="b07-tx-row"><span class="b07-tx-dl"><button type="button" class="b07-link" data-mode="1"><span class="m-std">${ctx.t('lStd')}</span><span class="m-item">${ctx.t('lItem')}</span><span class="tipx"><span class="m-std">${ctx.t('tipToItem')}</span><span class="m-item">${ctx.t('tipToStd')}</span></span></button>
            <a class="ext" href="${sdUrl}" target="_blank" rel="noopener" aria-label="${esc(ctx.text('extTip'))}">${ICON.ext}</a></span>${inp(ctx, F.ded)}</div>
          <div class="b07-tx-row">${ctx.t('lTaxable', { cls: 'b07-lb' })}<span class="b07-tx-out num" data-o="taxable"></span></div>
        </div>
        <div class="b07-calc-act" data-calcw="1" style="top:${calcMode ? 470 : 486}px"><button type="button" class="b07-btn" data-calc="1">${ctx.t('calc')}</button></div>
        <div class="b07-tx-res" data-res="1" hidden style="top:${calcMode ? 452 : 470}px">
          <div class="b07-card b07-tx-card">
            <div class="ln big"><span><span class="num">${year}</span> ${ctx.t('rTax')}</span><span class="v num" data-o="tax"></span></div>
            <div class="ln">${ctx.t('rMarg')}<span class="v num" data-o="marg"></span></div>
            <div class="ln">${ctx.t('rEff')}<span class="v num" data-o="eff"></span></div>
            <div class="ln">${ctx.t('rRoom')}<span class="v num" data-o="room"></span></div>
          </div>
          <div class="b07-card b07-tx-pan">${ctx.t('pBr', { tag: 'h3' })}<div data-o="brk"></div></div>
          <div class="b07-card b07-tx-pan">${ctx.t('pYour', { tag: 'h3' })}<div data-o="split"></div></div>
        </div>
        <div class="b07-abs" data-pend="1" hidden style="left:300px;width:1000px;top:470px">${ctx.t('pending', { tag: 'p', cls: 'b07-pend', attrs: 'style="margin:0"' })}</div>
        ${calcMode ? `<div class="b07-calc-act" data-usew="1" hidden style="top:744px"><button type="button" class="b07-btn" data-use="1">${ctx.t('use')}</button></div>` : ''}
        <a class="b07-link" href="${taxUrl}" target="_blank" rel="noopener" style="position:absolute;right:120px;top:${calcMode ? 752 : 770}px;text-decoration:none">${ctx.t('irs')}</a>
        <p class="st-disclaimer b07-disc" style="max-width:1080px">${ctx.t('est')}</p>`;
      const vals = () => ({ status: status(), gross: C.get('taxGross'), useStd: useStd(), deduction: ded() });
      function syncSD() {
        if (!useStd()) return;
        const sd = curSD(); if (sd == null) return;
        if (C.get('taxDed') !== sd) C.set('taxDed', sd);
        ctx.$$('input[data-bf="ded"]').forEach((x) => { x.value = showVal(F.ded, sd); });
      }
      function paint() {
        syncSD();
        const v = vals(), s = v.status, mfj = s === 1, std = v.useStd;
        ctx.$$('.mfj-only').forEach((n) => { n.hidden = !mfj; });
        ctx.$$('.std-only').forEach((n) => { n.hidden = !std; });
        ctx.$$('.m-std').forEach((n) => { n.hidden = !std; }); ctx.$$('.m-item').forEach((n) => { n.hidden = std; });
        const any65 = std && (st.c65 || (mfj && st.s65));
        ctx.$$('.g-gross').forEach((n) => { n.hidden = any65; }); ctx.$$('.g-magi').forEach((n) => { n.hidden = !any65; });
        ctx.$$('input[data-bf="ded"]').forEach((x) => { x.disabled = std; });
        const taxable = Math.max(0, v.gross - v.deduction);
        if (C.get('taxTaxable') !== taxable) C.set('taxTaxable', taxable);
        ctx.$('[data-o="taxable"]').textContent = money(taxable);
        const r = incomeTax(s, taxable);
        ctx.$('[data-calcw]').hidden = st.shown || !r;
        ctx.$('[data-pend]').hidden = !!r;
        ctx.$('[data-res]').hidden = !st.shown || !r;
        const uw = ctx.$('[data-usew]'); if (uw) uw.hidden = !st.shown || !r;
        if (!r) return;
        ctx.$('[data-o="tax"]').textContent = money(r.tax);
        ctx.$('[data-o="marg"]').textContent = pctTxt(r.marginal, 2);
        ctx.$('[data-o="eff"]').textContent = pctTxt(r.effective, 2);
        ctx.$('[data-o="room"]').textContent = money(r.headroom);
        const e = r.tb.ends, rt = r.tb.rates;
        const mIdx = (() => { for (let i = 0; i < 6; i++) if (taxable < e[i]) return i; return 6; })();
        ctx.$('[data-o="brk"]').innerHTML = rt.map((x, i) => {
          const lo = i === 0 ? '$0' : money(e[i - 1] + 1), hi = i < 6 ? ' - ' + money(e[i]) : ' +';
          return `<div class="r ${i === mIdx ? 'on' : ''}"><span class="num">${lo}${hi}</span><span class="rt num">${fmt.num(x * 100, 0)}%</span></div>`;
        }).join('');
        ctx.$('[data-o="split"]').innerHTML = r.split.map((x, i) => `<div class="r ${i === mIdx ? 'on' : ''}"><span class="num" style="margin-left:auto">${x == null ? '&nbsp;' : money(x)}</span></div>`).join('');
      }
      bindInputs(ctx, paint);
      ctx.$('#b07-tx-st').addEventListener('change', (e) => { C.set('taxStatus', +e.target.value); if (+e.target.value !== 1) { st.s65 = false; st.sBlind = false; ctx.$$('[data-bx="s65"],[data-bx="sBlind"]').forEach((x) => { x.checked = false; }); } paint(); });
      ctx.$('#b07-tx-st').addEventListener('keydown', (e) => e.stopPropagation());
      ctx.$$('[data-bx]').forEach((cb) => cb.addEventListener('change', () => { st[cb.dataset.bx] = cb.checked; paint(); }));
      ctx.on(ctx.$('[data-mode]'), 'click', () => { C.set('taxStd', !useStd()); paint(); });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { st.shown = true; paint(); });
      const useBtn = ctx.$('[data-use]');
      if (useBtn) ctx.on(useBtn, 'click', () => {
        const v = vals(), r = incomeTax(v.status, Math.max(0, v.gross - v.deduction)); if (!r) return;
        const pct = Math.round(r.effective * 10000) / 100;
        EFA.handoff = EFA.handoff || {}; EFA.handoff.taxRate = pct;
        EFA.clients.set('_handoff', 'taxRate', pct);
        ctx.next();
      });
      paint();
    }
  });

  /* ---------- incTax2: bracket thresholds indexed to inflation ---------- */
  EFA.css('b07-tax2', `
  .b07-t2-links { position: absolute; left: 400px; width: 800px; display: flex; justify-content: space-between; align-items: center; }
  .b07-t2-chart { position: absolute; left: 70px; top: 128px; width: 1460px; height: 560px; }
  .b07-t2-lg { position: absolute; left: 190px; top: 136px; display: flex; flex-wrap: wrap; gap: 8px 26px; max-width: 1200px; padding: 10px 16px; background: rgba(255,253,248,.92); border: 1px solid var(--rule); border-radius: 10px; transition: opacity .3s ease; }
  .b07-t2-lg span { display: inline-flex; align-items: center; gap: 8px; font: 700 18px/1 var(--f-body); color: var(--navy); }
  .b07-t2-lg i { width: 16px; height: 16px; border-radius: 4px; display: inline-block; }
  .b07-t2-head { position: absolute; left: 110px; right: 110px; top: 706px; text-align: center; font: 700 28px/1.3 var(--f-body); color: var(--navy); margin: 0; }
  .b07-t2-head .num { color: var(--gold-deep); }
  `);
  const BR_COLORS = ['#8aa3c7', '#5f7fae', P.navy4, P.navy3, P.navy, P.gold];
  EFA.screen('incTax2', {
    title: 'Projected tax bracket growth',
    copy: withCommon(Object.assign({}, TAX_COPY, {
      head: 'Projected Tax Bracket Growth',
      lStatus: 'Select your filing status', lInfl: 'Inflation Rate', lN: 'Years To Project',
      graph: 'Graph Projected Tax Brackets',
      s1: 'Lowest Bracket', s2: 'Bracket Two', s3: 'Bracket Three', s4: 'Bracket Four', s5: 'Bracket Five', s6: 'Highest Bracket',
      hl1: 'With', hl2: 'yearly inflation, after', hl3: 'years the top bracket would begin at',
      ret: 'Return',
      ws1: 'Tax Bracket Projection at', ws2: 'Inflation',
      wTY: 'Tax Year', w1: 'Lowest Tax Bracket', w2: 'Bracket Two', w3: 'Bracket Three', w4: 'Bracket Four', w5: 'Bracket Five', w6: 'Highest Tax Bracket', wY: 'Year',
      note: 'Assumes each bracket threshold rises with the inflation rate shown. Actual future thresholds depend on changes in tax law.',
      pending: 'The federal tax tables are being verified. The projection will appear here as soon as they are confirmed.',
      _notes: 'Tax brackets are indexed to inflation, so the dollar lines move up over time. This shows where they could be in the years you plan to draw income.\n\n- Ask: When you picture your retirement income, which bracket do you expect it to land in?\nPAUSE'
    })),
    render(ctx) {
      const status = () => clamp(Math.round(C.get('taxStatus')), 0, 3);
      const F = {
        i: { id: 'i', type: 'pct', aria: 'lInfl', max: 1, get: () => C.get('infl'), set: (v) => C.set('infl', v) },
        N: { id: 'N', type: 'int', aria: 'lN', min: 1, max: 100, get: () => C.get('years'), set: (v) => C.set('years', v) }
      };
      const proj = () => {
        const tb = taxTables(status()); if (!tb) return null;
        const i = C.get('infl'), N = Math.max(1, Math.round(C.get('years')));
        const rows = [];
        for (let y = 1; y <= N; y++) { const g = Math.pow(1 + i, y - 1), r = { ty: tb.year + y - 1, y: y - 1 }; tb.ends.forEach((e, j) => { r['b' + (j + 1)] = e * g; }); rows.push(r); }
        return { tb, i, N, rows, X: tb.ends[5] * Math.pow(1 + i, N - 1) };
      };
      const iTxt = (i) => String(+(i * 100).toFixed(4));
      const sheet = () => {
        const p = proj();
        return {
          heading: `${ctx.t('ws1')} <span class="num">${p ? iTxt(p.i) : ''}%</span> ${ctx.t('ws2')} (${ctx.t(statusKeys[status()])})`, size: 'full',
          columns: [col(ctx, 'ty', 'wTY', 'year', { width: 80 })].concat([1, 2, 3, 4, 5, 6].map((j) => col(ctx, 'b' + j, 'w' + j))).concat([col(ctx, 'y', 'wY', 'year', { width: 80 })]),
          rows: p ? p.rows : [], filter: 'ty'
        };
      };
      ctx.el.innerHTML = `
        <div class="b07-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="v-in">
          <div class="b07-card b07-form" style="position:absolute;left:360px;top:230px;width:880px;padding:12px 32px">
            <div class="b07-tx-row">${ctx.t('lStatus', { tag: 'label', cls: 'b07-lb', attrs: 'for="b07-t2-st"' })}${statusSelect(ctx, 'b07-t2-st', status())}</div>
            <div class="b07-tx-row">${ctx.t('lInfl', { tag: 'span', cls: 'b07-lb' })}${inp(ctx, F.i)}</div>
            <div class="b07-tx-row">${ctx.t('lN', { tag: 'span', cls: 'b07-lb' })}${inp(ctx, F.N)}</div>
          </div>
          <div class="b07-t2-links" style="top:470px"><button type="button" class="b07-link big" data-graph="1">${ctx.t('graph')}</button>${docBtn(ctx, sheet, '')}</div>
          <div class="b07-abs" data-pend="1" hidden style="left:360px;width:880px;top:540px">${ctx.t('pending', { tag: 'p', cls: 'b07-pend', attrs: 'style="margin:0"' })}</div>
        </div>
        <div class="v-ch" hidden>
          <div class="b07-t2-chart" data-chart="1"></div>
          <div class="b07-t2-lg" data-lg="1">${[1, 2, 3, 4, 5, 6].map((j) => `<span><i style="background:${BR_COLORS[j - 1]}"></i>${ctx.t('s' + j)}</span>`).join('')}</div>
          <p class="b07-t2-head" data-hl="1"></p>
          <div class="b07-calc-act" style="top:770px"><button type="button" class="b07-btn" data-ret="1">${ctx.t('ret')}</button></div>
        </div>
        <p class="st-disclaimer b07-disc" style="max-width:1050px">${ctx.t('note')}</p>`;
      const tip = tipper(ctx);
      const draw = () => {
        const p = proj(); if (!p) return;
        const w = 1460, h = 560, pad = { l: 130, r: 20, t: 20, b: 46 }, N = p.N;
        const max = Math.max(...p.rows.map((r) => r.b6));
        const nice = (m) => { const q = Math.pow(10, Math.floor(Math.log10(m))), f = m / q; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * q; };
        const yMax = nice(max * 1.2), pw = w - pad.l - pad.r, ph = h - pad.t - pad.b, band = pw / N, inner = band * 0.8, cw = inner / 6;
        const Y = (v) => pad.t + ph * (1 - v / yMax);
        let g = '';
        for (let k = 0; k <= 5; k++) { const v = yMax * k / 5, y = Y(v); g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="#d6cfc4" stroke-width="1"/><text x="${pad.l - 12}" y="${y + 6}" text-anchor="end" font-family="DM Sans, sans-serif" font-weight="600" font-size="17" fill="#0d1e3a">${money(v)}</text>`; }
        p.rows.forEach((r, i) => {
          const x0 = pad.l + band * i + band * 0.1;
          for (let j = 1; j <= 6; j++) { const v = r['b' + j], y = Y(v); g += `<rect class="mk" data-i="${i}" data-j="${j}" x="${(x0 + cw * (j - 1)).toFixed(2)}" y="${y.toFixed(2)}" width="${Math.max(1, cw - 0.4).toFixed(2)}" height="${(pad.t + ph - y).toFixed(2)}" fill="${BR_COLORS[j - 1]}"/>`; }
          if ((i + 1) % 5 === 1) g += `<text x="${(pad.l + band * (i + 0.5)).toFixed(1)}" y="${h - 14}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="17" fill="#0d1e3a">${i + 1}</text>`;
        });
        g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${pad.t + ph}" y2="${pad.t + ph}" stroke="#0d1e3a" stroke-width="2"/>`;
        ctx.$('[data-chart]').innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${g}</svg>`;
        ctx.$('[data-hl]').innerHTML = `${ctx.t('hl1')} <span class="num">${iTxt(p.i)}%</span> ${ctx.t('hl2')} <span class="num">${p.N}</span> ${ctx.t('hl3')} <span class="num">${money(p.X)}</span>.`;
        ctx._t2 = p;
      };
      const chart = ctx.$('[data-chart]');
      chart.addEventListener('mousemove', (e) => {
        const t = e.target.closest('.mk'); if (!t || !ctx._t2) { tip.hide(); return; }
        const j = +t.dataset.j, r = ctx._t2.rows[+t.dataset.i];
        tip.show(e, `<b><i style="display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;background:${BR_COLORS[j - 1]}"></i>${ctx.t('s' + j)}</b>${num(money(r['b' + j]))}`);
      });
      chart.addEventListener('mouseleave', () => tip.hide());
      ctx.on(chart, 'click', (e) => { if (e.target.closest('.mk')) { const lg = ctx.$('[data-lg]'); lg.style.opacity = lg.style.opacity === '0' ? '1' : '0'; } });
      const view = (chartOn) => { ctx.$('.v-in').hidden = chartOn; ctx.$('.v-ch').hidden = !chartOn; if (chartOn) draw(); };
      const paint = () => { const ok = !!taxTables(status()); ctx.$('[data-pend]').hidden = ok; ctx.$('[data-graph]').disabled = !ok; };
      ctx.$('#b07-t2-st').addEventListener('change', (e) => { C.set('taxStatus', +e.target.value); paint(); });
      ctx.$('#b07-t2-st').addEventListener('keydown', (e) => e.stopPropagation());
      bindInputs(ctx, paint);
      wireDocFallback(ctx);
      ctx.on(ctx.$('[data-graph]'), 'click', () => { if (taxTables(status())) view(true); });
      ctx.on(ctx.$('[data-ret]'), 'click', () => view(false));
      paint();
    }
  });

  /* =====================================================================
     IULCC: iulcc1, perception vs. reality
     ===================================================================== */
  EFA.css('b07-iul1', `
  .b07-iul1 { position: absolute; left: 88px; width: 1424px; display: grid; gap: 30px; }
  .b07-iul1-row { display: grid; grid-template-columns: 123px 1fr; column-gap: 26px; align-items: center; }
  .b07-iul1-row .dart { display: grid; place-items: center; }
  .b07-iul1-card { padding: 20px 34px; }
  .b07-iul1-card .lead { margin: 0 0 8px; font: 700 26px/1.25 var(--f-body); color: var(--gold-deep); }
  .b07-iul1-card ul { margin: 0; padding-left: 30px; display: grid; gap: 6px; }
  .b07-iul1-card li { font: 600 21px/1.4 var(--f-body); color: var(--navy); }
  .b07-iul1-card li::marker { color: var(--gold); }
  `);
  EFA.screen('iulcc1', {
    title: 'IUL perception vs. reality',
    copy: {
      head: 'Indexed Universal Life: Perception vs. Reality',
      lead1: 'Some common perceptions:',
      m1: 'IUL is risky.', m2: 'IUL is expensive.', m3: 'IUL costs rise over time.',
      lead2: 'A closer look:',
      f1: 'A floor means a down year in the index credits no less than the floor. Your cash value does not follow the index down.',
      f2: 'Growth inside the policy is not taxed each year.',
      f3: 'Over a long holding period, the cost of the policy compares favorably with the ongoing cost of other investments.',
      f4: 'You can reach your cash value through policy loans, without a credit check and without a set repayment date.',
      f5: 'The policy carries a death benefit for your family. No investment account does that.',
      _notes: 'Most people have heard opinions about indexed universal life before they have seen the numbers. Name the perceptions, then take a closer look at each.\n\n- Ask: Which of these have you heard, and where did you hear it?\nPAUSE\n\n- The next screen compares the costs year by year, using the policy\'s own illustration.'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b07-head sm" style="top:26px"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b07-iul1" style="top:136px">
          <div class="b07-iul1-row"><span class="dart">${dart(110)}</span><div class="b07-card b07-iul1-card">${ctx.t('lead1', { tag: 'p', cls: 'lead' })}<ul>${['m1', 'm2', 'm3'].map((k) => `<li>${ctx.t(k)}</li>`).join('')}</ul></div></div>
          <div class="b07-iul1-row"><span class="dart">${dart(110)}</span><div class="b07-card b07-iul1-card">${ctx.t('lead2', { tag: 'p', cls: 'lead' })}<ul>${['f1', 'f2', 'f3', 'f4', 'f5'].map((k) => `<li>${ctx.t(k)}</li>`).join('')}</ul></div></div>
        </div>
        ${discLine(ctx, ['guarantees', 'loans'], 'max-width:1100px;bottom:14px')}`;
    }
  });

  /* =====================================================================
     IULCC: iulcc2, cost comparison calculator
     ===================================================================== */
  /** index return series, calendar-year total returns as fractions, from EFA.data (null when not loaded) */
  const MKTS = [
    { code: 'DJI', key: 'kDji', paths: ['history.markets.dji', 'history.markets.DJI', 'history.markets.dowJones', 'history.djiReturn'] },
    { code: 'SPX', key: 'kSpx', paths: ['history.sp500PriceReturn', 'history.markets.sp500Price', 'history.markets.SPX', 'history.markets.spx'] },
    { code: 'SPXTR', key: 'kSpxtr', paths: ['history.sp500TotalReturn', 'history.markets.sp500TotalReturn', 'history.markets.SPXTR'] },
    { code: 'TSX', key: 'kTsx', paths: ['history.markets.tsx', 'history.markets.TSX'] },
    { code: 'TSXTR', key: 'kTsxtr', paths: ['history.markets.tsxTotalReturn', 'history.markets.TSXTR'] },
    { code: 'RUT', key: 'kRut', paths: ['history.markets.russell2000', 'history.markets.RUT', 'history.markets.rut'] },
    { code: 'COMP', key: 'kComp', paths: ['history.markets.nasdaq', 'history.markets.nasdaqComposite', 'history.markets.COMP', 'history.nasdaqReturn'] },
    { code: 'MSCIW', key: 'kMsci', paths: ['history.markets.msciWorld', 'history.markets.MSCIW'] },
    { code: 'GB10', key: 'kGb10', paths: ['history.tbond10y', 'history.markets.tbond10y', 'history.markets.GB10'] },
    { code: 'MUNI20', key: 'kMuni', paths: ['history.markets.muni20y', 'history.markets.MUNI20'] },
    { code: 'CORP30', key: 'kCorp', paths: ['history.markets.corp30y', 'history.markets.CORP30'] }
  ];
  function mktSeries(code) {
    const m = MKTS.find((x) => x.code === code); if (!m) return null;
    const raw = D.apply(null, m.paths);
    const arr = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.returns) ? raw.returns : null);
    if (!arr || arr.length < 2) return null;
    const out = arr.map((x) => Array.isArray(x) ? [+x[0], +x[1]] : [+(x.year), +(x.r != null ? x.r : (x.ret != null ? x.ret : x.value))]).filter((x) => isFinite(x[0]) && isFinite(x[1])).sort((a, b) => a[0] - b[0]);
    return out.length > 1 ? out : null;
  }
  const mktsAvailable = () => MKTS.filter((m) => mktSeries(m.code));
  /** the comparison engine. s: {age, T, rowsA, rowsB, isPolicyB, market, startYear, fixedROR, taxRate, mgtFee, invert, qualified, termCost} (rates as fractions) */
  function iulccCalc(s) {
    const T = Math.max(1, Math.round(s.T)), A = s.rowsA || [];
    const rowA = (t) => A[t] || {};
    let B = s.rowsB || [];
    const g = (r, k) => (r && isFinite(r[k]) ? +r[k] : 0);
    if (!s.isPolicyB) {
      let R;
      if (s.market === 'FIXED') R = [s.fixedROR];
      else {
        const ser = mktSeries(s.market) || [];
        const last = ser.length ? ser[ser.length - 1][0] : 0;
        R = ser.filter(([y]) => y >= s.startYear && y <= Math.min(s.startYear + T, last)).map(([, r]) => r);
      }
      if (!R.length) R = [0];
      const base = R.slice(); let i = 0;
      while (R.length < T) { R.push(base[i % base.length]); i++; }
      let L = 0; B = [];
      for (let w = 0; w < T; w++) {
        const prem = g(rowA(w), 'premium'), dep = s.qualified ? (s.taxRate < 1 ? prem / (1 - s.taxRate) : prem) : prem;
        const n = L + dep, ret = s.invert ? R[R.length - 1 - w] : R[w], gain = n * ret;
        const tax = s.qualified ? 0 : -gain * s.taxRate, fee = -(n + gain) * s.mgtFee;
        L = n + gain + tax + fee;
        B.push({ premium: dep, premCharge: ret, polFee: gain, unitChg: tax, COI: fee, rider: -s.termCost, bal: L });
      }
    }
    const rows = [], sums = { a: {}, b: {} }, CH = ['premium', 'premCharge', 'polFee', 'unitChg', 'COI', 'rider'];
    let cumA = 0, cumB = 0, cross = -1;
    for (let t = 0; t < T; t++) {
      const a = rowA(t), b = B[t] || {};
      const totA = g(a, 'premCharge') + g(a, 'polFee') + g(a, 'unitChg') + g(a, 'COI') + g(a, 'rider');
      const totB = s.isPolicyB ? g(b, 'premCharge') + g(b, 'polFee') + g(b, 'unitChg') + g(b, 'COI') + g(b, 'rider') : g(b, 'unitChg') + g(b, 'COI') + g(b, 'rider');
      cumA += totA; cumB += totB;
      CH.forEach((k) => { sums.a[k] = (sums.a[k] || 0) + g(a, k); sums.b[k] = (sums.b[k] || 0) + g(b, k); });
      sums.a.total = (sums.a.total || 0) + totA; sums.b.total = (sums.b.total || 0) + totB;
      const gap = cumA - cumB;
      if (gap > 0 && cross < 0) cross = t;
      rows.push({ t, year: t + 1, age: s.age + t, a: CH.map((k) => g(a, k)), totA, b: CH.map((k) => g(b, k)), totB, costA: -cumA, costB: -cumB, gap: gap > 0 ? gap : null });
      if ((t + 1) % 10 === 0) rows.push({ sub: true, a: CH.map((k) => sums.a[k]), totA: sums.a.total, b: CH.map((k) => sums.b[k]), totB: sums.b.total });
    }
    return { rows, cross, T, chart: rows.filter((r) => !r.sub).map((r) => s.isPolicyB ? [-r.totA, -r.totB] : [r.costA, r.costB]) };
  }
  EFA.engines.iulcc = { calc: iulccCalc, markets: () => MKTS.map((m) => m.code), series: mktSeries };

  /** clipboard text -> numbers (one per line, first column only when tab-separated) */
  function parseClip(text) {
    const s0 = String(text || ''), sep = s0.split('\r').length > s0.split('\n').length ? '\r' : '\n';
    let t = s0.replace(sep === '\r' ? /[^0-9\-.\t\r]/g : /[^0-9\-.\t\n]/g, '');
    if (t.endsWith(sep)) t = t.slice(0, -1);
    let lines = t.split(sep);
    if (t.indexOf('\t') >= 0) lines = lines.map((l) => (l.indexOf('\t') >= 0 ? l.slice(0, l.indexOf('\t')) : '0'));
    return lines.map((l) => { const v = Number(l); return isNaN(v) ? 0 : v; });
  }
  /** fill zero gaps between non-zero values, column by column (steps rounded to cents) */
  function interpolate(rows, cols) {
    cols.forEach((c) => {
      let e = -1;
      for (let a = 0; a < rows.length; a++) {
        const v = +rows[a][c] || 0; if (!v) continue;
        if (e >= 0 && a - e > 1) {
          const ve = +rows[e][c], step = Math.round(100 * (v - ve) / (a - e)) / 100;
          for (let k = 0; k < a - e; k++) rows[e + k][c] = ve + k * step;
        }
        e = a;
      }
    });
    return rows;
  }
  EFA.engines.iulccTools = { parseClip, interpolate };

  EFA.css('b07-iul2', `
  .b07-iu-top { position: absolute; left: 40px; width: 1520px; top: 16px; height: 176px; display: grid; grid-template-columns: 4fr 4fr 2fr; gap: 16px; }
  .b07-iu-pan { padding: 10px 18px; display: grid; grid-template-rows: auto 1fr; gap: 6px; min-width: 0; }
  .b07-iu-pan.gray { background: #eef1f5; }
  .b07-iu-ph { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 10px; }
  .b07-iu-ph .b07-in { height: 40px; font: 700 21px/1 var(--f-body); text-align: center; grid-column: 2; width: 300px; }
  .b07-iu-body { display: flex; align-items: center; justify-content: center; gap: 18px; font: 600 19px/1.3 var(--f-body); color: var(--navy); }
  .b07-iu-body .cnt { color: var(--muted); font-size: 16px; }
  .b07-sw { display: inline-flex; align-items: center; gap: 10px; background: none; border: 0; padding: 0; cursor: pointer; font: 700 15px/1 var(--f-body); letter-spacing: .1em; text-transform: uppercase; color: var(--navy); }
  .b07-sw i { width: 44px; height: 24px; border-radius: 12px; background: var(--mist-2); position: relative; transition: background .2s ease; flex: 0 0 auto; }
  .b07-sw i::after { content: ""; position: absolute; left: 3px; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: left .2s ease; }
  .b07-sw[aria-checked="true"] i { background: var(--navy); }
  .b07-sw[aria-checked="true"] i::after { left: 23px; }
  .b07-iu-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 6px 12px; align-content: center; }
  .b07-iu-grid > label, .b07-iu-grid > div { display: grid; gap: 3px; font: 700 12px/1.1 var(--f-body); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
  .b07-iu-grid .b07-in, .b07-iu-grid .b07-sel { height: 34px; font-size: 17px; width: 100%; padding: 0 8px; }
  .b07-iu-sh { display: grid; gap: 8px; align-content: center; }
  .b07-iu-sh .r { display: flex; justify-content: space-between; align-items: center; font: 700 19px/1 var(--f-body); color: var(--navy); }
  .b07-iu-sh .b07-in { width: 84px; height: 38px; text-align: center; }
  .b07-iu-sh .h { font: 700 13px/1.2 var(--f-body); letter-spacing: .16em; text-transform: uppercase; color: var(--gold-deep); text-align: center; }
  .b07-iu-tab { position: absolute; left: 40px; width: 1520px; top: 204px; height: 560px; }
  .stage .b07-iu-tab .st-table { font-size: 13.5px; }
  .stage .b07-iu-tab .st-table th { font-size: 10.5px; letter-spacing: .06em; padding: 7px 5px; text-align: right; line-height: 1.15; }
  .stage .b07-iu-tab .st-table td { padding: 4px 5px; white-space: nowrap; }
  .stage .b07-iu-tab .st-table th.g { text-align: center; font-size: 12px; letter-spacing: .12em; background: var(--navy3, #1d3863); background: #1d3863; }
  .stage .b07-iu-tab .st-table .bl { border-left: 3px solid var(--navy); }
  .stage .b07-iu-tab .st-table tr.sub td { background: var(--gold-pale) !important; font-weight: 700; }
  .stage .b07-iu-tab .st-table td.x { background: var(--gold-lt) !important; font-weight: 700; }
  .stage .b07-iu-tab .st-table td.c { text-align: center; }
  .stage .b07-iu-tab .st-table td.gt { color: var(--gold-deep); font-weight: 700; }
  .stage .b07-iu-tab .st-table thead tr:nth-child(2) th { top: 27px; }
  .b07-iu-empty td { text-align: center !important; color: var(--muted); font: 500 18px/1.5 var(--f-body) !important; padding: 18px !important; background: var(--paper) !important; }
  .b07-iu-foot { position: absolute; left: 160px; width: 1280px; top: 772px; display: flex; justify-content: space-between; align-items: center; }
  .b07-ed-wrap { height: 470px; border: 1px solid var(--rule); border-radius: 12px; background: #fff; }
  .stage .b07-ed-wrap .st-table { font-size: 17px; }
  .stage .b07-ed-wrap .st-table td { padding: 2px 6px; }
  .stage .b07-ed-wrap .st-table td:first-child { text-align: center; font-weight: 700; width: 70px; }
  .b07-ed-in { width: 100%; box-sizing: border-box; border: 1px solid transparent; background: transparent; border-radius: 6px; padding: 6px 8px; font: 500 17px/1 var(--f-body); color: var(--navy); text-align: right; font-variant-numeric: lining-nums tabular-nums; }
  .b07-ed-in:hover { border-color: var(--mist-2); background: #fff; }
  .b07-ed-in:focus { outline: none; border-color: var(--gold); background: #fff; box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .b07-ed-hint { margin: 0; font: 500 16px/1.4 var(--f-body); color: var(--muted); }
  .b07-paste { position: absolute; z-index: 40; width: 420px; padding: 18px; display: grid; gap: 10px; }
  .b07-paste h4 { margin: 0; font: 600 26px/1.1 var(--f-display); color: var(--navy); }
  .b07-paste textarea { width: 100%; height: 120px; box-sizing: border-box; border: 1.5px solid var(--mist-2); border-radius: 10px; padding: 10px; font: 500 16px/1.4 var(--f-body); resize: none; }
  .b07-paste .acts { display: flex; flex-wrap: wrap; gap: 8px; }
  .b07-lc-lg { display: flex; justify-content: center; gap: 34px; margin-bottom: 8px; }
  .b07-lc-lg span { display: inline-flex; align-items: center; gap: 10px; font: 700 20px/1 var(--f-body); color: var(--navy); }
  .b07-lc-lg i { width: 30px; height: 6px; border-radius: 3px; display: inline-block; }
  `);
  const IU_CH = ['premium', 'premCharge', 'polFee', 'unitChg', 'COI', 'rider'];
  EFA.screen('iulcc2', {
    title: 'IUL cost comparison calculator',
    copy: withCommon({
      defA: 'Policy A', defB: 'Policy B', defInv: 'Equity Investment',
      selData: 'Enter the illustration data', edit: 'Edit', yrs: 'years entered',
      mPolicy: 'Policy', mMarket: 'Market',
      shared: 'Shared Assumptions', age: 'Age', years: 'Years',
      gMarket: 'Historic Market', gTax: 'Tax Rate', gStart: 'Starting Year', gFixed: 'Guaranteed ROR', gFee: 'Mgt Fee', gInv: 'Invert Index', gQual: 'Qualified $', gTerm: 'Term Cost',
      kDji: 'Dow', kSpx: 'S&P 500', kSpxtr: 'S&P 500 TR', kTsx: 'TSX', kTsxtr: 'TSX TR', kRut: 'Russell 2000', kComp: 'Nasdaq', kMsci: 'MSCI World',
      kGb10: '10Y Gov Bond', kMuni: '20Y Muni', kCorp: '30Y Corp', kFixed: 'Fixed',
      mktPending: 'Index return histories are being verified; a fixed rate is available now.',
      hYear: 'Year', hAge: 'Age', hPrem: 'Plan Prem', hPremChg: 'Prem Chg', hPolFee: 'Pol Fee', hExp: 'Exp Chg', hCoi: 'COI', hRider: 'Rider', hTotal: 'Total',
      hAvgRet: 'Avg Ret', hGains: 'Act Gains', hIncTax: 'Inc Tax', hMgt: 'Mgt Fee', hTerm: 'Term Cost',
      hCostA: 'Policy Cost A', hCostB: 'Policy Cost B', hInvCost: 'Invest Cost', hGt: 'GT Amt', tot: 'TOT',
      empty: 'No illustration data yet. Choose Edit under Policy A to enter or paste the policy charges.',
      chart: 'Crossover Chart', chartTitle: 'Cost Comparison',
      edTitle: 'Edit Illustration Data',
      eYear: 'Year', ePrem: 'Plan Prem', ePremChg: 'Prem Chg', ePolFee: 'Pol Fee', eUnit: 'Unit Chg', eCoi: 'COI', eRider: 'Rider',
      eHint: 'Enter premiums as positive numbers and every charge as a negative number. Right-click a cell to paste a column of values from a spreadsheet or illustration.',
      eCancel: 'Cancel', eInterp: 'Interpolate Missing Values', eSave: 'Save Changes',
      pTitle: 'Paste Data', pHint: 'Click here, paste from your clipboard, then pick a button below.', pPaste: 'Paste', pAdd: 'Paste (+)', pSub: 'Paste (-)', pZero: 'Set the rest of this column to zero',
      wsVs: 'vs.', wsTail: 'Comparison Worksheet',
      note: 'Policy charges come from a non-guaranteed illustration. Index returns are historical and are applied without the caps, floors or participation rates that indexed crediting would use. This compares costs only; it is not a projection of policy performance.',
      _notes: 'This puts the policy\'s own charges, year by year, next to what the same premiums would cost in a taxable investment: taxes on the gains, management fees, and separate term coverage.\n\n- Enter or paste the charges from the illustration with Edit. The highlighted year is where the investment\'s total costs pass the policy\'s.\nPAUSE\n\n- Ask: Over the years you plan to keep this money working, which set of costs would you rather carry?\nPAUSE'
    }),
    render(ctx) {
      const m = (k, d) => ctx.mem(k, d);
      const avail = mktsAvailable();
      const defMkt = avail.find((x) => x.code === 'SPX') ? 'SPX' : (avail[0] ? avail[0].code : 'FIXED');
      const S = () => {
        let market = m('market', defMkt);
        if (market !== 'FIXED' && !mktSeries(market)) market = defMkt;
        return {
          age: C.get('age'), T: Math.max(1, Math.round(m('T', 30))), rowsA: m('rowsA', []), rowsB: m('rowsB', []), isPolicyB: !!m('isPolicyB', false),
          market, startYear: m('startYear', 1990), fixedROR: m('fixedROR', 0), taxRate: m('taxRate', 0), mgtFee: m('mgtFee', 0),
          invert: !!m('invert', false), qualified: !!m('qualified', false), termCost: m('termCost', 0)
        };
      };
      const nameA = () => { const n = m('nameA', ''); return n ? n : ctx.text('defA'); };
      const nameB = () => { const s = S(); const n = s.isPolicyB ? m('nameB', '') : m('invName', ''); return n ? n : ctx.text(s.isPolicyB ? 'defB' : 'defInv'); };
      const nameAH = () => { const n = m('nameA', ''); return n ? esc(n) : ctx.t('defA'); };
      const nameBH = () => { const s = S(); const n = s.isPolicyB ? m('nameB', '') : m('invName', ''); return n ? esc(n) : ctx.t(s.isPolicyB ? 'defB' : 'defInv'); };
      const per = (k, d, type, extra) => Object.assign({ id: k, type, get: () => m(k, d), set: (v) => ctx.remember(k, v) }, extra || {});
      const F = {
        nameA: { id: 'nameA', type: 'text', aria: 'defA', get: () => nameA(), set: (v) => ctx.remember('nameA', String(v).trim()) },
        nameB: { id: 'nameB', type: 'text', aria: 'defB', get: () => nameB(), set: (v) => ctx.remember(S().isPolicyB ? 'nameB' : 'invName', String(v).trim()) },
        tax: per('taxRate', 0, 'pct', { aria: 'gTax', min: 0, max: 0.99 }),
        fee: per('mgtFee', 0, 'pct', { aria: 'gFee', min: 0, max: 1 }),
        fixed: per('fixedROR', 0, 'pct', { aria: 'gFixed', dp: 3 }),
        term: per('termCost', 0, 'money', { aria: 'gTerm', min: 0 }),
        age: { id: 'age', type: 'int', aria: 'age', min: 0, max: 120, get: () => C.get('age'), set: (v) => C.set('age', v) },
        T: per('T', 30, 'int', { aria: 'years', min: 1, max: 100 })
      };
      const sw = (k, on) => `<button type="button" class="b07-sw" role="switch" aria-checked="${!!on}" data-sw="${k}"><i></i></button>`;
      const mktOpts = () => { const s = S(); return avail.map((x) => `<option value="${x.code}" ${s.market === x.code ? 'selected' : ''}>${esc(ctx.text(x.key))}</option>`).join('') + `<option value="FIXED" ${s.market === 'FIXED' ? 'selected' : ''}>${esc(ctx.text('kFixed'))}</option>`; };
      const yearOpts = () => { const s = S(), ser = mktSeries(s.market) || []; return ser.map(([y]) => `<option value="${y}" ${y === s.startYear ? 'selected' : ''}>${y}</option>`).join(''); };
      ctx.el.innerHTML = `
        <div class="b07-iu-top">
          <div class="b07-card b07-iu-pan"><div class="b07-iu-ph"><span></span>${inp(ctx, F.nameA)}</div>
            <div class="b07-iu-body">${ctx.t('selData')}<button type="button" class="b07-btn sm" data-edit="A">${ctx.t('edit')}</button><span class="cnt" data-cnt="A"></span></div></div>
          <div class="b07-card b07-iu-pan"><div class="b07-iu-ph"><span style="display:flex;align-items:center;gap:10px">${sw('isPolicyB', S().isPolicyB)}<span data-mode="1">${ctx.t('mPolicy', { cls: 'mp' })}${ctx.t('mMarket', { cls: 'mm' })}</span></span>${inp(ctx, F.nameB)}</div>
            <div class="b07-iu-body pol-only">${ctx.t('selData')}<button type="button" class="b07-btn sm" data-edit="B">${ctx.t('edit')}</button><span class="cnt" data-cnt="B"></span></div>
            <div class="b07-iu-grid mkt-only">
              <label>${ctx.t('gMarket')}<select class="b07-sel" data-mkt="1">${mktOpts()}</select></label>
              <label>${ctx.t('gTax')}${inp(ctx, F.tax)}</label>
              <label class="yr-only">${ctx.t('gStart')}<select class="b07-sel" data-start="1">${yearOpts()}</select></label>
              <label class="fx-only">${ctx.t('gFixed')}${inp(ctx, F.fixed)}</label>
              <label>${ctx.t('gFee')}${inp(ctx, F.fee)}</label>
              <div>${ctx.t('gInv')}${sw('invert', S().invert)}</div>
              <div>${ctx.t('gQual')}${sw('qualified', S().qualified)}</div>
              <label>${ctx.t('gTerm')}${inp(ctx, F.term)}</label>
              <span class="b07-edit-only" style="grid-column:1/-1;justify-content:flex-start">${MKTS.map((x) => ctx.t(x.key)).join('')}${ctx.t('kFixed')}</span>
            </div></div>
          <div class="b07-card b07-iu-pan gray"><div class="b07-iu-sh">${ctx.t('shared', { cls: 'h' })}<div class="r">${ctx.t('age')}${inp(ctx, F.age)}</div><div class="r">${ctx.t('years')}${inp(ctx, F.T)}</div></div></div>
        </div>
        <div class="b07-card b07-scroll b07-iu-tab"><table class="st-table"><thead></thead><tbody></tbody></table></div>
        <div class="b07-iu-foot"><button type="button" class="b07-doclink" data-chart="1">${ICON.lines}<span>${ctx.t('chart')}</span></button>${docBtn(ctx, () => sheet(), '')}</div>
        <div style="position:absolute;left:110px;top:812px;width:1080px;display:grid;gap:4px">
          <p class="st-disclaimer" style="margin:0;font-size:12.5px;line-height:1.35">${ctx.t('note')}</p>
          ${discLine(ctx, ['hypothetical', 'past'], 'position:static;font-size:12.5px;line-height:1.35')}</div>`;
      const cur = (v) => money(v);
      const pctR = (v) => fmt.num(v * 100, 2) + '%';
      function headers(s) {
        const hb = s.isPolicyB ? ['hPrem', 'hPremChg', 'hPolFee', 'hExp', 'hCoi', 'hRider', 'hTotal'] : ['hPrem', 'hAvgRet', 'hGains', 'hIncTax', 'hMgt', 'hTerm', 'hTotal'];
        return { a: ['hPrem', 'hPremChg', 'hPolFee', 'hExp', 'hCoi', 'hRider', 'hTotal'], b: hb, costB: s.isPolicyB ? 'hCostB' : 'hInvCost' };
      }
      function cells(r, s, res, html) {
        if (r.sub) {
          const bVals = s.isPolicyB ? r.b.map(cur) : ['', '', ''].concat(r.b.slice(3).map(cur));
          return ['', html ? ctx.t('tot') : ctx.text('tot')].concat(r.a.map(cur), [cur(r.totA)], bVals, [cur(r.totB)], ['', '', '', '']);
        }
        const bVals = s.isPolicyB ? r.b.map(cur) : [cur(r.b[0]), pctR(r.b[1])].concat(r.b.slice(2).map(cur));
        return [String(r.year), String(r.age)].concat(r.a.map(cur), [cur(r.totA)], bVals, [cur(r.totB)], [cur(r.costA), cur(r.costB), String(r.year), r.gap == null ? '' : cur(r.gap)]);
      }
      function paint() {
        const s = S(), res = iulccCalc(s), H = headers(s);
        ctx.$('.b07-iu-tab thead').innerHTML = `
          <tr><th class="g" colspan="2"></th><th class="g bl" colspan="7">${nameAH()}</th><th class="g bl" colspan="7">${nameBH()}</th><th class="g bl" colspan="2"></th><th class="g" colspan="2"></th></tr>
          <tr><th style="text-align:center">${ctx.t('hYear')}</th><th style="text-align:center">${ctx.t('hAge')}</th>${H.a.map((k, i) => `<th class="${i === 0 ? 'bl' : ''}">${ctx.t(k)}</th>`).join('')}${H.b.map((k, i) => `<th class="${i === 0 ? 'bl' : ''}">${ctx.t(k)}</th>`).join('')}<th class="bl">${ctx.t('hCostA')}</th><th>${ctx.t(H.costB)}</th><th style="text-align:center">${ctx.t('hYear')}</th><th>${ctx.t('hGt')}</th></tr>`;
        const emptyA = !(s.rowsA || []).some((r) => r && IU_CH.some((k) => +r[k]));
        ctx.$('.b07-iu-tab tbody').innerHTML = (emptyA ? `<tr class="b07-iu-empty"><td colspan="20">${ctx.t('empty')}</td></tr>` : '') + res.rows.map((r) => {
          const c = cells(r, s, res, true);
          return `<tr class="${r.sub ? 'sub' : ''}">${c.map((v, i) => `<td class="${i === 0 || i === 1 || i === 18 ? 'c' : ''} ${i === 2 || i === 9 || i === 16 ? 'bl' : ''} ${!r.sub && i === 18 && r.t === res.cross ? 'x' : ''} ${i === 19 ? 'gt' : ''}">${v}</td>`).join('')}</tr>`;
        }).join('');
        ['A', 'B'].forEach((k) => { const n = (k === 'A' ? s.rowsA : s.rowsB || []).filter((r) => r && IU_CH.some((c) => +r[c])).length; ctx.$(`[data-cnt="${k}"]`).innerHTML = n ? `<span class="num">${n}</span> ${ctx.t('yrs')}` : ''; });
        ctx.$$('.pol-only').forEach((n) => { n.hidden = !s.isPolicyB; }); ctx.$$('.mkt-only').forEach((n) => { n.hidden = s.isPolicyB; });
        ctx.$$('.mp').forEach((n) => { n.hidden = !s.isPolicyB; }); ctx.$$('.mm').forEach((n) => { n.hidden = s.isPolicyB; });
        ctx.$$('.yr-only').forEach((n) => { n.hidden = s.market === 'FIXED'; }); ctx.$$('.fx-only').forEach((n) => { n.hidden = s.market !== 'FIXED'; });
        ctx.$$('input[data-bf="nameB"]').forEach((x) => { if (x !== document.activeElement) x.value = nameB(); });
        if (EFA.edit && EFA.edit.on) EFA.edit.arm(ctx.$('.b07-iu-tab')); else EFA.numify(ctx.$('.b07-iu-tab'));
        ctx._iu = { s, res };
      }
      function sheet() {
        const s = S(), res = iulccCalc(s), H = headers(s);
        const heads = ['hYear', 'hAge'].concat(H.a, H.b, ['hCostA', H.costB, 'hYear', 'hGt']);
        const fields = heads.map((h, i) => 'c' + i);
        return {
          heading: `${nameAH()} ${ctx.t('wsVs')} ${nameBH()} ${ctx.t('wsTail')}`, size: 'full',
          columns: heads.map((h, i) => ({ field: fields[i], header: ctx.t(h), type: i === 0 || i === 1 || i === 18 ? 'text' : (i === 10 && !s.isPolicyB ? 'pct' : 'money'), align: i === 0 || i === 1 || i === 18 ? 'center' : 'right' })),
          rows: res.rows.map((r) => { const c = cells(r, s, res), o = {}; c.forEach((v, i) => { o[fields[i]] = v; }); return o; }),
          filter: false
        };
      }
      bindInputs(ctx, (id) => {
        if (id === 'T') { /* rows beyond T are kept; the table follows T */ }
        paint();
      });
      ctx.on(ctx.$$('[data-sw]'), 'click', (e, b) => {
        const k = b.dataset.sw, v = !m(k, false); ctx.remember(k, v); b.setAttribute('aria-checked', v); paint();
      });
      const mk = ctx.$('[data-mkt]'), sy = ctx.$('[data-start]');
      mk.addEventListener('change', () => {
        ctx.remember('market', mk.value);
        const ser = mktSeries(mk.value);
        if (ser) { const first = ser[0][0]; const y0 = m('startYear', 1990); if (!y0 || y0 < first) ctx.remember('startYear', first); }
        sy.innerHTML = yearOpts(); paint();
      });
      sy.addEventListener('change', () => { ctx.remember('startYear', +sy.value); paint(); });
      [mk, sy].forEach((x) => x.addEventListener('keydown', (e) => e.stopPropagation()));
      ctx.on(ctx.$$('[data-edit]'), 'click', (e, b) => editDialog(b.dataset.edit));
      ctx.on(ctx.$('[data-chart]'), 'click', () => chartDialog());
      wireDocFallback(ctx);

      /* ----- the edit dialog: T rows, click-to-edit cells, paste helper, interpolation ----- */
      function editDialog(which) {
        const s = S(), key = which === 'A' ? 'rowsA' : 'rowsB';
        const src = m(key, []);
        const rows = Array.from({ length: s.T }, (_, i) => { const r = src[i] || {}; const o = {}; IU_CH.forEach((c) => { o[c] = isFinite(+r[c]) ? +r[c] : 0; }); return o; });
        const show = (v) => (v ? fmt.num(v, 0) : '0');
        const md = modal(ctx, {
          width: 1360, closable: true, esc: false, backdrop: false,
          title: `${ctx.t('edTitle')}: ${which === 'A' ? nameAH() : nameBH()}`,
          body: `${ctx.t('eHint', { tag: 'p', cls: 'b07-ed-hint' })}
            <div class="b07-scroll b07-ed-wrap"><table class="st-table"><thead><tr><th style="text-align:center">${ctx.t('eYear')}</th>${['ePrem', 'ePremChg', 'ePolFee', 'eUnit', 'eCoi', 'eRider'].map((k) => `<th>${ctx.t(k)}</th>`).join('')}</tr></thead>
            <tbody>${rows.map((r, i) => `<tr><td class="num">${i + 1}</td>${IU_CH.map((c) => `<td><input class="b07-ed-in" data-r="${i}" data-c="${c}" inputmode="decimal" autocomplete="off" value="${show(r[c])}"></td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
          foot: `<button type="button" class="b07-btn ghost" data-ec="cancel">${ctx.t('eCancel')}</button><button type="button" class="b07-btn ghost" data-ec="interp">${ctx.t('eInterp')}</button><button type="button" class="b07-btn" data-ec="save">${ctx.t('eSave')}</button>`
        });
        const refresh = () => md.querySelectorAll('.b07-ed-in').forEach((x) => { if (x !== document.activeElement) x.value = show(rows[+x.dataset.r][x.dataset.c]); });
        md.querySelectorAll('.b07-ed-in').forEach((x) => {
          x.addEventListener('focus', () => { x.value = String(rows[+x.dataset.r][x.dataset.c]); setTimeout(() => x.select(), 0); });
          x.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); x.blur(); } });
          x.addEventListener('blur', () => { const v = fmt.parse(x.value); rows[+x.dataset.r][x.dataset.c] = isFinite(v) ? Math.round(v * 100) / 100 : 0; x.value = show(rows[+x.dataset.r][x.dataset.c]); });
          x.addEventListener('contextmenu', (e) => { if (EFA.edit && EFA.edit.on) return; e.preventDefault(); pasteHelper(md, e, +x.dataset.r, x.dataset.c, rows, refresh); });
        });
        md.querySelector('[data-ec="cancel"]').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) md.close(); });
        md.querySelector('[data-ec="interp"]').addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; interpolate(rows, IU_CH); refresh(); });
        md.querySelector('[data-ec="save"]').addEventListener('click', () => {
          if (EFA.edit && EFA.edit.on) return;
          ctx.remember(key, rows); md.close(); paint();
        });
      }
      function pasteHelper(md, e, r0, c, rows, refresh) {
        const old = md.querySelector('.b07-paste'); if (old) old.remove();
        const box = document.createElement('div');
        box.className = 'b07-card b07-paste';
        box.innerHTML = `<button type="button" class="b07-x" aria-label="Close">&times;</button>${ctx.t('pTitle', { tag: 'h4' })}<textarea aria-label="${esc(ctx.text('pHint'))}" placeholder="${esc(ctx.text('pHint'))}"></textarea>
          <div class="acts"><button type="button" class="b07-btn sm" data-p="set">${ctx.t('pPaste')}</button><button type="button" class="b07-btn sm ghost" data-p="add">${ctx.t('pAdd')}</button><button type="button" class="b07-btn sm ghost" data-p="sub">${ctx.t('pSub')}</button></div>
          <button type="button" class="b07-link" data-p="zero" style="justify-self:start;font-size:16px">${ctx.t('pZero')}</button>`;
        const r = ctx.el.getBoundingClientRect(), sc = r.width / 1600;
        box.style.left = clamp((e.clientX - r.left) / sc, 20, 1160) + 'px'; box.style.top = clamp((e.clientY - r.top) / sc, 20, 600) + 'px';
        ctx.el.appendChild(box); md._paste = box;
        const ta = box.querySelector('textarea');
        ta.addEventListener('keydown', (ev) => ev.stopPropagation());
        setTimeout(() => ta.focus(), 30);
        const close = () => box.remove();
        box.querySelector('.b07-x').addEventListener('click', close);
        box.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => {
          if (EFA.edit && EFA.edit.on) return;
          const how = b.dataset.p;
          if (how === 'zero') { for (let i = r0; i < Math.min(rows.length, r0 + 100); i++) rows[i][c] = 0; }
          else {
            const vals = parseClip(ta.value);
            for (let i = 0; i < vals.length && r0 + i < rows.length; i++) {
              const cur0 = rows[r0 + i][c] || 0, v = Math.round(vals[i] * 100) / 100;
              rows[r0 + i][c] = how === 'set' ? v : (how === 'add' ? cur0 + v : cur0 - v);
            }
          }
          refresh(); close();
        }));
        const prevClose = md.close; md.close = () => { close(); prevClose(); };
      }
      /* ----- crossover chart ----- */
      function chartDialog() {
        const s = S(), res = iulccCalc(s), data = res.chart, T = data.length;
        const w = 1300, h = 560, pad = { l: 120, r: 24, t: 16, b: 46 };
        const all = data.flat().filter(isFinite), lo = Math.min(0, ...all), hi = Math.max(1, ...all);
        const X = (i) => pad.l + (T <= 1 ? 0 : i * (w - pad.l - pad.r) / (T - 1)), Y = (v) => pad.t + (h - pad.t - pad.b) * (1 - (v - lo) / (hi - lo));
        const cols = [P.navy, P.gold];
        let g = '';
        for (let k = 0; k <= 5; k++) { const v = lo + (hi - lo) * k / 5, y = Y(v); g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="#d6cfc4"/><text x="${pad.l - 12}" y="${y + 6}" text-anchor="end" font-family="DM Sans, sans-serif" font-weight="600" font-size="16" fill="#0d1e3a">${money(v)}</text>`; }
        const every = T > 40 ? 5 : T > 20 ? 2 : 1;
        for (let i = 0; i < T; i += every) g += `<text x="${X(i)}" y="${h - 14}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="600" font-size="15" fill="#0d1e3a">${i + 1}</text>`;
        [0, 1].forEach((j) => {
          g += `<path d="${data.map((d, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(d[j]).toFixed(1)}`).join('')}" fill="none" stroke="${cols[j]}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`;
          data.forEach((d, i) => { g += `<circle class="mk" data-j="${j}" data-i="${i}" cx="${X(i).toFixed(1)}" cy="${Y(d[j]).toFixed(1)}" r="9" fill="transparent"/>`; });
        });
        const md = modal(ctx, {
          width: 1400, closable: true, title: ctx.t('chartTitle'),
          body: `<div class="b07-lc-lg"><span><i style="background:${cols[0]}"></i>${nameAH()}</span><span><i style="background:${cols[1]}"></i>${nameBH()}</span></div>
            <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" data-lc="1">${g}</svg>`
        });
        const tip = tipper(ctx), svg = md.querySelector('[data-lc]');
        svg.addEventListener('mousemove', (ev) => {
          const t = ev.target.closest('.mk'); if (!t) { tip.hide(); return; }
          const j = +t.dataset.j, i = +t.dataset.i;
          tip.show(ev, `<b>${j ? nameBH() : nameAH()}</b>${num(money(data[i][j]))}`);
        });
        svg.addEventListener('mouseleave', () => tip.hide());
        const pc = md.close; md.close = () => { tip.hide(); pc(); };
      }
      paint();
    },
    leave: leaveModals
  });

  /* =====================================================================
     HM: hm1 and hm2 are the shared how-much / how-long calculators (EFA.lib.howMuch, EFA.lib.howLong)
     ===================================================================== */
  function libHost(id, libName, o) {
    const L = LIB(libName);
    if (L && L.screen) { L.screen(id, o); return; }
    EFA.screen(id, {
      title: o.title,
      copy: { pending: 'This calculator is still loading. Please try again in a moment.', _notes: o.notes },
      render(ctx) { ctx.el.innerHTML = `<div class="pending-screen"><div class="box">${ctx.t('pending', { tag: 'p', cls: 'b07-pend' })}</div></div>`; }
    });
  }
  libHost('hm1', 'howMuch', {
    title: 'How much is enough',
    notes: 'If the income stopped tomorrow, how much would it take for the family to live on the earnings alone, without spending the principal?\n\n- Enter the income the family needs and what is already saved.\n- Ask: Is your family\'s plan built to last, or built to run out?\nPAUSE'
  });
  libHost('hm2', 'howLong', {
    title: 'How long will the proceeds last',
    notes: 'This turns the question around: with the coverage and savings in place today, how long would the money actually last, with the income rising each year?\n\n- Ask: Is that the number of years you want your family to have?\nPAUSE'
  });
})();
