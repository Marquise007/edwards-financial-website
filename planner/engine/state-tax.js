// State income tax.
//
// A flat effective rate is a placeholder, not a calculation, and a plan that uses one
// should say so. This module takes a real bracket table per state and applies the rules
// that actually differ between states: what is taxable, what is exempt, and what extra
// surcharges apply.
//
// Every state table lives in params/state-tax.json with its own citation.

import { bracketTax, marginalRate } from './tax.js?v=19c30bf6d8';

// A state definition looks like:
// {
//   name, brackets: { single: [...], marriedFilingJointly: [...] },
//   standardDeduction: { single, marriedFilingJointly },
//   exemptionCredit: { single, marriedFilingJointly, perDependent },
//   surcharges: [ { label, rate, threshold } ],
//   treatment: {
//     socialSecurity: 'exempt' | 'federal' | 'partial',
//     pension: 'ordinary' | 'exempt' | { exclusionUpTo },
//     retirementDistributions: 'ordinary' | 'exempt' | { exclusionUpTo },
//     capitalGains: 'ordinary' | { rate },
//     municipalInterest: 'exemptInState' | 'taxable' | 'exempt'
//   }
// }

export function stateTaxableIncome(federal, stateDef, detail) {
  if (!stateDef) return 0;
  const t = stateDef.treatment ?? {};
  let income = federal.agi;

  if (t.socialSecurity === 'exempt') income -= federal.socialSecurityTaxable;
  else if (t.socialSecurity === 'partial' && t.socialSecurityTaxableShare !== undefined) {
    income -= federal.socialSecurityTaxable * (1 - t.socialSecurityTaxableShare);
  }

  const pension = detail?.pensionAndAnnuity ?? 0;
  if (t.pension === 'exempt') income -= pension;
  else if (t.pension && t.pension.exclusionUpTo !== undefined) {
    income -= Math.min(pension, t.pension.exclusionUpTo);
  }

  const distributions = detail?.retirementDistributions ?? 0;
  if (t.retirementDistributions === 'exempt') income -= distributions;
  else if (t.retirementDistributions && t.retirementDistributions.exclusionUpTo !== undefined) {
    income -= Math.min(distributions, t.retirementDistributions.exclusionUpTo);
  }

  // Interest on this state's own municipal bonds is usually exempt here as well as federally;
  // out-of-state municipal interest is usually added back, having been exempt federally.
  if (t.municipalInterest === 'exemptInState') {
    income += (detail?.outOfStateMunicipalInterest ?? 0);
  } else if (t.municipalInterest === 'taxable') {
    income += (detail?.taxExemptInterest ?? 0);
  }

  return Math.max(0, income);
}

export function stateTax(federal, filingStatus, stateDef, detail = {}) {
  // A state with no table is not a state with no tax. Returning zero here would quietly
  // understate every projection for that state, so it reports the gap instead.
  if (!stateDef) {
    return { total: 0, taxableIncome: 0, marginalRate: 0, unknown: true,
      note: 'No tax table is loaded for this state, so no state tax has been computed. '
          + 'This projection understates the true liability.' };
  }
  if (stateDef.noIncomeTax) {
    return { total: 0, taxableIncome: 0, marginalRate: 0,
      note: stateDef.name + ' has no state income tax' };
  }

  const gross = stateTaxableIncome(federal, stateDef, detail);
  const deduction = stateDef.standardDeduction?.[filingStatus] ?? 0;
  const taxable = Math.max(0, gross - deduction);

  const brackets = stateDef.brackets?.[filingStatus];
  if (!brackets) throw new Error('no ' + filingStatus + ' bracket table for ' + stateDef.name);

  let tax = bracketTax(taxable, brackets);

  // Exemption credits come off the computed tax, not off income, and they phase out.
  let credit = (stateDef.exemptionCredit?.[filingStatus] ?? 0)
    + (stateDef.exemptionCredit?.perDependent ?? 0) * (detail.dependents ?? 0);
  const phase = stateDef.exemptionCredit?.phaseOut2025?.[filingStatus];
  if (phase !== undefined && federal.agi > phase) {
    const step = filingStatus === 'marriedFilingSeparately' ? 1250 : 2500;
    const reductionPerStep = 6;
    const steps = Math.ceil((federal.agi - phase) / step);
    credit = Math.max(0, credit - steps * reductionPerStep);
  }
  tax = Math.max(0, tax - credit);

  const surcharges = [];
  for (const s of stateDef.surcharges ?? []) {
    const over = Math.max(0, taxable - s.threshold);
    if (over > 0) {
      const amount = over * s.rate;
      surcharges.push({ label: s.label, amount });
      tax += amount;
    }
  }

  return {
    total: tax,
    taxableIncome: taxable,
    exemptionCredit: credit,
    marginalRate: marginalRate(taxable, brackets),
    surcharges,
    effectiveRate: federal.agi > 0 ? tax / federal.agi : 0,
    state: stateDef.name
  };
}
