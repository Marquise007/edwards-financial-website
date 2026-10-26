/* Secure the Next Generation First (NGF), part two: the numbers and the structures.
   Liquidity (ng16-ng18), trusts (ng19-ng20), financing (ng21-ng22) and freedom capital (ng23-ng24).
   The catalog interleaves these with ng1-ng15. Self-contained (own styles and helpers), so any screen
   here can also be added to another presentation on its own. Wording is original. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P;

  EFA.css('nx', `
  .nx-full { position: absolute; inset: 0; width: 1600px; height: 900px; overflow: visible; pointer-events: none; }
  .nx-f { transition: opacity .8s ease, transform .8s ease; }
  .stage .nx-f.is-off { transform: translateY(14px); }
  .stage g.nx-f.is-off { transform: translateY(10px); }
  .nx-hd { position: absolute; left: 110px; top: 60px; width: 1320px; display: grid; gap: 14px; justify-items: start; }
  .nx-hd .st-h1 { font-size: 60px; }
  .nx-hd.sm { top: 40px; gap: 10px; }
  .nx-hd.sm .st-h1 { font-size: 50px; }
  .nx-sub { margin: 4px 0 0; font: 400 25px/1.45 var(--f-body); color: var(--navy); max-width: 1080px; }
  .nx-line { position: absolute; left: 150px; right: 150px; margin: 0; text-align: center; font: italic 500 38px/1.25 var(--f-display); color: var(--navy); text-wrap: balance; }
  .nx-line.sm { font-size: 32px; }
  .nx-src { position: absolute; left: 110px; bottom: 26px; width: 1170px; margin: 0; font: 400 13px/1.45 var(--f-body); color: var(--muted); }
  .nx-src.up { bottom: 54px; width: 1380px; }
  .nx-src.hi { bottom: 86px; width: 1380px; }
  .nx-st { width: 100%; border-collapse: collapse; font: 500 15.5px/1.3 var(--f-body); color: var(--navy); font-variant-numeric: lining-nums tabular-nums; }
  .nx-st th { font: 700 11.5px/1.25 var(--f-body); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); text-align: right; padding: 0 0 6px 10px; vertical-align: bottom; }
  .nx-st th:first-child { color: var(--gold-deep); padding-left: 0; }
  .nx-st th:first-child, .nx-st td:first-child { text-align: left; }
  .nx-st td { padding: 7px 0 7px 10px; border-top: 1px solid var(--line); text-align: right; }
  .nx-st td:first-child { padding-left: 0; }
  .nx-st tr.on td { font-weight: 700; color: var(--gold-deep); background: rgba(240, 230, 196, .5); }
  .nx-st .star { color: var(--gold-deep); font-weight: 700; }
  .stage .nx-disc { position: absolute; left: 110px; bottom: 14px; width: 1170px; margin: 0; font-size: 12px; line-height: 1.4; }
  .nx-card { position: absolute; box-sizing: border-box; background: var(--paper); border: 1px solid var(--rule); border-radius: 16px; box-shadow: 0 14px 34px rgba(13, 30, 58, .08); }
  .nx-card.gold { border: 2px solid var(--gold); box-shadow: 0 18px 40px rgba(184, 151, 46, .18); }
  .nx-cap { font: 700 14px/1.2 var(--f-body); letter-spacing: .18em; text-transform: uppercase; color: var(--gold-deep); }
  .nx-ct { margin: 0; font: 600 31px/1.12 var(--f-display); color: var(--navy); }
  .nx-cb { margin: 0; font: 400 20px/1.5 var(--f-body); color: var(--navy); }
  .nx-cn { margin: 0; padding-top: 12px; border-top: 1px solid var(--line); font: 400 17px/1.45 var(--f-body); color: var(--muted); }
  .nx-ic svg { width: 60px; height: 60px; display: block; }
  .nx-hide { display: none !important; }

  /* explainer pieces */
  .nx-seg { position: absolute; transform: translate(-50%, -50%); font: 700 13px/1.1 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--cream); white-space: nowrap; }
  .nx-seg.dk { color: var(--navy); }
  .nx-col { position: absolute; width: 210px; margin-left: -105px; text-align: center; font: 700 15px/1.3 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--navy); }
  .nx-col.gold { color: var(--gold-deep); }
  .nx-rows { position: absolute; left: 820px; width: 670px; top: 262px; display: grid; gap: 20px; }
  .nx-row { display: grid; grid-template-columns: 52px 1fr; gap: 22px; align-items: center; background: var(--paper); border: 1px solid var(--rule); border-radius: 14px; padding: 20px 26px; min-height: 100px; box-sizing: border-box; box-shadow: 0 10px 26px rgba(13, 30, 58, .06); }
  .nx-row .n { width: 52px; height: 52px; border-radius: 50%; background: var(--gold); color: var(--navy); display: grid; place-items: center; font: 700 22px/1 var(--f-body); }
  .nx-row p { margin: 0; font: 400 24px/1.4 var(--f-body); color: var(--navy); }
  .nx-rl { position: absolute; left: 820px; width: 670px; margin: 0; font: italic 500 34px/1.25 var(--f-display); color: var(--gold-deep); text-wrap: balance; }
  .nx-c3 { padding: 32px 32px 28px; display: grid; gap: 14px; align-content: start; grid-template-rows: auto auto auto auto 1fr; }
  .nx-c3 .nx-cn { align-self: end; }
  .nx-c4 { padding: 28px 26px 24px; display: grid; gap: 12px; align-content: start; grid-template-rows: auto auto auto 1fr auto; }
  .nx-c4 .nx-ct { font-size: 29px; }
  .nx-c4 .nx-cb { font-size: 19px; }
  .nx-node { padding: 20px 24px; display: grid; gap: 8px; align-content: start; }
  .nx-node .hdr { display: flex; align-items: center; gap: 14px; }
  .nx-node .hdr svg { width: 46px; height: 46px; flex: none; }
  .nx-node .nx-ct { font-size: 28px; }
  .nx-node .nx-cb { font-size: 18px; line-height: 1.45; }
  .nx-al { position: absolute; font: 700 14px/1.3 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); }
  .nx-tag { position: absolute; box-sizing: border-box; padding: 9px 16px; border-radius: 999px; background: var(--navy); color: var(--cream); font: 600 16px/1.25 var(--f-body); box-shadow: 0 10px 24px rgba(13, 30, 58, .18); text-align: center; }
  .nx-rule3 { position: absolute; left: 110px; width: 1380px; top: 646px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
  .nx-rule3 > div { border-top: 3px solid var(--gold); padding-top: 14px; display: grid; gap: 6px; }
  .nx-rule3 .k { margin: 0; font: 600 27px/1.15 var(--f-display); color: var(--navy); }
  .nx-rule3 .d { margin: 0; font: 400 18px/1.45 var(--f-body); color: var(--navy); }
  .nx-five { position: absolute; left: 110px; width: 1380px; top: 232px; display: grid; gap: 0; }
  .nx-five > div { display: grid; grid-template-columns: 60px 420px 1fr; gap: 26px; align-items: center; padding: 15px 0; border-bottom: 1px solid var(--line); }
  .nx-five .n { width: 50px; height: 50px; border-radius: 50%; border: 2px solid var(--gold); display: grid; place-items: center; font: italic 600 22px/1 var(--f-display); color: var(--gold-deep); background: var(--paper); }
  .nx-five .t { margin: 0; font: 600 30px/1.12 var(--f-display); color: var(--navy); }
  .nx-five .d { margin: 0; font: 400 20px/1.45 var(--f-body); color: var(--navy); }

  /* calculators */
  .nx-chs { position: absolute; left: 110px; top: 148px; display: flex; gap: 30px; align-items: end; flex-wrap: nowrap; }
  .stage .nx-chs .st-seg-b { font-size: 16px; padding: 8px 15px; }
  .nx-form { padding: 14px 26px 16px; display: grid; align-content: start; }
  .nx-gt { font: 700 13px/1.2 var(--f-body); letter-spacing: .18em; text-transform: uppercase; color: var(--gold-deep); padding: 4px 0 4px; }
  .nx-gt.mt { margin-top: 10px; }
  .stage .nx-fr .st-field { grid-template-columns: minmax(0, 1fr) 196px; align-items: center; gap: 16px; min-height: 40px; border-bottom: 1px solid rgba(13, 30, 58, .09); }
  .stage .nx-fr .st-field > label { font: 600 19px/1.2 var(--f-body); color: var(--navy); text-transform: none; letter-spacing: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stage .nx-fr .st-input { height: 35px; font-size: 19px; text-align: right; border-radius: 8px; padding: 0 12px; }
  .nx-asm { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 14px; }
  .stage .nx-fr .nx-asm .st-field { grid-template-columns: 1fr; gap: 6px; border-bottom: 0; min-height: 0; }
  .stage .nx-fr .nx-asm .st-field > label { font: 700 12.5px/1.2 var(--f-body); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); white-space: normal; }
  .stage .nx-fr .nx-asm .st-input { height: 40px; font-size: 19px; text-align: right; }
  .nx-tiles { position: absolute; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .nx-tiles.c3 { grid-template-columns: repeat(3, 1fr); }
  .nx-tile { box-sizing: border-box; background: var(--paper); border: 1px solid var(--rule); border-radius: 14px; padding: 13px 20px 12px; display: grid; gap: 6px; align-content: start; box-shadow: 0 10px 26px rgba(13, 30, 58, .06); transition: opacity .8s ease, transform .8s ease; }
  .nx-tile .k { font: 700 12.5px/1.25 var(--f-body); letter-spacing: .13em; text-transform: uppercase; color: var(--muted); }
  .nx-tile .v { font: 700 38px/1 var(--f-body); color: var(--navy); font-variant-numeric: lining-nums tabular-nums; letter-spacing: -.01em; }
  .nx-tile .s { font: 400 15px/1.3 var(--f-body); color: var(--muted); }
  .nx-tile.navy { background: var(--navy); border-color: var(--navy); }
  .nx-tile.navy .k { color: var(--gold-lt); } .nx-tile.navy .v { color: var(--cream); } .nx-tile.navy .s { color: rgba(247, 245, 241, .75); }
  .nx-tile.gold { background: var(--gold-pale); border: 2px solid var(--gold); }
  .nx-tile.gold .k, .nx-tile.gold .v { color: var(--gold-deep); }
  .nx-tiles.cmp .nx-tile { padding: 11px 18px 10px; gap: 5px; }
  .nx-tiles.cmp .nx-tile .v { font-size: 34px; }
  .nx-tiles.cmp .nx-tile .s { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .nx-bars { padding: 16px 24px; display: grid; gap: 8px; align-content: start; }
  .nx-bl { display: flex; justify-content: space-between; align-items: baseline; font: 700 13px/1.2 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--navy); }
  .nx-bl b { font: 700 20px/1 var(--f-body); letter-spacing: 0; font-variant-numeric: tabular-nums; }
  .nx-bar { position: relative; height: 30px; border-radius: 8px; background: var(--mist); overflow: hidden; display: flex; margin-bottom: 4px; }
  .nx-bar i { display: block; height: 100%; transition: width .6s cubic-bezier(.3, .7, .25, 1); }
  .nx-bar i.gap { background: repeating-linear-gradient(135deg, var(--gold-pale) 0 8px, var(--gold-lt) 8px 14px); }
  .nx-leg { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 26px; margin-top: 2px; }
  .nx-leg span { display: flex; align-items: center; gap: 8px; font: 500 14.5px/1.25 var(--f-body); color: var(--navy); white-space: nowrap; }
  .nx-leg i { width: 14px; height: 14px; border-radius: 3px; flex: none; }
  .nx-leg i.gap { background: repeating-linear-gradient(135deg, var(--gold-pale) 0 3px, var(--gold-lt) 3px 6px); }
  .nx-leg b { font-weight: 700; font-variant-numeric: tabular-nums; margin-left: auto; }
  .nx-note { font: 400 13.5px/1.35 var(--f-body); color: var(--muted); margin: 0; }
  .nx-say { position: absolute; margin: 0; font: italic 500 28px/1.22 var(--f-display); color: var(--navy); text-wrap: balance; }
  .nx-say .nx-v { font: 700 25px/1 var(--f-body); font-style: normal; color: var(--gold-deep); font-variant-numeric: tabular-nums; }
  .nx-pl { padding: 18px 24px 20px; display: grid; gap: 12px; align-content: start; }
  .nx-p.xs { font-size: 13px; line-height: 1.35; color: var(--muted); }
  .stage .nx-pl .st-input { height: 54px; font-size: 26px; text-align: right; }
  .nx-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .stage button.nx-chip { display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid var(--gold); background: var(--gold-pale); color: var(--navy); border-radius: 999px; padding: 7px 14px; font: 600 15px/1.1 var(--f-body); cursor: pointer; }
  .stage button.nx-chip:hover { background: var(--gold-lt); }
  .nx-chip b { font-variant-numeric: tabular-nums; }
  .nx-p { margin: 0; font: 400 16px/1.45 var(--f-body); color: var(--navy); }
  .nx-p.mt { color: var(--muted); font-size: 14.5px; }
  .nx-ok { display: flex; align-items: center; gap: 10px; font: 600 16px/1.3 var(--f-body); color: var(--navy); padding: 10px 14px; border-radius: 10px; background: var(--mist); }
  .nx-ok i { width: 22px; height: 22px; border-radius: 50%; background: var(--gold); flex: none; display: grid; place-items: center; }
  .nx-ok i svg { width: 14px; height: 14px; }
  .nx-ok.low i { background: var(--navy-4); }
  .nx-ctitle { margin: 0; font: 600 28px/1.15 var(--f-display); color: var(--navy); }
  .nx-dl { display: grid; grid-template-columns: 132px 1fr; gap: 7px 14px; margin: 0; }
  .nx-dl dt { font: 700 12px/1.6 var(--f-body); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
  .nx-dl dd { margin: 0; font: 500 16px/1.4 var(--f-body); color: var(--navy); font-variant-numeric: tabular-nums; }
  .nx-chart { padding: 12px 14px 4px; }
  .nx-chart svg { display: block; }
  .nx-ckey { display: flex; gap: 22px; flex-wrap: wrap; padding: 0 10px 6px; font: 600 14px/1 var(--f-body); color: var(--navy); }
  .nx-ckey span { display: inline-flex; align-items: center; gap: 8px; }
  .nx-ckey i { width: 22px; height: 5px; border-radius: 3px; display: block; }
  .nx-ckey i.bar { height: 12px; width: 12px; border-radius: 2px; }
  .nx-flag { position: absolute; margin: 0; padding: 9px 16px; border-left: 4px solid var(--navy); background: var(--gold-pale); font: 500 16.5px/1.4 var(--f-body); color: var(--navy); border-radius: 0 10px 10px 0; box-sizing: border-box; }
  .nx-flag .nx-v { font-weight: 700; font-variant-numeric: tabular-nums; }
  .nx-lev { position: absolute; margin: 0; font: italic 500 27px/1.25 var(--f-display); color: var(--navy); }
  .nx-lev .nx-v { font: 700 24px/1 var(--f-body); font-style: normal; color: var(--gold-deep); font-variant-numeric: tabular-nums; }
  .stage .nx-big .st-field { grid-template-columns: minmax(0, 1fr) 210px; align-items: center; gap: 18px; min-height: 64px; border-bottom: 1px solid rgba(13, 30, 58, .09); }
  .stage .nx-big .st-field > label { font: 700 21px/1.2 var(--f-body); color: var(--navy); text-transform: none; letter-spacing: 0; }
  .stage .nx-big .st-input { height: 48px; font-size: 22px; text-align: right; }
  `);

  /* ---------- shared pieces ---------- */
  const AT = (n) => `data-at="${n}"`;
  function reveal(ctx, n) { ctx.$$('[data-at]').forEach((e) => e.classList.toggle('is-off', +e.dataset.at > n)); }
  function head(ctx, o) {
    return `<div class="nx-hd${o.sm ? ' sm' : ''}">${ctx.t(o.eb, { tag: 'span', cls: 'st-eyebrow' })}${ctx.t(o.h, { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule">${o.sub ? ctx.t(o.sub, { tag: 'p', cls: 'nx-sub' }) : ''}</div>`;
  }
  function line(ctx, key, top, o) {
    o = o || {};
    return ctx.t(key, { tag: 'p', cls: 'nx-line serif nx-f' + (o.cls ? ' ' + o.cls : ''), attrs: `style="top:${top}px"${o.at != null ? ' ' + AT(o.at) : ''}` });
  }
  function src(ctx, key, cls) { return ctx.t(key, { tag: 'p', cls: 'nx-src' + (cls ? ' ' + cls : '') }); }
  function disc(topics) {
    const D = EFA.lib && EFA.lib.disclosure;
    return D ? D.line(topics, { cls: 'nx-disc' }) : '';
  }
  const goldGrad = (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset="1" stop-color="${P.gold}"/></linearGradient>`;
  const navyGrad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a || P.navy3}"/><stop offset="1" stop-color="${b || P.navy}"/></linearGradient>`;
  const arrowDef = (id, color) => `<marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${color || P.gold}"/></marker>`;
  /** safe lookup in EFA.data: D('fed.estate.exemption', 15000000) */
  function D(path, def) {
    let o = EFA.data;
    for (const k of String(path).split('.')) { if (o == null || typeof o !== 'object') return def; o = o[k]; }
    return o == null ? def : o;
  }
  /** per-client values shared across screens (EFA.lib.caseData, namespace "case") */
  const CD = {
    get(k, d) { const c = EFA.lib && EFA.lib.caseData; return c ? c.get(k, d) : d; },
    set(k, v) { const c = EFA.lib && EFA.lib.caseData; if (c && isFinite(v)) c.set(k, Math.round(v)); },
    /** a field bound to a shared case value: shows the latest shared value, and writes edits back */
    field(ctx, o) { const c = EFA.lib && EFA.lib.caseData; return c && c.field ? c.field(ctx, o) : ctx.field(o); }
  };
  /** compact money for tiles: $47.5M, $9.51M, $436K */
  function mny(n) {
    if (n == null || !isFinite(n)) return '–';
    const neg = n < 0, a = Math.abs(n);
    let s;
    if (a >= 1e6) s = '$' + (a / 1e6).toFixed(a >= 1e8 ? 0 : a >= 1e7 ? 1 : 2) + 'M';
    else if (a >= 1e3) s = '$' + Math.round(a / 1e3) + 'K';
    else s = '$' + Math.round(a);
    return (neg ? '-' : '') + s;
  }
  const pct0 = (f) => (isFinite(f) ? Math.round(f * 100) + '%' : '–');
  const pct1 = (f) => (isFinite(f) ? (Math.round(f * 1000) / 10).toFixed(1) + '%' : '–');
  function setV(ctx, name, text) { ctx.$$(`[data-nv="${name}"]`).forEach((n) => { n.textContent = text; }); }
  const V = (name, cls) => `<span class="nx-v${cls ? ' ' + cls : ''}" data-nv="${name}"></span>`;
  const axisLab = (v) => (v >= 1e6 ? '$' + +(v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? '$' + Math.round(v / 1e3) + 'K' : '$' + Math.round(v));
  function niceMax(v) {
    if (!(v > 0)) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
  }
  /** chart in the house style: lines, optional bars, a shaded band between two lines, and a marker */
  function chartSVG(o) {
    const w = o.w, h = o.h, pad = Object.assign({ l: 78, r: 16, t: 14, b: 36 }, o.pad || {});
    const n = o.n, iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    const vals = [];
    (o.lines || []).forEach((s) => s.v.forEach((x) => { if (isFinite(x)) vals.push(x); }));
    (o.bars || []).forEach((s) => s.v.forEach((x) => { if (isFinite(x)) vals.push(x); }));
    const yMax = niceMax(Math.max(1, ...vals));
    const X = (i) => pad.l + (n <= 1 ? iw / 2 : (i * iw) / (n - 1));
    const Y = (v) => pad.t + ih * (1 - Math.max(0, Math.min(v, yMax)) / yMax);
    const T = (x, y, s, a, c, wt) => `<text x="${x}" y="${y}" text-anchor="${a || 'middle'}" font-family="DM Sans, sans-serif" font-size="${s || 15}" font-weight="${wt || 400}" fill="${c || P.navy}" style="font-variant-numeric:tabular-nums">${s === 0 ? '' : ''}`;
    let g = '';
    for (let k = 0; k <= 4; k++) {
      const v = (yMax * k) / 4, y = Y(v);
      g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${P.rule}" stroke-width="1" opacity="${k ? 0.7 : 1}"/>`;
      g += `${T(pad.l - 10, (y + 5).toFixed(1), 14, 'end', '#667389')}${axisLab(v)}</text>`;
    }
    if (o.band) {
      const a = o.band[0], b = o.band[1];
      let d = '';
      for (let i = 0; i < n; i++) d += `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(b[i]).toFixed(1)}`;
      for (let i = n - 1; i >= 0; i--) d += `L${X(i).toFixed(1)},${Y(a[i]).toFixed(1)}`;
      g += `<path d="${d}Z" fill="${P.goldLt}" opacity=".22"/>`;
    }
    (o.bars || []).forEach((s) => {
      const bw = Math.max(4, Math.min(18, (iw / Math.max(1, n)) * 0.5));
      s.v.forEach((x, i) => { if (!(x > 0)) return; const y = Y(x); g += `<rect x="${(X(i) - bw / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${(pad.t + ih - y).toFixed(1)}" rx="2" fill="${s.color}" opacity="${s.op || 0.9}"/>`; });
    });
    if (o.mark && o.mark.i >= 0 && o.mark.i < n) {
      const x = X(o.mark.i).toFixed(1);
      g += `<line x1="${x}" x2="${x}" y1="${pad.t}" y2="${pad.t + ih}" stroke="${P.gold}" stroke-width="2" stroke-dasharray="4 6"/>`;
      if (o.mark.label) g += `${T(+x + 8, pad.t + 14, 13, 'start', P.goldDeep, 700)}${o.mark.label}</text>`;
    }
    (o.lines || []).forEach((s) => {
      let d = '';
      s.v.forEach((x, i) => { if (isFinite(x)) d += `${d ? 'L' : 'M'}${X(i).toFixed(1)},${Y(x).toFixed(1)}`; });
      g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 4}" stroke-linejoin="round" stroke-linecap="round"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}/>`;
      const last = s.v.length - 1;
      if (s.dot && isFinite(s.v[last])) g += `<circle cx="${X(last).toFixed(1)}" cy="${Y(s.v[last]).toFixed(1)}" r="6.5" fill="${s.color}" stroke="#fff" stroke-width="3"/>`;
    });
    const every = o.every || 5;
    for (let i = 0; i < n; i++) {
      const lab = o.xl ? o.xl(i) : i;
      if (lab === '' || lab == null) continue;
      if (i % every && i !== n - 1 && i !== 0) continue;
      g += `${T(X(i).toFixed(1), h - pad.b + 24, 14, 'middle', '#667389')}${lab}</text>`;
    }
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${o.label || 'Chart'}">${g}</svg>`;
  }

  /* small line icons (64 x 64): navy strokes, gold accents */
  const N = P.navy, G = P.gold;
  const IC = {
    tag: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 30V10h20l28 28-20 20z" fill="none" stroke="${N}" stroke-width="3.2" stroke-linejoin="round"/><circle cx="19" cy="21" r="5" fill="${G}"/><path d="M30 40l10-10M35 45l6-6" stroke="${G}" stroke-width="3" stroke-linecap="round"/></svg>`,
    bank: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M6 24 32 9l26 15z" fill="${N}"/><rect x="8" y="26" width="48" height="4" fill="${G}"/><path d="M14 33v15M25 33v15M39 33v15M50 33v15" stroke="${N}" stroke-width="4.5" stroke-linecap="round"/><rect x="6" y="51" width="52" height="5" rx="1.5" fill="${N}"/></svg>`,
    floor: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 40a18 18 0 0 1 36 0" fill="none" stroke="${N}" stroke-width="3.2"/><path d="M22 40a10 10 0 0 1 20 0z" fill="${G}"/><rect x="5" y="42" width="54" height="9" rx="2.5" fill="${G}"/><path d="M5 56h54" stroke="${N}" stroke-width="3" stroke-linecap="round"/></svg>`,
    policy: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 6h26l12 12v40H14z" fill="#fff" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><path d="M40 6v12h12" fill="none" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><path d="M21 26h22M21 33h22M21 40h12" stroke="${N}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/><circle cx="42" cy="47" r="8" fill="${G}"/><path d="M38.5 47l2.5 2.5 4.5-5" fill="none" stroke="${N}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    you: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="20" r="10" fill="${N}"/><path d="M12 56c0-14 9-23 20-23s20 9 20 23z" fill="${N}"/><path d="M24 44l8 6 8-6" fill="none" stroke="${G}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    trust: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6 54 14v16c0 14-9 23-22 28C19 53 10 44 10 30V14z" fill="${P.goldPale}" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><path d="M23 31l6 6 12-13" fill="none" stroke="${G}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    people: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="20" cy="17" r="7" fill="${N}"/><path d="M6 52c0-12 6-20 14-20s14 8 14 20z" fill="${N}"/><circle cx="42" cy="24" r="5.5" fill="${P.navy4}"/><path d="M31 52c0-9 5-15 11-15s11 6 11 15z" fill="${P.navy4}"/><rect x="4" y="54" width="56" height="4" rx="2" fill="${G}"/></svg>`,
    court: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 22 32 8l24 14z" fill="none" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><path d="M14 27v20M26 27v20M38 27v20M50 27v20" stroke="${N}" stroke-width="3.6" stroke-linecap="round"/><path d="M8 53h48" stroke="${N}" stroke-width="3.4" stroke-linecap="round"/><path d="M28 18h8" stroke="${G}" stroke-width="3.4" stroke-linecap="round"/></svg>`,
    heart: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 53S9 39 9 23c0-7 5-12 12-12 5 0 9 3 11 7 2-4 6-7 11-7 7 0 12 5 12 12 0 16-23 30-23 30z" fill="${G}" opacity=".9"/><path d="M32 53S9 39 9 23c0-7 5-12 12-12 5 0 9 3 11 7 2-4 6-7 11-7 7 0 12 5 12 12 0 16-23 30-23 30z" fill="none" stroke="${N}" stroke-width="3" stroke-linejoin="round"/></svg>`,
    tree: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 58V30" stroke="${N}" stroke-width="3.4" stroke-linecap="round"/><path d="M32 40 20 30M32 34l12-10" stroke="${N}" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="18" r="11" fill="${P.navy4}"/><circle cx="18" cy="26" r="7" fill="${P.navy3}"/><circle cx="46" cy="22" r="7" fill="${G}"/><path d="M18 58h28" stroke="${G}" stroke-width="3" stroke-linecap="round"/></svg>`,
    check: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="${P.navy}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    dot: `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="${P.cream}"/></svg>`
  };

  /* =====================================================================
     16. net worth is not cash (explainer, leads into the liquidity calculator)
     ===================================================================== */
  EFA.screen('ng16', {
    title: 'Net worth is not cash',
    steps: 4,
    copy: {
      eb: 'Liquidity',
      h: 'Net worth is not cash.',
      sub: 'What an estate is worth and what it can pay on a deadline are two different numbers.',
      kAll: 'What it’s worth', kCash: 'Cash within\nnine months', kDue: 'What comes due',
      sBiz: 'Business', sRe: 'Real estate', sHome: 'Home', sInv: 'Investments', sCash: 'Cash',
      gap: 'The gap',
      r1: 'Net worth is what everything would sell for, given time.',
      r2: 'Liquidity is what can be raised quickly, at full value.',
      r3: 'The estate’s bill arrives on a deadline, and it is paid in cash.',
      close: 'Next, we measure that gap with your numbers.',
      _notes: 'Separate two ideas: what the estate is worth, and what it can pay on a deadline.\n\n- Businesses, buildings, and land take time to sell well. Estate taxes are generally due nine months after death, and cash ready at that moment can help prevent a fire sale of assets (John Hancock, Guide to Financing Premiums, LIFE-7299).\n\n- Ask: How much of what you own could you turn into cash in nine months without taking a discount?\nPAUSE'
    },
    render(ctx) {
      const base = 712, w = 164, xs = [222, 446, 670];
      const segs = [['sBiz', 168, P.navy], ['sRe', 118, P.navy3], ['sHome', 56, P.navy4], ['sInv', 62, P.waterDeep], ['sCash', 34, P.water]];
      let y = base, colA = '', labA = '';
      segs.forEach(([k, h, c], i) => {
        y -= h;
        colA += `<rect x="${xs[0] - w / 2}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
        if (i < 4) colA += `<rect x="${xs[0] - w / 2}" y="${y}" width="${w}" height="2" fill="${P.paper}" opacity=".35"/>`;
        labA += ctx.t(k, { tag: 'div', cls: 'nx-seg' + (i === 4 ? ' dk' : ''), attrs: `style="left:${xs[0]}px;top:${y + h / 2}px"` });
      });
      const topA = y, liqH = 62 + 34, topB = base - liqH, dueH = 214, topC = base - dueH;
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h', sub: 'sub' })}
        <svg class="nx-full" viewBox="0 0 1600 900" aria-hidden="true">
          <defs>${goldGrad('nxNwG')}
            <pattern id="nxNwH" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="${P.goldPale}"/><rect width="6" height="14" fill="${P.goldLt}" opacity=".8"/></pattern>
            <clipPath id="nxNwC"><rect x="${xs[0] - w / 2}" y="${topA}" width="${w}" height="${base - topA}" rx="14"/></clipPath></defs>
          <ellipse cx="446" cy="${base + 8}" rx="330" ry="12" fill="rgba(13,30,58,.08)"/>
          <g class="nx-f" ${AT(0)}><g clip-path="url(#nxNwC)">${colA}</g></g>
          <g class="nx-f" ${AT(1)}>
            <rect x="${xs[1] - w / 2}" y="${topA}" width="${w}" height="${base - topA}" rx="14" fill="none" stroke="${P.mist2}" stroke-width="2.5" stroke-dasharray="6 8"/>
            <rect x="${xs[1] - w / 2}" y="${topB}" width="${w}" height="62" fill="${P.waterDeep}"/>
            <rect x="${xs[1] - w / 2}" y="${topB + 62}" width="${w}" height="34" fill="${P.water}"/>
          </g>
          <g class="nx-f" ${AT(2)}>
            <rect x="${xs[1] - w / 2}" y="${topC}" width="${w}" height="${topB - topC}" fill="url(#nxNwH)" stroke="${P.gold}" stroke-width="2" stroke-dasharray="5 5"/>
            <rect x="${xs[2] - w / 2}" y="${topC}" width="${w}" height="${dueH}" rx="14" fill="url(#nxNwG)"/>
            <path d="M${xs[1] + w / 2 + 6} ${topC}H${xs[2] - w / 2 - 6}" stroke="${P.gold}" stroke-width="2" stroke-dasharray="3 6"/>
          </g>
          <rect x="110" y="${base}" width="672" height="4" rx="2" fill="${P.navy}" opacity=".85"/>
        </svg>
        <div class="nx-f" ${AT(0)}>${labA}</div>
        ${ctx.t('gap', { tag: 'div', cls: 'nx-seg dk nx-f', attrs: `style="left:${xs[1]}px;top:${(topC + topB) / 2}px" ${AT(2)}` })}
        ${ctx.t('kAll', { tag: 'div', cls: 'nx-col nx-f', attrs: `style="left:${xs[0]}px;top:${base + 18}px" ${AT(0)}` })}
        ${ctx.t('kCash', { tag: 'div', cls: 'nx-col nx-f', attrs: `style="left:${xs[1]}px;top:${base + 18}px" ${AT(1)}` })}
        ${ctx.t('kDue', { tag: 'div', cls: 'nx-col gold nx-f', attrs: `style="left:${xs[2]}px;top:${base + 18}px" ${AT(2)}` })}
        <div class="nx-rows">${['r1', 'r2', 'r3'].map((k, i) => `<div class="nx-row nx-f" ${AT(i)}><span class="n"><span class="num">${i + 1}</span></span>${ctx.t(k, { tag: 'p' })}</div>`).join('')}</div>
        ${ctx.t('close', { tag: 'p', cls: 'nx-rl serif nx-f', attrs: `style="top:672px" ${AT(3)}` })}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* =====================================================================
     17. calculator one: how much cash will the estate need?
     ===================================================================== */
  const PROFILES = {
    biz: { biz: 35e6, re: 6e6, inv: 3e6, ret: 2e6, cash: 1e6, home: 4e6, debt: 3e6, other: 2e6, ins: 0 },
    re: { biz: 0, re: 60e6, inv: 2e6, ret: 1e6, cash: 1.5e6, home: 5e6, debt: 18e6, other: 1e6, ins: 0 },
    inv: { biz: 0, re: 5e6, inv: 30e6, ret: 4e6, cash: 2e6, home: 5e6, debt: 1e6, other: 0.5e6, ins: 0 }
  };
  /** one statutory fee (personal representative, or attorney): California Probate Code 10800(a) and 10810(a).
      Computed on the gross value of the probate estate; above $25,000,000 the court sets a reasonable amount. */
  function probateFee(v) {
    const bands = [[100000, 0.04], [100000, 0.03], [800000, 0.02], [9000000, 0.01], [15000000, 0.005]];
    let left = Math.max(0, v), fee = 0;
    for (const [w, r] of bands) { const x = Math.min(left, w); fee += x * r; left -= x; if (left <= 0) break; }
    return { fee, over: Math.max(0, v - 25e6) };
  }
  /** federal estate tax and liquidity, 2026 rules. v: field values (money in dollars, rates as fractions) */
  function estateCalc(v) {
    const exemption = D('fed.estate.exemption', 15000000), rate = D('fed.estate.topRate', 0.40);
    const num = (x) => (isFinite(x) ? Math.max(0, x) : 0);
    const biz = num(v.biz), re = num(v.re), inv = num(v.inv), ret = num(v.ret), cash = num(v.cash), home = num(v.home);
    const debt = num(v.debt), other = num(v.other), ins = num(v.ins), adm = num(v.adm), rtx = Math.min(1, num(v.rtx));
    const gross = biz + re + inv + ret + cash + home;
    const excl = v.who === 'two' ? 2 * exemption : exemption;
    const admin = gross * adm;
    let prob = 0, over = 0;
    if (v.pass === 'prob') { const p = probateFee(gross - ret); prob = 2 * p.fee; over = p.over; }
    const settle = admin + prob;
    const taxable = Math.max(0, gross - debt - settle);
    const tax = rate * Math.max(0, taxable - excl);
    const due = tax + settle + other;
    const liquid = inv + cash + ret * (1 - rtx);
    const have = liquid + ins;
    const gap = Math.max(0, due - have);
    const big = [['biz', biz], ['re', re], ['home', home]].sort((a, b) => b[1] - a[1])[0];
    return { gross, excl, rate, admin, prob, over, settle, taxable, tax, due, liquid, ins, have, gap, sell: big[1] > 0 ? big[0] : 'home', share: have > 0 ? Math.min(1, due / have) : 1, reserve: Math.min(due, liquid) };
  }
  EFA.estateLiquidity = { calc: estateCalc, probateFee, profiles: PROFILES };

  EFA.screen('ng17', {
    title: 'How much cash will the estate need?',
    steps: 2,
    copy: {
      eb: 'Estate liquidity',
      h: 'How much cash will the estate need?',
      lProf: 'Profile', oBiz: 'Business owner', oRe: 'Real estate investor', oInv: 'Investor',
      lWho: 'Planning for', oOne: 'One person', oTwo: 'Married couple',
      lPass: 'Assets pass through', oTrust: 'Living trust', oProb: 'Probate',
      gHold: 'What the estate holds',
      fBiz: 'Business interests', fRe: 'Investment real estate', fInv: 'Stocks, bonds, and funds', fRet: 'Retirement accounts', fCash: 'Cash', fHome: 'Home and personal property', fDebt: 'Mortgages and other debts',
      gAlso: 'At death',
      fOther: 'Other cash needs', fIns: 'Life insurance in a family trust',
      fAdm: 'Settlement costs, estimate', fRtx: 'Tax on retirement withdrawals',
      tWorth: 'What the estate is worth', tDue: 'Cash the estate will need', tHave: 'Cash ready for the family', tGap: 'The gap',
      bNeed: 'Cash needed', bHave: 'Cash ready',
      kTax: 'Federal estate tax', kSet: 'Settlement costs', kProb: 'Probate fees', kOther: 'Other cash needs', kLiq: 'Liquid assets, after tax', kIns: 'Life insurance in trust', kGap: 'The gap',
      over: 'Probate fees shown through $25 million. Above that amount, the court sets the fee.',
      sellBiz: 'Without new cash, the family may have to sell part of the business to pay the bill.',
      sellRe: 'Without new cash, the family may have to sell real estate to pay the bill.',
      sellHome: 'Without new cash, the family may have to sell the home to pay the bill.',
      useA: 'No forced sale. Still, the bill would take', useB: 'of the cash ready for the family.',
      src: '2026 federal rules: $15,000,000 exclusion per person (IRS, IR-2025-103) and a 40% top rate (26 U.S.C. 2001(c)); taxable estate after debts and settlement costs (26 U.S.C. 2053). Married couple: both exclusions, assuming the portability election is made at the first death (26 U.S.C. 2010(c)). Probate fees: California Probate Code 10800 and 10810. State estate and inheritance taxes are not included.',
      _notes: 'Pick the profile that fits, then change any number. Every figure is hypothetical until it is theirs.\n\n- Estate tax: 40% of the taxable estate above the exclusion. 2026 exclusion: $15,000,000 per person. A married couple can use both exclusions when the portability election is made on a timely return at the first death; this models the second death. Assumes no taxable gifts during life.\n- Taxable estate: everything owned, less debts and settlement costs (26 U.S.C. 2053).\n- Probate: California statutory fees for the personal representative and for the attorney, each figured on the gross value of the probate estate, with debts not subtracted (Probate Code 10800, 10810). Above $25,000,000 the court sets the fee; that part is not included here. Retirement accounts pass by beneficiary designation and are left out of the probate base.\n- Settlement costs (estimate): appraisals, legal, accounting, and trustee costs. Change it to fit.\n- Retirement accounts count after income tax on withdrawals (estimate).\n- Life insurance owned by a properly structured family trust sits outside the taxable estate and is cash ready for the family.\n\n- Ask: Which of these numbers surprised you?\nPAUSE'
    },
    render(ctx) {
      const p0 = PROFILES.biz;
      const money = (id, label, value) => ctx.field({ id, label, type: 'money', value, min: 0 });
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h', sm: true })}
        <div class="nx-chs">
          ${ctx.choice({ id: 'prof', label: 'lProf', options: [{ value: 'biz', key: 'oBiz' }, { value: 're', key: 'oRe' }, { value: 'inv', key: 'oInv' }], value: 'biz' })}
          ${ctx.choice({ id: 'who', label: 'lWho', options: [{ value: 'one', key: 'oOne' }, { value: 'two', key: 'oTwo' }], value: 'two' })}
          ${ctx.choice({ id: 'pass', label: 'lPass', options: [{ value: 'trust', key: 'oTrust' }, { value: 'prob', key: 'oProb' }], value: 'trust' })}
        </div>
        <div class="nx-card nx-form nx-fr" style="left:110px;top:238px;width:650px;height:560px">
          ${ctx.t('gHold', { tag: 'div', cls: 'nx-gt' })}
          ${money('biz', 'fBiz', p0.biz)}${money('re', 'fRe', p0.re)}${money('inv', 'fInv', p0.inv)}${money('ret', 'fRet', p0.ret)}${money('cash', 'fCash', p0.cash)}${money('home', 'fHome', p0.home)}${money('debt', 'fDebt', p0.debt)}
          ${ctx.t('gAlso', { tag: 'div', cls: 'nx-gt mt' })}
          ${money('other', 'fOther', p0.other)}${money('ins', 'fIns', p0.ins)}
          <div class="nx-asm">
            ${ctx.field({ id: 'adm', label: 'fAdm', type: 'pct', value: 0.01, min: 0, max: 0.2, dp: 1 })}
            ${ctx.field({ id: 'rtx', label: 'fRtx', type: 'pct', value: 0.40, min: 0, max: 0.7, dp: 0 })}
          </div>
        </div>
        <div class="nx-tiles" style="left:790px;top:238px;width:700px">
          <div class="nx-tile">${ctx.t('tWorth', { tag: 'span', cls: 'k' })}<span class="v" data-nv="worth"></span></div>
          <div class="nx-tile navy">${ctx.t('tDue', { tag: 'span', cls: 'k' })}<span class="v" data-nv="due"></span></div>
          <div class="nx-tile nx-f" ${AT(1)}>${ctx.t('tHave', { tag: 'span', cls: 'k' })}<span class="v" data-nv="have"></span></div>
          <div class="nx-tile gold nx-f" ${AT(1)}>${ctx.t('tGap', { tag: 'span', cls: 'k' })}<span class="v" data-nv="gap"></span></div>
        </div>
        <div class="nx-card nx-bars" style="left:790px;top:448px;width:700px;height:262px">
          <div class="nx-bl">${ctx.t('bNeed')}<b data-nv="due2"></b></div>
          <div class="nx-bar" data-bar="need"><i data-s="tax" style="background:${P.navy}"></i><i data-s="prob" style="background:${P.navy3}"></i><i data-s="set" style="background:${P.navy4}"></i><i data-s="other" style="background:${P.steel}"></i></div>
          <div class="nx-f" ${AT(1)} style="display:grid;gap:8px">
            <div class="nx-bl">${ctx.t('bHave')}<b data-nv="have2"></b></div>
            <div class="nx-bar" data-bar="have"><i data-s="liq" style="background:${P.water}"></i><i data-s="ins" style="background:${P.gold}"></i><i data-s="gap" class="gap"></i></div>
          </div>
          <div class="nx-leg">
            <span><i style="background:${P.navy}"></i>${ctx.t('kTax')}<b data-nv="tax"></b></span>
            <span class="nx-f" ${AT(1)}><i style="background:${P.water}"></i>${ctx.t('kLiq')}<b data-nv="liq"></b></span>
            <span><i style="background:${P.navy4}"></i>${ctx.t('kSet')}<b data-nv="set"></b></span>
            <span class="nx-f" ${AT(1)}><i style="background:${P.gold}"></i>${ctx.t('kIns')}<b data-nv="ins"></b></span>
            <span data-show="prob"><i style="background:${P.navy3}"></i>${ctx.t('kProb')}<b data-nv="prob"></b></span>
            <span data-show="noprob"><i style="background:${P.steel}"></i>${ctx.t('kOther')}<b data-nv="other"></b></span>
            <span data-show="prob"><i style="background:${P.steel}"></i>${ctx.t('kOther')}<b data-nv="other2"></b></span>
            <span class="nx-f" ${AT(1)}><i class="gap"></i>${ctx.t('kGap')}<b data-nv="gap2"></b></span>
          </div>
          ${ctx.t('over', { tag: 'p', cls: 'nx-note', attrs: 'data-show="over"' })}
        </div>
        <div class="nx-f" ${AT(1)}>
          ${ctx.t('sellBiz', { tag: 'p', cls: 'nx-say serif', attrs: 'data-say="biz" style="left:790px;top:716px;width:700px"' })}
          ${ctx.t('sellRe', { tag: 'p', cls: 'nx-say serif', attrs: 'data-say="re" style="left:790px;top:716px;width:700px"' })}
          ${ctx.t('sellHome', { tag: 'p', cls: 'nx-say serif', attrs: 'data-say="home" style="left:790px;top:716px;width:700px"' })}
          <p class="nx-say serif" data-say="ok" style="left:790px;top:716px;width:700px">${ctx.t('useA', { tag: 'span' })} ${V('share')} ${ctx.t('useB', { tag: 'span' })}</p>
        </div>
        ${src(ctx, 'src', 'up')}
        ${disc(['hypothetical', 'notAdvice'])}`;

      let lastProf = ctx.values().prof;
      const paint = (vals) => {
        const r = estateCalc(vals);
        setV(ctx, 'worth', mny(r.gross)); setV(ctx, 'due', mny(r.due)); setV(ctx, 'due2', mny(r.due));
        setV(ctx, 'have', mny(r.have)); setV(ctx, 'have2', mny(r.have));
        setV(ctx, 'gap', mny(r.gap)); setV(ctx, 'gap2', mny(r.gap));
        setV(ctx, 'tax', mny(r.tax)); setV(ctx, 'set', mny(r.admin)); setV(ctx, 'prob', mny(r.prob));
        setV(ctx, 'other', mny(vals.other)); setV(ctx, 'other2', mny(vals.other));
        setV(ctx, 'liq', mny(r.liquid)); setV(ctx, 'ins', mny(r.ins)); setV(ctx, 'share', pct0(r.share));
        const scale = 652 / Math.max(r.due, r.have, 1);
        const wpx = (x) => Math.max(0, x * scale).toFixed(1) + 'px';
        const set = (bar, s, x) => { const n = ctx.$(`[data-bar="${bar}"] [data-s="${s}"]`); if (n) n.style.width = wpx(x); };
        set('need', 'tax', r.tax); set('need', 'prob', r.prob); set('need', 'set', r.admin); set('need', 'other', Math.max(0, vals.other || 0));
        set('have', 'liq', r.liquid); set('have', 'ins', r.ins); set('have', 'gap', r.gap);
        const isProb = vals.pass === 'prob';
        ctx.$$('[data-show="prob"]').forEach((n) => n.classList.toggle('nx-hide', !isProb));
        ctx.$$('[data-show="noprob"]').forEach((n) => n.classList.toggle('nx-hide', isProb));
        ctx.$$('[data-show="over"]').forEach((n) => n.classList.toggle('nx-hide', !(isProb && r.over > 0)));
        const say = r.gap > 0 ? r.sell : 'ok';
        ctx.$$('[data-say]').forEach((n) => n.classList.toggle('nx-hide', n.dataset.say !== say));
        CD.set('ng.due', r.due); CD.set('ng.gap', r.gap); CD.set('ng.reserve', r.reserve);
      };
      ctx.onFields((vals) => {
        if (vals.prof !== lastProf) {
          lastProf = vals.prof;
          const p = PROFILES[vals.prof] || PROFILES.biz;
          Object.keys(p).forEach((k) => ctx.setField(k, p[k]));
          vals = ctx.values();
        }
        paint(vals);
      });
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* =====================================================================
     18. three ways to fill the gap
     ===================================================================== */
  function card3(ctx, o) {
    return `<div class="nx-card nx-c3${o.gold ? ' gold' : ''} nx-f" ${AT(o.at)} style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px">
      <span class="nx-ic">${o.icon}</span>
      ${ctx.t(o.cap, { tag: 'div', cls: 'nx-cap' })}
      ${ctx.t(o.title, { tag: 'h3', cls: 'nx-ct serif' })}
      ${ctx.t(o.body, { tag: 'p', cls: 'nx-cb' })}
      ${o.note ? ctx.t(o.note, { tag: 'p', cls: 'nx-cn' }) : ''}
    </div>`;
  }
  EFA.screen('ng18', {
    title: 'Three ways to fill the gap',
    steps: 4,
    copy: {
      eb: 'Filling the gap',
      h: 'Three ways to fill the gap.',
      c1: 'Option one', t1: 'Sell something', b1: 'A business, a building, or a position sold on a deadline and on the buyer’s terms. Selling fast rarely brings full value.',
      c2: 'Option two', t2: 'Borrow, or pay over time', b2: 'Loans against what the family owns, or the tax paid in installments where the estate qualifies. Interest runs, and the burden lands on the family.',
      c3: 'Option three', t3: 'Pour the floor first', b3: 'Cash arranged now, owned by a trust built for the family, and ready on the day it is needed.',
      n1: 'Who sets the terms: the buyer.', n2: 'Who sets the terms: the lender, and the rules.', n3: 'Who sets the terms: you, today.',
      close: 'Only one of these is chosen in advance, while you are here to choose it.',
      _notes: 'Three ways to fill the gap. Only the third is decided ahead of time.\n\n- Selling: on a deadline, and on the buyer’s terms.\n- Borrowing or installments: when a closely held business is more than 35% of the adjusted gross estate, the executor may elect to pay part or all of the estate tax in 2 to 10 equal installments (26 U.S.C. 6166). Interest applies, and the family carries the obligation.\n- The floor: life insurance owned by a family trust, arranged now.\n\n- Ask: Which of these would you want your family to face?\nPAUSE'
    },
    render(ctx) {
      const y = 240, w = 410, h = 420, xs = [110, 595, 1080];
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        ${card3(ctx, { at: 0, x: xs[0], y, w, h, icon: IC.tag, cap: 'c1', title: 't1', body: 'b1', note: 'n1' })}
        ${card3(ctx, { at: 1, x: xs[1], y, w, h, icon: IC.bank, cap: 'c2', title: 't2', body: 'b2', note: 'n2' })}
        ${card3(ctx, { at: 2, x: xs[2], y, w, h, icon: IC.floor, cap: 'c3', title: 't3', body: 'b3', note: 'n3', gold: true })}
        ${line(ctx, 'close', 712, { at: 3 })}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* =====================================================================
     19. the trust that holds the floor (irrevocable life insurance trust)
     ===================================================================== */
  function node(ctx, o) {
    return `<div class="nx-card nx-node${o.gold ? ' gold' : ''} nx-f" ${AT(o.at)} style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px">
      <div class="hdr">${o.icon || ''}${ctx.t(o.title, { tag: 'h3', cls: 'nx-ct serif' })}</div>
      ${o.cap ? ctx.t(o.cap, { tag: 'div', cls: 'nx-cap' }) : ''}
      ${ctx.t(o.body, { tag: 'p', cls: 'nx-cb' })}
    </div>`;
  }
  EFA.screen('ng19', {
    title: 'The trust that holds the floor',
    steps: 5,
    copy: {
      eb: 'The family trust',
      h: 'The trust that holds the floor.',
      tYou: 'You', bYou: 'Create the trust and make gifts to it.',
      tTrust: 'Irrevocable life insurance trust', cTrust: 'Owner and beneficiary', bTrust: 'A trustee you choose runs it under the rules you write.',
      tPol: 'Life insurance policy', bPol: 'Owned by the trust and payable to the trust.',
      tFam: 'Your family', bFam: 'Receives the benefit through the trust, on the terms you set.',
      aGift: 'Gifts', aPrem: 'Premiums or\nloan interest', aDb: 'At death,\nthe benefit', aFam: 'For the next\ngeneration',
      tag: 'Outside your taxable estate, when designed and run properly',
      k1: 'The trust owns it, not you.', d1: 'Keeping ownership rights in the policy can pull the benefit back into your taxable estate.',
      k2: 'Start new when you can.', d2: 'A policy you transfer in is pulled back into the estate if death comes within three years.',
      k3: 'Run it as designed.', d3: 'Gifts, payments, and records handled the way your attorney sets them up.',
      src: 'Sources: 26 U.S.C. 2042 and 2035; Allianz Life, “Using premium financing for estate planning strategies” (CSI-540, R-7/2026).',
      _notes: 'The trust is what keeps the floor outside the taxable estate.\n\n- An irrevocable life insurance trust owns the policy and is its beneficiary. When the insured holds no incidents of ownership, the proceeds are not pulled into the gross estate under 26 U.S.C. 2042.\n- Moving an existing policy into the trust: if death comes within three years of the transfer, the proceeds are included (26 U.S.C. 2035). A new policy bought by the trust avoids that.\n- Allianz’s premium finance case study: “Designed properly, the death benefits will not be included in Michelle’s estate for estate tax purposes” (CSI-540).\n- With financing, the trust is the borrower, and gifts to the trust can cover the interest (CSI-540; John Hancock LIFE-7230).\n\n- Ask: Who would you trust to be the trustee?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        <svg class="nx-full" viewBox="0 0 1600 900" aria-hidden="true">
          <defs>${arrowDef('nxTrA', P.gold)}${arrowDef('nxTrN', P.navy3)}</defs>
          <path class="nx-f" ${AT(0)} d="M412 318H560" stroke="${P.gold}" stroke-width="3.5" fill="none" marker-end="url(#nxTrA)"/>
          <path class="nx-f" ${AT(1)} d="M700 408V470" stroke="${P.navy3}" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round" fill="none" marker-end="url(#nxTrN)"/>
          <path class="nx-f" ${AT(2)} d="M916 528C1000 528 1000 360 924 360" stroke="${P.gold}" stroke-width="3.5" fill="none" marker-end="url(#nxTrA)"/>
          <path class="nx-f" ${AT(3)} d="M920 300H1080" stroke="${P.gold}" stroke-width="3.5" fill="none" marker-end="url(#nxTrA)"/>
        </svg>
        ${node(ctx, { at: 0, x: 110, y: 246, w: 300, h: 150, icon: IC.you, title: 'tYou', body: 'bYou' })}
        ${node(ctx, { at: 0, x: 566, y: 230, w: 350, h: 178, gold: true, icon: IC.trust, title: 'tTrust', cap: 'cTrust', body: 'bTrust' })}
        ${node(ctx, { at: 1, x: 566, y: 476, w: 350, h: 128, icon: IC.policy, title: 'tPol', body: 'bPol' })}
        ${node(ctx, { at: 3, x: 1088, y: 236, w: 400, h: 150, icon: IC.people, title: 'tFam', body: 'bFam' })}
        ${ctx.t('aGift', { tag: 'div', cls: 'nx-al nx-f', attrs: `style="left:446px;top:284px" ${AT(0)}` })}
        ${ctx.t('aPrem', { tag: 'div', cls: 'nx-al nx-f', attrs: `style="left:420px;top:424px;text-align:right;width:260px;color:var(--navy-3)" ${AT(1)}` })}
        ${ctx.t('aDb', { tag: 'div', cls: 'nx-al nx-f', attrs: `style="left:1004px;top:420px" ${AT(2)}` })}
        ${ctx.t('aFam', { tag: 'div', cls: 'nx-al nx-f', attrs: `style="left:946px;top:256px;font-size:12.5px" ${AT(3)}` })}
        ${ctx.t('tag', { tag: 'div', cls: 'nx-tag nx-f', attrs: `style="left:1088px;top:498px;width:400px" ${AT(2)}` })}
        <div class="nx-rule3">${[1, 2, 3].map((i) => `<div class="nx-f" ${AT(4)}>${ctx.t('k' + i, { tag: 'p', cls: 'k serif' })}${ctx.t('d' + i, { tag: 'p', cls: 'd' })}</div>`).join('')}</div>
        ${src(ctx, 'src', 'up')}
        ${disc(['tax', 'notAdvice'])}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* =====================================================================
     20. trusts, each with a job
     ===================================================================== */
  EFA.screen('ng20', {
    title: 'Trusts, each with a job',
    steps: 5,
    copy: {
      eb: 'Trusts',
      h: 'Trusts, each with a job.',
      c1: 'Avoids probate', t1: 'Revocable living trust', b1: 'Holds the assets you title to it, so they can pass to your family without probate court.', n1: 'You can change it at any time, so its assets stay in your taxable estate.',
      c2: 'Holds the floor', t2: 'Irrevocable life insurance trust', b2: 'Owns the policy, so the benefit can stay outside your taxable estate.', n2: 'Built to be permanent, so it is planned carefully.',
      c3: 'Gives, and pays you', t3: 'Charitable remainder trust', b3: 'Pays you income for life or for up to 20 years. What remains goes to the causes you choose.', n3: 'Pairs with a family trust that replaces the gift for your heirs.',
      c4: 'Carries it forward', t4: 'Long-term family trust', b4: 'Holds wealth for children and grandchildren under the rules you set.', n4: 'Your attorney sets how long it lasts and how it distributes.',
      close: 'Your attorney drafts them. We fund the one that holds the floor.',
      src: 'Sources: California Courts Self-Help Guide, “When formal probate may not be needed”; 26 U.S.C. 2038 and 2042; Internal Revenue Service, “Charitable Remainder Trusts.”',
      _notes: 'Each trust has one job. The estate planning attorney drafts them; we coordinate the life insurance.\n\n- Revocable living trust: property in a living trust can pass to named beneficiaries without going to probate court (California Courts Self-Help Guide). Because the grantor keeps the power to revoke or amend it, its assets stay in the gross estate (26 U.S.C. 2038).\n- Irrevocable life insurance trust: owns the policy; the insured keeps no incidents of ownership (26 U.S.C. 2042).\n- Charitable remainder trust: income for life or a term of up to 20 years, with the remainder to qualified charities (IRS).\n- Long-term family trust: duration, distribution, and generation-skipping questions belong to the attorney.\n\n- Ask: Which of these do you already have in place, and when were they last reviewed?\nPAUSE'
    },
    render(ctx) {
      const y = 232, w = 330, h = 452, xs = [110, 460, 810, 1160], ic = [IC.court, IC.trust, IC.heart, IC.tree];
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        ${[1, 2, 3, 4].map((i) => `<div class="nx-card nx-c4${i === 2 ? ' gold' : ''} nx-f" ${AT(i - 1)} style="left:${xs[i - 1]}px;top:${y}px;width:${w}px;height:${h}px">
          <span class="nx-ic">${ic[i - 1]}</span>
          ${ctx.t('c' + i, { tag: 'div', cls: 'nx-cap' })}
          ${ctx.t('t' + i, { tag: 'h3', cls: 'nx-ct serif' })}
          ${ctx.t('b' + i, { tag: 'p', cls: 'nx-cb' })}
          ${ctx.t('n' + i, { tag: 'p', cls: 'nx-cn' })}
        </div>`).join('')}
        ${line(ctx, 'close', 712, { at: 4, cls: 'sm' })}
        ${src(ctx, 'src', 'up')}
        ${disc(['notAdvice'])}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* =====================================================================
     21. calculator two: the floor, financed (quick estimate and sample cases)
     ===================================================================== */
  /* Loan engine ported from tool-premium-finance-ledger.html, which reproduces Allianz CSI-540 (R-7/2026)
     to the dollar: bank loan interest, balance, collateral at 90% of cash value, the year-20 exit into a
     policy loan, and net death benefit. Policy values are the case study's nonguaranteed values. */
  const CSI540 = {
    premium: 1412110, premYears: 10, clientPay: 300000, payYears: 10,
    specAmount: 19000000, dbOption: 'B', advance: 0.90, exitYear: 20, polLoanRate: 0.05, years: 30,
    rates: [5.00, 5.54, 5.52, 5.65, 5.82, 5.96, 6.07, 6.15, 6.20, 6.24, 6.26, 6.27, 6.28, 6.29],
    av: [1281828, 2703716, 4213891, 5817721, 7523050, 9336971, 11266975, 13320933, 15508092, 17837449,
      18889210, 20008936, 21200895, 22469356, 23818301, 25307042, 26881983, 28546774, 30304291, 32157807,
      34110976, 36167472, 38331481, 40605369, 42991175, 45487397, 48111426, 50866913, 53754044, 56772333],
    csv: [829153, 2264341, 3787721, 5404756, 7123100, 8950036, 10892960, 13009333, 15258812, 17650489,
      18764570, 19946616, 21200895, 22469356, 23818301, 25307042, 26881983, 28546774, 30304291, 32157807,
      34110976, 36167472, 38331481, 40605369, 42991175, 45487397, 48111426, 50866913, 53754044, 56772333]
  };
  function pfRun(c) {
    const rows = []; let bal = 0, polLoan = 0;
    for (let y = 1; y <= c.years; y++) {
      const beforeExit = y < c.exitYear, atExit = y === c.exitYear;
      const prem = (beforeExit && y <= c.premYears) ? c.premium : 0;
      const pay = (beforeExit && y <= c.payYears) ? c.clientPay : 0;
      const rate = c.rates[Math.min(y, c.rates.length) - 1];
      let interest = 0, balEnd = 0;
      if (beforeExit) { const b = bal + prem; interest = b * rate; balEnd = b + interest - pay; bal = balEnd; }
      else if (atExit) { polLoan = bal * (1 + c.polLoanRate); bal = 0; }
      else { polLoan += polLoan * c.polLoanRate; }
      const av = c.av[y - 1] !== undefined ? c.av[y - 1] : 0, csv = c.csv[y - 1] !== undefined ? c.csv[y - 1] : 0;
      const grossDB = c.dbOption === 'B' ? c.specAmount + av : c.specAmount;
      const collat = beforeExit ? Math.max(0, balEnd - c.advance * csv) : 0;
      const debt = beforeExit ? balEnd : polLoan;
      rows.push({ y, prem, pay, rate, interest, balEnd, av, csv, collat, polLoan: beforeExit ? 0 : polLoan, debt, grossDB, netDB: grossDB - debt });
    }
    const paying = Math.min(c.premYears, c.exitYear - 1), cashYears = Math.min(c.payYears, c.exitYear - 1);
    const totalPrem = c.premium * Math.max(0, paying), totalCash = c.clientPay * Math.max(0, cashYears);
    let peak = { collat: 0, y: 0 }; rows.forEach((r) => { if (r.collat > peak.collat) peak = r; });
    const exitRow = rows.find((r) => r.y === c.exitYear) || rows[rows.length - 1];
    const lapse = rows.find((r) => r.y >= c.exitYear && r.polLoan > r.csv);
    return { rows, totalPrem, totalCash, share: totalPrem > 0 ? totalCash / totalPrem : 0, peak, exitRow, lapseYear: lapse ? lapse.y : null };
  }
  /** the CSI-540 case, every dollar amount scaled by k, bank rates raised by bump (a fraction) */
  function pfCase(k, bump) {
    const rates = CSI540.rates.map((x) => x / 100 + (bump || 0));
    while (rates.length < CSI540.years) rates.push(rates[rates.length - 1]);
    return pfRun({
      premium: CSI540.premium * k, premYears: CSI540.premYears, clientPay: CSI540.clientPay * k, payYears: CSI540.payYears,
      specAmount: CSI540.specAmount * k, dbOption: CSI540.dbOption, advance: CSI540.advance, exitYear: CSI540.exitYear,
      polLoanRate: CSI540.polLoanRate, years: CSI540.years, rates,
      av: CSI540.av.map((x) => x * k), csv: CSI540.csv.map((x) => x * k)
    });
  }
  const PF_BASE_NET1 = pfCase(1, 0).rows[0].netDB; // 19,099,112: year-one net death benefit in CSI-540
  EFA.pfEngine = { run: pfRun, csi540: pfCase, baseNet1: PF_BASE_NET1 };

  /* Sample cases. Every number is the source's printed ledger value, not modeled here.
     row = [year, premium, your cash in, lender's loan balance (0 once repaid), death benefit net of loans,
            collateral needed beyond the policy, 1 in the year the lender is repaid]
     cs:  Allianz Life CSI-540 (R-7/2026) case study ledger.
     est: PremiumLife Plus sample design, June 9, 2026, "FOR ISSUE" estate design at a 20.6% client share. */
  const SAMPLES = [
    { key: 'cs', facts: ['a', 'b', 'c', 'd', 'e', 'f'], rows: [[1,1412110,300000,1182716,19099112,436478,0],[2,1412110,300000,2438579,19265137,400672,0],[3,1412110,300000,3763247,19450644,354298,0],[4,1412110,300000,5167765,19649956,303484,0],[5,1412110,300000,6662823,19860227,252033,0],[6,1412110,300000,8256199,20080772,201166,0],[7,1412110,300000,9955176,20311799,151512,0],[8,1412110,300000,11766374,20554560,57974,0],[9,1412110,300000,13695550,20812542,0,0],[10,1412110,300000,15750378,21087071,0,0],[11,0,0,16736351,21152858,0,0],[12,0,0,17785720,21223215,0,0],[13,0,0,18902664,21298231,0,0],[14,0,0,20091641,21377714,0,0],[15,0,0,21355406,21462895,0,0],[16,0,0,22698661,21608381,0,0],[17,0,0,24126406,21755577,0,0],[18,0,0,25643957,21902816,0,0],[19,0,0,27256962,22047329,0,0],[20,0,0,0,22537997,0,1],[21,0,0,0,23060175,0,0],[22,0,0,0,23614131,0,0],[23,0,0,0,24200473,0,0],[24,0,0,0,24817811,0,0],[25,0,0,0,25464239,0,0],[26,0,0,0,26134114,0,0],[27,0,0,0,26840478,0,0],[28,0,0,0,27582418,0,0],[29,0,0,0,28355325,0,0],[30,0,0,0,29153678,0,0]] },
    { key: 'est', facts: ['a', 'c', 'd', 'e', 'f', 'g', 'h'], rows: [[1,800000,110000,731975,9941361,400888,0],[2,800000,110000,1509438,9874494,473420,0],[3,800000,110000,2338366,9903026,593476,0],[4,800000,110000,3226409,9936533,627289,0],[5,800000,110000,4181262,9973639,663971,0],[6,800000,110000,5211990,10010836,707493,0],[7,800000,110000,6324458,10048229,758062,0],[8,800000,110000,7528647,10082135,783835,0],[9,800000,110000,8831941,10111804,821970,0],[10,800000,110000,10245084,10133760,876740,0],[11,0,110000,10911938,10193453,833681,0],[12,0,110000,11637573,10249794,798511,0],[13,0,110000,12425187,10303670,770631,0],[14,0,110000,13283017,10351553,799811,0],[15,0,110000,14209441,10399991,833955,0],[16,0,0,14929781,10768724,482732,0],[17,0,0,0,11002919,0,1],[18,0,0,0,11259471,0,0],[19,0,0,0,11539699,0,0],[20,0,0,0,11844956,0,0],[21,0,0,0,12176779,0,0],[22,0,0,0,12536804,0,0],[23,0,0,0,12926636,0,0],[24,0,0,0,13348141,0,0],[25,0,0,0,13801786,0,0],[26,0,0,0,14287860,0,0],[27,0,0,0,14811909,0,0],[28,0,0,0,15376272,0,0],[29,0,0,0,15983202,0,0],[30,0,0,0,16635367,0,0]] }
  ];
  const SAMPLE_COPY = {
    c_cs: 'Allianz case study', n_cs: 'Allianz case study: a $20 million floor',
    fa_cs: 'Insured', va_cs: 'Woman, 53 (hypothetical)',
    fb_cs: 'Policy', vb_cs: 'Allianz Life Accumulator IUL',
    fc_cs: 'Death benefit', vc_cs: '$20,281,828 at issue',
    fd_cs: 'Premiums', vd_cs: '$1,412,110 a year for 10 years, paid by the lender',
    fe_cs: 'Your cash', ve_cs: '$300,000 a year for 10 years',
    ff_cs: 'Lender repaid', vf_cs: 'Year 20, from the policy’s cash value',
    src_cs: 'Source: Allianz Life, “Using premium financing for estate planning strategies” (CSI-540, R-7/2026). Hypothetical client; 5.5% nonguaranteed illustrated rate. At the guaranteed minimum interest rate and maximum charges, the policy would lapse in year 21.',
    c_est: 'Estate design, $10 million', n_est: 'A $10 million estate design',
    fa_est: 'Insured', va_est: 'Man, 50, preferred plus (hypothetical)',
    fc_est: 'Face amount', vc_est: '$10,000,000 at issue',
    fd_est: 'Premiums', vd_est: '$800,000 a year for 10 years, paid by the lender',
    fe_est: 'Your cash', ve_est: '$110,000 a year for 15 years',
    ff_est: 'Lender repaid', vf_est: 'Year 17',
    fg_est: 'Assumptions', vg_est: 'Crediting 0% in years 1 and 2, then 6.69%. Loan rate 6.00%, rising to 7.76%.',
    fh_est: 'Stress test', vh_est: 'At 0% crediting every year: $7,613,438 more of your cash in year 17, and the benefit falls to $0.',
    src_est: 'Source: PremiumLife Plus sample design for a hypothetical client on an Allianz Life Accumulator IUL, dated June 9, 2026. Rates and values are hypothetical projections, not guaranteed. A design must be accompanied by the carrier’s illustration.'
  };

  EFA.screen('ng21', {
    title: 'The floor, financed',
    steps: 2,
    copy: Object.assign({
      eb: 'Premium finance',
      h: 'What the floor looks like with a lender.',
      mEst: 'Quick estimate', mCase: 'Sample cases',
      lBump: 'Bank rates', r0: 'As illustrated', r1: 'Up 1 point', r2: 'Up 2 points',
      lCase: 'Case',
      fNeed: 'Cash the family needs',
      useGap: 'Use the gap', useDue: 'Use the full need',
      basis: 'Sized from Allianz Life’s published case study: a hypothetical woman, age 53, with ten annual premiums paid by a lender, interest paid by the trust for ten years, and the lender repaid from the policy in year 20.',
      shareA: 'Your share:', shareB: 'of the planned premium',
      stT: 'Stress test: bank rates', stH1: 'Family, year 20', stH2: 'Peak collateral',
      stF: '* At these rates the policy loan would pass the policy’s cash value at the exit. The plan would need more cash, more collateral, or a different exit.',
      tPrem: 'Premiums the lender pays', tCash: 'Your cash in', tColl: 'Peak collateral beyond the policy', tNetA: 'The family receives, year',
      sPrem: 'a year for 10 years', sCash: 'a year for 10 years', sCollA: 'in year', sCollNone: 'none needed', sNet: 'after the lender is repaid', sNetVs: 'as illustrated:',
      kNet: 'Death benefit, net of the loan', kLoan: 'Loan balance', kCash: 'Your cash in, to date',
      exit: 'Lender repaid',
      levA: 'Each $1 of your cash becomes about', levB: 'for the family once the lender is repaid.',
      lapseA: 'At these bank rates, the policy loan would pass the policy’s cash value in year', lapseB: '. The plan would need more cash, more collateral, or a different exit.',
      noLapse: 'Even at these bank rates, the policy carries its loan through year 30 on the illustrated values. Collateral and your share rise.',
      srcEst: 'Scaled from Allianz Life, “Using premium financing for estate planning strategies” (CSI-540, R-7/2026): Allianz Life Accumulator IUL, 5.5% nonguaranteed illustrated rate. At the guaranteed minimum interest rate and maximum charges, the illustrated policy would lapse in year 21. Values scale in proportion to the amount needed; an illustration for you will differ.',
      _notes: 'Two ways to show it. Quick estimate sizes the floor to their number. Sample cases show real illustration designs.\n\n- Quick estimate: Allianz’s CSI-540 case study (hypothetical woman, 53, Allianz Life Accumulator IUL, $20,281,828 initial death benefit, ten annual premiums of $1,412,110 paid by the lender, $300,000 a year of interest paid by the trust for ten years, lender repaid from policy cash value in year 20; $22,537,997 net death benefit in year 20). Every dollar scales in proportion to the amount needed. The bank-rate choice raises every bank rate by one or two points to show the stress.\n- On guaranteed assumptions (0.10% minimum interest, maximum charges) the CSI-540 policy would lapse in year 21. Say it plainly.\n- Your share: Allianz requires the client’s out-of-pocket contribution to be at least 20% of the total planned premium on its premium finance cases (ASI-466, producer guide; not for client use).\n- Sample cases, values exactly as printed: the CSI-540 ledger, and a PremiumLife Plus “FOR ISSUE” estate design (man, 50, $10,000,000 face, 20.6% client share, lender repaid in year 17). That design’s own stress page shows that at 0% crediting in every year, the client would pay $7,613,438 more at payoff and the benefit falls to $0. Show it; it is the honest version.\n\n- Ask: What would it mean to have that number in place starting this year?\nPAUSE'
    }, SAMPLE_COPY),
    render(ctx) {
      const hasCases = SAMPLES.length > 0;
      const due = CD.get('ng.due', null), gap = CD.get('ng.gap', null);
      const chip = (kind, key, v) => (v > 0 ? `<button type="button" class="nx-chip" data-fill="${kind}">${ctx.t(key, { tag: 'span' })} <b>${mny(v)}</b></button>` : '');
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h', sm: true })}
        <div class="nx-chs">
          ${hasCases ? ctx.choice({ id: 'mode', options: [{ value: 'est', key: 'mEst' }, { value: 'case', key: 'mCase' }], value: 'est' }) : ''}
          <div data-mode="est">${ctx.choice({ id: 'bump', label: 'lBump', options: [{ value: 0, key: 'r0' }, { value: 1, key: 'r1' }, { value: 2, key: 'r2' }], value: 0 })}</div>
          ${hasCases ? `<div data-mode="case">${ctx.choice({ id: 'sc', label: 'lCase', options: SAMPLES.map((s) => ({ value: s.key, key: 'c_' + s.key })), value: SAMPLES[0].key })}</div>` : ''}
        </div>
        <div class="nx-card nx-pl" style="left:110px;top:232px;width:470px">
          <div data-mode="est" style="display:grid;gap:12px">
            ${ctx.field({ id: 'need', label: 'fNeed', type: 'money', value: due > 0 ? due : 10000000, min: 1000000, max: 500000000 })}
            <div class="nx-chips">${chip('gap', 'useGap', gap)}${chip('due', 'useDue', due)}</div>
            ${ctx.t('basis', { tag: 'p', cls: 'nx-p mt' })}
            <table class="nx-st"><thead><tr><th>${ctx.t('stT')}</th><th>${ctx.t('stH1')}</th><th>${ctx.t('stH2')}</th></tr></thead>
              <tbody>${[0, 1, 2].map((b) => `<tr data-b="${b}"><td>${ctx.t('r' + b)}</td><td>${V('st' + b + 'n')}${V('st' + b + 'x', 'star')}</td><td>${V('st' + b + 'c')}</td></tr>`).join('')}</tbody></table>
            ${ctx.t('stF', { tag: 'p', cls: 'nx-p xs', attrs: 'data-el="stF"' })}
          </div>
          ${SAMPLES.map((s) => `<div data-mode="case" data-case="${s.key}" style="display:grid;gap:12px">
            ${ctx.t('n_' + s.key, { tag: 'h3', cls: 'nx-ctitle serif' })}
            <dl class="nx-dl">${s.facts.map((f) => `${ctx.t('f' + f + '_' + s.key, { tag: 'dt' })}${ctx.t('v' + f + '_' + s.key, { tag: 'dd' })}`).join('')}</dl>
          </div>`).join('')}
          <div class="nx-ok" data-el="share"><i>${IC.check}</i><span>${ctx.t('shareA', { tag: 'span' })} ${V('share')} ${ctx.t('shareB', { tag: 'span' })}</span></div>
        </div>
        <div class="nx-tiles cmp" style="left:610px;top:232px;width:880px">
          <div class="nx-tile">${ctx.t('tPrem', { tag: 'span', cls: 'k' })}<span class="v" data-nv="prem"></span><span class="s">${V('premYr')} ${ctx.t('sPrem', { tag: 'span', attrs: 'data-el="sPrem"' })}</span></div>
          <div class="nx-tile navy">${ctx.t('tCash', { tag: 'span', cls: 'k' })}<span class="v" data-nv="cash"></span><span class="s">${V('cashYr')} ${ctx.t('sCash', { tag: 'span', attrs: 'data-el="sCash"' })}</span></div>
          <div class="nx-tile">${ctx.t('tColl', { tag: 'span', cls: 'k' })}<span class="v" data-nv="coll"></span><span class="s"><span data-el="collYes">${ctx.t('sCollA', { tag: 'span' })} ${V('collYr')}</span>${ctx.t('sCollNone', { tag: 'span', attrs: 'data-el="collNo"' })}</span></div>
          <div class="nx-tile gold nx-f" ${AT(1)}><span class="k">${ctx.t('tNetA', { tag: 'span' })} ${V('netYr')}</span><span class="v" data-nv="net"></span><span class="s">${ctx.t('sNet', { tag: 'span' })}<span data-el="vs"> · ${ctx.t('sNetVs', { tag: 'span' })} ${V('netBase')}</span></span></div>
        </div>
        <div class="nx-card nx-chart" style="left:610px;top:452px;width:880px;height:248px">
          <div class="nx-ckey"><span><i style="background:${P.gold}"></i>${ctx.t('kNet')}</span><span><i style="background:${P.navy3}"></i>${ctx.t('kLoan')}</span><span><i class="bar" style="background:${P.steel}"></i>${ctx.t('kCash')}</span></div>
          <div data-el="chart"></div>
        </div>
        <p class="nx-lev serif nx-f" ${AT(1)} data-el="lev" style="left:610px;top:712px;width:880px">${ctx.t('levA', { tag: 'span' })} ${V('lev')} ${ctx.t('levB', { tag: 'span' })}</p>
        <p class="nx-flag" data-el="lapse" style="left:610px;top:710px;width:880px">${ctx.t('lapseA', { tag: 'span' })} ${V('lapseYr')}${ctx.t('lapseB', { tag: 'span' })}</p>
        <p class="nx-flag" data-el="nolapse" style="left:610px;top:710px;width:880px">${ctx.t('noLapse', { tag: 'span' })}</p>
        <div data-mode="est">${src(ctx, 'srcEst', 'hi')}</div>
        ${SAMPLES.map((s) => `<div data-mode="case" data-case="${s.key}">${src(ctx, 'src_' + s.key, 'hi')}</div>`).join('')}
        ${disc(['hypothetical', 'guarantees', 'tax', 'loans'])}`;

      const show = (sel, on) => ctx.$$(sel).forEach((n) => n.classList.toggle('nx-hide', !on));
      const drawChart = (o) => {
        const el = ctx.$('[data-el="chart"]'); if (!el) return;
        el.innerHTML = chartSVG({
          w: 852, h: 206, n: o.years.length, label: 'Net death benefit, loan balance, and cash in by year',
          lines: [{ v: o.loan, color: P.navy3, width: 3, dash: '7 7' }, { v: o.net, color: P.gold, width: 4.5, dot: true }],
          bars: [{ v: o.cum, color: P.steel, op: 0.85 }],
          mark: o.exitIdx != null ? { i: o.exitIdx, label: ctx.text('exit') } : null,
          xl: (i) => o.years[i], every: 5
        });
      };
      const paintEst = (vals) => {
        const need = Math.max(1, vals.need || 10000000), k = need / PF_BASE_NET1, bump = (+vals.bump || 0) / 100;
        const r = pfCase(k, bump), base = bump ? pfCase(k, 0) : r;
        setV(ctx, 'prem', mny(r.totalPrem)); setV(ctx, 'premYr', mny(CSI540.premium * k));
        setV(ctx, 'cash', mny(r.totalCash)); setV(ctx, 'cashYr', mny(CSI540.clientPay * k));
        setV(ctx, 'coll', mny(r.peak.collat)); setV(ctx, 'collYr', String(r.peak.y));
        show('[data-el="collYes"]', r.peak.collat > 0); show('[data-el="collNo"]', !(r.peak.collat > 0));
        setV(ctx, 'netYr', String(CSI540.exitYear)); setV(ctx, 'net', mny(r.exitRow.netDB)); setV(ctx, 'netBase', mny(base.exitRow.netDB));
        show('[data-el="vs"]', !!bump); show('[data-el="sPrem"]', true); show('[data-el="sCash"]', true);
        setV(ctx, 'share', pct1(r.share));
        ctx.$('[data-el="share"]').classList.toggle('low', r.share < 0.2);
        setV(ctx, 'lev', '$' + (r.exitRow.netDB / Math.max(1, r.totalCash)).toFixed(2));
        setV(ctx, 'lapseYr', String(r.lapseYear || ''));
        show('[data-el="lev"]', !bump); show('[data-el="lapse"]', !!bump && !!r.lapseYear); show('[data-el="nolapse"]', !!bump && !r.lapseYear);
        let anyLapse = false;
        [0, 1, 2].forEach((b) => {
          const s = b === +vals.bump ? r : pfCase(k, b / 100);
          setV(ctx, 'st' + b + 'n', mny(s.exitRow.netDB)); setV(ctx, 'st' + b + 'x', s.lapseYear ? '*' : ''); setV(ctx, 'st' + b + 'c', mny(s.peak.collat));
          if (s.lapseYear) anyLapse = true;
          const tr = ctx.$(`tr[data-b="${b}"]`); if (tr) tr.classList.toggle('on', b === +vals.bump);
        });
        show('[data-el="stF"]', anyLapse);
        let cum = 0;
        drawChart({ years: r.rows.map((x) => x.y), net: r.rows.map((x) => x.netDB), loan: r.rows.map((x) => (x.y < CSI540.exitYear ? x.balEnd : 0)), cum: r.rows.map((x) => (cum += x.pay)), exitIdx: CSI540.exitYear - 1 });
        CD.set('ng.need', need); CD.set('ng.cost', base.totalCash / CSI540.payYears); CD.set('ng.costYears', CSI540.payYears);
        CD.set('ng.legacy', base.exitRow.netDB); CD.set('ng.legacyYear', CSI540.exitYear);
      };
      const paintCase = (vals) => {
        const s = SAMPLES.find((x) => x.key === vals.sc) || SAMPLES[0];
        show('[data-case]', false); show(`[data-case="${s.key}"]`, true);
        const st = sampleStats(s);
        setV(ctx, 'prem', mny(st.prem)); setV(ctx, 'cash', mny(st.cash));
        show('[data-el="sPrem"]', false); show('[data-el="sCash"]', false); setV(ctx, 'premYr', ''); setV(ctx, 'cashYr', '');
        setV(ctx, 'coll', mny(st.peakColl)); setV(ctx, 'collYr', String(st.peakYr));
        show('[data-el="collYes"]', st.peakColl > 0); show('[data-el="collNo"]', !(st.peakColl > 0));
        setV(ctx, 'netYr', String(st.netYr)); setV(ctx, 'net', mny(st.net)); show('[data-el="vs"]', false);
        setV(ctx, 'share', pct1(st.share));
        ctx.$('[data-el="share"]').classList.toggle('low', st.share < 0.2);
        setV(ctx, 'lev', '$' + (st.net / Math.max(1, st.cash)).toFixed(2));
        show('[data-el="lev"]', true); show('[data-el="lapse"]', false); show('[data-el="nolapse"]', false);
        drawChart({ years: st.years, net: st.netSeries, loan: st.loanSeries, cum: st.cumSeries, exitIdx: st.exitIdx });
      };
      const paint = (vals) => {
        const mode = hasCases ? vals.mode : 'est';
        show('[data-mode]', false); show(`[data-mode="${mode}"]`, true);
        if (mode === 'case') paintCase(vals); else paintEst(vals);
      };
      ctx.on('[data-fill]', 'click', (e, b) => {
        const v = b.dataset.fill === 'gap' ? CD.get('ng.gap', 0) : CD.get('ng.due', 0);
        if (v > 0) { ctx.setField('need', v); paint(ctx.values()); }
      });
      ctx.onFields(paint);
    },
    step(ctx, n) { reveal(ctx, n); }
  });
  /** totals and series for a sample case (values exactly as printed in its ledger).
      row = [year, premium, cash in, lender loan balance, net death benefit, collateral needed, repaid flag] */
  function sampleStats(s) {
    const rows = s.rows;
    const prem = rows.reduce((t, r) => t + r[1], 0), cash = rows.reduce((t, r) => t + r[2], 0);
    let peakColl = 0, peakYr = 0;
    rows.forEach((r) => { if (r[5] > peakColl) { peakColl = r[5]; peakYr = r[0]; } });
    const exitIdx = rows.findIndex((r) => r[6] === 1);
    const netRow = exitIdx >= 0 ? rows[exitIdx] : rows[Math.min(19, rows.length - 1)];
    let cum = 0;
    return {
      prem, cash, share: prem > 0 ? cash / prem : 0, peakColl, peakYr, net: netRow[4], netYr: netRow[0],
      years: rows.map((r) => r[0]), netSeries: rows.map((r) => r[4]), loanSeries: rows.map((r) => r[3]),
      cumSeries: rows.map((r) => (cum += r[2])), exitIdx: exitIdx >= 0 ? exitIdx : null
    };
  }

  /* =====================================================================
     22. what makes a financed case hold
     ===================================================================== */
  EFA.screen('ng22', {
    title: 'What makes a financed case hold',
    steps: 6,
    copy: {
      eb: 'Built to hold',
      h: 'What makes a financed case hold.',
      t1: 'Modest assumptions', d1: 'Illustrated below what the carrier allows, so real results have room to beat the plan.',
      t2: 'Real money in', d2: 'You pay a meaningful share yourself. Some carriers require at least 20% of the planned premium.',
      t3: 'A collateral cushion', d3: 'In the early years the policy’s cash value may not cover the loan. Outside collateral bridges those years.',
      t4: 'A defined exit', d4: 'How the lender is repaid is decided at the start: from policy cash value, from other assets, or from the death benefit.',
      t5: 'Stress-tested, reviewed yearly', d5: 'Higher loan rates and lower crediting are run before you begin, and the case is checked against its plan every year.',
      close: 'Leverage is a tool. These five habits keep it one.',
      src: 'Sources: Allianz Life, “Additional considerations when using a premium finance strategy” (CSI-543, R-9/2025), premium finance glossary (CSI-542), and “Using premium financing for estate planning strategies” (CSI-540, R-7/2026).',
      _notes: 'Name the risks plainly, then show how each one is handled.\n\n- Modest assumptions: illustrate below the carrier’s maximum. Policy crediting is not guaranteed; at a 0% index year the policy earns nothing (CSI-540).\n- Real money in: Allianz requires the client’s out-of-pocket contribution (loan interest and premium paid) to be at least 20% of the total planned premium (ASI-466, producer guide). John Hancock cautions against zero or minimal outlay designs (LIFE-7299).\n- Collateral: the policy is assigned to the bank, and additional collateral may be required, especially in the early years (CSI-540). Most loans are recourse loans; a personal guaranty may be required (LIFE-7299).\n- Exit: decided up front. Policy cash value, outside assets, or the death benefit (Allianz ASI-457, producer guide; CSI-540).\n- Stress tests: higher bank rates, lower credited rates, higher policy expenses (CSI-542). If rates rise, the fixes are more collateral, more client contribution, a longer time to payoff, or revised benefits (CSI-543).\n\n- Ask: Which of these would you want to see on paper before you decide?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        <div class="nx-five">${[1, 2, 3, 4, 5].map((i) => `<div class="nx-f" ${AT(i - 1)}><span class="n">${['I', 'II', 'III', 'IV', 'V'][i - 1]}</span>${ctx.t('t' + i, { tag: 'p', cls: 't serif' })}${ctx.t('d' + i, { tag: 'p', cls: 'd' })}</div>`).join('')}</div>
        ${line(ctx, 'close', 724, { at: 5, cls: 'sm' })}
        ${src(ctx, 'src', 'up')}
        ${disc(['loans', 'guarantees'])}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* =====================================================================
     23. once the floor holds, the reserve can go to work
     ===================================================================== */
  EFA.screen('ng23', {
    title: 'The reserve goes to work',
    steps: 4,
    copy: {
      eb: 'Freedom capital',
      h: 'Once the floor holds, the reserve can go to work.',
      before: 'Before', after: 'After',
      work: 'Working', held: 'Held back', floor: 'The Legacy Floor',
      r1: 'The reserve you held back for the kids returns to your strategy.',
      r2: 'The floor’s cost is planned in advance and reviewed every year.',
      r3: 'Decisions are made on their merits, not on “what if.”',
      close: 'More capital at work, and a clearer mind doing the work.',
      _notes: 'This is where the opening answer comes back.\n\n- The reserve that was quietly held back for the family can go back to work, because the floor is in place.\n- The floor has a cost, planned in advance and reviewed every year.\n\n- Ask: Now that the next generation is handled, what would you put to work first?\nPAUSE'
    },
    render(ctx) {
      const pot = (x, lvlTop, heldTop, id, floor) => `
        <rect x="${x}" y="246" width="230" height="420" rx="24" fill="${P.paper}" stroke="${P.rule}" stroke-width="2"/>
        <clipPath id="${id}"><rect x="${x + 8}" y="254" width="214" height="404" rx="18"/></clipPath>
        <g clip-path="url(#${id})">
          <rect x="${x + 8}" y="${lvlTop}" width="214" height="${658 - lvlTop}" fill="url(#nxPtN)"/>
          ${heldTop ? `<rect x="${x + 8}" y="${heldTop}" width="214" height="${658 - heldTop}" fill="url(#nxPtH)"/><rect x="${x + 8}" y="${heldTop - 2}" width="214" height="4" fill="${P.gold}"/>` : ''}
        </g>
        ${floor ? `<rect x="${x - 26}" y="672" width="282" height="26" rx="6" fill="url(#nxPtG)"/>` : ''}`;
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        <svg class="nx-full" viewBox="0 0 1600 900" aria-hidden="true">
          <defs>${navyGrad('nxPtN', P.navy3, P.navy)}${goldGrad('nxPtG')}${arrowDef('nxPtA', P.gold)}
            <pattern id="nxPtH" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="${P.goldPale}"/><rect width="6" height="16" fill="${P.goldLt}" opacity=".75"/></pattern></defs>
          <ellipse cx="440" cy="712" rx="330" ry="12" fill="rgba(13,30,58,.08)"/>
          <g class="nx-f" ${AT(0)}>${pot(140, 300, 500, 'nxPtC1', false)}</g>
          <g class="nx-f" ${AT(1)}>${pot(520, 300, 0, 'nxPtC2', true)}<path d="M384 456H506" stroke="${P.gold}" stroke-width="4" fill="none" marker-end="url(#nxPtA)"/></g>
        </svg>
        ${ctx.t('before', { tag: 'div', cls: 'nx-col nx-f', attrs: `style="left:255px;top:208px" ${AT(0)}` })}
        ${ctx.t('after', { tag: 'div', cls: 'nx-col gold nx-f', attrs: `style="left:635px;top:208px" ${AT(1)}` })}
        ${ctx.t('work', { tag: 'div', cls: 'nx-seg nx-f', attrs: `style="left:255px;top:400px;font-size:15px" ${AT(0)}` })}
        ${ctx.t('held', { tag: 'div', cls: 'nx-seg dk nx-f', attrs: `style="left:255px;top:580px;font-size:15px;background:rgba(255,253,248,.9);padding:7px 12px;border-radius:8px" ${AT(0)}` })}
        ${ctx.t('work', { tag: 'div', cls: 'nx-seg nx-f', attrs: `style="left:635px;top:480px;font-size:15px" ${AT(1)}` })}
        ${ctx.t('floor', { tag: 'div', cls: 'nx-seg dk nx-f', attrs: `style="left:635px;top:685px;font-size:13px" ${AT(1)}` })}
        <div class="nx-rows">${['r1', 'r2', 'r3'].map((k, i) => `<div class="nx-row nx-f" ${AT(i + 1)}><span class="n"><span class="num">${i + 1}</span></span>${ctx.t(k, { tag: 'p' })}</div>`).join('')}</div>
        ${ctx.t('close', { tag: 'p', cls: 'nx-rl serif nx-f', attrs: `style="top:672px" ${AT(3)}` })}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* =====================================================================
     24. calculator three: freedom capital
     ===================================================================== */
  /** reserve R held back at rc for Y years, versus invested at rg while paying the floor's cost C a year for n years */
  function freedomCalc(v) {
    const R = Math.max(0, v.res || 0), rc = v.rc || 0, rg = v.rg || 0, Y = Math.max(1, Math.round(v.yrs || 1)), C = Math.max(0, v.cost || 0), n = Math.max(0, Math.round(v.cyrs || 0));
    const held = [], work = [];
    let w = R;
    for (let t = 0; t <= Y; t++) {
      held.push(R * Math.pow(1 + rc, t));
      if (t > 0) { w = w * (1 + rg) - (t <= n ? C : 0); }
      work.push(Math.max(0, w));
    }
    return { held, work, A: held[Y], B: work[Y], diff: work[Y] - held[Y], Y, paid: C * Math.min(n, Y) };
  }
  EFA.freedomCapital = { calc: freedomCalc };

  EFA.screen('ng24', {
    title: 'What the freed reserve could become',
    steps: 2,
    copy: {
      eb: 'Freedom capital',
      h: 'What the freed reserve could become.',
      fRes: 'Reserve held back for the family', fRc: 'Return while held back', fRg: 'Return when put to work', fYrs: 'Years', fCost: 'Yearly cost of the floor', fCyrs: 'Years of floor cost',
      tA: 'Held back', tB: 'Put to work', tD: 'The difference',
      sA: 'at the lower return', sB: 'after paying for the floor', sD: 'in year',
      kA: 'Held back', kB: 'Put to work',
      legA: 'And the floor is in place the whole time: about', legB: 'for the family in year 20, on the financed case shown earlier.',
      legNone: 'And the whole time, the family’s floor is in place.',
      _notes: 'Hypothetical returns, for discussion. Put in their own numbers.\n\n- Held back: the reserve sits in conservative assets at the lower rate.\n- Put to work: the same reserve invested in their strategy, with the floor’s yearly cost paid from it for the years it runs.\n- The defaults come from the earlier screens when they have been filled in: the reserve is the part of the estate’s cash need already sitting in liquid assets, and the yearly cost is the client’s cash on the financed case.\n\n- Ask: What would that difference fund?\nPAUSE'
    },
    render(ctx) {
      const res = CD.get('ng.reserve', null), cost = CD.get('ng.cost', null), cyrs = CD.get('ng.costYears', null);
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h', sm: true })}
        <div class="nx-card nx-form nx-big" style="left:110px;top:166px;width:560px;height:452px">
          ${CD.field(ctx, { id: 'res', key: 'ng.reserve', label: 'fRes', type: 'money', value: res > 0 ? res : 5000000, min: 0 })}
          ${ctx.field({ id: 'rc', label: 'fRc', type: 'pct', value: 0.03, min: 0, max: 0.2, dp: 1 })}
          ${ctx.field({ id: 'rg', label: 'fRg', type: 'pct', value: 0.07, min: 0, max: 0.3, dp: 1 })}
          ${ctx.field({ id: 'yrs', label: 'fYrs', type: 'int', value: 20, min: 1, max: 50 })}
          ${CD.field(ctx, { id: 'cost', key: 'ng.cost', label: 'fCost', type: 'money', value: cost > 0 ? cost : 300000, min: 0 })}
          ${CD.field(ctx, { id: 'cyrs', key: 'ng.costYears', label: 'fCyrs', type: 'int', value: cyrs > 0 ? cyrs : 10, min: 0, max: 50 })}
        </div>
        <div class="nx-tiles c3" style="left:700px;top:166px;width:790px">
          <div class="nx-tile">${ctx.t('tA', { tag: 'span', cls: 'k' })}<span class="v" data-nv="A"></span>${ctx.t('sA', { tag: 'span', cls: 's' })}</div>
          <div class="nx-tile navy">${ctx.t('tB', { tag: 'span', cls: 'k' })}<span class="v" data-nv="B"></span>${ctx.t('sB', { tag: 'span', cls: 's' })}</div>
          <div class="nx-tile gold nx-f" ${AT(1)}>${ctx.t('tD', { tag: 'span', cls: 'k' })}<span class="v" data-nv="D"></span><span class="s">${ctx.t('sD', { tag: 'span' })} ${V('Y')}</span></div>
        </div>
        <div class="nx-card nx-chart" style="left:700px;top:306px;width:790px;height:312px">
          <div class="nx-ckey"><span><i style="background:${P.gold}"></i>${ctx.t('kB')}</span><span><i style="background:${P.navy3}"></i>${ctx.t('kA')}</span></div>
          <div data-el="chart"></div>
        </div>
        <p class="nx-say serif nx-f" ${AT(1)} data-el="leg" style="left:110px;top:650px;width:1380px;text-align:center">${ctx.t('legA', { tag: 'span' })} ${V('legacy')} ${ctx.t('legB', { tag: 'span' })}</p>
        ${ctx.t('legNone', { tag: 'p', cls: 'nx-say serif nx-f', attrs: `data-el="legNone" style="left:110px;top:650px;width:1380px;text-align:center" ${AT(1)}` })}
        ${disc(['hypothetical'])}`;
      if (EFA.lib && EFA.lib.disclosure) { EFA.lib.disclosure.guard(ctx, 'rc'); EFA.lib.disclosure.guard(ctx, 'rg'); }
      const paint = (vals) => {
        const r = freedomCalc(vals);
        setV(ctx, 'A', mny(r.A)); setV(ctx, 'B', mny(r.B)); setV(ctx, 'Y', String(r.Y)); setV(ctx, 'D', (r.diff >= 0 ? '+' : '') + mny(r.diff));
        const el = ctx.$('[data-el="chart"]');
        if (el) {
          el.innerHTML = chartSVG({
            w: 762, h: 264, n: r.Y + 1, label: 'Held back versus put to work, by year',
            lines: [{ v: r.held, color: P.navy3, width: 3.5 }, { v: r.work, color: P.gold, width: 4.5, dot: true }],
            band: [r.held, r.work.map((x, i) => Math.max(x, r.held[i]))],
            xl: (i) => i, every: r.Y > 30 ? 10 : 5
          });
        }
        const legacy = CD.get('ng.legacy', null);
        setV(ctx, 'legacy', legacy > 0 ? mny(legacy) : '');
        ctx.$('[data-el="leg"]').classList.toggle('nx-hide', !(legacy > 0));
        ctx.$('[data-el="legNone"]').classList.toggle('nx-hide', legacy > 0);
      };
      ctx.onFields(paint);
    },
    step(ctx, n) { reveal(ctx, n); }
  });
})();
