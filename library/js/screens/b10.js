/* b10: Mortgages (MTG), Mortgages 101 (MF101), Needs vs. Wants (NVSW, also in TLS), Needs vs. Wants 101
   (HMC101; hmc4 to hmc6 also play as pti3 to pti5), Operating Efficiency (OE), Opportunity Cost (OPPCOST)
   and Pay Me Now or Pay Me Later (NORL).
   Structure, sequence, interactions and math follow the plain-words specs; drawings and wording are new. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt;

  EFA.css('b10', `
  .stage .b10-full { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; overflow: visible; pointer-events: none; }
  .stage .b10-full .hit { pointer-events: auto; }
  .stage .b10-ill { display: block; width: 100%; height: 100%; overflow: visible; }
  .stage .b10-f { transition: opacity .8s ease; }
  .stage .b10-f.is-off { transition: opacity .3s ease; }
  .stage .b10-head { position: absolute; left: 110px; right: 110px; top: 54px; display: grid; justify-items: center; gap: 18px; text-align: center; }
  .stage .b10-head .st-h1 { font-size: 60px; line-height: 1.14; }
  .stage .b10-head .b10-sub { font: 500 italic 30px/1.25 var(--f-display); color: var(--navy-4); margin: 0; }
  .stage .b10-abs { position: absolute; }
  .stage .b10-center { position: absolute; left: 50%; transform: translateX(-50%); }

  /* home picture with soft oval edges */
  .stage .b10-cameo { position: absolute; }
  .stage .b10-cameo > svg { width: 100%; height: 100%; display: block; overflow: visible; }
  .stage .b10-backdrop { position: absolute; display: grid; place-items: end center; }
  .stage .b10-backdrop svg { width: 100%; height: 100%; }

  /* caption card */
  .stage .b10-caption { position: absolute; display: grid; place-items: center; text-align: center; padding: 22px 46px 24px; box-sizing: border-box; background: var(--paper); border: 1px solid var(--rule); border-radius: 18px; box-shadow: 0 18px 40px rgba(13,30,58,.12); font: 600 42px/1.12 var(--f-display); color: var(--navy); }
  .stage .b10-caption::before { content: ""; position: absolute; left: 50%; top: -2px; width: 120px; height: 4px; margin-left: -60px; background: var(--gold); border-radius: 2px; }

  /* cost pie labels */
  .stage .b10-sl { position: absolute; display: grid; align-content: center; justify-items: center; text-align: center; gap: 4px; color: var(--navy); }
  .stage .b10-sl .cap { font: 700 16px/1.15 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--navy); opacity: .82; }
  .stage .b10-sl .big { font: 700 38px/1.05 var(--f-body); letter-spacing: -.01em; }
  .stage .b10-sl .sm { font: 600 18px/1.25 var(--f-body); }
  .stage .b10-note { position: absolute; font: 400 16px/1.45 var(--f-body); color: var(--muted); }
  .stage .b10-note::before { content: ""; display: block; width: 46px; height: 3px; background: var(--gold); margin-bottom: 10px; }
  .stage .b10-note.c { text-align: center; }
  .stage .b10-note.c::before { margin: 0 auto 10px; }

  /* calculator cards */
  .stage .b10-form { position: absolute; left: 50%; transform: translateX(-50%); padding: 10px 36px; box-sizing: border-box; }
  .stage .b10-form.st-card, .stage .b10-tcard.st-card { border-top: 4px solid var(--gold); }
  .stage .b10-frow { display: grid; grid-template-columns: 1fr 230px; align-items: center; column-gap: 16px; min-height: 80px; border-bottom: 1px solid var(--line); }
  .stage .b10-fl { display: flex; align-items: center; gap: 14px; min-width: 0; }
  .stage .b10-frow:last-child { border-bottom: 0; }
  .stage .b10-flab { font: 600 28px/1.2 var(--f-body); color: var(--navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stage .b10-frow .st-field { display: block; }
  .stage .b10-frow .st-input { height: 58px; font-size: 28px; text-align: right; }
  .stage .b10-ro { height: 58px; box-sizing: border-box; display: flex; align-items: center; justify-content: flex-end; padding: 0 16px; font: 700 28px/1 var(--f-body); color: var(--navy); background: var(--mist); border-radius: 10px; }
  .stage .b10-btn { min-height: 58px; padding: 10px 44px; font-size: 22px; }
  .stage .b10-link { display: inline-flex; align-items: center; gap: 10px; font: 600 23px/1.2 var(--f-body); color: var(--gold-deep); cursor: pointer; background: none; border: 0; padding: 4px 2px; }
  .stage .b10-link > span:not(.b10-li) { border-bottom: 1.5px dotted currentColor; padding-bottom: 2px; }
  .stage .b10-link:hover { color: var(--navy); }
  .stage .b10-li { width: 34px; height: 34px; border-radius: 50%; background: var(--navy); display: grid; place-items: center; flex: 0 0 auto; }
  .stage .b10-result { position: absolute; left: 50%; transform: translateX(-50%); padding: 26px 40px 24px; box-sizing: border-box; text-align: center; }
  .stage .b10-hl { border: 3px solid var(--gold); border-radius: 12px; background: rgba(240,230,196,.42); padding: 14px 22px; margin: 0 auto; font: 700 32px/1.25 var(--f-body); color: var(--navy); }
  .stage .b10-sent { font: 600 25px/1.35 var(--f-body); color: var(--navy); margin: 20px 0 0; text-wrap: balance; }
  .stage .b10-disc { font: 500 17px/1.45 var(--f-body); color: var(--muted); margin: 18px 0 0; text-align: left; }
  .stage .b10-actions { position: absolute; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 28px; }

  /* small modal panels */
  .stage .b10-pop .st-overlay-in { width: 600px; }
  .stage .b10-pop .st-overlay-h { font-size: 28px; }
  .stage .b10-pop .st-table td, .stage .b10-pop .st-table th, .stage .b10-pop .st-table td:first-child, .stage .b10-pop .st-table th:first-child { text-align: center; font-weight: 700; }
  .stage .b10-pop .st-table td { font-size: 22px; padding: 12px; }
  .stage .b10-pop .st-table th { font-size: 14px; }
  .stage .b10-pop .st-table tr.hl td { background: var(--gold-pale) !important; }

  /* needs and wants sliders */
  .stage .b10-nw { position: absolute; left: 110px; right: 110px; display: grid; grid-template-columns: 1fr 2fr 1fr; align-items: center; }
  .stage .b10-nwh { top: 30px; height: 76px; }
  .stage .b10-nwh > div { text-align: center; }
  .stage .b10-nwh .lbl { font: 600 54px/1 var(--f-display); color: var(--navy); }
  .stage .b10-dec { display: inline-flex; align-items: center; gap: 18px; font: 700 22px/1 var(--f-body); letter-spacing: .3em; text-transform: uppercase; color: var(--gold-deep); }
  .stage .b10-dec svg { width: 150px; height: 28px; display: block; }
  .stage .b10-nwbox { justify-self: center; width: 300px; height: 206px; box-sizing: border-box; padding: 14px 20px; display: grid; place-items: center; cursor: pointer; transition: box-shadow .25s ease, transform .25s ease, border-color .25s ease; }
  .stage .b10-nwbox:hover { transform: translateY(-2px); box-shadow: 0 18px 36px rgba(13,30,58,.12); border-color: var(--gold-lt); }
  .stage .b10-nwbox .art { width: 100%; height: 100%; transition: opacity .35s ease; }
  .stage .b10-nwbox .art svg { width: 100%; height: 100%; display: block; }
  .stage .b10-mid { display: grid; justify-items: center; align-content: center; gap: 22px; }
  .stage .b10-q { width: 80%; margin: 0; text-align: center; font: 600 26px/1.3 var(--f-body); color: var(--navy); min-height: 68px; display: grid; place-items: end center; }
  .stage .b10-q.hide { visibility: hidden; }
  .stage .b10-sld { position: relative; width: 80%; height: 56px; }
  .stage .b10-range { -webkit-appearance: none; appearance: none; width: 100%; height: 56px; margin: 0; background: transparent; cursor: pointer; --p: 50%; }
  .stage .b10-range:focus { outline: none; }
  .stage .b10-range::-webkit-slider-runnable-track { height: 12px; border-radius: 6px; background: linear-gradient(90deg, var(--gold) 0, var(--gold) var(--p), var(--mist-2) var(--p), var(--mist-2) 100%); }
  .stage .b10-range::-moz-range-track { height: 12px; border-radius: 6px; background: var(--mist-2); }
  .stage .b10-range::-moz-range-progress { height: 12px; border-radius: 6px; background: var(--gold); }
  .stage .b10-range::-webkit-slider-thumb { -webkit-appearance: none; width: 48px; height: 48px; margin-top: -18px; border-radius: 50%; background: var(--paper); border: 4px solid var(--navy); box-shadow: 0 6px 16px rgba(13,30,58,.25); }
  .stage .b10-range::-moz-range-thumb { width: 42px; height: 42px; border-radius: 50%; background: var(--paper); border: 4px solid var(--navy); box-shadow: 0 6px 16px rgba(13,30,58,.25); }
  .stage .b10-bub { position: absolute; top: -40px; transform: translateX(-50%); background: var(--navy); color: var(--cream); font: 700 17px/1 var(--f-body); padding: 7px 11px; border-radius: 8px; opacity: 0; transition: opacity .2s ease; pointer-events: none; }
  .stage .b10-sld:hover .b10-bub, .stage .b10-sld.drag .b10-bub { opacity: 1; }

  /* coverage summary */
  .stage .b10-bars { position: absolute; left: 50%; top: 196px; width: 920px; margin-left: -460px; display: grid; gap: 20px; }
  .stage .b10-bar { display: grid; grid-template-columns: 74fr 26fr; align-items: center; gap: 24px; min-height: 78px; padding: 0 34px; box-sizing: border-box; font: 700 29px/1.2 var(--f-body); color: var(--navy); }
  .stage .b10-bar .l { text-align: right; }
  .stage .b10-bar .v { text-align: right; font-size: 32px; }
  .stage .b10-bar.key { background: linear-gradient(90deg, var(--gold-lt), var(--gold)); border-color: var(--gold); box-shadow: 0 16px 36px rgba(184,151,46,.28); }
  .stage .b10-closeq { position: absolute; left: 110px; right: 110px; top: 664px; text-align: center; font: 600 68px/1.05 var(--f-display); color: var(--navy); }

  /* text card */
  .stage .b10-tcard { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 1170px; padding: 44px 64px; box-sizing: border-box; display: grid; gap: 22px; }
  .stage .b10-tcard p { margin: 0; }
  .stage .b10-tcard .def { font: 500 29px/1.42 var(--f-body); color: var(--navy); }
  .stage .b10-tcard .q { font: 600 40px/1.15 var(--f-display); color: var(--navy); }
  .stage .b10-tcard .pr { font: 600 27px/1.3 var(--f-body); color: var(--gold-deep); padding-left: 48px; }
  .stage .b10-tcard .ans { font: 700 30px/1.3 var(--f-body); color: var(--navy); padding-left: 48px; }
  .stage .b10-tcard hr { margin: 2px 0; }

  /* statement beside a figure */
  .stage .b10-stmt { position: absolute; display: grid; gap: 24px; justify-items: center; align-content: center; text-align: center; }
  .stage .b10-stmt .big { font: 600 56px/1.08 var(--f-display); color: var(--navy); margin: 0; text-wrap: balance; }
  .stage .b10-stmt .big2 { font: 500 italic 40px/1.18 var(--f-display); color: var(--gold-deep); margin: 0; text-wrap: balance; }
  .stage .b10-stmt .mid { font: 600 26px/1.4 var(--f-body); color: var(--navy); margin: 0; text-wrap: balance; }
  .stage .b10-stmt .fine { font: 400 16px/1.45 var(--f-body); color: var(--muted); margin: 0; max-width: 500px; }

  /* larger rows for the short mortgage input cards */
  .stage .b10-form.big .b10-frow { min-height: 94px; grid-template-columns: 1fr 260px; }
  .stage .b10-form.big .b10-flab { font-size: 31px; }
  .stage .b10-form.big .st-input { height: 64px; font-size: 32px; }
  .stage .b10-form.big.one .b10-frow { min-height: 112px; grid-template-columns: 1fr 290px; }
  .stage .b10-form.big.one .b10-flab { font-size: 34px; }
  .stage .b10-form.big.one .st-input { height: 72px; font-size: 36px; }
  /* tighter calculator rows (five-row cards) */
  .stage .b10-form.tight .b10-frow { min-height: 66px; }
  .stage .b10-form.tight .st-input, .stage .b10-form.tight .b10-ro { height: 52px; font-size: 26px; }
  .stage .b10-form.tight .b10-flab { font-size: 26px; }
  .stage .b10-big { font-size: 1.12em; }
  .stage .b10-hl .num { white-space: nowrap; }
  .stage .b10-gold { color: var(--gold-deep); }

  /* operating efficiency */
  .stage .b10-oefoot { display: flex; justify-content: flex-end; padding: 8px 0 10px; }
  .stage .b10-oefoot .st-pill { min-width: 168px; }
  .stage .b10-oecard { padding: 18px 18px 14px; box-sizing: border-box; }
  .stage .b10-form.xt .b10-frow { min-height: 56px; }
  .stage .b10-form.xt .st-input, .stage .b10-form.xt .b10-ro { height: 46px; font-size: 24px; }
  .stage .b10-form.xt .b10-flab { font-size: 24px; }
  .stage .b10-oefoot .is-gone { visibility: hidden; }
  .stage .b10-oecols { display: grid; grid-template-columns: 1fr 1fr 1fr 2fr 1fr; height: 100%; }
  .stage .b10-oecol { position: relative; display: grid; grid-template-rows: 1fr auto; justify-items: center; text-align: center; padding: 4px 14px 0; border-right: 1px solid var(--line); }
  .stage .b10-oecol:last-child { border-right: 0; }
  .stage .b10-oecol .lb { font: 600 19px/1.3 var(--f-body); color: var(--navy); align-self: start; text-wrap: balance; }
  .stage .b10-oecol .vl { font: 700 34px/1.15 var(--f-body); color: var(--navy); align-self: end; min-height: 58px; display: grid; place-items: end center; }
  .stage .b10-oecol .vl.sm { font-size: 25px; }
  .stage .b10-oecol.key .vl { color: var(--gold-deep); }
  .stage .b10-oecol .st-field { width: 172px; }
  .stage .b10-oecol .st-input { height: 54px; font-size: 28px; text-align: center; }
  .stage .b10-oecol .go { position: absolute; left: 50%; bottom: 2px; transform: translateX(-50%); min-height: 50px; padding: 8px 26px; font-size: 19px; }
  .stage .b10-oecol .blank { visibility: hidden; }
  .stage .st-pill.b10-mode { min-height: 44px; padding: 6px 24px; font-size: 18px; }

  /* pay now or pay later */
  .stage .b10-view { position: absolute; inset: 0; }
  .stage .b10-view.is-hidden, .stage .b10-hide { display: none !important; }
  .stage .b10-nlcol { position: absolute; top: 36px; width: 640px; display: grid; justify-items: center; align-content: start; gap: 16px; transition: left .9s cubic-bezier(.45,.05,.2,1), opacity .8s ease; }
  .stage .b10-nlt { font: 600 44px/1.1 var(--f-display); color: var(--navy); margin: 0; }
  .stage .b10-tbl { width: 470px; max-height: 438px; overflow: auto; border-radius: 12px; border: 1px solid var(--rule); background: var(--paper); box-shadow: 0 10px 30px rgba(13,30,58,.06); }
  .stage .b10-tbl .st-table th { position: sticky; top: 0; z-index: 1; font-size: 13px; padding: 12px 16px; }
  .stage .b10-tbl .st-table td { padding: 8px 16px; font-size: 21px; }
  .stage .b10-tbl .st-table th.c, .stage .b10-tbl .st-table td.c { text-align: center; }
  .stage .b10-tbl tbody tr { cursor: pointer; }
  .stage .b10-tbl tbody tr:hover td { background: rgba(240,230,196,.6); }
  .stage .b10-sum { width: 540px; padding: 12px 26px; box-sizing: border-box; display: grid; gap: 4px; }
  .stage .b10-sum .r { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; font: 600 23px/1.35 var(--f-body); color: var(--navy); }
  .stage .b10-sum .r .num { font-weight: 700; font-size: 26px; }
  .stage .b10-sum .r + .r { border-top: 1px solid var(--line); padding-top: 4px; }
  .stage .b10-nlbar { position: absolute; left: 0; right: 0; top: 760px; display: flex; justify-content: center; align-items: center; gap: 44px; }
  .stage .b10-hint { font: 500 18px/1.3 var(--f-body); color: var(--muted); margin: 0; }
  .stage .b10-modal { position: absolute; inset: 0; z-index: 30; background: rgba(13,30,58,.38); display: grid; place-items: center; }
  .stage .b10-mdl { width: 700px; background: var(--paper); border-radius: 16px; border: 1px solid var(--rule); box-shadow: 0 30px 80px rgba(8,20,42,.35); overflow: hidden; }
  .stage .b10-mdl-h { background: var(--navy); color: var(--cream); padding: 18px 30px; font: 600 28px/1.15 var(--f-display); }
  .stage .b10-mdl-h .num { font-size: .84em; font-weight: 600; }
  .stage .b10-mdl-b { padding: 10px 30px; }
  .stage .b10-mdl-b .b10-frow { grid-template-columns: 1fr 210px; }
  .stage .b10-mdl-f { display: flex; justify-content: space-between; padding: 10px 30px 24px; }
  .stage .st-pill.b10-ghost, .stage .st-pill.b10-mode { background: transparent; color: var(--navy); border: 1.5px solid var(--mist-2); }
  .stage button.st-pill.b10-ghost:hover, .stage button.st-pill.b10-mode:hover { background: var(--gold); border-color: var(--gold); }
  .stage .b10-choose { display: grid; gap: 18px; justify-items: start; padding: 6px 4px 10px; }

  /* lesson panel beside the money-flow model */
  .stage .b10-mfp { position: absolute; left: 900px; top: 34px; width: 600px; display: grid; gap: 8px; align-content: start; z-index: 4; }
  .stage .b10-mfp .st-h1 { font-size: 52px; }
  .stage .b10-mfp .b10-sub { font: 500 italic 32px/1.2 var(--f-display); color: var(--gold-deep); margin: 0 0 14px; }
  .stage .b10-bt { font: 700 22px/1.32 var(--f-body); color: var(--navy); }
  .stage .b10-btxt { width: 85%; box-sizing: border-box; background: var(--paper); border: 1px solid var(--rule); border-radius: 12px; box-shadow: 0 8px 22px rgba(13,30,58,.08); padding: 10px 18px; font: 700 21px/1.32 var(--f-body); color: var(--navy); }
  .stage .b10-mfcalc { display: flex; align-items: center; gap: 22px; padding: 22px 0 0 64px; }
  .stage .b10-mfcalc .b10-link { font-size: 27px; font-weight: 700; }
  .stage .b10-wait { position: absolute; display: grid; place-items: center; text-align: center; border: 2px dashed var(--mist-2); border-radius: 22px; background: rgba(255,253,248,.6); color: var(--muted); font: 500 22px/1.45 var(--f-body); padding: 30px; box-sizing: border-box; }
  `);

  /* ---------- small helpers ---------- */
  let seq = 0; const uid = (p) => `b10${p}${++seq}`;
  const num = (s) => `<span class="num">${s}</span>`;
  const money = (v) => num(F.money(v));
  const pct2 = (frac) => num(F.pct(frac, 2));
  /** clear floating-point dust so a schedule that ends at zero never shows -$0.00 */
  const z = (x) => (Math.abs(x) < 0.005 ? 0 : x);
  const goldGrad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a || P.goldLt}"/><stop offset="1" stop-color="${b || P.gold}"/></linearGradient>`;
  const navyGrad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a || P.navy4}"/><stop offset="1" stop-color="${b || P.navy}"/></linearGradient>`;
  const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${P.shadow}"/>`;

  /* ---------- per-client case file shared across screens and presentations ----------
     Percent values are stored as fractions (0.06 = 6%), like every ctx.field. */
  const CASE_NS = 'case';
  const CASE_DEF = {
    mortgage_finance_amount: 250000, mortgage_interest_rate: 0.06, mortgage_term_in_years: 30,
    case_file_ror_accumulation: 0.06, case_file_current_age: 42, case_file_current_income: 102000,
    case_file_accumulated_savings: 88000, case_file_ror_distribution: 0.05, case_file_ror_inflation: 0.03,
    proceed_duration_in_years: 45, policy_proceeds: 500000, temp_coverage_needed: 0, case_file_spouse_age: 40,
    case_file_business_operating_expense: 1500000, case_file_annual_savings: 6000,
    oppcost_expense: 20000, oppcost_ror_accumulation: 0.05, oppcost_year_time_period: 13,
    case_file_retirement_age: 65, taxable_return: 0.05
  };
  /** a shared component library when it has landed (docs/components.md), else null */
  const lib = (n) => (EFA.lib && EFA.lib[n]) || null;
  const has = (n, fn) => { const l = lib(n); return !!(l && typeof l[fn] === 'function'); };
  function cget(key) {
    const v = has('caseData', 'get') ? EFA.lib.caseData.get(key, undefined) : EFA.clients.get(CASE_NS, key, undefined);
    return (v == null || v === '' || !isFinite(v)) ? CASE_DEF[key] : +v;
  }
  function cset(key, v) {
    if (v == null || !isFinite(v)) return;
    if (has('caseData', 'set')) EFA.lib.caseData.set(key, v); else EFA.clients.set(CASE_NS, key, v);
  }
  /** a labelled calculator row whose value lives in the shared case file */
  function frow(ctx, o) {
    if (CASE_DEF[o.id] != null && !o.local) ctx.remember('f.' + o.id, cget(o.id));
    const fid = `f-${ctx.id}-${o.id}`;
    const f = Object.assign({}, o, { label: null });
    return `<div class="b10-frow" data-row="${o.id}"><span class="b10-fl">${ctx.t(o.label, { tag: 'label', cls: 'b10-flab', attrs: `for="${fid}"` })}${o.extra || ''}</span>${ctx.field(f)}</div>`;
  }
  /** write every changed case-file field back to the shared store (percent kept to 2 decimals) */
  function syncCase(vals, types) {
    Object.keys(vals).forEach((k) => {
      if (CASE_DEF[k] == null) return;
      let v = vals[k]; if (!isFinite(v)) return;
      if (types && types[k] === 'pct') v = Math.round(v * 1e6) / 1e6;
      else if (types && types[k] === 'int') v = Math.round(v);
      else v = Math.round(v * 100) / 100;
      cset(k, v);
    });
  }
  /** rate fields: values above max (percent) are replaced by max while typing; the stored value is capped too */
  function capPct(ctx, id, max) {
    const inp = ctx.$(`[data-field="${id}"] input`); if (!inp) return;
    inp.addEventListener('input', () => {
      const v = parseFloat(String(inp.value).replace(/[^0-9.\-]/g, ''));
      if (isFinite(v) && v > max) inp.value = String(max);
    });
  }
  /** hypothetical-return notice on the first touch of a rate field in this screen visit (shared component) */
  function guardRor(ctx, id) { if (has('disclosure', 'guard')) EFA.lib.disclosure.guard(ctx, id); }
  /** the historic-inflation opener for a field (shared component); empty until the library lands */
  function infLink(ctx, field) { return has('inflation', 'link') ? EFA.lib.inflation.link(ctx, { field }) : ''; }
  /** the Documentation opener (shared worksheet); empty until the library lands */
  function wsButton(ctx, data, style) { return has('worksheet', 'button') ? EFA.lib.worksheet.button(ctx, { data, style: style || '' }) : ''; }
  function wsOpen(ctx, data) { if (has('worksheet', 'open')) EFA.lib.worksheet.open(ctx, data); }
  /** the shared hypothetical-illustration line, or this screen's own copy key until the library lands */
  function hypo(ctx, fallbackKey) { return has('disclosure', 'html') ? EFA.lib.disclosure.html('hypothetical') : ctx.t(fallbackKey); }
  const HYPO = 'This is a hypothetical illustration. It is not a guarantee or a projection of any specific product, and actual results will vary.';
  const docIcon = `<span class="b10-li"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${P.goldLt}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/></svg></span>`;
  const tableIcon = `<span class="b10-li"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${P.goldLt}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M4 15h16M11 4v16"/></svg></span>`;

  /* ---------- illustrations (flat duotone, navy and gold on paper) ---------- */
  /** the family home used across the mortgage screens: two-story house, lawn and driveway, soft oval edges */
  function homeScene(o) {
    o = o || {};
    const id = uid('h'), sky = o.sky !== false;
    const siding = [];
    for (let y = 186; y <= 230; y += 9) siding.push(`M124 ${y}H296`);
    for (let y = 128; y <= 172; y += 9) siding.push(`M124 ${y}H296`);
    const win = (x, y, w, h, glow) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${glow ? P.goldPale : P.mist}" stroke="${P.navy}" stroke-width="3"/><path d="M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}" stroke="${P.navy}" stroke-width="1.6"/>`;
    return `<svg viewBox="0 0 480 320" preserveAspectRatio="xMidYMid meet" aria-hidden="true" class="b10-ill">
      <defs>
        <radialGradient id="${id}v"><stop offset=".88" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
        <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="480" height="320"><ellipse cx="240" cy="160" rx="240" ry="160" fill="url(#${id}v)"/></mask>
        <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe6f0"/><stop offset="1" stop-color="${P.paper}"/></linearGradient>
        <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece0b4"/><stop offset="1" stop-color="#dcc684"/></linearGradient>
      </defs>
      <g mask="url(#${id}m)">
        ${sky ? `<rect width="480" height="320" fill="url(#${id}s)"/><circle cx="384" cy="78" r="21" fill="${P.goldPale}"/><circle cx="384" cy="78" r="13" fill="#f6edd0"/>` : ''}
        <path d="M0 212Q70 178 140 202T280 194T400 188T480 202V250H0z" fill="${P.mist2}" opacity=".8"/>
        <rect x="0" y="234" width="480" height="86" fill="url(#${id}g)"/>
        <path d="M0 274H480" stroke="#fff" stroke-opacity=".28" stroke-width="14"/>
        <g><rect x="74" y="188" width="11" height="50" fill="${P.navy}"/><circle cx="80" cy="170" r="34" fill="${P.navy3}"/><circle cx="102" cy="152" r="25" fill="${P.navy4}"/><circle cx="58" cy="154" r="23" fill="${P.navy4}"/><circle cx="80" cy="138" r="24" fill="${P.navy3}"/></g>
        <g><rect x="410" y="194" width="10" height="44" fill="${P.navy}"/><circle cx="415" cy="176" r="29" fill="${P.navy4}"/><circle cx="430" cy="158" r="20" fill="${P.navy3}"/><circle cx="400" cy="160" r="18" fill="${P.navy3}"/></g>
        <path d="M310 236H370L448 320H286Z" fill="${P.mist2}"/>
        <path d="M310 236L286 320M370 236L448 320" stroke="${P.navy}" stroke-opacity=".25" stroke-width="2"/>
        <path d="M200 236H218L230 320H188Z" fill="${P.mist}"/>
        ${shadow(250, 238, 150, 6)}
        <path d="M294 176L318 148H376L392 176Z" fill="${P.navy3}"/>
        <rect x="300" y="172" width="84" height="64" fill="${P.paper}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
        <rect x="312" y="186" width="60" height="50" fill="${P.paper}" stroke="${P.navy}" stroke-width="3"/>
        <path d="M312 198h60M312 210h60M312 222h60" stroke="${P.mist2}" stroke-width="2.4"/>
        <rect x="248" y="58" width="20" height="46" fill="${P.navy3}"/>
        <rect x="120" y="118" width="180" height="118" fill="${P.paper}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
        <path d="${siding.join('')}" stroke="${P.mist2}" stroke-width="1.4"/>
        <path d="M120 178H300" stroke="${P.navy}" stroke-width="3"/>
        <path d="M106 124L210 50L314 124Z" fill="${P.navy}" stroke="${P.navy}" stroke-width="6" stroke-linejoin="round"/>
        <path d="M122 116L210 58L298 116" fill="none" stroke="${P.gold}" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="210" cy="96" r="11" fill="${P.goldPale}" stroke="${P.gold}" stroke-width="3"/>
        ${win(136, 134, 30, 34, false)}${win(195, 134, 30, 34, true)}${win(254, 134, 30, 34, false)}
        ${win(134, 190, 40, 32, true)}${win(246, 190, 40, 32, false)}
        <rect x="190" y="174" width="40" height="8" rx="2" fill="${P.navy}"/>
        <rect x="197" y="184" width="26" height="52" rx="2" fill="${P.gold}"/>
        <circle cx="217" cy="212" r="2.4" fill="${P.navy}"/>
        <g fill="${P.navy3}"><circle cx="130" cy="234" r="11"/><circle cx="150" cy="236" r="9"/><circle cx="244" cy="236" r="9"/><circle cx="264" cy="233" r="12"/><circle cx="286" cy="236" r="8"/></g>
        <g fill="${P.goldLt}"><circle cx="128" cy="229" r="2.4"/><circle cx="152" cy="232" r="2"/><circle cx="262" cy="228" r="2.4"/><circle cx="246" cy="232" r="2"/></g>
      </g>
    </svg>`;
  }

  /** filled curved arrow along a quadratic curve: tail p0, control c, tip p1 */
  function arrowPath(p0, c, p1, o) {
    o = o || {};
    const w0 = o.w0 || 36, w1 = o.w1 || 30, hl = o.hl || 74, hw = o.hw || 50;
    const B = (t) => [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]];
    const D = (t) => [2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]), 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1])];
    let th = 1, acc = 0, prev = p1;
    for (let i = 1; i <= 600; i++) { const t = 1 - i / 600, q = B(t); acc += Math.hypot(q[0] - prev[0], q[1] - prev[1]); prev = q; if (acc >= hl) { th = t; break; } }
    const L = [], R = [], n = 30;
    for (let i = 0; i <= n; i++) {
      const t = (th * i) / n, q = B(t), d = D(t), len = Math.hypot(d[0], d[1]) || 1;
      const nx = -d[1] / len, ny = d[0] / len, w = (w0 + (w1 - w0) * (i / n)) / 2;
      L.push([q[0] + nx * w, q[1] + ny * w]); R.push([q[0] - nx * w, q[1] - ny * w]);
    }
    const qh = B(th), dx = p1[0] - qh[0], dy = p1[1] - qh[1], lh = Math.hypot(dx, dy) || 1, nx = -dy / lh, ny = dx / lh;
    const pts = L.concat([[qh[0] + nx * hw, qh[1] + ny * hw], p1, [qh[0] - nx * hw, qh[1] - ny * hw]], R.reverse());
    return 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z';
  }
  function arrowSvg(list) {
    const g = uid('a');
    return `<svg class="b10-full" viewBox="0 0 1600 900" aria-hidden="true"><defs>${goldGrad(g, P.goldLt, P.gold)}</defs>
      ${list.map((a) => { const d = arrowPath(a.p0, a.c, a.p1, a.o); return `<path d="${d}" fill="rgba(13,30,58,.13)" transform="translate(5 9)"/><path d="${d}" fill="url(#${g})" stroke="${P.gold}" stroke-width="3" stroke-linejoin="round"/>`; }).join('')}</svg>`;
  }

  const ill = {
    cityBus() {
      const wins = [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${40 + i * 36}" y="58" width="28" height="38" rx="5" fill="${P.mist}"/>`).join('');
      return `<svg viewBox="0 0 320 200" class="b10-ill" aria-hidden="true">${shadow(160, 182, 140, 9)}
        <rect x="34" y="34" width="246" height="16" rx="8" fill="${P.navy3}"/>
        <rect x="70" y="38" width="120" height="7" rx="3.5" fill="${P.goldLt}"/>
        <rect x="22" y="44" width="278" height="120" rx="18" fill="${P.navy}"/>
        ${wins}
        <path d="M262 58h20c8 0 14 6 14 14v28h-34z" fill="${P.mist}"/>
        <rect x="22" y="108" width="278" height="9" fill="${P.gold}"/>
        <rect x="150" y="100" width="26" height="56" rx="3" fill="${P.mist2}"/><path d="M163 100v56" stroke="${P.navy}" stroke-width="2.4"/>
        <rect x="284" y="124" width="12" height="14" rx="4" fill="${P.goldLt}"/>
        <rect x="18" y="152" width="286" height="12" rx="6" fill="${P.navy2}"/>
        ${[78, 244].map((x) => `<circle cx="${x}" cy="164" r="21" fill="${P.navy2}" stroke="${P.paper}" stroke-width="4"/><circle cx="${x}" cy="164" r="8" fill="${P.gold}"/>`).join('')}
      </svg>`;
    },
    sportsCar() {
      return `<svg viewBox="0 0 330 170" class="b10-ill" aria-hidden="true">${shadow(165, 156, 146, 9)}
        <path d="M14 122C14 110 22 102 36 100L104 92C124 72 150 58 182 56H204C230 58 250 70 268 88L300 94C314 97 322 106 322 118V128C322 134 318 138 312 138H24C18 138 14 134 14 128Z" fill="${P.gold}"/>
        <path d="M118 92C134 76 156 66 180 64H196V92Z" fill="${P.navy3}"/>
        <path d="M204 64H208C228 66 244 76 256 90L204 92Z" fill="${P.navy3}"/>
        <path d="M16 100 46 94" stroke="${P.navy}" stroke-width="6" stroke-linecap="round"/>
        <path d="M30 112H306" stroke="${P.goldDeep}" stroke-width="3" stroke-linecap="round"/>
        <path d="M200 98v30" stroke="${P.goldDeep}" stroke-width="2.4" stroke-linecap="round"/>
        <rect x="216" y="116" width="34" height="7" rx="3.5" fill="${P.navy}"/>
        <path d="M296 102h20" stroke="${P.paper}" stroke-width="7" stroke-linecap="round"/>
        <path d="M18 108h12" stroke="${P.navy}" stroke-width="7" stroke-linecap="round"/>
        ${[82, 252].map((x) => `<path d="M${x - 34} 138a34 34 0 0 1 68 0" fill="${P.navy2}"/><circle cx="${x}" cy="138" r="26" fill="${P.navy}" stroke="${P.paper}" stroke-width="4"/><circle cx="${x}" cy="138" r="13" fill="${P.goldLt}"/><circle cx="${x}" cy="138" r="4.5" fill="${P.navy}"/>`).join('')}
      </svg>`;
    },
    schoolBuses() {
      const bus = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${shadow(92, 82, 96, 6)}
        <rect x="0" y="0" width="152" height="66" rx="8" fill="${P.gold}"/>
        <path d="M150 24h20c6 0 10 4 10 10v28c0 4-3 6-6 6h-24z" fill="${P.gold}"/>
        ${[0, 1, 2, 3, 4].map((i) => `<rect x="${10 + i * 25}" y="10" width="18" height="19" rx="3" fill="${P.navy}"/>`).join('')}
        <rect x="139" y="10" width="11" height="19" rx="2" fill="${P.navy}"/>
        <rect x="0" y="38" width="152" height="4" fill="${P.navy}"/><rect x="0" y="48" width="180" height="3" fill="${P.navy}"/>
        <rect x="-4" y="60" width="188" height="8" rx="3" fill="${P.navy}"/>
        ${[34, 140].map((cx) => `<circle cx="${cx}" cy="70" r="13" fill="${P.navy2}"/><circle cx="${cx}" cy="70" r="5" fill="${P.paper}"/>`).join('')}
        <rect x="172" y="40" width="7" height="7" rx="2" fill="${P.goldPale}"/></g>`;
      return `<svg viewBox="4 16 326 186" class="b10-ill" aria-hidden="true">${bus(14, 26, 0.6)}${bus(64, 66, 0.8)}${bus(132, 112, 1)}</svg>`;
    },
    teacher() {
      return `<svg viewBox="0 0 320 220" class="b10-ill" aria-hidden="true">${shadow(160, 206, 138, 8)}
        <path d="M66 162 52 204M176 162l12 42" stroke="${P.goldDeep}" stroke-width="7" stroke-linecap="round"/>
        <rect x="16" y="18" width="210" height="146" rx="7" fill="${P.goldDeep}"/>
        <rect x="27" y="29" width="188" height="124" rx="3" fill="${P.navy}"/>
        <path d="M46 132V58M46 132h150" stroke="${P.paper}" stroke-width="3" stroke-linecap="round" opacity=".85"/>
        <path d="M52 120Q86 70 118 98T190 62" fill="none" stroke="${P.goldLt}" stroke-width="4" stroke-linecap="round"/>
        <path d="M62 48h40M62 60h26M112 48h22" stroke="${P.paper}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
        <circle cx="168" cy="52" r="9" fill="none" stroke="${P.paper}" stroke-width="3" opacity=".7"/>
        <rect x="22" y="160" width="200" height="7" rx="3" fill="${P.goldDeep}"/>
        <path d="M236 206l10-80c2-12 10-18 22-18h8c12 0 20 6 22 18l10 80z" fill="${P.navy3}"/>
        <path d="M262 108l10 22 10-22" fill="${P.paper}"/>
        <path d="M250 128 214 98" stroke="${P.navy3}" stroke-width="13" stroke-linecap="round"/>
        <circle cx="211" cy="95" r="7" fill="${P.goldPale}"/>
        <path d="M206 92 178 70" stroke="${P.gold}" stroke-width="4.5" stroke-linecap="round"/>
        <rect x="264" y="88" width="16" height="20" fill="${P.goldPale}"/>
        <circle cx="272" cy="78" r="20" fill="${P.goldPale}"/>
        <path d="M252 78c0-14 9-22 20-22s21 7 21 20c-5-6-14-9-24-8-6 0-12 4-17 10z" fill="${P.navy}"/>
        <circle cx="291" cy="62" r="8" fill="${P.navy}"/>
        <circle cx="264" cy="80" r="2.2" fill="${P.navy}"/>
      </svg>`;
    },
    /** a man weighing a decision, hand on chin, looking up toward the text on his left */
    thinker() {
      const id = uid('t'), skin = '#f1e4bd', skin2 = '#e2cd92', skin3 = '#cdb06a';
      return `<svg viewBox="0 0 640 820" class="b10-ill" aria-hidden="true"><defs>${navyGrad(id + 's', P.navy4, P.navy3)}
          <clipPath id="${id}c"><circle cx="340" cy="452" r="296"/></clipPath></defs>
        <circle cx="340" cy="452" r="296" fill="${P.mist}"/>
        <circle cx="340" cy="452" r="314" fill="none" stroke="${P.gold}" stroke-width="4" opacity=".6"/>
        <g fill="${P.gold}"><circle cx="186" cy="214" r="11"/><circle cx="138" cy="160" r="16" opacity=".8"/><circle cx="80" cy="92" r="23" opacity=".62"/></g>
        <g clip-path="url(#${id}c)">
          <path d="M92 920C100 760 166 680 270 656L310 648H372L412 656C516 680 582 760 590 920Z" fill="url(#${id}s)"/>
          <path d="M306 648L341 716L376 648Z" fill="${skin}"/>
          <path d="M302 648L341 722L318 736L282 662ZM380 648L341 722L364 736L400 662Z" fill="${P.paper}"/>
          <path d="M341 736V920" stroke="${P.navy2}" stroke-width="3" opacity=".45"/>
          <path d="M300 572H380L376 652Q340 676 304 652Z" fill="${skin2}"/>
          <g transform="rotate(-7 340 620)">
            <ellipse cx="428" cy="466" rx="18" ry="29" fill="${skin}"/>
            <ellipse cx="430" cy="468" rx="8" ry="15" fill="${skin2}"/>
            <path d="M262 470C258 378 302 322 354 322C408 322 438 370 436 440C434 520 400 584 346 586C296 588 266 542 262 470Z" fill="${skin}"/>
            <path d="M258 448C246 358 300 300 358 300C422 300 456 356 444 444L430 444C430 414 418 394 400 386C366 402 316 404 280 384C270 402 264 424 258 448Z" fill="${P.navy}"/>
            <path d="M282 420Q298 408 318 414M344 412Q362 402 382 410" stroke="${P.navy}" stroke-width="6.5" stroke-linecap="round" fill="none"/>
            <ellipse cx="300" cy="440" rx="6.5" ry="8" fill="${P.navy}"/><ellipse cx="360" cy="436" rx="6.5" ry="8" fill="${P.navy}"/>
            <circle cx="298" cy="437" r="2" fill="#fff"/><circle cx="358" cy="433" r="2" fill="#fff"/>
            <path d="M280 452C270 476 266 490 278 496C284 499 292 499 298 496" stroke="${skin3}" stroke-width="5" stroke-linecap="round" fill="none"/>
            <path d="M298 532Q312 538 328 532" stroke="${P.navy}" stroke-width="5" stroke-linecap="round" fill="none"/>
            <circle cx="392" cy="500" r="16" fill="${P.goldLt}" opacity=".25"/>
          </g>
          <path d="M208 940C206 820 228 712 286 636" stroke="${P.navy3}" stroke-width="88" stroke-linecap="round" fill="none"/>
          <path d="M248 640C236 606 252 574 288 566L332 558C352 555 366 568 364 584C362 598 350 604 334 606L306 610C296 640 268 662 248 640Z" fill="${skin}"/>
          <path d="M300 576Q318 574 336 570M302 592Q318 591 334 588" stroke="${skin3}" stroke-width="4" stroke-linecap="round" fill="none"/>
          <path d="M276 600Q284 616 300 612" stroke="${skin3}" stroke-width="4" stroke-linecap="round" fill="none"/>
        </g>
      </svg>`;
    }
  };
  EFA.b10art = { homeScene, ill };

  /* =====================================================================
     MTG: Mortgages
     ===================================================================== */
  const homeCaption = 'Buying a Home Can Set Off\nMajor Transfers of Your Wealth';

  EFA.screen('mtg1', {
    title: 'Two homes, two big transfers of wealth',
    copy: {
      cap: homeCaption,
      _notes: 'A home is usually the largest purchase a family ever makes, and it quietly starts money moving away from you for decades.\n\n- Ask: When you bought your home, who else got paid along the way?\nPAUSE\n\n- Let the client name them. The next screen shows the three channels.'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b10-cameo" style="left:120px;top:96px;width:560px;height:374px">${homeScene()}</div>
        <div class="b10-cameo" style="left:920px;top:96px;width:560px;height:374px">${homeScene()}</div>
        ${arrowSvg([
          { p0: [610, 668], c: [416, 672], p1: [392, 486] },
          { p0: [990, 668], c: [1184, 672], p1: [1208, 486] }
        ])}
        <div class="b10-caption" style="left:410px;top:636px;width:780px;height:150px">${ctx.t('cap')}</div>`;
    }
  });

  EFA.screen('mtg2', {
    title: 'Three homes: the price, the lender, the taxes',
    copy: {
      cap: homeCaption,
      _notes: 'There are three channels: the price of the home itself, the lender who earns interest on it, and the taxes that come with owning it.\n\n- Point to each picture in turn as you name it.\n- Ask: Of the three, which one do you think costs the most over a lifetime?\nPAUSE'
    },
    render(ctx) {
      const homes = [300, 800, 1300];
      ctx.el.innerHTML = `
        <div class="b10-backdrop" style="left:665px;top:22px;width:270px;height:280px">${A.ill.bank()}</div>
        <div class="b10-backdrop" style="left:1165px;top:30px;width:270px;height:262px">${A.ill.taxes()}</div>
        ${homes.map((x) => `<div class="b10-cameo" style="left:${x - 232}px;top:182px;width:464px;height:300px">${homeScene({ sky: x === 300 })}</div>`).join('')}
        ${arrowSvg([
          { p0: [540, 716], c: [300, 724], p1: [296, 506], o: { w0: 34, w1: 28, hl: 66, hw: 46 } },
          { p0: [800, 660], c: [800, 590], p1: [800, 500], o: { w0: 36, w1: 34, hl: 66, hw: 48 } },
          { p0: [1060, 716], c: [1300, 724], p1: [1304, 506], o: { w0: 34, w1: 28, hl: 66, hw: 46 } }
        ])}
        <div class="b10-caption" style="left:470px;top:668px;width:660px;height:138px;font-size:38px">${ctx.t('cap')}</div>`;
    }
  });

  /* mortgage inputs (mtg3) and investment return (mtg6) */
  function inputScreen(ctx, rows, top) {
    ctx.el.innerHTML = `
      <div class="b10-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule">${ctx.t('sub', { tag: 'p', cls: 'b10-sub' })}</div>
      <div class="b10-form big ${rows.length === 1 ? 'one' : ''} st-card" style="top:${top}px;width:${rows.length === 1 ? 820 : 780}px">${rows.map((o) => frow(ctx, o)).join('')}</div>`;
    const types = {}; rows.forEach((o) => { types[o.id] = o.type; });
    ctx.onFields((v) => syncCase(v, types));
  }
  EFA.screen('mtg3', {
    title: 'Mortgage inputs',
    copy: {
      head: 'Fill In the Details Below', sub: 'so we can see what your mortgage really costs',
      lbAmt: 'Amount Financed', lbRate: 'Interest Rate', lbTerm: 'Term in Years',
      _notes: 'Three facts are all we need: how much you borrowed, the rate, and how long you have to pay it back.\n\n- Use the client\'s real numbers if they have them; the defaults are a typical example.\n- Ask: When you signed the papers, did anyone show you the total you would pay over the life of the loan?\nPAUSE'
    },
    render(ctx) {
      inputScreen(ctx, [
        { id: 'mortgage_finance_amount', label: 'lbAmt', type: 'money', min: 0 },
        { id: 'mortgage_interest_rate', label: 'lbRate', type: 'pct', min: 0 },
        { id: 'mortgage_term_in_years', label: 'lbTerm', type: 'int', min: 0 }
      ], 350);
    }
  });
  EFA.screen('mtg6', {
    title: 'Investment return input',
    copy: {
      head: 'What Could Your Money Earn?', sub: 'the return on money you invest shows the true opportunity cost of your mortgage',
      lbRor: 'Investment Return',
      _notes: 'Every mortgage payment is a dollar that could have been working for you somewhere else.\n\n- Use a conservative rate the client is comfortable with.\n- Ask: If those payments had been invested instead, what return would feel reasonable to you?\nPAUSE'
    },
    render(ctx) {
      inputScreen(ctx, [{ id: 'case_file_ror_accumulation', label: 'lbRor', type: 'pct', min: 0 }], 430);
    }
  });

  /* ---------- the mortgage engine (mtg5, mtg7) ---------- */
  const mortgage = {
    /** monthly payment, end of month: A at annual rate R (fraction) for T years */
    payment(A, R, T) {
      const i = R / 12, N = Math.round(12 * T);
      if (N <= 0) return 0;
      if (i === 0) return A / N;
      const f = Math.pow(1 + i, N);
      return (A * i * f) / (f - 1);
    },
    /** total paid, total interest, and the future value of every payment invested monthly at G (fraction) */
    costs(A, R, T, G) {
      const N = Math.round(12 * T), P = mortgage.payment(A, R, T);
      const totalPaid = P * T * 12, interest = totalPaid - A;
      const j = (G || 0) / 12;
      const oc = j === 0 ? P * N : P * (Math.pow(1 + j, N) - 1) / j;
      return { payment: P, totalPaid, interest, oc, months: N };
    }
  };
  EFA.engines = EFA.engines || {};
  EFA.engines.mortgageCost = mortgage;

  /** cost pie: level 1 loan, 2 adds lifetime interest, 3 adds the opportunity cost of the payments */
  function costPie(ctx, level) {
    const cx = 800, cy = 446, r = 386, ex = 16;
    const A0 = cget('mortgage_finance_amount'), R = cget('mortgage_interest_rate'), T = cget('mortgage_term_in_years');
    const G = cget('case_file_ror_accumulation');
    const c = mortgage.costs(A0, R, T, G);
    const ids = { m: uid('pm'), g1: uid('pg'), g2: uid('pg'), g3: uid('pg') };
    const mainEnd = { 1: 480, 2: 420, 3: 360 }[level];
    const fillFor = (k) => {
      const order = level === 1 ? ['loan'] : level === 2 ? ['int', 'loan'] : ['oc', 'int', 'loan'];
      const idx = order.indexOf(k);
      return idx === 0 ? `url(#${ids.g1})` : idx === 1 ? `url(#${ids.g2})` : `url(#${ids.g3})`;
    };
    const slices = [{ k: 'loan', a0: 120, a1: 180 }];
    if (level >= 2) slices.push({ k: 'int', a0: 60, a1: 120 });
    if (level >= 3) slices.push({ k: 'oc', a0: 0, a1: 60 });
    const off = (a) => [ex * Math.sin(a * Math.PI / 180), -ex * Math.cos(a * Math.PI / 180)];
    const paths = slices.map((s) => {
      const [dx, dy] = off((s.a0 + s.a1) / 2);
      return `<path d="${A.wedge(cx + dx, cy + dy, r, s.a0 + 0.5, s.a1 - 0.5)}" fill="${fillFor(s.k)}"/>`;
    }).join('');
    const box = (k, x0, x1, y0, y1) => { const s = slices.find((q) => q.k === k), [dx, dy] = off((s.a0 + s.a1) / 2); return `left:${cx + dx + x0}px;top:${cy + dy + y0}px;width:${x1 - x0}px;height:${y1 - y0}px`; };
    const T0 = Math.round(T);
    let labs = `<div class="b10-sl" style="${box('loan', 24, 254, 148, 252)}">${ctx.t('loanA', { cls: 'cap' })}<span class="big">${money(A0)}</span><span class="sm">${ctx.t('loanB')} ${num(F.int(T0))} ${ctx.t('loanC')} ${pct2(R)}</span></div>`;
    if (level >= 2) labs += `<div class="b10-sl" style="${box('int', 140, 372, -60, 60)}">${ctx.t('intA', { cls: 'cap' })}<span class="big">${money(c.interest)}</span></div>`;
    if (level >= 3) labs += `<div class="b10-sl" style="${box('oc', 22, 254, -290, -164)}">${ctx.t('ocA', { cls: 'cap' })}<span class="big" style="font-size:35px">${money(c.oc)}</span><span class="sm">${ctx.t('ocB')} ${pct2(G)} ${ctx.t('ocC')} ${num(F.int(T0))} ${ctx.t('ocD')}</span></div>`;
    const note = level >= 2 ? `<div class="b10-note" style="left:1230px;top:${level === 3 ? 92 : 300}px;width:262px">${ctx.t('disc')}${level === 3 ? ' ' + hypo(ctx, 'hypo') : ''}</div>` : '';
    ctx.el.innerHTML = `<svg class="b10-full" viewBox="0 0 1600 900" aria-hidden="true"><defs>
        ${navyGrad(ids.m, P.navy4, P.navy)}${goldGrad(ids.g1, P.goldLt, P.gold)}${goldGrad(ids.g2, '#ecdca6', '#d9c278')}${goldGrad(ids.g3, '#f5ecd0', '#e8d9a6')}</defs>
        <circle cx="${cx}" cy="${cy + 12}" r="${r + 8}" fill="rgba(13,30,58,.07)"/>
        <path d="${A.wedge(cx, cy, r, 180.5, mainEnd - 0.5)}" fill="url(#${ids.m})"/>
        ${paths}</svg>
      ${labs}${note}
      <div class="b10-cameo" style="left:34px;top:648px;width:340px;height:226px">${homeScene()}</div>`;
    return c;
  }
  const pieCopy = { loanA: 'Borrowing', loanB: 'for', loanC: 'years at' };
  EFA.screen('mtg4', {
    title: 'Cost pie, slice 1: the loan',
    copy: Object.assign({}, pieCopy, {
      _notes: 'This slice is the part everyone sees: the amount you borrowed, the term and the rate.\n\n- Ask: Is the loan amount the real cost of your home?\nPAUSE\n\n- Most people say yes. The next two slices are why the answer is no.'
    }),
    render(ctx) { costPie(ctx, 1); }
  });
  EFA.screen('mtg5', {
    title: 'Cost pie, slice 2: lifetime interest',
    copy: Object.assign({}, pieCopy, {
      intA: 'Plus interest of',
      disc: 'For illustration only, using the loan details entered. This is not a rate quote or an offer to lend.',
      _notes: 'Over the life of the loan, the lender collects interest on top of what you borrowed. On a typical 30-year loan it is more than the house price itself.\n\n- Ask: How does it feel to see the interest sitting right next to the loan?\nPAUSE'
    }),
    render(ctx) { costPie(ctx, 2); }
  });
  EFA.screen('mtg7', {
    title: 'Cost pie, slice 3: opportunity cost of the payments',
    copy: Object.assign({}, pieCopy, {
      intA: 'Plus interest of',
      ocA: 'Opportunity cost', ocB: 'at', ocC: 'over', ocD: 'years',
      disc: 'Each monthly payment is assumed to be invested at a fixed rate, with no taxes, fees or market changes.', hypo: HYPO,
      _notes: 'This is the slice nobody shows you: what every one of those payments could have grown to if it had stayed working for you.\n\n- Walk the slices: the loan, the interest, and the opportunity cost.\n- Ask: Knowing the full cost, would you want to look at how your home is financed?\nPAUSE'
    }),
    render(ctx) { costPie(ctx, 3); }
  });

  /* =====================================================================
     Needs and wants (nvsw1, hmc2)
     ===================================================================== */
  function needsWants(ctx, withQ) {
    const rows = [
      { need: ill.cityBus(), want: ill.sportsCar() },
      { need: A.ill.house(), want: homeScene() },
      { need: ill.schoolBuses(), want: ill.teacher() }
    ];
    const dec = `<span class="b10-dec"><svg viewBox="0 0 150 28" aria-hidden="true"><path d="M144 14H12M28 3 10 14l18 11" fill="none" stroke="${P.gold}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>${ctx.t('decision')}<svg viewBox="0 0 150 28" aria-hidden="true"><path d="M6 14h132M122 3l18 11-18 11" fill="none" stroke="${P.gold}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
    ctx.el.innerHTML = `
      <div class="b10-nw b10-nwh">${ctx.t('needs', { tag: 'div', cls: 'lbl' })}<div>${withQ ? '' : dec}</div>${ctx.t('wants', { tag: 'div', cls: 'lbl' })}</div>
      ${rows.map((r, i) => `
        <div class="b10-nw b10-row b10-f" data-row="${i + 1}" style="top:${114 + i * 246}px;height:222px">
          <div class="b10-nwbox st-card" data-side="0"><div class="art">${r.need}</div></div>
          <div class="b10-mid">${withQ ? ctx.t('q' + (i + 1), { tag: 'p', cls: 'b10-q' }) : ''}
            <div class="b10-sld"><input class="b10-range" type="range" min="1" max="99" step="1" value="50" aria-label="Need or want"><span class="b10-bub num">50</span></div></div>
          <div class="b10-nwbox st-card" data-side="1"><div class="art">${r.want}</div></div>
        </div>`).join('')}`;
    const apply = (row, v) => {
      const inp = row.querySelector('.b10-range');
      inp.value = v; inp.style.setProperty('--p', ((v - 1) / 98 * 100) + '%');
      const arts = row.querySelectorAll('.art');
      arts[0].style.opacity = Math.max(1 - v / 100, 0.1);
      arts[1].style.opacity = Math.max(v / 100, 0.1);
      const bub = row.querySelector('.b10-bub'), w = inp.offsetWidth || 552;
      bub.textContent = v; bub.style.left = (24 + (v - 1) / 98 * (w - 48)) + 'px';
    };
    ctx.$$('.b10-row').forEach((row) => {
      const inp = row.querySelector('.b10-range'), sld = row.querySelector('.b10-sld');
      apply(row, 50);
      inp.addEventListener('input', () => apply(row, +inp.value));
      inp.addEventListener('pointerdown', () => sld.classList.add('drag'));
      inp.addEventListener('change', () => { sld.classList.remove('drag'); inp.blur(); });
      inp.addEventListener('pointerup', () => sld.classList.remove('drag'));
      ctx.on(Array.from(row.querySelectorAll('.b10-nwbox')), 'click', (e, n) => apply(row, n.dataset.side === '1' ? 99 : 1));
    });
  }
  function needsWantsStep(ctx, n, withQ) {
    ctx.$$('.b10-row').forEach((row) => {
      const r = +row.dataset.row;
      ctx.show(row, n >= r);
      if (withQ) { const q = row.querySelector('.b10-q'); if (q) q.classList.toggle('hide', n !== r); }
    });
  }
  EFA.screen('nvsw1', {
    title: 'Needs or wants? Three decision sliders',
    steps: 4,
    copy: {
      needs: 'Needs', wants: 'Wants', decision: 'Decision',
      _notes: 'Most big decisions sit somewhere between a pure need and a pure want. Let the client place each one.\n\n- Click forward to bring in getting around, housing and schooling one at a time.\n- Slide each one, or click a picture to jump to that end.\n- Ask: When the outcome really mattered to you, did you settle for the need or pay for the want?\nPAUSE'
    },
    render(ctx) { needsWants(ctx, false); },
    step(ctx, n) { needsWantsStep(ctx, n, false); }
  });
  EFA.screen('hmc2', {
    title: 'Needs or wants? Sliders with a guiding question',
    steps: 4,
    copy: {
      needs: 'Needs', wants: 'Wants',
      q1: 'Was the car you drive more of a need or a want?',
      q2: 'When you chose your home, was it more of a need or a want?',
      q3: 'Is the schooling you want for your children a need or a want?',
      _notes: 'Same exercise, now about the client\'s own choices. Each question shows while its row is new.\n\n- Let the client move the slider themselves if they like.\n- Ask: If you pay for wants on things that matter, what do you want for your family if you are not here?\nPAUSE'
    },
    render(ctx) { needsWants(ctx, true); },
    step(ctx, n) { needsWantsStep(ctx, n, true); }
  });

  /* =====================================================================
     HMC101: Needs vs. Wants 101
     ===================================================================== */
  EFA.screen('hmc1', {
    title: 'Life insurance is bought out of want, not need',
    copy: {
      big: 'You don’t buy life insurance because you need it.',
      big2: 'You buy it because you want something for the people you love.',
      mid: 'It is the one product designed to carry out your wishes for your family if you are not here.',
      fine: 'The death benefit is paid according to the policy’s terms and is backed by the claims-paying ability of the issuing insurer.',
      _notes: 'Life insurance is not a bare necessity. It is a decision about what you want to happen for the people you love.\n\n- Ask: If you were not here tomorrow, what would you want to be true for your family?\nPAUSE\n\n- Let the answer land before moving on.'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b10-stmt" style="left:110px;top:0;bottom:0;width:640px">${ctx.t('big', { tag: 'p', cls: 'big' })}${ctx.t('big2', { tag: 'p', cls: 'big2' })}<hr class="st-rule">${ctx.t('mid', { tag: 'p', cls: 'mid' })}${ctx.t('fine', { tag: 'p', cls: 'fine' })}</div>
        <div class="b10-abs" style="left:800px;top:16px;width:640px;height:820px">${ill.thinker()}</div>`;
    }
  });

  /* income-multiple guideline (hmc4, hmc6; pti3, pti5). Bands as specified; the fifth band covers 61 through 65
     so the rule and the printed table agree. Override with EFA.data.incomeMultiples = [{upTo, multiple}] if verified. */
  const MULT_BANDS = [{ upTo: 30, m: 30 }, { upTo: 40, m: 25 }, { upTo: 50, m: 20 }, { upTo: 60, m: 15 }, { upTo: 65, m: 10 }, { upTo: Infinity, m: 5 }];
  function bands() {
    const d = EFA.data && EFA.data.incomeMultiples;
    if (Array.isArray(d) && d.length) return d.map((b) => ({ upTo: b.upTo == null ? Infinity : b.upTo, m: b.multiple }));
    return MULT_BANDS;
  }
  function multiplierFor(age) { const b = bands(); for (let i = 0; i < b.length; i++) if (age <= b[i].upTo) return b[i].m; return b[b.length - 1].m; }
  EFA.engines.incomeMultiple = { multiplierFor, bands };

  EFA.screen('hmc4', {
    title: 'How much coverage could you own? (income-multiple guideline)',
    steps: 2,
    copy: {
      head: 'How Much Life Coverage Could You Own?',
      lbAge: 'Current Age', lbInc: 'Annual Income', calc: 'Calculate', link: 'Guidelines',
      hlA: 'Average maximum coverage attainable:',
      sA: 'The industry-wide average maximum for your age group is', sB: 'times your current income.',
      disc: 'This is a general industry guideline, not an underwriting decision or an offer of coverage, and it is not specific to any carrier or product. Your actual maximum depends on your health, finances and other circumstances.',
      gTitle: 'Common Industry Guidelines', colAge: 'Age', colMult: 'Income Multiplier',
      b1: 'Up to 30', b2: '31 to 40', b3: '41 to 50', b4: '51 to 60', b5: '61 to 65', b6: '66 and over',
      _notes: 'Insurers cap coverage at a multiple of income that shrinks with age. This shows roughly how much the market would let the client own.\n\n- Enter age and income, then Calculate. Guidelines shows the full table.\n- Ask: Were you aware you could own this much protection for your family?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b10-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule"></div>
        <div class="b10-form st-card" style="top:206px;width:680px">
          ${frow(ctx, { id: 'case_file_current_age', label: 'lbAge', type: 'int', min: 0 })}
          ${frow(ctx, { id: 'case_file_current_income', label: 'lbInc', type: 'money', min: 0 })}
        </div>
        <div class="b10-actions b10-f calc" style="top:440px"><button type="button" class="st-pill b10-btn" data-calc>${ctx.t('calc')}</button></div>
        <div class="b10-result st-card b10-f res" style="top:432px;width:1120px">
          <div class="b10-hl" style="width:86%">${ctx.t('hlA')} <span class="amt"></span></div>
          <p class="b10-sent">${ctx.t('sA')} <span class="mult"></span> ${ctx.t('sB')}</p>
          <p class="b10-disc">${ctx.t('disc')}</p>
        </div>
        <div class="b10-actions b10-f res" style="top:742px"><button type="button" class="b10-link" data-guide>${tableIcon}${ctx.t('link')}</button></div>`;
      const calc = () => {
        const age = cget('case_file_current_age'), inc = cget('case_file_current_income'), m = multiplierFor(age);
        ctx.$('.amt').innerHTML = money(inc * m);
        ctx.$('.mult').innerHTML = num(m);
      };
      ctx.onFields((v) => { syncCase(v, { case_file_current_age: 'int' }); calc(); });
      calc();
      ctx.on(ctx.$('[data-calc]'), 'click', () => ctx.next());
      ctx.on(ctx.$('[data-guide]'), 'click', () => {
        const age = cget('case_file_current_age'), b = bands();
        const rows = b.map((x, i) => `<tr class="${multiplierFor(age) === x.m && (i === 0 || age > b[i - 1].upTo) ? 'hl' : ''}"><td>${ctx.t('b' + (i + 1))}</td><td>${num(x.m)}</td></tr>`).join('');
        ctx.overlay({ title: ctx.t('gTitle'), cls: 'b10-pop', html: `<table class="st-table"><thead><tr><th style="width:30%">${ctx.t('colAge')}</th><th>${ctx.t('colMult')}</th></tr></thead><tbody>${rows}</tbody></table>` });
      });
    },
    step(ctx, n) { ctx.show('.calc', n === 0); ctx.show('.res', n === 1); }
  });

  EFA.screen('hmc6', {
    title: 'Coverage summary',
    steps: 5,
    copy: {
      head: 'Coverage Summary',
      l1: 'Maximum Coverage Guideline', l2: 'Current Coverage In Force', l3: 'Coverage Needed to Reach Your Goals',
      l4: 'Insurance Coverage Shortfall', l4s: 'Coverage Above Your Goals',
      q: 'How Much Coverage Do You Want?',
      disc: 'Planning estimates only. They are not an underwriting decision or an offer of coverage.',
      _notes: 'Bring it together one line at a time: what the market would let you own, what you own today, what your goals need, and the gap.\n\n- Click forward to reveal each line.\n- Then ask the question on the screen and stop talking.\nPAUSE'
    },
    render(ctx) {
      const age = cget('case_file_current_age'), inc = cget('case_file_current_income');
      const max = inc * multiplierFor(age), have = cget('policy_proceeds'), need = cget('temp_coverage_needed') || 0;
      const gap = Math.abs(need - have), surplus = have > need;
      const bar = (k, label, v, cls) => `<div class="b10-bar st-card b10-f ${cls || ''}" data-bar="${k}">${ctx.t(label, { cls: 'l' })}<span class="v num">${F.money(v)}</span></div>`;
      ctx.el.innerHTML = `
        <div class="b10-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule"></div>
        <div class="b10-bars">${bar(1, 'l1', max)}${bar(2, 'l2', have)}${bar(3, 'l3', need)}${bar(4, surplus ? 'l4s' : 'l4', gap, 'key')}</div>
        ${ctx.t('q', { tag: 'div', cls: 'b10-closeq' })}
        <div class="b10-note c b10-f bars-note" style="left:110px;right:110px;top:784px">${ctx.t('disc')}</div>`;
    },
    step(ctx, n) {
      ctx.$$('[data-bar]').forEach((b) => ctx.show(b, n >= +b.dataset.bar));
      ctx.show('.bars-note', n >= 1);
    }
  });

  /* =====================================================================
     OPPCOST: Opportunity Cost
     ===================================================================== */
  EFA.screen('oppcost1', {
    title: 'What opportunity cost means',
    copy: {
      def: 'Every dollar you have faces a choice: spend it or invest it. A dollar you invest can keep growing for years. A dollar you spend is gone for good, along with everything it could have grown into. That future value you give up is called opportunity cost.',
      q1: 'So, in your own words, what is opportunity cost?',
      p1a: '...does an expense ever earn you any interest?',
      p1b: '...once the money is spent, can you still get to it?',
      q2: 'What if you had invested that money instead? What would it be worth down the road?',
      ans: '...that future worth is your opportunity cost.',
      _notes: 'Define it once, then let the client say it back in their own words.\n\n- Read the first question and wait.\nPAUSE\n\n- Use the two prompts only if the client needs help.\n- Ask the second question and let the client answer before you read the last line.\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b10-tcard st-card">
        ${ctx.t('def', { tag: 'p', cls: 'def' })}
        <hr class="st-rule">
        ${ctx.t('q1', { tag: 'p', cls: 'q' })}
        ${ctx.t('p1a', { tag: 'p', cls: 'pr' })}
        ${ctx.t('p1b', { tag: 'p', cls: 'pr' })}
        ${ctx.t('q2', { tag: 'p', cls: 'q' })}
        ${ctx.t('ans', { tag: 'p', cls: 'ans' })}
      </div>`;
    }
  });

  /* ---------- opportunity cost of a one-time expense (oppcost2) ---------- */
  const oppCost = {
    /** interest an expense E would have earned at annual rate R (fraction, compounded monthly) over N years */
    run(E, R, N) {
      const m = R / 12, months = Math.ceil(Math.max(0, N * 12) - 1e-9);
      let cum = 0; const rows = [];
      for (let i = 1; i <= months; i++) { const it = (E + cum) * m; cum += it; rows.push({ month: i, interest: it, cumulative: cum, year: Math.ceil(i / 12) }); }
      return { total: cum, rows };
    }
  };
  EFA.engines.oppCost = oppCost;

  EFA.screen('oppcost2', {
    title: 'Cost of a purchase including opportunity cost',
    copy: {
      head: 'What Does a Purchase Really Cost?',
      lbExp: 'Expense', lbRor: 'Investment Return', lbYrs: 'Years to Project', calc: 'Calculate',
      s1: 'Had that', s2: 'been invested instead at', s3: 'APR, compounded monthly for', s4: 'years, it would have grown by', s5: 'beyond the original amount.',
      s6: 'Opportunity cost of the purchase:',
      hypo: HYPO,
      wsHead: 'Lost Opportunity Cost Schedule', wsMonth: 'Month', wsInt: 'Interest This Month', wsCum: 'Cumulative Interest', wsYear: 'Year',
      _notes: 'The price tag is only part of the cost. The rest is what that money could have earned if it had stayed invested.\n\n- Use a purchase the client is weighing right now.\n- Ask: Knowing the full cost, is this still the best use of that money?\nPAUSE'
    },
    render(ctx) {
      let shown = false;
      ctx.el.innerHTML = `
        <div class="b10-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule"></div>
        <div class="b10-form st-card" style="top:182px;width:700px">
          ${frow(ctx, { id: 'oppcost_expense', label: 'lbExp', type: 'money', min: 0 })}
          ${frow(ctx, { id: 'oppcost_ror_accumulation', label: 'lbRor', type: 'pct', min: 0, max: 0.12 })}
          ${frow(ctx, { id: 'oppcost_year_time_period', label: 'lbYrs', type: 'int', min: 0 })}
        </div>
        <div class="b10-actions calc" style="top:480px"><button type="button" class="st-pill b10-btn" data-calc>${ctx.t('calc')}</button></div>
        <div class="b10-result st-card res b10-hide" style="top:478px;width:1120px;padding:24px 40px 18px">
          <p class="b10-sent" style="margin:0;font-size:25px;line-height:1.42">${ctx.t('s1')} <span class="e"></span> ${ctx.t('s2')} <span class="r"></span> ${ctx.t('s3')} <span class="n"></span> ${ctx.t('s4')} <span class="x"></span> ${ctx.t('s5')}</p>
          <div class="b10-hl" style="display:inline-block;margin-top:18px">${ctx.t('s6')} <span class="x2"></span></div>
          <p class="b10-disc" style="text-align:center">${hypo(ctx, 'hypo')}</p>
        </div>
        <div class="b10-actions res b10-hide" style="top:772px">${wsButton(ctx, () => sheet())}</div>`;
      const read = () => { const v = ctx.values(); return { E: v.oppcost_expense, R: v.oppcost_ror_accumulation, N: v.oppcost_year_time_period }; };
      const calc = () => {
        const o = read(), res = oppCost.run(o.E, o.R, o.N);
        ctx.$('.e').innerHTML = money(o.E); ctx.$('.r').innerHTML = pct2(o.R); ctx.$('.n').innerHTML = num(F.int(o.N));
        ctx.$('.x').innerHTML = money(res.total); ctx.$('.x2').innerHTML = money(res.total);
      };
      const sheet = () => {
        const o = read(), res = oppCost.run(o.E, o.R, o.N);
        return {
          heading: ctx.t('wsHead'), size: 'small',
          columns: [
            { field: 'month', header: ctx.t('wsMonth'), type: 'int', align: 'center' },
            { field: 'interest', header: ctx.t('wsInt'), type: 'money' },
            { field: 'cumulative', header: ctx.t('wsCum'), type: 'money' },
            { field: 'year', header: ctx.t('wsYear'), type: 'year' }
          ],
          rows: res.rows, filter: 'year',
          assumptions: [{ label: ctx.t('lbExp'), value: F.money(o.E) }, { label: ctx.t('lbRor'), value: F.pct(o.R, 2) }, { label: ctx.t('lbYrs'), value: F.int(o.N) }],
          disclosures: ['hypothetical', 'license']
        };
      };
      const show = () => { ctx.$$('.res').forEach((n) => n.classList.toggle('b10-hide', !shown)); ctx.$('.calc').classList.toggle('b10-hide', shown); };
      ctx.onFields((v) => { syncCase(v, { oppcost_ror_accumulation: 'pct', oppcost_year_time_period: 'int' }); calc(); });
      calc(); show();
      ctx.on(ctx.$('[data-calc]'), 'click', () => { shown = true; calc(); show(); });
      capPct(ctx, 'oppcost_ror_accumulation', 12);
      guardRor(ctx, 'oppcost_ror_accumulation');
    }
  });

  /* =====================================================================
     HMC101 continued: coverage need (hmc5, also pti4)
     ===================================================================== */
  const coverage = {
    /** lump sum that, with savings, pays an income rising with inflation for `years` years and ends at exactly zero */
    lumpSum(o) {
      const N = Math.max(0, Math.round(o.years)), q = (1 + o.inflation) / (1 + o.ror);
      let sum = 0, t = 1;
      for (let k = 0; k < N; k++) { sum += o.income * t; t *= q; }
      return sum - o.savings;
    },
    /** the year-by-year grid behind the lump sum (withdrawal at the start of each year, growth on the rest) */
    schedule(o) {
      const L = coverage.lumpSum(o), N = Math.max(0, Math.round(o.years)), rows = [];
      let b = o.savings + L;
      for (let k = 0; k < N; k++) {
        const w = o.income * Math.pow(1 + o.inflation, k), a = b - w, e = a * o.ror, end = a + e;
        rows.push({ k, begin: b, withdrawal: w, after: a, earnings: e, end }); b = end;
      }
      return { lump: L, rows };
    }
  };
  EFA.engines.coverageNeed = coverage;

  EFA.screen('hmc5', {
    title: 'How much coverage is enough to do what you want?',
    steps: 2,
    copy: {
      head: 'How Much Coverage Would Fund Your Goals?',
      lbInc: 'Annual Income Required', lbSav: 'Accumulated Savings', lbRor: 'Investment Return', lbYrs: 'Years of Income Required', lbInf: 'Inflation Rate',
      calc: 'Calculate',
      rA: 'It would take', rB: 'of life insurance for your family’s income to last', rC: 'years.',
      disc: 'Taxes on savings and investments are not considered. Death benefits are generally income-tax-free to beneficiaries under current tax law, subject to applicable requirements.',
      hypo: HYPO,
      wsHead: 'How Much Coverage Would Fund Your Goals?', wsAge: 'Surviving Spouse Age', wsBegin: 'Balance at Start of Year', wsWd: 'Annual Withdrawal', wsAfter: 'Balance After Withdrawal', wsEarn: 'Annual Earnings', wsEnd: 'Balance at End of Year',
      _notes: 'This finds the amount that would pay your family the income they need, rising with inflation, for as long as you choose.\n\n- Set the years to cover, then Calculate. Documentation shows every year.\n- Ask: If this were in place today, how would you feel about your family\'s future?\nPAUSE'
    },
    render(ctx) {
      const types = { case_file_ror_distribution: 'pct', case_file_ror_inflation: 'pct', proceed_duration_in_years: 'int' };
      ctx.el.innerHTML = `
        <div class="b10-head" style="top:50px">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule"></div>
        <div class="b10-form tight st-card" style="top:160px;width:840px">
          ${frow(ctx, { id: 'case_file_current_income', label: 'lbInc', type: 'money', min: 0 })}
          ${frow(ctx, { id: 'case_file_accumulated_savings', label: 'lbSav', type: 'money', min: 0 })}
          ${frow(ctx, { id: 'case_file_ror_distribution', label: 'lbRor', type: 'pct', min: 0, max: 0.12 })}
          ${frow(ctx, { id: 'proceed_duration_in_years', label: 'lbYrs', type: 'int', min: 1 })}
          ${frow(ctx, { id: 'case_file_ror_inflation', label: 'lbInf', type: 'pct', extra: infLink(ctx, 'case_file_ror_inflation') })}
        </div>
        <div class="b10-actions b10-f calc" style="top:560px"><button type="button" class="st-pill b10-btn" data-calc>${ctx.t('calc')}</button></div>
        <div class="b10-result st-card b10-f res" style="top:540px;width:1060px;padding:22px 36px 18px">
          <div class="b10-hl" style="font-size:30px">${ctx.t('rA')} <span class="amt"></span> ${ctx.t('rB')} <span class="yrs"></span> ${ctx.t('rC')}</div>
          <p class="b10-disc" style="margin-top:14px">${ctx.t('disc')} ${hypo(ctx, 'hypo')}</p>
        </div>
        <div class="b10-actions b10-f res" style="top:798px">${wsButton(ctx, () => sheet())}</div>`;
      const read = () => { const v = ctx.values(); return { income: v.case_file_current_income, savings: v.case_file_accumulated_savings, ror: v.case_file_ror_distribution, years: v.proceed_duration_in_years, inflation: v.case_file_ror_inflation }; };
      const calc = () => {
        const o = read(), L = coverage.lumpSum(o);
        cset('temp_coverage_needed', Math.round(L * 100) / 100);
        ctx.$('.amt').innerHTML = money(L); ctx.$('.yrs').innerHTML = num(F.int(o.years));
      };
      const sheet = () => {
        const o = read(), s = coverage.schedule(o), sp = cget('case_file_spouse_age');
        return {
          heading: ctx.t('wsHead'), size: 'full',
          columns: [
            { field: 'age', header: ctx.t('wsAge'), type: 'age' },
            { field: 'begin', header: ctx.t('wsBegin'), type: 'money', dp: 2 },
            { field: 'wd', header: ctx.t('wsWd'), type: 'money', dp: 2 },
            { field: 'after', header: ctx.t('wsAfter'), type: 'money', dp: 2 },
            { field: 'earn', header: ctx.t('wsEarn'), type: 'money', dp: 2 },
            { field: 'end', header: ctx.t('wsEnd'), type: 'money', dp: 2 }
          ],
          rows: s.rows.map((r) => ({ age: sp + r.k, begin: z(r.begin), wd: z(r.withdrawal), after: z(r.after), earn: z(r.earnings), end: z(r.end) })),
          assumptions: [
            { label: ctx.t('lbInc'), value: F.money(o.income) }, { label: ctx.t('lbSav'), value: F.money(o.savings) },
            { label: ctx.t('lbRor'), value: F.pct(o.ror, 2) }, { label: ctx.t('lbYrs'), value: F.int(o.years) }, { label: ctx.t('lbInf'), value: F.pct(o.inflation, 2) }
          ],
          disclosures: ['hypothetical', 'tax', 'license']
        };
      };
      ctx.onFields((v) => { syncCase(v, types); calc(); });
      calc();
      ctx.on(ctx.$('[data-calc]'), 'click', () => ctx.next());
      capPct(ctx, 'case_file_ror_distribution', 12);
      guardRor(ctx, 'case_file_ror_distribution');
    },
    step(ctx, n) { ctx.show('.calc', n === 0); ctx.show('.res', n === 1); }
  });

  /* =====================================================================
     OE: Operating Efficiency
     ===================================================================== */
  const opEff = {
    /** savings from a cut in operating expense, and the return the outside investment would need to earn the same */
    run(o) {
      const growth = o.oi * o.ror, savings = o.mode === 'amt' ? o.amt : o.opex * o.pct;
      const eq = o.oi > 0 ? Math.round((savings / o.oi) * 100 * 100) / 100 : null;   // percent, 2 decimals
      return { growth, savings, eq };
    }
  };
  EFA.engines.operatingEfficiency = opEff;
  const pctTrim = (x) => (x == null || !isFinite(x) ? '–' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(x) + '%');

  EFA.screen('oe1', {
    title: 'Cutting expenses beats chasing returns (operating efficiency)',
    copy: {
      head: 'Trimming Costs Is a Sign of Sound Money Management',
      lbOpex: 'Annual Operating Expense', lbOI: 'Annual Outside Investment', lbRor: 'O.I. Rate of Return', lbGrow: 'Annual O.I. Growth',
      calc: 'Calculate', cont: 'Continue', repeat: 'Repeat', modeP: '% to $', modeD: '$ to %',
      c1p: 'Reducing expenses by', c1d: 'Reducing expenses by this amount', c2: 'Saves in Dollars',
      c3a: 'Return needed on your', c3b: 'outside investment to earn the same',
      c4: 'Let’s check the math', c4b: 'of', c4c: 'equals', c5: 'Proof',
      _notes: 'For a business owner, a small cut in what the business spends is often worth more than a big return on outside investments.\n\n- Calculate, then Continue to reveal one column at a time. The mode button switches between a percent and a dollar cut.\n- Ask: What return would you need on your outside money to match a one percent cut in expenses?\nPAUSE'
    },
    render(ctx) {
      let calcd = false, stage = -1, mode = 'pct';
      ctx.remember('f.reduce_pct', 0.01); ctx.remember('f.reduce_amt', 1000);   // screen state: fresh on each visit
      const types = { case_file_ror_accumulation: 'pct' };
      const col = (k, lab, val, extra) => `<div class="b10-oecol ${k === 5 ? 'key' : ''}" data-col="${k}"><span class="lb">${lab}</span><div class="vl ${k === 4 ? 'sm' : ''}">${val}</div>${extra || ''}</div>`;
      const go = (k) => `<button type="button" class="st-pill go" data-go="${k}">${ctx.t('cont')}</button>`;
      ctx.el.innerHTML = `
        <div class="b10-head" style="top:34px;gap:14px">${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:52px"' })}<hr class="st-rule"></div>
        <div class="b10-form xt st-card" style="top:128px;width:800px">
          ${frow(ctx, { id: 'case_file_business_operating_expense', label: 'lbOpex', type: 'money', min: 0 })}
          ${frow(ctx, { id: 'case_file_annual_savings', label: 'lbOI', type: 'money', min: 0 })}
          ${frow(ctx, { id: 'case_file_ror_accumulation', label: 'lbRor', type: 'pct', min: 0, max: 0.12 })}
          <div class="b10-frow"><span class="b10-fl">${ctx.t('lbGrow', { cls: 'b10-flab' })}</span><div class="b10-ro growth"></div></div>
          <div class="b10-oefoot calc"><button type="button" class="st-pill b10-btn" data-calc>${ctx.t('calc')}</button></div>
        </div>
        <div class="b10-actions cont1" style="top:398px"><button type="button" class="st-pill b10-btn" data-cont>${ctx.t('cont')}</button></div>
        <div class="b10-result st-card b10-oecard res" style="top:474px;width:1380px;height:232px">
          <div class="b10-oecols">
            ${col(1, `${ctx.t('c1p', { cls: 'mp' })}${ctx.t('c1d', { cls: 'md' })}`, `<div class="mp">${ctx.field({ id: 'reduce_pct', type: 'pct', value: 0.01, min: 0 })}</div><div class="md">${ctx.field({ id: 'reduce_amt', type: 'money', value: 1000, min: 0 })}</div>`)}
            ${col(2, ctx.t('c2'), '<span class="v2"></span>', go(2))}
            ${col(3, `${ctx.t('c3a')} <span class="oi"></span> ${ctx.t('c3b')}`, '<span class="v3"></span>', go(3))}
            ${col(4, ctx.t('c4'), `<span><span class="v4"></span> ${ctx.t('c4b')} <span class="oi"></span> ${ctx.t('c4c')}</span>`, go(4))}
            ${col(5, ctx.t('c5'), '<span class="v5"></span>', go(5))}
          </div>
        </div>
        <div class="b10-actions res2" style="top:724px"><button type="button" class="st-pill b10-mode" data-mode>${ctx.t('modeP', { cls: 'mp' })}${ctx.t('modeD', { cls: 'md' })}</button></div>
        <div class="b10-abs res3" style="top:722px;left:1090px;width:400px;display:flex;justify-content:flex-end"><button type="button" class="st-pill b10-btn" data-repeat style="min-height:50px;padding:8px 34px;font-size:20px">${ctx.t('repeat')}</button></div>`;
      const read = () => { const v = ctx.values(); return { opex: v.case_file_business_operating_expense, oi: v.case_file_annual_savings, ror: v.case_file_ror_accumulation, pct: v.reduce_pct, amt: v.reduce_amt, mode }; };
      const paint = () => {
        const o = read(), r = opEff.run(o);
        ctx.$('.growth').innerHTML = money(r.growth);
        ctx.$('.v2').innerHTML = money(r.savings);
        ctx.$$('.oi').forEach((n) => { n.innerHTML = money(o.oi); });
        ctx.$('.v3').innerHTML = num(pctTrim(r.eq)); ctx.$('.v4').innerHTML = num(pctTrim(r.eq));
        ctx.$('.v5').innerHTML = money(r.savings);
        ctx.$$('.mp').forEach((n) => n.classList.toggle('b10-hide', mode !== 'pct'));
        ctx.$$('.md').forEach((n) => n.classList.toggle('b10-hide', mode !== 'amt'));
        ctx.$('.calc').classList.toggle('b10-hide', calcd);
        ctx.$('.cont1').classList.toggle('b10-hide', !(calcd && stage < 0));
        ctx.$('.res').classList.toggle('b10-hide', stage < 0);
        ctx.$('.res2').classList.toggle('b10-hide', stage < 0);
        ctx.$('.res3').classList.toggle('b10-hide', stage !== 4);
        ctx.$$('[data-col]').forEach((c) => {
          const k = +c.dataset.col;
          if (k > 1) { c.querySelector('.lb').classList.toggle('blank', stage < k - 1); c.querySelector('.vl').classList.toggle('blank', stage < k - 1); }
          const b = c.querySelector('[data-go]'); if (b) b.classList.toggle('b10-hide', stage !== k - 2);
        });
      };
      ctx.onFields((v) => { syncCase(v, types); paint(); });
      paint();
      ctx.on(ctx.$('[data-calc]'), 'click', () => { calcd = true; paint(); });
      ctx.on(ctx.$('[data-cont]'), 'click', () => { stage = 0; paint(); });
      ctx.on(ctx.$$('[data-go]'), 'click', (e, n) => { stage = Math.min(4, +n.dataset.go - 1); paint(); });
      ctx.on(ctx.$('[data-repeat]'), 'click', () => { stage = 0; paint(); });
      ctx.on(ctx.$('[data-mode]'), 'click', () => { mode = mode === 'pct' ? 'amt' : 'pct'; stage = 0; paint(); });
      capPct(ctx, 'case_file_ror_accumulation', 12);
      guardRor(ctx, 'case_file_ror_accumulation');
    }
  });

  /* =====================================================================
     NORL: Pay Me Now or Pay Me Later
     ===================================================================== */
  const norl = {
    /** balances with each contribution at the start of its year and growth once a year */
    run(contribs, r) {
      let b = 0, total = 0; const rows = [];
      contribs.forEach((c, k) => { b += c; total += c; const boy = b, g = b * r; b += g; rows.push({ k, contribution: c, boy, growth: g, eoy: b }); });
      return { rows, total, final: b };
    },
    /** level start-of-year contribution for n years that grows to F at r (PMT(r, n, 0, -F, 1)) */
    level(F, r, n) { if (n <= 0) return 0; if (r === 0) return F / n; return (F * r) / ((1 + r) * (Math.pow(1 + r, n) - 1)); },
    /** schedule from the contribution dialog: zeros, then amount from row s0 for `periods` rows, inflating each year */
    fill(Y, s0, amount, periods, inflate) {
      const out = new Array(Y).fill(0); let amt = amount; const lim = Math.max(1, Math.round(periods || 0));
      for (let j = 0; s0 + j < Y && j < lim; j++) { out[s0 + j] = amt; amt *= 1 + (inflate || 0); }
      return out;
    },
    /** resize to Y rows: new rows copy the last value, extra rows are dropped */
    resize(arr, Y) { const out = arr.slice(0, Y), last = arr.length ? arr[arr.length - 1] : 0; while (out.length < Y) out.push(last); return out; }
  };
  EFA.engines.payNowOrLater = norl;

  EFA.screen('norl1', {
    title: 'Pay now or pay later: the cost of waiting to save',
    copy: {
      head: 'Initial Assumptions', lbAge: 'Current Age', lbRet: 'Retirement Age', lbRor: 'Investment Return',
      cont: 'Continue', calc: 'Calculate', back: 'Initial Assumptions', doc: 'Documentation',
      tToday: 'Starting Today', tLater: 'Starting Later', colAge: 'Age', colAmt: 'Annual Contribution',
      sumTot: 'Total Contributions', balA: 'Age', balB: 'Balance',
      dlgA: 'Contributions starting at age', dAmt: 'Amount', dPer: '# of Periods', dInf: 'Inflate Rate', cancel: 'Cancel', enter: 'Enter',
      chooseT: 'Which schedule would you like to see?', chToday: 'Starting Today', chLater: 'Starting Later',
      errAge: 'Retirement age has to be greater than current age. Please fix it.',
      wsHead: 'Retirement Savings Under Your Assumptions', wsAge: 'Age', wsAmt: 'Annual Contribution', wsBoy: 'Balance at Beginning of Year', wsGrow: 'Annual Growth', wsEoy: 'Balance at End of Year', wsYear: 'Year',
      hypo: HYPO,
      _notes: 'Waiting to save is expensive. Reaching the same balance later takes more of your own money.\n\n- Set the assumptions and Continue. Click an age to enter the savings plan, then Calculate.\n- Click a later starting age to see the level amount it would take to catch up.\n- Ask: What is waiting costing you?\nPAUSE'
    },
    render(ctx) {
      const S = { Y: 0, C: 42, R: 65, today: [], later: [], calcd: false, laterStart: null, todayRow: null, dlgRow: null, dlg: false };
      ctx._nl = S;
      ctx.remember('f.dlg_amount', 500); ctx.remember('f.dlg_inflate', 0);   // screen state: fresh on each visit
      const table = (cls) => `<div class="b10-tbl ${cls}"><table class="st-table"><thead><tr><th class="c" style="width:120px">${ctx.t('colAge')}</th><th>${ctx.t('colAmt')}</th></tr></thead><tbody></tbody></table></div>`;
      const sum = (cls, fade) => `<div class="b10-sum st-card ${cls} ${fade ? 'b10-f is-off' : 'b10-hide'}"><div class="r">${ctx.t('sumTot')}<span class="num tot"></span></div><div class="r"><span>${ctx.t('balA')} <span class="num ra"></span> ${ctx.t('balB')}</span><span class="num bal"></span></div></div>`;
      ctx.el.innerHTML = `
        <div class="b10-view v-assume">
          <div class="b10-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule"></div>
          <div class="b10-form st-card" style="top:236px;width:700px">
            ${frow(ctx, { id: 'case_file_current_age', label: 'lbAge', type: 'int', min: 0 })}
            ${frow(ctx, { id: 'case_file_retirement_age', label: 'lbRet', type: 'int', min: 0 })}
            ${frow(ctx, { id: 'taxable_return', label: 'lbRor', type: 'pct', min: 0, max: 0.12 })}
          </div>
          <div class="b10-actions" style="top:536px"><button type="button" class="st-pill b10-btn" data-cont>${ctx.t('cont')}</button></div>
          <p class="b10-note c" style="left:300px;right:300px;top:640px">${hypo(ctx, 'hypo')}</p>
        </div>
        <div class="b10-view v-sched b10-hide">
          <div class="b10-nlcol nl-today" style="left:480px">${ctx.t('tToday', { tag: 'h2', cls: 'b10-nlt' })}${table('t-today')}
            <div class="nl-calc"><button type="button" class="st-pill b10-btn" data-calc>${ctx.t('calc')}</button></div>${sum('s-today')}</div>
          <div class="b10-nlcol nl-later b10-f is-off" style="left:820px">${ctx.t('tLater', { tag: 'h2', cls: 'b10-nlt' })}${table('t-later')}${sum('s-later', true)}</div>
          <p class="b10-note c nl-note b10-f is-off" style="left:300px;right:300px;top:690px">${hypo(ctx, 'hypo')}</p>
          <div class="b10-nlbar nl-bar b10-f is-off"><button type="button" class="st-pill b10-btn b10-ghost" data-back>${ctx.t('back')}</button>${has('worksheet', 'open') ? `<button type="button" class="b10-link" data-doc>${docIcon}${ctx.t('doc')}</button>` : ''}</div>
        </div>
        <div class="b10-modal nl-dlg b10-hide" role="dialog" aria-modal="true">
          <div class="b10-mdl">
            <div class="b10-mdl-h">${ctx.t('dlgA')} <span class="num dage"></span></div>
            <div class="b10-mdl-b">
              ${frow(ctx, { id: 'dlg_amount', label: 'dAmt', type: 'money', min: 0, local: true })}
              ${frow(ctx, { id: 'dlg_periods', label: 'dPer', type: 'int', min: 0, local: true })}
              ${frow(ctx, { id: 'dlg_inflate', label: 'dInf', type: 'pct', local: true, extra: infLink(ctx, 'dlg_inflate') })}
            </div>
            <div class="b10-mdl-f"><button type="button" class="st-pill b10-btn b10-ghost" data-cancel>${ctx.t('cancel')}</button><button type="button" class="st-pill b10-btn" data-enter>${ctx.t('enter')}</button></div>
          </div>
        </div>`;
      const rate = () => ctx.values().taxable_return || 0;
      const rowsHtml = (arr, sel) => arr.map((c, k) => `<tr data-k="${k}" class="${k === sel ? 'hl' : ''}"><td class="c num">${S.C + k}</td><td class="num">${F.money(c)}</td></tr>`).join('');
      const fillSum = (cls, res) => { const s = ctx.$('.' + cls); s.querySelector('.tot').textContent = F.money(res.total); s.querySelector('.ra').textContent = S.R; s.querySelector('.bal').textContent = F.money(res.final); };
      const paint = () => {
        ctx.$('.t-today tbody').innerHTML = rowsHtml(S.today, S.todayRow);
        ctx.$('.t-later tbody').innerHTML = rowsHtml(S.later, S.laterStart);
        ctx.$('.nl-calc').classList.toggle('b10-hide', S.calcd);
        ctx.$('.s-today').classList.toggle('b10-hide', !S.calcd);
        ctx.$('.nl-today').style.left = (S.calcd ? 140 : 480) + 'px';
        ctx.show(ctx.$('.nl-later'), S.calcd);
        ctx.show(ctx.$('.nl-note'), S.calcd);
        ctx.show(ctx.$('.s-later'), S.laterStart != null);
        ctx.show(ctx.$('.nl-bar'), S.laterStart != null);
        if (S.calcd) fillSum('s-today', norl.run(S.today, rate()));
        if (S.laterStart != null) fillSum('s-later', norl.run(S.later, rate()));
      };
      const view = (v) => { ctx.$('.v-assume').classList.toggle('b10-hide', v !== 'assume'); ctx.$('.v-sched').classList.toggle('b10-hide', v !== 'sched'); };
      const escBlock = (e) => { if (e.key === 'Escape' && S.dlg) { e.stopPropagation(); e.preventDefault(); } };
      const openDlg = (k) => {
        S.dlgRow = k; S.dlg = true;
        ctx.setField('dlg_periods', S.Y);
        ctx.$('.dage').textContent = S.C + k;
        ctx.$('.nl-dlg').classList.remove('b10-hide');
        document.addEventListener('keydown', escBlock, true);
        ctx._nlEsc = escBlock;
      };
      const closeDlg = () => { S.dlg = false; ctx.$('.nl-dlg').classList.add('b10-hide'); document.removeEventListener('keydown', escBlock, true); };
      ctx.on(ctx.$('[data-cont]'), 'click', () => {
        const v = ctx.values(), C = Math.round(v.case_file_current_age), R = Math.round(v.case_file_retirement_age), Y = R - C;
        if (!(Y > 0)) { ctx.toast(ctx.text('errAge')); return; }
        Object.assign(S, { Y, C, R, calcd: false, laterStart: null, todayRow: null });
        S.today = norl.resize(S.today, Y); S.later = norl.resize(S.later, Y);
        view('sched'); paint();
      });
      ctx.on(ctx.$('.t-today tbody'), 'click', (e) => { const tr = e.target.closest('tr[data-k]'); if (tr) openDlg(+tr.dataset.k); });
      ctx.on(ctx.$('[data-cancel]'), 'click', closeDlg);
      ctx.on(ctx.$('[data-enter]'), 'click', () => {
        const v = ctx.values();
        S.today = norl.fill(S.Y, S.dlgRow, v.dlg_amount || 0, v.dlg_periods, v.dlg_inflate || 0);
        Object.assign(S, { todayRow: S.dlgRow, calcd: false, laterStart: null });
        S.later = new Array(S.Y).fill(0);
        closeDlg(); paint();
      });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { S.calcd = true; S.later = new Array(S.Y).fill(0); S.laterStart = null; paint(); });
      ctx.on(ctx.$('.t-later tbody'), 'click', (e) => {
        const tr = e.target.closest('tr[data-k]'); if (!tr) return;
        const k = +tr.dataset.k, r = rate(), F0 = norl.run(S.today, r).final, c = norl.level(F0, r, S.Y - k);
        S.later = S.today.map((_, i) => (i < k ? 0 : c)); S.laterStart = k; paint();
      });
      ctx.on(ctx.$('[data-back]'), 'click', () => view('assume'));
      const sheet = (which) => {
        const r = rate(), res = norl.run(which === 'later' ? S.later : S.today, r);
        return {
          heading: ctx.t('wsHead'), size: 'full',
          columns: [
            { field: 'age', header: ctx.t('wsAge'), type: 'age' },
            { field: 'c', header: ctx.t('wsAmt'), type: 'money', dp: 2 },
            { field: 'boy', header: ctx.t('wsBoy'), type: 'money', dp: 2 },
            { field: 'g', header: ctx.t('wsGrow'), type: 'money', dp: 2 },
            { field: 'eoy', header: ctx.t('wsEoy'), type: 'money', dp: 2 },
            { field: 'year', header: ctx.t('wsYear'), type: 'year' }
          ],
          rows: res.rows.map((x) => ({ age: S.C + x.k, c: x.contribution, boy: x.boy, g: x.growth, eoy: x.eoy, year: x.k + 1 })),
          assumptions: [{ label: ctx.t(which === 'later' ? 'tLater' : 'tToday'), value: '' }, { label: ctx.t('lbRor'), value: F.pct(r, 2) }],
          highlight: 'eoy', disclosures: ['hypothetical', 'license']
        };
      };
      const doc = ctx.$('[data-doc]');
      if (doc) ctx.on(doc, 'click', () => {
        const ov = ctx.overlay({ title: ctx.t('chooseT'), cls: 'b10-pop', html: `<div class="b10-choose"><button type="button" class="b10-link" data-w="today">${docIcon}${ctx.t('chToday')}</button><button type="button" class="b10-link" data-w="later">${docIcon}${ctx.t('chLater')}</button></div>` });
        ctx.on(Array.from(ov.querySelectorAll('[data-w]')), 'click', (e, b) => { ov.close(); wsOpen(ctx, sheet(b.dataset.w)); });
      });
      ctx.onFields((v) => { syncCase(v, { case_file_current_age: 'int', case_file_retirement_age: 'int', taxable_return: 'pct' }); if (S.Y) paint(); });
      capPct(ctx, 'taxable_return', 12);
      guardRor(ctx, 'taxable_return');
    },
    leave(ctx) { if (ctx._nlEsc) document.removeEventListener('keydown', ctx._nlEsc, true); }
  });

  /* =====================================================================
     MF101: Mortgages 101 on the money-flow model (js/lib/pem.js)
     ===================================================================== */
  const calcIcon = `<svg width="50" height="50" viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="3" width="32" height="42" rx="6" fill="${P.navy}"/><rect x="13" y="8" width="22" height="9" rx="2" fill="${P.goldPale}"/>${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${13 + c * 8}" y="${21 + r * 7.5}" width="6" height="5" rx="1.5" fill="${r === 2 && c === 2 ? P.gold : P.mist}"/>`).join('')).join('')}</svg>`;
  /** heading, optional subheading and bullet rows on the right; the model (zoomed) on the left */
  function mfRender(ctx, o) {
    const items = o.bullets.map((k) => ctx.t(k));
    const list = has('bullets', 'list')
      ? EFA.lib.bullets.list(ctx, items, { from: o.from, text: 'b10-bt', size: 46, gap: 14, boxed: true, style: 'width:580px' })
      : `<div style="display:grid;gap:14px">${items.map((h, i) => `<div class="b10-btxt b10-f b10-bl" data-at="${o.from + i}">${h}</div>`).join('')}</div>`;
    ctx.el.innerHTML = `
      <div class="b10-mfp">
        ${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}
        ${o.sub ? ctx.t('sub', { tag: 'p', cls: 'b10-sub' }) : '<div style="height:16px"></div>'}
        ${list}
        ${o.link ? `<div class="b10-mfcalc mf-link"><span class="clickable" data-b10jump>${calcIcon}</span><button type="button" class="b10-link" data-b10jump>${ctx.t('link')}</button></div>` : ''}
      </div>`;
    ctx.pem = null;
    if (has('pem', 'mount')) {
      try {
        ctx.pem = EFA.lib.pem.mount(ctx, ctx.el, Object.assign({
          scenarioPicker: false, links: false, collateral: 'house', showBorrowed: true, borrowSource: false, showHouse: true, sliders: false,
          frame: { zoom: { scale: 1.1, shift: [-40.5, -2] }, width: 0.55, expanded: false, panel: '.b10-mfp', expandShows: ['labels', 'lifestyle'], toggle: true }
        }, o.config || {}));
      } catch (e) { console.error(e); ctx.pem = null; }
    }
    if (!ctx.pem) ctx.el.insertAdjacentHTML('beforeend', `<div class="b10-wait" style="left:70px;top:90px;width:760px;height:680px">${ctx.t('pemWait')}</div>`);
    if (o.link) ctx.on(ctx.$$('[data-b10jump]'), 'click', () => ctx.jump('EVAC', 'evac1', { v: 'mortgage' }));
  }
  function mfBullets(ctx, n) {
    if (has('bullets', 'reveal')) EFA.lib.bullets.reveal(ctx, n);
    else ctx.$$('.b10-bl').forEach((r) => ctx.show(r, n >= +r.dataset.at));
  }
  /** set a step's starting levels, then (100 ms later) play that step's storyboard */
  function mfStory(ctx, levels, story, dir) {
    const p = ctx.pem; if (!p) return;
    if (ctx._mfT) clearTimeout(ctx._mfT);
    try {
      p.stopAll();
      p.set(levels, { ms: 0 });
      if (story) ctx._mfT = ctx.timeout(() => { if (ctx.pem) ctx.pem.play(story); }, dir === 0 ? 30 : 100);
    } catch (e) { console.error(e); }
  }
  const mfCopy = { head: 'How Do You Pay for a House?', pemWait: 'The money-flow model is getting ready.' };

  EFA.screen('mf1', {
    title: 'Buying a home with a mortgage, on the money-flow model',
    steps: 7,
    copy: Object.assign({}, mfCopy, {
      sub: 'Financing with a mortgage',
      b1: 'You save for years to build a down payment.',
      b2: 'You choose your home and buy it.',
      b3: 'Your savings drain to cover the down payment.',
      b4: 'A mortgage covers the rest of the price.',
      b5: 'Your equity can be reached only by selling or by qualifying to borrow against the home.',
      _notes: 'Walk the most common route to a home: save a down payment, buy, and borrow the rest against the house.\n\n- Click forward through each move; the panel names it as it happens. The small icon switches between the full model and the close-up.\n- Ask: Once the house is bought, how easy is it to get to the money you put into it?\nPAUSE'
    }),
    render(ctx) { mfRender(ctx, { sub: true, bullets: ['b1', 'b2', 'b3', 'b4', 'b5'], from: 2 }); },
    step(ctx, n, dir) {
      mfBullets(ctx, n);
      const p = ctx.pem; if (!p) return;
      if (n === 0) p.expand(true); else if (n === 1 || dir === 0) p.expand(false);
      const L = [
        { safe: 0, house: 0, borrow: 0 }, { safe: 0, house: 0, borrow: 0 }, { safe: 0, house: 0, borrow: 0 },
        { safe: 10, house: 0, borrow: 0 }, { safe: 10, house: 50, borrow: 0 }, { safe: 0, house: 50, borrow: 0 }, { safe: 0, house: 50, borrow: 40 }
      ][n];
      mfStory(ctx, L, { 2: 'MTGSaveForDownPayment', 3: 'MTGBuyHouse', 4: 'MTGDownPayment', 5: 'MTGGetMortgage' }[n], dir);
    }
  });
  EFA.screen('mf2', {
    title: 'Buying a home with cash, on the money-flow model',
    steps: 5,
    copy: Object.assign({}, mfCopy, {
      sub: 'Paying cash',
      b1: 'You save until you have the full price.',
      b2: 'You choose your home and buy it.',
      b3: 'Your savings drain to pay for the home outright.',
      b4: 'Your equity can be reached only by selling or by qualifying to borrow against the home.',
      _notes: 'The other route: save the whole price and pay cash. Notice how long the saving takes and where the money ends up.\n\n- Click forward through each move.\n- Ask: With every dollar in the house, what is left for an emergency or an opportunity?\nPAUSE'
    }),
    render(ctx) { mfRender(ctx, { sub: true, bullets: ['b1', 'b2', 'b3', 'b4'], from: 1 }); },
    step(ctx, n, dir) {
      mfBullets(ctx, n);
      const p = ctx.pem; if (!p) return;
      if (dir === 0) p.expand(false);
      const L = [{ safe: 0, house: 0, borrow: 0 }, { safe: 0, house: 0, borrow: 0 }, { safe: 50, house: 0, borrow: 0 }, { safe: 50, house: 50, borrow: 0 }, { safe: 0, house: 50, borrow: 0 }][n];
      mfStory(ctx, L, { 1: 'MTGSaveForPayCash', 2: 'MTGBuyHouse', 3: 'MTGMaxDown' }[n], dir);
    }
  });
  EFA.screen('mf3', {
    title: 'Mortgage or cash: points to weigh',
    steps: 5,
    copy: Object.assign({}, mfCopy, {
      head: 'Things to Consider',
      b1: 'As a general rule, when your savings earn the same rate your mortgage charges, the two routes cost about the same.',
      b2: 'A paid-off home can be reached by more than one road.',
      b3: 'Financing can leave more of your money under your control.',
      b4: 'Reaching your home equity later depends on qualifying for a loan or selling.',
      link: 'Cash or Mortgage',
      _notes: 'Both routes can end with a paid-off home. The difference is who controls the money along the way.\n\n- Reveal one point at a time.\n- Cash or Mortgage opens the calculator; the Back button returns here on the same point.\n- Ask: Which matters more to you, owning the house outright sooner, or keeping control of your money?\nPAUSE'
    }),
    render(ctx) {
      mfRender(ctx, { sub: false, bullets: ['b1', 'b2', 'b3', 'b4'], from: 1, link: true, config: { safe: 40, borrow: 40, house: 50, regulator: 80, remaining: 100, debtService: false } });
    },
    step(ctx, n, dir) {
      mfBullets(ctx, n);
      const l = ctx.$('.mf-link'); if (l) l.style.visibility = n >= 1 ? 'visible' : 'hidden';
      if (ctx.pem && dir === 0) { try { ctx.pem.expand(false); ctx.pem.set({ safe: 40, borrow: 40, house: 50, regulator: 80, remaining: 100 }, { ms: 0 }); } catch (e) { console.error(e); } }
    }
  });

  /* =====================================================================
     How long / how much: hosts of the shared calculators (js/lib/life.js)
     ===================================================================== */
  [
    ['howLong', 'nvsw2', 'How long would the money last? (current coverage)', 'This is the coverage you have today. Let the client see how long it would carry the family.\n\n- Enter coverage, savings, return, income and inflation, then Calculate.\n- Ask: Is that how long you want your family to be taken care of?\nPAUSE'],
    ['howMuch', 'nvsw3', 'How much is enough? (coverage need)', 'Find the coverage that would let the family live on the earnings without touching the principal.\n\n- Calculate, then let the number sit.\n- Ask: How does that compare with what you own today?\nPAUSE'],
    ['howLong', 'nvsw4', 'How long would the money last? (with the coverage need)', 'Same test, now with the coverage your goals call for.\n\n- Calculate and compare with the first result.\n- Ask: Which of the two would you want your family to have?\nPAUSE'],
    ['howLong', 'hmc3', 'How long would the money last?', 'Start with what the family has today: current coverage plus savings.\n\n- Calculate to see the year the money runs out.\n- Ask: Is that what you want for them?\nPAUSE']
  ].forEach(([kind, id, title, notes]) => {
    if (has(kind, 'screen')) { EFA.lib[kind].screen(id, { title, notes }); return; }
    EFA.screen(id, {
      title,
      copy: { wait: 'This calculator is getting ready.', _notes: notes },
      render(ctx) { ctx.el.innerHTML = `<div class="b10-wait" style="left:400px;top:330px;width:800px;height:200px">${ctx.t('wait')}</div>`; }
    });
  });
})();
