// Medicare premiums and the income-related surcharge.
//
// The piece clients never see coming: the surcharge is set from the tax return filed two
// years earlier. A Roth conversion at 63 raises the premium at 65. Any conversion analysis
// that ignores the lookback understates its own cost, so the lookback lives here and the
// Roth module asks for it.
//
// Every figure comes from params/medicare.json with its citation.

export const LOOKBACK_YEARS = 2;

// Which IRMAA tier a MAGI falls in. Tiers are [{ upTo, partB, partD }] ascending,
// last upTo null.
export function tierFor(magi, tiers) {
  for (const t of tiers) {
    if (t.upTo === null || magi <= t.upTo) return t;
  }
  return tiers[tiers.length - 1];
}

// Annual Medicare cost for one person in one year.
// magiByYear: { [year]: modifiedAGI } so the two-year lookback can be read honestly.
export function annualCost(person, year, magiByYear, params, options = {}) {
  const age = year - person.birthYear;
  if (age < params.eligibilityAge) return { total: 0, enrolled: false, age };

  const filingStatus = options.filingStatus ?? 'single';
  const lookbackYear = year - LOOKBACK_YEARS;
  const magi = magiByYear[lookbackYear];
  const known = magi !== undefined;

  const tiers = params.irmaa[filingStatus];
  const tier = known ? tierFor(magi, tiers) : tiers[0];

  const partB = tier.partB * 12;
  const partD = (params.partD.baseBeneficiaryPremium + (tier.partDSurcharge ?? 0)) * 12;
  const supplement = options.supplementMonthly ? options.supplementMonthly * 12 : 0;

  return {
    age, enrolled: true,
    lookbackYear, lookbackMAGI: known ? magi : null,
    lookbackKnown: known,
    irmaaTier: tier.label ?? null,
    partB, partD, supplement,
    total: partB + partD + supplement
  };
}

// What one extra dollar of income two years ago costs in premium today: the cliff.
// IRMAA tiers are cliffs, not phase-ins, so one dollar over a threshold can cost
// hundreds. This returns the cliff a given MAGI is sitting near.
export function irmaaCliff(magi, filingStatus, params) {
  const tiers = params.irmaa[filingStatus];
  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    if (t.upTo === null || magi <= t.upTo) {
      const next = tiers[i + 1];
      if (!next) return { room: Infinity, nextTierCost: 0 };
      const room = t.upTo - magi;
      const stepB = (next.partB - t.partB) * 12;
      const stepD = ((next.partDSurcharge ?? 0) - (t.partDSurcharge ?? 0)) * 12;
      return {
        currentTier: t.label ?? null,
        nextTier: next.label ?? null,
        room,
        nextTierCost: stepB + stepD,
        // What a dollar over the line actually costs, per person
        marginalRateAtCliff: room >= 0 ? (stepB + stepD) : 0
      };
    }
  }
  return { room: Infinity, nextTierCost: 0 };
}
