// Defined benefit pensions.
//
// This is the part of a plan that most national software treats as a single number the
// client types in, and it is the part that decides the whole retirement for a teacher, a
// firefighter or a county employee. Getting it right is the practice's strongest ground,
// so it gets a real model rather than a text box.
//
// Everything system-specific lives in params/pension-systems.json, built from each
// system's own plan documents and actuarial valuations. Nothing here hard-codes a factor.

// Benefit = age factor x service credit x final compensation, which is the shape nearly
// every California public system uses, with the pieces defined differently by tier.
export function definedBenefit(member, system, opts = {}) {
  const tier = system.tiers.find(t => t.key === member.tier);
  if (!tier) throw new Error('unknown tier ' + member.tier + ' for ' + system.name);

  const serviceCredit = member.serviceCredit;
  const baseFactor = factorAtAge(member.retirementAge, member.retirementAgeMonths ?? 0, tier, opts);
  const finalComp = finalCompensation(member, tier);

  // The career factor is added to the age factor and the SUM is capped, which is why it
  // stops being worth anything once the base factor alone reaches the ceiling.
  let factor = baseFactor;
  let careerFactorApplied = 0;
  if (tier.careerFactor && serviceCredit >= tier.careerFactor.minimumService) {
    const uncapped = baseFactor + tier.careerFactor.addedFactor;
    const capped = tier.careerFactor.cap !== undefined
      ? Math.min(uncapped, tier.careerFactor.cap) : uncapped;
    careerFactorApplied = capped - baseFactor;
    factor = capped;
  }

  let annual = factor * serviceCredit * finalComp;

  let longevityBonus = 0;
  if (tier.longevityBonus) {
    const bonus = tier.longevityBonus.find(b => serviceCredit >= b.minimumService);
    if (bonus) {
      longevityBonus = bonus.annualAmount ?? (bonus.monthlyAmount ?? 0) * 12;
      annual += longevityBonus;
    }
  }

  return {
    annual, monthly: annual / 12,
    ageFactor: factor, baseAgeFactor: baseFactor, careerFactorApplied, longevityBonus,
    serviceCredit, finalCompensation: finalComp,
    replacementRatio: finalComp > 0 ? annual / finalComp : 0,
    tier: tier.key, tierLabel: tier.label,
    system: system.name,
    // What this is: the member's own unreduced benefit. Electing a beneficiary option
    // reduces it, and the factor that does so is not published.
    basis: 'member only, unreduced'
  };
}

// Age factors come two ways. CalSTRS publishes a month-level grid, so a member retiring
// at 61 and 9 months gets a different factor from one retiring at 61 and 3 months, and the
// right answer is a lookup rather than an interpolation. CalPERS publishes exact-year
// values. Both are read from the table; nothing is invented between published rows.
function factorAtAge(age, monthsBeyond, tier, opts = {}) {
  if (tier.ageFactorsByMonth) {
    const table = tier.ageFactorsByMonth;
    const ages = Object.keys(table).map(Number).sort((a, b) => a - b);
    const lowest = ages[0], highest = ages[ages.length - 1];
    if (age < lowest) {
      throw new Error('age ' + age + ' is below the earliest published factor for ' + tier.label
        + ' (' + lowest + '). This tier has no factor at that age.');
    }
    const row = table[String(Math.min(age, highest))];
    const m = Math.max(0, Math.min(11, Math.floor(monthsBeyond)));
    return row[age >= highest ? 0 : m];
  }

  const table = tier.ageFactors;
  if (!table) throw new Error('no age factor table for ' + (tier.label ?? tier.key));
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (age <= keys[0]) return table[String(keys[0])];
  if (age >= keys[keys.length - 1]) return table[String(keys[keys.length - 1])];
  if (opts.interpolate === false) {
    let best = keys[0];
    for (const k of keys) if (k <= age) best = k;
    return table[String(best)];
  }
  let lo = keys[0], hi = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (keys[i] <= age && age <= keys[i + 1]) { lo = keys[i]; hi = keys[i + 1]; break; }
  }
  const span = hi - lo;
  if (!span) return table[String(lo)];
  const w = (age - lo) / span;
  return table[String(lo)] * (1 - w) + table[String(hi)] * w;
}

// Final compensation is where the tiers really differ: a highest single year for older
// members, an average of the highest consecutive years for newer ones.
function finalCompensation(member, tier) {
  if (member.finalCompensationOverride !== undefined) return member.finalCompensationOverride;
  const years = tier.finalCompensationYears;
  const salaries = (member.salaryHistory ?? []).slice().sort((a, b) => b - a);
  if (!salaries.length) throw new Error('no salary history and no override for the member');
  const take = salaries.slice(0, years);
  return take.reduce((s, v) => s + v, 0) / take.length;
}

// Post-retirement increases. Simple or compounding, capped or not, and whether a
// purchasing power floor applies. All three shapes appear among California systems.
export function benefitInYear(baseAnnual, yearsRetired, tier, cpiPath) {
  const a = tier.postRetirementAdjustment;
  if (!a) return baseAnnual;
  // Simple: a fixed percentage of the INITIAL benefit every year, so the increase never
  // grows. Over thirty years that is a very different number from a compounding one, and
  // it is the difference between the two California systems.
  if (a.type === 'simple') return baseAnnual * (1 + a.rate * yearsRetired);
  if (a.type === 'compound') {
    let amount = baseAnnual;
    for (let i = 0; i < yearsRetired; i++) {
      const cpi = cpiPath ? cpiPath[i] : a.rate;
      amount *= 1 + Math.min(a.cap ?? Infinity, cpi);
    }
    return amount;
  }
  return baseAnnual;
}

// What the two adjustment shapes actually cost a retiree over a long retirement.
export function adjustmentComparison(baseAnnual, years, rate = 0.02) {
  const simple = baseAnnual * (1 + rate * years);
  const compound = baseAnnual * Math.pow(1 + rate, years);
  return { simple, compound, difference: compound - simple, years, rate };
}

// Survivor options, named the way each system names them, so what comes out matches the
// member's own paperwork rather than a generic label.
//
// The reduction factor depends on the ages of the member and the beneficiary and neither
// CalSTRS nor CalPERS publishes the table. So this returns the option and refuses the
// number, rather than producing an estimate a client would read as a figure. A plan that
// invents a pension amount is worse than one that says it does not have it.
export function survivorOption(baseAnnual, optionKey, system, member) {
  const opt = (system.survivorOptions ?? []).find(o => o.key === optionKey);
  if (!opt) throw new Error('unknown survivor option ' + optionKey + ' for ' + system.name);

  const reduction = typeof opt.reduction === 'function' ? opt.reduction(member) : opt.reduction;

  if (reduction === null || reduction === undefined) {
    return {
      option: opt.label,
      survivorShare: opt.survivorShare,
      memberAnnual: null,
      survivorAnnual: null,
      unavailable: true,
      reason: (system._optionFactorsNotPublished?.problem
        ?? 'The option factor for this election is not published.')
        + ' This engine does not estimate it. '
        + (system._optionFactorsNotPublished?.resolution ?? ''),
      memberOnlyAnnual: baseAnnual
    };
  }

  return {
    option: opt.label,
    memberAnnual: baseAnnual * (1 - reduction),
    survivorAnnual: baseAnnual * (1 - reduction) * opt.survivorShare,
    survivorShare: opt.survivorShare
  };
}

// The gap. The single most useful number in the practice: what the pension actually
// replaces against what the household actually spends.
export function pensionGap({ pensionAnnual, socialSecurityAnnual = 0, otherGuaranteedAnnual = 0,
                             requiredAnnualIncome }) {
  const guaranteed = pensionAnnual + socialSecurityAnnual + otherGuaranteedAnnual;
  const gap = requiredAnnualIncome - guaranteed;
  return {
    guaranteed,
    requiredAnnualIncome,
    gap: Math.max(0, gap),
    surplus: Math.max(0, -gap),
    coverageRatio: requiredAnnualIncome > 0 ? guaranteed / requiredAnnualIncome : null
  };
}
