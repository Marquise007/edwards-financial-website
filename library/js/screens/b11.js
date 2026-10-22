/* b11: cash value life insurance lessons, policy loans, the Cash Value Reserve Strategy,
   the cost of waiting, and homeowners protection.
   Screen structure, sequence and math follow the plain-words specs; drawings and wording are new. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, F = EFA.fmt;
  EFA.engines = EFA.engines || {};
  const NEG = '#b3402e';

  /** prefix every selector with .stage so these rules win ties against app.css (loaded after injected styles) */
  function scope(css) {
    return css.replace(/(^|\})\s*([^{}@]+)\{/g, (m, b, sel) => `${b}\n  ${sel.split(',').map((x) => { x = x.trim(); return x.startsWith('.stage') ? x : '.stage ' + x; }).join(', ')} {`);
  }

  EFA.css('b11', scope(`
  .b11-head { position: absolute; left: 110px; right: 110px; top: 40px; display: grid; justify-items: center; gap: 18px; text-align: center; }
  .b11-head .st-h1 { font-size: 58px; }
  .b11-head .st-h2 { font-size: 46px; }
  .b11-sub { font: 600 20px/1.35 var(--f-body); color: var(--muted); margin: 0; }
  p.b11-disc { position: absolute; left: 110px; right: 330px; bottom: 16px; margin: 0; font: 400 12.5px/1.4 var(--f-body); color: var(--muted); }
  .stage .b11-f { transition: opacity .8s ease; }
  .stage .b11-f.is-off { transition: opacity .3s ease; }
  .b11-abs { position: absolute; }
  .b11-card { background: var(--paper); border: 1px solid var(--rule); border-radius: 16px; box-shadow: 0 14px 36px rgba(13,30,58,.08); box-sizing: border-box; }
  .b11-cap { position: absolute; transform: translateX(-50%); display: inline-flex; align-items: center; justify-content: center; text-align: center; min-width: 210px; padding: 12px 22px; box-sizing: border-box;
    background: var(--paper); border: 1px solid var(--rule); border-radius: 12px; box-shadow: 0 10px 24px rgba(13,30,58,.09); font: 700 22px/1.15 var(--f-body); color: var(--navy); white-space: nowrap; }
  .b11-cap.link { cursor: pointer; border-color: var(--gold); color: var(--gold-deep); }
  .b11-cap.link:hover { background: var(--gold); color: var(--navy); }
  .b11-ghost { background: transparent !important; color: var(--navy) !important; border-color: var(--mist-2) !important; }
  .b11-ghost:hover { border-color: var(--gold) !important; background: var(--gold-pale) !important; }
  .b11-link { background: none; border: 0; padding: 0; font: 700 19px/1.2 var(--f-body); color: var(--gold-deep); border-bottom: 2px solid rgba(184,151,46,.45); cursor: pointer; }
  .b11-link:hover { color: var(--navy); border-bottom-color: var(--gold); }
  .b11-num { font-family: var(--f-body); font-variant-numeric: lining-nums tabular-nums; }
  .b11-hidden { display: none !important; }

  /* modal dialogs inside the stage (no close icon; Esc does nothing) */
  .b11-modal { position: absolute; inset: 0; z-index: 31; background: rgba(13,30,58,.42); display: grid; place-items: center; animation: scr-in .2s ease both; }
  .b11-modal-in { width: 600px; background: var(--paper); border-radius: 18px; border: 1px solid var(--rule); box-shadow: 0 30px 80px rgba(8,20,42,.35); overflow: hidden; }
  .b11-modal-in.wide { width: 760px; }
  .b11-modal-h { background: var(--navy); color: var(--cream); font: 600 30px/1.15 var(--f-display); padding: 22px 30px; }
  .b11-modal-b { padding: 26px 30px 10px; display: grid; gap: 16px; font: 400 21px/1.5 var(--f-body); color: var(--navy); }
  .b11-modal-b p { margin: 0; }
  .b11-modal-f { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 30px 26px; }
  .b11-mrow { display: grid; grid-template-columns: 1fr 210px 44px; align-items: center; gap: 14px; }
  .b11-mrow > span { font: 600 20px/1.2 var(--f-body); color: var(--navy); }
  .b11-in { text-align: right; }
  .b11-ico { width: 40px; height: 40px; border-radius: 50%; border: 0; background: var(--navy); color: var(--gold-lt); display: grid; place-items: center; cursor: pointer; padding: 0; }
  .b11-ico:hover { background: var(--gold); color: var(--navy); }
  .b11-choose { display: grid; gap: 12px; }
  .b11-choose .st-pill { width: 100%; justify-content: flex-start; padding-left: 22px; font-size: 19px; }

  /* calculator forms */
  .b11-form { position: absolute; padding: 14px 30px; }
  .b11-row { display: grid; grid-template-columns: 1fr 200px; align-items: center; gap: 18px; min-height: 56px; border-bottom: 1px solid var(--line); }
  .b11-row:last-child { border-bottom: 0; }
  .b11-row > .lb { font: 500 22px/1.25 var(--f-body); color: var(--navy); }
  .b11-row .st-input { height: 44px; font-size: 21px; text-align: right; }
  .b11-row .st-field { gap: 0; }
  .b11-val { font: 700 23px/1 var(--f-body); color: var(--navy); text-align: right; font-variant-numeric: lining-nums tabular-nums; }

  /* premium schedule panel */
  .b11-prem { position: absolute; display: grid; grid-template-rows: auto 1fr; overflow: hidden; }
  .b11-prem-h { padding: 18px 24px 12px; font: 600 28px/1.15 var(--f-display); color: var(--navy); text-align: center; }
  .b11-prem-h small { display: block; margin-top: 6px; font: 500 15px/1.35 var(--f-body); color: var(--muted); }
  .b11-prem-s { overflow: auto; margin: 0 18px 18px; border: 1px solid var(--line); border-radius: 10px; }
  .b11-prem-s .st-table { font-size: 18px; }
  .b11-prem-s .st-table th { position: sticky; top: 0; z-index: 1; }
  .b11-prem-s .st-table td:first-child, .b11-prem-s .st-table th:first-child { text-align: center; width: 34%; }
  .b11-prem-s tbody tr { cursor: pointer; }
  .b11-prem-s tbody tr:hover td { background: var(--gold-pale) !important; }
  .b11-prem-s tbody tr.sel td { background: var(--gold-lt) !important; font-weight: 700; }

  /* benefit lists */
  .b11-bl { display: grid; gap: 6px; }
  .b11-bi { display: grid; grid-template-columns: 1fr 34px; align-items: center; gap: 10px; min-height: 44px; padding: 0 14px 0 18px; border-radius: 9px; box-sizing: border-box;
    border: 1px solid var(--mist-2); background: var(--paper); font: 700 20px/1.15 var(--f-body); color: rgba(13,30,58,.42); transition: background .5s ease, color .5s ease, border-color .5s ease; }
  .b11-bi .mk { width: 28px; height: 28px; display: grid; place-items: center; }
  .b11-bi.on { background: linear-gradient(100deg, ${P.goldPale} 0%, ${P.goldLt} 100%); border-color: ${P.gold}; color: var(--navy); }

  /* reserve diagrams (prs23, prs26) */
  .b11-band { transform-box: fill-box; transform-origin: 50% 100%; transform: scaleY(0); transition: transform .4s ease-out; }
  .b11-band.on { transform: scaleY(1); }
  .b11-coll { position: absolute; transform: translate(-50%, -50%); font: 700 21px/1 var(--f-body); letter-spacing: .06em; text-transform: uppercase; color: var(--navy); cursor: pointer; padding: 6px 10px; border-radius: 8px; transition: opacity .2s ease .4s; }
  .b11-coll:hover { background: rgba(255,253,248,.55); }
  .stage .b11-coll.is-off { transition: opacity .3s ease 0s; }
  .b11-albl { position: absolute; transform: translateX(-50%); text-align: center; font: 700 21px/1.2 var(--f-body); color: var(--navy); white-space: nowrap; }
  .b11-box { position: absolute; background: var(--mist); border: 1px solid var(--mist-2); border-radius: 16px; display: grid; grid-template-rows: auto 1fr; justify-items: center; padding: 12px 10px 8px; box-sizing: border-box; }
  .b11-box > span { font: 700 16px/1.1 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--navy3, #1d3863); }
  .b11-box svg { width: 100%; height: 100%; }
  .b11-bottom { position: absolute; left: 50%; transform: translateX(-50%); padding: 18px 34px; text-align: center; font: 700 23px/1.4 var(--f-body); color: var(--navy); }

  /* question hub (plif1) */
  .b11-qs { position: absolute; left: 110px; width: 960px; top: 50%; transform: translateY(-50%); display: grid; gap: 10px; }
  .b11-q { display: grid; grid-template-columns: 72px 1fr 44px; align-items: center; gap: 30px; text-align: left; background: transparent; border: 0; border-bottom: 1px solid var(--rule); padding: 26px 6px 26px 0; color: var(--navy); }
  .b11-q:last-child { border-bottom: 0; }
  .b11-q-n { width: 68px; height: 68px; border-radius: 50%; background: var(--navy); color: var(--gold-lt); display: grid; place-items: center; font: 600 28px/1 var(--f-body); transition: background .25s ease, color .25s ease; }
  .b11-q-t { font: 600 50px/1.06 var(--f-display); color: var(--navy); transition: color .25s ease; }
  .b11-q-go { color: var(--gold); transition: transform .25s ease; }
  .b11-q:hover .b11-q-n { background: var(--gold); color: var(--navy); }
  .b11-q:hover .b11-q-t { color: var(--gold-deep); }
  .b11-q:hover .b11-q-go { transform: translateX(8px); }
  .b11-tog { position: absolute; display: inline-flex; align-items: center; gap: 12px; padding: 8px 14px 8px 8px; border-radius: 999px; border: 1px solid var(--rule); background: var(--paper); cursor: pointer; font: 700 19px/1 var(--f-body); color: var(--navy); }
  .b11-tog .trk { width: 52px; height: 30px; border-radius: 999px; background: var(--mist-2); position: relative; transition: background .25s ease; }
  .b11-tog .trk::after { content: ""; position: absolute; left: 3px; top: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(13,30,58,.25); transition: transform .25s ease; }
  .b11-tog[aria-checked="true"] .trk { background: var(--gold); }
  .b11-tog[aria-checked="true"] .trk::after { transform: translateX(22px); }

  /* checklist cards (ttko2, ttkm1) and bullet rows */
  .b11-brow { display: grid; grid-template-columns: 48px 1fr; align-items: center; gap: 22px; }
  .b11-bul { width: 48px; height: 36px; display: grid; place-items: center; }
  .b11-bul > * { width: 100%; height: 100%; }
  `));

  /* ---------- small helpers ---------- */
  const fmtMoney = (v, dp) => F.money(v, { dp: dp || 0 });
  const fmtPct = (f, dp) => F.pct(f, dp == null ? 2 : dp);
  const num = (s) => `<span class="num">${s}</span>`;

  /** screen registration with automatic clean-up of this module's dialogs */
  const MODALS = new Set();
  function closeModals() { Array.from(MODALS).forEach((c) => c()); }
  function screen(id, d) {
    const leave = d.leave;
    d.leave = function (ctx) { closeModals(); if (leave) leave(ctx); };
    EFA.screen(id, d);
  }

  /** jump to another presentation and remember what to restore on the way back */
  const JR = {};
  function jumpWith(ctx, state, key, sid, o) {
    const pl = EFA.player, depth = pl.stack.length;
    JR[ctx.id] = { pres: ctx.pres, idx: pl.idx, depth, state };
    ctx.jump(key, sid, o);
    if (pl.stack.length === depth) delete JR[ctx.id]; // target not built yet: nothing to return from
  }
  function takeReturn(ctx) {
    const r = JR[ctx.id]; if (!r) return null;
    delete JR[ctx.id];
    const pl = EFA.player;
    return (r.pres === ctx.pres && r.idx === pl.idx && r.depth === pl.stack.length) ? r.state : null;
  }

  /** per-client values shared with other screens: EFA.lib.caseData with the original's case keys */
  const CD = () => (EFA.lib && EFA.lib.caseData) || null;
  const shared = {
    get: (k, d) => { const c = CD(); return c ? c.get(k, d) : d; },
    set: (k, v) => { const c = CD(); if (c && c.get(k) !== v) c.set(k, v); }
  };
  /** ctx.field bound to a shared case key (shows the shared value, saves changes back) */
  function sharedField(ctx, o, key) { const c = CD(); return c ? c.field(ctx, Object.assign({}, o, { key })) : ctx.field(o); }

  /** an in-stage dialog with no close icon (Esc does nothing); slide keys are held while it is open */
  function modal(ctx, o) {
    const m = document.createElement('div'); m.className = 'b11-modal';
    m.innerHTML = `<div class="b11-modal-in ${o.wide ? 'wide' : ''}" role="dialog" aria-modal="true">
        ${o.title ? `<div class="b11-modal-h serif">${ctx.t(o.title)}</div>` : ''}
        <div class="b11-modal-b">${o.html || ''}</div>
        <div class="b11-modal-f">${(o.buttons || []).map((b, i) => `<button type="button" class="st-pill ${b.primary ? '' : 'b11-ghost'}" data-mb="${i}">${ctx.t(b.key)}</button>`).join('')}</div>
      </div>`;
    ctx.el.appendChild(m);
    const hold = (e) => {
      if (!m.isConnected) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); return; }
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
      if (['ArrowLeft', 'ArrowRight', ' ', 'Spacebar', 'PageUp', 'PageDown', 'Backspace', 'Home', 'End'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); }
    };
    document.addEventListener('keydown', hold, true);
    const close = () => { document.removeEventListener('keydown', hold, true); m.remove(); MODALS.delete(close); };
    MODALS.add(close);
    (o.buttons || []).forEach((b, i) => m.querySelector(`[data-mb="${i}"]`).addEventListener('click', () => {
      if (EFA.edit.on) return;
      if (b.act && b.act(m) === false) return;
      close();
    }));
    EFA.numify(m); if (EFA.edit.on) EFA.edit.arm(m);
    m.close = close;
    return m;
  }

  /** local numeric inputs (dialog fields that are not remembered per client) */
  function fmtIn(type, v, dp) {
    if (v == null || !isFinite(v)) return '';
    if (type === 'money') return F.money(v, { dp: dp || 0 });
    if (type === 'pct') return F.pct(v, dp == null ? 2 : dp);
    return F.int(v);
  }
  function rawIn(type, v) { if (v == null || !isFinite(v)) return ''; return type === 'pct' ? String(+(v * 100).toFixed(4)) : String(+(+v).toFixed(2)); }
  function inBox(id, type, v, dp) { return `<input class="st-input b11-in" data-in="${id}" data-type="${type}" data-dp="${dp == null ? '' : dp}" inputmode="decimal" autocomplete="off" value="${EFA.util.esc(fmtIn(type, v, dp))}">`; }
  /** bind local inputs: get(id) -> value, set(id, value) on commit (blur or Enter) */
  function bindIns(root, get, set) {
    root.querySelectorAll('.b11-in').forEach((inp) => {
      const id = inp.dataset.in, type = inp.dataset.type, dp = inp.dataset.dp === '' ? undefined : +inp.dataset.dp;
      inp.addEventListener('focus', () => { inp.value = rawIn(type, get(id)); inp.select(); });
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
      inp.addEventListener('blur', () => {
        let v = F.parse(inp.value, type === 'pct');
        if (isFinite(v)) { if (type === 'int') v = Math.round(v); set(id, v); }
        inp.value = fmtIn(type, get(id), dp);
      });
    });
  }

  /* ---------- shared components (js/lib), reached through small guarded adapters ---------- */
  const LIB = {
    /** open the shared Documentation worksheet */
    worksheet(ctx, data) {
      const W = EFA.lib && EFA.lib.worksheet;
      if (W && W.open) { W.open(ctx, data); return true; }
      ctx.toast(ctx.text('loading')); return false;
    },
    /** the shared worksheet's own Documentation link (opens the sheet directly) */
    docButton(ctx, data, o) {
      const W = EFA.lib && EFA.lib.worksheet;
      return W && W.button ? W.button(ctx, Object.assign({ data, look: 'link' }, o || {})) : '';
    },
    /** shared historic inflation lookup; onUse gets the average as a fraction */
    inflation(ctx, onUse) {
      const I = EFA.lib && EFA.lib.inflation;
      if (I && I.open) { I.open(ctx, { onUse, instance: ctx.id }); return true; }
      ctx.toast(ctx.text('loading')); return false;
    },
    /** shared return-rate notice on the first focus of a field in a screen visit */
    guard(ctx, field) { const D = EFA.lib && EFA.lib.disclosure; if (D && D.guard) D.guard(ctx, field); },
    /** a disclaimer line: shared compliance topics first, then this screen's own words */
    disc(ctx, topics, key, style) {
      const D = EFA.lib && EFA.lib.disclosure;
      const std = D && topics && topics.length ? D.html(topics) : '';
      return `<p class="st-disclaimer b11-disc"${style ? ` style="${style}"` : ''}>${std}${key ? (std ? ' ' : '') + ctx.t(key) : ''}</p>`;
    },
    /** the shared dart bullet */
    dart(size) { const B = EFA.lib && EFA.lib.bullets; return B && B.dart ? B.dart({ size }) : ''; }
  };
  const LOADING = 'This part of the screen is still loading. Please try again in a moment.';

  /* ---------- the shared 12-item benefit list (one editable list used by plih1, prs24, prs25, ee1) ---------- */
  const BEN_SID = 'b11-benefits';
  const BENEFITS = [
    ['tdg', 'Tax-Deferred Growth'], ['tfd', 'Tax-Favored Distributions'], ['cr', 'Competitive Return'], ['hc', 'High Contributions'],
    ['ab', 'Additional Benefits'], ['co', 'Collateral Opportunities'], ['sh', 'Safety'], ['nlp', 'No-Loss Provisions'],
    ['glo', 'Guaranteed Loan Option'], ['ulp', 'Unstructured Loan Payments'], ['luac', 'Liquidity, Use and Control'], ['dc', 'Deductible Contributions']
  ];
  // Registered only so the shared labels can be edited once and show everywhere; it is not part of any presentation.
  EFA.screen(BEN_SID, { title: 'Shared benefit list (wording only)', copy: Object.fromEntries(BENEFITS), render() {} });
  const benLabel = (code, o) => EFA.cp(BEN_SID, code, o);
  const BEN_SETS = {
    policy: ['tdg', 'tfd', 'cr', 'hc', 'ab', 'co', 'sh', 'nlp', 'glo', 'ulp', 'luac'],
    house: ['tdg', 'tfd', 'hc', 'co', 'sh', 'dc'],
    savings: ['hc', 'co', 'sh', 'nlp', 'luac', 'tfd'],
    cd: ['hc', 'co', 'sh', 'nlp', 'tfd'],
    heloc: ['tdg', 'co'],
    margin: ['cr', 'hc', 'co', 'glo', 'luac'],
    qp: ['tdg', 'cr', 'ab', 'dc'],
    moneyMarket: ['tfd', 'hc', 'co', 'sh', 'nlp', 'luac']
  };
  EFA.engines.benefits = { codes: BENEFITS.map((b) => b[0]), defaults: Object.fromEntries(BENEFITS), sets: BEN_SETS, copyScreen: BEN_SID };
  const CHECK = `<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true"><circle cx="14" cy="14" r="13" fill="${P.navy}"/><path d="M8 14.5l4 4 8-9" fill="none" stroke="${P.goldLt}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const DASH = `<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true"><path d="M9 14h10" stroke="${P.mist2}" stroke-width="3" stroke-linecap="round"/></svg>`;
  /** one benefit list: codes in display order, the highlighted set */
  function benefitList(codes, onSet) {
    const on = new Set(onSet || []);
    return `<div class="b11-bl">${codes.map((c) => `<div class="b11-bi ${on.has(c) ? 'on' : ''}" data-ben="${c}">${benLabel(c)}<span class="mk">${on.has(c) ? CHECK : DASH}</span></div>`).join('')}</div>`;
  }
  function setBenefits(root, onSet) {
    const on = new Set(onSet || []);
    root.querySelectorAll('[data-ben]').forEach((n) => {
      const hit = on.has(n.dataset.ben);
      n.classList.toggle('on', hit);
      n.querySelector('.mk').innerHTML = hit ? CHECK : DASH;
    });
  }

  /* ---------- drawings (flat duotone, navy and gold on paper) ---------- */
  const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${P.shadow}"/>`;
  let gid = 0; const nid = (p) => `b11${p}${++gid}`;
  const r2 = (n) => Math.round(n * 100) / 100;

  const ART = {
    /** a large question mark made from a curled banknote, with a coin for its dot */
    questionMoney() {
      const id = nid('q'), cx = 220, cy = 214, R = 135;
      const [x0, y0] = A.pt(cx, cy, R, 292), [x1, y1] = A.pt(cx, cy, R, 165);
      const tx = -0.966, ty = 0.259;
      const d = `M${r2(x0)},${r2(y0)}A${R},${R} 0 1 1 ${r2(x1)},${r2(y1)}C${r2(x1 + tx * 46)},${r2(y1 + ty * 46)} 220,392 220,446L220,512`;
      const med = [330, 36, 112].map((a) => {
        const [x, y] = A.pt(cx, cy, R, a);
        return `<g transform="translate(${r2(x)} ${r2(y)})"><circle r="25" fill="${P.goldPale}" stroke="${P.goldDeep}" stroke-width="3"/><circle r="19" fill="none" stroke="${P.gold}" stroke-width="1.6" stroke-dasharray="2 3"/><text y="9" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="26" fill="${P.navy}">$</text></g>`;
      }).join('');
      return `<svg viewBox="0 0 440 740" aria-hidden="true" class="ill">
        <defs>
          <linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset=".5" stop-color="${P.gold}"/><stop offset="1" stop-color="${P.goldDeep}"/></linearGradient>
          <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9d79a"/><stop offset=".6" stop-color="${P.goldLt}"/><stop offset="1" stop-color="${P.gold}"/></linearGradient>
          <radialGradient id="${id}c" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#ecdca4"/><stop offset=".6" stop-color="${P.gold}"/><stop offset="1" stop-color="${P.goldDeep}"/></radialGradient>
        </defs>
        ${shadow(232, 712, 120, 14)}
        <g fill="none" stroke-linejoin="round" stroke-linecap="round">
          <path d="${d}" transform="translate(16 13)" stroke="${P.navy}" stroke-width="104"/>
          <path d="${d}" transform="translate(9 7)" stroke="${P.navy3}" stroke-width="104"/>
          <path d="${d}" stroke="url(#${id}a)" stroke-width="104"/>
          <path d="${d}" stroke="url(#${id}b)" stroke-width="88"/>
          <path d="${d}" stroke="${P.goldDeep}" stroke-opacity=".38" stroke-width="64"/>
          <path d="${d}" stroke="url(#${id}b)" stroke-width="59"/>
          <path d="${d}" stroke="${P.goldDeep}" stroke-opacity=".45" stroke-width="2" stroke-dasharray="1 8"/>
        </g>
        ${med}
        <g transform="translate(220 618)">
          <ellipse cx="9" cy="14" rx="66" ry="62" fill="${P.navy}"/>
          <ellipse cx="5" cy="8" rx="64" ry="61" fill="${P.navy3}"/>
          <circle r="62" fill="url(#${id}c)"/>
          <circle r="49" fill="none" stroke="${P.goldDeep}" stroke-width="3"/>
          <circle r="42" fill="none" stroke="${P.goldPale}" stroke-width="1.5" stroke-dasharray="2 4"/>
          <text y="20" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="58" fill="${P.navy}">$</text>
        </g>
      </svg>`;
    },
    /** a tall glass office tower (the insurance company) */
    tower() {
      let win = '';
      for (let r = 0; r < 11; r++) for (let c = 0; c < 4; c++) { const lit = (r * 3 + c * 2) % 7 === 1; win += `<rect x="${96 + c * 18}" y="${66 + r * 21}" width="10" height="13" rx="1.5" fill="${lit ? P.goldLt : P.steel}" opacity="${lit ? 1 : 0.45}"/>`; }
      let wing = '';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) wing += `<rect x="${194 + c * 18}" y="${184 + r * 21}" width="10" height="13" rx="1.5" fill="${(r + c) % 3 === 0 ? P.goldLt : P.mist}" opacity=".7"/>`;
      return `<svg viewBox="0 0 260 330" aria-hidden="true" class="ill">
        ${shadow(132, 318, 116, 9)}
        <rect x="30" y="214" width="56" height="94" fill="${P.navy3}"/>
        ${[0, 1, 2, 3].map((r) => `<rect x="40" y="${226 + r * 19}" width="36" height="9" fill="${P.mist}" opacity=".55"/>`).join('')}
        <rect x="180" y="166" width="54" height="142" fill="${P.navy4}"/>${wing}
        <path d="M84 308V52l46-24 46 24v256z" fill="${P.navy}"/>
        <path d="M130 28l46 24v256h-46z" fill="${P.navy2}"/>
        ${win}
        <path d="M88 132 172 84v30l-84 48z" fill="#fff" opacity=".07"/>
        <path d="M130 28V6" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/>
        <circle cx="130" cy="6" r="5" fill="${P.gold}"/>
        <path d="M112 50h36" stroke="${P.gold}" stroke-width="3" stroke-linecap="round"/>
        <rect x="116" y="272" width="28" height="36" rx="2" fill="${P.gold}"/>
        <path d="M130 272v36" stroke="${P.goldDeep}" stroke-width="2"/>
        <rect x="18" y="306" width="230" height="10" rx="3" fill="${P.navy}"/>
      </svg>`;
    },
    /** a person holding up a checklist and studying it */
    personDoc() {
      return `<svg viewBox="0 0 276 330" aria-hidden="true" class="ill">
        ${shadow(124, 318, 84, 9)}
        <path d="M100 236v74M140 236v74" stroke="${P.navy2}" stroke-width="22" stroke-linecap="round"/>
        <path d="M84 240c0-56 6-102 40-112h8c34 10 40 56 40 112z" fill="${P.navy}"/>
        <path d="M112 130l16 34 16-34z" fill="${P.paper}"/>
        <path d="M128 140l-6 10 6 34 6-34z" fill="${P.gold}"/>
        <path d="M92 152c-14 26-14 58-4 78" fill="none" stroke="${P.navy}" stroke-width="20" stroke-linecap="round"/>
        <path d="M164 150c14 6 26 -2 34 -20" fill="none" stroke="${P.navy}" stroke-width="20" stroke-linecap="round"/>
        <circle cx="126" cy="94" r="30" fill="#e8d7b8"/>
        <path d="M97 90c0-22 14-34 31-34s29 10 29 28c-10-8-28-12-60 6z" fill="${P.navy2}"/>
        <g transform="translate(14 -6) rotate(-9 196 96)">
          <rect x="150" y="34" width="96" height="124" rx="6" fill="${P.paper}" stroke="${P.navy}" stroke-width="4"/>
          <rect x="182" y="26" width="32" height="14" rx="4" fill="${P.navy3}"/>
          ${[0, 1, 2, 3].map((i) => `<path d="M162 ${64 + i * 24}l5 5 9-10" fill="none" stroke="${P.gold}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M184 ${66 + i * 24}h48" stroke="${P.mist2}" stroke-width="6" stroke-linecap="round"/>`).join('')}
        </g>
        <circle cx="200" cy="128" r="11" fill="#e8d7b8"/>
      </svg>`;
    },
    /** a small calculator (clickable icon) */
    calc() {
      return `<svg viewBox="0 0 60 76" aria-hidden="true"><rect x="2" y="2" width="56" height="72" rx="10" fill="${P.navy}"/><rect x="10" y="10" width="40" height="16" rx="3" fill="${P.goldPale}"/>
        ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${10 + c * 14}" y="${34 + r * 13}" width="11" height="9" rx="2" fill="${r === 2 && c === 2 ? P.gold : P.mist}"/>`).join('')).join('')}</svg>`;
    },
    /** protection shield; mode 'family' (death benefit badge) or 'home' */
    shield(mode) {
      const id = nid('s');
      const inner = mode === 'home'
        ? `<path d="M30 60 50 42l20 18v20H30z" fill="${P.cream}"/><rect x="45" y="66" width="10" height="14" fill="${P.gold}"/>`
        : `<circle cx="38" cy="48" r="7" fill="${P.cream}"/><circle cx="62" cy="48" r="7" fill="${P.cream}"/><circle cx="50" cy="60" r="5.5" fill="${P.goldLt}"/>
           <path d="M27 76c0-10 5-16 11-16s11 6 11 16zM51 76c0-10 5-16 11-16s11 6 11 16z" fill="${P.cream}"/><path d="M42 82c0-8 4-12 8-12s8 4 8 12z" fill="${P.goldLt}"/>`;
      return `<svg viewBox="0 0 100 112" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.navy4}"/><stop offset="1" stop-color="${P.navy}"/></linearGradient></defs>
        <path d="M50 4 94 18v34c0 30-20 50-44 58C26 102 6 82 6 52V18z" fill="url(#${id})" stroke="${P.gold}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M50 14 84 25v27c0 23-15 39-34 46" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="4"/>${inner}</svg>`;
    },
    /** rising chart with coins (investments) */
    chartUp() {
      return `<svg viewBox="0 0 200 140" aria-hidden="true">
        <path d="M18 122h170" stroke="${P.navy}" stroke-width="3" stroke-linecap="round"/>
        ${[[34, 30], [66, 48], [98, 62], [130, 82]].map(([x, h]) => `<rect x="${x - 12}" y="${120 - h}" width="24" height="${h}" rx="3" fill="${P.navy4}"/>`).join('')}
        <path d="M22 98 62 74l30 10 52-46" fill="none" stroke="${P.gold}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M134 32l16-2-2 16" fill="none" stroke="${P.gold}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        ${[[170, 104], [170, 86], [170, 68]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="17" ry="7" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="2"/>`).join('')}
        <circle cx="170" cy="40" r="15" fill="${P.goldPale}" stroke="${P.goldDeep}" stroke-width="2.5"/><text x="170" y="47" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="19" fill="${P.navy}">$</text>
      </svg>`;
    },
    /** a glass reserve tank with a money fill, growth arrow and a collateral band (animated by CSS) */
    tank(o) {
      o = o || {};
      const id = nid('t'), w = 220, x0 = 10, x1 = 230, ry = 22, top = 34, bot = 366, fillTop = 84, bandH = 124;
      const body = (yt) => `M${x0},${yt}V${bot}A${w / 2},${ry} 0 0 0 ${x1},${bot}V${yt}A${w / 2},${ry} 0 0 1 ${x0},${yt}Z`;
      return `<svg viewBox="0 0 240 400" aria-hidden="true" style="overflow:visible">
        <defs>
          <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="${P.mist2}"/><stop offset=".35" stop-color="#fff"/><stop offset="1" stop-color="${P.mist2}"/></linearGradient>
          <linearGradient id="${id}m" x1="0" x2="1"><stop offset="0" stop-color="${P.navy3}"/><stop offset=".4" stop-color="${P.navy4}"/><stop offset="1" stop-color="${P.navy2}"/></linearGradient>
          <linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="${P.gold}"/><stop offset=".4" stop-color="${P.goldLt}"/><stop offset="1" stop-color="${P.goldDeep}"/></linearGradient>
        </defs>
        ${shadow(120, bot + 26, 126, 12)}
        <path d="${body(top)}" fill="url(#${id}g)" opacity=".9"/>
        <path d="${body(fillTop)}" fill="url(#${id}m)"/>
        <ellipse cx="120" cy="${fillTop}" rx="${w / 2}" ry="${ry}" fill="${P.navy4}"/>
        <ellipse cx="120" cy="${fillTop}" rx="${w / 2 - 14}" ry="${ry - 6}" fill="#fff" opacity=".08"/>
        <g class="b11-band ${o.bandOn ? 'on' : ''}">
          <path d="${body(bot - bandH)}" fill="url(#${id}b)"/>
          <ellipse cx="120" cy="${bot - bandH}" rx="${w / 2}" ry="${ry}" fill="${P.goldLt}"/>
        </g>
        <g fill="none" stroke="${P.goldPale}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".9">
          <path d="M40 ${bot - 20}V${fillTop + 28}"/><path d="M28 ${fillTop + 44}l12-16 12 16"/>
        </g>
        <path d="M58 ${top + 14}V${bot - 10}" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".22"/>
        <path d="M206 ${top + 20}V${bot - 14}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".25"/>
        <path d="M${x0},${top}V${bot}A${w / 2},${ry} 0 0 0 ${x1},${bot}V${top}" fill="none" stroke="${P.navy}" stroke-width="5"/>
        <ellipse cx="120" cy="${top}" rx="${w / 2}" ry="${ry}" fill="none" stroke="${P.navy}" stroke-width="5"/>
      </svg>`;
    },
    /** block arrow, dir 1 = right, -1 = left */
    arrow(dir, fill) {
      const d = dir > 0 ? 'M6 36h196V10l92 50-92 50V84H6z' : 'M294 36H98V10L6 60l92 50V84h196z';
      return `<svg viewBox="0 0 300 120" aria-hidden="true"><path d="${d}" transform="translate(4 6)" fill="rgba(13,30,58,.12)"/><path d="${d}" fill="${fill}" stroke="${P.navy}" stroke-width="3" stroke-linejoin="round"/></svg>`;
    },
    /** thin gold arrow pointing left (the lien) */
    lien() {
      return `<svg viewBox="0 0 130 50" aria-hidden="true"><path d="M126 25H22" stroke="${P.gold}" stroke-width="10" stroke-linecap="round"/><path d="M34 6 6 25l28 19z" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="2" stroke-linejoin="round"/></svg>`;
    },
    arrowRight() { return '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'; },
    infl() { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 18l5-6 4 3 7-9"/><path d="M15 6h5v5"/></svg>'; }
  };
  EFA.b11art = ART;

  /* =====================================================================
     plif1: cash value life insurance question hub
     ===================================================================== */
  screen('plif1', {
    title: 'Cash value life insurance question hub',
    copy: {
      link1: 'How much coverage do I really need?',
      link2: 'What will that coverage cost me?',
      link3: 'How do I reach the money inside my policy?',
      tog: '101',
      _notes: 'Almost everyone arrives with the same three questions about cash value life insurance. Let the client pick where to start.\n\n- Ask: Which of these has been on your mind the most?\nPAUSE\n\n- Leave 101 on for the short introductory lessons; switch it off for the full versions.'
    },
    render(ctx) {
      const back = takeReturn(ctx);
      let is101 = back ? back.is101 : true;
      ctx.el.innerHTML = `
        <div class="b11-qs">
          ${[1, 2, 3].map((i) => `<button type="button" class="b11-q" data-q="${i}"><span class="b11-q-n">${i}</span>${ctx.t('link' + i, { cls: 'b11-q-t serif' })}<span class="b11-q-go">${ART.arrowRight()}</span></button>`).join('')}
        </div>
        <div class="b11-abs" style="left:1108px;top:74px;width:400px;height:673px">${ART.questionMoney()}</div>
        <div class="b11-tog" role="switch" tabindex="0" aria-checked="${is101}" style="right:110px;bottom:84px"><span class="trk"></span>${ctx.t('tog')}</div>`;
      const tog = ctx.$('.b11-tog');
      const flip = () => { is101 = !is101; tog.setAttribute('aria-checked', is101); };
      ctx.on(tog, 'click', flip);
      ctx.on(tog, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); flip(); } });
      const routes = {
        1: [['HMC101', 'hmc1'], ['NVSW', 'nvsw1']],
        2: [['TML101', 'tmlif1'], ['TMLI', 'tmli1']],
        // the original's 101 route ("atc1") is a thin wrapper outside UPL101's screen list; open UPL101 at its first screen
        3: [['UPL101', 'atc3'], ['UPL', 'upl1']]
      };
      ctx.on(ctx.$$('[data-q]'), 'click', (e, n) => { const r = routes[n.dataset.q][is101 ? 0 : 1]; jumpWith(ctx, { is101 }, r[0], r[1]); });
    }
  });

  /* =====================================================================
     plih1: policy vs. house benefit checklist
     ===================================================================== */
  function houseIcon() { return A.ill.house(); }
  screen('plih1', {
    title: 'Policy vs. house benefit checklist',
    copy: {
      left: 'Cash Value Life Insurance',
      right: 'Your House',
      disc: 'Policy features vary by contract and carrier. Home-sale exclusions and mortgage-interest deductions have limits and conditions.',
      _notes: 'Most families keep their biggest store of savings in the house. Hold it up against the same twelve-point yardstick as a cash value policy.\n\n- Ask: When you need money for an opportunity or an emergency, which of these two lets you reach it on your terms?\nPAUSE\n\n- Point out what the house cannot do: it cannot be reached without a lender\'s permission.'
    },
    render(ctx) {
      const codes = BENEFITS.map((b) => b[0]);
      const panel = (key, icon, set, x) => `
        <div class="b11-card b11-abs" style="left:${x}px;top:62px;width:620px;padding:18px 22px 22px">
          <div style="display:grid;grid-template-columns:64px 1fr;align-items:center;gap:16px;padding:0 4px 14px;border-bottom:2px solid ${P.gold};margin-bottom:16px">
            <div style="width:64px;height:58px;display:grid;place-items:center">${icon}</div>
            ${ctx.t(key, { tag: 'h2', cls: 'st-h3', attrs: 'style="font-size:34px"' })}
          </div>
          ${benefitList(codes, set)}
        </div>`;
      ctx.el.innerHTML = `
        ${panel('left', `<div style="width:54px;height:60px">${ART.shield('family')}</div>`, BEN_SETS.policy, 130)}
        ${panel('right', `<div style="width:64px;height:52px">${houseIcon()}</div>`, BEN_SETS.house, 850)}
        ${LIB.disc(ctx, ['guarantees', 'tax', 'loans'], 'disc')}`;
    }
  });

  /* =====================================================================
     prs23 + prs26: the reserve as collateral (bank lien / insurer lien)
     ===================================================================== */
  function reserveDiagram(ctx, kind) {
    const ins = kind === 'insurer';
    const loans = ins && ctx.variant === 'PolicyLoans';
    const cx1 = 262, cx2 = 640, cx3 = 978, cx4 = 1318, capTop = ins ? 562 : 600;
    const tankTop = ins ? 172 : 206;
    ctx.el.innerHTML = `
      <div class="b11-head"><h1 class="st-h1">${ctx.t(loans ? 'headLoans' : 'head')}</h1><hr class="st-rule"></div>
      <div class="b11-abs" style="left:${cx1 - 120}px;top:${tankTop}px;width:240px;height:400px">${ART.tank({ bandOn: false })}</div>
      ${ins ? `<div class="b11-abs" style="left:${cx1 - 152}px;top:${tankTop - 22}px;width:96px;height:108px;filter:drop-shadow(0 8px 14px rgba(13,30,58,.25))">${ART.shield('family')}</div>` : ''}
      <div class="b11-coll b11-f" data-coll="1" style="left:${cx1}px;top:${tankTop + 300}px">${ctx.t('coll')}</div>
      <div class="b11-cap" style="left:${cx1}px;top:${capTop}px">${ctx.t('cap1')}</div>
      <div class="b11-f inst" style="position:absolute;inset:0;pointer-events:none">
        <div class="b11-abs" style="left:${cx2 - 150}px;top:${ins ? 166 : 218}px;width:300px;height:${ins ? 380 : 340}px">${ins ? ART.tower() : A.ill.bank()}</div>
        <div class="b11-cap ${ins ? 'link' : ''}" ${ins ? 'data-ins="1"' : ''} style="left:${cx2}px;top:${capTop}px;pointer-events:auto">${ctx.t('cap2')}</div>
      </div>
      <div class="b11-f lien" style="position:absolute;inset:0;pointer-events:none">
        <div class="b11-albl" style="left:${(cx1 + cx2) / 2 + 8}px;top:${tankTop + 226}px;font-size:19px;color:${P.goldDeep};letter-spacing:.12em;text-transform:uppercase">${ctx.t('lien')}</div>
        <div class="b11-abs" style="left:${cx1 + 116}px;top:${tankTop + 256}px;width:${cx2 - cx1 - 236}px;height:46px">${ART.lien()}</div>
      </div>
      <div class="b11-f ar" style="position:absolute;inset:0;pointer-events:none">
        <div class="b11-albl" style="left:${cx3}px;top:${ins ? 236 : 270}px">${ctx.t('loan')}</div>
        <div class="b11-abs" style="left:${cx3 - 140}px;top:${ins ? 276 : 310}px;width:280px;height:112px">${ART.arrow(1, P.navy4)}</div>
      </div>
      <div class="b11-f al" style="position:absolute;inset:0;pointer-events:none">
        <div class="b11-abs" style="left:${cx3 - 140}px;top:${ins ? 408 : 442}px;width:280px;height:112px">${ART.arrow(-1, P.steel)}</div>
        <div class="b11-albl" style="left:${cx3}px;top:${ins ? 528 : 562}px">${ctx.t('pay')}</div>
      </div>
      <div class="b11-box" style="left:${cx4 - 135}px;top:${ins ? 152 : 186}px;width:270px;height:192px">${ctx.t('buy')}<div style="width:200px;height:120px;display:grid;place-items:center">${A.ill.car()}</div></div>
      <div class="b11-box" style="left:${cx4 - 135}px;top:${ins ? 356 : 390}px;width:270px;height:192px">${ctx.t('inv')}<div style="width:200px;height:132px">${ART.chartUp()}</div></div>
      <div class="b11-cap link b11-f uc" data-uc="1" style="left:${cx4}px;top:${capTop}px">${ctx.t('cap4')}</div>
      <div class="b11-card b11-bottom b11-f bot" style="top:${ins ? (loans ? 646 : 626) : 690}px;width:${ins ? 1392 : 1120}px;${ins ? 'font-size:20.5px;padding:14px 34px' : ''}">${ctx.t('bottom')}</div>
      ${ins && !loans ? `<div class="b11-f btns" style="position:absolute;left:0;right:0;top:744px;display:flex;justify-content:center;gap:28px">
          <button type="button" class="st-pill" data-go="opp">${ctx.t('btnOpp')}</button>
          <button type="button" class="st-pill b11-ghost" data-go="tml">${ctx.t('btnTml')}</button></div>` : ''}
      ${LIB.disc(ctx, ins ? ['loans', 'tax', 'guarantees'] : [], 'disc')}`;
    const st = ctx._rs = { right: true, left: true, coll: true, hidden: false };
    const back = takeReturn(ctx);
    if (back) Object.assign(st, back);
    ctx.on(ctx.$('[data-coll]'), 'click', () => { st.coll = false; applyReserve(ctx, kind, ctx.step); });
    ctx.on(ctx.$('[data-uc]'), 'click', () => {
      if (ctx.step < (ins ? 2 : 3)) return;
      st.hidden = !st.hidden; st.right = !st.hidden; st.left = !st.hidden; st.coll = st.right;
      applyReserve(ctx, kind, ctx.step);
    });
    const snap = () => ({ right: st.right, left: st.left, coll: st.coll, hidden: st.hidden });
    if (ins) {
      ctx.on(ctx.$('[data-ins]'), 'click', () => jumpWith(ctx, snap(), 'PC', 'pc1'));
      ctx.on(ctx.$$('[data-go]'), 'click', (e, n) => {
        if (n.dataset.go === 'opp') jumpWith(ctx, snap(), 'UPL', 'upl1'); else jumpWith(ctx, snap(), 'TMLI', 'tmli1');
      });
    }
  }
  function applyReserve(ctx, kind, n) {
    const ins = kind === 'insurer', st = ctx._rs;
    const s0 = ins ? 1 : 2; // step where the lien, collateral and loan arrow appear
    if (ins) ctx.show('.inst', true); else ctx.show('.inst', n >= 1);
    const coll = n >= s0 && st.coll && !st.hidden;
    ctx.show('.lien', coll);
    ctx.$('.b11-band').classList.toggle('on', coll);
    ctx.show('[data-coll]', coll);
    ctx.show('.ar', n >= s0 && st.right);
    ctx.show('.al', n >= s0 + 1 && st.left);
    ctx.show('.uc', n >= s0 + 1);
    ctx.show('.bot', n >= s0 + 2);
    if (ctx.$('.btns')) ctx.show('.btns', n >= s0 + 2);
  }
  screen('prs23', {
    title: 'The strategy in action: reserve as collateral',
    steps: 5,
    copy: {
      head: 'The Strategy in Action',
      lien: 'Lien',
      coll: 'Collateral',
      cap1: 'Your Reserve Account',
      cap2: 'Financial Institution',
      loan: 'Amortizing Loan',
      pay: 'Scheduled Payments\nPrincipal + Interest',
      buy: 'Major Purchases',
      inv: 'Investments',
      cap4: 'Use and Control',
      bottom: 'The money you pledge stays in your account, where it can keep compounding for you the entire time it secures the loan.',
      disc: 'Concept illustration only. Whether pledged money keeps earning, and the terms of any loan, depend on the account and the lender. Loans carry interest and must be repaid on the lender\'s schedule.',
      _notes: 'Your reserve keeps growing. The institution places a lien on part of it, lends you the money, and you repay on its schedule.\n\n- Click through: the institution, the lien and the loan, then the payments.\n- Click Collateral to show the lien released once the loan is repaid.\n- Ask: While that money secured the loan, did it ever stop working for you?\nPAUSE'
    },
    render(ctx) { reserveDiagram(ctx, 'bank'); },
    step(ctx, n) { if (n === 0) { ctx._rs.coll = true; } applyReserve(ctx, 'bank', n); }
  });
  screen('prs26', {
    title: 'Cash value policy as the reserve',
    steps: 4,
    copy: {
      head: 'Cash Value Life Insurance as Your Reserve',
      headLoans: 'Policy Loans',
      lien: 'Lien',
      coll: 'Collateral',
      cap1: 'Policy Cash Value',
      cap2: 'Insurance Company',
      loan: 'Interest-Only Loan',
      pay: 'Non-Structured Payment',
      buy: 'Major Purchases',
      inv: 'Investments',
      cap4: 'Use and Control',
      bottom: 'Designed and used properly, a cash value policy can offer steady growth, collateral for borrowing, a contractual right to a policy loan, growth that is not taxed year by year, and a death benefit that is income-tax-free. Riders can add even more.',
      btnOpp: 'Policy Loan Opportunities',
      btnTml: 'Ten-Minute Life Insurance Lesson',
      disc: 'Policy loans accrue interest, and unpaid interest is generally added to the loan; a lapse with a loan outstanding can create a taxable event.',
      _notes: 'Same strategy, a different lender. Here the insurance company holds the lien on part of your cash value, lends on an interest-only basis, and lets you decide when and how to repay. Your family stays protected the whole time.\n\n- Click Insurance Company to show the position of choice.\n- Ask: If you could set your own repayment schedule, how would that change the way you pay for big purchases?\nPAUSE'
    },
    render(ctx) { reserveDiagram(ctx, 'insurer'); },
    step(ctx, n, dir) { if (n === 0 && dir !== 0) { ctx._rs.coll = true; } applyReserve(ctx, 'insurer', n); }
  });

  /* =====================================================================
     engines (exposed on EFA.engines for reuse)
     ===================================================================== */
  /** IRR per period: Newton-Raphson as in the original (|NPV| <= 0.00001, at most 50,000 iterations), bisection as a safety net.
      Returns 0 when there are fewer than 2 flows, the first flow is positive, nothing solves, or r > 100% per period. */
  function irr(flows, guess) {
    if (!flows || flows.length < 2 || flows[0] > 0) return 0;
    const f = (r) => { let v = 0, d = 0; for (let j = 0; j < flows.length; j++) { const p = Math.pow(1 + r, j); v += flows[j] / p; d -= j * flows[j] / (p * (1 + r)); } return [v, d]; };
    let r = guess == null ? 0.1 : guess;
    for (let i = 0; i < 50000; i++) {
      const [v, d] = f(r);
      if (!isFinite(v) || !isFinite(d)) break;
      if (Math.abs(v) <= 1e-5) return r > 1 ? 0 : r;
      if (d === 0) break;
      let nr = r - v / d;
      if (nr <= -0.999) nr = (r - 0.999) / 2;
      r = nr;
    }
    // safety net: bisection between a finite lower bound and 100% per period
    const npv = (x) => f(x)[0];
    const hi0 = 1, fhi = npv(hi0);
    for (const lo0 of [-0.5, -0.8, -0.95]) {
      let lo = lo0, hi = hi0, flo = npv(lo);
      if (!isFinite(flo) || !(flo * fhi < 0)) continue;
      for (let i = 0; i < 300; i++) { const mid = (lo + hi) / 2, fm = npv(mid); if (Math.abs(fm) <= 1e-7) return mid; if (flo * fm < 0) hi = mid; else { lo = mid; flo = fm; } }
      return (lo + hi) / 2;
    }
    return 0;
  }
  EFA.engines.policyIrr = irr;

  /** fill a premium schedule from a starting period (1-based): amount, growing by inflate each period, for n periods */
  function fillPremiums(arr, start, amount, periods, inflate) {
    let v = amount, i = Math.max(0, start - 1);
    const end = i + Math.max(1, Math.round(periods));
    if (i >= arr.length) return arr;
    do { arr[i] = v; v *= 1 + inflate; i++; } while (i < arr.length && i < end);
    return arr;
  }
  EFA.engines.fillPremiums = fillPremiums;

  /** monthly amortizing mortgage with tax savings and running opportunity-cost columns (plia1) */
  function mortgageSchedule(A, R, Y, s, t) {
    const r = R / 12, n = Math.round(12 * Y);
    const P = n <= 0 ? 0 : (r === 0 ? A / n : A * r / (1 - Math.pow(1 + r, -n)));
    const g = 1 + s / 12, rows = [];
    let beg = A, ci = 0, cpr = 0, cts = 0, ocP = 0, ocI = 0, ocT = 0;
    for (let m = 0; m < n; m++) {
      const it = r * beg, pr = P - it, end = beg - pr, ts = it * t;
      ci += it; cpr += pr; cts += ts;
      ocP = pr + ocP * g; ocI = it + ocI * g; ocT = ts + ocT * g;
      rows.push({ m: m + 1, beg, pmt: P, it, pr, end, ci, cpr, ts, cts, ocP, ocI, ocT, wt: ocP + ocI - ocT, year: Math.floor(m / 12) + 1 });
      beg = end;
    }
    return { P, n, rows };
  }
  /** longer mortgage plus policy vs. shorter mortgage. o: {Y1, Y2, A1, A2, R1, R2, s, t, premiums[], hcv}; rates as fractions */
  function mortgagePolicyAlt(o) {
    if (!(o.Y2 >= 1) || !(o.Y1 >= o.Y2) || !o.premiums || o.premiums.length < o.Y2) return { ok: false };
    const L1 = mortgageSchedule(o.A1, o.R1, o.Y1, o.s, o.t), L2 = mortgageSchedule(o.A2, o.R2, o.Y2, o.s, o.t);
    const M = 12 * o.Y2, minN = Math.min(L1.n, L2.n), g = 1 + o.s / 12, grid = [];
    let cumTax = 0, cumOcTax = 0, cumPrem = 0, cumOcPrem = 0;
    for (let m = 0; m < M; m++) {
      const d = L1.rows[m].ts - L2.rows[m].ts; cumTax += d;
      const oc = d * Math.pow(g, minN - m - 1) - d; cumOcTax += oc;
      const p = o.premiums[Math.floor(m / 12)] / 12; cumPrem += p;
      const ocp = p * Math.pow(g, minN - m - 1) - p; cumOcPrem += ocp;
      grid.push({ m: m + 1, d, cumTax, oc, cumOcTax, p, cumPrem, ocp, cumOcPrem, year: Math.floor(m / 12) + 1 });
    }
    const loanBalance = L1.rows[M - 1].end;
    const parts = [o.hcv || 0, cumTax, cumOcTax, cumPrem, cumOcPrem];
    const total = (stage) => parts.slice(0, Math.max(0, Math.min(4, stage)) + 1).reduce((a, b) => a + b, 0);
    return { ok: true, L1, L2, grid, P1: L1.P, P2: L2.P, monthlyPremium: L2.P - L1.P, taxSavings: cumTax, ocTaxes: cumOcTax, insuranceCost: cumPrem, ocInsurance: cumOcPrem, loanBalance, total, difference: (stage) => total(stage) - loanBalance };
  }
  EFA.engines.mortgagePolicyAlt = mortgagePolicyAlt;

  /** cost of waiting to save (proc1): deposits at the start of each year, growth at the end */
  function procrastination(o) {
    const years = Math.round(o.retAge - o.age + 1);
    const rows = { today: [], wait: [] };
    let B = o.bal, W = o.bal, begT = 0, gT = 0, begW = 0, gW = 0;
    for (let i = 0; i < years; i++) {
      B += o.ann; begT = B; gT = B * o.ret; B += gT;
      rows.today.push({ age: o.age + i, dep: o.ann, beg: begT, int: gT, end: B, year: i + 1 });
      const dep = i < o.delay ? 0 : o.ann;
      W += dep; begW = W; gW = W * o.ret; W += gW;
      rows.wait.push({ age: o.age + i, dep, beg: begW, int: gW, end: W, year: i + 1 });
    }
    return { years: Math.max(0, years), balToday: begT, balWait: begW, incToday: gT, incWait: gW, rows };
  }
  EFA.engines.procrastination = procrastination;

  /* ---------- premium schedule panel and entry dialog (pli1, plia1) ---------- */
  function premiumRows(prem) {
    return prem.map((v, i) => `<tr data-p="${i + 1}"><td>${i + 1}</td><td>${F.money(v)}</td></tr>`).join('');
  }
  function premiumPanel(ctx, o) {
    return `<div class="b11-card b11-prem ${o.cls || ''}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px">
        <div class="b11-prem-h serif">${ctx.t('pTitle')}${ctx.t('pHint', { tag: 'small' })}</div>
        <div class="b11-prem-s"><table class="st-table"><thead><tr><th>${ctx.t('thPeriod')}</th><th>${ctx.t('thPrem')}</th></tr></thead><tbody></tbody></table></div>
      </div>`;
  }
  /** data-entry dialog: o {start, amount, periods, inflate, onEnter(st)} */
  function entryDialog(ctx, o) {
    const st = { amount: o.amount, periods: o.periods, inflate: o.inflate };
    const m = modal(ctx, {
      title: 'dTitle',
      html: `<p class="b11-sub">${ctx.t('dStart')} ${num(o.start)}</p>
        <div class="b11-mrow">${ctx.t('dAmt')}${inBox('amount', 'money', st.amount, 2)}<span></span></div>
        <div class="b11-mrow">${ctx.t('dPer')}${inBox('periods', 'int', st.periods)}<span></span></div>
        <div class="b11-mrow">${ctx.t('dInf')}${inBox('inflate', 'pct', st.inflate)}<button type="button" class="b11-ico" data-inf="1" aria-label="Inflation history">${ART.infl()}</button></div>`,
      buttons: [{ key: 'bCancel' }, { key: 'bEnter', primary: true, act: () => { o.onEnter(st); } }]
    });
    bindIns(m, (id) => st[id], (id, v) => {
      if (id === 'periods') st.periods = Math.max(1, Math.round(v));
      else if (id === 'amount') st.amount = Math.max(0, v);
      else st.inflate = v;
    });
    m.querySelector('[data-inf]').addEventListener('click', () => {
      if (EFA.edit.on) return;
      LIB.inflation(ctx, (avg) => { st.inflate = avg; m.querySelector('[data-in="inflate"]').value = fmtIn('pct', avg); });
    });
    setTimeout(() => { const i = m.querySelector('[data-in="amount"]'); if (i && !EFA.edit.on) i.focus(); }, 80);
    return m;
  }
  const PREM_COPY = {
    pTitle: 'Enter Your Premiums', pHint: 'Click any period to fill it and the periods after it.', thPeriod: 'Period', thPrem: 'Premium',
    dTitle: 'Premium Entry', dStart: 'Starting at period', dAmt: 'Amount', dPer: '# of Periods', dInf: 'Inflate Rate', bCancel: 'Cancel', bEnter: 'Enter'
  };

  EFA.css('b11-calc', scope(`
  .b11-row.seg { grid-template-columns: auto 1fr; }
  .b11-row.seg .st-field { justify-items: end; }
  .b11-row.seg .st-seg-b { font-size: 16px; padding: 8px 13px; }
  .b11-res { position: absolute; display: grid; gap: 10px; }
  .b11-res-h, .b11-res-r { display: grid; grid-template-columns: 60% 20% 20%; align-items: center; }
  .b11-res-h .cell { justify-self: center; padding: 9px 18px; border-radius: 999px; background: var(--mist); font: 700 14px/1 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--navy); }
  .b11-res-b { padding: 6px 0; }
  .b11-res-r { min-height: 70px; padding: 0 28px; border-bottom: 1px solid var(--line); }
  .b11-res-r:last-child { border-bottom: 0; }
  .b11-res-r .lb { font: 600 23px/1.25 var(--f-body); color: var(--navy); }
  .b11-res-r .v { text-align: center; font: 700 32px/1 var(--f-body); color: var(--navy); font-variant-numeric: lining-nums tabular-nums; }
  .b11-res-r .v.te { color: var(--gold-deep); }
  .b11-err { padding: 26px 30px; text-align: center; font: 700 22px/1.4 var(--f-body); color: var(--navy); border: 3px solid ${NEG}; }
  .b11-calcbtn { min-height: 38px !important; padding: 6px 18px !important; font-size: 16px !important; justify-self: end; }
  .b11-sumrow > .lb { font-weight: 700; }
  .b11-divider { width: 240px; height: 2px; background: var(--mist-2); margin: 8px auto; }
  .b11-tight .b11-row { min-height: 48px; }
  .b11-tight .b11-row .st-input { height: 40px; }
  .b11-form.slide { transition: top .6s cubic-bezier(.4,.1,.2,1); }
  .b11-slide { transition: top .6s cubic-bezier(.4,.1,.2,1); }
  .b11-icon-btn { display: inline-grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; border: 0; background: var(--navy); color: var(--gold-lt); margin-left: 12px; vertical-align: middle; cursor: pointer; padding: 0; }
  .b11-icon-btn:hover { background: var(--gold); color: var(--navy); }
  .b11-bar { position: absolute; display: flex; justify-content: space-evenly; align-items: center; }
  .b11-results { position: absolute; padding: 10px 30px; }
  .b11-rrow { display: grid; grid-template-columns: 1fr 230px; align-items: center; gap: 24px; min-height: 64px; border-bottom: 1px solid var(--line); }
  .b11-rrow:last-child { border-bottom: 0; }
  .b11-rrow .lb { text-align: right; font: 500 23px/1.3 var(--f-body); color: var(--navy); }
  .b11-rrow .v { text-align: right; font: 700 30px/1 var(--f-body); color: var(--navy); font-variant-numeric: lining-nums tabular-nums; }
  .b11-rrow.key .v, .b11-rrow.key .lb { color: var(--gold-deep); font-weight: 700; }
  .b11-inline { display: inline-block; width: 92px !important; height: 42px !important; margin: 0 6px; font-size: 21px !important; text-align: center !important; vertical-align: middle; }
  `));

  /* =====================================================================
     pli1: policy benefit rate of return (IRR) calculator
     ===================================================================== */
  screen('pli1', {
    title: 'Policy benefit rate of return',
    copy: Object.assign({
      head: 'What Is Your Policy Really Earning?',
      lFreq: 'Premium Frequency', fAnn: 'Annually', fSemi: 'Semiannually', fQtr: 'Quarterly', fMon: 'Monthly',
      lYears: 'Number of Years', lTax: 'Tax Bracket', lCv: 'Ending Cash Value', lDb: 'Ending Death Benefit',
      btnEnter: 'Enter Premiums', btnHide: 'Hide Premiums',
      hAnn: 'Annual Return', hTe: 'Taxable Equivalent',
      r1: 'Cash value return over', r2: 'Death benefit return over', yrs: 'years',
      err: 'Enter at least one premium, plus both ending values, to see the returns.',
      disc: 'Ending values should come from a current carrier illustration; values that are not guaranteed are not promises. Taxable equivalent is the pre-tax return a taxable account would need to match; cash value growth is tax-deferred.',
      loading: LOADING,
      _notes: 'Most people judge a policy by its premium. This shows what the premiums actually earn: once as living cash value, and once as the benefit your family receives.\n\n- Enter the premiums from the illustration, then hide the table to show the returns.\n- Ask: What would a taxable account have to earn, every year, to leave your family this much?\nPAUSE'
    }, PREM_COPY),
    render(ctx) {
      const K = [1, 2, 4, 12];
      const S = ctx._p = { prem: null, entered: false, opened: false, open: false, amount: 500, inflate: 0, prev: null };
      ctx.el.innerHTML = `
        <div class="b11-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b11-card b11-form inp b11-slide" style="left:370px;top:262px;width:860px">
          <div class="b11-row seg">${ctx.t('lFreq', { cls: 'lb' })}${ctx.choice({ id: 'mode', value: 0, options: [{ value: 0, key: 'fAnn' }, { value: 1, key: 'fSemi' }, { value: 2, key: 'fQtr' }, { value: 3, key: 'fMon' }] })}</div>
          <div class="b11-row">${ctx.t('lYears', { cls: 'lb' })}${ctx.field({ id: 'years', type: 'int', value: 20, min: 1, max: 100 })}</div>
          <div class="b11-row">${ctx.t('lTax', { cls: 'lb' })}${sharedField(ctx, { id: 'tax', type: 'pct', value: 0.25, min: 0, max: 0.99, dp: 0 }, 'retirement_tax_bracket')}</div>
          <div class="b11-row">${ctx.t('lCv', { cls: 'lb' })}${ctx.field({ id: 'cv', type: 'money', value: 100000, min: 0 })}</div>
          <div class="b11-row">${ctx.t('lDb', { cls: 'lb' })}${ctx.field({ id: 'db', type: 'money', value: 500000, min: 0 })}</div>
        </div>
        <button type="button" class="st-pill tog b11-slide" style="position:absolute;left:370px;top:594px">${ctx.t('btnEnter', { cls: 'tE' })}${ctx.t('btnHide', { cls: 'tH b11-hidden' })}</button>
        <div class="b11-res b11-hidden" style="left:200px;top:584px;width:1200px">
          <div class="b11-res-h"><span></span>${ctx.t('hAnn', { cls: 'cell' })}${ctx.t('hTe', { cls: 'cell' })}</div>
          <div class="b11-card b11-res-b ok">
            <div class="b11-res-r"><span class="lb">${ctx.t('r1')} <span class="num yrs"></span> ${ctx.t('yrs')}</span><span class="v" data-v="cvA"></span><span class="v te" data-v="cvT"></span></div>
            <div class="b11-res-r"><span class="lb">${ctx.t('r2')} <span class="num yrs"></span> ${ctx.t('yrs')}</span><span class="v" data-v="dbA"></span><span class="v te" data-v="dbT"></span></div>
          </div>
          <div class="b11-card b11-err b11-hidden">${ctx.t('err')}</div>
        </div>
        ${premiumPanel(ctx, { x: 680, y: 150, w: 540, h: 650, cls: 'b11-hidden' })}
        ${LIB.disc(ctx, ['hypothetical', 'tax', 'loans'], 'disc')}`;
      const panel = ctx.$('.b11-prem'), tbody = ctx.$('.b11-prem tbody');
      const total = () => { const v = ctx.values(); return Math.max(1, Math.round(v.years)) * (K[v.mode] || 1); };
      const drawTable = () => {
        tbody.innerHTML = premiumRows(S.prem);
        ctx.on(Array.from(tbody.querySelectorAll('tr')), 'click', (e, tr) => {
          tbody.querySelectorAll('tr.sel').forEach((x) => x.classList.remove('sel')); tr.classList.add('sel');
          const start = +tr.dataset.p;
          entryDialog(ctx, { start, amount: S.amount, periods: total(), inflate: S.inflate, onEnter: (st) => {
            S.amount = st.amount; S.inflate = st.inflate;
            fillPremiums(S.prem, start, st.amount, st.periods, st.inflate);
            S.entered = true; drawTable(); compute();
          } });
        });
      };
      const view = () => {
        ctx.$('.inp').classList.toggle('b11-hidden', S.open);
        panel.classList.toggle('b11-hidden', !S.open);
        ctx.$('.tE').classList.toggle('b11-hidden', S.open); ctx.$('.tH').classList.toggle('b11-hidden', !S.open);
        ctx.$('.b11-res').classList.toggle('b11-hidden', !S.opened || S.open);
        ctx.$('.inp').style.top = S.opened ? '168px' : '262px';
        ctx.$('.tog').style.top = S.opened ? '500px' : '594px';
      };
      const compute = () => {
        const v = ctx.values(), k = K[v.mode] || 1, n = Math.max(1, Math.round(v.years));
        ctx.$$('.yrs').forEach((x) => { x.textContent = F.int(n); });
        const bad = !S.entered || !S.prem || !S.prem.some((p) => p > 0) || !(v.cv > 0) || !(v.db > 0);
        ctx.$('.b11-res .ok').classList.toggle('b11-hidden', bad);
        ctx.$('.b11-err').classList.toggle('b11-hidden', !bad);
        if (bad) return;
        const out = (X) => {
          const r = irr(S.prem.map((p) => -p).concat([X]), Math.pow(1.1, 1 / k) - 1);
          const a = Math.pow(1 + r, k) - 1;
          const te = v.tax > 0 ? a / (1 - v.tax) : 0; // original shows 0 when the bracket is 0
          return [isFinite(a) ? a : 0, isFinite(te) ? te : 0];
        };
        const [ca, ct] = out(v.cv), [da, dt] = out(v.db);
        ctx.$('[data-v="cvA"]').textContent = fmtPct(ca, 2); ctx.$('[data-v="cvT"]').textContent = fmtPct(ct, 2);
        ctx.$('[data-v="dbA"]').textContent = fmtPct(da, 2); ctx.$('[data-v="dbT"]').textContent = fmtPct(dt, 2);
      };
      ctx._pliCompute = compute;
      ctx.on(ctx.$('.tog'), 'click', () => {
        if (!S.open && !S.prem) { S.prem = new Array(total()).fill(0); drawTable(); }
        S.open = !S.open; if (S.open) S.opened = true;
        view(); compute();
      });
      ctx.onFields((v) => {
        const n = Math.max(1, Math.round(v.years)) * (K[v.mode] || 1);
        if (S.prev && (S.prev.mode !== v.mode || S.prev.years !== v.years) && S.prem && n !== S.prem.length) {
          const old = S.prem.length, fillV = old ? S.prem[old - 1] : 0;
          if (n > old) for (let i = old; i < n; i++) S.prem.push(fillV); else S.prem.length = n;
          S.entered = true; drawTable();
        }
        S.prev = { mode: v.mode, years: v.years };
        compute();
      });
    }
  });

  /* =====================================================================
     plia1: longer mortgage plus policy vs. shorter mortgage
     ===================================================================== */
  /** mortgage-comparison values shared with the mortgage screens (read-only here) */
  function clientMortgage() {
    const g = (k, d) => { const v = shared.get(k, d); return isFinite(v) ? +v : d; };
    return { Y1: Math.round(g('c2m_loan_1_years', 30)), Y2: Math.round(g('c2m_loan_2_years', 15)), A1: g('c2m_loan_1_amount', 100000), A2: g('c2m_loan_2_amount', 100000),
      R1: g('c2m_loan_1_rate', 0.06), R2: g('c2m_loan_2_rate', 0.06), s: g('mm_side_fund_ror', 0.06), t: g('case_file_ror_taxes', 0.30) };
  }
  screen('plia1', {
    title: 'Longer mortgage plus policy vs. shorter mortgage',
    copy: Object.assign({
      h1: 'Your Values at Year', h2: 'of the', h3: '-Year Loan',
      info1: 'Your policy premium is the monthly difference between the two mortgage payments:', info2: 'a month.',
      lHcv: 'Hypothetical policy cash value',
      lTax: 'Tax Savings',
      lOcTax: 'Opportunity cost of the tax savings at',
      lIns: 'Cost of term or mortgage insurance',
      lOcIns: 'Opportunity cost of the insurance cost at',
      lSum: 'Summary Total',
      lBal1: 'Balance remaining on the', lBal2: '-year loan at year',
      lDiff: 'Difference',
      bCalc: 'Calculate', bBen: 'Benefits', bReset: 'Reset', bCont: 'Continue', bDoc: 'Documentation',
      invalid: 'This comparison needs the shorter loan\'s term to be no longer than the longer loan\'s term. Update the loan terms on the mortgage comparison screens.',
      docTitle: 'Choose a Schedule', doc1: 'Mortgage One', doc2: 'Mortgage Two', doc3: 'Tax and Insurance Savings',
      ws1: 'Mortgage One Schedule', ws2: 'Mortgage Two Schedule', ws3: 'Tax and Insurance Savings Schedule',
      cMonth: 'Month', cBeg: 'Beginning Balance', cPmt: 'Payment', cInt: 'Interest', cPrin: 'Principal', cEnd: 'Ending Balance', cCumInt: 'Cumulative Interest', cCumPrin: 'Cumulative Principal',
      cTax: 'Monthly Tax Savings', cCumTax: 'Cumulative Tax Savings', cOcPrin: 'Opp. Cost of Principal', cOcInt: 'Opp. Cost of Interest', cOcTax: 'Opp. Cost of Tax Savings', cCum: 'Cumulative', cWt: 'Cumulative Wealth Transfer', cYear: 'Year',
      cDTax: 'Monthly Tax Savings Difference', cPrem: 'Monthly Insurance Premium', cCumPrem: 'Cumulative Premiums', cOcPrem: 'Opp. Cost of Premiums',
      noticeTitle: 'Regulatory Notice', notice: 'Any cash value other than zero must come from a current carrier illustration, presented with this screen. Values that are not guaranteed are not promises.', bClose: 'Close',
      disc: 'Cash value must come from a carrier illustration. Tax savings assume all mortgage interest is deductible at your marginal rate each year, which depends on itemizing, loan limits and current law. A surrender can bring charges and tax on any gain.',
      loading: LOADING,
      _notes: 'Two families, same house. One takes the shorter mortgage. The other takes the longer one and sends the payment difference into a cash value policy. At the end of the shorter term, we add up what the second family has.\n\n- Reveal each piece with its Calculate button; the insurance cost opens the premium table.\n- Ask: Which family has more choices if something unexpected happens in year eight?\nPAUSE\n\n- Benefits compares the policy with the house on the same twelve-point yardstick.'
    }, PREM_COPY),
    render(ctx) {
      const c = clientMortgage();
      const back = takeReturn(ctx);
      const S = ctx._a = { stage: 0, hcv: 0, amount: 500, inflate: 0.06, start: 1, periods: c.Y2, open: false, disc: false, prem: null };
      if (back) Object.assign(S, back);
      if (!S.prem || S.prem.length !== c.Y2) S.prem = fillPremiums(new Array(Math.max(0, c.Y2)).fill(0), 1, 500, c.Y2, 0.06);
      const valid = c.Y2 >= 1 && c.Y1 >= c.Y2;
      const sPct = fmtPct(c.s, c.s * 100 % 1 ? 2 : 0);
      ctx.el.innerHTML = `
        <div class="b11-head" style="top:28px"><h1 class="st-h2">${ctx.t('h1')} ${num(F.int(c.Y2))} ${ctx.t('h2')} ${num(F.int(c.Y1))}${ctx.t('h3')}</h1><hr class="st-rule"></div>
        <div class="b11-card b11-abs" style="left:330px;top:116px;width:940px;padding:12px 30px;text-align:center;font:700 19px/1.4 var(--f-body);background:${P.mist};border-color:${P.mist2};box-shadow:none;text-wrap:balance">${ctx.t('info1')} <span class="num prem"></span> ${ctx.t('info2')}</div>
        <div class="b11-card b11-form main b11-tight" style="left:360px;top:206px;width:880px;padding:6px 30px">
          ${valid ? `
          <div class="b11-row">${ctx.t('lHcv', { cls: 'lb' })}${inBox('hcv', 'money', S.hcv)}</div>
          <div class="b11-row">${ctx.t('lTax', { cls: 'lb' })}<div class="b11-val" data-c="0"></div></div>
          <div class="b11-row"><span class="lb">${ctx.t('lOcTax')} ${num(sPct)}</span><div class="b11-val" data-c="1"></div></div>
          <div class="b11-row"><span class="lb">${ctx.t('lIns')}<button type="button" class="b11-icon-btn pv b11-hidden" aria-label="Premiums">${ART.infl()}</button></span><div class="b11-val" data-c="2"></div></div>
          <div class="b11-row"><span class="lb">${ctx.t('lOcIns')} ${num(sPct)}</span><div class="b11-val" data-c="3"></div></div>
          <div class="b11-divider"></div>
          <div class="b11-row b11-sumrow">${ctx.t('lSum', { cls: 'lb' })}<div class="b11-val sum"></div></div>
          <div class="b11-row"><span class="lb">${ctx.t('lBal1')} ${num(F.int(c.Y1))}${ctx.t('lBal2')} ${num(F.int(c.Y2))}</span><div class="b11-val bal"></div></div>
          <div class="b11-divider"></div>
          <div class="b11-row b11-sumrow diffrow">${ctx.t('lDiff', { cls: 'lb' })}<div class="b11-val diff" style="font-size:27px"></div></div>`
          : `<p style="margin:24px 10px;font:600 22px/1.45 var(--f-body);text-align:center">${ctx.t('invalid')}</p>`}
        </div>
        ${premiumPanel(ctx, { x: 560, y: 206, w: 480, h: 440, cls: 'b11-hidden' })}
        <div class="b11-bar" style="left:268px;width:1064px;top:${valid ? 668 : 420}px">
          <button type="button" class="st-pill b-ben">${ctx.t('bBen')}</button>
          <button type="button" class="st-pill b11-ghost b-reset">${ctx.t('bReset')}</button>
          <button type="button" class="st-pill b-cont b11-hidden">${ctx.t('bCont')}</button>
          <button type="button" class="b11-link b-doc">${ctx.t('bDoc')}</button>
        </div>
        ${LIB.disc(ctx, ['hypothetical', 'loans'], 'disc')}`;
      if (!valid) { ctx.$$('.b-ben, .b-reset, .b-doc').forEach((b) => b.classList.add('b11-hidden')); return; }
      // pointer icon for the premium table: a small list glyph
      ctx.$('.pv').innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>';
      const tbody = ctx.$('.b11-prem tbody');
      let R = null;
      const calc = () => { R = mortgagePolicyAlt(Object.assign({}, c, { premiums: S.prem, hcv: S.hcv })); };
      const paint = () => {
        calc();
        ctx.$('.prem').textContent = F.money(R.monthlyPremium);
        const vals = [R.taxSavings, R.ocTaxes, R.insuranceCost, R.ocInsurance];
        ctx.$$('[data-c]').forEach((cell) => {
          const i = +cell.dataset.c;
          if (S.stage > i) cell.innerHTML = F.money(vals[i]);
          else if (S.stage === i) cell.innerHTML = `<button type="button" class="st-pill b11-calcbtn" data-calc="${i}">${ctx.t('bCalc')}</button>`;
          else cell.innerHTML = '';
        });
        ctx.on(ctx.$$('[data-calc]'), 'click', (e, b) => {
          S.stage = +b.dataset.calc + 1;
          if (S.stage === 3) S.open = true;
          paint();
        });
        const tot = R.total(S.stage), diff = R.difference(S.stage);
        ctx.$('.sum').textContent = F.money(tot);
        ctx.$('.bal').textContent = F.money(R.loanBalance);
        const d = ctx.$('.diff'); d.textContent = F.money(diff);
        const col = diff >= 0 ? P.goldDeep : NEG;
        d.style.color = col; ctx.$('.diffrow .lb').style.color = col;
        ctx.$('.pv').classList.toggle('b11-hidden', S.stage < 3);
        view();
        EFA.numify(ctx.el);
      };
      const drawTable = () => {
        tbody.innerHTML = premiumRows(S.prem);
        ctx.on(Array.from(tbody.querySelectorAll('tr')), 'click', (e, tr) => {
          tbody.querySelectorAll('tr.sel').forEach((x) => x.classList.remove('sel')); tr.classList.add('sel');
          const start = +tr.dataset.p;
          entryDialog(ctx, { start, amount: S.prem[start - 1], periods: S.periods, inflate: S.inflate, onEnter: (st) => {
            S.amount = st.amount; S.inflate = st.inflate; S.periods = st.periods; S.start = start;
            fillPremiums(S.prem, start, st.amount, st.periods, st.inflate);
            drawTable(); paint();
          } });
        });
      };
      const view = () => {
        ctx.$('.main').classList.toggle('b11-hidden', S.open);
        ctx.$('.b11-prem').classList.toggle('b11-hidden', !S.open);
        ['.b-ben', '.b-reset', '.b-doc'].forEach((q) => ctx.$(q).classList.toggle('b11-hidden', S.open));
        ctx.$('.b-cont').classList.toggle('b11-hidden', !S.open);
      };
      drawTable(); paint();
      // cash value input: one-time notice, then reset to stage 0 when it changes
      const hcvIn = ctx.$('[data-in="hcv"]');
      bindIns(ctx.el, (id) => S[id], (id, v) => { const nv = Math.max(0, v); if (nv !== S.hcv) { S.hcv = nv; S.stage = 0; paint(); } });
      ctx.on(hcvIn, 'click', () => {
        if (S.disc) return; S.disc = true;
        hcvIn.blur();
        modal(ctx, { title: 'noticeTitle', html: `<p>${ctx.t('notice')}</p>`, buttons: [{ key: 'bClose', primary: true, act: () => { ctx.timeout(() => { hcvIn.focus(); hcvIn.select(); }, 200); } }] });
      });
      ctx.on(ctx.$('.pv'), 'click', () => { S.open = true; view(); });
      ctx.on(ctx.$('.b-cont'), 'click', () => { S.open = false; view(); });
      ctx.on(ctx.$('.b-reset'), 'click', () => { S.stage = 0; paint(); });
      ctx.on(ctx.$('.b-ben'), 'click', () => jumpWith(ctx, { stage: S.stage, hcv: S.hcv, amount: S.amount, inflate: S.inflate, start: S.start, periods: S.periods, prem: S.prem.slice(), disc: S.disc }, 'PLIH', 'plih1'));
      ctx.on(ctx.$('.b-doc'), 'click', () => {
        const C = (field, k, type) => ({ field, header: ctx.t(k), type: type || 'money', dp: type ? undefined : 2 });
        const mortgageWS = (L, key) => ({
          heading: ctx.t(key), size: 'full', filter: 'year', disclosures: ['hypothetical', 'notAdvice', 'license'],
          columns: [C('m', 'cMonth', 'int'), C('beg', 'cBeg'), C('pmt', 'cPmt'), C('it', 'cInt'), C('pr', 'cPrin'), C('end', 'cEnd'), C('ci', 'cCumInt'), C('cpr', 'cCumPrin'), C('ts', 'cTax'), C('cts', 'cCumTax'),
            C('ocP', 'cOcPrin'), C('ocP2', 'cCum'), C('ocI', 'cOcInt'), C('ocI2', 'cCum'), C('ocT', 'cOcTax'), C('ocT2', 'cCum'), C('wt', 'cWt'), C('year', 'cYear', 'year')],
          rows: L.rows.map((r) => ({ m: r.m, beg: r.beg, pmt: r.pmt, it: r.it, pr: r.pr, end: r.end, ci: r.ci, cpr: r.cpr, ts: r.ts, cts: r.cts, ocP: r.ocP, ocP2: r.ocP, ocI: r.ocI, ocI2: r.ocI, ocT: r.ocT, ocT2: r.ocT, wt: r.wt, year: r.year }))
        });
        const savingsWS = () => ({
          heading: ctx.t('ws3'), size: 'full', filter: 'year', disclosures: ['hypothetical', 'notAdvice', 'license'],
          columns: [C('m', 'cMonth', 'int'), C('d', 'cDTax'), C('cumTax', 'cCum'), C('oc', 'cOcTax'), C('cumOcTax', 'cCum'), C('p', 'cPrem'), C('cumPrem', 'cCumPrem'), C('ocp', 'cOcPrem'), C('cumOcPrem', 'cCum'), C('year', 'cYear', 'year')],
          rows: R.grid.map((g) => ({ m: g.m, d: g.d, cumTax: g.cumTax, oc: g.oc, cumOcTax: g.cumOcTax, p: g.p, cumPrem: g.cumPrem, ocp: g.ocp, cumOcPrem: g.cumOcPrem, year: g.year }))
        });
        modal(ctx, {
          title: 'docTitle',
          html: `<div class="b11-choose"><button type="button" class="st-pill" data-ws="1">${ctx.t('doc1')}</button><button type="button" class="st-pill" data-ws="2">${ctx.t('doc2')}</button><button type="button" class="st-pill" data-ws="3">${ctx.t('doc3')}</button></div>`,
          buttons: [{ key: 'bCancel' }]
        });
        ctx.on(ctx.$$('[data-ws]'), 'click', (e, b) => {
          closeModals();
          const w = b.dataset.ws;
          LIB.worksheet(ctx, w === '1' ? mortgageWS(R.L1, 'ws1') : w === '2' ? mortgageWS(R.L2, 'ws2') : savingsWS());
        });
      });
    }
  });

  /* =====================================================================
     proc1: the cost of waiting to save
     ===================================================================== */
  screen('proc1', {
    title: 'The cost of waiting to save',
    copy: {
      head: 'The Cost of Waiting',
      lBal: 'Account Balance', lAnn: 'Annual Savings', lRet: 'Investment Return', lAge: 'Current Age', lRetAge: 'Retirement Age',
      bCalc: 'Calculate',
      nounBal: 'Your account value', nounInc: 'Your yearly income',
      r1a: 'at age', r1b: 'if you start saving today',
      r2a: 'if you wait', r2b: 'years to start',
      r3a: 'The cost of waiting', r3b: 'years', r3inc: 'Yearly income you give up by waiting',
      bShowInc: 'Show Income', bShowBal: 'Show Balance', bDoc: 'Documentation',
      docTitle: 'Choose a Schedule', doc1: 'Start Saving Today', doc2: 'Wait to Start', bCancel: 'Cancel',
      ws1: 'Retirement Savings Starting Today', ws2a: 'Retirement Savings After Waiting', ws2b: 'Years',
      cAge: 'Age', cDep: 'Start-of-Year Deposit', cBeg: 'Start-of-Year Balance', cInt: 'Interest Earned', cEnd: 'Year-End Balance', cYear: 'Year',
      disc: 'It assumes one fixed rate of return and leaves out fees, expenses and taxes. Income is shown as one year of earnings on the final balance.',
      loading: LOADING,
      _notes: 'Time is the one ingredient you cannot buy more of later. Every year you wait is a year your money is not working.\n\n- Calculate, then change the waiting period to show how fast the cost grows.\n- Ask: If waiting ten years costs this much, what is waiting one more year costing you?\nPAUSE\n\n- Show Income turns the same gap into yearly retirement income.'
    },
    render(ctx) {
      const S = ctx._c = { done: false, delay: 10, inc: false, disc: false };
      ctx.el.innerHTML = `
        <div class="b11-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b11-card b11-form b11-slide pin" style="left:400px;top:258px;width:800px">
          <div class="b11-row">${ctx.t('lBal', { cls: 'lb' })}${sharedField(ctx, { id: 'bal', type: 'money', value: 100000, min: 0 }, 'account_balance')}</div>
          <div class="b11-row">${ctx.t('lAnn', { cls: 'lb' })}${sharedField(ctx, { id: 'ann', type: 'money', value: 5000, min: 0 }, 'annual_investment')}</div>
          <div class="b11-row">${ctx.t('lRet', { cls: 'lb' })}${sharedField(ctx, { id: 'ret', type: 'pct', value: 0.05, min: 0, max: 0.12 }, 'taxable_return')}</div>
          <div class="b11-row">${ctx.t('lAge', { cls: 'lb' })}${sharedField(ctx, { id: 'age', type: 'int', value: 42, min: 0, max: 120 }, 'case_file_current_age')}</div>
          <div class="b11-row">${ctx.t('lRetAge', { cls: 'lb' })}${sharedField(ctx, { id: 'retAge', type: 'int', value: 65, min: 0, max: 120 }, 'case_file_retirement_age')}</div>
        </div>
        <button type="button" class="st-pill go" style="position:absolute;left:50%;top:592px;transform:translateX(-50%);min-width:200px">${ctx.t('bCalc')}</button>
        <div class="b11-card b11-results res b11-hidden" style="left:240px;top:486px;width:1120px">
          <div class="b11-rrow"><span class="lb"><span class="noun"></span> ${ctx.t('r1a')} <span class="num ra"></span> ${ctx.t('r1b')}</span><span class="v" data-v="1"></span></div>
          <div class="b11-rrow"><span class="lb"><span class="noun"></span> ${ctx.t('r2a')} ${inBox('delay', 'int', S.delay).replace('class="st-input b11-in"', 'class="st-input b11-in b11-inline"')} ${ctx.t('r2b')}</span><span class="v" data-v="2"></span></div>
          <div class="b11-rrow key"><span class="lb"><span class="r3bal">${ctx.t('r3a')} <span class="num dl"></span> ${ctx.t('r3b')}</span><span class="r3inc">${ctx.t('r3inc')}</span></span><span class="v" data-v="3"></span></div>
        </div>
        <div class="b11-bar foot b11-hidden" style="left:500px;width:600px;top:742px">
          <button type="button" class="st-pill mode">${ctx.t('bShowInc', { cls: 'mI' })}${ctx.t('bShowBal', { cls: 'mB b11-hidden' })}</button>
          <button type="button" class="b11-link doc">${ctx.t('bDoc')}</button>
        </div>
        ${LIB.disc(ctx, ['hypothetical'], 'disc')}`;
      // the mode nouns live in hidden copy holders so they stay editable
      const nounHTML = () => ctx.t(S.inc ? 'nounInc' : 'nounBal');
      const compute = () => {
        if (!S.done) return;
        const v = ctx.values();
        const R = ctx._procR = procrastination({ bal: v.bal, ann: v.ann, ret: v.ret, age: Math.round(v.age), retAge: Math.round(v.retAge), delay: S.delay });
        ctx.$$('.noun').forEach((n) => { n.innerHTML = nounHTML(); });
        ctx.$('.ra').textContent = F.int(v.retAge); ctx.$('.dl').textContent = F.int(S.delay);
        ctx.$('.r3bal').classList.toggle('b11-hidden', S.inc); ctx.$('.r3inc').classList.toggle('b11-hidden', !S.inc);
        const a = S.inc ? R.incToday : R.balToday, b = S.inc ? R.incWait : R.balWait;
        ctx.$('[data-v="1"]').textContent = F.money(a); ctx.$('[data-v="2"]').textContent = F.money(b); ctx.$('[data-v="3"]').textContent = F.money(a - b);
        ctx.$('.mI').classList.toggle('b11-hidden', S.inc); ctx.$('.mB').classList.toggle('b11-hidden', !S.inc);
        if (EFA.edit.on) EFA.edit.arm(ctx.el);
      };
      ctx.on(ctx.$('.go'), 'click', () => {
        S.done = true; ctx.$('.go').classList.add('b11-hidden'); ctx.$('.pin').style.top = '160px';
        ctx.$('.res').classList.remove('b11-hidden'); ctx.$('.foot').classList.remove('b11-hidden');
        compute();
      });
      ctx.on(ctx.$('.mode'), 'click', () => { S.inc = !S.inc; compute(); });
      bindIns(ctx.el, (id) => S[id], (id, v) => { S.delay = Math.max(0, Math.round(v)); compute(); });
      ctx.onFields(() => compute());
      LIB.guard(ctx, 'ret');
      ctx.on(ctx.$('.doc'), 'click', () => {
        if (!ctx._procR) return;
        const C = (field, k, type) => ({ field, header: ctx.t(k), type: type || 'money', dp: type ? undefined : 2 });
        const ws = (rows, heading) => ({
          heading, size: 'medium', disclosures: ['hypothetical', 'license'],
          columns: [C('age', 'cAge', 'age'), C('dep', 'cDep'), C('beg', 'cBeg'), C('int', 'cInt'), C('end', 'cEnd'), C('year', 'cYear', 'year')],
          rows: rows.map((r) => ({ age: r.age, dep: r.dep, beg: r.beg, int: r.int, end: r.end, year: r.year }))
        });
        modal(ctx, {
          title: 'docTitle',
          html: `<div class="b11-choose"><button type="button" class="st-pill" data-ws="1">${ctx.t('doc1')}</button><button type="button" class="st-pill" data-ws="2">${ctx.t('doc2')}</button></div>`,
          buttons: [{ key: 'bCancel' }]
        });
        ctx.on(ctx.$$('[data-ws]'), 'click', (e, b) => {
          closeModals();
          const R = ctx._procR;
          if (b.dataset.ws === '1') LIB.worksheet(ctx, ws(R.rows.today, ctx.t('ws1')));
          else LIB.worksheet(ctx, ws(R.rows.wait, `${ctx.t('ws2a')} ${num(F.int(S.delay))} ${ctx.t('ws2b')}`));
        });
      });
    }
  });

  /* =====================================================================
     ee1 + prsoe1 engines
     ===================================================================== */
  /** pay-cash vs. borrow-against-the-policy (ee1). Rates as fractions. */
  function payCashVsReserve(o) {
    const T = Math.max(0, Math.round(o.T));
    const ly = Math.max(0, Math.round(o.loanYears));
    const refill = o.reality ? (ly > 0 ? o.loan / ly : 0) : o.loanPmt;
    const contrib = [], wd = new Array(T).fill(0), rf = new Array(T).fill(0);
    for (let y = 0; y < T; y++) contrib.push(y < o.capYears ? o.capPay : 0);
    for (let c = 0; c < Math.max(1, o.cycles || 1); c++) {
      const p = c * ly + Math.round(o.buyYear) - 1;
      if (p >= 0 && p < T) { wd[p] = o.loan; for (let y = p; y < p + ly && y < T; y++) rf[y] = refill; }
    }
    const rows = []; let end = 0;
    for (let y = 0; y < T; y++) {
      const beg = end, tc = y < o.termYears ? o.termCost : 0, base = beg + contrib[y] - wd[y] - tc, g = base * o.ror, tx = g * o.tax;
      end = base + g - tx + rf[y];
      rows.push({ year: y + 1, beg, contrib: contrib[y], wd: wd[y], tc, g, tx, rf: rf[y], end });
    }
    const cash = T > 0 ? end : 0;
    const flows = [];
    if (T > 0) { flows.push(wd[0] - contrib[0]); for (let y = 1; y < T; y++) flows.push(wd[y] - (contrib[y] + rf[y - 1])); }
    const irrCV = irr(flows.concat([o.cv]), 0.05), irrDB = irr(flows.concat([o.dbNet ? o.db - o.cv : o.db]), 0.05);
    const teDB = o.tax === 0 ? 0 : irrDB / (1 - o.tax), teCV = o.tax === 0 ? 0 : irrCV / (1 - o.tax);
    let s = o.cv - cash, cashBigger = false, low = cash;
    if (s < 0) { cashBigger = true; s = -s; low = o.cv; }
    const chart = { reserve: [Math.round(low), Math.round(cashBigger ? 0 : s), Math.round(o.db - o.cv)], cash: [Math.round(low), Math.round(cashBigger ? s : 0), Math.round(o.termDb)] };
    return { refill, rows, cash, flows, irrCV, irrDB, teDB, teCV, chart };
  }
  EFA.engines.payCashVsReserve = payCashVsReserve;

  /** investing with money borrowed against the reserve vs. cash (prsoe1). Rates as fractions. */
  function reserveOpportunity(o) {
    let R = o.amt, I = o.amt, C = o.amt; const rows = [];
    for (let p = 0; p <= 20; p++) {
      const resBeg = R, resGrowth = resBeg * o.g; R = resBeg + resGrowth;
      const loanInt = resBeg * o.loan;
      const invBeg = I, invEarn = invBeg * o.inv, invTaxable = invEarn - loanInt, invTax = invTaxable * o.tax, invNet = invTaxable - invTax, invNetTotal = invNet + resGrowth, invEnd = invBeg + invNetTotal; I = invEnd;
      const cashBeg = C, cashEarn = cashBeg * o.inv, cashTax = cashEarn * o.tax, cashNet = cashEarn - cashTax; C = cashBeg + cashNet;
      rows.push({ p, resBeg, resGrowth, loanInt, invBeg, invEarn, invTaxable, invTax, invNet, invNetTotal, invEnd, cashBeg, cashEarn, cashTax, cashNet });
    }
    const r0 = rows[0], d = (a, b) => (b && isFinite(a) ? a / b : NaN);
    const first = { cashTeROI: d(d(r0.cashNet, 1 - o.tax), r0.cashBeg), invTeROI: d(d(r0.invNetTotal, 1 - o.tax), r0.invBeg), cashNetROI: d(r0.cashNet, r0.cashBeg), invNetROI: d(r0.invNetTotal, r0.invBeg) };
    first.increase = d(first.invNetROI - first.cashNetROI, first.cashNetROI);
    return { rows, first };
  }
  EFA.engines.reserveOpportunity = reserveOpportunity;

  /** percent with 0 to 2 decimals: 0.062 -> "6.2%" */
  const pct02 = (f) => (f == null || !isFinite(f) ? '–' : `${+(f * 100).toFixed(2)}%`);
  const moneyOrDash = (v) => (v == null || !isFinite(v) ? '–' : F.money(v));

  /** stacked columns with direct labels (ee1 graph). cats: [{key, values:[...]}], series: [{key, color, text}] */
  function stackChart(ctx, cats, series, o) {
    const w = o.w, h = o.h, pad = { l: 104, r: 20, t: 24, b: 64 };
    const tot = cats.map((c) => c.values.reduce((a, b) => a + Math.max(0, b), 0));
    const max = Math.max(1, ...tot);
    const step = Math.pow(10, Math.floor(Math.log10(max))) / 2;
    const top = Math.ceil(max / step) * step;
    const Y = (v) => pad.t + (h - pad.t - pad.b) * (1 - v / top);
    let g = '';
    const nt = Math.round(top / step);
    const every = nt > 8 ? 2 : 1;
    for (let i = 0; i <= nt; i += every) {
      const v = i * step, y = Y(v);
      g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="${P.rule}" stroke-width="1"/>`;
      g += `<text x="${pad.l - 12}" y="${y + 6}" text-anchor="end" font-family="DM Sans, sans-serif" font-size="16" fill="#667389">${F.money(v)}</text>`;
    }
    const bw = (w - pad.l - pad.r) / cats.length, colW = bw * 0.62;
    let labs = '';
    cats.forEach((c, i) => {
      const x = pad.l + i * bw + (bw - colW) / 2; let acc = 0;
      c.values.forEach((v, si) => {
        if (!(v > 0)) return;
        const y0 = Y(acc), y1 = Y(acc + v); acc += v;
        g += `<rect x="${x}" y="${y1}" width="${colW}" height="${Math.max(0, y0 - y1)}" fill="${series[si].color}"/>`;
        if (y0 - y1 >= 46) labs += `<div class="b11-seg ${series[si].dark ? '' : 'lt'}" style="left:${x + colW / 2}px;top:${(y0 + y1) / 2}px">${ctx.t(series[si].key)}<b>${F.money(v)}</b></div>`;
        else if (y0 - y1 > 0) labs += `<div class="b11-seg out" style="left:${x + colW + 12}px;top:${(y0 + y1) / 2}px">${ctx.t(series[si].key)}<b>${F.money(v)}</b></div>`;
      });
      labs += `<div class="b11-cat" style="left:${x + colW / 2}px;top:${h - pad.b + 16}px">${ctx.t(c.key)}</div>`;
    });
    g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${Y(0)}" y2="${Y(0)}" stroke="${P.navy}" stroke-width="2"/>`;
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="position:absolute;left:0;top:0" aria-hidden="true">${g}</svg>${labs}`;
  }

  /** a stack of banknotes (decorative, pay-cash card) */
  function cashStack() {
    const bill = (y, rot, c) => `<g transform="rotate(${rot} 150 ${y})"><rect x="48" y="${y - 34}" width="204" height="68" rx="8" fill="${c}" stroke="${P.navy}" stroke-width="3"/><rect x="60" y="${y - 24}" width="180" height="48" rx="5" fill="none" stroke="${P.goldDeep}" stroke-width="2" stroke-dasharray="3 4"/><circle cx="150" cy="${y}" r="16" fill="${P.goldPale}" stroke="${P.goldDeep}" stroke-width="2"/></g>`;
    return `<svg viewBox="0 0 300 220" aria-hidden="true">${shadow(150, 206, 116, 9)}${bill(170, -3, P.goldLt)}${bill(138, 4, P.gold)}${bill(104, -2, P.goldLt)}<rect x="132" y="66" width="36" height="140" rx="4" fill="${P.navy}" opacity=".9"/></svg>`;
  }
  const ICON = {
    same: `<svg viewBox="0 0 60 30" width="52" height="26" aria-hidden="true"><path d="M6 15h40" stroke="${P.gold}" stroke-width="6" stroke-linecap="round"/><path d="M38 5l14 10-14 10" fill="none" stroke="${P.gold}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    neq: `<svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="${NEG}"/><path d="M11 16h18M11 24h18M25 9 15 31" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>`,
    compare: `<svg viewBox="0 0 44 40" width="38" height="34" aria-hidden="true"><path d="M22 6v28M10 34h24M6 12h32" stroke="${P.navy}" stroke-width="3" stroke-linecap="round"/><path d="M6 12 1 24h10zM38 12l-5 12h10z" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="1.5" stroke-linejoin="round"/><circle cx="22" cy="6" r="3.5" fill="${P.gold}"/></svg>`,
    chev: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'
  };

  EFA.css('b11-ee', scope(`
  .b11-ee-card { position: absolute; padding: 10px 26px; }
  .b11-ee-t { height: 46px; display: grid; place-items: center; font: 600 27px/1 var(--f-display); color: var(--navy); }
  .b11-ee-t.click { cursor: pointer; grid-template-columns: auto auto; justify-content: center; gap: 10px; }
  .b11-ee-t.click:hover { color: var(--gold-deep); }
  .b11-ee-s { height: 30px; display: flex; align-items: flex-end; justify-content: space-between; font: 700 14px/1 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); }
  .b11-ee-s > span:first-child { text-decoration: underline; text-underline-offset: 5px; text-decoration-thickness: 2px; }
  .b11-ee-r { height: 38px; display: grid; grid-template-columns: 1fr 168px; align-items: center; gap: 12px; border-bottom: 1px solid var(--line); }
  .b11-ee-r > .lb { font: 500 18.5px/1.15 var(--f-body); color: var(--navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .b11-ee-r .st-input { height: 32px; font-size: 18px; border-radius: 8px; text-align: right; padding: 0 10px; }
  .b11-ee-r .st-field { gap: 0; }
  .b11-ee-r .ro { text-align: right; font: 700 19px/1 var(--f-body); color: var(--navy); padding-right: 10px; font-variant-numeric: lining-nums tabular-nums; }
  .b11-ee-r .ro.key { color: var(--gold-deep); font-size: 21px; }
  .b11-ee-r .lb.tg { cursor: pointer; color: var(--gold-deep); font-weight: 700; text-decoration: underline dotted; text-underline-offset: 4px; }
  .b11-ee-r.two { grid-template-columns: 1fr auto; }
  .b11-ee-two { display: flex; align-items: center; gap: 8px; font: 600 16px/1 var(--f-body); color: var(--muted); }
  .b11-ee-two .st-field { width: 112px; }
  .b11-ee-two [data-field="termYears"] { width: 62px; }
  .b11-ee-two [data-field="termYears"] .st-input { text-align: center; padding: 0 4px; }
  .b11-ee-chk { display: inline-flex; align-items: center; gap: 6px; font: 600 15px/1 var(--f-body); color: var(--muted); cursor: pointer; margin-right: 8px; }
  .b11-ee-chk .bx { width: 20px; height: 20px; border-radius: 5px; border: 2px solid var(--mist-2); background: #fff; display: grid; place-items: center; }
  .b11-ee-chk[aria-checked="true"] .bx { background: var(--gold); border-color: var(--gold); }
  .b11-ee-chk[aria-checked="true"] .bx::after { content: ""; width: 9px; height: 5px; border: solid var(--navy); border-width: 0 0 3px 3px; transform: rotate(-45deg) translate(1px, -1px); }
  .b11-ee-cyc { display: inline-flex; align-items: center; gap: 6px; text-transform: none; letter-spacing: 0; font: 600 15px/1 var(--f-body); color: var(--navy); }
  .b11-ee-cyc button { width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--mist-2); background: #fff; color: var(--navy); font: 700 16px/1 var(--f-body); padding: 0; display: grid; place-items: center; }
  .b11-ee-cyc button:hover { border-color: var(--gold); background: var(--gold-pale); }
  .b11-ee-mk { position: absolute; width: 83px; display: grid; place-items: center; }
  .b11-ee-art { display: grid; place-items: center; height: 432px; cursor: pointer; transition: transform .3s ease; }
  .b11-ee-art:hover { transform: translateY(-4px); }
  .b11-ee-art svg { width: 320px; }
  .b11-irr { position: absolute; padding: 18px 26px 22px; }
  .b11-irr-h, .b11-irr-r { display: grid; grid-template-columns: 1.3fr 1fr 1fr; align-items: center; gap: 8px; }
  .b11-irr-h { padding-bottom: 12px; border-bottom: 2px solid var(--gold); }
  .b11-irr-h > span { font: 700 14px/1.2 var(--f-body); letter-spacing: .12em; text-transform: uppercase; color: var(--navy); text-align: center; }
  .b11-irr-h > span:first-child { text-align: left; font: 600 26px/1.1 var(--f-display); letter-spacing: 0; text-transform: none; }
  .b11-irr-r { min-height: 92px; border-bottom: 1px solid var(--line); }
  .b11-irr-r:last-child { border-bottom: 0; }
  .b11-irr-r .lb { font: 600 22px/1.25 var(--f-body); color: var(--navy); }
  .b11-irr-r .v { text-align: center; font: 700 36px/1 var(--f-body); color: var(--navy); font-variant-numeric: lining-nums tabular-nums; }
  .b11-irr-r .v.te { color: var(--gold-deep); }
  .b11-seg { position: absolute; transform: translate(-50%, -50%); display: grid; justify-items: center; gap: 4px; text-align: center; font: 700 14px/1.1 var(--f-body); letter-spacing: .08em; text-transform: uppercase; color: var(--cream); white-space: nowrap; pointer-events: none; }
  .b11-seg b { font: 700 22px/1 var(--f-body); letter-spacing: 0; }
  .b11-seg.lt { color: var(--navy); }
  .b11-seg.out { transform: translate(0, -50%); justify-items: start; color: var(--navy); }
  .b11-cat { position: absolute; transform: translateX(-50%); font: 700 22px/1.2 var(--f-body); color: var(--navy); white-space: nowrap; }
  .b11-gsum { position: absolute; padding: 22px 30px; display: grid; gap: 8px; }
  .b11-gsum h3 { margin: 0 0 6px; font: 600 30px/1.1 var(--f-display); color: var(--navy); text-align: center; }
  .b11-gsum h4 { margin: 12px 0 2px; font: 700 14px/1 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); }
  .b11-gsum .r { display: flex; justify-content: space-between; align-items: center; min-height: 44px; border-bottom: 1px solid var(--line); font: 500 20px/1.2 var(--f-body); color: var(--navy); }
  .b11-gsum .r b { font: 700 23px/1 var(--f-body); }
  .b11-benbox { position: absolute; padding: 16px 20px 20px; }
  .b11-benbox h3 { margin: 0 0 12px; text-align: center; font: 600 28px/1.1 var(--f-display); color: var(--navy); }
  .b11-benbox .b11-bi { min-height: 39px; font-size: 18px; }
  .b11-benbox .b11-bl { gap: 5px; }
  `));

  /* =====================================================================
     ee1: borrow against a policy vs. pay cash (expense example)
     ===================================================================== */
  /** the pay-cash cash-flow schedule for the shared worksheet (numbers with 2 decimals, no currency symbol) */
  function eeSheet(ctx) {
    const R = ctx._eeR || { rows: [] };
    const C = (field, k, type) => ({ field, header: ctx.t(k), type: type || 'num', dp: type ? undefined : 2 });
    return {
      heading: ctx.t('ws'), size: 'full', filter: 'year', disclosures: ['hypothetical', 'loans', 'license'],
      columns: [C('year', 'cYear', 'year'), C('beg', 'cBeg'), C('contrib', 'cContrib'), C('wd', 'cWd'), C('tc', 'cTerm'), C('g', 'cGrowth'), C('tx', 'cTax'), C('rf', 'cRefill'), C('end', 'cEnd')],
      rows: R.rows.map((r) => ({ year: r.year, beg: r.beg, contrib: r.contrib, wd: r.wd, tc: r.tc, g: r.g, tx: r.tx, rf: r.rf, end: r.end }))
    };
  }
  screen('ee1', {
    title: 'Borrow against a policy vs. pay cash',
    copy: {
      head: 'Collateralize or Pay Cash?',
      sub: 'Every policy value on this screen must come from a valid carrier illustration.',
      polTitle: 'Your Reserve Policy',
      sCap: 'Capitalization Phase', sCycle: 'Purchase Cycle', sResult: 'Long-Term Result',
      lCapPay: 'Annual Payment', lCapYears: 'Years to Fund', lBuyYear: 'Year of Purchase', lLoan: 'Loan Amount', lLoanPmt: 'Annual Loan Payment', lLoanYears: 'Repayment Years',
      lT: 'Result Year', lDb: 'Policy Death Benefit', lNetDb: 'Net Death Benefit', lCv: 'Policy Cash Value',
      cashTitle: 'Pay Cash', sAssume: 'Assumptions', lRor: 'Cash Account Rate of Return', lTax: 'Ordinary Tax Rate', lTerm: 'Annual Term Cost', xTimes: '×', yrs: 'yrs',
      cycles: 'Purchase Cycles', lAmt: 'Purchase Amount', lRefill: 'Refill Payment', reality: 'Reality', lRefillYears: 'Refill Years', lT2: 'Result Year', lTermDb: 'Term Death Benefit', lCash: 'Cash Account Value',
      irrH: 'Internal Rate of Return', hAnn: 'Annual Return', hTe: 'Taxable Equivalent', irrDb: 'On the Death Benefit', irrCv: 'On the Cash Value',
      bGraph: 'Graph', bIrr: 'Policy IRR', bBen: 'Benefits', bRet: 'Return',
      gTitle: 'Long-Term Summary', gPol: 'Your Reserve Policy', gCv: 'Cash Value', gDb: 'Death Benefit', gCash: 'Pay Cash', gBal: 'Cash Balance', gDb2: 'Death Benefit',
      catRes: 'Reserve Strategy', catCash: 'Pay Cash', serLow: 'Lowest Balance', serGrow: 'Growth Difference', serNdb: 'Net Death Benefit',
      benPol: 'Policy Benefits', benMm: 'Money Market Benefits',
      infoTitle: 'More Information Needed', info: 'The return math needs the funding years and the annual payment, plus the policy cash value and death benefit at the result year.', bOk: 'OK',
      ws: 'Pay Cash Cash-Flow Schedule', cYear: 'Year', cBeg: 'Beginning Balance', cContrib: 'Plus Contributions', cWd: 'Minus Withdrawals', cTerm: 'Minus Term Cost', cGrowth: 'Plus Growth', cTax: 'Minus Tax on Growth', cRefill: 'Plus End-of-Year Refill', cEnd: 'Equals Ending Balance',
      disc: 'Policy values must come from a carrier illustration that already includes these loans and repayments; loan interest is not modeled here. The cash account is taxed on its growth each year.',
      loading: LOADING,
      _notes: 'Two ways to pay for the same purchases. On the left, you fund a policy, borrow against it for the purchase, and pay the loan back. On the right, you put the same deposits in a taxable account, pay cash, and refill it.\n\n- Open Pay Cash to show the same deposits going in on both sides.\n- Graph compares where each road leaves you; Policy IRR shows what the policy earned.\n- Ask: When you pay cash, who pays you back the interest your money would have earned?\nPAUSE'
    },
    render(ctx) {
      const S = ctx._e = { view: 'main', expanded: false, irr: false, reality: false, cycles: 1, dbNet: false };
      const fld = (id, type, value, o) => ctx.field(Object.assign({ id, type, value, min: 0 }, o || {}));
      const row = (lbKey, inner, cls) => `<div class="b11-ee-r ${cls || ''}">${ctx.t(lbKey, { cls: 'lb' })}${inner}</div>`;
      const X0 = 110, CW = 649, MX = X0 + CW, X1 = MX + 83, TOP = 146;
      ctx.el.innerHTML = `
        <div class="b11-head" style="top:24px"><h1 class="st-h2">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${ctx.t('sub', { tag: 'p', cls: 'b11-sub b11-abs v-sub', attrs: 'style="left:110px;right:110px;top:100px;text-align:center;margin:0;color:var(--navy)"' })}
        <div class="v-main">
          <div class="b11-card b11-ee-card" style="left:${X0}px;top:${TOP}px;width:${CW}px">
            <div class="b11-ee-t serif">${ctx.t('polTitle')}</div>
            <div class="b11-ee-s">${ctx.t('sCap')}</div>
            ${row('lCapPay', fld('capPay', 'money', 30000))}
            ${row('lCapYears', fld('capYears', 'int', 5, { max: 100 }))}
            <div class="b11-ee-s">${ctx.t('sCycle')}</div>
            ${row('lBuyYear', fld('buyYear', 'int', 6, { min: 1, max: 100 }))}
            ${row('lLoan', fld('loan', 'money', 50000))}
            ${row('lLoanPmt', fld('loanPmt', 'money', 13577.77, { dp: 2 }))}
            ${row('lLoanYears', fld('loanYears', 'int', 4, { min: 1, max: 100 }))}
            <div class="b11-ee-s">${ctx.t('sResult')}</div>
            ${row('lT', fld('T', 'int', 25, { min: 1, max: 100 }))}
            <div class="b11-ee-r"><span class="lb tg dbl">${ctx.t('lDb', { cls: 'dbA' })}${ctx.t('lNetDb', { cls: 'dbB b11-hidden' })}</span><div class="dbIn">${fld('db', 'money', 804677)}</div><div class="ro dbRo b11-hidden"></div></div>
            ${row('lCv', fld('cv', 'money', 396848))}
          </div>
          <div class="mk-col b11-hidden">
            <div class="b11-ee-mk" style="left:${MX}px;top:${TOP + 10 + 46 + 30}px;height:38px">${ICON.same}</div>
            <div class="b11-ee-mk" style="left:${MX}px;top:${TOP + 10 + 46 + 30 + 38}px;height:38px">${ICON.same}</div>
            <div class="b11-ee-mk neq b11-hidden" style="left:${MX}px;top:${TOP + 10 + 46 + 30 * 2 + 38 * 4}px;height:38px">${ICON.neq}</div>
            <div class="b11-ee-mk" style="left:${MX}px;top:${TOP + 10 + 46 + 30 * 3 + 38 * 8}px;height:38px">${ICON.compare}</div>
          </div>
          <div class="b11-card b11-ee-card cashcard" style="left:${X1}px;top:${TOP}px;width:${CW}px">
            <div class="b11-ee-t serif click tgl">${ctx.t('cashTitle')}<span class="chev" style="color:${P.gold};display:grid;transition:transform .3s ease">${ICON.chev}</span></div>
            <div class="b11-ee-art tgl">${cashStack()}</div>
            <div class="cbody b11-hidden">
              <div class="b11-ee-s">${ctx.t('sAssume')}</div>
              ${row('lRor', sharedField(ctx, { id: 'ror', type: 'pct', value: 0.06, min: 0, max: 0.2 }, 'case_file_ror_accumulation'))}
              ${row('lTax', fld('tax', 'pct', 0.30, { max: 0.99, dp: 0 }))}
              <div class="b11-ee-r two">${ctx.t('lTerm', { cls: 'lb' })}<div class="b11-ee-two">${fld('termCost', 'money', 0)}${ctx.t('xTimes')}${fld('termYears', 'int', 25, { max: 100 })}${ctx.t('yrs')}</div></div>
              <div class="b11-ee-s">${ctx.t('sCycle')}<span class="b11-ee-cyc">${ctx.t('cycles')} <button type="button" class="cyc" data-d="-1" aria-label="Fewer">&lsaquo;</button><span class="num cycN">1</span><button type="button" class="cyc" data-d="1" aria-label="More">&rsaquo;</button></span></div>
              <div class="b11-ee-r">${ctx.t('lAmt', { cls: 'lb' })}<div class="ro amt"></div></div>
              <div class="b11-ee-r two">${ctx.t('lRefill', { cls: 'lb' })}<div style="display:flex;align-items:center;justify-content:flex-end;gap:10px"><span class="b11-ee-chk" role="checkbox" tabindex="0" aria-checked="false"><span class="bx"></span>${ctx.t('reality')}</span><div class="ro refill" style="min-width:130px"></div></div></div>
              <div class="b11-ee-r">${ctx.t('lRefillYears', { cls: 'lb' })}<div class="ro ry"></div></div>
              <div class="b11-ee-s">${ctx.t('sResult')}</div>
              <div class="b11-ee-r">${ctx.t('lT2', { cls: 'lb' })}<div class="ro ty"></div></div>
              ${row('lTermDb', fld('termDb', 'money', 0))}
              <div class="b11-ee-r">${ctx.t('lCash', { cls: 'lb' })}<div class="ro key cashv"></div></div>
            </div>
          </div>
          <div class="b11-card b11-irr irrcard b11-hidden" style="left:${X1}px;top:${TOP}px;width:${CW}px">
            <div class="b11-irr-h"><span class="serif">${ctx.t('irrH')}</span>${ctx.t('hAnn')}${ctx.t('hTe')}</div>
            <div class="b11-irr-r">${ctx.t('irrDb', { cls: 'lb' })}<span class="v iDb"></span><span class="v te tDb"></span></div>
            <div class="b11-irr-r">${ctx.t('irrCv', { cls: 'lb' })}<span class="v iCv"></span><span class="v te tCv"></span></div>
          </div>
          <div class="b11-bar bar1" style="left:360px;width:880px;top:${TOP + 520}px">
            <button type="button" class="st-pill bGraph">${ctx.t('bGraph')}</button>
            <button type="button" class="st-pill bIrr">${ctx.t('bIrr')}</button>
            <button type="button" class="st-pill b11-ghost bBen">${ctx.t('bBen')}</button>
            ${LIB.docButton(ctx, () => eeSheet(ctx))}
          </div>
          <div class="b11-bar bar2 b11-hidden" style="left:360px;width:880px;top:${TOP + 520}px"><button type="button" class="st-pill bRet1">${ctx.t('bRet')}</button></div>
        </div>
        <div class="v-graph b11-hidden">
          <div class="b11-card b11-gsum" style="left:110px;top:150px;width:470px">
            <h3 class="serif">${ctx.t('gTitle')}</h3>
            <h4>${ctx.t('gPol')}</h4>
            <div class="r">${ctx.t('gCv')}<b class="g1"></b></div><div class="r">${ctx.t('gDb')}<b class="g2"></b></div>
            <h4>${ctx.t('gCash')}</h4>
            <div class="r">${ctx.t('gBal')}<b class="g3"></b></div><div class="r">${ctx.t('gDb2')}<b class="g4"></b></div>
          </div>
          <button type="button" class="st-pill bRet2" style="position:absolute;left:345px;top:590px;transform:translateX(-50%);min-width:160px">${ctx.t('bRet')}</button>
          <div class="chart b11-abs" style="left:660px;top:130px;width:820px;height:640px"></div>
        </div>
        <div class="v-ben b11-hidden">
          <div class="b11-card b11-benbox" style="left:290px;top:108px;width:490px"><h3 class="serif">${ctx.t('benPol')}</h3>${benefitList(BENEFITS.map((b) => b[0]), BEN_SETS.policy)}</div>
          <div class="b11-card b11-benbox" style="left:820px;top:108px;width:490px"><h3 class="serif">${ctx.t('benMm')}</h3>${benefitList(BENEFITS.map((b) => b[0]), BEN_SETS.moneyMarket)}</div>
          <button type="button" class="st-pill bRet3" style="position:absolute;left:50%;top:726px;transform:translateX(-50%);min-width:160px">${ctx.t('bRet')}</button>
        </div>
        ${LIB.disc(ctx, ['hypothetical', 'tax', 'loans'], 'disc')}`;
      let R = null;
      const calc = () => {
        const v = ctx.values();
        const netDb = v.db - v.cv;
        shared.set('net_death_benefit', netDb);
        R = ctx._eeR = payCashVsReserve({ capPay: v.capPay, capYears: v.capYears, buyYear: v.buyYear, loan: v.loan, loanPmt: v.loanPmt, loanYears: v.loanYears, T: v.T, db: v.db, cv: v.cv,
          ror: v.ror, tax: v.tax, termCost: v.termCost, termYears: v.termYears, termDb: v.termDb, reality: S.reality, cycles: S.cycles, dbNet: S.dbNet });
        ctx.$('.dbRo').textContent = F.money(netDb);
        ctx.$('.amt').textContent = F.money(v.loan);
        ctx.$('.refill').textContent = F.money(R.refill, { dp: 2 });
        ctx.$('.ry').textContent = F.int(v.loanYears);
        ctx.$('.ty').textContent = F.int(v.T);
        ctx.$('.cashv').textContent = F.money(R.cash);
        ctx.$('.cycN').textContent = F.int(S.cycles);
        ctx.$('.iDb').textContent = pct02(R.irrDB); ctx.$('.tDb').textContent = pct02(R.teDB);
        ctx.$('.iCv').textContent = pct02(R.irrCV); ctx.$('.tCv').textContent = pct02(R.teCV);
        ctx.$('.g1').textContent = F.money(v.cv); ctx.$('.g2').textContent = F.money(v.db); ctx.$('.g3').textContent = F.money(R.cash); ctx.$('.g4').textContent = F.money(v.termDb);
        if (S.view === 'graph') drawChart();
      };
      const drawChart = () => {
        const ch = ctx.$('.chart');
        ch.innerHTML = stackChart(ctx, [{ key: 'catRes', values: R.chart.reserve }, { key: 'catCash', values: R.chart.cash }],
          [{ key: 'serLow', color: P.navy, dark: true }, { key: 'serGrow', color: P.gold }, { key: 'serNdb', color: P.steel }], { w: 820, h: 640 });
        if (EFA.edit.on) EFA.edit.arm(ch);
      };
      const paint = () => {
        ctx.$('.v-main').classList.toggle('b11-hidden', S.view !== 'main');
        ctx.$('.v-graph').classList.toggle('b11-hidden', S.view !== 'graph');
        ctx.$('.v-ben').classList.toggle('b11-hidden', S.view !== 'ben');
        ctx.$('.v-sub').classList.toggle('b11-hidden', S.view === 'ben');
        ctx.$('.cashcard').classList.toggle('b11-hidden', S.irr);
        ctx.$('.irrcard').classList.toggle('b11-hidden', !S.irr);
        ctx.$('.bar1').classList.toggle('b11-hidden', S.irr); ctx.$('.bar2').classList.toggle('b11-hidden', !S.irr);
        ctx.$('.cbody').classList.toggle('b11-hidden', !S.expanded); ctx.$('.b11-ee-art').classList.toggle('b11-hidden', S.expanded);
        ctx.$('.chev').style.transform = S.expanded ? 'rotate(180deg)' : 'none';
        ctx.$('.mk-col').classList.toggle('b11-hidden', !S.expanded || S.irr);
        ctx.$('.neq').classList.toggle('b11-hidden', !S.reality);
        ctx.$('.b11-ee-chk').setAttribute('aria-checked', S.reality);
        ctx.$('.dbA').classList.toggle('b11-hidden', S.dbNet); ctx.$('.dbB').classList.toggle('b11-hidden', !S.dbNet);
        ctx.$('.dbIn').classList.toggle('b11-hidden', S.dbNet); ctx.$('.dbRo').classList.toggle('b11-hidden', !S.dbNet);
        if (S.view === 'graph' && R) drawChart();
      };
      ctx.on(ctx.$$('.tgl'), 'click', () => { S.expanded = !S.expanded; paint(); });
      ctx.on(ctx.$('.dbl'), 'click', () => { S.dbNet = !S.dbNet; paint(); calc(); });
      const chk = ctx.$('.b11-ee-chk');
      const flipReal = () => { S.reality = !S.reality; paint(); calc(); };
      ctx.on(chk, 'click', flipReal);
      ctx.on(chk, 'keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); flipReal(); } });
      ctx.on(ctx.$$('.cyc'), 'click', (e, b) => {
        const v = ctx.values();
        if (+b.dataset.d < 0) S.cycles = Math.max(1, S.cycles - 1);
        else if (v.buyYear + S.cycles * v.loanYears < v.T) S.cycles += 1;
        calc();
      });
      ctx.on(ctx.$('.bGraph'), 'click', () => { S.view = 'graph'; paint(); });
      ctx.on(ctx.$('.bRet2'), 'click', () => { S.view = 'main'; paint(); });
      ctx.on(ctx.$('.bBen'), 'click', () => { S.view = 'ben'; paint(); });
      ctx.on(ctx.$('.bRet3'), 'click', () => { S.view = 'main'; paint(); });
      ctx.on(ctx.$('.bIrr'), 'click', () => {
        const v = ctx.values();
        if (!v.capYears || !v.capPay || !v.cv || !v.db) modal(ctx, { title: 'infoTitle', html: `<p>${ctx.t('info')}</p>`, buttons: [{ key: 'bOk', primary: true }] });
        S.irr = true; paint(); calc();
      });
      ctx.on(ctx.$('.bRet1'), 'click', () => { S.irr = false; S.expanded = true; S.reality = false; paint(); calc(); });
      ctx.onFields(() => calc());
      paint(); calc();
    }
  });

  /* =====================================================================
     prsoe1: investing with borrowed reserve money vs. cash
     ===================================================================== */
  EFA.css('b11-oe', scope(`
  .b11-oe-in { position: absolute; padding: 12px 26px 14px; }
  .b11-oe-in .b11-row { min-height: 50px; grid-template-columns: 1fr 160px; }
  .b11-oe-in .b11-row > .lb { font-size: 19.5px; }
  .b11-oe-in .b11-row .st-input { height: 40px; font-size: 19px; }
  .b11-oe-s { padding: 12px 0 4px; text-align: center; font: 700 15px/1.2 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); }
  .b11-oe-res { position: absolute; padding: 12px 22px; }
  .b11-oe-t { width: 100%; border-collapse: collapse; font: 500 18.5px/1.2 var(--f-body); color: var(--navy); font-variant-numeric: lining-nums tabular-nums; }
  .b11-oe-t td, .b11-oe-t th { padding: 0 8px; height: 36px; border-bottom: 1px solid var(--line); }
  .b11-oe-t th { font: 700 14px/1.2 var(--f-body); letter-spacing: .1em; text-transform: uppercase; color: var(--cream); background: var(--navy); height: 52px; }
  .b11-oe-t th:first-child { border-radius: 10px 0 0 10px; text-align: right; }
  .b11-oe-t th:last-child { border-radius: 0 10px 10px 0; }
  .b11-oe-t .l { text-align: right; width: 41%; }
  .b11-oe-t .o { text-align: center; width: 5%; color: var(--gold-deep); font-weight: 700; }
  .b11-oe-t .v { text-align: right; width: 25%; font-weight: 600; }
  .b11-oe-t .neg { color: ${NEG}; }
  .b11-oe-t .pos { color: var(--gold-deep); font-weight: 700; }
  .b11-oe-t tr.tot td { font-weight: 700; }
  .b11-oe-t tr.sp td { border-bottom-color: transparent; }
  .b11-oe-t.sum .l { width: 39%; } .b11-oe-t.sum .v { width: 28%; }
  .b11-oe-t.sum td { height: 50px; font-size: 20px; }
  .b11-oe-yr { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 6px 0 14px; font: 600 26px/1 var(--f-display); color: var(--navy); }
  .b11-oe-yr button { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--mist-2); background: #fff; color: var(--navy); font: 700 16px/1 var(--f-body); padding: 0; display: grid; place-items: center; }
  .b11-oe-yr button:hover { border-color: var(--gold); background: var(--gold-pale); }
  .b11-oe-yr .st-input { width: 74px; height: 40px; text-align: center; font-size: 20px; padding: 0 6px; }
  .b11-oe-box { position: absolute; padding: 12px 22px; display: grid; gap: 4px; background: var(--gold-pale); border-color: var(--gold-lt); }
  .b11-oe-box .r { display: grid; grid-template-columns: 60% 40%; align-items: center; min-height: 40px; font: 600 19px/1.2 var(--f-body); color: var(--navy); }
  .b11-oe-box .r b { text-align: right; font: 700 24px/1 var(--f-body); color: var(--gold-deep); }
  .b11-oe-note { position: absolute; margin: 0; text-align: justify; font: 400 14px/1.45 var(--f-body); color: var(--muted); }
  .b11-slide2 { transition: left .7s cubic-bezier(.4,.1,.2,1); }
  .b11-oe-res { animation: scr-in .6s ease .25s both; }
  `));
  /** the reserve-funded side, year by year, for the shared worksheet */
  function oeSheet(ctx) {
    const R = ctx._oeR || { rows: [] };
    const C = (field, k, type) => ({ field, header: ctx.t(k), type: type || 'money' });
    return {
      heading: ctx.t('ws'), size: 'full', filter: 'year', disclosures: ['hypothetical', 'loans', 'notAdvice', 'license'],
      columns: [C('year', 'cYear', 'int'), C('res', 'cRes'), C('loan', 'cLoan'), C('invB', 'cInvB'), C('earn', 'cEarn'), C('li', 'cLi'), C('taxable', 'cTaxable'), C('taxes', 'cTaxes'), C('net', 'cNet'), C('resG', 'cResG'), C('draw', 'cDraw'), C('invE', 'cInvE')],
      rows: R.rows.map((r) => ({ year: r.p, res: r.resBeg, loan: r.resBeg, invB: r.invBeg, earn: r.invEarn, li: r.loanInt, taxable: r.invTaxable, taxes: r.invTax, net: r.invNet, resG: r.resGrowth, draw: r.resGrowth, invE: r.invEnd }))
    };
  }
  screen('prsoe1', {
    title: 'Invest with borrowed reserve money vs. cash',
    copy: {
      head: 'Collateralize or Pay Cash?',
      sOpp: 'The Investment Opportunity', lInv: 'Assumed Rate of Return', lTax: 'Assumed Tax Bracket', lAmt: 'Amount Invested',
      sRes: 'Your Reserve Policy', lLoan: 'Loan Rate', lG: 'Assumed Growth Rate',
      note: 'Return and growth rates are assumptions, not guarantees. Whether loan interest is deductible is a question for your tax preparer.',
      bCalc: 'Calculate',
      hStrat: 'Funding Strategy', hCash: 'Cash', hRes: 'Reserve\nStrategy',
      rInv: 'Investment', rEarn: 'Total Earnings', rLoanInt: 'Loan Interest Paid', rTaxable: 'Taxable Earnings', rTaxes: 'Taxes', rNet: 'Net Investment Earnings', rResG: 'Reserve Growth', rTot: 'Net Total',
      rTe: 'Tax Equivalent ROI', rNetR: 'Net Return', rInc: 'Increase in Net Return',
      sumYear: 'Summary for Year', sInv: 'Investment', sLoan: 'Reserve Loan', sSub: 'Subtotal', sRes2: 'Reserve', sTot: 'Net Total', sDiff: 'Difference',
      b10: 'Difference after 10 years', b20: 'Difference after 20 years',
      tSum: 'Show Summary Values', tFirst: 'Show First-Year Values',
      ws: 'Reserve Strategy Opportunity Example', cYear: 'Year', cRes: 'Reserve Value', cLoan: 'Reserve Loan Value', cInvB: 'Investment Value, Start of Year', cEarn: 'Total Earnings', cLi: 'Loan Interest Paid', cTaxable: 'Taxable Earnings', cTaxes: 'Taxes', cNet: 'Net Investment Earnings', cResG: 'Reserve Growth', cDraw: 'Reserve Loan Draw', cInvE: 'Investment Value, End of Year',
      disc: 'The loan is modeled at the full reserve value; actual policy loan limits are a share of cash surrender value, unpaid interest compounds, and an excess loan can lapse the policy and create a taxable event. Reserve growth during a loan depends on the carrier.',
      loading: LOADING,
      _notes: 'Same investment, two ways to fund it. Cash means emptying your savings to invest. The reserve strategy keeps your savings in place, growing, and borrows the same amount against it.\n\n- Calculate for year one, then switch to the summary and step through the years.\n- Ask: If your savings could keep growing while the same dollars are also invested, how long would you want that to run?\nPAUSE'
    },
    render(ctx) {
      const S = ctx._o = { done: false, sum: false, year: 1, disc: false };
      ctx.el.innerHTML = `
        <div class="b11-head" style="top:30px"><h1 class="st-h2">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b11-card b11-oe-in b11-slide2 oin" style="left:544px;top:140px;width:512px">
          <div class="b11-oe-s" style="padding-top:4px">${ctx.t('sOpp')}</div>
          <div class="b11-row">${ctx.t('lInv', { cls: 'lb' })}${ctx.field({ id: 'inv', type: 'pct', value: 0.10, min: 0, max: 0.12 })}</div>
          <div class="b11-row">${ctx.t('lTax', { cls: 'lb' })}${ctx.field({ id: 'tax', type: 'pct', value: 0.30, min: 0, max: 0.99, dp: 0 })}</div>
          <div class="b11-row">${ctx.t('lAmt', { cls: 'lb' })}${ctx.field({ id: 'amt', type: 'money', value: 500000, min: 0 })}</div>
          <div class="b11-oe-s">${ctx.t('sRes')}</div>
          <div class="b11-row">${ctx.t('lLoan', { cls: 'lb' })}${ctx.field({ id: 'loan', type: 'pct', value: 0, min: 0, max: 0.99 })}</div>
          <div class="b11-row">${ctx.t('lG', { cls: 'lb' })}${ctx.field({ id: 'g', type: 'pct', value: 0, min: 0, max: 0.12 })}</div>
        </div>
        ${ctx.t('note', { tag: 'p', cls: 'b11-oe-note b11-slide2 onote', attrs: 'style="left:550px;top:494px;width:500px"' })}
        <button type="button" class="st-pill go" style="position:absolute;left:800px;top:572px;transform:translateX(-50%);min-width:200px">${ctx.t('bCalc')}</button>
        <div class="b11-card b11-oe-res y1 b11-hidden" style="left:736px;top:140px;width:704px">
          <table class="b11-oe-t"><thead><tr><th class="l">${ctx.t('hStrat')}</th><th class="o"></th><th class="v" style="text-align:right">${ctx.t('hCash')}</th><th class="v" style="text-align:right">${ctx.t('hRes')}</th></tr></thead><tbody class="t1"></tbody></table>
        </div>
        <div class="b11-card b11-oe-res sm b11-hidden" style="left:736px;top:140px;width:704px">
          <div class="b11-oe-yr serif">${ctx.t('sumYear')}<button type="button" data-y="-100" aria-label="First year">&laquo;</button><button type="button" data-y="-1" aria-label="Previous year">&lsaquo;</button>${inBox('year', 'int', S.year)}<button type="button" data-y="1" aria-label="Next year">&rsaquo;</button><button type="button" data-y="100" aria-label="Last year">&raquo;</button></div>
          <table class="b11-oe-t sum"><thead><tr><th class="l">${ctx.t('hStrat')}</th><th class="o"></th><th class="v" style="text-align:right">${ctx.t('hCash')}</th><th class="v" style="text-align:right">${ctx.t('hRes')}</th></tr></thead><tbody class="t2"></tbody></table>
        </div>
        <div class="b11-card b11-oe-box box b11-hidden" style="right:160px;bottom:120px;width:456px">
          <div class="r">${ctx.t('b10')}<b class="d10"></b></div><div class="r">${ctx.t('b20')}<b class="d20"></b></div>
        </div>
        <div class="b11-bar foot b11-hidden" style="left:160px;width:512px;top:600px">
          ${LIB.docButton(ctx, () => oeSheet(ctx))}
          <button type="button" class="st-pill tg">${ctx.t('tSum', { cls: 'tS' })}${ctx.t('tFirst', { cls: 'tF b11-hidden' })}</button>
        </div>
        ${LIB.disc(ctx, ['hypothetical', 'loans'], 'disc')}`;
      let R = null;
      const pr = (v) => (v == null || !isFinite(v) ? '–' : `(${F.money(Math.abs(v))})`);
      const tr = (lbKey, op, cash, res, cls) => `<tr class="${cls || ''}"><td class="l">${lbKey ? ctx.t(lbKey) : ''}</td><td class="o">${op}</td><td class="v ${cash && cash.c ? cash.c : ''}">${cash ? cash.t : ''}</td><td class="v ${res && res.c ? res.c : ''}">${res ? res.t : ''}</td></tr>`;
      const T = (t, c) => ({ t, c });
      const draw = () => {
        if (!S.done) return;
        const v = ctx.values();
        R = ctx._oeR = reserveOpportunity({ inv: v.inv, tax: v.tax, amt: v.amt, loan: v.loan, g: v.g });
        const r0 = R.rows[0], f = R.first, ip = pct02(v.inv), tp = pct02(v.tax);
        ctx.$('.t1').innerHTML = [
          tr('rInv', '', T(moneyOrDash(r0.cashBeg)), T(moneyOrDash(r0.invBeg))),
          tr('', '×', T(ip), T(ip), 'sp'),
          tr('rEarn', '=', T(moneyOrDash(r0.cashEarn)), T(moneyOrDash(r0.invEarn)), 'tot'),
          tr('rLoanInt', '−', null, T(pr(r0.loanInt), 'neg')),
          tr('rTaxable', '=', T(moneyOrDash(r0.cashEarn)), T(moneyOrDash(r0.invTaxable))),
          tr('', '×', T(tp), T(tp), 'sp'),
          tr('rTaxes', '=', T(pr(r0.cashTax), 'neg'), T(pr(r0.invTax), 'neg')),
          tr('rNet', '', T(moneyOrDash(r0.cashNet)), T(moneyOrDash(r0.invNet))),
          tr('rResG', '+', null, T(moneyOrDash(r0.resGrowth))),
          tr('rTot', '=', T(moneyOrDash(r0.cashNet)), T(moneyOrDash(r0.invNetTotal)), 'tot'),
          tr('rTe', '', T(pct02(f.cashTeROI)), T(pct02(f.invTeROI))),
          tr('rNetR', '', T(pct02(f.cashNetROI)), T(pct02(f.invNetROI))),
          tr('rInc', '', null, T(pct02(f.increase), 'pos'), 'tot')
        ].join('');
        const y = Math.max(1, Math.min(20, S.year)), ry = R.rows[y];
        ctx.$('.t2').innerHTML = [
          tr('sInv', '', T(moneyOrDash(ry.cashBeg)), T(moneyOrDash(ry.invBeg))),
          tr('sLoan', '−', null, T(moneyOrDash(ry.resBeg))),
          tr('sSub', '=', null, T(moneyOrDash(ry.invBeg - ry.resBeg))),
          tr('sRes2', '+', null, T(moneyOrDash(ry.resBeg))),
          tr('sTot', '=', T(moneyOrDash(ry.cashBeg)), T(moneyOrDash(ry.invBeg)), 'tot'),
          tr('sDiff', '', null, T(moneyOrDash(ry.invBeg - ry.cashBeg), 'pos'), 'tot')
        ].join('');
        ctx.$('[data-in="year"]').value = F.int(y);
        ctx.$('.d10').textContent = moneyOrDash(R.rows[10].invBeg - R.rows[10].cashBeg);
        ctx.$('.d20').textContent = moneyOrDash(R.rows[20].invBeg - R.rows[20].cashBeg);
        ctx.$('.y1').classList.toggle('b11-hidden', S.sum); ctx.$('.sm').classList.toggle('b11-hidden', !S.sum); ctx.$('.box').classList.toggle('b11-hidden', !S.sum);
        ctx.$('.tS').classList.toggle('b11-hidden', S.sum); ctx.$('.tF').classList.toggle('b11-hidden', !S.sum);
        EFA.numify(ctx.el);
        if (EFA.edit.on) EFA.edit.arm(ctx.el);
      };
      ctx.on(ctx.$('.go'), 'click', () => {
        S.done = true; ctx.$('.go').classList.add('b11-hidden'); ctx.$('.foot').classList.remove('b11-hidden');
        ctx.$('.oin').style.left = '160px'; ctx.$('.onote').style.left = '166px';
        draw();
      });
      ctx.on(ctx.$('.tg'), 'click', () => { S.sum = !S.sum; draw(); });
      ctx.on(ctx.$$('[data-y]'), 'click', (e, b) => { S.year = Math.max(1, Math.min(20, S.year + +b.dataset.y)); draw(); });
      bindIns(ctx.el, (id) => S[id], (id, v) => { S.year = Math.max(1, Math.min(20, Math.round(v))); draw(); });
      ctx.onFields(() => draw());
      LIB.guard(ctx, 'inv'); LIB.guard(ctx, 'g');
    }
  });

  /* =====================================================================
     bullet screens: ttko2, ttkm1, pc1, prs22, prs24, prs25
     ===================================================================== */
  EFA.css('b11-bul', scope(`
  .b11-chk { position: absolute; left: 50%; transform: translateX(-50%); width: 1060px; padding: 14px 40px; }
  .b11-chk .r { display: grid; grid-template-columns: 44px 1fr; align-items: center; gap: 22px; min-height: 55px; border-bottom: 1px solid var(--line); }
  .b11-chk .r:last-child { border-bottom: 0; }
  .b11-chk .r > span:last-child { font: 700 22px/1.25 var(--f-body); color: var(--navy); }
  .b11-chk .ic { display: grid; place-items: center; }
  .b11-pclist { position: absolute; display: grid; gap: 7px; }
  .b11-pclist .r { display: grid; grid-template-columns: 34px 1fr; align-items: center; gap: 12px; font: 700 19px/1.15 var(--f-body); color: var(--navy); }
  .b11-pc-img { position: absolute; display: grid; place-items: center; }
  .b11-pc-img svg { width: 100%; height: 100%; }
  .b11-pcarrow { position: absolute; color: var(--gold); opacity: .85; }
  .b11-c2 { position: absolute; left: 160px; width: 1280px; display: grid; grid-template-columns: 120px 1fr 96px; align-items: center; gap: 30px; }
  .b11-c2 .card { padding: 26px 34px; display: grid; gap: 14px; }
  .b11-c2 .lead { margin: 0; font: 600 40px/1.15 var(--f-display); color: var(--navy); }
  .b11-c2 .body { margin: 0; font: 500 24px/1.45 var(--f-body); color: var(--navy); }
  .b11-calcbtn2 { width: 84px; height: 104px; border: 0; background: transparent; padding: 6px; border-radius: 16px; cursor: pointer; transition: transform .25s ease, background .25s ease; }
  .b11-calcbtn2:hover { transform: translateY(-3px); background: var(--gold-pale); }
  .b11-calcbtn2 svg { width: 100%; height: 100%; filter: drop-shadow(0 8px 12px rgba(13,30,58,.22)); }
  .b11-stages { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .b11-stage { padding: 8px 16px; border-radius: 999px; background: var(--navy); color: var(--cream); font: 700 17px/1 var(--f-body); letter-spacing: .04em; }
  .b11-stage.g { background: var(--gold); color: var(--navy); }
  .b11-stage-a { color: var(--gold); font: 700 20px/1 var(--f-body); }
  .b11-bgrid { position: absolute; left: 80px; width: 1440px; display: grid; grid-template-columns: 1fr 1fr; column-gap: 40px; }
  .b11-bgrid .col { display: grid; gap: 14px; }
  .b11-bgrid .r { display: grid; grid-template-columns: 64px 1fr; align-items: center; gap: 18px; }
  .b11-bgrid .bc { display: grid; grid-template-columns: 1fr 30px; align-items: center; gap: 10px; min-height: 62px; padding: 0 16px 0 24px; box-sizing: border-box; border-radius: 12px;
    background: var(--paper); border: 1px solid var(--rule); box-shadow: 0 8px 20px rgba(13,30,58,.06); font: 700 24px/1.15 var(--f-body); color: var(--navy); transition: background .45s ease, border-color .45s ease; }
  .b11-bgrid .bc .mk { width: 28px; height: 28px; opacity: 0; transition: opacity .45s ease; }
  .b11-bgrid .bc.on { background: linear-gradient(100deg, ${P.goldPale} 0%, ${P.goldLt} 100%); border-color: ${P.gold}; }
  .b11-bgrid .bc.on .mk { opacity: 1; }
  .b11-bgrid .bc.off { color: rgba(13,30,58,.45); }
  .b11-note { position: absolute; left: 50%; transform: translateX(-50%); padding: 14px 30px; text-align: center; font: 600 22px/1.35 var(--f-body); color: var(--navy); background: var(--mist); border-color: var(--mist-2); box-shadow: none; }
  .b11-dd { position: absolute; left: 50%; transform: translateX(-50%); z-index: 6; width: 640px; }
  .b11-dd-b { width: 100%; display: grid; grid-template-columns: 1fr 30px; align-items: center; gap: 12px; padding: 14px 22px; border-radius: 14px; border: 2px solid var(--gold); background: #fff; color: var(--navy); font: 700 24px/1.2 var(--f-body); text-align: left; box-shadow: 0 10px 24px rgba(13,30,58,.10); }
  .b11-dd-b .ph { color: var(--muted); font-weight: 600; }
  .b11-dd-b svg { color: var(--gold-deep); transition: transform .25s ease; }
  .b11-dd.open .b11-dd-b svg { transform: rotate(180deg); }
  .b11-dd-m { position: absolute; left: 0; right: 0; top: calc(100% + 8px); padding: 8px; display: grid; gap: 4px; border-radius: 14px; background: var(--paper); border: 1px solid var(--rule); box-shadow: 0 24px 50px rgba(13,30,58,.22);
    opacity: 0; transform: translateY(-6px); pointer-events: none; transition: opacity .25s ease, transform .25s ease; }
  .b11-dd.open .b11-dd-m { opacity: 1; transform: none; pointer-events: auto; }
  .b11-dd-o { display: block; width: 100%; text-align: left; padding: 12px 16px; border: 0; border-radius: 10px; background: transparent; font: 600 21px/1.2 var(--f-body); color: var(--navy); cursor: pointer; }
  .b11-dd-o:hover { background: var(--gold-pale); }
  .b11-dd-o[aria-selected="true"] { background: var(--navy); color: var(--cream); }
  `));

  /** a centered checklist card with shared dart bullets */
  function checklist(ctx, keys, top) {
    return `<div class="b11-card b11-chk" style="top:${top}px">${keys.map((k) => `<div class="r"><span class="ic">${LIB.dart(40)}</span>${ctx.t(k)}</div>`).join('')}</div>`;
  }
  const TTK_COMMON = {
    i0: 'You have a contractual right to borrow against your cash value.',
    i1: 'No one asks you why you want the money.',
    i2: 'The loan does not show up on your credit report.',
    i3: 'You decide when, and how much, to repay.',
    i4: 'Your cash value is the security for the loan.',
    i5: 'You borrow against your cash value; the value itself stays in place.',
    i6: 'You never have to empty your reserve to reach your money.',
    i7: 'Your cash value can keep earning while the loan is outstanding.',
    i8: 'Repayments go back to the insurance company, not into the policy.'
  };
  screen('ttko2', {
    title: 'Things to know before borrowing to invest',
    copy: Object.assign({
      head: 'Know This Before Your Policy Funds an Investment'
    }, TTK_COMMON, {
      i9: 'Loan interest may be deductible as an investment expense.',
      i10: 'At death, any loan balance is subtracted from the death benefit.',
      disc: 'Loan availability, loan interest and crediting while a loan is outstanding depend on the contract and the carrier. Investment-interest deduction rules and limits apply. Investments carry risk.',
      _notes: 'Before your policy funds an investment, here is what makes a policy loan different from a bank loan.\n\n- Walk the list; slow down on control: you choose the purpose, the timing and the repayment.\n- Ask: Which of these would have mattered most the last time you needed money for an opportunity?\nPAUSE'
    }),
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b11-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${checklist(ctx, ['i0', 'i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9', 'i10'], 156)}
        ${LIB.disc(ctx, ['loans', 'tax', 'notAdvice'], 'disc')}`;
    }
  });
  screen('ttkm1', {
    title: 'Things to know before borrowing for a purchase',
    copy: Object.assign({
      head1: 'Know This Before You Use a Policy Loan',
      head2: 'for a Major Purchase'
    }, TTK_COMMON, {
      i9: 'At death, any loan balance is subtracted from the death benefit.',
      disc: 'Loan availability, loan interest and crediting while a loan is outstanding depend on the contract and the carrier.',
      _notes: 'A car, a roof, a wedding: big purchases are where most families lose the most interest. Here is what changes when the policy is the lender.\n\n- Ask: When you bought your last car, who set the terms of the loan?\nPAUSE\n\n- Point out repayment: you can repay on your schedule, and paying yourself back is what keeps the reserve whole.'
    }),
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b11-head" style="top:30px;gap:8px"><h1 class="st-h1" style="font-size:54px;line-height:1.08">${ctx.t('head1')}<br>${ctx.t('head2')}</h1><hr class="st-rule"></div>
        ${checklist(ctx, ['i0', 'i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8', 'i9'], 212)}
        ${LIB.disc(ctx, ['loans', 'tax'], 'disc')}`;
    }
  });

  /* ---------- pc1: position of choice ---------- */
  const PC_LIST = [['l1', 'Savings Account'], ['l2', 'Money Market Account'], ['l3', 'Certificate of Deposit'], ['l4', 'Margin Account'], ['l5', 'HELOC'], ['l6', 'Credit Union'], ['l7', 'Car Manufacturer'], ['l8', 'Government Loan'], ['l9', 'Signature Loan'], ['l10', 'I.O.U.'], ['l11', '401(k) Qualified Acct.']];
  screen('pc1', {
    title: 'Your policy as a position of choice',
    copy: Object.assign({
      cap1: 'Insurance Company', cap2: 'Your Choice', cap3: 'Other Options',
      bottom: 'Borrow from the insurance company on your own terms, or pledge your policy as collateral with another lender when its rate on a scheduled loan is better. More options. More control.',
      disc: 'Lender acceptance of a policy as collateral, and loan rates, vary. A collateral assignment gives the lender a claim on policy values until the loan is repaid.',
      _notes: 'Owning a cash value policy puts you in a position of choice. The insurer is always there as a lender, and the policy can open doors with other lenders too.\n\n- Ask: How often have you been able to choose your lender, rather than the lender choosing you?\nPAUSE'
    }, Object.fromEntries(PC_LIST)),
    render(ctx) {
      const arrow = (dir) => `<svg viewBox="0 0 120 40" width="120" height="40" aria-hidden="true"><path d="${dir > 0 ? 'M8 20h96M88 6l18 14-18 14' : 'M112 20H16M32 6 14 20l18 14'}" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${dir > 0 ? '' : ''}"/></svg>`;
      ctx.el.innerHTML = `
        <div class="b11-pc-img" style="left:155px;top:96px;width:350px;height:410px">${ART.tower()}</div>
        <div class="b11-cap" style="left:330px;top:522px">${ctx.t('cap1')}</div>
        <div class="b11-pc-img" style="left:625px;top:116px;width:350px;height:390px">${ART.personDoc()}</div>
        <div class="b11-cap" style="left:800px;top:522px;border-color:${P.gold}">${ctx.t('cap2')}</div>
        <div class="b11-pcarrow" style="left:500px;top:300px">${arrow(-1)}</div>
        <div class="b11-pcarrow" style="left:982px;top:300px">${arrow(1)}</div>
        <div class="b11-pclist" style="left:1142px;top:166px;width:330px">${PC_LIST.map(([k]) => `<div class="r">${LIB.dart(30)}${ctx.t(k)}</div>`).join('')}</div>
        <div class="b11-cap" style="left:1270px;top:522px">${ctx.t('cap3')}</div>
        <div class="b11-card b11-bottom" style="top:616px;width:1280px;font-size:24px">${ctx.t('bottom')}</div>
        ${LIB.disc(ctx, ['loans'], 'disc')}`;
    }
  });

  /* ---------- prs22: two key financial concepts ---------- */
  screen('prs22', {
    title: 'Two key financial concepts',
    copy: {
      head: 'Two Key Financial Concepts',
      lead1: 'Every purchase carries a financing cost.',
      body1: 'Borrow the money and you pay interest. Pay cash and you give up the interest that money would have kept earning.',
      lead2: 'Everyone moves through four money stages.',
      st1: 'Spender', st2: 'Saver', st3: 'Wealth Creator', st4: 'Legacy Provider',
      _notes: 'Two ideas carry the rest of this conversation.\n\n- First: you finance everything you buy. You either pay interest or give up interest. The calculator shows the math.\n- Second: everyone moves through four stages with money. The calculator shows where you are.\n- Ask: Which stage describes you today, and which one do you want to be in ten years from now?\nPAUSE'
    },
    render(ctx) {
      const big = LIB.dart(112);
      ctx.el.innerHTML = `
        <div class="b11-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b11-c2" style="top:250px">
          <div style="display:grid;place-items:center">${big}</div>
          <div class="b11-card card">${ctx.t('lead1', { tag: 'p', cls: 'lead serif' })}${ctx.t('body1', { tag: 'p', cls: 'body' })}</div>
          <button type="button" class="b11-calcbtn2" data-go="1" aria-label="Calculator">${ART.calc()}</button>
        </div>
        <div class="b11-c2" style="top:530px">
          <div style="display:grid;place-items:center">${big}</div>
          <div class="b11-card card">${ctx.t('lead2', { tag: 'p', cls: 'lead serif' })}
            <div class="b11-stages">${ctx.t('st1', { cls: 'b11-stage' })}<span class="b11-stage-a">&rsaquo;</span>${ctx.t('st2', { cls: 'b11-stage' })}<span class="b11-stage-a">&rsaquo;</span>${ctx.t('st3', { cls: 'b11-stage' })}<span class="b11-stage-a">&rsaquo;</span>${ctx.t('st4', { cls: 'b11-stage g' })}</div></div>
          <button type="button" class="b11-calcbtn2" data-go="2" aria-label="Calculator">${ART.calc()}</button>
        </div>`;
      ctx.on(ctx.$$('[data-go]'), 'click', (e, b) => { if (b.dataset.go === '1') ctx.jump('FNOEP', 'f1'); else ctx.jump('SSWCLP', 'sswclp1'); });
    }
  });

  /* ---------- prs24 + prs25: the ideal-account benefit grid ---------- */
  const GRID_L = ['tdg', 'tfd', 'cr', 'hc', 'dc', 'co'], GRID_R = ['sh', 'nlp', 'glo', 'ulp', 'luac', 'ab'];
  function benefitGrid(top, rowGap) {
    const col = (codes) => `<div class="col" style="gap:${rowGap}px">${codes.map((c) => `<div class="r">${LIB.dart(60)}<div class="bc" data-ben="${c}">${benLabel(c)}<span class="mk">${CHECK}</span></div></div>`).join('')}</div>`;
    return `<div class="b11-bgrid" style="top:${top}px">${col(GRID_L)}${col(GRID_R)}</div>`;
  }
  screen('prs24', {
    title: 'Ideal reserve account benefits',
    copy: {
      head: 'The Benefits of an Ideal Account',
      note: 'Plenty of accounts can hold your reserve. Only a few keep it private.',
      disc: 'Which benefits apply depends on the account, the product and current tax law.',
      _notes: 'Before we compare accounts, agree on the yardstick. These twelve benefits describe the ideal place to keep your reserve.\n\n- Ask: Which three of these matter most to you?\nPAUSE\n\n- The caution at the bottom sets up the next screen: privacy is rare.'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b11-head"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${benefitGrid(170, 16)}
        <div class="b11-card b11-note" style="top:672px;width:1120px">${ctx.t('note')}</div>
        ${LIB.disc(ctx, ['tax', 'loans'], 'disc')}`;
    }
  });
  const ACCTS = [['savings', 'aSav'], ['cd', 'aCd'], ['heloc', 'aHeloc'], ['margin', 'aMargin'], ['qp', 'aQp'], ['policy', 'aPol']];
  screen('prs25', {
    title: 'Which reserve account fits',
    copy: {
      head: 'When Cash Flow Comes Up Short, Where Do You Turn?',
      ph: 'Choose an account type',
      aSav: 'Savings or Money Market Account', aCd: 'Certificate of Deposit', aHeloc: 'Home Equity with a HELOC', aMargin: 'Stock Margin Account', aQp: '401(k) Qualified Plan', aPol: 'Cash Value Life Insurance',
      disc: 'Which benefits apply depends on the account, the product and current tax law; qualified plan contribution and deduction limits apply.',
      _notes: 'Most families reach for whatever account is closest when cash flow falls short. Run each one against the yardstick.\n\n- Pick each account type in turn; save cash value life insurance for last.\n- Ask: Where would you want your reserve to sit if it had to check every box?\nPAUSE'
    },
    render(ctx) {
      let sel = null;
      ctx.el.innerHTML = `
        <div class="b11-head" style="top:34px"><h1 class="st-h1" style="font-size:52px">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b11-dd" style="top:136px">
          <button type="button" class="b11-dd-b" aria-haspopup="listbox"><span class="cur">${ctx.t('ph', { cls: 'ph' })}</span>${ICON.chev}</button>
          <div class="b11-dd-m" role="listbox">${ACCTS.map(([v, k]) => `<button type="button" class="b11-dd-o" role="option" data-acct="${v}" aria-selected="false">${ctx.t(k)}</button>`).join('')}</div>
        </div>
        ${benefitGrid(236, 14)}
        ${LIB.disc(ctx, ['tax', 'loans'], 'disc')}`;
      const dd = ctx.$('.b11-dd');
      const paint = () => {
        const on = new Set(sel ? BEN_SETS[sel] : []);
        ctx.$$('.b11-bgrid .bc').forEach((n) => { n.classList.toggle('on', on.has(n.dataset.ben)); n.classList.toggle('off', !!sel && !on.has(n.dataset.ben)); });
        ctx.$$('.b11-dd-o').forEach((o) => o.setAttribute('aria-selected', o.dataset.acct === sel));
        const k = sel ? ACCTS.find((a) => a[0] === sel)[1] : null;
        ctx.$('.cur').innerHTML = k ? ctx.t(k) : ctx.t('ph', { cls: 'ph' });
        if (EFA.edit.on) EFA.edit.arm(ctx.el);
      };
      ctx.on(ctx.$('.b11-dd-b'), 'click', () => dd.classList.toggle('open'));
      ctx.on(ctx.$$('.b11-dd-o'), 'click', (e, o) => { sel = o.dataset.acct; dd.classList.remove('open'); paint(); });
      ctx.on(ctx.el, 'click', (e) => { if (!e.target.closest('.b11-dd')) dd.classList.remove('open'); });
      paint();
      ctx.timeout(() => { if (!EFA.edit.on) dd.classList.add('open'); }, 450);
    }
  });

  /* =====================================================================
     Personal Economic Model screens: pemf1, ttko1, atc2, prs21, ph1
     (EFA.lib.pem, guarded: a quiet loading card until the model library is available)
     ===================================================================== */
  EFA.css('b11-pem', scope(`
  .b11-pemwait { position: absolute; display: grid; place-items: center; }
  .b11-pemwait .bx { display: grid; justify-items: center; gap: 18px; padding: 34px 46px; text-align: center; }
  .b11-pemwait .bx svg { width: 220px; height: auto; opacity: .9; }
  .b11-pemwait p { margin: 0; font: 600 21px/1.4 var(--f-body); color: var(--muted); }
  .b11-teach { position: absolute; right: 24px; top: 63px; width: 624px; padding: 18px 24px; z-index: 8; font: 700 22px/1.42 var(--f-body); color: var(--navy); transition: opacity .3s ease; }
  .b11-teach.none { opacity: 0; pointer-events: none; }
  .b11-tog.sm { padding: 6px 12px 6px 6px; gap: 10px; font-size: 16px; z-index: 9; }
  .b11-tog.sm .trk { width: 44px; height: 26px; }
  .b11-tog.sm .trk::after { width: 20px; height: 20px; }
  .b11-tog.sm[aria-checked="true"] .trk::after { transform: translateX(18px); }
  .b11-lpanel { position: absolute; top: 24px; right: 40px; width: 640px; display: grid; gap: 22px; align-content: start; z-index: 4; }
  .b11-lpanel h1 { text-align: center; }
  .b11-btxt { font: 700 23px/1.3 var(--f-body); color: var(--navy); }
  .b11-lpanel .lib-bul-txt { width: 85%; box-sizing: border-box; }
  .b11-ph-call { position: absolute; width: 480px; padding: 16px 22px; text-align: center; font: 700 22px/1.35 var(--f-body); color: var(--navy); z-index: 6; }
  .b11-ph-ins { position: absolute; display: flex; align-items: center; gap: 12px; padding: 6px 10px 6px 20px; font: 700 21px/1 var(--f-body); color: var(--navy); z-index: 6; }
  .b11-ph-ins button { width: 40px; height: 48px; border: 0; padding: 3px; background: transparent; border-radius: 10px; cursor: pointer; transition: transform .2s ease, background .2s ease; }
  .b11-ph-ins button:hover { transform: translateY(-2px); background: var(--gold-pale); }
  .b11-ph-ins button svg { width: 100%; height: 100%; }
  .b11-shield { width: 100%; height: 100%; display: grid; place-items: center; filter: drop-shadow(0 10px 16px rgba(13,30,58,.28)); }
  .b11-shield svg { width: 100%; height: 100%; }
  `));
  const PEM_WAIT = 'The money-flow model is still loading.';
  /** small drawing of tanks for the loading card */
  function tanksMini() {
    const t = (x, h, c) => `<rect x="${x}" y="20" width="44" height="80" rx="6" fill="#fff" stroke="${P.navy}" stroke-width="3"/><rect x="${x + 3}" y="${97 - h}" width="38" height="${h}" rx="3" fill="${c}"/>`;
    return `<svg viewBox="0 0 220 110" aria-hidden="true">${t(6, 30, P.goldLt)}${t(62, 50, P.navy4)}${t(118, 20, P.steel)}${t(174, 60, P.gold)}<path d="M0 104h220" stroke="${P.mist2}" stroke-width="4"/></svg>`;
  }
  function pemReady() { return !!(EFA.lib && EFA.lib.pem && typeof EFA.lib.pem.mount === 'function'); }
  /** mount the model, or leave a quiet loading card in its place */
  function mountPem(ctx, host, cfg, box) {
    if (pemReady()) {
      try { return EFA.lib.pem.mount(ctx, host, cfg); } catch (e) { console.error(e); }
    }
    const b = box || { left: 40, top: 40, width: 1520, height: 800 };
    const w = document.createElement('div');
    w.className = 'b11-pemwait';
    Object.assign(w.style, { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' });
    w.innerHTML = `<div class="b11-card bx">${tanksMini()}${ctx.t('pemWait', { tag: 'p' })}</div>`;
    ctx.el.appendChild(w);
    return null;
  }
  /** set a whole step state on the model in one call (instant when ms is 0) */
  function pemState(p, st, ms) {
    if (!p) return;
    const flows = st.flows || [];
    const vals = Object.assign({}, st); delete vals.flows;
    p.set(vals, { ms: ms == null ? 800 : ms });
    p.flowsOff();
    if (flows.length) p.flow(flows, true);
  }

  /* ---------- pemf1: the money-flow model, one idea per click ---------- */
  const PEMF = [
    { showFuture: true, lifestyleStrip: true, showBorrowed: true, showHouse: true, regulator: 80, safe: 0, risk: 0, flows: [] },
    { showFuture: false, lifestyleStrip: false, showBorrowed: false, showHouse: false, regulator: 0, safe: 0, risk: 0, flows: ['incomeToFilter'] },
    { showFuture: false, lifestyleStrip: false, showBorrowed: false, showHouse: false, regulator: 0, safe: 0, risk: 0, flows: ['incomeToFilter', 'incomeTaxOut'] },
    { showFuture: false, lifestyleStrip: true, showBorrowed: false, showHouse: false, regulator: 100, safe: 0, risk: 0, flows: ['incomeToFilter', 'incomeTaxOut', 'filterToOutflow'] },
    { showFuture: true, lifestyleStrip: true, showBorrowed: false, showHouse: false, regulator: 100, safe: 0, risk: 0, flows: [] },
    { showFuture: true, lifestyleStrip: true, showBorrowed: false, showHouse: false, regulator: 80, safe: 20, risk: 20, flows: ['incomeToFilter', 'incomeTaxOut', 'filterToOutflow', 'incomeToQP', 'filterToRiskThin', 'filterToSafeThin'] },
    { showFuture: true, lifestyleStrip: true, showBorrowed: false, showHouse: false, regulator: 100, safe: 50, risk: 50, flows: ['riskToFilter', 'safeToFilter', 'futureToOutflow'] },
    { showFuture: true, lifestyleStrip: true, showBorrowed: false, showHouse: false, regulator: 100, safe: 60, risk: 60, flows: ['riskToFilter', 'safeToFilter', 'futureToOutflow'] }
  ];
  const PEMF_TXT = { on: false };
  screen('pemf1', {
    title: 'Money-flow model primer',
    steps: 9,
    copy: {
      teach0: 'Take a look at this picture of how money moves. What is the first thing you notice?',
      teach1: 'This large tank holds everything you will earn in your lifetime. It looks empty because that money never arrives all at once. It comes in a little at a time, paycheck by paycheck.',
      teach2: 'Before your income goes anywhere else, it meets taxes. The government decides how much it keeps, and only the rest moves on.',
      teach3: 'Left alone, whatever is left flows straight into day-to-day living, and it gets used up.',
      teach4: 'That works only while the paychecks keep coming. Retirement, or a time when you cannot work, means living on what you saved. Spend it all, and there is no cushion.',
      teach5: 'The careful approach sends a slice of every paycheck up into two future-lifestyle tanks: one for investments, one for savings.',
      teach6: 'By retirement, those tanks are full enough to pay you an income that keeps the life you have built.',
      teach7: 'We call this Lifestyle Certainty: retirement income that keeps pace with inflation, matches the way you live today, and lasts as long as you do.',
      teach8: 'Together we can map the gap between where you stand today and Lifestyle Certainty, and build the plan that closes it.',
      tog: 'Show Text',
      pemWait: PEM_WAIT,
      _notes: 'This is the picture behind every conversation we will have: money comes in, taxes come out, and the rest is either spent or saved for the life you want later.\n\n- Turn on Show Text for a guided first meeting; leave it off to tell the story in your own words.\n- Ask: Looking at this, where is most of your money going today?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b11-card b11-teach none">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ctx.t('teach' + i, { cls: `tt tt${i} b11-hidden` })).join('')}</div>
        <div class="b11-tog sm" role="switch" tabindex="0" aria-checked="${PEMF_TXT.on}" style="right:26px;bottom:62px"><span class="trk"></span>${ctx.t('tog')}</div>`;
      ctx.pem = mountPem(ctx, ctx.el, { labels: true, scenarioPicker: false, links: true, rip: false, showRip: false, borrowSource: false, pv: false, riskKeep: 60, safeTax: 40, diverter: 0, regulator: 80 });
      const tog = ctx.$('.b11-tog');
      const flip = () => { PEMF_TXT.on = !PEMF_TXT.on; tog.setAttribute('aria-checked', PEMF_TXT.on); teach(ctx, ctx.step); };
      ctx.on(tog, 'click', flip);
      ctx.on(tog, 'keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); flip(); } });
      function teach(c, n) {
        c.$$('.tt').forEach((x) => x.classList.add('b11-hidden'));
        const t = c.$('.tt' + n); if (t) t.classList.remove('b11-hidden');
        c.$('.b11-teach').classList.toggle('none', !PEMF_TXT.on);
      }
      ctx._teach = teach;
    },
    step(ctx, n, dir) {
      // with the teaching text off, the text-only steps 7 and 8 are skipped
      if (!PEMF_TXT.on && n === 7 && dir > 0) { ctx.goStep(8); return; }
      if (!PEMF_TXT.on && n === 7 && dir < 0) { ctx.goStep(6); return; }
      const k = Math.min(n, 7), st = (!PEMF_TXT.on && n >= 7) ? PEMF[6] : PEMF[k];
      pemState(ctx.pem, st, dir === 0 ? 0 : 800);
      if (ctx._teach) ctx._teach(ctx, n);
    }
  });

  /* ---------- ttko1 + atc2: policy loans for investments / purchases ---------- */
  const PLF_STEPS = {
    inv: [
      { set: { safe: 0, risk: 0, borrow: 0 } },
      { set: { safe: 0, risk: 0, borrow: 0 }, play: 'PLFFundPolicy' },
      { set: { safe: 50, risk: 0, borrow: 0 }, play: 'PLFTakeLoanInv' },
      { set: { safe: 50, risk: 25, borrow: 25 }, play: 'PLFRepayLoan' },
      { set: { safe: 80, risk: 25, borrow: 0 }, play: 'PLFFundPolicyToMaturity' },
      { set: { safe: 100, risk: 25, borrow: 0 }, play: 'PLFGrowInvestment' }
    ],
    buy: [
      { set: { safe: 0, risk: 0, borrow: 0 } },
      { set: { safe: 0, risk: 0, borrow: 0 }, play: 'PLFFundPolicy' },
      { set: { safe: 50, risk: 0, borrow: 0 }, play: 'PLFTakeLoan' },
      { set: { safe: 50, risk: 0, borrow: 25 }, play: 'PLFRepayLoan' },
      { set: { safe: 80, risk: 0, borrow: 0 }, play: 'PLFFundPolicyToMaturity' }
    ]
  };
  function loanLesson(ctx, kind) {
    const keys = kind === 'inv' ? ['b0', 'b1', 'b2', 'b3', 'b4'] : ['b0', 'b1', 'b2', 'b3'];
    const B = EFA.lib && EFA.lib.bullets;
    const list = B ? B.list(ctx, keys.map((k) => ctx.t(k)), { from: 1, boxed: true, size: 44, gap: 16, text: 'b11-btxt' }) : '';
    ctx.el.innerHTML = `
      <div class="b11-lpanel">
        <h1 class="st-h2" style="font-size:48px;line-height:1.06">${ctx.t('head1')}<br>${ctx.t('head2')}</h1>
        ${list}
      </div>
      ${LIB.disc(ctx, ['loans', 'tax'], 'disc', 'right:40px;left:auto;width:640px;bottom:70px')}`;
    ctx.pem = mountPem(ctx, ctx.el, {
      labels: false, lifestyleStrip: false, scenarioPicker: false, links: false, collateral: 'safe', showBorrowed: true, borrowSource: false,
      showHouse: false, pli: true, safeTaxable: 0, risk: 0, purchase: kind === 'buy' ? 'car' : null,
      frame: { zoom: { scale: 1.05, shift: [-36, -2] }, width: 0.55, expanded: false, panel: '.b11-lpanel', expandShows: ['labels', 'lifestyle'], toggle: true }
    }, { left: 40, top: 60, width: 820, height: 760 });
  }
  function loanStep(ctx, kind, n) {
    const B = EFA.lib && EFA.lib.bullets;
    if (B) B.reveal(ctx, n);
    const p = ctx.pem; if (!p) return;
    const s = PLF_STEPS[kind][n];
    p.stopAll(); p.flowsOff();
    p.set(s.set, { ms: 0 });
    if (s.play) p.play(s.play);
  }
  screen('ttko1', {
    title: 'Policy loans for investments',
    steps: 6,
    copy: {
      head1: 'Policy Loans', head2: 'for Investments',
      b0: 'The insurance company does not limit how you use the money.',
      b1: 'Your cash value is the security for the loan.',
      b2: 'Repaying means paying the insurance company back. Those payments are not new deposits into your policy.',
      b3: 'As your policy grows and more premium goes in, the amount you can borrow grows too.',
      b4: 'Borrowed money can go to work in an opportunity with a higher potential return.',
      disc: 'Investments carry risk, including loss of principal.',
      pemWait: PEM_WAIT,
      _notes: 'Fund the policy, borrow against it to invest, pay the loan back, and keep funding. The policy keeps filling the whole time.\n\n- Each click runs the next stage of the cycle and adds a key point.\n- Use the expand icon to show the full model with labels.\n- Ask: If you could invest without draining your savings, what opportunity would you have taken already?\nPAUSE'
    },
    render(ctx) { loanLesson(ctx, 'inv'); },
    step(ctx, n) { loanStep(ctx, 'inv', n); }
  });
  screen('atc2', {
    title: 'Policy loans for purchases',
    steps: 5,
    copy: {
      head1: 'Policy Loans', head2: 'for Purchases',
      b0: 'As your cash value grows, so do your protection and the amount you can borrow.',
      b1: 'Your cash value is the security for the loan.',
      b2: 'Repaying means paying the insurance company back. Those payments are not new deposits into your policy.',
      b3: 'As your policy grows and more premium goes in, the amount you can borrow grows too.',
      disc: 'Loan availability depends on the contract and any surrender charges.',
      pemWait: PEM_WAIT,
      _notes: 'Most families pay cash for a car or finance it at the dealer. Here the policy becomes the bank: borrow against it, buy the car, and pay yourself back while the policy keeps growing.\n\n- Each click runs the next stage and adds a key point.\n- Ask: Over your lifetime, how many cars do you expect to buy, and who will earn the interest on them?\nPAUSE'
    },
    render(ctx) { loanLesson(ctx, 'buy'); },
    step(ctx, n) { loanStep(ctx, 'buy', n); }
  });

  /* ---------- prs21: the strategy overview, account requirements ---------- */
  screen('prs21', {
    title: 'Reserve strategy overview',
    steps: 3,
    copy: {
      head: 'The Cash Value Reserve Strategy',
      panelHead: 'Account Requirements',
      b0: 'What you gain: a larger savings cushion, and far less worry about money.',
      b1: 'How it works: pair the right kind of savings vehicle with a smarter way to pay for big purchases.',
      b2: 'The one feature it must have: you reach your savings by borrowing against them, not by withdrawing them.',
      disc: 'Outcomes depend on the account, the product and how it is used.',
      pemWait: PEM_WAIT,
      _notes: 'This is the strategy in one picture: the reserve keeps filling while you borrow against it for life\'s big purchases, and pay yourself back.\n\n- The first click starts the demonstration; let it run while you talk through the points.\n- Ask: What would change for you if your savings never had to be drained to pay for something big?\nPAUSE'
    },
    render(ctx) {
      const B = EFA.lib && EFA.lib.bullets;
      ctx.el.innerHTML = `
        <div class="b11-head" style="top:30px"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        <div class="b11-lpanel b11-rpanel" style="top:168px;width:660px">
          <h2 class="st-h2" style="font-size:44px">${ctx.t('panelHead')}</h2>
          <div style="margin-top:44px">${B ? B.list(ctx, ['b0', 'b1', 'b2'].map((k) => ctx.t(k)), { from: 0, boxed: true, size: 44, gap: 18, text: 'b11-btxt' }) : ''}</div>
        </div>
        ${LIB.disc(ctx, ['loans'], 'disc', 'right:40px;left:auto;width:660px;bottom:70px')}`;
      ctx.pem = mountPem(ctx, ctx.el, {
        borrow: 0, regulator: 80, remaining: 100, labels: false, lifestyleStrip: false, links: false, showHouse: false, collateral: 'safe', showBorrowed: true,
        borrowSource: false, safe: 0, risk: 0, scenarioPicker: false, narrow: true,
        frame: { zoom: { scale: 1, shift: [-27, 0] }, width: 0.55, expanded: false, panel: '.b11-rpanel', expandShows: ['labels', 'lifestyle'], toggle: true }
      }, { left: 40, top: 150, width: 820, height: 660 });
    },
    step(ctx, n, dir) {
      const B = EFA.lib && EFA.lib.bullets;
      if (B) B.reveal(ctx, n);
      const p = ctx.pem; if (!p) return;
      if (n === 0) { p.stop('PRS2DemoStrategy'); p.flowsOff(); p.set({ safe: 0, borrow: 0, remaining: 100 }, { ms: 0 }); return; }
      if (!p.playing('PRS2DemoStrategy') && (dir > 0 || dir === 0) && (n === 1 || dir === 0)) p.play('PRS2DemoStrategy');
    }
  });

  /* ---------- ph1: homeowners insurance protects the lender's tank and yours ---------- */
  screen('ph1', {
    title: 'Homeowners insurance protects two tanks',
    steps: 2,
    copy: {
      callR: 'Lenders typically require this coverage to protect their stake in your home.',
      callL: 'It also shields your own savings and investments from absorbing a devastating loss.',
      label: 'Homeowners Insurance',
      pemWait: PEM_WAIT,
      _notes: 'Homeowners insurance does two jobs. The first protects the lender. The second protects you.\n\n- Click once to move the shields from the lender\'s tank to your own.\n- Ask: If a fire or a storm took the house tomorrow, which of your tanks would you drain to rebuild?\nPAUSE\n\n- The calculator opens the homeowners insurance review.'
    },
    render(ctx) {
      ctx.el.innerHTML = `
        <div class="b11-card b11-ph-call cR" style="right:168px;top:84px">${ctx.t('callR')}</div>
        <div class="b11-card b11-ph-call cL" style="left:444px;top:84px">${ctx.t('callL')}</div>
        <div class="b11-card b11-ph-ins" style="right:160px;bottom:131px">${ctx.t('label')}<button type="button" class="calc" aria-label="Calculator">${ART.calc()}</button></div>`;
      const p = ctx.pem = mountPem(ctx, ctx.el, {
        labels: false, collateral: 'house', showBorrowed: true, borrowSource: false, showHouse: true, safe: 33, risk: 33, borrow: 50, house: 60,
        standardLiving: false, links: false, scenarioPicker: false
      });
      if (p) {
        const sh = () => `<div class="b11-shield">${ART.shield('home')}</div>`;
        ctx._sh = { bf: p.place(sh(), 'borrowed', { w: 8.3, h: 10 }), safe: p.place(sh(), 'safe', { w: 8.3, h: 10 }), risk: p.place(sh(), 'risk', { w: 8.3, h: 10 }) };
      }
      ctx.on(ctx.$('.calc'), 'click', () => ctx.jump('HOMEINS', 'homeins1'));
    },
    step(ctx, n) {
      const vis = (el, on) => { if (el) el.style.visibility = on ? 'visible' : 'hidden'; };
      const S = ctx._sh || {};
      vis(S.bf, n === 0); vis(S.safe, n === 1); vis(S.risk, n === 1);
      vis(ctx.$('.cR'), n === 0); vis(ctx.$('.cL'), n === 1);
    }
  });
})();
