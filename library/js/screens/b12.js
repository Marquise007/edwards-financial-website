/* Batch 12: Qualified Plans (QP, QPD2T, QP101, QPCM), Tax History (TAXHIST), Remaining Income Potential (IPR),
   Retirement Income Alternatives (RIA, RIA4) and Retirement Income Predictability (RIP).
   Structure, sequence, interactions and math follow the phase-1 specs; every drawing and every word is new. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt;
  const esc = EFA.util.esc;
  EFA.engines = EFA.engines || {};
  const RED = '#b3402e';

  /* =====================================================================================
     Shared plumbing for this module
     ===================================================================================== */

  /* ---------- per-client values shared across screens (the original's "case data") ----------
     Namespace 'case'; keys keep the original case-key names. Money in dollars, percents as fractions. */
  const CASE_NS = 'case';
  const DEF = {
    annual_investment: 5000, company_match: 2500, case_file_ror_taxes: 0.30, time_period_in_years: 30, taxable_return: 0.05,
    tsra_withdrawal_tax_bracket: 0.30, tdt_withdrawal_tax_bracket: 0.30, qp_vs_ti_withdrawal_tax_bracket: 0.30, qp_withdrawal_tax_bracket: 0.30,
    account_balance: 100000, qp_vs_ti_initial_acc_balance: 0, qp_matched_contribution: 2500, qp_unmatched_contribution: 2500, qp_match_time_period: 30,
    case_file_current_age: 42, case_file_spouse_age: 40, case_file_retirement_age: 65, case_file_life_expectancy: 84, case_file_ror_inflation: 0.03,
    case_file_annual_income: 102000,
    trad_retirement_asset_value: 2000000, trad_investment_ror: 0.05, trad_taxable_percentage: 1, trad_deferred_percentage: 0, trad_free_percentage: 0, trad_insurance_value: 0,
    ideal_retirement_asset_value: 2000000, ideal_investment_ror: 0.05, ideal_taxable_percentage: 1, ideal_deferred_percentage: 0, ideal_free_percentage: 0, ideal_insurance_value: 2000000,
    inflation_adjust_income_stream: false,
    income_discount_factor: 0.03,
    rip_total_assets: 1000000, rip_withdrawal_rate: 0.05, rip_market_index: '', rip_start_year: 1973,
    rip_has_market_shield: false, rip_threshold: 0, rip_risk_asset_ratio: 0, rip_safe_asset_ratio: 1, rip_safe_asset_ror: 0.05, rip_has_death_benefit: false,
    rip_has_ceiling: true, rip_market_ceiling: 0.10, rip_has_participation: true, rip_market_participation: 1, rip_has_floor: true, rip_market_floor: 0
  };
  const CASE = {
    get(k, d) { const v = EFA.clients.get(CASE_NS, k, undefined); return v === undefined || v === null ? (d !== undefined ? d : DEF[k]) : v; },
    set(k, v) { EFA.clients.set(CASE_NS, k, v); },
    n(k, d) { const v = Number(CASE.get(k, d)); return isFinite(v) ? v : (d !== undefined ? d : DEF[k]); }
  };

  /* ---------- formatting ---------- */
  const nfCache = {};
  const nf = (lo, hi) => (nfCache[lo + '.' + hi] = nfCache[lo + '.' + hi] || new Intl.NumberFormat('en-US', { minimumFractionDigits: lo, maximumFractionDigits: hi }));
  const money = (v) => F.money(v);
  const money2 = (v) => F.money(v, { dp: 2 });
  /** fraction -> "30%", "5.25%" (trailing zeros trimmed, up to dp decimals) */
  const pctT = (f, dp) => (f == null || !isFinite(f) ? '–' : nf(0, dp == null ? 2 : dp).format(f * 100) + '%');
  const pct2 = (f) => F.pct(f, 2);
  const N = (s) => `<span class="num">${s}</span>`;
  const r2 = (v) => Math.round(v * 100) / 100;

  /* ---------- module state on the ctx ---------- */
  const st = (ctx) => (ctx._b12 = ctx._b12 || { f: {}, disc: {} });

  /* ---------- numeric inputs (shared case keys, max clamp while typing, commit on blur) ----------
     o: {id, key (shared case key) | mem (remember per screen) | neither (screen-local), type 'money'|'pct'|'int'|'num',
         def, min, max (same units as the stored value), dp, w, cls, ro, live, disclose (first-click flag name), label (copy key for aria)} */
  const FX = {
    show(m, v) {
      if (v == null || !isFinite(v)) return '';
      switch (m.type) {
        case 'money': return F.money(v, { dp: m.dp || 0 });
        case 'pct': return pctT(v, m.dp == null ? 2 : m.dp);
        case 'int': return F.int(v);
        default: return nf(0, m.dp == null ? 2 : m.dp).format(v);
      }
    },
    raw(m, v) { if (v == null || !isFinite(v)) return ''; return m.type === 'pct' ? String(+(v * 100).toFixed(4)) : String(+(+v).toFixed(2)); },
    /** the original's parser: sign from a leading "-", "$-" or en dash; keep digits and "."; round to 2 decimals; empty -> 0 */
    parse(m, s) {
      const t = String(s == null ? '' : s).trim();
      const neg = /^(\$?[-–])/.test(t);
      const d = t.replace(/[^0-9.]/g, '');
      if (d === '' || d === '.') return 0;
      let v = parseFloat(d); if (!isFinite(v)) return NaN;
      v = Math.round(v * 100) / 100; if (neg) v = -v;
      return m.type === 'pct' ? v / 100 : v;
    }
  };
  function readStore(ctx, m) {
    const d = m.def !== undefined ? m.def : DEF[m.key];
    let v;
    if (m.key) v = CASE.get(m.key, d); else if (m.mem) v = ctx.mem('v.' + m.id, d); else v = d;
    v = Number(v); return isFinite(v) ? v : d;
  }
  function writeStore(ctx, m, v) {
    m.value = v;
    if (m.key) CASE.set(m.key, v); else if (m.mem) ctx.remember('v.' + m.id, v);
  }
  function fld(ctx, o) {
    const S = st(ctx);
    const m = Object.assign({ type: 'num' }, o);
    m.value = m.value !== undefined ? m.value : readStore(ctx, m);
    S.f[m.id] = m;
    const aria = m.label ? ` aria-label="${esc(ctx.text(m.label))}"` : '';
    return `<input class="b12-in${m.cls ? ' ' + m.cls : ''}${m.ro ? ' b12-ro' : ''}" data-f="${esc(m.id)}" type="text" inputmode="${m.type === 'int' ? 'numeric' : 'decimal'}" autocomplete="off" spellcheck="false"${aria}${m.ro ? ' readonly tabindex="-1"' : ''}${m.w ? ` style="width:${m.w}px"` : ''} value="${esc(FX.show(m, m.value))}">`;
  }
  function sanitize(inp, m) {
    const v = inp.value, ok = m.type === 'int' ? v.replace(/[^0-9]/g, '') : v.replace(/[^0-9.,$%\-– ]/g, '');
    if (ok !== v) inp.value = ok;
  }
  const same = (a, b) => Math.abs(Number(a) - Number(b)) < 1e-9;
  function commitField(ctx, id, inp, live) {
    const S = st(ctx), m = S.f[id]; if (!m || m.ro) return;
    let v = FX.parse(m, inp.value);
    if (!isFinite(v)) v = m.value;
    if (m.max != null && v > m.max) v = m.max;
    if (!live && m.min != null && v < m.min) v = m.min;
    if (m.type === 'int') v = Math.round(v);
    if (!live) inp.value = FX.show(m, v);
    if (same(v, m.value)) return;
    writeStore(ctx, m, v); syncTwins(ctx, m, v);
    if (S.onCommit) { try { S.onCommit(id, v, m); } catch (e) { console.error(e); } }
  }
  /** other inputs on the screen bound to the same shared key show the new value too */
  function syncTwins(ctx, m, v) {
    if (!m.key) return;
    Object.values(st(ctx).f).forEach((o) => {
      if (o === m || o.key !== m.key) return;
      o.value = v;
      const inp = ctx.$(`input[data-f="${o.id}"]`);
      if (inp && document.activeElement !== inp) inp.value = FX.show(o, v);
    });
  }
  /** attach behaviour to every not-yet-wired input[data-f] inside the screen */
  function wire(ctx, onCommit) {
    const S = st(ctx);
    if (onCommit) S.onCommit = onCommit;
    ctx.$$('input[data-f]').forEach((inp) => {
      if (inp.dataset.w === '1') return; inp.dataset.w = '1';
      const id = inp.dataset.f;
      inp.addEventListener('focus', () => { const m = S.f[id]; if (!m || m.ro) return; inp.value = FX.raw(m, m.value); setTimeout(() => { try { inp.select(); } catch (e) { /* detached */ } }, 0); });
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
      inp.addEventListener('input', () => {
        const m = S.f[id]; if (!m) return;
        sanitize(inp, m);
        if (m.max != null) { const v = FX.parse(m, inp.value); if (isFinite(v) && v > m.max) inp.value = FX.raw(m, m.max); }
        if (m.live) commitField(ctx, id, inp, true);
      });
      inp.addEventListener('blur', () => commitField(ctx, id, inp, false));
      const m0 = S.f[id]; if (m0 && m0.disclose) guardRate(ctx, id, m0.disclose);
    });
  }
  /** set a field programmatically (stores it unless store === false) */
  function setVal(ctx, id, v, store) {
    const m = st(ctx).f[id]; if (!m) return;
    if (store === false) m.value = v; else { writeStore(ctx, m, v); syncTwins(ctx, m, v); }
    const inp = ctx.$(`input[data-f="${id}"]`);
    if (inp && document.activeElement !== inp) inp.value = FX.show(m, v);
  }
  const val = (ctx, id) => { const m = st(ctx).f[id]; return m ? m.value : undefined; };

  /* ---------- consume-once state for returning from a jump ---------- */
  const JUMP = {};
  function jumpTo(ctx, key, screenId, state) {
    const p = (EFA.catalog.presentations || []).find((x) => x.key === key);
    if (p && EFA.presReady(p) && state) JUMP[ctx.id] = state;
    ctx.jump(key, screenId);
  }
  function takeJump(ctx) { const s = JUMP[ctx.id]; delete JUMP[ctx.id]; return s || null; }

  /* ---------- shared components (js/lib/*: docs/components.md), reached through small guarded helpers ---------- */
  const LIB = () => EFA.lib || {};
  /** guard a return-rate input: the first focus in a screen visit opens the shared disclosure notice */
  function guardRate(ctx, id, flag) {
    const D = LIB().disclosure;
    if (D && D.guard) D.guard(ctx, `input[data-f="${id}"]`, { flag: flag || 'rate' });
  }
  /** run fn after the shared notice has been acknowledged once in this visit (the ria/rip "before documentation" case) */
  function afterNotice(ctx, flag, fn) { const D = LIB().disclosure; if (D && D.once) D.once(ctx, flag, fn); else fn(); }
  /** the shared "hypothetical illustration" line (plus any other topics) */
  function discLine(ctx, topics, style) {
    const D = LIB().disclosure;
    return D ? D.line(topics || ['hypothetical'], { cls: 'b12-disc', style }) : '';
  }
  /** the component's own "Documentation" opener; data is a function called at click time (return null to do nothing) */
  function docLink(ctx, data, cls, style) {
    const W = LIB().worksheet;
    return `<div class="b12-doc${cls ? ' ' + cls : ''}"${style ? ` style="${style}"` : ''}>${W ? W.button(ctx, { data }) : ''}</div>`;
  }
  function openSheet(ctx, data) { const W = LIB().worksheet; if (W) W.open(ctx, data); }
  /** life expectancy / inflation openers (the shared popups); onUse receives an age / a fraction */
  const leLink = (ctx, onUse, o) => (LIB().lifeExpectancy ? LIB().lifeExpectancy.link(ctx, Object.assign({ onUse, age: () => CASE.n('case_file_current_age'), spouseAge: () => CASE.n('case_file_spouse_age') }, o || {})) : '');
  const infLink = (ctx, onUse, o) => (LIB().inflation ? LIB().inflation.link(ctx, Object.assign({ onUse }, o || {})) : '');
  /** worksheet column helper (headers are editable copy; money columns default to 2 decimals) */
  const wcol = (ctx, field, key, type, o) => Object.assign({ field, header: ctx.t(key), type: type || 'money', dp: (type || 'money') === 'int' ? undefined : 2 }, o || {});

  /* ---------- icons (drawn in code, no text) ---------- */
  function starPath(cx, cy, R, r) {
    let d = '';
    for (let i = 0; i < 10; i++) { const [x, y] = A.pt(cx, cy, i % 2 ? r : R, i * 36); d += (i ? 'L' : 'M') + x.toFixed(2) + ',' + y.toFixed(2); }
    return d + 'Z';
  }
  const qPath = (s, ox, oy) => { const k = (n) => (n * s).toFixed(2); return `M${k(ox + 36)},${k(oy + 36)}C${k(ox + 36)},${k(oy + 23)} ${k(ox + 45)},${k(oy + 17)} ${k(ox + 52)},${k(oy + 17)}C${k(ox + 61)},${k(oy + 17)} ${k(ox + 67)},${k(oy + 24)} ${k(ox + 67)},${k(oy + 33)}C${k(ox + 67)},${k(oy + 42)} ${k(ox + 60)},${k(oy + 45)} ${k(ox + 55)},${k(oy + 49)}C${k(ox + 52)},${k(oy + 52)} ${k(ox + 51)},${k(oy + 55)} ${k(ox + 51)},${k(oy + 61)}`; };
  const ICON = {
    star: (sz, cls) => `<svg class="b12-ico ${cls || ''}" viewBox="0 0 100 100" width="${sz}" height="${sz}" aria-hidden="true"><circle cx="50" cy="53" r="44" fill="rgba(13,30,58,.14)"/><circle cx="50" cy="50" r="44" fill="${P.navy}"/><circle cx="50" cy="50" r="38" fill="none" stroke="${P.gold}" stroke-opacity=".5" stroke-width="2"/><path d="${starPath(50, 52, 27, 11.5)}" fill="${P.gold}" stroke="${P.goldLt}" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    question: (sz, cls) => `<svg class="b12-ico ${cls || ''}" viewBox="0 0 100 100" width="${sz}" height="${sz}" aria-hidden="true"><circle cx="50" cy="53" r="44" fill="rgba(13,30,58,.10)"/><circle cx="50" cy="50" r="44" fill="${P.mist}" stroke="${P.navy4}" stroke-width="3"/><path d="${qPath(1, -2, 4)}" fill="none" stroke="${P.navy3}" stroke-width="9" stroke-linecap="round"/><circle cx="49" cy="77" r="5.6" fill="${P.navy3}"/></svg>`,
    check: (sz, cls) => `<svg class="b12-ico ${cls || ''}" viewBox="0 0 100 100" width="${sz}" height="${sz}" aria-hidden="true"><circle cx="50" cy="53" r="44" fill="rgba(13,30,58,.14)"/><circle cx="50" cy="50" r="44" fill="${P.gold}"/><circle cx="50" cy="50" r="38" fill="none" stroke="${P.paper}" stroke-opacity=".55" stroke-width="2"/><path d="M29 52 L44 67 L72 36" fill="none" stroke="${P.navy}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    calc: (sz, cls) => `<svg class="b12-ico ${cls || ''}" viewBox="0 0 100 100" width="${sz}" height="${sz}" aria-hidden="true"><rect x="22" y="12" width="60" height="82" rx="10" fill="rgba(13,30,58,.14)"/><rect x="20" y="8" width="60" height="82" rx="10" fill="${P.navy}"/><rect x="28" y="16" width="44" height="18" rx="4" fill="${P.goldPale}"/><path d="M58 25h8" stroke="${P.navy}" stroke-width="3" stroke-linecap="round"/>${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${29 + c * 15}" y="${42 + r * 15}" width="11" height="10" rx="2.5" fill="${r === 2 && c === 2 ? P.gold : P.mist2}"/>`).join('')).join('')}</svg>`,
    pencil: (sz) => `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6L9 21H3v-6z"/><path d="M12 6l6 6"/></svg>`,
    trash: (sz) => `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>`,
    dot: (sz) => `<svg viewBox="0 0 20 20" width="${sz}" height="${sz}" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="${P.navy}"/><circle cx="10" cy="10" r="3.2" fill="${P.gold}"/></svg>`
  };

  /* ---------- module stylesheet: shared pieces ---------- */
  EFA.css('b12', `
  .b12-f { transition: opacity .8s ease; }
  .stage .b12-f.is-off { transition-duration: .3s; }
  .b12-ico { display: block; flex: 0 0 auto; }
  .b12-head { position: absolute; left: 110px; right: 110px; top: 44px; display: grid; justify-items: center; gap: 12px; text-align: center; }
  .b12-head .st-h1, .b12-head .st-h2 { max-width: 1380px; }
  .b12-card { background: var(--paper); border: 1px solid var(--rule); border-radius: 16px; box-shadow: 0 14px 36px rgba(13,30,58,.08); }
  .b12-tint { background: #fbf8f1; border: 1px solid #e6dfd2; border-radius: 16px; box-shadow: 0 10px 26px rgba(13,30,58,.07); }
  .b12-in { height: 44px; border: 1.5px solid var(--mist-2); border-radius: 10px; background: #fff; padding: 0 14px; font: 600 22px/1 var(--f-body); color: var(--navy); text-align: right; width: 200px; box-sizing: border-box; font-variant-numeric: lining-nums tabular-nums; }
  .b12-in:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(184,151,46,.22); }
  .b12-in.b12-ro { background: #f3f5f8; border-color: transparent; color: var(--navy); cursor: default; }
  .b12-in.b12-sm { height: 38px; font-size: 19px; padding: 0 10px; }
  .b12-in.b12-xs { height: 34px; font-size: 17px; padding: 0 8px; border-radius: 8px; }
  .b12-in.b12-ctr { text-align: center; }
  .b12-in.b12-bare { border-color: transparent; background: rgba(255,255,255,.75); }
  .b12-in.b12-bare:focus { background: #fff; }
  .b12-link { font: 700 17px/1.2 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); cursor: pointer; border-bottom: 1.5px dotted currentColor; background: none; border-top: 0; border-left: 0; border-right: 0; padding: 0 0 2px; }
  .b12-link:hover { color: var(--navy); }
  .b12-a { color: var(--gold-deep); cursor: pointer; border-bottom: 2px dotted rgba(184,151,46,.8); }
  .b12-a:hover { color: var(--navy); border-bottom-color: var(--navy); }
  .stage .st-pill.b12-go { min-height: 58px; padding: 0 46px; font-size: 21px; letter-spacing: .05em; box-shadow: 0 12px 26px rgba(13,30,58,.20); border: 1.5px solid var(--gold); }
  .b12-disc { position: absolute; left: 110px; right: 110px; bottom: 64px; }
  .b12-dot { display: inline-grid; place-items: center; width: 26px; height: 26px; border: 0; padding: 0; background: transparent; border-radius: 999px; vertical-align: middle; margin-left: 10px; cursor: pointer; transition: transform .2s ease; }
  .b12-dot:hover { transform: scale(1.15); }
  .stage .b12-ovl .st-overlay-in { width: 780px; }
  .stage .b12-ovl.b12-sm .st-overlay-in { width: 620px; }
  .stage .b12-ovl.b12-lg .st-overlay-in { width: 1000px; }
  .stage .b12-ovl .st-overlay-h { font-size: 36px; padding: 22px 30px; }
  .stage .b12-ovl .st-overlay-b { padding: 28px 34px 32px; }
  .b12-ovl-p { margin: 0; font: 500 24px/1.55 var(--f-body); color: var(--navy); }
  .b12-ovl-act { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
  .b12-choose { display: grid; gap: 12px; }
  .stage .b12-choose .st-pill { width: 100%; font-size: 21px; min-height: 56px; }
  .b12-red { color: ${RED}; }
  .b12-load { position: absolute; display: grid; place-items: center; text-align: center; gap: 10px; }
  .b12-load .st-eyebrow { color: var(--muted); }
  `);

  /** small in-stage modal built on ctx.overlay */
  function modal(ctx, o) {
    const ov = ctx.overlay({ cls: 'b12-ovl' + (o.cls ? ' ' + o.cls : ''), title: o.title, html: o.html, onClose: o.onClose });
    if (o.after) o.after(ov);
    return ov;
  }
  /** a "please choose" chooser for documentation tables */
  function chooser(ctx, titleKey, items, pick) {
    const ov = modal(ctx, {
      cls: 'b12-sm', title: ctx.t(titleKey),
      html: `<div class="b12-choose">${items.map((it, i) => `<button class="st-pill" type="button" data-pick="${i}">${ctx.t(it.key)}</button>`).join('')}</div>`
    });
    ov.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      const it = items[+b.dataset.pick]; ov.close(); pick(it);
    }));
    return ov;
  }

  /* =====================================================================================
     QP 1. Qualified plan vocabulary cloud
     ===================================================================================== */
  const QP1_ROWS = [
    ['pension', 'sep', '401k'], ['stock', 'trad'], ['thrift'], ['keogh', '*', 'roth'],
    ['esop', 'profit', 'hr10', 'annuity'], ['simple', '403b'], ['db', 'dc']
  ];
  EFA.css('b12-qp1', `
  .b12-cloud { position: absolute; left: 70px; right: 70px; top: 34px; bottom: 74px; display: flex; flex-direction: column; }
  .b12-crow { flex: 1; display: flex; align-items: center; min-height: 0; }
  .b12-crow.b12-cr5 { margin-left: 10%; }
  .b12-crow.b12-cr6 { margin-right: 17%; }
  .b12-ccell { flex: 1; display: flex; justify-content: center; align-items: center; min-width: 0; }
  .b12-term { font: 700 39px/1.1 var(--f-body); color: var(--navy); cursor: pointer; padding: 6px 14px 8px; border-radius: 12px; white-space: nowrap;
    background: transparent; border: 0; border-bottom: 2.5px dotted rgba(184,151,46,.75); transition: color .2s ease, background .2s ease, transform .2s ease; }
  .b12-term:hover { color: var(--gold-deep); background: rgba(240,230,196,.55); transform: translateY(-2px); }
  .b12-term.b12-alt { color: var(--navy-4); }
  .b12-hub { position: relative; padding: 26px 58px 30px; border-radius: 20px; background: var(--navy); color: var(--cream);
    border: 2px solid var(--gold); box-shadow: 0 0 0 14px rgba(184,151,46,.13), 0 0 0 30px rgba(184,151,46,.06), 0 26px 60px rgba(13,30,58,.28); }
  .b12-hub span { font: 600 66px/1 var(--f-display); letter-spacing: .01em; white-space: nowrap; }
  `);
  EFA.screen('qp1', {
    title: 'Qualified plan vocabulary cloud',
    copy: {
      center: 'Qualified Plans',
      't.pension': 'Pension Plan', 't.sep': 'SEP', 't.401k': '401(k)', 't.stock': 'Stock Bonus', 't.trad': 'Traditional IRA', 't.thrift': 'Thrift Plan',
      't.keogh': 'Keogh', 't.roth': 'Roth IRA', 't.esop': 'ESOP', 't.profit': 'Profit Sharing', 't.hr10': 'HR 10', 't.annuity': 'Annuity',
      't.simple': 'Simple', 't.403b': '403(b)', 't.db': 'Defined Benefit', 't.dc': 'Defined Contribution',
      'h.pension': 'Pension Plan', 'h.sep': 'Simplified Employee Pension (SEP)', 'h.401k': '401(k) Plan', 'h.stock': 'Stock Bonus Plan',
      'h.trad': 'Traditional IRA', 'h.thrift': 'Thrift Savings Plan', 'h.keogh': 'Keogh Plan', 'h.hr10': 'HR 10 Plan', 'h.roth': 'Roth IRA',
      'h.esop': 'Employee Stock Ownership Plan (ESOP)', 'h.profit': 'Profit Sharing Plan', 'h.simple': 'SIMPLE IRA', 'h.403b': '403(b) Plan',
      'h.annuity': 'Annuity', 'h.db': 'Defined Benefit Plan', 'h.dc': 'Defined Contribution Plan',
      'd.pension': 'Usually this means a defined benefit plan. Your employer promises a benefit at retirement, set by a formula based on your pay and your years of service, and the employer funds the plan to keep that promise.',
      'd.sep': 'A Simplified Employee Pension is built on IRAs. The employer contributes to an IRA set up for each eligible employee, and those contributions are subject to yearly limits set by law.',
      'd.401k': 'A profit sharing style plan that lets employees set aside part of their salary before income tax. Yearly testing can limit how much the most highly paid employees are allowed to defer.',
      'd.stock': 'A defined contribution plan that invests mainly in the employer\'s own stock. An ESOP is a specialized kind of stock bonus plan.',
      'd.trad': 'An individual retirement account. Contributions may be deductible up to an annual cap, and withdrawals are generally taxed as ordinary income.',
      'd.thrift': 'The federal Thrift Savings Plan, the retirement savings plan for federal employees and members of the uniformed services. It works much like a 401(k).',
      'd.keogh': 'A retirement plan for self-employed business owners, also known as an HR 10 plan. It can be set up as a defined benefit plan or as a defined contribution plan, such as profit sharing or money purchase, and contributions are deductible within legal limits.',
      'd.roth': 'An individual account funded with dollars you have already paid tax on. Qualified withdrawals are generally income-tax-free under current tax law, subject to applicable requirements. Income limits apply to who may contribute.',
      'd.esop': 'An Employee Stock Ownership Plan makes employees owners of company stock. The plan may borrow money to buy shares, and the employer can contribute shares instead of cash.',
      'd.profit': 'A flexible defined contribution plan. The employer decides each year whether to contribute, and your benefit is whatever your account is worth.',
      'd.simple': 'A SIMPLE IRA is a plan for small employers. Employees defer part of their salary, and the employer adds either a matching contribution or a flat contribution for every eligible employee.',
      'd.403b': 'A tax-deferred annuity plan for employees of public schools and certain tax-exempt organizations, funded through salary reduction.',
      'd.annuity': 'A series of periodic payments, made for a set number of years or for the rest of a lifetime.',
      'd.db': 'A plan where the benefit is fixed by a formula, and the employer funds the plan to reach that benefit.',
      'd.dc': 'A plan with one account for each participant. Your benefit depends on what goes in and how the investments perform. Common types include 401(k), 403(b), profit sharing, money purchase, stock bonus and ESOP plans.',
      _notes: 'So many names, and nearly all of them work the same basic way: put off the tax today, settle up with the IRS later.\n\n- Click any name for a plain-language definition.\n- Ask: Which of these have you had over the years, and do you know how each one will be taxed when the money comes out?\nPAUSE'
    },
    render(ctx) {
      const body = (k) => (k === 'hr10' ? 'keogh' : k);
      let i = 0;
      ctx.el.innerHTML = `<div class="b12-cloud">${QP1_ROWS.map((row, ri) => `<div class="b12-crow b12-cr${ri + 1}">${row.map((k) => {
        if (k === '*') return `<div class="b12-ccell"><div class="b12-hub">${ctx.t('center')}</div></div>`;
        i++;
        return `<div class="b12-ccell"><button type="button" class="b12-term${i % 3 === 2 ? ' b12-alt' : ''}" data-term="${k}">${ctx.t('t.' + k)}</button></div>`;
      }).join('')}</div>`).join('')}</div>`;
      ctx.on(ctx.$$('[data-term]'), 'click', (e, n) => {
        const k = n.dataset.term;
        modal(ctx, { title: ctx.t('h.' + k), html: ctx.t('d.' + body(k), { tag: 'p', cls: 'b12-ovl-p' }) });
      });
    }
  });

  /* =====================================================================================
     QP 2 / QPD2T. Qualified plans do two things
     ===================================================================================== */
  EFA.css('b12-qpd', `
  .b12-d2 { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
  .b12-d2-row { position: absolute; left: 236px; width: 1150px; display: flex; align-items: center; gap: 34px; }
  .b12-d2-ic { position: relative; width: 76px; height: 76px; flex: 0 0 76px; }
  .b12-d2-ic > svg { position: absolute; inset: 0; }
  .b12-d2-txt { font: 700 43px/1.28 var(--f-body); color: var(--navy); }
  .b12-d2-txt em { font-style: normal; color: var(--gold-deep); }
  .b12-d2-card { padding: 22px 34px; font: 700 38px/1.25 var(--f-body); color: var(--navy); }
  .b12-verb { color: var(--gold-deep); cursor: pointer; border-bottom: 4px solid var(--gold); padding: 0 2px; transition: color .2s ease, background .2s ease; border-radius: 3px 3px 0 0; }
  .b12-verb:hover { background: rgba(240,230,196,.8); }
  .b12-links { position: absolute; left: 0; right: 0; display: flex; justify-content: center; gap: 120px; }
  .b12-lk { display: flex; align-items: center; gap: 18px; cursor: pointer; background: none; border: 0; padding: 8px 14px; border-radius: 14px; transition: background .2s ease, transform .2s ease; }
  .b12-lk:hover { background: rgba(240,230,196,.6); transform: translateY(-2px); }
  .b12-lk span { font: 700 36px/1.1 var(--f-body); color: var(--gold-deep); border-bottom: 2.5px dotted rgba(184,151,46,.8); }
  `);
  EFA.screen('qpdo2t1', {
    title: 'Qualified plans do two things',
    steps: 4,
    copy: {
      head: 'Qualified Plans Do Two Things',
      'r1.a': 'They', 'verb.defer': 'defer', 'verb.post': 'postpone', 'r1.b': 'the tax...',
      'r1.c': '...and the', 'r1.em': 'calculation', 'r1.d': 'of the tax.',
      r2: 'What will your tax bracket be once you retire?',
      r3: 'Which deductions will remain when you withdraw?',
      'l.thresh': 'Tax Thresholds', 'l.hist': 'Tax History',
      _notes: 'A qualified plan puts off the tax, and it puts off the math. Nobody can tell you today what rate you will pay on this money.\n\n- Click the word defer to swap in the plainer word, postpone.\n- Ask: If the tax is worked out later, who gets to decide the rate?\nPAUSE\n\n- Tax Thresholds and Tax History open their own screens and come back here.'
    },
    render(ctx) {
      const back = takeJump(ctx);
      const swapped = !!(back && back.swapped);
      ctx._d2 = { swapped };
      const ic = (n, kinds) => `<div class="b12-d2-ic" data-ic="${n}">${kinds.map((k) => `<span data-kind="${k}" style="position:absolute;inset:0">${ICON[k](76)}</span>`).join('')}</div>`;
      ctx.el.innerHTML = `
        <div class="b12-head" style="top:58px">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule"></div>
        <div class="b12-d2">
          <div class="b12-d2-row" style="top:214px;align-items:flex-start">${ic(1, ['star', 'check'])}
            <div class="b12-d2-txt"><div>${ctx.t('r1.a')} <span class="b12-verbslot"></span> ${ctx.t('r1.b')}</div>
              <div class="b12-f b12-l2">${ctx.t('r1.c')} <em>${ctx.t('r1.em')}</em> ${ctx.t('r1.d')}</div></div></div>
          <div class="b12-d2-row" style="top:414px">${ic(2, ['question', 'check'])}<div class="b12-d2-card b12-card b12-f b12-c2">${ctx.t('r2')}</div></div>
          <div class="b12-d2-row" style="top:546px">${ic(3, ['question', 'check'])}<div class="b12-d2-card b12-card b12-f b12-c3">${ctx.t('r3')}</div></div>
          <div class="b12-links b12-f b12-lkrow" style="top:690px">
            <button type="button" class="b12-lk" data-go="TAX|taxthresholds1">${ICON.calc(70)}${ctx.t('l.thresh')}</button>
            <button type="button" class="b12-lk" data-go="TAXHIST|taxhist1">${ICON.calc(70)}${ctx.t('l.hist')}</button>
          </div>
        </div>`;
      const slot = ctx.$('.b12-verbslot');
      const paint = () => {
        slot.innerHTML = ctx._d2.swapped ? ctx.t('verb.post') : `<span class="b12-verb" data-verb="1">${ctx.t('verb.defer')}</span>`;
        ctx.on(ctx.$$('[data-verb]'), 'click', () => { ctx._d2.swapped = true; paint(); EFA.numify(ctx.el); });
      };
      paint();
      ctx.on(ctx.$$('[data-go]'), 'click', (e, n) => {
        const [k, s] = n.dataset.go.split('|');
        jumpTo(ctx, k, s, { swapped: ctx._d2.swapped });
      });
    },
    step(ctx, n) {
      const icon = (i, kind) => ctx.$$(`[data-ic="${i}"] [data-kind]`).forEach((s) => { s.style.display = s.dataset.kind === kind ? '' : 'none'; });
      icon(1, n >= 1 ? 'check' : 'star');
      icon(2, n >= 2 ? 'check' : 'question');
      icon(3, n >= 3 ? 'check' : 'question');
      ctx.show('.b12-l2', n >= 1);
      ctx.show('.b12-c2', n >= 2);
      ctx.show('.b12-lkrow', n >= 2);
      ctx.show('.b12-c3', n >= 3);
    }
  });

  /* =====================================================================================
     QP 8. Three questions to ask before relying on a qualified plan
     ===================================================================================== */
  function scaleArt() {
    const cx = 170, cy = 86, half = 112, th = 7 * Math.PI / 180;
    const L = [cx - half * Math.cos(th), cy - half * Math.sin(th)], R = [cx + half * Math.cos(th), cy + half * Math.sin(th)];
    const pan = (x, y) => `<path d="M${x - 50},${y} Q${x},${y + 34} ${x + 50},${y} Z" fill="${P.navy3}"/><path d="M${x - 50},${y}H${x + 50}" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/>`;
    const strings = (x, y, py) => `<path d="M${x},${y} L${x - 46},${py} M${x},${y} L${x + 46},${py}" stroke="${P.navy4}" stroke-width="2.5"/>`;
    const lp = L[1] + 96, rp = R[1] + 96;
    const bills = [0, 1, 2, 3].map((i) => `<rect x="${R[0] - 40 + (i % 2) * 4}" y="${rp - 18 - i * 13}" width="80" height="16" rx="4" fill="${i === 3 ? P.goldLt : P.goldPale}" stroke="${P.goldDeep}" stroke-width="2"/>`).join('');
    return `<svg viewBox="0 0 340 300" aria-hidden="true" class="ill">
      <ellipse cx="170" cy="286" rx="118" ry="9" fill="${P.shadow}"/>
      <path d="M118 282h104l-14-24h-76z" fill="${P.navy}"/>
      <rect x="163" y="74" width="14" height="190" rx="4" fill="${P.navy}"/>
      <path d="M150 112h40" stroke="${P.gold}" stroke-width="5" stroke-linecap="round"/>
      ${strings(L[0], L[1], lp)}${strings(R[0], R[1], rp)}
      <path d="M${L[0].toFixed(1)},${L[1].toFixed(1)}L${R[0].toFixed(1)},${R[1].toFixed(1)}" stroke="${P.gold}" stroke-width="11" stroke-linecap="round"/>
      <circle cx="170" cy="${cy}" r="13" fill="${P.navy}" stroke="${P.gold}" stroke-width="4"/>
      ${pan(L[0], lp)}${pan(R[0], rp)}
      <g transform="translate(${L[0] - 34} ${lp - 64})">
        <rect x="10" y="26" width="48" height="36" fill="${P.paper}" stroke="${P.navy}" stroke-width="3.5"/>
        <path d="M0 30 34 4l34 26" fill="${P.navy}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
        <rect x="27" y="40" width="14" height="22" rx="2" fill="${P.gold}"/>
      </g>
      ${bills}
      <circle cx="${R[0]}" cy="${rp - 49}" r="9" fill="${P.navy}"/><path d="M${R[0] + 3.4},${rp - 53.5}c-1-1.6-5.8-2-6.6.4s6.6 2.4 6 5.4-5.8 2.8-7.2.6M${R[0]},${rp - 58}v18" fill="none" stroke="${P.goldLt}" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;
  }
  function signsArt() {
    const sign = (x, y, w, dir, fill, mark) => {
      const h = 46, tip = 26;
      const d = dir > 0 ? `M${x},${y}h${w}l${tip},${h / 2}l${-tip},${h / 2}h${-w}z` : `M${x},${y}h${w}v${h}h${-w}l${-tip},${-h / 2}z`;
      const mx = dir > 0 ? x + w * 0.5 : x + w * 0.5 - 6;
      return `<path d="${d}" fill="${fill}" stroke="${P.navy}" stroke-width="3" stroke-linejoin="round"/>
        <path d="${qPath(0.5, mx * 2 - 52, y * 2 - 10)}" fill="none" stroke="${mark}" stroke-width="5.5" stroke-linecap="round"/><circle cx="${mx - 0.5}" cy="${y + 34}" r="3.2" fill="${mark}"/>`;
    };
    return `<svg viewBox="0 0 300 300" aria-hidden="true" class="ill">
      <ellipse cx="150" cy="288" rx="96" ry="9" fill="${P.shadow}"/>
      <path d="M128 286h44l-6-18h-32z" fill="${P.navy3}"/>
      <rect x="142" y="34" width="16" height="240" rx="4" fill="${P.navy}"/>
      <circle cx="150" cy="32" r="11" fill="${P.gold}" stroke="${P.navy}" stroke-width="3"/>
      ${sign(150, 52, 98, 1, P.gold, P.navy)}
      ${sign(46, 116, 104, -1, P.navy3, P.goldLt)}
      ${sign(150, 180, 84, 1, P.mist, P.navy3)}
    </svg>`;
  }
  EFA.css('b12-qp8', `
  .b12-q8 { position: absolute; left: 120px; display: flex; align-items: center; gap: 26px; }
  .b12-q8 .b12-ico { width: 92px; height: 72px; }
  .b12-q8-card { padding: 22px 36px; font: 700 37px/1.2 var(--f-body); color: var(--navy); white-space: nowrap; }
  .b12-pic { position: absolute; border-radius: 50%; background: var(--paper); border: 1px solid var(--rule); box-shadow: 0 18px 40px rgba(13,30,58,.10); display: grid; place-items: center; overflow: hidden; }
  .b12-pic svg { width: 74%; height: 74%; }
  .b12-pic.b12-rect { border-radius: 26px; }
  `);
  EFA.screen('qp8', {
    title: 'Three questions to ask before relying on a qualified plan',
    steps: 4,
    copy: {
      head: 'Three Questions Every Plan Owner Should Answer',
      q1: 'What will your tax bracket be?',
      q2: 'Which deductions will you still have?',
      q3: 'What is your exit strategy?',
      _notes: 'Most people can tell you their balance. Very few can answer these three questions.\n\n- Each click brings up the next question.\n- Ask: Which of these three could you answer with confidence today?\nPAUSE'
    },
    render(ctx) {
      const row = (i, top) => `<div class="b12-q8" style="top:${top}px">${ICON.star(92)}<div class="b12-q8-card b12-card b12-f b12-q${i}">${ctx.t('q' + i)}</div></div>`;
      ctx.el.innerHTML = `
        <div class="b12-head" style="top:52px">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule"></div>
        ${row(1, 232)}${row(2, 428)}${row(3, 624)}
        <div class="b12-pic b12-f b12-p1" style="left:1060px;top:148px;width:250px;height:250px">${A.ill.taxes()}</div>
        <div class="b12-pic b12-f b12-p2" style="left:1196px;top:396px;width:316px;height:316px">${scaleArt()}</div>
        <div class="b12-pic b12-f b12-p3" style="left:900px;top:588px;width:250px;height:250px">${signsArt()}</div>`;
    },
    step(ctx, n) {
      [1, 2, 3].forEach((i) => { ctx.show('.b12-q' + i, n >= i); ctx.show('.b12-p' + i, n >= i); });
    }
  });

  /* =====================================================================================
     Calculator building blocks (QP calculators, QPCM, IPR)
     ===================================================================================== */
  EFA.css('b12-calc', `
  .stage .st-h1.b12-hc { font-size: 54px; line-height: 1.08; }
  .b12-form { position: absolute; overflow: hidden; padding: 4px 0; }
  .b12-row { display: flex; align-items: center; justify-content: space-between; gap: 22px; height: 54px; padding: 0 24px 0 30px; border-top: 1px solid var(--line); transition: background .45s ease; }
  .b12-row:first-child { border-top: 0; }
  .b12-row.b12-tight { height: 46px; }
  .b12-form.b12-seven .b12-row.b12-tight { height: 44px; }
  .b12-row.b12-tight .b12-in { height: 38px; font-size: 20px; }
  .b12-lb { font: 600 23px/1.2 var(--f-body); color: var(--navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; display: flex; align-items: center; }
  .b12-row.b12-tight .b12-lb { font-size: 21px; }
  .b12-row.b12-hl { background: var(--gold-pale); }
  .b12-out { min-width: 210px; box-sizing: border-box; text-align: right; font: 700 25px/1 var(--f-body); color: var(--navy); padding: 9px 14px; border-radius: 10px; background: #f1f4f8; }
  .b12-row.b12-hl .b12-out { background: rgba(255,255,255,.72); }
  .b12-act, .b12-doc { position: absolute; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 28px; }
  .b12-note { position: absolute; padding: 20px 22px 22px 24px; font: 600 20px/1.5 var(--f-body); color: var(--navy); border-left: 5px solid var(--gold); border-radius: 4px 14px 14px 4px; }
  .b12-tbl { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .b12-tbl th { font: 700 15px/1.3 var(--f-body); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); text-align: right; padding: 16px 26px 10px; border-bottom: 1.5px solid var(--mist-2); vertical-align: bottom; }
  .b12-tbl th:first-child { text-align: left; }
  .b12-tbl td { font: 700 25px/1 var(--f-body); color: var(--navy); text-align: right; padding: 0 26px; height: 50px; border-top: 1px solid var(--line); white-space: nowrap; }
  .b12-tbl.b12-cmp th { padding-top: 13px; padding-bottom: 8px; }
  .b12-tbl.b12-cmp td { height: 48px; }
  .b12-cnote { padding: 10px 18px 12px; font: 500 14.5px/1.4 var(--f-body); color: var(--muted); text-align: center; border-top: 1px solid var(--line); background: rgba(227,232,240,.25); }
  .b12-tbl tr:first-child td { border-top: 0; }
  .b12-tbl td.b12-tdl { text-align: left; font-weight: 600; font-size: 23px; }
  .b12-tbl tr.b12-hl { background: var(--gold-pale); }
  .b12-tbl .b12-neg { color: ${RED}; }
  .b12-th-link { cursor: pointer; color: var(--gold-deep); border-bottom: 2px dotted rgba(184,151,46,.8); }
  .b12-th-link:hover { color: var(--navy); }
  .b12-foot { position: absolute; left: 0; right: 0; text-align: center; font: 500 16px/1.4 var(--f-body); color: var(--muted); }
  .b12-verdict { padding: 14px 26px 18px; text-align: center; font: 600 22px/1.35 var(--f-body); color: var(--navy); border-top: 1.5px solid var(--mist-2); }
  .b12-verdict .num { font-weight: 700; color: var(--gold-deep); }
  .b12-grid { position: absolute; overflow: hidden; }
  .b12-grid table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .b12-grid th { background: var(--navy); color: var(--cream); font: 700 15px/1 var(--f-body); letter-spacing: .14em; text-transform: uppercase; height: 54px; text-align: center; }
  .b12-grid th:first-child, .b12-grid td:first-child { text-align: left; padding-left: 30px; }
  .b12-grid td { height: 64px; text-align: center; border-top: 1px solid var(--line); font: 600 22px/1 var(--f-body); color: var(--navy); }
  .b12-grid td .b12-in { width: 150px; text-align: center; }
  .b12-grid tr.b12-ror td { font: 700 27px/1 var(--f-body); background: var(--gold-pale); }
  .b12-grid tr.b12-ror td:first-child { font-size: 22px; font-weight: 600; }
  .b12-res1 { position: absolute; display: flex; align-items: baseline; justify-content: center; gap: 22px; padding: 18px 40px; font: 600 26px/1.2 var(--f-body); color: var(--navy); }
  .b12-res1 .num { font: 700 38px/1 var(--f-body); color: var(--gold-deep); }
  .b12-f5 { transition: opacity .5s ease; }
  .stage .b12-f5.is-off { transition-duration: .3s; }
  `);
  const row = (ctx, labelKey, inner, cls, extra) => `<div class="b12-row${cls ? ' ' + cls : ''}"${extra || ''}><span class="b12-lb">${ctx.t(labelKey)}</span>${inner}</div>`;
  const outRow = (ctx, labelKey, id, cls) => `<div class="b12-row${cls ? ' ' + cls : ''}"><span class="b12-lb">${ctx.t(labelKey)}</span><span class="b12-out" data-out="${id}">–</span></div>`;
  const setOut = (ctx, id, html) => { ctx.$$(`[data-out="${id}"]`).forEach((e) => { e.innerHTML = html; }); };
  /** future value of an annuity due (deposit at the start of each year) */
  const fvDue = (r, n, pmt) => (r === 0 ? pmt * n : pmt * (1 + r) * (Math.pow(1 + r, n) - 1) / r);
  /** IRR by Newton-Raphson exactly as the QP specs describe (start at the assumed return; |NPV| <= 0.00001; 50,000 iterations max) */
  function irrNewton(cf, guess) {
    if (!cf || cf.length < 2 || cf[0] > 0) return 0;
    if (cf.every((c) => c === 0)) return 0;
    let x = isFinite(guess) ? guess : 0.05;
    for (let it = 0; it < 50000; it++) {
      let npv = 0, d = 0, f = 1;
      for (let k = 0; k < cf.length; k++) { npv += cf[k] / f; d -= k * cf[k] / (f * (1 + x)); f *= (1 + x); }
      if (!isFinite(npv) || !isFinite(d)) return 0;
      if (Math.abs(npv) <= 0.00001) return x > 1 ? 0 : x;
      if (d === 0) return 0;
      x -= npv / d;
      if (!(x > -1)) return 0;
    }
    return 0;
  }
  EFA.engines.qp = { fvDue, irr: irrNewton };
  const yearCol = (ctx, k) => ({ field: 'year', header: ctx.t(k), type: 'year', width: 80 });

  /* =====================================================================================
     QP 3. Apparent tax savings calculator
     ===================================================================================== */
  EFA.screen('qp3', {
    title: 'Apparent tax savings calculator',
    copy: {
      head: 'Postpone the Tax, and You Postpone the Calculation',
      'l.c': 'Annual Contribution', 'l.tc': 'Current Tax Bracket', 'l.tw': 'Withdrawal Tax Bracket', 'l.n': 'Years Until Withdrawal', 'l.r': 'Investment Return',
      'o.bal': 'Account Balance', 'o.share': 'Your Share', 'o.irs': 'Amount Due IRS', 'o.def': 'Apparent Taxes Deferred', 'o.int': 'Apparent Taxes at Interest',
      note: 'These results include the effect of paying tax at one rate when the money goes in and a different rate when it comes out.',
      calc: 'Calculate',
      'ws.title': 'Apparent Tax Savings', 'ws.year': 'Year', 'ws.c': 'Annual Contribution', 'ws.adj': 'Apparent Tax Adjustment', 'ws.sb': 'Start-of-Year Balance',
      'ws.int': 'Interest Earned', 'ws.eb': 'End-of-Year Balance', 'ws.tax': 'Tax Paid at Withdrawal', 'ws.net': 'Balance after Tax',
      'ws.cum': 'Cumulative Apparent Savings', 'ws.cumi': 'Cumulative Savings at Interest',
      _notes: 'Every year the plan felt like a tax break. The IRS sees it differently: it is a partner in the whole balance, at whatever rate applies when the money comes out.\n\n- Compare Amount Due IRS with Apparent Taxes at Interest. When the brackets match, they are the same number.\n- Ask: If the withdrawal bracket turns out higher than today, who comes out ahead?\nPAUSE'
    },
    render(ctx) {
      CASE.set('tsra_withdrawal_tax_bracket', CASE.n('case_file_ror_taxes'));
      const S = st(ctx); S.shown = false;
      ctx.el.innerHTML = `
        <div class="b12-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1 b12-hc' })}<hr class="st-rule"></div>
        <div class="b12-form b12-card" style="left:440px;top:150px;width:720px">
          ${row(ctx, 'l.c', fld(ctx, { id: 'C', key: 'annual_investment', type: 'money', label: 'l.c' }))}
          ${row(ctx, 'l.tc', fld(ctx, { id: 'tc', key: 'case_file_ror_taxes', type: 'pct', label: 'l.tc' }), 'b12-br')}
          ${row(ctx, 'l.tw', fld(ctx, { id: 'tw', key: 'tsra_withdrawal_tax_bracket', type: 'pct', label: 'l.tw' }), 'b12-br')}
          ${row(ctx, 'l.n', fld(ctx, { id: 'n', key: 'time_period_in_years', type: 'int', min: 0, label: 'l.n' }))}
          ${row(ctx, 'l.r', fld(ctx, { id: 'r', key: 'taxable_return', type: 'pct', max: 0.12, min: 0, disclose: 'r', label: 'l.r' }))}
        </div>
        <div class="b12-act b12-f b12-gobox" style="top:462px"><button type="button" class="st-pill b12-go" data-calc>${ctx.t('calc')}</button></div>
        <div class="b12-form b12-card b12-f b12-res is-off" style="left:400px;top:452px;width:800px">
          ${outRow(ctx, 'o.bal', 'bal')}${outRow(ctx, 'o.share', 'share')}${outRow(ctx, 'o.irs', 'irs', 'b12-hl')}${outRow(ctx, 'o.def', 'def')}${outRow(ctx, 'o.int', 'int', 'b12-hl')}
        </div>
        ${docLink(ctx, () => sheet(), 'b12-f b12-res is-off', 'top:752px')}
        <div class="b12-note b12-tint b12-f is-off" style="left:1194px;top:150px;width:310px">${ctx.t('note')}</div>
        ${discLine(ctx)}`;
      const calc = () => {
        const C = val(ctx, 'C'), tc = val(ctx, 'tc'), tw = val(ctx, 'tw'), n = Math.max(0, Math.round(val(ctx, 'n'))), r = val(ctx, 'r');
        const B = fvDue(r, n, C), irs = B * tw, s = C * tc;
        return { C, tc, tw, n, r, B, irs, share: B - irs, s, deferred: s * n, atInt: fvDue(r, n, s), spread: !same(tc, tw) };
      };
      const paint = () => {
        const R = calc();
        ctx.$$('.b12-row.b12-br').forEach((e) => e.classList.toggle('b12-hl', R.spread));
        ctx.show('.b12-note', R.spread && S.shown);
        setOut(ctx, 'bal', N(money(R.B))); setOut(ctx, 'share', N(money(R.share))); setOut(ctx, 'irs', N(money(R.irs)));
        setOut(ctx, 'def', N(money(R.deferred))); setOut(ctx, 'int', N(money(R.atInt)));
      };
      wire(ctx, paint);
      ctx.on(ctx.$('[data-calc]'), 'click', () => { S.shown = true; paint(); ctx.show('.b12-gobox', false); ctx.show('.b12-res', true); });
      const sheet = () => {
        const R = calc(); const rows = []; let bal = 0, cum = 0, p = 0;
        for (let i = 1; i <= R.n; i++) {
          cum += R.C * R.tc; bal += R.C;
          const intr = bal * R.r, end = bal + intr, tax = i === R.n ? end * R.tw : 0;
          p = (p + R.C * R.tc) * (1 + R.r);
          rows.push({ year: i, c: R.C, adj: R.C * R.tc, sb: bal, int: intr, eb: end, tax, net: end - tax, cum, cumi: p });
          bal = end;
        }
        const k = (f, key) => wcol(ctx, f, key);
        return { heading: ctx.t('ws.title'), size: 'full', rows, columns: [yearCol(ctx, 'ws.year'), k('c', 'ws.c'), k('adj', 'ws.adj'), k('sb', 'ws.sb'), k('int', 'ws.int'), k('eb', 'ws.eb'), k('tax', 'ws.tax'), k('net', 'ws.net'), k('cum', 'ws.cum'), k('cumi', 'ws.cumi')] };
      };
      paint();
    }
  });

  /* =====================================================================================
     QP 4. Return by contribution period vs. withdrawal bracket
     ===================================================================================== */
  function qp4Calc(C, M, r, P, TB, TB4) {
    const T = P[0] + P[1] + P[2] + 1;
    const mk = () => Array.from({ length: T }, () => ({ contribution: 0, taxDeferred: 0, match: 0, startBal: 0, interest: 0, endBal: 0, taxDue: 0, netWithdrawal: 0, cashFlow: 0 }));
    const arr = [mk(), mk(), mk(), mk()];
    let k = 0;
    for (let p = 0; p < 3; p++) for (let i = 0; i < P[p]; i++, k++) [arr[p], arr[3]].forEach((a) => { a[k].contribution = C; a[k].taxDeferred = C * TB[p]; a[k].match = M; });
    arr.forEach((a) => {
      let carry = 0;
      for (let j = 0; j <= T - 2; j++) {
        const x = a[j]; x.startBal = x.contribution + x.match + carry; x.interest = x.startBal * r; x.endBal = x.startBal + x.interest; carry = x.endBal;
        x.cashFlow = x.taxDeferred - x.contribution;
      }
      if (T >= 2) { const w = a[T - 2]; w.taxDue = w.endBal * TB4; w.netWithdrawal = w.endBal - w.taxDue; a[T - 1].cashFlow = w.netWithdrawal; }
    });
    return { T, arr, irr: arr.map((a) => irrNewton(a.map((x) => x.cashFlow), r)) };
  }
  EFA.engines.qp.periods = qp4Calc;
  EFA.screen('qp4', {
    title: 'Return by contribution period vs. withdrawal bracket',
    copy: {
      head: 'Does the Tax Rate When Money Comes Out Change Your Real Return?',
      'l.c': 'Annual Contribution', 'l.m': 'Annual Match', 'l.r': 'Investment Return',
      'g.period': 'Period', 'g.p1': 'First', 'g.p2': 'Second', 'g.p3': 'Third', 'g.wd': 'Withdrawal', 'g.years': 'Years', 'g.tb': 'Tax Bracket', 'g.ror': 'Period ROR',
      'res.lead': 'Combined return for all three periods:',
      calc: 'Calculate', choose: 'Please Choose', 'ch.1': 'First Period', 'ch.2': 'Second Period', 'ch.3': 'Third Period', 'ch.all': 'All Periods',
      bad: 'Please check the numbers entered (bad data).',
      'ws.t1': 'Plan Return Potential: First Period', 'ws.t2': 'Plan Return Potential: Second Period', 'ws.t3': 'Plan Return Potential: Third Period', 'ws.tall': 'Plan Return Potential: All Periods',
      'ws.year': 'Year', 'ws.c': 'Annual Contribution', 'ws.td': 'Taxes Deferred', 'ws.m': 'Company Match', 'ws.sb': 'Start-of-Year Balance', 'ws.int': 'Interest Earned',
      'ws.eb': 'End-of-Year Balance', 'ws.tax': 'Tax Due on Withdrawal', 'ws.net': 'Net Withdrawal', 'ws.cf': 'Cash Flow',
      _notes: 'Your real return depends on two tax rates: the one you saved when the money went in, and the one you pay when it comes out. Nobody knows the second one today.\n\n- Try a lower bracket in the early years and a higher bracket at withdrawal, then calculate again.\n- Ask: Which direction do you think tax rates are heading over your working years?\nPAUSE'
    },
    render(ctx) {
      const S = st(ctx); S.shown = false;
      const g = (id, def, type) => fld(ctx, { id, def, type, min: 0, cls: 'b12-sm b12-ctr' });
      ctx.el.innerHTML = `
        <div class="b12-head" style="top:38px">${ctx.t('head', { tag: 'h1', cls: 'st-h1 b12-hc' })}</div>
        <div class="b12-form b12-card" style="left:440px;top:174px;width:720px">
          ${row(ctx, 'l.c', fld(ctx, { id: 'C', key: 'annual_investment', type: 'money', label: 'l.c' }))}
          ${row(ctx, 'l.m', fld(ctx, { id: 'M', key: 'company_match', type: 'money', label: 'l.m' }))}
          ${row(ctx, 'l.r', fld(ctx, { id: 'r', key: 'taxable_return', type: 'pct', max: 0.12, min: 0, disclose: 'r', label: 'l.r' }))}
        </div>
        <div class="b12-grid b12-card" style="left:120px;top:370px;width:1360px">
          <table><thead><tr><th>${ctx.t('g.period')}</th><th>${ctx.t('g.p1')}</th><th>${ctx.t('g.p2')}</th><th>${ctx.t('g.p3')}</th><th>${ctx.t('g.wd')}</th></tr></thead>
          <tbody>
            <tr><td>${ctx.t('g.years')}</td><td>${g('P1', 10, 'int')}</td><td>${g('P2', 10, 'int')}</td><td>${g('P3', 10, 'int')}</td><td></td></tr>
            <tr><td>${ctx.t('g.tb')}</td><td>${g('TB1', 0.30, 'pct')}</td><td>${g('TB2', 0.30, 'pct')}</td><td>${g('TB3', 0.30, 'pct')}</td><td>${g('TB4', 0.30, 'pct')}</td></tr>
            <tr class="b12-ror b12-f b12-res is-off" style="display:none"><td>${ctx.t('g.ror')}</td><td data-out="i0">–</td><td data-out="i1">–</td><td data-out="i2">–</td><td></td></tr>
          </tbody></table>
        </div>
        <div class="b12-act b12-f b12-gobox" style="top:582px"><button type="button" class="st-pill b12-go" data-calc>${ctx.t('calc')}</button></div>
        <div class="b12-res1 b12-card b12-f b12-res is-off" style="left:450px;width:700px;top:650px">${ctx.t('res.lead')}<span data-out="i3" class="num">–</span></div>
        ${docLink(ctx, () => { pickDoc(); return null; }, 'b12-f b12-res is-off', 'top:762px')}
        ${discLine(ctx)}`;
      const inputs = () => ({ C: val(ctx, 'C'), M: val(ctx, 'M'), r: val(ctx, 'r'), P: ['P1', 'P2', 'P3'].map((i) => Math.max(0, Math.round(val(ctx, i)))), TB: ['TB1', 'TB2', 'TB3'].map((i) => val(ctx, i)), TB4: val(ctx, 'TB4') });
      const run = () => { const v = inputs(); return qp4Calc(v.C, v.M, v.r, v.P, v.TB, v.TB4); };
      const show = (on) => {
        S.shown = on;
        const tr = ctx.$('.b12-ror'); if (on) tr.style.display = ''; else tr.style.display = 'none';
        ctx.show('.b12-res', on); ctx.show('.b12-gobox', !on);
      };
      wire(ctx, () => show(false));
      ctx.on(ctx.$('[data-calc]'), 'click', () => {
        let R;
        try { R = run(); if (R.irr.some((x) => !isFinite(x))) throw new Error('bad'); } catch (e) { ctx.toast(ctx.text('bad')); ['i0', 'i1', 'i2', 'i3'].forEach((id) => setOut(ctx, id, '')); return; }
        R.irr.forEach((x, i) => setOut(ctx, 'i' + i, N(pct2(x))));
        show(true);
      });
      const pickDoc = () => chooser(ctx, 'choose', [{ key: 'ch.1', i: 0, t: 'ws.t1' }, { key: 'ch.2', i: 1, t: 'ws.t2' }, { key: 'ch.3', i: 2, t: 'ws.t3' }, { key: 'ch.all', i: 3, t: 'ws.tall' }], (it) => {
        const R = run();
        const rows = R.arr[it.i].map((x, j) => ({ year: j + 1, c: x.contribution, td: x.taxDeferred, m: x.match, sb: x.startBal, int: x.interest, eb: x.endBal, tax: x.taxDue, net: x.netWithdrawal, cf: x.cashFlow }));
        const k = (f, key) => wcol(ctx, f, key);
        openSheet(ctx, { heading: ctx.t(it.t), size: 'full', rows, columns: [yearCol(ctx, 'ws.year'), k('c', 'ws.c'), k('td', 'ws.td'), k('m', 'ws.m'), k('sb', 'ws.sb'), k('int', 'ws.int'), k('eb', 'ws.eb'), k('tax', 'ws.tax'), k('net', 'ws.net'), k('cf', 'ws.cf')] });
      });
    }
  });

  /* =====================================================================================
     QP 6. Traditional vs. Roth
     ===================================================================================== */
  EFA.screen('qp6', {
    title: 'Traditional vs. Roth comparison',
    copy: {
      head: 'Traditional or Roth: When Would You Rather Pay the Tax?',
      'l.annual': 'Annual Contribution', 'l.lump': 'Lump Sum Investment', 'l.tc': 'Current Tax Bracket', 'l.tw': 'Withdrawal Tax Bracket', 'l.n': 'Years Until Withdrawal', 'l.r': 'Investment Return',
      'h.trad': 'Pre-tax In /\nTaxed Out', 'h.roth': 'After-tax In /\nTax-free Out',
      'o.eq': 'Equivalent Contribution', 'o.gross': 'Gross Withdrawal', 'o.irs': 'Amount Due IRS', 'o.net': 'Actual Net Withdrawal',
      note: 'These results include the effect of paying tax at one rate when the money goes in and a different rate when it comes out.',
      foot: 'The after-tax column assumes qualified withdrawals, which are generally income-tax-free under current tax law, subject to applicable requirements.',
      calc: 'Calculate', choose: 'Please Choose', 'ch.td': 'Tax Deferred', 'ch.at': 'After Tax',
      'ws.td': 'Pre-tax Contributions, Taxable Withdrawal', 'ws.at': 'After-tax Contributions, Tax-free Withdrawal',
      'ws.year': 'Year', 'ws.c': 'Annual Contribution', 'ws.sb': 'Start-of-Year Balance', 'ws.int': 'Interest Earned', 'ws.eb': 'End-of-Year Balance', 'ws.tax': 'Tax Due on Withdrawal', 'ws.net': 'Net Withdrawal',
      _notes: 'Same budget, two doors. Pay the tax on the seed or pay it on the harvest. When the brackets match, the result is the same; the question is which bracket you will really be in.\n\n- Click the small dot beside the first label to switch between yearly contributions and a lump sum.\n- Ask: Would you rather know your tax bill today, or leave it for a future Congress to decide?\nPAUSE'
    },
    render(ctx) {
      CASE.set('tdt_withdrawal_tax_bracket', CASE.n('case_file_ror_taxes'));
      const S = st(ctx); S.shown = false; S.lump = false;
      const dot = `<button type="button" class="b12-dot" data-tog>${ICON.dot(22)}</button>`;
      ctx.el.innerHTML = `
        <div class="b12-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1 b12-hc' })}<hr class="st-rule"></div>
        <div class="b12-form b12-card" style="left:400px;top:140px;width:800px">
          <div class="b12-row b12-tight" data-mode="annual"><span class="b12-lb">${ctx.t('l.annual')}${dot}</span>${fld(ctx, { id: 'm', key: 'annual_investment', type: 'money', label: 'l.annual' })}</div>
          <div class="b12-row b12-tight" data-mode="lump" style="display:none"><span class="b12-lb">${ctx.t('l.lump')}${dot}</span>${fld(ctx, { id: 'L', key: 'account_balance', type: 'money', label: 'l.lump' })}</div>
          ${row(ctx, 'l.tc', fld(ctx, { id: 'tc', key: 'case_file_ror_taxes', type: 'pct', label: 'l.tc' }), 'b12-tight b12-br')}
          ${row(ctx, 'l.tw', fld(ctx, { id: 'tw', key: 'tdt_withdrawal_tax_bracket', type: 'pct', label: 'l.tw' }), 'b12-tight b12-br')}
          ${row(ctx, 'l.n', fld(ctx, { id: 'n', key: 'time_period_in_years', type: 'int', min: 0, label: 'l.n' }), 'b12-tight')}
          ${row(ctx, 'l.r', fld(ctx, { id: 'r', key: 'taxable_return', type: 'pct', max: 0.12, min: 0, disclose: 'r', label: 'l.r' }), 'b12-tight')}
        </div>
        <div class="b12-act b12-f b12-gobox" style="top:410px"><button type="button" class="st-pill b12-go" data-calc>${ctx.t('calc')}</button></div>
        <div class="b12-form b12-card b12-f b12-res is-off" style="left:240px;top:402px;width:1120px;padding:0">
          <table class="b12-tbl"><colgroup><col style="width:40%"><col style="width:30%"><col style="width:30%"></colgroup>
            <thead><tr><th></th><th>${ctx.t('h.trad')}</th><th>${ctx.t('h.roth')}</th></tr></thead>
            <tbody>
              <tr><td class="b12-tdl">${ctx.t('o.eq')}</td><td data-out="eqT"></td><td data-out="eqR"></td></tr>
              <tr><td class="b12-tdl">${ctx.t('o.gross')}</td><td data-out="gT"></td><td data-out="gR"></td></tr>
              <tr><td class="b12-tdl">${ctx.t('o.irs')}</td><td class="b12-neg" data-out="tT"></td><td class="b12-neg" data-out="tR"></td></tr>
              <tr class="b12-hl"><td class="b12-tdl">${ctx.t('o.net')}</td><td data-out="nT"></td><td data-out="nR"></td></tr>
            </tbody></table>
          <div class="b12-cnote">${ctx.t('foot')}</div>
        </div>
        ${docLink(ctx, () => { pickDoc(); return null; }, 'b12-f b12-res is-off', 'top:736px')}
        <div class="b12-note b12-tint b12-f is-off" style="left:1230px;top:140px;width:300px">${ctx.t('note')}</div>
        ${discLine(ctx)}`;
      const calc = () => {
        const lump = S.lump, m = lump ? val(ctx, 'L') : val(ctx, 'm'), tc = val(ctx, 'tc'), tw = val(ctx, 'tw'), n = Math.max(0, Math.round(val(ctx, 'n'))), r = val(ctx, 'r');
        const M = m * (1 - tc);
        const gT = lump ? m * Math.pow(1 + r, n) : fvDue(r, n, m), gR = lump ? M * Math.pow(1 + r, n) : fvDue(r, n, M);
        const tT = gT * tw;
        return { lump, m, M, tc, tw, n, r, gT, gR, tT, nT: gT - tT, nR: gR, spread: !same(tc, tw) };
      };
      const paint = () => {
        const R = calc();
        ctx.$$('.b12-row.b12-br').forEach((e) => e.classList.toggle('b12-hl', R.spread));
        ctx.show('.b12-note', R.spread && S.shown);
        setOut(ctx, 'eqT', N(money(R.m))); setOut(ctx, 'eqR', N(money(R.M)));
        setOut(ctx, 'gT', N(money(R.gT))); setOut(ctx, 'gR', N(money(R.gR)));
        setOut(ctx, 'tT', N(money(R.tT))); setOut(ctx, 'tR', N(money(0)));
        setOut(ctx, 'nT', N(money(R.nT))); setOut(ctx, 'nR', N(money(R.nR)));
      };
      wire(ctx, paint);
      ctx.on(ctx.$$('[data-tog]'), 'click', () => {
        S.lump = !S.lump;
        ctx.$('[data-mode="annual"]').style.display = S.lump ? 'none' : '';
        ctx.$('[data-mode="lump"]').style.display = S.lump ? '' : 'none';
        paint();
      });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { S.shown = true; paint(); ctx.show('.b12-gobox', false); ctx.show('.b12-res', true); });
      const pickDoc = () => chooser(ctx, 'choose', [{ key: 'ch.td', at: false }, { key: 'ch.at', at: true }], (it) => {
        const R = calc(); const rows = [];
        const A0 = R.lump ? 0 : (it.at ? R.M : R.m); let P0 = R.lump ? (it.at ? R.M : R.m) : 0;
        for (let i = 1; i <= R.n; i++) {
          const sb = A0 + P0, intr = sb * R.r, eb = sb * (1 + R.r), tax = i === R.n && !it.at ? eb * R.tw : 0, net = i === R.n ? eb - tax : 0;
          rows.push({ year: i, c: A0, sb, int: intr, eb, tax, net });
          P0 = eb;
        }
        const k = (f, key) => wcol(ctx, f, key);
        openSheet(ctx, { heading: ctx.t(it.at ? 'ws.at' : 'ws.td'), size: 'full', rows, columns: [yearCol(ctx, 'ws.year'), k('c', 'ws.c'), k('sb', 'ws.sb'), k('int', 'ws.int'), k('eb', 'ws.eb'), k('tax', 'ws.tax'), k('net', 'ws.net')] });
      });
      paint();
    }
  });

  /* =====================================================================================
     QP 7. Qualified plan vs. taxable (or tax-free) investment
     ===================================================================================== */
  function qp7Calc(v) {
    const { B0, C, M, tc, tw, n, r, free } = v;
    const qp = []; let p = B0;
    for (let k = 0; k < n; k++) {
      const start = p + C + M, intr = start * r, end = start + intr; p = end;
      const tax = k === n - 1 ? end * tw : 0;
      qp.push({ C, M, start, intr, end, tax, net: k === n - 1 ? end - tax : 0 });
    }
    const out = []; p = C + M > 0 ? B0 * (1 - M / (C + M)) : B0; let cum = 0, cti = 0;
    for (let k = 0; k < n; k++) {
      const toc = k === 0 ? (C + p) * tc : C * tc;
      const start = p + C - toc, intr = start * r, toi = free ? 0 : intr * tc, end = start + intr - toi; p = end;
      const tot = toc + toi; cum += tot; cti = (cti + toc) * (1 + r) + toi;
      out.push({ C, toc, start, intr, toi, end, tot, cum, cti });
    }
    const L = qp[n - 1], O = out[n - 1];
    const qpG = L ? L.end : B0, qpT = L ? L.tax : 0, qpN = L ? L.net : B0;
    const oG = O ? O.end : p, oT = O ? O.cti : 0;
    return { qp, out, qpG, qpT, qpN, oG, oT, oN: oG, d1: qpN - oG, d2: oG - qpN };
  }
  EFA.engines.qp.versusOutside = qp7Calc;
  EFA.screen('qp7', {
    title: 'Qualified plan vs. taxable or tax-free investment',
    copy: {
      'head.tax': 'Your Plan or a Taxable Account: Which Comes Out Ahead?', 'head.free': 'Your Plan or a Tax-Free Account: Which Comes Out Ahead?',
      'l.b0': 'Initial Account Balance', 'l.c': 'Annual Contribution', 'l.m': 'Company Match', 'l.tc': 'Current Tax Bracket', 'l.tw': 'Withdrawal Tax Bracket', 'l.n': 'Years Until Withdrawal', 'l.r': 'Investment Return',
      'h.qp': 'Qualified Plan', 'h.tax': 'Taxable Growth', 'h.free': 'Tax-Free Growth',
      'o.gross': 'Gross Withdrawal', 'o.irs': 'Amount Due IRS', 'o.net': 'Actual Net Withdrawal',
      'v.qp': 'Counting the time value of money, the qualified plan comes out ahead by', 'v.out': 'Counting the time value of money, the outside account comes out ahead by', 'v.same': 'Counting the time value of money, the two come out the same.',
      note: 'These results include the effect of paying tax at one rate when the money goes in and a different rate when it comes out.',
      foot: 'Assumes a fully vested match. Tax-free growth assumes qualified distributions, generally income-tax-free under current tax law, subject to applicable requirements.',
      calc: 'Calculate', choose: 'Please Choose', bad: 'Please check the numbers entered (bad data).',
      'ws.qp': 'Qualified Plan', 'ws.tax': 'Taxable Investment', 'ws.free': 'Tax-Free Investment',
      'ws.year': 'Year', 'ws.pc': 'Personal Contribution', 'ws.m': 'Company Match', 'ws.sb': 'Start-of-Year Balance', 'ws.int': 'Interest Earned', 'ws.eb': 'End-of-Year Balance',
      'ws.tax2': 'Tax Due on Withdrawal', 'ws.net': 'Net Withdrawal', 'ws.c': 'Annual Contribution', 'ws.toc': 'Tax on Contribution', 'ws.toi': 'Tax on Interest',
      'ws.tot': 'Total Tax', 'ws.cum': 'Cumulative Tax', 'ws.cti': 'Cumulative Tax at Interest',
      _notes: 'Money outside the plan pays its tax along the way, and every tax dollar paid early also loses what it would have earned. Counted at interest, those taxes add up.\n\n- Click the second column heading to switch between taxable and tax-free growth.\n- Ask: Which matters more to you, the match today or control over the tax later?\nPAUSE'
    },
    render(ctx) {
      CASE.set('qp_vs_ti_withdrawal_tax_bracket', CASE.n('case_file_ror_taxes'));
      const S = st(ctx); S.shown = false; S.free = false;
      ctx.el.innerHTML = `
        <div class="b12-head" style="top:40px"><div class="b12-hd">${ctx.t('head.tax', { tag: 'h1', cls: 'st-h1 b12-hc' })}</div><hr class="st-rule"></div>
        <div class="b12-form b12-card b12-seven" style="left:400px;top:122px;width:800px">
          ${row(ctx, 'l.b0', fld(ctx, { id: 'B0', key: 'qp_vs_ti_initial_acc_balance', type: 'money', label: 'l.b0' }), 'b12-tight')}
          ${row(ctx, 'l.c', fld(ctx, { id: 'C', key: 'annual_investment', type: 'money', label: 'l.c' }), 'b12-tight')}
          ${row(ctx, 'l.m', fld(ctx, { id: 'M', key: 'company_match', type: 'money', label: 'l.m' }), 'b12-tight')}
          ${row(ctx, 'l.tc', fld(ctx, { id: 'tc', key: 'case_file_ror_taxes', type: 'pct', label: 'l.tc' }), 'b12-tight b12-br')}
          ${row(ctx, 'l.tw', fld(ctx, { id: 'tw', key: 'qp_vs_ti_withdrawal_tax_bracket', type: 'pct', label: 'l.tw' }), 'b12-tight b12-br')}
          ${row(ctx, 'l.n', fld(ctx, { id: 'n', key: 'time_period_in_years', type: 'int', min: 0, label: 'l.n' }), 'b12-tight')}
          ${row(ctx, 'l.r', fld(ctx, { id: 'r', key: 'taxable_return', type: 'pct', max: 0.12, min: 0, disclose: 'r', label: 'l.r' }), 'b12-tight')}
        </div>
        <div class="b12-act b12-f b12-gobox" style="top:468px"><button type="button" class="st-pill b12-go" data-calc>${ctx.t('calc')}</button></div>
        <div class="b12-form b12-card b12-f b12-res is-off" style="left:200px;top:456px;width:1200px;padding:0">
          <table class="b12-tbl b12-cmp"><colgroup><col style="width:40%"><col style="width:30%"><col style="width:30%"></colgroup>
            <thead><tr><th></th><th>${ctx.t('h.qp')}</th><th><span class="b12-th-link" data-free>${ctx.t('h.tax')}</span></th></tr></thead>
            <tbody>
              <tr><td class="b12-tdl">${ctx.t('o.gross')}</td><td data-out="qg"></td><td data-out="og"></td></tr>
              <tr><td class="b12-tdl">${ctx.t('o.irs')}</td><td class="b12-neg" data-out="qt"></td><td class="b12-neg" data-out="ot"></td></tr>
              <tr class="b12-hl"><td class="b12-tdl">${ctx.t('o.net')}</td><td data-out="qn"></td><td data-out="on"></td></tr>
            </tbody></table>
          <div class="b12-verdict" data-out="verdict"></div>
          <div class="b12-cnote">${ctx.t('foot')}</div>
        </div>
        ${docLink(ctx, () => { pickDoc(); return null; }, 'b12-f b12-res is-off', 'top:764px')}
        <div class="b12-note b12-tint b12-f is-off" style="left:1230px;top:122px;width:300px">${ctx.t('note')}</div>
        ${discLine(ctx)}`;
      const inputs = () => ({ B0: val(ctx, 'B0'), C: val(ctx, 'C'), M: val(ctx, 'M'), tc: val(ctx, 'tc'), tw: val(ctx, 'tw'), n: Math.max(0, Math.round(val(ctx, 'n'))), r: val(ctx, 'r'), free: S.free });
      const paint = () => {
        let R;
        try { R = qp7Calc(inputs()); if (![R.qpG, R.qpN, R.oG, R.oT].every(isFinite)) throw new Error('bad'); } catch (e) { if (S.shown) ctx.toast(ctx.text('bad')); return; }
        const spread = !same(val(ctx, 'tc'), val(ctx, 'tw'));
        ctx.$$('.b12-row.b12-br').forEach((e) => e.classList.toggle('b12-hl', spread));
        ctx.show('.b12-note', spread && S.shown);
        setOut(ctx, 'qg', N(money(R.qpG))); setOut(ctx, 'og', N(money(R.oG)));
        setOut(ctx, 'qt', N(money(R.qpT))); setOut(ctx, 'ot', N(money(R.oT)));
        setOut(ctx, 'qn', N(money(R.qpN))); setOut(ctx, 'on', N(money(R.oN)));
        let v = '';
        if (R.d1 > 1) v = `${ctx.t('v.qp')} ${N(money(R.d1))}`;
        else if (R.d2 > 1) v = `${ctx.t('v.out')} ${N(money(R.d2))}`;
        else if (R.d1 === 0 && R.d2 === 0) v = ctx.t('v.same');
        setOut(ctx, 'verdict', v || '&nbsp;');
      };
      const setHead = () => {
        ctx.$('.b12-hd').innerHTML = ctx.t(S.free ? 'head.free' : 'head.tax', { tag: 'h1', cls: 'st-h1 b12-hc' });
        ctx.$('[data-free]').innerHTML = ctx.t(S.free ? 'h.free' : 'h.tax');
        EFA.numify(ctx.el);
      };
      wire(ctx, paint);
      ctx.on(ctx.$('[data-free]'), 'click', () => { S.free = !S.free; setHead(); paint(); });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { S.shown = true; paint(); ctx.show('.b12-gobox', false); ctx.show('.b12-res', true); });
      const pickDoc = () => chooser(ctx, 'choose', [{ key: 'h.qp', q: true }, { key: S.free ? 'h.free' : 'h.tax', q: false }], (it) => {
        const R = qp7Calc(inputs()); const k = (f, key) => wcol(ctx, f, key);
        if (it.q) {
          const rows = R.qp.map((x, i) => ({ year: i + 1, pc: x.C, m: x.M, sb: x.start, int: x.intr, eb: x.end, tax: x.tax, net: x.net }));
          openSheet(ctx, { heading: ctx.t('ws.qp'), size: 'full', rows, columns: [yearCol(ctx, 'ws.year'), k('pc', 'ws.pc'), k('m', 'ws.m'), k('sb', 'ws.sb'), k('int', 'ws.int'), k('eb', 'ws.eb'), k('tax', 'ws.tax2'), k('net', 'ws.net')] });
        } else {
          const rows = R.out.map((x, i) => ({ year: i + 1, c: x.C, toc: x.toc, sb: x.start, int: x.intr, toi: x.toi, eb: x.end, tot: x.tot, cum: x.cum, cti: x.cti }));
          openSheet(ctx, { heading: ctx.t(S.free ? 'ws.free' : 'ws.tax'), size: 'full', rows, columns: [yearCol(ctx, 'ws.year'), k('c', 'ws.c'), k('toc', 'ws.toc'), k('sb', 'ws.sb'), k('int', 'ws.int'), k('toi', 'ws.toi'), k('eb', 'ws.eb'), k('tot', 'ws.tot'), k('cum', 'ws.cum'), k('cti', 'ws.cti')] });
        }
      });
      paint();
    }
  });

  /* =====================================================================================
     QPCM. Company match impact calculator
     ===================================================================================== */
  function qpmProject(dep, cf, L, r, tw, parts) {
    const rows = []; let carry = 0;
    for (let k = 0; k < L; k++) {
      const start = carry + dep, intr = start * r, end = start + intr; carry = end;
      const tax = k === L - 1 ? end * tw : 0;
      rows.push(Object.assign({ start, intr, end, tax, net: k === L - 1 ? end - tax : 0, cf }, parts));
    }
    const last = rows[L - 1];
    const bal = last ? last.end : 0, tax = last ? last.tax : 0, net = last ? last.net : 0;
    const flows = rows.map(() => cf).concat([net]);
    return { rows, bal, tax, net, irr: irrNewton(flows, r) };
  }
  function qpmCalc(v) {
    const { Mt, Em, Eu, tc, tw, r, L } = v;
    return {
      all: qpmProject(Mt + Em + Eu, -(Em + Eu - Em * tc - Eu * tc), L, r, tw, { mt: Mt, em: Em, eu: Eu, tdm: Em * tc, tdu: Eu * tc }),
      matched: qpmProject(Mt + Em, -(Em - Em * tc), L, r, tw, { mt: Mt, em: Em, eu: 0, tdm: Em * tc, tdu: 0 }),
      unmatched: qpmProject(Eu, -(Eu - Eu * tc), L, r, tw, { mt: 0, em: 0, eu: Eu, tdm: 0, tdu: Eu * tc })
    };
  }
  /** income calculator lines for a balance B */
  function qpmIncome(B, r, nB, nE, afterTax, tw) {
    const k = afterTax ? 1 - tw : 1;
    const boyInt = B - B / (1 + r), eoyInt = B * r;
    const sdB = nB > 0 ? (r === 0 ? B / nB : B * Math.pow(1 + r, nB) / ((1 + r) * (Math.pow(1 + r, nB) - 1) / r)) : 0;
    const sdE = nE > 0 ? (r === 0 ? B / nE : B * r * Math.pow(1 + r, nE) / (Math.pow(1 + r, nE) - 1)) : 0;
    return [boyInt * k, eoyInt * k, sdB * k, sdE * k];
  }
  EFA.engines.qp.match = qpmCalc; EFA.engines.qp.income = qpmIncome;
  EFA.css('b12-qpm', `
  .b12-ic { padding: 12px 40px 10px; display: grid; gap: 2px; }
  .b12-ic-l { display: flex; justify-content: flex-end; align-items: center; gap: 18px; font: 500 22px/1.3 var(--f-body); color: var(--navy); min-height: 39px; }
  .b12-ic-l .b12-v { min-width: 168px; text-align: right; font: 700 26px/1 var(--f-body); color: var(--gold-deep); }
  .b12-ic-l.b12-lead { justify-content: center; font-weight: 600; font-size: 23px; padding-bottom: 8px; border-bottom: 1.5px solid var(--mist-2); margin-bottom: 4px; }
  .b12-ic-l .b12-in { width: 74px; height: 36px; font-size: 19px; text-align: center; padding: 0 6px; }
  .b12-ctl { position: absolute; display: flex; justify-content: flex-end; align-items: center; gap: 26px; }
  .stage .b12-ctl .st-pill { min-height: 48px; font-size: 18px; padding: 0 26px; }
  .stage .b12-ctl .st-pill.b12-ghost { background: transparent; color: var(--navy); border-color: var(--navy); }
  .stage .b12-ctl .st-pill.b12-ghost:hover { background: var(--gold); border-color: var(--gold); }
  .b12-col { transition: opacity .5s ease; }
  .stage .b12-col.is-off { transition-duration: .3s; }
  `);
  EFA.screen('qpmatch1', {
    title: 'Company match impact calculator',
    copy: {
      head: 'What Does Your Employer\'s Match Really Do for You?',
      'l.mt': 'Company Match', 'l.em': 'Matched Contribution', 'l.eu': 'Unmatched Contribution', 'l.tc': 'Current Tax Bracket', 'l.tw': 'Withdrawal Tax Bracket', 'l.L': 'Years to Project', 'l.r': 'Investment Return',
      'h.bal': 'Balances', 'h.tax': 'Tax Due', 'h.ror': 'Rate of Return', 'o.m': 'Matched Contributions', 'o.u': 'Unmatched Contributions', 'o.all': 'Total Account Balance',
      'ic.a': 'From a total balance of', 'ic.b': ', here is the yearly income it could pay,', 'ic.pre': 'before tax', 'ic.post': 'after tax',
      'ic.1': 'Interest only, paid at the start of each year:', 'ic.2': 'Interest only, paid at the end of each year:',
      'ic.3a': 'Level income for', 'ic.3b': 'years, paid at the start of each year:', 'ic.4a': 'Level income for', 'ic.4b': 'years, paid at the end of each year:',
      calc: 'Calculate', cont: 'Continue', 'ic.open': 'Income Calculator', 'ic.hide': 'Hide Calculator',
      choose: 'Please Choose', 'ch.all': 'All Contributions', 'ch.m': 'Matched Contributions', 'ch.u': 'Unmatched Contributions',
      bad: 'Please check the numbers entered (bad data).',
      foot: 'Assumes the match is fully vested and paid every year. Rates of return are internal rates of return on the assumed tax brackets.',
      'ic.foot': 'Income figures are hypothetical illustrations, not guarantees.',
      'ws.all': 'Company Match Impact: All Contributions', 'ws.m': 'Company Match Impact: Matched Contributions', 'ws.u': 'Company Match Impact: Unmatched Contributions',
      'ws.year': 'Year', 'ws.mt': 'Company Match', 'ws.em': 'Matched Contribution', 'ws.eu': 'Unmatched Contribution', 'ws.tdm': 'Tax Deferred on Matched', 'ws.tdu': 'Tax Deferred on Unmatched',
      'ws.sb': 'Start-of-Year Balance', 'ws.int': 'Interest Earned', 'ws.eb': 'Pre-Tax End Balance', 'ws.tax': 'Tax Due on Withdrawal', 'ws.net': 'After-Tax End Balance', 'ws.cf': 'Cash Flow',
      _notes: 'The matched dollars are the best deal in the plan: the employer adds money you never paid for. Dollars beyond the match earn only what the investments earn, and they still meet the tax at the end.\n\n- Continue reveals the tax due, then the rate of return on each kind of dollar.\n- Ask: Are you capturing every matched dollar today, and what is the best home for the dollars beyond the match?\nPAUSE'
    },
    render(ctx) {
      if (!same(CASE.n('qp_withdrawal_tax_bracket'), CASE.n('case_file_ror_taxes'))) CASE.set('qp_withdrawal_tax_bracket', CASE.n('case_file_ror_taxes'));
      const S = st(ctx); S.stage = 0; S.ic = false; S.post = false;
      const R = (labelKey, o) => row(ctx, labelKey, fld(ctx, Object.assign({ label: labelKey }, o)), 'b12-tight' + (o.br ? ' b12-br' : ''));
      ctx.el.innerHTML = `
        <div class="b12-head" style="top:40px">${ctx.t('head', { tag: 'h1', cls: 'st-h1 b12-hc' })}<hr class="st-rule"></div>
        <div class="b12-form b12-card b12-seven" style="left:376px;top:122px;width:848px">
          ${R('l.mt', { id: 'Mt', key: 'company_match', type: 'money' })}${R('l.em', { id: 'Em', key: 'qp_matched_contribution', type: 'money' })}
          ${R('l.eu', { id: 'Eu', key: 'qp_unmatched_contribution', type: 'money' })}${R('l.tc', { id: 'tc', key: 'case_file_ror_taxes', type: 'pct' })}
          ${R('l.tw', { id: 'tw', key: 'qp_withdrawal_tax_bracket', type: 'pct' })}${R('l.L', { id: 'L', key: 'qp_match_time_period', type: 'int', min: 0 })}
          ${R('l.r', { id: 'r', key: 'taxable_return', type: 'pct', max: 0.12, min: 0, disclose: 'r' })}
        </div>
        <div class="b12-act b12-f b12-gobox" style="top:468px"><button type="button" class="st-pill b12-go" data-calc>${ctx.t('calc')}</button></div>
        <div class="b12-form b12-card b12-f5 b12-res is-off" style="left:160px;top:456px;width:1280px;padding:0">
          <table class="b12-tbl b12-cmp"><colgroup><col style="width:35%"><col style="width:20%"><col style="width:20%"><col style="width:25%"></colgroup>
            <thead><tr><th></th><th>${ctx.t('h.bal')}</th><th class="b12-col b12-c2">${ctx.t('h.tax')}</th><th class="b12-col b12-c3">${ctx.t('h.ror')}</th></tr></thead>
            <tbody>
              <tr><td class="b12-tdl">${ctx.t('o.m')}</td><td data-out="mb"></td><td class="b12-col b12-c2" data-out="mt"></td><td class="b12-col b12-c3" data-out="mr"></td></tr>
              <tr><td class="b12-tdl">${ctx.t('o.u')}</td><td data-out="ub"></td><td class="b12-col b12-c2" data-out="ut"></td><td class="b12-col b12-c3" data-out="ur"></td></tr>
              <tr class="b12-hl"><td class="b12-tdl">${ctx.t('o.all')}</td><td data-out="ab"></td><td class="b12-col b12-c2" data-out="at"></td><td class="b12-col b12-c3" data-out="ar"></td></tr>
            </tbody></table>
          <div class="b12-cnote">${ctx.t('foot')}</div>
        </div>
        <div class="b12-form b12-card b12-f5 b12-icc is-off" style="left:160px;top:456px;width:1280px;padding:0">
          <div class="b12-ic">
            <div class="b12-ic-l b12-lead"><span>${ctx.t('ic.a')} <span data-out="icB" class="num"></span>${ctx.t('ic.b')} <span class="b12-a" data-post>${ctx.t('ic.pre')}</span></span></div>
            <div class="b12-ic-l"><span>${ctx.t('ic.1')}</span><span class="b12-v" data-out="ic0"></span></div>
            <div class="b12-ic-l"><span>${ctx.t('ic.2')}</span><span class="b12-v" data-out="ic1"></span></div>
            <div class="b12-ic-l"><span>${ctx.t('ic.3a')}</span>${fld(ctx, { id: 'nB', def: 25, type: 'int', min: 0, live: true })}<span>${ctx.t('ic.3b')}</span><span class="b12-v" data-out="ic2"></span></div>
            <div class="b12-ic-l"><span>${ctx.t('ic.4a')}</span>${fld(ctx, { id: 'nE', def: 25, type: 'int', min: 0, live: true })}<span>${ctx.t('ic.4b')}</span><span class="b12-v" data-out="ic3"></span></div>
          </div>
          <div class="b12-cnote">${ctx.t('ic.foot')}</div>
        </div>
        <div class="b12-ctl b12-f5 b12-ctlrow is-off" style="left:160px;width:1280px;top:748px">
          <button type="button" class="st-pill b12-ghost b12-f5 b12-icb is-off" data-ic>${ctx.t('ic.open')}</button>
          <span style="width:120px"></span>
          ${docLink(ctx, () => { pickDoc(); return null; }, 'b12-f5 b12-dc is-off', 'position:static')}
          <button type="button" class="st-pill b12-f5 b12-ct" data-cont>${ctx.t('cont')}</button>
        </div>
        ${discLine(ctx)}`;
      const inputs = () => ({ Mt: val(ctx, 'Mt'), Em: val(ctx, 'Em'), Eu: val(ctx, 'Eu'), tc: val(ctx, 'tc'), tw: val(ctx, 'tw'), r: val(ctx, 'r'), L: Math.max(0, Math.round(val(ctx, 'L'))) });
      const stageView = () => {
        const on = S.stage >= 1;
        ctx.show('.b12-gobox', !on);
        ctx.show('.b12-res', on && !S.ic); ctx.show('.b12-icc', on && S.ic); ctx.show('.b12-ctlrow', on);
        ctx.$$('.b12-c2').forEach((e) => ctx.show(e, S.stage >= 2)); ctx.$$('.b12-c3').forEach((e) => ctx.show(e, S.stage >= 3));
        ctx.show('.b12-ct', S.stage >= 1 && S.stage < 3);
        ctx.show('.b12-icb', S.stage >= 3); ctx.show('.b12-dc', S.stage >= 3 && !S.ic);
        ctx.$('[data-ic]').innerHTML = ctx.t(S.ic ? 'ic.hide' : 'ic.open');
      };
      const paint = () => {
        if (S.stage < 1) return;
        let R; const v = inputs();
        try { R = qpmCalc(v); if (![R.all.bal, R.all.irr, R.matched.irr, R.unmatched.irr].every(isFinite)) throw new Error('bad'); } catch (e) { ctx.toast(ctx.text('bad')); return; }
        setOut(ctx, 'mb', N(money(R.matched.bal))); setOut(ctx, 'ub', N(money(R.unmatched.bal))); setOut(ctx, 'ab', N(money(R.all.bal)));
        setOut(ctx, 'mt', N(money(R.matched.tax))); setOut(ctx, 'ut', N(money(R.unmatched.tax))); setOut(ctx, 'at', N(money(R.all.tax)));
        setOut(ctx, 'mr', N(pct2(R.matched.irr))); setOut(ctx, 'ur', N(pct2(R.unmatched.irr))); setOut(ctx, 'ar', N(pct2(R.all.irr)));
        const inc = qpmIncome(R.all.bal, v.r, Math.round(val(ctx, 'nB')), Math.round(val(ctx, 'nE')), S.post, v.tw);
        setOut(ctx, 'icB', money(R.all.bal)); inc.forEach((x, i) => setOut(ctx, 'ic' + i, N(money(x))));
      };
      wire(ctx, paint);
      ctx.on(ctx.$('[data-calc]'), 'click', () => { S.stage = 1; paint(); stageView(); });
      ctx.on(ctx.$('[data-cont]'), 'click', () => { if (S.stage < 3) S.stage++; stageView(); });
      ctx.on(ctx.$('[data-ic]'), 'click', () => { S.ic = !S.ic; stageView(); EFA.numify(ctx.el); });
      ctx.on(ctx.$('[data-post]'), 'click', () => { S.post = !S.post; ctx.$('[data-post]').innerHTML = ctx.t(S.post ? 'ic.post' : 'ic.pre'); paint(); });
      const pickDoc = () => chooser(ctx, 'choose', [{ key: 'ch.all', w: 'all', t: 'ws.all' }, { key: 'ch.m', w: 'matched', t: 'ws.m' }, { key: 'ch.u', w: 'unmatched', t: 'ws.u' }], (it) => {
        const R = qpmCalc(inputs())[it.w]; const k = (f, key) => wcol(ctx, f, key);
        const rows = R.rows.map((x, i) => ({ year: i + 1, mt: x.mt, em: x.em, eu: x.eu, tdm: x.tdm, tdu: x.tdu, sb: x.start, int: x.intr, eb: x.end, tax: x.tax, net: x.net, cf: x.cf }));
        openSheet(ctx, { heading: ctx.t(it.t), size: 'full', rows, columns: [yearCol(ctx, 'ws.year'), k('mt', 'ws.mt'), k('em', 'ws.em'), k('eu', 'ws.eu'), k('tdm', 'ws.tdm'), k('tdu', 'ws.tdu'), k('sb', 'ws.sb'), k('int', 'ws.int'), k('eb', 'ws.eb'), k('tax', 'ws.tax'), k('net', 'ws.net'), k('cf', 'ws.cf')] });
      });
      stageView();
    }
  });

  /* =====================================================================================
     IPR. Remaining income potential
     ===================================================================================== */
  /** sum of remaining earnings by age; PV discounts the whole total as one lump at the end of the span (per spec) */
  function ipCalc(list, factor) {
    const inc = (list || []).filter((r) => !r.exclude);
    if (!inc.length) return { total: 0, pv: 0, rows: [], startMin: 0, endMax: 0 };
    let startMin = 100, endMax = 1;
    inc.forEach((r) => { startMin = Math.min(startMin, r.start_age); endMax = Math.max(endMax, r.end_age); });
    const rows = []; let cum = 0;
    for (let a = startMin; a <= endMax; a++) {
      let y = 0;
      inc.forEach((r) => { if (r.start_age <= a && a <= r.end_age) y += r.amount * Math.pow(1 + r.cola, a - r.start_age); });
      cum += y; rows.push({ age: a, income: y, cum });
    }
    return { total: cum, pv: cum / Math.pow(1 + factor, endMax - startMin + 1), rows, startMin, endMax };
  }
  EFA.engines.incomePotential = ipCalc;
  EFA.css('b12-ip', `
  .b12-ipt { position: absolute; overflow: hidden; padding: 0; }
  .b12-ipt-scroll { height: 300px; overflow-y: auto; background: repeating-linear-gradient(to bottom, transparent 0 53px, rgba(13,30,58,.07) 53px 54px), linear-gradient(#fff, #fff); background-position: 0 54px; }
  .b12-ipt table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .b12-ipt th { position: sticky; top: 0; z-index: 1; background: var(--navy); color: var(--cream); font: 700 14px/1.2 var(--f-body); letter-spacing: .12em; text-transform: uppercase; padding: 10px 16px; height: 54px; box-sizing: border-box; text-align: right; }
  .b12-ipt th:first-child, .b12-ipt td:first-child { text-align: left; padding-left: 26px; }
  .b12-ipt th.b12-c, .b12-ipt td.b12-c { text-align: center; }
  .b12-ipt td { height: 54px; padding: 0 16px; text-align: right; font: 600 22px/1 var(--f-body); color: var(--navy); border-top: 1px solid var(--line); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .b12-ipt tbody tr:nth-child(even) td { background: rgba(227,232,240,.45); }
  .b12-ipt tr.b12-x td { color: var(--muted); }
  .b12-ipt tr.b12-x td:first-child { text-decoration: line-through; text-decoration-color: rgba(102,115,137,.6); }
  .b12-ipt-foot { display: flex; justify-content: center; padding: 12px; border-top: 1px solid var(--rule); background: #fbf9f4; }
  .stage .b12-ipt-foot .st-pill { min-height: 44px; font-size: 17px; }
  .b12-sw { width: 54px; height: 30px; border-radius: 999px; border: 0; padding: 0; background: var(--mist-2); position: relative; vertical-align: middle; transition: background .25s ease; }
  .b12-sw::after { content: ""; position: absolute; left: 4px; top: 4px; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 2px 5px rgba(13,30,58,.25); transition: transform .25s ease; }
  .b12-sw[aria-checked="true"] { background: var(--gold); }
  .b12-sw[aria-checked="true"]::after { transform: translateX(24px); }
  .b12-ibtn { width: 38px; height: 38px; border-radius: 10px; border: 0; background: transparent; color: var(--navy-4); display: inline-grid; place-items: center; vertical-align: middle; }
  .b12-ibtn:hover { background: var(--gold-pale); color: var(--navy); }
  .b12-dfr { position: absolute; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 18px; font: 600 24px/1 var(--f-body); color: var(--navy); }
  .b12-ipres { position: absolute; left: 290px; width: 1020px; padding: 16px 30px 18px; display: grid; gap: 10px; justify-items: center; text-align: center; }
  .b12-ipres .b12-big { width: 92%; box-sizing: border-box; border: 3px solid var(--gold); border-radius: 14px; padding: 14px 20px; font: 700 31px/1.25 var(--f-body); color: var(--navy); background: #fffaf0; }
  .b12-ipres .b12-big .num { color: var(--gold-deep); font-size: 36px; }
  .b12-ipres .b12-l2r { font: 700 27px/1.3 var(--f-body); color: var(--navy); }
  .b12-dlg { display: grid; gap: 14px; }
  .b12-dlg-r { display: grid; grid-template-columns: 200px 1fr; align-items: center; gap: 18px; font: 600 21px/1.2 var(--f-body); color: var(--navy); }
  .b12-dlg-r .b12-in { width: 100%; }
  .b12-in.b12-txt { text-align: left; font-weight: 500; }
  `);
  const IP_DEF_SEED = () => [{ description: '', amount: CASE.n('case_file_annual_income'), cola: CASE.n('case_file_ror_inflation'), start_age: CASE.n('case_file_current_age'), end_age: CASE.n('case_file_retirement_age'), exclude: false }];
  EFA.screen('ip1', {
    title: 'Remaining income potential',
    copy: {
      head: 'Remaining Income Potential',
      'h.desc': 'Description', 'h.amt': 'Amount', 'h.cola': 'COLA', 'h.start': 'Start\nAge', 'h.end': 'End\nAge', 'h.ex': 'Exclude',
      add: 'Add Income Stream', dfac: 'Discount Factor', calc: 'Calculate',
      r1: 'Your remaining income potential:', 'r2a': 'Today\'s value at a', 'r2b': 'discount factor:',
      seed: 'Earned Income',
      'd.title': 'Add Income Stream', 'd.desc': 'Description', 'd.amt': 'Amount', 'd.cola': 'COLA', 'd.start': 'Start Age', 'd.end': 'End Age', 'd.ex': 'Excluded',
      cancel: 'Cancel', save: 'Save', 'del.t': 'Remove Income Stream', 'del.q': 'Remove this income stream from the list?', yes: 'Yes', no: 'No',
      disc: 'Estimates based on assumed raises and an assumed discount rate. Not a guarantee of future income.',
      'ws.title': 'Remaining Income Potential Worksheet', 'ws.age': 'Age', 'ws.inc': 'Annual Income', 'ws.cum': 'Cumulative Income',
      _notes: 'Before we talk about any account, look at the asset that funds all of them: your ability to earn. Added up with modest raises, it is usually the largest number on the page.\n\n- Add or edit income streams for a spouse, a business or a pension.\n- Ask: If you had a machine that would produce this much money, how would you protect it?\nPAUSE'
    },
    render(ctx) {
      const S = st(ctx);
      let list = CASE.get('income_potential_list', null);
      if (!Array.isArray(list) || !list.length) {
        list = IP_DEF_SEED(); list[0].description = ctx.text('seed');
        CASE.set('income_potential_list', list);
      }
      S.list = list.map((r) => Object.assign({}, r)); S.shown = false;
      ctx.el.innerHTML = `
        <div class="b12-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1 b12-hc' })}<hr class="st-rule"></div>
        <div class="b12-ipt b12-card" style="left:160px;top:136px;width:1280px">
          <div class="b12-ipt-scroll"><table>
            <colgroup><col style="width:34%"><col style="width:17%"><col style="width:10%"><col style="width:10%"><col style="width:10%"><col style="width:10%"><col style="width:9%"></colgroup>
            <thead><tr><th>${ctx.t('h.desc')}</th><th>${ctx.t('h.amt')}</th><th>${ctx.t('h.cola')}</th><th>${ctx.t('h.start')}</th><th>${ctx.t('h.end')}</th><th class="b12-c">${ctx.t('h.ex')}</th><th></th></tr></thead>
            <tbody data-body></tbody></table></div>
          <div class="b12-ipt-foot"><button type="button" class="st-pill" data-add>${ctx.t('add')}</button></div>
        </div>
        <div class="b12-dfr" style="top:522px"><span>${ctx.t('dfac')}</span>${fld(ctx, { id: 'df', key: 'income_discount_factor', type: 'pct', min: 0, w: 110, cls: 'b12-sm b12-ctr', label: 'dfac' })}</div>
        <div class="b12-act b12-f b12-gobox" style="top:592px"><button type="button" class="st-pill b12-go" data-calc>${ctx.t('calc')}</button></div>
        <div class="b12-ipres b12-card b12-f b12-res is-off" style="top:584px">
          <div class="b12-big">${ctx.t('r1')} <span class="num" data-out="tot"></span></div>
          <div class="b12-l2r">${ctx.t('r2a')} <span class="num" data-out="fac"></span> ${ctx.t('r2b')} <span class="num" data-out="pv"></span></div>
        </div>
        ${docLink(ctx, () => sheet(), 'b12-f b12-res is-off', 'top:748px')}
        <p class="st-disclaimer b12-disc">${ctx.t('disc')}</p>`;
      const save = () => { CASE.set('income_potential_list', S.list.map((r) => Object.assign({}, r))); };
      const paintRes = () => {
        if (!S.list.length) { S.shown = false; }
        ctx.show('.b12-res', S.shown); ctx.show('.b12-gobox', !S.shown);
        if (!S.shown) return;
        const df = val(ctx, 'df'), R = ipCalc(S.list, df);
        setOut(ctx, 'tot', money(R.total)); setOut(ctx, 'pv', money(R.pv)); setOut(ctx, 'fac', pctT(df));
      };
      const paintTable = () => {
        const body = ctx.$('[data-body]');
        body.innerHTML = S.list.map((r, i) => `<tr class="${r.exclude ? 'b12-x' : ''}">
            <td>${esc(r.description || '')}</td><td>${N(money(r.amount))}</td><td>${N(pctT(r.cola))}</td><td>${N(F.int(r.start_age))}</td><td>${N(F.int(r.end_age))}</td>
            <td class="b12-c"><button type="button" class="b12-sw" role="switch" aria-checked="${!!r.exclude}" data-ex="${i}"></button></td>
            <td class="b12-c"><button type="button" class="b12-ibtn" data-edit="${i}">${ICON.pencil(20)}</button><button type="button" class="b12-ibtn" data-del="${i}">${ICON.trash(20)}</button></td></tr>`).join('');
        ctx.on(ctx.$$('[data-ex]'), 'click', (e, n) => { const r = S.list[+n.dataset.ex]; r.exclude = !r.exclude; save(); paintTable(); paintRes(); });
        ctx.on(ctx.$$('[data-edit]'), 'click', (e, n) => openDlg(+n.dataset.edit));
        ctx.on(ctx.$$('[data-del]'), 'click', (e, n) => confirmDel(+n.dataset.del));
      };
      const openDlg = (idx) => {
        const r = idx == null ? { description: '', amount: 0, cola: ctx.mem('last.cola', CASE.n('case_file_ror_inflation')), start_age: ctx.mem('last.start', CASE.n('case_file_current_age')), end_age: ctx.mem('last.end', CASE.n('case_file_retirement_age')), exclude: false } : S.list[idx];
        let ex = !!r.exclude;
        const ov = modal(ctx, {
          title: ctx.t('d.title'),
          html: `<div class="b12-dlg">
              <div class="b12-dlg-r"><span>${ctx.t('d.desc')}</span><input class="b12-in b12-txt" data-dtext type="text" autocomplete="off" value="${esc(r.description || '')}"></div>
              <div class="b12-dlg-r"><span>${ctx.t('d.amt')}</span>${fld(ctx, { id: 'd.amt', type: 'money', value: r.amount, min: 0 })}</div>
              <div class="b12-dlg-r"><span>${ctx.t('d.cola')}</span>${fld(ctx, { id: 'd.cola', type: 'pct', value: r.cola, min: 0 })}</div>
              <div class="b12-dlg-r"><span>${ctx.t('d.start')}</span>${fld(ctx, { id: 'd.start', type: 'int', value: r.start_age, min: 0 })}</div>
              <div class="b12-dlg-r"><span>${ctx.t('d.end')}</span>${fld(ctx, { id: 'd.end', type: 'int', value: r.end_age, min: 0 })}</div>
              <div class="b12-dlg-r"><span>${ctx.t('d.ex')}</span><span><button type="button" class="b12-sw" role="switch" aria-checked="${ex}" data-dex></button></span></div>
            </div>
            <div class="b12-ovl-act"><button type="button" class="st-pill b12-ghost" data-cancel>${ctx.t('cancel')}</button><button type="button" class="st-pill" data-save>${ctx.t('save')}</button></div>`
        });
        wire(ctx);
        const txt = ov.querySelector('[data-dtext]');
        txt.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') txt.blur(); });
        ov.querySelector('[data-dex]').addEventListener('click', (e) => { if (EFA.edit && EFA.edit.on) return; ex = !ex; e.currentTarget.setAttribute('aria-checked', ex); });
        ov.querySelector('[data-cancel]').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) ov.close(); });
        ov.querySelector('[data-save]').addEventListener('click', () => {
          if (EFA.edit && EFA.edit.on) return;
          ov.querySelectorAll('input[data-f]').forEach((inp) => commitField(ctx, inp.dataset.f, inp, false));
          const nr = { description: txt.value.trim(), amount: val(ctx, 'd.amt'), cola: val(ctx, 'd.cola'), start_age: Math.round(val(ctx, 'd.start')), end_age: Math.round(val(ctx, 'd.end')), exclude: ex };
          if (idx == null) S.list.push(nr); else S.list[idx] = nr;
          ctx.remember('last.cola', nr.cola); ctx.remember('last.start', nr.start_age); ctx.remember('last.end', nr.end_age);
          save(); ov.close(); paintTable(); paintRes(); EFA.numify(ctx.el);
        });
      };
      const confirmDel = (idx) => {
        const ov = modal(ctx, { cls: 'b12-sm', title: ctx.t('del.t'), html: `${ctx.t('del.q', { tag: 'p', cls: 'b12-ovl-p' })}<div class="b12-ovl-act"><button type="button" class="st-pill b12-ghost" data-no>${ctx.t('no')}</button><button type="button" class="st-pill" data-yes>${ctx.t('yes')}</button></div>` });
        ov.querySelector('[data-no]').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) ov.close(); });
        ov.querySelector('[data-yes]').addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; S.list.splice(idx, 1); save(); ov.close(); paintTable(); paintRes(); });
      };
      wire(ctx, (id) => { if (id === 'df') paintRes(); });
      ctx.on(ctx.$('[data-add]'), 'click', () => openDlg(null));
      ctx.on(ctx.$('[data-calc]'), 'click', () => { if (!S.list.length) return; S.shown = true; paintRes(); EFA.numify(ctx.el); });
      const sheet = () => {
        const R = ipCalc(S.list, val(ctx, 'df'));
        return { heading: ctx.t('ws.title'), size: 'small', disclosures: ['license'],
          columns: [{ field: 'age', header: ctx.t('ws.age'), type: 'age', width: 90 }, wcol(ctx, 'inc', 'ws.inc', 'money', { dp: 0 }), wcol(ctx, 'cum', 'ws.cum', 'money', { dp: 0 })],
          rows: R.rows.map((x) => ({ age: x.age, inc: x.income, cum: x.cum })) };
      };
      paintTable(); paintRes();
    }
  });

  /* =====================================================================================
     RIA. Retirement income alternatives: shared projection engine (ria2.md), ria1 to ria3
     ===================================================================================== */
  /** v: {RA, LE, tax, inf, adj, c: {A, r, x, d}, s: {A, r, x, d, ins}}; rates/shares as fractions. null when N <= 0 */
  function riaEngine(v) {
    const N = Math.round(v.LE - v.RA + 1);
    if (!(N > 0)) return null;
    const tax = v.tax, inf = v.inf;
    const Ac = v.c.A, rc = v.c.r, xc = v.c.x, dc = v.c.d;
    const Ic = Ac * rc, Tc = xc * Ic * tax + dc * Ic * tax;
    const cons = [];
    for (let k = 0; k < N; k++) cons.push({ age: v.RA + k, gross: Ic, rate: tax, taxes: -Tc, pp: (Ic - Tc) / Math.pow(1 + inf, k), estate: Ac - Ac * dc * tax, bal: Ac, wd: Ic, tx: Tc });
    const As = v.s.A, rs = v.s.r, xs = v.s.x, ds = v.s.d, ins = v.s.ins;
    const W0 = rs === 0 ? As / N : As * rs * Math.pow(1 + rs, N) / (Math.pow(1 + rs, N) - 1);
    const den = 1 - ds * tax;
    let B = 0;
    if (v.adj && den !== 0) {
      const Fn = (g) => { let bal = As; for (let m = 0; m < N; m++) { const grown = bal * (1 + rs); const W = (-g * Math.pow(1 + inf, m) + bal * rs * tax * xs) / den; bal = grown - W; } return bal; };
      let g0 = 0, F0 = Fn(0), g1 = W0, F1 = Fn(W0), res = null;
      for (let i = 0; i < 99; i++) {
        const c = (g1 - g0) / (F1 - F0) * F1;
        if (!isFinite(c)) break;
        if (Math.abs(c) < 0.0049) { res = g1; break; }
        g0 = g1; F0 = F1; g1 = g1 - c; F1 = Fn(g1);
      }
      B = res == null ? 0 : -res;
    }
    const cmsm = []; let bal = As;
    for (let k = 0; k < N; k++) {
      const W = v.adj ? (den !== 0 ? (B * Math.pow(1 + inf, k) + bal * rs * tax * xs) / den : 0) : W0;
      const interest = bal * rs, taxes = xs * interest * tax + ds * W * tax;
      const eff = W > 0 ? taxes / W : 0, pp = (W - taxes) / Math.pow(1 + inf, k);
      const ppc = cons[k].pp, chg = ppc > 0 ? (pp - ppc) / ppc : 0;
      bal = Math.max(bal + interest - W, 0);
      cmsm.push({ age: v.RA + k, gross: W, rate: eff, taxes: -taxes, pp, chg, bal, estate: bal - bal * ds * tax + ins, wd: W, tx: taxes });
    }
    const sum = (a, f) => a.reduce((t, x) => t + x[f], 0);
    return {
      N, cons, cmsm, maxTank: Math.max(Ac, As, ins),
      first: { c: { inc: Ic, tax: -Tc, net: Ic - Tc }, s: { inc: cmsm[0].gross, tax: cmsm[0].taxes, net: cmsm[0].gross + cmsm[0].taxes } },
      tot: {
        c: { gross: N * Ic, rate: tax, taxes: -N * Tc, pp: sum(cons, 'pp') },
        s: { gross: sum(cmsm, 'gross'), rate: sum(cmsm, 'rate') / N, taxes: sum(cmsm, 'taxes'), pp: sum(cmsm, 'pp') },
        chg: sum(cmsm, 'chg') / N
      }
    };
  }
  /** current RIA inputs from the shared case keys */
  function riaInputs() {
    const n = (k) => CASE.n(k);
    return {
      RA: n('case_file_retirement_age'), LE: n('case_file_life_expectancy'), tax: n('case_file_ror_taxes'), inf: n('case_file_ror_inflation'),
      adj: !!CASE.get('inflation_adjust_income_stream', false),
      c: { A: n('trad_retirement_asset_value'), r: n('trad_investment_ror'), x: n('trad_taxable_percentage'), d: n('trad_deferred_percentage') },
      s: { A: n('ideal_retirement_asset_value'), r: n('ideal_investment_ror'), x: n('ideal_taxable_percentage'), d: n('ideal_deferred_percentage'), ins: n('ideal_insurance_value') }
    };
  }
  EFA.engines.ria = { run: riaEngine, inputs: riaInputs };
  /** three-way allocation auto-balance (ria1.md), in percent units; which = 'T' | 'D' | 'F' */
  function balanceMix(which, t, cur) {
    let T = cur.T, D = cur.D, Fr = cur.F;
    if (which === 'T') { if (t > 100) { T = 100; D = 0; Fr = 0; } else { const rem = 100 - t - D; if (rem < 0) { Fr = 0; D = 100 - t; } else Fr = rem; T = t; } }
    if (which === 'D') { if (t > 100) { T = 0; D = 100; Fr = 0; } else { const rem = 100 - T - t; if (rem < 0) { Fr = 0; T = 100 - t; } else Fr = rem; D = t; } }
    if (which === 'F') { if (t > 100) { T = 0; D = 0; Fr = 100; } else { const rem = 100 - T - t; if (rem < 0) { D = 0; T = 100 - t; } else D = rem; Fr = t; } }
    return { T: r2(T), D: r2(D), F: r2(Fr) };
  }
  EFA.engines.ria.balanceMix = balanceMix;
  /** copy the conserve-side assumptions into the consume side (ria1) */
  function mirrorToConsume() {
    CASE.set('ideal_retirement_asset_value', CASE.n('trad_retirement_asset_value'));
    CASE.set('ideal_investment_ror', CASE.n('trad_investment_ror'));
    ['taxable', 'deferred', 'free'].forEach((k) => CASE.set(`ideal_${k}_percentage`, CASE.n(`trad_${k}_percentage`)));
  }

  /* ---------- ria1. Initial assumptions ---------- */
  EFA.css('b12-ria1', `
  .b12-r1 { position: absolute; left: 400px; width: 800px; top: 150px; padding: 18px 0 20px; }
  .b12-r1 .b12-row { height: 62px; padding: 0 34px 0 40px; }
  .b12-r1 .b12-lb { font: 700 26px/1.2 var(--f-body); gap: 4px; }
  .b12-r1-sub { text-align: center; padding: 18px 0 6px; border-top: 1px solid var(--line); }
  .b12-r1-sub span { font: 700 15px/1 var(--f-body); letter-spacing: .22em; text-transform: uppercase; color: var(--gold-deep); }
  .b12-r1-mix { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 26px; padding: 8px 40px 18px; text-align: center; }
  .b12-r1-mix .h { font: 600 19px/1.2 var(--f-body); color: var(--muted); }
  .b12-r1-mix .b12-in { width: 100%; text-align: center; }
  .b12-r1-go { position: absolute; right: 400px; top: 724px; }
  `);
  EFA.screen('ria1', {
    title: 'Retirement income alternatives: initial assumptions',
    copy: {
      head: 'Your Starting Assumptions',
      'l.ra': 'Retirement Age', 'l.le': 'Life Expectancy', 'l.inf': 'Inflation Rate', 'l.egg': 'Nest Egg Value', mix: 'Asset Allocation',
      'm.t': 'Taxable', 'm.d': 'Tax Deferred', 'm.f': 'Tax Adv./Free', 'l.ror': 'Retirement Rate of Return', 'l.tax': 'Retirement Tax Bracket', cont: 'Continue',
      _notes: 'Everything on the next three screens runs on these few numbers. They are assumptions, not promises, and we can change any of them as we go.\n\n- The small dots open the life expectancy and inflation history helpers.\n- Ask: When you picture your retirement income, do you picture living on the interest or spending down what you saved?\nPAUSE'
    },
    render(ctx) {
      mirrorToConsume();
      const R = (label, inner) => row(ctx, label, inner);
      ctx.el.innerHTML = `
        <div class="b12-head" style="top:50px">${ctx.t('head', { tag: 'h1', cls: 'st-h1 b12-hc' })}<hr class="st-rule"></div>
        <div class="b12-r1 b12-card">
          ${R('l.ra', fld(ctx, { id: 'ra', key: 'case_file_retirement_age', type: 'int', min: 0, label: 'l.ra' }))}
          <div class="b12-row"><span class="b12-lb">${ctx.t('l.le')}${leLink(ctx, (age) => setVal(ctx, 'le', age))}</span>${fld(ctx, { id: 'le', key: 'case_file_life_expectancy', type: 'int', min: 0, label: 'l.le' })}</div>
          <div class="b12-row"><span class="b12-lb">${ctx.t('l.inf')}${infLink(ctx, (rate) => setVal(ctx, 'inf', r2(rate * 100) / 100))}</span>${fld(ctx, { id: 'inf', key: 'case_file_ror_inflation', type: 'pct', label: 'l.inf' })}</div>
          ${R('l.egg', fld(ctx, { id: 'egg', key: 'trad_retirement_asset_value', type: 'money', min: 0, label: 'l.egg' }))}
          <div class="b12-r1-sub"><span>${ctx.t('mix')}</span></div>
          <div class="b12-r1-mix">
            <span class="h">${ctx.t('m.t')}</span><span class="h">${ctx.t('m.d')}</span><span class="h">${ctx.t('m.f')}</span>
            ${fld(ctx, { id: 'T', key: 'trad_taxable_percentage', type: 'pct', min: 0, label: 'm.t' })}${fld(ctx, { id: 'D', key: 'trad_deferred_percentage', type: 'pct', min: 0, label: 'm.d' })}${fld(ctx, { id: 'F', key: 'trad_free_percentage', type: 'pct', min: 0, label: 'm.f' })}
          </div>
          ${R('l.ror', fld(ctx, { id: 'ror', key: 'trad_investment_ror', type: 'pct', min: 0, max: 0.12, disclose: 'ror', label: 'l.ror' }))}
          ${R('l.tax', fld(ctx, { id: 'tax', key: 'case_file_ror_taxes', type: 'pct', min: 0, label: 'l.tax' }))}
        </div>
        <div class="b12-r1-go"><button type="button" class="st-pill b12-go" data-cont>${ctx.t('cont')}</button></div>
        ${discLine(ctx)}`;
      wire(ctx, (id, v) => {
        if (id === 'T' || id === 'D' || id === 'F') {
          const b = balanceMix(id, r2(v * 100), { T: r2(val(ctx, 'T') * 100), D: r2(val(ctx, 'D') * 100), F: r2(val(ctx, 'F') * 100) });
          setVal(ctx, 'T', b.T / 100); setVal(ctx, 'D', b.D / 100); setVal(ctx, 'F', b.F / 100);
        }
        mirrorToConsume();
      });
      ctx.on(ctx.$('[data-cont]'), 'click', () => ctx.next());
    }
  });

  /* ---------- ria2 / ria3 diagram pieces ---------- */
  const f1 = (n) => Math.round(n * 10) / 10;
  /** outlined arrow along a quadratic curve p0 -> p1 (control c): band width w, head length hl, head half-width hw */
  function bandArrow(p0, c, p1, w, hl, hw) {
    const B = (t) => [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]];
    const D = (t) => [2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]), 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1])];
    const n = 48, pts = [], Ls = [0];
    for (let i = 0; i <= n; i++) pts.push(B(i / n));
    for (let i = 1; i <= n; i++) Ls.push(Ls[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    let e = n; while (e > 1 && Ls[n] - Ls[e] < hl) e--;
    const side = (i, sgn, half) => { const d = D(i / n), l = Math.hypot(d[0], d[1]) || 1; return [pts[i][0] - sgn * d[1] / l * half, pts[i][1] + sgn * d[0] / l * half]; };
    const L = [], R = [];
    for (let i = 0; i <= e; i++) { L.push(side(i, 1, w / 2)); R.push(side(i, -1, w / 2)); }
    const h1 = side(e, 1, hw), h2 = side(e, -1, hw);
    const P = (p) => `${f1(p[0])},${f1(p[1])}`;
    return `M${L.map(P).join('L')}L${P(h1)}L${P(p1)}L${P(h2)}L${R.reverse().map(P).join('L')}Z`;
  }
  EFA.css('b12-ria', `
  .b12-dg { position: absolute; inset: 0; }
  .b12-dg svg.b12-full { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; overflow: visible; pointer-events: none; }
  .b12-cap { position: absolute; left: 110px; right: 110px; top: 14px; text-align: center; font: italic 600 40px/1.15 var(--f-display); color: var(--gold-deep); }
  .b12-olab { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; font: 700 26px/1 var(--f-body); color: var(--navy); }
  .b12-olab.b12-acc { color: var(--gold-deep); letter-spacing: .14em; text-transform: uppercase; font-size: 24px; }
  .b12-olab.b12-big { font-size: 30px; }
  .b12-abs { position: absolute; }
  .b12-in.b12-amt { width: 270px; height: 56px; font-size: 34px; font-weight: 700; text-align: center; }
  .b12-in.b12-rate { width: 110px; height: 46px; font-size: 26px; text-align: center; }
  .b12-in.b12-age { width: 84px; height: 46px; font-size: 26px; text-align: center; font-weight: 700; }
  .b12-blab { position: absolute; transform: translateX(-50%); white-space: nowrap; font: 700 20px/1 var(--f-body); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
  .b12-blab.b12-lk2 { color: var(--gold-deep); cursor: pointer; border-bottom: 2px dotted rgba(184,151,46,.8); }
  .b12-im { position: absolute; width: 230px; text-align: right; }
  .b12-im > div { font: 700 34px/1.25 var(--f-body); color: var(--navy); }
  .b12-im .b12-fy { font: 500 19px/1.4 var(--f-body); color: var(--muted); }
  .b12-im .b12-im2 { position: relative; height: 34px; }
  .b12-im .b12-im2 > * { position: absolute; right: 0; top: 0; }
  .b12-im .b12-rl { height: 3px; background: var(--navy); margin: 6px 0 4px 40px; border-radius: 2px; }
  .b12-im .b12-im-t { font: 700 30px/1.15 var(--f-body); color: ${RED}; }
  .b12-rk { position: absolute; width: 380px; }
  .b12-rk-t { display: block; margin: 0 auto; width: 300px; text-align: center; padding: 8px 0 9px; border-radius: 10px; background: rgba(255,255,255,.92); box-shadow: 0 6px 16px rgba(13,30,58,.08); font: 700 26px/1 var(--f-body); color: var(--gold-deep); letter-spacing: .04em; }
  .b12-rk-rows { display: grid; gap: 9px; margin-top: 18px; }
  .b12-rk-r { display: flex; align-items: center; gap: 14px; }
  .b12-rk-r .b12-ico { width: 40px; height: 40px; }
  .b12-rk-c { flex: 1; padding: 10px 20px; font: 700 22px/1.1 var(--f-body); color: var(--navy); }
  .b12-rk-r.b12-click { cursor: pointer; }
  .b12-rk-r.b12-dim .b12-rk-c, .b12-rk-r.b12-dim .b12-ico { opacity: .6; }
  .b12-rk-r.b12-dim .b12-rk-c { text-decoration: line-through; text-decoration-color: rgba(13,30,58,.45); }
  .b12-docmode .b12-dg-only { display: none !important; }
  .b12-doc-only { display: none; }
  .b12-docmode .b12-doc-only { display: block; }
  .b12-dcard { position: absolute; left: 110px; top: 92px; width: 640px; padding: 10px 0; display: grid; grid-template-columns: 1fr 1.18fr; }
  .b12-dcol { display: grid; align-content: start; }
  .b12-dcol + .b12-dcol { border-left: 1px solid var(--line); }
  .b12-dr { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px; padding: 5px 16px 5px 20px; min-height: 46px; }
  .b12-dr .k { font: 700 12.5px/1.25 var(--f-body); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; gap: 2px; }
  .b12-dr .b12-in { width: 138px; height: 38px; font-size: 19px; padding: 0 10px; }
  .b12-dcol.b12-dl .b12-dr { grid-template-columns: 1fr; gap: 4px; padding-top: 8px; }
  .b12-dcol.b12-dl .b12-dr .b12-in { width: 100%; }
  .b12-docmode .b12-rk-rows { gap: 6px; margin-top: 14px; }
  .b12-docmode .b12-rk-c { padding: 8px 18px; font-size: 20px; }
  .b12-docmode .b12-rk-r .b12-ico { width: 34px; height: 34px; }
  .b12-docmode .b12-rk-t { width: 260px; font-size: 23px; padding: 7px 0 8px; }
  .b12-dtab { position: absolute; left: 790px; top: 92px; width: 700px; height: 694px; overflow: auto; padding: 0; }
  .b12-dtab table { width: 100%; border-collapse: collapse; }
  .b12-dtab th { position: sticky; top: 0; z-index: 1; background: var(--navy); color: var(--cream); font: 700 12.5px/1.2 var(--f-body); letter-spacing: .12em; text-transform: uppercase; padding: 12px 12px; text-align: right; }
  .b12-dtab th:first-child, .b12-dtab td:first-child { text-align: center; }
  .b12-dtab td { padding: 9px 12px; text-align: right; font: 600 18px/1.1 var(--f-body); color: var(--navy); border-top: 1px solid var(--line); }
  .b12-dtab tbody tr:nth-child(even) td { background: rgba(227,232,240,.45); }
  .b12-dtab tfoot td { position: sticky; bottom: 0; background: var(--gold-pale); font-weight: 700; border-top: 2px solid var(--gold); }
  .b12-dtab .b12-neg { color: ${RED}; }
  .b12-dtoggle { position: absolute; left: 110px; bottom: 132px; }
  .b12-ria-btns { position: absolute; right: 120px; bottom: 124px; display: flex; gap: 14px; }
  .stage .b12-ria-btns .st-pill { min-height: 48px; font-size: 18px; padding: 0 26px; }
  .b12-pol { position: absolute; }
  .b12-pol-t { position: absolute; left: 0; right: 0; text-align: center; font: 600 30px/1.05 var(--f-display); color: var(--navy); }
  .b12-in.b12-ins { width: 172px; height: 44px; font-size: 22px; font-weight: 700; text-align: center; }
  `);
  const RISKS = ['tax', 'inf', 'rate', 'loss', 'mkt', 'long'];
  const riaCopy = {
    assets: 'Assets', at: 'at', income: 'Income', legacy: 'Legacy', 'b.ra': 'Retirement Age', 'b.le': 'Life Expectancy', fy: '(1st year)',
    'rk.tax': 'Tax Rate', 'rk.inf': 'Inflation', 'rk.rate': 'Interest Rate', 'rk.loss': 'Loss of Capital', 'rk.mkt': 'Market Risk', 'rk.long': 'Longevity',
    'd.ins.c': 'Term Insurance', 'd.ins.s': 'Perm Insurance', 'd.assets': 'Total Assets', 'd.inf': 'Inflation Rate', 'd.tax': 'Tax Rate', 'd.rate': 'Interest Rate', 'd.ra': 'Retirement Age', 'd.le': 'Life Expectancy',
    't.age': 'Age', 't.gross': 'Gross Withdrawal', 't.rate': 'Tax Rate', 't.taxes': 'Taxes Paid', 't.pp': 'Purchasing Power', 't.after': 'After', 't.years': 'Years',
    'doc.show': 'Documentation', 'doc.hide': 'Diagram'
  };
  /** the shared diagram + documentation screen for ria2 (conserve) and ria3 (consume) */
  function riaScreen(ctx, mode) {
    const S = st(ctx); const cons = mode === 'c';
    S.doc = false; S.mkt = false;
    const K = cons ? { A: 'trad_retirement_asset_value', r: 'trad_investment_ror', ins: 'trad_insurance_value' } : { A: 'ideal_retirement_asset_value', r: 'ideal_investment_ror', ins: 'ideal_insurance_value' };
    const ox = 800, oy = 214, rx = 238, ry = 128;
    const bx0 = 560, bx1 = 1040, by = 404;
    const leftArrow = bandArrow([622, 284], [532, 278], [474, 346], 30, 34, 30);
    const rightArrow = cons ? bandArrow([978, 284], [1068, 278], [1126, 346], 30, 34, 30) : bandArrow([1296, 140], [1404, 118], [1446, 220], 30, 34, 30);
    const solid = cons ? '' : bandArrow([1126, 262], [1060, 262], [984, 262], 30, 30, 30);
    const page = cons ? '' : `<g transform="translate(1110 70)"><path d="M10 14h196v262l-30 30H10z" fill="rgba(13,30,58,.10)"/><path d="M4 6h196v262l-34 34H4z" fill="${P.paper}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M200 268l-34 34v-26c0-4 4-8 8-8z" fill="${P.mist}" stroke="${P.navy}" stroke-width="3" stroke-linejoin="round"/>
        <g stroke="${P.mist2}" stroke-width="5" stroke-linecap="round"><path d="M30 214h146M30 234h130M30 254h96"/></g>
        <rect x="24" y="148" width="156" height="4" rx="2" fill="${P.gold}"/></g>`;
    const riskRows = RISKS.map((k, i) => `<div class="b12-rk-r b12-f b12-rk${i}${!cons && k === 'mkt' ? ' b12-click' : ''}" data-rk="${k}">${ICON.star(40)}<div class="b12-rk-c b12-card">${ctx.t('rk.' + k)}</div></div>`).join('');
    const ageIn = (id, key) => fld(ctx, { id, key, type: 'int', min: 0, cls: 'b12-age', label: id === 'ra' ? 'b.ra' : 'b.le' });
    ctx.el.innerHTML = `
      <div class="b12-dg b12-dg-only">
        <svg class="b12-full" viewBox="0 0 1600 900" aria-hidden="true">
          <defs><radialGradient id="b12ov${mode}" cx=".42" cy=".34" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="${P.paper}"/><stop offset="1" stop-color="${P.mist}"/></radialGradient></defs>
          <ellipse cx="${ox}" cy="${oy + 16}" rx="${rx + 6}" ry="${ry + 4}" fill="rgba(13,30,58,.10)"/>
          <ellipse cx="${ox}" cy="${oy}" rx="${rx}" ry="${ry}" fill="url(#b12ov${mode})" stroke="${P.navy3}" stroke-width="3.5"/>
          <ellipse cx="${ox}" cy="${oy}" rx="${rx - 12}" ry="${ry - 11}" fill="none" stroke="${P.gold}" stroke-opacity=".45" stroke-width="2"/>
          <path class="b12-f b12-s1" d="${leftArrow}" fill="${P.goldPale}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
          <path class="b12-f b12-sleg" d="${rightArrow}" fill="${P.gold}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
          ${cons ? '' : `<g class="b12-f b12-spol">${page}</g><path class="b12-f b12-scv" d="${solid}" fill="${P.navy}"/>`}
          <path d="M${bx0},${by - 40}V${by}H${bx1}V${by - 40}" fill="none" stroke="${P.navy}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="b12-olab b12-acc" style="left:${ox}px;top:128px">${ctx.t('assets')}</div>
        <div class="b12-abs" style="left:${ox - 135}px;top:152px">${fld(ctx, { id: 'A', key: K.A, type: 'money', min: 0, cls: 'b12-amt b12-bare', label: 'assets' })}</div>
        <div class="b12-abs" style="left:${ox - 92}px;top:222px;display:flex;align-items:center;gap:14px"><span class="b12-olab" style="position:static;transform:none;font-weight:600">${ctx.t('at')}</span>${fld(ctx, { id: 'r', key: K.r, type: 'pct', min: 0, max: 0.12, disclose: 'rd', cls: 'b12-rate b12-bare', label: 'd.rate' })}</div>
        <div class="b12-olab b12-big b12-f b12-s1" style="left:${ox - 116}px;top:300px">${ctx.t('income')}</div>
        <div class="b12-olab b12-big b12-f b12-sleg" style="left:${cons ? ox + 116 : 1458}px;top:${cons ? 300 : 266}px">${ctx.t('legacy')}</div>
        ${cons ? '' : `<div class="b12-pol b12-f b12-spol" style="left:1114px;top:76px;width:200px">
            <div class="b12-pol-t" style="top:16px">${ctx.t('pol')}</div>
            <div class="b12-abs" style="left:14px;top:88px">${fld(ctx, { id: 'ins', key: 'ideal_insurance_value', type: 'money', min: 0, cls: 'b12-ins', label: 'pol' })}</div>
          </div>
          <div class="b12-olab b12-f b12-scv" style="left:1214px;top:242px;font-size:22px;color:var(--navy-4)">${ctx.t('cv')}</div>`}
        <div class="b12-abs" style="left:${bx0 - 42}px;top:${by - 90}px">${ageIn('ra', 'case_file_retirement_age')}</div>
        <div class="b12-abs" style="left:${bx1 - 42}px;top:${by - 90}px">${ageIn('le', 'case_file_life_expectancy')}</div>
        <div class="b12-blab b12-f b12-agel" style="left:${bx0}px;top:${by + 18}px">${ctx.t('b.ra')}</div>
        <div class="b12-blab b12-f b12-agel" style="left:${bx1}px;top:${by + 18}px">${leLink(ctx, (age) => setVal(ctx, 'le', age, true) || recalc(), { look: 'text', label: ctx.t('b.le') })}</div>
        <div class="b12-im b12-f b12-s1" style="left:222px;top:360px">
          <div data-out="inc"></div>
          <div class="b12-im2"><span class="b12-fy b12-f b12-fyA">${ctx.t('fy')}</span><span class="b12-im-t b12-f b12-s5" data-out="tax"></span></div>
          <div class="b12-rl b12-f b12-s5"></div>
          <div class="b12-f b12-s5" data-out="net"></div>
          <div class="b12-fy b12-f b12-s5">${ctx.t('fy')}</div>
        </div>
        <div class="b12-cap b12-f b12-s2">${ctx.t('cap')}</div>
      </div>
      <div class="b12-rk" data-rkp style="left:${cons ? 610 : 600}px;top:${by - 46}px">
        <span class="b12-rk-t b12-f b12-s4">${ctx.t('rkt')}</span>
        <div class="b12-rk-rows">${riskRows}</div>
      </div>
      <div class="b12-doc-only">
        <div class="b12-dcard b12-card">
          <div class="b12-dcol b12-dl">
            <div class="b12-dr"><span class="k">${ctx.t('d.assets')}</span>${fld(ctx, { id: 'dA', key: K.A, type: 'money', min: 0, label: 'd.assets' })}</div>
            <div class="b12-dr"><span class="k">${ctx.t(cons ? 'd.ins.c' : 'd.ins.s')}</span>${fld(ctx, { id: 'dI', key: K.ins, type: 'money', min: 0, label: cons ? 'd.ins.c' : 'd.ins.s' })}</div>
          </div>
          <div class="b12-dcol">
            <div class="b12-dr"><span class="k">${ctx.t('d.inf')}${infLink(ctx, (rate) => { setVal(ctx, 'dInf', r2(rate * 100) / 100); recalc(); })}</span>${fld(ctx, { id: 'dInf', key: 'case_file_ror_inflation', type: 'pct', label: 'd.inf' })}</div>
            <div class="b12-dr"><span class="k">${ctx.t('d.tax')}</span>${fld(ctx, { id: 'dTax', key: 'case_file_ror_taxes', type: 'pct', min: 0, label: 'd.tax' })}</div>
            <div class="b12-dr"><span class="k">${ctx.t('d.rate')}</span>${fld(ctx, { id: 'dR', key: K.r, type: 'pct', min: 0, max: 0.12, disclose: 'rdoc', label: 'd.rate' })}</div>
            <div class="b12-dr"><span class="k">${ctx.t('d.ra')}</span>${fld(ctx, { id: 'dRA', key: 'case_file_retirement_age', type: 'int', min: 0, label: 'd.ra' })}</div>
            <div class="b12-dr"><span class="k">${ctx.t('d.le')}${leLink(ctx, (age) => { setVal(ctx, 'dLE', age); recalc(); })}</span>${fld(ctx, { id: 'dLE', key: 'case_file_life_expectancy', type: 'int', min: 0, label: 'd.le' })}</div>
          </div>
        </div>
        <div class="b12-dtab b12-card"><table><thead><tr><th>${ctx.t('t.age')}</th><th>${ctx.t('t.gross')}</th><th>${ctx.t('t.rate')}</th><th>${ctx.t('t.taxes')}</th><th>${ctx.t('t.pp')}</th></tr></thead><tbody data-tb></tbody>
          <tfoot><tr><td>${ctx.t('t.after')} <span class="num" data-out="nyrs"></span> ${ctx.t('t.years')}</td><td data-out="fg"></td><td data-out="fr"></td><td class="b12-neg" data-out="ft"></td><td data-out="fp"></td></tr></tfoot></table></div>
      </div>
      <div class="b12-dtoggle"><button type="button" class="b12-link" data-dmode>${ctx.t('doc.show')}</button></div>
      ${cons ? '' : `<div class="b12-ria-btns b12-dg-only"><button type="button" class="st-pill" data-to="grid">${ctx.t('btn.num')}</button><button type="button" class="st-pill" data-to="pem">${ctx.t('btn.pem')}</button></div>`}
      ${discLine(ctx, cons ? ['hypothetical'] : ['hypothetical', 'loans'])}`;
    // twins: the diagram and the documentation inputs edit the same keys
    const recalc = () => {
      const R = riaEngine(riaInputs());
      if (!R) return;
      S.R = R;
      const f = cons ? R.first.c : R.first.s;
      setOut(ctx, 'inc', N(money(f.inc))); setOut(ctx, 'tax', N(money(f.tax))); setOut(ctx, 'net', N(money(f.net)));
      const rows = cons ? R.cons : R.cmsm, tot = cons ? R.tot.c : R.tot.s;
      ctx.$('[data-tb]').innerHTML = rows.map((x) => `<tr><td>${N(x.age)}</td><td>${N(money(x.gross))}</td><td>${N(pct2(x.rate))}</td><td class="b12-neg">${N(money(x.taxes))}</td><td>${N(money(x.pp))}</td></tr>`).join('');
      setOut(ctx, 'nyrs', R.N); setOut(ctx, 'fg', N(money(tot.gross))); setOut(ctx, 'fr', N(pct2(tot.rate))); setOut(ctx, 'ft', N(money(tot.taxes))); setOut(ctx, 'fp', N(money(tot.pp)));
    };
    S.recalc = recalc;
    wire(ctx, () => recalc());
    const setMode = (doc) => {
      S.doc = doc;
      ctx.el.classList.toggle('b12-docmode', doc);
      const p = ctx.$('[data-rkp]');
      if (doc) { p.style.left = '110px'; p.style.top = '404px'; } else { p.style.left = (cons ? 610 : 600) + 'px'; p.style.top = (by - 46) + 'px'; }
      ctx.$('[data-dmode]').innerHTML = ctx.t(doc ? 'doc.hide' : 'doc.show');
      EFA.numify(ctx.el);
    };
    ctx.on(ctx.$('[data-dmode]'), 'click', () => { if (S.doc) setMode(false); else afterNotice(ctx, 'doc', () => setMode(true)); });
    if (!cons) {
      ctx.on(ctx.$('[data-rk="mkt"]'), 'click', () => { S.mkt = !S.mkt; ctx.$('[data-rk="mkt"]').classList.toggle('b12-dim', S.mkt); });
      ctx.on(ctx.$$('[data-to]'), 'click', (e, n) => {
        RIA4_VIEW.next = n.dataset.to; JUMP.ria3 = { step: ctx.step };
        const P = EFA.player, i = P.pres.screens.findIndex((s) => s.id === 'ria4');
        if (i >= 0) P.goScreen(i); else ctx.jump('RIA', 'ria4');
      });
    }
    recalc();
  }
  function riaStep(ctx, n, mode) {
    const cons = mode === 'c';
    const at = cons ? { s1: 1, s2: 2, sleg: 3, s4: 4, s5: 5, r0: 5 } : { s1: 1, spol: 2, s2: 3, scv: 4, sleg: 5, s4: 6, s5: 7, r0: 7 };
    ctx.show('.b12-s1', n >= at.s1); ctx.show('.b12-s2', n >= at.s2); ctx.show('.b12-sleg', n >= at.sleg);
    if (!cons) { ctx.show('.b12-spol', n >= at.spol); ctx.show('.b12-scv', n >= at.scv); }
    ctx.show('.b12-agel', n < at.s4); ctx.show('.b12-s4', n >= at.s4);
    ctx.show('.b12-fyA', n < at.s5); ctx.show('.b12-s5', n >= at.s5);
    RISKS.forEach((k, i) => ctx.show('.b12-rk' + i, n >= at.r0 + i));
  }
  const RIA4_VIEW = { next: null };

  EFA.screen('ria2', {
    title: 'Conserve the principal (live on the interest)',
    steps: 11,
    copy: Object.assign({}, riaCopy, {
      cap: 'Live on the earnings, and leave the principal as your legacy.',
      rkt: 'Major Risks',
      _notes: 'This is the traditional plan: live on the interest and keep the principal for the next generation. It sounds safe, and it asks a lot of the nest egg.\n\n- Each click adds the next piece, then the risks one at a time.\n- Ask: What happens to this plan if interest rates fall by half, or if prices double?\nPAUSE'
    }),
    render(ctx) { riaScreen(ctx, 'c'); },
    step(ctx, n) { riaStep(ctx, n, 'c'); }
  });

  EFA.screen('ria3', {
    title: 'Consume the principal, insure the legacy',
    steps: 13,
    copy: Object.assign({}, riaCopy, {
      cap: 'Enjoy your savings, and let a cash value life policy create the legacy.',
      rkt: 'Risks Reduced', pol: 'Cash Value\nLife Insurance', cv: 'Cash Value',
      'btn.num': 'Numbers', 'btn.pem': 'Tank View',
      _notes: 'The alternative: spend the nest egg on purpose, and let a cash value life insurance policy create the legacy. More income now, and the legacy no longer depends on never touching your savings.\n\n- Click Market Risk to show it is reduced, not removed.\n- Numbers and Tank View open the side-by-side comparison.\n- Ask: If your legacy were already taken care of, how would you feel about spending what you saved?\nPAUSE'
    }),
    render(ctx) {
      const back = takeJump(ctx);
      riaScreen(ctx, 's');
      if (back && back.step != null) EFA.player.step = Math.max(0, Math.min(12, back.step));
    },
    step(ctx, n) { riaStep(ctx, n, 's'); }
  });

  /* ---------- ria4. Conserve vs. consume, side by side ---------- */
  EFA.css('b12-ria4', `
  .b12-r4cards { position: absolute; left: 110px; right: 110px; top: 18px; height: 178px; display: flex; gap: 16px; }
  .b12-r4c { position: relative; border-radius: 14px; padding: 8px 18px 10px; border: 1px solid; box-shadow: 0 10px 26px rgba(13,30,58,.07); display: flex; flex-direction: column; min-width: 0; }
  .b12-r4c.b12-cc { flex: 3; background: #f7f0dc; border-color: #e3d4a6; }
  .b12-r4c.b12-cm { flex: 2; background: #f2f4f8; border-color: var(--mist-2); }
  .b12-r4c.b12-cs { flex: 3; background: #e7eef7; border-color: #c3d1e5; }
  .b12-r4h { font: 700 14px/1 var(--f-body); letter-spacing: .2em; text-transform: uppercase; text-align: left; padding: 6px 0 8px 2px; color: var(--navy); }
  .b12-r4c.b12-cc .b12-r4h { color: var(--gold-deep); }
  .b12-r4c.b12-cs .b12-r4h { color: var(--navy-4); }
  .b12-r4r { display: flex; align-items: center; justify-content: space-between; height: 44px; gap: 10px; }
  .b12-r4r .k { font: 600 19px/1.1 var(--f-body); color: var(--navy); display: flex; align-items: center; gap: 10px; white-space: nowrap; }
  .b12-r4r .b12-in { width: 168px; height: 38px; font-size: 20px; }
  .b12-r4r .b12-in.b12-sm4 { width: 74px; text-align: center; padding: 0 6px; }
  .b12-r4r .b12-in.b12-pc4 { width: 104px; }
  .b12-mixl { font: 700 14px/1 var(--f-body); color: var(--gold-deep); border-bottom: 1.5px dotted rgba(184,151,46,.85); cursor: pointer; letter-spacing: .04em; }
  .b12-mixl.b12-term { font: 600 19px/1.1 var(--f-body); letter-spacing: 0; }
  .b12-mixl:hover { color: var(--navy); }
  .b12-cancel { font: 600 18px/1 var(--f-body); color: var(--muted); font-style: italic; width: 168px; text-align: right; }
  .b12-ages { display: flex; align-items: center; gap: 8px; font: 600 17px/1 var(--f-body); color: var(--navy); }
  .b12-chk { position: absolute; right: 18px; top: 6px; display: flex; align-items: center; gap: 8px; font: 600 14px/1 var(--f-body); color: var(--navy-4); cursor: pointer; }
  .b12-chk input { width: 18px; height: 18px; accent-color: var(--gold); cursor: pointer; margin: 0; }
  .stage .b12-r4ok { min-height: 34px; padding: 0 16px; font-size: 15px; }
  .b12-r4t { position: absolute; left: 110px; right: 110px; top: 206px; overflow: auto; padding: 0; }
  .b12-r4t table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
  .b12-r4t th { position: sticky; top: 0; z-index: 2; height: 44px; padding: 4px 10px; font: 700 11.5px/1.2 var(--f-body); letter-spacing: .08em; text-transform: uppercase; text-align: right; color: var(--cream); background: var(--navy); }
  .b12-r4t th.b12-hc { background: #8a6e22; }
  .b12-r4t th.b12-hs { background: var(--navy-4); }
  .b12-r4t th:first-child, .b12-r4t td:first-child { text-align: center; }
  .b12-r4t td { padding: 7px 10px; text-align: right; font: 600 17px/1.1 var(--f-body); color: var(--navy); border-top: 1px solid rgba(13,30,58,.08); white-space: nowrap; }
  .b12-r4t td.b12-yc { background: rgba(240,230,196,.55); }
  .b12-r4t td.b12-ys { background: rgba(203,213,227,.42); }
  .b12-r4t tbody tr:nth-child(even) td.b12-yc { background: rgba(240,230,196,.85); }
  .b12-r4t tbody tr:nth-child(even) td.b12-ys { background: rgba(203,213,227,.7); }
  .b12-r4t td.b12-agec { cursor: pointer; font-weight: 700; color: var(--gold-deep); }
  .b12-r4t td.b12-agec:hover { background: var(--gold-pale); }
  .b12-r4t tfoot td { position: sticky; bottom: 0; z-index: 1; background: var(--paper); font-weight: 700; border-top: 2px solid var(--gold); height: 40px; }
  .b12-r4t tfoot td.b12-yc { background: #f4ead0; }
  .b12-r4t tfoot td.b12-ys { background: #dde5f0; }
  .b12-r4t .b12-neg { color: ${RED}; }
  .b12-r4t tr.b12-hide { display: none; }
  .b12-r4p { position: absolute; top: 330px; width: 682px; height: 432px; transition: opacity .4s ease; }
  .b12-r4p svg { position: absolute; left: 0; top: 0; width: 682px; height: 432px; overflow: visible; }
  .b12-r4p .b12-pt { position: absolute; left: 0; right: 0; top: 4px; text-align: center; font: 700 13px/1 var(--f-body); letter-spacing: .22em; text-transform: uppercase; color: var(--muted); }
  .b12-pl { position: absolute; font: 600 15px/1.25 var(--f-body); color: var(--navy); white-space: nowrap; }
  .b12-pl .num { font-weight: 700; font-size: 18px; }
  .b12-pl.b12-ctr { transform: translateX(-50%); text-align: center; }
  .b12-pl.b12-big .num { font-size: 21px; }
  .b12-fillg { transition: transform .45s ease; transform-box: fill-box; transform-origin: center bottom; }
  .b12-r4ctrl { position: absolute; display: grid; gap: 6px; justify-items: center; font: 700 11.5px/1.1 var(--f-body); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
  .b12-r4ctrl .b12-in { width: 70px; height: 34px; font-size: 18px; text-align: center; padding: 0 4px; }
  .b12-r4ctrl .b12-agev { font: 700 20px/1 var(--f-body); color: var(--navy); letter-spacing: 0; }
  .b12-r4ctrl input[type="checkbox"] { width: 20px; height: 20px; accent-color: var(--gold); margin: 0; cursor: pointer; }
  .b12-vsl { position: absolute; writing-mode: vertical-lr; direction: rtl; width: 22px; accent-color: var(--gold); cursor: pointer; margin: 0; }
  .b12-r4bar { position: absolute; left: 140px; right: 140px; top: 774px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
  .b12-r4bar .b12-fbox { display: flex; align-items: center; gap: 10px; }
  .b12-r4bar input.b12-ftxt { width: 210px; height: 40px; border: 1.5px solid var(--mist-2); border-radius: 10px; padding: 0 12px; font: 600 17px/1 var(--f-body); color: var(--navy); background: #fff; }
  .b12-r4bar input.b12-ftxt:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .stage .b12-r4bar .st-pill { min-height: 40px; padding: 0 18px; font-size: 16px; }
  .stage .b12-r4bar .st-pill.b12-ghost { background: transparent; color: var(--navy); border-color: var(--navy); }
  .stage .b12-r4bar .st-pill.b12-ghost:hover { background: var(--gold); border-color: var(--gold); }
  .b12-r4bar .b12-doc { position: static; }
  .b12-r4grid .b12-r4p { opacity: 0; pointer-events: none; }
  `);
  /** one plumbing scene (ria4): the asset tank on the left, the second (estate) tank on the right */
  function tankScene(id, consume) {
    const T = { x: 24, y: 96, w: 132, h: 206 }, T2 = { x: 452, y: 96, w: 132, h: 206 };
    const FH = 196, fb = T.y + T.h - 5;
    const tank = (t, lid, inner) => `
      <ellipse cx="${t.x + t.w / 2}" cy="${t.y + t.h + 12}" rx="${t.w / 2 + 14}" ry="8" fill="rgba(13,30,58,.12)"/>
      <rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="12" fill="${P.paper}"/>
      ${inner}
      <rect x="${t.x + 12}" y="${t.y + 10}" width="12" height="${t.h - 26}" rx="6" fill="#ffffff" opacity=".55"/>
      <rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="12" fill="none" stroke="${P.navy}" stroke-width="4"/>
      ${lid ? `<rect x="${t.x - 6}" y="${t.y - 12}" width="${t.w + 12}" height="16" rx="6" fill="${P.navy3}"/>` : `<path d="M${t.x - 6},${t.y} h${t.w + 12}" stroke="${P.navy}" stroke-width="6" stroke-linecap="round"/>`}`;
    const fill = (t, cls, color, extra) => `<rect class="b12-fillg ${cls}" x="${t.x + 4}" y="${t.y + t.h - 4 - FH}" width="${t.w - 8}" height="${FH}" rx="8" fill="${color}" style="transform:scaleY(0)"${extra || ''}/>`;
    const pipe = (d, w) => `<path d="${d}" fill="none" stroke="${P.navy}" stroke-width="${w + 6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${P.mist}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const flow = (d, w) => `<path class="b12-flow" d="${d}" fill="none" stroke="rgba(213,189,104,.9)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const out1 = `M${T.x + T.w},${T.y + 34} H210 V244`, out2 = 'M234,262 H352';
    const wheel = (x, y) => `<circle cx="${x}" cy="${y}" r="14" fill="${P.gold}" stroke="${P.navy}" stroke-width="3.5"/><path d="M${x - 10},${y}h20M${x},${y - 10}v20" stroke="${P.navy}" stroke-width="3" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 682 432" aria-hidden="true">
      ${pipe(out1, 16)}${pipe(out2, 16)}
      ${flow(out1, 8)}${flow(out2, 8)}
      ${wheel(183, T.y + 34)}
      <g><rect x="182" y="236" width="56" height="74" rx="12" fill="${P.goldDeep}" stroke="${P.navy}" stroke-width="3.5"/>
        <rect x="182" y="252" width="56" height="8" fill="${P.navy3}"/><rect x="182" y="284" width="56" height="8" fill="${P.navy3}"/>
        <rect x="198" y="226" width="24" height="12" rx="3" fill="${P.navy3}"/></g>
      <path d="M352,262 q26,0 26,26 v12" fill="none" stroke="${P.navy}" stroke-width="22" stroke-linecap="round"/>
      <path d="M352,262 q26,0 26,26 v12" fill="none" stroke="${P.mist}" stroke-width="16" stroke-linecap="round"/>
      <path class="b12-flow" d="M352,262 q26,0 26,26 v12" fill="none" stroke="rgba(213,189,104,.9)" stroke-width="8" stroke-linecap="round"/>
      <path class="b12-flow" d="M378,318 c-7,10 -9,15 -9,19 a9,9 0 0 0 18,0 c0,-4 -2,-9 -9,-19z" fill="${P.gold}"/>
      ${tank(T, false, fill(T, 'b12-f1', P.goldLt))}
      ${tank(T2, true, consume ? fill(T2, 'b12-f2', P.water) + fill(T2, 'b12-f3', 'rgba(240,230,196,.92)', ` stroke="${P.gold}" stroke-width="2"`) : '')}
    </svg>`;
  }
  EFA.screen('ria4', {
    title: 'Conserve vs. consume, side by side',
    copy: {
      'c.head': 'Conserve Principal', 'm.head': 'Shared Assumptions', 's.head': 'Consume Principal',
      'l.assets': 'Total Assets', 'l.rate': 'Int. Rate', 'l.term': 'Term Ins. @', 'l.cancel': 'cancelled', 'l.cvli': 'Cash Value Life @',
      'l.ages': 'Ages', 'l.to': 'to', 'l.taxes': 'Taxes', 'l.inf': 'Inflation', 'l.protect': 'Inflation-protect',
      'mix.t': '% Taxable Assets', 'mix.d': '% Tax Deferred', 'mix.f': '% Tax Free/Adv.', ok: 'OK',
      't.age': 'Age', 't.gross': 'Gross Withdrawal', 't.rate': 'Tax Rate', 't.taxes': 'Taxes Paid', 't.pp': 'Purchasing Power', 't.chg': 'Δ%', 't.sum': 'Sum',
      'p.wd': 'Withdraw', 'p.pp': 'Purchasing Power', 'p.est': 'Estate Value', 'p.tax': 'Taxes Paid:', 'p.year': 'Year', 'p.age': 'Age', 'p.step': 'Step',
      'sync.t': 'Keep Both Strategies in Step?', 'sync.q': 'Copy this change to the other strategy too?', yes: 'Yes', no: 'No',
      filter: 'Filter', showall: 'Show All', hideall: 'Hide All', 'v.pem': 'Tank View', 'v.grid': 'Numbers',
      'ws.title': 'Conserve versus Consume', 'ws.age': 'Age', 'ws.cg': 'Conserve Gross Withdrawal', 'ws.cr': 'Conserve Tax Rate', 'ws.ct': 'Conserve Taxes Paid', 'ws.cp': 'Conserve Purchasing Power',
      'ws.sg': 'Consume Gross Withdrawal', 'ws.sr': 'Consume Tax Rate', 'ws.st': 'Consume Taxes Paid', 'ws.sp': 'Consume Purchasing Power', 'ws.chg': 'Percentage Change', 'ws.total': 'Total',
      _notes: 'Same nest egg, two strategies, every year side by side. Conserving keeps the principal and lives on less. Consuming spends it down on purpose, and the life policy creates the legacy.\n\n- Pick a year to watch the tanks, or tick Step to run through retirement.\n- Click ages in the table, or type a number from 1 to 10, then Filter to compare a few years.\n- Ask: Which column would you rather live on?\nPAUSE'
    },
    render(ctx) {
      const S = st(ctx);
      const flag = RIA4_VIEW.next; RIA4_VIEW.next = null;
      S.grid = flag ? flag === 'grid' : ctx.variant === 'ViewAsGrid';
      S.filter = []; S.hideAll = false; S.year = 1; S.green = 0; S.auto = false; S.term = false; S.mix = { c: false, s: false }; S.mixDirty = { c: false, s: false };
      const mixLabel = (side) => { const p = side === 'c' ? 'trad' : 'ideal'; return ['taxable', 'deferred', 'free'].map((k) => nf(0, 2).format(r2(CASE.n(`${p}_${k}_percentage`) * 100))).join('/'); };
      const sideBody = (side) => {
        const c = side === 'c', p = c ? 'trad' : 'ideal';
        return `<div data-body="${side}">
            <div class="b12-r4r"><span class="k">${ctx.t('l.assets')}<span class="b12-mixl" data-mix="${side}" data-out="mix${side}">${mixLabel(side)}</span></span>${fld(ctx, { id: side + 'A', key: p + '_retirement_asset_value', type: 'money', min: 0, label: 'l.assets' })}</div>
            <div class="b12-r4r"><span class="k">${ctx.t('l.rate')}</span>${fld(ctx, Object.assign({ id: side + 'R', key: p + '_investment_ror', type: 'pct', min: 0, max: 0.12, cls: 'b12-pc4', label: 'l.rate' }, c ? { disclose: 'r4' } : {}))}</div>
            ${c ? `<div class="b12-r4r"><span class="k"><span class="b12-mixl b12-term" data-term>${ctx.t('l.term')} <span class="num" data-out="tRA"></span></span></span><span data-termbox>${fld(ctx, { id: 'cI', key: 'trad_insurance_value', type: 'money', min: 0, label: 'l.term' })}</span></div>`
              : `<div class="b12-r4r"><span class="k">${ctx.t('l.cvli')} <span class="num" data-out="tLE"></span></span>${fld(ctx, { id: 'sI', key: 'ideal_insurance_value', type: 'money', min: 0, label: 'l.cvli' })}</div>`}
          </div>
          <div data-mixbody="${side}" style="display:none">
            <div class="b12-r4r"><span class="k">${ctx.t('mix.t')}</span>${fld(ctx, { id: side + 'T', key: p + '_taxable_percentage', type: 'pct', min: 0, cls: 'b12-pc4', label: 'mix.t' })}</div>
            <div class="b12-r4r"><span class="k">${ctx.t('mix.d')}</span>${fld(ctx, { id: side + 'D', key: p + '_deferred_percentage', type: 'pct', min: 0, cls: 'b12-pc4', label: 'mix.d' })}</div>
            <div class="b12-r4r"><span class="k">${ctx.t('mix.f')}</span><span style="display:flex;gap:10px;align-items:center">${fld(ctx, { id: side + 'F', key: p + '_free_percentage', type: 'pct', min: 0, cls: 'b12-pc4', label: 'mix.f' })}<button type="button" class="st-pill b12-r4ok" data-mixok="${side}">${ctx.t('ok')}</button></span></div>
          </div>`;
      };
      const label = (cls, x, y, keyHtml, outId, extra) => `<div class="b12-pl ${cls || ''}" style="left:${x}px;top:${y}px${extra || ''}">${keyHtml}${keyHtml ? ' ' : ''}<span class="num" data-out="${outId}"></span></div>`;
      const panel = (side, left) => {
        const c = side === 'c';
        return `<div class="b12-r4p" data-panel="${side}" style="left:${left}px">
            <div class="b12-pt">${ctx.t(c ? 'c.head' : 's.head')}</div>
            ${tankScene(side, !c)}
            ${label('b12-ctr b12-big', 90, 58, '', side + 'bal')}
            ${label('b12-wd', 168, 92, ctx.t('p.wd'), side + 'wd', ';transform:translateY(-100%)')}
            ${label('b12-ctr', 210, 324, ctx.t('p.tax'), side + 'tax')}
            ${label('b12-ctr', 378, 356, ctx.t('p.pp') + '<br>', side + 'pp')}
            ${label('b12-ctr', 518, 330, ctx.t('p.est') + '<br>', side + 'est')}
            ${c ? '' : label('b12-ctr b12-big', 518, 58, '', 'sins')}
            ${c ? '' : `<input type="range" class="b12-vsl" data-green min="0" max="100" step="0.01" value="0" style="left:596px;top:96px;height:206px">
              <div class="b12-r4ctrl" style="left:626px;top:110px">
                <span>${ctx.t('p.year')}</span>${fld(ctx, { id: 'yr', def: 1, type: 'int', min: 1, label: 'p.year' })}
                <span style="margin-top:8px">${ctx.t('p.age')}</span><span class="b12-agev num" data-out="yAge"></span>
                <span style="margin-top:8px">${ctx.t('p.step')}</span><input type="checkbox" data-auto>
              </div>`}
          </div>`;
      };
      ctx.el.innerHTML = `
        <div class="b12-r4cards">
          <div class="b12-r4c b12-cc"><div class="b12-r4h">${ctx.t('c.head')}</div>${sideBody('c')}</div>
          <div class="b12-r4c b12-cm"><div class="b12-r4h">${ctx.t('m.head')}</div>
            <div class="b12-r4r"><span class="k">${ctx.t('l.ages')}</span><span class="b12-ages">${fld(ctx, { id: 'ra', key: 'case_file_retirement_age', type: 'int', min: 0, cls: 'b12-sm4', label: 'l.ages' })}${leLink(ctx, (age) => { setVal(ctx, 'le', age); recalc(); }, { look: 'text', label: ctx.t('l.to') })}${fld(ctx, { id: 'le', key: 'case_file_life_expectancy', type: 'int', min: 0, cls: 'b12-sm4', label: 'l.ages' })}</span></div>
            <div class="b12-r4r"><span class="k">${ctx.t('l.taxes')}</span>${fld(ctx, { id: 'tax', key: 'case_file_ror_taxes', type: 'pct', min: 0, cls: 'b12-pc4', label: 'l.taxes' })}</div>
            <div class="b12-r4r"><span class="k">${infLink(ctx, (rate) => { setVal(ctx, 'inf', r2(rate * 100) / 100); recalc(); }, { look: 'text', label: ctx.t('l.inf') })}</span>${fld(ctx, { id: 'inf', key: 'case_file_ror_inflation', type: 'pct', cls: 'b12-pc4', label: 'l.inf' })}</div>
          </div>
          <div class="b12-r4c b12-cs"><div class="b12-r4h">${ctx.t('s.head')}</div>
            <label class="b12-chk">${ctx.t('l.protect')}<input type="checkbox" data-adj ${CASE.get('inflation_adjust_income_stream', false) ? 'checked' : ''}></label>
            ${sideBody('s')}</div>
        </div>
        <div class="b12-r4t b12-card"><table>
          <colgroup><col style="width:6%">${'<col style="width:11.5%"><col style="width:8.5%"><col style="width:11%"><col style="width:12%">'.repeat(2)}<col style="width:6%"></colgroup>
          <thead><tr><th>${ctx.t('t.age')}</th>${['c', 's'].map((sd) => ['t.gross', 't.rate', 't.taxes', 't.pp'].map((k) => `<th class="${sd === 'c' ? 'b12-hc' : 'b12-hs'}">${ctx.t(k)}</th>`).join('')).join('')}<th>${ctx.t('t.chg')}</th></tr></thead>
          <tbody data-tb></tbody>
          <tfoot><tr><td>${ctx.t('t.sum')}</td><td class="b12-yc" data-out="Sg"></td><td class="b12-yc" data-out="Sr"></td><td class="b12-yc b12-neg" data-out="St"></td><td class="b12-yc" data-out="Sp"></td><td class="b12-ys" data-out="Cg"></td><td class="b12-ys" data-out="Cr"></td><td class="b12-ys b12-neg" data-out="Ct"></td><td class="b12-ys" data-out="Cp"></td><td data-out="Ch"></td></tr></tfoot>
        </table></div>
        ${panel('c', 110)}${panel('s', 808)}
        <div class="b12-r4bar">
          <span class="b12-fbox"><input type="text" class="b12-ftxt" data-ftxt autocomplete="off" spellcheck="false" aria-label="${esc(ctx.text('filter'))}"><button type="button" class="st-pill" data-filter>${ctx.t('filter')}</button></span>
          <button type="button" class="st-pill b12-ghost" data-showall>${ctx.t('showall')}</button>
          <button type="button" class="st-pill b12-ghost" data-hideall>${ctx.t('hideall')}</button>
          <button type="button" class="st-pill" data-view></button>
          ${docLink(ctx, () => { afterNotice(ctx, 'doc', () => openSheet(ctx, sheet())); return null; })}
        </div>
        ${discLine(ctx)}`;
      const recalc = () => {
        const R = riaEngine(riaInputs());
        if (!R) return; // N <= 0: keep the prior results
        S.R = R; S.year = Math.max(1, Math.min(R.N, S.year));
        const tb = ctx.$('[data-tb]');
        tb.innerHTML = R.cons.map((c, k) => { const s = R.cmsm[k];
          return `<tr data-age="${c.age}"><td class="b12-agec" data-agec="${c.age}">${N(c.age)}</td>
            <td class="b12-yc">${N(money(c.gross))}</td><td class="b12-yc">${N(pct2(c.rate))}</td><td class="b12-yc b12-neg">${N(money(c.taxes))}</td><td class="b12-yc">${N(money(c.pp))}</td>
            <td class="b12-ys">${N(money(s.gross))}</td><td class="b12-ys">${N(pct2(s.rate))}</td><td class="b12-ys b12-neg">${N(money(s.taxes))}</td><td class="b12-ys">${N(money(s.pp))}</td>
            <td>${N(nf(0, 0).format(Math.round(s.chg * 100)) + '%')}</td></tr>`; }).join('');
        ctx.on(ctx.$$('[data-agec]'), 'click', (e, n) => {
          const box = ctx.$('[data-ftxt]'); const cur = box.value.split(',').map((x) => x.trim()).filter(Boolean);
          if (cur.indexOf(n.dataset.agec) < 0) cur.push(n.dataset.agec);
          box.value = cur.join(', ');
        });
        setOut(ctx, 'Sg', N(money(R.tot.c.gross))); setOut(ctx, 'Sr', N(pct2(R.tot.c.rate))); setOut(ctx, 'St', N(money(R.tot.c.taxes))); setOut(ctx, 'Sp', N(money(R.tot.c.pp)));
        setOut(ctx, 'Cg', N(money(R.tot.s.gross))); setOut(ctx, 'Cr', N(pct2(R.tot.s.rate))); setOut(ctx, 'Ct', N(money(R.tot.s.taxes))); setOut(ctx, 'Cp', N(money(R.tot.s.pp)));
        setOut(ctx, 'Ch', N(nf(0, 0).format(Math.round(R.tot.chg * 100)) + '%'));
        setOut(ctx, 'tRA', F.int(CASE.n('case_file_retirement_age'))); setOut(ctx, 'tLE', F.int(CASE.n('case_file_life_expectancy')));
        setOut(ctx, 'mixc', mixLabel('c')); setOut(ctx, 'mixs', mixLabel('s'));
        const ym = st(ctx).f.yr; if (ym) { ym.max = R.N; if (val(ctx, 'yr') > R.N) setVal(ctx, 'yr', R.N, false); }
        applyRows(); paintPanels();
      };
      const applyRows = () => {
        const set = new Set(S.filter.map(Number));
        ctx.$$('[data-tb] tr').forEach((tr) => {
          const show = S.grid && !S.hideAll && (!set.size || set.has(+tr.dataset.age));
          tr.classList.toggle('b12-hide', !show);
        });
        ctx.el.classList.toggle('b12-r4grid', S.grid);
        ctx.$('.b12-r4t').style.maxHeight = S.grid ? '556px' : '';
        ctx.$('[data-view]').innerHTML = ctx.t(S.grid ? 'v.pem' : 'v.grid');
      };
      const paintPanels = () => {
        const R = S.R; if (!R) return;
        const k = S.year - 1, c = R.cons[k], s = R.cmsm[k], M = R.maxTank || 1;
        const sc = (sel, x) => { const e = ctx.$(sel); if (e) e.style.transform = `scaleY(${Math.max(0, Math.min(1, x))})`; };
        sc('[data-panel="c"] .b12-f1', c.bal / M); sc('[data-panel="s"] .b12-f1', s.bal / M);
        sc('[data-panel="s"] .b12-f2', R.cmsm.length ? CASE.n('ideal_insurance_value') / M : 0); sc('[data-panel="s"] .b12-f3', S.green / 100);
        const put = (side, x) => {
          setOut(ctx, side + 'bal', money(x.bal)); setOut(ctx, side + 'wd', money(x.wd)); setOut(ctx, side + 'tax', money(x.tx));
          setOut(ctx, side + 'pp', money(x.pp)); setOut(ctx, side + 'est', money(x.estate));
          ctx.show(ctx.$(`[data-panel="${side}"] .b12-wd`), x.wd > 0);
          ctx.$$(`[data-panel="${side}"] .b12-flow`).forEach((e) => { e.style.opacity = x.wd > 0 ? 1 : 0; });
        };
        put('c', c); put('s', s);
        setOut(ctx, 'sins', money(CASE.n('ideal_insurance_value'))); setOut(ctx, 'yAge', F.int(c.age));
      };
      // sync prompt after an asset, rate or tax-mix edit on either side
      const PAIR = { A: 'retirement_asset_value', R: 'investment_ror' };
      const askSync = (side, keys) => {
        const from = side === 'c' ? 'trad_' : 'ideal_', to = side === 'c' ? 'ideal_' : 'trad_';
        const ov = modal(ctx, { cls: 'b12-sm', title: ctx.t('sync.t'), html: `${ctx.t('sync.q', { tag: 'p', cls: 'b12-ovl-p' })}<div class="b12-ovl-act"><button type="button" class="st-pill b12-ghost" data-no>${ctx.t('no')}</button><button type="button" class="st-pill" data-yes>${ctx.t('yes')}</button></div>` });
        ov.querySelector('[data-no]').addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; ov.close(); recalc(); });
        ov.querySelector('[data-yes]').addEventListener('click', () => {
          if (EFA.edit && EFA.edit.on) return;
          keys.forEach((k) => CASE.set(to + k, CASE.n(from + k)));
          const other = side === 'c' ? 's' : 'c';
          Object.values(st(ctx).f).forEach((m) => { if (m.key && m.key.indexOf(to) === 0 && m.id.charAt(0) === other) setVal(ctx, m.id, CASE.n(m.key), false); });
          ov.close(); recalc();
        });
      };
      wire(ctx, (id, v) => {
        const side = id.charAt(0), what = id.slice(1);
        if ((side === 'c' || side === 's') && (what === 'T' || what === 'D' || what === 'F')) {
          const b = balanceMix(what, r2(v * 100), { T: r2(val(ctx, side + 'T') * 100), D: r2(val(ctx, side + 'D') * 100), F: r2(val(ctx, side + 'F') * 100) });
          setVal(ctx, side + 'T', b.T / 100); setVal(ctx, side + 'D', b.D / 100); setVal(ctx, side + 'F', b.F / 100);
          S.mixDirty[side] = true; recalc(); return;
        }
        if (id === 'yr') { S.year = Math.max(1, Math.min(S.R ? S.R.N : 1, Math.round(v))); setVal(ctx, 'yr', S.year, false); paintPanels(); return; }
        recalc();
        if ((side === 'c' || side === 's') && PAIR[what]) askSync(side, [PAIR[what]]);
      });
      ctx.on(ctx.$$('[data-mix]'), 'click', (e, n) => { const sd = n.dataset.mix; ctx.$(`[data-body="${sd}"]`).style.display = 'none'; ctx.$(`[data-mixbody="${sd}"]`).style.display = ''; S.mixDirty[sd] = false; });
      ctx.on(ctx.$$('[data-mixok]'), 'click', (e, n) => {
        const sd = n.dataset.mixok;
        ctx.$$(`[data-mixbody="${sd}"] input[data-f]`).forEach((inp) => commitField(ctx, inp.dataset.f, inp, false));
        ctx.$(`[data-mixbody="${sd}"]`).style.display = 'none'; ctx.$(`[data-body="${sd}"]`).style.display = '';
        if (S.mixDirty[sd]) askSync(sd, ['taxable_percentage', 'deferred_percentage', 'free_percentage']);
        S.mixDirty[sd] = false;
      });
      ctx.on(ctx.$('[data-term]'), 'click', () => { if (S.term) return; S.term = true; ctx.$('[data-termbox]').innerHTML = `<span class="b12-cancel">${ctx.t('l.cancel')}</span>`; });
      const adj = ctx.$('[data-adj]');
      adj.addEventListener('change', () => { if (EFA.edit && EFA.edit.on) { adj.checked = !adj.checked; return; } CASE.set('inflation_adjust_income_stream', adj.checked); recalc(); });
      const green = ctx.$('[data-green]');
      green.addEventListener('input', () => { S.green = +green.value; paintPanels(); });
      green.addEventListener('keydown', (e) => e.stopPropagation());
      const auto = ctx.$('[data-auto]');
      const tick = () => {
        if (!S.auto || !S.R) return;
        if (S.year >= S.R.N) { S.auto = false; auto.checked = false; return; }
        S.year++; setVal(ctx, 'yr', S.year, false); paintPanels();
        ctx.timeout(tick, 500);
      };
      auto.addEventListener('change', () => { if (EFA.edit && EFA.edit.on) { auto.checked = !auto.checked; return; } S.auto = auto.checked; if (S.auto) ctx.timeout(tick, 500); });
      const ftxt = ctx.$('[data-ftxt]');
      ftxt.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') ctx.$('[data-filter]').click(); });
      ctx.on(ctx.$('[data-filter]'), 'click', () => {
        const raw = ftxt.value.trim(); if (!raw || !S.R) return;
        const R = S.R, RA = R.cons[0].age, LE = R.cons[R.N - 1].age;
        if (/^\d+$/.test(raw) && +raw >= 1 && +raw <= 10) {
          const k = +raw;
          if (k === 1) S.filter = [LE];
          else if (k === 2) S.filter = [RA, LE];
          else { const sp = Math.round(R.N / (k - 1)); S.filter = [RA]; for (let j = 1; j <= k - 2; j++) S.filter.push(RA + j * sp); S.filter.push(LE); }
        } else {
          raw.split(/[,\s]+/).map((x) => parseInt(x, 10)).filter((x) => isFinite(x)).forEach((a) => { if (S.filter.indexOf(a) < 0) S.filter.push(a); });
        }
        ftxt.value = ''; S.hideAll = false; S.grid = true; applyRows();
      });
      ctx.on(ctx.$('[data-showall]'), 'click', () => { S.filter = []; S.hideAll = false; S.grid = true; applyRows(); });
      ctx.on(ctx.$('[data-hideall]'), 'click', () => { S.filter = []; S.hideAll = true; S.grid = true; applyRows(); });
      ctx.on(ctx.$('[data-view]'), 'click', () => { S.grid = !S.grid; applyRows(); EFA.numify(ctx.el); });
      const sheet = () => {
        const R = S.R || riaEngine(riaInputs()); if (!R) return null;
        const rows = R.cons.map((c, k) => { const s = R.cmsm[k]; return { age: c.age, cg: c.gross, cr: c.rate, ct: c.taxes, cp: c.pp, sg: s.gross, sr: s.rate, st: s.taxes, sp: s.pp, chg: s.chg }; });
        rows.push({ age: ctx.text('ws.total'), cg: R.tot.c.gross, cr: R.tot.c.rate, ct: R.tot.c.taxes, cp: R.tot.c.pp, sg: R.tot.s.gross, sr: R.tot.s.rate, st: R.tot.s.taxes, sp: R.tot.s.pp, chg: R.tot.chg });
        const m = (f, key) => wcol(ctx, f, key), p = (f, key) => wcol(ctx, f, key, 'pct');
        return { heading: ctx.t('ws.title'), size: 'full', rows, filter: false,
          columns: [{ field: 'age', header: ctx.t('ws.age'), type: 'text', align: 'center', width: 80 }, m('cg', 'ws.cg'), p('cr', 'ws.cr'), m('ct', 'ws.ct'), m('cp', 'ws.cp'), m('sg', 'ws.sg'), p('sr', 'ws.sr'), m('st', 'ws.st'), m('sp', 'ws.sp'), p('chg', 'ws.chg')] };
      };
      recalc();
    },
    leave(ctx) { const S = ctx._b12; if (S) S.auto = false; }
  });

  /* =====================================================================================
     QP101. Qualified plans on the money-flow model (js/lib/pem.js): qpf1, qpf2, qpf3
     ===================================================================================== */
  EFA.css('b12-qpf', `
  .stage .b12-qpp { position: absolute; left: 900px; top: 40px; width: 600px; display: grid; gap: 8px; align-content: start; z-index: 4; }
  .stage .b12-qpp .st-h1 { font-size: 52px; margin: 0; }
  .stage .b12-qsub { font: 500 italic 32px/1.2 var(--f-display); color: var(--gold-deep); margin: 12px 0 2px; }
  .stage .b12-qbt { font: 700 22px/1.32 var(--f-body); color: var(--navy); }
  .stage .b12-qlinks { display: grid; gap: 14px; padding: 22px 0 0 54px; }
  .stage .b12-qlk { display: inline-flex; align-items: center; gap: 18px; background: none; border: 0; padding: 0; cursor: pointer; font: 700 27px/1.2 var(--f-body); color: var(--gold-deep); text-align: left; }
  .stage .b12-qlk .l { border-bottom: 2px dotted currentColor; padding-bottom: 2px; }
  .stage .b12-qlk:hover { color: var(--navy); }
  .stage .b12-defer { color: var(--gold-deep); cursor: pointer; border-bottom: 2px dotted currentColor; }
  .stage .b12-defer:hover { color: var(--navy); }
  .stage .b12-qwait { position: absolute; left: 70px; top: 90px; width: 760px; height: 680px; display: grid; place-items: center; }
  `);
  const PEM_WAIT = 'The money-flow model is getting ready.';
  /** lesson frame: the model zoomed on the left, the text panel (.b12-qpp) on the right */
  function qpfMount(ctx, cfg, zoom) {
    ctx.pem = null;
    const L = LIB().pem;
    if (L && L.mount) {
      try {
        ctx.pem = L.mount(ctx, ctx.el, Object.assign({
          scenarioPicker: false, links: false, sliders: false, borrowSource: false,
          frame: { zoom, width: 0.55, expanded: false, panel: '.b12-qpp', expandShows: ['labels', 'lifestyle'], toggle: true }
        }, cfg));
      } catch (e) { console.error(e); ctx.pem = null; }
    }
    if (!ctx.pem) ctx.el.insertAdjacentHTML('beforeend', `<div class="b12-qwait b12-card"><span class="st-eyebrow">${ctx.t('pemWait')}</span></div>`);
  }
  /** set the step's absolute levels at once, then (shortly after) play that step's storyboard */
  function qpfLevels(ctx, levels, story, dir, opts) {
    const p = ctx.pem; if (!p) return;
    if (ctx._qpT) { clearTimeout(ctx._qpT); ctx._qpT = null; }
    try {
      p.stopAll(); p.flowsOff();
      p.set(levels, { ms: 0 });
      if (story) ctx._qpT = ctx.timeout(() => { if (ctx.pem) ctx.pem.play(story, opts); }, dir === 0 ? 30 : 100);
    } catch (e) { console.error(e); }
  }
  const qpfList = (ctx, rows, o) => {
    const B = LIB().bullets;
    const items = rows.map((r) => ({ html: r[0], at: r[1] }));
    return B ? B.list(ctx, items, Object.assign({ boxed: true, text: 'b12-qbt', size: 46, gap: 14 }, o || {}))
      : `<div style="display:grid;gap:14px">${items.map((it) => `<div class="b12-qbt b12-card b12-f b12-qrow" data-at="${it.at}" style="padding:10px 16px">${it.html}</div>`).join('')}</div>`;
  };
  const qpfReveal = (ctx, n) => {
    const B = LIB().bullets;
    if (B) B.reveal(ctx, n); else ctx.$$('.b12-qrow').forEach((r) => ctx.show(r, n >= +r.dataset.at));
  };
  /** step on the view: step 0 = full model; entering step 1 (or a fresh render) = zoomed */
  function qpfView(ctx, n, dir, fullAt0) {
    const p = ctx.pem; if (!p) return;
    try {
      if (fullAt0 && n === 0) p.expand(true);
      else if ((fullAt0 && n === 1) || dir === 0) p.expand(false);
    } catch (e) { console.error(e); }
  }

  EFA.screen('qpf1', {
    title: 'How a qualified plan works: your view and the IRS view',
    steps: 7,
    copy: {
      head: 'How Qualified Plans Work',
      sub1: 'How you see it',
      b1: 'Money goes in before tax, so you pay nothing on it today.',
      b2: 'You think of the whole balance as yours.',
      sub2: 'How the IRS sees it',
      b3: 'Your account is a source of tax it expects to collect later.',
      b4: 'The balance is shared: part of it is yours, and part of it is theirs.',
      pemWait: PEM_WAIT,
      _notes: 'Two people look at the same account and see two different things.\n\n- Step through: the plan fills with pre-tax dollars, then the IRS share appears.\n- Ask: When you look at your statement, do you think of the whole balance as yours?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b12-qpp">
          ${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}
          ${ctx.t('sub1', { tag: 'p', cls: 'b12-qsub b12-f b12-qs1' })}
          ${qpfList(ctx, [[ctx.t('b1'), 2], [ctx.t('b2'), 3]])}
          ${ctx.t('sub2', { tag: 'p', cls: 'b12-qsub b12-f b12-qs2' })}
          ${qpfList(ctx, [[ctx.t('b3'), 5], [ctx.t('b4'), 6]])}
        </div>`;
      qpfMount(ctx, { riskPreTax: 0, riskKeep: 100 }, { fit: ['risk'], pad: 5 });
    },
    step(ctx, n, dir) {
      qpfReveal(ctx, n);
      ctx.show('.b12-qs1', n >= 1); ctx.show('.b12-qs2', n >= 4);
      qpfView(ctx, n, dir, true);
      const live = dir !== 0;
      const story = live ? { 2: 'QPContribution', 5: 'QPTaxes0to40' }[n] : null;
      const lv = { riskPreTax: n >= 3 || (n === 2 && !live) ? 60 : 0, riskKeep: n >= 6 || (n === 5 && !live) ? 60 : 100 };
      qpfLevels(ctx, lv, story, dir);
    }
  });

  EFA.screen('qpf2', {
    title: 'Qualified plans postpone the tax and the tax calculation',
    steps: 6,
    copy: {
      head: 'How Qualified Plans Work',
      sub: 'They do two things',
      aPre: 'They', defer: 'defer', aPost: 'the tax on the money you put in.',
      bPre: 'They', bPost: 'the math on how much tax you will owe.',
      c: 'They postpone the tax on the money you put in.',
      d: 'They postpone the math on how much tax you will owe.',
      e: 'If tax rates are lower when you take the money out, more of it stays with you.',
      f: 'If tax rates are higher, less of it stays with you.',
      lThr: 'Tax Thresholds', lHist: 'Tax History',
      pemWait: PEM_WAIT,
      _notes: 'A qualified plan does not remove the tax. It moves the tax, and the calculation of it, to a future year.\n\n- Click the word defer (or the slide) to restate it plainly.\n- Ask: Do you know what tax rates will be in the year you need this money?\nPAUSE\n\n- Tax Thresholds and Tax History open the supporting screens; Back returns here.'
    },
    render(ctx) {
      const dl = (k) => `<span class="b12-defer" data-defer>${ctx.t('defer')}</span>`;
      ctx.el.innerHTML = `
        <div class="b12-qpp">
          ${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}
          ${ctx.t('sub', { tag: 'p', cls: 'b12-qsub' })}
          <div class="b12-qab">${qpfList(ctx, [[`${ctx.t('aPre')} ${dl()} ${ctx.t('aPost')}`, 1], [`${ctx.t('bPre')} ${dl()} ${ctx.t('bPost')}`, 2]])}</div>
          <div class="b12-qcd">${qpfList(ctx, [[ctx.t('c'), 3], [ctx.t('d'), 3], [ctx.t('e'), 4], [ctx.t('f'), 5]])}</div>
          <div class="b12-qlinks b12-f b12-qlk5">
            <button type="button" class="b12-qlk" data-go="TAX|taxthresholds1">${ICON.calc(54)}<span class="l">${ctx.t('lThr')}</span></button>
            <button type="button" class="b12-qlk" data-go="TAXHIST|taxhist1">${ICON.calc(54)}<span class="l">${ctx.t('lHist')}</span></button>
          </div>
        </div>`;
      qpfMount(ctx, { riskPreTax: 60, riskKeep: 60 }, { fit: ['risk'], pad: 5 });
      ctx.on(ctx.$$('[data-defer]'), 'click', () => ctx.next());
      ctx.on(ctx.$$('[data-go]'), 'click', (e, b) => { const [k, s] = b.dataset.go.split('|'); ctx.jump(k, s); });
    },
    step(ctx, n, dir) {
      qpfReveal(ctx, n);
      ctx.$('.b12-qab').style.display = n < 3 ? '' : 'none';
      ctx.$('.b12-qcd').style.display = n >= 3 ? '' : 'none';
      ctx.show('.b12-qlk5', n >= 5);
      qpfView(ctx, n, dir, false);
      const live = dir !== 0;
      const keep = live ? [60, 60, 60, 60, 60, 80][n] : [60, 60, 60, 60, 80, 40][n];
      qpfLevels(ctx, { riskPreTax: 60, riskKeep: keep }, live ? { 4: 'QPTaxes40to20', 5: 'QPTaxes20to60' }[n] : null, dir);
    }
  });

  /** current early-distribution and RMD rules from EFA.data.rmd (null while being verified) */
  function qpRules() {
    const R = EFA.data && EFA.data.rmd;
    if (!R || !R.earlyDistribution || !R.missedRmdExcise || !Array.isArray(R.startAge) || !R.startAge.length) return null;
    const last = R.startAge[R.startAge.length - 1], prev = R.startAge[R.startAge.length - 2] || last;
    return {
      earlyAge: R.earlyDistribution.age, earlyTax: R.earlyDistribution.additionalTax,
      rmdAge: prev.age, rmdAgeLater: last.age, laterBorn: last.bornFrom ? +String(last.bornFrom).slice(0, 4) : null,
      excise: R.missedRmdExcise.rate, exciseFixed: R.missedRmdExcise.correctedRate
    };
  }
  const ageTxt = (a) => (Math.abs(a % 1 - 0.5) < 1e-9 ? Math.floor(a) + '½' : String(a));

  EFA.screen('qpf3', {
    title: 'Qualified plans: things to consider',
    steps: 6,
    copy: {
      head: 'Things to Consider',
      b1: 'An employer match adds to what goes in each year (matches can be subject to a vesting schedule).',
      b2: 'Matched dollars are taxed on the way out too, yet they can cover much of that future tax.',
      b3: 'The money is largely locked up until retirement.',
      b4a: 'Take money out before age', b4b: 'and you generally owe an extra', b4c: 'tax on top of income tax.',
      b5a: 'Required distributions start at age', b5b: ', or', b5c: 'if you were born in', b5d: 'or later. A missed one can cost', b5e: 'of the shortfall,', b5f: 'if corrected in time.',
      verify: 'Current IRS figures are being verified.',
      pemWait: PEM_WAIT,
      _notes: 'The match is real money, and it is worth taking. It also comes with rules about when and how you can reach it.\n\n- Each click adds one point; watch the plan tank.\n- Ask: If an emergency hit before retirement, which of your accounts could you reach without a penalty?\nPAUSE'
    },
    render(ctx) {
      const R = qpRules();
      const n = (s) => `<span class="num">${s}</span>`;
      const b4 = R ? `${ctx.t('b4a')} ${n(ageTxt(R.earlyAge))} ${ctx.t('b4b')} ${n(pctT(R.earlyTax))} ${ctx.t('b4c')}` : ctx.t('verify');
      const b5 = R ? `${ctx.t('b5a')} ${n(ageTxt(R.rmdAge))}${ctx.t('b5b')} ${n(ageTxt(R.rmdAgeLater))} ${ctx.t('b5c')} ${n(R.laterBorn)} ${ctx.t('b5d')} ${n(pctT(R.excise))} ${ctx.t('b5e')} ${n(pctT(R.exciseFixed))} ${ctx.t('b5f')}` : ctx.t('verify');
      ctx.el.innerHTML = `
        <div class="b12-qpp" style="top:46px">
          ${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}
          <div style="height:14px"></div>
          ${qpfList(ctx, [[ctx.t('b1'), 1], [ctx.t('b2'), 2], [ctx.t('b3'), 3], [b4, 4], [b5, 5]], { gap: 12 })}
        </div>
        ${discLine(ctx, ['notAdvice'], 'left:900px;right:110px;bottom:70px')}`;
      qpfMount(ctx, { riskPreTax: 60, riskKeep: 60, showBorrowed: false, showHouse: false }, { scale: 1.1, shift: [-22, -5] });
    },
    step(ctx, n, dir) {
      qpfReveal(ctx, n);
      qpfView(ctx, n, dir, false);
      const p = ctx.pem; if (!p) return;
      const live = dir !== 0;
      const level = n === 0 ? 60 : n === 1 ? (live ? 60 : 70) : n === 5 ? (live ? 70 : 10) : 70;
      qpfLevels(ctx, { riskPreTax: level, riskKeep: 60, lock: n >= 3 }, live ? { 1: 'QPCompanyMatch', 5: 'QPTaxableDistribution' }[n] : null, dir, n === 5 ? { from: false } : undefined);
      try {
        p.unhighlight();
        const H = { 1: { left: 26.6, top: 34.5, w: 8.2, h: 3 }, 2: { left: 34, top: 34.5, w: 3.2, h: 8 }, 3: { left: 36.5, top: 56, w: 4.5, h: 5.5 } }[n];
        if (H) p.highlight(H, { wink: true, delay: n === 1 ? 2000 : 0 });
      } catch (e) { console.error(e); }
    }
  });

  /* =====================================================================================
     TAXHIST. History of the top federal income tax rate (taxhist1)
     ===================================================================================== */
  const TH_EVENTS = [[1914, 'ev1914'], [1929, 'ev1929'], [1934, 'ev1934'], [1941, 'ev1941'], [1942, 'ev1942'], [1944, 'ev1944'], [1950, 'ev1950'], [1955, 'ev1955'],
    [1961, 'ev1961'], [1981, 'ev1981'], [1990, 'ev1990'], [1993, 'ev1993'], [2019, 'ev2019'], [0, 'evLast']];
  const TH_ERAS = [1920, 1927, 1933, 1937, 1944, 1958, 1975, 1983, 1989, 1996, 2007];
  EFA.css('b12-th', `
  .stage .b12-th-top { position: absolute; left: 110px; right: 110px; top: 26px; display: grid; justify-items: center; gap: 10px; text-align: center; }
  .stage .b12-th-top .st-h2 { font-size: 50px; margin: 0; }
  .stage .b12-th-avg { min-height: 46px; display: grid; place-items: center; }
  .stage .st-pill.b12-th-avgb { min-height: 44px; padding: 0 30px; font-size: 18px; }
  .stage .b12-th-al { font: 700 24px/1.2 var(--f-body); }
  .stage .b12-th-cmp { font: 600 19px/1.3 var(--f-body); color: var(--navy); min-height: 24px; }
  .stage .b12-th-chart { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; pointer-events: none; overflow: visible; }
  .stage .b12-th-hit { position: absolute; top: 190px; height: 420px; }
  .stage .b12-th-era { position: absolute; transform: translate(-50%, -100%); font: 700 13px/1 var(--f-body); color: var(--navy-4); white-space: nowrap; pointer-events: none; }
  .stage .b12-th-ev { position: absolute; transform: translate(-50%, -100%); width: 22px; height: 22px; cursor: help; }
  .stage .b12-th-tip { position: absolute; z-index: 9; pointer-events: none; padding: 9px 14px; border-radius: 10px; background: var(--navy); color: var(--cream); font: 700 18px/1.25 var(--f-body); white-space: nowrap; box-shadow: 0 10px 24px rgba(13,30,58,.25); transform: translate(-50%, -100%); }
  .stage .b12-th-sl { position: absolute; left: 96px; top: 190px; width: 40px; height: 400px; cursor: pointer; touch-action: none; }
  .stage .b12-th-sl .tr { position: absolute; left: 17px; top: 0; bottom: 0; width: 6px; border-radius: 3px; background: var(--mist-2); }
  .stage .b12-th-sl .fl { position: absolute; left: 17px; bottom: 0; width: 6px; border-radius: 3px; background: var(--gold); }
  .stage .b12-th-sl .th { position: absolute; left: 6px; width: 28px; height: 28px; margin-top: -14px; border-radius: 50%; background: #fff; border: 3px solid var(--gold); box-shadow: 0 4px 10px rgba(13,30,58,.25); box-sizing: border-box; }
  .stage .b12-th-sl:focus { outline: none; }
  .stage .b12-th-sl:focus .th { box-shadow: 0 0 0 4px rgba(184,151,46,.3); }
  .stage .b12-th-bot { position: absolute; left: 110px; right: 110px; top: 660px; display: grid; grid-template-columns: 1fr 2fr 2fr; gap: 26px; align-items: start; }
  .stage .b12-th-l { display: grid; gap: 12px; padding-top: 8px; }
  .stage .b12-th-l label { display: flex; align-items: center; gap: 10px; font: 600 20px/1.2 var(--f-body); color: var(--navy); cursor: pointer; }
  .stage .b12-th-l input { width: 20px; height: 20px; accent-color: var(--gold); }
  .stage .b12-th-l a, .stage .b12-th-l button { justify-self: start; }
  .stage .b12-th-m { padding: 16px 24px; display: grid; gap: 10px; }
  .stage .b12-th-m .r { display: flex; align-items: center; justify-content: space-between; gap: 14px; font: 700 22px/1.2 var(--f-body); color: var(--navy); }
  .stage .b12-th-m .b12-in { width: 200px; }
  .stage .b12-th-m .br { display: flex; align-items: baseline; gap: 10px; font: 700 22px/1.2 var(--f-body); color: var(--navy); }
  .stage .b12-th-r { padding: 16px 26px; display: grid; gap: 10px; }
  .stage .b12-th-r .r { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 18px; }
  .stage .b12-th-r .v { text-align: right; font: 700 34px/1.1 var(--f-body); color: var(--navy); }
  .stage .b12-th-r .v.irs { color: ${RED}; }
  .stage .b12-th-r .k { font: 600 22px/1.2 var(--f-body); color: var(--navy); min-width: 130px; }
  .stage .b12-th-src p { margin: 0 0 14px; }
  .stage .b12-th-note { position: absolute; left: 110px; right: 330px; bottom: 18px; margin: 0; }
  `);
  /** series from EFA.data.history (null while being verified) */
  function thData() {
    const H = EFA.data && EFA.data.history;
    if (!H || !Array.isArray(H.topMarginalRate) || !H.topMarginalRate.length) return null;
    const rates = H.topMarginalRate.slice().sort((a, b) => a[0] - b[0]);
    const over = {};
    (H.taxBrackets || []).forEach((r) => { if (r && r.year) over[r.year] = r.topOver; });
    const pts = rates.map(([y, r]) => ({ y, r: Math.round(r * 10000) / 100, over: over[y] }));
    const avg = Math.round(rates.reduce((t, x) => t + x[1], 0) / rates.length * 10000) / 100;
    return { pts, avg };
  }
  EFA.engines.taxHistory = {
    data: thData,
    shares(balance, ratePct) { const irs = balance * ratePct / 100; return { irs, yours: balance - irs }; },
    /** relative change of a rate against the client's bracket b (both in percent), as the spec rounds it */
    compare(rate, b) { if (!(b > 0) || rate === b) return null; const q = Math.round(rate / b * 100) / 100; return b < rate ? { up: true, by: q - 1 } : { up: false, by: 1 - q }; }
  };
  EFA.screen('taxhist1', {
    title: 'History of the top federal income tax rate',
    copy: {
      head: 'Top Federal Tax Brackets',
      avgBtn: 'Average', avgA: 'The average top rate is',
      cmpA: 'That average is', up: 'higher than', down: 'lower than', cmpB: 'your current bracket.',
      midA: 'That rate is', midB: 'your bracket of',
      events: 'Show Events', clock: 'Debt Clock', source: 'Source',
      bal: 'Account Balance', bracket: 'Tax Bracket:', yours: 'Your Share', irs: 'IRS Share',
      tipA: 'over', tipB: 'in',
      ev1914: 'World War I begins', ev1929: 'Stock market crash', ev1934: 'The Great Depression', ev1941: 'Top bracket threshold changes',
      ev1942: 'Threshold changes again', ev1944: 'World War II', ev1950: 'Korean War', ev1955: 'Vietnam War', ev1961: 'Kennedy-era tax change',
      ev1981: 'Reagan-era tax change', ev1990: 'Gulf War', ev1993: 'Clinton-era tax change', ev2019: 'COVID-19 pandemic',
      evLast: 'What comes next: rates, thresholds and deductions can all change',
      srcT: 'Tax Rates Change',
      srcP1: 'Rates for 1913 through 2008 come from the IRS Statistics of Income historical table of highest bracket rates. Later years come from the IRS yearly tax rate schedules.',
      srcP2: 'The definition of taxable income has changed many times, so treat this screen as a concept tool rather than a precise comparison across years.',
      ok: 'Ok',
      note: 'Concept illustration only. The split assumes the whole balance is taxed at one rate. It is not a forecast of future tax rates.',
      verify: 'Historical tax figures are being verified.',
      _notes: 'Today\'s top rate is low by historical standards. For most of the last hundred years it was far higher.\n\n- Drag the slider to try a future rate and watch the IRS share of the balance.\n- Ask: Where do you think tax rates are heading from here?\nPAUSE\n\n- Tax Bracket opens the estimator; its result comes back here as your own bracket line.'
    },
    render(ctx) {
      const S = st(ctx), D = thData();
      const back = takeJump(ctx) || {};
      S.th = { slider: back.slider || 0, avgShown: !!back.avgShown, events: !!back.events, b: back.b != null ? back.b : null };
      if (back.wentTo === 'tax' && EFA.handoff && EFA.handoff.taxRate != null) {
        S.th.b = Math.round(Number(EFA.handoff.taxRate) * 100) / 100; S.th.slider = Math.max(0, Math.min(100, Math.round(S.th.b)));
        EFA.handoff.taxRate = null; if (EFA.clients) EFA.clients.set('_handoff', 'taxRate', null);
      }
      const X0 = 200, X1 = 1490, Y0 = 590, Y1 = 190;
      const yOf = (v) => Y0 - (Y0 - Y1) * v / 100;
      ctx.el.innerHTML = `
        <div class="b12-th-top">
          ${ctx.t('head', { tag: 'h2', cls: 'st-h2' })}
          <div class="b12-th-avg" data-avgw></div>
          <div class="b12-th-cmp" data-cmptop></div>
        </div>
        ${D ? '' : `<div class="b12-load b12-card" style="left:200px;top:190px;width:1290px;height:400px"><span class="st-eyebrow">${ctx.t('verify')}</span></div>`}
        <svg class="b12-th-chart" viewBox="0 0 1600 900" aria-hidden="true" data-svg></svg>
        <div data-marks></div>
        <div class="b12-th-hit" data-hit style="left:${X0}px;width:${X1 - X0}px"></div>
        <div class="b12-th-sl" data-sl tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100"><div class="tr"></div><div class="fl"></div><div class="th"></div></div>
        <div class="b12-th-bot">
          <div class="b12-th-l">
            <label>${'<input type="checkbox" data-evt>'}${ctx.t('events')}</label>
            <a class="b12-link" href="https://www.usdebtclock.org" target="_blank" rel="noopener noreferrer">${ctx.t('clock')}</a>
            <button type="button" class="b12-link" data-src>${ctx.t('source')}</button>
          </div>
          <div class="b12-th-m b12-card">
            <div class="r">${ctx.t('bal')}${fld(ctx, { id: 'bal', key: 'account_balance', type: 'money', min: 0, label: 'bal' })}</div>
            <div class="br"><span class="b12-a" data-go="tax">${ctx.t('bracket')}</span><span class="num" data-out="br"></span></div>
            <div class="b12-th-cmp" data-cmpmid style="text-align:left;font-size:18px"></div>
          </div>
          <div class="b12-th-r b12-card">
            <div class="r"><span class="v" data-out="yours"></span><span class="k">${ctx.t('yours')}</span></div>
            <div class="r"><span class="v irs" data-out="irs"></span><span class="k"><span class="b12-a" data-go="irs">${ctx.t('irs')}</span></span></div>
          </div>
        </div>
        <p class="st-disclaimer b12-th-note">${ctx.t('note')}</p>
        <div class="b12-th-tip" data-tip hidden></div>`;
      const svg = ctx.$('[data-svg]'), marks = ctx.$('[data-marks]'), tip = ctx.$('[data-tip]');
      const n = D ? D.pts.length : 0, bw = n ? (X1 - X0) / n : 0;
      const xOf = (i) => X0 + i * bw;
      const draw = () => {
        const T = S.th;
        let g = '';
        for (let v = 0; v <= 100; v += 10) g += `<line x1="${X0}" x2="${X1}" y1="${yOf(v)}" y2="${yOf(v)}" stroke="${P.rule}" stroke-width="1"/>`;
        if (D) {
          D.pts.forEach((p, i) => { if (p.y % 20 === 0) g += `<line x1="${xOf(i) + bw / 2}" x2="${xOf(i) + bw / 2}" y1="${Y1}" y2="${Y0}" stroke="${P.rule}" stroke-width="1"/>`; });
          D.pts.forEach((p, i) => { const y = yOf(p.r); g += `<rect x="${xOf(i).toFixed(2)}" y="${y.toFixed(2)}" width="${(bw + 0.4).toFixed(2)}" height="${(Y0 - y).toFixed(2)}" fill="${P.navy3}"/>`; });
          if (T.avgShown) g += `<line x1="${X0}" x2="${X1}" y1="${yOf(D.avg)}" y2="${yOf(D.avg)}" stroke="${P.navy}" stroke-width="3" stroke-dasharray="10 6"/>`;
        }
        if (T.b != null) g += `<line x1="${X0}" x2="${X1}" y1="${yOf(T.b)}" y2="${yOf(T.b)}" stroke="${P.steel}" stroke-width="3"/>`;
        g += `<line x1="${X0}" x2="${X1}" y1="${yOf(T.slider)}" y2="${yOf(T.slider)}" stroke="${P.gold}" stroke-width="3"/>`;
        g += `<line x1="${X0}" x2="${X1}" y1="${Y0}" y2="${Y0}" stroke="${P.navy}" stroke-width="2"/>`;
        svg.innerHTML = g;
        // axis labels, era labels and event markers are HTML over the chart
        let h = '';
        for (let v = 0; v <= 100; v += 10) h += `<div class="b12-abs num" style="left:${X0 - 58}px;top:${yOf(v) - 11}px;width:48px;text-align:right;font:700 18px/1 var(--f-body);color:var(--navy)">${v}</div>`;
        if (D) {
          D.pts.forEach((p, i) => { if (p.y % 20 === 0) h += `<div class="b12-abs num" style="left:${xOf(i) + bw / 2 - 40}px;top:${Y0 + 10}px;width:80px;text-align:center;font:700 19px/1 var(--f-body);color:var(--navy)">${p.y}</div>`; });
          const evIdx = T.events ? TH_EVENTS.map(([y]) => (y ? D.pts.findIndex((p) => p.y === y) : n - 1)).filter((i) => i >= 0) : [];
          TH_ERAS.forEach((y) => {
            const i = D.pts.findIndex((p) => p.y === y); if (i < 0) return;
            if (evIdx.some((j) => Math.abs(j - i) <= 3)) return;
            h += `<div class="b12-th-era num" style="left:${xOf(i) + bw / 2}px;top:${yOf(D.pts[i].r) - 6}px">${Math.round(D.pts[i].r)}</div>`;
          });
          if (T.events) TH_EVENTS.forEach(([y, k]) => {
            const i = y ? D.pts.findIndex((p) => p.y === y) : n - 1; if (i < 0) return;
            h += `<div class="b12-th-ev" data-ev="${k}" style="left:${xOf(i) + bw / 2}px;top:${yOf(D.pts[i].r) - 4}px">${ICON.question(22)}</div>`;
          });
        }
        marks.innerHTML = h;
        ctx.$$('[data-ev]').forEach((m) => {
          m.addEventListener('mouseenter', () => { tip.innerHTML = ctx.t(m.dataset.ev); tip.hidden = false; tip.style.left = m.style.left; tip.style.top = (parseFloat(m.style.top) - 28) + 'px'; });
          m.addEventListener('mouseleave', () => { tip.hidden = true; });
        });
        // slider
        const sl = ctx.$('[data-sl]');
        sl.querySelector('.th').style.top = (400 - 4 * T.slider) + 'px';
        sl.querySelector('.fl').style.height = (4 * T.slider) + 'px';
        sl.setAttribute('aria-valuenow', T.slider);
        // average control
        const aw = ctx.$('[data-avgw]');
        aw.innerHTML = T.avgShown && D ? `<span class="b12-th-al">${ctx.t('avgA')} <span class="b12-a" data-go="avg">${N(nf(0, 2).format(D.avg) + '%')}</span></span>` : (D ? `<button type="button" class="st-pill b12-th-avgb" data-avg>${ctx.t('avgBtn')}</button>` : '');
        const ab = ctx.$('[data-avg]'); if (ab) ab.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; S.th.avgShown = true; draw(); });
        const al = ctx.$('[data-go="avg"]'); if (al) al.addEventListener('click', () => go('avg'));
        // comparisons
        const cT = D && T.b != null && T.avgShown ? EFA.engines.taxHistory.compare(D.avg, T.b) : null;
        ctx.$('[data-cmptop]').innerHTML = cT ? `${ctx.t('cmpA')} ${N(pctT(cT.by))} ${ctx.t(cT.up ? 'up' : 'down')} ${ctx.t('cmpB')}` : '';
        const cM = T.b != null ? EFA.engines.taxHistory.compare(T.slider, T.b) : null;
        ctx.$('[data-cmpmid]').innerHTML = cM ? `${ctx.t('midA')} ${N(pctT(cM.by))} ${ctx.t(cM.up ? 'up' : 'down')} ${ctx.t('midB')} ${N(pctT(T.b / 100))}.` : '';
        shares();
      };
      const shares = () => {
        const B = val(ctx, 'bal') || 0, s = EFA.engines.taxHistory.shares(B, S.th.slider);
        setOut(ctx, 'br', pctT(S.th.slider / 100)); setOut(ctx, 'yours', N(money(s.yours))); setOut(ctx, 'irs', N(money(s.irs)));
      };
      const go = (where) => {
        const T = S.th;
        const state = { slider: T.slider, avgShown: T.avgShown, events: T.events, b: T.b, wentTo: where };
        if (where === 'avg') jumpTo(ctx, 'TAX', 'taxthresholds1', state);
        else if (where === 'tax') jumpTo(ctx, 'INCTAXC', 'incTax1', state);
        else jumpTo(ctx, 'GI', 'gi1', state);
      };
      ctx.on(ctx.$$('[data-go="tax"], [data-go="irs"]'), 'click', (e, el) => go(el.dataset.go));
      // slider drag and keys
      const sl = ctx.$('[data-sl]');
      const fromY = (cy) => { const r = sl.getBoundingClientRect(); const v = Math.round(100 * (1 - (cy - r.top) / r.height)); return Math.max(0, Math.min(100, v)); };
      let drag = false;
      sl.addEventListener('pointerdown', (e) => { if (EFA.edit && EFA.edit.on) return; drag = true; sl.setPointerCapture(e.pointerId); S.th.slider = fromY(e.clientY); draw(); });
      sl.addEventListener('pointermove', (e) => { if (!drag) return; const v = fromY(e.clientY); if (v !== S.th.slider) { S.th.slider = v; draw(); } });
      sl.addEventListener('pointerup', () => { drag = false; });
      sl.addEventListener('keydown', (e) => {
        const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
        if (!d) return; e.preventDefault(); e.stopPropagation(); S.th.slider = Math.max(0, Math.min(100, S.th.slider + d)); draw();
      });
      // bar tooltips
      const hit = ctx.$('[data-hit]');
      if (D) {
        hit.addEventListener('mousemove', (e) => {
          const r = hit.getBoundingClientRect(), sc = r.width / (X1 - X0);
          const i = Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left) / sc / bw))), p = D.pts[i];
          tip.innerHTML = `${N(nf(0, 2).format(p.r) + '%')} ${p.over != null ? `${ctx.t('tipA')} ${N(money(p.over))} ` : ''}${ctx.t('tipB')} ${N(p.y)}`;
          tip.hidden = false; tip.style.left = (xOf(i) + bw / 2) + 'px'; tip.style.top = (yOf(p.r) - 12) + 'px';
        });
        hit.addEventListener('mouseleave', () => { tip.hidden = true; });
      }
      const evt = ctx.$('[data-evt]'); evt.checked = S.th.events;
      evt.addEventListener('change', () => { S.th.events = evt.checked; draw(); });
      ctx.on(ctx.$('[data-src]'), 'click', () => {
        const ov = modal(ctx, { cls: 'b12-th-src', title: ctx.t('srcT'), html: `<p class="b12-ovl-p">${ctx.t('srcP1')}</p><p class="b12-ovl-p" style="margin-top:14px">${ctx.t('srcP2')}</p><div class="b12-ovl-act"><button type="button" class="st-pill" data-ok>${ctx.t('ok')}</button></div>` });
        const ok = ov.querySelector('[data-ok]'); if (ok) ok.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; ov.close(); });
      });
      wire(ctx, () => shares());
      draw();
    }
  });

  /* =====================================================================================
     RIP. Retirement income predictability: rip1 (market), rip2 (+ compounding), rip3 (+ indexed)
     ===================================================================================== */
  /** markets with data loaded (EFA.data.history.markets) */
  function ripMarkets() {
    const H = EFA.data && EFA.data.history;
    if (!H || !Array.isArray(H.markets)) return [];
    return H.markets.filter((m) => Array.isArray(H[m.series]) && H[m.series].length);
  }
  function ripSeries(code) { const H = EFA.data.history; return (H[code] || []).slice().sort((a, b) => a[0] - b[0]); }
  /** returns for start .. start + Y (clamped to the data), padded cyclically to Y + 1 values */
  function ripSelect(code, start, Y) {
    const s = ripSeries(code); if (!s.length || !(Y >= 0)) return null;
    const a = Math.max(start, s[0][0]);
    const sel = s.filter(([y]) => y >= a && y <= a + Y).map((x) => x[1]);
    if (!sel.length) return null;
    const base = sel.slice(); let i = 0;
    while (sel.length < Y + 1) { sel.push(base[i % base.length]); i++; }
    return sel;
  }
  /** one protected run (rip2 bucket rules). w, g (market), q (safe growth) are per-year arrays */
  function ripBuckets(A, w, g, q, s, thr, red) {
    let R = A * (1 - s), S = A * s, cum = 0; const out = [];
    for (let k = 0; k < w.length; k++) {
      const W = w[k], gk = g[k], qk = q[k];
      const wr = gk >= thr ? W * (1 - s) : W * (1 - s) * (1 - red), ws = W - wr;
      let tR = 0, tS = 0;
      if (R + S >= W) {
        if (R >= wr && S >= ws) { tR = wr; tS = ws; R = (R - wr) * (1 + gk); S = (S - ws) * (1 + qk); }
        else if (R >= wr) { const Sb = S; tS = Sb; S = 0; const need = wr + (ws - Sb); if (R >= need) { tR = need; R = (R - need) * (1 + gk); } else { tR = R; R = 0; } }
        else { const Rb = R; tR = Rb; R = 0; const need = ws + (wr - Rb); if (S >= need) { tS = need; S = (S - need) * (1 + qk); } else { tS = S; S = 0; } }
      } else { tR = R; tS = S; R = 0; S = 0; }
      cum += tR + tS;
      out.push({ R, S, T: R + S, wR: tR, wS: tS, cum });
    }
    return { rows: out, total: cum + R + S };
  }
  /** the full RIP engine. v: {A, RA, LE, wr, inf, code, start, shield, thr, s, q, ceil:[on,v], part:[on,v], floor:[on,v]} (fractions) */
  function ripRun(v) {
    const Y = Math.round(v.LE - v.RA);
    if (!(Y >= 0)) return null;
    const ret = ripSelect(v.code, v.start, Y); if (!ret) return null;
    const n = ret.length, avg = ret.reduce((t, x) => t + x, 0) / n;
    const w = []; let wk = v.A * v.wr;
    for (let k = 0; k < n; k++) { w.push(wk); wk *= 1 + v.inf; }
    const ord = { F: ret, I: ret.slice().reverse(), A: ret.map(() => avg) };
    const mkt = {}, mTot = {};
    ['F', 'I', 'A'].forEach((o) => {
      let X = v.A, c = 0; const rows = [];
      for (let k = 0; k < n; k++) { if (X > w[k]) { c += w[k]; X = (X - w[k]) * (1 + ord[o][k]); } else { c += X; X = 0; } rows.push({ X, c }); }
      mkt[o] = rows; mTot[o] = c + X;
    });
    const thr = v.shield ? v.thr : 0, red = v.shield ? 1 : 0;
    const comp = {}, cTot = {};
    ['F', 'I', 'A'].forEach((o) => { const r = ripBuckets(v.A, w, ord[o], ord[o].map(() => v.q), v.s, thr, red); comp[o] = r.rows; cTot[o] = r.total; });
    const credit = (g0) => {
      let g = g0;
      if (v.floor[0] && g < v.floor[1]) g = v.floor[1];
      if (v.part[0] && g > 0) g = g * v.part[1];
      if (v.ceil[0] && g > v.ceil[1]) g = v.ceil[1];
      return g;
    };
    const cr = ret.map(credit), avgC = cr.reduce((t, x) => t + x, 0) / n;
    const cord = { F: cr, I: cr.slice().reverse(), A: cr.map(() => avgC) };
    const idx = {}, iTot = {};
    ['F', 'I', 'A'].forEach((o) => { const r = ripBuckets(v.A, w, ord[o], cord[o], v.s, thr, red); idx[o] = r.rows; iTot[o] = r.total; });
    const rows = [];
    for (let k = 0; k < n; k++) rows.push({ age: v.RA + k, w: w[k], g: { F: ord.F[k], I: ord.I[k], A: avg }, c: { F: cord.F[k], I: cord.I[k], A: avgC }, mkt: { F: mkt.F[k], I: mkt.I[k], A: mkt.A[k] }, comp: { F: comp.F[k], I: comp.I[k], A: comp.A[k] }, idx: { F: idx.F[k], I: idx.I[k], A: idx.A[k] } });
    return { n, avg, avgC, first: w[0], rows, tot: { mkt: mTot, comp: cTot, idx: iTot } };
  }
  EFA.engines.rip = { select: ripSelect, buckets: ripBuckets, run: ripRun, markets: ripMarkets };

  EFA.css('b12-rip', `
  .stage .b12-rp-card { position: absolute; left: 60px; top: 40px; width: 440px; padding: 8px 0 10px; }
  .stage .b12-rp-card h3 { margin: 6px 0 6px; text-align: center; font: 600 32px/1.1 var(--f-display); color: var(--navy); }
  .stage .b12-rp-r { display: grid; grid-template-columns: 1fr 160px; align-items: center; gap: 10px; padding: 0 20px; height: var(--rh, 52px); border-top: 1px solid var(--line); }
  .stage .b12-rp-r .k { font: 600 19px/1.15 var(--f-body); color: var(--navy); display: flex; align-items: center; gap: 4px; white-space: nowrap; }
  .stage .b12-rp-r .b12-in { width: 160px; height: 38px; font-size: 19px; padding: 0 10px; }
  .stage .b12-rp-r select { width: 160px; height: 38px; border: 1.5px solid var(--mist-2); border-radius: 10px; background: #fff; font: 600 16px/1 var(--f-body); color: var(--navy); padding: 0 6px; }
  .stage .b12-rp-r.y { background: var(--gold-pale); }
  .stage .b12-rp-r.gr { background: #e3efe6; }
  .stage .b12-rp-r input[type=checkbox] { width: 22px; height: 22px; accent-color: var(--navy); margin-right: 6px; }
  .stage .b12-rp-r .ck { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
  .stage .b12-rp-r .ck .b12-in { width: 110px; }
  .stage .b12-rp-split { display: grid; grid-template-columns: 1fr 34px 34px 1fr; height: var(--rh, 52px); border-top: 1px solid var(--line); }
  .stage .b12-rp-split > div { display: flex; align-items: center; justify-content: center; }
  .stage .b12-rp-split .y { background: var(--gold-pale); } .stage .b12-rp-split .gr { background: #e3efe6; }
  .stage .b12-rp-split .b12-in { width: 130px; height: 38px; font-size: 19px; text-align: center; }
  .stage .b12-rp-btns { position: absolute; left: 60px; width: 440px; display: flex; justify-content: center; gap: 22px; align-items: center; }
  .stage .b12-rp-btns .b12-doc { position: static; }
  .stage .b12-rp-btns .st-pill { min-height: 46px; font-size: 17px; padding: 0 24px; }
  .stage .b12-rp-info { position: absolute; left: 540px; right: 60px; top: 40px; height: 54px; display: flex; align-items: center; justify-content: center; gap: 40px; font: 700 22px/1 var(--f-body); color: var(--navy); }
  .stage .b12-rp-info .num { color: var(--gold-deep); }
  .stage .b12-rp-chart { position: absolute; left: 540px; top: 106px; width: 1000px; height: 500px; }
  .stage .b12-rp-chart > svg { position: absolute; left: 0; top: 0; }
  .stage .b12-rp-db svg, .stage .b12-rp-legend svg { position: static; flex: 0 0 auto; }
  .stage .b12-rp-legend { position: absolute; right: 18px; top: 8px; display: grid; gap: 4px; padding: 10px 14px; background: rgba(255,253,248,.94); border: 1px solid var(--rule); border-radius: 12px; box-shadow: 0 8px 20px rgba(13,30,58,.08); }
  .stage .b12-rp-legend .li { display: flex; align-items: center; gap: 10px; font: 700 15px/1.2 var(--f-body); color: var(--navy); cursor: pointer; }
  .stage .b12-rp-legend .li.off { opacity: .4; }
  .stage .b12-rp-cks { position: absolute; left: 96px; bottom: 58px; display: grid; gap: 6px; padding: 8px 12px; background: rgba(255,253,248,.92); border: 1px solid var(--rule); border-radius: 12px; }
  .stage .b12-rp-cks .rw { display: flex; align-items: center; gap: 14px; font: 700 14px/1 var(--f-body); color: var(--muted); letter-spacing: .08em; text-transform: uppercase; }
  .stage .b12-rp-cks .rw > span:first-child { width: 120px; }
  .stage .b12-rp-cks label { display: flex; align-items: center; gap: 6px; cursor: pointer; font: 700 14px/1 var(--f-body); color: var(--navy); letter-spacing: 0; text-transform: none; }
  .stage .b12-rp-cks input { width: 18px; height: 18px; accent-color: var(--gold); margin: 0; }
  .stage .b12-rp-tbl { position: absolute; left: 540px; top: 106px; width: 1000px; height: 500px; overflow: auto; }
  .stage .b12-rp-tbl table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .stage .b12-rp-tbl th { position: sticky; top: 0; background: var(--navy); color: var(--cream); font: 700 12.5px/1.2 var(--f-body); letter-spacing: .1em; text-transform: uppercase; padding: 12px 10px; text-align: right; }
  .stage .b12-rp-tbl th:first-child, .stage .b12-rp-tbl td:first-child { text-align: center; }
  .stage .b12-rp-tbl td { padding: 8px 10px; text-align: right; font: 600 17px/1.1 var(--f-body); color: var(--navy); border-top: 1px solid var(--line); }
  .stage .b12-rp-tbl tbody tr:nth-child(even) td { background: rgba(227,232,240,.45); }
  .stage .b12-rp-tot { position: absolute; left: 620px; width: 840px; top: 622px; padding: 4px 0; }
  .stage .b12-rp-tot table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .stage .b12-rp-tot th { font: 700 14px/1 var(--f-body); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); text-align: right; padding: 12px 22px 8px; }
  .stage .b12-rp-tot td { font: 700 22px/1 var(--f-body); color: var(--navy); text-align: right; padding: 0 22px; height: 46px; border-top: 1px solid var(--line); }
  .stage .b12-rp-tot td:first-child, .stage .b12-rp-tot th:first-child { text-align: left; font-size: 18px; width: 34%; }
  .stage .b12-rp-tot tr.hl td { background: var(--gold-pale); }
  .stage .b12-rp-db { position: absolute; display: flex; align-items: center; gap: 10px; padding: 8px 16px 8px 8px; border-radius: 14px; background: #e3efe6; border: 1.5px solid #6a9a78; font: 700 15px/1.15 var(--f-body); color: #2c5a3a; }
  .stage .b12-rp-tip { position: absolute; z-index: 6; pointer-events: none; padding: 10px 14px; border-radius: 10px; background: var(--navy); color: var(--cream); font: 600 15px/1.45 var(--f-body); white-space: nowrap; box-shadow: 0 10px 24px rgba(13,30,58,.25); }
  .stage .b12-rp-tip b { color: var(--gold-lt, #d5bd68); }
  .stage .b12-rp-disc { position: absolute; left: 540px; right: 330px; bottom: 16px; margin: 0; }
  .stage .b12-edit-only { display: none; }
  body.editing .stage .b12-edit-only { display: flex; flex-wrap: wrap; gap: 4px 10px; font: 600 12px/1.2 var(--f-body); color: var(--muted); }
  `);
  const RIP_FAM = { m: { color: P.navy, label: 'fm' }, c: { color: P.gold, label: 'fc' }, i: { color: '#3f7d74', label: 'fi' } };
  const RIP_ORD = { A: { dash: '3 7', mark: 'diamond', label: 'oA' }, F: { dash: '', mark: 'circle', label: 'oF' }, I: { dash: '14 8', mark: 'tri', label: 'oI' } };
  function ripMarker(kind, x, y, c) {
    if (kind === 'circle') return `<circle cx="${x}" cy="${y}" r="5" fill="${c}" stroke="#fff" stroke-width="1.5"/>`;
    if (kind === 'tri') return `<path d="M${x - 6},${y - 4}L${x + 6},${y - 4}L${x},${y + 6}Z" fill="${c}" stroke="#fff" stroke-width="1.5"/>`;
    return `<path d="M${x},${y - 6}L${x + 6},${y}L${x},${y + 6}L${x - 6},${y}Z" fill="${c}" stroke="#fff" stroke-width="1.5"/>`;
  }
  const ripCopy = {
    card: 'Assumptions', 'l.A': 'Total Assets', 'l.ra': 'Retirement Age', 'l.le': 'Until Age', 'l.wr': 'Withdrawal %', 'l.inf': 'Inflation @',
    'l.mk': 'Historic Market', 'l.sy': 'Starting Year', 'l.sh': 'Market Shield', 'l.thr': 'Threshold %', 'l.q': 'Safe Return %', 'l.db': 'Death Benefit',
    'l.ceil': 'Ceiling', 'l.part': 'Participation', 'l.floor': 'Floor',
    doc: 'Documentation', table: 'Table', graph: 'Graph',
    infoW: 'First-year withdrawal', infoR: 'Average return',
    fm: 'Market', fc: 'Compounding', fi: 'Indexed', oA: 'Average', oF: 'Forward', oI: 'Inverted', ret: 'return',
    'tot.m': 'Market Totals ($)', 'tot.c': 'Compounding Totals ($)', 'tot.i': 'Indexed Totals ($)',
    'th.age': 'Age', db: 'Death Benefit Protection',
    'mk.djiaPriceReturn': 'Dow Jones Industrials', 'mk.sp500PriceReturn': 'S&P 500 Price', 'mk.sp500TotalReturnSP': 'S&P 500 Total Return',
    'mk.russell2000PriceReturn': 'Russell 2000', 'mk.nasdaqPriceReturn': 'NASDAQ Composite', 'mk.msciWorldGrossReturn': 'MSCI World',
    'mk.tsy10yYield': '10-Year Govt Bonds', 'mk.muni20Yield': '20-Year Muni Bonds', 'mk.corpAaaYield': '30-Year Corp Bonds',
    verify: 'Historical market figures are being verified.',
    'ws.age': 'Age', 'ws.w': 'Withdrawal', 'ws.bal': 'Balance', 'ws.ret': 'Return %', 'ws.risk': 'Risk Balance', 'ws.safe': 'Safe Balance', 'ws.tot': 'Total Balance',
    'ws.wr': 'Risk Withdrawal', 'ws.wsf': 'Safe Withdrawal', 'ws.cum': 'Cumulative Withdrawals', 'ws.cred': 'Credited Return %'
  };
  /** inputs for the engine from the shared case keys */
  function ripInputs(code, start) {
    const n = (k) => CASE.n(k), b = (k) => !!CASE.get(k);
    return {
      A: n('rip_total_assets'), RA: n('case_file_retirement_age'), LE: n('case_file_life_expectancy'), wr: n('rip_withdrawal_rate'), inf: n('case_file_ror_inflation'),
      code, start, shield: b('rip_has_market_shield'), thr: n('rip_threshold'), s: n('rip_safe_asset_ratio'), q: n('rip_safe_asset_ror'),
      ceil: [b('rip_has_ceiling'), n('rip_market_ceiling')], part: [b('rip_has_participation'), n('rip_market_participation')], floor: [b('rip_has_floor'), n('rip_market_floor')]
    };
  }
  function ripScreen(ctx, mode) {
    const S = st(ctx);
    const mk = ripMarkets();
    S.rp = S.rp || { on: {}, view: 'chart', legend: true };
    const fams = mode === 1 ? ['m'] : mode === 2 ? ['m', 'c'] : ['m', 'c', 'i'];
    const prot = mode === 2 ? 'c' : mode === 3 ? 'i' : null;
    if (!mk.length) {
      ctx.el.innerHTML = `<div class="b12-load b12-card" style="left:300px;top:300px;width:1000px;height:240px"><span class="st-eyebrow">${ctx.t('verify')}</span></div>`;
      return;
    }
    let code = CASE.get('rip_market_index', '');
    if (!mk.some((m) => m.series === code)) { code = (mk.find((m) => m.series === 'sp500PriceReturn') || mk[0]).series; CASE.set('rip_market_index', code); }
    const yearsOf = (c) => { const s = ripSeries(c); return [s[0][0], s[s.length - 1][0]]; };
    let [y0, y1] = yearsOf(code);
    let start = CASE.n('rip_start_year');
    if (!(start >= y0)) { start = y0; CASE.set('rip_start_year', start); }
    if (start > y1) { start = y1; CASE.set('rip_start_year', start); }
    const rh = mode === 1 ? 58 : mode === 2 ? 46 : 41;
    const R = (lab, inner, cls, dot) => `<div class="b12-rp-r${cls ? ' ' + cls : ''}"><span class="k">${ctx.t(lab)}${dot || ''}</span>${inner}</div>`;
    const ck = (key, attr) => `<input type="checkbox" data-ck="${key}"${CASE.get(key) ? ' checked' : ''}${attr || ''}>`;
    const mkOpts = mk.map((m) => `<option value="${m.series}"${m.series === code ? ' selected' : ''}>${esc(ctx.text('mk.' + m.series))}</option>`).join('');
    const yrOpts = () => { const o = []; for (let y = y0; y <= y1; y++) o.push(`<option value="${y}"${y === start ? ' selected' : ''}>${y}</option>`); return o.join(''); };
    const rows = [
      R('l.A', fld(ctx, { id: 'A', key: 'rip_total_assets', type: 'money', min: 0, label: 'l.A' })),
      R('l.ra', fld(ctx, { id: 'ra', key: 'case_file_retirement_age', type: 'int', min: 0, max: 120, label: 'l.ra' })),
      R('l.le', fld(ctx, { id: 'le', key: 'case_file_life_expectancy', type: 'int', min: 0, max: 120, label: 'l.le' }), '', leLink(ctx, (age) => { setVal(ctx, 'le', age); recalc(); })),
      R('l.wr', fld(ctx, { id: 'wr', key: 'rip_withdrawal_rate', type: 'pct', min: 0, max: 1, label: 'l.wr' })),
      R('l.inf', fld(ctx, { id: 'inf', key: 'case_file_ror_inflation', type: 'pct', label: 'l.inf' }), '', infLink(ctx, (rate) => { setVal(ctx, 'inf', r2(rate * 100) / 100); recalc(); })),
      R('l.mk', `<span style="display:grid;justify-items:end"><select data-mk aria-label="${esc(ctx.text('l.mk'))}">${mkOpts}</select><span class="b12-edit-only">${mk.map((m) => ctx.t('mk.' + m.series)).join('')}</span></span>`, 'y'),
      R('l.sy', `<select data-sy aria-label="${esc(ctx.text('l.sy'))}">${yrOpts()}</select>`, 'y')
    ];
    if (mode >= 2) {
      rows.push(R('l.sh', `<span class="ck">${ck('rip_has_market_shield')}</span>`, 'y'));
      rows.push(`<div data-thrrow>${R('l.thr', fld(ctx, { id: 'thr', key: 'rip_threshold', type: 'pct', max: 1, label: 'l.thr' }), 'y')}</div>`);
      const tri = (up, c) => `<svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true"><path d="${up ? 'M9 2L17 14H1Z' : 'M1 2H17L9 14Z'}" fill="${c}"/></svg>`;
      rows.push(`<div class="b12-rp-split"><div class="y">${fld(ctx, { id: 'risk', key: 'rip_risk_asset_ratio', type: 'pct', min: 0, max: 1, label: 'fm' })}</div><div class="y">${tri(true, P.goldDeep)}</div><div class="gr">${tri(false, '#3f7d5a')}</div><div class="gr">${fld(ctx, { id: 'safe', key: 'rip_safe_asset_ratio', type: 'pct', min: 0, max: 1, label: 'l.q' })}</div></div>`);
      if (mode === 2) rows.push(R('l.q', fld(ctx, { id: 'q', key: 'rip_safe_asset_ror', type: 'pct', min: 0, max: 0.12, disclose: 'rip', label: 'l.q' }), 'gr'));
      if (mode === 3) {
        rows.push(R('l.ceil', `<span class="ck">${ck('rip_has_ceiling')}${fld(ctx, { id: 'ceil', key: 'rip_market_ceiling', type: 'pct', max: 1, label: 'l.ceil' })}</span>`, 'gr'));
        rows.push(R('l.part', `<span class="ck">${ck('rip_has_participation')}${fld(ctx, { id: 'part', key: 'rip_market_participation', type: 'pct', max: 1, label: 'l.part' })}</span>`, 'gr'));
        rows.push(R('l.floor', `<span class="ck">${ck('rip_has_floor')}${fld(ctx, { id: 'floor', key: 'rip_market_floor', type: 'pct', max: 1, label: 'l.floor' })}</span>`, 'gr'));
      }
      rows.push(R('l.db', `<span class="ck">${ck('rip_has_death_benefit')}</span>`));
    }
    const ckRows = fams.map((f) => `<div class="rw"><span>${ctx.t(RIP_FAM[f].label)}</span>${['A', 'F', 'I'].map((o) => `<label><input type="checkbox" data-ser="${f}${o}"${S.rp.on[f + o] ? ' checked' : ''}>${ctx.t(RIP_ORD[o].label)}</label>`).join('')}</div>`).join('');
    const totRows = ['m'].concat(prot ? [prot] : []).map((f) => `<tr${f !== 'm' ? ' class="hl"' : ''}><td>${ctx.t('tot.' + f)}</td><td data-out="t${f}A"></td><td data-out="t${f}F"></td><td data-out="t${f}I"></td></tr>`).join('');
    const famTh = prot === 'i' ? 'fi' : prot === 'c' ? 'fc' : 'fm';
    const cardH = 70 + rows.length * rh;
    ctx.el.innerHTML = `
      <div class="b12-rp-card b12-card" style="--rh:${rh}px"><h3>${ctx.t('card')}</h3>${rows.join('')}</div>
      <div class="b12-rp-btns" style="top:${40 + cardH + 22}px">${docLink(ctx, () => ripSheet(ctx, mode))}<button type="button" class="st-pill" data-view></button></div>
      <div class="b12-rp-info b12-card"><span>${ctx.t('infoW')} <span class="num" data-out="w1"></span></span><span>${ctx.t('infoR')} <span class="num" data-out="avg"></span></span></div>
      <div class="b12-rp-chart b12-card" data-chart><svg width="1000" height="500" viewBox="0 0 1000 500" data-svg aria-hidden="true"></svg><div data-lab></div>
        <div class="b12-rp-legend" data-legend></div>
        <div class="b12-rp-cks">${ckRows}</div>
        <div class="b12-rp-db" data-db style="left:120px;top:20px">${ripShield()}${ctx.t('db')}</div>
        <div class="b12-rp-tip" data-tip hidden></div>
      </div>
      <div class="b12-rp-tbl b12-card" data-tbl hidden><table><thead><tr><th style="width:10%">${ctx.t('th.age')}</th>${['A', 'F', 'I'].map((o) => `<th style="width:17%">${ctx.t(RIP_ORD[o].label)} ${ctx.t(famTh)}</th><th style="width:13%">${ctx.t(RIP_ORD[o].label)} ${ctx.t('ret')}</th>`).join('')}</tr></thead><tbody data-tb></tbody></table></div>
      <div class="b12-rp-tot b12-card"><table><thead><tr><th></th><th>${ctx.t('oA')}</th><th>${ctx.t('oF')}</th><th>${ctx.t('oI')}</th></tr></thead><tbody>${totRows}</tbody></table></div>
      ${LIB().disclosure ? LIB().disclosure.line(['hypothetical', 'past'].concat(mode >= 2 ? ['guarantees'] : []), { cls: 'b12-rp-disc' }) : ''}`;
    const paint = () => {
      const r = S.rp.res; if (!r) return;
      setOut(ctx, 'w1', money(r.first)); setOut(ctx, 'avg', pct2(r.avg));
      ['m'].concat(prot ? [prot] : []).forEach((f) => ['A', 'F', 'I'].forEach((o) => setOut(ctx, `t${f}${o}`, N(money((f === 'm' ? r.tot.mkt : f === 'c' ? r.tot.comp : r.tot.idx)[o])))));
      const bal = (row, o) => (prot === 'c' ? row.comp[o].T : prot === 'i' ? row.idx[o].T : row.mkt[o].X);
      const rt = (row, o) => (prot === 'i' ? row.c[o] : row.g[o]);
      ctx.$('[data-tb]').innerHTML = r.rows.map((row) => `<tr><td>${N(row.age)}</td>${['A', 'F', 'I'].map((o) => `<td>${N(money(bal(row, o)))}</td><td>${N(pct2(rt(row, o)))}</td>`).join('')}</tr>`).join('');
      drawChart();
      const db = ctx.$('[data-db]'); if (db) db.style.display = mode >= 2 && CASE.get('rip_has_death_benefit') ? '' : 'none';
      const tr = ctx.$('[data-thrrow]'); if (tr) tr.style.display = CASE.get('rip_has_market_shield') ? '' : 'none';
      const v = S.rp.view === 'table';
      ctx.$('[data-chart]').hidden = v; ctx.$('[data-tbl]').hidden = !v;
      ctx.$('[data-view]').innerHTML = ctx.t(v ? 'graph' : 'table');
      EFA.numify(ctx.el);
    };
    const series = () => {
      const r = S.rp.res, out = [];
      fams.forEach((f) => ['A', 'F', 'I'].forEach((o) => out.push({ id: f + o, f, o, vals: r.rows.map((row) => (f === 'm' ? row.mkt[o].X : f === 'c' ? row.comp[o].T : row.idx[o].T)) })));
      return out;
    };
    const drawChart = () => {
      const r = S.rp.res, W = 1000, H = 500, pl = 96, pr = 26, pt = 26, pb = 50;
      const ser = series(), shown = ser.filter((s) => S.rp.on[s.id]);
      const ymax0 = Math.max(1, ...(shown.length ? shown : ser).flatMap((s) => s.vals));
      const step = Math.pow(10, Math.floor(Math.log10(ymax0))) * (ymax0 / Math.pow(10, Math.floor(Math.log10(ymax0))) > 5 ? 2 : ymax0 / Math.pow(10, Math.floor(Math.log10(ymax0))) > 2 ? 1 : 0.5);
      const ymax = Math.ceil(ymax0 / step) * step;
      const n = r.rows.length, X = (i) => pl + (n <= 1 ? 0 : i * (W - pl - pr) / (n - 1)), Yv = (v) => pt + (H - pt - pb) * (1 - v / ymax);
      let g = '', lab = '';
      for (let v = 0; v <= ymax + 1e-6; v += step) { g += `<line x1="${pl}" x2="${W - pr}" y1="${Yv(v)}" y2="${Yv(v)}" stroke="${P.rule}"/>`; lab += `<div class="b12-abs num" style="left:0;width:${pl - 12}px;text-align:right;top:${Yv(v) - 9}px;font:700 15px/1 var(--f-body);color:var(--navy)">${F.money(v, { compact: true })}</div>`; }
      r.rows.forEach((row, i) => { if (i % 2) return; g += `<line x1="${X(i)}" x2="${X(i)}" y1="${pt}" y2="${H - pb}" stroke="${P.rule}" stroke-opacity=".6"/>`; lab += `<div class="b12-abs num" style="left:${X(i) - 20}px;width:40px;text-align:center;top:${H - pb + 12}px;font:700 15px/1 var(--f-body);color:var(--navy)">${row.age}</div>`; });
      shown.forEach((s) => {
        const c = RIP_FAM[s.f].color, d = s.vals.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Yv(v).toFixed(1)}`).join('');
        g += `<path d="${d}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"${RIP_ORD[s.o].dash ? ` stroke-dasharray="${RIP_ORD[s.o].dash}"` : ''}/>`;
        s.vals.forEach((v, i) => { g += ripMarker(RIP_ORD[s.o].mark, X(i).toFixed(1), Yv(v).toFixed(1), c); });
      });
      ctx.$('[data-svg]').innerHTML = g; ctx.$('[data-lab]').innerHTML = lab;
      const lg = ctx.$('[data-legend]');
      lg.style.display = S.rp.legend && shown.length ? '' : 'none';
      lg.innerHTML = ser.filter((s) => S.rp.on[s.id]).map((s) => `<div class="li" data-li="${s.id}"><svg width="40" height="14" aria-hidden="true"><line x1="2" x2="38" y1="7" y2="7" stroke="${RIP_FAM[s.f].color}" stroke-width="4"${RIP_ORD[s.o].dash ? ` stroke-dasharray="${RIP_ORD[s.o].dash}"` : ''}/>${ripMarker(RIP_ORD[s.o].mark, 20, 7, RIP_FAM[s.f].color)}</svg>${ctx.t(RIP_FAM[s.f].label)} ${ctx.t(RIP_ORD[s.o].label)}</div>`).join('');
      lg.querySelectorAll('[data-li]').forEach((li) => li.addEventListener('click', (e) => { e.stopPropagation(); if (EFA.edit && EFA.edit.on) return; S.rp.on[li.dataset.li] = false; syncCks(); drawChart(); }));
      S.rp.geom = { X, Yv, n, pl, pr, W };
    };
    const syncCks = () => ctx.$$('[data-ser]').forEach((c) => { c.checked = !!S.rp.on[c.dataset.ser]; });
    const recalc = () => {
      code = CASE.get('rip_market_index', code); start = CASE.n('rip_start_year');
      S.rp.res = ripRun(ripInputs(code, start));
      paint();
    };
    S.recalc = recalc;
    wire(ctx, (id, v) => {
      if (id === 'risk') setVal(ctx, 'safe', r2((1 - Math.max(0, Math.min(1, v))) * 10000) / 10000);
      if (id === 'safe') setVal(ctx, 'risk', r2((1 - Math.max(0, Math.min(1, v))) * 10000) / 10000);
      recalc();
    });
    ctx.$$('[data-ck]').forEach((c) => c.addEventListener('change', () => { CASE.set(c.dataset.ck, c.checked); recalc(); }));
    ctx.$$('[data-ser]').forEach((c) => c.addEventListener('change', () => { S.rp.on[c.dataset.ser] = c.checked; drawChart(); }));
    const mkSel = ctx.$('[data-mk]'), sySel = ctx.$('[data-sy]');
    [mkSel, sySel].forEach((s) => s.addEventListener('keydown', (e) => e.stopPropagation()));
    mkSel.addEventListener('change', () => {
      code = mkSel.value; CASE.set('rip_market_index', code);
      [y0, y1] = yearsOf(code);
      if (!(start >= y0)) start = y0; if (start > y1) start = y1;
      CASE.set('rip_start_year', start); sySel.innerHTML = yrOpts(); recalc();
    });
    sySel.addEventListener('change', () => { start = +sySel.value; CASE.set('rip_start_year', start); recalc(); });
    ctx.on(ctx.$('[data-view]'), 'click', () => { S.rp.view = S.rp.view === 'table' ? 'chart' : 'table'; paint(); });
    const chart = ctx.$('[data-chart]'), tip = ctx.$('[data-tip]');
    chart.addEventListener('click', (e) => { if (e.target.closest('.b12-rp-cks, .b12-rp-legend, .b12-rp-db')) return; S.rp.legend = !S.rp.legend; drawChart(); });
    chart.addEventListener('mousemove', (e) => {
      const G = S.rp.geom, r = S.rp.res; if (!G || !r || e.target.closest('.b12-rp-cks, .b12-rp-legend')) { tip.hidden = true; return; }
      const box = chart.getBoundingClientRect(), sc = box.width / 1000, x = (e.clientX - box.left) / sc;
      const i = Math.round((x - G.pl) / ((G.W - G.pl - G.pr) / Math.max(1, G.n - 1)));
      const shown = series().filter((s) => S.rp.on[s.id]);
      if (i < 0 || i >= G.n || !shown.length) { tip.hidden = true; return; }
      const row = r.rows[i];
      tip.innerHTML = `<b>${ctx.t('th.age')} ${N(row.age)}</b><br>` + shown.map((s) => {
        const g = s.f === 'i' ? row.c[s.o] : row.g[s.o];
        return `${ctx.t(RIP_FAM[s.f].label)} ${ctx.t(RIP_ORD[s.o].label)} ${ctx.t('ret')} ${N(pct2(g))}: ${N(money(s.vals[i]))}`;
      }).join('<br>');
      tip.hidden = false;
      const left = G.X(i) + 16; tip.style.left = (left > 640 ? G.X(i) - 16 - tip.offsetWidth : left) + 'px'; tip.style.top = '60px';
    });
    chart.addEventListener('mouseleave', () => { tip.hidden = true; });
    recalc();
  }
  function ripShield() {
    return `<svg width="40" height="46" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 3L36 9V22C36 33 28 40 20 43C12 40 4 33 4 22V9Z" fill="#3f7d5a" stroke="#2c5a3a" stroke-width="2.5" stroke-linejoin="round"/><path d="M13 23l5 5 9-11" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  /** documentation worksheet for rip1-rip3 (column order as the specs list them) */
  function ripSheet(ctx, mode) {
    const r = st(ctx).rp && st(ctx).rp.res; if (!r) return null;
    const t = (k) => ctx.t(k), lab = (f, o) => `${t(RIP_ORD[o].label)} ${t(RIP_FAM[f].label)}`;
    const cols = [{ field: 'age', header: t('ws.age'), type: 'age', width: 70 }, { field: 'w', header: t('ws.w'), type: 'money', dp: 2 }];
    const ords = mode === 1 ? ['F', 'I', 'A'] : ['F', 'I', 'A'];
    ords.forEach((o) => { cols.push({ field: 'mB' + o, header: `${lab('m', o)} ${t('ws.bal')}`, type: 'money', dp: 2 }, { field: 'mR' + o, header: `${lab('m', o)} ${t('ws.ret')}`, type: 'pct', dp: 2 }); });
    const bucketCols = (f) => ords.forEach((o) => cols.push(
      { field: f + 'R' + o, header: `${lab(f, o)} ${t('ws.risk')}`, type: 'money', dp: 2 }, { field: f + 'S' + o, header: `${lab(f, o)} ${t('ws.safe')}`, type: 'money', dp: 2 },
      { field: f + 'T' + o, header: `${lab(f, o)} ${t('ws.tot')}`, type: 'money', dp: 2 }, { field: f + 'WR' + o, header: `${lab(f, o)} ${t('ws.wr')}`, type: 'money', dp: 2 },
      { field: f + 'WS' + o, header: `${lab(f, o)} ${t('ws.wsf')}`, type: 'money', dp: 2 }));
    if (mode >= 2) bucketCols('c');
    if (mode === 3) { ords.forEach((o) => cols.push({ field: 'cr' + o, header: `${t(RIP_ORD[o].label)} ${t('ws.cred')}`, type: 'pct', dp: 2 })); bucketCols('i'); }
    ['m'].concat(mode >= 2 ? ['c'] : [], mode === 3 ? ['i'] : []).forEach((f) => ords.forEach((o) => cols.push({ field: f + 'C' + o, header: `${lab(f, o)} ${t('ws.cum')}`, type: 'money', dp: 2 })));
    const rows = r.rows.map((row) => {
      const x = { age: row.age, w: row.w };
      ords.forEach((o) => {
        x['mB' + o] = row.mkt[o].X; x['mR' + o] = row.g[o]; x['mC' + o] = row.mkt[o].c;
        [['c', row.comp], ['i', row.idx]].forEach(([f, src]) => { const b = src[o]; x[f + 'R' + o] = b.R; x[f + 'S' + o] = b.S; x[f + 'T' + o] = b.T; x[f + 'WR' + o] = b.wR; x[f + 'WS' + o] = b.wS; x[f + 'C' + o] = b.cum; });
        x['cr' + o] = row.c[o];
      });
      return x;
    });
    return { heading: ctx.t('wsHead'), size: 'full', columns: cols, rows, disclosures: ['hypothetical', 'past', 'license'] };
  }
  const ripNotes = (q) => `Same savings, same withdrawals, same average return. Only the order of the years changes.\n\n- Check the boxes to reveal each line; Table shows the year-by-year numbers.\n- Ask: ${q}\nPAUSE`;
  EFA.screen('rip1', {
    title: 'Principal exposed to market returns (sequence of returns)',
    copy: Object.assign({}, ripCopy, { wsHead: 'Principal Subjected to Market Returns', _notes: ripNotes('If the bad years came first, would your plan still work?') }),
    render(ctx) { ripScreen(ctx, 1); }
  });
  EFA.screen('rip2', {
    title: 'Principal protected by a compounding account',
    copy: Object.assign({}, ripCopy, { wsHead: 'Principal Protected by a Compounding Account', _notes: ripNotes('What if part of your money never had to be sold in a down year?') }),
    render(ctx) { ripScreen(ctx, 2); }
  });
  EFA.screen('rip3', {
    title: 'Principal protected by an indexed account',
    copy: Object.assign({}, ripCopy, { wsHead: 'Principal Protected by an Indexed Account', _notes: ripNotes('How would a floor under your returns change the way you feel about the market?') }),
    render(ctx) { ripScreen(ctx, 3); }
  });

  /* ---- more screens are appended below ---- */
})();
