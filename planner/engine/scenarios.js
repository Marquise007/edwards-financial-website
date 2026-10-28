// Deterministic scenarios.
// Monte Carlo answers "how likely." These answer "what would it feel like."
// In the room, the second question is the one that lands, so these get built first
// and shown first. Each scenario is a return path applied to the whole portfolio,
// expressed as a multiplier on the expected total return for a run of years.

export const SCENARIOS = {
  baseline: {
    label: 'Baseline',
    description: 'Expected returns every year, no surprises.',
    path: () => 1
  },
  badDecade: {
    label: 'Bad decade followed by slow growth',
    description: 'Ten years of losses and flat markets, then a recovery that never gets back to trend.',
    path: y => (y < 3 ? -1.2 : y < 10 ? 0.15 : 0.75)
  },
  adverse: {
    label: 'Severe downturn followed by modest growth',
    description: 'A sharp supervisory-style shock in the first two years, then a modest recovery.',
    path: y => (y < 1 ? -3.5 : y < 2 ? -0.8 : 0.70)
  },
  strongGrowth: {
    label: 'Strong growth',
    description: 'Returns above expectation for a sustained stretch.',
    path: y => (y < 15 ? 1.45 : 1.1)
  },
  flatZero: {
    label: 'Flat zero return',
    description: 'The portfolio earns nothing, ever. The purest test of whether the plan works.',
    path: () => 0
  }
};

// Build a params object whose capital market assumptions follow a scenario path.
//
// Interest and dividends are held steady: in a drawdown the coupon and the dividend
// cheque still arrive, the price is what moves. Distributed capital gains are market
// driven, so they scale with the scenario and never go below zero, because a fund with
// no gains distributes none rather than distributing a loss. Everything else lands on
// appreciation, which is where a market shock belongs.
export function scenarioParams(params, scenarioKey, yearIndex) {
  const s = SCENARIOS[scenarioKey];
  if (!s) throw new Error('unknown scenario: ' + scenarioKey);
  const m = s.path(yearIndex);
  const cm = {};
  for (const [cls, a] of Object.entries(params.capitalMarket)) {
    if (cls.startsWith('_') || !a || typeof a.total !== 'number') { cm[cls] = a; continue; }
    const sticky = (a.interest ?? 0) + (a.dividend ?? 0);
    const marketPart = a.total - sticky;
    cm[cls] = {
      ...a,
      capitalGain: Math.max(0, (a.capitalGain ?? 0) * m),
      total: sticky + marketPart * m
    };
  }
  return { ...params, capitalMarket: cm };
}

// Run one scenario across the whole projection. The ledger takes one params object for
// the whole run, so a path that varies by year is applied by projecting year by year
// through a params factory.
export function runScenario(plan, params, scenarioKey, projectFn) {
  const s = SCENARIOS[scenarioKey];
  const yearlyParams = i => scenarioParams(params, scenarioKey, i);
  return projectFn(plan, params, yearlyParams, { scenario: s.label });
}
