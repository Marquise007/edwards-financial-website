// A two-person household used to exercise the engine. Invented, not a client.
export const SAMPLE = {
  household: {
    asOfYear: 2026,
    filingStatus: 'marriedFilingJointly',
    residenceState: 'CA',
    people: [
      { id: 'a', name: 'A', birthYear: 1962, retirementAge: 67, planningHorizonAge: 92 },
      { id: 'b', name: 'B', birthYear: 1964, retirementAge: 67, planningHorizonAge: 94 }
    ],
    accounts: [
      { id: 'brk', name: "A's brokerage", owner: 'a', type: 'taxable', balance: 450000, basis: 300000 },
      { id: 'ira', name: "A's IRA", owner: 'a', type: 'traditionalIRA', balance: 900000 },
      { id: 'k',   name: "B's 401(k)", owner: 'b', type: 'traditional401k', balance: 600000 },
      { id: 'rth', name: "A's Roth", owner: 'a', type: 'rothIRA', balance: 150000 },
      { id: 'bank', name: 'Checking', owner: 'a', type: 'bank', balance: 40000, basis: 40000,
        excludeFromInvested: true }
    ],
    property: [ { id: 'home', value: 750000 } ],
    liabilities: [ { id: 'mtg', balance: 180000 } ],
    incomes: [
      { id: 'sal_a', name: "A's salary", owner: 'a', kind: 'salary', amount: 140000,
        inflationIndex: 'general', end: { type: 'retirement', person: 'a' } },
      { id: 'sal_b', name: "B's salary", owner: 'b', kind: 'salary', amount: 95000,
        inflationIndex: 'general', end: { type: 'retirement', person: 'b' } },
      // benefitAtFRA is what the Social Security statement shows. amount is what the plan
      // currently assumes, which is that figure adjusted for the claiming age below.
      { id: 'ss_a', name: "A's Social Security", owner: 'a', kind: 'socialSecurity',
        benefitAtFRA: 42000, amount: 42000 * 1.24,
        inflationIndex: 'socialSecurity', start: { type: 'age', person: 'a', value: 70 } },
      { id: 'ss_b', name: "B's Social Security", owner: 'b', kind: 'socialSecurity',
        benefitAtFRA: 28000, amount: 28000,
        inflationIndex: 'socialSecurity', start: { type: 'age', person: 'b', value: 67 } }
    ],
    expenses: [
      { id: 'living', name: 'Living expenses', amount: 96000, inflationIndex: 'general',
        category: 'living', retirementSpending: true },
      { id: 'health', name: 'Retirement health care', amount: 12000, inflationIndex: 'health',
        category: 'health', start: { type: 'firstRetirement' } }
    ],
    savings: [
      { id: 'sv_k', name: "B's 401(k) deferral", owner: 'b', accountId: 'k', kind: 'fixed',
        amount: 23000, end: { type: 'retirement', person: 'b' }, employerMatch: 0.04 },
      { id: 'sv_ira', name: "A's IRA", owner: 'a', accountId: 'ira', kind: 'fixed', amount: 8000,
        end: { type: 'retirement', person: 'a' } }
    ],
    goals: [
      { id: 'trip', name: 'Annual travel', amount: 12000, inflationIndex: 'general',
        start: { type: 'firstRetirement' }, end: { type: 'age', person: 'a', value: 80 } }
    ]
  },
  settings: {
    allocation: { usLargeCap: 0.45, intlDeveloped: 0.15, usCoreBond: 0.33, cash: 0.07 },
    withdrawalSequence: 'taxable-deferred-free',
    portfolioTurnover: 0.10,
    qualifiedDividendShare: 0.85,
    longTermGainShare: 0.90,
    advisoryFee: 0.0,
    sweepAccountId: 'brk',
    includeMedicare: true
  }
};
