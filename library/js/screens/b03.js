/* College Planning (CP; College Expense CE reuses cp6 and cp7), College Planning 101 (CPF101),
   College Planning Account Benefits (CPB), College Planning Scoreboard (CPS) and
   Compare Account Types (CAT, with the shared engine EFA.engines.cat).
   Structure, sequence, interactions and math follow the specs; artwork and wording are new. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt;
  EFA.engines = EFA.engines || {};
  const lib = (n) => (EFA.lib && EFA.lib[n]) || null;
  const num = (s) => `<span class="num">${s}</span>`;
  const money = (v) => F.money(v);

  EFA.css('b03', `
  .b03-f { transition: opacity .8s ease; }
  .b03-f.is-off { transition: opacity .3s ease; }
  .b03-head { position: absolute; left: 110px; right: 110px; top: 44px; text-align: center; }
  .b03-head .st-h1 { font-size: 62px; }
  .b03-card { background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 14px 34px rgba(13,30,58,.08); }
  .b03-xl { font: 700 30px/1.26 "DM Sans", sans-serif; color: #0d1e3a; }
  .b03-l { font: 600 25px/1.34 "DM Sans", sans-serif; color: #0d1e3a; }
  .b03-m { font: 600 19px/1.4 "DM Sans", sans-serif; color: #0d1e3a; }
  .b03-pend { display: inline-block; vertical-align: middle; white-space: nowrap; font: 700 12px/1 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #6f7a8d; background: #e9edf3; border-radius: 999px; padding: 7px 12px; }
  .b03-ill { position: absolute; }
  .b03-ill > svg { width: 100%; height: 100%; display: block; overflow: visible; }
  .b03-shadow { filter: drop-shadow(0 18px 24px rgba(13,30,58,.13)); }
  .b03-disc { position: absolute; left: 110px; width: 1120px; bottom: 64px; margin: 0; }
  .b03-gold { color: #8a6e22; }
  .b03-link { color: #8a6e22; border-bottom: 2px solid rgba(184,151,46,.55); cursor: pointer; transition: color .2s ease, border-color .2s ease; }
  .b03-link:hover { color: #b8972e; border-color: #b8972e; }
  .b03-lrow { display: flex; align-items: center; gap: 22px; }
  .b03-dartbox { flex: 0 0 auto; display: grid; place-items: center; }
  .b03-dartbox > svg { display: block; }

  /* cp1 */
  .b03-cp1-fig { left: 236px; top: 30px; width: 622px; height: 875px; }
  .b03-cp1-txt { position: absolute; left: 900px; top: 0; bottom: 0; width: 480px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 34px; text-align: center; }
  .b03-quote { margin: 0; font: 600 62px/1.1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; text-wrap: balance; }

  /* cp2 */
  .b03-bund { position: absolute; left: 170px; width: 470px; height: 200px; transform: translateY(0); }
  .b03-bund.drop { transition: transform 1.5s ease 1s; }
  .b03-bund.snap { transition: none !important; }
  .b03-cp2-rows { position: absolute; left: 760px; top: 190px; width: 760px; display: grid; gap: 46px; }
  .b03-pt { padding: 24px 32px; width: 640px; box-sizing: border-box; font-size: 32px; }
  .b03-src { position: absolute; right: 110px; top: 700px; text-align: right; margin: 0; }

  /* cp3 */
  .b03-grad { left: 96px; top: 24px; width: 625px; height: 879px; }
  .b03-stack { position: absolute; width: 220px; height: 94px; }
  .b03-cp3-r { position: absolute; left: 812px; top: 64px; width: 690px; display: grid; gap: 14px; }
  .b03-cp3-r .st-h2 { font-size: 50px; font-weight: 600; margin-bottom: 4px; }
  .b03-grid2 { display: grid; grid-template-columns: 2.4fr 1.6fr; align-items: center; row-gap: 6px; padding: 18px 26px; }
  .b03-grid2 .lb { text-align: center; font: 600 24px/1.25 "DM Sans", sans-serif; }
  .b03-grid2 .v { text-align: center; font: 700 28px/1.2 "DM Sans", sans-serif; }
  .b03-grid2 .or { font: 700 18px/1 "DM Sans", sans-serif; letter-spacing: .3em; color: #8a6e22; padding: 2px 0; }
  .b03-grid2 .tot { font: 700 32px/1.2 "DM Sans", sans-serif; padding-top: 10px; }
  .b03-grid2 .v.tot { border-top: 3px solid #0d1e3a; color: #0d1e3a; }
  .b03-grid2 .tot.lb { color: #8a6e22; letter-spacing: .04em; }
  .b03-grid2 .sm { font: 500 19px/1.3 "DM Sans", sans-serif; color: #667389; display: block; }
  .b03-note { margin: 0; text-align: center; font: 600 19px/1.35 "DM Sans", sans-serif; color: #44516a; }
  .b03-as { margin: 0; text-align: right; font: 600 18px/1.5 "DM Sans", sans-serif; color: #44516a; }

  /* cp4 */
  .b03-cp4-h { position: absolute; left: 110px; top: 50px; width: 1100px; margin: 0; }
  .b03-cp4-h .l2 { display: block; color: #8a6e22; }
  .b03-cp4-card { position: absolute; left: 110px; top: 262px; width: 800px; padding: 40px 48px 46px; display: grid; gap: 24px; box-sizing: border-box; }
  .b03-cp4-card .it { font: 700 34px/1.28 "DM Sans", sans-serif; margin: 0; }
  .b03-cp4-goals .b03-xl { font-size: 32px; }
  .b03-cp4-card .it2 { margin-top: 12px; }
  .b03-cp4-goals { display: grid; gap: 20px; margin: 8px 0 0 46px; }
  .b03-note-pad { right: 120px; bottom: 60px; width: 500px; height: 682px; }

  /* cp5 */
  .b03-cp5-q { position: absolute; left: 120px; width: 1360px; top: 46px; text-align: center; margin: 0; font: 600 52px/1.08 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; text-wrap: balance; }
  .b03-cp5-s { position: absolute; left: 120px; width: 1360px; top: 186px; text-align: center; margin: 0; font: 700 26px/1.2 "DM Sans", sans-serif; letter-spacing: .08em; color: #8a6e22; }
  .b03-cp5-myths { position: absolute; left: 140px; top: 262px; width: 900px; padding: 30px 40px; display: grid; gap: 22px; }
  .b03-myth { margin: 0; font: 700 31px/1.3 "DM Sans", sans-serif; color: #0d1e3a; transition: opacity .8s ease, color 0s; }
  .b03-myth.is-off { transition: opacity .3s ease; }
  .b03-myth.grey { color: #a3abb8; }
  .b03-cp5-ans { position: absolute; left: 140px; top: 556px; width: 900px; height: 132px; padding: 0 40px 0 34px; display: flex; align-items: center; gap: 22px; border-left: 8px solid #b8972e; box-sizing: border-box; }
  .b03-cp5-ans .tx { font: 600 27px/1.32 "DM Sans", sans-serif; color: #0d1e3a; margin: 0; }
  .b03-cp5-ans .tx.is-off { display: none; }
  .b03-qm { left: 1100px; top: 236px; width: 380px; height: 543px; }

  /* cp6 */
  .b03-cp6-blk { position: absolute; right: 96px; width: 768px; }
  .b03-cp6-blk .st-h3 { font-size: 36px; margin: 0 0 12px; }
  .b03-kv { padding: 18px 32px; display: grid; gap: 8px; }
  .b03-kv .top { font: 700 25px/1.3 "DM Sans", sans-serif; margin: 0 0 4px; text-align: center; }
  .b03-kv .row { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: baseline; }
  .b03-kv .row .k { text-align: right; font: 500 23px/1.3 "DM Sans", sans-serif; color: #44516a; }
  .b03-kv .row .v { text-align: center; font: 700 26px/1.3 "DM Sans", sans-serif; }
  .b03-kid { padding: 16px 32px; display: grid; gap: 8px; }
  .b03-kid .row { display: grid; grid-template-columns: 4fr 2fr 3fr; gap: 18px; align-items: baseline; font: 500 23px/1.35 "DM Sans", sans-serif; }
  .b03-kid .row > :first-child { text-align: right; }
  .b03-kid .row > :nth-child(2) { text-align: center; font-weight: 700; }
  .b03-cp6-imp { position: absolute; right: 96px; width: 1120px; top: 642px; display: grid; gap: 12px; }
  .b03-sep { height: 13px; border-radius: 7px; background: #cbd5e3; }
  .b03-imp { display: flex; align-items: baseline; justify-content: center; gap: 22px; padding: 20px 30px; }
  .b03-imp .k { font: 700 28px/1 "DM Sans", sans-serif; letter-spacing: .12em; color: #8a6e22; }
  .b03-imp .v { font: 700 46px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b03-imp .d { font: 600 25px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b03-foot { margin: 0; text-align: right; font: 500 16px/1.4 "DM Sans", sans-serif; color: #667389; }
  .b03-bag { position: absolute; transform-origin: 0 0; transition: transform 2s ease, opacity .3s ease .5s; }
  .b03-bag.big { transition: transform 2s ease .5s; }

  /* cp7 */
  .b03-cp7-txt { position: absolute; left: 120px; top: 150px; width: 952px; height: 452px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 22px; text-align: center; }
  .b03-cp7-txt .imp { font: 600 76px/1.05 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b03-cp7-txt .imp .num { font: 700 70px/1 "DM Sans", sans-serif; letter-spacing: -.01em; }
  .b03-cp7-txt .imp .k { font: 700 34px/1 "DM Sans", sans-serif; letter-spacing: .14em; color: #8a6e22; margin-right: 18px; vertical-align: middle; }
  .b03-cp7-txt .q { font: 600 64px/1.05 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; margin: 0; }
  .b03-cp7-txt .lk { font: 700 30px/1.2 "DM Sans", sans-serif; }
  .b03-cp7-txt .sw { display: inline-grid; place-items: center; width: 34px; height: 34px; margin-left: 12px; border-radius: 50%; border: 1.5px solid #cbd5e3; color: #8a93a3; cursor: pointer; vertical-align: middle; opacity: .55; transition: opacity .2s ease; }
  .b03-cp7-txt .sw:hover { opacity: 1; }
  .b03-cp7-bagbox { position: absolute; left: 1090px; top: 152px; width: 390px; height: 450px; }
  .b03-cp7-bag { position: absolute; left: 0; right: 0; bottom: 0; height: 450px; transform-origin: 50% 100%; transform: scale(.6); transition: transform .8s ease; }
  .b03-cp7-bag.big { transform: scale(1); }
  .b03-cp7-as { position: absolute; left: 242px; width: 1116px; top: 640px; padding: 22px 34px; text-align: center; display: grid; gap: 6px; box-sizing: border-box; }
  .b03-cp7-as p { margin: 0; font: 600 24px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }

  /* cp8 */
  .b03-cp8-list { position: absolute; left: 110px; top: 236px; width: 930px; display: grid; gap: 30px; }
  .b03-cp8-list .b03-xl { font-size: 32px; }
  .b03-jarbox { position: absolute; right: 100px; bottom: 54px; width: 520px; height: 650px; }
  .b03-jar-lbl { position: absolute; display: grid; place-items: center; text-align: center; font: 700 27px/1.12 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; letter-spacing: .04em; }

  /* cp9 */
  .b03-cp9-rows { position: absolute; left: 80px; top: 162px; width: 936px; display: grid; gap: 22px; }
  .b03-abc { display: grid; grid-template-columns: 234px 1fr; align-items: center; height: 138px; }
  .b03-abc .main { font: 700 36px/1.15 "DM Sans", sans-serif; color: #0d1e3a; margin: 0; }
  .b03-abc .sub { font: 600 24px/1.3 "DM Sans", sans-serif; color: #667389; margin: 6px 0 0; }
  .b03-blk { position: relative; width: 132px; height: 132px; justify-self: center; }
  .b03-blk > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .b03-blk .lt { position: absolute; left: 6.7%; top: 26.7%; width: 66.6%; height: 66.6%; display: grid; place-items: center; font: 700 64px/1 "Cormorant Garamond", Georgia, serif; }
  .b03-cp9-r { position: absolute; left: 1040px; top: 170px; width: 470px; text-align: center; }
  .b03-cp9-r .easy { font: 600 52px/1.1 "Cormorant Garamond", Georgia, serif; font-style: italic; color: #8a6e22; margin: 20px 0 0; }
  .b03-tower { position: absolute; left: 1135px; top: 300px; width: 300px; height: 520px; }
  .b03-tower .b03-blk { position: absolute; width: 168px; height: 168px; }
  .b03-tower .b03-blk .lt { font-size: 82px; }

  /* cp10 */
  .b03-cp10-h { position: absolute; left: 120px; width: 1360px; top: 44px; text-align: center; margin: 0; font: 600 58px/1.08 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; text-wrap: balance; }
  .b03-cp10-c1 { position: absolute; left: 184px; width: 1232px; top: 210px; padding: 24px 40px; text-align: center; box-sizing: border-box; }
  .b03-cp10-c1 p { margin: 0; font: 700 32px/1.35 "DM Sans", sans-serif; }
  .b03-cp10-c1 .num { color: #8a6e22; }
  .b03-cp10-ct { position: absolute; left: 160px; top: 368px; margin: 0; font: 600 46px/1 "Cormorant Garamond", Georgia, serif; font-style: italic; color: #0d1e3a; }
  .b03-cp10-c2 { position: absolute; left: 200px; width: 1200px; top: 432px; padding: 22px 40px; text-align: center; box-sizing: border-box; border: 2px solid #b8972e; background: linear-gradient(180deg, #fffdf8, #f9f1d9); }
  .b03-cp10-c2 p { margin: 0; font: 700 34px/1.3 "DM Sans", sans-serif; }
  .b03-cp10-c2 .num { font-size: 46px; color: #0d1e3a; }
  .b03-cp10-fn { position: absolute; left: 160px; top: 584px; width: 700px; display: grid; gap: 8px; }
  .b03-cp10-fn p { margin: 0; font: 600 17px/1.45 "DM Sans", sans-serif; color: #44516a; }
  .b03-piggy { left: 880px; top: 566px; width: 610px; height: 241px; }

  /* cp11 */
  .b03-owl { left: 96px; top: 170px; width: 470px; height: 548px; }
  .b03-board { position: absolute; left: 640px; top: 140px; width: 850px; height: 420px; box-sizing: border-box; border-radius: 10px; padding: 18px; background: linear-gradient(135deg, #a8843a, #7a5c1f); box-shadow: 0 24px 40px rgba(13,30,58,.22), inset 0 2px 0 rgba(255,255,255,.25); }
  .b03-board .in { position: absolute; inset: 18px; border-radius: 4px; background: radial-gradient(120% 120% at 30% 20%, #23406c 0%, #14284a 55%, #0d1e3a 100%); box-shadow: inset 0 0 40px rgba(0,0,0,.35); display: grid; place-items: center; text-align: center; }
  .b03-board .in p { margin: 0; font: 600 56px/1.16 "Cormorant Garamond", Georgia, serif; color: #f7f5f1; text-shadow: 0 0 1px rgba(247,245,241,.6); letter-spacing: .01em; }
  .b03-board .in .w { color: #d5bd68; letter-spacing: .04em; }
  .b03-board .tray { position: absolute; left: 70px; right: 70px; bottom: -14px; height: 16px; border-radius: 4px; background: #6d5219; }
  .b03-board .chalk { position: absolute; bottom: -10px; height: 9px; width: 56px; border-radius: 4px; background: #f7f5f1; }
  .b03-cp11-card { position: absolute; left: 600px; width: 890px; top: 640px; padding: 26px 40px; text-align: center; box-sizing: border-box; }
  .b03-cp11-card p { margin: 0; font: 700 30px/1.32 "DM Sans", sans-serif; }

  /* cp12 */
  .b03-cp12-card { position: absolute; left: 80px; top: 262px; width: 930px; padding: 34px 40px; display: grid; gap: 30px; box-sizing: border-box; }
  .b03-calc { left: 1086px; top: 236px; width: 420px; height: 566px; }
  .b03-cp12-btns { position: absolute; left: 80px; top: 752px; display: flex; gap: 22px; }

  /* cpf */
  .b03-cpf-panel { position: absolute; left: 892px; top: 42px; width: 650px; display: grid; gap: 14px; }
  .b03-cpf-panel .st-h1 { font-size: 58px; }
  .b03-cpf-panel .st-h3 { font-size: 30px; font-weight: 600; color: #44516a; margin-bottom: 12px; }
  .b03-cpf-rows { display: grid; gap: 22px; }
  .b03-cpf-c { padding: 18px 24px; font: 600 24px/1.32 "DM Sans", sans-serif; color: #0d1e3a; width: 520px; box-sizing: border-box; }
  .b03-cpf-c b { color: #8a6e22; font-weight: 700; }
  .b03-cpf-wait { position: absolute; left: 60px; top: 380px; width: 760px; text-align: center; }
  .b03-fact { position: absolute; left: 922px; top: 330px; width: 266px; padding: 16px 20px 18px; z-index: 6; box-sizing: border-box; transition: transform 1s ease; border: 2px solid #b8972e; }
  .b03-fact.snap { transition: none; }
  .b03-fact h4 { margin: 0 0 8px; text-align: center; font: 700 19px/1.2 "DM Sans", sans-serif; letter-spacing: .06em; text-decoration: underline; text-underline-offset: 4px; text-decoration-color: #b8972e; }
  .b03-fact ol { margin: 0; padding-left: 26px; display: grid; gap: 4px; font: 600 17px/1.3 "DM Sans", sans-serif; }

  /* cpb1 */
  .b03-cpb-hd { position: absolute; top: 158px; font: 700 26px/1 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #8a6e22; text-align: center; }
  .b03-cpb-acc { position: absolute; left: 120px; top: 206px; width: 520px; padding: 22px 0; display: grid; gap: 4px; text-align: center; box-sizing: border-box; }
  .b03-acc { display: block; margin: 0 auto; padding: 8px 18px; border-radius: 10px; font: 700 29px/1.25 "DM Sans", sans-serif; color: #a3abb8; cursor: pointer; transition: color .3s ease, background .3s ease, opacity .8s ease; }
  .b03-acc.is-off { transition: opacity .3s ease; }
  .b03-acc:hover { color: #44516a; }
  .b03-acc.sel { color: #8a6e22; background: #f6eed6; }
  .b03-cpb-ben { position: absolute; left: 664px; top: 206px; width: 816px; display: grid; }
  .b03-ben { display: grid; grid-template-columns: 245px 1fr; align-items: center; height: 56px; border-bottom: 1px solid rgba(13,30,58,.1); }
  .b03-ben:last-child { border-bottom: 0; }
  .b03-ben .lb { font: 700 27px/1.15 "DM Sans", sans-serif; color: #0d1e3a; }
  .b03-ben .lb small { font: 500 18px/1 "DM Sans", sans-serif; color: #667389; margin-left: 8px; }
  .b03-ben .mk { display: grid; place-items: center; }
  .b03-yes { display: inline-flex; align-items: center; gap: 6px; padding: 7px 20px; border-radius: 999px; background: #b8972e; color: #0d1e3a; font: 700 20px/1 "DM Sans", sans-serif; letter-spacing: .14em; transition: opacity .8s ease; }
  .b03-yes.is-off { transition: opacity .3s ease; }
  .b03-yes.state { background: transparent; border: 2px solid #b8972e; color: #8a6e22; letter-spacing: .08em; font-size: 17px; padding: 6px 14px; }
  .b03-cpb-ltd { position: absolute; left: 664px; width: 245px; top: 722px; text-align: center; font: 600 18px/1 "DM Sans", sans-serif; color: #667389; }
  .b03-cpb-disc { position: absolute; left: 120px; width: 1150px; top: 758px; margin: 0; font-size: 13px; line-height: 1.42; }

  /* cps1 */
  .b03-cps { position: absolute; left: 160px; width: 1280px; top: 34px; }
  .b03-cps h1 { text-align: center; margin: 0 0 14px; font-size: 50px; }
  .b03-cps table { width: 100%; border-collapse: separate; border-spacing: 5px; table-layout: fixed; }
  .b03-cps th { font: 700 16px/1.22 "DM Sans", sans-serif; letter-spacing: .06em; text-transform: uppercase; color: #0d1e3a; vertical-align: bottom; padding: 0 4px 8px; text-align: center; }
  .b03-cps td.lb { text-align: right; font: 700 21px/1.15 "DM Sans", sans-serif; color: #0d1e3a; padding-right: 18px; }
  .b03-cps td.c { height: 49px; text-align: center; border-radius: 8px; font: 700 25px/1 "DM Sans", sans-serif; color: #fff; }
  .b03-cps td.c.y { background: #2f6e55; }
  .b03-cps td.c.n { background: #a9432f; }
  .b03-cps td.c.q { background: #b8972e; color: #0d1e3a; }
  .b03-cps td.c sup { font-size: 16px; margin-left: 2px; }
  .b03-cps .fn { margin: 10px 0 0; display: grid; gap: 3px; width: 1120px; }
  .b03-cps .fn p { margin: 0; font: 500 13px/1.42 "DM Sans", sans-serif; color: #667389; }
  .b03-cps .fn p.k { font-size: 14.5px; color: #44516a; font-weight: 600; }
  `);

  /* =====================================================================
     small helpers
     ===================================================================== */
  let uidN = 0;
  const uid = (p) => `b03${p}${++uidN}`;
  const lg = (id, a, b, x2, y2) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2 == null ? 1 : x2}" y2="${y2 == null ? 1 : y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const shade = (cx, cy, rx, ry, o) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(13,30,58,${o || 0.12})"/>`;
  const SK = '#ebd3ae', SK2 = '#d9b88a';

  /** dollar sign drawn as strokes (no glyph), centred on (cx, cy), h = height */
  function dollar(cx, cy, h, color, w) {
    const s = (x, y) => `${(cx + x * h).toFixed(1)},${(cy + y * h).toFixed(1)}`;
    return `<g fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${s(0.25, -0.22)} C${s(0.19, -0.29)} ${s(0.1, -0.32)} ${s(0, -0.32)} C${s(-0.16, -0.32)} ${s(-0.25, -0.24)} ${s(-0.25, -0.15)} C${s(-0.25, -0.04)} ${s(-0.15, -0.01)} ${s(0, 0.02)} C${s(0.16, 0.05)} ${s(0.26, 0.1)} ${s(0.26, 0.18)} C${s(0.26, 0.28)} ${s(0.15, 0.33)} ${s(0, 0.33)} C${s(-0.12, 0.33)} ${s(-0.21, 0.29)} ${s(-0.27, 0.22)}"/>
      <path d="M${s(0, -0.44)} L${s(0, 0.44)}"/></g>`;
  }

  /** first value found at any of the dotted paths under EFA.data */
  function dget(paths) {
    for (const p of paths) {
      let o = EFA.data;
      for (const k of p.split('.')) { if (o == null || typeof o !== 'object') { o = undefined; break; } o = o[k]; }
      if (o != null) return o;
    }
    return null;
  }

  /* =====================================================================
     artwork (flat duotone, drawn in code)
     ===================================================================== */
  const ART = {
    /** cp1: a person, waist up, hand to chin, looking up and away */
    thinker() {
      const id = uid('th');
      return `<svg viewBox="0 0 640 900" aria-hidden="true"><defs>${lg(id + 'a', P.navy3, P.navy, 0, 1)}${lg(id + 'b', P.navy4, P.navy3)}</defs>
        <circle cx="474" cy="232" r="11" fill="${P.goldLt}"/><circle cx="522" cy="172" r="17" fill="${P.gold}"/><circle cx="584" cy="96" r="27" fill="${P.gold}"/>
        <path d="M92,900 L104,712 C108,630 158,580 236,566 L404,566 C482,580 532,630 536,712 L548,900 Z" fill="url(#${id}a)"/>
        <path d="M178,640 C166,720 178,780 214,812 L430,812" fill="none" stroke="url(#${id}b)" stroke-width="78" stroke-linecap="round" stroke-linejoin="round"/>
        <ellipse cx="462" cy="806" rx="40" ry="33" fill="${SK}"/>
        <path d="M286,466 L286,578 C302,592 338,592 354,578 L354,466 Z" fill="${SK2}"/>
        <path d="M252,566 L320,652 L388,566 L366,558 L320,616 L274,558 Z" fill="${P.paper}"/>
        <g transform="rotate(-10 322 388)">
          <ellipse cx="322" cy="390" rx="92" ry="108" fill="${SK}"/>
          <path d="M228,410 C214,322 258,272 324,272 C388,272 424,306 420,356 C398,326 354,312 306,322 C278,328 256,348 248,380 C244,394 238,404 228,410 Z" fill="${P.navy2}"/>
          <ellipse cx="240" cy="402" rx="15" ry="24" fill="${SK2}"/>
          <path d="M334,346 Q352,334 372,342 M388,340 Q402,334 414,342" fill="none" stroke="${P.navy}" stroke-width="6" stroke-linecap="round"/>
          <ellipse cx="354" cy="370" rx="9" ry="11" fill="${P.navy}"/><circle cx="357" cy="365" r="3.4" fill="#fff"/>
          <ellipse cx="400" cy="366" rx="7" ry="10" fill="${P.navy}"/><circle cx="402" cy="362" r="2.6" fill="#fff"/>
          <path d="M392,384 Q410,410 392,418" fill="none" stroke="${SK2}" stroke-width="5" stroke-linecap="round"/>
          <path d="M362,450 Q378,444 394,450" fill="none" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/>
        </g>
        <path d="M474,628 C468,700 456,752 440,792 L368,522" fill="none" stroke="url(#${id}b)" stroke-width="74" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M344,560 L404,540" stroke="${P.gold}" stroke-width="12" stroke-linecap="round"/>
        <path d="M332,524 C322,494 340,470 366,468 C396,466 410,490 406,516 C402,540 382,552 360,550 C346,548 336,538 332,524 Z" fill="${SK}"/>
        <path d="M350,492 C364,488 382,490 394,498 M346,510 C362,506 382,508 400,516" stroke="${SK2}" stroke-width="4" fill="none" stroke-linecap="round"/>
      </svg>`;
    },
    /** cp3: smiling graduate in cap and gown, waist up */
    graduate() {
      const id = uid('gr');
      return `<svg viewBox="0 0 640 900" aria-hidden="true"><defs>${lg(id + 'a', P.navy3, P.navy, 0, 1)}${lg(id + 'b', P.navy4, P.navy3)}${lg(id + 'g', P.goldLt, P.gold)}</defs>
        <path d="M212,566 C192,470 204,332 248,288 C280,258 360,258 392,288 C436,332 448,470 428,566 C402,590 362,580 352,546 L288,546 C278,580 238,590 212,566 Z" fill="${P.navy2}"/>
        <path d="M74,900 L94,700 C100,622 150,578 228,566 L412,566 C490,578 540,622 546,700 L566,900 Z" fill="url(#${id}a)"/>
        <path d="M244,566 L292,576 L272,900 L214,900 Z" fill="url(#${id}g)"/><path d="M396,566 L348,576 L368,900 L426,900 Z" fill="url(#${id}g)"/>
        <path d="M282,566 L320,630 L358,566 Z" fill="${P.paper}"/>
        <path d="M290,476 L290,574 C304,588 336,588 350,574 L350,476 Z" fill="${SK2}"/>
        <circle cx="320" cy="400" r="98" fill="${SK}"/>
        <path d="M224,392 C228,324 268,298 320,298 C374,298 412,326 416,392 C392,356 354,342 320,352 C288,342 248,356 224,392 Z" fill="${P.navy2}"/>
        <path d="M276,410 Q292,392 308,410 M332,410 Q348,392 364,410" fill="none" stroke="${P.navy}" stroke-width="7" stroke-linecap="round"/>
        <circle cx="266" cy="440" r="15" fill="${P.goldLt}" opacity=".45"/><circle cx="374" cy="440" r="15" fill="${P.goldLt}" opacity=".45"/>
        <path d="M284,442 Q320,484 356,442 Q320,458 284,442 Z" fill="${P.navy}"/><path d="M296,448 Q320,456 344,448 L342,452 Q320,460 298,452 Z" fill="#fff"/>
        <path d="M238,340 C242,304 274,288 320,288 C366,288 398,304 402,340 C376,326 264,326 238,340 Z" fill="${P.navy}"/>
        <path d="M182,302 L320,250 L458,302 L320,354 Z" fill="${P.navy2}"/>
        <path d="M182,302 L320,250 L458,302" fill="none" stroke="${P.navy4}" stroke-width="5" stroke-linejoin="round"/>
        <circle cx="320" cy="302" r="9" fill="${P.gold}"/>
        <path d="M320,302 L450,308 L452,374" fill="none" stroke="${P.gold}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M444,372 L460,372 L468,418 L436,418 Z" fill="${P.gold}"/>
        <path d="M150,640 C140,700 160,752 210,772 L252,744 M490,640 C500,700 480,752 430,772 L388,744" fill="none" stroke="url(#${id}b)" stroke-width="70" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="232" y="716" width="178" height="46" rx="23" fill="${P.paper}" stroke="${P.navy}" stroke-width="4"/>
        <ellipse cx="406" cy="739" rx="10" ry="22" fill="${P.mist}" stroke="${P.navy}" stroke-width="3"/>
        <rect x="312" y="714" width="18" height="50" fill="${P.gold}"/>
        <path d="M321,762 L306,800 M321,762 L338,798" stroke="${P.gold}" stroke-width="7" stroke-linecap="round"/>
        <circle cx="250" cy="744" r="27" fill="${SK}"/><circle cx="390" cy="744" r="27" fill="${SK}"/>
      </svg>`;
    },
    /** cp2/cp3: one banded bundle of bills (a flat brick seen from the front and above) */
    bundle() {
      return `<svg viewBox="0 0 400 170" aria-hidden="true">
        <path d="M330,102 L374,62 L374,126 L330,166 Z" fill="${P.mist2}" stroke="${P.navy}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M334,116 L370,83 M334,130 L370,97 M334,144 L370,111" stroke="${P.paper}" stroke-width="2.5" opacity=".8"/>
        <rect x="28" y="102" width="302" height="64" fill="${P.paper}" stroke="${P.navy}" stroke-width="3"/>
        <path d="M31,115 H327 M31,128 H327 M31,141 H327 M31,154 H327" stroke="${P.mist2}" stroke-width="2.5"/>
        <path d="M28,102 L72,62 L374,62 L330,102 Z" fill="${P.goldPale}" stroke="${P.navy}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M58,96 L88,68 L348,68 L318,96 Z" fill="none" stroke="${P.gold}" stroke-width="2.5"/>
        <ellipse cx="268" cy="82" rx="34" ry="10" fill="${P.paper}" stroke="${P.goldDeep}" stroke-width="2.5"/>
        <path d="M118,102 L162,62 L204,62 L160,102 Z" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="2" stroke-linejoin="round"/>
        <rect x="118" y="102" width="42" height="64" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="2"/>
        ${dollar(139, 134, 40, P.navy, 4.5)}
      </svg>`;
    },
    /** cp4: spiral notepad with ticked lines and a pencil */
    notepad() {
      const rows = [0, 1, 2, 3, 4, 5].map((j) => {
        const y = 196 + j * 62;
        return `<rect x="88" y="${y - 20}" width="40" height="40" rx="9" fill="#fff" stroke="${P.navy}" stroke-width="5"/>
          ${j < 5 ? `<path d="M95,${y} L106,${y + 12} L127,${y - 16}" fill="none" stroke="${P.gold}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
          <path d="M150,${y} H${j % 2 ? 300 : 342}" stroke="${P.mist2}" stroke-width="12" stroke-linecap="round"/>`;
      }).join('');
      const rings = [0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${86 + i * 44}" y="48" width="16" height="60" rx="8" fill="none" stroke="${P.navy4}" stroke-width="6"/>`).join('');
      return `<svg viewBox="0 0 440 600" aria-hidden="true">${shade(220, 586, 170, 12)}
        <g transform="rotate(-5 220 320)">
          <rect x="52" y="74" width="340" height="486" rx="20" fill="${P.paper}" stroke="${P.navy}" stroke-width="6"/>
          <path d="M52,140 V94 a20,20 0 0 1 20,-20 H372 a20,20 0 0 1 20,20 V140 Z" fill="${P.navy3}"/>
          ${rings}${rows}
        </g>
        <g transform="rotate(24 392 330)">
          <rect x="378" y="172" width="30" height="258" rx="4" fill="${P.gold}"/><rect x="378" y="172" width="30" height="34" rx="4" fill="${P.navy4}"/>
          <path d="M393,190 V420" stroke="${P.goldDeep}" stroke-width="3" opacity=".55"/>
          <path d="M378,430 L393,476 L408,430 Z" fill="${P.goldPale}"/><path d="M388,462 L393,476 L398,462 Z" fill="${P.navy}"/>
        </g>
      </svg>`;
    },
    /** cp5: a large three-dimensional question mark */
    qmark() {
      const id = uid('qm');
      const d = 'M104,196 C104,104 166,56 230,56 C302,56 346,108 346,166 C346,228 302,256 264,282 C236,302 228,326 228,376';
      const back = [12, 24].map((o) => `<g transform="translate(${o},${o * 0.8})"><path d="${d}" fill="none" stroke="${P.goldDeep}" stroke-width="86" stroke-linecap="round" stroke-linejoin="round"/><circle cx="228" cy="496" r="52" fill="${P.goldDeep}"/></g>`).join('');
      return `<svg viewBox="0 0 420 600" aria-hidden="true"><defs>${lg(id, P.goldLt, P.gold)}</defs>${shade(232, 582, 132, 13)}
        ${back}
        <path d="${d}" fill="none" stroke="url(#${id})" stroke-width="86" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="228" cy="496" r="52" fill="url(#${id})"/>
        <path d="M134,176 C138,124 178,92 228,90" fill="none" stroke="${P.goldPale}" stroke-width="15" stroke-linecap="round" opacity=".85"/>
        <circle cx="212" cy="478" r="13" fill="${P.goldPale}" opacity=".85"/>
      </svg>`;
    },
    /** cp6/cp7: cloth money bag with a dollar sign */
    bag() {
      const id = uid('bg');
      return `<svg viewBox="0 0 300 340" aria-hidden="true"><defs>${lg(id + 'a', P.navy4, P.navy)}${lg(id + 'b', P.navy3, P.navy2, 0, 1)}</defs>
        ${shade(150, 330, 118, 10)}
        <path d="M112,98 C58,124 20,184 24,240 C28,302 82,326 150,326 C218,326 272,302 276,240 C280,184 242,124 188,98 Z" fill="url(#${id}a)"/>
        <path d="M120,96 C100,74 92,52 104,34 C118,44 128,38 136,26 C144,40 156,40 164,26 C172,38 182,44 196,34 C208,52 200,74 180,96 Z" fill="url(#${id}b)"/>
        <path d="M66,168 C50,196 48,226 58,254" fill="none" stroke="rgba(255,253,248,.2)" stroke-width="12" stroke-linecap="round"/>
        <rect x="104" y="86" width="92" height="18" rx="9" fill="${P.gold}"/>
        <path d="M150,95 C138,80 120,78 120,90 C120,102 140,100 150,95 Z M150,95 C162,80 180,78 180,90 C180,102 160,100 150,95 Z" fill="${P.goldLt}" stroke="${P.goldDeep}" stroke-width="2"/>
        <path d="M146,98 L136,124 M154,98 L166,122" stroke="${P.gold}" stroke-width="6" stroke-linecap="round"/>
        ${dollar(150, 222, 128, P.gold, 15)}
      </svg>`;
    },
    /** cp8: coin jar with a rolled bill, standing on a closed book (label text sits over it in HTML) */
    jar() {
      const id = uid('jr');
      const coins = [[214, 556], [262, 560], [310, 556], [356, 560], [236, 532], [286, 534], [334, 532], [262, 508], [312, 510]]
        .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="30" ry="11" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="3"/>`).join('');
      return `<svg viewBox="0 0 560 700" aria-hidden="true"><defs>${lg(id + 'g', P.goldLt, P.gold)}</defs>
        ${shade(270, 682, 236, 14)}
        <path d="M30,614 L92,574 L520,574 L458,614 Z" fill="${P.navy3}"/>
        <path d="M60,606 L102,580 L494,580" fill="none" stroke="${P.gold}" stroke-width="3" opacity=".8"/>
        <path d="M458,614 L520,574 L520,630 L458,672 Z" fill="${P.navy2}"/>
        <rect x="30" y="614" width="428" height="32" fill="${P.paper}" stroke="${P.navy}" stroke-width="4"/>
        <path d="M34,624 H454 M34,634 H454" stroke="${P.mist2}" stroke-width="2"/>
        <rect x="26" y="644" width="436" height="26" rx="5" fill="${P.navy}"/>
        <rect x="148" y="226" width="264" height="364" rx="58" fill="rgba(227,232,240,.6)" stroke="${P.navy}" stroke-width="6"/>
        ${coins}
        <g transform="rotate(-24 300 330)"><rect x="196" y="302" width="210" height="46" rx="23" fill="${P.goldPale}" stroke="${P.navy}" stroke-width="4"/><ellipse cx="404" cy="325" rx="10" ry="21" fill="${P.paper}" stroke="${P.navy}" stroke-width="3"/><rect x="290" y="300" width="20" height="50" fill="${P.navy3}"/></g>
        <rect x="166" y="380" width="228" height="104" rx="12" fill="${P.paper}" stroke="${P.navy}" stroke-width="4"/>
        <rect x="174" y="388" width="212" height="88" rx="8" fill="none" stroke="${P.gold}" stroke-width="2"/>
        <path d="M178,282 C170,360 170,470 180,548" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" opacity=".75"/>
        <rect x="168" y="196" width="224" height="40" rx="10" fill="${P.mist}" stroke="${P.navy}" stroke-width="6"/>
        <rect x="156" y="148" width="248" height="56" rx="14" fill="url(#${id}g)" stroke="${P.goldDeep}" stroke-width="4"/>
        <path d="M184,156 V196 M212,156 V196 M240,156 V196 M320,156 V196 M348,156 V196 M376,156 V196" stroke="${P.goldDeep}" stroke-width="3" opacity=".45"/>
        <rect x="236" y="168" width="88" height="13" rx="6.5" fill="${P.navy}"/>
        <ellipse cx="280" cy="126" rx="26" ry="9" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="3"/>
      </svg>`;
    },
    JAR_LABEL: { x: 174 / 560, y: 388 / 700, w: 212 / 560, h: 88 / 700 },
    /** cp9: one wooden alphabet block (the letter sits over it in HTML) */
    block(face, top, side) {
      return `<svg viewBox="0 0 150 150" aria-hidden="true">
        <path d="M10,40 L40,10 L140,10 L110,40 Z" fill="${top}"/>
        <path d="M110,40 L140,10 L140,110 L110,140 Z" fill="${side}"/>
        <rect x="10" y="40" width="100" height="100" fill="${face}"/>
        <rect x="19" y="49" width="82" height="82" rx="7" fill="none" stroke="rgba(255,253,248,.5)" stroke-width="4"/>
        <path d="M10,40 L40,10 L140,10 L140,110 L110,140 L10,140 Z M10,40 H110 V140 M110,40 L140,10" fill="none" stroke="rgba(13,30,58,.28)" stroke-width="2" stroke-linejoin="round"/>
      </svg>`;
    },
    /** cp10: piggy bank resting on a spill of cash */
    piggy() {
      const id = uid('pg');
      const bills = [[70, 256, -10], [170, 270, 8], [262, 262, -4], [440, 268, 6], [548, 258, -9], [640, 270, 11], [350, 276, -2]]
        .map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 62}" y="${y - 22}" width="124" height="46" rx="5" fill="${P.paper}" stroke="${P.navy}" stroke-width="3"/><rect x="${x - 54}" y="${y - 15}" width="108" height="32" rx="3" fill="none" stroke="${P.gold}" stroke-width="2"/><ellipse cx="${x}" cy="${y + 1}" rx="14" ry="10" fill="${P.goldPale}" stroke="${P.goldDeep}" stroke-width="2"/></g>`).join('');
      const coins = [[118, 236], [600, 236], [690, 232], [212, 240]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="24" ry="9" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="3"/><ellipse cx="${x}" cy="${y - 9}" rx="24" ry="9" fill="${P.goldLt}" stroke="${P.goldDeep}" stroke-width="3"/>`).join('');
      return `<svg viewBox="0 0 760 300" aria-hidden="true"><defs>${lg(id, P.goldLt, P.gold)}</defs>
        ${shade(380, 286, 340, 12)}${bills}${coins}
        <path d="M244,150 C214,148 206,118 226,108 C242,100 252,118 238,128" fill="none" stroke="${P.goldDeep}" stroke-width="7" stroke-linecap="round"/>
        <rect x="290" y="196" width="44" height="58" rx="14" fill="${P.gold}"/><rect x="444" y="196" width="44" height="58" rx="14" fill="${P.gold}"/>
        <ellipse cx="384" cy="150" rx="156" ry="104" fill="url(#${id})"/>
        <rect x="320" y="200" width="44" height="54" rx="14" fill="${P.goldLt}"/><rect x="414" y="200" width="44" height="54" rx="14" fill="${P.goldLt}"/>
        <path d="M444,66 L462,18 L494,72 Z" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="4" stroke-linejoin="round"/>
        <ellipse cx="540" cy="160" rx="38" ry="33" fill="${P.goldLt}" stroke="${P.goldDeep}" stroke-width="4"/>
        <ellipse cx="530" cy="160" rx="6" ry="9" fill="${P.goldDeep}"/><ellipse cx="552" cy="160" rx="6" ry="9" fill="${P.goldDeep}"/>
        <circle cx="486" cy="116" r="9" fill="${P.navy}"/><circle cx="489" cy="113" r="3" fill="#fff"/>
        <rect x="346" y="50" width="80" height="13" rx="6.5" fill="${P.navy}" transform="rotate(-6 386 56)"/>
        <ellipse cx="388" cy="22" rx="26" ry="9" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="3"/>
        <path d="M300,108 C318,84 350,72 380,70" fill="none" stroke="${P.goldPale}" stroke-width="12" stroke-linecap="round" opacity=".8"/>
      </svg>`;
    },
    /** cp11: a wise owl on a branch, one wing raised toward the board */
    owl() {
      const id = uid('ow');
      const scal = [0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => { const x = 186 + c * 36 - (r % 2) * 18, y = 322 + r * 40; return `<path d="M${x - 14},${y} Q${x},${y + 16} ${x + 14},${y}" fill="none" stroke="${P.navy4}" stroke-width="4" stroke-linecap="round" opacity=".45"/>`; }).join('')).join('');
      return `<svg viewBox="0 0 480 560" aria-hidden="true"><defs>${lg(id + 'a', P.navy3, P.navy)}${lg(id + 'g', P.goldLt, P.gold)}</defs>
        <path d="M0,506 C130,476 300,482 480,454" fill="none" stroke="${P.goldDeep}" stroke-width="26" stroke-linecap="round"/>
        <ellipse cx="62" cy="474" rx="30" ry="12" transform="rotate(-24 62 474)" fill="${P.navy4}"/><ellipse cx="436" cy="440" rx="30" ry="12" transform="rotate(20 436 440)" fill="${P.navy4}"/>
        <path d="M352,262 C408,226 448,170 462,104 C430,140 404,160 372,178 C390,150 398,122 394,92 C372,130 352,160 336,194 Z" fill="${P.navy4}"/>
        <path d="M240,124 C334,124 384,206 384,322 C384,432 322,494 240,494 C158,494 96,432 96,322 C96,206 146,124 240,124 Z" fill="url(#${id}a)"/>
        <path d="M152,176 L128,94 L198,144 Z M328,176 L352,94 L282,144 Z" fill="${P.navy3}"/>
        <path d="M240,256 C302,256 338,316 338,384 C338,444 298,478 240,478 C182,478 142,444 142,384 C142,316 178,256 240,256 Z" fill="${P.paper}"/>
        ${scal}
        <path d="M104,264 C68,334 84,424 140,460 C128,394 130,324 150,272 Z" fill="${P.navy4}"/>
        <circle cx="190" cy="222" r="62" fill="${P.navy4}"/><circle cx="290" cy="222" r="62" fill="${P.navy4}"/>
        <circle cx="190" cy="222" r="47" fill="${P.paper}" stroke="url(#${id}g)" stroke-width="9"/><circle cx="290" cy="222" r="47" fill="${P.paper}" stroke="url(#${id}g)" stroke-width="9"/>
        <circle cx="203" cy="214" r="21" fill="${P.navy}"/><circle cx="303" cy="214" r="21" fill="${P.navy}"/>
        <circle cx="210" cy="206" r="6.5" fill="#fff"/><circle cx="310" cy="206" r="6.5" fill="#fff"/>
        <path d="M224,254 L256,254 L240,290 Z" fill="${P.gold}"/>
        <path d="M196,490 l-10,22 M208,492 l0,24 M220,490 l10,22 M262,490 l-10,22 M274,492 l0,24 M286,490 l10,22" stroke="${P.gold}" stroke-width="8" stroke-linecap="round"/>
        <path d="M184,128 C188,104 210,94 240,94 C270,94 292,104 296,128 C276,118 204,118 184,128 Z" fill="${P.navy}"/>
        <path d="M150,104 L240,70 L330,104 L240,138 Z" fill="${P.navy2}" stroke="${P.navy4}" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="240" cy="104" r="6" fill="${P.gold}"/><path d="M240,104 L322,110 L324,152" fill="none" stroke="${P.gold}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M316,150 L332,150 L338,178 L310,178 Z" fill="${P.gold}"/>
      </svg>`;
    },
    /** cp12: calculator with cash and a graduation cap */
    calc() {
      const id = uid('ca');
      const keys = [];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
        const x = 124 + c * 56, y = 340 + r * 50;
        const fill = c === 3 ? P.gold : r === 0 ? P.navy4 : P.paper;
        keys.push(`<rect x="${x}" y="${y}" width="44" height="38" rx="9" fill="${fill}"/>`);
      }
      const bill = (x, y, r) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 80}" y="${y - 34}" width="160" height="68" rx="6" fill="${P.paper}" stroke="${P.navy}" stroke-width="3"/><rect x="${x - 70}" y="${y - 25}" width="140" height="50" rx="4" fill="none" stroke="${P.gold}" stroke-width="2.5"/><ellipse cx="${x}" cy="${y}" rx="18" ry="14" fill="${P.goldPale}" stroke="${P.goldDeep}" stroke-width="2.5"/></g>`;
      return `<svg viewBox="0 0 460 620" aria-hidden="true"><defs>${lg(id, P.navy3, P.navy)}</defs>
        ${shade(236, 604, 196, 14)}
        ${bill(116, 300, -28)}${bill(356, 300, 24)}${bill(236, 262, -6)}
        <rect x="96" y="212" width="276" height="382" rx="30" fill="url(#${id})"/>
        <rect x="120" y="236" width="228" height="76" rx="12" fill="${P.mist}"/>
        <path d="M140,292 H328" stroke="${P.gold}" stroke-width="4" stroke-linecap="round" opacity=".7"/>
        ${keys.join('')}
        <path d="M150,186 C154,160 186,150 236,150 C286,150 318,160 322,186 C296,176 176,176 150,186 Z" fill="${P.navy}"/>
        <path d="M96,154 L236,104 L376,154 L236,204 Z" fill="${P.navy2}" stroke="${P.navy4}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="236" cy="154" r="9" fill="${P.gold}"/>
        <path d="M236,154 L366,160 L370,236" fill="none" stroke="${P.gold}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M362,234 L378,234 L386,282 L354,282 Z" fill="${P.gold}"/>
        <ellipse cx="404" cy="584" rx="34" ry="11" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="3"/><ellipse cx="404" cy="572" rx="34" ry="11" fill="${P.goldLt}" stroke="${P.goldDeep}" stroke-width="3"/><ellipse cx="404" cy="560" rx="34" ry="11" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="3"/>
      </svg>`;
    }
  };

  /* bullets: the shared dart (js/lib/bullets.js); until it loads, rows show without the glyph */
  function dart(size) { const B = lib('bullets'); return `<span class="b03-dartbox" style="width:${size}px;height:${Math.round(size * 66 / 90)}px">${B ? B.dart({ size }) : ''}</span>`; }
  /** a bullet row revealed from step `at` (inclusive) */
  function brow(inner, at, size, extra) { return `<div class="b03-lrow b03-f" data-b03at="${at}" ${extra || ''}>${dart(size)}${inner}</div>`; }
  function breveal(ctx, n) { ctx.$$('[data-b03at]').forEach((el) => ctx.show(el, +el.dataset.b03at <= n)); }
  /** compliance line from the shared disclosure topics (js/lib/overlays.js) */
  function disc(topics, style) { const D = lib('disclosure'); return D ? D.line(topics, { style }) : ''; }
  /** one disclosure topic's editable text, inline */
  function discHtml(topic) { const D = lib('disclosure'); return D && D.html ? D.html(topic) : ''; }

  /* =====================================================================
     College Planning scenario (shared by cp3, cp6, cp7, cp10; CE reuses cp6 and cp7)
     ===================================================================== */
  const CP = {
    g: 0.06, r: 0.05, R: 20, ages: [45, 46], retireAge: 65, income: 175000, savings: 138000,
    s1: { start: 1, years: 5, kind: 'pub' }, s2: { start: 3, years: 4, kind: 'priv' }
  };
  /** today's average annual cost of attendance from EFA.data (College Board), or null while unverified */
  function collegeData() {
    const pub = dget(['college.coa.publicInState', 'college.coaPublicInState', 'college.costPublic', 'college.publicInState', 'education.coa.publicInState']);
    const priv = dget(['college.coa.privateNonprofit', 'college.coaPrivateNonprofit', 'college.costPrivate', 'college.privateNonprofit', 'education.coa.privateNonprofit']);
    if (!(pub > 0) || !(priv > 0)) return null;
    const c = (EFA.data && (EFA.data.college || EFA.data.education)) || {};
    return { pub, priv, year: c.year || c.awardYear || '', edition: c.edition || c.title || '', publisher: c.publisher || c.source || '',
      growth: c.growth || null };
  }
  /** the CP math: cp3 (payments) and cp7 (each payment grown at r to the end of year R) */
  function collegeCalc(pub, priv, o) {
    o = Object.assign({}, CP, o || {});
    const pays = [];
    for (let k = o.s1.start; k < o.s1.start + o.s1.years; k++) pays.push({ k, who: 1, amt: pub * Math.pow(1 + o.g, k) });
    for (let k = o.s2.start; k < o.s2.start + o.s2.years; k++) pays.push({ k, who: 2, amt: priv * Math.pow(1 + o.g, k) });
    const s1 = pays.filter((p) => p.who === 1).reduce((s, p) => s + p.amt, 0);
    const s2 = pays.filter((p) => p.who === 2).reduce((s, p) => s + p.amt, 0);
    const impact = pays.reduce((s, p) => s + p.amt * Math.pow(1 + o.r, o.R - p.k + 1), 0);
    return { s1: Math.round(s1), s2: Math.round(s2), total: Math.round(s1 + s2), impact: Math.round(impact), pays };
  }
  EFA.engines.college = { scenario: CP, calc: collegeCalc, data: collegeData };
  const pend = (ctx) => `<span class="b03-pend">${ctx.t('pending')}</span>`;
  const PENDING = 'Figures being verified';

  /* ---------- cp1 ---------- */
  EFA.screen('cp1', {
    title: 'Understand before you plan',
    copy: {
      statement: 'To plan well for anything, you first have to understand it fully.',
      _notes: 'College is one of the largest purchases a family ever makes, and most families plan for it without ever seeing the full price.\n\n- Ask: How clear is your picture today of what college will really cost your family?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b03-ill b03-cp1-fig">${ART.thinker()}</div>
        <div class="b03-cp1-txt"><hr class="st-rule">${ctx.t('statement', { tag: 'p', cls: 'b03-quote' })}<hr class="st-rule"></div>`;
    }
  });

  /* ---------- cp2 ---------- */
  EFA.screen('cp2', {
    title: 'College costs keep climbing',
    steps: 3,
    copy: {
      heading: "Today's Cost of a College Education",
      p0a: 'College costs rise', p0b: 'to', p0c: 'every year',
      p1a: 'Public, in-state schools: about', p1b: 'a year',
      p2a: 'Private schools: about', p2b: 'a year',
      p0soft: 'College costs go up nearly every year',
      p1soft: 'Public, in-state schools climb year after year',
      p2soft: 'Private schools climb too, from a much higher starting price',
      src: 'Source:', pending: 'Current College Board figures are being verified',
      _notes: 'Every year you wait, the price of college moves. Savings set aside today are chasing a moving target.\n\n- Each click adds a fact and a stack of savings falls away.\n- Ask: If the price keeps climbing like this, how far will the money you have set aside really go?\nPAUSE'
    },
    render(ctx) {
      const d = collegeData(), g = d && d.growth;
      const has = g && Array.isArray(g.all) && g.publicInState > 0 && g.privateNonprofit > 0;
      const pct1 = (f) => num(F.pct(f, f * 100 % 1 ? 1 : 0));
      const pts = has
        ? [`${ctx.t('p0a')} ${pct1(g.all[0])} ${ctx.t('p0b')} ${pct1(g.all[1])} ${ctx.t('p0c')}`,
           `${ctx.t('p1a')} ${pct1(g.publicInState)} ${ctx.t('p1b')}`,
           `${ctx.t('p2a')} ${pct1(g.privateNonprofit)} ${ctx.t('p2b')}`]
        : [ctx.t('p0soft'), ctx.t('p1soft'), ctx.t('p2soft')];
      const bundles = [0, 1, 2, 3, 4].map((k) => `<div class="b03-bund b03-shadow" data-bund="${k}" style="top:${900 - 34 - 200 - k * 74}px;z-index:${k + 1}">${ART.bundle()}</div>`).join('');
      ctx.el.innerHTML = `<div class="b03-head">${ctx.t('heading', { tag: 'h1', cls: 'st-h1' })}</div>
        ${bundles}
        <div class="b03-cp2-rows">${pts.map((h, i) => brow(`<div class="b03-card b03-pt b03-xl">${h}</div>`, i, 64)).join('')}</div>
        <p class="b03-src b03-m b03-f" data-b03at="2">${has ? `${ctx.t('src')} ${ctx.esc([d.publisher, d.edition, d.year].filter(Boolean).join(', '))}` : `<span class="b03-pend">${ctx.t('pending')}</span>`}</p>`;
    },
    step(ctx, n, dir) {
      breveal(ctx, n);
      ctx.$$('[data-bund]').forEach((b) => {
        const k = +b.dataset.bund, gone = k >= 4 - n, wasGone = b.classList.contains('drop');
        const fall = 900 - parseFloat(b.style.top) + 40;
        if (k === 4 && n === 0 && dir === 0) {
          // the top bundle drops shortly after the screen opens
          b.classList.add('snap'); b.classList.remove('drop'); b.style.transform = 'translateY(0)'; void b.offsetWidth; b.classList.remove('snap');
          ctx.timeout(() => { b.classList.add('drop'); b.style.transform = `translateY(${fall}px)`; }, 500);
          return;
        }
        if (gone && !wasGone) { b.classList.add('drop'); b.style.transform = `translateY(${fall}px)`; }
        if (!gone && wasGone) { b.classList.add('snap'); b.classList.remove('drop'); b.style.transform = 'translateY(0)'; void b.offsetWidth; b.classList.remove('snap'); }
      });
    }
  });

  /* ---------- cp3 ---------- */
  EFA.screen('cp3', {
    title: 'Total cost of attendance, two students',
    steps: 2,
    copy: {
      heading: 'The Total Cost of Attendance',
      public_label: 'State School Average', private_label: 'Private School Average', or_label: 'OR',
      includes_note: 'Includes tuition, housing, food, books, travel and personal costs',
      student1_label: 'High school senior', student1_sub: '5 years at a state school',
      student2_label: 'High school sophomore', student2_sub: '4 years at a private school',
      total_label: 'TOTAL, 2 Students',
      assume_a: 'Assumes costs rise', assume_b: 'a year', src: 'Source:',
      pending: PENDING,
      _notes: 'Start with one year at today\'s prices, then follow two children through school while costs keep rising.\n\n- Ask: Had you ever seen your family\'s number added up like this?\nPAUSE'
    },
    render(ctx) {
      const d = collegeData(), c = d ? collegeCalc(d.pub, d.priv) : null;
      const v = (x) => (c ? num(money(x)) : pend(ctx));
      // two small money stacks behind her lower right: one on the floor, one a little higher (behind it)
      const st = (x, bottom, n) => Array.from({ length: n }, (_, k) => `<div class="b03-stack b03-f s1" style="left:${x}px;top:${bottom - 94 - k * 35}px">${ART.bundle()}</div>`).join('');
      const stacks = `<div class="b03-shadow">${st(590, 856, 2)}${st(520, 892, 2)}</div>`;
      ctx.el.innerHTML = `${stacks}<div class="b03-ill b03-grad">${ART.graduate()}</div>
        <div class="b03-cp3-r">
          ${ctx.t('heading', { tag: 'h2', cls: 'st-h2' })}
          <div class="b03-card b03-grid2">
            <div class="lb">${ctx.t('public_label')}</div><div class="v">${d ? num(money(d.pub)) : pend(ctx)}</div>
            <div class="lb or">${ctx.t('or_label')}</div><div></div>
            <div class="lb">${ctx.t('private_label')}</div><div class="v">${d ? num(money(d.priv)) : pend(ctx)}</div>
          </div>
          ${ctx.t('includes_note', { tag: 'p', cls: 'b03-note' })}
          <div class="b03-card b03-grid2 b03-f s1" style="margin-top:8px">
            <div class="lb">${ctx.t('student1_label')}<span class="sm">${ctx.t('student1_sub')}</span></div><div class="v">${v(c && c.s1)}</div>
            <div class="lb">${ctx.t('student2_label')}<span class="sm">${ctx.t('student2_sub')}</span></div><div class="v">${v(c && c.s2)}</div>
            <div class="lb tot">${ctx.t('total_label')}</div><div class="v tot">${v(c && c.total)}</div>
          </div>
          <p class="b03-as b03-f s1">${ctx.t('assume_a')} ${num(F.pct(CP.g, 0))} ${ctx.t('assume_b')}${d ? `<br>${ctx.t('src')} ${ctx.esc([d.publisher, d.edition, d.year].filter(Boolean).join(', '))}` : ''}</p>
          <div class="b03-f s1">${disc(['hypothetical'], 'margin:0;text-align:right')}</div>
        </div>`;
    },
    step(ctx, n) { ctx.show('.s1', n >= 1); }
  });

  /* ---------- cp4 ---------- */
  EFA.screen('cp4', {
    title: 'Two things to know first',
    steps: 4,
    copy: {
      line1: 'Before you make any college decisions,', line2: 'there are TWO things you MUST know:',
      item1: '1.  How much will it cost?', item2: '2.  What will that expense do to all of your other financial goals?',
      goal_a: 'Retirement', goal_b: "Other children's education", goal_c: 'Lifestyle',
      _notes: 'Two questions come before any choice of school or account: what will it cost, and what will paying for it do to everything else.\n\n- Ask: Which of these other goals would you be least willing to give up?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<h1 class="st-h1 b03-cp4-h">${ctx.t('line1')}<span class="l2">${ctx.t('line2')}</span></h1>
        <div class="b03-ill b03-note-pad b03-shadow">${ART.notepad()}</div>
        <div class="b03-card b03-cp4-card b03-f s1">
          ${ctx.t('item1', { tag: 'p', cls: 'it' })}
          ${ctx.t('item2', { tag: 'p', cls: 'it it2 b03-f s2' })}
          <div class="b03-cp4-goals">${['goal_a', 'goal_b', 'goal_c'].map((k) => brow(ctx.t(k, { cls: 'b03-xl' }), 3, 54)).join('')}</div>
        </div>`;
    },
    step(ctx, n) { ctx.show('.s1', n >= 1); ctx.show('.s2', n >= 2); breveal(ctx, n); }
  });

  /* ---------- cp5 ---------- */
  EFA.screen('cp5', {
    title: 'Financial aid myths',
    steps: 9,
    copy: {
      question: 'If something you believe about financial aid turned out to be wrong, when would you want to know?',
      statement: 'NONE OF THESE BELIEFS IS ENTIRELY ACCURATE',
      myth1: '\u201COur income is too high to qualify for aid.\u201D',
      myth2: '\u201CPrivate schools always cost more than public schools.\u201D',
      myth3: '\u201CCarrying debt will help us qualify for more aid.\u201D',
      answer1: 'Income is only one of several factors in the federal aid formula.',
      answer2: 'Private schools often have more aid to give, and their students tend to finish in four years.',
      answer3: 'Consumer debt generally does not improve aid eligibility.',
      _notes: 'Families make expensive decisions based on beliefs about aid that are only partly true.\n\n- Read each belief, let the client react, then reveal the correction.\n- Ask: Which of these have you heard, or said, yourself?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${ctx.t('question', { tag: 'h1', cls: 'b03-cp5-q' })}
        ${ctx.t('statement', { tag: 'p', cls: 'b03-cp5-s b03-f s1' })}
        <div class="b03-ill b03-qm b03-f s1">${ART.qmark()}</div>
        <div class="b03-card b03-cp5-myths b03-f s2">
          ${ctx.t('myth1', { tag: 'p', cls: 'b03-myth m1' })}${ctx.t('myth2', { tag: 'p', cls: 'b03-myth m2' })}${ctx.t('myth3', { tag: 'p', cls: 'b03-myth m3' })}
        </div>
        <div class="b03-card b03-cp5-ans b03-f">
          ${ctx.t('answer1', { tag: 'p', cls: 'tx a1' })}${ctx.t('answer2', { tag: 'p', cls: 'tx a2' })}${ctx.t('answer3', { tag: 'p', cls: 'tx a3' })}
        </div>`;
    },
    step(ctx, n) {
      ctx.show('.s1', n >= 1); ctx.show('.s2', n >= 2);
      ctx.show('.m1', n >= 2); ctx.show('.m2', n >= 4); ctx.show('.m3', n >= 6);
      ctx.$('.m1').classList.toggle('grey', n >= 4 && n <= 7);
      ctx.$('.m2').classList.toggle('grey', n >= 6 && n <= 7);
      const a = { 3: 1, 5: 2, 7: 3 }[n];
      ctx.show('.b03-cp5-ans', !!a);
      if (a) [1, 2, 3].forEach((i) => ctx.$('.a' + i).classList.toggle('is-off', i !== a));
    }
  });

  /* ---------- cp6 (College Expense ce1 shows this screen) ---------- */
  const CP6_DEF = {
    title: 'The example family and the college bill',
    steps: 2,
    copy: {
      heading: 'The Effect of the College Expense',
      parents_a: 'Meet the parents, ages', parents_and: 'and',
      retire_a: 'They plan to retire at age',
      income_label: 'Current combined income', savings_label: 'Non-retirement savings',
      children_heading: 'Two children headed to college',
      kid1: 'High school senior', kid2: 'High school sophomore', years: 'years', school1: 'State school', school2: 'Private school',
      impact_label: 'IMPACT:', impact_desc: 'projected out-of-pocket cost',
      foot_a: 'Hypothetical family. Assumes the cost of attendance rises', foot_b: 'a year.',
      pending: PENDING,
      _notes: 'Here is a family much like many we meet: solid income, real savings, two children a few years apart.\n\n- Click to bring in the bill and watch their savings shrink to meet it.\n- Ask: If this were your family, where would that money come from?\nPAUSE'
    },
    render(ctx) {
      const d = collegeData(), c = d ? collegeCalc(d.pub, d.priv) : null;
      const bag = (cls, x, y, w) => `<div class="b03-bag ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${Math.round(w * 340 / 300)}px">${ART.bag()}</div>`;
      ctx.el.innerHTML = `<div class="b03-head">${ctx.t('heading', { tag: 'h1', cls: 'st-h1' })}</div>
        ${bag('bg1', 150, 900 - 60 - 204, 180)}${bag('bg2', 186, 900 - 225 - 204, 180)}${bag('big', 236, 900 - 70 - 374, 330)}
        <div class="b03-cp6-blk" style="top:148px">
          <h2 class="st-h3">${ctx.t('parents_a')} ${num(CP.ages[0])} ${ctx.t('parents_and')} ${num(CP.ages[1])}</h2>
          <div class="b03-card b03-kv">
            <p class="top">${ctx.t('retire_a')} ${num(CP.retireAge)}</p>
            <div class="row"><span class="k">${ctx.t('income_label')}</span><span class="v">${num(money(CP.income))}</span></div>
            <div class="row"><span class="k">${ctx.t('savings_label')}</span><span class="v">${num(money(CP.savings))}</span></div>
          </div>
        </div>
        <div class="b03-cp6-blk" style="top:392px">
          ${ctx.t('children_heading', { tag: 'h2', cls: 'st-h3' })}
          <div class="b03-card b03-kid">
            <div class="row">${ctx.t('kid1')}<span>${num(CP.s1.years)} ${ctx.t('years')}</span>${ctx.t('school1')}</div>
            <div class="row">${ctx.t('kid2')}<span>${num(CP.s2.years)} ${ctx.t('years')}</span>${ctx.t('school2')}</div>
          </div>
        </div>
        <div class="b03-cp6-imp b03-f s1">
          <div class="b03-sep"></div>
          <div class="b03-card b03-imp">${ctx.t('impact_label', { cls: 'k' })}<span class="v">${c ? num(money(c.total)) : pend(ctx)}</span>${ctx.t('impact_desc', { cls: 'd' })}</div>
          <p class="b03-foot">${ctx.t('foot_a')} ${num(F.pct(CP.g, 0))} ${ctx.t('foot_b')}</p>
        </div>`;
    },
    step(ctx, n) {
      ctx.show('.s1', n >= 1);
      const on = n >= 1;
      const s1 = ctx.$('.b03-bag.bg1'), s2 = ctx.$('.b03-bag.bg2'), big = ctx.$('.b03-bag.big');
      // small bags slide toward the big bag and fade; the big bag shrinks to small size
      const tgtTop = 900 - 171 - 204;
      s1.style.transform = on ? `translate(${352 - 150}px, ${tgtTop - (900 - 60 - 204)}px)` : 'none';
      s2.style.transform = on ? `translate(${352 - 186}px, ${tgtTop - (900 - 225 - 204)}px)` : 'none';
      s1.style.opacity = on ? 0 : 1; s2.style.opacity = on ? 0 : 1;
      big.style.transform = on ? `translate(${176 - 236}px, ${tgtTop - (900 - 70 - 374)}px) scale(${180 / 330})` : 'none';
    }
  };

  EFA.screen('cp6', CP6_DEF);
  EFA.screen('ce1', Object.assign({}, CP6_DEF, { copy: Object.assign({}, CP6_DEF.copy) }));

  /* ---------- cp7 (College Expense ce2 shows this screen) ---------- */
  const retirePres = () => EFA.clients.get('settings', 'retirementPresentation', 'RRON');
  const CP7_DEF = {
    title: 'What the college bill costs at retirement',
    steps: 3,
    copy: {
      heading: 'The Opportunity Cost at Retirement',
      impact_label: 'IMPACT:', question: 'Can you afford this?',
      as1a: 'Money not spent on college earns an assumed', as1b: 'a year',
      as2a: 'Student 1:', as2b: 'years, starting at', as2c: 'a year, rising', as2d: 'a year',
      as3a: 'Student 2:', as3b: 'years, starting at', as3c: 'a year, rising', as3d: 'a year',
      as4a: 'Parents retire in', as4b: 'years',
      pending: PENDING,
      _notes: 'Every dollar that goes to college is a dollar that stops working toward retirement. Here is what that money could have become.\n\n- Ask: Can your retirement plan absorb a number like this?\nPAUSE\n\n- The link opens your retirement readiness presentation. The small arrow icon beside it switches between Retirement Ready or Not and Financial GPS.'
    },
    render(ctx) {
      const d = collegeData(), c = d ? collegeCalc(d.pub, d.priv) : null;
      const key = retirePres() === 'FGPS' ? 'FGPS' : 'RRON';
      const pc = (f) => num(F.pct(f, 0));
      ctx.el.innerHTML = `<div class="b03-head">${ctx.t('heading', { tag: 'h1', cls: 'st-h1' })}</div>
        <div class="b03-cp7-txt">
          <div class="imp b03-f s1">${ctx.t('impact_label', { cls: 'k' })}${c ? num(money(c.impact)) : pend(ctx)}</div>
          ${ctx.t('question', { tag: 'p', cls: 'q b03-f s1' })}
          <div class="lk b03-f s1"><span class="b03-link" data-go="1">${ctx.esc(EFA.presName(key))}</span><span class="sw" data-sw="1" aria-label="Switch retirement presentation"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h13l-3-3M20 15H7l3 3"/></svg></span></div>
        </div>
        <div class="b03-cp7-bagbox"><div class="b03-ill b03-cp7-bag">${ART.bag()}</div></div>
        <div class="b03-card b03-cp7-as b03-f s2">
          <p>${ctx.t('as1a')} ${pc(CP.r)} ${ctx.t('as1b')}</p>
          <p>${ctx.t('as2a')} ${num(CP.s1.years)} ${ctx.t('as2b')} ${d ? num(money(d.pub)) : pend(ctx)} ${ctx.t('as2c')} ${pc(CP.g)} ${ctx.t('as2d')}</p>
          <p>${ctx.t('as3a')} ${num(CP.s2.years)} ${ctx.t('as3b')} ${d ? num(money(d.priv)) : pend(ctx)} ${ctx.t('as3c')} ${pc(CP.g)} ${ctx.t('as3d')}</p>
          <p>${ctx.t('as4a')} ${num(CP.R)} ${ctx.t('as4b')}</p>
        </div>
        ${disc(['hypothetical'], 'position:absolute;left:242px;width:1116px;top:842px;margin:0;text-align:center')}`;
      ctx.on(ctx.$('[data-go]'), 'click', () => { const k = retirePres() === 'FGPS' ? 'FGPS' : 'RRON'; ctx.jump(k, k === 'FGPS' ? 'fgps1' : 'rron1'); });
      ctx.on(ctx.$('[data-sw]'), 'click', () => { EFA.clients.set('settings', 'retirementPresentation', retirePres() === 'FGPS' ? 'RRON' : 'FGPS'); EFA.player.renderScreen({ noFade: true }); });
    },
    step(ctx, n) {
      ctx.show('.s1', n >= 1); ctx.show('.s2', n >= 2);
      ctx.$('.b03-cp7-bag').classList.toggle('big', n >= 1);
    }
  };

  EFA.screen('cp7', CP7_DEF);
  EFA.screen('ce2', Object.assign({}, CP7_DEF, { copy: Object.assign({}, CP7_DEF.copy) }));

  /* ---------- cp8 ---------- */
  EFA.screen('cp8', {
    title: 'How most families pay',
    steps: 5,
    copy: {
      heading: 'A Typical Approach',
      b1: 'Pay for college out of current savings',
      b2: 'When savings run out, borrow through federal and private loans',
      b3: 'Take on a second job or find other added income',
      b4: 'Look for help filling out the financial aid forms',
      jar: 'Education\nFund',
      _notes: 'This is how most families pay for college: no plan, just one move after another as the bills arrive.\n\n- Ask: Does any part of this sound familiar from your own family or friends?\nPAUSE'
    },
    render(ctx) {
      const L = ART.JAR_LABEL;
      ctx.el.innerHTML = `<div class="b03-head">${ctx.t('heading', { tag: 'h1', cls: 'st-h1' })}</div>
        <div class="b03-cp8-list">${['b1', 'b2', 'b3', 'b4'].map((k, i) => brow(ctx.t(k, { cls: 'b03-xl', attrs: i === 3 ? 'style="max-width:700px"' : '' }), i + 1, 46)).join('')}</div>
        <div class="b03-jarbox b03-shadow"><div class="b03-ill" style="inset:0">${ART.jar()}</div>
          <div class="b03-jar-lbl" style="left:${L.x * 100}%;top:${L.y * 100}%;width:${L.w * 100}%;height:${L.h * 100}%">${ctx.t('jar')}</div></div>`;
    },
    step(ctx, n) { breveal(ctx, n); }
  });

  /* ---------- cp9 ---------- */
  const BLOCKS = {
    A: [P.navy3, P.navy4, P.navy2, P.cream], B: [P.gold, P.goldLt, P.goldDeep, P.navy],
    C: [P.navy4, '#4a6aa0', P.navy3, P.cream], D: [P.goldDeep, P.gold, '#6b5419', P.cream]
  };
  const blockHtml = (ctx, L, style) => { const c = BLOCKS[L]; return `<div class="b03-blk" style="${style || ''}">${ART.block(c[0], c[1], c[2])}<span class="lt" style="color:${c[3]}">${ctx.t('L' + L)}</span></div>`; };
  EFA.screen('cp9', {
    title: 'College planning as easy as A-B-C-D',
    steps: 5,
    copy: {
      heading: 'College Planning 101', easy: 'As easy as..',
      LA: 'A', LB: 'B', LC: 'C', LD: 'D',
      a_main: 'Apply for Financial Aid', a_sub: 'Do this first',
      b_main: 'Become Cash-Flow Efficient', b_sub: 'Stop unnecessary wealth transfers',
      c_main: 'Credit Opportunities', c_sub: 'Decide which borrowing sources to use',
      d_main: 'Deplete Assets', d_sub: 'Only as a last resort',
      _notes: 'There is an order to this. Apply for aid first, become efficient with cash flow, use credit wisely, and touch your assets last.\n\n- Ask: Which of these four steps has your family already taken?\nPAUSE'
    },
    render(ctx) {
      const row = (L, i) => `<div class="b03-abc b03-f" data-b03at="${i + 1}">${blockHtml(ctx, L)}<div>${ctx.t(L.toLowerCase() + '_main', { tag: 'p', cls: 'main' })}${ctx.t(L.toLowerCase() + '_sub', { tag: 'p', cls: 'sub' })}</div></div>`;
      ctx.el.innerHTML = `<div class="b03-head">${ctx.t('heading', { tag: 'h1', cls: 'st-h1' })}</div>
        <div class="b03-cp9-rows">${['A', 'B', 'C', 'D'].map(row).join('')}</div>
        <div class="b03-cp9-r">${ctx.t('easy', { tag: 'p', cls: 'easy' })}</div>
        <div class="b03-tower">
          ${blockHtml(ctx, 'C', 'left:70px;top:340px')}
          ${blockHtml(ctx, 'B', 'left:52px;top:178px;transform:rotate(-4deg)')}
          ${blockHtml(ctx, 'A', 'left:80px;top:18px;transform:rotate(5deg)')}
        </div>`;
    },
    step(ctx, n) { breveal(ctx, n); }
  });

  /* ---------- cp10 ---------- */
  function loanLimit() { return dget(['studentLoans.dependentUndergradAggregate', 'studentLoans.directLoan.dependentAggregate', 'studentLoans.aggregate.dependent', 'education.directLoan.dependentAggregate', 'college.directLoan.dependentAggregate']); }
  EFA.screen('cp10', {
    title: 'What poor planning can cost you',
    steps: 3,
    copy: {
      heading: 'A family that skips planning may leave all of this on the table:',
      c1a: 'Up to', c1b: 'in federal Direct Loans*',
      c1c: "Plus additional savings that can exceed one year's cost of attendance",
      creating: 'Potentially creating:',
      c2b: 'in additional retirement funds**',
      fn1: '* Federal Direct Subsidized and Unsubsidized Loans, aggregate limit for a dependent undergraduate. Loans are made by the U.S. Department of Education to eligible students and must be repaid.',
      fn2: '** Hypothetical illustration: the loan limit plus one year of state school cost, earning an assumed', fn2b: 'a year for', fn2c: 'years. Not a guarantee.',
      pending: PENDING,
      _notes: 'Without a plan, families often miss federal loan access and savings that could have kept working for retirement.\n\n- Ask: What would an extra amount like this mean for your retirement?\nPAUSE'
    },
    render(ctx) {
      const lim = loanLimit(), d = collegeData();
      const amt = lim > 0 && d ? Math.round((lim + d.pub) * Math.pow(1 + CP.r, CP.R)) : null;
      ctx.el.innerHTML = `${ctx.t('heading', { tag: 'h1', cls: 'b03-cp10-h' })}
        <div class="b03-ill b03-piggy b03-shadow">${ART.piggy()}</div>
        <div class="b03-card b03-cp10-c1 b03-f s1"><p>${ctx.t('c1a')} ${lim > 0 ? num(money(lim)) : pend(ctx)} ${ctx.t('c1b')}</p>${ctx.t('c1c', { tag: 'p' })}</div>
        ${ctx.t('creating', { tag: 'p', cls: 'b03-cp10-ct b03-f s2' })}
        <div class="b03-card b03-cp10-c2 b03-f s2"><p>${amt ? num(money(amt)) : pend(ctx)} ${ctx.t('c2b')}</p></div>
        <div class="b03-cp10-fn b03-f s2">${ctx.t('fn1', { tag: 'p' })}<p>${ctx.t('fn2')} ${num(F.pct(CP.r, 0))} ${ctx.t('fn2b')} ${num(CP.R)} ${ctx.t('fn2c')}</p></div>`;
    },
    step(ctx, n) { ctx.show('.s1', n >= 1); ctx.show('.s2', n >= 2); }
  });

  /* ---------- cp11 ---------- */
  EFA.screen('cp11', {
    title: 'The wise next step',
    steps: 3,
    copy: {
      heading: "What's the Next Step?",
      board_a: 'It would be very', board_w: 'WISE', board_b: 'to work out\nyour real out-of-pocket\ncost of college.',
      card: 'You also need to know what type and amount of help to expect from the colleges you are considering.',
      _notes: 'The wise move is to know your real number before you choose a school, not after the acceptance letters arrive.\n\n- Ask: Do you know what each school on your list is likely to offer you?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b03-head">${ctx.t('heading', { tag: 'h1', cls: 'st-h1' })}</div>
        <div class="b03-ill b03-owl b03-shadow b03-f s1">${ART.owl()}</div>
        <div class="b03-board b03-f s1"><div class="in"><p>${ctx.t('board_a')}<br>${ctx.t('board_w', { cls: 'w' })} ${ctx.t('board_b')}</p></div><div class="tray"></div><span class="chalk" style="left:140px"></span><span class="chalk" style="left:220px;width:40px;background:#f0e6c4"></span></div>
        <div class="b03-card b03-cp11-card b03-f s2">${ctx.t('card', { tag: 'p' })}</div>`;
    },
    step(ctx, n) { ctx.show('.s1', n >= 1); ctx.show('.s2', n >= 2); }
  });

  /* ---------- cp12 ---------- */
  EFA.screen('cp12', {
    title: 'Accurate projections drive good decisions',
    steps: 4,
    copy: {
      heading: 'Only a realistic estimate of what college will cost you lets you judge:',
      p0: 'Your ABILITY to pay for college',
      p1: 'The IMPACT paying for college has on your other financial goals',
      p2: 'Which financial approach suits you best',
      btn_benefits: 'Benefits', btn_scorecard: 'Scorecard',
      _notes: 'Good decisions start with a real number. Once we know it, we can judge what you can afford, what it does to everything else, and which approach fits.\n\n- Benefits and Scorecard compare the places families save for college.\n- Ask: Would it help to see how the common college accounts stack up side by side?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b03-head" style="left:120px;right:120px">${ctx.t('heading', { tag: 'h1', cls: 'st-h1' })}</div>
        <div class="b03-card b03-cp12-card b03-f s1">${['p0', 'p1', 'p2'].map((k, i) => brow(ctx.t(k, { cls: 'b03-xl' }), i + 1, 62)).join('')}</div>
        <div class="b03-ill b03-calc b03-shadow">${ART.calc()}</div>
        <div class="b03-cp12-btns"><button type="button" class="st-pill" data-j="CPB">${ctx.t('btn_benefits')}</button><button type="button" class="st-pill" data-j="CPS">${ctx.t('btn_scorecard')}</button></div>`;
      ctx.on(ctx.$$('[data-j]'), 'click', (e, b) => ctx.jump(b.dataset.j, b.dataset.j === 'CPB' ? 'cpb1' : 'cps1'));
    },
    step(ctx, n) { ctx.show('.s1', n >= 1); breveal(ctx, n); }
  });

  /* =====================================================================
     College Planning 101 (CPF101): the PEM with a college purchase
     ===================================================================== */
  function cpfMount(ctx, expanded) {
    const PEM = lib('pem');
    if (!PEM) return null;
    return PEM.mount(ctx, ctx.el, {
      purpose: 'college', showBorrowed: true, borrowSource: false, collateral: 'none', safe: 30, risk: 30,
      scenarioPicker: false, showHouse: false, links: false, sliders: false, chevrons: false,
      labels: expanded, lifestyleStrip: expanded,
      frame: { zoom: { fit: ['risk', 'safe', 'borrowed', 'purchase'], pad: 0.6 }, width: 0.55, expanded, panel: '.b03-cpf-panel', expandShows: ['labels', 'lifestyle'], toggle: true }
    });
  }
  const cpfWait = (ctx) => (lib('pem') ? '' : `<div class="b03-cpf-wait">${ctx.t('loading', { cls: 'b03-pend' })}</div>`);
  const cpfRow = (ctx, key, at) => brow(`<div class="b03-card b03-cpf-c">${ctx.t(key)}</div>`, at, 40);

  EFA.screen('cpf1', {
    title: 'Four ways to pay for college',
    steps: 6,
    copy: {
      heading: 'Paying for College', subheading: 'There are four main places the money can come from:',
      src1: 'Free money: scholarships, grants and education tax credits',
      src2: 'Found money: cutting or ending wealth transfers',
      src3: 'Borrowed money: student and parent loans',
      src4: 'Saved money: 529 plans and other college savings accounts',
      loading: 'Diagram loading',
      _notes: 'Every college dollar comes from one of four places: free money, found money, borrowed money or saved money. The order matters.\n\n- Each click shows one source flowing into the college bill on the model.\n- Ask: Which of these four is your family counting on most today?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b03-cpf-panel">${ctx.t('heading', { tag: 'h1', cls: 'st-h1' })}${ctx.t('subheading', { tag: 'h2', cls: 'st-h3' })}
        <div class="b03-cpf-rows">${['src1', 'src2', 'src3', 'src4'].map((k, i) => cpfRow(ctx, k, i + 2)).join('')}</div></div>${cpfWait(ctx)}`;
      ctx.pem = cpfMount(ctx, true);
    },
    step(ctx, n) {
      breveal(ctx, n);
      const p = ctx.pem; if (!p) { ctx.show('.b03-cpf-panel', n >= 1); return; }
      p.expand(n === 0);
      const sb = { 2: 'CPFreeMoney', 3: 'CPFoundMoney', 4: 'CPStudentLoan', 5: 'CPPayCash' };
      Object.keys(sb).forEach((k) => { if (+k !== n) p.stop(sb[k]); });
      if (n < 4) p.set({ borrow: 0 }, { ms: 0 });
      if (n < 5) p.set({ safe: 30 }, { ms: 0 });
      if (n === 5) p.set({ borrow: 60 }, { ms: 0 });
      if (sb[n]) p.play(sb[n]);
    }
  });

  EFA.screen('cpf2', {
    title: 'What drives aid eligibility',
    steps: 5,
    copy: {
      heading: 'Paying for College', subheading: 'What it takes to qualify for aid:',
      r1: "Parents' income weighs heavily",
      r2: "Parents' and the student's non-retirement assets count",
      r3: 'Qualifying for aid can mean free money, or only borrowed money',
      r4: 'The school you choose is the main driver of how much free money you receive',
      loading: 'Diagram loading',
      _notes: 'Aid eligibility turns mostly on income and on assets held outside retirement accounts, and the school you choose decides how much of the aid is free.\n\n- Ask: Have you ever compared what different schools actually offer families like yours?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b03-cpf-panel">${ctx.t('heading', { tag: 'h1', cls: 'st-h1' })}${ctx.t('subheading', { tag: 'h2', cls: 'st-h3' })}
        <div class="b03-cpf-rows">${['r1', 'r2', 'r3', 'r4'].map((k, i) => cpfRow(ctx, k, i + 1)).join('')}</div></div>${cpfWait(ctx)}`;
      ctx.pem = cpfMount(ctx, false);
    },
    step(ctx, n) { breveal(ctx, n); }
  });

  EFA.screen('cpf3', {
    title: 'Things to consider',
    steps: 5,
    copy: {
      heading: 'Things to Consider',
      r1: 'The factors used to qualify for financial aid',
      r2: 'Review every cash flow for efficiency',
      r3: 'Consider borrowing early to lock in the best loan terms',
      r4: 'Be very careful about draining any account meant for your future lifestyle',
      factors_title: 'Key Factors',
      f1: "Parents' income", f2: "Parents' assets", f3: 'Family size', f4: "Student's income", f5: "Student's assets",
      loading: 'Diagram loading',
      _notes: 'A few considerations shape every college plan. The federal formula looks at a handful of factors, and the rest is about how efficiently your money moves.\n\n- Ask: Which of these have you already looked at, and which would you want help with?\nPAUSE'
    },
    render(ctx) {
      const facts = ['f1', 'f2', 'f3', 'f4', 'f5'];
      ctx.el.innerHTML = `<div class="b03-cpf-panel">${ctx.t('heading', { tag: 'h1', cls: 'st-h1', attrs: 'style="margin-bottom:18px"' })}
        <div class="b03-cpf-rows">${['r1', 'r2', 'r3', 'r4'].map((k, i) => cpfRow(ctx, k, i + 1)).join('')}</div></div>${cpfWait(ctx)}
        <div class="b03-card b03-fact b03-f"><h4>${num(facts.length)} ${ctx.t('factors_title')}</h4><ol>${facts.map((k) => ctx.t(k, { tag: 'li' })).join('')}</ol></div>`;
      ctx.pem = cpfMount(ctx, false);
    },
    step(ctx, n, dir) {
      breveal(ctx, n);
      const f = ctx.$('.b03-fact');
      ctx.show(f, n >= 1);
      if (n >= 2) { f.classList.remove('snap'); f.style.transform = 'translate(-352px, -135px)'; }
      else { f.classList.add('snap'); f.style.transform = 'none'; void f.offsetWidth; f.classList.remove('snap'); }
    }
  });

  /* =====================================================================
     CPB: account-by-account benefits; CPS: the scorecard
     ===================================================================== */
  const CPB_ACC = ['529', 'Cover', 'Prepaid', 'UTMA', 'Stock', 'ROTH', 'CVLI'];
  const BEN = ['cred', 'guar', 'defer', 'free', 'limit', 'ror', 'dis', 'aid', 'xfer'];
  // Y = YES, L = *YES (limited), S = varies by state (compliance softening of the original YES for creditor protection)
  const CPB_MARKS = {
    cred: { 529: 'S', Prepaid: 'S', CVLI: 'S' },
    guar: { CVLI: 'Y' },
    defer: { 529: 'Y', Cover: 'Y', Prepaid: 'Y', ROTH: 'Y', CVLI: 'Y' },
    free: { 529: 'L', Cover: 'Y', ROTH: 'Y', CVLI: 'Y' },
    limit: { UTMA: 'Y', Stock: 'Y', CVLI: 'Y' },
    ror: { 529: 'Y', Cover: 'Y', Prepaid: 'Y', UTMA: 'Y', Stock: 'Y', ROTH: 'Y', CVLI: 'Y' },
    dis: { CVLI: 'Y' },
    aid: { ROTH: 'Y', CVLI: 'Y' },
    xfer: { 529: 'L', Cover: 'L', Prepaid: 'L', Stock: 'Y', ROTH: 'Y', CVLI: 'Y' }
  };
  const BEN_COPY = {
    'b.cred': 'Creditor protection', 'b.guar': 'Guaranteed growth', 'b.defer': 'Tax-deferred accumulation', 'b.free': 'Tax-free use',
    'b.limit': 'High contribution limits', 'b.ror': 'Competitive rate of return', 'b.dis': 'Disability protection',
    'b.aid': 'Invisible to financial aid', 'b.xfer': 'Transferable', 'b.xferSub': '(owner/beneficiary)'
  };
  const COMPLY_COPY = {
    c_state: 'Creditor protection varies by state law and federal bankruptcy rules.',
    c_rider: 'Guaranteed growth and disability protection for cash value life insurance depend on the policy type and riders, such as guaranteed cash values or a waiver-of-premium rider.',
    c_tax: 'Cash value life insurance loans and withdrawals are income-tax-free. 529 withdrawals are tax-free only for qualified education expenses. Aid treatment follows the current federal formula and each school\'s own rules.'
  };
  EFA.screen('cpb1', {
    title: 'Which account to save in',
    steps: 9,
    copy: Object.assign({
      heading: 'Where Should You Save for College?', hdr_acct: 'Account Type', hdr_ben: 'Possible Benefits', limited: '*Limited',
      'a.529': '529 Plans', 'a.Cover': 'Coverdell', 'a.Prepaid': 'Prepaid Tuition', 'a.UTMA': 'UTMA / UGMA', 'a.Stock': 'Stock / Mutual Funds',
      'a.ROTH': 'Roth / IRA', 'a.CVLI': 'Cash Value Life Insurance', yes: 'YES', state: 'BY STATE',
      _notes: 'Each place a family can save for college carries a different set of benefits. We add them one at a time.\n\n- Click any account name to bring its benefits back up.\n- Ask: Which of these benefits matters most to your family?\nPAUSE'
    }, BEN_COPY, COMPLY_COPY),
    render(ctx) {
      const mark = (b, a) => {
        const m = (CPB_MARKS[b] || {})[a];
        if (!m) return '';
        return m === 'S' ? `<span class="b03-yes state is-off" data-mk="${b}|${a}">${ctx.t('state')}</span>`
          : `<span class="b03-yes is-off" data-mk="${b}|${a}">${m === 'L' ? '*' : ''}${ctx.t('yes')}</span>`;
      };
      ctx.el.innerHTML = `<div class="b03-head">${ctx.t('heading', { tag: 'h1', cls: 'st-h1' })}</div>
        ${ctx.t('hdr_acct', { tag: 'div', cls: 'b03-cpb-hd b03-f s2', attrs: 'style="left:120px;width:520px"' })}
        ${ctx.t('hdr_ben', { tag: 'div', cls: 'b03-cpb-hd b03-f s1', attrs: 'style="left:936px;width:544px"' })}
        <div class="b03-card b03-cpb-acc b03-f s2">${CPB_ACC.map((a, i) => ctx.t('a.' + a, { tag: 'span', cls: 'b03-acc b03-f', attrs: `data-acc="${a}" data-at="${i + 2}"` })).join('')}</div>
        <div class="b03-cpb-ben b03-f s1">${BEN.map((b) => `<div class="b03-ben"><div class="mk">${CPB_ACC.map((a) => mark(b, a)).join('')}</div><div class="lb">${ctx.t('b.' + b)}${b === 'xfer' ? ctx.t('b.xferSub', { tag: 'small' }) : ''}</div></div>`).join('')}</div>
        ${ctx.t('limited', { tag: 'div', cls: 'b03-cpb-ltd b03-f s2' })}
        <p class="st-disclaimer b03-cpb-disc b03-f s2">${ctx.t('c_state')} ${ctx.t('c_rider')} ${ctx.t('c_tax')} ${discHtml('loans')}</p>`;
      // marks stack in one cell; only the selected account's mark shows
      ctx.$$('.b03-ben .mk').forEach((c) => { c.style.display = 'grid'; c.style.gridTemplateAreas = '"m"'; Array.from(c.children).forEach((x) => { x.style.gridArea = 'm'; }); });
      ctx.on(ctx.$$('[data-acc]'), 'click', (e, n) => { if (!n.classList.contains('is-off')) { ctx._sel = n.dataset.acc; paintCpb(ctx); } });
    },
    step(ctx, n) {
      ctx.show('.s1', n >= 1); ctx.show('.s2', n >= 2);
      ctx.$$('[data-acc]').forEach((x) => ctx.show(x, +x.dataset.at <= n));
      ctx._sel = n >= 2 ? CPB_ACC[n - 2] : null;
      paintCpb(ctx);
    }
  });
  function paintCpb(ctx) {
    ctx.$$('[data-acc]').forEach((x) => x.classList.toggle('sel', x.dataset.acc === ctx._sel));
    ctx.$$('[data-mk]').forEach((x) => ctx.show(x, x.dataset.mk.split('|')[1] === ctx._sel));
  }

  const CPS_COLS = ['CVLI', 'ROTH', 'Stock', 'UTMA', 'Prepaid', 'Cover', '529'];
  const CPS_GRID = {
    cred: ['q', 'n', 'n', 'n', 'q', 'n', 'q'],
    guar: ['y', 'n', 'n', 'n', 'n', 'n', 'n'],
    defer: ['y', 'y', 'n', 'n', 'y', 'y', 'y'],
    free: ['y', 'y', 'n', 'n', 'n', 'y', 'y'],
    limit: ['y', 'n', 'y', 'y', 'n', 'n', 'n'],
    ror: ['y', 'y', 'y', 'y', 'y', 'y', 'y'],
    dis: ['y', 'n', 'n', 'n', 'n', 'n', 'n'],
    aid: ['y', 'y', 'n', 'n', 'n', 'n', 'y*'],
    xfer: ['y', 'y', 'y', 'n', 'y', 'y', 'y']
  };
  EFA.screen('cps1', {
    title: 'College savings scorecard',
    copy: Object.assign({
      title: 'College Savings Scorecard',
      'h.CVLI': 'Cash Value\nLife\nInsurance', 'h.ROTH': 'Roth\nIRA', 'h.Stock': 'Stock /\nMutual\nFunds', 'h.UTMA': 'UTMA /\nUGMA',
      'h.Prepaid': 'Prepaid\nTuition', 'h.Cover': 'Coverdell', 'h.529': '529\nPlans',
      y: 'Y', n: 'N', q: '?',
      fn_star: '* Only when the account is owned by someone other than the parents.',
      fn_q: '? Varies by state law and federal bankruptcy rules.',
      _notes: 'Here is the whole comparison at a glance. Green is a yes, red is a no.\n\n- Ask: Looking at the whole board, which column surprises you?\nPAUSE'
    }, BEN_COPY, COMPLY_COPY),
    render(ctx) {
      const cell = (v) => `<td class="c ${v[0]}">${ctx.t(v[0])}${v.length > 1 ? '<sup>*</sup>' : ''}</td>`;
      ctx.el.innerHTML = `<div class="b03-cps">
        ${ctx.t('title', { tag: 'h1', cls: 'st-h1' })}
        <table><colgroup><col style="width:30%">${CPS_COLS.map(() => '<col style="width:10%">').join('')}</colgroup>
          <thead><tr><th></th>${CPS_COLS.map((c) => `<th>${ctx.t('h.' + c)}</th>`).join('')}</tr></thead>
          <tbody>${BEN.map((b) => `<tr><td class="lb">${ctx.t('b.' + b)}</td>${CPS_GRID[b].map(cell).join('')}</tr>`).join('')}</tbody>
        </table>
        <div class="fn"><p class="k">${ctx.t('fn_star')} &nbsp; ${ctx.t('fn_q')}</p><p>${ctx.t('c_rider')} ${ctx.t('c_tax')} ${discHtml('loans')}</p></div>
      </div>`;
    }
  });

  /* =====================================================================
     CAT ENGINE (spec ca2.md): shared state and math for ca2, ca3, ca4 and ca5.
     Exposed as EFA.engines.cat. Percent inputs are stored as numbers in percent (25 = 25%),
     exactly as the spec writes them (pct(x) = x / 100). Values are not rounded unless the spec says so.
     ===================================================================== */
  const CATE = (function () {
    const NZ = 0.0049;
    const tz = (x) => (Math.abs(x) < NZ ? 0 : x);
    const r2 = (x) => Math.round(x * 100 + 1e-14) / 100;
    const pc = (x) => (+x || 0) / 100;
    const TYPES = ['Taxable', 'TaxFree', 'TDBT', 'TDAT', 'Annuity', 'CVLI'];
    const ITEMS = ['contrib', 'contribC', 'match', 'matchC', 'wd', 'wdC', 'life', 'lifeC', 'boy', 'growth', 'eoy', 'tio', 'ticg', 'tax', 'taxC',
      'taxPot', 'spend', 'spendC', 'spendPV', 'spendCPV', 'tdBal', 'cgBal', 'tfBal', 'nw', 'ndb', 'db', 'estate'];
    const MARKETS = ['dji', 'sp', 'sptr', 'rut', 'ndx', 'msci', 'gov10', 'muni', 'corp'];

    /* ---------- market history (EFA.data.history); null while a series is not verified ---------- */
    const isRet = (s) => Array.isArray(s) && s.length > 1 && s.every((r) => Array.isArray(r) && isFinite(r[0]) && isFinite(r[1]) && Math.abs(r[1]) < 3);
    /* market ids in the spec's dropdown order, and the EFA.data.history series behind each (see history.markets) */
    const MKT_SERIES = { dji: 'djiaPriceReturn', sp: 'sp500PriceReturn', sptr: 'sp500TotalReturnSP', rut: 'russell2000PriceReturn', ndx: 'nasdaqPriceReturn',
      msci: 'msciWorldGrossReturn', gov10: 'tsy10yYield', muni: 'muni20Yield', corp: 'corpAaaYield' };
    function series(id) {
      const H = (EFA.data && EFA.data.history) || {};
      const key = MKT_SERIES[id]; if (!key) return null;
      const reg = Array.isArray(H.markets) ? H.markets.find((m) => m && m.series === key) : null;
      const s = H[(reg && reg.series) || key];
      if (isRet(s)) return s;
      if (id === 'sptr' && isRet(H.sp500TotalReturn)) return H.sp500TotalReturn;
      return null;
    }
    const available = () => MARKETS.filter((m) => series(m));
    function range(id) { const s = series(id); return s ? [s[0][0], s[s.length - 1][0]] : null; }
    /** one year's return after the index-crediting limits (TaxFree and Annuity; spec order) */
    function limit(x, a) {
      if (a.floorOn && x < pc(a.floor)) x = pc(a.floor);
      if (a.bufferOn && x < 0) x = Math.min(x + pc(a.buffer), 0);
      if (a.partOn && x > 0) x = x * pc(a.part);
      if (a.capOn && x > pc(a.cap)) x = pc(a.cap);
      // original quirk kept (flagged to Joshua): the spread is driven by the Cap switch, not the Spread switch
      if (a.capOn && x > 0) x = Math.max(x - pc(a.spread), 0);
      return x;
    }
    function marketList(a) {
      const s = series(a.market); if (!s) return null;
      const lo = s[0][0], hi = s[s.length - 1][0];
      let from = Math.min(Math.max(+a.mStart || lo, lo), hi), to = Math.min(Math.max(+a.mEnd || hi, lo), hi);
      if (to < from) to = from;
      const lim = a.type === 'TaxFree' || a.type === 'Annuity';
      const price = a.market === 'sptr' ? series('sp') : null;
      const pmap = price ? new Map(price) : null;
      const out = [];
      s.forEach(([y, v]) => {
        if (y < from || y > to) return;
        let x = v;
        if (lim) {
          if (a.market === 'sptr' && pmap && pmap.has(y) && !a.partOn) { const pr = pmap.get(y); x = limit(pr, a) + (v - pr); }
          else x = limit(v, a);
        }
        out.push(x);
      });
      return out;
    }
    function rors(st, a) {
      const N = st.yearsToProject, out = new Array(N).fill(0);
      a._mktMissing = false;
      if (a.type === 'CVLI' || (a.type === 'Annuity' && a.useIllus)) return out;
      if (!a.useMarket) return out.fill(+a.growthRate || 0);
      let list = marketList(a);
      if (!list || !list.length) { a._mktMissing = true; return out; }
      if (a.type === 'Taxable') list = list.slice(0, N);
      const L = list.length, off = (((st.mhOffset || 0) % L) + L) % L;
      for (let i = 0; i < N; i++) out[i] = 100 * list[(off + i) % L];
      return out;
    }

    /* ---------- state ---------- */
    function defaults() {
      return { yearsToProject: 20, taxOrd: 25, taxCG: 15, infl: 3, contrib: 0, inflateCont: true, contStart: 1, contEnd: 10,
        equalWd: false, inflateWd: true, wdStart: 11, wdEnd: 20, wdTaxOrd: 25, wdTaxCG: 15, lastMarket: null, showValues: false,
        chartItem: 'spendC', accounts: [], mhOffset: 0, tankFactor: 100, _dirty: true, _unsaved: false };
    }
    let idN = 0;
    function newAccount(st, type, name) {
      const a = { id: 'a' + Date.now().toString(36) + (++idN), type, name: name || type, tank: (type === 'Annuity' || type === 'CVLI') ? 'Safe' : 'Risk',
        useIllus: false, illus: [], initialValue: 0, costBasis: 0, match: 0, inflateMatch: true, matchStart: st.contStart, matchEnd: st.contEnd,
        pctOrd: 100, pctCG: 0, taxTreatment: 'Average', qualified: false, roth: false, simpleInterest: false, incomeStream: false, incomeAmount: 0,
        simulateLoan: false, loanRate: 0, reserve: 0, growthRate: 0, useMarket: false, market: null, mStart: null, mEnd: null,
        marketLimits: false, floorOn: false, floor: 0, bufferOn: false, buffer: 0, capOn: false, cap: 100, partOn: false, part: 70, spreadOn: false, spread: 0, fee: 0 };
      setMarketDefaults(st, a);
      return a;
    }
    /** "last used this session, else the first market and its full year range" */
    function setMarketDefaults(st, a) {
      const lm = st.lastMarket;
      if (lm && series(lm.market)) { a.market = lm.market; a.mStart = lm.start; a.mEnd = lm.end; return; }
      const m = available()[0]; if (!m) return;
      const r = range(m); a.market = m; a.mStart = r[0]; a.mEnd = r[1];
    }
    function sizeIllus(a, N) {
      if (!Array.isArray(a.illus)) a.illus = [];
      for (let i = 0; i < N; i++) if (!a.illus[i]) a.illus[i] = { prem: 0, w: 0, av: 0, sv: 0, db: 0 };
    }
    const KEEP = ['yearsToProject', 'taxOrd', 'taxCG', 'infl', 'contrib', 'inflateCont', 'contStart', 'contEnd', 'equalWd', 'inflateWd', 'wdStart', 'wdEnd',
      'wdTaxOrd', 'wdTaxCG', 'lastMarket', 'showValues', 'chartItem'];
    function serialize(st) {
      const o = {}; KEEP.forEach((k) => { o[k] = st[k]; });
      o.accounts = st.accounts.map((a) => { const c = {}; Object.keys(a).forEach((k) => { if (k[0] !== '_') c[k] = a[k]; }); return c; });
      return JSON.parse(JSON.stringify(o));
    }
    function load(o) {
      const st = defaults();
      if (!o || typeof o !== 'object') return st;
      KEEP.forEach((k) => { if (o[k] !== undefined) st[k] = o[k]; });
      st.accounts = (o.accounts || []).filter((x) => x && TYPES.includes(x.type)).map((x) => Object.assign(newAccount(st, x.type, x.name), x));
      return st;
    }

    /* ---------- schedules ---------- */
    function contribAt(st, y) {
      if (y < st.contStart || y > st.contEnd) return 0;
      return st.inflateCont ? (+st.contrib || 0) * Math.pow(1 + pc(st.infl), y - st.contStart) : (+st.contrib || 0);
    }
    function matchAt(st, a, y) {
      if (y < a.matchStart || y > a.matchEnd) return 0;
      return a.inflateMatch ? (+a.match || 0) * Math.pow(1 + pc(st.infl), y - a.matchStart) : (+a.match || 0);
    }
    /** Taxable and TDAT withdrawal split (taxable part, tax-free part) */
    function splitT(tt, W, gr, gain, basisPart, loss) {
      if (tt === 'LIFO') { const x = Math.min(W, gain); return [tz(x - loss), tz(W - x)]; }
      if (tt === 'FIFO') { const x = Math.min(W, basisPart); return [tz(W - x - loss), tz(x)]; }
      return [tz(W * gr - loss), tz(W * (1 - gr))];
    }

    /* ---------- one year for one account ---------- */
    function calcRow(st, a, i) {
      const R = a._r, prev = i > 0 ? R[i - 1] : null, y = i + 1;
      const inWd = st.wdStart <= y && y <= st.wdEnd;
      const to = Math.min(pc(inWd ? st.wdTaxOrd : st.taxOrd), 0.99), tg = pc(inWd ? st.wdTaxCG : st.taxCG);
      const ror = a._ror[i] || 0;
      const r = { y, ROR: ror, IV: 0, C: 0, M: 0, W: 0, V: 0, BOY: 0, Fees: 0, Growth: 0, EOY: 0, TaxEffect: 0, TaxOnGrowth: 0, TaxOnWD: 0, Taxes: 0,
        PotentialTaxes: 0, Spendable: 0, Estate: 0, TaxableIncomeOrd: 0, WD_CG: 0, WD_TF: 0, WD_TD: 0, CostBasis: 0, TaxFreeBal: 0, CapGainBal: 0,
        TaxDefBal: 0, SurrenderValue: 0, DB: 0, Premium: 0, AV: 0, CSV: 0, LoanBal: 0, Borrowed: 0, NetDB: 0, SimpleBasis: 0 };
      let W = a._w[i] || 0;
      const IV = prev ? prev.EOY : (+a.initialValue || 0);
      const Bprev = prev ? prev.CostBasis : (+a.costBasis || 0);
      const clampOk = (V) => W > 0 && (W > V || V - W < NZ);
      switch (a.type) {
        case 'Taxable': {
          const C = contribAt(st, y), V = IV + C, B = Bprev + C;
          let clamped = false;
          if (clampOk(V)) { W = V; clamped = true; }
          const gain = V > B ? V - B : 0, basisPart = Math.min(V, B), gr = V <= 0 ? 0 : gain / V, loss = clamped && V < B ? B - V : 0;
          const BOY = tz(IV + C - W), Fees = tz(BOY * pc(a.fee)), Growth = tz((BOY - Fees) * pc(ror));
          const GrowthCG = tz(Growth * pc(a.pctCG)), GrowthOrd = tz(Growth * pc(a.pctOrd));
          let TaxOnGrowth = r2(GrowthOrd * to); if (TaxOnGrowth < 0) TaxOnGrowth = 0;
          const EOY = tz(BOY + Growth - TaxOnGrowth - Fees);
          const [WD_CG, WD_TF] = splitT(a.taxTreatment, W, gr, gain, basisPart, loss);
          const CostBasis = tz(B + GrowthOrd - TaxOnGrowth - WD_TF - Fees);
          const CapGainBal = EOY >= CostBasis ? EOY - CostBasis : 0, TaxOnWD = r2(WD_CG * tg);
          Object.assign(r, { IV, C, V, W, BOY, Fees, Growth, GrowthCG, GrowthOrd, TaxOnGrowth, EOY, WD_CG, WD_TF, CostBasis, CapGainBal, TaxOnWD,
            TaxFreeBal: Math.min(EOY, CostBasis), Taxes: TaxOnGrowth + TaxOnWD, PotentialTaxes: r2(CapGainBal * tg), Spendable: tz(W - TaxOnWD),
            Estate: EOY, TaxableIncomeOrd: Math.max(GrowthOrd, 0), WdRep: W + TaxOnGrowth, cAdd: C });
          break;
        }
        case 'TaxFree': {
          const C = contribAt(st, y), V = IV + C;
          if (clampOk(V)) W = V;
          const BOY = tz(IV + C - W), Fees = tz(BOY * pc(a.fee)), Growth = tz((BOY - Fees) * pc(ror)), EOY = tz(BOY + Growth - Fees);
          Object.assign(r, { IV, C, V, W, BOY, Fees, Growth, EOY, Spendable: tz(W), Estate: EOY, TaxFreeBal: EOY, WdRep: W, cAdd: C });
          break;
        }
        case 'TDBT': {
          const C = contribAt(st, y), M = matchAt(st, a, y), TaxEffect = C - C / (1 - to);
          const V = IV + C + M + TaxEffect;   // as the spec states (used only for the clamp)
          if (clampOk(V)) W = V;
          const BOY = tz(IV + C + M - TaxEffect - W), Fees = tz(BOY * pc(a.fee)), Growth = tz((BOY - Fees) * pc(ror)), EOY = tz(BOY + Growth - Fees);
          const TaxOnWD = r2(W * to), PotentialTaxes = r2(EOY * to);
          Object.assign(r, { IV, C, M, TaxEffect, V, W, BOY, Fees, Growth, EOY, TaxOnWD, Taxes: TaxOnWD, PotentialTaxes, Spendable: tz(W - TaxOnWD),
            Estate: EOY - PotentialTaxes, TaxableIncomeOrd: W - C, TaxDefBal: EOY, WdRep: W, cAdd: C - TaxEffect });
          break;
        }
        case 'TDAT': {
          const C = contribAt(st, y), M = matchAt(st, a, y), V = IV + C + M, B = Bprev + C;
          let clamped = false;
          if (clampOk(V)) { W = V; clamped = true; }
          const gain = V > B ? V - B : 0, basisPart = Math.min(V, B), gr = V <= 0 ? 0 : gain / V, loss = clamped && V < B ? B - V : 0;
          const BOY = tz(IV + C + M - W), Fees = tz(BOY * pc(a.fee)), Growth = tz((BOY - Fees) * pc(ror)), EOY = tz(BOY + Growth - Fees);
          const [WD_TD, WD_TF] = splitT(a.taxTreatment, W, gr, gain, basisPart, loss);
          const CostBasis = B - WD_TF, TaxDefBal = EOY >= CostBasis ? EOY - CostBasis : 0;
          const TaxOnWD = r2(WD_TD * to), PotentialTaxes = r2(TaxDefBal * to);
          Object.assign(r, { IV, C, M, V, W, BOY, Fees, Growth, EOY, WD_TD, WD_TF, CostBasis, TaxFreeBal: Math.min(EOY, CostBasis), TaxDefBal, TaxOnWD,
            Taxes: TaxOnWD, PotentialTaxes, Spendable: tz(W - TaxOnWD), Estate: EOY - PotentialTaxes, TaxableIncomeOrd: WD_TD, WdRep: W, cAdd: C });
          break;
        }
        case 'Annuity': {
          const ill = !!a.useIllus, row = ill ? (a.illus[i] || {}) : null;
          const C = ill ? (+row.prem || 0) : contribAt(st, y);
          if (ill) W = +row.w || 0;
          const qual = !!a.qualified, roth = qual && !!a.roth;
          const TaxEffect = qual && !roth ? C - C / (1 - to) : 0;
          const V = IV + C + TaxEffect;   // premium bonus is always 0 here
          let B = Bprev + C;
          if (qual && !roth) B = 0;
          if (roth) B = V;
          const gain = V > B ? V - B : 0, basisPart = Math.min(V, B), gr = V <= 0 ? 0 : gain / V;
          let SimpleBasis = (prev ? prev.SimpleBasis : (+a.costBasis || 0)) + C;
          let clamped = false;
          if (!a.incomeStream && !ill && clampOk(V)) { W = V; clamped = true; }
          const loss = clamped && V < B ? B - V : 0;
          let BOY = tz(IV + C - TaxEffect - W); const rawBOY = BOY;
          if (ill && rawBOY < 0 && !a.incomeStream) a.incomeStream = true;   // original quirk kept: a negative illustrated BOY switches Income Stream on
          if (a.incomeStream) BOY = Math.max(BOY, 0);
          SimpleBasis = Math.min(SimpleBasis, BOY);
          const Fees = ill ? 0 : tz(BOY * pc(a.fee));
          let WD_TD, WD_TF;
          if (roth) { WD_TD = 0; WD_TF = W; }
          else if (a.taxTreatment === 'LIFO') { let x = Math.min(W, gain); if (B < W - x) x = W - B; WD_TD = x - loss; WD_TF = W - x; }
          else if (a.taxTreatment === 'FIFO') { const x = Math.min(W, basisPart); WD_TD = W - x - loss; WD_TF = x; }
          else if (a.incomeStream && rawBOY < 0) {
            if (Math.abs(W + rawBOY) < 1e-9) { WD_TD = W; WD_TF = 0; }
            else { const cov = W + rawBOY; WD_TD = cov * gr - loss + (W - cov); WD_TF = cov * (1 - gr); }
          } else { WD_TD = W * gr - loss; WD_TF = W * (1 - gr); }
          const CostBasis = Math.max(0, B - WD_TF);
          let Growth, EOY, SV, DB = 0;
          if (ill) { EOY = +row.av || 0; Growth = EOY - BOY; SV = +row.sv || 0; DB = +row.db || 0; }
          else { Growth = a.simpleInterest ? tz(SimpleBasis * pc(ror)) : tz((BOY - Fees) * pc(ror)); EOY = tz(BOY + Growth - Fees); SV = EOY; }
          const TaxFreeBal = roth ? EOY : Math.min(EOY, CostBasis), TaxDefBal = roth ? 0 : (EOY >= CostBasis ? EOY - CostBasis : 0);
          const TaxOnWD = WD_TD * to, PotentialTaxes = TaxDefBal * to;
          Object.assign(r, { IV, C, TaxEffect, V, W, BOY, rawBOY, Fees, Growth, EOY, SurrenderValue: SV, DB, SimpleBasis, WD_TD, WD_TF, CostBasis, TaxFreeBal,
            TaxDefBal, TaxOnWD, Taxes: TaxOnWD, PotentialTaxes, Spendable: tz(W - TaxOnWD), Estate: Math.max(EOY - PotentialTaxes, DB),
            TaxableIncomeOrd: WD_TD, WdRep: W, cAdd: C - TaxEffect });
          break;
        }
        case 'CVLI': {
          const row = a.illus[i] || (a.illus[i] = { prem: 0, w: 0, av: 0, sv: 0, db: 0 });
          const Premium = +row.prem || 0, AV = +row.av || 0, CSV = +row.sv || 0, DB = +row.db || 0;
          const Lprev = prev ? prev.LoanBal : 0;
          let L = 0, Borrowed = 0;
          if (a.simulateLoan) {
            row.w = W;   // original quirk kept: simulated loans overwrite the imported withdrawal column
            const cap = Math.max(0, CSV - (+a.reserve || 0)), d = Math.min(W, cap) / 12, lr = +a.loanRate || 0;
            L = Lprev;
            for (let m = 0; m < 12; m++) { const int = r2(L * lr / 1200); L = L + d + int; }
            Borrowed = 12 * d;
          } else W = +row.w || 0;
          const spend = a.simulateLoan ? Borrowed : W;
          Object.assign(r, { W, Premium, AV, CSV, DB, LoanBal: L, Borrowed, Spendable: spend, BOY: CSV - Lprev, EOY: CSV - L, NetDB: DB - CSV,
            Estate: DB - L, TaxFreeBal: CSV - L, WdRep: spend, cAdd: Premium, C: 0 });
          break;
        }
        default: break;
      }
      // running totals and today's-dollar values
      const p = prev || {};
      const cvli = a.type === 'CVLI';
      r.ContributionC = (p.ContributionC || 0) + r.cAdd;
      r.PremiumC = (p.PremiumC || 0) + r.Premium;
      r.MatchC = (p.MatchC || 0) + r.M;
      r.WithdrawalC = (p.WithdrawalC || 0) + r.WdRep;
      r.BorrowedC = (p.BorrowedC || 0) + r.Borrowed;
      r.SpendableC = (p.SpendableC || 0) + r.Spendable;
      r.SpendablePV = r.Spendable / Math.pow(1 + pc(st.infl), cvli ? y : y - 1);
      r.SpendableCPV = cvli && !prev ? r.Spendable : (p.SpendableCPV || 0) + r.SpendablePV;
      r.FeesC = (p.FeesC || 0) + r.Fees;
      r.Lifestyle = r.Spendable - (cvli ? r.Premium : r.C);
      r.LifestyleC = (p.LifestyleC || 0) + r.Lifestyle;
      r.TaxesC = (p.TaxesC || 0) + r.Taxes;
      R[i] = r;
    }
    function computeFrom(st, a, from) { for (let i = Math.max(0, from); i < st.yearsToProject; i++) calcRow(st, a, i); }
    const endVal = (a, p1) => { const r = a._r[p1 - 1]; return a.type === 'CVLI' ? r.CSV - (+a.reserve || 0) - r.LoanBal : r.EOY; };
    function excelPmt(rate, n, pv, fv, type) {
      if (!rate) return -(pv + fv) / n;
      const f = Math.pow(1 + rate, n);
      return -(rate * (pv * f + fv)) / ((1 + rate * type) * (f - 1));
    }
    /** spend-down ("Reduce"): first-year withdrawal so the last year of the period ends at zero (secant method) */
    function spendDown(st, a, p0, p1, s) {
      const setW = (w) => { for (let y = p0; y <= p1; y++) a._w[y - 1] = w * Math.pow(1 + s, y - p0); computeFrom(st, a, p0 - 1); return endVal(a, p1); };
      const A0 = endVal(a, p1);
      if (!(A0 > NZ)) return true;
      const n = p1 - p0 + 1, g = pc(a._ror[p0 - 1]);
      let rate, pv, fv;
      if (a.type === 'CVLI') { rate = pc(a.loanRate); pv = p0 > 1 ? a._r[p0 - 2].LoanBal : 0; fv = -A0; }
      else {
        rate = a.type === 'Taxable' ? pc(a.pctOrd) * g * (1 - pc(st.wdTaxOrd)) + pc(a.pctCG) * g : a.type === 'TaxFree' ? g : g * (1 - pc(st.wdTaxOrd));
        pv = a._r[p0 - 1].BOY; fv = A0;
      }
      let w = excelPmt(rate, n, pv, fv, 1);
      if (!isFinite(w) || w === 0) w = -A0 / n;
      let wPrev = 0, ePrev = A0, e = setW(w);
      for (let k = 0; k < 99; k++) {
        const den = e - ePrev;
        if (den === 0) return Math.abs(e) < NZ;
        const step = (w - wPrev) / den * e;
        if (!isFinite(step)) return false;
        if (Math.abs(step) < NZ) return true;
        wPrev = w; ePrev = e; w -= step; e = setW(w);
      }
      return false;
    }
    /** equal-income ("Fund Spendable Income"): each year's withdrawal so spendable income meets the target */
    function equalIncome(st, a, p0, p1, T) {
      let ok = true;
      for (let y = p0; y <= p1; y++) {
        const i = y - 1, target = st.inflateWd ? T * Math.pow(1 + pc(st.infl), y - p0) : T;
        const f = (W) => { a._w[i] = W; computeFrom(st, a, i); return target - a._r[i].Spendable; };
        let W0 = 0, f0 = target, W1 = target, f1 = f(W1), done = false;
        for (let k = 0; k < 99; k++) {
          const den = f1 - f0;
          if (den * f1 === 0) { done = true; break; }
          const step = (W1 - W0) / den * f1;
          if (!isFinite(step)) break;
          if (Math.abs(step) < NZ) { done = true; break; }
          W0 = W1; f0 = f1; W1 -= step; f1 = f(W1);
        }
        if (!done) ok = false;
      }
      return ok;
    }
    function recalc(st, a, T) {
      const N = st.yearsToProject;
      a._r = new Array(N); a._ror = rors(st, a); a._w = new Array(N).fill(0);
      if (a.type === 'Annuity' || a.type === 'CVLI') sizeIllus(a, N);
      computeFrom(st, a, 0);
      a._r.forEach((r) => { st._tankRef = Math.max(st._tankRef, 0.01 * (a.type === 'CVLI' ? r.DB - r.LoanBal : r.EOY)); });
      if (!(st.wdStart > 0)) return true;
      const p0 = st.wdStart, p1 = Math.min(st.wdEnd, N);
      if (p0 > p1) return true;
      if (a.type === 'Annuity' && a.useIllus) return true;
      if (a.type === 'CVLI' && !a.simulateLoan) return true;
      if (a.type === 'Annuity' && a.incomeStream) {
        for (let y = p0; y <= p1; y++) a._w[y - 1] = +a.incomeAmount || 0;
        computeFrom(st, a, p0 - 1); return true;
      }
      return T > 0 ? equalIncome(st, a, p0, p1, T) : spendDown(st, a, p0, p1, st.inflateWd ? pc(st.infl) : 0);
    }
    /** engine Calculate (spec): spend-down for every account, then optional equal after-tax withdrawals */
    function calculate(st) {
      st._tankRef = 0; st._T = 0;
      let ok = true;
      st.accounts.forEach((a) => { if (!recalc(st, a, 0)) ok = false; });
      if (st.equalWd && st.wdStart > 0 && st.wdStart <= st.yearsToProject) {
        // minimum of the positive first-year spendable incomes (order-independent; see Decisions to review)
        let T = 0;
        st.accounts.forEach((a) => { const r = a._r[st.wdStart - 1], n = r ? r.Spendable : 0; if (n > 0) T = T === 0 ? n : Math.min(T, n); });
        if (T > 0) { st._T = T; st._tankRef = 0; ok = true; st.accounts.forEach((a) => { if (!recalc(st, a, T)) ok = false; }); }
      }
      st._dirty = false; st._ok = ok;
      return ok;
    }
    /** GetSummaryValue(year, item, account): spec ca2 "Summary values" */
    function summary(y, item, a) {
      const r = a && a._r && a._r[y - 1]; if (!r) return 0;
      const t = a.type, cv = t === 'CVLI', an = t === 'Annuity', tf = t === 'TaxFree';
      switch (item) {
        case 'contrib': return t === 'TDBT' ? r.C - r.TaxEffect + r.M : t === 'TDAT' ? r.C + r.M : an ? (a.qualified ? r.C - r.TaxEffect : r.C) : cv ? r.Premium : r.C;
        case 'contribC': return t === 'TDBT' ? r.ContributionC + r.MatchC : cv ? r.PremiumC : r.ContributionC;
        case 'match': return t === 'TDBT' || t === 'TDAT' ? r.M : 0;
        case 'matchC': return t === 'TDBT' || t === 'TDAT' ? r.MatchC : 0;
        case 'wd': return r.WdRep;
        case 'wdC': return r.WithdrawalC;
        case 'life': return r.Lifestyle;
        case 'lifeC': return r.LifestyleC;
        case 'boy': return r.BOY;
        case 'growth': return cv ? 0 : r.Growth;
        case 'eoy': return an ? r.SurrenderValue : r.EOY;
        case 'tio': return t === 'Taxable' ? r.TaxableIncomeOrd : t === 'TDBT' ? r.W - r.C : (t === 'TDAT' || an) ? r.WD_TD : 0;
        case 'ticg': return t === 'Taxable' ? r.WD_CG : 0;
        case 'tax': return t === 'Taxable' ? r.TaxOnGrowth + r.TaxOnWD : (tf || cv) ? 0 : r.TaxOnWD;
        case 'taxC': return (tf || cv) ? 0 : r.TaxesC;
        case 'taxPot': return (tf || cv) ? 0 : r.PotentialTaxes;
        case 'spend': return r.Spendable;
        case 'spendC': return r.SpendableC;
        case 'spendPV': return r.SpendablePV;
        case 'spendCPV': return r.SpendableCPV;
        case 'tdBal': return t === 'TDBT' ? r.EOY : (t === 'TDAT' || an) ? r.TaxDefBal : 0;
        case 'cgBal': return t === 'Taxable' ? r.CapGainBal : 0;
        case 'tfBal': return t === 'TDBT' ? 0 : tf ? r.EOY : cv ? r.CSV - r.LoanBal : r.TaxFreeBal;
        case 'nw': return tf ? r.EOY : an ? r.SurrenderValue - r.PotentialTaxes : cv ? (r.CSV - r.LoanBal) - r.LoanBal : r.EOY - r.PotentialTaxes;
        case 'ndb': return an ? Math.max(r.DB - r.SurrenderValue, 0) : cv ? r.DB - r.CSV : 0;
        case 'db': return an || cv ? r.DB : 0;
        case 'estate': return r.Estate;
        default: return 0;
      }
    }
    /** worksheet columns per account type (spec ca2 "Worksheet"): [field, header key, type] */
    const WS = {
      Taxable: [['IV', 'iv'], ['C', 'c'], ['W', 'w'], ['BOY', 'boy'], ['Fees', 'fees'], ['ROR', 'ror', 'pct'], ['Growth', 'growth'], ['Taxes', 'tax'], ['EOY', 'eoy'],
        ['TaxFreeBal', 'tfbal'], ['CapGainBal', 'cgbal'], ['Spendable', 'spend'], ['SpendableC', 'spendC'], ['FeesC', 'feesC'], ['TaxesC', 'taxC'], ['Estate', 'estate']],
      TaxFree: [['IV', 'iv'], ['C', 'c'], ['W', 'w'], ['BOY', 'boy'], ['Fees', 'fees'], ['ROR', 'ror', 'pct'], ['Growth', 'growth'], ['EOY', 'eoy'],
        ['Spendable', 'spend'], ['SpendableC', 'spendC'], ['FeesC', 'feesC'], ['Estate', 'estate']],
      TDBT: [['IV', 'iv'], ['C', 'c'], ['TaxEffectPos', 'taxEff'], ['M', 'match'], ['W', 'w'], ['BOY', 'boy'], ['Fees', 'fees'], ['ROR', 'ror', 'pct'], ['Growth', 'growth'],
        ['Taxes', 'tax'], ['EOY', 'eoy'], ['Spendable', 'spend'], ['SpendableC', 'spendC'], ['FeesC', 'feesC'], ['TaxesC', 'taxC'], ['Estate', 'estate']],
      TDAT: [['IV', 'iv'], ['C', 'c'], ['M', 'match'], ['W', 'w'], ['BOY', 'boy'], ['Fees', 'fees'], ['ROR', 'ror', 'pct'], ['Growth', 'growth'], ['Taxes', 'tax'], ['EOY', 'eoy'],
        ['TaxFreeBal', 'tfbal'], ['TaxDefBal', 'tdbal'], ['Spendable', 'spend'], ['SpendableC', 'spendC'], ['FeesC', 'feesC'], ['TaxesC', 'taxC'], ['Estate', 'estate']],
      Annuity: [['IV', 'iv'], ['C', 'c'], ['TaxEffect', 'taxEff'], ['W', 'w'], ['Taxes', 'tax'], ['BOY', 'boy'], ['ROR', 'ror', 'pct'], ['Growth', 'growth'], ['EOY', 'eoy'],
        ['TaxFreeBal', 'tfbal'], ['TaxDefBal', 'tdbal'], ['Spendable', 'spend'], ['SpendableC', 'spendC'], ['TaxesC', 'taxC'], ['Estate', 'estate']],
      CVLI: [['Premium', 'prem'], ['W', 'w'], ['AV', 'av'], ['CSV', 'csv'], ['DB', 'db'], ['NetDB', 'ndb'], ['BorrowedC', 'borC'], ['LoanBal', 'loan'],
        ['WithdrawalC', 'wC'], ['Spendable', 'spend'], ['SpendableC', 'spendC'], ['Estate', 'estateDB']]
    };
    function worksheetRows(a) {
      return (a._r || []).map((r) => {
        const o = { year: r.y };
        WS[a.type].forEach(([f, , ty]) => { o[f] = f === 'TaxEffectPos' ? -r.TaxEffect : ty === 'pct' ? r[f] / 100 : r[f]; });
        return o;
      });
    }
    return { NZ, tz, r2, TYPES, ITEMS, MARKETS, WS, series, available, range, defaults, newAccount, setMarketDefaults, serialize, load, calculate, summary,
      worksheetRows, contribAt, matchAt, rors, excelPmt };
  })();
  EFA.engines.cat = CATE;

  /* =====================================================================
     CAT screens (ca1 to ca5)
     ===================================================================== */
  EFA.css('b03-cat', `
  .b03-ca1 { position: absolute; left: 264px; width: 1072px; top: 196px; display: grid; gap: 26px; }
  .b03-ca1 .b03-card { flex: 1 1 auto; padding: 20px 30px; font: 700 30px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b03-cat-h { position: absolute; left: 260px; right: 260px; top: 30px; text-align: center; }
  .b03-cat-h .st-h1 { font-size: 54px; }
  .b03-save { position: absolute; left: 22px; top: 38px; display: flex; align-items: center; gap: 10px; border: 0; background: transparent; padding: 6px 12px 6px 6px; border-radius: 12px; color: #9aa3b2; cursor: not-allowed; font: 600 14px/1.2 "DM Sans", sans-serif; }
  .b03-save svg { width: 34px; height: 34px; flex: 0 0 auto; }
  .b03-save.dirty { color: #8a6e22; cursor: pointer; }
  .b03-save.dirty:hover { background: #f6eed6; }
  .b03-sa { position: absolute; left: 50px; top: 118px; width: 446px; display: flex; flex-direction: column; overflow: hidden; }
  .b03-hd { background: #0d1e3a; color: #f7f5f1; padding: 13px 20px; font: 600 26px/1.1 "Cormorant Garamond", Georgia, serif; }
  .b03-sa .bd { padding: 8px 20px 10px; display: grid; gap: 1px; }
  .b03-fr { display: grid; grid-template-columns: 1fr 138px; align-items: center; gap: 12px; min-height: 42px; }
  .b03-fr.wide { grid-template-columns: 1fr; gap: 6px; padding: 4px 0 6px; }
  .b03-fr > .lb { font: 600 15.5px/1.2 "DM Sans", sans-serif; color: #44516a; }
  .b03-in { height: 36px; border: 1.5px solid #cbd5e3; border-radius: 8px; background: #fff; padding: 0 10px; font: 600 17px/1 "DM Sans", sans-serif; color: #0d1e3a; text-align: right; width: 100%; box-sizing: border-box; font-variant-numeric: tabular-nums lining-nums; }
  .b03-in:focus { outline: none; border-color: #b8972e; box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .b03-in.txt { text-align: left; }
  select.b03-in { text-align: left; padding: 0 6px; }
  .b03-sw { justify-self: end; width: 48px; height: 26px; border-radius: 999px; border: 0; background: #cbd5e3; position: relative; cursor: pointer; padding: 0; transition: background .2s ease; }
  .b03-sw::after { content: ""; position: absolute; left: 3px; top: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(13,30,58,.3); transition: transform .2s ease, background .2s ease; }
  .b03-sw[aria-pressed="true"] { background: #0d1e3a; }
  .b03-sw[aria-pressed="true"]::after { transform: translateX(22px); background: #d5bd68; }
  .b03-sw:disabled { opacity: .45; cursor: not-allowed; }
  .b03-seg { justify-self: end; display: inline-flex; border: 1.5px solid #cbd5e3; border-radius: 999px; padding: 3px; gap: 2px; background: #fff; }
  .b03-seg button { border: 0; background: transparent; border-radius: 999px; padding: 5px 10px; font: 600 14px/1 "DM Sans", sans-serif; color: #44516a; cursor: pointer; }
  .b03-seg button[aria-checked="true"] { background: #0d1e3a; color: #f7f5f1; }
  .b03-addl { display: flex; align-items: center; gap: 12px; padding: 12px 20px 14px; border-top: 1px solid rgba(13,30,58,.1); }
  .b03-plus { width: 38px; height: 38px; border-radius: 50%; border: 0; background: #b8972e; color: #0d1e3a; display: grid; place-items: center; cursor: pointer; padding: 0; }
  .b03-plus:hover { background: #d5bd68; }
  .b03-addl .b03-link { font: 700 18px/1 "DM Sans", sans-serif; }
  .b03-strip { position: absolute; left: 516px; right: 34px; top: 118px; height: 676px; overflow-x: auto; overflow-y: hidden; display: flex; gap: 18px; align-items: flex-start; padding: 0 4px 12px 2px; box-sizing: border-box; }
  .b03-acard { flex: 0 0 322px; max-height: 660px; display: flex; flex-direction: column; overflow: hidden; }
  .b03-acard .hd { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 11px 10px 11px 18px; background: #1d3863; color: #f7f5f1; font: 700 14px/1.2 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; }
  .b03-acard .bd { overflow-y: auto; padding: 8px 16px 14px; display: grid; gap: 1px; }
  .b03-acard .b03-fr { grid-template-columns: 1fr 136px; }
  .b03-trash { width: 34px; height: 34px; border-radius: 8px; border: 0; background: transparent; color: #cbd5e3; display: grid; place-items: center; cursor: pointer; }
  .b03-trash:hover { background: rgba(247,245,241,.12); color: #f7f5f1; }
  .b03-empty { flex: 0 0 600px; height: 330px; margin: 40px 0 0 30px; border: 2px dashed #cbd5e3; border-radius: 18px; display: grid; place-items: center; align-content: center; gap: 18px; text-align: center; background: rgba(255,253,248,.6); }
  .b03-empty p { margin: 0; max-width: 430px; font: 500 20px/1.45 "DM Sans", sans-serif; color: #44516a; }
  .b03-empty .b03-plus { width: 64px; height: 64px; }
  .b03-drop { border: 1.5px dashed #cbd5e3; border-radius: 10px; padding: 10px 12px; display: grid; gap: 8px; font: 500 14px/1.35 "DM Sans", sans-serif; color: #667389; background: #fff; }
  .b03-drop.over { border-color: #b8972e; background: #fbf6e6; }
  .b03-drop .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .b03-mini { border: 1.5px solid #cbd5e3; background: #fff; border-radius: 999px; padding: 6px 12px; font: 600 14px/1 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; }
  .b03-mini:hover { border-color: #b8972e; }
  .b03-mini.dark { background: #0d1e3a; color: #f7f5f1; border-color: #0d1e3a; }
  .b03-mini.dark:hover { background: #b8972e; color: #0d1e3a; border-color: #b8972e; }
  .b03-mini:disabled { opacity: .45; cursor: not-allowed; }
  .b03-spin { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #cbd5e3; border-top-color: #b8972e; animation: b03spin .8s linear infinite; display: inline-block; }
  @keyframes b03spin { to { transform: rotate(360deg); } }
  .b03-cat-disc { position: absolute; left: 516px; width: 760px; top: 806px; margin: 0; font-size: 12.5px; line-height: 1.4; }
  .b03-dd { display: inline-flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 136px; height: 36px; padding: 0 10px 0 12px; border: 1.5px solid #cbd5e3; border-radius: 8px; background: #fff; font: 600 15px/1.1 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; text-align: left; box-sizing: border-box; max-width: 100%; }
  .b03-dd .lbl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .b03-dd:hover { border-color: #b8972e; }
  .b03-dd svg { flex: 0 0 auto; color: #8a6e22; }
  .b03-dd.big { height: 56px; min-width: 380px; border: 0; border-bottom: 2px solid #b8972e; border-radius: 0; background: transparent; font: 600 36px/1 "Cormorant Garamond", Georgia, serif; justify-content: center; padding: 0 8px; }
  .b03-dd.big .ph { color: #9aa3b2; }
  .b03-menu { position: absolute; z-index: 45; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 12px; box-shadow: 0 18px 40px rgba(13,30,58,.2); padding: 6px; max-height: 470px; overflow: auto; box-sizing: border-box; }
  .b03-menu button { display: block; width: 100%; text-align: left; border: 0; background: transparent; padding: 8px 14px; border-radius: 8px; font: 600 16px/1.25 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; white-space: nowrap; }
  .b03-menu button:hover, .b03-menu button.on { background: #f6eed6; }
  .b03-menu button:disabled { color: #a3abb8; cursor: default; background: transparent; }
  .b03-dlg { display: grid; gap: 18px; }
  .b03-dlg .types { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .b03-dlg .types button { border: 1.5px solid #cbd5e3; background: #fff; border-radius: 12px; padding: 14px 16px; text-align: left; font: 600 19px/1.25 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; }
  .b03-dlg .types button[aria-checked="true"] { border-color: #b8972e; background: #f6eed6; box-shadow: inset 0 0 0 1px #b8972e; }
  .b03-dlg .lb { font: 600 15px/1.2 "DM Sans", sans-serif; letter-spacing: .06em; text-transform: uppercase; color: #667389; }
  .b03-dlg .btns { display: flex; justify-content: flex-end; gap: 12px; }
  .b03-dlg .b03-in { height: 48px; font-size: 20px; }
  .b03-dlg p { margin: 0; font: 500 20px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }
  .b03-ilwrap { max-height: 520px; overflow: auto; border: 1px solid #d6cfc4; border-radius: 12px; }
  .b03-iltab { width: 100%; border-collapse: collapse; font: 600 17px/1.2 "DM Sans", sans-serif; color: #0d1e3a; font-variant-numeric: tabular-nums lining-nums; }
  .b03-iltab th { position: sticky; top: 0; background: #0d1e3a; color: #f7f5f1; font: 700 12.5px/1.2 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; padding: 10px 12px; text-align: right; z-index: 1; }
  .b03-iltab th:first-child, .b03-iltab td:first-child { text-align: center; width: 80px; }
  .b03-iltab td { padding: 0 12px; height: 38px; text-align: right; border-bottom: 1px solid rgba(13,30,58,.08); cursor: text; }
  .b03-iltab tbody tr:nth-child(even) td { background: rgba(227,232,240,.45); }
  .b03-iltab td.ed { padding: 0 4px; }
  .b03-iltab td input { width: 100%; height: 32px; border: 1.5px solid #b8972e; border-radius: 6px; text-align: right; font: inherit; padding: 0 8px; box-sizing: border-box; }
  .b03-paste { position: absolute; z-index: 60; width: 430px; background: #fffdf8; border: 1px solid #b8972e; border-radius: 14px; box-shadow: 0 22px 48px rgba(13,30,58,.3); padding: 14px 16px 16px; display: grid; gap: 10px; }
  .b03-paste .t { display: flex; justify-content: space-between; align-items: center; font: 600 24px/1 "Cormorant Garamond", Georgia, serif; }
  .b03-paste .x { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #cbd5e3; background: #fff; cursor: pointer; font: 400 20px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b03-paste textarea { width: 100%; box-sizing: border-box; font: 500 15px/1.35 "DM Sans", sans-serif; border: 1.5px solid #cbd5e3; border-radius: 8px; padding: 8px; resize: none; }
  .b03-paste .bs { display: flex; flex-wrap: wrap; gap: 8px; }
  .b03-ctl { display: flex; align-items: center; gap: 8px; font: 600 15px/1 "DM Sans", sans-serif; color: #44516a; }
  .b03-ib { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid #cbd5e3; background: #fff; color: #0d1e3a; display: grid; place-items: center; cursor: pointer; padding: 0; }
  .b03-ib:hover { border-color: #b8972e; color: #8a6e22; }
  .b03-yr { width: 58px; height: 36px; border: 1.5px solid #cbd5e3; border-radius: 8px; text-align: center; font: 700 18px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b03-yr:focus { outline: none; border-color: #b8972e; }
  .b03-chk { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
  .b03-chk input { width: 18px; height: 18px; accent-color: #0d1e3a; }
  .b03-range { width: 128px; accent-color: #b8972e; }
  .b03-sum { position: absolute; left: 1136px; top: 236px; width: 432px; overflow: hidden; }
  .b03-sum .rows { padding: 6px 24px 14px; }
  .b03-sum .r { display: flex; justify-content: space-between; align-items: baseline; height: 50px; border-bottom: 1px solid rgba(13,30,58,.08); font: 500 20px/1 "DM Sans", sans-serif; color: #44516a; }
  .b03-sum .r .v { font: 700 23px/1 "DM Sans", sans-serif; color: #0d1e3a; font-variant-numeric: tabular-nums lining-nums; }
  .b03-sum .r.k .v { color: #8a6e22; }
  .b03-sum .div { height: 5px; background: #b8972e; border-radius: 3px; margin: 10px 0 2px; }
  .b03-pemwin { position: absolute; overflow: hidden; }
  .b03-pemwait { position: absolute; inset: 0; display: grid; place-items: center; }
  .b03-cap { position: absolute; z-index: 8; transform: translate(-50%, 0); white-space: nowrap; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 8px; padding: 5px 10px; font: 700 14px/1.2 "DM Sans", sans-serif; color: #0d1e3a; box-shadow: 0 6px 14px rgba(13,30,58,.1); }
  .b03-cap span { color: #667389; font-weight: 600; }
  .b03-none { position: absolute; left: 400px; width: 800px; top: 330px; padding: 40px 50px; text-align: center; display: grid; gap: 20px; justify-items: center; }
  .b03-none p { margin: 0; font: 500 23px/1.45 "DM Sans", sans-serif; color: #44516a; }
  .b03-wi { display: grid; gap: 8px; }
  .b03-wi .t { font: 700 14px/1.2 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #8a6e22; }
  .b03-wi .f { display: grid; grid-template-columns: 96px 90px; align-items: center; gap: 10px; font: 600 15px/1 "DM Sans", sans-serif; color: #44516a; }
  .b03-wi .b03-in { height: 34px; font-size: 16px; }
  .b03-vs { position: absolute; display: flex; gap: 10px; align-items: flex-start; }
  .b03-vs .lab { display: grid; gap: 4px; width: 150px; padding-top: 42px; }
  .b03-vs .lab div, .b03-vs .col .bx { height: 30px; display: flex; align-items: center; justify-content: flex-end; font: 700 15px/1 "DM Sans", sans-serif; color: #44516a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .b03-vs .lab div { justify-content: flex-end; }
  .b03-vs .cols { display: flex; gap: 8px; overflow-x: auto; max-width: 880px; padding-bottom: 4px; }
  .b03-vs .col { display: grid; gap: 4px; width: 150px; flex: 0 0 150px; }
  .b03-vs .col .b03-dd { width: 150px; min-width: 0; height: 36px; font-size: 13px; padding: 0 6px 0 8px; }
  .b03-vs .col .bx { background: #fff; border: 1px solid #d6cfc4; border-radius: 6px; padding: 0 8px; color: #0d1e3a; font-variant-numeric: tabular-nums lining-nums; }
  .b03-vs .col .bar { height: 3px; background: #b8972e; border-radius: 2px; }
  .b03-vs .col .bx.diff { background: #f6eed6; border-color: #d5bd68; }
  .b03-vs .btns { display: grid; gap: 6px; padding-top: 42px; }
  .b03-divbar { position: absolute; width: 5px; border-radius: 3px; background: #b8972e; }
  .b03-chart { position: absolute; left: 70px; top: 96px; width: 1460px; height: 610px; }
  .b03-chart svg { display: block; overflow: visible; }
  .b03-legend { position: absolute; left: 160px; right: 160px; top: 712px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 28px; }
  .b03-legend button { display: inline-flex; align-items: center; gap: 10px; border: 0; background: transparent; cursor: pointer; font: 700 20px/1.2 "DM Sans", sans-serif; color: #0d1e3a; padding: 4px 6px; border-radius: 8px; }
  .b03-legend button:hover { background: rgba(13,30,58,.05); }
  .b03-legend button.off { color: #a3abb8; }
  .b03-legend i { width: 30px; height: 6px; border-radius: 3px; display: inline-block; }
  .b03-legend button.off i { background: #cbd5e3 !important; }
  .b03-tip { position: absolute; z-index: 20; pointer-events: none; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 10px; box-shadow: 0 14px 30px rgba(13,30,58,.16); padding: 10px 14px; font: 500 16px/1.5 "DM Sans", sans-serif; color: #0d1e3a; white-space: nowrap; }
  .b03-tip b { font-weight: 700; }
  .b03-tip .yr { font: 700 13px/1 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #8a6e22; margin-bottom: 6px; }
  `);

  /* shared CAT words live on ca2 so an edit shows on every CAT screen */
  const tc = (k, o) => EFA.cp('ca2', k, o);
  const tt = (k) => EFA.wording.get('ca2', k, ((EFA.screens.ca2 || {}).copy || {})[k] || '');
  const esc = (x) => EFA.util.esc(x);
  const chev = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  const ICO = {
    first: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 6l-6 6 6 6M7 6v12"/></svg>',
    prev: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    next: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    last: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 6l6 6-6 6M17 6v12"/></svg>',
    plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    reset: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5"/></svg>',
    trash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>',
    disk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 4h12.5L20 7.5V20H4z"/><path d="M8 4v5h7V4M7.5 20v-6.5h9V20"/><path d="M13 5.6v2" stroke-linecap="round"/></svg>'
  };
  const SERIES = [P.navy, P.gold, P.steel, '#667389', P.navy4, P.goldDeep, P.mist2, '#3c5d92'];

  /** spec number parser: negative if it starts with -, $-, or an en dash; digits and "." only; 2 decimals if a point exists */
  function parseNum(s) {
    s = String(s == null ? '' : s).trim();
    const neg = /^(-|\$-|–|\$–)/.test(s);
    const t = s.replace(/[^0-9.]/g, '');
    if (!t || t === '.') return 0;
    let v = parseFloat(t);
    if (!isFinite(v)) return 0;
    if (t.indexOf('.') >= 0) v = Math.round(v * 100) / 100;
    return neg ? -v : v;
  }
  const show = (v, kind) => (kind === 'money' ? F.money(v) : kind === 'pct' ? `${+(+v || 0).toFixed(2)}%` : kind === 'text' ? v : String(Math.round(+v || 0)));

  /* ---------- engine state per client (memory across ca2 to ca5; resets when the client changes) ---------- */
  let CATS = null, MENU = null;
  function catState() {
    const client = EFA.clients.active || '_none';
    if (!CATS || CATS.client !== client) CATS = { client, st: CATE.load(EFA.clients.get('cat', 'saved', null)) };
    return CATS.st;
  }
  function pickAB(st) {
    const ids = st.accounts.map((a) => a.id);
    if (!ids.includes(st._A)) st._A = null;
    if (!ids.includes(st._B)) st._B = null;
    if (!st._A && ids.length) st._A = ids.find((id) => id !== st._B) || null;
    if (!st._B && ids.length > 1) st._B = ids.find((id) => id !== st._A) || null;
  }
  const accById = (st, id) => st.accounts.find((a) => a.id === id) || null;
  function calcNow(ctx, st) { const ok = CATE.calculate(st); if (!ok) ctx.toast(tt('msg_solver'), 4200); return ok; }
  function calcIfNeeded(ctx, st) { if (st._dirty || st.accounts.some((a) => !a._r || a._r.length !== st.yearsToProject)) calcNow(ctx, st); }
  const usesMarket = (a) => a && a.useMarket && a.type !== 'CVLI' && !(a.type === 'Annuity' && a.useIllus);

  /* ---------- small dropdown (labels stay editable copy) ---------- */
  function dd(id, labelHtml, cls) { return `<button type="button" class="b03-dd ${cls || ''}" data-dd="${id}"><span class="lbl">${labelHtml}</span>${chev}</button>`; }
  function closeMenu() { if (MENU) { MENU.el.remove(); document.removeEventListener('mousedown', MENU.off, true); MENU = null; } }
  function openMenu(ctx, btn, items, onPick) {
    closeMenu();
    const sr = ctx.el.getBoundingClientRect(), br = btn.getBoundingClientRect(), k = sr.width / 1600 || 1;
    const m = document.createElement('div'); m.className = 'b03-menu';
    m.innerHTML = items.map((it) => `<button type="button" data-v="${esc(it.value)}" class="${it.on ? 'on' : ''}" ${it.disabled ? 'disabled' : ''}>${it.html}</button>`).join('');
    ctx.el.appendChild(m);
    const x = (br.left - sr.left) / k, y = (br.bottom - sr.top) / k + 6;
    m.style.left = x + 'px'; m.style.top = y + 'px'; m.style.minWidth = (br.width / k) + 'px';
    if (y + m.offsetHeight > 890) m.style.top = Math.max(8, (br.top - sr.top) / k - m.offsetHeight - 6) + 'px';
    if (x + m.offsetWidth > 1592) m.style.left = Math.max(8, 1592 - m.offsetWidth) + 'px';
    m.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b || b.disabled || EFA.edit.on) return; closeMenu(); onPick(b.dataset.v); });
    const off = (e) => { if (!m.contains(e.target) && !btn.contains(e.target)) closeMenu(); };
    setTimeout(() => document.addEventListener('mousedown', off, true), 0);
    if (EFA.edit.on) EFA.edit.arm(m);
    MENU = { el: m, off };
  }
  const itemMenu = (st, cur) => CATE.ITEMS.map((it) => ({ value: it, html: tc('it.' + it), on: it === cur }));
  const accMenu = (st, cur) => st.accounts.map((a) => ({ value: a.id, html: esc(a.name), on: a.id === cur }));

  /* ---------- worksheets ---------- */
  function accountSheet(st, a, size) {
    const cols = [{ field: 'year', header: tc('ws.year'), type: 'year' }].concat(CATE.WS[a.type].map(([f, k, ty]) => ({ field: f, header: tc('ws.' + k), type: ty === 'pct' ? 'pct' : 'money', dp: ty === 'pct' ? 2 : 0 })));
    return { heading: `${esc(a.name)} ${tc('ws.suffix')}`, size: size || 'full', columns: cols, rows: CATE.worksheetRows(a), filter: 'year', disclosures: ['hypothetical', 'notAdvice'], file: `${a.name} worksheet` };
  }
  function wsOpen(ctx, data) { const W = lib('worksheet'); if (W) W.open(ctx, data); }

  /* ---------- year controls, shuffle, what-if (ca3, ca4, ca5) ---------- */
  function yearCtl(ctx, st) {
    return `<div class="b03-ctl">${tc('l.year')}
        <button type="button" class="b03-ib" data-yr="-100">${ICO.first}</button><button type="button" class="b03-ib" data-yr="-1">${ICO.prev}</button>
        <input class="b03-yr" data-yrbox="1" inputmode="numeric" value="${st._year || 1}">
        <button type="button" class="b03-ib" data-yr="1">${ICO.next}</button><button type="button" class="b03-ib" data-yr="100">${ICO.last}</button></div>
      <div class="b03-ctl" style="gap:18px">
        <label class="b03-chk"><input type="checkbox" data-step="1">${tc('l.step')}</label>
        <span class="b03-ctl">${tc('l.scale')}<input type="range" class="b03-range" min="1" max="200" step="1" value="${st.tankFactor}" data-scale="1"></span></div>`;
  }
  function wireYear(ctx, st, refresh) {
    const N = () => st.yearsToProject;
    const setY = (y) => { st._year = Math.max(1, Math.min(N(), Math.round(y) || 1)); const b = ctx.$('[data-yrbox]'); if (b) b.value = st._year; refresh(); };
    ctx.on(ctx.$$('[data-yr]'), 'click', (e, b) => setY((st._year || 1) + +b.dataset.yr));
    const box = ctx.$('[data-yrbox]');
    if (box) {
      box.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') box.blur(); });
      box.addEventListener('change', () => setY(parseNum(box.value)));
    }
    const chk = ctx.$('[data-step]');
    if (chk) chk.addEventListener('change', () => {
      if (EFA.edit.on) { chk.checked = false; return; }
      const tick = () => {
        if (!chk.checked || !chk.isConnected) return;
        if ((st._year || 1) >= N()) { chk.checked = false; return; }
        setY((st._year || 1) + 1);
        ctx.timeout(tick, 500);
      };
      if (chk.checked) ctx.timeout(tick, 500);
    });
    const sc = ctx.$('[data-scale]');
    if (sc) sc.addEventListener('input', () => { st.tankFactor = +sc.value || 100; refresh(); });
  }
  function shuffleCtl(ctx, st) {
    return `<div class="b03-ctl b03-shuf">${tc('l.shuffle')}<button type="button" class="b03-ib" data-sh="-1">${ICO.prev}</button>
      <input class="b03-yr" data-shbox="1" inputmode="numeric" value="${st.mhOffset || 0}"><button type="button" class="b03-ib" data-sh="1">${ICO.next}</button></div>`;
  }
  function wireShuffle(ctx, st, after) {
    const set = (v) => { st.mhOffset = Math.round(v) || 0; const b = ctx.$('[data-shbox]'); if (b) b.value = st.mhOffset; st._dirty = true; calcNow(ctx, st); after(); };
    ctx.on(ctx.$$('[data-sh]'), 'click', (e, b) => set((st.mhOffset || 0) + +b.dataset.sh));
    const box = ctx.$('[data-shbox]');
    if (box) { box.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') box.blur(); }); box.addEventListener('change', () => set(parseNum(box.value))); }
  }
  function whatIf(ctx, st, titleKey) {
    return `<div class="b03-wi"><div class="t">${tc(titleKey)}</div>
      <label class="f">${tc('l.ord')}<input class="b03-in" data-wi="wdTaxOrd" value="${show(st.wdTaxOrd, 'pct')}"></label>
      <label class="f">${tc('l.cg')}<input class="b03-in" data-wi="wdTaxCG" value="${show(st.wdTaxCG, 'pct')}"></label></div>`;
  }
  function wireWhatIf(ctx, st, after) {
    ctx.$$('[data-wi]').forEach((inp) => {
      inp.addEventListener('focus', () => { inp.value = String(st[inp.dataset.wi]); inp.select(); });
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
      inp.addEventListener('blur', () => {
        const v = parseNum(inp.value), k = inp.dataset.wi, changed = v !== st[k];
        st[k] = v; inp.value = show(v, 'pct');
        if (changed) { st._dirty = true; st._unsaved = true; calcNow(ctx, st); after(); }
      });
    });
  }
  const catDisc = (style) => `<p class="st-disclaimer" style="${style}">${tc('disc')} ${discHtml('hypothetical')} ${discHtml('loans')}</p>`;
  function noAccounts(ctx) {
    return `<div class="b03-card b03-none">${tc('none', { tag: 'p' })}<button type="button" class="st-pill" data-goca2="1">${tc('none_btn')}</button></div>`;
  }
  function wireNone(ctx) { ctx.on(ctx.$$('[data-goca2]'), 'click', () => { const i = EFA.player.pres.screens.findIndex((x) => x.id === 'ca2'); if (i >= 0) EFA.player.goScreen(i); }); }

  /* ---------- ca1 ---------- */
  EFA.screen('ca1', {
    title: 'Why compare account types',
    copy: {
      heading: 'Comparing Account Types',
      p1: 'Choosing the right account types for your savings can get complicated',
      p2: 'Most advice focuses on investment choices and returns',
      p3: 'Yet other key factors will shape your savings plan',
      p4: 'How each account is taxed, and when you can reach your money, can matter just as much',
      p5: 'Seeing your options side by side makes the choice clearer',
      _notes: 'Most conversations about saving stop at investments and returns. How an account is taxed, and when you can use the money, can matter just as much.\n\n- Ask: When you chose the accounts you save in today, how much did taxes and access factor into that decision?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b03-head">${ctx.t('heading', { tag: 'h1', cls: 'st-h1' })}</div>
        <div class="b03-ca1">${['p1', 'p2', 'p3', 'p4', 'p5'].map((k) => `<div class="b03-lrow">${dart(72)}<div class="b03-card">${ctx.t(k)}</div></div>`).join('')}</div>`;
    }
  });

  /* ---------- ca2: accounts to compare (setup + shared words) ---------- */
  const CAT_COPY = {
    heading: 'Accounts to Compare', shared: 'Shared Assumptions', add: 'Add New Account', save: 'Save changes', saved: 'All changes saved',
    savedToast: 'Saved to this client file.',
    empty: 'Add the accounts you want to compare. Every account receives the same after-tax dollars on the same schedule.',
    'sf.yearsToProject': 'Years to Project', 'sf.taxOrd': 'Effective Tax Rate', 'sf.taxCG': 'Capital Gains Tax Rate', 'sf.infl': 'Inflation Rate',
    'sf.contrib': 'After-Tax Contributions', 'sf.inflateCont': 'Inflate Contributions', 'sf.contStart': 'Contribution Start Year', 'sf.contEnd': 'Contribution End Year',
    'sf.equalWd': 'Equal After-Tax Withdrawals?', 'sf.inflateWd': 'Inflate Withdrawals', 'sf.wdStart': 'Withdrawal Start Year', 'sf.wdEnd': 'Withdrawal End Year',
    'f.name': 'Account Name', 'f.tank': 'Tank', 'f.useIllus': 'Use Illustration?', 'f.initialValue': 'Initial Value', 'f.costBasis': 'Cost Basis',
    'f.match': 'Company Match', 'f.inflateMatch': 'Inflate Match?', 'f.matchStart': 'Match Start Year', 'f.matchEnd': 'Match End Year',
    'f.pctOrd': '% Ordinary', 'f.pctCG': '% Capital Gains', 'f.taxTreatment': 'Tax Treatment', 'f.qualified': 'Qualified?', 'f.roth': 'Roth?',
    'f.simpleInterest': 'Simple Interest?', 'f.incomeStream': 'Income Stream?', 'f.incomeAmount': 'Income Amount', 'f.simulateLoan': 'Simulate Loan?',
    'f.loanRate': 'Loan Rate', 'f.reserve': 'Reserve', 'f.growthRate': 'Growth Rate', 'f.useMarket': 'Use Market History?', 'f.market': 'Market',
    'f.mStart': 'Start Year', 'f.mEnd': 'End Year', 'f.marketLimits': 'Market Limits?', 'f.floorOn': 'Floor', 'f.bufferOn': 'Buffer', 'f.capOn': 'Cap',
    'f.partOn': 'Participation', 'f.spreadOn': 'Spread', 'f.fee': 'Fees',
    'v.Safe': 'Safe', 'v.Risk': 'Risk', 'v.Average': 'Average', 'v.FIFO': 'Basis First', 'v.LIFO': 'Gains First',
    't.Taxable': 'Taxable', 't.TaxFree': 'Tax-Free', 't.TDBT': 'Tax-Deferred, Pre-Tax Dollars', 't.TDAT': 'Tax-Deferred, After-Tax Dollars',
    't.Annuity': 'Annuity', 't.CVLI': 'Cash Value Life Insurance',
    'tc.Taxable': 'Taxable', 'tc.TaxFree': 'Tax-Free', 'tc.TDBT': 'Pre-Tax Deferred', 'tc.TDAT': 'After-Tax Deferred', 'tc.Annuity': 'Annuity', 'tc.CVLI': 'Cash Value Life',
    'dn.Taxable': 'Taxable Account', 'dn.TaxFree': 'Tax-Free Account', 'dn.TDBT': 'Pre-Tax Plan', 'dn.TDAT': 'After-Tax Plan', 'dn.Annuity': 'Annuity', 'dn.CVLI': 'Cash Value Life',
    'm.dji': 'Dow Jones Industrials', 'm.sp': 'S&P 500 Price', 'm.sptr': 'S&P 500 Total Return', 'm.rut': 'Russell 2000', 'm.ndx': 'NASDAQ Composite',
    'm.msci': 'MSCI World Equity', 'm.gov10': '10-Year Govt Bonds', 'm.muni': '20-Year Muni Bonds', 'm.corp': '30-Year Corp Bonds',
    'it.contrib': 'Contributions', 'it.contribC': 'Contributions, Cumulative', 'it.match': 'Company Match', 'it.matchC': 'Company Match, Cumulative',
    'it.wd': 'Withdrawals', 'it.wdC': 'Withdrawals, Cumulative', 'it.life': 'Net Lifestyle Dollars', 'it.lifeC': 'Net Lifestyle Dollars, Cumulative',
    'it.boy': 'Starting Balance', 'it.growth': 'Growth', 'it.eoy': 'Ending Balance', 'it.tio': 'Taxable Income, Ordinary', 'it.ticg': 'Taxable Income, Capital Gains',
    'it.tax': 'Taxes Paid', 'it.taxC': 'Taxes Paid, Cumulative', 'it.taxPot': 'Potential Taxes', 'it.spend': 'Spendable Income', 'it.spendC': 'Spendable Income, Cumulative',
    'it.spendPV': "Spendable Income, Today's Dollars", 'it.spendCPV': "Spendable Income, Cumulative, Today's Dollars", 'it.tdBal': 'Tax-Deferred Balance',
    'it.cgBal': 'Capital Gains Balance', 'it.tfBal': 'Tax-Free Balance', 'it.nw': 'Net Worth', 'it.ndb': 'Net Death Benefit', 'it.db': 'Death Benefit', 'it.estate': 'Estate Value',
    'ws.year': 'Year', 'ws.suffix': 'Worksheet', 'ws.iv': 'Initial Value', 'ws.c': 'Contribution', 'ws.w': 'Withdrawal', 'ws.boy': 'Starting Balance', 'ws.fees': 'Fees Paid',
    'ws.ror': 'Annual Return', 'ws.growth': 'Growth', 'ws.tax': 'Taxes Paid', 'ws.eoy': 'Ending Balance', 'ws.tfbal': 'Tax-Free Balance', 'ws.cgbal': 'Capital Gain Balance',
    'ws.tdbal': 'Tax-Deferred Balance', 'ws.spend': 'Spendable Income', 'ws.spendC': 'Spendable Income, Cumulative', 'ws.feesC': 'Fees Paid, Cumulative',
    'ws.taxC': 'Taxes Paid, Cumulative', 'ws.estate': 'Estate Value', 'ws.taxEff': 'Tax Effect', 'ws.match': 'Company Match', 'ws.prem': 'Premium',
    'ws.av': 'Accumulation Value', 'ws.csv': 'Cash Surrender Value', 'ws.db': 'Death Benefit', 'ws.ndb': 'Net Death Benefit', 'ws.borC': 'Borrowed Cash Flow, Cumulative',
    'ws.loan': 'Simulated Loan Balance', 'ws.wC': 'Withdrawals, Cumulative', 'ws.estateDB': 'Estate Value (Death Benefit less Loans)',
    'dlg.addTitle': 'Add New Account', 'dlg.type': 'Account Type', 'dlg.name': 'Account Name', 'dlg.cancel': 'Cancel', 'dlg.save': 'Save',
    'dlg.delTitle': 'Delete Account', 'dlg.delQ': 'Remove this account from the comparison? Its numbers will be cleared.', 'dlg.del': 'Delete', 'dlg.keep': 'Keep',
    'il.promptCv': 'Illustration (XML or PDF file)', 'il.promptAn': 'Illustration (PDF file)', 'il.choose': 'Choose File', 'il.edit': 'Edit Illustration',
    'il.drop': 'or drop the file here', 'il.noneYet': 'No illustration values yet', 'il.years': 'years of values entered',
    'il.title': 'Edit Illustration Data', 'il.hint': 'Click a cell to type a value. Right-click a cell to paste a column of values copied from a spreadsheet.',
    'il.interp': 'Interpolate Missing Values', 'il.save': 'Save Changes', 'il.contrib': 'Contribution', 'il.prem': 'Premium', 'il.w': 'Withdrawal',
    'il.cv': 'Contract Value', 'il.sv': 'Surrender Value', 'il.av': 'Accumulation Value', 'il.csv': 'Cash Surrender Value', 'il.db': 'Death Benefit',
    'pa.title': 'Paste Data', 'pa.how': 'Click in the box, paste from your clipboard, then choose a button.', 'pa.paste': 'Paste', 'pa.add': 'Paste (+)',
    'pa.sub': 'Paste (-)', 'pa.zero': '(or) Zero Remaining Values',
    msg_ok: 'Illustration values imported.', msg_unknown: 'That file is not in an illustration format this tool recognizes. Use Edit Illustration to type or paste the values.',
    msg_type: 'That file type cannot be used for this account.', msg_access: 'That file could not be read. Please try again.', msg_proc: 'Processing',
    msg_solver: 'No solution was found in 100 tries. Please check that the assumptions are realistic.',
    pending: 'Being verified', 'l.choose': 'Choose a market', loading: 'Diagram loading',
    disc: 'Hypothetical comparison using the flat tax rates and growth rates entered here; not tax advice. Tax-free values are income-tax-free. Taxable estate values assume no tax on unrealized gains at death. Results using market history with floors, caps or participation rates are hypothetical back-tests of index crediting, not product illustrations.',
    'l.year': 'Year', 'l.step': 'Step', 'l.scale': 'Scale', 'l.shuffle': 'Shuffle Market', 'l.ord': 'Ordinary', 'l.cg': 'Cap Gains',
    'l.wdRates': 'Withdrawal Tax Rates', 'l.wdRate': 'Withdrawal Tax Rate', 'l.values': 'Values', 'l.diff': 'Difference', 'l.pick': 'Please choose',
    'ph.acc': 'Select Account to View', 'ph.val': 'Select Value to View', 'ph.sel': 'Select..',
    none: 'Add the accounts you want to compare on the setup screen, and they will appear here.', none_btn: 'Set Up Accounts',
    'sum.title': 'Summary for Year', 'sum.boy': 'Starting Balance', 'sum.contrib': 'Contributions', 'sum.growth': 'Growth', 'sum.wd': 'Withdrawals',
    'sum.tax': 'Taxes Paid', 'sum.eoy': 'End of Year Balance', 'sum.pot': 'Potential Taxes', 'sum.estate': 'Estate Value',
    'cap.bal': 'Account Balance:', 'cap.loan': 'Loan Balance:', 'cap.ndb': 'Net Death Benefit:',
    'vs.resetQ': 'Reset the values strip to the default list?', 'vs.reset': 'Reset',
    _notes: 'This is where we set up the comparison. Every account gets the same after-tax dollars on the same schedule, so the only differences are tax treatment, access and growth.\n\n- Add the accounts you want to compare, then save to the client file.\n- Ask: Which of these accounts do you already own today?\nPAUSE'
  };
  const SHARED = [['yearsToProject', 'int'], ['taxOrd', 'pct'], ['taxCG', 'pct'], ['infl', 'pct'], ['contrib', 'money'], ['inflateCont', 'sw'],
    ['contStart', 'int'], ['contEnd', 'int'], ['equalWd', 'sw'], ['inflateWd', 'sw'], ['wdStart', 'int'], ['wdEnd', 'int']];
  function accFields(a) {
    const t = a.type, ill = t === 'Annuity' && a.useIllus, out = [['name', 'text'], ['tank', 'seg', ['Safe', 'Risk']]];
    if (t === 'Annuity') out.push(['useIllus', 'sw']);
    if (ill || t === 'CVLI') out.push(['illus', 'illus']);
    if (t !== 'CVLI' && !ill) out.push(['initialValue', 'money']);
    if (t === 'Taxable' || t === 'TDAT' || (t === 'Annuity' && !ill)) out.push(['costBasis', 'money']);
    if (t === 'TDBT' || t === 'TDAT') out.push(['match', 'money'], ['inflateMatch', 'sw'], ['matchStart', 'int'], ['matchEnd', 'int']);
    if (t === 'Taxable') out.push(['pctOrd', 'pct'], ['pctCG', 'pct']);
    if (t === 'Taxable' || t === 'TDAT' || t === 'Annuity') out.push(['taxTreatment', 'segw', ['Average', 'FIFO', 'LIFO']]);
    if (t === 'Annuity') { out.push(['qualified', 'sw']); if (a.qualified) out.push(['roth', 'sw']); }
    if (t === 'Annuity' && !ill) { out.push(['simpleInterest', 'sw'], ['incomeStream', 'sw']); if (a.incomeStream) out.push(['incomeAmount', 'money']); }
    if (t === 'CVLI') { out.push(['simulateLoan', 'sw']); if (a.simulateLoan) out.push(['loanRate', 'pct'], ['reserve', 'money']); }
    const mk = t !== 'CVLI' && !ill;
    if (mk && !a.useMarket) out.push(['growthRate', 'pct']);
    if (mk) out.push(['useMarket', 'sw']);
    if (mk && a.useMarket) {
      out.push(['market', 'market'], ['mStart', 'year'], ['mEnd', 'year']);
      if (t === 'Annuity' || t === 'TaxFree') {
        out.push(['marketLimits', 'sw']);
        if (a.marketLimits) [['floorOn', 'floor'], ['bufferOn', 'buffer'], ['capOn', 'cap'], ['partOn', 'part'], ['spreadOn', 'spread']].forEach(([k, v]) => out.push([k, 'swpct', v]));
      }
    }
    if (t !== 'CVLI') out.push(['fee', 'pct']);
    return out;
  }
  function illusCount(a) { return (a.illus || []).filter((r) => r && (+r.prem || +r.w || +r.av || +r.sv || +r.db)).length; }
  function fieldHtml(st, a, f) {
    const [k, kind, extra] = f, v = a[k], lb = tc('f.' + k, { cls: 'lb' });
    switch (kind) {
      case 'text': return `<div class="b03-fr">${lb}<input class="b03-in txt" data-af="${k}" data-kind="text" value="${esc(v)}"></div>`;
      case 'money': case 'pct': case 'int': return `<div class="b03-fr">${lb}<input class="b03-in" data-af="${k}" data-kind="${kind}" value="${esc(show(v, kind))}"></div>`;
      case 'sw': return `<div class="b03-fr">${lb}<button type="button" class="b03-sw" data-asw="${k}" aria-pressed="${!!v}"></button></div>`;
      case 'seg': case 'segw': return `<div class="b03-fr ${kind === 'segw' ? 'wide' : ''}">${lb}<div class="b03-seg" role="radiogroup" ${kind === 'segw' ? 'style="justify-self:start"' : ''}>${extra.map((x) => `<button type="button" data-aseg="${k}" data-v="${x}" aria-checked="${v === x}">${tc('v.' + x)}</button>`).join('')}</div></div>`;
      case 'swpct': return `<div class="b03-fr">${lb}<div style="display:flex;gap:8px;justify-content:flex-end;align-items:center">${v ? `<input class="b03-in" style="width:80px" data-af="${extra}" data-kind="pct" value="${esc(show(a[extra], 'pct'))}">` : ''}<button type="button" class="b03-sw" data-asw="${k}" aria-pressed="${!!v}"></button></div></div>`;
      case 'market': return `<div class="b03-fr">${lb}${CATE.available().length ? dd('mkt', CATE.series(a.market) ? tc('m.' + a.market) : tc('l.choose')) : `<span class="b03-pend" style="justify-self:end">${tc('pending')}</span>`}</div>`;
      case 'year': {
        const r = CATE.range(a.market); if (!r) return '';
        let o = ''; for (let y = r[0]; y <= r[1]; y++) o += `<option value="${y}" ${+v === y ? 'selected' : ''}>${y}</option>`;
        return `<div class="b03-fr">${lb}<select class="b03-in" data-ay="${k}">${o}</select></div>`;
      }
      case 'illus': {
        const n = illusCount(a);
        return `<div class="b03-fr wide">${tc(a.type === 'CVLI' ? 'il.promptCv' : 'il.promptAn', { cls: 'lb' })}
          <div class="b03-drop" data-drop="1"><div class="row"><button type="button" class="b03-mini" data-file="1">${tc('il.choose')}</button>${tc('il.drop')}</div>
          <div class="row">${a._status ? a._status : n ? `${num(n)} ${tc('il.years')}` : tc('il.noneYet')}</div>
          <div class="row"><button type="button" class="b03-mini dark" data-edit="1">${tc('il.edit')}</button></div>
          <input type="file" hidden data-fin="1" accept="${a.type === 'CVLI' ? '.xml,.pdf,text/xml,application/xml,application/pdf' : '.pdf,application/pdf'}"></div></div>`;
      }
      default: return '';
    }
  }
  const cardHtml = (st, a) => `<div class="b03-card b03-acard" data-acc="${a.id}"><div class="hd"><span>${tc('tc.' + a.type)}</span><button type="button" class="b03-trash" data-del="1" aria-label="Delete">${ICO.trash}</button></div>
      <div class="bd">${accFields(a).map((f) => fieldHtml(st, a, f)).join('')}</div></div>`;
  const sharedRow = (st, [k, kind]) => kind === 'sw'
    ? `<div class="b03-fr">${tc('sf.' + k, { cls: 'lb' })}<button type="button" class="b03-sw" data-ssw="${k}" aria-pressed="${!!st[k]}"></button></div>`
    : `<div class="b03-fr">${tc('sf.' + k, { cls: 'lb' })}<input class="b03-in" data-sf="${k}" data-kind="${kind}" value="${esc(show(st[k], kind))}"></div>`;

  /** XML illustration: YEAR records with ID, PREMIUM, LOAN, CASHVAL, DEATHBEN (child elements or attributes, any root) */
  function parseIllusXml(text) {
    let doc;
    try { doc = new DOMParser().parseFromString(text, 'application/xml'); } catch (e) { return null; }
    if (!doc || doc.getElementsByTagName('parsererror').length) return null;
    const years = Array.from(doc.getElementsByTagName('*')).filter((n) => /^year$/i.test(n.localName));
    if (!years.length) return null;
    const val = (n, name) => {
      const c = Array.from(n.children).find((x) => x.localName.toUpperCase() === name);
      const raw = c ? c.textContent : (n.getAttribute(name) != null ? n.getAttribute(name) : n.getAttribute(name.toLowerCase()));
      return raw == null ? null : parseNum(raw);
    };
    const out = years.map((n) => ({ id: val(n, 'ID'), prem: val(n, 'PREMIUM') || 0, w: val(n, 'LOAN') || 0, cv: val(n, 'CASHVAL') || 0, db: val(n, 'DEATHBEN') || 0 }))
      .filter((r) => r.id >= 1);
    return out.length ? out : null;
  }
  /** clipboard text to numbers (spec ca2 paste popover) */
  function parseClip(text) {
    text = String(text || '');
    const nCR = (text.match(/\r/g) || []).length, nLF = (text.match(/\n/g) || []).length, sep = nCR > nLF ? '\r' : '\n';
    let t = text.replace(sep === '\r' ? /[^0-9\-.\t\r]/g : /[^0-9\-.\t\n]/g, '');
    if (t.endsWith(sep)) t = t.slice(0, -1);
    if (!t.length) return [];
    return t.split(sep).map((line) => { if (line.indexOf('\t') >= 0) line = line.split('\t')[0]; const v = parseFloat(line); return isFinite(v) ? v : 0; });
  }
  /** fill gaps between positive values with straight-line steps (spec ca2 "Interpolate") */
  function interpolate(rows, cols) {
    cols.forEach((c) => {
      let e = -1;
      for (let a = 0; a < rows.length; a++) {
        const v = +rows[a][c] || 0;
        if (v > 0) {
          if (e >= 0 && a - e > 1) { const ve = +rows[e][c], step = Math.round(((v - ve) / (a - e)) * 100 + 1e-14) / 100; for (let k = 0; k <= a - e - 1; k++) rows[e + k][c] = ve + k * step; }
          e = a;
        }
      }
    });
  }
  function dialog(ctx, titleHtml, bodyHtml, width) {
    const ov = ctx.overlay({ title: titleHtml, html: `<div class="b03-dlg">${bodyHtml}</div>` });
    if (width) ov.querySelector('.st-overlay-in').style.width = width + 'px';
    return ov;
  }

  EFA.screen('ca2', {
    title: 'Accounts to compare',
    copy: CAT_COPY,
    render(ctx) {
      let st = catState();
      if (!st.accounts.length) { const saved = EFA.clients.get('cat', 'saved', null); if (saved && saved.accounts && saved.accounts.length) { CATS.st = CATE.load(saved); st = CATS.st; } }
      pickAB(st);
      ctx.el.innerHTML = `<div class="b03-cat-h">${ctx.t('heading', { tag: 'h1', cls: 'st-h1' })}</div>
        <button type="button" class="b03-save" data-save="1"></button>
        <div class="b03-card b03-sa"><div class="b03-hd">${ctx.t('shared')}</div><div class="bd" data-sab="1"></div>
          <div class="b03-addl"><button type="button" class="b03-plus" data-add="1" aria-label="Add">${ICO.plus}</button>${ctx.t('add', { cls: 'b03-link', attrs: 'data-add="1"' })}</div></div>
        <div class="b03-strip" data-strip="1"></div>
        ${catDisc('position:absolute;left:520px;width:770px;bottom:10px;margin:0;font-size:12px;line-height:1.42')}`;
      const strip = ctx.$('[data-strip]'), sab = ctx.$('[data-sab]');
      const saveBtn = () => { const b = ctx.$('[data-save]'); b.classList.toggle('dirty', !!st._unsaved); b.innerHTML = `${ICO.disk}${ctx.t(st._unsaved ? 'save' : 'saved')}`; if (EFA.edit.on) EFA.edit.arm(b); };
      const changed = (recalc) => { st._dirty = true; st._unsaved = true; saveBtn(); if (recalc) calcNow(ctx, st); };
      const paintShared = () => { sab.innerHTML = SHARED.map((f) => sharedRow(st, f)).join(''); if (EFA.edit.on) EFA.edit.arm(sab); };
      /* refresh shown values without rebuilding (keeps focus when moving from field to field) */
      const syncShared = () => {
        sab.querySelectorAll('[data-sf]').forEach((i) => { if (i !== document.activeElement) i.value = show(st[i.dataset.sf], i.dataset.kind); });
        sab.querySelectorAll('[data-ssw]').forEach((b) => b.setAttribute('aria-pressed', !!st[b.dataset.ssw]));
      };
      const paintCard = (a) => { const old = strip.querySelector(`[data-acc="${a.id}"]`); if (!old) return paintStrip(); const sc = old.querySelector('.bd').scrollTop; old.outerHTML = cardHtml(st, a); const n = strip.querySelector(`[data-acc="${a.id}"]`); n.querySelector('.bd').scrollTop = sc; if (EFA.edit.on) EFA.edit.arm(n); };
      const paintStrip = () => {
        strip.innerHTML = st.accounts.length ? st.accounts.map((a) => cardHtml(st, a)).join('')
          : `<div class="b03-empty"><button type="button" class="b03-plus" data-add="1" aria-label="Add">${ICO.plus}</button>${ctx.t('empty', { tag: 'p' })}${ctx.t('add', { cls: 'b03-link', attrs: 'data-add="1" style="font:700 20px/1 DM Sans,sans-serif"' })}</div>`;
        if (EFA.edit.on) EFA.edit.arm(strip);
      };
      saveBtn(); paintShared(); paintStrip();
      const accOf = (el) => { const c = el && el.closest && el.closest('[data-acc]'); return c ? accById(st, c.dataset.acc) : null; };
      const onBtn = (el, fn) => el && el.addEventListener('click', (e) => { if (!EFA.edit.on) fn(e); });

      /* typed values: show the raw number while editing, parse on blur (spec parser) */
      const onFocus = (e) => {
        const inp = e.target; if (!inp.matches || !inp.matches('input.b03-in')) return;
        const k = inp.dataset.af || inp.dataset.sf; if (!k || inp.dataset.kind === 'text') return;
        const src = inp.dataset.sf ? st : accOf(inp); if (src) { inp.value = String(+src[k] || 0); inp.select(); }
      };
      const onBlur = (e) => {
        const inp = e.target; if (!inp.matches || !inp.matches('input.b03-in')) return;
        const kind = inp.dataset.kind;
        if (inp.dataset.sf) {
          const k = inp.dataset.sf, v = parseNum(inp.value), N0 = st.yearsToProject;
          if (k === 'yearsToProject') st.yearsToProject = Math.max(1, Math.min(100, Math.round(v)));
          else if (k === 'contStart') st.contStart = Math.max(1, Math.min(Math.round(v), st.contEnd));
          else if (k === 'contEnd') st.contEnd = Math.max(st.contStart, Math.min(Math.round(v), st.yearsToProject));
          else if (k === 'wdStart') st.wdStart = Math.max(0, Math.min(Math.round(v), st.wdEnd));
          else if (k === 'wdEnd') st.wdEnd = Math.max(st.wdStart, Math.min(Math.round(v), st.yearsToProject));
          else { st[k] = v; if (k === 'taxOrd') st.wdTaxOrd = v; if (k === 'taxCG') st.wdTaxCG = v; }
          if (k === 'yearsToProject') {
            const N = st.yearsToProject;
            st.contEnd = Math.min(st.contEnd, N); st.contStart = Math.min(st.contStart, st.contEnd);
            st.wdEnd = Math.min(st.wdEnd, N); st.wdStart = Math.min(st.wdStart, st.wdEnd);
          }
          const recalc = k === 'yearsToProject' && st.yearsToProject !== N0;
          inp.value = show(st[k], kind); syncShared(); changed(recalc);
          return;
        }
        const a = accOf(inp); if (!a) return;
        const k = inp.dataset.af;
        if (kind === 'text') { a.name = inp.value.trim() || a.name; inp.value = a.name; changed(); return; }
        let v = parseNum(inp.value);
        if (k === 'matchStart') v = Math.max(1, Math.min(Math.round(v), a.matchEnd));
        if (k === 'matchEnd') v = Math.max(a.matchStart, Math.min(Math.round(v), st.yearsToProject));
        a[k] = v;
        if (k === 'pctOrd') a.pctCG = 100 - v;
        if (k === 'pctCG') a.pctOrd = 100 - v;
        inp.value = show(v, kind);
        if (k === 'pctOrd' || k === 'pctCG') { const o = inp.closest('.bd').querySelector(`[data-af="${k === 'pctOrd' ? 'pctCG' : 'pctOrd'}"]`); if (o && o !== document.activeElement) o.value = show(a[k === 'pctOrd' ? 'pctCG' : 'pctOrd'], 'pct'); }
        changed();
      };
      ctx.el.addEventListener('focusin', onFocus);
      ctx.el.addEventListener('focusout', onBlur);
      ctx.el.addEventListener('keydown', (e) => { if (e.target.matches && e.target.matches('input.b03-in') && e.key === 'Enter') e.target.blur(); });
      ctx.el.addEventListener('change', (e) => {
        const t = e.target;
        if (t.matches('[data-ay]')) {
          const a = accOf(t); if (!a) return; const v = +t.value;
          if (t.dataset.ay === 'mStart') { a.mStart = v; if (a.mEnd < v) a.mEnd = v; } else { a.mEnd = v; if (a.mStart > v) a.mStart = v; }
          st.lastMarket = { market: a.market, start: a.mStart, end: a.mEnd };
          paintCard(a); changed();
        }
        if (t.matches('[data-fin]')) { const a = accOf(t); const f = t.files && t.files[0]; if (a && f) importFile(a, f); t.value = ''; }
      });
      const importFile = (a, file) => {
        const name = file.name || '', ext = (name.split('.').pop() || '').toLowerCase();
        const okExt = a.type === 'CVLI' ? ['xml', 'pdf'] : ['pdf'];
        if (!okExt.includes(ext)) { ctx.toast(ctx.text('msg_type'), 3600); return; }
        a._status = `<span class="b03-spin"></span> ${ctx.t('msg_proc')} ${esc(name)}`; paintCard(a);
        const finish = (msg) => { a._status = ''; paintCard(a); ctx.toast(ctx.text(msg), 4200); };
        if (ext === 'pdf') { ctx.timeout(() => finish('msg_unknown'), 600); return; }   // carrier PDF recognition is not part of this rebuild
        const r = new FileReader();
        r.onerror = () => finish('msg_access');
        r.onload = () => {
          const rows = parseIllusXml(String(r.result || ''));
          if (!rows) return finish('msg_unknown');
          const N = st.yearsToProject;
          for (let i = 0; i < N; i++) if (!a.illus[i]) a.illus[i] = { prem: 0, w: 0, av: 0, sv: 0, db: 0 };
          rows.forEach((x) => { if (x.id <= N) a.illus[x.id - 1] = { prem: x.prem, w: x.w, av: x.cv, sv: x.cv, db: x.db }; });
          changed(); finish('msg_ok');
        };
        try { r.readAsText(file); } catch (e) { finish('msg_access'); }
      };
      ctx.el.addEventListener('dragover', (e) => { const d = e.target.closest && e.target.closest('[data-drop]'); if (d) { e.preventDefault(); d.classList.add('over'); } });
      ctx.el.addEventListener('dragleave', (e) => { const d = e.target.closest && e.target.closest('[data-drop]'); if (d) d.classList.remove('over'); });
      ctx.el.addEventListener('drop', (e) => { const d = e.target.closest && e.target.closest('[data-drop]'); if (!d) return; e.preventDefault(); d.classList.remove('over'); const a = accOf(d), f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (a && f) importFile(a, f); });

      ctx.on(ctx.el, 'click', (e) => {
        const t = e.target;
        const hit = (sel) => t.closest && t.closest(sel);
        if (hit('[data-save]')) { if (!st._unsaved) return; EFA.clients.set('cat', 'saved', CATE.serialize(st)); st._unsaved = false; saveBtn(); ctx.toast(ctx.text('savedToast')); return; }
        if (hit('[data-add]')) return openAdd();
        let b = hit('[data-del]');
        if (b) {
          const a = accOf(b); if (!a) return;
          const ov = dialog(ctx, ctx.t('dlg.delTitle'), `<p><b>${esc(a.name)}</b></p>${ctx.t('dlg.delQ', { tag: 'p' })}<div class="btns"><button type="button" class="st-pill" data-no="1" style="background:transparent;color:#0d1e3a;border-color:#cbd5e3">${ctx.t('dlg.keep')}</button><button type="button" class="st-pill" data-yes="1">${ctx.t('dlg.del')}</button></div>`, 640);
          onBtn(ov.querySelector('[data-no]'), () => ov.close());
          onBtn(ov.querySelector('[data-yes]'), () => {
            ov.close();
            st.accounts = st.accounts.filter((x) => x !== a);
            if (st._A === a.id) st._A = null; if (st._B === a.id) st._B = null;
            pickAB(st); paintStrip(); changed();
          });
          return;
        }
        b = hit('[data-ssw]');
        if (b) { const k = b.dataset.ssw; st[k] = !st[k]; b.setAttribute('aria-pressed', !!st[k]); changed(); return; }
        b = hit('[data-asw]');
        if (b) {
          const a = accOf(b); if (!a) return; const k = b.dataset.asw;
          a[k] = !a[k];
          if (k === 'useMarket' && a.useMarket && !CATE.series(a.market)) CATE.setMarketDefaults(st, a);
          if (k === 'qualified' && !a.qualified) a.roth = false;
          paintCard(a); changed();
          return;
        }
        b = hit('[data-aseg]');
        if (b) { const a = accOf(b); if (!a) return; a[b.dataset.aseg] = b.dataset.v; b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', x === b)); changed(); return; }
        b = hit('[data-dd="mkt"]');
        if (b) {
          const a = accOf(b); if (!a) return;
          const av = CATE.available();
          openMenu(ctx, b, CATE.MARKETS.map((m) => ({ value: m, html: tc('m.' + m) + (av.includes(m) ? '' : ` <span class="b03-pend" style="margin-left:8px">${tc('pending')}</span>`), on: m === a.market, disabled: !av.includes(m) })), (m) => {
            const r = CATE.range(m); if (!r) return;
            a.market = m; a.mStart = r[0]; a.mEnd = r[1]; st.lastMarket = { market: m, start: r[0], end: r[1] };
            paintCard(a); changed();
          });
          return;
        }
        b = hit('[data-file]');
        if (b) { const d = b.closest('[data-drop]'); const inp = d && d.querySelector('[data-fin]'); if (inp) inp.click(); return; }
        b = hit('[data-edit]');
        if (b) { const a = accOf(b); if (a) openIllus(a); }
      });

      const openAdd = () => {
        let type = null;
        const ov = dialog(ctx, ctx.t('dlg.addTitle'), `${ctx.t('dlg.type', { cls: 'lb' })}
          <div class="types">${CATE.TYPES.map((x) => `<button type="button" data-t="${x}" aria-checked="false">${ctx.t('t.' + x)}</button>`).join('')}</div>
          ${ctx.t('dlg.name', { cls: 'lb' })}<input class="b03-in txt" data-n="1" autocomplete="off">
          <div class="btns"><button type="button" class="st-pill" data-no="1" style="background:transparent;color:#0d1e3a;border-color:#cbd5e3">${ctx.t('dlg.cancel')}</button><button type="button" class="st-pill" data-ok="1" disabled style="opacity:.45">${ctx.t('dlg.save')}</button></div>`, 860);
        const nm = ov.querySelector('[data-n]'), ok = ov.querySelector('[data-ok]');
        const upd = () => { const on = !!type && !!nm.value.trim(); ok.disabled = !on; ok.style.opacity = on ? 1 : 0.45; };
        ov.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
          if (EFA.edit.on) return;
          type = b.dataset.t; ov.querySelectorAll('[data-t]').forEach((x) => x.setAttribute('aria-checked', x === b));
          if (!nm.value.trim()) nm.value = ctx.text('dn.' + type);
          upd();
        }));
        nm.addEventListener('input', upd);
        nm.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter' && !ok.disabled) ok.click(); });
        onBtn(ov.querySelector('[data-no]'), () => ov.close());
        onBtn(ok, () => {
          if (ok.disabled) return;
          const a = CATE.newAccount(st, type, nm.value.trim());
          st.accounts.push(a); pickAB(st); ov.close(); paintStrip(); changed();
          strip.scrollLeft = strip.scrollWidth;
        });
      };

      const openIllus = (a) => {
        const N = st.yearsToProject;
        for (let i = 0; i < N; i++) if (!a.illus[i]) a.illus[i] = { prem: 0, w: 0, av: 0, sv: 0, db: 0 };
        const work = a.illus.slice(0, N).map((r) => Object.assign({}, r));
        const cols = ['prem', 'w', 'av', 'sv', 'db'];
        const hk = a.type === 'CVLI' ? { prem: 'il.prem', w: 'il.w', av: 'il.av', sv: 'il.csv', db: 'il.db' } : { prem: 'il.contrib', w: 'il.w', av: 'il.cv', sv: 'il.sv', db: 'il.db' };
        const cell = (v) => (+v ? F.num(Math.round(+v), 0) : '');
        const body = () => work.map((r, i) => `<tr><td>${i + 1}</td>${cols.map((c) => `<td data-r="${i}" data-c="${c}">${cell(r[c])}</td>`).join('')}</tr>`).join('');
        const ov = ctx.overlay({ wide: true, title: `${ctx.t('il.title')}<span style="font-size:.72em;opacity:.8;margin-left:auto;margin-right:18px">${esc(a.name)}</span>`,
          html: `<div class="b03-dlg"><div class="b03-ilwrap"><table class="b03-iltab"><thead><tr><th>${ctx.t('ws.year')}</th>${cols.map((c) => `<th>${ctx.t(hk[c])}</th>`).join('')}</tr></thead><tbody>${body()}</tbody></table></div>
            ${ctx.t('il.hint', { tag: 'p', cls: 'st-small', attrs: 'style="margin:0;font-size:15px"' })}
            <div class="btns"><button type="button" class="st-pill" data-no="1" style="background:transparent;color:#0d1e3a;border-color:#cbd5e3">${ctx.t('dlg.cancel')}</button><button type="button" class="st-pill" data-interp="1" style="background:transparent;color:#0d1e3a;border-color:#cbd5e3">${ctx.t('il.interp')}</button><button type="button" class="st-pill" data-ok="1">${ctx.t('il.save')}</button></div></div>`,
          onClose: () => { const pp = ctx.$('.b03-paste'); if (pp) pp.remove(); } });
        const tb = ov.querySelector('tbody');
        const repaint = () => { tb.innerHTML = body(); EFA.numify(tb); };
        tb.addEventListener('click', (e) => {
          const td = e.target.closest('td[data-c]'); if (!td || td.classList.contains('ed') || EFA.edit.on) return;
          const i = +td.dataset.r, c = td.dataset.c;
          td.classList.add('ed'); td.innerHTML = `<input inputmode="decimal" value="${+work[i][c] || ''}">`;
          const inp = td.querySelector('input'); inp.focus(); inp.select();
          inp.addEventListener('blur', () => { work[i][c] = parseNum(inp.value); td.classList.remove('ed'); td.textContent = cell(work[i][c]); });
          inp.addEventListener('keydown', (e2) => { e2.stopPropagation(); if (e2.key === 'Enter' || e2.key === 'Escape') inp.blur(); });
        });
        tb.addEventListener('contextmenu', (e) => {
          const td = e.target.closest('td[data-c]'); if (!td) return;
          e.preventDefault();
          openPaste(e, +td.dataset.r, td.dataset.c, work, repaint);
        });
        onBtn(ov.querySelector('[data-no]'), () => ov.close());
        onBtn(ov.querySelector('[data-interp]'), () => { interpolate(work, cols); repaint(); });
        onBtn(ov.querySelector('[data-ok]'), () => { work.forEach((r, i) => { a.illus[i] = r; }); ov.close(); paintCard(a); changed(); });
      };

      const openPaste = (ev, row, col, work, after) => {
        const old = ctx.$('.b03-paste'); if (old) old.remove();
        const sr = ctx.el.getBoundingClientRect(), k = sr.width / 1600 || 1;
        const box = document.createElement('div'); box.className = 'b03-paste';
        box.innerHTML = `<div class="t">${ctx.t('pa.title')}<button type="button" class="x" aria-label="Close">&times;</button></div>
          ${ctx.t('pa.how', { tag: 'p', cls: 'st-small', attrs: 'style="margin:0;font-size:14px"' })}
          <textarea rows="10" cols="30" spellcheck="false"></textarea>
          <div class="bs"><button type="button" class="b03-mini dark" data-m="set">${ctx.t('pa.paste')}</button><button type="button" class="b03-mini" data-m="add">${ctx.t('pa.add')}</button><button type="button" class="b03-mini" data-m="sub">${ctx.t('pa.sub')}</button><button type="button" class="b03-mini" data-m="zero">${ctx.t('pa.zero')}</button></div>`;
        ctx.el.appendChild(box);
        const x = Math.min(1600 - box.offsetWidth - 10, Math.max(10, (ev.clientX - sr.left) / k)), y = Math.min(900 - box.offsetHeight - 10, Math.max(10, (ev.clientY - sr.top) / k));
        box.style.left = x + 'px'; box.style.top = y + 'px';
        if (EFA.edit.on) EFA.edit.arm(box);
        const ta = box.querySelector('textarea');
        ta.addEventListener('keydown', (e) => e.stopPropagation());
        ta.focus();
        onBtn(box.querySelector('.x'), () => box.remove());
        box.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => {
          if (EFA.edit.on) return;
          const m = b.dataset.m, vals = m === 'zero' ? new Array(100).fill(0) : parseClip(ta.value);
          for (let j = 0; j < vals.length && row + j < work.length; j++) {
            const cur = +work[row + j][col] || 0, v = vals[j];
            work[row + j][col] = m === 'add' ? cur + v : m === 'sub' ? cur - v : v;
          }
          ta.value = ''; box.remove(); after();
        }));
      };
    },
    leave() { closeMenu(); }
  });

  /* ---------- PEM bindings shared by ca3 and ca4 (spec ca3 "Calculations") ---------- */
  const PEM_CAT = { labels: false, scenarioPicker: false, links: false, sliders: false, chevrons: false, rip: true, showRip: false, investments: true,
    showHouse: false, loc: false, showBorrowed: false, borrowSource: false, debtService: false, liabilityLabel: false, tankLinks: false,
    futureFill: false, lifestyleStrip: false };
  function pemVals(st, a, y) {
    const S = (st._tankRef || 0) * (st.tankFactor || 100);
    const r = (a._r && a._r[y - 1]) || {};
    const isSafe = a.tank === 'Safe';
    const bal = (a.type === 'Annuity' ? r.SurrenderValue : a.type === 'CVLI' ? r.CSV : r.EOY) || 0;
    const risk$ = isSafe ? 0 : bal, safe$ = isSafe ? bal : 0, loan = a.type === 'CVLI' ? (r.LoanBal || 0) : 0;
    const pot = CATE.summary(y, 'taxPot', a), db = CATE.summary(y, 'db', a), ndb = CATE.summary(y, 'ndb', a);
    const lvl = (v) => (S > 0 ? 100 * Math.min(Math.max(v, 0) / S, 1) : 0);
    const pre = a.type === 'TDBT' ? r.C - r.TaxEffect + r.M : a.type === 'TDAT' ? r.M : (a.type === 'Annuity' && a.qualified && !a.roth) ? r.C - r.TaxEffect : 0;
    const spend = CATE.summary(y, 'spend', a);
    const tip = (k, v) => (v > 0 ? `${tt(k)} ${F.money(v)}` : '');
    return {
      riskPreTax: lvl(risk$), safeTaxable: lvl(safe$), risk: 0, safe: 0,
      riskKeep: 100 - (risk$ > 0 ? 100 * Math.min(pot / risk$, 1) : 0),
      safeTax: safe$ > 0 ? 100 * Math.min(pot / safe$, 1) : 0,
      riskBalance: CATE.tz(risk$ - loan), safeBalance: CATE.tz(safe$ - loan),
      dbRisk: isSafe ? 0 : lvl(db), dbSafe: isSafe ? lvl(db) : 0,
      borrow: lvl(loan), collateral: loan > 0 ? (isSafe ? 'safe' : 'risk') : 'none',
      contribution: Math.max(0, CATE.summary(y, 'contrib', a) - pre), contributionQP: Math.max(0, pre),
      regulator: spend > 0 ? 100 : 0, remaining: 100, pv: !!a._pv,
      lifestyle: a._pv ? CATE.summary(y, 'spendPV', a) : spend, taxesPaid: CATE.summary(y, 'tax', a), withdrawal: CATE.summary(y, 'wd', a),
      riskPreTaxTip: isSafe ? '' : tip('cap.bal', risk$), safeTaxableTip: isSafe ? tip('cap.bal', safe$) : '',
      bfRiskTip: isSafe ? '' : tip('cap.loan', loan), bfSafeTip: isSafe ? tip('cap.loan', loan) : '',
      dbRiskTip: isSafe ? '' : tip('cap.ndb', ndb), dbSafeTip: isSafe ? tip('cap.ndb', ndb) : ''
    };
  }
  function mountCatPem(ctx, host, a, onPv) {
    const PEM = lib('pem');
    if (!PEM || !host) return null;
    try { return PEM.mount(ctx, host, Object.assign({}, PEM_CAT, { on: { pvclick: onPv } })); } catch (e) { console.error(e); return null; }
  }
  const pemWait = () => (lib('pem') ? '' : `<div class="b03-pemwait">${tc('loading', { cls: 'b03-pend' })}</div>`);

  /* ---------- ca3: one account, year by year ---------- */
  EFA.screen('ca3', {
    title: 'One account, year by year',
    copy: {
      _notes: 'Now we watch one account work year by year: money going in, growing in its tank, and coming back out as income, with taxes along the way.\n\n- Use the year arrows, or Step to play the years automatically.\n- Ask: In which year does this account start paying you back?\nPAUSE'
    },
    render(ctx) {
      const st = catState(); pickAB(st); calcIfNeeded(ctx, st);
      if (!st.accounts.length) { ctx.el.innerHTML = noAccounts(ctx); wireNone(ctx); return; }
      st._year = Math.max(1, Math.min(st._year || 1, st.yearsToProject));
      const W = lib('worksheet');
      ctx.el.innerHTML = `<div style="position:absolute;left:0;right:0;top:12px;text-align:center">${dd('accA', '', 'big')}</div>
        <div class="b03-pemwin" data-pem="1" style="left:6px;top:84px;width:1112px;height:722px">${pemWait()}</div>
        <div style="position:absolute;left:1136px;top:98px;width:440px;display:grid;gap:14px">${yearCtl(ctx, st)}</div>
        <div class="b03-card b03-sum"><div class="b03-hd" data-sumh="1"></div><div class="rows" data-sumr="1"></div></div>
        <div style="position:absolute;left:30px;top:818px;display:flex;gap:44px;align-items:center">
          ${W ? W.button(ctx, { data: () => accountSheet(st, accById(st, st._A), 'full') }) : ''}<span data-shuf="1"></span></div>
        ${catDisc('position:absolute;left:640px;width:650px;bottom:8px;margin:0;font-size:11.5px;line-height:1.36')}`;
      const paint = () => {
        const a = accById(st, st._A), y = st._year;
        ctx.$('[data-dd="accA"] .lbl').innerHTML = a ? esc(a.name) : `<span class="ph">${tc('ph.acc')}</span>`;
        ctx.$('[data-sumh]').innerHTML = `${tc('sum.title')} ${num(y)}`;
        const rr = (k, it, cls) => `<div class="r ${cls || ''}">${tc(k)}<span class="v">${a ? F.money(CATE.summary(y, it, a)) : ''}</span></div>`;
        ctx.$('[data-sumr]').innerHTML = [['sum.boy', 'boy'], ['sum.contrib', 'contrib'], ['sum.growth', 'growth'], ['sum.wd', 'wd'], ['sum.tax', 'tax'], ['sum.eoy', 'eoy']].map(([k, it]) => rr(k, it)).join('')
          + '<div class="div"></div>' + [['sum.pot', 'taxPot'], ['sum.estate', 'estate']].map(([k, it]) => rr(k, it, 'k')).join('');
        const sh = ctx.$('[data-shuf]');
        sh.innerHTML = usesMarket(a) ? shuffleCtl(ctx, st) : '';
        if (usesMarket(a)) wireShuffle(ctx, st, paint);
        if (ctx.pem && a) { try { ctx.pem.set(pemVals(st, a, y), { ms: 400 }); } catch (e) { console.error(e); } }
        if (EFA.edit.on) EFA.edit.arm(ctx.el);
      };
      ctx.pem = mountCatPem(ctx, ctx.$('[data-pem]'), accById(st, st._A), () => { const a = accById(st, st._A); if (a) { a._pv = !a._pv; paint(); } });
      ctx.on(ctx.$('[data-dd="accA"]'), 'click', (e, b) => openMenu(ctx, b, accMenu(st, st._A), (id) => { st._A = id; paint(); }));
      wireYear(ctx, st, paint);
      paint();
    },
    leave() { closeMenu(); }
  });

  /* ---------- ca4: two accounts side by side ---------- */
  const VS_DEFAULT = ['contribC', 'wd', 'eoy', 'taxC', 'lifeC'];
  EFA.screen('ca4', {
    title: 'Two accounts side by side',
    copy: {
      _notes: 'Two accounts, same dollars in, same years. Watch which one leaves more for your lifestyle, and which one leaves more for your heirs.\n\n- Change the withdrawal tax rates to ask "what if taxes are higher later?"\n- Ask: If tax rates rise by the time you retire, which of these would you rather own?\nPAUSE'
    },
    render(ctx) {
      const st = catState(); pickAB(st); calcIfNeeded(ctx, st);
      if (!st.accounts.length) { ctx.el.innerHTML = noAccounts(ctx); wireNone(ctx); return; }
      st._year = Math.max(1, Math.min(st._year || 1, st.yearsToProject));
      if (!st._vs) st._vs = VS_DEFAULT.slice();
      const docLabel = lib('worksheet') ? EFA.cp('_lib_worksheet', 'open', { cls: 'b03-link', attrs: 'data-docs="1" style="font:700 18px/1 DM Sans,sans-serif"' }) : '';
      ctx.el.innerHTML = `<div style="position:absolute;left:24px;top:14px;width:520px">${dd('accA', '', 'big')}</div>
        <div style="position:absolute;left:560px;top:14px;width:480px;display:grid;gap:10px;justify-items:center">${yearCtl(ctx, st)}</div>
        <div style="position:absolute;right:24px;top:14px;width:520px;text-align:right">${dd('accB', '', 'big')}</div>
        <div class="b03-pemwin" data-pem="A" style="left:8px;top:96px;width:784px;height:604px">${pemWait()}</div>
        <div class="b03-divbar" style="left:797px;top:110px;height:576px"></div>
        <div class="b03-pemwin" data-pem="B" style="left:808px;top:96px;width:784px;height:604px">${pemWait()}</div>
        <div style="position:absolute;left:26px;top:708px;width:190px">${whatIf(ctx, st, 'l.wdRates')}</div>
        <div style="position:absolute;left:26px;top:832px">${docLabel}</div>
        <div style="position:absolute;left:236px;top:712px;width:170px;display:grid;gap:12px">
          <div class="b03-ctl" style="justify-content:space-between">${tc('l.values')}<button type="button" class="b03-sw" data-vsw="1" aria-pressed="${!!st.showValues}"></button></div>
          <div data-shuf="1"></div></div>
        <div class="b03-vs" data-vs="1" style="left:424px;top:704px"></div>`;
      ['accA', 'accB'].forEach((k) => { const b = ctx.$(`[data-dd="${k}"]`); b.style.minWidth = '0'; b.style.width = '100%'; b.style.fontSize = '32px'; });
      const paintStrip = () => {
        const box = ctx.$('[data-vs]'), A = accById(st, st._A), B = accById(st, st._B), y = st._year;
        if (!st.showValues || !A) { box.innerHTML = ''; return; }
        const n = (v) => F.num(Math.round(v), 0);
        box.innerHTML = `<div class="lab"><div></div>${B ? `<div>${esc(B.name)}</div>` : ''}<div>${esc(A.name)}</div>${B ? `<div style="height:3px"></div><div>${tc('l.diff')}</div>` : ''}</div>
          <div class="cols">${st._vs.map((it, i) => {
            const va = it ? CATE.summary(y, it, A) : null, vb = it && B ? CATE.summary(y, it, B) : null;
            return `<div class="col">${dd('vs' + i, it ? tc('it.' + it) : `<span class="ph" style="color:#9aa3b2">${tc('ph.sel')}</span>`)}
              ${B ? `<div class="bx">${it ? n(vb) : ''}</div>` : ''}<div class="bx">${it ? n(va) : ''}</div>
              ${B ? `<div class="bar"></div><div class="bx diff">${it ? n(vb - va) : ''}</div>` : ''}</div>`;
          }).join('')}</div>
          <div class="btns"><button type="button" class="b03-ib" data-vsa="1" aria-label="Add a value">${ICO.plus}</button><button type="button" class="b03-ib" data-vsr="1" aria-label="Remove the last value">${ICO.minus}</button><button type="button" class="b03-ib" data-vsx="1" aria-label="Reset to the default list">${ICO.reset}</button></div>`;
        box.querySelectorAll('[data-dd^="vs"]').forEach((b) => ctx.on(b, 'click', () => openMenu(ctx, b, itemMenu(st, st._vs[+b.dataset.dd.slice(2)]), (it) => { st._vs[+b.dataset.dd.slice(2)] = it; paintStrip(); })));
        ctx.on(box.querySelector('[data-vsa]'), 'click', () => { if (st._vs[st._vs.length - 1] !== null) { st._vs.push(null); paintStrip(); } });
        ctx.on(box.querySelector('[data-vsr]'), 'click', () => { if (st._vs.length) { st._vs.pop(); paintStrip(); } });
        ctx.on(box.querySelector('[data-vsx]'), 'click', () => {
          const ov = dialog(ctx, tc('l.values'), `${tc('vs.resetQ', { tag: 'p' })}<div class="btns"><button type="button" class="st-pill" data-no="1" style="background:transparent;color:#0d1e3a;border-color:#cbd5e3">${tc('dlg.cancel')}</button><button type="button" class="st-pill" data-yes="1">${tc('vs.reset')}</button></div>`, 620);
          ov.querySelector('[data-no]').addEventListener('click', () => { if (!EFA.edit.on) ov.close(); });
          ov.querySelector('[data-yes]').addEventListener('click', () => { if (EFA.edit.on) return; ov.close(); st._vs = []; paintStrip(); ctx.timeout(() => { st._vs = VS_DEFAULT.slice(); paintStrip(); }, 100); });
        });
        EFA.numify(box);
        if (EFA.edit.on) EFA.edit.arm(box);
      };
      const paint = () => {
        const A = accById(st, st._A), B = accById(st, st._B), y = st._year;
        ctx.$('[data-dd="accA"] .lbl').innerHTML = A ? esc(A.name) : `<span class="ph">${tc('ph.acc')}</span>`;
        ctx.$('[data-dd="accB"] .lbl').innerHTML = B ? esc(B.name) : `<span class="ph">${tc('ph.acc')}</span>`;
        const sh = ctx.$('[data-shuf]'), anyM = usesMarket(A) || usesMarket(B);
        sh.innerHTML = anyM ? shuffleCtl(ctx, st) : '';
        if (anyM) wireShuffle(ctx, st, paint);
        [['A', A], ['B', B]].forEach(([k, acc]) => {
          const p = ctx['pem' + k];
          if (p) { try { if (acc) p.set(pemVals(st, acc, y), { ms: 400 }); p.el.style.visibility = acc ? '' : 'hidden'; } catch (e) { console.error(e); } }
        });
        paintStrip();
        if (EFA.edit.on) EFA.edit.arm(ctx.el);
      };
      ctx.pemA = mountCatPem(ctx, ctx.$('[data-pem="A"]'), null, () => { const a = accById(st, st._A); if (a) { a._pv = !a._pv; paint(); } });
      ctx.pemB = mountCatPem(ctx, ctx.$('[data-pem="B"]'), null, () => { const a = accById(st, st._B); if (a) { a._pv = !a._pv; paint(); } });
      ctx.on(ctx.$('[data-dd="accA"]'), 'click', (e, b) => openMenu(ctx, b, accMenu(st, st._A), (id) => { st._A = id; paint(); }));
      ctx.on(ctx.$('[data-dd="accB"]'), 'click', (e, b) => openMenu(ctx, b, accMenu(st, st._B), (id) => { st._B = id; paint(); }));
      ctx.on(ctx.$('[data-vsw]'), 'click', (e, b) => { st.showValues = !st.showValues; st._unsaved = true; b.setAttribute('aria-pressed', st.showValues); paintStrip(); });
      const docs = ctx.$('[data-docs]');
      if (docs) ctx.on(docs, 'click', () => {
        const A = accById(st, st._A), B = accById(st, st._B);
        const link = (x, k) => (x ? `<p><span class="b03-link" data-ws="${k}" style="font:700 22px/1.4 DM Sans,sans-serif">${esc(x.name)} ${tc('ws.suffix')}</span></p>` : '');
        const ov = dialog(ctx, tc('l.pick'), `${link(A, 'A')}${link(B, 'B')}`, 560);
        ov.querySelectorAll('[data-ws]').forEach((l) => l.addEventListener('click', () => { if (EFA.edit.on) return; ov.close(); wsOpen(ctx, accountSheet(st, l.dataset.ws === 'A' ? A : B, 'full')); }));
      });
      wireYear(ctx, st, paint);
      wireWhatIf(ctx, st, paint);
      paint();
    },
    leave() { closeMenu(); }
  });

  /* ---------- ca5: one value, every account, over time ---------- */
  function niceStep(span) {
    if (!(span > 0)) return 1;
    const raw = span / 5, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }
  EFA.screen('ca5', {
    title: 'One value, every account, over time',
    copy: {
      _notes: 'Here is the whole race on one chart. Pick a measure, then turn accounts on and off to see which type comes out ahead, and when.\n\n- Spendable income, cumulative, is the default; try estate value next.\n- Ask: Which line would you want your family to be living on?\nPAUSE'
    },
    render(ctx) {
      const st = catState(); pickAB(st); calcIfNeeded(ctx, st);
      if (!st.accounts.length) { ctx.el.innerHTML = noAccounts(ctx); wireNone(ctx); return; }
      if (!CATE.ITEMS.includes(st.chartItem)) st.chartItem = 'spendC';
      const W = lib('worksheet');
      const sheet = () => ({
        heading: `${tc('it.' + st.chartItem)} ${tc('ws.suffix')}`, size: 'medium', filter: 'year', disclosures: ['hypothetical', 'notAdvice'],
        columns: [{ field: 'year', header: tc('ws.year'), type: 'year' }].concat(st.accounts.map((a, i) => ({ field: 'a' + i, header: esc(a.name), type: 'money' }))),
        rows: Array.from({ length: st.yearsToProject }, (_, k) => { const o = { year: k + 1 }; st.accounts.forEach((a, i) => { o['a' + i] = CATE.summary(k + 1, st.chartItem, a); }); return o; })
      });
      ctx.el.innerHTML = `<div style="position:absolute;left:0;right:0;top:12px;text-align:center">${dd('item', '', 'big')}</div>
        <div class="b03-chart" data-chart="1"></div><div class="b03-legend" data-legend="1"></div>
        <div style="position:absolute;left:36px;top:770px;display:flex;gap:40px;align-items:flex-end">
          <div class="b03-wi" style="grid-template-columns:auto auto auto;align-items:end;column-gap:22px">${'<div class="t" style="max-width:120px;line-height:1.25">' + tc('l.wdRate') + '</div>'}
            <label class="f" style="grid-template-columns:auto 86px">${tc('l.ord')}<input class="b03-in" data-wi="wdTaxOrd" value="${show(st.wdTaxOrd, 'pct')}"></label>
            <label class="f" style="grid-template-columns:auto 86px">${tc('l.cg')}<input class="b03-in" data-wi="wdTaxCG" value="${show(st.wdTaxCG, 'pct')}"></label></div>
          <span data-shuf="1"></span></div>
        <div style="position:absolute;right:130px;top:790px">${W ? W.button(ctx, { data: sheet }) : ''}</div>
        ${catDisc('position:absolute;left:36px;width:1220px;bottom:6px;margin:0;font-size:11px;line-height:1.3')}`;
      const vis = ctx._vis = ctx._vis || [];
      const chart = () => {
        const N = st.yearsToProject, accs = st.accounts;
        accs.forEach((a, i) => { if (vis[i] == null) vis[i] = i === 0; });
        const data = accs.map((a) => Array.from({ length: N }, (_, k) => CATE.summary(k + 1, st.chartItem, a)));
        const shown = data.filter((d, i) => vis[i]);
        const all = shown.flat();
        let lo = Math.min(0, ...(all.length ? all : [0])), hi = Math.max(0, ...(all.length ? all : [1]));
        if (hi === lo) hi = lo + 1;
        const step = niceStep(hi - lo); lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
        const Wd = 1460, Ht = 610, L = 150, R = 30, T = 16, B = 54;
        const X = (yr) => L + (N <= 1 ? 0 : ((yr - 1) * (Wd - L - R)) / (N - 1)), Y = (v) => T + (Ht - T - B) * (1 - (v - lo) / (hi - lo));
        let g = '';
        for (let v = lo; v <= hi + step / 2; v += step) g += `<line x1="${L}" x2="${Wd - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#d6cfc4" stroke-width="${Math.abs(v) < 1e-9 ? 2 : 1}"/><text x="${L - 14}" y="${Y(v) + 6}" text-anchor="end" font-family="DM Sans, sans-serif" font-size="17" font-weight="600" fill="#667389">${F.money(v)}</text>`;
        const ticks = [1]; for (let t = 5; t <= N; t += 5) ticks.push(t);
        ticks.forEach((t) => { g += `<line x1="${X(t)}" x2="${X(t)}" y1="${T}" y2="${Ht - B}" stroke="#e3e8f0" stroke-width="1.5"/><text x="${X(t)}" y="${Ht - B + 34}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="21" font-weight="700" fill="#0d1e3a">${t}</text>`; });
        data.forEach((d, i) => {
          if (!vis[i]) return;
          const c = SERIES[i % SERIES.length];
          g += `<path d="${d.map((v, k) => `${k ? 'L' : 'M'}${X(k + 1).toFixed(1)},${Y(v).toFixed(1)}`).join('')}" fill="none" stroke="${c}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`;
        });
        g += `<line class="gd" x1="0" x2="0" y1="${T}" y2="${Ht - B}" stroke="#b8972e" stroke-width="2" stroke-dasharray="4 5" opacity="0"/><g class="dots"></g>`;
        g += `<rect class="hit" x="${L}" y="${T}" width="${Wd - L - R}" height="${Ht - T - B}" fill="transparent"/>`;
        const box = ctx.$('[data-chart]');
        box.innerHTML = `<svg viewBox="0 0 ${Wd} ${Ht}" width="${Wd}" height="${Ht}">${g}</svg>`;
        ctx.$('[data-legend]').innerHTML = accs.map((a, i) => `<button type="button" data-lg="${i}" class="${vis[i] ? '' : 'off'}"><i style="background:${SERIES[i % SERIES.length]}"></i>${esc(a.name)}</button>`).join('');
        ctx.$$('[data-lg]').forEach((b) => ctx.on(b, 'click', () => { const i = +b.dataset.lg; vis[i] = !vis[i]; chart(); }));
        // hover: guide line, dots and a tooltip with every visible account at that year
        const svg = box.querySelector('svg'), hit = svg.querySelector('.hit'), gd = svg.querySelector('.gd'), dots = svg.querySelector('.dots');
        let tip = null;
        hit.addEventListener('mousemove', (e) => {
          const r = svg.getBoundingClientRect(), k = r.width / Wd, mx = (e.clientX - r.left) / k;
          const yr = Math.max(1, Math.min(N, Math.round(1 + ((mx - L) / (Wd - L - R)) * (N - 1))));
          gd.setAttribute('x1', X(yr)); gd.setAttribute('x2', X(yr)); gd.setAttribute('opacity', 1);
          dots.innerHTML = data.map((d, i) => (vis[i] ? `<circle cx="${X(yr)}" cy="${Y(d[yr - 1])}" r="7" fill="${SERIES[i % SERIES.length]}" stroke="#fff" stroke-width="3"/>` : '')).join('');
          if (!tip) { tip = document.createElement('div'); tip.className = 'b03-tip'; ctx.el.appendChild(tip); }
          tip.innerHTML = `<div class="yr">${tc('ws.year')} ${num(yr)}</div>` + accs.map((a, i) => (vis[i] ? `<div><b>${esc(a.name)}:</b> ${F.money(data[i][yr - 1])}</div>` : '')).join('');
          const tx = 70 + X(yr) + 18, flip = tx + tip.offsetWidth > 1560;
          tip.style.left = (flip ? 70 + X(yr) - 18 - tip.offsetWidth : tx) + 'px'; tip.style.top = (96 + 30) + 'px';
        });
        hit.addEventListener('mouseleave', () => { gd.setAttribute('opacity', 0); dots.innerHTML = ''; if (tip) { tip.remove(); tip = null; } });
      };
      const paint = () => {
        ctx.$('[data-dd="item"] .lbl').innerHTML = tc('it.' + st.chartItem);
        const sh = ctx.$('[data-shuf]'), anyM = st.accounts.some(usesMarket);
        sh.innerHTML = anyM ? shuffleCtl(ctx, st) : '';
        if (anyM) wireShuffle(ctx, st, paint);
        chart();
        if (EFA.edit.on) EFA.edit.arm(ctx.el);
      };
      ctx.on(ctx.$('[data-dd="item"]'), 'click', (e, b) => openMenu(ctx, b, itemMenu(st, st.chartItem), (it) => { st.chartItem = it; st._unsaved = true; paint(); }));
      wireWhatIf(ctx, st, paint);
      paint();
    },
    leave() { closeMenu(); }
  });
})();
