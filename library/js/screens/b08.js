/* b08: Inflation calculators (IABP, IAP), the Legacy Reserve Strategy story (PRSL, prs1-prs17),
   Long Term Care (LTC), Major Capital Purchases (MCPF101 / MCPF101L), Major Medical (MAJMED) and the
   Major Wealth Transfers board (MWT). Structure, sequence and math follow the specs; art and wording are new. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt;
  const r2 = (n) => Math.round(n * 100) / 100;

  EFA.css('b08', `
  .b08-head { position: absolute; left: 0; right: 0; top: 42px; display: grid; justify-items: center; gap: 12px; text-align: center; padding: 0 130px; z-index: 2; }
  .stage .b08-head .st-h1 { font-size: 58px; }
  .b08-sub { margin: 0; font: 400 21px/1.4 "DM Sans", sans-serif; color: #667389; }
  .b08-f { transition: opacity .8s ease; }
  .b08-f.is-off { transition: opacity .3s ease; }
  .b08-f0.is-off { transition: none; }
  .b08-card { position: absolute; box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 14px 34px rgba(13,30,58,.08); }
  .b08-disc { position: absolute; left: 110px; width: 1160px; margin: 0; }
  .b08-btnrow { position: absolute; left: 0; right: 0; display: flex; justify-content: center; gap: 54px; }
  .stage .b08-btnrow .st-pill { min-width: 280px; min-height: 56px; font-size: 20px; padding: 10px 30px; box-shadow: 0 10px 24px rgba(13,30,58,.16); }
  .b08-wait { position: absolute; display: grid; place-items: center; text-align: center; font: 600 20px/1.3 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6e22; background: repeating-linear-gradient(135deg, rgba(227,232,240,.55) 0 18px, rgba(247,245,241,.55) 18px 36px); border: 1px dashed #cbd5e3; border-radius: 16px; }
  .b08-ico { display: block; }
  .b08-nw { white-space: nowrap; }
  .b08-wswait { font: 600 15px/1 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #8a6e22; opacity: .7; }
  .b08-brow { display: flex; align-items: center; gap: 22px; }
  .b08-bico { flex: 0 0 auto; display: flex; align-items: center; justify-content: center; }
  .b08-bc { box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 10px 26px rgba(13,30,58,.07); padding: 20px 30px; font: 600 32px/1.28 "DM Sans", sans-serif; color: #0d1e3a; }
  .b08-hot { cursor: pointer; }
  .b08-hot:hover { filter: brightness(1.08); }

  /* glass tank */
  .b08-tk { position: absolute; box-sizing: border-box; transition: height 1.2s ease, top 1.2s ease; }
  .b08-tk .tk-sh { position: absolute; left: -14%; right: -14%; bottom: calc(var(--ry) * -.55); height: calc(var(--ry) * 1.3); border-radius: 50%; background: rgba(13,30,58,.13); }
  .b08-tk .tk-back { position: absolute; left: 0; right: 0; top: var(--ry); bottom: 0; border-radius: 0 0 50% 50% / 0 0 var(--ry) var(--ry); background: linear-gradient(90deg, rgba(203,213,227,.75), rgba(255,253,248,.55) 38%, rgba(227,232,240,.7) 70%, rgba(203,213,227,.8)); }
  .b08-tk .tk-box { position: absolute; left: 4px; right: 4px; top: var(--ry); bottom: 0; }
  .b08-tk .tk-liq, .b08-tk .tk-coll, .b08-tk .tk-res { position: absolute; left: 0; right: 0; bottom: 0; border-radius: 0 0 50% 50% / 0 0 var(--ry) var(--ry); transition: height .4s ease-out, opacity .4s ease, bottom .4s ease-out; }
  .b08-tk .tk-liq::before, .b08-tk .tk-coll::before, .b08-tk .tk-res::before { content: ""; position: absolute; left: 0; right: 0; top: calc(var(--ry) * -1); height: calc(var(--ry) * 2); border-radius: 50%; }
  .b08-tk .tk-liq { background: linear-gradient(90deg, #6f8fbd 0%, #9cb6d8 34%, #b6cae4 52%, #8aa6cc 82%, #6f8fbd 100%); }
  .b08-tk .tk-liq::before { background: radial-gradient(ellipse at 45% 40%, #d7e2f0, #b3c7e1 70%); box-shadow: inset 0 0 0 1.5px rgba(111,143,189,.55); }
  .b08-tk .tk-coll { background: linear-gradient(90deg, #9c7f25 0%, #c9ad52 34%, #e0ca85 52%, #c5a643 80%, #9c7f25 100%); }
  .b08-tk .tk-coll::before { background: radial-gradient(ellipse at 45% 40%, #f3e7bd, #dcc479 75%); box-shadow: inset 0 0 0 1.5px rgba(138,110,34,.5); }
  .b08-tk .tk-res { background: linear-gradient(90deg, #14284a, #2b4c80 45%, #1d3863); }
  .b08-tk .tk-res::before { background: #3a5d93; }
  .b08-tk .is-empty { opacity: 0; }
  .b08-tk .tk-front { position: absolute; left: 0; right: 0; top: var(--ry); bottom: var(--ry); border-left: 4px solid #0d1e3a; border-right: 4px solid #0d1e3a; pointer-events: none; }
  .b08-tk .tk-front i { position: absolute; top: 3%; bottom: 3%; border-radius: 10px; background: rgba(255,255,255,.42); }
  .b08-tk .tk-front i:first-child { left: 12%; width: 7%; }
  .b08-tk .tk-front i:last-child { left: 80%; width: 3%; background: rgba(255,255,255,.3); }
  .b08-tk .tk-rim { position: absolute; left: 0; right: 0; top: 0; height: calc(var(--ry) * 2); box-sizing: border-box; border: 4px solid #0d1e3a; border-radius: 50%; background: rgba(227,232,240,.35); pointer-events: none; }
  .b08-tk .tk-base { position: absolute; left: 0; right: 0; bottom: 0; height: var(--ry); box-sizing: border-box; border: 4px solid #0d1e3a; border-top: 0; border-radius: 0 0 50% 50% / 0 0 100% 100%; pointer-events: none; }
  .b08-comp { position: absolute; transition: opacity .3s ease; }
  .b08-comp svg { position: absolute; left: 0; bottom: 0; }
  .b08-vt { position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%) rotate(180deg); writing-mode: vertical-rl; font: 700 14px/1 "DM Sans", sans-serif; letter-spacing: .3em; text-transform: uppercase; color: #f7f5f1; white-space: nowrap; }
  .b08-tklab { position: absolute; text-align: center; font: 700 14px/1 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #0d1e3a; white-space: nowrap; }
  .b08-tklab.light { color: #f7f5f1; font-size: 12px; }
  .b08-tklab.go { cursor: pointer; text-decoration: underline; text-decoration-color: rgba(13,30,58,.45); text-underline-offset: 4px; }
  .b08-tklab.go:hover { color: #14284a; text-decoration-color: #0d1e3a; }

  /* collage, labels and captions for the strategy loop */
  .b08-collage { position: absolute; box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 22px; box-shadow: 0 16px 36px rgba(13,30,58,.09); overflow: hidden; }
  .b08-collage::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 56%; background: linear-gradient(180deg, rgba(240,230,196,.45), rgba(240,230,196,0)); }
  .b08-collage > div { position: absolute; }
  .b08-collage svg { width: 100%; height: 100%; display: block; }
  .b08-lab { position: absolute; transform: translateX(-50%); white-space: nowrap; box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 12px; padding: 11px 22px; font: 700 18px/1.1 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #0d1e3a; box-shadow: 0 8px 20px rgba(13,30,58,.07); text-align: center; }
  .b08-lab.go { cursor: pointer; border-color: #b8972e; }
  .b08-lab.go:hover { background: #f0e6c4; }
  .b08-cap { position: absolute; transform: translateX(-50%); text-align: center; font: 700 17px/1.25 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #1d3863; white-space: nowrap; }
  .b08-lien { position: absolute; display: grid; justify-items: center; gap: 4px; }
  .b08-lien span { font: 700 16px/1 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #8a6e22; }
  .b08-delay { transition: opacity .2s ease .4s; }
  .b08-delay.is-off { transition: opacity .25s ease 0s; }
  .b08-stmt { display: block; text-align: center; padding: 22px 46px; font: 600 26px/1.38 "DM Sans", sans-serif; color: #0d1e3a; border-top: 4px solid #b8972e; }
  .b08-lpbot { position: absolute; display: grid; gap: 16px; }
  .b08-lpbot .b08-card { position: relative; }
  .b08-lpbot .b08-btnrow { position: static; }
  .b08-badge { position: absolute; }
  .b08-badge .bl { position: absolute; left: 0; right: 0; text-align: center; font: 700 11px/1 "DM Sans", sans-serif; letter-spacing: .05em; text-transform: uppercase; color: #0d1e3a; white-space: nowrap; }
  .b08-panel { position: absolute; border-radius: 22px; background: linear-gradient(180deg, rgba(227,232,240,.7), rgba(227,232,240,.35)); border: 1px solid rgba(203,213,227,.8); }
  .b08-sent { position: absolute; font: 700 13.5px/1.25 "DM Sans", sans-serif; color: #0d1e3a; text-align: left; }
  .b08-echo { transition: opacity .8s ease 1s; }
  .b08-echo.e2 { transition-delay: 2s; }
  .b08-echo.is-off { transition: opacity .3s ease 0s; }

  /* strategy definition */
  .b08-def { left: 240px; width: 1120px; top: 170px; padding: 46px 58px 44px; border-left: 6px solid #b8972e; }
  .b08-def .p1 { margin: 0; font: 600 32px/1.42 "DM Sans", sans-serif; color: #0d1e3a; }
  .b08-def .rule { display: grid; grid-template-columns: 64px 1fr; gap: 26px; align-items: center; margin-top: 32px; padding-top: 30px; border-top: 1px solid #d6cfc4; }
  .b08-def .rl { display: block; font: 700 14px/1 "DM Sans", sans-serif; letter-spacing: .24em; text-transform: uppercase; color: #8a6e22; margin-bottom: 10px; }
  .b08-def .p2 { margin: 0; font: 600 32px/1.36 "DM Sans", sans-serif; color: #0d1e3a; }

  /* wealth transfers board */
  .b08-bh { cursor: pointer; }
  .b08-bh:hover { color: #8a6e22; }
  .b08-cols { position: absolute; left: 120px; right: 120px; top: 200px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 58px; align-items: start; }
  .b08-col { display: grid; gap: 24px; align-content: start; }
  .b08-grp { display: grid; gap: 7px; }
  .stage .b08-grp h3 { margin: 0 0 5px; font: 700 15px/1.2 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6e22; border-bottom: 2px solid #b8972e; padding-bottom: 8px; }
  .stage .b08-grp .st-pill { width: 100%; justify-content: flex-start; padding: 6px 22px; font-size: 18px; min-height: 37px; }
  .stage .b08-grp .st-pill.inert { cursor: default; }
  .stage .b08-grp button.st-pill.inert:hover { background: #0d1e3a; color: #f7f5f1; border-color: #0d1e3a; transform: none; }

  /* long-term care title */
  .b08-ltc1-bg { position: absolute; inset: 0; opacity: .2; }
  .b08-ltc1-halo { position: absolute; left: 160px; right: 160px; top: 200px; bottom: 200px; border-radius: 50%; background: radial-gradient(closest-side, rgba(247,245,241,.95), rgba(247,245,241,.75) 60%, rgba(247,245,241,0)); }
  .b08-ltc1-t { position: absolute; left: 240px; width: 1120px; top: 0; bottom: 0; display: grid; place-content: center; justify-items: center; gap: 34px; text-align: center; }
  .b08-ltc1-t p { margin: 0; font: 600 66px/1.16 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; text-wrap: balance; }

  /* net worth paths */
  .b08-p7 .pc { opacity: 0; transition: none; }
  .b08-p7 .pc.on { opacity: 1; transition: opacity var(--fd, .3s) ease var(--dl, 0s); }
  .b08-p7lab { position: absolute; font: 700 34px/1 "DM Sans", sans-serif; letter-spacing: .01em; opacity: 0; transition: none; white-space: nowrap; }
  .b08-p7lab.on { opacity: 1; transition: opacity .3s ease .3s; }
  .b08-p7hot { position: absolute; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; }
  .b08-p7hot:hover { background: rgba(184,151,46,.12); }

  /* two questions */
  .b08-qa { position: absolute; left: 244px; width: 1112px; top: 186px; }
  .b08-q { display: grid; grid-template-columns: 78px 1fr; gap: 22px; align-items: center; }
  .b08-qc { background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; padding: 24px 34px; font: 600 32px/1.3 "DM Sans", sans-serif; color: #0d1e3a; box-shadow: 0 10px 26px rgba(13,30,58,.07); }
  .b08-a { box-sizing: border-box; margin: 16px 0 52px 100px; min-height: 118px; display: flex; align-items: center; background: #f0e6c4; border: 1px solid #d5bd68; border-left: 7px solid #b8972e; border-radius: 16px; padding: 18px 32px; font: 600 29px/1.32 "DM Sans", sans-serif; color: #0d1e3a; }
  `);

  /* ---------- small helpers ---------- */
  const head = (ctx, key, o) => {
    o = o || {};
    return `<div class="b08-head ${o.cls || ''}"${o.style ? ` style="${o.style}"` : ''}>${ctx.t(key, { tag: 'h1', cls: 'st-h1' + (o.hcls ? ' ' + o.hcls : ''), attrs: o.hattrs || '' })}${o.rule === false ? '' : '<hr class="st-rule">'}${o.sub ? ctx.t(o.sub, { tag: 'p', cls: 'b08-sub' }) : ''}</div>`;
  };
  const disc = (ctx, key, style, cls) => ctx.t(key, { tag: 'p', cls: 'st-disclaimer b08-disc ' + (cls || ''), attrs: `style="${style || ''}"` });

  /* the qualified tax phrase every tax statement uses */
  const TXT = { taxfree: 'income-tax-free' };

  /* ---------- shared components, called defensively (a missing library shows a quiet waiting state) ---------- */
  const LIB = (name) => (EFA.lib && EFA.lib[name]) || null;
  const discHTML = (topics) => (LIB('disclosure') ? EFA.lib.disclosure.html(topics) : '');
  const dart = (size) => (LIB('bullets') ? EFA.lib.bullets.dart({ size }) : `<span style="display:block;width:${size}px;height:${r2(size * 66 / 90)}px"></span>`);
  /** a bullet row in this module's layouts: the shared dart glyph followed by our own card */
  const brow = (inner, o) => `<div class="b08-brow ${o.cls || ''}"${o.style ? ` style="${o.style}"` : ''}${o.attrs ? ' ' + o.attrs : ''}><span class="b08-bico" style="width:${o.size || 64}px">${dart(o.size || 64)}</span>${inner}</div>`;
  /** a ctx.field bound to a per-client value shared with other screens */
  const sfield = (ctx, o) => (LIB('caseData') ? EFA.lib.caseData.field(ctx, o) : ctx.field(Object.assign({}, o, { key: undefined })));
  const sget = (key, def) => (LIB('caseData') ? EFA.lib.caseData.get(key, def) : EFA.clients.get('case', key, def));
  /** worksheet opener, or a quiet waiting label while the worksheet library is not loaded */
  const wsButton = (ctx, o) => (LIB('worksheet') && EFA.lib.worksheet.button ? EFA.lib.worksheet.button(ctx, o) : `<span class="b08-wswait"${o.style ? ` style="${o.style}"` : ''}>${ctx.t('wsWait')}</span>`);
  const wsOpen = (ctx, data) => { if (LIB('worksheet') && EFA.lib.worksheet.open) EFA.lib.worksheet.open(ctx, data); };
  const infLink = (ctx, o) => (LIB('inflation') ? EFA.lib.inflation.link(ctx, o) : '');
  const guard = (ctx, field) => { if (LIB('disclosure')) EFA.lib.disclosure.guard(ctx, field); };

  /** keep hyphenated compounds (income-tax-free) on one line; display only, the wording is untouched */
  function nobr(root) {
    if (!root || document.body.classList.contains('editing')) return;
    root.querySelectorAll('[data-cp]').forEach((el) => {
      if (el.closest('svg')) return;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [];
      let n; while ((n = walker.nextNode())) if (/[A-Za-z]-[A-Za-z]/.test(n.nodeValue) && !(n.parentElement && n.parentElement.classList.contains('b08-nw'))) nodes.push(n);
      nodes.forEach((t) => {
        const frag = document.createDocumentFragment();
        t.nodeValue.split(/([A-Za-z]+(?:-[A-Za-z]+)+)/).forEach((part, i) => {
          if (!part) return;
          if (i % 2) { const sp = document.createElement('span'); sp.className = 'b08-nw'; sp.textContent = part; frag.appendChild(sp); } else frag.appendChild(document.createTextNode(part));
        });
        t.parentNode.replaceChild(frag, t);
      });
    });
  }

  /* ---------- per-visit state: survives re-renders of the same screen, starts fresh on each new visit ---------- */
  const VIS = { stage: null, key: '', st: null, obs: null };
  const posKey = () => { const pl = EFA.player; return pl && pl.pres ? pl.pres.key + ':' + pl.idx + ':' + pl.stack.length : ''; };
  function visitState(init) {
    const pl = EFA.player, stg = pl && pl.stage;
    if (stg !== VIS.stage) {
      if (VIS.obs) VIS.obs.disconnect();
      VIS.stage = stg; VIS.key = ''; VIS.obs = null;
      if (stg && typeof MutationObserver === 'function') {
        VIS.obs = new MutationObserver((muts) => {
          const added = muts.some((m) => Array.prototype.some.call(m.addedNodes, (x) => x.classList && x.classList.contains('screen')));
          if (added) { const k = posKey(); if (k !== VIS.key) { VIS.key = k; VIS.st = null; } }
        });
        VIS.obs.observe(stg, { childList: true });
      }
    }
    const k = posKey();
    if (k !== VIS.key) { VIS.key = k; VIS.st = null; }
    if (!VIS.st) VIS.st = init ? init() : {};
    return VIS.st;
  }

  /** state handed back to a screen when the presenter returns from a jump it started */
  const Ret = {
    s: null,
    jump(ctx, key, sid, state) {
      const pl = EFA.player, d = pl.stack.length;
      Ret.s = { id: ctx.id, pres: ctx.pres, depth: d, state };
      ctx.jump(key, sid);
      if (pl.stack.length === d) Ret.s = null; // the jump did not happen
    },
    take(ctx) {
      const s = Ret.s, d = EFA.player.stack.length;
      if (s && s.id === ctx.id && s.pres === ctx.pres && d === s.depth) { Ret.s = null; return s.state; }
      if (s && d <= s.depth) Ret.s = null; // stale
      return null;
    }
  };

  /* ---------- drawings (flat duotone, navy and gold on paper) ---------- */
  const sh = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${P.shadow}"/>`;
  const svgw = (vb, body, cls) => `<svg viewBox="${vb}" aria-hidden="true" class="b08-ico ${cls || ''}">${body}</svg>`;

  /** right- or left-pointing block arrow */
  function blockArrow(w, h, fill, dir) {
    const hl = h * 0.62, bt = h * 0.5, y0 = (h - bt) / 2, y1 = (h + bt) / 2, i = 4;
    const pts = [[i, y0], [w - hl, y0], [w - hl, i], [w - i, h / 2], [w - hl, h - i], [w - hl, y1], [i, y1]];
    const d = 'M' + pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join('L') + 'Z';
    const hi = `M${i + 6},${r2(y0 + 7)}L${r2(w - hl - 4)},${r2(y0 + 7)}`;
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" style="overflow:visible;display:block"><g${dir < 0 ? ` transform="translate(${w} 0) scale(-1 1)"` : ''}>
      <path d="${d}" fill="${fill}" stroke="${fill}" stroke-width="7" stroke-linejoin="round" transform="translate(0 5)" opacity=".18"/>
      <path d="${d}" fill="${fill}" stroke="${fill}" stroke-width="7" stroke-linejoin="round"/>
      <path d="${hi}" stroke="rgba(255,255,255,.28)" stroke-width="5" stroke-linecap="round"/></g></svg>`;
  }
  /** a left-pointing arrow drawn in dots (the lien) */
  function dotArrow(w, h, fill) {
    const r = 5.5, cy = h / 2; let c = '';
    for (let x = w - r; x > h * 0.62; x -= 15) c += `<circle cx="${r2(x)}" cy="${r2(cy)}" r="${r}"/>`;
    for (let k = 0; k <= 3; k++) {
      const t = k / 3, x = r + t * h * 0.5;
      c += `<circle cx="${r2(x)}" cy="${r2(cy - t * (cy - r))}" r="${r}"/>`;
      if (k) c += `<circle cx="${r2(x)}" cy="${r2(cy + t * (cy - r))}" r="${r}"/>`;
    }
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" style="display:block"><g fill="${fill}">${c}</g></svg>`;
  }
  /** tall upward arrow (the compounding arrow); label is placed over it by the caller */
  function upArrow(w, h, fill) {
    const hh = w * 0.82, sw = w * 0.52, a = (w - sw) / 2, b = (w + sw) / 2;
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><path d="M${w / 2} 3L${w - 3} ${r2(hh)}L${b} ${r2(hh)}L${b} ${h}L${a} ${h}L${a} ${r2(hh)}L3 ${r2(hh)}Z" fill="${fill}" stroke="${fill}" stroke-width="5" stroke-linejoin="round"/></svg>`;
  }

  /** glass storage tank, built in HTML so its levels and height can animate.
      o: {x, y, w, h, ry, fill, coll, res (px above the bottom center), cls, attrs, inner} */
  function tank(o) {
    const ry = o.ry || Math.round(o.w * 0.12);
    const fill = o.fill || 0, coll = o.coll || 0, res = o.res || 0;
    return `<div class="b08-tk ${o.cls || ''}" ${o.attrs || ''} data-ry="${ry}" data-res="${res}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;--ry:${ry}px">
      <div class="tk-sh"></div><div class="tk-back"></div>
      <div class="tk-box">
        <div class="tk-liq${fill > 0 ? '' : ' is-empty'}" style="height:${fill + ry}px"></div>
        ${res ? `<div class="tk-res" style="height:${res + ry}px"></div>` : ''}
        <div class="tk-coll${coll > 0 ? '' : ' is-empty'}" style="bottom:${res}px;height:${coll + ry}px"></div>
        ${o.inner || ''}
      </div>
      <div class="tk-front"><i></i><i></i></div><div class="tk-rim"></div><div class="tk-base"></div>
    </div>`;
  }
  /** set a tank's liquid and collateral levels (px above the bottom center) */
  function setTank(el, o) {
    if (!el) return;
    const ry = +el.dataset.ry || 20;
    if (o.fill != null) { const l = el.querySelector('.tk-liq'); l.style.height = (o.fill + ry) + 'px'; l.classList.toggle('is-empty', o.fill <= 0); }
    if (o.coll != null) { const c = el.querySelector('.tk-coll'); c.style.height = (o.coll + ry) + 'px'; c.classList.toggle('is-empty', o.coll <= 0); }
  }

  const IL = {
    calc() {
      let keys = '';
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) keys += `<rect x="${12 + c * 14}" y="${34 + r * 12}" width="10" height="8" rx="2" fill="${(r === 3 && c === 2) ? P.gold : P.mist}"/>`;
      return svgw('0 0 66 90', `${sh(33, 85, 24, 4)}<rect x="5" y="4" width="56" height="78" rx="9" fill="${P.navy}"/><rect x="12" y="11" width="42" height="16" rx="3" fill="${P.goldPale}"/><path d="M40 19h10" stroke="${P.navy}" stroke-width="3" stroke-linecap="round"/>${keys}`);
    },
    question() {
      return svgw('0 0 100 100', `<circle cx="50" cy="52" r="46" fill="${P.goldDeep}" opacity=".25"/><circle cx="50" cy="48" r="46" fill="${P.gold}"/><circle cx="50" cy="48" r="38" fill="none" stroke="${P.goldLt}" stroke-width="2"/>
        <path d="M35 37c0-17 30-17 30 0 0 12-15 11-15 24" fill="none" stroke="${P.navy}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="75" r="6.5" fill="${P.navy}"/>`);
    },
    key() {
      return svgw('0 0 64 64', `<circle cx="32" cy="32" r="31" fill="${P.goldPale}"/><circle cx="24" cy="26" r="11" fill="none" stroke="${P.gold}" stroke-width="6"/><path d="M31 33l17 17M41 43l5-5M45 47l5-5" stroke="${P.goldDeep}" stroke-width="6" stroke-linecap="round"/>`);
    },
    dress() {
      return svgw('0 0 150 210', `${sh(75, 202, 52, 6)}
        <path d="M75 30c0-9 11-9 11-2 0 5-6 6-11 11" fill="none" stroke="${P.navy}" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M38 50 75 36l37 14" fill="none" stroke="${P.navy}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M61 46 54 70q21 9 42 0l-7-24q-14 6-28 0z" fill="${P.paper}" stroke="${P.navy}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M54 74q-26 64-38 116 59 14 118 0-12-52-38-116z" fill="${P.paper}" stroke="${P.navy}" stroke-width="3.5" stroke-linejoin="round"/>
        <path d="M66 80q-12 54-20 106M84 80q12 54 20 106M75 80v108" fill="none" stroke="${P.mist2}" stroke-width="3" stroke-linecap="round"/>
        <rect x="51" y="68" width="48" height="10" rx="4" fill="${P.gold}"/><circle cx="75" cy="73" r="5" fill="${P.goldDeep}"/>
        <path d="M66 54q9 4 18 0" fill="none" stroke="${P.goldLt}" stroke-width="2.5" stroke-linecap="round"/>`);
    },
    books() {
      const book = (x, y, w, h, fill, band) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}"/><rect x="${x + w - 16}" y="${y + 4}" width="12" height="${h - 8}" rx="2" fill="${P.paper}"/><path d="M${x + w - 13} ${y + 9}h6M${x + w - 13} ${y + h / 2}h6M${x + w - 13} ${y + h - 9}h6" stroke="${P.mist2}" stroke-width="1.6"/><rect x="${x + 14}" y="${y + h / 2 - 3}" width="${w * 0.42}" height="6" rx="3" fill="${band}"/>`;
      return svgw('0 0 180 180', `${sh(90, 172, 72, 6)}
        ${book(16, 132, 148, 34, P.navy, P.gold)}${book(26, 100, 132, 32, P.gold, P.goldDeep)}${book(20, 70, 142, 30, P.navy4, P.goldLt)}
        <path d="M56 62q34 12 68 0V44q-34 10-68 0z" fill="${P.navy3}"/>
        <path d="M90 14 150 34 90 54 30 34z" fill="${P.navy}" stroke="${P.navy}" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="90" cy="34" r="4" fill="${P.gold}"/>
        <path d="M90 34 136 44v26" fill="none" stroke="${P.gold}" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M130 68h12l3 18h-18z" fill="${P.gold}"/>`);
    },
    tower() {
      let win = '';
      for (let r = 0; r < 9; r++) for (let c = 0; c < 4; c++) win += `<rect x="${78 + c * 22}" y="${58 + r * 22}" width="12" height="13" rx="1.5" fill="${(r * 3 + c) % 7 === 2 ? P.goldLt : P.mist}"/>`;
      for (let r = 0; r < 7; r++) for (let c = 0; c < 2; c++) win += `<rect x="${176 + c * 20}" y="${110 + r * 22}" width="11" height="13" rx="1.5" fill="${P.steel}"/>`;
      return svgw('0 0 260 300', `${sh(132, 288, 116, 9)}
        <rect x="166" y="94" width="58" height="190" fill="${P.navy3}"/><rect x="166" y="86" width="58" height="10" fill="${P.navy4}"/>
        <rect x="64" y="40" width="108" height="244" fill="${P.navy}"/><rect x="58" y="32" width="120" height="12" rx="3" fill="${P.navy3}"/>
        ${win}
        <path d="M118 2l16 5v9c0 8-7 13-16 16-9-3-16-8-16-16V7z" fill="${P.gold}"/><path d="M118 9v17" stroke="${P.navy}" stroke-width="2.5" opacity=".5"/>
        <rect x="96" y="250" width="44" height="34" rx="2" fill="${P.gold}"/><path d="M118 250v34" stroke="${P.goldDeep}" stroke-width="2"/>
        <rect x="88" y="244" width="60" height="8" rx="2" fill="${P.navy3}"/>
        <rect x="40" y="282" width="196" height="8" rx="3" fill="${P.navy3}"/>`);
    },
    /** protection badge: shield with an umbrella; the ribbon label is placed over it in HTML */
    shield() {
      return svgw('0 0 130 150', `<path d="M65 8 114 25v44c0 36-22 59-49 72-27-13-49-36-49-72V25z" fill="${P.navy}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M65 18 104 31v38c0 29-17 48-39 59-22-11-39-30-39-59V31z" fill="none" stroke="${P.gold}" stroke-width="3"/>
        <path d="M40 58a25 21 0 0 1 50 0z" fill="${P.gold}"/><path d="M65 58v16c0 6 8 6 8 0" fill="none" stroke="${P.gold}" stroke-width="4" stroke-linecap="round"/>
        <path d="M2 82h126l-8 12 8 12H2l8-12z" fill="${P.goldDeep}"/><rect x="10" y="80" width="110" height="28" rx="3" fill="${P.gold}"/>`);
    },
    chess() {
      const xl = (y) => 44 - (y - 432) / 88 * 40, xr = (y) => 316 + (y - 432) / 88 * 40;
      let cells = '';
      for (let r = 0; r < 4; r++) {
        const y0 = 432 + r * 22, y1 = y0 + 22;
        for (let c = 0; c < 6; c++) {
          const a0 = xl(y0) + c * (xr(y0) - xl(y0)) / 6, a1 = xl(y0) + (c + 1) * (xr(y0) - xl(y0)) / 6;
          const b0 = xl(y1) + c * (xr(y1) - xl(y1)) / 6, b1 = xl(y1) + (c + 1) * (xr(y1) - xl(y1)) / 6;
          cells += `<path d="M${r2(a0)} ${y0}L${r2(a1)} ${y0}L${r2(b1)} ${y1}L${r2(b0)} ${y1}Z" fill="${(r + c) % 2 ? P.mist2 : P.paper}"/>`;
        }
      }
      const pawn = (x, y, dir, fill, dark) => `<g transform="translate(${x} ${y}) scale(${dir} 1)">
          <rect x="0" y="-24" width="22" height="48" rx="9" fill="${dark}"/><rect x="20" y="-17" width="12" height="34" rx="4" fill="${fill}"/>
          <path d="M30 -15 86 -9V9L30 15Z" fill="${fill}"/><rect x="84" y="-13" width="12" height="26" rx="5" fill="${dark}"/>
          <circle cx="114" cy="0" r="21" fill="${fill}"/><path d="M104 -12a14 14 0 0 1 14 -4" stroke="rgba(255,255,255,.4)" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
      const rook = (x, y, dir, fill, dark) => `<g transform="translate(${x} ${y}) scale(${dir} 1)">
          <rect x="0" y="-26" width="22" height="52" rx="9" fill="${dark}"/><path d="M20 -17 90 -13V13L20 17Z" fill="${fill}"/>
          <rect x="88" y="-24" width="24" height="48" rx="3" fill="${fill}"/><rect x="100" y="-14" width="13" height="9" fill="${P.paper}"/><rect x="100" y="5" width="13" height="9" fill="${P.paper}"/></g>`;
      return svgw('0 0 360 560', `${sh(180, 548, 172, 10)}
        <path d="M44 432H316L356 520H4Z" fill="${P.paper}"/>${cells}<path d="M44 432H316L356 520H4Z" fill="none" stroke="${P.navy}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M4 520H356V536H4Z" fill="${P.navy3}"/>
        <g transform="translate(20 0)">
          <path d="M150 52h20v26h24v20h-24v32h-20V98h-24V78h24z" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="2" stroke-linejoin="round"/>
          <path d="M118 198c-20-12-24-56 42-62 66 6 62 50 42 62z" fill="${P.navy}"/>
          <rect x="112" y="194" width="96" height="20" rx="8" fill="${P.navy3}"/>
          <path d="M122 214h76l18 174H104z" fill="${P.navy}"/>
          <path d="M130 238h60" stroke="${P.navy3}" stroke-width="6" stroke-linecap="round"/>
          <rect x="104" y="214" width="112" height="14" rx="6" fill="${P.gold}"/>
          <rect x="88" y="382" width="144" height="24" rx="10" fill="${P.navy3}"/>
          <rect x="76" y="404" width="168" height="42" rx="14" fill="${P.navy}"/>
          <path d="M92 418h136" stroke="${P.gold}" stroke-width="4" stroke-linecap="round" opacity=".8"/>
          <path d="M136 160c4-10 12-14 22-14" stroke="rgba(255,255,255,.25)" stroke-width="6" fill="none" stroke-linecap="round"/>
        </g>
        ${pawn(178, 486, -1, P.gold, P.goldDeep)}${rook(196, 492, 1, P.navy4, P.navy3)}`);
    },
    scale() {
      const pan = (cx, cy) => `<path d="M${cx - 18} ${cy - 92}L${cx - 52} ${cy}M${cx + 18} ${cy - 92}L${cx + 52} ${cy}" stroke="${P.navy3}" stroke-width="2.5"/><path d="M${cx - 62} ${cy}h124c0 22-28 32-62 32s-62-10-62-32z" fill="${P.gold}"/><path d="M${cx - 62} ${cy}h124" stroke="${P.goldDeep}" stroke-width="3" stroke-linecap="round"/>`;
      return svgw('0 0 300 230', `${sh(150, 220, 96, 7)}
        <path d="M150 34V196" stroke="${P.navy}" stroke-width="12" stroke-linecap="round"/>
        <path d="M100 214h100l-16-24h-68z" fill="${P.navy}"/>
        <path d="M54 66 246 50" stroke="${P.navy}" stroke-width="10" stroke-linecap="round"/>
        <circle cx="150" cy="58" r="15" fill="${P.gold}" stroke="${P.navy}" stroke-width="4"/>
        ${pan(54, 160)}${pan(246, 144)}
        <g fill="${P.goldLt}" stroke="${P.goldDeep}" stroke-width="2"><ellipse cx="40" cy="152" rx="16" ry="6"/><ellipse cx="40" cy="146" rx="16" ry="6"/><ellipse cx="66" cy="152" rx="16" ry="6"/></g>
        <rect x="230" y="104" width="34" height="38" rx="5" fill="${P.water}" stroke="${P.navy}" stroke-width="3"/><path d="M230 116h34" stroke="${P.navy}" stroke-width="2" opacity=".5"/>`);
    },
    debtFigure() {
      return svgw('0 0 420 450', `${sh(214, 436, 120, 9)}
        <rect x="30" y="16" width="360" height="166" rx="18" fill="${P.navy}"/>
        <rect x="30" y="16" width="360" height="22" rx="11" fill="${P.navy3}"/>
        <path d="M30 170h360" stroke="${P.navy2}" stroke-width="10"/>
        <path d="M12 70 0 62M12 112H-2M408 70l12-8M408 112h14" stroke="${P.gold}" stroke-width="5" stroke-linecap="round"/>
        <path d="M190 296c0-12 12-22 24-22s24 10 24 22l-6 70c-10 6-26 6-36 0z" fill="${P.gold}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M196 288 156 240l20-52M232 288l42-48-20-52" fill="none" stroke="${P.navy}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="176" cy="186" r="11" fill="${P.navy}"/><circle cx="254" cy="186" r="11" fill="${P.navy}"/>
        <circle cx="214" cy="252" r="25" fill="${P.navy}"/>
        <path d="M202 366 172 398l10 34M226 366l30 32-10 34" fill="none" stroke="${P.navy}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M182 432h-24M246 432h24" stroke="${P.navy}" stroke-width="13" stroke-linecap="round"/>
        <path d="M252 238c-4 6-4 10 0 12 4-2 4-6 0-12zM262 258c-3 5-3 8 0 10 3-2 3-5 0-10z" fill="${P.water}"/>`);
    },
    cashFigure() {
      return svgw('0 0 420 450', `${sh(150, 436, 110, 9)}
        <rect x="168" y="22" width="236" height="160" rx="18" fill="${P.gold}"/>
        <rect x="168" y="22" width="236" height="20" rx="10" fill="${P.goldLt}"/>
        <path d="M150 64l-14-8M150 104h-16M420 60l-8 6" stroke="${P.gold}" stroke-width="5" stroke-linecap="round"/>
        <path d="M98 268c0-12 12-22 24-22s24 10 24 22l-4 78c-10 6-30 6-40 0z" fill="${P.goldLt}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M104 262 86 304l8 40" fill="none" stroke="${P.navy}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M140 262l38-32 34-34" fill="none" stroke="${P.navy}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="214" cy="194" r="11" fill="${P.navy}"/><circle cx="94" cy="346" r="10" fill="${P.navy}"/>
        <circle cx="122" cy="220" r="25" fill="${P.navy}"/>
        <path d="M110 346l-4 44v40M134 346l4 44v40" fill="none" stroke="${P.navy}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M106 432H84M138 432h22" stroke="${P.navy}" stroke-width="13" stroke-linecap="round"/>`);
    },
    walker() {
      const half = `<g fill="none" stroke="${P.navy}" stroke-linecap="round" stroke-linejoin="round">
          <path d="M522 300 470 812" stroke-width="26"/><circle cx="470" cy="826" r="56" stroke-width="20"/><circle cx="470" cy="826" r="12" fill="${P.navy}"/>
          <path d="M448 282h132" stroke-width="44"/></g>
        <g fill="${P.mist2}" stroke="${P.navy}" stroke-width="10" stroke-linejoin="round">
          <path d="M414 -20h162l-4 222H452z"/>
          <path d="M450 206c6-24 116-26 124 0l8 62H444z"/>
          ${[0, 1, 2, 3].map((i) => `<rect x="${446 + i * 32}" y="250" width="31" height="74" rx="15.5"/>`).join('')}
          <path d="M574 222c26 6 38 34 32 64-3 15-18 18-27 7l-12-34z"/></g>
        <path d="M476 230c30-6 62-6 92 0" fill="none" stroke="${P.navy}" stroke-width="6" stroke-linecap="round" opacity=".6"/>`;
      return `<svg viewBox="0 0 1600 900" aria-hidden="true" style="width:100%;height:100%;display:block">
        <g fill="none" stroke="${P.navy}" stroke-linecap="round" stroke-linejoin="round">
          <path d="M538 470h524M552 560h496" stroke-width="20"/><path d="M602 470l-20 120h436l-20-120" stroke-width="14"/></g>
        ${half}<g transform="translate(1600 0) scale(-1 1)">${half}</g>
      </svg>`;
    }
  };

  /** the purchases collage: wedding, education and a car (major life purchases) */
  const collage = (x, y, w, h, cls) => `<div class="b08-collage ${cls || ''}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">
      <div style="left:${w * 0.05}px;top:${h * 0.05}px;width:${w * 0.42}px;height:${h * 0.5}px">${IL.dress()}</div>
      <div style="left:${w * 0.5}px;top:${h * 0.1}px;width:${w * 0.46}px;height:${h * 0.44}px">${IL.books()}</div>
      <div style="left:${w * 0.06}px;top:${h * 0.58}px;width:${w * 0.88}px;height:${h * 0.38}px">${A.ill.car()}</div>
    </div>`;

  /* =====================================================================
     PRSL 1: the strategy defined
     ===================================================================== */
  EFA.screen('prs1', {
    title: 'Strategy definition card',
    copy: {
      head: 'Cash Value Reserve Strategy',
      p1: 'A way to build and strengthen your financial position by avoiding or reducing unnecessary wealth transfers wherever you can, while growing a pool of capital that stays accessible, stays under your control, and is designed to keep compounding without interruption.',
      ruleLab: 'The core rule',
      p2: 'You reach the money in your reserve by borrowing against it as collateral, not by withdrawing it.',
      b1: 'Personal Economic Model',
      b2: 'Economic Value Added',
      _notes: 'Two ideas carry the whole strategy: keep more of what you earn, and keep your capital working while you use it.\n\n- Ask: If you could make a major purchase and still have your savings growing in the background, how would that change the way you buy?\nPAUSE\n\n- The buttons open the Personal Economic Model and Economic Value Added when you want to go deeper.'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="b08-card b08-def">
          ${ctx.t('p1', { tag: 'p', cls: 'p1' })}
          <div class="rule">${IL.key()}<div>${ctx.t('ruleLab', { cls: 'rl' })}${ctx.t('p2', { tag: 'p', cls: 'p2' })}</div></div>
        </div>
        <div class="b08-btnrow" style="top:732px">
          <button class="st-pill" type="button" data-go="PEM|pem1">${ctx.t('b1')}</button>
          <button class="st-pill" type="button" data-go="EVA|eva1">${ctx.t('b2')}</button>
        </div>`;
      ctx.on(ctx.$$('[data-go]'), 'click', (e, n) => { const [k, s] = n.dataset.go.split('|'); ctx.jump(k, s); });
    }
  });

  /* =====================================================================
     The wealth transfers board (MWT mwt1, PRSL prs3)
     ===================================================================== */
  const BT = (label, key, target) => ({ label, key, target });
  const BOARD = {
    personal: [
      [['Mortgage', 'mtg', [BT('Mortgages', 'mtg', ['MTG', 'mtg1']), BT('Mortgage Insurance', 'mtgins')]],
       ['Taxes', 'tax', [BT('Compound Interest', 'ci', ['CI', 'ci1']), BT('Estate Tax', 'esttax', ['FAMEST', 'estates1']), BT('Income Tax', 'inctax', ['INCTAX', 'incTax1']), BT('Property Tax', 'proptax'), BT('Tax on Social Security', 'taxss', ['TAXSS', 'taxonss1']), BT('Estate Planning', 'estplan', ['ESTPLN', 'estplan1'])]]],
      [['Qualified Plans', 'qp', [BT('Do 2 Things', 'qp2', ['QPD2T', 'qpdo2t1']), BT('Tax History', 'taxhist', ['TAXHIST', 'taxhist1'])]],
       ['Protection', 'prot', [BT('Auto Insurance', 'auto', ['AUTOINS', 'autoIns1']), BT('Disability Protection', 'dis', ['DISPROT', 'disprot1']), BT('Homeowners', 'home', ['PH', 'ph1']), BT('Major Medical Coverage', 'med', ['MAJMED', 'majmed1']), BT('Umbrella', 'umb', ['UMBINS', 'umbins1']), BT('Wills and Trusts', 'wills', ['WILLS', 'wills1']), BT('Long-Term Care', 'ltc', ['LTC', 'ltc1']), BT('Term Insurance', 'term', ['TERMINS', 'termins1'])]]],
      [['College Funding', 'col', [BT('Education', 'educ', ['EDUC', 'educ1']), BT('College Expense', 'ce', ['CE', 'ce1'])]],
       ['Major Purchases', 'mp', [BT('Credit Cards', 'cc', ['CC', 'cc1']), BT('Financing a Car', 'fincar', ['FINCARS', 'fincars1']), BT('Trading Cars', 'tradecar', ['TradeCar', 'tradecar1']), BT('Income vs. Expenses', 'wip', ['WIP', 'wip2']), BT('Amortizing vs. Compounding', 'evac', ['EVAC', 'evac1']), BT('Major Capital Purchases', 'mcp', ['MCPF101', 'mcpf1'])]]]
    ],
    business: [
      [['Protection', 'bprot', [BT('Fleet Insurance', 'b.fleet'), BT('Disability Protection', 'b.dis', ['DISPROT', 'disprot1']), BT('Business Overhead', 'b.overhead'), BT('Major Medical Coverage', 'b.med', ['MAJMED', 'majmed1']), BT('Liability Insurance', 'b.liab'), BT('Business Continuation', 'b.cont'), BT('Buy-Sell Agreements', 'b.buysell')]]],
      [['Expenses', 'bexp', [BT('Credit', 'b.credit'), BT('Mortgages', 'b.mtg'), BT('Mortgage Insurance', 'b.mtgins'), BT('Financing', 'b.fin'), BT('Employee Benefits', 'b.benefits')]]],
      [['Taxes', 'btax', [BT('Corporate Income Tax', 'b.corptax'), BT('Tax History', 'b.taxhist', ['TAXHIST', 'taxhist1']), BT('Qualified Accounts', 'b.qp', ['QP', 'qp1']), BT('Corporate vs. Personal Tax', 'b.corpvs'), BT('Deductible Opportunities', 'b.deduct')]]]
    ]
  };
  function boardCopy(extra) {
    const c = {};
    ['personal', 'business'].forEach((v) => BOARD[v].forEach((col) => col.forEach(([g, gk, items]) => {
      c['g.' + gk] = g; items.forEach((it) => { c['i.' + it.key] = it.label; });
    })));
    return Object.assign(c, extra);
  }
  function boardScreen(ctx, headKey, subKey) {
    const back = Ret.take(ctx);
    let biz = back ? back.biz : (ctx.variant === 'business' || ctx.variant === 'bwt');
    const paint = () => {
      const cols = BOARD[biz ? 'business' : 'personal'];
      const pill = (it) => `<button class="st-pill${it.target ? '' : ' inert'}" type="button"${it.target ? ` data-go="${it.target.join('|')}"` : ''}>${ctx.t('i.' + it.key)}</button>`;
      ctx.el.innerHTML = `${head(ctx, biz ? 'headBiz' : headKey, { hcls: 'b08-bh', hattrs: 'data-tog="1"', sub: biz ? 'subBiz' : subKey })}
        <div class="b08-cols">${cols.map((col) => `<div class="b08-col">${col.map(([, gk, items]) => `<div class="b08-grp">${ctx.t('g.' + gk, { tag: 'h3' })}${items.map(pill).join('')}</div>`).join('')}</div>`).join('')}</div>`;
      ctx.on(ctx.$$('[data-tog]'), 'click', () => { biz = !biz; paint(); EFA.numify(ctx.el); });
      ctx.on(ctx.$$('[data-go]'), 'click', (e, n) => { const [k, s] = n.dataset.go.split('|'); Ret.jump(ctx, k, s, { biz }); });
    };
    paint();
  }
  EFA.screen('mwt1', {
    title: 'Wealth transfers board',
    copy: boardCopy({
      head: 'Identify, Reduce or Eliminate Wealth Transfers',
      sub: 'Every topic below is a place money can quietly leave. Choose one to look closer.',
      headBiz: 'Business Wealth Transfers',
      subBiz: 'Where capital quietly leaves a business, and where more of it can be kept.',
      _notes: 'This is the map of where money quietly leaves a household. Let the client point to the topics that feel familiar.\n\n- Ask: Which of these has anyone ever sat down and walked you through?\nPAUSE\n\n- Any topic opens its own presentation, and Back returns here. Click the heading for the business owner view.'
    }),
    render(ctx) { boardScreen(ctx, 'head', 'sub'); }
  });
  EFA.screen('prs3', {
    title: 'Wealth transfers board, capital-transfers heading',
    copy: boardCopy({
      head: 'Spending Capital Creates Wealth Transfers',
      sub: 'Every dollar you spend or move takes its future earnings with it. Choose a topic to look closer.',
      headBiz: 'Business Wealth Transfers',
      subBiz: 'Where capital quietly leaves a business, and where more of it can be kept.',
      _notes: 'Every time capital is spent or moved, the dollar leaves and so does everything it could have earned.\n\n- Ask: Which of these transfers do you think costs your family the most over a lifetime?\nPAUSE\n\n- Any topic opens its own presentation, and Back returns here.'
    }),
    render(ctx) { boardScreen(ctx, 'head', 'sub'); }
  });

  /* =====================================================================
     LTC 1: long-term care title statement
     ===================================================================== */
  EFA.screen('ltc1', {
    title: 'Long-term care risk title card',
    copy: {
      statement: 'Long-term care costs that are not insured can quickly erode everything you have worked to build.',
      _notes: 'Long-term care is one of the few costs that can drain a lifetime of savings in just a few years.\n\n- Ask: If you or your spouse needed care for several years, where would the money come from today?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b08-ltc1-bg">${IL.walker()}</div><div class="b08-ltc1-halo"></div>
        <div class="b08-ltc1-t"><hr class="st-rule">${ctx.t('statement', { tag: 'p' })}<hr class="st-rule"></div>`;
    }
  });

  /* =====================================================================
     PRSL 7: net worth paths of the Debtor, Saver and Wealth Creator
     ===================================================================== */
  EFA.screen('prs7', {
    title: 'Net worth paths of the Debtor, Saver and Wealth Creator',
    steps: 7,
    copy: {
      debtor: 'Debtor', saver: 'Saver', wc: 'Wealth Creator',
      _notes: 'Each line is a person making the same series of purchases over a lifetime.\n\n- The Debtor starts every purchase below zero and works back up. The Saver climbs, then drains to zero at every purchase. The Wealth Creator keeps a reserve compounding and borrows against it.\n- Ask: Which line looks most like your family over the last twenty years?\nPAUSE\n\n- The small spot near the right end of the zero line shows all three at once.'
    },
    render(ctx) {
      const L = 240, T = 135, W = 1072, H = 639;
      const X = (f) => L + f * W, Y = (f) => T + f * H;
      const base = Y(0.64), x0 = X(0.11), x1 = X(0.98), cyc = (x1 - x0) / 6, q = 0.25 * H;
      const piece = (k, inner, cls) => `<g class="pc ${cls}" style="--dl:${k * 300}ms;--fd:${k * 100}ms">${inner}</g>`;
      const C = { debt: P.steel, saver: P.navy4, wc: P.gold, loan: P.goldLt };
      let debt = '', saver = '';
      for (let k = 0; k < 6; k++) {
        const a = x0 + k * cyc;
        let d = `M${r2(a)},${r2(base)}V${r2(base + q)}`, y = base + q;
        for (let s = 1; s <= 5; s++) { y -= q / 5; d += `H${r2(a + s * cyc / 5)}V${r2(y)}`; }
        debt += piece(k + 1, `<path d="${d}" fill="none" stroke="${C.debt}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${r2(a)}" cy="${r2(base)}" r="9" fill="${P.navy}"/>`, 'g-debt');
        let ds = `M${r2(a)},${r2(base)}`, ys = base;
        for (let s = 1; s <= 5; s++) { ys -= q / 5; ds += `V${r2(ys)}H${r2(a + s * cyc / 5)}`; }
        ds += `V${r2(base)}`;
        saver += piece(k + 1, `<path d="${ds}" fill="none" stroke="${C.saver}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${r2(a + cyc)}" cy="${r2(base)}" r="9" fill="${P.navy}"/>`, 'g-saver');
      }
      const R = base - Y(0.02), kk = 2, yc = (x) => { const t = (x - x0) / (x1 - x0); return base - R * (Math.exp(kk * t) - 1) / (Math.exp(kk) - 1); };
      let curve = '';
      for (let i = 0; i <= 80; i++) { const x = x0 + (x1 - x0) * i / 80; curve += `${i ? 'L' : 'M'}${r2(x)},${r2(yc(x))}`; }
      let dots = '', loans = '';
      const drops = [0.19, 0.18, 0.15, 0.12, 0.07];
      for (let k = 1; k <= 6; k++) {
        const x = x0 + k * cyc;
        dots += piece(k, `<circle cx="${r2(x)}" cy="${r2(yc(x))}" r="10" fill="${C.loan}" stroke="${P.goldDeep}" stroke-width="3"/>`, 'g-wc');
      }
      drops.forEach((dr, k) => {
        const xa = x0 + (k + 1) * cyc, ya = yc(xa) + dr * H, xb = xa + cyc, yb = yc(xb);
        let d = `M${r2(xa)},${r2(yc(xa))}V${r2(ya)}`, y = ya;
        for (let s = 1; s <= 5; s++) { y -= (ya - yb) / 5; d += `H${r2(xa + s * cyc / 5)}V${r2(y)}`; }
        loans += piece(k + 1, `<path d="${d}" fill="none" stroke="${C.loan}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="1 0"/>`, 'g-loan');
      });
      ctx.el.innerHTML = `<svg class="b08-p7" viewBox="0 0 1600 900" style="position:absolute;inset:0;width:1600px;height:900px">
          <path d="M${r2(x0)},${r2(base)}H${r2(x1)}" stroke="${P.navy}" stroke-width="10" stroke-linecap="round"/>
          ${loans}${debt}${saver}
          ${piece(1, `<path d="${curve}" fill="none" stroke="${C.wc}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`, 'g-wc')}
          ${dots}
          <text x="${r2(X(0.08))}" y="${r2(base + 12)}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="34" fill="${P.navy}">0</text>
        </svg>
        <div class="b08-p7lab l-wc" style="left:${X(0.12)}px;top:${Y(0.1)}px;color:${P.goldDeep}">${ctx.t('wc')}</div>
        <div class="b08-p7lab l-saver" style="left:${X(0.12)}px;top:${Y(0.38)}px;color:${P.navy4}">${ctx.t('saver')}</div>
        <div class="b08-p7lab l-debt" style="left:${X(0.125)}px;top:${base + 22}px;color:#5f7aa3">${ctx.t('debtor')}</div>
        <div class="b08-p7hot" data-all="1" style="left:${x1 + 10}px;top:${base - 22}px"></div>`;
      ctx._all = false;
      ctx.on(ctx.$('[data-all]'), 'click', () => { ctx._all = !ctx._all; this.step(ctx, ctx.step, 0); });
    },
    step(ctx, n) {
      const all = ctx._all;
      const on = (sel, v) => ctx.$$(sel).forEach((e) => e.classList.toggle('on', v));
      on('.g-debt', all || n === 1); on('.l-debt', all || n === 1);
      on('.g-saver', all || n === 3); on('.l-saver', all || n === 3);
      on('.g-wc', all || n >= 5); on('.l-wc', all || n >= 5);
      on('.g-loan', all || n >= 6);
    }
  });

  /* =====================================================================
     PRSL 11: two questions
     ===================================================================== */
  EFA.screen('prs11', {
    title: 'Two questions: buy without draining the tank?',
    steps: 3,
    copy: {
      head: 'Consider This',
      q1: 'What if you could make the purchase without draining your tank?',
      a1: 'Then your reserve stays in place, still working for you and still compounding.',
      q2: 'If I do not use my own capital, whose capital do I use?',
      a2: 'You borrow from a financial institution and secure the loan by pledging part of your reserve as collateral.',
      _notes: 'This is the turning point of the story.\n\n- Ask the first question and let it sit before you reveal the answer.\nPAUSE\n\n- Ask: If you did not use your own money for a purchase, whose money would you use?\nPAUSE'
    },
    render(ctx) {
      const pair = (q, a) => `<div class="b08-q"><div>${IL.question()}</div>${ctx.t(q, { tag: 'div', cls: 'b08-qc' })}</div>${ctx.t(a, { tag: 'div', cls: `b08-a b08-f x-${a}` })}`;
      ctx.el.innerHTML = `${head(ctx, 'head')}<div class="b08-qa">${pair('q1', 'a1')}${pair('q2', 'a2')}</div>`;
    },
    step(ctx, n) { ctx.show('.x-a1', n >= 1); ctx.show('.x-a2', n >= 2); }
  });

  /* =====================================================================
     The strategy loop: reserve, lender, purchases (prs12, prs16, prs17)
     ===================================================================== */
  /** geometry per screen; columns: c1 tank, c2 lender, c3 arrows, c4 purchases */
  function loopHTML(ctx, cfg) {
    const g = cfg.g, tw = g.tw, th = g.th, ry = Math.round(tw * 0.12);
    const tx = g.c1 - tw / 2, ty = g.base - th, maxFill = th - 2 * ry;
    const fill = Math.round(maxFill * cfg.fill), res = cfg.reserve ? 30 : 0;
    const coll = Math.round(fill * 0.4) - res;
    cfg.px = { fill, fillHi: Math.round(maxFill * 0.92), coll, res };
    const arrowH = Math.round(fill - res - 26);
    const comp = `<div class="b08-comp x-comp" style="left:9px;bottom:${res + ry * 0.4 + 6}px;width:46px;height:${arrowH}px">${upArrow(46, arrowH, P.navy3)}${ctx.t('comp', { cls: 'b08-vt' })}</div>`;
    const plain = cfg.extra ? `<div class="b08-comp x-plain b08-f is-off" style="left:9px;bottom:${res + ry * 0.4 + 6}px;width:46px;height:${arrowH}px">${upArrow(46, arrowH, P.navy3)}</div>` : '';
    const inner = `${comp}${plain}
      ${res ? ctx.t('res', { cls: 'b08-tklab light', attrs: `style="left:56px;right:4px;bottom:${ry * 0.55 + res / 2 - 6}px"` }) : ''}
      ${ctx.t('coll', { cls: 'b08-tklab go b08-delay x-colllab', attrs: `data-coll="1" style="left:54px;right:2px;bottom:${res + ry * 0.4 + coll / 2 - 4}px"` })}
      ${cfg.extra ? ctx.t('sent', { tag: 'div', cls: 'b08-sent b08-delay x-sent', attrs: `style="left:60px;right:10px;bottom:${fill - 70}px"` }) : ''}`;
    const lab = (key, x, cls, attrs) => ctx.t(key, { tag: 'div', cls: 'b08-lab ' + (cls || ''), attrs: `style="left:${x}px;top:${g.base + 14}px" ${attrs || ''}` });
    const bw = g.bw, bh = Math.round(bw * (cfg.insurer ? 300 / 260 : 270 / 260));
    const aw = g.aw, ah = g.ah, ay = g.ay;
    const gap = (g.c2 - bw / 2 + tx + tw) / 2;
    const echo = cfg.echo ? [0.57, 0.75].map((f, i) => {
      const w = Math.round(tw * (i ? 0.84 : 0.7)), h = Math.round(th * f), x = tx - (i ? 66 : 124), mf = h - 2 * Math.round(w * 0.12);
      return tank({ x, y: g.base - h, w, h, fill: Math.round(mf * 0.82), cls: `b08-echo b08-f x-echo${i ? 1 : 2}${i ? '' : ' e2'}` });
    }).join('') : '';
    return `${head(ctx, cfg.headKey || 'head')}
      ${cfg.echo ? `<div class="b08-panel" style="left:${tx - 150}px;top:${ty - 36}px;width:${tw + 196}px;height:${th + 112}px"></div>` : ''}
      ${echo}
      ${tank({ x: tx, y: ty, w: tw, h: th, ry, fill, coll: 0, res, cls: 'x-tank', inner })}
      ${cfg.badge ? `<div class="b08-badge" style="left:${tx - 50}px;top:${ty - 34}px;width:124px;height:143px">${IL.shield()}${ctx.t('badge', { cls: 'bl', attrs: 'style="top:84px"' })}</div>` : ''}
      ${lab('labTank', g.c1)}
      <div class="b08-f x-bank" style="position:absolute;left:${g.c2 - bw / 2}px;top:${g.base - bh}px;width:${bw}px;height:${bh}px">${cfg.insurer ? IL.tower() : A.ill.bank()}</div>
      ${lab('labBank', g.c2, 'b08-f x-bank' + (cfg.bankGo ? ' go' : ''), cfg.bankGo ? 'data-bank="1"' : '')}
      <div class="b08-lien b08-f x-lien" style="left:${gap - 44}px;top:${g.lienY}px">${ctx.t('lien')}${dotArrow(88, 44, P.gold)}</div>
      ${cfg.extra ? `<div class="b08-f x-extra" style="position:absolute;left:${gap - 52}px;top:${g.lienY + 26}px">${blockArrow(104, 44, P.navy4, -1)}</div>
        ${ctx.t('extraCap', { tag: 'div', cls: 'b08-cap b08-f x-extra', attrs: `style="left:${gap}px;top:${g.lienY - 30}px;font-size:15px;line-height:1.15;white-space:normal;width:150px"` })}` : ''}
      ${ctx.t('rcap', { tag: 'div', cls: 'b08-cap b08-f x-rarr', attrs: `style="left:${g.c3}px;top:${ay - 40}px"` })}
      <div class="b08-f x-rarr" style="position:absolute;left:${g.c3 - aw / 2}px;top:${ay}px">${blockArrow(aw, ah, P.navy, 1)}</div>
      <div class="b08-f x-larr" style="position:absolute;left:${g.c3 - aw / 2}px;top:${ay + ah + 22}px">${blockArrow(aw, ah, P.navy4, -1)}</div>
      ${ctx.t('lcap', { tag: 'div', cls: 'b08-cap b08-f x-larr', attrs: `style="left:${g.c3}px;top:${ay + 2 * ah + 34}px"` })}
      ${collage(g.c4 - g.cw / 2, g.base - g.ch, g.cw, g.ch)}
      ${lab('labUse', g.c4, 'go b08-f x-use', 'data-use="1"')}
      <div class="b08-lpbot" style="left:${g.sx}px;right:${g.sx}px;top:${g.sy}px">
        ${ctx.t(cfg.stmtKey || 'stmt', { tag: 'div', cls: 'b08-card b08-stmt b08-f x-stmt', attrs: `style="font-size:${g.fs || 26}px"` })}
        ${cfg.buttons ? `<div class="b08-btnrow b08-f x-btns" style="gap:44px">${cfg.buttons.map(([k, t]) => `<button class="st-pill" type="button" data-go="${t}" style="min-width:250px;min-height:50px;font-size:19px">${ctx.t(k)}</button>`).join('')}</div>` : ''}
        <p class="st-disclaimer" style="margin:0;max-width:${g.dw || 1180}px">${ctx.t('discLead')} ${discHTML(['loans', 'guarantees'])}</p>
      </div>`;
  }
  /** shared step logic for the loop screens. m: first step of each phase */
  function loopStep(ctx, n, cfg) {
    const st = ctx._st, m = cfg.m;
    if (n === 0) { st.released = false; st.cleared = false; }
    if (n < m.use) st.cleared = false;
    const loanOn = n >= m.loan && (m.payoff == null || n < m.payoff);
    const collOn = loanOn && !st.released && !st.cleared;
    setTank(ctx.$('.x-tank'), { coll: collOn ? cfg.px.coll : 0 });
    ctx.show('.x-colllab', collOn); ctx.show('.x-lien', collOn);
    ctx.show('.x-rarr', loanOn && !st.cleared);
    ctx.show('.x-larr', n >= m.use && !st.cleared);
    ctx.show('.x-use', n >= m.use);
    if (m.bank != null) ctx.show('.x-bank', n >= m.bank);
    ctx.show('.x-stmt', n >= m.stmt); ctx.show('.x-btns', n >= m.stmt);
    if (cfg.extra) {
      const ex = n >= m.extra;
      ctx.show('.x-extra', ex); ctx.show('.x-sent', ex); ctx.show('.x-plain', ex); ctx.show('.x-comp', !ex);
      ctx.show('.x-echo1', ex); ctx.show('.x-echo2', ex);
      setTank(ctx.$('.x-tank'), { fill: ex ? cfg.px.fillHi : cfg.px.fill });
    }
  }
  function loopWire(ctx, cfg, self) {
    const back = Ret.take(ctx);
    ctx._st = back || { released: false, cleared: false };
    const state = () => ({ released: ctx._st.released, cleared: ctx._st.cleared });
    ctx.on(ctx.$('[data-coll]'), 'click', () => { if (ctx.step >= cfg.m.loan) { ctx._st.released = true; self.step(ctx, ctx.step, 0); } });
    ctx.on(ctx.$('[data-use]'), 'click', () => {
      if (ctx.step < cfg.m.use) return;
      ctx._st.cleared = !ctx._st.cleared;
      if (!ctx._st.cleared) ctx._st.released = false;
      self.step(ctx, ctx.step, 0);
    });
    const bank = ctx.$('[data-bank]');
    if (bank) ctx.on(bank, 'click', () => Ret.jump(ctx, 'PC', 'pc1', state()));
    ctx.on(ctx.$$('[data-go]'), 'click', (e, n) => { const [k, s] = n.dataset.go.split('|'); Ret.jump(ctx, k, s, state()); });
    nobr(ctx.el);
  }

  const LOOP12 = {
    g: { c1: 288, c2: 640, c3: 985, c4: 1322, base: 512, tw: 196, th: 346, bw: 300, aw: 280, ah: 92, ay: 256, cw: 336, ch: 374, lienY: 296, sx: 240, sy: 604, dw: 1120 },
    fill: 0.92, m: { bank: 1, loan: 2, use: 3, stmt: 4 }
  };
  EFA.screen('prs12', {
    title: 'How the strategy works: reserve, lender, purchase',
    steps: 5,
    copy: {
      head: 'The Reserve Strategy at Work',
      labTank: 'Your Reserve', labBank: 'Financial Institution', labUse: 'Use and Control',
      comp: 'Compounding', coll: 'Collateral', lien: 'Lien',
      rcap: 'Amortizing Loan', lcap: 'Scheduled Payments of\nPrincipal and Interest',
      stmt: 'The strength of the strategy: the funds you pledge as collateral are designed to keep earning compound interest while the loan is repaid.',
      discLead: 'Illustrative concept: results depend on the asset pledged as collateral and its loan terms, and loan interest is a cost.',
      _notes: 'Your reserve stays full and keeps working. The institution places a lien on part of it, lends you the money for the purchase, and you repay on a schedule.\n\n- Click Collateral to release the lien once the loan is repaid. Click Use and Control to show the finished loan.\n- Ask: While you repay the loan, what is your reserve doing?\nPAUSE'
    },
    render(ctx) { ctx.el.innerHTML = loopHTML(ctx, LOOP12); loopWire(ctx, LOOP12, this); },
    step(ctx, n) { loopStep(ctx, n, LOOP12); }
  });

  const LOOP16 = {
    g: { c1: 300, c2: 640, c3: 985, c4: 1322, base: 456, tw: 172, th: 300, bw: 240, aw: 260, ah: 80, ay: 222, cw: 296, ch: 322, lienY: 250, sx: 104, sy: 532, fs: 23 },
    fill: 0.92, reserve: true, badge: true, insurer: true, bankGo: true,
    buttons: [['b1', 'EE|ee1'], ['b2', 'UPL|upl1'], ['b3', 'TMLI|tmli1']],
    m: { loan: 1, use: 2, stmt: 3 }
  };
  const PRS16_STMT = 'Properly designed and used, cash value life insurance can offer steady growth, cash value you can pledge as collateral, a contractual right to policy loans, tax-deferred growth, and a death benefit that is ' + TXT.taxfree + '. Optional riders can add more.';
  EFA.screen('prs16', {
    title: 'Cash value life insurance as the private reserve',
    steps: 4,
    copy: {
      head: 'Cash Value Life Insurance as Your Reserve',
      headAtc: 'Cash Value Policy Loans',
      labTank: 'Policy Cash Value', labBank: 'Insurance Company', labUse: 'Use and Control',
      comp: 'Compounding', coll: 'Collateral', lien: 'Lien', res: 'Reserve', badge: 'Death Benefit',
      rcap: 'Interest-Only Loan', lcap: 'Unstructured Payments:\nYou Decide',
      stmt: PRS16_STMT,
      b1: 'Expenses', b2: 'Opportunities', b3: '10-Minute Lesson',
      discLead: 'Loan interest accrues and is added to the loan if it is not paid.',
      _notes: 'Now the reserve is the cash value of a life insurance policy, and the lender is the insurance company. You decide when and how much to repay.\n\n- Click Insurance Company for Position of Choice. The buttons open the expense example, policy loan opportunities and the 10-minute lesson.\n- Ask: How would it feel to set your own repayment schedule?\nPAUSE'
    },
    render(ctx) {
      const cfg = Object.assign({}, LOOP16, { headKey: ctx.variant === 'AccessToCapital' ? 'headAtc' : 'head' });
      if (ctx.variant === 'hideButtons' || ctx.variant === 'atc') cfg.buttons = null;
      ctx._cfg = cfg;
      ctx.el.innerHTML = loopHTML(ctx, cfg); loopWire(ctx, cfg, this);
    },
    step(ctx, n) { loopStep(ctx, n, ctx._cfg); }
  });

  const LOOP17 = {
    g: { c1: 318, c2: 690, c3: 1010, c4: 1332, base: 456, tw: 172, th: 300, bw: 236, aw: 250, ah: 78, ay: 222, cw: 290, ch: 322, lienY: 250, sx: 104, sy: 532, fs: 23 },
    fill: 0.84, reserve: true, badge: true, insurer: true, bankGo: true, echo: true, extra: true,
    buttons: [['b1', 'EVAC|evac1'], ['b2', 'EVA|eva1']],
    m: { loan: 1, use: 2, payoff: 3, extra: 4, stmt: 5 }
  };
  EFA.screen('prs17', {
    title: 'The efficiency enhancer (repaying faster refills the reserve)',
    steps: 6,
    copy: {
      head: 'The Efficiency Enhancer',
      labTank: 'Policy Cash Value', labBank: 'Insurance Company', labUse: 'Use and Control',
      comp: 'Compounding', coll: 'Collateral', lien: 'Lien', res: 'Reserve', badge: 'Death Benefit',
      rcap: 'Interest-Only Loan', lcap: 'Accelerated Principal and\nInterest Payments',
      extraCap: 'Extra Cash Flow',
      sent: 'Extra cash flow fills the policy to its allowable limit.',
      stmt: PRS16_STMT,
      b1: 'Calculator', b2: 'Economic Value Added',
      discLead: 'Funding stays within the federal tax-law premium limits that keep the policy from being classified as a modified endowment contract (MEC).',
      _notes: 'Repay the loan faster than you have to. Once it is gone, keep the same cash flow going into the policy, up to the limits that keep it from becoming a MEC.\n\n- Ask: Once the loan is repaid, where would that payment go if you just kept making it?\nPAUSE\n\n- Calculator opens How Would You Like to Pay for It; the other button opens Economic Value Added.'
    },
    render(ctx) { ctx.el.innerHTML = loopHTML(ctx, LOOP17); loopWire(ctx, LOOP17, this); },
    step(ctx, n) { loopStep(ctx, n, LOOP17); }
  });

  /* =====================================================================
     Engines (exposed for reuse: EFA.engines.*)
     ===================================================================== */
  EFA.engines = EFA.engines || {};
  /** iabp1 / iap1: value of an amount after n years of inflation i. mode 'bp' = today's buying power, 'need' = income needed */
  const inflEngine = EFA.engines.inflationBuyingPower = function (amount, i, n, mode) {
    const f = Math.pow(1 + i, n);
    if (!f) return 0;
    return mode === 'need' ? amount * f : amount / f;
  };
  /** ltc2: how many years liquid assets last when care costs are added to income needs (spec formula, kept for parity) */
  const ltcEngine = EFA.engines.ltcAssetsLast = function (o) {
    const r = o.ret, i = o.infl;
    let expense = o.care + o.income, endBal = o.assets, year = 0, begin = 0;
    const rows = [];
    do {
      begin = endBal;
      const interest = begin * r;
      endBal = begin + interest - expense;
      rows.push({ year: year + 1, begin, interest, expense, end: endBal });
      expense = expense * (1 + i);
      year++;
    } while (!(endBal <= 0 || year === 100));
    const neverOut = endBal > 0;
    const years = expense === 0 ? Infinity : (year - 1) + begin / expense;
    return { years, rows, neverOut };
  };
  /** majmed1: premiums in plain dollars and at opportunity cost (premiums paid at the start of each year) */
  const premEngine = EFA.engines.premiumOpportunityCost = function (premium, r, n) {
    const plain = n * premium;
    const atInterest = r === 0 ? n * premium : premium * (1 + r) * (Math.pow(1 + r, n) - 1) / r;
    return { plain, atInterest };
  };

  /* calculator styles */
  EFA.css('b08-calc', `
  .b08-in { box-sizing: border-box; padding: 10px 38px; }
  .b08-irow { display: grid; grid-template-columns: 1fr 236px; align-items: center; gap: 24px; padding: 12px 0; border-bottom: 1px solid rgba(13,30,58,.09); }
  .b08-irow:last-child { border-bottom: 0; }
  .b08-ilab { display: flex; align-items: center; gap: 12px; font: 600 25px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b08-irow .st-input { height: 54px; text-align: right; font-size: 24px; }
  .b08-calcbtn { position: absolute; left: 0; right: 0; display: flex; justify-content: center; }
  .stage .b08-calcbtn .st-pill { min-width: 240px; min-height: 54px; font-size: 20px; letter-spacing: .06em; box-shadow: 0 10px 24px rgba(13,30,58,.18); }
  .b08-res { box-sizing: border-box; padding: 24px 44px 26px; text-align: center; transition: opacity .6s ease, transform .6s ease; }
  .b08-res.is-off { transform: translateY(12px); }
  .b08-res .cap { margin: 0; font: 600 23px/1.3 "DM Sans", sans-serif; color: #1d3863; }
  .b08-res .line { margin-top: 8px; font: 600 30px/1.1 "DM Sans", sans-serif; color: #0d1e3a; display: flex; align-items: baseline; justify-content: center; gap: 12px; }
  .b08-res .line .v { font-size: 66px; font-weight: 700; color: #8a6e22; letter-spacing: -.01em; }
  .b08-res .line .n { font-weight: 700; }
  .b08-meter { display: grid; grid-template-columns: 170px 1fr 170px; gap: 12px 18px; align-items: center; margin: 20px auto 0; width: 900px; }
  .b08-meter .ml { text-align: right; font: 700 15px/1.1 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #667389; white-space: nowrap; }
  .b08-meter .tr { position: relative; height: 24px; background: #e3e8f0; border-radius: 12px; overflow: hidden; }
  .b08-meter .fl { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 12px; transition: width .35s ease; }
  .b08-meter .fv { text-align: left; font: 700 19px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b08-ctl { display: flex; align-items: center; justify-content: center; gap: 22px; margin-top: 22px; }
  .b08-range { -webkit-appearance: none; appearance: none; width: 560px; height: 8px; border-radius: 4px; outline: none; background: linear-gradient(90deg, #b8972e var(--p, 0%), #cbd5e3 var(--p, 0%)); cursor: pointer; }
  .b08-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 30px; height: 30px; border-radius: 50%; background: #0d1e3a; border: 5px solid #d5bd68; box-shadow: 0 3px 8px rgba(13,30,58,.3); }
  .b08-range::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: #0d1e3a; border: 5px solid #d5bd68; }
  .stage .b08-tog { min-height: 44px; min-width: 140px; gap: 10px; padding: 8px 20px; font-size: 17px; }
  .stage .b08-tog svg { flex: 0 0 auto; }
  .stage .b08-tog.on { background: #b8972e; border-color: #b8972e; color: #0d1e3a; }
  .b08-swap { width: 30px; height: 30px; border-radius: 50%; border: 0; background: #0d1e3a; display: inline-grid; place-items: center; cursor: pointer; padding: 0; flex: 0 0 auto; }
  .b08-swap:hover { background: #b8972e; }
  .b08-modebtn { position: absolute; left: 0; right: 0; display: flex; justify-content: center; }
  .stage .b08-modebtn .st-pill { min-height: 48px; min-width: 260px; font-size: 18px; background: transparent; color: #0d1e3a; border: 1.5px solid #0d1e3a; }
  .stage .b08-modebtn .st-pill:hover { background: #b8972e; border-color: #b8972e; }
  .b08-hg { flex: 0 0 auto; width: 76px; height: 110px; }
  .b08-ltcres { box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 30px; padding: 18px 40px; }
  .b08-ltcres .t { font: 600 30px/1.2 "DM Sans", sans-serif; color: #0d1e3a; text-align: left; }
  .b08-ltcres .v { display: inline-block; font: 700 64px/1 "DM Sans", sans-serif; color: #8a6e22; margin: 0 10px; vertical-align: -6px; }
  .b08-doclink { position: absolute; left: 0; right: 0; display: flex; justify-content: center; }

  /* major medical */
  .b08-mm { position: absolute; left: 160px; width: 1280px; top: 24px; }
  .b08-mmtabs { display: flex; justify-content: space-between; align-items: flex-end; height: 56px; }
  .b08-mmtab { width: 236px; height: 54px; box-sizing: border-box; display: grid; place-items: center; background: #e3e8f0; border: 1px solid #cbd5e3; border-bottom: 0; border-radius: 14px 14px 0 0; font: 700 22px/1 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #0d1e3a; }
  .b08-mmtab.alt { background: #f0e6c4; border-color: #d5bd68; }
  .b08-mmtitle { font: 600 34px/1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; padding-bottom: 10px; }
  .b08-mmcard { position: relative; box-sizing: border-box; padding: 8px 0; border-radius: 0 0 16px 16px; }
  .b08-mmrow { display: grid; grid-template-columns: 236px 1fr 236px; align-items: center; gap: 0; padding: 7px 0; border-bottom: 1px solid rgba(13,30,58,.08); }
  .b08-mmrow:last-child { border-bottom: 0; }
  .b08-mmrow .lab { text-align: center; font: 700 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b08-mmrow .st-field { padding: 0 22px; }
  .stage .b08-mmrow .st-input { height: 46px; font-size: 21px; text-align: right; }
  .b08-mmage { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 18px; font: 600 23px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b08-mmage .st-field { width: 96px; }
  .stage .b08-mmage .st-input { height: 46px; text-align: center; font-size: 22px; padding: 0 8px; }
  .b08-mmres { position: absolute; left: 160px; width: 1280px; box-sizing: border-box; padding: 16px 30px 18px; background: #f7f4ef; border: 1px solid #d6cfc4; border-radius: 16px; }
  .b08-mmres table { width: 100%; border-collapse: collapse; font: 600 21px/1.25 "DM Sans", sans-serif; color: #0d1e3a; font-variant-numeric: lining-nums tabular-nums; }
  .b08-mmres th { font: 700 13px/1.2 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6e22; text-align: right; padding: 4px 14px 8px; border-bottom: 2px solid #b8972e; }
  .b08-mmres th:first-child, .b08-mmres td:first-child { text-align: left; }
  .b08-mmres td { padding: 9px 14px; text-align: right; border-bottom: 1px solid rgba(13,30,58,.09); }
  .b08-mmres td.d { color: #8a6e22; font-weight: 700; }
  .b08-mmres .sum { margin: 12px 0 0; font: 600 21px/1.35 "DM Sans", sans-serif; color: #1d3863; }
  .b08-mmlinks { position: absolute; left: 0; right: 0; display: flex; justify-content: center; gap: 46px; }
  .b08-tl { background: none; border: 0; padding: 4px 2px; font: 700 18px/1 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #0d1e3a; border-bottom: 2px solid #b8972e; cursor: pointer; }
  .b08-tl:hover { color: #8a6e22; }
  .b08-ck ol { margin: 0; padding-left: 30px; display: grid; gap: 7px; font: 500 19px/1.35 "DM Sans", sans-serif; color: #0d1e3a; columns: 2; column-gap: 46px; display: block; }
  .b08-ck li { margin-bottom: 8px; break-inside: avoid; }
  .b08-ck .dch { margin: 22px 0 8px; font: 700 13px/1 "DM Sans", sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #8a6e22; }
  .b08-ck .dc { margin: 0 0 6px; font: 400 15px/1.45 "DM Sans", sans-serif; color: #667389; }
  .b08-choose { display: grid; gap: 14px; justify-items: center; padding: 10px 0 6px; }
  .b08-choose .st-pill { min-width: 380px; }
  .stage .b08-ov-sm .st-overlay-in { width: 620px; }
  `);

  /* =====================================================================
     IABP 1 and IAP 1: inflation and buying power
     ===================================================================== */
  const ICON = {
    play: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>',
    pause: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" fill="currentColor"/></svg>',
    swap: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f7f5f1" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h14l-4-4M20 16H6l4 4"/></svg>',
    cycle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg>'
  };
  /** cfg: {kind: 'iabp'|'iap', key, def, lb1(mode), withMode} */
  function inflScreen(ctx, cfg) {
    const S = visitState(() => ({ shown: false, n: 0, mode: 'bp', meaning: 'pay' }));
    S.auto = false;
    const lb1 = () => (cfg.kind === 'iap' ? (S.meaning === 'pay' ? 'lbPay' : 'lbBal') : 'lbIncome');
    const top = 168;
    ctx.el.innerHTML = `${head(ctx, 'head')}
      <div class="b08-card b08-in" style="left:400px;width:800px;top:${top}px">
        <div class="b08-irow"><div class="b08-ilab"><span class="x-lb1">${ctx.t(lb1())}</span>${cfg.kind === 'iap' ? `<button type="button" class="b08-swap" data-swap="1">${ICON.swap}</button>` : ''}</div>${sfield(ctx, { id: 'amt', key: cfg.key, type: 'money', value: cfg.def })}</div>
        <div class="b08-irow"><div class="b08-ilab">${ctx.t('lbInfl')}${infLink(ctx, { field: 'infl' })}</div>${sfield(ctx, { id: 'infl', key: 'case_file_ror_inflation', type: 'pct', value: 0.03, dp: 2 })}</div>
      </div>
      <div class="b08-calcbtn x-calc" style="top:${top + 214}px"><button class="st-pill" type="button" data-calc="1">${ctx.t('calc')}</button></div>
      <div class="b08-card b08-res b08-f x-res" style="left:240px;width:1120px;top:${top + 262}px">
        <p class="cap x-cap"></p>
        <div class="line"><span class="num n x-n">0</span><span class="x-yrs"></span><span class="num v x-v"></span></div>
        <div class="b08-meter">
          <span class="ml">${ctx.t('mToday')}</span><div class="tr"><i class="fl x-f1" style="background:#1d3863"></i></div><span class="fv num x-m1"></span>
          <span class="ml x-mlab"></span><div class="tr"><i class="fl x-f2" style="background:linear-gradient(90deg,#d5bd68,#b8972e)"></i></div><span class="fv num x-m2"></span>
        </div>
        <div class="b08-ctl"><input class="b08-range" type="range" min="1" max="100" step="1" value="1" aria-label="${EFA.util.esc(ctx.text('yrs'))}"><button type="button" class="st-pill b08-tog" data-auto="1"></button></div>
      </div>
      ${cfg.withMode ? `<div class="b08-modebtn" style="top:${top + 588}px"><button class="st-pill" type="button" data-mode="1"></button></div>` : ''}
      <p class="st-disclaimer b08-disc" style="top:${cfg.withMode ? 812 : 800}px">${ctx.t('assume')} ${discHTML('hypothetical')}</p>`;
    const rng = ctx.$('.b08-range');
    const paint = () => {
      const v = ctx.values(), amt = +v.amt || 0, i = +v.infl || 0, n = S.n;
      const mode = cfg.kind === 'iap' ? 'bp' : S.mode;
      const res = inflEngine(amt, i, n, mode);
      ctx.$('.x-n').textContent = String(n);
      ctx.$('.x-yrs').innerHTML = ctx.t(n === 1 ? 'yr' : 'yrs');
      ctx.$('.x-v').textContent = F.money(res, { dp: 2 });
      // caption
      let cap;
      if (cfg.kind === 'iap') cap = S.meaning === 'pay' ? ctx.t('capPay') : `${ctx.t('capBal1')} <span class="num">${F.money(amt)}</span> ${ctx.t('capBal2')}`;
      else cap = S.mode === 'bp' ? ctx.t('capBP') : `${ctx.t('capNd1')} <span class="num">${F.money(amt)}</span> ${ctx.t('capNd2')}`;
      ctx.$('.x-cap').innerHTML = cap;
      // meter: today against year n
      const top2 = Math.max(Math.abs(amt), Math.abs(res), 1);
      ctx.$('.x-f1').style.width = (100 * Math.max(0, amt) / top2) + '%';
      ctx.$('.x-f2').style.width = (100 * Math.max(0, res) / top2) + '%';
      ctx.$('.x-m1').textContent = F.money(amt);
      ctx.$('.x-m2').textContent = F.money(res);
      ctx.$('.x-mlab').innerHTML = `${ctx.t('mIn')} <span class="num">${n}</span> ${ctx.t(n === 1 ? 'mYr' : 'mYrs')}`;
      rng.value = String(Math.max(1, n)); rng.style.setProperty('--p', ((Math.max(1, n) - 1) / 99 * 100) + '%');
      const ab = ctx.$('[data-auto]');
      ab.innerHTML = (S.auto ? ICON.pause : ICON.play) + ctx.t(S.auto ? 'autoOff' : 'autoOn');
      ab.classList.toggle('on', S.auto);
      const mb = ctx.$('[data-mode]');
      if (mb) mb.innerHTML = ctx.t(S.mode === 'bp' ? 'modeNeed' : 'modeBP');
      ctx.show('.x-res', S.shown); ctx.show('.x-calc', !S.shown);
      EFA.numify(ctx.el);
    };
    const tick = () => { if (!S.auto) return; if (S.n >= 100) { S.auto = false; paint(); return; } S.n++; paint(); if (S.n >= 100) { S.auto = false; paint(); return; } ctx.timeout(tick, 500); };
    ctx.onFields(paint);
    ctx.on(ctx.$('[data-calc]'), 'click', () => { S.shown = true; paint(); });
    ctx.on(rng, 'input', () => { S.n = Math.max(1, Math.min(100, Math.round(+rng.value))); paint(); });
    ctx.on(ctx.$('[data-auto]'), 'click', () => { S.auto = !S.auto; paint(); if (S.auto) ctx.timeout(tick, 500); });
    const mb = ctx.$('[data-mode]');
    if (mb) ctx.on(mb, 'click', () => { S.mode = S.mode === 'bp' ? 'need' : 'bp'; paint(); });
    const sw = ctx.$('[data-swap]');
    if (sw) ctx.on(sw, 'click', () => { S.meaning = S.meaning === 'pay' ? 'bal' : 'pay'; ctx.$('.x-lb1').innerHTML = ctx.t(lb1()); paint(); });
    paint();
  }
  EFA.screen('iabp1', {
    title: 'Inflation and retirement buying power calculator',
    copy: {
      head: 'Inflation Decides What Your Income Will Buy',
      lbIncome: 'Desired Retirement Income', lbInfl: 'Inflation Rate',
      calc: 'Calculate',
      capBP: 'What that income will feel like in today’s dollars',
      capNd1: 'The income you will need to keep the buying power of', capNd2: 'today',
      yrs: 'years from now', yr: 'year from now',
      mToday: 'Today', mIn: 'In', mYrs: 'years', mYr: 'year',
      autoOn: 'Play', autoOff: 'Pause',
      modeNeed: 'Show Income Needed', modeBP: 'Show Buying Power',
      assume: 'Assumes one constant inflation rate every year.',
      _notes: 'A fixed income loses buying power every year, quietly. Slide the years, or press Play and watch it happen.\n\n- Ask: If your income stayed the same for twenty years, what would you have to give up?\nPAUSE\n\n- Show Income Needed flips the question: what you will need later to live the way you live today.'
    },
    render(ctx) { inflScreen(ctx, { kind: 'iabp', key: 'retirement_income_desired', def: 96000, withMode: true }); }
  });
  EFA.screen('iap1', {
    title: 'Inflation-adjusted value of a future payment',
    copy: {
      head: 'What Will Future Payments Really Be Worth?',
      lbPay: 'Current Monthly Payment', lbBal: 'Current Account Balance', lbInfl: 'Inflation Rate',
      calc: 'Calculate',
      capPay: 'How that same monthly payment will feel in today’s dollars',
      capBal1: 'What a balance of', capBal2: 'will be worth in today’s dollars',
      yrs: 'years from now', yr: 'year from now',
      mToday: 'Today', mIn: 'In', mYrs: 'years', mYr: 'year',
      autoOn: 'Play', autoOff: 'Pause',
      assume: 'Assumes one constant inflation rate every year.',
      _notes: 'A payment that never changes feels smaller every year. That works in your favor on a fixed mortgage payment, and against you on a fixed balance sitting still.\n\n- Ask: What will this payment feel like in fifteen years, compared with what it feels like today?\nPAUSE\n\n- The round icon next to the first label switches between a monthly payment and an account balance.'
    },
    render(ctx) { inflScreen(ctx, { kind: 'iap', key: 'house_payment_or_equity', def: 750, withMode: false }); }
  });

  /* =====================================================================
     LTC 2: how long liquid assets last during an extended-care event
     ===================================================================== */
  const hourglass = () => svgw('0 0 90 130', `${sh(45, 124, 34, 4)}
      <rect x="10" y="4" width="70" height="10" rx="4" fill="${P.navy}"/><rect x="10" y="112" width="70" height="10" rx="4" fill="${P.navy}"/>
      <path d="M18 14h54c0 26-20 34-20 49s20 23 20 49H18c0-26 20-34 20-49S18 40 18 14z" fill="${P.paper}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M27 30h36c-3 12-12 18-18 24-6-6-15-12-18-24z" fill="${P.goldLt}"/><path d="M45 63v30" stroke="${P.gold}" stroke-width="3" stroke-dasharray="3 5"/>
      <path d="M26 108c4-12 12-16 19-17 7 1 15 5 19 17z" fill="${P.gold}"/>`, 'b08-hg');
  EFA.screen('ltc2', {
    title: 'How long will liquid assets last during an extended-care event?',
    copy: {
      head: 'How Long Will Your Money Last?',
      lbAssets: 'Liquid Assets', lbRet: 'Investment Return', lbIncome: 'Current Income Needs', lbCare: 'Annual Extended Care Cost', lbInfl: 'Inflation Rate',
      calc: 'Calculate',
      res1: 'Your liquid assets will last', res2: 'years',
      wsHead: 'How Long Will Your Assets Last?', wsYear: 'Year', wsBegin: 'Assets at Beginning of Year', wsInt: 'Annual Interest Earned', wsExp: 'Expenses During Year', wsEnd: 'Assets at End of Year',
      wsWait: 'Documentation loading',
      assume: 'Assumes a constant return and inflation rate, with care costs and household income needs paid from liquid assets each year.',
      _notes: 'Extended care is paid on top of what the household already needs to live on. That is what drains savings so fast.\n\n- Ask: If care were needed starting next year, how long would your liquid savings carry the family?\nPAUSE\n\n- Documentation shows every year of the drawdown.'
    },
    render(ctx) {
      const S = visitState(() => ({ shown: false }));
      const row = (lab, fld, extra) => `<div class="b08-irow"><div class="b08-ilab">${ctx.t(lab)}${extra || ''}</div>${fld}</div>`;
      const calc = () => {
        const v = ctx.values();
        return ltcEngine({ assets: +v.assets || 0, ret: +v.ret || 0, income: +v.income || 0, care: +v.care || 0, infl: +v.infl || 0 });
      };
      const sheet = () => ({
        heading: ctx.t('wsHead'), size: 'full',
        columns: [
          { field: 'year', header: ctx.t('wsYear'), type: 'year', width: 90 },
          { field: 'begin', header: ctx.t('wsBegin'), type: 'money', dp: 2 },
          { field: 'interest', header: ctx.t('wsInt'), type: 'money', dp: 2 },
          { field: 'expense', header: ctx.t('wsExp'), type: 'money', dp: 2 },
          { field: 'end', header: ctx.t('wsEnd'), type: 'money', dp: 2 }
        ],
        rows: calc().rows,
        assumptions: [
          { label: ctx.t('lbAssets'), value: F.money(ctx.values().assets) }, { label: ctx.t('lbRet'), value: F.pct(ctx.values().ret) },
          { label: ctx.t('lbIncome'), value: F.money(ctx.values().income) }, { label: ctx.t('lbCare'), value: F.money(ctx.values().care) },
          { label: ctx.t('lbInfl'), value: F.pct(ctx.values().infl) }
        ],
        file: 'how-long-will-assets-last'
      });
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="b08-card b08-in" style="left:380px;width:840px;top:150px">
          ${row('lbAssets', sfield(ctx, { id: 'assets', key: 'case_file_accumulated_savings', type: 'money', value: 88000 }))}
          ${row('lbRet', sfield(ctx, { id: 'ret', key: 'case_file_ror_accumulation', type: 'pct', value: 0.06, max: 0.12, dp: 2 }))}
          ${row('lbIncome', ctx.field({ id: 'income', type: 'money', value: 50000 }))}
          ${row('lbCare', ctx.field({ id: 'care', type: 'money', value: 50000 }))}
          ${row('lbInfl', sfield(ctx, { id: 'infl', key: 'case_file_ror_inflation', type: 'pct', value: 0.03, dp: 2 }), infLink(ctx, { field: 'infl' }))}
        </div>
        <div class="b08-calcbtn x-calc" style="top:580px"><button class="st-pill" type="button" data-calc="1">${ctx.t('calc')}</button></div>
        <div class="b08-card b08-ltcres b08-res b08-f x-res" style="left:380px;width:840px;top:568px">${hourglass()}<div class="t">${ctx.t('res1')}<span class="v num x-v"></span>${ctx.t('res2')}</div></div>
        <div class="b08-doclink b08-f x-res" style="top:722px">${wsButton(ctx, { data: sheet, look: 'link' })}</div>
        <p class="st-disclaimer b08-disc" style="top:790px">${ctx.t('assume')} ${discHTML('hypothetical')}</p>`;
      guard(ctx, 'ret');
      const paint = () => {
        const r = calc();
        const y = r.years;
        ctx.$('.x-v').textContent = !isFinite(y) || r.neverOut ? '100+' : F.num(Math.max(0, y), 1);
        ctx.show('.x-res', S.shown); ctx.show('.x-calc', !S.shown);
      };
      ctx.onFields(paint);
      ctx.on(ctx.$('[data-calc]'), 'click', () => { S.shown = true; paint(); });
      paint();
    }
  });

  /* =====================================================================
     MAJMED 1: current versus alternative major medical policy
     ===================================================================== */
  const CK = ['Reviewed all existing health coverage, through an employer or individually.', 'Reviewed HMO and PPO benefits.', 'Evaluated major medical benefits.',
    'Checked whether individual-policy deductibles are appropriate.', 'Checked co-insurance levels.', 'Made sure you understand your personal share of medical costs.',
    'Made recommendations on group or individual health coverage.', 'Reviewed the need for, or any existing, long-term care coverage.',
    'Identified benefit triggers and compared existing triggers with current products.', 'Determined the levels of care covered.', 'Weighed home care against facility care.',
    'Evaluated elimination periods.', 'Reviewed benefit levels against current costs and other income.', 'Made recommendations on long-term care coverage.'];
  const mmCopy = {
    title: 'Major Medical Coverage', tabCur: 'Current', tabAlt: 'Alternative',
    rLife: 'Lifetime Benefits', rDed: 'Deductible', rOop: 'Potential Out-of-Pocket Cost', rPrem: 'Annual Premium', rOpp: 'Opportunity Cost',
    age1: 'Compare the two scenarios from age', age2: 'to age',
    calc: 'Calculate',
    tH0: 'Over', tH0b: 'years', colCur: 'Current', colAlt: 'Alternative', colDiff: 'Difference',
    t1: 'Total premiums', t2: 'Premiums plus what they could have earned', t3: 'Potential out-of-pocket cost',
    sumS1: 'The alternative saves', sumC1: 'The alternative costs', sumMid: 'in premiums, and', sumS2: 'once you count what those premiums could have earned.',
    sumMore: 'more',
    linkCk: 'Checklist', linkDoc: 'Documentation',
    chooseHead: 'Choose a worksheet', chooseCur: 'Current Policy Worksheet', chooseAlt: 'Alternative Policy Worksheet',
    wsCur: 'Current Policy Worksheet', wsAlt: 'Alternative Policy Worksheet',
    wsAge: 'Age', wsPrem: 'Premium', wsCum: 'Cumulative Premiums', wsBoy: 'Premiums at Interest, Beginning of Year', wsInt: 'Interest on Premiums', wsEoy: 'Premiums at Interest, End of Year', wsYear: 'Year',
    ckTitle: 'Health and Long-Term Care Insurance Checklist', ckLead: 'Items your consultant reviews with you:',
    dch: 'Please keep in mind',
    dc1: 'These calculators illustrate financial principles. They are not a solicitation or a recommendation; talk with an appropriately licensed consultant about your own situation.',
    dc2: 'This is not tax or legal advice, and it cannot be used to avoid federal tax penalties.',
    dc3: 'Projections are hypothetical and not guaranteed. Returns cannot be guaranteed, and results depend on the information you provide.',
    wsWait: 'Documentation loading',
    assume: 'Opportunity cost assumes the premiums could have earned the stated rate, compounded yearly. Compare networks, coverage and out-of-pocket limits as well as price.',
    _notes: 'Premiums are not just this year’s cost. Every dollar of premium could have been working for you.\n\n- Ask: Over the next twenty years, what is the difference between these two policies really worth?\nPAUSE\n\n- Checklist lists what we review together. Documentation shows each policy year by year.'
  };
  CK.forEach((t, i) => { mmCopy['ck' + (i + 1)] = t; });
  EFA.screen('majmed1', {
    title: 'Major medical policy comparison (current versus alternative)',
    copy: mmCopy,
    render(ctx) {
      const S = visitState(() => ({ shown: false }));
      const f = (o) => ctx.field(Object.assign({ type: 'money' }, o));
      const row = (lab, a, b) => `<div class="b08-mmrow">${a}<div class="lab">${ctx.t(lab)}</div>${b}</div>`;
      const oppV = sget('case_file_ror_accumulation', 0.06);
      ctx.remember('f.oppA', oppV); ctx.remember('f.oppB', oppV);
      ctx.el.innerHTML = `
        <div class="b08-mm">
          <div class="b08-mmtabs"><div class="b08-mmtab">${ctx.t('tabCur')}</div>${ctx.t('title', { cls: 'b08-mmtitle' })}<div class="b08-mmtab alt">${ctx.t('tabAlt')}</div></div>
          <div class="b08-card b08-mmcard" style="position:relative">
            ${row('rLife', f({ id: 'curLife', value: 1000000 }), f({ id: 'altLife', value: 1000000 }))}
            ${row('rDed', f({ id: 'curDed', value: 250 }), f({ id: 'altDed', value: 1000 }))}
            ${row('rOop', f({ id: 'curOop', value: 0 }), f({ id: 'altOop', value: 0 }))}
            ${row('rPrem', f({ id: 'curPrem', value: 9000 }), f({ id: 'altPrem', value: 6000 }))}
            ${row('rOpp', ctx.field({ id: 'oppA', type: 'pct', value: oppV, max: 0.12, dp: 2 }), ctx.field({ id: 'oppB', type: 'pct', value: oppV, max: 0.12, dp: 2 }))}
          </div>
          <div class="b08-mmage">${ctx.t('age1')}${ctx.field({ id: 'ageBegin', type: 'int', value: 45 })}${ctx.t('age2')}${ctx.field({ id: 'ageEnd', type: 'int', value: 65 })}</div>
        </div>
        <div class="b08-calcbtn x-calc" style="top:540px"><button class="st-pill" type="button" data-calc="1">${ctx.t('calc')}</button></div>
        <div class="b08-mmres b08-f x-res" style="top:512px"></div>
        <div class="b08-mmlinks b08-f x-res" style="top:758px"><button type="button" class="b08-tl" data-ck="1">${ctx.t('linkCk')}</button><button type="button" class="b08-tl" data-doc="1">${ctx.t('linkDoc')}</button></div>
        <p class="st-disclaimer b08-disc" style="top:800px;left:160px;width:1100px">${ctx.t('assume')} ${discHTML('hypothetical')}</p>`;
      guard(ctx, 'oppA'); guard(ctx, 'oppB');
      let lastOpp = oppV;
      const calc = () => {
        const v = ctx.values(), r = +v.oppA || 0, N = Math.round(+v.ageEnd || 0) - Math.round(+v.ageBegin || 0);
        const cur = premEngine(+v.curPrem || 0, r, N), alt = premEngine(+v.altPrem || 0, r, N);
        return { v, r, N, A: cur.plain, B: alt.plain, C: cur.atInterest, D: alt.atInterest, E: +v.curOop || 0, Fv: +v.altOop || 0 };
      };
      const sheet = (which) => {
        const v = ctx.values(), r = +v.oppA || 0, b = Math.round(+v.ageBegin || 0), N = Math.round(+v.ageEnd || 0) - b;
        const prem = which === 'cur' ? +v.curPrem || 0 : +v.altPrem || 0, rows = [];
        let cum = 0, bal = 0;
        for (let k = 0; k < N; k++) { cum += prem; const start = bal + prem, interest = start * r; bal = start + interest; rows.push({ age: b + k, prem, cum, boy: start, interest, eoy: bal, year: k + 1 }); }
        return {
          heading: ctx.t(which === 'cur' ? 'wsCur' : 'wsAlt'), size: 'medium',
          columns: [{ field: 'age', header: ctx.t('wsAge'), type: 'age' }, { field: 'prem', header: ctx.t('wsPrem'), type: 'money', dp: 2 }, { field: 'cum', header: ctx.t('wsCum'), type: 'money', dp: 2 },
            { field: 'boy', header: ctx.t('wsBoy'), type: 'money', dp: 2 }, { field: 'interest', header: ctx.t('wsInt'), type: 'money', dp: 2 }, { field: 'eoy', header: ctx.t('wsEoy'), type: 'money', dp: 2 }, { field: 'year', header: ctx.t('wsYear'), type: 'year' }],
          rows, assumptions: [{ label: ctx.t('rPrem'), value: F.money(prem) }, { label: ctx.t('rOpp'), value: F.pct(r) }], file: which === 'cur' ? 'current-policy-worksheet' : 'alternative-policy-worksheet'
        };
      };
      const paint = (vals) => {
        // both opportunity cost boxes show and edit one shared value
        if (vals) {
          const a = vals.oppA, b = vals.oppB;
          let changed = false;
          if (a !== lastOpp && a != null) { lastOpp = a; ctx.setField('oppB', a); changed = true; }
          else if (b !== lastOpp && b != null) { lastOpp = b; ctx.setField('oppA', b); changed = true; }
          if (changed) { if (LIB('caseData')) EFA.lib.caseData.set('case_file_ror_accumulation', lastOpp); else EFA.clients.set('case', 'case_file_ror_accumulation', lastOpp); }
        }
        const c = calc(), m = (x) => `<span class="num">${F.money(x)}</span>`;
        const d1 = c.A - c.B, d2 = c.C - c.D;
        const sum = d1 >= 0
          ? `${ctx.t('sumS1')} ${m(d1)} ${ctx.t('sumMid')} ${m(d2)} ${ctx.t('sumS2')}`
          : `${ctx.t('sumC1')} ${m(-d1)} ${ctx.t('sumMore')} ${ctx.t('sumMid')} ${m(-d2)} ${ctx.t('sumMore')} ${ctx.t('sumS2')}`;
        ctx.$('.b08-mmres').innerHTML = `<table><thead><tr><th>${ctx.t('tH0')} <span class="num">${c.N}</span> ${ctx.t('tH0b')}</th><th>${ctx.t('colCur')}</th><th>${ctx.t('colAlt')}</th><th>${ctx.t('colDiff')}</th></tr></thead><tbody>
            <tr><td>${ctx.t('t1')}</td><td class="num">${F.money(c.A)}</td><td class="num">${F.money(c.B)}</td><td class="num d">${F.money(d1)}</td></tr>
            <tr><td>${ctx.t('t2')}</td><td class="num">${F.money(c.C)}</td><td class="num">${F.money(c.D)}</td><td class="num d">${F.money(d2)}</td></tr>
            <tr><td>${ctx.t('t3')}</td><td class="num">${F.money(c.E)}</td><td class="num">${F.money(c.Fv)}</td><td class="num d">${F.money(c.E - c.Fv)}</td></tr>
          </tbody></table><p class="sum">${sum}</p>`;
        ctx.show('.x-res', S.shown); ctx.show('.x-calc', !S.shown);
        EFA.numify(ctx.el);
      };
      ctx.onFields(paint);
      ctx.on(ctx.$('[data-calc]'), 'click', () => { S.shown = true; paint(); });
      ctx.on(ctx.$('[data-ck]'), 'click', () => {
        ctx.overlay({ title: ctx.t('ckTitle'), wide: true, html: `<div class="b08-ck">${ctx.t('ckLead', { tag: 'p', cls: 'dch', attrs: 'style="margin-top:0"' })}<ol>${CK.map((x, i) => `<li>${ctx.t('ck' + (i + 1))}</li>`).join('')}</ol>${ctx.t('dch', { tag: 'p', cls: 'dch' })}${ctx.t('dc1', { tag: 'p', cls: 'dc' })}${ctx.t('dc2', { tag: 'p', cls: 'dc' })}${ctx.t('dc3', { tag: 'p', cls: 'dc' })}</div>` });
      });
      ctx.on(ctx.$('[data-doc]'), 'click', () => {
        const ov = ctx.overlay({ title: ctx.t('chooseHead'), cls: 'b08-ov-sm', html: `<div class="b08-choose"><button type="button" class="st-pill" data-w="cur">${ctx.t('chooseCur')}</button><button type="button" class="st-pill" data-w="alt">${ctx.t('chooseAlt')}</button></div>` });
        ov.querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; const w = b.dataset.w; ov.close(); wsOpen(ctx, sheet(w)); }));
      });
      paint();
    }
  });

  /* =====================================================================
     PRSL bullet screens (prs2, prs4, prs6, prs8, prs9, prs13, prs14, prs15)
     ===================================================================== */
  EFA.css('b08-prs', `
  .b08-p2 { position: absolute; left: 230px; width: 1140px; display: grid; gap: 34px; }
  .b08-p2 .b08-bc { flex: 1; }
  .b08-p4 { position: absolute; left: 110px; width: 950px; display: grid; gap: 44px; }
  .b08-p4 .b08-bc { font-size: 34px; padding: 22px 32px; }
  .b08-split { flex: 1; display: grid; gap: 10px; }
  .b08-split .a { text-align: left; }
  .b08-split .b { text-align: right; color: #8a6e22; }
  .b08-p6blk { position: absolute; left: 110px; width: 940px; }
  .b08-p6lab .b08-bc { flex: 1; padding: 14px 28px; font-size: 30px; }
  .b08-p6lab .d { font-weight: 400; font-size: 23px; color: #1d3863; margin-left: 10px; }
  .b08-p6res { box-sizing: border-box; margin: 10px 0 0 108px; min-height: 104px; display: flex; align-items: center; padding: 14px 28px; background: #f0e6c4; border: 1px solid #d5bd68; border-left: 7px solid #b8972e; border-radius: 16px; font: 600 24px/1.32 "DM Sans", sans-serif; color: #0d1e3a; transition: opacity .8s ease; }
  .b08-p6res.is-off { transition: none; }
  .b08-p6lab { transition: opacity .8s ease; }
  .b08-p6lab.is-off { transition: none; }
  .b08-verb { cursor: pointer; color: #2b4c80; text-decoration: none; border-bottom: 3px solid transparent; transition: border-color .3s ease, color .3s ease; }
  .b08-verb.on { color: #0d1e3a; border-bottom-color: #b8972e; }
  .b08-verb:hover { color: #8a6e22; }
  .b08-ph { position: absolute; display: grid; justify-items: center; gap: 10px; cursor: pointer; }
  .b08-ph .c { width: 116px; height: 116px; border-radius: 50%; display: grid; place-items: center; background: #1d3863; box-shadow: 0 12px 26px rgba(13,30,58,.18); transition: background .4s ease, transform .4s ease; }
  .b08-ph .c svg { width: 64px; height: 64px; }
  .b08-ph .l { font: 700 18px/1 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #667389; transition: color .4s ease; }
  .b08-ph.on .c { background: linear-gradient(135deg, #d5bd68, #b8972e); transform: scale(1.06); }
  .b08-ph.on .l { color: #0d1e3a; }
  .b08-ph .ico-n { display: block; } .b08-ph .ico-g { display: none; }
  .b08-ph.on .ico-n { display: none; } .b08-ph.on .ico-g { display: block; }
  .b08-p8rows { position: absolute; left: 610px; width: 880px; display: grid; gap: 22px; }
  .b08-p8rows .b08-bc { font-size: 34px; padding: 18px 30px; }
  .b08-sum { box-sizing: border-box; padding: 20px 40px; text-align: center; font: 600 25px/1.36 "DM Sans", sans-serif; color: #0d1e3a; border-top: 4px solid #b8972e; }
  .b08-ill { position: absolute; display: grid; place-items: center; }
  .b08-ill > svg, .b08-tap > svg { width: 100%; height: 100%; }
  .b08-ill .wordlab { position: absolute; display: grid; place-items: center; text-align: center; font: 700 86px/1 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #f7f5f1; }
  .b08-ill .wordlab.gold { color: #0d1e3a; font-size: 60px; line-height: 1.05; }
  .b08-calcico { width: 62px; height: 84px; cursor: pointer; flex: 0 0 auto; transition: transform .2s ease; }
  .b08-calcico:hover { transform: translateY(-3px); }
  .b08-tap { position: absolute; }
  .b08-drip { position: absolute; width: 12px; height: 16px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; background: #9cb6d8; animation: b08drip 1.8s ease-in infinite; }
  @keyframes b08drip { 0% { transform: translateY(0) scale(.5); opacity: 0; } 15% { opacity: 1; transform: translateY(0) scale(1); } 80% { opacity: 1; } 100% { transform: translateY(64px) scale(1); opacity: 0; } }
  .b08-stream { position: absolute; width: 26px; border-radius: 0 0 13px 13px; background: linear-gradient(180deg, #b6cae4, #6f8fbd); transform-origin: top; transform: scaleY(0); transition: transform .25s ease; }
  .b08-stream.on { transform: scaleY(1); }
  .b08-p13 .tk-liq, .b08-p13 .tk-coll { transition: height 1.2s ease, opacity .6s ease, bottom 1.2s ease; }
  .b08-slide { position: absolute; transition: left 1.5s ease, opacity 1.5s ease; }
  .b08-rise { position: absolute; transition: bottom 1.5s ease, opacity 1.5s ease; }
  .b08-p14 { position: absolute; left: 110px; width: 1380px; display: grid; grid-template-columns: 1fr 1fr; gap: 0 60px; }
  .b08-p14 .colx { display: grid; gap: 14px; align-content: start; }
  .b08-p14 .b08-bc { flex: 1; padding: 12px 24px; font-size: 28px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .b08-p15dd { position: absolute; left: 110px; top: 28px; width: 560px; z-index: 6; }
  .b08-ddb { width: 100%; height: 58px; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 0 22px; box-sizing: border-box; background: #fff; border: 1.5px solid #cbd5e3; border-radius: 12px; font: 700 22px/1 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; box-shadow: 0 8px 20px rgba(13,30,58,.07); }
  .b08-ddb:hover { border-color: #b8972e; }
  .b08-ddb .ph { color: #667389; font-weight: 600; }
  .b08-ddl { margin-top: 6px; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 12px; box-shadow: 0 20px 44px rgba(13,30,58,.18); overflow: hidden; }
  .b08-ddl button { display: block; width: 100%; text-align: left; padding: 14px 22px; border: 0; border-bottom: 1px solid rgba(13,30,58,.07); background: transparent; font: 600 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; }
  .b08-ddl button:hover, .b08-ddl button.sel { background: #f0e6c4; }
  .b08-sech { position: absolute; font: 700 16px/1 "DM Sans", sans-serif; letter-spacing: .22em; text-transform: uppercase; color: #8a6e22; }
  .b08-cons { position: absolute; box-sizing: border-box; padding: 26px 34px 26px 30px; }
  .b08-ctext { font: 600 24px/1.32 "DM Sans", sans-serif; color: #0d1e3a; }
  .b08-ctext u { text-decoration-color: #b8972e; text-decoration-thickness: 3px; text-underline-offset: 4px; }
  .b08-cons .empty { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 26px; text-align: center; padding: 40px; font: 600 30px/1.35 "Cormorant Garamond", Georgia, serif; color: #1d3863; }
  .b08-cons .empty svg { width: 300px; height: 230px; }
  .b08-pg { position: absolute; right: 18px; bottom: 16px; width: 52px; height: 52px; border-radius: 50%; border: 0; background: #0d1e3a; display: grid; place-items: center; cursor: pointer; box-shadow: 0 8px 18px rgba(13,30,58,.25); }
  .b08-pg:hover { background: #b8972e; }
  .b08-chips { position: absolute; display: grid; gap: 8px; }
  .b08-chip { box-sizing: border-box; height: 40px; display: flex; align-items: center; padding: 0 16px; border: 1px solid #cbd5e3; border-radius: 10px; background: #fffdf8; font: 600 16px/1.1 "DM Sans", sans-serif; color: #667389; transition: background .4s ease, color .4s ease, border-color .4s ease; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .b08-chip.on { background: linear-gradient(90deg, #d5bd68, #b8972e); border-color: #b8972e; color: #0d1e3a; font-weight: 700; }
  `);

  /* ----- PRSL 2: avoidable and unavoidable transfers ----- */
  EFA.screen('prs2', {
    title: 'Avoidable versus unavoidable transfers',
    copy: {
      head: 'Some Transfers Can Be Avoided.\nOthers Can Only Be Minimized.',
      b1: 'Every purchase is financed one way or another: you either pay interest to someone else, or you give up the interest your own money could have earned.',
      b2: 'Every dollar you do not save ends up consumed by wealth transfers and lifestyle spending.',
      go1: 'Economic Squeeze on Capital', go2: 'Savings Efficiency',
      _notes: 'There is no such thing as paying cash without a cost. You pay interest, or you give up interest.\n\n- Ask: When you paid cash for something big, what did that money stop earning?\nPAUSE\n\n- The buttons open the Economic Squeeze and Savings Efficiency presentations.'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="b08-p2" style="top:250px">
          ${brow(ctx.t('b1', { tag: 'div', cls: 'b08-bc' }), { size: 88 })}
          ${brow(ctx.t('b2', { tag: 'div', cls: 'b08-bc' }), { size: 88 })}
        </div>
        <div class="b08-btnrow" style="top:676px"><button class="st-pill" type="button" data-go="ESC|esc1">${ctx.t('go1')}</button><button class="st-pill" type="button" data-go="SAVEEFF|saveEff1">${ctx.t('go2')}</button></div>`;
      ctx.on(ctx.$$('[data-go]'), 'click', (e, n) => { const [k, sid] = n.dataset.go.split('|'); ctx.jump(k, sid); });
    }
  });

  /* ----- PRSL 4: think before any capital outlay ----- */
  EFA.screen('prs4', {
    title: 'Think before any capital outlay',
    copy: {
      head: 'Before You Spend Capital on Anything',
      c1a: 'Consider what it costs you…', c1b: '…and what it costs you in lost opportunity.',
      c2a: 'It is not only what you buy…', c2b: '…it is how you pay for it.',
      _notes: 'Every purchase has two prices: the price on the tag, and what that money could have become.\n\n- Ask: When you made your last major purchase, did anyone show you the second price?\nPAUSE'
    },
    render(ctx) {
      const card = (a, b) => `<div class="b08-bc b08-split">${ctx.t(a, { tag: 'div', cls: 'a' })}${ctx.t(b, { tag: 'div', cls: 'b' })}</div>`;
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="b08-p4" style="top:318px">${brow(card('c1a', 'c1b'), { size: 90 })}${brow(card('c2a', 'c2b'), { size: 90 })}</div>
        <div class="b08-ill" style="left:1100px;top:186px;width:370px;height:576px">${IL.chess()}</div>`;
    }
  });

  /* ----- PRSL 6: Debtor, Saver, Wealth Creator ----- */
  const P6 = ['buy', 'borrow', 'pay'];
  /** linear build states: [phase, labels shown, results shown] */
  const P6S = [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 2, 1], [0, 2, 2], [0, 3, 2], [0, 3, 3], [1, 3, 0], [1, 3, 1], [1, 3, 2], [1, 3, 3], [2, 3, 0], [2, 3, 1], [2, 3, 2], [2, 3, 3]];
  const phaseIcon = (k, c) => {
    const s = `stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
    if (k === 0) return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 22h36l-4 32H18z" ${s}/><path d="M24 22v-4a8 8 0 0 1 16 0v4" ${s}/></svg>`;
    if (k === 1) return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 26 32 12l22 14z" ${s}/><path d="M16 30v18M26 30v18M38 30v18M48 30v18M10 52h44" ${s}/></svg>`;
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="16" width="40" height="36" rx="5" ${s}/><path d="M12 26h40M22 10v10M42 10v10M24 38l6 6 12-12" ${s}/></svg>`;
  };
  EFA.screen('prs6', {
    title: 'Debtor, Saver, Wealth Creator: how each buys, borrows and pays',
    steps: 15,
    copy: {
      h1a: 'How to', vbuy: 'Buy', vborrow: 'Borrow', and: 'and', vpay: 'Pay', h2: 'For major capital purchases',
      p1: 'Debtor', p1d: 'works in order to spend', p2: 'Saver', p2d: 'saves so as not to pay interest', p3: 'Wealth Creator', p3d: 'saves, and uses other people’s money to be more efficient',
      buy1: 'Has no savings, earns no interest, and pays interest.',
      buy2: 'Saves, earns interest, and pays cash.',
      buy3: 'Saves, compounds interest, and uses savings as collateral for purchases.',
      borrow1: 'Borrows from a lender at what are typically the highest market rates, with future earnings as the only collateral.',
      borrow2: 'Borrows from their own savings, which shrinks their collateral and restarts compounding. It is simply human nature.',
      borrow3: 'Borrows from a lender at negotiated rates and pledges their own money as collateral, so it can keep compounding without interruption.',
      pay1: 'Pays the lender back at what are typically the highest market rates.',
      pay2: 'Pays themselves back just to return to where they started, giving up the interest that money would have earned.',
      pay3: 'Pays a lender of their choosing while their own money keeps compounding, getting the most from their reserve account.',
      _notes: 'Three people, the same purchase. The difference is how each one buys, borrows and pays.\n\n- Click Buy, Borrow or Pay in the heading to jump to that part.\n- Ask: Which of these three describes how you have bought the big things in your life so far?\nPAUSE'
    },
    render(ctx) {
      const S = visitState(() => ({ seen: 0 }));
      ctx._p6 = S;
      const tops = [168, 384, 600];
      const blk = (i) => `<div class="b08-p6blk" style="top:${tops[i]}px">
          ${brow(`<div class="b08-bc">${ctx.t('p' + (i + 1))}${ctx.t('p' + (i + 1) + 'd', { cls: 'd' })}</div>`, { size: 70, cls: `b08-p6lab x-l${i}` })}
          <div class="b08-p6res x-r${i}"></div>
        </div>`;
      const verb = (k) => ctx.t('v' + k, { cls: 'b08-verb', attrs: `data-ph="${P6.indexOf(k)}"` });
      ctx.el.innerHTML = `<div class="b08-head" style="top:34px;gap:8px"><h1 class="st-h1" style="font-size:54px">${ctx.t('h1a')} ${verb('buy')}, ${verb('borrow')}, ${ctx.t('and')} ${verb('pay')}</h1>${ctx.t('h2', { tag: 'div', cls: 'st-eyebrow' })}</div>
        ${blk(0)}${blk(1)}${blk(2)}
        <svg class="b08-full" viewBox="0 0 1600 900" style="pointer-events:none"><path d="M1330 300V680" stroke="${P.mist2}" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 14"/></svg>
        ${P6.map((k, i) => `<div class="b08-ph" data-ph="${i}" style="left:${1330 - 70}px;top:${220 + i * 200}px;width:140px"><div class="c"><span class="ico-n">${phaseIcon(i, P.cream)}</span><span class="ico-g">${phaseIcon(i, P.navy)}</span></div>${ctx.t('v' + k, { cls: 'l' })}</div>`).join('')}`;
      ctx.on(ctx.$$('[data-ph]'), 'click', (e, n) => { ctx.goStep([0, 7, 11][+n.dataset.ph]); });
    },
    step(ctx, n, dir) {
      const S = ctx._p6, st = P6S[Math.max(0, Math.min(14, n))];
      const [ph, labs, res] = st;
      const prevSeen = S.seen;
      S.seen = Math.max(S.seen, labs);
      const shownLabs = S.seen;
      for (let i = 0; i < 3; i++) {
        ctx.show(`.x-l${i}`, i < shownLabs);
        const r = ctx.$(`.x-r${i}`);
        r.innerHTML = ctx.t(P6[ph] + (i + 1));
        ctx.show(r, i < res);
      }
      ctx.$$('.b08-verb').forEach((v) => v.classList.toggle('on', +v.dataset.ph === ph));
      ctx.$$('.b08-ph').forEach((v) => v.classList.toggle('on', +v.dataset.ph === ph));
      // a step that only re-reveals a label already on screen changes nothing: move on
      const prev = ctx._p6last;
      ctx._p6last = st;
      if (dir && prev && prev[0] === ph && prev[2] === res && Math.max(prevSeen, prev[1]) >= labs && labs !== prev[1]) {
        ctx.timeout(() => (dir > 0 ? ctx.next() : ctx.prev()), 0);
      }
    }
  });

  /* ----- PRSL 8: the problem with consumer debt ----- */
  EFA.screen('prs8', {
    title: 'The problem with consumer debt',
    steps: 7,
    copy: {
      head: 'The Problem with Consumer Debt',
      debt: 'Debt', cash: 'Pay\nCash',
      r1: 'Debt is a claim on your future earnings.',
      r2: 'You lose the money spent on the purchase and the financing costs, permanently.',
      r3: 'You become the debtor; the lender becomes your creditor.',
      r4: 'Loss of control',
      sum: 'Consumer debt is an inefficient way to buy. You lose the purchase price and the interest, and those losses can compound and spiral out of control.',
      _notes: 'Debt spends tomorrow’s paycheck today, and the interest never comes back.\n\n- Ask: How much of next year’s income is already promised to someone else?\nPAUSE\n\n- The calculator icon opens Cost of Credit Cards; Back returns here. The last click turns the page to paying cash.'
    },
    render(ctx) {
      const r = (k, w, extra) => `<div class="b08-f x-${k}">${brow(`${ctx.t(k, { tag: 'div', cls: 'b08-bc', attrs: `style="flex:0 1 ${w}px"` })}${extra || ''}`, { size: 72 })}</div>`;
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="b08-ill x-ia" style="left:120px;top:166px;width:440px;height:470px;transition:none">${IL.debtFigure()}<div class="wordlab" style="left:7%;width:86%;top:3.5%;height:36.5%">${ctx.t('debt')}</div></div>
        <div class="b08-ill x-ib is-off" style="left:120px;top:166px;width:440px;height:470px;transition:none">${IL.cashFigure()}<div class="wordlab gold" style="left:40%;width:56%;top:5%;height:35.5%">${ctx.t('cash')}</div></div>
        <div class="b08-p8rows" style="top:178px">
          ${r('r1', 830)}${r('r2', 830)}${r('r3', 600)}
          ${r('r4', 420, `<span style="width:30px"></span><span class="b08-calcico" data-calc="1">${IL.calc()}</span>`)}
        </div>
        ${ctx.t('sum', { tag: 'div', cls: 'b08-card b08-sum b08-f x-sum', attrs: 'style="left:120px;width:1360px;top:690px"' })}`;
      ctx.on(ctx.$('[data-calc]'), 'click', () => ctx.jump('CC', 'cc2'));
    },
    step(ctx, n) {
      ['r1', 'r2', 'r3', 'r4'].forEach((k, i) => ctx.show('.x-' + k, n >= i + 1));
      ctx.show('.x-sum', n >= 5);
      ctx.show('.x-ia', n < 6); ctx.show('.x-ib', n >= 6);
    }
  });

  /* ----- PRSL 9: the problem with paying cash (the savings tank) ----- */
  function taps(x, y) {
    const tax = `<div class="b08-tap b08-f x-tax" style="left:${x - 118}px;top:${y}px;width:120px;height:120px">
        ${svgw('0 0 120 120', `<rect x="70" y="28" width="52" height="22" rx="4" fill="${P.navy3}"/><rect x="60" y="22" width="16" height="34" rx="4" fill="${P.navy}"/>
          <path d="M60 32H28c-10 0-16 6-16 16v14" fill="none" stroke="${P.navy}" stroke-width="16" stroke-linejoin="round"/>
          <rect x="2" y="60" width="20" height="10" rx="3" fill="${P.navy}"/>
          <circle cx="36" cy="16" r="12" fill="none" stroke="${P.navy3}" stroke-width="5"/><path d="M36 16v16" stroke="${P.navy3}" stroke-width="5"/><path d="M24 16h24M36 4v24" stroke="${P.navy3}" stroke-width="3"/>`)}
        <i class="b08-drip" style="left:6px;top:70px"></i><i class="b08-drip" style="left:6px;top:70px;animation-delay:.9s"></i>
      </div>`;
    const spend = `<div class="b08-tap" style="left:${x + 222}px;top:${y - 30}px;width:150px;height:150px">
        ${svgw('0 0 150 150', `<rect x="-4" y="44" width="40" height="26" rx="4" fill="${P.goldDeep}"/><rect x="26" y="36" width="18" height="42" rx="4" fill="${P.navy}"/>
          <path d="M40 56h62c14 0 22 8 22 22v18" fill="none" stroke="${P.gold}" stroke-width="22" stroke-linejoin="round"/>
          <path d="M40 50h62c16 0 26 10 26 26" fill="none" stroke="${P.goldLt}" stroke-width="5" stroke-linecap="round"/>
          <rect x="108" y="94" width="32" height="14" rx="4" fill="${P.goldDeep}"/>
          <rect x="66" y="22" width="14" height="30" rx="4" fill="${P.goldDeep}"/><rect x="48" y="12" width="64" height="14" rx="7" fill="${P.gold}"/>`)}
        <i class="b08-stream x-stream" style="left:111px;top:106px;height:150px"></i>
      </div>`;
    return tax + spend;
  }
  const FILL9 = [0, 0, 4.6, 9.1, 13.7, 18.4, 0, 0];
  EFA.screen('prs9', {
    title: 'The problem with paying cash (the savings tank)',
    steps: 8,
    copy: {
      head: 'The Problems with Paying Cash',
      r1: 'To pay cash, you first have to save the cash.',
      r2: 'Annual Tax Leakage', r2s: 'Interest on taxable savings is taxed every year.',
      r3: 'To pay, you drain the tank, and the compounding stops.',
      sum: 'You give up control, and the interest that money could have earned if the tank had never been drained.',
      _notes: 'Paying cash feels responsible, and it has a cost: you have to fill the tank first, taxes leak out every year, and the purchase drains it.\n\n- Ask: Once you paid cash for that last big purchase, how long did it take to refill the tank?\nPAUSE\n\n- The calculator icon opens Compound Interest; Back returns here.'
    },
    render(ctx) {
      const tw = 250, th = 470, tx = 286, ty = 160, ry = Math.round(tw * 0.12);
      ctx._p9 = { maxFill: th - 2 * ry };
      const row = (k, inner, w, extra) => `<div class="b08-f x-${k}">${brow(`<div class="b08-bc" style="flex:0 1 ${w}px;font-size:35px">${inner}</div>${extra || ''}`, { size: 84 })}</div>`;
      ctx.el.innerHTML = `${head(ctx, 'head')}
        ${tank({ x: tx, y: ty, w: tw, h: th, ry, fill: 0, cls: 'x-tank' })}
        ${taps(tx, ty + th - 150)}
        <div style="position:absolute;left:760px;top:186px;width:740px;display:grid;gap:34px">
          ${row('r1', ctx.t('r1'), 700)}
          ${row('r2', `${ctx.t('r2')}${ctx.t('r2s', { tag: 'div', attrs: 'style="font:500 21px/1.3 DM Sans,sans-serif;color:#667389;margin-top:6px"' })}`, 540, `<span style="width:26px"></span><span class="b08-calcico" data-calc="1">${IL.calc()}</span>`)}
          ${row('r3', ctx.t('r3'), 700)}
        </div>
        ${ctx.t('sum', { tag: 'div', cls: 'b08-card b08-sum b08-f x-sum', attrs: 'style="left:100px;width:1400px;top:712px;font-size:28px"' })}`;
      ctx.on(ctx.$('[data-calc]'), 'click', () => ctx.jump('CI', 'ci1'));
    },
    step(ctx, n, dir) {
      const mf = ctx._p9.maxFill, px = (em) => Math.round(Math.min(1, em / 18.4) * mf);
      ctx.show('.x-r1', n >= 1); ctx.show('.x-r2', n >= 3); ctx.show('.x-tax', n >= 3); ctx.show('.x-r3', n >= 6); ctx.show('.x-sum', n >= 7);
      const st = ctx.$('.x-stream');
      if (n === 6 && dir > 0) {
        st.classList.add('on');
        ctx.timeout(() => st.classList.remove('on'), 500);
      } else st.classList.remove('on');
      setTank(ctx.$('.x-tank'), { fill: px(FILL9[n] || 0) });
    }
  });

  /* ----- PRSL 13: collateral capacity ----- */
  EFA.screen('prs13', {
    title: 'Collateral capacity and the three ways it grows',
    steps: 6,
    copy: {
      head: 'Collateral Capacity', sub: 'The amount in your reserve account that can be used as collateral.',
      lead: 'Three things can raise your collateral capacity:',
      b1: 'Contributions', b2: 'Internal Growth', b3: 'Lien Reduction',
      coll: 'Collateral', comp: 'Compounding',
      disc: 'Illustrative concept. How much can be pledged is set by the lender or the contract (for life insurance, the policy’s loan value, which is generally less than the full cash value). Growth beyond any contractual guarantees is not guaranteed.',
      _notes: 'Collateral capacity is how much of your reserve can back a loan. Three things raise it: what you add, what it earns, and what you repay.\n\n- Ask: Which of the three can you control the most?\nPAUSE'
    },
    render(ctx) {
      const tw = 200, th = 404, ry = Math.round(tw * 0.12), cx = 1270, base = 790;
      const mf = th - 2 * ry, px = (em) => Math.round(Math.min(1, em / 18.1) * mf);
      ctx._p13 = { th, base, fills: { a: px(10), b: px(14), c: px(18.1), coll: px(6) } };
      const inner = `<div class="b08-comp b08-delay x-comp" style="right:12px;bottom:${ry * 0.4 + 8}px;width:46px;height:${px(18.1) - 34}px">${upArrow(46, px(18.1) - 34, P.navy3)}${ctx.t('comp', { cls: 'b08-vt' })}</div>
        ${ctx.t('coll', { cls: 'b08-tklab x-colllab', attrs: `style="left:6px;right:60px;bottom:${ry * 0.4 + px(6) / 2 - 4}px;transition:opacity .4s ease"` })}`;
      ctx.el.innerHTML = `${head(ctx, 'head', { sub: 'sub' })}
        ${ctx.t('lead', { tag: 'div', cls: 'b08-f x-lead', attrs: 'style="position:absolute;left:110px;top:206px;font:600 30px/1.2 DM Sans,sans-serif;color:#1d3863"' })}
        <div style="position:absolute;left:110px;top:330px;width:820px;display:grid;gap:40px">
          ${['b1', 'b2', 'b3'].map((k) => `<div class="b08-f x-${k}">${brow(ctx.t(k, { tag: 'div', cls: 'b08-bc', attrs: 'style="flex:0 1 480px;font-size:36px;padding:22px 32px"' }), { size: 90 })}</div>`).join('')}
        </div>
        <div class="b08-panel" style="left:1060px;top:196px;width:420px;height:636px"></div>
        <div class="b08-p13">${tank({ x: cx - tw / 2, y: base - th, w: tw, h: th, ry, fill: px(10), coll: px(6), cls: 'x-tank', inner })}</div>
        <div class="b08-slide x-push" style="top:330px;left:640px;opacity:0">${blockArrow(126, 48, P.navy4, 1)}</div>
        <div class="b08-rise x-up" style="left:${cx - 30}px;bottom:${900 - base + 120}px;opacity:0">${svgw('0 0 60 90', `<path d="M30 4 56 40H40v46H20V40H4z" fill="none" stroke="${P.navy4}" stroke-width="5" stroke-linejoin="round"/>`)}</div>
        <p class="st-disclaimer b08-disc" style="top:794px;width:900px">${ctx.t('disc')}</p>`;
    },
    step(ctx, n, dir) {
      const g = ctx._p13, f = g.fills, tk = ctx.$('.x-tank');
      ctx.show('.x-lead', n >= 1); ctx.show('.x-b1', n >= 2); ctx.show('.x-b2', n >= 3); ctx.show('.x-b3', n >= 4);
      setTank(tk, { fill: n >= 3 ? f.c : n >= 2 ? f.b : f.a, coll: n >= 4 ? 0 : f.coll });
      ctx.show('.x-colllab', n < 4);
      ctx.show('.x-comp', n >= 3);
      const push = ctx.$('.x-push');
      push.style.left = (n >= 2 ? 1060 : 640) + 'px'; push.style.opacity = n === 2 ? '1' : '0';
      const up = ctx.$('.x-up');
      if (n === 3 && dir >= 0) {
        up.style.transition = 'none'; up.style.bottom = (900 - g.base + 120) + 'px'; up.style.opacity = '0';
        void up.offsetWidth; up.style.transition = '';
        up.style.bottom = (900 - g.base + 220) + 'px'; up.style.opacity = '1';
        ctx.timeout(() => { up.style.opacity = '0'; }, 2500);
      } else { up.style.opacity = '0'; }
      const h = n >= 5 ? Math.round(g.th * 1.22) : g.th;
      tk.style.height = h + 'px'; tk.style.top = (g.base - h) + 'px';
    }
  });

  /* ----- PRSL 14 and 15: the shared list of ideal benefits (one editable list for both screens) ----- */
  const BEN = [['tdg', 'Tax-Deferred Growth'], ['tfd', 'Tax-Free Distributions'], ['cr', 'Competitive Return'], ['hc', 'High Contributions'], ['ab', 'Additional Benefits'], ['co', 'Collateral Opportunities'],
    ['sh', 'Safety'], ['nlp', 'No-Loss Provisions'], ['glo', 'Guaranteed Loan Option'], ['ulp', 'Unstructured Loan Payments'], ['luac', 'Liquidity, Use and Control'], ['dc', 'Deductible Contributions']];
  const BSID = '_b08_benefits';
  EFA.screen(BSID, {
    title: 'Shared wording: reserve account benefit list (prs14, prs15)',
    copy: Object.fromEntries(BEN),
    render(ctx) { ctx.el.innerHTML = `<div style="position:absolute;left:110px;top:80px;display:grid;gap:10px">${BEN.map(([k]) => EFA.cp(BSID, k, { tag: 'p', cls: 'st-body' })).join('')}</div>`; }
  });
  const ben = (k, o) => EFA.cp(BSID, k, o || {});

  EFA.screen('prs14', {
    title: 'Ideal characteristics of a private reserve account',
    steps: 14,
    copy: {
      head: 'Your Reserve Account', head2: 'Ideal Characteristics and Benefits',
      note: 'Many kinds of accounts can serve as a reserve, but some serve better than others.',
      discLead: 'Features vary by account type. For life insurance, loans and withdrawals are ' + TXT.taxfree + '.',
      _notes: 'If you could design the perfect place to keep your reserve, this is the list you would build.\n\n- Ask: Which of these matter most to you?\nPAUSE\n\n- Next we will hold real accounts up against this list.'
    },
    render(ctx) {
      const order = [['tdg', 'tfd', 'cr', 'hc', 'dc', 'co'], ['sh', 'nlp', 'glo', 'ulp', 'luac', 'ab']];
      let k = 0;
      const col = (keys) => `<div class="colx">${keys.map((key) => { k++; return `<div class="b08-f x-k${k}">${brow(ben(key, { tag: 'div', cls: 'b08-bc' }), { size: 54 })}</div>`; }).join('')}</div>`;
      ctx.el.innerHTML = `<div class="b08-head" style="top:34px;gap:6px">${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:54px"' })}${ctx.t('head2', { tag: 'h2', cls: 'st-h2', attrs: 'style="font-size:36px;color:#1d3863"' })}</div>
        <div class="b08-p14" style="top:186px">${col(order[0])}${col(order[1])}</div>
        ${ctx.t('note', { tag: 'div', cls: 'b08-card b08-sum b08-f x-note', attrs: 'style="left:240px;width:1120px;top:660px;font-size:24px;padding:14px 36px"' })}
        <p class="st-disclaimer b08-disc" style="top:742px;width:1180px">${ctx.t('discLead')} ${discHTML(['loans', 'guarantees'])}</p>`;
      nobr(ctx.el);
    },
    step(ctx, n) { for (let k = 1; k <= 12; k++) ctx.show('.x-k' + k, n >= k); ctx.show('.x-note', n >= 13); }
  });

  const ACCTS = [
    { v: 'qualified_plan', key: 'oQP', label: '401(k) Qualified Plan', ben: ['tdg', 'cr', 'ab', 'dc'], items: 4 },
    { v: 'certificate_deposit', key: 'oCD', label: 'Certificate of Deposit', ben: ['hc', 'co', 'sh', 'nlp'], items: 7 },
    { v: 'margin_account', key: 'oMA', label: 'Margin Account (Stock Portfolio)', ben: ['cr', 'hc', 'co', 'glo', 'luac'], items: 7 },
    { v: 'permanent_life', key: 'oLI', label: 'Cash Value Life Insurance', ben: ['tdg', 'tfd', 'cr', 'hc', 'ab', 'co', 'sh', 'nlp', 'glo', 'ulp', 'luac'], items: 12 },
    { v: 'real_estate', key: 'oRE', label: 'Home Equity Line of Credit', ben: ['tdg', 'co'], items: 5 },
    { v: 'savings_account', key: 'oSA', label: 'Savings or Money Market', ben: ['hc', 'co', 'sh', 'nlp', 'luac'], items: 6, same: 'oCD' }
  ];
  const CONS = {
    oQP: ['',
      'A loan that is not repaid on schedule becomes a taxable distribution, and an additional tax for early distributions may also apply.',
      'Loan interest is repaid with after-tax dollars, and those same dollars can be taxed again when they come out in retirement.',
      'If you leave your job, including a layoff, the plan may require the loan to be repaid. An unpaid balance can generally be rolled over by your tax-return due date, including extensions, to avoid current tax.'],
    oCD: ['Rates are usually low.', 'Interest is taxed as ordinary income each year.', 'A loan against it still has to be negotiated with the bank, and approval is not assured.',
      'Loan agreements usually include call provisions.', 'The account can be reached by creditors.', 'Loan access is not assured unless a credit line was arranged in advance, and even then the points above still apply.',
      'Your principal is locked in for a term, with possible penalties for early withdrawal.'],
    oMA: ['Borrowing power is limited to a portion of the portfolio’s value.', 'That limit can change with federal rules and your broker’s policies.', 'A market drop can trigger a margin call.',
      'A margin call demands cash or forced sales, usually in a down market.', 'Forced sales can trigger capital gains tax.', 'Loan rates float with a market benchmark rate.',
      'Heavy short selling by large funds can push prices down and trigger a margin call.'],
    oLI: ['Riders are optional and may carry an added cost.', 'On participating whole life policies, dividends are not guaranteed, but once paid they can add guaranteed cash value.', 'Cash value grows tax-deferred.',
      'Policy loans are a contractual right. A loan reduces the cash value available to you by the amount borrowed.', 'The death benefit is ' + TXT.taxfree + ', and it is reduced by any unpaid loans or withdrawals.',
      'Cash value is lower in the early funding years.', 'A disability waiver rider can pay premiums if the insured cannot work.', 'When, and how much, you repay a policy loan is up to you.',
      'Structured properly, money can generally be accessed income-tax-free under current tax law, subject to applicable requirements.',
      'In many states cash values have some protection from creditors; the rules vary by state.',
      'Underfunding, when premiums, dividends or paid-up additions do not cover the base premium, can cause a lapse with tax consequences.',
      'The death benefit passes to your beneficiaries ' + TXT.taxfree + '.'],
    oRE: ['The line must be approved by a bank, based on your credit and the bank’s own liquidity.', 'An unused line can be reduced or revoked by the bank at any time.', 'Most lines include call provisions.',
      'Home values move, so available equity may fall short when you need it.', 'Lines usually have caps.']
  };
  const p15copy = { ph: 'Select an account type', hCons: 'Important Considerations', hBen: 'Benefits', lesson: '10-Minute Lesson', empty: 'Choose an account type to see how it measures up as a reserve.',
    qp1a: 'Plan loans are capped at the', qp1b: 'smaller', qp1c: 'of a dollar limit set by law or half of your vested balance.',
    discLead: 'Rules summarized for discussion; confirm current law and contract terms before acting.',
    _notes: 'Many accounts can hold a reserve. The question is which one checks the most boxes.\n\n- Pick each account from the list and watch which benefits light up.\n- Ask: Which of these accounts holds most of your savings today?\nPAUSE\n\n- With Cash Value Life Insurance selected, the button opens the 10-minute lesson; Back returns here.' };
  ACCTS.forEach((a) => { p15copy[a.key] = a.label; });
  Object.keys(CONS).forEach((k) => CONS[k].forEach((t, i) => { if (t) p15copy[k + (i + 1)] = t; }));
  EFA.screen('prs15', {
    title: 'Which account makes the best reserve? (account comparison)',
    copy: p15copy,
    render(ctx) {
      const back = Ret.take(ctx);
      const S = { type: back ? back.type : null, page: back ? back.page : 0, open: false };
      const L = 110, CW = 1080, TOP = 148, CH = 576;
      ctx.el.innerHTML = `
        <div class="b08-p15dd"><button type="button" class="b08-ddb" data-dd="1"></button><div class="b08-ddl" hidden>${ACCTS.map((a) => `<button type="button" data-v="${a.v}">${ctx.t(a.key)}</button>`).join('')}</div></div>
        ${ctx.t('hCons', { cls: 'b08-sech', attrs: `style="left:${L}px;top:112px"` })}
        <div class="b08-card b08-cons" style="left:${L}px;width:${CW}px;top:${TOP}px;height:${CH}px"><div class="x-list"></div><button type="button" class="b08-pg" data-pg="1" hidden></button></div>
        ${ctx.t('hBen', { cls: 'b08-sech', attrs: 'style="left:1236px;top:112px"' })}
        <div class="b08-chips" style="left:1236px;top:${TOP}px;width:256px">${BEN.map(([k]) => `<div class="b08-chip" data-b="${k}">${ben(k)}</div>`).join('')}</div>
        <div style="position:absolute;left:${L}px;top:${TOP + CH + 14}px;width:${CW}px;display:flex;align-items:flex-start;justify-content:space-between;gap:30px">
          <p class="st-disclaimer x-disc" style="margin:0;max-width:820px"></p>
          <button type="button" class="st-pill x-lesson" data-lesson="1" style="flex:0 0 auto;min-width:220px">${ctx.t('lesson')}</button>
        </div>`;
      const ddb = ctx.$('[data-dd]'), ddl = ctx.$('.b08-ddl');
      const paint = () => {
        const a = ACCTS.find((x) => x.v === S.type);
        ddb.innerHTML = (a ? ctx.t(a.key) : ctx.t('ph', { cls: 'ph' })) + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d1e3a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
        ctx.$$('.b08-ddl [data-v]').forEach((b) => b.classList.toggle('sel', b.dataset.v === S.type));
        ddl.hidden = !S.open;
        ctx.$$('.b08-chip').forEach((c) => c.classList.toggle('on', !!a && a.ben.includes(c.dataset.b)));
        const list = ctx.$('.x-list'), pg = ctx.$('[data-pg]');
        if (!a) { list.innerHTML = `<div class="empty">${IL.scale()}${ctx.t('empty', { tag: 'div' })}</div>`; pg.hidden = true; }
        else {
          const ck = a.same || a.key, n = a.items;
          const items = [];
          for (let i = 1; i <= n; i++) {
            if (ck === 'oQP' && i === 1) items.push(`${ctx.t('qp1a')} <u>${ctx.t('qp1b')}</u> ${ctx.t('qp1c')}`);
            else items.push(ctx.t(ck + i));
          }
          const paged = n > 7, show = paged ? (S.page ? items.slice(7) : items.slice(0, 7)) : items;
          const bl = LIB('bullets');
          list.innerHTML = bl ? bl.list(ctx, show, { reveal: false, size: 30, gap: 16, text: 'b08-ctext' })
            : `<div style="display:grid;gap:16px">${show.map((h) => `<div class="b08-ctext">${h}</div>`).join('')}</div>`;
          pg.hidden = !paged;
          pg.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f7f5f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${S.page ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`;
        }
        ctx.show('.x-lesson', !!a && a.v === 'permanent_life');
        ctx.$('.x-disc').innerHTML = a && a.v === 'permanent_life' ? `${ctx.t('discLead')} ${discHTML(['loans', 'guarantees'])}` : (a ? ctx.t('discLead') : '');
        EFA.numify(ctx.el); nobr(ctx.el);
      };
      // the opener also works in wording edit mode, so option labels can be edited
      ddb.addEventListener('click', () => { S.open = !S.open; paint(); });
      ctx.on(ctx.$$('.b08-ddl [data-v]'), 'click', (e, b) => { S.type = b.dataset.v; S.page = 0; S.open = false; paint(); });
      ctx.on(ctx.$('[data-pg]'), 'click', () => { S.page = S.page ? 0 : 1; paint(); });
      ctx.on(ctx.$('[data-lesson]'), 'click', () => Ret.jump(ctx, 'TMLI', 'tmli1', { type: S.type, page: S.page }));
      paint();
    }
  });

  /* =====================================================================
     Chart helpers for prs5 and prs10 (stacked or grouped columns, house style)
     ===================================================================== */
  const niceMax = (v) => {
    if (!(v > 0)) return 1;
    const e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e;
    const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((x) => x >= m - 1e-9) || 10;
    return step * e;
  };
  const tickEvery = (n) => (n > 50 ? 10 : n > 20 ? 5 : n > 10 ? 2 : 1);
  /** o: {w, h, labels[], stacks: [{key, color, values[]}], grouped (bool), line: {values, raw, color, key}, yMax} -> SVG string */
  function columnChart(o) {
    const pad = { l: 112, r: 18, t: 16, b: 42 };
    const W = o.w, H = o.h, pw = W - pad.l - pad.r, ph = H - pad.t - pad.b, n = o.labels.length;
    const band = pw / Math.max(1, n), yMax = niceMax(o.yMax);
    const Y = (v) => pad.t + ph * (1 - Math.max(0, v) / yMax);
    const every = tickEvery(n);
    let g = '';
    for (let i = 0; i <= 4; i++) {
      const v = yMax * i / 4, y = r2(Y(v));
      g += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}" stroke="#d6cfc4" stroke-width="1.2"/>`;
      g += `<text x="${pad.l - 12}" y="${y + 6}" text-anchor="end" font-family="DM Sans, sans-serif" font-weight="700" font-size="17" fill="#1d3863">${F.money(v)}</text>`;
    }
    o.labels.forEach((lb, i) => {
      if (+lb % every !== 0 && n > 1) return;
      const x = r2(pad.l + band * (i + 0.5));
      g += `<line x1="${x}" x2="${x}" y1="${pad.t}" y2="${pad.t + ph}" stroke="#e3e8f0" stroke-width="1.5"/>`;
      g += `<text x="${x}" y="${H - 12}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="18" fill="#0d1e3a">${lb}</text>`;
    });
    let bars = '';
    const visible = o.stacks.filter((s0) => !s0.hidden);
    if (o.grouped) {
      const k = visible.length || 1, gw = band * (n > 60 ? 0.86 : 0.74), bw = gw / k;
      for (let i = 0; i < n; i++) {
        visible.forEach((sr, j) => {
          const v = Math.max(0, sr.values[i] || 0), x = pad.l + band * i + (band - gw) / 2 + j * bw, y = Y(v);
          bars += `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(Math.max(1, bw - (n > 40 ? 0.5 : 2)))}" height="${r2(pad.t + ph - y)}" fill="${sr.color}" rx="${n > 40 ? 0 : 2}" data-tip="${sr.key}|${i}|${v}" style="cursor:pointer"/>`;
        });
      }
    } else {
      const bw = band * (n > 40 ? 0.78 : n > 12 ? 0.68 : 0.56);
      for (let i = 0; i < n; i++) {
        let acc = 0;
        o.stacks.forEach((sr) => {
          if (sr.hidden) return;
          const v = Math.max(0, sr.values[i] || 0); if (!v) return;
          const y0 = Y(acc), y1 = Y(acc + v); acc += v;
          bars += `<rect x="${r2(pad.l + band * i + (band - bw) / 2)}" y="${r2(y1)}" width="${r2(bw)}" height="${r2(Math.max(0, y0 - y1))}" fill="${sr.color}" data-tip="${sr.key}|${i}|${v}"/>`;
        });
      }
    }
    let line = '';
    if (o.line) {
      let d = '';
      o.line.values.forEach((v, i) => {
        const x0 = pad.l + band * i, x1 = x0 + band, y = r2(Y(v));
        d += (i ? `L${r2(x0)},${y}` : `M${r2(x0)},${y}`) + `L${r2(x1)},${y}`;
        line += `<rect x="${r2(x0)}" y="${y - 9}" width="${r2(band)}" height="18" fill="transparent" data-tip="${o.line.key}|${i}|${o.line.raw[i]}"/>`;
      });
      line = `<path d="${d}" fill="none" stroke="${o.line.color}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>` + line;
    }
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;overflow:visible">${g}<line x1="${pad.l}" x2="${W - pad.r}" y1="${pad.t + ph}" y2="${pad.t + ph}" stroke="#0d1e3a" stroke-width="2"/>${bars}${line}</svg>`;
  }
  /** hover tooltips over [data-tip] marks: name(key) gives the HTML label for a series key */
  function chartTips(ctx, box, tip, name) {
    const hide = () => { tip.style.opacity = '0'; };
    box.addEventListener('mousemove', (e) => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (!t || (EFA.edit && EFA.edit.on)) return hide();
      const [k, , v] = t.getAttribute('data-tip').split('|');
      tip.innerHTML = name(k, +v);
      const r = ctx.el.getBoundingClientRect(), sc = r.width / 1600;
      let x = (e.clientX - r.left) / sc + 16, y = (e.clientY - r.top) / sc - 54;
      if (x > 1300) x -= 300;
      tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.style.opacity = '1';
    });
    box.addEventListener('mouseleave', hide);
  }

  /* =====================================================================
     PRSL 5: compounding savings versus an amortizing loan
     ===================================================================== */
  /** month-by-month simulation for 100 years (spec formula, kept exactly; TCO equals the capital balance when synced) */
  const payEngine = EFA.engines.compoundVsAmortize = function (o) {
    const rl = o.loanRate / 12, rc = o.capRate / 12, nM = 12 * o.years;
    const pmt = o.autoPmt ? (rl === 0 ? o.loanBal / nM : o.loanBal * rl * Math.pow(1 + rl, nM) / (Math.pow(1 + rl, nM) - 1)) : o.loanPmt;
    let L = o.loanBal, S = o.capBal, basis = o.capBal, cumIntPaid = 0, cumPrinPaid = 0, cumIntEarned = 0, intAtInt = 0, prinAtInt = 0, pmtAtInt = 0;
    const rows = [];
    for (let y = 1; y <= 100; y++) {
      let yrIntPaid = 0, yrIntEarned = 0, yrPrinPaid = 0;
      for (let m = 0; m < 12; m++) {
        let j = 0, pay = 0, prin = 0;
        if (L > 0) { j = L * rl; pay = (L + j >= pmt) ? pmt : L + j; L = L + j - pay; prin = pay - j; } else L = 0;
        yrIntPaid += j; cumIntPaid += j;
        intAtInt = intAtInt * (1 + rc) + j; prinAtInt = prinAtInt * (1 + rc) + prin; pmtAtInt = pmtAtInt * (1 + rc) + pay;
        const e = S * rc; yrIntEarned += e; cumIntEarned += e;
        yrPrinPaid += prin; cumPrinPaid += prin;
        basis += o.capContrib; S = S + e + o.capContrib;
      }
      rows.push({ year: y, annualIntPaid: yrIntPaid, cumIntPaid, annualIntEarned: yrIntEarned, cumIntEarned, differential: cumIntEarned - cumIntPaid, loanBalEOY: L, capitalBalEOY: S, intAtInt, prinAtInt, totalCostAtInt: pmtAtInt, annualPrinPaid: yrPrinPaid, cumPrinPaid, capitalBasis: basis });
    }
    return { pmt, rows };
  };
  EFA.css('b08-prs5', `
  .b08-p5tog { position: absolute; }
  .stage .b08-p5tog .st-pill { min-height: 40px; padding: 6px 20px; font-size: 16px; letter-spacing: .06em; text-transform: uppercase; background: transparent; color: #0d1e3a; border: 1.5px solid #0d1e3a; }
  .stage .b08-p5tog .st-pill.on { background: #b8972e; border-color: #b8972e; color: #0d1e3a; }
  .b08-p5card { box-sizing: border-box; padding: 12px 18px; display: grid; gap: 6px; align-content: start; }
  .b08-p5row { display: grid; grid-template-columns: 1fr 150px; align-items: center; gap: 10px; }
  .b08-p5row .lb { display: flex; align-items: center; gap: 8px; font: 600 17px/1.15 "DM Sans", sans-serif; color: #0d1e3a; }
  .b08-p5row .lb input[type=checkbox] { width: 18px; height: 18px; accent-color: #b8972e; margin: 0; cursor: pointer; }
  .stage .b08-p5row .st-input { height: 38px; font-size: 18px; text-align: right; padding: 0 10px; border-radius: 8px; }
  .stage .b08-p5row .st-input:disabled { background: #f7f4ef; color: #1d3863; }
  .b08-p5row .out { text-align: right; font: 700 20px/1 "DM Sans", sans-serif; color: #0d1e3a; padding-right: 10px; }
  .b08-p5row .out.g { color: #8a6e22; }
  .b08-p5hr { height: 1px; background: #d6cfc4; margin: 4px 0; }
  .b08-metric { cursor: pointer; display: inline-flex; align-items: center; gap: 6px; color: #2b4c80; border-bottom: 2px dotted #2b4c80; }
  .b08-metric:hover { color: #8a6e22; border-color: #8a6e22; }
  .b08-chartbox { position: absolute; cursor: pointer; }
  .b08-tipbox { position: absolute; z-index: 20; pointer-events: none; opacity: 0; transition: opacity .15s ease; background: #0d1e3a; color: #f7f5f1; border-radius: 10px; padding: 9px 14px; font: 500 16px/1.3 "DM Sans", sans-serif; white-space: nowrap; box-shadow: 0 10px 24px rgba(8,20,42,.3); }
  .b08-tipbox b { color: #d5bd68; font-weight: 700; margin-right: 8px; }
  .b08-tipbox .sw { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 8px; vertical-align: -1px; }
  .b08-tf { display: flex; align-items: center; gap: 10px; font: 700 18px/1 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #0d1e3a; }
  .stage .b08-tf .st-input { width: 64px; height: 38px; text-align: center; font-size: 19px; padding: 0 4px; }
  .b08-legend { position: absolute; display: flex; gap: 22px; font: 700 18px/1 "DM Sans", sans-serif; color: #0d1e3a; transition: opacity .3s ease; }
  .b08-legend i { display: inline-block; width: 16px; height: 16px; border-radius: 4px; margin-right: 8px; vertical-align: -2px; }
  .b08-p10card { box-sizing: border-box; padding: 16px 20px; display: grid; gap: 8px; align-content: start; }
  .b08-p10row { display: grid; grid-template-columns: 1fr 120px; align-items: center; gap: 10px; }
  .b08-p10row .lb { font: 600 17px/1.15 "DM Sans", sans-serif; color: #0d1e3a; }
  .b08-p10row .lb.go { cursor: pointer; color: #2b4c80; border-bottom: 2px dotted #2b4c80; justify-self: start; }
  .b08-p10row .lb.go:hover { color: #8a6e22; border-color: #8a6e22; }
  .stage .b08-p10row .st-input { height: 40px; font-size: 18px; text-align: right; padding: 0 10px; border-radius: 8px; }
  .b08-p10out { display: grid; grid-template-columns: 1fr auto; gap: 8px 10px; align-items: baseline; font: 600 17px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b08-p10out .v { font: 700 21px/1 "DM Sans", sans-serif; text-align: right; }
  .b08-p10out .dl { padding-top: 8px; border-top: 1.5px solid #8a6e22; }
  .b08-p10out .dv { padding-top: 8px; border-top: 1.5px solid #8a6e22; color: #8a6e22; font-size: 22px; }
  `);
  const P5_METRICS = ['mIntPaid', 'mIntAtInt', 'mPrinAtInt', 'mTco'];
  const p5copy = {
    head: 'How Would You Like to Pay for It?',
    togTop: 'Compounding Interest', togBot: 'Amortizing Interest',
    lbBal: 'Initial Balance', lbRate: 'Interest Rate', lbContrib: 'Monthly Contribution', lbPmt: 'Monthly Payment',
    outEarned: 'Interest Earned', outFinal: 'Final Balance',
    mIntPaid: 'Interest Paid', mIntAtInt: 'Interest at Interest', mPrinAtInt: 'Principal at Interest', mTco: 'Total Cost of Ownership',
    tf1: 'Timeframe', tf2: 'Years',
    sBasis: 'Capital basis', sEarned: 'Interest earned', sAnnEarned: 'Annual interest earned',
    sOppInt: 'Opportunity cost of interest payments', sOppPrin: 'Opportunity cost of principal payments', sIntPaid: 'Interest paid', sPrin: 'Principal paid', sCash: 'Annual cash flow',
    wsHead: 'Amortization and Compounding Schedule', wsYear: 'Year', wsAIP: 'Annual Interest Paid', wsCIP: 'Cumulative Interest Paid', wsAIE: 'Annual Interest Earned', wsCIE: 'Cumulative Interest Earned',
    wsDiff: 'Cumulative Interest Differential', wsLB: 'End-of-Year Loan Balance', wsCB: 'End-of-Year Capital Balance', wsCPP: 'Cumulative Principal Payments', wsPAI: 'Principal Payments at Interest',
    wsIAI: 'Interest Payments at Interest', wsTCO: 'Total Cost of Ownership at Interest',
    wsWait: 'Documentation loading',
    assume: 'Opportunity cost assumes every payment could otherwise have earned the capital rate, compounded monthly.',
    _notes: 'The same purchase, two ways. On top, money left to compound. Below, the same money borrowed and repaid.\n\n- Turn on the top half first, then the bottom. Click the metric under the loan to walk from interest paid to the total cost of ownership.\n- Ask: When the payments could have been earning the same rate, what did the purchase really cost?\nPAUSE\n\n- Clicking either chart hides or shows the opportunity cost of the interest payments.'
  };
  EFA.engines.compoundVsAmortizeCopy = p5copy;
  EFA.screen('prs5', {
    title: 'Pay for it: compounding savings versus an amortizing loan',
    copy: p5copy,
    render(ctx) {
      const mort = ctx.variant === 'mortgage';
      const S = visitState(() => (mort
        ? { capBal: 100000, capRate: 0.05, capContrib: 0, loanBal: 100000, loanRate: 0.05, loanPmt: 537, years: 30, syncBal: true, syncRate: true, autoPmt: true, metric: 3, top: false, bot: false, hideOI: false }
        : { capBal: 30000, capRate: 0.05, capContrib: 0, loanBal: 30000, loanRate: 0.05, loanPmt: 566.14, years: 5, syncBal: true, syncRate: true, autoPmt: true, metric: 0, top: false, bot: false, hideOI: false }));
      const fmtV = (k, v) => (/Rate/.test(k) ? F.num(v * 100, 2) + '%' : F.money(v));
      const inp = (k) => `<input class="st-input" data-k="${k}" inputmode="decimal" autocomplete="off" value="">`;
      const chk = (c) => `<input type="checkbox" data-c="${c}">`;
      const X0 = 110, CW = 410, GX = 540, GW = 950, PH = 260, T1 = 140, T2 = 478;
      ctx.el.innerHTML = `
        <div class="b08-head" style="top:22px;gap:0">${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:50px"' })}</div>
        <div class="b08-p5tog" style="left:${X0}px;top:92px"><button type="button" class="st-pill" data-tog="top">${ctx.t('togTop')}</button></div>
        <div class="b08-f x-top">
          <div class="b08-card b08-p5card" style="left:${X0}px;top:${T1}px;width:${CW}px;height:${PH}px">
            <div class="b08-p5row"><span class="lb">${ctx.t('lbBal')}${chk('syncBal')}</span>${inp('capBal')}</div>
            <div class="b08-p5row"><span class="lb">${ctx.t('lbRate')}${chk('syncRate')}</span>${inp('capRate')}</div>
            <div class="b08-p5row"><span class="lb">${ctx.t('lbContrib')}</span>${inp('capContrib')}</div>
            <div class="b08-p5hr"></div>
            <div class="b08-p5row"><span class="lb">${ctx.t('outEarned')}</span><span class="out g num x-earned"></span></div>
            <div class="b08-p5row"><span class="lb">${ctx.t('outFinal')}</span><span class="out num x-capfin"></span></div>
          </div>
          <div class="b08-chartbox x-ch1" style="left:${GX}px;top:${T1}px;width:${GW}px;height:${PH}px"></div>
        </div>
        <div class="b08-p5tog" style="left:${X0}px;top:${T2 - 52}px"><button type="button" class="st-pill" data-tog="bot">${ctx.t('togBot')}</button></div>
        <input class="b08-range" type="range" min="1" max="100" step="1" style="position:absolute;left:560px;top:${T2 - 38}px;width:640px" aria-label="${EFA.util.esc(ctx.text('tf1'))}">
        <div class="b08-tf" style="position:absolute;left:1250px;top:${T2 - 50}px">${ctx.t('tf1')}<input class="st-input" data-tf="1" inputmode="numeric" maxlength="3" value="">${ctx.t('tf2')}</div>
        <div class="b08-f x-bot">
          <div class="b08-card b08-p5card" style="left:${X0}px;top:${T2}px;width:${CW}px;height:${PH}px">
            <div class="b08-p5row"><span class="lb">${ctx.t('lbBal')}${chk('syncBal')}</span>${inp('loanBal')}</div>
            <div class="b08-p5row"><span class="lb">${ctx.t('lbRate')}${chk('syncRate')}</span>${inp('loanRate')}</div>
            <div class="b08-p5row"><span class="lb">${ctx.t('lbPmt')}${chk('autoPmt')}</span>${inp('loanPmt')}</div>
            <div class="b08-p5hr"></div>
            <div class="b08-p5row"><span class="lb"><span class="b08-metric" data-metric="1"></span></span><span class="out num x-metric"></span></div>
            <div class="b08-p5row"><span class="lb">${ctx.t('outFinal')}</span><span class="out num x-loanfin"></span></div>
          </div>
          <div class="b08-chartbox x-ch2" style="left:${GX}px;top:${T2}px;width:${GW}px;height:${PH}px"></div>
        </div>
        <div class="b08-doclink" style="top:${T2 + PH + 14}px">${wsButton(ctx, { data: () => sheet(), look: 'link' })}</div>
        <p class="st-disclaimer b08-disc" style="top:800px">${ctx.t('assume')} ${discHTML('hypothetical')}</p>
        <div class="b08-tipbox"></div>`;
      const run = () => payEngine({ capBal: S.capBal, capRate: S.capRate, capContrib: S.capContrib, loanBal: S.loanBal, loanRate: S.loanRate, loanPmt: S.loanPmt, autoPmt: S.autoPmt, years: S.years });
      const sheet = () => {
        const r = run(), cols = [['year', 'wsYear'], ['annualIntPaid', 'wsAIP'], ['cumIntPaid', 'wsCIP'], ['annualIntEarned', 'wsAIE'], ['cumIntEarned', 'wsCIE'], ['differential', 'wsDiff'], ['loanBalEOY', 'wsLB'], ['capitalBalEOY', 'wsCB'], ['cumPrinPaid', 'wsCPP'], ['prinAtInt', 'wsPAI'], ['intAtInt', 'wsIAI'], ['totalCostAtInt', 'wsTCO']];
        return { heading: ctx.t('wsHead'), size: 'full', columns: cols.map(([f, k], i) => (i ? { field: f, header: ctx.t(k), type: 'money', dp: 2 } : { field: f, header: ctx.t(k), type: 'year', width: 70 })), rows: r.rows.slice(0, S.years).map((x) => Object.assign({}, x, { loanBalEOY: Math.abs(x.loanBalEOY) < 0.005 ? 0 : x.loanBalEOY })), file: 'amortization-and-compounding-schedule' };
      };
      const NAME = { basis: 'sBasis', earned: 'sEarned', annEarned: 'sAnnEarned', oppInt: 'sOppInt', oppPrin: 'sOppPrin', intPaid: 'sIntPaid', prin: 'sPrin', cash: 'sCash' };
      const COL = { basis: P.navy, earned: P.gold, annEarned: P.gold, oppInt: P.goldLt, oppPrin: P.goldDeep, intPaid: P.navy4, prin: P.navy, cash: P.steel };
      chartTips(ctx, ctx.$('.x-ch1'), ctx.$('.b08-tipbox'), (k, v) => `<span class="sw" style="background:${COL[k]}"></span><b>${ctx.text(NAME[k])}</b><span class="num">${F.money(v)}</span>`);
      chartTips(ctx, ctx.$('.x-ch2'), ctx.$('.b08-tipbox'), (k, v) => `<span class="sw" style="background:${COL[k]}"></span><b>${ctx.text(NAME[k])}</b><span class="num">${F.money(v)}</span>`);
      const paint = () => {
        const r = run(), N = S.years, row = r.rows[N - 1], rows = r.rows.slice(0, N);
        if (S.autoPmt) S.loanPmt = r.pmt;
        ctx.$$('[data-k]').forEach((el) => { if (el !== document.activeElement) el.value = fmtV(el.dataset.k, S[el.dataset.k]); });
        ctx.$('[data-k="loanPmt"]').disabled = S.autoPmt;
        ctx.$$('[data-c]').forEach((el) => { el.checked = !!S[el.dataset.c]; });
        const tf = ctx.$('[data-tf]'); if (tf !== document.activeElement) tf.value = String(N);
        const rng = ctx.$('.b08-range'); rng.value = String(N); rng.style.setProperty('--p', ((N - 1) / 99 * 100) + '%');
        ctx.$('.x-earned').textContent = F.money(row.cumIntEarned);
        ctx.$('.x-capfin').textContent = F.money(row.capitalBalEOY);
        const mv = [row.cumIntPaid, row.intAtInt, row.prinAtInt, row.totalCostAtInt][S.metric];
        ctx.$('[data-metric]').innerHTML = ctx.t(P5_METRICS[S.metric]) + ICON.cycle;
        ctx.$('.x-metric').textContent = F.money(mv);
        ctx.$('.x-loanfin').textContent = F.money(Math.abs(row.loanBalEOY) < 0.005 ? 0 : row.loanBalEOY);
        // charts
        const m = S.metric, labels = rows.map((x) => x.year);
        const top = m === 0
          ? [{ key: 'annEarned', color: COL.annEarned, values: rows.map((x) => x.annualIntEarned) }]
          : [{ key: 'basis', color: COL.basis, values: rows.map((x) => x.capitalBasis) }, { key: 'earned', color: COL.earned, values: rows.map((x) => x.cumIntEarned) }];
        const z = rows.map(() => 0);
        const showOI = (m === 1 || m === 3) && !S.hideOI, showOP = m === 2 || m === 3, showIP = m !== 2, showPr = m === 2 || m === 3;
        const bot = [
          { key: 'prin', color: COL.prin, values: showPr ? rows.map((x) => x.cumPrinPaid) : z },
          { key: 'intPaid', color: COL.intPaid, values: showIP ? rows.map((x) => (m === 0 ? x.annualIntPaid : x.cumIntPaid)) : z },
          { key: 'oppPrin', color: COL.oppPrin, values: showOP ? rows.map((x) => Math.max(0, x.prinAtInt - x.cumPrinPaid)) : z },
          { key: 'oppInt', color: COL.oppInt, values: showOI ? rows.map((x) => Math.max(0, x.intAtInt - x.cumIntPaid)) : z }
        ];
        const stackTop = (st) => Math.max(0, ...labels.map((_, i) => st.reduce((a, sr) => a + Math.max(0, sr.values[i] || 0), 0)));
        const yMax = Math.max(stackTop(top), stackTop(bot), 1);
        const cf = rows.map((x) => x.annualPrinPaid + x.annualIntPaid);
        const peakCol = Math.max(0, ...bot.map((sr) => Math.max(0, ...sr.values))), peakCF = Math.max(0, ...cf);
        const line = { key: 'cash', color: COL.cash, raw: cf, values: cf.map((v) => (peakCF > 0 ? v * peakCol / peakCF : 0)) };
        ctx.$('.x-ch1').innerHTML = columnChart({ w: GW, h: PH, labels, stacks: top, yMax });
        ctx.$('.x-ch2').innerHTML = columnChart({ w: GW, h: PH, labels, stacks: bot, yMax, line });
        ctx.$('[data-tog="top"]').classList.toggle('on', S.top); ctx.$('[data-tog="bot"]').classList.toggle('on', S.bot);
        ctx.show('.x-top', S.top); ctx.show('.x-bot', S.bot);
        EFA.numify(ctx.el);
      };
      const parse = (k, raw) => { let v = F.parse(raw); if (!isFinite(v)) return null; if (/\./.test(String(raw))) v = Math.round(v * 100) / 100; return /Rate/.test(k) ? v / 100 : v; };
      ctx.$$('[data-k]').forEach((el) => {
        const k = el.dataset.k;
        el.addEventListener('focus', () => { el.value = /Rate/.test(k) ? String(+(S[k] * 100).toFixed(4)) : String(+(+S[k]).toFixed(2)); el.select(); });
        el.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') el.blur(); });
        el.addEventListener('blur', () => {
          const v = parse(k, el.value);
          if (v != null) {
            S[k] = v;
            if (S.syncBal && k === 'capBal') S.loanBal = v; if (S.syncBal && k === 'loanBal') S.capBal = v;
            if (S.syncRate && k === 'capRate') S.loanRate = v; if (S.syncRate && k === 'loanRate') S.capRate = v;
          }
          el.value = fmtV(k, S[k]); paint();
        });
      });
      ctx.$$('[data-c]').forEach((el) => el.addEventListener('change', () => {
        const c = el.dataset.c; S[c] = el.checked;
        if (c === 'syncBal' && S.syncBal) S.loanBal = S.capBal;
        if (c === 'syncRate' && S.syncRate) S.loanRate = S.capRate;
        paint();
      }));
      const rng = ctx.$('.b08-range'), tf = ctx.$('[data-tf]');
      rng.addEventListener('input', () => { S.years = Math.max(1, Math.min(100, Math.round(+rng.value))); paint(); });
      tf.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') tf.blur(); });
      tf.addEventListener('input', () => { const v = parseInt(tf.value.replace(/\D/g, ''), 10); if (v > 100) tf.value = '100'; });
      tf.addEventListener('blur', () => { const v = parseInt(tf.value.replace(/\D/g, ''), 10); S.years = Math.max(1, Math.min(100, isFinite(v) ? v : S.years)); tf.value = String(S.years); paint(); });
      ctx.on(ctx.$$('[data-tog]'), 'click', (e, b) => { const k = b.dataset.tog; S[k] = !S[k]; paint(); });
      ctx.on(ctx.$('[data-metric]'), 'click', () => { S.metric = (S.metric + 1) % 4; paint(); });
      ctx.on(ctx.$$('.x-ch1, .x-ch2'), 'click', () => { S.hideOI = !S.hideOI; paint(); });
      guard(ctx, '[data-k="capRate"]');
      paint();
    }
  });

  /* =====================================================================
     PRSL 10: the true cost of paying cash (full versus delayed growth)
     ===================================================================== */
  const drainEngine = EFA.engines.fullVsDelayed = function (o) {
    const p = o.ror, s0 = o.contribution, a = o.initialBalance, c = Math.round(o.drains), l = Math.round(o.refillYears);
    const full = [], delayed = [];
    if (o.mode === 'lump') {
      let m = a;
      for (let y = 0; y <= 100; y++) { full[y] = m; delayed[y] = y >= l * c ? Math.max(0, full[y - l * c]) : 0; m = m * (1 + p); }
    } else {
      let f = 0, d = 0;
      for (let y = 0; y <= 100; y++) {
        full[y] = f + s0; f = full[y] * (1 + p);
        if (y <= l * c && y % l === 0) delayed[y] = s0; else delayed[y] = d + s0;
        d = delayed[y] * (1 + p);
      }
    }
    return { full, delayed };
  };
  EFA.screen('prs10', {
    title: 'The true cost of paying cash (full versus delayed growth)',
    copy: {
      head: 'The True Cost of Paying Cash',
      expl: 'Every time you empty the tank, compounding starts over and the growth curve shifts to the right. Over time, that shift changes everything.',
      lbContrib: 'Contribution per Year', lbInit: 'Initial Balance', lbRor: 'Rate of Return', lbYears: 'Time (Years)', lbDrains: 'Times the Tank Is Drained', lbRefill: 'Years to Refill',
      gp: 'Growth Potential', full: 'Full', delayed: 'Delayed', diff: 'Long-Term Difference', pot: 'potential',
      tf1: 'Timeframe', tf2: 'Years',
      wsHead: 'Full vs. Delayed Account Balances', wsYear: 'Year', wsFull: 'Full Growth, Beginning Balance', wsDel: 'Delayed Growth, Beginning Balance',
      wsWait: 'Documentation loading',
      assume: 'Assumes a constant rate of return with no fees or taxes; the drained money is not replaced, and the full account is never touched.',
      _notes: 'Draining the tank does not just cost the purchase price. It resets the clock on compounding, again and again.\n\n- Ask: How many times in your life has the tank been drained for a car, a wedding, a down payment?\nPAUSE\n\n- Click the first label to switch between yearly contributions and a starting balance. Clicking a column shows or hides the legend.'
    },
    render(ctx) {
      const S = visitState(() => ({ mode: 'contrib', legend: true }));
      const X0 = 110, LW = 360, GX = 500, GW = 990, GT = 128, GH = 580;
      const row = (lab, fld, go) => `<div class="b08-p10row">${ctx.t(lab, { cls: 'lb' + (go ? ' go' : ''), attrs: go ? 'data-mode="1"' : '' })}${fld}</div>`;
      ctx.el.innerHTML = `${head(ctx, 'head', { style: 'top:30px;gap:8px' })}
        ${ctx.t('expl', { tag: 'div', cls: 'b08-card', attrs: `style="left:${X0}px;top:${GT}px;width:${LW}px;padding:18px 22px;font:700 20px/1.38 DM Sans,sans-serif;color:#0d1e3a;border-left:5px solid #b8972e"` })}
        <div class="b08-card b08-p10card" style="left:${X0}px;top:${GT + 192}px;width:${LW}px">
          <div class="x-mc">${row('lbContrib', sfield(ctx, { id: 'contrib', key: 'prs_annual_contribution', type: 'money', value: 5000 }), true)}</div>
          <div class="x-ml">${row('lbInit', sfield(ctx, { id: 'init', key: 'prs_account_balance', type: 'money', value: 50000 }), true)}</div>
          ${row('lbRor', sfield(ctx, { id: 'ror', key: 'case_file_ror_accumulation', type: 'pct', value: 0.06, max: 0.12, dp: 2 }))}
          ${row('lbYears', sfield(ctx, { id: 'years', key: 'prs_time_period', type: 'int', value: 30, min: 1, max: 100 }))}
          ${row('lbDrains', sfield(ctx, { id: 'drains', key: 'prs_tanks_drained', type: 'int', value: 5, min: 0 }))}
          ${row('lbRefill', sfield(ctx, { id: 'refill', key: 'prs_years_to_refill', type: 'int', value: 4, min: 0 }))}
          <div class="b08-p5hr" style="margin:6px 0 2px"></div>
          ${ctx.t('gp', { cls: 'b08-sech', attrs: 'style="position:static;font-size:14px"' })}
          <div class="b08-p10out">${ctx.t('full')}<span class="v num x-full"></span>${ctx.t('delayed')}<span class="v num x-del"></span>${ctx.t('diff', { cls: 'dl' })}<span class="v num dv x-diff"></span></div>
        </div>
        <div class="b08-chartbox x-ch" style="left:${GX}px;top:${GT}px;width:${GW}px;height:${GH}px"></div>
        <div class="b08-legend x-leg" style="left:${GX + 140}px;top:${GT + 18}px"><span><i style="background:${P.navy}"></i>${ctx.t('full')}</span><span><i style="background:${P.gold}"></i>${ctx.t('delayed')}</span></div>
        <div style="position:absolute;left:${GX + 120}px;top:${GT + GH + 22}px;display:flex;align-items:center;gap:26px">
          <input class="b08-range" type="range" min="1" max="100" step="1" style="width:560px" aria-label="${EFA.util.esc(ctx.text('tf1'))}">
          <div class="b08-tf">${ctx.t('tf1')}<span class="num x-tfv" style="font-size:24px"></span>${ctx.t('tf2')}</div>
        </div>
        <div style="position:absolute;right:110px;top:786px">${wsButton(ctx, { data: () => sheet(), look: 'link' })}</div>
        <p class="st-disclaimer b08-disc" style="top:800px;width:1040px">${ctx.t('assume')} ${discHTML('hypothetical')}</p>
        <div class="b08-tipbox"></div>`;
      guard(ctx, 'ror');
      const calc = () => {
        const v = ctx.values();
        const T = Math.max(1, Math.min(100, Math.round(+v.years || 1)));
        const r = drainEngine({ mode: S.mode === 'lump' ? 'lump' : 'contrib', ror: +v.ror || 0, contribution: +v.contrib || 0, initialBalance: +v.init || 0, drains: +v.drains || 0, refillYears: +v.refill || 0 });
        return { T, full: r.full, delayed: r.delayed };
      };
      const sheet = () => {
        const c = calc(), rows = [];
        for (let y = 0; y <= c.T; y++) rows.push({ year: y, full: c.full[y], delayed: c.delayed[y] });
        return { heading: ctx.t('wsHead'), size: 'small', columns: [{ field: 'year', header: ctx.t('wsYear'), type: 'year', width: 70 }, { field: 'full', header: ctx.t('wsFull'), type: 'money', dp: 2 }, { field: 'delayed', header: ctx.t('wsDel'), type: 'money', dp: 2 }], rows, file: 'full-vs-delayed-account-balances' };
      };
      const COL = { full: P.navy, delayed: P.gold };
      chartTips(ctx, ctx.$('.x-ch'), ctx.$('.b08-tipbox'), (k, v) => `<span class="sw" style="background:${COL[k]}"></span><b>${ctx.text(k)}</b>${ctx.text('pot')} <span class="num">${F.money(v)}</span>`);
      const paint = () => {
        const c = calc(), T = c.T, labels = [];
        for (let y = 0; y <= T; y++) labels.push(y);
        ctx.$('.x-full').textContent = F.money(c.full[T]);
        ctx.$('.x-del').textContent = F.money(c.delayed[T]);
        ctx.$('.x-diff').textContent = F.money(c.delayed[T] - c.full[T]);
        const fullV = labels.map((y) => Math.max(0, c.full[y])), delV = labels.map((y) => Math.max(0, c.delayed[y]));
        ctx.$('.x-ch').innerHTML = columnChart({ w: GW, h: GH, labels, grouped: true, stacks: [{ key: 'full', color: COL.full, values: fullV }, { key: 'delayed', color: COL.delayed, values: delV }], yMax: Math.max(...fullV, ...delV, 1) });
        ctx.show('.x-leg', S.legend);
        ctx.$('.x-mc').hidden = S.mode !== 'contrib'; ctx.$('.x-ml').hidden = S.mode === 'contrib';
        const rng = ctx.$('.b08-range'); rng.value = String(T); rng.style.setProperty('--p', ((T - 1) / 99 * 100) + '%');
        ctx.$('.x-tfv').textContent = String(T);
        EFA.numify(ctx.el);
      };
      ctx.onFields(paint);
      ctx.on(ctx.$$('[data-mode]'), 'click', () => { S.mode = S.mode === 'contrib' ? 'lump' : 'contrib'; paint(); });
      ctx.on(ctx.$('.x-ch'), 'click', (e) => { if (e.target.closest('[data-tip]')) { S.legend = !S.legend; paint(); } });
      const rng = ctx.$('.b08-range');
      rng.addEventListener('input', () => {
        const v = Math.max(1, Math.min(100, Math.round(+rng.value)));
        ctx.setField('years', v);
        if (LIB('caseData')) EFA.lib.caseData.set('prs_time_period', v); else EFA.clients.set('case', 'prs_time_period', v);
        paint();
      });
      paint();
    }
  });

  /* =====================================================================
     MCPF101 / MCPF101L: major capital purchases on the Personal Economic Model
     ===================================================================== */
  EFA.css('b08-mcpf', `
  .b08-mp-panel { position: absolute; left: 900px; top: 0; width: 590px; height: 900px; transition: opacity .4s ease; }
  .stage .b08-mp-panel .st-h1 { font-size: 46px; line-height: 1.06; }
  .b08-mp-rows { display: grid; gap: 16px; margin-top: 28px; }
  .b08-mp-rows .b08-bc { flex: 0 1 520px; font-size: 23px; padding: 14px 22px; }
  .b08-mp-rows .b08-bc .sm { display: block; margin-top: 6px; font-weight: 500; font-size: 18px; color: #1d3863; }
  `);
  /** cfg: {rows: [keys], def: key (single definition card), pem: extra PEM config} */
  function mcpfScreen(ctx, cfg) {
    const rows = cfg.def
      ? `<div class="b08-mp-rows">${ctx.t(cfg.def, { tag: 'div', cls: 'b08-bc', attrs: 'style="font-size:30px;padding:24px 30px;border-left:6px solid #b8972e"' })}</div>`
      : `<div class="b08-mp-rows">${cfg.rows.map((k, i) => `<div class="b08-f x-r${i + 1}">${brow(`<div class="b08-bc">${ctx.t(k)}${cfg.sub && cfg.sub[k] ? ctx.t(cfg.sub[k], { cls: 'sm' }) : ''}</div>`, { size: 40 })}</div>`).join('')}</div>`;
    ctx.el.innerHTML = `<div class="b08-mp-panel"><div style="position:absolute;left:0;right:0;top:${cfg.def ? 250 : 92}px">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule" style="margin-top:18px">${rows}</div></div>`;
    const lib = LIB('pem');
    if (!lib || !lib.mount) {
      ctx.el.insertAdjacentHTML('beforeend', `<div class="b08-wait" style="left:40px;top:70px;width:820px;height:720px">${ctx.t('pemWait')}</div>`);
      ctx.pem = null;
      return;
    }
    ctx.pem = lib.mount(ctx, ctx.el, Object.assign({
      labels: false, links: false, scenarioPicker: false, showHouse: false, collateral: 'safe', showBorrowed: true, borrowSource: false,
      safe: 30, risk: 30, borrow: 0, purchase: 'car', lifestyleStrip: false,
      frame: { zoom: { fit: ['safe', 'borrowed', 'purchase'], pad: 1 }, width: 0.55, expanded: false, panel: '.b08-mp-panel', expandShows: ['labels', 'lifestyle'], toggle: true }
    }, cfg.pem || {}));
  }
  EFA.screen('mcpf1', {
    title: 'Major capital purchase defined (on the economic model)',
    copy: {
      head: 'What Is a Major Capital Purchase?',
      def: 'Anything you cannot pay for in full out of your monthly cash flow.',
      pemWait: 'Personal Economic Model loading',
      _notes: 'A major capital purchase is anything your monthly cash flow cannot cover on its own: a car, a wedding, an education, a home.\n\n- Ask: What major purchases do you see coming in the next five years?\nPAUSE\n\n- The small icon at the bottom of the model opens the full model; click it again to come back.'
    },
    render(ctx) { mcpfScreen(ctx, { def: 'def', pem: { regulator: 100, debtService: false, lifestyleStrip: true } }); }
  });
  EFA.screen('mcpf2', {
    title: 'Two ways to pay for major capital purchases',
    steps: 4,
    copy: {
      head: 'Two Ways to Pay for Major Capital Purchases',
      r1: 'Borrow from a lender and make payments of principal and interest until the loan is paid in full.',
      r2: 'Borrow from your own savings or investments, then replace both the dollars you took and the interest they would have earned.',
      r2s: 'Few people repay what they borrow from themselves, and fewer still repay the lost interest.',
      r3: 'Here is how that plays out.',
      pemWait: 'Personal Economic Model loading',
      _notes: 'There are only two ways to pay for something big: use someone else’s money, or use your own.\n\n- Ask: When you borrowed from yourself in the past, did you pay yourself back, with interest?\nPAUSE'
    },
    render(ctx) { mcpfScreen(ctx, { rows: ['r1', 'r2', 'r3'], sub: { r2: 'r2s' } }); },
    step(ctx, n) { for (let i = 1; i <= 3; i++) ctx.show('.x-r' + i, n >= i); }
  });
  EFA.screen('mcpf3', {
    title: 'Things to consider before a major purchase',
    steps: 5,
    copy: {
      head: 'Things to Consider',
      r1: 'Never drain an asset meant for your future to pay for a lifestyle expense today.',
      r2: 'You finance everything you buy.',
      r3: 'One way is to finance with other people’s money.',
      r4: 'The other is to finance by paying cash, with your own money.',
      pemWait: 'Personal Economic Model loading',
      _notes: 'Every purchase is financed. The only question is whose money pays for it, and what that money gives up.\n\n- Ask: Which of these four ideas changes how you will pay for your next major purchase?\nPAUSE'
    },
    render(ctx) { mcpfScreen(ctx, { rows: ['r1', 'r2', 'r3', 'r4'] }); },
    step(ctx, n) { for (let i = 1; i <= 4; i++) ctx.show('.x-r' + i, n >= i); }
  });
})();
