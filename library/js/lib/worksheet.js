/* Shared component: the "Documentation" worksheet (app-worksheet). The numbers behind a screen's result,
   shown as a house-style table in an in-stage overlay, with a row range filter, column-group switches,
   five text sizes, click-to-highlight rows, column hide/show (header right-click or the Columns button),
   cell Copy (right-click a cell), and Download as a spreadsheet (.xlsx) or CSV through the app's
   downloads capability.
   Needs js/lib/overlays.js (loaded before this file). API and examples: docs/components.md */
(function () {
  'use strict';
  const EFA = window.EFA = window.EFA || {};
  const L = EFA.lib = EFA.lib || {};
  const U = L._;
  if (!U) { console.error('EFA.lib.worksheet needs js/lib/overlays.js loaded first.'); return; }
  const { esc, cp, plain, asHTML, refresh, copyScreen, wire, visitState, panel, ICON } = U;
  const fmt = () => EFA.fmt;
  const LS = (EFA.util && EFA.util.LS) || { get: (k, d) => d, set() {} };

  const WS = '_lib_worksheet';
  copyScreen(WS, 'Shared wording: documentation worksheet', {
    open: 'Documentation',
    'filter.from': 'Show rows from',
    'filter.to': 'to',
    'filter.apply': 'Apply',
    'filter.all': 'Show all',
    size: 'Text size',
    'size.a': 'A',
    download: 'Download',
    'dl.xlsx': 'Spreadsheet',
    'dl.csv': 'CSV',
    columns: 'Columns',
    'col.hide': 'Hide this column',
    'col.show': 'Show a hidden column',
    'col.all': 'Show every column',
    'col.none': 'No columns are hidden.',
    'col.hint': 'Right-click a column title to hide it, or a cell to copy its values.',
    copy: 'Copy',
    'copy.from': 'Copies this column from the selected row down',
    'copy.done': 'Copied to the clipboard.',
    'copy.ok': 'Done',
    'copy.help': 'Your browser kept the clipboard closed. These values are selected: press Ctrl+C (Cmd+C on a Mac) to copy them.',
    disclosure: 'Disclosure',
    assume: 'Assumptions',
    none: 'No rows fall between those limits.',
    empty: 'There is nothing to show yet.'
  });

  const SIZES = [14, 16, 19, 22, 26];
  const NUMERIC = { money: 1, pct: 1, num: 1, int: 1, age: 1, year: 1 };
  const UNAVAILABLE = ['unavailable', 'not_granted', 'capability_disabled', 'capability_removed', 'extension_not_enabled'];

  EFA.css('lib-worksheet', `
  .stage .lib-ws .st-overlay-in { width: 1480px; }
  .stage .lib-ws--medium .st-overlay-in { width: 1100px; }
  .stage .lib-ws--small .st-overlay-in { width: 740px; }
  .stage .lib-ws .st-overlay-b { display: flex; flex-direction: column; gap: 16px; overflow: hidden; min-height: 0; padding: 20px 28px 22px; }
  .stage .lib-ws-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 22px; flex: 0 0 auto; }
  .stage .lib-ws-grp { display: inline-flex; align-items: center; gap: 10px; font: 600 16px/1.2 var(--f-body); color: var(--muted); }
  .stage .lib-ws-num { width: 92px; height: 42px; border: 1.5px solid var(--mist-2); border-radius: 9px; background: #fff; padding: 0 10px; text-align: center; font: 600 18px/1 var(--f-body); color: var(--navy); }
  .stage .lib-ws-num:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .stage .lib-ws-btn { border: 1.5px solid var(--mist-2); background: #fff; border-radius: 999px; padding: 8px 15px; font: 600 15px/1 var(--f-body); color: var(--navy); }
  .stage .lib-ws-btn:hover { border-color: var(--gold); }
  .stage .lib-ws-sp { flex: 1 1 0; min-width: 0; }
  .stage .lib-ws-sizes { display: inline-flex; align-items: flex-end; gap: 2px; border: 1.5px solid var(--mist-2); border-radius: 999px; padding: 3px 8px; background: #fff; }
  .stage .lib-ws-sz { border: 0; background: transparent; padding: 3px 5px; border-radius: 6px; color: #a7b0bf; font-weight: 700; line-height: 1; }
  .stage .lib-ws-sz[aria-pressed="true"] { color: var(--navy); }
  .stage .lib-ws-sz:hover { color: var(--gold-deep); }
  .stage .lib-ws-sw { display: inline-flex; align-items: center; gap: 9px; font: 600 16px/1.2 var(--f-body); color: var(--navy); cursor: pointer; }
  .stage .lib-ws-sw input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .stage .lib-ws-track { width: 42px; height: 24px; border-radius: 999px; background: var(--mist-2); position: relative; transition: background .2s ease; flex: 0 0 auto; }
  .stage .lib-ws-track::after { content: ""; position: absolute; left: 3px; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(13,30,58,.3); transition: transform .2s ease; }
  .stage .lib-ws-sw input:checked + .lib-ws-track { background: var(--navy); }
  .stage .lib-ws-sw input:checked + .lib-ws-track::after { transform: translateX(18px); }
  .stage .lib-ws-sw input:focus-visible + .lib-ws-track { outline: 2px solid var(--gold); outline-offset: 2px; }
  .stage .st-pill.lib-ws-dl { min-height: 42px; padding: 6px 18px; font-size: 16px; }
  .stage .lib-ws-assume { flex: 0 0 auto; background: var(--cream); border: 1px solid var(--rule); border-radius: 12px; padding: 12px 18px 14px; }
  .stage .lib-ws-assume .lib-cap { text-align: left; margin-bottom: 8px; }
  .stage .lib-ws-pairs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px 28px; }
  .stage .lib-ws--small .lib-ws-pairs { grid-template-columns: minmax(0, 1fr); }
  .stage .lib-ws-pair { display: flex; justify-content: space-between; gap: 14px; font: 500 17px/1.35 var(--f-body); color: var(--navy); border-bottom: 1px dotted var(--rule); padding: 2px 0; }
  .stage .lib-ws-pair .v { font-weight: 700; white-space: nowrap; }
  .stage .lib-ws-wrap { position: relative; flex: 1 1 auto; min-height: 0; display: flex; }
  .stage .lib-ws-scroll { flex: 1 1 auto; min-height: 0; min-width: 0; overflow: auto; border: 1px solid var(--rule); border-radius: 12px; background: #fff; overscroll-behavior: contain; }
  .stage .lib-ws-more { position: absolute; top: 1px; bottom: 1px; right: 1px; width: 64px; border-radius: 0 11px 11px 0; pointer-events: none; background: linear-gradient(to left, rgba(13,30,58,.18), rgba(13,30,58,0)); opacity: 0; transition: opacity .25s ease; }
  .stage .lib-ws-wrap.more .lib-ws-more { opacity: 1; }
  .stage table.lib-ws-tab { width: 100%; font-size: 19px; }
  .stage table.lib-ws-tab thead th { position: sticky; top: 0; z-index: 1; font-size: .7em; line-height: 1.25; vertical-align: bottom; white-space: normal; }
  .stage table.lib-ws-tab td { white-space: nowrap; padding: .42em .7em; }
  .stage table.lib-ws-tab th { padding: .75em .8em; }
  .stage table.lib-ws-tab th.r, .stage table.lib-ws-tab td.r { text-align: right; }
  .stage table.lib-ws-tab th.c, .stage table.lib-ws-tab td.c { text-align: center; }
  .stage table.lib-ws-tab th.l, .stage table.lib-ws-tab td.l { text-align: left; white-space: normal; }
  .stage table.lib-ws-tab tbody tr { cursor: pointer; }
  .stage table.lib-ws-tab tbody tr:hover td { background: var(--mist); }
  .stage table.lib-ws-tab tbody tr td.hlc { background: rgba(240,230,196,.7); font-weight: 700; }
  .stage table.lib-ws-tab tbody tr.lib-ws-msg td { text-align: center; color: var(--muted); padding: 26px; cursor: default; white-space: normal; }
  .stage .lib-ws-foot { flex: 0 0 auto; margin: 0; }
  .stage .lib-ws-dlg { display: inline-flex; align-items: center; gap: 8px; }
  .stage .lib-ws-dlg[hidden] { display: none; }
  .stage .lib-ws-dlg .lib-ws-dlcap { display: inline-flex; align-items: center; gap: 6px; font: 600 16px/1.2 var(--f-body); color: var(--muted); }
  .stage table.lib-ws-tab thead th { cursor: context-menu; }
  .stage .lib-ws-menu { position: absolute; z-index: 30; min-width: 260px; max-width: 420px; background: #fff; border: 1px solid var(--rule); border-radius: 12px; box-shadow: 0 14px 34px rgba(13,30,58,.22); padding: 8px; display: flex; flex-direction: column; gap: 2px; }
  .stage .lib-ws-menu .cap { font: 700 12px/1.3 var(--f-body); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); padding: 8px 12px 4px; }
  .stage .lib-ws-menu .note { font: 500 14px/1.35 var(--f-body); color: var(--muted); padding: 6px 12px 8px; }
  .stage .lib-ws-menu button { text-align: left; border: 0; background: transparent; border-radius: 8px; padding: 9px 12px; font: 600 16px/1.25 var(--f-body); color: var(--navy); display: flex; align-items: center; gap: 10px; }
  .stage .lib-ws-menu button:hover, .stage .lib-ws-menu button:focus-visible { background: var(--mist); outline: none; }
  .stage .lib-ws-menu button .box { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid var(--mist-2); flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; }
  .stage .lib-ws-menu button[aria-checked="true"] .box { background: var(--navy); border-color: var(--navy); }
  .stage .lib-ws-menu button[aria-checked="true"] .box::after { content: ""; width: 5px; height: 9px; border: solid #fff; border-width: 0 2px 2px 0; transform: translateY(-1px) rotate(45deg); }
  .stage .lib-ws-menu hr { border: 0; border-top: 1px solid var(--rule); margin: 4px 6px; }
  .stage .lib-ws-copybox { position: absolute; z-index: 31; right: 28px; top: 90px; width: 420px; background: #fff; border: 1px solid var(--rule); border-radius: 12px; box-shadow: 0 14px 34px rgba(13,30,58,.22); padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
  .stage .lib-ws-copybox p { margin: 0; font: 500 15px/1.4 var(--f-body); color: var(--navy); }
  .stage .lib-ws-copybox textarea { width: 100%; height: 220px; resize: none; border: 1.5px solid var(--mist-2); border-radius: 8px; padding: 8px 10px; font: 500 15px/1.35 var(--f-body); font-variant-numeric: tabular-nums lining-nums; color: var(--navy); box-sizing: border-box; }
  `);

  const typeOf = (c) => (c && c.type) || 'text';
  const alignOf = (c) => {
    if (c.align) return c.align === 'left' ? 'l' : c.align === 'center' ? 'c' : 'r';
    const t = typeOf(c);
    return t === 'text' ? 'l' : (t === 'age' || t === 'year') ? 'c' : 'r';
  };
  const isCopyHTML = (v) => typeof v === 'string' && /^\s*</.test(v) && v.indexOf('data-cp=') > 0;
  /** display text for one cell */
  function show(c, v) {
    if (v == null || v === '') return '';
    if (typeof v === 'string') return isCopyHTML(v) && typeOf(c) === 'text' ? v : esc(v);
    if (typeof v !== 'number' || !isFinite(v)) return esc(String(v));
    const f = fmt();
    switch (typeOf(c)) {
      case 'money': return f.money(v, { dp: c.dp || 0 });
      case 'pct': return f.pct(v, c.dp == null ? 2 : c.dp);
      case 'num': return f.num(v, c.dp == null ? 2 : c.dp);
      case 'int': return f.int(v);
      case 'age': case 'year': return String(Math.round(v));
      default: return esc(String(v));
    }
  }
  /** number for the download (ready strings are parsed the way the original exported them) */
  function toNumber(c, v) {
    if (typeof v === 'number') return isFinite(v) ? v : NaN;
    const s = String(v == null ? '' : v).trim();
    const neg = /^(-|\$-|\u2013|\$\u2013|\()/.test(s);
    const d = s.replace(/[^0-9.]/g, '');
    if (!d) return NaN;
    let n = parseFloat(d) * (neg ? -1 : 1);
    if (typeOf(c) === 'pct') n = n / 100; // "5.00%" or "5.00" in a percent column means 5%
    return n;
  }
  function csvText(s) {
    s = String(s == null ? '' : s);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // never let a spreadsheet read a text cell as a formula
    return /[",\r\n]/.test(s) || /^\s|\s$/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function csvCell(c, v) {
    const t = typeOf(c);
    if (v == null || v === '') return '';
    if (!NUMERIC[t]) return csvText(isCopyHTML(v) ? plain(v) : (typeof v === 'string' ? v : String(v)));
    const n = toNumber(c, v);
    if (!isFinite(n)) return csvText(typeof v === 'string' ? plain(v) : String(v));
    switch (t) {
      case 'money': return n.toFixed(2);
      case 'pct': return (n * 100).toFixed(c.dp == null ? 2 : c.dp) + '%';
      case 'num': return n.toFixed(c.dp == null ? 2 : c.dp);
      default: return String(Math.round(n));
    }
  }
  function filterField(d) {
    if (d.filter === false) return null;
    if (d.filter) return d.filter;
    const cols = d.columns || [];
    const age = cols.find((c) => typeOf(c) === 'age');
    const yr = cols.find((c) => typeOf(c) === 'year');
    return (age || yr || {}).field || null;
  }
  const whole = (s) => { const t = String(s == null ? '' : s).trim(); if (!/\d/.test(t)) return null; const n = parseInt(t.replace(/[^0-9-]/g, ''), 10); return isFinite(n) ? n : null; };
  function filtered(d, st) {
    const f = filterField(d), rows = d.rows || [];
    if (!f || (st.min == null && st.max == null)) return rows;
    return rows.filter((r) => {
      const v = parseInt(typeof r[f] === 'number' ? r[f] : String(r[f]).replace(/[^0-9-]/g, ''), 10);
      if (!isFinite(v)) return false;
      return (st.min == null || v >= st.min) && (st.max == null || v <= st.max);
    });
  }
  /** a column is shown unless the presenter (or the host's `hidden: true`) hid it, or its group switch is off */
  function isHidden(c, st) { const h = st.hide || {}; return Object.prototype.hasOwnProperty.call(h, c.field) ? !!h[c.field] : !!c.hidden; }
  function visibleCols(d, st) { return (d.columns || []).filter((c) => !isHidden(c, st) && !(c.group && st.off[c.group])); }
  function fileName(d) {
    const base = (d.file ? String(d.file) : plain(d.heading)) || 'worksheet';
    const clean = base.replace(/[*?:\\/[\]<>|"]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 120) || 'worksheet';
    return clean + '.csv';
  }
  const fileXlsx = (d) => fileName(d).replace(/\.csv$/, '.xlsx');

  /* ---------- spreadsheet (.xlsx) writer: a minimal Office Open XML workbook in a stored zip ---------- */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  /** files: [{name, text}] -> Uint8Array of a zip (no compression, which every spreadsheet app reads) */
  function zip(files) {
    const enc = new TextEncoder(), parts = [], cen = [];
    let off = 0;
    const u16 = (v) => [v & 255, (v >>> 8) & 255], u32 = (v) => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
    const DOS_T = 0, DOS_D = ((2026 - 1980) << 9) | (1 << 5) | 1;
    files.forEach((f) => {
      const name = enc.encode(f.name), data = enc.encode(f.text), crc = crc32(data);
      const head = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(DOS_T), u16(DOS_D), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
      parts.push(Uint8Array.from(head), name, data);
      cen.push([[].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(DOS_T), u16(DOS_D), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off)), name]);
      off += head.length + name.length + data.length;
    });
    let cenLen = 0;
    cen.forEach(([h, n]) => { parts.push(Uint8Array.from(h), n); cenLen += h.length + n.length; });
    parts.push(Uint8Array.from([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cenLen), u32(off), u16(0))));
    const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
    let i = 0; parts.forEach((p) => { out.set(p, i); i += p.length; });
    return out;
  }
  const xesc = (s) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function colName(i) { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function sheetName(d) { return (plain(d.heading) || 'Worksheet').replace(/[*?:\\/[\]<>|]/g, '-').replace(/^'+|'+$/g, '').trim().slice(0, 31) || 'Worksheet'; }
  /* cell styles: 1 title, 2 header, 3/4/5/6/7 text/whole/money/pct/int (plain rows), 8-12 the same on striped rows,
     13 disclosure, 14 assumption label, 15 assumption value */
  const XSTYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="###0"/></numFmts>
<fonts count="5"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="16"/><color rgb="FF0D1E3A"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><i/><sz val="9"/><color rgb="FF5B6475"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FF0D1E3A"/><name val="Calibri"/></font></fonts>
<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0D1E3A"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF1F4F8"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="16"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment horizontal="center"/></xf>
<xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="10" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyFill="1"/>
<xf numFmtId="164" fontId="0" fillId="3" borderId="0" xfId="0" applyNumberFormat="1" applyFill="1" applyAlignment="1"><alignment horizontal="center"/></xf>
<xf numFmtId="4" fontId="0" fillId="3" borderId="0" xfId="0" applyNumberFormat="1" applyFill="1"/>
<xf numFmtId="10" fontId="0" fillId="3" borderId="0" xfId="0" applyNumberFormat="1" applyFill="1"/>
<xf numFmtId="3" fontId="0" fillId="3" borderId="0" xfId="0" applyNumberFormat="1" applyFill="1"/>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  /** the workbook bytes: one sheet named after the heading; title row, assumptions, a blank row, the visible
      columns and filtered rows as real numbers, then the disclosure (as the original's Excel export did) */
  function xlsx(d, st) {
    st = st || { min: null, max: null, off: {}, hide: {} };
    const cols = visibleCols(d, st), rows = filtered(d, st);
    const out = [], merges = []; let r = 0;
    const wide = cols.length >= 3;
    const str = (ref, v, s) => `<c r="${ref}" t="inlineStr" s="${s}"><is><t xml:space="preserve">${xesc(v)}</t></is></c>`;
    const num = (ref, v, s) => `<c r="${ref}" s="${s}"><v>${v}</v></c>`;
    const row = (cells, ht) => { r++; out.push(`<row r="${r}"${ht ? ` ht="${ht}" customHeight="1"` : ''}>${cells.join('')}</row>`); };
    row([str('A' + (r + 1), plain(d.heading), 1)], 24);
    if (d.assumptions && d.assumptions.length) {
      row([str('A' + (r + 1), U.text(WS, 'assume'), 14)]);
      d.assumptions.forEach((a) => { if (wide) merges.push(`A${r + 1}:B${r + 1}`); row([str('A' + (r + 1), plain(a.label), 15), str((wide ? 'C' : 'B') + (r + 1), plain(a.value), 15)]); });
    }
    row([]);
    const hdrRow = r + 1;
    row(cols.map((c, i) => str(colName(i) + (r + 1), plain(c.header != null ? c.header : c.field), 2)), 32);
    const kind = (c) => { const t = typeOf(c); return t === 'age' || t === 'year' ? 1 : t === 'money' || t === 'num' ? 2 : t === 'pct' ? 3 : t === 'int' ? 4 : 0; };
    rows.forEach((rw, k) => {
      const base = k % 2 ? 8 : 3;
      row(cols.map((c, i) => {
        const ref = colName(i) + (r + 1), v = rw[c.field], kd = kind(c);
        if (v == null || v === '') return '';
        if (kd) { const n = toNumber(c, v); if (isFinite(n)) return num(ref, kd === 1 || kd === 4 ? Math.round(n) : Math.round(n * (kd === 3 ? 1e6 : 100)) / (kd === 3 ? 1e6 : 100), base + kd); }
        return str(ref, isCopyHTML(v) ? plain(v) : String(typeof v === 'string' ? plain(v) : v), base);
      }));
    });
    const topics = d.disclosures || ['hypothetical', 'license'];
    const widths = cols.map((c) => { const h = plain(c.header != null ? c.header : c.field).length; const t = typeOf(c); return Math.max(t === 'age' || t === 'year' ? 8 : t === 'text' ? 18 : 14, Math.min(28, Math.ceil(h * 0.6) + 2)); });
    const lastCol = colName(Math.max(0, cols.length - 1));
    if (topics.length && L.disclosure) {
      const txt = L.disclosure.text(topics), span = Math.max(60, widths.reduce((a, w) => a + w, 0));
      row([]); row([str('A' + (r + 1), U.text(WS, 'disclosure'), 14)]);
      if (cols.length > 1) merges.push(`A${r + 1}:${lastCol}${r + 1}`);
      row([str('A' + (r + 1), txt, 13)], Math.min(400, 13 * Math.max(1, Math.ceil(txt.length * 1.05 / span)) + 4));
    }
    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><dimension ref="A1:${lastCol}${Math.max(1, r)}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="${hdrRow}" topLeftCell="A${hdrRow + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>${cols.length ? `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : ''}<sheetData>${out.join('')}</sheetData>${merges.length ? `<mergeCells count="${merges.length}">${merges.map((m) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : ''}<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup orientation="landscape" fitToHeight="0"/></worksheet>`;
    return zip([
      { name: '[Content_Types].xml', text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
      { name: '_rels/.rels', text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xesc(sheetName(d))}" sheetId="1" r:id="rId1"/></sheets></workbook>` },
      { name: 'xl/_rels/workbook.xml.rels', text: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: 'xl/worksheets/sheet1.xml', text: sheet },
      { name: 'xl/styles.xml', text: XSTYLES }
    ]);
  }

  /** the CSV text: heading, assumptions, the visible columns and filtered rows, then the disclosure lines */
  function csv(d, st) {
    st = st || { min: null, max: null, off: {}, hide: {} };
    const lines = [csvText(plain(d.heading))];
    if (d.assumptions && d.assumptions.length) {
      lines.push('', csvText(U.text(WS, 'assume')));
      d.assumptions.forEach((a) => lines.push(csvText(plain(a.label)) + ',' + csvText(plain(a.value))));
    }
    const cols = visibleCols(d, st);
    lines.push('', cols.map((c) => csvText(plain(c.header != null ? c.header : c.field))).join(','));
    filtered(d, st).forEach((r) => lines.push(cols.map((c) => csvCell(c, r[c.field])).join(',')));
    const topics = d.disclosures || ['hypothetical', 'license'];
    if (topics.length && L.disclosure) lines.push('', csvText(L.disclosure.text(topics)));
    return '\ufeff' + lines.join('\r\n') + '\r\n';
  }

  function tableHTML(d, st) {
    const cols = visibleCols(d, st), rows = filtered(d, st);
    const hl = d.highlight;
    const head = cols.map((c) => `<th data-ws-col="${esc(c.field)}" class="${alignOf(c)}"${c.width ? ` style="width:${+c.width}px;min-width:${+c.width}px"` : ''}>${c.header != null ? c.header : esc(c.field)}</th>`).join('');
    let body;
    if (!(d.rows || []).length) body = `<tr class="lib-ws-msg"><td colspan="${Math.max(1, cols.length)}">${cp(WS, 'empty')}</td></tr>`;
    else if (!rows.length) body = `<tr class="lib-ws-msg"><td colspan="${Math.max(1, cols.length)}">${cp(WS, 'none')}</td></tr>`;
    else body = rows.map((r, ri) => `<tr data-ws-row="${ri}">${cols.map((c) => `<td data-ws-col="${esc(c.field)}" class="${alignOf(c)}${c.field === hl || c.highlight ? ' hlc' : ''}">${show(c, r[c.field])}</td>`).join('')}</tr>`).join('');
    return `<table class="st-table lib-ws-tab" style="font-size:${SIZES[st.size]}px"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  /** resolve copy keys a screen may pass instead of rendered HTML for its own words */
  function normalize(ctx, d) {
    d = Object.assign({}, d || {});
    d.heading = asHTML(ctx, d.heading);
    d.columns = (d.columns || []).map((c) => Object.assign({}, c, { header: c.header != null ? asHTML(ctx, c.header) : c.header }));
    if (d.assumptions) d.assumptions = d.assumptions.map((a) => Object.assign({}, a, { label: asHTML(ctx, a.label) }));
    if (d.groups) d.groups = d.groups.map((g) => Object.assign({}, g, { label: asHTML(ctx, g.label) }));
    return d;
  }
  function open(ctx, d) {
    d = normalize(ctx, d);
    const size = d.size === 'medium' || d.size === 'small' ? d.size : 'full';
    const key = plain(d.heading) || 'sheet';
    const st = visitState('ws:' + key, () => ({ min: null, max: null }));
    if (!st.hide) st.hide = {}; // columns the presenter hid or showed; kept while the screen is visited
    st.off = {}; // column-group switches start on each time, as in the original
    // text size: the presenter's last choice on this device, else smaller for wide tables
    let sz = LS.get('efa.lib.ws.size', null);
    if (typeof sz !== 'number' || !(sz >= 0 && sz < SIZES.length)) { const n = (d.columns || []).filter((c) => !c.hidden).length; sz = n > 11 ? 0 : n > 8 ? 1 : 2; }
    st.size = sz;
    const ff = filterField(d);
    const groups = (d.groups || []).filter((g) => g && g.group);
    const assume = d.assumptions && d.assumptions.length
      ? `<div class="lib-ws-assume">${cp(WS, 'assume', { tag: 'p', cls: 'lib-cap' })}<div class="lib-ws-pairs">${d.assumptions.map((a) => `<div class="lib-ws-pair"><span>${a.label}</span><span class="v num">${esc(plain(a.value))}</span></div>`).join('')}</div></div>` : '';
    const bar = `<div class="lib-ws-bar">
        ${ff ? `<span class="lib-ws-grp">${cp(WS, 'filter.from')}<input class="lib-ws-num" data-ws="min" inputmode="numeric" autocomplete="off" value="${st.min == null ? '' : st.min}">${cp(WS, 'filter.to')}<input class="lib-ws-num" data-ws="max" inputmode="numeric" autocomplete="off" value="${st.max == null ? '' : st.max}"><button type="button" class="lib-ws-btn" data-ws="apply">${cp(WS, 'filter.apply')}</button><button type="button" class="lib-ws-btn" data-ws="all">${cp(WS, 'filter.all')}</button></span>` : ''}
        ${groups.map((g) => `<label class="lib-ws-sw"><input type="checkbox" data-ws-group="${esc(g.group)}" checked><span class="lib-ws-track"></span>${g.label}</label>`).join('')}
        <span class="lib-ws-sp"></span>
        <span class="lib-ws-grp">${cp(WS, 'size')}<span class="lib-ws-sizes">${SIZES.map((px, i) => `<button type="button" class="lib-ws-sz" data-ws-size="${i}" aria-pressed="${i === sz}" style="font-size:${Math.round(11 + i * 3.2)}px">${cp(WS, 'size.a')}</button>`).join('')}</span></span>
        <button type="button" class="lib-ws-btn" data-ws="cols" aria-haspopup="menu">${cp(WS, 'columns')}</button>
        <span class="lib-ws-dlg" data-ws="dlg" hidden><span class="lib-ws-dlcap">${ICON.down}${cp(WS, 'download')}</span><button type="button" class="st-pill lib-pill lib-ws-dl" data-ws="xlsx">${cp(WS, 'dl.xlsx')}</button><button type="button" class="st-pill lib-pill lib-ws-dl" data-ws="download">${cp(WS, 'dl.csv')}</button></span>
      </div>`;
    const topics = d.disclosures || ['hypothetical', 'license'];
    const ov = panel(ctx, {
      title: d.heading || '', cls: `lib-ws lib-ws--${size}`,
      html: `${bar}${assume}<div class="lib-ws-wrap"><div class="lib-ws-scroll lib-scroll">${tableHTML(d, st)}</div><span class="lib-ws-more" aria-hidden="true"></span></div>${topics.length && L.disclosure ? L.disclosure.line(topics, { cls: 'lib-ws-foot' }) : ''}`
    });
    const scroll = ov.querySelector('.lib-ws-scroll'), wrap = ov.querySelector('.lib-ws-wrap');
    // a soft fade on the right edge while more columns are out of view
    const more = () => { if (wrap) wrap.classList.toggle('more', scroll.scrollWidth - scroll.clientWidth - scroll.scrollLeft > 4); };
    scroll.addEventListener('scroll', more, { passive: true });
    const redraw = () => { scroll.innerHTML = tableHTML(d, st); refresh(scroll); more(); };
    const minI = ov.querySelector('[data-ws="min"]'), maxI = ov.querySelector('[data-ws="max"]');
    const apply = () => { st.min = minI ? whole(minI.value) : null; st.max = maxI ? whole(maxI.value) : null; if (minI) minI.value = st.min == null ? '' : st.min; if (maxI) maxI.value = st.max == null ? '' : st.max; redraw(); };
    [minI, maxI].forEach((inp) => inp && inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); apply(); } }));
    ov.addEventListener('change', (e) => {
      const g = e.target.closest('[data-ws-group]'); if (!g) return;
      st.off[g.getAttribute('data-ws-group')] = !g.checked; redraw();
    });
    // downloads: shown only when the app can save files here
    const dlBtn = ov.querySelector('[data-ws="dlg"]');
    const dlNow = () => (EFA.platform && EFA.platform.downloads) || null;
    let gone = false;
    const sync = () => { if (dlBtn) dlBtn.hidden = gone || !dlNow(); };
    sync();
    if (EFA.platform && !EFA.platform.known) {
      let n = 0; const t = setInterval(() => { n++; if (!ov.isConnected || n > 40 || EFA.platform.known) { clearInterval(t); } if (ov.isConnected) sync(); }, 500);
    }
    /* ---- context menus: hide/show columns (header), Copy (cell) ---- */
    const host = ov.querySelector('.st-overlay-in') || ov;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const scale = () => { const r = host.getBoundingClientRect(); return host.offsetWidth ? r.width / host.offsetWidth : 1; };
    const ovBox = () => { const r = host.getBoundingClientRect(), k = scale(); return { left: r.left, top: r.top, k }; };
    let menu = null;
    const closeMenu = () => { if (menu) { menu.remove(); menu = null; } };
    const place = (m, x, y, alignRight) => {
      const k = scale(); x /= k; y /= k;
      host.appendChild(m);
      const w = m.offsetWidth, h = m.offsetHeight, W = host.offsetWidth, H = host.offsetHeight;
      if (alignRight) x -= w;
      m.style.left = Math.max(8, Math.min(x, W - w - 8)) + 'px';
      m.style.top = Math.max(8, Math.min(y, H - h - 8)) + 'px';
      refresh(m);
      const f = m.querySelector('button'); if (f && !U.editing()) f.focus({ preventScroll: true });
    };
    const label = (c) => (c.header != null ? c.header : esc(c.field));
    function colMenu(field, x, y, alignRight) {
      closeMenu();
      const cols = d.columns || [];
      const shown = visibleCols(d, st);
      const hidden = cols.filter((c) => isHidden(c, st));
      const m = document.createElement('div'); m.className = 'lib-ws-menu'; m.setAttribute('role', 'menu');
      let h = '';
      if (field != null && shown.length > 1) h += `<button type="button" role="menuitem" data-m="hide" data-f="${esc(field)}">${cp(WS, 'col.hide')}</button><hr>`;
      if (field == null) {
        h += `<span class="cap">${cp(WS, 'columns')}</span>` + cols.filter((c) => !(c.group && st.off[c.group])).map((c) => `<button type="button" role="menuitemcheckbox" aria-checked="${!isHidden(c, st)}" data-m="tog" data-f="${esc(c.field)}"><span class="box"></span>${label(c)}</button>`).join('');
        if (hidden.length) h += `<hr><button type="button" role="menuitem" data-m="all">${cp(WS, 'col.all')}</button>`;
        h += `<span class="note">${cp(WS, 'col.hint')}</span>`;
      } else {
        h += `<span class="cap">${cp(WS, 'col.show')}</span>` + (hidden.length ? hidden.map((c) => `<button type="button" role="menuitem" data-m="show" data-f="${esc(c.field)}">${label(c)}</button>`).join('') : `<span class="note">${cp(WS, 'col.none')}</span>`);
      }
      m.innerHTML = h; menu = m; place(m, x, y, alignRight);
    }
    function cellMenu(field, rowIdx, x, y) {
      closeMenu();
      const m = document.createElement('div'); m.className = 'lib-ws-menu'; m.setAttribute('role', 'menu');
      m.innerHTML = `<button type="button" role="menuitem" data-m="copy" data-f="${esc(field)}" data-r="${rowIdx}">${cp(WS, 'copy')}</button><span class="note">${cp(WS, 'copy.from')}</span>`;
      menu = m; place(m, x, y);
    }
    /** the clicked column's values from the clicked row to the last filtered row, one per line, as shown */
    function copyValues(field, from) {
      const c = (d.columns || []).find((x) => x.field === field); if (!c) return;
      const vals = filtered(d, st).slice(from).map((r) => plain(show(c, r[field])));
      const text = vals.join('\n');
      const fallback = () => {
        const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; } ta.remove();
        if (ok) { EFA.toast(U.text(WS, 'copy.done')); return; }
        // the copy helper: values selected, ready for the keyboard shortcut
        const old = host.querySelector('.lib-ws-copybox'); if (old) old.remove();
        const box = document.createElement('div'); box.className = 'lib-ws-copybox';
        box.innerHTML = `${cp(WS, 'copy.help', { tag: 'p' })}<textarea readonly></textarea><button type="button" class="lib-ws-btn" data-m="copyclose" style="align-self:flex-end">${cp(WS, 'copy.ok')}</button>`;
        box.querySelector('textarea').value = text; host.appendChild(box); refresh(box);
        const t = box.querySelector('textarea'); t.focus(); t.select();
        box.addEventListener('keydown', (e) => e.stopPropagation());
        box.querySelector('[data-m="copyclose"]').addEventListener('click', () => box.remove());
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => EFA.toast(U.text(WS, 'copy.done')), fallback);
        else fallback();
      } catch (e) { fallback(); }
    }
    ov.addEventListener('contextmenu', (e) => {
      const cell = e.target.closest('.lib-ws-tab th[data-ws-col], .lib-ws-tab td[data-ws-col]');
      if (!cell || !scroll.contains(cell)) { if (!e.target.closest('.lib-ws-menu')) closeMenu(); return; }
      e.preventDefault();
      const o = ovBox(), x = e.clientX - o.left, y = e.clientY - o.top;
      if (cell.tagName === 'TH') colMenu(cell.getAttribute('data-ws-col'), x, y);
      else {
        const tr = cell.closest('tr'); if (tr && !tr.classList.contains('hl')) tr.classList.add('hl');
        cellMenu(cell.getAttribute('data-ws-col'), +tr.getAttribute('data-ws-row'), x, y);
      }
    });
    // Escape closes an open menu first (window capture runs before the overlay's own Escape handler)
    const onMenuEsc = (e) => {
      if (!ov.isConnected) { window.removeEventListener('keydown', onMenuEsc, true); return; }
      if (e.key !== 'Escape') return;
      const cb = host.querySelector('.lib-ws-copybox');
      if (menu || cb) { e.stopPropagation(); e.preventDefault(); closeMenu(); if (cb) cb.remove(); }
    };
    window.addEventListener('keydown', onMenuEsc, true);
    ov.addEventListener('click', (e) => {
      const mi = e.target.closest('.lib-ws-menu [data-m]');
      if (menu && !mi && !e.target.closest('.lib-ws-menu') && !e.target.closest('[data-ws="cols"]')) closeMenu();
      if (!mi || U.editing()) return;
      const act = mi.getAttribute('data-m'), f = mi.getAttribute('data-f');
      if (act === 'hide') { st.hide[f] = true; closeMenu(); redraw(); }
      else if (act === 'show') { st.hide[f] = false; closeMenu(); redraw(); }
      else if (act === 'all') { (d.columns || []).forEach((c) => { st.hide[c.field] = false; }); closeMenu(); redraw(); }
      else if (act === 'tog') {
        const c = (d.columns || []).find((x) => x.field === f);
        if (c) { const hide = !isHidden(c, st); if (hide && visibleCols(d, st).length <= 1) return; st.hide[f] = hide; redraw(); const r = mi.getBoundingClientRect(), o = ovBox(); const left = parseFloat(menu.style.left), top = parseFloat(menu.style.top); colMenu(null, left * o.k, top * o.k); }
      }
      else if (act === 'copy') { closeMenu(); copyValues(f, +mi.getAttribute('data-r') || 0); }
      e.stopPropagation();
    }, true);
    ov.addEventListener('click', (e) => {
      if (U.editing()) return;
      const sb = e.target.closest('[data-ws-size]');
      if (sb) {
        st.size = +sb.getAttribute('data-ws-size'); LS.set('efa.lib.ws.size', st.size);
        ov.querySelectorAll('[data-ws-size]').forEach((b) => b.setAttribute('aria-pressed', b === sb));
        const t = scroll.querySelector('table'); if (t) t.style.fontSize = SIZES[st.size] + 'px';
        more();
        return;
      }
      const b = e.target.closest('[data-ws]');
      if (b) {
        const a = b.getAttribute('data-ws');
        if (a === 'apply') apply();
        else if (a === 'all') { if (minI) minI.value = ''; if (maxI) maxI.value = ''; apply(); }
        else if (a === 'cols') { const r = b.getBoundingClientRect(), o = ovBox(); colMenu(null, r.left - o.left + r.width, r.bottom - o.top + 6, true); }
        else if (a === 'download' || a === 'xlsx') {
          const dl = dlNow(); if (!dl) { sync(); return; }
          Promise.resolve().then(() => dl.save(a === 'xlsx' ? { filename: fileXlsx(d), data: xlsx(d, st) } : { filename: fileName(d), data: csv(d, st) })).catch((err) => {
            if (err && UNAVAILABLE.indexOf(err.code) >= 0) { gone = true; sync(); }
            else if (err && !err.code) console.error(err);
          });
        }
        return;
      }
      const tr = e.target.closest('tbody tr');
      if (tr && !tr.classList.contains('lib-ws-msg') && scroll.contains(tr)) tr.classList.toggle('hl');
    });
    more();
    return ov;
  }

  L.worksheet = {
    button(ctx, o) {
      o = o || {};
      const tok = wire(ctx, 'click', (e) => {
        e.preventDefault();
        let d = o.data;
        if (typeof d === 'function') { try { d = d(); } catch (err) { console.error(err); return; } }
        if (d) open(ctx, d);
      });
      const label = o.label != null ? asHTML(ctx, o.label) : cp(WS, 'open');
      const st = o.style ? ` style="${esc(o.style)}"` : '';
      const cls = o.cls ? ' ' + o.cls : '';
      if (o.look === 'pill') return `<button type="button" class="st-pill lib-pill${cls}" data-lib="${tok}"${st}>${ICON.sheet}${label}</button>`;
      return `<button type="button" class="lib-link${cls}" data-lib="${tok}"${st}>${ICON.sheet}${label}</button>`;
    },
    open(ctx, d) { return open(ctx, d); },
    csv(d) { return csv(d || {}); },
    /** the spreadsheet bytes (Uint8Array of an .xlsx) that the Spreadsheet download saves */
    xlsx(d) { return xlsx(d || {}); }
  };
})();
