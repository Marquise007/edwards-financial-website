// Monte Carlo.
//
// The mistake that makes these numbers lie: drawing one return per run and applying it to
// every year. Do that and a two-sigma equity draw compounds for thirty years into a figure
// no one should ever show a client. A run is a PATH: a fresh correlated draw every year.
//
// Returns are drawn lognormally, so a year can lose a great deal and still not lose more
// than everything, which a normal draw will happily do.

import { project } from './ledger.js?v=29308b88c5';

// Seeded so a client sees the same number twice. A plan whose probability moves when you
// refresh the page is not a plan.
export function makeRandom(seed = 1) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

export function normal(rand) {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Cholesky, so asset classes fall together the way they actually do rather than each
// wandering off alone. A diversification benefit that only exists because the model
// forgot about correlation is not a diversification benefit.
// The floor this function used to put under the diagonal was there to stop a crash on a
// matrix that is not positive semi-definite. It did stop the crash, and it replaced it with
// something far worse: the off-diagonal terms were then divided by about 1e-6, the drawn
// returns went to infinity, balances went to NaN, and because every comparison against NaN
// is false the shortfall test never fired. An impossible correlation matrix therefore
// reported a 100.0% probability of success for every household. A crash is a bad day. A
// confident, wrong, printable answer is a liability. This now refuses.
export function cholesky(matrix, classNames) {
  const n = matrix.length;
  const L = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
      if (i === j) {
        const d = matrix[i][i] - sum;
        if (!(d > 0)) {
          const who = classNames?.[i] ?? ('row ' + i);
          throw new Error(
            `the correlation matrix is not positive semi-definite: it fails at ${who}. ` +
            'A matrix like this describes relationships no market can have, so no simulation ' +
            'can be run from it. Correct the correlations rather than the symptom.');
        }
        L[i][j] = Math.sqrt(d);
      } else {
        L[i][j] = (matrix[i][j] - sum) / L[j][j];
      }
    }
  }
  return L;
}

// Convert a stated expectation and volatility into lognormal parameters.
// compounding 'geometric' reads `total` as a compound annual rate, which is what a client
// hears when you say "seven percent". 'arithmetic' reads it as the average of the annual
// returns, which is a higher number for the same portfolio. The difference is roughly half
// the variance and it is worth several points of probability, so it is a setting, not a
// silent assumption.
export function logParams(total, volatility, compounding) {
  const sigma2 = Math.log(1 + (volatility * volatility) / Math.pow(1 + total, 2));
  const sigma = Math.sqrt(Math.max(0, sigma2));
  const mu = compounding === 'arithmetic'
    ? Math.log(1 + total) - sigma2 / 2
    : Math.log(1 + total);
  return { mu, sigma };
}

export function run(plan, params, options = {}) {
  const runs = options.runs ?? params.monteCarlo?.runs ?? 1000;
  const compounding = options.compounding ?? params.monteCarlo?.compounding ?? 'geometric';
  const rand = makeRandom(options.seed ?? 20261027);
  const classes = Object.keys(plan.settings.allocation);

  const corr = params.correlation
    ? classes.map(a => classes.map(b => params.correlation[a]?.[b] ?? (a === b ? 1 : 0)))
    : classes.map((a, i) => classes.map((b, j) => (i === j ? 1 : 0)));
  const L = cholesky(corr, classes);

  const logs = {};
  for (const cls of classes) {
    const a = params.capitalMarket[cls];
    if (!a) throw new Error('no capital market assumption for class: ' + cls);
    logs[cls] = logParams(a.total, a.volatility, compounding);
  }

  const horizon = horizonYears(plan);
  const results = [];
  const endings = [];
  let successes = 0;

  for (let r = 0; r < runs; r++) {
    // Build the whole path up front so the projection can ask for any year.
    const path = [];
    for (let y = 0; y <= horizon; y++) {
      const z = classes.map(() => normal(rand));
      const cm = {};
      classes.forEach((cls, i) => {
        let correlated = 0;
        for (let k = 0; k <= i; k++) correlated += L[i][k] * z[k];
        const { mu, sigma } = logs[cls];
        const drawn = Math.exp(mu + sigma * correlated) - 1;
        const base = params.capitalMarket[cls];
        const sticky = (base.interest ?? 0) + (base.dividend ?? 0);
        cm[cls] = {
          ...base,
          // Income stays sticky; the draw lands on price. A gain distribution cannot be
          // negative, so a losing year distributes none.
          capitalGain: Math.max(0, (base.capitalGain ?? 0) * (drawn > 0 ? 1 : 0)),
          total: drawn
        };
        // Keep the sticky income from exceeding the drawn total in a bad year: if the
        // whole year's return is less than the income, appreciation simply goes negative,
        // which is exactly what happens in a real drawdown.
        void sticky;
      });
      path.push({ ...params, capitalMarket: cm });
    }

    const out = project(plan, params, i => path[Math.min(i, path.length - 1)]);
    if (out.succeeded) successes++;
    endings.push(out.endingInvestedAssets);
    if (options.keepRuns) results.push(out);
  }

  endings.sort((a, b) => a - b);
  const pct = p => endings[Math.min(endings.length - 1, Math.max(0, Math.floor(p * endings.length)))];

  return {
    runs,
    compounding,
    probabilityOfSuccess: Math.round((successes / runs) * 1000) / 10,
    ending: { p5: pct(0.05), p25: pct(0.25), median: pct(0.5), p75: pct(0.75), p95: pct(0.95) },
    results
  };
}

// The confidence fan: percentile bands of invested assets at each age, which needs the
// per-year balances, so this keeps the runs.
export function confidenceBands(plan, params, options = {}) {
  const r = run(plan, params, { ...options, keepRuns: true });
  const byYear = new Map();
  for (const out of r.results) {
    for (const y of out.years) {
      if (!byYear.has(y.year)) byYear.set(y.year, []);
      byYear.get(y.year).push(y.investedAssets);
    }
  }
  const bands = [...byYear.entries()].sort((a, b) => a[0] - b[0]).map(([year, vals]) => {
    vals.sort((a, b) => a - b);
    const q = p => vals[Math.min(vals.length - 1, Math.floor(p * vals.length))];
    return { year, p5: q(0.05), p25: q(0.25), median: q(0.5), p75: q(0.75), p95: q(0.95) };
  });
  return { probabilityOfSuccess: r.probabilityOfSuccess, bands };
}

function horizonYears(plan) {
  const base = plan.household.asOfYear;
  const last = Math.max(...plan.household.people.map(p => p.birthYear + p.planningHorizonAge));
  return Math.max(1, last - base);
}
