// Estate flow.
//
// What actually reaches the people it was meant for. The flow is arithmetic once the
// projection gives terminal balances, and the arithmetic is worth showing in full because
// the gap between "my estate" and "what my children receive" is where the conversation is.
//
// Exclusion amounts and rates come from params/federal-tax.json and params/state-tax.json,
// each with its citation. Nothing statutory is written here.

export function estateFlow(terminal, params, options = {}) {
  const {
    netWorth = 0,
    lifeInsuranceInEstate = 0,
    lifeInsuranceOutOfEstate = 0,   // an ILIT-held policy, outside the taxable estate
    trustAssets = 0,
    priorTaxableGifts = 0,
    charitableBequests = 0,
    daf = 0,
    state
  } = terminal;

  const fed = params.federal.estate;
  const settlementRate = options.settlementCostRate ?? 0.02;

  const grossEstate = netWorth + lifeInsuranceInEstate;
  const settlementCosts = grossEstate * settlementRate;
  const charitable = charitableBequests + daf;
  const taxableEstate = Math.max(0, grossEstate - settlementCosts - charitable);

  // The exclusion is reduced by lifetime taxable gifts already made.
  const exclusionAvailable = Math.max(0, (fed.basicExclusionAmount ?? 0)
    + (options.portedExclusion ?? 0) - priorTaxableGifts);
  const federalTaxableAmount = Math.max(0, taxableEstate - exclusionAvailable);
  const federalEstateTax = bracket(federalTaxableAmount, fed.rateSchedule ?? [{ upTo: null, rate: fed.topRate }]);

  const stateDef = state ? params.stateTax?.[state] : null;
  let stateEstateTax = 0;
  let stateNote = null;
  if (stateDef?.estate) {
    const stateExclusion = stateDef.estate.exclusionAmount ?? 0;
    const stateTaxable = Math.max(0, taxableEstate - stateExclusion);
    stateEstateTax = bracket(stateTaxable, stateDef.estate.rateSchedule
      ?? [{ upTo: null, rate: stateDef.estate.topRate ?? 0 }]);
  } else if (stateDef) {
    stateNote = stateDef.name + ' imposes no estate or inheritance tax';
  }

  const totalTaxAndFees = settlementCosts + federalEstateTax + stateEstateTax;
  const toHeirs = Math.max(0, grossEstate - totalTaxAndFees - charitable)
    + lifeInsuranceOutOfEstate + trustAssets;

  return {
    grossEstate,
    settlementCosts,
    charitable,
    taxableEstate,
    exclusionAvailable,
    federalTaxableAmount,
    federalEstateTax,
    stateEstateTax,
    stateNote,
    totalTaxAndFees,
    outOfEstate: lifeInsuranceOutOfEstate + trustAssets,
    toHeirs,
    toCharity: charitable,
    // The number that makes the case for planning, stated plainly.
    shareReachingHeirs: grossEstate + lifeInsuranceOutOfEstate + trustAssets > 0
      ? toHeirs / (grossEstate + lifeInsuranceOutOfEstate + trustAssets) : null
  };
}

// Current versus proposed, side by side, with the difference named.
export function compareEstate(currentTerminal, proposedTerminal, params, options) {
  const current = estateFlow(currentTerminal, params, options);
  const proposed = estateFlow(proposedTerminal, params, options);
  return {
    current, proposed,
    difference: {
      toHeirs: proposed.toHeirs - current.toHeirs,
      totalTaxAndFees: proposed.totalTaxAndFees - current.totalTaxAndFees,
      toCharity: proposed.toCharity - current.toCharity
    }
  };
}

// Pull the terminal position straight out of a projection, so the estate view is a
// continuation of the plan rather than a separate set of numbers someone retyped.
export function terminalFromProjection(projection, household, extras = {}) {
  const last = projection.years[projection.years.length - 1];
  return {
    netWorth: last ? last.netWorth : 0,
    state: household.residenceState,
    lifeInsuranceInEstate: extras.lifeInsuranceInEstate ?? 0,
    lifeInsuranceOutOfEstate: extras.lifeInsuranceOutOfEstate ?? 0,
    trustAssets: extras.trustAssets ?? 0,
    priorTaxableGifts: extras.priorTaxableGifts ?? 0,
    charitableBequests: extras.charitableBequests ?? 0,
    daf: extras.daf ?? 0
  };
}

// The six-item readiness checklist, per person. A form, not a calculation, but it belongs
// with the rest so the estate view is complete.
export const CHECKLIST = [
  { key: 'will', label: 'Will' },
  { key: 'powerOfAttorney', label: 'Power of Attorney' },
  { key: 'livingWill', label: 'Living Will' },
  { key: 'healthCareProxy', label: 'Health Care Proxy' },
  { key: 'beneficiaryDesignations', label: 'Beneficiary Designations' },
  { key: 'livingTrust', label: 'Living Trust' }
];

export function checklistStatus(people) {
  return people.map(p => ({
    person: p.id,
    name: p.name,
    items: CHECKLIST.map(c => ({ ...c, complete: !!(p.estate ?? {})[c.key] })),
    completed: CHECKLIST.filter(c => (p.estate ?? {})[c.key]).length,
    total: CHECKLIST.length
  }));
}

function bracket(amount, schedule) {
  let tax = 0, lower = 0;
  for (const b of schedule) {
    const upper = b.upTo === null || b.upTo === undefined ? Infinity : b.upTo;
    if (amount <= lower) break;
    tax += (Math.min(amount, upper) - lower) * b.rate;
    lower = upper;
  }
  return tax;
}
