/* Module b01: ten-step launchpads, ten-minute life insurance lessons, 401(condo), accumulation vs.
   distribution, estate transfers, Allocation Mix, Annuities 101, appreciation vs. equity, auto
   insurance, and average vs. actual return.
   Screen structure, sequence, interactions and math follow the plain-words specs; every drawing and
   every word is new, in the Edwards brand. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt;
  const esc = EFA.util.esc;

  EFA.css('b01', `
  .b01-full { position: absolute; inset: 0; width: 1600px; height: 900px; overflow: visible; pointer-events: none; }
  .b01-hide { display: none !important; }
  .b01-head { position: absolute; left: 0; right: 0; top: 44px; display: grid; justify-items: center; gap: 12px; text-align: center; padding: 0 130px; }
  .b01-head .st-h1 { font-size: 60px; }
  .b01-link { color: #8a6e22; cursor: pointer; font-weight: 700; border-bottom: 1.5px dotted currentColor; background: none; border-top: 0; border-left: 0; border-right: 0; padding: 0; font-family: "DM Sans", sans-serif; }
  .b01-link:hover { color: #b8972e; }
  .b01-ghost { background: transparent !important; color: #0d1e3a !important; border-color: #cbd5e3 !important; }
  .b01-ghost:hover { border-color: #b8972e !important; background: #f0e6c4 !important; }
  .b01-chk { display: inline-flex; align-items: center; gap: 10px; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 999px; padding: 8px 16px 8px 10px; font: 600 15px/1 "DM Sans", sans-serif; color: #0d1e3a; box-shadow: 0 6px 16px rgba(13,30,58,.08); cursor: pointer; }
  .b01-chk:hover { border-color: #b8972e; }
  .b01-chk .bx { width: 22px; height: 22px; border-radius: 7px; border: 2px solid #8aa3c7; display: grid; place-items: center; background: #fff; flex: 0 0 auto; }
  .b01-chk .bx svg { opacity: 0; }
  .b01-chk[aria-pressed="true"] .bx { background: #0d1e3a; border-color: #0d1e3a; }
  .b01-chk[aria-pressed="true"] .bx svg { opacity: 1; }
  .b01-ov-md .st-overlay-in { width: 980px; }
  .b01-ov-sm .st-overlay-in { width: 720px; }
  .b01-ov-xs .st-overlay-in { width: 600px; }
  .b01-kick { font: 700 13px/1.2 "DM Sans", sans-serif; letter-spacing: .22em; text-transform: uppercase; color: #8a6e22; margin: 0 0 14px; }
  .b01-tt { font: 400 23px/1.62 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-dlg-f { display: flex; justify-content: flex-end; gap: 12px; margin-top: 22px; }
  .b01-note { font: 400 14px/1.45 "DM Sans", sans-serif; color: #667389; }
  .b01-disc { position: absolute; left: 110px; right: 330px; bottom: 16px; }

  /* launchpads */
  .b01-lp-card { position: absolute; transform: translate(-50%, -50%); background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 10px; box-shadow: 0 10px 24px rgba(13,30,58,.10); overflow: hidden; text-align: center; }
  .b01-lp-card .h { background: #0d1e3a; color: #f7f5f1; font: 700 13px/1 "DM Sans", sans-serif; letter-spacing: .22em; text-transform: uppercase; padding: 8px 6px 7px; }
  .b01-lp-card .h .num { color: #d5bd68; letter-spacing: .05em; }
  .b01-lp-card .b { font: 600 19px/1.18 "DM Sans", sans-serif; color: #0d1e3a; padding: 10px 10px 11px; }
  .b01-lp-S .b01-lp-card { border-radius: 8px; }
  .b01-lp-S .b01-lp-card .h { font-size: 9.5px; padding: 5px 3px 4px; letter-spacing: .16em; }
  .b01-lp-S .b01-lp-card .b { font-size: 11.5px; line-height: 1.14; padding: 5px 4px 6px; }
  .b01-lp-hub { position: absolute; transform: translate(-50%, -50%); display: grid; justify-items: center; gap: 10px; cursor: pointer; text-align: center; }
  .b01-lp-hub .ic { position: relative; background: #fffdf8; border: 1.5px solid #b8972e; border-radius: 18px; box-shadow: 0 14px 30px rgba(13,30,58,.14); display: grid; place-items: center; transition: transform .2s ease; }
  .b01-lp-hub:hover .ic { transform: translateY(-2px); }
  .b01-lp-hub .lb { font: 700 21px/1.15 "DM Sans", sans-serif; color: #0d1e3a; max-width: 230px; }
  .b01-lp-S .b01-lp-hub .lb { font-size: 13px; max-width: 120px; }
  .b01-lp-S .b01-lp-hub { gap: 6px; }
  .b01-lp-S .b01-lp-hub .ic { border-radius: 12px; }
  .b01-lp-tile { position: absolute; width: 96px; display: grid; justify-items: center; gap: 6px; cursor: pointer; text-align: center; }
  .b01-lp-tile .ic { position: relative; width: 56px; height: 56px; border-radius: 50%; background: #fffdf8; border: 1.5px solid #cbd5e3; box-shadow: 0 6px 14px rgba(13,30,58,.12); display: grid; place-items: center; transition: transform .2s ease, border-color .2s ease; }
  .b01-lp-tile:hover .ic { transform: translateY(-2px); border-color: #b8972e; }
  .b01-lp-tile .ic svg { width: 38px; height: 38px; }
  .b01-lp-tile .lb { font: 700 12.5px/1.16 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-bdg { position: absolute; right: -8px; top: -8px; width: 27px; height: 27px; border-radius: 50%; background: #b8972e; border: 2px solid #fffdf8; display: grid; place-items: center; box-shadow: 0 3px 8px rgba(13,30,58,.2); }
  .b01-lp-tile .tip { position: absolute; bottom: calc(100% + 4px); left: 50%; transform: translateX(-50%); background: #0d1e3a; color: #f7f5f1; font: 600 12px/1 "DM Sans", sans-serif; padding: 7px 10px; border-radius: 6px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .2s ease; z-index: 3; }
  .b01-lp-tile:hover .tip { opacity: 1; }
  .b01-lp-tog { position: absolute; right: 40px; bottom: 78px; display: grid; gap: 10px; justify-items: end; }
  .b01-form-l { margin: 0; padding: 0; list-style: none; display: grid; gap: 14px; counter-reset: q; }
  .b01-form-l li { counter-increment: q; display: grid; grid-template-columns: 46px 1fr; gap: 14px; align-items: start; font: 500 23px/1.4 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-form-l li::before { content: counter(q); width: 40px; height: 40px; border-radius: 50%; background: #0d1e3a; color: #d5bd68; display: grid; place-items: center; font: 700 18px/1 "DM Sans", sans-serif; }
  .b01-form-l.two { grid-template-columns: 1fr 1fr; column-gap: 34px; }
  .b01-form-l.two li { font-size: 19px; }
  .b01-form-l .ln { display: block; height: 0; border-bottom: 1.5px solid #cbd5e3; margin-top: 14px; }
  .b01-qgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .b01-qsec { border: 1px solid #d6cfc4; border-radius: 12px; padding: 14px 16px 6px; background: #fff; }
  .b01-qsec h4 { margin: 0 0 8px; font: 700 13px/1.2 "DM Sans", sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #8a6e22; }
  .b01-qsec .fl { display: grid; gap: 4px; padding: 7px 0 9px; border-bottom: 1.5px solid #e3e8f0; font: 500 15px/1.2 "DM Sans", sans-serif; color: #667389; }
  .b01-qsec .fl:last-child { border-bottom: 0; }
  .b01-qsec .fl::after { content: ""; height: 18px; }
  .stage .b01-lifet td { padding: 6px 14px; font-size: 17px; }
  .stage .b01-lifet th { padding: 9px 14px; }

  /* tanks */
  .b01-tank { position: absolute; }
  .b01-tank svg { display: block; overflow: visible; }
  .b01-liq { transition: transform 1s cubic-bezier(.45,.05,.2,1), opacity .5s ease; }
  `);

  /* =====================================================================
     Shared helpers
     ===================================================================== */
  const C = { navy: P.navy, n2: P.navy2, n3: P.navy3, n4: P.navy4, gold: P.gold, goldLt: P.goldLt, goldPale: P.goldPale, goldDeep: P.goldDeep, mist: P.mist, mist2: P.mist2, cream: P.cream, paper: P.paper, steel: P.steel, water: P.water, waterDeep: P.waterDeep };
  /** liquid colours in this module: safe money = navy, at-risk money = gold, desired / death benefit = water blue */
  const LIQ = {
    safe: { body: P.navy4, top: '#3c5d92' },
    risk: { body: P.gold, top: P.goldLt },
    water: { body: P.waterDeep, top: P.water }
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const num = (v, d) => { const n = typeof v === 'number' ? v : parseFloat(v); return isFinite(n) ? n : d; };
  const money = (v) => F.money(v);
  const money2 = (v) => F.money(v, { dp: 2 });
  const pct2 = (f) => F.pct(f, 2);
  const N = (s) => `<span class="num">${s}</span>`;
  const arm = (ctx) => { EFA.numify(ctx.el); if (EFA.edit && EFA.edit.on) EFA.edit.arm(ctx.el); };
  const checkSvg = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="#d5bd68" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const infoGlyph = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="6.6" r="2" fill="#fffdf8"/><rect x="10.3" y="10" width="3.4" height="9" rx="1.7" fill="#fffdf8"/></svg>`;

  /* ---------- client-wide values shared with other modules ----------
     Kept in one table so the keys can be aligned app-wide in one place. Stored through
     EFA.lib.caseData (namespace "case", the original key names, percents as fractions). A rate read
     back above 1 is taken as a whole percent (some modules store 30 for 30%). */
  const CASE = {
    taxRate: { key: 'case_file_ror_taxes', pct: true, def: 0.30 },
    cgRate: { key: 'case_file_ror_capital_gains', pct: true, def: 0.15 },
    inflation: { key: 'case_file_ror_inflation', pct: true, def: 0.03 },
    accumRate: { key: 'case_file_ror_accumulation', pct: true, def: 0.06 },
    houseValue: { key: 'house_current_market_value', def: 150000 },
    houseLoan: { key: 'house_outstanding_loan_balance', def: 100000 },
    houseAppr: { key: 'house_appreciation_rate', pct: true, def: 0.03 },
    savingsList: { key: 'case_file_accumulated_saving_list', def: null },
    savingsTotal: { key: 'case_file_accumulated_savings', def: 88000 }
  };
  const CD = () => (EFA.lib && EFA.lib.caseData) || null;
  const caseRaw = (key) => { const cd = CD(); return cd ? cd.get(key, undefined) : EFA.clients.get('case', key, undefined); };
  const caseGet = (name) => {
    const c = CASE[name]; let v = caseRaw(c.key);
    if (v == null || (typeof v === 'number' && !isFinite(v))) return c.def;
    if (c.pct) { v = num(v, c.def); if (Math.abs(v) > 1) v /= 100; }
    return v;
  };
  const caseSet = (name, v) => { const c = CASE[name], cd = CD(); if (cd) cd.set(c.key, v); else EFA.clients.set('case', c.key, v); };
  /** ctx.field bound to a shared client value: shows it, and writes the presenter's changes back */
  function caseField(ctx, o, name) {
    ctx.remember('f.' + o.id, caseGet(name));
    let last = ctx.mem('f.' + o.id, o.value);
    ctx.onFields((vals) => { const v = vals[o.id]; if (v === undefined || v === last) return; last = v; caseSet(name, v); });
    return ctx.field(o);
  }

  /* ---------- state kept across a jump and restored on the automatic return ---------- */
  const RET = {};
  function jumpWith(ctx, key, sid, state) {
    const pl = EFA.player, depth = pl.stack.length;
    RET[ctx.id] = { pres: ctx.pres, idx: pl.idx, depth, state };
    ctx.jump(key, sid);
    if (pl.stack.length === depth) delete RET[ctx.id]; // the target is not ready yet: nothing to return from
  }
  function takeReturn(ctx) {
    const r = RET[ctx.id]; if (!r) return null;
    delete RET[ctx.id];
    const pl = EFA.player;
    return (r.pres === ctx.pres && r.idx === pl.idx && r.depth === pl.stack.length) ? r.state : null;
  }

  /* ---------- shared components (js/lib), called through guarded lookups ---------- */
  const lib = (name) => { const o = EFA[name] || (EFA.lib && EFA.lib[name]); return o || null; };

  /* ---------- cylinder tank (flat duotone), liquid level animated by transform ---------- */
  let TKN = 0;
  /** o: {w, h, open, liq: LIQ.x | null, level 0..1, lid} -> svg string. The liquid group carries data-span for setLevel. */
  function tankSVG(o) {
    const id = 'b01tk' + (++TKN);
    const w = o.w, h = o.h, sw = o.sw || 3;
    const rx = w / 2 - sw, ry = Math.round(clamp(w * 0.15, 6, 24));
    const cx = w / 2, yT = ry + sw, yB = h - ry - sw;
    const span = yB - yT;
    const body = `M${cx - rx},${yT}L${cx - rx},${yB}A${rx},${ry} 0 0 0 ${cx + rx},${yB}L${cx + rx},${yT}A${rx},${ry} 0 0 0 ${cx - rx},${yT}Z`;
    const lv = clamp(o.level == null ? 0 : o.level, 0, 1);
    const liq = o.liq ? `<g clip-path="url(#${id}c)"><g class="b01-liq" data-span="${span}" style="transform:translateY(${(1 - lv) * span}px);opacity:${lv > 0.002 ? 1 : 0}">
          <rect x="${cx - rx}" y="${yT}" width="${2 * rx}" height="${span + ry + 4}" fill="${o.liq.body}"/>
          <ellipse cx="${cx}" cy="${yT}" rx="${rx}" ry="${ry}" fill="${o.liq.top}"/>
        </g></g>` : '';
    const top = o.open
      ? `<ellipse cx="${cx}" cy="${yT}" rx="${rx}" ry="${ry}" fill="none" stroke="${P.navy}" stroke-width="${sw}"/>`
      : `<ellipse cx="${cx}" cy="${yT}" rx="${rx}" ry="${ry}" fill="${P.paper}" stroke="${P.navy}" stroke-width="${sw}"/><ellipse cx="${cx}" cy="${yT}" rx="${rx * 0.55}" ry="${ry * 0.45}" fill="${P.mist}"/>`;
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
      <defs><clipPath id="${id}c"><path d="${body}"/></clipPath>
        <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="${P.mist2}"/><stop offset=".42" stop-color="${P.paper}"/><stop offset="1" stop-color="${P.mist2}"/></linearGradient></defs>
      <ellipse cx="${cx}" cy="${yB + ry * 0.6}" rx="${rx * 1.05}" ry="${ry * 0.7}" fill="${P.shadow}"/>
      <path d="${body}" fill="url(#${id}g)"/>
      ${o.open ? `<ellipse cx="${cx}" cy="${yT}" rx="${rx}" ry="${ry}" fill="${P.mist2}"/>` : ''}
      ${liq}
      <path d="M${cx - rx * 0.62},${yT + ry + 6}V${yB - 4}" stroke="#fff" stroke-opacity=".45" stroke-width="${Math.max(3, w * 0.05)}" stroke-linecap="round"/>
      <path d="${body}" fill="none" stroke="${P.navy}" stroke-width="${sw}" stroke-linejoin="round"/>
      ${top}
    </svg>`;
  }
  /** set a tank's liquid level (0..1) on the element that contains its svg */
  function setLevel(host, level) {
    const g = host && host.querySelector('.b01-liq'); if (!g) return;
    const span = +g.dataset.span, lv = clamp(level, 0, 1);
    g.style.transform = `translateY(${(1 - lv) * span}px)`;
    g.style.opacity = lv > 0.002 ? 1 : 0;
  }

  /* ---------- small topic icons (48 x 48), navy with one gold accent ---------- */
  const IC = (() => {
    const n = P.navy, g = P.gold, gl = P.goldLt, gp = P.goldPale, m = P.mist, m2 = P.mist2, pa = P.paper, n4 = P.navy4;
    const s = 'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';
    const arcs = [[-30, 80], [90, 200], [210, 320]].map(([a0, a1]) => `<path d="${A.arc(24, 24, 18, a0, a1)}" fill="none" stroke="${g}" stroke-width="4.4" stroke-linecap="round"/>`).join('');
    return {
      form: `<path d="M12 5h18l8 8v30H12z" fill="${pa}" stroke="${n}" ${s}/><path d="M30 5v8h8" fill="${m}" stroke="${n}" ${s}/><path d="M17 20h14M17 26h14M17 32h8" stroke="${m2}" stroke-width="3" stroke-linecap="round"/><circle cx="33" cy="36" r="6.5" fill="${g}"/><path d="M30.2 36.2l2 2 3.8-4.2" fill="none" stroke="${pa}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
      sheet: `<rect x="6" y="9" width="36" height="30" rx="3" fill="${pa}" stroke="${n}" ${s}/><rect x="6" y="9" width="36" height="8" rx="3" fill="${n}"/><path d="M6 24.5h36M6 31.8h36M18 17v22M30 17v22" stroke="${m2}" stroke-width="2"/><rect x="30.8" y="25.3" width="10.4" height="5.7" fill="${gl}"/>`,
      info: `<circle cx="24" cy="24" r="17" fill="${n}"/><circle cx="24" cy="15.6" r="2.9" fill="${gl}"/><rect x="21.5" y="21" width="5" height="14" rx="2.5" fill="${gl}"/>`,
      gps: `<circle cx="24" cy="24" r="16.5" fill="${pa}" stroke="${n}" ${s}/><path d="M24 10.5l5 13.5H19z" fill="${g}"/><path d="M24 37.5L19 24h10z" fill="${n}"/><circle cx="24" cy="24" r="2.6" fill="${pa}" stroke="${n}" stroke-width="1.6"/>`,
      circle: `<circle cx="24" cy="24" r="11.5" fill="${n}"/><circle cx="24" cy="24" r="8.5" fill="none" stroke="${g}" stroke-opacity=".55" stroke-width="1.2"/>${arcs}`,
      coins: `<path d="M8 35v-4.5M30 35v-4.5" stroke="${n}" stroke-width="2.2"/><ellipse cx="19" cy="35" rx="11" ry="4" fill="${gl}" stroke="${n}" stroke-width="2.2"/><ellipse cx="19" cy="30" rx="11" ry="4" fill="${gl}" stroke="${n}" stroke-width="2.2"/><ellipse cx="19" cy="25" rx="11" ry="4" fill="${g}" stroke="${n}" stroke-width="2.2"/><circle cx="35" cy="16" r="8" fill="${g}" stroke="${n}" stroke-width="2.2"/><path d="M35 11.5v9" stroke="${pa}" stroke-width="2" stroke-linecap="round"/>`,
      people: `<circle cx="18" cy="16" r="6.4" fill="${n}"/><path d="M7 38c0-7.5 4.6-11.6 11-11.6S29 30.5 29 38z" fill="${n}"/><circle cx="33" cy="19" r="5.4" fill="${g}"/><path d="M25.5 38c.5-6.4 3.4-9.6 7.5-9.6s7.4 3.2 8 9.6z" fill="${g}"/>`,
      cal: `<rect x="7" y="11" width="34" height="29" rx="3" fill="${pa}" stroke="${n}" ${s}/><rect x="7" y="11" width="34" height="8" rx="3" fill="${n}"/><path d="M16 7v7M32 7v7" stroke="${n}" stroke-width="3" stroke-linecap="round"/><path d="M16.5 29.5l5 5 10-11" fill="none" stroke="${g}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`,
      chat: `<path d="M8 9h21a3.5 3.5 0 0 1 3.5 3.5v10a3.5 3.5 0 0 1-3.5 3.5H17l-6.5 5.5V26H8a3.5 3.5 0 0 1-3.5-3.5v-10A3.5 3.5 0 0 1 8 9z" fill="${n}"/><path d="M40.5 19H27a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.5l5 4.5V34a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3z" fill="${gl}" stroke="${n}" stroke-width="2.2" stroke-linejoin="round"/>`,
      ask: `<path d="M9 8h30a4 4 0 0 1 4 4v17a4 4 0 0 1-4 4H22l-8 6.5V33H9a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="${pa}" stroke="${n}" ${s}/><path d="M19.4 16.6a4.6 4.6 0 1 1 6.7 4.1c-1.7.9-2.1 1.9-2.1 3.6" fill="none" stroke="${g}" stroke-width="3.2" stroke-linecap="round"/><circle cx="24" cy="29" r="2" fill="${g}"/>`,
      clip: `<rect x="10" y="9" width="28" height="33" rx="3" fill="${pa}" stroke="${n}" ${s}/><rect x="17" y="5.5" width="14" height="7" rx="2" fill="${g}" stroke="${n}" stroke-width="2"/><path d="M16 21h16M16 28h16M16 35h10" stroke="${m2}" stroke-width="3" stroke-linecap="round"/>`,
      cart: `<path d="M5 9h6l5 21h21l4-14H13.5" fill="none" stroke="${n}" ${s}/><path d="M16.5 23h22" stroke="${m2}" stroke-width="2.4"/><circle cx="19" cy="37" r="3.6" fill="${g}" stroke="${n}" stroke-width="1.6"/><circle cx="33" cy="37" r="3.6" fill="${g}" stroke="${n}" stroke-width="1.6"/>`,
      cap: `<path d="M4 19l20-9 20 9-20 9z" fill="${n}"/><path d="M12.5 22.5v8.5c0 3 5.2 5.6 11.5 5.6s11.5-2.6 11.5-5.6v-8.5L24 28z" fill="${n4}"/><path d="M40.5 20.5v11" stroke="${g}" stroke-width="2.6" stroke-linecap="round"/><circle cx="40.5" cy="33.5" r="2.8" fill="${g}"/>`,
      nest: `<path d="M24 6c6.2 0 10.6 9.2 10.6 16.2S30.2 33.4 24 33.4s-10.6-4.2-10.6-11.2S17.8 6 24 6z" fill="${g}" stroke="${n}" stroke-width="2.2"/><path d="M19 13c1.5-2 3-3 5-3" stroke="${pa}" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M5.5 28c4 9.4 11 12.6 18.5 12.6S38.5 37.4 42.5 28" fill="none" stroke="${n}" stroke-width="3.4" stroke-linecap="round"/><path d="M9.5 33c5 3.6 9.6 4.6 14.5 4.6s9.5-1 14.5-4.6" fill="none" stroke="${n4}" stroke-width="2.4" stroke-linecap="round"/>`,
      taxdoc: `<path d="M12 5h18l8 8v30H12z" fill="${pa}" stroke="${n}" ${s}/><path d="M30 5v8h8" fill="${m}" stroke="${n}" ${s}/><circle cx="19.5" cy="21" r="3.2" fill="none" stroke="${g}" stroke-width="2.4"/><circle cx="30" cy="33" r="3.2" fill="none" stroke="${g}" stroke-width="2.4"/><path d="M31 18.5L18.5 35.5" stroke="${n}" stroke-width="2.6" stroke-linecap="round"/>`,
      house: `<path d="M12 21v18h24V21" fill="${pa}" stroke="${n}" ${s}/><path d="M6 24L24 9l18 15" fill="none" stroke="${n}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><rect x="20.5" y="27" width="7" height="12" fill="${g}"/>`,
      vault: `<rect x="7" y="8" width="34" height="31" rx="4" fill="${n}"/><circle cx="22" cy="23.5" r="8.5" fill="${pa}" stroke="${g}" stroke-width="2.6"/><path d="M22 17.5v12M16 23.5h12" stroke="${n}" stroke-width="2"/><rect x="34" y="16.5" width="3.6" height="14" rx="1.8" fill="${gl}"/><path d="M12 39v3.5M36 39v3.5" stroke="${n}" stroke-width="3" stroke-linecap="round"/>`,
      annuity: `<circle cx="13" cy="14" r="8.5" fill="${g}" stroke="${n}" stroke-width="2.2"/><path d="M13 9.5v9" stroke="${pa}" stroke-width="2" stroke-linecap="round"/><path d="M12 26c2 8 9 12 18 11.5" fill="none" stroke="${n}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0.1 5.4"/><circle cx="21" cy="34" r="3.4" fill="${gl}" stroke="${n}" stroke-width="1.6"/><circle cx="30.5" cy="37" r="3.4" fill="${gl}" stroke="${n}" stroke-width="1.6"/><circle cx="40" cy="35" r="3.4" fill="${gl}" stroke="${n}" stroke-width="1.6"/><path d="M38 14l4 4-4 4" fill="none" stroke="${n}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 18h15.5" stroke="${n}" stroke-width="2.4" stroke-linecap="round"/>`,
      watch: `<circle cx="24" cy="27" r="14.5" fill="${pa}" stroke="${n}" ${s}/><path d="${A.wedge(24, 27, 11.5, 0, 60)}" fill="${gp}"/><rect x="20.5" y="5.5" width="7" height="5" rx="1.5" fill="${n}"/><path d="M24 10.5v2" stroke="${n}" stroke-width="3"/><path d="M24 27l6.2-6.2" stroke="${g}" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="27" r="2.3" fill="${n}"/><path d="M36 12.5l2.6-2.6" stroke="${n}" stroke-width="2.6" stroke-linecap="round"/>`,
      route: `<path d="M10 38c8 0 8-10 14-10s8-8 13.5-9" fill="none" stroke="${n}" stroke-width="2.8" stroke-linecap="round" stroke-dasharray="0.1 5.6"/><circle cx="10" cy="38" r="3.8" fill="${n}"/><path d="M38 5.5a7.5 7.5 0 0 1 7.5 7.5c0 5.8-7.5 12.5-7.5 12.5s-7.5-6.7-7.5-12.5A7.5 7.5 0 0 1 38 5.5z" fill="${g}"/><circle cx="38" cy="13" r="2.8" fill="${pa}"/>`,
      dice: `<rect x="5" y="15" width="21" height="21" rx="4" transform="rotate(-12 15.5 25.5)" fill="${pa}" stroke="${n}" ${s}/><g fill="${n}"><circle cx="11" cy="21" r="1.9"/><circle cx="15.5" cy="25.5" r="1.9"/><circle cx="20" cy="30" r="1.9"/></g><rect x="23" y="10" width="20" height="20" rx="4" transform="rotate(14 33 20)" fill="${g}" stroke="${n}" ${s}/><g fill="${pa}"><circle cx="28.8" cy="15.2" r="1.9"/><circle cx="37.2" cy="24.8" r="1.9"/><circle cx="37.6" cy="16" r="1.9"/><circle cx="28.4" cy="24" r="1.9"/></g>`,
      chart: `<path d="M7 40h35" stroke="${n}" stroke-width="2.6" stroke-linecap="round"/><rect x="10" y="29" width="6" height="11" fill="${n4}"/><rect x="19" y="23" width="6" height="17" fill="${n4}"/><rect x="28" y="17" width="6" height="23" fill="${n}"/><path d="M8.5 22.5l10-7 7 4 12-10" fill="none" stroke="${g}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 9.5h5v5" fill="none" stroke="${g}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
      gate: `<path d="M10 41V22a14 14 0 0 1 28 0v19" fill="none" stroke="${n}" stroke-width="5"/><path d="M17 41V23a7 7 0 0 1 14 0v18" fill="${gp}" stroke="${g}" stroke-width="2.4"/><path d="M5 41h38" stroke="${n}" stroke-width="3" stroke-linecap="round"/>`,
      bulb: `<path d="M24 5.5a12.5 12.5 0 0 1 7.2 22.6c-1.2.9-2 2.3-2 3.8V33H18.8v-1.1c0-1.5-.8-2.9-2-3.8A12.5 12.5 0 0 1 24 5.5z" fill="${gl}" stroke="${n}" stroke-width="2.4" stroke-linejoin="round"/><path d="M19 37.2h10M20.5 41.4h7" stroke="${n}" stroke-width="2.8" stroke-linecap="round"/><path d="M20.5 22l3.5 4.5 3.5-4.5" fill="none" stroke="${n}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
      cols: `<rect x="8" y="20" width="9" height="20" rx="2" fill="${n4}"/><rect x="20" y="11" width="9" height="29" rx="2" fill="${g}"/><rect x="32" y="26" width="9" height="14" rx="2" fill="${n}"/><path d="M5 41h38" stroke="${n}" stroke-width="2.4" stroke-linecap="round"/>`,
      golf: `<path d="M30.5 6.5L18.5 36" stroke="${n}" stroke-width="3" stroke-linecap="round"/><path d="M27.5 6l6 1" stroke="${g}" stroke-width="5.5" stroke-linecap="round"/><path d="M18.2 35.4c-1.2 3 .8 5.3 5 4.8l6.2-1.6-1.6-4.2z" fill="${n}"/><circle cx="36" cy="38" r="4.4" fill="${pa}" stroke="${n}" stroke-width="2"/>`,
      trio: `<circle cx="11" cy="35" r="5" fill="${m2}" stroke="${n}" stroke-width="2"/><circle cx="23.5" cy="30.5" r="7" fill="${gl}" stroke="${n}" stroke-width="2"/><circle cx="37" cy="23.5" r="9" fill="${g}" stroke="${n}" stroke-width="2"/><path d="M8 18l9-6 8 3 9-8" fill="none" stroke="${n}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
      shield: `<path d="M24 5l15 6v10.5c0 10-6.5 16.8-15 21C15.5 38.3 9 31.5 9 21.5V11z" fill="${n}"/><path d="M16.8 23l5 5 9.5-10.5" fill="none" stroke="${gl}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`,
      pie: `<path d="${A.wedge(24, 24, 17, 0, 128)}" fill="${g}"/><path d="${A.wedge(24, 24, 17, 128, 245)}" fill="${n4}"/><path d="${A.wedge(24, 24, 17, 245, 360)}" fill="${n}"/><circle cx="24" cy="24" r="17" fill="none" stroke="${pa}" stroke-width="1.4"/>`,
      hourglass: `<path d="M13 6h22M13 42h22" stroke="${n}" stroke-width="3.2" stroke-linecap="round"/><path d="M15.5 6c0 10 8.5 11.5 8.5 18s-8.5 8-8.5 18h17c0-10-8.5-11.5-8.5-18s8.5-8 8.5-18z" fill="${pa}" stroke="${n}" stroke-width="2.4" stroke-linejoin="round"/><path d="M19 38.5c1.6-5 5-5.6 5-9.2 0 3.6 3.4 4.2 5 9.2z" fill="${g}"/><path d="M19.6 11.5h8.8c-1 3-3 4.5-4.4 6-1.4-1.5-3.4-3-4.4-6z" fill="${g}"/>`,
      split: `<path d="M24 41V25L12.5 13.5M24 25l11.5-11.5" fill="none" stroke="${n}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 20.5V11.5h9M37.5 20.5V11.5h-9" fill="none" stroke="${g}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`,
      scroll: `<rect x="11" y="8" width="26" height="32" rx="2" fill="${pa}" stroke="${n}" ${s}/><path d="M8.5 8h31M8.5 40h31" stroke="${n}" stroke-width="4.6" stroke-linecap="round"/><path d="M16 16.5h16M16 22.5h16M16 28.5h9" stroke="${m2}" stroke-width="2.8" stroke-linecap="round"/><path d="M27 34l3-4.5 3 2.5 3.5-5.5" fill="none" stroke="${g}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
      pct: `<circle cx="15" cy="15" r="6.2" fill="none" stroke="${n}" stroke-width="3.4"/><circle cx="33" cy="33" r="6.2" fill="none" stroke="${g}" stroke-width="3.4"/><path d="M36.5 10L11.5 38" stroke="${n}" stroke-width="3.6" stroke-linecap="round"/>`,
      scale: `<path d="M24 9v29M14.5 40.5h19" stroke="${n}" stroke-width="3" stroke-linecap="round"/><path d="M8.5 14h31" stroke="${n}" stroke-width="3" stroke-linecap="round"/><path d="M8.5 14L3.5 26h10zM39.5 14l-5 12h10z" fill="${gp}" stroke="${n}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="24" cy="8.5" r="3.2" fill="${g}"/>`,
      key: `<circle cx="15.5" cy="24" r="8.2" fill="none" stroke="${g}" stroke-width="4.4"/><path d="M24 24h18.5M36.5 24v6.5M41.5 24v5" stroke="${n}" stroke-width="3.6" stroke-linecap="round"/>`,
      pem: `<rect x="5" y="9" width="13" height="25" rx="3" fill="${pa}" stroke="${n}" stroke-width="2.2"/><rect x="7.4" y="22" width="8.2" height="9.6" fill="${n4}"/><rect x="24" y="9" width="8.5" height="15" rx="2.4" fill="${pa}" stroke="${n}" stroke-width="2.2"/><rect x="25.6" y="15" width="5.3" height="7.4" fill="${g}"/><rect x="35.5" y="9" width="8.5" height="15" rx="2.4" fill="${pa}" stroke="${n}" stroke-width="2.2"/><rect x="37.1" y="13" width="5.3" height="9.4" fill="${n4}"/><path d="M11.5 34v5H43" fill="none" stroke="${n}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 24v15" stroke="${n}" stroke-width="2.6"/>`
    };
  })();
  const icon = (name, sz) => `<svg viewBox="0 0 48 48" width="${sz || 38}" height="${sz || 38}" aria-hidden="true">${IC[name] || IC.info}</svg>`;

  /** a small plumbing picture of the Personal Economic Model for hub tiles */
  function pemMini(w) {
    const n = P.navy, g = P.gold, pa = P.paper, n4 = P.navy4, m = P.mist;
    return `<svg viewBox="0 0 150 112" width="${w}" height="${w * 112 / 150}" aria-hidden="true">
      <ellipse cx="75" cy="104" rx="66" ry="5" fill="${P.shadow}"/>
      <path d="M17 10v8" stroke="${n}" stroke-width="5" stroke-linecap="round"/>
      <rect x="6" y="18" width="30" height="62" rx="6" fill="${pa}" stroke="${n}" stroke-width="3"/>
      <rect x="10" y="48" width="22" height="28" rx="2" fill="${n4}"/>
      <path d="M21 80v12h104" fill="none" stroke="${n}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 80v12h104" fill="none" stroke="${m}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="58" y="84" width="16" height="16" rx="3" fill="${g}" stroke="${n}" stroke-width="2.4"/>
      <rect x="54" y="20" width="26" height="44" rx="5" fill="${pa}" stroke="${n}" stroke-width="3"/>
      <rect x="58" y="38" width="18" height="22" rx="2" fill="${g}"/>
      <rect x="96" y="20" width="26" height="44" rx="5" fill="${pa}" stroke="${n}" stroke-width="3"/>
      <rect x="100" y="32" width="18" height="28" rx="2" fill="${n4}"/>
      <path d="M88 64v22" stroke="${n}" stroke-width="5"/><path d="M67 14h42" stroke="${n}" stroke-width="4" stroke-linecap="round"/>
      <path d="M67 14v6M109 14v6M88 14v-6" stroke="${n}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="88" cy="8" r="4.5" fill="${g}" stroke="${n}" stroke-width="2"/>
    </svg>`;
  }

  /* =====================================================================
     Ten-step launchpads (tslp1, tslpl1, tslpclnlg1)
     ===================================================================== */
  /** presenter talk tracks, one per topic; Joshua replaces any of them with his own wording */
  const TT = {
    pemInterview: 'Before we talk about any product, I want to see how money moves through your life today.\nThis model is a picture of every dollar: what comes in, what taxes take, what you live on, what you save and what you owe.\nAsk: If we drew your picture today, which part would you want to look different five years from now?\nPAUSE\nLet the client point. Their answer tells you where to begin.',
    doorOpener: 'Open with curiosity, not a pitch. People share more when they feel heard.\nAsk: What do you do, and what do you enjoy most about it?\nThen: Would it be all right if I asked you four questions I ask everyone I work with?\nPAUSE\nListen for the answer that carries feeling. That is the door.',
    pem101: 'This lesson teaches the model one piece at a time, so the client can read their own picture.\nWalk through income, taxes, lifestyle and the two tanks before any numbers appear.\nAsk: Where does most of your money go today: lifestyle, savings, or somewhere you cannot quite see?\nPAUSE',
    fgps: 'The Financial GPS shows where you are, where you want to go, and the route between them.\nGather today\'s numbers first, then the destination in the client\'s own words.\nAsk: If nothing changed from today, would you arrive where you want to be?\nPAUSE',
    ctAcc: 'Circle Talk frames the whole conversation: every dollar is accumulated, enjoyed or transferred away.\nMost people have only been shown one slice. We look at the whole circle.\nAsk: Which kind of money has anyone ever helped you look at closely?\nPAUSE',
    ctRet: 'For retirees the circle turns from building to living. The questions become how long it lasts and whom it reaches.\nAsk: Now that the paychecks have stopped, what concerns you most about the money you have?\nPAUSE',
    ctBiz: 'For business owners the circle includes the company, which often holds most of the wealth and most of the risk.\nAsk: If the business ran a little leaner, where would you want those dollars to go?\nPAUSE',
    comp: 'Be direct about how I am paid. Clients trust what is said plainly.\nExplain each way I may be compensated, in the client\'s language, before any recommendation.\nAsk: What questions do you have about how I am paid?\nPAUSE\nKeep this consistent with the written compensation disclosure.',
    intro: 'Good work is shared by the people who receive it. Plant the idea early, without pressure.\nAsk: As we go, who comes to mind who would want to see what you are seeing?\nPAUSE\nWrite down names only when they are offered freely.',
    nextMeeting: 'Close every meeting with a clear next step and a short list.\nConfirm the date, who will attend, and what to bring: statements, policies, benefit summaries and the questionnaire.\nAsk: Is there anyone else who should be at the table next time?\nPAUSE',
    commProfile: 'Each person takes in information differently. The communication profile tells us how to present so it lands.\nReview it together and adjust: more detail or more summary, more pictures or more time.\nAsk: How do you like to receive information when a decision matters?\nPAUSE',
    commIntro: 'Introduce the communication profile as a courtesy: it helps us talk in a way that suits you.\nAsk: Have you ever left a meeting with a professional and felt you were not really heard?\nPAUSE',
    tenQ: 'Open-ended questions invite stories, and stories reveal what matters.\nAsk one, then stay quiet. Let the silence do the work.\nAsk: What would make the next ten years feel like a success to you?\nPAUSE',
    reviewData: 'Review the questionnaire line by line, with the client, not for the client.\nConfirm the numbers, then ask about the feelings behind them.\nAsk: Is there anything here that surprised you when you wrote it down?\nPAUSE',
    questIntro: 'The questionnaire is how we see the full picture. Explain why each section matters before it is filled in.\nEverything stays confidential and is used only to serve you.\nAsk: Which section do you expect to be the hardest to complete?\nPAUSE',
    mcp101: 'Major purchases are where many families quietly lose wealth: cars, homes, remodels.\nThis lesson shows the real cost of how a purchase is paid for, not just what it costs.\nAsk: How did you pay for the last large purchase you made?\nPAUSE',
    cp101: 'College competes with every other goal. The way you pay for it touches retirement, taxes and aid.\nAsk: If you paid for college the way most families do, what would that do to your retirement?\nPAUSE',
    qp101: 'Qualified plans postpone the tax and the tax calculation. Postponing is not the same as avoiding.\nAsk: What tax bracket do you expect to be in when you start taking money out?\nPAUSE',
    ta101: 'Taxable accounts give access and flexibility, and they send a tax bill in every year the account grows.\nAsk: How much did your accounts pay in taxes last year, before you spent a dollar of them?\nPAUSE',
    mf101: 'A mortgage is often the largest financial decision a family makes, and the one least revisited.\nThis lesson looks at term, down payment and payoff choices through the model.\nAsk: When did someone last walk through your mortgage with you?\nPAUSE',
    f101: 'Every purchase is financed: either you pay interest to a lender, or you give up the interest your own money could have earned.\nAsk: Which of those two costs have you been paying without noticing?\nPAUSE',
    prs: 'A private reserve is money you control, with access when you need it, working for you while it waits.\nShow how capital can be used and recaptured instead of spent and gone.\nAsk: If you had a reserve you could borrow from and repay on your own terms, how would that change your decisions?\nPAUSE',
    a101: 'Start with risk, not returns. An annuity moves specific risks to an insurance company: market losses at the wrong time, the order of returns, and outliving your money.\nAsk: Which worries you more: the market dropping early in retirement, or living longer than your savings?\nPAUSE\nGuarantees are backed by the claims-paying ability of the issuing insurer.',
    tml: 'Ten minutes on how a life insurance policy is designed, from the minimum premium up to the federal maximum.\nThe point to land: design drives benefits.\nAsk: If you could choose the benefits first and the product second, which benefits would you want?\nPAUSE',
    revGps: 'In the closing meeting, show the revised route beside the one we started with.\nRecap each change and the reason for it, in the client\'s own words.\nAsk: Looking at both routes, which one feels like yours?\nPAUSE',
    spendGame: 'The Spending Game turns the plan into choices the client makes with their own hands.\nLet them place the dollars, then reflect together on what they chose.\nAsk: What did the way you played tell you about your priorities?\nPAUSE',
    wip: 'Wealth and income potential shows what your earning years could produce, and how much of it is already spoken for.\nAsk: Of everything you will earn, how much do you expect to keep?\nPAUSE',
    lifestyle: 'The lifestyle spreadsheet captures what life really costs, month by month and year by year.\nFill it in together. Small lines add up to big decisions.\nAsk: Which line on this sheet would you never want to give up?\nPAUSE',
    cok: 'The Circle of Knowledge separates what you know, what you know you do not know, and what you do not know you do not know.\nOur work lives in that last space.\nAsk: What is one money topic you wish someone had explained to you years ago?\nPAUSE',
    cat: 'Compare account types side by side: how each is taxed, how easy it is to reach, and how it behaves at death.\nAsk: If you could keep only one account for the next thirty years, what would matter most?\nPAUSE',
    cvs: 'A new club will not fix a golf swing. Products are the clubs; the process is the swing.\nAsk: When something has not worked financially, did you change the product or the process?\nPAUSE',
    sswc: 'Spenders, savers and wealth creators can earn the same income and end up in very different places.\nThe difference is how capital is used and recaptured.\nAsk: Which of the three describes you today? Which would you like to be?\nPAUSE',
    cvli101: 'Cash value life insurance is a contract with living benefits as well as a death benefit.\nExplain the basics plainly before any illustration. Loans and withdrawals reduce cash value and death benefit and may cause the policy to lapse.\nAsk: Has anyone ever explained a policy to you as something you use while you are alive?\nPAUSE',
    am: 'Allocation Mix compares where your money sits today with where you want it, by risk, taxation and access.\nAsk: If the two pictures do not match, which one should change?\nPAUSE',
    rron: 'Retirement: Ready or Not? looks at whether today\'s savings can carry tomorrow\'s lifestyle.\nAsk: If you retired today, how long would your money last at the lifestyle you enjoy?\nPAUSE',
    qpd2t: 'Qualified plans do two things: they postpone the tax, and they postpone the tax calculation.\nAsk: Who decides what the tax rate will be when you take the money out?\nPAUSE',
    taxhist: 'Tax rates have moved a great deal over the last hundred years. History shows how wide the range can be.\nAsk: Do you expect tax rates to be higher or lower when you retire?\nPAUSE',
    nvsw: 'Needs come first, wants second. Protection planning starts with what must be covered.\nAsk: If your income stopped tomorrow, what would your family need first?\nPAUSE',
    upl: 'A policy loan lets you use the policy\'s value while it keeps working. The insurer is the lender and the policy is the collateral.\nLoans reduce cash value and death benefit and may cause the policy to lapse,.\nAsk: How would access to your own capital, on your terms, change the way you buy things?\nPAUSE'
  };
  /** printable client forms shown on stage (the original opened separate files) */
  const FORMS = {
    fourQ: {
      t: 'Four Important Questions', k: 'Questions I ask everyone I work with',
      items: ['What do you want your money to do for you and the people you love?', 'What worries you most about money right now?', 'If we work together, what would have to happen for you to feel it was worth your time?', 'Who else, besides you, would your plan need to take care of?']
    },
    tenQ: {
      t: 'Ten Open-Ended Questions', k: 'Take your time. There are no wrong answers.',
      items: ['What does a good year look like for you, with money and otherwise?', 'Where do you see yourself ten years from now?', 'How would you spend your time if money were not a concern?', 'What has worked well for you with money so far?', 'What has not worked the way you hoped?', 'How did your parents handle money, and how has that shaped you?', 'Who depends on you, and in what ways?', 'What would you want to happen if you were not here tomorrow?', 'What keeps you up at night when you think about the future?', 'What would make our time together worthwhile for you?']
    },
    quest: {
      t: 'Confidential Questionnaire', k: 'The full picture, kept private and used only to serve you',
      secs: [['About You', ['Name', 'Date of birth', 'Spouse or partner', 'Children and dependents']], ['Work and Income', ['Employer and role', 'Annual income', 'Other income', 'Planned retirement age']], ['Savings and Investments', ['Bank and cash accounts', 'Investment accounts', 'Retirement plans', 'Real estate']], ['Protection', ['Life insurance', 'Disability coverage', 'Long-term care', 'Property and liability']], ['What You Owe', ['Mortgage', 'Auto loans', 'Credit cards', 'Other debts']], ['What Matters Most', ['Goals', 'Concerns', 'Timeline', 'Your attorney and tax preparer']]]
    },
    life: {
      t: 'Lifestyle Expenses', k: 'What life really costs, month by month',
      cols: ['Category', 'Monthly', 'Annual'], tot: 'Total',
      rows: ['Housing', 'Utilities', 'Food and dining', 'Transportation', 'Insurance', 'Health care', 'Personal care', 'Entertainment', 'Travel', 'Gifts and giving', 'Education', 'Debt payments', 'Savings', 'Other']
    }
  };
  function formCopy(kind, out) {
    const f = FORMS[kind];
    out[`f.${kind}.t`] = f.t; out[`f.${kind}.k`] = f.k;
    (f.items || []).forEach((q, i) => { out[`f.${kind}.${i + 1}`] = q; });
    (f.secs || []).forEach(([h, fl], i) => { out[`f.${kind}.s${i + 1}`] = h; fl.forEach((x, j) => { out[`f.${kind}.s${i + 1}.${j + 1}`] = x; }); });
    if (f.rows) { f.cols.forEach((c, i) => { out[`f.${kind}.c${i + 1}`] = c; }); out[`f.${kind}.tot`] = f.tot; f.rows.forEach((r, i) => { out[`f.${kind}.r${i + 1}`] = r; }); }
  }
  function openForm(ctx, kind) {
    const f = FORMS[kind]; let body = `<p class="b01-kick">${ctx.t(`f.${kind}.k`)}</p>`;
    if (f.items) body += `<ol class="b01-form-l ${f.items.length > 5 ? 'two' : ''}">${f.items.map((_, i) => `<li><span>${ctx.t(`f.${kind}.${i + 1}`)}<span class="ln"></span></span></li>`).join('')}</ol>`;
    if (f.secs) body += `<div class="b01-qgrid">${f.secs.map(([, fl], i) => `<div class="b01-qsec"><h4>${ctx.t(`f.${kind}.s${i + 1}`)}</h4>${fl.map((_, j) => `<div class="fl">${ctx.t(`f.${kind}.s${i + 1}.${j + 1}`)}</div>`).join('')}</div>`).join('')}</div>`;
    if (f.rows) body += `<table class="st-table b01-lifet"><thead><tr>${f.cols.map((_, i) => `<th>${ctx.t(`f.${kind}.c${i + 1}`)}</th>`).join('')}</tr></thead><tbody>${f.rows.map((_, i) => `<tr><td>${ctx.t(`f.${kind}.r${i + 1}`)}</td><td></td><td></td></tr>`).join('')}<tr class="hl"><td>${ctx.t(`f.${kind}.tot`)}</td><td></td><td></td></tr></tbody></table>`;
    ctx.overlay({ title: ctx.t(`f.${kind}.t`), html: body, cls: 'b01-ov-md' });
  }

  const STEPS_CURRENT = ['Open & Ask\nFour Questions', 'Introduce\nthe Model', 'Answer the\nFour Questions', "Explain How\nI'm Paid", 'Book the\nNext Meeting', 'Review\nClient Data', 'Spot\nInefficiencies', 'Access to\nCapital', 'Explore\nOptions', 'Confirm\n& Act'];
  const STEPS_LEGACY = ['Get\nAcquainted', 'Share Our\nApproach', 'Introduce\nQuestionnaires', "Explain How\nI'm Paid", 'Talk\nReferrals', 'Review\nQuestionnaires', 'Spot\nInefficiencies', 'Discuss\nAlternatives', 'Build\nthe Plan', 'Take\nAction'];
  /* tile: k, at [left %, top %], vis (T tools, TD tools + docs, A always, D docs), label | lib (library title), icon, go [KEY, screen] | form | sg, tt (talk track), tip */
  const T101 = (x0, dx) => [
    { k: 'mcp', at: [x0, 70], vis: 'T', label: 'Major\nPurchases', icon: 'cart', go: ['MCPF101', 'mcpf1'], tt: 'mcp101' },
    { k: 'cp', at: [x0 + dx[0], 70], vis: 'T', label: 'College\nPlanning', icon: 'cap', go: ['CPF101', 'cpf1'], tt: 'cp101' },
    { k: 'qp', at: [x0 + dx[1], 70], vis: 'T', label: 'Qualified\nPlans', icon: 'nest', go: ['QP101', 'qpf1'], tt: 'qp101' },
    { k: 'ta', at: [x0 + dx[2], 70], vis: 'T', label: 'Taxable\nAccounts', icon: 'taxdoc', go: ['TAF101', 'taf1'], tt: 'ta101' },
    { k: 'mf', at: [x0 + dx[3], 70], vis: 'T', label: 'Mortgages', icon: 'house', go: ['MF101', 'mf1'], tt: 'mf101' }
  ];
  const LP = {
    tslp1: {
      title: 'Ten-step client process launchpad', steps: STEPS_CURRENT,
      notes: 'This is the map of how we work together: ten steps, from the first conversation to a plan in action.\n\n- Ask: Where would you say we are on this map today?\nPAUSE\n\n- Show Tools reveals the presentations for each step. Show Documentation turns every tile into its talk track.',
      tiles: [
        { k: 'fourQ', at: [47, 7], vis: 'T', label: '4 Important\nQuestions', icon: 'form', form: 'fourQ', tt: 'doorOpener' },
        { k: 'pem101', at: [63, 19], vis: 'T', lib: 'PEM101', icon: 'pem', go: ['PEM101', 'pemf1'], tt: 'pem101' },
        { k: 'fgps', at: [68, 37], vis: 'T', lib: 'FGPS', icon: 'gps', go: ['FGPS', 'fgps1'], tt: 'fgps' },
        { k: 'ct', at: [77, 37], vis: 'T', lib: 'CT', icon: 'circle', go: ['CT', 'ct1'], tt: 'ctAcc' },
        { k: 'comp', at: [68, 52], vis: 'TD', label: 'Compensation', icon: 'info', tt: 'comp' },
        { k: 'intro', at: [77, 52], vis: 'TD', label: 'Future\nIntroductions', icon: 'info', tt: 'intro' },
        { k: 'next', at: [61.5, 67], vis: 'TD', label: 'Items for\nNext Meeting', icon: 'info', tt: 'nextMeeting' },
        { k: 'commP', at: [70, 67], vis: 'TD', label: 'Communication\nProfile', icon: 'info', tt: 'commProfile' },
        { k: 'tenQ', at: [47, 76], vis: 'T', label: '10 Open-Ended\nQuestions', icon: 'ask', form: 'tenQ', tt: 'tenQ' },
        { k: 'review', at: [53.5, 76], vis: 'TD', label: 'Review\nFinancial Data', icon: 'info', tt: 'reviewData' }
      ].concat(T101(8, [7, 14, 21, 27]), [
        { k: 'prs', at: [27, 52], vis: 'T', lib: 'PRS', icon: 'vault', go: ['PRS', 'prs21'], tt: 'prs' },
        { k: 'a101', at: [20, 37], vis: 'T', label: 'Annuities', icon: 'annuity', go: ['A101', 'af1'], tt: 'a101' },
        { k: 'tml', at: [27, 37], vis: 'T', label: '10-Min.\nLesson', icon: 'watch', go: ['TML101', 'tmlif1'], tt: 'tml' },
        { k: 'rgps', at: [24, 19], vis: 'T', label: 'Revised\nGPS', icon: 'route', go: ['FGPSC', 'fgps22'], tt: 'revGps', tip: 'Revised Financial GPS' },
        { k: 'sg', at: [31.5, 19], vis: 'T', label: 'Spending\nGame', icon: 'dice', sg: true, tt: 'spendGame' }
      ])
    },
    tslpl1: {
      title: 'Ten-step client process launchpad (legacy)', steps: STEPS_LEGACY,
      notes: 'The ten steps of how we work together, with every tool we use along the way.\n\n- Ask: Which of these steps have you been through with anyone before?\nPAUSE\n\n- Show Tools reveals the presentations. Show Documentation turns each tile into its talk track.',
      tiles: [
        { k: 'door', at: [2, 5], vis: 'TD', label: 'Door\nOpeners', icon: 'info', tt: 'doorOpener' },
        { k: 'tenQ', at: [43.5, 7], vis: 'T', label: '10 Open-Ended\nQuestions', icon: 'ask', form: 'tenQ', tt: 'tenQ' },
        { k: 'fgps', at: [50, 7], vis: 'T', lib: 'FGPS', icon: 'gps', go: ['FGPS', 'fgps1'], tt: 'fgps' },
        { k: 'ct', at: [63, 19], vis: 'T', lib: 'CT', icon: 'circle', go: ['CT', 'ct1'], tt: 'ctAcc' },
        { k: 'ct2', at: [71, 19], vis: 'T', lib: 'CT2', icon: 'circle', go: ['CT2', 'ct1'], tt: 'ctRet' },
        { k: 'ct3', at: [79, 19], vis: 'T', lib: 'CT3', icon: 'circle', go: ['CT3', 'ct1'], tt: 'ctBiz' },
        { k: 'wip', at: [87, 19], vis: 'T', lib: 'WIP', icon: 'chart', go: ['WIP', 'wip1'], tt: 'wip' },
        { k: 'quest', at: [68, 37], vis: 'T', label: 'Confidential\nQuestionnaire', icon: 'clip', form: 'quest', tt: 'questIntro' },
        { k: 'ccp', at: [77, 37], vis: 'T', lib: 'CCP', icon: 'gate', go: ['CCP', 'gw1'], tt: 'commIntro' },
        { k: 'life', at: [84, 37], vis: 'T', label: 'Lifestyle\nSpreadsheet', icon: 'sheet', form: 'life', tt: 'lifestyle' },
        { k: 'comp', at: [68, 52], vis: 'TD', label: 'Compensation', icon: 'info', tt: 'comp' },
        { k: 'intro', at: [62.5, 67], vis: 'TD', label: 'Future\nIntroductions', icon: 'info', tt: 'intro' },
        { k: 'cok', at: [47, 73], vis: 'T', lib: 'COK', icon: 'bulb', go: ['COK', 'know1'], tt: 'cok' },
        { k: 'questR', at: [42, 82.5], vis: 'TD', label: 'Confidential\nQuestionnaire', icon: 'info', tt: 'reviewData' },
        { k: 'commP', at: [51.5, 82.5], vis: 'TD', label: 'Communication\nProfile', icon: 'info', tt: 'commProfile' }
      ].concat(T101(8, [7, 14, 21, 27]), [
        { k: 'cat', at: [14, 52], vis: 'T', label: 'Compare\nAccount Types', icon: 'cols', go: ['CAT', 'ca1'], tt: 'cat' },
        { k: 'cvs', at: [21, 52], vis: 'T', lib: 'CVS', icon: 'golf', go: ['CVS', 'cvs1'], tt: 'cvs' },
        { k: 'sswc', at: [27, 52], vis: 'T', lib: 'SSWC', icon: 'trio', go: ['SSWC', 'sswc1'], tt: 'sswc' },
        { k: 'cvli', at: [13, 37], vis: 'T', label: 'CVLI 101', icon: 'shield', go: ['PLI101', 'plif1'], tt: 'cvli101', tip: 'Cash Value Life Insurance 101' },
        { k: 'a101', at: [20, 37], vis: 'T', label: 'Annuities\n101', icon: 'annuity', go: ['A101', 'af1'], tt: 'a101' },
        { k: 'am', at: [27, 37], vis: 'T', label: 'Allocation\nMix', icon: 'pie', go: ['AM', 'am1'], tt: 'am' },
        { k: 'prs', at: [24, 19], vis: 'T', lib: 'PRS', icon: 'vault', go: ['PRS', 'prs21'], tt: 'prs' },
        { k: 'sg', at: [31.5, 19], vis: 'T', label: 'Spending\nGame', icon: 'dice', sg: true, tt: 'spendGame' }
      ])
    },
    tslpclnlg1: {
      title: 'Ten-step client process launchpad (lite edition)', steps: STEPS_LEGACY, fixedTools: true, hubNoBadge: true,
      notes: 'The ten steps of how we work together, with the lessons for each step always in view.\n\n- Ask: Which step matters most to you right now?\nPAUSE\n\n- Show Documentation turns each tile into its talk track. The 101 tiles in the lower row have none.',
      tiles: [
        { k: 'door', at: [2, 5], vis: 'D', label: 'Door\nOpeners', icon: 'info', tt: 'doorOpener' },
        { k: 'tenQ', at: [46.9, 5], vis: 'A', label: '10 Open-Ended\nQuestions', icon: 'ask', form: 'tenQ', tt: 'tenQ' },
        { k: 'pem101', at: [62, 15], vis: 'A', lib: 'PEM101', icon: 'pem', go: ['PEM101', 'pemf1'], tt: 'pemInterview' },
        { k: 'rron', at: [69, 15], vis: 'A', lib: 'RRON', icon: 'hourglass', go: ['RRON', 'rron1'], tt: 'rron' },
        { k: 'qpd2t', at: [76, 15], vis: 'A', label: 'Qualified Plans\nDo 2 Things', icon: 'split', go: ['QPD2T', 'qpdo2t1'], tt: 'qpd2t' },
        { k: 'taxh', at: [83, 15], vis: 'A', label: 'Tax\nHistory', icon: 'scroll', go: ['TAXHIST', 'taxhist1'], tt: 'taxhist' },
        { k: 'wip', at: [89.5, 15], vis: 'A', lib: 'WIP', icon: 'chart', go: ['WIP', 'wip1'], tt: 'wip' },
        { k: 'quest', at: [68, 35], vis: 'A', label: 'Confidential\nQuestionnaire', icon: 'clip', form: 'quest', tt: 'questIntro' },
        { k: 'comp', at: [68, 52], vis: 'D', label: 'Compensation', icon: 'info', tt: 'comp' },
        { k: 'intro', at: [62.5, 67], vis: 'D', label: 'Future\nIntroductions', icon: 'info', tt: 'intro' },
        { k: 'questR', at: [47, 76], vis: 'D', label: 'Confidential\nQuestionnaire', icon: 'info', tt: 'reviewData' }
      ].concat(T101(0.5, [7.5, 14.5, 21.5, 28.5]).map((t) => Object.assign({}, t, { vis: 'A' })), [
        { k: 'f101', at: [35, 70], vis: 'A', label: 'Finance', icon: 'pct', go: ['F101', 'f1'], tt: 'f101' },
        { k: 'nvsw', at: [8, 32], vis: 'A', label: 'Needs vs.\nWants', icon: 'scale', go: ['NVSW', 'nvsw1'], tt: 'nvsw' },
        { k: 'tmli', at: [16, 32], vis: 'A', label: '10 Min. Lesson\non LI', icon: 'watch', go: ['TMLI', 'tmli1'], tt: 'tml' },
        { k: 'upl', at: [24, 32], vis: 'A', label: 'Understanding\nPolicy Loans', icon: 'key', go: ['UPL', 'upl1'], tt: 'upl' },
        { k: 'hmc', at: [8, 48], vis: 'A', label: 'Needs vs.\nWants 101', icon: 'scale', go: ['HMC101', 'hmc1'], tt: null },
        { k: 'tml101', at: [16, 48], vis: 'A', label: '10 Min.\nLesson 101', icon: 'watch', go: ['TML101', 'tmlif1'], tt: null },
        { k: 'upl101', at: [24, 48], vis: 'A', label: 'Understanding\nPolicy Loans 101', icon: 'key', go: ['UPL101', 'atc3'], tt: null }
      ])
    }
  };
  const RING = {
    L: { cx: 800, cy: 446, rb: 198, bw: 46, rx: 378, ry: 310, cw: 188, hub: 180, dot: 8 },
    S: { cx: 800, cy: 423, rb: 113, bw: 26, rx: 212, ry: 178, cw: 110, hub: 86, dot: 5.5 }
  };
  function lpCopy(cfg) {
    const c = { stepWord: 'Step', chkTools: 'Show Tools', chkDocs: 'Show Documentation', ttKicker: 'Talk track', sgNote: 'The Spending Game is played as its own exercise and is not part of this library yet.' };
    cfg.steps.forEach((s, i) => { c['s' + (i + 1)] = s; });
    const used = new Set(['pemInterview']), forms = new Set();
    cfg.tiles.forEach((t) => {
      if (t.label) c['tile.' + t.k] = t.label;
      if (t.tip) c['tip.' + t.k] = t.tip;
      if (t.tt) used.add(t.tt);
      if (t.form) forms.add(t.form);
    });
    used.forEach((k) => { c['tt.' + k] = TT[k]; });
    forms.forEach((k) => formCopy(k, c));
    return c;
  }
  function ringHTML(ctx, cfg, size) {
    const g = RING[size], cards = [], lines = [], dots = [], chev = [];
    for (let i = 0; i < 10; i++) {
      const a = i * 36;
      const [dx, dy] = A.pt(g.cx, g.cy, g.rb, a);
      const x = g.cx + g.rx * Math.sin(a * Math.PI / 180), y = g.cy - g.ry * Math.cos(a * Math.PI / 180);
      lines.push(`<path d="M${dx.toFixed(1)},${dy.toFixed(1)}L${x.toFixed(1)},${y.toFixed(1)}" stroke="${P.mist2}" stroke-width="${size === 'L' ? 3 : 2}"/>`);
      dots.push(`<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${g.dot}" fill="${P.gold}" stroke="${P.paper}" stroke-width="${size === 'L' ? 3 : 2}"/>`);
      const [hx, hy] = A.pt(g.cx, g.cy, g.rb, a + 18), s = size === 'L' ? 7 : 4.5;
      const ux = Math.cos((a + 18) * Math.PI / 180), uy = Math.sin((a + 18) * Math.PI / 180); // tangent (clockwise)
      const nx = Math.sin((a + 18) * Math.PI / 180), ny = -Math.cos((a + 18) * Math.PI / 180); // outward
      chev.push(`<path d="M${(hx - ux * s + nx * s).toFixed(1)},${(hy - uy * s + ny * s).toFixed(1)}L${(hx + ux * s * 0.6).toFixed(1)},${(hy + uy * s * 0.6).toFixed(1)}L${(hx - ux * s - nx * s).toFixed(1)},${(hy - uy * s - ny * s).toFixed(1)}" fill="none" stroke="${P.navy4}" stroke-opacity=".55" stroke-width="${size === 'L' ? 3 : 2}" stroke-linecap="round" stroke-linejoin="round"/>`);
      cards.push(`<div class="b01-lp-card" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${g.cw}px"><div class="h">${ctx.t('stepWord')} <span class="num">${i + 1}</span></div><div class="b">${ctx.t('s' + (i + 1))}</div></div>`);
    }
    const hubBadge = cfg.hubNoBadge ? '' : `<span class="b01-bdg b01-docb">${infoGlyph(size === 'L' ? 20 : 17)}</span>`;
    return `<svg class="b01-full" viewBox="0 0 1600 900">
        <circle cx="${g.cx}" cy="${g.cy}" r="${g.rb}" fill="none" stroke="${P.mist}" stroke-width="${g.bw}"/>
        <circle cx="${g.cx}" cy="${g.cy}" r="${g.rb + g.bw / 2}" fill="none" stroke="${P.mist2}" stroke-width="1.5"/>
        <circle cx="${g.cx}" cy="${g.cy}" r="${g.rb - g.bw / 2}" fill="none" stroke="${P.mist2}" stroke-width="1.5"/>
        ${lines.join('')}${chev.join('')}${dots.join('')}
      </svg>
      ${cards.join('')}
      <div class="b01-lp-hub" data-hub="1" style="left:${g.cx}px;top:${g.cy}px">
        <div class="ic" style="width:${g.hub}px;height:${Math.round(g.hub * 0.8)}px">${pemMini(g.hub * 0.82)}${hubBadge}</div>
        ${EFA.cp('_lib', 'p.PEM', { cls: 'lb' })}
      </div>`;
  }
  function tileLabel(ctx, t) { return t.lib ? EFA.cp('_lib', 'p.' + t.lib, { cls: 'lb' }) : ctx.t('tile.' + t.k, { cls: 'lb' }); }
  function openTT(ctx, topic, titleHTML) {
    ctx.overlay({ title: titleHTML, html: `<p class="b01-kick">${ctx.t('ttKicker')}</p>${ctx.t('tt.' + topic, { tag: 'div', cls: 'b01-tt' })}`, cls: 'b01-ov-md' });
  }
  function launchpad(id, cfg) {
    EFA.screen(id, {
      title: cfg.title,
      copy: lpCopy(cfg),
      notes: cfg.notes,
      render(ctx) {
        const back = takeReturn(ctx);
        const st = { tools: cfg.fixedTools ? true : !!(back && back.tools), docs: !!(back && back.docs) };
        const tiles = cfg.tiles.map((t, i) => `<div class="b01-lp-tile" data-tile="${i}" data-vis="${t.vis}" style="left:${(t.at[0] * 16).toFixed(1)}px;top:${(t.at[1] * 9).toFixed(1)}px">
            ${t.tip ? ctx.t('tip.' + t.k, { cls: 'tip' }) : ''}
            <div class="ic">${icon(t.icon)}${t.tt ? `<span class="b01-bdg b01-docb">${infoGlyph(19)}</span>` : ''}</div>
            ${tileLabel(ctx, t)}
          </div>`).join('');
        const chk = (k, key) => `<button type="button" class="b01-chk" data-chk="${k}" aria-pressed="false"><span class="bx">${checkSvg}</span>${ctx.t(key)}</button>`;
        ctx.el.innerHTML = `
          ${cfg.fixedTools ? '' : `<div class="b01-lp-L">${ringHTML(ctx, cfg, 'L')}</div>`}
          <div class="b01-lp-S">${ringHTML(ctx, cfg, 'S')}</div>
          ${tiles}
          <div class="b01-lp-tog">${cfg.fixedTools ? '' : chk('tools', 'chkTools')}${chk('docs', 'chkDocs')}</div>`;
        const apply = () => {
          ctx.$$('.b01-lp-L').forEach((n) => n.classList.toggle('b01-hide', st.tools));
          ctx.$$('.b01-lp-S').forEach((n) => n.classList.toggle('b01-hide', !st.tools));
          ctx.$$('[data-tile]').forEach((n) => {
            const v = n.dataset.vis;
            const on = v === 'A' || (v === 'T' && st.tools) || (v === 'TD' && st.tools && st.docs) || (v === 'D' && st.docs);
            n.classList.toggle('b01-hide', !on);
          });
          ctx.$$('.b01-docb').forEach((n) => n.classList.toggle('b01-hide', !st.docs));
          ctx.$$('[data-chk]').forEach((b) => b.setAttribute('aria-pressed', String(!!st[b.dataset.chk])));
        };
        apply();
        ctx.on(ctx.$$('[data-chk]'), 'click', (e, b) => { st[b.dataset.chk] = !st[b.dataset.chk]; apply(); });
        ctx.on(ctx.$$('[data-hub]'), 'click', () => {
          if (st.docs) openTT(ctx, 'pemInterview', EFA.cp('_lib', 'p.PEM'));
          else jumpWith(ctx, 'PEM', 'pem1', { tools: st.tools, docs: st.docs });
        });
        ctx.on(ctx.$$('[data-tile]'), 'click', (e, n) => {
          const t = cfg.tiles[+n.dataset.tile];
          if (st.docs) { if (t.tt) openTT(ctx, t.tt, t.lib ? EFA.cp('_lib', 'p.' + t.lib) : ctx.t('tile.' + t.k)); return; }
          if (t.go) jumpWith(ctx, t.go[0], t.go[1], { tools: st.tools, docs: st.docs });
          else if (t.form) openForm(ctx, t.form);
          else if (t.sg) ctx.toast(ctx.text('sgNote'));
        });
      }
    });
  }
  Object.keys(LP).forEach((id) => launchpad(id, LP[id]));

  /* =====================================================================
     Ten-minute life insurance lesson: the premium corridor (tmlif1 narrated, tmli1 whiteboard)
     ===================================================================== */
  EFA.css('b01-cor', `
  .b01-f { transition: opacity .8s ease; }
  .stage .b01-f.is-off { transition-duration: .3s; }
  .b01-line { position: absolute; left: 30px; right: 30px; height: 12px; border-radius: 6px; background: linear-gradient(180deg, #14284a, #0d1e3a); box-shadow: 0 4px 10px rgba(13,30,58,.18); }
  .b01-cl { position: absolute; font: 700 26px/1.1 "DM Sans", sans-serif; color: #0d1e3a; white-space: nowrap; }
  .b01-cl.sm { font-size: 21px; }
  .b01-cl.r { transform: translateX(-100%); }
  .b01-cl.lnk { color: #8a6e22; cursor: pointer; border-bottom: 2px dotted #b8972e; }
  .b01-cl.lnk:hover { color: #b8972e; }
  .b01-cl.gold { color: #8a6e22; }
  .b01-acct { position: absolute; left: 352px; top: 8px; display: grid; gap: 4px; }
  .b01-acct span { display: block; text-align: center; min-width: 96px; padding: 3px 10px; border-radius: 8px; background: #e3e8f0; font: 700 19px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-band { position: absolute; top: 168px; width: 120px; height: 566px; border-radius: 16px; background: #e3e8f0; border: 1px solid #cbd5e3; overflow: hidden; }
  .b01-band .lbl { position: absolute; left: 8px; top: 0; bottom: 0; width: 34px; display: grid; place-items: center; }
  .b01-band .lbl span { writing-mode: vertical-rl; transform: rotate(180deg); font: 700 21px/1 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #0d1e3a; white-space: nowrap; }
  .b01-arw { position: absolute; left: 46px; width: 64px; height: 58px; opacity: 0; }
  .b01-band.go .b01-arw { animation: b01pop .45s cubic-bezier(.3,1.4,.5,1) forwards; }
  .b01-band.go .b01-arw.a1 { animation-delay: .1s; } .b01-band.go .b01-arw.a2 { animation-delay: .5s; }
  .b01-band.go .b01-arw.a3 { animation-delay: .8s; } .b01-band.go .b01-arw.a4 { animation-delay: 2s; }
  .b01-band.go .b01-arw.gl { animation: b01glideUp 2s ease-out forwards; }
  .b01-band.down.go .b01-arw.gl { animation-name: b01glideDown; }
  .b01-band.shown .b01-arw:not(.gl) { opacity: 1; }
  @keyframes b01pop { from { opacity: 0; transform: scale(.3); } to { opacity: 1; transform: scale(1); } }
  @keyframes b01glideUp { from { opacity: .95; transform: translateY(0); } to { opacity: 0; transform: translateY(-440px); } }
  @keyframes b01glideDown { from { opacity: .95; transform: translateY(0); } to { opacity: 0; transform: translateY(440px); } }
  .b01-flash { animation: b01flash 2s linear; }
  @keyframes b01flash { 0% { opacity: 1; } 12% { opacity: 0; } 25% { opacity: 1; } 37% { opacity: 0; } 50%, 100% { opacity: 1; } }
  .b01-range { position: absolute; left: 620px; top: 168px; width: 120px; height: 566px; display: grid; grid-template-columns: 52px 40px; justify-content: center; align-items: stretch; }
  .b01-range .t { display: grid; place-items: center; }
  .b01-range .t span { writing-mode: vertical-rl; transform: rotate(180deg); font: 700 21px/1.1 "DM Sans", sans-serif; color: #8a6e22; white-space: nowrap; letter-spacing: .02em; }
  .b01-benl { position: absolute; left: 1024px; top: 168px; width: 336px; display: grid; gap: 3px; }
  .b01-ben { height: 44px; box-sizing: border-box; display: flex; align-items: center; gap: 10px; padding: 0 14px; border-radius: 10px; border: 1.5px solid #cbd5e3; background: #fffdf8; font: 600 17px/1.1 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; transition: opacity .8s ease, background .35s ease, border-color .35s ease; }
  .stage .b01-ben.is-off { transition-duration: .3s; }
  .b01-ben .dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #8aa3c7; flex: 0 0 auto; transition: background .3s ease, border-color .3s ease; }
  .b01-ben.on { background: linear-gradient(90deg, #f0e6c4, #d5bd68); border-color: #b8972e; }
  .b01-ben.on .dot { background: #0d1e3a; border-color: #0d1e3a; }
  .b01-cover { position: absolute; right: 240px; top: 166px; height: 570px; border-radius: 10px; transition: width .25s linear; pointer-events: none; }
  .b01-sl { position: absolute; left: 970px; top: 176px; width: 40px; height: 550px; cursor: pointer; touch-action: none; }
  .b01-sl .tr { position: absolute; left: 16px; top: 0; bottom: 0; width: 8px; border-radius: 4px; background: #cbd5e3; }
  .b01-sl .fi { position: absolute; left: 16px; bottom: 0; width: 8px; border-radius: 4px; background: linear-gradient(0deg, #8a6e22, #d5bd68); }
  .b01-sl .hd { position: absolute; left: 4px; width: 32px; height: 32px; margin-bottom: -16px; border-radius: 50%; background: #b8972e; border: 4px solid #0d1e3a; box-sizing: border-box; box-shadow: 0 4px 10px rgba(13,30,58,.3); }
  .b01-sl .vb { position: absolute; left: 42px; margin-bottom: -14px; background: #0d1e3a; color: #f7f5f1; font: 700 14px/1 "DM Sans", sans-serif; padding: 7px 9px; border-radius: 6px; opacity: 0; transition: opacity .2s ease; pointer-events: none; }
  .b01-sl.drag .vb, .b01-sl:hover .vb { opacity: 1; }
  .b01-bars { position: absolute; left: 940px; bottom: 750px; width: 180px; height: 96px; display: flex; align-items: flex-end; gap: 8px; transition: height .25s linear; }
  .b01-bars i { flex: 1; background: linear-gradient(180deg, #d5bd68, #b8972e); border-radius: 4px 4px 0 0; }
  .b01-cin { position: absolute; left: 160px; width: 236px; }
  .b01-cin .st-input { font-size: 24px; }
  .b01-nar { position: absolute; background: #fffdf8; border: 1px solid #d6cfc4; border-left: 6px solid #b8972e; border-radius: 14px; box-shadow: 0 18px 40px rgba(13,30,58,.14); padding: 20px 26px; box-sizing: border-box; display: grid; gap: 10px; z-index: 4; }
  .b01-nar p { margin: 0; font: 600 25px/1.32 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-nar p .num { color: #8a6e22; font-weight: 700; }
  .b01-nar.bc { left: 380px; width: 840px; bottom: 176px; text-align: center; }
  .b01-nar.tc { left: 380px; width: 840px; top: 178px; text-align: center; }
  .b01-nar.r { right: 16px; width: 480px; top: 300px; }
  .b01-nar.c { left: 190px; width: 1220px; top: 196px; }
  .b01-nar.tl { left: 22px; width: 624px; top: 176px; }
  .b01-nar.tr { right: 22px; width: 800px; top: 214px; }
  .b01-nar.tlc { left: 130px; width: 500px; top: 340px; }
  .b01-cmp { width: 100%; border-collapse: collapse; font: 600 21px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-cmp th { background: #0d1e3a; color: #f7f5f1; font: 700 15px/1.2 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; padding: 11px 16px; text-align: left; }
  .b01-cmp td { padding: 10px 16px; border-bottom: 1px solid rgba(13,30,58,.13); width: 50%; }
  .b01-cmp tbody tr:nth-child(even) td { background: rgba(227,232,240,.5); }
  .b01-cmp td.same { text-align: center; color: #8a6e22; }
  .b01-nar .ttl { font: 600 34px/1.1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; margin: 0 0 4px; }
  .b01-nar .foot { font: 400 13.5px/1.45 "DM Sans", sans-serif; color: #667389; margin: 4px 0 0; }
  .b01-corfill { position: absolute; left: 30px; right: 30px; top: 158px; height: 582px; background: linear-gradient(180deg, rgba(240,230,196,.42), rgba(227,232,240,.30)); border-radius: 4px; }
  .b01-blbl { position: absolute; top: 168px; width: 34px; height: 566px; display: grid; place-items: center; pointer-events: none; }
  .b01-blbl span { writing-mode: vertical-rl; transform: rotate(180deg); font: 700 21px/1 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #0d1e3a; white-space: nowrap; }
  .b01-nar .gold { color: #8a6e22; white-space: nowrap; }
  .b01-cordisc { font-size: 13px !important; line-height: 1.4 !important; }
  .b01-pill-sm { position: absolute; min-height: 40px !important; padding: 6px 18px !important; font-size: 16px !important; }
  `);
  const BEN = ['Tax-deferred growth', 'Generally tax-free access', 'Competitive growth potential', 'Room for large contributions', 'Added rider benefits', 'Usable as collateral', 'Principal protection', 'Floors against market loss', 'Contractual loan access', 'Flexible loan repayment', 'Liquidity, use and control', 'Tax-deductible contributions'];
  const COR_COPY = {
    minLbl: 'Minimum', maxLbl: 'Maximum', insCo: 'Insurance Company', gov: 'Government', yr: '1980s', qp: 'Qualified Plans',
    acct1: 'IRA', acct2: '401(k)', acct3: 'SEP', acct4: '403(b)', mecShort: 'MEC', mecLong: 'Modified Endowment Contract',
    term: 'Term', db: 'Death Benefit', incFace: 'Increasing Face', cvli: 'CVLI', deathB: 'Death Benefits', liveB: 'Living Benefits',
    range: 'An unlimited range of designs', coined: 'Max-Funded Policy', reset: 'Reset', showAll: 'Show All',
    capMax: 'Maximum premium', capCov: 'Coverage', capMin: 'Minimum premium',
    disc: "Illustrative only. Benefits vary by policy, carrier and funding; guarantees rely on the issuing insurer's claims-paying ability. Loans and withdrawals reduce cash value and death benefit and may cause a lapse. Tax-free treatment generally applies under current tax law, subject to applicable requirements."
  };
  BEN.forEach((b, i) => { COR_COPY['b' + (i + 1)] = b; });
  const NAR_COPY = {
    n1: 'For any amount of coverage, there is a minimum premium.',
    n2: 'For that same coverage, there is also a maximum.',
    n3: 'The insurance company sets the minimum.',
    n4: 'The federal government sets the maximum.',
    n5: 'Between the two lies an almost endless range of premium choices.',
    n6: 'In the 1980s, Congress capped how much money a life insurance policy can hold for its coverage.',
    n7: 'The concern was that well-funded policies were starting to compete with qualified plans.',
    t8: 'Similarities and Differences', t8a: 'Qualified Plan', t8b: 'Life Insurance Policy',
    t8r1a: 'Contributions go in pre-tax', t8r1b: 'Premiums are paid after tax',
    t8r2a: 'Contribution limits set by law', t8r2b: 'No fixed dollar cap; limits follow the coverage',
    t8r3: 'Tax-deferred growth on both',
    t8r4a: 'Withdrawals taxed as ordinary income', t8r4b: 'Death benefit generally income-tax-free*',
    t8r5a: 'Penalties for early access', t8r5b: 'Access to values through policy loans*',
    t8foot: '*Generally income-tax-free under current tax law, subject to applicable requirements. Policy loans and withdrawals reduce cash value and death benefit and may cause the policy to lapse.',
    n9: 'Pay in more than the federal maximum and the policy becomes a modified endowment contract, or MEC. Loans and withdrawals from a MEC are generally taxed gain-first, and early access may carry a penalty, much like a qualified plan.',
    n10: 'So what do qualified plans actually do?',
    n11: 'They postpone the tax.', n12: 'They also postpone the tax calculation.',
    n13: 'Put simply, you will not know the tax, or the rate, until you take the money out.',
    n14: 'That raises the first question:', n15: 'What tax bracket will you be in when you withdraw it?',
    n16: 'And the second question:', n17: 'What deductions will you still have then?',
    n18a: 'Say you want', n18b: 'of coverage.',
    n19a: "The insurer's minimum premium is", n19b: 'for that coverage.',
    n20a: 'The most you could pay without creating a MEC is', n20b: 'for the same coverage.',
    n21: 'Which premium looks best to you?',
    n22: 'The lowest premium for that coverage is term insurance.', n23: 'Term has one benefit: the death benefit.',
    n24: 'And it pays only if death happens during the term.',
    n25: "Let's set insurance aside for a moment and talk about benefits.", n26: 'You want the most benefits for every dollar you put away.',
    n27: 'If you could have any benefits you wanted, which would you choose?',
    n40: 'Now, back to life insurance.',
    n41: 'Most people think the goal is the most coverage for the least premium.',
    n42: 'A policy works hardest at the maximum premium, just under the MEC line, with the least coverage the law allows.',
    n43: 'Of everything on this list, the one benefit cash value life insurance does not offer is tax-deductible contributions.',
    n44: 'Policies deliver the most benefits when premiums go up to the limit, never over it.', n44b: 'That design is what we call a'
  };
  /* narration boxes (tmlif1): position, lines [first step, key], last step the box stays */
  const NAR = [
    { pos: 'bc', lines: [[1, 'n1']] }, { pos: 'tc', lines: [[2, 'n2']] }, { pos: 'bc', lines: [[3, 'n3']] }, { pos: 'tc', lines: [[4, 'n4']] },
    { pos: 'r', lines: [[5, 'n5']] }, { pos: 'r', lines: [[6, 'n6']] }, { pos: 'r', lines: [[7, 'n7']] }, { pos: 'c', table: 8 },
    { pos: 'r', lines: [[9, 'n9']] }, { pos: 'r', lines: [[10, 'n10']] },
    { pos: 'tl', lines: [[11, 'n11'], [12, 'n12'], [13, 'n13'], [14, 'n14'], [15, 'n15'], [16, 'n16'], [17, 'n17']] },
    { pos: 'tr', lines: [[18, 'n18'], [19, 'n19'], [20, 'n20'], [21, 'n21']] },
    { pos: 'tr', lines: [[22, 'n22'], [23, 'n23'], [24, 'n24']] },
    { pos: 'tl', lines: [[25, 'n25'], [26, 'n26'], [27, 'n27']], until: 39 },
    { pos: 'tlc', lines: [[40, 'n40']] }, { pos: 'tlc', lines: [[41, 'n41']] }, { pos: 'tlc', lines: [[42, 'n42']] },
    { pos: 'tlc', lines: [[43, 'n43']] }, { pos: 'tlc', lines: [[44, 'n44'], [44, 'n44b']] }
  ];
  /* element visibility by step: F = narrated (overview at step 0), L = whiteboard */
  const VIS = {
    F: {
      botLine: () => true, minLbl: () => true, showAll: () => true,
      topLine: (n) => n === 0 || n >= 2, maxLbl: (n) => n === 0 || n >= 2,
      insCo: (n) => n === 0 || n >= 3, gov: (n) => n === 0 || n >= 4,
      liveBand: (n) => n === 0 || (n >= 5 && n <= 40) || n >= 42, range: (n) => n === 5,
      yr: (n) => n === 0 || n >= 6, qp: (n) => n === 0 || n >= 7, acct: (n) => n === 0 || n >= 8, mec: (n) => n === 0 || n >= 9,
      inCov: (n) => n >= 18 && n <= 24, inMin: (n) => n >= 19 && n <= 24, inMax: (n) => n >= 20 && n <= 24,
      term: (n) => n === 0 || n >= 22, db: (n) => n === 0 || n >= 23,
      ben: (n, k) => n === 0 || n >= 27 + k, reset: (n) => n === 0 || n >= 39,
      incFace: (n, s) => (n === 0 || n >= 28) && s > 0, liveLbl: (n) => n === 0 || n >= 41, deathBand: (n) => n === 41,
      slider: (n) => n === 0 || n >= 42, cover: (n) => n === 0 || n >= 42, cvli: (n) => n === 0 || n >= 42, coined: (n) => n === 0 || n >= 42,
      bars: (n, s) => (n === 0 || n >= 42) && s > 0
    },
    L: {
      inCov: () => true, showAll: () => true,
      botLine: (n) => n >= 1, minLbl: (n) => n >= 1, topLine: (n) => n >= 2, maxLbl: (n) => n >= 2,
      insCo: (n) => n >= 3, gov: (n) => n >= 4,
      liveBand: (n) => (n >= 5 && n <= 25) || n >= 28, range: (n) => n >= 5 && n <= 25,
      yr: (n) => n >= 6, qp: (n) => n >= 7, acct: (n) => n >= 8, mec: (n) => n >= 9,
      inMin: (n) => n >= 10, inMax: (n) => n >= 11, term: (n) => n >= 12, db: (n) => n >= 13,
      ben: (n, k) => n >= 13 + k, reset: (n) => n >= 25,
      deathBand: (n) => n >= 27 && n <= 28, slider: (n) => n >= 28, cover: (n) => n >= 28, liveLbl: (n) => n >= 28,
      cvli: (n) => n === 29, coined: (n) => n === 29,
      incFace: (n, s) => n >= 28 && s > 0, bars: (n, s) => n >= 28 && s > 0
    }
  };
  const ALL_ON = () => Array(12).fill(true);
  const DEF11 = () => Array.from({ length: 12 }, (_, i) => i < 11);
  const NONE = () => Array(12).fill(false);
  /** the state a step sets when it is landed on (null = the step leaves it alone) */
  function corLanding(mode, n) {
    if (mode === 'F') {
      return ({ 0: { slider: 100, hl: ALL_ON() }, 9: { mec: true }, 10: { mec: false }, 28: { hl: ALL_ON() }, 40: { hl: NONE(), slider: 0 }, 42: { hl: DEF11(), animate: true }, 44: { slider: 100 } })[n] || null;
    }
    return ({ 25: { hl: ALL_ON() }, 26: { hl: NONE() }, 28: { slider: 0, hl: DEF11() }, 29: { slider: 100 } })[n] || null;
  }
  /** the full state for a fresh landing on step n (no history) */
  function corFresh(mode, n) {
    if (mode === 'F') {
      return { mec: n === 9, slider: n === 40 || n === 41 ? 0 : 100, hl: n >= 42 ? DEF11() : (n >= 40 ? NONE() : ALL_ON()), animate: n === 42 };
    }
    return { mec: false, slider: n >= 29 ? 100 : 0, hl: n >= 28 ? DEF11() : (n >= 26 ? NONE() : ALL_ON()) };
  }
  const FLASH = { F: { 6: ['topLine', 'gov'], 9: ['topLine'], 44: ['coined'] }, L: { 9: ['topLine'] } };
  function arrowSVG(dir, color) {
    const d = dir === 'up' ? 'M32 2 62 30H44v26H20V30H2z' : 'M32 56 62 28H44V2H20v26H2z';
    return `<svg viewBox="0 0 64 58" width="64" height="58" aria-hidden="true"><path d="${d}" fill="${color}" stroke="${P.paper}" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  }
  function bandHTML(ctx, key, x, dir, color, lblKey) {
    const ys = dir === 'up' ? [470, 340, 210, 80] : [30, 160, 290, 420];
    return `<div class="b01-band b01-f ${dir === 'down' ? 'down' : ''}" data-el="${key}" style="left:${x}px">
        ${ys.map((y, i) => `<div class="b01-arw a${i + 1}" style="top:${y}px">${arrowSVG(dir, color)}</div>`).join('')}
        <div class="b01-arw gl" style="top:${dir === 'up' ? 480 : 26}px">${arrowSVG(dir, color)}</div>
        ${lblKey ? `<div class="lbl">${ctx.t(lblKey)}</div>` : ''}
      </div>`;
  }
  function corridor(id, mode) {
    const narrated = mode === 'F';
    const copy = Object.assign({}, COR_COPY, narrated ? NAR_COPY : {});
    copy._notes = narrated
      ? 'A ten-minute lesson on how a policy is designed. Step 0 shows the finished picture; the first click starts the build, and the narration carries the story.\n\n- Ask: If you could choose the benefits first and the product second, which benefits would you want?\nPAUSE\n\n- Show All jumps to the end. Qualified Plans and Term open their own lessons and return here.'
      : 'The whiteboard version of the premium corridor: you tell the story as it builds.\n\n- Land the point: for the same coverage, design drives benefits. The most benefits come at the maximum premium, just under the MEC line.\n- Ask: Most people buy the most coverage for the least premium. What if the goal were the most benefits for every dollar?\nPAUSE\n\n- Drag the gold slider to the top to finish. Show All jumps to the end.';
    EFA.screen(id, {
      title: narrated ? 'Ten-minute life insurance lesson (narrated)' : 'Ten-minute life insurance lesson (whiteboard)',
      steps: narrated ? 45 : 30,
      copy,
      render(ctx) {
        const back = takeReturn(ctx);
        const c = ctx._c = { mode, slider: narrated ? 100 : 0, hl: ALL_ON(), mec: false, bands: {}, raf: 0, restored: false };
        if (back) { Object.assign(c, back, { restored: true }); }
        const yrX = narrated ? `left:${1232}px` : 'left:48px';
        const lnk = (key, el, x, y, extra) => `<span class="b01-cl lnk b01-f ${extra || ''}" data-el="${el}" style="left:${x}px;top:${y}px">${ctx.t(key)}</span>`;
        const lbl = (key, el, x, y, extra) => `<span class="b01-cl b01-f ${extra || ''}" data-el="${el}" style="left:${x}px;top:${y}px">${ctx.t(key)}</span>`;
        const nar = narrated ? NAR.map((b, i) => {
          const first = b.table || b.lines[0][0], last = b.until || (b.table || b.lines[b.lines.length - 1][0]);
          let inner;
          if (b.table) {
            inner = `<p class="ttl">${ctx.t('t8')}</p><table class="b01-cmp"><thead><tr><th>${ctx.t('t8a')}</th><th>${ctx.t('t8b')}</th></tr></thead><tbody>
                <tr><td>${ctx.t('t8r1a')}</td><td>${ctx.t('t8r1b')}</td></tr><tr><td>${ctx.t('t8r2a')}</td><td>${ctx.t('t8r2b')}</td></tr>
                <tr><td colspan="2" class="same">${ctx.t('t8r3')}</td></tr><tr><td>${ctx.t('t8r4a')}</td><td>${ctx.t('t8r4b')}</td></tr>
                <tr><td>${ctx.t('t8r5a')}</td><td>${ctx.t('t8r5b')}</td></tr></tbody></table><p class="foot">${ctx.t('t8foot')}</p>`;
          } else {
            inner = b.lines.map(([s, k]) => {
              let txt;
              if (k === 'n18') txt = `${ctx.t('n18a')} <span class="num" data-bind="cov"></span> ${ctx.t('n18b')}`;
              else if (k === 'n19') txt = `${ctx.t('n19a')} <span class="num" data-bind="min"></span> ${ctx.t('n19b')}`;
              else if (k === 'n20') txt = `${ctx.t('n20a')} <span class="num" data-bind="max"></span> ${ctx.t('n20b')}`;
              else if (k === 'n44b') txt = `${ctx.t('n44b')} <span class="gold">${ctx.t('coined')}</span>`;
              else txt = ctx.t(k);
              return `<p class="b01-f" data-ln="${s}">${txt}</p>`;
            }).join('');
          }
          return `<div class="b01-nar ${b.pos} b01-f" data-nar="${i}" data-first="${first}" data-last="${last}">${inner}</div>`;
        }).join('') : '';
        ctx.el.innerHTML = `
          <div class="b01-corfill b01-f" data-el="corFill"></div>
          <div class="b01-line b01-f" data-el="topLine" style="top:146px"></div>
          <div class="b01-line b01-f" data-el="botLine" style="top:740px"></div>
          ${lnk('qp', 'qp', 64, 42)}
          <div class="b01-acct b01-f" data-el="acct">${['acct1', 'acct2', 'acct3', 'acct4'].map((k) => ctx.t(k)).join('')}</div>
          ${lbl('maxLbl', 'maxLbl', 160, 100)}
          <span class="b01-cl lnk b01-f" data-el="mec" style="left:528px;top:100px"><span class="mec-s">${ctx.t('mecShort')}</span><span class="mec-l">${ctx.t('mecLong')}</span></span>
          <span class="b01-cl b01-f" data-el="yr" style="${yrX};top:100px">${ctx.t('yr')}</span>
          ${lbl('gov', 'gov', 1520, 100, 'r')}
          ${lbl('incFace', 'incFace', 1376, 44, 'r gold')}
          <div class="b01-bars b01-f" data-el="bars"><i style="height:22%"></i><i style="height:40%"></i><i style="height:58%"></i><i style="height:78%"></i><i style="height:100%"></i></div>
          <span class="b01-cl b01-f gold" data-el="coined" style="left:16px;top:166px;max-width:336px;white-space:normal;font-size:27px">${ctx.t('coined')}</span>
          ${lnk('cvli', 'cvli', 528, 166)}
          <div class="b01-range b01-f" data-el="range"><div class="t">${ctx.t('range')}</div><svg viewBox="0 0 40 566" width="40" height="566" aria-hidden="true"><path d="M20 18V548" stroke="${P.gold}" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/><path d="M8 26 20 6 32 26M8 540 20 560 32 540" fill="none" stroke="${P.gold}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          ${bandHTML(ctx, 'deathBand', 640, 'down', P.navy, 'deathB')}
          ${bandHTML(ctx, 'liveBand', 832, 'up', P.gold, null)}
          <div class="b01-blbl b01-f" data-el="liveLbl" style="left:840px">${ctx.t('liveB')}</div>
          <div class="b01-cin b01-f" data-el="inMax" style="top:262px">${ctx.field({ id: 'maxPrem', label: 'capMax', type: 'money', value: 10000, min: 0 })}</div>
          <div class="b01-cin b01-f" data-el="inCov" style="top:432px">${ctx.field({ id: 'coverage', label: 'capCov', type: 'money', value: 500000, min: 0 })}</div>
          <div class="b01-cin b01-f" data-el="inMin" style="top:602px">${ctx.field({ id: 'minPrem', label: 'capMin', type: 'money', value: 500, min: 0 })}</div>
          <div class="b01-benl">${BEN.map((_, i) => `<div class="b01-ben b01-f" data-ben="${i}"><span class="dot"></span>${ctx.t('b' + (i + 1))}</div>`).join('')}</div>
          <div class="b01-cover b01-f" data-el="cover" style="background:rgba(247,245,241,${narrated ? 0.8 : 0.7})"></div>
          <div class="b01-sl b01-f" data-el="slider"><div class="tr"></div><div class="fi"></div><div class="hd"></div><div class="vb num"></div></div>
          <button type="button" class="st-pill b01-pill-sm b01-f" data-el="reset" style="left:1384px;top:688px">${ctx.t('reset')}</button>
          <button type="button" class="st-pill b01-pill-sm b01-ghost b01-f" data-el="showAll" style="left:1000px;top:762px">${ctx.t('showAll')}</button>
          ${lbl('minLbl', 'minLbl', 160, 760)}
          ${lnk('term', 'term', 368, 760)}
          ${lbl('db', 'db', 368, 796, 'sm')}
          ${lbl('insCo', 'insCo', 1520, 760, 'r')}
          ${nar}
          <p class="st-disclaimer b01-disc b01-cordisc" style="right:320px;bottom:16px;margin:0">${ctx.t('disc')}</p>`;
        // events
        ctx.on(ctx.$$('[data-ben]'), 'click', (e, n) => { c.hl[+n.dataset.ben] = !c.hl[+n.dataset.ben]; corPaint(ctx); });
        ctx.on(ctx.$('[data-el="mec"]'), 'click', () => { c.mec = !c.mec; corPaint(ctx); });
        ctx.on(ctx.$('[data-el="cvli"]'), 'click', () => {
          if (narrated) { if (ctx.step === 0) ctx.goStep(1); } else { c.hl = DEF11(); corPaint(ctx); }
        });
        ctx.on(ctx.$('[data-el="reset"]'), 'click', () => { c.hl = NONE(); if (narrated) { corStopAnim(ctx); c.slider = 0; } corPaint(ctx); });
        ctx.on(ctx.$('[data-el="showAll"]'), 'click', () => ctx.goStep(narrated ? 44 : 29));
        const save = () => ({ slider: c.slider, hl: c.hl.slice(), mec: c.mec });
        ctx.on(ctx.$('[data-el="qp"]'), 'click', () => jumpWith(ctx, 'QPD2T', 'qpdo2t1', save()));
        ctx.on(ctx.$('[data-el="term"]'), 'click', () => jumpWith(ctx, 'TERMINS', 'termins2', save()));
        // slider drag
        const sl = ctx.$('.b01-sl');
        const setFromY = (clientY) => {
          const r = sl.getBoundingClientRect();
          const v = Math.round(clamp((r.bottom - clientY) / r.height, 0, 1) * 100);
          corStopAnim(ctx); c.slider = v; corPaint(ctx);
          if (!narrated && v >= 100 && ctx.step < 29) ctx.goStep(29);
        };
        sl.addEventListener('pointerdown', (e) => { if (EFA.edit.on) return; sl.classList.add('drag'); sl.setPointerCapture(e.pointerId); setFromY(e.clientY); });
        sl.addEventListener('pointermove', (e) => { if (sl.classList.contains('drag')) setFromY(e.clientY); });
        const end = () => sl.classList.remove('drag');
        sl.addEventListener('pointerup', end); sl.addEventListener('pointercancel', end);
        ctx.onFields((v) => {
          ctx.$$('[data-bind="cov"]').forEach((n) => { n.textContent = money(v.coverage); });
          ctx.$$('[data-bind="min"]').forEach((n) => { n.textContent = money(v.minPrem); });
          ctx.$$('[data-bind="max"]').forEach((n) => { n.textContent = money(v.maxPrem); });
        });
      },
      step(ctx, n, dir) {
        const c = ctx._c; corStopAnim(ctx);
        let st;
        if (dir === 0 && c.restored) { c.restored = false; st = null; } else st = dir === 0 ? corFresh(mode, n) : corLanding(mode, n);
        if (st) {
          if (st.hl) c.hl = st.hl;
          if (st.mec != null) c.mec = st.mec;
          if (st.slider != null) c.slider = st.slider;
          if (st.animate) c.slider = 0;
        }
        const V = VIS[mode];
        ctx.show('[data-el="corFill"]', !!V.topLine(n));
        ['botLine', 'minLbl', 'showAll', 'topLine', 'maxLbl', 'insCo', 'gov', 'range', 'yr', 'qp', 'acct', 'mec', 'inCov', 'inMin', 'inMax', 'term', 'db', 'reset', 'liveLbl', 'slider', 'cover', 'cvli', 'coined'].forEach((k) => {
          if (V[k]) ctx.show(`[data-el="${k}"]`, !!V[k](n));
        });
        ctx.$$('[data-ben]').forEach((el) => ctx.show(el, !!V.ben(n, +el.dataset.ben + 1)));
        ['liveBand', 'deathBand'].forEach((k) => {
          const on = !!V[k](n), el = ctx.$(`[data-el="${k}"]`);
          ctx.show(el, on);
          if (on && !c.bands[k]) { el.classList.remove('go', 'shown'); void el.offsetWidth; el.classList.add(dir === 0 && n === 0 ? 'shown' : 'go'); }
          if (!on) el.classList.remove('go', 'shown');
          c.bands[k] = on;
        });
        if (narrated) {
          ctx.$$('[data-nar]').forEach((b) => ctx.show(b, n >= +b.dataset.first && n <= +b.dataset.last));
          ctx.$$('[data-ln]').forEach((p) => ctx.show(p, n >= +p.dataset.ln));
        }
        if (st && st.animate) corAnimate(ctx, 5000);
        corPaint(ctx);
        (FLASH[mode][n] || []).forEach((k) => { const el = ctx.$(`[data-el="${k}"]`); if (el) { el.classList.remove('b01-flash'); void el.offsetWidth; el.classList.add('b01-flash'); } });
      },
      leave(ctx) { corStopAnim(ctx); }
    });
  }
  function corStopAnim(ctx) { const c = ctx._c; if (c && c.raf) { cancelAnimationFrame(c.raf); c.raf = 0; } }
  function corAnimate(ctx, ms) {
    const c = ctx._c, t0 = performance.now();
    const tick = (t) => {
      const k = clamp((t - t0) / ms, 0, 1);
      c.slider = Math.round(k * 100); corPaint(ctx);
      c.raf = k < 1 && ctx.el.isConnected ? requestAnimationFrame(tick) : 0;
    };
    c.raf = requestAnimationFrame(tick);
  }
  /** paint slider, cover, bar icon, highlights and the MEC label from state */
  function corPaint(ctx) {
    const c = ctx._c, n = ctx.step, s = c.slider, V = VIS[c.mode];
    const sl = ctx.$('.b01-sl');
    if (sl) {
      sl.querySelector('.fi').style.height = `${s}%`;
      sl.querySelector('.hd').style.bottom = `${s}%`;
      const vb = sl.querySelector('.vb'); vb.style.bottom = `${s}%`; vb.textContent = String(s);
    }
    const coverW = c.mode === 'F' ? 13.9 * 24 * (1 - s / 100) : (s === 0 ? 14.1 * 24 : Math.max(0, (14 - s * 0.141) * 24));
    const cv = ctx.$('[data-el="cover"]'); if (cv) cv.style.width = `${coverW.toFixed(1)}px`;
    const bars = ctx.$('[data-el="bars"]'); if (bars) bars.style.height = `${(96 * s / 100).toFixed(1)}px`;
    ctx.show('[data-el="bars"]', !!V.bars(n, s));
    ctx.show('[data-el="incFace"]', !!V.incFace(n, s));
    ctx.$$('[data-ben]').forEach((el) => el.classList.toggle('on', !!c.hl[+el.dataset.ben]));
    const m = ctx.$('[data-el="mec"]');
    if (m) { m.querySelector('.mec-s').classList.toggle('b01-hide', c.mec); m.querySelector('.mec-l').classList.toggle('b01-hide', !c.mec); }
  }
  corridor('tmlif1', 'F');
  corridor('tmli1', 'L');

  /* =====================================================================
     accdist1: ranking accounts for accumulation versus distribution
     ===================================================================== */
  EFA.css('b01-ad', `
  .b01-ad-btn { position: absolute; left: 50%; transform: translateX(-50%); min-height: 54px !important; padding: 10px 34px !important; font-size: 21px !important; letter-spacing: .04em; }
  .b01-ad-cap { position: absolute; left: 0; right: 0; text-align: center; font: 500 17px/1.3 "DM Sans", sans-serif; color: #667389; }
  .b01-scale { position: absolute; left: 60px; right: 60px; height: 26px; display: flex; align-items: center; gap: 16px; font: 700 16px/1 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6e22; }
  .b01-scale i { flex: 1; height: 2px; background: linear-gradient(90deg, #cbd5e3, #b8972e); border-radius: 1px; }
  .b01-row { position: absolute; left: 50px; width: 1500px; display: grid; grid-template-columns: repeat(10, 1fr); }
  .b01-slot { position: relative; display: grid; justify-items: center; align-content: end; }
  .b01-slot .tk { position: relative; }
  .b01-chip { position: absolute; left: 50%; transform: translate(-50%, -50%); min-width: 40px; max-width: 128px; min-height: 30px; box-sizing: border-box; padding: 5px 10px; border-radius: 10px; background: #fffdf8; border: 1.5px solid #cbd5e3; box-shadow: 0 4px 12px rgba(13,30,58,.12); font: 700 14px/1.15 "DM Sans", sans-serif; color: #0d1e3a; text-align: center; cursor: pointer; display: grid; place-items: center; z-index: 2; }
  .b01-chip:hover { border-color: #b8972e; }
  .b01-chip.n { font-size: 17px; color: #667389; }
  .b01-chip.blank { min-width: 54px; background: rgba(255,253,248,.7); border-style: dashed; }
  .b01-db { position: absolute; transition: left .6s cubic-bezier(.45,.05,.2,1), opacity .6s ease; display: grid; justify-items: center; }
  .b01-db .chip2 { margin-top: -8px; background: #0d1e3a; color: #f7f5f1; border-radius: 999px; padding: 7px 14px; font: 700 13px/1 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; white-space: nowrap; z-index: 2; box-shadow: 0 6px 14px rgba(13,30,58,.25); }
  .b01-db .chip2:hover { background: #b8972e; color: #0d1e3a; }
  .b01-pick { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .b01-pick .st-pill { min-height: 54px; font-size: 19px; justify-content: flex-start; padding-left: 16px; gap: 12px; }
  .b01-pick .sw { width: 16px; height: 16px; border-radius: 50%; flex: 0 0 auto; border: 2px solid #f7f5f1; }
  .b01-legend { position: absolute; display: flex; gap: 22px; font: 600 15px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-legend span { display: inline-flex; align-items: center; gap: 8px; }
  .b01-legend i { width: 16px; height: 16px; border-radius: 50%; display: inline-block; }
  `);
  const AD_TYPES = ['Annuity', 'Bonds', 'CD and Cash', 'House', 'Mutual Funds', 'Cash Value Life Insurance', 'Qualified Plans', 'Real Estate', 'Roth IRA', 'Stocks'];
  const AD_SAFE = [false, false, true, true, false, true, false, false, false, false];
  const AD_CVLI = 5;
  EFA.screen('accdist1', {
    title: 'Ranking accounts: accumulation versus distribution',
    copy: Object.assign({
      acc: 'Accumulation', dist: 'Distribution', least: '< Least', most: 'Most >',
      capAcc: 'Rank ten places to keep money while you are saving, from least to most desirable.',
      capDist: 'Now rank them again for the years you will be living on the money.',
      pickHead: 'Account Types', ndb: 'Net Death Benefit', safe: 'Safe', risk: 'At risk', dbLeg: 'Death benefit',
      disc: 'Illustrative only. Safe and at-risk groupings are generalizations: a fixed annuity carries no market risk, and cash value depends on the policy. A death benefit is paid only while the policy stays in force; loans and withdrawals reduce it.',
      _notes: 'Most people rank accounts the same way for saving and for spending. The distribution years ask different questions: access, taxes, and what happens at death.\n\n- Click Accumulation, then each number to rank the ten accounts. Then do the same with Distribution.\n- Ask: Which of these would you feel comfortable spending down first in retirement?\nPAUSE\n\n- Once the distribution row is full, click an account to move the death benefit over it, click again to spend it, then click Net Death Benefit to show it refilled at death. Permission to spend.'
    }, Object.fromEntries(AD_TYPES.map((t, i) => ['t' + i, t]))),
    render(ctx) {
      const S = ctx._ad = { acc: null, dist: null };
      const TW = 120, TH = 168, DBW = 96, DBH = 128;
      const slotsHTML = (row) => Array.from({ length: 10 }, (_, i) => `<div class="b01-slot" data-row="${row}" data-i="${i}"><div class="tk" style="width:${TW}px;height:${TH}px"></div></div>`).join('');
      ctx.el.innerHTML = `
        <button type="button" class="st-pill b01-ad-btn" data-go="acc" style="top:22px">${ctx.t('acc')}</button>
        ${ctx.t('capAcc', { cls: 'b01-ad-cap', attrs: 'style="top:86px"' })}
        <div class="b01-scale" style="top:118px">${ctx.t('least')}<i></i>${ctx.t('most')}</div>
        <div class="b01-row b01-f is-off" data-rowbox="acc" style="top:150px;height:${TH}px">${slotsHTML('acc')}</div>
        <button type="button" class="st-pill b01-ad-btn" data-go="dist" style="top:352px">${ctx.t('dist')}</button>
        ${ctx.t('capDist', { cls: 'b01-ad-cap', attrs: 'style="top:416px"' })}
        <div class="b01-row b01-f is-off" data-rowbox="dist" style="top:600px;height:${TH}px">${slotsHTML('dist')}<div class="b01-db" data-db="1" style="top:${-DBH - 18}px;opacity:0"><div class="tk" style="width:${DBW}px;height:${DBH}px"></div><div class="chip2">${ctx.t('ndb')}</div></div></div>
        <div class="b01-scale" style="top:786px">${ctx.t('least')}<i></i>${ctx.t('most')}</div>
        <div class="b01-legend" style="right:60px;top:40px"><span><i style="background:${LIQ.safe.body}"></i>${ctx.t('safe')}</span><span><i style="background:${LIQ.risk.body}"></i>${ctx.t('risk')}</span><span><i style="background:${LIQ.water.body}"></i>${ctx.t('dbLeg')}</span></div>
        <p class="st-disclaimer b01-disc" style="margin:0">${ctx.t('disc')}</p>`;
      const fresh = () => ({ slots: Array(10).fill(null), pool: AD_TYPES.map((_, i) => i), spent: Array(10).fill(false), refilled: Array(10).fill(false), db: -1, dbFull: true, done: false });
      const slotW = 150;
      const paintRow = (row) => {
        const R = S[row]; if (!R) return;
        ctx.$$(`[data-row="${row}"]`).forEach((el) => {
          const i = +el.dataset.i, ty = R.slots[i];
          const safe = ty != null ? AD_SAFE[ty] : true;
          let liq = null, level = 0;
          if (ty != null && !R.spent[i]) { liq = safe ? LIQ.safe : LIQ.risk; level = 0.78; }
          if (R.spent[i] && R.refilled[i]) { liq = safe ? LIQ.safe : LIQ.risk; level = 0.78; }
          const tk = el.querySelector('.tk');
          const open = ty != null && !safe;
          const sig = `${open}|${liq ? liq.body : ''}`;
          if (tk.dataset.sig !== sig) {
            tk.dataset.sig = sig;
            tk.innerHTML = tankSVG({ w: TW, h: TH, open, liq: liq || LIQ.safe, level: 0 }) + '<div class="b01-chip" data-chip="1" style="top:58%"></div>';
            if (!liq) setLevel(tk, 0);
            requestAnimationFrame(() => requestAnimationFrame(() => setLevel(tk, level)));
          } else setLevel(tk, level);
          const chip = tk.querySelector('.b01-chip');
          chip.className = 'b01-chip' + (ty == null ? ' n' : '') + (R.spent[i] ? ' blank' : '');
          chip.innerHTML = R.spent[i] ? '' : (ty == null ? N(i + 1) : ctx.t('t' + ty));
        });
        if (row === 'dist') {
          const db = ctx.$('[data-db]');
          if (R.db < 0) db.style.opacity = '0';
          else {
            db.style.opacity = '1'; db.style.left = `${R.db * slotW + (slotW - DBW) / 2}px`;
            const tk = db.querySelector('.tk');
            if (!tk.firstChild) tk.innerHTML = tankSVG({ w: DBW, h: DBH, open: false, liq: LIQ.water, level: 0 });
            setLevel(tk, R.dbFull ? 0.86 : 0);
          }
        }
        arm(ctx);
      };
      const afterAssign = (row) => {
        const R = S[row];
        if (R.pool.length === 1) { const empty = R.slots.indexOf(null); if (empty >= 0) { R.slots[empty] = R.pool[0]; R.pool = []; } }
        R.done = R.pool.length === 0 && R.slots.every((x) => x != null);
        if (row === 'dist') R.db = R.slots.indexOf(AD_CVLI);
        paintRow(row);
      };
      const pick = (row, i) => {
        const R = S[row];
        const ov = ctx.overlay({ title: ctx.t('pickHead'), cls: 'b01-ov-sm', html: `<div class="b01-pick">${R.pool.map((ty) => `<button type="button" class="st-pill" data-ty="${ty}"><span class="sw" style="background:${AD_SAFE[ty] ? LIQ.safe.body : LIQ.risk.body}"></span>${ctx.t('t' + ty)}</button>`).join('')}</div>` });
        ctx.on(Array.from(ov.querySelectorAll('[data-ty]')), 'click', (e, b) => {
          const ty = +b.dataset.ty;
          if (R.slots[i] != null) R.pool.push(R.slots[i]);
          R.slots[i] = ty; R.pool = R.pool.filter((x) => x !== ty).sort((a, b2) => a - b2);
          ov.close(); afterAssign(row);
        });
      };
      const show = (row) => {
        S[row] = fresh();
        ctx.$$(`[data-row="${row}"] .tk`).forEach((tk) => { tk.dataset.sig = ''; });
        if (row === 'dist') { const tk = ctx.$('[data-db] .tk'); tk.innerHTML = ''; }
        const box = ctx.$(`[data-rowbox="${row}"]`); box.classList.add('is-off'); void box.offsetWidth;
        paintRow(row); ctx.timeout(() => box.classList.remove('is-off'), 30);
      };
      ctx.on(ctx.$$('[data-go]'), 'click', (e, b) => show(b.dataset.go));
      ctx.el.addEventListener('click', (e) => {
        if (EFA.edit.on) return;
        const ndb = e.target.closest('.chip2');
        if (ndb) { const R = S.dist; if (R && R.db >= 0 && R.dbFull) { R.dbFull = false; R.spent.forEach((sp, i) => { if (sp) R.refilled[i] = true; }); paintRow('dist'); } return; }
        const slot = e.target.closest('.b01-slot'); if (!slot || !(e.target.closest('.b01-chip') || e.target.closest('.tk'))) return;
        const row = slot.dataset.row, i = +slot.dataset.i, R = S[row]; if (!R) return;
        if (!R.done) { pick(row, i); return; }
        if (row !== 'dist') return;
        if (R.db === i && !R.spent[i]) R.spent[i] = true;
        R.db = i; paintRow('dist');
      });
    }
  });

  /* =====================================================================
     estatetrn1: other transfers out of an estate
     ===================================================================== */
  const ESTATE_GLYPH = (() => {
    const g = P.goldLt, n = P.navy;
    return [
      `<rect x="9" y="15" width="30" height="20" rx="3" fill="none" stroke="${g}" stroke-width="2.8"/><path d="M9 21h30" stroke="${g}" stroke-width="3.2"/><path d="M14 30h8" stroke="${g}" stroke-width="2.6" stroke-linecap="round"/>`,
      `<path d="M24 9v29M15 40h18M10 15h28" stroke="${g}" stroke-width="2.8" stroke-linecap="round"/><path d="M10 15l-5 11h10zM38 15l-5 11h10z" fill="none" stroke="${g}" stroke-width="2.4" stroke-linejoin="round"/>`,
      `<path d="M7 17L24 8l17 9z" fill="none" stroke="${g}" stroke-width="2.6" stroke-linejoin="round"/><path d="M12 20v14M20 20v14M28 20v14M36 20v14M7 38h34" stroke="${g}" stroke-width="2.8" stroke-linecap="round"/>`,
      `<path d="M13 8h16l7 7v25H13z" fill="none" stroke="${g}" stroke-width="2.6" stroke-linejoin="round"/><path d="M24.5 19l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="${g}"/>`,
      `<path d="M18 22h12v18H18z" fill="none" stroke="${g}" stroke-width="2.6" stroke-linejoin="round"/><path d="M24 22v-3" stroke="${g}" stroke-width="2.4"/><path d="M24 7c3.6 4 4.6 6.6 4.6 8.4a4.6 4.6 0 0 1-9.2 0C19.4 13.6 20.4 11 24 7z" fill="${g}"/><path d="M13 40h22" stroke="${g}" stroke-width="2.8" stroke-linecap="round"/>`,
      `<path d="M13 8h16l7 7v25H13z" fill="none" stroke="${g}" stroke-width="2.6" stroke-linejoin="round"/><circle cx="19.5" cy="20.5" r="2.8" fill="none" stroke="${g}" stroke-width="2.2"/><circle cx="29.5" cy="31.5" r="2.8" fill="none" stroke="${g}" stroke-width="2.2"/><path d="M30.5 18L18.5 34" stroke="${g}" stroke-width="2.6" stroke-linecap="round"/>`
    ].map((b) => `<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true">${b}</svg>`);
  })();
  EFA.css('b01-es', `
  .b01-es { position: absolute; left: 410px; width: 780px; display: grid; grid-template-columns: 82px 1fr; gap: 26px; align-items: center; }
  .b01-es .ic { width: 82px; height: 82px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #2b4c80, #0d1e3a 70%); display: grid; place-items: center; box-shadow: 0 10px 22px rgba(13,30,58,.22); border: 3px solid #fffdf8; outline: 1.5px solid #d5bd68; }
  .b01-es .tx { background: #fffdf8; border: 1px solid #d6cfc4; border-left: 6px solid #b8972e; border-radius: 14px; padding: 18px 26px; font: 600 28px/1.2 "DM Sans", sans-serif; color: #0d1e3a; box-shadow: 0 10px 26px rgba(13,30,58,.07); }
  `);
  EFA.screen('estatetrn1', {
    title: 'Other transfers out of an estate',
    steps: 7,
    copy: {
      head: 'Other Estate Transfers', sub: 'Costs that can reach your estate whether or not estate tax is due',
      r1: 'Debts', r2: 'Legal and Administrative Fees', r3: 'Probate', r4: 'State Death Taxes', r5: 'Funeral Expenses', r6: 'Income Taxes',
      disc: 'State estate and inheritance taxes apply only in some states. Costs vary with the estate, the state and the planning in place.',
      _notes: 'Estate tax gets the headlines, but other costs can reduce what your family receives, whether or not any estate tax is due.\n\n- Click through the six, one at a time. Let each one land.\n- Ask: Of these, which would your family be ready to pay in the weeks after you are gone?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b01-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"><p class="st-small" style="margin:0;font-size:21px">${ctx.t('sub')}</p></div>
        ${[1, 2, 3, 4, 5, 6].map((k, i) => `<div class="b01-es" style="top:${236 + i * 96}px"><div class="ic">${ESTATE_GLYPH[i]}</div><div class="tx b01-f" data-r="${k}">${ctx.t('r' + k)}</div></div>`).join('')}
        <p class="st-disclaimer b01-disc" style="margin:0">${ctx.t('disc')}</p>`;
    },
    step(ctx, n) { ctx.$$('[data-r]').forEach((el) => ctx.show(el, n > +el.dataset.r - 1)); }
  });

  /* =====================================================================
     Allocation Mix (am1 . am7)
     ===================================================================== */
  EFA.css('b01-am', `
  .b01-seg2 { display: inline-flex; border: 1.5px solid #cbd5e3; border-radius: 999px; padding: 4px; gap: 4px; background: #fff; }
  .b01-seg2 button { border: 0; border-radius: 999px; padding: 9px 20px; background: transparent; color: #0d1e3a; font: 600 17px/1.1 "DM Sans", sans-serif; }
  .b01-seg2 button[aria-checked="true"] { background: #0d1e3a; color: #f7f5f1; }
  .b01-seg2 button:not([aria-checked="true"]):hover { background: #e3e8f0; }
  .b01-am-col { position: absolute; top: 122px; width: 460px; display: grid; justify-items: center; }
  .b01-am-col h3 { margin: 0 0 12px; font: 700 26px/1.1 "DM Sans", sans-serif; color: #0d1e3a; letter-spacing: .01em; }
  .b01-am-col h3.tog { cursor: pointer; border-bottom: 2px dotted #b8972e; }
  .b01-am-tank { position: relative; cursor: pointer; transition: transform .2s ease; }
  .b01-am-tank:hover { transform: translateY(-2px); }
  .b01-am-tank.entry { cursor: default; transform: none; }
  .b01-am-in { position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%); width: 112px; height: 50px; text-align: center; font: 700 24px/1 "DM Sans", sans-serif; color: #0d1e3a; border: 2px solid #cbd5e3; border-radius: 10px; background: rgba(255,255,255,.94); box-shadow: 0 6px 16px rgba(13,30,58,.18); }
  .b01-am-in:focus { outline: none; border-color: #b8972e; box-shadow: 0 0 0 3px rgba(184,151,46,.25); }
  .b01-am-in[readonly] { background: rgba(240,230,196,.95); border-color: #d5bd68; }
  .b01-am-char { margin-top: 12px; width: 400px; box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-top: 4px solid #b8972e; border-radius: 12px; padding: 14px 18px; box-shadow: 0 10px 24px rgba(13,30,58,.08); }
  .b01-am-char ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 7px; }
  .b01-am-char li { position: relative; padding-left: 20px; font: 500 17px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-am-char li::before { content: ""; position: absolute; left: 2px; top: 8px; width: 8px; height: 8px; border-radius: 50%; background: #b8972e; }
  .b01-am-lnk { margin-top: 8px; font-size: 18px; }
  .b01-am-bar { position: absolute; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 22px; white-space: nowrap; }
  .b01-grid-h { position: absolute; display: grid; justify-items: center; align-content: start; gap: 8px; cursor: pointer; }
  .b01-grid-h .t { font: 700 22px/1.1 "DM Sans", sans-serif; color: #0d1e3a; text-align: center; }
  .b01-grid-h:hover .t { color: #8a6e22; }
  .b01-badges { display: flex; gap: 6px; }
  .b01-badges.v { flex-direction: column; }
  .b01-badge { min-width: 112px; box-sizing: border-box; padding: 5px 10px; border-radius: 7px; font: 700 16px/1.1 "DM Sans", sans-serif; color: #0d1e3a; text-align: right; transition: opacity .8s ease; }
  .stage .b01-badge.is-off { transition-duration: .3s; }
  .b01-badge.des { background: #dfe8f4; border: 1px solid #9cb6d8; }
  .b01-badge.act { background: #f0e6c4; border: 1px solid #d5bd68; }
  .b01-gpanel { position: absolute; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 12px 30px rgba(13,30,58,.07); overflow: hidden; }
  .b01-gline { position: absolute; background: #e3e8f0; }
  .b01-cell { position: absolute; display: flex; justify-content: center; align-items: center; gap: 30px; box-sizing: border-box; }
  .b01-ctank { position: relative; }
  .b01-ctank.click { cursor: pointer; }
  .b01-ctank.click:hover { filter: brightness(1.05); }
  .b01-cval { position: absolute; left: 50%; top: 46%; transform: translate(-50%, -50%); background: rgba(255,255,255,.95); border: 1.5px solid #cbd5e3; border-radius: 8px; padding: 5px 9px; font: 700 17px/1 "DM Sans", sans-serif; color: #0d1e3a; white-space: nowrap; box-shadow: 0 3px 8px rgba(13,30,58,.14); }
  .b01-band2 { position: absolute; background: rgba(240,230,196,.55); border: 1.5px solid rgba(184,151,46,.55); border-radius: 12px; pointer-events: none; transition: opacity .3s ease; }
  .b01-lgd { position: absolute; left: 34px; top: 30px; display: grid; gap: 8px; }
  .b01-lgd span { display: inline-block; padding: 6px 14px; border-radius: 8px; font: 700 15px/1 "DM Sans", sans-serif; color: #0d1e3a; letter-spacing: .06em; text-transform: uppercase; }
  .b01-chipA { background: #f0e6c4; border: 1px solid #d5bd68; border-radius: 10px; padding: 0 .22em; color: #0d1e3a; }
  .b01-chipB { background: #dfe8f4; border: 1px solid #9cb6d8; border-radius: 10px; padding: 0 .22em; color: #0d1e3a; }
  .b01-acc-wrap { position: absolute; left: 160px; width: 1280px; top: 138px; }
  .b01-acc-scroll { max-height: 380px; overflow: auto; border-radius: 12px; border: 1px solid #d6cfc4; background: #fffdf8; box-shadow: 0 10px 26px rgba(13,30,58,.07); }
  .stage .b01-acc td, .stage .b01-acc th { padding: 11px 14px; }
  .stage .b01-acc th { position: sticky; top: 0; z-index: 1; }
  .stage .b01-acc td.c, .stage .b01-acc th.c { text-align: center; }
  .stage .b01-acc tfoot td { background: #f7f5f1; text-align: left; border-bottom: 0; }
  .b01-ibtn { width: 38px; height: 38px; border-radius: 10px; border: 1px solid #cbd5e3; background: #fff; display: inline-grid; place-items: center; color: #0d1e3a; margin: 0 3px; }
  .b01-ibtn:hover { border-color: #b8972e; background: #f0e6c4; }
  .b01-res { position: absolute; left: 160px; width: 1280px; top: 628px; box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; padding: 14px 28px 18px; box-shadow: 0 10px 26px rgba(13,30,58,.08); display: grid; grid-template-columns: 1fr 260px 260px; row-gap: 10px; align-items: center; }
  .b01-res .cap { font: 700 13px/1.2 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #8a6e22; text-align: right; }
  .b01-res .lb { font: 600 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-res .v { font: 700 26px/1.1 "DM Sans", sans-serif; color: #0d1e3a; text-align: right; }
  .b01-res .v.red { color: #b3402e; }
  .b01-form { display: grid; grid-template-columns: 220px 1fr; gap: 16px 22px; align-items: center; }
  .b01-form label, .b01-form .lb2 { font: 600 15px/1.2 "DM Sans", sans-serif; color: #667389; letter-spacing: .04em; text-transform: uppercase; }
  .b01-form input { height: 50px; border: 1.5px solid #cbd5e3; border-radius: 10px; padding: 0 14px; font: 600 21px/1 "DM Sans", sans-serif; color: #0d1e3a; width: 100%; box-sizing: border-box; }
  .b01-form input:focus { outline: none; border-color: #b8972e; box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .b01-cyc { border: 1.5px solid #cbd5e3; background: #fff; border-radius: 999px; padding: 6px 14px; font: 600 15px/1.1 "DM Sans", sans-serif; color: #0d1e3a; min-width: 92px; }
  .b01-cyc:hover { border-color: #b8972e; background: #f0e6c4; }
  .b01-ed td input { width: 100%; box-sizing: border-box; height: 40px; border: 1.5px solid #cbd5e3; border-radius: 8px; padding: 0 10px; font: 600 17px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b01-ed td { padding: 7px 8px; }
  .b01-am1img { position: absolute; opacity: .34; }
  .b01-am1box { position: absolute; left: 176px; width: 1248px; top: 520px; box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-left: 6px solid #b8972e; border-radius: 16px; padding: 30px 40px; box-shadow: 0 16px 36px rgba(13,30,58,.10); font: 600 30px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }
  `);
  /* ---------- shared AM data ---------- */
  const AMNS = 'am';
  const AM_DEF = { risk: { high: 33, mod: 33, low: 34 }, tax: { t: 33, d: 33, a: 34 } };
  function amPrefs(kind) {
    const v = EFA.clients.get(AMNS, kind, null) || {}, d = AM_DEF[kind];
    const norm = (o) => { const r = Object.assign({}, d); Object.keys(d).forEach((k) => { if (o && isFinite(o[k])) r[k] = +o[k]; }); return r; };
    return { client: norm(v.client), spouse: norm(v.spouse), combined: norm(v.combined) };
  }
  const amSavePrefs = (kind, p) => EFA.clients.set(AMNS, kind, p);
  function balRisk(o, key, v) {
    v = Math.max(0, v); const r = { high: o.high, mod: o.mod, low: o.low };
    if (key === 'low') { if (v > 100) { v = 100; r.mod = 0; r.high = 0; } else { const rest = 100 - v - r.high; if (rest < 0) { r.mod = 0; r.high = 100 - v; } else r.mod = rest; } r.low = v; }
    if (key === 'mod') { if (v > 100) { v = 100; r.low = 0; r.high = 0; } else { const rest = 100 - r.high - v; if (rest < 0) { r.low = 0; r.high = 100 - v; } else r.low = rest; } r.mod = v; }
    if (key === 'high') { if (v > 100) { v = 100; r.low = 0; r.mod = 0; } else { const rest = 100 - r.mod - v; if (rest < 0) { r.low = 0; r.mod = 100 - v; } else r.low = rest; } r.high = v; }
    return r;
  }
  function balTax(o, key, v) {
    v = Math.max(0, v); const r = { t: o.t, d: o.d, a: o.a };
    if (key === 't') { if (v > 100) { v = 100; r.d = 0; r.a = 0; } else { const rest = 100 - v - r.d; if (rest < 0) { r.a = 0; r.d = 100 - v; } else r.a = rest; } r.t = v; }
    if (key === 'd') { if (v > 100) { v = 100; r.t = 0; r.a = 0; } else { const rest = 100 - r.t - v; if (rest < 0) { r.a = 0; r.t = 100 - v; } else r.a = rest; } r.d = v; }
    if (key === 'a') { if (v > 100) { v = 100; r.t = 0; r.d = 0; } else { const rest = 100 - r.t - v; if (rest < 0) { r.d = 0; r.t = 100 - v; } else r.d = rest; } r.a = v; }
    return r;
  }
  const pctTxt = (v) => `${(Math.round(v * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
  const DEF_ACCT = 'Current Value of Investments';
  function savingsList() {
    const v = caseGet('savingsList');
    if (Array.isArray(v)) return v.map((a) => ({ account_name: a.account_name || '', current_balance: num(a.current_balance, 0), taxation: a.taxation || 'Taxable', risk: a.risk || 'High', accessible: a.accessible || 'No' }));
    return [{ account_name: EFA.wording.get('am4', 'defName', DEF_ACCT), current_balance: 88000, taxation: 'Tax Def.', risk: 'High', accessible: 'No' }];
  }
  function saveSavings(list) { caseSet('savingsList', list); caseSet('savingsTotal', list.reduce((s, a) => s + num(a.current_balance, 0), 0)); }
  const OPT = { taxation: ['Taxable', 'Tax Def.', 'Tax Adv.'], risk: ['High', 'Medium', 'Low'], accessible: ['Yes', 'No'] };
  const optKey = (v) => 'o.' + String(v).replace(/[^A-Za-z]/g, '');
  const OPT_COPY = { 'o.Taxable': 'Taxable', 'o.TaxDef': 'Tax Def.', 'o.TaxAdv': 'Tax Adv.', 'o.High': 'High', 'o.Medium': 'Medium', 'o.Low': 'Low', 'o.Yes': 'Yes', 'o.No': 'No' };
  /** the desired 3 x 3 mix from stated preferences (fractions). rows t/d/a, columns high/mod/low */
  function desiredGrid(risk, tax, even) {
    const R = { high: risk.high / 100, mod: risk.mod / 100, low: risk.low / 100 }, T = { t: tax.t / 100, d: tax.d / 100, a: tax.a / 100 };
    const g = { t: { high: 0, mod: 0, low: 0 }, d: { high: 0, mod: 0, low: 0 }, a: { high: 0, mod: 0, low: 0 } };
    if (even) { ['t', 'd', 'a'].forEach((r) => ['high', 'mod', 'low'].forEach((c) => { g[r][c] = T[r] * R[c]; })); return g; }
    const rem = Object.assign({}, R);
    ['a', 'd', 't'].forEach((r) => {
      let amt = T[r];
      ['low', 'mod', 'high'].forEach((c) => { const take = Math.min(amt, rem[c]); g[r][c] = take > 1e-12 ? take : 0; amt -= take; rem[c] -= take; });
    });
    return g;
  }
  const TAXROW = { 'Taxable': 't', 'Tax Def.': 'd', 'Tax Adv.': 'a' }, RISKCOL = { High: 'high', Medium: 'mod', Low: 'low' };
  /** the actual 3 x 3 mix from the account list (dollar sums) */
  function actualGrid(list) {
    const g = { t: { high: 0, mod: 0, low: 0 }, d: { high: 0, mod: 0, low: 0 }, a: { high: 0, mod: 0, low: 0 } };
    const col = { high: 0, mod: 0, low: 0 }, row = { t: 0, d: 0, a: 0 };
    list.forEach((a) => { const r = TAXROW[a.taxation], c = RISKCOL[a.risk], b = num(a.current_balance, 0); if (!r || !c) return; g[r][c] += b; col[c] += b; row[r] += b; });
    return { g, col, row, S: col.high + col.mod + col.low };
  }
  const segHTML = (ctx, name, opts, val) => `<div class="b01-seg2" role="radiogroup" data-seg="${name}">${opts.map(([v, key]) => `<button type="button" role="radio" data-v="${v}" aria-checked="${v === val}">${ctx.t(key)}</button>`).join('')}</div>`;
  const chkHTML = (ctx, name, key, on, labelHTML) => `<button type="button" class="b01-chk" data-chk="${name}" aria-pressed="${!!on}"><span class="bx">${checkSvg}</span>${labelHTML || ctx.t(key)}</button>`;
  const pencil = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4l6 6L9 21H3v-6z"/></svg>';
  const trash = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>';

  /** the "Accumulated Savings" dialog shared by am6 and am7: edit cells, delete rows, Save & Return */
  function accountsDialog(ctx, onSaved) {
    const list = savingsList().map((a) => Object.assign({}, a)); let changed = false;
    const rowsHTML = () => list.map((a, i) => `<tr data-i="${i}"><td><input type="text" data-f="account_name" value="${esc(a.account_name)}"></td><td><input type="text" inputmode="decimal" data-f="current_balance" value="${esc(money(a.current_balance))}" style="text-align:right"></td>
        ${['taxation', 'risk', 'accessible'].map((f) => `<td class="c"><button type="button" class="b01-cyc" data-cyc="${f}">${ctx.t(optKey(a[f]))}</button></td>`).join('')}
        <td class="c"><button type="button" class="b01-ibtn" data-del="1" aria-label="Delete">${trash}</button></td></tr>`).join('');
    const ov = ctx.overlay({ title: ctx.t('accTitle'), wide: true, html: `<table class="st-table b01-acc b01-ed"><thead><tr><th style="width:34%">${ctx.t('h.name')}</th><th style="width:18%">${ctx.t('h.bal')}</th><th class="c">${ctx.t('h.tax')}</th><th class="c">${ctx.t('h.risk')}</th><th class="c">${ctx.t('h.acc')}</th><th style="width:70px"></th></tr></thead><tbody></tbody></table>
        <div class="b01-dlg-f"><button type="button" class="st-pill" data-save="1">${ctx.t('saveRet')}</button></div>` });
    const tb = ov.querySelector('tbody');
    const draw = () => { tb.innerHTML = rowsHTML(); arm(ctx); };
    draw();
    tb.addEventListener('change', (e) => {
      const inp = e.target.closest('input'); if (!inp) return;
      const i = +inp.closest('tr').dataset.i, f = inp.dataset.f;
      if (f === 'current_balance') { const v = F.parse(inp.value); list[i][f] = isFinite(v) ? Math.max(0, Math.round(v)) : 0; inp.value = money(list[i][f]); } else list[i][f] = inp.value;
      changed = true;
    });
    tb.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter' && e.target.blur) e.target.blur(); });
    tb.addEventListener('click', (e) => {
      if (EFA.edit.on) return;
      const tr = e.target.closest('tr'); if (!tr) return; const i = +tr.dataset.i;
      const cy = e.target.closest('[data-cyc]');
      if (cy) { const f = cy.dataset.cyc, o = OPT[f]; list[i][f] = o[(o.indexOf(list[i][f]) + 1) % o.length]; changed = true; draw(); return; }
      if (e.target.closest('[data-del]')) { list.splice(i, 1); changed = true; draw(); }
    });
    ctx.on(ov.querySelector('[data-save]'), 'click', () => {
      const a = document.activeElement; if (a && a.blur && ov.contains(a)) a.blur();
      if (changed) saveSavings(list);
      ov.close(); if (changed && onSaved) onSaved();
    });
  }
  const ACC_COPY = { accTitle: 'Accumulated Savings', 'h.name': 'Account Name', 'h.bal': 'Current Balance', 'h.tax': 'Taxation', 'h.risk': 'Risk', 'h.acc': 'Accessible', saveRet: 'Save & Return' };

  /* ---------- am1: title card ---------- */
  function riskArt() {
    const n = P.navy, g = P.gold;
    const pts = [[20, 210], [60, 150], [92, 182], [130, 96], [162, 150], [196, 128], [232, 214], [266, 160], [300, 236], [338, 176], [372, 120]];
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join('');
    return `<svg viewBox="0 0 400 400" width="408" height="408" aria-hidden="true">
      <rect x="6" y="40" width="388" height="300" rx="22" fill="${P.paper}" stroke="${n}" stroke-width="6"/>
      <path d="M40 300H364M40 300V70" stroke="${P.mist2}" stroke-width="5" stroke-linecap="round"/>
      ${[110, 160, 210, 260].map((y) => `<path d="M46 ${y}H360" stroke="${P.mist}" stroke-width="3"/>`).join('')}
      <path d="${d}" fill="none" stroke="${n}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="300" cy="236" r="12" fill="${g}" stroke="${n}" stroke-width="4"/>
      <path d="M262 64a30 30 0 1 1 44 26c-10 6-14 12-14 24" fill="none" stroke="${g}" stroke-width="18" stroke-linecap="round"/>
      <circle cx="292" cy="150" r="11" fill="${g}"/>
      <ellipse cx="200" cy="372" rx="170" ry="12" fill="${P.shadow}"/>
    </svg>`;
  }
  EFA.screen('am1', {
    title: 'Allocation Mix: risk, taxation and accessibility',
    copy: {
      head: 'Risk, Taxation and Accessibility',
      body: "There are many places to keep the money meant for your future lifestyle. Each one carries its own costs and its own benefits. Let's look at what you prefer when it comes to risk, taxes and access to your money.",
      _notes: 'Every place we keep money trades something for something else: growth for safety, tax savings for access.\n\n- Ask: When you think about the money you are saving for later, what matters most: that it grows, that it is safe, or that you can reach it?\nPAUSE\n\n- The next screens capture your preferences first, then compare them with where your money sits today.'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b01-am1img" style="left:112px;top:118px;width:520px">${A.ill.taxes({ w: 470 })}</div>
        <div class="b01-am1img" style="left:1090px;top:84px">${riskArt()}</div>
        <div class="b01-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b01-am1box">${ctx.t('body')}</div>`;
    }
  });

  /* ---------- am2 / am3: preference tanks ---------- */
  const PREF = {
    am2: {
      kind: 'risk', bal: balRisk, title: 'Allocation Mix: account risk preference',
      copy: { head: 'Account Risk', c0: 'Higher Risk', c1: 'Moderate Risk', c2: 'No/Low Risk',
        'x0.1': 'More volatility', 'x0.2': 'More return potential', 'x0.3': 'More chance of loss',
        'x1.1': 'Limited protection options', 'x1.2': 'Moderate volatility', 'x1.3': 'Limited liquidity', 'x1.4': 'Moderate return potential',
        'x2.1': "Guaranteed returns, backed by the issuer's claims-paying ability", 'x2.2': 'No-loss provisions', 'x2.3': 'High liquidity', 'x2.4': 'Lower return potential',
        _notes: 'Three levels of risk, each with its own personality. Most families hold some of each.\n\n- Click any tank to start. Enter the share you want in each; the others adjust so the total stays at 100.\n- Ask: If you had a dollar to save today, how much of it would you be comfortable seeing go down before it goes up?\nPAUSE\n\n- Switch to Spouse to capture both views; Combined shows the average.' },
      cols: [{ k: 'high', open: true, n: 3 }, { k: 'mod', open: true, n: 4 }, { k: 'low', open: false, n: 4 }]
    },
    am3: {
      kind: 'tax', bal: balTax, title: 'Allocation Mix: taxation preference',
      copy: { head: 'Taxation Options', c0: 'Taxable', c1: 'Tax Deferred', c1b: 'Tax Postponed', c2: 'Tax Advantaged',
        'x0.1': 'Contributions made after tax', 'x0.2': 'Ordinary tax on yearly earnings', 'x0.3': 'Capital-gains tax when gains are taken', 'x0.4': 'Gains and interest may increase the tax on Social Security benefits',
        'x1.1': 'Pre-tax and after-tax contributions allowed', 'x1.2': 'Ordinary tax on the whole withdrawal', 'x1.3': 'Withdrawals may increase the tax on Social Security benefits', 'x1.4': 'A poor fit if tax rates are higher later',
        'x2.1': 'Contributions made after tax', 'x2.2': 'Tax-free withdrawal options, generally, under current tax law', 'x2.3': 'May require qualifying', 'x2.4': 'May not count toward the tax on Social Security benefits',
        _notes: 'Every dollar is taxed now, later, or, when the rules are met, generally not at all.\n\n- Click any tank to start, then enter the share you want in each.\n- Ask: Would you rather pay tax on the seed or on the harvest?\nPAUSE\n\n- Click the middle title to switch between Tax Deferred and Tax Postponed.' },
      cols: [{ k: 't', open: false, n: 4 }, { k: 'd', open: false, n: 4, alt: true }, { k: 'a', open: false, n: 4 }]
    }
  };
  Object.keys(PREF).forEach((id) => {
    const cfg = PREF[id];
    EFA.screen(id, {
      title: cfg.title,
      copy: Object.assign({ link: 'Common Characteristics', selC: 'Client', selS: 'Spouse', selB: 'Combined' }, cfg.copy),
      render(ctx) {
        const S = { entry: false, target: 'client', prefs: amPrefs(cfg.kind) };
        const TW = 262, TH = 392, x0 = 80, cw = 480;
        const titleOf = (i, c) => (c.alt ? `<h3 class="tog" data-tog="1">${ctx.t(ctx.mem('postponed', false) ? 'c1b' : 'c1')}</h3>` : `<h3>${ctx.t('c' + i)}</h3>`);
        ctx.el.innerHTML = `
          <div class="b01-head" style="top:36px"><h1 class="st-h1" style="font-size:56px">${ctx.t('head')}</h1></div>
          ${cfg.cols.map((c, i) => `<div class="b01-am-col" style="left:${x0 + i * cw + 10}px">
              ${titleOf(i, c)}
              <div class="b01-am-tank" data-col="${c.k}" style="width:${TW}px;height:${TH}px">${tankSVG({ w: TW, h: TH, open: c.open, liq: LIQ.water, level: 1, sw: 4 })}
                <input class="b01-am-in b01-hide" data-in="${c.k}" inputmode="decimal" autocomplete="off" aria-label="${esc(ctx.text('c' + i))}"></div>
              <button type="button" class="b01-link b01-am-lnk" data-lnk="${i}">${ctx.t('link')}</button>
              <div class="b01-am-char b01-f is-off" data-char="${i}"><ul>${Array.from({ length: c.n }, (_, j) => `<li>${ctx.t(`x${i}.${j + 1}`)}</li>`).join('')}</ul></div>
            </div>`).join('')}
          <div class="b01-am-bar b01-f is-off" data-bar="1" style="top:790px">${segHTML(ctx, 'target', [['client', 'selC'], ['spouse', 'selS'], ['combined', 'selB']], 'client')}</div>`;
        const vals = () => S.prefs[S.target];
        const paint = () => {
          cfg.cols.forEach((c) => {
            const host = ctx.$(`[data-col="${c.k}"]`);
            setLevel(host, S.entry ? clamp(vals()[c.k] / 100, 0, 1) : 1);
            const inp = ctx.$(`[data-in="${c.k}"]`);
            inp.classList.toggle('b01-hide', !S.entry);
            if (document.activeElement !== inp) inp.value = pctTxt(vals()[c.k]);
            inp.readOnly = S.target === 'combined';
            host.classList.toggle('entry', S.entry);
          });
          ctx.$$('[data-seg="target"] button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === S.target)));
          ctx.show('[data-bar]', S.entry);
        };
        paint();
        ctx.on(ctx.$$('.b01-am-tank'), 'click', () => { if (!S.entry) { S.entry = true; S.target = 'client'; paint(); } });
        ctx.on(ctx.$$('[data-lnk]'), 'click', (e, b) => ctx.show(`[data-char="${b.dataset.lnk}"]`, true));
        ctx.on(ctx.$$('[data-seg="target"] button'), 'click', (e, b) => { S.target = b.dataset.v; paint(); });
        ctx.on(ctx.$$('[data-tog]'), 'click', (e, h) => { const v = !ctx.mem('postponed', false); ctx.remember('postponed', v); h.innerHTML = ctx.t(v ? 'c1b' : 'c1'); arm(ctx); });
        ctx.$$('[data-in]').forEach((inp) => {
          inp.addEventListener('focus', () => { inp.value = String(+vals()[inp.dataset.in].toFixed(2)); inp.select(); });
          inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
          inp.addEventListener('blur', () => {
            if (S.target === 'combined') { paint(); return; }
            const v = F.parse(inp.value);
            if (isFinite(v)) {
              const p = S.prefs;
              p[S.target] = cfg.bal(p[S.target], inp.dataset.in, v);
              Object.keys(p.client).forEach((k) => { p.combined[k] = (p.client[k] + p.spouse[k]) / 2; });
              amSavePrefs(cfg.kind, p);
            }
            paint();
          });
        });
      }
    });
  });

  /* ---------- am4: the account list and how much of it you can reach ---------- */
  EFA.screen('am4', {
    title: 'Allocation Mix: current allocation and accessibility',
    copy: Object.assign({
      head: 'Where Your Money Is Today', defName: DEF_ACCT,
      'h.name': 'Account Name', 'h.bal': 'Current Balance', 'h.tax': 'Taxation', 'h.risk': 'Risk', 'h.acc': 'Accessible',
      add: 'Add Allocation', calc: 'Calculate', cancel: 'Cancel', save: 'Save', dlgAdd: 'Add Allocation', dlgEdit: 'Edit Allocation',
      delQ: 'Delete this allocation from the list?', delYes: 'Delete', delNo: 'Keep', delTitle: 'Delete Allocation',
      capBal: 'Allocation Balance', capPct: 'Percentage of Portfolio', rowA: 'Accessible accounts', rowN: 'Limited or non-accessible accounts',
      _notes: 'Now the real picture: every account, what it holds, how it is taxed, how much risk it carries, and whether you can reach it.\n\n- Add each account, then click Calculate.\n- Ask: If you needed a large sum next month, how much of this could you actually use without a penalty, a tax bill or a sale at the wrong time?\nPAUSE'
    }, OPT_COPY),
    render(ctx) {
      const S = { list: savingsList(), shown: false, res: null };
      ctx.el.innerHTML = `
        <div class="b01-head" style="top:36px"><h1 class="st-h1" style="font-size:56px">${ctx.t('head')}</h1></div>
        <div class="b01-acc-wrap" style="display:grid;gap:18px;justify-items:center">
          <div class="b01-acc-scroll" style="width:100%;min-height:300px"><table class="st-table b01-acc"><thead><tr><th style="width:37%">${ctx.t('h.name')}</th><th style="width:18%">${ctx.t('h.bal')}</th><th class="c" style="width:12%">${ctx.t('h.tax')}</th><th class="c" style="width:12%">${ctx.t('h.risk')}</th><th class="c" style="width:12%">${ctx.t('h.acc')}</th><th style="width:9%"></th></tr></thead>
            <tbody></tbody><tfoot><tr><td colspan="6"><button type="button" class="st-pill" data-add="1">${ctx.t('add')}</button></td></tr></tfoot></table></div>
          <button type="button" class="st-pill" data-calc="1" style="min-width:220px">${ctx.t('calc')}</button>
        <div class="b01-res b01-f is-off" data-res="1" style="position:static;width:100%">
          <span></span><span class="cap">${ctx.t('capBal')}</span><span class="cap">${ctx.t('capPct')}</span>
          <span class="lb">${ctx.t('rowA')}</span><span class="v num" data-v="aB"></span><span class="v num" data-v="aP"></span>
          <span class="lb">${ctx.t('rowN')}</span><span class="v red num" data-v="nB"></span><span class="v red num" data-v="nP"></span>
        </div></div>`;
      const tb = ctx.$('.b01-acc tbody');
      const drawRows = () => {
        tb.innerHTML = S.list.map((a, i) => `<tr data-i="${i}"><td>${esc(a.account_name)}</td><td class="num">${money(a.current_balance)}</td><td class="c">${ctx.t(optKey(a.taxation))}</td><td class="c">${ctx.t(optKey(a.risk))}</td><td class="c">${ctx.t(optKey(a.accessible))}</td>
          <td class="c" style="white-space:nowrap"><button type="button" class="b01-ibtn" data-edit="${i}" aria-label="Edit">${pencil}</button><button type="button" class="b01-ibtn" data-del="${i}" aria-label="Delete">${trash}</button></td></tr>`).join('');
        arm(ctx);
      };
      const results = () => {
        if (!S.list.length) return; // the previous results stay as they were
        let Ab = 0, Nb = 0; S.list.forEach((a) => { if (a.accessible === 'Yes') Ab += a.current_balance; else Nb += a.current_balance; });
        const t = Ab + Nb, aP = t === 0 ? 0 : Ab / t, nP = t === 0 ? 1 : Nb / t;
        S.res = { Ab, Nb, aP, nP };
        ctx.$('[data-v="aB"]').textContent = money(Ab); ctx.$('[data-v="nB"]').textContent = money(Nb);
        ctx.$('[data-v="aP"]').textContent = pct2(aP); ctx.$('[data-v="nP"]').textContent = pct2(nP);
      };
      const commit = () => { saveSavings(S.list); drawRows(); results(); };
      drawRows(); results();
      const dialog = (i) => {
        const a = i == null ? { account_name: '', current_balance: 0, taxation: 'Taxable', risk: 'High', accessible: 'No' } : Object.assign({}, S.list[i]);
        const seg = (f) => `<div class="b01-seg2" data-f="${f}">${OPT[f].map((v) => `<button type="button" role="radio" data-v="${esc(v)}" aria-checked="${v === a[f]}">${ctx.t(optKey(v))}</button>`).join('')}</div>`;
        const ov = ctx.overlay({ title: ctx.t(i == null ? 'dlgAdd' : 'dlgEdit'), cls: 'b01-ov-sm', html: `<div class="b01-form">
            ${ctx.t('h.name', { tag: 'label' })}<input type="text" data-in="name" value="${esc(a.account_name)}" autocomplete="off">
            ${ctx.t('h.bal', { tag: 'label' })}<input type="text" data-in="bal" inputmode="decimal" value="${esc(money(a.current_balance))}" autocomplete="off" style="text-align:right">
            ${ctx.t('h.tax', { cls: 'lb2' })}${seg('taxation')}
            ${ctx.t('h.risk', { cls: 'lb2' })}${seg('risk')}
            ${ctx.t('h.acc', { cls: 'lb2' })}${seg('accessible')}
          </div><div class="b01-dlg-f"><button type="button" class="st-pill b01-ghost" data-x="1">${ctx.t('cancel')}</button><button type="button" class="st-pill" data-ok="1">${ctx.t('save')}</button></div>` });
        ov.querySelectorAll('input').forEach((inp) => inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); }));
        const bal = ov.querySelector('[data-in="bal"]');
        bal.addEventListener('focus', () => { const v = F.parse(bal.value); bal.value = isFinite(v) ? String(v) : ''; bal.select(); });
        bal.addEventListener('blur', () => { const v = F.parse(bal.value); bal.value = money(isFinite(v) ? Math.max(0, v) : 0); });
        ctx.on(Array.from(ov.querySelectorAll('.b01-seg2 button')), 'click', (e, b) => { const f = b.parentNode.dataset.f; a[f] = b.dataset.v; b.parentNode.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', String(x === b))); });
        ctx.on(ov.querySelector('[data-x]'), 'click', () => ov.close());
        ctx.on(ov.querySelector('[data-ok]'), 'click', () => {
          a.account_name = ov.querySelector('[data-in="name"]').value.trim();
          const v = F.parse(bal.value); a.current_balance = isFinite(v) ? Math.max(0, Math.round(v)) : 0;
          if (i == null) S.list.push(a); else S.list[i] = a;
          ov.close(); commit();
        });
      };
      ctx.on(ctx.$('[data-add]'), 'click', () => dialog(null));
      tb.addEventListener('click', (e) => {
        if (EFA.edit.on) return;
        const ed = e.target.closest('[data-edit]'); if (ed) { dialog(+ed.dataset.edit); return; }
        const dl = e.target.closest('[data-del]');
        if (dl) {
          const i = +dl.dataset.del;
          const ov = ctx.overlay({ title: ctx.t('delTitle'), cls: 'b01-ov-xs', html: `<p class="st-body" style="margin:0">${ctx.t('delQ')}</p><p class="st-small" style="margin:8px 0 0">${esc(S.list[i].account_name)}</p><div class="b01-dlg-f"><button type="button" class="st-pill b01-ghost" data-no="1">${ctx.t('delNo')}</button><button type="button" class="st-pill" data-yes="1">${ctx.t('delYes')}</button></div>` });
          ctx.on(ov.querySelector('[data-no]'), 'click', () => ov.close());
          ctx.on(ov.querySelector('[data-yes]'), 'click', () => { S.list.splice(i, 1); ov.close(); commit(); });
        }
      });
      ctx.on(ctx.$('[data-calc]'), 'click', (e, b) => { results(); ctx.show('[data-res]', true); b.classList.add('b01-hide'); });
    }
  });

  /* ---------- am5 / am6 / am7: the 3 x 3 tax-by-risk grid ---------- */
  const GR = { x0: 110, w: 1380, corner: 162, colW: 406, top: 118, headH: 92, rowH: 170 };
  const GCOLS = ['high', 'mod', 'low'], GROWS = ['t', 'd', 'a'];
  const GRID_COPY = { cH: 'High Risk', cM: 'Moderate Risk', cL: 'No/Low Risk', rT: 'Taxable', rD: 'Tax Deferred', rA: 'Tax Advantaged', selC: 'Client', selS: 'Spouse', selB: 'Combined', chkTot: 'Show Totals', chkEven: 'Even Dist.', showD: 'Show $', showP: 'Show %' };
  const gColX = (i) => GR.x0 + GR.corner + i * GR.colW;
  const gRowY = (r) => GR.top + GR.headH + 8 + r * GR.rowH;
  /** frame: headers with badge slots, the cell panel, and highlight bands. kinds: ['des'] | ['act'] | ['act','des'] */
  function gridFrame(ctx, kinds) {
    const bodyTop = gRowY(0), bodyH = 3 * GR.rowH;
    const colHead = (i) => `<div class="b01-grid-h" data-hc="${i}" style="left:${gColX(i)}px;top:${GR.top}px;width:${GR.colW}px;height:${GR.headH}px"><span class="t">${ctx.t(['cH', 'cM', 'cL'][i])}</span><div class="b01-badges">${kinds.map((k) => `<span class="b01-badge ${k} num" data-tot="${k}.c.${GCOLS[i]}"></span>`).join('')}</div></div>`;
    const rowHead = (r) => `<div class="b01-grid-h" data-hr="${r}" style="left:${GR.x0}px;top:${gRowY(r) + 20}px;width:${GR.corner - 8}px;height:${GR.rowH - 30}px;justify-items:start"><span class="t" style="text-align:left">${ctx.t(['rT', 'rD', 'rA'][r])}</span><div class="b01-badges v">${kinds.map((k) => `<span class="b01-badge ${k} num" data-tot="${k}.r.${GROWS[r]}"></span>`).join('')}</div></div>`;
    const lines = [1, 2].map((i) => `<div class="b01-gline" style="left:${gColX(i) - 1}px;top:${bodyTop}px;width:2px;height:${bodyH}px"></div>`).join('') + [1, 2].map((r) => `<div class="b01-gline" style="left:${gColX(0)}px;top:${gRowY(r) - 1}px;width:${3 * GR.colW}px;height:2px"></div>`).join('');
    const cells = GROWS.map((r, ri) => GCOLS.map((c, ci) => `<div class="b01-cell" data-cell="${r}.${c}" style="left:${gColX(ci)}px;top:${gRowY(ri)}px;width:${GR.colW}px;height:${GR.rowH}px"></div>`).join('')).join('');
    return `<div class="b01-gpanel" style="left:${gColX(0)}px;top:${bodyTop}px;width:${3 * GR.colW}px;height:${bodyH}px"></div>${lines}
      <div class="b01-band2" data-bandc="1" style="top:${GR.top - 4}px;width:${GR.colW - 8}px;height:${GR.headH + 12 + bodyH}px;opacity:0"></div>
      <div class="b01-band2" data-bandr="1" style="left:${GR.x0 - 6}px;width:${GR.w + 12}px;height:${GR.rowH - 6}px;opacity:0"></div>
      ${[0, 1, 2].map(colHead).join('')}${[0, 1, 2].map(rowHead).join('')}${cells}`;
  }
  function gridBands(ctx) {
    const st = { c: -1, r: -1 };
    const paint = () => {
      const bc = ctx.$('[data-bandc]'), br = ctx.$('[data-bandr]');
      bc.style.opacity = st.c < 0 ? 0 : 1; if (st.c >= 0) bc.style.left = `${gColX(st.c) + 4}px`;
      br.style.opacity = st.r < 0 ? 0 : 1; if (st.r >= 0) br.style.top = `${gRowY(st.r) + 3}px`;
    };
    ctx.on(ctx.$$('[data-hc]'), 'click', (e, h) => { const i = +h.dataset.hc; st.c = st.c === i ? -1 : i; paint(); });
    ctx.on(ctx.$$('[data-hr]'), 'click', (e, h) => { const i = +h.dataset.hr; st.r = st.r === i ? -1 : i; paint(); });
  }
  /** one small tank with a read-only value; kind 'des' (water) or 'act' (gold or navy by risk) */
  function cellTank(kind, col, frac, label, click) {
    const open = col !== 'low';
    const liq = kind === 'des' ? LIQ.water : (open ? LIQ.risk : LIQ.safe);
    return `<div class="b01-ctank ${click ? 'click' : ''}" ${click ? 'data-acct="1"' : ''}>${tankSVG({ w: 100, h: 142, open, liq, level: 0 })}<span class="b01-cval num">${label}</span></div>`;
  }
  function fillCells(ctx, cellsByKey) {
    // cellsByKey: {'t.high': [ {kind, frac, label, click} .. ] }
    GROWS.forEach((r) => GCOLS.forEach((c) => {
      const el = ctx.$(`[data-cell="${r}.${c}"]`), items = (cellsByKey[`${r}.${c}`] || []);
      const sig = items.map((x) => `${x.kind}:${x.show ? 1 : 0}`).join('|');
      if (el.dataset.sig !== sig) {
        el.dataset.sig = sig;
        el.innerHTML = items.map((x) => (x.show ? cellTank(x.kind, c, x.frac, x.label, x.click) : `<div class="b01-ctank" style="width:100px;height:142px"></div>`)).join('');
      }
      const tanks = el.querySelectorAll('.b01-ctank');
      items.forEach((x, i) => {
        const t = tanks[i]; if (!t || !x.show) return;
        t.querySelector('.b01-cval').textContent = x.label;
        requestAnimationFrame(() => setLevel(t, clamp(x.frac, 0, 1)));
      });
    }));
  }
  function setTotals(ctx, kind, col, row, fmtFn, show) {
    GCOLS.forEach((c) => { const b = ctx.$(`[data-tot="${kind}.c.${c}"]`); if (b) b.textContent = fmtFn(col[c]); });
    GROWS.forEach((r) => { const b = ctx.$(`[data-tot="${kind}.r.${r}"]`); if (b) b.textContent = fmtFn(row[r]); });
    ctx.$$(`[data-tot^="${kind}."]`).forEach((b) => b.classList.toggle('is-off', !show));
  }
  EFA.screen('am5', {
    title: 'Allocation Mix: desired mix',
    copy: Object.assign({ head: 'Your Desired Mix', _notes: 'Your preferences for risk and for taxes, combined into one picture of where your money would sit.\n\n- The default fills the safest places first; Even Dist. spreads each tax choice across every risk level.\n- Ask: Looking at this, does it feel like you? What would you move?\nPAUSE\n\n- Click any heading to highlight its row or column.' }, GRID_COPY, { disc: 'An illustration of stated preferences, not a recommendation of any product or allocation.' }),
    render(ctx) {
      const S = { target: 'client', tot: false, even: false };
      ctx.el.innerHTML = `<div class="b01-head" style="top:24px"><h1 class="st-h1" style="font-size:52px">${ctx.t('head')}</h1></div>
        ${gridFrame(ctx, ['des'])}
        <div class="b01-am-bar" style="top:746px">${segHTML(ctx, 'target', [['client', 'selC'], ['spouse', 'selS'], ['combined', 'selB']], 'client')}${chkHTML(ctx, 'tot', 'chkTot', false)}${chkHTML(ctx, 'even', 'chkEven', false)}</div>
        <p class="st-disclaimer b01-disc" style="margin:0">${ctx.t('disc')}</p>`;
      const paint = () => {
        const risk = amPrefs('risk')[S.target], tax = amPrefs('tax')[S.target];
        const g = desiredGrid(risk, tax, S.even), cells = {};
        GROWS.forEach((r) => GCOLS.forEach((c) => { const v = g[r][c]; cells[`${r}.${c}`] = [{ kind: 'des', show: v > 0, frac: v, label: pct2(v) }]; }));
        fillCells(ctx, cells);
        setTotals(ctx, 'des', { high: risk.high / 100, mod: risk.mod / 100, low: risk.low / 100 }, { t: tax.t / 100, d: tax.d / 100, a: tax.a / 100 }, pct2, S.tot);
        ctx.$$('[data-seg="target"] button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === S.target)));
        ctx.$$('[data-chk]').forEach((b) => b.setAttribute('aria-pressed', String(!!S[b.dataset.chk])));
      };
      paint(); gridBands(ctx);
      ctx.on(ctx.$$('[data-seg="target"] button'), 'click', (e, b) => { S.target = b.dataset.v; paint(); });
      ctx.on(ctx.$$('[data-chk]'), 'click', (e, b) => { S[b.dataset.chk] = !S[b.dataset.chk]; paint(); });
    }
  });
  EFA.screen('am6', {
    title: 'Allocation Mix: actual mix',
    copy: Object.assign({ head: 'Your Actual Mix', _notes: 'This is where your money actually sits today, account by account, by tax treatment and by risk.\n\n- Click any tank to review or correct the accounts.\n- Ask: Is this the mix you would have chosen on purpose?\nPAUSE' }, GRID_COPY, ACC_COPY, OPT_COPY),
    render(ctx) {
      const S = { tot: false, dollars: false };
      ctx.el.innerHTML = `<div class="b01-head" style="top:24px"><h1 class="st-h1" style="font-size:52px">${ctx.t('head')}</h1></div>
        ${gridFrame(ctx, ['act'])}
        <div class="b01-am-bar" style="top:746px">${chkHTML(ctx, 'tot', 'chkTot', false)}<button type="button" class="b01-chk" data-chk="dollars" aria-pressed="false"><span class="bx">${checkSvg}</span><span data-dl="1"></span></button></div>`;
      const paint = () => {
        const A2 = actualGrid(savingsList()), cells = {};
        GROWS.forEach((r) => GCOLS.forEach((c) => {
          const v = A2.g[r][c], frac = A2.S > 0 ? v / A2.S : 0;
          cells[`${r}.${c}`] = [{ kind: 'act', show: v > 0 && A2.S > 0, frac, label: S.dollars ? money(v) : pct2(frac), click: true }];
        }));
        fillCells(ctx, cells);
        const div = (o) => { const out = {}; Object.keys(o).forEach((k) => { out[k] = A2.S > 0 ? o[k] / A2.S : 0; }); return out; };
        setTotals(ctx, 'act', div(A2.col), div(A2.row), pct2, S.tot);
        ctx.$('[data-dl]').innerHTML = ctx.t(S.dollars ? 'showP' : 'showD');
        ctx.$$('[data-chk]').forEach((b) => b.setAttribute('aria-pressed', String(!!S[b.dataset.chk])));
        arm(ctx);
      };
      paint(); gridBands(ctx);
      ctx.on(ctx.$$('[data-chk]'), 'click', (e, b) => { S[b.dataset.chk] = !S[b.dataset.chk]; paint(); });
      ctx.el.addEventListener('click', (e) => { if (!EFA.edit.on && e.target.closest('[data-acct]')) accountsDialog(ctx, paint); });
    }
  });
  EFA.screen('am7', {
    title: 'Allocation Mix: actual versus desired',
    copy: Object.assign({
      q1: 'Does', chipA: 'what you have', q2: 'match', chipB: 'what you want', q3: '?', lgA: 'Actual', lgB: 'Desired',
      disc: 'An illustration of stated preferences compared with current accounts, not a recommendation to move any specific account or product.',
      _notes: 'The closing question of Allocation Mix: does what you have match what you want?\n\n- Each cell shows what you hold today (gold or navy) beside what you said you want (blue).\n- Ask: Where is the biggest gap, and which side of it should move?\nPAUSE\n\n- Show $ applies your desired mix to today\'s total so the gap reads in dollars.'
    }, GRID_COPY, ACC_COPY, OPT_COPY),
    render(ctx) {
      const S = { target: 'client', tot: false, dollars: false, even: false };
      ctx.el.innerHTML = `<div class="b01-head" style="top:20px;padding:0 260px"><h1 class="st-h1" style="font-size:48px">${ctx.t('q1')} <span class="b01-chipA">${ctx.t('chipA')}</span> ${ctx.t('q2')} <span class="b01-chipB">${ctx.t('chipB')}</span>${ctx.t('q3')}</h1></div>
        <div class="b01-lgd"><span class="b01-chipA">${ctx.t('lgA')}</span><span class="b01-chipB">${ctx.t('lgB')}</span></div>
        ${gridFrame(ctx, ['act', 'des'])}
        <div class="b01-am-bar" style="top:746px">${segHTML(ctx, 'target', [['client', 'selC'], ['spouse', 'selS'], ['combined', 'selB']], 'client')}${chkHTML(ctx, 'tot', 'chkTot', false)}<button type="button" class="b01-chk" data-chk="dollars" aria-pressed="false"><span class="bx">${checkSvg}</span><span data-dl="1"></span></button>${chkHTML(ctx, 'even', 'chkEven', false)}</div>
        <p class="st-disclaimer b01-disc" style="margin:0">${ctx.t('disc')}</p>`;
      const paint = () => {
        const risk = amPrefs('risk')[S.target], tax = amPrefs('tax')[S.target];
        const D = desiredGrid(risk, tax, S.even), A2 = actualGrid(savingsList()), cells = {};
        GROWS.forEach((r) => GCOLS.forEach((c) => {
          const a = A2.g[r][c], d = D[r][c];
          const aFrac = A2.S > 0 ? a / A2.S : 0;
          const act = { kind: 'act', show: a > 0 && A2.S > 0, frac: aFrac, label: S.dollars ? money(a) : pct2(aFrac), click: true };
          const des = S.dollars
            ? { kind: 'des', show: d > 0, frac: A2.S > 0 ? d : 0, label: money(A2.S > 0 ? d * A2.S : 0) }
            : { kind: 'des', show: d > 0, frac: d, label: pct2(d) };
          cells[`${r}.${c}`] = [act, des];
        }));
        fillCells(ctx, cells);
        const div = (o) => { const out = {}; Object.keys(o).forEach((k) => { out[k] = A2.S > 0 ? o[k] / A2.S : 0; }); return out; };
        setTotals(ctx, 'act', div(A2.col), div(A2.row), pct2, S.tot);
        setTotals(ctx, 'des', { high: risk.high / 100, mod: risk.mod / 100, low: risk.low / 100 }, { t: tax.t / 100, d: tax.d / 100, a: tax.a / 100 }, pct2, S.tot);
        ctx.$('[data-dl]').innerHTML = ctx.t(S.dollars ? 'showP' : 'showD');
        ctx.$$('[data-seg="target"] button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === S.target)));
        ctx.$$('[data-chk]').forEach((b) => b.setAttribute('aria-pressed', String(!!S[b.dataset.chk])));
        arm(ctx);
      };
      paint(); gridBands(ctx);
      ctx.on(ctx.$$('[data-seg="target"] button'), 'click', (e, b) => { S.target = b.dataset.v; paint(); });
      ctx.on(ctx.$$('[data-chk]'), 'click', (e, b) => { S[b.dataset.chk] = !S[b.dataset.chk]; paint(); });
      ctx.el.addEventListener('click', (e) => { if (!EFA.edit.on && e.target.closest('[data-acct]')) accountsDialog(ctx, paint); });
    }
  });

  /* =====================================================================
     Annuities 101 (af1, af2, af3, af7) and the three detail cards (af4, af5, af6)
     Risk transfer leads; tax treatment comes second.
     ===================================================================== */
  EFA.css('b01-af', `
  .b01-af1-img { position: absolute; left: 110px; top: 214px; width: 560px; height: 380px; border-radius: 18px; overflow: hidden; box-shadow: 0 22px 46px rgba(13,30,58,.22); }
  .b01-af1-col { position: absolute; left: 730px; right: 110px; top: 206px; display: grid; gap: 0; }
  .b01-def { font: 400 30px/1.42 "DM Sans", sans-serif; color: #0d1e3a; margin: 0; }
  .b01-def b { font-weight: 700; }
  .b01-def i { font-style: italic; }
  .b01-sub { font: 600 34px/1.2 "Cormorant Garamond", Georgia, serif; color: #8a6e22; margin: 46px 0 18px; }
  .b01-chips { display: grid; gap: 14px; justify-items: start; }
  .b01-chip2 { background: #fffdf8; border: 1px solid #d6cfc4; border-left: 6px solid #b8972e; border-radius: 12px; padding: 13px 22px; font: 600 25px/1.2 "DM Sans", sans-serif; color: #0d1e3a; box-shadow: 0 8px 20px rgba(13,30,58,.07); }
  .b01-ty { position: absolute; top: 300px; width: 380px; display: grid; gap: 22px; cursor: pointer; }
  .b01-ty .tt { height: 96px; border-radius: 16px; background: linear-gradient(135deg, #d5bd68, #b8972e); box-shadow: 0 14px 30px rgba(13,30,58,.16); display: grid; grid-template-columns: 1fr auto; align-items: center; padding: 0 26px; transition: transform .2s ease, box-shadow .2s ease; }
  .b01-ty .tt span { font: 700 30px/1 "DM Sans", sans-serif; letter-spacing: .16em; color: #0d1e3a; }
  .b01-ty .tt svg { display: block; }
  .b01-ty .td { min-height: 210px; box-sizing: border-box; border-radius: 16px; background: #f0e6c4; border: 1px solid #d5bd68; padding: 24px 26px; font: 500 22px/1.42 "DM Sans", sans-serif; color: #0d1e3a; box-shadow: 0 10px 24px rgba(13,30,58,.08); transition: transform .2s ease, box-shadow .2s ease; }
  .b01-ty:hover .tt, .b01-ty:hover .td { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(13,30,58,.18); }
  .b01-afp { position: absolute; left: 1110px; right: 44px; top: 34px; }
  .b01-afp h2 { margin: 0 0 22px; font: 600 44px/1.06 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .stage .b01-bt { font: 500 20px/1.35 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-vis { position: absolute; left: 40px; top: 30px; width: 1030px; height: 790px; }
  .b01-chartp { position: absolute; inset: 0; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 18px; box-shadow: 0 16px 36px rgba(13,30,58,.10); }
  .b01-chartp h3 { position: absolute; left: 40px; top: 26px; margin: 0; font: 600 36px/1.1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b01-leg { position: absolute; right: 36px; top: 34px; display: flex; gap: 22px; font: 600 17px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-leg span { display: inline-flex; align-items: center; gap: 9px; }
  .b01-leg i { width: 30px; height: 8px; border-radius: 4px; display: inline-block; }
  .b01-chartp svg { position: absolute; left: 40px; top: 96px; }
  .b01-bldg { position: absolute; inset: 20px 30px 40px 30px; display: grid; place-items: center; }
  .b01-afgrey { position: relative; width: 100%; height: 100%; }
  .b01-afgrey i { position: absolute; left: 0; right: 0; top: 0; height: 46%; background: rgba(60,66,78,.8); border-radius: 4px; }
  .b01-afgrey.go { animation: lib-wink 1.5s linear both; }
  `);
  function chalkArt() {
    const n = P.navy, g = P.gold, c = '#f3efe4';
    const coin = (x, y, r, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="4" opacity="${o || 1}"/><path d="M${x} ${y - r * 0.5}v${r}" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="${o || 1}"/>`;
    const pays = [0, 1, 2, 3, 4, 5].map((i) => coin(250 + i * 50, 218 - Math.sin(i * 0.35) * 10, 15, 1 - i * 0.08)).join('');
    return `<svg viewBox="0 0 560 380" width="560" height="380" aria-hidden="true">
      <rect width="560" height="380" fill="${P.goldDeep}"/>
      <rect x="16" y="16" width="528" height="348" rx="6" fill="#16304f"/>
      <rect x="16" y="16" width="528" height="348" rx="6" fill="none" stroke="${g}" stroke-width="3" opacity=".6"/>
      <path d="M44 300c120-8 300-6 470 0" stroke="${c}" stroke-width="2" opacity=".18" fill="none"/>
      ${coin(118, 136, 52)}
      <path d="M100 100h36M100 172h36" stroke="${c}" stroke-width="3" opacity=".5"/>
      <path d="M176 128c40-22 66 16 72 64" fill="none" stroke="${g}" stroke-width="5" stroke-linecap="round" stroke-dasharray="3 12"/>
      <path d="M236 178l12 18 14-16" fill="none" stroke="${g}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      ${pays}
      <path d="M232 262H536" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${250 + i * 50} 254v16" stroke="${c}" stroke-width="3" opacity=".7"/>`).join('')}
      <path d="M520 262l16 0-10-8M536 262l-10 8" stroke="${c}" stroke-width="3" fill="none" opacity=".7"/>
      <g transform="translate(430 300) rotate(-28)"><rect x="-6" y="-58" width="14" height="70" rx="4" fill="${c}"/><path d="M-26 8c-6 30 10 52 34 54 20 2 36-8 40-30l4-40c1-8-10-10-12-2l-4 20 0-36c0-8-12-8-12 0v30 0-40c0-8-12-8-12 0v40-30c0-8-12-8-12 0v40l-6-12c-4-8-14-4-12 4z" fill="${P.paper}" stroke="${n}" stroke-width="3" stroke-linejoin="round"/></g>
    </svg>`;
  }
  /** a solid insurance-company building (stability), drawn fresh: pediment with a shield, columns, wide steps */
  function insurerArt(w) {
    const n = P.navy, g = P.gold, pa = P.paper, n3 = P.navy3;
    const cols = [0, 1, 2, 3, 4, 5].map((i) => {
      const x = 118 + i * 74;
      return `<rect x="${x}" y="232" width="40" height="232" fill="${pa}" stroke="${n}" stroke-width="5"/><path d="M${x + 13} 240v216M${x + 27} 240v216" stroke="${P.mist2}" stroke-width="3"/><rect x="${x - 8}" y="220" width="56" height="16" fill="${n}"/><rect x="${x - 8}" y="462" width="56" height="12" fill="${n}"/>`;
    }).join('');
    return `<svg viewBox="0 0 680 600" width="${w}" height="${w * 600 / 680}" aria-hidden="true">
      <ellipse cx="340" cy="578" rx="320" ry="16" fill="${P.shadow}"/>
      <path d="M60 196 340 52l280 144z" fill="${n}"/>
      <path d="M104 186 340 66l236 120z" fill="none" stroke="${g}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M340 92l44 16v34c0 32-20 52-44 64-24-12-44-32-44-64v-34z" fill="${g}" stroke="${P.goldDeep}" stroke-width="4"/>
      <path d="M318 142l16 16 30-32" fill="none" stroke="${n}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="66" y="196" width="548" height="26" fill="${n3}"/>
      ${cols}
      <rect x="80" y="474" width="520" height="22" fill="${n3}"/>
      <rect x="56" y="496" width="568" height="24" fill="${n}"/>
      <rect x="32" y="520" width="616" height="26" fill="${n3}"/>
      <rect x="12" y="546" width="656" height="20" fill="${n}"/>
    </svg>`;
  }
  /* synthetic hypothetical series, 100 points each (illustrative shapes only) */
  const AF_SERIES = (() => {
    const kp = [[0, 44], [5, 37], [10, 30], [15, 21], [20, 13], [24, 22], [28, 31], [31, 27], [34, 36], [37, 40], [39, 24], [42, 34], [46, 42], [50, 47], [54, 52], [58, 61], [62, 57], [66, 65], [70, 62], [74, 70], [78, 75], [82, 72], [86, 80], [90, 85], [94, 90], [97, 87], [99, 86]];
    const interp = (x) => { for (let i = 1; i < kp.length; i++) if (x <= kp[i][0]) { const [x0, y0] = kp[i - 1], [x1, y1] = kp[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return kp[kp.length - 1][1]; };
    const index = Array.from({ length: 100 }, (_, i) => (i === 0 || i === 99) ? interp(i) : clamp(interp(i) + 2.3 * Math.sin(i * 1.7) + 1.4 * Math.sin(i * 3.1 + 1), 4, 98));
    const ramps = [[0, 44], [19, 44], [29, 51], [39, 51], [59, 68], [79, 68], [99, 76]];
    const fia = Array.from({ length: 100 }, (_, i) => { for (let k = 1; k < ramps.length; k++) if (i <= ramps[k][0]) { const [x0, y0] = ramps[k - 1], [x1, y1] = ramps[k]; return y0 + (y1 - y0) * (i - x0) / (x1 - x0); } return 76; });
    const fixed = Array.from({ length: 100 }, (_, i) => 44 + 0.2 * i);
    return { index, fia, fixed };
  })();
  const AF_COLORS = { index: P.steel, fia: P.gold, fixed: P.navy };
  /** chart panel: title, legend and thick lines on white grid lines, y 0..100, no axis labels */
  function afChart(ctx, series) {
    const W = 950, H = 660, pl = 10, pr = 10, pt = 10, pb = 10;
    const X = (i) => pl + i * (W - pl - pr) / 99, Y = (v) => pt + (H - pt - pb) * (1 - v / 100);
    let grid = `<rect x="${pl}" y="${pt}" width="${W - pl - pr}" height="${H - pt - pb}" rx="10" fill="${P.mist}" opacity=".55"/>`;
    for (let v = 0; v <= 100; v += 20) grid += `<path d="M${pl} ${Y(v)}H${W - pr}" stroke="#fff" stroke-width="3"/>`;
    for (let i = 0; i <= 99; i += 11) grid += `<path d="M${X(i)} ${pt}V${H - pb}" stroke="#fff" stroke-width="3"/>`;
    const lines = series.map((s) => {
      const d = AF_SERIES[s.k].map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
      return `<path d="${d}" fill="none" stroke="${AF_COLORS[s.k]}" stroke-opacity="${s.op || 1}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('');
    return `<div class="b01-chartp">
        <h3>${ctx.t('chartTitle')}</h3>
        <div class="b01-leg">${series.map((s) => `<span><i style="background:${AF_COLORS[s.k]};opacity:${s.op || 1}"></i>${ctx.t('ser.' + s.k)}</span>`).join('')}</div>
        <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${grid}${lines}</svg>
      </div>`;
  }
  const AF_CHART_COPY = { chartTitle: 'Hypothetical Example', 'ser.index': 'Stock Market Index', 'ser.fia': 'Fixed Indexed Annuity', 'ser.fixed': 'Fixed Annuity' };
  /** the PEM in the annuity lessons' frame: zoomed model on the left, panel on the right */
  function afPem(ctx, o) {
    return EFA.lib.pem.mount(ctx, ctx.el, Object.assign({
      links: false, scenarioPicker: false, showBorrowed: false, borrowSource: false, showHouse: false,
      rip: true, showFuture: true, regulator: 0, sliders: false, chevrons: false,
      frame: { zoom: { scale: 1.1, shift: [7, -5] }, width: 0.69, expanded: !!o.expanded, panel: '.b01-afp, .b01-afd', expandShows: ['labels', 'lifestyle'], toggle: true }
    }, o.cfg || {}));
  }
  const pemReady = () => !!(EFA.lib && EFA.lib.pem && EFA.lib.pem.mount);

  /* ---------- af1: what an annuity is ---------- */
  EFA.screen('af1', {
    title: 'Annuities 101: definition and three common forms',
    steps: 5,
    copy: {
      head: 'Annuities 101', defLbl: 'Annuity:',
      def: 'An arrangement where you hand money to another party and it comes back to you over time as a series of payments. In return, the other party takes on some of your risk, such as the risk of outliving your money.',
      sub: 'Three familiar sources of annuity-style income',
      c1: '1. Public annuities: Social Security', c2: '2. Private annuities: pensions', c3: '3. Asset-backed annuities: insurance companies',
      _notes: 'An annuity is an exchange: money now for income later, with someone else carrying part of the risk. You already know two of them.\n\n- Ask: When you think about Social Security or a pension, what do you value most about it?\nPAUSE\n\n- Most people answer: it keeps coming, no matter how long I live. That is the risk an insurer can take on too.'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b01-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b01-af1-img">${chalkArt()}</div>
        <div class="b01-af1-col">
          <p class="b01-def"><b>${ctx.t('defLbl')}</b> <i>${ctx.t('def')}</i></p>
          <p class="b01-sub b01-f" data-s="1">${ctx.t('sub')}</p>
          <div class="b01-chips">${[1, 2, 3].map((k) => `<div class="b01-chip2 b01-f" data-s="${k + 1}">${ctx.t('c' + k)}</div>`).join('')}</div>
        </div>
        ${EFA.lib.disclosure ? EFA.lib.disclosure.line(['guarantees'], { cls: 'b01-disc', style: 'margin:0' }) : ''}`;
    },
    step(ctx, n) { ctx.$$('[data-s]').forEach((el) => ctx.show(el, n >= +el.dataset.s)); }
  });

  /* ---------- af3: types of annuities ---------- */
  const tySpark = (k) => {
    const pts = k === 'f' ? [[4, 40], [96, 14]] : k === 'i' ? [[4, 40], [26, 40], [40, 28], [58, 28], [74, 16], [96, 16]] : [[4, 34], [16, 18], [28, 40], [42, 22], [54, 44], [68, 12], [82, 30], [96, 8]];
    return `<svg viewBox="0 0 100 48" width="92" height="44" aria-hidden="true"><path d="${pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join('')}" fill="none" stroke="${P.navy}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  };
  EFA.screen('af3', {
    title: 'Annuities 101: types of annuities',
    copy: {
      head: 'Types of Annuities', tF: 'FIXED', tI: 'INDEXED', tV: 'VARIABLE',
      dF: 'The insurance company credits a set interest rate that it declares in advance.',
      dI: 'Interest credits follow an outside market index, within caps and floors. Your money is not invested in the index.',
      dV: 'You own subaccounts invested in the market, so values can rise and fall. Sold by prospectus.',
      disc: 'Guarantees are backed by the claims-paying ability of the issuing insurer. Variable annuities are securities, offered only by prospectus through properly registered representatives.',
      _notes: 'Three kinds of annuity, three different ways money grows inside them. Each one moves a different amount of risk to the insurer.\n\n- Ask: Which matters more to you: knowing your rate in advance, sharing in part of the market\'s gains with a floor underneath, or full market participation?\nPAUSE\n\n- Click any type to open its detail card; it returns here.'
    },
    render(ctx) {
      const T = [['f', 'tF', 'dF', ['A101F', 'af4']], ['i', 'tI', 'dI', ['A101I', 'af5']], ['v', 'tV', 'dV', ['A101V', 'af6']]];
      ctx.el.innerHTML = `
        <div class="b01-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${T.map(([k, tk, dk, go], i) => `<div class="b01-ty" data-go="${go.join('|')}" style="left:${170 + i * 440}px"><div class="tt"><span>${ctx.t(tk)}</span>${tySpark(k)}</div><div class="td">${ctx.t(dk)}</div></div>`).join('')}
        <p class="st-disclaimer b01-disc" style="margin:0">${ctx.t('disc')}</p>`;
      ctx.on(ctx.$$('[data-go]'), 'click', (e, n) => { const [k, s] = n.dataset.go.split('|'); ctx.jump(k, s); });
    }
  });

  /* ---------- af2: where an insurer-backed annuity fits on the model ---------- */
  EFA.screen('af2', {
    title: 'Annuities 101: insurer-backed annuity characteristics',
    steps: 6,
    copy: {
      head: 'What an Insurer-Backed Annuity Does',
      b1: 'It can sit in either tank, inside or outside a qualified plan.',
      b2: 'You decide how much goes in and when income begins.',
      b3: 'How it grows depends on the kind of annuity.',
      b4: 'It is the one product that can keep paying income after the tank runs dry, when the contract includes a lifetime income option.',
      pending: 'The model is loading.',
      _notes: 'Lead with the risk an annuity takes off the client\'s plate: outliving the money. Then show where it sits on the model.\n\n- Step through: either tank, inside or outside a qualified plan; you control deposits and income timing; growth depends on the type.\n- On the last step the tanks drain while income keeps flowing.\n- Ask: What would it mean to you to know a paycheck keeps coming, however long you live?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b01-afp b01-f">${ctx.t('head', { tag: 'h2' })}${EFA.lib.bullets.list(ctx, ['b1', 'b2', 'b3', 'b4'], { from: 2, boxed: true, size: 34, gap: 14, text: 'b01-bt' })}</div>
        ${EFA.lib.disclosure ? EFA.lib.disclosure.line(['guarantees'], { cls: 'b01-disc b01-afd b01-f', style: 'margin:0;left:1110px;right:44px;bottom:72px' }) : ''}`;
      if (pemReady()) ctx.pem = afPem(ctx, { expanded: true });
      else ctx.el.insertAdjacentHTML('beforeend', `<p class="st-small" style="position:absolute;left:110px;top:420px">${ctx.t('pending')}</p>`);
    },
    step(ctx, n) {
      EFA.lib.bullets.reveal(ctx, n);
      const p = ctx.pem; if (!p) return;
      p.expand(n === 0);
      ['AF2FillTanks', 'AF2GrowTanks', 'AF2FundOutflow'].forEach((s) => p.stop(s));
      p.flowsOff();
      if (n <= 2) p.set({ safe: 0, risk: 0, regulator: 0 }, { ms: 0 });
      if (n === 3) { p.set({ regulator: 0 }, { ms: 0 }); ctx.timeout(() => p.play('AF2FillTanks'), 100); }
      if (n === 4) { p.set({ regulator: 0 }, { ms: 0 }); ctx.timeout(() => p.play('AF2GrowTanks'), 100); }
      if (n === 5) { p.set({ regulator: 100 }, { ms: 0 }); ctx.timeout(() => p.play('AF2FundOutflow'), 100); }
      p.unhighlight();
      if (n === 2) ['qp', 'risk', 'safe'].forEach((t) => p.highlight(t, { wink: true }));
    }
  });

  /* ---------- af7: key takeaways ---------- */
  EFA.screen('af7', {
    title: 'Annuities 101: key takeaways',
    steps: 5,
    copy: Object.assign({
      head: 'Key Takeaways',
      b1: 'Liquidity terms differ from one annuity to the next.',
      b2: 'Backed by the claims-paying ability of large life insurance companies.',
      b3: 'Account growth deserves a close look.',
      b4: 'Built to provide lifetime retirement income, with options for a surviving spouse.',
      disc: 'Hypothetical illustration, not a projection of any product. Surrender charges may apply. Lifetime and survivor income depend on the payout option or rider chosen and on the claims-paying ability of the issuing insurer. Indexed crediting depends on caps and participation rates and does not equal index performance.',
      pending: 'The model is loading.',
      _notes: 'Four things to remember, and the last one is the reason annuities exist: income you cannot outlive.\n\n- Ask: Of these four, which one matters most for your retirement?\nPAUSE\n\n- On the last step the tanks drain while the income keeps flowing.'
    }, AF_CHART_COPY),
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b01-vis b01-f is-off" data-vis="bldg"><div class="b01-chartp"><div class="b01-bldg">${insurerArt(620)}</div></div></div>
        <div class="b01-vis b01-f is-off" data-vis="chart">${afChart(ctx, [{ k: 'index' }, { k: 'fia' }, { k: 'fixed' }])}</div>
        <div class="b01-afp b01-f">${ctx.t('head', { tag: 'h2' })}${EFA.lib.bullets.list(ctx, ['b1', 'b2', 'b3', 'b4'], { from: 1, boxed: true, size: 34, gap: 14, text: 'b01-bt' })}</div>
        <p class="st-disclaimer b01-disc b01-afd b01-f" style="margin:0;left:1110px;right:44px;bottom:72px">${ctx.t('disc')}</p>`;
      if (pemReady()) ctx.pem = afPem(ctx, { expanded: false, cfg: { safe: 67, risk: 67 } });
    },
    step(ctx, n) {
      EFA.lib.bullets.reveal(ctx, n);
      ctx.show('[data-vis="bldg"]', n === 2);
      ctx.show('[data-vis="chart"]', n === 3);
      const p = ctx.pem; if (!p) return;
      p.el.style.transition = 'opacity .8s ease';
      p.el.style.opacity = (n === 2 || n === 3) ? '0' : '1';
      p.el.style.pointerEvents = (n === 2 || n === 3) ? 'none' : '';
      if (n === 2 || n === 3) p.expand(false);
      p.stop('AF2FundOutflow'); p.flowsOff();
      (ctx._grey || []).forEach((el) => el.remove()); ctx._grey = [];
      if (n === 4) { p.set({ regulator: 100 }, { ms: 0 }); ctx.timeout(() => p.play('AF2FundOutflow'), 100); }
      else p.set({ safe: 67, risk: 67, regulator: 0 }, { ms: 0 });
      if (n === 1) ctx._grey = ['riskFill', 'safeFill'].map((t) => p.place('<div class="b01-afgrey go"><i></i></div>', t));
    }
  });

  /* ---------- af4 / af5 / af6: one-screen detail cards ---------- */
  const AF_DETAIL = {
    af4: {
      title: 'Annuities 101: fixed annuities', steps: 4, tank: { safe: 33, risk: 0 }, series: [{ k: 'fixed' }],
      copy: { head: 'Fixed Annuities', b1: 'It lives in the safe tank.', b2: 'Account and income growth come from interest rates the insurer declares.', b3: 'Fees are optional, depending on the riders you choose. Surrender charges may apply.',
        disc: 'Hypothetical illustration, not a projection of any product. Rates are declared by the issuing insurer and may include a minimum guaranteed rate; guarantees are backed by its claims-paying ability. Surrender charges and rider costs may apply.',
        _notes: 'A fixed annuity moves market risk off the table: the insurer declares the rate and carries the risk.\n\n- Ask: How would it feel to know what this money will earn before the year begins?\nPAUSE' }
    },
    af5: {
      title: 'Annuities 101: fixed indexed annuities', steps: 5, tank: { safe: 33, risk: 0 }, series: [{ k: 'index', op: 0.4 }, { k: 'fia' }],
      copy: { head: 'Fixed Indexed Annuities', b1: 'It lives in the safe tank.', b2: 'Account and income growth come from limited participation in market gains.', b3: 'Index floors, caps and spreads determine growth.', b4: 'Fees are optional, depending on the riders you choose.',
        disc: 'Hypothetical illustration, not a projection of any product. Crediting depends on caps, participation rates, spreads and the crediting method, and does not equal index performance; the annuity does not invest in the index. Surrender charges may apply. Guarantees are backed by the claims-paying ability of the issuing insurer.',
        _notes: 'An indexed annuity trades part of the upside for a floor: when the index falls, the account does not.\n\n- Ask: Would you give up some of the market\'s best years to never have one of its worst?\nPAUSE' }
    },
    af6: {
      title: 'Annuities 101: variable annuities', steps: 6, tank: { safe: 0, risk: 33 }, series: [{ k: 'index' }],
      copy: { head: 'Variable Annuities', b1: 'It lives in the risk tank.', b2: 'Account and income growth come from direct market participation.', b3: 'You choose your investments.', b4: 'Fees are part of the contract.', b5: 'Riders can add optional fees.',
        disc: 'Hypothetical illustration. Variable annuities are securities, offered only by prospectus through properly registered representatives. Values fluctuate with the market and can lose principal.',
        _notes: 'A variable annuity keeps the market risk with you; riders can move some of it back to the insurer, for a fee.\n\n- Ask: How much of your retirement income do you want riding on the market?\nPAUSE' }
    }
  };
  Object.keys(AF_DETAIL).forEach((id) => {
    const cfg = AF_DETAIL[id], nb = cfg.steps - 1;
    EFA.screen(id, {
      title: cfg.title, steps: cfg.steps,
      copy: Object.assign({ pending: 'The model is loading.' }, AF_CHART_COPY, cfg.copy),
      render(ctx) {
        ctx.el.innerHTML = `
          <div class="b01-vis b01-f is-off" data-vis="chart">${afChart(ctx, cfg.series)}</div>
          <div class="b01-afp b01-f">${ctx.t('head', { tag: 'h2' })}${EFA.lib.bullets.list(ctx, Array.from({ length: nb }, (_, i) => 'b' + (i + 1)), { from: 1, boxed: true, size: 34, gap: 14, text: 'b01-bt' })}</div>
          <p class="st-disclaimer b01-disc b01-afd b01-f" style="margin:0;left:1110px;right:44px;bottom:72px">${ctx.t('disc')}</p>`;
        if (pemReady()) ctx.pem = afPem(ctx, { expanded: false, cfg: cfg.tank });
      },
      step(ctx, n) {
        EFA.lib.bullets.reveal(ctx, n);
        ctx.show('[data-vis="chart"]', n >= 2);
        const p = ctx.pem; if (!p) return;
        if (n >= 2) p.expand(false);
        p.el.style.transition = 'opacity .8s ease';
        p.el.style.opacity = n >= 2 ? '0' : '1';
        p.el.style.pointerEvents = n >= 2 ? 'none' : '';
        p.set(Object.assign({ regulator: 0 }, cfg.tank), { ms: 0 });
      }
    });
  });

  /* =====================================================================
     401(condo): condo1 assumptions, condo2 comparison
     ===================================================================== */
  EFA.css('b01-condo', `
  .b01-form2 { position: absolute; left: 380px; width: 840px; top: 196px; box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 18px; box-shadow: 0 16px 36px rgba(13,30,58,.08); padding: 18px 40px; display: grid; }
  .b01-frow { display: grid; grid-template-columns: 1fr 260px; align-items: center; gap: 20px; padding: 12px 0; border-bottom: 1px solid rgba(13,30,58,.10); }
  .b01-frow:last-child { border-bottom: 0; }
  .b01-frow .lb { font: 600 25px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b01-frow .st-field { gap: 0; }
  .stage .b01-frow .st-input { text-align: right; font-size: 24px; height: 54px; }
  .b01-err { position: absolute; left: 50%; transform: translateX(-50%); width: 760px; box-sizing: border-box; background: #fff7e6; border: 1px solid #d5bd68; border-left: 6px solid #b3402e; border-radius: 12px; padding: 14px 20px; display: grid; gap: 4px; }
  .b01-err b { font: 700 18px/1.2 "DM Sans", sans-serif; color: #b3402e; letter-spacing: .04em; }
  .b01-err span { font: 500 18px/1.35 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-ctitle { position: absolute; top: 34px; width: 670px; text-align: center; cursor: pointer; }
  .b01-ctitle span.t { font: 600 46px/1.1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; border-bottom: 3px solid #b8972e; padding: 0 10px 4px; }
  .b01-ctitle:hover span.t { color: #8a6e22; }
  .b01-cpanel { position: absolute; top: 116px; width: 670px; height: 610px; box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 18px; box-shadow: 0 16px 36px rgba(13,30,58,.08); padding: 16px 26px; display: grid; align-content: start; gap: 2px; }
  .b01-cl2 { position: relative; display: flex; justify-content: center; align-items: center; gap: 10px; min-height: 44px; font: 700 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; text-align: center; }
  .b01-cl2.hide { visibility: hidden; }
  .b01-cl2.fx { color: #0d1e3a; }
  .b01-cl2.item { font-weight: 600; color: #2b4c80; cursor: pointer; border-top: 1px dashed rgba(13,30,58,.10); }
  .b01-cl2.item:hover { color: #8a6e22; }
  .b01-cl2 .ans { color: #8a6e22; }
  .b01-cl2 .irr { cursor: pointer; border-bottom: 2px dotted #b8972e; }
  .b01-cl2 .val { display: inline-block; background: #f0e6c4; border: 1px solid #d5bd68; border-radius: 8px; padding: 2px 10px; font-weight: 700; color: #0d1e3a; }
  .b01-dot { position: absolute; right: -6px; top: 50%; width: 30px; height: 30px; margin-top: -15px; border-radius: 50%; background: #0d1e3a; border: 3px solid #d5bd68; cursor: pointer; box-shadow: 0 4px 10px rgba(13,30,58,.25); }
  .b01-dot:hover { background: #b8972e; }
  .b01-abar { position: absolute; left: 110px; right: 110px; top: 744px; display: flex; justify-content: space-evenly; align-items: center; }
  .b01-abar .b01-link { font-size: 21px; }
  .b01-q { position: absolute; left: 260px; right: 260px; display: grid; justify-items: center; gap: 22px; text-align: center; }
  .b01-q p { margin: 0; font: 600 34px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-qbtn { min-width: 150px; min-height: 58px !important; font-size: 24px !important; letter-spacing: .2em; }
  .b01-qval { background: #f0e6c4; border: 2px solid #b8972e; border-radius: 12px; padding: 10px 26px; font: 700 34px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-sum { position: absolute; left: 200px; width: 1200px; top: 180px; }
  .stage .b01-sumt td, .stage .b01-sumt th { padding: 16px 22px; font-size: 24px; }
  .stage .b01-sumt th { font-size: 15px; }
  .stage .b01-sumt td.pos { color: #0d1e3a; font-weight: 700; }
  .stage .b01-sumt td.neg { color: #b3402e; font-weight: 700; }
  .stage .b01-sumt tr.hl td { background: #f0e6c4 !important; border-top: 2px solid #d5bd68; border-bottom: 2px solid #d5bd68; }
  .b01-choose { display: grid; gap: 12px; }
  .b01-choose .st-pill { justify-content: flex-start; padding-left: 22px; min-height: 54px; font-size: 19px; }
  `);
  /* ---------- engine: 401(k) versus an interest-only condo (spec formulas exactly) ---------- */
  function irrMonthly(cf, guess) {
    if (!cf || cf.length < 2 || cf[0] > 0) return 0;
    let x = guess;
    for (let it = 0; it < 50000; it++) {
      let npv = 0, d = 0, f = 1;
      for (let k = 0; k < cf.length; k++) { npv += cf[k] / f; d += -k * cf[k] / (f * (1 + x)); f *= (1 + x); }
      if (!isFinite(npv) || !isFinite(d)) return 0;
      if (Math.abs(npv) <= 1e-5) break;
      if (d === 0) return 0;
      x -= npv / d;
      if (!isFinite(x) || x <= -1) return 0;
    }
    return x > 1 ? 0 : x;
  }
  const annualize = (m) => Math.pow(1 + m, 12) - 1;
  function condoEngine(o) {
    const P = num(o.P, 2000), t = num(o.t, 0.3), g = num(o.g, 0.15), Y = Math.max(1, Math.round(num(o.Y, 30)));
    const rIn = num(o.r, 0), r = rIn > 0 ? rIn : 0.08, fallback = !(rIn > 0);
    const N = 12 * Y, i = r / 12;
    const grid401 = (rate) => { const rows = []; let bom = 0; for (let m = 1; m <= N; m++) { const int = bom * rate, eom = bom + int + P; rows.push({ m, bom, int, eom }); bom = eom; } return rows; };
    const q = grid401(i), FV = q[N - 1].eom, T = FV * t, AT = FV - T;
    const CFq = Array.from({ length: N }, (_, k) => (k === N - 1 ? AT - P : -P));
    const s = P * t, c = P - s, l = c * t, p = -(P - l);
    const B = c * (1 - Math.pow(1 + i, -N)) / i;
    const CG = (FV - B) * g, S = FV - B - CG, D = FV - B;
    const flows = (last) => Array.from({ length: N }, (_, k) => (k === N - 1 ? last + p : p));
    const CFsale = flows(S), CFdeath = flows(D), CFsale2 = flows((AT - B) - (AT - B) * g), CFdeath2 = flows(AT - B);
    const IRR = (cf) => annualize(irrMonthly(cf, i));
    const qpIRR = IRR(CFq), cgIRR = IRR(CFsale), tfIRR = IRR(CFdeath), a3 = IRR(CFsale2), a4 = IRR(CFdeath2);
    const QPIRR = (x) => { const rows = grid401(x / 12), fv = rows[N - 1].eom, at = fv - fv * t; return annualize(irrMonthly(Array.from({ length: N }, (_, k) => (k === N - 1 ? at - P : -P)), i)); };
    const solve = (target) => {
      let x0 = r, f0 = target - qpIRR, x1 = r + f0, f1 = target - QPIRR(x1);
      for (let k = 0; k < 99; k++) {
        const step = (x1 - x0) / (f1 - f0) * f1;
        if (!isFinite(step)) return null;
        if (Math.abs(step) < 1e-6) return x1;
        x0 = x1; f0 = f1; x1 -= step; f1 = target - QPIRR(x1);
      }
      return null;
    };
    const a1 = solve(cgIRR), a2 = a1 == null ? null : solve(tfIRR);
    return { P, r, t, g, Y, N, i, fallback, q, FV, T, AT, CFq, s, c, l, p, B, CG, S, D, CFsale, CFdeath, CFsale2, CFdeath2, qpIRR, cgIRR, tfIRR, a1, a2, a3, a4 };
  }
  EFA.engines = EFA.engines || {};
  EFA.engines.condo = { run: condoEngine, irrMonthly, annualize };
  const condoInputs = () => ({
    P: EFA.clients.get('condo1', 'f.condoP', 2000), r: EFA.clients.get('condo1', 'f.condoR', 0),
    t: caseGet('taxRate'), g: caseGet('cgRate'), Y: EFA.clients.get('condo1', 'f.condoY', 30)
  });

  EFA.screen('condo1', {
    title: '401(condo): starting assumptions',
    copy: {
      head: 'Starting Assumptions', sub: 'Five numbers drive the comparison on the next screen.',
      lP: 'Monthly Payment Before Tax', lR: 'Interest Rate', lT: 'Ordinary Tax Bracket', lG: 'Capital Gain Tax Bracket', lY: 'Years to Project',
      go: 'Continue', errT: 'Unsupported Assumption', errB: 'This comparison needs an interest rate above zero. Please enter a rate to continue.',
      _notes: 'Same monthly dollars, two very different places to put them: a 401(k), or the payment on a condo you can use and enjoy.\n\n- Set the five numbers with the client. The rate is hypothetical.\n- Ask: If you could put this same amount toward something you could also use and enjoy, would you want to see how it compares?\nPAUSE'
    },
    render(ctx) {
      const row = (lb, f) => `<div class="b01-frow">${ctx.t(lb, { cls: 'lb' })}${f}</div>`;
      ctx.el.innerHTML = `
        <div class="b01-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"><p class="st-small" style="margin:0;font-size:21px">${ctx.t('sub')}</p></div>
        <div class="b01-form2">
          ${row('lP', ctx.field({ id: 'condoP', type: 'money', value: 2000, min: 0 }))}
          ${row('lR', ctx.field({ id: 'condoR', type: 'pct', value: 0, max: 0.12 }))}
          ${row('lT', caseField(ctx, { id: 'condoT', type: 'pct', value: 0.30, min: 0, max: 1 }, 'taxRate'))}
          ${row('lG', caseField(ctx, { id: 'condoG', type: 'pct', value: 0.15, min: 0, max: 1 }, 'cgRate'))}
          ${row('lY', ctx.field({ id: 'condoY', type: 'int', value: 30, min: 1, max: 60 }))}
        </div>
        <button type="button" class="st-pill" data-go="1" style="position:absolute;left:50%;transform:translateX(-50%);top:640px;min-width:230px;min-height:56px;font-size:21px">${ctx.t('go')}</button>
        <div class="b01-err b01-f is-off" data-err="1" style="top:716px"><b>${ctx.t('errT')}</b><span>${ctx.t('errB')}</span></div>
        ${EFA.lib.disclosure ? EFA.lib.disclosure.line(['hypothetical'], { cls: 'b01-disc', style: 'margin:0' }) : ''}`;
      if (EFA.lib.disclosure) EFA.lib.disclosure.guard(ctx, 'condoR');
      ctx.onFields((v) => { if (v.condoR > 0) ctx.show('[data-err]', false); });
      ctx.on(ctx.$('[data-go]'), 'click', () => {
        const a = document.activeElement; if (a && a.blur && ctx.el.contains(a)) a.blur();
        if (!(ctx.values().condoR > 0)) { ctx.show('[data-err]', true); return; }
        ctx.next();
      });
    }
  });

  const CONDO_ITEMS = {
    q1: 'Contribution and participation limits', q2: 'You fund it yourself', q3: 'All you get are statements', q4: 'No use or enjoyment while you work', q5: 'Locked away until retirement age', q6: 'Penalties for early access', q7: 'Required distributions begin at a set age',
    c1: 'Interest may be deductible, within IRS loan limits', c2: 'Referrals and new business', c3: 'Family pictures', c4: 'A lifetime of memories', c5: 'Keys: you can use it', c6: 'New opportunities', c7: 'A future family heritage'
  };
  /* line visibility: shown when step > n */
  const CONDO_Q = [['incRed', 0], ['qDef', 2], ['qIrr', 4], ['qSell', 6, 7], ['qDie', 10, 11]].concat([1, 2, 3, 4, 5, 6, 7].map((k) => ['q' + k, 12 + 2 * k]));
  const CONDO_C = [['taxDed', 1], ['cDef', 3], ['cIrr', 5], ['cSell', 8, 9], ['cDie', 12, 13]].concat([1, 2, 3, 4, 5, 6, 7].map((k) => ['c' + k, 13 + 2 * k]));
  EFA.screen('condo2', {
    title: '401(condo): 401(k) versus condo comparison',
    steps: 29,
    copy: Object.assign({
      tQ: '401(k)', tC: '401(condo)',
      incRed: 'Income Reduction', taxDed: 'Tax Deduction', def: 'Tax Deferred', irr: 'IRR', withCG: 'with CG Tax',
      sell: 'Sell:', die: 'Die:', ordInc: '100% Taxable Ordinary Income', capG: 'Taxed at Capital Gain', stepUp: 'Cost basis generally steps up at death',
      reset: 'Reset', docs: 'Documentation', ret: 'Return',
      q1T: 'What return would the 401(k) need to match the condo’s IRR after capital-gains tax?',
      q3T: 'If the condo only grew to the 401(k)’s after-tax value, what would its IRR be after capital-gains tax?',
      q2T: 'What return would the 401(k) need to match the condo’s tax-free IRR at death?',
      q4T: 'If the condo only grew to the 401(k)’s after-tax value, what would its tax-free IRR be at death?',
      ask: '???', noAns: 'No solution found',
      sumSale: 'Comparing a Sale of the Two', sumDeath: 'Comparing the Two at Death',
      sFV: 'Final Values Before Tax', sIOL: 'Balance of IOL', sOrd: 'Ordinary Tax', sCG: 'Capital Gain Tax', sAT: 'After Tax Proceeds', sIRR: 'IRR%',
      chooseT: 'Please choose..', ch1: 'Condo interest-only loan schedule', ch2: '401(k) growth with tax at the end', ch3: 'Cash flows', ch4: 'Summary of a sale', ch5: 'Summary at death',
      editA: 'Edit', editB: 'Item Description', cancel: 'Cancel', save: 'Save',
      ws1: 'Condo Interest-Only Loan', ws2: '401(k) Growth With Ordinary Tax at the End', ws3: 'Cash Flows',
      wMonth: 'Month', wYear: 'Year', wP: 'Payment Before Tax', wS: 'Monthly Income Tax', wCum: 'Cumulative Income Tax', wC: 'Payment After Tax', wL: 'Monthly Tax Advantage', wCF: 'Condo Cash Flow With CG Tax',
      wBom: 'Beginning of Month', wInt: 'Interest', wContrib: 'Contribution', wEom: 'End of Month', wTax: 'Ordinary Tax Due', wAT: 'Balance After Tax', wQ: '401(k) Cash Flow',
      wCG: 'Condo Flows With CG Tax', wTF: 'Condo Flows Tax-Free', wQ2: '401(k) Flows With Ordinary Tax',
      aRate: 'Interest rate', aPay: 'Monthly payment before tax', aTax: 'Ordinary tax bracket', aCG: 'Capital gain tax bracket', aYears: 'Years',
      dA: 'Hypothetical illustration using', dB: 'a year,', dC: 'a month, a', dD: 'ordinary and', dE: 'capital-gain tax bracket over', dF: 'years. It assumes the condo grows to exactly the 401(k)’s value and ignores property taxes, insurance, upkeep, vacancy, depreciation recapture and selling costs. Tax treatment is described generally under current tax law, subject to applicable requirements. Not a projection of any specific product; actual results will vary.',
      _notes: 'Two columns, built one line at a time: the 401(k) on the left, the condo on the right.\n\n- Click either IRR to reveal it. The gold dots beside Sell and Die open the questions.\n- Ask: Which would you rather own in thirty years: a statement, or the keys?\nPAUSE\n\n- Documentation shows the month-by-month numbers and the two summaries.'
    }, CONDO_ITEMS),
    render(ctx) {
      const E = ctx._e = condoEngine(condoInputs());
      const V = ctx._v = { view: 'main', irrQ: false, irrC: false, ans: {} };
      const itemHTML = (k) => { const own = ctx.mem('item.' + k, null); return own != null ? `<span>${esc(own)}</span>` : ctx.t(k); };
      const titleHTML = (side) => { const own = ctx.mem('title.' + side, null); return own != null ? esc(own) : ctx.t(side === 'q' ? 'tQ' : 'tC'); };
      const line = (key, html, cls) => `<div class="b01-cl2 ${cls || ''}" data-ln="${key}">${html}</div>`;
      const qLines = [
        line('incRed', ctx.t('incRed'), 'fx'), line('qDef', ctx.t('def'), 'fx'),
        line('qIrr', `<span class="irr" data-irr="q">${ctx.t('irr')}</span><span class="val num b01-hide" data-irrv="q">${pct2(E.qpIRR)}</span>`, 'fx'),
        line('qSell', `${ctx.t('sell')} <span class="ans" data-a="qSell">${ctx.t('ordInc')}</span>`, 'fx'),
        line('qDie', `${ctx.t('die')} <span class="ans" data-a="qDie">${ctx.t('ordInc')}</span>`, 'fx')
      ].concat([1, 2, 3, 4, 5, 6, 7].map((k) => line('q' + k, itemHTML('q' + k), 'item" data-item="q' + k)));
      const cLines = [
        line('taxDed', ctx.t('taxDed'), 'fx'), line('cDef', ctx.t('def'), 'fx'),
        line('cIrr', `<span class="irr" data-irr="c">${ctx.t('irr')}</span><span class="val b01-hide" data-irrv="c"><span class="num">${pct2(E.cgIRR)}</span> ${ctx.t('withCG')}</span>`, 'fx'),
        line('cSell', `${ctx.t('sell')} <span class="ans" data-a="cSell">${ctx.t('capG')}</span><span class="b01-dot" data-dot="sale"></span>`, 'fx'),
        line('cDie', `${ctx.t('die')} <span class="ans" data-a="cDie">${ctx.t('stepUp')}</span><span class="b01-dot" data-dot="death"></span>`, 'fx')
      ].concat([1, 2, 3, 4, 5, 6, 7].map((k) => line('c' + k, itemHTML('c' + k), 'item" data-item="c' + k)));
      const disc = `${ctx.t('dA')} <span class="num">${pct2(E.r)}</span> ${ctx.t('dB')} <span class="num">${money(E.P)}</span> ${ctx.t('dC')} <span class="num">${pct2(E.t)}</span> ${ctx.t('dD')} <span class="num">${pct2(E.g)}</span> ${ctx.t('dE')} <span class="num">${E.Y}</span> ${ctx.t('dF')}`;
      const qBlock = (qk, ak, top) => `<div class="b01-q" style="top:${top}px"><p>${ctx.t(qk)}</p><button type="button" class="st-pill b01-qbtn" data-ask="${ak}">${ctx.t('ask')}</button><span class="b01-qval num b01-hide" data-ansv="${ak}"></span></div>`;
      ctx.el.innerHTML = `
        <div data-view="main">
          <div class="b01-ctitle" data-title="q" style="left:110px"><span class="t">${titleHTML('q')}</span></div>
          <div class="b01-ctitle" data-title="c" style="left:820px"><span class="t">${titleHTML('c')}</span></div>
          <div class="b01-cpanel b01-f" data-pan="1" style="left:110px">${qLines.join('')}</div>
          <div class="b01-cpanel b01-f" data-pan="1" style="left:820px">${cLines.join('')}</div>
        </div>
        <div data-view="sale" class="b01-hide"><div class="b01-head"><h1 class="st-h1" style="font-size:52px">${titleHTML('q')} <span style="color:#8a6e22">/</span> ${titleHTML('c')}</h1></div>${qBlock('q1T', 'a1', 190)}${qBlock('q3T', 'a3', 470)}</div>
        <div data-view="death" class="b01-hide"><div class="b01-head"><h1 class="st-h1" style="font-size:52px">${titleHTML('q')} <span style="color:#8a6e22">/</span> ${titleHTML('c')}</h1></div>${qBlock('q2T', 'a2', 190)}${qBlock('q4T', 'a4', 470)}</div>
        <div data-view="sum" class="b01-hide"><div class="b01-head"><h1 class="st-h1" data-sumh="1" style="font-size:54px"></h1><hr class="st-rule"></div><div class="b01-sum" data-sumt="1"></div></div>
        <div class="b01-abar b01-f" data-abar="1">
          <button type="button" class="b01-link" data-act="reset">${ctx.t('reset')}</button>
          <button type="button" class="b01-link" data-act="docs">${ctx.t('docs')}</button>
          <button type="button" class="b01-link b01-hide" data-act="ret">${ctx.t('ret')}</button>
        </div>
        <p class="st-disclaimer b01-disc" style="margin:0;font-size:13px">${disc}</p>`;
      const setView = (v) => {
        V.view = v;
        ctx.$$('[data-view]').forEach((n) => n.classList.toggle('b01-hide', n.dataset.view !== (v === 'sumSale' || v === 'sumDeath' ? 'sum' : v)));
        ctx.$('[data-act="reset"]').classList.toggle('b01-hide', v !== 'main');
        ctx.$('[data-act="docs"]').classList.toggle('b01-hide', v !== 'main');
        ctx.$('[data-act="ret"]').classList.toggle('b01-hide', v === 'main');
        ctx.show('[data-abar]', v !== 'main' || ctx.step >= 5);
        if (v === 'sumSale' || v === 'sumDeath') drawSummary(v === 'sumSale');
        if (v === 'main') V.ans = {};
        ctx.$$('[data-ansv]').forEach((n) => n.classList.toggle('b01-hide', !V.ans[n.dataset.ansv]));
        ctx.$$('[data-ask]').forEach((n) => n.classList.toggle('b01-hide', !!V.ans[n.dataset.ask]));
        arm(ctx);
      };
      const drawSummary = (sale) => {
        ctx.$('[data-sumh]').innerHTML = ctx.t(sale ? 'sumSale' : 'sumDeath');
        const rows = [
          ['sFV', E.FV, E.FV, 'pos', 'pos'], ['sIOL', 0, E.B, 'neg', 'neg'], ['sOrd', E.T, 0, 'neg', 'neg'],
          ['sCG', 0, sale ? E.CG : 0, 'neg', 'neg'], ['sAT', E.AT, sale ? E.S : E.D, 'pos', 'pos', true]
        ];
        ctx.$('[data-sumt]').innerHTML = `<table class="st-table b01-sumt"><thead><tr><th style="width:50%"></th><th>${titleHTML('q')}</th><th>${titleHTML('c')}</th></tr></thead><tbody>
          ${rows.map(([k, a, b, ca, cb, hl]) => `<tr class="${hl ? 'hl' : ''}"><td>${ctx.t(k)}</td><td class="num ${ca}">${money(a)}</td><td class="num ${cb}">${money(b)}</td></tr>`).join('')}
          <tr><td>${ctx.t('sIRR')}</td><td class="num">${pct2(E.qpIRR)}</td><td class="num">${pct2(sale ? E.cgIRR : E.tfIRR)}</td></tr></tbody></table>`;
        arm(ctx);
      };
      const sheet = (k) => {
        const head = { 1: 'ws1', 2: 'ws2', 3: 'ws3' }[k];
        const assumptions = [{ label: ctx.t('aPay'), value: money(E.P) }, { label: ctx.t('aRate'), value: pct2(E.r) }, { label: ctx.t('aTax'), value: pct2(E.t) }, { label: ctx.t('aCG'), value: pct2(E.g) }, { label: ctx.t('aYears'), value: String(E.Y) }];
        const yr = (m) => Math.ceil(m / 12);
        let columns, rows;
        if (k === 1) {
          let cum = 0;
          columns = [{ field: 'm', header: ctx.t('wMonth'), type: 'int' }, { field: 'P', header: ctx.t('wP'), type: 'money', dp: 2 }, { field: 's', header: ctx.t('wS'), type: 'money', dp: 2 }, { field: 'cum', header: ctx.t('wCum'), type: 'money', dp: 2 }, { field: 'c', header: ctx.t('wC'), type: 'money', dp: 2 }, { field: 'l', header: ctx.t('wL'), type: 'money', dp: 2 }, { field: 'cf', header: ctx.t('wCF'), type: 'money', dp: 2 }, { field: 'y', header: ctx.t('wYear'), type: 'year' }];
          rows = E.CFsale.map((cf, j) => { cum += E.s; return { m: j + 1, P: E.P, s: E.s, cum, c: E.c, l: E.l, cf, y: yr(j + 1) }; });
        } else if (k === 2) {
          columns = [{ field: 'm', header: ctx.t('wMonth'), type: 'int' }, { field: 'bom', header: ctx.t('wBom'), type: 'money', dp: 2 }, { field: 'int', header: ctx.t('wInt'), type: 'money', dp: 2 }, { field: 'p', header: ctx.t('wContrib'), type: 'money', dp: 2 }, { field: 'eom', header: ctx.t('wEom'), type: 'money', dp: 2 }, { field: 'tax', header: ctx.t('wTax'), type: 'money', dp: 2 }, { field: 'at', header: ctx.t('wAT'), type: 'money', dp: 2 }, { field: 'cf', header: ctx.t('wQ'), type: 'money', dp: 2 }, { field: 'y', header: ctx.t('wYear'), type: 'year' }];
          rows = E.q.map((r, j) => { const last = j === E.N - 1; return { m: r.m, bom: r.bom, int: r.int, p: E.P, eom: r.eom, tax: last ? E.T : 0, at: last ? E.AT : r.eom, cf: E.CFq[j], y: yr(r.m) }; });
        } else {
          columns = [{ field: 'm', header: ctx.t('wMonth'), type: 'int' }, { field: 'cg', header: ctx.t('wCG'), type: 'money', dp: 2 }, { field: 'tf', header: ctx.t('wTF'), type: 'money', dp: 2 }, { field: 'q', header: ctx.t('wQ2'), type: 'money', dp: 2 }, { field: 'y', header: ctx.t('wYear'), type: 'year' }];
          rows = E.CFsale.map((cg, j) => ({ m: j + 1, cg, tf: E.CFdeath[j], q: E.CFq[j], y: yr(j + 1) }));
        }
        return { heading: ctx.t(head), size: 'full', columns, rows, assumptions, filter: 'y' };
      };
      const editDialog = (key, isTitle) => {
        const cur = isTitle ? (ctx.mem('title.' + key, null) ?? ctx.text(key === 'q' ? 'tQ' : 'tC')) : (ctx.mem('item.' + key, null) ?? ctx.text(key));
        const col = isTitle ? cur : (key[0] === 'q' ? (ctx.mem('title.q', null) ?? ctx.text('tQ')) : (ctx.mem('title.c', null) ?? ctx.text('tC')));
        const ov = ctx.overlay({ title: `${ctx.t('editA')} <span>${esc(col)}</span> ${ctx.t('editB')}`, cls: 'b01-ov-sm', html: `<div class="b01-form" style="grid-template-columns:1fr"><input type="text" data-ed="1" value="${esc(cur)}" autocomplete="off"></div><div class="b01-dlg-f"><button type="button" class="st-pill b01-ghost" data-x="1">${ctx.t('cancel')}</button><button type="button" class="st-pill" data-ok="1">${ctx.t('save')}</button></div>` });
        const inp = ov.querySelector('[data-ed]'); inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') ov.querySelector('[data-ok]').click(); });
        setTimeout(() => { inp.focus(); inp.select(); }, 50);
        ctx.on(ov.querySelector('[data-x]'), 'click', () => ov.close());
        ctx.on(ov.querySelector('[data-ok]'), 'click', () => {
          const v = inp.value.trim(); ctx.remember((isTitle ? 'title.' : 'item.') + key, v || null); ov.close();
          const st = ctx.step; EFA.player.renderScreen({ noFade: true }); if (EFA.player.step !== st) EFA.player.goStep(st);
        });
      };
      // events
      ctx.on(ctx.$$('[data-title]'), 'click', (e, n) => editDialog(n.dataset.title, true));
      ctx.on(ctx.$$('[data-item]'), 'click', (e, n) => editDialog(n.dataset.item, false));
      ctx.on(ctx.$$('[data-irr]'), 'click', (e, n) => { ctx.$(`[data-irrv="${n.dataset.irr}"]`).classList.remove('b01-hide'); });
      ctx.on(ctx.$$('[data-dot]'), 'click', (e, n) => setView(n.dataset.dot));
      ctx.on(ctx.$$('[data-ask]'), 'click', (e, n) => {
        const k = n.dataset.ask, v = E[k];
        const out = ctx.$(`[data-ansv="${k}"]`);
        out.innerHTML = v == null ? ctx.t('noAns') : pct2(v);
        V.ans[k] = true; n.classList.add('b01-hide'); out.classList.remove('b01-hide'); arm(ctx);
      });
      ctx.on(ctx.$('[data-act="reset"]'), 'click', () => ctx.goStep(0));
      ctx.on(ctx.$('[data-act="ret"]'), 'click', () => setView('main'));
      ctx.on(ctx.$('[data-act="docs"]'), 'click', () => {
        const ov = ctx.overlay({ title: ctx.t('chooseT'), cls: 'b01-ov-xs', html: `<div class="b01-choose">${[1, 2, 3, 4, 5].map((k) => `<button type="button" class="st-pill" data-ch="${k}">${ctx.t('ch' + k)}</button>`).join('')}</div>` });
        ctx.on(Array.from(ov.querySelectorAll('[data-ch]')), 'click', (e, b) => {
          const k = +b.dataset.ch; ov.close();
          if (k <= 3) { if (EFA.lib.worksheet) EFA.lib.worksheet.open(ctx, sheet(k)); }
          else setView(k === 4 ? 'sumSale' : 'sumDeath');
        });
      });
      ctx._setView = setView;
    },
    step(ctx, n) {
      ctx.show('[data-pan]', n >= 1);
      [CONDO_Q, CONDO_C].forEach((L) => L.forEach(([k, at, ans]) => {
        const el = ctx.$(`[data-ln="${k}"]`); if (!el) return;
        el.classList.toggle('hide', !(n > at));
        if (ans != null) { const a = el.querySelector('.ans'); if (a) a.style.visibility = n > ans ? 'visible' : 'hidden'; const d = el.querySelector('.b01-dot'); if (d) d.style.visibility = n > ans ? 'visible' : 'hidden'; }
      }));
      if (ctx._v.view !== 'main') ctx._setView('main');
      ctx.show('[data-abar]', n >= 5);
    }
  });

  /* ==================== avse1, autoIns1, aa1: three calculators ==================== */
  EFA.css('b01-calc3', `
  .b01-cx-panel { position: absolute; box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 18px; box-shadow: 0 16px 36px rgba(13,30,58,.08); }
  .b01-cx-row { display: grid; grid-template-columns: 1fr 230px; align-items: center; gap: 18px; padding: 7px 0; border-bottom: 1px solid rgba(13,30,58,.10); min-height: 46px; }
  .b01-cx-row:last-child { border-bottom: 0; }
  .b01-cx-row .lb { font: 600 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; display: inline-flex; align-items: center; gap: 12px; }
  .stage .b01-cx-row .st-field { gap: 0; }
  .stage .b01-cx-row .st-input, .stage .b01-ai .st-input, .stage .b01-aa .st-input { height: 44px; font-size: 20px; text-align: right; }
  .b01-cx-res { font: 600 23px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-cx-res p { margin: 0 0 10px; }
  .b01-cx-res b, .b01-cx-res .v { color: #8a6e22; font-weight: 700; }
  .b01-cx-res .note { font: 500 17px/1.4 "DM Sans", sans-serif; color: #667389; }
  .b01-cx-acts { position: absolute; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 34px; }
  .b01-cx-link { background: none; border: 0; padding: 0; font: 600 19px/1.2 "DM Sans", sans-serif; color: #8a6e22; border-bottom: 1.5px dotted currentColor; cursor: pointer; }
  .b01-cx-link:hover { color: #0d1e3a; }
  .b01-cx-mode { min-width: 220px; }
  .b01-av-yr { display: grid; grid-template-columns: 1fr auto; gap: 26px; align-items: center; margin-top: 12px; }
  .b01-av-yr input[type=range] { width: 100%; accent-color: #b8972e; height: 28px; }
  .b01-av-chart { position: absolute; left: 110px; top: 150px; width: 1380px; height: 600px; }
  .b01-av-chart svg { display: block; cursor: pointer; }
  .b01-av-leg { position: absolute; left: 150px; top: 24px; display: flex; gap: 26px; padding: 10px 18px; background: rgba(255,253,248,.94); border: 1px solid #d6cfc4; border-radius: 12px; font: 600 18px/1 "DM Sans", sans-serif; color: #0d1e3a; transition: opacity .3s ease; }
  .b01-av-leg span { display: inline-flex; align-items: center; gap: 10px; }
  .b01-av-tip { position: absolute; pointer-events: none; padding: 8px 12px; background: #0d1e3a; color: #f7f5f1; border-radius: 8px; font: 600 16px/1.2 "DM Sans", sans-serif; white-space: nowrap; transform: translate(-50%, -130%); opacity: 0; transition: opacity .15s ease; }
  .b01-av-tip.on { opacity: 1; }
  .b01-ch-list { display: grid; gap: 14px; padding: 6px 4px; }
  .b01-ch-list button { text-align: left; font-size: 21px; }
  .b01-ai-tabs { position: absolute; left: 160px; width: 1280px; top: 150px; display: flex; justify-content: space-between; }
  .b01-ai-tab { width: 280px; text-align: center; padding: 12px 0 10px; border-radius: 14px 14px 0 0; background: #0d1e3a; color: #f7f5f1; font: 700 18px/1 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; }
  .b01-ai-tab.alt { background: #b8972e; color: #0d1e3a; }
  .b01-ai-row { display: grid; grid-template-columns: 280px 1fr 280px; align-items: center; gap: 18px; padding: 6px 28px; border-bottom: 1px solid rgba(13,30,58,.10); }
  .b01-ai-row .c { text-align: center; font: 700 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-ai-row .st-field { gap: 0; }
  .b01-ai-row.pct { background: #f0e6c4; border-radius: 0 0 18px 18px; border-bottom: 0; padding: 10px 28px; }
  .b01-ai-pv { text-align: right; font: 700 26px/44px "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-ai-mirror { height: 44px; box-sizing: border-box; border: 1.5px dashed #cbd5e3; border-radius: 10px; padding: 0 14px; font: 600 20px/41px "DM Sans", sans-serif; color: #0d1e3a; text-align: right; background: rgba(255,255,255,.6); }
  .b01-ai-age { position: absolute; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 12px; font: 600 22px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b01-ai-age .st-field { gap: 0; width: 86px; }
  .b01-ai-res { overflow: auto; padding: 18px 30px; }
  .b01-ck ol { margin: 6px 0 18px; padding-left: 30px; font: 500 21px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-ck ol li { margin: 6px 0; }
  .b01-ck h3 { margin: 0 0 6px; font: 600 28px/1.1 "Cormorant Garamond", Georgia, serif; color: #8a6e22; }
  .b01-aa-h { position: absolute; left: 0; right: 0; top: 40px; text-align: center; cursor: pointer; }
  .b01-aa-h:hover .st-h1 { color: #8a6e22; }
  .b01-aa-init { position: absolute; left: 672px; width: 768px; top: 150px; height: 70px; display: flex; align-items: center; justify-content: space-between; padding: 0 26px; }
  .b01-aa-init .lb { font: 700 21px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-aa-init .st-field { width: 240px; gap: 0; }
  .b01-aa-grid { position: absolute; left: 160px; width: 1280px; top: 240px; height: 400px; overflow: hidden; display: grid; grid-template-rows: auto 1fr auto; }
  .b01-aa-scroll { overflow: auto; }
  .b01-aa-grid table { width: 100%; }
  .stage .b01-aa-grid .st-table td { padding: 5px 12px; vertical-align: middle; }
  .stage .b01-aa-grid .st-table th { position: sticky; top: 0; z-index: 1; }
  .b01-aa-grid td.yr, .b01-aa-grid th.yr { text-align: center !important; width: 90px; }
  .b01-aa-grid td.ret { width: 230px; }
  .b01-aa-grid td.del, .b01-aa-grid th.del { width: 60px; text-align: center !important; }
  .b01-aa-grid td.neg { color: #a23b2a; }
  .b01-aa-del { width: 36px; height: 36px; border: 0; border-radius: 999px; background: transparent; color: #667389; cursor: pointer; display: inline-grid; place-items: center; }
  .b01-aa-del:hover { background: #f0e6c4; color: #0d1e3a; }
  .b01-aa-foot { padding: 10px 16px; border-top: 1px solid #d6cfc4; background: #f7f5f1; }
  .b01-aa-res { position: absolute; left: 160px; width: 1280px; top: 660px; height: 76px; display: grid; grid-template-columns: 30% 20% 30% 20%; align-items: center; padding: 0 30px; font: 700 23px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b01-aa-res .v { font-size: 28px; color: #8a6e22; }
  .b01-aa-res .sw { cursor: pointer; border-bottom: 1.5px dotted #b8972e; justify-self: start; }
  .b01-aa-conf p { font: 500 22px/1.4 "DM Sans", sans-serif; color: #0d1e3a; margin: 0 0 22px; }
  .b01-aa-conf .row { display: flex; gap: 16px; justify-content: flex-end; }
  `);
  const wsOpen = (ctx, data) => { if (EFA.lib && EFA.lib.worksheet) EFA.lib.worksheet.open(ctx, data); };
  const discLine = (topics, style) => (EFA.lib && EFA.lib.disclosure ? EFA.lib.disclosure.line(topics, { cls: 'b01-disc', style: 'margin:0;' + (style || '') }) : '');
  const m0 = (v) => F.money(v);

  /* ---------- avse1: appreciation versus equity ---------- */
  /** the AVSE engine: 30 years of equity buying power and house market value */
  function avseEngine(o) {
    const E = o.marketValue - o.loanBalance, i = o.inflation, a = o.appreciation, rows = [];
    let bp = E, mv = o.marketValue, mvi = o.marketValue;
    for (let y = 1; y <= 30; y++) {
      const bpEnd = bp / (1 + i), mvEnd = mv + mv * a, mviEnd = mvi + mvi * (a - i);
      rows.push({ year: y, bpStart: bp, bpLoss: bp - bpEnd, bpEnd, mvStart: mv, mvGain: mv * a, mvEnd, mviStart: mvi, mviGain: mvi * (a - i), mviEnd });
      bp = bpEnd; mv = mvEnd; mvi = mviEnd;
    }
    return { E, rows, BP: rows[29].bpEnd, MV: rows[29].mvEnd, MVi: rows[29].mviEnd };
  }
  EFA.engines.avse = avseEngine;
  const AVS = { shown: false, yby: false, year: 0, graph: false, today: false, legend: true };
  EFA.screen('avse1', {
    title: 'Appreciation versus equity',
    copy: {
      head: 'Your Home Grows on Its Value, Not Your Equity',
      lMV: 'Current Market Value', lLoan: 'Outstanding Loan Balance', lAppr: 'Appreciation Rate', lInfl: 'Inflation Rate', lMode: 'Show Appreciation In',
      mNom: 'Nominal Dollars', mToday: 'Today’s Dollars',
      calc: 'Calculate', yby: 'Year by Year', orig: 'Original Results', docs: 'Documentation', graph: 'Graph',
      r1: 'Your home equity today is', r2a: 'In', r2b: 'years, that same equity will only buy what', r2c: 'buys today.',
      r3a: 'By contrast, in', r3b: 'years your home’s market value', r3t: 'in today’s dollars', r3c: 'is projected to be',
      r4: 'Notice: changing the loan balance changes your equity, but not the projected market value of the house.',
      yA: 'In', yB: 'year(s), today’s equity will have the buying power of', yC: 'and the projected market value in', yToday: 'today’s', yNom: 'nominal', yD: 'dollars will be',
      y0a: 'Today your equity is', y0b: 'and the market value is',
      autoOn: 'AutoStep - On', autoOff: 'AutoStep - Off',
      gHead: 'Equity Buying Power vs. House Market Value', gNoteNom: 'House market value is shown in nominal dollars.', gNoteToday: 'House market value is shown in today’s dollars.',
      sMV: 'House Market Value', sBP: 'Equity Buying Power', ret: 'Return', yearAx: 'Year',
      chT: 'Please choose..', ch1: 'Equity Buying Power', ch2: 'House Market Value',
      wsBP: 'Projected Buying Power of Current Equity', wsMVn: 'Projected House Market Value (Nominal Dollars)', wsMVt: 'Projected House Market Value (Today’s Dollars)',
      wYear: 'Year', wBpS: 'Buying Power at Start of Year', wBpL: 'Loss to Inflation', wBpE: 'Buying Power at End of Year', wMvS: 'Value at Start of Year', wMvG: 'Annual Appreciation', wMvE: 'Value at End of Year',
      disc: 'Hypothetical illustration. Appreciation and inflation rates are assumptions; home values can fall as well as rise. Not a projection of any specific property.',
      _notes: 'Equity sitting in a house earns nothing on its own: the house appreciates on its full value whether the loan is large or small, while inflation quietly shrinks what the equity can buy.\n\n- Change the loan balance and watch the market value stay put.\n- Ask: If the house grows the same either way, what is that idle equity doing for you?\nPAUSE'
    },
    render(ctx) {
      const v0 = () => ({ marketValue: caseGet('houseValue'), loanBalance: caseGet('houseLoan'), appreciation: caseGet('houseAppr'), inflation: caseGet('inflation') });
      const row = (lb, f, extra) => `<div class="b01-cx-row"><span class="lb">${ctx.t(lb)}${extra || ''}</span>${f}</div>`;
      const infl = EFA.lib && EFA.lib.inflation ? EFA.lib.inflation.link(ctx, { field: 'avInfl' }) : '';
      if (AVS.graph) { renderGraph(); return; }
      ctx.el.innerHTML = `
        <div class="b01-head" style="top:36px">${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:52px"' })}<hr class="st-rule"></div>
        <div class="b01-cx-panel" style="left:420px;width:760px;top:150px;padding:8px 34px">
          ${row('lMV', caseField(ctx, { id: 'avMV', type: 'money', value: 150000, min: 0 }, 'houseValue'))}
          ${row('lLoan', caseField(ctx, { id: 'avLoan', type: 'money', value: 100000, min: 0 }, 'houseLoan'))}
          ${row('lAppr', caseField(ctx, { id: 'avAppr', type: 'pct', value: 0.03, dp: 2 }, 'houseAppr'))}
          ${row('lInfl', caseField(ctx, { id: 'avInfl', type: 'pct', value: 0.03, dp: 2 }, 'inflation'), infl)}
          ${row('lMode', `<button type="button" class="st-pill b01-cx-mode" data-mode>${ctx.t(AVS.today ? 'mToday' : 'mNom')}</button>`)}
        </div>
        <button type="button" class="st-pill b01-f ${AVS.shown ? 'is-off' : ''}" data-calc style="position:absolute;left:50%;transform:translateX(-50%);top:530px;min-width:220px;min-height:54px;font-size:20px">${ctx.t('calc')}</button>
        <div class="b01-cx-panel b01-cx-res b01-f ${AVS.shown ? '' : 'is-off'}" data-res style="left:160px;width:1280px;top:500px;height:226px;padding:22px 36px"></div>
        <div class="b01-cx-acts b01-f ${AVS.shown ? '' : 'is-off'}" data-acts style="top:744px">
          <button type="button" class="st-pill b01-cx-mode" data-yby>${ctx.t(AVS.yby ? 'orig' : 'yby')}</button>
          <button type="button" class="b01-cx-link" data-docs>${ctx.t('docs')}</button>
          <button type="button" class="b01-cx-link" data-graph>${ctx.t('graph')}</button>
        </div>
        ${discLine(['hypothetical'], 'right:330px')}`;
      const vals = () => { const v = ctx.values(); return { marketValue: num(v.avMV, 150000), loanBalance: num(v.avLoan, 100000), appreciation: num(v.avAppr, 0.03), inflation: num(v.avInfl, 0.03) }; };
      const draw = () => {
        const R = avseEngine(vals()), box = ctx.$('[data-res]');
        const mvFinal = AVS.today ? R.MVi : R.MV;
        if (!AVS.yby) {
          box.innerHTML = `<p>${ctx.t('r1')} <span class="v num">${m0(R.E)}</span>.</p>
            <p>${ctx.t('r2a')} <span class="num">30</span> ${ctx.t('r2b')} <span class="v num">${m0(R.BP)}</span> ${ctx.t('r2c')}</p>
            <p>${ctx.t('r3a')} <span class="num">30</span> ${ctx.t('r3b')}${AVS.today ? ' ' + ctx.t('r3t') : ''} ${ctx.t('r3c')} <span class="v num">${m0(mvFinal)}</span>.</p>
            ${ctx.t('r4', { tag: 'p', cls: 'note' })}`;
        } else {
          const y = AVS.year, r = R.rows[y - 1];
          const sent = y === 0
            ? `${ctx.t('y0a')} <span class="v num">${m0(R.E)}</span> ${ctx.t('y0b')} <span class="v num">${m0(vals().marketValue)}</span>.`
            : `${ctx.t('yA')} <span class="num">${y}</span> ${ctx.t('yB')} <span class="v num">${m0(r.bpEnd)}</span> ${ctx.t('yC')} ${ctx.t(AVS.today ? 'yToday' : 'yNom')} ${ctx.t('yD')} <span class="v num">${m0(AVS.today ? r.mviEnd : r.mvEnd)}</span>.`;
          box.innerHTML = `<p style="min-height:104px">${sent}</p>
            <div class="b01-av-yr"><input type="range" min="0" max="30" step="1" value="${y}" data-yr aria-label="Year"><button type="button" class="st-pill b01-cx-mode" data-auto>${ctx.t(ctx._auto ? 'autoOff' : 'autoOn')}</button></div>`;
          ctx.on(box.querySelector('[data-yr]'), 'input', (e, el) => { AVS.year = +el.value; stopAuto(); draw(); });
          ctx.on(box.querySelector('[data-auto]'), 'click', () => { if (ctx._auto) stopAuto(); else startAuto(); draw(); });
        }
        EFA.numify(box);
      };
      const stopAuto = () => { if (ctx._auto) { clearInterval(ctx._auto); ctx._auto = null; } };
      const startAuto = () => {
        if (AVS.year >= 30) AVS.year = 0;
        ctx._auto = setInterval(() => { if (!ctx.el.isConnected) return stopAuto(); AVS.year = Math.min(30, AVS.year + 1); if (AVS.year >= 30) stopAuto(); draw(); }, 500);
      };
      ctx._stopAuto = stopAuto;
      draw();
      ctx.onFields(() => draw());
      ctx.on(ctx.$('[data-mode]'), 'click', (e, b) => { AVS.today = !AVS.today; b.innerHTML = ''; b.insertAdjacentHTML('beforeend', ctx.t(AVS.today ? 'mToday' : 'mNom')); draw(); });
      ctx.on(ctx.$('[data-calc]'), 'click', () => { AVS.shown = true; ctx.show('[data-calc]', false); ctx.show('[data-res]', true); ctx.show('[data-acts]', true); draw(); });
      ctx.on(ctx.$('[data-yby]'), 'click', (e, b) => { AVS.yby = !AVS.yby; stopAuto(); b.innerHTML = ctx.t(AVS.yby ? 'orig' : 'yby'); draw(); });
      ctx.on(ctx.$('[data-graph]'), 'click', () => { stopAuto(); AVS.graph = true; renderGraph(); });
      ctx.on(ctx.$('[data-docs]'), 'click', () => {
        const ov = ctx.overlay({ title: ctx.t('chT'), html: `<div class="b01-ch-list"><button type="button" class="b01-cx-link" data-w="bp">${ctx.t('ch1')}</button><button type="button" class="b01-cx-link" data-w="mv">${ctx.t('ch2')}</button></div>`, cls: 'b01-ov-md' });
        ov.querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => { ov.close(); wsOpen(ctx, sheet(b.dataset.w)); }));
      });
      function sheet(k) {
        const R = avseEngine(vals()), t = AVS.today;
        const m = (f, h) => ({ field: f, header: ctx.t(h), type: 'money', dp: 2 });
        const ass = [{ label: ctx.t('lMV'), value: m0(vals().marketValue) }, { label: ctx.t('lLoan'), value: m0(vals().loanBalance) }, { label: ctx.t('lAppr'), value: F.pct(vals().appreciation, 2) }, { label: ctx.t('lInfl'), value: F.pct(vals().inflation, 2) }];
        if (k === 'bp') return { heading: ctx.t('wsBP'), size: 'medium', columns: [{ field: 'year', header: ctx.t('wYear'), type: 'year' }, m('bpStart', 'wBpS'), m('bpLoss', 'wBpL'), m('bpEnd', 'wBpE')], rows: R.rows, assumptions: ass, highlight: 'bpEnd', disclosures: ['hypothetical', 'license'] };
        return { heading: ctx.t(t ? 'wsMVt' : 'wsMVn'), size: 'medium', columns: [{ field: 'year', header: ctx.t('wYear'), type: 'year' }, m(t ? 'mviStart' : 'mvStart', 'wMvS'), m(t ? 'mviGain' : 'mvGain', 'wMvG'), m(t ? 'mviEnd' : 'mvEnd', 'wMvE')], rows: R.rows, assumptions: ass, highlight: t ? 'mviEnd' : 'mvEnd', disclosures: ['hypothetical', 'license'] };
      }
      function renderGraph() {
        const vv = (() => { const v = ctx.values(); return { marketValue: num(v.avMV, caseGet('houseValue')), loanBalance: num(v.avLoan, caseGet('houseLoan')), appreciation: num(v.avAppr, caseGet('houseAppr')), inflation: num(v.avInfl, caseGet('inflation')) }; })();
        const R = avseEngine(vv);
        const mv = R.rows.map((r) => (AVS.today ? r.mviEnd : r.mvEnd)), bp = R.rows.map((r) => r.bpEnd);
        const W = 1380, H = 600, pl = 120, pr = 40, pt = 30, pb = 70;
        const max = Math.max(...mv, ...bp, 1), min = Math.min(0, ...mv, ...bp);
        const step = Math.pow(10, Math.floor(Math.log10(max))) / 2, top = Math.ceil(max * 1.12 / step) * step;
        const X = (i) => pl + (i * (W - pl - pr)) / 29, Y = (v) => pt + (H - pt - pb) * (1 - (v - min) / (top - min));
        const spline = (vals) => vals.map((v, i) => {
          if (!i) return `M${X(0)},${Y(v)}`;
          const p0 = vals[Math.max(0, i - 2)], p1 = vals[i - 1], p2 = v, p3 = vals[Math.min(vals.length - 1, i + 1)];
          const c1x = X(i - 1) + (X(i) - X(Math.max(0, i - 2))) / 6, c1y = Y(p1) + (Y(p2) - Y(p0)) / 6;
          const c2x = X(i) - (X(Math.min(29, i + 1)) - X(i - 1)) / 6, c2y = Y(p2) - (Y(p3) - Y(p1)) / 6;
          return `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${X(i).toFixed(1)},${Y(v).toFixed(1)}`;
        }).join('');
        let g = '';
        for (let k = 0; k <= 5; k++) { const v = min + ((top - min) * k) / 5, y = Y(v); g += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="#d6cfc4"/><text x="${pl - 14}" y="${y + 6}" text-anchor="end" font-family="DM Sans" font-size="17" fill="#667389">${F.money(v, { compact: true })}</text>`; }
        [1, 5, 10, 15, 20, 25, 30].forEach((y) => { g += `<text x="${X(y - 1)}" y="${H - pb + 36}" text-anchor="middle" font-family="DM Sans" font-weight="700" font-size="22" fill="#0d1e3a">${y}</text>`; });
        g += `<path d="${spline(mv)}" fill="none" stroke="#0d1e3a" stroke-width="5" stroke-linecap="round"/><path d="${spline(bp)}" fill="none" stroke="#b8972e" stroke-width="5" stroke-linecap="round"/>`;
        mv.forEach((v, i) => { g += `<circle cx="${X(i)}" cy="${Y(v)}" r="6" fill="#0d1e3a" stroke="#fffdf8" stroke-width="2" data-pt="mv|${i}"/>`; });
        bp.forEach((v, i) => { const x = X(i), y = Y(v); g += `<path d="M${x},${y - 8}L${x + 7.5},${y + 5}L${x - 7.5},${y + 5}Z" fill="#b8972e" stroke="#fffdf8" stroke-width="1.5" data-pt="bp|${i}"/>`; });
        ctx.el.innerHTML = `
          <div class="b01-head" style="top:36px">${ctx.t('gHead', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:50px"' })}<hr class="st-rule"></div>
          <div class="b01-av-chart"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${g}</svg>
            <div class="b01-av-leg ${AVS.legend ? '' : 'is-off'}"><span><svg width="34" height="14"><line x1="2" x2="32" y1="7" y2="7" stroke="#0d1e3a" stroke-width="5"/><circle cx="17" cy="7" r="5" fill="#0d1e3a"/></svg>${ctx.t('sMV')}</span><span><svg width="34" height="14"><line x1="2" x2="32" y1="7" y2="7" stroke="#b8972e" stroke-width="5"/><path d="M17,1L23,12L11,12Z" fill="#b8972e"/></svg>${ctx.t('sBP')}</span></div>
            <div class="b01-av-tip"></div></div>
          ${ctx.t(AVS.today ? 'gNoteToday' : 'gNoteNom', { tag: 'p', cls: 'st-small', attrs: 'style="position:absolute;left:230px;top:768px;margin:0"' })}
          <button type="button" class="st-pill" data-ret style="position:absolute;left:50%;transform:translateX(-50%);top:762px;min-width:180px">${ctx.t('ret')}</button>
          ${discLine(['hypothetical'], 'right:330px')}`;
        const tip = ctx.$('.b01-av-tip');
        ctx.on(ctx.$$('[data-pt]'), 'mouseenter', (e, n) => {
          const [k, i] = n.dataset.pt.split('|'), v = (k === 'mv' ? mv : bp)[+i];
          tip.innerHTML = `${ctx.t(k === 'mv' ? 'sMV' : 'sBP')}: <span class="num">${m0(v)}</span>`;
          tip.style.left = X(+i) + 'px'; tip.style.top = Y(v) + 'px'; tip.classList.add('on');
        });
        ctx.on(ctx.$$('[data-pt]'), 'mouseleave', () => tip.classList.remove('on'));
        ctx.on(ctx.$('.b01-av-chart svg'), 'click', () => { AVS.legend = !AVS.legend; ctx.show('.b01-av-leg', AVS.legend); });
        ctx.on(ctx.$('[data-ret]'), 'click', () => { AVS.graph = false; EFA.player.renderScreen({ noFade: true }); });
      }
    },
    leave(ctx) { if (ctx._stopAuto) ctx._stopAuto(); AVS.graph = false; }
  });

  /* ---------- autoIns1: current versus alternative auto coverage ---------- */
  /** the AUTOINS engine */
  function autoInsEngine(o) {
    const d = o.premiumCurrent - o.premiumAlt, n = Math.max(0, Math.round(o.toAge - o.fromAge)), r = o.oppRate;
    const oc = r === 0 ? d * n : d * (1 + r) * (Math.pow(1 + r, n) - 1) / r;
    const rows = []; let end = 0;
    for (let k = 0; k < n; k++) { const start = end + d, int = start * r; end = start + int; rows.push({ age: o.fromAge + k, diff: d, start, int, end, year: k + 1 }); }
    const pc = (p) => (o.carValue > 0 ? Math.round(p / o.carValue * 10000) / 10000 : 0);
    return { d, n, r, oc, tc: n * o.premiumCurrent, ta: n * o.premiumAlt, pctCurrent: pc(o.premiumCurrent), pctAlt: pc(o.premiumAlt), rows };
  }
  EFA.engines.autoIns = autoInsEngine;
  const AIS = { shown: false, pc: false, pa: false };
  EFA.screen('autoIns1', {
    title: 'Auto insurance: current versus alternative',
    copy: {
      tCur: 'Current', tAlt: 'Alternative',
      lLim: 'Protection Limits', lCar: 'Car Value', lDed: 'Deductible', lPrem: 'Annual Premium', lOpp: 'Opportunity Cost %', lPct: 'Premium as a % of Car Value',
      defLimits: '50K/100K', calc: 'Calculate',
      ageA: 'Compare the two scenarios from age', ageB: 'to age',
      rA: 'The difference in annual premium is', rB: 'Invested each year instead, that difference could grow to', rC: ', its value after', rD: 'years at', rE: 'a year.',
      rF: 'Total premiums paid over those years: current coverage', rG: ', alternative coverage', rH: '.',
      ck: 'Checklist', docs: 'Documentation',
      ckT: 'Auto Insurance Checklist', ckSub: 'Auto Coverage',
      c1: 'Confirmed the state minimum limits are met, and that they are truly enough for your situation.',
      c2: 'Checked whether a higher deductible would lower the premium enough to matter.',
      c3: 'Reviewed uninsured and underinsured motorist coverage.',
      c4: 'Confirmed every vehicle you own is listed on the policy.',
      c5: 'Discussed whether collision coverage still makes sense on older vehicles.',
      c6: 'Reviewed liability limits and how they work with an umbrella policy.',
      c7: 'Reviewed medical payments coverage.',
      c8: 'Made recommendations, and noted the changes worth making.',
      wsT: 'Difference in Auto Premiums at Interest', wAge: 'Age', wDiff: 'Difference in Premiums', wStart: 'Balance at Start of Year', wInt: 'Interest', wEnd: 'Balance at End of Year', wYear: 'Year',
      disc: 'Hypothetical illustration. The opportunity cost rate is an assumption, not a guarantee. State minimum limits vary by state; this checklist is a review aid.',
      _notes: 'Most people pay for a low deductible every year in case of a claim that rarely comes. Put the difference to work and see what it becomes.\n\n- Fill in both columns, then Calculate.\n- Ask: Would you rather prepay for a small claim every year, or keep that money working for you?\nPAUSE\n\n- The Checklist walks through the coverage review; Documentation shows the year-by-year growth.'
    },
    render(ctx) {
      const txtIn = (id) => `<input class="st-input" data-txt="${id}" autocomplete="off" style="text-align:center" value="${esc(ctx.mem('t.' + id, ctx.text('defLimits')))}">`;
      const f = (o) => ctx.field(o);
      ctx.el.innerHTML = `
        <div class="b01-ai-tabs"><div class="b01-ai-tab">${ctx.t('tCur')}</div><div class="b01-ai-tab alt">${ctx.t('tAlt')}</div></div>
        <div class="b01-cx-panel b01-ai" style="left:160px;width:1280px;top:190px;padding-top:8px">
          <div class="b01-ai-row">${txtIn('limitsCurrent')}<span class="c">${ctx.t('lLim')}</span>${txtIn('limitsAlt')}</div>
          <div class="b01-ai-row">${f({ id: 'aiCar', type: 'money', value: 30000, min: 0 })}<span class="c">${ctx.t('lCar')}</span><div class="b01-ai-mirror num" data-mir="aiCar"></div></div>
          <div class="b01-ai-row">${f({ id: 'aiDedC', type: 'money', value: 250, min: 0 })}<span class="c">${ctx.t('lDed')}</span>${f({ id: 'aiDedA', type: 'money', value: 1000, min: 0 })}</div>
          <div class="b01-ai-row">${f({ id: 'aiPremC', type: 'money', value: 2000, min: 0 })}<span class="c">${ctx.t('lPrem')}</span>${f({ id: 'aiPremA', type: 'money', value: 1200, min: 0 })}</div>
          <div class="b01-ai-row">${caseField(ctx, { id: 'aiOpp', type: 'pct', value: 0.06, max: 0.12, dp: 2 }, 'accumRate')}<span class="c">${ctx.t('lOpp')}</span><div class="b01-ai-mirror num" data-mir="aiOpp"></div></div>
          <div class="b01-ai-row pct"><div data-pv="c"></div><span class="c">${ctx.t('lPct')}</span><div data-pv="a"></div></div>
        </div>
        <div class="b01-ai-age" style="top:612px">${ctx.t('ageA')} ${f({ id: 'aiFrom', type: 'int', value: 50, min: 0, max: 120 })} ${ctx.t('ageB')} ${f({ id: 'aiTo', type: 'int', value: 70, min: 0, max: 120 })}</div>
        <button type="button" class="st-pill b01-f ${AIS.shown ? 'is-off' : ''}" data-calc style="position:absolute;left:50%;transform:translateX(-50%);top:690px;min-width:220px;min-height:54px;font-size:20px">${ctx.t('calc')}</button>
        <div class="b01-cx-panel b01-cx-res b01-ai-res b01-f ${AIS.shown ? '' : 'is-off'}" data-res style="left:160px;width:1280px;top:672px;height:124px;font-size:20px"></div>
        <div class="b01-cx-acts b01-f ${AIS.shown ? '' : 'is-off'}" data-acts style="top:804px;left:160px;right:auto;width:1280px">
          <button type="button" class="b01-cx-link" data-ck>${ctx.t('ck')}</button><button type="button" class="b01-cx-link" data-docs>${ctx.t('docs')}</button></div>
        ${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer b01-disc', attrs: 'style="margin:0"' })}`;
      // the oppRate field is capped at 12% while typing (the field clamps on input)
      ctx.$$('[data-txt]').forEach((inp) => ctx.on(inp, 'change', () => ctx.remember('t.' + inp.dataset.txt, inp.value)));
      const vals = () => { const v = ctx.values(); return { carValue: num(v.aiCar, 30000), premiumCurrent: num(v.aiPremC, 2000), premiumAlt: num(v.aiPremA, 1200), oppRate: num(v.aiOpp, 0.06), fromAge: num(v.aiFrom, 50), toAge: num(v.aiTo, 70) }; };
      const draw = () => {
        const o = vals(), R = autoInsEngine(o);
        ctx.$('[data-mir="aiCar"]').textContent = m0(o.carValue);
        ctx.$('[data-mir="aiOpp"]').textContent = F.pct(o.oppRate, 2);
        const pv = (side, val) => {
          const box = ctx.$(`[data-pv="${side}"]`), on = side === 'c' ? AIS.pc : AIS.pa;
          box.innerHTML = on ? `<div class="b01-ai-pv num" style="text-align:${side === 'c' ? 'left' : 'right'}">${F.pct(val, 2)}</div>` : `<button type="button" class="st-pill" data-pcalc="${side}" style="min-width:160px">${ctx.t('calc')}</button>`;
          if (!on) ctx.on(box.querySelector('[data-pcalc]'), 'click', () => { if (side === 'c') AIS.pc = true; else AIS.pa = true; draw(); });
          box.style.justifySelf = side === 'c' ? 'start' : 'end';
        };
        pv('c', R.pctCurrent); pv('a', R.pctAlt);
        ctx.$('[data-res]').innerHTML = `<p>${ctx.t('rA')} <span class="v num">${m0(R.d)}</span>. ${ctx.t('rB')} <span class="v num">${m0(R.oc)}</span>${ctx.t('rC')} <span class="num">${R.n}</span> ${ctx.t('rD')} <span class="num">${F.pct(R.r, 2)}</span> ${ctx.t('rE')}</p>
          <p>${ctx.t('rF')} <span class="v num">${m0(R.tc)}</span>${ctx.t('rG')} <span class="v num">${m0(R.ta)}</span>${ctx.t('rH')}</p>`;
      };
      draw(); ctx.onFields(draw);
      ctx.on(ctx.$('[data-calc]'), 'click', () => { AIS.shown = true; ctx.show('[data-calc]', false); ctx.show('[data-res]', true); ctx.show('[data-acts]', true); });
      ctx.on(ctx.$('[data-ck]'), 'click', () => {
        ctx.overlay({ title: ctx.t('ckT'), html: `<div class="b01-ck">${ctx.t('ckSub', { tag: 'h3' })}<ol>${[1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<li>${ctx.t('c' + k)}</li>`).join('')}</ol>${discLine(['notAdvice', 'hypothetical', 'license'], 'position:static')}</div>` });
      });
      ctx.on(ctx.$('[data-docs]'), 'click', () => {
        const o = vals(), R = autoInsEngine(o), m = (f2, h) => ({ field: f2, header: ctx.t(h), type: 'money', dp: 2 });
        wsOpen(ctx, { heading: ctx.t('wsT'), size: 'medium', columns: [{ field: 'age', header: ctx.t('wAge'), type: 'age' }, m('diff', 'wDiff'), m('start', 'wStart'), m('int', 'wInt'), m('end', 'wEnd'), { field: 'year', header: ctx.t('wYear'), type: 'year' }], rows: R.rows, highlight: 'end',
          assumptions: [{ label: ctx.t('lPrem'), value: `${m0(o.premiumCurrent)} / ${m0(o.premiumAlt)}` }, { label: ctx.t('lOpp'), value: F.pct(o.oppRate, 2) }], disclosures: ['hypothetical', 'notAdvice', 'license'] });
      });
    }
  });

  /* ---------- aa1: average return versus actual return ---------- */
  /** the AA engine: rows of yearly returns (fractions) on a starting balance */
  function aaEngine(initial, rets) {
    let b = initial; const rows = rets.map((r, k) => { const gain = b * r; b = b * (1 + r); return { year: k + 1, r, gain, end: b }; });
    const n = rets.length, avg = rets.reduce((s, r) => s + r, 0) / n;
    const actual = initial > 0 ? b / initial - 1 : 0;
    const annual = initial > 0 && b >= 0 ? Math.pow(b / initial, 1 / n) - 1 : 0;
    return { rows, avg, actual, annual, end: b };
  }
  EFA.engines.avgActual = aaEngine;
  const AAS = { initial: 50000, rets: [0], alt: false, annual: false };
  EFA.screen('aa1', {
    title: 'Average return versus actual return',
    copy: {
      headA: 'Average Return vs. Actual Return', headB: 'Average Return vs. Annualized Return', headAlt: 'Averages vs. Real Dollars',
      lInit: 'Initial Balance', cYear: 'Year', cRet: 'Annual Return', cGain: 'Annual Gain/(Loss)', cEnd: 'End of Year Account Balance',
      add: 'Add', reset: 'Reset', avg: 'Average Return:', act: 'Actual Return:', ann: 'Annualized Return:',
      delT: 'Delete this year?', delB: 'One record is selected. Delete it from the table?', yes: 'Yes', no: 'No', delLbl: 'Delete row',
      disc: 'Hypothetical returns for illustration. If actual index history is entered, fees, expenses and taxes are not included, and past performance does not guarantee future results.',
      _notes: 'The average return is a math fact. The actual return is what lands in your account, and they can be very different.\n\n- Try +50% then -50%: the average is zero, yet a quarter of the money is gone.\n- Ask: When someone quotes you an average return, which number do you think they mean?\nPAUSE'
    },
    render(ctx) {
      const trash = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
      const head = () => ctx.t(AAS.alt ? 'headAlt' : (AAS.annual ? 'headB' : 'headA'), { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:54px"' });
      ctx.el.innerHTML = `
        <div class="b01-aa-h" data-h>${head()}</div>
        <div class="b01-cx-panel b01-aa-init"><span class="lb">${ctx.t('lInit')}</span><div class="st-field"><input class="st-input" data-init inputmode="decimal" autocomplete="off" value="${esc(m0(AAS.initial))}"></div></div>
        <div class="b01-cx-panel b01-aa-grid b01-aa">
          <div></div>
          <div class="b01-aa-scroll"><table class="st-table"><thead><tr><th class="yr">${ctx.t('cYear')}</th><th>${ctx.t('cRet')}</th><th>${ctx.t('cGain')}</th><th>${ctx.t('cEnd')}</th><th class="del"></th></tr></thead><tbody data-body></tbody></table></div>
          <div class="b01-aa-foot"><button type="button" class="st-pill" data-add style="min-width:120px">${ctx.t('add')}</button></div>
        </div>
        <div class="b01-cx-panel b01-aa-res"><span>${ctx.t('avg')}</span><span class="v num" data-avg></span><span class="sw" data-sw>${ctx.t(AAS.annual ? 'ann' : 'act')}</span><span class="v num" data-act></span></div>
        <button type="button" class="st-pill" data-reset style="position:absolute;left:50%;transform:translateX(-50%);top:756px;min-width:160px">${ctx.t('reset')}</button>
        ${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer b01-disc', attrs: 'style="margin:0"' })}`;
      const body = ctx.$('[data-body]');
      const fmtR = (r) => F.num(r * 100, 2) + '%';
      const rowsHTML = () => AAS.rets.map((r, k) => `<tr data-k="${k}"><td class="yr num">${k + 1}</td><td class="ret"><input class="st-input" data-ret="${k}" inputmode="decimal" autocomplete="off" value="${esc(fmtR(r))}"></td><td class="num" data-gain="${k}"></td><td class="num" data-end="${k}"></td><td class="del"><button type="button" class="b01-aa-del" data-del="${k}" aria-label="${esc(ctx.text('delLbl'))}">${trash}</button></td></tr>`).join('');
      const calc = () => {
        const R = aaEngine(AAS.initial, AAS.rets);
        R.rows.forEach((row, k) => {
          const g = body.querySelector(`[data-gain="${k}"]`), e = body.querySelector(`[data-end="${k}"]`);
          if (g) { g.textContent = row.gain < 0 ? `(${m0(-row.gain)})` : m0(row.gain); g.classList.toggle('neg', row.gain < 0); }
          if (e) e.textContent = m0(row.end);
        });
        ctx.$('[data-avg]').textContent = F.pct(R.avg, 2);
        ctx.$('[data-act]').textContent = F.pct(AAS.annual ? R.annual : R.actual, 2);
      };
      const bindRows = () => {
        body.innerHTML = rowsHTML();
        body.querySelectorAll('[data-ret]').forEach((inp) => {
          const k = +inp.dataset.ret;
          inp.addEventListener('input', () => {
            let v = parseFloat(inp.value.replace(/[^0-9.\-]/g, ''));
            if (v > 100) { v = 100; inp.value = '100'; }
            AAS.rets[k] = isFinite(v) ? v / 100 : 0; calc();
          });
          inp.addEventListener('blur', () => { inp.value = fmtR(AAS.rets[k]); });
          inp.addEventListener('focus', () => { inp.value = String(+(AAS.rets[k] * 100).toFixed(4)); inp.select(); });
        });
        ctx.on(Array.from(body.querySelectorAll('[data-del]')), 'click', (e, b) => {
          const k = +b.dataset.del;
          const ov = ctx.overlay({ title: ctx.t('delT'), html: `<div class="b01-aa-conf">${ctx.t('delB', { tag: 'p' })}<div class="row"><button type="button" class="st-pill is-static" data-n>${ctx.t('no')}</button><button type="button" class="st-pill" data-y>${ctx.t('yes')}</button></div></div>` });
          ov.querySelector('.st-overlay-in').style.width = '620px';
          ov.querySelector('[data-n]').addEventListener('click', () => ov.close());
          ov.querySelector('[data-y]').addEventListener('click', () => { ov.close(); AAS.rets.splice(k, 1); if (!AAS.rets.length) AAS.rets.push(0); bindRows(); calc(); });
        });
      };
      bindRows(); calc();
      const init = ctx.$('[data-init]');
      ctx.on(init, 'input', () => { const v = EFA.fmt.parse(init.value); AAS.initial = isFinite(v) ? Math.max(0, v) : 0; calc(); });
      ctx.on(init, 'blur', () => { init.value = m0(AAS.initial); });
      ctx.on(ctx.$('[data-add]'), 'click', () => { AAS.rets.push(0); bindRows(); calc(); const s = ctx.$('.b01-aa-scroll'); s.scrollTop = s.scrollHeight; });
      ctx.on(ctx.$('[data-reset]'), 'click', () => { AAS.rets = [0]; bindRows(); calc(); });
      ctx.on(ctx.$('[data-h]'), 'click', () => { AAS.alt = !AAS.alt; ctx.$('[data-h]').innerHTML = head(); });
      ctx.on(ctx.$('[data-sw]'), 'click', (e, el) => { AAS.annual = !AAS.annual; el.innerHTML = ctx.t(AAS.annual ? 'ann' : 'act'); ctx.$('[data-h]').innerHTML = head(); calc(); });
    }
  });

  /* ---- end of screens ---- */
})();
