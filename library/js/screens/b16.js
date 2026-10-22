/* b16: HECM presentations (Lien Payoff, Line of Credit, HECM for Purchase: downsize and upsize) and
   Three Kinds of Money (ttom1).
   Engine exposed first: EFA.engines.hecm (specs-clean/_hecm-engine.md), reused by the forward vs reverse
   comparison screens. Shared pieces used: EFA.lib.pem (money-flow model), EFA.lib.worksheet
   (Documentation), EFA.lib.bullets (dart bullets), EFA.lib.disclosure, EFA.lib.caseData.
   Screen structure, sequence and math follow the specs; drawings and wording are new. */
(function () {
  'use strict';
  const EFA = window.EFA = window.EFA || {};
  EFA.engines = EFA.engines || {};
  const PRIOR = EFA.engines.hecm && EFA.engines.hecm.__b16 ? EFA.engines.hecm : null;

  /* =====================================================================================
     1. HECM ENGINE (pure math, no DOM). Units follow the spec: proposal rates in percent
        (6.5 = 6.5%), money in dollars, ages in years. Client case values (EFA.lib.caseData)
        keep the app convention: rates as fractions; household() converts them.
     ===================================================================================== */
  const Z = (x) => (Math.abs(x) < 0.0049 ? 0 : x);
  const clamp = (x) => Math.min(100, Math.max(0, x));
  const monthly = (p) => (+p || 0) / 100 / 12;
  /** NPER with fv = 0, type 0 (spec section 2). Payment at or below the monthly interest gives 0. */
  function nper(i, pmt, pv) {
    if (i === 0 && pmt !== 0) return -pv / pmt;
    if (i <= 0) return 0;
    const d = pv * i + pmt;
    if (d === 0) return 0;
    const c = pmt / d;
    if (!(c > 0) || !isFinite(c)) return 0;
    return Math.log10(c) / Math.log10(1 + i);
  }
  const ROWKEYS = ['LoanBalance', 'LoanDrawA', 'LoanDrawC', 'LoanInterest', 'LoanInterestC', 'LoanPaymentsA', 'LoanPaymentsC',
    'PropertyValue', 'Equity', 'LOC', 'Liquidity', 'SavingBalance', 'SavingContribution', 'SavingContributionC', 'SavingInterest',
    'WithdrawalA', 'WithdrawalC', 'Inflow', 'Outflow', 'Lifestyle', 'VoluntaryPaymentsC', 'PaidFromInflowA', 'PaidFromInflowC'];
  function blankRow(age) {
    const r = { Age: age, LSRegulatorValue: 100, LSRemainingValue: 100, _limit: 0 };
    ROWKEYS.forEach((k) => { r[k] = 0; });
    return r;
  }
  const years = (I) => Math.max(1, Math.round((I.endAge == null ? 99 : I.endAge) - I.startAge));
  /** maxima used for the shared tank scale (spec 2: refScale update) */
  function maxima(rows, kind) {
    let prop = 0, debt = 0, sav = 0;
    rows.forEach((r) => {
      prop = Math.max(prop, r.PropertyValue);
      sav = Math.max(sav, r.SavingBalance);
      if (kind !== 'CP') debt = Math.max(debt, r.LoanBalance, kind === 'EL' ? 0 : r._limit);
    });
    return { prop, debt, sav };
  }

  /* ----- 3.1 / 3.2 existing mortgage ----- */
  /** I: {startAge, endAge, bal, pmt, rate, sav, savRate, prop, app, inc, life, cola, showCF, wd, pfs} */
  function runEL(I) {
    const N = years(I), i = monthly(I.rate), s = monthly(I.savRate), cf = I.showCF !== false;
    let bal = +I.bal || 0, sav = +I.sav || 0, prop = +I.prop || 0, inc = cf ? (+I.inc || 0) : 0, life = cf ? (+I.life || 0) : 0;
    const pmt = +I.pmt || 0, wd = +I.wd || 0, pfs = +I.pfs || 0;
    const rows = []; let status = null;
    const r0 = blankRow(I.startAge);
    Object.assign(r0, { LoanBalance: bal, PropertyValue: prop, Equity: prop - bal, SavingBalance: sav, Liquidity: sav, LSRegulatorValue: 100, LSRemainingValue: 80 });
    rows.push(r0);
    let intA = 0, intC = 0, pmtA = 0, pmtC = 0, fiA = 0, fiC = 0, lifeA = 0, incA = 0, wdA = 0, wdC = 0, siA = 0;
    for (let m = 1; m <= 12 * N; m++) {
      if (cf) {
        let sv = sav;
        const int = bal * i; intA += int; intC += int;
        const pay = Math.min(bal + int, pmt, sv + inc); pmtA += pay; pmtC += pay;
        bal = Z(bal + int - pay);
        const fromInc = Z(Math.min(pay, Math.max(0, inc - life))); fiA += fromInc; fiC += fromInc;
        lifeA += life; incA += inc;
        let need = life + pay - inc;
        if (need > sv) { wdA += sv; wdC += sv; need -= sv; sv = 0; if (!status) status = { kind: 'savOut', month: m }; }
        else if (need > 0) { wdA += need; wdC += need; sv -= need; need = 0; }
        siA += sv * s;
        sav = Z(sv * (1 + s));
      } else {
        const int = bal * i; intA += int;
        const pay = Math.min(bal + int, pmt); pmtA += pay; pmtC += pay;
        bal = Z(bal + int - pay);
        const fromSav = Z(Math.min(pay, pfs));
        const fromInc = Z(pay - fromSav); fiA += fromInc; fiC += fromInc;
        const take = wd + fromSav;
        if (take > sav) { wdA += sav; wdC += sav; sav = 0; if (wd > 0 && !status) status = { kind: 'wdStop', month: m }; }
        else { wdA += take; wdC += take; sav -= take; }
        siA += sav * s;
        sav = Z(sav * (1 + s));
      }
      if (m % 12 === 0) {
        prop *= 1 + (+I.app || 0) / 100;
        const r = blankRow(I.startAge + m / 12);
        if (cf) {
          const outflow = Z(incA + wdA);
          const reg = (lifeA + pmtA) > 0 ? clamp(100 * outflow / (lifeA + pmtA)) : 100;
          const rem = outflow > 0 ? 100 - reg * clamp(pmtA / outflow) : 100;
          Object.assign(r, { LoanInterestC: intC, LSRegulatorValue: reg, LSRemainingValue: rem, Inflow: incA, Outflow: outflow, Lifestyle: Math.max(Z(outflow - pmtA), 0) });
        } else {
          Object.assign(r, { LoanInterestC: 0, LSRegulatorValue: 100, LSRemainingValue: pmtA > 0 ? 80 : 100 });
        }
        Object.assign(r, { LoanBalance: bal, LoanInterest: intA, LoanPaymentsA: pmtA, LoanPaymentsC: pmtC, PropertyValue: prop, Equity: prop - bal,
          PaidFromInflowA: fiA, PaidFromInflowC: fiC, SavingBalance: sav, Liquidity: sav, SavingContribution: 0, SavingInterest: siA,
          WithdrawalA: Z(wdA), WithdrawalC: Z(wdC) });
        rows.push(r);
        intA = pmtA = fiA = lifeA = incA = wdA = siA = 0;
        if (cf) { inc *= 1 + (+I.cola || 0) / 100; life *= 1 + (+I.cola || 0) / 100; }
      }
    }
    return { kind: 'EL', rows, status, totalPayments: pmtC, max: maxima(rows, 'EL') };
  }

  /* ----- HECM family: 3.3 HECM, 3.4 HECM_OP, 3.5 HECM_DRAW, 3.7 H4P, 3.8 H4P_OP ----- */
  /**
   * p: proposal (spec 1a). I: {startAge, endAge, prop, app, sav (starting savings, already including any
   * Advance or purchase contribution), savRate, inc, life, cola, locFirst}. o: {avail: 'floor'|'raw'|'Z',
   * op: {opSavDeposit, opSavStart, opSavEnd, opPayment, opPayStart, opPayEnd} | null,
   * draw: {lumpAmount, lumpYear, monthlyDraw, drawStart, drawEnd} | null, row0: fields for row 0}
   */
  function hecmLoop(kind, p, I, o) {
    const N = years(I);
    const r = monthly(p.RORLoanExpected), q = monthly(p.RORMIP), g = monthly(p.RORPrincipalLimit), ga = monthly((+p.RORLoanInitial || 0) + (+p.RORMIP || 0));
    const s = monthly(I.savRate), cola = (+I.cola || 0) / 100, app = (+I.app || 0) / 100;
    const op = o.op, dr = o.draw, locFirst = I.locFirst !== false;
    const lesaD = +p.LESADisbursement || 0;
    let limit = (+p.PrincipalLimit || 0) - (+p.LESA || 0);
    let bal = o.bal0, sav = I.sav, prop = +I.prop || 0, inc = +I.inc || 0, life = +I.life || 0;
    const rows = []; let status = null, drawStatus = o.drawStatus0 || null;
    const r0 = blankRow(I.startAge);
    Object.assign(r0, { PropertyValue: prop, LSRegulatorValue: 100, LSRemainingValue: 100, _limit: limit }, o.row0);
    rows.push(r0);
    let drawA = o.draw0 || 0, drawC = o.draw0 || 0, intA = 0, mipA = 0, imC = 0, wdA = 0, wdC = 0, lifeA = 0, incA = 0, siA = 0;
    let pmtA = 0, pmtC = 0, depA = 0, depC = 0;
    const doDraw = (x) => { bal += x; drawA += x; drawC += x; };
    for (let m = 1; m <= 12 * N; m++) {
      // limit growth on the start-of-month balance
      limit = p.AltLOCCalc ? bal * (1 + g) + Math.max(0, limit - bal) * (1 + ga) : limit * (1 + g);
      const int = bal * r, mip = bal * q;
      let payment = 0;
      if (op && m >= op.opPayStart && m <= op.opPayEnd) payment = Math.min(+op.opPayment || 0, bal + int + mip);
      intA += int; mipA += mip; imC += int + mip; pmtA += payment;
      bal = Z(bal + int + mip - payment);
      if (lesaD > 0 && m % 6 === 0) bal += lesaD;
      if (dr) {
        if (dr.lumpYear >= 2 && m === 12 * (dr.lumpYear - 1) && dr.lumpAmount > 0) {
          const room = limit - bal, x = Math.max(0, Math.min(dr.lumpAmount, room));
          if (dr.lumpAmount > room) drawStatus = { kind: 'lumpY', amount: room, year: dr.lumpYear };
          doDraw(x);
        }
        if (dr.monthlyDraw > 0 && m >= dr.drawStart && m <= dr.drawEnd) {
          const room = limit - bal, x = Math.max(0, Math.min(dr.monthlyDraw, room));
          if (dr.monthlyDraw > room && !drawStatus) drawStatus = { kind: 'monthlyCap', month: m };
          doDraw(x);
        }
      }
      lifeA += life; incA += inc;
      let need = life - inc;
      const raw = limit - bal;
      const avail = o.avail === 'floor' ? Math.max(0, raw) : (o.avail === 'Z' ? Z(raw) : raw);
      if (need > 0) {
        const locStep = () => { if (need > avail) { doDraw(avail); need -= avail; } else if (need > 0) { doDraw(need); need = 0; } };
        const savStep = () => {
          if (need > sav) { wdA += sav; wdC += sav; need -= sav; sav = 0; if (!status) status = { kind: 'savOut', month: m }; }
          else if (need > 0) { wdA += need; wdC += need; sav -= need; need = 0; }
        };
        if (locFirst) { locStep(); savStep(); } else { savStep(); locStep(); }
      }
      const dep = op && m >= op.opSavStart && m <= op.opSavEnd ? (+op.opSavDeposit || 0) : 0;
      depA += dep;
      siA += sav * s;
      sav = Z(sav + sav * s + dep);
      if (m % 12 === 0) {
        prop *= 1 + app;
        const row = blankRow(I.startAge + m / 12);
        let outflow, reg, rem, lifestyle;
        if (op) {
          outflow = Z(incA + wdA - depA);
          reg = lifeA > 0 ? clamp(100 * outflow / lifeA) : 100;
          rem = outflow > 0 ? 100 - reg * clamp(pmtA / outflow) : 100;
          pmtC += pmtA; depC += depA;
          lifestyle = Math.max(Z(outflow + drawA - pmtA), 0);
          Object.assign(row, { LoanPaymentsA: pmtA, LoanPaymentsC: pmtC, SavingContribution: depA, SavingContributionC: depC, VoluntaryPaymentsC: pmtC });
        } else {
          outflow = Z(incA + wdA);
          reg = lifeA > 0 ? clamp(100 * outflow / lifeA) : 100;
          rem = 100;
          lifestyle = Math.max(Z(outflow + drawA), 0);
        }
        Object.assign(row, {
          LoanBalance: bal, LoanDrawA: drawA, LoanDrawC: drawC, LoanInterest: intA + mipA, LoanInterestC: imC,
          PropertyValue: prop, Equity: prop - bal, LOC: limit - bal, Liquidity: limit - bal + sav,
          LSRegulatorValue: reg, LSRemainingValue: rem, SavingBalance: sav, SavingInterest: siA,
          WithdrawalA: Z(wdA), WithdrawalC: Z(wdC), Inflow: incA, Outflow: outflow, Lifestyle: lifestyle, _limit: limit
        });
        rows.push(row);
        drawA = intA = mipA = wdA = lifeA = incA = siA = pmtA = depA = 0;
        inc *= 1 + cola; life *= 1 + cola;
      }
    }
    return { kind, rows, status, drawStatus, max: maxima(rows, kind) };
  }

  /** 3.3 HECM pays off the mortgage; no payments; credit line covers lifestyle shortfalls */
  function runHECM(p, I) {
    const adv = +p.Advance || 0, mb = +p.MortgageBalance || 0, prop = +I.prop || 0;
    return hecmLoop('HECM', p, Object.assign({}, I, { sav: (+I.sav || 0) + adv }), {
      avail: 'floor', bal0: mb,
      row0: { LoanBalance: mb, Equity: prop - mb, LOC: +p.LOC || 0, Liquidity: (+p.LOCY1 || 0) + (+I.sav || 0) + adv, SavingBalance: (+I.sav || 0) + adv }
    });
  }
  /** 3.4 HECM plus savings deposits and optional payments (savings rate = opSavRate) */
  function runHECMOP(p, I, op) {
    const adv = +p.Advance || 0, mb = +p.MortgageBalance || 0, prop = +I.prop || 0;
    return hecmLoop('HECM_OP', p, Object.assign({}, I, { sav: (+I.sav || 0) + adv, savRate: op.opSavRate }), {
      avail: 'raw', bal0: mb, op,
      row0: { LoanBalance: mb, Equity: prop - mb, LOC: +p.LOC || 0, Liquidity: (+p.LOCY1 || 0) + (+I.sav || 0) + adv, SavingBalance: (+I.sav || 0) + adv }
    });
  }
  /** 3.5 HECM with planned draws (no Advance) */
  function runDRAW(p, I, d) {
    const mb = +p.MortgageBalance || 0, prop = +I.prop || 0, y1 = +p.LOCY1 || 0;
    const draw = { lumpAmount: Math.max(0, +d.lumpAmount || 0), lumpYear: Math.round(+d.lumpYear || 1), monthlyDraw: Math.max(0, +d.monthlyDraw || 0), drawStart: Math.round(+d.drawStart || 0), drawEnd: Math.round(+d.drawEnd || 0) };
    let lump1 = 0, pre = null;
    if (draw.lumpYear === 1 && draw.lumpAmount > 0) {
      lump1 = Math.min(draw.lumpAmount, y1);
      if (draw.lumpAmount > y1) pre = { kind: 'lumpY1', amount: y1 };
    }
    return hecmLoop('HECM_DRAW', p, Object.assign({}, I, { sav: +I.sav || 0 }), {
      avail: 'raw', bal0: mb + lump1, draw0: lump1, draw, drawStatus0: pre,
      row0: { LoanBalance: mb + lump1, Equity: prop - (mb + lump1), LOC: (+p.LOC || 0) - lump1, Liquidity: y1 - lump1 + (+I.sav || 0), SavingBalance: +I.sav || 0 }
    });
  }
  /** zero rows for the "insufficient funds" state */
  function zeroRun(kind, I, extra) {
    const N = years(I), rows = [];
    for (let y = 0; y <= N; y++) rows.push(Object.assign(blankRow(I.startAge + y), extra));
    return { kind, rows, status: null, drawStatus: null, insufficient: true, max: { prop: 0, debt: 0, sav: 0 } };
  }
  /** 3.6 cash purchase. h: {saleProceeds, cpSavRate} */
  function runCP(p, I, h) {
    const price = +p.PropertyValue || 0, contrib = (+h.saleProceeds || 0) - price;
    if ((+I.sav || 0) + contrib < 0) return zeroRun('CP', I, { LSRegulatorValue: 0, LSRemainingValue: 100 });
    const N = years(I), s = monthly(h.cpSavRate), cola = (+I.cola || 0) / 100, app = (+I.app || 0) / 100;
    let sav = (+I.sav || 0) + contrib, prop = price, inc = +I.inc || 0, life = +I.life || 0;
    const rows = []; let status = null;
    const r0 = blankRow(I.startAge);
    Object.assign(r0, { Equity: price, PropertyValue: price, SavingBalance: sav, Liquidity: sav, SavingContribution: contrib, LSRegulatorValue: 100, LSRemainingValue: 100 });
    rows.push(r0);
    let wdA = 0, wdC = 0, lifeA = 0, incA = 0, siA = 0;
    for (let m = 1; m <= 12 * N; m++) {
      lifeA += life; incA += inc;
      let need = life - inc;
      if (need > sav) { wdA += sav; wdC += sav; need -= sav; sav = 0; if (!status) status = { kind: 'savOut', month: m }; }
      else if (need > 0) { wdA += need; wdC += need; sav -= need; need = 0; }
      siA += sav * s;
      sav = Z(sav * (1 + s));
      if (m % 12 === 0) {
        prop *= 1 + app;
        const outflow = Z(incA + wdA);
        const reg = lifeA > 0 ? clamp(100 * outflow / lifeA) : 100;
        const row = blankRow(I.startAge + m / 12);
        Object.assign(row, { Equity: prop, PropertyValue: prop, Liquidity: sav, SavingBalance: sav, LSRegulatorValue: reg, LSRemainingValue: 100,
          SavingContribution: 0, SavingInterest: siA, WithdrawalA: Z(wdA), WithdrawalC: Z(wdC), Inflow: incA, Outflow: outflow, Lifestyle: Math.max(Z(outflow), 0) });
        rows.push(row);
        wdA = lifeA = incA = siA = 0;
        inc *= 1 + cola; life *= 1 + cola;
      }
    }
    return { kind: 'CP', rows, status, drawStatus: null, insufficient: false, max: maxima(rows, 'CP') };
  }
  /** 3.7 purchase with a HECM. h: {saleProceeds, cpSavRate} */
  function runH4P(p, I, h) {
    const price = +p.PropertyValue || 0, mb = +p.MortgageBalance || 0, contrib = (+h.saleProceeds || 0) + (+p.Advance || 0);
    if ((+I.sav || 0) + contrib < 0) return zeroRun('H4P', I, { LOC: +p.LOC || 0, LSRegulatorValue: 100, LSRemainingValue: 100 });
    const sav0 = (+I.sav || 0) + contrib;
    const out = hecmLoop('H4P', p, Object.assign({}, I, { prop: price, sav: sav0, savRate: h.cpSavRate }), {
      avail: 'Z', bal0: mb,
      row0: { Equity: price - mb, Liquidity: (+p.LOC || 0) + sav0, LoanBalance: mb, LOC: +p.LOC || 0, PropertyValue: price, SavingBalance: sav0, SavingContribution: contrib }
    });
    out.insufficient = false;
    return out;
  }
  /** 3.8 purchase with a HECM plus savings deposits and optional payments (savings rate = opSavRate) */
  function runH4POP(p, I, h, op) {
    const price = +p.PropertyValue || 0, mb = +p.MortgageBalance || 0, contrib = (+h.saleProceeds || 0) + (+p.Advance || 0);
    if ((+I.sav || 0) + contrib < 0) return zeroRun('H4P_OP', I, { LOC: +p.LOC || 0, LSRegulatorValue: 100, LSRemainingValue: 100 });
    const sav0 = (+I.sav || 0) + contrib;
    const out = hecmLoop('H4P_OP', p, Object.assign({}, I, { prop: price, sav: sav0, savRate: op.opSavRate }), {
      avail: 'Z', bal0: mb, op,
      row0: { Equity: price - mb, Liquidity: (+p.LOC || 0) + sav0, LoanBalance: mb, LOC: +p.LOC || 0, PropertyValue: price, SavingBalance: sav0, SavingContribution: contrib }
    });
    out.insufficient = false;
    return out;
  }
  /** 3.9 credit-line gain series */
  function locGain(op, base) {
    return op.rows.map((r, k) => ({ Age: r.Age, PaymentC: r.VoluntaryPaymentsC, LOCGain: r.LOC - ((base.rows[k] && base.rows[k].LOC) || 0) }));
  }
  /** first-year line of credit, as computed when a proposal is imported (spec 1a background) */
  function locY1(p) {
    const PL = +p.PrincipalLimit || 0, MB = +p.MortgageBalance || 0, A = +p.Advance || 0;
    let X = 0;
    if (MB - A > 0.5 * PL && A >= 0) X = Math.min(Math.max(0, 0.1 * PL - A), PL - MB - A);
    return Math.max(0, 0.6 * PL - MB, X);
  }
  /* the math is exposed at once, so the comparison screens can reuse it even before the UI below loads */
  const HECM = EFA.engines.hecm = Object.assign(PRIOR || {}, {
    __b16: true, version: 1,
    helpers: { Z, clamp, monthly, nper, locY1 },
    run: { EL: runEL, HECM: runHECM, HECM_OP: runHECMOP, HECM_DRAW: runDRAW, CP: runCP, H4P: runH4P, H4P_OP: runH4POP, locGain }
  });

  /* =====================================================================================
     2. SESSION, PROPOSALS AND HOUSEHOLD VALUES
     ===================================================================================== */
  const LS = (EFA.util && EFA.util.LS) || { get: (k, d) => d, set() {} };
  const S = PRIOR ? PRIOR.session : {
    startAge: 72, endAge: 99, refScale: 30000, scale: 100, locFirst: true,
    op: null, opFor: '', draw: { lumpAmount: 0, lumpYear: 1, monthlyDraw: 0, drawStart: 1, drawEnd: 1 },
    h4p: { saleProceeds: null, cpSavRate: null },
    runs: {}, elTotalPayments: 0, maxYear: 27, maxMonth: 324, p: null, hh: null, family: 'refi', sampleToast: false
  };
  const SHOWCF_KEY = 'efa.hecm.showCashFlows';
  const showCF = () => LS.get(SHOWCF_KEY, true) !== false;
  const setShowCF = (v) => { LS.set(SHOWCF_KEY, !!v); S.runs = {}; };

  /* proposal record (spec 1a). Stored per client: EFA.clients namespace 'hecm', keys 'proposals' (list)
     and 'selected' (id). With no saved proposal, a sample proposal built from EFA.data.hecm is used. */
  const PNS = 'hecm';
  const PFIELDS = ['ProposalName', 'ClientAge', 'PropertyValue', 'RORAppreciation', 'MaximumClaim', 'PrincipalLimit', 'Advance', 'LienPayoff',
    'FinancedClosingCosts', 'MortgageBalance', 'LOC', 'LOCY1', 'RORLoanExpected', 'RORLoanInitial', 'RORMIP', 'RORPrincipalLimit', 'AltLOCCalc', 'LESA', 'LESADisbursement'];
  const clientsApi = () => EFA.clients || { get: (n, k, d) => d, set() {}, active: null };
  function proposals() { const v = clientsApi().get(PNS, 'proposals', []); return Array.isArray(v) ? v.filter((x) => x && x.id) : []; }
  function saveProposals(list) { clientsApi().set(PNS, 'proposals', list); }
  function selectedId() { return clientsApi().get(PNS, 'selected', null); }
  function select(id) { clientsApi().set(PNS, 'selected', id); S.runs = {}; }
  const r2 = (n) => Math.round(n * 100) / 100;
  function normalize(src) {
    if (!src) return null;
    const p = Object.assign({}, src);
    PFIELDS.forEach((k) => { if (k !== 'ProposalName' && k !== 'AltLOCCalc') p[k] = p[k] == null || p[k] === '' || !isFinite(+p[k]) ? null : +p[k]; });
    ['PropertyValue', 'RORAppreciation', 'PrincipalLimit', 'Advance', 'LienPayoff', 'FinancedClosingCosts', 'MortgageBalance', 'RORLoanExpected', 'RORMIP', 'LESA', 'LESADisbursement']
      .forEach((k) => { if (p[k] == null) p[k] = 0; });
    if (p.ClientAge == null) p.ClientAge = 62;
    p.ClientAge = Math.max(18, Math.min(98, Math.round(p.ClientAge)));
    if (p.RORLoanInitial == null) p.RORLoanInitial = p.RORLoanExpected;
    if (p.RORPrincipalLimit == null) p.RORPrincipalLimit = p.RORLoanExpected + p.RORMIP;
    const mca = EFA.data && EFA.data.hecm && EFA.data.hecm.maxClaimAmount;
    if (p.MaximumClaim == null) p.MaximumClaim = mca ? Math.min(p.PropertyValue, mca) : p.PropertyValue;
    if (p.LOC == null) p.LOC = Math.max(0, p.PrincipalLimit - p.LESA - p.MortgageBalance);
    if (p.LOCY1 == null) p.LOCY1 = r2(locY1(p));
    p.AltLOCCalc = !!p.AltLOCCalc;
    return p;
  }
  /** illustration proposals built from verified HECM figures (EFA.data.hecm): youngest borrower 72,
      expected rate 6.00%, principal limit factor from the published spot check at that age and rate. */
  function sample(family) {
    const D = EFA.data && EFA.data.hecm;
    const plf = D && D.plfSpotChecks && D.plfSpotChecks.rate0600 && D.plfSpotChecks.rate0600[72];
    if (!D || !plf || !D.maxClaimAmount || D.mipAnnual == null || D.mipUpfront == null) return null;
    const mip = r2(D.mipAnnual * 100), rate = 6;
    if (family === 'purchase') {
      const price = 450000, mca = Math.min(price, D.maxClaimAmount), pl = r2(plf * mca), costs = r2(D.mipUpfront * mca + 8000);
      const loc = 20000, mb = r2(pl - loc), adv = r2(-(price + costs - mb));
      return normalize({ id: '_sample_purchase', sample: 'purchase', ProposalName: null, ClientAge: 72, PropertyValue: price, RORAppreciation: 3, MaximumClaim: mca, PrincipalLimit: pl,
        Advance: adv, LienPayoff: price, FinancedClosingCosts: costs, MortgageBalance: mb, LOC: loc, LOCY1: null, RORLoanExpected: rate, RORLoanInitial: rate, RORMIP: mip,
        RORPrincipalLimit: rate + mip, AltLOCCalc: false, LESA: 0, LESADisbursement: 0 });
    }
    /* lien payoff: an existing mortgage of $180,000 is paid off; line of credit: a home owned free and clear */
    const value = 600000, mca = Math.min(value, D.maxClaimAmount), pl = r2(plf * mca), costs = r2(D.mipUpfront * mca + 9000);
    const lien = family === 'loc' ? 0 : 180000, mb = lien + costs;
    return normalize({ id: '_sample_' + (family === 'loc' ? 'loc' : 'refi'), sample: family === 'loc' ? 'loc' : 'refi', ProposalName: null, ClientAge: 72, PropertyValue: value, RORAppreciation: 3, MaximumClaim: mca, PrincipalLimit: pl,
      Advance: 0, LienPayoff: lien, FinancedClosingCosts: costs, MortgageBalance: mb, LOC: r2(pl - mb), LOCY1: null, RORLoanExpected: rate, RORLoanInitial: rate, RORMIP: mip,
      RORPrincipalLimit: rate + mip, AltLOCCalc: false, LESA: 0, LESADisbursement: 0 });
  }
  const sampleMode = () => proposals().length === 0;
  /** the proposal in use: the client's selected proposal, else the sample for this presentation family */
  function proposal(family) {
    const list = proposals();
    if (list.length) { const id = selectedId(); return normalize(list.find((x) => x.id === id) || list[0]); }
    return sample(family || S.family);
  }

  /* household values (spec 1b) in case data; sample values apply only while the client has no proposal */
  const HH = [
    ['house_current_market_value', 'homeValue', 'money', 600000],
    ['house_outstanding_loan_balance', 'elBalance', 'money', 180000],
    ['house_pmt_or_equity', 'elPayment', 'money', 1400],
    ['mortgage_interest_rate', 'elRate', 'pct', 0.045],
    ['mortgage_term_in_months', 'elMonths', 'int', null],
    ['fw_current_savings', 'savings', 'money', 150000],
    ['case_file_ror_distribution', 'savRate', 'pct', 0.03],
    ['fw_monthly_income', 'income', 'money', 4800],
    ['fw_monthly_lifestyle', 'lifestyle', 'money', 4000],
    ['fw_cola', 'cola', 'pct', 0.02],
    ['fw_monthly_withdrawal', 'monthlyWithdrawal', 'money', 600],
    ['fw_paid_from_savings', 'paidFromSavings', 'money', 0]
  ];
  const caseApi = () => (EFA.lib && EFA.lib.caseData) || { get: (k, d) => d, set() {} };
  function household() {
    const sm = sampleMode(), out = {};
    HH.forEach(([key, f, unit, smp]) => {
      let v = caseApi().get(key, undefined);
      if (v == null || (typeof v === 'number' && !isFinite(v))) v = sm && smp != null ? smp : (unit === 'int' ? null : 0);
      v = v == null ? null : +v;
      out[f] = unit === 'pct' && v != null ? v * 100 : v;
    });
    if (out.elMonths == null) out.elMonths = termMonths(out);
    return out;
  }
  /** write one household value (engine units in, case data units stored) */
  function setHH(field, v) {
    const row = HH.find((x) => x[1] === field); if (!row) return;
    caseApi().set(row[0], row[2] === 'pct' ? v / 100 : v);
    S.runs = {};
  }
  /** months remaining on the existing mortgage: round(NPER(rate/12, payment, -balance)) */
  const termMonths = (hh) => Math.round(nper((+hh.elRate || 0) / 100 / 12, +hh.elPayment || 0, -(+hh.elBalance || 0)));
  /** before the first edit of a sample case: copy the sample household into the client's case data */
  function adoptSampleHousehold() {
    if (!sampleMode()) return;
    const hh = household();
    HH.forEach(([key, f, unit]) => { if (caseApi().get(key, undefined) == null && hh[f] != null) caseApi().set(key, unit === 'pct' ? hh[f] / 100 : hh[f]); });
  }

  /* ----- session loading and cached runs ----- */
  const sig = (o) => JSON.stringify(o);
  /** load the proposal and household into the session (every calculator screen calls this on entry) */
  function begin(family, o) {
    o = o || {};
    S.family = family || S.family;
    S.p = proposal(S.family);
    S.hh = household();
    if (!S.p) return false;
    // another client or another proposal: session settings start over
    const who = (clientsApi().active || '') + '|' + S.p.id;
    if (S.who !== who) {
      S.who = who; S.op = null; S.opFor = ''; S.runs = {};
      S.h4p = { saleProceeds: null, cpSavRate: null };
      S.draw = { lumpAmount: 0, lumpYear: 1, monthlyDraw: 0, drawStart: 1, drawEnd: 1 };
    }
    S.startAge = S.p.ClientAge; S.endAge = 99;
    S.maxYear = S.endAge - S.startAge; S.maxMonth = 12 * S.maxYear;
    if (S.h4p.cpSavRate == null) S.h4p.cpSavRate = S.hh.savRate;
    if (S.h4p.saleProceeds == null) S.h4p.saleProceeds = (S.hh.homeValue || 0) - (S.hh.elBalance || 0);
    if (o.resetScale) S.refScale = 0;
    return true;
  }
  function baseInputs() {
    const hh = S.hh, p = S.p;
    return { startAge: S.startAge, endAge: S.endAge, prop: p.PropertyValue, app: p.RORAppreciation, sav: hh.savings, savRate: hh.savRate,
      inc: hh.income, life: hh.lifestyle, cola: hh.cola, locFirst: S.locFirst };
  }
  /** default optional-payment settings, by the screen that owns them (fwlpsvp5, fwloc4, fwh4psd5) */
  function opDefaults(owner) {
    const term = S.hh.elMonths || 0, rate = Math.min(12, S.hh.savRate || 0);
    if (owner === 'loc') return { opSavDeposit: 0, opSavRate: rate, opSavStart: 1, opSavEnd: 1, opPayment: 0, opPayStart: 1, opPayEnd: 1 };
    if (owner === 'purchase') return { opSavDeposit: 0, opSavRate: rate, opSavStart: 1, opSavEnd: term, opPayment: 0, opPayStart: 1, opPayEnd: term };
    const el = ensure('EL');
    const dep = el.rows[1] ? r2(el.rows[1].PaidFromInflowA / 12) : 0;
    return { opSavDeposit: dep, opSavRate: rate, opSavStart: 1, opSavEnd: term, opPayment: 0, opPayStart: 1, opPayEnd: term };
  }
  function resetOP(owner) { S.op = opDefaults(owner); S.opFor = owner; }
  function runInputs(name) {
    const p = S.p, I = baseInputs(), hh = S.hh, h = { saleProceeds: S.h4p.saleProceeds, cpSavRate: S.h4p.cpSavRate };
    switch (name) {
      case 'EL': return { fn: () => runEL({ startAge: I.startAge, endAge: I.endAge, bal: hh.elBalance, pmt: hh.elPayment, rate: hh.elRate, sav: hh.savings, savRate: hh.savRate,
        prop: p.PropertyValue, app: p.RORAppreciation, inc: hh.income, life: hh.lifestyle, cola: hh.cola, showCF: showCF(), wd: hh.monthlyWithdrawal, pfs: hh.paidFromSavings }), key: [I, hh, showCF()] };
      case 'HECM': return { fn: () => runHECM(p, I), key: [p, I] };
      case 'HECM_OP': if (!S.op || S.opFor === 'purchase') resetOP(S.family === 'loc' ? 'loc' : 'refi'); return { fn: () => runHECMOP(p, I, S.op), key: [p, I, S.op] };
      case 'HECM_DRAW': return { fn: () => runDRAW(p, I, S.draw), key: [p, I, S.draw] };
      case 'CP': return { fn: () => runCP(p, I, h), key: [p, I, h] };
      case 'H4P': return { fn: () => runH4P(p, I, h), key: [p, I, h] };
      case 'H4P_OP': if (!S.op || S.opFor !== 'purchase') resetOP('purchase'); return { fn: () => runH4POP(p, I, h, S.op), key: [p, I, h, S.op] };
      default: throw new Error('Unknown HECM run ' + name);
    }
  }
  /** a run from the session cache, computed when missing or when its inputs changed; feeds the tank scale */
  function ensure(name, force) {
    const ri = runInputs(name), k = sig(ri.key);
    let c = S.runs[name];
    if (force || !c || c.sig !== k) { c = S.runs[name] = { sig: k, out: ri.fn() }; if (name === 'EL') S.elTotalPayments = c.out.totalPayments; }
    const mx = c.out.max;
    S.refScale = Math.max(S.refScale, Math.round(0.01 * mx.prop), Math.round(0.01 * mx.debt), Math.round(0.01 * mx.sav));
    return c.out;
  }
  /** tank fill % (spec 2) */
  const fill = (x) => (S.refScale > 0 ? 100 * Math.min((+x || 0) / (S.refScale * S.scale), 1) : 0);

  /* =====================================================================================
     3. SHARED WORDING (pseudo-screen _b16_hecm: edit once with E, shows on every HECM screen)
     ===================================================================================== */
  const HS = '_b16_hecm';
  const HCOPY = {
    age: 'Age', step: 'Step', scale: 'Scale', loc1: 'LOC 1st',
    loc1On: 'When lifestyle costs more than income provides, the credit line is used first, then savings.',
    loc1Off: 'When lifestyle costs more than income provides, savings are used first, then the credit line.',
    cfAnnual: 'Annual Cash flow', cfMonthly: 'Monthly Cash flow',
    setup: 'Proposal & Household', chooseWs: 'Choose a worksheet',
    pemWait: 'The money-flow model is getting ready.',
    noData: 'The HECM figures for this illustration are being verified.',
    savOut: 'Savings run out in month', wdStop: 'Planned withdrawals stop in month',
    sumCF: 'Extra discretionary income to date:', sumCL: 'Cash-flow gain to date:',
    sumTip: 'The running total of income you no longer spend on the old mortgage payment.',
    sumTipOP: 'Freed-up income still yours to spend after the monthly savings and the extra loan payments.',
    sampleToast: 'A sample proposal is in use. Open Proposal & Household to enter this client’s figures.',
    sampleName: 'Sample Proposal', samplePurchase: 'Sample Purchase Proposal', sampleLoc: 'Sample Line of Credit Proposal',
    hecmNote: 'A HECM is a loan: the balance grows with interest and mortgage insurance, and property taxes, homeowners insurance and upkeep remain your responsibility.',
    pMortgage: 'Mortgage Assumptions', pCash: 'Cash flow Assumptions', pAssume: 'Assumptions',
    lIncome: 'Monthly Income:', lLifestyle: 'Monthly Lifestyle:',
    lPropValue: 'Property Value:', lPL: 'Principal Limit:', lLien: 'Lien Payoff:', lInitBal: 'Initial Loan Balance:', lInitLoc: 'Initial Line of Credit:',
    sSavings: 'Savings', sOptPay: 'Optional Payments',
    lMonthlySav: 'Monthly Savings:', lGrowth: 'Growth Rate:', lStart: 'Start Month:', lEnd: 'End Month:', lPayment: 'Payment:',
    chartTip: 'Show credit line chart',
    sLump: 'Lump-Sum Draw', sMonthly: 'Monthly Draw', lDrawAmt: 'Draw Amount:', lBoY: 'Beginning of Year:',
    dsLump1: 'Lump sum capped at the first-year limit of', dsLumpA: 'Lump sum capped at', dsLumpB: 'in year', dsMonthly: 'Monthly draws capped by remaining credit from month',
    gSale: 'Sale Assumptions', gPurchase: 'Purchase Assumptions',
    lProceeds: 'Proceeds From Sale:', lSavWd: 'Savings Withdrawal:', lSavContrib: 'Savings Contribution:', lPrice: 'Purchase Price:', lCashDue: 'Cash Due:',
    lMCA: 'Max Claim Amount:', lFCC: 'Financed Closing Costs:',
    warnCash: 'There is not enough money to buy this home outright.',
    warnH4P: 'There is not enough money to complete this HECM purchase.',
    chHead1: 'Each optional payment adds the same amount back to your available credit line,',
    chHead2: 'and that restored room keeps growing at the line’s growth rate.',
    chS1: 'Total optional payments', chS2: 'Added credit line from payments', chAge: 'Age', chTitle: 'Credit Line Gain',
    chNone: 'No optional payments are in this illustration yet.',
    /* worksheets */
    'ws.EL': 'Current mortgage, year by year', 'ws.HECM': 'Payoff by HECM, year by year', 'ws.EL_HECM': 'Current mortgage compared with HECM payoff',
    'ws.OP': 'HECM plus regular saving and extra payments', 'ws.EL_OP': 'Current mortgage compared with HECM plus extra payments',
    'ws.HECM_OP': 'Plain HECM compared with HECM plus saving and extra payments', 'ws.LOC': 'Credit line growth, year by year',
    'ws.DRAW': 'Credit line withdrawals, year by year', 'ws.CP': 'All-cash purchase, year by year', 'ws.H4P': 'HECM-financed purchase, year by year',
    'ws.CP_H4P': 'All cash compared with HECM financing', 'ws.H4P_OP': 'HECM purchase compared with HECM purchase plus extra payments',
    'ws.CP_OP': 'All cash compared with HECM purchase plus extra payments',
    'c.mortgage': 'Current mortgage', 'c.hecm': 'HECM payoff', 'c.op': 'HECM with extra payments', 'c.both': 'Both together',
    'c.cash': 'All cash', 'c.h4p': 'HECM purchase',
    't.EL': 'Mortgage', 't.HECM': 'HECM', 't.OP': 'HECM Plus', 't.CP': 'Cash', 'g.diff': 'Differences',
    'w.age': 'Age', 'w.year': 'Year', 'w.savContrib': 'Savings Contribution', 'w.savContribC': 'Savings Contributions to Date', 'w.savInt': 'Savings Interest',
    'w.savBal': 'Savings Balance', 'w.loanPmt': 'Loan Payments', 'w.paidSav': 'Paid From Savings', 'w.loanPmtC': 'Loan Payments to Date',
    'w.loanInt': 'Loan Interest', 'w.loanIntC': 'Loan Interest to Date', 'w.loanIM': 'Loan Interest + MIP', 'w.loanIMC': 'Loan Interest + MIP to Date',
    'w.loanBal': 'Loan Balance', 'w.loc': 'Line of Credit', 'w.prop': 'Property Value', 'w.equity': 'Equity', 'w.liq': 'Liquidity',
    'w.wd': 'Withdrawal', 'w.wdC': 'Withdrawals to Date', 'w.draw': 'Loan Draw', 'w.drawC': 'Loan Draws to Date',
    'w.locDraw': 'Credit Line Draw', 'w.locDrawC': 'Credit Line Draws to Date',
    'w.cfDiffC': 'Cash Flow Difference to Date', 'w.liqDiff': 'Liquidity Difference', 'w.wdDiffC': 'Withdrawal Difference to Date', 'w.wdDiff': 'Withdrawal Difference',
    'a.prop': 'Proposal', 'a.rate': 'Expected rate', 'a.mip': 'Annual mortgage insurance', 'a.app': 'Home appreciation', 'a.savRate': 'Savings growth', 'a.cola': 'Yearly increase',
    /* proposal and household sheet */
    'e.title': 'Proposal & Household', 'e.proposal': 'Loan Proposal', 'e.household': 'Household', 'e.pick': 'Proposal in use',
    'e.new': 'New', 'e.dup': 'Duplicate', 'e.del': 'Delete', 'e.delQ': 'Delete this proposal?', 'e.yes': 'Delete', 'e.no': 'Keep', 'e.done': 'Done',
    'e.sampleNote': 'Sample figures are showing. Change any value to start this client’s own proposal.',
    'e.saved': 'Saved to this client’s file.', 'e.newName': 'New Proposal', 'e.copyName': 'Copy',
    'e.f.ProposalName': 'Proposal name', 'e.f.ClientAge': 'Youngest borrower age', 'e.f.PropertyValue': 'Property value (purchase price on a purchase)',
    'e.f.RORAppreciation': 'Home appreciation %', 'e.f.MaximumClaim': 'Maximum claim amount', 'e.f.PrincipalLimit': 'Principal limit',
    'e.f.Advance': 'Cash at closing (negative = cash due)', 'e.f.LienPayoff': 'Lien payoff (purchase price on a purchase)',
    'e.f.FinancedClosingCosts': 'Financed closing costs', 'e.f.MortgageBalance': 'Initial loan balance', 'e.f.LOC': 'Initial line of credit',
    'e.f.LOCY1': 'First-year line of credit', 'e.f.RORLoanExpected': 'Expected rate %', 'e.f.RORLoanInitial': 'Initial rate %', 'e.f.RORMIP': 'Annual mortgage insurance %',
    'e.f.RORPrincipalLimit': 'Principal limit growth %', 'e.f.AltLOCCalc': 'Unused line grows at the initial rate plus mortgage insurance',
    'e.f.LESA': 'Life expectancy set-aside', 'e.f.LESADisbursement': 'Set-aside payment every six months',
    'e.h.homeValue': 'Current home value', 'e.h.elBalance': 'Mortgage balance', 'e.h.elPayment': 'Mortgage payment (principal and interest)', 'e.h.elRate': 'Mortgage rate %',
    'e.h.savings': 'Current savings', 'e.h.savRate': 'Savings growth %', 'e.h.income': 'Monthly income after tax', 'e.h.lifestyle': 'Monthly lifestyle spending',
    'e.h.cola': 'Yearly increase in income and lifestyle %', 'e.h.monthlyWithdrawal': 'Monthly savings withdrawal', 'e.h.paidFromSavings': 'Part of the payment paid from savings',
    'e.showCF': 'Show cash flows on the model', 'e.classic': 'When cash flows are off'
  };
  EFA.screen(HS, {
    title: 'Shared wording: HECM calculators', copy: HCOPY,
    render(ctx) { ctx.el.innerHTML = `<div class="b16-sheet">${Object.keys(HCOPY).map((k) => ctx.t(k, { tag: 'p' })).join('')}</div>`; }
  });
  const hc = (key, o) => EFA.cp(HS, key, o);
  const ht = (key) => (EFA.wording ? EFA.wording.get(HS, key, HCOPY[key]) : HCOPY[key]);

  /* =====================================================================================
     4. STYLES
     ===================================================================================== */
  EFA.css('b16', `
  .stage .b16-sheet { position: absolute; left: 110px; right: 110px; top: 60px; bottom: 80px; columns: 3; column-gap: 40px; overflow: hidden; font: 400 14px/1.4 var(--f-body); }
  .stage .b16-sheet p { margin: 0 0 8px; break-inside: avoid; }
  .stage .b16-head { position: absolute; left: 70px; right: 70px; top: 22px; margin: 0; text-align: center; font: 600 44px/1.06 var(--f-display); color: var(--navy); letter-spacing: -.005em; }
  .stage .b16-head.sm { font-size: 40px; top: 18px; }
  .stage .b16-head .b16-hl { color: var(--gold-deep); cursor: pointer; border-bottom: 2px dotted var(--gold); }
  .stage .b16-head .b16-hl:hover { color: var(--navy); }
  .stage .b16-vp { position: absolute; overflow: hidden; }
  .stage .b16-pemhost { position: absolute; }
  .stage .b16-wait { position: absolute; inset: 70px 70px 90px 90px; display: grid; place-items: center; text-align: center; border: 2px dashed var(--mist-2); border-radius: 22px; background: rgba(255,253,248,.55); }
  .stage .b16-wait p { margin: 0; max-width: 420px; font: 500 22px/1.45 var(--f-body); color: var(--muted); }
  .stage .b16-wait .ring { width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 50%; border: 3px solid var(--mist-2); border-top-color: var(--gold); }
  .stage .b16-col { position: absolute; left: 1110px; top: 82px; width: 450px; display: grid; gap: 12px; align-content: start; }
  .stage .b16-card { background: var(--paper); border: 1px solid var(--rule); border-radius: 14px; box-shadow: 0 10px 26px rgba(13,30,58,.08); }
  .stage .b16-strip { padding: 11px 16px 12px; display: grid; gap: 10px; }
  .stage .b16-agerow { display: flex; align-items: center; gap: 7px; }
  .stage .b16-cap1 { font: 700 13px/1 var(--f-body); letter-spacing: .18em; text-transform: uppercase; color: var(--gold-deep); }
  .stage .b16-agerow .b16-cap1 { margin-right: auto; }
  .stage .b16-ib { width: 40px; height: 40px; flex: 0 0 auto; border-radius: 999px; border: 1.5px solid var(--mist-2); background: #fff; color: var(--navy); display: grid; place-items: center; padding: 0; transition: border-color .2s ease, background .2s ease; }
  .stage .b16-ib:hover { border-color: var(--gold); background: var(--gold-pale); }
  .stage .b16-ib svg { display: block; }
  .stage .b16-in.b16-agein { width: 82px; text-align: center; font-size: 24px; height: 42px; }
  .stage .b16-strow { display: flex; align-items: center; gap: 16px; }
  .stage .b16-chk { display: inline-flex; align-items: center; gap: 8px; font: 600 16px/1 var(--f-body); color: var(--navy); cursor: pointer; user-select: none; }
  .stage .b16-chk input { width: 20px; height: 20px; margin: 0; accent-color: #0d1e3a; cursor: pointer; }
  .stage .b16-scale { display: flex; align-items: center; gap: 10px; flex: 1 1 auto; font: 600 16px/1 var(--f-body); color: var(--navy); }
  .stage .b16-scale input[type=range] { flex: 1 1 auto; min-width: 0; accent-color: #b8972e; cursor: pointer; }
  .stage .b16-panel { overflow: hidden; padding-bottom: 7px; }
  .stage .b16-ph { padding: 9px 16px; text-align: center; font: 700 14px/1.2 var(--f-body); letter-spacing: .16em; text-transform: uppercase; color: var(--cream); background: var(--navy); }
  .stage .b16-sub { display: flex; align-items: center; gap: 10px; padding: 10px 16px 2px; font: 700 14px/1.2 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); }
  .stage .b16-r { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 3px 16px; min-height: 38px; }
  .stage .b16-r + .b16-r { border-top: 1px solid rgba(13,30,58,.06); }
  .stage .b16-rl { font: 500 17px/1.2 var(--f-body); color: var(--navy); }
  .stage .b16-rv { font: 600 18px/1.2 var(--f-body); color: var(--navy); text-align: right; white-space: nowrap; }
  .stage .b16-r.name { padding-top: 8px; }
  .stage .b16-r.name .b16-rl { font-weight: 700; font-size: 18px; }
  .stage .b16-r.name.go .b16-rl { cursor: pointer; border-bottom: 1.5px dotted var(--gold); }
  .stage .b16-in { width: 168px; height: 36px; box-sizing: border-box; border: 1.5px solid var(--mist-2); border-radius: 9px; background: #fff; padding: 0 10px; text-align: right; font: 600 18px/1 var(--f-body); color: var(--navy); font-variant-numeric: lining-nums tabular-nums; }
  .stage .b16-in:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .stage .b16-impact { padding: 14px 18px 16px; display: grid; gap: 6px; text-align: center; }
  .stage .b16-impact .lead { font: 700 18px/1.3 var(--f-body); color: var(--navy); margin-bottom: 4px; }
  .stage .b16-impact .ln { font: 600 19px/1.3 var(--f-body); color: var(--navy); }
  .stage .b16-impact .ln .num { font-weight: 700; color: var(--gold-deep); font-size: 22px; }
  .stage .b16-st { position: absolute; z-index: 3; transform: translate(-50%, 0); width: max-content; max-width: 250px; text-align: center; font: 700 17px/1.3 var(--f-body); color: var(--navy); background: var(--paper); border: 2px solid var(--gold); border-radius: 12px; padding: 8px 14px; box-shadow: 0 8px 20px rgba(13,30,58,.16); }
  .stage .b16-sum { position: absolute; z-index: 3; display: inline-flex; align-items: baseline; gap: 12px; padding: 10px 22px; border-radius: 999px; background: var(--paper); border: 2px solid var(--gold); box-shadow: 0 10px 24px rgba(13,30,58,.14); font: 700 19px/1.2 var(--f-body); color: var(--navy); white-space: nowrap; }
  .stage .b16-sum .v { font: 700 26px/1 var(--f-body); color: var(--navy); }
  .stage .b16-sum.dstat { font-size: 17px; border-color: var(--rule); }
  .stage .b16-tipw { position: relative; }
  .stage .b16-tip { position: absolute; left: 0; bottom: calc(100% + 12px); width: 330px; white-space: normal; padding: 10px 14px; border-radius: 10px; background: var(--navy); color: var(--cream); font: 500 15px/1.4 var(--f-body); box-shadow: 0 10px 24px rgba(13,30,58,.25); opacity: 0; transform: translateY(4px); transition: opacity .25s ease, transform .25s ease; pointer-events: none; z-index: 6; text-align: left; }
  .stage .b16-tipw:hover .b16-tip, .stage .b16-tipw:focus-within .b16-tip { opacity: 1; transform: none; }
  body.editing .stage .b16-tip { opacity: 1; transform: none; position: static; margin-top: 8px; width: auto; }
  .stage .b16-loc { position: absolute; z-index: 3; display: grid; justify-items: center; gap: 6px; padding: 8px 12px 10px; border-radius: 12px; background: rgba(255,253,248,.92); border: 1px solid var(--rule); box-shadow: 0 6px 16px rgba(13,30,58,.1); }
  .stage .b16-loc .lb { font: 700 13px/1 var(--f-body); letter-spacing: .16em; text-transform: uppercase; color: var(--navy); }
  .stage .b16-loc .b16-tip { left: 50%; margin-left: -165px; }
  .stage .b16-sw { position: relative; width: 54px; height: 30px; border-radius: 999px; border: 0; padding: 0; background: var(--mist-2); transition: background .2s ease; cursor: pointer; }
  .stage .b16-sw::after { content: ""; position: absolute; left: 3px; top: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(13,30,58,.35); transition: transform .2s ease; }
  .stage .b16-sw[aria-checked="true"] { background: var(--navy); }
  .stage .b16-sw[aria-checked="true"]::after { transform: translateX(24px); background: var(--gold-lt); }
  .stage .b16-links { position: absolute; z-index: 4; left: 22px; bottom: 14px; display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: rgba(247,245,241,.9); }
  .stage .b16-links .lib-link { font-size: 17px; }
  .stage .b16-lk { display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent; padding: 4px 2px; color: var(--gold-deep); font: 600 17px/1.2 var(--f-body); cursor: pointer; }
  .stage .b16-lk > [data-cp] { border-bottom: 1.5px dotted currentColor; }
  .stage .b16-lk:hover { color: var(--navy); }
  .stage .b16-lk.muted { color: var(--muted); }
  .stage .b16-foot { position: absolute; left: 1110px; width: 450px; bottom: 64px; display: grid; gap: 8px; }
  .stage .b16-foot .st-disclaimer { margin: 0; font-size: 12.5px; line-height: 1.4; }
  .stage .b16-cfl { justify-self: start; }
  .stage .b16-warn { padding: 14px 18px; border-radius: 14px; background: #fbefec; border: 1.5px solid #b3402e; color: #9a3322; font: 700 19px/1.35 var(--f-body); text-align: center; }
  .stage .b16-warn2 { position: absolute; z-index: 3; transform: translate(-100%, 0); max-width: 300px; padding: 10px 14px; border-radius: 12px; background: #fbefec; border: 1.5px solid #b3402e; color: #9a3322; font: 700 17px/1.3 var(--f-body); text-align: center; }
  .stage .b16-cicon { display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid var(--gold); background: #fff; color: var(--navy); padding: 0; cursor: pointer; }
  .stage .b16-cicon:hover { background: var(--gold-pale); }
  /* two-scenario frame */
  .stage .b16-hdr { position: absolute; left: 0; right: 0; top: 74px; height: 76px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 24px; gap: 16px; }
  .stage .b16-cap { text-align: center; font: 700 30px/1 var(--f-body); letter-spacing: .03em; color: var(--navy); }
  .stage .b16-strip.row { display: flex; align-items: center; gap: 16px; padding: 9px 16px; }
  .stage .b16-strip.row .b16-agerow { gap: 6px; }
  .stage .b16-strip.row .b16-agerow .b16-cap1 { margin-right: 6px; }
  .stage .b16-strip.row .b16-scale { width: 190px; flex: 0 0 auto; }
  .stage .b16-divider { position: absolute; left: 798px; top: 160px; width: 4px; height: 676px; border-radius: 2px; background: var(--navy); }
  .stage .b16-pop .st-overlay-in { width: 620px; }
  .stage .b16-choose { display: grid; gap: 10px; }
  .stage .b16-choose .b16-lk { font-size: 21px; justify-content: flex-start; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--rule); background: #fff; }
  .stage .b16-choose .b16-lk:hover { border-color: var(--gold); background: var(--gold-pale); }
  /* line chart */
  .stage .b16-chart { position: absolute; }
  .stage .b16-chart svg { display: block; overflow: visible; }
  .stage .b16-legend { display: flex; justify-content: center; gap: 34px; margin-bottom: 10px; font: 700 20px/1.2 var(--f-body); color: var(--navy); }
  .stage .b16-legend span { display: inline-flex; align-items: center; gap: 10px; }
  .stage .b16-key { display: inline-block; width: 34px; height: 5px; border-radius: 3px; }
  .stage .b16-chtip { position: absolute; z-index: 5; pointer-events: none; min-width: 230px; padding: 10px 14px; border-radius: 12px; background: var(--paper); border: 1px solid var(--rule); box-shadow: 0 10px 26px rgba(13,30,58,.16); font: 500 15px/1.35 var(--f-body); color: var(--muted); transition: opacity .15s ease; }
  .stage .b16-chtip .t { font: 700 14px/1.2 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--gold-deep); margin-bottom: 6px; }
  .stage .b16-chtip .r { display: grid; grid-template-columns: 22px 1fr; gap: 2px 8px; align-items: center; }
  .stage .b16-chtip .r + .r { margin-top: 6px; }
  .stage .b16-chtip .v { grid-column: 2; font: 700 19px/1.1 var(--f-body); color: var(--navy); }
  .stage .b16-chtip .k { width: 18px; height: 4px; border-radius: 2px; }
  .stage .b16-chnone { position: absolute; z-index: 2; left: 50%; transform: translateX(-50%); padding: 12px 22px; border-radius: 999px; background: var(--paper); border: 1px solid var(--rule); font: 600 19px/1.2 var(--f-body); color: var(--navy); box-shadow: 0 8px 22px rgba(13,30,58,.1); white-space: nowrap; }
  .stage .b16-chov .st-overlay-in { width: 1440px; }
  .stage .b16-chov .st-overlay-b { padding: 18px 30px 26px; }
  .stage .b16-chh { margin: 0 0 14px; text-align: center; font: 600 30px/1.2 var(--f-display); color: var(--navy); }
  /* benefit slides */
  .stage .b16-bh { position: absolute; left: 110px; right: 110px; top: 62px; display: grid; justify-items: center; gap: 16px; text-align: center; }
  .stage .b16-blist { position: absolute; left: 50%; transform: translateX(-50%); }
  .stage .b16-bt { font: 600 31px/1.3 var(--f-body); color: var(--navy); }
  .stage .b16-bt .lib-bul-txt { padding: 18px 28px !important; }
  .stage .b16-fn { position: absolute; bottom: 74px; max-width: 1060px; margin: 0; text-align: right; }
  /* proposal and household sheet */
  .stage .b16-ed .st-overlay-in { width: 1500px; max-height: 850px; }
  .stage .b16-ed .st-overlay-b { padding: 18px 24px 20px; }
  .stage .b16-ed-grid { display: grid; grid-template-columns: 1.9fr 1fr; gap: 18px; align-items: start; }
  .stage .b16-ed-box { background: var(--cream); border: 1px solid var(--rule); border-radius: 12px; padding: 12px 16px 14px; }
  .stage .b16-ed-h { margin: 0 0 10px; font: 700 14px/1.2 var(--f-body); letter-spacing: .18em; text-transform: uppercase; color: var(--gold-deep); }
  .stage .b16-ed-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
  .stage .b16-ed-bar select { height: 38px; min-width: 300px; border: 1.5px solid var(--mist-2); border-radius: 9px; background: #fff; padding: 0 10px; font: 600 16px/1 var(--f-body); color: var(--navy); }
  .stage .b16-ed-btn { height: 38px; padding: 0 14px; border-radius: 999px; border: 1.5px solid var(--mist-2); background: #fff; font: 600 15px/1 var(--f-body); color: var(--navy); }
  .stage .b16-ed-btn:hover { border-color: var(--gold); }
  .stage .b16-ed-btn.pri { background: var(--navy); color: var(--cream); border-color: var(--navy); }
  .stage .b16-ed-note { margin: 0 0 10px; font: 500 15px/1.4 var(--f-body); color: var(--gold-deep); }
  .stage .b16-ed-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
  .stage .b16-ed-fields.one { grid-template-columns: 1fr; }
  .stage .b16-ed-f { display: grid; grid-template-columns: 1fr 172px; align-items: center; gap: 10px; }
  .stage .b16-ed-f > span { font: 500 15px/1.25 var(--f-body); color: var(--navy); }
  .stage .b16-ed-f .b16-in { width: 172px; height: 34px; font-size: 16px; }
  .stage .b16-ed-f .b16-in.txt { text-align: left; }
  .stage .b16-ed-chk { display: flex; align-items: center; gap: 10px; font: 500 15px/1.3 var(--f-body); color: var(--navy); grid-column: 1 / -1; }
  .stage .b16-ed-chk input { width: 20px; height: 20px; accent-color: #0d1e3a; }
  .stage .b16-ed-sep { grid-column: 1 / -1; margin: 6px 0 0; font: 700 12.5px/1.2 var(--f-body); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
  .stage .b16-ed-foot { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 14px; }
  .stage .b16-ed-msg { font: 500 15px/1.3 var(--f-body); color: var(--muted); }
  /* three kinds of money */
  .stage .b16-tt-pie { position: absolute; left: 150px; top: 150px; width: 720px; height: 720px; }
  .stage .b16-tt-pie svg { width: 100%; height: 100%; overflow: visible; }
  .stage .b16-tt-w { cursor: pointer; transition: transform .45s cubic-bezier(.3,.7,.3,1); }
  .stage .b16-tt-w:hover { filter: brightness(1.05); }
  .stage .b16-tt-lab { position: absolute; transform: translate(-50%, -50%); text-align: center; font: 700 44px/1.05 var(--f-body); white-space: nowrap; pointer-events: none; transition: left .45s cubic-bezier(.3,.7,.3,1), top .45s cubic-bezier(.3,.7,.3,1); }
  .stage .b16-tt-lab .nm { display: block; font-size: .62em; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 4px; }
  .stage .b16-tt-lab.sm { font-size: 30px; }
  .stage .b16-tt-ctl { position: absolute; left: 1020px; top: 300px; width: 420px; display: grid; gap: 30px; }
  .stage .b16-tt-g { padding: 18px 24px 20px; display: grid; gap: 14px; }
  .stage .b16-tt-gh { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .stage .b16-tt-gh .cap { display: inline-flex; align-items: center; gap: 12px; font: 700 18px/1.2 var(--f-body); letter-spacing: .12em; text-transform: uppercase; color: var(--navy); }
  .stage .b16-tt-gh .sw { width: 18px; height: 18px; border-radius: 5px; }
  .stage .b16-tt-gh .v { font: 700 26px/1 var(--f-body); color: var(--navy); }
  .stage .b16-tt-g input[type=range] { width: 100%; cursor: pointer; }
  `);

  /* =====================================================================================
     5. UI PIECES (frame of every calculator screen; spec section 4)
     ===================================================================================== */
  const fm = () => EFA.fmt;
  const money = (v, dp) => fm().money(v, { dp: dp || 0 });
  const has = (lib, fn) => !!(EFA.lib && EFA.lib[lib] && typeof EFA.lib[lib][fn] === 'function');
  const num = (v) => `<span class="num">${v}</span>`;
  const pctTxt = (v) => { const s = (+v || 0).toFixed(3).replace(/0$/, ''); return s + '%'; };
  const ICO = {
    first: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 5v14"/><path d="M18 5l-8 7 8 7"/></svg>',
    prev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    last: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 5v14"/><path d="M6 5l8 7-8 7"/></svg>',
    chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v16h16"/><path d="M7 15l4-4 3 3 5-6"/></svg>',
    gear: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
    sheet: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M4 9h16M4 14.5h16M10 9v11.5"/></svg>'
  };

  /* ----- inputs: compact fields that commit on blur or Enter ----- */
  const IN_FMT = {
    money2: (v) => money(v, 2), money0: (v) => money(v, 0), int: (v) => fm().int(v), pct: (v) => pctTxt(v), text: (v) => (v == null ? '' : String(v))
  };
  function inputHTML(id, type, value, cls) {
    const v = IN_FMT[type] ? IN_FMT[type](value) : String(value);
    return `<input class="b16-in${cls ? ' ' + cls : ''}" data-in="${id}" data-type="${type}" value="${EFA.util.esc(v)}" inputmode="${type === 'text' ? 'text' : 'decimal'}" autocomplete="off" spellcheck="false">`;
  }
  /** parse what was typed: digits and '.', a leading minus or "$-" makes it negative */
  function parseIn(s, type) {
    if (type === 'text') return String(s || '').trim();
    const t = String(s || '').trim(), neg = /^(\$?\s*[-−–]|[-−–]\s*\$)/.test(t);
    const d = t.replace(/[^0-9.]/g, '');
    if (!d || d === '.') return NaN;
    let v = parseFloat(d);
    if (!isFinite(v)) return NaN;
    if (neg) v = -v;
    if (type === 'money2') v = r2(v); else if (type === 'money0' || type === 'int') v = Math.round(v); else if (type === 'pct') v = Math.round(v * 1000) / 1000;
    return v;
  }
  /** wire inputs: spec = { id: { type, get(), set(v), min, max, liveMax } } */
  function bindInputs(ctx, spec, root) {
    (root ? Array.from(root.querySelectorAll('[data-in]')) : ctx.$$('[data-in]')).forEach((inp) => {
      const id = inp.dataset.in, d = spec[id]; if (!d) return;
      const type = inp.dataset.type;
      const show = () => { inp.value = IN_FMT[type] ? IN_FMT[type](d.get()) : String(d.get()); };
      inp.addEventListener('focus', () => { const v = d.get(); inp.value = type === 'text' ? (v || '') : (v == null ? '' : String(+(+v).toFixed(type === 'pct' ? 3 : 2))); inp.select(); });
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') { show(); inp.blur(); } });
      if (d.liveMax != null || d.liveMin != null) {
        inp.addEventListener('input', () => {
          const v = parseIn(inp.value, type); if (!isFinite(v)) return;
          const mx = typeof d.liveMax === 'function' ? d.liveMax() : d.liveMax, mn = typeof d.liveMin === 'function' ? d.liveMin() : d.liveMin;
          if (mx != null && v > mx) inp.value = String(mx);
          if (mn != null && v < mn && String(inp.value).length >= String(mn).length) inp.value = String(mn);
        });
      }
      inp.addEventListener('blur', () => {
        let v = parseIn(inp.value, type);
        if (type !== 'text' && !isFinite(v)) { show(); return; }
        const mn = typeof d.min === 'function' ? d.min() : d.min, mx = typeof d.max === 'function' ? d.max() : d.max;
        if (type !== 'text') { if (mn != null) v = Math.max(mn, v); if (mx != null) v = Math.min(mx, v); }
        const changed = v !== d.get();
        if (changed) d.set(v);
        show();
        if (changed && d.after) d.after(v);
      });
    });
  }

  /* ----- rows and panels ----- */
  const rowHTML = (label, value, cls) => `<div class="b16-r${cls ? ' ' + cls : ''}"><span class="b16-rl">${label}</span><span class="b16-rv">${value}</span></div>`;
  const panelHTML = (head, body, cls) => `<div class="b16-card b16-panel${cls ? ' ' + cls : ''}">${head ? `<div class="b16-ph">${head}</div>` : ''}${body}</div>`;
  const subHTML = (label, extra) => `<div class="b16-sub">${label}${extra || ''}</div>`;
  /** proposal name row: bold, opens the Proposal & Household sheet */
  const nameRow = (p) => `<div class="b16-r name go" data-setup="1"><span class="b16-rl">${p.sample ? hc(p.sample === 'purchase' ? 'samplePurchase' : (p.sample === 'loc' ? 'sampleLoc' : 'sampleName')) : EFA.util.esc(p.ProposalName || ht('e.newName'))}</span></div>`;

  /* ----- the control strip (spec 4.3) ----- */
  function stripHTML(row) {
    return `<div class="b16-card b16-strip${row ? ' row' : ''}">
      <div class="b16-agerow">${hc('age', { cls: 'b16-cap1' })}
        <button type="button" class="b16-ib" data-age="first" aria-label="First year">${ICO.first}</button>
        <button type="button" class="b16-ib" data-age="prev" aria-label="Back one year">${ICO.prev}</button>
        <input class="b16-in b16-agein" data-agein="1" inputmode="numeric" autocomplete="off" value="">
        <button type="button" class="b16-ib" data-age="next" aria-label="Forward one year">${ICO.next}</button>
        <button type="button" class="b16-ib" data-age="last" aria-label="Last year">${ICO.last}</button>
      </div>
      <div class="b16-strow">
        <label class="b16-chk"><input type="checkbox" data-autostep="1">${hc('step')}</label>
        <label class="b16-scale">${hc('scale')}<input type="range" min="1" max="200" step="1" value="${S.scale}" data-scale="1" aria-label="Tank scale"></label>
      </div>
    </div>`;
  }
  /** age state for one screen visit: k = row index; paint(k, ms) redraws. Returns {k, set(k), stop()} */
  function wireStrip(ctx, st, paint) {
    const inp = ctx.$('[data-agein]');
    const N = () => S.maxYear;
    const show = () => { if (inp && document.activeElement !== inp) inp.value = String(S.startAge + st.k); };
    st.set = (k, ms) => { st.k = Math.max(0, Math.min(N(), Math.round(k))); show(); paint(st.k, ms == null ? 450 : ms); };
    ctx.on(ctx.$$('[data-age]'), 'click', (e, b) => {
      const a = b.dataset.age;
      st.set(a === 'first' ? 0 : a === 'last' ? N() : st.k + (a === 'next' ? 1 : -1));
    });
    if (inp) {
      inp.addEventListener('focus', () => inp.select());
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
      inp.addEventListener('blur', () => { const v = parseInt(String(inp.value).replace(/[^0-9]/g, ''), 10); if (isFinite(v)) st.set(v - S.startAge); else show(); });
    }
    const chk = ctx.$('[data-autostep]');
    const tick = () => {
      if (!chk || !chk.checked) return;
      if (st.k >= N()) { chk.checked = false; return; }
      st.set(st.k + 1, 420);
      st.timer = ctx.timeout(tick, 500);
    };
    if (chk) chk.addEventListener('change', () => { if (chk.checked) { if (st.k >= N()) st.set(0, 0); st.timer = ctx.timeout(tick, 500); } else if (st.timer) { clearTimeout(st.timer); st.timer = null; } });
    const sc = ctx.$('[data-scale]');
    if (sc) sc.addEventListener('input', () => { S.scale = Math.max(1, Math.min(200, +sc.value || 100)); paint(st.k, 0); });
    show();
  }

  /* ----- the money-flow model in a cropped viewport (spec 4.1 / 4.2) ----- */
  const EM = 1600 / 67;                       // stage px per model em (the original's 16:9 stage is 67em wide)
  const PEM_FIXED = { labels: false, scenarioPicker: false, links: false, rip: false, investments: true, lifestyleStrip: false, futureFill: false,
    showBorrowed: true, borrowSource: false, showHouse: true, collateral: 'house', debtService: false, sliders: false, chevrons: false, tankLinks: false };
  function mountPem(ctx, host, scale, loc) {
    if (!host) return null;
    const em = EM * (scale || 1);
    host.style.width = (67 * em) + 'px'; host.style.height = (36.5 * em) + 'px';
    if (!has('pem', 'mount')) {
      host.parentNode.insertAdjacentHTML('beforeend', `<div class="b16-wait"><div><div class="ring"></div>${hc('pemWait', { tag: 'p' })}</div></div>`);
      return null;
    }
    try { return EFA.lib.pem.mount(ctx, host, Object.assign({}, PEM_FIXED, { em, pad: [0, 0, 0, 0], align: 'top', loc: !!loc })); }
    catch (e) { console.error(e); host.parentNode.insertAdjacentHTML('beforeend', `<div class="b16-wait"><div><div class="ring"></div>${hc('pemWait', { tag: 'p' })}</div></div>`); return null; }
  }
  /** the PEM inputs for one projection row (spec 4.4). o: {kind:'EL'|'HECM'|'CP', monthly, cf, loanPmt:'el'|'hecm'|'draw'|'zero',
      contribAlways, noContrib, liqFloor, locFloor} */
  function feed(row, k, o) {
    const div = o.monthly ? 12 : 1, cf = o.cf;
    const f = {
      safeBalance: row.SavingBalance, safe: fill(row.SavingBalance),
      bfBalance: row.LoanBalance, borrow: fill(row.LoanBalance),
      houseBalance: row.PropertyValue, house: fill(row.PropertyValue), houseEquity: row.Equity,
      liquidity: o.kind === 'EL' ? Math.max(0.01, row.SavingBalance) : (o.liqFloor ? Math.max(0.01, row.Liquidity) : row.Liquidity),
      regulator: k === 0 ? 100 : row.LSRegulatorValue, remaining: row.LSRemainingValue, loc: o.kind === 'HECM'
    };
    if (o.kind === 'HECM') { f.creditBalance = o.locFloor ? Math.max(0.01, row.LOC) : row.LOC; f.creditLine = fill(row.LOC + row.LoanBalance); }
    else if (o.kind === 'CP') { f.bfBalance = 0; f.borrow = 0; f.creditBalance = 0.01; f.creditLine = 0; }
    else { f.creditBalance = 0; f.creditLine = 0; }
    let lp = 0;
    if (o.loanPmt === 'el') lp = row.LoanPaymentsA / div;
    else if (o.loanPmt === 'hecm') lp = (row.LoanPaymentsA - row.LoanDrawA) / div;
    else if (o.loanPmt === 'draw') lp = Math.round(-row.LoanDrawA / div);
    const on = (v) => (cf ? Math.round(v) : 0);
    Object.assign(f, {
      inflow: on(row.Inflow / div), outflow: on(row.Outflow / div), lifestyle: on(row.Lifestyle / div), withdrawal: on(row.WithdrawalA / div), loanPmt: on(lp),
      contribution: o.noContrib ? 0 : ((cf || o.contribAlways) ? Math.round(row.SavingContribution / div) : 0)
    });
    ['safeBalance', 'bfBalance', 'houseBalance', 'houseEquity', 'liquidity', 'creditBalance'].forEach((key) => { if (Math.abs(f[key]) >= 1) f[key] = Math.round(f[key]); });
    return f;
  }
  function setPem(pem, f, ms) { if (!pem) return; try { pem.set(f, { ms: ms == null ? 450 : ms }); } catch (e) { console.error(e); } }
  /** a part's box in stage px, or null */
  function partRect(pem, part) { try { const r = pem && pem.rect ? pem.rect(part) : null; return r && isFinite(r.x) && r.w > 0 ? r : null; } catch (e) { return null; } }

  /* ----- status, summary and messages ----- */
  function statusHTML(st) {
    if (!st) return '';
    if (st.kind === 'savOut') return `${hc('savOut')} ${num(st.month)}`;
    if (st.kind === 'wdStop') return `${hc('wdStop')} ${num(st.month)}`;
    if (st.kind === 'lumpY1') return `${hc('dsLump1')} ${num(money(st.amount, 2))}`;
    if (st.kind === 'lumpY') return `${hc('dsLumpA')} ${num(money(st.amount, 2))} ${hc('dsLumpB')} ${num(st.year)}`;
    if (st.kind === 'monthlyCap') return `${hc('dsMonthly')} ${num(st.month)}`;
    return '';
  }
  /** place a status box over a side's savings tank base */
  function placeStatus(el, pem, fb) {
    const r = partRect(pem, 'safe');
    const x = r ? r.x + r.w / 2 : fb[0], y = r ? Math.min(r.y + r.h * 0.58, 760) : fb[1];
    el.style.left = x + 'px'; el.style.top = y + 'px';
  }
  function setStatusBox(ctx, el, st) {
    if (!el) return;
    const html = statusHTML(st);
    if (html) { el.innerHTML = html; if (EFA.edit && EFA.edit.on) EFA.edit.arm(el); else EFA.numify(el); }
    ctx.show(el, !!html);
  }
  const sumLabel = () => hc(showCF() ? 'sumCF' : 'sumCL');
  function summaryHTML(tipKey) {
    return `<span class="b16-tipw">${sumLabel()}<span class="b16-tip">${hc(tipKey || 'sumTip')}</span></span><span class="v num" data-sumv="1"></span>`;
  }

  /* ----- toggles: LOC 1st, Annual / Monthly ----- */
  function locSwitchHTML() {
    return `<div class="b16-loc" data-locw="1"><span class="b16-tipw" style="display:grid;justify-items:center;gap:6px">${hc('loc1', { cls: 'lb' })}
      <button type="button" class="b16-sw" role="switch" aria-checked="${S.locFirst}" data-locsw="1" aria-label="Line of credit first"></button>
      <span class="b16-tip"><span data-loctip="on" ${S.locFirst ? '' : 'hidden'}>${hc('loc1On')}</span><span data-loctip="off" ${S.locFirst ? 'hidden' : ''}>${hc('loc1Off')}</span></span></span></div>`;
  }
  function wireLocSwitch(ctx, onChange) {
    const b = ctx.$('[data-locsw]'); if (!b) return;
    ctx.on(b, 'click', () => {
      S.locFirst = !S.locFirst; b.setAttribute('aria-checked', S.locFirst);
      ctx.$$('[data-loctip]').forEach((n) => { n.hidden = (n.dataset.loctip === 'on') !== S.locFirst; });
      onChange();
    });
  }
  const cfLinkHTML = (monthly) => (showCF() ? `<button type="button" class="b16-lk b16-cfl" data-cf="1">${hc(monthly ? 'cfMonthly' : 'cfAnnual')}</button>` : '');
  function wireCfLink(ctx, st, paint) {
    const b = ctx.$('[data-cf]'); if (!b) return;
    ctx.on(b, 'click', () => { st.monthly = !st.monthly; b.innerHTML = hc(st.monthly ? 'cfMonthly' : 'cfAnnual'); if (EFA.edit && EFA.edit.on) EFA.edit.arm(b); paint(st.k, 300); });
  }

  /* ----- bottom-left links: Documentation and the Proposal & Household sheet ----- */
  function docsButtonHTML(ctx, data) {
    if (has('worksheet', 'button')) { try { return EFA.lib.worksheet.button(ctx, { data, look: 'link' }); } catch (e) { console.error(e); } }
    return `<span class="b16-lk muted">${ICO.sheet}${EFA.cp('_lib_worksheet', 'open')}</span>`;
  }
  /** the original's two-scenario chooser: a small modal listing worksheets */
  function docsChooserHTML() { return `<button type="button" class="b16-lk" data-docs="1">${ICO.sheet}${EFA.cp('_lib_worksheet', 'open')}</button>`; }
  function wireDocsChooser(ctx, items) {
    ctx.on(ctx.$('[data-docs]'), 'click', () => {
      const ov = ctx.overlay({ title: `<span data-serif>${hc('chooseWs')}</span>`, cls: 'b16-pop', html: `<div class="b16-choose">${items.map((it, i) => `<button type="button" class="b16-lk" data-wsi="${i}">${ICO.sheet}${hc(it.key)}</button>`).join('')}</div>` });
      Array.from(ov.querySelectorAll('[data-wsi]')).forEach((b) => b.addEventListener('click', () => {
        if (EFA.edit && EFA.edit.on) return;
        const it = items[+b.dataset.wsi]; ov.close();
        if (has('worksheet', 'open')) { try { EFA.lib.worksheet.open(ctx, it.data()); } catch (e) { console.error(e); } }
      }));
    });
  }
  const setupLinkHTML = () => `<button type="button" class="b16-lk" data-setup="1">${ICO.gear}${hc('setup')}</button>`;
  function wireSetup(ctx) { ctx.on(ctx.$$('[data-setup]'), 'click', () => openSetup(ctx)); }
  function footHTML(o) {
    const disc = has('disclosure', 'line') ? EFA.lib.disclosure.line('hypothetical') : '';
    return `<div class="b16-foot"${o && o.style ? ` style="${o.style}"` : ''}>${o && o.cf != null ? cfLinkHTML(o.cf) : ''}${disc}<p class="st-disclaimer">${hc('hecmNote')}</p></div>`;
  }
  function sampleNotice() {
    if (S.sampleToast || !S.p || !S.p.sample) return;
    S.sampleToast = true;
    setTimeout(() => EFA.toast(ht('sampleToast'), 4200), 400);
  }
  /** shown instead of a calculator when the HECM figures are missing */
  function noDataScreen(ctx, head) {
    ctx.el.innerHTML = `<h1 class="b16-head">${head}</h1><div class="b16-wait" style="inset:180px 260px 200px"><div><div class="ring"></div>${hc('noData', { tag: 'p' })}</div></div>
      <div class="b16-links">${setupLinkHTML()}</div>`;
    wireSetup(ctx);
  }

  /* =====================================================================================
     6. DOCUMENTATION WORKSHEETS (spec section 5)
     ===================================================================================== */
  const col = (p, l, v, t, g) => ({ p, l, v, t: t || 'money', g });
  /** build a worksheet object for EFA.lib.worksheet from column specs over n rows */
  function sheet(titleKey, cols, n, groups) {
    const columns = cols.map((c, i) => ({ field: 'c' + i, header: c.p ? `${hc(c.p)} ${hc(c.l)}` : hc(c.l), type: c.t, dp: 0, group: c.g, width: c.t === 'age' || c.t === 'year' ? 70 : undefined }));
    const rows = [];
    for (let k = 0; k < n; k++) { const o = {}; cols.forEach((c, i) => { const v = c.v(k); o['c' + i] = c.t === 'money' ? Math.round(v) : v; }); rows.push(o); }
    const p = S.p || {}, hh = S.hh || {};
    const pname = p.sample ? ht(p.sample === 'purchase' ? 'samplePurchase' : (p.sample === 'loc' ? 'sampleLoc' : 'sampleName')) : (p.ProposalName || ht('e.newName'));
    return {
      heading: hc(titleKey), size: 'full', columns, rows, filter: 'c0',
      groups: groups || undefined,
      assumptions: [
        { label: hc('a.prop'), value: EFA.util.esc(pname) },
        { label: hc('a.rate'), value: pctTxt(p.RORLoanExpected) },
        { label: hc('a.mip'), value: pctTxt(p.RORMIP) },
        { label: hc('a.app'), value: pctTxt(p.RORAppreciation) },
        { label: hc('a.savRate'), value: pctTxt(hh.savRate) },
        { label: hc('a.cola'), value: pctTxt(hh.cola) }
      ],
      disclosures: ['hypothetical', 'license']
    };
  }
  const R = (run) => (k) => run.rows[k] || run.rows[run.rows.length - 1];
  const AGE = (run) => col(null, 'w.age', (k) => R(run)(k).Age, 'age');
  const YEAR = () => col(null, 'w.year', (k) => k, 'year');
  const WS = {
    EL(el) {
      const r = R(el);
      return sheet('ws.EL', [AGE(el), col(null, 'w.savContrib', () => 0), col(null, 'w.savInt', (k) => r(k).SavingInterest), col(null, 'w.savBal', (k) => r(k).SavingBalance),
        col(null, 'w.loanPmt', (k) => r(k).LoanPaymentsA), col(null, 'w.paidSav', (k) => r(k).LoanPaymentsA - r(k).PaidFromInflowA), col(null, 'w.loanPmtC', (k) => r(k).LoanPaymentsC),
        col(null, 'w.loanInt', (k) => r(k).LoanInterest), col(null, 'w.loanIntC', (k) => r(k).LoanInterestC), col(null, 'w.loanBal', (k) => r(k).LoanBalance),
        col(null, 'w.loc', () => 0), col(null, 'w.prop', (k) => r(k).PropertyValue), col(null, 'w.equity', (k) => r(k).Equity), col(null, 'w.liq', (k) => r(k).SavingBalance),
        col(null, 'w.wdC', (k) => r(k).WithdrawalC), YEAR()], el.rows.length);
    },
    HECM(h, el) {
      const r = R(h), e = R(el);
      return sheet('ws.HECM', [AGE(h), col(null, 'w.savContrib', () => 0), col(null, 'w.savInt', (k) => r(k).SavingInterest), col(null, 'w.savBal', (k) => r(k).SavingBalance),
        col(null, 'w.draw', (k) => r(k).LoanDrawA), col(null, 'w.drawC', (k) => r(k).LoanDrawC), col(null, 'w.loanPmt', (k) => r(k).LoanPaymentsA), col(null, 'w.loanPmtC', (k) => r(k).LoanPaymentsC),
        col(null, 'w.loanIM', (k) => r(k).LoanInterest), col(null, 'w.loanIMC', (k) => r(k).LoanInterestC), col(null, 'w.loanBal', (k) => r(k).LoanBalance),
        col(null, 'w.loc', (k) => r(k).LOC), col(null, 'w.prop', (k) => r(k).PropertyValue), col(null, 'w.equity', (k) => r(k).Equity), col(null, 'w.liq', (k) => r(k).Liquidity),
        col(null, 'w.wd', (k) => r(k).WithdrawalA), col(null, 'w.wdC', (k) => r(k).WithdrawalC), col(null, 'w.cfDiffC', (k) => e(k).PaidFromInflowC), YEAR()], h.rows.length);
    },
    elCols(el) {
      const e = R(el);
      return [col('t.EL', 'w.savBal', (k) => e(k).SavingBalance, 'money', 'a'), col('t.EL', 'w.loanPmtC', (k) => e(k).LoanPaymentsC, 'money', 'a'), col('t.EL', 'w.loanInt', (k) => e(k).LoanInterest, 'money', 'a'),
        col('t.EL', 'w.loanIntC', (k) => e(k).LoanInterestC, 'money', 'a'), col('t.EL', 'w.loanBal', (k) => e(k).LoanBalance, 'money', 'a'), col('t.EL', 'w.loc', () => 0, 'money', 'a'),
        col('t.EL', 'w.equity', (k) => e(k).Equity, 'money', 'a'), col('t.EL', 'w.liq', (k) => e(k).SavingBalance, 'money', 'a')];
    },
    EL_HECM(el, h) {
      const e = R(el), r = R(h);
      return sheet('ws.EL_HECM', [AGE(el)].concat(WS.elCols(el), [
        col('t.HECM', 'w.savBal', (k) => r(k).SavingBalance, 'money', 'b'), col('t.HECM', 'w.drawC', (k) => r(k).LoanDrawC, 'money', 'b'), col('t.HECM', 'w.loanPmtC', (k) => r(k).LoanPaymentsC, 'money', 'b'),
        col('t.HECM', 'w.loanIM', (k) => r(k).LoanInterest, 'money', 'b'), col('t.HECM', 'w.loanIMC', (k) => r(k).LoanInterestC, 'money', 'b'), col('t.HECM', 'w.loanBal', (k) => r(k).LoanBalance, 'money', 'b'),
        col('t.HECM', 'w.loc', (k) => r(k).LOC, 'money', 'b'), col('t.HECM', 'w.equity', (k) => r(k).Equity, 'money', 'b'), col('t.HECM', 'w.liq', (k) => r(k).Liquidity, 'money', 'b'),
        col(null, 'w.liqDiff', (k) => r(k).Liquidity - e(k).SavingBalance, 'money', 'd'), col(null, 'w.cfDiffC', (k) => e(k).PaidFromInflowC, 'money', 'd'),
        col(null, 'w.wdDiffC', (k) => r(k).WithdrawalC - e(k).WithdrawalC, 'money', 'd'), YEAR()]), el.rows.length, groups3('t.EL', 't.HECM'));
    },
    OP(op) {
      const r = R(op);
      return sheet('ws.OP', [AGE(op), col(null, 'w.savContrib', (k) => r(k).SavingContribution), col(null, 'w.savInt', (k) => r(k).SavingInterest), col(null, 'w.savBal', (k) => r(k).SavingBalance),
        col(null, 'w.draw', (k) => r(k).LoanDrawA), col(null, 'w.drawC', (k) => r(k).LoanDrawC), col(null, 'w.loanPmt', (k) => r(k).LoanPaymentsA), col(null, 'w.loanPmtC', (k) => r(k).LoanPaymentsC),
        col(null, 'w.loanIM', (k) => r(k).LoanInterest), col(null, 'w.loanIMC', (k) => r(k).LoanInterestC), col(null, 'w.loanBal', (k) => r(k).LoanBalance), col(null, 'w.loc', (k) => r(k).LOC),
        col(null, 'w.prop', (k) => r(k).PropertyValue), col(null, 'w.equity', (k) => r(k).Equity), col(null, 'w.liq', (k) => r(k).Liquidity), col(null, 'w.wd', (k) => r(k).WithdrawalA),
        col(null, 'w.wdC', (k) => r(k).WithdrawalC), YEAR()], op.rows.length);
    },
    opCols(op, g) {
      const o = R(op);
      return [col('t.OP', 'w.savContribC', (k) => o(k).SavingContributionC, 'money', g), col('t.OP', 'w.savBal', (k) => o(k).SavingBalance, 'money', g)];
    },
    opTail(op, g) {
      const o = R(op);
      return [col('t.OP', 'w.loanPmtC', (k) => o(k).LoanPaymentsC, 'money', g), col('t.OP', 'w.loanIM', (k) => o(k).LoanInterest, 'money', g), col('t.OP', 'w.loanIMC', (k) => o(k).LoanInterestC, 'money', g),
        col('t.OP', 'w.loanBal', (k) => o(k).LoanBalance, 'money', g), col('t.OP', 'w.loc', (k) => o(k).LOC, 'money', g), col('t.OP', 'w.equity', (k) => o(k).Equity, 'money', g), col('t.OP', 'w.liq', (k) => o(k).Liquidity, 'money', g)];
    },
    opDiff(el, op, g) {
      const e = R(el), o = R(op);
      return [col(null, 'w.liqDiff', (k) => o(k).Liquidity - e(k).SavingBalance, 'money', g),
        col(null, 'w.cfDiffC', (k) => e(k).PaidFromInflowC - o(k).LoanPaymentsC - o(k).SavingContributionC, 'money', g),
        col(null, 'w.wdDiffC', (k) => o(k).WithdrawalC - e(k).WithdrawalC, 'money', g)];
    },
    EL_OP(el, op) {
      return sheet('ws.EL_OP', [AGE(el)].concat(WS.elCols(el), WS.opCols(op, 'b'), WS.opTail(op, 'b'), WS.opDiff(el, op, 'd'), [YEAR()]), el.rows.length, groups3('t.EL', 't.OP'));
    },
    hecmCols(h, g) {
      const r = R(h);
      return [col('t.HECM', 'w.savBal', (k) => r(k).SavingBalance, 'money', g), col('t.HECM', 'w.drawC', (k) => r(k).LoanDrawC, 'money', g), col('t.HECM', 'w.loanPmtC', (k) => r(k).LoanPaymentsC, 'money', g),
        col('t.HECM', 'w.loanIM', (k) => r(k).LoanInterest, 'money', g), col('t.HECM', 'w.loanIMC', (k) => r(k).LoanInterestC, 'money', g), col('t.HECM', 'w.loanBal', (k) => r(k).LoanBalance, 'money', g),
        col('t.HECM', 'w.loc', (k) => r(k).LOC, 'money', g), col('t.HECM', 'w.equity', (k) => r(k).Equity, 'money', g), col('t.HECM', 'w.liq', (k) => r(k).Liquidity, 'money', g)];
    },
    opMid(op, g) {
      const o = R(op);
      return [col('t.OP', 'w.savContribC', (k) => o(k).SavingContributionC, 'money', g), col('t.OP', 'w.savBal', (k) => o(k).SavingBalance, 'money', g), col('t.OP', 'w.drawC', (k) => o(k).LoanDrawC, 'money', g)]
        .concat(WS.opTail(op, g));
    },
    HECM_OP(h, op, el) {
      const r = R(h), e = R(el);
      const hd = [col('t.HECM', 'w.liqDiff', (k) => r(k).Liquidity - e(k).SavingBalance, 'money', 'd'), col('t.HECM', 'w.cfDiffC', (k) => e(k).PaidFromInflowC - r(k).LoanPaymentsC, 'money', 'd'),
        col('t.HECM', 'w.wdDiffC', (k) => r(k).WithdrawalC - e(k).WithdrawalC, 'money', 'd')];
      const od = WS.opDiff(el, op, 'd').map((c) => Object.assign(c, { p: 't.OP' }));
      return sheet('ws.HECM_OP', [AGE(h)].concat(WS.hecmCols(h, 'a'), WS.opMid(op, 'b'), hd, od, [YEAR()]), h.rows.length, groups3('t.HECM', 't.OP'));
    },
    LOC(h) {
      const r = R(h);
      return sheet('ws.LOC', [AGE(h), col(null, 'w.savContrib', () => 0), col(null, 'w.savInt', (k) => r(k).SavingInterest), col(null, 'w.savBal', (k) => r(k).SavingBalance),
        col(null, 'w.draw', (k) => r(k).LoanDrawA), col(null, 'w.drawC', (k) => r(k).LoanDrawC), col(null, 'w.loanIM', (k) => r(k).LoanInterest), col(null, 'w.loanIMC', (k) => r(k).LoanInterestC),
        col(null, 'w.loanBal', (k) => r(k).LoanBalance), col(null, 'w.loc', (k) => r(k).LOC), col(null, 'w.prop', (k) => r(k).PropertyValue), col(null, 'w.equity', (k) => r(k).Equity),
        col(null, 'w.liq', (k) => r(k).Liquidity), col(null, 'w.wd', (k) => r(k).WithdrawalA), col(null, 'w.wdC', (k) => r(k).WithdrawalC), YEAR()], h.rows.length);
    },
    DRAW(d) {
      const r = R(d);
      return sheet('ws.DRAW', [AGE(d), col(null, 'w.savInt', (k) => r(k).SavingInterest), col(null, 'w.savBal', (k) => r(k).SavingBalance),
        col(null, 'w.locDraw', (k) => r(k).LoanDrawA), col(null, 'w.locDrawC', (k) => r(k).LoanDrawC), col(null, 'w.loanIM', (k) => r(k).LoanInterest), col(null, 'w.loanIMC', (k) => r(k).LoanInterestC),
        col(null, 'w.loanBal', (k) => r(k).LoanBalance), col(null, 'w.loc', (k) => r(k).LOC), col(null, 'w.prop', (k) => r(k).PropertyValue), col(null, 'w.equity', (k) => r(k).Equity),
        col(null, 'w.liq', (k) => r(k).Liquidity), col(null, 'w.wd', (k) => r(k).WithdrawalA), col(null, 'w.wdC', (k) => r(k).WithdrawalC), YEAR()], d.rows.length);
    },
    CP(cp) {
      const r = R(cp);
      return sheet('ws.CP', [AGE(cp), col(null, 'w.savContrib', (k) => r(k).SavingContribution), col(null, 'w.savInt', (k) => r(k).SavingInterest), col(null, 'w.savBal', (k) => r(k).SavingBalance),
        col(null, 'w.loc', () => 0), col(null, 'w.prop', (k) => r(k).PropertyValue), col(null, 'w.equity', (k) => r(k).Equity), col(null, 'w.liq', (k) => r(k).SavingBalance),
        col(null, 'w.wdC', (k) => r(k).WithdrawalC), YEAR()], cp.rows.length);
    },
    H4P(h) {
      const r = R(h);
      return sheet('ws.H4P', [AGE(h), col(null, 'w.savContrib', (k) => r(k).SavingContribution), col(null, 'w.savInt', (k) => r(k).SavingInterest), col(null, 'w.savBal', (k) => r(k).SavingBalance),
        col(null, 'w.locDraw', (k) => r(k).LoanDrawA), col(null, 'w.locDrawC', (k) => r(k).LoanDrawC), col(null, 'w.loanIM', (k) => r(k).LoanInterest), col(null, 'w.loanIMC', (k) => r(k).LoanInterestC),
        col(null, 'w.loanBal', (k) => r(k).LoanBalance), col(null, 'w.loc', (k) => r(k).LOC), col(null, 'w.prop', (k) => r(k).PropertyValue), col(null, 'w.equity', (k) => r(k).Equity),
        col(null, 'w.liq', (k) => r(k).Liquidity), col(null, 'w.wd', (k) => r(k).WithdrawalA), col(null, 'w.wdC', (k) => r(k).WithdrawalC), YEAR()], h.rows.length);
    },
    CP_H4P(cp, h) {
      const c = R(cp), r = R(h);
      return sheet('ws.CP_H4P', [AGE(cp), col('t.CP', 'w.savInt', (k) => c(k).SavingInterest, 'money', 'a'), col('t.CP', 'w.savBal', (k) => c(k).SavingBalance, 'money', 'a'),
        col('t.CP', 'w.equity', (k) => c(k).Equity, 'money', 'a'), col('t.CP', 'w.liq', (k) => c(k).Liquidity, 'money', 'a'),
        col('t.HECM', 'w.savInt', (k) => r(k).SavingInterest, 'money', 'b'), col('t.HECM', 'w.savBal', (k) => r(k).SavingBalance, 'money', 'b'), col('t.HECM', 'w.locDrawC', (k) => r(k).LoanDrawC, 'money', 'b'),
        col('t.HECM', 'w.loanIM', (k) => r(k).LoanInterest, 'money', 'b'), col('t.HECM', 'w.loanIMC', (k) => r(k).LoanInterestC, 'money', 'b'), col('t.HECM', 'w.loanBal', (k) => r(k).LoanBalance, 'money', 'b'),
        col('t.HECM', 'w.loc', (k) => r(k).LOC, 'money', 'b'), col('t.HECM', 'w.equity', (k) => r(k).Equity, 'money', 'b'), col('t.HECM', 'w.liq', (k) => r(k).Liquidity, 'money', 'b'),
        col(null, 'w.liqDiff', (k) => r(k).Liquidity - c(k).Liquidity, 'money', 'd'), col(null, 'w.wdDiff', (k) => r(k).WithdrawalC - c(k).WithdrawalC, 'money', 'd'), YEAR()], cp.rows.length, groups3('t.CP', 't.HECM'));
    },
    H4P_OP(h, op) {
      return sheet('ws.H4P_OP', [AGE(h)].concat(WS.hecmCols(h, 'a'), WS.opMid(op, 'b'), [YEAR()]), h.rows.length, groups3('t.HECM', 't.OP', true));
    },
    CP_OP(cp, op) {
      const c = R(cp);
      return sheet('ws.CP_OP', [AGE(cp), col('t.CP', 'w.savContrib', (k) => c(k).SavingContribution, 'money', 'a'), col('t.CP', 'w.savInt', (k) => c(k).SavingInterest, 'money', 'a'),
        col('t.CP', 'w.savBal', (k) => c(k).SavingBalance, 'money', 'a'), col('t.CP', 'w.loc', () => 0, 'money', 'a'), col('t.CP', 'w.equity', (k) => c(k).Equity, 'money', 'a'),
        col('t.CP', 'w.liq', (k) => c(k).SavingBalance, 'money', 'a'), col('t.CP', 'w.wdC', (k) => c(k).WithdrawalC, 'money', 'a')].concat(WS.opCols(op, 'b'), WS.opTail(op, 'b'), [YEAR()]),
        cp.rows.length, groups3('t.CP', 't.OP', true));
    }
  };
  function groups3(a, b, noDiff) {
    const g = [{ group: 'a', label: hc(a) }, { group: 'b', label: hc(b) }];
    if (!noDiff) g.push({ group: 'd', label: hc('g.diff') });
    return g;
  }

  /* =====================================================================================
     7. PROPOSAL & HOUSEHOLD SHEET (stands in for the client fact finder this batch reads from)
     ===================================================================================== */
  const PF_TYPES = { ProposalName: 'text', ClientAge: 'int', RORAppreciation: 'pct', RORLoanExpected: 'pct', RORLoanInitial: 'pct', RORMIP: 'pct', RORPrincipalLimit: 'pct' };
  const PF_AUTO = { LOC: 1, LOCY1: 1, MaximumClaim: 1, RORPrincipalLimit: 1, RORLoanInitial: 1 };
  const HH_EDIT = [['homeValue', 'money2'], ['elBalance', 'money2'], ['elPayment', 'money2'], ['elRate', 'pct'], ['savings', 'money2'], ['savRate', 'pct'],
    ['income', 'money0'], ['lifestyle', 'money0'], ['cola', 'pct']];
  const HH_CLASSIC = [['monthlyWithdrawal', 'money2'], ['paidFromSavings', 'money2']];
  function openSetup(ctx) {
    if (EFA.edit && EFA.edit.on) return;
    const fam = S.family;
    const current = () => proposal(fam);
    const pname = (p) => (p.sample ? ht(p.sample === 'purchase' ? 'samplePurchase' : (p.sample === 'loc' ? 'sampleLoc' : 'sampleName')) : (p.ProposalName || ht('e.newName')));
    const fieldHTML = (key, type, val, label) => `<label class="b16-ed-f"><span>${label}</span>${inputHTML('ed.' + key, type, val, type === 'text' ? 'txt' : '')}</label>`;
    function body() {
      const p = current(), list = proposals(), hh = household();
      const opts = list.length ? list.map((x) => `<option value="${EFA.util.esc(x.id)}" ${x.id === p.id ? 'selected' : ''}>${EFA.util.esc(x.ProposalName || ht('e.newName'))}</option>`).join('')
        : `<option value="" selected>${EFA.util.esc(pname(p))}</option>`;
      const pf = PFIELDS.filter((k) => k !== 'AltLOCCalc').map((k) => fieldHTML(k, PF_TYPES[k] || 'money2', k === 'ProposalName' ? pname(p) : p[k], hc('e.f.' + k))).join('');
      return `<div class="b16-ed-grid">
        <div class="b16-ed-box"><p class="b16-ed-h">${hc('e.proposal')}</p>
          <div class="b16-ed-bar">${hc('e.pick', { cls: 'b16-ed-msg' })}<select data-ed-pick="1" aria-label="Proposal">${opts}</select>
            <button type="button" class="b16-ed-btn" data-ed="new">${hc('e.new')}</button><button type="button" class="b16-ed-btn" data-ed="dup">${hc('e.dup')}</button>
            ${list.length ? `<button type="button" class="b16-ed-btn" data-ed="del">${hc('e.del')}</button>` : ''}<span data-ed-q="1"></span></div>
          ${p.sample ? hc('e.sampleNote', { tag: 'p', cls: 'b16-ed-note' }) : ''}
          <div class="b16-ed-fields">${pf}<label class="b16-ed-chk"><input type="checkbox" data-ed-alt="1" ${p.AltLOCCalc ? 'checked' : ''}>${hc('e.f.AltLOCCalc')}</label></div>
        </div>
        <div class="b16-ed-box"><p class="b16-ed-h">${hc('e.household')}</p>
          <div class="b16-ed-fields one">${HH_EDIT.map(([f, t]) => fieldHTML('h.' + f, t, hh[f], hc('e.h.' + f))).join('')}
            <label class="b16-ed-chk"><input type="checkbox" data-ed-cf="1" ${showCF() ? 'checked' : ''}>${hc('e.showCF')}</label>
            <p class="b16-ed-sep">${hc('e.classic')}</p>${HH_CLASSIC.map(([f, t]) => fieldHTML('h.' + f, t, hh[f], hc('e.h.' + f))).join('')}</div>
        </div></div>
        <div class="b16-ed-foot"><span class="b16-ed-msg" data-ed-msg="1"></span><button type="button" class="b16-ed-btn pri" data-ed="done">${hc('e.done')}</button></div>`;
    }
    /** the editable record for the proposal in use (a sample becomes this client's first proposal) */
    function editable() {
      let list = proposals(), id = selectedId(), rec = list.find((x) => x.id === id) || list[0];
      if (!rec) {
        adoptSampleHousehold();
        const base = current();
        rec = Object.assign({}, base, { id: 'p' + Date.now().toString(36), ProposalName: pname(base) });
        delete rec.sample;
        list = [rec]; saveProposals(list); select(rec.id);
      }
      return { list, rec };
    }
    const ov = ctx.overlay({ title: `<span data-serif>${hc('e.title')}</span>`, cls: 'b16-ed', html: body(), onClose: () => { S.runs = {}; S.sampleToast = true; if (ctx.el.isConnected) EFA.player.renderScreen({ noFade: true }); } });
    const msg = (k) => { const m = ov.querySelector('[data-ed-msg]'); if (m) { m.innerHTML = k ? hc(k) : ''; } };
    const refresh = () => { const b = ov.querySelector('.st-overlay-b'); b.innerHTML = body(); wire(); if (EFA.edit && EFA.edit.on) EFA.edit.arm(b); else EFA.numify(b); };
    function wire() {
      const b = ov.querySelector('.st-overlay-b');
      b.querySelectorAll('[data-in]').forEach((inp) => {
        const key = inp.dataset.in.slice(3), type = inp.dataset.type, isH = key.startsWith('h.');
        const fieldKey = isH ? key.slice(2) : key;
        const getV = () => (isH ? household()[fieldKey] : (fieldKey === 'ProposalName' ? pname(current()) : current()[fieldKey]));
        inp.addEventListener('focus', () => { const v = getV(); inp.value = type === 'text' ? (v || '') : (v == null ? '' : String(+(+v).toFixed(type === 'pct' ? 3 : 2))); inp.select(); });
        inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
        inp.addEventListener('blur', () => {
          const raw = String(inp.value).trim();
          let v = parseIn(raw, type);
          const blankAuto = !isH && raw === '' && PF_AUTO[fieldKey];
          if (type !== 'text' && !isFinite(v) && !blankAuto) { inp.value = IN_FMT[type](getV()); return; }
          if (blankAuto) v = null;
          if (isH) {
            const prev = household()[fieldKey];
            if (v !== prev) {
              setHH(fieldKey, v);
              if (['elBalance', 'elPayment', 'elRate'].indexOf(fieldKey) >= 0) { const hh = household(); caseApi().set('mortgage_term_in_months', termMonths(hh)); }
              msg('e.saved');
            }
            inp.value = IN_FMT[type](household()[fieldKey]);
            return;
          }
          const was = current();
          if (fieldKey !== 'ProposalName' && v === was[fieldKey]) { inp.value = IN_FMT[type](was[fieldKey]); return; }
          if (fieldKey === 'ProposalName' && v === pname(was)) return;
          const wasSample = !!was.sample;
          const { list, rec } = editable();
          rec[fieldKey] = v; saveProposals(list); S.runs = {};
          msg('e.saved');
          if (wasSample || PF_AUTO[fieldKey] || fieldKey === 'PrincipalLimit' || fieldKey === 'MortgageBalance' || fieldKey === 'Advance' || fieldKey === 'ProposalName') refresh();
          else inp.value = IN_FMT[type](current()[fieldKey]);
        });
      });
      const alt = b.querySelector('[data-ed-alt]');
      if (alt) alt.addEventListener('change', () => { const { list, rec } = editable(); rec.AltLOCCalc = alt.checked; saveProposals(list); S.runs = {}; msg('e.saved'); });
      const cf = b.querySelector('[data-ed-cf]');
      if (cf) cf.addEventListener('change', () => { setShowCF(cf.checked); msg('e.saved'); });
      const pick = b.querySelector('[data-ed-pick]');
      if (pick) pick.addEventListener('change', () => { if (pick.value) { select(pick.value); refresh(); } });
      b.querySelectorAll('[data-ed]').forEach((btn) => btn.addEventListener('click', () => {
        if (EFA.edit && EFA.edit.on) return;
        const a = btn.dataset.ed;
        if (a === 'done') { ov.close(); return; }
        if (a === 'new' || a === 'dup') {
          if (a === 'new') adoptSampleHousehold();
          const list = proposals(), base = a === 'new' ? sample(fam) : current();
          if (!base) return;
          const rec = Object.assign({}, base, { id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), ProposalName: a === 'new' ? ht('e.newName') : pname(base) + ' ' + ht('e.copyName') });
          delete rec.sample;
          if (!list.length && a === 'dup') adoptSampleHousehold();
          list.push(rec); saveProposals(list); select(rec.id); refresh(); return;
        }
        if (a === 'del') {
          const q = b.querySelector('[data-ed-q]');
          q.innerHTML = `${hc('e.delQ', { cls: 'b16-ed-msg' })} <button type="button" class="b16-ed-btn pri" data-q="yes">${hc('e.yes')}</button> <button type="button" class="b16-ed-btn" data-q="no">${hc('e.no')}</button>`;
          q.querySelector('[data-q="yes"]').addEventListener('click', () => {
            const id = current().id, list = proposals().filter((x) => x.id !== id);
            saveProposals(list); select(list.length ? list[0].id : null); refresh();
          });
          q.querySelector('[data-q="no"]').addEventListener('click', () => { q.innerHTML = ''; });
        }
      }));
    }
    wire();
    return ov;
  }

  /* =====================================================================================
     8. CREDIT-LINE GAIN CHART (fwlpsvp5, fwloc4, fwh4psd5 dialog; fwlpsvp7 screen)
     ===================================================================================== */
  const SERIES = [{ key: 'chS1', color: '#1d3863', field: 'PaymentC' }, { key: 'chS2', color: '#a3841f', field: 'LOCGain' }];
  function niceMax(v) {
    if (!(v > 0)) return 1000;
    const p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p;
    const step = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
    return step * p;
  }
  /** returns HTML for a chart box (w x h stage px) and a wire(ctx, root) function for the hover layer */
  function gainChart(series, o) {
    const w = o.w, h = o.h, pad = { l: 128, r: 150, t: 18, b: 58 };
    const n = series.length, pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
    const vals = series.flatMap((r) => [r.PaymentC, r.LOCGain]);
    const lo = Math.min(0, ...vals), hiRaw = Math.max(0, ...vals);
    const yMax = niceMax(hiRaw), yMin = lo < 0 ? -niceMax(-lo) : 0;
    const X = (i) => pad.l + (n <= 1 ? 0 : (i * pw) / (n - 1));
    const Y = (v) => pad.t + ph * (1 - (v - yMin) / (yMax - yMin));
    let g = '';
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const v = yMin + ((yMax - yMin) * i) / ticks, y = Y(v);
      g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#d6cfc4" stroke-width="1"/>`;
      g += `<text x="${pad.l - 14}" y="${(y + 7).toFixed(1)}" text-anchor="end" font-family="DM Sans, sans-serif" font-weight="700" font-size="20" fill="#667389">${money(v)}</text>`;
    }
    series.forEach((r, i) => {
      if (i % 5) return;
      const x = X(i).toFixed(1);
      g += `<line x1="${x}" x2="${x}" y1="${pad.t}" y2="${pad.t + ph}" stroke="#e3e8f0" stroke-width="1"/>`;
      g += `<text x="${x}" y="${(pad.t + ph + 34).toFixed(1)}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="20" fill="#667389">${r.Age}</text>`;
    });
    g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${Y(0).toFixed(1)}" y2="${Y(0).toFixed(1)}" stroke="#667389" stroke-width="1.5"/>`;
    const ends = [];
    SERIES.forEach((s) => {
      const d = series.map((r, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(r[s.field]).toFixed(1)}`).join('');
      g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`;
      const last = series[n - 1];
      g += `<circle cx="${X(n - 1).toFixed(1)}" cy="${Y(last[s.field]).toFixed(1)}" r="7" fill="${s.color}" stroke="#fffdf8" stroke-width="2.5"/>`;
      ends.push({ y: Y(last[s.field]), v: last[s.field] });
    });
    // end labels: values beside the line ends, nudged apart if they collide
    if (ends.length === 2 && Math.abs(ends[0].y - ends[1].y) < 30) { const mid = (ends[0].y + ends[1].y) / 2, up = ends[0].y <= ends[1].y ? 0 : 1; ends[up].y = mid - 16; ends[1 - up].y = mid + 16; }
    const endLabels = ends.map((e) => `<text x="${(X(n - 1) + 16).toFixed(1)}" y="${(e.y + 7).toFixed(1)}" font-family="DM Sans, sans-serif" font-weight="700" font-size="21" fill="#0d1e3a">${money(e.v)}</text>`).join('');
    const svg = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Credit line gain chart">${g}${endLabels}
      <line class="b16-cx" x1="0" x2="0" y1="${pad.t}" y2="${pad.t + ph}" stroke="#0d1e3a" stroke-width="1" opacity="0"/>
      ${SERIES.map((s, i) => `<circle class="b16-cd" data-i="${i}" r="7" cx="0" cy="0" fill="${s.color}" stroke="#fffdf8" stroke-width="2.5" opacity="0"/>`).join('')}
      <rect class="b16-hit" x="${pad.l - 10}" y="${pad.t}" width="${pw + 20}" height="${ph}" fill="transparent"/></svg>`;
    const legend = `<div class="b16-legend">${SERIES.map((s) => `<span><i class="b16-key" style="background:${s.color}"></i>${hc(s.key)}</span>`).join('')}</div>`;
    const none = series.every((r) => Math.abs(r.PaymentC) < 0.5 && Math.abs(r.LOCGain) < 0.5);
    const html = `${legend}<div style="position:relative">${svg}${none ? `<div class="b16-chnone" style="top:${(pad.t + ph * 0.42).toFixed(0)}px">${hc('chNone')}</div>` : ''}<div class="b16-chtip" style="opacity:0;left:0;top:0"></div></div>`;
    function wire(root) {
      const hit = root.querySelector('.b16-hit'), tip = root.querySelector('.b16-chtip'), cx = root.querySelector('.b16-cx'), dots = Array.from(root.querySelectorAll('.b16-cd'));
      if (!hit) return;
      const svgEl = hit.ownerSVGElement;
      const at = (e) => {
        const b = svgEl.getBoundingClientRect(), sx = (e.clientX - b.left) * (w / b.width);
        const i = Math.max(0, Math.min(n - 1, Math.round(((sx - pad.l) / pw) * (n - 1))));
        const x = X(i), r = series[i];
        cx.setAttribute('x1', x); cx.setAttribute('x2', x); cx.setAttribute('opacity', '.35');
        dots.forEach((d) => { const s = SERIES[+d.dataset.i]; d.setAttribute('cx', x); d.setAttribute('cy', Y(r[s.field])); d.setAttribute('opacity', '1'); });
        tip.innerHTML = `<div class="t">${hc('chAge')} <span class="num">${r.Age}</span></div>${SERIES.map((s) => `<div class="r"><i class="k" style="background:${s.color}"></i><span>${hc(s.key)}</span><span class="v num">${money(r[s.field])}</span></div>`).join('')}`;
        const left = x + 18 + 260 > w ? x - 18 - 260 : x + 18;
        tip.style.left = left + 'px'; tip.style.top = Math.max(0, Math.min(ph - 130, Y(Math.max(r.PaymentC, r.LOCGain)) - 40)) + 'px'; tip.style.opacity = '1';
      };
      hit.addEventListener('pointermove', at);
      hit.addEventListener('pointerdown', at);
      hit.addEventListener('pointerleave', () => { tip.style.opacity = '0'; cx.setAttribute('opacity', '0'); dots.forEach((d) => d.setAttribute('opacity', '0')); });
    }
    return { html, wire };
  }
  function openChart(ctx, op, base) {
    if (EFA.edit && EFA.edit.on) return;
    const c = gainChart(locGain(op, base), { w: 1360, h: 560 });
    const ov = ctx.overlay({ title: `<span data-serif>${hc('chTitle')}</span>`, cls: 'b16-chov', html: `<p class="b16-chh">${hc('chHead1')}<br>${hc('chHead2')}</p>${c.html}` });
    c.wire(ov);
    return ov;
  }

  /* =====================================================================================
     9. FRAMES
     ===================================================================================== */
  const VP1 = { left: 0, top: 72, w: 1088, h: 828, x: -20.2, y: -2.5 };                 // single: viewport and model offset (em)
  const VP2 = { top: 160, w: 784, h: 676, x: -26.4, y: -5, scale: 0.8, L: 8, R: 808 };  // two scenarios, model at 80%
  /** single-scenario frame (spec 4.1). o: {head, panels, loc (credit-line mode), loc1, summary: tipKey, drawSum, cf, docs, warnSlot} */
  function single(ctx, o) {
    const st = { k: 0, monthly: false, timer: null };
    const cf = showCF();
    ctx.el.innerHTML = `
      <h1 class="b16-head">${o.head}</h1>
      <div class="b16-vp" style="left:${VP1.left}px;top:${VP1.top}px;width:${VP1.w}px;height:${VP1.h}px"><div class="b16-pemhost" style="left:${(VP1.x * EM).toFixed(1)}px;top:${(VP1.y * EM).toFixed(1)}px"></div></div>
      <div class="b16-col">${o.warnSlot ? `<div class="b16-warn fade is-off" data-warn="1" hidden>${hc(o.warnSlot)}</div>` : ''}<div data-stripw="1">${stripHTML(false)}</div>${o.panels || ''}</div>
      <div class="b16-st fade is-off" data-st="1"></div>
      ${o.summary ? `<div class="b16-sum fade is-off" data-sum="1" style="left:96px;top:774px">${summaryHTML(o.summary)}</div>` : ''}
      ${o.drawSum ? '<div class="b16-sum dstat fade is-off" data-dsum="1" style="left:96px;top:782px"></div>' : ''}
      ${o.loc1 && cf ? locSwitchHTML() : ''}
      <div class="b16-links">${docsButtonHTML(ctx, o.docs)}${setupLinkHTML()}</div>
      ${footHTML({ cf: o.cf ? false : null })}`;
    st.pem = mountPem(ctx, ctx.$('.b16-pemhost'), 1, o.loc);
    const stEl = ctx.$('[data-st]');
    if (stEl) { if (o.statusAt) { stEl.style.left = o.statusAt[0] + 'px'; stEl.style.top = o.statusAt[1] + 'px'; stEl.style.transform = o.statusAt[2] || 'translate(-50%, 0)'; } else placeStatus(stEl, st.pem, [256, 690]); }
    const lw = ctx.$('[data-locw]');
    if (lw) {
      const r = partRect(st.pem, 'borrowed');
      lw.style.left = (r ? Math.max(330, r.x - 130) : 420) + 'px'; lw.style.top = (r ? Math.min(700, r.y + r.h - 60) : 600) + 'px';
    }
    wireSetup(ctx);
    return st;
  }
  /** two-scenario frame (spec 4.2). o: {head, capL, capR, docs: [{key, data}], sum: {L, R}: {tip, style}} */
  function double(ctx, o) {
    const st = { k: 0, monthly: false, timer: null };
    const vp = (side) => `<div class="b16-vp" data-vp="${side}" style="left:${VP2[side]}px;top:${VP2.top}px;width:${VP2.w}px;height:${VP2.h}px"><div class="b16-pemhost" style="left:${(VP2.x * EM * VP2.scale).toFixed(1)}px;top:${(VP2.y * EM * VP2.scale).toFixed(1)}px"></div></div>`;
    const sums = o.sum || {};
    const disc = has('disclosure', 'line') ? EFA.lib.disclosure.line('hypothetical', { style: 'margin:0' }) : '';
    ctx.el.innerHTML = `
      <h1 class="b16-head sm" data-head="1">${o.head}</h1>
      <div class="b16-hdr"><div class="b16-cap">${o.capL || ''}</div>${stripHTML(true)}<div class="b16-cap">${o.capR || ''}</div></div>
      ${vp('L')}<div class="b16-divider"></div>${vp('R')}
      <div class="b16-st fade is-off" data-st="L"></div><div class="b16-st fade is-off" data-st="R"></div>
      ${['L', 'R'].map((s) => (sums[s] ? `<div class="b16-sum fade is-off" data-sum="${s}" style="${sums[s].style}">${summaryHTML(sums[s].tip)}</div>` : '')).join('')}
      ${o.warn ? `<div class="b16-warn2 fade is-off" data-warn="L" style="left:608px;top:722px">${hc(o.warn.L)}</div><div class="b16-warn2 fade is-off" data-warn="R" style="left:1424px;top:722px">${hc(o.warn.R)}</div>` : ''}
      <div class="b16-links">${docsChooserHTML()}${setupLinkHTML()}</div>
      <div style="position:absolute;left:470px;width:800px;bottom:10px;display:grid;gap:2px" class="b16-d2">${disc}<p class="st-disclaimer" style="margin:0">${hc('hecmNote')}</p></div>`;
    st.pemL = mountPem(ctx, ctx.$('[data-vp="L"] .b16-pemhost'), VP2.scale, o.locL);
    st.pemR = mountPem(ctx, ctx.$('[data-vp="R"] .b16-pemhost'), VP2.scale, o.locR);
    placeStatus(ctx.$('[data-st="L"]'), st.pemL, [200, 640]);
    placeStatus(ctx.$('[data-st="R"]'), st.pemR, [1000, 640]);
    wireDocsChooser(ctx, o.docs);
    wireSetup(ctx);
    return st;
  }
  /** fill one summary line */
  function setSum(ctx, sel, v) {
    const el = ctx.$(sel); if (!el) return;
    const n = el.querySelector('[data-sumv]'); if (n) n.textContent = money(v);
    ctx.show(el, v != null && isFinite(v));
  }
  const rowAt = (run, k) => run.rows[Math.min(k, run.rows.length - 1)];
  const notReady = (ctx, head) => { noDataScreen(ctx, head); return null; };
  /** the money inputs shared by several screens (income and lifestyle persist per client) */
  const cashPanel = () => panelHTML(hc('pCash'), rowHTML(hc('lIncome'), inputHTML('inc', 'money0', S.hh.income)) + rowHTML(hc('lLifestyle'), inputHTML('life', 'money0', S.hh.lifestyle)));
  function cashInputs(after) {
    const mk = (f) => ({ get: () => S.hh[f], set: (v) => { setHH(f, v); S.hh = household(); }, after, min: 0 });
    return { inc: mk('income'), life: mk('lifestyle') };
  }
  /** proposal summary rows ($, 2 dp, read-only) */
  const pRows = (p, keys) => keys.map(([label, v]) => rowHTML(hc(label), num(money(v, 2)))).join('');
  /** the optional-payment panel (fwlpsvp5, fwloc4, fwh4psd5) */
  function opPanelHTML() {
    const op = S.op;
    return panelHTML(hc('pAssume'),
      subHTML(hc('sSavings')) +
      rowHTML(hc('lMonthlySav'), inputHTML('opSavDeposit', 'money2', op.opSavDeposit)) +
      rowHTML(hc('lGrowth'), inputHTML('opSavRate', 'pct', op.opSavRate)) +
      rowHTML(hc('lStart'), inputHTML('opSavStart', 'int', op.opSavStart)) +
      rowHTML(hc('lEnd'), inputHTML('opSavEnd', 'int', op.opSavEnd)) +
      subHTML(hc('sOptPay'), `<span class="b16-tipw" data-chartw="1" ${op.opPayment > 0 ? '' : 'hidden'}><button type="button" class="b16-cicon" data-chart="1" aria-label="Chart">${ICO.chart}</button><span class="b16-tip" style="width:220px">${hc('chartTip')}</span></span>`) +
      rowHTML(hc('lPayment'), inputHTML('opPayment', 'money2', op.opPayment)) +
      rowHTML(hc('lStart'), inputHTML('opPayStart', 'int', op.opPayStart)) +
      rowHTML(hc('lEnd'), inputHTML('opPayEnd', 'int', op.opPayEnd)));
  }
  function opInputs(ctx, after) {
    const mm = () => S.maxMonth;
    const mk = (f, o) => Object.assign({ get: () => S.op[f], set: (v) => { S.op[f] = v; }, after }, o || {});
    return {
      opSavDeposit: mk('opSavDeposit', { min: 0 }), opSavRate: mk('opSavRate', { min: 0, max: 12, liveMax: 12 }),
      opSavStart: mk('opSavStart', { min: 1, max: mm }), opSavEnd: mk('opSavEnd', { min: 0, max: mm }),
      opPayment: mk('opPayment', { min: 0, after: (v) => { const w = ctx.$('[data-chartw]'); if (w) w.hidden = !(S.op.opPayment > 0); after(v); } }),
      opPayStart: mk('opPayStart', { min: 0, max: mm }), opPayEnd: mk('opPayEnd', { min: 0, max: mm })
    };
  }

  /* =====================================================================================
     10. SCREENS: LIEN PAYOFF (FWP2 / EWP2)
     ===================================================================================== */
  /** the four benefit slides share one template */
  function benefits(ctx, o) {
    const items = o.keys.map((k) => ctx.t(k));
    const list = has('bullets', 'list')
      ? EFA.lib.bullets.list(ctx, items, { reveal: false, boxed: true, size: 64, gap: o.gap || 22, text: 'b16-bt' })
      : `<div style="display:grid;gap:${o.gap || 22}px">${items.map((h) => `<div class="b16-card b16-bt" style="padding:18px 28px">${h}</div>`).join('')}</div>`;
    ctx.el.innerHTML = `
      <div class="b16-bh">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule"></div>
      <div class="b16-blist" style="top:${o.top || 236}px;width:${o.width}px">${list}</div>
      ${o.foot ? ctx.t(o.foot, { tag: 'p', cls: 'st-disclaimer b16-fn', attrs: `style="right:${(1600 - o.width) / 2}px"` }) : ''}`;
  }

  EFA.screen('fwlpsvp1', {
    title: 'Lien payoff: key benefits',
    copy: {
      head: 'Putting Your HECM Proposal to Work',
      b1: 'Your home equity becomes a working part of your retirement income plan.*',
      b2: 'Your required monthly mortgage payment becomes optional (property taxes, insurance and upkeep remain yours).',
      b3: 'Your monthly cash flow improves, and any unused line of credit grows over time.*',
      b4: 'Money drawn from your home equity is loan proceeds, generally income-tax-free under current tax law, subject to applicable requirements.*',
      foot: '* For education only; this is not tax or financial advice. Please seek personal advice from a qualified tax or financial professional. Line of credit growth applies to the unused portion of the line and is not an investment return.',
      _notes: 'This is the big picture before any numbers: the home you have already paid for can go to work for your retirement.\n\n- Ask: If the mortgage payment were no longer required, what would you do with that money each month?\nPAUSE\n\n- The next screens show your current mortgage first, then the same years with the HECM in place.'
    },
    render(ctx) { benefits(ctx, { keys: ['b1', 'b2', 'b3', 'b4'], width: 1280, foot: 'foot' }); }
  });

  EFA.screen('fwlpsvp2', {
    title: 'The existing mortgage, year by year',
    copy: {
      head: 'Your Current Mortgage',
      lBal: 'Current Balance:', lPmt: 'Current Payment:', lPfs: 'Paid From Savings:', lRate: 'Financing Rate:', lMonths: 'Months Remaining:',
      impLead: 'Your mortgage payments reduce your retirement income', impBy: 'by', impMonth: 'per month', impYear: 'per year', impTotal: 'in total',
      _notes: 'This is the mortgage you have today, played forward year by year. Each payment is money that cannot go to the life you planned.\n\n- Step through the ages and watch what the payment does to your savings.\n- Ask: When this payment comes out every month, what gets put off?\nPAUSE'
    },
    render(ctx) {
      if (!begin('refi', { resetScale: true })) return notReady(ctx, ctx.t('head'));
      sampleNotice();
      const cf = showCF();
      const recalc = () => {
        S.hh = household();
        const months = termMonths(S.hh);
        if (caseApi().get('mortgage_term_in_months', undefined) !== months) caseApi().set('mortgage_term_in_months', months);
        S.hh.elMonths = months;
        return ensure('EL', true);
      };
      recalc(); ensure('HECM');
      const hh = S.hh;
      const panels = panelHTML(hc('pMortgage'),
        rowHTML(ctx.t('lBal'), inputHTML('bal', 'money2', hh.elBalance)) +
        rowHTML(ctx.t('lPmt'), inputHTML('pmt', 'money2', hh.elPayment)) +
        (cf ? '' : rowHTML(ctx.t('lPfs'), inputHTML('pfs', 'money2', hh.paidFromSavings))) +
        rowHTML(ctx.t('lRate'), inputHTML('rate', 'pct', hh.elRate)) +
        rowHTML(ctx.t('lMonths'), '<span class="num" data-months="1"></span>')) +
        (cf ? cashPanel() : '') +
        `<div class="b16-card b16-impact">${ctx.t('impLead', { cls: 'lead' })}
          <span class="ln">${ctx.t('impBy')} <span class="num" data-imp="m"></span> ${ctx.t('impMonth')}</span>
          <span class="ln">${ctx.t('impBy')} <span class="num" data-imp="y"></span> ${ctx.t('impYear')}</span>
          <span class="ln">${ctx.t('impBy')} <span class="num" data-imp="t"></span> ${ctx.t('impTotal')}</span></div>`;
      const st = single(ctx, { head: ctx.t('head'), panels, cf: true, docs: () => WS.EL(ensure('EL')) });
      const paint = (k, ms) => {
        const el = ensure('EL');
        setPem(st.pem, feed(rowAt(el, k), k, { kind: 'EL', monthly: st.monthly, cf, loanPmt: 'el' }), ms);
        setStatusBox(ctx, ctx.$('[data-st]'), el.status);
      };
      const facts = () => {
        ctx.$('[data-months]').textContent = fm().int(S.hh.elMonths);
        ctx.$('[data-imp="m"]').textContent = money(S.hh.elPayment, 2);
        ctx.$('[data-imp="y"]').textContent = money(12 * S.hh.elPayment);
        ctx.$('[data-imp="t"]').textContent = money(S.elTotalPayments);
      };
      const edit = (f) => ({ get: () => S.hh[f], set: (v) => { setHH(f, v); }, after: () => { recalc(); facts(); paint(st.k, 300); }, min: 0 });
      bindInputs(ctx, Object.assign({ bal: edit('elBalance'), pmt: edit('elPayment'), pfs: edit('paidFromSavings'), rate: Object.assign(edit('elRate'), { max: 30 }) },
        cashInputs(() => { recalc(); paint(st.k, 300); })));
      wireStrip(ctx, st, paint);
      wireCfLink(ctx, st, paint);
      facts(); paint(0, 0);
    }
  });

  /** proposal summary panel used by fwlpsvp3 */
  EFA.screen('fwlpsvp3', {
    title: 'HECM pays off the mortgage, credit line available',
    copy: {
      head: 'Your HECM Pays Off the Mortgage and Opens a Line of Credit',
      _notes: 'Same home, same years, but the HECM has retired the old mortgage. No monthly mortgage payment is required, and the unused line of credit keeps growing.\n\n- Watch the running total at the bottom: income you no longer send to the old lender.\n- Ask: What would that extra income make possible for you each year?\nPAUSE'
    },
    render(ctx) {
      if (!begin('refi')) return notReady(ctx, ctx.t('head'));
      sampleNotice();
      const cf = showCF(), p = S.p;
      ensure('EL'); ensure('HECM');
      const panels = panelHTML(hc('pMortgage'), nameRow(p) + pRows(p, [['lPropValue', p.PropertyValue], ['lPL', p.PrincipalLimit], ['lLien', p.LienPayoff], ['lInitBal', p.MortgageBalance], ['lInitLoc', p.LOC]])) +
        (cf ? cashPanel() : '');
      const st = single(ctx, { head: ctx.t('head'), panels, loc: true, loc1: true, summary: 'sumTip', cf: true, docs: () => WS.HECM(ensure('HECM'), ensure('EL')) });
      const paint = (k, ms) => {
        const h = ensure('HECM'), el = ensure('EL');
        setPem(st.pem, feed(rowAt(h, k), k, { kind: 'HECM', monthly: st.monthly, cf, loanPmt: 'hecm' }), ms);
        setStatusBox(ctx, ctx.$('[data-st]'), h.status);
        setSum(ctx, '[data-sum]', rowAt(el, k).PaidFromInflowC);
      };
      bindInputs(ctx, cashInputs(() => paint(st.k, 300)));
      wireLocSwitch(ctx, () => paint(st.k, 300));
      wireStrip(ctx, st, paint);
      wireCfLink(ctx, st, paint);
      paint(0, 0);
    }
  });

  EFA.screen('fwlpsvp4', {
    title: 'Existing mortgage vs HECM payoff, side by side',
    copy: {
      head: 'Mortgage vs HECM', capL: 'Mortgage', capR: 'HECM',
      _notes: 'Now the two paths side by side on one timeline: keep the mortgage on the left, or let the HECM retire it on the right.\n\n- Step through the years together. Watch savings, the credit line and equity move apart.\n- Ask: Which of these two retirements would you rather be living at 85?\nPAUSE'
    },
    render(ctx) {
      if (!begin('refi')) return notReady(ctx, ctx.t('head'));
      sampleNotice();
      ensure('EL'); ensure('HECM');
      const st = double(ctx, {
        head: ctx.t('head'), capL: ctx.t('capL'), capR: ctx.t('capR'), locR: true,
        sum: { R: { tip: 'sumTip', style: 'right:256px;top:752px' } },
        docs: [{ key: 'c.mortgage', data: () => WS.EL(ensure('EL')) }, { key: 'c.hecm', data: () => WS.HECM(ensure('HECM'), ensure('EL')) }, { key: 'c.both', data: () => WS.EL_HECM(ensure('EL'), ensure('HECM')) }]
      });
      const paint = (k, ms) => {
        const el = ensure('EL'), h = ensure('HECM');
        setPem(st.pemL, feed(rowAt(el, k), k, { kind: 'EL', cf: showCF(), loanPmt: 'el' }), ms);
        setPem(st.pemR, feed(rowAt(h, k), k, { kind: 'HECM', cf: showCF(), loanPmt: 'hecm' }), ms);
        setStatusBox(ctx, ctx.$('[data-st="L"]'), el.status);
        setStatusBox(ctx, ctx.$('[data-st="R"]'), h.status);
        setSum(ctx, '[data-sum="R"]', rowAt(el, k).PaidFromInflowC);
      };
      wireStrip(ctx, st, paint);
      paint(0, 0);
    }
  });

  EFA.screen('fwlpsvp5', {
    title: 'HECM with redirected savings and optional payments',
    copy: {
      head: 'Your HECM Plus Regular Saving and Optional Payments',
      _notes: 'The money that used to go to the old mortgage is yours to direct. Some can go to savings each month, and some can go back onto the HECM as an optional payment, which reopens room on the line of credit.\n\n- Set the monthly savings and an optional payment, then open the chart beside Optional Payments.\n- Ask: Would you rather see that money sitting in savings, or working as a larger line of credit you can tap later?\nPAUSE'
    },
    render(ctx) {
      if (!begin('refi')) return notReady(ctx, ctx.t('head'));
      sampleNotice();
      resetOP('refi');
      const cf = showCF();
      ensure('HECM_OP', true); ensure('HECM');
      const st = single(ctx, { head: ctx.t('head'), panels: opPanelHTML(), loc: true, loc1: true, summary: 'sumTipOP', cf: true, docs: () => WS.OP(ensure('HECM_OP')) });
      const paint = (k, ms) => {
        const op = ensure('HECM_OP'), el = ensure('EL'), r = rowAt(op, k);
        setPem(st.pem, feed(r, k, { kind: 'HECM', monthly: st.monthly, cf, loanPmt: 'hecm' }), ms);
        setStatusBox(ctx, ctx.$('[data-st]'), op.status);
        setSum(ctx, '[data-sum]', rowAt(el, k).PaidFromInflowC - (r.SavingContributionC + r.VoluntaryPaymentsC));
      };
      bindInputs(ctx, opInputs(ctx, () => paint(st.k, 300)));
      ctx.on(ctx.$('[data-chart]'), 'click', () => openChart(ctx, ensure('HECM_OP'), ensure('HECM')));
      wireLocSwitch(ctx, () => paint(st.k, 300));
      wireStrip(ctx, st, paint);
      wireCfLink(ctx, st, paint);
      paint(0, 0);
    }
  });

  EFA.screen('fwlpsvp6', {
    title: 'Baseline vs HECM with optional payments, switchable',
    copy: {
      hlMortgage: 'Current Mortgage', hlHecm: 'HECM', restM: 'vs. HECM with Optional Payments', restH: 'vs. HECM with Optional Payments and Added Saving',
      _notes: 'On the right, the HECM with the monthly saving and optional payments you just set. On the left, the path you are comparing it to. Click the first words of the heading to switch the left side between your current mortgage and the plain HECM.\n\n- Ask: Looking at both sides at the same age, which one gives you more choices?\nPAUSE'
    },
    render(ctx) {
      if (!begin('refi')) return notReady(ctx, ctx.t('hlMortgage'));
      sampleNotice();
      ensure('EL'); ensure('HECM'); ensure('HECM_OP');
      const leftM = ctx._b16LeftM !== false;
      const head = `<span class="b16-hl" data-hl="1">${ctx.t(leftM ? 'hlMortgage' : 'hlHecm')}</span> ${ctx.t(leftM ? 'restM' : 'restH')}`;
      const st = double(ctx, {
        head, locL: !leftM, locR: true,
        sum: { L: leftM ? null : { tip: 'sumTip', style: 'left:128px;top:752px' }, R: { tip: 'sumTipOP', style: 'left:1000px;top:752px' } },
        docs: [{ key: 'c.mortgage', data: () => WS.EL(ensure('EL')) }, { key: 'c.hecm', data: () => WS.HECM(ensure('HECM'), ensure('EL')) },
          { key: 'c.op', data: () => WS.OP(ensure('HECM_OP')) },
          { key: 'c.both', data: () => (ctx._b16LeftM !== false ? WS.EL_OP(ensure('EL'), ensure('HECM_OP')) : WS.HECM_OP(ensure('HECM'), ensure('HECM_OP'), ensure('EL'))) }]
      });
      const paint = (k, ms) => {
        const el = ensure('EL'), h = ensure('HECM'), op = ensure('HECM_OP'), cf = showCF();
        const lr = leftM ? rowAt(el, k) : rowAt(h, k), r = rowAt(op, k);
        setPem(st.pemL, feed(lr, k, leftM ? { kind: 'EL', cf, loanPmt: 'el' } : { kind: 'HECM', cf, loanPmt: 'hecm' }), ms);
        setPem(st.pemR, feed(r, k, { kind: 'HECM', cf, loanPmt: 'hecm', contribAlways: true }), ms);
        setStatusBox(ctx, ctx.$('[data-st="L"]'), leftM ? el.status : h.status);
        setStatusBox(ctx, ctx.$('[data-st="R"]'), op.status);
        if (!leftM) setSum(ctx, '[data-sum="L"]', rowAt(el, k).PaidFromInflowC);
        setSum(ctx, '[data-sum="R"]', rowAt(el, k).PaidFromInflowC - (r.SavingContributionC + r.VoluntaryPaymentsC));
      };
      ctx.on(ctx.$('[data-hl]'), 'click', () => {
        if (st.timer) clearTimeout(st.timer);
        ctx._b16LeftM = !leftM; ctx._b16K = st.k;
        this.render(ctx); EFA.numify(ctx.el);
      });
      wireStrip(ctx, st, paint);
      if (ctx._b16K != null) { st.k = ctx._b16K; ctx._b16K = null; }
      st.set(st.k, 0);
    }
  });

  EFA.screen('fwlpsvp7', {
    title: 'Credit-line gain from optional payments',
    copy: {
      _notes: 'Every optional payment comes back to you as available credit, and that restored room keeps growing at the line’s growth rate.\n\n- The navy line is what you paid in. The gold line is the extra line of credit those payments created.\n- Ask: How would it feel to know that money is still there for you, and growing, if you ever need it?\nPAUSE'
    },
    render(ctx) {
      if (!begin('refi')) return notReady(ctx, hc('chHead1'));
      const op = ensure('HECM_OP'), base = ensure('HECM');
      const c = gainChart(locGain(op, base), { w: 1380, h: 560 });
      const disc = has('disclosure', 'line') ? EFA.lib.disclosure.line('hypothetical', { style: 'margin:0' }) : '';
      ctx.el.innerHTML = `
        <h1 class="b16-head" style="top:44px;font-size:46px;line-height:1.15">${hc('chHead1')}<br>${hc('chHead2')}</h1>
        <div class="b16-chart" style="left:110px;top:196px;width:1380px">${c.html}</div>
        <div style="position:absolute;left:110px;width:1060px;bottom:70px">${disc}</div>`;
      c.wire(ctx.el);
    }
  });

  /* =====================================================================================
     11. SCREENS: HECM LINE OF CREDIT (FWP3 / EWP3)
     ===================================================================================== */
  EFA.screen('fwloc1', {
    title: 'HECM line of credit: key benefits',
    copy: {
      head: 'Putting Your HECM Proposal to Work',
      b1: 'Tap the wealth in your home through a HECM line of credit.',
      b2: 'Strengthen your retirement cash flow.',
      b3: 'Keep money on hand for home projects, travel, surprises or opportunities.',
      b4: 'Help keep your taxes in check: loan proceeds are generally income-tax-free under current tax law, subject to applicable requirements.*',
      b5: 'Draw on a reserve instead of selling investments when markets fall.*',
      foot: '* For education only; this is not tax or financial advice. Please seek personal advice from a qualified tax or financial professional. A line of credit is a loan: amounts you draw accrue interest and mortgage insurance.',
      _notes: 'A HECM line of credit is a standby reserve: money you can reach when you choose, without a required monthly payment.\n\n- Ask: The last time the market dropped, what did you wish you had on hand?\nPAUSE\n\n- Next we will see how the unused line grows over the years.'
    },
    render(ctx) { benefits(ctx, { keys: ['b1', 'b2', 'b3', 'b4', 'b5'], width: 1300, top: 214, gap: 18, foot: 'foot' }); }
  });

  EFA.screen('fwloc2', {
    title: 'HECM with a growing line of credit',
    copy: {
      head: 'Your Unused Line of Credit Keeps Growing',
      _notes: 'With no planned draws, the unused part of the line grows every year at the loan’s growth rate, and it is there to cover any year when lifestyle costs more than income.\n\n- Step to 85 and to 95. Watch the credit line band rise.\n- Ask: What would it mean to you to have that reserve waiting at 85?\nPAUSE'
    },
    render(ctx) {
      if (!begin('loc', { resetScale: true })) return notReady(ctx, ctx.t('head'));
      sampleNotice();
      const cf = showCF(), p = S.p;
      ensure('HECM', true); ensure('HECM_DRAW', true);
      const panels = panelHTML(hc('pMortgage'), nameRow(p) + pRows(p, [['lPropValue', p.PropertyValue], ['lPL', p.PrincipalLimit], ['lInitBal', p.MortgageBalance], ['lInitLoc', p.LOC]])) +
        (cf ? cashPanel() : '');
      const st = single(ctx, { head: ctx.t('head'), panels, loc: true, loc1: true, cf: true, docs: () => WS.LOC(ensure('HECM')) });
      const paint = (k, ms) => {
        const h = ensure('HECM'); ensure('HECM_DRAW');
        setPem(st.pem, feed(rowAt(h, k), k, { kind: 'HECM', monthly: st.monthly, cf, loanPmt: 'draw' }), ms);
        setStatusBox(ctx, ctx.$('[data-st]'), h.status);
      };
      bindInputs(ctx, cashInputs(() => paint(st.k, 300)));
      wireLocSwitch(ctx, () => paint(st.k, 300));
      wireStrip(ctx, st, paint);
      wireCfLink(ctx, st, paint);
      paint(0, 0);
    }
  });

  EFA.screen('fwloc3', {
    title: 'HECM with planned draws on the credit line',
    copy: {
      head: 'Taking Money From Your Line of Credit on a Plan',
      _notes: 'Here we plan the draws: a lump sum at the start of a chosen year, a steady monthly amount, or both. Each draw moves money from the line into the loan balance.\n\n- Try a lump sum for a project, then a monthly draw to round out income.\n- Ask: If you could design your own paycheck from this line, how much would you want each month?\nPAUSE'
    },
    render(ctx) {
      if (!begin('loc')) return notReady(ctx, ctx.t('head'));
      sampleNotice();
      const cf = showCF();
      S.draw = { lumpAmount: 0, lumpYear: 1, monthlyDraw: 0, drawStart: 1, drawEnd: 1 };
      ensure('HECM_DRAW', true);
      const d = S.draw;
      const panels = panelHTML(hc('pAssume'),
        subHTML(hc('sLump')) + rowHTML(hc('lDrawAmt'), inputHTML('lumpAmount', 'money2', d.lumpAmount)) + rowHTML(hc('lBoY'), inputHTML('lumpYear', 'int', d.lumpYear)) +
        subHTML(hc('sMonthly')) + rowHTML(hc('lDrawAmt'), inputHTML('monthlyDraw', 'money2', d.monthlyDraw)) + rowHTML(hc('lStart'), inputHTML('drawStart', 'int', d.drawStart)) +
        rowHTML(hc('lEnd'), inputHTML('drawEnd', 'int', d.drawEnd)));
      const st = single(ctx, { head: ctx.t('head'), panels, loc: true, loc1: true, drawSum: true, cf: true, docs: () => WS.DRAW(ensure('HECM_DRAW')) });
      const paint = (k, ms) => {
        const dr = ensure('HECM_DRAW');
        setPem(st.pem, feed(rowAt(dr, k), k, { kind: 'HECM', monthly: st.monthly, cf, loanPmt: 'draw', noContrib: true }), ms);
        setStatusBox(ctx, ctx.$('[data-st]'), dr.status);
        setStatusBox(ctx, ctx.$('[data-dsum]'), dr.drawStatus);
      };
      const mk = (f, o) => Object.assign({ get: () => S.draw[f], set: (v) => { S.draw[f] = v; }, after: () => paint(st.k, 300) }, o);
      bindInputs(ctx, {
        lumpAmount: mk('lumpAmount', { min: 0 }), lumpYear: mk('lumpYear', { min: 1, max: () => S.maxYear, liveMax: () => S.maxYear }),
        monthlyDraw: mk('monthlyDraw', { min: 0 }), drawStart: mk('drawStart', { min: 0, max: () => S.maxMonth }), drawEnd: mk('drawEnd', { min: 0, max: () => S.maxMonth })
      });
      wireLocSwitch(ctx, () => paint(st.k, 300));
      wireStrip(ctx, st, paint);
      wireCfLink(ctx, st, paint);
      paint(0, 0);
    }
  });

  EFA.screen('fwloc4', {
    title: 'Credit-line HECM with savings deposits and optional payments',
    copy: {
      head: 'Your HECM Plus Regular Saving and Optional Payments',
      _notes: 'There is no mortgage payment to redirect here, so we start from zero. Add a monthly saving amount, an optional payment onto the HECM, or both.\n\n- Each optional payment reopens the same amount of credit line, and that room keeps growing. The chart beside Optional Payments shows it.\n- Ask: Would a payment you can skip any month, that grows your reserve when you make it, fit how you like to manage money?\nPAUSE'
    },
    render(ctx) {
      if (!begin('loc')) return notReady(ctx, ctx.t('head'));
      sampleNotice();
      resetOP('loc');
      const cf = showCF();
      ensure('HECM_OP', true); ensure('HECM');
      const st = single(ctx, { head: ctx.t('head'), panels: opPanelHTML(), loc: true, loc1: true, cf: true, docs: () => WS.OP(ensure('HECM_OP')), statusAt: [976, 790, 'translate(-100%, 0)'] });
      const paint = (k, ms) => {
        const op = ensure('HECM_OP');
        setPem(st.pem, feed(rowAt(op, k), k, { kind: 'HECM', monthly: st.monthly, cf, loanPmt: 'hecm', contribAlways: true }), ms);
        setStatusBox(ctx, ctx.$('[data-st]'), op.status);
      };
      bindInputs(ctx, opInputs(ctx, () => paint(st.k, 300)));
      ctx.on(ctx.$('[data-chart]'), 'click', () => openChart(ctx, ensure('HECM_OP'), ensure('HECM')));
      wireLocSwitch(ctx, () => paint(st.k, 300));
      wireStrip(ctx, st, paint);
      wireCfLink(ctx, st, paint);
      paint(0, 0);
    }
  });

  /* =====================================================================================
     12. SCREENS: HECM FOR PURCHASE (FWP4 / FWP5 / EWP4 / EWP5)
     ===================================================================================== */
  EFA.screen('fwh4psd1', {
    title: 'HECM for Purchase: downsizing benefits',
    copy: {
      head: 'HECM for Purchase (H4P)',
      b1: 'An H4P lets you buy a home that better suits your retirement.',
      b2: 'Keep and strengthen your cash reserves.',
      b3: 'No required monthly mortgage payments (property taxes, insurance and maintenance remain your responsibility).',
      b4: 'A practical alternative to paying all cash.',
      _notes: 'Many people picture their next home as a cash purchase. A HECM for Purchase is another way: buy the home that fits this stage of life and keep more of your savings working for you.\n\n- Ask: If you could move without emptying your savings, what would you look for in the next home?\nPAUSE'
    },
    render(ctx) { benefits(ctx, { keys: ['b1', 'b2', 'b3', 'b4'], width: 1184, top: 250 }); }
  });

  EFA.screen('fwh4pu1', {
    title: 'HECM for Purchase: upsizing benefits',
    copy: {
      head: 'Moving Up with a HECM for Purchase (H4P)',
      b1: 'Your buying power can rise by as much as 100%, depending on age and rates.',
      b2: 'No required monthly mortgage payments (taxes, insurance and maintenance are still required).',
      b3: 'The cash you need is typically 50 to 70% of the price, instead of 100% for an all-cash purchase.',
      b4: 'A wider and better choice of homes for retirement.',
      b5: 'More leverage, and the potential to create a larger legacy for your family.',
      foot: 'Buying power and the cash needed vary with the youngest borrower’s age, interest rates and HUD lending limits. The loan balance grows over time, which reduces the equity left to heirs.',
      _notes: 'For some families the next home is a step up: closer to the grandchildren, single-level living, a view they have waited for. A HECM for Purchase can widen what is within reach.\n\n- Ask: If your budget for the next home could stretch further, what would be on your list that is not there today?\nPAUSE'
    },
    render(ctx) { benefits(ctx, { keys: ['b1', 'b2', 'b3', 'b4', 'b5'], width: 1072, top: 214, gap: 18, foot: 'foot' }); }
  });

  /** the purchase screens read the sale settings from the session */
  const purchaseH = () => ({ saleProceeds: S.h4p.saleProceeds, cpSavRate: S.h4p.cpSavRate });
  EFA.screen('fwh4psd2', {
    title: 'Buying the next home with cash',
    copy: {
      head: 'A Cash Purchase',
      _notes: 'First, the familiar way: sell the current home and pay cash for the next one. Whatever is left over goes to savings, or the shortfall comes out of savings.\n\n- Step through the years and watch the savings tank carry every lifestyle shortfall alone.\n- Ask: How comfortable would you feel with this much of your net worth tied up in the house?\nPAUSE'
    },
    render(ctx) {
      if (!begin('purchase', { resetScale: true })) return notReady(ctx, ctx.t('head'));
      sampleNotice();
      const cf = showCF(), p = S.p;
      S.h4p.saleProceeds = (S.hh.homeValue || 0) - (S.hh.elBalance || 0);
      S.h4p.cpSavRate = S.hh.savRate;
      ensure('CP', true); ensure('H4P');
      const contrib = () => S.h4p.saleProceeds - p.PropertyValue;
      const panels = `<div class="b16-card b16-panel"><div class="b16-ph">${hc('gSale')}</div>
          ${rowHTML(hc('lProceeds'), inputHTML('sale', 'money2', S.h4p.saleProceeds))}
          <div class="b16-r"><span class="b16-rl" data-cl="1"></span><span class="b16-rv num" data-cv="1"></span></div>
          ${rowHTML(hc('lGrowth'), inputHTML('cpRate', 'pct', S.h4p.cpSavRate))}
          <div class="b16-ph" style="margin-top:6px">${hc('gPurchase')}</div>
          ${pRows(p, [['lPrice', p.PropertyValue], ['lCashDue', p.PropertyValue]])}</div>` + (cf ? cashPanel() : '');
      const st = single(ctx, { head: ctx.t('head'), panels, warnSlot: 'warnCash', cf: true, docs: () => WS.CP(ensure('CP')) });
      const contribRow = () => {
        const c = contrib();
        ctx.$('[data-cl]').innerHTML = hc(c < 0 ? 'lSavWd' : 'lSavContrib');
        ctx.$('[data-cv]').textContent = money(Math.abs(c), 2);
        if (EFA.edit && EFA.edit.on) EFA.edit.arm(ctx.$('[data-cl]'));
      };
      const paint = (k, ms) => {
        const cp = ensure('CP'), r = rowAt(cp, k), short = r.PropertyValue === 0;
        setPem(st.pem, feed(r, k, { kind: 'CP', monthly: st.monthly, cf, loanPmt: 'zero', liqFloor: true }), ms);
        setStatusBox(ctx, ctx.$('[data-st]'), cp.status);
        const w = ctx.$('[data-warn]'); w.hidden = !short; ctx.show(w, short);
        ctx.$('[data-stripw]').hidden = short;
      };
      const after = () => { contribRow(); paint(st.k, 300); };
      bindInputs(ctx, Object.assign({
        sale: { get: () => S.h4p.saleProceeds, set: (v) => { S.h4p.saleProceeds = v; }, after },
        cpRate: { get: () => S.h4p.cpSavRate, set: (v) => { S.h4p.cpSavRate = v; setHH('savRate', v); S.hh = household(); }, after, min: 0, max: 30 }
      }, cashInputs(after)));
      wireStrip(ctx, st, paint);
      wireCfLink(ctx, st, paint);
      contribRow(); paint(0, 0);
    }
  });

  EFA.screen('fwh4psd3', {
    title: 'Buying the next home with a HECM for Purchase',
    copy: {
      head: 'Buying with a HECM for Purchase',
      _notes: 'Same sale, same new home. This time you bring only the required cash to closing and the HECM for Purchase covers the rest, with no required monthly mortgage payment.\n\n- Compare the savings tank with the cash purchase, and notice the line of credit beside it.\n- Ask: What would that extra reserve let you do in the first few years in the new home?\nPAUSE'
    },
    render(ctx) {
      if (!begin('purchase')) return notReady(ctx, ctx.t('head'));
      sampleNotice();
      const cf = showCF(), p = S.p;
      ensure('H4P');
      const contrib = S.h4p.saleProceeds + p.Advance;
      const panels = `<div class="b16-card b16-panel"><div class="b16-ph">${hc('gSale')}</div>
          ${rowHTML(hc('lProceeds'), num(money(S.h4p.saleProceeds, 2)))}${rowHTML(hc('lSavContrib'), num(money(contrib, 2)))}${rowHTML(hc('lGrowth'), num(pctTxt(S.h4p.cpSavRate)))}
          <div class="b16-ph" style="margin-top:6px">${hc('pMortgage')}</div>${nameRow(p)}
          ${pRows(p, [['lPrice', p.LienPayoff], ['lMCA', p.MaximumClaim], ['lPL', p.PrincipalLimit], ['lCashDue', Math.abs(p.Advance)], ['lFCC', p.FinancedClosingCosts], ['lInitBal', p.MortgageBalance], ['lInitLoc', p.LOC]])}</div>`;
      const st = single(ctx, { head: ctx.t('head'), panels, warnSlot: 'warnH4P', loc: true, loc1: true, cf: true, docs: () => WS.H4P(ensure('H4P')) });
      const paint = (k, ms) => {
        const h = ensure('H4P'), r = rowAt(h, k), short = r.PropertyValue === 0;
        setPem(st.pem, feed(r, k, { kind: 'HECM', monthly: st.monthly, cf, loanPmt: 'hecm', locFloor: true }), ms);
        setStatusBox(ctx, ctx.$('[data-st]'), h.status);
        const w = ctx.$('[data-warn]'); w.hidden = !short; ctx.show(w, short);
        ctx.$('[data-stripw]').hidden = short;
      };
      wireLocSwitch(ctx, () => paint(st.k, 300));
      wireStrip(ctx, st, paint);
      wireCfLink(ctx, st, paint);
      paint(0, 0);
    }
  });

  EFA.screen('fwh4psd4', {
    title: 'Cash purchase vs HECM purchase, side by side',
    copy: {
      head: 'Paying All Cash vs. Buying with a HECM',
      _notes: 'The same move two ways: all cash on the left, a HECM for Purchase on the right, on one timeline.\n\n- Step through the years and compare savings, liquidity and equity at the same age.\n- Ask: At 85, which side would you rather be standing on?\nPAUSE'
    },
    render(ctx) {
      if (!begin('purchase')) return notReady(ctx, ctx.t('head'));
      sampleNotice();
      ensure('CP'); ensure('H4P');
      const st = double(ctx, {
        head: ctx.t('head'), locR: true, warn: { L: 'warnCash', R: 'warnH4P' },
        docs: [{ key: 'c.cash', data: () => WS.CP(ensure('CP')) }, { key: 'c.h4p', data: () => WS.H4P(ensure('H4P')) }, { key: 'c.both', data: () => WS.CP_H4P(ensure('CP'), ensure('H4P')) }]
      });
      const paint = (k, ms) => {
        const cp = ensure('CP'), h = ensure('H4P'), cf = showCF(), a = rowAt(cp, k), b = rowAt(h, k);
        setPem(st.pemL, feed(a, k, { kind: 'CP', cf, loanPmt: 'zero', liqFloor: true }), ms);
        setPem(st.pemR, feed(b, k, { kind: 'HECM', cf, loanPmt: 'hecm', locFloor: true }), ms);
        setStatusBox(ctx, ctx.$('[data-st="L"]'), cp.status);
        setStatusBox(ctx, ctx.$('[data-st="R"]'), h.status);
        ctx.show(ctx.$('[data-warn="L"]'), a.PropertyValue === 0);
        ctx.show(ctx.$('[data-warn="R"]'), b.PropertyValue === 0);
      };
      wireStrip(ctx, st, paint);
      paint(0, 0);
    }
  });

  EFA.screen('fwh4psd5', {
    title: 'HECM purchase with savings deposits and optional payments',
    copy: {
      head: 'Your HECM Purchase Plus Regular Saving and Optional Payments',
      _notes: 'After the purchase, you decide what to do with the money a mortgage payment would have taken. Save some each month, make an optional payment onto the HECM, or both.\n\n- Each optional payment reopens credit line room that keeps growing. The chart beside Optional Payments shows it.\n- Ask: Which matters more to you in the new home, a bigger savings balance or a bigger reserve on the line?\nPAUSE'
    },
    render(ctx) {
      if (!begin('purchase')) return notReady(ctx, ctx.t('head'));
      sampleNotice();
      resetOP('purchase');
      const cf = showCF();
      ensure('H4P_OP', true); ensure('H4P');
      const st = single(ctx, { head: ctx.t('head'), panels: opPanelHTML(), warnSlot: 'warnH4P', loc: true, loc1: true, cf: true, docs: () => WS.OP(ensure('H4P_OP')) });
      const paint = (k, ms) => {
        const op = ensure('H4P_OP'), r = rowAt(op, k), short = r.PropertyValue === 0;
        setPem(st.pem, feed(r, k, { kind: 'HECM', monthly: st.monthly, cf, loanPmt: 'hecm', contribAlways: true }), ms);
        setStatusBox(ctx, ctx.$('[data-st]'), op.status);
        const w = ctx.$('[data-warn]'); w.hidden = !short; ctx.show(w, short);
      };
      bindInputs(ctx, opInputs(ctx, () => paint(st.k, 300)));
      ctx.on(ctx.$('[data-chart]'), 'click', () => openChart(ctx, ensure('H4P_OP'), ensure('H4P')));
      wireLocSwitch(ctx, () => paint(st.k, 300));
      wireStrip(ctx, st, paint);
      wireCfLink(ctx, st, paint);
      paint(0, 0);
    }
  });

  EFA.screen('fwh4psd6', {
    title: 'Cash or HECM purchase vs HECM purchase with optional payments',
    copy: {
      hlCash: 'All Cash', hlHecm: 'HECM', restC: 'vs. HECM Purchase with Optional Payments', restH: 'vs. HECM Purchase with Optional Payments and Added Saving',
      _notes: 'On the right, the HECM purchase with the saving and optional payments you set. On the left, what you are comparing it to. Click the first words of the heading to switch the left side between the all-cash purchase and the plain HECM purchase.\n\n- Ask: Seeing them side by side, which plan lets you sleep better at night?\nPAUSE'
    },
    render(ctx) {
      if (!begin('purchase')) return notReady(ctx, ctx.t('hlCash'));
      sampleNotice();
      ensure('CP'); ensure('H4P'); ensure('H4P_OP');
      const leftC = ctx._b16LeftC !== false;
      const head = `<span class="b16-hl" data-hl="1">${ctx.t(leftC ? 'hlCash' : 'hlHecm')}</span> ${ctx.t(leftC ? 'restC' : 'restH')}`;
      const st = double(ctx, {
        head, locL: !leftC, locR: true,
        docs: [{ key: 'c.cash', data: () => WS.CP(ensure('CP')) }, { key: 'c.h4p', data: () => WS.H4P(ensure('H4P')) }, { key: 'c.op', data: () => WS.OP(ensure('H4P_OP')) },
          { key: 'c.both', data: () => (ctx._b16LeftC !== false ? WS.CP_OP(ensure('CP'), ensure('H4P_OP')) : WS.H4P_OP(ensure('H4P'), ensure('H4P_OP'))) }]
      });
      const paint = (k, ms) => {
        const cp = ensure('CP'), h = ensure('H4P'), op = ensure('H4P_OP'), cf = showCF();
        setPem(st.pemL, feed(leftC ? rowAt(cp, k) : rowAt(h, k), k, leftC ? { kind: 'CP', cf, loanPmt: 'zero', liqFloor: true } : { kind: 'HECM', cf, loanPmt: 'hecm' }), ms);
        setPem(st.pemR, feed(rowAt(op, k), k, { kind: 'HECM', cf, loanPmt: 'hecm', contribAlways: true }), ms);
        setStatusBox(ctx, ctx.$('[data-st="L"]'), leftC ? cp.status : h.status);
        setStatusBox(ctx, ctx.$('[data-st="R"]'), op.status);
      };
      ctx.on(ctx.$('[data-hl]'), 'click', () => { if (st.timer) clearTimeout(st.timer); ctx._b16LeftC = !leftC; ctx._b16K = st.k; this.render(ctx); EFA.numify(ctx.el); });
      wireStrip(ctx, st, paint);
      if (ctx._b16K != null) { st.k = ctx._b16K; ctx._b16K = null; }
      st.set(st.k, 0);
    }
  });

  /* =====================================================================================
     13. THREE KINDS OF MONEY (TTOM): one adjustable pie
     ===================================================================================== */
  const TT = { L: { key: 'wL', fill: '#2b4c80', ink: '#f7f5f1' }, A: { key: 'wA', fill: '#b8972e', ink: '#0d1e3a' }, T: { key: 'wT', fill: '#a3392a', ink: '#f7f5f1' } };
  /** keep A + L + T = 100 when one slider moves (spec ttom1 Calculations) */
  function ttBalance(v, which, x) {
    const o = Object.assign({}, v);
    if (which === 'A') { o.A = x; if (100 - (o.T + x) < 0) { o.L = 0; o.T = 100 - (o.L + x) < 0 ? 0 : 100 - (o.L + x); } else o.L = 100 - (o.T + x); }
    if (which === 'L') { o.L = x; if (100 - (o.T + x) < 0) { o.A = 0; o.T = 100 - (x + o.A) < 0 ? 0 : 100 - (x + o.A); } else o.A = 100 - (o.T + x); }
    if (which === 'T') { o.T = x; if (100 - (x + o.L) < 0) { o.A = 0; o.L = 100 - (x + o.A) < 0 ? 0 : 100 - (x + o.A); } else o.A = 100 - (x + o.L); }
    return o;
  }
  EFA.screen('ttom1', {
    title: 'Three kinds of money, adjustable pie',
    copy: {
      head: 'Three Kinds of Money', sA: 'Accumulated $', sL: 'Lifestyle $', sT: 'Transferred $', wL: 'Lifestyle', wA: 'Accumulated', wT: 'Transferred',
      _notes: 'Every dollar you will ever have lands in one of three places: the life you live today, the money you keep and grow, and the money that leaves the family through taxes, interest and fees.\n\n- Move the sliders with the client until the pie looks like their year. Click a slice to pull it out.\n- Ask: If you could shrink one of these slices, which one would you choose first?\nPAUSE'
    },
    render(ctx) {
      const A = EFA.art;
      let v = { A: 33, L: 34, T: 33 };
      const pulled = { L: false, A: false, T: false };
      const cx = 360, cy = 360, r = 318;
      const group = (k, cap) => `<div class="b16-card b16-tt-g"><div class="b16-tt-gh"><span class="cap"><i class="sw" style="background:${TT[k].fill}"></i>${ctx.t(cap)}</span><span class="v num" data-ttv="${k}"></span></div>
        <input type="range" min="0" max="100" step="1" value="${v[k]}" data-tt="${k}" aria-label="${k}" style="accent-color:${TT[k].fill}"></div>`;
      ctx.el.innerHTML = `
        <div class="b16-bh" style="top:44px">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule"></div>
        <div class="b16-tt-pie"><svg viewBox="0 0 720 720" aria-hidden="true"><circle cx="${cx}" cy="${cy + 10}" r="${r + 6}" fill="rgba(13,30,58,.08)"/><g data-ttg="1"></g></svg>
          ${['L', 'A', 'T'].map((k) => `<div class="b16-tt-lab" data-ttl="${k}" style="color:${TT[k].ink}">${ctx.t(TT[k].key, { cls: 'nm' })}<span class="num" data-ttp="${k}"></span></div>`).join('')}</div>
        <div class="b16-tt-ctl">${group('A', 'sA')}${group('L', 'sL')}${group('T', 'sT')}</div>`;
      const draw = () => {
        const order = ['L', 'A', 'T'];
        let a = 180, paths = '';
        order.forEach((k) => {
          const deg = v[k] * 3.6, a0 = a, a1 = a + deg, mid = (a0 + a1) / 2; a = a1;
          const lab = ctx.$(`[data-ttl="${k}"]`);
          if (v[k] <= 0) { lab.style.display = 'none'; return; }
          const ex = pulled[k] ? 26 : 0, dx = ex * Math.sin(mid * Math.PI / 180), dy = -ex * Math.cos(mid * Math.PI / 180);
          const gap = v[k] >= 100 ? 0 : 0.5;
          paths += `<path class="b16-tt-w" data-ttw="${k}" d="${A.wedge(cx, cy, r, a0 + gap, a1 - gap)}" fill="${TT[k].fill}" style="transform:translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)"/>`;
          const lr = v[k] >= 100 ? 0 : r * 0.65;
          const [lx, ly] = A.pt(cx + dx, cy + dy, lr, mid);
          lab.style.display = ''; lab.style.left = lx + 'px'; lab.style.top = ly + 'px';
          lab.classList.toggle('sm', v[k] < 12);
          ctx.$(`[data-ttp="${k}"]`).textContent = v[k] + '%';
        });
        ctx.$('[data-ttg]').innerHTML = paths;
        ['L', 'A', 'T'].forEach((k) => { ctx.$(`[data-ttv="${k}"]`).textContent = v[k] + '%'; const s = ctx.$(`[data-tt="${k}"]`); if (+s.value !== v[k]) s.value = v[k]; });
      };
      ctx.$$('[data-tt]').forEach((s) => s.addEventListener('input', () => {
        const k = s.dataset.tt, x = Math.round(+s.value);
        if (x === v[k]) return;
        v = ttBalance(v, k, x); draw();
      }));
      ctx.$('[data-ttg]').addEventListener('click', (e) => {
        if (EFA.edit && EFA.edit.on) return;
        const w = e.target.closest('[data-ttw]'); if (!w) return;
        pulled[w.dataset.ttw] = !pulled[w.dataset.ttw]; draw();
      });
      draw();
    }
  });

  /* =====================================================================================
     14. ENGINE EXPORT (EFA.engines.hecm). See docs/build/b16.md for the API.
     ===================================================================================== */
  Object.assign(HECM, {
    session: S,
    helpers: { Z, clamp, monthly, nper, fill, locY1, termMonths },
    begin, ensure, resetOP, opDefaults, baseInputs,
    proposals, proposal, sample, normalize, select, saveProposals, sampleMode, household, setHH, adoptSampleHousehold,
    showCF, setShowCF,
    ui: { single, double, stripHTML, wireStrip, mountPem, feed, setPem, partRect, panelHTML, rowHTML, subHTML, nameRow, inputHTML, bindInputs, parseIn,
      statusHTML, setStatusBox, summaryHTML, setSum, locSwitchHTML, wireLocSwitch, cfLinkHTML, wireCfLink, docsButtonHTML, docsChooserHTML, wireDocsChooser,
      openSetup, gainChart, openChart, hc, ht, footHTML, sampleNotice, noDataScreen, EM, VP1, VP2 },
    worksheets: WS, copyScreen: HS
  });
})();
