/* Shared components: the dart bullet and bullet lists revealed step by step (app-svg-bullet), the glossy
   bubble circle (app-svg-circle), the two-way arrow pair on a spoke (app-svg-arrows), and the skip helper
   that stands in for app-step-navigation's skip button. Drawn fresh in code in the house palette.
   API and examples: docs/components.md */
(function () {
  'use strict';
  const EFA = window.EFA = window.EFA || {};
  const L = EFA.lib = EFA.lib || {};
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const P = (EFA.art && EFA.art.P) || { navy: '#0d1e3a', navy3: '#1d3863', navy4: '#2b4c80', gold: '#b8972e', goldLt: '#d5bd68', goldPale: '#f0e6c4', goldDeep: '#8a6e22', mist: '#e3e8f0', mist2: '#cbd5e3', cream: '#f7f5f1', paper: '#fffdf8' };
  const r2 = (n) => Math.round(n * 100) / 100;
  let gid = 0;
  const nid = (p) => `${p}${++gid}${Math.random().toString(36).slice(2, 5)}`;

  EFA.css('lib-bullets', `
  .lib-bul-dart { display: block; overflow: visible; filter: drop-shadow(-2px 4px 3px rgba(13,30,58,.32)); }
  .stage .lib-bul { display: grid; gap: var(--lib-bul-gap, 18px); margin: 0; padding: 0; }
  .stage .lib-bul-row { display: grid; grid-template-columns: var(--lib-bul-w, 30px) 1fr; column-gap: .55em; align-items: start; margin: 0; transition: opacity .8s ease; }
  .stage .lib-bul-row.is-off { transition-duration: .3s; }
  .stage .lib-bul-ico { height: 1lh; display: flex; align-items: center; }
  .stage .lib-bul-txt { min-width: 0; }
  .stage .lib-bul.boxed .lib-bul-txt { background: var(--paper); border: 1px solid var(--rule); border-radius: 12px; padding: 12px 18px; box-shadow: 0 8px 22px rgba(13,30,58,.06); }
  .stage .lib-bul.boxed .lib-bul-ico { height: calc(1lh + 24px); }

  .stage .lib-bub { position: absolute; display: grid; place-items: center; border-radius: 50%; }
  .stage .lib-bub > svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .stage .lib-bub.clickable { cursor: pointer; transition: transform .25s ease; }
  .stage .lib-bub.clickable:hover { transform: scale(1.04); }
  .stage .lib-bub-label { position: relative; max-width: 76%; text-align: center; font: 700 var(--lib-bub-font, 20px)/1.18 var(--f-body); letter-spacing: .05em; text-transform: uppercase; color: var(--cream); pointer-events: none; overflow-wrap: break-word; }
  .stage .lib-bub-label [data-cp] { pointer-events: auto; }
  .stage .lib-bub--gold .lib-bub-label, .stage .lib-bub--light .lib-bub-label { color: var(--navy); }
  .stage .lib-bub-c { transition: fill .35s ease; }

  .stage .lib-arw { position: absolute; display: block; pointer-events: none; transform-origin: 50% 50%; }
  .stage .lib-arw > svg { display: block; width: 100%; height: 100%; overflow: visible; }
  @keyframes lib-wink { 0% { opacity: 0; } 33.2% { opacity: 1; } 33.34% { opacity: 0; } 66.5% { opacity: 1; } 66.67% { opacity: 0; } 100% { opacity: 1; } }
  .stage .lib-wink { animation: lib-wink 1.5s linear both; }
  `);

  /* =====================================================================================
     EFA.lib.bullets
     ===================================================================================== */
  /** the dart: deep concave notch at the rear, long convex flanks to a sharp tip (viewBox 90 x 66) */
  const DART = 'M3,3 C15,9 29,21 37,33 C29,45 15,57 3,63 C29,60 62,49 88,33 C62,17 29,6 3,3 Z';
  function dart(o) {
    o = o || {};
    const w = o.size || 30, h = r2(w * 66 / 90);
    return `<svg class="lib-bul-dart${o.cls ? ' ' + o.cls : ''}" viewBox="0 0 90 66" width="${w}" height="${h}" aria-hidden="true" focusable="false"><path d="${DART}" fill="${P.navy}"/><path d="M8,6.5 C30,10 58,19 80,31.5" fill="none" stroke="${P.navy4}" stroke-width="3" stroke-linecap="round" opacity=".85"/></svg>`;
  }
  function row(html, o) {
    o = o || {};
    const at = o.at != null ? +o.at : null;
    const hidden = at != null && at > 0;
    return `<div class="lib-bul-row ${o.text || 'st-body'}${hidden ? ' is-off' : ''}${o.cls ? ' ' + o.cls : ''}" role="listitem"${at != null ? ` data-lib-at="${at}"` : ''}><span class="lib-bul-ico">${dart({ size: o.size || 30 })}</span><div class="lib-bul-txt">${html == null ? '' : html}</div></div>`;
  }
  L.bullets = {
    dart,
    row,
    list(ctx, items, o) {
      o = o || {};
      const from = o.from != null ? +o.from : 1, every = o.every != null ? +o.every : 1, size = o.size || 30;
      const own = (v) => { // a screen copy key is rendered with ctx.t; anything else is HTML as given
        if (typeof v !== 'string' || !ctx || !/^[\w.-]+$/.test(v)) return v;
        const d = EFA.screens && EFA.screens[ctx.id];
        return d && d.copy && Object.prototype.hasOwnProperty.call(d.copy, v) ? ctx.t(v) : v;
      };
      const rows = (items || []).map((it, i) => {
        const obj = it && typeof it === 'object' ? Object.assign({}, it, { html: own(it.html) }) : { html: own(it) };
        const at = o.reveal === false ? null : (obj.at != null ? +obj.at : from + i * every);
        return row(obj.html, { at, size, text: o.text });
      }).join('');
      const style = `--lib-bul-w:${size}px;--lib-bul-gap:${o.gap != null ? o.gap : 18}px;${o.style || ''}`;
      return `<div class="lib-bul${o.boxed ? ' boxed' : ''}${o.cls ? ' ' + o.cls : ''}" role="list" style="${esc(style)}">${rows}</div>`;
    },
    reveal(ctx, n, root) {
      const base = typeof root === 'string' ? ctx.el.querySelector(root) : (root || ctx.el);
      if (!base) return;
      base.querySelectorAll('[data-lib-at]').forEach((r) => r.classList.toggle('is-off', +r.getAttribute('data-lib-at') > n));
    }
  };

  /* =====================================================================================
     EFA.lib.bubble: glossy sphere behind labelled circles
     ===================================================================================== */
  const TONES = {
    navy: [['0', '#4d6da3'], ['.5', P.navy3], ['1', P.navy]],
    gold: [['0', '#fbf4dc'], ['.45', P.goldLt], ['1', P.goldDeep]],
    light: [['0', '#ffffff'], ['.55', P.mist], ['1', '#a9bad3']]
  };
  const toneOf = (t) => (TONES[t] ? t : 'navy');
  function bubbleSvg(o) {
    o = o || {};
    const id = nid('bub'), tone = toneOf(o.tone), s = o.size || 200;
    const grads = Object.keys(TONES).map((k) => `<radialGradient id="${id}-${k}" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">${TONES[k].map(([off, c]) => `<stop offset="${off}" stop-color="${c}"/>`).join('')}</radialGradient>`).join('');
    return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true" focusable="false" data-bub="${id}"><defs>${grads}</defs><circle class="lib-bub-c" cx="50" cy="50" r="49" fill="url(#${id}-${tone})"/></svg>`;
  }
  L.bubble = {
    svg: bubbleSvg,
    circle(o) {
      o = o || {};
      const s = o.size || 200, tone = toneOf(o.tone);
      const font = o.font || Math.max(15, Math.round(s * 0.1));
      const x = (o.x != null ? o.x : s / 2) - s / 2, y = (o.y != null ? o.y : s / 2) - s / 2;
      return `<div class="lib-bub lib-bub--${tone}${o.cls ? ' ' + o.cls : ''}" style="left:${r2(x)}px;top:${r2(y)}px;width:${s}px;height:${s}px;--lib-bub-font:${font}px;${esc(o.style || '')}" ${o.attrs || ''}>${bubbleSvg({ size: s, tone })}<div class="lib-bub-label">${o.label || ''}</div></div>`;
    },
    tone(el, tone) {
      if (!el) return;
      const b = el.classList && el.classList.contains('lib-bub') ? el : (el.closest && el.closest('.lib-bub')) || (el.querySelector && el.querySelector('.lib-bub'));
      if (!b) return;
      const t = toneOf(tone);
      Object.keys(TONES).forEach((k) => b.classList.toggle('lib-bub--' + k, k === t));
      const svg = b.querySelector('svg[data-bub]'), c = b.querySelector('.lib-bub-c');
      if (svg && c) c.setAttribute('fill', `url(#${svg.getAttribute('data-bub')}-${t})`);
    }
  };

  /* =====================================================================================
     EFA.lib.arrows: two-way arrow pair (viewBox 200 x 75)
     ===================================================================================== */
  function arrowsSvg(o) {
    o = o || {};
    const w = o.w || 96, h = r2(w * 75 / 200);
    const top = o.oneWay
      ? `<path d="M3,21 H172" stroke="${P.navy}" stroke-width="4.5" stroke-linecap="round"/><path d="M168,10 L190,21 L168,32 Z" fill="${P.navy}" stroke="${P.navy}" stroke-width="2" stroke-linejoin="round"/>`
      : `<rect x="3" y="16" width="146" height="10" rx="2" fill="${P.navy}"/><path d="M145,6 L197,21 L145,36 Z" fill="${P.navy}" stroke="${P.navy}" stroke-width="2" stroke-linejoin="round"/>`;
    const low = o.oneWay ? '' : `<path d="M54,54 H197" stroke="#667389" stroke-width="10" stroke-dasharray="17 8"/><path d="M57,39 L3,54 L57,69 Z" fill="#667389" stroke="#667389" stroke-width="2" stroke-linejoin="round"/>`;
    return `<svg viewBox="0 0 200 75" width="${w}" height="${h}" aria-hidden="true" focusable="false">${top}${low}</svg>`;
  }
  L.arrows = {
    svg: arrowsSvg,
    spoke(o) {
      o = o || {};
      const w = o.w || 96, h = w * 75 / 200;
      const [x1, y1] = o.from || [0, 0], [x2, y2] = o.to || [0, 0];
      const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      let along;
      if (o.radii) { const [ra, rb] = o.radii; along = (ra + (d - rb)) / 2; } else along = d * (o.at != null ? o.at : 0.5);
      const cx = x1 + ux * along, cy = y1 + uy * along;
      const ang = Math.atan2(dy, dx) * 180 / Math.PI;
      return `<div class="lib-arw${o.cls ? ' ' + o.cls : ''}" style="left:${r2(cx - w / 2)}px;top:${r2(cy - h / 2)}px;width:${w}px;height:${r2(h)}px;transform:rotate(${r2(ang)}deg);${esc(o.style || '')}" ${o.attrs || ''}>${arrowsSvg({ w, oneWay: o.oneWay })}</div>`;
    },
    wink(el) {
      if (!el || !el.classList) return;
      el.classList.remove('lib-wink');
      void el.offsetWidth; // restart the animation
      el.classList.add('lib-wink');
    }
  };

  /* =====================================================================================
     EFA.lib.steps: the original's "skip ahead" button behavior
     ===================================================================================== */
  L.steps = {
    skip(ctx) {
      const pl = EFA.player;
      if (!pl || !pl.pres) return;
      if (pl.idx < pl.pres.screens.length - 1) { pl.goScreen(pl.idx + 1); return; }
      if (pl.stack && pl.stack.length) { pl.back(); return; }
      const steps = (pl.def && pl.def.steps) || 1;
      if (pl.step < steps - 1) pl.goStep(steps - 1);
      pl.next();
    }
  };
})();
