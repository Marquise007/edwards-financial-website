// Social Security claiming optimizer.
//
// Not a black box. An exhaustive search over claiming ages, scored on a measure the
// household chooses, with every candidate strategy reportable. Two people claiming
// anywhere from 62 to 70 in monthly steps is under 10,000 combinations, which runs in
// well under a second on a deterministic projection.
//
// The named strategies exist because a client asks "what about just taking it at 62" and
// deserves the number, not a lecture.

import { claimFactor, fraMonths } from './social-security.js';
import { project } from './ledger.js';
import { apply as applyLevers } from './levers.js';

export const NAMED = {
  asEarlyAsPossible: p => p.earliestClaimAgeMonths,
  fullRetirementAge: (p, birthYear) => fraMonths(birthYear, p),
  ageSeventy: p => p.delayedCreditStopsAgeMonths,
  atRetirement: (p, birthYear, person) => Math.max(
    p.earliestClaimAgeMonths, Math.min(p.delayedCreditStopsAgeMonths, person.retirementAge * 12))
};

// Rebuild a plan with each person's Social Security income starting at a chosen age and
// scaled by the claiming factor for that age. The stored amount is understood to be the
// benefit at full retirement age, which is what a Social Security statement shows.
export function planWithClaimAges(plan, claimAges, ssParams) {
  const levers = [];
  for (const person of plan.household.people) {
    const months = claimAges[person.id];
    if (months === undefined) continue;
    const income = plan.household.incomes.find(
      i => i.kind === 'socialSecurity' && i.owner === person.id);
    if (!income) continue;
    const pia = income.benefitAtFRA ?? income.amount;
    levers.push({ type: 'incomeAmount', targetId: income.id,
                  value: pia * claimFactor(person.birthYear, months, ssParams) });
    levers.push({ type: 'incomeStart', targetId: income.id,
                  value: { type: 'age', person: person.id, value: Math.floor(months / 12) } });
  }
  return applyLevers(plan, levers);
}

export const MEASURES = {
  endingAssets: p => p.endingInvestedAssets,
  lifetimeBenefits: p => p.years.reduce((s, y) =>
    s + Object.values(y.inflows).filter(i => i.kind === 'socialSecurity')
                                 .reduce((a, i) => a + i.amount, 0), 0),
  lifetimeAfterTaxSpending: p => p.years.reduce((s, y) =>
    s + y.totals.expenses + y.totals.goals, 0),
  lowestPortfolioValue: p => Math.min(...p.years.map(y => y.investedAssets))
};

// The full search. step is in months: 1 for every month, 12 for whole years, which is
// usually enough and 144 times faster.
export function optimize(plan, params, options = {}) {
  const ssParams = params.socialSecurity;
  if (!ssParams) throw new Error('no social security parameters');
  const step = options.step ?? 12;
  const measureKey = options.measure ?? 'endingAssets';
  const measure = MEASURES[measureKey];
  if (!measure) throw new Error('unknown measure: ' + measureKey);

  const claimants = plan.household.people.filter(p =>
    plan.household.incomes.some(i => i.kind === 'socialSecurity' && i.owner === p.id));
  if (!claimants.length) return { error: 'nobody in this household has a Social Security benefit' };

  const lo = ssParams.earliestClaimAgeMonths, hi = ssParams.delayedCreditStopsAgeMonths;
  const options_ = [];
  for (let m = lo; m <= hi; m += step) options_.push(m);
  if (options_[options_.length - 1] !== hi) options_.push(hi);

  const grid = cartesian(claimants.map(() => options_));
  const scored = [];
  for (const combo of grid) {
    const claimAges = {};
    claimants.forEach((p, i) => { claimAges[p.id] = combo[i]; });
    const out = project(planWithClaimAges(plan, claimAges, ssParams), params);
    scored.push({
      claimAges,
      claimAgesInYears: Object.fromEntries(
        Object.entries(claimAges).map(([k, v]) => [k, +(v / 12).toFixed(2)])),
      value: measure(out),
      succeeded: out.succeeded,
      endingInvestedAssets: out.endingInvestedAssets
    });
  }
  scored.sort((a, b) => b.value - a.value);

  return {
    measure: measureKey,
    combinationsTested: scored.length,
    optimal: scored[0],
    worst: scored[scored.length - 1],
    spread: scored[0].value - scored[scored.length - 1].value,
    top: scored.slice(0, options.topN ?? 10),
    all: options.keepAll ? scored : undefined
  };
}

// The five strategies a client recognizes, each scored the same way, so the optimal one
// can be shown as a difference rather than as an assertion.
export function namedStrategies(plan, params, options = {}) {
  const ssParams = params.socialSecurity;
  const measure = MEASURES[options.measure ?? 'endingAssets'];
  const claimants = plan.household.people.filter(p =>
    plan.household.incomes.some(i => i.kind === 'socialSecurity' && i.owner === p.id));

  const rows = [];
  for (const [key, fn] of Object.entries(NAMED)) {
    const claimAges = {};
    for (const p of claimants) claimAges[p.id] = fn(ssParams, p.birthYear, p);
    const out = project(planWithClaimAges(plan, claimAges, ssParams), params);
    rows.push({
      strategy: key,
      claimAgesInYears: Object.fromEntries(
        Object.entries(claimAges).map(([k, v]) => [k, +(v / 12).toFixed(2)])),
      value: measure(out),
      succeeded: out.succeeded
    });
  }

  // "Current strategy" is whatever the plan already says.
  const current = project(plan, params);
  rows.push({ strategy: 'current', claimAgesInYears: currentClaimAges(plan),
              value: measure(current), succeeded: current.succeeded });

  rows.sort((a, b) => b.value - a.value);
  return rows;
}

function currentClaimAges(plan) {
  const out = {};
  for (const i of plan.household.incomes) {
    if (i.kind !== 'socialSecurity') continue;
    out[i.owner] = i.start?.type === 'age' ? i.start.value : null;
  }
  return out;
}

function cartesian(lists) {
  return lists.reduce((acc, list) =>
    acc.flatMap(prefix => list.map(v => [...prefix, v])), [[]]);
}
