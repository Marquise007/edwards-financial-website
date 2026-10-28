// Five separate indices, because health care and education do not track general prices.
// Rates are decimals, e.g. 0.025. Every one is a house assumption, set in params/assumptions.json,
// and every output that uses them has to say so.

export const INDICES = ['general', 'health', 'education', 'socialSecurity', 'tax', 'none'];

export function factor(index, years, rates) {
  if (index === 'none') return 1;
  const r = rates[index];
  if (r === undefined) throw new Error('no inflation rate for index: ' + index);
  return Math.pow(1 + r, years);
}

// Grow a stated amount from the year it was stated to the projection year.
export function inflate(amount, index, fromYear, toYear, rates) {
  if (toYear === fromYear) return amount;
  return amount * factor(index, toYear - fromYear, rates);
}
