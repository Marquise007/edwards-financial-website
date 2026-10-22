/* Original illustration kit: geometry helpers and drawings in the Edwards palette.
   Every drawing is built from scratch here (no outside artwork). */
(function () {
  'use strict';
  const EFA = window.EFA = window.EFA || {};
  const P = {
    navy: '#0d1e3a', navy2: '#14284a', navy3: '#1d3863', navy4: '#2b4c80', steel: '#8aa3c7', water: '#9cb6d8', waterDeep: '#6f8fbd',
    mist: '#e3e8f0', mist2: '#cbd5e3', gold: '#b8972e', goldLt: '#d5bd68', goldPale: '#f0e6c4', goldDeep: '#8a6e22',
    cream: '#f7f5f1', paper: '#fffdf8', rule: '#d6cfc4', white: '#ffffff', shadow: 'rgba(13,30,58,.12)'
  };
  let gid = 0; const nid = (p) => `${p || 'g'}${++gid}`;

  /* angles in degrees: 0 = 12 o'clock, clockwise */
  const rad = (a) => (a * Math.PI) / 180;
  const pt = (cx, cy, r, a) => [cx + r * Math.sin(rad(a)), cy - r * Math.cos(rad(a))];
  const f = (n) => Math.round(n * 100) / 100;
  /** pie or donut wedge path from angle a0 to a1 */
  function wedge(cx, cy, r, a0, a1, rIn) {
    rIn = rIn || 0;
    const sweep = a1 - a0;
    if (sweep >= 359.999) {
      const outer = `M${f(cx)},${f(cy - r)}A${r},${r} 0 1 1 ${f(cx - 0.01)},${f(cy - r)}Z`;
      return rIn ? outer + `M${f(cx)},${f(cy - rIn)}A${rIn},${rIn} 0 1 0 ${f(cx + 0.01)},${f(cy - rIn)}Z` : outer;
    }
    const large = sweep > 180 ? 1 : 0;
    const [x0, y0] = pt(cx, cy, r, a0), [x1, y1] = pt(cx, cy, r, a1);
    if (!rIn) return `M${f(cx)},${f(cy)}L${f(x0)},${f(y0)}A${r},${r} 0 ${large} 1 ${f(x1)},${f(y1)}Z`;
    const [u1, v1] = pt(cx, cy, rIn, a1), [u0, v0] = pt(cx, cy, rIn, a0);
    return `M${f(x0)},${f(y0)}A${r},${r} 0 ${large} 1 ${f(x1)},${f(y1)}L${f(u1)},${f(v1)}A${rIn},${rIn} 0 ${large} 0 ${f(u0)},${f(v0)}Z`;
  }
  /** an arc as an open path (for text on a path or strokes) */
  function arc(cx, cy, r, a0, a1) {
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0, sw = a1 > a0 ? 1 : 0;
    const [x0, y0] = pt(cx, cy, r, a0), [x1, y1] = pt(cx, cy, r, a1);
    return `M${f(x0)},${f(y0)}A${r},${r} 0 ${large} ${sw} ${f(x1)},${f(y1)}`;
  }
  /**
   * Pie chart geometry. slices: [{key, value | deg, fill, explode, rIn}] -> {paths:[{key,d,fill,cx,cy}], anchors:{key:{x,y,mid}}}
   * start: starting angle (deg). Anchors are label positions at labelR (fraction of r).
   */
  function pie(o) {
    const cx = o.cx, cy = o.cy, r = o.r, rIn = o.rIn || 0, start = o.start || 0, gap = o.gap || 0;
    const total = o.slices.reduce((s, x) => s + (x.deg != null ? x.deg : x.value), 0);
    const toDeg = (x) => (x.deg != null ? x.deg : (x.value / total) * 360);
    let a = start; const paths = [], anchors = {};
    o.slices.forEach((s) => {
      const d = toDeg(s), a0 = a, a1 = a + d, mid = (a0 + a1) / 2; a = a1;
      const ex = s.explode || 0; const [dx, dy] = [ex * Math.sin(rad(mid)), -ex * Math.cos(rad(mid))];
      const g0 = gap ? gap / 2 : 0;
      paths.push({ key: s.key, d: wedge(cx + dx, cy + dy, s.r || r, a0 + g0, a1 - g0, s.rIn != null ? s.rIn : rIn), fill: s.fill, mid, a0, a1, dx, dy });
      const lr = (o.labelR != null ? o.labelR : (rIn ? (r + rIn) / 2 / r : 0.6)) * (s.r || r);
      const [lx, ly] = pt(cx + dx, cy + dy, s.labelR != null ? s.labelR * (s.r || r) : lr, mid);
      anchors[s.key] = { x: lx, y: ly, mid };
    });
    return { paths, anchors };
  }

  /* ---------- the Circle of Wealth emblem: three gold arcs around a navy disc ---------- */
  function emblem(o) {
    o = o || {};
    const size = o.size || 400, id = nid('em');
    const c = 200, rOut = 194, rIn = 168, rDisc = 150;
    const arcs = [[-28, 82], [92, 202], [212, 322]].map(([a0, a1]) => {
      const rm = (rOut + rIn) / 2;
      const p0 = pt(c, c, rOut, a0), p1 = pt(c, c, rOut, a1), q1 = pt(c, c, rIn, a1), q0 = pt(c, c, rIn, a0);
      const t1 = pt(c, c, rOut + 9, a1), tip = pt(c, c, rm, a1 + 10), t2 = pt(c, c, rIn - 9, a1);
      return `M${f(p0[0])},${f(p0[1])}A${rOut},${rOut} 0 0 1 ${f(p1[0])},${f(p1[1])}L${f(t1[0])},${f(t1[1])}L${f(tip[0])},${f(tip[1])}L${f(t2[0])},${f(t2[1])}L${f(q1[0])},${f(q1[1])}A${rIn},${rIn} 0 0 0 ${f(q0[0])},${f(q0[1])}Z`;
    });
    return `<svg viewBox="0 0 400 400" width="${size}" height="${size}" aria-hidden="true" class="${o.cls || ''}">
      <defs>
        <linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset=".55" stop-color="${P.gold}"/><stop offset="1" stop-color="${P.goldDeep}"/></linearGradient>
        <linearGradient id="${id}b" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.gold}"/><stop offset="1" stop-color="${P.goldLt}"/></linearGradient>
        <radialGradient id="${id}d" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="${P.navy4}"/><stop offset=".55" stop-color="${P.navy3}"/><stop offset="1" stop-color="${P.navy}"/></radialGradient>
      </defs>
      <circle cx="${c}" cy="${c}" r="${rDisc}" fill="url(#${id}d)"/>
      <circle cx="${c}" cy="${c}" r="${rDisc - 9}" fill="none" stroke="${P.gold}" stroke-opacity=".45" stroke-width="1.5"/>
      ${arcs.map((d, i) => `<path d="${d}" fill="url(#${id}${i === 1 ? 'b' : 'a'})"/>`).join('')}
      ${o.label === false ? '' : ''}
    </svg>`;
  }

  /* ---------- illustrations (flat duotone, navy + gold on paper) ---------- */
  const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${P.shadow}"/>`;
  const svg = (vb, body, o) => `<svg viewBox="${vb}" ${o && o.w ? `width="${o.w}"` : ''} ${o && o.h ? `height="${o.h}"` : ''} aria-hidden="true" class="ill ${o && o.cls ? o.cls : ''}">${body}</svg>`;

  const ill = {
    house(o) {
      return svg('0 0 260 210', `
        ${shadow(130, 192, 112, 10)}
        <rect x="52" y="96" width="156" height="90" fill="${P.paper}" stroke="${P.navy}" stroke-width="4"/>
        <rect x="166" y="40" width="20" height="44" fill="${P.navy3}"/>
        <path d="M30 104 130 30l100 74" fill="${P.navy}" stroke="${P.navy}" stroke-width="6" stroke-linejoin="round"/>
        <path d="M44 100 130 38l86 62" fill="none" stroke="${P.gold}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="114" y="124" width="32" height="62" rx="3" fill="${P.gold}"/>
        <circle cx="139" cy="157" r="2.6" fill="${P.navy}"/>
        <g fill="${P.mist}" stroke="${P.navy}" stroke-width="3"><rect x="68" y="116" width="32" height="30"/><rect x="160" y="116" width="32" height="30"/></g>
        <g stroke="${P.navy}" stroke-width="2"><path d="M84 116v30M68 131h32M176 116v30M160 131h32"/></g>
        <path d="M60 186h140" stroke="${P.navy}" stroke-width="4" stroke-linecap="round"/>`, o);
    },
    creditCards(o) {
      return svg('0 0 260 190', `
        ${shadow(132, 176, 100, 8)}
        <g transform="rotate(-9 125 85)"><rect x="34" y="36" width="176" height="110" rx="12" fill="${P.navy}"/><rect x="34" y="58" width="176" height="20" fill="${P.navy4}"/></g>
        <rect x="58" y="62" width="176" height="110" rx="12" fill="${P.gold}"/>
        <rect x="58" y="62" width="176" height="110" rx="12" fill="none" stroke="${P.goldDeep}" stroke-width="2"/>
        <rect x="78" y="88" width="34" height="26" rx="5" fill="${P.goldPale}" stroke="${P.goldDeep}" stroke-width="2"/>
        <path d="M78 101h34M95 88v26" stroke="${P.goldDeep}" stroke-width="1.6"/>
        <g fill="${P.navy}">${[0, 1, 2, 3].map((g) => [0, 1, 2, 3].map((d) => `<circle cx="${80 + g * 38 + d * 8}" cy="134" r="2.6"/>`).join('')).join('')}</g>
        <rect x="78" y="148" width="70" height="7" rx="3.5" fill="${P.navy}" opacity=".55"/>
        <circle cx="206" cy="150" r="10" fill="${P.navy}" opacity=".9"/><circle cx="218" cy="150" r="10" fill="${P.paper}" opacity=".8"/>`, o);
    },
    bank(o) {
      const cols = [0, 1, 2, 3].map((i) => {
        const x = 62 + i * 44;
        return `<rect x="${x}" y="104" width="22" height="104" fill="${P.paper}" stroke="${P.navy}" stroke-width="3"/>
          <path d="M${x + 7} 110v92M${x + 15} 110v92" stroke="${P.mist2}" stroke-width="2"/>
          <rect x="${x - 4}" y="96" width="30" height="10" fill="${P.navy}"/><rect x="${x - 4}" y="206" width="30" height="8" fill="${P.navy}"/>`;
      }).join('');
      return svg('0 0 260 270', `
        ${shadow(130, 256, 118, 9)}
        <path d="M24 82 130 22l106 60z" fill="${P.navy}"/>
        <path d="M44 76 130 30l86 46z" fill="none" stroke="${P.gold}" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="130" cy="60" r="15" fill="${P.gold}"/><text x="130" y="67" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="20" fill="${P.navy}">$</text>
        <rect x="30" y="80" width="200" height="16" fill="${P.navy3}"/>
        ${cols}
        <rect x="40" y="214" width="180" height="12" fill="${P.navy3}"/>
        <rect x="28" y="226" width="204" height="12" fill="${P.navy}"/>
        <rect x="16" y="238" width="228" height="12" fill="${P.navy3}"/>`, o);
    },
    taxes(o) {
      return svg('0 0 260 230', `
        ${shadow(132, 216, 96, 8)}
        <path d="M54 18h108l36 36v152H54z" fill="${P.paper}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M162 18v36h36" fill="${P.mist}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
        <text x="74" y="70" font-family="DM Sans, sans-serif" font-weight="700" font-size="30" letter-spacing="2" fill="${P.navy}">TAX</text>
        <g stroke="${P.mist2}" stroke-width="6" stroke-linecap="round"><path d="M74 96h96M74 116h80M74 136h96M74 156h60M74 176h88"/></g>
        <circle cx="176" cy="150" r="38" fill="${P.goldPale}" fill-opacity=".6" stroke="${P.gold}" stroke-width="9"/>
        <path d="M204 178l30 30" stroke="${P.navy}" stroke-width="14" stroke-linecap="round"/>
        <path d="M162 136c4-8 14-12 22-10" stroke="${P.paper}" stroke-width="5" stroke-linecap="round" fill="none"/>`, o);
    },
    car(o) {
      return svg('0 0 320 170', `
        ${shadow(160, 152, 136, 9)}
        <path d="M28 120c0-14 8-24 22-27l42-9 32-34c6-6 14-9 22-9h64c10 0 18 4 24 11l26 32 26 6c12 3 20 13 20 26v12c0 6-5 11-11 11H39c-6 0-11-5-11-11z" fill="${P.navy}"/>
        <path d="M110 84l26-28c4-4 9-6 15-6h28v34z" fill="${P.mist}"/>
        <path d="M189 50h22c7 0 13 3 17 8l20 26h-59z" fill="${P.mist}"/>
        <path d="M40 112h250" stroke="${P.gold}" stroke-width="4" stroke-linecap="round"/>
        <rect x="270" y="98" width="20" height="9" rx="4" fill="${P.goldLt}"/>
        ${[86, 236].map((x) => `<circle cx="${x}" cy="136" r="24" fill="${P.navy2}" stroke="${P.paper}" stroke-width="4"/><circle cx="${x}" cy="136" r="10" fill="${P.gold}"/>`).join('')}`, o);
    },
    office(o) {
      let win = '';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) win += `<rect x="${74 + c * 24}" y="${44 + r * 28}" width="14" height="18" fill="${(r + c) % 3 ? P.mist : P.goldLt}"/>`;
      return svg('0 0 280 230', `
        ${shadow(140, 216, 124, 9)}
        <rect x="60" y="28" width="110" height="182" fill="${P.navy}"/>
        <rect x="60" y="20" width="110" height="10" fill="${P.navy3}"/>
        ${win}
        <path d="M170 104h86v106h-86z" fill="${P.paper}" stroke="${P.navy}" stroke-width="4"/>
        <path d="M164 108l49-30 49 30" fill="none" stroke="${P.navy}" stroke-width="6" stroke-linejoin="round"/>
        <rect x="190" y="140" width="46" height="70" fill="${P.mist}" stroke="${P.navy}" stroke-width="3"/>
        <path d="M190 154h46M190 168h46M190 182h46M190 196h46" stroke="${P.navy}" stroke-width="2"/>
        <rect x="104" y="180" width="22" height="30" fill="${P.gold}"/>`, o);
    },
    loan(o) {
      return svg('0 0 260 230', `
        ${shadow(130, 216, 96, 8)}
        <path d="M54 18h150v188H54z" fill="${P.paper}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
        <rect x="74" y="38" width="110" height="12" rx="6" fill="${P.navy}"/>
        <g stroke="${P.mist2}" stroke-width="6" stroke-linecap="round"><path d="M74 72h110M74 92h96M74 112h110M74 132h84"/></g>
        <path d="M74 176h110" stroke="${P.navy}" stroke-width="2.5"/>
        <path d="M80 168c10-14 18-14 20-4s10 8 16-4 12-6 16 2 14 4 20-6" fill="none" stroke="${P.gold}" stroke-width="4" stroke-linecap="round"/>
        <path d="M206 74 226 54l14 14-20 20-20 6z" fill="${P.navy}"/>
        <path d="M206 74l14 14" stroke="${P.gold}" stroke-width="3"/>`, o);
    },
    equipment(o) {
      const gear = (cx, cy, r, teeth, fill) => {
        let d = '';
        for (let i = 0; i < teeth; i++) {
          const a = (360 / teeth) * i;
          const [x1, y1] = pt(cx, cy, r + 12, a - 7), [x2, y2] = pt(cx, cy, r + 12, a + 7);
          const [x0, y0] = pt(cx, cy, r - 2, a - 11), [x3, y3] = pt(cx, cy, r - 2, a + 11);
          d += `M${f(x0)},${f(y0)}L${f(x1)},${f(y1)}L${f(x2)},${f(y2)}L${f(x3)},${f(y3)}Z`;
        }
        return `<path d="${d}" fill="${fill}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.38}" fill="${P.paper}"/>`;
      };
      return svg('0 0 260 220', `${shadow(130, 206, 100, 8)}${gear(100, 110, 56, 10, P.navy)}${gear(186, 72, 34, 8, P.gold)}${gear(184, 160, 26, 7, P.navy4)}`, o);
    },
    golfBag(o) {
      return svg('0 0 220 290', `
        ${shadow(110, 276, 70, 8)}
        <path d="M72 40l-14-30M110 34V4M146 40l14-28" stroke="${P.navy4}" stroke-width="5" stroke-linecap="round"/>
        <path d="M44 6l22 8-4 10-20-6z" fill="${P.gold}"/><rect x="100" y="0" width="26" height="14" rx="6" fill="${P.navy}"/><path d="M152 14l22-8 4 10-22 8z" fill="${P.gold}"/>
        <path d="M60 52h100l-8 208c0 8-6 12-14 12H82c-8 0-14-4-14-12z" fill="${P.navy}"/>
        <rect x="56" y="40" width="108" height="20" rx="8" fill="${P.navy3}"/>
        <rect x="64" y="110" width="92" height="14" fill="${P.gold}"/><rect x="66" y="208" width="88" height="10" fill="${P.gold}"/>
        <rect x="128" y="140" width="22" height="52" rx="6" fill="${P.navy3}"/>
        <path d="M60 70c-36 40-36 120 6 170" fill="none" stroke="${P.goldDeep}" stroke-width="6" stroke-linecap="round"/>`, o);
    },
    golfSwing(o) {
      return svg('0 0 260 290', `
        ${shadow(130, 274, 96, 8)}
        <path d="M58 52A110 110 0 1 0 214 112" fill="none" stroke="${P.gold}" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round"/>
        <path d="M70 70A96 96 0 0 0 98 214" fill="none" stroke="${P.goldLt}" stroke-width="12" stroke-linecap="round" opacity=".55"/>
        <path d="M150 112 108 238" stroke="${P.navy}" stroke-width="7" stroke-linecap="round"/>
        <path d="M100 236c-2 10 6 16 22 14l12-4-4-10z" fill="${P.navy}"/>
        <rect x="140" y="104" width="16" height="30" rx="5" transform="rotate(18 148 118)" fill="${P.navy3}"/>
        <circle cx="168" cy="244" r="10" fill="${P.white}" stroke="${P.navy}" stroke-width="3"/>
        <path d="M184 236c30-24 52-60 58-104" fill="none" stroke="${P.navy4}" stroke-width="3" stroke-dasharray="3 10" stroke-linecap="round"/>
        <path d="M150 252h-26M156 262h-24" stroke="${P.goldDeep}" stroke-width="3" stroke-linecap="round" opacity=".6"/>`, o);
    },
    bats(o) {
      const bat = (rot) => `<g transform="rotate(${rot} 110 150)"><path d="M104 40c0-8 12-8 12 0l6 150c1 8-3 12-6 14h-12c-3-2-7-6-6-14z" fill="${P.gold}"/><path d="M110 196v40" stroke="${P.goldDeep}" stroke-width="10" stroke-linecap="round"/><ellipse cx="110" cy="240" rx="10" ry="5" fill="${P.navy}"/></g>`;
      return svg('0 0 220 290', `${shadow(110, 276, 80, 8)}${bat(-16)}${bat(16)}<circle cx="110" cy="248" r="22" fill="${P.white}" stroke="${P.navy}" stroke-width="3"/><path d="M95 236c8 6 8 18 0 24M125 236c-8 6-8 18 0 24" fill="none" stroke="${P.gold}" stroke-width="2.4"/>`, o);
    },
    batSwing(o) {
      return svg('0 0 260 290', `
        ${shadow(130, 274, 96, 8)}
        <path d="M40 150A100 100 0 0 0 230 170" fill="none" stroke="${P.gold}" stroke-width="5" stroke-dasharray="2 14" stroke-linecap="round"/>
        <path d="M58 196A92 92 0 0 0 150 238" fill="none" stroke="${P.goldLt}" stroke-width="12" stroke-linecap="round" opacity=".55"/>
        <g transform="rotate(64 128 214)"><path d="M120 120c0-8 14-8 14 0l7 150c1 8-4 12-7 14h-14c-3-2-8-6-7-14z" fill="${P.gold}"/><path d="M127 280v26" stroke="${P.goldDeep}" stroke-width="10" stroke-linecap="round"/></g>
        <circle cx="212" cy="196" r="15" fill="${P.white}" stroke="${P.navy}" stroke-width="3"/><path d="M203 188c5 4 5 12 0 16M221 188c-5 4-5 12 0 16" fill="none" stroke="${P.gold}" stroke-width="2"/>
        <path d="M228 186c14-20 22-46 22-74" fill="none" stroke="${P.navy4}" stroke-width="3" stroke-dasharray="3 10" stroke-linecap="round"/>`, o);
    },
    /** faucet pouring into a bucket; state: 'leak' | 'fixed' */
    bucket(o) {
      o = o || {};
      const fixed = o.state === 'fixed', id = nid('bk');
      const holes = [[262, 410], [338, 432], [418, 428], [482, 404]];
      const leaks = holes.map(([x, y], i) => {
        const dir = i < 2 ? -1 : 1, x2 = x + dir * (70 + i * 6), y2 = 528;
        return `<path class="leak" d="M${x},${y}Q${x + dir * 40},${y + 24} ${x2},${y2}" fill="none" stroke="url(#${id}w)" stroke-width="${7 - i * 0.6}" stroke-linecap="round"/>`;
      }).join('');
      return `<svg viewBox="0 0 760 600" ${o.w ? `width="${o.w}"` : ''} aria-hidden="true" class="ill ${o.cls || ''}">
        <defs>
          <linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="${P.mist2}"/><stop offset=".45" stop-color="${P.paper}"/><stop offset="1" stop-color="${P.mist2}"/></linearGradient>
          <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.water}"/><stop offset="1" stop-color="${P.waterDeep}"/></linearGradient>
        </defs>
        <rect x="0" y="40" width="34" height="120" fill="${P.navy3}"/>
        <path d="M34 92h168c22 0 38 16 38 38v30" fill="none" stroke="${P.navy}" stroke-width="34" stroke-linejoin="round"/>
        <rect x="222" y="156" width="36" height="16" rx="4" fill="${P.navy}"/>
        <rect x="140" y="52" width="16" height="30" fill="${P.navy3}"/><rect x="104" y="40" width="88" height="16" rx="8" fill="${P.gold}"/>
        <path class="stream" d="M232 172c-2 60 2 150 0 236h16c-2-86 2-176 0-236z" fill="url(#${id}w)" opacity=".9"/>
        <ellipse class="puddle" cx="380" cy="540" rx="300" ry="40" fill="${P.water}" opacity="${fixed ? 0 : 0.55}"/>
        ${fixed ? '' : leaks}
        <path d="M220 300h320l-30 190c-2 14-14 24-28 24H278c-14 0-26-10-28-24z" fill="url(#${id}b)" stroke="${P.navy}" stroke-width="6" stroke-linejoin="round"/>
        ${fixed ? `<path d="M232 330h296l-4 26H236z" fill="url(#${id}w)" opacity=".85"/>` : `<path d="M240 420h280l-4 26H244z" fill="url(#${id}w)" opacity=".5"/>`}
        <ellipse cx="380" cy="300" rx="160" ry="20" fill="${P.navy2}" stroke="${P.navy}" stroke-width="6"/>
        <path d="M228 304c0-120 304-120 304 0" fill="none" stroke="${P.navy}" stroke-width="7"/>
        <path d="M240 360h284M246 400h272M252 440h260" stroke="${P.navy}" stroke-width="2" opacity=".18"/>
        ${holes.map(([x, y]) => fixed ? `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="4" fill="${P.gold}" stroke="${P.goldDeep}" stroke-width="2"/>` : `<circle cx="${x}" cy="${y}" r="7" fill="${P.navy}"/>`).join('')}
      </svg>`;
    }
  };

  EFA.art = { P, wedge, arc, pie, pt, emblem, ill };
})();
