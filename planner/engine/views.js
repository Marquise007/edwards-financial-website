// Views.
// None of these compute anything. They reshape the ledger into the pictures a client
// actually looks at. If a view needs a number the ledger did not record, the fix is in
// the ledger, never here.

import { project } from './ledger.js?v=29308b88c5';
import { SCENARIOS, scenarioParams } from './scenarios.js?v=29308b88c5';

// The cash flow waterfall for one year: inflows, then everything that leaves, then what
// is left. Same shape a client reads on a bank statement, which is the point.
export function waterfall(projection, year) {
  const y = projection.years.find(r => r.year === year);
  if (!y) return null;

  const inflows = Object.values(y.inflows).map(i => ({ label: i.name, kind: i.kind, amount: i.amount }));
  if (y.requiredDistributions > 0) {
    inflows.push({ label: 'Required distributions', kind: 'distribution', amount: y.requiredDistributions });
  }
  const totalInflows = inflows.reduce((s, i) => s + i.amount, 0);

  const expenses = Object.values(y.outflows).map(e => ({ label: e.name, group: e.category, amount: e.amount }));
  const goals = Object.values(y.goals).map(g => ({ label: g.name, group: 'goals', amount: g.amount }));
  const savings = Object.values(y.savings).map(s => ({ label: s.name, group: 'saving', amount: s.amount }));
  const taxes = [
    { label: 'Federal', group: 'tax', amount: y.totals.federalTax },
    { label: 'Payroll', group: 'tax', amount: y.totals.fica },
    { label: 'State', group: 'tax', amount: y.totals.stateTax }
  ].filter(t => t.amount > 0.5);

  return {
    year, ages: y.ages,
    inflows, totalInflows,
    sections: [
      { title: 'Expenses', rows: expenses, total: y.totals.expenses },
      { title: 'Goals', rows: goals, total: y.totals.goals },
      { title: 'Tax', rows: taxes, total: y.totals.federalTax + y.totals.fica + y.totals.stateTax },
      { title: 'Planned saving', rows: savings, total: y.totals.savings }
    ].filter(s => s.rows.length),
    netCashFlow: y.totals.netCashFlow,
    fundedFrom: y.totals.withdrawals,
    shortfall: y.totals.shortfall
  };
}

// The stacked income chart: where every retirement dollar comes from, year by year,
// with any gap shown as a shortage rather than quietly absorbed.
export function incomeStack(projection) {
  const categories = ['socialSecurity', 'pension', 'annuity', 'salary', 'other'];
  return projection.years.map(y => {
    const row = { year: y.year, ages: y.ages, shortage: y.totals.shortfall };
    for (const c of categories) row[c] = 0;
    for (const i of Object.values(y.inflows)) {
      const k = categories.includes(i.kind) ? i.kind : 'other';
      row[k] += i.amount;
    }
    row.withdrawals = y.totals.withdrawals + y.requiredDistributions;
    row.total = categories.reduce((s, c) => s + row[c], 0) + row.withdrawals;
    return row;
  });
}

// Withdrawal rate: what fraction of the portfolio is being spent each year. The number
// every retiree has heard a rule of thumb about and almost none have seen for their own money.
export function withdrawalRate(projection) {
  return projection.years.map(y => ({
    year: y.year,
    withdrawals: y.totals.withdrawals + y.requiredDistributions,
    investedAssets: y.investedAssets,
    rate: y.investedAssets > 0 ? (y.totals.withdrawals + y.requiredDistributions) / y.investedAssets : null
  }));
}

export function netWorthSeries(projection) {
  return projection.years.map(y => ({ year: y.year, netWorth: y.netWorth, investedAssets: y.investedAssets }));
}

export function effectiveTaxSeries(projection) {
  return projection.years.map(y => ({
    year: y.year,
    federal: y.tax.agi > 0 ? y.tax.federalTotal / y.tax.agi : 0,
    payroll: y.tax.agi > 0 ? y.tax.fica / y.tax.agi : 0,
    state: y.tax.agi > 0 ? y.totals.stateTax / y.tax.agi : 0,
    marginalOrdinary: y.tax.marginalOrdinaryRate,
    taxableIncome: y.tax.taxableIncome
  }));
}

// Current versus Proposed, the comparison the whole product hangs on.
export function compare(currentPlan, proposedPlan, params) {
  const current = project(currentPlan, params);
  const proposed = project(proposedPlan, params);
  return {
    current, proposed,
    delta: {
      endingInvestedAssets: proposed.endingInvestedAssets - current.endingInvestedAssets,
      lifetimeFederalTax: sum(proposed, 'federalTax') - sum(current, 'federalTax'),
      firstShortfallYear: { current: current.firstShortfallYear, proposed: proposed.firstShortfallYear }
    }
  };
}

function sum(p, key) { return p.years.reduce((s, y) => s + (y.totals[key] ?? 0), 0); }

// All five deterministic scenarios in one pass, for the comparison chart.
export function allScenarios(plan, params) {
  const out = {};
  for (const key of Object.keys(SCENARIOS)) {
    out[key] = {
      label: SCENARIOS[key].label,
      description: SCENARIOS[key].description,
      projection: project(plan, params, i => scenarioParams(params, key, i))
    };
  }
  return out;
}
