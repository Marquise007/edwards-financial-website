// Social Security rules engine.
// Every rule below is driven by params/social-security.json, which carries its own
// citations. Nothing statutory is hard-coded in this file, because the numbers change
// and a number without a source has no business in a plan.

// Full retirement age in months, from the birth-year table.
export function fraMonths(birthYear, p) {
  for (const row of p.fullRetirementAge) {
    if (birthYear <= row.birthYearThrough) return row.months;
  }
  return p.fullRetirementAge[p.fullRetirementAge.length - 1].months;
}

// The benefit at a given claiming age, as a multiple of PIA.
// Early: reduced by a fraction per month, at one rate for the first 36 months before FRA
// and a lower rate beyond that. Late: increased by the delayed retirement credit per month,
// stopping at age 70.
export function claimFactor(birthYear, claimAgeMonths, p) {
  const fra = fraMonths(birthYear, p);
  const maxMonths = p.delayedCreditStopsAgeMonths;
  const capped = Math.min(claimAgeMonths, maxMonths);

  if (capped < fra) {
    const early = fra - capped;
    const first = Math.min(early, p.earlyReduction.firstMonthsCount);
    const beyond = Math.max(0, early - p.earlyReduction.firstMonthsCount);
    return 1 - first * p.earlyReduction.firstMonthsRate - beyond * p.earlyReduction.laterMonthsRate;
  }
  const late = capped - fra;
  const rate = delayedCreditRate(birthYear, p) / 12;
  return 1 + late * rate;
}

export function delayedCreditRate(birthYear, p) {
  for (const row of p.delayedRetirementCredit) {
    if (birthYear <= row.birthYearThrough) return row.annualRate;
  }
  return p.delayedRetirementCredit[p.delayedRetirementCredit.length - 1].annualRate;
}

// PIA from AIME through the bend points. The 90/32/15 shape has not changed since 1979;
// the bend points move with the average wage index each year.
export function pia(aime, bendPoints, factors) {
  let remaining = aime, benefit = 0, lower = 0;
  for (let i = 0; i < factors.length; i++) {
    const upper = bendPoints[i] ?? Infinity;
    const slice = Math.max(0, Math.min(remaining, upper - lower));
    benefit += slice * factors[i];
    remaining -= slice;
    lower = upper;
    if (remaining <= 0) break;
  }
  return benefit;
}

// Spousal benefit: tops the lower earner up toward a share of the higher earner's PIA.
// The top-up is reduced for claiming before the spouse's own FRA, and delayed credits
// never apply to it, which is why "wait until 70 on a spousal benefit" is always wrong.
export function spousalBenefit(ownPIA, workerPIA, claimAgeMonths, birthYear, p) {
  const fra = fraMonths(birthYear, p);
  const full = workerPIA * p.spousal.shareOfWorkerPIA;
  const excess = Math.max(0, full - ownPIA);
  if (claimAgeMonths >= fra) return excess;
  const early = fra - claimAgeMonths;
  const first = Math.min(early, p.spousal.earlyReduction.firstMonthsCount);
  const beyond = Math.max(0, early - p.spousal.earlyReduction.firstMonthsCount);
  const factor = 1 - first * p.spousal.earlyReduction.firstMonthsRate
                   - beyond * p.spousal.earlyReduction.laterMonthsRate;
  return excess * Math.max(0, factor);
}

// Survivor benefit: the survivor steps up to the deceased worker's benefit, reduced if
// the survivor claims before their own survivor FRA, and capped by what the worker was
// actually receiving.
export function survivorBenefit(deceasedBenefit, deceasedPIA, survivorClaimAgeMonths, survivorBirthYear, p) {
  const fra = fraMonths(survivorBirthYear, p);
  const base = Math.min(Math.max(deceasedBenefit, deceasedPIA * p.survivor.floorShareOfPIA), deceasedBenefit || Infinity);
  if (survivorClaimAgeMonths >= fra) return base;
  const span = fra - p.survivor.earliestAgeMonths;
  const monthsEarly = fra - Math.max(survivorClaimAgeMonths, p.survivor.earliestAgeMonths);
  const reduction = (monthsEarly / span) * (1 - p.survivor.minimumShareAtEarliest);
  return base * (1 - reduction);
}

// Retirement earnings test: benefits withheld while still working before FRA.
// The withheld amount is not lost, it is restored through a recomputation at FRA, which
// is the part almost nobody is told.
export function earningsTestWithholding(earnings, claimAgeMonths, birthYear, year, p) {
  const fra = fraMonths(birthYear, p);
  if (claimAgeMonths >= fra) return 0;
  const reachesFRAThisYear = Math.floor(claimAgeMonths / 12) === Math.floor(fra / 12);
  const limit = reachesFRAThisYear ? p.earningsTest.yearOfFRAExempt : p.earningsTest.underFRAExempt;
  const ratio = reachesFRAThisYear ? p.earningsTest.yearOfFRAWithholdRatio : p.earningsTest.underFRAWithholdRatio;
  return Math.max(0, earnings - limit) * ratio;
}

// Exhaustive claiming search. Two people, monthly granularity from 62 to 70, is under
// 10,000 combinations. The "hundreds of strategies" framing elsewhere is a small grid
// search wearing a suit.
export function optimize(household, p, score) {
  const [a, b] = household.people;
  const lo = p.earliestClaimAgeMonths, hi = p.delayedCreditStopsAgeMonths;
  let best = null;
  for (let am = lo; am <= hi; am++) {
    for (let bm = b ? lo : hi; bm <= hi; bm += b ? 1 : hi) {
      const candidate = { [a.id]: am, [b ? b.id : a.id]: bm };
      const value = score(candidate);
      if (!best || value > best.value) best = { claimAges: candidate, value };
      if (!b) break;
    }
  }
  return best;
}
