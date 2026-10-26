/* Secure the Next Generation First (NGF): a partner conversation for investors, the professionals
   who serve them, and the causes they support. Sequence: why builders build, the quiet reserve,
   the cost of having no floor, the Legacy Floor, funding it with a lender, giving boldly, and how
   we partner. Drawings and wording are original. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P;

  EFA.css('ng', `
  .ng-full { position: absolute; inset: 0; width: 1600px; height: 900px; overflow: visible; pointer-events: none; }
  .ng-f { transition: opacity .8s ease, transform .8s ease; }
  .stage .ng-f.is-off { transform: translateY(14px); }
  .stage g.ng-f.is-off, .stage path.ng-f.is-off { transform: translateY(10px); }
  @keyframes ng-draw { from { stroke-dashoffset: var(--l); } to { stroke-dashoffset: 0; } }
  .ng-draw { stroke-dasharray: var(--l); animation: ng-draw 2s cubic-bezier(.45,.05,.2,1) both; }
  @keyframes ng-rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
  .ng-rise { animation: ng-rise 1.1s cubic-bezier(.2,.7,.2,1) both; }

  .ng-hd { position: absolute; left: 110px; top: 60px; width: 1260px; display: grid; gap: 14px; justify-items: start; }
  .ng-hd .st-h1 { font-size: 60px; }
  .ng-sub { margin: 4px 0 0; font: 400 25px/1.45 var(--f-body); color: var(--navy); max-width: 1040px; }
  .ng-line { position: absolute; left: 150px; right: 150px; margin: 0; text-align: center; font: italic 500 40px/1.25 var(--f-display); color: var(--navy); text-wrap: balance; }
  .ng-line.sm { font-size: 34px; }
  .ng-line.gold { color: var(--gold-deep); }
  .ng-src { position: absolute; left: 110px; bottom: 26px; width: 1200px; margin: 0; font: 400 13.5px/1.45 var(--f-body); color: var(--muted); }
  .stage .ng-disc { position: absolute; left: 110px; bottom: 22px; width: 1150px; margin: 0; font-size: 12.5px; line-height: 1.4; }
  .ng-card { position: absolute; box-sizing: border-box; background: var(--paper); border: 1px solid var(--rule); border-radius: 16px; box-shadow: 0 14px 34px rgba(13, 30, 58, .08); }
  .ng-card.gold { border: 2px solid var(--gold); box-shadow: 0 18px 40px rgba(184, 151, 46, .18); }
  .ng-ct { margin: 0; font: 600 31px/1.12 var(--f-display); color: var(--navy); }
  .ng-cb { margin: 0; font: 400 20px/1.5 var(--f-body); color: var(--navy); }
  .ng-c3 .ng-cb { font-size: 21px; }
  .ng-c3.lg .ng-ct { font-size: 34px; }
  .ng-c3.lg .ng-cb { font-size: 22px; }
  .ng-cap { font: 700 14px/1.2 var(--f-body); letter-spacing: .18em; text-transform: uppercase; color: var(--gold-deep); }
  .ng-stat { font: 700 46px/1 var(--f-body); color: var(--gold-deep); letter-spacing: -.01em; }
  .ng-ic svg { width: 64px; height: 64px; display: block; }
  .ng-lab { position: absolute; font: 700 15px/1.25 var(--f-body); letter-spacing: .16em; text-transform: uppercase; color: var(--gold-deep); white-space: nowrap; }

  /* cover and close */
  .ng-navy { position: absolute; inset: 0; background: radial-gradient(120% 95% at 76% 72%, #1d3863 0%, #0d1e3a 52%, #08142a 100%); }
  .ng-cv { position: absolute; left: 110px; top: 178px; width: 800px; display: grid; gap: 24px; }
  .ng-cv .eb { font: 700 15px/1.4 var(--f-body); letter-spacing: .24em; text-transform: uppercase; color: var(--gold-lt); max-width: 640px; }
  .ng-cv h1 { margin: 0; font: 600 94px/1 var(--f-display); color: var(--cream); letter-spacing: -.01em; }
  .ng-cv .rl { width: 96px; height: 3px; background: var(--gold); }
  .ng-cv .ld { margin: 0; font: italic 500 38px/1.3 var(--f-display); color: var(--gold-lt); max-width: 540px; text-wrap: balance; }
  .ng-cv-ft { position: absolute; left: 110px; bottom: 58px; display: grid; gap: 8px; }
  .ng-cv-ft .f { font: 700 15px/1.2 var(--f-body); letter-spacing: .22em; text-transform: uppercase; color: var(--cream); }
  .ng-cv-ft .c { font: 400 16px/1.2 var(--f-body); letter-spacing: .06em; color: rgba(247, 245, 241, .72); }

  /* the question */
  .ng-qw { position: absolute; left: 170px; right: 170px; top: 168px; display: grid; justify-items: center; gap: 28px; text-align: center; }
  .ng-q { margin: 0; font: italic 500 74px/1.1 var(--f-display); color: var(--navy); text-wrap: balance; }
  .ng-trio { position: absolute; left: 170px; right: 170px; top: 516px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 36px; }
  .ng-tc { box-sizing: border-box; background: var(--paper); border: 1px solid var(--rule); border-top: 4px solid var(--gold); border-radius: 14px; padding: 26px 28px 28px; display: grid; gap: 16px; align-content: start; min-height: 168px; box-shadow: 0 12px 30px rgba(13, 30, 58, .07); }
  .ng-tc p { margin: 0; font: 500 24px/1.35 var(--f-body); color: var(--navy); }
  .ng-tc svg { width: 42px; height: 42px; display: block; }
  .ng-hold { position: absolute; left: 170px; right: 170px; top: 752px; margin: 0; text-align: center; font: 400 22px/1.45 var(--f-body); color: var(--muted); }

  /* generations */
  .ng-glab { position: absolute; width: 300px; margin-left: -150px; text-align: center; font: 700 16px/1.3 var(--f-body); letter-spacing: .16em; text-transform: uppercase; color: var(--navy); }
  .ng-glab.gold { color: var(--gold-deep); }

  /* the quiet reserve */
  .ng-col-l { position: absolute; transform: translate(-50%, -50%); text-align: center; font: 700 17px/1.3 var(--f-body); letter-spacing: .14em; text-transform: uppercase; width: 250px; }
  .ng-col-l.pill { width: auto; white-space: nowrap; padding: 9px 14px; border-radius: 10px; background: rgba(255, 253, 248, .94); box-shadow: 0 6px 16px rgba(13, 30, 58, .12); font-size: 15px; }
  .ng-rows { position: absolute; left: 610px; width: 880px; top: 252px; display: grid; gap: 20px; }
  .ng-row { display: grid; grid-template-columns: 52px 1fr; gap: 22px; align-items: center; background: var(--paper); border: 1px solid var(--rule); border-radius: 14px; padding: 20px 26px; min-height: 104px; box-sizing: border-box; box-shadow: 0 10px 26px rgba(13, 30, 58, .06); }
  .ng-row .n { width: 52px; height: 52px; border-radius: 50%; background: var(--gold); color: var(--navy); display: grid; place-items: center; font: 700 22px/1 var(--f-body); }
  .ng-row p { margin: 0; font: 400 24px/1.4 var(--f-body); color: var(--navy); }

  /* mental real estate */
  .ng-wedge { transition: opacity .9s ease, transform 1.1s cubic-bezier(.2,.7,.2,1); transform-box: view-box; transform-origin: 270px 270px; }
  .stage .ng-wedge.is-off { transform: scale(.6) rotate(-20deg); }
  .ng-wl { position: absolute; width: 220px; margin-left: -110px; text-align: center; font: 700 19px/1.3 var(--f-body); color: var(--navy); }
  .ng-wl2 { position: absolute; transform: translate(-50%, -50%); text-align: center; font: 700 16px/1.3 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--cream); width: 220px; }
  .ng-mr { position: absolute; left: 790px; width: 700px; top: 300px; display: grid; gap: 30px; }
  .ng-mr .a { margin: 0; font: 600 48px/1.12 var(--f-display); color: var(--navy); }
  .ng-mr .b { margin: 0; font: 400 27px/1.45 var(--f-body); color: var(--navy); }
  .ng-mr .c { margin: 0; font: italic 500 40px/1.2 var(--f-display); color: var(--gold-deep); }

  /* three cards */
  .ng-c3 { padding: 34px 34px 30px; display: grid; gap: 14px; align-content: start; }
  .ng-c3 .ng-stat { margin-top: 6px; }

  /* story */
  .ng-story { position: absolute; left: 820px; width: 670px; top: 236px; display: grid; gap: 24px; }
  .ng-story .b { margin: 0; font: 400 26px/1.5 var(--f-body); color: var(--navy); }
  .ng-story .s { margin: 0; font: 600 42px/1.16 var(--f-display); color: var(--navy); }
  .ng-story .e { margin: 0; font: italic 500 35px/1.25 var(--f-display); color: var(--gold-deep); }

  /* the floor */
  .ng-slab-t { position: absolute; left: 230px; width: 1000px; top: 616px; display: grid; justify-items: center; gap: 4px; text-align: center; }
  .ng-slab-t .k { font: 700 16px/1.2 var(--f-body); letter-spacing: .3em; text-transform: uppercase; color: var(--navy); }
  .ng-slab-t .v { font: italic 600 32px/1.15 var(--f-display); color: var(--navy); }
  .ng-blk { position: absolute; width: 250px; text-align: center; font: 700 17px/1.3 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--cream); }
  .ng-fc { position: absolute; left: 1226px; top: 384px; width: 270px; display: grid; gap: 8px; }
  .ng-fc .k { margin: 0; font: 600 36px/1.08 var(--f-display); color: var(--navy); }
  .ng-fc .v { margin: 0; font: 400 18px/1.45 var(--f-body); color: var(--muted); }

  /* funding diagram */
  .ng-node { padding: 24px 26px; display: grid; gap: 10px; align-content: start; }
  .ng-node .hdr { display: flex; align-items: center; gap: 14px; }
  .ng-node .hdr svg { width: 46px; height: 46px; flex: none; }
  .ng-node .ng-ct { font-size: 30px; }
  .ng-node .ng-cb { font-size: 19px; }
  .ng-pill { justify-self: start; display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px; border-radius: 999px; background: var(--gold-pale); border: 1px solid var(--gold); font: 700 15px/1.1 var(--f-body); letter-spacing: .1em; text-transform: uppercase; color: var(--navy); }
  .ng-risk { position: absolute; left: 110px; width: 1380px; top: 712px; margin: 0; padding: 4px 0 4px 20px; border-left: 3px solid var(--gold); box-sizing: border-box; font: 400 18px/1.5 var(--f-body); color: var(--navy); }
  .ng-al { position: absolute; font: 700 14px/1.3 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); }

  /* two ways */
  .ng-way { padding: 30px 34px; display: grid; grid-template-rows: auto 1fr auto; gap: 12px; }
  .ng-way .ng-cap { margin-bottom: -4px; }
  .ng-way svg { width: 602px; height: 250px; display: block; }
  .ng-lvl { transition: transform 1.8s cubic-bezier(.45,.05,.2,1); transform-box: fill-box; transform-origin: 50% 100%; }

  /* giving */
  .ng-gb { padding: 20px 24px; display: grid; gap: 6px; align-content: center; }
  .ng-gb .ng-ct { font-size: 28px; }
  .ng-gb .ng-cb { font-size: 18px; line-height: 1.4; color: var(--muted); }
  .ng-lane { position: absolute; left: 110px; width: 160px; display: grid; gap: 10px; }
  .ng-lane .k { font: 700 15px/1.2 var(--f-body); letter-spacing: .2em; text-transform: uppercase; color: var(--gold-deep); }
  .ng-lane .r { width: 48px; height: 3px; background: var(--gold); }
  .ng-lane .v { font: 400 17px/1.4 var(--f-body); color: var(--muted); }

  /* partnership loop */
  .ng-node-l { position: absolute; font: 700 17px/1.25 var(--f-body); letter-spacing: .1em; text-transform: uppercase; color: var(--navy); width: 210px; }
  .ng-loop-c { position: absolute; left: 330px; top: 452px; width: 200px; text-align: center; font: italic 500 30px/1.2 var(--f-display); color: var(--navy); margin: 0; }
  .ng-commit { position: absolute; left: 880px; width: 610px; top: 236px; display: grid; gap: 26px; }
  .ng-cm { display: grid; grid-template-columns: 74px 1fr; gap: 22px; align-items: start; }
  .ng-cm .no { width: 74px; height: 74px; border-radius: 50%; border: 2px solid var(--gold); display: grid; place-items: center; font: italic 600 26px/1 var(--f-display); color: var(--gold-deep); background: var(--paper); }
  .ng-cm .t { margin: 0 0 6px; font: 600 31px/1.15 var(--f-display); color: var(--navy); }
  .ng-cm .d { margin: 0; font: 400 19px/1.5 var(--f-body); color: var(--navy); }

  /* questions */
  .ng-qs { position: absolute; left: 110px; width: 1380px; top: 250px; display: grid; gap: 34px; }
  .ng-qr { display: grid; grid-template-columns: 70px 1fr; gap: 26px; align-items: baseline; padding-bottom: 26px; border-bottom: 1px solid var(--line); }
  .ng-qr .n { font: 700 40px/1 var(--f-body); color: var(--gold); }
  .ng-qr p { margin: 0; font: 500 41px/1.2 var(--f-display); color: var(--navy); }

  /* close */
  .ng-cl { position: absolute; left: 110px; top: 128px; width: 1100px; display: grid; gap: 22px; }
  .ng-cl .eb { font: 700 15px/1.3 var(--f-body); letter-spacing: .24em; text-transform: uppercase; color: var(--gold-lt); }
  .ng-cl h1 { margin: 0; font: 600 84px/1.02 var(--f-display); color: var(--cream); }
  .ng-cl .rl { width: 96px; height: 3px; background: var(--gold); }
  .ng-cl .ld { margin: 0; font: italic 500 40px/1.25 var(--f-display); color: var(--gold-lt); }
  .ng-contact { position: absolute; left: 110px; right: 110px; top: 500px; height: 270px; box-sizing: border-box; padding: 34px 44px; border-radius: 18px; background: rgba(247, 245, 241, .05); border: 1px solid rgba(213, 189, 104, .38); display: grid; grid-template-columns: 1fr 560px; gap: 48px; align-items: center; }
  .ng-who { display: grid; gap: 10px; }
  .ng-who .n { margin: 0; font: 600 40px/1.1 var(--f-display); color: var(--cream); }
  .ng-who .f { font: 700 15px/1.3 var(--f-body); letter-spacing: .2em; text-transform: uppercase; color: var(--gold-lt); }
  .ng-who .c { font: 400 18px/1.4 var(--f-body); color: rgba(247, 245, 241, .82); }
  .ng-who .l { font: 400 15px/1.4 var(--f-body); color: rgba(247, 245, 241, .6); }
  .ng-links { display: grid; gap: 12px; }
  .stage a.ng-a { display: flex; align-items: center; gap: 16px; color: var(--cream); text-decoration: none; font: 500 20px/1.25 var(--f-body); }
  .stage a.ng-a:hover { color: var(--gold-lt); }
  .ng-a .i { width: 42px; height: 42px; flex: none; border-radius: 50%; border: 1px solid rgba(213, 189, 104, .6); display: grid; place-items: center; }
  .ng-a .i svg { width: 22px; height: 22px; }
  `);

  /* ---------- shared pieces ---------- */
  const AT = (n) => `data-at="${n}"`;
  /** show everything whose data-at is at or below the current build step */
  function reveal(ctx, n) { ctx.$$('[data-at]').forEach((e) => e.classList.toggle('is-off', +e.dataset.at > n)); }
  function head(ctx, o) {
    return `<div class="ng-hd">${ctx.t(o.eb, { tag: 'span', cls: 'st-eyebrow' })}${ctx.t(o.h, { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule">${o.sub ? ctx.t(o.sub, { tag: 'p', cls: 'ng-sub' }) : ''}</div>`;
  }
  function line(ctx, key, top, o) {
    o = o || {};
    return ctx.t(key, { tag: 'p', cls: 'ng-line serif ng-f' + (o.cls ? ' ' + o.cls : ''), attrs: `style="top:${top}px"${o.at != null ? ' ' + AT(o.at) : ''}` });
  }
  function src(ctx, key, style) { return ctx.t(key, { tag: 'p', cls: 'ng-src', attrs: style ? `style="${style}"` : '' }); }
  function disc(topics, style) {
    const D = EFA.lib && EFA.lib.disclosure;
    return D ? D.line(topics, { cls: 'ng-disc', style: style || '' }) : '';
  }
  const goldGrad = (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset="1" stop-color="${P.gold}"/></linearGradient>`;
  const navyGrad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a || P.navy3}"/><stop offset="1" stop-color="${b || P.navy}"/></linearGradient>`;
  const arrowDef = (id, color) => `<marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${color || P.gold}"/></marker>`;

  /* small line icons (64 x 64): navy strokes, gold accents */
  const N = P.navy, G = P.gold;
  const IC = {
    clock: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="35" r="21" fill="none" stroke="${N}" stroke-width="3"/><path d="M25 7h14M32 7v7" stroke="${N}" stroke-width="3" stroke-linecap="round"/><path d="M32 35V22M32 35l9 6" stroke="${G}" stroke-width="3.5" stroke-linecap="round"/><circle cx="32" cy="35" r="3" fill="${G}"/></svg>`,
    house: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M7 31 30 12l23 19" fill="none" stroke="${N}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 27v26h34V27" fill="none" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><path d="M25 53V40h10v13" fill="${G}" opacity=".85"/><path d="M53 22V6M47 12l6-6 6 6" fill="none" stroke="${G}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    partners: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="21" cy="19" r="7" fill="${N}"/><path d="M7 52c0-11 6-18 14-18s14 7 14 18z" fill="${N}"/><circle cx="44" cy="21" r="7" fill="none" stroke="${G}" stroke-width="2.6" stroke-dasharray="2 5" stroke-linecap="round"/><path d="M31 53c0-10 6-17 13-17s13 7 13 17z" fill="none" stroke="${G}" stroke-width="2.6" stroke-dasharray="2 5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    people: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="20" cy="17" r="7" fill="${N}"/><path d="M6 52c0-12 6-20 14-20s14 8 14 20z" fill="${N}"/><circle cx="42" cy="24" r="5.5" fill="${P.navy4}"/><path d="M31 52c0-9 5-15 11-15s11 6 11 15z" fill="${P.navy4}"/><rect x="4" y="54" width="56" height="4" rx="2" fill="${G}"/></svg>`,
    chart: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 54h50" stroke="${N}" stroke-width="3" stroke-linecap="round"/><rect x="12" y="38" width="9" height="16" rx="2" fill="${P.navy4}"/><rect x="27" y="28" width="9" height="26" rx="2" fill="${P.navy3}"/><rect x="42" y="17" width="9" height="37" rx="2" fill="${N}"/><path d="M12 30 26 19l9 6 17-15M44 9h9v9" fill="none" stroke="${G}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    heart: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 53S9 39 9 23c0-7 5-12 12-12 5 0 9 3 11 7 2-4 6-7 11-7 7 0 12 5 12 12 0 16-23 30-23 30z" fill="${G}" opacity=".9"/><path d="M32 53S9 39 9 23c0-7 5-12 12-12 5 0 9 3 11 7 2-4 6-7 11-7 7 0 12 5 12 12 0 16-23 30-23 30z" fill="none" stroke="${N}" stroke-width="3" stroke-linejoin="round"/></svg>`,
    bank: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M6 24 32 9l26 15z" fill="${N}"/><rect x="8" y="26" width="48" height="4" fill="${G}"/><path d="M14 33v15M25 33v15M39 33v15M50 33v15" stroke="${N}" stroke-width="4.5" stroke-linecap="round"/><rect x="6" y="51" width="52" height="5" rx="1.5" fill="${N}"/></svg>`,
    policy: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 6h26l12 12v40H14z" fill="#fff" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><path d="M40 6v12h12" fill="none" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><path d="M21 26h22M21 33h22M21 40h12" stroke="${N}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/><circle cx="42" cy="47" r="8" fill="${G}"/><path d="M38.5 47l2.5 2.5 4.5-5" fill="none" stroke="${N}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    deal: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 50l14-15 10 8 22-24" fill="none" stroke="${N}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 19h12v12" fill="none" stroke="${G}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 57h48" stroke="${G}" stroke-width="3" stroke-linecap="round"/></svg>`,
    venture: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 56V8" stroke="${N}" stroke-width="3.4" stroke-linecap="round"/><path d="M16 10h30l-7 9 7 9H16" fill="${G}" opacity=".9"/><path d="M16 10h30l-7 9 7 9H16" fill="none" stroke="${N}" stroke-width="3" stroke-linejoin="round"/><path d="M8 56h22" stroke="${N}" stroke-width="3" stroke-linecap="round"/></svg>`,
    gift: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="26" width="44" height="30" rx="3" fill="none" stroke="${N}" stroke-width="3"/><rect x="7" y="18" width="50" height="10" rx="2" fill="${N}"/><path d="M32 18v38" stroke="${G}" stroke-width="5"/><path d="M32 18c-3-7-14-10-14-3s11 3 14 3zM32 18c3-7 14-10 14-3s-11 3-14 3z" fill="none" stroke="${G}" stroke-width="3" stroke-linejoin="round"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z" fill="none" stroke="${P.goldLt}" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
    mail: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="${P.goldLt}" stroke-width="1.8"/><path d="M3.5 6.5 12 13l8.5-6.5" fill="none" stroke="${P.goldLt}" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
    web: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="${P.goldLt}" stroke-width="1.8"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="${P.goldLt}" stroke-width="1.6"/></svg>`,
    cal: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="${P.goldLt}" stroke-width="1.8"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="${P.goldLt}" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="15" r="1.8" fill="${P.goldLt}"/></svg>`
  };

  /* ---------- 1. cover ---------- */
  function coverArt() {
    const cx = 1196, by = 676;
    const arch = (r, stroke, w, op, delay) => `<path class="ng-draw" style="--l:${(Math.PI * r).toFixed(1)};animation-delay:${delay}s" d="M${cx - r} ${by}A${r} ${r} 0 0 1 ${cx + r} ${by}" fill="none" stroke="${stroke}" stroke-width="${w}" opacity="${op}" stroke-linecap="round"/>`;
    const stars = [[930, 236, 1.6], [1012, 168, 1.2], [1104, 214, 2], [1268, 152, 1.4], [1360, 206, 1.8], [1452, 260, 1.3], [1508, 178, 1.1], [968, 320, 1.1], [1430, 344, 1.5], [1180, 116, 1.2], [1530, 404, 1], [884, 398, 1.2]];
    return `<svg class="ng-full" viewBox="0 0 1600 900" aria-hidden="true">
      <defs>${goldGrad('ngCvG')}
        <radialGradient id="ngCvGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${P.goldLt}" stop-opacity=".2"/><stop offset="1" stop-color="${P.goldLt}" stop-opacity="0"/></radialGradient>
      </defs>
      <circle cx="${cx}" cy="${by - 70}" r="380" fill="url(#ngCvGlow)"/>
      ${stars.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.cream}" opacity=".5"/>`).join('')}
      ${arch(300, P.goldLt, 1.5, 0.32, 0.1)}
      ${arch(240, P.cream, 2, 0.28, 0.35)}
      ${arch(180, P.goldLt, 2.6, 0.75, 0.6)}
      ${arch(120, P.cream, 2.2, 0.42, 0.85)}
      <path class="ng-rise" style="animation-delay:1.1s" d="M${cx - 62} ${by}A62 62 0 0 1 ${cx + 62} ${by}Z" fill="url(#ngCvG)"/>
      <rect x="${cx - 350}" y="${by}" width="700" height="16" rx="3" fill="url(#ngCvG)"/>
      <rect x="${cx - 300}" y="${by + 28}" width="600" height="3" rx="1.5" fill="${P.gold}" opacity=".4"/>
    </svg>`;
  }
  EFA.screen('ng1', {
    title: 'Secure the next generation first',
    copy: {
      eb: 'A conversation for builders, investors, and the people who serve them',
      h: 'Secure the next generation first.',
      ld: 'Then invest, build, and give from a position of strength.',
      firm: 'Edwards Financial & Associates',
      cred: 'Life & Annuities · Retirement Consulting · Estate Strategy',
      _notes: 'Open warm. This is a conversation about the people behind the wealth, not about a product.\n\n- Ask: Before we start, who are you really building all of this for?\nPAUSE\n\n- With a partner (fund manager, attorney, CPA, fundraiser): this is the same conversation their investors, clients, and donors are having privately.'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="ng-navy"></div>${coverArt()}
        <div class="ng-cv">
          ${ctx.t('eb', { tag: 'span', cls: 'eb' })}
          ${ctx.t('h', { tag: 'h1', cls: 'serif' })}
          <div class="rl"></div>
          ${ctx.t('ld', { tag: 'p', cls: 'ld serif' })}
        </div>
        <div class="ng-cv-ft">${ctx.t('firm', { tag: 'span', cls: 'f' })}${ctx.t('cred', { tag: 'span', cls: 'c' })}</div>`;
    }
  });

  /* ---------- 2. the question ---------- */
  EFA.screen('ng2', {
    title: 'The question',
    steps: 3,
    copy: {
      eb: 'Start here',
      q: 'What would you put to work if your family’s future were already handled?',
      c1: 'A bigger stake in the deal you believe in',
      c2: 'The venture you keep putting off',
      c3: 'The gift you have been waiting to make',
      hold: 'Hold on to your answer. The rest of this conversation is about making it possible.',
      _notes: 'Let the question land. Do not fill the silence.\n\n- Ask: What would you put to work if your family’s future were already handled?\nPAUSE\n\n- Write down their answer. It becomes the goal for the rest of the conversation.\n- With a partner: ask what their investors, members, or donors would do with that freedom.'
    },
    render(ctx) {
      const ic = [IC.deal, IC.venture, IC.gift];
      ctx.el.innerHTML = `
        <div class="ng-qw">${ctx.t('eb', { tag: 'span', cls: 'st-eyebrow' })}${ctx.t('q', { tag: 'p', cls: 'ng-q serif' })}<hr class="st-rule"></div>
        <div class="ng-trio ng-f" ${AT(1)}>${['c1', 'c2', 'c3'].map((k, i) => `<div class="ng-tc">${ic[i]}${ctx.t(k, { tag: 'p' })}</div>`).join('')}</div>
        ${ctx.t('hold', { tag: 'p', cls: 'ng-hold ng-f', attrs: AT(2) })}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 3. why you build: the generations ---------- */
  function figure(x, by, s, o) {
    const hr = 44 * s, hy = by - 214 * s, sh = 80 * s, top = by - 158 * s;
    const body = `M${x - sh} ${by}C${x - sh} ${by - 70 * s} ${x - 54 * s} ${top} ${x} ${top}C${x + 54 * s} ${top} ${x + sh} ${by - 70 * s} ${x + sh} ${by}Z`;
    if (o.dashed) {
      const st = `fill="none" stroke="${P.gold}" stroke-width="3.2" stroke-dasharray="1 10" stroke-linecap="round"`;
      return `<circle cx="${x}" cy="${hy}" r="${hr}" ${st}/><path d="${body}" ${st}/>`;
    }
    return `<circle cx="${x}" cy="${hy}" r="${hr}" fill="${o.fill}"/><path d="${body}" fill="${o.fill}"/>`;
  }
  EFA.screen('ng3', {
    title: 'Why you build',
    steps: 5,
    copy: {
      eb: 'Why you build',
      h: 'Ask a builder why. Then ask again.',
      g1: 'You', g2: 'Your children', g3: 'Their children', g4: 'Generations you\nwill never meet',
      close: 'The duty underneath it all: leave things better than you found them.',
      _notes: 'Most builders, whether they say it or not, are building for the people who come after them. Name it gently.\n\n- Ask: When you picture what all of this is for, whose faces do you see?\nPAUSE\n\n- Ask: What do you want the generations you will never meet to say about you?\nPAUSE'
    },
    render(ctx) {
      const by = 628, xs = [312, 637, 962, 1287], sc = [1, 0.93, 0.86, 0.86];
      const fills = [P.navy, P.navy3, P.navy4];
      const figs = xs.map((x, i) => `<g class="ng-f" ${AT(i)}><ellipse cx="${x}" cy="${by + 2}" rx="${96 * sc[i]}" ry="10" fill="rgba(13,30,58,.08)"/>${figure(x, by, sc[i], { fill: fills[i], dashed: i === 3 })}</g>`).join('');
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        <svg class="ng-full" viewBox="0 0 1600 900" aria-hidden="true"><defs>${goldGrad('ngGnG')}</defs>
          <rect x="150" y="${by}" width="1300" height="6" rx="3" fill="url(#ngGnG)"/>${figs}</svg>
        ${['g1', 'g2', 'g3', 'g4'].map((k, i) => ctx.t(k, { tag: 'div', cls: 'ng-glab ng-f' + (i === 3 ? ' gold' : ''), attrs: `style="left:${xs[i]}px;top:${by + 26}px" ${AT(i)}` })).join('')}
        ${line(ctx, 'close', 772, { at: 4 })}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 4. the quiet reserve ---------- */
  EFA.screen('ng4', {
    title: 'The quiet reserve',
    steps: 6,
    copy: {
      eb: 'The quiet reserve',
      h: 'Every family portfolio has a quiet reserve.',
      all: 'Everything you own',
      work: 'Working for you',
      held: 'Held back for the family',
      r1: 'Cash kept on the sidelines, just in case.',
      r2: 'A more cautious mix than you would choose for yourself.',
      r3: 'Property you will never sell, because it is meant for the kids.',
      r4: 'Deals you pass on, because the downside feels personal.',
      close: 'It’s love. It’s also capital that isn’t working.',
      _notes: 'Families quietly hold part of their wealth back for the kids. It comes from love, and it has a cost.\n\n- Ask: How much of what you own is really there to protect the kids, rather than to grow?\nPAUSE\n\n- With a fund manager: this reserve is capital that never makes it into their deals.'
    },
    render(ctx) {
      const x0 = 150, y0 = 236;
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        <svg style="position:absolute;left:${x0}px;top:${y0}px;width:380px;height:560px;overflow:visible" viewBox="0 0 380 560" aria-hidden="true">
          <defs>${navyGrad('ngRsN', P.navy3, P.navy)}
            <pattern id="ngRsH" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="${P.goldPale}"/><rect width="6" height="16" fill="${P.goldLt}" opacity=".75"/></pattern>
            <clipPath id="ngRsC"><rect x="40" y="34" width="300" height="490" rx="26"/></clipPath></defs>
          <ellipse cx="190" cy="530" rx="160" ry="12" fill="rgba(13,30,58,.08)"/>
          <g clip-path="url(#ngRsC)">
            <rect x="40" y="34" width="300" height="490" fill="url(#ngRsN)"/>
            <g class="ng-f" ${AT(1)}><rect x="40" y="300" width="300" height="230" fill="url(#ngRsH)"/><rect x="40" y="298" width="300" height="4" fill="${P.gold}"/></g>
          </g>
          <rect x="40" y="34" width="300" height="490" rx="26" fill="none" stroke="${P.rule}" stroke-width="2"/>
        </svg>
        ${ctx.t('all', { tag: 'div', cls: 'ng-lab', attrs: `style="left:${x0 + 190}px;top:${y0 + 4}px;transform:translateX(-50%)"` })}
        ${ctx.t('work', { tag: 'div', cls: 'ng-col-l', attrs: `style="left:${x0 + 190}px;top:${y0 + 168}px;color:var(--cream)"` })}
        ${ctx.t('held', { tag: 'div', cls: 'ng-col-l pill ng-f', attrs: `style="left:${x0 + 190}px;top:${y0 + 412}px;color:var(--navy)" ${AT(1)}` })}
        <div class="ng-rows">${['r1', 'r2', 'r3', 'r4'].map((k, i) => `<div class="ng-row ng-f" ${AT(i + 1)}><span class="n"><span class="num">${i + 1}</span></span>${ctx.t(k, { tag: 'p' })}</div>`).join('')}</div>
        ${line(ctx, 'close', 790, { at: 5 })}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 5. mental real estate ---------- */
  EFA.screen('ng5', {
    title: 'Mental real estate',
    steps: 4,
    copy: {
      eb: 'Mental real estate',
      h: 'The reserve lives in your head, too.',
      mind: 'Your best\nthinking',
      what: 'What if something happens to me?',
      a: 'Every decision carries a second question.',
      b: 'It sits in on the deal, the hire, the expansion, and the gift.',
      c: 'That’s mental real estate you could be using to build.',
      _notes: 'The reserve also takes up attention. “What if something happens to me” sits in on every big decision.\n\n- Ask: How often does that question sit in on your decisions?\nPAUSE\n\n- Ask: What would you think about instead, if it were already answered?\nPAUSE'
    },
    render(ctx) {
      const x0 = 150, y0 = 236, c = 270, r = 238;
      const [dx, dy] = A.pt(0, 0, 14, 42);
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        <svg style="position:absolute;left:${x0}px;top:${y0}px;width:540px;height:540px;overflow:visible" viewBox="0 0 540 540" aria-hidden="true">
          <defs><radialGradient id="ngMrN" cx=".38" cy=".34" r=".8"><stop offset="0" stop-color="${P.navy4}"/><stop offset=".6" stop-color="${P.navy2}"/><stop offset="1" stop-color="${P.navy}"/></radialGradient>${goldGrad('ngMrG')}</defs>
          <ellipse cx="${c}" cy="${c + r + 22}" rx="200" ry="14" fill="rgba(13,30,58,.08)"/>
          <circle cx="${c}" cy="${c}" r="${r}" fill="url(#ngMrN)"/>
          <circle cx="${c}" cy="${c}" r="${r - 34}" fill="none" stroke="${P.cream}" stroke-opacity=".08" stroke-width="2"/>
          <circle cx="${c}" cy="${c}" r="${r - 80}" fill="none" stroke="${P.cream}" stroke-opacity=".06" stroke-width="2"/>
          <path class="ng-wedge" ${AT(1)} d="${A.wedge(c + dx, c + dy, r + 6, -8, 92)}" fill="url(#ngMrG)" stroke="${P.paper}" stroke-width="4"/>
        </svg>
        ${ctx.t('mind', { tag: 'div', cls: 'ng-wl2', attrs: `style="left:${x0 + 196}px;top:${y0 + 330}px"` })}
        ${ctx.t('what', { tag: 'div', cls: 'ng-wl ng-f', attrs: `style="left:${x0 + 372}px;top:${y0 + 124}px" ${AT(1)}` })}
        <div class="ng-mr">
          ${ctx.t('a', { tag: 'p', cls: 'a serif ng-f', attrs: AT(1) })}
          ${ctx.t('b', { tag: 'p', cls: 'b ng-f', attrs: AT(2) })}
          ${ctx.t('c', { tag: 'p', cls: 'c serif ng-f', attrs: AT(3) })}
        </div>`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 6. when the bill arrives before the cash ---------- */
  function card3(ctx, o) {
    return `<div class="ng-card ng-c3${o.lg ? ' lg' : ''} ng-f" ${AT(o.at)} style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px">
      <span class="ng-ic">${o.icon}</span>
      ${o.stat ? ctx.t(o.stat, { tag: 'div', cls: 'ng-stat' }) : ''}
      ${o.cap ? ctx.t(o.cap, { tag: 'div', cls: 'ng-cap' }) : ''}
      ${ctx.t(o.title, { tag: 'h3', cls: 'ng-ct serif' })}
      ${ctx.t(o.body, { tag: 'p', cls: 'ng-cb' })}
    </div>`;
  }
  EFA.screen('ng6', {
    title: 'When the bill arrives before the cash',
    steps: 4,
    copy: {
      eb: 'Without a floor',
      h: 'When the bill arrives before the cash.',
      s1: '9 months', t1: 'The estate tax clock',
      b1: 'The federal estate tax return is generally due nine months after death. Above the 2026 exclusion of $15,000,000 per person, the top rate is 40%.',
      s2: 'Reassessed', t2: 'California’s inheritance gap',
      b2: 'A rental or investment property passed from parent to child no longer qualifies for California’s parent-child exclusion, so it can be reassessed and its carrying cost rises.',
      s3: 'New partners', t3: 'The partnership problem',
      b3: 'Without a funded buy-sell agreement, surviving owners can end up in business with heirs who never chose the business.',
      close: 'Without cash ready, something gets sold on someone else’s timeline.',
      src: 'Sources: Internal Revenue Service, IR-2025-103 (October 9, 2025) and “Filing Estate and Gift Tax Returns”; 26 U.S.C. 2001(c); California State Board of Equalization, Proposition 19.',
      _notes: 'Three ways the bill can arrive before the cash. Keep it factual, not dramatic.\n\n- The federal return is generally due nine months after death. The 2026 exclusion is $15,000,000 per person, and the top rate above it is 40%.\n- California’s Proposition 19 limits the parent-child exclusion to the family home or family farm. Rentals and investment property no longer qualify.\n- Business owners: an unfunded buy-sell agreement can leave surviving owners and heirs in business together.\n\n- Ask: If the bill came due next year, which asset would your family have to sell first?\nPAUSE'
    },
    render(ctx) {
      const y = 240, w = 410, h = 430, xs = [110, 595, 1080];
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        ${card3(ctx, { at: 0, x: xs[0], y, w, h, icon: IC.clock, stat: 's1', title: 't1', body: 'b1' })}
        ${card3(ctx, { at: 1, x: xs[1], y, w, h, icon: IC.house, stat: 's2', title: 't2', body: 'b2' })}
        ${card3(ctx, { at: 2, x: xs[2], y, w, h, icon: IC.partners, stat: 's3', title: 't3', body: 'b3' })}
        ${line(ctx, 'close', 716, { at: 3, cls: 'sm' })}
        ${src(ctx, 'src')}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 7. a legacy, sold to pay the bill ---------- */
  function stadium() {
    const towers = [[96, 178], [544, 178], [150, 352], [490, 352]];
    return `<svg style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 640 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>${navyGrad('ngStB', P.navy3, P.navy)}${goldGrad('ngStG')}
        <clipPath id="ngStF"><ellipse cx="320" cy="250" rx="158" ry="60"/></clipPath></defs>
      <ellipse cx="320" cy="318" rx="270" ry="40" fill="rgba(13,30,58,.10)"/>
      <ellipse cx="320" cy="262" rx="258" ry="124" fill="url(#ngStB)"/>
      <ellipse cx="320" cy="252" rx="238" ry="106" fill="${P.navy3}"/>
      <ellipse cx="320" cy="250" rx="204" ry="86" fill="${P.navy2}"/>
      ${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="320" cy="252" rx="${222 - i * 4}" ry="${96 - i * 2}" fill="none" stroke="${P.cream}" stroke-opacity=".07" stroke-width="2"/>`).join('')}
      <ellipse cx="320" cy="250" rx="158" ry="60" fill="${P.navy4}"/>
      <g clip-path="url(#ngStF)" stroke="${P.cream}" stroke-opacity=".32" stroke-width="2" fill="none">
        ${[-120, -80, -40, 0, 40, 80, 120].map((d) => `<path d="M${320 + d} 186v128"/>`).join('')}
        <ellipse cx="320" cy="250" rx="26" ry="10"/>
      </g>
      ${towers.map(([x, y]) => `<path d="M${x} ${y}V${y - 78}" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/><rect x="${x - 20}" y="${y - 96}" width="40" height="16" rx="3" fill="${P.goldLt}"/><path d="M${x - 14} ${y - 80}l-26 40M${x + 14} ${y - 80}l26 40" stroke="${P.goldLt}" stroke-opacity=".18" stroke-width="16" stroke-linecap="round"/>`).join('')}
      <g class="ng-f" ${AT(2)}>
        <path d="M402 330 450 392" stroke="${P.gold}" stroke-width="2.5" stroke-dasharray="3 6" stroke-linecap="round"/>
        <g transform="rotate(-4 420 420)"><rect x="236" y="392" width="368" height="64" rx="12" fill="url(#ngStG)"/><circle cx="262" cy="424" r="7" fill="${P.paper}" stroke="${P.goldDeep}" stroke-width="2"/>
        <text x="434" y="433" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="24" fill="${P.navy}">$43 million to estate taxes</text></g>
      </g>
    </svg>`;
  }
  EFA.screen('ng7', {
    title: 'A legacy, sold to pay the bill',
    steps: 4,
    copy: {
      eb: 'What happens without a floor',
      h: 'A legacy, sold to pay the bill.',
      p1: 'Joe Robbie was the founding owner of the Miami Dolphins. He died in 1990.',
      p2: 'In 1994, amid a family dispute, his children sold the team.',
      p3: 'Of $109 million in reported proceeds, $43 million went straight to estate taxes.',
      p4: 'Cash ready at the right moment could have changed the ending.',
      src: 'Source: Michael Rosenberg, “The Super Bowl that tore a family apart, forever changed stadium deals,” Sports Illustrated, November 23, 2015.',
      _notes: 'A well-known example of what a missing floor costs.\n\n- Joe Robbie, founding owner of the Miami Dolphins, died in 1990. In July 1994 his children sold the team. Of $109 million in reported proceeds, $43 million went to estate taxes (Sports Illustrated, 2015).\n\n- Ask: What would you want your family to be able to keep, no matter when the bill arrives?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        <div class="ng-card" style="left:110px;top:226px;width:640px;height:500px;overflow:hidden">${stadium()}</div>
        <div class="ng-story">
          ${ctx.t('p1', { tag: 'p', cls: 'b ng-f', attrs: AT(0) })}
          ${ctx.t('p2', { tag: 'p', cls: 'b ng-f', attrs: AT(1) })}
          ${ctx.t('p3', { tag: 'p', cls: 's serif ng-f', attrs: AT(2) })}
          ${ctx.t('p4', { tag: 'p', cls: 'e serif ng-f', attrs: AT(3) })}
        </div>
        ${src(ctx, 'src')}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 8. pour the floor first ---------- */
  EFA.screen('ng8', {
    title: 'Pour the floor first',
    steps: 3,
    copy: {
      eb: 'The turn',
      h: 'Pour the floor first.',
      sub: 'A defined amount for the next generation, set aside first, in a trust built for them.',
      k: 'The Legacy Floor',
      v: 'The next generation, secured',
      b1: 'Investments', b2: 'Ventures and\npassions', b3: 'Giving',
      fk: 'Freedom capital',
      fv: 'Free to work, because the floor holds.',
      close: 'Once the floor is poured, everything above it is free to work.',
      _notes: 'The turn. Before anything else, set aside a defined amount for the next generation, usually permanent life insurance owned by an irrevocable trust built for the family.\n\n- Ask: What changes about how you invest once the floor is poured?\nPAUSE\n\n- Bring back their answer from the opening question.'
    },
    render(ctx) {
      const blocks = [[300, 434, 166, 'ngFlB1'], [605, 334, 266, 'ngFlB2'], [910, 394, 206, 'ngFlB3']];
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h', sub: 'sub' })}
        <svg class="ng-full" viewBox="0 0 1600 900" aria-hidden="true">
          <defs>${goldGrad('ngFlG')}${navyGrad('ngFlB1', P.navy4, P.navy3)}${navyGrad('ngFlB2', P.navy3, P.navy)}${navyGrad('ngFlB3', P.navy4, P.navy2)}</defs>
          <ellipse cx="730" cy="694" rx="540" ry="20" fill="rgba(13,30,58,.10)"/>
          <rect x="230" y="600" width="1000" height="86" rx="10" fill="url(#ngFlG)"/>
          <rect x="230" y="600" width="1000" height="6" rx="3" fill="${P.paper}" opacity=".45"/>
          <g class="ng-f" ${AT(1)}>${blocks.map(([x, y, h, g]) => `<rect x="${x}" y="${y}" width="250" height="${h}" rx="10" fill="url(#${g})"/><rect x="${x}" y="${y}" width="250" height="5" rx="2.5" fill="${P.goldLt}" opacity=".8"/>`).join('')}</g>
          <g class="ng-f" ${AT(2)}><path d="M1186 334h14v262h-14" fill="none" stroke="${P.gold}" stroke-width="3" stroke-linejoin="round"/></g>
        </svg>
        <div class="ng-slab-t">${ctx.t('k', { tag: 'span', cls: 'k' })}${ctx.t('v', { tag: 'span', cls: 'v serif' })}</div>
        ${['b1', 'b2', 'b3'].map((k, i) => ctx.t(k, { tag: 'div', cls: 'ng-blk ng-f', attrs: `style="left:${blocks[i][0]}px;top:${blocks[i][1] + 30}px" ${AT(1)}` })).join('')}
        <div class="ng-fc ng-f" ${AT(2)}>${ctx.t('fk', { tag: 'p', cls: 'k serif' })}${ctx.t('fv', { tag: 'p', cls: 'v' })}</div>
        ${line(ctx, 'close', 742, { at: 2 })}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 9. fund the floor without selling the engine ---------- */
  function node(ctx, o) {
    return `<div class="ng-card ng-node${o.gold ? ' gold' : ''} ng-f" ${AT(o.at)} style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px">
      <div class="hdr">${o.icon || ''}${ctx.t(o.title, { tag: 'h3', cls: 'ng-ct serif' })}</div>
      ${o.cap ? ctx.t(o.cap, { tag: 'div', cls: 'ng-cap' }) : ''}
      ${o.pill ? `<span class="ng-pill">${ctx.t(o.pill)}</span>` : ''}
      ${ctx.t(o.body, { tag: 'p', cls: 'ng-cb' })}
    </div>`;
  }
  EFA.screen('ng9', {
    title: 'Fund the floor without selling the engine',
    steps: 4,
    copy: {
      eb: 'How the floor is funded',
      h: 'Fund the floor without selling the engine.',
      tTrust: 'Family trust', capTrust: 'The Legacy Floor', pTrust: 'Life insurance policy', bTrust: 'Builds value for the family.',
      tGen: 'The next generation', bGen: 'Receives the benefit.',
      tLend: 'The lender', bLend: 'Pays the premiums.',
      tCap: 'Your capital', bCap: 'Stays invested in your fund, your deals, and your business.',
      aPrem: 'Premiums', aDeath: 'At death, the benefit', aInt: 'Interest and\ncollateral', aExit: 'A planned exit\nrepays the lender',
      risk: 'Leverage carries real risk: borrowing costs move, collateral must be maintained, policy values vary, and every loan needs a planned exit. Every case is stress-tested and reviewed each year.',
      _notes: 'How the floor gets funded without pulling capital out of what is working. A lender pays the premiums to a policy owned by the family trust. The client pays the interest and pledges collateral, and their capital stays invested. A planned exit repays the lender.\n\n- Name the risks plainly: rates move, collateral must be maintained, policy values vary, and the loan needs an exit. Every case is stress-tested and reviewed every year.\n- Ask: Where is your capital working hardest right now?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        <svg class="ng-full" viewBox="0 0 1600 900" aria-hidden="true">
          <defs>${arrowDef('ngFnA', P.gold)}${arrowDef('ngFnN', P.navy3)}</defs>
          <path class="ng-f" ${AT(0)} d="M974 576H1144" stroke="${P.gold}" stroke-width="3.5" fill="none" marker-end="url(#ngFnA)"/>
          <path class="ng-f" ${AT(1)} d="M806 378V462" stroke="${P.gold}" stroke-width="3.5" fill="none" marker-end="url(#ngFnA)"/>
          <path class="ng-f" ${AT(2)} d="M488 428C560 428 566 304 634 304" stroke="${P.navy3}" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" fill="none" marker-end="url(#ngFnN)"/>
          <path class="ng-f" ${AT(3)} d="M976 494C1070 494 1072 300 980 300" stroke="${P.gold}" stroke-width="3" stroke-dasharray="10 8" fill="none" marker-end="url(#ngFnA)"/>
        </svg>
        ${node(ctx, { at: 1, x: 640, y: 226, w: 334, h: 152, icon: IC.bank, title: 'tLend', body: 'bLend' })}
        ${node(ctx, { at: 0, x: 640, y: 466, w: 334, h: 224, gold: true, icon: IC.policy, title: 'tTrust', cap: 'capTrust', pill: 'pTrust', body: 'bTrust' })}
        ${node(ctx, { at: 0, x: 1150, y: 476, w: 340, h: 200, icon: IC.people, title: 'tGen', body: 'bGen' })}
        ${node(ctx, { at: 2, x: 110, y: 330, w: 372, h: 196, icon: IC.chart, title: 'tCap', body: 'bCap' })}
        ${ctx.t('aPrem', { tag: 'div', cls: 'ng-al ng-f', attrs: `style="left:824px;top:410px" ${AT(1)}` })}
        ${ctx.t('aDeath', { tag: 'div', cls: 'ng-al ng-f', attrs: `style="left:982px;top:536px;width:160px" ${AT(0)}` })}
        ${ctx.t('aInt', { tag: 'div', cls: 'ng-al ng-f', attrs: `style="left:498px;top:448px;color:var(--navy-3)" ${AT(2)}` })}
        ${ctx.t('aExit', { tag: 'div', cls: 'ng-al ng-f', attrs: `style="left:1086px;top:368px" ${AT(3)}` })}
        ${ctx.t('risk', { tag: 'p', cls: 'ng-risk' })}
        ${disc(['tax', 'loans', 'guarantees'])}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 10. two ways to pour the floor ---------- */
  function tank(x, y, lvl, id) {
    const h = 200, top = y + 12 + (1 - lvl) * (h - 24);
    return `<rect x="${x}" y="${y}" width="190" height="${h}" rx="20" fill="${P.paper}" stroke="${P.navy}" stroke-width="3"/>
      <clipPath id="${id}"><rect x="${x + 8}" y="${y + 8}" width="174" height="${h - 16}" rx="14"/></clipPath>
      <g clip-path="url(#${id})"><rect class="ng-lvl" x="${x + 8}" y="${top}" width="174" height="${y + h - top}" fill="url(#ngTwN)"/></g>`;
  }
  EFA.screen('ng10', {
    title: 'Two ways to pour the floor',
    steps: 3,
    copy: {
      eb: 'Same floor, two ways',
      h: 'Two ways to pour the floor.',
      capL: 'Option one', tL: 'Write the checks yourself',
      bL: 'Premiums leave your portfolio every year, and those dollars stop compounding there.',
      capR: 'Option two', tR: 'Let a lender write them',
      bR: 'Your capital stays invested. You carry the cost of the money and pledge collateral.',
      port: 'Your\nportfolio', pol: 'Policy', lend: 'Lender',
      every: 'Premiums,\nevery year', intr: 'Interest and\ncollateral',
      close: 'Same floor. More of your capital stays at work.',
      _notes: 'Same floor, two ways to pay for it. One pulls capital out of the engine every year. The other leaves it working.\n\n- Ask: Which way would you rather pour it?\nPAUSE\n\n- With a fund manager: this is why we are on the same side. The capital stays with them.'
    },
    render(ctx) {
      const pw = 670, ph = 452, y = 222;
      const artL = `<svg viewBox="0 0 602 250" aria-hidden="true"><defs>${navyGrad('ngTwN', P.navy3, P.navy)}${arrowDef('ngTwA', P.gold)}${goldGrad('ngTwG')}</defs>
          ${tank(20, 22, 0.58, 'ngTwC1')}
          <path d="M226 128H396" stroke="${P.gold}" stroke-width="4" fill="none" marker-end="url(#ngTwA)"/>
          ${[262, 300, 338].map((cx) => `<circle cx="${cx}" cy="128" r="9" fill="url(#ngTwG)" stroke="${P.goldDeep}" stroke-width="1.5"/>`).join('')}
          <rect x="408" y="62" width="168" height="134" rx="16" fill="${P.goldPale}" stroke="${P.gold}" stroke-width="2.5"/>
          <g transform="translate(460 74) scale(1)">${IC.policy.replace('<svg ', '<svg width="64" height="64" ')}</g>
        </svg>`;
      const artR = `<svg viewBox="0 0 602 250" aria-hidden="true"><defs>${arrowDef('ngTwA2', P.gold)}${arrowDef('ngTwN2', P.navy3)}</defs>
          ${tank(20, 22, 0.94, 'ngTwC2')}
          <g transform="translate(274 14)">${IC.bank.replace('<svg ', '<svg width="70" height="70" ')}</g>
          <path d="M344 50C430 50 492 46 492 74" stroke="${P.gold}" stroke-width="4" fill="none" marker-end="url(#ngTwA2)"/>
          <path d="M214 160C240 160 252 104 266 70" stroke="${P.navy3}" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round" fill="none" marker-end="url(#ngTwN2)"/>
          <rect x="408" y="82" width="168" height="134" rx="16" fill="${P.goldPale}" stroke="${P.gold}" stroke-width="2.5"/>
          <g transform="translate(460 94)">${IC.policy.replace('<svg ', '<svg width="64" height="64" ')}</g>
        </svg>`;
      const panel = (o) => `<div class="ng-card ng-way ng-f" ${AT(o.at)} style="left:${o.x}px;top:${y}px;width:${pw}px;height:${ph}px">
          <div style="display:grid;gap:8px">${ctx.t(o.cap, { tag: 'div', cls: 'ng-cap' })}${ctx.t(o.t, { tag: 'h3', cls: 'ng-ct serif', attrs: 'style="font-size:34px"' })}</div>
          <div style="position:relative">${o.art}${o.labels}</div>
          ${ctx.t(o.b, { tag: 'p', cls: 'ng-cb', attrs: 'style="font-size:21px"' })}
        </div>`;
      const lab = (k, l, t, extra) => ctx.t(k, { tag: 'div', cls: 'ng-al', attrs: `style="left:${l}px;top:${t}px;${extra || ''}"` });
      const labelsL = `${ctx.t('port', { tag: 'div', cls: 'ng-col-l', attrs: 'style="left:115px;top:196px;color:var(--cream);font-size:14px;width:150px"' })}${lab('every', 238, 66)}${lab('pol', 470, 206)}`;
      const labelsR = `${ctx.t('port', { tag: 'div', cls: 'ng-col-l', attrs: 'style="left:115px;top:196px;color:var(--cream);font-size:14px;width:150px"' })}${lab('lend', 282, 90)}${lab('intr', 228, 182, 'color:var(--navy-3)')}${lab('pol', 470, 226)}`;
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        ${panel({ at: 0, x: 110, cap: 'capL', t: 'tL', b: 'bL', art: artL, labels: labelsL })}
        ${panel({ at: 1, x: 820, cap: 'capR', t: 'tR', b: 'bR', art: artR, labels: labelsR })}
        ${line(ctx, 'close', 712, { at: 2 })}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 11. give boldly, keep the family whole ---------- */
  function gbox(ctx, o) {
    return `<div class="ng-card ng-gb${o.gold ? ' gold' : ''} ng-f" ${AT(o.at)} style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px">${ctx.t(o.t, { tag: 'h3', cls: 'ng-ct serif' })}${ctx.t(o.b, { tag: 'p', cls: 'ng-cb' })}</div>`;
  }
  EFA.screen('ng11', {
    title: 'Give boldly, keep the family whole',
    steps: 5,
    copy: {
      eb: 'For the causes you love',
      h: 'Give boldly. Keep the family whole.',
      lg: 'The gift', lgv: 'What you give',
      lf: 'The family', lfv: 'What they keep',
      t1: 'Appreciated asset', b1: 'Stock, real estate, or a business interest',
      t2: 'Charitable remainder trust', b2: 'An irrevocable trust you create',
      t3: 'The causes you choose', b3: 'Receive what remains at the end of the term',
      t4: 'You', b4: 'Receive income for life, or for up to 20 years, and use part of it to fund the policy',
      t5: 'Family trust and life insurance', b5: 'Replaces the gift’s value for the next generation',
      aR: 'The\nremainder', aI: 'Income', aP: 'Premiums',
      close: 'The biggest gifts wait on one quiet question: is this coming out of the kids’ inheritance? Answer it first.',
      src: 'Source: Internal Revenue Service, “Charitable Remainder Trusts.”',
      _notes: 'For donors, the biggest gifts often wait on one question: is this coming out of the kids’ inheritance?\n\n- An appreciated asset goes into a charitable remainder trust. The trust pays income to the donor for life or for a term of up to 20 years, and the remainder goes to the charities they choose.\n- Part of that income can fund life insurance owned by a family trust, replacing the gift’s value for the heirs.\n- The tax treatment of the gift is for the client’s CPA and attorney.\n\n- Ask: How many of your major gifts are waiting on that question right now?\nPAUSE'
    },
    render(ctx) {
      const r1 = 258, r2 = 530, bh = 140;
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        <div class="ng-lane ng-f" ${AT(0)} style="top:${r1 + 34}px"><span class="k">${ctx.t('lg')}</span><span class="r"></span>${ctx.t('lgv', { tag: 'span', cls: 'v' })}</div>
        <div class="ng-lane ng-f" ${AT(2)} style="top:${r2 + 34}px"><span class="k">${ctx.t('lf')}</span><span class="r"></span>${ctx.t('lfv', { tag: 'span', cls: 'v' })}</div>
        <svg class="ng-full" viewBox="0 0 1600 900" aria-hidden="true"><defs>${arrowDef('ngGvA', P.gold)}</defs>
          <path class="ng-f" ${AT(0)} d="M602 ${r1 + bh / 2}H672" stroke="${P.gold}" stroke-width="3.5" fill="none" marker-end="url(#ngGvA)"/>
          <path class="ng-f" ${AT(1)} d="M1022 ${r1 + bh / 2}H1152" stroke="${P.gold}" stroke-width="3.5" fill="none" marker-end="url(#ngGvA)"/>
          <path class="ng-f" ${AT(2)} d="M850 ${r1 + bh + 2}V${r2 - 8}" stroke="${P.gold}" stroke-width="3.5" fill="none" marker-end="url(#ngGvA)"/>
          <path class="ng-f" ${AT(3)} d="M1022 ${r2 + bh / 2}H1152" stroke="${P.gold}" stroke-width="3.5" fill="none" marker-end="url(#ngGvA)"/>
        </svg>
        ${gbox(ctx, { at: 0, x: 300, y: r1, w: 300, h: bh, t: 't1', b: 'b1' })}
        ${gbox(ctx, { at: 0, x: 680, y: r1, w: 340, h: bh, t: 't2', b: 'b2' })}
        ${gbox(ctx, { at: 1, x: 1160, y: r1, w: 330, h: bh, t: 't3', b: 'b3' })}
        ${gbox(ctx, { at: 2, x: 680, y: r2, w: 340, h: bh, t: 't4', b: 'b4' })}
        ${gbox(ctx, { at: 3, x: 1160, y: r2, w: 330, h: bh, gold: true, t: 't5', b: 'b5' })}
        ${ctx.t('aR', { tag: 'div', cls: 'ng-al ng-f', attrs: `style="left:1036px;top:${r1 + bh / 2 - 44}px;font-size:12.5px" ${AT(1)}` })}
        ${ctx.t('aI', { tag: 'div', cls: 'ng-al ng-f', attrs: `style="left:868px;top:${r1 + bh + 52}px" ${AT(2)}` })}
        ${ctx.t('aP', { tag: 'div', cls: 'ng-al ng-f', attrs: `style="left:1040px;top:${r2 + bh / 2 - 30}px;font-size:12.5px" ${AT(3)}` })}
        ${line(ctx, 'close', 716, { at: 4, cls: 'sm' })}
        ${src(ctx, 'src', 'bottom:48px')}
        ${disc(['notAdvice'])}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 12. everyone at the table wins ---------- */
  EFA.screen('ng12', {
    title: 'Everyone at the table wins',
    steps: 4,
    copy: {
      eb: 'Who this serves',
      h: 'Everyone at the table wins.',
      c1: 'Peace of mind', t1: 'The family', b1: 'The next generation, secured. A clear mind for the work you love.',
      c2: 'Capital at work', t2: 'The investment professional', b2: 'Client capital stays invested, clients commit with confidence, and we never compete for the assets you manage.',
      c3: 'Bolder giving', t3: 'The causes they support', b3: 'Donors who give boldly, because the family is already whole.',
      close: 'We’re not competing for the capital. We’re freeing it.',
      _notes: 'Everyone at the table is better off. We are not competing for the capital. We are freeing it.\n\n- Ask: Who in your circle is holding back on a deal, a dream, or a gift because the kids are not handled yet?\nPAUSE'
    },
    render(ctx) {
      const y = 250, w = 410, h = 392, xs = [110, 595, 1080];
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        ${card3(ctx, { at: 0, x: xs[0], y, w, h, icon: IC.people, lg: true, cap: 'c1', title: 't1', body: 'b1' })}
        ${card3(ctx, { at: 1, x: xs[1], y, w, h, icon: IC.chart, lg: true, cap: 'c2', title: 't2', body: 'b2' })}
        ${card3(ctx, { at: 2, x: xs[2], y, w, h, icon: IC.heart, lg: true, cap: 'c3', title: 't3', body: 'b3' })}
        ${line(ctx, 'close', 704, { at: 3 })}`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 13. how we work together ---------- */
  EFA.screen('ng13', {
    title: 'How we work together',
    steps: 4,
    copy: {
      eb: 'Partnership',
      h: 'How we work together.',
      n1: 'Your introduction', n2: 'Discovery', n3: 'Strategy design', n4: 'Collaborative review', n5: 'Implementation', n6: 'Report back\nto you',
      center: 'The relationship stays yours.',
      no: 'No.',
      t1: 'We don’t replace your advisors.', d1: 'A specialist resource that complements your team, never a competitor for the relationship.',
      t2: 'We don’t take the relationship.', d2: 'You remain the trusted advisor. We solve the specialist problem and hand the relationship back, intact.',
      t3: 'We don’t work in the dark.', d3: 'You are looped in at every stage, with a clear summary of what was done and why.',
      _notes: 'How we partner. The relationship stays theirs from the introduction to the report back.\n\n- Ask: What would a good first introduction look like for you?\nPAUSE'
    },
    render(ctx) {
      const cx = 430, cy = 500, r = 196, roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
      const nodes = roman.map((rn, i) => {
        const a = i * 60, [x, y] = A.pt(cx, cy, r, a);
        return `<g class="ng-rise" style="animation-delay:${0.15 + i * 0.12}s"><circle cx="${x}" cy="${y}" r="31" fill="${P.navy}" stroke="${P.gold}" stroke-width="2.5"/><text x="${x}" y="${y + 8}" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-weight="600" font-size="24" fill="${P.cream}">${rn}</text></g>`;
      }).join('');
      const pos = [[0, -66, 'c'], [64, -10, 'l'], [64, 10, 'l'], [0, 66, 'c'], [-64, 10, 'r'], [-64, -10, 'r']];
      const labels = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'].map((k, i) => {
        const [x, y] = A.pt(cx, cy, r, i * 60), [ox, oy, al] = pos[i];
        const left = al === 'c' ? x - 105 : al === 'l' ? x + ox - 28 : x + ox - 210 + 28;
        const top = y + oy - (al === 'c' ? (oy < 0 ? 10 : 12) : 12);
        return ctx.t(k, { tag: 'div', cls: 'ng-node-l', attrs: `style="left:${left}px;top:${top}px;text-align:${al === 'c' ? 'center' : al === 'l' ? 'left' : 'right'}"` });
      }).join('');
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        <svg class="ng-full" viewBox="0 0 1600 900" aria-hidden="true">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${P.mist2}" stroke-width="3"/>
          <path class="ng-draw" style="--l:${(2 * Math.PI * r).toFixed(1)}" d="M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}" fill="none" stroke="${P.gold}" stroke-width="3"/>
          ${nodes}
        </svg>
        ${labels}
        ${ctx.t('center', { tag: 'p', cls: 'ng-loop-c serif' })}
        <div class="ng-commit">${[1, 2, 3].map((i) => `<div class="ng-cm ng-f" ${AT(i)}><span class="no">${ctx.t('no')}</span><div>${ctx.t('t' + i, { tag: 'p', cls: 't serif' })}${ctx.t('d' + i, { tag: 'p', cls: 'd' })}</div></div>`).join('')}</div>`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 14. questions to sit with ---------- */
  EFA.screen('ng14', {
    title: 'Questions to sit with',
    steps: 4,
    copy: {
      eb: 'Before we go',
      h: 'Questions to sit with.',
      q1: 'If your family’s future were already secured, what would you build next?',
      q2: 'How much of what you own is really a reserve for the kids?',
      q3: 'Who in your circle is holding back on a deal, a dream, or a gift for the same reason?',
      q4: 'What would it mean to know the next generation starts from strength?',
      _notes: 'Leave them with these. One at a time, slowly.\n\nPAUSE after each question.'
    },
    render(ctx) {
      ctx.el.innerHTML = `${head(ctx, { eb: 'eb', h: 'h' })}
        <div class="ng-qs">${[1, 2, 3, 4].map((i) => `<div class="ng-qr ng-f" ${AT(i - 1)}><span class="n"><span class="num">${String(i).padStart(2, '0')}</span></span>${ctx.t('q' + i, { tag: 'p', cls: 'serif' })}</div>`).join('')}</div>`;
    },
    step(ctx, n) { reveal(ctx, n); }
  });

  /* ---------- 15. close ---------- */
  EFA.screen('ng15', {
    title: 'Secure the next generation first',
    copy: {
      eb: 'Edwards Financial & Associates',
      h: 'Secure the next generation first.',
      ld: 'Then go build.',
      name: 'Joshua Edwards, Consultant',
      firm: 'Edwards Financial & Associates',
      cred: 'Life & Annuities · Retirement Consulting · Estate Strategy',
      lic: 'CA Insurance License #0G52544 · NPN #13411537',
      phone: '619-916-9773',
      email: 'joshua@edwardsfinancialassociates.com',
      web: 'edwardsfinancialassociates.com',
      sched: 'Schedule a conversation',
      _notes: 'Close on the theme, then the next step: a short call, or an introduction to one family who could use this now.\n\n- Ask: Who comes to mind first?\nPAUSE'
    },
    render(ctx) {
      const a = (href, icon, key, blank) => `<a class="ng-a" href="${href}"${blank ? ' target="_blank" rel="noopener"' : ''}><span class="i">${icon}</span>${ctx.t(key)}</a>`;
      ctx.el.innerHTML = `<div class="ng-navy"></div>
        <svg class="ng-full" viewBox="0 0 1600 900" aria-hidden="true"><defs>${goldGrad('ngClG')}</defs>
          ${[[150, P.goldLt, 1.5, 0.3], [110, P.cream, 2, 0.26], [70, P.goldLt, 2.4, 0.7]].map(([r, c, w, o]) => `<path d="M${1360 - r} 444A${r} ${r} 0 0 1 ${1360 + r} 444" fill="none" stroke="${c}" stroke-width="${w}" opacity="${o}"/>`).join('')}
          <path d="M1326 444A34 34 0 0 1 1394 444Z" fill="url(#ngClG)"/>
          <rect x="1170" y="444" width="380" height="10" rx="3" fill="url(#ngClG)"/>
        </svg>
        <div class="ng-cl">
          ${ctx.t('eb', { tag: 'span', cls: 'eb' })}
          ${ctx.t('h', { tag: 'h1', cls: 'serif' })}
          <div class="rl"></div>
          ${ctx.t('ld', { tag: 'p', cls: 'ld serif' })}
        </div>
        <div class="ng-contact">
          <div class="ng-who">${ctx.t('name', { tag: 'p', cls: 'n serif' })}${ctx.t('firm', { tag: 'span', cls: 'f' })}${ctx.t('cred', { tag: 'span', cls: 'c' })}${ctx.t('lic', { tag: 'span', cls: 'l' })}</div>
          <div class="ng-links">
            ${a('tel:+16199169773', IC.phone, 'phone')}
            ${a('mailto:joshua@edwardsfinancialassociates.com?subject=Securing%20the%20next%20generation', IC.mail, 'email')}
            ${a('https://edwardsfinancialassociates.com', IC.web, 'web', true)}
            ${a('https://calendly.com/jedwards-finance/30min', IC.cal, 'sched', true)}
          </div>
        </div>`;
    }
  });
})();
