// Education funding.
//
// A smaller module than the rest, and it earns its place because the cost inflation is
// nothing like general inflation and because the funding order has real tax consequences.

// Cost of one child's education, inflated from today to each year of attendance.
export function costSchedule(goal, baseYear, rates) {
  const rate = rates.education;
  const rows = [];
  for (let i = 0; i < goal.years; i++) {
    const year = goal.startYear + i;
    const yearsOut = year - baseYear;
    rows.push({
      year,
      yearOfStudy: i + 1,
      cost: goal.annualCost * Math.pow(1 + rate, yearsOut)
    });
  }
  return { goal: goal.name, total: rows.reduce((s, r) => s + r.cost, 0), rows };
}

// Funding sources in priority order. The order matters: a 529 withdrawal for a qualified
// expense is tax free, a taxable account sale realizes gain, and a Roth withdrawal spends
// a dollar that would otherwise have grown tax free for another thirty years.
export const FUNDING_ORDERS = {
  '529only':            ['529'],
  '529andTaxable':      ['529', 'taxable'],
  '529TaxableAndRoth':  ['529', 'taxable', 'roth'],
  'allExcept529':       ['taxable', 'roth', 'deferred'],
  'allResources':       ['529', 'taxable', 'roth', 'deferred']
};

export function fundingPlan(schedule, sources, orderKey = 'allResources') {
  const order = FUNDING_ORDERS[orderKey];
  if (!order) throw new Error('unknown education funding order: ' + orderKey);
  const available = { ...sources };
  const rows = [];

  for (const r of schedule.rows) {
    let remaining = r.cost;
    const from = {};
    for (const s of order) {
      if (remaining <= 0.005) break;
      const take = Math.min(available[s] ?? 0, remaining);
      if (take > 0) { available[s] -= take; remaining -= take; from[s] = take; }
    }
    rows.push({ ...r, from, unfunded: Math.max(0, remaining) });
  }

  const unfunded = rows.reduce((s, r) => s + r.unfunded, 0);
  return {
    goal: schedule.goal,
    order: orderKey,
    rows,
    totalCost: schedule.total,
    totalFunded: schedule.total - unfunded,
    unfunded,
    fullyFunded: unfunded < 0.5,
    remainingBalances: available
  };
}

// What has to be set aside each year from now to cover the whole cost. The number a parent
// actually wants, and the only honest answer to "am I saving enough."
export function requiredAnnualSaving(schedule, currentBalance, yearsUntilStart, growthRate) {
  const r = growthRate;
  const n = Math.max(0, yearsUntilStart);
  const target = presentValueOfCosts(schedule, r, schedule.rows[0].year - n);
  const grownBalance = currentBalance * Math.pow(1 + r, n);
  const shortfall = Math.max(0, target - grownBalance);
  if (shortfall <= 0) return { required: 0, fullyFundedAlready: true };
  if (n === 0) return { required: shortfall, fullyFundedAlready: false };
  // Ordinary annuity future value solved for the payment.
  const factor = r === 0 ? n : (Math.pow(1 + r, n) - 1) / r;
  return { required: shortfall / factor, fullyFundedAlready: false, shortfall, target };
}

function presentValueOfCosts(schedule, rate, atYear) {
  return schedule.rows.reduce((s, row) =>
    s + row.cost / Math.pow(1 + rate, row.year - atYear), 0);
}
