// Illustrations.
//
// Everything here returns an SVG string and nothing here computes anything. The engine
// produces the numbers; this draws them. Kept apart so a chart can never quietly invent
// a figure, and so the same drawing can be used on a screen, in a PDF, or in a deck.
//
// Brand: navy #0d1e3a, gold #b8972e, cream #f7f5f1. Every numeral is set in lining
// figures by the stylesheet; nothing here sets a serif on a number.

export const PALETTE = {
  navy: '#0d1e3a', navy2: '#1a365f', navy3: '#2b4c86',
  gold: '#b8972e', goldBright: '#d5bd68', cream: '#f7f5f1',
  // A sequence for stacked and categorical work: navy through to gold, so it reads as one
  // family rather than a box of crayons, and holds up for the most common colour blindness.
  series: ['#1a365f', '#2f6f4f', '#4a7ec4', '#7f9fd0', '#a8bedd', '#b8972e', '#8a6d1f', '#8c3b2e'],
  good: '#2f6f4f', warn: '#8a6d1f', bad: '#8c3b2e',
  muted: '#5c6880', line: 'rgba(13,30,58,.14)'
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const money = n => {
  const a = Math.abs(Math.round(n));
  const s = a >= 1e6 ? '$' + (a / 1e6).toFixed(a >= 1e7 ? 1 : 2) + 'mm'
          : a >= 1e3 ? '$' + Math.round(a / 1e3) + 'k' : '$' + a;
  return n < 0 ? '(' + s + ')' : s;
};
const full = n => (n < 0 ? '(' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US') + (n < 0 ? ')' : '');

// --- 1. ring gauge ---------------------------------------------------------
// The probability dial. Drawn as a ticked ring rather than a solid arc, because a solid
// arc reads as a precision the simulation does not have.
export function ring({ value, max = 100, label, sublabel, size = 190, ticks = 64,
                       color = PALETTE.navy2, track = 'rgba(13,30,58,.12)', format }) {
  const cx = size / 2, cy = size / 2, r = size * 0.40, inner = r - size * 0.055;
  const share = Math.max(0, Math.min(1, value / max));
  const lit = Math.round(ticks * share);
  let marks = '';
  for (let i = 0; i < ticks; i++) {
    const a = -Math.PI / 2 + (i / ticks) * Math.PI * 2;
    const on = i < lit;
    marks += `<line x1="${(cx + Math.cos(a) * inner).toFixed(2)}" y1="${(cy + Math.sin(a) * inner).toFixed(2)}"
      x2="${(cx + Math.cos(a) * r).toFixed(2)}" y2="${(cy + Math.sin(a) * r).toFixed(2)}"
      stroke="${on ? color : track}" stroke-width="${on ? 3.2 : 2.2}" stroke-linecap="round"></line>`;
  }
  const text = format ? format(value) : value + '%';
  return `<svg viewBox="0 0 ${size} ${size}" class="ill ring" role="img" aria-label="${esc(label || '')} ${esc(text)}">
    ${marks}
    <text x="${cx}" y="${cy - 2}" text-anchor="middle" class="ring-v">${esc(text)}</text>
    ${label ? `<text x="${cx}" y="${cy + 18}" text-anchor="middle" class="ring-l">${esc(label)}</text>` : ''}
    ${sublabel ? `<text x="${cx}" y="${cy + 33}" text-anchor="middle" class="ring-l">${esc(sublabel)}</text>` : ''}
  </svg>`;
}

// --- 2. allocation donut ---------------------------------------------------
// Two donuts with the legend between them, so the eye compares like with like instead of
// hopping between two separate keys.
export function donut({ slices, size = 190, centre, centreSub, thickness = 0.30 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.40, w = r * thickness;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let a0 = -Math.PI / 2, paths = '';
  slices.forEach((s, i) => {
    if (s.value <= 0) return;
    const a1 = a0 + (s.value / total) * Math.PI * 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const ro = r, ri = r - w;
    const p = [
      `M ${(cx + Math.cos(a0) * ro).toFixed(2)} ${(cy + Math.sin(a0) * ro).toFixed(2)}`,
      `A ${ro} ${ro} 0 ${large} 1 ${(cx + Math.cos(a1) * ro).toFixed(2)} ${(cy + Math.sin(a1) * ro).toFixed(2)}`,
      `L ${(cx + Math.cos(a1) * ri).toFixed(2)} ${(cy + Math.sin(a1) * ri).toFixed(2)}`,
      `A ${ri} ${ri} 0 ${large} 0 ${(cx + Math.cos(a0) * ri).toFixed(2)} ${(cy + Math.sin(a0) * ri).toFixed(2)}`, 'Z'
    ].join(' ');
    paths += `<path d="${p}" fill="${s.color ?? PALETTE.series[i % PALETTE.series.length]}"><title>${esc(s.label)}: ${(s.value / total * 100).toFixed(1)}%</title></path>`;
    a0 = a1;
  });
  return `<svg viewBox="0 0 ${size} ${size}" class="ill donut" role="img" aria-label="${esc(centre || 'allocation')}">
    ${paths}
    ${centre ? `<text x="${cx}" y="${cy + 2}" text-anchor="middle" class="donut-v">${esc(centre)}</text>` : ''}
    ${centreSub ? `<text x="${cx}" y="${cy + 19}" text-anchor="middle" class="donut-l">${esc(centreSub)}</text>` : ''}
  </svg>`;
}

// The shared legend that sits between two donuts, current on the left, target on the right.
export function allocationLegend(rows) {
  return `<table class="alloc-legend">${rows.map((r, i) =>
    `<tr><td class="l">${r.left}</td>
      <td class="k"><i style="background:${r.color ?? PALETTE.series[i % PALETTE.series.length]}"></i>${esc(r.label)}</td>
      <td class="r">${r.right}</td></tr>`).join('')}</table>`;
}

// --- 3. Sankey cash flow ---------------------------------------------------
// The best thing on their platform, and the right way to show a year of a household's
// money: everything that came in on the left, everything it went to on the right, with
// the thickness of each ribbon equal to the dollars that travelled it.
export function sankey({ inflows, outflows, width = 880, height = 460, totalLabel = 'Total inflows' }) {
  const PAD = 18, LABEL = 172, barW = 13;
  const inTotal = inflows.reduce((s, x) => s + x.value, 0);
  const outTotal = outflows.reduce((s, x) => s + x.value, 0);
  const scaleTotal = Math.max(inTotal, outTotal) || 1;
  const usable = height - PAD * 2;
  const gap = 5;
  const h = v => Math.max(1.5, (v / scaleTotal) * (usable - gap * Math.max(inflows.length, outflows.length)));

  const xIn = LABEL, xMid = width / 2 - barW / 2, xOut = width - LABEL - barW;

  // left column
  let y = PAD, left = [], ribbons = '';
  for (const f of inflows) {
    const hh = h(f.value);
    left.push({ ...f, y, h: hh });
    y += hh + gap;
  }
  // centre column, sized to the inflow total
  const midH = left.reduce((s, l) => s + l.h, 0);
  let midY = PAD;

  // right column, grouped
  let yr = PAD, right = [];
  for (const o of outflows) {
    const hh = h(o.value);
    right.push({ ...o, y: yr, h: hh });
    yr += hh + gap;
  }

  const ribbon = (x0, y0, h0, x1, y1, h1, fill, opacity) => {
    const cx0 = x0 + (x1 - x0) * 0.45, cx1 = x0 + (x1 - x0) * 0.55;
    return `<path d="M ${x0} ${y0} C ${cx0} ${y0}, ${cx1} ${y1}, ${x1} ${y1}
      L ${x1} ${y1 + h1} C ${cx1} ${y1 + h1}, ${cx0} ${y0 + h0}, ${x0} ${y0 + h0} Z"
      fill="${fill}" opacity="${opacity}"></path>`;
  };

  let cursor = midY;
  for (const l of left) {
    ribbons += ribbon(xIn + barW, l.y, l.h, xMid, cursor, l.h,
      l.color ?? PALETTE.series[2], .34);
    cursor += l.h;
  }
  cursor = midY;
  for (const r of right) {
    const take = Math.min(r.h, midY + midH - cursor);
    ribbons += ribbon(xMid + barW, cursor, Math.max(1, take), xOut, r.y, r.h,
      r.color ?? PALETTE.series[5], .30);
    cursor += take;
  }

  const bar = (x, y, h, fill) => `<rect x="${x}" y="${y.toFixed(1)}" width="${barW}" height="${h.toFixed(1)}" rx="2" fill="${fill}"></rect>`;
  let bars = left.map(l => bar(xIn, l.y, l.h, l.color ?? PALETTE.series[0])).join('')
    + bar(xMid, midY, midH, PALETTE.navy)
    + right.map(r => bar(xOut, r.y, r.h, r.color ?? PALETTE.gold)).join('');

  const labels = left.map(l =>
      `<text x="${xIn - 9}" y="${(l.y + l.h / 2 + 4).toFixed(1)}" text-anchor="end" class="sk-l">${esc(l.label)}<tspan class="sk-v"> ${full(l.value)}</tspan></text>`).join('')
    + right.map(r =>
      `<text x="${xOut + barW + 9}" y="${(r.y + r.h / 2 + 4).toFixed(1)}" class="sk-l">${esc(r.label)}<tspan class="sk-v"> ${full(r.value)}</tspan></text>`).join('')
    + `<text x="${xMid + barW / 2}" y="${(midY - 8).toFixed(1)}" text-anchor="middle" class="sk-t">${esc(totalLabel)} ${full(inTotal)}</text>`;

  return `<svg viewBox="0 0 ${width} ${height}" class="ill sankey" role="img" aria-label="Cash flow for the year">
    ${ribbons}${bars}${labels}</svg>`;
}

// --- 4. estate flow --------------------------------------------------------
// Boxes and connectors, because an estate is a sequence of subtractions and a client
// needs to see each one happen.
export function estateFlow({ columns, width = 880, boxH = 46, gap = 15 }) {
  const colW = (width - 40) / columns.length;
  let out = '', links = '';
  columns.forEach((col, ci) => {
    const x = 20 + ci * colW;
    let y = 30;
    col.boxes.forEach(b => {
      const fill = b.tone === 'cost' ? '#8a6d1f' : b.tone === 'out' ? '#2f6f4f'
                 : b.tone === 'total' ? PALETTE.navy : PALETTE.navy2;
      out += `<g><rect x="${x}" y="${y}" width="${colW - 18}" height="${boxH}" rx="6" fill="${fill}"></rect>
        <text x="${x + (colW - 18) / 2}" y="${y + 19}" text-anchor="middle" class="ef-l">${esc(b.label)}</text>
        <text x="${x + (colW - 18) / 2}" y="${y + 35}" text-anchor="middle" class="ef-v">${full(b.value)}</text></g>`;
      if (ci < columns.length - 1) {
        links += `<line x1="${x + colW - 18}" y1="${y + boxH / 2}" x2="${x + colW}" y2="${y + boxH / 2}"
          stroke="${PALETTE.gold}" stroke-width="1.4" opacity=".55"></line>`;
      }
      y += boxH + gap;
    });
    out += `<text x="${x + (colW - 18) / 2}" y="18" text-anchor="middle" class="ef-h">${esc(col.title)}</text>`;
  });
  const height = 40 + Math.max(...columns.map(c => c.boxes.length)) * (boxH + gap);
  return `<svg viewBox="0 0 ${width} ${height}" class="ill estate" role="img" aria-label="Where the estate goes">
    ${links}${out}</svg>`;
}

// --- 5. paired comparison bars --------------------------------------------
// Two plans, one chart, one axis. The only honest way to show a difference.
export function pairedBars({ categories, a, b, labelA, labelB, width = 820, height = 250,
                             colorA = PALETTE.navy2, colorB = '#b9c4d6', format = money }) {
  const PADL = 70, PADB = 26, PADT = 12, PADR = 10;
  const max = niceMax(Math.max(...a, ...b));
  const n = categories.length;
  const slot = (width - PADL - PADR) / n;
  const bw = Math.max(3, slot * 0.33);
  const y = v => PADT + (1 - v / max) * (height - PADT - PADB);
  let bars = '';
  categories.forEach((c, i) => {
    const x = PADL + slot * i + slot / 2;
    bars += `<rect x="${(x - bw - 1.5).toFixed(1)}" y="${y(a[i]).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(0) - y(a[i])).toFixed(1)}" fill="${colorA}" rx="1.5"><title>${esc(labelA)} ${esc(c)}: ${format(a[i])}</title></rect>`;
    bars += `<rect x="${(x + 1.5).toFixed(1)}" y="${y(b[i]).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(0) - y(b[i])).toFixed(1)}" fill="${colorB}" rx="1.5"><title>${esc(labelB)} ${esc(c)}: ${format(b[i])}</title></rect>`;
  });
  return `<svg viewBox="0 0 ${width} ${height}" class="ill paired" role="img" aria-label="${esc(labelA)} against ${esc(labelB)}">
    ${gridY(max, PADL, PADR, PADT, PADB, width, height, format)}${bars}
    ${axisX(categories, PADL, PADR, width, height)}</svg>`;
}

// --- 6. categorical bars with a callout -----------------------------------
export function bars({ categories, values, width = 820, height = 250, colors, format = money }) {
  const PADL = 70, PADB = 26, PADT = 12, PADR = 10;
  const max = niceMax(Math.max(...values));
  const slot = (width - PADL - PADR) / categories.length;
  const bw = Math.min(slot * 0.56, 64);
  const y = v => PADT + (1 - v / max) * (height - PADT - PADB);
  const rects = categories.map((c, i) => {
    const x = PADL + slot * i + slot / 2 - bw / 2;
    const col = (colors && colors[i]) || PALETTE.series[i % PALETTE.series.length];
    return `<rect x="${x.toFixed(1)}" y="${y(values[i]).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(0) - y(values[i])).toFixed(1)}" rx="2" fill="${col}"><title>${esc(c)}: ${format(values[i])}</title></rect>`;
  }).join('');
  return `<svg viewBox="0 0 ${width} ${height}" class="ill bars" role="img">
    ${gridY(max, PADL, PADR, PADT, PADB, width, height, format)}${rects}
    ${axisX(categories, PADL, PADR, width, height)}</svg>`;
}

// --- shared axis helpers ---------------------------------------------------
export function niceMax(v) {
  if (!(v > 0)) return 1;
  let best = null;
  for (const steps of [4, 5, 6]) {
    const raw = v / steps, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    let step = 10 * mag;
    for (const m of [1, 2, 2.5, 5, 10]) if (raw <= m * mag) { step = m * mag; break; }
    const max = Math.ceil(v / step) * step;
    if (!best || max / v < best.waste) best = { max, step, waste: max / v };
  }
  return best.max;
}
function gridY(max, PADL, PADR, PADT, PADB, width, height, format) {
  let step = max / 4;
  for (const s of [4, 5, 6]) { const raw = max / s; const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    for (const m of [1, 2, 2.5, 5, 10]) if (raw <= m * mag) { step = m * mag; break; }
    if (Math.abs(max / step - Math.round(max / step)) < 1e-9) break; }
  let out = '';
  for (let v = 0; v <= max + 1e-6; v += step) {
    const y = PADT + (1 - v / max) * (height - PADT - PADB);
    out += `<line x1="${PADL}" y1="${y.toFixed(1)}" x2="${width - PADR}" y2="${y.toFixed(1)}" class="ax"></line>
      <text x="${PADL - 9}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" class="axt">${format(v)}</text>`;
  }
  return out;
}
function axisX(cats, PADL, PADR, width, height) {
  const n = cats.length, slot = (width - PADL - PADR) / n;
  const every = Math.max(1, Math.round(n / 9));
  return cats.map((c, i) => (i % every && i !== n - 1) ? '' :
    `<text x="${(PADL + slot * i + slot / 2).toFixed(1)}" y="${height - 7}" text-anchor="middle" class="axt">${esc(c)}</text>`).join('');
}

// --- 7. what to actually do ------------------------------------------------
// Their best idea after the Sankey, and it is not a chart at all: a numbered list in plain
// English of what the optimal answer means the household should do. A chart shows a
// difference; this tells someone what to go and do on Monday.
export function actionSteps(steps, title = 'What this means in practice') {
  return `<div class="steps"><div class="steps-t">${esc(title)}</div><ol>${
    steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>`;
}

// --- 9. coverage checklist -------------------------------------------------
// What a given choice does and does not cover, as ticks and crosses. Reads in two
// seconds and settles an argument that a paragraph cannot.
export function checklist({ title, columns }) {
  const mark = ok => ok
    ? `<span class="ck yes" aria-label="covered">&#10003;</span>`
    : `<span class="ck no" aria-label="not covered">&#10007;</span>`;
  const rows = Math.max(...columns.map(c => c.items.length));
  let body = '';
  for (let i = 0; i < rows; i++) {
    body += '<tr>' + columns.map(c => {
      const it = c.items[i];
      return it ? `<td>${esc(it.label)}</td><td class="m">${mark(it.ok)}</td>`
                : '<td></td><td></td>';
    }).join('') + '</tr>';
  }
  return `<table class="checklist">
    <thead><tr>${columns.map(c => `<th colspan="2">${esc(c.title)}</th>`).join('')}</tr></thead>
    <tbody>${body}</tbody>${title ? `<caption>${esc(title)}</caption>` : ''}</table>`;
}

// --- 10. preferences stated as sentences -----------------------------------
// Their best interface idea. Every question is a sentence the client would say out loud,
// not a field. "I spend most of my time at home and see doctors nearby" rather than
// "network preference". The answers drive the recommendation, and the client can read
// back exactly what they told you.
export function preferenceForm({ groups, idPrefix = 'pref' }) {
  return `<div class="prefs">${groups.map(g => `
    <div class="pref-g"><div class="pref-h">${esc(g.title)}</div>
      ${g.questions.map(q => `
        <div class="pref-q">
          <div class="pref-i" aria-hidden="true">${q.icon ?? ICONS.dot}</div>
          <div class="pref-b">
            <label for="${idPrefix}_${q.key}">${esc(q.label)}</label>
            <select id="${idPrefix}_${q.key}" data-pref="${esc(q.key)}">
              ${q.options.map(o => `<option value="${esc(o.value)}"${o.value === q.value ? ' selected' : ''}>${esc(o.sentence)}</option>`).join('')}
            </select>
          </div>
        </div>`).join('')}
    </div>`).join('')}</div>`;
}

// A few line icons, drawn rather than fetched, so a page carries no outside dependency.
export const ICONS = {
  dot: '<svg viewBox="0 0 24 24" class="pi"><circle cx="12" cy="12" r="4"/></svg>',
  home: '<svg viewBox="0 0 24 24" class="pi"><path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/></svg>',
  health: '<svg viewBox="0 0 24 24" class="pi"><path d="M20.5 8.5c0 5-8.5 10.5-8.5 10.5S3.5 13.5 3.5 8.5a4.5 4.5 0 0 1 8.5-2.1 4.5 4.5 0 0 1 8.5 2.1Z"/><path d="M6 12h3l1.5-3 2 5 1.5-2h4"/></svg>',
  risk: '<svg viewBox="0 0 24 24" class="pi"><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M12 8v8"/><path d="M9.5 10.5c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2-1.1 1.6-2.5 2"/></svg>',
  ssa: '<svg viewBox="0 0 24 24" class="pi"><path d="M3 15c2-4 5-6 9-6s7 2 9 6"/><path d="M6.5 15c1.3-2.4 3.2-3.6 5.5-3.6s4.2 1.2 5.5 3.6"/><path d="M10 15c.6-1 1.2-1.5 2-1.5s1.4.5 2 1.5"/></svg>',
  group: '<svg viewBox="0 0 24 24" class="pi"><rect x="3.5" y="10" width="4" height="10"/><rect x="10" y="5" width="4" height="15"/><rect x="16.5" y="13" width="4" height="7"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" class="pi"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17"/><path d="M8 3.5v3M16 3.5v3"/></svg>'
};

// --- 11. a figure with its callout ----------------------------------------
// The pattern they use beside every chart: the number, then the sentence that says what
// it is. Worth having as one thing so the two never drift apart.
export function callout({ value, lines, tone }) {
  return `<div class="callout${tone ? ' ' + tone : ''}">
    <div class="callout-v">${esc(value)}</div>
    ${lines.map(l => `<div class="callout-l">${esc(l)}</div>`).join('')}</div>`;
}

// --- 8. the stylesheet these drawings expect -------------------------------
export const CSS = `
.ill{display:block;width:100%;height:auto;overflow:visible;
  font-family:"DM Sans",system-ui,sans-serif;font-variant-numeric:lining-nums}
.ill .ax{stroke:var(--ill-line,rgba(13,30,58,.14));stroke-width:1}
.ill .axt{fill:var(--ill-muted,#5c6880);font-size:10.5px}
.ring-v{font-size:30px;font-weight:500;fill:var(--ill-ink,#0d1e3a)}
.ring-l{font-size:10.5px;fill:var(--ill-muted,#5c6880);letter-spacing:.08em}
.donut-v{font-size:19px;font-weight:500;fill:var(--ill-ink,#0d1e3a)}
.donut-l{font-size:10.5px;fill:var(--ill-muted,#5c6880)}
.sk-l{font-size:11.5px;fill:var(--ill-ink,#0d1e3a)}
.sk-v{fill:var(--ill-muted,#5c6880)}
.sk-t{font-size:12px;fill:var(--ill-ink,#0d1e3a);font-weight:500}
.ef-l{font-size:10.5px;fill:#f7f5f1}
.ef-v{font-size:12.5px;fill:#f7f5f1;font-weight:500}
.ef-h{font-size:10.5px;fill:var(--ill-muted,#5c6880);letter-spacing:.14em;text-transform:uppercase}
table.alloc-legend{width:100%;border-collapse:collapse;font-size:12.5px}
table.alloc-legend td{padding:3px 6px;border:0}
table.alloc-legend td.l{text-align:right;color:var(--ill-muted,#5c6880);width:4.5em}
table.alloc-legend td.r{text-align:left;color:var(--ill-muted,#5c6880);width:4.5em}
table.alloc-legend td.k i{width:9px;height:9px;border-radius:2px;display:inline-block;margin-right:7px}
table.checklist{width:100%;border-collapse:collapse;font-size:13.5px}
table.checklist caption{text-align:left;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--ill-muted,#5c6880);padding-bottom:8px}
table.checklist th{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;text-align:left;
  color:var(--ill-muted,#5c6880);font-weight:500;padding:7px 9px;
  border-bottom:1px solid var(--ill-line,rgba(13,30,58,.14))}
table.checklist td{padding:7px 9px;border-bottom:1px solid var(--ill-line,rgba(13,30,58,.08))}
table.checklist td.m{width:2.2em;text-align:right}
.ck{display:inline-block;width:19px;height:19px;line-height:19px;border-radius:50%;
  text-align:center;font-size:11.5px}
.ck.yes{background:rgba(47,111,79,.16);color:#2f6f4f}
.ck.no{background:rgba(140,59,46,.16);color:#8c3b2e}
.prefs{display:grid;gap:22px}
.pref-h{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ill-muted,#5c6880);
  margin-bottom:10px}
.pref-q{display:grid;grid-template-columns:40px 1fr;gap:12px;align-items:start;margin-bottom:13px}
.pref-b label{display:block;font-size:12px;color:var(--ill-muted,#5c6880);margin-bottom:4px}
.pref-b select{width:100%;padding:7px 9px;border-radius:7px;font-size:13.5px;
  border:1px solid var(--ill-line,rgba(13,30,58,.14));background:transparent;color:inherit;
  font-family:"DM Sans",system-ui,sans-serif}
svg.pi{width:30px;height:30px;fill:none;stroke:#b8972e;stroke-width:1.5;
  stroke-linecap:round;stroke-linejoin:round}
svg.pi circle,svg.pi rect{fill:none}
.callout{padding:2px 0}
.callout-v{font-size:27px;font-weight:500;line-height:1.15}
.callout-l{font-size:13px;color:var(--ill-muted,#5c6880);line-height:1.4}
.callout.good .callout-v{color:#2f6f4f}
.callout.bad .callout-v{color:#8c3b2e}
.steps{border-left:3px solid #b8972e;padding:4px 0 4px 16px}
.steps-t{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ill-muted,#5c6880)}
.steps ol{margin:8px 0 0;padding-left:18px}
.steps li{margin-bottom:6px;font-size:14.5px}

/* --- blueprint ---------------------------------------------------------- */
.bp{margin:0}
.bp-t{font-family:"Cormorant Garamond",Georgia,serif;font-size:19px;font-weight:600;margin-bottom:10px}
.bp svg{display:block;overflow:visible}
.bp-card rect:first-child{fill:var(--panel,#fff);stroke:var(--line,rgba(13,30,58,.14))}
.bp-card{transition:transform .12s}
.bp-card:hover{transform:translateY(-1px)}
.bp-card:hover rect:first-child{stroke:var(--gold,#b8972e)}
.bp-l{font-size:12.5px;font-weight:500;fill:var(--ink,#101827)}
.bp-a{font-size:13px;font-weight:600;fill:var(--ink,#101827);font-variant-numeric:lining-nums}
.bp-c{font-size:10px;fill:var(--muted,#5c6880);letter-spacing:.04em;text-transform:uppercase}
.bp-link{fill:none;stroke:var(--line,rgba(13,30,58,.18));stroke-width:1.2}
.bp-link.joint{stroke-dasharray:3 4}
.bp-j{font-size:11px;fill:var(--muted,#5c6880);letter-spacing:.09em;text-transform:uppercase;font-weight:500}
.bp-fig circle,.bp-fig path{fill:var(--navy,#0d1e3a);opacity:.82}
.bp-n{font-size:14px;font-weight:600;fill:var(--ink,#101827)}
.bp-g{font-size:11px;fill:var(--muted,#5c6880);font-variant-numeric:lining-nums}
.bp-key{display:flex;flex-wrap:wrap;gap:14px;margin-top:14px;justify-content:center}
.bp-k{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--muted,#5c6880)}
.bp-k i{width:10px;height:10px;border-radius:2px;display:inline-block}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .bp-fig circle,
  :root:not([data-theme="light"]) .bp-fig path{fill:#c9d4e8;opacity:.9}}
:root[data-theme="dark"] .bp-fig circle,:root[data-theme="dark"] .bp-fig path{fill:#c9d4e8;opacity:.9}

/* --- assumption table and correlation grid ------------------------------- */
.atab,.cgrid{margin:0}
.atab table{width:100%}
.atab td.l,.atab th.l{text-align:left}
.atab td{text-align:right;font-variant-numeric:lining-nums;font-size:13px}
.atab td.tot{font-weight:600}
.atab td.apprec{color:var(--muted,#5c6880)}
.atab .z{opacity:.3}
.atab-src{font-size:11.5px;color:var(--muted,#5c6880);margin:10px 0 0;line-height:1.5}
table.cg{border-collapse:separate;border-spacing:2px;font-variant-numeric:lining-nums}
table.cg th{font-weight:500;font-size:11px;color:var(--muted,#5c6880)}
table.cg th.rh{text-align:left;padding-right:10px;white-space:nowrap}
table.cg th.ch{text-align:center;letter-spacing:.04em}
table.cg td.cc{width:46px;height:30px;text-align:center;font-size:11.5px;border-radius:3px;
  color:var(--ink,#101827)}
table.cg td.cc.self{opacity:.22}
.cg-key{display:flex;gap:16px;margin-top:12px;font-size:11.5px;color:var(--muted,#5c6880)}
.cg-key span{display:inline-flex;align-items:center;gap:6px}
.cg-key i{width:12px;height:12px;border-radius:2px;display:inline-block;
  border:1px solid var(--line,rgba(13,30,58,.14))}

/* --- diversification bar -------------------------------------------------- */
.dv{margin:0}
.dv svg{display:block;overflow:visible}
.dv-naive{fill:#b9c4d6}
.dv-real{fill:var(--navy2,#1a365f)}
.dv-n{font-size:12px;fill:var(--muted,#5c6880)}
.dv-v{font-size:12.5px;font-weight:600;fill:var(--ink,#101827);font-variant-numeric:lining-nums}
.dv-br{fill:none;stroke:var(--gold,#b8972e);stroke-width:1.2}
.dv-s{font-size:11.5px;fill:var(--gold,#b8972e);font-weight:600}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .dv-naive{fill:#3a4a66}
  :root:not([data-theme="light"]) .dv-real{fill:#6f94d8}}
:root[data-theme="dark"] .dv-naive{fill:#3a4a66}
:root[data-theme="dark"] .dv-real{fill:#6f94d8}

/* --- risk and return ------------------------------------------------------ */
.rr{margin:0}
.rr svg{display:block;overflow:visible}
.rr-g{stroke:var(--line,rgba(13,30,58,.14));stroke-width:1}
.rr-a{font-size:11px;fill:var(--muted,#5c6880);font-variant-numeric:lining-nums}
.rr-t{font-size:11.5px;fill:var(--muted,#5c6880);letter-spacing:.03em}
.rr-path{fill:none;stroke:var(--gold-soft,rgba(184,151,46,.38));stroke-width:1.6}
.rr-pt circle{fill:var(--navy2,#1a365f);stroke:var(--panel,#fff);stroke-width:2;transition:r .12s}
.rr-pt.on circle{fill:var(--gold,#b8972e)}
.rr-pt:hover circle{r:8}
.rr-l{font-size:11px;fill:var(--ink,#101827);font-weight:500}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .rr-pt circle{fill:#6f94d8}}
:root[data-theme="dark"] .rr-pt circle{fill:#6f94d8}
`;

// --- 13. the household blueprint -------------------------------------------
// The best idea on RightCapital's platform, and it contains no chart at all: a map
// of the household with the people in the middle and every holding branching off
// the person who owns it, jointly-held ones down the centre. A client reads their
// whole position in one picture, with their own names on it, before a single
// projection is mentioned. Built here from the plan's own accounts, so it is never
// out of step with the ledger.
//
// classOf decides the colour, so a reader learns the key once and it holds across
// every blueprint they are ever shown.
export const ASSET_CLASS = {
  taxable:          { label: 'Taxable',        color: '#4a7ec4' },
  bank:             { label: 'Cash',           color: '#7f9fd0' },
  traditionalIRA:   { label: 'Tax deferred',   color: '#1a365f' },
  traditional401k:  { label: 'Tax deferred',   color: '#1a365f' },
  traditional403b:  { label: 'Tax deferred',   color: '#1a365f' },
  governmental457b: { label: 'Tax deferred',   color: '#1a365f' },
  sep:              { label: 'Tax deferred',   color: '#1a365f' },
  simple:           { label: 'Tax deferred',   color: '#1a365f' },
  rothIRA:          { label: 'Tax free',       color: '#2f6f4f' },
  roth401k:         { label: 'Tax free',       color: '#2f6f4f' },
  hsa:              { label: 'Tax free',       color: '#2f6f4f' },
  property:         { label: 'Property',       color: '#b8972e' },
  liability:        { label: 'Owed',           color: '#8c3b2e' },
  other:            { label: 'Other',          color: '#5c6880' },
};

const classOf = type => ASSET_CLASS[type] ?? ASSET_CLASS.other;

// A simple two-figure silhouette. Drawn rather than photographed so it carries no
// assumption about who the household is.
function figure(x, y, scale = 1) {
  const s = v => v * scale;
  return `<g transform="translate(${x},${y})" class="bp-fig">
    <circle cx="0" cy="${-s(26)}" r="${s(13)}"/>
    <path d="M${-s(17)},${s(24)} v${-s(18)} a${s(17)},${s(19)} 0 0 1 ${s(34)},0 v${s(18)} z"/>
  </g>`;
}

export function blueprint({ people, columns, title }) {
  // columns: [{ owner: 'a'|'b'|'joint', items: [{label, amount, type}] }]
  const CARD_H = 46, GAP = 10, COL_W = 250, GUTTER = 150, PAD = 22;
  const byOwner = Object.fromEntries(columns.map(c => [c.owner, c.items]));
  const joint = byOwner.joint ?? [];
  const sides = columns.filter(c => c.owner !== 'joint' && c.items.length);
  const left = sides[0]?.items ?? [], right = sides[1]?.items ?? [];

  const W = COL_W * 2 + GUTTER + PAD * 2;
  const centreX = W / 2;
  const peopleY = 66;              // baseline the figures stand on
  const sideTop = peopleY + 92;    // below the names and ages
  const sideRows = Math.max(left.length, right.length);
  const jointTop = sideTop + sideRows * (CARD_H + GAP) + (joint.length ? 40 : 0);
  const H = jointTop + joint.length * (CARD_H + GAP) + 16;

  // The two spines the side holdings hang from, one under each person.
  const spine = i => centreX + (people.length > 1 ? (i === 0 ? -52 : 52) : 0);

  const card = (it, x, y) => {
    const c = classOf(it.type);
    return `<g class="bp-card" transform="translate(${x},${y})">
      <rect width="${COL_W}" height="${CARD_H}" rx="8"/>
      <rect width="4" height="${CARD_H}" rx="2" fill="${c.color}"/>
      <text class="bp-l" x="16" y="19">${esc(it.label)}</text>
      <text class="bp-a" x="16" y="36">${full(it.amount)}</text>
      <text class="bp-c" x="${COL_W - 14}" y="36" text-anchor="end">${esc(c.label)}</text>
    </g>`;
  };

  let links = '', cards = '';

  // left column: out of the right edge, across the gutter, up that person's spine
  left.forEach((it, i) => {
    const y = sideTop + i * (CARD_H + GAP), mid = y + CARD_H / 2;
    links += `<path class="bp-link" d="M${PAD + COL_W},${mid} H${spine(0)} V${peopleY + 72}"/>`;
    cards += card(it, PAD, y);
  });
  // right column: out of the left edge, the mirror of the above
  right.forEach((it, i) => {
    const y = sideTop + i * (CARD_H + GAP), mid = y + CARD_H / 2;
    const x = W - PAD - COL_W;
    links += `<path class="bp-link" d="M${x},${mid} H${spine(1)} V${peopleY + 72}"/>`;
    cards += card(it, x, y);
  });

  // jointly held: one block below both columns, on its own spine down the centre
  let jointBlock = '';
  if (joint.length) {
    const x = centreX - COL_W / 2;
    const labelY = jointTop - 20;
    jointBlock += `<path class="bp-link joint" d="M${centreX},${peopleY + 72} V${labelY - 16}"/>`;
    jointBlock += `<text class="bp-j" x="${centreX}" y="${labelY}" text-anchor="middle">Jointly held</text>`;
    joint.forEach((it, i) => { jointBlock += card(it, x, jointTop + i * (CARD_H + GAP)); });
  }

  const names = people.map((p, i) => {
    const x = spine(i);
    return `${figure(x, peopleY, .95)}
      <text class="bp-n" x="${x}" y="${peopleY + 44}" text-anchor="middle">${esc(p.name)}</text>
      ${p.age != null ? `<text class="bp-g" x="${x}" y="${peopleY + 62}" text-anchor="middle">Age ${p.age}</text>` : ''}`;
  }).join('');

  const used = [...new Set([...left, ...right, ...joint].map(i => classOf(i.type).label))];
  const key = used.map(l => {
    const c = Object.values(ASSET_CLASS).find(v => v.label === l);
    return `<span class="bp-k"><i style="background:${c.color}"></i>${esc(l)}</span>`;
  }).join('');

  return `<figure class="bp">
    ${title ? `<figcaption class="bp-t">${esc(title)}</figcaption>` : ''}
    <svg viewBox="0 0 ${W} ${H}" width="100%" role="img"
      aria-label="${esc(title ?? 'Household blueprint')}: every holding grouped by who owns it.">
      ${links}${jointBlock}${cards}${names}
    </svg>
    <div class="bp-key">${key}</div>
  </figure>`;
}

// Turn a plan straight into the three columns the blueprint wants.
export function blueprintFromPlan(plan) {
  const people = plan.household.people.map(p => ({
    id: p.id, name: p.name,
    age: p.birthYear ? (plan.household.asOfYear ?? new Date().getFullYear()) - p.birthYear : null,
  }));
  const col = owner => ({
    owner,
    items: (plan.household.accounts ?? [])
      .filter(a => (a.owner ?? 'joint') === owner)
      .map(a => ({ label: a.name, amount: a.balance ?? 0, type: a.type })),
  });
  const joint = col('joint');
  for (const p of plan.household.property ?? [])
    joint.items.push({ label: p.name ?? 'Home', amount: p.value ?? 0, type: 'property' });
  for (const l of plan.household.liabilities ?? [])
    joint.items.push({ label: l.name ?? 'Mortgage', amount: -(l.balance ?? 0), type: 'liability' });
  return { people, columns: [col(people[0]?.id), joint, col(people[1]?.id)].filter(Boolean) };
}

// --- 14. the assumption table ----------------------------------------------
// RightCapital's Asset Return tab, with the one thing theirs does not have: the source
// printed on the face of it. Splitting a return into interest, dividend and capital gain
// is what lets the projection tax each piece correctly, so the decomposition is the table,
// not a footnote to it. The remainder column is unrealized appreciation, which is taxed
// only when it is sold, and showing it makes the point without a sentence.
export function assumptionTable({ capitalMarket, labels, title, note }) {
  const classes = Object.keys(capitalMarket).filter(k => !k.startsWith('_'));
  const pct = (v, dp = 2) => (v == null ? '' : (v * 100).toFixed(dp) + '%');
  const dim = v => (!v ? `<span class="z">0.00%</span>` : pct(v));

  const rows = classes.map(cls => {
    const a = capitalMarket[cls];
    const appreciation = a.total - ((a.interest ?? 0) + (a.dividend ?? 0) + (a.capitalGain ?? 0));
    return `<tr>
      <td class="l">${esc(labels?.[cls] ?? cls)}</td>
      <td>${dim(a.interest)}</td>
      <td>${dim(a.dividend)}</td>
      <td>${dim(a.capitalGain)}</td>
      <td class="apprec">${pct(appreciation)}</td>
      <td class="tot">${pct(a.total)}</td>
      <td>${pct(a.volatility)}</td>
    </tr>`;
  }).join('');

  return `<figure class="atab">
    ${title ? `<figcaption class="bp-t">${esc(title)}</figcaption>` : ''}
    <table class="dt">
      <thead>
        <tr class="band"><th class="blank"></th><th colspan="3">Taxed as it is earned</th>
          <th class="blank"></th><th class="blank"></th><th class="blank"></th></tr>
        <tr><th class="l">Asset class</th><th>Interest</th><th>Dividend</th><th>Capital gain</th>
          <th>Appreciation</th><th>Total return</th><th>Volatility</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${note ? `<p class="atab-src">${esc(note)}</p>` : ''}
  </figure>`;
}

// --- 15. the correlation matrix --------------------------------------------
// Shown as a grid tinted by strength rather than as a wall of decimals. Two classes that
// fall together are the reason a portfolio is riskier than its parts, and that is a thing
// to see rather than to read. Nothing on RightCapital shows this at all.
export function correlationGrid({ correlation, labels, shortLabels, classes, title, note }) {
  const cls = classes ?? Object.keys(correlation).filter(k => !k.startsWith('_'));
  // Initials collide: "International bonds" and "Inflation-protected bonds" both reduce to
  // IB, and a header that labels two different columns the same way is worse than no
  // header. An explicit code is given where one is supplied, and the generated fallback is
  // disambiguated by appending a digit rather than quietly repeating itself.
  const seen = new Map();
  const short = c => {
    if (shortLabels?.[c]) return shortLabels[c];
    let code = (labels?.[c] ?? c).replace(/[^A-Za-z ]/g, '').split(' ')
      .filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase() || '?';
    const n = (seen.get(code) ?? 0) + 1;
    seen.set(code, n);
    return n > 1 ? code.slice(0, 2) + n : code;
  };

  // Gold for moving together, navy for moving apart, pale for unrelated. The diagonal is
  // left plain, because a thing correlating with itself carries no information.
  const tint = v => {
    if (v == null) return 'transparent';
    const a = Math.min(1, Math.abs(v));
    return v >= 0 ? `rgba(184,151,46,${(a * .55).toFixed(3)})`
                  : `rgba(26,54,95,${(a * .45).toFixed(3)})`;
  };

  const head = `<tr><th class="corner"></th>${cls.map(c =>
    `<th class="ch" title="${esc(labels?.[c] ?? c)}">${esc(short(c))}</th>`).join('')}</tr>`;
  const body = cls.map(a => `<tr>
    <th class="rh">${esc(labels?.[a] ?? a)}</th>
    ${cls.map(b => {
      const v = correlation[a]?.[b];
      const self = a === b;
      return `<td class="cc${self ? ' self' : ''}"${self ? '' : ` style="background:${tint(v)}"`}
        title="${esc(labels?.[a] ?? a)} and ${esc(labels?.[b] ?? b)}">${
        v == null ? '' : v.toFixed(2).replace(/^0\./, '.').replace(/^-0\./, '-.')}</td>`;
    }).join('')}</tr>`).join('');

  return `<figure class="cgrid">
    ${title ? `<figcaption class="bp-t">${esc(title)}</figcaption>` : ''}
    <table class="cg"><thead>${head}</thead><tbody>${body}</tbody></table>
    <div class="cg-key">
      <span><i style="background:rgba(26,54,95,.45)"></i>move apart</span>
      <span><i style="background:rgba(184,151,46,.10)"></i>unrelated</span>
      <span><i style="background:rgba(184,151,46,.55)"></i>move together</span>
    </div>
    ${note ? `<p class="atab-src">${esc(note)}</p>` : ''}
  </figure>`;
}

// --- 16. what the mix actually bought ---------------------------------------
// Two bars. The first is what the portfolio's risk would be if its parts always moved
// together, which is what a weighted average of volatilities silently assumes. The second
// is what it actually is. The gap between them is the whole case for diversifying, and it
// is a number most households have never been shown.
export function diversificationBar({ actual, naive, label, note }) {
  const W = 620, H = 132, PAD = 8, BAR = 34, GAP = 12;
  const max = Math.max(naive, actual) * 1.18 || 1;
  const w = v => Math.max(2, (v / max) * (W - 170));
  const row = (y, v, cls, name) => `
    <rect x="150" y="${y}" width="${w(v)}" height="${BAR}" rx="4" class="${cls}"/>
    <text class="dv-n" x="140" y="${y + BAR / 2 + 4}" text-anchor="end">${esc(name)}</text>
    <text class="dv-v" x="${150 + w(v) + 10}" y="${y + BAR / 2 + 4}">${(v * 100).toFixed(2)}%</text>`;

  const y1 = PAD, y2 = PAD + BAR + GAP;
  const saved = naive - actual;
  const bracketX = 150 + Math.min(w(naive), w(actual));
  const bracketW = Math.abs(w(naive) - w(actual));

  return `<figure class="dv">
    ${label ? `<figcaption class="bp-t">${esc(label)}</figcaption>` : ''}
    <svg viewBox="0 0 ${W} ${H}" width="100%" role="img"
      aria-label="Portfolio volatility ${(actual * 100).toFixed(2)} percent against ${(naive * 100).toFixed(2)} percent if the parts always moved together.">
      ${row(y1, naive, 'dv-naive', 'If they all moved together')}
      ${row(y2, actual, 'dv-real', 'What it actually is')}
      ${saved > 0.0001 ? `
        <path class="dv-br" d="M${bracketX},${y2 + BAR + 9} v7 H${bracketX + bracketW} v-7"/>
        <text class="dv-s" x="${bracketX + bracketW / 2}" y="${y2 + BAR + 30}" text-anchor="middle">${
          (saved * 100).toFixed(2)} points of risk the mix took out</text>` : ''}
    </svg>
    ${note ? `<p class="atab-src">${esc(note)}</p>` : ''}
  </figure>`;
}

// --- 17. portfolios on risk and return --------------------------------------
// The classic picture, and it earns its place because it answers the question a household
// actually asks: what do I give up to sleep at night. Each portfolio is one dot. The line
// through them is drawn only where portfolios were actually computed, never extrapolated,
// because a curve drawn past the data implies a portfolio nobody built.
export function riskReturn({ points, title, note, highlight }) {
  const W = 660, H = 380, L = 62, R = 18, T = 16, B = 46;
  if (!points.length) return '';
  const xs = points.map(p => p.volatility), ys = points.map(p => p.total);
  const xMax = niceMax(Math.max(...xs)), yMax = niceMax(Math.max(...ys));
  const xMin = 0, yMin = 0;
  const sx = v => L + ((v - xMin) / (xMax - xMin || 1)) * (W - L - R);
  const sy = v => T + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - T - B);
  const pc = v => (v * 100).toFixed(0) + '%';

  let grid = '';
  for (let i = 0; i <= 4; i++) {
    const v = yMin + (i / 4) * (yMax - yMin), y = sy(v);
    grid += `<line class="rr-g" x1="${L}" y1="${y}" x2="${W - R}" y2="${y}"/>
      <text class="rr-a" x="${L - 10}" y="${y + 4}" text-anchor="end">${pc(v)}</text>`;
    const h = xMin + (i / 4) * (xMax - xMin), x = sx(h);
    grid += `<line class="rr-g" x1="${x}" y1="${T}" x2="${x}" y2="${H - B}"/>
      <text class="rr-a" x="${x}" y="${H - B + 20}" text-anchor="middle">${pc(h)}</text>`;
  }

  // the connecting line, in the order given, which is the order they were computed
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.volatility)},${sy(p.total)}`).join(' ');

  const dots = points.map(p => {
    const on = highlight && p.label === highlight;
    return `<g class="rr-pt${on ? ' on' : ''}">
      <circle cx="${sx(p.volatility)}" cy="${sy(p.total)}" r="${on ? 7 : 5}"/>
      <text class="rr-l" x="${sx(p.volatility)}" y="${sy(p.total) - 12}" text-anchor="middle">${esc(p.label)}</text>
    </g>`;
  }).join('');

  return `<figure class="rr">
    ${title ? `<figcaption class="bp-t">${esc(title)}</figcaption>` : ''}
    <svg viewBox="0 0 ${W} ${H}" width="100%" role="img"
      aria-label="${esc(title ?? 'Portfolios')} plotted by volatility against expected return.">
      ${grid}
      <path class="rr-path" d="${path}"/>
      ${dots}
      <text class="rr-t" x="${(L + W - R) / 2}" y="${H - 6}" text-anchor="middle">How much it moves</text>
      <text class="rr-t" transform="translate(16,${(T + H - B) / 2}) rotate(-90)" text-anchor="middle">What it expects to earn</text>
    </svg>
    ${note ? `<p class="atab-src">${esc(note)}</p>` : ''}
  </figure>`;
}
