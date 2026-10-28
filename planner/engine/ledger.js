// The ledger engine.
// One pass per calendar year, from the base year to the end of the longest plan.
// Every dollar that moves is written down, because the cash flow waterfall, the income
// stack, the tax chart and the net worth line are all just views of this record.

import { isActive, triggerYear } from './triggers.js?v=19c30bf6d8';
import { inflate } from './inflation.js?v=19c30bf6d8';
import { blendReturn, growAccount, withdraw, rmd, taxClassOf } from './accounts.js?v=19c30bf6d8';
import { federalTax } from './tax.js?v=19c30bf6d8';
import { stateTax as computeStateTax } from './state-tax.js?v=19c30bf6d8';
import { annualCost as medicareCost } from './medicare.js?v=19c30bf6d8';
import { STRATEGIES as SPENDING } from './spending.js?v=19c30bf6d8';
import { claimFactor, fraMonths, earningsTestWithholding } from './social-security.js?v=19c30bf6d8';

// project(plan, params)                      one set of assumptions for the whole run
// project(plan, params, paramsForYearIndex)   a different set each year, which is how a
//                                             deterministic scenario path is applied
export function project(plan, params, paramsForYearIndex) {
  const { household, settings } = plan;
  const baseYear = household.asOfYear;

  const people = {};
  for (const p of household.people) {
    people[p.id] = {
      birthYear: p.birthYear,
      retirementAge: p.retirementAge,
      horizonAge: p.planningHorizonAge
    };
  }
  const ctx = { baseYear, people };

  const lastYear = Math.max(...household.people.map(p => p.birthYear + p.planningHorizonAge));
  const accounts = household.accounts.map(a => ({ ...a }));
  const rates = params.inflation;

  const years = [];
  const magiByYear = {};
  let priorSpendingFactor = 1;
  let lastInvestedAssets = household.accounts.reduce((t, a) => t + (a.excludeFromInvested ? 0 : a.balance), 0);
  let lastPlannedRetirementSpending = 0;
  let priorYearEnd = {};
  for (const a of accounts) priorYearEnd[a.id] = a.balance;

  for (let year = baseYear; year <= lastYear; year++) {
    const yearIndex = year - baseYear;
    const yp = paramsForYearIndex ? paramsForYearIndex(yearIndex) : params;
    const row = { year, ages: {}, inflows: {}, outflows: {}, goals: {}, savings: {}, lines: [] };
    const alive = [];
    for (const p of household.people) {
      const age = year - p.birthYear;
      row.ages[p.id] = age;
      if (age <= p.planningHorizonAge) alive.push(p);
    }
    if (!alive.length) break;

    // ---- 1. inflows ------------------------------------------------------
    let wages = 0, selfEmployment = 0, pensionAndAnnuity = 0, ssBenefits = 0, otherOrdinary = 0;
    for (const inc of household.incomes) {
      if (!isActive(inc, year, ctx)) continue;
      const stated = inc.statedYear ?? baseYear;
      const amount = inflate(inc.amount, inc.inflationIndex ?? 'general', stated, year, rates);
      row.inflows[inc.id] = { name: inc.name, kind: inc.kind, amount };
      switch (inc.kind) {
        case 'salary': wages += amount; break;
        case 'selfEmployment': selfEmployment += amount; break;
        case 'pension': case 'annuity': pensionAndAnnuity += amount; break;
        case 'socialSecurity': ssBenefits += amount; break;
        default: otherOrdinary += amount;
      }
    }

    // Social Security figured from the statement amount and the claiming age, rather than
    // taken on trust. An income record carrying benefitAtFRA is recomputed here; one that
    // only carries a flat amount is left as stated, so an existing plan still runs.
    if (yp.socialSecurity) {
      ssBenefits = 0;
      for (const inc of household.incomes) {
        if (inc.kind !== 'socialSecurity' || !isActive(inc, year, ctx)) continue;
        const person = household.people.find(pp => pp.id === inc.owner);
        const stated = inc.statedYear ?? baseYear;
        let amount;
        if (inc.benefitAtFRA !== undefined && person) {
          const claimAgeMonths = claimAgeMonthsFor(inc, person, ctx);
          const factor = claimFactor(person.birthYear, claimAgeMonths, yp.socialSecurity);
          amount = inflate(inc.benefitAtFRA * factor, inc.inflationIndex ?? 'socialSecurity',
                           stated, year, rates);
          row.inflows[inc.id] = { name: inc.name, kind: 'socialSecurity', amount,
            claimAge: +(claimAgeMonths / 12).toFixed(2), claimFactor: factor };
        } else {
          amount = row.inflows[inc.id] ? row.inflows[inc.id].amount : 0;
        }
        // The earnings test: benefits withheld while still working before full retirement
        // age. The money is not lost, it comes back through a recomputation at full
        // retirement age, and the plan should say so rather than quietly dropping it.
        if (person && wages > 0) {
          const claimAgeMonths = claimAgeMonthsFor(inc, person, ctx);
          const withheld = earningsTestWithholding(wages, claimAgeMonths, person.birthYear,
                                                   year, yp.socialSecurity);
          const applied = Math.min(withheld, amount);
          if (applied > 0) {
            amount -= applied;
            row.earningsTestWithheld = (row.earningsTestWithheld ?? 0) + applied;
            if (row.inflows[inc.id]) {
              row.inflows[inc.id].amount = amount;
              row.inflows[inc.id].earningsTestWithheld = applied;
            }
          }
        }
        ssBenefits += amount;
      }
    }

    // ---- 2. outflows -----------------------------------------------------
    // The retirement spending strategy scales anything flagged as retirement spending.
    // Inflation adjusted is the honest default; the others are the published alternatives
    // and each one says plainly what it assumes about how people behave.
    const strategyKey = settings.spendingStrategy ?? 'inflationAdjusted';
    const strategy = SPENDING[strategyKey];
    if (!strategy) throw new Error('unknown spending strategy: ' + strategyKey);
    const retireYear = triggerYear({ type: 'firstRetirement' }, ctx);
    const yearsRetired = retireYear === null ? 0 : Math.max(0, year - retireYear);
    const spendState = strategy.needsState
      ? { investedAssets: lastInvestedAssets, plannedSpending: lastPlannedRetirementSpending,
          priorFactor: priorSpendingFactor }
      : {};
    const spendingFactor = (retireYear !== null && year >= retireYear)
      ? strategy.rate(yearsRetired, settings.spendingOptions ?? {}, spendState)
      : 1;
    priorSpendingFactor = spendingFactor;
    row.spendingStrategy = { key: strategyKey, label: strategy.label, factor: spendingFactor };

    let expenseTotal = 0;
    let retirementSpending = 0;
    for (const e of household.expenses) {
      if (!isActive(e, year, ctx)) continue;
      const stated = e.statedYear ?? baseYear;
      const base = inflate(e.amount, e.inflationIndex ?? 'general', stated, year, rates);
      const amount = e.retirementSpending ? base * spendingFactor : base;
      row.outflows[e.id] = { name: e.name, category: e.category ?? 'living', amount,
        spendingFactor: e.retirementSpending ? spendingFactor : undefined };
      expenseTotal += amount;
      if (e.retirementSpending) retirementSpending += amount;
    }
    let goalTotal = 0;
    for (const g of household.goals ?? []) {
      if (!isActive(g, year, ctx)) continue;
      const stated = g.statedYear ?? baseYear;
      const amount = inflate(g.amount, g.inflationIndex ?? 'general', stated, year, rates);
      row.goals[g.id] = { name: g.name, kind: g.kind, amount };
      goalTotal += amount;
    }

    // ---- 3. planned saving ----------------------------------------------
    let savingTotal = 0;
    const contributions = {};
    for (const s of household.savings ?? []) {
      if (!isActive(s, year, ctx)) continue;
      const stated = s.statedYear ?? baseYear;
      const amount = s.kind === 'percentOfPay'
        ? wages * s.amount
        : inflate(s.amount, s.inflationIndex ?? 'general', stated, year, rates);
      const match = s.employerMatch ? wages * s.employerMatch : 0;
      contributions[s.accountId] = (contributions[s.accountId] ?? 0) + amount + match;
      row.savings[s.id] = { name: s.name, accountId: s.accountId, amount, employerMatch: match };
      savingTotal += amount;
    }

    // ---- 4. required distributions --------------------------------------
    let rmdTotal = 0;
    for (const p of alive) {
      const age = year - p.birthYear;
      const beginAge = rmdBeginAge(p.birthYear, yp.rmd);
      const owned = accounts.filter(a => a.owner === p.id && taxClassOf(a.type) === 'deferred'
        && !a.rmdExempt);
      for (const a of owned) {
        const amount = rmd(priorYearEnd[a.id] ?? a.balance, age, beginAge, yp.rmd.uniformLifetime);
        if (amount > 0) {
          const got = Math.min(a.balance, amount);
          a.balance -= got;
          rmdTotal += got;
        }
      }
    }
    row.requiredDistributions = rmdTotal;

    // ---- 5. growth, and the taxable events it throws off -----------------
    const weights = settings.allocation;
    const ret = blendReturn(weights, yp.capitalMarket);
    const investmentTax = { interest: 0, qualifiedDividends: 0, ordinaryDividends: 0, longTermGains: 0 };
    let feeTotal = 0;
    for (const a of accounts) {
      if (a.noGrowth) continue;
      const w = a.allocation ?? weights;
      const r = a.allocation ? blendReturn(w, yp.capitalMarket) : ret;
      const g = growAccount(a, r, settings);
      a.balance = g.endBalance;
      feeTotal += g.fee;
      for (const k of Object.keys(investmentTax)) investmentTax[k] += g.taxable[k];
    }
    for (const [acctId, amount] of Object.entries(contributions)) {
      const a = accounts.find(x => x.id === acctId);
      if (a) { a.balance += amount; if (a.basis !== undefined) a.basis += amount; }
    }

    // ---- 6. tax, then the gap, then withdrawals --------------------------
    const agesOver65 = alive.filter(p => (year - p.birthYear) >= 65).length;
    const taxInput = {
      filingStatus: filingStatusFor(alive, household),
      wages, selfEmployment,
      interest: investmentTax.interest,
      ordinaryDividends: investmentTax.ordinaryDividends,
      qualifiedDividends: investmentTax.qualifiedDividends,
      capitalGainsLong: investmentTax.longTermGains,
      pensionAndAnnuity,
      iraDistributions: rmdTotal,
      otherOrdinary,
      socialSecurityBenefits: ssBenefits,
      agesOver65
    };
    let tax = federalTax(taxInput, yp.federal);
    let stateDetail = {
      pensionAndAnnuity, retirementDistributions: rmdTotal,
      taxExemptInterest: 0, outOfStateMunicipalInterest: 0,
      dependents: household.dependents ?? 0
    };
    let stateResult = computeStateTax(tax, taxInput.filingStatus,
      yp.stateTax?.[household.residenceState], stateDetail);
    let stateTax = stateResult.total;

    // Medicare, if the plan is carrying it. The premium is set by the return filed two
    // years ago, which is why magiByYear is kept rather than recomputed.
    let medicareTotal = 0;
    if (settings.includeMedicare && yp.medicare) {
      for (const p of alive) {
        const m = medicareCost(p, year, magiByYear, yp.medicare, {
          filingStatus: taxInput.filingStatus,
          supplementMonthly: settings.medicareSupplementMonthly
        });
        if (m.enrolled) {
          row.outflows['__medicare_' + p.id] = {
            name: 'Medicare, ' + (p.name ?? p.id), category: 'health', amount: m.total,
            irmaaTier: m.irmaaTier, lookbackYear: m.lookbackYear
          };
          medicareTotal += m.total;
        }
      }
    }
    row.medicare = medicareTotal;

    const spendingNeed = expenseTotal + medicareTotal + goalTotal + savingTotal
      + tax.federalTotal + tax.fica + stateTax;
    const cashIn = wages + selfEmployment + pensionAndAnnuity + ssBenefits + otherOrdinary + rmdTotal;
    let gap = spendingNeed - cashIn;

    let withdrawal = { taken: { taxable: 0, nonqualified: 0, deferred: 0, free: 0 },
                       taxEvents: { ordinary: 0, longTermGains: 0 }, shortfall: 0 };
    if (gap > 0) {
      withdrawal = withdraw(accounts, gap, settings.withdrawalSequence, ctx);
      // A withdrawal creates its own tax, so settle once more rather than pretending it does not.
      if (withdrawal.taxEvents.ordinary > 0 || withdrawal.taxEvents.longTermGains > 0) {
        taxInput.iraDistributions += withdrawal.taxEvents.ordinary;
        taxInput.capitalGainsLong += withdrawal.taxEvents.longTermGains;
        const tax2 = federalTax(taxInput, yp.federal);
        stateDetail = { ...stateDetail, retirementDistributions: taxInput.iraDistributions };
        stateResult = computeStateTax(tax2, taxInput.filingStatus,
          yp.stateTax?.[household.residenceState], stateDetail);
        const state2 = stateResult.total;
        const extra = (tax2.federalTotal - tax.federalTotal) + (state2 - stateTax);
        tax = tax2; stateTax = state2;
        if (extra > 0) {
          const more = withdraw(accounts, extra, settings.withdrawalSequence, ctx);
          for (const k of Object.keys(withdrawal.taken)) withdrawal.taken[k] += more.taken[k];
          withdrawal.shortfall += more.shortfall;
          gap += extra;
        }
      }
    } else if (gap < 0) {
      // Surplus goes to the first taxable account, or a named sweep account.
      const sweep = accounts.find(a => a.id === settings.sweepAccountId)
        ?? accounts.find(a => taxClassOf(a.type) === 'taxable');
      if (sweep) { sweep.balance += -gap; if (sweep.basis !== undefined) sweep.basis += -gap; }
      row.surplusSwept = -gap;
    }

    // ---- 7. record -------------------------------------------------------
    row.totals = {
      income: cashIn,
      expenses: expenseTotal + medicareTotal,
      goals: goalTotal,
      savings: savingTotal,
      federalTax: tax.federalTotal,
      fica: tax.fica,
      stateTax,
      stateMarginalRate: stateResult.marginalRate,
      fees: feeTotal,
      withdrawals: Object.values(withdrawal.taken).reduce((a, b) => a + b, 0),
      shortfall: withdrawal.shortfall,
      netCashFlow: cashIn - spendingNeed
    };
    row.tax = tax;
    // Medicare MAGI is AGI plus tax-exempt interest. Recorded for the two-year lookback.
    magiByYear[year] = tax.agi;
    row.balances = Object.fromEntries(accounts.map(a => [a.id, a.balance]));
    row.investedAssets = accounts
      .filter(a => !a.excludeFromInvested)
      .reduce((s, a) => s + a.balance, 0);
    row.netWorth = row.investedAssets
      + (household.property ?? []).reduce((s, p) => s + p.value, 0)
      - (household.liabilities ?? []).reduce((s, l) => s + l.balance, 0);
    years.push(row);

    lastInvestedAssets = row.investedAssets;
    lastPlannedRetirementSpending = retirementSpending || lastPlannedRetirementSpending;
    priorYearEnd = Object.fromEntries(accounts.map(a => [a.id, a.balance]));
  }

  // A shortfall test is a comparison, and every comparison against NaN is false, so a
  // projection that went non-finite used to sail through as a success. Anything that is
  // not a real number is a failure of the projection, and it is reported as one.
  const failedAt = years.find(y =>
    y.totals.shortfall > 0.5 ||
    !Number.isFinite(y.investedAssets) ||
    !Number.isFinite(y.totals.shortfall));
  return {
    years,
    succeeded: !failedAt,
    firstShortfallYear: failedAt ? failedAt.year : null,
    endingInvestedAssets: years.length ? years[years.length - 1].investedAssets : 0
  };
}

// The claiming age an income record implies: its own claimAgeMonths if given, otherwise
// the age its start trigger resolves to.
function claimAgeMonthsFor(inc, person, ctx) {
  if (inc.claimAgeMonths !== undefined) return inc.claimAgeMonths;
  if (inc.start?.type === 'age') return inc.start.value * 12;
  const y = triggerYear(inc.start ?? { type: 'immediate' }, ctx);
  if (y === null) return 67 * 12;
  return Math.max(0, (y - person.birthYear) * 12);
}

export function rmdBeginAge(birthYear, p) {
  for (const rule of p.beginAge) {
    if (birthYear <= rule.birthYearThrough) return rule.age;
  }
  return p.beginAge[p.beginAge.length - 1].age;
}

function filingStatusFor(alive, household) {
  if (household.filingStatus) {
    if (alive.length === 1 && household.filingStatus === 'marriedFilingJointly') return 'single';
    return household.filingStatus;
  }
  return alive.length > 1 ? 'marriedFilingJointly' : 'single';
}

