// Checks a capital market assumption set is usable before it is ever shown to a household.
//
// A CMA set is the one parameter block with no statute behind it: nobody publishes the
// "correct" expected return the way the IRS publishes a bracket. What CAN be checked is
// whether the set is internally coherent, and an incoherent set fails in ways that are
// invisible on the page and wrong in the output. These are the checks that catch that.

// A correlation matrix that is not positive semi-definite describes a world that cannot
// exist. Cholesky silently produces NaN on one, and NaN returns propagate into a
// probability of success that still prints as a number. This is the single most important
// check here.
export function choleskyFails(matrix) {
  const n = matrix.length;
  const L = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s = 0;
      for (let k = 0; k < j; k++) s += L[i][k] * L[j][k];
      if (i === j) {
        const d = matrix[i][i] - s;
        if (d <= 0) return { ok: false, atRow: i, diagonal: d };
        L[i][j] = Math.sqrt(d);
      } else {
        L[i][j] = (matrix[i][j] - s) / L[j][j];
      }
    }
  }
  return { ok: true };
}

export function checkCMA(capitalMarket, correlation) {
  const problems = [];
  const classes = Object.keys(capitalMarket ?? {}).filter(k => !k.startsWith('_'));
  if (!classes.length) return [{ level: 'fatal', where: 'capitalMarket', says: 'no asset classes at all' }];

  for (const cls of classes) {
    const a = capitalMarket[cls];
    const at = 'capitalMarket.' + cls;
    if (typeof a?.total !== 'number') {
      problems.push({ level: 'fatal', where: at, says: 'no total return' });
      continue;
    }
    if (typeof a.volatility !== 'number' || a.volatility < 0)
      problems.push({ level: 'fatal', where: at, says: 'volatility missing or negative' });

    // The three taxed pieces are carved OUT of the total. Appreciation is the remainder,
    // and it may be negative for a class that distributes more than it earns, but the
    // named pieces exceeding the total by a wide margin means the decomposition is wrong.
    const named = (a.interest ?? 0) + (a.dividend ?? 0) + (a.capitalGain ?? 0);
    if (named > a.total + 1e-9)
      problems.push({ level: 'warn', where: at,
        says: `interest + dividend + capital gain (${(named * 100).toFixed(2)}%) exceeds total return (${(a.total * 100).toFixed(2)}%), so appreciation is negative` });

    for (const piece of ['interest', 'dividend', 'capitalGain'])
      if ((a[piece] ?? 0) < 0)
        problems.push({ level: 'fatal', where: at + '.' + piece, says: 'a return component cannot be negative' });

    // A volatility of zero turns the lognormal draw into a constant, which quietly removes
    // that class from the simulation rather than erroring.
    if (a.volatility === 0 && a.total !== 0)
      problems.push({ level: 'warn', where: at, says: 'zero volatility makes this class deterministic in every simulation' });

    if (!a.source && !capitalMarket._source)
      problems.push({ level: 'warn', where: at, says: 'no source recorded' });

    // A class whose whole return sits in appreciation is not necessarily wrong, but for a
    // class that really does pay income it means the split was never sourced, and the
    // projection will understate the tax that class throws off every year it is held in a
    // taxable account. Worth saying out loud rather than leaving as a silent zero.
    const income = (a.interest ?? 0) + (a.dividend ?? 0) + (a.capitalGain ?? 0);
    if (income === 0 && a.total > 0 && a._incomeSplitSource === null)
      problems.push({ level: 'warn', where: at,
        says: 'the income split was never sourced, so the whole return sits in appreciation. '
            + 'In a taxable account this understates the tax due every year.' });
  }

  if (!correlation) {
    problems.push({ level: 'warn', where: 'correlation',
      says: 'no correlation matrix, so every class is drawn independently and the simulation understates how much they fall together' });
    return problems;
  }

  for (const a of classes) {
    if (correlation[a]?.[a] !== 1)
      problems.push({ level: 'fatal', where: `correlation.${a}.${a}`, says: 'a class must correlate 1.00 with itself' });
    for (const b of classes) {
      const ab = correlation[a]?.[b], ba = correlation[b]?.[a];
      if (ab === undefined)
        problems.push({ level: 'fatal', where: `correlation.${a}.${b}`, says: 'missing' });
      else if (ab < -1 || ab > 1)
        problems.push({ level: 'fatal', where: `correlation.${a}.${b}`, says: `out of range at ${ab}` });
      else if (ba !== undefined && Math.abs(ab - ba) > 1e-9)
        problems.push({ level: 'fatal', where: `correlation.${a}.${b}`,
          says: `not symmetric: ${ab} one way, ${ba} the other` });
    }
  }

  const m = classes.map(a => classes.map(b => correlation[a]?.[b] ?? (a === b ? 1 : 0)));
  const chol = choleskyFails(m);
  if (!chol.ok)
    problems.push({ level: 'fatal', where: 'correlation',
      says: `not positive semi-definite: the decomposition fails at ${classes[chol.atRow]} with a diagonal of ${chol.diagonal.toFixed(6)}. `
          + 'A matrix like this describes a set of relationships no real market can have, and the simulation would return NaN rather than an error.' });

  return problems;
}

// True when nothing fatal stands in the way of showing this set to a household.
export function cmaUsable(capitalMarket, correlation) {
  return !checkCMA(capitalMarket, correlation).some(p => p.level === 'fatal');
}
