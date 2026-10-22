/* Module b02: Budget Builder (BB), Buy Term Invest the Difference (BTID), Capital Equivalent Value (CEV),
   Circle of Knowledge (COK) and Club vs. Swing (CVS).
   Screen structure, sequence and math follow the phase-1 specs; drawings and wording are new.
   Engines exposed: EFA.engines.btid (btid1.md) and EFA.engines.cev (cev4.md CEV, RATE solver, TVM). */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt;
  const esc = EFA.util.esc;
  const editing = () => !!(EFA.edit && EFA.edit.on);

  /* =====================================================================
     Styles (BTID screens and the shared pieces)
     ===================================================================== */
  EFA.css('b02', `
  .b02-head { position: absolute; left: 0; right: 0; top: 34px; display: grid; justify-items: center; gap: 12px; text-align: center; padding: 0 150px; pointer-events: none; }
  .b02-head > * { pointer-events: auto; }
  .b02-head .st-h1 { font-size: 58px; }
  .b02-head.sm .st-h1 { font-size: 50px; }
  .b02-head.xs { top: 18px; gap: 8px; }
  .b02-head.xs .st-h1 { font-size: 46px; }
  .b02-card { background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 14px 34px rgba(13,30,58,.08); box-sizing: border-box; }
  .b02-panel { background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 14px; box-shadow: 0 10px 26px rgba(13,30,58,.07); padding: 20px 28px; box-sizing: border-box; font: 500 25px/1.42 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-panel p { margin: 0; }
  .b02-v { font-weight: 700; color: #0d1e3a; white-space: nowrap; }
  .b02-link { display: inline-flex; align-items: center; gap: 10px; background: none; border: 0; padding: 4px 0; cursor: pointer; font: 700 16px/1.1 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6e22; border-bottom: 1.5px dotted rgba(138,110,34,.6); }
  .b02-link:hover { color: #0d1e3a; border-bottom-color: #0d1e3a; }
  .b02-link svg { flex: 0 0 auto; }
  .b02-disc { position: absolute; left: 110px; bottom: 14px; width: 1120px; display: grid; gap: 2px; }
  .b02-disc p { margin: 0; font-size: 13.5px; line-height: 1.4; }
  .b02-pill2 { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 6px 18px; border-radius: 999px; background: #fffdf8; color: #0d1e3a; border: 1.5px solid #0d1e3a; font: 600 16px/1.1 "DM Sans", sans-serif; cursor: pointer; transition: background .2s ease, color .2s ease, border-color .2s ease; box-sizing: border-box; }
  .b02-pill2:hover { background: #b8972e; border-color: #b8972e; color: #0d1e3a; }
  .b02-dot { width: 22px; height: 22px; border-radius: 50%; border: 0; padding: 0; background: radial-gradient(circle at 35% 30%, #2b4c80, #0d1e3a 70%); box-shadow: 0 2px 6px rgba(13,30,58,.3); cursor: pointer; vertical-align: middle; margin-left: 12px; flex: 0 0 auto; }
  .b02-dot:hover { background: radial-gradient(circle at 35% 30%, #d5bd68, #b8972e 70%); }
  .b02-fade { transition: opacity .8s ease; }
  .b02-fade.is-off { transition-duration: .3s; }
  .b02-fade0.is-off { transition-duration: 0s; }
  .b02-wait { display: inline-flex; align-items: center; justify-content: center; font: 600 15px/1.3 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #667389; border: 1px dashed #cbd5e3; border-radius: 999px; padding: 6px 14px; background: rgba(255,253,248,.7); }
  .b02-dartw { display: inline-block; flex: 0 0 auto; }
  .b02-dartw svg { display: block; width: 100%; height: auto; }

  /* modal dialogs that close only through their own buttons */
  .b02-modal { position: absolute; inset: 0; z-index: 36; background: rgba(13,30,58,.40); display: grid; place-items: center; animation: scr-in .2s ease both; }
  .b02-modal-in { background: #fffdf8; border-radius: 16px; border: 1px solid #d6cfc4; box-shadow: 0 30px 80px rgba(8,20,42,.35); overflow: hidden; display: grid; max-height: 840px; }
  .b02-modal-h { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #0d1e3a; color: #f7f5f1; padding: 18px 26px; font: 600 30px/1.1 "Cormorant Garamond", Georgia, serif; }
  .b02-modal-x { width: 40px; height: 40px; border-radius: 999px; border: 1px solid rgba(247,245,241,.4); background: transparent; color: #f7f5f1; font: 400 26px/1 "DM Sans", sans-serif; cursor: pointer; }
  .b02-modal-x:hover { background: #b8972e; border-color: #b8972e; color: #0d1e3a; }
  .b02-modal-b { padding: 24px 28px 8px; display: grid; gap: 16px; font: 400 20px/1.5 "DM Sans", sans-serif; color: #0d1e3a; overflow: auto; }
  .b02-modal-b p { margin: 0; }
  .b02-modal-f { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 18px 28px 24px; }
  .b02-modal-f.end { justify-content: flex-end; }
  .b02-mrow { display: grid; grid-template-columns: 1fr 210px; align-items: center; gap: 16px; }
  .b02-mrow > label, .b02-mrow > .lb { font: 600 19px/1.2 "DM Sans", sans-serif; color: #0d1e3a; display: flex; align-items: center; }
  .b02-err { color: #b3402e; font: 600 16px/1.3 "DM Sans", sans-serif; min-height: 21px; }
  .b02-chooser .st-overlay-in { width: 640px; }
  .b02-chooser .st-overlay-b { display: grid; gap: 12px; padding: 26px 30px 30px; }
  .b02-chooser .st-pill { width: 100%; justify-content: flex-start; padding-left: 22px; font-size: 19px; min-height: 52px; }
  .b02-src .st-overlay-in { width: 780px; }
  .b02-src .st-overlay-b { font: 400 20px/1.55 "DM Sans", sans-serif; color: #0d1e3a; display: grid; gap: 14px; padding: 26px 32px 30px; }
  .b02-src .st-overlay-b p { margin: 0; }

  /* ---------- btid1 ---------- */
  .b02-form { position: absolute; left: 350px; width: 900px; top: 126px; padding: 10px 36px 12px; display: grid; }
  .b02-frow { display: grid; grid-template-columns: 1fr 230px; align-items: center; gap: 18px; min-height: 50px; border-bottom: 1px solid rgba(13,30,58,.09); }
  .b02-frow .st-field { gap: 0; }
  .b02-frow .st-input, .b02-tt .st-input { height: 42px; text-align: right; font-size: 21px; }
  .b02-flab { font: 700 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; display: flex; align-items: center; }
  .b02-tax { padding: 8px 0 8px; border-bottom: 1px solid rgba(13,30,58,.09); display: grid; gap: 7px; }
  .b02-tt { display: grid; grid-template-columns: 170px 1fr 170px; align-items: center; gap: 26px; text-align: center; }
  .b02-tt .cap { font: 700 15px/1.2 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #667389; }
  .b02-tt .big { font: 600 30px/1.1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b02-tt .mid { font: 700 18px/1.2 "DM Sans", sans-serif; color: #0d1e3a; letter-spacing: .04em; }
  .b02-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; border-radius: 999px; outline: none; margin: 0; cursor: pointer;
    background: linear-gradient(to right, #b8972e 0, #b8972e var(--p, 100%), #cbd5e3 var(--p, 100%), #cbd5e3 100%); }
  .b02-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 34px; height: 34px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #2b4c80, #0d1e3a 72%); border: 4px solid #fffdf8; box-shadow: 0 3px 10px rgba(13,30,58,.35); }
  .b02-slider::-moz-range-thumb { width: 28px; height: 28px; border-radius: 50%; background: #0d1e3a; border: 4px solid #fffdf8; box-shadow: 0 3px 10px rgba(13,30,58,.35); }
  .b02-chk { display: inline-flex; align-items: center; gap: 14px; cursor: pointer; font: 700 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-chk input { appearance: none; -webkit-appearance: none; width: 28px; height: 28px; border-radius: 7px; border: 2px solid #0d1e3a; background: #fff; margin: 0; display: grid; place-items: center; cursor: pointer; flex: 0 0 auto; }
  .b02-chk input:checked { background: #0d1e3a; }
  .b02-chk input:checked::after { content: ""; width: 7px; height: 13px; border: solid #d5bd68; border-width: 0 3px 3px 0; transform: translateY(-2px) rotate(45deg); }
  .b02-frow .st-pill, .b02-frow .b02-pill2 { width: 230px; }
  .b02-hidden { visibility: hidden; }
  .b02-pv { position: absolute; inset: 0; }
  .b02-pv-l { position: absolute; left: 110px; width: 600px; top: 70px; padding: 30px 34px; display: grid; gap: 16px; }
  .b02-pv-l .b02-frow { grid-template-columns: 1fr 220px; }
  .b02-pv-r { position: absolute; left: 790px; width: 600px; top: 70px; display: grid; gap: 16px; justify-items: center; }
  .b02-ptab { width: 100%; height: 600px; overflow: auto; border-radius: 12px; border: 1px solid #d6cfc4; background: #fffdf8; box-shadow: 0 10px 26px rgba(13,30,58,.07); }
  .b02-ptab .st-table th { position: sticky; top: 0; z-index: 1; font-size: 14px; }
  .b02-ptab .st-table td { cursor: pointer; font-size: 20px; padding: 10px 22px; }
  .b02-ptab .st-table th:first-child, .b02-ptab .st-table td:first-child { text-align: center; width: 120px; }
  .b02-ptab .st-table th:last-child { padding-right: 22px; }
  .b02-ptab .st-table tbody tr:hover td { background: #f0e6c4; }
  .b02-ptab .st-table tr.sel td { background: #d5bd68 !important; font-weight: 700; }
  .b02-hint { font: 500 17px/1.45 "DM Sans", sans-serif; color: #667389; margin: 0; }

  /* ---------- btid2: the big number ---------- */
  .b02-stmt { position: absolute; left: 160px; width: 1280px; top: 34px; padding: 20px 40px; text-align: center; font: 600 28px/1.42 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-stmt p { margin: 0; }
  .b02-sphere { position: absolute; display: grid; place-items: center; }
  .b02-sphere svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .b02-sphere .val { position: relative; font: 700 80px/1 "DM Sans", sans-serif; color: #0d1e3a; letter-spacing: -.01em; }
  .b02-bot { position: absolute; left: 160px; width: 1280px; top: 716px; padding: 18px 40px; text-align: center; font: 600 28px/1.35 "DM Sans", sans-serif; color: #0d1e3a; }

  /* ---------- cost pies (btid3, 4, 7, 8, 9, 10) ---------- */
  .b02-pie { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; overflow: visible; pointer-events: none; }
  .b02-pie path.sl { pointer-events: auto; stroke: #f7f5f1; stroke-width: 3; stroke-linejoin: round; transition: filter .2s ease; }
  .b02-pie path.sl:hover { filter: brightness(1.07) saturate(1.05); }
  .b02-boxes { position: absolute; left: 860px; width: 580px; display: flex; flex-direction: column; justify-content: space-evenly; }
  .b02-box { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 0 26px; border-radius: 12px; box-shadow: 0 8px 20px rgba(13,30,58,.10); box-sizing: border-box; border: 1px solid rgba(13,30,58,.06); }
  .b02-box .v { font: 700 30px/1 "DM Sans", sans-serif; white-space: nowrap; display: inline-flex; align-items: center; }
  .b02-box .l { font: 700 15px/1.2 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; text-align: right; }
  .b02-box .ast { margin-left: 12px; border: 0; background: #0d1e3a; color: #d5bd68; width: 30px; height: 30px; border-radius: 50%; font: 700 20px/32px "DM Sans", sans-serif; padding: 0; cursor: pointer; }
  .b02-box .ast:hover { background: #fffdf8; color: #0d1e3a; }
  .b02-box.focus { box-shadow: 0 12px 28px rgba(138,110,34,.28); }
  .b02-tip { position: absolute; z-index: 25; pointer-events: none; background: #0d1e3a; color: #f7f5f1; border-radius: 10px; padding: 10px 16px; font: 600 16px/1.3 "DM Sans", sans-serif; letter-spacing: .04em; box-shadow: 0 12px 26px rgba(8,20,42,.3); opacity: 0; transition: opacity .15s ease; white-space: nowrap; }
  .b02-tip.on { opacity: 1; }
  .b02-tip .tv { display: block; font: 700 22px/1.2 "DM Sans", sans-serif; color: #d5bd68; }

  /* ---------- btid5 / btid6 ---------- */
  .b02-qa { position: absolute; left: 240px; width: 1120px; top: 92px; display: grid; gap: 20px; }
  .b02-q { display: grid; grid-template-columns: 64px 1fr; gap: 22px; align-items: center; }
  .b02-q .b02-panel { font-size: 26px; font-weight: 600; }
  .b02-a { height: 84px; display: grid; place-items: center; padding-left: 86px; }
  .b02-a > div { background: linear-gradient(135deg, #f7efd6, #f0e6c4); border: 1px solid #d5bd68; border-radius: 14px; padding: 14px 34px; font: 600 26px/1.3 "DM Sans", sans-serif; color: #0d1e3a; box-shadow: 0 10px 24px rgba(138,110,34,.16); text-align: center; }
  .b02-b6row { position: absolute; left: 208px; width: 1184px; top: 318px; display: grid; grid-template-columns: 112px 1fr; gap: 34px; align-items: center; }
  .b02-b6row .b02-panel { font-size: 30px; line-height: 1.45; font-weight: 500; padding: 30px 40px; }
  .b02-b6bot { position: absolute; left: 0; right: 0; top: 640px; text-align: center; font: 500 46px/1.15 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; padding: 0 140px; }
  .b02-b6bot .em { display: block; margin-top: 8px; font: 600 76px/1.05 "Cormorant Garamond", Georgia, serif; color: #b8972e; }

  /* ---------- btid11: side-by-side summary ---------- */
  .b02-l-head { cursor: pointer; }
  .b02-l-head:hover { color: #8a6e22; }
  .b02-tabs { position: absolute; left: 160px; width: 1280px; top: 128px; height: 58px; }
  .b02-tab { position: absolute; bottom: 0; width: 300px; height: 56px; display: flex; align-items: center; justify-content: center; padding: 0 18px; box-sizing: border-box; border-radius: 14px 14px 0 0; background: #fffdf8; border: 1px solid #d6cfc4; border-bottom: 0; font: 700 23px/1 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; white-space: nowrap; overflow: hidden; }
  .b02-tab:hover { color: #8a6e22; }
  .b02-tab.t1 { box-shadow: inset 0 4px 0 #2b4c80; }
  .b02-tab.t2 { box-shadow: inset 0 4px 0 #b8972e; }
  .b02-tab > span { overflow: hidden; text-overflow: ellipsis; }
  .b02-star { position: absolute; bottom: 10px; width: 30px; height: 30px; border-radius: 50%; border: 0; padding: 0; background: #0d1e3a; color: #d5bd68; font: 700 20px/32px "DM Sans", sans-serif; cursor: pointer; }
  .b02-star:hover { background: #b8972e; color: #0d1e3a; }
  .b02-ledger { position: absolute; left: 160px; width: 1280px; padding: 6px 0; }
  .b02-lrow { display: grid; grid-template-columns: 333px 1fr 333px; align-items: center; min-height: 50px; border-bottom: 1px solid rgba(13,30,58,.07); }
  .b02-lrow:last-child { border-bottom: 0; }
  .b02-lcell { padding: 0 36px; text-align: right; font: 700 28px/1 "DM Sans", sans-serif; color: #0d1e3a; display: flex; justify-content: flex-end; align-items: center; gap: 14px; min-height: 44px; }
  .b02-lcell .neg { color: #b3402e; }
  .b02-lcell .b02-amt { transition: opacity .8s ease; }
  .b02-lcell .b02-amt.is-off { transition-duration: 0s; opacity: 0; pointer-events: none; }
  .b02-llab { text-align: center; font: 700 22px/1.2 "DM Sans", sans-serif; color: #2b4c80; cursor: pointer; user-select: none; display: flex; align-items: center; justify-content: center; gap: 16px; }
  .b02-llab:hover { color: #8a6e22; }
  .b02-lrow.on .b02-llab { color: #0d1e3a; }
  .b02-lrow.tot { background: rgba(227,232,240,.45); }
  .b02-ledger.tots .b02-lrow { min-height: 54px; }
  .b02-type { border: 1.5px solid #b8972e; background: #f0e6c4; color: #0d1e3a; border-radius: 8px; font: 700 15px/1 "DM Sans", sans-serif; letter-spacing: .1em; padding: 7px 10px; cursor: pointer; margin-right: auto; }
  .b02-type:hover { background: #d5bd68; }
  .b02-acct2 { cursor: pointer; border-bottom: 2px dotted rgba(184,151,46,.75); }
  .b02-acct2-in { width: 210px; height: 44px; border: 1.5px solid #b8972e; border-radius: 10px; text-align: right; padding: 0 12px; font: 700 24px/1 "DM Sans", sans-serif; color: #0d1e3a; box-shadow: 0 0 0 3px rgba(184,151,46,.2); outline: none; }
  .b02-arrow { width: 74px; height: 30px; flex: 0 0 auto; display: block; }
  .b02-llab .arr { transition: opacity .5s ease; display: inline-flex; }
  .b02-diffv { color: #8a6e22; }
  .b02-ctrl { position: absolute; right: 160px; top: 706px; display: flex; align-items: center; gap: 28px; }
  `);

  /* =====================================================================
     Small helpers
     ===================================================================== */
  const money = (v) => F.money(v);
  const cents = (v) => F.money(v, { dp: 2 });
  /** a number set into running text: DM Sans bold, never breaks */
  const nv = (s, cls) => `<span class="num b02-v${cls ? ' ' + cls : ''}">${esc(s)}</span>`;
  /** percent as entered: 0.08 -> "8%", 0.0725 -> "7.25%" */
  const pctTxt = (f) => `${+(f * 100).toFixed(2)}%`;
  /** a sentence made of copy keys and numbers: parts are copy keys (strings) or {v: 'text', cls}.
      No space goes before a part that starts with punctuation. */
  function sentence(ctx, parts) {
    let out = '';
    parts.forEach((p, i) => {
      const isKey = typeof p === 'string';
      const txt = isKey ? ctx.text(p) : String(p.v);
      const html = isKey ? ctx.t(p) : nv(p.v, p.cls);
      if (i > 0 && !/^[,.;:!?)]/.test(txt)) out += ' ';
      out += html;
    });
    return out;
  }
  /** heading block, top centre, with the gold rule */
  function head(ctx, key, o) {
    o = o || {};
    return `<div class="b02-head ${o.cls || ''}">${ctx.t(key, { tag: 'h1', cls: 'st-h1' + (o.h1cls ? ' ' + o.h1cls : ''), attrs: o.attrs || '' })}<hr class="st-rule"></div>`;
  }

  /* ---- visit-scoped state: survives re-renders and a round-trip jump, cleared when the screen is left ---- */
  const VISIT = {};
  function visit(ctx, init) {
    let v = VISIT[ctx.id];
    if (!v) v = VISIT[ctx.id] = { s: init(), jumping: false };
    v.jumping = false;
    return v.s;
  }
  function visitLeave(ctx) {
    const id = ctx.id;
    setTimeout(() => {
      const v = VISIT[id]; if (!v || v.jumping) return;
      const cur = EFA.player && EFA.player.def;
      if (!cur || cur.id !== id) delete VISIT[id];
    }, 0);
  }
  /** jump to another presentation; this screen's visit state is kept for the automatic return */
  function visitJump(ctx, key, screenId) {
    const v = VISIT[ctx.id];
    const before = EFA.player.stack.length;
    if (v) v.jumping = true;
    ctx.jump(key, screenId);
    if (EFA.player.stack.length === before && v) v.jumping = false; // the jump did not happen
  }

  /* ---- modal dialog that closes only through its own buttons (Escape and arrow keys are held) ---- */
  function modal(ctx, o) {
    const m = document.createElement('div');
    m.className = 'b02-modal' + (o.cls ? ' ' + o.cls : '');
    m.innerHTML = `<div class="b02-modal-in" style="width:${o.width || 580}px">${o.title ? `<div class="b02-modal-h"><span>${o.title}</span>${o.x ? '<button type="button" class="b02-modal-x" aria-label="Close">&times;</button>' : ''}</div>` : ''}<div class="b02-modal-b">${o.body || ''}</div>${o.foot ? `<div class="b02-modal-f ${o.footCls || ''}">${o.foot}</div>` : ''}</div>`;
    ctx.el.appendChild(m);
    const block = (e) => {
      if (!document.body.contains(m)) { document.removeEventListener('keydown', block, true); return; }
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (/^(ArrowRight|ArrowLeft|PageDown|PageUp| |Spacebar|Backspace|Home|End|Escape)$/.test(e.key)) { e.stopPropagation(); e.preventDefault(); }
    };
    document.addEventListener('keydown', block, true);
    m.close = () => { document.removeEventListener('keydown', block, true); m.remove(); };
    const x = m.querySelector('.b02-modal-x'); if (x) x.addEventListener('click', () => { if (!editing()) m.close(); });
    EFA.numify(m);
    if (editing()) EFA.edit.arm(m);
    return m;
  }
  /** Esc-closable chooser of buttons: items [{label (html), fn}] */
  function chooser(ctx, titleHtml, items) {
    const ov = ctx.overlay({ title: titleHtml, cls: 'b02-chooser', html: items.map((it, i) => `<button type="button" class="st-pill" data-i="${i}">${it.label}</button>`).join('') });
    ov.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => { if (editing()) return; const it = items[+b.dataset.i]; ov.close(); it.fn(); }));
    return ov;
  }
  /** number parsing per the base-screen spec: keep digits, "." and spaces; "-", "$-" or an en dash make it negative */
  function parseNum(s, dp) {
    let t = String(s == null ? '' : s).trim();
    const neg = /^(-|\$-|–|\$–)/.test(t);
    t = t.replace(/[^0-9. ]/g, '').replace(/\s+/g, '');
    if (t === '' || t === '.') return 0;
    let v = parseFloat(t);
    if (!isFinite(v)) return 0;
    if (t.indexOf('.') >= 0) v = +v.toFixed(dp == null ? 2 : dp);
    return neg ? -v : v;
  }
  /** wire a screen-local input: select on focus, Enter commits, parse and format on blur */
  function wireNumInput(inp, o) {
    inp.addEventListener('focus', () => { inp.value = o.raw ? o.raw(o.get()) : String(o.get()); inp.select(); });
    inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
    inp.addEventListener('blur', () => { o.set(parseNum(inp.value, o.dp)); inp.value = o.fmt(o.get()); });
  }

  /* =====================================================================
     Shared components (EFA.lib, docs/components.md). Every call is guarded:
     a library that has not loaded shows a quiet "being set up" state.
     ===================================================================== */
  const has = (name, fn) => { const L = EFA.lib && EFA.lib[name]; return !!(L && (!fn || typeof L[fn] === 'function')); };
  const WAIT = 'This tool is still being set up in the library.';
  function notReady(ctx) { ctx.toast(ctx.text('x.wait') || WAIT); }
  /** compliance lines (EFA.lib.disclosure topics) plus this screen's own note; falls back to the screen's copy */
  function discBlock(ctx, topics, own, style) {
    let lib = '';
    if (topics && topics.length) {
      lib = has('disclosure', 'line') ? EFA.lib.disclosure.line(topics, { style: 'margin:0' })
        : `<p class="st-disclaimer">${topics.map((t) => ctx.t('fb.' + t)).join(' ')}</p>`;
    }
    const mine = own ? `<p class="st-disclaimer">${ctx.t(own)}</p>` : '';
    return `<div class="b02-disc" ${style ? `style="${style}"` : ''}>${mine}${lib}</div>`;
  }
  /** fallback compliance wording, shown only while EFA.lib.disclosure is not loaded */
  const FB = {
    'fb.hypothetical': 'Hypothetical illustration only. It is not a guarantee or a projection of any specific product, and actual results will vary.',
    'fb.guarantees': 'Guarantees are backed by the claims-paying ability of the issuing insurer.',
    'fb.tax': 'Death benefits are income-tax-free.',
    'fb.loans': 'Policy loans and withdrawals reduce cash value and death benefit and may cause the policy to lapse.',
    'x.wait': WAIT
  };
  /** every screen's copy starts with the fallback lines */
  const withFB = (copy) => Object.assign({}, FB, copy);
  /** historic inflation opener (EFA.lib.inflation.link) */
  function infLink(ctx, opts) {
    if (has('inflation', 'link')) return EFA.lib.inflation.link(ctx, opts);
    return '<button type="button" class="b02-dot" data-b02wait="1" aria-label="Historic inflation rates"></button>';
  }
  /** worksheet overlay (EFA.lib.worksheet.open) */
  function openSheet(ctx, data) {
    if (has('worksheet', 'open')) { try { return EFA.lib.worksheet.open(ctx, data); } catch (e) { console.error(e); } }
    notReady(ctx); return null;
  }
  /** dart bullet glyph (EFA.lib.bullets.dart) */
  function dart(size) {
    const inner = has('bullets', 'dart') ? EFA.lib.bullets.dart({ size }) : '';
    return `<span class="b02-dartw" style="width:${size}px;height:${Math.round(size * 66 / 90)}px">${inner}</span>`;
  }
  /** wire the placeholders above (only used while a library is missing) */
  function wireWaits(ctx) { ctx.on(ctx.$$('[data-b02wait]'), 'click', () => notReady(ctx)); }
  const sheetIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>';

  /* =====================================================================
     BTID engine (btid1.md, Calculations). Exposed as EFA.engines.btid.
     Client facts shared with other presentations use the original case-data keys.
     ===================================================================== */
  const BTID_NS = 'btid1';
  const BTID_DEF = {
    currentAge: 42, yearsContribution: 30, yearsAccumulation: 30, initialBalance: 88000, annualContribution: 6000,
    contribInflation: 0, totalROR: 0, pctCapitalGain: 0, pctOrdinary: 1, cgBracket: 0.15, ordinaryBracket: 0.30,
    termYears: 20, faceValue: 250000
  };
  const BTID_CASE = {
    currentAge: 'case_file_current_age', initialBalance: 'case_file_accumulated_savings', annualContribution: 'case_file_annual_savings',
    ordinaryBracket: 'case_file_ror_taxes', termYears: 'term_years_of_coverage', faceValue: 'term_face_value'
  };
  const PREM_KEY = 'case_file_term_premium_list';
  /** keep the premium schedule exactly n long: new entries copy the one before, extras are dropped */
  function sizePremiums(list, n) {
    const out = Array.isArray(list) ? list.slice(0, Math.max(0, n)) : [];
    while (out.length < n) out.push(out.length ? out[out.length - 1] : 400);
    return out;
  }
  const amountOf = (x) => (x && typeof x === 'object' ? +x.amount : +x);
  function btidGet(k) {
    if (BTID_CASE[k] && has('caseData', 'get')) {
      const v = EFA.lib.caseData.get(BTID_CASE[k], undefined);
      if (v != null && isFinite(v)) return +v;
    }
    const v = EFA.clients.get(BTID_NS, 'f.' + k, BTID_DEF[k]);
    return v != null && isFinite(v) ? +v : BTID_DEF[k];
  }
  function btidSet(k, v) {
    EFA.clients.set(BTID_NS, 'f.' + k, v);
    if (BTID_CASE[k] && has('caseData', 'set')) EFA.lib.caseData.set(BTID_CASE[k], v);
  }
  function premGet() {
    let list = null;
    if (has('caseData', 'get')) list = EFA.lib.caseData.get(PREM_KEY, null);
    if (!Array.isArray(list)) list = EFA.clients.get(BTID_NS, 'premiums', null);
    if (!Array.isArray(list)) list = Array(20).fill(400);
    return list.map(amountOf).map((x) => (isFinite(x) ? x : 0));
  }
  function premSet(list) {
    const clean = list.map((x) => Math.round(x));
    EFA.clients.set(BTID_NS, 'premiums', clean);
    if (has('caseData', 'set')) EFA.lib.caseData.set(PREM_KEY, clean.map((amount) => ({ amount })));
  }
  function btidRead() {
    const termYears = Math.max(0, Math.round(btidGet('termYears')));
    return {
      A: Math.round(btidGet('currentAge')), N: Math.max(1, Math.round(btidGet('yearsAccumulation'))), K: Math.max(0, Math.round(btidGet('yearsContribution'))),
      B0: btidGet('initialBalance'), C: btidGet('annualContribution'), g: btidGet('contribInflation'), r: btidGet('totalROR'),
      po: btidGet('pctOrdinary'), pc: btidGet('pctCapitalGain'), tO: btidGet('ordinaryBracket'), tG: btidGet('cgBracket'),
      P: sizePremiums(premGet(), termYears), T: !!EFA.clients.get(BTID_NS, 'includeTerm', true), INV: !!EFA.clients.get(BTID_NS, 'payFromInvestment', false),
      face: btidGet('faceValue'), termYears
    };
  }
  function btidRun(I) {
    const { A, N, K, B0, C, g, r, po, pc, tO, tG, P, T, INV, face } = I;
    const K2 = Math.min(K, N);
    const prem = (y) => (y < P.length ? P[y] : 0);
    const contrib = (y) => (y === 0 ? (K2 > 0 ? B0 + C : B0) : (y < K2 ? C * Math.pow(1 + g, y) : 0));
    const ideal = [], life = [], inv = [], termSide = [];
    // 1. ideal investment: no taxes, no costs
    let bal = 0, cumC = 0, cumI = 0;
    for (let y = 0; y < N; y++) {
      const c = contrib(y); cumC += c; bal += c; const start = bal; const i = bal * r; cumI += i; bal += i;
      ideal.push({ age: A + y, year: y + 1, contrib: c, cumContrib: cumC, start, interest: i, cumInterest: cumI, end: bal });
    }
    // 2. lifestyle investment: taxes and premiums paid from outside the account
    bal = 0; let cg = 0, tf = 0, cum2 = 0, dpi = 0;
    for (let y = 0; y < N; y++) {
      const c = contrib(y); cum2 += c;
      const pShown = T ? prem(y) : 0, indP = (T && !INV) ? prem(y) : 0;
      bal += c; const start = bal;
      const oe = bal * r * po, ce = bal * r * pc, ot = oe * tO, indT = INV ? 0 : ot;
      bal += oe + ce;
      const d = c + indP + indT; dpi += d; cg += ce; tf += c + oe;
      const cgt = y === N - 1 ? cg * tG : 0;
      life.push({ age: A + y, year: y + 1, contrib: c, cumContrib: cum2, premium: pShown, indirectPremium: indP, start, ordE: oe, cgE: ce, ordTax: ot, indirectTax: indT, end: bal, dpi: d, cumDpi: dpi, cgDollars: cg, taxFree: tf, cgTax: cgt, afterCG: tf + cg - cgt });
    }
    // 3. investment account: taxes and premiums paid from the account
    bal = 0; cg = 0; let cum3 = 0, cumP = 0, cumOT = 0, cumTx = 0;
    for (let y = 0; y < N; y++) {
      const c = contrib(y); cum3 += c; const p = T ? prem(y) : 0; cumP += p;
      bal += c - p; const start = bal;
      const oe = bal * r * po, ce = bal * r * pc, ot = oe * tO; cumOT += ot;
      bal += oe + ce - ot; cg += ce;
      const tfd = bal - cg, cgt = y === N - 1 ? cg * tG : 0; cumTx += ot + cgt;
      inv.push({ age: A + y, year: y + 1, contrib: c, cumContrib: cum3, premium: p, cumPremium: cumP, start, ordE: oe, cgE: ce, ordTax: ot, cumOrdTax: cumOT, end: bal, cgDollars: cg, taxFree: tfd, cgTax: cgt, afterCG: tfd + cg - cgt, cumTaxes: cumTx });
    }
    // 4 / 5. what the taxes would have earned (a tax paid in year y starts earning in year y + 1)
    const side = (taxes) => { let f = 0, co = 0, ct = 0; return taxes.map((t, y) => { const s = f, o = f * r; co += o; ct += t; f += o + t; return { age: A + y, year: y + 1, start: s, opp: o, cumOpp: co, tax: t, cumTax: ct, end: f }; }); };
    const taxSide = side(life.map((x) => x.indirectTax));
    const ocTax = side(inv.map((x) => x.ordTax));
    // 6 / 7. premiums at opportunity
    { let f = 0, cp = 0, ce = 0; for (let y = 0; y < N; y++) { const p = T ? prem(y) : 0; cp += p; f += p; const s = f, e = f * r; ce += e; f += e; termSide.push({ age: A + y, year: y + 1, premium: p, cumPremium: cp, start: s, earn: e, cumEarn: ce, end: f }); } }
    const ocTerm = termSide.map((x) => Object.assign({}, x));
    // 8. premiums at opportunity against the face value (safety cap of 500 years)
    let vsFace = [], gtFaceAmount = 0, gtFaceYear = 0;
    if (T && face > 0 && r > 0 && P.some((p) => p > 0)) {
      let f = 0, cp = 0, ce = 0;
      for (let m = 0; m < 500; m++) {
        const p = prem(m); cp += p; f += p; const s = f, e = f * r; ce += e; f += e;
        vsFace.push({ age: A + m, year: m + 1, premium: p, cumPremium: cp, start: s, earn: e, cumEarn: ce, end: f });
        if (f >= face) { gtFaceAmount = f; gtFaceYear = m + 1; break; }
      }
      if (!gtFaceYear) vsFace = [];
    }
    const n = N - 1, S = INV ? inv : life;
    const sum = {
      idealFinal: ideal[n].end, invested: ideal[n].cumContrib,
      ordTaxes: INV ? inv[n].cumOrdTax : taxSide[n].cumTax,
      oppOnTax: INV ? ocTax[n].cumOpp : taxSide[n].cumOpp,
      termPremiums: INV ? ocTerm[n].cumPremium : termSide[n].cumPremium,
      oppOnTerm: INV ? ocTerm[n].cumEarn : termSide[n].cumEarn,
      cgTaxes: INV ? inv[n].cgTax : life[n].cgTax,
      gtFaceAmount, gtFaceYear
    };
    let l = S.findIndex((x) => x.ordTax > C); if (l < 0) l = n;
    sum.beatYear = l + 1; sum.beatAmount = S[l].ordTax;
    return { inputs: I, ideal, life, inv, taxSide, ocTax, termSide, ocTerm, vsFace, sum };
  }
  EFA.engines = EFA.engines || {};
  EFA.engines.btid = { defaults: BTID_DEF, caseKeys: BTID_CASE, premiumKey: PREM_KEY, read: btidRead, run: btidRun, current: () => btidRun(btidRead()), sizePremiums };

  /* =====================================================================
     BTID wording shared by every BTID screen (one place to edit): worksheet titles and
     columns, cost names, "Documentation". Registered as a pseudo-screen, like EFA.lib's words.
     ===================================================================== */
  const BTW = '_b02_btid';
  const BT_COPY = {
    docs: 'Documentation', docPick: 'Choose a Worksheet',
    'ws.ideal': 'Ideal Investment', 'ws.life': 'Lifestyle Investment', 'ws.inv': 'Investment Account', 'ws.taxSide': 'Tax Side Fund',
    'ws.termSide': 'Term Insurance Side Fund', 'ws.ocTax': 'Opportunity Cost of Taxes', 'ws.ocTerm': 'Opportunity Cost of Term', 'ws.vsFace': 'Premiums vs. Face Value',
    'c.age': 'Age', 'c.year': 'Year', 'c.contrib': 'Contribution', 'c.cumContrib': 'Cumulative Contribution', 'c.start': 'Start Balance',
    'c.interest': 'Interest', 'c.cumInterest': 'Cumulative Interest', 'c.end': 'End Balance', 'c.prem': 'Term Premium',
    'c.indPrem': 'Indirect Contribution for Premium', 'c.ordE': 'Ordinary-Taxable Earnings', 'c.cgE': 'Capital-Gain Earnings',
    'c.ordTax': 'Ordinary Tax Paid', 'c.indTax': 'Indirect Contribution for Tax', 'c.dpi': 'Direct + Indirect Contribution',
    'c.cumDpi': 'Cumulative Direct + Indirect', 'c.cumCg': 'Cumulative Capital-Gain Dollars', 'c.cgDollars': 'Capital-Gain Dollars',
    'c.taxFree': 'Already-Taxed Dollars', 'c.cgTax': 'Capital-Gain Tax', 'c.afterCG': 'Balance After Capital-Gain Tax',
    'c.cumPrem': 'Cumulative Premiums', 'c.cumOrdTax': 'Cumulative Ordinary Tax', 'c.cumTaxes': 'Cumulative Taxes',
    'c.startFund': 'Start Fund', 'c.opp': 'Opportunity Earnings', 'c.cumOpp': 'Cumulative Opportunity Earnings',
    'c.taxLife': 'Ordinary Tax Paid from Lifestyle', 'c.taxInv': 'Ordinary Tax Paid from Investment', 'c.endFund': 'End Fund',
    'c.premLife': 'Premium Paid from Lifestyle', 'c.premPaid': 'Premium Paid', 'c.earn': 'Earnings', 'c.cumEarn': 'Cumulative Earnings',
    'k.total': 'total', 'k.invested': 'invested', 'k.net': 'total less expenses', 'k.ordTax': 'ordinary income tax',
    'k.oppTax': 'opportunity on tax', 'k.prem': 'term premiums', 'k.oppTerm': 'opportunity on term', 'k.cgTax': 'capital gains tax'
  };
  EFA.screen(BTW, { title: 'BTID shared wording (worksheets and cost names)', copy: BT_COPY, render(ctx) { ctx.el.innerHTML = ''; } });
  const BT = { t: (key, o) => EFA.cp(BTW, key, o), text: (key) => EFA.wording.get(BTW, key, BT_COPY[key]) };

  /** the eight BTID worksheets (btid1.md, Outputs) as EFA.lib.worksheet objects */
  function btidSheet(R, which) {
    const m = (field, key) => ({ field, header: BT.t(key), type: 'money', dp: 2 });
    const age = { field: 'age', header: BT.t('c.age'), type: 'age', width: 70 }, year = { field: 'year', header: BT.t('c.year'), type: 'year', width: 70 };
    const SH = {
      ideal: ['ws.ideal', R.ideal, [m('contrib', 'c.contrib'), m('cumContrib', 'c.cumContrib'), m('start', 'c.start'), m('interest', 'c.interest'), m('cumInterest', 'c.cumInterest'), m('end', 'c.end')]],
      life: ['ws.life', R.life, [m('contrib', 'c.contrib'), m('cumContrib', 'c.cumContrib'), m('premium', 'c.prem'), m('indirectPremium', 'c.indPrem'), m('start', 'c.start'), m('ordE', 'c.ordE'), m('cgE', 'c.cgE'), m('ordTax', 'c.ordTax'), m('indirectTax', 'c.indTax'), m('end', 'c.end'), m('dpi', 'c.dpi'), m('cumDpi', 'c.cumDpi'), m('cgDollars', 'c.cumCg'), m('taxFree', 'c.taxFree'), m('cgTax', 'c.cgTax'), m('afterCG', 'c.afterCG')]],
      inv: ['ws.inv', R.inv, [m('contrib', 'c.contrib'), m('cumContrib', 'c.cumContrib'), m('premium', 'c.prem'), m('cumPremium', 'c.cumPrem'), m('start', 'c.start'), m('ordE', 'c.ordE'), m('cgE', 'c.cgE'), m('ordTax', 'c.ordTax'), m('cumOrdTax', 'c.cumOrdTax'), m('end', 'c.end'), m('cgDollars', 'c.cgDollars'), m('taxFree', 'c.taxFree'), m('cgTax', 'c.cgTax'), m('afterCG', 'c.afterCG'), m('cumTaxes', 'c.cumTaxes')]],
      taxSide: ['ws.taxSide', R.taxSide, [m('start', 'c.startFund'), m('opp', 'c.opp'), m('cumOpp', 'c.cumOpp'), m('tax', 'c.taxLife'), m('cumTax', 'c.cumOrdTax'), m('end', 'c.endFund')]],
      ocTax: ['ws.ocTax', R.ocTax, [m('start', 'c.startFund'), m('opp', 'c.opp'), m('cumOpp', 'c.cumOpp'), m('tax', 'c.taxInv'), m('cumTax', 'c.cumOrdTax'), m('end', 'c.endFund')]],
      termSide: ['ws.termSide', R.termSide, [m('premium', 'c.premLife'), m('cumPremium', 'c.cumPrem'), m('start', 'c.startFund'), m('earn', 'c.earn'), m('cumEarn', 'c.cumEarn'), m('end', 'c.endFund')]],
      ocTerm: ['ws.ocTerm', R.ocTerm, [m('premium', 'c.premPaid'), m('cumPremium', 'c.cumPrem'), m('start', 'c.startFund'), m('earn', 'c.earn'), m('cumEarn', 'c.cumEarn'), m('end', 'c.endFund')]],
      vsFace: ['ws.vsFace', R.vsFace, [m('premium', 'c.premPaid'), m('cumPremium', 'c.cumPrem'), m('start', 'c.startFund'), m('earn', 'c.earn'), m('cumEarn', 'c.cumEarn'), m('end', 'c.endFund')]]
    };
    const [hk, rows, cols] = SH[which];
    return { heading: BT.t(hk), size: 'full', columns: [age].concat(cols, [year]), rows: rows.map((x) => Object.assign({}, x)), filter: 'age', disclosures: ['hypothetical', 'license'] };
  }
  /** "Documentation" link (the BTID screens' own word: several of them open a chooser first) */
  function btidDocsLink(style) {
    return `<button type="button" class="b02-link b02-docs-btn" ${style ? `style="${style}"` : ''}>${sheetIcon}${BT.t('docs')}</button>`;
  }
  const WS_KEY = { ideal: 'ws.ideal', life: 'ws.life', inv: 'ws.inv', taxSide: 'ws.taxSide', termSide: 'ws.termSide', ocTax: 'ws.ocTax', ocTerm: 'ws.ocTerm', vsFace: 'ws.vsFace' };
  function wireBtidDocs(ctx, list) {
    ctx.on(ctx.$$('.b02-docs-btn'), 'click', () => {
      const R = btidRun(btidRead()), keys = list(R);
      if (keys.length === 1) { openSheet(ctx, btidSheet(R, keys[0])); return; }
      chooser(ctx, BT.t('docPick'), keys.map((k) => ({ label: BT.t(WS_KEY[k]), fn: () => openSheet(ctx, btidSheet(btidRun(btidRead()), k)) })));
    });
  }
  const DOCS_TAX = (R) => ['ideal'].concat(R.inputs.INV ? ['inv'] : ['life', 'taxSide']);
  const DOCS_TERM = (R, termIf) => ['ideal'].concat(R.inputs.INV ? ['inv', 'ocTax'].concat(!termIf || R.inputs.T ? ['ocTerm'] : []) : ['life', 'taxSide'].concat(!termIf || R.inputs.T ? ['termSide'] : []));

  /* =====================================================================
     btid1: assumptions form, premium schedule and the premium dialog
     ===================================================================== */
  /** ctx.field bound to a shared case-data key when EFA.lib.caseData is loaded */
  function bfield(ctx, o) {
    const key = BTID_CASE[o.id];
    if (key && has('caseData', 'field')) return EFA.lib.caseData.field(ctx, Object.assign({ key }, o));
    return ctx.field(o);
  }
  EFA.screen('btid1', {
    title: 'Buy term and invest the difference: assumptions',
    copy: withFB({
      head: 'Your Starting Assumptions',
      'l.age': 'Current Age', 'l.yoc': 'Years of Contribution', 'l.yoa': 'Years of Accumulation', 'l.bal': 'Initial Balance',
      'l.contrib': 'Annual Contribution', 'l.infl': 'Inflate Contributions by', 'l.ror': 'Total Rate of Return',
      't.cg': 'Capital Gain', 't.treat': 'Tax Treatment', 't.ord': 'Ordinary', 't.bracket': 'Tax Bracket',
      'l.term': 'Include Term Insurance', 'b.prem': 'Premiums',
      'pay.both': 'Taxes and term premiums are paid from', 'pay.tax': 'Taxes are paid from',
      'b.life': 'Lifestyle', 'b.inv': 'Investment',
      'pv.title': 'Term Insurance Details', 'l.cov': 'Years of Coverage', 'l.face': 'Policy Face Value',
      'pv.enter': 'Enter Premiums', 'col.period': 'Period', 'col.prem': 'Premium', 'b.ret': 'Return',
      'pv.hint': 'Click any period to change its premium. Actual premiums come from a carrier quote.',
      'dlg.title': 'Edit Premium', 'dlg.amt': 'Amount', 'dlg.per': '# of Periods', 'dlg.infl': 'Inflate Rate',
      'b.cancel': 'Cancel', 'b.enter': 'Enter',
      own: 'The rate of return is a fixed, hypothetical assumption, and the term premiums are illustrative; actual premiums come from carrier quotes.',
      _notes: 'Everything that follows is built from these numbers, so set them with the client, not for them.\n\n- Ask: If you set this money aside every year, what return do you honestly expect to earn on it, through the good years and the bad ones?\nPAUSE\n\n- Lifestyle means the tax bill and the premiums come out of the household budget. Investment means they come out of the account itself.'
    }),
    render(ctx) {
      const V = visit(ctx, () => ({ view: 'form', sel: -1, periods: null }));
      const inc = !!ctx.mem('includeTerm', true), inv = !!ctx.mem('payFromInvestment', false);
      const fid = (id) => `f-${ctx.id}-${id}`;
      const lab = (key, id) => ctx.t(key, { tag: 'label', cls: 'b02-flab', attrs: `for="${fid(id)}"` });
      const row = (key, f, extra) => `<div class="b02-frow"><span class="b02-flab">${lab(key, f.id)}${extra || ''}</span>${bfield(ctx, f)}</div>`;
      const D = BTID_DEF;
      const ord = btidGet('pctOrdinary');
      ctx.el.innerHTML = `
        <div class="b02-view-form b02-fade">
          ${head(ctx, 'head', { cls: 'sm' })}
          <div class="b02-form b02-card">
            ${row('l.age', { id: 'currentAge', type: 'int', value: D.currentAge, min: 0, max: 120 })}
            ${row('l.yoc', { id: 'yearsContribution', type: 'int', value: D.yearsContribution, min: 0, max: 100 })}
            ${row('l.yoa', { id: 'yearsAccumulation', type: 'int', value: D.yearsAccumulation, min: 1, max: 100 })}
            ${row('l.bal', { id: 'initialBalance', type: 'money', value: D.initialBalance })}
            ${row('l.contrib', { id: 'annualContribution', type: 'money', value: D.annualContribution })}
            ${row('l.infl', { id: 'contribInflation', type: 'pct', value: D.contribInflation, dp: 2 }, `<span style="margin-left:14px;display:inline-flex">${infLink(ctx, { field: 'contribInflation', instance: 'contribInflation' })}</span>`)}
            ${row('l.ror', { id: 'totalROR', type: 'pct', value: D.totalROR, dp: 2, min: 0, max: 0.12 })}
            <div class="b02-tax">
              <div class="b02-tt">${ctx.t('t.cg', { cls: 'cap' })}${ctx.t('t.treat', { cls: 'big' })}${ctx.t('t.ord', { cls: 'cap' })}</div>
              <div class="b02-tt">${ctx.field({ id: 'pctCapitalGain', type: 'pct', value: D.pctCapitalGain, dp: 0, min: 0, max: 1 })}
                <input type="range" class="b02-slider" min="0" max="100" step="1" value="${Math.round(ord * 100)}" style="--p:${Math.round(ord * 100)}%" aria-label="Ordinary share of the return">
                ${ctx.field({ id: 'pctOrdinary', type: 'pct', value: D.pctOrdinary, dp: 0, min: 0, max: 1 })}</div>
              <div class="b02-tt">${ctx.field({ id: 'cgBracket', type: 'pct', value: D.cgBracket, dp: 2, min: 0, max: 1 })}${ctx.t('t.bracket', { cls: 'mid' })}${bfield(ctx, { id: 'ordinaryBracket', type: 'pct', value: D.ordinaryBracket, dp: 2, min: 0, max: 1 })}</div>
            </div>
            <div class="b02-frow"><label class="b02-chk"><input type="checkbox" class="b02-inc" ${inc ? 'checked' : ''}>${ctx.t('l.term')}</label>
              <button type="button" class="st-pill b02-premb ${inc ? '' : 'b02-hidden'}">${ctx.t('b.prem')}</button></div>
            <div class="b02-frow" style="border-bottom:0">
              <span class="b02-flab">${ctx.t('pay.both', { cls: 'pb', attrs: inc ? '' : 'style="display:none"' })}${ctx.t('pay.tax', { cls: 'pt', attrs: inc ? 'style="display:none"' : '' })}</span>
              <button type="button" class="b02-pill2 b02-pay">${ctx.t('b.life', { cls: 'pl', attrs: inv ? 'style="display:none"' : '' })}${ctx.t('b.inv', { cls: 'pi', attrs: inv ? '' : 'style="display:none"' })}</button>
            </div>
          </div>
          ${discBlock(ctx, ['hypothetical'], 'own')}
        </div>
        <div class="b02-pv b02-view-prem b02-fade is-off">
          <div class="b02-pv-l b02-card">
            ${ctx.t('pv.title', { tag: 'h2', cls: 'st-h3' })}
            <div class="b02-frow">${lab('l.cov', 'termYears')}${bfield(ctx, { id: 'termYears', type: 'int', value: D.termYears, min: 0, max: 100 })}</div>
            <div class="b02-frow" style="border-bottom:0">${lab('l.face', 'faceValue')}${bfield(ctx, { id: 'faceValue', type: 'money', value: D.faceValue, min: 0 })}</div>
            ${ctx.t('pv.hint', { tag: 'p', cls: 'b02-hint' })}
          </div>
          <div class="b02-pv-r">
            ${ctx.t('pv.enter', { tag: 'h2', cls: 'st-h3' })}
            <div class="b02-ptab"><table class="st-table"><thead><tr><th>${ctx.t('col.period')}</th><th>${ctx.t('col.prem')}</th></tr></thead><tbody class="b02-ptb"></tbody></table></div>
            <button type="button" class="st-pill b02-ret" style="min-width:200px">${ctx.t('b.ret')}</button>
          </div>
        </div>`;
      wireWaits(ctx);
      const termYears = () => Math.max(0, Math.round(btidGet('termYears')));
      const prems = () => sizePremiums(premGet(), termYears());
      if (V.periods == null) V.periods = termYears();
      premSet(prems()); // the schedule always matches the coverage years on open
      const fillTable = () => {
        ctx.$('.b02-ptb').innerHTML = prems().map((p, i) => `<tr data-i="${i}" class="${i === V.sel ? 'sel' : ''}"><td class="num">${i + 1}</td><td class="num">${money(p)}</td></tr>`).join('');
      };
      fillTable();
      const setView = (v) => { V.view = v; ctx.show('.b02-view-form', v === 'form'); ctx.show('.b02-view-prem', v === 'prem'); };
      setView(V.view);

      /* input rules, applied when a field is committed */
      const val = (id) => ctx.values()[id];
      const put = (id, v) => { ctx.setField(id, v); btidSet(id, v); };
      const after = (id, fn) => { const inp = ctx.$(`#${fid(id)}`); if (inp) inp.addEventListener('blur', () => setTimeout(fn, 0)); return inp; };
      const slider = ctx.$('.b02-slider');
      const setSlider = (o) => { const p = Math.round(o * 100); slider.value = p; slider.style.setProperty('--p', p + '%'); };
      after('yearsContribution', () => { const k = Math.max(0, Math.round(val('yearsContribution'))); put('yearsContribution', k); if (val('yearsAccumulation') < k) put('yearsAccumulation', k); });
      after('yearsAccumulation', () => {
        const n = Math.max(1, Math.round(val('yearsAccumulation')));
        if (val('yearsContribution') > n) put('yearsContribution', n);
        put('yearsAccumulation', n); put('termYears', n);
        premSet(sizePremiums(premGet(), n)); V.sel = -1; fillTable();
      });
      after('currentAge', () => put('currentAge', Math.max(0, Math.round(val('currentAge')))));
      after('pctCapitalGain', () => { const c = Math.min(1, Math.max(0, val('pctCapitalGain'))); put('pctCapitalGain', c); put('pctOrdinary', 1 - c); setSlider(1 - c); });
      after('pctOrdinary', () => { const o = Math.min(1, Math.max(0, val('pctOrdinary'))); put('pctOrdinary', o); put('pctCapitalGain', 1 - o); setSlider(o); });
      after('termYears', () => { const n = Math.max(0, Math.round(val('termYears'))); put('termYears', n); premSet(sizePremiums(premGet(), n)); V.sel = -1; fillTable(); });
      ['initialBalance', 'annualContribution', 'faceValue', 'ordinaryBracket', 'contribInflation', 'totalROR', 'cgBracket'].forEach((id) => after(id, () => btidSet(id, val(id))));
      let slT = null;
      slider.addEventListener('input', () => {
        slider.style.setProperty('--p', slider.value + '%');
        clearTimeout(slT);
        slT = ctx.timeout(() => { const o = +slider.value / 100; put('pctOrdinary', o); put('pctCapitalGain', 1 - o); }, 300);
      });
      slider.addEventListener('keydown', (e) => e.stopPropagation());
      /* rate of return: capped at 12 while typing; the investment disclosure opens on the first touch of each visit */
      const ror = ctx.$(`#${fid('totalROR')}`);
      ror.addEventListener('input', () => { if (parseNum(ror.value) > 12) ror.value = '12'; });
      if (has('disclosure', 'guard')) EFA.lib.disclosure.guard(ctx, 'totalROR');
      /* term insurance switch, premiums view, pay-from toggle */
      ctx.on(ctx.$('.b02-inc'), 'change', (e, n) => {
        const on = n.checked; ctx.remember('includeTerm', on);
        ctx.$('.b02-premb').classList.toggle('b02-hidden', !on);
        ctx.$('.pb').style.display = on ? '' : 'none'; ctx.$('.pt').style.display = on ? 'none' : '';
      });
      ctx.on(ctx.$('.b02-premb'), 'click', () => setView('prem'));
      ctx.on(ctx.$('.b02-ret'), 'click', () => setView('form'));
      ctx.on(ctx.$('.b02-pay'), 'click', () => {
        const now = !ctx.mem('payFromInvestment', false); ctx.remember('payFromInvestment', now);
        ctx.$('.pl').style.display = now ? 'none' : ''; ctx.$('.pi').style.display = now ? '' : 'none';
      });
      /* premium rows open the edit dialog */
      ctx.on(ctx.$('.b02-ptb'), 'click', (e) => {
        const tr = e.target.closest('tr[data-i]'); if (!tr) return;
        V.sel = +tr.dataset.i; fillTable();
        premDialog(ctx, V, prems, fillTable, termYears);
      });
    },
    leave(ctx) { visitLeave(ctx); }
  });

  function premDialog(ctx, V, prems, fillTable, termYears) {
    const i0 = V.sel, list = prems();
    const st = { amt: list[i0] || 0, per: V.periods == null ? termYears() : V.periods, inf: 0 };
    const m = modal(ctx, {
      title: ctx.t('dlg.title'), width: 580,
      body: `<div class="b02-mrow">${ctx.t('dlg.amt', { tag: 'label' })}<input class="st-input b02-d-amt" inputmode="decimal" autocomplete="off" style="text-align:right"></div>
        <div class="b02-mrow">${ctx.t('dlg.per', { tag: 'label' })}<input class="st-input b02-d-per" inputmode="numeric" autocomplete="off" style="text-align:right"></div>
        <div class="b02-mrow"><span class="lb">${ctx.t('dlg.infl')}<span style="margin-left:12px;display:inline-flex">${infLink(ctx, { instance: 'premium', onUse: (rate) => { st.inf = +(rate * 100).toFixed(2); m.querySelector('.b02-d-inf').value = F.num(st.inf, 2) + '%'; } })}</span></span><input class="st-input b02-d-inf" inputmode="decimal" autocomplete="off" style="text-align:right"></div>`,
      foot: `<button type="button" class="b02-pill2 b02-d-no">${ctx.t('b.cancel')}</button><button type="button" class="st-pill b02-d-ok" style="min-width:150px">${ctx.t('b.enter')}</button>`
    });
    const q = (s) => m.querySelector(s);
    m.querySelectorAll('[data-b02wait]').forEach((b) => b.addEventListener('click', () => notReady(ctx)));
    const amt = q('.b02-d-amt'), per = q('.b02-d-per'), inf = q('.b02-d-inf');
    wireNumInput(amt, { get: () => st.amt, set: (v) => { st.amt = Math.max(0, v); }, fmt: money, raw: (v) => String(Math.round(v)) });
    wireNumInput(per, { get: () => st.per, set: (v) => { st.per = Math.max(1, Math.round(v)); }, fmt: (v) => F.int(v), raw: (v) => String(v), dp: 0 });
    wireNumInput(inf, { get: () => st.inf, set: (v) => { st.inf = v; }, fmt: (v) => F.num(v, 2) + '%', raw: (v) => String(v) });
    amt.value = money(st.amt); per.value = F.int(st.per); inf.value = F.num(st.inf, 2) + '%';
    q('.b02-d-no').addEventListener('click', () => { if (!editing()) m.close(); });
    q('.b02-d-ok').addEventListener('click', () => {
      if (editing()) return;
      [amt, per, inf].forEach((x) => { if (document.activeElement === x) x.blur(); });
      const n = termYears(), out = prems();
      let i = i0, a = st.amt; const end = i0 + st.per;
      do { if (i < out.length) out[i] = a; a *= 1 + st.inf / 100; i += 1; } while (i < n && i < end);
      premSet(out); V.periods = st.per; fillTable(); m.close();
    });
    setTimeout(() => amt.focus(), 30);
  }

  /* =====================================================================
     btid2: the big number on a gold sphere
     ===================================================================== */
  function sphereSvg(size) {
    const id = 'b02sp' + Math.random().toString(36).slice(2, 7), r = size / 2;
    return `<svg viewBox="0 0 ${size} ${size + 40}" aria-hidden="true">
      <defs>
        <radialGradient id="${id}g" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="#fbf4dc"/><stop offset=".28" stop-color="${P.goldLt}"/><stop offset=".72" stop-color="${P.gold}"/><stop offset="1" stop-color="${P.goldDeep}"/></radialGradient>
        <radialGradient id="${id}s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgba(13,30,58,.22)"/><stop offset="1" stop-color="rgba(13,30,58,0)"/></radialGradient>
      </defs>
      <ellipse cx="${r}" cy="${size + 18}" rx="${r * 0.78}" ry="20" fill="url(#${id}s)"/>
      <circle cx="${r}" cy="${r}" r="${r - 2}" fill="url(#${id}g)"/>
      <circle cx="${r}" cy="${r}" r="${r - 16}" fill="none" stroke="#fffdf8" stroke-opacity=".28" stroke-width="2"/>
      <ellipse cx="${r * 0.66}" cy="${r * 0.48}" rx="${r * 0.34}" ry="${r * 0.2}" transform="rotate(-32 ${r * 0.66} ${r * 0.48})" fill="#fffdf8" opacity=".32"/>
    </svg>`;
  }
  EFA.screen('btid2', {
    title: 'The big number at first glance',
    copy: withFB({
      'a.start': 'Start with', 'a.make': ', make', 'a.make0': 'Make', 'a.contrib': 'yearly contributions of',
      'a.rise': 'that rise each year,', 'a.level': 'that stay level,', 'a.grow': 'growing at', 'a.end': 'a year, and the result looks quite impressive.',
      'b.a': 'At first glance,', 'b.b': 'put in seems to have produced', 'b.c': '.',
      _notes: 'This is the number most people picture when they hear "invest the difference": no taxes, no costs, nothing taken out along the way.\n\n- Ask: Looking at this, how much do you think it really cost you to get here?\nPAUSE\n\n- The next few screens subtract the costs one at a time.'
    }),
    render(ctx) {
      const R = btidRun(btidRead()), s = R.sum, I = R.inputs;
      const top = (I.B0 > 0 ? ['a.start', { v: money(I.B0) }, 'a.make'] : ['a.make0'])
        .concat([{ v: F.int(I.K) }, 'a.contrib', { v: money(I.C) }, I.g > 0 ? 'a.rise' : 'a.level', 'a.grow', { v: pctTxt(I.r) }, 'a.end']);
      ctx.el.innerHTML = `
        <div class="b02-stmt b02-panel"><p>${sentence(ctx, top)}</p></div>
        <div class="b02-sphere" style="left:555px;top:170px;width:490px;height:490px">${sphereSvg(490)}<span class="val num" style="font-size:${Math.min(80, Math.round(410 / (money(s.idealFinal).length * 0.5)))}px">${esc(money(s.idealFinal))}</span></div>
        <div class="b02-bot b02-panel"><p>${sentence(ctx, ['b.a', { v: money(s.invested) }, 'b.b', { v: money(s.idealFinal) }, 'b.c'])}</p></div>
        ${btidDocsLink('position:absolute;right:160px;top:806px')}
        ${discBlock(ctx, ['hypothetical'])}`;
      wireBtidDocs(ctx, () => ['ideal']);
    }
  });

  /* =====================================================================
     Cost pies: btid3, btid4, btid7, btid8, btid9, btid10 (btid3.md layout)
     The new cost on each screen is the gold slice, pulled out; earlier costs settle into quiet tones.
     ===================================================================== */
  const ROLE = {
    net: { fill: P.navy, bg: P.navy, ink: P.cream },
    invested: { fill: P.navy4, bg: P.navy4, ink: P.cream },
    tax: { fill: P.steel, bg: P.steel, ink: P.navy },
    opp: { fill: P.mist2, bg: P.mist2, ink: P.navy },
    prem: { fill: P.goldPale, bg: P.goldPale, ink: P.navy },
    total: { bg: P.paper, ink: P.navy },
    focus: { fill: 'url(#b02pg)', bg: `linear-gradient(135deg, ${P.goldLt}, ${P.gold})`, ink: P.navy }
  };
  const SLICE = {
    invested: { role: 'invested', val: (s) => s.invested, k: 'k.invested' },
    ordTax: { role: 'tax', val: (s) => s.ordTaxes, k: 'k.ordTax' },
    oppTax: { role: 'opp', val: (s) => s.oppOnTax, k: 'k.oppTax' },
    prem: { role: 'prem', val: (s) => s.termPremiums, k: 'k.prem' },
    oppTerm: { role: 'opp', val: (s) => s.oppOnTerm, k: 'k.oppTerm' },
    cgTax: { role: 'tax', val: (s) => s.cgTaxes, k: 'k.cgTax' },
    net: { role: 'net', val: null, k: 'k.net' },
    total: { role: 'total', val: (s) => s.idealFinal, k: 'k.total' }
  };
  /** cfg: {slices:[keys in pie order], focus, boxes(R) -> keys, stmt(ctx, R, net) -> html, docs(R) -> keys, ast(R) -> bool, own} */
  function costPie(ctx, cfg) {
    const R = btidRun(btidRead()), s = R.sum;
    const costs = cfg.slices.filter((k) => k !== 'invested' && k !== 'net');
    const net = s.idealFinal - s.invested - costs.reduce((a, k) => a + SLICE[k].val(s), 0);
    const value = (k) => (k === 'net' ? net : SLICE[k].val(s));
    const roleOf = (k) => ROLE[k === cfg.focus ? 'focus' : SLICE[k].role];
    const cx = 480, cy = 488, r = 262;
    const slices = cfg.slices.map((k) => ({ key: k, value: Math.max(0, value(k)), explode: k === cfg.focus ? 30 : 0 }));
    const total = slices.reduce((a, x) => a + x.value, 0);
    let paths = '';
    if (total > 0) {
      const geo = A.pie({ cx, cy, r, slices: slices.filter((x) => x.value > 0) });
      paths = geo.paths.map((p) => `<path class="sl" data-k="${p.key}" d="${p.d}" fill="${roleOf(p.key).fill}"/>`).join('');
    }
    const boxes = cfg.boxes(R);
    const bh = boxes.length <= 4 ? 82 : boxes.length <= 6 ? 70 : 62;
    const colH = Math.min(640, boxes.length * (bh + 30));
    const box = (k) => {
      const ro = k === 'total' ? ROLE.total : roleOf(k);
      const ast = k === 'oppTerm' && cfg.ast && cfg.ast(R) ? '<button type="button" class="ast" aria-label="Premiums compared with the face amount">*</button>' : '';
      return `<div class="b02-box ${k === cfg.focus ? 'focus' : ''}" data-k="${k}" style="height:${bh}px;background:${ro.bg};color:${ro.ink};${k === 'total' ? 'border:1.5px solid #d6cfc4;' : ''}">
        <span class="v"><span class="num">${esc(money(value(k)))}</span>${ast}</span>${BT.t(SLICE[k].k, { cls: 'l' })}</div>`;
    };
    ctx.el.innerHTML = `
      <div class="b02-stmt b02-panel">${cfg.stmt(ctx, R, net)}</div>
      <svg class="b02-pie" viewBox="0 0 1600 900"><defs><linearGradient id="b02pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset="1" stop-color="${P.gold}"/></linearGradient>
        <radialGradient id="b02psh" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="rgba(13,30,58,.16)"/><stop offset="1" stop-color="rgba(13,30,58,0)"/></radialGradient></defs>
        <circle cx="${cx}" cy="${cy + 14}" r="${r + 24}" fill="url(#b02psh)"/>${paths}</svg>
      <div class="b02-boxes" style="top:${498 - colH / 2}px;height:${colH}px">${boxes.map(box).join('')}${btidDocsLink('align-self:flex-end')}</div>
      <div class="b02-tip"><span class="tv num"></span><span class="tn"></span></div>
      ${discBlock(ctx, ['hypothetical'], cfg.own)}`;
    // hover: the slice's value with cents and its name
    const tip = ctx.$('.b02-tip');
    ctx.$$('.b02-pie path.sl').forEach((p) => {
      p.addEventListener('mousemove', (e) => {
        const rect = ctx.el.getBoundingClientRect(), k = p.dataset.k;
        const x = (e.clientX - rect.left) * 1600 / rect.width, y = (e.clientY - rect.top) * 900 / rect.height;
        tip.querySelector('.tv').textContent = cents(value(k));
        tip.querySelector('.tn').textContent = BT.text(SLICE[k].k);
        tip.style.left = (x + 18) + 'px'; tip.style.top = (y + 14) + 'px'; tip.classList.add('on');
      });
      p.addEventListener('mouseleave', () => tip.classList.remove('on'));
    });
    wireBtidDocs(ctx, cfg.docs);
    return R;
  }
  const pieNotes = (point, q) => `${point}\n\n- Ask: ${q}\nPAUSE\n\n- Hover a slice for its exact value. Documentation shows the year-by-year math.`;

  EFA.screen('btid3', {
    title: 'Invested versus gain',
    copy: withFB({
      a: 'It looks as if', b: 'of after-tax money produced', c: 'of growth.',
      _notes: pieNotes('Split the big number into what went in and what it grew into. Every dollar that went in was a dollar you had already paid tax on.', 'Does that growth look like it came free?')
    }),
    render(ctx) {
      costPie(ctx, {
        slices: ['invested', 'net'], focus: 'net', boxes: () => ['total', 'invested', 'net'],
        stmt: (c, R, net) => `<p>${sentence(c, ['a', { v: money(R.sum.invested) }, 'b', { v: money(net) }, 'c'])}</p>`,
        docs: () => ['ideal']
      });
    }
  });

  EFA.screen('btid4', {
    title: 'Ordinary income tax',
    copy: withFB({
      'l.a': 'Your true outlay was', 'l.b': 'in contributions plus', 'l.c': 'in yearly taxes paid from your household budget, for a gain of', 'l.d': '.',
      'i.a': 'Paying each year\'s tax bill out of the account reduced it by', 'i.b': 'along the way.',
      _notes: pieNotes('Every year the account earns, the tax bill follows. Those taxes are part of what this result really cost.', 'Where did the money for those tax bills come from?')
    }),
    render(ctx) {
      costPie(ctx, {
        slices: ['ordTax', 'invested', 'net'], focus: 'ordTax', boxes: () => ['total', 'ordTax', 'invested', 'net'],
        stmt: (c, R, net) => `<p>${R.inputs.INV ? sentence(c, ['i.a', { v: money(R.sum.ordTaxes) }, 'i.b'])
          : sentence(c, ['l.a', { v: money(R.sum.invested) }, 'l.b', { v: money(R.sum.ordTaxes) }, 'l.c', { v: money(net) }, 'l.d'])}</p>`,
        docs: DOCS_TAX
      });
    }
  });

  EFA.screen('btid7', {
    title: 'Opportunity cost of taxes',
    copy: withFB({
      a: 'Taxes are only one cost of holding this investment.', b: 'The next one is opportunity cost.',
      _notes: pieNotes('The dollars that went to taxes could have stayed invested and kept growing. That lost growth is a real cost too.', 'If those tax dollars had stayed in your account, what would they be worth today?')
    }),
    render(ctx) {
      costPie(ctx, {
        slices: ['oppTax', 'ordTax', 'invested', 'net'], focus: 'oppTax', boxes: () => ['total', 'oppTax', 'ordTax', 'invested', 'net'],
        stmt: (c) => `<p>${c.t('a')}</p><p style="color:#8a6e22">${c.t('b')}</p>`,
        docs: DOCS_TAX
      });
    }
  });

  EFA.screen('btid8', {
    title: 'Term insurance premiums',
    copy: withFB({
      a: 'After the taxes and what they could have earned, there is one more cost to count: the term insurance itself.',
      _notes: pieNotes('"Buy term" is half of the strategy, and the premiums are paid every year of coverage.', 'When the term ends, what do you have to show for those premiums?')
    }),
    render(ctx) {
      costPie(ctx, {
        slices: ['prem', 'oppTax', 'ordTax', 'invested', 'net'], focus: 'prem', boxes: () => ['total', 'prem', 'oppTax', 'ordTax', 'invested', 'net'],
        stmt: (c) => `<p>${c.t('a')}</p>`,
        docs: (R) => DOCS_TERM(R, false)
      });
    }
  });

  EFA.screen('btid9', {
    title: 'Opportunity cost of term premiums',
    copy: withFB({
      a: 'Those premiums carry an opportunity cost of their own. Every premium dollar could have been growing too.',
      'f.title': 'Premiums at Opportunity', 'f.a': 'Invested at the same rate instead, these premiums would have grown to', 'f.b': 'by year', 'f.c': ', more than the policy\'s', 'f.d': 'face amount.', 'b.close': 'Close',
      _notes: pieNotes('Premium dollars, like tax dollars, could have stayed invested.', 'If those premiums had grown at the same rate, how would they compare with the coverage they bought?')
    }),
    render(ctx) {
      const R = costPie(ctx, {
        slices: ['oppTerm', 'prem', 'oppTax', 'ordTax', 'invested', 'net'], focus: 'oppTerm', boxes: () => ['total', 'oppTerm', 'prem', 'oppTax', 'ordTax', 'invested', 'net'],
        stmt: (c) => `<p>${c.t('a')}</p>`,
        ast: (Rr) => Rr.sum.gtFaceYear > 0,
        docs: (Rr) => DOCS_TERM(Rr, false).concat(Rr.sum.gtFaceYear > 0 ? ['vsFace'] : [])
      });
      ctx.on(ctx.$$('.b02-box .ast'), 'click', () => {
        const s = R.sum;
        const m = modal(ctx, {
          title: ctx.t('f.title'), width: 700,
          body: `<p style="font-size:23px;line-height:1.5">${sentence(ctx, ['f.a', { v: money(s.gtFaceAmount) }, 'f.b', { v: F.int(s.gtFaceYear) }, 'f.c', { v: money(R.inputs.face) }, 'f.d'])}</p>`,
          foot: `<button type="button" class="st-pill" style="min-width:150px">${ctx.t('b.close')}</button>`, footCls: 'end'
        });
        m.querySelector('.st-pill').addEventListener('click', () => { if (!editing()) m.close(); });
      });
    }
  });

  EFA.screen('btid10', {
    title: 'Capital gains tax: the full cost picture',
    copy: withFB({
      a: 'One last possible cost: capital gains tax on the growth when the investment is sold.',
      own: 'Capital gains tax is modeled once, at one flat rate, on all accumulated gains in the final year, as if the investment were sold.',
      _notes: pieNotes('Here is every cost of buying term and investing the difference, next to the number we started from.', 'Now that you can see every slice, how does the real result compare with the first number we showed you?')
    }),
    render(ctx) {
      costPie(ctx, {
        slices: ['cgTax', 'oppTerm', 'prem', 'oppTax', 'ordTax', 'invested', 'net'], focus: 'cgTax',
        boxes: (R) => ['total', 'cgTax'].concat(R.inputs.T ? ['oppTerm', 'prem'] : [], ['oppTax', 'ordTax', 'invested', 'net']),
        stmt: (c) => `<p>${c.t('a')}</p>`, own: 'own',
        docs: (R) => DOCS_TERM(R, true)
      });
    }
  });

  /* =====================================================================
     btid5: three questions about taxes on reinvested earnings
     ===================================================================== */
  EFA.screen('btid5', {
    title: 'Three questions about taxes on reinvested earnings',
    steps: 4,
    copy: withFB({
      q1: 'When your investment earns money, what do most people do with those earnings?',
      a1: 'Reinvest them, so they keep compounding.',
      q2: 'Then each year those earnings create a tax bill. Which pocket pays it?',
      a2: 'Lifestyle: the household budget.',
      q3: 'In what year does that yearly tax bill grow larger than your yearly contribution?',
      'a3.a': 'By year', 'a3.b': ', the tax bill alone is', 'a3.c': 'for the year.',
      _notes: 'Walk through how the tax on reinvested earnings actually gets paid.\n\n- Ask each question and let the client answer before you click.\n- Ask: How would it feel to write a tax check bigger than what you are saving each year?\nPAUSE'
    }),
    render(ctx) {
      const s = btidRun(btidRead()).sum;
      const q = (i) => `<div class="b02-q">${dart(64)}${ctx.t('q' + i, { tag: 'div', cls: 'b02-panel' })}</div>`;
      const a = (i, html) => `<div class="b02-a"><div class="b02-fade b02-fade0" data-a="${i}">${html}</div></div>`;
      ctx.el.innerHTML = `
        <div class="b02-qa">
          <div>${q(1)}${a(1, ctx.t('a1'))}</div>
          <div>${q(2)}${a(2, ctx.t('a2'))}</div>
          <div>${q(3)}${a(3, sentence(ctx, ['a3.a', { v: F.int(s.beatYear) }, 'a3.b', { v: money(s.beatAmount) }, 'a3.c']))}</div>
        </div>
        <div class="b02-fade b02-fade0 b02-a5docs" style="position:absolute;right:160px;top:800px">${btidDocsLink()}</div>
        ${discBlock(ctx, ['hypothetical'])}`;
      wireBtidDocs(ctx, () => ['life']);
    },
    step(ctx, n) {
      [1, 2, 3].forEach((i) => ctx.show(`[data-a="${i}"]`, n >= i));
      ctx.show('.b02-a5docs', n >= 3);
    }
  });

  /* =====================================================================
     btid6: avoidable tax and opportunity cost
     ===================================================================== */
  EFA.screen('btid6', {
    title: 'Avoidable tax and opportunity cost',
    copy: withFB({
      head: 'Do Most People Pay More Tax Than They Need To?',
      panel: 'When you pay a tax you could have avoided, you lose twice: the dollar you paid, and everything that dollar would have earned for you from then on.',
      'b.a': 'That second loss has a name:', 'b.b': 'Opportunity Cost',
      _notes: 'A tax you did not have to pay costs more than the check you wrote.\n\n- Ask: If you could keep a dollar working for you instead of sending it out early, would you?\nPAUSE'
    }),
    render(ctx) {
      ctx.el.innerHTML = `
        ${head(ctx, 'head')}
        <div class="b02-b6row">${dart(112)}${ctx.t('panel', { tag: 'div', cls: 'b02-panel' })}</div>
        <div class="b02-b6bot">${ctx.t('b.a')}${ctx.t('b.b', { cls: 'em' })}</div>`;
    }
  });

  /* =====================================================================
     btid11: side-by-side summary, investment versus cash value insurance
     ===================================================================== */
  const arrowSvg = (dir) => `<svg class="b02-arrow" viewBox="0 0 74 30" aria-hidden="true"><path d="${dir < 0 ? 'M72 15H14M26 3 12 15l14 12' : 'M2 15h58M48 3l14 12-14 12'}" fill="none" stroke="${P.gold}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const TYPES = ['CV', 'SV', 'DB'];
  EFA.screen('btid11', {
    title: 'Side-by-side account summary',
    copy: withFB({
      'h.L': 'Lifestyle Account Summary', 'h.I': 'Investment Account Summary',
      tab1: 'Compound Interest', tab2: 'Cash Value Insurance',
      r1: 'Accumulation', r2: 'Less Contributions*',
      'r3.L': 'Plus Taxes Avoided', 'r3.I': 'Less Ordinary Income Tax',
      'r4.L': 'Plus Opportunity on Taxes', 'r4.I': 'Less Opportunity Cost of Taxes',
      'r5.L': 'Plus Term Premiums Avoided', 'r5.I': 'Less Term Premiums',
      'r6.L': 'Plus Opportunity on Premiums', 'r6.I': 'Less Opportunity Cost of Premiums',
      'r7.L': 'Plus Capital Gains Tax Avoided', 'r7.I': 'Less Capital Gains Tax',
      tot: 'Total (Net)', diff: 'Difference*',
      'ty.CV': 'CV', 'ty.SV': 'SV', 'ty.DB': 'DB',
      'ed.title': 'Edit Label', 'ed.lab': 'Label Text', 'ed.err': 'A name is required.', 'b.cancel': 'Cancel', 'b.save': 'Save',
      'pd.title': 'Policy Regulatory Disclosure',
      'pd.1': 'The values illustrated are not guaranteed.',
      'pd.2': 'They assume the non-guaranteed elements of the policy stay exactly as they are today for every year shown. That is unlikely, so actual results may be better or worse.',
      'pd.3': 'This page must be accompanied by the full policy illustration, including its guaranteed values.',
      'b.ok': 'Ok', 'b.reset': 'Reset',
      own: '*Both accounts receive the same contributions. Policy values come from a carrier illustration, are not guaranteed and already reflect the policy\'s charges. They are shown before any tax due on a surrender, which would also end the death benefit; the investment column reflects the taxes modeled here.',
      _notes: 'Reveal one line at a time. Each cost the investment carries is either taken from it, or, when it was paid from your lifestyle, credited to the policy as a cost it did not carry.\n\n- Click a row label to reveal it. Click the policy value to enter it from the carrier illustration (the disclosure shows first).\n- Ask: Looking at both columns, which one would you rather own at retirement?\nPAUSE\n\n- The * beside the policy tab opens the 10-minute lesson on life insurance.'
    }),
    render(ctx) {
      const V = visit(ctx, () => ({ shown: [false, false, false, false, false, false, false], totals: false, type: null, editing: false }));
      V.editing = false;
      const L = !EFA.clients.get(BTID_NS, 'payFromInvestment', false);
      const s = btidRun(btidRead()).sum;
      const lab1 = ctx.mem('account1Label', null), lab2 = ctx.mem('account2Label', null);
      const tabText = (k, custom) => (custom ? `<span>${esc(custom)}</span>` : ctx.t(k));
      const amounts = [s.ordTaxes, s.oppOnTax, s.termPremiums, s.oppOnTerm, s.cgTaxes];
      const acct2 = () => (V.type ? +ctx.mem('acct2' + V.type, 0) || 0 : 0);
      const cells = () => {
        const c = [[s.idealFinal, acct2()], [-s.invested, -s.invested]];
        amounts.forEach((a) => c.push(L ? [0, a] : [-a, 0]));
        return c;
      };
      const rowKeys = ['r1', 'r2', L ? 'r3.L' : 'r3.I', L ? 'r4.L' : 'r4.I', L ? 'r5.L' : 'r5.I', L ? 'r6.L' : 'r6.I', L ? 'r7.L' : 'r7.I'];
      const cell = (i, side) => `<div class="b02-lcell" data-c="${i}-${side}">${i === 0 && side === 1 ? `<button type="button" class="b02-type">${TYPES.map((t) => ctx.t('ty.' + t, { cls: 'ty-' + t })).join('')}</button>` : ''}<span class="b02-amt num is-off"></span></div>`;
      ctx.el.innerHTML = `
        ${head(ctx, L ? 'h.L' : 'h.I', { cls: 'sm', h1cls: 'b02-l-head', attrs: 'role="button" tabindex="0"' })}
        <div class="b02-tabs">
          <div class="b02-tab t1" data-tab="1" style="left:16px">${tabText('tab1', lab1)}</div>
          <div class="b02-tab t2" data-tab="2" style="right:16px">${tabText('tab2', lab2)}</div>
          <button type="button" class="b02-star" style="right:-24px" aria-label="Ten-minute lesson on life insurance">*</button>
        </div>
        <div class="b02-ledger b02-card" style="top:186px;border-radius:0 0 16px 16px">
          ${rowKeys.map((k, i) => `<div class="b02-lrow" data-r="${i}">${cell(i, 0)}<div class="b02-llab" data-lab="${i}">${ctx.t(k)}</div>${cell(i, 1)}</div>`).join('')}
        </div>
        <div class="b02-ledger b02-card tots" style="top:572px">
          <div class="b02-lrow tot"><div class="b02-lcell" data-t="0"><span class="b02-amt num is-off"></span></div><div class="b02-llab" data-tot="1">${ctx.t('tot')}</div><div class="b02-lcell" data-t="1"><span class="b02-amt num is-off"></span></div></div>
          <div class="b02-lrow"><div class="b02-lcell" data-d="0"><span class="b02-amt num b02-diffv is-off"></span></div><div class="b02-llab" data-diff="1"><span class="arr" data-arr="-1">${arrowSvg(-1)}</span>${ctx.t('diff')}<span class="arr" data-arr="1">${arrowSvg(1)}</span></div><div class="b02-lcell" data-d="1"><span class="b02-amt num b02-diffv is-off"></span></div></div>
        </div>
        <div class="b02-ctrl"><button type="button" class="b02-pill2 b02-reset">${ctx.t('b.reset')}</button>${btidDocsLink()}</div>
        ${discBlock(ctx, ['hypothetical', 'loans'], 'own')}`;
      const fmtV = (v) => `<span class="${v < 0 ? 'neg' : ''}">${esc(money(v))}</span>`;
      const paint = () => {
        cells().forEach(([l, r], i) => {
          const on = V.shown[i];
          const lc = ctx.$(`[data-c="${i}-0"] .b02-amt`), rc = ctx.$(`[data-c="${i}-1"] .b02-amt`);
          lc.innerHTML = fmtV(l);
          if (i === 0) { if (!V.editing) rc.innerHTML = `<span class="b02-acct2">${fmtV(r)}</span>`; } else rc.innerHTML = fmtV(r);
          lc.classList.toggle('is-off', !on); rc.classList.toggle('is-off', !on);
          ctx.$(`[data-r="${i}"]`).classList.toggle('on', on);
        });
        // totals count only the rows on show
        let t1 = (V.shown[0] ? s.idealFinal : 0) - (V.shown[1] ? s.invested : 0);
        let t2 = (V.shown[0] ? acct2() : 0) - (V.shown[1] ? s.invested : 0);
        amounts.forEach((a, j) => { if (V.shown[j + 2]) { if (L) t2 += a; else t1 -= a; } });
        const d = Math.abs(t1 - t2), leftWins = t1 > t2;
        ctx.$('[data-t="0"] .b02-amt').innerHTML = fmtV(t1); ctx.$('[data-t="1"] .b02-amt').innerHTML = fmtV(t2);
        ctx.$('[data-d="0"] .b02-amt').innerHTML = esc(money(d)); ctx.$('[data-d="1"] .b02-amt').innerHTML = esc(money(d));
        ['[data-t="0"]', '[data-t="1"]'].forEach((q) => ctx.$(q + ' .b02-amt').classList.toggle('is-off', !V.totals));
        ctx.$('[data-d="0"] .b02-amt').classList.toggle('is-off', !V.totals || !leftWins);
        ctx.$('[data-d="1"] .b02-amt').classList.toggle('is-off', !V.totals || leftWins);
        ctx.$('[data-arr="-1"]').style.opacity = V.totals && leftWins ? 1 : 0;
        ctx.$('[data-arr="1"]').style.opacity = V.totals && !leftWins ? 1 : 0;
        const tb = ctx.$('.b02-type');
        tb.style.display = V.type && V.shown[0] ? '' : 'none';
        TYPES.forEach((t) => { const e = ctx.$('.ty-' + t); if (e) e.style.display = V.type === t ? '' : 'none'; });
      };
      paint();
      // heading: switch who pays the costs; the engine reruns on render
      const toggleMode = () => { EFA.clients.set(BTID_NS, 'payFromInvestment', L); EFA.player.renderScreen({ noFade: true }); };
      ctx.on(ctx.$('.b02-l-head'), 'click', toggleMode);
      ctx.on(ctx.$('.b02-l-head'), 'keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); toggleMode(); } });
      ctx.on(ctx.$$('[data-lab]'), 'click', (e, n) => { const i = +n.dataset.lab; V.shown[i] = !V.shown[i]; V.totals = true; paint(); });
      ctx.on(ctx.$('[data-tot]'), 'click', () => { V.totals = true; paint(); });
      ctx.on(ctx.$('[data-diff]'), 'click', () => { V.shown = V.shown.map(() => true); V.totals = true; paint(); });
      ctx.on(ctx.$('.b02-reset'), 'click', () => { V.shown = V.shown.map(() => false); V.totals = false; V.type = null; V.editing = false; paint(); });
      ctx.on(ctx.$('.b02-type'), 'click', (e) => { e.stopPropagation(); V.type = TYPES[(TYPES.indexOf(V.type) + 1) % 3]; V.editing = false; paint(); });
      // the policy value: the disclosure first, then it is typed in from the carrier illustration
      ctx.on(ctx.$('[data-c="0-1"]'), 'click', (e) => {
        if (e.target.closest('.b02-type') || !V.shown[0] || V.editing) return;
        if (!V.type) {
          const m = modal(ctx, { title: ctx.t('pd.title'), width: 780, body: `${ctx.t('pd.1', { tag: 'p' })}${ctx.t('pd.2', { tag: 'p' })}${ctx.t('pd.3', { tag: 'p' })}`,
            foot: `<button type="button" class="st-pill" style="min-width:140px">${ctx.t('b.ok')}</button>`, footCls: 'end' });
          m.querySelector('.st-pill').addEventListener('click', () => { if (editing()) return; m.close(); V.type = 'CV'; paint(); });
          return;
        }
        V.editing = true;
        const amt = ctx.$('[data-c="0-1"] .b02-amt');
        amt.innerHTML = '<input class="b02-acct2-in" inputmode="decimal" autocomplete="off">';
        const inp = amt.querySelector('input'), key = 'acct2' + V.type;
        inp.value = String(Math.round(+ctx.mem(key, 0) || 0));
        inp.addEventListener('keydown', (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') inp.blur(); });
        inp.addEventListener('blur', () => { ctx.remember(key, Math.round(parseNum(inp.value, 0))); V.editing = false; paint(); });
        inp.focus(); inp.select();
      });
      // tab labels, per client
      ctx.on(ctx.$$('[data-tab]'), 'click', (e, n) => {
        const which = n.dataset.tab, mk = 'account' + which + 'Label';
        const cur = ctx.mem(mk, null) || ctx.text('tab' + which);
        const m = modal(ctx, { title: ctx.t('ed.title'), width: 620,
          body: `<label style="font:600 19px/1.2 'DM Sans',sans-serif">${ctx.t('ed.lab')}</label><input class="st-input" style="font-size:22px" autocomplete="off"><div class="b02-err"></div>`,
          foot: `<button type="button" class="b02-pill2 e-no">${ctx.t('b.cancel')}</button><button type="button" class="st-pill e-ok" style="min-width:140px">${ctx.t('b.save')}</button>` });
        const inp = m.querySelector('input'); inp.value = cur;
        inp.addEventListener('keydown', (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') m.querySelector('.e-ok').click(); });
        m.querySelector('.e-no').addEventListener('click', () => { if (!editing()) m.close(); });
        m.querySelector('.e-ok').addEventListener('click', () => {
          if (editing()) return;
          const v = inp.value.trim();
          if (!v) { m.querySelector('.b02-err').innerHTML = ctx.t('ed.err'); return; }
          ctx.remember(mk, v === ctx.text('tab' + which) ? null : v); m.close(); EFA.player.renderScreen({ noFade: true });
        });
        setTimeout(() => { inp.focus(); inp.select(); }, 30);
      });
      ctx.on(ctx.$('.b02-star'), 'click', () => visitJump(ctx, 'TMLI', 'tmli1'));
      wireBtidDocs(ctx, (R) => DOCS_TERM(R, true));
    },
    leave(ctx) { visitLeave(ctx); }
  });
  /* =====================================================================
     Styles (part B: BB, CEV, COK, CVS)
     ===================================================================== */
  EFA.css('b02b', `
  /* ---------- bb1 ---------- */
  .b02-bb-strip { position: absolute; left: 160px; width: 1280px; top: 128px; height: 74px; display: grid; grid-template-columns: 1.05fr 1fr 1.05fr; align-items: center; padding: 0 30px; gap: 40px; }
  .b02-bb-pair { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 16px; }
  .b02-bb-pair .lb { font: 700 19px/1.2 "DM Sans", sans-serif; color: #0d1e3a; white-space: nowrap; }
  .b02-bb-pair .lb.lnk { color: #8a6e22; cursor: pointer; border-bottom: 1.5px dotted rgba(138,110,34,.7); justify-self: start; }
  .b02-bb-pair .lb.lnk:hover { color: #0d1e3a; }
  .b02-bb-pair .st-input { height: 46px; text-align: right; font-size: 21px; }
  .b02-bb-pair .out { font: 700 27px/1 "DM Sans", sans-serif; color: #0d1e3a; text-align: right; }
  .b02-bb-grid { position: absolute; left: 160px; width: 1280px; top: 220px; height: 530px; display: grid; grid-template-rows: 1fr auto; overflow: hidden; }
  .b02-bb-scroll { overflow: auto; }
  .b02-bb-grid .st-table th { position: sticky; top: 0; z-index: 1; }
  .b02-bb-grid .st-table td { padding: 4px 12px; vertical-align: middle; }
  .b02-bb-grid .c-item { width: 90px; text-align: center !important; font-weight: 700; color: #667389; }
  .b02-bb-grid th.c-item { color: #f7f5f1; }
  .b02-bb-grid .c-desc { text-align: left !important; }
  .b02-bb-grid .c-amt { width: 230px; }
  .b02-bb-grid th.c-amt { padding-right: 24px; }
  .b02-bb-grid .c-del { width: 60px; text-align: center !important; }
  .b02-bb-desc { display: block; width: 100%; box-sizing: border-box; min-height: 38px; padding: 7px 10px; border-radius: 8px; border: 1.5px solid transparent; font: 500 20px/1.2 "DM Sans", sans-serif; color: #0d1e3a; background: transparent; cursor: text; text-align: left; }
  .b02-bb-desc:hover { border-color: #cbd5e3; background: #fff; }
  input.b02-bb-desc { border-color: #b8972e; background: #fff; outline: none; }
  .b02-bb-amt { height: 38px; width: 100%; box-sizing: border-box; border: 1.5px solid #cbd5e3; border-radius: 8px; background: #fff; padding: 0 12px; text-align: right; font: 600 20px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-bb-amt:focus { outline: none; border-color: #b8972e; box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .b02-del { width: 36px; height: 36px; border-radius: 50%; border: 0; background: transparent; display: grid; place-items: center; cursor: pointer; color: #667389; margin: 0 auto; }
  .b02-del:hover { background: #f0e6c4; color: #0d1e3a; }
  .b02-bb-foot { display: flex; justify-content: flex-end; align-items: center; padding: 12px 18px; border-top: 1px solid #d6cfc4; background: #fffdf8; }
  .b02-bb-res { position: absolute; left: 192px; width: 1216px; top: 768px; height: 66px; display: grid; grid-template-columns: 66px 1fr; gap: 26px; align-items: center; }
  .b02-print { width: 64px; height: 64px; border-radius: 50%; border: 0; cursor: pointer; display: grid; place-items: center; background: radial-gradient(circle at 35% 30%, #2b4c80, #0d1e3a 72%); box-shadow: 0 8px 20px rgba(13,30,58,.28); color: #f7f5f1; transition: transform .2s ease; }
  .b02-print:hover { transform: translateY(-2px); }
  .b02-bb-spend { height: 66px; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; background: #0d1e3a; color: #f7f5f1; border-radius: 14px; box-shadow: 0 12px 28px rgba(13,30,58,.18); }
  .b02-bb-spend .lb { font: 700 19px/1 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #d5bd68; }
  .b02-bb-spend .val { font: 700 36px/1 "DM Sans", sans-serif; color: #f7f5f1; }
  .b02-bb-spend .val.neg { color: #f2c2b4; }

  /* ---------- CEV story screens ---------- */
  .b02-col { position: absolute; left: 110px; width: 880px; display: flex; flex-direction: column; justify-content: center; gap: 18px; }
  .b02-col .b02-panel { font-size: 25px; line-height: 1.42; padding: 20px 30px; }
  .b02-mtn { position: absolute; left: 1030px; top: 150px; width: 460px; height: 600px; border-radius: 22px; overflow: hidden; box-shadow: 0 18px 40px rgba(13,30,58,.16); border: 1px solid #d6cfc4; background: #fffdf8; }
  .b02-mtn > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .b02-mtn .scene { transition: opacity .8s ease; }
  .b02-mtn .scene.dim { opacity: .1; }
  .b02-march { stroke-dasharray: 1 19; animation: b02-march 1s linear infinite; }
  @keyframes b02-march { to { stroke-dashoffset: -20; } }
  .b02-mtn .ln { transition: opacity .8s ease; }
  .b02-mtn .ln.is-off { opacity: 0; transition-duration: .3s; }
  .b02-vlab { position: absolute; transform-origin: 50% 50%; font: 700 19px/1 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #0d1e3a; white-space: nowrap; }
  .b02-vlab.gold { color: #8a6e22; font-size: 18px; letter-spacing: .14em; }
  .b02-srcl { position: absolute; left: 1030px; width: 460px; top: 766px; text-align: center; }
  .b02-focus { display: grid; gap: 14px; justify-items: center; }
  .b02-focus .pr { font: 600 25px/1.3 "DM Sans", sans-serif; color: #0d1e3a; text-align: center; }
  .b02-fboxes { display: grid; grid-template-columns: 1fr auto 1fr; gap: 18px; align-items: center; width: 100%; }
  .b02-fbox { border: 3px solid #0d1e3a; border-radius: 12px; padding: 12px 16px; text-align: center; background: #fff; display: grid; gap: 4px; }
  .b02-fbox .t { font: 700 23px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-fbox .s { font: 600 16px/1.2 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #8a6e22; }
  .b02-or { font: italic 600 28px/1 "Cormorant Garamond", Georgia, serif; color: #667389; }
  .b02-lists { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 30px; margin-top: 12px; }
  .b02-li { display: flex; align-items: center; gap: 12px; font: 700 21px/1.25 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-apples { position: absolute; left: 1050px; top: 260px; width: 440px; height: 380px; border-radius: 22px; overflow: hidden; background: #fffdf8; border: 1px solid #d6cfc4; box-shadow: 0 18px 40px rgba(13,30,58,.14); }
  .b02-apples svg { width: 100%; height: 100%; display: block; }
  .b02-take { position: absolute; left: 128px; width: 1344px; top: 168px; display: grid; gap: 30px; }
  .b02-take-row { display: grid; grid-template-columns: 84px 1fr; gap: 26px; align-items: center; }
  .b02-take-row .b02-panel { font-size: 25px; line-height: 1.4; font-weight: 500; padding: 20px 30px; }
  `);

  /* =====================================================================
     bb1: monthly budget builder
     ===================================================================== */
  const BB_ROWS = ['r.home', 'r.car', 'r.ins', 'r.food', 'r.clothes', 'r.gas', 'r.student', 'r.medical', 'r.net', 'r.phone', 'r.save'];
  const printIcon = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z" fill="#0d1e3a"/><path d="M9.5 16.8h5M9.5 18.8h3.5"/><circle cx="17.3" cy="11.6" r=".9" fill="currentColor" stroke="none"/></svg>';
  const trashIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
  /** a tax rate handed back by the Income Tax calculator (percent, 2 decimals): read once, then cleared */
  function takeTaxHandoff() {
    const h = EFA.handoff;
    let v = h && h.taxRate != null && isFinite(h.taxRate) ? +h.taxRate : null;
    if (h) delete h.taxRate;
    if (EFA.clients && EFA.clients.get('_handoff', 'taxRate', null) != null) EFA.clients.set('_handoff', 'taxRate', null);
    return v;
  }
  EFA.screen('bb1', {
    title: 'Monthly budget builder',
    copy: withFB({
      head: 'Your Monthly Budget Builder',
      'l.income': 'Annual Income', 'l.rate': 'Tax Rate', 'l.net': 'Monthly Net Income',
      'col.item': 'Item', 'col.desc': 'Description', 'col.amt': 'Monthly Expense',
      'r.home': 'Mortgage or rent', 'r.car': 'Car payment or ride-share', 'r.ins': 'Home and auto insurance', 'r.food': 'Food',
      'r.clothes': 'Clothes', 'r.gas': 'Gas', 'r.student': 'Student loan payment', 'r.medical': 'Medical insurance',
      'r.net': 'Internet and TV', 'r.phone': 'Phone', 'r.save': 'Savings', 'r.new': 'Expense',
      'b.add': 'Add', 'l.spend': 'Monthly Spendable Income',
      'del.title': 'Delete Item', 'del.body': 'One item is selected for deletion. Remove it from the budget?', 'b.yes': 'Yes', 'b.no': 'No',
      'rep.title': 'Monthly Budget', 'rep.income': 'Annual income', 'rep.rate': 'Tax rate', 'rep.net': 'Monthly net income', 'rep.spend': 'Monthly spendable income',
      own: 'One flat tax rate is applied to gross income as a simplification. This is a budgeting worksheet, not a tax calculation.',
      _notes: 'Start with what comes in, then let the client fill in what goes out, line by line.\n\n- Ask: When you see what is left at the end of the month, does that number match how the month actually feels?\nPAUSE\n\n- Click Tax Rate to work out an effective rate in the Income Tax calculator; Use Result brings it back here.\n- The printer opens the budget as a table you can download.'
    }),
    render(ctx) {
      const S = visit(ctx, () => ({ income: 50000, rate: 0, rows: BB_ROWS.map((k) => ({ key: k, desc: null, amt: 0 })) }));
      const back = takeTaxHandoff();
      if (back != null) S.rate = Math.round(back * 100) / 100;
      ctx.el.innerHTML = `
        ${head(ctx, 'head', { cls: 'sm' })}
        <div class="b02-bb-strip b02-card">
          <div class="b02-bb-pair">${ctx.t('l.income', { cls: 'lb', tag: 'label', attrs: 'for="bb-inc"' })}<input class="st-input" id="bb-inc" inputmode="decimal" autocomplete="off"></div>
          <div class="b02-bb-pair">${ctx.t('l.rate', { cls: 'lb lnk', attrs: 'role="button" tabindex="0"' })}<input class="st-input" id="bb-rate" inputmode="decimal" autocomplete="off"></div>
          <div class="b02-bb-pair">${ctx.t('l.net', { cls: 'lb' })}<span class="out num" id="bb-net"></span></div>
        </div>
        <div class="b02-bb-grid b02-card">
          <div class="b02-bb-scroll"><table class="st-table"><thead><tr><th class="c-item">${ctx.t('col.item')}</th><th class="c-desc">${ctx.t('col.desc')}</th><th class="c-amt">${ctx.t('col.amt')}</th><th class="c-del"></th></tr></thead><tbody class="bb-body"></tbody></table></div>
          <div class="b02-bb-foot"><button type="button" class="st-pill bb-add" style="min-width:150px">${ctx.t('b.add')}</button></div>
        </div>
        <div class="b02-bb-res">
          <button type="button" class="b02-print" aria-label="Print the budget">${printIcon}</button>
          <div class="b02-bb-spend">${ctx.t('l.spend', { cls: 'lb' })}<span class="val num" id="bb-spend"></span></div>
        </div>
        ${discBlock(ctx, null, 'own')}`;
      const net = () => S.income / 12 * (100 - S.rate) * 0.01;
      const spend = () => net() - S.rows.reduce((a, r) => a + (r.amt || 0), 0);
      const recalc = () => {
        ctx.$('#bb-net').textContent = money(net());
        const sp = spend(), el = ctx.$('#bb-spend');
        el.textContent = money(sp); el.classList.toggle('neg', sp < 0);
      };
      const inc = ctx.$('#bb-inc'), rate = ctx.$('#bb-rate');
      const rateTxt = (v) => `${F.num(v, Math.abs(v % 1) > 1e-9 ? 2 : 0)}%`;
      wireNumInput(inc, { get: () => S.income, set: (v) => { S.income = Math.round(v); recalc(); }, fmt: money, raw: (v) => String(v), dp: 0 });
      wireNumInput(rate, { get: () => S.rate, set: (v) => { S.rate = Math.round(v * 100) / 100; recalc(); }, fmt: rateTxt, raw: (v) => String(v), dp: 2 });
      inc.value = money(S.income); rate.value = rateTxt(S.rate);
      const body = ctx.$('.bb-body');
      const drawRows = () => {
        body.innerHTML = S.rows.map((r, i) => `<tr data-i="${i}">
            <td class="c-item num">${i + 1}</td>
            <td class="c-desc">${r.desc == null ? ctx.t(r.key, { cls: 'b02-bb-desc', attrs: 'data-desc="1"' }) : `<span class="b02-bb-desc" data-desc="1">${esc(r.desc)}</span>`}</td>
            <td class="c-amt"><input class="b02-bb-amt" inputmode="decimal" autocomplete="off" value="${esc(money(r.amt))}"></td>
            <td class="c-del"><button type="button" class="b02-del" aria-label="Delete this item">${trashIcon}</button></td></tr>`).join('');
        if (editing()) EFA.edit.arm(body); else EFA.numify(body);
        body.querySelectorAll('tr').forEach((tr) => {
          const r = S.rows[+tr.dataset.i];
          wireNumInput(tr.querySelector('.b02-bb-amt'), { get: () => r.amt, set: (v) => { r.amt = Math.round(v); recalc(); }, fmt: money, raw: (v) => String(v), dp: 0 });
        });
      };
      drawRows(); recalc();
      // description: click to type a label for this client's budget
      ctx.on(body, 'click', (e) => {
        const d = e.target.closest('[data-desc]');
        if (d) {
          const tr = d.closest('tr'), r = S.rows[+tr.dataset.i];
          const cur = r.desc != null ? r.desc : ctx.text(r.key);
          const inp = document.createElement('input'); inp.className = 'b02-bb-desc'; inp.value = cur; inp.autocomplete = 'off';
          d.replaceWith(inp); inp.focus(); inp.select();
          inp.addEventListener('keydown', (ev) => { ev.stopPropagation(); if (ev.key === 'Enter') inp.blur(); if (ev.key === 'Escape') { inp.value = cur; inp.blur(); } });
          inp.addEventListener('blur', () => { const v = inp.value.trim(); if (v && v !== cur) r.desc = v; drawRows(); });
          return;
        }
        const del = e.target.closest('.b02-del');
        if (del) {
          const i = +del.closest('tr').dataset.i;
          const m = modal(ctx, { title: ctx.t('del.title'), width: 580, body: ctx.t('del.body', { tag: 'p' }),
            foot: `<button type="button" class="b02-pill2 d-no" style="min-width:120px">${ctx.t('b.no')}</button><button type="button" class="st-pill d-yes" style="min-width:130px">${ctx.t('b.yes')}</button>` });
          m.querySelector('.d-no').addEventListener('click', () => { if (!editing()) m.close(); });
          m.querySelector('.d-yes').addEventListener('click', () => { if (editing()) return; S.rows.splice(i, 1); m.close(); drawRows(); recalc(); });
        }
      });
      ctx.on(ctx.$('.bb-add'), 'click', () => {
        S.rows.push({ key: 'r.new', desc: null, amt: 0 }); drawRows();
        const sc = ctx.$('.b02-bb-scroll'); sc.scrollTop = sc.scrollHeight;
      });
      // Tax Rate label: work out a rate in the Income Tax calculator, then come back with it
      const goTax = () => visitJump(ctx, 'INCTAXC', 'incTax1');
      ctx.on(ctx.$('.lb.lnk'), 'click', goTax);
      ctx.on(ctx.$('.lb.lnk'), 'keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); goTax(); } });
      // the printer: the budget as a documentation table (download from there)
      ctx.on(ctx.$('.b02-print'), 'click', () => {
        const rows = S.rows.map((r, i) => ({ item: i + 1, desc: r.desc != null ? esc(r.desc) : ctx.text(r.key), amt: r.amt }));
        openSheet(ctx, {
          heading: ctx.t('rep.title'), size: 'medium', filter: false,
          columns: [{ field: 'item', header: ctx.t('col.item'), type: 'int', align: 'center', width: 90 }, { field: 'desc', header: ctx.t('col.desc'), type: 'text' }, { field: 'amt', header: ctx.t('col.amt'), type: 'money' }],
          rows,
          assumptions: [
            { label: ctx.t('rep.income'), value: money(S.income) }, { label: ctx.t('rep.rate'), value: rateTxt(S.rate) },
            { label: ctx.t('rep.net'), value: money(net()) }, { label: ctx.t('rep.spend'), value: money(spend()) }
          ],
          disclosures: ['notAdvice', 'license']
        });
      });
    },
    leave(ctx) { visitLeave(ctx); }
  });

  /* =====================================================================
     CEV engine (cev4.md): CEV, the RATE solver (secant, as the original) and the TVM tool math.
     Exposed as EFA.engines.cev.
     ===================================================================== */
  /** RATE(n, pmt, pv, fv, type, guess): f(r) = pv(1+r)^n + pmt(1+r*type)((1+r)^n-1)/r + fv = 0 */
  function RATE(n, pmt, pv, fv, type, guess) {
    type = type || 0;
    const f = (r) => (r === 0 ? pv + pmt * n + fv : pv * Math.pow(1 + r, n) + pmt * (1 + r * type) * (Math.pow(1 + r, n) - 1) / r + fv);
    const attempt = (p) => {
      if (!(n > 0)) return null;
      let m = f(p), M = m <= 0 ? 2 * p : p / 2, D = f(M);
      for (let k = 0; k < 100; k++) {
        if (D === m) { p = M > p ? p - 1e-5 : p + 1e-5; m = f(p); if (D === m) return null; }
        const x = M - (M - p) * D / (D - m);
        if (!isFinite(x)) return null;
        const fx = f(x);
        if (!isFinite(fx)) return null;
        if (Math.abs(fx) < 1e-7) return x;
        p = M; m = D; M = x; D = fx;
      }
      return null;
    };
    let g = guess == null ? 0.1 : guess;
    for (;;) {
      const x = attempt(g);
      if (x != null) return x;
      g += 0.1;
      if (!(g < 1)) return 0;
    }
  }
  /** CEV and its required return. o: {contribution, years, taxFree, taxRate (fraction), ssIncome, swr (fraction), withdrawal, withSS} */
  function cevCalc(o) {
    const taxOnSS = Math.round(o.taxRate * o.ssIncome);
    const W = o.withdrawal + (o.withSS ? taxOnSS : 0);
    let cev = 0;
    if (o.swr) { cev = W / o.swr; if (!o.taxFree) cev = cev / (1 - o.taxRate); }
    const ror = o.swr ? RATE(Math.round(o.years), 1 - o.contribution, 0, cev, 1) : 0; // payment of (contribution - 1), as the original
    return { taxOnSS, W, cev, ror, totalInvested: o.contribution * o.years };
  }
  /** TVM tool (q = periods per year, t = 1 beginning / 0 end, rate in percent). Returns the solved value, or null. */
  function tvmSolve(st) {
    const q = st.q || 1, t = st.t, n = st.n, i = st.rate / 100 / q;
    const Fn = (i == 0) ? n : (Math.pow(1 + i, n) - 1) / i;
    let v;
    switch (st.solve) {
      case 'rate': v = Math.round(q * RATE(n, -st.pmt, -st.pv, st.fv, t, 0.1) * 100 * 100) / 100; break;
      case 'fv': v = st.pv * Math.pow(1 + i, n) + st.pmt * (1 + i * t) * Fn; break;
      case 'pv': v = (st.fv - st.pmt * (1 + i * t) * Fn) / Math.pow(1 + i, n); break;
      case 'pmt': { const den = (1 + i * t) * Fn; v = den ? (st.fv - st.pv * Math.pow(1 + i, n)) / den : 0; break; }
      case 'n': {
        if (i === 0 && st.pmt !== 0) v = (st.fv - st.pv) / st.pmt;
        else if (i <= 0) v = 0;
        else { const L = (st.pmt * (1 + i * t) + st.fv * i) / (st.pv * i + st.pmt * (1 + i * t)); v = L <= 0 ? 0 : Math.log(L) / Math.log(1 + i); }
        v = Math.round(v * 100) / 100; break;
      }
      default: v = null;
    }
    return v != null && isFinite(v) ? v : null;
  }
  EFA.engines.cev = { RATE, calc: cevCalc, tvm: tvmSolve };

  /* =====================================================================
     The mountain (cev1, cev2): drawn once in a 460 x 600 card
     ===================================================================== */
  const MTN = { S: [232, 114], L: [40, 560], R: [424, 560] };
  const ASCENT = 'M84 512 C120 470 128 420 150 380 S196 282 210 222 S228 142 232 118';
  const DESCENT = 'M232 118 C250 162 272 198 296 240 S344 330 366 380 S398 452 410 480';
  /** a small puffy cloud */
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".78"><ellipse cx="0" cy="6" rx="52" ry="11"/><circle cx="-18" cy="-2" r="14"/><circle cx="4" cy="-8" r="18"/><circle cx="26" cy="0" r="12"/></g>`;
  function mountainSvg(o) {
    o = o || {};
    const id = 'b02m' + Math.random().toString(36).slice(2, 7);
    const [sx, sy] = MTN.S;
    const lines = o.v
      ? `<path class="ln vL is-off" d="M${MTN.L[0]} ${MTN.L[1]} L${sx} ${sy}" fill="none" stroke="${P.navy}" stroke-width="11" stroke-linecap="round"/>
         <path class="ln vR is-off" d="M${sx} ${sy} L${MTN.R[0]} ${MTN.R[1]}" fill="none" stroke="${P.navy}" stroke-width="11" stroke-linecap="round"/>
         <circle class="ln vP is-off" cx="${sx}" cy="${sy}" r="13" fill="${P.gold}" stroke="${P.paper}" stroke-width="4"/>`
      : `<path class="ln asc is-off b02-march" d="${ASCENT}" fill="none" stroke="${P.gold}" stroke-width="8" stroke-linecap="round"/>
         <path class="ln desc is-off b02-march" d="${DESCENT}" fill="none" stroke="${P.gold}" stroke-width="8" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 460 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="${id}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9e1ed"/><stop offset=".6" stop-color="#eef1f6"/><stop offset="1" stop-color="#fbf8f1"/></linearGradient>
        <linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.navy4}"/><stop offset="1" stop-color="${P.navy3}"/></linearGradient>
        <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.navy2}"/><stop offset="1" stop-color="${P.navy}"/></linearGradient>
      </defs>
      <g class="scene">
        <rect width="460" height="600" fill="url(#${id}k)"/>
        <circle cx="378" cy="92" r="36" fill="${P.goldPale}"/><circle cx="378" cy="92" r="50" fill="none" stroke="${P.goldPale}" stroke-width="2" opacity=".7"/>
        <path d="M-10 368 L36 318 L70 336 L118 288 L150 308 L176 296 V600 H-10Z" fill="${P.mist2}"/>
        <path d="M300 300 L338 262 L372 292 L410 252 L470 290 V600 H300Z" fill="${P.mist2}"/>
        <path d="M232 112 L212 152 L200 170 L186 198 L172 230 L156 258 L140 284 L122 304 L104 340 L80 370 L58 402 L32 446 L6 482 L-20 516 V600 H244 L254 474 L234 366 L248 262 L236 196Z" fill="url(#${id}l)"/>
        <path d="M232 112 L236 196 L248 262 L234 366 L254 474 L244 600 H480 V478 L452 446 L424 410 L398 382 L374 338 L350 296 L322 262 L300 228 L284 194 L268 170 L252 146Z" fill="url(#${id}r)"/>
        <path d="M232 112 L212 152 L200 170 L186 198 L176 224 L190 216 L198 238 L210 222 L222 246 L230 216 L236 196Z" fill="${P.paper}"/>
        <path d="M232 112 L252 146 L268 170 L284 194 L296 222 L282 214 L270 238 L258 218 L248 234 L240 212 L236 196Z" fill="${P.mist}"/>
        ${cloud(96, 410, 1)}${cloud(352, 352, 0.8)}
        <path d="M-10 540 C60 500 120 520 170 540 S300 508 360 534 S440 520 470 512 V600 H-10Z" fill="${P.navy2}"/>
        <path d="M232 112 V84" stroke="${P.navy}" stroke-width="3" stroke-linecap="round"/><path d="M232 84 L255 91 L232 98Z" fill="${P.gold}"/>
      </g>
      ${lines}
    </svg>`;
  }
  /** the Everest figures, when the verified dataset holds them */
  function everest() {
    const d = EFA.data || {};
    const e = d.everest || (d.history && d.history.everest) || null;
    return e && isFinite(e.summits) && isFinite(e.deaths) && e.summits > 0 ? e : null;
  }

  /* ---------- cev1: the summit is not the goal ---------- */
  EFA.screen('cev1', {
    title: 'The summit is not the goal',
    steps: 3,
    copy: withFB({
      head: 'Climbing the World\'s Tallest Mountain',
      p1: 'Mount Everest is the highest point on earth, and every headline goes to the climbers who reach the top. But is the top really the goal?',
      'p2.a': 'From the first recorded attempts in', 'p2.b': 'through', 'p2.c': ',', 'p2.d': 'summits were recorded and', 'p2.e': 'people died on the mountain. That is about', 'p2.f': 'deaths for every 100 people who made it to the top.',
      'p2.soft': 'Since the first recorded attempts in the 1920s, thousands of climbers have reached the summit, and hundreds have died on the mountain.',
      'p3.a': 'About', 'p3.b': 'of those deaths came on the way down, after the climber had already reached the top. Did those climbers succeed, or did they fail?',
      'p3.soft': 'Many of those deaths came on the way down, after the climber had already reached the top. Did those climbers succeed, or did they fail?',
      src: 'Source', 'src.title': 'Source of the Climbing Statistics', 'src.asof': 'Figures as of', 'b.ok': 'Ok',
      _notes: 'Reaching the summit gets the attention. Getting back down is what counts.\n\n- Ask: If a climber reaches the top but never makes it home, did the climb succeed?\nPAUSE\n\n- Retirement works the same way: building the balance is the climb; the income years are the descent.'
    }),
    render(ctx) {
      const E = everest();
      const p2 = E ? sentence(ctx, ['p2.a', { v: String(E.fromYear || '') }, 'p2.b', { v: String(E.toYear || '') }, 'p2.c', { v: F.int(E.summits) }, 'p2.d', { v: F.int(E.deaths) }, 'p2.e', { v: F.num(E.deaths / E.summits * 100, 1) }, 'p2.f']) : ctx.t('p2.soft');
      const p3 = E && isFinite(E.descentShare) ? sentence(ctx, ['p3.a', { v: F.pct(E.descentShare, 0) }, 'p3.b']) : ctx.t('p3.soft');
      ctx.el.innerHTML = `
        ${head(ctx, 'head', { cls: 'sm' })}
        <div class="b02-col" style="top:150px;height:600px;gap:22px">
          <div class="b02-panel">${ctx.t('p1')}</div>
          <div class="b02-panel b02-fade" data-p="2">${p2}</div>
          <div class="b02-panel b02-fade" data-p="3">${p3}</div>
        </div>
        <div class="b02-mtn">${mountainSvg()}</div>
        ${E ? `<div class="b02-srcl b02-fade" data-src="1"><button type="button" class="b02-link b02-src-btn">${ctx.t('src')}</button></div>` : ''}`;
      if (E) ctx.on(ctx.$('.b02-src-btn'), 'click', () => {
        const ov = ctx.overlay({ title: ctx.t('src.title'), cls: 'b02-src',
          html: `<p>${esc(E.source || '')}</p>${E.sourceUrl ? `<p style="font-size:16px;color:#667389;overflow-wrap:anywhere">${esc(E.sourceUrl)}</p>` : ''}${E.asOf ? `<p style="font-size:16px;color:#667389">${ctx.t('src.asof')} <span class="num">${esc(E.asOf)}</span></p>` : ''}
            <div style="display:flex;justify-content:flex-end"><button type="button" class="st-pill b02-src-ok" style="min-width:130px">${ctx.t('b.ok')}</button></div>` });
        ov.querySelector('.b02-src-ok').addEventListener('click', () => ov.close());
      });
    },
    step(ctx, n) {
      ctx.show('[data-p="2"]', n >= 1); ctx.show('[data-p="3"]', n >= 2); ctx.show('[data-src]', n >= 1);
      const asc = ctx.$('.b02-mtn .asc'), desc = ctx.$('.b02-mtn .desc');
      asc.classList.toggle('is-off', n !== 1); desc.classList.toggle('is-off', n < 2);
    }
  });

  /* ---------- cev2: funding the retirement mountain ---------- */
  EFA.screen('cev2', {
    title: 'Accumulation versus distribution',
    steps: 6,
    copy: withFB({
      head: 'Funding Your Retirement Mountain',
      p1: 'The climb carries a planning lesson. Is the goal the biggest possible balance on the way up, or income that lasts all the way down?',
      prompt: 'What are you focused on?',
      'a.t': 'Maximizing Accumulation', 'a.s': '% Rate of Return %', or: 'or', 'b.t': 'Maximizing Distribution', 'b.s': '$ Retirement Lifestyle $',
      p3: 'Different assets, even ones that are hard to put a value on, can be compared by their Capital Equivalent Value.',
      p4: 'Capital Equivalent Value is the amount one asset would need to grow to so it could pay the same income as another asset.',
      'v.acc': 'Accumulation', 'v.dist': 'Distribution', 'v.cev': 'Capital Equivalent Value',
      _notes: 'The way up is accumulation, where the focus is rate of return. The way down is distribution, where the focus is your lifestyle.\n\n- Ask: Which matters more to you in retirement, the size of the balance or the size of the paycheck it can give you?\nPAUSE\n\n- Capital Equivalent Value lets us compare very different assets by the income they can deliver.'
    }),
    render(ctx) {
      const [sx, sy] = MTN.S, [lx, ly] = MTN.L, [rx, ry] = MTN.R;
      const lab = (x1, y1, x2, y2, side, key) => {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len * side, ny = (x2 - x1) / len * side;
        return `<div class="b02-vlab ${key === 'v.acc' ? 'vl-a' : 'vl-d'}" style="left:${(mx + nx * 26).toFixed(1)}px;top:${(my + ny * 26).toFixed(1)}px;transform:translate(-50%,-50%) rotate(${ang.toFixed(1)}deg)">${ctx.t(key)}</div>`;
      };
      ctx.el.innerHTML = `
        ${head(ctx, 'head', { cls: 'sm' })}
        <div class="b02-col" style="top:140px;height:620px">
          <div class="b02-panel">${ctx.t('p1')}</div>
          <div class="b02-panel b02-focus b02-fade" data-p="2">${ctx.t('prompt', { cls: 'pr' })}
            <div class="b02-fboxes"><div class="b02-fbox b02-fade" data-bx="a">${ctx.t('a.t', { cls: 't' })}${ctx.t('a.s', { cls: 's' })}</div>${ctx.t('or', { cls: 'b02-or b02-fade', attrs: 'data-bx="or"' })}<div class="b02-fbox b02-fade" data-bx="b">${ctx.t('b.t', { cls: 't' })}${ctx.t('b.s', { cls: 's' })}</div></div>
          </div>
          <div class="b02-panel b02-fade" data-p="3">${ctx.t('p3')}</div>
          <div class="b02-panel b02-fade" data-p="4">${ctx.t('p4')}</div>
        </div>
        <div class="b02-mtn">${mountainSvg({ v: true })}
          ${lab(lx, ly, sx, sy, 1, 'v.acc').replace('b02-vlab', 'b02-vlab b02-fade')}
          ${lab(sx, sy, rx, ry, 1, 'v.dist').replace('b02-vlab', 'b02-vlab b02-fade')}
          <div class="b02-vlab gold b02-fade vl-c" style="left:${sx}px;top:${sy - 52}px;transform:translate(-50%,-50%)">${ctx.t('v.cev')}</div>
        </div>`;
    },
    step(ctx, n) {
      ctx.show('[data-p="2"]', n >= 1); ctx.show('[data-bx="a"]', n >= 2); ctx.show('[data-bx="or"]', n >= 3); ctx.show('[data-bx="b"]', n >= 3);
      ctx.show('[data-p="3"]', n >= 4); ctx.show('[data-p="4"]', n >= 5);
      ctx.$('.b02-mtn .scene').classList.toggle('dim', n >= 2);
      ctx.$('.b02-mtn .vL').classList.toggle('is-off', n < 2); ctx.$('.b02-mtn .vR').classList.toggle('is-off', n < 3); ctx.$('.b02-mtn .vP').classList.toggle('is-off', n < 5);
      ctx.show('.vl-a', n >= 2); ctx.show('.vl-d', n >= 3); ctx.show('.vl-c', n >= 5);
    }
  });

  /* ---------- cev3: what CEV means for a life insurance policy ---------- */
  function applesSvg() {
    const apple = (cx, cy, s, leaf, id) => `
      <g transform="translate(${cx} ${cy}) scale(${s})">
        <ellipse cx="0" cy="84" rx="70" ry="10" fill="rgba(13,30,58,.14)"/>
        <path d="M0 -46 C26 -70 74 -60 76 -8 C78 42 44 80 14 74 C7 73 -7 73 -14 74 C-44 80 -78 42 -76 -8 C-74 -60 -26 -70 0 -46Z" fill="url(#${id})"/>
        <path d="M-44 -30 C-54 -12 -54 14 -44 30" fill="none" stroke="#fffdf8" stroke-width="7" stroke-linecap="round" opacity=".35"/>
        <path d="M0 -46 Q4 -72 16 -86" fill="none" stroke="${P.navy}" stroke-width="6" stroke-linecap="round"/>
        <path d="M8 -70 C30 -96 62 -88 66 -72 C46 -58 24 -58 8 -70Z" fill="${leaf}"/>
      </g>`;
    return `<svg viewBox="0 0 440 380" aria-hidden="true">
      <defs>
        <radialGradient id="b02apG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f7ecc8"/><stop offset=".4" stop-color="${P.goldLt}"/><stop offset="1" stop-color="${P.goldDeep}"/></radialGradient>
        <radialGradient id="b02apN" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#4d6da3"/><stop offset=".5" stop-color="${P.navy3}"/><stop offset="1" stop-color="${P.navy}"/></radialGradient>
        <linearGradient id="b02apBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#efe9dd"/></linearGradient>
      </defs>
      <rect width="440" height="380" fill="url(#b02apBg)"/>
      <path d="M0 296 H440" stroke="#d6cfc4" stroke-width="2"/>
      ${apple(112, 200, 0.92, P.navy4, 'b02apG')}
      ${apple(328, 200, 0.92, P.gold, 'b02apN')}
      <g stroke="${P.gold}" stroke-width="8" stroke-linecap="round"><path d="M204 184 H236"/><path d="M204 206 H236"/></g>
    </svg>`;
  }
  EFA.screen('cev3', {
    title: 'What CEV means for a life insurance policy',
    steps: 3,
    copy: withFB({
      head: 'Capital Equivalent Value of Life Insurance',
      p1: 'For this conversation, Capital Equivalent Value is the size any competing investment would have to reach to match the money benefits a life insurance contract provides.',
      p2: 'Most people never count how many money benefits a policy can carry:',
      i1: 'Death Benefits', i2: 'Cash Values', i3: 'Tax-Free Features*', i4: 'Guaranteed Insurability',
      i5: 'Extended Care Riders', i6: 'Terminal Illness Riders', i7: 'Disability Waiver of Premium',
      p3: 'Next, let\'s measure the full, benefit-based value of a policy inside your retirement plan.',
      own: '*Generally income-tax-free under current tax law, subject to applicable requirements. Features and riders vary by policy and carrier, may carry an added cost, and are subject to underwriting.',
      _notes: 'An apples-to-apples comparison counts every benefit, not just the cash value.\n\n- Ask: Which of these benefits did you know a policy could carry?\nPAUSE\n\n- Next: the calculator that puts a number on it.'
    }),
    render(ctx) {
      const li = (k) => `<div class="b02-li">${dart(26)}${ctx.t(k)}</div>`;
      ctx.el.innerHTML = `
        ${head(ctx, 'head', { cls: 'sm' })}
        <div class="b02-col" style="top:130px;height:640px;gap:22px">
          <div class="b02-panel">${ctx.t('p1')}</div>
          <div class="b02-panel b02-fade" data-p="2">${ctx.t('p2')}
            <div class="b02-lists"><div style="display:grid;gap:8px">${['i1', 'i2', 'i3', 'i4'].map(li).join('')}</div><div style="display:grid;gap:8px;align-content:start">${['i5', 'i6', 'i7'].map(li).join('')}</div></div></div>
          <div class="b02-panel b02-fade" data-p="3">${ctx.t('p3')}</div>
        </div>
        <div class="b02-apples">${applesSvg()}</div>
        ${discBlock(ctx, ['guarantees'], 'own')}`;
    },
    step(ctx, n) { ctx.show('[data-p="2"]', n >= 1); ctx.show('[data-p="3"]', n >= 2); }
  });

  /* ---------- cev5: takeaways ---------- */
  EFA.screen('cev5', {
    title: 'Takeaways for the wealth strategy',
    steps: 5,
    copy: withFB({
      head: 'Takeaways for Your Wealth Strategy',
      t1: 'Success is not the peak balance. It is a comfortable lifestyle that lasts all the way through retirement, the whole way down the mountain.',
      t2: 'Judge each option by the spendable income it can deliver, what it costs to get that income, and the benefits that come with it, not by rate of return alone.',
      t3: 'A well-structured cash value policy pairs protection with living benefits, which can make it a credible retirement asset alongside your other accounts.',
      t4: 'Because your income level can shrink some retirement benefits, how your income sources are arranged matters. The right arrangement can help you avoid paying more tax than you need to.',
      _notes: 'Four ideas to carry into your plan.\n\n- Ask: Which of these four matters most to you right now?\nPAUSE'
    }),
    render(ctx) {
      ctx.el.innerHTML = `
        ${head(ctx, 'head')}
        <div class="b02-take">${['t1', 't2', 't3', 't4'].map((k, i) => `<div class="b02-take-row b02-fade" data-r="${i}">${dart(84)}${ctx.t(k, { tag: 'div', cls: 'b02-panel' })}</div>`).join('')}</div>`;
    },
    step(ctx, n) { [0, 1, 2, 3].forEach((i) => ctx.show(`[data-r="${i}"]`, n > i)); }
  });

  /* =====================================================================
     cev4: the 18-step Capital Equivalent Value whiteboard with the TVM tool
     ===================================================================== */
  EFA.css('b02c4', `
  .b02-c4 .ab { position: absolute; left: 0; width: 1600px; display: grid; grid-template-columns: 1fr 1fr; column-gap: 22px; align-items: center; height: 44px; }
  .b02-c4 .ab .lb { justify-self: end; font: 700 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-c4 .ab .in { justify-self: start; display: flex; align-items: center; gap: 12px; font: 600 20px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-c4 .st-field { gap: 0; }
  .b02-c4 .st-input { height: 42px; font-size: 20px; text-align: right; }
  .b02-c4 .hd { position: absolute; text-align: center; font: 700 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; letter-spacing: .02em; }
  .b02-c4 .rule { position: absolute; height: 5px; background: #0d1e3a; border-radius: 3px; }
  .b02-c4 .ti { position: absolute; text-align: center; font: 600 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-c4 .box { position: absolute; border: 3px solid #0d1e3a; border-radius: 10px; background: #fffdf8; box-sizing: border-box; box-shadow: 0 10px 24px rgba(13,30,58,.08); }
  .b02-c4 .box .bx-t { position: absolute; left: 10px; right: 10px; top: 20px; text-align: center; }
  .b02-c4 .box .cevv { position: absolute; left: 0; right: 0; top: 86px; text-align: center; }
  .b02-c4 .box .rorv { position: absolute; left: 0; right: 0; top: 142px; text-align: center; }
  .b02-c4 .tog { font: 700 19px/1.25 "DM Sans", sans-serif; color: #8a6e22; cursor: pointer; border-bottom: 2px dotted rgba(138,110,34,.6); }
  .b02-c4 .tog:hover { color: #0d1e3a; }
  .b02-c4 .cevv { font: 700 32px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-c4 .rorv { font: 700 21px/1 "DM Sans", sans-serif; color: #8a6e22; letter-spacing: .02em; }
  .b02-c4 .pbox { position: absolute; border: 3px solid #0d1e3a; background: #fffdf8; box-sizing: border-box; display: grid; place-items: center; font: 700 21px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-c4 .ln { position: absolute; font: 600 21px/1.25 "DM Sans", sans-serif; color: #0d1e3a; white-space: nowrap; }
  .b02-c4 .ln.c { transform: translateX(-50%); }
  .b02-c4 .mini .st-input { width: 74px; text-align: center; padding: 0 6px; }
  .b02-c4 .ext { width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #b8972e; background: #fffdf8; color: #8a6e22; display: inline-grid; place-items: center; cursor: pointer; vertical-align: middle; margin-left: 10px; padding: 0; }
  .b02-c4 .ext:hover { background: #b8972e; color: #0d1e3a; }
  .b02-c4 .fl { position: absolute; left: 272px; top: 0; width: 880px; font: 600 20px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-c4 .fl .c4-fw { font-size: 19px; }
  .b02-c4 .fl > div { position: absolute; left: 0; white-space: nowrap; }
  .b02-c4 .fl .muted { color: #2b4c80; font-size: 19px; }
  .b02-c4 .loans { position: absolute; writing-mode: vertical-rl; text-orientation: upright; font: 700 21px/1 "DM Sans", sans-serif; letter-spacing: .12em; color: #0d1e3a; }
  .b02-c4 .nar { position: absolute; left: 1180px; top: 594px; width: 310px; box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-left: 5px solid #b8972e; border-radius: 12px; box-shadow: 0 10px 26px rgba(13,30,58,.08); padding: 14px 18px; font: 500 17px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }
  .b02-c4 .nar p { margin: 0; }
  .b02-c4 .svgl { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; pointer-events: none; overflow: visible; }
  .b02-c4ctl { position: absolute; right: 110px; display: flex; gap: 12px; align-items: center; white-space: nowrap; }
  .b02-c4ctl .st-pill { gap: 10px; }
  .b02-tvm .b02-modal-b { gap: 18px; }
  .b02-tvm .b02-seg { display: inline-flex; border: 1.5px solid #cbd5e3; border-radius: 999px; padding: 4px; gap: 4px; background: #fff; }
  .b02-tvm .b02-seg button { border: 0; border-radius: 999px; padding: 8px 16px; background: transparent; color: #0d1e3a; font: 600 16px/1.1 "DM Sans", sans-serif; cursor: pointer; }
  .b02-tvm .b02-seg button[aria-checked="true"] { background: #0d1e3a; color: #f7f5f1; }
  .b02-tvm .b02-seg button:not([aria-checked="true"]):hover { background: #e3e8f0; }
  .b02-tvm .b02-tvgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 30px; }
  .b02-tvm .b02-tvf { display: grid; gap: 6px; }
  .b02-tvm .b02-tvf > span { font: 600 15px/1.2 "DM Sans", sans-serif; color: #667389; letter-spacing: .04em; text-transform: uppercase; }
  .b02-tvm .st-input { text-align: right; }
  .b02-tvm .st-input[readonly] { background: #f0e6c4; border-color: #b8972e; }
  .b02-tvm .b02-tvrow { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .b02-tvm .b02-tvrow > span { font: 600 15px/1.2 "DM Sans", sans-serif; color: #667389; letter-spacing: .04em; text-transform: uppercase; min-width: 120px; }
  .b02-copy { position: absolute; z-index: 40; }
  `);
  const MC_URL = 'https://www.portfoliovisualizer.com/monte-carlo-simulation';
  const extIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  /** safe withdrawal research figures, when the verified dataset holds them */
  function swrData() {
    const d = EFA.data || {};
    const s = d.swr || d.safeWithdrawal || (d.history && d.history.swr) || null;
    return s && isFinite(s.low) && isFinite(s.high) ? s : null;
  }
  const N_COPY = {
    'n.0': 'You have a set amount available each year, for a set number of years. Where should it go?',
    'n.1': 'Option one: an investment we will leave unnamed. To start, assume its withdrawals come out tax-free.',
    'n.2': 'At retirement, this account is expected to produce your income.',
    'n.3': 'How much can it pay each year? Research on retirement withdrawals looks for a rate that has held up through most market histories. The lower the rate, the more confident you can be that the money lasts.',
    'n.3d.a': 'Research on retirement withdrawals puts a sustainable starting rate between about', 'n.3d.b': 'and', 'n.3d.c': '. The lower the rate, the more confident you can be that the money lasts.',
    'n.4': 'Option two: the same dollars fund a cash value life insurance policy.',
    'n.5': 'The policy\'s values, premiums plus any dividends credited, are projected out to age 100. Dividends and projected values are not guaranteed.',
    'n.6': 'That projected value is treated as the expected death benefit.',
    'n.7': 'The death benefit can also be put to work during your lifetime. Policy loans can provide income that is income-tax-free. Loans accrue interest and reduce the cash value and death benefit.',
    'n.8': 'To compete, the investment has to deliver the same income after taxes.',
    'n.9': 'Would you board a flight if there were a real chance it would not land where it should? The withdrawal rate you choose sets your odds. Which rate are you comfortable with?',
    'n.10': 'The balance the investment needs, its Capital Equivalent Value, follows from a simple formula: the yearly income divided by the withdrawal rate.',
    'n.11': 'With your numbers, this is the balance the investment must reach.',
    'n.12': 'Is that realistic? A time-value-of-money calculation finds the return needed to get there.',
    'n.13': 'That return has to be earned every single year of the period. How does it compare with what you have actually earned? Taxes on withdrawals would push it higher still.',
    'n.14': 'Now consider income-tested benefits, such as Social Security.',
    'n.15': 'Withdrawals from an investment can count toward the income used to tax Social Security benefits. Under current tax law, policy loans generally do not.',
    'n.16': 'So a larger gross withdrawal is needed to keep the same net income.',
    'n.17': 'The result: both the Capital Equivalent Value and the required return go up.'
  };
  EFA.screen('cev4', {
    title: 'Capital Equivalent Value calculator',
    steps: 18,
    copy: withFB(Object.assign({
      head: 'Capital Equivalent Value',
      'l.contrib': 'Annual Contribution', 'l.dur': 'Duration', years: 'years',
      'h.inv': 'Hypothetical\nInvestment', 'l.total': 'Total Invested:', 'h.li': 'Life Insurance',
      'l.tax': 'Tax Rate', 'l.ss': 'Social Security Income', db: 'D.B.', cv: 'Cash Value', age100: '100', loans: 'LOANS',
      'ty.free': 'Tax-Free Investment', 'ty.def': 'Tax-Deferred Investment', ror: 'ROR:',
      'swr.soft': 'Research puts safe withdrawal rates in the low single digits', 'swr.a': 'Commonly cited safe withdrawal rates:', 'swr.b': 'to',
      'l.swr': 'Safe Withdrawal Rate', income: 'Income / year (after taxes)', 'yr.after': '/ year (after taxes)', 'yr.free': '/ year (tax-free*)',
      'g.cover': 'to cover tax on SS',
      'fw.a': 'Capital Equivalent Value = Annual Withdrawal / Safe Withdrawal Rate', 'fw.def': ', grossed up for taxes',
      'fn.a': 'Capital Equivalent Value =',
      'tvm.a': 'CEV ROR = TVM RATE(Periods =', 'tvm.b': ', Payment =', 'tvm.c': ', PV = 0, FV =', 'tvm.d': ')',
      'b.tvm': 'TVM Calculator', 'l.nar': 'Show Narration', 'b.reset': 'Reset', 'b.skip': 'Skip Ahead',
      'tv.title': 'Time Value of Money', 'tv.solve': 'Solve For', 'tv.pv': 'PV', 'tv.pmt': 'Pmt', 'tv.n': 'Period', 'tv.rate': 'Rate', 'tv.fv': 'FV',
      'tv.lpv': 'Present Value', 'tv.lpmt': 'Contribution / Withdrawal', 'tv.ln': 'Number of Periods', 'tv.lrate': 'Annual Interest Rate', 'tv.lfv': 'Future Value',
      'tv.comp': 'Compounding', 'tv.a': 'Annually', 'tv.m': 'Monthly', 'tv.w': 'Weekly', 'tv.d': 'Daily', 'tv.time': 'Payment Timing', 'tv.beg': 'Beginning', 'tv.end': 'End',
      'tv.go': 'Continue', 'tv.copy': 'Copy', 'tv.copied': 'Copied.',
      own: '*Policy loans are income-tax-free, and accrue interest. Dividends and projected policy values are not guaranteed. Tax on Social Security is simplified to one flat rate on the full benefit.',
      _notes: 'Walk the client from the same yearly dollars to two very different destinations.\n\n- Show Narration puts a short note for each step on the screen.\n- Ask: What return have you actually earned, year in and year out, over the last ten years?\nPAUSE\n\n- Reset goes back to the start of the comparison without touching the numbers.'
    }, N_COPY)),
    render(ctx) {
      const V = visit(ctx, () => ({ nar: false }));
      const S = swrData();
      const fld = (o, w) => `<span style="display:inline-block;width:${w}px">${ctx.field(o)}</span>`;
      const svg = `<svg class="svgl" viewBox="0 0 1600 900" aria-hidden="true">
          <defs><marker id="b02ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="${P.navy}"/></marker></defs>
          <g class="b02-fade c4-arrow"><path d="M400 448 V506" stroke="${P.navy}" stroke-width="7" stroke-linecap="round" marker-end="url(#b02ah)"/></g>
          <g class="b02-fade c4-curve"><path d="M1112 440 C1192 436 1262 398 1288 252" fill="none" stroke="${P.navy}" stroke-width="3"/><circle cx="1288" cy="252" r="5" fill="${P.navy}"/></g>
          <g class="b02-fade c4-loan"><rect x="1270" y="288" width="18" height="18" fill="${P.gold}"/>
            <path d="M1288 297 H1336 V496 L1302 522" fill="none" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" marker-end="url(#b02ah)"/></g>
          <g class="b02-fade c4-h"><path d="M318 598 H482" stroke="${P.navy}" stroke-width="3" stroke-linecap="round"/></g>
        </svg>`;
      ctx.el.innerHTML = `<div class="b02-c4">
        ${head(ctx, 'head', { cls: 'xs' })}
        <label class="b02-chk" style="position:absolute;right:110px;top:34px;font-size:18px;gap:10px"><input type="checkbox" class="c4-nar-on" ${V.nar ? 'checked' : ''}>${ctx.t('l.nar')}</label>
        <div class="ab" style="top:94px">${ctx.t('l.contrib', { cls: 'lb' })}<span class="in">${fld({ id: 'contribution', type: 'money', value: 100000, min: 0 }, 210)}</span></div>
        <div class="ab" style="top:144px">${ctx.t('l.dur', { cls: 'lb' })}<span class="in">${fld({ id: 'years', type: 'int', value: 10, min: 1, max: 100 }, 90)}${ctx.t('years')}</span></div>
        <div class="b02-c4ctl" style="top:96px"><button type="button" class="b02-pill2 b02-fade c4-reset">${ctx.t('b.reset')}</button></div>
        <div class="b02-c4ctl" style="top:150px"><button type="button" class="st-pill b02-fade c4-skip">${ctx.t('b.skip')}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l6 6-6 6M13 6l6 6-6 6"/></svg></button></div>
        ${svg}
        <div class="b02-fade c4-l1">
          ${ctx.t('h.inv', { cls: 'hd', attrs: 'style="left:272px;width:256px;top:192px"' })}
          <div class="rule" style="left:532px;width:110px;top:214px"></div>
          <div class="ti" style="left:650px;width:300px;top:204px">${ctx.t('l.total')} <span class="num b02-v c4-total"></span></div>
          <div class="box" style="left:292px;top:244px;width:216px;height:196px">
            <span class="bx-t">${ctx.t('ty.free', { cls: 'tog c4-tf' })}${ctx.t('ty.def', { cls: 'tog c4-td' })}</span>
            <span class="cevv num b02-fade c4-cev"></span>
            <span class="rorv b02-fade c4-ror">${ctx.t('ror')} <span class="num c4-rorv"></span></span>
          </div>
        </div>
        <div class="ln c b02-fade c4-tax" style="left:800px;top:262px;display:flex;align-items:center;gap:14px">${ctx.t('l.tax')}${fld({ id: 'taxRate', type: 'pct', value: 0.25, dp: 2, min: 0, max: 0.99 }, 130)}</div>
        <div class="b02-fade c4-ss" style="position:absolute;left:640px;width:320px;top:350px;display:grid;gap:8px;justify-items:center">${ctx.t('l.ss', { cls: 'ln', attrs: 'style="position:static"' })}${fld({ id: 'ssIncome', type: 'money', value: 40000, min: 0 }, 220)}</div>
        <div class="b02-fade c4-r1">
          <div class="rule" style="left:958px;width:110px;top:214px"></div>
          ${ctx.t('h.li', { cls: 'hd', attrs: 'style="left:1072px;width:256px;top:205px"' })}
          <div class="pbox" style="left:1112px;top:306px;width:176px;height:134px;border-radius:0 0 10px 10px">${ctx.t('cv')}</div>
        </div>
        <div class="b02-fade c4-db"><div class="pbox" style="left:1112px;top:244px;width:176px;height:65px;border-radius:10px 10px 0 0">${ctx.t('db')}</div></div>
        <div class="ln b02-fade c4-curve" style="left:1300px;top:222px;font-size:19px">${ctx.t('age100')}</div>
        <div class="b02-fade c4-loan">
          ${ctx.t('loans', { cls: 'loans', attrs: 'style="left:1352px;top:330px"' })}
          <div class="ln mini" style="left:1112px;top:452px;display:flex;align-items:center;gap:10px">${fld({ id: 'ageStart', type: 'int', value: 66, min: 0, max: 120 }, 74)}<span>-</span>${fld({ id: 'ageEnd', type: 'int', value: 90, min: 0, max: 120 }, 74)}</div>
          <div class="ln" style="left:1112px;top:528px;display:flex;align-items:center;gap:12px">${fld({ id: 'withdrawal', type: 'money', value: 65000, min: 0 }, 160)}${ctx.t('yr.free')}</div>
        </div>
        <div class="ln b02-fade c4-swr0" style="left:452px;top:468px;font-size:19px">${S ? sentence(ctx, ['swr.a', { v: F.pct(S.low, 1) }, 'swr.b', { v: F.pct(S.high, 1) }]) : ctx.t('swr.soft')}<button type="button" class="ext c4-ext" aria-label="Open a Monte Carlo retirement simulator">${extIcon}</button></div>
        <div class="ln b02-fade c4-swr1" style="left:452px;top:458px;display:flex;align-items:center;gap:12px">${fld({ id: 'swr', type: 'pct', value: 0.035, dp: 2, min: 0, max: 1 }, 120)}${ctx.t('l.swr')}<button type="button" class="ext c4-ext" aria-label="Open a Monte Carlo retirement simulator">${extIcon}</button></div>
        <div class="ln c b02-fade c4-inc0" style="left:400px;top:522px">${ctx.t('income')}</div>
        <div class="ln c b02-fade c4-inc1" style="left:400px;top:522px"><span class="num b02-v c4-w0"></span> ${ctx.t('yr.after')}</div>
        <div class="ln c b02-fade c4-g" style="left:400px;top:562px">+ <span class="num b02-v c4-tss"></span> ${ctx.t('g.cover')}</div>
        <div class="ln c b02-fade c4-h" style="left:400px;top:606px">= <span class="num b02-v c4-wt"></span></div>
        <div class="fl">
          <div class="b02-fade c4-fw" style="top:646px">${ctx.t('fw.a')}<span class="c4-fwd">${ctx.t('fw.def')}</span></div>
          <div class="b02-fade c4-fn" style="top:682px"></div>
          <div class="b02-fade c4-tvm muted" style="top:722px"></div>
          <div class="b02-fade c4-tvmb" style="top:716px"><button type="button" class="st-pill c4-tvmbtn">${ctx.t('b.tvm')}</button></div>
        </div>
        <div class="nar b02-fade c4-nar"></div>
        ${discBlock(ctx, ['hypothetical', 'loans'], 'own', 'width:970px')}
      </div>`;
      wireWaits(ctx);
      ctx.onFields(() => paint(ctx));
      ctx.on(ctx.$$('.c4-tf, .c4-td'), 'click', () => { ctx.remember('taxFree', !ctx.mem('taxFree', true)); paint(ctx); });
      ctx.on(ctx.$('.c4-nar-on'), 'change', (e, n) => { V.nar = n.checked; paint(ctx); });
      ctx.on(ctx.$$('.c4-ext'), 'click', () => { try { window.open(MC_URL, '_blank', 'noopener'); } catch (err) { /* blocked */ } });
      ctx.on(ctx.$('.c4-reset'), 'click', () => ctx.goStep(7));
      ctx.on(ctx.$('.c4-skip'), 'click', () => { if (has('steps', 'skip')) EFA.lib.steps.skip(ctx); else EFA.player.goScreen(EFA.player.idx + 1); });
      ctx.on(ctx.$('.c4-tvmbtn'), 'click', () => tvmDialog(ctx));
    },
    step(ctx, n) { paint(ctx, n); },
    leave(ctx) { visitLeave(ctx); }
  });
  function cevValues(ctx, n) {
    const v = ctx.values();
    return Object.assign(cevCalc({ contribution: v.contribution || 0, years: v.years || 0, taxFree: !!ctx.mem('taxFree', true), taxRate: v.taxRate || 0, ssIncome: v.ssIncome || 0, swr: v.swr || 0, withdrawal: v.withdrawal || 0, withSS: n >= 16 }), { v });
  }
  function paint(ctx, n) {
    if (n == null) n = ctx.step;
    const V = visit(ctx, () => ({ nar: false }));
    const taxFree = !!ctx.mem('taxFree', true), nar = !!V.nar;
    const R = cevValues(ctx, n), v = R.v;
    const show = (sel, on) => ctx.show(sel, on);
    show('.c4-l1', n >= 1);
    const disp = (sel, on) => { const e = ctx.$(sel); if (e) e.style.display = on ? '' : 'none'; };
    disp('.c4-tf', taxFree); disp('.c4-td', !taxFree); disp('.c4-fwd', !taxFree);
    show('.c4-tax', n >= 1 && !taxFree);
    show('.c4-arrow', n >= 2 && n <= 8);
    show('.c4-inc0', n >= 2 && n < 8); show('.c4-inc1', n >= 8);
    show('.c4-swr0', n >= 3 && n < 9); show('.c4-swr1', n >= 9);
    show('.c4-r1', n >= 4); show('.c4-curve', n === 5); show('.c4-db', n >= 6); show('.c4-loan', n >= 7);
    show('.c4-reset', n >= 8);
    const vis = n !== 16;
    show('.c4-fw', n >= 10 && vis);
    show('.c4-cev', n >= 11 && vis); show('.c4-fn', n >= 11 && vis);
    show('.c4-tvm', n >= 12 && nar && vis); show('.c4-tvmb', n >= 12 && !nar);
    disp('.c4-tvm', nar); disp('.c4-tvmb', !nar);
    show('.c4-ror', n >= 13 && vis); show('.c4-skip', n >= 13);
    show('.c4-ss', n >= 14); show('.c4-g', n >= 15); show('.c4-h', n >= 16);
    show('.c4-nar', nar);
    // numbers
    const set = (sel, txt) => { const e = ctx.$(sel); if (e) e.textContent = txt; };
    set('.c4-total', money(R.totalInvested));
    set('.c4-cev', money(R.cev));
    set('.c4-rorv', F.pct(R.ror, 2));
    set('.c4-w0', money(v.withdrawal || 0));
    set('.c4-tss', money(R.taxOnSS));
    set('.c4-wt', money((v.withdrawal || 0) + R.taxOnSS));
    const fn = ctx.$('.c4-fn');
    if (fn) fn.innerHTML = `${ctx.t('fn.a')} ${nv(money(R.W))} / ${nv(pctTxt(v.swr || 0))}${taxFree ? '' : ` / (1 - ${nv(String(+(v.taxRate || 0).toFixed(4)))})`} = ${nv(money(R.cev))}`;
    const tv = ctx.$('.c4-tvm');
    if (tv) tv.innerHTML = `${sentence(ctx, ['tvm.a', { v: F.int(Math.round(v.years || 0)) }, 'tvm.b', { v: money(v.contribution || 0) }, 'tvm.c', { v: money(R.cev) }, 'tvm.d'])}${n >= 13 ? ` = ${nv(F.pct(R.ror, 2))}` : ''}`;
    const S = swrData();
    const nk = n === 3 && S ? null : 'n.' + n;
    const nb = ctx.$('.c4-nar');
    if (nb) nb.innerHTML = `<p>${nk ? ctx.t(nk) : sentence(ctx, ['n.3d.a', { v: F.pct(S.low, 1) }, 'n.3d.b', { v: F.pct(S.high, 1) }, 'n.3d.c'])}</p>`;
    if (editing()) EFA.edit.arm(ctx.el); else EFA.numify(ctx.el);
  }
  /** the TVM tool: stays open until Continue, which also moves to the next step */
  function tvmDialog(ctx) {
    const R = cevValues(ctx, ctx.step), v = R.v;
    const st = { solve: 'rate', pv: 0, pmt: v.contribution || 0, n: Math.round(v.years || 0), rate: 0, fv: R.cev, q: 1, t: 1 };
    const FLD = [['pv', 'tv.lpv', 'money'], ['pmt', 'tv.lpmt', 'money'], ['n', 'tv.ln', 'num'], ['rate', 'tv.lrate', 'pct'], ['fv', 'tv.lfv', 'money']];
    const seg = (name, opts) => `<span class="b02-seg" data-seg="${name}">${opts.map(([val, key]) => `<button type="button" data-v="${val}" aria-checked="false">${ctx.t(key)}</button>`).join('')}</span>`;
    const m = modal(ctx, {
      title: ctx.t('tv.title'), width: 860, cls: 'b02-tvm',
      body: `<div class="b02-tvrow">${ctx.t('tv.solve')}${seg('solve', [['pv', 'tv.pv'], ['pmt', 'tv.pmt'], ['n', 'tv.n'], ['rate', 'tv.rate'], ['fv', 'tv.fv']])}</div>
        <div class="b02-tvgrid">${FLD.map(([k, lab]) => `<label class="b02-tvf">${ctx.t(lab)}<input class="st-input" data-f="${k}" inputmode="decimal" autocomplete="off"></label>`).join('')}
          <div class="b02-tvf">${ctx.t('tv.comp')}${seg('q', [['1', 'tv.a'], ['12', 'tv.m'], ['52', 'tv.w'], ['360', 'tv.d']])}</div></div>
        <div class="b02-tvrow">${ctx.t('tv.time')}${seg('t', [['1', 'tv.beg'], ['0', 'tv.end']])}</div>`,
      foot: `<span></span><button type="button" class="st-pill tv-go" style="min-width:170px">${ctx.t('tv.go')}</button>`
    });
    const q = (s) => m.querySelector(s);
    const fmtF = (k, x) => (k === 'rate' ? `${F.num(x, 2)}%` : k === 'n' ? F.num(x, 2) : F.money(x, { dp: 2 }));
    const draw = () => {
      FLD.forEach(([k]) => { const inp = q(`[data-f="${k}"]`); if (document.activeElement !== inp) inp.value = fmtF(k, st[k]); inp.readOnly = st.solve === k; });
      m.querySelectorAll('[data-seg]').forEach((g) => g.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(st[g.dataset.seg]) === b.dataset.v)));
    };
    const calc = () => { const r = tvmSolve(st); if (r != null) st[st.solve] = r; draw(); };
    FLD.forEach(([k]) => {
      const inp = q(`[data-f="${k}"]`);
      inp.addEventListener('focus', () => { if (inp.readOnly) return; inp.value = String(+(+st[k]).toFixed(k === 'n' || k === 'rate' ? 4 : 2)); inp.select(); });
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
      inp.addEventListener('blur', () => { if (!inp.readOnly) { const x = parseNum(inp.value, 4); if (isFinite(x)) st[k] = x; } calc(); });
      inp.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const old = ctx.el.querySelector('.b02-copy'); if (old) old.remove();
        const rect = ctx.el.getBoundingClientRect(), sc = 1600 / rect.width;
        const pop = document.createElement('div'); pop.className = 'b02-copy';
        pop.style.left = ((e.clientX - rect.left) * sc) + 'px'; pop.style.top = ((e.clientY - rect.top) * sc) + 'px';
        pop.innerHTML = `<button type="button" class="st-pill" style="min-height:36px;font-size:15px">${ctx.t('tv.copy')}</button>`;
        ctx.el.appendChild(pop);
        pop.querySelector('button').addEventListener('click', () => {
          const txt = inp.value; pop.remove();
          try { navigator.clipboard.writeText(txt).then(() => ctx.toast(ctx.text('tv.copied')), () => {}); } catch (err) { /* no clipboard */ }
        });
        setTimeout(() => document.addEventListener('click', function off(ev) { if (!pop.contains(ev.target)) { pop.remove(); document.removeEventListener('click', off, true); } }, true), 0);
      });
    });
    m.querySelectorAll('[data-seg]').forEach((g) => g.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b || editing()) return;
      const name = g.dataset.seg;
      st[name] = name === 'solve' ? b.dataset.v : +b.dataset.v;
      calc();
    }));
    q('.tv-go').addEventListener('click', () => { if (editing()) return; m.close(); ctx.next(); });
    calc();
  }

  /* =====================================================================
     know1: the circle of knowledge
     ===================================================================== */
  EFA.css('b02k', `
  .b02-k-left { position: absolute; left: 400px; top: 0; width: 800px; height: 900px; transition: transform 3s cubic-bezier(.65,0,.35,1); }
  .b02-k-left.moved { transform: translateX(-400px); }
  .b02-k-left .b02-head { left: 0; right: 0; padding: 0 40px; }
  .b02-k-left svg { position: absolute; left: 0; top: 0; width: 800px; height: 900px; overflow: visible; }
  .b02-k-w { stroke: #f7f5f1; stroke-width: 4; stroke-linejoin: round; transition: opacity .8s ease; }
  .b02-k-w.is-off { opacity: 0; transition-duration: .3s; pointer-events: none; }
  .b02-k-hot { cursor: pointer; }
  .b02-k-hot:hover { filter: brightness(1.08); }
  .b02-k-lab { position: absolute; transform: translate(-50%, -50%); text-align: center; font: 700 19px/1.2 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #f7f5f1; white-space: nowrap; transition: opacity .8s ease; pointer-events: none; }
  .b02-k-lab.dark { color: #0d1e3a; }
  .b02-k-lab.big { font-size: 26px; letter-spacing: .1em; }
  .b02-k-lab .sub { display: block; margin-top: 6px; font: 600 16px/1.3 "DM Sans", sans-serif; letter-spacing: .04em; text-transform: none; color: #cbd5e3; }
  .b02-k-lab.is-off { opacity: 0; transition-duration: .3s; }
  .b02-k-right { position: absolute; left: 830px; top: 168px; width: 660px; display: grid; gap: 34px; transition: opacity 1s ease 1s; }
  .b02-k-right.is-off { transition: opacity .3s ease 0s; }
  .b02-k-right .st-h2 { font-size: 50px; line-height: 1.08; }
  .b02-k-item { display: grid; grid-template-columns: 56px 1fr; gap: 24px; align-items: center; }
  .b02-k-item .b02-panel { display: grid; gap: 8px; font-size: 27px; font-weight: 600; padding: 22px 28px; }
  .b02-k-item .cat { font: 700 15px/1.2 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #8a6e22; }
  `);
  EFA.screen('know1', {
    title: 'Knowledge pie and the blind spot',
    steps: 10,
    copy: withFB({
      head: 'The Circle of Knowledge',
      all: 'Everything There\nIs to Know', known: 'What We Know\nIs True', unknown: 'What We Know\nWe Don\'t Know',
      blind: 'Blind Spot', blindSub: 'What we don\'t know\nwe don\'t know',
      right: 'Three Ways to Grow What You Know',
      i1: 'Travel and first-hand experience', c1: 'Experience',
      i2: 'Reading and self-study', c2: 'Education',
      i3: 'The people you meet, and what they pass on to you', c3: 'Knowledge Transfer',
      _notes: 'Out of everything there is to know, we know a little, we know there is a lot we do not know, and the biggest part is what we do not even know to ask.\n\n- Ask: In your finances, what might be sitting in your blind spot right now?\nPAUSE\n\n- The third way to learn is where we come in. On the last step, the gold slice opens the Income Game.'
    }),
    render(ctx) {
      const cx = 400, cy = 470, r = 300;
      const W = (a0, a1, rr) => A.wedge(cx, cy, rr || r, a0, a1);
      const at = (rad, ang) => A.pt(cx, cy, rad, ang);
      const [kx, ky] = at(r * 0.7, 332), [ux, uy] = at(r * 0.7, 27);
      ctx.el.innerHTML = `
        <div class="b02-k-left">
          ${head(ctx, 'head')}
          <svg viewBox="0 0 800 900" aria-hidden="true">
            <defs>
              <linearGradient id="b02kA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.navy4}"/><stop offset="1" stop-color="${P.navy3}"/></linearGradient>
              <linearGradient id="b02kB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3c5d92"/><stop offset="1" stop-color="${P.navy4}"/></linearGradient>
              <linearGradient id="b02kK" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${P.mist}"/></linearGradient>
              <linearGradient id="b02kG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset="1" stop-color="${P.gold}"/></linearGradient>
              <radialGradient id="b02kS" cx=".5" cy=".5" r=".5"><stop offset=".72" stop-color="rgba(13,30,58,.16)"/><stop offset="1" stop-color="rgba(13,30,58,0)"/></radialGradient>
            </defs>
            <circle cx="${cx}" cy="${cy + 14}" r="${r + 26}" fill="url(#b02kS)"/>
            <path class="b02-k-w kw-all" d="${W(0, 360)}" fill="url(#b02kA)"/>
            <path class="b02-k-w kw-blind" d="${W(57, 304)}" fill="url(#b02kB)"/>
            <path class="b02-k-w kw-blind2" d="${W(72, 304)}" fill="url(#b02kB)"/>
            <path class="b02-k-w kw-known" d="${W(307, 360)}" fill="url(#b02kK)"/>
            <path class="b02-k-w kw-unknown" d="${W(0, 53)}" fill="${P.navy}"/>
            <path class="b02-k-w kw-sliver" d="${W(353, 360)}" fill="${P.goldDeep}" style="stroke-width:2"/>
            <path class="b02-k-w kw-hot b02-k-hot" d="${W(54, 72)}" fill="url(#b02kG)"/>
          </svg>
          <div class="b02-k-lab big kl-all" style="left:${cx}px;top:${cy + r * 0.42}px">${ctx.t('all')}</div>
          <div class="b02-k-lab dark kl-known" style="left:${kx}px;top:${ky}px;font-size:15px;letter-spacing:.05em">${ctx.t('known')}</div>
          <div class="b02-k-lab kl-unknown" style="left:${ux}px;top:${uy}px;font-size:15px;letter-spacing:.05em">${ctx.t('unknown')}</div>
          <div class="b02-k-lab big kl-blind" style="left:${cx - 20}px;top:${cy + r * 0.36}px">${ctx.t('blind')}${ctx.t('blindSub', { cls: 'sub' })}</div>
        </div>
        <div class="b02-k-right">
          ${ctx.t('right', { tag: 'h2', cls: 'st-h2' })}
          ${['1', '2', '3'].map((i) => `<div class="b02-k-item b02-fade" data-i="${i}">${dart(56)}<div class="b02-panel">${ctx.t('i' + i)}${ctx.t('c' + i, { cls: 'cat' })}</div></div>`).join('')}
        </div>`;
      ctx.on(ctx.$('.kw-hot'), 'click', () => { if (ctx.step >= 9) ctx.jump('IG', 'ig1'); });
    },
    step(ctx, n) {
      const w = (k, on) => ctx.$('.kw-' + k).classList.toggle('is-off', !on);
      w('all', n <= 2); w('known', n >= 1); w('unknown', n >= 2);
      w('blind', n >= 3 && n < 9); w('blind2', n >= 9); w('sliver', n >= 8); w('hot', n >= 9);
      ctx.show('.kl-all', n <= 2); ctx.show('.kl-known', n >= 1); ctx.show('.kl-unknown', n >= 2); ctx.show('.kl-blind', n >= 3);
      ctx.$('.b02-k-left').classList.toggle('moved', n >= 4);
      ctx.show('.b02-k-right', n >= 4);
      ['1', '2', '3'].forEach((i, k) => ctx.show(`.b02-k-item[data-i="${i}"]`, n >= 5 + k));
    }
  });

  /* =====================================================================
     cvs1: the asset circle with a benefit checklist ("Club vs. Swing")
     ===================================================================== */
  EFA.css('b02v', `
  .b02-v-panel { position: absolute; left: 1150px; top: 70px; width: 340px; display: grid; gap: 7px; }
  .b02-v-hd { text-align: center; display: grid; gap: 4px; margin-bottom: 6px; }
  .b02-v-hd .nm { font: 600 30px/1.1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b02-v-hd .lb { font: 700 14px/1.2 "DM Sans", sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #8a6e22; }
  .b02-ben { display: flex; align-items: center; min-height: 43px; padding: 0 16px; border: 1px solid #cbd5e3; border-radius: 10px; background: #fffdf8; font: 700 17px/1.2 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; user-select: none; text-align: left; transition: background .25s ease, border-color .25s ease; }
  .b02-ben:hover { border-color: #b8972e; }
  .b02-ben.on { background: linear-gradient(120deg, #e8d48e, #b8972e); border-color: #b8972e; box-shadow: 0 6px 14px rgba(138,110,34,.22); }
  .b02-v-btns { position: absolute; left: 1150px; width: 340px; top: 778px; display: flex; justify-content: space-between; gap: 12px; }
  .b02-v-btns .b02-pill2 { min-width: 150px; }
  .b02-v-ring .lib-bub-label { font-size: 17px; letter-spacing: .04em; }
  .b02-v-names { display: grid; gap: 8px; }
  .b02-v-names input { height: 44px; font-size: 19px; }
  `);
  const CVS_ASSETS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
  const CVS_BEN = ['Tax Deferred Growth', 'Tax-Free Distribution*', 'Competitive Return', 'High Contributions', 'Additional Benefits', 'Collateral Opportunities', 'Safe', 'No-Loss Provisions', 'Guaranteed Loan Option*', 'Unstructured Loan Payments', 'Liquidity, Use and Control', 'Deductible Contributions'];
  const CVS_DEF_KEY = 'efa.b02.cvs.defaultAssets';
  const cvsCopy = {
    center: 'Your Circle\nof Wealth', ins: 'Cash Value\nLife Insurance',
    a1: 'CD / Money\nMarket', a2: 'Business', a3: 'Annuities', a4: 'Precious\nMetals', a5: 'Mutual\nFunds', a6: 'Stocks', a7: 'Real Estate', a8: 'Bonds',
    benHead: 'List of Benefits', 'b.rename': 'Rename', 'b.reset': 'Reset',
    'rn.title': 'Edit Asset Names', 'rn.col': 'Asset Name', 'rn.def': 'Set as Default List', 'b.cancel': 'Cancel', 'b.save': 'Save Changes',
    own: '*Generally income-tax-free under current tax law, subject to applicable requirements. Benefits vary by product, policy and rider; marks reflect this discussion only.',
    _notes: 'Every place you keep money does a different job. Pick an asset and mark what it really does for you, then do the same for a cash value policy.\n\n- Ask: Which of these benefits matter most to you, and which of your accounts actually deliver them?\nPAUSE\n\n- With the policy in the centre, clicking any asset opens Understanding Policy Loans, compared against that asset.\n- Rename changes the asset names for this client.'
  };
  CVS_BEN.forEach((b, i) => { cvsCopy['ben' + (i + 1)] = b; });
  EFA.screen('cvs1', {
    title: 'Asset circle with benefit checklist',
    copy: withFB(cvsCopy),
    render(ctx) {
      const V = visit(ctx, () => ({ insIn: false, pick: null, marks: CVS_BEN.map(() => false), captured: null, wink: null }));
      const C = [680, 402], R = 290, SM = 164, CS = 300;
      const custom = ctx.mem('assetNames', null) || (() => { try { const d = EFA.util.LS.get(CVS_DEF_KEY, null); return Array.isArray(d) ? d : null; } catch (e) { return null; } })();
      const nameHtml = (i) => (custom && custom[i] ? esc(custom[i]) : ctx.t(CVS_ASSETS[i]));
      const nameTxt = (i) => (custom && custom[i] ? custom[i] : ctx.text(CVS_ASSETS[i]).replace(/\n/g, ' '));
      // ring order clockwise from 12 o'clock: asset 8, insurance, assets 1 to 7
      const ring = ['7', 'ins', '0', '1', '2', '3', '4', '5', '6'];
      const pos = ring.map((k, j) => { const [x, y] = A.pt(C[0], C[1], R, 16 + 40 * j); return { k, x, y }; });
      const bub = (o) => (has('bubble', 'circle') ? EFA.lib.bubble.circle(o) : `<div class="${o.cls || ''}" ${o.attrs || ''} style="position:absolute;left:${o.x - o.size / 2}px;top:${o.y - o.size / 2}px;width:${o.size}px;height:${o.size}px;border-radius:50%;background:${P.navy3};display:grid;place-items:center;color:#f7f5f1;text-align:center;font:700 16px/1.2 'DM Sans',sans-serif">${o.label}</div>`);
      const spoke = (p) => (has('arrows', 'spoke') ? EFA.lib.arrows.spoke({ from: [p.x, p.y], to: C, radii: [SM / 2, CS / 2], w: 54, attrs: `data-arw="${p.k}"` }) : '');
      const centerLabel = V.pick == null ? ctx.t('center') : (V.pick === 'ins' ? ctx.t('ins') : nameHtml(+V.pick));
      ctx.el.innerHTML = `
        <div class="b02-v-ring">
          ${pos.map(spoke).join('')}
          ${pos.map((p) => bub({ x: p.x, y: p.y, size: SM, tone: V.pick === p.k ? 'gold' : 'navy', label: p.k === 'ins' ? ctx.t('ins') : nameHtml(+p.k), cls: 'clickable', attrs: `data-pick="${p.k}"`, font: 16 })).join('')}
          ${bub({ x: C[0], y: C[1], size: CS, tone: 'light', label: centerLabel, font: 28, attrs: 'data-center="1"' })}
        </div>
        <div class="b02-v-panel b02-fade ${V.pick == null ? 'is-off' : ''}">
          <div class="b02-v-hd"><span class="nm">${V.pick == null ? '' : (V.pick === 'ins' ? ctx.t('ins') : nameHtml(+V.pick))}</span>${ctx.t('benHead', { cls: 'lb' })}</div>
          ${CVS_BEN.map((b, i) => `<button type="button" class="b02-ben ${V.marks[i] ? 'on' : ''}" data-b="${i}">${ctx.t('ben' + (i + 1))}</button>`).join('')}
        </div>
        <div class="b02-v-btns"><button type="button" class="b02-pill2 v-rename">${ctx.t('b.rename')}</button><button type="button" class="b02-pill2 v-reset b02-fade ${V.pick == null ? 'is-off' : ''}">${ctx.t('b.reset')}</button></div>
        ${discBlock(ctx, ['guarantees', 'loans'], 'own', 'width:1000px')}`;
      wireWaits(ctx);
      if (V.wink) { const el = ctx.$(`[data-arw="${V.wink}"]`); if (el && has('arrows', 'wink')) EFA.lib.arrows.wink(el); V.wink = null; }
      ctx.on(ctx.$$('[data-pick]'), 'click', (e, n) => {
        const k = n.dataset.pick;
        if (k === 'ins') {
          if (V.insIn) return;
          V.captured = V.marks.slice(); V.insIn = true;
        } else if (V.insIn) {
          // with the policy in the centre, an asset opens Understanding Policy Loans compared against it
          EFA.handoff = Object.assign(EFA.handoff || {}, { upl1: { title: nameTxt(+k), benefits: CVS_BEN.map((b, i) => ({ label: ctx.text('ben' + (i + 1)), on: !!(V.captured && V.captured[i]) })) } });
          visitJump(ctx, 'UPL', 'upl1');
          return;
        }
        V.pick = k; V.marks = CVS_BEN.map(() => false); V.wink = k;
        EFA.player.renderScreen({ noFade: true });
      });
      ctx.on(ctx.$$('.b02-ben'), 'click', (e, n) => { const i = +n.dataset.b; V.marks[i] = !V.marks[i]; n.classList.toggle('on', V.marks[i]); });
      ctx.on(ctx.$('.v-reset'), 'click', () => { V.marks = CVS_BEN.map(() => false); ctx.$$('.b02-ben').forEach((b) => b.classList.remove('on')); });
      ctx.on(ctx.$('.v-rename'), 'click', () => {
        const names = CVS_ASSETS.map((k, i) => nameTxt(i));
        const m = modal(ctx, { title: ctx.t('rn.title'), width: 560, x: true, cls: 'b02-rn',
          body: `<div style="font:700 14px/1.2 'DM Sans',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#667389">${ctx.t('rn.col')}</div>
            <div class="b02-v-names">${names.map((nm, i) => `<input class="st-input" data-n="${i}" autocomplete="off" value="${esc(nm)}">`).join('')}</div>
            <label class="b02-chk" style="font-size:18px"><input type="checkbox" class="rn-def">${ctx.t('rn.def')}</label>`,
          foot: `<button type="button" class="b02-pill2 rn-no">${ctx.t('b.cancel')}</button><button type="button" class="st-pill rn-ok" style="min-width:170px">${ctx.t('b.save')}</button>` });
        m.querySelectorAll('input').forEach((inp) => inp.addEventListener('keydown', (ev) => ev.stopPropagation()));
        m.querySelector('.rn-no').addEventListener('click', () => { if (!editing()) m.close(); });
        m.querySelector('.rn-ok').addEventListener('click', () => {
          if (editing()) return;
          const list = Array.from(m.querySelectorAll('[data-n]')).map((inp, i) => inp.value.trim() || nameTxt(i));
          if (m.querySelector('.rn-def').checked) { try { EFA.util.LS.set(CVS_DEF_KEY, list); } catch (err) { /* storage unavailable */ } }
          ctx.remember('assetNames', list);
          m.close(); EFA.player.renderScreen({ noFade: true });
        });
      });
    },
    leave(ctx) { visitLeave(ctx); }
  });
})();

