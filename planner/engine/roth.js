// Roth conversion calibration.
// The chart that sells this is simple: plot taxable income year by year against the
// bracket ceilings, and shade the room left in the bracket. Then show the same line with
// a conversion filling that room. Everything else is bookkeeping.

import { bracketTax, roomInBracket, marginalRate } from './tax.js?v=19c30bf6d8';
import { irmaaCliff, LOOKBACK_YEARS } from './medicare.js?v=19c30bf6d8';

// How much can be converted this year before crossing out of `throughRate`.
export function conversionRoom(taxableIncome, filingStatus, throughRate, params) {
  const brackets = params.federal.brackets[filingStatus];
  return roomInBracket(taxableIncome, brackets, throughRate);
}

// The real cost of converting.
//
// The headline tax is the easy part. Three drags turn a conversion that looks like it
// costs 22 percent into one that costs considerably more, and all three are invisible
// unless the model looks for them:
//
//   1. More of the Social Security benefit becomes taxable, because the conversion raises
//      provisional income. Each extra dollar can pull up to 85 cents of benefit into tax.
//   2. Capital gains get pushed out of the zero rate band into the fifteen.
//   3. Two years later the Medicare premium jumps a tier, for both spouses, for a year.
//
// The third is the one that catches people, because it arrives long after the decision and
// nothing connects it back. opts.medicare and opts.people turn it on.
export function conversionCost(baseTaxInput, amount, params, taxFn, opts = {}) {
  const before = taxFn(baseTaxInput, params.federal);
  const after = taxFn({ ...baseTaxInput, rothConversion: (baseTaxInput.rothConversion ?? 0) + amount },
                      params.federal);

  const federalCost = after.federalTotal - before.federalTotal;
  const result = {
    federalCost,
    marginalRateBefore: before.marginalOrdinaryRate,
    marginalRateAfter: after.marginalOrdinaryRate,
    socialSecurityDragged: after.socialSecurityTaxable - before.socialSecurityTaxable,
    capitalGainsPushed: after.capitalGainsTax - before.capitalGainsTax,
    medicareCost: 0,
    medicare: null
  };

  // The Medicare surcharge two years out. A conversion in the lookback year raises the
  // premium in the year the surcharge lands, once per enrolled person.
  const med = opts.medicare ?? params.medicare;
  if (med && opts.enrolledPeople) {
    const filingStatus = baseTaxInput.filingStatus;
    const cliff = irmaaCliff(before.agi, filingStatus, med);
    if (Number.isFinite(cliff.room) && amount > cliff.room) {
      const perPerson = cliff.nextTierCost;
      result.medicareCost = perPerson * opts.enrolledPeople;
      result.medicare = {
        surchargeYear: (opts.conversionYear ?? new Date().getFullYear()) + LOOKBACK_YEARS,
        roomBeforeCliff: cliff.room,
        amountOverCliff: amount - cliff.room,
        costPerPerson: perPerson,
        people: opts.enrolledPeople,
        currentTier: cliff.currentTier,
        nextTier: cliff.nextTier
      };
    } else if (Number.isFinite(cliff.room)) {
      result.medicare = { roomBeforeCliff: cliff.room, amountOverCliff: 0,
                          costPerPerson: cliff.nextTierCost, people: opts.enrolledPeople,
                          currentTier: cliff.currentTier, nextTier: cliff.nextTier };
    }
  }

  result.totalCost = federalCost + result.medicareCost + (opts.stateCost ?? 0);
  result.effectiveRateOnConversion = amount > 0 ? result.totalCost / amount : 0;
  result.effectiveRateFederalOnly = amount > 0 ? federalCost / amount : 0;
  return result;
}

// The largest conversion that stays under the next Medicare surcharge tier. Often a
// smaller number than the bracket room, and the one that actually binds.
export function roomBeforeMedicareCliff(agi, filingStatus, medicareParams) {
  if (!medicareParams) return Infinity;
  const cliff = irmaaCliff(agi, filingStatus, medicareParams);
  return Number.isFinite(cliff.room) ? Math.max(0, cliff.room) : Infinity;
}

// What a conversion should actually be capped at: the smaller of the bracket room and the
// room before the surcharge, unless the surcharge is worth paying.
export function conversionCeiling(taxableIncome, agi, filingStatus, throughRate, params) {
  const bracket = roomInBracket(taxableIncome, params.federal.brackets[filingStatus], throughRate);
  const medicare = roomBeforeMedicareCliff(agi, filingStatus, params.medicare);
  return {
    bracketRoom: bracket,
    medicareRoom: medicare,
    binding: medicare < bracket ? 'medicare' : 'bracket',
    ceiling: Math.min(bracket, medicare)
  };
}

// The calibration series: one row per projection year, ready to plot.
export function calibrationSeries(projection, filingStatus, params, throughRate) {
  const brackets = params.federal.brackets[filingStatus];
  return projection.years.map(y => {
    const taxable = y.tax.taxableIncome;
    return {
      year: y.year,
      taxableIncome: taxable,
      marginalRate: marginalRate(taxable, brackets),
      roomInBracket: roomInBracket(taxable, brackets, throughRate),
      bracketCeilings: brackets.map(b => ({ rate: b.rate, ceiling: b.upTo }))
    };
  });
}

// A simple fill-the-bracket schedule: convert up to the top of a chosen rate each year,
// between a start year and an end year, never beyond the balance available.
export function fillBracketSchedule(projection, filingStatus, params, opts) {
  const { throughRate, startYear, endYear, availableBalance } = opts;
  let remaining = availableBalance;
  const rows = [];
  for (const y of projection.years) {
    if (y.year < startYear || y.year > endYear || remaining <= 0) continue;
    const room = conversionRoom(y.tax.taxableIncome, filingStatus, throughRate, params);
    const convert = Math.min(room, remaining);
    if (convert <= 0) continue;
    remaining -= convert;
    rows.push({ year: y.year, convert, roomUsed: room, remainingBalance: remaining });
  }
  return { rows, totalConverted: availableBalance - remaining, unconverted: remaining };
}
