import { checkCMA } from './cma-check.js?v=19c30bf6d8';
// Edwards planning engine.
// One ledger, and a set of views and solves that all run on it.

export { project } from './ledger.js?v=19c30bf6d8';
export * as triggers from './triggers.js?v=19c30bf6d8';
export * as inflation from './inflation.js?v=19c30bf6d8';
export * as tax from './tax.js?v=19c30bf6d8';
export * as stateTax from './state-tax.js?v=19c30bf6d8';
export * as medicare from './medicare.js?v=19c30bf6d8';
export * as accounts from './accounts.js?v=19c30bf6d8';
export * as monteCarlo from './monte-carlo.js?v=19c30bf6d8';
export * as scenarios from './scenarios.js?v=19c30bf6d8';
export * as stress from './stress.js?v=19c30bf6d8';
export * as spending from './spending.js?v=19c30bf6d8';
export * as socialSecurity from './social-security.js?v=19c30bf6d8';
export * as ssOptimizer from './ss-optimizer.js?v=19c30bf6d8';
export * as roth from './roth.js?v=19c30bf6d8';
export * as lifeInsurance from './life-insurance.js?v=19c30bf6d8';
export * as pension from './pension.js?v=19c30bf6d8';
export * as estate from './estate.js?v=19c30bf6d8';
export * as levers from './levers.js?v=19c30bf6d8';
export * as views from './views.js?v=19c30bf6d8';

// A parameter set is only fit to show a client when nothing in it is still pending.
// This walks the whole object and reports every unverified corner, so the check is
// mechanical rather than a matter of someone remembering.
export function verifyParams(params, path = 'params') {
  const pending = [];
  walk(params, path);
  function walk(node, where) {
    if (!node || typeof node !== 'object') return;
    if (node._status && String(node._status).toUpperCase().includes('PENDING')) {
      pending.push({ at: where, status: node._status });
    }
    if (Array.isArray(node)) { node.forEach((v, i) => walk(v, where + '[' + i + ']')); return; }
    for (const [k, v] of Object.entries(node)) {
      if (k === '_status') continue;
      walk(v, where + '.' + k);
    }
  }

  // A _status marker is a note someone remembered to write. The assembler already knows
  // which sets had no file behind them, and a set that is standing in is not fit to show a
  // household whether or not anyone marked it. This closes the gap between the two.
  for (const key of params._provenance?.standingIn ?? []) {
    pending.push({ at: path + '.' + key,
      status: 'STANDING IN: no sourced file was loaded for this set' });
  }

  // The capital market set has no statute behind it, so it gets the coherence check
  // instead. A set whose correlation matrix cannot be decomposed produces confident,
  // meaningless output, which is the worst thing to put in front of a household.
  if (params.capitalMarket) {
    for (const p of checkCMA(params.capitalMarket, params.correlation)) {
      if (p.level === 'fatal') pending.push({ at: path + '.' + p.where, status: 'INCOHERENT: ' + p.says });
    }
  }

  return { fitForClient: pending.length === 0, pending };
}

// Every statutory value should be able to name its source. This reports the ones that
// cannot, which is the list of things still to do before anything is printed.
export function missingCitations(params, path = 'params') {
  const missing = [];
  walk(params, path);
  function walk(node, where) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return;
    const looksStatutory = node.brackets || node.rateSchedule || node.irmaa
      || node.uniformLifetime || node.fullRetirementAge;
    if (looksStatutory && !node.source) missing.push(where);
    for (const [k, v] of Object.entries(node)) {
      // Keys beginning with an underscore are notes to a reader, not data to cite.
      if (k.startsWith('_')) continue;
      walk(v, where + '.' + k);
    }
  }
  return missing;
}
