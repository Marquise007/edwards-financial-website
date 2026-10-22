/* Module b06: Economic Value Added (EVA), Education Fund Estimator (EDUC), Estate Planning (ESTPLN),
   Famous Estates (FAMEST), Finance 101 (F101, FNOEP, FC, MCPF101 shared screens), Financial GPS (FGPS, FGPSC)
   and Financing a Car (FINCARS).
   Screen structure, sequence, interactions and math follow the clean-room specs; drawings and wording are new. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt;

  EFA.css('b06', `
  .b06-full { position: absolute; inset: 0; width: 1600px; height: 900px; overflow: visible; }
  .b06-head { position: absolute; left: 0; right: 0; top: 52px; display: grid; justify-items: center; gap: 14px; text-align: center; padding: 0 120px; }
  .b06-head .st-h1 { max-width: 1380px; }
  .b06-head .st-h1.sm { font-size: 54px; line-height: 1.08; }
  .b06-head .b06-sub { margin: 2px 0 0; font: 500 34px/1.15 "Cormorant Garamond", Georgia, serif; color: #8a6e22; letter-spacing: .01em; }
  .b06-fade { transition: opacity .8s ease, transform .8s ease; }
  .stage .b06-fade.is-off { transition: opacity .3s ease, transform .3s ease; }
  .b06-em { color: #8a6e22; }
  .b06-card { position: absolute; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 14px 34px rgba(13,30,58,.08); box-sizing: border-box; }
  .b06-med { position: absolute; border-radius: 50%; background: #fffdf8; border: 1px solid #d6cfc4; box-shadow: 0 18px 40px rgba(13,30,58,.10); display: grid; place-items: center; overflow: hidden; }
  .b06-med svg { width: 74%; height: 74%; }
  .b06-arch { position: absolute; border-radius: 240px 240px 22px 22px; background: #fffdf8; border: 1px solid #d6cfc4; box-shadow: 0 18px 40px rgba(13,30,58,.10); overflow: hidden; }
  .b06-arch svg { display: block; width: 100%; height: 100%; }
  .b06-lab { position: absolute; transform: translate(-50%, -50%); text-align: center; font: 700 25px/1.18 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #f7f5f1; white-space: nowrap; }
  .b06-lab.dark { color: #0d1e3a; }
  .b06-lab.sm { font-size: 21px; letter-spacing: .08em; }
  .b06-link { position: absolute; font: 600 18px/1 "DM Sans", sans-serif; letter-spacing: .06em; color: #8a6e22; cursor: pointer; border-bottom: 1.5px dotted currentColor; padding-bottom: 3px; }
  .b06-link:hover { color: #0d1e3a; }
  .b06-disc { position: absolute; left: 160px; right: 160px; bottom: 70px; text-align: center; }
  .b06-pending { display: grid; justify-items: center; align-content: center; gap: 14px; text-align: center; color: #667389; font: 500 20px/1.45 "DM Sans", sans-serif; }
  .b06-pending .dot { width: 54px; height: 54px; border-radius: 50%; border: 3px solid #cbd5e3; border-top-color: #b8972e; animation: b06spin 1.4s linear infinite; }
  @keyframes b06spin { to { transform: rotate(360deg); } }

  /* forms and result cards */
  .b06-form { display: grid; }
  .stage .b06-form .st-field { display: grid; grid-template-columns: 1fr 210px; align-items: center; gap: 24px; padding: 13px 0; border-bottom: 1px solid rgba(13,30,58,.10); }
  .stage .b06-form .st-field:last-child { border-bottom: 0; }
  .stage .b06-form .st-field > label, .stage .b06-form .st-field > .lb { font: 700 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; letter-spacing: .01em; text-transform: none; }
  .stage .b06-form .st-input { text-align: right; }
  .b06-form .ro { display: flex; justify-content: flex-end; align-items: center; height: 52px; padding: 0 14px; border-radius: 10px; background: #e3e8f0; font: 700 22px/1 "DM Sans", sans-serif; color: #0d1e3a; box-sizing: border-box; }
  .b06-rows { display: grid; }
  .b06-rows .r { display: flex; justify-content: space-between; align-items: baseline; gap: 24px; padding: 15px 4px; border-bottom: 1px solid rgba(13,30,58,.10); }
  .b06-rows .r:last-child { border-bottom: 0; }
  .b06-rows .r .k { font: 700 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-rows .r .v { font: 700 30px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-rows .r.hl { background: #f0e6c4; border-radius: 10px; border-bottom-color: transparent; padding-left: 16px; padding-right: 16px; }
  .b06-rows .r.hl .v { color: #8a6e22; }
  .b06-band { margin: -1px -1px 0; padding: 18px 28px; border-radius: 16px 16px 0 0; background: #0d1e3a; color: #f7f5f1; text-align: center; font: 600 30px/1.15 "Cormorant Garamond", Georgia, serif; }
  .b06-calc { position: absolute; left: 50%; transform: translateX(-50%); min-width: 220px; min-height: 54px; font-size: 19px; letter-spacing: .04em; }

  /* EVA decision diagram */
  .b06-box { padding: 22px 26px; display: grid; gap: 6px; justify-items: center; text-align: center; }
  .b06-box .k { font: 700 17px/1.1 "DM Sans", sans-serif; letter-spacing: .22em; text-transform: uppercase; color: #8a6e22; }
  .b06-box .big { display: flex; align-items: baseline; gap: 12px; font: 700 50px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-box .big .at { font-size: 30px; font-weight: 600; color: #667389; }
  .b06-box.inv { background: #0d1e3a; border-color: #0d1e3a; box-shadow: 0 20px 44px rgba(13,30,58,.22); }
  .b06-box.inv .k { color: #d5bd68; }
  .b06-box.inv .big { color: #f7f5f1; font-size: 64px; }
  .b06-verdict { display: flex; align-items: center; justify-content: center; gap: 22px; padding: 20px 34px; font: 700 27px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-verdict .w { font: 700 44px/1 "DM Sans", sans-serif; letter-spacing: .06em; text-transform: uppercase; color: #8a6e22; }

  /* fgps1 route bar */
  .b06-route { position: absolute; left: 120px; right: 120px; top: 222px; height: 98px; }
  .b06-route .wp { position: absolute; top: 0; height: 98px; display: grid; justify-items: center; align-content: center; gap: 12px; transform: translateX(-50%); transition: opacity .8s ease; }
  .stage .b06-route .wp.is-off { transition: opacity .3s ease; }
  .b06-route .wp .d { width: 26px; height: 26px; border-radius: 50%; background: #0d1e3a; border: 5px solid #fffdf8; box-shadow: 0 0 0 2px #0d1e3a; transition: background .5s ease, box-shadow .5s ease; }
  .b06-route .wp .t { font: 700 24px/1 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #0d1e3a; white-space: nowrap; transition: color .5s ease; }
  .b06-route .wp.cur .d { background: #b8972e; box-shadow: 0 0 0 2px #b8972e, 0 0 0 10px rgba(184,151,46,.18); }
  .b06-route .wp.mute .d { background: #cbd5e3; box-shadow: 0 0 0 2px #cbd5e3; }
  .b06-route .wp.mute .t { color: #a8b3c4; }
  .b06-q { position: absolute; left: 120px; top: 366px; width: 900px; padding: 36px 42px; display: grid; }
  .b06-q > * { grid-area: 1 / 1; font: 600 34px/1.38 "DM Sans", sans-serif; color: #0d1e3a; margin: 0; transition: opacity .6s ease; }
  .b06-switch-w { position: absolute; display: grid; justify-items: center; gap: 8px; }
  .b06-switch-w .lb { font: 700 15px/1 "DM Sans", sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #8a6e22; }
  .b06-switch { position: relative; width: 74px; height: 38px; border-radius: 999px; border: 0; background: #cbd5e3; padding: 0; transition: background .25s ease; }
  .b06-switch::after { content: ""; position: absolute; left: 4px; top: 4px; width: 30px; height: 30px; border-radius: 50%; background: #fffdf8; box-shadow: 0 2px 6px rgba(13,30,58,.25); transition: transform .25s ease; }
  .b06-switch[aria-checked="true"] { background: #0d1e3a; }
  .b06-switch[aria-checked="true"]::after { transform: translateX(36px); background: #d5bd68; }
  .b06-skip { position: absolute; display: flex; align-items: center; gap: 12px; border: 0; background: transparent; padding: 0; color: #667389; font: 600 16px/1 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; }
  .b06-skip .ic { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: #0d1e3a; color: #f7f5f1; transition: background .2s ease, color .2s ease; }
  .b06-skip:hover .ic { background: #b8972e; color: #0d1e3a; }
  .b06-skip:hover { color: #0d1e3a; }

  /* tables */
  .b06-tblw { border-radius: 12px; overflow: hidden; }
  .b06-tbl { width: 100%; border-collapse: collapse; font: 600 21px/1.25 "DM Sans", sans-serif; color: #0d1e3a; font-variant-numeric: lining-nums tabular-nums; }
  .b06-tbl th { font: 700 14px/1.25 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #f7f5f1; background: #0d1e3a; padding: 14px 16px; }
  .b06-tbl td { padding: 13px 16px; border-bottom: 1px solid rgba(13,30,58,.10); }
  .b06-tbl tbody tr:nth-child(odd) td { background: rgba(227,232,240,.5); }
  .b06-tbl .r { text-align: right; } .b06-tbl .c { text-align: center; } .b06-tbl .l { text-align: left; }

  /* estplan2 tile map */
  .b06-tile { position: absolute; display: grid; place-items: center; border-radius: 9px; font: 700 15px/1 "DM Sans", sans-serif; letter-spacing: .04em; box-sizing: border-box; }
  .b06-tile.k0 { background: #e3e8f0; color: #667389; }
  .b06-tile.k1 { background: #2b4c80; color: #f7f5f1; }
  .b06-tile.k2 { background: #b8972e; color: #0d1e3a; }
  .b06-tile.k3 { background: linear-gradient(135deg, #2b4c80 0 50%, #b8972e 50% 100%); color: #f7f5f1; text-shadow: 0 1px 2px rgba(13,30,58,.5); }
  .b06-legend { position: absolute; display: flex; gap: 30px; align-items: center; justify-content: center; font: 600 18px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-fn { color: #8a6e22; font-weight: 700; font-size: .7em; margin-left: 2px; }
  .b06-legend .sw { display: inline-block; width: 26px; height: 26px; border-radius: 6px; vertical-align: middle; margin-right: 10px; }

  /* education fund estimator */
  .b06-edu { position: absolute; left: 160px; width: 1280px; top: 30px; }
  .b06-edu .panel { position: relative; padding: 20px 34px 22px; }
  .stage .b06-edu .st-field { padding: 8px 0; }
  .b06-edu .sect { margin: 12px 0 10px; font: 700 15px/1.2 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6e22; display: flex; align-items: center; gap: 14px; }
  .b06-edu .sect::after { content: ""; flex: 1; height: 2px; background: #b8972e; opacity: .5; }
  .b06-stu { border: 1px solid #cbd5e3; border-radius: 12px; overflow: hidden; background: #fff; }
  .b06-stu .sc { max-height: 196px; min-height: 98px; overflow-y: auto; }
  .b06-stu table { width: 100%; border-collapse: collapse; font: 600 19px/1.2 "DM Sans", sans-serif; color: #0d1e3a; table-layout: fixed; }
  .b06-stu th { font: 700 13px/1.2 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #f7f5f1; background: #0d1e3a; padding: 12px 12px; }
  .b06-stu td { padding: 9px 12px; border-bottom: 1px solid rgba(13,30,58,.08); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .b06-stu tbody tr:nth-child(even) td { background: rgba(227,232,240,.45); }
  .b06-stu .r { text-align: right; } .b06-stu .l { text-align: left; } .b06-stu .c { text-align: center; }
  .b06-stu .empty td { text-align: center; color: #8a93a3; font-weight: 500; padding: 30px 12px; background: transparent !important; }
  .b06-stu .ft { display: flex; justify-content: flex-start; padding: 10px 12px; border-top: 1px solid #cbd5e3; background: #f7f5f1; }
  .b06-ic { width: 36px; height: 36px; border-radius: 50%; border: 0; background: transparent; color: #2b4c80; display: inline-grid; place-items: center; }
  .b06-ic:hover { background: #e3e8f0; color: #0d1e3a; }
  .b06-ic.del:hover { color: #b3402e; }
  .b06-res { position: absolute; left: 0; right: 0; padding: 22px 34px; max-height: 196px; overflow-y: auto; display: grid; gap: 10px; }
  .b06-res p { margin: 0; font: 500 22px/1.45 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-res p b, .b06-res p .num { font-weight: 700; }
  .b06-res p.neg { font-size: 17px; color: #6b6560; }
  .b06-actbar { position: absolute; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 56px; }
  .b06-actbar .b06-link { position: static; }
  .stage .b06-dlg .st-overlay-in { width: 660px; }
  .stage .b06-dlg .st-overlay-b { padding: 24px 32px 26px; }
  .b06-dlg-f { display: grid; gap: 0; }
  .b06-dlg-f .row { display: grid; grid-template-columns: 1fr 240px; gap: 20px; align-items: center; padding: 9px 0; border-bottom: 1px solid rgba(13,30,58,.08); }
  .b06-dlg-f .row:last-child { border-bottom: 0; }
  .b06-dlg-f .row > span { font: 600 19px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b06-dlg-f .st-input { text-align: right; height: 48px; font-size: 20px; }
  .stage .b06-dlg-f .st-input.txt { text-align: left; }
  .b06-dlg-btns { display: flex; justify-content: flex-end; gap: 14px; margin-top: 20px; }
  .stage .b06-dlg-btns .st-pill.ghost { background: transparent; color: #0d1e3a; border-color: #cbd5e3; }
  .b06-dlg-q { margin: 4px 0 6px; font: 500 23px/1.4 "DM Sans", sans-serif; color: #0d1e3a; }

  /* bullet rows (EFA.lib.bullets.row with a card) */
  .b06-blist { position: absolute; display: grid; }
  .stage .b06-rl { font: 600 30px/84px "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b06-rm { font: 600 27px/76px "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b06-rs { font: 600 24px/66px "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b06-rx { font: 600 34px/92px "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-fb { display: grid; grid-template-columns: var(--lib-bul-w, 54px) 1fr; column-gap: .55em; transition: opacity .8s ease; }
  .stage .b06-fb.is-off { transition: opacity .3s ease; }
  .b06-bcard { background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 14px; box-shadow: 0 10px 26px rgba(13,30,58,.07); padding: 18px 28px; font: 600 27px/1.38 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-bcard.lg { font-size: 30px; padding: 20px 30px; }
  .b06-bcard.sm { font-size: 24px; padding: 15px 24px; }
  .b06-bcard.xl { font-size: 34px; padding: 22px 32px; }
  .b06-bcard .b06-em { color: #8a6e22; }
  .b06-bcard .caps { text-transform: uppercase; letter-spacing: .04em; }
  .b06-nick { color: #8a6e22; }
  .b06-opt { display: flex; align-items: baseline; gap: 16px; font: 700 34px/1.25 "DM Sans", sans-serif; color: #0d1e3a; transition: opacity .8s ease; }
  .stage .b06-opt.is-off { transition: opacity .3s ease; }
  .b06-opt .n { color: #8a6e22; }
  .b06-or { font: 700 30px/1 "DM Sans", sans-serif; letter-spacing: .16em; color: #8a6e22; text-align: center; transition: opacity .8s ease; }
  .stage .b06-or.is-off { transition: opacity .3s ease; }
  .b06-ex { display: grid; gap: 0; }
  .b06-ex .e { display: flex; align-items: baseline; gap: 16px; font: 700 26px/1.25 "DM Sans", sans-serif; color: #0d1e3a; padding: 6px 0; transition: opacity .8s ease; }
  .stage .b06-ex .e.is-off { transition: opacity .3s ease; }
  .b06-ex .e .n { flex: 0 0 34px; height: 34px; border-radius: 50%; background: #0d1e3a; color: #f7f5f1; display: grid; place-items: center; font: 700 17px/1 "DM Sans", sans-serif; transform: translateY(-3px); }
  .b06-tm { position: absolute; font: 700 15px/1.3 "DM Sans", sans-serif; color: #667389; text-align: right; }

  /* fincars3 ladder */
  .b06-ladder { padding: 18px 26px 18px; }
  .b06-ladder .lr { display: flex; justify-content: space-between; align-items: center; padding: 7px 6px; border-radius: 8px; cursor: pointer; transition: opacity .8s ease, background .2s ease; }
  .stage .b06-ladder .lr.is-off { transition: opacity .3s ease; }
  .b06-ladder .lr:hover { background: #f0e6c4; }
  .b06-ladder .lr .k { font: 600 20px/1.2 "DM Sans", sans-serif; color: #667389; }
  .b06-ladder .lr .v { font: 700 23px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-ladder .tot { display: flex; justify-content: space-between; align-items: baseline; margin-top: 10px; padding: 14px 6px 2px; border-top: 2px solid #cbd5e3; }
  .b06-ladder .tot .k { font: 700 16px/1 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6e22; }
  .b06-ladder .tot .v { font: 700 34px/1 "DM Sans", sans-serif; color: #8a6e22; }
  `);

  /* ---------- shared helpers ---------- */
  const goldGrad = (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset="1" stop-color="${P.gold}"/></linearGradient>`;
  const navyGrad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a || P.navy4}"/><stop offset="1" stop-color="${b || P.navy2}"/></linearGradient>`;
  const num = (v) => `<span class="num">${v}</span>`;
  /** safe lookup in EFA.data: D('fed.estate.exemption', null) */
  function D(path, def) {
    let o = EFA.data;
    for (const k of String(path).split('.')) { if (o == null || typeof o !== 'object') return def; o = o[k]; }
    return o == null ? def : o;
  }
  /** first defined value among several candidate paths */
  const Dany = (paths, def) => { for (const p of paths) { const v = D(p, undefined); if (v !== undefined) return v; } return def; };
  /** centered heading with a gold rule, optional sub heading key */
  function head(ctx, key, o) {
    o = o || {};
    return `<div class="b06-head" style="top:${o.top || 52}px">${ctx.t(key, { tag: 'h1', cls: 'st-h1' + (o.sm ? ' sm' : '') })}${o.rule === false ? '' : '<hr class="st-rule">'}${o.sub ? ctx.t(o.sub, { tag: 'p', cls: 'b06-sub' }) : ''}</div>`;
  }
  /** rich line from copy chunks: 'a [b] c ~d' ([x] emphasized, ~x joins with no space) */
  function rich(ctx, spec) {
    return spec.trim().split(/\s+/).map((tok, i) => {
      let sp = i ? ' ' : '';
      if (tok[0] === '~') { sp = ''; tok = tok.slice(1); }
      const em = tok[0] === '[';
      const key = em ? tok.slice(1, -1) : tok;
      return sp + ctx.t(key, em ? { cls: 'b06-em' } : {});
    }).join('');
  }
  /** fade-step helper: n > idx shows the element */
  const stepShow = (ctx, sel, on) => ctx.show(sel, on);
  const chev = (dir) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${dir === 2 ? '<path d="M5 6l6 6-6 6M12 6l6 6-6 6"/>' : '<path d="M9 5l7 7-7 7"/>'}</svg>`;
  const icEdit = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6L9 21H3v-6z"/></svg>';
  const icDel = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>';
  /** a quiet "figures being verified" panel used when EFA.data has not landed */
  const pending = (ctx, key) => `<div class="b06-pending"><span class="dot"></span>${ctx.t(key, { tag: 'p', attrs: 'style="margin:0;max-width:620px"' })}</div>`;
  /* ---------- shared libraries (EFA.lib), guarded while they load ---------- */
  const lib = (n) => (EFA.lib && EFA.lib[n]) || null;
  /** per-client shared values ("case data"), stored under the 'case' namespace exactly as EFA.lib.caseData does */
  const cget = (key, def) => { const c = lib('caseData'); return c && c.get ? c.get(key, def) : EFA.clients.get('case', key, def); };
  const cset = (key, v) => { const c = lib('caseData'); if (c && c.set) c.set(key, v); else EFA.clients.set('case', key, v); };
  /** a ctx.field bound to a shared case key (EFA.lib.caseData.field, or the same behavior on ctx.field) */
  function cfield(ctx, o) {
    const c = lib('caseData');
    if (c && c.field) return c.field(ctx, o);
    const id = o.id || o.key, v = cget(o.key, o.value);
    ctx.remember('f.' + id, v);
    if (!ctx._b06keys) { ctx._b06keys = {}; ctx.onFields((vals) => Object.entries(ctx._b06keys).forEach(([fid, key]) => { if (vals[fid] != null) cset(key, vals[fid]); })); }
    ctx._b06keys[id] = o.key;
    return ctx.field(Object.assign({}, o, { id, value: v }));
  }
  /** one bullet row: EFA.lib.bullets.row around our card; the row's text class sets the first-line box the dart centers on */
  const ROWCLS = { lg: 'b06-rl', sm: 'b06-rs', xl: 'b06-rx', '': 'b06-rm' };
  function brow(html, o) {
    const m = /b06-bcard ?(\w*)/.exec(html), rc = ROWCLS[m ? m[1] : ''] || 'b06-rm';
    const b = lib('bullets');
    if (b && b.row) return b.row(html, { at: o.at, size: o.size || 54, text: rc, cls: 'b06-brow ' + (o.cls || '') });
    return `<div class="b06-fb ${rc} ${o.at > 0 ? 'is-off' : ''} ${o.cls || ''}" data-b06at="${o.at}"><span></span><div>${html}</div></div>`;
  }
  /** reveal bullet rows for step n (library reveal, plus our own rows while it loads) */
  function breveal(ctx, n) {
    const b = lib('bullets'); if (b && b.reveal) b.reveal(ctx, n);
    ctx.$$('[data-b06at]').forEach((el) => el.classList.toggle('is-off', n < +el.dataset.b06at));
  }
  const card = (inner, cls) => `<div class="b06-bcard ${cls || ''}">${inner}</div>`;
  /** Joshua's standard compliance line(s) from EFA.lib.disclosure (nothing until it loads) */
  const discLine = (topics, o) => { const d = lib('disclosure'); return d && d.line ? d.line(topics, o || {}) : ''; };

  /* ---------- new illustrations (flat duotone, navy and gold on paper) ---------- */
  const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${P.shadow}"/>`;
  let gid = 0; const nid = (p) => `b06${p}${++gid}`;
  const ill = {
    /** a large question mark with a gold dot */
    question() {
      const g = nid('q');
      return `<svg viewBox="0 0 400 400" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.navy4}"/><stop offset="1" stop-color="${P.navy}"/></linearGradient></defs>
        ${shadow(200, 374, 92, 11)}
        <path d="M126 142C126 84 168 50 212 50C260 50 292 84 292 128C292 172 258 192 232 208C212 220 204 234 204 262" fill="none" stroke="url(#${g})" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M150 128C156 96 182 78 210 78" fill="none" stroke="${P.steel}" stroke-width="9" stroke-linecap="round" opacity=".55"/>
        <circle cx="204" cy="330" r="30" fill="${P.gold}"/><circle cx="196" cy="321" r="9" fill="${P.goldPale}" opacity=".7"/>
        <g stroke="${P.gold}" stroke-width="7" stroke-linecap="round"><path d="M322 66l20-16M332 104l26-2M310 34l6-24"/></g></svg>`;
    },
    /** a piggy bank on stacks of bills */
    piggy() {
      const g = nid('p'), b = nid('b');
      const bill = (x, y, w, rot) => `<g transform="rotate(${rot} ${x + w / 2} ${y + 22})"><rect x="${x}" y="${y}" width="${w}" height="44" rx="6" fill="${P.paper}" stroke="${P.navy}" stroke-width="4"/>
        <rect x="${x + w / 2 - 22}" y="${y}" width="44" height="44" fill="${P.gold}"/><ellipse cx="${x + 46}" cy="${y + 22}" rx="22" ry="12" fill="none" stroke="${P.mist2}" stroke-width="4"/><ellipse cx="${x + w - 46}" cy="${y + 22}" rx="22" ry="12" fill="none" stroke="${P.mist2}" stroke-width="4"/></g>`;
      const edges = (x, y, w, n) => Array.from({ length: n }, (_, i) => `<path d="M${x + 4} ${y + i * 9}h${w - 8}" stroke="${P.navy}" stroke-width="3" opacity=".22"/>`).join('');
      return `<svg viewBox="0 0 560 480" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset=".6" stop-color="${P.gold}"/><stop offset="1" stop-color="${P.goldDeep}"/></linearGradient>
          <linearGradient id="${b}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.paper}"/><stop offset="1" stop-color="${P.mist}"/></linearGradient></defs>
        ${shadow(280, 456, 238, 15)}
        <rect x="44" y="370" width="290" height="78" rx="8" fill="url(#${b})" stroke="${P.navy}" stroke-width="4"/>${edges(44, 384, 290, 6)}
        <rect x="262" y="384" width="256" height="64" rx="8" fill="url(#${b})" stroke="${P.navy}" stroke-width="4"/>${edges(262, 398, 256, 5)}
        ${bill(52, 330, 280, -3)}${bill(250, 346, 262, 4)}
        <g stroke="${P.navy}" stroke-width="5" stroke-linejoin="round">
          <rect x="170" y="296" width="34" height="56" rx="12" fill="${P.goldDeep}"/><rect x="212" y="302" width="34" height="52" rx="12" fill="${P.goldDeep}"/>
          <rect x="344" y="300" width="34" height="54" rx="12" fill="${P.goldDeep}"/><rect x="386" y="294" width="34" height="56" rx="12" fill="${P.goldDeep}"/>
          <path d="M116 214c-30-6-40 22-22 32 16 9 30-12 14-20" fill="none" stroke-width="7" stroke-linecap="round"/>
          <ellipse cx="290" cy="214" rx="176" ry="118" fill="url(#${g})"/>
          <path d="M372 118C376 92 392 70 414 64C424 82 426 108 418 132Z" fill="${P.gold}"/>
          <ellipse cx="462" cy="218" rx="30" ry="40" fill="${P.goldLt}"/>
        </g>
        <path d="M168 150c26-34 74-52 124-52" fill="none" stroke="${P.goldPale}" stroke-width="12" stroke-linecap="round" opacity=".8"/>
        <ellipse cx="455" cy="205" rx="5" ry="8" fill="${P.navy}"/><ellipse cx="469" cy="232" rx="5" ry="8" fill="${P.navy}"/>
        <circle cx="398" cy="178" r="10" fill="${P.navy}"/><circle cx="401" cy="175" r="3" fill="${P.white}"/>
        <rect x="252" y="100" width="82" height="13" rx="6.5" fill="${P.navy}"/>
        <g transform="translate(293 50)"><ellipse rx="17" ry="34" fill="${P.gold}" stroke="${P.navy}" stroke-width="5"/><ellipse rx="7" ry="22" fill="none" stroke="${P.goldPale}" stroke-width="4" opacity=".8"/></g>
        <g stroke="${P.gold}" stroke-width="6" stroke-linecap="round"><path d="M254 34l-16-14M332 34l16-14M246 64h-22M340 64h22"/></g></svg>`;
    },
    /** an older couple seen from behind on a hill crest, one pointing toward the horizon */
    couple() {
      const s = nid('s'), h = nid('h'), m = nid('m');
      return `<svg viewBox="0 0 420 660" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
          <linearGradient id="${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.paper}"/><stop offset=".6" stop-color="${P.goldPale}"/><stop offset="1" stop-color="${P.goldLt}"/></linearGradient>
          <linearGradient id="${h}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.navy4}"/><stop offset="1" stop-color="${P.navy3}"/></linearGradient>
          <linearGradient id="${m}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.steel}"/><stop offset="1" stop-color="${P.water}"/></linearGradient></defs>
        <rect width="420" height="660" fill="url(#${s})"/>
        <circle cx="300" cy="404" r="92" fill="${P.paper}" opacity=".5"/><circle cx="300" cy="404" r="56" fill="${P.gold}"/>
        <g stroke="${P.goldDeep}" stroke-width="3" stroke-linecap="round" opacity=".35" fill="none"><path d="M70 170c14-8 26-8 38 0 12-8 24-8 36 0"/><path d="M286 116c10-6 20-6 30 0 10-6 20-6 30 0"/></g>
        <path d="M0 438C60 420 120 424 180 436S320 428 420 412V660H0z" fill="${P.mist2}"/>
        <path d="M0 470C80 448 160 456 230 468S350 462 420 450V660H0z" fill="url(#${m})"/>
        <path d="M300 452C296 470 280 486 276 506C270 530 290 548 282 578C276 600 262 612 252 622L300 624C306 604 314 588 312 562C308 532 296 516 300 498C302 480 304 466 302 452Z" fill="${P.paper}" opacity=".9"/>
        <path d="M0 612C70 590 150 584 230 594S360 604 420 596V660H0z" fill="url(#${h})"/>
        ${shadow(176, 612, 104, 8)}
        <g stroke-linecap="round" stroke-linejoin="round">
          <path d="M128 610V556M148 610V556" stroke="${P.navy2}" stroke-width="14"/>
          <path d="M108 470c0-20 13-32 30-32s30 12 30 32l9 92H99z" fill="${P.navy3}"/>
          <path d="M114 462c10 7 38 7 48 0" stroke="${P.gold}" stroke-width="9" fill="none"/>
          <circle cx="138" cy="412" r="22" fill="${P.mist2}"/><circle cx="138" cy="389" r="10" fill="${P.mist2}"/>
          <path d="M126 404c6-6 18-6 24 0" stroke="${P.white}" stroke-width="3" opacity=".6" fill="none"/>
          <path d="M214 610V550M238 610V550" stroke="${P.navy2}" stroke-width="15"/>
          <path d="M194 462c0-22 16-36 34-36s34 14 34 36l9 98H185z" fill="${P.navy}"/>
          <path d="M256 456L298 400L322 360" stroke="${P.navy}" stroke-width="16" fill="none"/>
          <circle cx="324" cy="355" r="9" fill="${P.navy}"/>
          <path d="M198 472C184 482 170 486 160 484" stroke="${P.navy}" stroke-width="15" fill="none"/>
          <circle cx="228" cy="402" r="23" fill="${P.mist}"/><path d="M206 404c2-14 12-24 22-24s20 10 22 24c-6-6-14-9-22-9s-16 3-22 9z" fill="${P.mist2}"/>
        </g></svg>`;
    }
  };

  /* =====================================================================
     FINCARS: Financing a Car
     ===================================================================== */
  EFA.screen('fincars1', {
    title: 'What financing a car takes out of your wealth',
    copy: {
      head: 'Financing a Car',
      wealth: 'Your Circle\nof Wealth', opp: 'Opportunity\nCost', int: 'Interest', prin: 'Car Debt\nPrincipal',
      _notes: 'A car loan takes three bites out of your circle, not one: the principal, the interest, and everything that money could have earned for you instead.\n\n- Ask: When you financed your last car, which of these three did anyone walk you through?\nPAUSE'
    },
    render(ctx) {
      const cx = 640, cy = 518, r = 286;
      const sl = [
        { k: 'opp', a0: 0, a1: 60, f: `url(#fc1a)` },
        { k: 'int', a0: 60, a1: 120, f: `url(#fc1g)` },
        { k: 'prin', a0: 120, a1: 180, f: `url(#fc1b)` }
      ];
      const ex = 9;
      let paths = `<path d="${A.wedge(cx, cy, r, 180.6, 359.4)}" fill="url(#fc1n)"/>`, labs = '';
      sl.forEach((s) => {
        const mid = (s.a0 + s.a1) / 2, [dx, dy] = [ex * Math.sin(mid * Math.PI / 180), -ex * Math.cos(mid * Math.PI / 180)];
        paths += `<path d="${A.wedge(cx + dx, cy + dy, r, s.a0 + 0.8, s.a1 - 0.8)}" fill="${s.f}"/>`;
        const [lx, ly] = A.pt(cx + dx, cy + dy, r * (s.k === 'int' ? 0.64 : 0.68), mid);
        labs += `<div class="b06-lab dark sm" style="left:${lx}px;top:${ly}px">${ctx.t(s.k)}</div>`;
      });
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <svg class="b06-full" viewBox="0 0 1600 900"><defs>${goldGrad('fc1g')}
          <linearGradient id="fc1a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldPale}"/><stop offset="1" stop-color="${P.goldLt}"/></linearGradient>
          <linearGradient id="fc1b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.gold}"/><stop offset="1" stop-color="${P.goldDeep}"/></linearGradient>
          ${navyGrad('fc1n', P.navy3, P.navy)}</defs>
          <circle cx="${cx}" cy="${cy + 10}" r="${r + 12}" fill="rgba(13,30,58,.07)"/>${paths}</svg>
        <div class="b06-lab" style="left:${cx - r * 0.5}px;top:${cy}px;font-size:28px">${ctx.t('wealth')}</div>${labs}
        <div class="b06-med" style="left:1036px;top:318px;width:420px;height:420px"><div style="width:84%">${A.ill.car()}</div></div>`;
    }
  });

  /** monthly payment for a car loan (end-of-month annuity) */
  const carPmt = (P0, rate, n) => { const i = rate / 12; if (n <= 0) return 0; return i === 0 ? P0 / n : P0 * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1); };
  const carLoan = () => ({
    amt: cget('car_financed_amount', 30000),
    rate: cget('car_financed_interest_rate', 0.06),
    n: cget('car_financed_term_in_months', 60)
  });

  EFA.screen('fincars2', {
    title: 'Car loan payment and interest calculator',
    steps: 2,
    copy: {
      head: 'Interest: Yours or Theirs?',
      lAmt: 'Amount Financed', lRate: 'Interest Rate', lN: 'Number of Payments',
      calc: 'Calculate', resHead: 'Your car payments will be...',
      rPay: 'Monthly Payments', rTot: 'Total Amount Paid', rInt: 'Total Interest Paid',
      disc: 'Hypothetical example for illustration only. Your actual loan terms, rate and payments will vary.',
      _notes: 'Every car payment carries interest. The question is whose pocket it lands in.\n\n- Enter the client\'s own loan, then Calculate.\n- Ask: If you could keep that interest in your own circle instead, what would it be worth to you?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="b06-card" style="left:448px;top:206px;width:704px;padding:14px 36px">
          <div class="b06-form">
            ${cfield(ctx, { key: 'car_financed_amount', id: 'amt', label: 'lAmt', type: 'money', value: 30000, min: 0 })}
            ${cfield(ctx, { key: 'car_financed_interest_rate', id: 'rate', label: 'lRate', type: 'pct', value: 0.06, min: 0, max: 0.4, dp: 2 })}
            ${cfield(ctx, { key: 'car_financed_term_in_months', id: 'n', label: 'lN', type: 'int', value: 60, min: 1, max: 600 })}
          </div>
        </div>
        <button type="button" class="st-pill b06-calc b06-fade calc" style="top:500px">${ctx.t('calc')}</button>
        <div class="b06-card res b06-fade" style="left:480px;top:486px;width:640px;overflow:hidden">
          ${ctx.t('resHead', { tag: 'div', cls: 'b06-band' })}
          <div class="b06-rows" style="padding:8px 28px 16px">
            <div class="r"><span class="k">${ctx.t('rPay')}</span><span class="v num" data-o="pay"></span></div>
            <div class="r"><span class="k">${ctx.t('rTot')}</span><span class="v num" data-o="tot"></span></div>
            <div class="r hl"><span class="k">${ctx.t('rInt')}</span><span class="v num" data-o="int"></span></div>
          </div>
        </div>
        ${ctx.t('disc', { tag: 'p', cls: 'st-disclaimer b06-disc', attrs: 'style="bottom:66px"' })}`;
      ctx.onFields((v) => {
        const pay = carPmt(v.amt, v.rate, Math.round(v.n)), tot = pay * Math.round(v.n);
        ctx.$('[data-o="pay"]').textContent = F.money(pay);
        ctx.$('[data-o="tot"]').textContent = F.money(tot);
        ctx.$('[data-o="int"]').textContent = F.money(tot - v.amt);
      });
      ctx.on(ctx.$('.calc'), 'click', () => ctx.next());
    },
    step(ctx, n) { ctx.show('.calc', n === 0); ctx.show('.res', n === 1); }
  });

  EFA.screen('fincars3', {
    title: 'Future value of car-loan interest',
    steps: 2,
    copy: {
      head: 'Why Car Makers Like to Finance',
      lRate: 'Enter your investment return',
      explain: 'We use it to measure the opportunity cost of your car payments.',
      calc: 'Calculate', fvTitle: 'The future value of...',
      lInt: 'Your loan interest paid', lComp: 'Compounded annually at',
      years: 'Years', total: 'Total',
      _notes: 'The interest on one car loan looks small. Invested instead, it grows for decades, and most families buy a car every few years.\n\n- Click any horizon to see the total if you bought a car every five years over that span.\n- Ask: How many cars do you expect to buy between now and retirement?\nPAUSE'
    },
    render(ctx) {
      const loan = carLoan();
      const pay = Math.round(carPmt(loan.amt, loan.rate, Math.round(loan.n)));
      const baseInterest = pay * Math.round(loan.n) - loan.amt;
      const st = ctx._fc3 = { interest: baseInterest, cut: 0, visit: 0, shown: false };
      const H = [50, 45, 40, 35, 30, 25, 20, 15, 10, 5];
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="s0 b06-fade">
          <div class="b06-card" style="left:328px;top:214px;width:944px;padding:16px 38px 22px">
            <div class="b06-form">${cfield(ctx, { key: 'case_file_ror_accumulation', id: 'ror', label: 'lRate', type: 'pct', value: 0.06, min: 0, max: 0.12, dp: 2 })}</div>
            ${ctx.t('explain', { tag: 'p', attrs: 'style="margin:14px 0 0;font:600 21px/1.4 DM Sans,sans-serif;color:#667389"' })}
          </div>
          <button type="button" class="st-pill b06-calc calc" style="top:440px">${ctx.t('calc')}</button>
        </div>
        <div class="s1 b06-fade">
          <div class="b06-card" style="left:200px;top:190px;width:760px;padding:0 0 10px;overflow:hidden">
            ${ctx.t('fvTitle', { tag: 'div', cls: 'b06-band' })}
            <div class="b06-form" style="padding:4px 34px 0">
              <div class="st-field"><label for="fc3-int">${ctx.t('lInt')}</label><input class="st-input" id="fc3-int" inputmode="decimal" autocomplete="off"></div>
              <div class="st-field"><label for="fc3-ror">${ctx.t('lComp')}</label><input class="st-input" id="fc3-ror" inputmode="decimal" autocomplete="off"></div>
            </div>
          </div>
          <div class="b06-card b06-ladder" style="left:990px;top:150px;width:410px">
            ${H.map((y, i) => `<div class="lr" data-i="${i}"><span class="k">${num(y)} ${ctx.t('years')}</span><span class="v num" data-v="${i}"></span></div>`).join('')}
            <div class="tot"><span class="k">${ctx.t('total')}</span><span class="v num" data-tot></span></div>
          </div>
          ${discLine(['hypothetical'], { style: 'position:absolute;left:200px;top:466px;width:760px;margin:0' })}
        </div>
        <div style="position:absolute;left:170px;top:520px;width:470px">${A.ill.car()}</div>`;
      const ints = ctx.$('#fc3-int'), rors = ctx.$('#fc3-ror');
      const rate = () => ctx.values().ror;
      const draw = () => {
        const r = rate();
        const amts = H.map((y) => st.interest * Math.pow(1 + r, y));
        amts.forEach((a, i) => { ctx.$(`[data-v="${i}"]`).textContent = F.money(a); });
        ctx.$$('.lr').forEach((n, i) => n.classList.toggle('is-off', i < st.cut));
        ctx.$('[data-tot]').textContent = F.money(amts.slice(st.cut).reduce((s, a) => s + a, 0));
        if (document.activeElement !== ints) ints.value = F.money(st.interest);
        if (document.activeElement !== rors) rors.value = F.pct(r, 2);
        EFA.numify(ctx.el);
      };
      ctx._fc3draw = draw;
      ctx.onFields(draw);
      /* the interest box (not remembered) and the step-1 rate box (mirrors the remembered rate) */
      const commitInt = () => { const v = F.parse(ints.value); if (isFinite(v)) st.interest = v; draw(); };
      const commitRor = () => { let v = F.parse(rors.value, true); if (isFinite(v)) { v = Math.max(0, Math.min(0.12, v)); ctx.setField('ror', v); } draw(); };
      ints.addEventListener('focus', () => { ints.value = String(Math.round(st.interest)); ints.select(); });
      ints.addEventListener('blur', commitInt);
      rors.addEventListener('focus', () => { rors.value = String(+(rate() * 100).toFixed(4)); rors.select(); });
      rors.addEventListener('blur', commitRor);
      rors.addEventListener('input', () => { const v = F.parse(rors.value, true); if (v > 0.12) rors.value = '12'; });
      [ints, rors].forEach((n) => n.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') n.blur(); }));
      /* the hypothetical-returns disclosure, once per visit to step 1, on the first click of either rate box */
      const ror0 = ctx.$('[data-field="ror"] input');
      const disclose = (inp) => {
        const d = lib('disclosure');
        if (d && d.once) { d.once(ctx, 'b06rate' + st.visit, () => { inp.focus(); inp.select(); }); return; }
        if (st.shown) return;
        st.shown = true;
        disclosure(ctx, () => ctx.timeout(() => { inp.focus(); inp.select(); }, 200));
      };
      ctx.on(ror0, 'click', () => disclose(ror0));
      ctx.on(rors, 'click', () => disclose(rors));
      ror0.addEventListener('input', () => { const v = F.parse(ror0.value, true); if (v > 0.12) ror0.value = '12'; });
      ctx.on(ctx.$$('.lr'), 'click', (e, n) => { st.cut = +n.dataset.i; draw(); });
      ctx.on(ctx.$('.calc'), 'click', () => ctx.next());
    },
    step(ctx, n, dir) {
      ctx.show('.s0', n === 0); ctx.show('.s1', n === 1);
      if (n === 1 && dir !== 0) { ctx._fc3.shown = false; ctx._fc3.visit++; }
      if (n === 1 && ctx._fc3draw) ctx._fc3draw();
    }
  });

  /** the shared return-rate notice, opened now (EFA.lib.disclosure.open); quiet until the library loads */
  function disclosure(ctx, done) {
    const d = lib('disclosure');
    if (d && d.open) { try { d.open(ctx, { onClose: done }); return; } catch (e) { console.warn('disclosure notice failed', e); } }
    if (done) done();
  }

  /* =====================================================================
     EVA: bullet lessons (eva1, eva2, eva4, eva6)
     ===================================================================== */
  EFA.screen('eva1', {
    title: 'What economic value added means',
    steps: 4,
    copy: {
      head: 'What Is Economic Value Added?',
      p1: 'EVA measures the true economic profit a business creates from the decisions it makes.',
      p2a: 'To find it, take after-tax operating profit and subtract the', p2b: 'cost of capital', p2c: '.',
      p3: 'Here is why that matters for your own money...',
      tm: 'EVA is a registered trademark of Stern Stewart & Co.',
      _notes: 'Big companies learned to ask a simple question: what does our own money cost us? The answer changed how they invest.\n\n- Ask: When you use your own savings, do you think of that money as free?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="b06-blist" style="left:110px;top:236px;width:930px;gap:50px;--lib-bul-w:60px">
          ${brow(card(ctx.t('p1'), 'xl'), { at: 1, size: 60 })}
          ${brow(card(rich(ctx, 'p2a [p2b] ~p2c').replace('b06-em', 'b06-em caps'), 'lg'), { at: 2, size: 60 })}
          ${brow(card(ctx.t('p3'), 'lg'), { at: 3, size: 60 })}
        </div>
        <div class="b06-med" style="left:1086px;top:214px;width:420px;height:420px">${ill.question()}</div>
        ${ctx.t('tm', { cls: 'b06-tm', attrs: 'style="right:94px;top:664px;width:440px"' })}`;
    },
    step(ctx, n) { breveal(ctx, n); }
  });
  EFA.screen('eva2', {
    title: 'How companies decided before EVA',
    steps: 4,
    copy: {
      head: 'Business Decisions Before EVA',
      p1a: 'Managers knew that', p1b: 'debt', p1c: 'had a cost. Borrow at 8%, and that money costs 8%.',
      p2a: 'They treated their own', p2b: 'equity', p2c: ', retained earnings and capital as if it cost nothing. The tax was already paid, and the money sat idle, waiting to be used.',
      p3: 'That thinking skewed the "hurdle rates" financial managers used to choose which projects to fund.',
      _notes: 'For decades, companies treated borrowed money as expensive and their own money as free. Many families still do.\n\n- Ask: Which money in your life feels free to spend, and which feels expensive?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="b06-blist" style="left:160px;top:240px;width:1280px;gap:58px;--lib-bul-w:60px">
          ${brow(card(rich(ctx, 'p1a [p1b] p1c').replace('b06-em', 'b06-em caps'), 'lg'), { at: 1, size: 58 })}
          ${brow(card(rich(ctx, 'p2a [p2b] ~p2c').replace('b06-em', 'b06-em caps'), 'lg'), { at: 2, size: 58 })}
          ${brow(card(ctx.t('p3'), 'lg'), { at: 3, size: 58 })}
        </div>`;
    },
    step(ctx, n) { breveal(ctx, n); }
  });
  EFA.screen('eva4', {
    title: 'Giving existing capital a cost',
    steps: 4,
    copy: {
      head: 'Putting a Cost on the Capital a Company Already Holds',
      p1a: 'Management learned that its own', p1b: 'equity', p1c: 'carries a real cost of capital. It is never', p1d: 'zero', p1e: ', and it is often higher than the cost of debt.',
      p2: 'If the stock market\'s historical average return at the time was around 12%, investors would expect at least that much.',
      p3a: 'A company that only took on 6% projects would watch investors sell its shares and move to companies that put capital to work more', p3b: 'wisely', p3c: '.',
      _notes: 'Once a company gives its own money a cost, the bar for every decision rises.\n\n- Ask: If your savings had to earn their keep, which of your current choices would still clear the bar?\nPAUSE'
    },
    render(ctx) {
      const caps = (h) => h.split('b06-em').join('b06-em caps');
      ctx.el.innerHTML = `${head(ctx, 'head', { sm: true })}
        <div class="b06-blist" style="left:160px;top:232px;width:1280px;gap:50px;--lib-bul-w:60px">
          ${brow(card(caps(rich(ctx, 'p1a [p1b] p1c [p1d] ~p1e')), 'lg'), { at: 1, size: 58 })}
          ${brow(card(ctx.t('p2'), 'lg'), { at: 2, size: 58 })}
          ${brow(card(caps(rich(ctx, 'p3a [p3b] ~p3c')), 'lg'), { at: 3, size: 58 })}
        </div>
        ${discLine(['past'], { style: 'position:absolute;left:160px;right:160px;top:790px;text-align:center;margin:0' })}`;
    },
    step(ctx, n) { breveal(ctx, n); }
  });
  EFA.screen('eva6', {
    title: 'Applying EVA thinking to personal wealth',
    steps: 5,
    copy: {
      head: 'Concepts We Can Carry Into Our Own Wealth Strategy',
      p1a: 'Our capital has value, so it has a cost. Treating it as if it cost', p1b: 'zero', p1c: 'can lead to', p1d: 'unwise', p1e: 'choices about using it, including simply giving it away.',
      p2a: 'Capital reserves take real effort to build. Respect that effort by giving them a', p2b: 'high', p2c: 'value.',
      p3a: 'Whenever we put our capital to work, we should', p3b: 'demand', p3c: 'a strong return on it.',
      p4a: 'So when we borrow against our own reserves, we want to repay them at a', p4b: 'high market rate', p4c: ',', p4d: 'not', p4e: 'a low one.',
      calc: 'Calculator',
      _notes: 'The lesson companies learned applies at home: your reserves are valuable, so treat them that way, especially when you borrow from them.\n\n- Ask: When you borrow from your own savings, do you pay yourself back with interest?\nPAUSE\n\n- Calculator opens a how-would-you-like-to-pay-for-it calculator and returns here.'
    },
    render(ctx) {
      const caps = (h) => h.split('b06-em').join('b06-em caps');
      ctx.el.innerHTML = `${head(ctx, 'head', { sm: true })}
        <div class="b06-blist" style="left:160px;top:206px;width:1280px;gap:26px;--lib-bul-w:56px">
          ${brow(card(caps(rich(ctx, 'p1a [p1b] p1c [p1d] p1e'))), { at: 1, size: 54 })}
          ${brow(card(caps(rich(ctx, 'p2a [p2b] p2c'))), { at: 2, size: 54 })}
          ${brow(card(caps(rich(ctx, 'p3a [p3b] p3c'))), { at: 3, size: 54 })}
          ${brow(card(caps(rich(ctx, 'p4a [p4b] ~p4c [p4d] p4e'))), { at: 4, size: 54 })}
        </div>
        <button type="button" class="st-pill b06-fade go" style="position:absolute;right:160px;top:772px;gap:10px">${ctx.t('calc')}${chev(1)}</button>`;
      ctx.on(ctx.$('.go'), 'click', () => ctx.jump('EVAC', 'evac1'));
    },
    step(ctx, n) { breveal(ctx, n); ctx.show('.go', n > 3); }
  });

  /* =====================================================================
     ESTPLN: bullet lessons (estplan3, estplan4, estplan5, estplan7)
     ===================================================================== */
  EFA.screen('estplan3', {
    title: 'Other transfers at death',
    steps: 5,
    copy: {
      head: 'Besides federal and state estate taxes,\nother wealth transfers can happen at death.',
      i1: 'Debts / Estate Liabilities', i2: 'Legal and Administrative Fees', i3: 'Probate / Contestability', i4: 'Income Taxes',
      _notes: 'Estate tax gets the headlines. These quieter costs reach almost every family.\n\n- Ask: Which of these would your family be ready to handle?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head', { sm: true })}
        <div class="b06-blist" style="left:372px;top:276px;width:856px;gap:34px;--lib-bul-w:62px">
          ${[1, 2, 3, 4].map((i) => brow(card(ctx.t('i' + i), 'lg'), { at: i, size: 60 })).join('')}
        </div>`;
    },
    step(ctx, n) { breveal(ctx, n); }
  });
  EFA.screen('estplan4', {
    title: 'Your choice: do nothing or plan',
    steps: 6,
    copy: {
      head: 'It\'s Your Choice',
      o1n: '1)', o1: 'Do Nothing',
      c1: 'Let the state court system decide how, when and to whom your assets go.',
      c2: 'Let other people rush the sale or liquidation of your assets.',
      c3: 'Let federal and state tax codes decide how, when and how much tax you pay.',
      or: 'OR',
      o2n: '2)', o2: 'Make these choices yourself now, as part of your financial and estate plan.',
      famous: 'Famous Estates',
      _notes: 'Everyone has an estate plan. If you do not write one, the state has one ready for you.\n\n- Ask: Which of these two plans would you rather your family live with?\nPAUSE\n\n- Famous Estates opens real examples and returns here.'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div style="position:absolute;left:150px;top:184px;width:1300px;display:grid;gap:16px">
          <div class="b06-opt o1 is-off"><span class="n">${ctx.t('o1n')}</span>${ctx.t('o1')}</div>
          <div class="b06-blist" style="position:relative;width:92%;margin-left:4%;gap:16px;--lib-bul-w:52px">
            ${[1, 2, 3].map((i) => brow(card(ctx.t('c' + i)), { at: i + 1, size: 52 })).join('')}
          </div>
          <div class="b06-or is-off" style="margin:6px 0">${ctx.t('or')}</div>
          <div class="b06-opt o2 is-off"><span class="n">${ctx.t('o2n')}</span>${ctx.t('o2')}</div>
        </div>
        <button type="button" class="st-pill b06-fade fam is-off" style="position:absolute;right:240px;top:770px;gap:10px">${ctx.t('famous')}${chev(1)}</button>`;
      ctx.on(ctx.$('.fam'), 'click', () => ctx.jump('FAMEST', 'estates1'));
    },
    step(ctx, n) {
      ctx.show('.o1', n >= 1);
      breveal(ctx, n);
      ctx.show('.b06-or', n >= 5); ctx.show('.o2', n >= 5); ctx.show('.fam', n >= 5);
    }
  });
  EFA.screen('estplan5', {
    title: 'Three ways to pass on assets',
    steps: 4,
    copy: {
      head: 'Three Ways to Pass On Assets',
      n1: 'Let the State Decide', t1: 'Nothing in Place',
      n2: 'Hope for the Best', t2: 'Will',
      n3: 'Keep It Private', t3: 'Living Trust',
      close: 'Consult an estate planning attorney.',
      _notes: 'Three roads. The first is chosen for you, the second depends on the courts, the third keeps your family\'s business private.\n\n- Ask: Which of these describes where your family is today?\nPAUSE'
    },
    render(ctx) {
      const item = (i) => card(`<span class="b06-nick">${ctx.t('n' + i)}</span>: ${ctx.t('t' + i)}`, 'lg');
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="b06-blist" style="left:224px;top:262px;width:1152px;gap:56px;--lib-bul-w:62px">${[1, 2, 3].map((i) => brow(item(i), { at: i, size: 60 })).join('')}</div>
        ${ctx.t('close', { tag: 'p', cls: 'b06-fade close is-off', attrs: 'style="position:absolute;left:0;right:0;top:716px;margin:0;text-align:center;font:700 34px/1.2 DM Sans,sans-serif;color:#0d1e3a"' })}`;
    },
    step(ctx, n) { breveal(ctx, n); ctx.show('.close', n > 2); }
  });
  EFA.screen('estplan7', {
    title: 'Which assets to leave behind',
    steps: 5,
    copy: {
      head: 'Which Assets to Leave Behind',
      k1: 'Tax Free', k2: 'Capital Assets', k3: 'Taxable', k4: 'Tax Deferred',
      e1: 'Life insurance', e2: 'Roth IRA', e3: 'Real estate', e4: 'Individual stocks and bonds',
      e5: 'Brokerage accounts and mutual funds', e6: 'Checking, savings, money market and CDs', e7: 'Deferred annuities', e8: 'Traditional retirement accounts',
      _notes: 'How an asset is taxed when it passes can matter as much as how much it is worth.\n\n- Ask: If you could choose which assets your children inherit, which would you leave them first?\nPAUSE'
    },
    render(ctx) {
      const y0 = 214, rowH = 140;
      ctx.el.innerHTML = `${head(ctx, 'head')}
        ${[1, 2, 3, 4].map((k) => `<div class="b06-blist" style="left:130px;top:${y0 + (k - 1) * rowH}px;width:560px;--lib-bul-w:56px">${brow(card(ctx.t('k' + k), 'lg'), { at: k, size: 56 })}</div>
          <div class="b06-ex" style="position:absolute;left:760px;top:${y0 + (k - 1) * rowH - 2}px;width:720px">
            ${[2 * k - 1, 2 * k].map((e) => `<div class="e ex${k} is-off"><span class="n">${num(e)}</span>${ctx.t('e' + e)}</div>`).join('')}
          </div>`).join('')}
        ${discLine(['tax', 'notAdvice'], { style: 'position:absolute;left:160px;right:160px;top:800px;text-align:center;margin:0' })}`;
    },
    step(ctx, n) { breveal(ctx, n); [1, 2, 3, 4].forEach((k) => ctx.show('.ex' + k, n > k - 1)); }
  });

  /* =====================================================================
     EVA: worked decision diagrams (eva3, eva5)
     ===================================================================== */
  /** two source boxes, converging arrows, the blended cost and a verdict */
  function evaDecision(ctx, o) {
    const avg = (o.debt * o.dr + o.eq * o.er) / (o.debt + o.eq);
    const ok = o.opp > avg;
    const wide = o.wide || {};
    const b1 = { x: 160, y: 196, w: 380 }, b2 = { x: 1600 - 160 - (wide.b2 || 380), y: 196, w: wide.b2 || 380 };
    const b3 = { x: wide.b3x || 512, y: 500, w: wide.b3 || 600 };
    /* thick arrow from a box toward the center box, geometry in code */
    const arrow = (x0, y0, x1, y1, w) => {
      const ang = Math.atan2(y1 - y0, x1 - x0), len = Math.hypot(x1 - x0, y1 - y0);
      const hw = w / 2, hh = w * 1.12, hl = w * 1.35;
      const pts = [[0, -hw], [len - hl, -hw], [len - hl, -hh], [len, 0], [len - hl, hh], [len - hl, hw], [0, hw]];
      const tr = (p) => [x0 + p[0] * Math.cos(ang) - p[1] * Math.sin(ang), y0 + p[0] * Math.sin(ang) + p[1] * Math.cos(ang)].map((v) => v.toFixed(1)).join(',');
      const head = [[len - hl, -hh], [len, 0], [len - hl, hh]];
      return `<polygon points="${pts.map(tr).join(' ')}" fill="${P.paper}" stroke="${P.navy4}" stroke-width="5" stroke-linejoin="round"/>
        <polygon points="${head.map(tr).join(' ')}" fill="${P.navy4}" stroke="${P.navy4}" stroke-width="5" stroke-linejoin="round"/>`;
    };
    const box = (k, amt, rate) => `<span class="k">${ctx.t(k)}</span><span class="big">${num(F.money(amt))}<span class="at">${ctx.t('at')} ${num(F.pct(rate, 0))}</span></span>`;
    ctx.el.innerHTML = `${head(ctx, 'head')}
      <svg class="b06-full" viewBox="0 0 1600 900">
        ${arrow(380, 338, b3.x + b3.w * 0.28, b3.y - 12, 46)}
        ${arrow(1220, 338, b3.x + b3.w * 0.72, b3.y - 12, 38)}
      </svg>
      <div class="b06-card b06-box" style="left:${b1.x}px;top:${b1.y}px;width:${b1.w}px">${box('debt', o.debt, o.dr)}</div>
      <div class="b06-card b06-box" style="left:${b2.x}px;top:${b2.y}px;width:${b2.w}px">${box('equity', o.eq, o.er)}</div>
      <div class="b06-card b06-box inv" style="left:${b3.x}px;top:${b3.y}px;width:${b3.w}px"><span class="k">${ctx.t('avg')}</span><span class="big">${num(F.pct(avg, 0))}</span></div>
      <div class="b06-card b06-verdict" style="left:${wide.b4x || 200}px;top:700px;width:${wide.b4 || 1200}px">
        <span>${ctx.t('v1')} ${num(F.pct(o.opp, 0))} ${ctx.t('v2')}</span><span class="w b06-fade verdict">${ctx.t(ok ? 'ok' : 'no')}</span></div>`;
  }
  const evaCopy = {
    head: 'An Example Investment Decision',
    debt: 'Debt', equity: 'Equity', at: '@', avg: 'Average Cost of Capital',
    v1: 'In this setting, a', v2: 'investment opportunity appears...', ok: 'Acceptable', no: 'Unacceptable'
  };
  EFA.screen('eva3', {
    title: 'Example decision when equity is treated as free',
    steps: 2,
    copy: Object.assign({}, evaCopy, {
      _notes: 'When a company treats its own money as free, the blended cost of capital looks low, and almost anything clears the bar.\n\n- Ask: Would you take a 6% opportunity if your money really cost you 4%?\nPAUSE\n\n- Click to reveal the verdict.'
    }),
    render(ctx) { evaDecision(ctx, { debt: 1000, dr: 0.08, eq: 1000, er: 0, opp: 0.06 }); },
    step(ctx, n) { ctx.show('.verdict', n >= 1); }
  });
  EFA.screen('eva5', {
    title: 'Same decision once equity has a cost',
    steps: 2,
    copy: Object.assign({}, evaCopy, {
      _notes: 'Same opportunity, same debt. The only change: the company now gives its own capital a real cost. The decision flips.\n\n- Ask: What changed about the opportunity? Nothing. What changed was how the company valued its own money.\nPAUSE'
    }),
    render(ctx) { evaDecision(ctx, { debt: 1000, dr: 0.08, eq: 1000, er: 0.12, opp: 0.06, wide: { b2: 430, b3: 660, b3x: 470, b4x: 176, b4: 1248 } }); },
    step(ctx, n) { ctx.show('.verdict', n >= 1); }
  });

  /* =====================================================================
     ESTPLN: Estate Planning (screens without shared components)
     ===================================================================== */
  EFA.screen('estplan1', {
    title: 'Estate planning opener',
    copy: {
      head: 'Estate Planning',
      lead: 'Over your lifetime, you will work hard to grow your wealth and your estate.',
      disc: 'The information that follows is general education, not tax or legal advice, and it cannot be relied on to avoid federal tax penalties. Please consult a licensed tax or legal professional about your own situation.',
      _notes: 'Most families spend decades building an estate and very little time deciding where it goes.\n\n- Ask: Have you and your family ever talked through what happens to everything you have built?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div style="position:absolute;left:250px;top:300px;width:400px;display:grid;gap:22px;justify-items:center;text-align:center">
          ${ctx.t('lead', { tag: 'p', attrs: 'style="margin:0;font:600 40px/1.3 Cormorant Garamond,Georgia,serif;color:#0d1e3a"' })}
          <hr class="st-rule">
        </div>
        <div style="position:absolute;left:720px;top:180px;width:620px;height:532px">${ill.piggy()}</div>
        ${ctx.t('disc', { tag: 'p', cls: 'st-small', attrs: 'style="position:absolute;left:200px;right:200px;top:752px;margin:0;text-align:center;font-size:19px"' })}`;
    }
  });

  EFA.screen('estplan6', {
    title: 'Documents are only the first step',
    copy: {
      head: 'Having the right estate documents in place\nis only the first step.',
      lead: 'Your accounts must be titled properly, and your beneficiary designations kept current.',
      _notes: 'A will or trust only controls what is titled to it. Beneficiary forms on accounts and policies override both.\n\n- Ask: When did you last look at the beneficiaries on your retirement accounts and life insurance?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, 'head', { sm: true })}
        <div style="position:absolute;left:230px;top:380px;width:520px;display:grid;gap:24px;justify-items:center;text-align:center">
          ${ctx.t('lead', { tag: 'p', attrs: 'style="margin:0;font:600 42px/1.28 Cormorant Garamond,Georgia,serif;color:#0d1e3a"' })}
          <hr class="st-rule">
        </div>
        <div class="b06-arch" style="left:900px;top:236px;width:420px;height:606px">${ill.couple()}</div>`;
    }
  });

  /* ---------- estplan2: federal history table and the state map ---------- */
  /* tile-grid map of the 50 states and DC (one square per state, arranged by geography) */
  const TILES = [
    ['AK', 0, 0], ['ME', 10, 0], ['VT', 9, 1], ['NH', 10, 1],
    ['WA', 0, 2], ['ID', 1, 2], ['MT', 2, 2], ['ND', 3, 2], ['MN', 4, 2], ['IL', 5, 2], ['WI', 6, 2], ['MI', 7, 2], ['NY', 8, 2], ['RI', 9, 2], ['MA', 10, 2],
    ['OR', 0, 3], ['NV', 1, 3], ['WY', 2, 3], ['SD', 3, 3], ['IA', 4, 3], ['IN', 5, 3], ['OH', 6, 3], ['PA', 7, 3], ['NJ', 8, 3], ['CT', 9, 3],
    ['CA', 0, 4], ['UT', 1, 4], ['CO', 2, 4], ['NE', 3, 4], ['MO', 4, 4], ['KY', 5, 4], ['WV', 6, 4], ['VA', 7, 4], ['MD', 8, 4], ['DE', 9, 4],
    ['AZ', 1, 5], ['NM', 2, 5], ['KS', 3, 5], ['AR', 4, 5], ['TN', 5, 5], ['NC', 6, 5], ['SC', 7, 5], ['DC', 8, 5],
    ['OK', 3, 6], ['LA', 4, 6], ['MS', 5, 6], ['AL', 6, 6], ['GA', 7, 6],
    ['HI', 0, 7], ['TX', 3, 7], ['FL', 8, 7]
  ];
  /** state death-tax categories from EFA.data: returns {year, cat: {XX: 0..3}} or null. 0 none, 1 estate, 2 inheritance, 3 both */
  function stateDeathTax() {
    const src = Dany(['stateDeathTax', 'stateEstateTax', 'estate.states', 'stateEstateInheritance', 'fed.estate.states'], null);
    if (!src) return null;
    const cat = {}; TILES.forEach(([s]) => { cat[s] = 0; });
    const mark = (list, v) => (list || []).forEach((s) => { const k = String(s).toUpperCase(); cat[k] = cat[k] === 1 && v === 2 || cat[k] === 2 && v === 1 ? 3 : v; });
    if (src.states && typeof src.states === 'object' && !Array.isArray(src.states)) {
      Object.entries(src.states).forEach(([s, v]) => {
        const t = String(v && v.category != null ? v.category : v).toLowerCase();
        cat[s.toUpperCase()] = /both/.test(t) ? 3 : /inherit/.test(t) ? 2 : /estate/.test(t) ? 1 : 0;
      });
    } else {
      mark(src.estate || src.estateTax, 1); mark(src.inheritance || src.inheritanceTax, 2); mark(src.both, 3);
    }
    return { year: src.year || src.asOf || null, cat };
  }
  /** federal exclusion history rows from EFA.data: [{year, amount, rate, repealed}] or null */
  function estateHistory() {
    const et = D('history.estateTax', null);
    const h = et && Array.isArray(et.sampleYears) ? et.sampleYears : Dany(['estateHistory', 'fed.estateHistory'], null);
    if (!h || !Array.isArray(h) || !h.length) return null;
    return h.map((r) => Array.isArray(r) ? { year: r[0], amount: r[1], rate: r[2] } : { year: r.year, amount: r.exclusion != null ? r.exclusion : r.amount, rate: r.topRate != null ? r.topRate : r.rate, repealed: !!(r.repealYear || r.repealed) });
  }
  const millions = (ctx, v) => `${num('$' + F.num(v / 1e6, Math.abs(v / 1e6 - Math.round(v / 1e6)) < 1e-9 ? 0 : (Math.round(v / 1e4) % 10 ? 2 : 1)))} ${ctx.t('million')}`;
  const stCopy = {}; TILES.forEach(([s]) => { stCopy['st.' + s] = s; });

  EFA.screen('estplan2', {
    title: 'Estate taxes, federal history and state map',
    copy: Object.assign({
      head: 'One of your biggest wealth transfers may happen at your death.\nHere is where it comes from...',
      sub: 'Federal and State Estate Taxes',
      thYear: 'Year', thEx: 'Exclusion Amount', thRate: 'Top Tax Rate',
      repealed: 'Repealed', million: 'million',
      fn1: 'Estates of people who died in', fn2: ' could elect no estate tax, or a', fn3: 'exclusion with a', fn4: 'top rate.',
      lgEstate: 'Estate Tax', lgInh: 'Inheritance Tax', lgBoth: 'Both', lgFed: 'Federal Only',
      asOf: 'State rules as of', src: 'Source', srcTitle: 'Sources',
      src1: 'Federal exclusion amounts and top rates: Internal Revenue Service, estate and gift tax guidance.',
      src2: 'State estate and inheritance taxes: Tax Foundation, state estate and inheritance tax data.',
      pendTbl: 'Federal figures are being verified.', pendMap: 'State estate and inheritance tax data is being verified.',
      _notes: 'Two layers can apply at death: the federal estate tax, and in some states a state estate tax, an inheritance tax, or both. The rules change often.\n\n- Ask: Do you know which of these rules would apply to your family today?\nPAUSE'
    }, stCopy),
    render(ctx) {
      const rows = estateHistory(), map = stateDeathTax();
      const tbl = rows ? `<div class="b06-tblw"><table class="b06-tbl"><thead><tr><th class="c">${ctx.t('thYear')}</th><th class="r">${ctx.t('thEx')}</th><th class="c">${ctx.t('thRate')}</th></tr></thead><tbody>
          ${rows.map((r) => `<tr><td class="c">${num(r.year)}</td><td class="r">${r.repealed || r.amount == null ? ctx.t('repealed') + (r.repealed ? '<sup class="b06-fn">*</sup>' : '') : millions(ctx, r.amount)}</td><td class="c">${num(F.pct(r.repealed ? 0 : (r.rate || 0), 0))}</td></tr>`).join('')}
        </tbody></table></div>${(() => { const rp = rows.find((r) => r.repealed && r.amount); return rp ? `<p class="st-small" style="margin:14px 2px 0;font-size:15px;line-height:1.4"><sup class="b06-fn">*</sup> ${ctx.t('fn1')} ${num(rp.year)}${ctx.t('fn2')} ${millions(ctx, rp.amount)} ${ctx.t('fn3')} ${num(F.pct(rp.rate, 0))} ${ctx.t('fn4')}</p>` : ''; })()}` : `<div class="b06-card" style="position:relative;height:300px;display:grid">${pending(ctx, 'pendTbl')}</div>`;
      const T = 56, G = 7, mx = 742, my = 262;
      const tiles = TILES.map(([s, c, r]) => `<div class="b06-tile k${map ? map.cat[s] : 0}" style="left:${mx + c * (T + G)}px;top:${my + r * (T + G)}px;width:${T}px;height:${T}px">${ctx.t('st.' + s)}</div>`).join('');
      const sw = (cls, key) => `<span>${'<span class="sw b06-tile ' + cls + '" style="position:static"></span>'}${ctx.t(key)}</span>`;
      ctx.el.innerHTML = `${head(ctx, 'head', { sm: true, rule: false, sub: 'sub', top: 40 })}
        <div style="position:absolute;left:150px;top:300px;width:480px">${tbl}</div>
        ${tiles}
        ${map ? '' : `<div class="b06-card" style="left:${mx + 2 * (T + G)}px;top:${my + 3 * (T + G) + 8}px;width:${5 * (T + G)}px;padding:20px 24px">${pending(ctx, 'pendMap')}</div>`}
        <div class="b06-legend" style="left:${mx}px;width:${11 * (T + G) - G}px;top:${my + 8 * (T + G) + 14}px">${sw('k1', 'lgEstate')}${sw('k2', 'lgInh')}${sw('k3', 'lgBoth')}${sw('k0', 'lgFed')}</div>
        ${map && map.year ? `<div class="st-small" style="position:absolute;left:${mx}px;top:${my - 40}px;font-size:16px;letter-spacing:.06em">${ctx.t('asOf')} ${num(map.year)}</div>` : ''}
        <span class="b06-link src" style="left:160px;bottom:72px">${ctx.t('src')}</span>`;
      ctx.on(ctx.$('.src'), 'click', () => {
        ctx.overlay({ title: ctx.t('srcTitle'), cls: 'b06-dlg', html: `<div style="display:grid;gap:16px">${ctx.t('src1', { tag: 'p', cls: 'st-body', attrs: 'style="font-size:21px;margin:0"' })}${ctx.t('src2', { tag: 'p', cls: 'st-body', attrs: 'style="font-size:21px;margin:0"' })}</div>` });
      });
    }
  });

  /* ---------- estates1: famous estates ---------- */
  function famousEstates() {
    const rows = Dany(['famousEstates', 'estates.famous', 'estate.famous', 'history.famousEstates'], null);
    if (!rows || !Array.isArray(rows) || !rows.length) return null;
    return rows.map((r) => Array.isArray(r) ? { name: r[0], gross: r[1], settle: r[2] } : { name: r.name, gross: r.gross, settle: r.settlement != null ? r.settlement : r.settle });
  }
  EFA.screen('estates1', {
    title: 'Famous estates table',
    copy: {
      head: 'Famous Estates',
      thGross: 'Gross Estate', thSettle: 'Settlement\nCosts', thNet: 'Net Estate', thPct: 'Percent\nShrinkage',
      foot: 'Source: public probate records.',
      pend: 'Estate figures are being verified against public probate records.',
      _notes: 'Large or modest, every estate in this table lost part of itself on the way to the family.\n\n- Ask: If your estate shrank by the same share, who would feel it most?\nPAUSE'
    },
    render(ctx) {
      const rows = famousEstates();
      const body = rows ? rows.map((r) => {
        const net = r.gross - r.settle, pct = Math.round(r.settle / r.gross * 100);
        return `<tr><td class="l">${EFA.util.esc(r.name)}</td><td class="r">${num(F.money(r.gross))}</td><td class="r">${num(F.money(r.settle))}</td><td class="r">${num(F.money(net))}</td><td class="c" style="color:#8a6e22;font-weight:700">${num(pct + '%')}</td></tr>`;
      }).join('') : `<tr><td colspan="5" style="padding:0;background:transparent">${'<div style="height:330px;display:grid">' + pending(ctx, 'pend') + '</div>'}</td></tr>`;
      ctx.el.innerHTML = `${head(ctx, 'head')}
        <div class="b06-card" style="left:131px;top:210px;width:1338px;padding:24px 28px 18px">
          <div class="b06-tblw"><table class="b06-tbl"><colgroup><col style="width:26%"><col style="width:20%"><col style="width:19%"><col style="width:19%"><col style="width:16%"></colgroup>
            <thead><tr><th class="l"></th><th class="c">${ctx.t('thGross')}</th><th class="c">${ctx.t('thSettle')}</th><th class="c">${ctx.t('thNet')}</th><th class="c" style="color:#d5bd68">${ctx.t('thPct')}</th></tr></thead>
            <tbody>${body}</tbody></table></div>
          ${ctx.t('foot', { tag: 'p', cls: 'st-small', attrs: 'style="margin:16px 4px 0;font-size:16px"' })}
        </div>`;
    }
  });

  /* =====================================================================
     EDUC: Education fund estimator
     ===================================================================== */
  /** spreadsheet-style PMT used for the starting guess: (-pv(1+r)^n - fv) / ((1 + r type) F) */
  function xlPmt(rate, n, pv, fv, type) {
    const f = rate === 0 ? n : (Math.pow(1 + rate, n) - 1) / rate;
    const den = (1 + rate * type) * f;
    if (!den) return 0;
    return (-pv * Math.pow(1 + rate, n) - fv) / den;
  }
  /** year ledger: deposit and costs at the start of each year, growth on the balance (also when negative) */
  function eduLedger(stu, B0, r, dep) {
    const N = stu.length ? Math.max(...stu.map((x) => x.start + x.years - x.age)) : 0;
    const rows = []; let eoy = B0, neg = false;
    for (let t = 0; t < N; t++) {
      const costs = stu.map((x) => { const a = x.age + t; return a >= x.start && a < x.start + x.years ? x.cost * Math.pow(1 + x.infl, t) : 0; });
      const T = costs.reduce((a, b) => a + b, 0), d = dep(t);
      const boy = eoy + d - T, g = boy * r;
      eoy = boy + g;
      if (eoy < -0.0049) neg = true;
      rows.push({ t, ages: stu.map((x) => x.age + t), costs, T, d, boy, g, eoy });
    }
    return { N, rows, eoy, neg };
  }
  /** the original's secant search for the deposit (annual: every row; lump: row 0 only) that ends the plan at zero */
  function eduSolve(stu, B0, r, mode) {
    const run = (x) => eduLedger(stu, B0, r, mode === 'lump' ? (t) => (t === 0 ? x : 0) : () => x);
    const base = run(0), E0 = base.eoy, N = base.N;
    let prev = 0, ePrev = E0;
    let cur = mode === 'lump' ? -E0 / Math.pow(1 + r, N) : xlPmt(r, N, B0, E0, 1);
    let res = run(cur);
    for (let i = 0; i < 99; i++) {
      const m = (cur - prev) / (res.eoy - ePrev) * res.eoy;
      if (Math.abs(m) < 0.0049) return { ok: true, x: cur, led: res, N };
      prev = cur; ePrev = res.eoy; cur -= m; res = run(cur);
    }
    return { ok: false };
  }
  EFA.engines = EFA.engines || {};
  EFA.engines.eduFund = { ledger: eduLedger, solve: eduSolve };

  EFA.screen('educ1', {
    title: 'Education fund estimator',
    copy: {
      lBal: 'Current education fund balance', lRor: 'Assumed education fund net rate of return', lStu: 'Student and school information',
      thAge: 'Age', thName: 'Name', thStart: 'Start Age', thYears: 'Years', thCost: 'Annual Cost', thInfl: 'Inflate',
      add: 'Add Student', calc: 'Calculate', lump: 'Calculate Lump Sum', annual: 'Calculate Annual',
      empty: 'No students yet. Add each student to begin.',
      dlgTitle: 'Student', fAge: 'Current Age', fName: 'Student Name', fStart: 'College Start Age', fYears: 'Years to Graduate', fCost: 'Annual Cost', fInfl: 'Annual Inflation',
      cancel: 'Cancel', save: 'Save', delTitle: 'Delete Student', delQ: 'Delete this student\'s details?', del: 'Delete', keep: 'Keep',
      a1: 'To fund education for your', stu1: 'student', stuN: 'students', a2: ', deposit', a3: 'into the fund at the beginning of each year for the next', yr1: 'year.', yrN: 'years.',
      b1: 'Your total future deposits of', b2: 'plus your starting balance of', b3: 'add up to', b4: '.',
      neg: 'Even with these deposits, the fund dips below zero in some years, which means borrowing in those years. The deposit shown repays that borrowing, assuming the loan rate equals the fund\'s return. Larger deposits, scholarships or lower costs can avoid it.',
      l1: 'The single lump sum needed for your', l2: 'is', l3: '. It must be deposited now, on top of your existing balance of', l4: '.',
      errNone: 'Add at least one student first.',
      errAge: 'A student\'s current age is greater than the college start age. Please check the assumptions.',
      errAnnual: 'No annual solution was found within 100 tries. Please check that the assumptions are realistic.',
      errLump: 'No lump-sum solution was found. Please check the assumptions.',
      wsHead: 'Education Cost Worksheet', wsCal: 'Calendar Year', wsAgeS: '\'s Age', wsCostS: '\'s Education Cost', wsStudent: 'Student',
      wsCosts: 'Annual Education Costs', wsContrib: 'Annual Fund Contribution', wsBOY: 'Beginning-of-Year Balance', wsGrowth: 'Annual Growth', wsEOY: 'End-of-Year Balance', wsYear: 'Year',
      _notes: 'College costs arrive on a schedule we can see years ahead. That makes them one of the easiest goals to plan for, and one of the most expensive to leave to chance.\n\n- Add each student, then Calculate. The button below switches between a yearly deposit and one lump sum today.\n- Ask: If we could put a number on it today, would you rather fund it a little each year or all at once?\nPAUSE'
    },
    render(ctx) {
      const st = ctx._edu = ctx._edu || { mode: 'annual', shown: false };
      const list = () => (cget('case_file_edu_fund_list', []) || []).map((x) => Object.assign({ age: 10, name: '', start: 18, years: 4, cost: 0, infl: 0 }, x));
      const rowHTML = (x, i) => `<tr><td class="r">${num(F.int(x.age))}</td><td class="l">${EFA.util.esc(x.name || '')}</td><td class="r">${num(F.int(x.start))}</td><td class="r">${num(F.int(x.years))}</td><td class="r">${num(F.money(x.cost))}</td><td class="r">${num(F.pct(x.infl, 2))}</td>
          <td class="c"><button type="button" class="b06-ic" data-ed="${i}" aria-label="Edit">${icEdit}</button><button type="button" class="b06-ic del" data-del="${i}" aria-label="Delete">${icDel}</button></td></tr>`;
      ctx.el.innerHTML = `<div class="b06-edu">
          <div class="b06-card panel" style="position:relative">
            <div class="b06-form">
              ${cfield(ctx, { key: 'edu_fund_initial_balance', id: 'bal', label: 'lBal', type: 'money', value: 5000 })}
              ${cfield(ctx, { key: 'edu_fund_net_ror', id: 'ror', label: 'lRor', type: 'pct', value: 0.06, min: -0.5, max: 0.12, dp: 2 })}
            </div>
            <div class="sect">${ctx.t('lStu')}</div>
            <div class="b06-stu">
              <table><colgroup><col style="width:10%"><col style="width:30%"><col style="width:12%"><col style="width:12%"><col style="width:15%"><col style="width:12%"><col style="width:9%"></colgroup>
                <thead><tr><th class="r">${ctx.t('thAge')}</th><th class="l">${ctx.t('thName')}</th><th class="r">${ctx.t('thStart')}</th><th class="r">${ctx.t('thYears')}</th><th class="r">${ctx.t('thCost')}</th><th class="r">${ctx.t('thInfl')}</th><th></th></tr></thead></table>
              <div class="sc" style="height:196px"><table><colgroup><col style="width:10%"><col style="width:30%"><col style="width:12%"><col style="width:12%"><col style="width:15%"><col style="width:12%"><col style="width:9%"></colgroup><tbody class="rows"></tbody></table></div>
              <div class="ft"><button type="button" class="st-pill add" style="min-height:42px;font-size:16px">${ctx.t('add')}</button></div>
            </div>
          </div>
          <button type="button" class="st-pill b06-calc calc" style="position:relative;display:flex;margin:26px auto 0;transform:none;left:auto">${ctx.t('calc')}</button>
          <div class="b06-card b06-res res is-off" style="top:542px"></div>
          <div class="b06-actbar acts is-off" style="top:762px"></div>
        </div>`;
      const body = ctx.$('.rows');
      const drawList = () => {
        const L = list();
        body.innerHTML = L.length ? L.map(rowHTML).join('') : `<tr class="empty"><td colspan="7">${ctx.t('empty')}</td></tr>`;
        EFA.numify(body);
        if (EFA.edit && EFA.edit.on) EFA.edit.arm(body);
      };
      const hide = () => { st.shown = false; ctx.show('.res', false); ctx.show('.acts', false); ctx.show('.calc', true); };
      const validate = () => {
        const L = list();
        if (!L.length) { ctx.toast(ctx.text('errNone')); return null; }
        if (L.some((x) => x.age > x.start)) { ctx.toast(ctx.text('errAge')); return null; }
        return L;
      };
      const show = (mode) => {
        const L = list(), v = ctx.values(), B0 = v.bal || 0, r = v.ror || 0;
        const sol = eduSolve(L, B0, r, mode);
        if (!sol.ok) { ctx.toast(ctx.text(mode === 'lump' ? 'errLump' : 'errAnnual')); return; }
        st.mode = mode; st.shown = true;
        const cnt = L.length, stu = ctx.t(cnt === 1 ? 'stu1' : 'stuN');
        let html;
        if (mode === 'annual') {
          const C = sol.x, N = sol.N;
          html = `<p>${ctx.t('a1')} ${num(cnt)} ${stu}${ctx.t('a2')} <b>${num(F.money(C))}</b> ${ctx.t('a3')} ${num(N)} ${ctx.t(N === 1 ? 'yr1' : 'yrN')}</p>
            <p>${ctx.t('b1')} <b>${num(F.money(N * C))}</b> ${ctx.t('b2')} <b>${num(F.money(B0))}</b> ${ctx.t('b3')} <b>${num(F.money(B0 + N * C))}</b>${ctx.t('b4')}</p>
            ${sol.led.neg ? ctx.t('neg', { tag: 'p', cls: 'neg' }) : ''}`;
        } else {
          html = `<p>${ctx.t('l1')} ${num(cnt)} ${stu} ${ctx.t('l2')} <b>${num(F.money(sol.x))}</b>${ctx.t('l3')} <b>${num(F.money(B0))}</b>${ctx.t('l4')}</p>`;
        }
        html += discLine(['hypothetical'], { style: 'margin:4px 0 0' });
        ctx.$('.res').innerHTML = html;
        const W = lib('worksheet');
        ctx.$('.acts').innerHTML = `${W && W.button ? W.button(ctx, { data: () => sheet(), look: 'link' }) : ''}
          <button type="button" class="st-pill mode">${ctx.t(mode === 'annual' ? 'lump' : 'annual')}</button>`;
        ctx.on(ctx.$('.mode'), 'click', () => show(st.mode === 'annual' ? 'lump' : 'annual'));
        ctx.show('.calc', false); ctx.show('.res', true); ctx.show('.acts', true);
        EFA.numify(ctx.el);
        if (EFA.edit && EFA.edit.on) EFA.edit.arm(ctx.el);
      };
      /* worksheet (Documentation), recomputed in the last mode run */
      const sheet = () => {
        const L = list(), v = ctx.values(), B0 = v.bal || 0, r = v.ror || 0;
        const sol = eduSolve(L, B0, r, st.mode);
        const led = sol.ok ? sol.led : eduLedger(L, B0, r, () => 0);
        let unnamed = 0; const seen = {};
        const names = L.map((x) => {
          let nm = (x.name || '').trim();
          if (!nm) { unnamed++; return null; }
          const k = nm.toLowerCase(); seen[k] = (seen[k] || 0) + 1;
          return seen[k] > 1 ? `${nm} (${seen[k]})` : nm;
        });
        let u = 0;
        const lab = (i) => names[i] != null ? EFA.util.esc(names[i]) : `${ctx.t('wsStudent')} ${num(++u)}`;
        const labs = L.map((x, i) => lab(i));
        const cols = [{ field: 'cal', header: ctx.t('wsCal'), type: 'year', width: 110 }];
        L.forEach((x, i) => { cols.push({ field: 'a' + i, header: labs[i] + ctx.t('wsAgeS'), type: 'age' }); cols.push({ field: 'c' + i, header: labs[i] + ctx.t('wsCostS'), type: 'money', dp: 2 }); });
        cols.push({ field: 'T', header: ctx.t('wsCosts'), type: 'money', dp: 2 }, { field: 'D', header: ctx.t('wsContrib'), type: 'money', dp: 2 },
          { field: 'boy', header: ctx.t('wsBOY'), type: 'money', dp: 2 }, { field: 'g', header: ctx.t('wsGrowth'), type: 'money', dp: 2 },
          { field: 'eoy', header: ctx.t('wsEOY'), type: 'money', dp: 2 }, { field: 'yr', header: ctx.t('wsYear'), type: 'int', width: 80 });
        const y0 = new Date().getFullYear();
        const rows = led.rows.map((rw) => {
          const o = { cal: y0 + rw.t, T: rw.T, D: rw.d, boy: rw.boy, g: rw.g, eoy: rw.eoy, yr: rw.t + 1 };
          rw.ages.forEach((a, i) => { o['a' + i] = a; o['c' + i] = rw.costs[i]; });
          return o;
        });
        return { heading: ctx.t('wsHead'), size: 'full', columns: cols, rows, filter: 'cal', highlight: 'eoy', disclosures: ['hypothetical', 'license'], file: 'education-cost-worksheet' };
      };
      /* the student dialog: edits a copy, commits on Save */
      const field = (k, v, cls) => `<label class="row"><span>${ctx.t(k)}</span><input class="st-input ${cls || ''}" data-k="${k}" value="${EFA.util.esc(v)}" autocomplete="off" ${cls === 'txt' ? '' : 'inputmode="decimal"'}></label>`;
      const dialog = (idx) => {
        const L = list(), x = idx == null ? { age: 10, name: '', start: 18, years: 4, cost: 0, infl: 0 } : Object.assign({}, L[idx]);
        const ov = ctx.overlay({
          title: ctx.t('dlgTitle'), cls: 'b06-dlg',
          html: `<div class="b06-dlg-f">${field('fAge', F.int(x.age))}${field('fName', x.name, 'txt')}${field('fStart', F.int(x.start))}${field('fYears', F.int(x.years))}${field('fCost', F.money(x.cost))}${field('fInfl', F.pct(x.infl, 2))}</div>
            <div class="b06-dlg-btns"><button type="button" class="st-pill ghost cx">${ctx.t('cancel')}</button><button type="button" class="st-pill ok">${ctx.t('save')}</button></div>`
        });
        const inp = (k) => ov.querySelector(`[data-k="${k}"]`);
        ov.querySelectorAll('input').forEach((n) => n.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') n.blur(); }));
        ov.querySelectorAll('input:not(.txt)').forEach((n) => n.addEventListener('focus', () => n.select()));
        ctx.on(ov.querySelector('.cx'), 'click', () => ov.close());
        ctx.on(ov.querySelector('.ok'), 'click', () => {
          const pi = (k, d) => { const v = F.parse(inp(k).value); return isFinite(v) ? v : d; };
          const rec = {
            age: Math.max(0, Math.round(pi('fAge', x.age))), name: inp('fName').value.trim(),
            start: Math.max(0, Math.round(pi('fStart', x.start))), years: Math.max(0, Math.round(pi('fYears', x.years))),
            cost: Math.round(pi('fCost', x.cost) * 100) / 100, infl: (() => { const v = F.parse(inp('fInfl').value, true); return isFinite(v) ? Math.round(v * 1e6) / 1e6 : x.infl; })()
          };
          const M = list(); if (idx == null) M.push(rec); else M[idx] = rec;
          cset('case_file_edu_fund_list', M); ov.close(); drawList(); hide();
        });
        ctx.timeout(() => { const a = inp('fName'); if (a) a.focus(); }, 60);
      };
      const confirmDel = (idx) => {
        const ov = ctx.overlay({
          title: ctx.t('delTitle'), cls: 'b06-dlg',
          html: `${ctx.t('delQ', { tag: 'p', cls: 'b06-dlg-q' })}<div class="b06-dlg-btns"><button type="button" class="st-pill ghost cx">${ctx.t('keep')}</button><button type="button" class="st-pill ok">${ctx.t('del')}</button></div>`
        });
        ctx.on(ov.querySelector('.cx'), 'click', () => ov.close());
        ctx.on(ov.querySelector('.ok'), 'click', () => { const M = list(); M.splice(idx, 1); cset('case_file_edu_fund_list', M); ov.close(); drawList(); hide(); });
      };
      drawList();
      ctx.on(ctx.$('.add'), 'click', () => dialog(null));
      body.addEventListener('click', (e) => {
        if (EFA.edit && EFA.edit.on) return;
        const ed = e.target.closest('[data-ed]'), dl = e.target.closest('[data-del]');
        if (ed) dialog(+ed.dataset.ed); else if (dl) confirmDel(+dl.dataset.del);
      });
      ctx.on(ctx.$('.calc'), 'click', () => { if (validate()) show('annual'); });
      let last = null;
      ctx.onFields((v) => { const k = JSON.stringify([v.bal, v.ror]); if (last != null && k !== last) hide(); last = k; });
    }
  });

  /* =====================================================================
     F101: Finance 101 on the Personal Economic Model (f1, f2, f4; f3 and f3noep below)
     ===================================================================== */
  const F101 = { cost: 30000, fin: 0.05, n: 60, extra: 0, opp: 0.05 };
  /** standard end-of-month amortization payment */
  const amortPmt = (P0, rate, n) => { const l = rate / 12; if (n <= 0) return 0; return l === 0 ? P0 / n : P0 * Math.pow(1 + l, n) * l / (Math.pow(1 + l, n) - 1); };
  /** PEM base for the finance lessons: savings and borrowed-funds tanks, no house, collateral on savings, no debt service */
  const f101Base = (o) => Object.assign({
    links: false, scenarioPicker: false, labels: false, lifestyleStrip: false, sliders: false, showHouse: false, borrowSource: false,
    collateral: 'safe', debtService: false, safe: 50, risk: 0, borrow: 0, remaining: 100
  }, o || {});
  const pemReady = () => !!(lib('pem') && lib('pem').mount);
  /** quiet state while the shared model loads */
  const pemPending = (ctx, box) => `<div class="b06-pending" style="position:absolute;${box}">${'<span class="dot"></span>'}</div>`;

  EFA.screen('f1', {
    title: 'You finance everything you buy',
    steps: 5,
    copy: {
      head: 'Every purchase you make is financed, one way or another.',
      r1: 'You can borrow from a lender and pay interest.',
      or: 'or...',
      r3: 'You can pay cash and save the interest, but you give up the interest you would have earned had you not emptied your tank.',
      r4: 'Borrowing means borrowing from your own future lifestyle.',
      _notes: 'Whether you borrow or pay cash, you are financing the purchase. The only question is whose interest you give up.\n\n- Ask: When you paid cash for something big, did anyone show you what that money would have earned?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b06-f1p b06-fade" style="position:absolute;left:880px;top:118px;width:620px">
          ${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:56px;line-height:1.06"' })}
          <div class="b06-blist" style="position:relative;margin-top:30px;gap:22px;--lib-bul-w:42px">
            ${brow(card(ctx.t('r1'), 'sm'), { at: 2, size: 42 })}
            <div class="b06-fade orl is-off" style="padding-left:62px;font:700 30px/1 DM Sans,sans-serif;color:#8a6e22;letter-spacing:.04em">${ctx.t('or')}</div>
            ${brow(card(ctx.t('r3'), 'sm'), { at: 4, size: 42 })}
            ${brow(card(ctx.t('r4'), 'sm'), { at: 4, size: 42 })}
          </div>
        </div>`;
      if (!pemReady()) { ctx.el.insertAdjacentHTML('beforeend', pemPending(ctx, 'left:40px;top:40px;width:800px;height:800px')); return; }
      ctx.pem = lib('pem').mount(ctx, ctx.el, f101Base({
        frame: { zoom: { fit: ['risk', 'safe', 'borrowed'], pad: 1.4 }, width: 0.54, expanded: true, panel: '.b06-f1p', expandShows: ['labels', 'lifestyle', 'scenario'], toggle: true }
      }));
    },
    step(ctx, n, dir) {
      breveal(ctx, n);
      ctx.show('.orl', n > 2);
      const p = ctx.pem; if (!p) return;
      if (n === 0) p.expand(true); else if (dir !== 0 || n >= 1) { if (p.expanded()) p.expand(false); }
      if (n === 4) {
        p.set({ borrow: 0 }, { ms: dir === 0 ? 0 : 800 });
        if (dir > 0) p.play('F101PayCash'); else { p.stop('F101PayCash'); p.set({ safe: 0 }, { ms: 0 }); }
        p.highlight('safe', { wink: true, id: 'f1ring' });
      } else {
        p.stop('F101PayCash');
        p.unhighlight('f1ring');
        p.set({ safe: 50, borrow: n === 2 ? 50 : 0 }, { ms: dir === 0 ? 0 : 800 });
      }
    }
  });

  /** the Assumptions card (f2 read-only, f3/f3noep live): rows of label + value box */
  const ASSUME = [['cost', 'aCost'], ['fin', 'aFin'], ['n', 'aTerm'], ['pmt', 'aPmt'], ['extra', 'aExtra'], ['opp', 'aOpp']];
  const assumeCopy = { aHead: 'Assumptions', aCost: 'Initial Cost', aFin: 'Financing Rate', aTerm: 'Term in Months', aPmt: 'Calculated Pmt', aExtra: 'Extra Payment', aOpp: 'Opportunity Rate' };
  EFA.css('b06f', `
  .b06-asm { padding: 14px 20px 10px; }
  .b06-asm .h { text-align: center; font: 700 17px/1.2 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #0d1e3a; padding-bottom: 8px; border-bottom: 2px solid #b8972e; margin-bottom: 4px; }
  .b06-asm .row { display: grid; grid-template-columns: 1fr 156px; align-items: center; gap: 12px; padding: 5px 0; }
  .b06-asm .row > span { font: 700 17px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-asm .v { position: relative; height: 40px; border-radius: 8px; background: #fff; border: 1.5px solid #cbd5e3; display: flex; align-items: center; justify-content: flex-end; padding: 0 12px; font: 700 19px/1 "DM Sans", sans-serif; color: #0d1e3a; box-sizing: border-box; }
  .b06-asm .v.ro { background: #e3e8f0; border-color: #e3e8f0; }
  .stage .b06-asm .st-input { height: 40px; font-size: 19px; padding: 0 12px; text-align: right; border-radius: 8px; }
  .stage .b06-asm .st-field { display: block; }
  .b06-ring { position: absolute; inset: -6px; border: 3.5px solid #b8972e; border-radius: 11px; pointer-events: none; opacity: 0; box-shadow: 0 0 0 4px rgba(184,151,46,.18); }
  .b06-ring.on { opacity: 1; }
  .b06-ring.wink { animation: b06wink 1.5s linear both; }
  @keyframes b06wink { 0% { opacity: 0; } 33.2% { opacity: 1; } 33.34% { opacity: 0; } 66.5% { opacity: 1; } 66.67% { opacity: 0; } 100% { opacity: 1; } }
  `);
  /** blink a ring (1.5 s: off, on at 33%, off, on at 66%, off, on at 100%); hide is instant */
  function ring(el, on) {
    if (!el) return;
    el.classList.remove('wink', 'on');
    if (!on) return;
    void el.offsetWidth;
    el.classList.add('on'); if (!EFA.util.reduced()) el.classList.add('wink');
  }

  EFA.screen('f2', {
    title: 'The purchase scenario and its assumptions',
    steps: 4,
    copy: Object.assign({
      head: 'Purchase Scenario',
      b0: 'To show that you finance everything you buy, let\'s assume the following.',
      b1a: 'You have', b1b: 'saved in your tank, and you need to buy something that costs exactly that.',
      b2a: 'Your tank earns', b2b: ', and the lender charges', b2c: 'on the loan.',
      b3a: 'We will look at the results over', b3b: 'months, with monthly payments of', b3c: '.',
      _notes: 'Same purchase, same dollars, two ways to pay for it. We keep the rates equal so the only difference is who keeps control.\n\n- Ask: If both choices cost the same, which one leaves you in control of your money?\nPAUSE'
    }, assumeCopy),
    render(ctx) {
      const v = F101, pmt = amortPmt(v.cost, v.fin, v.n);
      const vals = { cost: F.money(v.cost), fin: F.pct(v.fin, 0), n: F.int(v.n), pmt: F.money(pmt, { dp: 2 }), extra: F.money(v.extra), opp: F.pct(v.opp, 0) };
      ctx.el.innerHTML = `
        <div class="b06-card b06-asm b06-f2c" style="left:560px;top:168px;width:440px;z-index:6">
          ${ctx.t('aHead', { cls: 'h', tag: 'div' })}
          ${ASSUME.map(([k, lab]) => `<div class="row"><span>${ctx.t(lab)}</span><span class="v ${k === 'pmt' ? 'ro' : ''}">${num(vals[k])}<i class="b06-ring" data-ring="${k}"></i></span></div>`).join('')}
        </div>
        <div class="b06-f2p b06-fade" style="position:absolute;left:1030px;top:118px;width:470px;z-index:6">
          ${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:54px"' })}
          <div class="b06-blist" style="position:relative;margin-top:26px;gap:16px;--lib-bul-w:38px">
            ${brow(card(ctx.t('b0'), 'sm'), { at: 0, size: 38 })}
            ${brow(card(`${ctx.t('b1a')} ${num(F.money(v.cost))} ${ctx.t('b1b')}`, 'sm'), { at: 1, size: 38 })}
            ${brow(card(`${ctx.t('b2a')} ${num(F.pct(v.opp, 0))}${ctx.t('b2b')} ${num(F.pct(v.fin, 0))} ${ctx.t('b2c')}`, 'sm'), { at: 2, size: 38 })}
            ${brow(card(`${ctx.t('b3a')} ${num(v.n)} ${ctx.t('b3b')} ${num(F.money(pmt, { dp: 2 }))}${ctx.t('b3c')}`, 'sm'), { at: 3, size: 38 })}
          </div>
        </div>`;
      if (!pemReady()) return;
      const pem = ctx.pem = lib('pem').mount(ctx, ctx.el, f101Base({
        frame: { zoom: { fit: ['risk', 'safe', 'borrowed'], pad: 1.4 }, width: 0.64, expanded: false, panel: ['.b06-f2p', '.b06-f2c'], expandShows: ['labels', 'lifestyle', 'scenario'], toggle: true }
      }));
      const dim = (on) => { if (pem.model) pem.model.style.opacity = on ? '.2' : '1'; };
      dim(true); if (pem.model) pem.model.style.transition = 'opacity .5s ease, transform .5s ease';
      pem.on('view', (e) => dim(!e.expanded));
    },
    step(ctx, n, dir) {
      breveal(ctx, n);
      const R = (k) => ctx.$(`[data-ring="${k}"]`);
      ['cost', 'fin', 'n', 'opp'].forEach((k) => ring(R(k), false));
      if (n === 1) ring(R('cost'), true);
      if (n === 2) { ring(R('fin'), true); ring(R('opp'), true); }
      if (n === 3) ring(R('n'), true);
    }
  });

  EFA.screen('f4', {
    title: 'Things to consider when paying cash or borrowing',
    steps: 7,
    copy: {
      head: 'Things to Consider',
      k1: 'If your money earns the same rate you would pay to borrow, the cost comes out the same.',
      k2: 'Paying cash empties the tank, and compounding starts over from zero.',
      k3: 'If you can earn more than borrowing costs, keep your money and borrow from the lender.',
      k4: 'Keeping control of your money may be worth paying a higher interest rate.',
      k5: 'Borrowed money has to be paid back by giving up some future lifestyle.',
      k6: 'Paying cash is still financing. It is self-financing.',
      _notes: 'Cash or credit is never free. The real decision is about rates, control and who keeps the growth.\n\n- Ask: Which of these matters most in how you handle big purchases?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="b06-f4p b06-fade" style="position:absolute;left:640px;top:84px;width:860px">
          ${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="font-size:58px"' })}
          <div class="b06-blist" style="position:relative;margin-top:22px;gap:13px;--lib-bul-w:40px">
            ${[1, 2, 3, 4, 5, 6].map((k) => brow(card(ctx.t('k' + k), 'sm'), { at: k, size: 40 })).join('')}
          </div>
        </div>`;
      if (!pemReady()) return;
      ctx.pem = lib('pem').mount(ctx, ctx.el, f101Base({
        frame: { zoom: { fit: ['safe', 'borrowed'], pad: 1.2 }, width: 0.37, expanded: false, panel: '.b06-f4p', expandShows: ['labels', 'lifestyle', 'scenario'], toggle: true }
      }));
    },
    step(ctx, n) { breveal(ctx, n); }
  });

  /* ---------- f3 / f3noep: finance versus pay cash, month by month ---------- */
  /** the month-by-month ledger (f3 Calculations 1-4); mode 'finance' | 'cash' */
  function f101Ledger(C, N, Xp, fin, opp, mode) {
    const l = fin / 12, p = opp / 12, cash = mode === 'cash';
    if (!(N >= 1) || Math.round(N) !== N || !isFinite(C)) throw new Error('bad assumptions');
    const S = l === 0 ? C / N : C * Math.pow(1 + l, N) * l / (Math.pow(1 + l, N) - 1);
    if (!isFinite(S)) throw new Error('bad assumptions');
    const M = S + Xp;
    const rows = [{ loanEnd: cash ? 0 : C, savEnd: cash ? 0 : C, outflow: cash ? C : 0, cumOut: cash ? C : 0, pmt: 0, cumPmt: 0, cumInt: 0, loc: 0, sched: C }];
    for (let D = 1; D <= N; D++) {
      const pr = rows[D - 1];
      const B = D === 1 ? C : pr.sched;
      const due = B * (1 + l);
      let req = 0, ext = 0, int = 0, end = 0;
      if (due >= M) { req = S; ext = Xp; int = B * l; end = B - (S + Xp - int); if (Math.abs(end) < 0.0049) end = 0; }
      else if (B > 0) { req = Math.min(S, due); ext = due - req; int = B * l; end = 0; }
      const inflow = req + ext;
      const savInt = pr.savEnd * p;
      const dep = cash ? (Math.abs(inflow) < 0.0049 ? 0 : inflow) : 0;
      const outflow = cash ? 0 : inflow;
      rows.push({
        sched: end, loanEnd: cash ? 0 : end, savEnd: pr.savEnd + savInt + dep, pmt: inflow, cumPmt: pr.cumPmt + inflow, cumInt: pr.cumInt + int,
        outflow, cumOut: pr.cumOut + outflow, loc: pr.loc + (pr.loc + pr.cumOut) * p, dep
      });
    }
    return { S, rows };
  }
  EFA.engines.f101 = { ledger: f101Ledger, payment: amortPmt };
  /** results at month k (f3 Calculations 5) */
  function f101At(L, k, mode, C) {
    const r = L.rows[k], cash = mode === 'cash';
    const intPaid = cash ? 0 : r.cumInt;
    const principal = r.cumOut - intPaid;
    return { r, intPaid, intLost: r.loc, principal, total: principal + intPaid + r.loc, sav: r.savEnd, loan: cash ? 0 : r.loanEnd, contrib: cash ? r.pmt : 0 };
  }
  const F3TP = {
    tp0a: 'You could pay cash.', tp0b: 'Doing so empties the tank.', tp0c: 'Emptying the tank restarts compounding.',
    tp1a: 'Your money keeps earning interest.', tp1b: 'You use other people\'s money and pay interest.', tp1c: 'You stay in control.',
    tp3a: 'Compare these:', tp3b: 'the purchase\'s cost versus the tank\'s future value.', tp3c: 'Which option gives you the most control?',
    tp4a: 'What about extra payments?', tp4b: 'They do not change the total cost.', tp4c: 'They only shorten the payoff.',
    tp5a: 'What about a higher yield?', tp5b: 'Bigger gains in the tanks.', tp5c: 'More control.',
    tp6a: 'What about a lower yield?', tp6b: 'Smaller gains in the tanks.', tp6c: 'More control.',
    tp7a: 'The cash payer dislikes paying interest...', tp7b: '...but likes earning it.', tp7c: 'Yet the tank must be emptied, ending compounding.',
    tp8a: 'The tank was emptied to buy.', tp8b: 'Control of those dollars is gone.', tp8c: 'So is the interest the account was earning.',
    tp10a: 'Now there is a payment to yourself.', tp10b: 'Compare the purchase\'s cost versus the tank\'s future value.', tp10c: 'Which option gives you the most control?'
  };
  const F3NTP = {
    tp0a: 'Keep your money earning interest.', tp0b: 'Use other people\'s money and pay interest.', tp0c: 'Stay in control of your money.',
    tp2a: 'Compare these:', tp2b: 'purchase cost versus the tank\'s future value.', tp2c: 'Which option gives you the most control?',
    tp3a: 'What about a higher yield?', tp3b: 'Bigger gains in the tanks.', tp3c: 'More control.',
    tp4a: 'What about a lower yield?', tp4b: 'Smaller gains in the tanks.', tp4c: 'More control.',
    tp5a: 'The cash payer dislikes paying interest...', tp5b: '...but likes earning it.', tp5c: 'Yet the tank must be emptied, ending compounding.',
    tp6a: 'The tank was emptied to buy.', tp6b: 'Control of those dollars is gone.', tp6c: 'So is the interest the account was earning.',
    tp8a: 'Your payments rebuild the account to its earlier value.', tp8b: 'Which strategy gives you the most control?', tp8c: ''
  };
  EFA.css('b06f3', `
  .b06-f3p { position: absolute; left: 1128px; top: 26px; width: 432px; display: grid; gap: 14px; }
  .b06-f3p .st-seg { justify-self: center; }
  .b06-f3p .seg-w { position: relative; justify-self: center; }
  .b06-f3p .slide { display: flex; align-items: center; gap: 14px; }
  .b06-f3p .slide input[type=range] { flex: 1; accent-color: #b8972e; height: 6px; }
  .b06-f3p .mo { min-width: 64px; text-align: center; font: 700 15px/1 "DM Sans", sans-serif; color: #f7f5f1; background: #0d1e3a; border-radius: 999px; padding: 7px 10px; }
  .b06-f3p .stp { display: flex; align-items: center; gap: 8px; font: 700 13px/1 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6e22; }
  .b06-f3p .stp .b06-switch { transform: scale(.82); transform-origin: left center; margin-right: -10px; }
  .b06-tp { padding: 14px 18px; }
  .stage .b06-tp .lib-bul { --lib-bul-gap: 10px; }
  .stage .b06-tpt { font: 700 18px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .stage .b06-tpt.blank .lib-bul-ico { visibility: hidden; }
  .b06-f3p .st-seg-b { font-size: 16px; padding: 9px 20px; }
  `);
  const f3Steps = (n) => function () { const pl = EFA.player, e = pl && pl.pres && pl.entry(); return e && e.v === 'calculator' ? 1 : n; };

  /** shared calculator for f3 (11-step story) and f3noep (9-step story) */
  function f101Calc(cfg) {
    return {
      render(ctx) {
        const calc = ctx.variant === 'calculator', D0 = F101, story = !calc;
        /* per-client keys, reset to their defaults on every screen entry */
        const K = { cost: 'f1_initial_cost', fin: 'f1_ror_financing', n: 'f1_term_in_months', extra: 'f1_extra_payment', opp: 'f1_ror_opportunity' };
        Object.entries(K).forEach(([id, key]) => { cset(key, D0[id]); ctx.remember('f.' + id, D0[id]); });
        const st = ctx._f3 = { mode: 'finance', month: 0, play: false, pre: story, redX: false, L: null, tax: 0 };
        const fld = (id, type, o) => cfield(ctx, Object.assign({ key: K[id], id, type, value: D0[id] }, o || {}));
        const rowF = (id, lab, inner) => `<div class="row"><span>${ctx.t(lab)}</span><span style="position:relative">${inner}<i class="b06-ring" data-ring="${id}"></i></span></div>`;
        ctx.el.innerHTML = `<div class="b06-f3p">
            <div class="seg-w"><div class="st-seg" role="radiogroup"><button type="button" class="st-seg-b" data-mode="finance" aria-checked="true">${ctx.t('mFin')}</button><button type="button" class="st-seg-b" data-mode="cash" aria-checked="false">${ctx.t('mCash')}</button></div>${cfg.modeRings ? '<i class="b06-ring" data-ring="mFin" style="right:50%"></i><i class="b06-ring" data-ring="mCash" style="left:50%"></i>' : ''}</div>
            <div class="slide"><input type="range" min="0" max="60" step="1" value="0" aria-label="Month"><span class="mo num">0</span><span class="stp">${ctx.t('stepLab')}<button type="button" class="b06-switch play" role="switch" aria-checked="false"></button></span></div>
            <div class="b06-card b06-asm" style="position:relative">
              ${ctx.t('aHead', { cls: 'h', tag: 'div' })}
              ${rowF('cost', 'aCost', fld('cost', 'money', { min: 0 }))}
              ${rowF('fin', 'aFin', fld('fin', 'pct', { min: 0, max: 0.5, dp: 2 }))}
              ${rowF('n', 'aTerm', fld('n', 'int', { min: 1, max: 600 }))}
              <div class="row"><span>${ctx.t('aPmt')}</span><span class="v ro num" data-o="pmt"></span></div>
              ${rowF('extra', 'aExtra', fld('extra', 'money', { min: 0 }))}
              ${rowF('opp', 'aOpp', fld('opp', 'pct', { min: 0, max: 0.12, dp: 2 }))}
            </div>
            ${story ? '<div class="b06-card b06-tp" style="position:relative"></div>' : ''}
          </div>`;
        ctx.$$('.b06-asm .st-field > label').forEach((n) => n.remove());
        const slider = ctx.$('input[type=range]');
        if (!pemReady()) { ctx.el.insertAdjacentHTML('beforeend', pemPending(ctx, 'left:40px;top:40px;width:1040px;height:800px')); }
        const pem = ctx.pem = pemReady() ? lib('pem').mount(ctx, ctx.el, {
          links: false, labels: false, scenarioPicker: false, lifestyleStrip: false, sliders: false, showHouse: false, borrowSource: false, futureFill: false, ceiling: false,
          regulator: 0, remaining: 0, collateral: 'safe', altBalance: true, debtService: false, risk: 0,
          frame: { zoom: { fit: ['safe', 'borrowed', 'filter'], pad: 1.6 }, width: 0.70, expanded: false, panel: '.b06-f3p', expandShows: ['labels', 'lifestyle'], toggle: true }
        }) : null;
        const vals = () => ctx.values();
        const recalc = () => {
          const v = vals(), N = Math.round(v.n);
          try { st.L = f101Ledger(v.cost, N, v.extra || 0, v.fin || 0, v.opp || 0, st.mode); }
          catch (e) { ctx.toast(ctx.text('err')); return false; }
          ctx.$('[data-o="pmt"]').textContent = F.money(st.L.S, { dp: 2 });
          slider.max = String(N);
          if (st.month > N) st.month = N;
          return true;
        };
        const draw = (ms) => {
          const v = vals(), C = v.cost, R = Math.max(1, 2 * C);
          slider.value = String(st.month); ctx.$('.mo').textContent = String(st.month);
          if (!pem) return;
          let o;
          if (st.pre || !st.L) {
            o = { safe: 50, safeBalance: C, borrow: 0, bfBalance: 0, contribution: 0, inflow: 0, inflowTotal: 0, outflow: 0, outflowTotal: 0, oppCost: 0, summaryBorrow: false, summaryCash: false, noBorrow: st.redX, taxesPaid: 0 };
          } else {
            const a = f101At(st.L, Math.min(st.month, st.L.rows.length - 1), st.mode, C), r = a.r;
            const t = st.tax || 0, gross = (x) => (t ? x / (1 - t) : x);
            o = {
              safe: a.sav / R * 100, safeBalance: Math.round(a.sav), borrow: a.loan / R * 100, bfBalance: Math.round(a.loan), contribution: Math.round(a.contrib),
              inflow: Math.round(gross(r.pmt)), inflowTotal: Math.round(gross(r.cumPmt)), outflow: Math.round(r.outflow), outflowTotal: Math.round(r.cumOut), oppCost: Math.round(r.loc),
              taxesPaid: Math.round(gross(r.pmt) - r.pmt), noBorrow: st.mode === 'cash',
              summaryBorrow: st.mode === 'finance' && a.loan === 0 && st.month > 0, summaryCash: st.mode === 'cash' && st.month === st.L.rows.length - 1,
              summaryPrincipal: Math.round(a.principal), summaryInterestPaid: Math.round(a.intPaid), summaryInterestLost: Math.round(a.intLost), summaryTotal: Math.round(a.total)
            };
            if (o.summaryBorrow && st.play) { pem.stop('F101RepayLoanCashflow'); }
          }
          pem.set(o, { ms: ms == null ? 400 : ms });
        };
        const setMode = (m) => { st.mode = m; ctx.$$('[data-mode]').forEach((b) => b.setAttribute('aria-checked', b.dataset.mode === m)); };
        const stopPlay = () => {
          st.play = false; ctx.$('.play').setAttribute('aria-checked', 'false');
          if (st.timer) { clearTimeout(st.timer); st.timer = null; }
          if (pem) { pem.stop('F101RepayLoanCashflow'); pem.stop('F101RepayTankCashflow'); }
        };
        const tick = () => {
          if (!st.play) return;
          const N = st.L ? st.L.rows.length - 1 : 0;
          if (st.month >= N) {
            stopPlay();
            if (story && cfg.autoNext[ctx.step]) ctx.next();
            return;
          }
          st.month++; draw(220);
          st.timer = ctx.timeout(tick, 250);
        };
        const startPlay = () => {
          if (!st.L) recalc();
          st.pre = false; st.play = true; ctx.$('.play').setAttribute('aria-checked', 'true');
          ctx.timeout(() => { if (st.play && pem) pem.play(st.mode === 'cash' ? 'F101RepayTankCashflow' : 'F101RepayLoanCashflow'); }, 100);
          st.timer = ctx.timeout(tick, 250);
        };
        Object.assign(st, { recalc, draw, setMode, stopPlay, startPlay });
        /* talking points for the story steps */
        st.points = (n) => {
          const box = ctx.$('.b06-tp'); if (!box) return;
          const g = cfg.tpGroup(n), keys = ['a', 'b', 'c'].map((x) => 'tp' + g + x);
          const B = lib('bullets');
          const items = keys.map((k) => ({ html: ctx.t(k), blank: !ctx.text(k) }));
          box.innerHTML = B && B.list ? B.list(ctx, items.map((x) => x.html), { reveal: false, size: 26, text: 'b06-tpt', gap: 10 }) : items.map((x) => `<p class="b06-tpt" style="margin:0 0 8px">${x.html}</p>`).join('');
          if (B) ctx.$$('.b06-tp .lib-bul-row').forEach((rw, i) => { if (items[i].blank) rw.style.visibility = 'hidden'; });
          EFA.numify(box); if (EFA.edit && EFA.edit.on) EFA.edit.arm(box);
        };
        /* inputs: recalculate only when a value changed; clamp the slider to a shorter term */
        let lastV = null;
        ctx.onFields((v) => { const k = JSON.stringify(v); if (k === lastV) return; lastV = k; if (recalc()) draw(); });
        ctx.on(slider, 'input', () => { st.month = +slider.value; st.pre = false; if (!st.L) recalc(); draw(150); });
        ctx.on(ctx.$('.play'), 'click', () => { if (st.play) stopPlay(); else startPlay(); });
        ctx.on(ctx.$$('[data-mode]'), 'click', (e, b) => {
          const m = b.dataset.mode;
          if (story) { ctx.goStep(m === 'finance' ? 0 : cfg.cashStep); return; }
          setMode(m); st.month = 0; stopPlay(); st.pre = false; recalc(); draw();
        });
        ctx.$$('.b06-asm .st-input').forEach((inp) => inp.addEventListener('keydown', (e) => e.stopPropagation()));
        recalc();
        if (!story) { st.pre = false; draw(0); }
      },
      step(ctx, n, dir) {
        const st = ctx._f3; if (!st || ctx.variant === 'calculator') return;
        cfg.apply(ctx, st, n, dir);
        st.points(n);
      },
      leave(ctx) { const st = ctx._f3; if (st) st.play = false; }
    };
  }
  /** set a story field (fires a recalc through the shared helper) */
  const f3set = (ctx, id, v) => ctx.setField(id, v);
  const f3ring = (ctx, ids) => { ctx.$$('[data-ring]').forEach((r) => ring(r, false)); ids.forEach((id) => ring(ctx.$(`[data-ring="${id}"]`), true)); };

  const f3def = f101Calc({
    autoNext: { 2: true, 9: true }, cashStep: 7,
    tpGroup: (n) => ({ 0: 0, 1: 1, 2: 1, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 8, 10: 10 })[n],
    apply(ctx, st, n, dir) {
      const N = () => Math.round(ctx.values().n);
      const reset = (o) => { Object.entries(o).forEach(([k, v]) => f3set(ctx, k, v)); };
      if (dir === 0) {
        /* entering the screen on a given step: set its whole state */
        const T = [[0, 0], [0, 0], [0, 0], [0, 'N'], [200, 'N'], [200, 'N'], [200, 'N'], [0, 0], [0, 0], [0, 0], [0, 'N']][n];
        reset({ extra: T[0], fin: n === 5 ? 0.019 : 0.05, opp: n === 6 ? 0.019 : 0.05 });
        st.setMode(n >= 7 ? 'cash' : 'finance'); st.stopPlay(); st.recalc();
        st.month = T[1] === 'N' ? N() : 0; st.pre = n === 0 || n === 7; st.redX = n === 7;
        st.draw(0);
      } else if (dir > 0) {
        if (n === 1) { st.pre = false; st.month = 0; st.recalc(); st.draw(); }
        if (n === 2 || n === 9) { st.month = 0; st.pre = false; st.recalc(); st.draw(0); st.startPlay(); }
        if (n === 3 || n === 10) { st.stopPlay(); st.recalc(); st.month = N(); st.pre = false; st.draw(); }
        if (n === 4) { reset({ extra: 200 }); st.recalc(); st.draw(); }
        if (n === 5) { reset({ fin: 0.019 }); st.recalc(); st.draw(); }
        if (n === 6) { reset({ fin: 0.05, opp: 0.019 }); st.recalc(); st.draw(); }
        if (n === 7) { st.stopPlay(); st.setMode('cash'); reset({ extra: 0, fin: 0.05, opp: 0.05 }); st.recalc(); st.month = 0; st.pre = true; st.redX = true; st.draw(); }
        if (n === 8) { st.pre = false; st.month = 0; st.recalc(); st.draw(); }
      } else {
        if (n === 0) { st.month = 0; st.stopPlay(); st.pre = true; st.redX = false; st.draw(); }
        if (n === 1) { st.month = 0; st.stopPlay(); st.pre = false; st.recalc(); st.draw(); }
        if (n === 2 || n === 9) { st.month = 0; st.recalc(); st.stopPlay(); st.draw(); ctx.timeout(() => ctx.prev(), 0); }
        if (n === 3) { reset({ extra: 0 }); st.recalc(); st.draw(); }
        if (n === 4) { reset({ fin: 0.05, extra: 200 }); st.recalc(); st.draw(); }
        if (n === 5) { reset({ fin: 0.019, opp: 0.05 }); st.recalc(); st.draw(); }
        if (n === 6) { st.setMode('finance'); reset({ fin: 0.05, opp: 0.019 }); st.recalc(); st.month = N(); st.pre = false; st.redX = false; st.draw(); }
        if (n === 7) { st.month = 0; st.stopPlay(); st.pre = true; st.redX = true; st.draw(); }
        if (n === 8) { st.stopPlay(); st.month = 0; st.pre = false; st.recalc(); st.draw(); }
      }
      f3ring(ctx, n === 4 ? ['extra'] : n === 5 || n === 6 ? ['fin', 'opp'] : []);
    }
  });
  EFA.screen('f3', Object.assign({
    title: 'Finance versus pay cash, month by month',
    steps: 11,
    copy: Object.assign({
      mFin: 'Finance', mCash: 'Pay Cash', stepLab: 'Step', err: 'The calculation could not be completed. Please check that the assumptions are reasonable.',
      _notes: 'Same purchase, two paths. Financing keeps your tank earning while you pay the lender; paying cash empties the tank and you pay yourself back. With equal rates, the total cost comes out the same.\n\n- Ask: Knowing the cost is the same, which path leaves you in control?\nPAUSE\n\n- Steps 2 and 9 play the months automatically and move on when the term ends.'
    }, assumeCopy, F3TP)
  }, f3def));
  Object.defineProperty(EFA.screens.f3, 'steps', { get: f3Steps(11) });

  const f3nDef = f101Calc({
    autoNext: { 1: true, 7: true }, cashStep: 5, modeRings: true,
    tpGroup: (n) => ({ 0: 0, 1: 0, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 6, 8: 8 })[n],
    apply(ctx, st, n, dir) {
      const N = () => Math.round(ctx.values().n);
      const reset = (o) => { Object.entries(o).forEach(([k, v]) => f3set(ctx, k, v)); };
      if (dir === 0) {
        reset({ extra: 0, fin: n === 3 ? 0.04 : 0.05, opp: n === 4 ? 0.04 : 0.05 });
        st.setMode(n >= 5 ? 'cash' : 'finance'); st.stopPlay(); st.recalc();
        st.month = n === 2 || n === 3 || n === 4 || n === 8 ? N() : 0; st.pre = n === 5; st.redX = n === 5;
        st.draw(0);
      } else if (dir > 0) {
        if (n === 1 || n === 7) { st.month = 0; st.pre = false; st.recalc(); st.draw(0); st.startPlay(); }
        if (n === 2 || n === 8) { st.stopPlay(); st.recalc(); st.month = N(); st.pre = false; st.draw(); }
        if (n === 3) { reset({ fin: 0.04 }); st.recalc(); st.draw(); }
        if (n === 4) { reset({ fin: 0.05, opp: 0.04 }); st.recalc(); st.draw(); }
        if (n === 5) { st.stopPlay(); st.setMode('cash'); reset({ extra: 0, fin: 0.05, opp: 0.05 }); st.recalc(); st.month = 0; st.pre = true; st.redX = true; st.draw(); }
        if (n === 6) { st.pre = false; st.month = 0; st.recalc(); st.draw(); }
      } else {
        if (n === 0) { st.month = 0; st.stopPlay(); st.pre = false; st.recalc(); st.draw(); }
        if (n === 1 || n === 7) { st.month = 0; st.recalc(); st.stopPlay(); st.draw(); ctx.timeout(() => ctx.prev(), 0); }
        if (n === 2) { reset({ extra: 0, fin: 0.05 }); st.recalc(); st.draw(); }
        if (n === 3) { reset({ fin: 0.04, opp: 0.05 }); st.recalc(); st.draw(); }
        if (n === 4) { st.setMode('finance'); reset({ fin: 0.05, opp: 0.04 }); st.recalc(); st.month = N(); st.pre = false; st.redX = false; st.draw(); }
        if (n === 5) { st.month = 0; st.stopPlay(); st.pre = true; st.redX = true; st.draw(); }
        if (n === 6) { st.stopPlay(); st.month = 0; st.pre = false; st.recalc(); st.draw(); }
      }
      const rings = n === 3 || n === 4 ? ['fin', 'opp'] : [];
      rings.push(n < 5 ? 'mFin' : 'mCash');
      const keep = ctx._f3.lastRingStep != null && (ctx._f3.lastRingStep < 5) === (n < 5) && n !== 3 && n !== 4;
      ctx.$$('[data-ring]').forEach((r) => { if (!(keep && (r.dataset.ring === 'mFin' || r.dataset.ring === 'mCash'))) ring(r, false); });
      rings.forEach((id) => { const el = ctx.$(`[data-ring="${id}"]`); if (el && !(keep && (id === 'mFin' || id === 'mCash'))) ring(el, true); });
      ctx._f3.lastRingStep = n;
    }
  });
  EFA.screen('f3noep', Object.assign({
    title: 'Finance versus pay cash, without the extra-payment step',
    steps: 9,
    copy: Object.assign({
      mFin: 'Finance', mCash: 'Pay Cash', stepLab: 'Step', err: 'The calculation could not be completed. Please check that the assumptions are reasonable.',
      _notes: 'Two paths to the same purchase. Watch the tanks: one keeps earning while you pay the lender, the other is emptied and refilled by paying yourself back.\n\n- Ask: With the cost the same, which path would you rather be on?\nPAUSE'
    }, assumeCopy, F3NTP)
  }, f3nDef));
  Object.defineProperty(EFA.screens.f3noep, 'steps', { get: f3Steps(9) });

  /* =====================================================================
     FGPS: the four key questions
     ===================================================================== */
  const gpsRetired = () => !!cget('fgps_is_retired', false);
  EFA.screen('fgps1', {
    title: 'The four key financial questions',
    steps: 6,
    copy: {
      head: 'The Four Most Important Financial Questions Everyone Needs Answered',
      l1: 'Rate of Return', l2: 'Amount to Save', l3: 'When to Retire', l4: 'Retirement Lifestyle',
      q1: 'Do you know the rate of return you need on your savings and investments to keep living the way you do today, adjusted for inflation, with money that lasts to your life expectancy?',
      q2: 'Do you know how much to save each month or each year so you reach retirement able to keep today\'s standard of living?',
      q3: 'Do you know how long you need to keep working before you can retire with enough to last to your life expectancy?',
      q4: 'Do you know how much you would have to cut your standard of living in retirement if nothing changes?',
      q1r: 'Do you know the rate of return you need on what you have already saved to keep your current lifestyle, with money that lasts to your life expectancy?',
      q2r: 'Do you know how much you should already have saved to keep your current standard of living to your life expectancy?',
      q3r: 'If you keep going as you are, do you know how long your current lifestyle can last before the money runs out?',
      q4r: 'Do you know how much you can spend each month or each year and still have money last to your life expectancy?',
      retired: 'Retired', skip: 'Skip ahead',
      _notes: 'Four questions. Most people cannot answer any of them with confidence, and every one of them can be answered.\n\n- Flip Retired for clients already in retirement; the questions change with it.\n- Ask: Which of these four keeps you up at night?\nPAUSE'
    },
    render(ctx) {
      const xs = [0, 1, 2, 3].map((i) => 120 + 1360 * (0.125 + i * 0.25));
      ctx.el.innerHTML = `${head(ctx, 'head', { sm: true })}
        <div class="b06-card route-bar b06-fade" style="left:120px;top:222px;width:1360px;height:98px;border-radius:49px"></div>
        <svg class="b06-full route-line b06-fade" viewBox="0 0 1600 900"><path d="M${xs[0]} 253H${xs[3]}" stroke="${P.mist2}" stroke-width="4" stroke-dasharray="2 12" stroke-linecap="round"/></svg>
        <div class="b06-route" style="left:0;right:0">${[1, 2, 3, 4].map((i) => `<div class="wp is-off" data-l="${i}" style="left:${xs[i - 1]}px"><span class="d"></span>${ctx.t('l' + i, { cls: 't' })}</div>`).join('')}</div>
        <div class="b06-card b06-q b06-fade qcard">${[1, 2, 3, 4].map((i) => `<div class="qs is-off" data-q="${i}">${ctx.t('q' + i, { cls: 'w' })}${ctx.t('q' + i + 'r', { cls: 'r' })}</div>`).join('')}</div>
        <div class="b06-med" style="left:1092px;top:356px;width:380px;height:380px">${ill.question()}</div>
        <div class="b06-switch-w" style="right:150px;top:766px">${ctx.t('retired', { cls: 'lb' })}<button type="button" class="b06-switch" role="switch" aria-checked="${gpsRetired()}"></button></div>
        <button type="button" class="b06-skip" style="left:120px;top:780px"><span class="ic">${chev(2)}</span>${ctx.t('skip')}</button>`;
      const apply = () => { const r = gpsRetired(); ctx.$$('.qs .w').forEach((n) => { n.style.display = r ? 'none' : ''; }); ctx.$$('.qs .r').forEach((n) => { n.style.display = r ? '' : 'none'; }); ctx.$('.b06-switch').setAttribute('aria-checked', r); };
      apply();
      ctx.on(ctx.$('.b06-switch'), 'click', () => { cset('fgps_is_retired', !gpsRetired()); apply(); });
      ctx.on(ctx.$('.b06-skip'), 'click', () => { const st = lib('steps'); if (st && st.skip) st.skip(ctx); else { ctx.goStep(5); ctx.next(); } });
    },
    step(ctx, n) {
      ctx.show('.route-bar', n >= 1); ctx.show('.route-line', n >= 1);
      ctx.$$('.wp').forEach((w) => {
        const k = +w.dataset.l;
        w.classList.toggle('is-off', n < k);
        w.classList.toggle('mute', n > k && n !== 5);
        w.classList.toggle('cur', n === k);
      });
      ctx.show('.qcard', n >= 1 && n <= 4);
      ctx.$$('.qs').forEach((q) => q.classList.toggle('is-off', +q.dataset.q !== n));
    }
  });

  /* =====================================================================
     FGPS projection engine (fgps22 sections E1 to E10), shared by fgps22 and fgps23.
     Exposed as EFA.engines.fgps. Pure computation (no DOM). Rates and percents are fractions.
     Every carried quantity is kept per row, so any single row can be recomputed during a search.
     ===================================================================== */
  const GPS = (function () {
    const N0 = (x) => (Math.abs(x) < 0.0049 ? 0 : x);
    const R2 = (x) => Math.round(x * 100) / 100;
    const DATA = () => (window.EFA && window.EFA.data) || {};
    const F64 = (n) => new Float64Array(n);
    let seq = 0;
    const newId = () => 'a' + Date.now().toString(36) + (++seq).toString(36) + Math.random().toString(36).slice(2, 5);
    const clone = (o) => JSON.parse(JSON.stringify(o));

    /* ---------- defaults (the spec's Data model) ---------- */
    const GDEF = {
      contactName: '', contactId: null, mobilePhone: '', altPhone: '', street: '', city: '', state: '', zip: '', email: '', email2: '',
      clientName: '', clientDOB: null, clientAge: 42, clientRetireAge: 65, clientLE: 84, clientPosition: '', clientEmployer: '', clientWorkPhone: '', creditScore: 0,
      useSpouse: false, spouseName: '', spouseDOB: null, spouseAge: 40, spouseRetireAge: 65, spouseLE: 91, spousePosition: '', spouseEmployer: '', spouseWorkPhone: '',
      children: [], inflationRate: 0.03, autoTaxRate: false, taxAccumulation: 0.30, taxDistribution: 0.30, taxCapGains: 0.15,
      filingStatus: 'mfj', itemize: false, deductions: 0, clientBlind: false, spouseBlind: false, stateTaxRate: 0,
      useMarketHistory: false, globalMarket: null, mhStartYear: null, mhEndYear: null, desiredLegacy: 0, projectToAge: null, marketOffset: 0
    };
    const SDEF = {
      accounts: [], fundingSources: [], saveExcessTarget: null,
      maintainCurrentLifestyle: true, desiredRetirementIncome: 0, inflateLifestyle: true,
      survivorLifestylePct: 1, adjustLifestyle: false, adjustAtAge: 80, adjustPct: 1, adjustInflated: true,
      recalcLifestyleAtRetirement: true, saveDeathBenefits: true, saveExcess: true, useSweepAccount: true, sweepReturnPct: 0,
      clientRetireAgeOffset: 0, spouseRetireAgeOffset: 0, notes: [], wrapUp: null
    };
    const MH = { useMH: false, useGlobalMH: true, market: null, mhStart: null, mhEnd: null };
    const CONTRIB = { contrib: 0, contribInfl: null, cStart: { s: 'current' }, cEnd: { s: 'retire' } };
    const EXTRA = { extraAmt: 0, extraPct: 1 };
    const ADEF = {
      taxable: Object.assign({ balance: 0, costBasis: 0, ret: 0, ordPct: 1, fee: 0, feesDeductible: false, basisMethod: 'avg', payTaxFromLifestyle: true, mcp: false, autoExpense: true, risk: 'med', accessible: true }, MH, CONTRIB, EXTRA),
      tdbt: Object.assign({ balance: 0, ret: 0, fee: 0, enforceRMD: false, match: 0, mcp: false, autoExpense: true, allowEarly: false, earlyPenalty: false, risk: 'high', accessible: true }, MH, CONTRIB, EXTRA),
      tdat: Object.assign({ balance: 0, costBasis: 0, basisMethod: 'avg', ret: 0, fee: 0, enforceRMD: false, hasRMD: false, roth: false, match: 0, mcp: false, autoExpense: true, allowEarly: false, earlyPenalty: false, risk: 'high', accessible: true }, MH, CONTRIB, EXTRA),
      taxfree: Object.assign({ balance: 0, ret: 0, fee: 0, mcp: false, autoExpense: true, risk: 'med', accessible: true }, MH, CONTRIB, EXTRA),
      annuity: Object.assign({
        balance: 0, costBasis: 0, ret: 0, fee: 0, qualified: false, roth: false, enforceRMD: false, simple: false, basisMethod: 'avg', useIll: false, ill: [],
        incomeRider: false, disabilityRider: false, ltcRider: false, survivor: false, wdAsInflow: false, surrenderPct: 0, bonusPct: 0,
        limits: false, floorOn: false, floor: 0, capOn: false, cap: 0.1, partOn: false, part: 1, spreadOn: false, spread: 0, intervalOn: false, interval: 1,
        mcp: false, autoExpense: true, risk: 'med', accessible: true
      }, MH, CONTRIB, EXTRA),
      pli: { premium: 0, db: 0, av: 0, csv: 0, ilit: false, useIll: false, ill: [], disabilityRider: false, ltcRider: false, init: { s: 'current' }, risk: 'low', accessible: true },
      property: { value: 0, costBasis: 0, appr: 0.03, exclusion: 0, residence: true, treatment: 'taxable', init: { s: 'current' }, cashRequired: 0, sell: false, saleAge: null, saleProceeds: 0, risk: 'med', accessible: false },
      note: { balance: 0, rate: 0, pmt: 0, init: { s: 'current' }, risk: 'low', accessible: false },
      loan: { balance: 0, rate: 0, pmt: 0, creditLine: 0, deductible: true, collateralized: true, proceeds: 0, payOff: false, payOffAge: null, payOffAtDeath: false, init: { s: 'current' }, risk: 'low', accessible: false },
      credit: { balance: 0, rate: 0, pmt: 0, charges: 0, payMin: false, grace: true, deductible: false, risk: 'low', accessible: false },
      income: { amount: 0, infl: null, iStart: { s: 'current' }, iEnd: { s: 'retire' }, taxablePct: 1, deductible: 0, ss: false, survivor: false, survivorPct: 0.5, wages: false, selfEmployed: false, risk: 'high', accessible: false },
      expense: { amount: 0, infl: null, iStart: { s: 'current' }, iEnd: { s: 'le' }, deductible: false, usage: 'itemized', mcp: false, risk: 'low', accessible: false },
      term: { policyType: 'life', premium: 0, premInfl: 0, benefit: 0, cola: null, iStart: { s: 'current' }, iEnd: { s: 'retire' }, risk: 'low', accessible: false }
    };
    const INVEST = { taxable: 1, tdbt: 1, tdat: 1, taxfree: 1, annuity: 1 };
    const newAccount = (type, o) => Object.assign({ id: newId(), type, name: '', owner: 'client', actions: [], excluded: false }, clone(ADEF[type] || {}), o || {});
    function newScenario(name, o) {
      const t = Date.now();
      return Object.assign(clone(SDEF), { id: 'gps_' + t.toString(36) + Math.random().toString(36).slice(2, 6), name: name || 'Present Position', created: t, modified: t }, o || {});
    }
    const globals = (g) => Object.assign(clone(GDEF), g || {});
    const scen = (s) => Object.assign({}, SDEF, s || {});

    /* ---------- E2.5 market history (series from EFA.data once verified) ---------- */
    function markets() {
      const h = DATA().history || {}, out = [];
      const add = (key, label, series) => { if (Array.isArray(series) && series.length) out.push({ key, label, series: series.slice().sort((a, b) => a[0] - b[0]) }); };
      if (Array.isArray(h.markets)) h.markets.forEach((m) => { if (m && m.series) add(m.series, m.label || m.series, h[m.series]); });
      else if (h.markets && typeof h.markets === 'object') Object.entries(h.markets).forEach(([k, v]) => { if (Array.isArray(v)) add(k, k, v); else if (v && Array.isArray(v.series)) add(k, v.label || v.name || k, v.series); });
      if (!Array.isArray(h.markets)) {
        if (!out.some((m) => m.key === 'sp500TotalReturn')) add('sp500TotalReturn', 'S&P 500 Total Return', h.sp500TotalReturn);
        if (!out.some((m) => m.key === 'sp500PriceReturn')) add('sp500PriceReturn', 'S&P 500 Price Return', h.sp500PriceReturn);
      }
      return out;
    }
    function marketSeries(key, y1, y2) {
      const all = markets(), m = all.find((x) => x.key === key) || all[0];
      if (!m) return null;
      const lo = m.series[0][0], hi = m.series[m.series.length - 1][0];
      const a = Math.max(lo, Math.min(hi, y1 == null ? lo : y1)), b = Math.max(a, Math.min(hi, y2 == null ? hi : y2));
      return m.series.filter(([y]) => y >= a && y <= b).map(([, v]) => v);
    }
    const averageReturn = (key, y1, y2) => { const s = marketSeries(key, y1, y2); return s && s.length ? s.reduce((t, v) => t + v, 0) / s.length : null; };
    function applyLimits(rec, ser) {
      const n = rec.intervalOn ? Math.max(1, Math.round(rec.interval || 1)) : 1;
      return ser.map((x, i) => {
        let v;
        if (n > 1) { if ((i + 1) % n) return 0; v = 1; for (let k = i - n + 1; k <= i; k++) v *= 1 + ser[k]; v -= 1; } else v = x;
        if (rec.floorOn && v < rec.floor) v = rec.floor;
        if (rec.partOn && v > 0) v *= rec.part;
        if (rec.capOn && v > rec.cap) v = rec.cap;
        if (rec.spreadOn && v > 0) v = Math.max(0, v - rec.spread);
        return v;
      });
    }

    /* ---------- E3.3 federal tax ---------- */
    const STATUS = { single: 'single', mfj: 'mfj', mfs: 'mfs', hoh: 'hoh' };
    const taxData = () => { const f = DATA().fed; return f && f.brackets && f.ltcg && f.standardDeduction ? f : null; };
    function ordinaryTax(brackets, amt, grow) {
      let tax = 0, lo = 0;
      for (const b of brackets) {
        const hi = b.upTo == null ? Infinity : b.upTo * grow;
        if (amt > lo) tax += (Math.min(amt, hi) - lo) * b.rate;
        if (amt <= hi) break;
        lo = hi;
      }
      return tax;
    }
    function bracketAt(brackets, amt, grow) {
      for (const b of brackets) { const hi = b.upTo == null ? Infinity : b.upTo * grow; if (amt <= hi) return { rate: b.rate, head: b.upTo == null ? 0 : hi - amt }; }
      return { rate: 0, head: 0 };
    }
    /** the qualified dividends and capital gain tax worksheet structure */
    function capGainsTax(f, status, TI, gains, grow) {
      const br = f.brackets[status], lt = f.ltcg[status];
      const g = Math.max(0, Math.min(gains, TI)), ordPart = Math.max(TI - g, 0);
      const tOrd = ordinaryTax(br, ordPart, grow), tAll = ordinaryTax(br, TI, grow);
      const z = lt[0].upTo * grow, m = lt[1].upTo * grow;
      const at0 = Math.max(0, Math.min(TI, z) - ordPart);
      const at15 = Math.max(0, Math.min(TI, m) - Math.max(ordPart, z));
      const at20 = Math.max(0, g - at0 - at15);
      const gTax = at15 * lt[1].rate + at20 * lt[2].rate;
      return { ordTax: tOrd, gainsTax: Math.max(0, Math.min(gTax, tAll - tOrd)), total: Math.min(tOrd + gTax, tAll) };
    }

    /* ---------- RMD helpers (start age and divisors from EFA.data.rmd) ---------- */
    function rmdStartAge(birthYear) {
      const rows = (DATA().rmd || {}).startAge;
      if (!Array.isArray(rows)) return null;
      const d = `${birthYear}-01-01`;
      const hit = rows.find((x) => (!x.bornFrom || d >= x.bornFrom) && (!x.bornTo || d <= x.bornTo));
      return hit ? hit.age : null;
    }
    function rmdDivisor(attained, spouseAttained, joint) {
      const R = DATA().rmd || {};
      if (joint && spouseAttained != null && R.joint && R.joint[attained] && R.joint[attained][spouseAttained] != null) return R.joint[attained][spouseAttained];
      if (!R.uniform) return null;
      const a = Math.min(120, Math.max(72, attained));
      return R.uniform[a] != null ? R.uniform[a] : null;
    }

    /* =====================================================================
       E1 timeline and the run context
       ===================================================================== */
    function context(G, S, o) {
      const X = { G, S, o, y0: o.startYear || new Date().getFullYear() };
      const a0 = Math.round(G.clientAge), sp = !!G.useSpouse, s0 = sp ? Math.round(G.spouseAge) : null;
      const Y = Math.max(1, 100 - a0 + 1);
      let cLE = G.clientLE || 85, sLE = sp ? (G.spouseLE || 85) : null;
      const hz = o.hazard;
      if (hz && hz.type === 'death') { if (hz.clientActive) cLE = hz.clientStartAge; if (sp && hz.spouseActive) sLE = hz.spouseStartAge; }
      const leRow = (le, age) => Math.min(Math.max(le, age) - age + 1, Y);
      Object.assign(X, { a0, s0, sp, Y, cLE, sLE });
      X.cLErow = leRow(cLE, a0); X.sLErow = sp ? leRow(sLE, s0) : null;
      X.jointRow = sp ? Math.max(X.cLErow, X.sLErow) : X.cLErow;
      X.firstDie = sp ? Math.min(X.cLErow, X.sLErow) : Y - 1;
      const shift = o.retireAge != null ? o.retireAge - G.clientRetireAge : 0;
      X.cRet = G.clientRetireAge + (S.clientRetireAgeOffset || 0) + shift;
      X.sRet = sp ? G.spouseRetireAge + (S.spouseRetireAgeOffset || 0) + shift : null;
      X.retRow = Math.max(0, X.cRet - a0);
      X.infl = G.inflationRate || 0;
      X.own = (rec) => {
        if (rec.owner === 'spouse' && sp) return { who: 'spouse', age: s0, le: sLE, leRow: X.sLErow, ret: X.sRet, survRow: X.cLErow, otherAge: a0 };
        if (rec.owner === 'joint') return { who: 'joint', age: a0, le: cLE, leRow: X.jointRow, ret: X.cRet, survRow: X.jointRow, otherAge: sp ? s0 : null, joint: true };
        return { who: 'client', age: a0, le: cLE, leRow: X.cLErow, ret: X.cRet, survRow: sp ? X.sLErow : X.cLErow, otherAge: sp ? s0 : null };
      };
      /* dynamic ages for start/end strategies (E1) */
      X.sAge = (st, ow, isEnd) => {
        const t = (st && st.s) || 'current';
        if (t === 'current') return ow.age;
        if (t === 'retire') return ow.ret - (isEnd ? 1 : 0);
        if (t === 'le') return ow.le;
        return Math.max(st.age != null ? +st.age : ow.age, ow.age);
      };
      X.sRow = (st, ow, isEnd) => X.sAge(st, ow, isEnd) - ow.age;
      /* E3.1 manual rates; automatic rates replace them row by row */
      X.rate = { ord: F64(Y), cg: F64(Y), potOrd: F64(Y), potCg: F64(Y), marg: F64(Y), head: F64(Y) };
      for (let r = 0; r < Y; r++) {
        const ord = r < X.retRow ? G.taxAccumulation : G.taxDistribution;
        X.rate.ord[r] = ord; X.rate.cg[r] = G.taxCapGains; X.rate.potOrd[r] = ord; X.rate.potCg[r] = G.taxCapGains;
      }
      X.fed = G.autoTaxRate ? taxData() : null;
      X.auto = !!X.fed;
      X.creditWarning = false; X.missingIll = false;
      return X;
    }
    /** E9 tax-rate hazard on one row (after the row's rates are set) */
    function taxHazard(X, r) {
      const hz = X.o.hazard;
      if (!hz || hz.type !== 'tax') return;
      const st = (hz.clientStartAge != null ? hz.clientStartAge : X.a0) - X.a0;
      if (r < st) return;
      const R = X.rate;
      if (hz.applyAsPct) { const k = 1 + (hz.taxOrdinaryPct || 0), kg = 1 + (hz.taxCapGainsPct || 0); R.ord[r] *= k; R.potOrd[r] *= k; R.cg[r] *= kg; R.potCg[r] *= kg; }
      else { R.ord[r] = hz.taxOrdinaryPct || 0; R.potOrd[r] = hz.taxOrdinaryPct || 0; R.cg[r] = hz.taxCapGainsPct || 0; R.potCg[r] = hz.taxCapGainsPct || 0; }
    }

    /* =====================================================================
       E4 account ledgers
       ===================================================================== */
    const OUT = ['start', 'dep', 'wd', 'boy', 'fee', 'gro', 'tax', 'taxLife', 'end', 'basis', 'ug', 'spend', 'ord', 'gain', 'nw', 'pot', 'item', 'inc', 'atRisk', 'qp',
      'db', 'ndb', 'est', 'borrow', 'credit', 'liab', 'rmd', 'surr', 'sale', 'match', 'wdReq', 'loanBal', 'pay', 'bonusC', 'depSum', 'rmdUsed', 'line',
      'ordG', 'gainPart', 'basisAvail', 'excess', 'illSurr', 'illDb', 'interest', 'exp', 'taxExp', 'payroll', 'avail'];
    const RESET = ['dep', 'wd', 'boy', 'fee', 'gro', 'ord', 'gain', 'item', 'inc', 'atRisk', 'qp', 'db', 'borrow', 'rmd', 'sale', 'spend', 'tax', 'taxLife', 'pay', 'ordG', 'gainPart', 'excess', 'interest', 'exp', 'taxExp', 'ndb'];
    function tankOf(rec) {
      if (INVEST[rec.type]) { if (rec.mcp) return 'house'; return rec.risk === 'low' ? 'safe' : 'risk'; }
      if (rec.type === 'property') return rec.residence ? 'house' : (rec.risk === 'low' ? 'safe' : 'risk');
      if (rec.type === 'loan' || rec.type === 'credit') return 'debt';
      if (rec.type === 'pli' || rec.type === 'term' || rec.type === 'note') return 'safe';
      if (rec.type === 'income') return 'income';
      return 'none';
    }
    function makeAcct(X, rec, internal) {
      const A = { rec, type: rec.type, id: rec.id, name: rec.name || '', internal: !!internal, ow: X.own(rec) };
      OUT.forEach((k) => { A[k] = F64(X.Y); });
      A.baseC = F64(X.Y); A.baseW = F64(X.Y); A.extraC = F64(X.Y); A.fundDep = F64(X.Y); A.fundWd = F64(X.Y); A.ret = F64(X.Y); A.feeR = F64(X.Y); A.gift = F64(X.Y);
      A.rmdOn = !!rec.enforceRMD;
      A.tank = tankOf(rec);
      A.accessible = rec.accessible !== false;
      A.excluded = !!rec.excluded;
      A.ill = (rec.type === 'annuity' || rec.type === 'pli') && rec.useIll && Array.isArray(rec.ill) && rec.ill.length ? rec.ill : null;
      if ((rec.type === 'annuity' || rec.type === 'pli') && rec.useIll && !A.ill) X.missingIll = true;
      schedules(X, A);
      return A;
    }
    /** contribution windows and growth, company match, actions, extra savings, returns, fees, hazards */
    function schedules(X, A) {
      const rec = A.rec, Y = X.Y, ow = A.ow, o = X.o, hz = o.hazard;
      if (INVEST[rec.type]) {
        const g = rec.contribInfl == null ? X.infl : rec.contribInfl;
        const c0 = X.sRow(rec.cStart, ow, false), c1 = X.sRow(rec.cEnd, ow, true);
        A.win0 = c0; A.win1 = c1;
        for (let r = Math.max(0, c0); r <= Math.min(c1, Y - 1); r++) {
          A.baseC[r] = (rec.contrib || 0) * Math.pow(1 + g, r);
          if (rec.match) A.match[r] = rec.match * Math.pow(1 + g, r);
        }
        /* extra savings (E10 save more; fgps23 C3.2 and C3.3) */
        const es = o.extraSavings;
        if (es && !rec.mcp && !A.ill && A.tank !== 'house') {
          const amt = es.perAccount ? (+es.perAccount[rec.id] || 0) : (es.A || 0) * (es.pct && es.pct[rec.id] != null ? es.pct[rec.id] : (rec.extraPct == null ? 1 : rec.extraPct));
          if (amt) {
            if (es.once) A.extraC[0] += amt;
            else for (let r = Math.max(0, c0); r <= Math.min(c1, Y - 1); r++) A.extraC[r] += amt * Math.pow(1 + g, r - Math.max(0, c0));
          }
        }
        for (let r = 0; r < Y; r++) { A.ret[r] = rec.ret || 0; A.feeR[r] = rec.fee || 0; }
        /* market history (E2.3 / E2.5) */
        const G = X.G;
        if (G.useMarketHistory && !A.ill && (rec.useMH || rec.useGlobalMH)) {
          const own = rec.useMH && !rec.useGlobalMH && rec.market;
          let ser = own ? marketSeries(rec.market, rec.mhStart, rec.mhEnd) : (rec.useMH || rec.useGlobalMH ? marketSeries(G.globalMarket, G.mhStartYear, G.mhEndYear) : null);
          if (ser && ser.length && (own || rec.useMH)) {
            if (rec.type === 'annuity' && rec.limits) ser = applyLimits(rec, ser);
            const off = (((G.marketOffset || 0) % ser.length) + ser.length) % ser.length;
            for (let r = 0; r < Y; r++) A.ret[r] = ser[(off + r) % ser.length];
            A.mh = true;
          }
        }
        if (o.extraPoints && A.tank !== 'house' && !A.ill) for (let r = 0; r < Y; r++) A.ret[r] += o.extraPoints;
        if (hz && hz.type === 'market' && rec.risk === 'high') { const r = (hz.clientStartAge != null ? hz.clientStartAge : X.a0) - X.a0; if (r >= 0 && r < Y) A.ret[r] = hz.marketReturnPct; }
      }
      /* actions, in list order, after the base schedule */
      (rec.actions || []).forEach((ac) => {
        const r0 = Math.max(0, (ac.startAge != null ? ac.startAge : ow.age) - ow.age), n = Math.max(1, ac.years || 1);
        for (let k = 0; k < n && r0 + k < Y; k++) {
          const r = r0 + k;
          const amt = Array.isArray(ac.amounts) && ac.amounts.length ? (+ac.amounts[Math.min(k, ac.amounts.length - 1)] || 0) : (ac.amount || 0) * Math.pow(1 + (ac.growth || 0), k);
          const mod = (arr) => { if (ac.modifier === 'add') arr[r] += amt; else if (ac.modifier === 'subtract') arr[r] = Math.max(0, arr[r] - amt); else arr[r] = amt; };
          if (ac.mode === 'contribution') mod(A.baseC);
          else if (ac.mode === 'withdrawal') mod(A.baseW);
          else if (ac.mode === 'ror') A.ret[r] = ac.rate || 0;
          else if (ac.mode === 'fee') A.feeR[r] = ac.rate || 0;
          else if (ac.mode === 'inflow') { A.inflowMod = A.inflowMod || {}; A.inflowMod[r] = { amt, modifier: ac.modifier || 'set' }; }
          else if (ac.mode === 'creditLine') { A.lineMod = A.lineMod || {}; A.lineMod[r] = amt; }
          else if (ac.mode === 'draw') { A.drawMod = A.drawMod || {}; A.drawMod[r] = (A.drawMod[r] || 0) + amt; }
          else if (ac.mode === 'paydown') { A.paydown = A.paydown || {}; A.paydown[r] = (A.paydown[r] || 0) + amt; }
        }
      });
      /* contributions stop after the owner's life expectancy row (joint: after the joint row) */
      for (let r = Math.max(0, ow.leRow); r < Y; r++) { A.baseC[r] = 0; A.extraC[r] = 0; A.match[r] = 0; }
      /* disability hazard (E9): the disabled owner's contributions stop in the hazard years */
      A.disabled = F64(Y);
      if (hz && hz.type === 'disability') {
        const who = ow.who === 'spouse' ? 'spouse' : 'client';
        if (who === 'spouse' ? hz.spouseActive : hz.clientActive) {
          const st = who === 'spouse' ? hz.spouseStartAge : hz.clientStartAge, en = who === 'spouse' ? hz.spouseEndAge : hz.clientEndAge;
          const age0 = who === 'spouse' ? X.s0 : X.a0;
          for (let r = Math.max(0, st - age0); r <= Math.min(Y - 1, en - age0); r++) { A.baseC[r] = 0; A.extraC[r] = 0; A.match[r] = 0; A.disabled[r] = 1; }
        }
      }
    }
    const contribution = (A, r) => (r >= A.ow.leRow ? 0 : A.baseC[r] + A.extraC[r]) + A.fundDep[r];
    function splitGain(method, W, avail, basisAvail, basisFirst) {
      if (W <= 0) return 0;
      const ug = Math.max(0, avail - basisAvail);
      if (basisFirst || method === 'fifo') return Math.max(0, W - Math.max(0, basisAvail));
      if (method === 'lifo') return Math.min(W, ug);
      return avail > 0 ? W * ug / avail : 0;
    }
    function rmdFor(X, A, r, avail) {
      const rec = A.rec, ow = A.ow;
      const qualified = rec.type === 'tdbt' || (rec.type === 'tdat' && rec.hasRMD) || (rec.type === 'annuity' && rec.qualified && !rec.roth);
      if (!qualified || avail <= 0) return 0;
      let age = ow.age + r, other = ow.otherAge != null ? ow.otherAge + r : null, base = ow.age;
      if (r >= ow.leRow && other != null) { age = other; base = ow.otherAge; other = null; }
      const start = rmdStartAge(X.y0 - base - 1);
      if (start == null || age + 1 < start) return 0;
      const d = rmdDivisor(age + 1, other != null ? other + 1 : null, !!ow.joint && other != null && age - other >= 11);
      return d ? Math.round(avail / d) : 0;
    }

    /* phase 1 of a row: balances, withdrawals, growth, income (nothing that depends on the row's tax rates) */
    function pre(X, A, r) {
      for (let i = 0; i < RESET.length; i++) A[RESET[i]][r] = 0;
      if (INVEST[A.type]) preInvest(X, A, r); else if (PRE[A.type]) PRE[A.type](X, A, r);
    }
    function preInvest(X, A, r) {
      const rec = A.rec, t = A.type, ill = A.ill;
      const irow = ill ? ill[Math.min(r, ill.length - 1)] : null;
      let start = r ? A.end[r - 1] : (ill ? Math.max(0, (+ill[0].contractValue || 0) - (+ill[0].contribution || 0) + (+ill[0].withdrawal || 0)) || (rec.balance || 0) : (rec.balance || 0));
      start += A.gift[r];
      A.start[r] = start;
      const c = ill ? (+irow.contribution || 0) + A.fundDep[r] : contribution(A, r);
      const m = A.match[r] || 0;
      const bonus = t === 'annuity' ? c * (rec.bonusPct || 0) : 0;
      A.bonusC[r] = (r ? A.bonusC[r - 1] : 0) + bonus;
      const avail = start + c + m + bonus;
      A.avail[r] = avail;
      const basisFull = t === 'tdbt' || (t === 'annuity' && rec.qualified && !rec.roth);
      const basis0 = r ? A.basis[r - 1] : (basisFull ? 0 : (rec.costBasis || 0));
      const basisAvail = basisFull ? 0 : basis0 + c;
      A.basisAvail[r] = basisAvail;
      A.rmd[r] = rmdFor(X, A, r, avail);
      let W = ill ? (+irow.withdrawal || 0) + A.fundWd[r] : A.baseW[r] + A.fundWd[r];
      if (A.rmdOn && A.rmd[r] > 0) {
        const last = r ? A.rmdUsed[r - 1] : 0;
        W = W === 0 || W === last ? A.rmd[r] : Math.max(W, A.rmd[r]);
        A.rmdUsed[r] = A.rmd[r];
      } else A.rmdUsed[r] = 0;
      A.wdReq[r] = W;
      const rider = t === 'annuity' && (rec.incomeRider || rec.ltcRider);
      if (!rider) W = Math.max(0, Math.min(W, avail));
      const roth = (t === 'tdat' || t === 'annuity') && rec.roth;
      if (t === 'tdat' && roth && !rec.allowEarly && A.ow.age + r < 59) W = Math.min(W, Math.max(0, basisAvail));
      const boy = Math.max(0, avail - W);
      const excess = rider ? Math.max(0, W - avail) : 0;
      const fee = boy * (A.feeR[r] || 0);
      let gro;
      if (ill) {
        gro = (+irow.contractValue || 0) - (boy - fee);
        A.illSurr[r] = irow.surrenderValue != null && irow.surrenderValue !== '' ? +irow.surrenderValue : -1;
        A.illDb[r] = irow.deathBenefit != null && irow.deathBenefit !== '' ? +irow.deathBenefit : -1;
      } else if (t === 'annuity' && rec.simple) {
        A.depSum[r] = (r ? A.depSum[r - 1] : (rec.balance || 0)) + c - Math.min(W, avail);
        gro = Math.max(0, Math.min(A.depSum[r], boy - fee)) * A.ret[r];
      } else gro = (boy - fee) * A.ret[r];
      A.dep[r] = c; A.match[r] = m; A.wd[r] = W; A.boy[r] = boy; A.fee[r] = fee; A.gro[r] = gro; A.excess[r] = excess;
      const gp = basisFull ? 0 : splitGain(rec.basisMethod, Math.min(W, avail), avail, basisAvail, roth);
      A.gainPart[r] = gp;
      if (t === 'taxable') { const og = gro * (rec.ordPct == null ? 1 : rec.ordPct); A.ordG[r] = og; A.ord[r] = Math.max(0, og); A.gain[r] = gp; }
      else if (basisFull) A.ord[r] = W - c;
      else if (t === 'tdat') A.ord[r] = roth && A.ow.age + r >= 59 ? 0 : gp;
      else if (t === 'annuity') A.ord[r] = roth ? 0 : gp + excess;
      if (t === 'tdbt' || t === 'tdat' || (t === 'annuity' && rec.qualified)) A.qp[r] = c + m;
      if (t === 'annuity' && rec.wdAsInflow) A.inc[r] = W;
    }
    function postInvest(X, A, r) {
      const rec = A.rec, t = A.type, R = X.rate, ordRate = R.ord[r], cg = R.cg[r];
      const c = A.dep[r], W = A.wd[r], boy = A.boy[r], fee = A.fee[r], gro = A.gro[r], age = A.ow.age + r;
      let tax = 0, taxLife = 0, end, basisEnd, spend, nw, pot, ug;
      if (t === 'taxable') {
        const og = A.ordG[r];
        const taxG = Math.max(0, R2(og * ordRate) - (rec.feesDeductible ? R2(fee * ordRate) : 0));
        const fromLife = rec.payTaxFromLifestyle !== false;
        end = N0(boy + gro - fee - (fromLife ? 0 : taxG));
        const gainsTax = R2(A.gainPart[r] * cg);
        basisEnd = A.basisAvail[r] + og - taxG + (fromLife ? taxG : 0) - (W - A.gainPart[r]) - fee;
        tax = gainsTax + taxG; taxLife = fromLife ? taxG : 0;
        spend = W - gainsTax - taxLife;
        ug = Math.max(0, end - basisEnd); nw = end - R2(ug * cg); pot = R2(ug * R.potCg[r]);
      } else if (t === 'taxfree') {
        end = N0(boy + gro - fee); basisEnd = 0; spend = W; nw = end; pot = 0; ug = 0;
      } else {
        const roth = (t === 'tdat' || t === 'annuity') && rec.roth;
        const full = t === 'tdbt' || (t === 'annuity' && rec.qualified && !roth);
        const pen = rec.earlyPenalty && age < 59 ? 0.10 : 0;
        const rate = ordRate + pen;
        end = N0(boy + gro - fee);
        let taxW, save = 0;
        if (full) { taxW = R2(W * rate); save = c * ordRate; }
        else if (roth && (t === 'annuity' ? rec.qualified : age >= 59)) taxW = 0;
        else taxW = R2((A.gainPart[r] + A.excess[r]) * rate);
        tax = taxW - save;
        const surrPct = t === 'annuity' ? (rec.surrenderPct || 0) : 0;
        spend = W * (1 - surrPct) - taxW + save;
        basisEnd = full ? 0 : Math.max(0, A.basisAvail[r] - (Math.min(W, A.avail[r]) - A.gainPart[r]));
        ug = full ? end : Math.max(0, end - basisEnd);
        nw = end - (roth ? 0 : ug * ordRate);
        pot = roth ? 0 : ug * (R.potOrd[r] + pen);
      }
      A.end[r] = end; A.basis[r] = basisEnd; A.ug[r] = ug; A.tax[r] = tax; A.taxLife[r] = taxLife; A.spend[r] = spend; A.nw[r] = nw; A.pot[r] = pot;
      if (t === 'annuity') {
        A.surr[r] = A.ill && A.illSurr[r] >= 0 ? A.illSurr[r] : Math.max((end - A.bonusC[r]) * (1 - (rec.surrenderPct || 0)), 0);
        A.db[r] = A.ill && A.illDb[r] >= 0 ? A.illDb[r] : end;
        A.ndb[r] = Math.max(0, A.db[r] - A.surr[r]);
        A.est[r] = Math.max(end - pot, A.db[r]);
        if (rec.wdAsInflow) A.inc[r] = W;
      } else { A.surr[r] = end; A.est[r] = end - pot; }
      /* major-purchase accounts spend their withdrawals as an itemized expense, not lifestyle */
      if (A.tank === 'house' && rec.autoExpense !== false) A.item[r] += spend;
    }
    const PRE = {
      pli(X, A, r) {
        const rec = A.rec, ow = A.ow, ini = Math.max(0, X.sRow(rec.init, ow, false));
        const loanPrev = r ? A.loanBal[r - 1] : 0;
        A.start[r] = r ? A.surr[r - 1] : 0;
        if (r < ini || r > ow.leRow) { A.end[r] = 0; A.surr[r] = 0; A.loanBal[r] = r > ow.leRow ? 0 : loanPrev; return; }
        const row = A.ill ? A.ill[Math.min(r, A.ill.length - 1)] : { premium: rec.premium, withdrawal: 0, accumulationValue: rec.av, cashSurrenderValue: rec.csv, deathBenefit: rec.db };
        if (r === ow.leRow) {
          /* death of the insured: the death benefit less any loan is paid out (income-tax-free in this model) */
          const payout = Math.max(0, (+row.deathBenefit || 0) - loanPrev);
          A.pay[r] = payout; A.wd[r] = payout; A.end[r] = 0; A.surr[r] = 0; A.loanBal[r] = 0;
          return;
        }
        let prem = +row.premium || 0;
        if (A.disabled[r] && rec.disabilityRider) prem = 0;
        const loan = +row.withdrawal || 0;
        A.dep[r] = prem; A.wd[r] = loan;
        A.end[r] = +row.accumulationValue || 0; A.surr[r] = +row.cashSurrenderValue || 0; A.db[r] = +row.deathBenefit || 0;
        A.loanBal[r] = loanPrev + loan;
      },
      property(X, A, r) {
        const rec = A.rec, ow = A.ow, ini = Math.max(0, X.sRow(rec.init, ow, false));
        const saleRow = rec.sell ? Math.max(ini, (rec.saleAge != null ? rec.saleAge : ow.age) - ow.age) : Infinity;
        if (r < ini || r > saleRow) { A.start[r] = 0; A.end[r] = 0; A.basis[r] = 0; return; }
        const start = r === ini ? (rec.value || 0) : A.end[r - 1];
        const basis = r === ini ? (rec.costBasis || 0) : A.basis[r - 1];
        A.start[r] = start; A.basis[r] = basis;
        if (r === ini) A.dep[r] = rec.cashRequired || 0;
        if (r === saleRow) {
          const proceeds = rec.saleProceeds || start;
          A.sale[r] = proceeds; A.wd[r] = proceeds; A.gain[r] = Math.max(proceeds - basis - (rec.exclusion || 0), 0); A.end[r] = 0;
          return;
        }
        A.boy[r] = start; A.gro[r] = start * (rec.appr || 0); A.end[r] = start + A.gro[r];
      },
      note(X, A, r) {
        const rec = A.rec, ini = Math.max(0, X.sRow(rec.init, A.ow, false));
        let bal = r < ini ? 0 : (r === ini ? (rec.balance || 0) : A.end[r - 1]);
        A.start[r] = bal;
        if (bal <= 0) { A.end[r] = 0; return; }
        let interest = 0, pay = 0;
        for (let m = 0; m < 12 && bal > 0; m++) {
          const i = R2(bal * (rec.rate || 0) / 12);
          let p = rec.pmt || 0;
          if (p >= bal + i) p = bal + i;
          interest += i; pay += p; bal = N0(bal + i - p);
        }
        A.interest[r] = interest; A.ord[r] = interest; A.wd[r] = pay; A.end[r] = bal;
      },
      loan(X, A, r) {
        const rec = A.rec, ow = A.ow, ini = Math.max(0, X.sRow(rec.init, ow, false));
        if (r < ini) { A.start[r] = 0; A.end[r] = 0; A.credit[r] = 0; A.liab[r] = 0; A.line[r] = 0; return; }
        let bal = r === ini ? (rec.balance || 0) : A.end[r - 1];
        A.start[r] = bal;
        let draw = 0;
        if (r === ini && rec.proceeds) { bal += rec.proceeds; draw += rec.proceeds; }
        const line = A.lineMod && A.lineMod[r] != null ? A.lineMod[r] : (r === ini ? (rec.creditLine || 0) : A.line[r - 1]);
        A.line[r] = line;
        const room = () => Math.max(0, line - bal);
        if (A.drawMod && A.drawMod[r]) { const d = Math.min(A.drawMod[r], room()); bal += d; draw += d; }
        if (A.fundWd[r] > 0) { const d = Math.min(A.fundWd[r], room()); bal += d; draw += d; }
        /* principal paydowns at the start of the year (actions, pay-off age, pay-off at death) */
        let paydown = (A.paydown && A.paydown[r]) || 0;
        if (rec.payOff && rec.payOffAge != null && r === rec.payOffAge - ow.age) paydown = bal;
        if (rec.payOffAtDeath && r === ow.leRow) paydown = bal;
        paydown = Math.min(paydown, bal); bal -= paydown;
        let interest = 0, pay = paydown;
        for (let m = 0; m < 12; m++) {
          let p = rec.pmt || 0;
          if (p < 0) { const d = Math.min(-p, room()); bal += d; draw += d; continue; }
          if (bal <= 0) break;
          const i = R2(bal * (rec.rate || 0) / 12);
          if (p >= bal + i) p = bal + i;
          interest += i; pay += p; bal = N0(bal + i - p);
        }
        A.borrow[r] = draw; A.wd[r] = draw; A.item[r] = pay; A.interest[r] = interest;
        A.end[r] = bal; A.liab[r] = bal; A.credit[r] = Math.max(0, line - bal);
        if (rec.deductible) A.ord[r] = -interest;
      },
      credit(X, A, r) {
        const rec = A.rec;
        let bal = r ? A.end[r - 1] : (rec.balance || 0), interest = 0, pay = 0;
        A.start[r] = bal;
        for (let m = 0; m < 12; m++) {
          const i = (rec.rate || 0) / 12 * (rec.grace === false ? bal + (rec.charges || 0) : bal);
          bal += (rec.charges || 0) + i; interest += i;
          let p = rec.payMin ? Math.max(0.025 * bal, 10) : (rec.pmt || 0);
          p = Math.min(p, bal); pay += p; bal = N0(bal - p);
        }
        A.item[r] = pay; A.end[r] = bal; A.liab[r] = bal; A.interest[r] = interest;
        if (bal > 1000000) X.creditWarning = true;
        if (rec.deductible) A.ord[r] = -interest;
      },
      income(X, A, r) {
        const rec = A.rec, ow = A.ow, hz = X.o.hazard;
        if (A.custom) { const amt = A.custom[r] || 0; A.inc[r] = amt; return; }
        const g = rec.infl == null ? X.infl : rec.infl;
        const surv = rec.survivorPct == null ? 0.5 : rec.survivorPct;
        const s0 = X.sRow(rec.iStart, ow, false), e = X.sRow(rec.iEnd, ow, true);
        let endRow = Math.min(e + 1, ow.leRow);
        if (rec.survivor) endRow = Math.min(e + 1, Math.max(ow.leRow, ow.survRow));
        else if (rec.ss && X.sp && ow.who !== 'joint') endRow = Math.min(endRow, ow.survRow);
        let amt = r >= Math.max(0, s0) && r < endRow ? (rec.amount || 0) * Math.pow(1 + g, r) : 0;
        if (rec.survivor && r >= ow.leRow) amt *= surv;
        /* premature death before benefits begin: the survivor's benefit starts at max(death + 1, 62), reduced 8% a year before the planned start */
        if (rec.ss && rec.survivor && hz && hz.type === 'death' && X.sp && ow.who !== 'joint' && ow.leRow <= s0) {
          const st = Math.max(ow.leRow, 62 - ow.otherAge);
          amt = r >= st && r < endRow ? (rec.amount || 0) * Math.pow(1 + g, r) * Math.max(0, 1 - 0.08 * Math.max(0, s0 - st)) * surv : 0;
        }
        if (A.inflowMod && A.inflowMod[r]) { const md = A.inflowMod[r]; amt = md.modifier === 'add' ? amt + md.amt : md.modifier === 'subtract' ? Math.max(0, amt - md.amt) : md.amt; }
        if (rec.wages && A.disabled[r]) amt = 0;
        if (hz && hz.type === 'disability' && rec.wages) {
          const who = ow.who === 'spouse' ? 'spouse' : 'client', age0 = who === 'spouse' ? X.s0 : X.a0;
          const st = who === 'spouse' ? hz.spouseStartAge : hz.clientStartAge, en = who === 'spouse' ? hz.spouseEndAge : hz.clientEndAge;
          if ((who === 'spouse' ? hz.spouseActive : hz.clientActive) && r >= st - age0 && r <= en - age0) amt = 0;
        }
        A.inc[r] = amt;
        A.ord[r] = amt * (rec.taxablePct == null ? 1 : rec.taxablePct);
        A.atRisk[r] = r >= ow.leRow ? 0 : (rec.survivor ? amt * (1 - surv) : amt);
      },
      expense(X, A, r) {
        const rec = A.rec, ow = A.ow, g = rec.infl == null ? X.infl : rec.infl;
        const s0 = X.sRow(rec.iStart, ow, false), e = X.sRow(rec.iEnd, ow, true);
        const amt = r >= s0 && r <= e ? (rec.amount || 0) * Math.pow(1 + g, r) : 0;
        A.exp[r] = amt;
        if (rec.usage === 'taxes') A.taxExp[r] = amt; else A.item[r] = amt;
        if (rec.deductible) A.ord[r] = -amt;
      },
      term(X, A, r) {
        const rec = A.rec, ow = A.ow, hz = X.o.hazard;
        const s0 = X.sRow(rec.iStart, ow, false), e = X.sRow(rec.iEnd, ow, true);
        const on = r >= s0 && r <= e && r < ow.leRow;
        const cola = rec.cola == null ? X.infl : rec.cola;
        const benefit = (rec.benefit || 0) * (rec.policyType === 'disability' ? Math.pow(1 + cola, r) : 1);
        A.item[r] = on ? (rec.premium || 0) * Math.pow(1 + (rec.premInfl || 0), r - Math.max(0, s0)) : 0;
        if (rec.policyType === 'life') {
          if (on) A.db[r] = benefit;
          if (r === ow.leRow && ow.leRow >= s0 && ow.leRow <= e + 1) A.pay[r] = rec.benefit || 0;
        } else if (hz) {
          const who = ow.who === 'spouse' ? 'spouse' : 'client', age0 = who === 'spouse' ? X.s0 : X.a0;
          const act = who === 'spouse' ? hz.spouseActive : hz.clientActive;
          const st = (who === 'spouse' ? hz.spouseStartAge : hz.clientStartAge) - age0;
          const en = ((who === 'spouse' ? hz.spouseEndAge : hz.clientEndAge) == null ? st + age0 : (who === 'spouse' ? hz.spouseEndAge : hz.clientEndAge)) - age0;
          const amt = (who === 'spouse' ? hz.spouseAmount : hz.clientAmount) || 0;
          if (act && rec.policyType === 'disability' && hz.type === 'disability' && r >= st && r <= en && r >= s0 && r <= e) { A.pay[r] = benefit; A.item[r] = 0; }
          if (act && rec.policyType === 'ltc' && hz.type === 'ltc' && r >= st && r <= en) A.pay[r] = Math.min(benefit, amt * Math.pow(1 + X.infl, r));
          if ((rec.policyType === 'umbrella' || rec.policyType === 'pc') && hz.type === 'liability' && r === st && act) A.pay[r] = Math.min(rec.benefit || 0, amt);
        }
      },
      hazexp(X, A, r) { A.item[r] = A.rec.rows[r] || 0; }
    };
    function post(X, A, r) {
      if (INVEST[A.type]) return postInvest(X, A, r);
      const R = X.rate, ordRate = R.ord[r], cg = R.cg[r], rec = A.rec;
      switch (A.type) {
        case 'pli':
          A.spend[r] = A.wd[r]; A.nw[r] = A.surr[r]; A.ndb[r] = Math.max(0, A.db[r] - A.surr[r]); A.est[r] = rec.ilit ? 0 : A.db[r];
          break;
        case 'property': {
          const gainsTax = R2(A.gain[r] * cg);
          A.tax[r] = gainsTax; A.spend[r] = A.sale[r] ? A.sale[r] - gainsTax : 0;
          const ug = Math.max(0, A.end[r] - A.basis[r] - (rec.exclusion || 0));
          A.ug[r] = ug; A.nw[r] = A.end[r] - R2(ug * cg); A.pot[r] = R2(ug * R.potCg[r]); A.surr[r] = A.end[r]; A.est[r] = A.nw[r];
          break;
        }
        case 'note': {
          const tx = A.interest[r] * ordRate;
          A.tax[r] = tx; A.spend[r] = A.wd[r] - tx; A.nw[r] = A.end[r]; A.surr[r] = A.end[r]; A.est[r] = A.end[r];
          break;
        }
        case 'loan': case 'credit': {
          const save = rec.deductible ? ordRate * A.interest[r] : 0;
          A.tax[r] = -save; A.spend[r] = (A.borrow[r] || 0) + save; A.nw[r] = -A.end[r]; A.est[r] = -A.end[r];
          break;
        }
        case 'income': {
          if (A.custom) { A.spend[r] = A.inc[r]; break; }
          const base = Math.max(0, A.inc[r] - (rec.deductible || 0));
          const tx = R2(base * (rec.taxablePct == null ? 1 : rec.taxablePct) * ordRate) + A.payroll[r];
          A.tax[r] = tx; A.spend[r] = A.inc[r] - tx;
          break;
        }
        case 'expense': {
          const save = rec.deductible ? A.exp[r] * ordRate : 0;
          A.tax[r] = A.taxExp[r] - save; A.spend[r] = -A.taxExp[r] + save;
          break;
        }
        case 'term': A.spend[r] = A.pay[r]; A.ndb[r] = A.db[r]; break;
        default: break;
      }
    }

    /* ---------- E3.2 automatic tax rates for one row ---------- */
    function autoRates(X, r) {
      const f = X.fed, G = X.G, R = X.rate, grow = Math.pow(1 + X.infl, r), year = X.y0 + r;
      const chosen = STATUS[G.filingStatus] || 'mfj';
      const status = X.sp && r >= X.firstDie ? 'single' : chosen;
      let O = 0, Gn = 0, deferred = 0, unreal = 0;
      for (const A of X.accts) {
        if (A.excluded) continue;
        O += A.ord[r]; Gn += A.gain[r];
        const pend = A.boy[r] + A.gro[r] - A.fee[r];
        if (A.type === 'tdbt' || (A.type === 'annuity' && A.rec.qualified && !A.rec.roth)) deferred += pend;
        else if ((A.type === 'tdat' || A.type === 'annuity') && !A.rec.roth) deferred += Math.max(0, pend - A.basisAvail[r]);
        else if (A.type === 'taxable') unreal += Math.max(0, pend - A.basisAvail[r]);
        else if (A.type === 'property') unreal += Math.max(0, A.end[r] - A.basis[r] - (A.rec.exclusion || 0));
      }
      const age = X.a0 + r, sage = X.sp ? X.s0 + r : null, both = X.sp && r < X.firstDie;
      let boxes = (age > 64 ? 1 : 0) + (G.clientBlind ? 1 : 0) + (both ? (sage > 64 ? 1 : 0) + (G.spouseBlind ? 1 : 0) : 0);
      const maxB = (f.additionalStdDeductionMaxBoxes || {})[status];
      if (maxB != null) boxes = Math.min(boxes, maxB);
      const addl = (f.additionalStdDeduction || {})[status === 'mfj' || status === 'mfs' ? 'married' : 'unmarried'] || 0;
      const deduction = G.itemize ? (G.deductions || 0) * grow : ((f.standardDeduction[status] || 0) + addl * boxes) * grow;
      let senior = 0;
      const sd = f.seniorDeduction;
      if (sd && year >= sd.firstYear && year <= sd.lastYear && status !== 'mfs') {
        const n = (age + 1 > 64 ? 1 : 0) + (both && sage + 1 > 64 ? 1 : 0);
        const joint = status === 'mfj';
        senior = Math.max(0, n * sd.amount - sd.phaseoutRate * (joint ? 2 : 1) * Math.max(0, O + Gn - (joint ? sd.phaseoutStart.mfj : sd.phaseoutStart.single)));
      }
      const TI = Math.max(0, Math.round(O + Gn - deduction - senior)), gains = Math.max(0, Math.round(Gn));
      const t = capGainsTax(f, status, TI, gains, grow);
      const state = Math.round(TI) * (G.stateTaxRate || 0), Oi = Math.round(O);
      R.ord[r] = Oi > 0 ? Math.round((t.ordTax + state) / Oi * 1e5) / 1e5 : 0;
      R.cg[r] = gains > 0 ? Math.round(t.gainsTax / gains * 1e5) / 1e5 : 0;
      const br = bracketAt(f.brackets[status], TI, grow);
      R.marg[r] = br.rate; R.head[r] = br.head;
      if (deferred + unreal > 0) {
        const pt = capGainsTax(f, status, deferred + unreal, unreal, grow);
        R.potOrd[r] = deferred > 0 ? (pt.ordTax + deferred * (G.stateTaxRate || 0)) / deferred : R.ord[r];
        R.potCg[r] = unreal > 0 ? (pt.gainsTax + unreal * (G.stateTaxRate || 0)) / unreal : R.cg[r];
      } else { R.potOrd[r] = R.ord[r]; R.potCg[r] = R.cg[r]; }
      taxHazard(X, r);
      X.taxInfo = X.taxInfo || [];
      X.taxInfo[r] = { status, deduction, senior, TI, fedTax: t.total, state };
    }
    /** E3.4 payroll taxes on wages, per person in account order */
    function payroll(X, r) {
      const f = DATA().fed;
      for (const A of X.accts) if (A.type === 'income') A.payroll[r] = 0;
      if (!f || !f.ficaRates) return;
      const fr = f.ficaRates, grow = Math.pow(1 + X.infl, r);
      const base = (fr.ssWageBase || (DATA().ss || {}).wageBase || 0) * grow;
      const thr = ((X.sp ? fr.additionalMedicareThreshold.mfj : fr.additionalMedicareThreshold.single) || 0) * 1;
      const prior = { client: 0, spouse: 0 };
      for (const A of X.accts) {
        if (A.type !== 'income' || !A.rec.wages || A.custom) continue;
        const who = A.ow.who === 'spouse' ? 'spouse' : 'client', w = A.inc[r];
        if (!w) continue;
        const ss = (fr.ssEmployee || 0) * Math.min(w, Math.max(base - prior[who], 0));
        const med = (fr.medicareEmployee || 0) * w + (fr.additionalMedicare || 0) * Math.max(0, w - Math.max(0, thr - prior[who]));
        A.payroll[r] = (ss + med) * (A.rec.selfEmployed ? 2 : 1);
        prior[who] += w;
      }
    }

    /* ---------- row driver ---------- */
    function calcRow(X, r, only) {
      if (only && !X.auto) { pre(X, only, r); post(X, only, r); return; }
      for (const A of X.accts) pre(X, A, r);
      if (X.payrollOn) payroll(X, r);
      if (X.auto) autoRates(X, r);
      for (const A of X.accts) post(X, A, r);
    }
    function calcFrom(X, r0, only) { for (let r = Math.max(0, r0); r < X.Y; r++) calcRow(X, r, only); }
    function rowFlows(X, r) {
      let spend = 0, dep = 0, item = 0;
      for (const A of X.accts) { if (A.excluded) continue; spend += A.spend[r]; dep += A.dep[r]; item += A.item[r]; }
      return { spend, dep, item, actual: spend - dep - item };
    }
    const D = (X, r) => N0(rowFlows(X, r).actual - X.target[r]);

    /* ---------- E5 lifestyle target ---------- */
    function setTargets(X) {
      const S = X.S, o = X.o, Y = X.Y, hz = o.hazard;
      const i = S.maintainCurrentLifestyle || S.inflateLifestyle ? X.infl : 0;
      let T = S.maintainCurrentLifestyle ? rowFlows(X, 0).actual : (S.desiredRetirementIncome || 0);
      if (o.startTarget != null) T = o.startTarget;
      X.T0 = T;
      const adjRow = S.adjustLifestyle ? (S.adjustAtAge || 80) - X.a0 : -1;
      let growing = true;
      X.target = F64(Y);
      for (let r = 0; r < Y; r++) {
        if (S.maintainCurrentLifestyle && !S.saveExcess && S.recalcLifestyleAtRetirement && r === X.retRow && r > 0) T = Math.max(T, rowFlows(X, r - 1).actual * (1 + i));
        if (o.retireTarget != null && r === X.retRow) T = o.retireTarget;
        if (r === adjRow) { T *= S.adjustPct == null ? 1 : S.adjustPct; if (!S.adjustInflated) growing = false; }
        X.target[r] = T;
        let g = growing ? i : 0;
        if (hz && hz.type === 'inflation' && hz.clientActive !== false) {
          const st = hz.clientStartAge - X.a0, en = (hz.clientEndAge != null ? hz.clientEndAge : hz.clientStartAge) - X.a0;
          if (r + 1 >= st && r + 1 <= en) g = hz.inflationPct || 0;
        }
        T *= 1 + g;
      }
      if (X.sp) {
        for (let r = X.firstDie; r < X.jointRow && r < Y; r++) X.target[r] *= S.survivorLifestylePct == null ? 1 : S.survivorLifestylePct;
        for (let r = X.jointRow; r < Y; r++) X.target[r] = 0;
      } else for (let r = X.cLErow; r < Y; r++) X.target[r] = 0;
    }

    /* ---------- one-row secant search on one account (step under $0.25, at most 99 steps) ---------- */
    function secantRow(X, A, r, field, x0, x1) {
      const set = (x) => { A[field][r] = Math.max(0, x); calcRow(X, r, A); return D(X, r); };
      let f0 = set(x0), f1 = set(x1);
      for (let k = 0; k < 99 && f1 !== 0; k++) {
        const den = f1 - f0;
        if (!isFinite(den) || den === 0) break;
        const step = f1 * (x1 - x0) / den;
        x0 = x1; f0 = f1; x1 = Math.max(0, x1 - step); f1 = set(x1);
        if (Math.abs(step) < 0.25) break;
      }
      return x1;
    }
    /* ---------- E6 funding solve ---------- */
    function fund(X) {
      const S = X.S, Y = X.Y;
      const src = X.sources.filter((s) => s.selected).map((s) => X.byId[s.accountId]).filter(Boolean);
      const target = X.saveTo;
      /* 1 */
      src.forEach((A) => { if (A.rec.enforceRMD) { A.rmdOn = false; for (let r = A.rmdRow; r < Y; r++) A.fundWd[r] = 0; } });
      calcFrom(X, 0);
      /* 2 */
      setTargets(X);
      const excess = () => {
        if (!target) return;
        for (let r = Math.max(0, target.win0); r <= Math.min(target.win1, Y - 1); r++) {
          const d = D(X, r);
          if (d > 0) { secantRow(X, target, r, 'fundDep', target.fundDep[r], target.fundDep[r] + d); calcFrom(X, r + 1, target); }
        }
      };
      const deathBenefits = () => {
        if (!target) return;
        X.accts.forEach((A) => {
          const r = A.ow.leRow;
          if (r < 0 || r >= Y) return;
          const amt = A.type === 'pli' ? A.pay[r] : (A.type === 'term' && A.rec.policyType === 'life' ? A.pay[r] : 0);
          if (amt > 0) { target.fundDep[r] += amt; calcFrom(X, r, target); }
        });
      };
      const withdraw = () => {
        const order = [X.dbAcct, X.sweep].filter(Boolean).concat(src.filter((A) => A !== X.sweep && A !== X.dbAcct));
        for (const A of order) {
          for (let r = 0; r < Y; r++) {
            const d = D(X, r);
            if (d >= 0) continue;
            if (A.type === 'loan') { if (A.credit[r] <= 1) continue; }
            else {
              if (A.start[r] + A.dep[r] + A.match[r] <= 1) continue;
              const age = X.a0 + r;
              if ((A.type === 'tdbt' || A.type === 'tdat') && !(A.rec.allowEarly || age > 58 || (A.type === 'tdat' && A.rec.roth))) continue;
            }
            const cur = A.fundWd[r];
            secantRow(X, A, r, 'fundWd', cur, Math.max(cur, A.rmd[r] - A.baseW[r]) - d);
            calcFrom(X, r + 1, A);
          }
        }
      };
      /* 3 */
      if (S.saveExcess) excess(); else if (S.saveDeathBenefits) deathBenefits();
      /* 4 */
      let rmdFrom = Y;
      src.forEach((A) => { if (A.rec.enforceRMD) { A.rmdOn = true; rmdFrom = Math.min(rmdFrom, A.rmdRow); } });
      if (rmdFrom < Y) calcFrom(X, rmdFrom);
      /* 5 */
      withdraw();
      /* 6 */
      if (S.saveExcess) { excess(); withdraw(); }
      /* 7 */
      calcFrom(X, 0);
    }

    /* ---------- E2 the account set ---------- */
    function build(G, S, o) {
      const X = context(G, S, o);
      for (let r = 0; r < X.Y; r++) taxHazard(X, r);
      const recs = (S.accounts || []).filter((a) => a.type !== 'child' && ADEF[a.type]);
      X.accts = []; X.byId = {};
      const add = (A) => { X.accts.push(A); X.byId[A.id] = A; return A; };
      /* E2.1 sweep account */
      const targetRec = S.saveExcessTarget ? recs.find((a) => a.id === S.saveExcessTarget) : null;
      if ((S.saveExcess || S.saveDeathBenefits) && (S.useSweepAccount || !targetRec)) {
        const sw = add(makeAcct(X, newAccount('taxable', { id: '_sweep', name: 'Sweep Account', owner: 'joint', risk: 'low', accessible: true, ret: S.sweepReturnPct || 0, ordPct: 1, payTaxFromLifestyle: true }), true));
        sw.win0 = 0; sw.win1 = S.saveExcess ? X.retRow - 1 : X.cLErow; X.sweep = sw;
      }
      /* E2.2 user accounts */
      recs.forEach((rec) => {
        const A = add(makeAcct(X, rec));
        if (INVEST[rec.type]) { const st = rmdStartAge(X.y0 - A.ow.age - 1); A.rmdRow = st == null ? X.Y : Math.max(0, st - 1 - A.ow.age); }
      });
      /* E9 hazard expense */
      const hz = o.hazard;
      if (hz && (hz.type === 'ltc' || hz.type === 'liability')) {
        const rows = F64(X.Y);
        [['client', X.a0], ['spouse', X.s0]].forEach(([who, age0]) => {
          if (who === 'spouse' && !X.sp) return;
          if (!(who === 'spouse' ? hz.spouseActive : hz.clientActive)) return;
          const st = (who === 'spouse' ? hz.spouseStartAge : hz.clientStartAge) - age0, amt = (who === 'spouse' ? hz.spouseAmount : hz.clientAmount) || 0;
          const en = hz.type === 'ltc' ? (who === 'spouse' ? hz.spouseEndAge : hz.clientEndAge) - age0 : st;
          for (let r = Math.max(0, st); r <= Math.min(en, X.Y - 1); r++) rows[r] += amt * (hz.type === 'ltc' ? Math.pow(1 + X.infl, r) : 1);
        });
        add(makeAcct(X, { id: '_hazard', type: 'hazexp', name: 'Hazard Expense', owner: 'client', rows }, true));
      }
      /* death-benefit proceeds (premature death solver): the first funding source, receives the amount the year after death */
      if (o.dbProceeds != null && hz && hz.type === 'death') {
        const dRow = Math.min(hz.clientActive ? X.cLErow : Infinity, X.sp && hz.spouseActive ? X.sLErow : Infinity);
        const dbA = add(makeAcct(X, newAccount('taxable', { id: '_dbp', name: 'DB Proceeds', owner: 'joint', risk: 'low', accessible: true, ret: o.avgReturn || 0, payTaxFromLifestyle: true }), true));
        if (isFinite(dRow) && dRow < X.Y) dbA.gift[dRow] = Math.max(0, o.dbProceeds);
        X.dbAcct = dbA;
      }
      /* found money (Save More with lifestyle efficiency off): non-taxable client income equal to the added contributions, current age to retirement */
      if (o.foundMoney) {
        const fm = add(makeAcct(X, newAccount('income', { id: '_found', name: 'Found Money Sources', owner: 'client', taxablePct: 0, risk: 'high' }), true));
        fm.custom = F64(X.Y);
        const typed = !!(o.extraSavings && o.extraSavings.perAccount);
        X.accts.forEach((A) => {
          if (A === fm) return;
          const pretax = A.type === 'tdbt' || (A.type === 'annuity' && A.rec.qualified && !A.rec.roth);
          for (let r = 0; r < Math.min(X.retRow, X.Y); r++) fm.custom[r] += A.extraC[r] * (typed && pretax ? 1 - X.rate.ord[r] : 1);
        });
      }
      /* E2.4 funding sources */
      const elig = X.accts.filter((A) => !A.internal && ((['taxable', 'tdbt', 'tdat', 'taxfree'].indexOf(A.type) >= 0 && !A.rec.mcp)
        || (A.type === 'annuity' && !A.rec.incomeRider && !A.ill && !A.rec.mcp)
        || (A.type === 'loan' && ((A.rec.creditLine || 0) > 0 || (A.rec.actions || []).some((x) => x.mode === 'creditLine' || x.mode === 'draw')))));
      const list = [];
      (S.fundingSources || []).forEach((p) => { const A = elig.find((x) => x.id === p.accountId); if (A && !list.some((q) => q.accountId === A.id)) list.push({ accountId: A.id, selected: !!p.selected, label: A.name }); });
      elig.forEach((A) => { if (!list.some((q) => q.accountId === A.id)) list.push({ accountId: A.id, selected: A.type !== 'loan', label: A.name }); });
      X.sources = list;
      X.saveTo = X.sweep || (targetRec && list.some((q) => q.accountId === targetRec.id) ? X.byId[targetRec.id] : null);
      if (X.saveTo && X.saveTo.win0 == null) { X.saveTo.win0 = 0; X.saveTo.win1 = X.Y - 1; }
      X.payrollOn = X.accts.some((A) => A.type === 'income' && A.rec.wages);
      return X;
    }

    /* ---------- E7 summaries ---------- */
    function summarize(X, lite) {
      const Y = X.Y, rows = [], find = [], srcIds = new Set(X.sources.filter((s) => s.selected).map((s) => s.accountId));
      const cum = { atRisk: 0, inc: 0, tax: 0, spend: 0, life: 0 };
      let run = 0;
      const KEYS = ['atRisk', 'inc', 'dep', 'depQP', 'depR', 'depS', 'depH', 'wd', 'wdR', 'wdS', 'sale', 'borrow', 'netLife', 'endTotal', 'ordInc', 'gains', 'taxes', 'potTax', 'spend',
        'access', 'inaccess', 'risk0', 'risk1', 'safe0', 'safe1', 'house0', 'house1', 'debt0', 'debt1', 'creditRem', 'item', 'taxDue', 'taxDef', 'gainsBal', 'taxFree',
        'assets', 'liab', 'nw', 'ndb', 'ndbH', 'ndbR', 'ndbS', 'ndbT', 'db', 'estate', 'funds', 'bal0', 'bal1'];
      for (let r = 0; r < Y; r++) {
        const s = { age: X.a0 + r, sage: X.sp ? X.s0 + r : null, year: X.y0 + r };
        KEYS.forEach((k) => { s[k] = 0; });
        for (const A of X.accts) {
          if (A.excluded) continue;
          const t = A.type, tank = A.tank, inv = INVEST[t];
          s.atRisk += A.atRisk[r]; s.inc += A.inc[r];
          s.dep += A.dep[r]; s.depQP += A.qp[r];
          if (inv || t === 'pli' || t === 'property') { if (tank === 'risk') s.depR += A.dep[r]; else if (tank === 'safe') s.depS += A.dep[r]; else if (tank === 'house') s.depH += A.dep[r]; }
          if (inv && !(t === 'annuity' && A.rec.wdAsInflow)) { if (tank === 'house') s.sale += A.wd[r]; else { s.wd += A.wd[r]; if (tank === 'risk') s.wdR += A.wd[r]; else s.wdS += A.wd[r]; } }
          if (t === 'property') s.sale += A.sale[r];
          if (t === 'pli' || t === 'note') { s.wd += A.wd[r]; s.wdS += A.wd[r]; }
          s.borrow += A.borrow[r]; s.ordInc += A.ord[r]; s.gains += A.gain[r];
          s.taxes += A.tax[r]; s.taxDue += A.taxLife[r]; s.potTax += A.pot[r]; s.spend += A.spend[r]; s.item += A.item[r];
          const isAsset = inv || t === 'pli' || t === 'note' || t === 'property';
          const bal = isAsset ? ((t === 'annuity' || t === 'pli') ? A.surr[r] : A.end[r]) : 0;
          const boy = isAsset ? (inv ? A.boy[r] : (t === 'pli' ? A.start[r] : A.start[r])) : 0;
          if (isAsset) { s.endTotal += bal; s.bal0 += boy; s.bal1 += bal; s.assets += bal; }
          if (inv || t === 'pli' || t === 'note') { if (A.accessible) s.access += bal; else s.inaccess += bal; }
          if (isAsset) { if (tank === 'risk') { s.risk0 += boy; s.risk1 += bal; } else if (tank === 'safe') { s.safe0 += boy; s.safe1 += bal; } else if (tank === 'house') { s.house0 += boy; s.house1 += bal; } }
          if (t === 'loan' || t === 'credit') { s.debt0 += A.start[r]; s.debt1 += A.end[r]; s.liab += A.end[r]; }
          if (t === 'pli') { s.debt0 += r ? A.loanBal[r - 1] : 0; s.debt1 += A.loanBal[r]; }
          s.creditRem += A.credit[r];
          if (isAsset) {
            const roth = !!A.rec.roth;
            if (t === 'tdbt' || (t === 'annuity' && A.rec.qualified && !roth) || (t === 'tdat' && !roth) || (t === 'property' && A.rec.treatment === 'taxdef') || (t === 'annuity' && !A.rec.qualified)) s.taxDef += bal;
            else if (t === 'taxfree' || roth || t === 'pli' || (t === 'property' && A.rec.treatment === 'taxadv')) s.taxFree += bal;
            else s.gainsBal += bal;
          }
          s.nw += A.nw[r];
          if (t === 'pli') { s.ndb += A.ndb[r]; s.ndbS += A.ndb[r]; s.db += A.db[r]; }
          if (t === 'term' && A.rec.policyType === 'life') { s.ndb += A.db[r]; s.ndbT += A.db[r]; s.db += A.db[r]; }
          if (t === 'annuity') { s.ndb += A.ndb[r]; if (tank === 'risk') s.ndbR += A.ndb[r]; else if (tank === 'safe') s.ndbS += A.ndb[r]; else s.ndbH += A.ndb[r]; s.db += A.db[r]; }
          s.estate += A.est[r];
          if (srcIds.has(A.id) || A === X.sweep || A === X.dbAcct) s.funds += t === 'loan' ? A.credit[r] : (t === 'annuity' ? A.surr[r] : A.end[r]);
        }
        const fl = rowFlows(X, r);
        s.netLife = fl.actual; s.liquidity = s.creditRem + s.access;
        s.rateOrd = X.rate.ord[r]; s.rateCg = X.rate.cg[r]; s.ratePotOrd = X.rate.potOrd[r]; s.ratePotCg = X.rate.potCg[r]; s.marg = X.rate.marg[r]; s.head = Math.round(X.rate.head[r]);
        cum.atRisk += s.atRisk; cum.inc += s.inc; cum.tax += s.taxes; cum.spend += s.spend;
        s.atRiskC = cum.atRisk; s.incC = cum.inc; s.taxesC = cum.tax; s.spendC = cum.spend;
        KEYS.concat(['liquidity', 'atRiskC', 'incC', 'taxesC', 'spendC']).forEach((k) => { s[k] = Math.round(s[k]); });
        rows.push(s);
        const desired = X.target[r], actual = fl.actual;
        run += actual - desired; cum.life += actual;
        const f = {
          idx: r, age: X.a0 + r, sage: X.sp ? X.s0 + r : null, year: X.y0 + r,
          spend: fl.spend, dep: fl.dep, taxDue: s.taxDue, item: fl.item, desired, required: fl.dep + fl.item + desired,
          actual, actualPV: actual / Math.pow(1 + X.infl, r), diff: Math.round(actual - desired), spendC: s.spendC, taxes: s.taxes,
          grossIncWd: s.inc + s.wd + s.sale + s.borrow, bal0: s.bal0, bal1: s.bal1, funds: s.funds, ndb: s.ndb, nw: s.nw,
          ordInc: s.ordInc, gainsInc: s.gains, rateOrd: s.rateOrd, rateCg: s.rateCg, ratePotOrd: s.ratePotOrd, ratePotCg: s.ratePotCg, potTax: s.potTax,
          lifeC: cum.life, measure: s.funds < 5 ? run : s.funds, per: {}
        };
        if (!lite) for (const A of X.accts) if (!A.excluded && (INVEST[A.type] || A.type === 'pli' || A.type === 'loan' || A.type === 'note')) f.per[A.id] = { name: A.name, bal: (A.type === 'annuity' || A.type === 'pli') ? A.surr[r] : A.end[r], wd: A.wd[r], spend: A.spend[r] };
        find.push(f);
      }
      return { rows, find };
    }

    /* ---------- one projection (a base run, or a solver trial) ---------- */
    function project(G, S, o) {
      o = o || {};
      G = globals(G); S = scen(S);
      const X = build(G, S, o);
      fund(X);
      const sum = summarize(X, o.lite);
      const out = {
        rows: sum.rows, find: sum.find, Y: X.Y, a0: X.a0, s0: X.s0, sp: X.sp, y0: X.y0, retRow: X.retRow, retAge: X.cRet, sRetAge: X.sRet, jointRow: X.jointRow,
        cLErow: X.cLErow, sLErow: X.sLErow, firstDie: X.firstDie, target: Array.from(X.target), T0: X.T0, sources: X.sources, infl: X.infl, taxInfo: X.taxInfo || null,
        accounts: o.lite ? null : X.accts.filter((A) => !A.excluded).map((A) => ({
          id: A.id, name: A.name, type: A.type, tank: A.tank, riskLevel: A.rec.risk, internal: A.internal, purpose: A.rec.purpose || null, mh: !!A.mh,
          rows: Array.from({ length: X.Y }, (_, r) => ({
            balance: (A.type === 'annuity' || A.type === 'pli') ? A.surr[r] : A.end[r], start: A.start[r], potentialTax: A.pot[r], income: A.inc[r], taxes: A.tax[r],
            loanBalance: A.type === 'pli' ? A.loanBal[r] : A.liab[r], creditRemaining: A.credit[r], expense: A.item[r], deathBenefit: A.db[r], surrender: A.surr[r],
            rmd: A.rmd[r] > 0, asInflow: A.type === 'annuity' && !!A.rec.wdAsInflow, wd: A.wd[r], dep: A.dep[r], spend: A.spend[r]
          }))
        }))
      };
      /* E6.8 (base runs): money lasts until, and the account-balance total left at that age */
      let mlu = 100, rem = 0;
      for (let r = X.retRow; r < X.Y; r++) if (Math.round(sum.find[r].actual - sum.find[r].desired) < -1) { mlu = X.a0 + r; rem = sum.rows[r].endTotal; break; }
      out.moneyLasts = mlu; out.moneyLastsAmount = rem;
      /* weighted average return of investment accounts, sweep excluded */
      let ws = 0, bs = 0;
      X.accts.forEach((A) => { if (A.internal || !INVEST[A.type]) return; const b = A.rec.balance || 0; let rr = A.rec.ret || 0; if (A.mh) { let t = 0; for (let i = 0; i < X.Y; i++) t += A.ret[i]; rr = t / X.Y; } ws += rr * b; bs += b; });
      out.avgReturn = bs > 0 ? ws / bs : 0;
      out.missingIll = X.missingIll; out.creditWarning = X.creditWarning;
      if (o.debug) out.X = X;
      out.refSize = Math.max(1, ...sum.rows.map((s) => Math.max(s.inc, s.risk0, s.risk1, s.safe0, s.safe1, s.debt0, s.debt1, s.house0, s.house1)));
      return out;
    }

    /* =====================================================================
       E10 solvers (driven by fgps23's levers)
       ===================================================================== */
    function projectTo(G) {
      const g = globals(G);
      const c = g.useSpouse ? Math.max(g.clientLE, g.spouseLE + g.clientAge - g.spouseAge) : g.clientLE;
      return Math.min(100, g.projectToAge != null ? g.projectToAge : c);
    }
    const targetRow = (G, res) => Math.max(0, Math.min(res.jointRow - 1, Math.max(projectTo(G) - res.a0, 0), res.Y - 1));
    const measureAt = (res, r) => res.find[Math.min(r, res.find.length - 1)].measure;
    /** secant on a scalar: returns {x, res, conv} */
    function secant(f, x0, x1, tol, maxIt, cap) {
      let a = f(x0), b = f(x1), conv = false;
      for (let it = 0; it < maxIt; it++) {
        if (b.m === 0) { conv = true; break; }
        if (b.m === a.m) { conv = Math.abs(b.m) < 1; break; }
        let step = b.m * (x1 - x0) / (b.m - a.m);
        if (cap) step = Math.max(-cap, Math.min(cap, step));
        x0 = x1; a = b; x1 -= step; b = f(x1);
        if (Math.abs(step) < tol) { conv = true; break; }
      }
      return { x: x1, res: b.res, conv };
    }
    /**
     * kind: 'ror' | 'save' | 'saveMin' | 'work' | 'spend' | 'db'.
     * o.base: options carried into every trial (hazard, extraPoints, retireAge, retireTarget, extraSavings...).
     * o.efficiency (save): true = extra saving comes out of lifestyle (target re-taken); false = found money income.
     * o.once (save): add the extra saving once, in year 1 (retired household or the lump-sum variant).
     */
    function solve(G, S, kind, o) {
      o = o || {};
      const base = Object.assign({}, o.base || {});
      const run = (extra, full) => project(G, S, Object.assign({}, base, extra, { lite: !full }));
      const first = run({});
      const tr = targetRow(G, first);
      const at = (extra) => { const res = run(extra); return { m: measureAt(res, tr), res }; };
      if (kind === 'ror') {
        const p0 = base.extraPoints || 0;
        const s = secant((p) => at({ extraPoints: p }), p0 + 0.01, p0 + 0.02, 0.0000005, 99, 0.05);
        return { value: s.x, res: s.res, conv: s.conv, tr, base: first };
      }
      if (kind === 'save' || kind === 'saveMin') {
        const eff = o.efficiency !== false;
        const opt = (A) => ({ extraSavings: { A, once: !!o.once, pct: o.pct || null }, foundMoney: !eff });
        if (kind === 'saveMin') {
          const S2 = scen(S);
          const A = S2.saveExcess && !S2.maintainCurrentLifestyle ? 0 : -10000000;
          const res = run(opt(A));
          return { value: A, res, need: measureAt(res, tr) <= 0, tr, base: first };
        }
        const s = secant((A) => at(opt(A)), 0, 50001, 50, 99);
        return { value: s.x, res: s.res, conv: s.conv, tr, base: first };
      }
      if (kind === 'work') {
        const le = globals(G).clientLE;
        let best = null;
        for (let R = first.a0; R <= Math.min(100, le + 1); R++) {
          const res = run({ retireAge: R });
          const f = res.find[Math.min(tr, res.find.length - 1)];
          best = { value: R, res, conv: false, tr, base: first };
          if (Math.round(f.actual - f.desired) > -0.0049) { best.conv = true; break; }
        }
        return best;
      }
      if (kind === 'spend') {
        const g = globals(G), S2 = scen(S);
        const i = S2.maintainCurrentLifestyle || S2.inflateLifestyle ? g.inflationRate : 0;
        const grown = (first.T0 || 0) * Math.pow(1 + i, Math.max(first.retRow, 0));
        const s = secant((T) => at({ retireTarget: T }), grown, grown / 2, 0.0049, 59);
        return { value: s.x, res: s.res, conv: s.conv, tr, base: first };
      }
      if (kind === 'db') {
        const s = secant((x) => at({ dbProceeds: Math.max(0, x), avgReturn: first.avgReturn }), 0, 500001, 50, 99);
        return { value: Math.max(0, s.x), res: s.res, conv: s.conv, tr, base: first };
      }
      return null;
    }

    return {
      GDEF, SDEF, ADEF, INVEST, newAccount, newScenario, globals, scen, project, solve, projectTo, targetRow, measureAt,
      markets, marketSeries, averageReturn, taxData, capGainsTax, ordinaryTax, rmdStartAge, rmdDivisor, tankOf
    };
  })();
  EFA.engines = EFA.engines || {};
  EFA.engines.fgps = GPS;

  /* =====================================================================
     FGPS service: per-client plan data, scenarios and the session state shared by fgps22 and fgps23
     ===================================================================== */
  const GX = {
    sess: {},
    ck() { return (EFA.clients && EFA.clients.active) || '_device'; },
    /** session (not saved): chart age, tank scale, EOY, hazard, toggles, lever state, run cache */
    S() {
      const k = this.ck();
      return this.sess[k] || (this.sess[k] = { chartAge: null, tankScale: 100, eoy: false, hazard: null, showRip: true, pv: false, cache: {}, lv: null, play: false });
    },
    G() { return GPS.globals(EFA.clients.get('fgps', 'globals', null)); },
    setG(g) {
      const pta = GPS.projectTo(Object.assign({}, g, { projectToAge: null }));
      g.projectToAge = Math.min(100, pta);
      EFA.clients.set('fgps', 'globals', g); this.invalidate();
    },
    hasContact() { return !!this.G().contactId; },
    list() { return (EFA.clients.get('fgps', 'scenarios', null) || []).map((s) => Object.assign(GPS.scen(), s)); },
    saveList(list) { EFA.clients.set('fgps', 'scenarios', JSON.parse(JSON.stringify(list))); this.invalidate(); },
    /** the scenario list, creating "Present Position" for a contact that has none */
    ensure(ctx) {
      let L = this.list();
      if (!L.length && this.hasContact()) { L = [GPS.newScenario(ctx ? ctx.text('presentPosition') : 'Present Position')]; this.saveList(L); }
      return L;
    },
    get(id) { return this.list().find((s) => s.id === id) || null; },
    put(sc) { const L = this.list(); const i = L.findIndex((s) => s.id === sc.id); sc.modified = Date.now(); if (i >= 0) L[i] = sc; else L.push(sc); this.saveList(L); },
    mainId() { const L = this.list(); const id = EFA.clients.get('fgps', 'revisedId', null); return (L.find((s) => s.id === id) || L[0] || {}).id || null; },
    baseId() { const L = this.list(); const id = EFA.clients.get('fgps', 'baselineId', null); return (L.find((s) => s.id === id) || L.find((s) => s.id === this.mainId()) || L[0] || {}).id || null; },
    setMain(id) { EFA.clients.set('fgps', 'revisedId', id); },
    setBase(id) { EFA.clients.set('fgps', 'baselineId', id); },
    visited(id) { return EFA.clients.get('fgps', 'visited', {})[id] || {}; },
    markVisited(id, n) { const v = EFA.clients.get('fgps', 'visited', {}); v[id] = Object.assign({}, v[id] || {}, { [n]: true }); EFA.clients.set('fgps', 'visited', v); },
    invalidate() { this.S().cache = {}; },
    /** a base projection of a scenario (cached until data changes); opts: hazard and lever options */
    run(id, opts) {
      const sc = this.get(id); if (!sc) return null;
      const key = id + '|' + JSON.stringify(opts || {});
      const C = this.S().cache;
      if (!C[key]) {
        try { C[key] = GPS.project(this.G(), sc, opts || {}); }
        catch (e) { console.error(e); C[key] = { error: true }; }
      }
      return C[key];
    }
  };
  /** the tax-rate hand-off from the income tax calculator (INCTAXC / incTax1): percent, 2 decimals; read once and cleared */
  function takeTaxHandoff() {
    const h = EFA.handoff;
    const v = h && h.taxRate != null && isFinite(h.taxRate) ? +h.taxRate : null;
    if (h) delete h.taxRate;
    if (EFA.clients.get('_handoff', 'taxRate', null) != null) EFA.clients.set('_handoff', 'taxRate', null);
    return v;
  }
  /** E8: the values for the selected age, as PEM inputs */
  function gpsPemValues(res, k, st) {
    const s = res.rows[k], f = res.find[k], last = res.rows[res.Y - 1], eoy = !!st.eoy;
    const pvf = Math.pow(1 + (res.infl || 0), k);
    const lifestyle = f.actual, target = res.target[k] || 0;
    const rip = last.incC - s.incC + (eoy ? 0 : s.inc);
    const atRiskLeft = last.atRiskC - s.atRiskC + (eoy ? 0 : s.atRisk);
    const prot = atRiskLeft > 0 ? Math.round(s.db / atRiskLeft * 100) : 100;
    const depAll = s.depR + s.depS + s.depQP, share = depAll > 0 ? s.depS / depAll : 1.5;
    const P = lib('pem');
    return {
      stacks: P && P.stacksFromAccounts ? P.stacksFromAccounts(res.accounts, k, { includeNdb: true }) : null,
      tankSize: Math.max(1, res.refSize * (st.tankScale || 100) / 100),
      remainingIncome: Math.round(rip), showRip: st.showRip !== false, grossIncome: s.inc, inflow: s.inc - s.depQP, taxesPaid: s.taxes, expenses: s.item,
      outflow: Math.round(st.pv ? s.spend / pvf : s.spend), lifestyle: Math.round(st.pv ? lifestyle / pvf : lifestyle), pv: !!st.pv,
      regulator: lifestyle <= 0 ? 0 : (lifestyle > target ? 100 : lifestyle / target * 100),
      diverter: Math.max(-90, Math.min(90, 180 * share - 90)),
      riskBalance: eoy ? s.risk1 : s.risk0, safeBalance: eoy ? s.safe1 : s.safe0, bfBalance: eoy ? s.debt1 : s.debt0, houseBalance: eoy ? s.house1 : s.house0,
      withdrawal: s.wd, withdrawalRisk: s.wdR, withdrawalSafe: s.wdS, proceeds: s.sale, loanPmt: -s.borrow,
      contributionRisk: s.depR, contributionSafe: s.depS, contributionHouse: s.depH, contributionQP: s.depQP, tdContributions: s.depQP,
      incomeProtection: true, protectionPct: prot, lowProtection: prot < 80
    };
  }
  /** PEM configuration for the GPS form (fgps22 and both fgps23 diagrams) */
  const gpsPemCfg = (o) => Object.assign({
    stacked: true, rip: true, gps: true, gpsButtons: true, labels: false, scenarioPicker: false, lifestyleStrip: false, links: false, sliders: false,
    chevrons: false, futureFill: false, borrowSource: false, showBorrowed: true, showHouse: true, includeNdb: true
  }, o || {});

  /* ---------- shared look for the GPS screens ---------- */
  EFA.css('b06g', `
  .b06-gbtn { position: absolute; width: 40px; height: 40px; border-radius: 50%; border: 0; background: #0d1e3a; color: #f7f5f1; font: 700 18px/1 "DM Sans", sans-serif; display: grid; place-items: center; box-shadow: 0 6px 14px rgba(13,30,58,.28); z-index: 8; transition: transform .2s ease, background .2s ease; }
  .b06-gbtn:hover { background: #b8972e; color: #0d1e3a; transform: translateY(-2px); }
  .b06-gbtn.vis { background: #fffdf8; color: #0d1e3a; box-shadow: inset 0 0 0 3px #0d1e3a, 0 6px 14px rgba(13,30,58,.18); }
  .b06-gbtn[disabled] { opacity: .35; pointer-events: none; }
  .b06-gwarn { position: absolute; width: 26px; height: 26px; z-index: 8; color: #c96a1b; }
  .b06-gctl { position: absolute; left: 22px; bottom: 16px; display: flex; gap: 18px; align-items: flex-end; z-index: 9; background: rgba(255,253,248,.92); border: 1px solid #d6cfc4; border-radius: 14px; padding: 10px 14px; box-shadow: 0 8px 22px rgba(13,30,58,.10); }
  .b06-gctl .col { display: grid; gap: 8px; }
  .b06-gctl .lb { font: 700 12px/1 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #8a6e22; }
  .b06-gctl input[type=range] { width: 150px; accent-color: #b8972e; }
  .b06-gctl .sw { display: flex; align-items: center; gap: 8px; }
  .b06-gctl .b06-switch { transform: scale(.72); transform-origin: left center; margin-right: -18px; }
  .b06-age { display: flex; align-items: center; border: 1.5px solid #cbd5e3; border-radius: 10px; overflow: hidden; background: #fff; }
  .b06-age button { width: 34px; height: 38px; border: 0; background: transparent; color: #0d1e3a; display: grid; place-items: center; }
  .b06-age button:hover { background: #e3e8f0; }
  .b06-age button[disabled] { opacity: .3; pointer-events: none; }
  .b06-age input { width: 70px; height: 38px; border: 0; border-left: 1px solid #e3e8f0; border-right: 1px solid #e3e8f0; text-align: center; font: 700 19px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-age .sp { font: 600 13px/1 "DM Sans", sans-serif; color: #667389; padding: 0 8px; }
  .b06-gscn { position: absolute; bottom: 16px; z-index: 9; display: flex; align-items: center; gap: 10px; background: rgba(255,253,248,.92); border: 1px solid #d6cfc4; border-radius: 14px; padding: 8px 12px; box-shadow: 0 8px 22px rgba(13,30,58,.10); }
  .b06-gscn .lb { font: 700 12px/1.1 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6e22; }
  .b06-gscn select, .b06-sel { height: 38px; border: 1.5px solid #cbd5e3; border-radius: 9px; background: #fff; font: 600 16px/1 "DM Sans", sans-serif; color: #0d1e3a; padding: 0 10px; max-width: 260px; }
  .b06-rbtn { width: 38px; height: 38px; border-radius: 50%; border: 0; background: #0d1e3a; color: #f7f5f1; display: grid; place-items: center; flex: 0 0 auto; }
  .b06-rbtn:hover { background: #b8972e; color: #0d1e3a; }
  .b06-rbtn.on { background: #b8972e; color: #0d1e3a; }
  .b06-rbtn.ghost { background: transparent; color: #0d1e3a; box-shadow: inset 0 0 0 1.5px #cbd5e3; }
  .b06-hzd { font: 600 14px/1.25 "DM Sans", sans-serif; color: #b3402e; max-width: 200px; white-space: pre-line; }
  .b06-gempty { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; }
  .b06-gempty .box { display: grid; gap: 18px; justify-items: center; max-width: 820px; }

  /* dialogs */
  .stage .b06-gd .st-overlay-in { width: var(--w, 900px); max-height: 836px; }
  .stage .b06-gd .st-overlay-b { padding: 18px 26px 22px; display: grid; gap: 14px; align-content: start; }
  .b06-gd .tbl { width: 100%; border-collapse: collapse; font: 600 17px/1.25 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-gd .tbl th { font: 700 12px/1.2 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #f7f5f1; background: #0d1e3a; padding: 10px 10px; text-align: left; }
  .b06-gd .tbl td { padding: 7px 10px; border-bottom: 1px solid rgba(13,30,58,.08); }
  .b06-gd .tbl tbody tr:nth-child(even) td { background: rgba(227,232,240,.45); }
  .b06-gd .tbl .r { text-align: right; } .b06-gd .tbl .c { text-align: center; }
  .b06-gd .tbl .csv { color: #2b4c80; font-style: italic; }
  .b06-gd .tbl .empty td { text-align: center; color: #8a93a3; font-weight: 500; padding: 22px; background: transparent !important; }
  .b06-gd .badge { display: inline-block; min-width: 30px; padding: 3px 7px; border-radius: 6px; background: #e3e8f0; color: #1d3863; font: 700 12px/1 "DM Sans", sans-serif; letter-spacing: .06em; text-align: center; }
  .b06-gd .scroll { max-height: 470px; overflow: auto; border: 1px solid #cbd5e3; border-radius: 10px; }
  .b06-gd .foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .b06-gd .foot .grp { display: flex; gap: 10px; align-items: center; position: relative; }
  .stage .b06-gd .st-pill { min-height: 42px; font-size: 16px; }
  .stage .b06-gd .st-pill.ghost { background: transparent; color: #0d1e3a; border-color: #cbd5e3; }
  .stage .b06-gd .st-pill[disabled] { opacity: .4; pointer-events: none; }
  .b06-menu { position: absolute; bottom: 48px; left: 0; z-index: 5; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 12px; box-shadow: 0 16px 34px rgba(13,30,58,.22); padding: 6px; display: grid; min-width: 290px; }
  .b06-menu button { border: 0; background: transparent; text-align: left; padding: 9px 12px; border-radius: 8px; font: 600 16px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-menu button:hover { background: #f0e6c4; }
  .b06-acc { border: 1px solid #d6cfc4; border-radius: 12px; overflow: hidden; }
  .b06-acc + .b06-acc { margin-top: 2px; }
  .b06-acc > .hd { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f7f5f1; font: 700 16px/1 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #0d1e3a; cursor: pointer; border: 0; width: 100%; }
  .b06-acc > .hd .chev { transition: transform .25s ease; }
  .b06-acc.open > .hd .chev { transform: rotate(90deg); }
  .b06-acc > .bd { display: none; padding: 14px 16px; }
  .b06-acc.open > .bd { display: block; }
  .b06-acc.dis > .hd { opacity: .45; pointer-events: none; }
  .b06-fg { display: grid; grid-template-columns: repeat(var(--c, 3), minmax(0, 1fr)); gap: 12px 16px; align-items: end; }
  .b06-f { display: grid; gap: 5px; min-width: 0; }
  .b06-f > .l { font: 700 12px/1.15 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #667389; display: flex; align-items: center; gap: 6px; }
  .b06-f input:not([type=checkbox]), .b06-f select { height: 40px; border: 1.5px solid #cbd5e3; border-radius: 9px; background: #fff; padding: 0 10px; font: 600 17px/1 "DM Sans", sans-serif; color: #0d1e3a; min-width: 0; width: 100%; box-sizing: border-box; }
  .b06-f input.num { text-align: right; }
  .b06-f input:focus, .b06-f select:focus { outline: none; border-color: #b8972e; box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .b06-f.req > .l::after { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #b3402e; }
  .b06-f .two { display: grid; grid-template-columns: 1fr 74px; gap: 6px; }
  .b06-sw { display: flex; align-items: center; gap: 10px; font: 600 15px/1.2 "DM Sans", sans-serif; color: #0d1e3a; min-height: 40px; }
  .b06-sw .b06-switch { transform: scale(.72); transform-origin: left center; margin-right: -20px; flex: 0 0 auto; }
  .b06-mag { width: 26px; height: 26px; border-radius: 50%; border: 0; background: #0d1e3a; color: #f7f5f1; display: inline-grid; place-items: center; padding: 0; }
  .b06-mag:hover { background: #b8972e; color: #0d1e3a; }
  .b06-note { font: 500 14px/1.4 "DM Sans", sans-serif; color: #667389; margin: 0; }
  .b06-warnt { background: #fff1e0; }
  .b06-fl { display: grid; gap: 6px; }
  .b06-fl .it { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border: 1px solid #cbd5e3; border-radius: 9px; background: #fff; font: 600 15px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-fl .it .nm { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .b06-fl .it .mv { width: 28px; height: 28px; border-radius: 6px; border: 0; background: #e3e8f0; color: #0d1e3a; display: grid; place-items: center; }
  .b06-fl .it .b06-switch { transform: scale(.62); transform-origin: right center; margin-left: -20px; }
  .b06-grid { width: 100%; border-collapse: collapse; font: 600 14px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-grid th { position: sticky; top: 0; background: #0d1e3a; color: #f7f5f1; font: 700 11px/1.2 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; padding: 8px 6px; z-index: 1; }
  .b06-grid td { padding: 2px 4px; border-bottom: 1px solid rgba(13,30,58,.06); }
  .b06-grid td input { width: 100%; height: 30px; border: 1px solid transparent; border-radius: 6px; background: transparent; text-align: right; font: 600 14px/1 "DM Sans", sans-serif; color: #0d1e3a; padding: 0 6px; box-sizing: border-box; }
  .b06-grid td input:focus { border-color: #b8972e; background: #fff; outline: none; }
  .b06-grid td.y { text-align: center; color: #667389; }
  `);
  const IC = {
    pencil: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6L9 21H3v-6z"/></svg>',
    warn: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18.5v.01"/></svg>',
    warnFill: '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M12 2.5 1.5 21h21z" fill="currentColor"/><path d="M12 9.5v5.5M12 17.6v.4" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
    first: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5v14M18 5l-8 7 8 7"/></svg>',
    prev: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    last: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5v14M6 5l8 7-8 7"/></svg>',
    mag: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><path d="m20 20-5-5"/></svg>',
    chev: '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    up: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
    down: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    calc: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12v5M8 16h2M12 16h2"/></svg>'
  };

  /* ---------- small form toolkit for the GPS dialogs (every word is editable copy) ---------- */
  const FK = {
    money: { show: (v) => F.money(v || 0), parse: (s) => F.parse(s), cls: 'num' },
    cents: { show: (v) => F.money(v || 0, { dp: 2 }), parse: (s) => Math.round(F.parse(s) * 100) / 100, cls: 'num' },
    pct: { show: (v) => F.pct(v || 0, 2), parse: (s) => F.parse(s, true), cls: 'num' },
    int: { show: (v) => (v == null || v === '' ? '' : F.int(v)), parse: (s) => Math.round(F.parse(s)), cls: 'num' },
    num: { show: (v) => (v == null ? '' : String(v)), parse: (s) => F.parse(s), cls: 'num' },
    text: { show: (v) => (v == null ? '' : String(v)), parse: (s) => String(s).trim(), cls: '' },
    date: { show: (v) => v || '', parse: (s) => s || null, cls: '' },
    phone: { show: (v) => v || '', parse: (s) => maskPhone(s), cls: '' }
  };
  function maskPhone(s) {
    const d = String(s || '').replace(/[^0-9x]/gi, ''), m = d.split(/x/i), n = m[0];
    if (!n) return '';
    const core = n.length >= 10 ? `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6, 10)}` : n;
    return core + (m[1] ? ' x' + m[1] : '');
  }
  /** one labelled field bound to obj[k] */
  function fld(ctx, obj, k, lab, type, o) {
    o = o || {};
    const T = FK[type] || FK.text, v = obj[k];
    const extra = o.extra || '';
    return `<label class="b06-f ${o.req ? 'req' : ''} ${o.cls || ''}" ${o.hidden ? 'hidden' : ''} data-wrap="${k}"><span class="l">${ctx.t(lab)}${extra}</span><input class="${T.cls}" data-fk="${k}" data-ft="${type}" ${type === 'date' ? 'type="date"' : 'type="text"'} value="${EFA.util.esc(T.show(v))}" autocomplete="off" ${o.max != null ? `data-max="${o.max}"` : ''} ${o.min != null ? `data-min="${o.min}"` : ''} ${o.maxlen ? `maxlength="${o.maxlen}"` : ''}></label>`;
  }
  /** a switch bound to obj[k] */
  const swf = (ctx, obj, k, lab, o) => `<div class="b06-sw ${(o && o.cls) || ''}" ${o && o.hidden ? 'hidden' : ''} data-wrap="${k}"><button type="button" class="b06-switch" role="switch" data-sk="${k}" aria-checked="${!!obj[k]}"></button>${ctx.t(lab)}</div>`;
  /** segmented choice bound to obj[k]: opts [[value, key]] */
  const segf = (ctx, obj, k, lab, opts, o) => `<div class="b06-f ${(o && o.cls) || ''}" data-wrap="${k}"><span class="l">${ctx.t(lab)}</span><div class="st-seg" role="radiogroup" style="justify-self:start">${opts.map(([v, key]) => `<button type="button" class="st-seg-b" style="font-size:14px;padding:7px 12px" data-gk="${k}" data-gv="${EFA.util.esc(String(v))}" aria-checked="${String(obj[k]) === String(v)}">${ctx.t(key)}</button>`).join('')}</div></div>`;
  /** custom dropdown bound to obj[k]: opts [[value, labelHTML]] */
  function ddf(ctx, obj, k, lab, opts, o) {
    const cur = opts.find(([v]) => String(v) === String(obj[k])) || opts[0];
    return `<div class="b06-f ${(o && o.cls) || ''}" ${o && o.hidden ? 'hidden' : ''} data-wrap="${k}"><span class="l">${ctx.t(lab)}</span><div class="b06-dd" data-dk="${k}" style="position:relative">
      <button type="button" class="b06-sel" style="width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:8px" data-ddb>${cur ? cur[1] : ''}${IC.down}</button>
      <div class="b06-menu" hidden style="bottom:auto;top:44px;max-height:320px;overflow:auto">${opts.map(([v, h]) => `<button type="button" data-dv="${EFA.util.esc(String(v))}">${h}</button>`).join('')}</div></div></div>`;
  }
  /** strategy picker (Current Age, Retirement Age, Life Expectancy, Specified Age + an age box) */
  function stratf(ctx, obj, k, lab) {
    const st = obj[k] || { s: 'current' };
    const opts = [['current', 'stCurrent'], ['retire', 'stRetire'], ['le', 'stLE'], ['age', 'stAge']];
    const cur = opts.find(([v]) => v === st.s) || opts[0];
    return `<div class="b06-f" data-wrap="${k}"><span class="l">${ctx.t(lab)}</span><div class="two" style="grid-template-columns:${st.s === 'age' ? '1fr 74px' : '1fr'}">
      <div class="b06-dd" data-dk="${k}" data-strat="${k}" style="position:relative"><button type="button" class="b06-sel" data-ddb style="width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:8px">${ctx.t(cur[1])}${IC.down}</button>
        <div class="b06-menu" hidden style="bottom:auto;top:44px">${opts.map(([v, key]) => `<button type="button" data-dv="${v}">${ctx.t(key)}</button>`).join('')}</div></div>
      ${st.s === 'age' ? `<input class="num" data-sa="${k}" value="${st.age != null ? st.age : ''}" type="text" autocomplete="off" style="height:40px;border:1.5px solid #cbd5e3;border-radius:9px;text-align:right;padding:0 8px;font:600 17px/1 DM Sans,sans-serif;width:100%;box-sizing:border-box">` : ''}</div></div>`;
  }
  /** wire every field inside root to obj; onChange(k) after each committed change */
  function bindForm(ctx, root, obj, onChange) {
    const ch = (k) => { if (onChange) onChange(k); };
    root.querySelectorAll('[data-fk]').forEach((inp) => {
      const k = inp.dataset.fk, T = FK[inp.dataset.ft] || FK.text;
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter' || e.key === 'Tab') { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } } });
      inp.addEventListener('focus', () => { if (T.cls === 'num') { inp.value = obj[k] == null ? '' : (inp.dataset.ft === 'pct' ? String(+((obj[k] || 0) * 100).toFixed(4)) : String(obj[k])); inp.select(); } });
      inp.addEventListener('input', () => { const mx = inp.dataset.max; if (mx != null && T.cls === 'num') { let v = T.parse(inp.value); if (isFinite(v) && v > +mx) inp.value = inp.dataset.ft === 'pct' ? String(+(+mx * 100).toFixed(4)) : mx; } });
      inp.addEventListener('blur', () => {
        let v = T.parse(inp.value);
        if (T.cls === 'num') { if (!isFinite(v)) v = obj[k] == null ? 0 : obj[k]; if (inp.dataset.max != null) v = Math.min(+inp.dataset.max, v); if (inp.dataset.min != null) v = Math.max(+inp.dataset.min, v); }
        const changed = JSON.stringify(v) !== JSON.stringify(obj[k]);
        obj[k] = v; inp.value = T.show(v);
        if (changed) ch(k);
      });
    });
    root.querySelectorAll('[data-sk]').forEach((b) => b.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; const k = b.dataset.sk; obj[k] = !obj[k]; b.setAttribute('aria-checked', !!obj[k]); ch(k); }));
    root.querySelectorAll('[data-gk]').forEach((b) => b.addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      const k = b.dataset.gk, raw = b.dataset.gv, v = raw === 'true' ? true : raw === 'false' ? false : (isFinite(+raw) && raw !== '' ? +raw : raw);
      obj[k] = v; root.querySelectorAll(`[data-gk="${k}"]`).forEach((x) => x.setAttribute('aria-checked', x === b)); ch(k);
    }));
    root.querySelectorAll('[data-dk]').forEach((dd) => {
      const k = dd.dataset.dk, menu = dd.querySelector('.b06-menu'), btn = dd.querySelector('[data-ddb]');
      btn.addEventListener('click', (e) => { if (EFA.edit && EFA.edit.on) return; e.stopPropagation(); root.querySelectorAll('.b06-dd .b06-menu').forEach((m) => { if (m !== menu) m.hidden = true; }); menu.hidden = !menu.hidden; });
      menu.querySelectorAll('[data-dv]').forEach((o) => o.addEventListener('click', (e) => {
        if (EFA.edit && EFA.edit.on) return;
        e.stopPropagation(); menu.hidden = true;
        const raw = o.dataset.dv, v = raw === 'null' ? null : (isFinite(+raw) && raw !== '' && !/^[a-z]/i.test(raw) ? +raw : raw);
        btn.innerHTML = o.innerHTML + IC.down;
        if (dd.dataset.strat) { const sk = dd.dataset.strat; obj[sk] = Object.assign({}, obj[sk] || {}, { s: v }); if (v === 'age' && obj[sk].age == null) obj[sk].age = null; ch(sk); }
        else { obj[k] = v; ch(k); }
      }));
    });
    root.querySelectorAll('[data-sa]').forEach((inp) => {
      const k = inp.dataset.sa;
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
      inp.addEventListener('blur', () => { const v = Math.round(F.parse(inp.value)); obj[k] = Object.assign({}, obj[k] || {}, { s: 'age', age: isFinite(v) ? Math.max(0, Math.min(100, v)) : null }); inp.value = obj[k].age == null ? '' : obj[k].age; ch(k); });
    });
    root.addEventListener('click', () => root.querySelectorAll('.b06-dd .b06-menu').forEach((m) => { m.hidden = true; }));
  }
  /** a GPS dialog: in-stage overlay with our width and a footer */
  function gdlg(ctx, o) {
    const ov = ctx.overlay({ title: o.title, cls: 'b06-gd', html: `<div class="b06-gdb">${o.body || ''}</div>${o.foot ? `<div class="foot">${o.foot}</div>` : ''}`, onClose: o.onClose });
    ov.querySelector('.st-overlay-in').style.setProperty('--w', (o.w || 900) + 'px');
    if (o.noOutside) ov.addEventListener('click', (e) => { if (e.target === ov) e.stopImmediatePropagation(); }, true);
    if (EFA.edit && EFA.edit.on) EFA.edit.arm(ov);
    EFA.numify(ov);
    return ov;
  }
  /** confirm inside the stage (no window.confirm) */
  function gconfirm(ctx, qHTML, okKey, then, cancelKey) {
    const ov = gdlg(ctx, { title: '', w: 600, body: `<p class="b06-dlg-q" style="margin:6px 0 4px">${qHTML}</p>`, foot: `<span></span><div class="grp"><button type="button" class="st-pill ghost no">${ctx.t(cancelKey || 'cancel')}</button><button type="button" class="st-pill yes">${ctx.t(okKey)}</button></div>` });
    ov.querySelector('.st-overlay-h').style.display = 'none';
    ov.querySelector('.no').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) ov.close(); });
    ov.querySelector('.yes').addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; ov.close(); then(); });
    return ov;
  }

  /* ---------- copy shared by fgps22 and fgps23 (dialogs run on either screen) ---------- */
  const GCOPY = {
    presentPosition: 'Present Position', cancel: 'Cancel', ok: 'Ok', save: 'Save', apply: 'Apply', add: 'Add', del: 'Delete', edit: 'Edit',
    stCurrent: 'Current Age', stRetire: 'Retirement Age', stLE: 'Life Expectancy', stAge: 'Specified Age',
    bCA: 'CA', bRA: 'RA', bLE: 'LE', bMH: 'MH', yes: 'Yes', no: 'No', none: 'None',
    ownClient: 'Client', ownSpouse: 'Spouse', ownJoint: 'Joint', rLow: 'Low', rMed: 'Med', rHigh: 'High',
    t1: 'Personal info and general assumptions', t2: 'Earned income, defined benefits and future inflow sources', t3: 'Investment and savings accounts',
    t4: 'Mortgages, installment loans and credit lines', t5: 'Primary residences and major capital purchases', t6: 'Insurance policies and other expenses (college, weddings and so on)', t7: 'Desired future lifestyle',
    w3: 'A cash value or annuity account is set to use an illustration that has no illustration data.', w4: 'A credit card balance grew extremely high. Check the assumptions.',
    noContact: 'Please create or activate a contact first.', confirmDel: 'Delete this item?', noIncome: 'The desired retirement income is missing or zero. Enter it in step 7 first.',
    engineErr: 'This scenario could not be calculated. Clone the scenario to refresh its data.',
    infPromptA: 'The average inflation rate over the client\'s lifetime is', infPromptB: 'Use it as the inflation rate for this plan?', useIt: 'Use It',
    startHint: 'Start here: open step 1 and create the contact record.',
    /* dialog 1 */
    d1: 'Personal Info and General Assumptions', secContact: 'Contact Information', secFin: 'Financial Assumptions', secClient: 'Client', secSpouse: 'Spouse', secKids: 'Children',
    contactName: 'Contact Record Name', addContact: 'Add Contact', clientName: 'Name', age: 'Age', retireAge: 'Retirement Age', le: 'Life Expectancy',
    inflationRate: 'Inflation Rate', autoTax: 'Estimate Tax Rates', accTax: 'Acc Tax Rate', distTax: 'Distrib Tax Rate', cgTax: 'Cap Gains Rate', creditScore: 'Credit Score',
    filing: 'Filing Status', fsSingle: 'Single', fsMfj: 'Married Filing Jointly', fsMfs: 'Married Filing Separately', fsHoh: 'Head of Household', jointNoSpouse: 'Joint filing is selected but no spouse is included.',
    itemize: 'Itemize', deductions: 'Deductions', cb: 'Client Blind', sb: 'Spouse Blind', stateTax: 'State Tax Rate', useMH: 'Use Market History', market: 'Market History',
    startYear: 'Start Year', endYear: 'End Year', avgRor: 'Average ROR', useSpouse: 'Include Spouse', kidName: 'Name', kidAge: 'Age', addChild: 'Add Child', noKids: 'No children entered.',
    privacyNote: 'Personal identifiers (birth dates, phone numbers, addresses, email and occupation) stay hidden in this view.',
    taxNote: 'Taxes are estimates using current-law assumptions, not tax advice.',
    /* dialogs 2 to 7 */
    d2: 'Income Sources', d3: 'Investments and Savings', d4: 'Loans and Credit', d5: 'Residences and Major Purchases', d6: 'Insurance and Other Expenses', d7: 'Desired Lifestyle',
    cName: 'Name', cAmount: 'Amount', cStart: 'Start', cEnds: 'Ends', cBalance: 'Balance', cRate: 'Rate', cType: 'Type', cRisk: 'Risk', cAccess: 'Access', cPmt: 'Monthly P&I', cMin: 'Min. Pmt.', cInflate: 'Inflate',
    empty: 'Nothing entered yet. Use Add to begin.',
    ty_taxable: 'Taxable', ty_tdbt: 'Tax-Deferred with Before-Tax $', ty_tdat: 'Tax-Deferred with After-Tax $', ty_taxfree: 'Tax Free', ty_annuity: 'Annuity', ty_pli: 'Cash Value Insurance',
    ty_property: 'Property', ty_note: 'Note', ty_loan: 'Installment Loan', ty_credit: 'Credit Card', ty_income: 'Income', ty_expense: 'Expense / Outflow', ty_term: 'Insurance Policy',
    tyS_taxable: 'Taxable', tyS_tdbt: 'Tax-Def', tyS_tdat: 'Tax-Def AT', tyS_taxfree: 'Tax Free', tyS_annuity: 'Annuity', tyS_pli: 'CVLI', tyS_property: 'Property', tyS_note: 'Note', tyS_loan: 'Loan', tyS_credit: 'Card',
    maintain: 'Maintain Current Lifestyle', desired: 'Desired Lifestyle', inflAdj: 'Inflation Adjusted', adjust: 'Lifestyle Adjustment', atAge: '@ Age', pctLife: '% Lifestyle', inflAdj2: 'Inflation Adjust',
    legacy: 'Desired Legacy', survivor: 'Survivor Lifestyle %', saveExcess: 'Save Excess', recalc: 'Recalc Lifestyle', useSweep: 'Use Sweep Account', sweepRor: 'Total ROR', saveTo: 'Save Excess to',
    saveDb: 'Save DB', fundHead: 'Use Withdrawals to Fund Shortfalls', noFund: 'Accounts that can fund shortfalls appear here once entered.', todayNote: 'Amounts in today\'s dollars.',
    /* account editor */
    addNew: 'Add New', advanced: 'Advanced Options', advNote: 'Schedule changes (actions) already on this account are kept and applied.',
    f_name: 'Name', f_owner: 'Owner', f_balance: 'Balance', f_basis: 'Cost Basis', f_ret: 'Total ROR', f_ordPct: 'Ordinary Growth %', f_fee: 'Annual Fee', f_feesDed: 'Fees Deductible',
    f_basisMethod: 'Basis Method', bmAvg: 'Average', bmFifo: 'FIFO', bmLifo: 'LIFO', f_payTax: 'Pay Tax From Lifestyle', f_risk: 'Risk', f_access: 'Accessible Funds',
    f_contrib: 'Annual Contribution', f_contribInfl: 'Contribution Inflate', f_cStart: 'Contributions Start', f_cEnd: 'Contributions End', f_mcp: 'Major Capital Purchase',
    f_match: 'Company Match', f_rmd: 'Enforce RMD', f_early: 'Allow Withdrawals Before 59 1/2', f_penalty: 'Apply 10% Early Penalty', f_hasRmd: 'Has RMD', f_roth: 'Roth',
    f_followMH: 'Follow Plan Market History', f_ownMH: 'Use Own Market History', f_surr: 'Surrender Charge', f_bonus: 'Premium Bonus', f_qualified: 'Qualified Plan', f_simple: 'Simple Interest',
    f_useIll: 'Use Illustration', f_editIll: 'Edit Illustration', f_incRider: 'Income Rider', f_disRider: 'Disability Waiver', f_ltcRider: 'LTC Rider', f_survBen: 'Survivor Benefit', f_wdInflow: 'Withdrawals Count as Income',
    f_limits: 'Market Limits', f_floor: 'Floor', f_cap: 'Cap', f_part: 'Participation', f_spread: 'Spread', f_interval: 'Multi-Year Interval',
    f_premium: 'Annual Premium', f_db: 'Death Benefit', f_av: 'Accumulation Value', f_csv: 'Cash Surrender Value', f_ilit: 'Owned by an ILIT', f_init: 'Starts At',
    f_value: 'Market Value', f_appr: 'Appreciation', f_excl: 'Gains Exclusion', f_residence: 'Residence', f_treat: 'Treatment', trTaxable: 'Taxable', trTaxdef: 'Tax-Deferred', trTaxadv: 'Tax-Advantaged',
    f_cash: 'Cash Required', f_sell: 'Sell Property', f_saleAge: 'Sale Age', f_saleProc: 'Sale Proceeds',
    f_rate: 'Interest Rate', f_pmt: 'Monthly P&I', f_pmtCard: 'Monthly Payment', f_line: 'Credit Line', f_ded: 'Deductible', f_secured: 'Secured Loan', f_proceeds: 'Loan Proceeds',
    f_payOff: 'Pay Off Early', f_payOffAge: 'Pay Off Age', f_payDeath: 'Pay Off at Life Expectancy', f_charges: 'Monthly Charges', f_payMin: 'Pay Minimum', f_grace: 'Grace Period',
    f_term: 'Remaining Term (months)', f_calcPmt: 'Calculate',
    f_amount: 'Annual Amount', f_infl: 'Inflate', f_iStart: 'Starts', f_iEnd: 'Ends', f_taxablePct: '% Taxable', f_dedAmt: 'Deductible Amount', f_ss: 'Social Security',
    f_survPct: 'Survivor %', f_wages: 'Wages (Payroll Taxes)', f_selfEmp: 'Self-Employed', f_usage: 'Usage', usItem: 'Itemized Expense', usTaxes: 'Taxes',
    f_ptype: 'Policy Type', ptLife: 'Term Life', ptDis: 'Disability', ptLtc: 'Long Term Care', ptPc: 'Property/Casualty', ptUmb: 'Umbrella', f_premInfl: 'Premium Inflate', f_benefit: 'Benefit or Limit', f_cola: 'Benefit COLA',
    illHead: 'Illustration', illYear: 'Age', illPrem: 'Premium', illContrib: 'Contribution', illWd: 'Withdrawal', illCV: 'Contract Value', illSV: 'Surrender Value', illAV: 'Accumulation', illCSV: 'Cash Surrender', illDB: 'Death Benefit',
    illInterp: 'Interpolate Missing Values', illSave: 'Save Changes', illNote: 'Values come from the carrier illustration; non-guaranteed columns are not guarantees.',
    /* privacy mode and the contact identifiers it hides */
    privacy: 'Hide Personal Details', privacyNote2: 'Birth dates, phone numbers, addresses, email and occupation are hidden while this is on.',
    mobilePhone: 'Mobile Phone', altPhone: 'Alternate Phone', workPhone: 'Work Phone', street: 'Street', city: 'City', stateL: 'State', zip: 'ZIP',
    email: 'Primary Email', email2: 'Alternate Email', dob: 'Date of Birth', position: 'Occupation', employer: 'Employer',
    /* advanced per-account actions */
    advOpts: 'Advanced Options', actHead: 'Schedule Changes', actAdd: 'Add a Change', actAmount: 'Amount', actGrow: 'Inflate @', actRate: 'Rate %',
    actStart: 'Starting at Age', actYears: 'Years', actMod: 'Applies as', actDesc: 'Description', actNone: 'No schedule changes on this account.',
    actMulti: 'Multiple values, one per year', actPaste: 'Values, one per year',
    mdSet: 'Set', mdAdd: 'Add', mdSub: 'Subtract',
    ac_contribution: 'Contribution', ac_withdrawal: 'Withdrawal', ac_fee: 'Annual Fee', ac_ror: 'Modify ROR', ac_inflow: 'Modify Inflow',
    ac_creditLine: 'Credit Line Change', ac_draw: 'Line of Credit Draw', ac_paydown: 'Principal Paydown',
    /* illustration paste helper */
    pasteHead: 'Paste a Column of Values', pasteBody: 'Paste one value per line. They fill downward from the cell you picked.',
    pasteMode: 'Applies as', pasteZero: 'Zero the remaining years', pasteGo: 'Apply', pasteCell: 'Paste values from this cell down',
    /* scenario editor and hazards */
    scnLabel: 'FGPS Scenario', scnEdit: 'Scenario', scnDel: 'Delete This Scenario', scnRen: 'Rename This Scenario', scnNew: 'Add New Empty Scenario', scnClone: 'Clone This Scenario', scnName: 'Scenario Name', newScn: 'New Scenario', copyOf: 'Copy of',
    hzTitle: 'Significant Life Events / Hazards', hzEvent: 'Event', hzPick: 'Select an event', hzClear: 'Clear Hazard', hazards: 'Hazards',
    hz_disability: 'Disability', hz_inflation: 'Inflation', hz_ltc: 'Long Term Care', hz_liability: 'Major Liability', hz_market: 'Market Volatility', hz_death: 'Premature Death', hz_tax: 'Tax Rate Changes',
    hzClient: 'Client', hzSpouse: 'Spouse', hzStart: 'Start Age', hzEnd: 'End Age', hzAge: 'Age', hzAnnual: 'Annual Expense', hzAmount: 'Amount', hzOrd: 'Ordinary Rate', hzCg: 'Cap Gain Rate', hzAsPct: 'Apply as a Percentage Change', hzMkt: 'Market Return %', hzInf: 'Inflation Rate', hzAt: '@',
    /* controls */
    tankScale: 'Tank Scale', eoy: 'EOY', eoyTip: 'Show end-of-year tank balances', ageLab: 'Age', stepLab: 'Step', calcing: 'Calculating',
    gpsDisc: 'Hypothetical illustration using the assumptions entered. Not a guarantee or a projection of any specific product; taxes are estimates under current law, and actual results will vary.'
  };
  const INVT = { taxable: 1, tdbt: 1, tdat: 1, taxfree: 1, annuity: 1 };
  /* Esc with stacked GPS dialogs closes only the topmost one (window capture runs before the stage's own handlers) */
  if (!window.__b06esc) {
    window.__b06esc = true;
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || (EFA.edit && EFA.edit.on)) return;
      const ovs = Array.from(document.querySelectorAll('.st-overlay'));
      const top = ovs[ovs.length - 1];
      if (ovs.length > 1 && top && top.classList.contains('b06-gd') && top.close) { e.stopImmediatePropagation(); e.preventDefault(); top.close(); }
    }, true);
  }
  const HZT = ['disability', 'inflation', 'ltc', 'liability', 'market', 'death', 'tax'];
  const isRetiredHH = (G) => G.clientRetireAge <= G.clientAge && (!G.useSpouse || G.spouseRetireAge <= G.spouseAge);
  const ownerAge = (G, rec) => (rec.owner === 'spouse' && G.useSpouse ? G.spouseAge : G.clientAge);
  const lcopy = (ctx, k) => ctx.t(k);
  function hazardHTML(ctx, hz) {
    if (!hz) return '';
    const span = hz.type === 'disability' || hz.type === 'ltc' || hz.type === 'inflation';
    const one = (who) => `${who === 'spouse' ? ctx.t('hzSpouse') + ' ' : ''}<span class="num">${ctx.text('hzAt')} ${hz[who + 'StartAge']}${span && hz[who + 'EndAge'] != null ? '-' + hz[who + 'EndAge'] : ''}</span>`;
    const parts = [];
    const personal = ['disability', 'ltc', 'death', 'liability'].indexOf(hz.type) >= 0;
    if (!personal || hz.clientActive) parts.push(one('client'));
    if (personal && hz.spouseActive) parts.push(one('spouse'));
    return `${ctx.t('hz_' + hz.type)}<br>${parts.join(', ')}`;
  }
  const badge = (ctx, st) => {
    if (!st || st.s === 'current') return `<span class="badge">${ctx.t('bCA')}</span>`;
    if (st.s === 'retire') return `<span class="badge">${ctx.t('bRA')}</span>`;
    if (st.s === 'le') return `<span class="badge">${ctx.t('bLE')}</span>`;
    return `<span class="num">${st.age == null ? '' : st.age}</span>`;
  };
  const tyS = (ctx, t) => ctx.t(GCOPY['tyS_' + t] ? 'tyS_' + t : 'ty_' + t);
  const pctTxt = (v) => F.pct(v || 0, 2);

  /* ---------- account editor (dialogs 2 to 6, fgps23's Save More "Add") ---------- */
  /** the Advanced Options checkbox, remembered for the session */
  let advOn = false;
  function acctBody(ctx, G, rec) {
    const t = rec.type, f = (k, lab, ty, o) => fld(ctx, rec, k, lab, ty, o), s = (k, lab, o) => swf(ctx, rec, k, lab, o), d = (k, lab, opts, o) => ddf(ctx, rec, k, lab, opts, o), st = (k, lab) => stratf(ctx, rec, k, lab);
    const own = [['client', ctx.t('ownClient')]].concat(G.useSpouse ? [['spouse', ctx.t('ownSpouse')], ['joint', ctx.t('ownJoint')]] : []);
    const risk = [['low', ctx.t('rLow')], ['med', ctx.t('rMed')], ['high', ctx.t('rHigh')]];
    const bm = [['avg', ctx.t('bmAvg')], ['fifo', ctx.t('bmFifo')], ['lifo', ctx.t('bmLifo')]];
    const g = (c, html) => `<div class="b06-fg" style="--c:${c}">${html}</div>`;
    const head = g(3, f('name', 'f_name', 'text', { req: true }) + d('owner', 'f_owner', own));
    const contrib = g(4, f('contrib', 'f_contrib', 'money') + f('contribInfl', 'f_contribInfl', 'pct') + st('cStart', 'f_cStart') + st('cEnd', 'f_cEnd'));
    const mkts = GPS.markets();
    let mh = '';
    if (G.useMarketHistory && mkts.length && (INVT[t])) {
      mh = g(3, s('useGlobalMH', 'f_followMH') + (rec.useGlobalMH ? '' : s('useMH', 'f_ownMH')));
      if (!rec.useGlobalMH && rec.useMH) mh += g(3, d('market', 'market', mkts.map((m) => [m.key, EFA.util.esc(m.label)])) + f('mhStart', 'startYear', 'num') + f('mhEnd', 'endYear', 'num'));
      if (t === 'annuity' && (rec.useMH || rec.useGlobalMH)) {
        mh += g(3, s('limits', 'f_limits'));
        if (rec.limits) mh += g(5, ['floor', 'cap', 'part', 'spread', 'interval'].map((k) => `<div class="b06-f">${s(k + 'On', 'f_' + k)}${rec[k + 'On'] ? f(k, 'f_' + k, k === 'interval' ? 'int' : 'pct').replace('<span class="l">' + ctx.t('f_' + k) + '</span>', '') : ''}</div>`).join(''));
      }
    }
    let b = head;
    if (t === 'taxable') b += g(4, f('balance', 'f_balance', 'money') + f('costBasis', 'f_basis', 'money') + f('ret', 'f_ret', 'pct') + f('ordPct', 'f_ordPct', 'pct')) + g(4, f('fee', 'f_fee', 'pct') + d('basisMethod', 'f_basisMethod', bm) + d('risk', 'f_risk', risk) + s('feesDeductible', 'f_feesDed')) + contrib + g(3, s('payTaxFromLifestyle', 'f_payTax') + s('accessible', 'f_access') + s('mcp', 'f_mcp')) + mh;
    if (t === 'tdbt' || t === 'tdat') b += g(4, f('balance', 'f_balance', 'money') + (t === 'tdat' ? f('costBasis', 'f_basis', 'money') : '') + f('ret', 'f_ret', 'pct') + f('fee', 'f_fee', 'pct') + (t === 'tdat' ? d('basisMethod', 'f_basisMethod', bm) : '')) + g(4, f('match', 'f_match', 'money') + d('risk', 'f_risk', risk)) + contrib
      + g(3, (t === 'tdat' ? s('roth', 'f_roth') + s('hasRMD', 'f_hasRmd') : '') + ((t === 'tdbt' || rec.hasRMD) ? s('enforceRMD', 'f_rmd') : '') + s('allowEarly', 'f_early') + s('earlyPenalty', 'f_penalty') + s('accessible', 'f_access') + s('mcp', 'f_mcp')) + mh;
    if (t === 'taxfree') b += g(4, f('balance', 'f_balance', 'money') + f('ret', 'f_ret', 'pct') + f('fee', 'f_fee', 'pct') + d('risk', 'f_risk', risk)) + contrib + g(3, s('accessible', 'f_access') + s('mcp', 'f_mcp')) + mh;
    if (t === 'annuity') b += g(4, f('balance', 'f_balance', 'money') + f('costBasis', 'f_basis', 'money') + f('ret', 'f_ret', 'pct') + f('fee', 'f_fee', 'pct')) + g(4, f('surrenderPct', 'f_surr', 'pct') + f('bonusPct', 'f_bonus', 'pct') + d('basisMethod', 'f_basisMethod', bm) + d('risk', 'f_risk', risk)) + contrib
      + g(4, s('qualified', 'f_qualified') + (rec.qualified ? s('roth', 'f_roth') + s('enforceRMD', 'f_rmd') : '') + s('simple', 'f_simple') + s('incomeRider', 'f_incRider') + s('survivor', 'f_survBen') + s('wdAsInflow', 'f_wdInflow') + s('disabilityRider', 'f_disRider') + s('ltcRider', 'f_ltcRider') + s('accessible', 'f_access') + s('mcp', 'f_mcp'))
      + g(3, s('useIll', 'f_useIll') + (rec.useIll ? `<button type="button" class="st-pill ghost" data-ill style="justify-self:start">${ctx.t('f_editIll')}</button>` : '')) + mh;
    if (t === 'pli') b += g(4, f('premium', 'f_premium', 'money') + f('db', 'f_db', 'money') + f('av', 'f_av', 'money') + f('csv', 'f_csv', 'money')) + g(4, st('init', 'f_init') + s('ilit', 'f_ilit') + s('disabilityRider', 'f_disRider') + s('ltcRider', 'f_ltcRider'))
      + g(3, s('accessible', 'f_access') + s('useIll', 'f_useIll') + (rec.useIll ? `<button type="button" class="st-pill ghost" data-ill style="justify-self:start">${ctx.t('f_editIll')}</button>` : ''));
    if (t === 'property') b += g(4, f('value', 'f_value', 'money') + f('costBasis', 'f_basis', 'money') + f('appr', 'f_appr', 'pct') + f('exclusion', 'f_excl', 'money'))
      + g(4, d('treatment', 'f_treat', [['taxable', ctx.t('trTaxable')], ['taxdef', ctx.t('trTaxdef')], ['taxadv', ctx.t('trTaxadv')]]) + st('init', 'f_init') + f('cashRequired', 'f_cash', 'money') + d('risk', 'f_risk', risk))
      + g(4, s('residence', 'f_residence') + s('accessible', 'f_access') + s('sell', 'f_sell') + (rec.sell ? f('saleAge', 'f_saleAge', 'int') + f('saleProceeds', 'f_saleProc', 'money') : ''));
    if (t === 'note') b += g(4, f('balance', 'f_balance', 'money') + f('rate', 'f_rate', 'pct') + f('pmt', 'f_pmtCard', 'cents') + st('init', 'f_init'));
    if (t === 'loan') b += g(4, f('balance', 'f_balance', 'money') + f('rate', 'f_rate', 'pct') + f('pmt', 'f_pmt', 'cents', { extra: `<button type="button" class="b06-mag" data-pmtcalc>${IC.calc}</button>` }) + f('creditLine', 'f_line', 'money'))
      + `<div class="b06-fg pmtcalc" style="--c:4" hidden>${fld(ctx, { term: 360 }, 'term', 'f_term', 'int')}<button type="button" class="st-pill" data-pmtgo style="align-self:end">${ctx.t('f_calcPmt')}</button></div>`
      + g(4, f('proceeds', 'f_proceeds', 'money') + st('init', 'f_init') + s('deductible', 'f_ded') + s('collateralized', 'f_secured'))
      + g(4, s('payOff', 'f_payOff') + (rec.payOff ? f('payOffAge', 'f_payOffAge', 'int') : '') + s('payOffAtDeath', 'f_payDeath'));
    if (t === 'credit') b += g(4, f('balance', 'f_balance', 'money') + f('rate', 'f_rate', 'pct') + f('pmt', 'f_pmtCard', 'cents') + f('charges', 'f_charges', 'money')) + g(3, s('payMin', 'f_payMin') + s('grace', 'f_grace') + s('deductible', 'f_ded'));
    if (t === 'income') b += g(4, f('amount', 'f_amount', 'money') + f('infl', 'f_infl', 'pct') + st('iStart', 'f_iStart') + st('iEnd', 'f_iEnd')) + g(4, f('taxablePct', 'f_taxablePct', 'pct') + f('deductible', 'f_dedAmt', 'money') + s('ss', 'f_ss') + s('survivor', 'f_survBen'))
      + g(4, (rec.survivor ? f('survivorPct', 'f_survPct', 'pct') : '') + s('wages', 'f_wages') + (rec.wages ? s('selfEmployed', 'f_selfEmp') : ''));
    if (t === 'expense') b += g(4, f('amount', 'f_amount', 'money') + f('infl', 'f_infl', 'pct') + st('iStart', 'f_iStart') + st('iEnd', 'f_iEnd')) + g(3, d('usage', 'f_usage', [['itemized', ctx.t('usItem')], ['taxes', ctx.t('usTaxes')]]) + s('deductible', 'f_ded') + s('mcp', 'f_mcp'));
    if (t === 'term') b += g(4, d('policyType', 'f_ptype', [['life', ctx.t('ptLife')], ['disability', ctx.t('ptDis')], ['ltc', ctx.t('ptLtc')], ['pc', ctx.t('ptPc')], ['umbrella', ctx.t('ptUmb')]]) + f('premium', 'f_premium', 'money') + f('premInfl', 'f_premInfl', 'pct') + f('benefit', 'f_benefit', 'money'))
      + g(4, (rec.policyType === 'disability' ? f('cola', 'f_cola', 'pct') : '') + st('iStart', 'f_iStart') + st('iEnd', 'f_iEnd'));
    if (rec.actions && rec.actions.length && !(advOn && ACTM[t])) b += `<p class="b06-note">${ctx.t('advNote')}</p>`;
    return b;
  }
  /** open the editor for rec (a copy is edited); onSave(rec) on Save */
  function openAcct(ctx, rec, isNew, onSave) {
    const G = GX.G(), w = { taxable: 1000, tdbt: 1000, tdat: 1000, taxfree: 940, annuity: 1060, pli: 960, property: 960, note: 900, loan: 960, credit: 900, income: 960, expense: 900, term: 960 }[rec.type] || 900;
    const r = JSON.parse(JSON.stringify(rec));
    ['contribInfl', 'infl'].forEach((k) => { if (k in r && r[k] == null) r[k] = G.inflationRate; });
    if (r.type === 'term' && r.cola == null) r.cola = G.inflationRate;
    const ov = gdlg(ctx, {
      title: `<span>${ctx.t(isNew ? "addNew" : "edit")} ${ctx.t("ty_" + r.type)}</span>`, w,
      body: '', foot: `${ACTM[r.type] ? `<div class="b06-sw"><button type="button" class="b06-switch advb" role="switch" aria-checked="${advOn}"></button>${ctx.t('advOpts')}</div>` : '<span></span>'}<div class="grp"><button type="button" class="st-pill ghost cx">${ctx.t('cancel')}</button><button type="button" class="st-pill sv">${ctx.t('save')}</button></div>`
    });
    const adv = ov.querySelector('.advb');
    if (adv) adv.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; advOn = !advOn; adv.setAttribute('aria-checked', advOn); draw(); });
    const host = ov.querySelector('.b06-gdb');
    const draw = () => {
      host.innerHTML = `<div style="display:grid;gap:14px">${acctBody(ctx, G, r)}${advOn && ACTM[r.type] ? actionsHTML(ctx, r) : ''}</div>`;
      const inner = host.firstElementChild;
      if (advOn && ACTM[r.type]) {
        const menu = inner.querySelector('.amenu'), am = inner.querySelector('.aadd');
        const acts = () => (r.actions = r.actions || []);
        if (am) am.addEventListener('click', (e) => { if (EFA.edit && EFA.edit.on) return; e.stopPropagation(); menu.hidden = !menu.hidden; });
        inner.addEventListener('click', () => { if (menu) menu.hidden = true; });
        inner.querySelectorAll('[data-amode]').forEach((b) => b.addEventListener('click', (e) => {
          if (EFA.edit && EFA.edit.on) return;
          e.stopPropagation(); menu.hidden = true;
          openAction(ctx, G, r, { mode: b.dataset.amode }, true, (ac) => { acts().push(ac); draw(); });
        }));
        inner.querySelectorAll('[data-aed]').forEach((b) => b.addEventListener('click', () => {
          if (EFA.edit && EFA.edit.on) return;
          const i = +b.dataset.aed;
          openAction(ctx, G, r, acts()[i], false, (ac) => { acts()[i] = ac; draw(); });
        }));
        inner.querySelectorAll('[data-adl]').forEach((b) => b.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; acts().splice(+b.dataset.adl, 1); draw(); }));
        inner.querySelectorAll('[data-aup]').forEach((b) => b.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; const i = +b.dataset.aup, a = acts(); a.splice(i - 1, 0, a.splice(i, 1)[0]); draw(); }));
        inner.querySelectorAll('[data-adn]').forEach((b) => b.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; const i = +b.dataset.adn, a = acts(); a.splice(i + 1, 0, a.splice(i, 1)[0]); draw(); }));
      }
      bindForm(ctx, inner, r, (k) => { if (typeof r[k] === 'boolean' || (r[k] && typeof r[k] === 'object' && !Array.isArray(r[k])) || ['owner', 'policyType', 'risk'].indexOf(k) >= 0) draw(); });
      const ib = inner.querySelector('[data-ill]');
      if (ib) ib.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; openIll(ctx, G, r); });
      const pc = inner.querySelector('[data-pmtcalc]');
      if (pc) {
        const box = inner.querySelector('.pmtcalc'), tm = { term: 360 };
        bindForm(ctx, box, tm);
        pc.addEventListener('click', (e) => { e.preventDefault(); box.hidden = !box.hidden; });
        inner.querySelector('[data-pmtgo]').addEventListener('click', () => {
          if (EFA.edit && EFA.edit.on) return;
          const n = Math.max(1, Math.round(F.parse(box.querySelector('input').value) || 360)), i = (r.rate || 0) / 12, bal = r.balance || 0;
          r.pmt = Math.round((i ? bal * i / (1 - Math.pow(1 + i, -n)) : bal / n) * 100) / 100; draw();
        });
      }
      EFA.numify(host); if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
    };
    draw();
    ov.querySelector('.cx').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) ov.close(); });
    ov.querySelector('.sv').addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      if (document.activeElement && host.contains(document.activeElement)) document.activeElement.blur();
      if (!String(r.name || '').trim()) r.name = ctx.text('ty_' + r.type);
      ov.close(); onSave(r);
    });
    return ov;
  }
  /** illustration grid editor (yearly rows from the owner's age to 100) */
  function openIll(ctx, G, r) {
    const a0 = ownerAge(G, r), n = 100 - a0 + 1;
    const cols = r.type === 'pli' ? [['premium', 'illPrem'], ['withdrawal', 'illWd'], ['accumulationValue', 'illAV'], ['cashSurrenderValue', 'illCSV'], ['deathBenefit', 'illDB']]
      : [['contribution', 'illContrib'], ['withdrawal', 'illWd'], ['contractValue', 'illCV'], ['surrenderValue', 'illSV'], ['deathBenefit', 'illDB']];
    const rows = Array.from({ length: n }, (_, i) => Object.assign({}, (r.ill || [])[i] || {}));
    const cell = (v) => (v == null || v === '' ? '' : F.money(+v, { dp: 2 }));
    const ov = gdlg(ctx, {
      title: ctx.t('illHead'), w: 1100,
      body: `<div class="scroll" style="max-height:520px"><table class="b06-grid"><thead><tr><th>${ctx.t('illYear')}</th>${cols.map(([, k]) => `<th>${ctx.t(k)}</th>`).join('')}</tr></thead><tbody>${rows.map((x, i) => `<tr><td class="y num">${a0 + i}</td>${cols.map(([k]) => `<td><input data-r="${i}" data-c="${k}" value="${cell(x[k])}"></td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="b06-note">${ctx.t('illNote')}</p>`,
      foot: `<div class="grp"><button type="button" class="st-pill ghost ip">${ctx.t('illInterp')}</button><button type="button" class="st-pill ghost pb">${ctx.t('pasteHead')}</button></div><div class="grp"><button type="button" class="st-pill ghost cx">${ctx.t('cancel')}</button><button type="button" class="st-pill sv">${ctx.t('illSave')}</button></div>`
    });
    const refresh = () => ov.querySelectorAll('input[data-r]').forEach((i2) => { i2.value = cell(rows[+i2.dataset.r][i2.dataset.c]); });
    const sel = { r: 0, c: cols[0][0] };
    const mark = (inp) => { ov.querySelectorAll('td.sel').forEach((td) => td.classList.remove('sel')); if (inp) inp.closest('td').classList.add('sel'); };
    ov.querySelectorAll('input[data-r]').forEach((inp) => {
      inp.addEventListener('keydown', (e) => e.stopPropagation());
      inp.addEventListener('focus', () => { sel.r = +inp.dataset.r; sel.c = inp.dataset.c; mark(inp); });
      inp.setAttribute('title', ctx.text('pasteCell'));
      inp.addEventListener('contextmenu', (e) => {
        if (EFA.edit && EFA.edit.on) return;
        e.preventDefault(); sel.r = +inp.dataset.r; sel.c = inp.dataset.c; mark(inp);
        openPaste(ctx, applyPaste);
      });
      inp.addEventListener('blur', () => { const v = inp.value.trim() === '' ? null : Math.round(F.parse(inp.value) * 100) / 100; rows[+inp.dataset.r][inp.dataset.c] = v; inp.value = cell(v); });
    });
    /** the copy and paste helper: a column of values from the selected cell down */
    function applyPaste(vals, mode, zero) {
      const c = sel.c, r0 = Math.max(0, Math.min(n - 1, sel.r));
      vals.forEach((v, k) => {
        const i = r0 + k;
        if (i >= n) return;
        const cur = +rows[i][c] || 0;
        rows[i][c] = mode === 'add' ? Math.round((cur + v) * 100) / 100 : mode === 'subtract' ? Math.round((cur - v) * 100) / 100 : v;
      });
      if (zero) for (let i = r0 + vals.length; i < n; i++) rows[i][c] = 0;
      refresh();
    }
    ov.querySelector('.pb').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) openPaste(ctx, applyPaste); });
    ov.querySelector('.ip').addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      cols.forEach(([k]) => {
        let last = -1;
        for (let i = 0; i < n; i++) {
          if (rows[i][k] == null || rows[i][k] === '') continue;
          if (last >= 0 && i - last > 1) for (let j = last + 1; j < i; j++) rows[j][k] = Math.round((+rows[last][k] + (+rows[i][k] - +rows[last][k]) * (j - last) / (i - last)) * 100) / 100;
          last = i;
        }
      });
      refresh();
    });
    ov.querySelector('.cx').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) ov.close(); });
    ov.querySelector('.sv').addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      let lastFilled = -1;
      rows.forEach((x, i) => { if (cols.some(([k]) => x[k] != null && x[k] !== '')) lastFilled = i; });
      r.ill = lastFilled < 0 ? [] : rows.slice(0, lastFilled + 1).map((x) => { const o = {}; cols.forEach(([k]) => { o[k] = x[k] == null ? 0 : +x[k]; }); return o; });
      const y1 = r.ill[0];
      if (y1) { if (r.type === 'pli') { r.premium = y1.premium; r.av = y1.accumulationValue; r.csv = y1.cashSurrenderValue; r.db = y1.deathBenefit; } else r.balance = y1.contractValue; }
      ov.close();
    });
  }

  /* ---------- list dialogs 2 to 6 ---------- */
  const LISTS = {
    2: { title: 'd2', w: 860, adds: ['income'], keep: (a) => a.type === 'income' },
    3: { title: 'd3', w: 1180, adds: ['taxable', 'tdbt', 'tdat', 'taxfree', 'annuity', 'pli', 'property', 'note'], keep: (a) => ((INVT[a.type] && !a.mcp) || a.type === 'note' || a.type === 'pli' || (a.type === 'property' && !a.residence)) },
    4: { title: 'd4', w: 960, adds: ['loan', 'credit'], keep: (a) => a.type === 'loan' || a.type === 'credit' },
    5: { title: 'd5', w: 960, adds: ['property'], keep: (a) => (INVT[a.type] && a.mcp) || (a.type === 'property' && a.residence) },
    6: { title: 'd6', w: 960, adds: ['expense', 'term'], keep: (a) => a.type === 'expense' || a.type === 'term' }
  };
  function listCols(ctx, n) {
    const m = (v) => `<span class="num">${F.money(v || 0)}</span>`;
    const rate = (a) => (G0().useMarketHistory && (a.useMH || a.useGlobalMH) && INVT[a.type] ? `<span class="badge">${ctx.t('bMH')}</span>` : (a.type === 'pli' ? '' : `<span class="num">${pctTxt(a.ret != null ? a.ret : a.rate != null ? a.rate : a.appr)}</span>`));
    const yn = (v) => ctx.t(v ? 'yes' : 'no');
    const rk = (a) => ctx.t({ low: 'rLow', med: 'rMed', high: 'rHigh' }[a.risk] || 'rMed');
    const bal = (a) => (a.type === 'pli' ? `<span class="csv">${m(a.csv)}</span>` : m(a.type === 'property' ? a.value : a.balance));
    if (n === 2) return [['cName', (a) => EFA.util.esc(a.name)], ['cAmount', (a) => m(a.amount), 'r'], ['cStart', (a) => badge(ctx, a.iStart), 'c'], ['cEnds', (a) => badge(ctx, a.iEnd), 'c']];
    if (n === 3) return [['cName', (a) => EFA.util.esc(a.name)], ['cBalance', bal, 'r'], ['cRate', rate, 'r'], ['cType', (a) => tyS(ctx, a.type)], ['cRisk', rk], ['cAccess', (a) => yn(a.accessible), 'c']];
    if (n === 4) return [['cName', (a) => EFA.util.esc(a.name)], ['cBalance', bal, 'r'], ['cRate', rate, 'r'], ['cPmt', (a) => (a.type === 'credit' && a.payMin ? ctx.t('cMin') : `<span class="num">${F.money(a.pmt || 0, { dp: 2 })}</span>`), 'r'], ['cType', (a) => tyS(ctx, a.type)]];
    if (n === 5) return [['cName', (a) => EFA.util.esc(a.name)], ['cBalance', bal, 'r'], ['cRate', rate, 'r'], ['cRisk', rk], ['cAccess', (a) => yn(a.accessible), 'c']];
    return [['cName', (a) => EFA.util.esc(a.name)], ['cAmount', (a) => m(a.type === 'term' ? a.benefit : a.amount), 'r'], ['cStart', (a) => badge(ctx, a.iStart), 'c'], ['cEnds', (a) => badge(ctx, a.iEnd), 'c'], ['cInflate', (a) => (a.type === 'term' ? '' : `<span class="num">${pctTxt(a.infl == null ? G0().inflationRate : a.infl)}</span>`), 'r']];
  }
  const G0 = () => GX.G();
  function openList(ctx, n, sid, onDone) {
    const L = LISTS[n];
    let changed = false;
    const ov = gdlg(ctx, {
      title: ctx.t(L.title), w: L.w, body: '<div class="lst"></div>',
      foot: `<div class="grp">${L.adds.length > 1 ? `<button type="button" class="st-pill addm">${ctx.t('add')} ${IC.up}</button><div class="b06-menu" hidden>${L.adds.map((t) => `<button type="button" data-add="${t}">${ctx.t('ty_' + t)}</button>`).join('')}</div>` : `<button type="button" class="st-pill" data-add="${L.adds[0]}">${ctx.t('add')}</button>`}</div><div class="grp"><button type="button" class="st-pill okb">${ctx.t('ok')}</button></div>`,
      onClose: () => { GX.markVisited(sid, n); onDone(changed); }
    });
    const host = ov.querySelector('.lst');
    const draw = () => {
      const sc = GX.get(sid), cols = listCols(ctx, n), items = (sc ? sc.accounts : []).filter((a) => L.keep(a));
      host.innerHTML = `<div class="scroll"><table class="tbl"><thead><tr>${cols.map(([k, , c]) => `<th class="${c || ''}">${ctx.t(k)}</th>`).join('')}<th></th></tr></thead><tbody>${items.length ? items.map((a) => `<tr data-id="${a.id}">${cols.map(([, fn, c]) => `<td class="${c || ''}">${fn(a)}</td>`).join('')}<td class="r" style="white-space:nowrap"><button type="button" class="b06-mag" data-ed title="">${IC.pencil}</button> <button type="button" class="b06-mag" data-dl>${IC.warn.replace('M12 3 2 21h20z', 'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13')}</button></td></tr>`).join('') : `<tr class="empty"><td colspan="${cols.length + 1}">${ctx.t('empty')}</td></tr>`}</tbody></table></div>`;
      EFA.numify(host); if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
      host.querySelectorAll('[data-ed]').forEach((b) => b.addEventListener('click', () => {
        if (EFA.edit && EFA.edit.on) return;
        const id = b.closest('tr').dataset.id, sc2 = GX.get(sid), a = sc2.accounts.find((x) => x.id === id);
        openAcct(ctx, a, false, (r) => { const s3 = GX.get(sid); s3.accounts = s3.accounts.map((x) => (x.id === id ? r : x)); GX.put(s3); changed = true; draw(); });
      }));
      host.querySelectorAll('[data-dl]').forEach((b) => b.addEventListener('click', () => {
        if (EFA.edit && EFA.edit.on) return;
        const id = b.closest('tr').dataset.id;
        gconfirm(ctx, ctx.t('confirmDel'), 'del', () => { const s3 = GX.get(sid); s3.accounts = s3.accounts.filter((x) => x.id !== id); GX.put(s3); changed = true; draw(); });
      }));
    };
    draw();
    const menu = ov.querySelector('.b06-menu');
    const am = ov.querySelector('.addm');
    if (am) am.addEventListener('click', (e) => { if (EFA.edit && EFA.edit.on) return; e.stopPropagation(); menu.hidden = !menu.hidden; });
    ov.addEventListener('click', () => { if (menu) menu.hidden = true; });
    ov.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', (e) => {
      if (EFA.edit && EFA.edit.on) return;
      e.stopPropagation(); if (menu) menu.hidden = true;
      const t = b.dataset.add, rec = GPS.newAccount(t, n === 5 && t === 'property' ? { residence: true } : (n === 3 && t === 'property' ? { residence: false } : {}));
      openAcct(ctx, rec, true, (r) => { const s3 = GX.get(sid); s3.accounts.push(r); GX.put(s3); changed = true; draw(); });
    }));
    ov.querySelector('.okb').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) ov.close(); });
    return ov;
  }

  /* ---------- dialog 1: personal info and general assumptions ---------- */
  function openD1(ctx, sid, onDone) {
    const g0 = GX.G(), g = JSON.parse(JSON.stringify(g0));
    const open = { contact: true };
    const ov = gdlg(ctx, { title: ctx.t('d1'), w: 1060, body: '<div class="d1"></div>', foot: `<span class="b06-note">${ctx.t('taxNote')}</span><div class="grp"><button type="button" class="st-pill okb">${ctx.t('ok')}</button></div>`, onClose: close });
    const host = ov.querySelector('.d1');
    function sec(key, id, html, dis) { return `<div class="b06-acc ${open[id] ? 'open' : ''} ${dis ? 'dis' : ''}" data-sec="${id}"><button type="button" class="hd">${ctx.t(key)}${IC.chev}</button><div class="bd">${html}</div></div>`; }
    function draw() {
      const has = !!g.contactId, f = (k, lab, ty, o) => fld(ctx, g, k, lab, ty, o), s = (k, lab, o) => swf(ctx, g, k, lab, o), gg = (c, h) => `<div class="b06-fg" style="--c:${c}">${h}</div>`;
      const mk = GPS.markets(), m = mk.find((x) => x.key === g.globalMarket) || mk[0];
      if (g.useMarketHistory && m && !g.globalMarket) g.globalMarket = m.key;
      const avg = m ? GPS.averageReturn(m.key, g.mhStartYear, g.mhEndYear) : null;
      const fsOpts = [['single', ctx.t('fsSingle')], ['mfj', ctx.t('fsMfj')], ['mfs', ctx.t('fsMfs')], ['hoh', ctx.t('fsHoh')]];
      const priv = privacyOn();
      const contact = gg(3, f('contactName', 'contactName', 'text', { req: true }) + (has ? '' : `<button type="button" class="st-pill addc" style="align-self:end" ${String(g.contactName || '').trim() ? '' : 'disabled'}>${ctx.t('addContact')}</button>`))
        + (priv ? '' : gg(3, f('mobilePhone', 'mobilePhone', 'phone') + f('altPhone', 'altPhone', 'phone') + f('email', 'email', 'text'))
          + gg(4, f('street', 'street', 'text') + f('city', 'city', 'text') + f('state', 'stateL', 'text', { maxlen: 2 }) + f('zip', 'zip', 'text'))
          + gg(3, f('email2', 'email2', 'text')))
        + `<div style="display:flex;align-items:center;gap:16px;margin-top:12px;flex-wrap:wrap"><div class="b06-sw"><button type="button" class="b06-switch privb" role="switch" aria-checked="${priv}"></button>${ctx.t('privacy')}</div><p class="b06-note" style="margin:0;max-width:430px">${ctx.t(priv ? 'privacyNote' : 'privacyNote2')}</p></div>`;
      const fin = gg(4, f('inflationRate', 'inflationRate', 'pct', { extra: `<button type="button" class="b06-mag" data-inf>${IC.mag}</button>` })
        + (g.autoTaxRate ? ddf(ctx, g, 'filingStatus', 'filing', fsOpts, { cls: g.filingStatus === 'mfj' && !g.useSpouse ? 'b06-warnt' : '' }) + f('stateTaxRate', 'stateTax', 'pct') + s('itemize', 'itemize')
          : f('taxAccumulation', 'accTax', 'pct', { extra: `<button type="button" class="b06-mag" data-tax>${IC.mag}</button>` }) + f('taxDistribution', 'distTax', 'pct') + f('taxCapGains', 'cgTax', 'pct')))
        + (g.autoTaxRate ? gg(4, g.itemize ? f('deductions', 'deductions', 'money') : s('clientBlind', 'cb') + (g.useSpouse ? s('spouseBlind', 'sb') : '')) + (g.filingStatus === 'mfj' && !g.useSpouse ? `<p class="b06-note" style="color:#b3402e">${ctx.t('jointNoSpouse')}</p>` : '') : '')
        + gg(4, s('autoTaxRate', 'autoTax') + s('useMarketHistory', 'useMH') + (priv ? '' : f('creditScore', 'creditScore', 'int')))
        + (g.useMarketHistory ? (m ? gg(4, ddf(ctx, g, 'globalMarket', 'market', mk.map((x) => [x.key, EFA.util.esc(x.label)])) + f('mhStartYear', 'startYear', 'num') + f('mhEndYear', 'endYear', 'num') + `<div class="b06-f"><span class="l">${ctx.t('avgRor')}</span><input class="num" readonly value="${avg == null ? '' : F.pct(avg, 2)}"></div>`) : `<p class="b06-note">${ctx.t('noMarkets')}</p>`) : '');
      const leBtn = (who) => `<button type="button" class="b06-mag" data-le="${who}">${IC.mag}</button>`;
      const occ = (who) => (priv ? '' : gg(4, f(who + 'DOB', 'dob', 'date') + f(who + 'Position', 'position', 'text') + f(who + 'Employer', 'employer', 'text') + f(who + 'WorkPhone', 'workPhone', 'phone')));
      const client = gg(4, f('clientName', 'clientName', 'text') + f('clientAge', 'age', 'int', { min: 0, max: 100 }) + f('clientRetireAge', 'retireAge', 'int', { min: 0, max: 100 }) + f('clientLE', 'le', 'int', { min: 0, max: 120, extra: leBtn('client') })) + occ('client');
      const spouse = gg(4, s('useSpouse', 'useSpouse')) + (g.useSpouse ? gg(4, f('spouseName', 'clientName', 'text') + f('spouseAge', 'age', 'int', { min: 0, max: 100 }) + f('spouseRetireAge', 'retireAge', 'int', { min: 0, max: 100 }) + f('spouseLE', 'le', 'int', { min: 0, max: 120, extra: leBtn('spouse') })) + occ('spouse') : '');
      const kids = `<table class="tbl"><thead><tr><th>${ctx.t('kidName')}</th>${priv ? '' : `<th>${ctx.t('dob')}</th>`}<th class="r">${ctx.t('kidAge')}</th><th></th></tr></thead><tbody>${(g.children || []).length ? g.children.map((c, i) => `<tr><td><input class="kid" data-i="${i}" data-k="name" value="${EFA.util.esc(c.name || '')}" style="width:100%;height:34px;border:1px solid #cbd5e3;border-radius:7px;padding:0 8px;font:600 16px DM Sans,sans-serif"></td>${priv ? '' : `<td><input class="kid" type="date" data-i="${i}" data-k="dob" value="${EFA.util.esc(c.dob || '')}" style="height:34px;border:1px solid #cbd5e3;border-radius:7px;padding:0 8px;font:600 15px DM Sans,sans-serif"></td>`}<td class="r"><input class="kid num" data-i="${i}" data-k="age" value="${c.age == null ? '' : c.age}" style="width:80px;height:34px;border:1px solid #cbd5e3;border-radius:7px;text-align:right;padding:0 8px;font:600 16px DM Sans,sans-serif"></td><td class="r"><button type="button" class="b06-mag" data-kdel="${i}">&times;</button></td></tr>`).join('') : `<tr class="empty"><td colspan="${priv ? 3 : 4}">${ctx.t('noKids')}</td></tr>`}</tbody></table><button type="button" class="st-pill ghost kadd" style="margin-top:10px">${ctx.t('addChild')}</button>`;
      host.innerHTML = `<div style="display:grid;gap:8px">${sec('secContact', 'contact', contact)}${sec('secFin', 'fin', fin, !has)}${sec('secClient', 'client', client, !has)}${sec('secSpouse', 'spouse', spouse, !has)}${sec('secKids', 'kids', kids, !has)}</div>`;
      const inner = host.firstElementChild;
      ov.querySelector('.okb').disabled = !has;
      /* a redraw asked for by a blur has to wait for the blur to finish, or innerHTML throws */
      const redraw = () => ctx.timeout(draw, 0);
      bindForm(ctx, inner, g, (k) => {
        if (k === 'clientAge') ageChanged = true;
        if (k === 'clientDOB' || k === 'spouseDOB') {
          const y = g[k] ? +String(g[k]).slice(0, 4) : null;
          if (y) { const who = k === 'clientDOB' ? 'clientAge' : 'spouseAge'; g[who] = new Date().getFullYear() - y; if (who === 'clientAge') ageChanged = true; }
          return redraw();
        }
        if (['autoTaxRate', 'useMarketHistory', 'itemize', 'useSpouse', 'filingStatus', 'globalMarket', 'mhStartYear', 'mhEndYear', 'contactName'].indexOf(k) >= 0) redraw();
      });
      inner.querySelectorAll('.b06-acc > .hd').forEach((h) => h.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; const id = h.parentNode.dataset.sec; open[id] = !open[id]; h.parentNode.classList.toggle('open', open[id]); }));
      const nameIn = inner.querySelector('[data-fk="contactName"]'), addc = inner.querySelector('.addc');
      if (nameIn && addc) nameIn.addEventListener('input', () => { addc.disabled = !nameIn.value.trim(); });
      if (addc) addc.addEventListener('click', () => {
        if (EFA.edit && EFA.edit.on) return;
        g.contactName = nameIn.value.trim(); if (!g.contactName) return;
        g.contactId = 'c' + Date.now().toString(36); if (!g.clientName) g.clientName = g.contactName;
        GX.setG(g); GX.ensure(ctx); open.contact = false; open.client = true; open.fin = true; draw();
      });
      const inf = inner.querySelector('[data-inf]');
      if (inf) inf.addEventListener('click', (e) => { e.preventDefault(); const L = lib('inflation'); if (L) L.open(ctx, { onUse: (v) => { g.inflationRate = v; draw(); } }); });
      const tx = inner.querySelector('[data-tax]');
      if (tx) tx.addEventListener('click', (e) => { e.preventDefault(); if (EFA.edit && EFA.edit.on) return; GX.setG(g); GX.S().reopen1 = true; ov.close(); ctx.jump('INCTAXC', 'incTax1'); });
      inner.querySelectorAll('[data-le]').forEach((b) => b.addEventListener('click', (e) => {
        e.preventDefault(); const L = lib('lifeExpectancy'); if (!L) return;
        const sp = b.dataset.le === 'spouse';
        L.open(ctx, { age: sp ? g.spouseAge : g.clientAge, spouseAge: sp ? g.clientAge : g.spouseAge, freshAges: true, onUse: (a) => { g[sp ? 'spouseLE' : 'clientLE'] = a; draw(); } });
      }));
      inner.querySelectorAll('input.kid').forEach((inp) => {
        inp.addEventListener('keydown', (e) => e.stopPropagation());
        inp.addEventListener('blur', () => {
          const c = g.children[+inp.dataset.i], k = inp.dataset.k;
          if (k === 'age') { const v = Math.round(F.parse(inp.value)); c.age = isFinite(v) ? v : null; }
          else if (k === 'dob') { c.dob = inp.value || null; const y = c.dob ? +String(c.dob).slice(0, 4) : null; if (y) { c.age = new Date().getFullYear() - y; ctx.timeout(draw, 0); } }
          else c.name = inp.value;
        });
      });
      const pb = inner.querySelector('.privb');
      if (pb) pb.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; setPrivacy(!privacyOn()); draw(); });
      inner.querySelectorAll('[data-kdel]').forEach((b) => b.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; g.children.splice(+b.dataset.kdel, 1); draw(); }));
      const ka = inner.querySelector('.kadd'); if (ka) ka.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; (g.children = g.children || []).push({ name: '', age: null }); open.kids = true; draw(); });
      EFA.numify(host); if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
    }
    let ageChanged = false;
    function close() {
      if (document.activeElement && host.contains(document.activeElement)) document.activeElement.blur();
      const changed = JSON.stringify(g) !== JSON.stringify(GX.G());
      if (changed && g.contactId) GX.setG(g);
      if (sid) GX.markVisited(sid, 1);
      if (ageChanged && g.contactId) {
        GX.S().chartAge = g.clientAge;
        const L = lib('inflation'), y = new Date().getFullYear(), avg = L && L.average ? L.average(y - g.clientAge - 1, y - 1) : null;
        if (avg != null) {
          gconfirm(ctx, `${ctx.t('infPromptA')} <span class="num">${F.num(avg, 2)}%</span>. ${ctx.t('infPromptB')}`, 'useIt', () => { const g2 = GX.G(); g2.inflationRate = avg / 100; GX.setG(g2); onDone(true); });
        }
      }
      onDone(changed);
    }
    draw();
    ov.querySelector('.okb').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) ov.close(); });
    return ov;
  }

  /* ---------- dialog 7: desired lifestyle ---------- */
  function openD7(ctx, sid, res, onDone) {
    const sc0 = GX.get(sid); if (!sc0) return;
    const s = JSON.parse(JSON.stringify(sc0)), G = GX.G(), g = { desiredLegacy: G.desiredLegacy || 0 };
    const srcs = (res && res.sources ? res.sources : []).map((x) => ({ accountId: x.accountId, selected: !!x.selected, label: x.label }));
    const ov = gdlg(ctx, { title: ctx.t('d7'), w: 760, body: '<div class="d7"></div>', foot: `<span class="b06-note">${ctx.t('todayNote')}</span><div class="grp"><button type="button" class="st-pill okb">${ctx.t('ok')}</button></div>`, onClose: close });
    const host = ov.querySelector('.d7');
    const accOpts = () => [['null', ctx.t('none')]].concat(srcs.filter((x) => { const a = s.accounts.find((y) => y.id === x.accountId); return a && a.type !== 'loan'; }).map((x) => [x.accountId, EFA.util.esc(x.label)]));
    function draw() {
      const f = (k, lab, ty, o) => fld(ctx, s, k, lab, ty, o), sw = (k, lab) => swf(ctx, s, k, lab), gg = (c, h) => `<div class="b06-fg" style="--c:${c}">${h}</div>`;
      if (s.maintainCurrentLifestyle && res && res.T0 != null) s.desiredRetirementIncome = Math.round(res.T0);
      s.saveTo = s.saveExcessTarget ? s.saveExcessTarget.accountId : null;
      const sweep = (s.saveExcess || s.saveDeathBenefits) ? gg(2, sw('useSweepAccount', 'useSweep') + (s.useSweepAccount ? f('sweepReturnPct', 'sweepRor', 'pct', { max: 0.12, min: 0 }) : ddf(ctx, s, 'saveTo', 'saveTo', accOpts()))) : '';
      host.innerHTML = `<div style="display:grid;gap:14px">
        ${gg(2, sw('maintainCurrentLifestyle', 'maintain') + f('desiredRetirementIncome', 'desired', 'money', { cls: s.maintainCurrentLifestyle ? 'ro' : '' }))}
        ${s.maintainCurrentLifestyle ? '' : gg(2, sw('inflateLifestyle', 'inflAdj'))}
        ${gg(4, sw('adjustLifestyle', 'adjust') + (s.adjustLifestyle ? f('adjustAtAge', 'atAge', 'int') + f('adjustPct', 'pctLife', 'pct') + sw('adjustInflated', 'inflAdj2') : ''))}
        ${gg(2, fld(ctx, g, 'desiredLegacy', 'legacy', 'money') + (G.useSpouse ? f('survivorLifestylePct', 'survivor', 'pct', { max: 1, min: 0 }) : ''))}
        ${gg(2, sw('saveExcess', 'saveExcess') + (s.saveExcess ? '' : sw('recalcLifestyleAtRetirement', 'recalc')))}
        ${s.saveExcess ? '' : gg(2, sw('saveDeathBenefits', 'saveDb'))}
        ${sweep}
        <div class="b06-f"><span class="l">${ctx.t('fundHead')}</span><div class="b06-fl">${srcs.length ? srcs.map((x, i) => `<div class="it" data-i="${i}"><button type="button" class="mv" data-up ${i ? '' : 'disabled'}>${IC.up}</button><button type="button" class="mv" data-dn ${i < srcs.length - 1 ? '' : 'disabled'}>${IC.down}</button><span class="nm">${EFA.util.esc(x.label)}</span><button type="button" class="b06-switch" role="switch" data-fs="${i}" aria-checked="${x.selected}"></button></div>`).join('') : `<p class="b06-note">${ctx.t('noFund')}</p>`}</div></div>
      </div>`;
      const inner = host.firstElementChild;
      const ro = inner.querySelector('.ro input'); if (ro) ro.readOnly = true;
      bindForm(ctx, inner, s, (k) => { if (typeof s[k] === 'boolean' || k === 'saveTo') draw(); });
      bindForm(ctx, inner.querySelector('[data-wrap="desiredLegacy"]'), g);
      inner.querySelectorAll('[data-fs]').forEach((b) => b.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; const x = srcs[+b.dataset.fs]; x.selected = !x.selected; b.setAttribute('aria-checked', x.selected); }));
      inner.querySelectorAll('[data-up],[data-dn]').forEach((b) => b.addEventListener('click', () => {
        if (EFA.edit && EFA.edit.on) return;
        const i = +b.closest('.it').dataset.i, j = b.hasAttribute('data-up') ? i - 1 : i + 1;
        if (j < 0 || j >= srcs.length) return; const t = srcs[i]; srcs[i] = srcs[j]; srcs[j] = t; draw();
      }));
      EFA.numify(host); if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
    }
    function close() {
      if (document.activeElement && host.contains(document.activeElement)) document.activeElement.blur();
      s.saveExcessTarget = s.saveTo ? { accountId: s.saveTo, label: (srcs.find((x) => x.accountId === s.saveTo) || {}).label || '' } : null;
      delete s.saveTo;
      s.fundingSources = srcs;
      const cur = GX.get(sid), changed = JSON.stringify(Object.assign({}, cur, { modified: 0 })) !== JSON.stringify(Object.assign({}, s, { modified: 0 }));
      if (changed) GX.put(s);
      if ((GX.G().desiredLegacy || 0) !== g.desiredLegacy) { const g2 = GX.G(); g2.desiredLegacy = g.desiredLegacy; GX.setG(g2); }
      GX.markVisited(sid, 7); onDone(true);
    }
    draw();
    ov.querySelector('.okb').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) ov.close(); });
  }

  /* ---------- hazards dialog ---------- */
  function openHazards(ctx, then) {
    const G = GX.G(), cur = GX.S().hazard;
    const h = Object.assign({ type: null, clientActive: true, clientStartAge: G.clientAge, clientEndAge: G.clientLE, clientAmount: 0, spouseActive: false, spouseStartAge: G.spouseAge, spouseEndAge: G.spouseLE, spouseAmount: 0,
      taxOrdinaryPct: G.taxAccumulation, taxCapGainsPct: G.taxCapGains, applyAsPct: false, marketReturnPct: -0.25, inflationPct: 0.10 }, cur ? JSON.parse(JSON.stringify(cur)) : {});
    const ov = gdlg(ctx, { title: ctx.t('hzTitle'), w: 720, body: '<div class="hz"></div>', foot: `<button type="button" class="st-pill ghost clr" ${cur ? '' : 'disabled'}>${ctx.t('hzClear')}</button><div class="grp"><button type="button" class="st-pill ap">${ctx.t('apply')}</button></div>` });
    const host = ov.querySelector('.hz');
    function person(who) {
      const t = h.type, f = (k, lab, ty) => fld(ctx, h, who + k, lab, ty), personal = ['disability', 'ltc', 'death', 'liability'].indexOf(t) >= 0;
      let x = '';
      if (t === 'disability') x = f('StartAge', 'hzStart', 'int') + f('EndAge', 'hzEnd', 'int');
      if (t === 'ltc') x = f('StartAge', 'hzStart', 'int') + f('EndAge', 'hzEnd', 'int') + f('Amount', 'hzAnnual', 'money');
      if (t === 'death') x = f('StartAge', 'hzAge', 'int');
      if (t === 'liability') x = f('StartAge', 'hzAge', 'int') + f('Amount', 'hzAmount', 'money');
      if (t === 'tax') x = f('StartAge', 'hzStart', 'int') + fld(ctx, h, 'taxOrdinaryPct', 'hzOrd', 'pct') + fld(ctx, h, 'taxCapGainsPct', 'hzCg', 'pct');
      if (t === 'market') x = f('StartAge', 'hzAge', 'int') + fld(ctx, h, 'marketReturnPct', 'hzMkt', 'pct');
      if (t === 'inflation') x = f('StartAge', 'hzStart', 'int') + f('EndAge', 'hzEnd', 'int') + fld(ctx, h, 'inflationPct', 'hzInf', 'pct');
      const on = who === 'client' ? h.clientActive : h.spouseActive;
      return `<div class="b06-card" style="position:relative;padding:14px 16px;display:grid;gap:10px">${personal ? swf(ctx, h, who + 'Active', who === 'client' ? 'hzClient' : 'hzSpouse') : ''}${!personal || on ? `<div class="b06-fg" style="--c:3">${x}</div>` : ''}${t === 'tax' ? swf(ctx, h, 'applyAsPct', 'hzAsPct') : ''}</div>`;
    }
    function draw() {
      const personal = ['disability', 'ltc', 'death', 'liability'].indexOf(h.type) >= 0;
      host.innerHTML = `<div style="display:grid;gap:12px">${ddf(ctx, h, 'type', 'hzEvent', [['null', ctx.t('hzPick')]].concat(HZT.map((t) => [t, ctx.t('hz_' + t)])))}${h.type ? person('client') + (personal && G.useSpouse ? person('spouse') : '') : ''}</div>`;
      const inner = host.firstElementChild;
      bindForm(ctx, inner, h, (k) => { if (k === 'type' || /Active$/.test(k)) draw(); });
      ov.querySelector('.ap').disabled = !h.type;
      EFA.numify(host); if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
    }
    draw();
    ov.querySelector('.clr').addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; GX.S().hazard = null; GX.invalidate(); ov.close(); then(); });
    ov.querySelector('.ap').addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      if (document.activeElement && host.contains(document.activeElement)) document.activeElement.blur();
      if (!h.type) return;
      if (['tax', 'market', 'inflation'].indexOf(h.type) >= 0) h.clientActive = true;
      GX.S().hazard = h; GX.invalidate(); ov.close(); then();
    });
  }

  /* ---------- scenario editor (pencil) ---------- */
  function openScenarios(ctx, sid, then) {
    const ov = gdlg(ctx, { title: ctx.t('scnEdit'), w: 640, body: '<div class="sc"></div>' });
    const host = ov.querySelector('.sc');
    const menu = () => {
      host.innerHTML = `<div style="display:grid;gap:10px">${[['del', 'scnDel'], ['ren', 'scnRen'], ['new', 'scnNew'], ['clone', 'scnClone']].map(([a, k]) => `<button type="button" class="st-pill ${a === 'del' ? 'ghost' : ''}" data-a="${a}" ${a !== 'new' && !sid ? 'disabled' : ''} style="justify-content:flex-start">${ctx.t(k)}</button>`).join('')}</div>`;
      if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
      host.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => {
        if (EFA.edit && EFA.edit.on) return;
        const a = b.dataset.a, cur = GX.get(sid);
        if (a === 'del') return gconfirm(ctx, ctx.t('confirmDel'), 'del', () => { GX.saveList(GX.list().filter((x) => x.id !== sid)); const L = GX.ensure(ctx); GX.setMain(L[0] ? L[0].id : null); GX.setBase(L[0] ? L[0].id : null); ov.close(); then(); });
        name(a === 'ren' ? cur.name : a === 'clone' ? `${ctx.text('copyOf')} ${cur.name}` : ctx.text('newScn'), (nm) => {
          if (a === 'ren') { cur.name = nm; GX.put(cur); }
          else {
            const ns = a === 'new' ? GPS.newScenario(nm) : Object.assign(JSON.parse(JSON.stringify(cur)), { id: GPS.newScenario(nm).id, name: nm, created: Date.now() });
            if (a === 'clone') { const map = {}; ns.accounts = ns.accounts.map((x) => { const y = GPS.newAccount(x.type, Object.assign({}, x, { id: undefined })); delete y.undefined; map[x.id] = y.id; return Object.assign(x, { id: y.id }); }); ns.fundingSources = (ns.fundingSources || []).map((p) => Object.assign(p, { accountId: map[p.accountId] || p.accountId })); }
            GX.put(ns); GX.setMain(ns.id);
          }
          ov.close(); then();
        });
      }));
    };
    const name = (v, done) => {
      host.innerHTML = `<div style="display:grid;gap:14px"><label class="b06-f"><span class="l">${ctx.t('scnName')}</span><input type="text" class="nm" value="${EFA.util.esc(v)}"></label><div style="display:flex;justify-content:flex-end;gap:10px"><button type="button" class="st-pill ghost cx">${ctx.t('cancel')}</button><button type="button" class="st-pill ok2">${ctx.t('apply')}</button></div></div>`;
      const inp = host.querySelector('.nm'), ok = host.querySelector('.ok2');
      inp.addEventListener('keydown', (e) => e.stopPropagation());
      inp.addEventListener('input', () => { ok.disabled = !inp.value.trim(); });
      host.querySelector('.cx').addEventListener('click', menu);
      ok.addEventListener('click', () => { if (inp.value.trim()) done(inp.value.trim()); });
      if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
      inp.focus(); inp.select();
    };
    menu();
  }

  /* ---------- tank controls (fgps22, fgps23's PEM view) ---------- */
  function tankControls(ctx, res, onChange) {
    const st = GX.S(), a0 = res ? res.a0 : GX.G().clientAge, last = 100;
    if (st.chartAge == null || st.chartAge < a0 || st.chartAge > last) st.chartAge = a0;
    return `<div class="b06-gctl">
      <div class="col">${ctx.t('tankScale', { cls: 'lb' })}<input type="range" min="1" max="200" step="1" value="${st.tankScale}" class="ts"><div class="sw"><button type="button" class="b06-switch eoyb" role="switch" aria-checked="${!!st.eoy}"></button>${ctx.t('eoy', { cls: 'lb' })}</div></div>
      <div class="col">${ctx.t('ageLab', { cls: 'lb' })}<div style="display:flex;gap:12px;align-items:center"><div class="b06-age"><button type="button" data-ag="first">${IC.first}</button><button type="button" data-ag="prev">${IC.prev}</button><input class="agei" value="${st.chartAge}"><button type="button" data-ag="next">${IC.next}</button><button type="button" data-ag="last">${IC.last}</button></div><span class="sp spa"></span>
      <div class="sw"><button type="button" class="b06-switch playb" role="switch" aria-checked="${!!st.play}"></button>${ctx.t('stepLab', { cls: 'lb' })}</div></div></div></div>`;
  }
  function wireTankControls(ctx, root, getRes, show) {
    const st = GX.S();
    const res = () => getRes();
    const sync = () => {
      const r = res(); if (!r) return;
      const a0 = r.a0; st.chartAge = Math.max(a0, Math.min(100, st.chartAge == null ? a0 : st.chartAge));
      root.querySelector('.agei').value = st.chartAge;
      root.querySelector('[data-ag="first"]').disabled = root.querySelector('[data-ag="prev"]').disabled = st.chartAge <= a0;
      root.querySelector('[data-ag="next"]').disabled = root.querySelector('[data-ag="last"]').disabled = st.chartAge >= 100;
      const sp = root.querySelector('.spa'); if (sp) sp.innerHTML = r.sp ? `<span class="num">/ ${r.s0 + st.chartAge - a0}</span>` : '';
      show();
    };
    ctx.on(root.querySelector('.ts'), 'input', (e) => { st.tankScale = +e.target.value; show(); });
    ctx.on(root.querySelector('.eoyb'), 'click', (e, b) => { st.eoy = !st.eoy; b.setAttribute('aria-checked', st.eoy); show(); });
    ctx.on(Array.from(root.querySelectorAll('[data-ag]')), 'click', (e, b) => {
      const r = res(); if (!r) return;
      const a = b.dataset.ag; st.chartAge = a === 'first' ? r.a0 : a === 'last' ? 100 : st.chartAge + (a === 'next' ? 1 : -1); sync();
    });
    const ai = root.querySelector('.agei');
    ai.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') ai.blur(); });
    ai.addEventListener('blur', () => { const v = Math.round(F.parse(ai.value)); if (isFinite(v)) st.chartAge = v; sync(); });
    const tick = () => { if (!st.play) return; const r = res(); if (!r) return; if (st.chartAge >= 100) { st.play = false; root.querySelector('.playb').setAttribute('aria-checked', false); return; } st.chartAge++; sync(); ctx.timeout(tick, 900); };
    ctx.on(root.querySelector('.playb'), 'click', (e, b) => { st.play = !st.play; b.setAttribute('aria-checked', st.play); if (st.play) ctx.timeout(tick, 400); });
    if (st.play) ctx.timeout(tick, 900);
    sync();
    return sync;
  }

  EFA.css('b06g2', `
  .b06-gwin { position: absolute; left: 0; top: 0; width: 1600px; height: 900px; }
  .b06-ghint { position: absolute; z-index: 8; background: #b8972e; color: #0d1e3a; font: 700 17px/1.25 "DM Sans", sans-serif; padding: 10px 16px; border-radius: 12px; box-shadow: 0 10px 24px rgba(13,30,58,.18); max-width: 360px; }
  .b06-spin { position: absolute; inset: 0; z-index: 30; display: grid; place-items: center; background: rgba(247,245,241,.55); }
  .b06-spin .bx { display: flex; gap: 14px; align-items: center; background: #0d1e3a; color: #f7f5f1; padding: 18px 28px; border-radius: 14px; font: 700 20px/1 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; box-shadow: 0 18px 40px rgba(13,30,58,.3); }
  .b06-spin .dot { width: 22px; height: 22px; border-radius: 50%; border: 3px solid rgba(247,245,241,.3); border-top-color: #b8972e; animation: b06spin 1s linear infinite; }
  @keyframes b06spin { to { transform: rotate(360deg); } }
  .b06-gdisc { position: absolute; left: 980px; right: 330px; bottom: 74px; text-align: left; margin: 0; font-size: 12px; }
  .b06-f.ro input { background: #f0f2f6 !important; }
  /* fgps23 */
  .b06-lv { position: absolute; top: 0; height: 153px; display: grid; align-content: end; justify-items: center; gap: 6px; text-align: center; padding-bottom: 6px; }
  .b06-lv .ans { font: 700 17px/1.2 "DM Sans", sans-serif; color: #8a6e22; }
  .b06-lv .val { font: 700 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; min-height: 26px; }
  .b06-lv .val small { display: block; font: 600 15px/1.25 "DM Sans", sans-serif; color: #667389; }
  .b06-lv .st-pill { min-height: 40px; font-size: 16px; padding: 0 22px; }
  .b06-lv .st-pill.used { background: #b8972e; color: #0d1e3a; border-color: #b8972e; }
  .b06-lv .st-pill[disabled] { opacity: .4; pointer-events: none; }
  .b06-ntc { position: absolute; top: 12px; font: 700 15px/1.2 "DM Sans", sans-serif; color: #2f6b45; cursor: pointer; z-index: 3; }
  .b06-a4 { position: absolute; top: 112px; left: 788px; width: 36px; height: 36px; border-radius: 50%; border: 0; background: #e3e8f0; color: #0d1e3a; display: grid; place-items: center; z-index: 3; }
  .b06-a4:hover, .b06-a4.on { background: #0d1e3a; color: #b8972e; }
  .b06-gg { position: absolute; left: 40px; right: 40px; top: 158px; height: 598px; overflow: auto; border-radius: 14px; border: 1px solid #d6cfc4; background: #fffdf8; }
  .b06-gg table { width: 100%; border-collapse: separate; border-spacing: 0; font: 600 17px/1 "DM Sans", sans-serif; color: #0d1e3a; font-variant-numeric: tabular-nums lining-nums; }
  .b06-gg thead th { position: sticky; z-index: 2; background: #0d1e3a; color: #f7f5f1; font: 700 13px/1.2 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; padding: 9px 12px; }
  .b06-gg thead tr.h1 th { top: 0; height: 30px; font-size: 15px; letter-spacing: .06em; text-transform: none; }
  .b06-gg thead tr.h2 th { top: 48px; }
  .b06-gg thead th.rv { background: #1d3863; color: #e9d8a6; }
  .b06-gg thead th.ag { background: #e3e8f0; color: #0d1e3a; }
  .b06-gg thead th .pvl { cursor: pointer; border-bottom: 1px dotted currentColor; }
  .b06-gg thead th select { height: 30px; border-radius: 7px; border: 0; font: 600 14px DM Sans, sans-serif; margin-left: 6px; max-width: 220px; }
  .b06-gg td { padding: 0 12px; height: 36px; text-align: right; border-bottom: 1px solid rgba(13,30,58,.06); position: relative; }
  .b06-gg tbody tr:nth-child(even) td { background: rgba(227,232,240,.4); }
  .b06-gg td.ag { text-align: center; width: 90px; background: #f3efe6 !important; font-weight: 700; }
  .b06-gg td.sep { border-left: 2px solid #d6cfc4; }
  .b06-gg td.g { box-shadow: inset 0 0 0 3px #2f8a52; }
  .b06-gg td.rd { box-shadow: inset 0 0 0 3px #b3402e; }
  .b06-gg td.dk { box-shadow: inset 0 0 0 3px #0d1e3a; }
  .b06-gg td.it { font-style: italic; color: #667389; }
  .b06-gg td.bd { font-weight: 800; color: #2f6b45; }
  .b06-gb { position: absolute; left: 0; right: 0; top: 792px; height: 60px; }
  .b06-gb .hzw { position: absolute; left: 40px; top: 4px; display: flex; gap: 12px; align-items: center; }
  .b06-gb .dbr { font: 700 18px/1.15 "DM Sans", sans-serif; color: #0d1e3a; } .b06-gb .dbr small { display: block; font: 600 13px/1.2 "DM Sans", sans-serif; color: #667389; }
  .b06-gb .rst { position: absolute; left: 736px; top: 4px; }
  .b06-gb .rt { position: absolute; right: 330px; top: 4px; display: flex; gap: 10px; }
  .b06-pv2 { position: absolute; left: 30px; right: 30px; top: 170px; height: 530px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .b06-pv2 > div { position: relative; overflow: hidden; border-radius: 14px; background: #f7f5f1; border: 1px solid #e3ddd2; }
  .b06-pv2 .cap { position: absolute; left: 14px; bottom: 12px; z-index: 4; font: 700 13px/1 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6e22; }
  .b06-lvd .opt { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .b06-lvd .opt .st-pill.on { background: #b8972e; color: #0d1e3a; border-color: #b8972e; }
  .b06-lvd .pr { font: 600 17px/1.4 "DM Sans", sans-serif; color: #0d1e3a; margin: 0; }
  .b06-nosc { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; padding: 0 200px; }
  `);
  const spinner = (ctx, on) => { let s = ctx.$('.b06-spin'); if (on && !s) { ctx.el.insertAdjacentHTML('beforeend', `<div class="b06-spin"><div class="bx"><span class="dot"></span>${ctx.t('calcing')}</div></div>`); } else if (!on && s) s.remove(); };

  /* =====================================================================
     fgps22: the Financial GPS planner (data entry on the PEM)
     ===================================================================== */
  EFA.screen('fgps22', {
    title: 'Financial GPS planner',
    copy: Object.assign({}, GCOPY, {
      noMarkets: 'Historical index returns are being verified and will appear here once loaded.',
      _notes: 'Enter the household one step at a time, then watch the model year by year.\n\n- Steps 1 to 7 sit on the plumbing they fill in.\n- Move the age to any year; EOY shows end-of-year balances.\n- Ask: When you see your money moving like this, which tank surprises you?\nPAUSE'
    }),
    render(ctx) {
      const hand = takeTaxHandoff();
      if (hand != null) { const g = GX.G(); g.taxAccumulation = g.taxDistribution = Math.round(hand * 100) / 10000; GX.setG(g); }
      const L = GX.ensure(ctx), G = GX.G(), has = GX.hasContact();
      let sid = GX.mainId();
      const res = sid ? GX.run(sid, { hazard: GX.S().hazard || undefined }) : null;
      if (res && res.error) ctx.toast(ctx.text('engineErr'));
      const ok = res && !res.error;
      ctx.el.innerHTML = `<div class="b06-gwin"></div>
        ${ok ? tankControls(ctx, res) : ''}
        ${L.length ? `<div class="b06-gscn" style="left:640px">${ctx.t('scnLabel', { cls: 'lb' })}<button type="button" class="b06-rbtn ghost scp">${IC.pencil}</button><select class="scs">${L.map((s) => `<option value="${s.id}" ${s.id === sid ? 'selected' : ''}>${EFA.util.esc(s.name)}</option>`).join('')}</select><button type="button" class="b06-rbtn hzb ${GX.S().hazard ? 'on' : ''}" aria-label="">${IC.warn}</button><span class="b06-hzd">${hazardHTML(ctx, GX.S().hazard)}</span></div>` : ''}
        ${ok ? `<p class="st-disclaimer b06-gdisc">${ctx.t('gpsDisc')}</p>` : ''}`;
      const P = lib('pem');
      const st = GX.S();
      let pem = null;
      if (P) {
        pem = P.mount(ctx, ctx.$('.b06-gwin'), Object.assign(gpsPemCfg(), { pad: [12, 40, 150, 40], on: {
          ripclick: () => { st.showRip = !st.showRip; show(); },
          pvclick: () => { st.pv = !st.pv; show(); }
        } }));
        ctx.pem = pem;
      }
      const show = () => { if (pem && ok) pem.set(gpsPemValues(res, Math.max(0, Math.min(res.Y - 1, st.chartAge - res.a0)), st), { ms: 300 }); };
      /* the seven numbered buttons */
      const POS = [[0, 1.2], [6, 1.2], [0, 41], [0, 67], [0, 83], [62, 94], [68, 94]];
      const vis = sid ? GX.visited(sid) : {};
      POS.forEach(([top, left], i) => {
        const n = i + 1, r = pem ? pem.rect({ left, top, w: 1.9, h: 1.9 }) : { x: 40 + left * 14, y: 20 + top * 7, w: 40, h: 40 };
        ctx.el.insertAdjacentHTML('beforeend', `<button type="button" class="b06-gbtn ${vis[n] ? 'vis' : ''}" data-d="${n}" style="left:${Math.round(r.x)}px;top:${Math.round(r.y)}px" ${n > 1 && !has ? 'disabled' : ''}><span class="num">${n}</span></button>`);
        const b = ctx.$(`[data-d="${n}"]`); b.setAttribute('title', ctx.text('t' + n));
        if ((n === 3 && ok && res.missingIll) || (n === 4 && ok && res.creditWarning)) { ctx.el.insertAdjacentHTML('beforeend', `<span class="b06-gwarn" data-w="${n}" style="left:${Math.round(r.x) + 46}px;top:${Math.round(r.y) + 6}px">${IC.warnFill}</span>`); ctx.$(`[data-w="${n}"]`).setAttribute('title', ctx.text('w' + n)); }
      });
      if (!has) { const b1 = ctx.$('[data-d="1"]'); ctx.el.insertAdjacentHTML('beforeend', `<div class="b06-ghint" style="left:${parseInt(b1.style.left, 10) + 56}px;top:${parseInt(b1.style.top, 10)}px">${ctx.t('startHint')}</div>`); }
      const rerender = () => { st.keep = true; EFA.player.renderScreen({ noFade: true }); };
      const after = (changed) => { if (changed) GX.invalidate(); rerender(); };
      ctx.on(ctx.$$('[data-d]'), 'click', (e, b) => {
        const n = +b.dataset.d;
        if (n > 1 && !GX.hasContact()) return ctx.toast(ctx.text('noContact'));
        if (n === 1) return openD1(ctx, sid, after);
        if (n === 7) return openD7(ctx, sid, ok ? res : null, after);
        openList(ctx, n, sid, after);
      });
      if (ok) wireTankControls(ctx, ctx.$('.b06-gctl'), () => res, show);
      const sel = ctx.$('.scs');
      if (sel) { sel.addEventListener('change', () => { GX.setMain(sel.value); st.chartAge = null; rerender(); }); }
      if (ctx.$('.scp')) ctx.on(ctx.$('.scp'), 'click', () => openScenarios(ctx, sid, rerender));
      if (ctx.$('.hzb')) { ctx.$('.hzb').setAttribute('title', ctx.text('hazards')); ctx.on(ctx.$('.hzb'), 'click', () => openHazards(ctx, rerender)); }
      show();
      if (st.reopen1) { st.reopen1 = false; ctx.timeout(() => openD1(ctx, sid, after), 60); }
    },
    leave() { const st = GX.S(); if (st.keep) { st.keep = false; return; } st.play = false; }
  });

  /* =====================================================================
     fgps23: Financial GPS results (four levers, baseline vs revised)
     ===================================================================== */
  const LV0 = () => ({ points: 0, retireAge: null, retireTarget: null, save: null, used: {}, answers: null, perAccount: {}, pctAccount: {}, db: 0, rorForm: 'a', lump: false, lumpText: null, lumpBal: null, saveNotice: null, lifeNotice: null, offset: 0 });
  function lvState() { const st = GX.S(); if (!st.lv) st.lv = LV0(); if (st.efficiency == null) st.efficiency = true; if (!st.pvx) st.pvx = { life: false, funds: false, nw: false }; return st.lv; }
  function aOpts(lv, hz, extra) {
    const o = { hazard: hz || undefined };
    if (lv.points) o.extraPoints = lv.points;
    if (lv.retireAge != null) o.retireAge = lv.retireAge;
    if (lv.retireTarget != null) o.retireTarget = lv.retireTarget;
    const typed = Object.keys(lv.perAccount).filter((k) => +lv.perAccount[k]);
    if (typed.length) { o.extraSavings = { perAccount: Object.assign({}, lv.perAccount), once: isRetiredHH(GX.G()) }; o.foundMoney = !GX.S().efficiency; }
    return Object.assign(o, extra || {});
  }
  const pctMap = (lv) => { const m = {}; Object.keys(lv.pctAccount).forEach((k) => { m[k] = lv.pctAccount[k]; }); return Object.keys(m).length ? m : null; };

  EFA.screen('fgps23', {
    title: 'Financial GPS results',
    copy: Object.assign({}, GCOPY, {
      noScn: 'A Financial GPS scenario is needed for this screen. Build one on the planner first.',
      lv1: 'Increase ROR', lv2: 'Save More', lv3: 'Work Longer', lv4: 'Spend Less', a4: 'Calculate all four answers',
      h1: 'Speed', h2: 'Fuel cost', h3: 'Estimated arrival time', h4: 'Reroute', retiredTip: 'The household is already retired, so working longer is not an option.',
      rorTip: 'Weighted average return across all funding accounts', spendTip: 'Lifestyle at retirement age',
      perM: '/m', perY: '/yr', agePre: 'Age', requires: 'requires', moreFund: 'more funding', initBal: 'Initial Balance',
      nRorUp: 'ROR increased by', nRorDn: 'ROR decreased by', nPts: 'percentage points', nReqA: 'The required return is', nHigher: 'higher than the original average', nLower: 'lower than the original average',
      nInc: 'increase', nDec: 'decrease', nRed: 'Lifestyle Reduction', nIncr: 'Lifestyle Increase',
      baseline: 'Baseline:', revised: 'Revised:', cmpTip: 'Compare two different scenarios',
      cLife: 'Lifestyle Spending', cLifePV: 'Lifestyle PV', cFunds: 'Available Funds', cFundsPV: 'Avail. Funds PV', cNW: 'Net Worth', cNWPV: 'N Worth PV', cAge: 'Age',
      d_ror: 'Increase Rate of Return', d_save: 'Save More', d_work: 'Work Longer', d_spend: 'Spend Less', opt1: 'Enter the value', opt2: 'Calculate it',
      p_ror: 'How many percentage points should be added to every account\'s annual return?', p_save: 'How much should be added to each annual contribution?',
      p_work: 'What is the revised retirement age?', p_spend: 'What is the revised retirement lifestyle, in today\'s dollars?', p_fund: 'To what age must the desired lifestyle be funded?', p_fundTip: 'Based on the client\'s age',
      calc: 'Calculate', sName: 'Name / Description', sOrig: 'Original Contribution', sAdd: 'Additional Contribution', sPct: '% Additional Contributions', showAdv: 'Show Advanced Options',
      eff: 'Increase Lifestyle Efficiency', effOff: 'Off: the extra contributions are paid for by increased income.', effOn: 'On: the extra contributions are paid for by money found through spending more efficiently.', both: 'Apply to Both Scenarios',
      reset: 'Reset', dbBtn: 'Calculate the death benefit needed', dbCap: 'Estimated death benefit need', noSol: 'No exact solution was found in 100 tries; the last value is used.',
      togView: 'Table or model view', copyPlan: 'Copy plan data to other presentations', docs: 'Documents', copyQ: 'Copy this plan data to the other presentations?', copied: 'Presentation data updated.', copy: 'Copy',
      docTitle: 'Choose a Document', docWs: 'Worksheets', ws1: 'Baseline Projection', ws2: 'Revised Projection', ws3: 'Summary Comparison', ws4: 'Baseline CF Detail', ws5: 'Baseline Annual Summary', ws6: 'Revised CF Detail', ws7: 'Revised Annual Summary',
      wsWorksheet: 'Worksheet', wsCf: 'Cashflow Detail', wsAnn: 'Annual Summary for All Accounts', present: 'Present', revisedW: 'Revised',
      wAge: 'Age', wBoy: 'Balances BOY', wIncWd: 'Income and Withdrawals', wTax: 'Taxes Paid', wSpend: 'Spendable Income', wFLC: 'Future Lifestyle Contributions', wItem: 'Itemized Expenses', wAct: 'Actual Lifestyle', wDes: 'Desired Lifestyle', wDelta: 'Lifestyle Delta', wFunds: 'Available Funds', wEoy: 'Balances EOY', wYears: 'Years',
      wYear: 'Year', wReq: 'Required Spendable Income', wActPV: 'Actual Lifestyle PV', wDue: 'Taxes Due From Lifestyle', wNdb: 'Net Death Benefit', wNw: 'Net Worth', wOrd: 'Ordinary Income', wGain: 'Gains Income', wROrd: 'Ordinary Rate', wRCg: 'Gains Rate', wRPO: 'Potential Ordinary Rate', wRPG: 'Potential Gains Rate', wPot: 'Potential Taxes', wCum: 'Cumulative Spendable',
      wInc: 'Income', wDep: 'Deposits', wQP: 'Qualified Deposits', wWd: 'Withdrawals', wSale: 'Sale Proceeds', wBorrow: 'Borrowed Cash', wEnd: 'End Balances', wRisk: 'Risk Tank', wSafe: 'Safe Tank', wHouse: 'House Tank', wDebt: 'Borrowed Funds', wCredit: 'Credit Remaining', wLiq: 'Liquidity', wAssets: 'Assets', wLiab: 'Liabilities', wDb: 'Death Benefit', wEst: 'Estate Value', wMarg: 'Marginal Rate',
      wsBal: 'Account balances', wsWd: 'Account withdrawals', wsSp: 'Account spendable income',
      /* documents chooser */
      docRep: 'Reports', dr1: 'Four-questions results report', dr2: 'Financial fact check', dr3: 'Retirement roadmap', dr4: 'Edit the roadmap closing section',
      docFile: 'Scenario File', df1: 'Save this scenario to a file', fileQ: 'Save the scenario to a file for later viewing?', fileOk: 'Scenario file saved.', noFile: 'A file cannot be created here.',
      cpSG: 'Copy the scenario to the spending game', cpSGQ: 'Copy the active scenario to the spending game?', cpSGOk: 'Scenario copied.', cpSGLv: 'Scenario copied, including the lever changes now applied.',
      /* report shell */
      rpBrand: 'Edwards Financial & Associates', rpCred: 'Life & Annuities · Retirement Consulting · Estate Strategy', rpEyebrow: 'Retirement Consulting',
      rpPrepared: 'Prepared for', rpPage: 'Page', rpDisc: 'Disclosure', rpDl: 'Download the report', rpDlX: 'Download the table', rpDlC: 'Table as CSV',
      rpNote: 'Read it here, or save a copy to open and print from your browser.',
      rpSupH: 'Supporting Documentation', rpSupLead: 'Every figure in this report comes from the plan data below, as it was entered for this household.',
      rtPersonal: 'The People in This Plan', rtAssume: 'Financial Assumptions', rtKids: 'Children', rtStart: 'Starts at Age', rtEnd: 'Ends at Age',
      rtIncome: 'Income Sources', rtInvest: 'Investments and Savings', rtNotes: 'Notes Receivable', rtPli: 'Cash Value Life Insurance',
      rtLoans: 'Loans and Credit', rtProp: 'Residences and Property', rtIns: 'Insurance Coverage', rtExp: 'Itemized Expenses',
      rtTaxes: 'Taxes', rtAccum: 'Accumulation', rtDist: 'Distribution', rtCg: 'Capital Gains', rtStd: 'Standard', rtInfl: 'Inflation', rtCola: 'plus a cost of living adjustment',
      rtDesired: 'Desired Lifestyle', rtLegacy: 'Desired Legacy', rtAssets: 'Assets', rtLiab: 'Liabilities', rtNW: 'Net Worth', rtLiq: 'Liquidity',
      rtDbProt: 'Death Benefit Protection', rtLasts: 'Lifestyle Lasts Until Age',
      rtOpin: 'What This Household Expects Ahead', rtOpInfl: 'Inflation ahead', rtOpRet: 'Returns ahead', rtOpTax: 'Taxes ahead',
      rtBenRev: 'Beneficiaries last reviewed', rtEstRev: 'Estate plan last reviewed',
      rsPresent: 'Present Plan', rsLasts: 'What You Have Now',
      /* R1 the four questions */
      r1Title: 'The Answers to Four Key Questions', r1Sub: 'What your own numbers say about the return, the saving, the timing and the lifestyle ahead', r1File: 'Four Questions Results Report',
      r1iH: 'Four Questions, One Route',
      r1i1: 'Think of this plan as a route on a map. You know roughly where you want to arrive and when. From there only four things can change: how fast you travel, what the trip costs you each year, when you expect to arrive, and where you are willing to reroute. Every retirement decision you will make sits inside one of those four.',
      r1i2: 'The first question is speed: the average return your savings would need to earn to fund the lifestyle you described.',
      r1i3: 'The second is the cost of the trip: what you would set aside each year to fund that same lifestyle.',
      r1i4: 'The third is arrival time: how long you would keep working before retirement begins.',
      r1i4r: 'The third is how long the lifestyle you have now can be funded from what you have already built.',
      r1i5: 'The fourth is the reroute: the lifestyle this plan can fund if the other three stay where they are.',
      r1i6: 'Each answer changes one thing and leaves everything else as you entered it. None of these pages is a product and none is a guarantee. They are four plain measurements of one plan.',
      r1q1H: 'Question One: How Fast Would This Plan Need to Travel?', r1q1Q: 'What average return would my savings need to earn to fund the lifestyle I want?',
      r1q1a: 'Funding the lifestyle you described, from retirement at age', r1q1b: 'through age', r1q1ar: 'Funding the lifestyle you described through age',
      r1q1c: 'calls for an average return of about', r1q1d: 'across the accounts funding this plan.',
      r1q1Up: 'That is higher than the average return this plan assumes today. A required return above what you are earning now generally means accepting more volatility along the way, and a plan that depends on it has less room for a poor stretch of years.',
      r1q1Dn: 'That is at or below the average return this plan already assumes, so the lifestyle you described does not call for taking on more investment risk.',
      r1cBar: 'Each column is the money available to you in that year, with this one change applied.',
      r1cSplit: 'Columns up to your retirement age are navy. From retirement on they are red, where the money is being spent rather than built.',
      r1cLines: 'The dark line is the plan exactly as it stands today. The green line is the plan with this one change applied.',
      r1cPresent: 'The dark line is the plan exactly as it stands today.',
      r1q2H: 'Question Two: What Would the Trip Cost Each Year?', r1q2Q: 'What would I set aside each year to fund the lifestyle I want?',
      r1q2a: 'Funding that lifestyle calls for total saving of about', r1q2b: 'a year, which is', r1q2c: 'a year more than this plan sets aside now.',
      r1q2d: 'One route is to raise your saving capacity by that amount out of income.',
      r1q2e: 'The other route leaves your income where it is and funds the extra saving from spending: holding household spending near',
      r1q2f: 'a year makes room for', r1q2g: 'of saving without earning another dollar.',
      r1q2okH: 'The saving already scheduled funds the lifestyle you described.',
      r1q2ok: 'On the figures you gave, nothing more needs to be added. That is worth saying plainly, and it holds as long as these assumptions hold.',
      r1q2ok2: 'The scheduled premiums and contributions continue at', r1q2ok3: 'in the first year.',
      r1q2ra: 'Funding that lifestyle from here calls for a starting balance of about', r1q2rb: 'which is', r1q2rc: 'more than these accounts hold today.',
      r1q2rd: 'Where a gap like that cannot be closed with money, it is usually closed another way: a different order of withdrawals, an income floor under part of the portfolio, a lower fixed-cost base, or an asset that is sitting idle put to work.',
      r1q2rok: 'What these accounts hold today funds the lifestyle you described.',
      r1q2leg: 'That moves the conversation from whether the money lasts to what you want it to do: the legacy you want to create, and the protection that keeps it intact.',
      r1q2cA: 'In this view the scheduled contributions stop at retirement.',
      r1q2cUp: 'In this view the contributions are raised to', r1q2cDn: 'In this view the contributions are lowered to', r1q2cTail: 'a year, inflating at the rate you set until retirement.',
      r1q3H: 'Question Three: What Would Change the Arrival Time?', r1q3Q: 'How long would I keep working to fund the lifestyle I have now?',
      r1q3a: 'Keeping the lifestyle you have today, funded through age', r1q3b: 'points to working until age',
      r1q3d: 'That is', r1q3later: 'years later than the age you planned on,', r1q3earlier: 'years earlier than the age you planned on,', r1q3same: 'That is the retirement age you already planned on,',
      r1q3i: 'and it leaves', r1q3j: 'years of retirement ahead of you.',
      r1q3Hr: 'Question Three: How Long Does What You Have Last?', r1q3Qr: 'How long will the lifestyle I have now last on what I have already built?',
      r1q3ra: 'The lifestyle you have now is funded until age', r1q3rb: 'and these accounts still hold about', r1q3rc: 'at that age.',
      r1q3rd: 'Assets that are not liquid today, a home among them, can often add liquidity later. That is a conversation worth having before it is needed rather than after.',
      r1q4H: 'Question Four: Where Would You Reroute?', r1q4Q: 'What could I spend each year without running out?',
      r1q4a: 'Leaving the return, the saving and the retirement age exactly as they are, this plan funds about', r1q4b: 'a year from age', r1q4c: 'through age',
      r1q4ar: 'Leaving everything else as it is, this plan funds about', r1q4br: 'a year through age',
      r1q4Red: 'That is a reduction of', r1q4RedB: 'against the lifestyle you asked for.', r1q4Inc: 'That is', r1q4IncB: 'more than the lifestyle you asked for.',
      r1q4Pv: 'In today\'s dollars, at the inflation rate you set, that is', r1q4PvB: 'a year.',
      r1sH: 'Putting the Four Together',
      r1s1: 'No one moves a single lever all the way. In practice a plan closes a gap with a small move on each of the four, which is why it helps to see all four measured the same way.',
      r1s2: 'Return is the lever with the least control attached to it. You can choose how much risk to carry, but not what the market pays, so leaning on return alone is the least reliable way to close a gap.',
      r1s3: 'Working longer looks simple on paper and often is not. Health, employers and families all get a vote in it.',
      r1s4: 'Spending less in retirement assumes retirement costs less. For many households the first years cost more rather than less.',
      r1s5: 'Saving more is the lever you control outright, and it is the one that gets harder the longer it waits.',
      r1s6: 'Before taking on more risk, it is worth looking at where money is already leaking out of the plan. Five places are worth checking first: housing payments, taxes, retirement plan contributions and distributions, education costs, and major purchases.',
      r1sEm: 'Our work starts with the efficiency of what you already have, before anything new is added.',
      r1s7: 'Of these four, which one feels most within your control? That is where the next conversation starts.',
      r1o1: 'On the assumptions you gave, this plan funds the lifestyle you described. What is left is maintenance rather than rescue: small course corrections as the years actually unfold.',
      r1o2: 'Returns, retirement timing and retirement costs move together. Looking at all three at once, rather than one at a time, is what keeps a funded plan funded.',
      r1o3: 'A funded plan also lets you look at risk you no longer need to carry. Risk you are not paid to take is worth removing.',
      r1o4: 'The rules change in the distribution years. The order you draw from accounts, the tax treatment of each one and the timing of each decision matter more then than they did while you were building.',
      r1o5: 'Let us put a date on the calendar and walk through it together.',
      /* R2 the fact check */
      r2Title: 'Financial Fact Check', r2File: 'Financial Fact Check', r2SumH: 'Summary Values',
      r2Lead: 'A plan is only as good as the facts underneath it. Please read each line and tell us what has changed.',
      /* R3 the roadmap */
      r3Title: 'Your Retirement Roadmap', r3Sub: 'A personal guide to the journey toward the lifestyle you described', r3File: 'Retirement Roadmap',
      r3ExecH: 'Where This Goes',
      r3Exec: 'What follows rests on the assumptions you gave us, and those will change. That is not a weakness of the plan. Knowing where you want to arrive, and seeing a path that gets there, is worth having even while the details move.',
      r3ChartH: 'The Funding Path, Year by Year',
      r3ChartCap: 'The columns show which account each year\'s withdrawals come from. The lines show taxes paid, itemized expenses, the lifestyle you asked for and the lifestyle the plan funds.',
      r3MileH: 'Milestones', mYear: 'Year', mEstate: 'Estate Value', mSpendC: 'Cumulative Spendable Income', mLifeC: 'Cumulative Lifestyle',
      r3WrapH: 'What This Means',
      r3lTax: 'Taxes paid', r3lItem: 'Itemized expenses', r3lDes: 'Desired lifestyle', r3lAct: 'Actual lifestyle',
      r3w1: 'The chart maps a funding path that holds a lifestyle of', r3w2: 'in today\'s dollars', r3w2b: 'adjusted for inflation,', r3w3: 'through age', r3w4: ', on four assumptions:',
      r3b1: 'A weighted average return of', r3b1u: 'an increase of', r3b1d: 'a decrease of', r3b1e: 'percentage points from the original assumptions',
      r3b2a: 'Contributions as planned at', r3b2b: 'a year', r3b2c: 'Contributions changed to',
      r3b3a: 'Working until age', r3b3b: 'which is', r3b3later: 'years later than planned', r3b3earlier: 'years earlier than planned',
      r3b4a: 'Keeping the estimated lifestyle of', r3b4b: 'at retirement', r3b4c: 'A changed lifestyle of', r3b4d: 'in today\'s dollars',
      /* the wrap-up editor */
      rteTitle: 'The Roadmap Closing Section', rteApply: 'Apply Changes',
      rteNote: 'What you write here replaces the closing section the roadmap writes for itself.',
      rteB: 'Bold', rteI: 'Italic', rteU: 'Underline', rteLink: 'Add a link', rteUnlink: 'Remove the link', rteAddr: 'Address', rteLinkT: 'Link Title', rteIns: 'Insert',
      rteColor: 'Text color', rteBg: 'Highlight color', rteStyle: 'Paragraph style', rteSize: 'Text size', rteIndent: 'Indent',
      rteAlL: 'Align left', rteAlC: 'Center', rteAlR: 'Align right', rteUndo: 'Undo', rteRedo: 'Redo', rteUl: 'Bulleted list', rteOl: 'Numbered list',
      stP: 'Paragraph', stH1: 'Heading 1', stH2: 'Heading 2', stH3: 'Heading 3', stCover: 'Cover Page Title', stTitle: 'Title', stSub: 'Subtitle', stBasic: 'Basic Text',
      szXxs: 'Smallest', szXs: 'Smaller', szS: 'Small', szM: 'Normal', szL: 'Large', szXl: 'Larger', szXxl: 'Largest',
      inNone: 'No indent', in1: 'Indent 1', in2: 'Indent 2',
      busyTitle: 'A calculation is in progress', busyBody: 'Give it a few seconds while the numbers are crunched.',
      _notes: 'Four levers, one destination. Change one and watch the revised side move against the baseline.\n\n- Each lever: type a value, or let the plan solve for it.\n- The round button answers all four at once.\n- Ask: Of these four, which lever feels most within your control?\nPAUSE'
    }),
    render(ctx) {
      const L = GX.ensure(ctx);
      if (!L.length) { ctx.el.innerHTML = `<div class="b06-nosc">${ctx.t('noScn', { tag: 'h2', cls: 'st-h2' })}</div>`; return; }
      const st = GX.S(), lv = lvState(), G = GX.G(), hz = st.hazard;
      let aId = GX.mainId(), bId = GX.baseId();
      if (!GX.get(bId)) bId = aId;
      const compare = aId !== bId;
      const retired = isRetiredHH(G);
      const A = GX.run(aId, aOpts(lv, hz, lv.save ? { extraSavings: lv.save.es, foundMoney: lv.save.found } : null));
      const Ab = GX.run(aId, { hazard: hz || undefined });
      const B = GX.run(bId, compare ? { hazard: hz || undefined } : {});
      if (!A || A.error || !B || B.error) { ctx.el.innerHTML = `<div class="b06-nosc">${ctx.t('engineErr', { tag: 'h2', cls: 'st-h2' })}</div>`; return; }
      const a0 = A.a0, i = A.infl || 0;
      const R = lv.retireAge != null ? lv.retireAge : G.clientRetireAge;
      const wRow = Math.max(0, Math.min(A.Y - 1, R - a0)), W = A.find[wRow].actual, S = A.find[0].dep;
      const spOff = G.useSpouse ? G.spouseAge - G.clientAge : 0;
      const m = (v) => `<span class="num">${F.money(Math.round(v || 0))}</span>`;
      const xs = [0, 1, 2, 3].map((k) => 40 + k * 380);
      const ans = lv.answers || {};
      const scnOpts = (sel) => L.map((s) => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${EFA.util.esc(s.name)}</option>`).join('');
      const used = ['ror', 'save', 'work', 'spend'].filter((k) => lv.used[k]);
      const revLabel = () => (used.length ? ' - ' + used.map((k) => ctx.text({ ror: 'lv1', save: 'lv2', work: 'lv3', spend: 'lv4' }[k])).join(' + ') : '') + (hz ? ' - ' + ctx.text('hz_' + hz.type) : '');
      const nameA = (GX.get(aId) || {}).name || '', nameB = (GX.get(bId) || {}).name || '';
      /* notices */
      let ntc = '', saveTxt = null, lifeTxt = null;
      const plain = (h) => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (lv.used.ror && lv.points) {
        const P = lv.points * 100, orig = Ab.avgReturn * 100, X = orig > 0 ? P / orig * 100 : 100;
        ntc += `<div class="b06-ntc ntr" style="left:24px">${lv.rorForm === 'a' ? `${ctx.t(P >= 0 ? 'nRorUp' : 'nRorDn')} <span class="num">${F.num(Math.abs(P), 2)}</span> ${ctx.t('nPts')}` : `${ctx.t('nReqA')} <span class="num">${F.num(Math.abs(X), 2)}%</span> ${ctx.t(P >= 0 ? 'nHigher' : 'nLower')}`}</div>`;
      }
      if (lv.used.save) {
        const d = A.find[0].dep - B.find[0].dep;
        const txt = lv.lump && lv.lumpBal != null ? `${m(lv.lumpBal)} ${ctx.t('initBal')}` : retired ? `${m(d + A.find[0].bal0)} ${ctx.t('initBal')}` : `${m(Math.abs(d))}${ctx.t('perY')} (${m(Math.abs(d) / 12)}${ctx.t('perM')}) ${ctx.t(d >= 0 ? 'nInc' : 'nDec')}`;
        saveTxt = plain(txt);
        ntc += `<div class="b06-ntc nts" style="left:456px">${txt}</div>`;
      }
      if (lv.used.spend) {
        const n = B.find[Math.max(0, Math.min(B.Y - 1, R - a0))].desired;
        if (n > 0) {
          const txt = n >= W ? `<span class="num">${F.num((1 - W / n) * 100, 2)}%</span> ${ctx.t('nRed')}` : `<span class="num">${F.num((W / n - 1) * 100, 2)}%</span> ${ctx.t('nIncr')}`;
          lifeTxt = plain(txt);
          ntc += `<div class="b06-ntc" style="right:48px">${txt}</div>`;
        }
      }
      const lever = (k, idx, val) => `<div class="b06-lv" style="left:${xs[idx]}px;width:360px">${ans[k] ? `<div class="ans">${ans[k]}</div>` : ''}<div class="val">${val}</div><button type="button" class="st-pill ${lv.used[k] ? 'used' : ''}" data-lv="${k}" ${k === 'work' && retired ? 'disabled' : ''}>${ctx.t({ ror: 'lv1', save: 'lv2', work: 'lv3', spend: 'lv4' }[k])}</button></div>`;
      const retShown = (Ab.avgReturn + (lv.points || 0));
      const saveVal = retired ? `<small>${lv.used.save ? ctx.t('requires') : ''}</small>${lv.lump && lv.lumpText != null ? m(lv.lumpText) : m(S)} ${lv.used.save ? ctx.t('moreFund') : ''}` : `${m(S / 12)} ${ctx.t('perM')}<small>${m(S)} ${ctx.t('perY')}</small>`;
      const ageVal = `${ctx.t('agePre')} <span class="num">${R}${G.useSpouse ? '/' + (R + spOff) : ''}</span>`;
      const lifeVal = `${m(W / 12)} ${ctx.t('perM')}<small>${m(W)} ${ctx.t('perY')}</small>`;
      /* grid */
      const pv = st.pvx, Y = B.Y, mlu = B.moneyLasts, dz = hz && hz.type === 'death';
      const rows = [];
      for (let r = 0; r < Y; r++) {
        const fb = B.find[r], fa = A.find[Math.min(r, A.Y - 1)], sb = B.rows[r], sa = A.rows[Math.min(r, A.Y - 1)], age = a0 + r, d = Math.pow(1 + i, r);
        const bl = compare && pv.life ? fb.actualPV : fb.actual, al = pv.life ? fa.actualPV : fa.actual;
        const cRet = age === G.clientRetireAge, rRet = age === R, mlRow = age === mlu, past = age >= mlu && mlu < 100;
        const deathRow = dz && ((hz.clientActive && age === hz.clientStartAge + 1) || (hz.spouseActive && age + spOff === hz.spouseStartAge + 1));
        rows.push(`<tr data-r="${r}"><td class="${cRet ? 'g' : ''}">${m(bl)}</td><td class="${cRet ? 'g' : ''} ${deathRow ? 'dk' : ''}">${m(fb.funds)}</td><td class="${cRet ? 'g' : ''} ${past && sb.nw > 0 ? 'it' : ''}">${m(sb.nw)}</td>
          <td class="ag ${mlRow ? 'rd' : rRet ? 'g' : ''}"><span class="num">${age}${G.useSpouse ? '/' + (age + spOff) : ''}</span></td>
          <td class="sep ${rRet && lv.used.work ? 'g' : ''} ${past && fa.actual > fb.actual ? 'bd' : ''}">${m(al)}</td><td class="${rRet && lv.used.work ? 'g' : ''} ${deathRow ? 'dk' : ''}">${m(pv.funds ? fa.funds / d : fa.funds)}</td><td class="${rRet && lv.used.work ? 'g' : ''}">${m(pv.nw ? sa.nw / d : sa.nw)}</td></tr>`);
      }
      const hdA = compare ? `${ctx.t('revised')}<select class="sa">${scnOpts(aId)}</select>` : `${EFA.util.esc(nameA)}<span class="num">${EFA.util.esc(revLabel())}</span>`;
      const hdB = compare ? `${ctx.t('baseline')}<select class="sb">${scnOpts(bId)}</select>` : EFA.util.esc(nameB);
      const pvl = (k, a, b) => `<span class="pvl" data-pv="${k}">${ctx.t(pv[k] ? b : a)}</span>`;
      const grid = `<div class="b06-gg"><table><thead><tr class="h1"><th colspan="3" style="border-radius:12px 0 0 0">${hdB}</th><th class="ag"><button type="button" class="b06-switch cmpb" role="switch" aria-checked="${compare}" style="transform:scale(.6);margin:-8px -14px"></button></th><th colspan="3" class="rv" style="border-radius:0 12px 0 0">${hdA}</th></tr>
        <tr class="h2"><th>${compare ? pvl('life', 'cLife', 'cLifePV') : ctx.t('cLife')}</th><th>${ctx.t('cFunds')}</th><th>${ctx.t('cNW')}</th><th class="ag">${ctx.t('cAge')}</th><th class="rv">${pvl('life', 'cLife', 'cLifePV')}</th><th class="rv">${pvl('funds', 'cFunds', 'cFundsPV')}</th><th class="rv">${pvl('nw', 'cNW', 'cNWPV')}</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
      const dbBtn = dz ? `<button type="button" class="b06-rbtn dbb">${EFA.lib.pem && EFA.lib.pem.art && EFA.lib.pem.art.shield ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>' : ''}</button>${lv.db ? `<div class="dbr">${m(lv.db)}<small>${ctx.t('dbCap')}</small></div>` : ''}` : '';
      ctx.el.innerHTML = `${ntc}
        ${lever('ror', 0, `<span class="num">${F.num(retShown * 100, 2)}%</span>`)}${lever('save', 1, saveVal)}${lever('work', 2, ageVal)}${lever('spend', 3, lifeVal)}
        <button type="button" class="b06-a4 ${lv.answers ? 'on' : ''}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h14l-4-4M20 15H6l4 4"/></svg></button>
        ${st.pemView ? `<div class="b06-pv2"><div class="pb">${ctx.t('present', { cls: 'cap' })}</div><div class="pa">${ctx.t('revisedW', { cls: 'cap' })}</div></div>` : grid}
        <div class="b06-gb"><div class="hzw"><button type="button" class="b06-rbtn hzb ${hz ? 'on' : ''}">${IC.warn}</button><span class="b06-hzd">${hazardHTML(ctx, hz)}</span>${dbBtn}</div>
          <button type="button" class="st-pill ghost rst">${ctx.t('reset')}</button>
          <div class="rt"><button type="button" class="b06-rbtn tgv">${IC.calc}</button><button type="button" class="b06-rbtn cpy"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></svg></button><button type="button" class="b06-rbtn sgb"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.5" fill="currentColor" stroke="none"/></svg></button><button type="button" class="b06-rbtn dcs"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/></svg></button></div></div>
        ${st.pemView ? tankControls(ctx, A).replace('class="b06-gctl"', 'class="b06-gctl" style="left:40px;bottom:auto;top:704px;transform:scale(.74);transform-origin:left top"') : ''}
        <p class="st-disclaimer" style="position:absolute;left:${st.pemView ? 520 : 40}px;right:40px;top:762px;margin:0;font-size:12px;text-align:center">${ctx.t('gpsDisc')}</p>`;
      /* hovers (titles carry editable text) */
      const tip = (sel, key, extra) => { const n = ctx.$(sel); if (n) n.setAttribute('title', ctx.text(key) + (extra ? ': ' + extra : '')); };
      ['ror', 'save', 'work', 'spend'].forEach((k, j) => tip(`[data-lv="${k}"]`, k === 'work' && retired ? 'retiredTip' : 'h' + (j + 1), ans[k] ? ans[k].replace(/<[^>]+>/g, '') : ''));
      tip('.b06-a4', 'a4'); tip('.hzb', 'hazards'); tip('.dbb', 'dbBtn'); tip('.tgv', 'togView'); tip('.cpy', 'copyPlan'); tip('.sgb', 'cpSG'); tip('.dcs', 'docs'); tip('.cmpb', 'cmpTip');
      /* PEM pair */
      if (st.pemView) {
        const P = lib('pem');
        if (P) {
          const ref = Math.max(A.refSize || 5000000, B.refSize || 5000000);
          const cfg = () => Object.assign(gpsPemCfg({ narrow: true }), { on: { ripclick: () => { st.showRip = !st.showRip; showP(); }, pvclick: () => { pv.life = !pv.life; st.pv = pv.life; showP(); } } });
          const pb = P.mount(ctx, ctx.$('.pb'), cfg()), pa = P.mount(ctx, ctx.$('.pa'), cfg());
          var showP = () => {
            const k = Math.max(0, Math.min(A.Y - 1, st.chartAge - a0));
            const vb = gpsPemValues(B, Math.min(k, B.Y - 1), st), va = gpsPemValues(A, k, st);
            vb.tankSize = va.tankSize = ref * (st.tankScale || 100) / 100;
            pb.set(vb, { ms: 300 }); pa.set(va, { ms: 300 });
          };
          wireTankControls(ctx, ctx.$('.b06-gctl'), () => A, showP);
        }
      } else {
        const gg = ctx.$('.b06-gg'), tr = gg.querySelector('tbody tr');
        if (tr) gg.scrollTop = Math.max(0, (G.clientRetireAge - a0 + (lv.offset || 0))) * tr.offsetHeight;
      }
      /* wiring */
      const rerender = () => { st.keep = true; EFA.player.renderScreen({ noFade: true }); };
      const busy = (fn) => { spinner(ctx, true); ctx.timeout(() => { try { fn(); } catch (e) { console.error(e); ctx.toast(ctx.text('engineErr')); } spinner(ctx, false); rerender(); }, 60); };
      ctx.on(ctx.$$('[data-pv]'), 'click', (e, b) => { pv[b.dataset.pv] = !pv[b.dataset.pv]; if (b.dataset.pv === 'life') st.pv = pv.life; rerender(); });
      ctx.on(ctx.$('.cmpb'), 'click', () => { if (compare) GX.setBase(aId); else { const other = L.find((s) => s.id !== aId); if (other) GX.setBase(other.id); } ctx.timeout(() => { reset(); rerender(); }, 100); });
      const sa = ctx.$('.sa'), sb = ctx.$('.sb');
      if (sa) sa.addEventListener('change', () => { GX.setMain(sa.value); reset(); rerender(); });
      if (sb) sb.addEventListener('change', () => { GX.setBase(sb.value); reset(); rerender(); });
      const ntr = ctx.$('.ntr'); if (ntr) ctx.on(ntr, 'click', () => { lv.rorForm = lv.rorForm === 'a' ? 'b' : 'a'; rerender(); });
      const nts = ctx.$('.nts'); if (nts) ctx.on(nts, 'click', () => { if (lv.lumpBal != null) { lv.lump = !lv.lump; rerender(); } });
      function reset() { const keep = lv.answers; st.lv = LV0(); st.lv.answers = keep; GX.invalidate(); }
      ctx.on(ctx.$('.rst'), 'click', () => { const keep = lv.answers; Object.assign(lv, LV0()); lv.answers = keep; rerender(); });
      ctx.on(ctx.$('.hzb'), 'click', () => openHazards(ctx, () => { const keep = null; Object.assign(lv, LV0()); lv.answers = keep; rerender(); }));
      ctx.on(ctx.$('.tgv'), 'click', () => { st.pemView = !st.pemView; rerender(); });
      ctx.on(ctx.$('.cpy'), 'click', () => gconfirm(ctx, ctx.t('copyQ'), 'copy', () => { copyPlan(GX.get(aId)); ctx.toast(ctx.text('copied')); }));
      ctx.on(ctx.$('.sgb'), 'click', () => gconfirm(ctx, ctx.t('cpSGQ'), 'copy', () => { copyToSpendingGame(GX.get(aId)); ctx.toast(ctx.text(used.length ? 'cpSGLv' : 'cpSGOk')); }));
      /* the values the roadmap's closing section quotes (C9 R3) */
      const who = G.useSpouse && (G.spouseName || '').trim() ? `${G.clientName || G.contactName || ''} & ${G.spouseName}` : (G.clientName || G.contactName || '');
      const Kr = { retShown, points: lv.points || 0, S, R, W, WPV: A.find[wRow].actualPV, saveNotice: saveTxt, lifeNotice: lifeTxt, cola: !!(GX.get(aId) || {}).inflateLifestyle || !!(GX.get(aId) || {}).maintainCurrentLifestyle };
      ctx.on(ctx.$('.dcs'), 'click', () => openDocs(ctx, { A, B, G, nameA: nameA + revLabel(), nameB, sc: GX.get(aId), scList: L, who, K: Kr, after: rerender }));
      const needTarget = () => { if (!((Ab.T0 || 0) + (G.desiredLegacy || 0) > 0.0049)) { ctx.toast(ctx.text('noIncome')); return false; } return true; };
      const noConv = (s) => { if (s && s.conv === false) ctx.toast(ctx.text('noSol')); };
      const setFund = (age) => { const g = GX.G(); g.projectToAge = Math.min(100, Math.max(g.clientAge, age)); EFA.clients.set('fgps', 'globals', g); GX.invalidate(); };
      const sc = () => GX.get(aId);
      if (dz && ctx.$('.dbb')) ctx.on(ctx.$('.dbb'), 'click', () => busy(() => { const s = GPS.solve(GX.G(), sc(), 'db', { base: aOpts(lv, hz) }); lv.db = Math.max(0, s.value); noConv(s); }));
      /* answer all four */
      ctx.on(ctx.$('.b06-a4'), 'click', () => {
        Object.assign(lv, LV0());
        busy(() => {
          const g = GX.G(), s0 = sc(), base = { hazard: hz || undefined }, o = {};
          const r1 = GPS.solve(g, s0, 'ror', { base }); o.ror = `<span class="num">${F.num((Ab.avgReturn + r1.value) * 100, 2)}%</span>`;
          let sv;
          if (retired) sv = GPS.solve(g, s0, 'save', { base, efficiency: false, once: true });
          else if (st.efficiency) { const mn = GPS.solve(g, s0, 'saveMin', { base }); sv = mn.need ? GPS.solve(g, s0, 'save', { base, efficiency: true }) : mn; }
          else sv = GPS.solve(g, s0, 'save', { base, efficiency: false });
          const Sv = sv.res.find[0].dep;
          o.save = retired ? `${m(Sv)} ${ctx.t('moreFund')}` : `${m(Sv / 12)}${ctx.t('perM')} ${m(Sv)}${ctx.t('perY')}`;
          if (retired) o.work = `<span class="num">${g.clientRetireAge}${g.useSpouse ? '/' + g.spouseRetireAge : ''}</span>`;
          else { const w = GPS.solve(g, s0, 'work', { base }); o.work = `<span class="num">${w.value}${g.useSpouse ? '/' + (w.value + spOff) : ''}</span>`; }
          const sp = GPS.solve(g, s0, 'spend', { base }); const Wl = sp.res.find[Math.max(0, Math.min(sp.res.Y - 1, g.clientRetireAge - a0))].actual;
          o.spend = `${m(Wl / 12)}${ctx.t('perM')} ${m(Wl)}${ctx.t('perY')}`;
          lv.answers = o;
        });
      });
      /* lever dialogs */
      ctx.on(ctx.$$('[data-lv]'), 'click', (e, b) => openLever(b.dataset.lv));
      function openLever(k) {
        const state = { opt: 0, v: k === 'ror' ? lv.points : k === 'work' ? R : k === 'spend' ? Math.round(A.find[wRow].actualPV * 100) / 100 : 0, fund: GPS.projectTo(GX.G()), adv: false, both: false };
        const ov = gdlg(ctx, { title: ctx.t('d_' + k), w: k === 'save' ? 1000 : 760, cls: 'b06-lvd', body: '<div class="lb"></div>', foot: `<span></span><div class="grp"><button type="button" class="st-pill go" hidden>${ctx.t('calc')}</button></div>` });
        ov.classList.add('b06-lvd');
        const host = ov.querySelector('.lb'), go = ov.querySelector('.go');
        const elig = () => (sc().accounts || []).filter((a) => ['taxable', 'tdbt', 'tdat', 'taxfree'].indexOf(a.type) >= 0 || (a.type === 'annuity' && !a.useIll)).filter((a) => !a.mcp);
        const draw = () => {
          let body = `<div class="opt"><button type="button" class="st-pill ghost ${state.opt === 1 ? 'on' : ''}" data-o="1">${ctx.t('opt1')}</button><button type="button" class="st-pill ghost ${state.opt === 2 ? 'on' : ''}" data-o="2">${ctx.t('opt2')}</button></div>`;
          if (state.opt === 1) {
            if (k === 'save') body += `<p class="pr">${ctx.t('p_save')}</p><div class="scroll"><table class="tbl"><thead><tr><th>${ctx.t('sName')}</th><th class="r">${ctx.t('sOrig')}</th><th class="r">${ctx.t('sAdd')}</th></tr></thead><tbody>${elig().map((a) => `<tr><td>${EFA.util.esc(a.name)}</td><td class="r"><span class="num">${F.money(a.contrib || 0)}</span></td><td class="r" style="width:220px">${fld(ctx, lv.perAccount, a.id, 'sAdd', 'money').replace(/<span class="l">.*?<\/span>/, '')}</td></tr>`).join('') || `<tr class="empty"><td colspan="3">${ctx.t('empty')}</td></tr>`}</tbody></table></div>`;
            else body += `<p class="pr">${ctx.t('p_' + k)}</p><div style="width:280px">${fld(ctx, state, 'v', 'p_' + k, k === 'ror' ? 'pct' : k === 'work' ? 'int' : 'cents').replace(/<span class="l">.*?<\/span>/, '')}</div>`;
          }
          if (state.opt === 2) {
            body += `<p class="pr" title="">${ctx.t('p_fund')}</p><div style="width:200px">${fld(ctx, state, 'fund', 'p_fund', 'int', { max: 100 }).replace(/<span class="l">.*?<\/span>/, '')}</div>`;
            if (k === 'save') {
              body += swf(ctx, state, 'adv', 'showAdv');
              if (state.adv) body += `<div class="scroll"><table class="tbl"><thead><tr><th>${ctx.t('sName')}</th><th class="r">${ctx.t('sPct')}</th></tr></thead><tbody>${elig().map((a) => { if (lv.pctAccount[a.id] == null) lv.pctAccount[a.id] = 1; return `<tr><td>${EFA.util.esc(a.name)}</td><td class="r" style="width:200px">${fld(ctx, lv.pctAccount, a.id, 'sPct', 'pct', { min: 0, max: 1 }).replace(/<span class="l">.*?<\/span>/, '')}</td></tr>`; }).join('')}</tbody></table></div>`;
            }
          }
          if (k === 'save' && state.opt) body += `<div>${swf(ctx, st, 'efficiency', 'eff')}<p class="b06-note">${ctx.t(st.efficiency ? 'effOn' : 'effOff')}</p></div>`;
          if (k === 'spend' && state.opt && compare) body += swf(ctx, state, 'both', 'both');
          host.innerHTML = `<div style="display:grid;gap:14px">${body}</div>`;
          const inner = host.firstElementChild;
          bindForm(ctx, inner, state, (kk) => { if (kk === 'adv') draw(); });
          inner.querySelectorAll('[data-wrap]').forEach((w) => { const key = w.dataset.wrap; if (lv.perAccount[key] !== undefined || elig().some((a) => a.id === key)) bindForm(ctx, w, state.opt === 1 ? lv.perAccount : lv.pctAccount); });
          const effB = inner.querySelector('[data-sk="efficiency"]'); if (effB) { effB.replaceWith(effB.cloneNode(true)); inner.querySelector('[data-sk="efficiency"]').addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; st.efficiency = !st.efficiency; draw(); }); }
          inner.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', () => { if (EFA.edit && EFA.edit.on) return; state.opt = +b.dataset.o; draw(); }));
          go.hidden = !state.opt;
          const pf = inner.querySelector('.pr[title]'); if (pf) pf.setAttribute('title', ctx.text('p_fundTip'));
          EFA.numify(host); if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
        };
        draw();
        go.addEventListener('click', () => {
          if (EFA.edit && EFA.edit.on) return;
          if (document.activeElement && host.contains(document.activeElement)) document.activeElement.blur();
          if (state.opt === 2 && !needTarget()) return;
          ov.close();
          busy(() => {
            if (state.opt === 2) setFund(state.fund);
            const g = GX.G(), s0 = sc();
            lv.save = null; lv.lump = false; lv.lumpBal = null;
            const base = aOpts(lv, hz);
            if (k === 'ror') { if (state.opt === 1) lv.points = state.v || 0; else { const s = GPS.solve(g, s0, 'ror', { base }); lv.points = s.value; noConv(s); } }
            if (k === 'work') { if (state.opt === 1) lv.retireAge = Math.max(g.clientAge, Math.min(100, Math.round(state.v))); else { const s = GPS.solve(g, s0, 'work', { base }); lv.retireAge = s.value; noConv(s); } }
            if (k === 'spend') {
              const Rr = lv.retireAge != null ? lv.retireAge : g.clientRetireAge;
              if (state.opt === 1) lv.retireTarget = (state.v || 0) * Math.pow(1 + (A.infl || 0), Math.max(Rr - g.clientAge, 0));
              else { const s = GPS.solve(g, s0, 'spend', { base }); lv.retireTarget = s.value; noConv(s); }
              lv.offset = -1;
            }
            if (k === 'save') {
              const typed = Object.keys(lv.perAccount).filter((x) => +lv.perAccount[x]);
              if (state.opt === 1) { if (!typed.length) lv.perAccount = {}; }
              else {
                lv.perAccount = {};
                const b2 = aOpts(lv, hz), eff = retired ? false : st.efficiency;
                const mn = GPS.solve(g, s0, 'saveMin', { base: b2, efficiency: eff });
                if (!mn.need) lv.save = { es: { A: mn.value, once: retired, pct: pctMap(lv) }, found: !eff };
                else {
                  const lump = GPS.solve(g, s0, 'save', { base: b2, efficiency: false, once: true, pct: pctMap(lv) });
                  lv.lumpText = lump.res.find[0].dep; lv.lumpBal = lump.res.find[0].bal0 + lump.res.find[0].dep;
                  const s = GPS.solve(g, s0, 'save', { base: b2, efficiency: eff, once: retired, pct: pctMap(lv) });
                  lv.save = { es: { A: s.value, once: retired, pct: pctMap(lv) }, found: !eff }; noConv(s);
                }
              }
            }
            lv.used[k] = true;
            if (k !== 'spend') lv.offset = 0;
          });
        });
      }
    },
    leave() { const st = GX.S(); if (st.keep) { st.keep = false; return; } const keep = st.lv && st.lv.answers; st.lv = LV0(); st.lv.answers = keep || null; st.play = false; }
  });
  /** C10: copy the revised plan's accounts into per-client lists other calculators read */
  function copyPlan(sc) {
    if (!sc) return;
    const G = GX.G(), out = { currentIncome: [], futureInflows: [], definedBenefits: [], savings: [], annualSavings: [], futureExpenses: [] };
    const age = (rec, k) => { const s = rec[k] || {}; const a0 = ownerAge(G, rec); return s.s === 'age' ? s.age : s.s === 'retire' ? (rec.owner === 'spouse' ? G.spouseRetireAge : G.clientRetireAge) : s.s === 'le' ? (rec.owner === 'spouse' ? G.spouseLE : G.clientLE) : a0; };
    const tax = { taxable: 'Taxable', note: 'Taxable', tdbt: 'Tax Def.', tdat: 'Tax Def.', taxfree: 'Tax Adv.' };
    sc.accounts.forEach((a) => {
      if (a.type === 'income') { const s = age(a, 'iStart'), e = age(a, 'iEnd'); if (!a.iStart || a.iStart.s === 'current') out.currentIncome.push({ description: a.name, amount: a.amount }); else if (s === e) out.futureInflows.push({ description: a.name, amount: a.amount, age: s, taxable: a.taxablePct }); else out.definedBenefits.push({ description: a.name, amount: a.amount, startAge: s, endAge: e, cola: a.infl == null ? G.inflationRate : a.infl, taxable: a.taxablePct }); return; }
      let tx = tax[a.type], bal = a.balance;
      if (a.type === 'annuity') tx = a.qualified && a.roth ? 'Tax Adv.' : 'Tax Def.';
      if (a.type === 'pli') { tx = 'Tax Adv.'; bal = a.csv; }
      if (a.type === 'property' && !a.residence) { tx = { taxable: 'Taxable', taxdef: 'Tax Def.', taxadv: 'Tax Adv.' }[a.treatment] || 'Taxable'; bal = a.value; }
      if (tx) out.savings.push({ name: a.name, balance: bal || 0, taxation: tx, risk: a.type === 'pli' ? 'low' : a.risk, accessible: !!a.accessible });
      if (tx && a.type !== 'property' && a.type !== 'note' && (a.contrib || a.premium) > 0) out.annualSavings.push({ description: a.name, amount: a.contrib || a.premium, taxation: tx, risk: a.risk, accessible: !!a.accessible });
      if ((a.type === 'tdbt' || a.type === 'tdat') && a.match > 0) out.annualSavings.push({ description: a.name + ' match', amount: a.match, taxation: tx, risk: a.risk, accessible: !!a.accessible });
      if (a.type === 'expense') { const s = age(a, 'iStart'); out.futureExpenses.push({ description: a.name, amount: a.amount, inflate: a.infl == null ? G.inflationRate : a.infl, startAge: s, years: age(a, 'iEnd') - s }); }
      if (a.type === 'term') { const s = age(a, 'iStart'); out.futureExpenses.push({ description: a.name, amount: a.premium, inflate: 0, startAge: s, years: age(a, 'iEnd') - s }); }
    });
    const sum = (l, k) => l.reduce((t, x) => t + (+x[k] || 0), 0);
    out.totals = { currentIncome: sum(out.currentIncome, 'amount'), annualSavings: sum(out.annualSavings, 'amount'), accumulatedSavings: sum(out.savings, 'balance') };
    EFA.clients.set('fgps', 'planData', out);
    const cd = lib('caseData');
    if (cd && cd.set) { cd.set('gps_plan_data', out); }
  }
  /** documents chooser: the seven worksheets (C8) */
  function openDocs(ctx, o) {
    const A = o.A, B = o.B, G = o.G, nameA = o.nameA, nameB = o.nameB;
    const W = lib('worksheet');
    const ov = gdlg(ctx, { title: ctx.t('docTitle'), w: 680, body: `<div class="b06-dlist">
      <p class="sec">${ctx.t('docRep')}</p>${[1, 2, 3, 4].map((n) => `<button type="button" class="st-pill ghost" data-rep="${n}" style="justify-content:flex-start">${ctx.t('dr' + n)}</button>`).join('')}
      <p class="sec">${ctx.t('docWs')}</p>${[1, 2, 3, 4, 5, 6, 7].map((n) => `<button type="button" class="st-pill ghost" data-ws="${n}" style="justify-content:flex-start">${ctx.t('ws' + n)}</button>`).join('')}
      <p class="sec">${ctx.t('docFile')}</p><button type="button" class="st-pill ghost" data-file style="justify-content:flex-start">${ctx.t('df1')}</button></div>` });
    ov.querySelectorAll('[data-rep]').forEach((b) => b.addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      const n = +b.dataset.rep, sc = o.sc;
      if (!sc) return;
      ov.close();
      if (n === 4) return openWrapEditor(ctx, sc, o.after);
      if (n === 2) return reportFactCheck(ctx, G, sc, o.who, A);
      if (n === 3) return reportRoadmap(ctx, G, sc, o.who, A, o.K);
      const bz = rpBusy(ctx);
      ctx.timeout(() => {
        let D = null;
        try { D = r1Data(G, sc); } catch (e) { console.error(e); }
        bz.close();
        if (D) reportResults(ctx, G, sc, o.who, D); else ctx.toast(ctx.text('engineErr'));
      }, 90);
    }));
    const fb = ov.querySelector('[data-file]');
    if (fb) fb.addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      ov.close();
      gconfirm(ctx, ctx.t('fileQ'), 'save', () => saveScenarioFile(ctx, G, o.scList || []));
    });
    const sp = G.useSpouse, ageCol = { field: 'age', header: ctx.t('wAge'), type: 'text', align: 'center', width: 90 };
    const ageTxt = (f) => (sp ? `${f.age}/${f.sage}` : String(f.age));
    const proj = (R, title) => ({ heading: `${EFA.util.esc(title)} ${ctx.t('wsWorksheet')}`, size: 'full', filter: false,
      columns: [ageCol].concat([['bal0', 'wBoy'], ['grossIncWd', 'wIncWd'], ['taxes', 'wTax'], ['spend', 'wSpend'], ['dep', 'wFLC'], ['item', 'wItem'], ['actual', 'wAct'], ['desired', 'wDes'], ['diff', 'wDelta'], ['funds', 'wFunds'], ['bal1', 'wEoy']].map(([f, h]) => ({ field: f, header: ctx.t(h), type: 'money' }))).concat([{ field: 'idx', header: ctx.t('wYears'), type: 'int' }]),
      rows: R.find.map((f) => Object.assign({}, f, { age: ageTxt(f) })), disclosures: ['hypothetical'] });
    const cf = (R, title) => {
      const ids = R.find.length ? Object.keys(R.find[0].per) : [];
      const cols = [ageCol, { field: 'year', header: ctx.t('wYear'), type: 'year' }].concat([['spend', 'wSpend'], ['dep', 'wFLC'], ['taxDue', 'wDue'], ['item', 'wItem'], ['desired', 'wDes'], ['required', 'wReq'], ['actual', 'wAct'], ['actualPV', 'wActPV'], ['diff', 'wDelta'], ['spendC', 'wCum'], ['taxes', 'wTax'], ['grossIncWd', 'wIncWd'], ['bal0', 'wBoy'], ['bal1', 'wEoy'], ['funds', 'wFunds'], ['ndb', 'wNdb'], ['nw', 'wNw'], ['ordInc', 'wOrd'], ['gainsInc', 'wGain']].map(([f, h]) => ({ field: f, header: ctx.t(h), type: 'money' })))
        .concat([['rateOrd', 'wROrd'], ['rateCg', 'wRCg'], ['ratePotOrd', 'wRPO'], ['ratePotCg', 'wRPG']].map(([f, h]) => ({ field: f, header: ctx.t(h), type: 'pct', dp: 3 }))).concat([{ field: 'potTax', header: ctx.t('wPot'), type: 'money' }]);
      ids.forEach((id) => { const nm = EFA.util.esc(R.find[0].per[id].name); cols.push({ field: 'b_' + id, header: nm, type: 'money', group: 'bal' }, { field: 'w_' + id, header: nm, type: 'money', group: 'wd' }, { field: 's_' + id, header: nm, type: 'money', group: 'sp' }); });
      return { heading: `${EFA.util.esc(title)} ${ctx.t('wsCf')}`, size: 'full', columns: cols, groups: [{ group: 'bal', label: ctx.t('wsBal') }, { group: 'wd', label: ctx.t('wsWd') }, { group: 'sp', label: ctx.t('wsSp') }],
        rows: R.find.map((f) => { const o = Object.assign({}, f, { age: ageTxt(f) }); ids.forEach((id) => { const p = f.per[id] || {}; o['b_' + id] = p.bal; o['w_' + id] = p.wd; o['s_' + id] = p.spend; }); return o; }), disclosures: ['hypothetical'] };
    };
    const ann = (R, title) => ({ heading: `${EFA.util.esc(title)} ${ctx.t('wsAnn')}`, size: 'full',
      columns: [ageCol, { field: 'year', header: ctx.t('wYear'), type: 'year' }].concat([['inc', 'wInc'], ['dep', 'wDep'], ['depQP', 'wQP'], ['wd', 'wWd'], ['sale', 'wSale'], ['borrow', 'wBorrow'], ['endTotal', 'wEnd'], ['ordInc', 'wOrd'], ['gains', 'wGain'], ['taxes', 'wTax'], ['potTax', 'wPot'], ['spend', 'wSpend'], ['risk1', 'wRisk'], ['safe1', 'wSafe'], ['house1', 'wHouse'], ['debt1', 'wDebt'], ['creditRem', 'wCredit'], ['liquidity', 'wLiq'], ['item', 'wItem'], ['taxDue', 'wDue'], ['assets', 'wAssets'], ['liab', 'wLiab'], ['nw', 'wNw'], ['ndb', 'wNdb'], ['db', 'wDb'], ['estate', 'wEst']].map(([f, h]) => ({ field: f, header: ctx.t(h), type: 'money' })))
        .concat([['rateOrd', 'wROrd'], ['rateCg', 'wRCg'], ['marg', 'wMarg']].map(([f, h]) => ({ field: f, header: ctx.t(h), type: 'pct', dp: 3 }))),
      rows: R.rows.map((s) => Object.assign({}, s, { age: sp ? `${s.age}/${s.sage}` : String(s.age) })), disclosures: ['hypothetical'] });
    const sum = () => ({ heading: ctx.t('ws3'), size: 'medium', filter: false,
      columns: [{ field: 'bl', header: `${ctx.t('present')} ${ctx.t('cLife')}`, type: 'money' }, { field: 'bf', header: `${ctx.t('present')} ${ctx.t('cFunds')}`, type: 'money' }, { field: 'bn', header: `${ctx.t('present')} ${ctx.t('cNW')}`, type: 'money' }, ageCol,
        { field: 'al', header: `${ctx.t('revisedW')} ${ctx.t('cLife')}`, type: 'money' }, { field: 'af', header: `${ctx.t('revisedW')} ${ctx.t('cFunds')}`, type: 'money' }, { field: 'an', header: `${ctx.t('revisedW')} ${ctx.t('cNW')}`, type: 'money' }],
      rows: B.find.map((f, r) => { const fa = A.find[Math.min(r, A.Y - 1)]; return { bl: f.actual, bf: f.funds, bn: B.rows[r].nw, age: ageTxt(f), al: fa.actual, af: fa.funds, an: A.rows[Math.min(r, A.Y - 1)].nw }; }), disclosures: ['hypothetical'] });
    ov.querySelectorAll('[data-ws]').forEach((b) => b.addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      if (!W) return;
      const n = +b.dataset.ws;
      const d = n === 1 ? proj(B, nameB) : n === 2 ? proj(A, nameA) : n === 3 ? sum() : n === 4 ? cf(B, nameB) : n === 5 ? ann(B, nameB) : n === 6 ? cf(A, nameA) : ann(A, nameA);
      ov.close(); W.open(ctx, d);
    }));
  }

  /* =====================================================================
     fgps23 reports (C9): the four-questions results report, the financial
     fact check and the retirement roadmap. This app has no print path, so
     each report is read in an in-stage overlay and saved through the app's
     downloads capability: the page as HTML, its table through
     EFA.lib.worksheet (the same spreadsheet and CSV writers the worksheet
     overlay uses).
     ===================================================================== */
  const RPTCSS = `
  .b06-rpt { display: grid; gap: 26px; justify-items: center; background: #e7e3db; padding: 26px 0 32px; }
  .b06-rpt .pg { width: 816px; box-sizing: border-box; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 4px; box-shadow: 0 10px 26px rgba(13,30,58,.12); padding: 54px 54px 48px; position: relative; overflow: hidden; color: #0d1e3a; font: 400 15px/1.55 "DM Sans", system-ui, sans-serif; }
  .b06-rpt .num { font-family: "DM Sans", system-ui, sans-serif; font-variant-numeric: tabular-nums lining-nums; font-feature-settings: "lnum" 1, "tnum" 1; }
  .b06-rpt h1, .b06-rpt h2, .b06-rpt h3 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 600; color: #0d1e3a; margin: 0 0 12px; }
  .b06-rpt h1 { font-size: 40px; line-height: 1.1; }
  .b06-rpt h2 { font-size: 29px; line-height: 1.15; }
  .b06-rpt h3 { font-size: 21px; line-height: 1.2; }
  .b06-rpt p { margin: 0 0 12px; }
  .b06-rpt .q { font-style: italic; color: #2b4c80; font-size: 16px; }
  .b06-rpt .eyebrow { font: 700 11px/1 "DM Sans", sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #8a6e22; margin: 0 0 10px; }
  .b06-rpt .rule { height: 3px; width: 86px; background: #b8972e; border-radius: 2px; margin: 0 0 20px; }
  .b06-rpt .cap { font-size: 12.5px; line-height: 1.5; color: #667389; margin: 0 0 6px; }
  .b06-rpt .pgf { position: absolute; left: 54px; right: 54px; bottom: 18px; display: flex; justify-content: space-between; font: 600 10px/1 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #a9a195; }
  .b06-rpt .cover { min-height: 1000px; display: grid; align-content: center; justify-items: center; text-align: center; gap: 10px; }
  .b06-rpt .cover .wm { position: absolute; left: 50%; top: 46%; transform: translate(-50%,-50%); opacity: .05; pointer-events: none; }
  .b06-rpt .cover .mk { position: absolute; width: 150px; height: 3px; background: #b8972e; }
  .b06-rpt .cover h1 { font-size: 50px; max-width: 620px; }
  .b06-rpt .cover .sub { font-size: 17px; color: #2b4c80; max-width: 560px; }
  .b06-rpt .cover .for { margin-top: 34px; font: 700 12px/1.6 "DM Sans", sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #8a6e22; }
  .b06-rpt .cover .who { font-family: "Cormorant Garamond", Georgia, serif; font-size: 30px; }
  .b06-rpt .cover .cred { margin-top: 26px; font: 600 11.5px/1.6 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #667389; }
  .b06-rpt table.rt { width: 100%; border-collapse: collapse; margin: 0 0 16px; font: 500 12px/1.3 "DM Sans", sans-serif; }
  .b06-rpt table.rt caption { caption-side: top; text-align: left; font: 700 11px/1 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; padding: 0 0 7px; color: #0d1e3a; }
  .b06-rpt table.rt th { text-align: left; font: 700 10px/1.25 "DM Sans", sans-serif; letter-spacing: .07em; text-transform: uppercase; padding: 7px 7px; color: #f7f5f1; background: #0d1e3a; }
  .b06-rpt table.rt td { padding: 6px 7px; border-bottom: 1px solid rgba(13,30,58,.1); vertical-align: top; font-variant-numeric: tabular-nums lining-nums; }
  .b06-rpt table.rt tbody tr:nth-child(even) td { background: rgba(227,232,240,.4); }
  .b06-rpt table.rt td.r, .b06-rpt table.rt th.r { text-align: right; }
  .b06-rpt table.rt td.c, .b06-rpt table.rt th.c { text-align: center; }
  .b06-rpt table.rt.gold th { background: #8a6e22; }
  .b06-rpt table.rt.rust th { background: #8c4a2a; }
  .b06-rpt table.rt.goldPale th { background: #b8972e; color: #0d1e3a; }
  .b06-rpt table.rt.steel th { background: #2b4c80; }
  .b06-rpt table.rt.rose th { background: #99413a; }
  .b06-rpt .tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px 14px; margin: 0 0 18px; }
  .b06-rpt .tile { border-left: 3px solid #b8972e; padding: 2px 0 2px 10px; }
  .b06-rpt .tile .l { display: block; font: 700 9.5px/1.2 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #8a6e22; }
  .b06-rpt .tile .v { display: block; font: 600 16px/1.3 "DM Sans", sans-serif; color: #0d1e3a; font-variant-numeric: tabular-nums lining-nums; }
  .b06-rpt .ch { margin: 4px 0 14px; }
  .b06-rpt .ch svg { width: 100%; height: auto; display: block; }
  .b06-rpt .lg { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0 0 12px; font: 600 11.5px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-rpt .lg span { display: inline-flex; align-items: center; gap: 6px; }
  .b06-rpt .lg i { width: 13px; height: 13px; border-radius: 3px; display: inline-block; }
  .b06-rpt .big { font: 700 25px/1.2 "DM Sans", sans-serif; color: #0d1e3a; margin: 0 0 14px; font-variant-numeric: tabular-nums lining-nums; }
  .b06-rpt .em { background: #f0e6c4; border-left: 3px solid #b8972e; padding: 11px 14px; margin: 0 0 14px; }
  .b06-rpt .disc { font-size: 11.5px; line-height: 1.5; color: #667389; }
  .b06-rpt ul, .b06-rpt ol { margin: 0 0 12px; padding-left: 22px; }
  .b06-rpt li { margin: 0 0 6px; }
  .b06-rpt .wu .in1 { padding-left: 26px; } .b06-rpt .wu .in2 { padding-left: 52px; }
  .b06-rpt .wu .st-cover { font-family: "Cormorant Garamond", Georgia, serif; font-size: 40px; line-height: 1.1; margin: 0 0 14px; }
  .b06-rpt .wu .st-title { font-family: "Cormorant Garamond", Georgia, serif; font-size: 29px; line-height: 1.15; margin: 0 0 12px; }
  .b06-rpt .wu .st-sub { font-family: "Cormorant Garamond", Georgia, serif; font-size: 21px; color: #2b4c80; margin: 0 0 12px; }
  .b06-rpt .wu .st-basic { font-size: 14px; }
  `;
  EFA.css('b06rpt', RPTCSS);
  EFA.css('b06rpt2', `
  .stage .b06-rptd .st-overlay-b { padding: 0; display: block; }
  .stage .b06-rptd .b06-gdb { padding: 0; }
  .stage .b06-rptd .foot { position: sticky; bottom: 0; z-index: 6; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 12px 26px 14px; background: #fffdf8; border-top: 1px solid #d6cfc4; }
  .b06-rptd .b06-rpt { margin: 0; }
  .b06-rptd .foot .grp { display: flex; gap: 10px; align-items: center; }
  .b06-dlist { display: grid; gap: 9px; }
  .b06-dlist .sec { font: 700 11px/1 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #8a6e22; margin: 6px 0 0; }
  .b06-busy { display: grid; gap: 10px; justify-items: center; text-align: center; padding: 10px 0 4px; }
  .b06-busy .dot { width: 30px; height: 30px; border-radius: 50%; border: 4px solid #e3e8f0; border-top-color: #b8972e; animation: b06spin 1s linear infinite; }
  /* rich text wrap-up editor */
  .b06-rte { display: grid; gap: 12px; }
  .b06-rte .tb { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; background: #f1eee7; border: 1px solid #d6cfc4; border-radius: 10px; padding: 7px 9px; }
  .b06-rte .tb .gp { display: flex; gap: 4px; align-items: center; }
  .b06-rte .tb .sp { width: 1px; height: 26px; background: #d6cfc4; margin: 0 4px; }
  .b06-rte .tb button.tbb { min-width: 32px; height: 32px; border: 1px solid #cbd5e3; border-radius: 7px; background: #fff; color: #0d1e3a; font: 600 15px/1 "DM Sans", sans-serif; display: grid; place-items: center; padding: 0 7px; }
  .b06-rte .tb button.tbb:hover { background: #0d1e3a; color: #f7f5f1; }
  .b06-rte .tb button.sw { width: 24px; height: 24px; border-radius: 5px; border: 1px solid rgba(13,30,58,.25); }
  .b06-rte .tb select { height: 32px; border: 1px solid #cbd5e3; border-radius: 7px; background: #fff; font: 600 13px/1 "DM Sans", sans-serif; color: #0d1e3a; padding: 0 6px; }
  .b06-rte .ed { width: 1000px; max-width: 100%; height: 440px; overflow: auto; background: #fff; border: 1px solid #cbd5e3; border-radius: 10px; padding: 22px 26px; font: 400 15px/1.55 "DM Sans", sans-serif; color: #0d1e3a; }
  .b06-rte .ed:focus { outline: 2px solid #b8972e; outline-offset: 1px; }
  .b06-rte .lk { display: flex; gap: 8px; align-items: flex-end; }
  .b06-rte .lk input { height: 34px; border: 1.5px solid #cbd5e3; border-radius: 8px; padding: 0 9px; font: 600 14px/1 "DM Sans", sans-serif; }
  .b06-grid { width: 100%; border-collapse: collapse; font: 600 15px/1 "DM Sans", sans-serif; }
  .b06-grid th { position: sticky; top: 0; z-index: 1; background: #0d1e3a; color: #f7f5f1; font: 700 11px/1.2 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; padding: 8px 8px; }
  .b06-grid td { padding: 2px 4px; border-bottom: 1px solid rgba(13,30,58,.07); }
  .b06-grid td.y { text-align: center; width: 64px; font-weight: 700; }
  .b06-grid td.sel input { outline: 2px solid #b8972e; }
  .b06-grid input { width: 100%; box-sizing: border-box; height: 30px; border: 1px solid #e3e8f0; border-radius: 6px; text-align: right; padding: 0 6px; font: 600 14px/1 "DM Sans", sans-serif; color: #0d1e3a; font-variant-numeric: tabular-nums lining-nums; }
  .b06-acts { border: 1px solid #cbd5e3; border-radius: 10px; overflow: hidden; }
  .b06-acts .row { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-bottom: 1px solid rgba(13,30,58,.08); font: 600 15px/1.3 "DM Sans", sans-serif; }
  .b06-acts .row:last-child { border-bottom: 0; }
  .b06-acts .row .g { flex: 1 1 auto; }
  .b06-acts .row .s { font: 500 13px/1.3 "DM Sans", sans-serif; color: #667389; }
  .b06-acts .none { padding: 14px; text-align: center; color: #8a93a3; font: 500 15px/1 "DM Sans", sans-serif; }
  `);

  /* ---------- small helpers shared by the reports ---------- */
  const rpM = (v) => `<span class="num">${F.money(Math.round(v || 0))}</span>`;
  const rpC = (v) => `<span class="num">${F.money(v || 0, { dp: 2 })}</span>`;
  const rpN = (v, dp) => `<span class="num">${F.num(v || 0, dp == null ? 2 : dp)}</span>`;
  const rpP = (v, dp) => `<span class="num">${F.pct(v || 0, dp == null ? 2 : dp)}</span>`;
  const rpI = (v) => `<span class="num">${v == null ? '' : F.int(v)}</span>`;
  /** the age an age-strategy field resolves to on this record */
  function stratAge(G, rec, k) {
    const s = rec[k] || {}, a0 = ownerAge(G, rec);
    if (s.s === 'age') return s.age == null ? a0 : s.age;
    if (s.s === 'retire') return rec.owner === 'spouse' && G.useSpouse ? G.spouseRetireAge : G.clientRetireAge;
    if (s.s === 'le') return rec.owner === 'spouse' && G.useSpouse ? G.spouseLE : G.clientLE;
    return a0;
  }
  const mktLabel = (rec, G) => { const key = rec.useGlobalMH ? G.globalMarket : rec.market, m = GPS.markets().find((x) => x.key === key); return m ? m.label : ''; };
  /** the combined life expectancy age, in the client's years */
  const combLE = (G) => Math.min(100, G.useSpouse ? Math.max(G.clientLE, G.spouseLE + G.clientAge - G.spouseAge) : G.clientLE);
  const taxText = (ctx, G) => (G.autoTaxRate
    ? `${ctx.text({ single: 'fsSingle', mfj: 'fsMfj', mfs: 'fsMfs', hoh: 'fsHoh' }[G.filingStatus] || 'fsMfj')}, ${G.itemize ? F.money(G.deductions || 0) : ctx.text('rtStd')}`
    : `${ctx.text('rtAccum')} ${F.pct(G.taxAccumulation, 2)} · ${ctx.text('rtDist')} ${F.pct(G.taxDistribution, 2)} · ${ctx.text('rtCg')} ${F.pct(G.taxCapGains, 2)}`);

  /** C9 shared block: the plan data tables. Each table is dropped when it has no rows. */
  function planTables(ctx, G, sc, variant) {
    const out = [], acc = (sc.accounts || []).filter((a) => a.type !== 'child');
    const own = (a) => ctx.t(a.owner === 'spouse' ? 'ownSpouse' : a.owner === 'joint' ? 'ownJoint' : 'ownClient');
    const risk = (a) => ctx.t({ low: 'rLow', med: 'rMed', high: 'rHigh' }[a.risk] || 'rMed');
    const yn = (a) => ctx.t(a.accessible ? 'yes' : 'no');
    const ag = (a, k) => rpI(stratAge(G, a, k));
    const rate = (a) => (G.useMarketHistory && (a.useMH || a.useGlobalMH) && INVT[a.type] ? EFA.util.esc(mktLabel(a, G)) : rpP(a.ret != null ? a.ret : a.rate));
    const add = (key, tone, cols, rows) => { if (rows.length) out.push({ key, tone, cols, rows }); };
    const nm = (a) => EFA.util.esc(a.name || '');
    const pick = (t) => acc.filter((a) => a.type === t);
    add('rtIncome', 'navy', [['cName'], ['f_owner'], ['f_amount', 'r'], ['f_infl', 'r'], ['f_taxablePct', 'r'], ['f_dedAmt', 'r'], ['rtStart', 'c'], ['rtEnd', 'c']],
      pick('income').map((a) => [nm(a), own(a), rpM(a.amount), rpP(a.infl == null ? G.inflationRate : a.infl), rpP(a.taxablePct), rpM(a.deductible), ag(a, 'iStart'), ag(a, 'iEnd')]));
    add('rtInvest', 'gold', [['cName'], ['f_owner'], ['cType'], ['f_balance', 'r'], ['f_ret', 'r'], ['f_fee', 'r'], ['f_risk'], ['f_access', 'c'], ['f_contrib', 'r'], ['rtStart', 'c'], ['rtEnd', 'c']],
      acc.filter((a) => INVT[a.type]).map((a) => [nm(a), own(a), tyS(ctx, a.type), rpM(a.balance), rate(a), rpP(a.fee), risk(a), yn(a),
        rpM(a.contrib) + ((a.type === 'tdbt' || a.type === 'tdat') && a.match ? ' / ' + rpM(a.match) : ''), ag(a, 'cStart'), ag(a, 'cEnd')]));
    add('rtNotes', 'gold', [['cName'], ['f_owner'], ['f_balance', 'r'], ['f_rate', 'r'], ['f_pmtCard', 'r']],
      pick('note').map((a) => [nm(a), own(a), rpM(a.balance), rpP(a.rate), rpC(a.pmt)]));
    add('rtPli', 'gold', [['cName'], ['f_owner'], ['f_av', 'r'], ['f_csv', 'r'], ['f_risk'], ['f_access', 'c'], ['f_premium', 'r'], ['f_db', 'r']],
      pick('pli').map((a) => [nm(a), own(a), rpM(a.av), rpM(a.csv), ctx.t('rLow'), yn(a), rpM(a.premium), rpM(a.db)]));
    add('rtLoans', 'rust', [['cName'], ['f_owner'], ['cType'], ['f_balance', 'r'], ['f_rate', 'r'], ['f_pmtCard', 'r'], ['f_line', 'r']],
      acc.filter((a) => a.type === 'loan' || a.type === 'credit').map((a) => [nm(a), own(a), tyS(ctx, a.type), rpM(a.balance), rpP(a.rate), rpC(a.pmt), a.type === 'loan' ? rpM(a.creditLine) : '']));
    add('rtProp', 'goldPale', [['cName'], ['f_owner'], ['f_value', 'r'], ['f_appr', 'r'], ['f_basis', 'r'], ['f_excl', 'r'], ['f_saleAge', 'c']],
      pick('property').map((a) => [nm(a), own(a), rpM(a.value), rpP(a.appr), rpM(a.costBasis), rpM(a.exclusion), a.sell ? rpI(a.saleAge) : ctx.t('none')]));
    add('rtIns', 'steel', [['cName'], ['f_owner'], ['f_ptype'], ['f_premium', 'r'], ['f_benefit', 'r'], ['rtStart', 'c'], ['rtEnd', 'c']],
      pick('term').map((a) => [nm(a), own(a), ctx.t({ life: 'ptLife', disability: 'ptDis', ltc: 'ptLtc', pc: 'ptPc', umbrella: 'ptUmb' }[a.policyType] || 'ptLife'), rpM(a.premium), rpM(a.benefit), ag(a, 'iStart'), ag(a, 'iEnd')]));
    add('rtExp', 'rose', [['cName'], ['f_owner'], ['f_usage'], ['f_amount', 'r'], ['f_infl', 'r'], ['rtStart', 'c'], ['rtEnd', 'c']],
      pick('expense').map((a) => [nm(a), own(a), ctx.t(a.usage === 'taxes' ? 'usTaxes' : 'usItem'), rpM(a.amount), rpP(a.infl == null ? G.inflationRate : a.infl), ag(a, 'iStart'), ag(a, 'iEnd')]));
    return out.map((t) => rtTable(ctx, t)).join('');
  }
  const rtTable = (ctx, t) => `<table class="rt ${t.tone}">${t.key ? `<caption>${ctx.t(t.key)}</caption>` : ''}<thead><tr>${t.cols.map(([k, c]) => `<th class="${c || ''}">${ctx.t(k)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((v, i) => `<td class="${t.cols[i][1] || ''}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const rpTiles = (items) => `<div class="tiles">${items.map(([l, v]) => `<div class="tile"><span class="l">${l}</span><span class="v">${v || '&nbsp;'}</span></div>`).join('')}</div>`;
  /** the people block: four tiles for the client, four for the spouse, then the plan assumptions (results and roadmap variant) */
  function peopleBlock(ctx, G, A, sc, variant) {
    const t = [[ctx.t('clientName'), EFA.util.esc(G.clientName || G.contactName || '')], [ctx.t('age'), rpI(G.clientAge)], [ctx.t('retireAge'), rpI(G.clientRetireAge)], [ctx.t('le'), rpI(G.clientLE)]];
    const s = G.useSpouse ? [[ctx.t('clientName'), EFA.util.esc(G.spouseName || '')], [ctx.t('age'), rpI(G.spouseAge)], [ctx.t('retireAge'), rpI(G.spouseRetireAge)], [ctx.t('le'), rpI(G.spouseLE)]] : [];
    let html = `<h3>${ctx.text('rtPersonal')}</h3>` + rpTiles(t.concat(s));
    if (variant !== 'fact') {
      html += rpTiles([[ctx.t('rtTaxes'), EFA.util.esc(taxText(ctx, G))], [ctx.t('rtInfl'), rpP(G.inflationRate)],
        [ctx.t('rtDesired'), rpM(A.T0) + (sc.inflateLifestyle || sc.maintainCurrentLifestyle ? ' ' + ctx.text('rtCola') : '')], [ctx.t('rtLegacy'), rpM(G.desiredLegacy)]]);
    }
    return html;
  }

  /* ---------- report charts (drawn in code, no legend or tooltips unless asked) ---------- */
  const RPTC = { bar: P.navy3, barLate: 'rgba(179,64,46,.55)', present: P.navy, revised: '#2f8a52', line3: P.gold, line4: P.navy4, line5: '#99413a' };
  function chAxis(w, h, pad, max, cats, every) {
    let g = '';
    for (let i = 0; i <= 5; i++) {
      const v = max * i / 5, y = pad.t + (h - pad.t - pad.b) * (1 - i / 5);
      g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${P.rule}" stroke-width="1"/>`;
      g += `<text x="${pad.l - 10}" y="${(y + 5).toFixed(1)}" text-anchor="end" font-family="DM Sans, sans-serif" font-size="15" fill="#667389">${F.money(Math.round(v))}</text>`;
    }
    cats.forEach((c, i) => {
      if (i % every && i !== cats.length - 1) return;
      const x = pad.l + (i + 0.5) * (w - pad.l - pad.r) / cats.length;
      g += `<text x="${x.toFixed(1)}" y="${h - pad.b + 24}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="15" fill="#667389">${c}</text>`;
    });
    return g;
  }
  /**
   * One column per age plus up to two lines on the same scale.
   * o: {cats, values, split (index where the late color starts), lines:[{values, color, width}], max, w, h}
   */
  function rptBars(o) {
    const w = o.w || 1000, h = o.h || 500, pad = { l: 118, r: 24, t: 20, b: 44 };
    const n = Math.max(1, o.cats.length), max = Math.max(1, o.max || 0);
    const bw = (w - pad.l - pad.r) / n, gap = Math.min(5, bw * 0.22);
    const Y = (v) => pad.t + (h - pad.t - pad.b) * (1 - Math.max(0, Math.min(max, v || 0)) / max);
    const X = (i) => pad.l + (i + 0.5) * bw;
    let g = chAxis(w, h, pad, max, o.cats, Math.max(1, Math.ceil(n / 14)));
    (o.values || []).forEach((v, i) => {
      const y = Y(v), bh = h - pad.b - y;
      if (bh <= 0.4) return;
      g += `<rect x="${(pad.l + i * bw + gap / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(1, bw - gap).toFixed(1)}" height="${bh.toFixed(1)}" fill="${o.split != null && i >= o.split ? RPTC.barLate : RPTC.bar}"/>`;
    });
    (o.lines || []).forEach((L) => {
      const d = L.values.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
      g += `<path d="${d}" fill="none" stroke="${L.color}" stroke-width="${L.width || 4}" stroke-linejoin="round" stroke-linecap="round"/>`;
    });
    g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}" stroke="${P.navy}" stroke-width="1.5"/>`;
    return `<div class="ch"><svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-hidden="true">${g}</svg></div>`;
  }
  /** stacked columns (one series per account withdrawal) with lines over them; legend rendered as HTML */
  function rptStack(ctx, o) {
    const w = o.w || 1000, h = o.h || 450, pad = { l: 118, r: 24, t: 20, b: 44 };
    const n = Math.max(1, o.cats.length);
    const tot = o.cats.map((_, i) => (o.series || []).reduce((t, s) => t + Math.max(0, s.values[i] || 0), 0));
    const max = Math.max(1, ...tot, ...(o.lines || []).flatMap((L) => L.values.map((v) => Math.max(0, v || 0))));
    const bw = (w - pad.l - pad.r) / n, gap = Math.min(5, bw * 0.22);
    const Y = (v) => pad.t + (h - pad.t - pad.b) * (1 - Math.max(0, Math.min(max, v || 0)) / max);
    const X = (i) => pad.l + (i + 0.5) * bw;
    let g = chAxis(w, h, pad, max, o.cats, Math.max(1, Math.ceil(n / 14)));
    o.cats.forEach((_, i) => {
      let acc = 0;
      (o.series || []).forEach((s) => {
        const v = Math.max(0, s.values[i] || 0); if (v <= 0) return;
        const y0 = Y(acc), y1 = Y(acc + v); acc += v;
        g += `<rect x="${(pad.l + i * bw + gap / 2).toFixed(1)}" y="${y1.toFixed(1)}" width="${Math.max(1, bw - gap).toFixed(1)}" height="${Math.max(0.5, y0 - y1).toFixed(1)}" fill="${s.color}"/>`;
      });
    });
    (o.lines || []).forEach((L) => {
      const d = L.values.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
      g += `<path d="${d}" fill="none" stroke="${L.color}" stroke-width="3" stroke-linejoin="round" ${L.dash ? `stroke-dasharray="${L.dash}"` : ''}/>`;
    });
    g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}" stroke="${P.navy}" stroke-width="1.5"/>`;
    const lg = (o.series || []).concat(o.lines || []).map((s) => `<span><i style="background:${s.color}"></i>${EFA.util.esc(s.label || '')}</span>`).join('');
    return `<div class="ch"><svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-hidden="true">${g}</svg></div>${o.legend === false ? '' : `<div class="lg">${lg}</div>`}`;
  }

  /* ---------- the report viewer (in-stage overlay) and its downloads ---------- */
  const rpPage = (inner, cls) => `<div class="pg ${cls || ''}">${inner}</div>`;
  const rpFoot = (ctx, n) => `<div class="pgf"><span>${ctx.text('rpBrand')}</span><span>${ctx.text('rpPage')} ${n}</span></div>`;
  function rpCover(ctx, o) {
    return rpPage(`<div class="mk" style="left:54px;top:120px"></div><div class="mk" style="right:54px;bottom:120px"></div>
      <div class="wm">${A.emblem({ size: 460 })}</div>
      <div class="cover">${ctx.t('rpEyebrow', { tag: 'p', cls: 'eyebrow' })}${ctx.t(o.titleKey, { tag: 'h1' })}${ctx.t(o.subKey, { tag: 'p', cls: 'sub' })}
        <p class="for">${ctx.t('rpPrepared')}</p><p class="who">${EFA.util.esc(o.who)}</p>
        <p class="cred">${ctx.t('rpBrand')}<br>${ctx.t('rpCred')}</p></div>`, 'cover');
  }
  const rpDisclose = (ctx) => rpPage(`${ctx.t('rpDisc', { tag: 'h2' })}<div class="rule"></div><div class="disc">${discLine(['hypothetical', 'guarantees', 'tax', 'loans', 'notAdvice', 'past', 'license']) || ''}</div>`);
  /** strip the wording-editor wrappers so a saved file holds plain markup */
  function rpClean(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    d.querySelectorAll('[data-k]').forEach((n) => { n.removeAttribute('data-k'); n.removeAttribute('data-s'); n.removeAttribute('contenteditable'); n.removeAttribute('tabindex'); n.classList.remove('ed-on'); });
    return d.innerHTML;
  }
  const rpFile = (s) => String(s || 'report').replace(/[*?:\\/[\]<>|"]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 110) || 'report';
  /** o: {title, titleText, file, pages, sheet (worksheet data or null) } */
  function openReport(ctx, o) {
    const dlNow = () => (EFA.platform && EFA.platform.downloads) || null;
    const ov = gdlg(ctx, {
      title: o.title, w: 1240, cls: 'b06-rptd', body: `<div class="b06-rpt">${o.pages}${rpDisclose(ctx)}</div>`,
      foot: `<span class="b06-note">${ctx.t('rpNote')}</span><div class="grp"><button type="button" class="st-pill ghost dlh" hidden>${ctx.t('rpDl')}</button>${o.sheet ? `<button type="button" class="st-pill ghost dlx" hidden>${ctx.t('rpDlX')}</button><button type="button" class="st-pill ghost dlc" hidden>${ctx.t('rpDlC')}</button>` : ''}<button type="button" class="st-pill okb">${ctx.t('ok')}</button></div>`
    });
    ov.classList.add('b06-rptd');
    const sync = () => { const on = !!dlNow(); ['.dlh', '.dlx', '.dlc'].forEach((s) => { const b = ov.querySelector(s); if (b) b.hidden = !on; }); };
    sync();
    if (EFA.platform && !EFA.platform.known) { let k = 0; const t = setInterval(() => { k++; if (!ov.isConnected || k > 40 || EFA.platform.known) clearInterval(t); if (ov.isConnected) sync(); }, 500); }
    const save = (filename, data) => { const dl = dlNow(); if (!dl) { sync(); return; } Promise.resolve().then(() => dl.save({ filename, data })).catch((e) => { if (e && e.code) sync(); else console.error(e); }); };
    ov.querySelector('.dlh').addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      const body = rpClean(ov.querySelector('.b06-rpt').innerHTML);
      save(rpFile(o.file) + '.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${EFA.util.esc(o.titleText)}</title><style>body{margin:0;background:#e7e3db;font-family:"DM Sans",system-ui,sans-serif}${RPTCSS}.b06-rpt{margin:0;padding:26px 0 32px}@media print{body{background:#fff}.b06-rpt{display:block;padding:0}.b06-rpt .pg{box-shadow:none;border:0;border-radius:0;page-break-after:always;width:auto}}</style></head><body><div class="b06-rpt">${body}</div></body></html>`);
    });
    const W = lib('worksheet');
    if (o.sheet && W) {
      ov.querySelector('.dlx').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) save(rpFile(o.sheet.file || o.file) + '.xlsx', W.xlsx(o.sheet)); });
      ov.querySelector('.dlc').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) save(rpFile(o.sheet.file || o.file) + '.csv', W.csv(o.sheet)); });
    }
    ov.querySelector('.okb').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) ov.close(); });
    return ov;
  }
  /** the "a calculation is in progress" modal (C9 R1) */
  function rpBusy(ctx) {
    const ov = gdlg(ctx, { title: ctx.t('busyTitle'), w: 560, body: `<div class="b06-busy"><span class="dot"></span>${ctx.t('busyBody', { tag: 'p', attrs: 'style="margin:0;max-width:420px"' })}</div>` });
    ov.querySelector('.st-overlay-x').style.display = 'none';
    return ov;
  }

  /* ---------- R1: the four-questions results report ---------- */
  /**
   * C9 R1 data collection. Runs on a fresh baseline of the revised scenario with no hazard and no
   * lever changes, so nothing on the screen has to be reset for it. Several solves: a few seconds.
   */
  function r1Data(G, sc) {
    const retired = isRetiredHH(G), base = GPS.project(G, sc, {}), le = combLE(G), a0 = base.a0;
    const upto = (res, field) => res.find.filter((f) => f.age <= le).map((f) => (field ? res.rows[f.idx][field] : f.funds));
    const o = { retired, base, le, ages: base.find.filter((f) => f.age <= le).map((f) => f.age), present: upto(base) };
    o.retRow = Math.max(0, Math.min(base.Y - 1, G.clientRetireAge - a0));
    const s1 = GPS.solve(G, sc, 'ror', { base: {} });
    o.P = s1.value; o.q1 = upto(s1.res); o.required = base.avgReturn + s1.value;
    const mn = GPS.solve(G, sc, 'saveMin', { base: {}, efficiency: true });
    if (mn.need) {
      const inc = GPS.solve(G, sc, 'save', { base: {}, efficiency: false, once: retired });
      o.Sinc = inc.res.find[0].dep; o.extra = o.Sinc - base.find[0].dep; o.ideal = upto(inc.res); o.q4inc = o.ideal;
      if (retired) { o.q4 = o.ideal; o.reqStart = inc.res.find[0].bal0 + o.Sinc; o.Seff = o.Sinc; o.effLife = inc.res.find[0].actual; }
      else { const eff = GPS.solve(G, sc, 'save', { base: {}, efficiency: true }); o.Seff = eff.res.find[0].dep; o.effLife = eff.res.find[0].actual; o.q4 = upto(eff.res); }
    } else {
      o.Seff = o.Sinc = mn.res.find[0].dep; o.effLife = mn.res.find[0].actual; o.extra = 0;
      o.ideal = o.q4 = o.q4inc = upto(mn.res);
      if (retired) o.reqStart = mn.res.find[0].bal0 + o.Seff;
    }
    if (retired) { o.q2ret = upto(base, 'endTotal'); o.lasts = base.moneyLasts; o.lastsAmount = base.moneyLastsAmount; }
    else { const w = GPS.solve(G, sc, 'work', { base: {} }); o.Rw = w.value; o.q2 = upto(w.res); }
    const sp = GPS.solve(G, sc, 'spend', { base: {} });
    o.q3 = upto(sp.res); o.Wl = sp.res.find[Math.min(o.retRow, sp.res.Y - 1)].actual;
    const was = base.find[o.retRow].actual;
    o.reduction = was > 0 ? 100 * (1 - o.Wl / was) : -1000;
    o.WlPV = o.Wl / Math.pow(1 + (base.infl || 0), Math.max(G.clientRetireAge - a0, 0));
    o.baseDep = base.find[0].dep;
    o.max = Math.max(1, ...[o.present, o.q1, o.ideal, o.q4, o.q4inc, o.q2, o.q2ret, o.q3].filter(Boolean).map((d) => Math.max(...d)));
    return o;
  }
  function reportResults(ctx, G, sc, who, D) {
    const retired = D.retired, pg = [];
    const ch = (vals, lines) => rptBars({ cats: D.ages, values: vals, split: Math.max(0, G.clientRetireAge - G.clientAge), max: D.max, lines, w: 1000, h: 440 });
    const caps = `${ctx.t('r1cBar', { tag: 'p', cls: 'cap' })}${ctx.t('r1cSplit', { tag: 'p', cls: 'cap' })}${ctx.t('r1cLines', { tag: 'p', cls: 'cap' })}`;
    let n = 1;
    pg.push(rpCover(ctx, { titleKey: 'r1Title', subKey: 'r1Sub', who }));
    pg.push(rpPage(`${ctx.t('r1iH', { tag: 'h2' })}<div class="rule"></div>
      ${ctx.t('r1i1', { tag: 'p' })}${ctx.t('r1i2', { tag: 'p' })}${ctx.t('r1i3', { tag: 'p' })}${ctx.t(retired ? 'r1i4r' : 'r1i4', { tag: 'p' })}${ctx.t('r1i5', { tag: 'p' })}${ctx.t('r1i6', { tag: 'p' })}${rpFoot(ctx, ++n)}`));
    /* question 1: the return */
    pg.push(rpPage(`${ctx.t('r1q1H', { tag: 'h2' })}<div class="rule"></div>${ctx.t('r1q1Q', { tag: 'p', cls: 'q' })}
      <p class="big">${retired ? `${ctx.t('r1q1ar')} ${rpI(D.le)} ${ctx.t('r1q1c')} ${rpP(D.required)} ${ctx.t('r1q1d')}`
        : `${ctx.t('r1q1a')} ${rpI(G.clientRetireAge)} ${ctx.t('r1q1b')} ${rpI(D.le)} ${ctx.t('r1q1c')} ${rpP(D.required)} ${ctx.t('r1q1d')}`}</p>
      ${ctx.t(D.P > 0.00005 ? 'r1q1Up' : 'r1q1Dn', { tag: 'p' })}
      ${ch(D.q1, [{ values: D.present, color: RPTC.present }, { values: D.q1, color: RPTC.revised }])}${caps}${rpFoot(ctx, ++n)}`));
    /* question 2: the saving */
    let q2 = `${ctx.t('r1q2H', { tag: 'h2' })}<div class="rule"></div>${ctx.t('r1q2Q', { tag: 'p', cls: 'q' })}`;
    if (retired) {
      q2 += D.extra > 0
        ? `<p class="big">${ctx.t('r1q2ra')} ${rpM(D.reqStart)} ${ctx.t('r1q2rb')} ${rpM(D.extra)} ${ctx.t('r1q2rc')}</p>${ctx.t('r1q2rd', { tag: 'p' })}`
        : `<p class="big">${ctx.t('r1q2rok')}</p>${ctx.t('r1q2ok', { tag: 'p' })}${ctx.t('r1q2leg', { tag: 'p' })}`;
    } else if (D.extra > 0) {
      q2 += `<p class="big">${ctx.t('r1q2a')} ${rpM(D.Sinc)} ${ctx.t('r1q2b')} ${rpM(D.extra)} ${ctx.t('r1q2c')}</p>
        ${ctx.t('r1q2d', { tag: 'p' })}<p>${ctx.t('r1q2e')} ${rpM(D.effLife)} ${ctx.t('r1q2f')} ${rpM(D.Seff)} ${ctx.t('r1q2g')}</p>`;
    } else {
      q2 += `<p class="big">${ctx.t('r1q2okH')}</p>${ctx.t('r1q2ok', { tag: 'p' })}`
        + (D.extra < 0 && D.Seff > 0 ? `<p>${ctx.t('r1q2ok2')} ${rpM(D.Seff)} ${ctx.t('r1q2ok3')}</p>` : '');
    }
    const cTail = D.Seff <= 0 ? ctx.t('r1q2cA') : `${ctx.t(D.Seff >= D.baseDep ? 'r1q2cUp' : 'r1q2cDn')} ${rpM(D.Seff)} ${ctx.t('r1q2cTail')}`;
    q2 += ch(D.ideal, [{ values: D.present, color: RPTC.present }, { values: D.q4, color: RPTC.revised }]) + caps + `<p class="cap">${cTail}</p>` + rpFoot(ctx, ++n);
    pg.push(rpPage(q2));
    /* question 3: the arrival time, or how long what is built lasts */
    let q3;
    if (retired) {
      q3 = `${ctx.t('r1q3Hr', { tag: 'h2' })}<div class="rule"></div>${ctx.t('r1q3Qr', { tag: 'p', cls: 'q' })}
        <p class="big">${ctx.t('r1q3ra')} ${rpI(D.lasts)}, ${ctx.t('r1q3rb')} ${rpM(D.lastsAmount)} ${ctx.t('r1q3rc')}</p>${ctx.t('r1q3rd', { tag: 'p' })}
        ${ch(D.q2ret, [{ values: D.present, color: RPTC.present }])}${ctx.t('r1cBar', { tag: 'p', cls: 'cap' })}${ctx.t('r1cSplit', { tag: 'p', cls: 'cap' })}${ctx.t('r1cPresent', { tag: 'p', cls: 'cap' })}`;
    } else {
      const more = D.Rw - G.clientRetireAge, left = Math.max(0, G.clientLE - D.Rw);
      q3 = `${ctx.t('r1q3H', { tag: 'h2' })}<div class="rule"></div>${ctx.t('r1q3Q', { tag: 'p', cls: 'q' })}
        <p class="big">${ctx.t('r1q3a')} ${rpI(D.le)}, ${ctx.t('r1q3b')} ${rpI(D.Rw)}.</p>
        <p>${more === 0 ? ctx.t('r1q3same') : `${ctx.t('r1q3d')} ${rpI(Math.abs(more))} ${ctx.t(more > 0 ? 'r1q3later' : 'r1q3earlier')}`} ${ctx.t('r1q3i')} ${rpI(left)} ${ctx.t('r1q3j')}</p>
        ${ch(D.q2, [{ values: D.present, color: RPTC.present }, { values: D.q2, color: RPTC.revised }])}${caps}`;
    }
    pg.push(rpPage(q3 + rpFoot(ctx, ++n)));
    /* question 4: the reroute */
    const red = D.reduction;
    let q4 = `${ctx.t('r1q4H', { tag: 'h2' })}<div class="rule"></div>${ctx.t('r1q4Q', { tag: 'p', cls: 'q' })}
      <p class="big">${retired ? `${ctx.t('r1q4ar')} ${rpM(D.Wl)} ${ctx.t('r1q4br')} ${rpI(D.le)}.` : `${ctx.t('r1q4a')} ${rpM(D.Wl)} ${ctx.t('r1q4b')} ${rpI(G.clientRetireAge)} ${ctx.t('r1q4c')} ${rpI(D.le)}.`}</p>`;
    if (red > -999) q4 += `<p>${red >= 0 ? `${ctx.t('r1q4Red')} ${rpN(Math.abs(red))}% ${ctx.t('r1q4RedB')}` : `${ctx.t('r1q4Inc')} ${rpN(Math.abs(red))}% ${ctx.t('r1q4IncB')}`}</p>`;
    if (!retired) q4 += `<p>${ctx.t('r1q4Pv')} ${rpM(D.WlPV)} ${ctx.t('r1q4PvB')}</p>`;
    q4 += ch(D.q3, [{ values: D.present, color: RPTC.present }, { values: D.q3, color: RPTC.revised }]) + caps + rpFoot(ctx, ++n);
    pg.push(rpPage(q4));
    /* summary */
    const sum = D.extra > 0
      ? `${ctx.t('r1s1', { tag: 'p' })}${ctx.t('r1s2', { tag: 'p' })}${ctx.t('r1s3', { tag: 'p' })}${ctx.t('r1s4', { tag: 'p' })}${ctx.t('r1s5', { tag: 'p' })}${ctx.t('r1s6', { tag: 'p' })}<div class="em">${ctx.t('r1sEm')}</div>${ctx.t('r1s7', { tag: 'p' })}`
      : `${ctx.t('r1o1', { tag: 'p' })}${ctx.t('r1o2', { tag: 'p' })}${ctx.t('r1o3', { tag: 'p' })}<div class="em">${ctx.t('r1sEm')}</div>${ctx.t('r1o4', { tag: 'p' })}${ctx.t('r1o5', { tag: 'p' })}`;
    pg.push(rpPage(`${ctx.t('r1sH', { tag: 'h2' })}<div class="rule"></div>${sum}${rpFoot(ctx, ++n)}`));
    pg.push(rpPage(`${ctx.t('rpSupH', { tag: 'h2' })}<div class="rule"></div>${ctx.t('rpSupLead', { tag: 'p' })}
      ${peopleBlock(ctx, G, D.base, sc, 'results')}${planTables(ctx, G, sc, 'results')}${rpFoot(ctx, ++n)}`));
    const sheet = {
      heading: ctx.t('r1Title'), size: 'full', file: ctx.text('r1File') + ' - ' + who,
      columns: [{ field: 'age', header: ctx.t('wAge'), type: 'age' }, { field: 'p', header: ctx.t('rsPresent'), type: 'money' }, { field: 'q1', header: ctx.t('lv1'), type: 'money' },
        { field: 'q2', header: ctx.t('lv2'), type: 'money' }, { field: 'q3', header: ctx.t(retired ? 'rsLasts' : 'lv3'), type: 'money' }, { field: 'q4', header: ctx.t('lv4'), type: 'money' }],
      rows: D.ages.map((age, i) => ({ age, p: D.present[i], q1: D.q1[i], q2: D.ideal[i], q3: (retired ? D.q2ret : D.q2)[i], q4: D.q3[i] })),
      disclosures: ['hypothetical', 'license']
    };
    openReport(ctx, { title: ctx.t('r1Title'), titleText: ctx.text('r1Title'), file: ctx.text('r1File') + ' - ' + who, pages: pg.join(''), sheet });
  }

  /* ---------- R2: the financial fact check ---------- */
  function reportFactCheck(ctx, G, sc, who, RA) {
    const r0 = RA.rows[0];
    const kids = (G.children || []).filter((c) => (c.name || '').trim() || c.age != null);
    let kidsHTML = '';
    if (kids.length) {
      const pairs = [];
      for (let i = 0; i < kids.length; i += 2) pairs.push(kids.slice(i, i + 2));
      kidsHTML = `<table class="rt"><caption>${ctx.text('rtKids')}</caption><thead><tr><th>${ctx.t('kidName')}</th><th class="c">${ctx.t('kidAge')}</th><th>${ctx.t('kidName')}</th><th class="c">${ctx.t('kidAge')}</th></tr></thead><tbody>${pairs.map((p) => `<tr><td>${EFA.util.esc(p[0].name || '')}</td><td class="c">${rpI(p[0].age)}</td><td>${p[1] ? EFA.util.esc(p[1].name || '') : ''}</td><td class="c">${p[1] ? rpI(p[1].age) : ''}</td></tr>`).join('')}</tbody></table>`;
    }
    const fs = ctx.text({ single: 'fsSingle', mfj: 'fsMfj', mfs: 'fsMfs', hoh: 'fsHoh' }[G.filingStatus] || 'fsMfj');
    const assume = rtTable(ctx, { key: 'rtAssume', tone: 'navy', cols: [['rtInfl', 'r'], [G.autoTaxRate ? 'filing' : 'rtTaxes'], [G.autoTaxRate ? 'deductions' : 'cgTax', 'r'], ['rtDesired', 'r'], ['rtLegacy', 'r']],
      rows: [[rpP(G.inflationRate), G.autoTaxRate ? EFA.util.esc(fs) : `${ctx.text('rtAccum')} ${F.pct(G.taxAccumulation, 2)} / ${ctx.text('rtDist')} ${F.pct(G.taxDistribution, 2)}`,
        G.autoTaxRate ? (G.itemize ? rpM(G.deductions) : ctx.t('rtStd')) : rpP(G.taxCapGains), rpM(RA.T0), rpM(G.desiredLegacy)]] });
    const op = [['rtOpInfl', cget('gps_opinion_inflation', null)], ['rtOpRet', cget('gps_opinion_returns', null)], ['rtOpTax', cget('gps_opinion_taxes', null)],
      ['rtBenRev', cget('gps_beneficiary_review', null)], ['rtEstRev', cget('gps_estate_plan', false) ? cget('gps_estate_review', null) : null]].filter(([, v]) => v != null && v !== '');
    const opHTML = op.length ? rtTable(ctx, { key: 'rtOpin', tone: 'steel', cols: op.map(([k]) => [k]), rows: [op.map(([, v]) => EFA.util.esc(String(v)))] }) : '';
    const sumCols = [['rtAssets', 'r'], ['rtLiab', 'r'], ['rtNW', 'r'], ['rtLiq', 'r'], ['rtDbProt', 'r'], ['rtLasts', 'c']];
    const sumRow = [rpM(r0.assets), rpM(r0.liab), rpM(r0.nw), rpM(r0.liquidity), rpM(r0.db), rpI(RA.moneyLasts)];
    const pages = rpPage(`${ctx.t('r2Title', { tag: 'h1' })}<p class="who" style="font:600 22px/1.2 'Cormorant Garamond',Georgia,serif;margin:0 0 6px">${EFA.util.esc(who)}</p><div class="rule"></div>
      ${ctx.t('r2Lead', { tag: 'p' })}${peopleBlock(ctx, G, RA, sc, 'fact')}${kidsHTML}${assume}${opHTML}
      ${rtTable(ctx, { key: 'r2SumH', tone: 'gold', cols: sumCols, rows: [sumRow] })}
      ${planTables(ctx, G, sc, 'fact')}${rpFoot(ctx, 1)}`);
    const sheet = { heading: ctx.t('r2SumH'), size: 'medium', filter: false, file: ctx.text('r2File') + ' - ' + who,
      columns: sumCols.map(([k], i) => ({ field: 'c' + i, header: ctx.t(k), type: i === 5 ? 'age' : 'money' })),
      rows: [{ c0: r0.assets, c1: r0.liab, c2: r0.nw, c3: r0.liquidity, c4: r0.db, c5: RA.moneyLasts }], disclosures: ['hypothetical', 'license'] };
    openReport(ctx, { title: ctx.t('r2Title'), titleText: ctx.text('r2Title'), file: ctx.text('r2File') + ' - ' + who, pages, sheet });
  }

  /* ---------- R3: the retirement roadmap ---------- */
  function reportRoadmap(ctx, G, sc, who, RA, K) {
    const to = GPS.projectTo(G), a0 = RA.a0, last = Math.max(0, Math.min(RA.Y - 1, to - a0));
    const rows = RA.find.slice(0, last + 1);
    const cats = rows.map((f) => String(f.age));
    const ids = RA.find.length ? Object.keys(RA.find[0].per || {}) : [];
    const tone = [P.navy3, P.gold, P.navy4, P.goldLt, P.steel, P.goldDeep, P.navy2, P.mist2];
    const series = ids.map((id, i) => ({ label: (RA.find[0].per[id] || {}).name || '', color: tone[i % tone.length], values: rows.map((f) => (f.per[id] || {}).wd || 0) }))
      .filter((s) => s.values.some((v) => Math.abs(v) > 0.5));
    const lines = [{ label: ctx.text('r3lTax'), color: RPTC.line5, values: rows.map((f) => f.taxes) }, { label: ctx.text('r3lItem'), color: P.steel, values: rows.map((f) => f.item) },
      { label: ctx.text('r3lDes'), color: RPTC.present, values: rows.map((f) => f.desired), dash: '8 6' }, { label: ctx.text('r3lAct'), color: RPTC.revised, values: rows.map((f) => f.actual) }]
      .filter((L) => L.values.some((v) => Math.abs(v) > 0.5));
    const mileIdx = [0];
    for (let r = 10; r < last; r += 10) mileIdx.push(r);
    if (last > 0) mileIdx.push(last);
    const mcols = [['mYear', 'c'], ['wAge', 'c'], ['rtAssets', 'r'], ['rtLiab', 'r'], ['rtNW', 'r'], ['mEstate', 'r'], ['mSpendC', 'r'], ['mLifeC', 'r']];
    const mrows = mileIdx.map((r) => { const s = RA.rows[r], f = RA.find[r];
      return [rpI(r + 1), `<span class="num">${f.age}${RA.sp ? '/' + f.sage : ''}</span>`, rpM(s.assets), rpM(s.liab), rpM(s.nw), rpM(s.estate), rpM(s.spendC), rpM(f.lifeC)]; });
    const wrap = hasWrapUp(sc) ? `<div class="wu">${renderBlocks(sc.wrapUp)}</div>` : generatedWrapUp(ctx, G, RA, K);
    const pages = rpCover(ctx, { titleKey: 'r3Title', subKey: 'r3Sub', who })
      + rpPage(`${ctx.t('r3ExecH', { tag: 'h2' })}<div class="rule"></div>${ctx.t('r3Exec', { tag: 'p' })}
        ${ctx.t('r3ChartH', { tag: 'h3' })}${rptStack(ctx, { cats, series, lines, w: 1000, h: 450 })}${ctx.t('r3ChartCap', { tag: 'p', cls: 'cap' })}${rpFoot(ctx, 2)}`)
      + rpPage(`${ctx.t('r3MileH', { tag: 'h2' })}<div class="rule"></div>${rtTable(ctx, { key: '', tone: 'navy', cols: mcols, rows: mrows })}
        ${ctx.t('r3WrapH', { tag: 'h3' })}${wrap}${rpFoot(ctx, 3)}`)
      + rpPage(`${ctx.t('rpSupH', { tag: 'h2' })}<div class="rule"></div>${ctx.t('rpSupLead', { tag: 'p' })}
        ${peopleBlock(ctx, G, RA, sc, 'results')}${planTables(ctx, G, sc, 'results')}${rpFoot(ctx, 4)}`);
    const sheet = { heading: ctx.t('r3MileH'), size: 'full', filter: false, file: ctx.text('r3File') + ' - ' + who,
      columns: [{ field: 'y', header: ctx.t('mYear'), type: 'int' }, { field: 'age', header: ctx.t('wAge'), type: 'text', align: 'center' },
        { field: 'as', header: ctx.t('rtAssets'), type: 'money' }, { field: 'li', header: ctx.t('rtLiab'), type: 'money' }, { field: 'nw', header: ctx.t('rtNW'), type: 'money' },
        { field: 'es', header: ctx.t('mEstate'), type: 'money' }, { field: 'sp', header: ctx.t('mSpendC'), type: 'money' }, { field: 'lf', header: ctx.t('mLifeC'), type: 'money' }],
      rows: mileIdx.map((r) => { const s = RA.rows[r], f = RA.find[r]; return { y: r + 1, age: RA.sp ? `${f.age}/${f.sage}` : String(f.age), as: s.assets, li: s.liab, nw: s.nw, es: s.estate, sp: s.spendC, lf: f.lifeC }; }),
      disclosures: ['hypothetical', 'license'] };
    openReport(ctx, { title: ctx.t('r3Title'), titleText: ctx.text('r3Title'), file: ctx.text('r3File') + ' - ' + who, pages, sheet });
  }
  /** the generated wrap-up (C9 R3) when the scenario has no custom content */
  function generatedWrapUp(ctx, G, RA, K) {
    const to = GPS.projectTo(G);
    const b = [];
    b.push(`${ctx.t('r3b1')} ${rpP(K.retShown)}${K.points ? `, ${ctx.t(K.points > 0 ? 'r3b1u' : 'r3b1d')} ${rpN(Math.abs(K.points * 100))} ${ctx.t('r3b1e')}` : ''}`);
    b.push(K.saveNotice ? `${ctx.t('r3b2c')} ${rpM(K.S)} ${ctx.t('r3b2b')} (${K.saveNotice})` : `${ctx.t('r3b2a')} ${rpM(K.S)} ${ctx.t('r3b2b')}`);
    const dR = K.R - G.clientRetireAge;
    b.push(`${ctx.t('r3b3a')} ${rpI(K.R)}${dR ? `, ${ctx.t('r3b3b')} ${rpI(Math.abs(dR))} ${ctx.t(dR > 0 ? 'r3b3later' : 'r3b3earlier')}` : ''}`);
    b.push(K.lifeNotice ? `${ctx.t('r3b4c')} ${rpM(K.W)} ${ctx.t('r3b4b')} (${K.lifeNotice})` : `${ctx.t('r3b4a')} ${rpM(K.W)} ${ctx.t('r3b4b')}, ${rpM(K.WPV)} ${ctx.t('r3b4d')}`);
    return `<p>${ctx.t('r3w1')} ${rpM(RA.T0)} ${ctx.t('r3w2')}${K.cola ? ' ' + ctx.text('r3w2b') : ''} ${ctx.t('r3w3')} ${rpI(to)}${ctx.t('r3w4')}</p><ul>${b.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  }

  /* ---------- the roadmap wrap-up: structured blocks, printed by the report and edited in the rich-text editor ---------- */
  const WSTY = [['p', 'stP'], ['h1', 'stH1'], ['h2', 'stH2'], ['h3', 'stH3'], ['cover', 'stCover'], ['title', 'stTitle'], ['sub', 'stSub'], ['basic', 'stBasic']];
  const WSIZE = [11, 12.5, 15, 17, 21, 26, 34];
  const hasWrapUp = (sc) => {
    const b = sc && sc.wrapUp;
    if (!Array.isArray(b) || !b.length) return false;
    if (b.length > 1) return true;
    return (b[0].runs || []).map((r) => r.t || '').join('').trim() !== '';
  };
  const wStyleTag = (s) => (s === 'h1' || s === 'h2' || s === 'h3' ? s : 'p');
  const wStyleCls = (s) => (s === 'cover' ? 'st-cover' : s === 'title' ? 'st-title' : s === 'sub' ? 'st-sub' : s === 'basic' ? 'st-basic' : '');
  function runHTML(r) {
    const st = [];
    if (r.color) st.push('color:' + r.color);
    if (r.bg) st.push('background-color:' + r.bg);
    if (r.size) st.push('font-size:' + WSIZE[Math.max(1, Math.min(7, r.size)) - 1] + 'px');
    else if (r.sizePx) st.push('font-size:' + r.sizePx);
    let h = EFA.util.esc(r.t == null ? '' : r.t).replace(/\n/g, '<br>');
    if (r.b) h = `<b>${h}</b>`;
    if (r.i) h = `<i>${h}</i>`;
    if (r.u) h = `<u>${h}</u>`;
    if (r.href) h = `<a href="${EFA.util.esc(r.href)}"${r.title ? ` title="${EFA.util.esc(r.title)}"` : ''}>${h}</a>`;
    return st.length ? `<span style="${st.join(';')}">${h}</span>` : h;
  }
  /** blocks -> report HTML (consecutive list blocks are grouped) */
  function renderBlocks(blocks, forEditor) {
    const out = [];
    let openList = null;
    const inner = (b) => (b.runs || []).map(runHTML).join('') || (forEditor ? '<br>' : '&nbsp;');
    const attrs = (b) => {
      const cls = [wStyleCls(b.style)];
      if (b.indent) cls.push('in' + b.indent);
      const st = b.align ? ` style="text-align:${b.align}"` : '';
      return `${cls.filter(Boolean).length ? ` class="${cls.filter(Boolean).join(' ')}"` : ''}${forEditor ? ` data-st="${b.style || 'p'}"` : ''}${st}`;
    };
    (blocks || []).forEach((b) => {
      if (b.list) {
        if (openList !== b.list) { if (openList) out.push(`</${openList}>`); out.push(`<${b.list}>`); openList = b.list; }
        out.push(`<li${attrs(b)}>${inner(b)}</li>`);
        return;
      }
      if (openList) { out.push(`</${openList}>`); openList = null; }
      const tag = forEditor ? 'div' : wStyleTag(b.style);
      out.push(`<${tag}${attrs(b)}>${inner(b)}</${tag}>`);
    });
    if (openList) out.push(`</${openList}>`);
    return out.join('');
  }
  /** one editable block element -> {style, align, indent, list, runs} */
  function blockRuns(block) {
    const runs = [], w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = w.nextNode())) {
      const t = node.nodeValue;
      if (t == null || t === '') continue;
      const r = { t };
      let p = node.parentNode;
      while (p && p !== block) {
        const tg = p.tagName;
        if (tg === 'B' || tg === 'STRONG') r.b = 1;
        if (tg === 'I' || tg === 'EM') r.i = 1;
        if (tg === 'U') r.u = 1;
        if (tg === 'A' && p.getAttribute('href')) { if (!r.href) r.href = p.getAttribute('href'); if (!r.title && p.getAttribute('title')) r.title = p.getAttribute('title'); }
        if (tg === 'FONT') {
          const c = p.getAttribute('color'), s = p.getAttribute('size');
          if (c && !r.color) r.color = c;
          if (s && !r.size) r.size = +s;
        }
        if (p.style) {
          if (p.style.color && !r.color) r.color = p.style.color;
          if (p.style.backgroundColor && !r.bg) r.bg = p.style.backgroundColor;
          if (p.style.fontWeight === 'bold' || +p.style.fontWeight >= 600) r.b = 1;
          if (p.style.fontStyle === 'italic') r.i = 1;
          if ((p.style.textDecoration || '').indexOf('underline') >= 0) r.u = 1;
          if (p.style.fontSize && !r.size && !r.sizePx) r.sizePx = p.style.fontSize;
        }
        p = p.parentNode;
      }
      runs.push(r);
    }
    if (!runs.length) runs.push({ t: '' });
    return { style: block.dataset && block.dataset.st ? block.dataset.st : 'p', align: block.style.textAlign || '', indent: block.classList.contains('in2') ? 2 : block.classList.contains('in1') ? 1 : 0, runs };
  }
  function parseBlocks(root) {
    const out = [];
    const walk = (el, listType) => {
      const tag = el.tagName;
      if (tag === 'UL' || tag === 'OL') { Array.from(el.children).forEach((li) => walk(li, tag === 'UL' ? 'ul' : 'ol')); return; }
      const nested = Array.from(el.children || []).filter((c) => c.tagName === 'UL' || c.tagName === 'OL');
      if (nested.length) {
        /* a list the browser nested inside its host block: the host's own text is one block, then the list */
        const copy = el.cloneNode(true);
        Array.from(copy.children).forEach((c) => { if (c.tagName === 'UL' || c.tagName === 'OL') c.remove(); });
        if ((copy.textContent || '').trim()) { const b = blockRuns(copy); if (listType) b.list = listType; out.push(b); }
        nested.forEach((c) => walk(c));
        return;
      }
      const b = blockRuns(el);
      if (listType) b.list = listType;
      out.push(b);
    };
    Array.from(root.children).forEach((el) => walk(el));
    return out.length ? out : [{ style: 'p', runs: [{ t: '' }] }];
  }
  const RTEC = [['#0d1e3a', 'navy'], ['#b8972e', 'gold'], ['#8a6e22', 'goldDeep'], ['#2f8a52', 'green'], ['#b3402e', 'red'], ['#667389', 'muted'], ['#ffffff', 'white']];
  /** app-rpt-editor: the rich-text editor for the roadmap wrap-up (modal, no x) */
  function openWrapEditor(ctx, sc, then) {
    const blocks = hasWrapUp(sc) ? JSON.parse(JSON.stringify(sc.wrapUp)) : [{ style: 'p', runs: [{ t: '' }] }];
    const bt = (k, html, cls) => `<button type="button" class="tbb ${cls || ''}" data-cmd="${k}" title="">${html}</button>`;
    const sw = (c, kind) => `<button type="button" class="sw" data-sw="${kind}" data-c="${c}" style="background:${c}" title=""></button>`;
    const ov = gdlg(ctx, {
      title: ctx.t('rteTitle'), w: 1120, body: `<div class="b06-rte">
        <div class="tb">
          <div class="gp">${bt('bold', '<b>B</b>')}${bt('italic', '<i>I</i>')}${bt('underline', '<u>U</u>')}${bt('link', '&#128279;')}${bt('unlink', '&#8856;')}</div>
          <div class="sp"></div><div class="gp" data-g="fg">${RTEC.map(([c]) => sw(c, 'fore')).join('')}</div>
          <div class="sp"></div><div class="gp" data-g="bg">${RTEC.map(([c]) => sw(c, 'back')).join('')}</div>
          <div class="sp"></div><div class="gp"><select class="styl" title="">${WSTY.map(([v, k]) => `<option value="${v}">${EFA.util.esc(ctx.text(k))}</option>`).join('')}</select>
            <select class="size" title="">${['szXxs', 'szXs', 'szS', 'szM', 'szL', 'szXl', 'szXxl'].map((k, i) => `<option value="${i + 1}" ${i === 2 ? 'selected' : ''}>${EFA.util.esc(ctx.text(k))}</option>`).join('')}</select>
            <select class="ind" title="">${['inNone', 'in1', 'in2'].map((k, i) => `<option value="${i}">${EFA.util.esc(ctx.text(k))}</option>`).join('')}</select></div>
          <div class="sp"></div><div class="gp">${bt('left', '&#8676;')}${bt('center', '&#8596;')}${bt('right', '&#8677;')}</div>
          <div class="sp"></div><div class="gp">${bt('undo', '&#8630;')}${bt('redo', '&#8631;')}</div>
          <div class="sp"></div><div class="gp">${bt('ul', '&bull;&nbsp;&equiv;')}${bt('ol', '1.&nbsp;&equiv;')}</div>
        </div>
        <div class="lk" hidden>${fld(ctx, { href: '', title: '' }, 'href', 'rteAddr', 'text')}${fld(ctx, { href: '', title: '' }, 'title', 'rteLinkT', 'text')}<button type="button" class="st-pill ghost lkgo">${ctx.t('rteIns')}</button></div>
        <div class="ed" contenteditable="true" spellcheck="true">${renderBlocks(blocks, true)}</div>
        ${ctx.t('rteNote', { tag: 'p', cls: 'b06-note' })}</div>`,
      foot: `<span></span><div class="grp"><button type="button" class="st-pill ghost cx">${ctx.t('cancel')}</button><button type="button" class="st-pill sv">${ctx.t('rteApply')}</button></div>`
    });
    ov.querySelector('.st-overlay-x').style.display = 'none';
    const ed = ov.querySelector('.ed'), tb = ov.querySelector('.tb'), lk = ov.querySelector('.lk');
    const lkv = { href: '', title: '' };
    bindForm(ctx, lk, lkv);
    try { document.execCommand('defaultParagraphSeparator', false, 'div'); } catch (e) { /* older engines */ }
    ed.addEventListener('keydown', (e) => e.stopPropagation());
    const tip = (sel, key) => { const n = ov.querySelector(sel); if (n) n.setAttribute('title', ctx.text(key)); };
    [['[data-cmd="bold"]', 'rteB'], ['[data-cmd="italic"]', 'rteI'], ['[data-cmd="underline"]', 'rteU'], ['[data-cmd="link"]', 'rteLink'], ['[data-cmd="unlink"]', 'rteUnlink'],
      ['[data-cmd="left"]', 'rteAlL'], ['[data-cmd="center"]', 'rteAlC'], ['[data-cmd="right"]', 'rteAlR'], ['[data-cmd="undo"]', 'rteUndo'], ['[data-cmd="redo"]', 'rteRedo'],
      ['[data-cmd="ul"]', 'rteUl'], ['[data-cmd="ol"]', 'rteOl'], ['.styl', 'rteStyle'], ['.size', 'rteSize'], ['.ind', 'rteIndent']].forEach(([s, k]) => tip(s, k));
    ov.querySelectorAll('[data-g="fg"] .sw').forEach((b) => b.setAttribute('title', ctx.text('rteColor')));
    ov.querySelectorAll('[data-g="bg"] .sw').forEach((b) => b.setAttribute('title', ctx.text('rteBg')));
    /* keep the caret while a toolbar control is used */
    tb.addEventListener('mousedown', (e) => { if (e.target.closest('select')) return; e.preventDefault(); });
    const blocksIn = () => {
      const all = [];
      Array.from(ed.children).forEach((el) => { if (el.tagName === 'UL' || el.tagName === 'OL') Array.from(el.children).forEach((li) => all.push(li)); else all.push(el); });
      const s = window.getSelection();
      if (!s || !s.rangeCount || !ed.contains(s.anchorNode)) return all.slice(0, 1);
      const r = s.getRangeAt(0);
      const hit = all.filter((el) => { try { return r.intersectsNode(el); } catch (e) { return false; } });
      return hit.length ? hit : all.slice(0, 1);
    };
    const cmd = (c, v) => { try { document.execCommand(c, false, v); } catch (e) { /* unsupported */ } };
    tb.addEventListener('click', (e) => {
      if (EFA.edit && EFA.edit.on) return;
      const b = e.target.closest('[data-cmd]');
      if (b) {
        const k = b.dataset.cmd;
        if (k === 'link') { lk.hidden = !lk.hidden; return; }
        if (k === 'unlink') return cmd('unlink');
        if (k === 'ul') return cmd('insertUnorderedList');
        if (k === 'ol') return cmd('insertOrderedList');
        if (k === 'left' || k === 'center' || k === 'right') { blocksIn().forEach((el) => { el.style.textAlign = k === 'left' ? '' : k; }); return; }
        return cmd(k);
      }
      const s = e.target.closest('[data-sw]');
      if (s) cmd(s.dataset.sw === 'fore' ? 'foreColor' : 'backColor', s.dataset.c);
    });
    ov.querySelector('.lkgo').addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      const href = String(lkv.href || '').trim();
      if (!href) { lk.hidden = true; return; }
      cmd('createLink', href);
      if (lkv.title) ed.querySelectorAll(`a[href="${href.replace(/"/g, '')}"]`).forEach((a) => a.setAttribute('title', lkv.title));
      lk.hidden = true;
    });
    ov.querySelector('.styl').addEventListener('change', (e) => { const v = e.target.value; blocksIn().forEach((el) => { el.dataset.st = v; el.className = (el.className.replace(/st-\S+/g, '').trim() + ' ' + wStyleCls(v)).trim(); }); });
    ov.querySelector('.size').addEventListener('change', (e) => cmd('fontSize', e.target.value));
    ov.querySelector('.ind').addEventListener('change', (e) => { const v = +e.target.value; blocksIn().forEach((el) => { el.classList.remove('in1', 'in2'); if (v) el.classList.add('in' + v); }); });
    ov.querySelector('.cx').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) ov.close(); });
    ov.querySelector('.sv').addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      const out = parseBlocks(ed);
      const s2 = GX.get(sc.id);
      if (s2) { s2.wrapUp = out; GX.put(s2); }
      ov.close();
      if (then) then();
    });
    return ov;
  }

  EFA.css('b06rpt3', `
  .b06-rte .ed div, .b06-rte .ed li { margin: 0 0 10px; }
  .b06-rte .ed .in1 { padding-left: 26px; } .b06-rte .ed .in2 { padding-left: 52px; }
  .b06-rte .ed .st-cover { font-family: "Cormorant Garamond", Georgia, serif; font-size: 36px; line-height: 1.1; }
  .b06-rte .ed .st-title { font-family: "Cormorant Garamond", Georgia, serif; font-size: 27px; line-height: 1.15; }
  .b06-rte .ed .st-sub { font-family: "Cormorant Garamond", Georgia, serif; font-size: 20px; color: #2b4c80; }
  .b06-rte .ed .st-basic { font-size: 14px; }
  .b06-rte .ed [data-st="h1"] { font-family: "Cormorant Garamond", Georgia, serif; font-size: 34px; line-height: 1.1; }
  .b06-rte .ed [data-st="h2"] { font-family: "Cormorant Garamond", Georgia, serif; font-size: 26px; line-height: 1.15; }
  .b06-rte .ed [data-st="h3"] { font-family: "Cormorant Garamond", Georgia, serif; font-size: 20px; line-height: 1.2; }
  .b06-pst { display: grid; gap: 12px; }
  .b06-pst textarea { width: 100%; box-sizing: border-box; height: 180px; border: 1.5px solid #cbd5e3; border-radius: 10px; padding: 10px 12px; font: 600 15px/1.45 "DM Sans", sans-serif; color: #0d1e3a; resize: vertical; }
  `);

  /* ---------- advanced per-account actions (schedule changes the engine applies in list order) ---------- */
  const ACTM = {
    taxable: ['contribution', 'withdrawal', 'fee', 'ror'], tdbt: ['contribution', 'withdrawal', 'fee', 'ror'], tdat: ['contribution', 'withdrawal', 'fee', 'ror'],
    taxfree: ['contribution', 'withdrawal', 'fee', 'ror'], annuity: ['contribution', 'withdrawal', 'ror'], income: ['inflow'], loan: ['creditLine', 'draw', 'paydown']
  };
  const actIsRate = (m) => m === 'ror' || m === 'fee';
  const actHasMod = (m) => m === 'contribution' || m === 'withdrawal' || m === 'inflow';
  /** one line of plain description under an action's name */
  function actSummary(ctx, ac) {
    const bits = [];
    if (actIsRate(ac.mode)) bits.push(ctx.text('actRate') + ' ' + F.pct(ac.rate || 0, 2));
    else if (Array.isArray(ac.amounts) && ac.amounts.length) bits.push(ctx.text('actMulti'));
    else {
      bits.push(F.money(ac.amount || 0));
      if (ac.growth) bits.push(ctx.text('actGrow') + ' ' + F.pct(ac.growth, 2));
    }
    bits.push(ctx.text('actStart') + ' ' + F.int(ac.startAge || 0));
    bits.push(F.int(ac.years || 1) + ' ' + ctx.text('actYears'));
    if (actHasMod(ac.mode)) bits.push(ctx.text({ add: 'mdAdd', subtract: 'mdSub' }[ac.modifier] || 'mdSet'));
    return EFA.util.esc(bits.join(' · '));
  }
  function actionsHTML(ctx, rec) {
    const list = rec.actions || [];
    return `<div class="b06-fg" style="--c:1"><span class="l" style="font:700 11px/1 'DM Sans',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8a6e22">${ctx.t('actHead')}</span></div>
      <div class="b06-acts">${list.length ? list.map((ac, i) => `<div class="row"><span class="g">${ctx.t('ac_' + ac.mode)}${ac.description ? ' <span class="s">' + EFA.util.esc(ac.description) + '</span>' : ''}<br><span class="s">${actSummary(ctx, ac)}</span></span>
        <button type="button" class="b06-mag" data-aup="${i}" ${i ? '' : 'disabled'}>&uarr;</button><button type="button" class="b06-mag" data-adn="${i}" ${i === list.length - 1 ? 'disabled' : ''}>&darr;</button>
        <button type="button" class="b06-mag" data-aed="${i}">${IC.pencil}</button><button type="button" class="b06-mag" data-adl="${i}">&times;</button></div>`).join('') : `<div class="none">${ctx.t('actNone')}</div>`}</div>
      <div class="b06-fg" style="--c:1"><div style="position:relative;justify-self:start"><button type="button" class="st-pill ghost aadd">${ctx.t('actAdd')} ${IC.up}</button>
        <div class="b06-menu amenu" hidden>${(ACTM[rec.type] || []).map((m) => `<button type="button" data-amode="${m}">${ctx.t('ac_' + m)}</button>`).join('')}</div></div></div>`;
  }
  /** the action input wizard */
  function openAction(ctx, G, rec, ac, isNew, then) {
    const a = Object.assign({ mode: 'contribution', amount: 0, amounts: null, growth: 0, rate: 0, startAge: ownerAge(G, rec), years: 1, modifier: 'set', description: '' }, JSON.parse(JSON.stringify(ac || {})));
    const st = { multi: Array.isArray(a.amounts) && a.amounts.length > 0, text: (a.amounts || []).join('\n') };
    const ov = gdlg(ctx, {
      title: `<span>${ctx.t(isNew ? 'addNew' : 'edit')} ${ctx.t('ac_' + a.mode)}</span>`, w: 720, body: '<div class="ab"></div>',
      foot: `<span></span><div class="grp"><button type="button" class="st-pill ghost cx">${ctx.t('cancel')}</button><button type="button" class="st-pill sv">${ctx.t('save')}</button></div>`
    });
    const host = ov.querySelector('.ab');
    const draw = () => {
      const rate = actIsRate(a.mode);
      host.innerHTML = `<div style="display:grid;gap:14px">
        <div class="b06-fg" style="--c:3">${rate ? fld(ctx, a, 'rate', 'actRate', 'pct') : (st.multi ? '' : fld(ctx, a, 'amount', 'actAmount', 'money') + fld(ctx, a, 'growth', 'actGrow', 'pct'))}
          ${fld(ctx, a, 'startAge', 'actStart', 'int', { min: 0, max: 100 })}${fld(ctx, a, 'years', 'actYears', 'int', { min: 1, max: 80 })}</div>
        ${rate ? '' : swf(ctx, st, 'multi', 'actMulti')}
        ${!rate && st.multi ? `<label class="b06-f"><span class="l">${ctx.t('actPaste')}</span><textarea class="amv" style="width:100%;box-sizing:border-box;height:140px;border:1.5px solid #cbd5e3;border-radius:10px;padding:9px 11px;font:600 15px/1.4 'DM Sans',sans-serif;color:#0d1e3a">${EFA.util.esc(st.text)}</textarea></label>` : ''}
        ${actHasMod(a.mode) ? segf(ctx, a, 'modifier', 'actMod', [['set', 'mdSet'], ['add', 'mdAdd'], ['subtract', 'mdSub']]) : ''}
        <div class="b06-fg" style="--c:1">${fld(ctx, a, 'description', 'actDesc', 'text')}</div></div>`;
      const inner = host.firstElementChild;
      bindForm(ctx, inner, a);
      bindForm(ctx, inner, st, () => draw());
      const ta = inner.querySelector('.amv');
      if (ta) { ta.addEventListener('keydown', (e) => e.stopPropagation()); ta.addEventListener('blur', () => { st.text = ta.value; }); }
      EFA.numify(host); if (EFA.edit && EFA.edit.on) EFA.edit.arm(host);
    };
    draw();
    ov.querySelector('.cx').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) ov.close(); });
    ov.querySelector('.sv').addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      const ta = host.querySelector('.amv');
      if (ta) st.text = ta.value;
      if (document.activeElement && host.contains(document.activeElement)) document.activeElement.blur();
      a.amounts = st.multi && !actIsRate(a.mode) ? String(st.text || '').split(/[\r\n,;\t]+/).map((s) => F.parse(s)).filter((v) => isFinite(v)) : null;
      if (a.amounts && !a.amounts.length) a.amounts = null;
      if (a.amounts) a.years = Math.max(a.years || 1, a.amounts.length);
      ov.close(); then(a);
    });
    return ov;
  }

  /* ---------- the illustration grid's copy and paste helper ---------- */
  /** onApply(values, mode, zeroRest): paste a column of numbers from the selected row down */
  function openPaste(ctx, onApply) {
    const st = { mode: 'set', zero: false, text: '' };
    const ov = gdlg(ctx, {
      title: ctx.t('pasteHead'), w: 640,
      body: `<div class="b06-pst">${ctx.t('pasteBody', { tag: 'p', attrs: 'style="margin:0"' })}<textarea class="pv"></textarea>
        ${segf(ctx, st, 'mode', 'pasteMode', [['set', 'mdSet'], ['add', 'mdAdd'], ['subtract', 'mdSub']])}${swf(ctx, st, 'zero', 'pasteZero')}</div>`,
      foot: `<span></span><div class="grp"><button type="button" class="st-pill ghost cx">${ctx.t('cancel')}</button><button type="button" class="st-pill sv">${ctx.t('pasteGo')}</button></div>`
    });
    const ta = ov.querySelector('.pv');
    bindForm(ctx, ov.querySelector('.b06-pst'), st);
    ta.addEventListener('keydown', (e) => e.stopPropagation());
    ctx.timeout(() => ta.focus(), 60);
    ov.querySelector('.cx').addEventListener('click', () => { if (!(EFA.edit && EFA.edit.on)) ov.close(); });
    ov.querySelector('.sv').addEventListener('click', () => {
      if (EFA.edit && EFA.edit.on) return;
      const vals = String(ta.value || '').split(/[\r\n,;\t]+/).map((s) => s.replace(/[^0-9.\-]/g, '')).filter((s) => s !== '' && s !== '-' && s !== '.').map((s) => Math.round(parseFloat(s) * 100) / 100).filter((v) => isFinite(v));
      ov.close(); onApply(vals, st.mode, !!st.zero);
    });
    return ov;
  }

  /* ---------- privacy mode (a device setting, on by default) ---------- */
  const PRIVKEY = 'efa.fgps.privacy';
  const privacyOn = () => { try { return EFA.util.LS.get(PRIVKEY, true) !== false; } catch (e) { return true; } };
  const setPrivacy = (v) => { try { EFA.util.LS.set(PRIVKEY, !!v); } catch (e) { /* storage unavailable */ } };

  /* ---------- the scenario hand-offs (C10 neighbours) ---------- */
  /** copy the active scenario to the spending game's hand-off slot (the separate tool is not part of this app) */
  function copyToSpendingGame(sc) {
    if (!sc) return;
    EFA.clients.set('fgps', 'spendingGame', { scenario: JSON.parse(JSON.stringify(sc)), copied: Date.now() });
  }
  /** save the scenario (and the baseline when comparing) to a .fgps file; identifiers are left out while privacy mode is on */
  function saveScenarioFile(ctx, G, list) {
    const dl = (EFA.platform && EFA.platform.downloads) || null;
    if (!dl) { ctx.toast(ctx.text('noFile')); return; }
    const g = JSON.parse(JSON.stringify(G));
    if (privacyOn()) ['mobilePhone', 'altPhone', 'street', 'city', 'state', 'zip', 'email', 'email2', 'clientDOB', 'spouseDOB', 'clientPosition', 'spousePosition', 'clientEmployer', 'spouseEmployer', 'clientWorkPhone', 'spouseWorkPhone', 'creditScore'].forEach((k) => { delete g[k]; });
    if (privacyOn() && Array.isArray(g.children)) g.children = g.children.map((c) => ({ name: c.name, age: c.age }));
    const data = JSON.stringify({ format: 'fgps', version: 1, saved: new Date().toISOString(), globals: g, scenarios: list.map((s) => JSON.parse(JSON.stringify(s))) }, null, 2);
    Promise.resolve().then(() => dl.save({ filename: rpFile(G.contactName || G.clientName || 'scenario') + '.fgps', data }))
      .then(() => ctx.toast(ctx.text('fileOk'))).catch((e) => { if (e && e.code !== 'declined') ctx.toast(ctx.text('noFile')); });
  }

})();
