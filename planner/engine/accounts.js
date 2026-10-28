// Accounts, their tax character, and how money comes out of them.

export const TAX_CLASS = {
  bank: 'taxable', taxable: 'taxable', brokerage: 'taxable',
  traditional401k: 'deferred', traditionalIRA: 'deferred', sep: 'deferred',
  simple: 'deferred', four57b: 'deferred', four03b: 'deferred', annuityQualified: 'deferred',
  roth401k: 'free', rothIRA: 'free', hsa: 'free', fiveTwoNine: 'free',
  annuityNonQualified: 'nonqualified'
};

export function taxClassOf(type) {
  const c = TAX_CLASS[type];
  if (!c) throw new Error('unknown account type: ' + type);
  return c;
}

// Withdrawal sequences, named exactly as they are presented to the consultant.
export const SEQUENCES = {
  'taxable-deferred-free': ['taxable', 'nonqualified', 'deferred', 'free'],
  'taxable-free-deferred': ['taxable', 'nonqualified', 'free', 'deferred'],
  'deferred-taxable-free': ['deferred', 'taxable', 'nonqualified', 'free'],
  'free-taxable-deferred': ['free', 'taxable', 'nonqualified', 'deferred'],
  'pro-rata': ['pro-rata']
};

// Split a portfolio return into the pieces the tax code treats differently.
// weights: { [assetClass]: fraction }  cma: { [assetClass]: {interest, dividend, capitalGain, total} }
export function blendReturn(weights, cma) {
  let interest = 0, dividend = 0, capitalGain = 0, total = 0;
  for (const [cls, w] of Object.entries(weights)) {
    const a = cma[cls];
    if (!a) throw new Error('no capital market assumption for class: ' + cls);
    interest += w * (a.interest ?? 0);
    dividend += w * (a.dividend ?? 0);
    capitalGain += w * (a.capitalGain ?? 0);
    total += w * a.total;
  }
  // Whatever the three named pieces do not account for is unrealized appreciation.
  const appreciation = total - interest - dividend - capitalGain;
  return { interest, dividend, capitalGain, appreciation, total };
}

// Grow one account for a year and report the taxable events it threw off.
// turnover is the fraction of unrealized gain realized each year in a taxable account.
export function growAccount(acct, ret, settings) {
  const cls = taxClassOf(acct.type);
  const start = acct.balance;
  const interest = start * ret.interest;
  const dividend = start * ret.dividend;
  const distributedGain = start * ret.capitalGain;
  const appreciation = start * ret.appreciation;

  let taxable = { interest: 0, qualifiedDividends: 0, ordinaryDividends: 0, longTermGains: 0 };
  if (cls === 'taxable') {
    const qd = settings.qualifiedDividendShare ?? 1;
    taxable.interest = interest;
    taxable.qualifiedDividends = dividend * qd;
    taxable.ordinaryDividends = dividend;
    // Realized gains: distributed gains plus turnover against unrealized appreciation.
    const realizedFromTurnover = Math.max(0, appreciation) * (settings.portfolioTurnover ?? 0);
    taxable.longTermGains = (distributedGain + realizedFromTurnover) * (settings.longTermGainShare ?? 1);
  }
  const growth = interest + dividend + distributedGain + appreciation;
  const fee = start * (settings.advisoryFee ?? 0);
  return { growth, fee, endBalance: start + growth - fee, taxable };
}

// Pull `need` dollars following the sequence. Returns what came out of each class and
// the taxable consequence of pulling it.
export function withdraw(accounts, need, sequenceKey, ctx) {
  const order = SEQUENCES[sequenceKey];
  if (!order) throw new Error('unknown withdrawal sequence: ' + sequenceKey);
  const taken = { taxable: 0, nonqualified: 0, deferred: 0, free: 0 };
  const taxEvents = { ordinary: 0, longTermGains: 0 };
  let remaining = need;

  const pull = (acct, amount) => {
    const got = Math.min(acct.balance, amount);
    if (got <= 0) return 0;
    acct.balance -= got;
    const cls = taxClassOf(acct.type);
    taken[cls] += got;
    if (cls === 'deferred') {
      taxEvents.ordinary += got;
    } else if (cls === 'taxable') {
      // Only the gain portion is taxed, basis comes out free.
      const basisShare = acct.basis !== undefined && (acct.balance + got) > 0
        ? Math.min(1, acct.basis / (acct.balance + got)) : 1;
      const gain = got * (1 - basisShare);
      taxEvents.longTermGains += gain;
      if (acct.basis !== undefined) acct.basis = Math.max(0, acct.basis - got * basisShare);
    } else if (cls === 'nonqualified') {
      // Last in, first out on an annuity: gain comes out first as ordinary income.
      const gain = Math.max(0, (acct.balance + got) - (acct.basis ?? 0));
      const ordinary = Math.min(got, gain);
      taxEvents.ordinary += ordinary;
      if (acct.basis !== undefined) acct.basis = Math.max(0, acct.basis - (got - ordinary));
    }
    return got;
  };

  if (order[0] === 'pro-rata') {
    const pool = accounts.filter(a => a.balance > 0 && !a.excludeFromWithdrawals);
    const total = pool.reduce((s, a) => s + a.balance, 0);
    if (total <= 0) return { taken, taxEvents, shortfall: remaining };
    for (const a of pool) {
      const share = (a.balance / total) * need;
      remaining -= pull(a, share);
    }
    return { taken, taxEvents, shortfall: Math.max(0, remaining) };
  }

  for (const cls of order) {
    if (remaining <= 0.005) break;
    const pool = accounts
      .filter(a => taxClassOf(a.type) === cls && a.balance > 0 && !a.excludeFromWithdrawals)
      .sort((a, b) => (a.withdrawalPriority ?? 0) - (b.withdrawalPriority ?? 0));
    for (const a of pool) {
      if (remaining <= 0.005) break;
      remaining -= pull(a, remaining);
    }
  }
  return { taken, taxEvents, shortfall: Math.max(0, remaining) };
}

// Required minimum distribution for one owner in one year.
// table: { [age]: distributionPeriod }. Ages below the applicable beginning age return 0.
export function rmd(priorYearEndBalance, age, beginAge, table) {
  if (age < beginAge) return 0;
  const period = table[String(age)];
  if (period === undefined) return 0;
  return priorYearEndBalance / period;
}
