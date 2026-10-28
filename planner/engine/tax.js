// Federal tax calculator.
// Parameters are injected, never hard-coded here, so the year's numbers can be swapped
// without touching the math and so every figure keeps its citation in params/.

// --- ordinary income -------------------------------------------------------
// brackets: [{ upTo: number|null, rate: number }, ...] ascending, last upTo null.
export function bracketTax(taxableIncome, brackets) {
  let tax = 0, lower = 0;
  for (const b of brackets) {
    const upper = b.upTo === null ? Infinity : b.upTo;
    if (taxableIncome <= lower) break;
    const slice = Math.min(taxableIncome, upper) - lower;
    if (slice > 0) tax += slice * b.rate;
    lower = upper;
  }
  return tax;
}

export function marginalRate(taxableIncome, brackets) {
  let lower = 0;
  for (const b of brackets) {
    const upper = b.upTo === null ? Infinity : b.upTo;
    if (taxableIncome <= upper) return b.rate;
    lower = upper;
  }
  return brackets[brackets.length - 1].rate;
}

// How much more ordinary income could be taken before crossing out of a named bracket.
// With no throughRate, the bracket the taxpayer is in now. With one, the top of that rate.
// Measured from where the taxpayer actually stands, which is the question a Roth
// conversion asks: how much can I convert before the next rate starts.
export function roomInBracket(taxableIncome, brackets, throughRate) {
  for (const b of brackets) {
    const upper = b.upTo === null ? Infinity : b.upTo;
    const isTarget = throughRate !== undefined ? b.rate === throughRate : taxableIncome <= upper;
    if (isTarget) return Math.max(0, upper - taxableIncome);
  }
  return 0;
}

// The width of a bracket band itself, which is a different question: how wide is the
// 22 percent band, rather than how much of it is left.
export function bracketWidth(brackets, rate) {
  let lower = 0;
  for (const b of brackets) {
    const upper = b.upTo === null ? Infinity : b.upTo;
    if (b.rate === rate) return upper - lower;
    lower = upper;
  }
  return 0;
}

// --- long term capital gains ----------------------------------------------
// Gains stack on top of ordinary taxable income, so the rate a gain pays depends on
// how much ordinary income sits underneath it. cgBrackets use the same shape, and the
// thresholds are measured in TOTAL taxable income, not gain alone.
export function capitalGainsTax(ordinaryTaxable, gains, cgBrackets) {
  if (gains <= 0) return 0;
  let tax = 0, remaining = gains, floor = ordinaryTaxable;
  let lower = 0;
  for (const b of cgBrackets) {
    const upper = b.upTo === null ? Infinity : b.upTo;
    const bandTop = upper, bandBottom = Math.max(lower, floor);
    if (bandTop > bandBottom && remaining > 0) {
      const slice = Math.min(remaining, bandTop - bandBottom);
      tax += slice * b.rate;
      remaining -= slice;
    }
    lower = upper;
    if (remaining <= 0) break;
  }
  return tax;
}

// --- Social Security benefit taxation (IRC 86) -----------------------------
// Provisional income = AGI excluding benefits + tax-exempt interest + half of benefits.
// Two tiers. The base amounts are NOT indexed, which is why more of every retiree's
// benefit becomes taxable each year. ssParams: { base1, base2 } by filing status.
export function taxableSocialSecurity(benefits, otherAGI, taxExemptInterest, ssParams) {
  if (benefits <= 0) return 0;
  const provisional = otherAGI + taxExemptInterest + benefits / 2;
  const { base1, base2 } = ssParams;
  if (provisional <= base1) return 0;
  if (provisional <= base2) {
    return Math.min(0.5 * (provisional - base1), 0.5 * benefits);
  }
  const tier1 = Math.min(0.5 * (base2 - base1), 0.5 * benefits);
  return Math.min(0.85 * (provisional - base2) + tier1, 0.85 * benefits);
}

// --- net investment income tax --------------------------------------------
export function niit(magi, netInvestmentIncome, threshold, rate) {
  const over = Math.max(0, magi - threshold);
  return Math.min(over, Math.max(0, netInvestmentIncome)) * rate;
}

// --- payroll ---------------------------------------------------------------
export function fica(wages, selfEmployment, p) {
  const oasdiBase = p.wageBase;
  const seNet = selfEmployment * 0.9235;
  const oasdiWages = Math.min(wages, oasdiBase);
  const oasdiSE = Math.min(Math.max(0, oasdiBase - wages), seNet);
  const oasdi = oasdiWages * p.oasdiRateEmployee + oasdiSE * p.oasdiRateSelfEmployed;
  const medicare = wages * p.medicareRateEmployee + seNet * p.medicareRateSelfEmployed;
  const addlBase = Math.max(0, wages + seNet - p.additionalMedicareThreshold);
  return oasdi + medicare + addlBase * p.additionalMedicareRate;
}

// --- deduction --------------------------------------------------------------
export function standardDeduction(filingStatus, agesOver65, blindCount, p) {
  const base = p.standard[filingStatus];
  const extra = p.additionalOver65[filingStatus];
  return base + (agesOver65 + blindCount) * extra;
}

// --- one household year ------------------------------------------------------
// Returns every line, because a projection that cannot show its own tax arithmetic
// is not a plan, it is a number.
export function federalTax(input, params) {
  const {
    filingStatus, wages = 0, selfEmployment = 0, interest = 0, taxExemptInterest = 0,
    ordinaryDividends = 0, qualifiedDividends = 0, capitalGainsLong = 0, capitalGainsShort = 0,
    pensionAndAnnuity = 0, iraDistributions = 0, rothConversion = 0, otherOrdinary = 0,
    socialSecurityBenefits = 0, aboveTheLineDeductions = 0, itemizedDeductions = 0,
    agesOver65 = 0, blindCount = 0
  } = input;

  const nonSSOrdinary = wages + selfEmployment + interest + ordinaryDividends
    + capitalGainsShort + pensionAndAnnuity + iraDistributions + rothConversion + otherOrdinary;
  const otherAGIForSS = nonSSOrdinary + capitalGainsLong - aboveTheLineDeductions;

  const ssTaxable = taxableSocialSecurity(
    socialSecurityBenefits, otherAGIForSS, taxExemptInterest, params.socialSecurityTaxation[filingStatus]);

  const agi = nonSSOrdinary + capitalGainsLong + ssTaxable - aboveTheLineDeductions;
  const deduction = Math.max(
    standardDeduction(filingStatus, agesOver65, blindCount, params.deduction), itemizedDeductions);
  const taxableIncome = Math.max(0, agi - deduction);

  const preferential = Math.max(0, Math.min(capitalGainsLong + qualifiedDividends, taxableIncome));
  const ordinaryTaxable = Math.max(0, taxableIncome - preferential);

  const ordinaryTax = bracketTax(ordinaryTaxable, params.brackets[filingStatus]);
  const cgTax = capitalGainsTax(ordinaryTaxable, preferential, params.capitalGains[filingStatus]);

  const netInvestmentIncome = interest + ordinaryDividends + capitalGainsLong + capitalGainsShort;
  const niitTax = niit(agi, netInvestmentIncome,
    params.niit.threshold[filingStatus], params.niit.rate);

  const payroll = fica(wages, selfEmployment, params.fica);

  const total = ordinaryTax + cgTax + niitTax;
  return {
    agi, deduction, taxableIncome, ordinaryTaxable, preferentialIncome: preferential,
    socialSecurityTaxable: ssTaxable, ordinaryTax, capitalGainsTax: cgTax, niit: niitTax,
    fica: payroll, federalTotal: total,
    marginalOrdinaryRate: marginalRate(ordinaryTaxable, params.brackets[filingStatus]),
    effectiveRate: agi > 0 ? total / agi : 0
  };
}
