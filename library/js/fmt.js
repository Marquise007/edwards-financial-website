/* Formatting, finance math and small chart helpers shared by every screen. */
(function () {
  'use strict';
  const EFA = window.EFA = window.EFA || {};

  /* ---------- formatting ---------- */
  const nf = (dp) => new Intl.NumberFormat('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const fmt = {
    /** $1,234 (dp decimals). compact: $1.2M / $340K. Negative: -$1,234. */
    money(n, opts) {
      opts = opts || {};
      if (n == null || !isFinite(n)) return '–';
      const neg = n < 0; const a = Math.abs(n);
      let s;
      if (opts.compact && a >= 1e6) s = '$' + nf(a >= 1e7 ? 0 : 1).format(a / 1e6) + 'M';
      else if (opts.compact && a >= 1e4) s = '$' + nf(0).format(a / 1e3) + 'K';
      else s = '$' + nf(opts.dp || 0).format(opts.dp ? a : Math.round(a));
      return (neg ? '-' : '') + s;
    },
    /** fraction in, percent out: 0.0525 -> "5.25%" */
    pct(f, dp) { if (f == null || !isFinite(f)) return '–'; return nf(dp == null ? 2 : dp).format(f * 100) + '%'; },
    num(n, dp) { if (n == null || !isFinite(n)) return '–'; return nf(dp || 0).format(n); },
    int(n) { return fmt.num(Math.round(n), 0); },
    years(n) { const v = Math.round(n * 10) / 10; return fmt.num(v, v % 1 ? 1 : 0) + (Math.abs(v) === 1 ? ' year' : ' years'); },
    /** parse "$1,234.50" / "6.5%" / "1,000" -> number. For pct returns a fraction when asPct is true. */
    parse(s, asPct) {
      if (typeof s === 'number') return s;
      const t = String(s || '').replace(/[^0-9.\-]/g, '');
      if (t === '' || t === '-' || t === '.') return NaN;
      const v = parseFloat(t);
      return asPct ? v / 100 : v;
    }
  };

  /* ---------- finance math (period-based; rate per period) ---------- */
  const fin = {
    /** Level payment that amortizes pv over n periods at rate r (end of period). Positive result. */
    pmt(r, n, pv, fv, type) {
      fv = fv || 0; type = type || 0;
      if (n <= 0) return 0;
      if (r === 0) return (pv + fv) / n;
      const f = Math.pow(1 + r, n);
      return (r * (pv * f + fv)) / ((1 + r * type) * (f - 1));
    },
    /** Future value of pv plus a level payment each period (type 1 = beginning of period). */
    fv(r, n, payment, pv, type) {
      payment = payment || 0; pv = pv || 0; type = type || 0;
      if (r === 0) return pv + payment * n;
      const f = Math.pow(1 + r, n);
      return pv * f + payment * (1 + r * type) * (f - 1) / r;
    },
    /** Present value of a level payment stream plus a future lump sum. */
    pv(r, n, payment, fvAmt, type) {
      payment = payment || 0; fvAmt = fvAmt || 0; type = type || 0;
      if (r === 0) return payment * n + fvAmt;
      const f = Math.pow(1 + r, n);
      return (payment * (1 + r * type) * (1 - 1 / f) / r) + fvAmt / f;
    },
    /** Periods needed for payment to retire pv at rate r (end of period). Infinity if never. */
    nper(r, payment, pv) {
      if (payment <= 0) return Infinity;
      if (r === 0) return pv / payment;
      const x = 1 - (r * pv) / payment;
      if (x <= 0) return Infinity;
      return -Math.log(x) / Math.log(1 + r);
    },
    /** Solve the periodic rate for given n, payment, pv, fv (Newton + bisection fallback). */
    rate(n, payment, pv, fvAmt, type) {
      fvAmt = fvAmt || 0; type = type || 0;
      const f = (r) => (r === 0 ? pv + payment * n + fvAmt : pv * Math.pow(1 + r, n) + payment * (1 + r * type) * (Math.pow(1 + r, n) - 1) / r + fvAmt);
      let lo = -0.99, hi = 1, flo = f(lo), fhi = f(hi);
      if (flo * fhi > 0) return NaN;
      for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2, fm = f(mid);
        if (Math.abs(fm) < 1e-9) return mid;
        if (flo * fm < 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; }
      }
      return (lo + hi) / 2;
    },
    /** Internal rate of return of cash flows (index = period). */
    irr(flows) {
      const npv = (r) => flows.reduce((s, c, i) => s + c / Math.pow(1 + r, i), 0);
      let lo = -0.99, hi = 10, flo = npv(lo), fhi = npv(hi);
      if (flo * fhi > 0) return NaN;
      for (let i = 0; i < 300; i++) {
        const mid = (lo + hi) / 2, fm = npv(mid);
        if (Math.abs(fm) < 1e-10) return mid;
        if (flo * fm < 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; }
      }
      return (lo + hi) / 2;
    },
    /** Amortization schedule. annualRate as fraction. Returns {payment, rows:[{period,payment,interest,principal,balance}], totalInterest, periods}. */
    amortize(principal, annualRate, years, perYear, extra) {
      perYear = perYear || 12; extra = extra || 0;
      const r = annualRate / perYear, n = Math.round(years * perYear);
      const payment = fin.pmt(r, n, principal);
      const rows = []; let bal = principal, totalInterest = 0, p = 0;
      while (bal > 0.005 && p < n * 2) {
        p++;
        const interest = bal * r;
        let princ = payment - interest + extra;
        if (princ > bal) princ = bal;
        bal -= princ; totalInterest += interest;
        rows.push({ period: p, payment: interest + princ, interest, principal: princ, balance: Math.max(0, bal) });
      }
      return { payment, rows, totalInterest, periods: p };
    },
    /** Year-by-year growth with optional annual contribution (timing 'begin' | 'end'). */
    grow(start, annualRate, years, contribution, timing) {
      contribution = contribution || 0;
      const rows = []; let bal = start;
      for (let y = 1; y <= years; y++) {
        const begin = bal;
        if (timing === 'begin') bal += contribution;
        const gain = bal * annualRate; bal += gain;
        if (timing !== 'begin') bal += contribution;
        rows.push({ year: y, begin, contribution, gain, end: bal });
      }
      return rows;
    }
  };

  /* ---------- tiny SVG charts in the house style ---------- */
  const C = { navy: '#0d1e3a', gold: '#b8972e', steel: '#8aa3c7', mist: '#e3e8f0', muted: '#667389', rule: '#d6cfc4', cream: '#f7f5f1' };
  const chart = {
    colors: C,
    /** Line chart. series: [{values:[...], color, width, dash, label}], opts: {w,h,pad,yMin,yMax,xLabels:[], yFormat:fn, ticks:5} -> SVG string */
    line(series, opts) {
      opts = opts || {};
      const w = opts.w || 900, h = opts.h || 420, pad = Object.assign({ l: 90, r: 24, t: 20, b: 46 }, opts.pad || {});
      const all = series.flatMap((s) => s.values).filter((v) => isFinite(v));
      let yMin = opts.yMin != null ? opts.yMin : Math.min(0, ...all), yMax = opts.yMax != null ? opts.yMax : Math.max(...all);
      if (yMax === yMin) yMax = yMin + 1;
      const n = Math.max(...series.map((s) => s.values.length));
      const X = (i) => pad.l + (n <= 1 ? 0 : (i * (w - pad.l - pad.r)) / (n - 1));
      const Y = (v) => pad.t + (h - pad.t - pad.b) * (1 - (v - yMin) / (yMax - yMin));
      const ticks = opts.ticks || 5, yf = opts.yFormat || ((v) => fmt.money(v, { compact: true }));
      let g = '';
      for (let i = 0; i <= ticks; i++) {
        const v = yMin + ((yMax - yMin) * i) / ticks, y = Y(v);
        g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y}" y2="${y}" stroke="${C.rule}" stroke-width="1" opacity=".7"/>`;
        g += `<text x="${pad.l - 12}" y="${y + 6}" text-anchor="end" font-family="DM Sans, sans-serif" font-size="16" fill="${C.muted}">${yf(v)}</text>`;
      }
      if (opts.xLabels) {
        const every = Math.max(1, Math.ceil(opts.xLabels.length / (opts.xMax || 10)));
        opts.xLabels.forEach((lb, i) => {
          if (i % every && i !== opts.xLabels.length - 1) return;
          g += `<text x="${X(i)}" y="${h - pad.b + 28}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="16" fill="${C.muted}">${lb}</text>`;
        });
      }
      series.forEach((s) => {
        const d = s.values.map((v, i) => (isFinite(v) ? `${i === 0 ? 'M' : 'L'}${X(i).toFixed(1)},${Y(v).toFixed(1)}` : '')).join('');
        if (s.area) g += `<path d="${d}L${X(s.values.length - 1)},${Y(yMin)}L${X(0)},${Y(yMin)}Z" fill="${s.color || C.navy}" opacity="${s.areaOpacity || 0.12}"/>`;
        g += `<path d="${d}" fill="none" stroke="${s.color || C.navy}" stroke-width="${s.width || 4}" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''}/>`;
        const last = s.values.length - 1;
        if (s.dot !== false && isFinite(s.values[last])) g += `<circle cx="${X(last)}" cy="${Y(s.values[last])}" r="7" fill="${s.color || C.navy}" stroke="#fff" stroke-width="3"/>`;
      });
      return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${g}</svg>`;
    },
    /** Vertical bars. bars: [{value, color, label}] -> SVG string */
    bars(bars, opts) {
      opts = opts || {};
      const w = opts.w || 900, h = opts.h || 420, pad = Object.assign({ l: 30, r: 30, t: 40, b: 50 }, opts.pad || {});
      const max = opts.max || Math.max(...bars.map((b) => b.value), 1);
      const bw = (w - pad.l - pad.r) / bars.length, gap = bw * (opts.gap == null ? 0.28 : opts.gap);
      const vf = opts.format || ((v) => fmt.money(v, { compact: true }));
      let g = `<line x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}" stroke="${C.rule}" stroke-width="2"/>`;
      bars.forEach((b, i) => {
        const bh = (h - pad.t - pad.b) * Math.max(0, b.value) / max, x = pad.l + i * bw + gap / 2, y = h - pad.b - bh;
        g += `<rect x="${x}" y="${y}" width="${bw - gap}" height="${bh}" rx="6" fill="${b.color || C.navy}"/>`;
        g += `<text x="${x + (bw - gap) / 2}" y="${y - 12}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="20" fill="${C.navy}">${vf(b.value)}</text>`;
        if (b.label) g += `<text x="${x + (bw - gap) / 2}" y="${h - pad.b + 30}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="17" fill="${C.muted}">${b.label}</text>`;
      });
      return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${g}</svg>`;
    }
  };

  EFA.fmt = fmt;
  EFA.fin = fin;
  EFA.chart = chart;
})();
