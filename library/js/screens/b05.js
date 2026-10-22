/* b05: CP Gateway (CCP), CP Presentation (CPP), Debt 101 (DF101), Debt Elimination (DE),
   Disability Insurance 101 (DI101), Disability Protection (DISPROT), Disclosure (DISC),
   Distribution Solution (DS), Dollar Cost Averaging (DCA), Economic Squeeze on Capital (ESC).
   Structure, sequence, interactions and math follow the specs; artwork and wording are new. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt;
  const esc = EFA.util.esc;

  EFA.css('b05', `
  .b05-head { position: absolute; left: 0; right: 0; top: 44px; display: grid; justify-items: center; gap: 12px; text-align: center; padding: 0 140px; pointer-events: none; }
  .b05-head > * { pointer-events: auto; }
  .b05-f { transition: opacity .8s ease; }
  .b05-f.is-off { transition: opacity .3s ease; }
  .b05-panel { position: absolute; inset: 0; }
  .b05-btn { position: absolute; }
  .b05-link { background: none; border: 0; padding: 0; font: 600 18px/1.2 "DM Sans", sans-serif; color: #8a6e22; border-bottom: 1.5px dotted currentColor; cursor: pointer; }
  .b05-link:hover { color: #0d1e3a; }
  .b05-sub-pill { min-height: 40px !important; font-size: 16px !important; padding: 6px 16px !important; }
  .b05-ghost { background: transparent !important; color: #0d1e3a !important; border-color: #cbd5e3 !important; }
  .stage button.b05-ghost:hover { background: #b8972e !important; border-color: #b8972e !important; }

  /* strengths chart */
  .b05-tick { position: absolute; width: 40px; margin-left: -20px; text-align: center; font: 600 18px/1 "DM Sans", sans-serif; color: #667389; }
  .b05-tick.z { color: #0d1e3a; font-weight: 700; }
  .b05-card { position: absolute; left: 320px; width: 960px; height: 585px; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 20px; box-shadow: 0 16px 44px rgba(13,30,58,.09); }
  .b05-mid { position: absolute; left: 799px; width: 0; border-left: 2px dotted #aebbd0; }
  .b05-rline { position: absolute; left: 340px; width: 920px; height: 0; border-top: 2px dotted #cbd5e3; }
  .b05-rt { position: absolute; left: 320px; width: 960px; text-align: center; font: 700 18px/1.2 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6e22; }
  .b05-pole { position: absolute; width: 186px; font: 600 21px/1.18 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-pole.l { left: 122px; text-align: right; }
  .b05-pole.r { left: 1292px; text-align: left; }
  .b05-band { position: absolute; left: 112px; width: 1376px; height: 120px; border-radius: 26px; background: rgba(240,230,196,.66); box-shadow: inset 0 0 0 1.5px rgba(184,151,46,.38); }
  .b05-bar { position: absolute; height: 29px; border-radius: 15px; display: flex; align-items: center; box-sizing: border-box; padding: 0 12px; font: 700 16px/1 "DM Sans", sans-serif; box-shadow: 0 5px 12px rgba(13,30,58,.18); transition: width .9s cubic-bezier(.3,.7,.2,1), left .9s cubic-bezier(.3,.7,.2,1); }
  .b05-bar.p0 { background: linear-gradient(90deg, #14284a, #2b4c80); color: #fff; }
  .b05-bar.p1 { background: linear-gradient(90deg, #d5bd68, #b8972e); color: #0d1e3a; }
  .b05-bar.L { justify-content: flex-start; }
  .b05-bar.R { justify-content: flex-end; }
  .b05-bar.N { justify-content: center; letter-spacing: .08em; font-weight: 600; }
  .b05-tag { position: absolute; transform: translateX(-50%); border: 0; border-radius: 999px; padding: 11px 26px; font: 700 20px/1.1 "DM Sans", sans-serif; letter-spacing: .02em; cursor: pointer; box-shadow: 0 8px 20px rgba(13,30,58,.16); white-space: nowrap; transition: transform .2s ease, box-shadow .2s ease; }
  .b05-tag:hover { transform: translateX(-50%) translateY(-2px); box-shadow: 0 12px 26px rgba(13,30,58,.22); }
  .b05-tag.p0 { background: #0d1e3a; color: #f7f5f1; }
  .b05-tag.p1 { background: #b8972e; color: #0d1e3a; }
  .b05-obj { position: absolute; left: 440px; top: 298px; width: 720px; box-sizing: border-box; padding: 30px 44px 34px; background: #fffdf8; border: 1px solid #d6cfc4; border-top: 5px solid #b8972e; border-radius: 18px; box-shadow: 0 28px 70px rgba(13,30,58,.22); text-align: center; display: grid; gap: 14px; }
  .b05-obj h3 { margin: 0; font: 600 42px/1.05 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b05-obj p { margin: 0; font: 500 24px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-chart-empty { position: absolute; left: 440px; top: 380px; width: 720px; text-align: center; font: 500 19px/1.4 "DM Sans", sans-serif; color: #667389; }

  /* image bands and the tendencies table */
  .b05-photo { position: absolute; left: 110px; top: 140px; width: 1380px; height: 440px; border-radius: 22px; overflow: hidden; box-shadow: 0 18px 44px rgba(13,30,58,.14); background: #fffdf8; }
  .b05-photo.plain { box-shadow: none; background: transparent; overflow: visible; }
  .b05-photo svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .b05-nt { position: absolute; left: 50%; top: 606px; transform: translateX(-50%); display: grid; gap: 10px; }
  .b05-nt h3 { margin: 0; text-align: center; font: 700 16px/1.2 "DM Sans", sans-serif; letter-spacing: .26em; text-transform: uppercase; color: #8a6e22; }
  .b05-nt-g { display: grid; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 10px 28px rgba(13,30,58,.07); overflow: hidden; }
  .b05-nt-c { padding: 15px 22px; font: 400 22px/1.3 "DM Sans", sans-serif; color: #0d1e3a; display: flex; align-items: center; }
  .b05-nt-c.c1 { font-weight: 700; text-transform: uppercase; letter-spacing: .08em; font-size: 18px; }
  .b05-nt-c.c2 { font-weight: 700; color: #8a6e22; }
  .b05-nt-c.r2 { border-top: 1px solid #e6dfd3; background: rgba(227,232,240,.38); }
  .b05-stop { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; pointer-events: none; }
  .b05-stop > span { pointer-events: auto; }

  /* statement view */
  .b05-stmt { position: absolute; inset: 0; background: #f7f5f1; }
  .b05-stmt-one { position: absolute; left: 240px; width: 1120px; top: 40px; bottom: 132px; display: grid; gap: 24px; align-content: center; }
  .b05-stmt-one h2::after { content: ""; display: block; width: 84px; height: 3px; background: #b8972e; margin: 18px auto 0; }
  .b05-stmt h2 { margin: 0; text-align: center; }
  .b05-stmt-body { background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 18px; box-shadow: 0 14px 36px rgba(13,30,58,.08); padding: 30px 40px; overflow: auto; }
  .b05-stmt-body p { margin: 0 0 18px; font: 400 23px/1.55 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-stmt-body p:last-child { margin-bottom: 0; }
  .b05-stmt-two { position: absolute; left: 110px; right: 110px; top: 54px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .b05-stmt-col { display: grid; gap: 8px; align-content: start; }
  .b05-stmt-col .nm { font: 600 54px/1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; text-align: center; }
  .b05-stmt-col .ln { font: 600 17px/1.3 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6e22; text-align: center; margin-bottom: 8px; }
  .b05-stmt-col.p1 .nm { color: #8a6e22; }
  .b05-who { cursor: pointer; border-bottom: 2px dotted #b8972e; }

  /* small dialogs on the standard overlay */
  .st-overlay.b05-sm .st-overlay-in { width: 640px; }
  .st-overlay.b05-md .st-overlay-in { width: 900px; }
  .b05-dlg { display: grid; gap: 16px; }
  .b05-dlg p { margin: 0; font: 400 20px/1.5 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-dlg .row { display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap; margin-top: 6px; }
  .b05-dlg label.k { font: 600 14px/1.2 "DM Sans", sans-serif; letter-spacing: .06em; text-transform: uppercase; color: #667389; }
  .b05-dlg .fld { display: grid; gap: 6px; }
  .b05-txt { height: 48px; border: 1.5px solid #cbd5e3; border-radius: 10px; background: #fff; padding: 0 14px; font: 500 20px/1 "DM Sans", sans-serif; color: #0d1e3a; width: 100%; box-sizing: border-box; }
  .b05-txt:focus, .b05-area:focus { outline: none; border-color: #b8972e; box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .b05-txt.bad { border-color: #b3402e; box-shadow: 0 0 0 3px rgba(179,64,46,.15); }
  .b05-area { border: 1.5px solid #cbd5e3; border-radius: 10px; background: #fff; padding: 12px 14px; font: 400 18px/1.45 "DM Sans", sans-serif; color: #0d1e3a; width: 100%; box-sizing: border-box; min-height: 150px; resize: vertical; }
  .b05-err { font: 600 15px/1.3 "DM Sans", sans-serif; color: #b3402e; min-height: 20px; }
  .b05-switch { display: inline-flex; align-items: center; gap: 12px; cursor: pointer; background: none; border: 0; padding: 0; font: 600 17px/1.2 "DM Sans", sans-serif; color: #0d1e3a; user-select: none; }
  .b05-switch i { width: 46px; height: 26px; border-radius: 999px; background: #cbd5e3; position: relative; transition: background .2s ease; flex: 0 0 auto; }
  .b05-switch i::after { content: ""; position: absolute; left: 3px; top: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: transform .2s ease; }
  .b05-switch[aria-checked="true"] i { background: #0d1e3a; }
  .b05-switch[aria-checked="true"] i::after { transform: translateX(20px); background: #d5bd68; }

  /* gateway */
  .b05-gw-top { position: absolute; left: 110px; right: 110px; top: 40px; display: flex; align-items: flex-end; justify-content: space-between; gap: 30px; }
  .b05-gw-top h1 { font-size: 52px !important; }
  .b05-gw-stat { display: flex; align-items: center; gap: 14px; padding-bottom: 6px; }
  .b05-gw-dot { width: 18px; height: 18px; border-radius: 50%; background: #3f8f5b; box-shadow: 0 0 0 5px rgba(63,143,91,.16); flex: 0 0 auto; }
  .b05-gw-dot.bad { background: #b3402e; box-shadow: 0 0 0 5px rgba(179,64,46,.16); }
  .b05-gw-stat .t { display: grid; gap: 3px; text-align: right; }
  .b05-gw-stat .a { font: 700 18px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-gw-stat .b { font: 500 14px/1.2 "DM Sans", sans-serif; color: #667389; }
  .b05-gw-grid { position: absolute; left: 110px; right: 110px; top: 132px; height: 616px; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 14px 36px rgba(13,30,58,.08); overflow: hidden; display: grid; grid-template-rows: auto 1fr; }
  .b05-gw-scroll { overflow: auto; }
  .b05-gw-table { width: 100%; border-collapse: collapse; font: 500 18px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-gw-table th { position: sticky; top: 0; z-index: 1; background: #0d1e3a; color: #f7f5f1; font: 700 13px/1.2 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; padding: 14px 12px; text-align: left; white-space: nowrap; }
  .b05-gw-table th.sort { cursor: pointer; }
  .b05-gw-table th.sort:hover { color: #d5bd68; }
  .b05-gw-table th .ar { display: inline-block; margin-left: 6px; color: #d5bd68; font-size: 12px; }
  .b05-gw-table td { padding: 10px 12px; border-bottom: 1px solid rgba(13,30,58,.08); white-space: nowrap; }
  .b05-gw-table tbody tr:nth-child(even) td { background: rgba(227,232,240,.42); }
  .b05-gw-table tbody tr.sel td { background: rgba(240,230,196,.7) !important; }
  .b05-gw-table tbody tr.hid td { color: #8a93a3; font-style: italic; }
  .b05-gw-table td.em { max-width: 330px; overflow: hidden; text-overflow: ellipsis; }
  .b05-acts { display: grid; grid-template-columns: repeat(4, 40px); gap: 6px; align-items: center; }
  .b05-ico { position: relative; width: 38px; height: 38px; border-radius: 10px; border: 1px solid #d6cfc4; background: #fff; display: grid; place-items: center; color: #0d1e3a; cursor: pointer; padding: 0; }
  .b05-ico:hover { border-color: #b8972e; background: #f0e6c4; }
  .b05-ico svg { width: 20px; height: 20px; }
  .b05-ico.on { background: #0d1e3a; border-color: #0d1e3a; color: #d5bd68; }
  .b05-ico.gold { color: #8a6e22; }
  .b05-tip { position: absolute; bottom: calc(100% + 8px); right: -6px; background: #0d1e3a; color: #f7f5f1; font: 600 13px/1.2 "DM Sans", sans-serif; padding: 7px 10px; border-radius: 8px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .15s ease; z-index: 5; }
  .b05-ico:hover .b05-tip, .b05-ico:focus-visible .b05-tip { opacity: 1; }
  body.editing .b05-tip { opacity: 1; position: static; display: none; }
  .b05-gw-foot { position: absolute; left: 110px; right: 110px; top: 770px; display: grid; grid-template-columns: 35fr 35fr 30fr; align-items: center; }
  .b05-gw-foot .z { display: flex; gap: 12px; align-items: center; }
  .b05-gw-foot .z.r { justify-content: flex-end; }
  .b05-plus { width: 52px; height: 52px; border-radius: 50%; border: 0; background: #b8972e; color: #0d1e3a; display: grid; place-items: center; box-shadow: 0 8px 20px rgba(184,151,46,.35); cursor: pointer; }
  .b05-plus:hover { background: #d5bd68; }
  .b05-plus svg { width: 26px; height: 26px; }
  .b05-gw-empty { display: grid; justify-items: center; align-content: center; gap: 14px; height: 100%; text-align: center; padding: 40px; box-sizing: border-box; }
  .b05-gw-empty h3 { margin: 0; font: 600 34px/1.1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b05-gw-empty p { margin: 0; max-width: 640px; font: 400 19px/1.5 "DM Sans", sans-serif; color: #667389; }
  .b05-gw-hint { position: absolute; left: 0; right: 0; bottom: 22px; text-align: center; font: 500 17px/1.3 "DM Sans", sans-serif; color: #8a93a3; pointer-events: none; }
  .b05-gw-hint::before { content: ""; display: block; width: 60px; height: 2px; background: #d5bd68; margin: 0 auto 12px; }
  .b05-gw-sumh { position: absolute; left: 0; right: 0; top: 30px; text-align: center; }
  .b05-gw-sumh h2 { margin: 0; }
  .b05-inv { background: #fff; border: 1.5px solid #cbd5e3; border-radius: 12px; padding: 18px 20px; font: 400 18px/1.55 "DM Sans", sans-serif; color: #0d1e3a; user-select: text; }
  .b05-inv p { margin: 0 0 10px; font-size: 18px !important; }
  .b05-inv p:last-child { margin-bottom: 0; }
  .b05-res-row { display: grid; grid-template-columns: 210px 1fr 90px; gap: 16px; align-items: center; padding: 8px 0; border-bottom: 1px solid #ece6db; }
  .b05-res-row .t { font: 700 15px/1.2 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #8a6e22; }
  .b05-res-row .pl { display: flex; justify-content: space-between; font: 600 13px/1.2 "DM Sans", sans-serif; color: #667389; margin-top: 4px; }
  .b05-res-row input[type=range] { width: 100%; accent-color: #0d1e3a; }
  .b05-res-row .b05-txt { height: 42px; text-align: center; padding: 0 8px; }

  /* cpp6 */
  .b05-c6 { position: absolute; left: 50%; top: 47%; transform: translate(-50%, -50%); width: 1120px; display: grid; gap: 44px; }
  .b05-c6-row { display: grid; grid-template-columns: 104px 1fr; gap: 34px; align-items: center; }
  .b05-c6-card { background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 24px; box-shadow: 0 18px 46px rgba(13,30,58,.10); padding: 40px 50px; text-align: center; }
  .b05-c6-card .q { margin: 0; font: 600 50px/1.18 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b05-c6-card h3 { margin: 0 0 12px; font: 600 46px/1.05 "Cormorant Garamond", Georgia, serif; color: #8a6e22; }
  .b05-c6-card p { margin: 0; font: 600 27px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }

  /* disclosure */
  .b05-disc-h { text-transform: uppercase; letter-spacing: .16em; font-size: 54px !important; }
  .b05-disc { position: absolute; left: 150px; right: 150px; top: 140px; bottom: 70px; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 18px; box-shadow: 0 16px 44px rgba(13,30,58,.08); padding: 30px 52px 24px; overflow: auto; }
  .b05-disc-id { text-align: center; padding-bottom: 14px; margin-bottom: 16px; border-bottom: 2px solid #d5bd68; display: grid; gap: 6px; }
  .b05-disc-id .f { font: 600 34px/1.1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b05-disc-id .c { font: 700 14px/1.3 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6e22; }
  .b05-disc-id .w { font: 600 17px/1.3 "DM Sans", sans-serif; color: #667389; }
  .b05-disc-body p { margin: 0 0 9px; font: 600 17.5px/1.45 "DM Sans", sans-serif; color: #0d1e3a; white-space: pre-line; }
  .b05-disc-body p:last-child { margin-bottom: 0; }

  /* bullet rows with text cards */
  .b05-rows { position: absolute; display: grid; gap: 18px; }
  .b05-brow { display: grid; grid-template-columns: var(--bw, 72px) 1fr; gap: 22px; align-items: center; }
  .b05-brow > svg { justify-self: center; }
  .b05-bcard { background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 10px 26px rgba(13,30,58,.07); padding: 22px 30px; font: 700 30px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-bcard.sm { font: 500 22px/1.38 "DM Sans", sans-serif; padding: 16px 22px; }
  .b05-bcard.sm b { color: #8a6e22; font-weight: 700; }
  .b05-foot-disc { position: absolute; left: 160px; right: 330px; bottom: 68px; margin: 0; text-align: center; }

  /* charts, legends, tables, side cards */
  .b05-chartbox { position: absolute; }
  .b05-chart { display: block; overflow: visible; }
  .b05-ytitle { position: absolute; writing-mode: vertical-rl; transform: rotate(180deg) translateY(50%); font: 700 14px/1 "DM Sans", sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #667389; white-space: nowrap; }
  .b05-xtitle { position: absolute; transform: translateX(-50%); font: 700 14px/1 "DM Sans", sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #667389; white-space: nowrap; }
  .b05-legend { position: absolute; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .b05-legend.in { justify-content: flex-start; gap: 22px; }
  .b05-leg { display: inline-flex; align-items: center; gap: 10px; border: 1px solid #d6cfc4; background: #fffdf8; border-radius: 999px; padding: 8px 16px; font: 700 17px/1 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; transition: opacity .3s ease; }
  .b05-leg i { width: 24px; height: 6px; border-radius: 3px; display: inline-block; }
  .b05-leg.off { opacity: .38; }
  .b05-leg.static { cursor: default; border: 0; background: transparent; padding: 0; }
  .b05-ctip { position: absolute; transform: translate(-50%, calc(-100% - 14px)); background: #0d1e3a; color: #f7f5f1; border-radius: 8px; padding: 8px 12px; font: 500 15px/1.3 "DM Sans", sans-serif; white-space: nowrap; pointer-events: none; display: grid; gap: 2px; z-index: 3; box-shadow: 0 8px 18px rgba(8,20,42,.25); }
  .b05-ctip b { font-weight: 700; color: #d5bd68; }
  .b05-hit { cursor: pointer; }
  .b05-tbl { position: absolute; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 26px rgba(13,30,58,.06); }
  .b05-tbl.scroll { overflow: auto; }
  #stage .b05-dtable { font-size: 18px; }
  #stage .b05-dtable th { position: sticky; top: 0; z-index: 1; }
  #stage .b05-dtable th:first-child, #stage .b05-dtable td:first-child { text-align: center; }
  #stage .b05-dtable td { padding: 11px 14px; }
  .b05-side { position: absolute; padding: 22px 26px 18px; display: grid; gap: 13px; align-content: start; box-sizing: border-box; }
  .b05-ctl { display: grid; gap: 8px; }
  .b05-ctl .lb { font: 700 14px/1.2 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #667389; }
  .b05-ctl.row { grid-template-columns: 1fr 186px; align-items: center; }
  .b05-seg4 { display: grid !important; grid-template-columns: repeat(4, auto); }
  #stage .b05-seg4 .st-seg-b { padding: 8px 10px; font-size: 15px; }
  .b05-sel { height: 46px; border: 1.5px solid #cbd5e3; border-radius: 10px; background: #fff; padding: 0 12px; font: 600 19px/1 "DM Sans", sans-serif; color: #0d1e3a; width: 100%; }
  .b05-sel:disabled { opacity: .55; }
  .b05-vs { text-align: center; font: italic 600 26px/1 "Cormorant Garamond", Georgia, serif; color: #8a6e22; }
  .b05-inst { font: 700 28px/1.1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-res { border-top: 2px solid #d5bd68; padding-top: 10px; display: grid; gap: 0; margin-top: 4px; }
  .b05-res .h { text-align: center; font: 600 30px/1.1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; margin-bottom: 4px; }
  .b05-res .g { display: grid; grid-template-columns: 1fr 104px 104px; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid #ece6db; font: 700 18px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-res .g.two { grid-template-columns: 1fr 160px; }
  .b05-res .g.hd { font: 700 12px/1.2 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #667389; border: 0; padding-bottom: 2px; }
  .b05-res .g > span:not(.k) { text-align: right; }
  .b05-res .k { font: 600 16px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-res .neg { color: #b3402e; }
  #stage .b05-mon { height: 46px; font-size: 19px; text-align: right; }
  .b05-wait { display: grid; place-items: center; text-align: center; border: 2px dashed #cbd5e3; border-radius: 16px; box-sizing: border-box; background: rgba(227,232,240,.35); }
  .b05-wait p { max-width: 560px; margin: 0; font: 500 20px/1.5 "DM Sans", sans-serif; color: #667389; }
  .b05-doc { display: flex; justify-content: flex-end; min-height: 24px; }

  /* esc1 */
  .b05-esc-col { position: absolute; left: 110px; width: 920px; top: 138px; display: grid; gap: 16px; }
  #stage .b05-esc-h { margin: 6px 0 0; color: #8a6e22; font-size: 32px; }
  .b05-bcard.esc { font-size: 25px; padding: 15px 24px; }
  .b05-esc-img { position: absolute; transition: width 2s ease, height 2s ease, top 2s ease, right 2s ease, opacity .8s ease; }
  .b05-esc-img svg { width: 100%; height: 100%; display: block; overflow: visible; }
  .b05-sav { right: 0; bottom: 95px; width: 597px; height: 597px; }
  .b05-sav.gone { transition: width 2s ease, height 2s ease, right 1s ease 1s, opacity .8s ease; }
  .b05-pclamp { right: 0; top: -239px; width: 358px; height: 358px; opacity: 0; }
  .b05-dclamp { right: 1194px; bottom: 95px; width: 358px; height: 239px; opacity: 0; }
  .b05-pclamp.on, .b05-dclamp.on { opacity: 1; }
  .b05-word { position: absolute; transform: translate(-50%, -50%) scaleY(.84); font: 700 62px/1 "DM Sans", sans-serif; letter-spacing: .02em; color: #d5bd68; text-shadow: 1px 1px 0 #b8972e, 2px 2px 0 #b8972e, 3px 3px 0 #8a6e22, 4px 4px 0 #1d3863, 5px 5px 0 #14284a, 6px 6px 0 #0d1e3a; white-space: nowrap; }
  .b05-word.sm { font-size: 56px; }
  .b05-gold { color: #8a6e22; }
  .b05-src { margin-left: 8px; font-size: 17px; vertical-align: middle; }
  .b05-src.dim { opacity: .35; pointer-events: none; }

  /* de1 */
  .b05-de-set { position: absolute; left: 150px; right: 150px; top: 104px; height: 96px; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 0 30px; box-sizing: border-box; }
  .b05-nowrap { flex-wrap: nowrap !important; }
  .b05-de-g { display: grid; gap: 8px; justify-items: start; }
  .b05-de-g .lb { font: 700 14px/1.2 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #667389; }
  #stage .b05-de-add { width: 150px; height: 48px; text-align: right; }
  .b05-help { position: relative; width: 28px; height: 28px; border-radius: 50%; background: #0d1e3a; color: #f7f5f1; display: grid; place-items: center; cursor: help; flex: 0 0 auto; }
  .b05-help svg { width: 18px; height: 18px; }
  .b05-help .b05-tip { white-space: normal; width: 300px; right: auto; left: -136px; line-height: 1.35; }
  .b05-help:hover .b05-tip, .b05-help:focus .b05-tip { opacity: 1; }
  .b05-de-grid { position: absolute; left: 150px; right: 150px; top: 214px; height: 432px; display: grid; grid-template-rows: 1fr auto; overflow: hidden; padding: 0; }
  .b05-de-scroll { overflow: auto; }
  .b05-de-table th.r { text-align: right; }
  .b05-de-table td { padding: 6px 10px; }
  .b05-cell { width: 100%; height: 40px; border: 1.5px solid transparent; border-radius: 8px; background: transparent; font: 600 18px/1 "DM Sans", sans-serif; color: #0d1e3a; padding: 0 10px; box-sizing: border-box; font-variant-numeric: lining-nums tabular-nums; }
  .b05-cell:hover { border-color: #cbd5e3; background: #fff; }
  .b05-cell:focus { outline: none; border-color: #b8972e; background: #fff; box-shadow: 0 0 0 3px rgba(184,151,46,.18); }
  .b05-cell.r { text-align: right; }
  .b05-cell:disabled { color: #667389; background: transparent; border-color: transparent; }
  #stage .b05-mini .st-seg-b { padding: 6px 12px; font-size: 14px; }
  .b05-de-foot { display: flex; justify-content: space-between; align-items: center; padding: 10px 18px; border-top: 1px solid #e6dfd3; background: rgba(227,232,240,.32); }
  .b05-de-tot { display: flex; align-items: baseline; gap: 10px; }
  .b05-de-tot .lb { font: 700 13px/1.2 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #667389; }
  .b05-de-tot .v { font: 700 24px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-de-out { position: absolute; left: 150px; right: 150px; top: 664px; height: 124px; display: grid; place-items: center; }
  #stage .b05-de-calc { min-width: 240px; min-height: 58px; font-size: 21px; background: #b8972e; border-color: #b8972e; color: #0d1e3a; box-shadow: 0 10px 24px rgba(184,151,46,.3); }
  .b05-de-res { width: 100%; box-sizing: border-box; display: grid; grid-template-columns: 170px 1fr 170px; align-items: center; padding: 16px 24px; border-top: 4px solid #b8972e !important; }
  .b05-de-res .txt { text-align: center; }
  .b05-de-res p { margin: 0; font: 700 25px/1.4 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-de-res .gold { color: #8a6e22; }
  .b05-print { justify-self: end; width: 52px; height: 52px; border-radius: 50%; background: #0d1e3a; color: #d5bd68; border: 0; display: grid; place-items: center; cursor: pointer; box-shadow: 0 8px 18px rgba(13,30,58,.22); }
  .b05-print:hover { background: #b8972e; color: #0d1e3a; }
  .b05-print svg { width: 24px; height: 24px; }
  .b05-choose { display: grid; gap: 10px; }
  .b05-choice { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border: 1px solid #d6cfc4; border-radius: 12px; background: #fff; font: 600 20px/1.2 "DM Sans", sans-serif; color: #0d1e3a; text-align: left; cursor: pointer; }
  .b05-choice:hover { border-color: #b8972e; background: #f0e6c4; }
  .b05-choice .n { width: 32px; height: 32px; border-radius: 50%; background: #0d1e3a; color: #d5bd68; display: grid; place-items: center; font: 700 15px/1 "DM Sans", sans-serif; flex: 0 0 auto; }
  .b05-rpt { display: grid; gap: 8px; }
  .b05-rpt .s { margin: 0 0 4px; font: 700 21px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-rpt h3 { margin: 16px 0 2px; font: 700 14px/1.2 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #8a6e22; }
  #stage .b05-rpt .st-table { font-size: 16px; }
  .b05-rpt-sched th.grp { text-align: center !important; background: #1d3863; }

  /* disprot1 */
  .b05-dp-tabs { position: absolute; left: 160px; right: 160px; top: 30px; height: 50px; }
  .b05-dp-tabs .tab { position: absolute; bottom: 0; width: 287px; height: 50px; display: grid; place-items: center; background: #0d1e3a; color: #f7f5f1; font: 700 18px/1 "DM Sans", sans-serif; letter-spacing: .18em; text-transform: uppercase; border-radius: 14px 14px 0 0; }
  .b05-dp-tabs .tab.l { left: 0; }
  .b05-dp-tabs .tab.r { right: 0; background: #b8972e; color: #0d1e3a; }
  #stage .b05-dp-main { position: absolute; left: 160px; right: 160px; top: 80px; padding: 8px 0; border-radius: 0 0 16px 16px; }
  .b05-dp-row { display: grid; grid-template-columns: 287px 1fr 287px; align-items: center; padding: 5px 0; }
  .b05-dp-main .b05-dp-row + .b05-dp-row { border-top: 1px solid #ece6db; }
  .b05-dp-row.shared { background: rgba(227,232,240,.38); }
  .b05-dp-row .lab { text-align: center; font: 700 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  #stage .b05-dp-in { width: 200px; height: 42px; justify-self: center; text-align: right; font-size: 20px; }
  .b05-dd { position: relative; justify-self: center; width: 200px; }
  .b05-dd-b { width: 100%; height: 42px; border: 1.5px solid #cbd5e3; border-radius: 10px; background: #fff; font: 600 20px/1 "DM Sans", sans-serif; color: #0d1e3a; display: flex; align-items: center; justify-content: flex-end; gap: 6px; padding: 0 12px; cursor: pointer; box-sizing: border-box; }
  .b05-dd-b .car { margin-left: 8px; font-size: 14px; color: #667389; }
  .b05-dd-list { position: absolute; top: 46px; left: 0; right: 0; background: #fff; border: 1px solid #d6cfc4; border-radius: 10px; box-shadow: 0 14px 30px rgba(13,30,58,.18); z-index: 6; display: grid; padding: 6px; }
  .b05-dd-list button { border: 0; background: none; text-align: right; padding: 8px 12px; font: 600 18px/1.1 "DM Sans", sans-serif; border-radius: 8px; color: #0d1e3a; cursor: pointer; }
  .b05-dd-list button:hover, .b05-dd-list button.on { background: #f0e6c4; }
  #stage .b05-dp-res { position: absolute; left: 160px; right: 160px; top: 516px; padding: 6px 0 10px; border-top: 4px solid #b8972e; }
  .b05-dp-row.res { padding: 6px 0; }
  .b05-dp-row.res + .b05-dp-row.res { border-top: 1px solid #ece6db; }
  .b05-dp-row.res .cell { justify-self: center; min-height: 46px; display: grid; place-items: center; }
  .b05-dp-row.res .v { font: 700 24px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-dp-sum { padding: 6px 60px 0; text-align: center; }
  .b05-dp-sum p { margin: 4px 0; font: 600 21px/1.4 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-dp-sum .b { font-weight: 700; }
  .b05-dp-sum .gold { color: #8a6e22; }
  .b05-dp-sum .st-disclaimer { margin-top: 8px; font-size: 13px; line-height: 1.4; }
  .b05-dp-links { position: absolute; left: 470px; width: 660px; top: 770px; display: flex; justify-content: space-between; align-items: center; }
  .b05-ck { margin: 0; padding-left: 34px; columns: 2; column-gap: 54px; font: 500 18px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-ck li { margin-bottom: 10px; break-inside: avoid; }
  .b05-ck li::marker { color: #8a6e22; font-weight: 700; }
  .b05-ck-d { margin-top: 14px; padding-top: 12px; border-top: 1px solid #d6cfc4; }
  .b05-ck-d p { font: 400 14px/1.45 "DM Sans", sans-serif; color: #667389; margin: 0 0 6px; }

  /* ds1 */
  .b05-ds-view { position: absolute; inset: 0; }
  #stage .b05-ds-form { position: absolute; left: 330px; width: 940px; top: 108px; padding: 10px 34px; box-sizing: border-box; }
  .b05-ds-row { display: grid; grid-template-columns: 1fr 400px; align-items: center; min-height: 50px; }
  .b05-ds-form > .b05-ds-row + .b05-ds-row, .b05-ds-form > .b05-ds-tri { border-top: 1px solid #ece6db; }
  .b05-ds-row .lab, .b05-ds-tri .lab { font: 700 20px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-ds-row .b05-cx { display: flex; justify-content: flex-end; align-items: center; gap: 12px; }
  .b05-ds-row .st-field, .b05-ds-tri .st-field { width: 190px; }
  #stage .b05-ds-row .st-input, #stage .b05-ds-tri .st-input, #stage .b05-modal .st-input { height: 40px; font-size: 19px; text-align: right; }
  .b05-ds-tri { display: grid; grid-template-columns: 190px 1fr 190px; align-items: center; min-height: 50px; }
  .b05-ds-tri .mid { text-align: center; }
  .b05-ds-tri.hd > div { font: 700 14px/1.2 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6e22; text-align: center; }
  .b05-ds-slider { width: 86%; accent-color: #0d1e3a; }
  .b05-switch.sm { font-size: 15px; color: #667389; }
  .b05-ds-inf { display: inline-flex; }
  .b05-ds-note { position: absolute; left: 330px; width: 940px; top: 760px; display: grid; gap: 2px; text-align: center; }
  .b05-ds-note p { margin: 0; }
  #stage .b05-ds-termcard { position: absolute; left: 280px; top: 136px; width: 620px; padding: 26px 32px; box-sizing: border-box; display: grid; gap: 6px; }
  .b05-ds-termcard h3 { margin-bottom: 8px !important; }
  .b05-ds-listcol { position: absolute; top: 124px; width: 360px; display: grid; gap: 12px; }
  .b05-ds-listcol h3 { text-align: center; }
  .b05-ds-list { max-height: 520px; overflow: auto; border-radius: 14px; border: 1px solid #d6cfc4; background: #fffdf8; box-shadow: 0 10px 26px rgba(13,30,58,.07); }
  #stage .b05-ds-tab { font-size: 18px; }
  #stage .b05-ds-tab th { position: sticky; top: 0; z-index: 1; }
  #stage .b05-ds-tab th:first-child, #stage .b05-ds-tab td:first-child { text-align: center; }
  .b05-ds-tab tbody tr { cursor: pointer; }
  #stage .b05-ds-tab tbody tr:hover td { background: #f0e6c4; }
  .b05-modal { position: absolute; inset: 0; z-index: 40; background: rgba(13,30,58,.38); display: grid; place-items: center; }
  .b05-modal-in { width: 670px; background: #fffdf8; border-radius: 16px; border: 1px solid #d6cfc4; padding: 26px 32px; display: grid; gap: 8px; box-shadow: 0 30px 80px rgba(8,20,42,.35); box-sizing: border-box; }
  .b05-modal-in .row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; }
  .b05-modal-in .b05-ds-row { grid-template-columns: 1fr 300px; }
  /* ds2 */
  .b05-ds2-tbl { position: absolute; left: 110px; right: 110px; top: 110px; height: 540px; overflow: auto; border-radius: 14px; border: 1px solid #d6cfc4; background: #fffdf8; box-shadow: 0 12px 30px rgba(13,30,58,.07); }
  #stage .b05-ds2-t { font-size: 20px; }
  #stage .b05-ds2-t th { position: sticky; top: 0; z-index: 1; text-align: right; padding: 14px 18px; }
  #stage .b05-ds2-t td { padding: 9px 18px; }
  #stage .b05-ds2-t th:first-child, #stage .b05-ds2-t td:first-child, #stage .b05-ds2-t th:last-child, #stage .b05-ds2-t td:last-child { text-align: center; }
  #stage .b05-ds2-t tr.ret td { border-top: 3px solid #b8972e; }
  #stage .b05-ds2-t tr.work td { color: #8a93a3; }
  .b05-ds2-t .suf { color: #d5bd68; }
  .b05-ds2-docs { position: absolute; left: 110px; right: 110px; top: 664px; display: grid; grid-template-columns: 150px 1fr 1fr 1fr 150px; justify-items: end; padding-right: 18px; }
  .b05-ds2-docs > * { margin-right: 18px; }
  .b05-ds2-btns { position: absolute; left: 0; right: 0; top: 702px; display: flex; justify-content: center; gap: 16px; }
  .b05-ds2-btns .st-pill { min-width: 170px; }
  .b05-ds2-disc { position: absolute; left: 150px; right: 150px; top: 766px; text-align: center; display: grid; gap: 4px; }
  .b05-ds2-disc p { margin: 0; font-size: 13px; line-height: 1.4; }
  .b05-ds2-sum { max-height: 640px; overflow: auto; }
  `);

  /* ---------- small shared helpers ---------- */
  const navyGrad = (id, a, b, x2, y2) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2 == null ? 1 : x2}" y2="${y2 == null ? 1 : y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const r2 = (n) => Math.round(n * 100) / 100;
  const shadowEl = (cx, cy, rx, ry, o) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(13,30,58,${o == null ? 0.12 : o})"/>`;
  const today = () => { const d = new Date(); return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`; };
  const uid = () => Math.random().toString(36).slice(2, 10);
  const ICO = {
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6L9 21H3v-6z"/><path d="M12 6l6 6"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5 12 13l8.5-6.5"/></svg>',
    results: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16" opacity=".4"/><circle cx="9" cy="7" r="2.4" fill="currentColor"/><circle cx="16" cy="12" r="2.4" fill="currentColor"/><circle cx="7" cy="17" r="2.4" fill="currentColor"/></svg>',
    view: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h7M9 16h5"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/></svg>',
    boxOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4" fill="currentColor" fill-opacity=".18"/><path d="M8 12.5l3 3 5.5-6.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>',
    collapse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10h-6V4M4 14h6v6M14 10l7-7M10 14l-7 7"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 11v6"/><circle cx="12" cy="7.4" r=".6" fill="currentColor"/></svg>'
  };

  /** a small dialog on the standard stage overlay (Esc and the close button dismiss it) */
  function dialog(ctx, o) {
    const ov = ctx.overlay({ title: o.title, html: `<div class="b05-dlg">${o.html}</div>`, cls: o.size || 'b05-sm', wide: false, onClose: o.onClose });
    return ov;
  }
  function note(ctx, titleKey, bodyKey) {
    const ov = dialog(ctx, { title: ctx.t(titleKey), html: `${ctx.t(bodyKey, { tag: 'p' })}<div class="row"><button type="button" class="st-pill" data-ok>${ctx.t('bOk')}</button></div>` });
    ov.querySelector('[data-ok]').addEventListener('click', () => ov.close());
    return ov;
  }

  /* ======================================================================
     Communication profile: the strengths chart shared by gw1 and cpp1..cpp5
     ====================================================================== */
  const CP_NS = 'b05-cp';
  const DIM = [
    { t: 'Solving Problems', l: 'Thinks It Through', r: 'Moves to Action' },
    { t: 'Weighing Information', l: 'Verifies First', r: 'Trusts Readily' },
    { t: 'Handling Change', l: 'Changes Quickly', r: 'Wants Predictability' },
    { t: 'Carrying Out Plans', l: 'Questions the Rules', r: 'Follows the Rules' }
  ];
  function chartCopy() {
    const c = { 'c.neutral': 'neutral' };
    DIM.forEach((d, i) => { c['c.t' + i] = d.t; c['c.l' + i] = d.l; c['c.r' + i] = d.r; });
    return c;
  }
  /* geometry on the 1600 x 900 stage (the spec's percentages of the stage) */
  const CH = {
    cx: 800, unit: 48, cardT: 144, cardH: 585,
    titleT: [175, 310, 445, 580], poleT: [221, 356, 491, 626], lineY: [243, 378, 513, 648],
    one: [229, 364, 499, 634], two: [[213, 348, 483, 618], [245, 380, 515, 650]], bandT: [171, 306, 441, 576]
  };
  /** bar for a 0..100 score: < 45 grows left, > 55 grows right, else neutral; units = round(|n - 50| / 5) */
  function barRule(n) {
    if (n < 45) return { side: -1, units: Math.round((50 - n) / 5) };
    if (n > 55) return { side: 1, units: Math.round((n - 50) / 5) };
    return { side: 0, units: 0 };
  }
  /** objective tally for one chart row: +1 per person at 50 or above, -1 below */
  function tallyRow(people, row) {
    let t = 0;
    people.forEach((p) => { t += p.scores[row] >= 50 ? 1 : -1; });
    return t;
  }
  /** profile record -> {name, first, scores[4], reportId, paras[]} (DataFields: "reportId|s1|s2|s3|s4|para|para...") */
  function parseProfile(rec) {
    const parts = String(rec.fields || '').split('|');
    const scores = [1, 2, 3, 4].map((i) => { const v = parseInt(parts[i], 10); return isFinite(v) ? Math.max(0, Math.min(100, v)) : 50; });
    const paras = parts.slice(5).map((s) => s.trim()).filter(Boolean);
    const first = (rec.first || '').trim(), last = (rec.last || '').trim();
    return { id: rec.id, first, last, name: (first + ' ' + last).trim(), reportId: parts[0] || '', scores, paras };
  }
  const getRoster = () => { const r = EFA.clients.get(CP_NS, 'roster', []); return Array.isArray(r) ? r.map((x) => Object.assign({}, x)) : []; };
  const saveRoster = (list) => EFA.clients.set(CP_NS, 'roster', list);
  const isDone = (r) => r.status === 'Complete';
  /** the profiles chosen on the gateway (in list order, at most two) */
  function selectedProfiles() {
    return getRoster().filter((r) => r.isSelected && isDone(r)).slice(0, 2).map(parseProfile);
  }

  /** chart HTML. o: {rows (how many rows plotted), hi (highlighted row or -1), ticks, tags, people, dy} */
  function chartHTML(ctx, o) {
    const dy = o.dy || 0, ppl = o.people || [];
    let h = '';
    if (o.ticks) for (let k = -10; k <= 10; k++) h += `<span class="b05-tick${k === 0 ? ' z' : ''}" style="left:${CH.cx + k * CH.unit}px;top:${101 + dy}px">${Math.abs(k)}</span>`;
    h += `<div class="b05-card" style="top:${CH.cardT + dy}px"></div>`;
    if (o.hi != null && o.hi >= 0) h += `<div class="b05-band" style="top:${CH.bandT[o.hi] + dy}px"></div>`;
    // the center line runs between the row titles so it never crosses their lettering
    const segs = [[CH.cardT + 14, CH.titleT[0] - 6]].concat(CH.titleT.map((t, i) => [t + 30, i < 3 ? CH.titleT[i + 1] - 6 : CH.cardT + CH.cardH - 14]));
    segs.forEach(([a, b]) => { h += `<div class="b05-mid" style="top:${a + dy}px;height:${b - a}px"></div>`; });
    for (let i = 0; i < 4; i++) {
      h += `<div class="b05-rline" style="top:${CH.lineY[i] + dy}px"></div>`;
      h += ctx.t('c.t' + i, { tag: 'div', cls: 'b05-rt', attrs: `style="top:${CH.titleT[i] + dy}px${i === o.hi ? ';color:#0d1e3a' : ''}"` });
      h += ctx.t('c.l' + i, { tag: 'div', cls: 'b05-pole l', attrs: `style="top:${CH.poleT[i] + dy}px"` });
      h += ctx.t('c.r' + i, { tag: 'div', cls: 'b05-pole r', attrs: `style="top:${CH.poleT[i] + dy}px"` });
    }
    for (let i = 0; i < (o.rows || 0); i++) {
      ppl.forEach((p, j) => {
        const top = (ppl.length === 1 ? CH.one[i] : CH.two[j][i]) + dy;
        const b = barRule(p.scores[i]);
        if (b.side === 0) h += `<div class="b05-bar p${j} N" style="left:${CH.cx - 60}px;width:120px;top:${top}px">${ctx.t('c.neutral')}</div>`;
        else {
          const w = b.units * CH.unit;
          h += `<div class="b05-bar p${j} ${b.side < 0 ? 'L' : 'R'}" style="left:${b.side < 0 ? CH.cx - w : CH.cx}px;width:${w}px;top:${top}px"><span class="num">${b.units}</span></div>`;
        }
      });
    }
    if (o.tags) ppl.forEach((p, j) => { h += `<button type="button" class="b05-tag p${j}" data-who="${j}" style="left:${j === 0 ? 480 : 1120}px;top:${762 + dy}px">${esc(p.name || p.first)}</button>`; });
    return h;
  }

  /** statement view: one centered column, or two side-by-side columns */
  function statementsHTML(ctx, people, focus) {
    const paras = (p) => (p.paras.length ? p.paras : ['']).map((t) => `<p>${esc(t)}</p>`).join('');
    if (people.length < 2) {
      const p = people[focus || 0] || people[0];
      if (!p) return '';
      return `<div class="b05-stmt-one">
          <h2 class="st-h2">${ctx.t('stmtLead')} <span class="b05-nm">${esc(p.first)}</span>${ctx.t('stmtTail')}</h2>
          <div class="b05-stmt-body" style="max-height:600px">${paras(p)}</div>
        </div>`;
    }
    return `<div class="b05-stmt-two">${people.map((p, j) => `<div class="b05-stmt-col p${j}">
          <div class="nm">${esc(p.first)}</div>
          <div class="ln">${ctx.t('stmtLeadShort')} ${esc(p.first)}</div>
          <div class="b05-stmt-body" style="height:560px">${paras(p)}</div>
        </div>`).join('')}</div>`;
  }

  /* ---------- artwork for the profile screens (flat duotone, drawn in code) ---------- */
  /** two writers meeting on one page: two hands with pens, one cursive line and one printed line */
  function artPens() {
    const W = 1380, cx = 690, lineY = [126, 176, 226, 276];
    const NIB = 178, HS = 1.12; // nib tip distance from the palm center (local units) and hand scale
    /* a writing hand seen from above: pen pointing up (-y), arm running down (+y), thumb on the -x side.
       Draw order: sleeve, pen, back of the hand, knuckles, thumb, so the pen tucks under the fingers. */
    const hand = (sleeve, cuff) => `<g transform="scale(${HS})">
      <rect x="-60" y="58" width="120" height="420" rx="26" fill="${sleeve}"/>
      <rect x="-38" y="92" width="16" height="380" rx="8" fill="rgba(255,255,255,.12)"/>
      <rect x="-28" y="${-NIB + 38}" width="20" height="150" rx="10" fill="${P.navy}"/>
      <rect x="-28" y="${-NIB + 66}" width="20" height="12" fill="${P.gold}"/>
      <path d="M-28,${-NIB + 40} L-18,${-NIB} L-8,${-NIB + 40} Z" fill="${P.gold}"/>
      <path d="M-18,${-NIB + 8} V${-NIB + 32}" stroke="${P.goldDeep}" stroke-width="2.5"/>
      <rect x="-64" y="50" width="128" height="30" rx="10" fill="${cuff}"/>
      <path d="M-50,58 C-60,18 -58,-28 -34,-50 C-14,-68 20,-66 40,-48 C58,-30 60,18 50,58 Z" fill="${P.paper}" stroke="${P.navy}" stroke-width="5" stroke-linejoin="round"/>
      <g fill="none" stroke="${P.navy}" stroke-width="4" stroke-linecap="round">
        <path d="M-22,-40 q11,-12 22,0"/><path d="M2,-42 q11,-12 22,0"/><path d="M24,-32 q9,-10 18,2"/>
        <path d="M-10,12 q14,8 30,0" opacity=".4"/>
      </g>
      <path d="M-50,8 C-78,-2 -84,-34 -62,-50 C-50,-58 -34,-52 -30,-40 C-26,-28 -26,-12 -20,0" fill="${P.paper}" stroke="${P.navy}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
    </g>`;
    /** place a hand so its nib tip lands on (nx, ny), rotated by deg; mirror flips it for the right-hand writer */
    const placed = (nx, ny, deg, mirror, sleeve, cuff) => {
      const t = (deg * Math.PI) / 180, lx = (mirror ? 18 : -18) * HS, ly = -NIB * HS;
      const x = lx * Math.cos(t) - ly * Math.sin(t), y = lx * Math.sin(t) + ly * Math.cos(t);
      return `<g transform="translate(${r2(nx - x)},${r2(ny - y)}) rotate(${deg})"><g transform="scale(${mirror ? -1 : 1},1)">${hand(sleeve, cuff)}</g></g>`;
    };
    // cursive (left writer): humps and loops; the last line runs up to the meeting point
    const cursiveLine = (x0, x1, y) => {
      let d = `M${x0},${y}`, x = x0, k = 0;
      while (x < x1 - 24) {
        const m = k % 7;
        if (m === 3) { d += ` m22,0`; x += 22; }
        else if (m === 1 || m === 5) d += ` c4,-30 18,-40 16,-38 c-4,-2 -12,10 -8,24 c3,10 8,14 14,14`, x += 22;
        else d += ` c6,-18 16,-18 22,0`, x += 22;
        k++;
      }
      return d;
    };
    const glyph = (x, y, k) => [
      `M${x},${y - 26} V${y}`, `M${x + 11},${y - 11} m-11,0 a11,11 0 1,0 22,0 a11,11 0 1,0 -22,0`, `M${x},${y} V${y - 22} q11,-8 22,0 V${y}`,
      `M${x},${y - 22} L${x + 11},${y} L${x + 22},${y - 22}`, `M${x},${y - 14} H${x + 20} M${x + 10},${y - 28} V${y}`, `M${x},${y - 34} V${y}`
    ][k % 6];
    const printLine = (x0, x1, y, seed) => { let d = '', x = x0, k = seed; while (x < x1 - 22) { d += glyph(x, y, k) + ' '; x += (k % 5 === 4) ? 44 : 30; k += 2; } return d; };
    const lens = [[250, 640], [250, 600], [250, 646]], plen = [[742, 1132], [778, 1132], [742, 1100]];
    let cur = '', pr = '';
    lineY.slice(0, 3).forEach((y, i) => { cur += cursiveLine(lens[i][0], lens[i][1], y) + ' '; pr += printLine(plen[i][0], plen[i][1], y, i); });
    cur += cursiveLine(430, 668, lineY[3]);
    pr += printLine(714, 930, lineY[3], 3);
    return `<svg viewBox="0 0 ${W} 440" aria-hidden="true">
      <defs>${navyGrad('b05pBg', '#eef1f6', '#f6f3ec', 0, 1)}<radialGradient id="b05pHalo" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="${P.goldPale}" stop-opacity=".95"/><stop offset="1" stop-color="${P.goldPale}" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="440" fill="url(#b05pBg)"/>
      <g transform="rotate(-1.2 ${cx} 220)">
        <rect x="186" y="42" width="1008" height="420" rx="16" fill="rgba(13,30,58,.08)" transform="translate(6,8)"/>
        <rect x="186" y="42" width="1008" height="420" rx="16" fill="${P.paper}" stroke="${P.rule}" stroke-width="2"/>
        <ellipse cx="${cx}" cy="262" rx="300" ry="150" fill="url(#b05pHalo)"/>
        <path d="${lineY.concat([326, 376]).map((y) => `M226,${y + 4} H1154`).join(' ')}" stroke="${P.mist2}" stroke-width="2"/>
        <path d="M232,72 H1148" stroke="${P.goldLt}" stroke-width="2" opacity=".7"/>
        <path d="${cur}" fill="none" stroke="${P.goldDeep}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${pr}" fill="none" stroke="${P.navy}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      ${placed(cx - 22, 272, 56, false, P.navy, P.gold)}
      ${placed(cx + 22, 272, -56, true, P.gold, P.navy)}
      <g transform="translate(${cx},236)" fill="${P.gold}"><path d="M0,-30 L6,-6 L30,0 L6,6 L0,30 L-6,6 L-30,0 L-6,-6 Z"/><circle r="4.5" fill="${P.paper}"/><circle cx="-34" cy="-26" r="4"/><circle cx="36" cy="-20" r="3"/></g>
    </svg>`;
  }

  /** an aerial view of a baseball game: a split-second decision on every pitch */
  function artBaseball() {
    const W = 1380, H = 440, hx = 690, hy = 408, s = 236, q = s / Math.SQRT2;
    const B1 = [hx + q, hy - q], B2 = [hx, hy - 2 * q], B3 = [hx - q, hy - q], M = [hx, hy - 0.95 * q];
    const F1 = [hx + 1.33 * q, hy - 1.33 * q], F3 = [hx - 1.33 * q, hy - 1.33 * q];
    const R = Math.hypot(F1[0] - M[0], F1[1] - M[1]);
    let stripes = '';
    for (let i = -6; i < 16; i++) stripes += `<path d="M${i * 120},0 l120,0 l-440,${H} l-120,0 Z" fill="${i % 2 ? P.navy3 : '#22427a'}"/>`;
    const inset = 22, k = inset / s;
    const g = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const Hh = [hx, hy];
    const gH = g(Hh, B2, k * 1.5), g1 = g(B1, B3, k), g2 = g(B2, Hh, k * 1.3), g3 = g(B3, B1, k);
    const player = (x, y, fill, rim) => `${shadowEl(x + 3, y + 9, 13, 5, 0.25)}<circle cx="${x}" cy="${y}" r="12" fill="${fill}" stroke="${rim}" stroke-width="3"/>`;
    const base = ([x, y]) => `<rect x="${x - 9}" y="${y - 9}" width="18" height="18" fill="${P.white}" transform="rotate(45 ${x} ${y})"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="${W}" height="${H}" fill="${P.navy3}"/>${stripes}
      <path d="M${hx},${hy} L${hx - 700},${hy - 700} M${hx},${hy} L${hx + 700},${hy - 700}" stroke="${P.paper}" stroke-width="5" opacity=".9"/>
      <path d="M${hx},${hy} L${F1[0]},${F1[1]} A${R},${R} 0 1 0 ${F3[0]},${F3[1]} Z" fill="#d9c08a"/>
      <path d="M${hx},${hy} L${F1[0]},${F1[1]} A${R},${R} 0 1 0 ${F3[0]},${F3[1]} Z" fill="none" stroke="#c4a86c" stroke-width="3"/>
      <path d="M${gH[0]},${gH[1]} L${g1[0]},${g1[1]} L${g2[0]},${g2[1]} L${g3[0]},${g3[1]} Z" fill="#2b4c80"/>
      <circle cx="${M[0]}" cy="${M[1]}" r="26" fill="#d9c08a" stroke="#c4a86c" stroke-width="3"/>
      <rect x="${M[0] - 9}" y="${M[1] - 2.5}" width="18" height="5" fill="${P.white}"/>
      <circle cx="${hx}" cy="${hy}" r="48" fill="#d9c08a"/>
      <path d="M${hx - 34},${hy - 16} h22 v30 h-22 Z M${hx + 12},${hy - 16} h22 v30 h-22 Z" fill="none" stroke="${P.paper}" stroke-width="2.5"/>
      ${base(B1)}${base(B2)}${base(B3)}
      <path d="M${hx - 9},${hy - 8} h18 v9 l-9,8 l-9,-8 Z" fill="${P.white}"/>
      <rect x="40" y="${H - 64}" width="250" height="40" rx="6" fill="${P.navy2}"/><rect x="40" y="${H - 64}" width="250" height="8" fill="${P.gold}"/>
      <rect x="${W - 290}" y="${H - 64}" width="250" height="40" rx="6" fill="${P.navy2}"/><rect x="${W - 290}" y="${H - 64}" width="250" height="8" fill="${P.gold}"/>
      <path d="M${M[0]},${M[1] + 8} Q${hx + 18},${(M[1] + hy) / 2} ${hx + 4},${hy - 26}" fill="none" stroke="${P.goldLt}" stroke-width="4" stroke-dasharray="3 9" stroke-linecap="round"/>
      <path d="M${hx + 4},${hy - 26} Q${hx + 230},${hy - 330} ${hx + 420},${hy - 380}" fill="none" stroke="${P.gold}" stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round"/>
      <circle cx="${hx + 420}" cy="${hy - 380}" r="8" fill="${P.white}" stroke="${P.navy}" stroke-width="2"/>
      ${player(M[0], M[1] - 4, P.paper, P.navy)}
      ${player(hx, hy + 22, P.paper, P.navy)}
      ${player(B1[0] + 26, B1[1] - 22, P.paper, P.navy)}
      ${player(hx + 92, B2[1] + 48, P.paper, P.navy)}
      ${player(hx - 104, B2[1] + 52, P.paper, P.navy)}
      ${player(B3[0] - 20, B3[1] - 20, P.paper, P.navy)}
      ${player(hx - 420, 40, P.paper, P.navy)}${player(hx + 2, 18, P.paper, P.navy)}${player(hx + 470, 52, P.paper, P.navy)}
      ${player(hx - 26, hy - 4, P.gold, P.goldDeep)}
      ${player(B1[0] - 30, B1[1] + 24, P.gold, P.goldDeep)}
      <path d="M${B1[0] - 30},${B1[1] + 24} L${B1[0] - 4},${B1[1] - 10}" stroke="${P.goldLt}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>
    </svg>`;
  }

  /** one pair of glasses, two ways of seeing: the left lens checks the facts, the right lens sees the bright side */
  function artGlasses() {
    const W = 1380, H = 440, L = [500, 214], Rr = [880, 214], r = 158;
    const doc = `<g transform="translate(${L[0] - 70},${L[1] - 96})">
        <rect width="140" height="186" rx="10" fill="${P.paper}" stroke="${P.navy}" stroke-width="5"/>
        <g stroke="${P.mist2}" stroke-width="7" stroke-linecap="round"><path d="M28 44h84M28 76h70M28 108h84M28 140h56"/></g>
        <g stroke="${P.gold}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M100 38l8 8 14-16"/><path d="M100 102l8 8 14-16"/></g>
      </g>
      <g transform="translate(${L[0] + 46},${L[1] + 40})"><circle r="34" fill="${P.goldPale}" fill-opacity=".5" stroke="${P.navy}" stroke-width="8"/><path d="M24 24l34 34" stroke="${P.navy}" stroke-width="14" stroke-linecap="round"/></g>`;
    let rays = '';
    for (let i = 0; i < 9; i++) { const a = -80 + i * 20; const [x1, y1] = A.pt(Rr[0], Rr[1] + 60, 92, a), [x2, y2] = A.pt(Rr[0], Rr[1] + 60, 136, a); rays += `<path d="M${x1},${y1} L${x2},${y2}"/>`; }
    const sun = `<rect x="${Rr[0] - r}" y="${Rr[1] - r}" width="${2 * r}" height="${2 * r}" fill="#fbf3dc"/>
      <g stroke="${P.goldLt}" stroke-width="8" stroke-linecap="round">${rays}</g>
      <path d="${A.wedge(Rr[0], Rr[1] + 60, 74, -90, 90)}" fill="${P.gold}"/>
      <rect x="${Rr[0] - r}" y="${Rr[1] + 60}" width="${2 * r}" height="${r}" fill="${P.navy3}"/>
      <path d="M${Rr[0] - 120},${Rr[1] + 112} L${Rr[0] - 50},${Rr[1] + 92} L${Rr[0] + 10},${Rr[1] + 100} L${Rr[0] + 100},${Rr[1] + 70}" fill="none" stroke="${P.goldLt}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${Rr[0] + 82},${Rr[1] + 60} L${Rr[0] + 104},${Rr[1] + 68} L${Rr[0] + 92},${Rr[1] + 88}" fill="none" stroke="${P.goldLt}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <defs>${navyGrad('b05gBg', '#f3f5f9', '#f7f5f1', 0, 1)}
        <clipPath id="b05gL"><circle cx="${L[0]}" cy="${L[1]}" r="${r - 6}"/></clipPath>
        <clipPath id="b05gR"><circle cx="${Rr[0]}" cy="${Rr[1]}" r="${r - 6}"/></clipPath></defs>
      <rect width="${W}" height="${H}" fill="url(#b05gBg)"/>
      <circle cx="160" cy="70" r="120" fill="${P.mist}" opacity=".6"/><circle cx="1250" cy="380" r="150" fill="${P.goldPale}" opacity=".45"/>
      ${shadowEl(690, 404, 380, 16, 0.12)}
      <g clip-path="url(#b05gL)"><rect x="${L[0] - r}" y="${L[1] - r}" width="${2 * r}" height="${2 * r}" fill="#eef2f8"/>${doc}</g>
      <g clip-path="url(#b05gR)">${sun}</g>
      <g fill="none" stroke="${P.navy}" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="${L[0]}" cy="${L[1]}" r="${r}" stroke-width="18"/>
        <circle cx="${Rr[0]}" cy="${Rr[1]}" r="${r}" stroke-width="18"/>
        <path d="M${L[0] + r - 6},${L[1] - 40} Q690,${L[1] - 92} ${Rr[0] - r + 6},${Rr[1] - 40}" stroke-width="16"/>
        <path d="M${L[0] - r},${L[1] - 30} L${L[0] - r - 150},${L[1] - 70} Q${L[0] - r - 210},${L[1] - 80} ${L[0] - r - 230},${L[1] - 30}" stroke-width="14"/>
        <path d="M${Rr[0] + r},${Rr[1] - 30} L${Rr[0] + r + 150},${Rr[1] - 70} Q${Rr[0] + r + 210},${Rr[1] - 80} ${Rr[0] + r + 230},${Rr[1] - 30}" stroke-width="14"/>
      </g>
      <g fill="none" stroke="${P.gold}" stroke-width="4" stroke-linecap="round" opacity=".9">
        <path d="${A.arc(L[0], L[1], r - 22, -62, -20)}"/><path d="${A.arc(Rr[0], Rr[1], r - 22, -62, -20)}"/>
      </g>
    </svg>`;
  }

  /** stick-figure runner (facing right), hip at (x, y), scale sc. pose: run | give | take | ease; baton: 'f' front hand */
  function runner(x, y, col, pose, baton, sc) {
    const J = {
      run: { n: [16, -64], fe: [38, -40], fh: [58, -54], be: [-6, -36], bh: [-22, -16], fk: [32, 22], ff: [24, 60], bk: [-16, 28], bf: [-44, 42] },
      give: { n: [18, -62], fe: [44, -46], fh: [74, -40], be: [-4, -34], bh: [-20, -14], fk: [30, 24], ff: [20, 60], bk: [-14, 30], bf: [-42, 40] },
      take: { n: [12, -64], fe: [34, -42], fh: [50, -56], be: [-14, -44], bh: [-44, -38], fk: [28, 24], ff: [22, 60], bk: [-16, 28], bf: [-42, 44] },
      ease: { n: [6, -66], fe: [20, -40], fh: [28, -22], be: [-8, -40], bh: [-14, -18], fk: [12, 28], ff: [10, 62], bk: [-8, 30], bf: [-16, 62] }
    }[pose];
    const p = (q) => `${q[0]},${q[1]}`;
    const head = [J.n[0] + 6, J.n[1] - 20];
    return `<g transform="translate(${x},${y}) scale(${sc || 1})">
      <g stroke="${col}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M${p(J.n)} L${p(J.be)} L${p(J.bh)}"/><path d="M0,0 L${p(J.bk)} L${p(J.bf)}"/>
        <path d="M0,0 L${p(J.n)}"/><path d="M0,0 L${p(J.fk)} L${p(J.ff)}"/><path d="M${p(J.n)} L${p(J.fe)} L${p(J.fh)}"/>
      </g><circle cx="${head[0]}" cy="${head[1]}" r="14" fill="${col}"/>
      ${baton === 'f' ? `<rect x="${J.fh[0] - 4}" y="${J.fh[1] - 17}" width="9" height="34" rx="4" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="2" transform="rotate(18 ${J.fh[0]} ${J.fh[1]})"/>` : ''}
    </g>`;
  }

  /** an aerial running track with painted lane numbers, and a strip of three relay hand-off moments */
  function artTrack() {
    const W = 1380, lane = 36, top = 26, n = 6, cy = -300, cxc = 1010;
    const r0 = top - cy, rN = top + lane * n - cy;
    let lines = '';
    for (let i = 0; i <= n; i++) {
      const y = top + i * lane, rr = y - cy;
      const [ax, ay] = A.pt(cxc, cy, rr, 180 - 70);
      lines += `<path d="M0,${y} H${cxc} A${rr},${rr} 0 0 0 ${ax},${ay}" fill="none" stroke="${P.paper}" stroke-width="${i === 0 || i === n ? 4 : 3}" opacity=".95"/>`;
    }
    let nums = '';
    for (let i = 0; i < n; i++) nums += `<text x="96" y="${top + i * lane + lane / 2 + 9}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="26" fill="${P.goldLt}">${i + 1}</text>`;
    const [oax, oay] = A.pt(cxc, cy, rN, 110), [iax, iay] = A.pt(cxc, cy, r0, 110);
    const trackPath = `M0,${top} H${cxc} A${r0},${r0} 0 0 0 ${iax},${iay} L${oax},${oay} A${rN},${rN} 0 0 1 ${cxc},${top + lane * n} H0 Z`;
    const panel = (i, body) => `<g transform="translate(${i * 463},292)"><rect width="454" height="148" rx="16" fill="${P.paper}" stroke="${P.rule}" stroke-width="2"/><path d="M24,124 H430" stroke="${P.mist2}" stroke-width="4" stroke-linecap="round"/>${body}</g>`;
    const speed = (x, y) => `<g stroke="${P.mist2}" stroke-width="5" stroke-linecap="round"><path d="M${x},${y} h-46"/><path d="M${x - 10},${y + 18} h-34"/><path d="M${x + 4},${y - 18} h-30"/></g>`;
    return `<svg viewBox="0 0 ${W} 440" aria-hidden="true">
      <defs><clipPath id="b05tClip"><rect width="${W}" height="270" rx="22"/></clipPath></defs>
      <g clip-path="url(#b05tClip)">
        <rect width="${W}" height="270" fill="#e9edf3"/>
        <path d="${trackPath}" fill="${P.navy3}"/>
        ${lines}
        <path d="M150,${top} V${top + lane * n}" stroke="${P.paper}" stroke-width="7"/>
        <path d="M520,${top} V${top + lane * n}" stroke="${P.gold}" stroke-width="5" stroke-dasharray="10 8"/>
        ${nums}
        <rect y="${top + lane * n + 2}" width="${W}" height="60" fill="#e9edf3"/>
      </g>
      ${panel(0, `${speed(150, 74)}${runner(222, 80, P.navy, 'run', 'f', 0.72)}`)}
      ${panel(1, `${runner(182, 80, P.navy, 'give', 'f', 0.72)}${runner(274, 80, P.navy4, 'take', null, 0.72)}`)}
      ${panel(2, `${runner(112, 80, P.mist2, 'ease', null, 0.72)}${speed(250, 74)}${runner(304, 80, P.navy4, 'run', 'f', 0.72)}`)}
    </svg>`;
  }

  /** two stop signs: the same rule in two different forms */
  function artStops() {
    const W = 1380, H = 440;
    const oct = (cx, cy, R) => Array.from({ length: 8 }, (_, i) => A.pt(cx, cy, R, 22.5 + i * 45)).map((p, i) => `${i ? 'L' : 'M'}${r2(p[0])},${r2(p[1])}`).join('') + 'Z';
    const sign = (cx, fill, ring, ringW, post) => `
      ${shadowEl(cx + 8, 420, 90, 10, 0.16)}
      <rect x="${cx - 12}" y="200" width="24" height="220" rx="4" fill="${post}"/>
      <path d="${oct(cx + 6, 196, 146)}" fill="rgba(13,30,58,.14)"/>
      <path d="${oct(cx, 188, 146)}" fill="${fill}"/>
      <path d="${oct(cx, 188, 128)}" fill="none" stroke="${ring}" stroke-width="${ringW}"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <defs>${navyGrad('b05sBg', '#eaeef4', '#f7f5f1', 0, 1)}</defs>
      <rect width="${W}" height="${H}" fill="url(#b05sBg)"/>
      <path d="M0,330 H${W}" stroke="${P.mist2}" stroke-width="3"/>
      <path d="M0,392 H${W}" stroke="${P.rule}" stroke-width="2" stroke-dasharray="40 30"/>
      <circle cx="1210" cy="96" r="58" fill="${P.goldPale}" opacity=".8"/>
      ${sign(500, P.gold, P.navy, 6, P.navy3)}
      ${sign(880, P.navy, P.paper, 8, P.navy3)}
    </svg>`;
  }

  /* ---------- the four profile area screens share one builder ---------- */
  const AREAS = {
    cpp2: {
      row: 0, art: artBaseball, cols: [2, 3, 6], w: 1180,
      copy: {
        head: 'How You Tackle Problems',
        sub: 'Action',
        a1: 'Moves to Action', a2: 'Quick to act', a3: 'Instinct says: move on it now.',
        b1: 'Thinks It Through', b2: 'Slower to act', b3: 'Instinct says: think it over first, then act.',
        objBoth: '...is to put your two different problem-solving strengths to work and find the balance between them, so together you solve complex financial problems more effectively.',
        objRight: '...is to put your decisive strength to work, while making sure we fully understand how complex a problem is before we act on it.',
        objLeft: '...is to help you see the urgency of each problem and bring enough clarity that you can act with confidence.'
      },
      notes: 'Some people move straight to action. Others want to think it through first. Neither is wrong, and knowing which one you are changes how we work together.\n\n- Ask: When a money problem lands on your desk, what is your first instinct?\nPAUSE\n\n- Click a name below the chart to read the statements behind that score.'
    },
    cpp3: {
      row: 1, art: artGlasses, cols: [3, 4, 5], w: 980,
      copy: {
        head: 'How You Weigh Information',
        sub: 'Truth',
        a1: 'Trusts Readily', a2: 'Quick to trust', a3: 'Rarely double-checks.',
        b1: 'Verifies First', b2: 'Slow to trust', b3: 'Always checks the facts.',
        objBoth: '...is to help you find out what is really true about where you stand financially, and replace what you assume is true with what actually is.',
        objRight: '...is to help you confirm that what you believe about your current financial position is really so.',
        objLeft: '...is to give you the time to check the information, find what is true, and accept what we show you about your current position with greater confidence.'
      },
      notes: 'Two people can look at the same numbers and see two different pictures. One trusts quickly; one checks everything.\n\n- Ask: When someone shows you a financial number, do you take it at face value or want to see where it came from?\nPAUSE'
    },
    cpp4: {
      row: 2, art: artTrack, cols: [3, 4, 5], w: 980,
      copy: {
        head: 'How You Handle Change',
        sub: 'Pace',
        a1: 'Wants Predictability', a2: 'Slow to change', a3: 'Wants a plan they can count on.',
        b1: 'Changes Quickly', b2: 'Quick to change', b3: 'Likes to plan as they go.',
        objBoth: '...is to help you make changes when they are needed, so you can build a plan where what you both want to happen, can happen.',
        objRight: '...is to give you a detailed plan that names the changes your current plan needs, so that once they are made, the outcome you want becomes more predictable.',
        objLeft: '...is to encourage you to slow down just enough to talk through the changes your current plan needs to improve the outcome you want.'
      },
      notes: 'A relay is won or lost in the hand-off. Change works the same way: some people sprint into it, others want the next step mapped first.\n\n- Ask: When your plans have to change, do you adjust on the fly or want the new plan in writing first?\nPAUSE'
    },
    cpp5: {
      row: 3, art: artStops, cols: [3, 3, 5], w: 980,
      copy: {
        head: 'How You Carry Out a Plan',
        sub: 'Rules',
        a1: 'Follows the Rules', a2: 'Rules keep us safe', a3: 'Tends to follow the rules.',
        b1: 'Questions the Rules', b2: 'Rules get in the way', b3: 'Tends to question the rules.',
        stopA: 'STOP', stopB: 'STOP',
        objBoth: '...is to help you put the purpose of your plan into words, then identify the steps and the rules needed to put that plan into action.',
        objRight: '...is to answer your questions, firm up the purpose you want, and help you apply the rules that support carrying out your plan successfully.',
        objLeft: '...is to answer your questions, firm up your purpose, and focus only on the rules that are truly necessary to carry out your plan successfully.'
      },
      notes: 'Same rule, different form. Some people see rules as protection; others see them as something to question.\n\n- Ask: When a rule stands between you and a goal, do you follow it or ask why it is there?\nPAUSE'
    }
  };
  const shared = { objHead: 'The Objective', stmtLead: 'The statements that best describe', stmtTail: ':', stmtLeadShort: 'Best describes', bReturn: 'Return', chartEmpty: 'Choose one or two completed profiles on the gateway to plot them here.' };

  function tendencies(ctx, cols, w) {
    const cell = (r, c) => ctx.t(`${r}${c}`, { tag: 'div', cls: `b05-nt-c c${c}${r === 'b' ? ' r2' : ''}` });
    return `<div class="b05-nt b05-f" data-s="2" style="width:${w}px">${ctx.t('sub', { tag: 'h3' })}
        <div class="b05-nt-g" style="grid-template-columns:${cols.map((c) => c + 'fr').join(' ')}">${['a', 'b'].map((r) => [1, 2, 3].map((c) => cell(r, c)).join('')).join('')}</div>
      </div>`;
  }

  function openStatements(ctx, people, focus) {
    const host = ctx.$('.b05-p3');
    host.innerHTML = `<div class="b05-stmt">${statementsHTML(ctx, people, focus)}
        <button type="button" class="st-pill b05-btn" data-ret style="left:110px;top:780px">${ctx.t('bReturn')}</button></div>`;
    host.hidden = false; ctx.$('.b05-p2').hidden = true;
    ctx.on(host.querySelector('[data-ret]'), 'click', () => closeStatements(ctx));
    EFA.numify(host);
    if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
  }
  function closeStatements(ctx) {
    const host = ctx.$('.b05-p3'); if (!host || host.hidden) return;
    host.hidden = true; host.innerHTML = '';
    ctx.$('.b05-p2').hidden = ctx.step < 3;
  }

  function cppAreaScreen(id) {
    const a = AREAS[id];
    EFA.screen(id, {
      title: 'Profile area ' + (a.row + 1) + ': ' + a.copy.head,
      steps: 5,
      copy: Object.assign({}, chartCopy(), shared, a.copy, { _notes: a.notes }),
      render(ctx) {
        const people = selectedProfiles();
        ctx._people = people;
        const t = tallyRow(people, a.row);
        const objKey = t > 0 ? 'objRight' : t < 0 ? 'objLeft' : 'objBoth';
        const stops = id === 'cpp5' ? `<div class="b05-stop" style="left:${110 + 500}px;top:${140 + 188}px">${ctx.t('stopA', { attrs: 'style="font:700 70px/1 \'Cormorant Garamond\',Georgia,serif;color:#0d1e3a;letter-spacing:.04em"' })}</div>
            <div class="b05-stop" style="left:${110 + 880}px;top:${140 + 188}px">${ctx.t('stopB', { attrs: 'style="font:700 60px/1 \'DM Sans\',sans-serif;color:#fffdf8;letter-spacing:.08em"' })}</div>` : '';
        ctx.el.innerHTML = `
          <div class="b05-panel b05-p1">
            <div class="b05-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}</div>
            <div class="b05-photo b05-f" data-s="1">${a.art()}</div>
            <div class="b05-f" data-s="1">${stops}</div>
            ${tendencies(ctx, a.cols, a.w)}
          </div>
          <div class="b05-panel b05-p2" hidden>
            ${chartHTML(ctx, { rows: a.row + 1, hi: a.row, ticks: true, tags: true, people })}
            ${people.length ? '' : ctx.t('chartEmpty', { tag: 'div', cls: 'b05-chart-empty' })}
            <div class="b05-obj b05-f">${ctx.t('objHead', { tag: 'h3' })}${ctx.t(objKey, { tag: 'p' })}</div>
          </div>
          <div class="b05-panel b05-p3" hidden></div>`;
        ctx.on(ctx.$$('.b05-tag'), 'click', () => openStatements(ctx, people, 0));
      },
      step(ctx, n) {
        ctx.$('.b05-p1').hidden = n >= 3;
        if (n <= 3) closeStatements(ctx);
        if (ctx.$('.b05-p3').hidden) ctx.$('.b05-p2').hidden = n < 3;
        ctx.show('.b05-p1 [data-s="1"]', n >= 1); ctx.show('.b05-p1 [data-s="2"]', n >= 2);
        ctx.show('.b05-obj', n >= 4);
      }
    });
  }

  /* ---------- cpp1: the introduction ---------- */
  EFA.screen('cpp1', {
    title: 'Communication profile introduction',
    steps: 5,
    copy: Object.assign({}, chartCopy(), {
      head: 'Your Communication Profile',
      sub: 'Natural Tendencies',
      a1: 'Valuing differences', a2: 'Strengths', a3: 'Communication stays strong',
      b1: 'Judging differences', b2: 'Weakness', b3: 'Communication breaks down',
      head2: 'Let\'s Look at Your Strengths in Four Areas',
      objHead: 'The Objective',
      objBody: '...is to help you navigate these four areas as we look at where you stand financially today, so you get the most out of planning for the future you want.',
      _notes: 'Everyone communicates a little differently. When we value those differences they become strengths; when we judge them, communication breaks down.\n\n- Ask: Think of someone you work well with. What makes the conversation easy?\nPAUSE\n\n- Step through to the four areas we will look at together.'
    }),
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b05-panel b05-p1">
          <div class="b05-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}</div>
          <div class="b05-photo b05-f" data-s="1">${artPens()}</div>
          ${tendencies(ctx, [3, 2, 4], 940)}
        </div>
        <div class="b05-panel b05-p2" hidden>
          <div class="b05-head" style="top:34px">${ctx.t('head2', { tag: 'h2', cls: 'st-h2' })}</div>
          ${chartHTML(ctx, { rows: 0, hi: -1, ticks: false, tags: false, people: [] })}
          <div class="b05-obj b05-f">${ctx.t('objHead', { tag: 'h3' })}${ctx.t('objBody', { tag: 'p' })}</div>
        </div>`;
    },
    step(ctx, n) {
      ctx.$('.b05-p1').hidden = n >= 3; ctx.$('.b05-p2').hidden = n < 3;
      ctx.show('.b05-p1 [data-s="1"]', n >= 1); ctx.show('.b05-p1 [data-s="2"]', n >= 2);
      ctx.show('.b05-obj', n >= 4);
    }
  });
  ['cpp2', 'cpp3', 'cpp4', 'cpp5'].forEach(cppAreaScreen);

  /* ---------- gw1: the profile gateway (a working console for the consultant) ---------- */
  const GW = { sort: 'added', dir: 1, people: [], who: 0, ok: true, msg: 'ok' };
  const LINK_KEY = 'efa.b05.cpLink';
  const getLink = () => { try { return EFA.util.LS.get(LINK_KEY, '') || ''; } catch (e) { return ''; } };
  const setLink = (v) => { try { EFA.util.LS.set(LINK_KEY, v); } catch (e) { /* storage unavailable */ } };
  const showHidden = () => !!EFA.clients.get(CP_NS, 'showHidden', false);
  const newCode = () => { const c = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)]; return s; };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const clean = (t) => String(t || '').replace(/\|/g, '/').trim();
  function sampleProfiles() {
    const mk = (first, last, g, s, paras) => ({ id: 'p' + uid(), code: 'SAMPLE', date: today(), first, last, gender: g, email: '', status: 'Complete', hidden: false, resp: newCode(), fields: ['R' + Date.now().toString(36).toUpperCase(), ...s, ...paras].join('|'), isSelected: false, added: Date.now() });
    return [
      mk('Alex', 'Sample', 'M', [72, 38, 61, 30], [
        'Alex tends to move quickly once a decision is in front of him, and is most comfortable when a conversation leads to something concrete.',
        'Alex checks the facts before accepting them, and appreciates seeing the numbers behind a recommendation.',
        'Alex prefers a steady plan with few surprises, and likes knowing what comes next.',
        'Alex is willing to question how things have always been done when there may be a better way.']),
      mk('Jordan', 'Sample', 'F', [34, 68, 42, 66], [
        'Jordan likes to think a problem through before acting, and does best with time to reflect between conversations.',
        'Jordan tends to take people at their word and looks for the best in a situation.',
        'Jordan adapts quickly when circumstances change, and is comfortable adjusting a plan along the way.',
        'Jordan values clear procedures and feels most secure when the steps are spelled out.'])
    ];
  }

  EFA.screen('gw1', {
    title: 'Communication profile gateway',
    steps: 1,
    copy: Object.assign({}, chartCopy(), {
      title: 'Communication Profiles',
      statFile: 'on file', statDone: 'complete', statOk: 'Up to date', statFail: 'Could not save',
      hCode: 'Code', hDate: 'Date', hFirst: 'First Name', hLast: 'Last Name', hMF: 'M/F', hEmail: 'Email Address', hActions: 'Actions',
      tipEdit: 'Edit this person', tipInvite: 'Invitation details', tipResults: 'Enter profile results', tipResultsDone: 'Edit profile results', tipView: 'View the one-page summary', tipSelect: 'Select for the summary or presentation',
      hint: 'Tick one or two completed profiles, then choose 1 pg Summary or Presentation.',
      emptyHead: 'No profiles yet', emptyBody: 'Add each person with the plus button. When their questionnaire is complete, enter the results and tick the box at the end of the row.', emptySample: 'Add two sample profiles',
      bOptions: 'Options', bRefresh: 'Refresh', bPres: 'Presentation', bSummary: '1 pg Summary', bAddLabel: 'Assign a profile',
      dAddTitle: 'Assign a Profile', dEditTitle: 'Edit Profile', lFirst: 'First Name', lLast: 'Last Name', lGender: 'Gender', gM: 'Male', gF: 'Female', lEmail: 'Email Address', lCode: 'Group Code (optional)', lHidden: 'Hidden',
      bCancel: 'Cancel', bAssign: 'Assign Profile', bAssignEmail: 'Assign & Email', bSave: 'Save Changes', bOk: 'OK', bDelete: 'Remove', bDeleteSure: 'Remove for good',
      needFirst: 'Please enter a first name.', badEmail: 'Please check the email address.',
      pNoneTitle: 'Choose a Profile', pNone: 'Tick the box at the right end of a completed profile first.',
      pManyTitle: 'Two at Most', pMany: 'Two profiles is the most you can show together. Untick the extras and try again.',
      invTitle: 'Invitation Details', invHello: 'Hello', invBody: 'Before we meet, I would like to learn how you prefer to communicate and make decisions, so our time together fits the way you think. Please take a few minutes to complete the profile questionnaire.', invCode: 'Your response code:', invLink: 'Questionnaire:', invThanks: 'Thank you,', invSign: 'Edwards Financial & Associates', invTip: 'Select the text, copy it, and paste it into your own email.', invSelect: 'Select Text',
      rTitle: 'Profile Results', rFor: 'for', rLead: 'Enter the four scores from the completed questionnaire, from 0 to 100 (50 is neutral), and the statements that best describe this person.', rStatements: 'Statements', rStmtHint: 'Separate paragraphs with a blank line.', rSave: 'Save Results',
      oTitle: 'Options', oLink: 'Questionnaire link used in invitations', oHidden: 'Show hidden people', oSample: 'Add two sample profiles', oDone: 'Done',
      sumHead: 'Strengths Chart', stmtLead: 'The statements that best describe', stmtTail: ':', bReturn: 'Return', bPrint: 'Print', wsTitle: 'Communication Profile Summary', wsArea: 'Area', wsLeft: 'Leans toward', wsPos: 'Position', wsRight: 'Leans toward', wsPerson: 'Person', wsNeutral: 'Neutral', wsWait: 'The printable summary is still being set up.',
      _notes: 'Your working console for communication profiles. Add each person, enter their results when the questionnaire is complete, then tick one or two completed profiles.\n\n- 1 pg Summary shows the strengths chart right here; Presentation walks the client through the full profile.\n- Ask: How do the two of you usually make big decisions together?\nPAUSE'
    }),
    render(ctx) {
      const def = EFA.screens.gw1;
      if (EFA.player.step >= 1 && !GW.people.length) { EFA.player.step = 0; def.steps = 1; }
      ctx.el.innerHTML = `
        <div class="b05-panel b05-gw-list">
          <div class="b05-gw-top">${ctx.t('title', { tag: 'h1', cls: 'st-h1' })}<div class="b05-gw-stat"></div></div>
          <div class="b05-gw-grid"></div>
          <div class="b05-gw-foot">
            <div class="z"><button type="button" class="b05-plus" data-add aria-label="${esc(ctx.text('bAddLabel'))}">${ICO.plus}</button></div>
            <div class="z"><button type="button" class="st-pill b05-ghost" data-opt>${ctx.t('bOptions')}</button><button type="button" class="st-pill b05-ghost" data-ref>${ctx.t('bRefresh')}</button></div>
            <div class="z r"><button type="button" class="st-pill" data-pres>${ctx.t('bPres')}</button><button type="button" class="st-pill" data-sum style="background:#b8972e;border-color:#b8972e;color:#0d1e3a">${ctx.t('bSummary')}</button></div>
          </div>
        </div>
        <div class="b05-panel b05-gw-sum" hidden></div>`;
      gwDrawList(ctx);
      ctx.on(ctx.$('[data-add]'), 'click', () => gwPersonDialog(ctx, null));
      ctx.on(ctx.$('[data-opt]'), 'click', () => gwOptions(ctx));
      ctx.on(ctx.$('[data-ref]'), 'click', () => { GW.ok = true; GW.msg = 'ok'; gwDrawList(ctx); });
      ctx.on(ctx.$('[data-sum]'), 'click', () => { const ppl = gwValidate(ctx); if (!ppl) return; GW.people = ppl; GW.who = 0; def.steps = 3; ctx.goStep(1); });
      ctx.on(ctx.$('[data-pres]'), 'click', () => { if (!gwValidate(ctx)) return; ctx.jump('CPP', 'cpp1'); });
    },
    step(ctx, n) {
      const def = EFA.screens.gw1;
      const list = ctx.$('.b05-gw-list'), sum = ctx.$('.b05-gw-sum');
      if (n <= 0 || !GW.people.length) { def.steps = 1; list.hidden = false; sum.hidden = true; sum.innerHTML = ''; return; }
      def.steps = 3; list.hidden = true; sum.hidden = false;
      gwDrawSummary(ctx, n);
    },
    leave() {
      // keep summary mode across a re-render of this same screen; reset when the player moves elsewhere
      const e = EFA.player.pres && EFA.player.entry();
      if (!e || e.id !== 'gw1') { EFA.screens.gw1.steps = 1; GW.people = []; }
    }
  });

  function gwVisible() {
    const all = getRoster(), sh = showHidden();
    const rows = all.filter((r) => sh || !r.hidden);
    const k = GW.sort, d = GW.dir;
    const val = (r) => {
      if (k === 'date') { const m = String(r.date || '').split('/'); return m.length === 3 ? (+m[2]) * 10000 + (+m[0]) * 100 + (+m[1]) : 0; }
      if (k === 'added') return r.added || 0;
      return String(r[k] || '').toLowerCase();
    };
    rows.sort((a, b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * d; });
    return { all, rows };
  }

  function gwDrawList(ctx) {
    const { all, rows } = gwVisible();
    const done = all.filter(isDone).length;
    ctx.$('.b05-gw-stat').innerHTML = `<span class="b05-gw-dot ${GW.ok ? '' : 'bad'}"></span>
      <span class="t"><span class="a"><span class="num">${all.length}</span> ${ctx.t('statFile')} · <span class="num">${done}</span> ${ctx.t('statDone')}</span>
      <span class="b">${ctx.t(GW.ok ? 'statOk' : 'statFail')} <span class="num">${today()}</span></span></span>`;
    const grid = ctx.$('.b05-gw-grid');
    const th = (k, key) => `<th class="sort" data-sort="${k}">${ctx.t(key)}${GW.sort === k ? `<span class="ar">${GW.dir > 0 ? '&#9650;' : '&#9660;'}</span>` : ''}</th>`;
    if (!all.length || !rows.length) {
      grid.innerHTML = `<div class="b05-gw-empty" style="grid-row:1 / span 2">
          <svg viewBox="0 0 220 150" width="220" height="150" aria-hidden="true">
            ${shadowEl(110, 140, 90, 7, 0.1)}
            <rect x="34" y="18" width="152" height="112" rx="14" fill="${P.paper}" stroke="${P.navy}" stroke-width="4"/>
            <circle cx="76" cy="62" r="18" fill="${P.navy}"/><path d="M50 108c4-18 14-26 26-26s22 8 26 26" fill="${P.navy}"/>
            <circle cx="144" cy="62" r="18" fill="${P.gold}"/><path d="M118 108c4-18 14-26 26-26s22 8 26 26" fill="${P.gold}"/>
            <path d="M100 46h20" stroke="${P.goldLt}" stroke-width="4" stroke-linecap="round"/>
          </svg>
          ${ctx.t('emptyHead', { tag: 'h3' })}${ctx.t('emptyBody', { tag: 'p' })}
          <button type="button" class="st-pill b05-ghost" data-sample>${ctx.t('emptySample')}</button>
        </div>`;
      ctx.on(grid.querySelector('[data-sample]'), 'click', () => { saveRoster(getRoster().concat(sampleProfiles())); gwDrawList(ctx); });
      EFA.numify(grid); if (EFA.edit && EFA.edit.on) EFA.edit.arm(grid);
      return;
    }
    const ico = (act, id, icon, tip, extra) => `<button type="button" class="b05-ico ${extra || ''}" data-act="${act}" data-id="${esc(id)}" aria-label="${esc(ctx.text(tip))}">${icon}<span class="b05-tip">${ctx.t(tip)}</span></button>`;
    grid.innerHTML = `<div></div><div class="b05-gw-scroll" style="grid-row:1 / span 2"><table class="b05-gw-table">
        <thead><tr><th style="width:52px"></th>${th('code', 'hCode')}${th('date', 'hDate')}${th('first', 'hFirst')}${th('last', 'hLast')}${th('gender', 'hMF')}${th('email', 'hEmail')}<th style="width:190px">${ctx.t('hActions')}</th></tr></thead>
        <tbody>${rows.map((r) => {
          const fin = isDone(r);
          return `<tr class="${r.isSelected && fin ? 'sel' : ''} ${r.hidden ? 'hid' : ''}">
            <td>${ico('edit', r.id, ICO.edit, 'tipEdit')}</td>
            <td>${esc(r.code || '')}</td><td><span class="num">${esc(r.date || '')}</span></td><td>${esc(r.first || '')}</td><td>${esc(r.last || '')}</td>
            <td>${esc(r.gender || '')}</td><td class="em">${esc(r.email || '')}</td>
            <td><div class="b05-acts">
              ${r.email && !fin ? ico('invite', r.id, ICO.mail, 'tipInvite') : '<span></span>'}
              ${ico('results', r.id, ICO.results, fin ? 'tipResultsDone' : 'tipResults', fin ? 'gold' : '')}
              ${fin ? ico('view', r.id, ICO.view, 'tipView') : '<span></span>'}
              ${fin ? ico('select', r.id, r.isSelected ? ICO.boxOn : ICO.box, 'tipSelect', r.isSelected ? 'on' : '') : '<span></span>'}
            </div></td></tr>`;
        }).join('')}</tbody></table></div>${rows.length < 8 ? ctx.t('hint', { tag: 'div', cls: 'b05-gw-hint' }) : ''}`;
    ctx.on(Array.from(grid.querySelectorAll('[data-sort]')), 'click', (e, n) => {
      const k = n.dataset.sort; if (GW.sort === k) GW.dir = -GW.dir; else { GW.sort = k; GW.dir = 1; } gwDrawList(ctx);
    });
    ctx.on(Array.from(grid.querySelectorAll('[data-act]')), 'click', (e, n) => {
      const id = n.dataset.id, r = getRoster().find((x) => x.id === id); if (!r) return;
      const act = n.dataset.act;
      if (act === 'edit') gwPersonDialog(ctx, r);
      else if (act === 'invite') gwInvite(ctx, r);
      else if (act === 'results') gwResults(ctx, r);
      else if (act === 'view') { GW.people = [parseProfile(r)]; GW.who = 0; EFA.screens.gw1.steps = 3; ctx.goStep(1); }
      else if (act === 'select') {
        const list = getRoster(); const x = list.find((y) => y.id === id); x.isSelected = !x.isSelected;
        gwSave(ctx, list); gwDrawList(ctx);
      }
    });
    EFA.numify(grid); if (EFA.edit && EFA.edit.on) EFA.edit.arm(grid);
  }
  function gwSave(ctx, list) {
    try { saveRoster(list); GW.ok = true; GW.msg = 'ok'; } catch (e) { GW.ok = false; GW.msg = 'fail'; }
  }
  /** selected, completed profiles; shows the no-selection or too-many note and returns null when the choice will not work */
  function gwValidate(ctx) {
    const sel = getRoster().filter((r) => r.isSelected && isDone(r));
    if (!sel.length) { note(ctx, 'pNoneTitle', 'pNone'); return null; }
    if (sel.length > 2) { note(ctx, 'pManyTitle', 'pMany'); return null; }
    return sel.map(parseProfile);
  }

  function gwPersonDialog(ctx, rec) {
    const isNew = !rec; const r = rec || { gender: 'M' };
    const seg = (v, key) => `<button type="button" role="radio" class="st-seg-b" data-g="${v}" aria-checked="${(r.gender || 'M') === v}">${ctx.t(key)}</button>`;
    const fld = (k, key, val, type) => `<div class="fld">${ctx.t(key, { tag: 'label', cls: 'k' })}<input type="${type || 'text'}" class="b05-txt" data-f="${k}" value="${esc(val || '')}" autocomplete="off"></div>`;
    const ov = dialog(ctx, {
      title: ctx.t(isNew ? 'dAddTitle' : 'dEditTitle'), size: 'b05-md',
      html: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">${fld('first', 'lFirst', r.first)}${fld('last', 'lLast', r.last)}</div>
        <div class="fld">${ctx.t('lGender', { tag: 'label', cls: 'k' })}<div class="st-seg" role="radiogroup" style="justify-self:start">${seg('M', 'gM')}${seg('F', 'gF')}</div></div>
        ${fld('email', 'lEmail', r.email, 'email')}
        ${fld('code', 'lCode', r.code)}
        ${isNew ? '' : `<button type="button" class="b05-switch" data-hid role="switch" aria-checked="${!!r.hidden}"><i></i>${ctx.t('lHidden')}</button>`}
        <div class="b05-err"></div>
        <div class="row">
          ${isNew ? '' : `<button type="button" class="st-pill b05-ghost" data-del style="margin-right:auto">${ctx.t('bDelete')}</button>`}
          <button type="button" class="st-pill b05-ghost" data-cancel>${ctx.t('bCancel')}</button>
          ${isNew ? `<button type="button" class="st-pill" data-save="0">${ctx.t('bAssign')}</button><button type="button" class="st-pill" data-save="1" style="background:#b8972e;border-color:#b8972e;color:#0d1e3a">${ctx.t('bAssignEmail')}</button>` : `<button type="button" class="st-pill" data-save="0">${ctx.t('bSave')}</button>`}
        </div>`
    });
    let gender = r.gender || 'M', hidden = !!r.hidden;
    ov.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => { gender = b.dataset.g; ov.querySelectorAll('[data-g]').forEach((x) => x.setAttribute('aria-checked', x === b)); }));
    const hid = ov.querySelector('[data-hid]'); if (hid) hid.addEventListener('click', () => { hidden = !hidden; hid.setAttribute('aria-checked', hidden); });
    ov.querySelector('[data-cancel]').addEventListener('click', () => ov.close());
    const del = ov.querySelector('[data-del]');
    if (del) {
      let armed = false;
      del.addEventListener('click', () => {
        if (!armed) { armed = true; del.innerHTML = ctx.t('bDeleteSure'); return; }
        gwSave(ctx, getRoster().filter((x) => x.id !== r.id)); ov.close(); gwDrawList(ctx);
      });
    }
    const val = (k) => ov.querySelector(`[data-f="${k}"]`).value.trim();
    ov.querySelectorAll('[data-save]').forEach((b) => b.addEventListener('click', () => {
      const err = ov.querySelector('.b05-err'); ov.querySelectorAll('.b05-txt').forEach((x) => x.classList.remove('bad'));
      if (!val('first')) { ov.querySelector('[data-f="first"]').classList.add('bad'); err.innerHTML = ctx.t('needFirst'); return; }
      if (val('email') && !EMAIL_RE.test(val('email'))) { ov.querySelector('[data-f="email"]').classList.add('bad'); err.innerHTML = ctx.t('badEmail'); return; }
      const list = getRoster();
      let rec2;
      if (isNew) { rec2 = { id: 'p' + uid(), code: val('code'), date: '', first: val('first'), last: val('last'), gender, email: val('email'), status: 'Assigned', hidden: false, resp: newCode(), fields: '', isSelected: false, added: Date.now() }; list.push(rec2); }
      else { rec2 = list.find((x) => x.id === r.id); Object.assign(rec2, { code: val('code'), first: val('first'), last: val('last'), gender, email: val('email'), hidden }); }
      gwSave(ctx, list); ov.close(); gwDrawList(ctx);
      if (b.dataset.save === '1') gwInvite(ctx, rec2);
    }));
    const f = ov.querySelector('[data-f="first"]'); if (f) setTimeout(() => f.focus(), 30);
  }

  function gwInvite(ctx, r) {
    const link = getLink();
    const ov = dialog(ctx, {
      title: ctx.t('invTitle'), size: 'b05-md',
      html: `<div class="b05-inv" data-inv>
          <p>${ctx.t('invHello')} ${esc(r.first || '')},</p>
          ${ctx.t('invBody', { tag: 'p' })}
          <p>${ctx.t('invCode')} <b class="num">${esc(r.resp || '')}</b></p>
          ${link ? `<p>${ctx.t('invLink')} ${esc(link)}</p>` : ''}
          <p>${ctx.t('invThanks')}<br>${ctx.t('invSign')}</p>
        </div>
        ${ctx.t('invTip', { tag: 'p', attrs: 'style="font-size:16px;color:#667389"' })}
        <div class="row"><button type="button" class="st-pill b05-ghost" data-selall>${ctx.t('invSelect')}</button><button type="button" class="st-pill" data-ok>${ctx.t('bOk')}</button></div>`
    });
    ov.querySelector('[data-ok]').addEventListener('click', () => ov.close());
    ov.querySelector('[data-selall]').addEventListener('click', () => {
      const n = ov.querySelector('[data-inv]'); const rg = document.createRange(); rg.selectNodeContents(n);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(rg);
    });
  }

  function gwResults(ctx, r) {
    const p = parseProfile(r);
    const has = isDone(r);
    const rows = DIM.map((d, i) => `<div class="b05-res-row">
        <div>${ctx.t('c.t' + i, { tag: 'div', cls: 't' })}</div>
        <div><input type="range" min="0" max="100" step="1" value="${has ? p.scores[i] : 50}" data-rg="${i}">
          <div class="pl">${ctx.t('c.l' + i)}${ctx.t('c.r' + i)}</div></div>
        <input type="text" class="b05-txt" inputmode="numeric" data-sc="${i}" value="${has ? p.scores[i] : 50}">
      </div>`).join('');
    const ov = dialog(ctx, {
      title: `<span>${ctx.t('rTitle')} ${ctx.t('rFor')} ${esc(r.first || '')}</span>`, size: 'b05-md',
      html: `${ctx.t('rLead', { tag: 'p', attrs: 'style="font-size:17px;color:#667389"' })}<div>${rows}</div>
        <div class="fld">${ctx.t('rStatements', { tag: 'label', cls: 'k' })}<textarea class="b05-area" data-st>${esc(p.paras.join('\n\n'))}</textarea>${ctx.t('rStmtHint', { tag: 'span', attrs: 'style="font:500 14px/1.2 DM Sans,sans-serif;color:#667389"' })}</div>
        <div class="row"><button type="button" class="st-pill b05-ghost" data-cancel>${ctx.t('bCancel')}</button><button type="button" class="st-pill" data-save>${ctx.t('rSave')}</button></div>`
    });
    const clamp = (v) => Math.max(0, Math.min(100, Math.round(+String(v).replace(/[^0-9.]/g, '') || 0)));
    ov.querySelectorAll('[data-rg]').forEach((rg) => rg.addEventListener('input', () => { ov.querySelector(`[data-sc="${rg.dataset.rg}"]`).value = rg.value; }));
    ov.querySelectorAll('[data-sc]').forEach((tx) => {
      tx.addEventListener('focus', () => tx.select());
      tx.addEventListener('change', () => { const v = clamp(tx.value); tx.value = v; ov.querySelector(`[data-rg="${tx.dataset.sc}"]`).value = v; });
    });
    ov.querySelector('[data-cancel]').addEventListener('click', () => ov.close());
    ov.querySelector('[data-save]').addEventListener('click', () => {
      const sc = [0, 1, 2, 3].map((i) => clamp(ov.querySelector(`[data-sc="${i}"]`).value));
      const paras = ov.querySelector('[data-st]').value.split(/\n\s*\n/).map(clean).filter(Boolean);
      const list = getRoster(); const x = list.find((y) => y.id === r.id); if (!x) { ov.close(); return; }
      x.fields = [p.reportId || ('R' + Date.now().toString(36).toUpperCase()), ...sc, ...paras].join('|');
      x.status = 'Complete'; if (!x.date) x.date = today();
      gwSave(ctx, list); ov.close(); gwDrawList(ctx);
    });
  }

  function gwOptions(ctx) {
    const ov = dialog(ctx, {
      title: ctx.t('oTitle'),
      html: `<div class="fld">${ctx.t('oLink', { tag: 'label', cls: 'k' })}<input type="url" class="b05-txt" data-link value="${esc(getLink())}" autocomplete="off"></div>
        <button type="button" class="b05-switch" data-hid role="switch" aria-checked="${showHidden()}"><i></i>${ctx.t('oHidden')}</button>
        <div><button type="button" class="st-pill b05-ghost" data-sample>${ctx.t('oSample')}</button></div>
        <div class="row"><button type="button" class="st-pill" data-ok>${ctx.t('oDone')}</button></div>`,
      onClose: () => gwDrawList(ctx)
    });
    const inp = ov.querySelector('[data-link]');
    inp.addEventListener('change', () => setLink(inp.value.trim()));
    const hid = ov.querySelector('[data-hid]');
    hid.addEventListener('click', () => { const v = !showHidden(); EFA.clients.set(CP_NS, 'showHidden', v); hid.setAttribute('aria-checked', v); });
    ov.querySelector('[data-sample]').addEventListener('click', () => { saveRoster(getRoster().concat(sampleProfiles())); ov.close(); });
    ov.querySelector('[data-ok]').addEventListener('click', () => { setLink(inp.value.trim()); ov.close(); });
  }

  function gwDrawSummary(ctx, n) {
    const host = ctx.$('.b05-gw-sum'), ppl = GW.people;
    const btns = `<button type="button" class="st-pill b05-ghost b05-btn" data-ret style="left:110px;top:778px">${ctx.t('bReturn')}</button>
      <button type="button" class="st-pill b05-btn" data-print style="right:110px;top:778px;display:inline-flex;gap:10px"><span style="width:20px;height:20px;display:grid">${ICO.print}</span>${ctx.t('bPrint')}</button>`;
    if (n === 1) {
      host.innerHTML = `<div class="b05-gw-sumh">${ctx.t('sumHead', { tag: 'h2', cls: 'st-h2' })}</div>
        ${chartHTML(ctx, { rows: 4, hi: -1, ticks: true, tags: true, people: ppl, dy: 22 })}${btns}`;
      ctx.on(Array.from(host.querySelectorAll('.b05-tag')), 'click', (e, b) => { GW.who = +b.dataset.who; ctx.goStep(2); });
    } else {
      const p = ppl[GW.who] || ppl[0];
      host.innerHTML = `<div class="b05-stmt-one">
          <h2 class="st-h2">${ctx.t('stmtLead')} <span class="${ppl.length > 1 ? 'b05-who' : ''}" data-flip style="color:${GW.who ? '#8a6e22' : '#0d1e3a'}">${esc(p.first)}</span>${ctx.t('stmtTail')}</h2>
          <div class="b05-stmt-body" style="max-height:560px">${(p.paras.length ? p.paras : ['']).map((t) => `<p>${esc(t)}</p>`).join('')}</div>
        </div>${btns}`;
      if (ppl.length > 1) ctx.on(host.querySelector('[data-flip]'), 'click', () => { GW.who = GW.who ? 0 : 1; gwDrawSummary(ctx, 2); });
    }
    ctx.on(host.querySelector('[data-ret]'), 'click', () => ctx.goStep(0));
    ctx.on(host.querySelector('[data-print]'), 'click', () => gwPrint(ctx));
    EFA.numify(host); if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
  }

  /** the printable one-page summary goes through the shared worksheet (its Download saves a file) */
  function gwPrint(ctx) {
    const rows = [];
    GW.people.forEach((p) => DIM.forEach((d, i) => {
      const b = barRule(p.scores[i]);
      rows.push({ person: p.name, area: ctx.t('c.t' + i), left: ctx.t('c.l' + i), pos: b.side === 0 ? ctx.t('wsNeutral') : (b.side < 0 ? '< ' : '') + b.units + (b.side > 0 ? ' >' : ''), right: ctx.t('c.r' + i) });
    }));
    openWorksheet(ctx, {
      heading: ctx.t('wsTitle'), size: 'medium', filter: false, disclosures: [],
      columns: [{ field: 'person', header: ctx.t('wsPerson'), type: 'text' }, { field: 'area', header: ctx.t('wsArea'), type: 'text' }, { field: 'left', header: ctx.t('wsLeft'), type: 'text' }, { field: 'pos', header: ctx.t('wsPos'), type: 'text', align: 'center' }, { field: 'right', header: ctx.t('wsRight'), type: 'text' }],
      rows
    });
  }

  /** shared worksheet bridge (EFA.lib.worksheet); quiet notice if the component is missing */
  function openWorksheet(ctx, data) {
    const W = EFA.lib && EFA.lib.worksheet;
    if (W && typeof W.open === 'function') return W.open(ctx, data);
    ctx.toast(ctx.text('wsWait'));
    return null;
  }
  /** a Documentation link through the shared worksheet, or nothing when the component is missing */
  function docButton(ctx, dataFn, style, look) {
    const W = EFA.lib && EFA.lib.worksheet;
    if (W && typeof W.button === 'function') return W.button(ctx, { data: dataFn, style, look: look || 'link' });
    return '';
  }

  /* ---------- cpp6: the close ---------- */
  const dart = (size) => (EFA.lib && EFA.lib.bullets ? EFA.lib.bullets.dart({ size }) : `<span style="display:inline-block;width:${size}px"></span>`);
  EFA.screen('cpp6', {
    title: 'Communication profile close',
    copy: {
      quote: '“Nothing brings people together\nlike working toward\na result they both want.”',
      objHead: 'The Objective',
      objBody: '...is to help you communicate with each other\neven better, so together you can pursue\nthe outcome you both want.',
      _notes: 'Close on the shared goal. When two people want the same result, differences in style become an advantage.\n\n- Ask: What is the one outcome the two of you want most from this plan?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b05-c6">
          <div class="b05-c6-row">${dart(104)}<div class="b05-c6-card">${ctx.t('quote', { tag: 'p', cls: 'q' })}</div></div>
          <div class="b05-c6-row">${dart(104)}<div class="b05-c6-card">${ctx.t('objHead', { tag: 'h3' })}${ctx.t('objBody', { tag: 'p' })}</div></div>
        </div>`;
    }
  });

  /* ---------- disclosure1: the consultant's own compliance disclosure as a slide ---------- */
  EFA.screen('disclosure1', {
    title: 'Disclosure',
    copy: {
      head: 'Disclosure',
      firm: 'Edwards Financial & Associates',
      cred: 'Life & Annuities · Retirement Consulting · Estate Strategy',
      who: 'Joshua Edwards, Consultant',
      p1: 'This presentation is for education and discussion. It is not a solicitation to buy any product, and it is not personal financial, tax or legal advice.',
      p2: 'Insurance and annuity products are issued by licensed insurance companies. Features, costs, limitations and availability vary by company and by state, and the issuing company\'s contract and illustration govern.',
      p3: 'Any figures shown depend on the information you provided and on the assumptions noted. Please review them with us, and with your tax and legal professionals, before acting.',
      _notes: 'Our standing disclosure. Leave it on screen long enough for the client to read it.\n\n- Ask: Is there anything here you would like me to explain before we continue?\nPAUSE'
    },
    render(ctx) {
      const D = EFA.lib && EFA.lib.disclosure;
      const shared = D ? ['hypothetical', 'guarantees', 'tax', 'loans', 'notAdvice', 'past', 'license'].map((t) => D.html(t, { tag: 'p' })).join('') : '';
      ctx.el.innerHTML = `
        <div class="b05-head" style="top:40px">${ctx.t('head', { tag: 'h1', cls: 'st-h1 b05-disc-h' })}</div>
        <div class="b05-disc">
          <div class="b05-disc-id">${ctx.t('firm', { tag: 'div', cls: 'f' })}${ctx.t('cred', { tag: 'div', cls: 'c' })}${ctx.t('who', { tag: 'div', cls: 'w' })}</div>
          <div class="b05-disc-body">${ctx.t('p1', { tag: 'p' })}${ctx.t('p2', { tag: 'p' })}${shared}${ctx.t('p3', { tag: 'p' })}</div>
        </div>`;
    }
  });

  /* ======================================================================
     Dollar Cost Averaging (DCA): dca1..dca5
     ====================================================================== */
  /** bullet rows with text cards, revealed one per build step (row k shows at step >= at[k]) */
  function cardRows(ctx, keys, o) {
    return `<div class="b05-rows" style="${o.style || ''}">${keys.map((k, i) => `<div class="b05-brow b05-f" data-at="${o.at ? o.at[i] : i + 1}" style="--bw:${o.size || 72}px">${dart(o.size || 72)}<div class="b05-bcard ${o.cardCls || ''}">${typeof k === 'function' ? k() : ctx.t(k)}</div></div>`).join('')}</div>`;
  }
  const revealRows = (ctx, n) => ctx.$$('.b05-brow[data-at]').forEach((r) => r.classList.toggle('is-off', +r.dataset.at > n));

  EFA.screen('dca1', {
    title: 'Understanding dollar cost averaging',
    steps: 6,
    copy: {
      head: 'Understanding Dollar Cost Averaging',
      p1: 'A simple way to build savings and wealth, little by little, over many years.',
      p2: 'Your total investment is a series of regular purchases of one chosen investment.',
      p3: 'Purchases happen on a set schedule, no matter what the price is.',
      p4: 'It takes away the guesswork of timing one large lump-sum investment.',
      p5: 'It can help smooth out the short-term ups and downs of the stock market.',
      disc: 'Dollar cost averaging does not guarantee a profit or protect against loss in a declining market.',
      _notes: 'Dollar cost averaging is discipline made automatic: the same amount, on the same schedule, whatever the market is doing.\n\n- Ask: Have you ever waited for the "right time" to invest, and watched the moment pass?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b05-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}</div>
        ${cardRows(ctx, ['p1', 'p2', 'p3', 'p4', 'p5'], { size: 76, style: 'left:180px;width:1240px;top:168px;gap:24px' })}
        ${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer b05-foot-disc' })}`;
    },
    step(ctx, n) { revealRows(ctx, n); }
  });

  /* four illustrative unit-price patterns (periods 1..5), shared by dca2 and dca3 */
  const DCA_PRICES = [[8, 6, 4, 6, 8], [8, 6, 8, 6, 8], [6, 5, 7, 6, 8], [6, 7, 5, 6, 4]];
  const SERIES_COLORS = [P.navy, P.gold, P.steel, '#667389'];

  /** line chart in the house style. o: {w, h, pad, n, xLabels, series:[{values, color, on, key}], yMin, yMax, yStep, yFmt, xPad, every} */
  function chartSVG(o) {
    const w = o.w, h = o.h, pad = Object.assign({ l: 84, r: 22, t: 16, b: 44 }, o.pad || {});
    const n = o.n, xp = o.xPad == null ? 0.3 : o.xPad;
    const X = (i) => pad.l + ((i + xp) * (w - pad.l - pad.r)) / Math.max(1, n - 1 + 2 * xp);
    const Y = (v) => pad.t + (h - pad.t - pad.b) * (1 - (v - o.yMin) / (o.yMax - o.yMin));
    let g = '';
    for (let v = o.yMin; v <= o.yMax + 1e-9; v += o.yStep) {
      const y = r2(Y(v));
      g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="${v === o.yMin ? P.mist2 : '#e6e1d8'}" stroke-width="${v === o.yMin ? 2 : 1}"/>`;
      g += `<text x="${pad.l - 14}" y="${y + 6}" text-anchor="end" font-family="DM Sans, sans-serif" font-size="17" fill="#667389">${(o.yFmt || String)(v)}</text>`;
    }
    const every = o.every || 1;
    (o.xLabels || []).forEach((lb, i) => { if (i % every && i !== n - 1) return; g += `<text x="${r2(X(i))}" y="${h - pad.b + 30}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="17" fill="#667389">${lb}</text>`; });
    (o.series || []).forEach((s, si) => {
      if (s.on === false) return;
      const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${r2(X(i))},${r2(Y(v))}`).join('');
      g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 5}" stroke-linejoin="round" stroke-linecap="round"/>`;
      s.values.forEach((v, i) => {
        if (o.dots === false && i !== s.values.length - 1) return;
        g += `<circle cx="${r2(X(i))}" cy="${r2(Y(v))}" r="${o.dotR || 6.5}" fill="${s.color}" stroke="#fff" stroke-width="2.5"/>`;
        g += `<circle class="b05-hit" cx="${r2(X(i))}" cy="${r2(Y(v))}" r="16" fill="transparent" data-s="${si}" data-v="${v}" data-x="${r2(X(i))}" data-y="${r2(Y(v))}"/>`;
      });
    });
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="b05-chart" aria-hidden="true">${g}</svg>`;
  }
  /** axis money labels: $0, $5K, $10K when the scale reaches $10,000, else whole dollars */
  const kFmt = (max) => (v) => (max >= 10000 && v ? '$' + F.num(v / 1000, (v / 1000) % 1 ? 1 : 0) + 'K' : F.money(v));
  function niceScale(max, ticks) {
    if (!(max > 0)) return { max: 1, step: 0.2 };
    const raw = max / (ticks || 5), mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
    return { max: Math.ceil(max / step - 1e-9) * step, step };
  }
  /** hover tooltips on chart points: series name (copy key) in bold, then the value as currency */
  function chartTips(ctx, host, nameKeys) {
    const tip = document.createElement('div'); tip.className = 'b05-ctip'; tip.hidden = true; host.appendChild(tip);
    host.querySelectorAll('.b05-hit').forEach((c) => {
      c.addEventListener('mouseenter', () => {
        tip.innerHTML = `${ctx.t(nameKeys[+c.dataset.s], { tag: 'b' })}<span class="num">${F.money(+c.dataset.v, { dp: 2 })}</span>`;
        tip.style.left = c.dataset.x + 'px'; tip.style.top = c.dataset.y + 'px'; tip.hidden = false;
      });
      c.addEventListener('mouseleave', () => { tip.hidden = true; });
    });
  }

  EFA.screen('dca2', {
    title: 'Four market scenarios',
    steps: 4,
    copy: {
      head: 'Four Market Scenarios',
      m0: 'Recovery', m1: 'Variable', m2: 'Rising', m3: 'Falling',
      t0: 'A market that has dropped and is expected to climb back to where it started.',
      t1: 'A market whose price moves up and down.',
      t2: 'Prices may swing, but the overall direction is up.',
      t3: 'Prices may swing, but the overall direction is down.',
      yTitle: 'Unit Price Over Time', xTitle: 'Period',
      disc: 'Hypothetical unit prices for illustration only.',
      _notes: 'Four simple market patterns. We will run the same money through each one on the next screen.\n\n- Ask: Which of these feels most like the last few years to you?\nPAUSE'
    },
    render(ctx) {
      ctx._on = [true, false, false, false];
      ctx.el.innerHTML = `<div class="b05-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}</div>
        <div class="b05-chartbox" style="left:110px;top:170px;width:820px;height:560px">
          <div class="b05-plot" style="position:absolute;left:0;top:0"></div>
          ${ctx.t('yTitle', { tag: 'div', cls: 'b05-ytitle', attrs: 'style="left:-6px;top:240px"' })}
          ${ctx.t('xTitle', { tag: 'div', cls: 'b05-xtitle', attrs: 'style="left:458px;top:542px"' })}
        </div>
        <div class="b05-legend" style="left:194px;top:762px;width:720px">${[0, 1, 2, 3].map((i) => `<button type="button" class="b05-leg" data-leg="${i}"><i style="background:${SERIES_COLORS[i]}"></i>${ctx.t('m' + i)}</button>`).join('')}</div>
        ${cardRows(ctx, [0, 1, 2, 3].map((i) => () => `<b>${ctx.t('m' + i)}:</b> ${ctx.t('t' + i)}`), { size: 50, at: [0, 1, 2, 3], style: 'left:972px;width:518px;top:168px;gap:28px', cardCls: 'sm' })}
        ${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer b05-foot-disc', attrs: 'style="left:980px;right:auto;width:500px;text-align:left"' })}`;
      ctx.on(ctx.$$('[data-leg]'), 'click', (e, b) => { const i = +b.dataset.leg; ctx._on[i] = !ctx._on[i]; dca2Draw(ctx); });
    },
    step(ctx, n) {
      ctx._on = [0, 1, 2, 3].map((i) => i === n);
      revealRows(ctx, n);
      dca2Draw(ctx);
    }
  });
  function dca2Draw(ctx) {
    const host = ctx.$('.b05-plot');
    host.innerHTML = chartSVG({ w: 820, h: 560, pad: { l: 96, b: 70 }, n: 5, xLabels: [1, 2, 3, 4, 5], yMin: 0, yMax: 10, yStep: 2, yFmt: (v) => F.money(v), xPad: 0.3,
      series: DCA_PRICES.map((v, i) => ({ values: v, color: SERIES_COLORS[i], on: ctx._on[i], width: 6 })) });
    chartTips(ctx, host, ['m0', 'm1', 'm2', 'm3']);
    ctx.$$('[data-leg]').forEach((b) => b.classList.toggle('off', !ctx._on[+b.dataset.leg]));
    EFA.numify(host);
  }

  /** DCA versus lump sum for one price path (spec dca3): installment I = L / 5 bought each period */
  function dcaVsLump(prices, L) {
    const I = L / prices.length;
    let units = 0; const rows = [], dcaValue = [], lumpValue = [];
    const lumpUnits = L / prices[0];
    prices.forEach((p, t) => {
      const bought = I / p; units += bought;
      rows.push({ period: t + 1, invest: I, price: p, bought, total: units });
      dcaValue.push(units * p); lumpValue.push(lumpUnits * p);
    });
    const last = prices.length - 1;
    return { I, rows, dcaValue, lumpValue, dca: { avg: L / units, units, end: dcaValue[last], net: dcaValue[last] - L }, lump: { avg: prices[0], units: lumpUnits, end: lumpValue[last], net: lumpValue[last] - L } };
  }
  EFA.engines = EFA.engines || {};
  EFA.engines.dcaVsLump = dcaVsLump;
  const dcaState = { market: 0, lump: 10000 };

  EFA.screen('dca3', {
    title: 'Dollar cost averaging versus lump sum',
    copy: {
      head: 'Market Scenario Example',
      lMarket: 'Market Type', m0: 'Recovery', m1: 'Variable', m2: 'Rising', m3: 'Falling',
      lLump: 'Lump Sum Investment of:', vs: 'vs', lInst: '5 Regular Installments of:',
      results: 'Results', hDca: 'Dollar Cost Average', hLump: 'Lump Sum',
      rAvg: 'Avg. Unit Price', rUnits: 'Total Units Held', rEnd: 'Ending Value', rNet: 'Net Gain/Loss',
      tPeriod: 'Period', tInv: 'Investment', tPrice: 'Unit Price', tBought: 'Units Purchased', tTotal: 'Total Units Held',
      sDca: 'DCA Value', sLump: 'Lump Sum Value', yTitle: 'Account Balance',
      disc: 'Hypothetical example for education only, using illustrative unit prices. Taxes and fees are not included.',
      _notes: 'Same money, same market, two approaches. Watch the average price: buying on a schedule means more units when prices are low.\n\n- Switch the market type and ask: In which market does the steady buyer come out ahead?\nPAUSE'
    },
    render(ctx) {
      const opts = [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000];
      ctx.el.innerHTML = `<div class="b05-head" style="top:34px">${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:58px"' })}</div>
        <div class="b05-chartbox" style="left:110px;top:128px;width:920px;height:330px">
          <div class="b05-plot" style="position:absolute;left:0;top:0"></div>
          ${ctx.t('yTitle', { tag: 'div', cls: 'b05-ytitle', attrs: 'style="left:-14px;top:126px"' })}
          <div class="b05-legend in" style="left:110px;top:2px">${['sDca', 'sLump'].map((k, i) => `<span class="b05-leg static"><i style="background:${SERIES_COLORS[i]}"></i>${ctx.t(k)}</span>`).join('')}</div>
        </div>
        <div class="b05-tbl" style="left:110px;top:478px;width:920px"></div>
        <div class="st-card b05-side" style="left:1060px;top:128px;width:430px">
          <div class="b05-ctl">${ctx.t('lMarket', { tag: 'div', cls: 'lb' })}<div class="st-seg b05-seg4" role="radiogroup">${[0, 1, 2, 3].map((i) => `<button type="button" role="radio" class="st-seg-b" data-mk="${i}" aria-checked="${dcaState.market === i}">${ctx.t('m' + i)}</button>`).join('')}</div></div>
          <div class="b05-ctl">${ctx.t('lLump', { tag: 'div', cls: 'lb' })}<select class="b05-sel" data-lump>${opts.map((v) => `<option value="${v}" ${v === dcaState.lump ? 'selected' : ''}>${F.money(v)}</option>`).join('')}</select></div>
          ${ctx.t('vs', { tag: 'div', cls: 'b05-vs' })}
          <div class="b05-ctl">${ctx.t('lInst', { tag: 'div', cls: 'lb' })}<div class="b05-inst num" data-inst></div></div>
          <div class="b05-res">${ctx.t('results', { tag: 'div', cls: 'h' })}
            <div class="g hd"><span></span>${ctx.t('hDca', { tag: 'span' })}${ctx.t('hLump', { tag: 'span' })}</div>
            ${['rAvg', 'rUnits', 'rEnd', 'rNet'].map((k) => `<div class="g">${ctx.t(k, { tag: 'span', cls: 'k' })}<span class="num" data-r="${k}d"></span><span class="num" data-r="${k}l"></span></div>`).join('')}
          </div>
        </div>
        ${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer b05-foot-disc', attrs: 'style="left:110px;width:920px;text-align:left;top:812px;bottom:auto"' })}`;
      ctx.on(ctx.$$('[data-mk]'), 'click', (e, b) => { dcaState.market = +b.dataset.mk; ctx.$$('[data-mk]').forEach((x) => x.setAttribute('aria-checked', x === b)); dca3Draw(ctx); });
      ctx.on(ctx.$('[data-lump]'), 'change', (e, s) => { dcaState.lump = +s.value; dca3Draw(ctx); });
      dca3Draw(ctx);
    }
  });
  function dca3Draw(ctx) {
    const r = dcaVsLump(DCA_PRICES[dcaState.market], dcaState.lump);
    const sc = niceScale(Math.max(...r.dcaValue, ...r.lumpValue), 4);
    const host = ctx.$('.b05-plot');
    host.innerHTML = chartSVG({ w: 920, h: 330, pad: { l: 100, t: 40, b: 46 }, n: 5, xLabels: [1, 2, 3, 4, 5], yMin: 0, yMax: sc.max, yStep: sc.step, yFmt: kFmt(sc.max), xPad: 0.25,
      series: [{ values: r.dcaValue, color: SERIES_COLORS[0] }, { values: r.lumpValue, color: SERIES_COLORS[1] }] });
    chartTips(ctx, host, ['sDca', 'sLump']);
    const u = (v) => F.num(v, v % 1 ? 2 : 0);
    ctx.$('.b05-tbl').innerHTML = `<table class="st-table b05-dtable"><thead><tr>${['tPeriod', 'tInv', 'tPrice', 'tBought', 'tTotal'].map((k) => `<th>${ctx.t(k)}</th>`).join('')}</tr></thead>
      <tbody>${r.rows.map((x) => `<tr><td class="num">${x.period}</td><td class="num">${F.money(x.invest)}</td><td class="num">${F.money(x.price)}</td><td class="num">${u(x.bought)}</td><td class="num">${u(x.total)}</td></tr>`).join('')}</tbody></table>`;
    ctx.$('[data-inst]').textContent = F.money(r.I);
    const set = (k, v) => { const el = ctx.$(`[data-r="${k}"]`); el.textContent = v; el.classList.toggle('neg', /^-/.test(v)); };
    set('rAvgd', F.money(r.dca.avg, { dp: 2 })); set('rAvgl', F.money(r.lump.avg, { dp: 2 }));
    set('rUnitsd', F.num(r.dca.units, 2)); set('rUnitsl', F.num(r.lump.units, 2));
    set('rEndd', F.money(r.dca.end)); set('rEndl', F.money(r.lump.end));
    set('rNetd', F.money(r.dca.net)); set('rNetl', F.money(r.lump.net));
    EFA.numify(ctx.el);
  }

  /* ---------- dca4: real index history (monthly levels from EFA.data) ---------- */
  const IDX = [{ key: 'nasdaqMonthly', name: 'iNasdaq', code: 'sNasdaq' }, { key: 'sp500PriceMonthly', name: 'iSp', code: 'sSp' }];
  /** the monthly levels for one index from Jan 1987 on: [{label, ym, level}], or null when not loaded */
  function monthlyLevels(i) {
    const H = (EFA.data && EFA.data.history) || {};
    const d = H[IDX[i].key];
    const arr = Array.isArray(d) ? d : (d && Array.isArray(d.data) ? d.data : null);
    if (!arr || !arr.length) return null;
    const out = arr.filter((x) => Array.isArray(x) && String(x[0]) >= '1987-01' && isFinite(+x[1]) && +x[1] > 0)
      .map((x) => { const [y, m] = String(x[0]).split('-').map(Number); return { ym: x[0], y, m, level: +x[1], label: new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short' }) + ' ' + y }; });
    return out.length ? out : null;
  }
  /** spec dca4 back-test: invest `monthly` each month from s to e, results as of a (indexes into the month list) */
  function dcaHistory(levels, monthly, start, end, asOf) {
    const last = levels.length - 1;
    const s = Math.min(start, end), e = Math.max(start, end), a = Math.min(Math.max(asOf, s), last);
    let count = 0, totalInvested = 0, totalUnits = 0;
    const rows = [], chart = [];
    for (let r = 0; r <= a - s; r++) {
      const price = levels[s + r].level, invest = r <= e - s ? monthly : 0;
      if (invest > 0) count++;
      totalInvested += invest;
      const units = invest / price; totalUnits += units;
      const value = price * totalUnits, avgPrice = totalUnits > 0 ? totalInvested / totalUnits : 0;
      rows.push({ period: r + 1, label: levels[s + r].label, invest, price, units, totalUnits, value, basis: totalInvested, avgPrice, profit: value - totalInvested, year: Math.floor(r / 12) + 1 });
      if (r % 12 === 0) chart.push(value);
    }
    const z = rows[rows.length - 1];
    return { rows, chart, count, totalInvested, totalUnits, avgPrice: z ? z.avgPrice : 0, value: z ? z.value : 0, profit: z ? z.profit : 0 };
  }
  EFA.engines.dcaHistory = dcaHistory;
  const dca4State = { idx: 0, monthly: 100, start: 120, end: 240, asOf: null };

  EFA.screen('dca4', {
    title: 'Dollar cost averaging with market history',
    copy: {
      head: 'Historic Market Example',
      lType: 'Investment Type', iNasdaq: 'Nasdaq Composite', iSp: 'S&P 500 Index', sNasdaq: 'Nasdaq', sSp: 'S&P 500',
      lMonthly: 'Investment/month', lBegin: 'Investment Begins', lEnd: 'Investment Ends', lAsOf: 'Show results as of',
      results: 'Results', rCount: '# of Investments', rTotal: 'Total $ Invested', rUnits: 'Total Units Held', rAvg: 'Avg. Unit Price', rEnd: 'Ending Value', rNet: 'Net Gain/Loss',
      tPeriod: 'Period', tInv: 'Investment', tPrice: 'Unit Price', tBought: 'Units Purchased', tTotal: 'Total Units Held', tValue: 'Total Value',
      wsHead: 'Dollar Cost Averaging Example Results', wsMonth: 'Month', wsBasis: 'Total Investment Basis', wsAvg: 'Average Price', wsProfit: 'Profit / Loss', wsYear: 'Year',
      yTitle: 'Account Balance', xTitle: 'Investment Year',
      wait: 'Index history is being verified. This example opens as soon as those figures are loaded.',
      disc: 'Hypothetical example for education only, using index price levels without dividends. Taxes and fees are not included, and an index cannot be invested in directly.',
      _notes: 'Real history, real volatility. A steady monthly amount kept buying through the downturns.\n\n- Pick a start month just before a big decline and ask: Would you have kept investing every month through this?\nPAUSE'
    },
    render(ctx) {
      const levels = monthlyLevels(dca4State.idx);
      ctx._lv = levels;
      if (levels && dca4State.asOf == null) dca4State.asOf = levels.length - 1;
      const months = levels || [];
      const sel = (k, v) => `<select class="b05-sel" data-m="${k}" ${levels ? '' : 'disabled'}>${months.map((m, i) => `<option value="${i}" ${i === v ? 'selected' : ''}>${m.label}</option>`).join('')}</select>`;
      ctx.el.innerHTML = `<div class="b05-head" style="top:34px">${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:58px"' })}</div>
        <div class="b05-chartbox" style="left:110px;top:128px;width:920px;height:330px">
          <div class="b05-plot" style="position:absolute;left:0;top:0"></div>
          ${ctx.t('yTitle', { tag: 'div', cls: 'b05-ytitle', attrs: 'style="left:-14px;top:126px"' })}
          <div class="b05-legend in" style="left:110px;top:2px"><span class="b05-leg static"><i style="background:${P.navy}"></i>${ctx.t(IDX[dca4State.idx].code)}</span></div>
        </div>
        <div class="b05-tbl scroll" style="left:110px;top:478px;width:920px;height:318px"></div>
        <div class="st-card b05-side" style="left:1060px;top:128px;width:430px">
          <div class="b05-ctl">${ctx.t('lType', { tag: 'div', cls: 'lb' })}<div class="st-seg" role="radiogroup">${[0, 1].map((i) => `<button type="button" role="radio" class="st-seg-b" data-ix="${i}" aria-checked="${dca4State.idx === i}">${ctx.t(IDX[i].name)}</button>`).join('')}</div></div>
          <div class="b05-ctl row">${ctx.t('lMonthly', { tag: 'div', cls: 'lb' })}<input class="st-input b05-mon" data-monthly inputmode="decimal" autocomplete="off" value="${F.money(dca4State.monthly)}"></div>
          <div class="b05-ctl row">${ctx.t('lBegin', { tag: 'div', cls: 'lb' })}${sel('start', dca4State.start)}</div>
          <div class="b05-ctl row">${ctx.t('lEnd', { tag: 'div', cls: 'lb' })}${sel('end', dca4State.end)}</div>
          <div class="b05-ctl row">${ctx.t('lAsOf', { tag: 'div', cls: 'lb' })}${sel('asOf', dca4State.asOf)}</div>
          <div class="b05-res">${ctx.t('results', { tag: 'div', cls: 'h' })}
            ${['rCount', 'rTotal', 'rUnits', 'rAvg', 'rEnd', 'rNet'].map((k) => `<div class="g two">${ctx.t(k, { tag: 'span', cls: 'k' })}<span class="num" data-r="${k}"></span></div>`).join('')}
          </div>
          <div class="b05-doc">${levels ? docButton(ctx, () => dca4Sheet(ctx)) : ''}</div>
        </div>
        ${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer b05-foot-disc', attrs: 'style="left:110px;width:920px;text-align:left;top:812px;bottom:auto"' })}`;
      ctx.on(ctx.$$('[data-ix]'), 'click', (e, b) => {
        dca4State.idx = +b.dataset.ix; const lv = monthlyLevels(dca4State.idx);
        if (lv) { dca4State.asOf = Math.min(dca4State.asOf == null ? lv.length - 1 : dca4State.asOf, lv.length - 1); }
        EFA.player.renderScreen({ noFade: true });
      });
      const mi = ctx.$('[data-monthly]');
      mi.addEventListener('focus', () => { mi.value = String(dca4State.monthly); mi.select(); });
      mi.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') mi.blur(); });
      mi.addEventListener('blur', () => { const v = Math.abs(F.parse(mi.value)); if (isFinite(v)) dca4State.monthly = Math.round(v * 100) / 100; mi.value = F.money(dca4State.monthly); dca4Draw(ctx); });
      ctx.on(ctx.$$('[data-m]'), 'change', (e, s) => { dca4State[s.dataset.m] = +s.value; dca4Draw(ctx); });
      dca4Draw(ctx);
    }
  });
  function dca4Draw(ctx) {
    const lv = ctx._lv, host = ctx.$('.b05-plot');
    if (!lv) {
      host.innerHTML = `<div class="b05-wait" style="width:920px;height:668px">
          <div style="display:grid;gap:22px;justify-items:center">
            <svg viewBox="0 0 240 120" width="240" height="120" aria-hidden="true"><path d="M10,110 H230" stroke="${P.mist2}" stroke-width="4" stroke-linecap="round"/>
              <path d="M16,92 L52,70 L84,82 L120,44 L150,58 L186,26 L224,36" fill="none" stroke="${P.navy}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 14"/>
              <circle cx="224" cy="36" r="9" fill="${P.gold}"/></svg>
            ${ctx.t('wait', { tag: 'p' })}</div></div>`;
      ctx.$('.b05-tbl').hidden = true; ctx.$('.b05-ytitle').hidden = true; ctx.$('.b05-legend').hidden = true;
      ['rCount', 'rTotal', 'rUnits', 'rAvg', 'rEnd', 'rNet'].forEach((k) => { ctx.$(`[data-r="${k}"]`).textContent = '–'; });
      return;
    }
    const r = dcaHistory(lv, dca4State.monthly, dca4State.start, dca4State.end, dca4State.asOf);
    const sc = niceScale(Math.max(1, ...r.chart), 4);
    host.innerHTML = chartSVG({ w: 920, h: 330, pad: { l: 100, t: 40, b: 46 }, n: r.chart.length, xLabels: r.chart.map((_, i) => i + 1), every: Math.ceil(r.chart.length / 16), yMin: 0, yMax: sc.max, yStep: sc.step,
      yFmt: kFmt(sc.max), xPad: 0.3, dots: r.chart.length <= 24, dotR: 5, series: [{ values: r.chart, color: P.navy }] });
    chartTips(ctx, host, [IDX[dca4State.idx].code]);
    const p4 = (v) => F.num(v, v >= 1000 ? 2 : 4).replace(/(\.\d\d\d*?)0+$/, '$1');
    ctx.$('.b05-tbl').innerHTML = `<table class="st-table b05-dtable"><thead><tr>${['tPeriod', 'tInv', 'tPrice', 'tBought', 'tTotal', 'tValue'].map((k) => `<th>${ctx.t(k)}</th>`).join('')}</tr></thead>
      <tbody>${r.rows.map((x) => `<tr><td class="num">${x.period}</td><td class="num">${F.money(x.invest)}</td><td class="num">$${p4(x.price)}</td><td class="num">${F.num(x.units, 4).replace(/\.?0+$/, '')}</td><td class="num">${F.num(x.totalUnits, 2)}</td><td class="num">${F.money(x.value)}</td></tr>`).join('')}</tbody></table>`;
    const set = (k, v) => { const el = ctx.$(`[data-r="${k}"]`); el.textContent = v; el.classList.toggle('neg', /^-/.test(v)); };
    set('rCount', F.int(r.count)); set('rTotal', F.money(r.totalInvested)); set('rUnits', F.num(r.totalUnits, 2));
    set('rAvg', F.money(r.avgPrice, { dp: 2 })); set('rEnd', F.money(r.value)); set('rNet', F.money(r.profit));
    EFA.numify(ctx.el);
  }
  function dca4Sheet(ctx) {
    const lv = ctx._lv; if (!lv) return null;
    const r = dcaHistory(lv, dca4State.monthly, dca4State.start, dca4State.end, dca4State.asOf);
    return {
      heading: ctx.t('wsHead'), size: 'full', filter: 'period',
      columns: [
        { field: 'period', header: ctx.t('tPeriod'), type: 'int', align: 'center' }, { field: 'label', header: ctx.t('wsMonth'), type: 'text' },
        { field: 'invest', header: ctx.t('tInv'), type: 'money', dp: 2 }, { field: 'price', header: ctx.t('tPrice'), type: 'num', dp: 4 },
        { field: 'units', header: ctx.t('tBought'), type: 'num', dp: 4 }, { field: 'totalUnits', header: ctx.t('tTotal'), type: 'num', dp: 2 },
        { field: 'value', header: ctx.t('tValue'), type: 'money', dp: 2 }, { field: 'basis', header: ctx.t('wsBasis'), type: 'money', dp: 2 },
        { field: 'avgPrice', header: ctx.t('wsAvg'), type: 'num', dp: 4 }, { field: 'profit', header: ctx.t('wsProfit'), type: 'money', dp: 2 },
        { field: 'year', header: ctx.t('wsYear'), type: 'year' }
      ],
      rows: r.rows, disclosures: ['hypothetical', 'past', 'license']
    };
  }

  EFA.screen('dca5', {
    title: 'Dollar cost averaging key takeaways',
    steps: 5,
    copy: {
      head: 'Dollar Cost Averaging: Key Takeaways',
      p1: 'Regular purchases build wealth over time.',
      p2: 'No need to try to “time” the market.',
      p3: 'It may lower your average cost per unit.',
      p4: 'It offers the potential for better-than-average returns.',
      disc: 'Dollar cost averaging does not guarantee a profit or protect against loss in a declining market. Consider your ability to keep investing through periods of low prices.',
      _notes: 'Four takeaways. The real power is the habit: money that goes in automatically, month after month.\n\n- Ask: What amount could you invest every month without feeling it?\nPAUSE'
    },
    render(ctx) {
      const D = EFA.lib && EFA.lib.disclosure;
      ctx.el.innerHTML = `<div class="b05-head">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}</div>
        ${cardRows(ctx, ['p1', 'p2', 'p3', 'p4'], { size: 80, style: 'left:270px;width:1060px;top:214px;gap:34px' })}
        <div class="b05-foot-disc" style="display:grid;gap:4px">${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer', attrs: 'style="margin:0"' })}${D ? D.line(['past'], { style: 'margin:0' }) : ''}</div>`;
    },
    step(ctx, n) { revealRows(ctx, n); }
  });

  /* ======================================================================
     esc1: the economic squeeze on capital
     ====================================================================== */
  /** piggy bank with coin stacks and a coin dropping in (the saver) */
  function artSavings() {
    const coin = (x, y, w) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.32}" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="3"/>`;
    const stack = (x, n) => { let s = ''; for (let i = 0; i < n; i++) { const y = 452 - i * 17; s += `<path d="M${x - 42},${y} v-12 a42,13 0 0 0 84,0 v12 a42,13 0 0 1 -84,0z" fill="${P.goldLt}" stroke="${P.goldDeep}" stroke-width="3"/>${coin(x, y - 12, 42)}`; } return s; };
    return `<svg viewBox="0 0 500 500" aria-hidden="true">
      ${shadowEl(250, 470, 220, 18, 0.12)}
      ${stack(80, 5)}${stack(420, 7)}
      <g transform="translate(236,318)">
        <ellipse cx="0" cy="0" rx="150" ry="118" fill="${P.navy3}"/>
        <ellipse cx="-20" cy="-30" rx="96" ry="58" fill="${P.navy4}" opacity=".55"/>
        <rect x="-110" y="70" width="40" height="72" rx="16" fill="${P.navy3}"/><rect x="60" y="70" width="40" height="72" rx="16" fill="${P.navy3}"/>
        <rect x="-70" y="80" width="36" height="58" rx="14" fill="${P.navy2}"/><rect x="26" y="80" width="36" height="58" rx="14" fill="${P.navy2}"/>
        <ellipse cx="148" cy="10" rx="34" ry="42" fill="${P.navy4}"/><circle cx="142" cy="2" r="6" fill="${P.navy}"/><circle cx="158" cy="18" r="6" fill="${P.navy}"/>
        <path d="M-60,-104 l-30,-44 l52,22 z" fill="${P.navy3}"/>
        <circle cx="86" cy="-38" r="9" fill="${P.paper}"/><circle cx="88" cy="-36" r="4" fill="${P.navy}"/>
        <rect x="-44" y="-122" width="76" height="12" rx="6" fill="${P.navy}"/>
        <path d="M-150,0 c-30,-6 -40,20 -22,30" fill="none" stroke="${P.navy3}" stroke-width="10" stroke-linecap="round"/>
      </g>
      <g transform="translate(232,92)"><ellipse rx="34" ry="34" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="4"/><text y="13" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="36" fill="${P.navy}">$</text></g>
      <g stroke="${P.goldLt}" stroke-width="6" stroke-linecap="round"><path d="M188,64 v-26"/><path d="M276,64 v-26"/><path d="M232,40 v-26"/></g>
    </svg>`;
  }
  /** a C-clamp squeezing a word. horizontal: false = screw from the top (price), true = from the right (debt) */
  function artClamp(horizontal) {
    if (!horizontal) {
      return `<svg viewBox="0 0 360 360" aria-hidden="true">
        ${shadowEl(190, 340, 150, 12, 0.12)}
        <path d="M206,46 H70 Q40,46 40,76 V284 Q40,314 70,314 H206" fill="none" stroke="${P.navy}" stroke-width="38" stroke-linejoin="round"/>
        <path d="M206,46 H70 Q40,46 40,76 V284 Q40,314 70,314 H206" fill="none" stroke="${P.navy4}" stroke-width="8" opacity=".55" transform="translate(-8,-6)"/>
        <rect x="178" y="12" width="56" height="64" rx="10" fill="${P.navy}"/>
        <rect x="196" y="0" width="20" height="150" rx="6" fill="${P.goldLt}" stroke="${P.goldDeep}" stroke-width="3"/>
        <g stroke="${P.goldDeep}" stroke-width="3">${[86, 100, 114, 128].map((y) => `<path d="M196,${y} l20,8"/>`).join('')}</g>
        <rect x="132" y="-6" width="148" height="18" rx="9" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="3"/>
        <rect x="160" y="146" width="92" height="20" rx="6" fill="${P.navy}"/>
        <rect x="160" y="276" width="92" height="20" rx="6" fill="${P.navy}"/>
        <g stroke="${P.navy4}" stroke-width="5" stroke-linecap="round" opacity=".55"><path d="M120,150 l-18,-14"/><path d="M290,150 l18,-14"/><path d="M120,292 l-18,14"/><path d="M290,292 l18,14"/></g>
      </svg>`;
    }
    return `<svg viewBox="0 0 360 240" aria-hidden="true">
      ${shadowEl(180, 230, 150, 9, 0.12)}
      <path d="M262,40 H78 Q46,40 46,72 V176 Q46,208 78,208 H262" fill="none" stroke="${P.navy}" stroke-width="34" stroke-linejoin="round"/>
      <path d="M262,40 H78 Q46,40 46,72 V176 Q46,208 78,208 H262" fill="none" stroke="${P.navy4}" stroke-width="7" opacity=".55" transform="translate(-7,-5)"/>
      <rect x="208" y="8" width="56" height="56" rx="10" fill="${P.navy}"/>
      <rect x="226" y="-4" width="20" height="96" rx="6" fill="${P.goldLt}" stroke="${P.goldDeep}" stroke-width="3"/>
      <g stroke="${P.goldDeep}" stroke-width="3">${[66, 78].map((y) => `<path d="M226,${y} l20,7"/>`).join('')}</g>
      <rect x="168" y="-14" width="136" height="16" rx="8" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="3"/>
      <rect x="192" y="90" width="88" height="17" rx="6" fill="${P.navy}"/>
      <rect x="192" y="183" width="88" height="17" rx="6" fill="${P.navy}"/>
      <g stroke="${P.navy4}" stroke-width="5" stroke-linecap="round" opacity=".55"><path d="M150,96 l-16,-12"/><path d="M322,96 l16,-12"/><path d="M150,196 l-16,12"/><path d="M322,196 l16,12"/></g>
    </svg>`;
  }

  EFA.screen('esc1', {
    title: 'The economic squeeze on capital',
    steps: 8,
    copy: {
      head: 'The Economic Squeeze on Capital',
      s1: 'Outside Pressure: Inflation',
      p1: 'Inflation erodes your buying power by raising the price of everything you want to buy.',
      p2a: 'What cost', p2b: 'in', p2c: 'cost', p2d: 'in', p2e: '.', src: 'Source',
      s2: 'Inside Pressure: Consumer Debt',
      p3: 'Debt consumes buying power when finance charges are left to compound.',
      p4: 'It can snowball out of control quickly.',
      p5a: 'With no capital,', p5b: 'debt', p5c: 'becomes the only way to pay for large or unexpected expenses.',
      price: 'PRICE', debt: 'DEBT',
      srcTitle: 'Statistical Source', srcRetrieved: 'Retrieved', bOk: 'Ok',
      wait: 'figures being verified',
      _notes: 'Two forces squeeze savings. Inflation presses from the outside; consumer debt presses from the inside.\n\n- Ask: Which of the two have you felt more over the last few years?\nPAUSE\n\n- Click Source to show where the inflation figure comes from.'
    },
    render(ctx) {
      const H = (EFA.data && EFA.data.history) || {}, cpi = Array.isArray(H.cpiU) ? H.cpiU : null;
      const base = 1980, at = (y) => { const r = cpi && cpi.find((x) => x[0] === y); return r ? r[1] : null; };
      const lastYear = cpi ? cpi[cpi.length - 1][0] : null;
      const b0 = at(base), b1 = lastYear ? at(lastYear) : null;
      const later = b0 && b1 ? Math.round((b1 / b0) * 100) / 100 : null;
      ctx._cpi = { base, lastYear, later };
      const p2 = later != null
        ? `${ctx.t('p2a')} <span class="num">${F.money(1, { dp: 2 })}</span> ${ctx.t('p2b')} <span class="num">${base}</span> ${ctx.t('p2c')} <span class="num b05-gold">${F.money(later, { dp: 2 })}</span> ${ctx.t('p2d')} <span class="num">${lastYear}</span>${ctx.t('p2e')} <button type="button" class="b05-link b05-src" data-src>${ctx.t('src')}</button>`
        : `${ctx.t('p2a')} <span class="num">${F.money(1, { dp: 2 })}</span> ${ctx.t('p2b')} <span class="num">${base}</span> ${ctx.t('p2c')} ${ctx.t('wait', { tag: 'em' })}`;
      const row = (html, at, extra) => `<div class="b05-brow b05-f" data-at="${at}" style="--bw:72px">${dart(72)}<div class="b05-bcard esc ${extra || ''}">${html}</div></div>`;
      ctx.el.innerHTML = `<div class="b05-head" style="top:36px">${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:60px"' })}</div>
        <div class="b05-esc-col">
          ${ctx.t('s1', { tag: 'h2', cls: 'st-h3 b05-esc-h b05-f', attrs: 'data-at="1"' })}
          ${row(ctx.t('p1'), 2)}
          ${row(p2, 3)}
          ${ctx.t('s2', { tag: 'h2', cls: 'st-h3 b05-esc-h b05-f', attrs: 'data-at="4"' })}
          ${row(ctx.t('p3'), 5)}
          ${row(ctx.t('p4'), 6)}
          ${row(`${ctx.t('p5a')} ${ctx.t('p5b', { tag: 'u' })} ${ctx.t('p5c')}`, 7)}
        </div>
        <div class="b05-esc-img b05-sav">${artSavings()}</div>
        <div class="b05-esc-img b05-pclamp">${artClamp(false)}<div class="b05-word" style="left:206px;top:221px">${ctx.t('price')}</div></div>
        <div class="b05-esc-img b05-dclamp">${artClamp(true)}<div class="b05-word sm" style="left:236px;top:146px">${ctx.t('debt')}</div></div>`;
      ctx.on(ctx.$('[data-src]'), 'click', () => {
        if (ctx.step < 3) return;
        const s = (EFA.data && EFA.data.sources && EFA.data.sources['history.cpiU']) || {};
        const ov = dialog(ctx, {
          title: ctx.t('srcTitle'), size: 'b05-md',
          html: `<p style="font-weight:600">${esc(s.publisher || '')}</p><p>${esc(s.title || '')}</p>
            <p style="font-size:17px;color:#667389;word-break:break-all">${esc(s.url || '')}</p>
            <p style="font-size:17px;color:#667389">${ctx.t('srcRetrieved')} <span class="num">${esc(s.retrieved || '')}</span></p>
            <div class="row"><button type="button" class="st-pill" data-ok>${ctx.t('bOk')}</button></div>`
        });
        ov.querySelector('[data-ok]').addEventListener('click', () => ov.close());
      });
    },
    step(ctx, n) {
      ctx.$$('.b05-f[data-at]').forEach((r) => r.classList.toggle('is-off', +r.dataset.at > n));
      const sav = ctx.$('.b05-sav'), pc = ctx.$('.b05-pclamp'), dc = ctx.$('.b05-dclamp');
      const size = n >= 5 ? 239 : n >= 2 ? 358 : 597;
      sav.style.width = size + 'px'; sav.style.height = size + 'px';
      sav.style.right = n >= 7 ? '-358px' : '0px';
      sav.classList.toggle('gone', n >= 7);
      pc.style.top = n >= 2 ? '48px' : '-239px'; pc.classList.toggle('on', n >= 2);
      dc.style.right = n >= 7 ? '0px' : '1194px'; dc.classList.toggle('on', n >= 7);
      const src = ctx.$('[data-src]'); if (src) src.classList.toggle('dim', n < 3);
    }
  });

  /* ======================================================================
     de1: debt elimination calculator (snowball / avalanche with rollover)
     ====================================================================== */
  /**
   * Spec de1 "Calculate". rows: [{creditor, balance, rate (annual %, e.g. 18.99), payment, type: 'Credit'|'Loan'}]
   * opts: {strategy: 'snowball'|'avalanche', minPmts, additional}. Payments are the line-item payments
   * (see dePayments). Interest on the beginning balance, payment at month end, monthly compounding.
   */
  function debtElimination(rows, opts) {
    const R = rows.map((r, i) => ({ i, creditor: r.creditor, balance: r.balance, rate: r.rate, payment: r.payment, type: r.type, mr: r.rate / 100 / 12 }));
    const total = (opts.additional || 0) + R.reduce((s, r) => s + r.payment, 0);
    const L = R.slice().sort(opts.strategy === 'avalanche' ? (a, b) => (b.rate - a.rate) || (a.i - b.i) : (a, b) => (a.balance - b.balance) || (a.i - b.i));
    const minCredit = (r) => r.type === 'Credit' && opts.minPmts;
    L.forEach((r) => { r.cur = r.balance; r.plan = r.balance; r.dePayment = 0; r.extraStart = 999; r.payoff = 999; r.m1 = 0; });
    let maxPayoff = 0, p = 0;
    const months = [];
    do {
      p++;
      let requiredSum = 0;
      const m = { month: p, curPay: 0, curInt: 0, planPay: 0, planInt: 0, pays: [] };
      L.forEach((r) => {
        let b = r.cur, it = b * r.mr, req = minCredit(r) ? Math.max(10, 0.04 * b) : r.payment, pay = Math.min(b + it, req), e = b + it - pay;
        if (Math.abs(e) < 0.0049) e = 0;
        r.cur = e; m.curPay += pay; m.curInt += it;
        b = r.plan; it = b * r.mr; req = minCredit(r) ? Math.max(10, 0.04 * b) : r.payment; pay = Math.min(b + it, req); e = b + it - pay;
        if (Math.abs(e) < 0.0049) e = 0;
        if (pay > 0 && e === 0) { r.payoff = p; maxPayoff = Math.max(maxPayoff, p); }
        requiredSum += pay; r.plan = e; r._pay = pay; r._int = it;
      });
      let extra = Math.max(0, total - requiredSum);
      L.forEach((r) => {
        if (r.plan > 0 && extra > 0) {
          const x = Math.min(r.plan, extra);
          r._pay += x; r.plan -= x; extra -= x;
          r.extraStart = Math.min(r.extraStart, p);
          if (p === 1) r.m1 = r._pay;
          r.dePayment = r.extraStart === 1 ? r.m1 : Math.max(r.dePayment, r._pay);
          if (r.plan === 0) { r.payoff = p; maxPayoff = Math.max(maxPayoff, p); }
        }
        m.planPay += r._pay; m.planInt += r._int; m.pays.push(r._pay);
      });
      m.curBal = L.reduce((s, r) => s + r.cur, 0); m.planBal = L.reduce((s, r) => s + r.plan, 0);
      months.push(m);
    } while ((L.some((r) => r.cur > 0) || L.some((r) => r.plan > 0)) && p < 360);
    if (L.some((r) => r.plan > 0)) maxPayoff = 360;
    const curInterest = months.reduce((s, m) => s + m.curInt, 0), planInterest = months.reduce((s, m) => s + m.planInt, 0);
    // yearly rows (the intended rule: a final partial year when p is not a multiple of 12)
    const years = []; let acc = { curPay: 0, curInt: 0, planPay: 0, planInt: 0 };
    months.forEach((m, k) => {
      acc.curPay += m.curPay; acc.curInt += m.curInt; acc.planPay += m.planPay; acc.planInt += m.planInt;
      if ((k + 1) % 12 === 0) { years.push({ year: (k + 1) / 12, curPayments: acc.curPay, curInterest: acc.curInt, curBalance: m.curBal, planPayments: acc.planPay, planInterest: acc.planInt, planBalance: m.planBal }); acc = { curPay: 0, curInt: 0, planPay: 0, planInt: 0 }; }
    });
    if (p % 12) { const m = months[months.length - 1]; years.push({ year: Math.ceil(p / 12), curPayments: acc.curPay, curInterest: acc.curInt, curBalance: m.curBal, planPayments: acc.planPay, planInterest: acc.planInt, planBalance: m.planBal }); }
    const detail = L.map((r) => ({ creditor: r.creditor, balance: r.balance, rate: r.rate, payment: r.payment, planPayment: r.dePayment > 0 ? r.dePayment : r.payment, extraStart: r.extraStart, payoff: r.payoff }));
    return { total, order: L.map((r) => r.i), months, years, detail, maxPayoff, interestSaved: curInterest - planInterest, curInterest, planInterest, capped: maxPayoff === 360 };
  }
  /** spec de1 "line items": recompute dirty rows' payments; returns the total monthly outlay */
  function dePayments(rows, minPmts, additional) {
    let total = additional;
    rows.forEach((r) => {
      if (r.dirty) { if (r.type === 'Credit' && minPmts) r.payment = Math.max(10, Math.round(0.04 * r.balance * 100) / 100); r.dirty = false; }
      total += r.payment;
    });
    return total;
  }
  EFA.engines.debtElimination = debtElimination;
  EFA.engines.debtLineItems = dePayments;

  const DE = { rows: [], strategy: 'snowball', minPmts: true, additional: 0, result: null };
  /** spec number parsing: digits, "." and spaces only; round to dp when a "." is present; a leading "-" is negative */
  function deParse(t, dp) {
    const s = String(t == null ? '' : t).trim(), neg = /^(-|\$-|–|\$–)/.test(s);
    const d = s.replace(/[^0-9. ]/g, '').replace(/ /g, '');
    if (!d) return 0;
    let v = parseFloat(d); if (!isFinite(v)) return 0;
    if (d.indexOf('.') >= 0) v = Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp); else v = Math.round(v);
    return neg ? -v : v;
  }

  EFA.screen('de1', {
    title: 'Debt elimination calculator',
    copy: {
      head: 'Debt Elimination Calculator',
      lStrategy: 'Paydown Strategy', sSnow: 'Smallest Balance First', sAval: 'Highest Interest First',
      lMin: 'Make Minimum Payments', minTip: 'Credit card minimums are figured at 4% of the balance owed, never less than $10.',
      lAdd: 'Additional Amount',
      hCreditor: 'Creditor', hBalance: 'Balance', hRate: 'Interest Rate', hPayment: 'Payment', hType: 'Debt Type', tCredit: 'Credit', tLoan: 'Loan',
      newCreditor: 'Credit Card',
      bAdd: 'Add', bCalc: 'Calculate', bDoc: 'Documentation', bDel: 'Remove this debt',
      emptyHead: 'List every debt you are paying today', emptyBody: 'Add each one: who it is owed to, the balance, the interest rate and the monthly payment.',
      totalLead: 'Total monthly outlay',
      res1a: 'By paying', res1b: 'each month, you can be debt-free in', res2a: 'You would save', res2b: 'in interest.',
      capA: 'At', capB: 'a month, these debts would not be paid off within 30 years.',
      year: 'year', years: 'years', month: 'month', months: 'months', and: 'and', yrs30: '30+ years', dot: '.',
      delTitle: 'Remove a Debt', delBody: 'One debt is selected to be removed.', bYes: 'Yes', bNo: 'No',
      chooseTitle: 'Choose a Worksheet', ws1: 'Creditor Summary', ws2: 'Paydown Order', ws3: 'Current Payment Schedule', ws4: 'Elimination Plan Schedule', ws5: 'Plan Monthly Payments',
      wCreditor: 'Creditor', wBalance: 'Initial Balance', wRate: 'Interest Rate', wPayment: 'Monthly Payment', wPlan: 'Plan Payment', wDuration: 'Payoff Duration', wYear: 'Year', wPayments: 'Payments', wInterest: 'Interest', wBal: 'Balance', wMonth: 'Month', wPay: 'Payment', startMonth: 'starting month',
      bReport: 'Report', rptTitle: 'Debt Elimination Report', rptCreditors: 'Creditor Summary', rptOrder: 'Paydown Order', rptSched: 'Payment Schedule', rptCur: 'Current Strategy', rptPlan: 'Elimination Plan', rptMinNote: 'Minimum credit card payments are figured at 4% of the balance owed, never less than $10.', rptStart: 'Start', bSave: 'Save a Copy', rptDisc: 'Disclosure',
      disc: 'Hypothetical illustration. Payoff times and interest savings assume the rates and payments shown stay the same and no new charges are added.',
      wsWait: 'The worksheet is still being set up.',
      _notes: 'Most families pay every debt on its own schedule. The plan keeps the same total going out each month and rolls every freed-up dollar into one debt at a time.\n\n- Ask: If you kept paying what you pay today, but in a smarter order, how soon could you be debt-free?\nPAUSE\n\n- Enter every debt, then Calculate. Documentation shows the month-by-month math.'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b05-head" style="top:30px">${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:56px"' })}</div>
        <div class="st-card b05-de-set">
          <div class="b05-de-g">${ctx.t('lStrategy', { tag: 'span', cls: 'lb' })}<div class="st-seg b05-nowrap" role="radiogroup">${[['snowball', 'sSnow'], ['avalanche', 'sAval']].map(([v, k]) => `<button type="button" role="radio" class="st-seg-b" data-strat="${v}" aria-checked="${DE.strategy === v}">${ctx.t(k)}</button>`).join('')}</div></div>
          <div class="b05-de-g">${ctx.t('lMin', { tag: 'span', cls: 'lb' })}<div style="display:flex;align-items:center;gap:12px;height:48px"><button type="button" class="b05-switch" data-min role="switch" aria-checked="${DE.minPmts}"><i></i></button><span class="b05-help" tabindex="0">${ICO.info}<span class="b05-tip">${ctx.t('minTip')}</span></span></div></div>
          <div class="b05-de-g">${ctx.t('lAdd', { tag: 'span', cls: 'lb' })}<input class="st-input b05-de-add" data-add inputmode="decimal" autocomplete="off" value="${F.money(DE.additional)}"></div>
        </div>
        <div class="st-card b05-de-grid"><div class="b05-de-scroll"></div>
          <div class="b05-de-foot"><button type="button" class="st-pill b05-sub-pill" data-addrow><span style="width:18px;height:18px;display:grid;margin-right:8px">${ICO.plus}</span>${ctx.t('bAdd')}</button><div class="b05-de-tot"></div></div>
        </div>
        <div class="b05-de-out"></div>
        ${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer b05-foot-disc', attrs: 'style="bottom:66px"' })}`;
      ctx.on(ctx.$$('[data-strat]'), 'click', (e, b) => { DE.strategy = b.dataset.strat; ctx.$$('[data-strat]').forEach((x) => x.setAttribute('aria-checked', x === b)); deChanged(ctx); });
      ctx.on(ctx.$('[data-min]'), 'click', (e, b) => {
        DE.minPmts = !DE.minPmts; b.setAttribute('aria-checked', DE.minPmts);
        if (DE.minPmts) DE.rows.forEach((r) => { if (r.type === 'Credit') r.dirty = true; });
        deChanged(ctx); deDrawGrid(ctx);
      });
      const add = ctx.$('[data-add]');
      add.addEventListener('focus', () => { add.value = String(DE.additional); add.select(); });
      add.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter' || e.key === 'Tab') add.blur(); });
      add.addEventListener('blur', () => { DE.additional = Math.max(0, deParse(add.value, 0)); add.value = F.money(DE.additional); deChanged(ctx); });
      ctx.on(ctx.$('[data-addrow]'), 'click', () => {
        DE.rows.push({ id: uid(), creditor: ctx.text('newCreditor'), balance: 0, rate: 0, payment: 0, type: 'Credit', dirty: true });
        DE.result = null; deDrawGrid(ctx); deDrawOut(ctx);
        const last = ctx.$$('.b05-de-scroll tbody tr'); const inp = last.length && last[last.length - 1].querySelector('input'); if (inp) inp.focus();
      });
      deDrawGrid(ctx); deDrawOut(ctx);
    }
  });
  function deChanged(ctx) {
    DE.total = dePayments(DE.rows, DE.minPmts, DE.additional);
    DE.result = null; deDrawOut(ctx); deDrawTotal(ctx);
  }
  function deDrawTotal(ctx) {
    const t = ctx.$('.b05-de-tot'); if (!t) return;
    if (DE.total == null) DE.total = dePayments(DE.rows, DE.minPmts, DE.additional);
    t.innerHTML = DE.rows.length ? `${ctx.t('totalLead', { tag: 'span', cls: 'lb' })} <span class="num v">${F.money(DE.total)}</span>` : '';
  }
  function deDrawGrid(ctx) {
    const host = ctx.$('.b05-de-scroll');
    if (!DE.rows.length) {
      host.innerHTML = `<div class="b05-gw-empty" style="padding:24px">
          <svg viewBox="0 0 200 120" width="200" height="120" aria-hidden="true">${shadowEl(100, 112, 80, 6, 0.1)}
            <g transform="rotate(-8 90 60)"><rect x="34" y="22" width="120" height="76" rx="10" fill="${P.navy}"/><rect x="34" y="38" width="120" height="14" fill="${P.navy4}"/></g>
            <rect x="52" y="34" width="120" height="76" rx="10" fill="${P.gold}"/><rect x="66" y="54" width="24" height="18" rx="4" fill="${P.goldPale}"/>
            <path d="M66 92h60" stroke="${P.navy}" stroke-width="5" stroke-linecap="round" opacity=".55"/></svg>
          ${ctx.t('emptyHead', { tag: 'h3' })}${ctx.t('emptyBody', { tag: 'p' })}</div>`;
      deDrawTotal(ctx); EFA.numify(host); if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
      return;
    }
    const locked = (r) => DE.minPmts && r.type === 'Credit';
    host.innerHTML = `<table class="b05-gw-table b05-de-table"><thead><tr>
        <th>${ctx.t('hCreditor')}</th><th class="r">${ctx.t('hBalance')}</th><th class="r">${ctx.t('hRate')}</th><th class="r">${ctx.t('hPayment')}</th><th>${ctx.t('hType')}</th><th style="width:56px"></th></tr></thead>
      <tbody>${DE.rows.map((r) => `<tr data-row="${r.id}">
        <td><input class="b05-cell" data-k="creditor" value="${esc(r.creditor)}" autocomplete="off"></td>
        <td><input class="b05-cell r" data-k="balance" inputmode="decimal" value="${F.money(r.balance)}" autocomplete="off"></td>
        <td><input class="b05-cell r" data-k="rate" inputmode="decimal" value="${F.num(r.rate, 2)}%" autocomplete="off"></td>
        <td><input class="b05-cell r" data-k="payment" inputmode="decimal" value="${F.money(r.payment, { dp: r.payment % 1 ? 2 : 0 })}" autocomplete="off" ${locked(r) ? 'disabled' : ''}></td>
        <td><div class="st-seg b05-mini" role="radiogroup">${['Credit', 'Loan'].map((v) => `<button type="button" role="radio" class="st-seg-b" data-type="${v}" aria-checked="${r.type === v}">${ctx.t(v === 'Credit' ? 'tCredit' : 'tLoan')}</button>`).join('')}</div></td>
        <td><button type="button" class="b05-ico" data-del aria-label="${esc(ctx.text('bDel'))}">${ICO.trash}</button></td></tr>`).join('')}</tbody></table>`;
    host.querySelectorAll('tr[data-row]').forEach((tr) => {
      const r = DE.rows.find((x) => x.id === tr.dataset.row);
      tr.querySelectorAll('input[data-k]').forEach((inp) => {
        const k = inp.dataset.k;
        inp.addEventListener('focus', () => { if (k !== 'creditor') inp.value = String(r[k]); inp.select(); });
        inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
        inp.addEventListener('blur', () => {
          if (k === 'creditor') r.creditor = inp.value.trim();
          else r[k] = Math.abs(deParse(inp.value, k === 'rate' ? 2 : 0));
          r.dirty = true; deChanged(ctx);
          inp.value = k === 'creditor' ? r.creditor : k === 'rate' ? F.num(r.rate, 2) + '%' : F.money(r[k], { dp: r[k] % 1 ? 2 : 0 });
          const pay = tr.querySelector('[data-k="payment"]'); if (pay && k !== 'payment') pay.value = F.money(r.payment, { dp: r.payment % 1 ? 2 : 0 });
        });
      });
      tr.querySelectorAll('[data-type]').forEach((b) => b.addEventListener('click', () => {
        if (EFA.edit && EFA.edit.on) return;
        r.type = b.dataset.type; r.dirty = true; deChanged(ctx); deDrawGrid(ctx);
      }));
      tr.querySelector('[data-del]').addEventListener('click', () => {
        if (EFA.edit && EFA.edit.on) return;
        const ov = dialog(ctx, { title: ctx.t('delTitle'), html: `${ctx.t('delBody', { tag: 'p' })}<div class="row"><button type="button" class="st-pill b05-ghost" data-no>${ctx.t('bNo')}</button><button type="button" class="st-pill" data-yes>${ctx.t('bYes')}</button></div>` });
        ov.querySelector('[data-no]').addEventListener('click', () => ov.close());
        ov.querySelector('[data-yes]').addEventListener('click', () => { DE.rows = DE.rows.filter((x) => x !== r); ov.close(); deChanged(ctx); deDrawGrid(ctx); });
      });
    });
    deDrawTotal(ctx);
    EFA.numify(host); if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
  }
  /** "1 year and 3 months." / "30+ years." from words in copy */
  function deTime(ctx, mo) {
    const y = Math.floor(mo / 12), m = mo % 12;
    if (y >= 30) return `${ctx.t('yrs30')}${ctx.t('dot')}`;
    const parts = [];
    if (y > 0) parts.push(`<span class="num">${y}</span> ${ctx.t(y === 1 ? 'year' : 'years')}`);
    if (m > 0) parts.push(`<span class="num">${m}</span> ${ctx.t(m === 1 ? 'month' : 'months')}`);
    return parts.join(` ${ctx.t('and')} `) + ctx.t('dot');
  }
  function deDrawOut(ctx) {
    const host = ctx.$('.b05-de-out');
    if (!DE.result) {
      host.innerHTML = DE.rows.length ? `<button type="button" class="st-pill b05-de-calc" data-calc>${ctx.t('bCalc')}</button>` : '';
      ctx.on(host.querySelector('[data-calc]'), 'click', () => {
        DE.total = dePayments(DE.rows, DE.minPmts, DE.additional);
        DE.result = debtElimination(DE.rows, DE);
        // the grid shows the new order (spec: rows are sorted in place)
        DE.rows = DE.result.order.map((i) => DE.rows[i]);
        deDrawGrid(ctx); deDrawOut(ctx);
      });
      EFA.numify(host); return;
    }
    const r = DE.result;
    const line = r.capped
      ? `<p class="l1">${ctx.t('capA')} <span class="num">${F.money(r.total)}</span> ${ctx.t('capB')}</p>`
      : `<p class="l1">${ctx.t('res1a')} <span class="num">${F.money(r.total)}</span> ${ctx.t('res1b')} ${deTime(ctx, r.maxPayoff)}</p>
         <p class="l2">${ctx.t('res2a')} <span class="num gold">${F.money(r.interestSaved)}</span> ${ctx.t('res2b')}</p>`;
    host.innerHTML = `<div class="st-card b05-de-res"><button type="button" class="b05-link" data-doc style="justify-self:start">${ctx.t('bDoc')}</button>
        <div class="txt">${line}</div>
        <button type="button" class="b05-print" data-rpt aria-label="${esc(ctx.text('bReport'))}">${ICO.print}</button></div>`;
    ctx.on(host.querySelector('[data-doc]'), 'click', () => deChooser(ctx));
    ctx.on(host.querySelector('[data-rpt]'), 'click', () => deReport(ctx));
    EFA.numify(host); if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
  }
  function deSheets(ctx) {
    const r = DE.result; if (!r) return [];
    const money2 = (k, h) => ({ field: k, header: ctx.t(h), type: 'money', dp: 2 });
    const planCell = (d) => {
      if (d.extraStart === 999) return `<span>${F.money(d.planPayment, { dp: 2 })} ${ctx.t('startMonth')} <span class="num">1</span></span>`;
      return `<span>${F.money(d.planPayment, { dp: 2 })}${d.extraStart === 1 ? '+' : ''} ${ctx.t('startMonth')} <span class="num">${d.extraStart}</span></span>`;
    };
    const durCell = (d) => {
      if (d.payoff === 999) return d.balance === 0 ? `<span><span class="num">1</span> ${ctx.t('month')}</span>` : `<span>${ctx.t('yrs30')}</span>`;
      return `<span><span class="num">${d.payoff}</span> ${ctx.t(d.payoff === 1 ? 'month' : 'months')}</span>`;
    };
    const yearCols = [{ field: 'year', header: ctx.t('wYear'), type: 'year' }, money2('pay', 'wPayments'), money2('int', 'wInterest'), money2('bal', 'wBal')];
    const n = r.detail.length, size = n > 10 ? 'full' : n > 6 ? 'medium' : 'small';
    return [
      { key: 'ws1', data: { heading: ctx.t('ws1'), size: 'medium', filter: false, columns: [{ field: 'c', header: ctx.t('wCreditor'), type: 'text' }, money2('b', 'wBalance'), { field: 'r', header: ctx.t('wRate'), type: 'pct', dp: 2 }, money2('p', 'wPayment')], rows: r.detail.map((d) => ({ c: d.creditor, b: d.balance, r: d.rate / 100, p: d.payment })) } },
      { key: 'ws2', data: { heading: ctx.t('ws2'), size: 'medium', filter: false, columns: [{ field: 'c', header: ctx.t('wCreditor'), type: 'text' }, money2('b', 'wBalance'), { field: 'p', header: ctx.t('wPlan'), type: 'text', align: 'right' }, { field: 'd', header: ctx.t('wDuration'), type: 'text', align: 'right' }], rows: r.detail.map((d) => ({ c: d.creditor, b: d.balance, p: planCell(d), d: durCell(d) })) } },
      { key: 'ws3', data: { heading: ctx.t('ws3'), size: 'medium', columns: yearCols, rows: r.years.filter((y) => y.curPayments > 0 || y.curBalance > 0).map((y) => ({ year: y.year, pay: y.curPayments, int: y.curInterest, bal: y.curBalance })) } },
      { key: 'ws4', data: { heading: ctx.t('ws4'), size: 'medium', columns: yearCols, rows: r.years.filter((y) => y.planPayments > 0 || y.planBalance > 0).map((y) => ({ year: y.year, pay: y.planPayments, int: y.planInterest, bal: y.planBalance })) } },
      { key: 'ws5', data: { heading: ctx.t('ws5'), size, filter: 'month', columns: [{ field: 'month', header: ctx.t('wMonth'), type: 'int', align: 'center' }].concat(r.detail.map((d, i) => ({ field: 'p' + i, header: `<span>${esc(d.creditor)} ${ctx.t('wPay')}</span>`, type: 'money', dp: 2 }))),
        rows: r.months.slice(0, r.maxPayoff).map((m) => { const o = { month: m.month }; m.pays.forEach((v, i) => { o['p' + i] = v; }); return o; }) } }
    ];
  }
  function deChooser(ctx) {
    const sheets = deSheets(ctx);
    const ov = dialog(ctx, { title: ctx.t('chooseTitle'), html: `<div class="b05-choose">${sheets.map((s, i) => `<button type="button" class="b05-choice" data-ws="${i}"><span class="n num">${i + 1}</span>${ctx.t(s.key)}</button>`).join('')}</div>` });
    ov.querySelectorAll('[data-ws]').forEach((b) => b.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; ov.close(); openWorksheet(ctx, sheets[+b.dataset.ws].data); }));
  }
  /** the report: title, the result sentence, both tables and the payment schedule, then the disclosure */
  function deReport(ctx) {
    const r = DE.result; if (!r) return;
    const D = EFA.lib && EFA.lib.disclosure;
    const m2 = (v) => F.money(v, { dp: 2 });
    const sentence = r.capped ? `${ctx.t('capA')} ${m2(r.total)} ${ctx.t('capB')}`
      : `${ctx.t('res1a')} ${m2(r.total)} ${ctx.t('res1b')} ${deTime(ctx, r.maxPayoff)} ${ctx.t('res2a')} ${m2(r.interestSaved)} ${ctx.t('res2b')}`;
    const sheets = deSheets(ctx);
    const startBal = r.detail.reduce((s, d) => s + d.balance, 0);
    const html = `<div class="b05-rpt">
        <p class="s">${sentence}</p>
        <h3>${ctx.t('rptCreditors')}</h3>
        <table class="st-table"><thead><tr><th>${ctx.t('wCreditor')}</th><th>${ctx.t('wBalance')}</th><th>${ctx.t('wRate')}</th><th>${ctx.t('wPayment')}</th></tr></thead>
          <tbody>${r.detail.map((d) => `<tr><td>${esc(d.creditor)}</td><td class="num">${m2(d.balance)}</td><td class="num">${F.num(d.rate, 2)}%</td><td class="num">${m2(d.payment)}</td></tr>`).join('')}</tbody></table>
        ${DE.minPmts ? ctx.t('rptMinNote', { tag: 'p', cls: 'st-disclaimer' }) : ''}
        <h3>${ctx.t('rptOrder')}</h3>
        <table class="st-table"><thead><tr><th>${ctx.t('wCreditor')}</th><th>${ctx.t('wBalance')}</th><th>${ctx.t('wPlan')}</th><th>${ctx.t('wDuration')}</th></tr></thead>
          <tbody>${sheets[1].data.rows.map((x) => `<tr><td>${esc(x.c)}</td><td class="num">${m2(x.b)}</td><td>${x.p}</td><td>${x.d}</td></tr>`).join('')}</tbody></table>
        <h3>${ctx.t('rptSched')}</h3>
        <table class="st-table b05-rpt-sched"><thead><tr><th rowspan="2">${ctx.t('wYear')}</th><th colspan="3" class="grp">${ctx.t('rptCur')}</th><th colspan="3" class="grp">${ctx.t('rptPlan')}</th></tr>
          <tr><th>${ctx.t('wPayments')}</th><th>${ctx.t('wInterest')}</th><th>${ctx.t('wBal')}</th><th>${ctx.t('wPayments')}</th><th>${ctx.t('wInterest')}</th><th>${ctx.t('wBal')}</th></tr></thead>
          <tbody><tr><td>${ctx.t('rptStart')}</td><td></td><td></td><td class="num">${m2(startBal)}</td><td></td><td></td><td class="num">${m2(startBal)}</td></tr>
          ${r.years.map((y) => `<tr><td class="num">${y.year}</td><td class="num">${m2(y.curPayments)}</td><td class="num">${m2(y.curInterest)}</td><td class="num">${m2(y.curBalance)}</td><td class="num">${m2(y.planPayments)}</td><td class="num">${m2(y.planInterest)}</td><td class="num">${m2(y.planBalance)}</td></tr>`).join('')}</tbody></table>
        <h3>${ctx.t('rptDisc')}</h3>
        ${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer' })}${D ? D.line(['hypothetical', 'notAdvice', 'license']) : ''}
      </div>`;
    const ov = ctx.overlay({ title: `<span>${ctx.t('rptTitle')}</span>`, html, wide: false });
    const dl = EFA.platform && EFA.platform.downloads;
    if (dl) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'st-pill b05-sub-pill'; b.style.marginLeft = 'auto'; b.style.marginRight = '14px'; b.innerHTML = ctx.t('bSave');
      const hdr = ov.querySelector('.st-overlay-h'); hdr.insertBefore(b, hdr.querySelector('.st-overlay-x'));
      b.addEventListener('click', () => {
        const body = ov.querySelector('.b05-rpt').cloneNode(true);
        const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(ctx.text('rptTitle'))}</title><style>body{font:14px/1.5 "DM Sans",Arial,sans-serif;color:#0d1e3a;max-width:760px;margin:32px auto;padding:0 20px}h1{font:600 28px Georgia,serif}h3{font:700 13px Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8a6e22;margin:22px 0 8px}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}th{background:#0d1e3a;color:#f7f5f1;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:6px 8px;text-align:right}td{padding:5px 8px;border-bottom:1px solid #e3e8f0;text-align:right}th:first-child,td:first-child{text-align:left}.st-disclaimer{font-size:12px;color:#667389}@media print{body{margin:0}}</style></head><body><h1>${esc(ctx.text('rptTitle'))}</h1>${body.innerHTML}</body></html>`;
        Promise.resolve().then(() => dl.save({ filename: 'debt-elimination-report.html', data: doc })).catch(() => {});
      });
    }
  }

  /* ======================================================================
     disprot1: disability coverage comparison (current vs. alternative)
     ====================================================================== */
  /** spec disprot1. v: {age, benefitAge, curBenefit, altBenefit, curCola, altCola (percent numbers), curElim, altElim (months), curPrem, altPrem, oppRate (percent)} */
  function disabilityCompare(v) {
    const months = Math.max(0, 12 * (v.benefitAge - v.age)), n = Math.max(0, v.benefitAge - v.age), r = v.oppRate / 100;
    const side = (B0, cola, E) => {
      let B = B0, total = 0, cum = 0; const rows = [];
      for (let s = 1; s <= months; s++) {
        if (s > 1 && s % 12 === 1) B = B * (1 + cola / 100);
        const paid = s > E ? B : 0; total += paid; cum += paid;
        rows.push({ paid, cum });
      }
      return { total, rows };
    };
    const cur = side(v.curBenefit, v.curCola, v.curElim), alt = side(v.altBenefit, v.altCola, v.altElim);
    const pct = (pot, prem, ben) => (pot > 0 ? prem / (12 * ben) : 0);
    const diff = v.curPrem - v.altPrem;
    const fv = r === 0 ? diff * n : diff * (1 + r) * (Math.pow(1 + r, n) - 1) / r;
    const sched = []; for (let s = 1; s <= months; s++) sched.push({ month: s, cur: cur.rows[s - 1].paid, curCum: cur.rows[s - 1].cum, alt: alt.rows[s - 1].paid, altCum: alt.rows[s - 1].cum, year: Math.floor((s - 1) / 12) + 1 });
    const prem = []; let end = 0;
    for (let i = 0; i < n; i++) {
      const begin = end + diff, interest = begin * r; end = begin + interest;
      prem.push({ age: v.age + i, cur: v.curPrem, curCum: v.curPrem * (i + 1), alt: v.altPrem, altCum: v.altPrem * (i + 1), diff, begin, interest, end, year: i + 1 });
    }
    return { months, n, curTotal: cur.total, altTotal: alt.total, curPct: pct(cur.total, v.curPrem, v.curBenefit), altPct: pct(alt.total, v.altPrem, v.altBenefit), diff, fv, sched, prem };
  }
  EFA.engines.disabilityCompare = disabilityCompare;

  const DP_DEF = { age: 42, income: 102000, benefitAge: 65, curBenefit: 4000, altBenefit: 3000, curCola: 3, altCola: 3, curElim: 3, altElim: 6, curPrem: 3000, altPrem: 2000, oppRate: 5 };
  const DP_ROWS = [
    { label: 'lAge', l: 'age', r: 'age', type: 'int' }, { label: 'lIncome', l: 'income', r: 'income', type: 'money' },
    { label: 'lUntil', l: 'benefitAge', r: 'benefitAge', type: 'int' }, { label: 'lBenefit', l: 'curBenefit', r: 'altBenefit', type: 'money' },
    { label: 'lCola', l: 'curCola', r: 'altCola', type: 'pct' }, { label: 'lElim', l: 'curElim', r: 'altElim', type: 'elim' },
    { label: 'lPrem', l: 'curPrem', r: 'altPrem', type: 'money' }, { label: 'lOpp', l: 'oppRate', r: 'oppRate', type: 'pct' }
  ];
  const ELIM = [[1, 30, 'eDays'], [2, 60, 'eDays'], [3, 90, 'eDays'], [6, 180, 'eDays'], [12, 360, 'eDays'], [24, 2, 'eYears']];
  const dpCopy = {
    tabCur: 'Current', tabAlt: 'Alternative',
    lAge: 'Current Age', lIncome: 'Current Income', lUntil: 'Benefits Paid Until Age', lBenefit: 'Monthly Benefits', lCola: 'COLA %', lElim: 'Elimination Period', lPrem: 'Annual Premium', lOpp: 'Opportunity Cost %',
    eDays: 'days', eYears: 'years',
    rPot: 'Potential Benefit', rPct: 'Premium as a % of Benefit', bCalc: 'Calculate',
    s1a: 'The difference in annual premiums is', s1b: '.', s2a: 'Set aside each year at', s2b: 'until age', s2c: ', that difference could grow to', s2d: '.',
    bChecklist: 'Checklist', bCompare: 'Compare', bDoc: 'Documentation',
    ckTitle: 'Disability Income Insurance Checklist',
    ck1: 'How much monthly income would you need to cover your expenses if you could not work?',
    ck2: 'Review every disability policy you have in force today.',
    ck3: 'What group or employer disability benefits do you have?',
    ck4: 'What is the most each policy would pay each month, and for how long?',
    ck5: 'Has the policy\'s definition of disability been explained to you in plain words?',
    ck6: 'Can your group coverage be converted to an individual policy if you leave your employer?',
    ck7: 'How do your short-term and long-term benefits work together?',
    ck8: 'How would your benefits coordinate with government disability benefits and workers\' compensation?',
    ck9: 'Does the policy include rehabilitation benefits to help you return to work?',
    ck10: 'Can the coverage convert to long-term care protection, or be renewed after age 65?',
    ck11: 'Do you need individual coverage in addition to what you already have?',
    ck12: 'What waiting (elimination) periods apply to your existing policies?',
    ck13: 'What benefit levels and benefit periods do your existing policies provide?',
    ck14: 'Do your policies include a cost-of-living adjustment rider?',
    ck15: 'What do you pay in premiums today, and what would the alternative cost?',
    ck16: 'Compare each policy\'s definition of disability: your own occupation, or any occupation?',
    ck17: 'Do other benefits reduce (offset) what a policy pays?',
    ck18: 'Is the policy guaranteed renewable, and does it include a future purchase option?',
    ck19: 'What are the financial strength ratings of each insurer?',
    ck20: 'Is there an inflation rider, and how does it work?',
    ck21: 'Write down each recommendation made to you, and the reason for it.',
    ckD1: 'This checklist illustrates general principles only. It is not a solicitation to buy any product and is not individual advice; please work with a licensed professional before making decisions.',
    ckD2: 'This is not tax or legal advice. Please talk with a qualified tax or legal professional about your own situation.',
    ckD3: 'Any results shown are hypothetical, are not guaranteed, and depend on the information you provide.',
    chooseTitle: 'Choose a Worksheet', ws1: 'Schedule of Benefits', ws2: 'Premiums at Interest',
    ws1Head: 'Monthly Benefits With Cost-of-Living Adjustment', ws2Head: 'Difference in Annual Premiums at Interest',
    wMonth: 'Month', wCurBen: 'Current Monthly Benefit', wCurCum: 'Current Cumulative', wAltBen: 'Alternative Monthly Benefit', wAltCum: 'Alternative Cumulative', wYear: 'Year',
    wAge: 'Age', wCurPrem: 'Current Annual Premium', wAltPrem: 'Alternative Annual Premium', wDiff: 'Difference', wBegin: 'Beginning Balance', wInt: 'Interest', wEnd: 'Ending Balance',
    disc: 'Illustrative comparison only. Actual benefits depend on each policy\'s definitions, offsets for other benefits, taxation of benefits and riders. Growth of the premium difference is hypothetical and not guaranteed.',
    wsWait: 'The worksheet is still being set up.',
    _notes: 'Two policies side by side. Look past the premium: what each could actually pay if a disability started today, and what the premium difference could become if it were set aside.\n\n- Ask: If your paycheck stopped tomorrow, how many months could you keep your household running?\nPAUSE\n\n- Calculate reveals one result at a time; Compare reveals them all.'
  };

  /** a dropdown whose labels are editable copy (option text cannot hold copy, so this is a small custom list) */
  function elimLabel(ctx, months) { const e = ELIM.find((x) => x[0] === months) || ELIM[2]; return `<span class="num">${e[1]}</span> ${ctx.t(e[2])}`; }

  EFA.screen('disprot1', {
    title: 'Disability coverage comparison',
    copy: dpCopy,
    render(ctx) {
      const get = (k) => ctx.mem(k, DP_DEF[k]);
      ctx._shown = ctx._shown || {};
      const fmtV = (type, v) => (type === 'money' ? F.money(v) : type === 'pct' ? F.num(v, v % 1 ? 2 : 0) + '%' : F.int(v));
      const box = (key, type) => type === 'elim'
        ? `<div class="b05-dd" data-dd="${key}"><button type="button" class="b05-dd-b">${elimLabel(ctx, get(key))}<span class="car">&#9662;</span></button>
            <div class="b05-dd-list" hidden>${ELIM.map((e) => `<button type="button" data-v="${e[0]}" class="${e[0] === get(key) ? 'on' : ''}"><span class="num">${e[1]}</span> ${ctx.t(e[2])}</button>`).join('')}</div></div>`
        : `<input class="st-input b05-dp-in" data-dp="${key}" data-type="${type}" inputmode="decimal" autocomplete="off" value="${fmtV(type, get(key))}">`;
      ctx.el.innerHTML = `
        <div class="b05-dp-tabs">${ctx.t('tabCur', { tag: 'div', cls: 'tab l' })}${ctx.t('tabAlt', { tag: 'div', cls: 'tab r' })}</div>
        <div class="st-card b05-dp-main">${DP_ROWS.map((r) => `<div class="b05-dp-row${r.l === r.r ? ' shared' : ''}">${box(r.l, r.type)}${ctx.t(r.label, { tag: 'div', cls: 'lab' })}${box(r.r, r.type)}</div>`).join('')}</div>
        <div class="st-card b05-dp-res">
          <div class="b05-dp-row res"><div class="cell" data-cell="curPot"></div>${ctx.t('rPot', { tag: 'div', cls: 'lab' })}<div class="cell" data-cell="altPot"></div></div>
          <div class="b05-dp-row res"><div class="cell" data-cell="curPct"></div>${ctx.t('rPct', { tag: 'div', cls: 'lab' })}<div class="cell" data-cell="altPct"></div></div>
          <div class="b05-dp-sum"></div>
        </div>
        <div class="b05-dp-links"><button type="button" class="b05-link" data-ck>${ctx.t('bChecklist')}</button>
          <button type="button" class="st-pill" data-cmp style="min-width:180px;background:#b8972e;border-color:#b8972e;color:#0d1e3a">${ctx.t('bCompare')}</button>
          <button type="button" class="b05-link" data-doc>${ctx.t('bDoc')}</button></div>`;
      const values = () => { const o = {}; Object.keys(DP_DEF).forEach((k) => { o[k] = get(k); }); return o; };
      ctx._dpValues = values;
      ctx.$$('.b05-dp-in').forEach((inp) => {
        const k = inp.dataset.dp, type = inp.dataset.type;
        inp.addEventListener('focus', () => { inp.value = String(get(k)); inp.select(); });
        inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter' || e.key === 'Tab') inp.blur(); });
        inp.addEventListener('blur', () => {
          let v = Math.abs(deParse(inp.value, 2));
          if (type === 'int') v = Math.round(v); if (type === 'money') v = Math.round(v);
          ctx.remember(k, v);
          ctx.$$(`[data-dp="${k}"]`).forEach((x) => { if (x !== document.activeElement) x.value = fmtV(type, v); });
          dpDraw(ctx);
        });
      });
      ctx.$$('.b05-dd').forEach((dd) => {
        const k = dd.dataset.dd, list = dd.querySelector('.b05-dd-list');
        dd.querySelector('.b05-dd-b').addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; const open = list.hidden; ctx.$$('.b05-dd-list').forEach((l) => { l.hidden = true; }); list.hidden = !open; });
        list.querySelectorAll('[data-v]').forEach((o) => o.addEventListener('click', () => {
          if (EFA.edit && EFA.edit.on) return;
          ctx.remember(k, +o.dataset.v); list.hidden = true;
          dd.querySelector('.b05-dd-b').innerHTML = `${elimLabel(ctx, +o.dataset.v)}<span class="car">&#9662;</span>`;
          list.querySelectorAll('[data-v]').forEach((x) => x.classList.toggle('on', x === o));
          EFA.numify(dd); dpDraw(ctx);
        }));
      });
      ctx.on(ctx.$('[data-cmp]'), 'click', () => { ['curPot', 'altPot', 'curPct', 'altPct', 'sum'].forEach((k) => { ctx._shown[k] = true; }); dpDraw(ctx); });
      ctx.on(ctx.$('[data-ck]'), 'click', () => dpChecklist(ctx));
      ctx.on(ctx.$('[data-doc]'), 'click', () => dpChooser(ctx));
      dpDraw(ctx);
    }
  });
  function dpDraw(ctx) {
    const r = disabilityCompare(ctx._dpValues());
    const val = { curPot: F.money(r.curTotal, { dp: 2 }), altPot: F.money(r.altTotal, { dp: 2 }), curPct: F.num(r.curPct * 100, 2) + '%', altPct: F.num(r.altPct * 100, 2) + '%' };
    Object.keys(val).forEach((k) => {
      const c = ctx.$(`[data-cell="${k}"]`);
      c.innerHTML = ctx._shown[k] ? `<span class="v num">${val[k]}</span>` : `<button type="button" class="st-pill b05-sub-pill b05-ghost" data-reveal="${k}">${ctx.t('bCalc')}</button>`;
      const b = c.querySelector('[data-reveal]'); if (b) ctx.on(b, 'click', () => { ctx._shown[k] = true; dpDraw(ctx); });
    });
    const v = ctx._dpValues();
    ctx.$('.b05-dp-sum').innerHTML = ctx._shown.sum
      ? `<p>${ctx.t('s1a')} <span class="num b">${F.money(r.diff)}</span>${ctx.t('s1b')}</p>
         <p>${ctx.t('s2a')} <span class="num">${F.num(v.oppRate, v.oppRate % 1 ? 2 : 0)}%</span> ${ctx.t('s2b')} <span class="num">${v.benefitAge}</span>${ctx.t('s2c')} <span class="num b gold">${F.money(r.fv)}</span>${ctx.t('s2d')}</p>
         ${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer' })}`
      : ctx.t('disc', { tag: 'p', cls: 'st-disclaimer' });
    EFA.numify(ctx.el); if (EFA.edit && EFA.edit.on) EFA.edit.arm(ctx.el);
  }
  function dpChecklist(ctx) {
    const items = []; for (let i = 1; i <= 21; i++) items.push(`<li>${ctx.t('ck' + i)}</li>`);
    const ov = ctx.overlay({ title: `<span>${ctx.t('ckTitle')}</span>`, wide: true, html: `<ol class="b05-ck">${items.join('')}</ol><div class="b05-ck-d">${ctx.t('ckD1', { tag: 'p' })}${ctx.t('ckD2', { tag: 'p' })}${ctx.t('ckD3', { tag: 'p' })}</div>` });
    return ov;
  }
  function dpSheets(ctx) {
    const r = disabilityCompare(ctx._dpValues());
    const m2 = (f, h) => ({ field: f, header: ctx.t(h), type: 'money', dp: 2 });
    return [
      { key: 'ws1', data: { heading: ctx.t('ws1Head'), size: 'full', filter: 'year', columns: [{ field: 'month', header: ctx.t('wMonth'), type: 'int', align: 'center' }, m2('cur', 'wCurBen'), m2('curCum', 'wCurCum'), m2('alt', 'wAltBen'), m2('altCum', 'wAltCum'), { field: 'year', header: ctx.t('wYear'), type: 'year' }], rows: r.sched } },
      { key: 'ws2', data: { heading: ctx.t('ws2Head'), size: 'full', columns: [{ field: 'age', header: ctx.t('wAge'), type: 'age' }, m2('cur', 'wCurPrem'), m2('curCum', 'wCurCum'), m2('alt', 'wAltPrem'), m2('altCum', 'wAltCum'), m2('diff', 'wDiff'), m2('begin', 'wBegin'), m2('interest', 'wInt'), m2('end', 'wEnd'), { field: 'year', header: ctx.t('wYear'), type: 'year' }], rows: r.prem, highlight: 'end' } }
    ];
  }
  function dpChooser(ctx) {
    const sheets = dpSheets(ctx);
    const ov = dialog(ctx, { title: ctx.t('chooseTitle'), html: `<div class="b05-choose">${sheets.map((s, i) => `<button type="button" class="b05-choice" data-ws="${i}"><span class="n num">${i + 1}</span>${ctx.t(s.key)}</button>`).join('')}</div>` });
    ov.querySelectorAll('[data-ws]').forEach((b) => b.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; ov.close(); openWorksheet(ctx, sheets[+b.dataset.ws].data); }));
  }

  /* ======================================================================
     Distribution Solution: ds1 (assumptions) and ds2 (spendable income by account type)
     ====================================================================== */
  const DS_KEYS = { age: 'case_file_current_age', retAge: 'case_file_retirement_age', projAge: 'case_file_project_to_age', termYears: 'term_years_of_coverage', termFace: 'term_face_value' };
  const TERM_LIST_KEY = 'case_file_term_premium_list';
  const CD = () => (EFA.lib && EFA.lib.caseData) || { get: (k, d) => EFA.clients.get('case', k, d), set: (k, v) => EFA.clients.set('case', k, v), field: (ctx, o) => ctx.field(Object.assign({}, o, { id: o.id || o.key })) };
  /** a list of whole-dollar amounts sized to n: missing entries copy the previous one (spec ds1 "Lists on open") */
  function sizeList(list, n, def) {
    const out = (Array.isArray(list) ? list : []).map((x) => Math.round(+(x && typeof x === 'object' ? x.amount : x) || 0)).slice(0, Math.max(n, 0));
    if (!out.length && n > 0) out.push(def);
    while (out.length < n) out.push(out[out.length - 1]);
    return out;
  }
  const defList = () => Array.from({ length: 20 }, () => 400);
  /** every value ds2 reads, from the same per-client memory ds1 writes */
  function dsValues() {
    const cd = CD(), m = (k, d) => EFA.clients.get('ds1', 'f.' + k, d), mm = (k, d) => EFA.clients.get('ds1', k, d);
    const age = cd.get(DS_KEYS.age, 42), retAge = cd.get(DS_KEYS.retAge, 65), projAge = cd.get(DS_KEYS.projAge, 84);
    const termYears = cd.get(DS_KEYS.termYears, 20);
    return {
      A: age, R: Math.max(retAge, age + 1), T: Math.max(projAge, retAge), p: m('contrib', 5000), ybyOn: !!mm('ybyOn', false),
      contribList: sizeList(mm('contribList', defList()), Math.max(0, retAge - age), 400), m: m('income', 75000), Le: m('infl', 0), r: m('ror', 0.08),
      o: m('pctOrd', 0.6), g: m('pctCG', 0.4), M: m('taxOrd', 0.35), D: m('taxCG', 0.15), G: m('retOrd', 0.35), H: m('retCG', 0.15),
      termOn: !!mm('termOn', false), termList: sizeList(cd.get(TERM_LIST_KEY, null) || defList(), termYears, 400)
    };
  }
  /**
   * Spec ds2: year-by-year after-tax spendable income from a taxable, a tax-deferred and a tax-favored account.
   * Contributions and withdrawals at the beginning of the year, growth on the beginning balance, annual compounding.
   * Parity: with term insurance on, the tax-deferred account is charged the premium (t) in addition to the reduced
   * contribution and the larger withdrawal, as the original did (flagged for Joshua; term defaults off).
   */
  function distribution(v, flatten) {
    const N = Math.max(0, v.T - v.A), W0 = v.R - v.A;
    const tx = { bal: 0, basis: 0, gains: 0, cum: 0 }, td = { bal: 0, basis: 0, def: 0, cum: 0 };
    const rows = [], wsT = [], wsD = [];
    for (let y = 0; y < N; y++) {
      const retired = y >= W0;
      const jList = v.termOn && y < v.termList.length ? v.termList[y] : 0;
      let j = jList, c = 0, termWork = 0;
      if (!retired) { c = v.ybyOn ? (v.contribList[y] || 0) : v.p; if (c >= j) { c -= j; termWork = j; } else { termWork = c; j = c; c = 0; } }
      const need = (v.Le === 0 ? v.m : v.m * Math.pow(1 + v.Le, y - W0)) + j;
      // taxable account
      const rO = retired ? v.G : v.M, rC = retired ? v.H : v.D;
      let w = 0;
      if (retired) {
        if (flatten) { const k = v.r * v.o * (1 - v.G) + v.r * v.g; w = tx.bal * k / (1 + k); }
        else w = need <= tx.basis ? need : tx.basis + (need - tx.basis) / (1 - v.H);
        w = Math.min(w, tx.bal);
      }
      const startBal = tx.bal, boy = tx.bal + c - w, ordG = boy * v.r * v.o, taxG = ordG * rO, cgG = boy * v.r * v.g, eoy = boy + ordG + cgG - taxG;
      const basisOut = Math.min(w, tx.basis), gainsOut = w - basisOut;
      tx.basis = tx.basis + c + ordG - taxG - basisOut; tx.gains = tx.gains + cgG - gainsOut;
      const taxWD = gainsOut * rC; let spend = w - taxWD, termT = termWork;
      if (spend >= j) { spend -= j; termT = retired ? j : termWork; } else if (retired) { termT = spend; spend = 0; }
      const annualT = taxG + taxWD; tx.cum += annualT; tx.bal = eoy;
      wsT.push({ age: v.A + y, contrib: c, wd: w, term: termT, boy, ordG, taxG, cgG, eoy, basisOut, gainsOut, basis: tx.basis, gains: tx.gains, taxGain: taxWD, taxWD, spend, annual: annualT, cum: tx.cum, year: y + 1, startBal });
      // tax-deferred account
      const rate = retired ? v.G : v.M;
      let w2 = 0;
      if (retired) {
        if (flatten) w2 = td.bal * v.r / (1 + v.r);
        else { const gross = need / (1 - v.G); w2 = gross <= td.def ? gross : td.def + (need - td.def * (1 - v.G)); }
        w2 = Math.min(w2, td.bal);
      }
      let t = 0, j2 = j;
      if (v.termOn && y < v.termList.length) {
        j2 = v.termList[y];
        if (j2 <= c) t = j2;
        else if (w2 + j2 <= td.def) t = j2 / (1 - rate);
        else if (w2 === td.bal) t = 0;
        else t = Math.min(j2, Math.max(0, td.bal - w2));
      }
      const boy2 = td.bal + c - w2 - t, growth = boy2 * v.r, eoy2 = boy2 + growth;
      const bOut = w2 < td.def ? 0 : w2 - td.def;
      td.def = td.def + growth - w2 + bOut; td.basis = td.basis + c - bOut;
      const taxWD2 = (w2 - bOut) * rate; let spend2 = w2 - taxWD2;
      if (spend2 >= j2) spend2 -= j2; else if (retired) spend2 = 0;
      td.cum += taxWD2; td.bal = eoy2;
      wsD.push({ age: v.A + y, contrib: c, wd: w2, term: t, boy: boy2, growth, eoy: eoy2, basisOut: bOut, basis: td.basis, def: td.def, taxWD: taxWD2, spend: spend2, annual: taxWD2, cum: td.cum, year: y + 1 });
      const fav = retired ? (v.Le === 0 ? v.m : v.m * Math.pow(1 + v.Le, y - W0)) : 0;
      rows.push({ age: v.A + y, taxable: spend, deferred: spend2, favored: fav, year: y + 1, retired });
    }
    return { rows, wsT, wsD, W0, N };
  }
  EFA.engines.distribution = distribution;
  EFA.engines.distributionInputs = dsValues;

  const dsView = { view: 'form', periods: null, infl: {} };
  EFA.screen('ds1', {
    title: 'Distribution solution assumptions',
    copy: {
      head: 'Initial Assumptions',
      lAge: 'Current Age', lRet: 'Retirement Age', lProj: 'Project to Age', lContrib: 'Annual Contribution (AT)', lYby: 'Year by year', bYearly: 'Edit Yearly Values',
      lIncome: 'Future Income Required (AT)', lInfl: 'Inflate Future Income by', lRor: 'Total Rate of Return',
      hCG: 'Capital Gain', hTreat: 'Tax Treatment', hOrd: 'Ordinary', lBracket: 'Tax Bracket', lRetTB: 'Retirement T.B.',
      lTerm: 'Include Term Insurance', bPremiums: 'Premiums',
      termTitle: 'Term Insurance Details', lYears: 'Years of Coverage', lFace: 'Policy Face Value', premTitle: 'Enter Premiums', hAge: 'Age', hPrem: 'Premium', contribTitle: 'Annual Contribution', hAmount: 'Amount', bReturn: 'Return',
      rowHint: 'Click any row to change it and the years that follow.',
      dAmount: 'Amount', dPeriods: '# of Periods', dInfl: 'Inflate @', bCancel: 'Cancel', bEnter: 'Enter',
      at: '"AT" means after tax.',
      note: 'These are your assumptions. The rate of return is a hypothetical fixed rate, capped at 12%; actual returns and tax rates will vary.',
      _notes: 'Everything the distribution comparison needs: your timeline, what you will save, the income you want in retirement, and how growth is taxed.\n\n- Ask: In today\'s dollars, what after-tax income would let you live the way you want in retirement?\nPAUSE\n\n- The next screen shows how long each kind of account delivers that income.'
    },
    render(ctx) {
      const cd = CD(), L = EFA.lib || {};
      const v0 = dsValues();
      const fld = (o) => ctx.field(o);
      const shared = (id, value, extra) => cd.field(ctx, Object.assign({ key: DS_KEYS[id], id, type: 'int', value }, extra || {}));
      const ybyOn = !!ctx.mem('ybyOn', false), termOn = !!ctx.mem('termOn', false);
      const row = (label, control, extra) => `<div class="b05-ds-row ${extra || ''}">${ctx.t(label, { tag: 'div', cls: 'lab' })}<div class="b05-cx">${control}</div></div>`;
      const infLink = L.inflation ? L.inflation.link(ctx, { field: 'infl', instance: 'main' }) : '';
      ctx.el.innerHTML = `<div class="b05-head" style="top:30px">${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:56px"' })}</div>
        <div class="b05-ds-view" data-view="form">
          <div class="st-card b05-ds-form">
            ${row('lAge', shared('age', 42, { min: 0, max: 120 }))}
            ${row('lRet', shared('retAge', 65, { min: 1, max: 120 }))}
            ${row('lProj', shared('projAge', 84, { min: 1, max: 125 }))}
            <div class="b05-ds-row">${ctx.t('lContrib', { tag: 'div', cls: 'lab' })}<div class="b05-cx">
              <button type="button" class="b05-switch sm" data-yby role="switch" aria-checked="${ybyOn}"><i></i>${ctx.t('lYby')}</button>
              <div class="b05-ds-c" data-c="box" ${ybyOn ? 'hidden' : ''}>${fld({ id: 'contrib', type: 'money', value: 5000, min: 0 })}</div>
              <button type="button" class="st-pill b05-sub-pill b05-ghost" data-c="btn" data-open="contrib" ${ybyOn ? '' : 'hidden'}>${ctx.t('bYearly')}</button></div></div>
            ${row('lIncome', fld({ id: 'income', type: 'money', value: 75000, min: 0 }))}
            <div class="b05-ds-row">${ctx.t('lInfl', { tag: 'div', cls: 'lab', attrs: 'style="display:flex;align-items:center;gap:12px"' })}<div class="b05-cx"><span class="b05-ds-inf">${infLink}</span>${fld({ id: 'infl', type: 'pct', value: 0, min: 0, max: 0.25 })}</div></div>
            ${row('lRor', fld({ id: 'ror', type: 'pct', value: 0.08, min: 0, max: 0.12 }))}
            <div class="b05-ds-tri hd">${ctx.t('hCG', { tag: 'div' })}${ctx.t('hTreat', { tag: 'div', cls: 'mid' })}${ctx.t('hOrd', { tag: 'div' })}</div>
            <div class="b05-ds-tri">${fld({ id: 'pctCG', type: 'pct', value: 0.4, min: 0, max: 1, dp: 0 })}<div class="mid"><input type="range" class="b05-ds-slider" min="0" max="100" step="1" value="${Math.round(v0.o * 100)}" data-slider></div>${fld({ id: 'pctOrd', type: 'pct', value: 0.6, min: 0, max: 1, dp: 0 })}</div>
            <div class="b05-ds-tri">${fld({ id: 'taxCG', type: 'pct', value: 0.15, min: 0, max: 0.6, dp: 0 })}${ctx.t('lBracket', { tag: 'div', cls: 'mid lab' })}${fld({ id: 'taxOrd', type: 'pct', value: 0.35, min: 0, max: 0.6, dp: 0 })}</div>
            <div class="b05-ds-tri">${fld({ id: 'retCG', type: 'pct', value: 0.15, min: 0, max: 0.6, dp: 0 })}${ctx.t('lRetTB', { tag: 'div', cls: 'mid lab' })}${fld({ id: 'retOrd', type: 'pct', value: 0.35, min: 0, max: 0.6, dp: 0 })}</div>
            <div class="b05-ds-row">${ctx.t('lTerm', { tag: 'div', cls: 'lab' })}<div class="b05-cx"><button type="button" class="b05-switch" data-term role="switch" aria-checked="${termOn}"><i></i></button>
              <button type="button" class="st-pill b05-sub-pill b05-ghost" data-open="term" style="visibility:${termOn ? 'visible' : 'hidden'}">${ctx.t('bPremiums')}</button></div></div>
          </div>
          <div class="b05-ds-note">${ctx.t('note', { tag: 'p', cls: 'st-disclaimer' })}${ctx.t('at', { tag: 'p', cls: 'st-disclaimer' })}</div>
        </div>
        <div class="b05-ds-view" data-view="term" hidden>
          <div class="st-card b05-ds-termcard">${ctx.t('termTitle', { tag: 'h3', cls: 'st-h3' })}
            <div class="b05-ds-row">${ctx.t('lYears', { tag: 'div', cls: 'lab' })}<div class="b05-cx">${shared('termYears', 20, { min: 1, max: 60 })}</div></div>
            <div class="b05-ds-row">${ctx.t('lFace', { tag: 'div', cls: 'lab' })}<div class="b05-cx">${shared('termFace', 250000, { type: 'money', min: 0 })}</div></div>
            ${ctx.t('rowHint', { tag: 'p', cls: 'st-small', attrs: 'style="margin:6px 0 0;font-size:16px"' })}
          </div>
          <div class="b05-ds-listcol" style="left:960px">${ctx.t('premTitle', { tag: 'h3', cls: 'st-h3' })}<div class="b05-ds-list" data-list="term"></div>
            <button type="button" class="st-pill" data-return>${ctx.t('bReturn')}</button></div>
        </div>
        <div class="b05-ds-view" data-view="contrib" hidden>
          <div class="b05-ds-listcol" style="left:620px">${ctx.t('contribTitle', { tag: 'h3', cls: 'st-h3' })}<div class="b05-ds-list" data-list="contrib"></div>
            ${ctx.t('rowHint', { tag: 'p', cls: 'st-small', attrs: 'style="margin:0;font-size:15px;text-align:center"' })}
            <button type="button" class="st-pill" data-return>${ctx.t('bReturn')}</button></div>
        </div>`;
      if (L.disclosure) L.disclosure.guard(ctx, 'ror');
      // switches and views
      ctx.on(ctx.$('[data-yby]'), 'click', (e, b) => { const on = !ctx.mem('ybyOn', false); ctx.remember('ybyOn', on); b.setAttribute('aria-checked', on); ctx.$('[data-c="box"]').hidden = on; ctx.$('[data-c="btn"]').hidden = !on; });
      ctx.on(ctx.$('[data-term]'), 'click', (e, b) => { const on = !ctx.mem('termOn', false); ctx.remember('termOn', on); b.setAttribute('aria-checked', on); ctx.$('[data-open="term"]').style.visibility = on ? 'visible' : 'hidden'; });
      ctx.on(ctx.$$('[data-open]'), 'click', (e, b) => dsShow(ctx, b.dataset.open));
      ctx.on(ctx.$$('[data-return]'), 'click', () => dsShow(ctx, 'form'));
      // the mix slider saves 300 ms after it stops moving (distinct values only)
      const sl = ctx.$('[data-slider]'); let slT = null, slLast = +sl.value;
      sl.addEventListener('input', () => { clearTimeout(slT); slT = setTimeout(() => { const o = +sl.value; if (o === slLast) return; slLast = o; ctx.setField('pctOrd', o / 100); ctx.setField('pctCG', 1 - o / 100); ctx._prev.pctOrd = o / 100; ctx._prev.pctCG = 1 - o / 100; }, 300); });
      // rules: age < retirement age <= project-to age; mix boxes always add to 100%
      ctx._prev = Object.assign({}, ctx.values());
      ctx.onFields((vals) => {
        const p = ctx._prev, fix = (id, v) => { ctx.setField(id, v); if (DS_KEYS[id]) cd.set(DS_KEYS[id], v); vals[id] = v; };
        if (vals.age !== p.age && vals.age >= vals.retAge) fix('age', vals.retAge - 1);
        if (vals.retAge !== p.retAge && vals.retAge <= vals.age) fix('retAge', vals.age + 1);
        if (vals.projAge < vals.retAge) fix('projAge', vals.retAge);
        if (vals.pctCG !== p.pctCG) fix('pctOrd', Math.round((1 - vals.pctCG) * 10000) / 10000);
        else if (vals.pctOrd !== p.pctOrd) fix('pctCG', Math.round((1 - vals.pctOrd) * 10000) / 10000);
        sl.value = Math.round(vals.pctOrd * 100); slLast = +sl.value;
        ctx._prev = Object.assign({}, vals);
        if (vals.termYears !== p.termYears || vals.age !== p.age || vals.retAge !== p.retAge) dsDrawLists(ctx);
      });
      dsShow(ctx, dsView.view === 'form' ? 'form' : dsView.view);
    },
    leave(ctx) { const e = EFA.player.pres && EFA.player.entry(); if (!e || e.id !== 'ds1') { dsView.view = 'form'; dsView.periods = null; dsView.infl = {}; } dsCloseModal(); }
  });
  function dsShow(ctx, view) {
    dsView.view = view;
    ctx.$$('.b05-ds-view').forEach((v) => { v.hidden = v.dataset.view !== view; });
    if (view !== 'form') dsDrawLists(ctx);
  }
  function dsLists(ctx) {
    const cd = CD(), v = ctx.values();
    const age = v.age != null ? v.age : cd.get(DS_KEYS.age, 42), ret = v.retAge != null ? v.retAge : cd.get(DS_KEYS.retAge, 65), yrs = v.termYears != null ? v.termYears : cd.get(DS_KEYS.termYears, 20);
    return {
      age, ret, yrs,
      contrib: sizeList(ctx.mem('contribList', defList()), Math.max(0, ret - age), 400),
      term: sizeList(cd.get(TERM_LIST_KEY, null) || defList(), yrs, 400)
    };
  }
  function dsSaveList(ctx, which, list) {
    if (which === 'contrib') ctx.remember('contribList', list.map((x) => Math.round(x)));
    else CD().set(TERM_LIST_KEY, list.map((x) => ({ amount: Math.round(x) })));
  }
  function dsDrawLists(ctx) {
    const s = dsLists(ctx);
    ['contrib', 'term'].forEach((which) => {
      const host = ctx.$(`[data-list="${which}"]`); if (!host) return;
      const list = s[which];
      dsSaveList(ctx, which, list);   // the sized list is what gets remembered (missing years copy the year before)
      host.innerHTML = `<table class="st-table b05-ds-tab"><thead><tr><th>${ctx.t('hAge')}</th><th>${ctx.t(which === 'term' ? 'hPrem' : 'hAmount')}</th></tr></thead>
        <tbody>${list.map((a, i) => `<tr data-i="${i}"><td class="num">${s.age + i}</td><td class="num">${F.money(a)}</td></tr>`).join('')}</tbody></table>`;
      host.querySelectorAll('tr[data-i]').forEach((tr) => tr.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; dsEdit(ctx, which, +tr.dataset.i); }));
      EFA.numify(host); if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
    });
  }
  /* the edit dialog: no close button, Escape does nothing; Cancel or Enter only */
  let dsModal = null, dsEscBlock = null;
  function dsCloseModal() { if (dsModal) { dsModal.remove(); dsModal = null; } if (dsEscBlock) { document.removeEventListener('keydown', dsEscBlock, true); dsEscBlock = null; } }
  function dsEdit(ctx, which, idx) {
    dsCloseModal();
    const s = dsLists(ctx), list = s[which].slice();
    const maxP = which === 'contrib' ? list.length : s.yrs;
    const P0 = dsView.periods && dsView.periods[which] ? Math.min(dsView.periods[which], which === 'contrib' ? maxP : 999) : maxP;
    const L = EFA.lib || {};
    dsView.infl = dsView.infl || {};
    let infl = dsView.infl[which] || 0;
    const m = document.createElement('div'); m.className = 'b05-modal';
    m.innerHTML = `<div class="b05-modal-in">
        ${ctx.t(which === 'term' ? 'premTitle' : 'contribTitle', { tag: 'h3', cls: 'st-h3' })}
        <div class="b05-ds-row">${ctx.t('dAmount', { tag: 'div', cls: 'lab' })}<div class="b05-cx"><input class="st-input" data-d="amt" inputmode="decimal" autocomplete="off" value="${F.money(list[idx])}"></div></div>
        <div class="b05-ds-row">${ctx.t('dPeriods', { tag: 'div', cls: 'lab' })}<div class="b05-cx"><input class="st-input" data-d="per" inputmode="numeric" autocomplete="off" value="${P0}"></div></div>
        <div class="b05-ds-row">${ctx.t('dInfl', { tag: 'div', cls: 'lab', attrs: 'style="display:flex;align-items:center;gap:12px"' })}<div class="b05-cx"><span class="b05-ds-inf">${L.inflation ? L.inflation.link(ctx, { instance: which, onUse: (r) => { infl = Math.round(r * 10000) / 100; ip.value = F.num(infl, 2) + '%'; } }) : ''}</span><input class="st-input" data-d="inf" inputmode="decimal" autocomplete="off" value="${F.num(infl, 2)}%"></div></div>
        <div class="row"><button type="button" class="st-pill b05-ghost" data-x>${ctx.t('bCancel')}</button><button type="button" class="st-pill" data-ok>${ctx.t('bEnter')}</button></div>
      </div>`;
    ctx.el.appendChild(m); dsModal = m;
    const ip = m.querySelector('[data-d="inf"]');
    dsEscBlock = (e) => { if (e.key === 'Escape' && dsModal) { e.stopPropagation(); e.preventDefault(); } };
    document.addEventListener('keydown', dsEscBlock, true);
    m.querySelectorAll('input').forEach((inp) => {
      inp.addEventListener('focus', () => inp.select());
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
    });
    ip.addEventListener('blur', () => { infl = deParse(ip.value, 2); ip.value = F.num(infl, 2) + '%'; });
    m.querySelector('[data-x]').addEventListener('click', () => dsCloseModal());
    m.querySelector('[data-ok]').addEventListener('click', () => {
      let a = Math.abs(deParse(m.querySelector('[data-d="amt"]').value, 2));
      let P = Math.max(1, Math.round(Math.abs(deParse(m.querySelector('[data-d="per"]').value, 0))));
      if (which === 'contrib') P = Math.min(P, maxP);
      infl = deParse(ip.value, 2);
      dsView.periods = Object.assign({}, dsView.periods, { [which]: P }); dsView.infl[which] = infl;
      let k = idx; const start = idx;
      do { list[k] = a; a = a * (1 + infl / 100); k++; } while (k < list.length && k < start + P);
      dsSaveList(ctx, which, list.map((x) => Math.round(x)));
      dsCloseModal(); dsDrawLists(ctx);
    });
    EFA.numify(m); if (EFA.edit && EFA.edit.on) EFA.edit.arm(m);
  }

  EFA.screen('ds2', {
    title: 'Distribution solution spendable income',
    copy: {
      head: 'Summary Report on Spendable Income',
      hAge: 'Age', hTaxable: 'Taxable Account', hDeferred: 'Tax Deferred Account', hFavored: 'Tax Favored Account', hYear: 'Year', flatSuffix: 'Flattened',
      bDoc: 'Documentation', bFlatten: 'Flatten', bSpecified: 'Specified', bSummary: 'Summary',
      favTitle: 'Tax Favored Account', favBody: 'For the tax favored account, please see the insurance company\'s illustration and proposal. They show the product\'s actual costs, values and guarantees.', bOk: 'OK',
      wsT: 'Taxable Account Detail', wsD: 'Tax Deferred Account Detail',
      tAge: 'Age', tContrib: 'Contribution (After Tax)', tWd: 'Withdrawal (Before Tax)', tTerm: 'Term Premium', tBoy: 'Beginning Balance', tOrdG: 'Ordinary Growth', tTaxG: 'Tax on Growth', tCgG: 'Capital Gain Growth', tEoy: 'Ending Balance',
      tBasisOut: 'Basis Returned', tGainsOut: 'Gain Withdrawn', tBasis: 'Basis Remaining', tGains: 'Unrealized Gain', tTaxGain: 'Tax on Gain', tTaxWD: 'Tax on Withdrawal', tSpend: 'Spendable Income', tAnnual: 'Taxes This Year', tCum: 'Total Taxes', tYear: 'Year',
      dContrib: 'Contribution', dWd: 'Withdrawal', dGrowth: 'Tax-Deferred Growth', dDef: 'Deferred Growth Remaining',
      disc: 'Hypothetical illustration using your assumptions and a fixed rate of return. The tax favored column assumes the income you want is delivered every year; distributions from a properly structured life insurance policy are generally income-tax-free under current tax law, subject to applicable requirements.',
      wsWait: 'The worksheet is still being set up.',
      _notes: 'Same savings, three kinds of accounts. Watch the year each column runs dry: taxes on growth and withdrawals decide how long the money lasts.\n\n- Ask: Which column would you want your retirement income to come from?\nPAUSE\n\n- Flatten shows what each account pays if you only spend its after-tax growth.'
    },
    render(ctx) {
      const flat = !!ctx.mem('flatten', false);
      const v = dsValues(), r = distribution(v, flat);
      ctx._ds = { v, r, flat };
      const L = EFA.lib || {};
      const head = (k) => `${ctx.t(k)}${flat && (k === 'hTaxable' || k === 'hDeferred') ? ` ${ctx.t('flatSuffix', { tag: 'span', cls: 'suf' })}` : ''}`;
      ctx.el.innerHTML = `<div class="b05-head" style="top:28px">${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:54px"' })}</div>
        <div class="b05-ds2-tbl"><table class="st-table b05-ds2-t"><colgroup><col style="width:150px"><col><col><col><col style="width:150px"></colgroup>
          <thead><tr><th>${ctx.t('hAge')}</th><th>${head('hTaxable')}</th><th>${head('hDeferred')}</th><th>${head('hFavored')}</th><th>${ctx.t('hYear')}</th></tr></thead>
          <tbody>${r.rows.map((x) => `<tr class="${x.year - 1 === r.W0 ? 'ret' : ''}${x.retired ? '' : ' work'}" data-y="${x.year - 1}"><td class="num">${x.age}</td><td class="num">${F.money(x.taxable)}</td><td class="num">${F.money(x.deferred)}</td><td class="num">${F.money(x.favored)}</td><td class="num">${x.year}</td></tr>`).join('')}</tbody></table></div>
        <div class="b05-ds2-docs"><span></span><button type="button" class="b05-link" data-doc="t">${ctx.t('bDoc')}</button><button type="button" class="b05-link" data-doc="d">${ctx.t('bDoc')}</button><button type="button" class="b05-link" data-doc="f">${ctx.t('bDoc')}</button><span></span></div>
        <div class="b05-ds2-btns"><button type="button" class="st-pill b05-ghost" data-flat>${ctx.t(flat ? 'bSpecified' : 'bFlatten')}</button><button type="button" class="st-pill" data-sum>${ctx.t('bSummary')}</button></div>
        <div class="b05-ds2-disc">${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer' })}${L.disclosure ? L.disclosure.line(['loans', 'notAdvice']) : ''}</div>`;
      ctx.on(ctx.$('[data-flat]'), 'click', () => { ctx.remember('flatten', !flat); EFA.player.renderScreen({ noFade: true }); });
      ctx.on(ctx.$('[data-sum]'), 'click', () => ds2Summary(ctx));
      ctx.on(ctx.$$('[data-doc]'), 'click', (e, b) => {
        const k = b.dataset.doc;
        if (k === 'f') { const ov = dialog(ctx, { title: ctx.t('favTitle'), html: `${ctx.t('favBody', { tag: 'p' })}<div class="row"><button type="button" class="st-pill" data-ok>${ctx.t('bOk')}</button></div>` }); ov.querySelector('[data-ok]').addEventListener('click', () => ov.close()); return; }
        openWorksheet(ctx, ds2Sheet(ctx, k));
      });
      // after half a second, bring the retirement-age row to the top of the table
      ctx.timeout(() => { const box = ctx.$('.b05-ds2-tbl'), tr = ctx.$('tr.ret'); if (box && tr) box.scrollTo({ top: tr.offsetTop - box.querySelector('thead').offsetHeight, behavior: ctx.reduced ? 'auto' : 'smooth' }); }, 500);
    }
  });
  function ds2Summary(ctx) {
    const { r, flat } = ctx._ds;
    const head = (k) => `${ctx.t(k)}${flat && (k === 'hTaxable' || k === 'hDeferred') ? ` ${ctx.t('flatSuffix')}` : ''}`;
    const m2 = (v) => F.money(v, { dp: 2 });
    ctx.overlay({
      title: `<span>${ctx.t('head')}</span>`, wide: true,
      html: `<div class="b05-ds2-sum"><table class="st-table b05-ds2-t"><thead><tr><th>${ctx.t('hAge')}</th><th>${head('hTaxable')}</th><th>${head('hDeferred')}</th><th>${head('hFavored')}</th><th>${ctx.t('hYear')}</th></tr></thead>
        <tbody>${r.rows.map((x) => `<tr class="${x.year - 1 === r.W0 ? 'ret' : ''}"><td class="num">${x.age}</td><td class="num">${m2(x.taxable)}</td><td class="num">${m2(x.deferred)}</td><td class="num">${m2(x.favored)}</td><td class="num">${x.year}</td></tr>`).join('')}</tbody></table></div>`
    });
  }
  function ds2Sheet(ctx, k) {
    const { r } = ctx._ds;
    const m = (f, h) => ({ field: f, header: ctx.t(h), type: 'money', dp: 2 });
    if (k === 't') {
      return { heading: ctx.t('wsT'), size: 'full', columns: [{ field: 'age', header: ctx.t('tAge'), type: 'age' }, m('contrib', 'tContrib'), m('wd', 'tWd'), m('term', 'tTerm'), m('boy', 'tBoy'), m('ordG', 'tOrdG'), m('taxG', 'tTaxG'), m('cgG', 'tCgG'), m('eoy', 'tEoy'), m('basisOut', 'tBasisOut'), m('gainsOut', 'tGainsOut'), m('basis', 'tBasis'), m('gains', 'tGains'), m('taxGain', 'tTaxGain'), m('taxWD', 'tTaxWD'), m('spend', 'tSpend'), m('annual', 'tAnnual'), m('cum', 'tCum'), { field: 'year', header: ctx.t('tYear'), type: 'year' }], rows: r.wsT, highlight: 'spend', disclosures: ['hypothetical', 'notAdvice', 'license'] };
    }
    return { heading: ctx.t('wsD'), size: 'full', columns: [{ field: 'age', header: ctx.t('tAge'), type: 'age' }, m('contrib', 'dContrib'), m('wd', 'dWd'), m('term', 'tTerm'), m('boy', 'tBoy'), m('growth', 'dGrowth'), m('eoy', 'tEoy'), m('basisOut', 'tBasisOut'), m('basis', 'tBasis'), m('def', 'dDef'), m('taxWD', 'tTaxWD'), m('spend', 'tSpend'), m('annual', 'tAnnual'), m('cum', 'tCum'), { field: 'year', header: ctx.t('tYear'), type: 'year' }], rows: r.wsD, highlight: 'spend', disclosures: ['hypothetical', 'notAdvice', 'license'] };
  }

  /* ==== Debt 101 (df1-df3) and Disability Insurance 101 (dif1-dif4): PEM lesson frame ==== */
  EFA.css('b05-les', `
  .b05-lp { position: absolute; left: 1118px; right: 46px; top: 36px; }
  .b05-lp h2 { margin: 0 0 22px; font: 600 42px/1.06 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b05-lp h3 { margin: 0 0 18px; font: 600 30px/1.1 "Cormorant Garamond", Georgia, serif; color: #8a6e22; }
  .b05-lp h3.b05-h3b { margin-top: 26px; }
  .stage .b05-lbt { font: 600 20px/1.34 "DM Sans", sans-serif; color: #0d1e3a; }
  .b05-lbtn { position: absolute; left: 40px; bottom: 74px; }
  .b05-no { width: 100%; height: 100%; cursor: pointer; pointer-events: auto; opacity: 0; }
  .b05-no svg, .b05-chair svg { width: 100%; height: 100%; display: block; overflow: visible; }
  .b05-no.on, .b05-chair.on { opacity: 1; }
  .b05-no.on.wink, .b05-chair.on.wink { animation: b05wink 1.5s linear; }
  @keyframes b05wink { 0% { opacity: 0 } 30% { opacity: 1 } 33.3% { opacity: 0 } 63% { opacity: 1 } 66.6% { opacity: 0 } 100% { opacity: 1 } }
  .b05-chair { position: absolute; right: 150px; bottom: 74px; width: 132px; height: 132px; opacity: 0; transform: scaleX(-1); pointer-events: none; }
  .b05-shield { width: 100%; height: 100%; opacity: 0; transition: opacity .8s ease; filter: drop-shadow(0 4px 8px rgba(13,30,58,.25)); }
  .b05-shield.on { opacity: 1; }
  `);
  const lesReady = () => !!(EFA.lib && EFA.lib.pem && EFA.lib.pem.mount && EFA.lib.bullets);
  const LES_PEND = 'The model is loading.';
  const noSign = () => `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="rgba(255,253,248,.35)" stroke="#a23b2a" stroke-width="9" stroke-linecap="round" stroke-dasharray="230 8 20 4"/><path d="M22 22 78 78" stroke="#a23b2a" stroke-width="10" stroke-linecap="round"/></svg>`;
  /** person using a wheelchair, flat duotone */
  const chairArt = () => `<svg viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="112" rx="44" ry="5" fill="rgba(13,30,58,.14)"/>
      <circle cx="52" cy="80" r="27" fill="none" stroke="${P.navy}" stroke-width="6"/>
      <circle cx="52" cy="80" r="4" fill="${P.navy}"/>
      <circle cx="94" cy="100" r="7" fill="none" stroke="${P.navy}" stroke-width="5"/>
      <path d="M34 50 L40 72 H78 L94 100" fill="none" stroke="${P.navy}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="44" cy="14" r="10" fill="${P.gold}"/>
      <path d="M44 28 L48 58 H74 L84 82" fill="none" stroke="${P.gold}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M46 40 L66 44" fill="none" stroke="${P.gold}" stroke-width="8" stroke-linecap="round"/>
    </svg>`;
  /** mount the model in the lesson frame: zoomed model left, panel right */
  function lesPem(ctx, cfg, expanded) {
    return EFA.lib.pem.mount(ctx, ctx.el, Object.assign({
      links: false, scenarioPicker: false, borrowSource: false, showHouse: false, sliders: false, chevrons: false,
      frame: { zoom: { scale: 0.95, shift: [-3, -5] }, width: 0.69, expanded: !!expanded, panel: '.b05-lp, .b05-lbtn', expandShows: ['labels', 'lifestyle'], toggle: true }
    }, cfg));
  }
  /** apply one step's absolute diagram state. st = { mode, levels }. A storyboard restarts only when the mode changes. */
  function lesApply(ctx, st) {
    const p = ctx.pem; if (!p) return;
    const want = st.mode || null, changed = ctx._mode !== want;
    if (changed) { p.stopAll(); p.flowsOff(); }
    if (st.levels) p.set(st.levels, { ms: changed ? 0 : 800 });
    if (changed) {
      ctx._mode = want;
      if (want) ctx.timeout(() => { if (ctx._mode === want) p.play(want); }, 100);
    }
  }
  function lesPanel(ctx, items, o) {
    o = o || {};
    return `<div class="b05-lp">${o.head || ''}${EFA.lib.bullets.list(ctx, items.map((k) => ctx.t(k)), { from: o.from == null ? 1 : o.from, boxed: true, size: 34, gap: 14, text: 'b05-lbt' })}</div>`;
  }
  /** define one lesson screen. o: { title, steps, copy, cfg, expanded, from, head(ctx), states(n), extra(ctx), after(ctx, n) } */
  function lesson(id, o) {
    EFA.screen(id, {
      title: o.title, steps: o.steps,
      copy: Object.assign({ pending: LES_PEND }, o.copy),
      render(ctx) {
        ctx._mode = undefined;
        if (!lesReady()) { ctx.el.innerHTML = `<p class="st-small" style="position:absolute;left:110px;top:420px">${ctx.t('pending')}</p>`; return; }
        ctx.el.innerHTML = lesPanel(ctx, ['b1', 'b2', 'b3', 'b4'], { head: o.head(ctx), from: o.from }) + (o.extra ? o.extra(ctx) : '');
        ctx.pem = lesPem(ctx, o.cfg, o.expanded);
        if (o.mounted) o.mounted(ctx);
      },
      step(ctx, n) {
        if (!ctx.pem) return;
        EFA.lib.bullets.reveal(ctx, n);
        lesApply(ctx, o.states(n));
        if (o.after) o.after(ctx, n);
      }
    });
  }

  /* ---------- df1 ---------- */
  lesson('df1', {
    title: 'Debt 101: living paycheck to paycheck', steps: 6, from: 2, expanded: true,
    cfg: { regulator: 100, showBorrowed: false },
    copy: {
      head: 'Debt: The Road to Financial Ruin',
      b1: 'You earn a paycheck from your job.', b2: 'You pay your taxes.', b3: 'Nothing is left over to save or invest.', b4: 'You spend whatever remains.',
      _notes: 'Most households live exactly like this: the paycheck comes in, taxes come out, and the rest is spent.\n\n- Ask: In your own household, what happens to the money that is left after the bills are paid?\nPAUSE'
    },
    head: (ctx) => ctx.t('head', { tag: 'h2' }),
    states: (n) => ({ mode: [null, null, 'Debt1Income', 'Debt1PayTax', 'Debt1PayTax', 'Debt1SpendAll'][n], levels: { regulator: 100, showFuture: n < 4 } }),
    after: (ctx, n) => ctx.pem.expand(n === 0)
  });

  /* ---------- df2 ---------- */
  lesson('df2', {
    title: 'Debt 101: an unexpected expense forces borrowing', steps: 5,
    cfg: { regulator: 100, remaining: 100, showFuture: false, showBorrowed: false, borrow: 0, debtService: false },
    copy: {
      head: 'Life Happens',
      b1: 'A large expense comes up.', b2: 'You have no choice but to borrow.', b3: 'You end up in debt.', b4: 'You cut back your lifestyle to make the debt payments.',
      _notes: 'With nothing saved, the first big surprise has to be borrowed. And every payment on that loan comes out of the life you are living today.\n\n- Ask: When the car, the roof or a medical bill comes due, where does the money come from today?\nPAUSE'
    },
    head: (ctx) => ctx.t('head', { tag: 'h2' }),
    states: (n) => ({ mode: 'Debt1SpendAll', levels: { regulator: 100, showFuture: false, showBorrowed: n >= 2, borrow: n >= 3 ? 33 : 0, remaining: n >= 4 ? 75 : 100 } })
  });

  /* ---------- df3 ---------- */
  lesson('df3', {
    title: 'Debt 101: the debt spiral', steps: 5,
    cfg: { regulator: 100, remaining: 75, showFuture: false, showBorrowed: true, borrow: 33, debtService: false },
    copy: {
      head: 'A Slippery Slope',
      b1: 'Your job is the only collateral you have.', b2: 'Extra cash flow pays the debt down and eases the pressure.', b3: 'More unexpected expenses will come.', b4: 'You borrow right up to your limit.',
      _notes: 'Debt backed only by a paycheck is fragile. You can climb out with extra cash flow, but the next surprise pulls you right back in.\n\n- Ask: What would happen to these payments if the paycheck stopped for six months?\nPAUSE'
    },
    head: (ctx) => ctx.t('head', { tag: 'h2' }),
    states: (n) => n <= 1 ? { mode: 'Debt1SpendAll', levels: { borrow: 33, remaining: 75, regulator: 100 } }
      : n === 2 ? { mode: 'Debt1ExtraCashflow', levels: { borrow: 33.3, remaining: 75 } }
      : { mode: 'Debt1DebtSpiral' }
  });

  /* ---------- dif1 ---------- */
  lesson('dif1', {
    title: 'Disability Insurance 101: healthy and working', steps: 6, from: 2, expanded: true,
    cfg: { regulator: 100, safe: 0, riskPreTax: 0, showBorrowed: true, borrow: 0 },
    copy: {
      head: 'The Need for Disability Insurance', sub: 'Healthy and Working',
      b1: 'Over your working life, you will earn a great deal of income.', b2: 'As you earn, you pay taxes.', b3: 'You set money aside for retirement and emergencies.', b4: 'What is left pays for your standard of living.',
      _notes: 'Here is your financial life while you are healthy: income in, taxes out, savings growing, lifestyle paid for. Everything on this model depends on one thing.\n\n- Ask: What is the one part of this picture that everything else depends on?\nPAUSE'
    },
    head: (ctx) => `${ctx.t('head', { tag: 'h2' })}${ctx.t('sub', { tag: 'h3' })}`,
    states: (n) => n <= 1 ? { mode: null, levels: { regulator: 100, safe: 0, riskPreTax: 0 } }
      : n === 2 ? { mode: 'DIF1HaveJob', levels: { regulator: 100, safe: 0, riskPreTax: 0 } }
      : n === 3 ? { mode: 'DIF1HaveJobPayTaxes', levels: { regulator: 100, safe: 0, riskPreTax: 0 } }
      : n === 4 ? { mode: 'DIF1SaveForRetirement', levels: { regulator: 100, safe: 0, riskPreTax: 0 } }
      : { mode: 'DIFSpendTheRest', levels: { regulator: 80, safe: 8, riskPreTax: 50 } },
    after: (ctx, n) => ctx.pem.expand(n === 0)
  });

  /* ---------- dif2 ---------- */
  const DIF2_END = { regulator: 0, safe: 0, riskPreTax: 0, borrow: 33, futureFill: false, disabilityBand: 0 };
  lesson('dif2', {
    title: 'Disability Insurance 101: disabled and not working', steps: 5,
    cfg: { regulator: 80, safe: 8, riskPreTax: 50, showBorrowed: true, borrow: 0 },
    copy: {
      head: 'Disabled and Not Working',
      b1: 'Your income drops or stops.', b2: 'Your expenses may go up.', b3: 'You use up savings and investments to keep your lifestyle going.', b4: 'Then you borrow as much as you can.',
      _notes: 'Now take the paycheck away. The bills keep coming, and often grow. Savings go first, then investments, then credit.\n\n- Ask: If your income stopped tomorrow, how many months could your household keep going like this?\nPAUSE\n\n- Click the symbol over the income tank to open Remaining Income Potential.'
    },
    head: (ctx) => ctx.t('head', { tag: 'h2' }),
    extra: () => `<div class="b05-chair">${chairArt()}</div>`,
    mounted(ctx) {
      const el = ctx.pem.place(`<div class="b05-no">${noSign()}</div>`, 'income', { w: 14, h: 14, dy: -1 });
      ctx._no = el.querySelector('.b05-no') || el;
      ctx.on(ctx._no, 'click', () => ctx.jump('IPR', 'ip1'));
    },
    states: (n) => n === 0 ? { mode: 'DIFSpendTheRest', levels: { regulator: 80, safe: 8, riskPreTax: 50, borrow: 0, futureFill: true, disabilityBand: 0 } }
      : n === 1 ? { mode: null, levels: { regulator: 80, safe: 8, riskPreTax: 50, borrow: 0, futureFill: false, disabilityBand: 0 } }
      : n === 2 ? { mode: null, levels: { regulator: 100, safe: 8, riskPreTax: 50, borrow: 0, futureFill: false, disabilityBand: 0 } }
      : n === 3 ? { mode: 'DIF2ExhaustSavings', levels: { regulator: 100, safe: 8, riskPreTax: 50, borrow: 0, futureFill: false, disabilityBand: 0 } }
      : { mode: 'DIF2BorrowToLimit', levels: { regulator: 0, safe: 0, riskPreTax: 0, borrow: 0, futureFill: false } },
    after(ctx, n) {
      const wink = (el, on, was) => { if (!el) return; el.classList.toggle('on', on); el.classList.toggle('wink', on && !was && !EFA.util.reduced()); };
      const no = ctx._no, ch = ctx.$('.b05-chair');
      wink(no, n >= 1, no && no.classList.contains('on'));
      wink(ch, n >= 2, ch && ch.classList.contains('on'));
    }
  });

  /* ---------- dif3 ---------- */
  const shieldGold = () => `<div class="b05-shield">${EFA.lib.pem.art.shield({ light: '#e6d293', dark: '#b8972e', opacity: 0.95 })}</div>`;
  lesson('dif3', {
    title: 'Disability Insurance 101: income is your most valuable asset', steps: 5,
    cfg: { regulator: 80, safe: 8, riskPreTax: 50, showBorrowed: true, borrow: 0, showQP: false },
    copy: {
      head: 'Your Income Is Your Most Valuable Asset',
      b1: 'Disability insurance can give you back part of your cash flow.', b2: 'It can ease the financial stress.', b3: 'Your savings may keep being funded.', b4: 'It helps you keep your standard of living.',
      disc: 'Disability income insurance replaces only part of your income. Benefits depend on the policy\'s definition of disability, its waiting period and its benefit period.',
      _notes: 'Your ability to earn is the engine behind every tank on this model. Disability insurance is how you protect the engine.\n\n- Ask: If you insure your home and your car, what about the income that pays for both?\nPAUSE'
    },
    head: (ctx) => ctx.t('head', { tag: 'h2' }),
    extra: (ctx) => `<div class="b05-chair on">${chairArt()}</div>${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer b05-lp', attrs: 'style="top:auto;bottom:220px;margin:0"' })}`,
    mounted(ctx) { const el = ctx.pem.place(shieldGold(), { left: 2.8, top: 6.8, w: 4, h: 4 }); ctx._sh = el.querySelector('.b05-shield') || el; },
    states: (n) => n === 0 ? { mode: null, levels: { regulator: 80, safe: 8, riskPreTax: 50 } }
      : n <= 2 ? { mode: 'DIF3RestoreIncome', levels: { regulator: 80, safe: 8, riskPreTax: 50 } }
      : { mode: 'DIF3SavingContinues', levels: { regulator: 80 } },
    after(ctx, n) { if (ctx._sh) ctx._sh.classList.toggle('on', n >= 1); }
  });

  /* ---------- dif4 ---------- */
  EFA.screen('dif4', {
    title: 'Disability Insurance 101: things to consider and key questions', steps: 6,
    copy: {
      pending: LES_PEND,
      h1: 'Things to Consider', a: 'How individual, government and employer-sponsored plans differ',
      h2: 'Key Questions', b: 'How much is the total benefit?', c: 'How long is the waiting period before benefits begin?', d: 'How long will benefits be paid?',
      btn: 'Remaining Income Potential',
      disc: 'Benefit amounts, waiting periods and benefit periods vary by policy. Government and employer plans have their own rules and limits.',
      _notes: 'Not all disability coverage is equal. Three questions tell you what a plan is really worth.\n\n- Ask: Do you know what your coverage at work would pay you, starting when, and for how long?\nPAUSE\n\n- The button opens Remaining Income Potential, to put a number on the income at stake.'
    },
    render(ctx) {
      ctx._mode = undefined;
      if (!lesReady()) { ctx.el.innerHTML = `<p class="st-small" style="position:absolute;left:110px;top:420px">${ctx.t('pending')}</p>`; return; }
      const B = EFA.lib.bullets, o = { boxed: true, size: 34, gap: 14, text: 'b05-lbt' };
      ctx.el.innerHTML = `<div class="b05-lp">${ctx.t('h1', { tag: 'h2' })}
          ${B.list(ctx, [{ html: ctx.t('a'), at: 1 }], o)}
          <h3 class="b05-h3b b05-f" data-s="2">${ctx.t('h2')}</h3>
          ${B.list(ctx, [{ html: ctx.t('b'), at: 3 }, { html: ctx.t('c'), at: 4 }, { html: ctx.t('d'), at: 5 }], o)}
          ${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer', attrs: 'style="margin:22px 0 0"' })}
        </div>
        <button type="button" class="st-pill b05-lbtn b05-f" data-s="5" data-go>${ctx.t('btn')}</button>
        <div class="b05-chair on">${chairArt()}</div>`;
      ctx.pem = lesPem(ctx, { regulator: 80, safe: 70, riskPreTax: 60, showBorrowed: true, borrow: 0, showQP: false }, false);
      const el = ctx.pem.place(shieldGold(), { left: 2.8, top: 6.8, w: 4, h: 4 }); const sh = el.querySelector('.b05-shield') || el; sh.classList.add('on');
      ctx.on(ctx.$('[data-go]'), 'click', () => ctx.jump('IPR', 'ip1'));
    },
    step(ctx, n) {
      if (!ctx.pem) return;
      EFA.lib.bullets.reveal(ctx, n);
      ctx.$$('[data-s]').forEach((el) => ctx.show(el, n >= +el.dataset.s));
      lesApply(ctx, { mode: 'DIF4FinalState', levels: { regulator: 80, safe: 70, riskPreTax: 60 } });
    }
  });

  /* ==== END OF SCREENS ==== */
})();
