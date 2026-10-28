// Base layout primitives.
//
// Standard financial charting: rings, donuts, a confidence fan, a balance sheet. Drawn
// from scratch against the engine's own output. This is the base the Edwards build starts
// from, matched to the reference layout so that every later change is a change we chose
// rather than a difference nobody can account for.

// SVG text does not wrap, so a label that is too wide spills over the card. Broken here.
function wrap(text, max) {
  const words = String(text ?? '').split(' ');
  const lines = []; let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max && line) { lines.push(line); line = w; }
    else line = (line + ' ' + w).trim();
  }
  if (line) lines.push(line);
  // Never drop words: if it ran past two lines, fold the rest onto the second.
  if (lines.length > 2) return [lines[0], lines.slice(1).join(' ')];
  return lines;
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const PAL = {
  blue:    '#4e5fd4',
  blueDk:  '#3d4cb8',
  teal:    '#4aa89c',
  ink:     '#3c4043',
  label:   '#4a6fd4',
  muted:   '#9aa0a6',
  line:    '#e8e8e8',
  band:    '#f3f1ef',
  page:    '#ffffff',
  fanOut:  '#ccd4f2',
  fanIn:   '#92a1e3',
  // the allocation palette, in the order the legend lists them
  slices: ['#5b5fd6', '#4ec3e0', '#8b5fd6', '#d64e9e', '#6ec46e', '#2eae8e', '#f5a623', '#dcdcdc'],
  tax:    ['#4e5fd4', '#f5a623', '#6ec46e'],
};

const money = n => {
  const a = Math.abs(Math.round(n));
  return (n < 0 ? '-' : '') + '$' + a.toLocaleString('en-US');
};
const mm = n => {
  const a = Math.abs(n);
  return (n < 0 ? '-' : '') + '$' + (a >= 1e6 ? (a / 1e6).toFixed(2) + 'mm'
       : a >= 1e3 ? (a / 1e3).toFixed(0) + 'k' : Math.round(a));
};

// --- 1. the big probability ring -------------------------------------------
// A single open ring with a blue-to-teal sweep, the figure large in the middle.
export function bigRing({ pct, label, size = 196, stroke = 6 }) {
  const r = (size - stroke) / 2, c = size / 2, circ = 2 * Math.PI * r;
  const on = Math.max(0, Math.min(1, pct / 100)) * circ;
  const id = 'g' + Math.random().toString(36).slice(2, 8);
  return `<div class="rc-ring">
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${PAL.blue}"/><stop offset="100%" stop-color="${PAL.teal}"/>
      </linearGradient></defs>
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#e9e9e9" stroke-width="${stroke}"/>
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="url(#${id})" stroke-width="${stroke}"
        stroke-dasharray="${on} ${circ - on}" stroke-linecap="round"
        transform="rotate(-90 ${c} ${c})"/>
      <text class="rc-ring-v" x="${c}" y="${c + 1}" text-anchor="middle">${esc(pct)}%</text>
      ${(label ?? '').split('\n').filter(Boolean).map((l, i) =>
        `<text class="rc-ring-l" x="${c}" y="${c + 17 + i * 12}" text-anchor="middle">${esc(l)}</text>`).join('')}
    </svg>
  </div>`;
}

// --- 2. the small ticked ring ----------------------------------------------
// Built from short radial ticks rather than a solid arc.
export function tickedRing({ value, label, size = 118, ticks = 96 }) {
  const c = size / 2, rOut = c - 3, rIn = c - 10;
  let marks = '';
  for (let i = 0; i < ticks; i++) {
    const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
    marks += `<line x1="${(c + Math.cos(a) * rIn).toFixed(2)}" y1="${(c + Math.sin(a) * rIn).toFixed(2)}"
      x2="${(c + Math.cos(a) * rOut).toFixed(2)}" y2="${(c + Math.sin(a) * rOut).toFixed(2)}"/>`;
  }
  return `<div class="rc-tick">
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <g class="rc-tick-m">${marks}</g>
      <text class="rc-tick-v" x="${c}" y="${c + 1}" text-anchor="middle">${esc(value)}</text>
      ${wrap(label, 15).map((l, i) =>
        `<text class="rc-tick-l" x="${c}" y="${c + 14 + i * 10}" text-anchor="middle">${esc(l)}</text>`).join('')}
    </svg>
  </div>`;
}

// --- 3. the confidence fan -------------------------------------------------
// Axis labels want round figures: $20mm, not $20.00mm.
const axisMoney = n => {
  const a = Math.abs(n);
  if (a >= 1e6) { const v = a / 1e6; return '$' + (v % 1 ? v.toFixed(1) : v) + 'mm'; }
  if (a >= 1e3) return '$' + Math.round(a / 1e3) + 'k';
  return '$' + Math.round(a);
};

export function fan({ bands, ages, width = 380, height = 190 }) {
  const L = 48, R = 8, T = 8, B = 34;
  const n = bands.p50.length;
  const max = Math.max(...bands.p95);
  const step = Math.pow(10, Math.floor(Math.log10(max || 1)));
  const top = Math.ceil(max / step) * step || 1;
  const x = i => L + (i / Math.max(1, n - 1)) * (width - L - R);
  const y = v => T + (1 - v / top) * (height - T - B);
  const area = (hi, lo) => hi.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')
    + lo.map((v, i) => `L${x(lo.length - 1 - i).toFixed(1)},${y(lo[lo.length - 1 - i]).toFixed(1)}`).join('') + 'Z';

  let grid = '';
  for (let i = 0; i <= 4; i++) {
    const v = (i / 4) * top, yy = y(v);
    grid += `<line class="rc-g" x1="${L}" y1="${yy}" x2="${width - R}" y2="${yy}"/>
      <text class="rc-ax" x="${L - 7}" y="${yy + 3}" text-anchor="end">${axisMoney(v)}</text>`;
  }
  let xs = '';
  const marks = [0, Math.round(n * .25), Math.round(n * .5), Math.round(n * .75), n - 1];
  for (const i of marks) if (ages?.[i] != null)
    xs += `<text class="rc-axx" x="${x(i)}" y="${height - B + 18}" text-anchor="middle">${ages[i]}</text>`;

  return `<svg class="rc-fan" viewBox="0 0 ${width} ${height}" width="100%">
    ${grid}
    <path class="rc-f-out" d="${area(bands.p95, bands.p5)}"/>
    <path class="rc-f-in"  d="${area(bands.p75, bands.p25)}"/>
    <path class="rc-f-med" d="${bands.p50.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')}"/>
    ${xs}
  </svg>`;
}

// --- 4. the donut ----------------------------------------------------------
export function donut({ slices, centre, sub, size = 168, thickness = 30, colors }) {
  const c = size / 2, r = c - thickness / 2 - 2, circ = 2 * Math.PI * r;
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
  const pal = colors ?? PAL.slices;
  let at = 0, arcs = '';
  slices.forEach((s, i) => {
    const frac = Math.max(0, s.value) / total;
    const len = frac * circ;
    arcs += `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${pal[i % pal.length]}"
      stroke-width="${thickness}" stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}"
      stroke-dashoffset="${(-at).toFixed(2)}" transform="rotate(-90 ${c} ${c})"/>`;
    at += len;
  });
  return `<svg class="rc-donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    ${arcs}
    ${centre ? `<text class="rc-d-c" x="${c}" y="${c + (sub ? -2 : 5)}" text-anchor="middle">${esc(centre)}</text>` : ''}
    ${sub ? `<text class="rc-d-s" x="${c}" y="${c + 15}" text-anchor="middle">${esc(sub)}</text>` : ''}
  </svg>`;
}

// a legend of coloured dots, stacked
export function dots(items, colors) {
  const pal = colors ?? PAL.slices;
  return `<ul class="rc-dots">${items.map((it, i) =>
    `<li><i style="background:${pal[i % pal.length]}"></i>${esc(it)}</li>`).join('')}</ul>`;
}

// --- 5. the balance sheet table --------------------------------------------
export function sheet(rows, totalRow) {
  return `<table class="rc-sheet"><tbody>
    ${rows.map(r => `<tr><td>${esc(r.label)}</td><td>${money(r.value)}</td></tr>`).join('')}
    ${totalRow ? `<tr class="tot"><td>${esc(totalRow.label)}</td><td>${money(totalRow.value)}</td></tr>` : ''}
  </tbody></table>`;
}

export { money, mm };

// --- 6. bars ----------------------------------------------------------------
// Vertical bars with a value above each. Used for balance sheet, liquidity, stress,
// life insurance need, and anywhere a handful of figures sit side by side.
export function bars({ items, width = 420, height = 210, colors, format = money, zeroLine = true }) {
  const L = 54, R = 10, T = 22, B = 42;
  const vals = items.map(i => i.value);
  const hi = Math.max(0, ...vals), lo = Math.min(0, ...vals);
  const span = (hi - lo) || 1;
  const pad = span * 0.12;
  const top = hi + pad, bot = lo < 0 ? lo - pad : 0;
  const y = v => T + (1 - (v - bot) / ((top - bot) || 1)) * (height - T - B);
  const n = items.length;
  const slot = (width - L - R) / n;
  const bw = Math.min(54, slot * 0.56);
  const pal = colors ?? [PAL.blue];

  let grid = '';
  for (let i = 0; i <= 3; i++) {
    const v = bot + (i / 3) * (top - bot), yy = y(v);
    grid += `<line class="rc-g" x1="${L}" y1="${yy.toFixed(1)}" x2="${width - R}" y2="${yy.toFixed(1)}"/>
      <text class="rc-ax" x="${L - 7}" y="${(yy + 3).toFixed(1)}" text-anchor="end">${axisMoney(v)}</text>`;
  }
  const base = y(0);
  let out = '';
  items.forEach((it, i) => {
    const cx = L + slot * i + slot / 2;
    const yv = y(it.value);
    const top_ = Math.min(yv, base), h = Math.max(1, Math.abs(base - yv));
    out += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${top_.toFixed(1)}" width="${bw.toFixed(1)}"
      height="${h.toFixed(1)}" rx="1.5" fill="${it.color ?? pal[i % pal.length]}"/>
      <text class="rc-bv" x="${cx.toFixed(1)}" y="${(top_ - 6).toFixed(1)}" text-anchor="middle">${format(it.value)}</text>
      ${wrap(it.label, 14).map((l, k) =>
        `<text class="rc-bl" x="${cx.toFixed(1)}" y="${(height - B + 14 + k * 11).toFixed(1)}" text-anchor="middle">${esc(l)}</text>`).join('')}`;
  });
  return `<svg class="rc-bars" viewBox="0 0 ${width} ${height}" width="100%">
    ${grid}${zeroLine && bot < 0 ? `<line class="rc-zero" x1="${L}" y1="${base.toFixed(1)}" x2="${width - R}" y2="${base.toFixed(1)}"/>` : ''}
    ${out}</svg>`;
}

// --- 7. a stacked area over time --------------------------------------------
export function stackedArea({ series, labels, width = 560, height = 230, colors, pct = true }) {
  const L = 44, R = 10, T = 10, B = 34;
  const n = labels.length;
  const x = i => L + (i / Math.max(1, n - 1)) * (width - L - R);
  const y = v => T + (1 - v) * (height - T - B);
  const pal = colors ?? PAL.slices;
  let acc = new Array(n).fill(0), out = '';
  series.forEach((s, si) => {
    const top = s.values.map((v, i) => acc[i] + v);
    const d = top.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')
      + acc.map((v, i) => `L${x(n - 1 - i).toFixed(1)},${y(acc[n - 1 - i]).toFixed(1)}`).join('') + 'Z';
    out += `<path d="${d}" fill="${pal[si % pal.length]}" opacity=".9"/>`;
    acc = top;
  });
  let grid = '';
  for (let i = 0; i <= 4; i++) {
    const v = i / 4, yy = y(v);
    grid += `<line class="rc-g" x1="${L}" y1="${yy}" x2="${width - R}" y2="${yy}"/>
      <text class="rc-ax" x="${L - 7}" y="${yy + 3}" text-anchor="end">${pct ? Math.round(v * 100) + '%' : v}</text>`;
  }
  let xs = '';
  for (const i of [0, Math.round(n * .25), Math.round(n * .5), Math.round(n * .75), n - 1])
    if (labels[i] != null) xs += `<text class="rc-axx" x="${x(i)}" y="${height - B + 16}" text-anchor="middle">${labels[i]}</text>`;
  return `<svg class="rc-area" viewBox="0 0 ${width} ${height}" width="100%">${grid}${out}${xs}</svg>`;
}

// --- 8. a plain data table ---------------------------------------------------
export function table({ columns, rows, striped = true }) {
  return `<table class="rc-tbl${striped ? ' striped' : ''}">
    <thead><tr>${columns.map(c =>
      `<th class="${c.align ?? 'r'}">${esc(c.label)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${columns.map(c => {
      const v = r[c.key];
      return `<td class="${c.align ?? 'r'}">${c.format ? c.format(v, r) : esc(v ?? '')}</td>`;
    }).join('')}</tr>`).join('')}</tbody></table>`;
}

// --- 9. the record card ------------------------------------------------------
// The card used throughout the profile: a dark header carrying the kind, a light body
// carrying the name and its label/value rows.
export function recordCard({ kind, name, rows, muted }) {
  return `<div class="rc-rec${muted ? ' muted' : ''}">
    <div class="rc-rec-h"><span>${esc(kind)}</span></div>
    <div class="rc-rec-b">
      <p class="rc-rec-n">${esc(name)}</p>
      ${(rows ?? []).map(r => `<div class="rc-rec-r"><span>${esc(r.label)}</span><b>${esc(r.value)}</b></div>`).join('')}
    </div>
  </div>`;
}

// --- 10. the tick and cross checklist ----------------------------------------
export function checks({ columns, items }) {
  return `<table class="rc-chk"><thead><tr><th></th>${columns.map(c =>
    `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${items.map(it =>
    `<tr><td class="l">${esc(it.label)}</td>${it.values.map(v =>
      `<td>${v ? '<span class="yes">&#10003;</span>' : '<span class="no">&#10007;</span>'}</td>`).join('')}</tr>`
    ).join('')}</tbody></table>`;
}

// --- 11. the honest empty state ----------------------------------------------
// Says what is missing and what would fill it. Never a chart made of nothing.
export function empty(what, why) {
  return `<div class="rc-empty">
    <div class="rc-empty-i">&#9707;</div>
    <p class="rc-empty-t">${esc(what)}</p>
    ${why ? `<p class="rc-empty-w">${esc(why)}</p>` : ''}
  </div>`;
}

export { axisMoney };

// --- 12. grouped bars (two or more series side by side) ----------------------
export function groupedBars({ groups, series, width = 480, height = 210, colors, format = money, pct = false }) {
  const L = 54, R = 10, T = 22, B = 46;
  const all = series.flatMap(s => s.values);
  const hi = Math.max(0, ...all), lo = Math.min(0, ...all);
  const pad = ((hi - lo) || 1) * 0.12;
  const top = hi + pad, bot = lo < 0 ? lo - pad : 0;
  const y = v => T + (1 - (v - bot) / ((top - bot) || 1)) * (height - T - B);
  const slot = (width - L - R) / groups.length;
  const bw = Math.min(26, (slot * 0.62) / series.length);
  const pal = colors ?? [PAL.blue, '#6ec46e', '#f5a623', '#4ec3e0'];
  const fmt = pct ? (v => (v * 100).toFixed(0) + '%') : format;

  let grid = '';
  for (let i = 0; i <= 4; i++) {
    const v = bot + (i / 4) * (top - bot), yy = y(v);
    grid += `<line class="rc-g" x1="${L}" y1="${yy.toFixed(1)}" x2="${width - R}" y2="${yy.toFixed(1)}"/>
      <text class="rc-ax" x="${L - 7}" y="${(yy + 3).toFixed(1)}" text-anchor="end">${pct ? Math.round(v * 100) + '%' : axisMoney(v)}</text>`;
  }
  const base = y(0);
  let out = '';
  groups.forEach((g, gi) => {
    const cx = L + slot * gi + slot / 2;
    const span = bw * series.length;
    series.forEach((s, si) => {
      const v = s.values[gi] ?? 0;
      const x = cx - span / 2 + si * bw;
      const yv = y(v), t = Math.min(yv, base), h = Math.max(1, Math.abs(base - yv));
      out += `<rect x="${x.toFixed(1)}" y="${t.toFixed(1)}" width="${(bw - 2).toFixed(1)}"
        height="${h.toFixed(1)}" rx="1" fill="${pal[si % pal.length]}"/>`;
    });
    out += wrap(g, 13).map((l, k) =>
      `<text class="rc-bl" x="${cx.toFixed(1)}" y="${(height - B + 13 + k * 10).toFixed(1)}" text-anchor="middle">${esc(l)}</text>`).join('');
  });
  void fmt;
  return `<svg class="rc-bars" viewBox="0 0 ${width} ${height}" width="100%">${grid}${out}</svg>`;
}

// --- 13. the right-hand callout ---------------------------------------------
// The sentence beside the chart that states the answer. Lines alternate between a big
// figure and the words around it, exactly as the reference lays them out.
export function callout(lines) {
  return `<div class="rc-call">${lines.map(l =>
    typeof l === 'string' ? `<p>${esc(l)}</p>` : `<p class="big">${esc(l.big)}</p>`).join('')}</div>`;
}

// --- 14. a filled area line chart -------------------------------------------
export function areaChart({ series, labels, width = 520, height = 210, colors, pct = false, max }) {
  const L = 50, R = 10, T = 12, B = 34;
  const n = labels.length;
  const hi = max ?? Math.max(...series.flatMap(s => s.values));
  const step = Math.pow(10, Math.floor(Math.log10(hi || 1)));
  const top = pct ? (Math.ceil(hi * 20) / 20) : (Math.ceil(hi / step) * step || 1);
  const x = i => L + (i / Math.max(1, n - 1)) * (width - L - R);
  const y = v => T + (1 - v / top) * (height - T - B);
  const pal = colors ?? [PAL.blue, '#6ec46e', '#f5a623'];
  let grid = '';
  for (let i = 0; i <= 4; i++) {
    const v = (i / 4) * top, yy = y(v);
    grid += `<line class="rc-g" x1="${L}" y1="${yy}" x2="${width - R}" y2="${yy}"/>
      <text class="rc-ax" x="${L - 7}" y="${yy + 3}" text-anchor="end">${pct ? (v * 100).toFixed(0) + '%' : axisMoney(v)}</text>`;
  }
  let out = '';
  series.forEach((s, si) => {
    const line = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    if (s.fill !== false)
      out += `<path d="${line}L${x(n - 1).toFixed(1)},${y(0).toFixed(1)}L${x(0).toFixed(1)},${y(0).toFixed(1)}Z"
        fill="${pal[si % pal.length]}" opacity=".78"/>`;
    out += `<path d="${line}" fill="none" stroke="${pal[si % pal.length]}" stroke-width="1.5"/>`;
  });
  let xs = '';
  for (const i of [0, Math.round(n * .33), Math.round(n * .66), n - 1])
    if (labels[i] != null) xs += `<text class="rc-axx" x="${x(i)}" y="${height - B + 16}" text-anchor="middle">${labels[i]}</text>`;
  return `<svg class="rc-area" viewBox="0 0 ${width} ${height}" width="100%">${grid}${out}${xs}</svg>`;
}

// --- 15. stacked bars per year ----------------------------------------------
export function stackedBars({ labels, series, width = 520, height = 210, colors }) {
  const L = 54, R = 10, T = 14, B = 34;
  const n = labels.length;
  const totals = labels.map((_, i) => series.reduce((s, x) => s + (x.values[i] ?? 0), 0));
  const hi = Math.max(...totals, 1);
  const step = Math.pow(10, Math.floor(Math.log10(hi)));
  const top = Math.ceil(hi / step) * step;
  const y = v => T + (1 - v / top) * (height - T - B);
  const slot = (width - L - R) / n;
  const bw = Math.min(14, slot * 0.66);
  const pal = colors ?? ['#f5a623', '#4e5fd4', '#6ec46e', '#4ec3e0', '#8b5fd6', '#d64e9e'];
  let grid = '';
  for (let i = 0; i <= 4; i++) {
    const v = (i / 4) * top, yy = y(v);
    grid += `<line class="rc-g" x1="${L}" y1="${yy}" x2="${width - R}" y2="${yy}"/>
      <text class="rc-ax" x="${L - 7}" y="${yy + 3}" text-anchor="end">${axisMoney(v)}</text>`;
  }
  let out = '';
  labels.forEach((_, i) => {
    const cx = L + slot * i + slot / 2;
    let acc = 0;
    series.forEach((s, si) => {
      const v = s.values[i] ?? 0;
      if (v <= 0) return;
      const yTop = y(acc + v), h = y(acc) - yTop;
      out += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${yTop.toFixed(1)}" width="${bw.toFixed(1)}"
        height="${Math.max(0.5, h).toFixed(1)}" fill="${pal[si % pal.length]}"/>`;
      acc += v;
    });
  });
  let xs = '';
  for (const i of [0, Math.round(n * .33), Math.round(n * .66), n - 1])
    if (labels[i] != null) xs += `<text class="rc-axx" x="${L + slot * i + slot / 2}" y="${height - B + 16}" text-anchor="middle">${labels[i]}</text>`;
  return `<svg class="rc-bars" viewBox="0 0 ${width} ${height}" width="100%">${grid}${out}${xs}</svg>`;
}

// --- 16. a legend row --------------------------------------------------------
export function legend(items, colors, opts = {}) {
  const pal = colors ?? PAL.slices;
  return `<div class="legend${opts.cols ? ' cols' : ''}">${items.map((it, i) =>
    `<span><i${opts.bars?.includes(i) ? ' class="bar"' : ''} style="background:${pal[i % pal.length]}"></i>${esc(it)}</span>`).join('')}</div>`;
}
