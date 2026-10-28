// Assemble a parameter set from the files in params/.
//
// Each file is independent and arrives on its own schedule, so the loader reports exactly
// which parts are verified and which are still standing in. Nothing silently fills a gap.

export function assemble(files, fallback) {
  const out = { ...(fallback ?? {}) };
  const verified = [], standingIn = [];

  const take = (key, file, map) => {
    if (file) { out[key] = map ? map(file) : file; verified.push(key); }
    else if (out[key] !== undefined) standingIn.push(key);
  };

  take('medicare', files.medicare, m => ({
    eligibilityAge: m.eligibilityAge,
    partB: m.partB,
    partA: m.partA,
    partD: { baseBeneficiaryPremium: m.partD.baseBeneficiaryPremium,
             deductible: m.partD.definedStandardAnnualDeductible,
             outOfPocketThreshold: m.partD.annualOutOfPocketThreshold },
    irmaa: {
      single: m.irmaa.single,
      marriedFilingJointly: m.irmaa.marriedFilingJointly,
      marriedFilingSeparately: m.irmaa.marriedFilingSeparately
    },
    lateEnrollment: m.lateEnrollment,
    enrollment: m.enrollment,
    source: m.source,
    effectiveYear: m.effectiveYear
  }));
  take('careCosts', files.careCosts);
  take('federal', files.federal);
  take('socialSecurity', files.socialSecurity);
  take('stateTax', files.stateTax);
  take('rmd', files.rmd);
  // The capital market file carries the assumptions and the correlation matrix together,
  // because they are one set: a correlation matrix is only meaningful alongside the classes
  // it correlates, and letting them drift apart is how a matrix ends up naming a class the
  // assumptions no longer have.
  if (files.capitalMarket) {
    const f = files.capitalMarket;
    const classes = {};
    for (const [k, v] of Object.entries(f.assetClasses ?? f)) {
      if (k.startsWith('_') || k === 'correlation' || k === 'source'
          || k === 'effectiveYear' || k === 'capturedOn' || k === 'assetClasses') continue;
      classes[k] = f.source && !v.source ? { ...v, source: f.source } : v;
    }
    out.capitalMarket = classes;
    if (f.correlation) out.correlation = f.correlation;
    verified.push('capitalMarket');
  } else if (out.capitalMarket !== undefined) {
    standingIn.push('capitalMarket');
  }

  if (files.house) {
    out.inflation = files.house.inflation ?? out.inflation;
    out.monteCarlo = files.house.monteCarlo ?? out.monteCarlo;
    out.houseSettings = files.house.settings;
  }

  // The fallback carries a root _status marking the whole placeholder set as pending. Once
  // real files have replaced every set, that marker describes nothing that is still here,
  // and leaving it in made provenanceLine and verifyParams disagree: one said everything
  // was verified, the other refused to produce a client report and could not say why.
  if (!standingIn.length) delete out._status;
  else if (fallback?._status) out._status = fallback._status;

  out._provenance = { verified, standingIn, assembledAt: new Date().toISOString().slice(0, 10) };
  return out;
}

// A one-line statement of what a given set can and cannot be used for. Printed on any
// output that leaves this engine.
export function provenanceLine(params) {
  const p = params._provenance;
  if (!p) return 'Provenance not recorded. Treat every figure as unverified.';
  if (!p.standingIn.length) {
    return 'Every parameter set in this projection is verified against a primary source.';
  }
  return 'Verified: ' + (p.verified.join(', ') || 'none') + '. '
    + 'Still standing in and not fit for a client: ' + p.standingIn.join(', ') + '.';
}
