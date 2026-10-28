// Retirement spending strategies.
//
// The default in most software is "inflation adjusted forever," which assumes a retiree
// spends the same real amount at 92 as at 67 and never reacts to a bad market. Nobody
// does either. These are the published alternatives, and the one a household chooses
// changes the answer more than almost any investment decision.

export const STRATEGIES = {
  inflationAdjusted: {
    label: 'Inflation adjusted',
    plain: 'Spending keeps pace with prices and never changes for any other reason.',
    rate: () => 1
  },

  // Blanchett's retirement spending curve: real spending falls through the active years,
  // flattens, then rises late as health costs arrive. The shape people actually live.
  spendingSmile: {
    label: 'Retirement spending smile',
    plain: 'Spending eases through the early retirement years, settles, then rises again late.',
    rate: (yearsRetired, o = {}) => {
      const earlyDecline = o.earlyDecline ?? 0.01;   // real decline per year, early
      const flatFrom = o.flatFrom ?? 15;
      const lateRise = o.lateRise ?? 0.015;          // real rise per year, late
      const lateFrom = o.lateFrom ?? 22;
      if (yearsRetired <= flatFrom) return Math.pow(1 - earlyDecline, yearsRetired);
      const atFlat = Math.pow(1 - earlyDecline, flatFrom);
      if (yearsRetired <= lateFrom) return atFlat;
      return atFlat * Math.pow(1 + lateRise, yearsRetired - lateFrom);
    }
  },

  // The go-go, slow-go, no-go framing. Blunter than the smile and easier to explain at a
  // kitchen table, which is often worth more than precision.
  spendingStages: {
    label: 'Retirement spending stages',
    plain: 'Three stages: the active years, the quieter years, and the later years.',
    rate: (yearsRetired, o = {}) => {
      const stages = o.stages ?? [
        { throughYear: 10, factor: 1.00 },
        { throughYear: 20, factor: 0.85 },
        { throughYear: Infinity, factor: 0.80 }
      ];
      for (const s of stages) if (yearsRetired <= s.throughYear) return s.factor;
      return stages[stages.length - 1].factor;
    }
  },

  // Spending follows the portfolio but never below a floor or above a ceiling.
  // Needs portfolio context, so it takes the full state rather than just a year count.
  floorAndCeiling: {
    label: 'Floor and ceiling',
    plain: 'Spending moves with the portfolio, but never below a floor or above a ceiling.',
    needsState: true,
    rate: (yearsRetired, o = {}, state = {}) => {
      const floor = o.floor ?? 0.85, ceiling = o.ceiling ?? 1.15;
      const target = o.targetWithdrawalRate ?? 0.04;
      const actual = state.investedAssets > 0
        ? state.plannedSpending / state.investedAssets : target;
      const ratio = actual > 0 ? target / actual : 1;
      return Math.min(ceiling, Math.max(floor, ratio));
    }
  },

  // Guyton and Klinger style guardrails: leave spending alone until the withdrawal rate
  // drifts outside a band, then cut or raise by a fixed step. The one clients respond to,
  // because it tells them in advance exactly what would make the number change.
  guardrails: {
    label: 'Guardrails',
    plain: 'Spending holds steady until the withdrawal rate drifts outside its guardrails, then steps down or up by a set amount.',
    needsState: true,
    rate: (yearsRetired, o = {}, state = {}) => {
      const target = o.targetWithdrawalRate ?? 0.05;
      const upper = o.upperGuardrail ?? target * 1.20;
      const lower = o.lowerGuardrail ?? target * 0.80;
      const step = o.adjustment ?? 0.10;
      const prior = state.priorFactor ?? 1;
      const assets = state.investedAssets ?? 0;
      if (assets <= 0) return prior;
      const rate = state.plannedSpending / assets;
      if (rate > upper) return prior * (1 - step);   // spending too hot, cut
      if (rate < lower) return prior * (1 + step);   // room to spare, raise
      return prior;
    }
  }
};

// Apply a strategy across a projection's retirement years. Returns a factor per year that
// multiplies the base retirement spending goal.
export function spendingPath(strategyKey, retirementYear, lastYear, options = {}, stateFor) {
  const s = STRATEGIES[strategyKey];
  if (!s) throw new Error('unknown spending strategy: ' + strategyKey);
  const out = {};
  let prior = 1;
  for (let year = retirementYear; year <= lastYear; year++) {
    const yearsRetired = year - retirementYear;
    const state = s.needsState && stateFor ? { ...stateFor(year), priorFactor: prior } : {};
    const f = s.rate(yearsRetired, options, state);
    out[year] = f;
    prior = f;
  }
  return { label: s.label, plain: s.plain, factors: out };
}
