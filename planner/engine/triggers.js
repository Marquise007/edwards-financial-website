// Trigger expressions.
// Every dated item in a plan answers "when does this start" and "when does it stop"
// with an expression, never a hard-coded year. That is what lets a lever change a
// retirement age and have forty downstream items move with it.

export const NEVER = { type: 'never' };
export const IMMEDIATE = { type: 'immediate' };

// ctx: { baseYear, people: { [id]: { birthYear, retirementAge, horizonAge } } }
// Returns the calendar year the trigger fires, or null for never.
export function triggerYear(trigger, ctx) {
  if (!trigger || trigger.type === 'never') return null;
  const p = trigger.person ? ctx.people[trigger.person] : null;
  switch (trigger.type) {
    case 'immediate':
      return ctx.baseYear;
    case 'year':
      return trigger.value;
    case 'afterYears':
      return ctx.baseYear + trigger.value;
    case 'age':
      if (!p) return null;
      return p.birthYear + trigger.value;
    case 'retirement':
      if (!p) return null;
      return p.birthYear + p.retirementAge;
    case 'endOfPlan':
      if (!p) return null;
      return p.birthYear + p.horizonAge;
    case 'firstRetirement':
      return minOver(ctx, q => q.birthYear + q.retirementAge);
    case 'secondRetirement':
      return maxOver(ctx, q => q.birthYear + q.retirementAge);
    case 'endOfBothPlans':
      return maxOver(ctx, q => q.birthYear + q.horizonAge);
    default:
      throw new Error('unknown trigger type: ' + trigger.type);
  }
}

function minOver(ctx, f) {
  const vals = Object.values(ctx.people).map(f).filter(v => Number.isFinite(v));
  return vals.length ? Math.min(...vals) : null;
}
function maxOver(ctx, f) {
  const vals = Object.values(ctx.people).map(f).filter(v => Number.isFinite(v));
  return vals.length ? Math.max(...vals) : null;
}

// Is the item live in this calendar year?
// start defaults to immediate, end defaults to the end of the plan (inclusive of end year
// unless endExclusive is set on the trigger).
export function isActive(item, year, ctx) {
  const s = triggerYear(item.start ?? IMMEDIATE, ctx);
  if (s === null) return false;
  if (year < s) return false;
  if (item.end) {
    const e = triggerYear(item.end, ctx);
    if (e === null) return true;            // explicit never-ending
    if (item.end.exclusive ? year >= e : year > e) return false;
  }
  return true;
}
