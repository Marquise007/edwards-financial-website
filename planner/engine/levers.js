// Levers.
//
// The mechanism behind "here is where you are, here is where you could be." A lever is an
// override on one plan input. Apply a set of them to the current plan and you have the
// proposed plan. Nothing else in the engine knows levers exist, which is the point: the
// comparison is two runs of the same engine, not two different models.

const PATHS = {
  retirementAge:      (p, id) => ['household', 'people', byId(p.household.people, id), 'retirementAge'],
  planningHorizonAge: (p, id) => ['household', 'people', byId(p.household.people, id), 'planningHorizonAge'],
  incomeAmount:       (p, id) => ['household', 'incomes', byId(p.household.incomes, id), 'amount'],
  incomeStart:        (p, id) => ['household', 'incomes', byId(p.household.incomes, id), 'start'],
  expenseAmount:      (p, id) => ['household', 'expenses', byId(p.household.expenses, id), 'amount'],
  goalAmount:         (p, id) => ['household', 'goals', byId(p.household.goals, id), 'amount'],
  goalStart:          (p, id) => ['household', 'goals', byId(p.household.goals, id), 'start'],
  savingAmount:       (p, id) => ['household', 'savings', byId(p.household.savings, id), 'amount'],
  allocation:         () => ['settings', 'allocation'],
  withdrawalSequence: () => ['settings', 'withdrawalSequence'],
  spendingStrategy:   () => ['settings', 'spendingStrategy'],
  spendingOptions:    () => ['settings', 'spendingOptions'],
  advisoryFee:        () => ['settings', 'advisoryFee'],
  medicareSupplement: () => ['settings', 'medicareSupplementMonthly']
};

function byId(list, id) {
  const i = (list ?? []).findIndex(x => x.id === id);
  if (i < 0) throw new Error('no item with id ' + id);
  return i;
}

// A lever: { type, targetId?, value }
export function apply(plan, levers) {
  let next = clone(plan);
  for (const lever of levers) {
    const resolver = PATHS[lever.type];
    if (!resolver) throw new Error('unknown lever type: ' + lever.type);
    const path = resolver(next, lever.targetId);
    setIn(next, path, lever.value);
  }
  return next;
}

// Named lever sets, because the conversation is usually about a move, not a field.
export const MOVES = {
  retireLater: years => people => people.map(p =>
    ({ type: 'retirementAge', targetId: p.id, value: p.retirementAge + years })),
  claimSocialSecurityAt: (incomeId, personId, age) =>
    [{ type: 'incomeStart', targetId: incomeId, value: { type: 'age', person: personId, value: age } }],
  spendLess: (expenseId, fraction) => current =>
    [{ type: 'expenseAmount', targetId: expenseId, value: current * (1 - fraction) }],
  saveMore: (savingId, amount) =>
    [{ type: 'savingAmount', targetId: savingId, value: amount }],
  changeAllocation: weights => [{ type: 'allocation', value: weights }],
  useGuardrails: options =>
    [{ type: 'spendingStrategy', value: 'guardrails' },
     { type: 'spendingOptions', value: options ?? {} }]
};

// What a single lever is worth, on its own, so the conversation can be about one thing
// at a time rather than a wall of changes.
export function marginalValue(plan, params, lever, projectFn, measure) {
  const before = projectFn(plan, params);
  const after = projectFn(apply(plan, [lever]), params);
  const m = measure ?? (p => p.endingInvestedAssets);
  return {
    lever,
    before: m(before),
    after: m(after),
    difference: m(after) - m(before),
    heldBefore: before.succeeded,
    holdsAfter: after.succeeded
  };
}

// Rank a set of candidate levers by what each one is worth alone. The honest version of
// "solve for the best strategy": no black box, just one move at a time, scored and shown.
export function rank(plan, params, levers, projectFn, measure) {
  return levers
    .map(l => marginalValue(plan, params, l, projectFn, measure))
    .sort((a, b) => b.difference - a.difference);
}

function clone(o) {
  if (typeof structuredClone === 'function') return structuredClone(o);
  return JSON.parse(JSON.stringify(o));
}

function setIn(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
  cur[path[path.length - 1]] = value;
}
