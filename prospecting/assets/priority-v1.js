/*
 * Edwards Financial & Associates - Prospect Search V3 Phase 1
 * Priority Score V1
 *
 * Production-candidate reference implementation. No external enrichment is
 * assumed in Phase 1. Contactability and activity are explicitly represented
 * as "not_researched" rather than zero.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.EFAPriorityV1 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERSION = 'phase1-v1.0';
  const CURRENT_YEAR = 2026;

  const MAX = Object.freeze({
    timing: 35,
    service: 20,
    economic: 15,
    confidence: 10,
    phase1Total: 80,
    contactability: 12,
    activity: 8
  });

  const STATUS = Object.freeze({
    WORKING: 'Working',
    LEFT: 'Left payroll',
    CONFIRMED: 'Confirmed Retired',
    PENSION: 'Pension Retiree'
  });

  const phase2Unavailable = Object.freeze({
    available: false,
    status: 'not_researched',
    points: null,
    max: null,
    phase: 2
  });

  function n(value) {
    if (value === null || value === undefined || value === '') return null;
    const x = Number(value);
    return Number.isFinite(x) ? x : null;
  }

  function verifiedService(p) {
    const years = n(p.service_years);
    if (years === null) return null;
    const q = String(p.service_years_quality || '').toLowerCase();
    if (!q || q.includes('observed') || q.includes('unavailable') || q.includes('unknown')) return null;
    return years;
  }

  function threshold(value, rows) {
    const x = n(value);
    if (x === null) return 0;
    for (const row of rows) if (x >= row.min) return row.points;
    return 0;
  }

  function yearsAgo(year, nowYear) {
    const y = n(year);
    return y === null ? null : Math.max(0, nowYear - y);
  }

  function recencyPoints(status, ago) {
    if (ago === null) return 0;
    const tables = {
      [STATUS.CONFIRMED]: { 0: 35, 1: 32, 2: 28, 3: 24, older: 16 },
      [STATUS.PENSION]:   { 0: 33, 1: 30, 2: 26, 3: 22, older: 14 },
      [STATUS.LEFT]:      { 0: 24, 1: 20, older: 14 }
    };
    const t = tables[status];
    if (!t) return 0;
    if (Object.prototype.hasOwnProperty.call(t, ago)) return t[ago];
    return t.older || 0;
  }

  function timingComponent(p, nowYear) {
    const service = verifiedService(p);
    let points = 0;
    let basis = '';
    let eventYear = null;
    let sourceRelativeBonus = 0;

    if (p.status === STATUS.CONFIRMED || p.status === STATUS.PENSION) {
      eventYear = n(p.retirement_year) ?? n(p.separation_year);
      const ago = yearsAgo(eventYear, nowYear);
      points = recencyPoints(p.status, ago);
      basis = eventYear === null ? 'Retirement year unavailable' : `${p.status}, event year ${eventYear}`;
    } else if (p.status === STATUS.LEFT) {
      eventYear = n(p.separation_year);
      const ago = yearsAgo(eventYear, nowYear);
      points = recencyPoints(STATUS.LEFT, ago);
      basis = eventYear === null ? 'Separation year unavailable' : `Left payroll, separation year ${eventYear}`;
    } else if (p.status === STATUS.WORKING) {
      points = threshold(service, [
        { min: 30, points: 20 },
        { min: 25, points: 16 },
        { min: 20, points: 10 }
      ]);
      basis = service === null ? 'Working; verified service not available' : `Working with ${service} verified service years`;
    }

    const sourceLatest = n(p.source_latest_event_year);
    if (eventYear !== null && sourceLatest !== null && eventYear === sourceLatest && points < MAX.timing) {
      sourceRelativeBonus = Math.min(2, MAX.timing - points);
      points += sourceRelativeBonus;
    }

    return {
      available: true,
      points,
      max: MAX.timing,
      basis,
      event_year: eventYear,
      source_latest_event_year: sourceLatest,
      source_relative_bonus: sourceRelativeBonus,
      source_lag_years: sourceLatest === null ? null : Math.max(0, nowYear - sourceLatest)
    };
  }

  function serviceComponent(p) {
    const service = verifiedService(p);
    if (service === null) {
      return {
        available: false,
        status: 'not_available_from_source',
        points: null,
        max: MAX.service,
        basis: p.service_years_quality || 'Service years unavailable'
      };
    }
    const points = threshold(service, [
      { min: 30, points: 20 },
      { min: 25, points: 17 },
      { min: 20, points: 12 },
      { min: 15, points: 7 },
      { min: 10, points: 3 }
    ]);
    return { available: true, points, max: MAX.service, basis: `${service} verified service years` };
  }

  function economicComponent(p) {
    const amount = n(p.amount);
    if (amount === null) {
      return { available: false, status: 'not_available_from_source', points: null, max: MAX.economic, basis: 'Amount unavailable' };
    }
    const pension = String(p.amount_type || '').toLowerCase().includes('pension');
    const points = threshold(amount, pension ? [
      { min: 150000, points: 15 },
      { min: 100000, points: 12 },
      { min: 75000, points: 8 },
      { min: 50000, points: 4 }
    ] : [
      { min: 200000, points: 15 },
      { min: 150000, points: 12 },
      { min: 100000, points: 8 },
      { min: 75000, points: 4 }
    ]);
    return { available: true, points, max: MAX.economic, basis: `${p.amount_type || 'Amount'} ${amount}` };
  }

  function confidenceComponent(p) {
    let points = 6;
    let basis = 'Source record';
    if (p.status === STATUS.PENSION) {
      points = 10; basis = 'Direct pension source record';
    } else if (p.status === STATUS.CONFIRMED) {
      points = 10; basis = p.match_confidence || 'Pension match';
    } else if (p.status === STATUS.WORKING) {
      points = 10; basis = 'Current/latest payroll source record';
    } else if (p.status === STATUS.LEFT) {
      points = 4; basis = p.match_confidence || 'Separation signal only';
    }
    return { available: true, points, max: MAX.confidence, basis };
  }

  function sumAvailable(components) {
    let points = 0, max = 0;
    for (const c of components) {
      if (!c || !c.available) continue;
      points += Number(c.points || 0);
      max += Number(c.max || 0);
    }
    return { points, max };
  }

  function band(score) {
    if (score >= 85) return 'Very High';
    if (score >= 70) return 'High';
    if (score >= 55) return 'Medium';
    if (score >= 40) return 'Developing';
    return 'Low';
  }

  function coverageBand(coverage) {
    if (coverage >= 100) return 'Full Phase 1 evidence';
    if (coverage >= 75) return 'Strong evidence';
    if (coverage >= 50) return 'Partial evidence';
    return 'Limited evidence';
  }

  function explain(p, result) {
    const c = result.components;
    const parts = [];
    parts.push(`${p.status}: ${c.retirement_timing.points}/${c.retirement_timing.max} timing points`);
    parts.push(c.career_maturity.available ? `${c.career_maturity.points}/${c.career_maturity.max} service points` : 'service not available from this source');
    parts.push(c.economic_signal.available ? `${c.economic_signal.points}/${c.economic_signal.max} economic points` : 'amount not available');
    parts.push(`${c.data_confidence.points}/${c.data_confidence.max} data-confidence points`);
    parts.push('contactability and activity not researched in Phase 1');
    return parts.join('; ') + '.';
  }

  function compute(p, options) {
    const nowYear = (options && options.nowYear) || CURRENT_YEAR;
    const components = {
      retirement_timing: timingComponent(p, nowYear),
      career_maturity: serviceComponent(p),
      economic_signal: economicComponent(p),
      data_confidence: confidenceComponent(p),
      contactability: Object.assign({}, phase2Unavailable),
      activity_timing: Object.assign({}, phase2Unavailable)
    };

    const measured = sumAvailable([
      components.retirement_timing,
      components.career_maturity,
      components.economic_signal,
      components.data_confidence
    ]);
    const priority = measured.max ? Math.round((measured.points / measured.max) * 100) : null;
    const evidenceCoverage = Math.round((measured.max / MAX.phase1Total) * 100);
    const result = {
      version: VERSION,
      priority_score: priority,
      priority_band: priority === null ? 'Unscored' : band(priority),
      evidence_coverage: evidenceCoverage,
      evidence_band: coverageBand(evidenceCoverage),
      measured_points: measured.points,
      measured_max: measured.max,
      phase1_possible_max: MAX.phase1Total,
      components
    };
    result.explanation = explain(p, result);
    return result;
  }

  return { VERSION, CURRENT_YEAR, MAX, STATUS, compute, verifiedService };
});
