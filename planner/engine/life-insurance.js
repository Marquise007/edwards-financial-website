// Life insurance need, solved rather than guessed.
//
// Two methods, both worth having, for two different conversations.
//
// 1. Perpetuity method. What lump sum, earning r, replaces W of income forever, given
//    S already saved. This is the kitchen-table version: one line of arithmetic, done
//    in front of the client. It is the method already in the presentation library.
//
// 2. Survivor cash flow solve. Run the full household projection as though the insured
//    died this year, and find the death benefit that leaves the survivor's portfolio at
//    or above a stated floor at the end of the horizon. Slower, far more honest, and it
//    accounts for Social Security survivor benefits, the loss of one income, the drop in
//    household expenses, and the tax the survivor pays filing single.

export function perpetuityNeed({ income, savings, rateOfReturn }) {
  if (!rateOfReturn) return { error: 'a rate of return of zero has no perpetuity solution' };
  return { coverage: income / rateOfReturn - savings + income };
}

// Bisection on death benefit. The projection is monotonic in death benefit, so bisection
// converges fast and cannot wander.
export function survivorSolve(plan, params, projectFn, opts) {
  const { insuredPersonId, terminalFloor = 0, maxBenefit = 20000000, tolerance = 1000 } = opts;

  const runWith = benefit => {
    const survivorPlan = buildSurvivorPlan(plan, insuredPersonId, benefit, params);
    const out = projectFn(survivorPlan, params);
    const last = out.years[out.years.length - 1];
    return { terminal: last ? last.investedAssets : 0, shortfall: out.years.some(y => y.totals.shortfall > 0.5) };
  };

  const atZero = runWith(0);
  if (atZero.terminal >= terminalFloor && !atZero.shortfall) {
    return { coverage: 0, note: 'the survivor finishes the plan without any death benefit' };
  }

  let lo = 0, hi = maxBenefit;
  for (let i = 0; i < 40 && hi - lo > tolerance; i++) {
    const mid = (lo + hi) / 2;
    const r = runWith(mid);
    if (r.terminal >= terminalFloor && !r.shortfall) hi = mid; else lo = mid;
  }
  return { coverage: Math.ceil(hi / 1000) * 1000, terminalFloor };
}

// Build the counterfactual: the insured dies in the base year.
function buildSurvivorPlan(plan, insuredId, benefit, params) {
  const h = plan.household;
  const survivors = h.people.filter(p => p.id !== insuredId);
  const adj = params.settings?.survivorExpenseAdjustment ?? 0;

  return {
    ...plan,
    household: {
      ...h,
      filingStatus: 'single',
      people: survivors,
      // The insured's earned income stops. Pension and annuity survivor percentages are
      // carried on the income record itself, so anything without one simply ends.
      incomes: h.incomes
        .filter(i => i.owner !== insuredId || i.survivorShare)
        .map(i => i.owner === insuredId ? { ...i, amount: i.amount * i.survivorShare } : i),
      // Household expenses do not halve when one person dies. The adjustment is a house
      // assumption and is disclosed wherever this result is shown.
      expenses: h.expenses.map(e =>
        e.category === 'living' ? { ...e, amount: e.amount * (1 - adj) } : e),
      accounts: [
        ...h.accounts.map(a => ({ ...a, owner: a.owner === insuredId ? survivors[0]?.id : a.owner })),
        benefit > 0 ? {
          id: '__deathBenefit', name: 'Death benefit', owner: survivors[0]?.id,
          type: 'taxable', balance: benefit, basis: benefit
        } : null
      ].filter(Boolean)
    }
  };
}
