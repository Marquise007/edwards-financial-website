// The chrome.
//
// Charts get the attention, but what makes a planning screen feel considered is the
// quieter work: a row that lifts under the cursor, a column header you can sort by, a
// group band over the columns that belong together, a tab row that does not shout.
//
// Everything here returns markup and a behaviour function. No framework, no dependency.

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// --- 1. tab pills ----------------------------------------------------------
export function tabs({ id, items, active, size = 'md' }) {
  return `<div class="tabs ${size}" role="tablist" id="${id}">${items.map(t =>
    `<button role="tab" type="button" class="tab${t.key === active ? ' on' : ''}"
      data-tab="${esc(t.key)}" aria-selected="${t.key === active}">${esc(t.label)}</button>`).join('')}</div>`;
}
export function onTabs(id, fn) {
  const host = document.getElementById(id);
  if (!host) return;
  host.addEventListener('click', e => {
    const b = e.target.closest('.tab');
    if (!b) return;
    for (const t of host.querySelectorAll('.tab')) {
      const on = t === b;
      t.classList.toggle('on', on);
      t.setAttribute('aria-selected', String(on));
    }
    fn(b.dataset.tab);
  });
}

// --- 2. the data table -----------------------------------------------------
// Grouped column bands, sortable headers, zebra rows, and a row that tints under the
// cursor. The tint is the whole trick: it tells the eye which line it is reading across
// a table forty rows deep, and it costs one CSS rule.
//
// columns: [{ key, label, align, format, sortable, group }]
export function dataTable({ id, columns, rows, sort, zebra = true, groupBands = true }) {
  const groups = [];
  if (groupBands) {
    let last = null;
    for (const c of columns) {
      const g = c.group ?? '';
      if (g === last && groups.length) groups[groups.length - 1].span++;
      else { groups.push({ label: g, span: 1 }); last = g; }
    }
  }
  const head = `<thead>
    ${groupBands && groups.some(g => g.label) ? `<tr class="band">${groups.map(g =>
      `<th colspan="${g.span}"${g.label ? '' : ' class="blank"'}>${esc(g.label)}</th>`).join('')}</tr>` : ''}
    <tr>${columns.map(c => {
      const dir = sort && sort.key === c.key ? sort.dir : null;
      return `<th class="${c.align ?? 'r'}${c.sortable ? ' sortable' : ''}${dir ? ' sorted ' + dir : ''}"
        ${c.sortable ? `data-sort="${esc(c.key)}" tabindex="0" role="button"` : ''}>${esc(c.label)}${
        c.sortable ? '<span class="caret" aria-hidden="true"></span>' : ''}</th>`;
    }).join('')}</tr></thead>`;

  const body = `<tbody>${rows.map((r, i) =>
    `<tr${zebra && i % 2 ? ' class="alt"' : ''}>${columns.map(c => {
      const v = r[c.key];
      const text = c.format ? c.format(v, r) : (v ?? '');
      return `<td class="${c.align ?? 'r'}">${text}</td>`;
    }).join('')}</tr>`).join('')}</tbody>`;

  return `<table class="dt" id="${id}">${head}${body}</table>`;
}

// Click a sortable header to sort. Returns nothing; calls back with the new sort.
export function onSort(id, fn) {
  const t = document.getElementById(id);
  if (!t) return;
  const go = th => {
    const key = th.dataset.sort;
    const wasAsc = th.classList.contains('sorted') && th.classList.contains('asc');
    fn({ key, dir: wasAsc ? 'desc' : 'asc' });
  };
  t.addEventListener('click', e => {
    const th = e.target.closest('th.sortable');
    if (th) go(th);
  });
  t.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const th = e.target.closest('th.sortable');
    if (th) { e.preventDefault(); go(th); }
  });
}

export function sortRows(rows, sort, columns) {
  if (!sort) return rows;
  const dir = sort.dir === 'desc' ? -1 : 1;
  // A column may sort on a different field than it displays: "72 / 70" reads
  // well and sorts badly, so the column names a numeric twin to sort by.
  const col = columns?.find(c => c.key === sort.key);
  const key = col?.sortBy ?? sort.key;
  return rows.slice().sort((a, b) => {
    const x = a[key], y = b[key];
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
    return String(x).localeCompare(String(y)) * dir;
  });
}

// --- 3. the plan selector --------------------------------------------------
export function planSelect({ id, value, options, label }) {
  return `<label class="plan-sel">${label ? `<span>${esc(label)}</span>` : ''}
    <select id="${id}">${options.map(o =>
      `<option value="${esc(o.value)}"${o.value === value ? ' selected' : ''}>${esc(o.label)}</option>`
    ).join('')}</select></label>`;
}

// --- 4. the breakdown card column ------------------------------------------
// Their alternative to the Sankey: totals at the top, then each component as a card that
// opens. Better than the Sankey when a client wants the numbers rather than the shape.
export function breakdown({ id, columns }) {
  return `<div class="bd" id="${id}">${columns.map(col => `
    <div class="bd-col">
      <div class="bd-head">${esc(col.title)}<b>${esc(col.total)}</b></div>
      ${col.groups.map(g => `
        <div class="bd-group">
          <button type="button" class="bd-card ${g.tone ?? ''}" data-open="${esc(g.key)}"
            aria-expanded="false">
            <span class="bd-l">${esc(g.label)}</span><span class="bd-v">${esc(g.value)}</span>
            ${g.items?.length ? '<span class="bd-chev" aria-hidden="true"></span>' : ''}
          </button>
          ${g.items?.length ? `<div class="bd-items" data-items="${esc(g.key)}" hidden>${
            g.items.map(it => `<div class="bd-item"><span>${esc(it.label)}</span><b>${esc(it.value)}</b></div>`).join('')
          }</div>` : ''}
        </div>`).join('')}
    </div>`).join('')}</div>`;
}
export function onBreakdown(id) {
  const host = document.getElementById(id);
  if (!host) return;
  host.addEventListener('click', e => {
    const b = e.target.closest('.bd-card[data-open]');
    if (!b) return;
    const items = host.querySelector(`[data-items="${b.dataset.open}"]`);
    if (!items) return;
    const open = !items.hidden;
    items.hidden = open;
    b.setAttribute('aria-expanded', String(!open));
    b.classList.toggle('open', !open);
  });
}

// --- 5. a year scrubber ----------------------------------------------------
// Their timeline control: a line from the first year to the last with a pin you drag,
// and the ages under each end. Reads better than a dropdown of thirty years.
export function yearScrubber({ id, years, value, ages }) {
  const i = Math.max(0, years.indexOf(value));
  return `<div class="scrub" id="${id}">
    <div class="scrub-end l"><b>${years[0]}</b>${ages?.[0] ? `<span>${esc(ages[0])}</span>` : ''}</div>
    <input type="range" min="0" max="${years.length - 1}" value="${i}" step="1"
      aria-label="Year" data-years='${JSON.stringify(years)}'>
    <div class="scrub-end r"><b>${years[years.length - 1]}</b>${ages?.[1] ? `<span>${esc(ages[1])}</span>` : ''}</div>
  </div>`;
}
export function onScrubber(id, fn) {
  const host = document.getElementById(id);
  if (!host) return;
  const input = host.querySelector('input');
  const years = JSON.parse(input.dataset.years);
  input.addEventListener('input', () => fn(years[+input.value]));
}

// --- 6. the stylesheet -----------------------------------------------------
export const CSS = `
/* tabs */
.tabs{display:inline-flex;gap:2px;padding:3px;border-radius:9px;
  background:var(--ui-sunken,rgba(13,30,58,.05))}
.tabs .tab{appearance:none;border:0;background:transparent;cursor:pointer;
  padding:7px 15px;border-radius:7px;font-size:13px;color:var(--ui-muted,#5c6880);
  font-family:"DM Sans",system-ui,sans-serif;transition:background .14s,color .14s}
.tabs.sm .tab{padding:5px 11px;font-size:12.5px}
.tabs .tab:hover{color:var(--ui-ink,#0d1e3a)}
.tabs .tab.on{background:var(--ui-panel,#fff);color:var(--ui-ink,#0d1e3a);font-weight:500;
  box-shadow:0 1px 2px rgba(13,30,58,.10)}

/* the data table */
table.dt{width:100%;border-collapse:collapse;font-size:13px;
  font-variant-numeric:lining-nums tabular-nums;font-feature-settings:"lnum" 1,"tnum" 1}
table.dt th,table.dt td{padding:7px 10px;white-space:nowrap}
table.dt th{font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;font-weight:500;
  color:var(--ui-muted,#5c6880);border-bottom:1px solid var(--ui-line,rgba(13,30,58,.16));
  vertical-align:bottom}
table.dt tr.band th{text-transform:none;letter-spacing:.1em;font-size:10.5px;
  background:var(--ui-sunken,rgba(13,30,58,.05));border-bottom:0;text-align:center;
  padding:5px 10px;border-right:2px solid var(--ui-panel,#fff)}
table.dt tr.band th.blank{background:transparent;border-right:0}
table.dt th.sortable{cursor:pointer;user-select:none}
table.dt th.sortable:hover{color:var(--ui-gold,#b8972e)}
table.dt th.sortable .caret{display:inline-block;width:0;height:0;margin-left:5px;
  border-left:3.5px solid transparent;border-right:3.5px solid transparent;
  border-bottom:4.5px solid currentColor;opacity:.25;vertical-align:1px}
table.dt th.sorted{color:var(--ui-gold,#b8972e)}
table.dt th.sorted .caret{opacity:1}
table.dt th.sorted.desc .caret{transform:rotate(180deg)}
table.dt td{border-bottom:1px solid var(--ui-line-soft,rgba(13,30,58,.07))}
table.dt td.r,table.dt th.r{text-align:right}
table.dt td.l,table.dt th.l{text-align:left}
table.dt td.c,table.dt th.c{text-align:center}
table.dt tbody tr.alt{background:var(--ui-zebra,rgba(13,30,58,.022))}
/* the one that matters: the row the cursor is on, tinted just enough to follow it */
table.dt tbody tr{transition:background .1s}
table.dt tbody tr:hover{background:var(--ui-hover,rgba(184,151,46,.10))}
/* the year the scrubber is parked on, held a shade stronger than hover so it
   stays findable once the cursor moves away */
table.dt tbody tr.mark{background:var(--ui-mark,rgba(184,151,46,.18))}
table.dt tbody tr.mark td:first-child{box-shadow:inset 3px 0 0 var(--gold,#b8972e)}
table.dt tbody tr:hover td{border-bottom-color:var(--ui-gold-soft,rgba(184,151,46,.30))}
table.dt td.neg{color:var(--ui-bad,#8c3b2e)}

/* plan selector */
.plan-sel{display:inline-flex;align-items:center;gap:9px;font-size:12.5px;color:var(--ui-muted,#5c6880)}
.plan-sel select{padding:6px 10px;border-radius:7px;font-size:13px;
  border:1px solid var(--ui-line,rgba(13,30,58,.16));background:transparent;color:inherit;
  font-family:"DM Sans",system-ui,sans-serif}

/* breakdown cards */
.bd{display:grid;grid-template-columns:1fr 1fr;gap:26px}
@media (max-width:760px){ .bd{grid-template-columns:1fr} }
.bd-head{display:flex;justify-content:space-between;font-size:12.5px;
  padding:8px 12px;border-radius:7px;background:var(--ui-sunken,rgba(13,30,58,.05));
  color:var(--ui-muted,#5c6880);margin-bottom:10px}
.bd-head b{color:var(--ui-ink,#0d1e3a);font-weight:500}
.bd-card{width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;
  padding:10px 12px;border-radius:8px;border:1px solid var(--ui-line,rgba(13,30,58,.16));
  background:transparent;cursor:pointer;margin-bottom:7px;text-align:left;
  font-family:"DM Sans",system-ui,sans-serif;font-size:13px;color:inherit;
  transition:border-color .14s,background .14s}
.bd-card:hover{border-color:var(--ui-gold,#b8972e);background:var(--ui-hover,rgba(184,151,46,.08))}
.bd-card .bd-v{font-weight:500}
.bd-card.income{border-left:3px solid #2f6f4f}
.bd-card.expense{border-left:3px solid #8c3b2e}
.bd-card.tax{border-left:3px solid #8a6d1f}
.bd-card.goal{border-left:3px solid #2b4c86}
.bd-chev{width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;
  border-top:5px solid currentColor;opacity:.4;transition:transform .14s}
.bd-card.open .bd-chev{transform:rotate(180deg);opacity:1}
.bd-items{padding:2px 12px 10px}
.bd-item{display:flex;justify-content:space-between;font-size:12.5px;padding:4px 0;
  color:var(--ui-muted,#5c6880)}
.bd-item b{color:var(--ui-ink,#0d1e3a);font-weight:500}

/* year scrubber */
.scrub{display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center}
.scrub-end{font-size:12.5px;line-height:1.25}
.scrub-end b{display:block;font-weight:500}
.scrub-end span{color:var(--ui-muted,#5c6880);font-size:11.5px}
.scrub-end.r{text-align:right}
.scrub input[type=range]{width:100%;accent-color:var(--ui-gold,#b8972e)}
`;
