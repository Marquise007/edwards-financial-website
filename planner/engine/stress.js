// Stress tests.
//
// Each one takes the plan apart in a single specific way and asks whether it still holds.
// The value is not the probability number, it is the sentence underneath it: "this plan
// survives a decade of bad markets but not your spouse living to 100." That sentence is
// what changes a decision.

import { run as monteCarlo } from './monte-carlo.js?v=29308b88c5';
import { project } from './ledger.js?v=29308b88c5';

export const STRESSES = {
  baseline: {
    label: 'Baseline',
    sentence: 'Everything as planned.',
    apply: (plan, params) => ({ plan, params })
  },
  marketDropNow: {
    label: 'Market drop immediately',
    sentence: 'A severe drawdown in the first year, right as withdrawals begin.',
    apply: (plan, params, o) => {
      const drop = o?.firstYearDrop ?? 0.30;
      const accounts = plan.household.accounts.map(a =>
        a.type === 'bank' ? a : { ...a, balance: a.balance * (1 - drop) });
      return { plan: { ...plan, household: { ...plan.household, accounts } }, params };
    }
  },
  higherTaxes: {
    label: 'Higher taxes',
    sentence: 'Every bracket rate rises.',
    apply: (plan, params, o) => {
      const bump = o?.rateBump ?? 0.03;
      const brackets = {};
      for (const [fs, table] of Object.entries(params.federal.brackets)) {
        // A parameter file carries notes alongside its tables. Only the tables are rates.
        brackets[fs] = Array.isArray(table) ? table.map(b => ({ ...b, rate: b.rate + bump })) : table;
      }
      return { plan, params: { ...params, federal: { ...params.federal, brackets } } };
    }
  },
  lowerSocialSecurity: {
    label: 'Reduced Social Security',
    sentence: 'Benefits are cut across the board.',
    apply: (plan, params, o) => {
      const cut = o?.benefitCut ?? 0.23;
      // The ledger recomputes a benefit from benefitAtFRA whenever that field is present
      // and ignores amount, so cutting amount alone silently did nothing on every plan
      // built the normal way. Both fields are cut.
      const incomes = plan.household.incomes.map(i => {
        if (i.kind !== 'socialSecurity') return i;
        const out = { ...i };
        if (typeof out.amount === 'number') out.amount = out.amount * (1 - cut);
        if (typeof out.benefitAtFRA === 'number') out.benefitAtFRA = out.benefitAtFRA * (1 - cut);
        return out;
      });
      return { plan: { ...plan, household: { ...plan.household, incomes } }, params };
    }
  },
  longevity: {
    label: 'Longevity',
    sentence: 'Everyone lives longer than the plan assumed.',
    apply: (plan, params, o) => {
      const extra = o?.extraYears ?? 5;
      const people = plan.household.people.map(p =>
        ({ ...p, planningHorizonAge: p.planningHorizonAge + extra }));
      return { plan: { ...plan, household: { ...plan.household, people } }, params };
    }
  },
  inflation: {
    label: 'Higher inflation',
    sentence: 'Prices rise faster than assumed, every year, for the whole plan.',
    apply: (plan, params, o) => {
      const bump = o?.inflationBump ?? 0.01;
      const inflation = {};
      for (const [k, v] of Object.entries(params.inflation))
        inflation[k] = typeof v === 'number' ? v + bump : v;
      return { plan, params: { ...params, inflation } };
    }
  },
  healthCare: {
    label: 'Health care shock',
    sentence: 'Medical costs run well above the general assumption.',
    apply: (plan, params, o) => {
      const bump = o?.healthBump ?? 0.03;
      return { plan, params: {
        ...params,
        inflation: { ...params.inflation, health: params.inflation.health + bump }
      } };
    }
  },
  lowerReturns: {
    label: 'Lower returns',
    sentence: 'Every asset class earns less than assumed, permanently.',
    apply: (plan, params, o) => {
      const cut = o?.returnCut ?? 0.01;
      const cm = {};
      for (const [cls, a] of Object.entries(params.capitalMarket)) {
        cm[cls] = (cls.startsWith('_') || typeof a?.total !== 'number')
          ? a : { ...a, total: Math.max(0, a.total - cut) };
      }
      return { plan, params: { ...params, capitalMarket: cm } };
    }
  }
};

// Run every stress and report probability of success alongside the baseline, so the
// chart reads as a set of distances from "everything as planned."
export function runAll(plan, params, options = {}) {
  const runs = options.runs ?? 500;
  const seed = options.seed ?? 20261027;
  // The longevity stress lengthens the plan, so its final year is not the baseline's
  // final year. Comparing raw ending balances across different horizons flatters the
  // stress that adds years. Everything is therefore also reported at the baseline's
  // last year, which is the only apples-to-apples figure.
  const baselineRun = project(plan, params);
  const commonYear = baselineRun.years[baselineRun.years.length - 1].year;

  const rows = [];
  for (const [key, s] of Object.entries(STRESSES)) {
    const { plan: p2, params: pr2 } = s.apply(plan, params, options);
    const mc = monteCarlo(p2, pr2, { runs, seed });
    const det = project(p2, pr2);
    const atCommon = det.years.find(y => y.year === commonYear);
    rows.push({
      key, label: s.label, sentence: s.sentence,
      probabilityOfSuccess: mc.probabilityOfSuccess,
      endingInvestedAssets: det.endingInvestedAssets,
      assetsAtCommonYear: atCommon ? atCommon.investedAssets : null,
      commonYear,
      deterministicHolds: det.succeeded,
      firstShortfallYear: det.firstShortfallYear
    });
  }
  const base = rows.find(r => r.key === 'baseline');
  for (const r of rows) {
    r.changeFromBaseline = r.probabilityOfSuccess - base.probabilityOfSuccess;
    r.assetChangeFromBaseline = r.assetsAtCommonYear !== null && base.assetsAtCommonYear !== null
      ? r.assetsAtCommonYear - base.assetsAtCommonYear : null;
  }
  return rows;
}
