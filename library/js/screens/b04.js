/* Module b04: Compound Interest (CI), Compound Interest Tutorial (CIT), Cost of Credit Cards (CC).
   Screen structure, sequence, interactions and math follow the plain-words specs; drawings and wording are new.
   Shared pieces used: EFA.lib.caseData (client values shared across screens), EFA.lib.disclosure (rate notice
   and compliance lines), EFA.lib.worksheet (Documentation). Engines exposed: EFA.engines.ciGrid, ciTaxFund, cardCost. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt;

  EFA.css('b04', `
  .b04-full { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; overflow: visible; pointer-events: none; }
  .b04-head { position: absolute; left: 0; right: 0; top: 50px; display: grid; justify-items: center; gap: 14px; text-align: center; padding: 0 120px; }
  .stage .b04-head .st-h1 { font-size: 60px; }
  .b04-lab { position: absolute; transform: translate(-50%, -50%); text-align: center; font: 700 25px/1.18 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #f7f5f1; white-space: nowrap; }
  .b04-lab.b04-dark { color: #0d1e3a; }
  .b04-lab.b04-sm { font-size: 21px; letter-spacing: .08em; }
  .stage .st-disclaimer.b04-disc { position: absolute; left: 110px; bottom: 18px; width: 900px; margin: 0; font-size: 13px; line-height: 1.42; }
  .b04-med { position: absolute; border-radius: 50%; background: #fffdf8; border: 1px solid #d6cfc4; box-shadow: 0 18px 40px rgba(13,30,58,.10); display: grid; place-items: center; overflow: hidden; }
  .b04-med svg { width: 78%; height: 78%; }

  /* input cards */
  .b04-card { position: absolute; box-sizing: border-box; }
  .b04-form { padding: 14px 34px; }
  .b04-frow { display: grid; grid-template-columns: 56px 1fr; align-items: center; gap: 20px; min-height: 80px; border-bottom: 1px solid rgba(13,30,58,.10); }
  .b04-frow:last-child { border-bottom: 0; }
  .b04-tight .b04-frow { min-height: 70px; }
  .b04-ico { width: 56px; height: 56px; border-radius: 50%; background: #e3e8f0; display: grid; place-items: center; }
  .b04-ico svg { width: 32px; height: 32px; }
  .b04-ico.b04-gold { background: #f0e6c4; }
  .stage .b04-frow .st-field { grid-template-columns: minmax(0, 1fr) 216px; align-items: center; gap: 20px; }
  .stage .b04-frow .st-field > label, .stage .b04-frow .b04-olab { font: 700 26px/1.2 "DM Sans", sans-serif; color: #0d1e3a; text-transform: none; letter-spacing: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stage .b04-frow .st-input { text-align: right; font-size: 24px; height: 54px; }
  .b04-orow { display: grid; grid-template-columns: minmax(0, 1fr) 216px; align-items: center; gap: 20px; }
  .b04-out { height: 54px; box-sizing: border-box; border-radius: 10px; background: #f0e6c4; border: 1.5px solid #d5bd68; display: flex; align-items: center; justify-content: flex-end; padding: 0 14px; font: 700 24px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b04-out.b04-navy { background: #0d1e3a; border-color: #0d1e3a; color: #f7f5f1; }
  .b04-cin { transition: transform .8s cubic-bezier(.3,.7,.25,1); }

  /* links (same look as the shared Documentation link) */
  .b04-links { position: absolute; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 64px; }
  .b04-link { display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent; padding: 4px 2px; color: #8a6e22; font: 600 19px/1.2 "DM Sans", sans-serif; letter-spacing: .01em; cursor: pointer; }
  .b04-link [data-cp] { border-bottom: 1.5px dotted currentColor; }
  .b04-link:hover { color: #0d1e3a; }
  .b04-link svg { flex: 0 0 auto; }

  /* two-triangle stepper */
  .b04-tri { position: absolute; overflow: visible; }
  .b04-k { transform-box: view-box; transition: transform .55s cubic-bezier(.3,.7,.25,1); }
  .b04-cap { position: absolute; transform: translateX(-50%); font: 700 17px/1 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6e22; white-space: nowrap; }
  .b04-cap.b04-navy { color: #1d3863; }
  .b04-tin { position: absolute; width: 128px; }
  .stage .b04-tin .st-input { height: 48px; font-size: 21px; text-align: center; padding: 0 6px; border-color: #fffdf8; box-shadow: 0 8px 18px rgba(13,30,58,.22); }
  .b04-mini { padding: 10px 26px; }
  .b04-mrow { min-height: 62px; display: flex; align-items: center; border-bottom: 1px solid rgba(13,30,58,.10); }
  .b04-mrow:last-child { border-bottom: 0; }
  .stage .b04-mini .st-field { width: 100%; grid-template-columns: 60% 40%; align-items: center; gap: 0; }
  .stage .b04-mini .st-field > label { font: 700 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; text-transform: none; letter-spacing: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stage .b04-mini .st-input { text-align: right; height: 46px; font-size: 21px; }
  .b04-orate { position: absolute; display: grid; justify-items: center; gap: 10px; text-align: center; transition: opacity .6s ease; }
  .b04-orate-t { font: 600 40px/1.15 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b04-orate-t .num { font-size: 36px; font-weight: 700; color: #8a6e22; }
  .b04-yrs { position: absolute; display: grid; gap: 8px; justify-items: center; }
  .b04-yrs-k { font: 700 16px/1 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #667389; }
  .stage .b04-yrs .st-input { width: 104px; text-align: center; font-size: 24px; }
  .b04-foot { position: absolute; left: 110px; width: 1380px; box-sizing: border-box; padding: 18px 44px 16px; display: grid; grid-template-columns: 45fr 10fr 45fr; column-gap: 30px; row-gap: 12px; }
  .b04-side { display: grid; gap: 8px; align-content: center; }
  .b04-kv { display: flex; justify-content: space-between; align-items: center; gap: 18px; font: 700 26px/1.25 "DM Sans", sans-serif; color: #0d1e3a; }
  .b04-kv-k { display: inline-flex; align-items: center; gap: 12px; font-weight: 600; }
  .b04-kv-k i { width: 14px; height: 14px; border-radius: 4px; background: #1d3863; flex: 0 0 auto; }
  .b04-side.b04-r .b04-kv-k i { background: #b8972e; }
  .b04-side.b04-r .b04-kv-v { color: #8a6e22; }
  .b04-mid { display: grid; justify-items: center; align-content: center; gap: 4px; border-left: 1px solid #d6cfc4; border-right: 1px solid #d6cfc4; }
  .b04-mid-k { font: 700 14px/1 "DM Sans", sans-serif; letter-spacing: .22em; text-transform: uppercase; color: #667389; }
  .b04-mid-v { font: 700 56px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b04-net { grid-column: 1 / -1; text-align: center; border-top: 1px solid rgba(13,30,58,.12); padding-top: 12px; font: 700 25px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b04-net-v { display: inline-block; margin-left: 8px; padding: 2px 14px; border-radius: 8px; background: #f0e6c4; }

  /* vertical year slider */
  .b04-vs { position: absolute; width: 64px; touch-action: none; cursor: pointer; }
  .b04-vs-rail { position: absolute; left: 28px; top: 0; bottom: 0; width: 8px; border-radius: 8px; background: #cbd5e3; }
  .b04-vs-fill { position: absolute; left: 28px; top: 0; width: 8px; border-radius: 8px; background: linear-gradient(#d5bd68, #b8972e); transition: height .15s ease; }
  .b04-vs-tick { position: absolute; left: 12px; width: 10px; height: 2px; background: #cbd5e3; border-radius: 2px; }
  .b04-vs-tick.b04-big { left: 6px; width: 16px; background: #8aa3c7; }
  .b04-vs-knob { position: absolute; left: 32px; width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%; background: #fffdf8; border: 4px solid #b8972e; box-sizing: border-box; box-shadow: 0 6px 14px rgba(13,30,58,.25); transition: top .15s ease; outline: none; }
  .b04-vs-knob:focus-visible { box-shadow: 0 0 0 4px rgba(184,151,46,.35), 0 6px 14px rgba(13,30,58,.25); }
  .b04-vs-tip { position: absolute; left: 30px; top: 50%; transform: translateY(-50%); min-width: 26px; padding: 5px 9px; border-radius: 8px; background: #0d1e3a; color: #f7f5f1; font: 700 16px/1 "DM Sans", sans-serif; text-align: center; white-space: nowrap; pointer-events: none; }
  .b04-vs-tip::before { content: ""; position: absolute; left: -6px; top: 50%; margin-top: -6px; border: 6px solid transparent; border-left: 0; border-right-color: #0d1e3a; }
  .b04-vs.b04-drag .b04-vs-knob, .b04-vs.b04-drag .b04-vs-fill { transition: none; }

  /* table (cit4): fixed header over a scrolling body */
  .b04-tbox { position: absolute; overflow: hidden; border-radius: 14px; border: 1px solid #d6cfc4; background: #fffdf8; box-shadow: 0 10px 30px rgba(13,30,58,.06); }
  .b04-tscroll { position: absolute; left: 0; right: 0; top: 48px; bottom: 0; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; outline: none; overscroll-behavior: contain; }
  .b04-tscroll::-webkit-scrollbar { display: none; }
  .b04-tfade { position: absolute; left: 0; right: 0; bottom: 0; height: 64px; background: linear-gradient(rgba(255,253,248,0), #fffdf8 85%); pointer-events: none; transition: opacity .3s ease; }
  .stage .st-table.b04-tbl { table-layout: fixed; border-collapse: separate; border-spacing: 0; font-size: 21px; }
  .stage .st-table.b04-thead { position: absolute; left: 0; top: 0; background: #0d1e3a; }
  .stage .st-table.b04-tbl th { height: 48px; box-sizing: border-box; padding: 0 16px; font-size: 13px; }
  .stage .st-table.b04-tbl td { padding: 10px 16px; }
  .stage .st-table.b04-tbl th.b04-c, .stage .st-table.b04-tbl td.b04-c { text-align: center; }
  .stage .st-table.b04-tbl td.b04-c { font-weight: 700; color: #667389; }
  .stage .b04-tbl td.b04-bar { position: relative; }
  .b04-tbl td.b04-bar i { position: absolute; left: 10px; top: 7px; bottom: 7px; border-radius: 5px; background: rgba(43,76,128,.13); }
  .b04-tbl td.b04-bar.b04-gold i { background: rgba(184,151,46,.26); }
  .b04-tbl td.b04-bar span { position: relative; }
  .stage .b04-tbl td.b04-opp { font-weight: 700; color: #8a6e22; }

  /* result cards (cit5, cc2) */
  .b04-btnrow { position: absolute; left: 0; right: 0; display: flex; justify-content: center; }
  .stage .st-pill.b04-btn { min-width: 220px; font-size: 19px; min-height: 52px; letter-spacing: .06em; }
  .b04-res { position: absolute; box-sizing: border-box; }
  .stage .b04-res.fade { transition: opacity .7s ease, transform .7s ease; }
  .stage .b04-res.is-off { transform: translateY(18px); }
  .b04-hl { display: flex; align-items: center; justify-content: center; gap: 14px; border: 3px solid #b8972e; border-radius: 14px; background: #fff; padding: 10px 24px; font: 700 31px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b04-hl .num { color: #8a6e22; font-size: 38px; }
  .b04-para { margin: 0; font: 600 22px/1.5 "DM Sans", sans-serif; color: #0d1e3a; text-align: center; text-wrap: balance; }
  .b04-para .num { color: #0d1e3a; font-weight: 700; }
  .b04-res .b04-links { position: static; }
  .b04-view { position: absolute; inset: 0; transition: opacity .5s ease; }

  /* chart (cit5) */
  .b04-gcard { position: absolute; left: 80px; top: 40px; width: 1440px; height: 772px; box-sizing: border-box; padding: 34px 60px 30px; display: grid; grid-template-rows: auto 1fr auto; justify-items: center; align-items: center; gap: 14px; }
  .stage .b04-gcard h2 { text-align: center; font-size: 40px; }
  .b04-chart { position: relative; width: 1300px; height: 560px; }
  .b04-chart svg { position: absolute; inset: 0; overflow: visible; }
  .b04-ctip { position: absolute; transform: translate(-50%, -100%); margin-top: -18px; padding: 8px 14px; border-radius: 10px; background: #0d1e3a; color: #f7f5f1; font: 700 18px/1.25 "DM Sans", sans-serif; text-align: center; white-space: nowrap; pointer-events: none; transition: opacity .2s ease; }
  .b04-ctip-y { display: block; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #d5bd68; }
  .b04-axl { position: absolute; font: 700 14px/1 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #667389; white-space: nowrap; }

  /* cit6 boxes */
  .b04-box { position: absolute; transform: translateX(-50%); min-width: 230px; box-sizing: border-box; padding: 12px 20px; border-radius: 12px; background: #fffdf8; border: 1.5px solid #cbd5e3; box-shadow: 0 8px 20px rgba(13,30,58,.07); font: 700 28px/1.1 "DM Sans", sans-serif; color: #0d1e3a; text-align: center; white-space: nowrap; }
  .b04-box.b04-gold { color: #8a6e22; border-color: #d5bd68; background: #fffaf0; }
  .b04-box.b04-strong { font-size: 32px; }
  .b04-rlab { position: absolute; transform: translate(-100%, -50%); font: 700 17px/1.25 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #667389; text-align: right; }
  .b04-yr { position: absolute; transform: translate(-50%, -50%); font: 700 30px/1 "DM Sans", sans-serif; color: #0d1e3a; white-space: nowrap; }
  .b04-yr-k { font-size: 16px; letter-spacing: .2em; text-transform: uppercase; color: #667389; margin-right: 10px; }

  /* cc2 results */
  .b04-cc { padding: 22px 40px 18px; }
  .b04-ccg { display: grid; grid-template-columns: 52px minmax(0, 4fr) repeat(3, minmax(0, 1fr)); column-gap: 20px; align-items: center; }
  .b04-ccg.b04-h { padding-bottom: 12px; border-bottom: 2px solid #0d1e3a; }
  .b04-ccg.b04-row { min-height: 76px; border-bottom: 1px solid rgba(13,30,58,.10); }
  .b04-ccg.b04-row:last-child { border-bottom: 0; }
  .b04-ccg-yl { grid-column: 1 / 3; justify-self: end; font: 700 16px/1 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #667389; }
  .b04-ccg-yc { justify-self: center; font: 700 26px/1 "DM Sans", sans-serif; color: #0d1e3a; text-decoration: underline; text-decoration-color: #b8972e; text-decoration-thickness: 3px; text-underline-offset: 8px; }
  .stage .b04-ccg .st-field { justify-self: center; width: 110px; }
  .stage .b04-ccg .st-input { text-align: center; height: 48px; font-size: 24px; }
  .b04-ccg-n { font: 700 24px/1 "DM Sans", sans-serif; color: #8a6e22; }
  .b04-ccg-d { font: 600 23px/1.35 "DM Sans", sans-serif; color: #0d1e3a; }
  .b04-ccg-d .num { color: #8a6e22; font-weight: 700; }
  .b04-ccg-v { justify-self: end; font: 700 25px/1 "DM Sans", sans-serif; color: #0d1e3a; white-space: nowrap; }
  .b04-ccg.b04-hl3 .b04-ccg-v { color: #8a6e22; }
  `);

  /* ======================================================================
     Client values shared across screens and presentations (EFA.lib.caseData,
     namespace 'case'). Rates are fractions (0.06 = 6%), money in dollars.
     ====================================================================== */
  const DEF = {
    account_balance: 100000, annual_investment: 5000, case_file_ror_accumulation: 0.06,
    time_period_in_years: 30, case_file_ror_taxes: 0.30,
    credit_card_balance: 10000, credit_card_interest_rate: 0.18, credit_card_years: 3
  };
  /** screen field id -> shared key, type, default and limits (from the specs) */
  const FD = {
    bal: { key: 'account_balance', type: 'money', min: 0, max: 1e10 },
    dep: { key: 'annual_investment', type: 'money', min: 0, max: 1e9 },
    ror: { key: 'case_file_ror_accumulation', type: 'pct', min: 0, max: 0.12, dp: 2 },
    years: { key: 'time_period_in_years', type: 'int', min: 1, max: 100 },
    tax: { key: 'case_file_ror_taxes', type: 'pct', min: 0, max: 1, dp: 2 },
    ccBal: { key: 'credit_card_balance', type: 'money', min: 0, max: 1e9 },
    ccRate: { key: 'credit_card_interest_rate', type: 'pct', min: 0, max: 1, dp: 2 },
    ccRor: { key: 'case_file_ror_accumulation', type: 'pct', min: 0, max: 0.12, dp: 2 },
    ccYears: { key: 'credit_card_years', type: 'int', min: 1, max: 100 }
  };
  const CD = () => (EFA.lib && EFA.lib.caseData) || null;
  /** the shared value for a key, or the spec default */
  function cget(key) {
    const C = CD(); const v = C ? C.get(key, DEF[key]) : DEF[key];
    return (typeof v === 'number' && isFinite(v)) ? v : DEF[key];
  }
  /** a calculator field bound to the shared client value */
  function cfield(ctx, id, label) {
    const d = FD[id];
    const o = { id, label, type: d.type, value: DEF[d.key], min: d.min, max: d.max, dp: d.dp };
    const C = CD();
    return C ? C.field(ctx, Object.assign({ key: d.key }, o)) : ctx.field(o);
  }
  /** whole years, 1 to 100; a typed fraction is rounded and saved back */
  function wholeYears(key) {
    const v = cget(key), r = Math.max(1, Math.min(100, Math.round(v)));
    if (r !== v && CD()) CD().set(key, r);
    return r;
  }
  const ciParams = () => ({
    bal: cget('account_balance'), dep: cget('annual_investment'), ror: cget('case_file_ror_accumulation'),
    tax: cget('case_file_ror_taxes'), years: wholeYears('time_period_in_years')
  });

  /* ======================================================================
     Engines (exposed for reuse)
     ====================================================================== */
  /** compound-interest grid (ci3, cit2-cit6). p: {bal, dep, ror, tax, years}; rates as fractions.
      The deposit goes in at the start of every year; the account grows at the full rate and the
      tax on each year's interest is paid from outside. s = ror x (1 - tax) is the net opportunity rate. */
  function ciGrid(p) {
    const r = p.ror, t = p.tax, s = r * (1 - t), N = Math.max(1, Math.round(p.years));
    const rows = []; let eoy = 0, cumTax = 0, opp = 0, cumInt = 0;
    for (let i = 1; i <= N; i++) {
      const boy = (i === 1 ? p.bal : eoy) + p.dep;
      const int = boy * r; eoy = boy + int;
      const tax = int * t; cumTax += tax; cumInt += int;
      opp = i === 1 ? tax : opp * (1 + s) + tax;
      rows.push({ year: i, dep: p.dep, boy, int, eoy, cumInt, tax, cumTax, netReg: eoy - cumTax, opp, netOpp: eoy - opp });
    }
    return { r, t, s, N, rows, p };
  }
  /** the lump sum (PV) that, earning the net rate s, pays every year's tax and reaches zero in year N (cit5, cit6) */
  function ciTaxFund(g) {
    const FV = g.rows[g.N - 1].opp;
    const PV = g.s === 0 ? FV : FV / Math.pow(1 + g.s, g.N);
    const fund = []; let bal = PV;
    for (let i = 1; i <= g.N; i++) {
      const start = bal, int = start * g.s, pay = g.rows[i - 1].tax;
      bal = start + int - pay;
      fund.push({ year: i, start, int, pay, end: bal });
    }
    return { FV, PV, fund };
  }
  /** card interest on a level balance with daily compounding (cc2). p: {bal, rate, ror, years}; rates as fractions */
  function cardCost(p) {
    const eff = Math.pow(1 + p.rate / 365, 365) - 1, a = eff * p.bal;
    const fva = (i, k) => (i === 0 ? k : (Math.pow(1 + i, k) - 1) / i);
    const ks = [p.years, 20, 40];
    return { eff, a, ks, paid: ks.map((k) => a * k), invest: ks.map((k) => fva(p.ror, k) * a), lender: ks.map((k) => fva(eff, k) * a) };
  }
  EFA.engines = EFA.engines || {};
  EFA.engines.ciGrid = ciGrid;
  EFA.engines.ciTaxFund = ciTaxFund;
  EFA.engines.cardCost = cardCost;

  /* ---------- formatting ---------- */
  const $0 = (v) => F.money(v);
  const pct2 = (f) => F.pct(f, 2);
  const pctUpTo2 = (f) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Math.round(f * 10000) / 100) + '%';
  const N = (s) => `<span class="num">${s}</span>`;
  const zero = (v) => (Math.abs(v) < 0.005 ? 0 : v);

  /* ======================================================================
     Shared components (guarded: a screen still renders if a library is late)
     ====================================================================== */
  const ICO = {
    sheet: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M4 9h16M4 14.5h16M10 9v11.5"/></svg>',
    swap: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/></svg>',
    chart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v16h16"/><path d="M7.5 9c3 0 5 1.5 6.5 4s3 4 5 4.5"/></svg>'
  };
  /** the hypothetical-return notice on the first touch of a rate field in a screen visit */
  function guardRate(ctx, id) { if (EFA.lib && EFA.lib.disclosure) EFA.lib.disclosure.guard(ctx, id); }
  /** cit1 variant: the notice opens on the first CHANGE of the field; after OK the field is focused again */
  function guardRateOnChange(ctx, id) {
    const inp = ctx.$(`[data-field="${id}"] input`); if (!inp || !(EFA.lib && EFA.lib.disclosure)) return;
    inp.addEventListener('change', () => {
      if (EFA.edit && EFA.edit.on) return;
      let sync = true;
      EFA.lib.disclosure.once(ctx, 'rate', () => {
        if (sync) return; // already acknowledged in this visit: nothing to do
        ctx.timeout(() => { if (inp.isConnected) { inp.focus({ preventScroll: true }); inp.select(); } }, 200);
      });
      sync = false;
    });
  }
  /** a disclaimer line: this screen's assumptions (own copy) followed by Joshua's standard topics */
  function disc(ctx, keys, topics, style) {
    const own = (keys || []).map((k) => ctx.t(k)).join(' ');
    const lib = EFA.lib && EFA.lib.disclosure ? EFA.lib.disclosure.html(topics || ['hypothetical']) : '';
    return `<p class="st-disclaimer b04-disc"${style ? ` style="${style}"` : ''}>${own}${own && lib ? ' ' : ''}${lib}</p>`;
  }
  /** the Documentation opener; while the shared worksheet library loads, a quiet placeholder that says so */
  function docButton(ctx, data, style) {
    const Wk = EFA.lib && EFA.lib.worksheet;
    if (Wk && typeof Wk.button === 'function') return Wk.button(ctx, { data, look: 'link', style });
    return `<button class="b04-link" type="button" data-wswait="1"${style ? ` style="${style}"` : ''}>${ICO.sheet}${ctx.t('docPending')}</button>`;
  }
  function wireDocWait(ctx) { ctx.on(ctx.$$('[data-wswait]'), 'click', () => ctx.toast(ctx.text('wsWait'))); }
  const DOC_COPY = { docPending: 'Documentation', wsWait: 'The worksheet is still loading. Try again in a moment.' };

  /* ---------- small drawings ---------- */
  let gidN = 0; const gid = (p) => `b04${p}${++gidN}`;
  const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

  /** row icons for the input cards (navy and gold line art) */
  function icon(kind) {
    const s = `fill="none" stroke="${P.navy}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
    const g = `fill="none" stroke="${P.gold}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
    const body = {
      bal: `<ellipse cx="16" cy="23" rx="9" ry="3.4" ${s}/><path d="M7 23v-4.5M25 23v-4.5" ${s}/><ellipse cx="16" cy="18.5" rx="9" ry="3.4" fill="${P.goldPale}" stroke="${P.navy}" stroke-width="2.4"/><path d="M7 18.5V14M25 18.5V14" ${s}/><ellipse cx="16" cy="14" rx="9" ry="3.4" fill="${P.gold}" stroke="${P.navy}" stroke-width="2.4"/><path d="M16 4v5M13.5 6.5 16 4l2.5 2.5" ${g}/>`,
      dep: `<circle cx="16" cy="16" r="11" ${s}/><path d="M16 10.5v11M10.5 16h11" ${g}/>`,
      ror: `<path d="M5 25h22" ${s}/><path d="M6 21l6-6 5 4 9-10" ${g}/><path d="M20.5 9H26v5.5" ${g}/>`,
      years: `<rect x="5.5" y="7.5" width="21" height="19" rx="3" ${s}/><path d="M5.5 13h21M11 5v5M21 5v5" ${s}/><path d="M10.5 18h3M15 18h3M19.5 18h2M10.5 22h3M15 22h3" stroke="${P.gold}" stroke-width="2.4" stroke-linecap="round"/>`,
      tax: `<path d="M9 4.5h10l5 5v18H9z" ${s}/><path d="M19 4.5v5h5" ${s}/><path d="M12.5 21.5l7-7" ${g}/><circle cx="13.5" cy="15.5" r="1.6" fill="${P.gold}"/><circle cx="18.5" cy="20.5" r="1.6" fill="${P.gold}"/>`,
      net: `<path d="M6 22a10 10 0 0 1 20 0" ${s}/><path d="M16 22l6-7" ${g}/><circle cx="16" cy="22" r="2.2" fill="${P.navy}"/><path d="M8.5 15.5l1.6 1M23.5 15.5l-1.6 1M16 12v1.8" ${s}/>`,
      card: `<rect x="4.5" y="8" width="23" height="16" rx="3" ${s}/><path d="M4.5 13h23" ${s}/><path d="M8.5 19.5h6" ${g}/>`
    }[kind] || '';
    return `<svg viewBox="0 0 32 32" aria-hidden="true">${body}</svg>`;
  }

  /** a fanned stack of credit cards (cc1): three navy cards and a gold one on top, turned about a point below them */
  function fanCards() {
    const px = 166, py = 270, x = 78, y = 63, w = 176, h = 110;
    const back = (rot, fill, band) => `<g transform="rotate(${rot} ${px} ${py})">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="${P.paper}" stroke-width="2"/>
        <rect x="${x}" y="${y + 22}" width="${w}" height="19" fill="${band}"/>
        <rect x="${x + 18}" y="${y + 80}" width="58" height="7" rx="3.5" fill="${P.paper}" opacity=".35"/>
      </g>`;
    const dots = [0, 1, 2, 3].map((gi) => [0, 1, 2, 3].map((d) => `<circle cx="${x + 22 + gi * 36 + d * 7}" cy="${y + 84}" r="2.5"/>`).join('')).join('');
    return `<svg viewBox="0 0 300 300" aria-hidden="true">
      <ellipse cx="160" cy="254" rx="104" ry="9" fill="${P.shadow}"/>
      <g transform="translate(0 16)">${back(-22, P.navy, P.navy2)}${back(-11, P.navy3, P.navy)}${back(0, P.navy4, P.navy3)}
      <g transform="rotate(11 ${px} ${py})">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="2"/>
        <rect x="${x + 18}" y="${y + 22}" width="32" height="26" rx="5" fill="${P.goldPale}" stroke="${P.goldDeep}" stroke-width="2"/>
        <path d="M${x + 18} ${y + 35}h32M${x + 34} ${y + 22}v26" stroke="${P.goldDeep}" stroke-width="1.6"/>
        <path d="M${x + 140} ${y + 27}a11 11 0 0 1 0 16M${x + 148} ${y + 21}a19 19 0 0 1 0 28" fill="none" stroke="${P.goldPale}" stroke-width="3" stroke-linecap="round"/>
        <g fill="${P.navy}">${dots}</g>
        <rect x="${x + 18}" y="${y + 96}" width="66" height="6" rx="3" fill="${P.navy}" opacity=".55"/>
        <circle cx="${x + 140}" cy="${y + 94}" r="9.5" fill="${P.navy}" opacity=".9"/><circle cx="${x + 152}" cy="${y + 94}" r="9.5" fill="${P.paper}" opacity=".85"/>
      </g></g></svg>`;
  }

  /**
   * Triangle drawing. o: {name, cx, top, w, h, dir:'up'|'down', tone:'navy'|'gold', kind:'fill'|'drain', k}
   * fill:  a faded full triangle with a solid copy scaled by k from the apex (fills downward as k grows).
   * drain: a solid full triangle with a faded copy scaled by k from the top center (the faded part shrinks).
   */
  function tri(o) {
    const id = gid('t'), p = 12, W = o.w + 2 * p, H = o.h + 2 * p + 22, up = o.dir !== 'down';
    const pts = up ? [[W / 2, p], [W - p, p + o.h], [p, p + o.h]] : [[p, p], [W - p, p], [W / 2, p + o.h]];
    const d = 'M' + pts.map((q) => q.map((v) => Math.round(v * 100) / 100).join(',')).join('L') + 'Z';
    const c = o.tone === 'gold' ? { a: P.goldLt, b: P.gold, c: P.goldDeep, faded: '#efe2b8' } : { a: P.navy4, b: P.navy3, c: P.navy, faded: '#dfe5ee' };
    const defs = `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.a}"/><stop offset=".55" stop-color="${c.b}"/><stop offset="1" stop-color="${c.c}"/></linearGradient>`;
    const shadow = `<ellipse cx="${W / 2}" cy="${p + o.h + 17}" rx="${up ? o.w * 0.44 : o.w * 0.13}" ry="${up ? 7 : 5}" fill="rgba(13,30,58,.10)"/>`;
    const solid = `fill="url(#${id})" stroke="url(#${id})" stroke-width="14" stroke-linejoin="round"`;
    const faded = `fill="${c.faded}" stroke="${c.faded}" stroke-width="14" stroke-linejoin="round"`;
    const tf = `style="transform-origin:${W / 2}px ${p}px;transform:scale(${o.k})"`;
    const body = o.kind === 'drain'
      ? `<path d="${d}" ${solid}/><path class="b04-k" d="${d}" ${faded} ${tf}/>`
      : `<path d="${d}" ${faded}/><path class="b04-k" d="${d}" ${solid} ${tf}/>`;
    return `<svg class="b04-tri" data-tri="${o.name}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="left:${o.cx - W / 2}px;top:${o.top - p}px" aria-hidden="true"><defs>${defs}</defs>${shadow}${body}</svg>`;
  }
  const setTri = (ctx, name, k) => { const n = ctx.$(`[data-tri="${name}"] .b04-k`); if (n) n.style.transform = `scale(${Math.max(0, Math.min(1, k))})`; };

  /**
   * Vertical year slider. The handle starts at the top on year 1 and dragging down advances
   * (the original's inverted slider). Returns {get(), set(v), setMax(m)}.
   */
  function vslider(ctx, host, o) {
    let v = o.value, max = Math.max(1, o.max), drag = false;
    host.classList.add('b04-vs');
    host.innerHTML = `<div class="b04-vs-rail"></div><div class="b04-vs-ticks"></div><div class="b04-vs-fill"></div>
      <div class="b04-vs-knob" role="slider" tabindex="0" aria-orientation="vertical" aria-valuemin="1"><span class="b04-vs-tip num"></span></div>`;
    const knob = host.querySelector('.b04-vs-knob'), fill = host.querySelector('.b04-vs-fill'), tip = host.querySelector('.b04-vs-tip'), ticks = host.querySelector('.b04-vs-ticks');
    if (o.label) knob.setAttribute('aria-label', o.label);
    const drawTicks = () => {
      if (max > 60) { ticks.innerHTML = ''; return; }
      let h = '';
      for (let y = 1; y <= max; y++) {
        const t = max <= 1 ? 0 : (y - 1) / (max - 1);
        h += `<i class="b04-vs-tick${y === 1 || y === max || y % 5 === 0 ? ' b04-big' : ''}" style="top:calc(${t * 100}% - 1px)"></i>`;
      }
      ticks.innerHTML = h;
    };
    const paint = () => {
      const t = max <= 1 ? 0 : (v - 1) / (max - 1);
      knob.style.top = (t * 100) + '%'; fill.style.height = (t * 100) + '%';
      tip.textContent = F.int(v);
      knob.setAttribute('aria-valuenow', v); knob.setAttribute('aria-valuemax', max);
    };
    const set = (nv) => { nv = Math.max(1, Math.min(max, Math.round(nv))); if (nv === v) return; v = nv; paint(); o.onChange(v); };
    const fromY = (cy) => { const r = host.getBoundingClientRect(); return 1 + Math.max(0, Math.min(1, (cy - r.top) / r.height)) * (max - 1); };
    host.addEventListener('pointerdown', (e) => {
      if (EFA.edit && EFA.edit.on) return;
      e.preventDefault(); drag = true; host.classList.add('b04-drag');
      try { host.setPointerCapture(e.pointerId); } catch (err) { /* capture unavailable */ }
      set(fromY(e.clientY)); knob.focus({ preventScroll: true });
    });
    host.addEventListener('pointermove', (e) => { if (drag) set(fromY(e.clientY)); });
    const end = () => { drag = false; host.classList.remove('b04-drag'); };
    host.addEventListener('pointerup', end); host.addEventListener('pointercancel', end);
    knob.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); set(v + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); set(v - 1); }
    });
    drawTicks(); paint();
    return {
      get: () => v,
      set(nv) { v = Math.max(1, Math.min(max, Math.round(nv))); paint(); },
      setMax(m) { m = Math.max(1, Math.round(m)); if (m === max) return; max = m; if (v > max) v = max; drawTicks(); paint(); }
    };
  }

  /* ======================================================================
     Shared copy
     ====================================================================== */
  const AS_CI = 'Assumes one constant return, taxed every year at a flat rate, with the tax paid from outside the account.';
  const AS_OPP = 'Opportunity cost assumes the taxes paid could have earned the after-tax rate.';
  const AS_FUND = 'Assumes a constant after-tax return on the reserve and the same flat tax rate every year.';
  const WS_CI = {
    wsTitle: 'Compound Growth in a Taxable Account',
    'ws.year': 'Year', 'ws.dep': 'Annual Investment', 'ws.boy': 'Start-of-Year Balance', 'ws.int': 'Interest Earned',
    'ws.eoy': 'End-of-Year Balance', 'ws.cumInt': 'Cumulative Interest', 'ws.tax': 'Tax Paid', 'ws.cumTax': 'Cumulative Tax',
    'ws.netReg': 'End Balance less Cumulative Tax', 'ws.opp': 'Cumulative Opportunity Cost of Tax', 'ws.netOpp': 'End Balance less Opportunity Cost',
    'as.bal': 'Initial Account Balance', 'as.dep': 'Annual Investment', 'as.ror': 'Investment Return', 'as.tax': 'Tax Bracket', 'as.years': 'Years to Project', 'as.net': 'Net Opportunity Rate'
  };
  const FORM_COPY = { bal: 'Initial Account Balance', dep: 'Annual Investment', ror: 'Investment Return', years: 'Years to Project', tax: 'Tax Bracket' };

  /** the worksheet's assumptions block: the example's inputs */
  function wsAssume(ctx, g) {
    return [
      { label: ctx.t('as.bal'), value: $0(g.p.bal) }, { label: ctx.t('as.dep'), value: $0(g.p.dep) },
      { label: ctx.t('as.ror'), value: pct2(g.r) }, { label: ctx.t('as.tax'), value: pct2(g.t) },
      { label: ctx.t('as.years'), value: F.int(g.N) }, { label: ctx.t('as.net'), value: pct2(g.s) }
    ];
  }
  /** worksheet data for the compound-growth grid (ci3, cit2, cit3) */
  function wsCompound(ctx, g, opp) {
    const cols = ['year', 'dep', 'boy', 'int', 'eoy', 'cumInt', 'tax', 'cumTax', 'netReg', 'opp', 'netOpp'];
    return {
      heading: ctx.t('wsTitle'),
      columns: cols.map((f) => (f === 'year' ? { field: f, header: ctx.t('ws.year'), type: 'year' } : { field: f, header: ctx.t('ws.' + f), type: 'money', dp: 2 })),
      rows: g.rows.map((r) => { const o = {}; cols.forEach((f) => { o[f] = r[f]; }); return o; }),
      assumptions: wsAssume(ctx, g),
      highlight: opp ? 'netOpp' : 'netReg',
      disclosures: ['hypothetical', 'notAdvice', 'license']
    };
  }

  /* ======================================================================
     Pie concept screens (ci1, cc1)
     ====================================================================== */
  function pieScreen(ctx, o) {
    const { cx, cy, r } = o;
    let defs = '', paths = '', labs = '';
    o.slices.forEach((s, i) => {
      const id = gid('p' + i); defs += grad(id, s.c[0], s.c[1]);
      const mid = (s.a0 + s.a1) / 2, e = s.ex || 0;
      const dx = e * Math.sin(mid * Math.PI / 180), dy = -e * Math.cos(mid * Math.PI / 180);
      paths += `<path d="${A.wedge(cx + dx, cy + dy, r, s.a0 + 0.6, s.a1 - 0.6)}" fill="url(#${id})"/>`;
      const [lx, ly] = A.pt(cx + dx, cy + dy, r * (s.lr || 0.62), s.la != null ? s.la : mid);
      labs += `<div class="b04-lab${s.dark ? ' b04-dark' : ''}${s.sm ? ' b04-sm' : ''}" style="left:${lx}px;top:${ly}px">${ctx.t(s.key)}</div>`;
    });
    const fid = gid('f');
    return `<svg class="b04-full" viewBox="0 0 1600 900"><defs>${defs}<filter id="${fid}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0d1e3a" flood-opacity=".16"/></filter></defs>
        <g filter="url(#${fid})">${paths}</g></svg>${labs}`;
  }

  EFA.screen('ci1', {
    title: 'Where compound growth leaks when it is taxed',
    copy: {
      head: 'When Your Growth Is Taxed Every Year',
      wealth: 'Your\nWealth', opp: 'Opportunity\nCost', tax: 'Taxes',
      _notes: 'Growth in a taxable account is shared. Taxes take a slice every year, and the dollars paid in taxes stop working for you the day they leave.\n\n- Ask: When your account has a good year, who else gets paid?\nPAUSE\n\n- Next we put numbers to it with a simple example.'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b04-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${pieScreen(ctx, {
          cx: 770, cy: 512, r: 274,
          slices: [
            { key: 'wealth', a0: 180, a1: 420, c: [P.navy3, P.navy], ex: 5, lr: 0.5, la: 292 },
            { key: 'opp', a0: 60, a1: 120, c: [P.goldPale, P.goldLt], ex: 20, dark: true, sm: true, lr: 0.64 },
            { key: 'tax', a0: 120, a1: 180, c: [P.gold, P.goldDeep], ex: 20, dark: true, lr: 0.64 }
          ]
        })}`;
    }
  });

  EFA.screen('cc1', {
    title: 'Credit cards take a slice of your wealth',
    copy: {
      head: 'The Real Price of Card Debt',
      wealth: 'Your\nWealth', opp: 'Opportunity\nCost', int: 'Interest', debt: 'Credit Card\nDebt',
      _notes: 'A card balance costs more than the purchases. It takes the interest, and everything that interest could have earned for you.\n\n- Ask: When you think about what your cards cost, do you count the interest, or only the purchases?\nPAUSE\n\n- Next we put a number on it.'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b04-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${pieScreen(ctx, {
          cx: 560, cy: 520, r: 262,
          slices: [
            { key: 'wealth', a0: 180, a1: 360, c: [P.navy3, P.navy], ex: 5, lr: 0.5 },
            { key: 'opp', a0: 0, a1: 60, c: ['#3c5d92', P.navy4], ex: 14, sm: true, lr: 0.68, la: 36 },
            { key: 'int', a0: 60, a1: 120, c: [P.navy4, P.navy3], ex: 14, sm: true, lr: 0.66 },
            { key: 'debt', a0: 120, a1: 180, c: [P.navy3, P.navy2], ex: 14, sm: true, lr: 0.68, la: 144 }
          ]
        })}
        <div class="b04-med" style="left:1000px;top:346px;width:360px;height:360px">${fanCards()}</div>`;
    }
  });

  /* ======================================================================
     Example forms (ci2, cit1)
     ====================================================================== */
  const formRows = (ctx, ids) => ids.map((id) => `<div class="b04-frow"><span class="b04-ico">${icon(id)}</span>${cfield(ctx, id, id)}</div>`).join('');

  EFA.screen('ci2', {
    title: 'Example inputs for taxed compound growth',
    copy: Object.assign({
      head: 'Let’s Work Through an Example Together',
      _notes: 'Let’s put real numbers to the idea. Use your client’s own figures where you have them; the defaults work as an example.\n\n- Ask: If every dollar of growth kept working for you, how different would the next 30 years look?\nPAUSE\n\n- The first click on the return field shows the hypothetical-return disclosure.'
    }, FORM_COPY),
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b04-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b04-card st-card b04-form" style="left:424px;top:214px;width:752px">${formRows(ctx, ['bal', 'dep', 'ror', 'years', 'tax'])}</div>
        ${disc(ctx, [], ['hypothetical'])}`;
      ctx.onFields(() => wholeYears('time_period_in_years'));
      guardRate(ctx, 'ror');
    }
  });

  EFA.screen('cit1', {
    title: 'Example inputs and the net opportunity rate',
    copy: Object.assign({
      head: 'Let’s Explore an Example Together',
      net: 'Net Opportunity Rate',
      _notes: 'This tutorial follows one example from start to finish. The net opportunity rate is what the money earns after the yearly tax, and every screen that follows uses it.\n\n- Ask: Have you ever looked at your return after taxes instead of before?\nPAUSE\n\n- Changing the return shows the hypothetical-return disclosure the first time.'
    }, FORM_COPY),
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b04-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b04-card st-card b04-form" style="left:400px;top:198px;width:800px">${formRows(ctx, ['bal', 'dep', 'ror', 'years', 'tax'])}
          <div class="b04-frow"><span class="b04-ico b04-gold">${icon('net')}</span><div class="b04-orow">${ctx.t('net', { cls: 'b04-olab' })}<div class="b04-out" data-o="net"><span class="num"></span></div></div></div>
        </div>
        ${disc(ctx, [], ['hypothetical'])}`;
      const paint = () => { const p = ciParams(); ctx.$('[data-o="net"] .num').textContent = pct2(p.ror * (1 - p.tax)); };
      paint();
      ctx.onFields(paint);
      guardRateOnChange(ctx, 'ror');
    }
  });

  /* ======================================================================
     Two-triangle year stepper (ci3, cit2, cit3)
     mode: 'toggle' = ci3 (switch regular / opportunity cost), 'reg' = cit2, 'opp' = cit3
     ====================================================================== */
  const TG = { w: 284, h: 300, top: 252, gx: 627, rx: 1007 };
  const TRI_COPY = Object.assign({
    bal: 'Initial Account Balance', dep: 'Annual Investment',
    capInt: 'Compound Interest', capTax: 'Increasing Tax', yearsLab: 'Years',
    intEarned: 'Interest Earned', acctVal: 'Account Value', yearLab: 'Year', annTax: 'Annual Tax', cumTax: 'Cumulative Tax',
    net: 'Net (account value less cumulative tax) =',
    assume: AS_CI
  }, WS_CI, DOC_COPY);

  function triScreen(ctx, mode) {
    const st = { opp: mode === 'opp', Y: 1, g: ciGrid(ciParams()) };
    const showRate = mode !== 'reg';
    ctx.el.innerHTML = `
      <div class="b04-card st-card b04-mini" style="left:110px;top:34px;width:640px">
        <div class="b04-mrow">${cfield(ctx, 'bal', 'bal')}</div>
        <div class="b04-mrow">${cfield(ctx, 'dep', 'dep')}</div>
      </div>
      ${showRate ? `<div class="b04-orate fade" data-orate="1" style="left:820px;width:670px;top:62px"><hr class="st-rule"><div class="b04-orate-t">${ctx.t('oppRate')} <span class="num" data-o="s"></span></div></div>` : ''}
      <div class="b04-cap b04-navy" style="left:${TG.gx}px;top:214px">${ctx.t('capInt')}</div>
      <div class="b04-cap" style="left:${TG.rx}px;top:214px">${ctx.t('capTax')}</div>
      ${tri({ name: 'int', cx: TG.gx, top: TG.top, w: TG.w, h: TG.h, tone: 'navy', kind: 'fill', k: 1 / st.g.N })}
      ${tri({ name: 'tax', cx: TG.rx, top: TG.top, w: TG.w, h: TG.h, tone: 'gold', kind: 'fill', k: 1 / st.g.N })}
      <div class="b04-tin" style="left:${TG.gx - 64}px;top:${TG.top + TG.h * 0.56 - 24}px">${cfield(ctx, 'ror', null)}</div>
      <div class="b04-tin" style="left:${TG.rx - 64}px;top:${TG.top + TG.h * 0.56 - 24}px">${cfield(ctx, 'tax', null)}</div>
      <div class="b04-yrs" style="left:1236px;top:${TG.top + 92}px;width:116px">${ctx.t('yearsLab', { cls: 'b04-yrs-k' })}${cfield(ctx, 'years', null)}</div>
      <div data-vs="1" style="left:1384px;top:${TG.top + 4}px;height:${TG.h - 8}px"></div>
      <div class="b04-foot st-card" style="top:582px">
        <div class="b04-side">
          <div class="b04-kv"><span class="b04-kv-k"><i></i>${ctx.t('intEarned')}</span><span class="b04-kv-v num" data-o="int"></span></div>
          <div class="b04-kv"><span class="b04-kv-k"><i></i>${ctx.t('acctVal')}</span><span class="b04-kv-v num" data-o="eoy"></span></div>
        </div>
        <div class="b04-mid">${ctx.t('yearLab', { cls: 'b04-mid-k' })}<span class="b04-mid-v num" data-o="Y"></span></div>
        <div class="b04-side b04-r">
          <div class="b04-kv"><span class="b04-kv-v num" data-o="tax"></span><span class="b04-kv-k">${ctx.t('annTax')}<i></i></span></div>
          <div class="b04-kv"><span class="b04-kv-v num" data-o="cum"></span><span class="b04-kv-k">${ctx.t('cumTax')}<i></i></span></div>
        </div>
        <div class="b04-net"><span data-net="reg">${ctx.t('net')}</span>${mode === 'toggle' ? `<span data-net="opp">${ctx.t('netOpp')}</span>` : ''}<span class="b04-net-v num" data-o="net"></span></div>
      </div>
      <div class="b04-links" style="top:760px">
        ${mode === 'toggle' ? `<button class="b04-link" type="button" data-act="opp">${ICO.swap}<span data-tg="reg">${ctx.t('showOpp')}</span><span data-tg="opp">${ctx.t('showReg')}</span></button>` : ''}
        ${docButton(ctx, () => wsCompound(ctx, st.g, st.opp))}
      </div>
      ${disc(ctx, mode === 'reg' ? ['assume'] : ['assume', 'assumeOpp'], ['hypothetical', 'notAdvice'])}`;
    const aria = (id, key) => { const n = ctx.$(`[data-field="${id}"] input`); if (n) n.setAttribute('aria-label', ctx.text(key)); };
    aria('ror', 'capInt'); aria('tax', 'capTax'); aria('years', 'yearsLab');
    const sl = vslider(ctx, ctx.$('[data-vs]'), { value: 1, max: st.g.N, label: ctx.text('yearLab'), onChange: (y) => { st.Y = y; paint(); } });
    const paint = () => {
      const g = st.g; st.Y = Math.max(1, Math.min(g.N, st.Y));
      const r = g.rows[st.Y - 1], opp = st.opp;
      const set = (k, v) => { const n = ctx.$(`[data-o="${k}"]`); if (n) n.textContent = v; };
      set('int', $0(r.int)); set('eoy', $0(r.eoy)); set('Y', F.int(st.Y));
      set('tax', $0(r.tax)); set('cum', $0(opp ? r.opp : r.cumTax)); set('net', $0(opp ? r.netOpp : r.netReg));
      set('s', pct2(g.s));
      setTri(ctx, 'int', st.Y / g.N); setTri(ctx, 'tax', st.Y / g.N);
      if (mode === 'toggle') {
        ctx.show('[data-orate]', opp);
        ctx.$$('[data-net]').forEach((n) => { n.hidden = n.dataset.net !== (opp ? 'opp' : 'reg'); });
        ctx.$$('[data-tg]').forEach((n) => { n.hidden = n.dataset.tg !== (opp ? 'opp' : 'reg'); });
      }
    };
    ctx.onFields(() => {
      st.g = ciGrid(ciParams());
      sl.setMax(st.g.N); st.Y = Math.min(st.Y, st.g.N); sl.set(st.Y);   // keep the year inside the new range
      paint();
    });
    ctx.on(ctx.$$('[data-act="opp"]'), 'click', () => { st.opp = !st.opp; paint(); });
    wireDocWait(ctx);
    guardRate(ctx, 'ror');
    paint();
  }

  EFA.screen('ci3', {
    title: 'Compound interest vs a growing tax bill',
    copy: Object.assign({}, TRI_COPY, {
      netOpp: 'Net (account value less cumulative tax, at opportunity cost) =',
      oppRate: 'Net opportunity rate of',
      showOpp: 'Show Opportunity Cost', showReg: 'Show Regular Cost',
      assumeOpp: AS_OPP,
      _notes: 'Each year the account earns more, and the tax grows right along with it, because the tax is a share of that growth.\n\n- Drag the year slider down and let both triangles fill.\n- Ask: What does the tax bill look like by the time you need this money most?\nPAUSE\n\n- Click Show Opportunity Cost to add what those tax dollars could have earned had they stayed invested.'
    }),
    render(ctx) { triScreen(ctx, 'toggle'); }
  });

  EFA.screen('cit2', {
    title: 'Compound interest and the yearly tax bill',
    copy: Object.assign({}, TRI_COPY, {
      _notes: 'This is the regular view: each year’s interest, and each year’s tax on that interest. The two grow together.\n\n- Drag the slider through the years.\n- Ask: Is your tax bill a fixed cost, or does it grow as you succeed?\nPAUSE'
    }),
    render(ctx) { triScreen(ctx, 'reg'); }
  });

  EFA.screen('cit3', {
    title: 'The opportunity cost of taxes',
    copy: Object.assign({}, TRI_COPY, {
      oppRate: 'Net opportunity rate of',
      assumeOpp: AS_OPP,
      _notes: 'Now the full cost. Every tax dollar paid could have kept compounding at the after-tax rate, so the tax side now counts each year’s tax plus what the earlier taxes would have earned.\n\n- Drag to the final year and compare the net with the last screen.\n- Ask: When you count what those dollars could have become, how large is the real cost?\nPAUSE'
    }),
    render(ctx) { triScreen(ctx, 'opp'); }
  });

  /* ======================================================================
     cit4: table of the rising tax liability
     ====================================================================== */
  EFA.screen('cit4', {
    title: 'Table of the rising tax liability',
    copy: {
      head: 'A Tax Bill That Keeps Growing',
      colYear: 'Year', colTax: 'Tax Paid', colCum: 'Cumulative Tax Paid', colOpp: 'Cumulative Opportunity Cost of Tax', colYear2: 'Year',
      assume: AS_CI, assumeOpp: AS_OPP,
      _notes: 'Year by year: the tax paid, the running total, and the running opportunity cost. Watch how quickly the last column pulls away from the one beside it.\n\n- Scroll down to the final years.\n- Ask: Which of these numbers surprises you most?\nPAUSE'
    },
    render(ctx) {
      const g = ciGrid(ciParams()), max = g.rows[g.N - 1].opp || 1;
      const cg = '<colgroup><col style="width:120px"><col style="width:230px"><col style="width:404px"><col style="width:404px"><col style="width:120px"></colgroup>';
      const bar = (v, cls) => `<td class="b04-bar${cls ? ' ' + cls : ''}"><i style="width:calc((100% - 178px) * ${(Math.max(0, v) / max).toFixed(4)})"></i><span class="num">${$0(v)}</span></td>`;
      ctx.el.innerHTML = `
        <div class="b04-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b04-tbox" style="left:160px;top:176px;width:1280px;height:626px">
          <table class="st-table b04-tbl b04-thead">${cg}
            <thead><tr><th class="b04-c">${ctx.t('colYear')}</th><th>${ctx.t('colTax')}</th><th>${ctx.t('colCum')}</th><th>${ctx.t('colOpp')}</th><th class="b04-c">${ctx.t('colYear2')}</th></tr></thead>
          </table>
          <div class="b04-tscroll" tabindex="0"><table class="st-table b04-tbl">${cg}
            <tbody>${g.rows.map((r) => `<tr><td class="b04-c num">${r.year}</td><td class="num">${$0(r.tax)}</td>${bar(r.cumTax)}${bar(r.opp, 'b04-gold b04-opp')}<td class="b04-c num">${r.year}</td></tr>`).join('')}</tbody>
          </table></div>
          <div class="b04-tfade"></div>
        </div>
        ${disc(ctx, ['assume', 'assumeOpp'], ['hypothetical', 'notAdvice'])}`;
      const sc = ctx.$('.b04-tscroll'), fade = ctx.$('.b04-tfade');
      const edge = () => { fade.style.opacity = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4 ? 0 : 1; };
      sc.addEventListener('scroll', edge); edge();
    }
  });

  /* ======================================================================
     cit5: the lump sum that would pay the future taxes, and its run-down graph
     ====================================================================== */
  /** smooth monotone path through points (no overshoot) */
  function smoothPath(pts) {
    const n = pts.length; if (n < 2) return n ? `M${pts[0][0]},${pts[0][1]}` : '';
    const dx = [], m = [];
    for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
    const t = [m[0]];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
    t[n - 1] = m[n - 2];
    for (let i = 0; i < n - 1; i++) {
      if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
      const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
      if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
    }
    const f = (v) => Math.round(v * 10) / 10;
    let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    for (let i = 0; i < n - 1; i++) {
      const h = dx[i];
      d += `C${f(pts[i][0] + h / 3)},${f(pts[i][1] + t[i] * h / 3)} ${f(pts[i + 1][0] - h / 3)},${f(pts[i + 1][1] - t[i + 1] * h / 3)} ${f(pts[i + 1][0])},${f(pts[i + 1][1])}`;
    }
    return d;
  }
  /** a tidy axis: a step of 1, 2, 2.5 or 5 x 10^k and a maximum of whole steps */
  function niceAxis(v, ticks) {
    if (!(v > 0)) return { max: 5, step: 1 };
    const raw = v / ticks, e = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / e;
    const step = Math.max(1, (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * e);   // whole dollars
    return { max: Math.ceil(v / step - 1e-9) * step, step };
  }

  function fundChart(ctx, host, fund) {
    const w = 1300, h = 560, pad = { l: 112, r: 28, t: 24, b: 58 };
    const ys = fund.map((f) => Math.max(0, Math.round(f.end * 100) / 100)), n = ys.length;
    const ax = niceAxis(Math.max(...ys, 1), 5), yMax = ax.max, nt = Math.round(ax.max / ax.step);
    const X = (i) => pad.l + (n <= 1 ? (w - pad.l - pad.r) / 2 : (i * (w - pad.l - pad.r)) / (n - 1));
    const Y = (v) => pad.t + (h - pad.t - pad.b) * (1 - v / yMax);
    const pts = ys.map((v, i) => [X(i), Y(v)]);
    const line = smoothPath(pts), base = Y(0), id = gid('a');
    let grid = '';
    for (let i = 0; i <= nt; i++) {
      const v = ax.step * i, y = Y(v);
      grid += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="${P.rule}" stroke-width="1" ${i ? 'opacity=".7"' : ''}/>`;
      grid += `<text x="${pad.l - 14}" y="${y + 6}" text-anchor="end" font-family="DM Sans, sans-serif" font-size="17" fill="#667389">${F.money(v, { compact: true })}</text>`;
    }
    const every = n > 40 ? 10 : n > 20 ? 5 : n > 10 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const yr = i + 1;
      if (yr !== 1 && yr !== n && yr % every) continue;
      if (yr !== n && yr !== 1 && n - yr < every / 2) continue;
      grid += `<text x="${X(i)}" y="${h - pad.b + 30}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="17" fill="#667389">${yr}</text>`;
    }
    host.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
        <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.navy4}" stop-opacity=".95"/><stop offset="1" stop-color="${P.navy3}" stop-opacity=".45"/></linearGradient></defs>
        ${grid}
        <path d="${line}L${pts[n - 1][0]},${base}L${pts[0][0]},${base}Z" fill="url(#${id})"/>
        <path d="${line}" fill="none" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
        <line class="b04-g-guide" x1="0" x2="0" y1="${pad.t}" y2="${base}" stroke="${P.gold}" stroke-width="2" stroke-dasharray="4 6" opacity="0"/>
        <circle class="b04-g-dot" r="9" cx="0" cy="0" fill="${P.gold}" stroke="#fff" stroke-width="3" opacity="0"/>
        <rect class="b04-g-hit" x="${pad.l}" y="${pad.t}" width="${w - pad.l - pad.r}" height="${base - pad.t}" fill="transparent"/>
      </svg>
      <div class="b04-axl" style="left:${(pad.l + w - pad.r) / 2}px;top:${h - 14}px;transform:translateX(-50%)">${ctx.t('axisYear')}</div>
      <div class="b04-ctip" style="opacity:0"><span class="b04-ctip-y">${ctx.t('tipYear')} <span class="num" data-tip="yr"></span></span><span class="num" data-tip="v"></span></div>`;
    const svg = host.querySelector('svg'), guide = svg.querySelector('.b04-g-guide'), dot = svg.querySelector('.b04-g-dot'), tip = host.querySelector('.b04-ctip');
    const hit = svg.querySelector('.b04-g-hit');
    hit.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * (w / r.width);
      const i = Math.max(0, Math.min(n - 1, Math.round(((x - pad.l) / (w - pad.l - pad.r)) * (n - 1))));
      const [px, py] = pts[i];
      guide.setAttribute('x1', px); guide.setAttribute('x2', px); guide.setAttribute('opacity', 1);
      dot.setAttribute('cx', px); dot.setAttribute('cy', py); dot.setAttribute('opacity', 1);
      tip.querySelector('[data-tip="yr"]').textContent = F.int(i + 1);
      tip.querySelector('[data-tip="v"]').textContent = $0(ys[i]);
      tip.style.left = px + 'px'; tip.style.top = py + 'px'; tip.style.opacity = 1;
    });
    hit.addEventListener('pointerleave', () => { guide.setAttribute('opacity', 0); dot.setAttribute('opacity', 0); tip.style.opacity = 0; });
  }

  EFA.screen('cit5', {
    title: 'Lump sum needed today to cover the future taxes',
    steps: 2,
    copy: Object.assign({
      head: 'How Much Would It Take, Today,\nto Cover Every Future Tax Bill?',
      fvLab: 'Future Value of Taxes', rateLab: 'Net Opportunity Rate', yearsLab: 'Years to Project',
      calc: 'Calculate',
      resLead: 'Set aside today:',
      p1: 'A one-time deposit of', p2: 'today would be enough to pay every tax bill your',
      p3: 'taxable account produces over the next', p4: 'years, based on our example.',
      graph: 'Graph',
      gh1: 'Your', gh2: 'reserve pays each year’s tax and runs down to zero over', gh3: 'years',
      axisYear: 'Year', tipYear: 'Year', back: 'Return',
      wsT1: 'How', wsT2: 'Covers the Taxes Over', wsT3: 'Years',
      'ws.year': 'Year', 'ws.start': 'Start Balance', 'ws.int': 'Interest Earned', 'ws.pay': 'Tax Paid', 'ws.end': 'End Balance',
      'as.bal': WS_CI['as.bal'], 'as.dep': WS_CI['as.dep'], 'as.ror': WS_CI['as.ror'], 'as.tax': WS_CI['as.tax'], 'as.years': WS_CI['as.years'], 'as.net': WS_CI['as.net'],
      assume: AS_FUND,
      _notes: 'One way to see the size of a future obligation is to ask what it would take to pay all of it today. This is the single deposit that, earning the after-tax rate, pays every year’s tax and reaches zero in the final year.\n\n- Click Calculate, then Graph to show the reserve running down.\n- Ask: If you had to write that check today, would it change how you think about where your growth is taxed?\nPAUSE'
    }, DOC_COPY),
    render(ctx) {
      const g = ciGrid(ciParams()), T = ciTaxFund(g);
      const sheet = () => ({
        heading: `${ctx.t('wsT1')} ${N($0(T.PV))} ${ctx.t('wsT2')} ${N(F.int(g.N))} ${ctx.t('wsT3')}`,
        size: 'medium',
        columns: [{ field: 'year', header: ctx.t('ws.year'), type: 'year' }].concat(['start', 'int', 'pay', 'end'].map((f) => ({ field: f, header: ctx.t('ws.' + f), type: 'money', dp: 2 }))),
        rows: T.fund.map((r) => ({ year: r.year, start: r.start, int: r.int, pay: r.pay, end: zero(r.end) })),
        assumptions: wsAssume(ctx, g),
        highlight: 'end',
        disclosures: ['hypothetical', 'notAdvice', 'license']
      });
      ctx.el.innerHTML = `
        <div class="b04-view" data-view="main">
          <div class="b04-head" style="top:38px;gap:20px"><h1 class="st-h1" style="font-size:54px">${ctx.t('head')}</h1><hr class="st-rule"></div>
          <div class="b04-card st-card b04-form b04-tight b04-cin" data-in="1" style="left:400px;top:190px;width:800px">
            <div class="b04-frow"><span class="b04-ico">${icon('tax')}</span><div class="b04-orow">${ctx.t('fvLab', { cls: 'b04-olab' })}<div class="b04-out b04-navy"><span class="num">${$0(T.FV)}</span></div></div></div>
            <div class="b04-frow"><span class="b04-ico">${icon('net')}</span><div class="b04-orow">${ctx.t('rateLab', { cls: 'b04-olab' })}<div class="b04-out"><span class="num">${pct2(g.s)}</span></div></div></div>
            <div class="b04-frow"><span class="b04-ico">${icon('years')}</span><div class="b04-orow">${ctx.t('yearsLab', { cls: 'b04-olab' })}<div class="b04-out"><span class="num">${F.int(g.N)}</span></div></div></div>
          </div>
          <div class="b04-btnrow fade" data-calc="1" style="top:524px"><button class="st-pill b04-btn" type="button" data-act="calc">${ctx.t('calc')}</button></div>
          <div class="b04-res st-card fade" data-res="1" style="left:244px;top:466px;width:1112px;padding:22px 44px 18px;display:grid;gap:14px">
            <div class="b04-hl">${ctx.t('resLead')} ${N($0(T.PV))}</div>
            <p class="b04-para">${ctx.t('p1')} ${N($0(T.PV))} ${ctx.t('p2')} ${N($0(g.p.bal))} ${ctx.t('p3')} ${N(F.int(g.N))} ${ctx.t('p4')}</p>
            <div class="b04-links"><button class="b04-link" type="button" data-act="graph">${ICO.chart}${ctx.t('graph')}</button>${docButton(ctx, sheet)}</div>
          </div>
          ${disc(ctx, ['assume'], ['hypothetical', 'notAdvice'])}
        </div>
        <div class="b04-view is-off" data-view="graph">
          <div class="b04-gcard st-card">
            <h2 class="st-h2">${ctx.t('gh1')} ${N($0(T.PV))} ${ctx.t('gh2')} ${N(F.int(g.N))} ${ctx.t('gh3')}</h2>
            <div class="b04-chart" data-chart="1"></div>
            <button class="st-pill" type="button" data-act="back" style="min-width:200px;font-size:18px">${ctx.t('back')}</button>
          </div>
        </div>`;
      fundChart(ctx, ctx.$('[data-chart]'), T.fund);
      const view = (v) => { ctx.show('[data-view="main"]', v === 'main'); ctx.show('[data-view="graph"]', v === 'graph'); };
      ctx._b04view = view;
      ctx.on(ctx.$('[data-act="calc"]'), 'click', () => { if (ctx.step === 0) ctx.next(); });
      ctx.on(ctx.$('[data-act="graph"]'), 'click', () => ctx.timeout(() => view('graph'), 250));
      ctx.on(ctx.$('[data-act="back"]'), 'click', () => view('main'));
      wireDocWait(ctx);
    },
    step(ctx, n) {
      ctx.show('[data-calc]', n === 0);
      ctx.show('[data-res]', n === 1);
      const inc = ctx.$('[data-in]'); if (inc) inc.style.transform = `translateY(${n === 1 ? 0 : 64}px)`;
      if (ctx._b04view) ctx._b04view('main');
    }
  });

  /* ======================================================================
     cit6: the tax fund shrinks while the taxable account grows
     ====================================================================== */
  EFA.screen('cit6', {
    title: 'The tax fund shrinks while the taxable account grows',
    copy: Object.assign({
      head: 'Your Tax Reserve Shrinks as Your Account Grows',
      capInt: 'Compound Interest', capFund: 'Lump Sum Tax Fund', eoyLab: 'End of Year\nBalance', yearWord: 'Year',
      wsTitle: 'Your Account and Your Tax Reserve, Year by Year',
      'ws.year': 'Year', 'ws.dep': 'Annual Deposit', 'ws.boy': 'Start-of-Year Balance', 'ws.int': 'Interest Earned', 'ws.eoy': 'End-of-Year Balance',
      'ws.tax': 'Tax Due', 'ws.fStart': 'Fund Start Balance', 'ws.fInt': 'Fund Interest', 'ws.fPay': 'Tax Paid by Fund', 'ws.fEnd': 'Fund End Balance',
      'as.bal': WS_CI['as.bal'], 'as.dep': WS_CI['as.dep'], 'as.ror': WS_CI['as.ror'], 'as.tax': WS_CI['as.tax'], 'as.years': WS_CI['as.years'], 'as.net': WS_CI['as.net'],
      assume: AS_FUND,
      _notes: 'The account keeps growing, and the reserve set aside for its taxes is used up over the same years.\n\n- Drag the slider and watch the two move in opposite directions.\n- Ask: What if the growth itself did not create a yearly tax bill?\nPAUSE'
    }, DOC_COPY),
    render(ctx) {
      const g = ciGrid(ciParams()), T = ciTaxFund(g);
      const C = { gx: 627, rx: 1007, sx: 1352 }, h = 290, top = 282, st = { Y: 1 };
      const sheet = () => {
        const c = ['dep', 'boy', 'int', 'eoy', 'tax', 'fStart', 'fInt', 'fPay', 'fEnd'];
        return {
          heading: ctx.t('wsTitle'),
          columns: [{ field: 'year', header: ctx.t('ws.year'), type: 'year' }].concat(c.map((f) => ({ field: f, header: ctx.t('ws.' + f), type: 'money', dp: 2 }))),
          rows: g.rows.map((r, i) => { const f = T.fund[i]; return { year: r.year, dep: r.dep, boy: r.boy, int: r.int, eoy: r.eoy, tax: r.tax, fStart: f.start, fInt: f.int, fPay: f.pay, fEnd: zero(f.end) }; }),
          assumptions: wsAssume(ctx, g),
          disclosures: ['hypothetical', 'notAdvice', 'license']
        };
      };
      ctx.el.innerHTML = `
        <div class="b04-head"><h1 class="st-h1" style="font-size:56px">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b04-cap b04-navy" style="left:${C.gx}px;top:168px">${ctx.t('capInt')}</div>
        <div class="b04-cap" style="left:${C.rx}px;top:168px">${ctx.t('capFund')}</div>
        <div class="b04-box" style="left:${C.gx}px;top:198px">${N($0(g.p.bal))}</div>
        <div class="b04-box b04-gold" style="left:${C.rx}px;top:198px">${N($0(T.PV))}</div>
        ${tri({ name: 'acct', cx: C.gx, top, w: 272, h, tone: 'navy', kind: 'fill', k: 1 / g.N })}
        ${tri({ name: 'fund', cx: C.rx, top, w: 300, h, dir: 'down', tone: 'gold', kind: 'drain', k: (g.N - 1) / g.N })}
        <div data-vs="1" style="left:${C.sx - 20}px;top:${top + 4}px;height:${h - 8}px"></div>
        <div class="b04-rlab" style="left:${C.gx - 150}px;top:668px">${ctx.t('eoyLab')}</div>
        <div class="b04-box b04-strong" style="left:${C.gx}px;top:636px"><span class="num" data-o="eoy"></span></div>
        <div class="b04-box b04-gold b04-strong" style="left:${C.rx}px;top:636px"><span class="num" data-o="fund"></span></div>
        <div class="b04-yr" style="left:${C.sx + 12}px;top:668px">${ctx.t('yearWord', { cls: 'b04-yr-k' })}<span class="num" data-o="Y"></span></div>
        <div class="b04-links" style="top:736px">${docButton(ctx, sheet)}</div>
        ${disc(ctx, ['assume'], ['hypothetical', 'notAdvice'])}`;
      const paint = () => {
        const Y = st.Y, r = g.rows[Y - 1], f = T.fund[Y - 1];
        ctx.$('[data-o="eoy"]').textContent = $0(r.eoy);
        ctx.$('[data-o="fund"]').textContent = $0(Math.max(0, zero(f.end)));
        ctx.$('[data-o="Y"]').textContent = F.int(Y);
        setTri(ctx, 'acct', Y / g.N); setTri(ctx, 'fund', (g.N - Y) / g.N);
      };
      vslider(ctx, ctx.$('[data-vs]'), { value: 1, max: g.N, label: ctx.text('yearWord'), onChange: (y) => { st.Y = y; paint(); } });
      wireDocWait(ctx);
      paint();
    }
  });

  /* ======================================================================
     cc2: what carrying a card balance really costs
     ====================================================================== */
  EFA.screen('cc2', {
    title: 'What carrying a card balance really costs',
    copy: {
      head: 'What Carrying a Balance Really Costs You',
      ccBal: 'Credit Card Balance', ccRate: 'Credit Card Interest Rate', ccRor: 'Investment Return Rate',
      calc: 'Calculate', years: 'Years',
      r1: 'The interest you pay',
      r2a: 'What you could have had by investing that interest at',
      r3a: 'What the lender can earn on that interest at',
      assume: 'Assumes the balance stays the same and the card’s interest compounds daily at one constant rate. Educational only, not credit or investment advice.',
      _notes: 'Enter the balance and the card’s rate. The balance is held level, so this shows the cost of simply carrying it.\n\n- Click Calculate, then change the years in the results header.\n- Ask: Who is building wealth with that interest today, you or the lender?\nPAUSE'
    },
    render(ctx) {
      const at = (shown) => (shown ? 168 : 250);
      ctx.el.innerHTML = `
        <div class="b04-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b04-card st-card b04-form b04-tight b04-cin" data-in="1" style="left:440px;top:0;width:720px;transform:translateY(${at(false)}px)">
          ${[['ccBal', 'card', ''], ['ccRate', 'tax', ' b04-gold'], ['ccRor', 'ror', '']].map(([id, ic, c]) => `<div class="b04-frow"><span class="b04-ico${c}">${icon(ic)}</span>${cfield(ctx, id, id)}</div>`).join('')}
        </div>
        <div class="b04-btnrow fade" data-calc="1" style="top:524px"><button class="st-pill b04-btn" type="button" data-act="calc">${ctx.t('calc')}</button></div>
        <div class="b04-res st-card b04-cc fade is-off" data-res="1" style="left:200px;top:440px;width:1200px">
          <div class="b04-ccg b04-h">${ctx.t('years', { cls: 'b04-ccg-yl' })}${cfield(ctx, 'ccYears', null)}<span class="b04-ccg-yc num">20</span><span class="b04-ccg-yc num">40</span></div>
          <div class="b04-ccg b04-row"><span class="b04-ccg-n num">1.</span><span class="b04-ccg-d">${ctx.t('r1')}</span><span class="b04-ccg-v num" data-o="p0"></span><span class="b04-ccg-v num" data-o="p1"></span><span class="b04-ccg-v num" data-o="p2"></span></div>
          <div class="b04-ccg b04-row"><span class="b04-ccg-n num">2.</span><span class="b04-ccg-d">${ctx.t('r2a')} <span class="num" data-o="ror"></span></span><span class="b04-ccg-v num" data-o="i0"></span><span class="b04-ccg-v num" data-o="i1"></span><span class="b04-ccg-v num" data-o="i2"></span></div>
          <div class="b04-ccg b04-row b04-hl3"><span class="b04-ccg-n num">3.</span><span class="b04-ccg-d">${ctx.t('r3a')} <span class="num" data-o="rate"></span></span><span class="b04-ccg-v num" data-o="l0"></span><span class="b04-ccg-v num" data-o="l1"></span><span class="b04-ccg-v num" data-o="l2"></span></div>
        </div>
        ${disc(ctx, ['assume'], ['hypothetical'])}`;
      const yi = ctx.$('[data-field="ccYears"] input'); if (yi) yi.setAttribute('aria-label', ctx.text('years'));
      const paint = () => {
        const rate = cget('credit_card_interest_rate'), ror = cget('case_file_ror_accumulation');
        const c = cardCost({ bal: cget('credit_card_balance'), rate, ror, years: wholeYears('credit_card_years') });
        const set = (k, v) => { const n = ctx.$(`[data-o="${k}"]`); if (n) n.textContent = v; };
        [0, 1, 2].forEach((i) => { set('p' + i, $0(c.paid[i])); set('i' + i, $0(c.invest[i])); set('l' + i, $0(c.lender[i])); });
        set('ror', pctUpTo2(ror)); set('rate', pctUpTo2(rate));
        const longest = Math.max(...c.lender.concat(c.invest, c.paid).map((v) => $0(v).length));
        ctx.$$('.b04-ccg-v').forEach((n) => { n.style.fontSize = longest > 13 ? '19px' : longest > 11 ? '22px' : ''; });
      };
      const reveal = () => {
        ctx.show('[data-calc]', false); ctx.show('[data-res]', true);
        ctx.$('[data-in]').style.transform = `translateY(${at(true)}px)`;
      };
      ctx.onFields(paint);
      ctx.on(ctx.$('[data-act="calc"]'), 'click', reveal);
      guardRate(ctx, 'ccRor');
      paint();
    }
  });
})();
