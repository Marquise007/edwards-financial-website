// Model portfolios, and the arithmetic for describing one.
//
// The weights themselves are a house view and belong to the consultant, not to this file.
// What belongs here is the machinery: given a set of weights and a capital market set, what
// does this portfolio expect to earn, how much does it move, and how does that change as a
// household moves toward and through retirement.

import { blendReturn } from './accounts.js?v=19c30bf6d8';

// The expected return of a blend IS the weighted average of the parts. Volatility is NOT,
// and treating it as though it were is one of the most common errors in this work. Mixing
// two things that do not move together produces a portfolio less volatile than either
// weighted average would suggest, and that difference is the entire case for diversifying.
//
//   variance = sum over i, j of  w_i * w_j * sigma_i * sigma_j * rho_ij
//
// With no correlation matrix every rho is taken as zero off the diagonal, which understates
// risk badly for a portfolio of things that fall together. That case is reported, not hidden.
export function portfolioRisk(weights, capitalMarket, correlation) {
  const classes = Object.keys(weights).filter(c => weights[c] > 0);
  let variance = 0;
  let assumedIndependent = 0;

  for (const a of classes) {
    const sa = capitalMarket[a]?.volatility;
    if (typeof sa !== 'number') throw new Error('no volatility for class: ' + a);
    for (const b of classes) {
      const sb = capitalMarket[b]?.volatility;
      let rho;
      if (a === b) rho = 1;
      else if (correlation?.[a]?.[b] !== undefined) rho = correlation[a][b];
      else { rho = 0; assumedIndependent++; }
      variance += weights[a] * weights[b] * sa * sb * rho;
    }
  }
  return {
    volatility: Math.sqrt(Math.max(0, variance)),
    // How much the correlation structure saved against the naive weighted average. This is
    // the diversification benefit, stated in the same units as the volatility itself.
    naiveVolatility: classes.reduce((s, c) => s + weights[c] * capitalMarket[c].volatility, 0),
    pairsAssumedIndependent: assumedIndependent / 2,
  };
}

// Everything a consultant needs to say about one portfolio in one sentence.
export function describePortfolio(weights, capitalMarket, correlation) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (Math.abs(total - 1) > 1e-6)
    throw new Error(`weights total ${(total * 100).toFixed(2)}%, not 100%`);
  const ret = blendReturn(weights, capitalMarket);
  const risk = portfolioRisk(weights, capitalMarket, correlation);
  return {
    ...ret,
    volatility: risk.volatility,
    naiveVolatility: risk.naiveVolatility,
    diversificationBenefit: risk.naiveVolatility - risk.volatility,
    pairsAssumedIndependent: risk.pairsAssumedIndependent,
    // Return per unit of risk above cash. Useful for ordering portfolios, and never shown
    // to a household as though it were a promise.
    sharpe: capitalMarket.cash
      ? (ret.total - capitalMarket.cash.total) / (risk.volatility || 1e-9)
      : null,
  };
}

// Walk a household from one allocation to another over a stated number of years. The shape
// of that walk is a decision: linear is the honest default, because anything smoother
// implies a precision about when risk should come down that nobody has.
export function glidepath({ from, to, years, shape = 'linear' }) {
  const classes = [...new Set([...Object.keys(from), ...Object.keys(to)])];
  const path = [];
  for (let y = 0; y <= years; y++) {
    const raw = years === 0 ? 1 : y / years;
    const t = shape === 'linear' ? raw
            : shape === 'late'   ? raw * raw            // holds risk, then drops it quickly
            : shape === 'early'  ? 1 - (1 - raw) ** 2   // sheds risk early, then levels off
            : raw;
    const w = {};
    let sum = 0;
    for (const c of classes) {
      const v = (from[c] ?? 0) * (1 - t) + (to[c] ?? 0) * t;
      w[c] = v; sum += v;
    }
    // Floating point drifts over a long path; a weight set that does not total one would
    // quietly scale a household's whole portfolio.
    if (Math.abs(sum - 1) > 1e-12) for (const c of classes) w[c] /= sum;
    path.push({ year: y, weights: w });
  }
  return path;
}

// The equity share of a portfolio, which is the number a household actually reacts to.
export function equityShare(weights, equityClasses) {
  const eq = equityClasses ?? Object.keys(weights).filter(c => /equity|stock|reit|emerging/i.test(c));
  return eq.reduce((s, c) => s + (weights[c] ?? 0), 0);
}
