/* ha: forward and reverse mortgage comparisons plus the reverse mortgage decks.
   Presentations: CFM (Compare Forward Mortgages), C2M (Compare Mortgages Legacy), CFRM (Compare
   Reverse to Forward), RLO (Reverse L.O. Overview), RM (Reverse Mortgages), RM101 (Reverse
   Mortgages 101), and the generic build of the partner editions FWP/FWP6/FWP7 and EWP/EWP6/EWP7.
   Engine exposed: EFA.engines.fwcompare (specs-clean/_fwcompare-engine.md). It shares the tank
   scale, the Scale slider and the PEM frame with EFA.engines.hecm (module b16) when that module is
   loaded, and keeps its own session when it is not.
   Shared pieces used: EFA.lib.pem, EFA.lib.worksheet, EFA.lib.bullets, EFA.lib.disclosure,
   EFA.lib.caseData. Screen structure, sequence and math follow the specs; art and wording are new. */
(function () {
  'use strict';
  const EFA = window.EFA = window.EFA || {};
  EFA.engines = EFA.engines || {};
  const A = EFA.art, P = A.P;
  const F = () => EFA.fmt;
  const lib = (n) => (EFA.lib && EFA.lib[n]) || null;
  const has = (n, fn) => !!(lib(n) && typeof lib(n)[fn] === 'function');
  const money = (v, dp) => F().money(v, { dp: dp || 0 });
  const num = (v) => `<span class="num">${v}</span>`;
  const esc = (s) => (EFA.util ? EFA.util.esc(s) : String(s));

  /* =====================================================================================
     1. STYLES
     ===================================================================================== */
  EFA.css('ha', `
  .stage .ha-sheet { position: absolute; left: 110px; right: 110px; top: 60px; bottom: 80px; columns: 3; column-gap: 40px; overflow: hidden; font: 400 14px/1.4 var(--f-body); }
  .stage .ha-sheet p { margin: 0 0 8px; break-inside: avoid; }
  .stage .ha-head { position: absolute; left: 90px; right: 90px; top: 40px; margin: 0; text-align: center; font: 600 54px/1.06 var(--f-display); color: var(--navy); letter-spacing: -.005em; }
  .stage .ha-head.sm { font-size: 42px; top: 24px; }
  .stage .ha-head.q { font-size: 42px; line-height: 1.22; top: 36px; left: 110px; right: 110px; text-align: left; }
  /* --- bulleted callout slides --- */
  .stage .ha-pts { position: absolute; display: grid; align-content: center; }
  .stage .ha-pt { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 22px; }
  .stage .ha-pt .bx { background: var(--paper); border: 1px solid var(--rule); border-radius: 16px; box-shadow: 0 10px 28px rgba(13,30,58,.08); padding: 22px 30px; font: 600 30px/1.3 var(--f-body); color: var(--navy); }
  .stage .ha-pt .bx.sm { font-size: 25px; padding: 18px 26px; }
  .stage .ha-pt .bx em { font-style: normal; color: var(--gold-deep); }
  .stage .ha-pt .bx .two { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
  .stage .ha-pt .bx .two .cs { color: var(--gold-deep); font-weight: 700; text-align: right; }
  .stage .ha-note { position: absolute; margin: 0; }
  /* --- panel / data column (lesson frame) --- */
  .stage .ha-panel { position: absolute; display: grid; align-content: start; gap: 18px; transition: opacity .5s ease; }
  .stage .ha-panel h2 { margin: 0; }
  .stage .ha-prow { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 16px; }
  .stage .ha-prow .bx { background: rgba(227,232,240,.6); border: 1px solid var(--mist-2); border-radius: 14px; padding: 14px 20px; font: 600 24px/1.32 var(--f-body); color: var(--navy); }
  .stage .ha-prow .bx small { display: block; font: 400 17px/1.35 var(--f-body); color: var(--muted); margin-top: 4px; }
  /* --- calculator frame --- */
  .stage .ha-vp { position: absolute; overflow: hidden; }
  .stage .ha-pemhost { position: absolute; }
  .stage .ha-wait { position: absolute; display: grid; place-items: center; text-align: center; border: 2px dashed var(--mist-2); border-radius: 22px; background: rgba(255,253,248,.6); }
  .stage .ha-wait p { margin: 0; max-width: 480px; font: 500 22px/1.45 var(--f-body); color: var(--muted); }
  .stage .ha-wait p + p { margin-top: 10px; font-size: 17px; }
  .stage .ha-wait .ring { width: 64px; height: 64px; margin: 0 auto 18px; border-radius: 50%; border: 3px solid var(--mist-2); border-top-color: var(--gold); }
  .stage .ha-col { position: absolute; left: 1110px; top: 86px; width: 450px; display: grid; gap: 12px; align-content: start; }
  .stage .ha-card { background: var(--paper); border: 1px solid var(--rule); border-radius: 14px; box-shadow: 0 10px 26px rgba(13,30,58,.08); }
  .stage .ha-strip { padding: 11px 16px 12px; display: grid; gap: 10px; }
  .stage .ha-strip.row { display: flex; align-items: center; gap: 18px; padding: 9px 18px; }
  .stage .ha-agerow { display: flex; align-items: center; gap: 7px; }
  .stage .ha-cap1 { font: 700 13px/1 var(--f-body); letter-spacing: .18em; text-transform: uppercase; color: var(--gold-deep); }
  .stage .ha-agerow .ha-cap1 { margin-right: auto; }
  .stage .ha-strip.row .ha-agerow .ha-cap1 { margin-right: 6px; }
  .stage .ha-ib { width: 40px; height: 40px; flex: 0 0 auto; border-radius: 999px; border: 1.5px solid var(--mist-2); background: #fff; color: var(--navy); display: grid; place-items: center; padding: 0; transition: border-color .2s ease, background .2s ease; }
  .stage .ha-ib:hover { border-color: var(--gold); background: var(--gold-pale); }
  .stage .ha-ib svg { display: block; }
  .stage .ha-agein { width: 82px; text-align: center; font-size: 24px; height: 42px; box-sizing: border-box; border: 1.5px solid var(--mist-2); border-radius: 9px; background: #fff; font-family: var(--f-body); font-weight: 600; color: var(--navy); font-variant-numeric: lining-nums tabular-nums; }
  .stage .ha-agein:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .stage .ha-strow { display: flex; align-items: center; gap: 16px; }
  .stage .ha-chk { display: inline-flex; align-items: center; gap: 8px; font: 600 16px/1 var(--f-body); color: var(--navy); cursor: pointer; user-select: none; }
  .stage .ha-chk input { width: 20px; height: 20px; margin: 0; accent-color: #0d1e3a; cursor: pointer; }
  .stage .ha-scale { display: flex; align-items: center; gap: 10px; flex: 1 1 auto; font: 600 16px/1 var(--f-body); color: var(--navy); }
  .stage .ha-strip.row .ha-scale { width: 200px; flex: 0 0 auto; }
  .stage .ha-scale input[type=range] { flex: 1 1 auto; min-width: 0; accent-color: #b8972e; cursor: pointer; }
  .stage .ha-panelc { overflow: hidden; padding-bottom: 7px; }
  .stage .ha-ph { padding: 9px 16px; text-align: center; font: 700 14px/1.2 var(--f-body); letter-spacing: .16em; text-transform: uppercase; color: var(--cream); background: var(--navy); }
  .stage .ha-r { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 3px 16px; min-height: 38px; }
  .stage .ha-r + .ha-r { border-top: 1px solid rgba(13,30,58,.06); }
  .stage .ha-rl { font: 500 17px/1.2 var(--f-body); color: var(--navy); }
  .stage .ha-rv { font: 600 19px/1.2 var(--f-body); color: var(--navy); text-align: right; white-space: nowrap; }
  .stage .ha-st { position: absolute; z-index: 3; transform: translate(-50%, 0); width: max-content; max-width: 260px; text-align: center; font: 700 17px/1.3 var(--f-body); color: var(--navy); background: var(--paper); border: 2px solid var(--gold); border-radius: 12px; padding: 8px 14px; box-shadow: 0 8px 20px rgba(13,30,58,.16); }
  .stage .ha-links { position: absolute; z-index: 4; left: 22px; bottom: 14px; display: flex; align-items: center; gap: 10px; padding: 4px 10px; border-radius: 999px; background: rgba(247,245,241,.9); }
  .stage .ha-lk { display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent; padding: 4px 2px; color: var(--gold-deep); font: 600 17px/1.2 var(--f-body); cursor: pointer; }
  .stage .ha-lk > [data-cp] { border-bottom: 1.5px dotted currentColor; }
  .stage .ha-lk:hover { color: var(--navy); }
  .stage .ha-lk.muted { color: var(--muted); cursor: default; }
  .stage .ha-foot { position: absolute; left: 1110px; width: 450px; bottom: 60px; display: grid; gap: 6px; }
  .stage .ha-foot .st-disclaimer { margin: 0; font-size: 12.5px; line-height: 1.4; }
  .stage .ha-hdr { position: absolute; left: 0; right: 0; top: 78px; height: 70px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 24px; gap: 16px; }
  .stage .ha-cap { text-align: center; font: 700 28px/1 var(--f-body); letter-spacing: .03em; color: var(--navy); }
  .stage .ha-divider { position: absolute; left: 798px; top: 160px; width: 4px; height: 676px; border-radius: 2px; background: var(--navy); }
  .stage .ha-pop .st-overlay-in { width: 640px; }
  .stage .ha-choose { display: grid; gap: 10px; }
  .stage .ha-choose .ha-lk { font-size: 21px; justify-content: flex-start; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--rule); background: #fff; }
  .stage .ha-choose .ha-lk:hover { border-color: var(--gold); background: var(--gold-pale); }
  /* --- forms (fwc2m2, fwcfr2, c2m1) --- */
  .stage .ha-form { position: absolute; display: grid; }
  .stage .ha-grid { display: grid; grid-template-columns: 200px 1fr 200px; align-items: center; gap: 8px 22px; }
  .stage .ha-grid .cap { text-align: center; font: 700 15px/1.2 var(--f-body); letter-spacing: .16em; text-transform: uppercase; color: var(--cream); background: var(--navy); border-radius: 10px 10px 0 0; padding: 11px 10px; }
  .stage .ha-grid .lb { text-align: center; font: 600 21px/1.25 var(--f-body); color: var(--navy); }
  .stage .ha-grid .lb.two { display: flex; justify-content: space-between; gap: 18px; font-size: 18px; }
  .stage .ha-grid .sec { grid-column: 1 / -1; text-align: center; font: 700 14px/1.2 var(--f-body); letter-spacing: .2em; text-transform: uppercase; color: var(--gold-deep); padding-top: 10px; }
  .stage .ha-grid .ro { text-align: right; font: 700 21px/1.2 var(--f-body); color: var(--gold-deep); font-variant-numeric: lining-nums tabular-nums; padding-right: 2px; }
  .stage .ha-grid .st-field > input { width: 200px; box-sizing: border-box; text-align: right; height: 44px; font-size: 20px; font-weight: 600; }
  .stage .ha-grid .st-seg { padding: 3px; }
  .stage .ha-grid .st-seg-b { padding: 6px 14px; font-size: 16px; }
  .stage .ha-grid .r { justify-self: end; }
  .stage .ha-grid .l { justify-self: start; }
  .stage .ha-warn { font: 700 18px/1.3 var(--f-body); color: #9a3322; text-align: center; }
  .stage .ha-go { justify-self: center; }
  /* --- c2m cards --- */
  .stage .ha-c2 { position: absolute; left: 110px; top: 196px; width: 1000px; padding: 40px 46px 42px; display: grid; gap: 30px; transition: opacity .8s ease; }
  .stage .ha-ans { justify-self: center; width: 76%; text-align: center; border: 4px solid var(--pen-red); border-radius: 14px; padding: 20px 24px; font: 700 44px/1.16 var(--f-body); color: var(--navy); background: #fff; }
  .stage .ha-ans.sm { font-size: 34px; }
  .stage .ha-c2 p { margin: 0; font: 500 27px/1.5 var(--f-body); color: var(--navy); }
  .stage .ha-c2 p .num { font-weight: 700; color: var(--gold-deep); }
  .stage .ha-qm { position: absolute; right: 70px; top: 182px; width: 330px; height: 590px; transition: opacity .8s ease; }
  .stage .ha-qm svg { width: 100%; height: 100%; }
  .stage .ha-lrow { position: absolute; left: 110px; right: 110px; bottom: 120px; display: flex; align-items: center; justify-content: center; gap: 120px; transition: opacity .8s ease; }
  .stage .ha-lrow .pin { position: absolute; left: 0; }
  .stage .ha-bad { position: absolute; left: 50%; top: 300px; transform: translateX(-50%); width: 830px; padding: 34px 40px; text-align: center; font: 500 27px/1.45 var(--f-body); color: var(--navy); }
  .stage .ha-graph { position: absolute; left: 80px; top: 76px; width: 1440px; height: 720px; padding: 26px 34px 24px; display: grid; grid-template-rows: auto auto 1fr auto; gap: 10px; justify-items: center; }
  .stage .ha-graph .gt { font: 600 36px/1.15 var(--f-display); color: var(--navy); text-align: center; margin: 0; }
  .stage .ha-graph .gn { margin: 0; font: 400 16px/1.3 var(--f-body); color: var(--muted); text-align: center; }
  .stage .ha-graph .gw { position: relative; width: 100%; display: grid; place-items: center; }
  .stage .ha-leg { position: absolute; left: 152px; top: 2px; display: grid; gap: 8px; padding: 12px 18px; border-radius: 12px; background: rgba(255,253,248,.94); border: 1px solid var(--rule); font: 700 19px/1.1 var(--f-body); color: var(--navy); }
  .stage .ha-leg span { display: inline-flex; align-items: center; gap: 10px; }
  .stage .ha-key { display: inline-block; width: 32px; height: 5px; border-radius: 3px; }
  .stage .ha-ch4 { position: absolute; left: 80px; top: 44px; width: 1440px; height: 620px; padding: 22px 30px 18px; display: grid; grid-template-rows: auto auto 1fr; gap: 6px; }
  .stage .ha-ch4 .gt { margin: 0; text-align: center; font: 600 34px/1.15 var(--f-display); color: var(--navy); cursor: pointer; }
  .stage .ha-ch4 .gt:hover { color: var(--gold-deep); }
  .stage .ha-ch4 .gs { margin: 0; text-align: center; font: 600 19px/1.2 var(--f-body); color: var(--gold-deep); letter-spacing: .04em; }
  .stage .ha-act { position: absolute; left: 80px; top: 694px; width: 1440px; display: flex; align-items: stretch; justify-content: center; gap: 44px; }
  .stage .ha-ro { padding: 16px 22px; display: grid; gap: 4px; width: 480px; }
  .stage .ha-ro .rr { display: flex; align-items: baseline; justify-content: space-between; gap: 18px; font: 500 20px/1.3 var(--f-body); color: var(--navy); }
  .stage .ha-ro .rr .v { font-weight: 700; }
  .stage .ha-ro .rr.t { font-weight: 700; color: var(--gold-deep); cursor: pointer; }
  .stage .ha-sl { display: grid; place-items: center; gap: 8px; }
  .stage .ha-sl input[type=range] { writing-mode: vertical-lr; direction: rtl; width: 30px; height: 112px; accent-color: #b8972e; cursor: pointer; }
  .stage .ha-btns { display: grid; gap: 10px; align-content: center; }
  /* --- rm quiz --- */
  .stage .ha-qz { position: absolute; left: 50%; transform: translateX(-50%); display: grid; gap: 14px; }
  .stage .ha-qrow { display: grid; grid-template-columns: 74px 1fr; align-items: center; gap: 22px; }
  .stage .ha-qb { width: 64px; height: 64px; border-radius: 50%; border: 2.5px solid var(--navy); background: var(--paper); color: var(--navy); font: 700 30px/1 var(--f-body); display: grid; place-items: center; padding: 0; transition: background .25s ease, color .25s ease, border-color .25s ease; }
  .stage .ha-qb:hover { border-color: var(--gold); }
  .stage .ha-qb[data-a="y"] { background: var(--navy); color: var(--cream); }
  .stage .ha-qb[data-a="n"] { background: var(--gold); border-color: var(--gold); color: var(--navy); }
  .stage .ha-qt { background: rgba(227,232,240,.6); border: 1px solid var(--mist-2); border-radius: 14px; padding: 18px 26px; font: 600 29px/1.3 var(--f-body); color: var(--navy); }
  /* --- rm5 myths --- */
  .stage .ha-my { position: absolute; left: 110px; top: 146px; width: 940px; padding: 28px 34px; display: grid; gap: 15px; }
  .stage .ha-my .ln { font: 600 29px/1.32 var(--f-body); color: var(--navy); transition: color .6s ease, opacity .6s ease; }
  .stage .ha-my .ln.grey { color: var(--muted); opacity: .5; }
  .stage .ha-ex { position: absolute; left: 110px; right: 110px; top: 566px; padding: 26px 34px; font: 500 26px/1.45 var(--f-body); color: var(--navy); transition: opacity .8s ease; }
  .stage .ha-cpl { position: absolute; right: 110px; top: 150px; width: 380px; height: 360px; border-radius: 18px; overflow: hidden; border: 1px solid var(--rule); box-shadow: 0 14px 34px rgba(13,30,58,.12); }
  .stage .ha-cpl .bg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .stage .ha-cpl .hs { position: absolute; left: 11%; right: 11%; bottom: 14%; }
  .stage .ha-cpl .hs svg { width: 100%; height: auto; display: block; }
  .stage .ha-cmp { position: absolute; left: 110px; right: 110px; top: 178px; }
  .stage .ha-cmp .ch { margin: 0 0 16px; text-align: center; font: 600 36px/1.2 var(--f-display); color: var(--navy); }
  .stage .ha-cmp .ch b { color: var(--gold-deep); cursor: pointer; border-bottom: 2px dotted var(--gold); font-weight: 600; }
  .stage .ha-cmp .ch b:hover { color: var(--navy); }
  .stage .ha-cmp table { width: 100%; }
  .stage .ha-cmp .st-table td { padding: 17px 18px; font-size: 22px; vertical-align: middle; }
  .stage .ha-cmp .st-table td:not(:first-child) { text-align: center; }
  .stage .ha-cmp .st-table th { padding: 13px 18px; }
  .stage .ha-cfn { position: absolute; left: 130px; right: 420px; bottom: 78px; margin: 0; text-align: left; }
  /* --- rm4 boxes --- */
  .stage .ha-bxw { position: absolute; left: 0; right: 0; top: 140px; bottom: 40px; }
  .stage .ha-ring { position: absolute; left: 50%; top: 10px; width: 300px; height: 300px; margin-left: -150px; transition: transform 1s linear; }
  .stage .ha-mk { position: absolute; left: 50%; top: -26px; width: 52px; height: 52px; margin-left: -26px; transition: transform 1s linear; }
  .stage .ha-sbx { position: absolute; left: 50%; top: 40px; width: 240px; height: 240px; margin-left: -120px; }
  .stage .ha-lbx { position: absolute; left: 50%; width: 640px; height: 420px; margin-left: -320px; bottom: -500px; transition: bottom 1s cubic-bezier(.3,.7,.3,1); }
  .stage .ha-lbx.up { bottom: 6px; }
  .stage .ha-sbx svg, .stage .ha-lbx svg, .stage .ha-mk svg { width: 100%; height: 100%; display: block; }
  .stage .ha-boxlab { position: absolute; left: 50%; transform: translateX(-50%); text-align: center; font: 700 17px/1.25 var(--f-body); letter-spacing: .16em; text-transform: uppercase; white-space: normal; }
  .stage .ha-boxlab.sm { width: 150px; color: var(--cream); top: 56%; }
  .stage .ha-boxlab.lg { width: 420px; color: var(--navy); top: 58%; font-size: 24px; }
  /* --- rm3 reveal --- */
  .stage .ha-reveal { position: absolute; left: 120px; right: 120px; top: 108px; display: grid; gap: 14px; justify-items: center; text-align: center; }
  .stage .ha-reveal .term { font: 600 60px/1.1 var(--f-display); color: var(--gold-deep); cursor: pointer; border-bottom: 3px dotted var(--gold); }
  .stage .ha-reveal .term:hover { color: var(--navy); }
  .stage .ha-qmc { position: absolute; left: 50%; top: 300px; width: 360px; height: 548px; margin-left: -180px; }
  .stage .ha-qmc svg { width: 100%; height: 100%; }
  `);

  /* =====================================================================================
     2. SHARED WORDING (pseudo-screen _ha_fw: edit once with E, shows on every screen here)
     ===================================================================================== */
  const HS = '_ha_fw';
  const HCOPY = {
    age: 'Age', step: 'Step', scale: 'Scale',
    hecm: 'HECM', forward: 'Forward', s1: 'Strategy One', s2: 'Strategy Two',
    chooseWs: 'Pick a worksheet',
    pemWait: 'The money model is getting ready.',
    noPlf: 'The HUD principal limit factor table is being verified, so this reverse mortgage projection is not showing figures yet.',
    noPlf2: 'Everything else in this presentation is ready. The table comes from HUD and goes into the app once it has been copied exactly.',
    wdStop: 'Planned withdrawals run out in month',
    pMortgage: 'Mortgage Assumptions', pCash: 'Annual Cash Flow',
    lBegin: 'Beginning Balance:', lPayment: 'Monthly Payment:', lRate: 'Financing Rate:', lMonths: 'Months Remaining:',
    lOptPay: 'Optional Payment:', lPL: 'Initial Principal Limit:',
    cfPay: 'Mortgage payments:', cfSave: 'Savings contribution:', cfWd: 'Monthly withdrawals:',
    /* worksheet titles and column headers */
    'ws.s1': 'Strategy One, year by year', 'ws.s2': 'Strategy Two, year by year',
    'ws.both': 'Strategy One compared with Strategy Two',
    'ws.rev': 'HECM, year by year', 'ws.fwd': 'Forward mortgage, year by year',
    'ws.revfwd': 'HECM compared with a forward mortgage',
    'c.s1': 'Strategy One', 'c.s2': 'Strategy Two', 'c.both': 'Both together',
    'c.rev': 'HECM', 'c.fwd': 'Forward mortgage', 'c.revfwd': 'Both together',
    'w.age': 'Age', 'w.year': 'Year', 'w.savContrib': 'Savings Contribution', 'w.savInt': 'Savings Interest',
    'w.savBal': 'Savings Balance', 'w.loanPmt': 'Loan Payments', 'w.loanInt': 'Loan Interest',
    'w.loanIntC': 'Loan Interest to Date', 'w.loanIM': 'Loan Interest + MIP', 'w.loanIMC': 'Loan Interest + MIP to Date',
    'w.loanBal': 'Loan Balance', 'w.loc': 'Line of Credit', 'w.prop': 'Property Value', 'w.equity': 'Equity',
    'w.liq': 'Liquidity', 'w.wdC': 'Withdrawals to Date', 'w.wdDiff': 'Withdrawal Difference',
    'w.liqDiff': 'Liquidity Difference',
    'g.s1': 'Strategy One', 'g.s2': 'Strategy Two', 'g.rev': 'HECM', 'g.fwd': 'Forward',
    'a.start': 'Projection starts at age', 'a.wd': 'Planned monthly withdrawal'
  };
  EFA.screen(HS, {
    title: 'Shared wording: mortgage comparison screens', copy: HCOPY,
    render(ctx) { ctx.el.innerHTML = `<div class="ha-sheet">${Object.keys(HCOPY).map((k) => ctx.t(k, { tag: 'p' })).join('')}</div>`; }
  });
  const hc = (key, o) => EFA.cp(HS, key, o);
  const ht = (key) => (EFA.wording ? EFA.wording.get(HS, key, HCOPY[key]) : HCOPY[key]);

  /* small line icons (drawn here, no icon font) */
  const ICO = {
    first: '<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 3.5 6 8l4.5 4.5M4 3.5v9"/></svg>',
    prev: '<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>',
    next: '<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5 10.5 8 6 12.5"/></svg>',
    last: '<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 3.5 10 8l-4.5 4.5M12 3.5v9"/></svg>',
    sheet: '<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2.5h5.5L12 5v8.5H4zM9.5 2.5V5H12M5.8 7.6h4.4M5.8 10.1h3"/></svg>',
    graph: '<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 13V3M2.5 13h11M4.5 10.5c3 0 5.5-1.5 8-6"/></svg>'
  };

  /* =====================================================================================
     3. ART (drawn here, flat duotone, no outside assets)
     ===================================================================================== */
  /** a tall three-dimensional question mark in gold, used by c2m2, c2m3 and rm3 */
  function questionMark(o) {
    o = o || {};
    const w = o.w || 300, h = o.h || 540;
    return `<svg viewBox="0 0 300 540" aria-hidden="true">
      <defs>
        <linearGradient id="haQg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset="1" stop-color="${P.gold}"/></linearGradient>
        <linearGradient id="haQs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldDeep}"/><stop offset="1" stop-color="${P.navy3}"/></linearGradient>
      </defs>
      <ellipse cx="152" cy="512" rx="98" ry="20" fill="${P.shadow}"/>
      <g transform="translate(14 14)">
        <path d="M44 128c0-62 44-104 106-104s102 40 102 94c0 44-24 68-60 92-26 17-34 28-34 52v14h-66v-22c0-40 14-60 50-84 26-18 34-28 34-48 0-22-16-36-40-36-26 0-42 16-44 42z" fill="url(#haQs)"/>
        <circle cx="152" cy="438" r="40" fill="url(#haQs)"/>
      </g>
      <path d="M44 128c0-62 44-104 106-104s102 40 102 94c0 44-24 68-60 92-26 17-34 28-34 52v14h-66v-22c0-40 14-60 50-84 26-18 34-28 34-48 0-22-16-36-40-36-26 0-42 16-44 42z" fill="url(#haQg)"/>
      <circle cx="152" cy="438" r="40" fill="url(#haQg)"/>
      <path d="M78 110c2-44 34-72 76-72" fill="none" stroke="${P.goldPale}" stroke-width="9" stroke-linecap="round" opacity=".85"/>
    </svg>`;
  }
  /** an open cardboard box with a label; small = the box of what you know, large = everything there is */
  function openBox(o) {
    o = o || {};
    const tone = o.tone || 'navy';
    const body = tone === 'gold' ? P.goldLt : P.navy3, side = tone === 'gold' ? P.gold : P.navy2, flap = tone === 'gold' ? P.goldPale : P.navy4;
    return `<svg viewBox="0 0 320 320" aria-hidden="true">
      <ellipse cx="160" cy="300" rx="124" ry="18" fill="${P.shadow}"/>
      <path d="M46 112h228v158a10 10 0 0 1-10 10H56a10 10 0 0 1-10-10z" fill="${body}"/>
      <path d="M160 112h114v158a10 10 0 0 1-10 10h-104z" fill="${side}"/>
      <path d="M46 112 24 62l96 22z" fill="${flap}"/>
      <path d="M274 112 296 62l-96 22z" fill="${flap}"/>
      <path d="M120 84h80v28h-80z" fill="${flap}"/>
      <path d="M46 112h228" fill="none" stroke="${P.navy}" stroke-width="3" opacity=".25"/>
    </svg>`;
  }
  /** the purple-free brand marker that travels round rm4's circle */
  const marker = () => `<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="20" fill="${P.paper}" stroke="${P.gold}" stroke-width="3"/><path d="M14 14l16 16M30 14 14 30" fill="none" stroke="${P.goldDeep}" stroke-width="5" stroke-linecap="round"/></svg>`;
  /** a quiet decorative home vignette for rm5 (drawn here, reusing the shared house illustration) */
  function homePanel() {
    return `<svg class="bg" viewBox="0 0 380 360" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="haHp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef2f8"/><stop offset="1" stop-color="${P.mist2}"/></linearGradient></defs>
      <rect width="380" height="360" fill="url(#haHp)"/>
      <circle cx="306" cy="64" r="34" fill="${P.goldPale}"/>
      <path d="M0 240c58-20 96-8 142 6s88 20 136 6 102-20 102-20v128H0z" fill="${P.navy4}" opacity=".2"/>
      <path d="M0 296h380v64H0z" fill="${P.navy}" opacity=".1"/>
      <g stroke="${P.navy3}" stroke-width="7" stroke-linecap="round" opacity=".55"><path d="M46 300v-44"/></g>
      <circle cx="46" cy="238" r="30" fill="${P.navy3}" opacity=".45"/>
    </svg><div class="hs">${A.ill.house({})}</div>`;
  }

  /* =====================================================================================
     4. THE COMPARISON ENGINE (_fwcompare-engine.md). Pure math, no DOM.
        Units: rates and percents as percent numbers (3 = 3%), money in dollars, ages in years.
        Shares the session (tank scale, Scale slider, start age) with EFA.engines.hecm when that
        module is loaded, so the two services keep one scale, exactly as the original did.
     ===================================================================================== */
  const LOCAL_S = { startAge: 42, endAge: 99, refScale: 30000, scale: 100, maxYear: 57 };
  const S = () => { const H = EFA.engines.hecm; return (H && H.session) || LOCAL_S; };

  /* --- 4.2 helpers --- */
  const Z = (x) => (Math.abs(x) < 0.0049 ? 0 : x);
  const mo = (p) => (+p || 0) / 100 / 12;
  function PMT(i, n, pv) {
    if (!(n > 0)) return 0;
    if (!i) return pv / n;
    const f = Math.pow(1 + i, n);
    return (pv * i * f) / (f - 1);
  }
  const fill = (x) => { const s = S(); return s.refScale > 0 ? 100 * Math.min((+x || 0) / (s.refScale * s.scale), 1) : 0; };
  const regOf = (dep, pay) => (dep > 0 ? (pay > 0 ? 90 : 80) : 100);
  const remOf = (dep, pay) => (pay > 0 ? (dep > 0 ? 90 : 80) : 100);

  /* --- 4.8 regulatory figures (never typed in here) --- */
  const dHecm = () => (EFA.data && EFA.data.hecm) || null;
  const hecmLimit = () => { const d = dHecm(); return d && isFinite(d.maxClaimAmount) ? d.maxClaimAmount : null; };
  const mipDefault = () => { const d = dHecm(); return d && isFinite(d.mipAnnual) ? +(d.mipAnnual * 100).toFixed(3) : null; };
  /**
   * HUD principal limit factor. Rows = youngest borrower age 18..99, columns = expected rate from
   * 3.000% upward in 0.125% steps. Reads whatever shape EFA.data.hecm.plf arrives in; returns null
   * while the table is missing, and every screen that needs it then shows a neutral state.
   */
  function plf(age, ratePct) {
    const d = dHecm(); const t = d && d.plf;
    if (!t) return null;
    const startAge = t.startAge != null ? t.startAge : 18;
    const startRate = t.startRate != null ? t.startRate : (d.expectedRateFloor != null ? d.expectedRateFloor * 100 : 3);
    const step = t.step != null ? t.step : 0.125;
    const grid = Array.isArray(t) ? t : (t.rows || t.table || t.factors || null);
    let row = null;
    if (Array.isArray(grid)) row = grid[Math.min(Math.max(0, Math.round(age) - startAge), grid.length - 1)];
    else if (grid && typeof grid === 'object') {
      const a = Math.min(99, Math.max(startAge, Math.round(age)));
      row = grid[a] || grid[String(a)];
    }
    if (row == null) return null;
    if (typeof row === 'number') return row;
    if (!Array.isArray(row)) return null;
    const col = Math.min(row.length - 1, Math.max(0, Math.round((ratePct - startRate) / step)));
    const v = row[col];
    return isFinite(v) ? (v > 1 ? v / 100 : v) : null;
  }

  /* --- 4.1 session state: the five strategy records --- */
  const cd = () => lib('caseData') || { get: (k, d) => d, set() {} };
  const cget = (key, def) => { const v = cd().get(key, undefined); return v == null || (typeof v === 'number' && !isFinite(v)) ? def : v; };
  const pctOf = (key, def) => { const v = cget(key, null); return v == null ? def : +(v * 100).toFixed(4); };

  function s1s2Defaults() {
    const appr = pctOf('house_appreciation_rate', 3);
    const savBal = cget('fw_current_savings', 0);
    const savRate = pctOf('case_file_ror_distribution', 5);
    const age = Math.round(cget('case_file_current_age', 42));
    const one = (n, term) => ({
      which: n, taxRate: pctOf('fw_c2m_m' + n + '_tax_rate', 20),
      prop: cget('fw_c2m_m' + n + '_property_value', 500000),
      appr: pctOf('fw_c2m_m' + n + '_appreciation_rate', appr),
      loan: cget('fw_c2m_m' + n + '_mortgage_balance', 400000),
      rate: pctOf('fw_c2m_m' + n + '_mortgage_rate', 3),
      deductible: !!cget('fw_c2m_m' + n + '_int_is_deductible', false),
      termYears: Math.max(0, Math.round(cget('fw_c2m_m' + n + '_term', term))),
      savBal: cget('fw_c2m_m' + n + '_savings_balance', savBal),
      savRate: pctOf('fw_c2m_m' + n + '_savings_rate', savRate),
      savTaxable: !!cget('fw_c2m_m' + n + '_savings_is_taxable', false),
      payment: 0
    });
    return { S1: one(1, 15), S2: one(2, 30), age: age };
  }
  function revFwdDefaults(demo) {
    const mip = mipDefault();
    const appr = pctOf('house_appreciation_rate', 3);
    const cAge = Math.round(cget('case_file_current_age', 42));
    const base = demo
      ? { prop: 400000, appr: 3, taxRate: 20, savBal: 400000, savRate: 5, savTaxable: false }
      : { prop: cget('house_current_market_value', 0) || 0, appr: appr, taxRate: 20,
          savBal: cget('fw_current_savings', 0), savRate: pctOf('case_file_ror_distribution', 5), savTaxable: false };
    const REV = Object.assign({}, base, {
      loan: demo ? 200000 : 0, closing: demo ? 20000 : 0, cashDue: demo ? 200000 : 0,
      rate: demo ? 3.5 : 0, age: demo ? 68 : cAge, optPayment: 0,
      mip: mip == null ? 0 : mip, jumbo: false, jumboMCA: 0, jumboPL: 0,
      altGrowth: false, altRate: 0, principalLimit: 0
    });
    const FWD = Object.assign({}, base, {
      loan: demo ? 300000 : 0, closing: demo ? 5000 : 0, cashDue: demo ? 100000 : 0,
      rate: demo ? 3 : 0, termYears: 30, payment: 0, payoffMonth: 999
    });
    /* saved values for this client win over the defaults above */
    const K = { prop: 'property_value', appr: 'appreciation_rate', loan: 'mortgage_balance', closing: 'financed_closing_costs',
      cashDue: 'cash_due_at_closing', rate: 'mortgage_rate', taxRate: 'tax_rate', savBal: 'savings_balance', savRate: 'savings_rate' };
    const load = (o, pre) => {
      Object.keys(K).forEach((f) => {
        if (o[f] === undefined) return;
        const key = 'fw_c2m_' + pre + '_' + K[f];
        const isPct = f === 'appr' || f === 'rate' || f === 'taxRate' || f === 'savRate';
        const v = isPct ? pctOf(key, null) : cget(key, null);
        if (v != null) o[f] = v;
      });
      const tx = cget('fw_c2m_' + pre + '_savings_is_taxable', null);
      if (tx != null) o.savTaxable = !!tx;
    };
    load(REV, 'rev'); load(FWD, 'fwd');
    const rAge = cget('fw_c2m_rev_age', null); if (rAge != null) REV.age = Math.round(rAge);
    const op = cget('fw_c2m_rev_opt_payment', null); if (op != null) REV.optPayment = op;
    const tm = cget('fw_c2m_fwd_term', null); if (tm != null) FWD.termYears = Math.max(0, Math.round(tm));
    return { REV: REV, FWD: FWD };
  }

  /* the live session records */
  const E = { S1: null, S2: null, REV: null, FWD: null, wdMonthly: 0, runs: {} };
  function loadC2M() {
    const d = s1s2Defaults();
    E.S1 = d.S1; E.S2 = d.S2;
    E.wdMonthly = cget('fw_monthly_withdrawal', 0);
    payments();
    S().startAge = d.age; S().endAge = 99;
    return d.age;
  }
  function loadRevFwd(demo) {
    const d = revFwdDefaults(demo);
    E.REV = d.REV; E.FWD = d.FWD;
    E.wdMonthly = demo ? 0 : cget('fw_monthly_withdrawal', 0);
    payments();
    S().startAge = d.REV.age; S().endAge = 99;
    return d.REV.age;
  }
  /* --- 4.3 payments --- */
  function payments() {
    if (E.S1) E.S1.payment = PMT(E.S1.rate / 1200, 12 * E.S1.termYears, E.S1.loan);
    if (E.S2) E.S2.payment = PMT(E.S2.rate / 1200, 12 * E.S2.termYears, E.S2.loan);
    if (E.FWD) E.FWD.payment = PMT(E.FWD.rate / 1200, 12 * E.FWD.termYears, E.FWD.loan + E.FWD.closing);
  }

  /** refScale update after every run (section 4.2) */
  function bumpScale(rows) {
    let prop = 0, debt = 0, sav = 0;
    for (let i = 1; i < rows.length; i++) {
      prop = Math.max(prop, rows[i].PropertyValue);
      debt = Math.max(debt, rows[i]._debt);
      sav = Math.max(sav, rows[i].SavingBalance);
    }
    const s = S();
    s.refScale = Math.max(s.refScale, Math.round(0.01 * prop), Math.round(0.01 * debt), Math.round(0.01 * sav));
  }
  const horizon = () => Math.max(0, Math.round(S().endAge - S().startAge));

  /** 4.5 one forward strategy with a side fund */
  function runC2M(which) {
    const Sx = which === 2 ? E.S2 : E.S1, startAge = S().startAge;
    const cmp = Math.max(E.S1.payment, E.S2.payment);
    const depEnd = 12 * Math.max(E.S1.termYears, E.S2.termYears);
    const N = horizon();
    const rows = [{ Age: startAge, PropertyValue: Sx.prop, LoanBalance: Sx.loan, Equity: Sx.prop - Sx.loan,
      Liquidity: Sx.savBal, SavingBalance: Sx.savBal, LOC: 0, LoanInterest: 0, LoanInterestC: 0,
      LoanPaymentsA: 0, LoanPaymentsC: 0, SavingContribution: 0, SavingContributionC: 0, SavingInterest: 0,
      WithdrawalA: 0, WithdrawalC: 0, LSRegulatorValue: 100, LSRemainingValue: 100, _debt: Sx.loan }];
    let bal = Sx.loan, sav = Sx.savBal, prop = Sx.prop, status = null;
    let intA = 0, intC = 0, payA = 0, payC = 0, depA = 0, depC = 0, sintA = 0, wdA = 0, wdC = 0;
    for (let m = 1; m <= 12 * N; m++) {
      const int = bal * mo(Sx.rate); intA += int; intC += int;
      const pay = Math.min(bal + int, Sx.payment); payA += pay; bal = Z(bal + int - pay);
      const w = E.wdMonthly;
      if (w > sav) { wdA += sav; wdC += sav; sav = 0; if (E.wdMonthly > 0 && !status) status = { month: m }; }
      else { wdA += w; wdC += w; sav -= w; }
      const sint = sav * mo(Sx.savRate); sintA += sint;
      const dep = m > depEnd ? 0 : (cmp - pay > 1 ? cmp - pay : 0); depA += dep;
      sav = Z(sav + sint + dep);
      if (m % 12 === 0) {
        if (Sx.deductible) sav += intA * Sx.taxRate / 100;
        if (Sx.savTaxable) sav -= sintA * Sx.taxRate / 100;
        prop *= 1 + Sx.appr / 100;
        payC += payA; depC += depA;
        const dz = Z(depA), pz = Z(payA);
        rows.push({ Age: startAge + m / 12, PropertyValue: prop, LoanBalance: bal, Equity: prop - bal,
          Liquidity: sav, SavingBalance: sav, LOC: 0, LoanInterest: intA, LoanInterestC: intC,
          LoanPaymentsA: pz, LoanPaymentsC: Z(payC), SavingContribution: dz, SavingContributionC: Z(depC),
          SavingInterest: sintA, WithdrawalA: Z(wdA), WithdrawalC: Z(wdC),
          LSRegulatorValue: regOf(dz, pz), LSRemainingValue: remOf(dz, pz), _debt: bal });
        intA = payA = depA = sintA = wdA = 0;
      }
    }
    bumpScale(rows);
    return { kind: 'C2M' + which, rows: rows, status: status };
  }

  /** 4.6 the forward loan of the reverse-versus-forward comparison */
  function runFWD() {
    const f = E.FWD, startAge = S().startAge, N = horizon();
    payments();
    const cmp = Math.max(f.payment, E.REV ? E.REV.optPayment : 0);
    let bal = f.loan + f.closing, sav = Math.max(0, f.savBal - f.cashDue), prop = f.prop;
    f.payoffMonth = 999;
    const rows = [{ Age: startAge, PropertyValue: prop, LoanBalance: bal, Equity: prop - bal,
      Liquidity: f.savBal - f.cashDue, SavingBalance: sav, LOC: 0, LoanInterest: 0, LoanInterestC: 0,
      LoanPaymentsA: 0, LoanPaymentsC: 0, SavingContribution: 0, SavingContributionC: 0, SavingInterest: 0,
      WithdrawalA: 0, WithdrawalC: 0, LSRegulatorValue: 100, LSRemainingValue: 100, _debt: bal }];
    let status = null, intA = 0, intC = 0, payA = 0, payC = 0, depA = 0, depC = 0, sintA = 0, wdA = 0, wdC = 0;
    for (let m = 1; m <= 12 * N; m++) {
      const int = bal * mo(f.rate); intA += int; intC += int;
      const pay = Math.min(bal + int, f.payment); payA += pay; bal = Z(bal + int - pay);
      if (bal === 0 && f.payoffMonth === 999) f.payoffMonth = m;
      const w = E.wdMonthly;
      if (w > sav) { wdA += sav; wdC += sav; sav = 0; if (E.wdMonthly > 0 && !status) status = { month: m }; }
      else { wdA += w; wdC += w; sav -= w; }
      const sint = sav * mo(f.savRate); sintA += sint;
      const dep = m > f.payoffMonth ? 0 : (cmp - pay > 1 ? cmp - pay : 0); depA += dep;
      sav = Z(sav + sint + dep);
      if (m % 12 === 0) {
        if (f.savTaxable) sav -= sintA * f.taxRate / 100;
        prop *= 1 + f.appr / 100;
        payC += payA; depC += depA;
        const dz = Z(depA), pz = Z(payA);
        rows.push({ Age: startAge + m / 12, PropertyValue: prop, LoanBalance: bal, Equity: prop - bal,
          Liquidity: sav, SavingBalance: sav, LOC: 0, LoanInterest: intA, LoanInterestC: intC,
          LoanPaymentsA: pz, LoanPaymentsC: Z(payC), SavingContribution: dz, SavingContributionC: Z(depC),
          SavingInterest: sintA, WithdrawalA: Z(wdA), WithdrawalC: Z(wdC),
          LSRegulatorValue: regOf(dz, pz), LSRemainingValue: remOf(dz, pz), _debt: bal });
        intA = payA = depA = sintA = wdA = 0;
      }
    }
    bumpScale(rows);
    return { kind: 'FWD', rows: rows, status: status };
  }

  /** 4.7 the HECM. Always run FWD first in the same pass (it needs payoffMonth). Null without the PLF table. */
  function runREV() {
    const r = E.REV, f = E.FWD, startAge = S().startAge, N = horizon();
    const LIMIT = hecmLimit();
    const factor = r.jumbo ? 1 : plf(r.age, r.rate);
    if (!r.jumbo && (factor == null || LIMIT == null)) return null;
    payments();
    const cmp = Math.max(f.payment, r.optPayment);
    const MCA = r.jumbo ? r.jumboMCA : Math.min(r.prop, LIMIT);
    const bal0 = r.loan + r.closing;
    const gRate = r.rate + r.mip, aRate = r.altRate + r.mip;
    const PL = r.jumbo ? r.jumboPL : MCA * factor;
    r.principalLimit = PL;
    const loc0 = PL - bal0;
    const sav0 = Math.max(0, r.savBal - r.cashDue);
    const rows = [{ Age: startAge, PropertyValue: r.prop, LoanBalance: bal0, Equity: r.prop - bal0,
      LOC: loc0, SavingBalance: sav0, Liquidity: r.savBal - r.cashDue + Math.max(0, loc0),
      LoanInterest: 0, LoanInterestC: 0, LoanPaymentsA: 0, LoanPaymentsC: 0, SavingContribution: 0,
      SavingContributionC: 0, SavingInterest: 0, WithdrawalA: 0, WithdrawalC: 0,
      LSRegulatorValue: 100, LSRemainingValue: 100, _debt: Math.max(bal0, PL) }];
    let bal = bal0, limit = PL, sav = sav0, prop = r.prop, status = null;
    let intA = 0, mipA = 0, imC = 0, payA = 0, payC = 0, depA = 0, depC = 0, sintA = 0, wdA = 0, wdC = 0;
    for (let m = 1; m <= 12 * N; m++) {
      limit = r.altGrowth
        ? bal * (1 + mo(gRate)) + Math.max(0, limit - bal) * (1 + mo(aRate))
        : limit * (1 + mo(gRate));
      const int = bal * mo(r.rate), mp = bal * mo(r.mip);
      intA += int; mipA += mp; imC += int + mp;
      const pay = Math.min(bal + int + mp, r.optPayment); payA += pay;
      bal = Z(bal + int + mp - pay);
      let w = E.wdMonthly;
      const avail = Math.max(0, limit - bal);
      if (w > avail) { bal += avail; wdA += avail; wdC += avail; w -= avail; }
      else { bal += w; wdA += w; wdC += w; w = 0; }
      if (w > sav) { wdA += sav; wdC += sav; sav = 0; if (E.wdMonthly > 0 && !status) status = { month: m }; }
      else if (w > 0) { wdA += w; wdC += w; sav -= w; }
      const sint = sav * mo(r.savRate); sintA += sint;
      const dep = m > f.payoffMonth ? 0 : (cmp - pay > 1 ? cmp - pay : 0); depA += dep;
      sav = Z(sav + sint + dep);
      if (m % 12 === 0) {
        if (r.savTaxable) sav -= sintA * r.taxRate / 100;
        prop *= 1 + r.appr / 100;
        payC += payA; depC += depA;
        const dz = Z(depA), pz = Z(payA);
        rows.push({ Age: startAge + m / 12, PropertyValue: prop, LoanBalance: bal, Equity: prop - bal,
          LOC: limit - bal, Liquidity: limit - bal + sav, SavingBalance: sav,
          LoanInterest: intA + mipA, LoanInterestC: imC, LoanPaymentsA: pz, LoanPaymentsC: Z(payC),
          SavingContribution: dz, SavingContributionC: Z(depC), SavingInterest: sintA,
          WithdrawalA: Z(wdA), WithdrawalC: Z(wdC),
          LSRegulatorValue: regOf(dz, pz), LSRemainingValue: remOf(dz, pz), _debt: Math.max(bal, limit) });
        intA = mipA = payA = depA = sintA = wdA = 0;
      }
    }
    bumpScale(rows);
    return { kind: 'REV', rows: rows, status: status };
  }

  const rowAt = (run, k) => run.rows[Math.min(Math.max(0, k), run.rows.length - 1)];

  EFA.engines.fwcompare = {
    version: 1, state: E, session: S, helpers: { Z, mo, PMT, fill, plf, hecmLimit, mipDefault },
    loadC2M: loadC2M, loadRevFwd: loadRevFwd, payments: payments,
    run: { C2M: runC2M, FWD: runFWD, REV: runREV }, rowAt: rowAt
  };

  /* =====================================================================================
     5. THE CALCULATOR FRAME (engine section 9): cropped money model, control strip, panels
     ===================================================================================== */
  const EM = 1600 / 67;                                                                  /* stage px per model em */
  const VP1 = { left: 0, top: 72, w: 1088, h: 828, x: -20.2, y: -2.5 };
  const VP2 = { top: 160, w: 784, h: 676, x: -26.4, y: -5, scale: 0.8, L: 8, R: 808 };
  const PEM_FIXED = { labels: false, scenarioPicker: false, links: false, rip: false, investments: true,
    lifestyleStrip: false, futureFill: false, showBorrowed: true, borrowSource: false, showHouse: true,
    collateral: 'house', debtService: false, sliders: false, chevrons: false, tankLinks: false };

  function waitBox(style) {
    return `<div class="ha-wait" style="${style}"><div><div class="ring"></div>${hc('pemWait', { tag: 'p' })}</div></div>`;
  }
  function mountPem(ctx, host, scale, loc) {
    if (!host) return null;
    const em = EM * (scale || 1);
    host.style.width = (67 * em) + 'px'; host.style.height = (36.5 * em) + 'px';
    if (!has('pem', 'mount')) { host.parentNode.insertAdjacentHTML('beforeend', waitBox('inset:60px')); return null; }
    try { return lib('pem').mount(ctx, host, Object.assign({}, PEM_FIXED, { em: em, pad: [0, 0, 0, 0], align: 'top', loc: !!loc })); }
    catch (e) { console.error(e); host.parentNode.insertAdjacentHTML('beforeend', waitBox('inset:60px')); return null; }
  }
  /** 4.10 feed the model from row k. o: {rev: true on the HECM side} */
  function feed(row, k, o) {
    const f = {
      safeBalance: row.SavingBalance, safe: fill(row.SavingBalance),
      contribution: Math.round(row.SavingContribution),
      bfBalance: row.LoanBalance, borrow: fill(row.LoanBalance),
      houseBalance: row.PropertyValue, house: fill(row.PropertyValue), houseEquity: row.Equity,
      liquidity: row.Liquidity,
      regulator: (E.wdMonthly > 0 && k > 0 && row.WithdrawalA === 0) ? 0 : row.LSRegulatorValue,
      remaining: row.LSRemainingValue,
      creditBalance: (o && o.rev) ? Math.max(0.01, row.LOC) : 0,
      loc: !!(o && o.rev)
    };
    f.creditLine = (o && o.rev) ? fill(row.LOC + row.LoanBalance) : 0;
    ['safeBalance', 'bfBalance', 'houseBalance', 'houseEquity', 'liquidity', 'creditBalance'].forEach((key) => {
      if (Math.abs(f[key]) >= 1) f[key] = Math.round(f[key]);
    });
    return f;
  }
  function setPem(pem, f, ms) { if (!pem) return; try { pem.set(f, { ms: ms == null ? 450 : ms }); } catch (e) { console.error(e); } }
  function partRect(pem, part) { try { const r = pem && pem.rect ? pem.rect(part) : null; return r && isFinite(r.x) && r.w > 0 ? r : null; } catch (e) { return null; } }
  function placeStatus(el, pem, fb) {
    if (!el) return;
    const r = partRect(pem, 'safe');
    el.style.left = (r ? r.x + r.w / 2 : fb[0]) + 'px';
    el.style.top = (r ? Math.min(r.y + r.h * 0.58, 752) : fb[1]) + 'px';
  }
  function setStatus(ctx, el, st) {
    if (!el) return;
    if (st) { el.innerHTML = `${hc('wdStop')} ${num(st.month)}`; if (EFA.edit && EFA.edit.on) EFA.edit.arm(el); else EFA.numify(el); }
    ctx.show(el, !!st);
  }

  /* --- the control strip (Age, Step, Scale) --- */
  function stripHTML(row) {
    return `<div class="ha-card ha-strip${row ? ' row' : ''}">
      <div class="ha-agerow">${hc('age', { cls: 'ha-cap1' })}
        <button type="button" class="ha-ib" data-age="first" aria-label="First year">${ICO.first}</button>
        <button type="button" class="ha-ib" data-age="prev" aria-label="Back one year">${ICO.prev}</button>
        <input class="ha-agein" data-agein="1" inputmode="numeric" autocomplete="off" maxlength="2" value="">
        <button type="button" class="ha-ib" data-age="next" aria-label="Forward one year">${ICO.next}</button>
        <button type="button" class="ha-ib" data-age="last" aria-label="Last year">${ICO.last}</button>
      </div>
      <div class="ha-strow">
        <label class="ha-chk"><input type="checkbox" data-autostep="1">${hc('step')}</label>
        <label class="ha-scale">${hc('scale')}<input type="range" min="1" max="200" step="1" value="${S().scale}" data-scale="1" aria-label="Tank scale"></label>
      </div>
    </div>`;
  }
  /** st = {k}; paint(k, ms) redraws. Age is clamped to [startAge, 99]; the jump buttons move +/-100. */
  function wireStrip(ctx, st, paint) {
    const inp = ctx.$('[data-agein]');
    const N = () => horizon();
    const show = () => { if (inp && document.activeElement !== inp) inp.value = String(S().startAge + st.k); };
    st.set = (k, ms) => { st.k = Math.max(0, Math.min(N(), Math.round(k))); show(); paint(st.k, ms == null ? 450 : ms); };
    ctx.on(ctx.$$('[data-age]'), 'click', (e, b) => {
      const a = b.dataset.age;
      st.set(a === 'first' ? st.k - 100 : a === 'last' ? st.k + 100 : st.k + (a === 'next' ? 1 : -1));
    });
    if (inp) {
      inp.addEventListener('focus', () => inp.select());
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
      inp.addEventListener('blur', () => { const v = parseInt(String(inp.value).replace(/[^0-9]/g, ''), 10); if (isFinite(v)) st.set(v - S().startAge); else show(); });
    }
    const chk = ctx.$('[data-autostep]');
    const tick = () => {
      if (!chk || !chk.checked) return;
      if (st.k >= N()) { chk.checked = false; return; }
      st.set(st.k + 1, 420);
      st.timer = ctx.timeout(tick, 500);
    };
    if (chk) chk.addEventListener('change', () => {
      if (chk.checked) { if (st.k >= N()) st.set(0, 0); st.timer = ctx.timeout(tick, 500); }
      else if (st.timer) { clearTimeout(st.timer); st.timer = null; }
    });
    const sc = ctx.$('[data-scale]');
    if (sc) sc.addEventListener('input', () => { S().scale = Math.max(1, Math.min(200, +sc.value || 100)); paint(st.k, 0); });
    show();
  }

  /* --- panels --- */
  const rowHTML = (label, value) => `<div class="ha-r"><span class="ha-rl">${label}</span><span class="ha-rv">${value}</span></div>`;
  const panelHTML = (head, body) => `<div class="ha-card ha-panelc">${head ? `<div class="ha-ph">${head}</div>` : ''}${body}</div>`;
  /** 4.11 the Annual Cash Flow panel: each row only when its value is above zero */
  function cashFlowHTML(row) {
    const rows = [];
    if (row.LoanPaymentsA > 0) rows.push(rowHTML(hc('cfPay'), num(money(row.LoanPaymentsA, 2))));
    if (row.SavingContribution > 0) rows.push(rowHTML(hc('cfSave'), num(money(row.SavingContribution, 2))));
    if (row.WithdrawalA > 0) rows.push(rowHTML(hc('cfWd'), num(money(row.WithdrawalA, 2))));
    return rows.length ? panelHTML(hc('pCash'), rows.join('')) : '';
  }

  /* --- links at the bottom left --- */
  function docsLink(ctx, data) {
    if (has('worksheet', 'button')) { try { return lib('worksheet').button(ctx, { data: data, look: 'link' }); } catch (e) { console.error(e); } }
    return `<span class="ha-lk muted">${ICO.sheet}${EFA.cp('_lib_worksheet', 'open')}</span>`;
  }
  const docsChooserHTML = () => `<button type="button" class="ha-lk" data-docs="1">${ICO.sheet}${EFA.cp('_lib_worksheet', 'open')}</button>`;
  function wireDocsChooser(ctx, items) {
    ctx.on(ctx.$('[data-docs]'), 'click', () => {
      const ov = ctx.overlay({ title: `<span>${hc('chooseWs')}</span>`, cls: 'ha-pop',
        html: `<div class="ha-choose">${items.map((it, i) => `<button type="button" class="ha-lk" data-wsi="${i}">${ICO.sheet}${hc(it.key)}</button>`).join('')}</div>` });
      Array.from(ov.querySelectorAll('[data-wsi]')).forEach((b) => b.addEventListener('click', () => {
        if (EFA.edit && EFA.edit.on) return;
        const it = items[+b.dataset.wsi]; ov.close();
        if (has('worksheet', 'open')) { try { lib('worksheet').open(ctx, it.data()); } catch (e) { console.error(e); } }
      }));
    });
  }
  const discLine = (style) => (has('disclosure', 'line') ? lib('disclosure').line('hypothetical', { style: style || 'margin:0' }) : '');

  /** single-scenario frame. o: {head, panels (fn of row), rev, docs} */
  function singleFrame(ctx, o) {
    const st = { k: 0, timer: null };
    ctx.el.innerHTML = `
      <h1 class="ha-head sm">${o.head}</h1>
      <div class="ha-vp" style="left:${VP1.left}px;top:${VP1.top}px;width:${VP1.w}px;height:${VP1.h}px"><div class="ha-pemhost" style="left:${(VP1.x * EM).toFixed(1)}px;top:${(VP1.y * EM).toFixed(1)}px"></div></div>
      <div class="ha-col"><div data-stripw="1">${stripHTML(false)}</div><div data-panels="1"></div></div>
      <div class="ha-st fade is-off" data-st="1"></div>
      <div class="ha-links">${docsLink(ctx, o.docs)}</div>
      <div class="ha-foot">${discLine()}</div>`;
    st.pem = mountPem(ctx, ctx.$('.ha-pemhost'), 1, o.rev);
    placeStatus(ctx.$('[data-st]'), st.pem, [262, 700]);
    return st;
  }
  /** two-scenario frame. o: {head, capL, capR, locL, locR, docs:[{key,data}]} */
  function doubleFrame(ctx, o) {
    const st = { k: 0, timer: null };
    const vp = (side) => `<div class="ha-vp" data-vp="${side}" style="left:${VP2[side]}px;top:${VP2.top}px;width:${VP2.w}px;height:${VP2.h}px"><div class="ha-pemhost" style="left:${(VP2.x * EM * VP2.scale).toFixed(1)}px;top:${(VP2.y * EM * VP2.scale).toFixed(1)}px"></div></div>`;
    ctx.el.innerHTML = `
      <h1 class="ha-head sm">${o.head}</h1>
      <div class="ha-hdr"><div class="ha-cap">${o.capL || ''}</div>${stripHTML(true)}<div class="ha-cap">${o.capR || ''}</div></div>
      ${vp('L')}<div class="ha-divider"></div>${vp('R')}
      <div class="ha-st fade is-off" data-st="L"></div><div class="ha-st fade is-off" data-st="R"></div>
      <div class="ha-links">${docsChooserHTML()}</div>
      <div style="position:absolute;left:470px;width:800px;bottom:12px">${discLine()}</div>`;
    st.pemL = mountPem(ctx, ctx.$('[data-vp="L"] .ha-pemhost'), VP2.scale, o.locL);
    st.pemR = mountPem(ctx, ctx.$('[data-vp="R"] .ha-pemhost'), VP2.scale, o.locR);
    placeStatus(ctx.$('[data-st="L"]'), st.pemL, [206, 648]);
    placeStatus(ctx.$('[data-st="R"]'), st.pemR, [1006, 648]);
    wireDocsChooser(ctx, o.docs);
    return st;
  }
  /** the neutral state for a reverse mortgage projection while the HUD factor table is missing */
  function plfPending(ctx, head) {
    ctx.el.innerHTML = `<h1 class="ha-head sm">${head}</h1>
      <div class="ha-wait" style="left:230px;right:230px;top:230px;bottom:190px"><div><div class="ring"></div>${hc('noPlf', { tag: 'p' })}${hc('noPlf2', { tag: 'p' })}</div></div>`;
  }

  /* =====================================================================================
     6. WORKSHEETS (engine section 12). Money $ 0 decimals, Age and Year whole numbers.
     ===================================================================================== */
  const C = (field, key, type, width) => ({ field: field, header: hc(key), type: type || 'money', width: width });
  const AGE = () => C('Age', 'w.age', 'age', 72);
  const YEAR = () => C('_y', 'w.year', 'year', 72);
  function sheet(titleKey, columns, rows) {
    return {
      heading: hc(titleKey), size: 'full', columns: columns, rows: rows,
      assumptions: [{ label: hc('a.start'), value: F().int(S().startAge) }].concat(
        E.wdMonthly > 0 ? [{ label: hc('a.wd'), value: money(E.wdMonthly, 2) }] : []),
      filter: 'Age', disclosures: ['hypothetical', 'license']
    };
  }
  const withYear = (run) => run.rows.map((r, i) => Object.assign({ _y: i }, r));
  const C2M_COLS = () => [AGE(), C('SavingContribution', 'w.savContrib'), C('SavingInterest', 'w.savInt'),
    C('SavingBalance', 'w.savBal'), C('LoanPaymentsA', 'w.loanPmt'), C('LoanInterest', 'w.loanInt'),
    C('LoanInterestC', 'w.loanIntC'), C('LoanBalance', 'w.loanBal'), C('PropertyValue', 'w.prop'),
    C('Equity', 'w.equity'), C('Liquidity', 'w.liq'), C('WithdrawalC', 'w.wdC'), YEAR()];
  const WS = {
    C2M: (run, which) => sheet(which === 2 ? 'ws.s2' : 'ws.s1', C2M_COLS(), withYear(run)),
    C2M_BOTH: (r1, r2) => {
      const keys = ['SavingContribution', 'SavingInterest', 'SavingBalance', 'LoanPaymentsA', 'LoanInterest',
        'LoanInterestC', 'LoanBalance', 'PropertyValue', 'Equity', 'Liquidity', 'WithdrawalC'];
      const hk = ['w.savContrib', 'w.savInt', 'w.savBal', 'w.loanPmt', 'w.loanInt', 'w.loanIntC', 'w.loanBal',
        'w.prop', 'w.equity', 'w.liq', 'w.wdC'];
      const cols = [AGE()];
      keys.forEach((k, i) => cols.push(Object.assign(C('a' + k, hk[i]), { group: 'm1' })));
      keys.forEach((k, i) => cols.push(Object.assign(C('b' + k, hk[i]), { group: 'm2' })));
      cols.push(C('wdDiff', 'w.wdDiff'), YEAR());
      const rows = r1.rows.map((r, i) => {
        const s = r2.rows[Math.min(i, r2.rows.length - 1)], o = { Age: r.Age, _y: i };
        keys.forEach((k) => { o['a' + k] = r[k]; o['b' + k] = s[k]; });
        o.wdDiff = s.WithdrawalC - r.WithdrawalC;
        return o;
      });
      return Object.assign(sheet('ws.both', cols, rows), {
        groups: [{ group: 'm1', label: hc('g.s1') }, { group: 'm2', label: hc('g.s2') }]
      });
    },
    REV: (run) => sheet('ws.rev', [AGE(), C('SavingContribution', 'w.savContrib'), C('SavingInterest', 'w.savInt'),
      C('SavingBalance', 'w.savBal'), C('LoanPaymentsA', 'w.loanPmt'), C('LoanInterest', 'w.loanIM'),
      C('LoanInterestC', 'w.loanIMC'), C('LoanBalance', 'w.loanBal'), C('LOC', 'w.loc'),
      C('PropertyValue', 'w.prop'), C('Equity', 'w.equity'), C('Liquidity', 'w.liq'),
      C('WithdrawalC', 'w.wdC'), YEAR()], withYear(run)),
    FWD: (run) => sheet('ws.fwd', C2M_COLS(), withYear(run)),
    REV_FWD: (rev, fwd) => {
      const rk = ['SavingContribution', 'SavingBalance', 'LoanPaymentsA', 'LoanBalance', 'LOC', 'PropertyValue', 'Equity', 'Liquidity', 'WithdrawalC'];
      const rh = ['w.savContrib', 'w.savBal', 'w.loanPmt', 'w.loanBal', 'w.loc', 'w.prop', 'w.equity', 'w.liq', 'w.wdC'];
      const fk = ['SavingContribution', 'SavingBalance', 'LoanPaymentsA', 'LoanBalance', 'Equity', 'Liquidity', 'WithdrawalC'];
      const fh = ['w.savContrib', 'w.savBal', 'w.loanPmt', 'w.loanBal', 'w.equity', 'w.liq', 'w.wdC'];
      const cols = [AGE()];
      rk.forEach((k, i) => cols.push(Object.assign(C('a' + k, rh[i]), { group: 'rv' })));
      fk.forEach((k, i) => cols.push(Object.assign(C('b' + k, fh[i]), { group: 'fw' })));
      cols.push(C('liqDiff', 'w.liqDiff'), C('wdDiff', 'w.wdDiff'), YEAR());
      const rows = rev.rows.map((r, i) => {
        const s = fwd.rows[Math.min(i, fwd.rows.length - 1)], o = { Age: r.Age, _y: i };
        rk.forEach((k) => { o['a' + k] = r[k]; });
        fk.forEach((k) => { o['b' + k] = s[k]; });
        o.liqDiff = s.Liquidity - r.Liquidity;
        o.wdDiff = s.WithdrawalC - r.WithdrawalC;
        return o;
      });
      return Object.assign(sheet('ws.revfwd', cols, rows), {
        groups: [{ group: 'rv', label: hc('g.rev') }, { group: 'fw', label: hc('g.fwd') }]
      });
    }
  };

  EFA.css('ha-b', `
  .stage .ha-bl .lib-bul-txt { font: 600 29px/1.32 var(--f-body); color: var(--navy); padding: 20px 28px !important; }
  .stage .ha-bl.sm .lib-bul-txt { font-size: 22px; padding: 13px 20px !important; }
  .stage .ha-bl.pan .lib-bul-txt { background: rgba(227,232,240,.62) !important; border-color: var(--mist-2) !important; box-shadow: none !important; font-size: 24px; padding: 14px 20px !important; }
  .stage .ha-bl .lib-bul-txt .two { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 10px 28px; }
  .stage .ha-bl .lib-bul-txt .two .cs { color: var(--gold-deep); font-weight: 700; text-align: right; }
  .stage .ha-state { position: absolute; padding: 20px 30px; font: 700 29px/1.3 var(--f-body); color: var(--navy); background: var(--gold-pale); border: 1px solid var(--gold); border-radius: 16px; transition: opacity .8s ease; }
  .stage .ha-ask { position: absolute; padding: 26px 32px; font: 700 38px/1.25 var(--f-body); color: var(--navy); background: var(--paper); border: 2px solid var(--gold); border-radius: 18px; box-shadow: 0 16px 38px rgba(13,30,58,.14); transition: opacity .8s ease; }
  `);

  /* =====================================================================================
     7. OPENING SLIDES (fwc2m1, fwcfr1)
     ===================================================================================== */
  function openerScreen(id, title, copy) {
    EFA.screen(id, {
      title: title, copy: copy,
      render(ctx) {
        ctx.el.innerHTML = `
          <h1 class="ha-head">${ctx.t('head')}</h1>
          <div class="ha-pts" style="left:160px;right:160px;top:216px;bottom:96px">
            ${has('bullets', 'list') ? lib('bullets').list(ctx, [ctx.t('p1'), ctx.t('p2'), ctx.t('p3'), ctx.t('p4')],
              { reveal: false, boxed: true, size: 46, gap: 22, cls: 'ha-bl' })
              : [1, 2, 3, 4].map((i) => `<div class="ha-pt"><div class="bx">${ctx.t('p' + i)}</div></div>`).join('')}
          </div>`;
      }
    });
  }
  openerScreen('fwc2m1', 'Why the home financing choice matters', {
    head: 'Weighing Your Home Financing Options',
    p1: 'Once you have chosen the house, how you pay for it is the next big decision you make.',
    p2: 'A good loan plan starts at the other end: the result you want your household to have.',
    p3: 'Setting a 15 year term next to a 30 year term is what makes the choice clear.',
    p4: 'Borrowing and paying cash each reshape your monthly spending room and your retirement plan.',
    _notes: 'The house is the easy part. How it gets paid for is the decision that follows you for thirty years.\n\n- Ask: When you chose this loan the first time, who showed you what the other term would have done to your cash flow?\nPAUSE'
  });
  openerScreen('fwcfr1', 'Why the home financing choice matters (forward or reverse)', {
    head: 'Weighing Your Home Financing Options',
    p1: 'Once you have chosen the house, how you pay for it is the next big decision you make.',
    p2: 'A good loan plan starts at the other end: the result you want your household to have.',
    p3: 'Setting a traditional loan next to a HECM reverse mortgage is what makes the choice clear.',
    p4: 'A traditional loan, a HECM, or paying cash: each one reshapes your monthly spending room and your retirement plan.',
    _notes: 'There are three ways to pay for a home in retirement, and only one of them is usually discussed.\n\n- Ask: Which of the three has anyone ever walked you through side by side?\nPAUSE'
  });

  /* =====================================================================================
     8. RM: the yes or no discovery quiz (rm1 and rm9 share the session answers)
     ===================================================================================== */
  const QUIZ = { a: [null, null, null, null, null, null] };
  const QKEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
  const QUIZ_COPY = {
    head: 'Yes or No?',
    q1: 'Is your house the largest asset you own?',
    q2: 'Do you ever plan to sell your house?',
    q3: 'Could you ever need to draw on the equity in your home?',
    q4: 'Is leaving a paid off house to your family one of your main goals?',
    q5: 'Do you expect someone in your family to live in this house one day?',
    q6: 'Does making a mortgage payment during retirement worry you?',
    yes: 'Y', no: 'N', ask: '?'
  };
  function quizScreen(id, title, notes) {
    EFA.screen(id, {
      title: title, steps: 7,
      copy: Object.assign({}, QUIZ_COPY, { _notes: notes }),
      render(ctx) {
        const mark = (i) => (QUIZ.a[i] === true ? ctx.t('yes') : QUIZ.a[i] === false ? ctx.t('no') : ctx.t('ask'));
        const at = (i) => (QUIZ.a[i] === true ? 'y' : QUIZ.a[i] === false ? 'n' : '');
        ctx.el.innerHTML = `
          <h1 class="ha-head">${ctx.t('head')}</h1>
          <div class="ha-qz" style="top:200px;width:1000px">
            ${QKEYS.map((k, i) => `<div class="ha-qrow">
              <button type="button" class="ha-qb" data-q="${i}" data-a="${at(i)}" aria-label="Answer">${mark(i)}</button>
              <div class="ha-qt fade${ctx.step > i ? '' : ' is-off'}" data-qt="${i}">${ctx.t(k)}</div>
            </div>`).join('')}
          </div>`;
        ctx.on(ctx.$$('[data-q]'), 'click', (e, b) => {
          const i = +b.dataset.q;
          QUIZ.a[i] = QUIZ.a[i] === null ? true : !QUIZ.a[i];
          b.dataset.a = QUIZ.a[i] ? 'y' : 'n';
          b.innerHTML = QUIZ.a[i] ? ctx.t('yes') : ctx.t('no');
          if (EFA.edit && EFA.edit.on) EFA.edit.arm(b);
          if (ctx.step <= i) ctx.goStep(i + 1); else ctx.show(`[data-qt="${i}"]`, true);
        });
        if (QUIZ.a.every((v) => v !== null) && ctx.step < 6) ctx.timeout(() => ctx.goStep(6), 0);
      },
      step(ctx, n) { QKEYS.forEach((k, i) => ctx.show(`[data-qt="${i}"]`, n > i)); }
    });
  }
  quizScreen('rm1', 'Home equity discovery quiz (opening)',
    'Six questions, and the answers are yours, not mine. We will come back to this same page at the end.\n\n- Ask: Before we look at anything, which of these six matters most to you?\nPAUSE');
  quizScreen('rm9', 'Home equity discovery quiz (closing)',
    'Same six questions, now that you have seen how the loan actually works. Change any answer you want to change.\n\n- Ask: Which answer moved, and what moved it?\nPAUSE');

  /* =====================================================================================
     9. rm2: imagine a product with these features
     ===================================================================================== */
  EFA.screen('rm2', {
    title: 'Imagine a product with these features',
    steps: 8,
    copy: {
      head: 'Imagine a product that offered you all of this...',
      p1: 'A credit line secured by the equity in your home, with the amount set by your age, the home value and current rates.',
      p2: 'On an adjustable rate loan, the unused part of that credit line grows over time.',
      p3: 'No monthly payment is required on what you have drawn.',
      p4: 'Nothing is repaid until the home is sold or you leave it permanently.',
      p5: 'Money you draw is a loan advance rather than income, so it is generally income-tax-free under current tax law, subject to applicable requirements.',
      p6: 'Interest accrues only on the part you have actually drawn.',
      state: 'All of it insured by the Federal Housing Administration, a federal agency inside the Department of Housing and Urban Development.',
      ask: 'Would you want a product like that?',
      _notes: 'I am not going to name it yet. I want you to react to the features, not the label.\n\n- Ask: If a product did all of this, would you want to know more about it?\nPAUSE\n\n- The name comes on the next screen.'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <h1 class="ha-head sm" style="left:120px;right:120px;top:36px">${ctx.t('head')}</h1>
        <div style="position:absolute;left:120px;top:142px;width:880px">
          ${lib('bullets') ? lib('bullets').list(ctx, [ctx.t('p1'), ctx.t('p2'), ctx.t('p3'), ctx.t('p4'), ctx.t('p5'), ctx.t('p6')],
            { from: 1, size: 36, gap: 11, boxed: true, cls: 'ha-bl sm' }) : ''}
        </div>
        <div class="ha-state fade is-off" data-state="1" style="left:120px;right:120px;top:710px">${ctx.t('state')}</div>
        <div class="ha-ask fade is-off" data-ask="1" style="left:1040px;top:412px;width:450px">${ctx.t('ask')}</div>
        ${discLine('position:absolute;left:120px;right:120px;bottom:28px;text-align:center')}`;
    },
    step(ctx, n) {
      if (lib('bullets')) lib('bullets').reveal(ctx, n);
      ctx.show('[data-state]', n >= 6);
      ctx.show('[data-ask]', n === 7);
    }
  });

  /* =====================================================================================
     10. rm3: the name reveal, with a switchable product term
     ===================================================================================== */
  EFA.screen('rm3', {
    title: 'Name reveal with a switchable product term',
    copy: {
      lead: 'What have you heard about a...',
      full: 'Home Equity Conversion Mortgage?',
      short: 'Reverse Mortgage?',
      _notes: 'Now the name. Let them talk first, and write down the words they use.\n\n- Ask: What have you heard about these, and who did you hear it from?\nPAUSE\n\n- Click the name to switch between the full name and the common one, whichever lands better.'
    },
    render(ctx) {
      const useShort = !!ctx.mem('rm_use_hecm', false);
      ctx.el.innerHTML = `
        <div class="ha-reveal">
          <p class="st-h2" style="margin:0">${ctx.t('lead')}</p>
          <p class="term" data-term="1">${ctx.t(useShort ? 'short' : 'full')}</p>
        </div>
        <div class="ha-qmc">${questionMark()}</div>`;
      ctx.on(ctx.$('[data-term]'), 'click', () => {
        const v = !ctx.mem('rm_use_hecm', false);
        ctx.remember('rm_use_hecm', v);
        EFA.player.renderScreen({ noFade: true });
      });
    }
  });

  /* =====================================================================================
     11. rm4: the box of what you already know
     ===================================================================================== */
  EFA.screen('rm4', {
    title: 'The box of what you already know',
    steps: 3,
    copy: {
      head: 'Whatever we already know, we treat as the whole truth.',
      small: 'What You Know',
      large: 'Everything There Is To Know',
      _notes: 'Each of us carries a small box of what we already know, and we treat the inside of that box as all there is.\n\n- Ask: What would it be worth to find out the box is bigger than you thought?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <h1 class="ha-head">${ctx.t('head')}</h1>
        <div class="ha-bxw">
          <div class="ha-ring" data-ring="1"><div class="ha-mk" data-mk="1">${marker()}</div></div>
          <div class="ha-sbx">${openBox({ tone: 'navy' })}
            <div class="ha-boxlab sm">${ctx.t('small')}</div></div>
          <div class="ha-lbx" data-lbx="1">${openBox({ tone: 'gold' })}
            <div class="ha-boxlab lg">${ctx.t('large')}</div></div>
        </div>`;
    },
    step(ctx, n) {
      const ring = ctx.$('[data-ring]'), mk = ctx.$('[data-mk]');
      if (ring) ring.style.transform = n >= 1 ? 'rotate(-120deg)' : 'rotate(0deg)';
      if (mk) mk.style.transform = n >= 1 ? 'rotate(120deg)' : 'rotate(0deg)';
      const lb = ctx.$('[data-lbx]'); if (lb) lb.classList.toggle('up', n >= 2);
    }
  });

  /* =====================================================================================
     12. rm8: why set it up sooner rather than later
     ===================================================================================== */
  EFA.screen('rm8', {
    title: 'Why set the credit line up sooner',
    steps: 6,
    copy: {
      head: 'Why Now Rather Than Later?',
      p1: 'If interest rates rise', c1: 'less money is available',
      p2: 'If home values fall', c2: 'less money is available',
      p3: 'If the program rules change', c3: 'who qualifies, and for how much',
      p4: 'Once the credit line is in place, it stays available to you on the loan terms you agreed to.', c4: '',
      p5: 'If your credit standing changes', c5: 'you may not qualify when you need it',
      _notes: 'Everything that decides how much is available can move: rates, home values, program rules, your own credit. A line already in place is not subject to any of that.\n\n- Ask: Would you rather set this up while you have the choice, or while you have the need?\nPAUSE'
    },
    render(ctx) {
      const row = (i) => {
        const cs = ctx.text('c' + i);
        return `<div class="two"><span>${ctx.t('p' + i)}</span>${cs ? `<span class="cs">${ctx.t('c' + i)}</span>` : ''}</div>`;
      };
      ctx.el.innerHTML = `
        <h1 class="ha-head">${ctx.t('head')}</h1>
        <div style="position:absolute;left:230px;width:1140px;top:214px">
          ${lib('bullets') ? lib('bullets').list(ctx, [1, 2, 3, 4, 5].map((i) => ({ html: row(i), at: i })),
            { size: 52, gap: 16, boxed: true, cls: 'ha-bl' }) : ''}
        </div>`;
    },
    step(ctx, n) { if (lib('bullets')) lib('bullets').reveal(ctx, n); }
  });

  /* =====================================================================================
     13. rm5: the myths, answered one at a time, with the HECM comparison grid
     ===================================================================================== */
  EFA.screen('rm5', {
    title: 'Reverse mortgage myths answered one by one',
    steps: 14,
    copy: {
      head: 'The Six Things People Say',
      m1: 'Only people who have run out of options use one of these.',
      m2: 'The bank ends up owning my home.',
      m3: 'The costs are far too high.',
      m4: 'My family would be left with nothing.',
      m5: 'I could be made to leave my own home.',
      m6: 'It works nothing like a normal mortgage.',
      e1: 'It is a planning tool. It can clear an existing mortgage payment, create cash flow that is generally not taxed as income, let Social Security keep growing a few more years, and hold an emergency credit line in reserve. It is insured by the Federal Housing Administration, and retirement income planners now treat it as one of the tools on the table.',
      e2: 'Lenders want to lend money and earn interest on it. They do not want your house. You keep title in your name, and the lender records a lien, exactly as with any other mortgage.',
      e3: 'Setup costs and rates sit broadly in line with other home loans. The FHA insurance premium is an added cost, and what it buys is the non-recourse protection and the credit line. Most of the cost can be rolled into the balance, so little cash is needed at closing, and some lenders offer credits that reduce it further.',
      e4: 'Your family inherits the home the same way they would with any mortgage, often with equity still in it. They can pay the loan off and keep the house, sell it and keep whatever is left, or hand it to the lender. Under the HECM rules their liability is limited to the value of the home.',
      e5: 'The program exists so that older homeowners can stay put. With no monthly payment due, a missed payment cannot start a foreclosure. As long as you keep to the loan terms, you can stay whatever the balance or the home value does.',
      e6: 'It is still a mortgage. It is alike in most ways, with a few differences that matter. Here they are side by side.',
      cmpS: 'Similarities',
      cmpD: 'Differences',
      cmpTail: 'between a HECM and other home loans',
      colA: 'HECM', colB: 'Mortgage or HELOC',
      s1: 'Secured by a note and a deed of trust', s1a: 'Yes', s1b: 'Yes',
      s2: 'You hold title and the lender holds a lien', s2a: 'Yes', s2b: 'Yes',
      s3: 'You insure the home, pay the property tax and keep it in repair', s3a: 'Yes', s3b: 'Yes',
      s4: 'The home must be your main residence', s4a: 'Yes', s4b: 'Yes for a HELOC*',
      d1: 'A monthly payment is required', d1a: 'No', d1b: 'Yes',
      d2: 'Future access to the credit*', d2a: 'Stays available and grows at the loan rate plus mortgage insurance', d2b: 'A HELOC can be reduced or frozen by the lender',
      d3: 'What can start a foreclosure*', d3a: 'Unpaid property taxes or insurance, or leaving the home', d3b: 'Those, and a missed monthly payment',
      d4: 'Your family could owe more than the home is worth', d4a: 'No', d4b: 'Yes',
      d5: 'The loan balance over time', d5a: 'Rises', d5b: 'Falls',
      fn: 'The asterisked lines follow the Consumer Financial Protection Bureau Report to Congress on Reverse Mortgages (2012). A growing credit line exists only on adjustable rate HECMs. Confirm current program rules before you rely on any line here.',
      btn: 'Comparison',
      _notes: 'Six objections. I have heard every one of them, and each has an answer.\n\n- Ask: Which of these six is the one you came in with?\nPAUSE\n\n- The Comparison button opens the side by side grid. Click the header word to flip similarities and differences.'
    },
    render(ctx) {
      const V = ctx._v = ctx._v || { cmp: false, sim: true };
      const rows = (pre, n) => [...Array(n)].map((_, i) => {
        const k = pre + (i + 1);
        return `<tr><td>${ctx.t(k)}</td><td>${ctx.t(k + 'a')}</td><td>${ctx.t(k + 'b')}</td></tr>`;
      }).join('');
      ctx.el.innerHTML = `
        <div data-myths="1">
          <h1 class="ha-head sm">${ctx.t('head')}</h1>
          <div class="ha-my st-card">${[1, 2, 3, 4, 5, 6].map((i) => `<div class="ln" data-m="${i}">${ctx.t('m' + i)}</div>`).join('')}</div>
          <div class="ha-cpl">${homePanel()}</div>
          ${[1, 2, 3, 4, 5, 6].map((i) => `<div class="ha-ex st-card fade is-off" data-e="${i}">${ctx.t('e' + i)}</div>`).join('')}
        </div>
        <div data-cmp="1" hidden>
          <div class="ha-cmp">
            <p class="ch"><b data-flip="1">${ctx.t(V.sim ? 'cmpS' : 'cmpD')}</b> ${ctx.t('cmpTail')}</p>
            <table class="st-table"><colgroup><col style="width:50%"><col style="width:25%"><col style="width:25%"></colgroup>
              <thead><tr><th></th><th style="text-align:center">${ctx.t('colA')}</th><th style="text-align:center">${ctx.t('colB')}</th></tr></thead>
              <tbody data-body="1">${V.sim ? rows('s', 4) : rows('d', 5)}</tbody></table>
          </div>
          <p class="st-disclaimer ha-cfn">${ctx.t('fn')}</p>
        </div>
        <button type="button" class="st-pill fade is-off" data-btn="1" style="position:absolute;right:110px;bottom:84px">${ctx.t('btn')}</button>`;
      const paint = () => {
        ctx.$('[data-myths]').hidden = V.cmp;
        ctx.$('[data-cmp]').hidden = !V.cmp;
      };
      ctx.on(ctx.$('[data-btn]'), 'click', () => { V.cmp = !V.cmp; paint(); });
      ctx.on(ctx.$('[data-flip]'), 'click', () => {
        V.sim = !V.sim;
        ctx.$('[data-flip]').innerHTML = ctx.t(V.sim ? 'cmpS' : 'cmpD');
        ctx.$('[data-body]').innerHTML = V.sim ? rows('s', 4) : rows('d', 5);
        if (EFA.edit && EFA.edit.on) EFA.edit.arm(ctx.el); else EFA.numify(ctx.el);
      });
      paint();
    },
    step(ctx, n) {
      for (let k = 1; k <= 6; k++) {
        const el = ctx.$(`[data-m="${k}"]`);
        if (el) {
          el.style.opacity = n >= 2 * k - 1 ? '' : '0';
          el.classList.toggle('grey', k <= 5 && n >= 2 * k + 1 && n < 13);
        }
        ctx.show(`[data-e="${k}"]`, n === 2 * k);
      }
      ctx.show('[data-btn]', n >= 12);
    }
  });

  /* =====================================================================================
     14. THE LESSON FRAME SCREENS (fwrm1-4, rmf1-4): money model left, points right
     ===================================================================================== */
  /** o: {id, title, steps, copy, points (array of keys), pem (mount config), zoom, expanded, onStep} */
  function lessonScreen(o) {
    EFA.screen(o.id, {
      title: o.title, steps: o.steps, copy: o.copy,
      render(ctx) {
        const pts = o.points.map((k, i) => ({ html: ctx.t(k), at: o.from != null ? o.from + i : i + 1 }));
        ctx.el.innerHTML = `
          <div class="ha-panel" data-panel="1" style="left:900px;right:70px;top:${o.top || 96}px">
            ${ctx.t('head', { tag: 'h2', cls: 'st-h2', attrs: 'style="font-size:40px"' })}
            ${lib('bullets') ? lib('bullets').list(ctx, pts, { size: 32, gap: 14, cls: 'ha-bl pan' }) : ''}
          </div>
          ${o.foot ? `<p class="st-disclaimer ha-note fade is-off" data-foot="1" style="right:70px;bottom:96px;width:470px;text-align:right">${ctx.t('foot')}</p>` : ''}`;
        if (!has('pem', 'mount')) { ctx.el.insertAdjacentHTML('afterbegin', waitBox('left:60px;top:90px;width:780px;height:700px')); return; }
        try {
          ctx.pem = lib('pem').mount(ctx, ctx.el, Object.assign({
            links: false, scenarioPicker: false, labels: false, lifestyleStrip: false, sliders: false,
            chevrons: false, tankLinks: false, borrowSource: false, debtService: false,
            collateral: 'house', showBorrowed: true, showHouse: true, loc: true,
            frame: { zoom: o.zoom || { fit: ['safe', 'borrowed', 'house'], pad: 1.1 }, width: 0.55,
              expanded: !!o.expanded, panel: ['.ha-panel', '.ha-note'],
              expandShows: ['labels', 'lifestyle'], toggle: true }
          }, o.pem || {}));
        } catch (e) { console.error(e); ctx.el.insertAdjacentHTML('afterbegin', waitBox('left:60px;top:90px;width:780px;height:700px')); }
      },
      step(ctx, n, dir) {
        if (lib('bullets')) lib('bullets').reveal(ctx, n);
        if (o.foot) ctx.show('[data-foot]', n >= o.footFrom);
        const p = ctx.pem; if (!p) return;
        try { o.onStep(ctx, p, n, dir); } catch (e) { console.error(e); }
      }
    });
  }
  /* the money model in its funded HECM state, used by fwrm1 to fwrm4 */
  const RLO_BASE = { house: 70, creditLine: 0, safe: 0, borrow: 0 };
  const RLO_ON = { creditLine: 35, safe: 17.5, borrow: 17.5 };
  const stopAll = (p, names) => names.forEach((nm) => p.stop(nm));

  const ZOOM_RM = { fit: ['safe', 'borrowed', 'house'], pad: 0.8 };
  /** set the storyboard's own start values instantly, then start it */
  function scene(ctx, p, name, pre, ms) {
    p.set(pre, { ms: 0 });
    if (ms) ctx.timeout(() => { if (ctx.step != null) p.play(name); }, ms);
    else p.play(name);
  }

  /* --- RLO / FWP / EWP: the four-slide HECM overview --- */
  lessonScreen({
    id: 'fwrm1', title: 'What a home equity conversion mortgage is', steps: 5,
    pem: Object.assign({}, RLO_BASE), zoom: ZOOM_RM,
    copy: {
      head: 'What Is a Home Equity Conversion Mortgage?',
      p1: 'It is a loan that turns part of the equity in your home into cash you can use.',
      p2: 'You keep ownership of the home and your name stays on the title.',
      p3: 'A HECM is offered only through lenders approved by the Federal Housing Administration.',
      p4: 'It can replace the mortgage you already have, or help you buy the next home.',
      _notes: 'This is a loan against the house, set up so that no payment is due while you live there. Ownership does not change.\n\n- Ask: What would it mean to you to have the equity in this house available without selling it?\nPAUSE'
    },
    points: ['p1', 'p2', 'p3', 'p4'],
    onStep(ctx, p, n, dir) {
      p.set(n >= 1 ? RLO_ON : { creditLine: 0, safe: 0, borrow: 0 }, { ms: dir === 0 ? 0 : 800 });
    }
  });
  lessonScreen({
    id: 'fwrm2', title: 'What a HECM does for the household', steps: 5,
    pem: Object.assign({ showIncome: true }, RLO_BASE, RLO_ON), zoom: ZOOM_RM,
    foot: true, footFrom: 2,
    copy: {
      head: 'What a HECM Does',
      p1: 'It keeps the home secure with no mortgage payment due each month. You still pay the property tax and the homeowners insurance, and you keep the home in repair.',
      p2: 'It improves the cash flow your household lives on.*',
      p3: 'It gives you a buffer account to draw on, so your retirement savings get left alone in a bad market.*',
      p4: 'It may raise how much home you are able to buy.',
      foot: '* Loan advances are generally not treated as income under current tax law, subject to applicable requirements. This is not tax or financial advice. Please review your own situation with a qualified tax or financial professional.',
      _notes: 'Four things it does: secures the home, frees up cash flow, gives you a buffer, and raises your buying power.\n\n- Ask: Of those four, which one would change your month the most?\nPAUSE'
    },
    points: ['p1', 'p2', 'p3', 'p4'],
    onStep(ctx, p, n, dir) { p.set(Object.assign({ house: 70 }, RLO_ON), { ms: dir === 0 ? 0 : 600 }); }
  });
  lessonScreen({
    id: 'fwrm3', title: 'HECM requirements', steps: 5,
    pem: Object.assign({ showIncome: true }, RLO_BASE, RLO_ON), zoom: ZOOM_RM,
    copy: {
      head: 'Requirements',
      p1: 'You are at least 62, and the home stays your primary residence.',
      p2: 'You keep paying the property tax, the homeowners insurance and any association dues.',
      p3: 'There is a financial assessment: your credit record and the income you have left each month.',
      p4: 'You complete counseling with a HUD approved counseling agency.',
      _notes: 'Four requirements, and the second one is the one people forget: the property charges never stop.\n\n- Ask: Are the taxes and the insurance comfortable for you today?\nPAUSE'
    },
    points: ['p1', 'p2', 'p3', 'p4'],
    onStep(ctx, p, n, dir) {
      p.set(Object.assign({ house: 70 }, RLO_ON), { ms: dir === 0 ? 0 : 600 });
      p.flow('incomeTaxOut', n === 2);
    }
  });
  lessonScreen({
    id: 'fwrm4', title: 'HECM obligations and opportunities', steps: 5,
    pem: Object.assign({ showIncome: true }, RLO_BASE, RLO_ON), zoom: ZOOM_RM,
    copy: {
      head: 'Obligations and Opportunities',
      p1: 'You may stay in the home for life, or sell it whenever you choose.',
      p2: 'You keep it as your primary home and keep the taxes and insurance paid.',
      p3: 'On an adjustable rate HECM the unused credit line grows over time, and any voluntary payment you make goes back into it.',
      p4: 'Your spouse and your family are protected. The balance comes due when you leave the home permanently, and under the HECM rules what is owed is limited to the value of the home.',
      _notes: 'The obligations are short. The opportunities are the growing credit line and the protection for the people you leave behind.\n\n- Ask: Which matters more to you right now, the money available or the protection?\nPAUSE'
    },
    points: ['p1', 'p2', 'p3', 'p4'],
    onStep(ctx, p, n, dir) {
      p.flow('incomeTaxOut', n === 2);
      if (n !== 3) p.stop('RMGrowLOC');
      if (n !== 4) p.stop('RMHeirsProtected');
      if (n <= 2) p.set(Object.assign({ house: 70 }, RLO_ON), { ms: dir === 0 ? 0 : 600 });
      else if (n === 3) scene(ctx, p, 'RMGrowLOC', Object.assign({ house: 70 }, RLO_ON), 100);
      else scene(ctx, p, 'RMHeirsProtected', { house: 85, borrow: 10, creditLine: 70, safe: 17.5 }, 100);
    }
  });

  /* --- RM101: the money machine walk-through --- */
  lessonScreen({
    id: 'rmf1', title: 'Home equity as a source of capital', steps: 5,
    expanded: true, from: 2,
    pem: { house: 60, creditLine: 30, borrow: 0, safe: 0 }, zoom: ZOOM_RM,
    copy: {
      head: 'Your Home Equity Is Capital',
      p1: 'To cover a gap between what your income provides and the way you want to live.',
      p2: 'To make the improvements the house needs.',
      p3: 'To spend on whatever you choose.',
      _notes: 'The house is the one asset most retirees never count as capital. A share of it can be made available, and how much depends on your age and current rates.\n\n- Ask: If a part of this house were available to you in cash, what is the first thing it would do?\nPAUSE'
    },
    points: ['p1', 'p2', 'p3'],
    onStep(ctx, p, n, dir) {
      p.expand(n === 0);
      const names = ['RMSoLShortfall', 'RMHomeImprovement', 'RMSpend'];
      names.forEach((nm, i) => { if (n !== i + 2) p.stop(nm); });
      if (n <= 1) p.set({ house: 60, creditLine: 30, borrow: 0, safe: 0 }, { ms: dir === 0 ? 0 : 500 });
      else if (n === 2) scene(ctx, p, 'RMSoLShortfall', { house: 60, creditLine: 30, borrow: 0, safe: 0 }, dir === 0 ? 0 : 100);
      else if (n === 3) scene(ctx, p, 'RMHomeImprovement', { house: 60, creditLine: 30, borrow: 10, safe: 0 }, 100);
      else scene(ctx, p, 'RMSpend', { house: 60, creditLine: 30, borrow: 20, safe: 0 }, 100);
    }
  });
  lessonScreen({
    id: 'rmf2', title: 'Ownership stays with you', steps: 6, from: 1,
    pem: { house: 60, borrow: 10, creditLine: 30, safe: 0 }, zoom: ZOOM_RM,
    copy: {
      head: 'The Home Stays Yours',
      p1: 'You have a growing loan with the lender, and no payment is required while you live there.',
      p2: 'Any appreciation above what you owe is still yours.',
      p3: 'The unused credit line keeps growing while you hold the loan.',
      p4: 'You or your family can sell, clear the loan out of the proceeds and keep what is left.',
      p5: 'If the loan ever ends up larger than the home is worth, neither you nor your family is responsible for the difference.',
      _notes: 'Five things happen over time, and ownership is not one of the things that changes.\n\n- Ask: What have you been told about who owns the house under one of these loans?\nPAUSE'
    },
    points: ['p1', 'p2', 'p3', 'p4', 'p5'],
    onStep(ctx, p, n, dir) {
      const names = { 1: 'RMIncreasingLoan', 2: 'RMAppreciation', 4: 'RMSellHouse', 5: 'RMUpsideDown' };
      Object.keys(names).forEach((k) => { if (+k !== n) p.stop(names[k]); });
      const ms = dir === 0 ? 0 : 500;
      if (n === 0) p.set({ house: 60, borrow: 10, creditLine: 30, safe: 0 }, { ms: ms });
      else if (n === 1) scene(ctx, p, 'RMIncreasingLoan', { house: 60, borrow: 10, creditLine: 30, safe: 0 }, dir === 0 ? 0 : 100);
      else if (n === 2) scene(ctx, p, 'RMAppreciation', { house: 60, borrow: 20, creditLine: 30, safe: 0 }, 100);
      else if (n === 3) p.set({ house: 80, borrow: 20, creditLine: 40, safe: 0 }, { ms: ms });
      else if (n === 4) scene(ctx, p, 'RMSellHouse', { house: 80, borrow: 20, creditLine: 0, safe: 0 }, 100);
      else scene(ctx, p, 'RMUpsideDown', { house: 0, borrow: 0, creditLine: 0, safe: 60 }, 100);
    }
  });
  lessonScreen({
    id: 'rmf3', title: 'Replacing the mortgage you already have', steps: 4, from: 1,
    pem: { house: 60, borrow: 10, creditLine: 0, safe: 0, showIncome: true }, zoom: ZOOM_RM,
    copy: {
      head: 'You Still Owe on the House',
      p1: 'The balance you owe now can be paid off by refinancing into a reverse mortgage.',
      p2: 'The monthly mortgage payment stops being required. The property tax, the insurance and the upkeep stay with you.',
      p3: 'Whatever credit line is left over is there to draw on when you need it.',
      _notes: 'Right now a part of every month goes to the lender. Watch what happens to that flow.\n\n- Ask: What would you do with that payment if it were yours again every month?\nPAUSE'
    },
    points: ['p1', 'p2', 'p3'],
    onStep(ctx, p, n, dir) {
      const names = { 0: 'F101RepayLoanCashflow', 1: 'RMLoanReplacement', 3: 'RMAccess' };
      Object.keys(names).forEach((k) => { if (+k !== n) p.stop(names[k]); });
      const ms = dir === 0 ? 0 : 500;
      if (n === 0) { p.set({ house: 60, borrow: 10, creditLine: 0, safe: 0 }, { ms: ms }); p.play('F101RepayLoanCashflow'); }
      else if (n === 1) scene(ctx, p, 'RMLoanReplacement', { house: 60, borrow: 10, creditLine: 30, safe: 0 }, 100);
      else if (n === 2) { p.flowsOff(); p.set({ house: 60, borrow: 10, creditLine: 30, safe: 0 }, { ms: ms }); }
      else scene(ctx, p, 'RMAccess', { house: 60, borrow: 10, creditLine: 30, safe: 0 }, dir === 0 ? 0 : 100);
    }
  });
  lessonScreen({
    id: 'rmf4', title: 'Three ways to take the equity', steps: 4, from: 1,
    pem: { house: 60, creditLine: 30, borrow: 0, safe: 0, showIncome: true }, zoom: ZOOM_RM,
    foot: true, footFrom: 1,
    copy: {
      head: 'Three Ways to Reach It',
      p1: 'A single lump sum.',
      p2: 'A monthly income for as long as you live in the home, or for a term you choose.',
      p3: 'A line of credit you draw on as you need it.',
      foot: 'Loan advances are generally not treated as income under current tax law, subject to applicable requirements. Payment plans differ by loan type: HUD offers tenure, term and line of credit plans on adjustable rate HECMs, and a single lump sum on a fixed rate HECM.',
      _notes: 'Three ways out of the same loan, and most people only ever hear about the lump sum.\n\n- Ask: Which of the three fits the way you actually manage money?\nPAUSE'
    },
    points: ['p1', 'p2', 'p3'],
    onStep(ctx, p, n, dir) {
      const names = { 1: 'RMLumpSum', 2: 'RMMonthlyIncome', 3: 'RMEquityLine' };
      Object.keys(names).forEach((k) => { if (+k !== n) p.stop(names[k]); });
      const ms = dir === 0 ? 0 : 500;
      if (n === 0) p.set({ house: 60, creditLine: 30, borrow: 0, safe: 0 }, { ms: ms });
      else scene(ctx, p, names[n], { house: 60, creditLine: 30, borrow: 0, safe: n === 2 ? 0 : 0 }, dir === 0 ? 0 : 300);
    }
  });

  EFA.css('ha-f', `
  .stage .ha-grid.tight { gap: 4px 22px; }
  .stage .ha-grid.tight .st-field > input { height: 36px; font-size: 19px; }
  .stage .ha-grid.tight .lb { font-size: 19px; }
  .stage .ha-grid.tight .ro { font-size: 20px; }
  .stage .ha-grid.tight .st-seg-b { padding: 5px 13px; font-size: 15px; }
  .stage .ha-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
  .stage .ha-tab { text-align: center; font: 700 15px/1.2 var(--f-body); letter-spacing: .16em; text-transform: uppercase; color: var(--cream); background: var(--navy); border-radius: 12px 12px 0 0; padding: 13px 10px; }
  .stage .ha-mcard { padding: 22px 30px; display: grid; gap: 12px; }
  .stage .ha-mcard .r3 { display: grid; grid-template-columns: 210px 1fr 210px; align-items: center; gap: 24px; }
  .stage .ha-mcard .r3 .lb { text-align: center; font: 600 22px/1.2 var(--f-body); color: var(--navy); }
  .stage .ha-mcard .r3 .st-seg { flex-wrap: nowrap; padding: 3px; }
  .stage .ha-mcard .r3 .st-seg-b { padding: 7px 10px; font-size: 15px; white-space: nowrap; }
  .stage .ha-mcard .r3 .st-field > input { width: 210px; box-sizing: border-box; text-align: right; height: 42px; font-size: 20px; font-weight: 600; }
  .stage .ha-mcard .r3 .ro { text-align: right; font: 700 21px/1.2 var(--f-body); color: var(--gold-deep); font-variant-numeric: lining-nums tabular-nums; }
  .stage .ha-scard { padding: 18px 26px; display: grid; gap: 10px; }
  .stage .ha-scard .r2 { display: grid; grid-template-columns: 1fr 170px; align-items: center; gap: 18px; }
  .stage .ha-scard .r2 .lb { font: 600 21px/1.2 var(--f-body); color: var(--navy); }
  .stage .ha-scard .r2 .st-field > input { width: 170px; box-sizing: border-box; text-align: right; height: 42px; font-size: 20px; font-weight: 600; }
  .stage .ha-bad.card { background: var(--paper); border: 1px solid var(--rule); border-radius: 14px; box-shadow: 0 10px 30px rgba(13,30,58,.06); }
  `);

  /* =====================================================================================
     15. fwc2m2: assumptions for two forward-mortgage strategies
     ===================================================================================== */
  const SW = (ctx, id, key, def) => ctx.choice({ id: id, value: cget(key, def) ? 1 : 0,
    options: [{ value: 0, key: 'optN' }, { value: 1, key: 'optY' }] });

  EFA.screen('fwc2m2', {
    title: 'Assumptions for two forward-mortgage strategies',
    copy: {
      head: 'Two Mortgage Paths, Side by Side',
      capA: 'Strategy One', capB: 'Strategy Two', side: 'Side Fund',
      lProp: 'House Value', lAppr: 'Appreciation Rate', lLoan: 'Loan Amount', lRate: 'Interest Rate',
      lDed: 'Interest Deductible', lTerm: 'Loan Term (Years)', lPay: 'Monthly Payment',
      lTax: 'Income Tax Rate', lSav: 'Savings Account Balance', lRor: 'Rate of Return',
      lTaxable: 'Taxable', lAge: 'Current Age',
      optN: 'N', optY: 'Y', go: 'Continue',
      _notes: 'These are your numbers, not mine. Correct anything that is wrong before we run it.\n\n- Ask: Which of these two terms is closer to the loan you have today?\nPAUSE'
    },
    render(ctx) {
      loadC2M();
      const cf = (n, f, key, type, value, dp, extra) => (has('caseData', 'field')
        ? lib('caseData').field(ctx, Object.assign({ id: 's' + n + f, key: 'fw_c2m_m' + n + '_' + key, type: type, value: value, dp: dp }, extra || {}))
        : ctx.field(Object.assign({ id: 's' + n + f, type: type, value: value, dp: dp }, extra || {})));
      const r = (label, a, b) => `<div class="r">${a}</div><div class="lb">${ctx.t(label)}</div><div class="l">${b}</div>`;
      const row = (label, f, key, type, dp, extra) => r(label, cf(1, f, key, type, E.S1[f], dp, extra), cf(2, f, key, type, E.S2[f], dp, extra));
      const pctRow = (label, f, key, dp) => r(label,
        cf(1, f, key, 'pct', E.S1[f] / 100, dp), cf(2, f, key, 'pct', E.S2[f] / 100, dp));
      ctx.el.innerHTML = `
        <h1 class="ha-head sm" style="top:26px">${ctx.t('head')}</h1>
        <div class="ha-form" style="left:300px;width:1000px;top:112px">
          <div class="ha-grid tight">
            <div class="cap">${ctx.t('capA')}</div><div></div><div class="cap">${ctx.t('capB')}</div>
            ${row('lProp', 'prop', 'property_value', 'money', 0)}
            ${pctRow('lAppr', 'appr', 'appreciation_rate', 2)}
            ${row('lLoan', 'loan', 'mortgage_balance', 'money', 2)}
            ${pctRow('lRate', 'rate', 'mortgage_rate', 3)}
            ${r('lDed', SW(ctx, 's1ded', 'fw_c2m_m1_int_is_deductible', 0), SW(ctx, 's2ded', 'fw_c2m_m2_int_is_deductible', 0))}
            ${row('lTerm', 'termYears', 'term', 'int', 0, { min: 1 })}
            ${r('lPay', `<div class="ro" data-pay="1"></div>`, `<div class="ro" data-pay="2"></div>`)}
            <div class="sec">${ctx.t('side')}</div>
            ${pctRow('lTax', 'taxRate', 'tax_rate', 2)}
            ${row('lSav', 'savBal', 'savings_balance', 'money', 0)}
            ${pctRow('lRor', 'savRate', 'savings_rate', 2)}
            ${r('lTaxable', SW(ctx, 's1tx', 'fw_c2m_m1_savings_is_taxable', 0), SW(ctx, 's2tx', 'fw_c2m_m2_savings_is_taxable', 0))}
            ${r('lAge', has('caseData', 'field')
              ? lib('caseData').field(ctx, { id: 'age', key: 'case_file_current_age', type: 'int', value: S().startAge, min: 0, max: 100 })
              : ctx.field({ id: 'age', type: 'int', value: S().startAge, min: 0, max: 100 }), '')}
          </div>
          <button type="button" class="st-pill ha-go" data-go="1" style="margin-top:30px">${ctx.t('go')}</button>
        </div>
        ${discLine('position:absolute;left:160px;right:160px;bottom:22px;text-align:center')}`;
      ctx.onFields((v) => {
        E.S1.prop = v.s1prop; E.S2.prop = v.s2prop;
        E.S1.appr = v.s1appr * 100; E.S2.appr = v.s2appr * 100;
        E.S1.loan = v.s1loan; E.S2.loan = v.s2loan;
        E.S1.rate = v.s1rate * 100; E.S2.rate = v.s2rate * 100;
        E.S1.deductible = !!v.s1ded; E.S2.deductible = !!v.s2ded;
        E.S1.termYears = Math.max(0, Math.round(v.s1termYears)); E.S2.termYears = Math.max(0, Math.round(v.s2termYears));
        E.S1.taxRate = v.s1taxRate * 100; E.S2.taxRate = v.s2taxRate * 100;
        E.S1.savBal = v.s1savBal; E.S2.savBal = v.s2savBal;
        E.S1.savRate = v.s1savRate * 100; E.S2.savRate = v.s2savRate * 100;
        E.S1.savTaxable = !!v.s1tx; E.S2.savTaxable = !!v.s2tx;
        cd().set('fw_c2m_m1_int_is_deductible', !!v.s1ded); cd().set('fw_c2m_m2_int_is_deductible', !!v.s2ded);
        cd().set('fw_c2m_m1_savings_is_taxable', !!v.s1tx); cd().set('fw_c2m_m2_savings_is_taxable', !!v.s2tx);
        S().startAge = Math.max(0, Math.min(100, Math.round(v.age)));
        payments();
        const p1 = ctx.$('[data-pay="1"]'), p2 = ctx.$('[data-pay="2"]');
        if (p1) p1.textContent = money(E.S1.payment, 2);
        if (p2) p2.textContent = money(E.S2.payment, 2);
      });
      ctx.on(ctx.$('[data-go]'), 'click', () => ctx.next());
    }
  });

  /* =====================================================================================
     16. fwcfr2: assumptions for a HECM against a forward mortgage
     ===================================================================================== */
  EFA.screen('fwcfr2', {
    title: 'Assumptions for a HECM against a forward mortgage',
    copy: {
      head: 'Two Mortgage Paths, Side by Side',
      capA: 'HECM', capB: 'Forward', side: 'Side Fund',
      lProp: 'House Value', lAppr: 'Appreciation Rate', lLoan: 'Loan Amount',
      lClose: 'Financed Closing Costs', lCash: 'Cash Due at Closing', lRate: 'Interest Rate',
      lAge: 'Youngest Spouse Age', lTerm: 'Loan Term (Years)',
      lOpt: 'Optional Payment', lPay: 'Monthly Payment',
      lTax: 'Income Tax Rate', lSav: 'Savings Account Balance', lRor: 'Rate of Return', lTaxable: 'Taxable',
      optN: 'N', optY: 'Y', go: 'Continue',
      warn: 'There is not enough in savings to close.',
      ageTip: 'Use the age of the younger spouse, even when that spouse is not on the loan papers.',
      _notes: 'The HECM on the left, a traditional loan on the right, and the same household savings on both sides.\n\n- Ask: On the day you close, how much cash are you comfortable handing over?\nPAUSE'
    },
    render(ctx) {
      loadRevFwd(ctx.variant === 'nl' || !ctx.variant);
      const f = (side, id, key, type, value, dp, extra) => (has('caseData', 'field')
        ? lib('caseData').field(ctx, Object.assign({ id: side + id, key: 'fw_c2m_' + side + '_' + key, type: type, value: value, dp: dp }, extra || {}))
        : ctx.field(Object.assign({ id: side + id, type: type, value: value, dp: dp }, extra || {})));
      const r = (label, a, b) => `<div class="r">${a}</div><div class="lb">${label}</div><div class="l">${b}</div>`;
      const both = (label, id, key, type, dp) => r(ctx.t(label),
        f('rev', id, key, type, E.REV[id], dp), f('fwd', id, key, type, E.FWD[id], dp));
      const bothPct = (label, id, key, dp) => r(ctx.t(label),
        f('rev', id, key, 'pct', E.REV[id] / 100, dp), f('fwd', id, key, 'pct', E.FWD[id] / 100, dp));
      const two = (a, b) => `<div class="lb two"><span>${ctx.t(a)}</span><span>${ctx.t(b)}</span></div>`;
      ctx.el.innerHTML = `
        <h1 class="ha-head sm" style="top:26px">${ctx.t('head')}</h1>
        <div class="ha-form" style="left:300px;width:1000px;top:112px">
          <div class="ha-grid tight">
            <div class="cap">${ctx.t('capA')}</div><div></div><div class="cap">${ctx.t('capB')}</div>
            ${both('lProp', 'prop', 'property_value', 'money', 0)}
            ${bothPct('lAppr', 'appr', 'appreciation_rate', 2)}
            ${both('lLoan', 'loan', 'mortgage_balance', 'money', 0)}
            ${both('lClose', 'closing', 'financed_closing_costs', 'money', 0)}
            ${both('lCash', 'cashDue', 'cash_due_at_closing', 'money', 0)}
            ${bothPct('lRate', 'rate', 'mortgage_rate', 3)}
            <div class="r" title="">${f('rev', 'age', 'age', 'int', E.REV.age, 0, { min: 18, max: 99 })}</div>
            ${two('lAge', 'lTerm')}
            <div class="l">${f('fwd', 'termYears', 'term', 'int', E.FWD.termYears, 0, { min: 1 })}</div>
            <div class="r">${f('rev', 'optPayment', 'opt_payment', 'money', E.REV.optPayment, 2, { min: 0 })}</div>
            ${two('lOpt', 'lPay')}
            <div class="l"><div class="ro" data-pay="1" style="text-align:left"></div></div>
            <div class="sec">${ctx.t('side')}</div>
            ${bothPct('lTax', 'taxRate', 'tax_rate', 2)}
            ${both('lSav', 'savBal', 'savings_balance', 'money', 0)}
            ${bothPct('lRor', 'savRate', 'savings_rate', 2)}
            ${r(ctx.t('lTaxable'), SW(ctx, 'revtx', 'fw_c2m_rev_savings_is_taxable', 0), SW(ctx, 'fwdtx', 'fw_c2m_fwd_savings_is_taxable', 0))}
            <div class="ha-warn fade is-off" data-warn="rev">${ctx.t('warn')}</div>
            <button type="button" class="st-pill ha-go" data-go="1" style="margin-top:14px">${ctx.t('go')}</button>
            <div class="ha-warn fade is-off" data-warn="fwd">${ctx.t('warn')}</div>
          </div>
        </div>
        <p class="st-disclaimer ha-note" style="left:300px;width:1000px;bottom:20px;text-align:center">${ctx.t('ageTip')}</p>`;
      ctx.onFields((v) => {
        [['rev', E.REV], ['fwd', E.FWD]].forEach(([side, o]) => {
          o.prop = v[side + 'prop']; o.appr = v[side + 'appr'] * 100;
          o.loan = v[side + 'loan']; o.closing = v[side + 'closing']; o.cashDue = v[side + 'cashDue'];
          o.rate = v[side + 'rate'] * 100; o.taxRate = v[side + 'taxRate'] * 100;
          o.savBal = v[side + 'savBal']; o.savRate = v[side + 'savRate'] * 100;
          o.savTaxable = !!v[side + 'tx'];
          cd().set('fw_c2m_' + side + '_savings_is_taxable', !!v[side + 'tx']);
        });
        E.REV.age = Math.max(18, Math.min(99, Math.round(v.revage)));
        E.REV.optPayment = v.revoptPayment;
        E.FWD.termYears = Math.max(0, Math.round(v.fwdtermYears));
        cd().set('fw_c2m_rev_opt_payment', E.REV.optPayment);
        S().startAge = E.REV.age;
        payments();
        const pay = ctx.$('[data-pay="1"]'); if (pay) pay.textContent = money(E.FWD.payment, 2);
        ctx.show('[data-warn="rev"]', E.REV.cashDue > E.REV.savBal);
        ctx.show('[data-warn="fwd"]', E.FWD.cashDue > E.FWD.savBal);
      });
      ctx.on(ctx.$('[data-go]'), 'click', () => ctx.next());
    }
  });

  /* =====================================================================================
     17. c2m1: setting up the two loans (longer against shorter)
     ===================================================================================== */
  const MM = {
    amt1: ['c2m_loan_1_amount', 100000], amt2: ['c2m_loan_2_amount', 100000],
    rate1: ['c2m_loan_1_rate', 0.06], rate2: ['c2m_loan_2_rate', 0.06],
    yrs1: ['c2m_loan_1_years', 30], yrs2: ['c2m_loan_2_years', 15],
    io1: ['c2m_loan_1_is_iol', 0], io2: ['c2m_loan_2_is_iol', 0],
    sfr: ['mm_side_fund_ror', 0.06], tax: ['case_file_ror_taxes', 0.30]
  };
  const mmGet = (k) => { const d = MM[k]; return cget(d[0], d[1]); };
  const mmPmt = (amt, rate, yrs, io) => (io ? (rate / 12) * amt : PMT(rate / 12, 12 * yrs, amt));
  function mmInputs() {
    const o = {};
    Object.keys(MM).forEach((k) => { o[k] = mmGet(k); });
    o.yrs1 = Math.max(1, Math.round(o.yrs1)); o.yrs2 = Math.max(1, Math.round(o.yrs2));
    o.io1 = !!o.io1; o.io2 = !!o.io2;
    o.pmt1 = mmPmt(o.amt1, o.rate1, o.yrs1, o.io1);
    o.pmt2 = mmPmt(o.amt2, o.rate2, o.yrs2, o.io2);
    o.valid = o.pmt1 < o.pmt2 && o.yrs1 > o.yrs2;
    return o;
  }
  /** the MM grids of c2m2, shared by c2m3 and c2m4 */
  function mmGrids(I) {
    const months = [12 * I.yrs1, 12 * I.yrs2];
    const maxM = Math.max(months[0], months[1]), minM = Math.min(months[0], months[1]);
    const g = I.sfr / 12;
    const loan = [0, 1].map((L) => {
      const amt = L ? I.amt2 : I.amt1, rate = L ? I.rate2 : I.rate1, io = L ? I.io2 : I.io1, pmt = L ? I.pmt2 : I.pmt1;
      const rows = []; let bal = amt, cumInt = 0, cumPrin = 0, cumTsav = 0, ocP = 0, ocI = 0, ocT = 0;
      for (let j = 0; j < months[L]; j++) {
        const BOM = bal, int = (rate / 12) * BOM, prin = io ? 0 : pmt - int;
        bal = BOM - prin;
        cumInt += int; cumPrin += prin;
        const tsav = int * I.tax; cumTsav += tsav;
        ocP = prin + ocP * (1 + g); ocI = int + ocI * (1 + g); ocT = tsav + ocT * (1 + g);
        rows.push({ m: j + 1, BOM: BOM, pay: pmt, int: int, prin: prin, EOM: bal, cumInt: cumInt, cumPrin: cumPrin,
          tsav: tsav, cumTsav: cumTsav, ocP: ocP, ocI: ocI, ocT: ocT, wx: ocP + ocI - ocT });
      }
      return rows;
    });
    const pay = [], tax = [];
    let c1 = 0, c2 = 0, ev1 = 0, ev2 = 0;
    for (let j = 0; j < maxM; j++) {
      const p1 = j < months[0] ? I.pmt1 : 0, p2 = j < months[1] ? I.pmt2 : 0;
      pay.push({ m: j + 1, p1: p1, p2: p2, d: p2 - p1 });
      const t1 = j < months[0] ? loan[0][j].tsav : 0, t2 = j < months[1] ? loan[1][j].tsav : 0;
      c1 += t1; c2 += t2;
      ev1 = t1 + ev1 * (1 + g); ev2 = t2 + ev2 * (1 + g);
      tax.push({ m: j + 1, t1: t1, t2: t2, d: t1 - t2, c1: c1, c2: c2, ev1: ev1, ev2: ev2 });
    }
    const sideFund = (x) => {
      const rows = []; let bal = 0;
      for (let j = 0; j < maxM; j++) {
        const BOM = bal, int = BOM * x / 12, dp = pay[j].d, dt = tax[j].d;
        bal = BOM + int + dp + dt;
        rows.push({ m: j + 1, BOM: BOM, int: int, dp: dp, dt: dt, EOM: bal });
      }
      return rows;
    };
    return { loan: loan, pay: pay, tax: tax, sideFund: sideFund, months: months, maxM: maxM, minM: minM };
  }
  /** secant solve for the after-tax return that clears Mortgage One by the shorter loan's last month */
  function mmSolve(G, I) {
    const target = G.loan[0][G.minM - 1].EOM;
    const f = (x) => target - G.sideFund(x)[G.minM - 1].EOM;
    let x0 = 0, f0 = f(0), x1 = Math.max(0.001, I.sfr), f1 = f(x1);
    for (let i = 0; i < 99; i++) {
      if (f1 === f0) return null;
      const stp = ((x1 - x0) / (f1 - f0)) * f1;
      if (Math.abs(stp) < 1e-6) return x1;
      x0 = x1; f0 = f1; x1 = x1 - stp; f1 = f(x1);
    }
    return null;
  }
  Object.assign(EFA.engines.fwcompare, { mmInputs: mmInputs, mmGrids: mmGrids, mmSolve: mmSolve });

  EFA.screen('c2m1', {
    title: 'Setting up the two loans',
    copy: {
      head: 'Set Up the Two Loans',
      capA: 'Mortgage One', capB: 'Mortgage Two',
      lAmt: 'Loan Amount', lRate: 'Loan Rate', lYrs: 'Loan Term (Years)', lType: 'Loan Type', lPay: 'Monthly Payment',
      optC: 'Conventional', optIO: 'Interest Only',
      lSfr: 'Side Fund ROR', lTax: 'Marginal Tax Bracket',
      bad: 'Set Mortgage One up as the longer loan with the lower payment, and Mortgage Two as the shorter one. Then the comparison screens can run.',
      go: 'Continue',
      _notes: 'Mortgage One is the longer loan with the smaller payment. Mortgage Two is the shorter one.\n\n- Ask: If the shorter loan costs you more every month, what would you do with the difference under the longer one?\nPAUSE'
    },
    render(ctx) {
      const I = mmInputs();
      const fl = (id, type, dp, extra) => (has('caseData', 'field')
        ? lib('caseData').field(ctx, Object.assign({ id: id, key: MM[id][0], type: type, value: I[id], dp: dp }, extra || {}))
        : ctx.field(Object.assign({ id: id, type: type, value: I[id], dp: dp }, extra || {})));
      const tog = (id) => ctx.choice({ id: id, value: I[id] ? 1 : 0, options: [{ value: 0, key: 'optC' }, { value: 1, key: 'optIO' }] });
      ctx.el.innerHTML = `
        <h1 class="ha-head sm" style="top:30px">${ctx.t('head')}</h1>
        <div style="position:absolute;left:280px;width:1040px;top:122px">
          <div class="ha-tabs"><div class="ha-tab">${ctx.t('capA')}</div><div class="ha-tab">${ctx.t('capB')}</div></div>
          <div class="st-card ha-mcard">
            <div class="r3"><div>${fl('amt1', 'money', 0)}</div><div class="lb">${ctx.t('lAmt')}</div><div>${fl('amt2', 'money', 0)}</div></div>
            <div class="r3"><div>${fl('rate1', 'pct', 2)}</div><div class="lb">${ctx.t('lRate')}</div><div>${fl('rate2', 'pct', 2)}</div></div>
            <div class="r3"><div>${fl('yrs1', 'int', 0, { min: 1 })}</div><div class="lb">${ctx.t('lYrs')}</div><div>${fl('yrs2', 'int', 0, { min: 1 })}</div></div>
            <div class="r3"><div>${tog('io1')}</div><div class="lb">${ctx.t('lType')}</div><div>${tog('io2')}</div></div>
            <div class="r3"><div class="ro" data-pay="1"></div><div class="lb">${ctx.t('lPay')}</div><div class="ro" data-pay="2"></div></div>
          </div>
          <div class="st-card ha-scard" style="width:470px;margin:26px auto 0">
            <div class="r2"><div class="lb">${ctx.t('lSfr')}</div><div>${fl('sfr', 'pct', 2, { min: 0, max: 0.12 })}</div></div>
            <div class="r2"><div class="lb">${ctx.t('lTax')}</div><div>${fl('tax', 'pct', 2, { min: 0 })}</div></div>
          </div>
          <div style="display:grid;justify-items:center;margin-top:24px">
            <button type="button" class="st-pill" data-go="1" hidden>${ctx.t('go')}</button>
            <div class="st-card" data-bad="1" hidden style="width:700px;padding:22px 30px;font:500 22px/1.4 var(--f-body);text-align:center">${ctx.t('bad')}</div>
          </div>
        </div>
        ${discLine('position:absolute;left:200px;right:200px;bottom:20px;text-align:center')}`;
      ctx.onFields((v) => {
        const J = { amt1: v.amt1, amt2: v.amt2, rate1: v.rate1, rate2: v.rate2,
          yrs1: Math.max(1, Math.round(v.yrs1)), yrs2: Math.max(1, Math.round(v.yrs2)), io1: !!v.io1, io2: !!v.io2 };
        const p1 = mmPmt(J.amt1, J.rate1, J.yrs1, J.io1), p2 = mmPmt(J.amt2, J.rate2, J.yrs2, J.io2);
        const a = ctx.$('[data-pay="1"]'), b = ctx.$('[data-pay="2"]');
        if (a) a.textContent = money(p1, 2);
        if (b) b.textContent = money(p2, 2);
        cd().set('c2m_loan_1_is_iol', !!v.io1); cd().set('c2m_loan_2_is_iol', !!v.io2);
        const ok = p1 < p2 && J.yrs1 > J.yrs2;
        cd().set('c2m_assumptions_are_valid', ok);
        const go = ctx.$('[data-go]'), bad = ctx.$('[data-bad]');
        if (go) go.hidden = !ok;
        if (bad) bad.hidden = ok;
      });
      ctx.on(ctx.$('[data-go]'), 'click', () => ctx.next());
      if (has('disclosure', 'guard')) lib('disclosure').guard(ctx, 'sfr');
    }
  });

  /* =====================================================================================
     18. SHARED WORDING AND WORKSHEETS FOR THE C2M FAMILY
     ===================================================================================== */
  const MS = '_ha_mm';
  const MCOPY = {
    m1: 'Mortgage One', m2: 'Mortgage Two', sf: 'Side Fund',
    dPay: 'Difference in Payments', dTax: 'Difference in Tax Savings',
    'w.month': 'Month', 'w.year': 'Year', 'w.bom': 'Start Balance', 'w.pay': 'Monthly Payment',
    'w.int': 'Monthly Interest', 'w.prin': 'Monthly Principal', 'w.eom': 'End Balance',
    'w.cumInt': 'Cumulative Interest', 'w.cumPrin': 'Cumulative Principal',
    'w.tsav': 'Monthly Tax Savings', 'w.cumTsav': 'Cumulative Tax Savings',
    'w.ocP': 'Opportunity Cost of Principal', 'w.ocI': 'Opportunity Cost of Interest',
    'w.ocT': 'Opportunity Value of Tax Savings', 'w.wx': 'Wealth Transfer',
    'w.sfInt': 'Monthly Interest', 'w.dp': 'Payment Difference Deposit', 'w.dt': 'Tax Savings Difference Deposit',
    'w.p2': 'Mortgage Two Payment', 'w.p1': 'Mortgage One Payment', 'w.diff': 'Difference',
    'w.t1': 'Tax Savings M1', 'w.t2': 'Tax Savings M2', 'w.c1': 'Cumulative M1', 'w.c2': 'Cumulative M2',
    'w.ev1': 'Opportunity Value M1', 'w.ev2': 'Opportunity Value M2',
    'a.sfr': 'Side fund rate of return', 'a.tax': 'Marginal tax bracket',
    'ws.m1': 'Mortgage One, month by month', 'ws.m2': 'Mortgage Two, month by month',
    'ws.sf': 'The side fund, month by month', 'ws.dPay': 'The payment difference, month by month',
    'ws.dTax': 'The tax saving difference, month by month'
  };
  EFA.screen(MS, {
    title: 'Shared wording: mortgage comparison worksheets', copy: MCOPY,
    render(ctx) { ctx.el.innerHTML = `<div class="ha-sheet">${Object.keys(MCOPY).map((k) => ctx.t(k, { tag: 'p' })).join('')}</div>`; }
  });
  const mc = (key, o) => EFA.cp(MS, key, o);
  const MC = (field, key, type, dp) => ({ field: field, header: mc(key), type: type || 'money', dp: type ? undefined : 2 });
  const MONTH = () => ({ field: 'm', header: mc('w.month'), type: 'int', width: 90 });
  const MYEAR = () => ({ field: 'y', header: mc('w.year'), type: 'year', width: 80 });
  function mmSheet(titleKey, columns, rows, I) {
    return {
      heading: mc(titleKey), size: 'full', columns: columns, rows: rows, filter: 'm',
      assumptions: [{ label: mc('a.sfr'), value: F().pct(I.sfr) }, { label: mc('a.tax'), value: F().pct(I.tax) }],
      disclosures: ['hypothetical', 'notAdvice', 'license']
    };
  }
  /** the five worksheets of c2m2 / c2m3 / c2m4. sfRate = the rate the side fund grid uses on this screen */
  function mmSheets(G, I, sfRate) {
    const yr = (m) => Math.ceil(m / 12);
    const loanCols = () => [MONTH(), MC('BOM', 'w.bom'), MC('pay', 'w.pay'), MC('int', 'w.int'), MC('prin', 'w.prin'),
      MC('EOM', 'w.eom'), MC('cumInt', 'w.cumInt'), MC('cumPrin', 'w.cumPrin'), MC('tsav', 'w.tsav'),
      MC('cumTsav', 'w.cumTsav'), MC('ocP', 'w.ocP'), MC('ocI', 'w.ocI'), MC('ocT', 'w.ocT'), MC('wx', 'w.wx'), MYEAR()];
    const sf = G.sideFund(sfRate);
    return [
      { key: 'm1', data: () => mmSheet('ws.m1', loanCols(), G.loan[0].map((r) => Object.assign({ y: yr(r.m) }, r)), I) },
      { key: 'm2', data: () => mmSheet('ws.m2', loanCols(), G.loan[1].map((r) => Object.assign({ y: yr(r.m) }, r)), I) },
      { key: 'sf', data: () => mmSheet('ws.sf', [MONTH(), MC('BOM', 'w.bom'), MC('int', 'w.sfInt'), MC('dp', 'w.dp'),
        MC('dt', 'w.dt'), MC('EOM', 'w.eom'), MYEAR()], sf.map((r) => Object.assign({ y: yr(r.m) }, r)), I) },
      { key: 'dPay', data: () => mmSheet('ws.dPay', [MONTH(), MC('p2', 'w.p2'), MC('p1', 'w.p1'), MC('d', 'w.diff'), MYEAR()],
        G.pay.map((r) => Object.assign({ y: yr(r.m) }, r)), I) },
      { key: 'dTax', data: () => mmSheet('ws.dTax', [MONTH(), MC('t1', 'w.t1'), MC('t2', 'w.t2'), MC('d', 'w.diff'),
        MC('c1', 'w.c1'), MC('c2', 'w.c2'), MC('ev1', 'w.ev1'), MC('ev2', 'w.ev2'), MYEAR()],
        G.tax.map((r) => Object.assign({ y: yr(r.m) }, r)), I) }
    ];
  }

  /* --- a two-series chart with markers and a hover readout --- */
  const niceTick = (max, n) => {
    const raw = max / n, mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
    const steps = [1, 2, 2.5, 5, 10];
    for (let i = 0; i < steps.length; i++) if (raw / mag <= steps[i]) return steps[i] * mag;
    return 10 * mag;
  };
  function chart2(o) {
    const w = o.w, h = o.h, pad = { l: 128, r: 40, t: 24, b: 56 };
    const n = Math.max.apply(null, o.series.map((s) => s.values.length));
    let top = 0;
    o.series.forEach((s) => s.values.forEach((v) => { if (isFinite(v) && v > top) top = v; }));
    const tick = niceTick(top || 1, 5), yMax = Math.max(tick * 5, tick);
    const X = (i) => pad.l + (n <= 1 ? 0 : (i * (w - pad.l - pad.r)) / (n - 1));
    const Y = (v) => pad.t + (h - pad.t - pad.b) * (1 - v / yMax);
    let g = '';
    for (let i = 0; i <= 5; i++) {
      const v = (yMax * i) / 5, y = Y(v);
      g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${P.rule}" stroke-width="1" opacity=".8"/>`;
      g += `<text x="${pad.l - 14}" y="${(y + 7).toFixed(1)}" text-anchor="end" font-family="DM Sans, sans-serif" font-weight="700" font-size="19" fill="${P.navy}">${F().money(v, { compact: v >= 10000 })}</text>`;
    }
    const every = o.every || 5;
    (o.xLabels || []).forEach((lb, i) => {
      if (i % every && i !== (o.xLabels.length - 1)) return;
      g += `<text x="${X(i).toFixed(1)}" y="${h - pad.b + 32}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="19" fill="${P.navy}">${lb}</text>`;
    });
    g += `<line x1="${pad.l}" x2="${pad.l}" y1="${pad.t}" y2="${h - pad.b}" stroke="${P.navy}" stroke-width="2"/>`;
    o.series.forEach((s) => {
      const pts = s.values.map((v, i) => [X(i), Y(Math.max(0, v))]);
      if (!o.pointsOnly) {
        const d = pts.map((p2, i) => `${i ? 'L' : 'M'}${p2[0].toFixed(1)},${p2[1].toFixed(1)}`).join('');
        g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${o.pointsOnly ? 2 : 5}" stroke-linejoin="round" stroke-linecap="round"/>`;
      } else {
        const d = pts.map((p2, i) => `${i ? 'L' : 'M'}${p2[0].toFixed(1)},${p2[1].toFixed(1)}`).join('');
        g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" opacity=".45"/>`;
      }
      const step = Math.max(1, Math.round(n / 40));
      pts.forEach((p2, i) => {
        if (i % step && i !== pts.length - 1) return;
        g += s.mark === 'tri'
          ? `<path d="M${p2[0].toFixed(1)},${(p2[1] - 8).toFixed(1)}L${(p2[0] + 7.5).toFixed(1)},${(p2[1] + 5).toFixed(1)}L${(p2[0] - 7.5).toFixed(1)},${(p2[1] + 5).toFixed(1)}Z" fill="${s.color}" stroke="#fff" stroke-width="1.5"/>`
          : `<circle cx="${p2[0].toFixed(1)}" cy="${p2[1].toFixed(1)}" r="6" fill="${s.color}" stroke="#fff" stroke-width="1.8"/>`;
      });
    });
    g += `<rect data-hit="1" x="${pad.l}" y="${pad.t}" width="${w - pad.l - pad.r}" height="${h - pad.t - pad.b}" fill="transparent"/>`;
    return { svg: `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" data-chart="1">${g}</svg>`, X: X, Y: Y, n: n, pad: pad };
  }
  function wireChart(ctx, hostSel, build) {
    const host = ctx.$(hostSel); if (!host) return;
    const tip = document.createElement('div');
    tip.className = 'ha-chtip'; tip.style.opacity = '0';
    host.appendChild(tip);
    const svg = host.querySelector('svg[data-chart]'); if (!svg) return;
    const move = (e) => {
      const b = svg.getBoundingClientRect(), o = build();
      const sx = ((e.clientX - b.left) / b.width) * o.w;
      const i = Math.max(0, Math.min(o.n - 1, Math.round(((sx - o.pad.l) / (o.w - o.pad.l - o.pad.r)) * (o.n - 1))));
      tip.innerHTML = `<div class="t">${o.xLabels[i]}</div>${o.series.map((s) => `<div class="r"><span class="k" style="background:${s.color}"></span><span>${s.name}</span><span class="v">${money(Math.max(0, s.values[i]))}</span></div>`).join('')}`;
      const hb = host.getBoundingClientRect();
      tip.style.left = Math.max(6, Math.min(hb.width - 266, e.clientX - hb.left + 16)) + 'px';
      tip.style.top = Math.max(6, e.clientY - hb.top - 60) + 'px';
      tip.style.opacity = '1';
      if (EFA.numify) EFA.numify(tip);
    };
    svg.addEventListener('mousemove', move);
    svg.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
  }
  EFA.css('ha-ch', `
  .stage .ha-chtip { position: absolute; z-index: 5; pointer-events: none; min-width: 250px; padding: 10px 14px; border-radius: 12px; background: var(--paper); border: 1px solid var(--rule); box-shadow: 0 10px 26px rgba(13,30,58,.16); font: 500 15px/1.35 var(--f-body); color: var(--muted); transition: opacity .15s ease; }
  .stage .ha-chtip .t { font: 700 14px/1.2 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); margin-bottom: 6px; }
  .stage .ha-chtip .r { display: grid; grid-template-columns: 22px 1fr auto; gap: 4px 8px; align-items: center; }
  .stage .ha-chtip .r + .r { margin-top: 4px; }
  .stage .ha-chtip .v { font: 700 18px/1.1 var(--f-body); color: var(--navy); }
  .stage .ha-chtip .k { width: 18px; height: 4px; border-radius: 2px; }
  `);

  /* =====================================================================================
     19. c2m2: what side-fund return pays off Mortgage One early?
     ===================================================================================== */
  const CHART_C = { m1: P.navy, sf: P.goldDeep, m2: P.navy };
  const invalidHTML = (ctx) => `<div class="ha-bad card">${ctx.t('bad')}</div>`;
  const C2M_SHARED = {
    bad: 'This loan setup cannot be used here. Go back one screen and set Mortgage One up as the longer loan with the lower payment.',
    p2: 'Two things feed that side fund every month: the gap between the two payments, and the gap between the two interest tax savings. Both of them earn the same return.',
    gTitle: 'Mortgage One Balance and the Side Fund',
    gNote: 'Values are shown in nominal dollars and are not adjusted for inflation.',
    lgM1: 'Mortgage One', lgSF: 'Side Fund',
    bGraph: 'Graph', bBack: 'Return'
  };
  function c2mGraphHTML(ctx) {
    return `<div class="st-card ha-graph" data-graph="1" hidden>
      <p class="gt">${ctx.t('gTitle')}</p>
      <p class="gn">${ctx.t('gNote')}</p>
      <div class="gw" data-gw="1">
        <div class="ha-leg"><span><i class="ha-key" style="background:${CHART_C.m1}"></i>${ctx.t('lgM1')}</span><span><i class="ha-key" style="background:${CHART_C.sf}"></i>${ctx.t('lgSF')}</span></div>
      </div>
      <button type="button" class="st-pill" data-gback="1">${ctx.t('bBack')}</button>
    </div>`;
  }
  function c2mGraphData(ctx, G, I, sfRate) {
    const sf = G.sideFund(sfRate), y0 = new Date().getFullYear();
    const xs = [], m1 = [], s2 = [];
    for (let s = 0; s < I.yrs1; s++) {
      xs.push(String(y0 + s));
      m1.push(Math.max(0, (G.loan[0][12 * s] || { BOM: 0 }).BOM));
      s2.push(Math.max(0, (sf[12 * s] || { BOM: 0 }).BOM));
    }
    return { w: 1300, h: 440, xLabels: xs, every: 5,
      series: [{ name: ctx.text('lgM1'), values: m1, color: CHART_C.m1, mark: 'circle' },
        { name: ctx.text('lgSF'), values: s2, color: CHART_C.sf, mark: 'tri' }] };
  }
  function wireC2mGraph(ctx, dataFn) {
    const draw = () => {
      const gw = ctx.$('[data-gw]'); if (!gw) return;
      const cfg = dataFn(), c = chart2(cfg);
      const leg = gw.querySelector('.ha-leg');
      gw.innerHTML = c.svg;
      if (leg) gw.appendChild(leg);
      wireChart(ctx, '[data-gw]', () => Object.assign({}, cfg, chart2(cfg)));
      if (EFA.numify) EFA.numify(gw);
    };
    ctx._drawGraph = draw;
    ctx.on(ctx.$('[data-graph-open]'), 'click', () => {
      draw();
      ctx.$('[data-graph]').hidden = false;
      ctx.$$('[data-main]').forEach((n) => { n.hidden = true; });
    });
    ctx.on(ctx.$('[data-gback]'), 'click', () => {
      ctx.$('[data-graph]').hidden = true;
      ctx.$$('[data-main]').forEach((n) => { n.hidden = false; });
    });
  }

  EFA.screen('c2m2', {
    title: 'The side fund return that clears the longer loan',
    steps: 2,
    copy: Object.assign({}, C2M_SHARED, {
      qA: 'What would a side fund have to earn, after tax, for the',
      qB: 'year loan to be cleared by year',
      qC: '?',
      ansA: 'Needs to earn', ansB: 'after tax',
      p1a: 'At that return the side fund reaches', p1b: 'by year',
      p1c: ', which is what Mortgage One still owes at that moment:', p1d: '. The bracket used here is', p1e: '.',
      noSolve: 'No solution was found. Check that the assumptions are realistic.',
      _notes: 'This is the arithmetic question behind every "should I take the 15 or the 30" conversation.\n\n- Ask: Does your money have to work very hard for the longer loan to win?\nPAUSE\n\n- Graph shows the two lines crossing. Documentation holds the month by month numbers.'
    }),
    render(ctx) {
      const I = mmInputs();
      if (!cget('c2m_assumptions_are_valid', true) || !I.valid) { ctx.el.innerHTML = invalidHTML(ctx); return; }
      const G = mmGrids(I);
      const x = mmSolve(G, I);
      if (x == null) { ctx.toast(ctx.text('noSolve'), 4200); }
      const rate = x == null ? I.sfr : x;
      const sf = G.sideFund(rate);
      const sideFund = sf[G.minM - 1].EOM, loanBal = G.loan[0][G.minM - 1].EOM;
      const minYear = G.minM / 12, maxYear = G.maxM / 12;
      ctx.el.innerHTML = `
        <h1 class="ha-head q" data-main="1">${ctx.t('qA')} ${num(F().int(maxYear))} ${ctx.t('qB')} ${num(F().int(minYear))}${ctx.t('qC')}</h1>
        <div class="st-card ha-c2 fade is-off" data-main="1" data-card="1">
          <div class="ha-ans">${ctx.t('ansA')} ${num(F().pct(rate, 2))} ${ctx.t('ansB')}</div>
          <p>${ctx.t('p1a')} ${num(money(sideFund))} ${ctx.t('p1b')} ${num(F().int(minYear))}${ctx.t('p1c')} ${num(money(loanBal))}${ctx.t('p1d')} ${num(F().pct(I.tax, 2))}${ctx.t('p1e')}</p>
          <p>${ctx.t('p2')}</p>
        </div>
        <div class="ha-qm fade is-off" data-main="1" data-card="1">${questionMark()}</div>
        <div class="ha-lrow fade is-off" data-main="1" data-card="1">
          ${docsChooserHTML()}
          <button type="button" class="ha-lk" data-graph-open="1">${ICO.graph}${ctx.t('bGraph')}</button>
        </div>
        ${c2mGraphHTML(ctx)}
        ${discLine('position:absolute;left:110px;right:110px;bottom:24px;text-align:center')}`;
      wireDocsChooser(ctx, mmSheets(G, I, rate).map((s) => ({ key: s.key, data: s.data })));
      wireC2mGraph(ctx, () => c2mGraphData(ctx, G, I, rate));
    },
    step(ctx, n) { ctx.show('[data-card]', n >= 1); }
  });

  /* =====================================================================================
     20. c2m3: when could the side fund pay off Mortgage One?
     ===================================================================================== */
  /* the trial return lives for one visit to c2m3 only (never saved to the client file) */
  let C2M3_TRY = null;
  EFA.screen('c2m3', {
    title: 'When the side fund could clear Mortgage One',
    steps: 2,
    copy: Object.assign({}, C2M_SHARED, {
      qA: 'At a', qB: 'side fund return, how long before the fund could clear what is left on Mortgage One?',
      yr1: 'year', yrN: 'years', and: 'and', mo1: 'month', moN: 'months',
      ansLow: 'The return is too low',
      p1a: 'The fund catches up with the loan after', p1c: ', which is month',
      p1d: '. At that point the fund holds', p1e: 'and Mortgage One still owes', p1f: '. The bracket used here is', p1g: '.',
      pLow: 'At this return the fund stays below what is owed on Mortgage One for the whole term. Try a higher return, or a longer look.',
      bChange: 'Change Side Fund Return',
      dlgA: 'Type the new side fund return, then press Calculate.',
      dlgCalc: 'Calculate', dlgLb: 'Side Fund ROR',
      _notes: 'Same two loans, the other question: give me a return and I will tell you when the fund wins.\n\n- Ask: What return would you be comfortable assuming for money you cannot touch for fifteen years?\nPAUSE\n\n- Change Side Fund Return tries another number on the spot.'
    }),
    render(ctx) {
      const I = mmInputs();
      if (!cget('c2m_assumptions_are_valid', true) || !I.valid) { ctx.el.innerHTML = invalidHTML(ctx); return; }
      if (C2M3_TRY == null || !isFinite(C2M3_TRY)) C2M3_TRY = I.sfr;
      const V = { sfrTry: C2M3_TRY };
      const G = mmGrids(I);
      const sf = G.sideFund(V.sfrTry);
      let j = -1;
      for (let k = 0; k < 12 * I.yrs1 && k < sf.length; k++) { if (sf[k].EOM >= G.loan[0][k].EOM) { j = k; break; } }
      const found = j >= 0;
      const T = j + 1, Y = Math.floor(T / 12), M = T % 12;
      const span = `${num(F().int(Y))} ${ctx.t(Y === 1 ? 'yr1' : 'yrN')} ${ctx.t('and')} ${num(F().int(M))} ${ctx.t(M === 1 ? 'mo1' : 'moN')}`;
      ctx.el.innerHTML = `
        <h1 class="ha-head q" data-main="1">${ctx.t('qA')} ${num(F().pct(V.sfrTry, 2))} ${ctx.t('qB')}</h1>
        <div class="st-card ha-c2 fade is-off" data-main="1" data-card="1">
          <div class="ha-ans${found ? '' : ' sm'}">${found ? span : ctx.t('ansLow')}</div>
          <p>${found
            ? `${ctx.t('p1a')} ${span}${ctx.t('p1c')} ${num(F().int(T))}${ctx.t('p1d')} ${num(money(sf[j].EOM))} ${ctx.t('p1e')} ${num(money(G.loan[0][j].EOM))}${ctx.t('p1f')} ${num(F().pct(I.tax, 2))}${ctx.t('p1g')}`
            : ctx.t('pLow')}</p>
          <p>${ctx.t('p2')}</p>
        </div>
        <div class="ha-qm fade is-off" data-main="1" data-card="1">${questionMark()}</div>
        <div class="ha-lrow fade is-off" data-main="1" data-card="1">
          <button type="button" class="st-pill pin" data-chg="1" style="font-size:16px">${ctx.t('bChange')}</button>
          ${docsChooserHTML()}
          <button type="button" class="ha-lk" data-graph-open="1">${ICO.graph}${ctx.t('bGraph')}</button>
        </div>
        ${c2mGraphHTML(ctx)}
        ${discLine('position:absolute;left:110px;right:110px;bottom:24px;text-align:center')}`;
      wireDocsChooser(ctx, mmSheets(G, I, V.sfrTry).map((s) => ({ key: s.key, data: s.data })));
      wireC2mGraph(ctx, () => c2mGraphData(ctx, G, I, V.sfrTry));
      ctx.on(ctx.$('[data-chg]'), 'click', () => {
        const ov = ctx.overlay({ cls: 'ha-pop', title: '',
          html: `<div style="display:grid;gap:18px;justify-items:center;padding:8px 0 4px">
            <p style="margin:0;font:500 22px/1.4 var(--f-body);text-align:center">${ctx.t('dlgA')}</p>
            <input class="st-input" data-try="1" inputmode="decimal" style="width:180px;text-align:right" value="${esc(F().pct(V.sfrTry, 2))}">
            <button type="button" class="st-pill" data-calc="1">${ctx.t('dlgCalc')}</button></div>` });
        const x = ov.querySelector('.st-overlay-x');
        const inp = ov.querySelector('[data-try]');
        if (inp) { inp.focus(); inp.select(); inp.addEventListener('keydown', (e) => e.stopPropagation()); }
        ov.querySelector('[data-calc]').addEventListener('click', () => {
          if (EFA.edit && EFA.edit.on) return;
          const v = F().parse(inp.value, true);
          if (isFinite(v)) C2M3_TRY = Math.max(0, Math.round(v * 10000) / 10000);
          ov.close();
          EFA.player.renderScreen({ noFade: true });
        });
        if (x) x.remove();
      });
    },
    step(ctx, n) { ctx.show('[data-card]', n >= 1); },
    leave(ctx) {
      /* keep the trial return while this screen simply redraws; drop it when the presenter moves on */
      let same = false;
      try { same = !!(EFA.player.pres && EFA.player.entry().id === ctx.id); } catch (e) { same = false; }
      if (!same) C2M3_TRY = null;
    }
  });

  /* =====================================================================================
     21. c2m4: the tax savings of the two mortgages over time
     ===================================================================================== */
  EFA.screen('c2m4', {
    title: 'Tax savings of the two mortgages over time',
    copy: Object.assign({}, C2M_SHARED, {
      tCum: 'Cumulative Tax Savings', tEv: 'Opportunity Value of Tax Savings',
      sub: 'Tax Bracket:',
      rCum: 'Cumulative Tax Savings for Year', rEv: 'Opportunity Value for Year',
      rM1a: 'Mortgage One (', rM1b: 'Yr)', rM2a: 'Mortgage Two (', rM2b: 'Yr)',
      lgM1: 'Mortgage One', lgM2: 'Mortgage Two',
      bQuiz: 'Quiz', bAlt: 'Alternative',
      _notes: 'The deduction is real, and it is smaller than people think. Here it is year by year under both loans.\n\n- Ask: Would you keep a loan you do not need for the sake of the deduction?\nPAUSE\n\n- Click the title to switch between the savings themselves and what they could have earned.'
    }),
    render(ctx) {
      const I = mmInputs();
      if (!cget('c2m_assumptions_are_valid', true) || !I.valid) { ctx.el.innerHTML = invalidHTML(ctx); return; }
      const V = ctx._v = ctx._v || { showEV: !!ctx.mem('showEV', false), year: Math.min(I.yrs1, I.yrs2) };
      V.year = Math.max(1, Math.min(I.yrs1, Math.round(V.year)));
      const G = mmGrids(I);
      const at = (y) => {
        const i = 12 * y - 1, r = G.tax[Math.min(i, G.tax.length - 1)];
        return V.showEV ? [r.ev1, r.ev2] : [r.c1, r.c2];
      };
      const cfg = () => {
        const xs = [], a = [], b = [];
        for (let s = 0; s < I.yrs1; s++) {
          xs.push(String(s + 1));
          const v = at(s + 1);
          a.push(Math.max(0, v[0])); b.push(Math.max(0, v[1]));
        }
        return { w: 1370, h: 500, xLabels: xs, every: 5, pointsOnly: true,
          series: [{ name: ctx.text('lgM1'), values: a, color: CHART_C.m1, mark: 'circle' },
            { name: ctx.text('lgM2'), values: b, color: P.goldDeep, mark: 'tri' }] };
      };
      ctx.el.innerHTML = `
        <div class="st-card ha-ch4">
          <p class="gt" data-title="1">${ctx.t(V.showEV ? 'tEv' : 'tCum')}</p>
          <p class="gs">${ctx.t('sub')} ${num(F().pct(I.tax, 2))}</p>
          <div class="gw" style="position:relative" data-gw="1">
            <div class="ha-leg"><span><i class="ha-key" style="background:${CHART_C.m1}"></i>${ctx.t('lgM1')}</span><span><i class="ha-key" style="background:${P.goldDeep}"></i>${ctx.t('lgM2')}</span></div>
          </div>
        </div>
        <div class="ha-act">
          <div class="st-card ha-ro">
            <div class="rr t" data-rtitle="1"><span data-rlab="1">${ctx.t(V.showEV ? 'rEv' : 'rCum')}</span><span class="v num" data-ryear="1"></span></div>
            <div class="rr"><span>${ctx.t('rM1a')}${num(F().int(I.yrs1))} ${ctx.t('rM1b')}</span><span class="v num" data-rv="1"></span></div>
            <div class="rr"><span>${ctx.t('rM2a')}${num(F().int(I.yrs2))} ${ctx.t('rM2b')}</span><span class="v num" data-rv="2"></span></div>
          </div>
          <div class="ha-sl"><input type="range" min="1" max="${I.yrs1}" step="1" value="${V.year}" data-year="1" aria-label="Year"></div>
          <div class="ha-btns">
            <button type="button" class="st-pill" data-quiz="1">${ctx.t('bQuiz')}</button>
            <button type="button" class="st-pill" data-alt="1">${ctx.t('bAlt')}</button>
            ${docsChooserHTML()}
          </div>
        </div>`;
      const drawChart = () => {
        const gw = ctx.$('[data-gw]'); const c = cfg(); const chart = chart2(c);
        const leg = gw.querySelector('.ha-leg');
        gw.innerHTML = chart.svg;
        if (leg) gw.appendChild(leg);
        wireChart(ctx, '[data-gw]', () => Object.assign({}, c, chart2(c)));
        if (EFA.numify) EFA.numify(gw);
      };
      const paint = () => {
        const v = at(V.year);
        const y = ctx.$('[data-ryear]'); if (y) y.textContent = F().int(V.year);
        const a = ctx.$('[data-rv="1"]'), b = ctx.$('[data-rv="2"]');
        if (a) a.textContent = money(Math.max(0, v[0]));
        if (b) b.textContent = money(Math.max(0, v[1]));
        drawChart();
      };
      const flip = () => {
        V.showEV = !V.showEV;
        ctx.remember('showEV', V.showEV);
        ctx.$('[data-title]').innerHTML = ctx.t(V.showEV ? 'tEv' : 'tCum');
        ctx.$('[data-rlab]').innerHTML = ctx.t(V.showEV ? 'rEv' : 'rCum');
        if (EFA.edit && EFA.edit.on) EFA.edit.arm(ctx.el);
        paint();
      };
      ctx.on(ctx.$('[data-title]'), 'click', flip);
      ctx.on(ctx.$('[data-rtitle]'), 'click', flip);
      const sl = ctx.$('[data-year]');
      if (sl) sl.addEventListener('input', () => { V.year = +sl.value; sl.title = String(V.year); paint(); });
      wireDocsChooser(ctx, mmSheets(G, I, I.sfr).map((s) => ({ key: s.key, data: s.data })));
      const save = () => { ctx.remember('showEV', V.showEV); ctx.remember('year', V.year); };
      ctx.on(ctx.$('[data-quiz]'), 'click', () => { save(); ctx.jump('MMQ', 'mmq1'); });
      ctx.on(ctx.$('[data-alt]'), 'click', () => { save(); ctx.jump('PLIA', 'plia1'); });
      V.year = Math.max(1, Math.min(I.yrs1, Math.round(ctx.mem('year', V.year))));
      if (sl) sl.value = String(V.year);
      paint();
    }
  });

  /* =====================================================================================
     22. THE TANK CALCULATORS (fwc2m3, fwc2m4, fwc2m5, fwcfr3, fwcfr4, fwcfr5)
     ===================================================================================== */
  function refresh(node) {
    if (!node) return;
    if (EFA.edit && EFA.edit.on) EFA.edit.arm(node); else if (EFA.numify) EFA.numify(node);
  }
  /** one tank screen. o: {head, rev, assume (fn), run (fn -> run), docs (fn)} */
  function tankScreen(id, title, copy, o) {
    EFA.screen(id, {
      title: title, copy: copy,
      render(ctx) {
        const prep = o.prep(ctx);
        if (!prep) { plfPending(ctx, ctx.t('head')); return; }
        const st = singleFrame(ctx, { head: ctx.t('head'), rev: o.rev, docs: () => o.docs(prep) });
        const panels = ctx.$('[data-panels]');
        const paint = (k, ms) => {
          const row = rowAt(prep.run, k);
          setPem(st.pem, feed(row, k, { rev: o.rev }), ms);
          setStatus(ctx, ctx.$('[data-st]'), prep.run.status);
          if (panels) { panels.innerHTML = panelHTML(hc('pMortgage'), o.assume(prep)) + cashFlowHTML(row); refresh(panels); }
        };
        wireStrip(ctx, st, paint);
        paint(0, 0);
      },
      leave() { /* the auto-step timer is cleared by the player */ }
    });
  }

  /* --- fwc2m3 / fwc2m4: one forward strategy at a time --- */
  function c2mTank(id, which, head, notes) {
    tankScreen(id, 'Strategy ' + (which === 2 ? 'Two' : 'One') + ' year by year', { head: head, _notes: notes }, {
      rev: false,
      prep(ctx) {
        loadC2M();
        if (which === 1) S().refScale = 0;
        const r1 = runC2M(1), r2 = runC2M(2);
        return { run: which === 2 ? r2 : r1, S: which === 2 ? E.S2 : E.S1, which: which };
      },
      assume(p) {
        return rowHTML(hc('lBegin'), num(money(p.S.loan, 2)))
          + rowHTML(hc('lPayment'), num(money(p.S.payment, 2)))
          + rowHTML(hc('lRate'), num(F().pct(p.S.rate / 100, 3)))
          + rowHTML(hc('lMonths'), num(F().int(12 * p.S.termYears)));
      },
      docs: (p) => WS.C2M(p.run, p.which)
    });
  }
  c2mTank('fwc2m3', 1, 'Strategy One, Year by Year',
    'Here is the first strategy running from today to age 99: the loan draining, the house growing, and whatever the payment difference banks going into savings.\n\n- Ask: Watch the savings tank. At what age does it start to matter to you?\nPAUSE\n\n- Type an age, or check Step to play the years.');
  c2mTank('fwc2m4', 2, 'Strategy Two, Year by Year',
    'Same house, same years, the other loan. The payment is smaller, so every month the difference goes into the side fund.\n\n- Ask: Which tank would you rather be filling at this age?\nPAUSE');

  /* --- fwc2m5: the two strategies side by side --- */
  EFA.screen('fwc2m5', {
    title: 'Strategy One against Strategy Two',
    copy: {
      head: 'Strategy One and Strategy Two',
      capL: 'Strategy One', capR: 'Strategy Two',
      _notes: 'Both strategies on the same scale, stepping through the years together.\n\n- Ask: At the age you expect to retire, which picture do you want to be looking at?\nPAUSE\n\n- Documentation holds either strategy, or both in one table.'
    },
    render(ctx) {
      loadC2M();
      const r1 = runC2M(1), r2 = runC2M(2);
      const st = doubleFrame(ctx, {
        head: ctx.t('head'), capL: ctx.t('capL'), capR: ctx.t('capR'),
        docs: [{ key: 'c.s1', data: () => WS.C2M(r1, 1) }, { key: 'c.s2', data: () => WS.C2M(r2, 2) },
          { key: 'c.both', data: () => WS.C2M_BOTH(r1, r2) }]
      });
      const paint = (k, ms) => {
        setPem(st.pemL, feed(rowAt(r1, k), k, { rev: false }), ms);
        setPem(st.pemR, feed(rowAt(r2, k), k, { rev: false }), ms);
        setStatus(ctx, ctx.$('[data-st="L"]'), r1.status);
        setStatus(ctx, ctx.$('[data-st="R"]'), r2.status);
      };
      wireStrip(ctx, st, paint);
      paint(0, 0);
    }
  });

  /* --- fwcfr3: the HECM year by year --- */
  tankScreen('fwcfr3', 'The HECM year by year', {
    head: 'Your HECM, Year by Year',
    _notes: 'The balance grows with interest and mortgage insurance, the unused credit line grows alongside it, and the house keeps appreciating.\n\n- Ask: Which of those three lines matters most to you?\nPAUSE'
  }, {
    rev: true,
    prep(ctx) {
      loadRevFwd(true);
      S().refScale = 0;
      runFWD();
      const rev = runREV();
      if (!rev) return null;
      return { run: rev };
    },
    assume() {
      return rowHTML(hc('lBegin'), num(money(E.REV.loan + E.REV.closing, 2)))
        + rowHTML(hc('lOptPay'), num(money(E.REV.optPayment, 2)))
        + rowHTML(hc('lRate'), num(F().pct(E.REV.rate / 100, 3)))
        + rowHTML(hc('lPL'), num(money(E.REV.principalLimit, 2)));
    },
    docs: (p) => WS.REV(p.run)
  });

  /* --- fwcfr4: the forward mortgage year by year --- */
  tankScreen('fwcfr4', 'The forward mortgage year by year', {
    head: 'Your Forward Mortgage, Year by Year',
    _notes: 'The same household on a traditional loan: the cash due at closing leaves savings, the loan amortizes, and the house still appreciates.\n\n- Ask: What is that monthly payment doing to the rest of your plan?\nPAUSE'
  }, {
    rev: false,
    prep(ctx) {
      loadRevFwd(true);
      const fwd = runFWD();
      runREV();
      return { run: fwd };
    },
    assume() {
      return rowHTML(hc('lBegin'), num(money(E.FWD.loan + E.FWD.closing, 2)))
        + rowHTML(hc('lPayment'), num(money(E.FWD.payment, 2)))
        + rowHTML(hc('lRate'), num(F().pct(E.FWD.rate / 100, 3)))
        + rowHTML(hc('lMonths'), num(F().int(12 * E.FWD.termYears)));
    },
    docs: (p) => WS.FWD(p.run)
  });

  /* --- fwcfr5: the HECM against the forward mortgage --- */
  EFA.screen('fwcfr5', {
    title: 'The HECM against a forward mortgage',
    copy: {
      head: 'HECM and Forward Mortgage',
      capL: 'HECM', capR: 'Forward Mortgage',
      _notes: 'Liquidity on the left includes the credit line you have not used. On the right it is savings only.\n\n- Ask: At age 85, which side would you rather be standing on?\nPAUSE'
    },
    render(ctx) {
      loadRevFwd(true);
      const fwd = runFWD();
      const rev = runREV();
      if (!rev) { plfPending(ctx, ctx.t('head')); return; }
      const st = doubleFrame(ctx, {
        head: ctx.t('head'), capL: ctx.t('capL'), capR: ctx.t('capR'), locL: true,
        docs: [{ key: 'c.rev', data: () => WS.REV(rev) }, { key: 'c.fwd', data: () => WS.FWD(fwd) },
          { key: 'c.revfwd', data: () => WS.REV_FWD(rev, fwd) }]
      });
      const paint = (k, ms) => {
        setPem(st.pemL, feed(rowAt(rev, k), k, { rev: true }), ms);
        setPem(st.pemR, feed(rowAt(fwd, k), k, { rev: false }), ms);
        setStatus(ctx, ctx.$('[data-st="L"]'), rev.status);
        setStatus(ctx, ctx.$('[data-st="R"]'), fwd.status);
      };
      wireStrip(ctx, st, paint);
      paint(0, 0);
    }
  });
})();
