/* b13: Retirement Ready or Not? (RRON, LSR, RRON3), Return on Investment (ROI), Risk Account Benefits (RAB),
   RMD Calculator (RMD) and Roth IRA Conversion (RCONV).
   Structure, sequence, interactions and math follow the phase-1 specs; drawings and wording are new.
   The RRON projection engine is implemented once here and exposed as EFA.engines.rron. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P, fmt = EFA.fmt;

  /* =====================================================================
     Shared client-file values ("case data")
     Stored in the client file under namespace 'case' with the original key names, so every screen
     that shares an assumption (ages, income, rates, lists) reads the same value.
     Same convention as EFA.lib.caseData and the other modules: ages are whole years, money is dollars,
     percents are fractions (0.06 = 6%, list fields too), flags are true/false.
     ===================================================================== */
  const CASE_NS = 'case';
  const clone = (v) => (v == null || typeof v !== 'object' ? v : JSON.parse(JSON.stringify(v)));
  const num = (v, d) => {
    if (typeof v === 'number') return isFinite(v) ? v : (d || 0);
    if (typeof v === 'boolean') return v ? 1 : 0;
    const t = String(v == null ? '' : v).replace(/[^0-9.\-]/g, '');
    const x = parseFloat(t);
    return isFinite(x) ? x : (d || 0);
  };
  const CASE_DEF = {
    case_file_current_age: 42, case_file_spouse_age: 40, case_file_retirement_age: 65, case_file_life_expectancy: 84,
    case_file_project_to_age: 84,
    case_file_current_income: 102000, case_file_annual_savings: 6000, inflate_annual_savings: true,
    case_file_accumulated_savings: 88000,
    case_file_ror_accumulation: 0.06, case_file_ror_distribution: 0.05, case_file_ror_inflation: 0.03, rron_taxes: 0,
    desired_legacy: 0, current_lifestyle: 96000, retirement_income_desired: 96000, retirement_income_is_pv: true,
    inflate_withdrawals: true, rron_unify_ror: false,
    case_file_current_income_list: [{ description: 'Annual Earned Income', amount: 102000 }],
    case_file_annual_saving_list: [{ description: 'Annual Savings', amount: 6000, taxation: 'Tax Def.', risk: 'High', accessible: 'No' }],
    case_file_accumulated_saving_list: [{ account_name: 'Current Value of Investments', current_balance: 88000, taxation: 'Tax Def.', risk: 'High', accessible: 'No' }],
    case_file_defined_benefit_list: [], case_file_future_asset_list: [], case_file_future_expense_list: [],
    case_file_business_supported_lifestyle: 25000, case_file_business_value: 500000, case_file_ror_business_value: 0,
    rev_mortg_property_value: 500000, rev_mortg_existing_mortgage_balance: 0, rev_mortg_active_fee_schedule: '',
    rev_mortg_borrower_age: 62, rev_mortg_spouse_age: 62, rev_mortg_payment_structure: 'Tenure', rev_mortg_payment_term_in_year: 0,
    rev_mortg_closing_fee: 0, rev_mortg_third_party_fees: 0,
    rmd1_account_balance: 1000000,
    qp_account_balance: 100000, taxable_return: 0.05, case_file_ror_taxes: 0.30, qp_withdrawal_taxable_return: 0.05, qp_withdrawal_tax_bracket: 0.30
  };
  const CD = () => (EFA.lib && EFA.lib.caseData && typeof EFA.lib.caseData.get === 'function' ? EFA.lib.caseData : null);
  const cget = (k) => {
    const L = CD(); const v = L ? L.get(k, undefined) : (EFA.clients ? EFA.clients.get(CASE_NS, k, undefined) : undefined);
    return v === undefined || v === null ? clone(CASE_DEF[k]) : v;
  };
  const cset = (k, v) => { const L = CD(); if (L && typeof L.set === 'function') L.set(k, clone(v)); else if (EFA.clients) EFA.clients.set(CASE_NS, k, clone(v)); };
  /** app-wide hand-off slot (e.g. the Income Tax calculator hands back its effective rate) */
  const HANDOFF_NS = '_handoff';

  /* =====================================================================
     Finance helpers used by the specs (Excel-style signs)
     ===================================================================== */
  /** PMT(r, n, pv, fv, type) = (-pv*(1+r)^n - fv) / ((1 + r*type) * fvifa); 0 when the denominator is 0 */
  function PMT(r, n, pv, fv, type) {
    fv = fv || 0; type = type || 0;
    const fvifa = r === 0 ? n : (Math.pow(1 + r, n) - 1) / r;
    const den = (1 + r * type) * fvifa;
    if (!den || !isFinite(den)) return 0;
    return (-pv * Math.pow(1 + r, n) - fv) / den;
  }

  /* =====================================================================
     RRON projection engine (rron4.md "Engine"; business mode per rron4b.md)
     Usage:  const E = EFA.engines.rron.create({ business: false });  E.init();
             E.present / E.revised (rows), E.ybyP / E.ybyR, E.summary, E.TRS, E.res, E.lastsP / E.lastsR
     Rates in and out are fractions (0.06 = 6%), like every shared component.
     Every action returns { ok, msg } where msg is 'noGoal' or 'noSolution' when it failed.
     ===================================================================== */
  const tz = (x) => (Math.abs(x) < 0.0049 ? 0 : x);
  const BK = ['RT', 'RTD', 'RTA', 'ST', 'STD', 'STA'];
  const z6 = () => ({ RT: 0, RTD: 0, RTA: 0, ST: 0, STD: 0, STA: 0 });
  const zN = (n) => new Array(n).fill(0);
  const isMatch = (d) => /^.+match$/i.test(String(d == null ? '' : d));
  const bucketOf = (row) => (row.risk === 'Low' ? 'S' : 'R') + (row.taxation === 'Tax Def.' ? 'TD' : row.taxation === 'Tax Adv.' ? 'TA' : 'T');
  const RM_NAME = 'Reverse Mortgage';

  function rronEngine(o) {
    o = o || {};
    const E = {
      business: !!o.business, iter: false, c: null, N: 1, PTA: 84, unify: false, rev: null,
      present: [], revised: [], ybyP: [], ybyR: [], summary: [], TRS: 0, lastsP: 0, lastsR: 0,
      hasRM: false, rmExcluded: false, dbList: [],
      res: { RequiredAnnualSavings: 0, RequiredBalanceAtRetirement: 0, RequiredROR: 0, RequiredWorkLongerAge: 100, SpendLessAmount: 0, LifestyleReduction: 0, BusinessGrowthRate: 0, BusinessSaleValue: 0 }
    };

    /* ---- load a working copy of the client file (nothing is saved back) ---- */
    E.load = function (src) {
      const g = src ? ((k) => clone(src[k] !== undefined ? src[k] : CASE_DEF[k])) : ((k) => clone(cget(k)));
      const L = (k) => (Array.isArray(g(k)) ? g(k) : []);
      const c = {};
      c.A0 = Math.round(num(g('case_file_current_age')));
      c.RAin = Math.round(num(g('case_file_retirement_age')));
      c.RA = Math.max(c.A0, c.RAin); // a retirement age below today's age means retiring now
      c.LE = Math.round(num(g('case_file_life_expectancy')));
      c.PTAcase = Math.round(num(g('case_file_project_to_age')));
      c.INC = num(g('case_file_current_income')); c.AS = num(g('case_file_annual_savings')); c.ACC = num(g('case_file_accumulated_savings'));
      c.RID = num(g('retirement_income_desired')); c.isPV = !!g('retirement_income_is_pv');
      c.inflS = !!g('inflate_annual_savings'); c.inflW = !!g('inflate_withdrawals');
      c.rA = num(g('case_file_ror_accumulation')); c.rD = num(g('case_file_ror_distribution'));
      c.i = num(g('case_file_ror_inflation')); c.T = num(g('rron_taxes'));
      c.LEG = num(g('desired_legacy')); c.unifyPref = !!g('rron_unify_ror'); c.CL = num(g('current_lifestyle'));
      c.BV = num(g('case_file_business_value')); c.rB = num(g('case_file_ror_business_value'));
      c.BSL = num(g('case_file_business_supported_lifestyle'));
      c.lists = {
        income: L('case_file_current_income_list'), annual: L('case_file_annual_saving_list'), acc: L('case_file_accumulated_saving_list'),
        db: L('case_file_defined_benefit_list'), fa: L('case_file_future_asset_list'), fe: L('case_file_future_expense_list')
      };
      // bucket parts
      const annual = z6(), match = z6(), acc = z6();
      c.lists.annual.forEach((r) => { const b = bucketOf(r), a = num(r.amount); annual[b] += a; if (isMatch(r.description)) match[b] += a; });
      c.lists.acc.forEach((r) => { acc[bucketOf(r)] += num(r.current_balance); });
      c.annual = annual; c.match = match; c.acc = acc;
      E.c = c;
      E.dbList = c.lists.db.map((r) => Object.assign({}, r));
      return E;
    };
    /** revised savings parts for a revised annual total X */
    E.partsFor = function (X) {
      const c = E.c, rev = z6(), revMatch = z6();
      if (c.AS === 0) { rev.RT = X; return { annual: rev, match: revMatch }; }
      BK.forEach((b) => {
        rev[b] = c.annual[b] > 0 ? X * c.annual[b] / c.AS : 0;
        revMatch[b] = c.annual[b] > 0 ? X * c.match[b] / c.AS : 0;
      });
      return { annual: rev, match: revMatch };
    };
    E.W0 = (age) => (E.c.isPV ? E.c.RID * Math.pow(1 + E.c.i, age - E.c.A0) : E.c.RID);
    E.setSavings = function (X) { E.rev.X = X; E.rev.parts = E.partsFor(X); };
    E.resetRevised = function () {
      const c = E.c;
      E.rev = { RA: c.RA, A: c.rA, D: c.rD, I: c.i, LS: E.W0(c.RA), X: c.AS, B: c.rB, parts: null };
      E.setSavings(c.AS);
    };

    /* ---- per-year tables: defined benefits, future expenses, future assets ---- */
    E.tables = function () {
      const c = E.c, N = E.N, T = c.T;
      const DB = { inflow: zN(N), taxes: zN(N), hiddenTaxes: zN(N), spendable: zN(N), hiddenSpendable: zN(N), rm: zN(N) };
      let hasRM = false, rmExcluded = false;
      E.dbList.forEach((r) => {
        const isRM = r.description === RM_NAME;
        if (isRM) { hasRM = true; if (r.exclude === true) rmExcluded = true; }
        if (r.exclude === true) return;
        const s = Math.max(Math.round(num(r.start_age)) - c.A0, 0), e = Math.min(Math.round(num(r.end_age)) - c.A0, N - 1);
        for (let y = s, k = 0; y <= e; y++, k++) {
          const amt = num(r.amount) * Math.pow(1 + num(r.cola), k);
          if (isRM) { DB.rm[y] += amt; continue; }
          const tax = amt * T * num(r.taxable);
          DB.inflow[y] += amt; DB.taxes[y] += tax; DB.spendable[y] += amt - tax;
          if (r.hide === true) { DB.hiddenTaxes[y] += tax; DB.hiddenSpendable[y] += amt - tax; }
        }
      });
      const FE = zN(N);
      c.lists.fe.forEach((r) => {
        const s = Math.max(Math.round(num(r.age)) - c.A0, 0), e = Math.min(Math.round(num(r.age)) + Math.round(num(r.years)) - c.A0, N - 1);
        for (let y = s, k = 0; y < e; y++, k++) FE[y] += num(r.amount) * Math.pow(1 + num(r.inflate), k);
      });
      const FA = { inflow: zN(N), taxes: zN(N), spendable: zN(N) };
      c.lists.fa.forEach((r) => {
        const y = Math.min(Math.max(Math.round(num(r.age)) - c.A0, 0), N - 1);
        const amt = num(r.amount), tax = amt * T * num(r.taxable);
        FA.inflow[y] += amt; FA.taxes[y] += tax; FA.spendable[y] += amt - tax;
      });
      E.DB = DB; E.FE = FE; E.FA = FA; E.hasRM = hasRM; E.rmExcluded = rmExcluded;
    };

    /* ---- one projection (present = case values, revised = lever values) ---- */
    E.run = function (revised) {
      const c = E.c, N = E.N, T = c.T, DB = E.DB, FE = E.FE, FA = E.FA, iter = revised && E.iter;
      const R = revised ? E.rev : null;
      const RA = revised ? R.RA : c.RA, rAcc = revised ? R.A : c.rA, rDis = revised ? R.D : c.rD;
      const iC = c.i, iX = revised ? R.I : c.i;
      const annual = revised ? R.parts.annual : c.annual, match = revised ? R.parts.match : c.match;
      const LS0 = revised ? R.LS : E.W0(c.RA);
      const rB = revised ? R.B : c.rB, bExp = revised ? 0 : 1;
      const tdDiv = T > 0 ? 1 - T : 1;
      const rows = [];
      let prevEOY = null, prevReqLS = 0, InflowCum = 0;
      for (let y = 0; y < N; y++) {
        const Age = c.A0 + y;
        // 1. contributions
        const cc = z6(), cm = z6();
        if (Age < RA) { const g = c.inflS ? Math.pow(1 + iC, y) : 1; BK.forEach((b) => { cc[b] = annual[b] * g; cm[b] = match[b] * g; }); }
        const Contrib = BK.reduce((s, b) => s + cc[b], 0);
        let ContribRisk = cc.RT + cc.RTD + cc.RTA, ContribSafe = cc.ST + cc.STD + cc.STA, AnnCon = Contrib;
        const AnnConMatch = BK.reduce((s, b) => s + cm[b], 0);
        // 2. future assets and expenses
        const FutAss = FA.spendable[y], FutExp = FE[y];
        // 3. available balances before withdrawals (tax-deferred buckets carried after tax)
        const base = z6(), av = z6();
        BK.forEach((b) => { base[b] = y === 0 ? c.acc[b] + annual[b] : prevEOY[b] + cc[b]; });
        BK.forEach((b) => { av[b] = (b === 'RTD' || b === 'STD') ? (T > 0 ? base[b] * (1 - T) : base[b]) : base[b]; });
        let Rsum = av.RT + av.RTD + av.RTA, Ssum = av.ST + av.STD + av.STA;
        // 4. risk share
        const ratio = (Rsum + Ssum) > 0 ? Rsum / (Rsum + Ssum) : 1;
        // 5. future asset split
        const FARisk = FutAss * ratio, FASafe = FutAss - FARisk;
        av.RT += FARisk; cc.RT += FARisk; ContribRisk += FARisk;
        av.ST += FASafe; cc.ST += FASafe; ContribSafe += FASafe;
        AnnCon += FutAss;
        // 6. business (sold at the start of the case retirement year)
        let PotBV = 0, BusLS = 0, Sale = 0;
        if (E.business) {
          if (Age === c.RA) { Sale = c.BV * Math.pow(1 + rB, y); av.RT += Sale; }
          else if (Age < c.RA) { PotBV = c.BV * Math.pow(1 + rB, y + bExp); BusLS = c.inflS ? c.BSL * Math.pow(1 + iC, y) : c.BSL; }
        }
        // 7. within-tank shares
        Rsum = av.RT + av.RTD + av.RTA; Ssum = av.ST + av.STD + av.STA;
        const pT = Rsum > 0 ? av.RT / Rsum : 1, pTD = Rsum > 0 ? av.RTD / Rsum : 0, pTA = Rsum > 0 ? av.RTA / Rsum : 0;
        const qT = Ssum > 0 ? av.ST / Ssum : 1, qTD = Ssum > 0 ? av.STD / Ssum : 0, qTA = Ssum > 0 ? av.STA / Ssum : 0;
        // 8. future expense split (recorded for documentation)
        const FERisk = FutExp > 0 ? FutExp * ratio : 0, FESafe = FutExp > 0 ? FutExp - FERisk : 0;
        // 9. clamp (skipped while a solver iterates)
        let avail = Rsum + Ssum;
        if (!iter) { avail = Math.max(avail, 0); Rsum = Math.max(Rsum, 0); Ssum = Math.max(Ssum, 0); BK.forEach((b) => { av[b] = Math.max(av[b], 0); }); }
        // 10-13. required and actual lifestyle
        const ReqLS = Age === RA ? LS0 : Age > RA ? (c.inflW ? prevReqLS * (1 + iX) : LS0) : 0;
        const SumDB = DB.spendable[y] + (revised ? DB.rm[y] : 0);
        const ReqLSAft = Math.max(ReqLS - SumDB, 0);
        const ActLS = iter ? ReqLSAft + FutExp : tz(Math.min(ReqLSAft + FutExp, avail));
        // 14. gross withdrawals
        const W = z6();
        W.RT = tz(ActLS * ratio * pT); W.RTD = tz(ActLS * ratio * pTD / tdDiv); W.RTA = tz(ActLS * ratio * pTA);
        W.ST = tz(ActLS * (1 - ratio) * qT); W.STD = tz(ActLS * (1 - ratio) * qTD / tdDiv); W.STA = tz(ActLS * (1 - ratio) * qTA);
        const WRisk = tz(W.RT + W.RTD + W.RTA), WSafe = tz(W.ST + W.STD + W.STA), WTotal = WRisk + WSafe;
        // 15. beginning-of-year balances (tax-deferred back to pre-tax)
        const BOY = z6();
        BOY.RT = av.RT - W.RT; BOY.RTD = tz((T > 0 ? av.RTD / (1 - T) : av.RTD) - W.RTD); BOY.RTA = tz(av.RTA - W.RTA);
        BOY.ST = av.ST - W.ST; BOY.STD = tz((T > 0 ? av.STD / (1 - T) : av.STD) - W.STD); BOY.STA = tz(av.STA - W.STA);
        const BOYRisk = tz(BOY.RT + BOY.RTD + BOY.RTA), BOYSafe = tz(BOY.ST + BOY.STD + BOY.STA), BalBeg = BOYRisk + BOYSafe;
        // 16-18. growth, tax on taxable growth, end of year
        const gr = Age >= RA ? rDis : rAcc;
        const Growth = z6(); BK.forEach((b) => { Growth[b] = BOY[b] * gr; });
        const AnnGrowth = BK.reduce((s, b) => s + Growth[b], 0);
        const GTaxR = Growth.RT * T, GTaxS = Growth.ST * T;
        const EOY = z6();
        EOY.RT = tz(BOY.RT + Growth.RT - GTaxR); EOY.ST = tz(BOY.ST + Growth.ST - GTaxS);
        ['RTD', 'RTA', 'STD', 'STA'].forEach((b) => { EOY[b] = tz(BOY[b] + Growth[b]); });
        const EOYRisk = EOY.RT + EOY.RTD + EOY.RTA, EOYSafe = EOY.ST + EOY.STD + EOY.STA;
        const BalanceEOY = BalBeg + AnnGrowth; // before growth taxes (reproduced)
        // 19-20. lifestyle plus benefits, present values
        const HiddenDB = DB.hiddenSpendable[y];
        const LSPlusDB = SumDB + ActLS - HiddenDB;
        const dfl = Math.pow(1 + iX, y);
        const PVLSPre = ActLS / dfl, PVLSAft = LSPlusDB / dfl;
        // 21. inflows and their taxes
        let Inflow, InflowTax, Earned = 0;
        if (Age < RA) {
          Earned = c.inflS ? c.INC * Math.pow(1 + iX, y) : c.INC;
          Inflow = Earned;
          InflowTax = Inflow * T + DB.taxes[y] + FA.taxes[y] - (cc.STD + cc.RTD - cm.STD - cm.RTD) * T;
          Inflow += DB.inflow[y] + FA.inflow[y];
        } else {
          Inflow = DB.inflow[y] + FA.inflow[y]; InflowTax = DB.taxes[y] + FA.taxes[y];
        }
        InflowCum += Inflow;
        // 22-24. taxes and spendable lifestyle
        const WTaxR = tz(W.RTD * T), WTaxS = tz(W.STD * T), PotTaxR = tz(EOY.RTD * T), PotTaxS = tz(EOY.STD * T);
        const TaxesPaid = InflowTax + WTaxR + WTaxS + GTaxR + GTaxS;
        const Net = tz(Inflow + WRisk + WSafe - TaxesPaid + GTaxR + GTaxS);
        const LifestyleDollars = Net - AnnCon + AnnConMatch + BusLS;
        const LifestylePct = Net > 0 ? LifestyleDollars / (Net + BusLS) : 0;
        rows.push({
          y, Age, c: cc, cm, Contrib, ContribRisk, ContribSafe, AnnCon, AnnConMatch, FutAss, FutExp, FERisk, FESafe,
          StartSavings: y === 0 ? BK.reduce((s, b) => s + c.acc[b], 0) : BK.reduce((s, b) => s + prevEOY[b], 0),
          avail, ratio, PotBV, BusLS, Sale, ReqLS, SumDB, ReqLSAft, ActLS, W, WRisk, WSafe, WTotal, BOY, BOYRisk, BOYSafe, BalBeg,
          Growth, AnnGrowth, GTaxR, GTaxS, EOY, EOYRisk, EOYSafe, BalanceEOY, HiddenDB, LSPlusDB, PVLSPre, PVLSAft, YrRev: y + 1,
          Earned, Inflow, InflowTax, InflowCum, WTaxR, WTaxS, PotTaxR, PotTaxS, TaxesPaid, Net, LifestyleDollars, LifestylePct
        });
        prevEOY = EOY; prevReqLS = ReqLS;
      }
      return rows;
    };

    /* ---- year-by-year data for the money machine, tanks and grid ---- */
    E.makeYBY = function (arr, isRev) {
      const c = E.c, N = E.N, retRow = Math.max(c.RA - c.A0, 0), LIP = arr[N - 1].InflowCum;
      return arr.map((r, s) => {
        const P0 = E.present[s];
        const pre = s < retRow;
        const Lifestyle = (pre ? r.LifestyleDollars : r.LSPlusDB) - r.FutExp;
        const PVLifestyle = (pre ? r.LifestyleDollars / Math.pow(1 + c.i, s) : r.PVLSAft) - r.FutExp;
        const LifestyleTarget = Math.max(r.ReqLS - r.HiddenDB, 0);
        const denom = isRev ? Math.max(P0.ReqLS - P0.HiddenDB, 0) : LifestyleTarget;
        const presTarget = P0.ReqLS - P0.HiddenDB;
        let fill;
        if (!isRev) fill = presTarget > 0 ? Math.min(r.LSPlusDB / presTarget, 1) : 0;
        else fill = (presTarget > 0 && r.ReqLS > 0) ? Math.min(r.LSPlusDB / presTarget, 1) : 0;
        return {
          Age: r.Age, LifetimeIncomePotential: LIP, RemainingIncome: LIP - r.InflowCum,
          RiskTankBalance: r.EOYRisk + r.PotBV, SafeTankBalance: r.EOYSafe, RiskTankPotTaxes: r.PotTaxR, SafeTankPotTaxes: r.PotTaxS,
          FutureLSContributions: r.AnnCon - r.c.RTD - r.c.STD,
          WithdrawalsThisYear: r.WRisk + r.WSafe + r.GTaxR + r.GTaxS,
          IncomeThisYear: r.Inflow - r.c.RTD - r.c.STD + r.cm.RTD - r.cm.STD,
          TaxesPaidThisYear: r.TaxesPaid, ExpensesPaidThisYear: r.FutExp, TDContributionsThisYear: r.c.RTD + r.c.STD,
          Outflow: pre ? r.LifestyleDollars : r.LSPlusDB,
          PVOutflow: pre ? r.LifestyleDollars / Math.pow(1 + c.i, s) : r.PVLSAft,
          Lifestyle, PVLifestyle, LifestyleTarget, RequiredLifestyle: Math.max(r.ReqLS, 0),
          LSRegulator: LifestyleTarget > 0 ? (denom > 0 ? Math.min(Lifestyle / denom * 100, 100) : 100) : 100,
          DiverterValve: r.AnnCon > 0 ? r.ContribSafe / r.AnnCon * 180 - 90 : 180,
          SlicePercentFill: fill,
          TankBalanceBOY: r.WTotal + r.BalBeg
        };
      });
    };
    E.lastsUntil = function (arr, ownFill, stopRow) {
      let v = 0; // initialised each run (the original kept the previous value when no row qualified)
      for (let s = 0; s < arr.length; s++) {
        const f = ownFill(s);
        if (f > 0.9) v = arr[s].Age; else if (s >= stopRow) break;
      }
      return v;
    };

    /* ---- recompute everything after any change ---- */
    E.sizeN = function () { const c = E.c; E.N = Math.max(1, Math.max(c.LE, 100, c.PTAcase, E.PTA) - c.A0 + 1); };
    E.compute = function () {
      const c = E.c;
      E.sizeN(); E.tables();
      E.present = E.run(false);
      E.revised = E.run(true);
      E.ybyP = E.makeYBY(E.present, false);
      E.ybyR = E.makeYBY(E.revised, true);
      E.summary = E.present.map((p, s) => {
        const r = E.revised[s];
        return { Age: p.Age, PresentBalance: p.BalanceEOY + p.PotBV, RevisedBalance: r.BalanceEOY + r.PotBV, PresentLifestyle: p.LSPlusDB, RevisedLifestyle: r.LSPlusDB, RevisedPVLifestyle: r.PVLSAft };
      });
      E.TRS = E.revised.reduce((m, r) => Math.max(m, r.Inflow, r.EOYRisk, r.EOYSafe), 0);
      const retRow = Math.max(c.RA - c.A0, 0);
      E.lastsP = E.lastsUntil(E.present, (s) => E.ybyP[s].SlicePercentFill, retRow);
      E.lastsR = E.lastsUntil(E.revised, (s) => { const r = E.revised[s], d = r.ReqLS - r.HiddenDB; return d > 0 ? Math.min(r.LSPlusDB / d, 1) : 0; }, Math.max(E.rev.RA - c.A0, 0));
      return E;
    };

    /* ---- solvers (secant on the revised projection) ---- */
    const PTR = () => Math.min(Math.max(E.PTA - E.c.A0, 0), E.N - 1);
    const retRowC = () => Math.max(E.c.RA - E.c.A0, 0);
    E.objective = function () { E.iter = true; const r = E.run(true); E.iter = false; return r[PTR()].BalanceEOY - E.c.LEG; };
    function secant(apply, x0, x1, tol, clamp) {
      apply(x0); let f0 = E.objective();
      apply(x1); let f1 = E.objective();
      let ok = false;
      for (let k = 0; k < 99; k++) {
        if ((f1 - f0) * f1 === 0) { ok = true; break; }
        let step = (x1 - x0) / (f1 - f0) * f1;
        if (clamp) step = Math.max(-clamp, Math.min(clamp, step));
        if (!isFinite(step)) break;
        if (Math.abs(step) < tol) { ok = true; break; }
        x0 = x1; f0 = f1; x1 = x1 - step; apply(x1); f1 = E.objective();
      }
      if (!isFinite(x1)) ok = false;
      return { x: x1, ok };
    }
    const goalSet = () => E.c.RID + E.c.LEG >= 0.0049;
    const keep = () => JSON.parse(JSON.stringify(E.rev));
    const balAtRet = () => { const r = E.run(true)[retRowC()]; return r.WTotal + r.BalBeg; };
    E.solveSavings = function () {
      const before = keep();
      const s = secant((x) => E.setSavings(x), 0, E.c.AS + 5001, 0.0049);
      if (!isFinite(s.x)) E.rev = before; else E.setSavings(s.x);
      if (s.ok) { E.res.RequiredAnnualSavings = s.x; E.res.RequiredBalanceAtRetirement = balAtRet(); }
      return s.ok;
    };
    E.solveReturn = function () {
      const before = keep(), uni = E.unify;
      const s = secant((x) => { E.rev.A = x; if (uni) E.rev.D = x; }, 0.10, 0.15, 1e-6, 5);
      if (!isFinite(s.x)) E.rev = before; else { E.rev.A = s.x; if (uni) E.rev.D = s.x; }
      if (s.ok) { E.res.RequiredROR = s.x; E.res.RequiredBalanceAtRetirement = balAtRet(); }
      return s.ok;
    };
    E.solveSpend = function () {
      const c = E.c, before = keep(), rr = retRowC(), ptr = PTR();
      E.rev.LS = 0;
      const bal0 = E.run(true)[rr].BalanceEOY;
      const revRows = E.run(true);
      let sumDB = 0; for (let s = rr; s <= ptr; s++) sumDB += revRows[s].SumDB;
      const avgDB = sumDB / Math.max(ptr - rr, 1);
      const x1 = -PMT(c.rD - c.i, ptr - rr, bal0, c.LEG, 1) + avgDB;
      const s = secant((x) => { E.rev.LS = x; }, 0, x1, 0.0049);
      if (!isFinite(s.x)) E.rev = before; else E.rev.LS = s.x;
      if (s.ok) { E.res.SpendLessAmount = s.x; const w = E.W0(c.RA); if (w > 0) E.res.LifestyleReduction = 1 - s.x / w; }
      return s.ok;
    };
    E.solveBusiness = function () {
      const c = E.c, before = keep();
      const s = secant((x) => { E.rev.B = x; }, 0, 0.10, 1e-6);
      if (!isFinite(s.x)) E.rev = before; else E.rev.B = s.x;
      if (s.ok) { E.res.BusinessGrowthRate = s.x; E.res.BusinessSaleValue = c.BV * Math.pow(1 + s.x, retRowC()); E.res.RequiredBalanceAtRetirement = balAtRet(); }
      return s.ok;
    };
    E.solveWork = function () {
      const c = E.c; let found = false;
      for (let a = E.rev.RA; a <= E.PTA; a++) {
        E.rev.RA = a; E.rev.LS = E.W0(a);
        if (E.objective() > 0.0049) { found = true; E.res.RequiredWorkLongerAge = a; break; }
      }
      return found;
    };

    /* ---- init (on open, on Reset and after the defined benefits change) ---- */
    E.init = function (src) {
      E.load(src);
      const c = E.c;
      E.unify = c.unifyPref || c.A0 >= c.RA;
      E.resetRevised();
      E.PTA = c.LE;
      E.compute();
      if (goalSet()) E.solveSavings();
      E.resetRevised();
      E.compute();
      return E;
    };

    /* ---- lever actions ---- */
    const done = (ok) => { E.compute(); return ok ? { ok: true } : { ok: false, msg: 'noSolution' }; };
    const calcPrep = (lastAge) => { if (!goalSet()) return false; E.PTA = Math.round(num(lastAge, E.PTA)); E.sizeN(); E.tables(); E.present = E.run(false); return true; };
    E.specifyROR = function (rate, unify) { E.unify = !!unify || E.c.A0 >= E.c.RA; E.rev.A = num(rate); if (E.unify) E.rev.D = num(rate); return done(true); };
    E.calcROR = function (lastAge, unify) { E.unify = !!unify || E.c.A0 >= E.c.RA; if (!calcPrep(lastAge)) return { ok: false, msg: 'noGoal' }; return done(E.solveReturn()); };
    E.specifySave = function (X) { E.setSavings(num(X)); return done(true); };
    E.calcSave = function (lastAge) { if (!calcPrep(lastAge)) return { ok: false, msg: 'noGoal' }; return done(E.solveSavings()); };
    E.specifyWork = function (age) { age = Math.round(num(age)); E.rev.RA = Math.max(age, E.c.A0); E.rev.LS = E.W0(age); return done(true); };
    E.calcWork = function (lastAge) { if (!calcPrep(lastAge)) return { ok: false, msg: 'noGoal' }; return done(E.solveWork()); };
    E.specifySpend = function (pv) { E.rev.LS = num(pv) * Math.pow(1 + E.c.i, Math.max(E.c.RA - E.c.A0, 0)); return done(true); };
    E.calcSpend = function (lastAge) { if (!calcPrep(lastAge)) return { ok: false, msg: 'noGoal' }; return done(E.solveSpend()); };
    E.setInflation = function (rate) { E.rev.I = num(rate); return done(true); };
    E.specifyBusiness = function (g) { E.rev.B = num(g); return done(true); };
    E.calcBusiness = function (lastAge) {
      if (E.c.BV < 0.0049) { E.PTA = Math.round(num(lastAge, E.PTA)); return done(true); }
      if (!calcPrep(lastAge)) return { ok: false, msg: 'noGoal' };
      return done(E.solveBusiness());
    };
    E.toggleRM = function () { E.dbList.forEach((r) => { if (r.description === RM_NAME) r.exclude = !(r.exclude === true); }); return done(true); };

    /* ---- derived figures used by screens and reports ---- */
    E.rorPoints = function () { const c = E.c; return c.A0 >= c.RA ? 100 * (E.rev.D - c.rD) : 100 * (E.rev.A - c.rA); };
    /** percent more than the original assumption; null when the original rate is 0 (guarded) */
    E.rorPercent = function () { const c = E.c; const base = c.A0 >= c.RA ? c.rD : c.rA, rev = c.A0 >= c.RA ? E.rev.D : E.rev.A; return base > 0 ? 100 * (rev - base) / base : null; };
    E.revRow = () => Math.min(Math.max(E.rev.RA - E.c.A0, 0), E.N - 1);
    E.caseRow = () => Math.min(Math.max(E.c.RA - E.c.A0, 0), E.N - 1);
    E.saleValue = function () { const c = E.c; return c.BV > 0 ? c.BV * Math.pow(1 + E.rev.B, Math.min(Math.max(c.RA - c.A0, 0), E.N - 1)) : 0; };

    /** option figures for the reports: every solver re-run from the case baseline to life expectancy, then the revised state restored */
    E.reportFigures = function () {
      const c = E.c, saved = keep(), savedPTA = E.PTA, savedUnify = E.unify, savedRes = Object.assign({}, E.res);
      const out = { goal: goalSet() };
      const fromCase = () => { E.resetRevised(); E.PTA = c.LE; E.sizeN(); E.tables(); E.present = E.run(false); };
      const balRows = () => E.run(true).map((r) => [r.Age, r.BalanceEOY + r.PotBV]);
      const presentRows = E.run(false).map((r) => [r.Age, r.BalanceEOY + r.PotBV]);
      out.present = presentRows;
      if (out.goal) {
        fromCase(); E.unify = c.unifyPref || c.A0 >= c.RA;
        out.rorOk = E.solveReturn(); out.ror = E.rev.A; out.rorD = E.rev.D; out.rorPoints = E.rorPoints(); out.rorPercent = E.rorPercent(); out.rorRows = balRows();
        fromCase();
        if (c.A0 !== c.RA) { out.saveOk = E.solveSavings(); out.save = E.rev.X; out.saveBal = balAtRet(); out.saveRows = balRows(); }
        else { out.saveOk = true; out.save = 0; out.saveBal = 0; out.saveRows = balRows(); }
        fromCase(); E.res.RequiredWorkLongerAge = 100;
        out.workOk = E.solveWork(); out.work = out.workOk ? E.rev.RA : null; out.workRows = balRows();
        fromCase();
        out.spendOk = E.solveSpend(); out.spend = E.rev.LS; out.spendPV = E.rev.LS / Math.pow(1 + c.i, Math.max(c.RA - c.A0, 0)); out.spendRows = balRows();
        if (E.business && c.BV > 0) { fromCase(); out.bizOk = E.solveBusiness(); out.biz = E.rev.B; out.bizSale = c.BV * Math.pow(1 + E.rev.B, retRowC()); out.bizRows = balRows(); }
      }
      E.rev = saved; E.PTA = savedPTA; E.unify = savedUnify; E.res = savedRes; E.compute();
      return out;
    };
    return E;
  }
  EFA.engines = EFA.engines || {};
  EFA.engines.rron = { create: rronEngine, defaults: CASE_DEF, PMT, readCase: cget, writeCase: cset, namespace: CASE_NS };

  /* =====================================================================
     Styles (all classes prefixed b13-)
     ===================================================================== */
  EFA.css('b13', `
  .b13-abs { position: absolute; }
  .b13-head { position: absolute; left: 110px; right: 110px; top: 44px; display: grid; justify-items: center; gap: 12px; text-align: center; }
  .b13-head .st-h1, .b13-head .st-h2 { max-width: 1300px; }
  .b13-card { background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 16px; box-shadow: 0 14px 36px rgba(13,30,58,.08); box-sizing: border-box; }
  .b13-tint { background: linear-gradient(180deg, #fffdf8 0%, #f6f1e6 100%); }
  .stage .st-pill.b13-gold { background: #b8972e; border-color: #b8972e; color: #0d1e3a; }
  .stage button.st-pill.b13-gold:hover { background: #d5bd68; border-color: #d5bd68; }
  .stage .st-pill.b13-ghost { background: #fffdf8; color: #0d1e3a; border-color: #cbd5e3; }
  .stage button.st-pill.b13-ghost:hover { background: #0d1e3a; color: #f7f5f1; border-color: #0d1e3a; }
  .b13-lb { font: 600 15px/1.2 "DM Sans", sans-serif; letter-spacing: .06em; text-transform: uppercase; color: #667389; }
  .b13-link { color: #2b4c80; border-bottom: 1.5px dotted currentColor; cursor: pointer; }
  .b13-link:hover { color: #8a6e22; }
  .b13-in { height: 52px; border: 1.5px solid #cbd5e3; border-radius: 10px; background: #fff; padding: 0 14px; font: 600 22px/1 "DM Sans", sans-serif; color: #0d1e3a; width: 100%; box-sizing: border-box; text-align: right; font-variant-numeric: lining-nums tabular-nums; }
  .b13-in:focus { outline: none; border-color: #b8972e; box-shadow: 0 0 0 3px rgba(184,151,46,.2); }
  .b13-in.sm { height: 42px; font-size: 18px; border-radius: 8px; padding: 0 10px; }
  .b13-in.txt { text-align: left; font-weight: 500; }
  .b13-wait { display: grid; place-items: center; text-align: center; color: #667389; font: 500 20px/1.45 "DM Sans", sans-serif; padding: 24px; }
  .b13-wait .b13-spin { width: 46px; height: 46px; border-radius: 50%; border: 4px solid #e3e8f0; border-top-color: #b8972e; margin: 0 auto 16px; animation: b13spin 1.1s linear infinite; }
  @keyframes b13spin { to { transform: rotate(360deg); } }
  .b13-chip { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #d6cfc4; background: #fffdf8; color: #0d1e3a; display: inline-grid; place-items: center; box-shadow: 0 4px 10px rgba(13,30,58,.12); cursor: pointer; flex: 0 0 auto; padding: 0; transition: background .2s ease, color .2s ease, transform .2s ease; position: relative; }
  .b13-chip:hover { background: #0d1e3a; color: #d5bd68; transform: translateY(-1px); }
  .b13-chip .b13-badge { position: absolute; right: -6px; top: -6px; min-width: 20px; height: 20px; border-radius: 10px; background: #b8972e; color: #0d1e3a; font: 700 12px/20px "DM Sans", sans-serif; text-align: center; padding: 0 4px; box-sizing: border-box; }
  .b13-check { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; border: 0; background: transparent; padding: 0; font: 600 15px/1 "DM Sans", sans-serif; letter-spacing: .06em; text-transform: uppercase; color: #0d1e3a; user-select: none; }
  .b13-check .bx { width: 24px; height: 24px; border-radius: 6px; border: 2px solid #2b4c80; display: grid; place-items: center; background: #fff; transition: background .2s ease; }
  .b13-check[aria-checked="true"] .bx { background: #0d1e3a; border-color: #0d1e3a; }
  .b13-check .bx svg { opacity: 0; }
  .b13-check[aria-checked="true"] .bx svg { opacity: 1; }
  .b13-sw { width: 50px; height: 28px; border-radius: 14px; background: #cbd5e3; border: 0; position: relative; cursor: pointer; padding: 0; transition: background .2s ease; }
  .b13-sw::after { content: ""; position: absolute; left: 3px; top: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: transform .2s ease; }
  .b13-sw[aria-pressed="true"] { background: #b8972e; }
  .b13-sw[aria-pressed="true"]::after { transform: translateX(22px); }
  .b13-dlg { display: grid; gap: 18px; }
  .b13-dlg .row { display: grid; grid-template-columns: 1fr 230px; align-items: center; gap: 18px; }
  .b13-dlg .row .b13-lb { font-size: 16px; color: #0d1e3a; }
  .b13-dlg .foot { display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap; padding-top: 6px; }
  .b13-dlg p { margin: 0; font: 400 20px/1.5 "DM Sans", sans-serif; color: #0d1e3a; }
  .st-overlay.b13-ov-sm .st-overlay-in { width: 760px; }
  .st-overlay.b13-ov-md .st-overlay-in { width: 980px; }
  .st-overlay.b13-ov-lg .st-overlay-in { width: 1240px; }
  .st-overlay.b13-ov-noclose .st-overlay-x { display: none; }
  .b13-num { font-family: "DM Sans", sans-serif; font-variant-numeric: lining-nums tabular-nums; }
  .b13-note { font: 400 15px/1.45 "DM Sans", sans-serif; color: #667389; }

  /* rron1 */
  .b13-s1-row { position: absolute; left: 80px; width: 1440px; top: 452px; height: 140px; }
  .b13-s1-track { position: absolute; left: 56px; right: 56px; top: 66px; height: 8px; border-radius: 4px; background: linear-gradient(90deg, #2b4c80, #d5bd68); opacity: .5; }
  .b13-score { position: absolute; top: 14px; width: 112px; height: 112px; border-radius: 50%; border: 3px solid #fffdf8; cursor: pointer; padding: 0;
    background: radial-gradient(circle at 34% 30%, #2b4c80 0%, #1d3863 48%, #0d1e3a 100%); color: #f7f5f1; box-shadow: 0 14px 28px rgba(13,30,58,.24), inset 0 -6px 12px rgba(0,0,0,.18);
    font: 700 40px/1 "DM Sans", sans-serif; display: grid; place-items: center; transition: transform .25s ease, background .25s ease, color .25s ease, box-shadow .25s ease; }
  .b13-score:hover, .b13-score:focus-visible { transform: translateY(-6px) scale(1.05); background: radial-gradient(circle at 34% 30%, #f0e6c4 0%, #d5bd68 45%, #b8972e 100%); color: #0d1e3a; box-shadow: 0 18px 34px rgba(138,110,34,.32); outline: none; }
  .b13-score.picked { background: radial-gradient(circle at 34% 30%, #f0e6c4 0%, #d5bd68 45%, #b8972e 100%); color: #0d1e3a; transform: scale(1.12); }
  .b13-s1-end { position: absolute; top: 632px; width: 300px; font: 600 17px/1.3 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6e22; }

  /* rmd1 */
  .b13-rmd-top { position: absolute; left: 240px; width: 1120px; top: 44px; padding: 26px 40px 24px; display: grid; justify-items: center; gap: 16px; text-align: center; }
  .b13-rmd-top .st-seg-b { font-size: 20px; padding: 12px 28px; }
  .b13-rmd-desc { font: 400 22px/1.4 "DM Sans", sans-serif; color: #0d1e3a; min-height: 31px; }
  .b13-rmd-data { position: absolute; left: 480px; width: 640px; top: 318px; padding: 22px 34px; display: grid; gap: 14px; transition: opacity .5s ease; }
  .b13-rmd-data .row { display: grid; grid-template-columns: 1fr 230px; align-items: center; gap: 18px; }
  .b13-rmd-data .row > span { font: 700 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-rmd-data .st-input { text-align: right; }
  .b13-rmd-go { position: absolute; left: 0; right: 0; top: 572px; display: flex; justify-content: center; transition: opacity .4s ease; }
  .b13-rmd-res { position: absolute; left: 320px; width: 960px; top: 560px; padding: 22px 36px; display: grid; grid-template-columns: 150px 1fr; gap: 30px; align-items: center; transition: opacity .5s ease; }
  .b13-rmd-res .k { font: 700 18px/1.2 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #8a6e22; }
  .b13-rmd-res .v { font: 700 54px/1.05 "DM Sans", sans-serif; color: #0d1e3a; margin: 6px 0; }
  .b13-rmd-res .f { font: 500 19px/1.3 "DM Sans", sans-serif; color: #667389; }
  .b13-rmd-foot { position: absolute; left: 160px; right: 160px; top: 764px; text-align: center; display: grid; gap: 6px; justify-items: center; }
  .b13-rmd-foot a { font: 600 17px/1.2 "DM Sans", sans-serif; color: #2b4c80; text-decoration: none; border-bottom: 1.5px dotted currentColor; }

  /* rab1 */
  .b13-rab-dd { position: absolute; left: 110px; top: 58px; width: 520px; z-index: 6; }
  .b13-rab-dd > button { width: 100%; height: 62px; border-radius: 12px; border: 1.5px solid #cbd5e3; background: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; font: 600 22px/1 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; box-shadow: 0 6px 16px rgba(13,30,58,.06); }
  .b13-rab-dd > button:hover { border-color: #b8972e; }
  .b13-rab-dd .ph { color: #667389; font-weight: 500; }
  .b13-rab-menu { position: absolute; left: 0; right: 0; top: 70px; background: #fffdf8; border: 1px solid #d6cfc4; border-radius: 12px; box-shadow: 0 18px 40px rgba(13,30,58,.18); padding: 8px; display: grid; gap: 4px; }
  .b13-rab-menu button { text-align: left; border: 0; background: transparent; border-radius: 8px; padding: 14px 16px; font: 600 20px/1.2 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; }
  .b13-rab-menu button:hover, .b13-rab-menu button[aria-selected="true"] { background: #f0e6c4; }
  .b13-rab-title { position: absolute; left: 110px; top: 150px; font: 600 40px/1.1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b13-rab-panel { position: absolute; left: 110px; top: 210px; width: 1010px; height: 576px; padding: 30px 40px; overflow: hidden; }
  .b13-rab-rows { display: grid; gap: 22px; }
  .b13-rab-row { display: grid; grid-template-columns: 52px 1fr; gap: 18px; align-items: start; }
  .b13-rab-row .tx { font: 700 25px/1.25 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-rab-row .bl { padding-top: 4px; }
  .b13-rab-empty { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; padding: 40px; }
  .b13-rab-empty p { font: 500 24px/1.45 "DM Sans", sans-serif; color: #667389; max-width: 560px; margin: 18px auto 0; }
  .b13-rab-pg { position: absolute; right: 22px; bottom: 16px; display: flex; gap: 10px; }
  .b13-rab-ben { position: absolute; left: 1170px; top: 58px; width: 320px; display: grid; gap: 9px; }
  .b13-rab-ben h3 { margin: 0 0 6px; text-align: center; font: 600 34px/1.1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b13-rab-b { height: 50px; border-radius: 10px; border: 1.5px solid #cbd5e3; background: #fffdf8; display: flex; align-items: center; padding: 0 16px; font: 600 17px/1.15 "DM Sans", sans-serif; color: #0d1e3a; transition: background .4s ease, border-color .4s ease, box-shadow .4s ease; box-sizing: border-box; }
  .b13-rab-b .dot { width: 12px; height: 12px; border-radius: 50%; background: #cbd5e3; margin-right: 12px; flex: 0 0 auto; transition: background .4s ease; }
  .b13-rab-b.on { background: linear-gradient(100deg, #f0e6c4 0%, #d5bd68 100%); border-color: #b8972e; box-shadow: 0 6px 16px rgba(138,110,34,.22); }
  .b13-rab-b.on .dot { background: #0d1e3a; }

  /* rconv1 */
  .b13-rc1 { position: absolute; left: 224px; width: 1152px; top: 300px; display: grid; gap: 26px; }
  .b13-rc1-box { padding: 22px 30px; font: 700 26px/1.35 "DM Sans", sans-serif; color: #0d1e3a; border-radius: 14px; background: linear-gradient(180deg, #fffdf8, #f3ede0); border: 1px solid #d6cfc4; box-shadow: 0 10px 26px rgba(13,30,58,.08); }
  .b13-rc1-box b { color: #8a6e22; }

  /* rconv2 */
  .b13-rc2-in { position: absolute; left: 150px; width: 760px; top: 150px; padding: 26px 36px; display: grid; gap: 10px; }
  .b13-rc2-in .row { display: grid; grid-template-columns: 1fr 200px; align-items: center; gap: 20px; }
  .b13-rc2-in .row > label { font: 700 20px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-rc2-in .st-input { text-align: right; height: 48px; }
  .b13-rc2-go { position: absolute; left: 150px; width: 760px; top: 742px; display: flex; justify-content: center; }
  .b13-rc2-art { position: absolute; left: 980px; top: 150px; width: 480px; height: 580px; }
  .b13-rc2-res { position: absolute; left: 110px; width: 920px; top: 196px; padding: 24px 34px; display: grid; gap: 0; transition: opacity .5s ease; }
  .b13-rc2-res .ln { display: grid; grid-template-columns: 1fr 210px; align-items: end; gap: 20px; padding: 9px 0; font: 500 21px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-rc2-res .ln .v { text-align: right; font-weight: 700; padding-bottom: 2px; }
  .b13-rc2-res .ln.u .v { border-bottom: 2px solid #0d1e3a; }
  .b13-rc2-res .ln.tot { font-weight: 700; }
  .b13-rc2-res .ln.tot .t { text-align: right; }
  .b13-rc2-res .verdict { margin-top: 14px; padding: 16px 20px; border-radius: 12px; background: #0d1e3a; color: #f7f5f1; font: 600 22px/1.35 "DM Sans", sans-serif; }
  .b13-rc2-res .verdict .v { color: #d5bd68; font-weight: 700; }
  .b13-rc2-bars { position: absolute; left: 1080px; width: 410px; top: 196px; height: 520px; }
  .b13-rc2-bar { position: absolute; bottom: 70px; width: 140px; border-radius: 12px 12px 4px 4px; transition: height 1s cubic-bezier(.3,.7,.2,1); }
  .b13-rc2-bv { position: absolute; width: 200px; text-align: center; font: 700 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; transition: bottom 1s cubic-bezier(.3,.7,.2,1); }
  .b13-rc2-bl { position: absolute; bottom: 0; width: 200px; height: 60px; text-align: center; font: 700 16px/1.25 "DM Sans", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #667389; }
  .b13-rc2-bar-base { position: absolute; left: 0; right: 0; bottom: 68px; height: 3px; background: #d6cfc4; }
  .b13-rc2-bb { position: absolute; left: 110px; width: 920px; top: 742px; display: flex; justify-content: center; gap: 16px; align-items: center; }

  /* roi1 */
  .b13-roi-in { position: absolute; left: 330px; width: 940px; top: 236px; padding: 30px 40px; display: grid; gap: 24px; }
  .b13-roi-in .row { display: grid; grid-template-columns: 210px 1fr; align-items: center; gap: 20px; }
  .b13-roi-in .row > span { font: 700 21px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-roi-in .st-seg-b { font-size: 17px; padding: 10px 14px; }
  .b13-roi-art { position: absolute; left: 400px; width: 800px; top: 574px; height: 190px; }
  .b13-roi-gridwrap { position: absolute; left: 110px; width: 820px; top: 196px; }
  .b13-roi-scroll { height: 470px; overflow: auto; border-radius: 14px; border: 1px solid #d6cfc4; background: #fffdf8; box-shadow: 0 10px 26px rgba(13,30,58,.06); }
  .b13-roi-scroll .st-table th { position: sticky; top: 0; z-index: 2; }
  .b13-roi-scroll .st-table td.cell { cursor: pointer; }
  .b13-roi-scroll .st-table td.cell:hover { background: #f0e6c4 !important; color: #0d1e3a; }
  .b13-roi-scroll .st-table td.neg { color: #8a2e2e; }
  .b13-roi-side { position: absolute; left: 980px; width: 510px; top: 196px; display: grid; gap: 18px; }
  .b13-roi-res { padding: 22px 28px; display: grid; gap: 12px; }
  .b13-roi-res .ln { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; font: 500 20px/1.25 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-roi-res .ln b { font-weight: 700; }
  .b13-roi-res .ln.big { font-size: 22px; padding-bottom: 10px; border-bottom: 1px solid #d6cfc4; }
  .b13-roi-res .ln.big b { font-size: 40px; color: #8a6e22; }
  .b13-roi-chart { padding: 16px 20px 10px; }
  .b13-roi-hint { font: 500 18px/1.45 "DM Sans", sans-serif; color: #667389; padding: 18px 22px; }

  /* rron2 / rron2b: assumptions sheet */
  .b13-as { position: absolute; left: 110px; width: 1380px; top: 120px; padding: 6px 40px 0; }
  .b13-as-band { display: grid; grid-template-columns: repeat(12, 1fr); column-gap: 30px; padding: 18px 0 20px; border-bottom: 1px solid rgba(13,30,58,.10); align-items: end; }
  .b13-as-f { display: grid; gap: 8px; min-width: 0; }
  .b13-as-f .lb { display: flex; align-items: center; gap: 8px; font: 600 15px/1.2 "DM Sans", sans-serif; letter-spacing: .07em; text-transform: uppercase; color: #667389; white-space: nowrap; min-height: 18px; }
  .b13-as-f .lb .b13-link { color: #2b4c80; }
  .b13-as-f .lb small { font: 500 14px/1.2 "DM Sans", sans-serif; letter-spacing: .02em; text-transform: none; color: #8a6e22; white-space: nowrap; }
  .b13-as-f .in { display: flex; align-items: center; gap: 12px; }
  .b13-as-f .in .b13-in { flex: 1 1 auto; min-width: 0; height: 54px; }
  .b13-as-f .ro { flex: 1 1 auto; height: 54px; border-radius: 10px; background: rgba(227,232,240,.55); display: flex; align-items: center; justify-content: flex-end; padding: 0 14px; font: 600 21px/1 "DM Sans", sans-serif; color: #0d1e3a; box-sizing: border-box; }
  .b13-as-life { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 18px -40px 0; padding: 22px 40px 26px; background: linear-gradient(180deg, #f6efdc 0%, #f0e6c4 100%); border-radius: 0 0 16px 16px; border-top: 2px solid #b8972e; align-items: center; }
  .b13-as-life .k { font: 700 16px/1.2 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #8a6e22; }
  .b13-as-life .v { font: 700 46px/1.1 "DM Sans", sans-serif; color: #0d1e3a; margin-top: 6px; }
  .b13-as-life .eq { font: 500 17px/1.4 "DM Sans", sans-serif; color: #0d1e3a; margin-top: 4px; }
  .b13-as-life .eq .t { border-bottom: 1.5px dotted #8a6e22; cursor: help; }
  .b13-as-life .in { display: flex; align-items: center; gap: 16px; margin-top: 8px; }
  .b13-as-life .in .b13-in { width: 260px; height: 58px; font-size: 26px; }
  .b13-pvfv { font: 700 19px/1 "DM Sans", sans-serif; color: #2b4c80; border: 1.5px solid #2b4c80; border-radius: 999px; padding: 9px 14px; cursor: pointer; background: #fffdf8; }
  .b13-pvfv:hover { background: #0d1e3a; color: #f0e6c4; border-color: #0d1e3a; }

  /* list editors */
  .b13-led-scroll { max-height: 470px; overflow: auto; border: 1px solid #d6cfc4; border-radius: 12px; }
  .b13-led-t { width: 100%; border-collapse: collapse; font: 500 17px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-led-t th { position: sticky; top: 0; z-index: 1; background: #0d1e3a; color: #f7f5f1; font: 700 12.5px/1.2 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; padding: 10px 10px; text-align: left; white-space: nowrap; }
  .b13-led-t td { padding: 7px 8px; border-bottom: 1px solid rgba(13,30,58,.08); vertical-align: middle; }
  .b13-led-t tbody tr:nth-child(even) td { background: rgba(227,232,240,.4); }
  .b13-led-t .b13-in.sm { height: 42px; }
  .b13-led-cyc { height: 42px; min-width: 96px; border-radius: 8px; border: 1.5px solid #cbd5e3; background: #fff; font: 600 16px/1 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; padding: 0 10px; white-space: nowrap; }
  .b13-led-cyc:hover { border-color: #b8972e; background: #fbf6e8; }
  .b13-led-del { width: 38px; height: 38px; border-radius: 50%; border: 0; background: transparent; color: #667389; cursor: pointer; display: grid; place-items: center; }
  .b13-led-del:hover { background: rgba(179,64,46,.12); color: #b3402e; }
  .b13-led-empty { padding: 26px; text-align: center; color: #667389; font: 500 18px/1.4 "DM Sans", sans-serif; }
  .b13-led-foot { display: flex; align-items: center; gap: 18px; margin-top: 16px; }
  .b13-led-add { width: 52px; height: 52px; border-radius: 50%; border: 0; background: #0d1e3a; color: #f0e6c4; display: grid; place-items: center; cursor: pointer; box-shadow: 0 8px 18px rgba(13,30,58,.25); }
  .b13-led-add:hover { background: #b8972e; color: #0d1e3a; }
  .b13-led-tot { margin-left: auto; font: 600 18px/1 "DM Sans", sans-serif; color: #667389; }
  .b13-led-tot b { color: #0d1e3a; font-size: 22px; margin-left: 8px; }
  .b13-est { display: grid; gap: 16px; }
  .b13-est .box { background: #f6f1e6; border: 1px solid #d6cfc4; border-radius: 12px; padding: 16px 18px; display: grid; gap: 10px; }
  .b13-est .row { display: grid; grid-template-columns: 1fr 230px; align-items: center; gap: 16px; }
  .b13-est .row > span { font: 600 17px/1.2 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-est .res { border-radius: 12px; background: #0d1e3a; color: #f7f5f1; padding: 18px 20px; font: 600 22px/1.3 "DM Sans", sans-serif; cursor: pointer; text-align: center; }
  .b13-est .res b { color: #d5bd68; }
  .b13-est .src { font: 400 17px/1.5 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-est .st-seg-b { font-size: 16px; padding: 8px 16px; }

  /* rron4 / rron4b: projection with levers */
  .b13-pj-note { position: absolute; top: 8px; font: 600 15px/1.2 "DM Sans", sans-serif; color: #8a6e22; letter-spacing: .02em; white-space: nowrap; }
  .b13-pj-note.ror { left: 110px; cursor: pointer; border-bottom: 1.5px dotted #b8972e; }
  .b13-pj-levers { position: absolute; left: 40px; right: 40px; top: 32px; height: 124px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; }
  .b13-pj-lev { display: grid; grid-template-rows: 1fr auto; justify-items: center; align-items: end; gap: 8px; text-align: center; }
  .b13-pj-lev .val { font: 700 22px/1.2 "DM Sans", sans-serif; color: #0d1e3a; min-height: 54px; display: flex; flex-direction: column; justify-content: flex-end; }
  .b13-pj-lev .val small { font-size: 16px; color: #667389; font-weight: 600; }
  .b13-pj-lb { min-width: 220px; height: 46px; border-radius: 999px; border: 1.5px solid #2b4c80; background: linear-gradient(180deg, #fffdf8, #ece6d9); color: #0d1e3a; font: 700 17px/1 "DM Sans", sans-serif; letter-spacing: .02em; cursor: pointer; box-shadow: 0 6px 14px rgba(13,30,58,.14), inset 0 1px 0 #fff; transition: transform .2s ease, background .2s ease, color .2s ease; }
  .b13-pj-lb:hover { transform: translateY(-2px); border-color: #b8972e; }
  .b13-pj-lb.used { background: linear-gradient(180deg, #2b4c80, #0d1e3a); color: #f0e6c4; border-color: #0d1e3a; }
  .b13-pj-main { position: absolute; left: 0; right: 0; top: 170px; height: 604px; }
  .b13-pj-grid { position: absolute; left: 110px; width: 1380px; top: 0; height: 604px; display: grid; grid-template-rows: auto 1fr; overflow: hidden; }
  .b13-pj-scroll { overflow: auto; position: relative; }
  .b13-pj-t { width: 100%; border-collapse: separate; border-spacing: 0; font: 500 20px/1.2 "DM Sans", sans-serif; color: #0d1e3a; font-variant-numeric: lining-nums tabular-nums; table-layout: fixed; }
  .b13-pj-t td { padding: 8px 18px; text-align: right; border-bottom: 1px solid rgba(13,30,58,.07); }
  .b13-pj-t tr:nth-child(even) td { background: rgba(227,232,240,.42); }
  .b13-pj-t td.age { text-align: center; font-weight: 700; color: #1d3863; background: rgba(240,230,196,.35) !important; }
  .b13-pj-t td.hl { box-shadow: inset 0 0 0 3px #b8972e; font-weight: 700; }
  .b13-pj-t td.rv { color: #0d1e3a; }
  .b13-pj-t tr.rret td { border-top: 2px solid rgba(184,151,46,.6); }
  .b13-pj-h { display: grid; grid-template-columns: 1fr 1fr 150px 1fr 1fr; padding: 14px 14px 0; gap: 0; }
  .b13-pj-h .grp { grid-column: span 2; background: #0d1e3a; color: #f7f5f1; border-radius: 12px 12px 0 0; text-align: center; padding: 10px; font: 600 26px/1.1 "Cormorant Garamond", Georgia, serif; }
  .b13-pj-h .sub { background: #1d3863; color: #e3e8f0; text-align: right; padding: 10px 18px; font: 700 12.5px/1.25 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; }
  .b13-pj-h .sub.ag { background: transparent; color: #8a6e22; text-align: center; }
  .b13-pj-h .sub.lnk { cursor: pointer; text-decoration: underline dotted; text-underline-offset: 3px; }
  .b13-pj-h .sub.lnk:hover { color: #d5bd68; }
  .b13-pj-tank { position: absolute; top: 0; width: 740px; height: 604px; padding: 22px 30px; display: grid; grid-template-rows: auto 1fr auto; }
  .b13-pj-tank h3 { margin: 0; }
  .b13-pj-tk { display: grid; grid-template-columns: 250px 1fr; gap: 30px; align-items: center; }
  .b13-pj-tkv { position: relative; width: 250px; height: 320px; }
  .b13-pj-tkv .lab { position: absolute; left: 0; right: 0; top: 118px; text-align: center; pointer-events: none; }
  .b13-pj-tkv .lab b { display: block; font: 700 30px/1.1 "DM Sans", sans-serif; color: #0d1e3a; text-shadow: 0 1px 0 rgba(255,255,255,.7); }
  .b13-pj-tkv .lab span { display: block; margin: 6px auto 0; max-width: 170px; font: 700 12px/1.25 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #0d1e3a; }
  .b13-pj-tkc { font: 500 14px/1.35 "DM Sans", sans-serif; color: #667389; text-align: center; margin: 4px -10px 0; text-wrap: balance; }
  .b13-pj-inc { display: grid; gap: 8px; text-align: right; }
  .b13-pj-inc .a { font: 700 46px/1.05 "DM Sans", sans-serif; color: #0d1e3a; display: flex; justify-content: flex-end; align-items: center; gap: 12px; }
  .b13-pj-inc .k { font: 700 14px/1.2 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #8a6e22; }
  .b13-pj-inc .r { font: 600 21px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-pj-fund { display: grid; gap: 6px; }
  .b13-pj-fund .k { font: 700 14px/1.2 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #667389; }
  .b13-pj-ro { min-height: 20px; font: 500 15px/1.3 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-pj-pem { position: absolute; top: 0; height: 604px; width: 790px; overflow: hidden; }
  .b13-pj-div { position: absolute; left: 798px; top: 10px; width: 3px; height: 584px; background: #0d1e3a; border-radius: 2px; }
  .b13-pj-pemh { position: absolute; top: 4px; left: 0; right: 0; text-align: center; font: 600 24px/1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; z-index: 3; pointer-events: none; }
  .b13-pj-bot { position: absolute; left: 40px; right: 40px; top: 786px; height: 52px; display: flex; align-items: center; gap: 14px; }
  .b13-pj-bot .st-pill { min-height: 46px; padding: 6px 18px; font-size: 16px; }
  .b13-pj-bot .st-seg-b { font-size: 16px; padding: 8px 16px; }
  .b13-pj-bot .sp { flex: 1 1 auto; }
  .b13-pj-pc { display: flex; align-items: center; gap: 8px; }
  .b13-pj-pc .b13-in { width: 74px; height: 42px; font-size: 19px; text-align: center; padding: 0 6px; }
  .b13-pj-pc .b13-chip { width: 38px; height: 38px; }
  .b13-pj-pc input[type=range] { width: 120px; accent-color: #b8972e; }
  .b13-pj-house { position: relative; width: 50px; height: 46px; border-radius: 12px; border: 1.5px solid #cbd5e3; background: #fffdf8; color: #0d1e3a; cursor: pointer; display: grid; place-items: center; }
  .b13-pj-house .no { position: absolute; inset: 3px; display: grid; place-items: center; }
  .b13-pj-docs { width: 50px; height: 50px; border-radius: 50%; border: 0; background: #0d1e3a; color: #f0e6c4; display: grid; place-items: center; cursor: pointer; box-shadow: 0 8px 18px rgba(13,30,58,.25); }
  .b13-pj-docs:hover { background: #b8972e; color: #0d1e3a; }
  .b13-pj-disc { position: absolute; left: 110px; width: 1180px; top: 846px; margin: 0; font-size: 12.5px !important; }
  .b13-ch { display: grid; grid-template-columns: 1fr 1.6fr; gap: 30px; }
  .b13-ch h4 { margin: 0 0 10px; font: 700 15px/1.2 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #8a6e22; }
  .b13-ch h5 { margin: 12px 0 6px; font: italic 600 20px/1.2 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b13-ch .lk { display: block; width: 100%; text-align: left; border: 0; background: transparent; padding: 9px 12px; border-radius: 8px; font: 600 19px/1.2 "DM Sans", sans-serif; color: #2b4c80; cursor: pointer; }
  .b13-ch .lk:hover { background: #f0e6c4; color: #0d1e3a; }
  .b13-ch .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
  .b13-lv { display: grid; gap: 18px; }
  .b13-lv .opts { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .b13-lv .opt { min-height: 64px; border-radius: 12px; border: 1.5px solid #cbd5e3; background: #fffdf8; font: 700 18px/1.25 "DM Sans", sans-serif; color: #0d1e3a; cursor: pointer; padding: 10px 14px; }
  .b13-lv .opt[aria-pressed="true"] { background: #0d1e3a; color: #f0e6c4; border-color: #0d1e3a; }
  .b13-lv .pr { font: 500 19px/1.45 "DM Sans", sans-serif; color: #0d1e3a; margin: 0; }
  .b13-lv .row { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
  .b13-lv .row .b13-in { width: 220px; }
  .b13-rep { display: grid; gap: 22px; font: 400 19px/1.55 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-rep h2 { margin: 0; font: 600 40px/1.1 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b13-rep h3 { margin: 0; font: 600 28px/1.15 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .b13-rep p { margin: 0; }
  .b13-rep ul { margin: 0; padding-left: 22px; display: grid; gap: 4px; }
  .b13-rep .sec { padding: 20px 24px; border: 1px solid #d6cfc4; border-radius: 14px; background: #fffdf8; display: grid; gap: 12px; }
  .b13-rep .kv { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 26px; }
  .b13-rep .kv div { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px dotted #d6cfc4; padding: 4px 0; font-size: 17px; }
  .b13-rep .kv b { font-weight: 700; }
  .b13-rep .fig { font-weight: 700; color: #8a6e22; }
  .b13-rep .cover { text-align: center; padding: 30px 20px; background: linear-gradient(180deg, #0d1e3a, #1d3863); color: #f7f5f1; border-radius: 14px; display: grid; gap: 10px; }
  .b13-rep .cover h2 { color: #f7f5f1; font-size: 52px; }
  .b13-rep .cover .who { font: 600 18px/1.3 "DM Sans", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #d5bd68; }
  .b13-rep .cap { font-size: 14px; color: #667389; }

  /* rron3 */
  .b13-r3-ctl { position: absolute; left: 34px; top: 236px; width: 150px; display: grid; gap: 22px; justify-items: center; text-align: center; z-index: 4; }
  .b13-r3-ctl .b13-lb { color: #0d1e3a; }
  .b13-r3-ctl .age { font: 700 40px/1 "DM Sans", sans-serif; color: #0d1e3a; }
  .b13-r3-ctl .b13-in { width: 100px; text-align: center; }
  .b13-r3-ctl input[type=range] { width: 120px; accent-color: #b8972e; }
  .b13-r3-win { position: absolute; left: 196px; top: 70px; width: 1370px; height: 770px; overflow: hidden; }
  `);

  /* =====================================================================
     Small shared UI helpers
     ===================================================================== */
  const U = EFA.util || {};
  const esc = (s) => (U.esc ? U.esc(s) : String(s == null ? '' : s));
  const editing = () => !!(EFA.edit && EFA.edit.on);
  const LIB = (n) => (EFA.lib && EFA.lib[n]) || null;
  const ICON = {
    pen: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6L9 21H3v-6z"/><path d="M12 6l6 6"/></svg>',
    house: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
    trash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    plus: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    tick: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    print: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/></svg>',
    chevL: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    chevR: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    chevLL: '<svg width="20" height="18" viewBox="0 0 28 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5l-7 7 7 7M22 5l-7 7 7 7"/></svg>',
    chevRR: '<svg width="20" height="18" viewBox="0 0 28 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5l7 7-7 7M14 5l7 7-7 7"/></svg>',
    down: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    no: '<svg viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="16" fill="none" stroke="#b3402e" stroke-width="4"/><path d="M9 31 31 9" stroke="#b3402e" stroke-width="4" stroke-linecap="round"/></svg>'
  };
  /** money with 0 dp unless the stored value has a fraction (then exactly 2) */
  const money02 = (v) => fmt.money(v, { dp: Math.abs(v - Math.round(v)) > 1e-9 ? 2 : 0 });
  /** percent text for a fraction: whole numbers without decimals, otherwise up to 2 */
  const pctTxt = (f) => { const p = Math.round(num(f) * 10000) / 100; return fmt.num(p, Math.abs(p - Math.round(p)) > 1e-9 ? 2 : 0) + '%'; };
  const nf = (n, dp) => fmt.num(n, dp || 0);
  const N = (s) => `<span class="num">${s}</span>`;
  /** a quiet "still loading" notice when a shared component is not in yet */
  const notReady = (ctx) => ctx.toast(ctx.text('libWait') || '');
  /** a check box built from a button (label is HTML) */
  const checkBox = (attrs, on, labelHtml) => `<button type="button" class="b13-check" role="checkbox" aria-checked="${!!on}" ${attrs}><span class="bx">${ICON.tick}</span>${labelHtml || ''}</button>`;
  /** an editable number input bound to a getter/setter; types: money | pct | int | num */
  function bindNum(inp, o) {
    const show = () => { inp.value = o.fmt ? o.fmt(o.get()) : String(o.get()); };
    inp.addEventListener('focus', () => {
      const v = o.get();
      inp.value = o.type === 'pct' ? String(+(num(v) * 100).toFixed(4)) : o.type === 'int' ? String(Math.round(num(v))) : String(+num(v).toFixed(2));
      inp.select();
    });
    inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
    inp.addEventListener('blur', () => {
      const t = String(inp.value).trim();
      let v = t === '' ? 0 : num(t, NaN);
      if (!isFinite(v)) { show(); return; }
      if (o.type === 'pct') v = v / 100;
      if (o.type === 'int') v = Math.round(v);
      if (o.min != null) v = Math.max(o.min, v);
      if (o.max != null) v = Math.min(o.max, v);
      o.set(v); show();
    });
    show();
  }
  const fmtBy = (type) => (v) => (type === 'money' ? fmt.money(num(v)) : type === 'money2' ? fmt.money(num(v), { dp: 2 }) : type === 'pct' ? pctTxt(v) : type === 'int' ? String(Math.round(num(v))) : nf(num(v), 2));
  /** keep per-screen field memory in step with the shared case value, then render a ctx.field */
  function caseField(ctx, o) {
    const v = cget(o.key);
    ctx.remember('f.' + o.id, v);
    return ctx.field(Object.assign({}, o, { value: v }));
  }
  /** state that survives a re-render of the same screen (edit mode, wording changes) but not a new visit */
  const VISIT = {};
  function visit(ctx, make) {
    const k = ctx.id, s = VISIT[k], now = Date.now();
    const at = EFA.player ? EFA.player.idx : 0;
    if (s && s.pres === ctx.pres && s.at === at && s.left && now - s.left < 400) { s.left = 0; return s.v; }
    const v = make();
    VISIT[k] = { pres: ctx.pres, at, left: 0, v };
    return v;
  }
  const leaveVisit = (ctx) => { if (VISIT[ctx.id]) VISIT[ctx.id].left = Date.now(); };
  /** activity history per client (rron1 writes "RRON score = N") */
  function logActivity(text) {
    if (!EFA.clients) return;
    const log = EFA.clients.get('activity', 'log', []);
    const next = (Array.isArray(log) ? log : []).concat([{ at: new Date().toISOString(), text }]);
    EFA.clients.set('activity', 'log', next.slice(-500));
  }
  /** hand-off slot read once and cleared: the Income Tax calculator (INCTAXC) leaves its effective rate as a
      percent rounded to 2 decimals in EFA.handoff.taxRate (and a copy in the client file) before returning */
  function takeTaxHandoff() {
    const h = EFA.handoff;
    const v = h && h.taxRate != null ? +h.taxRate : null;
    if (h) delete h.taxRate;
    if (EFA.clients && EFA.clients.get(HANDOFF_NS, 'taxRate', null) != null) EFA.clients.set(HANDOFF_NS, 'taxRate', null);
    if (v == null || !isFinite(v) || v === 0) return null;
    return Math.round(v * 100) / 10000;
  }
  /** data lookups that fall back to a neutral "being verified" state */
  const D = () => EFA.data || {};
  const LIB_COPY = { libWait: 'This part of the library is still loading. Please try again in a moment.' };

  /* =====================================================================
     rron1: readiness self-score (1 to 10)
     ===================================================================== */
  EFA.screen('rron1', {
    title: 'Retirement readiness self-score',
    copy: Object.assign({}, LIB_COPY, {
      eyebrow: 'Retirement Ready or Not?',
      head: 'On a scale of 1 to 10, how ready do you feel for retirement today?',
      lo: 'Not ready yet', hi: 'Completely ready',
      _notes: 'Before any numbers, we ask how ready the client feels. Later, the projection shows how ready the plan really is, and the gap between the two is the conversation.\n\n- Ask: On a scale of 1 to 10, how prepared do you feel for retirement right now?\nPAUSE\n\n- Click the number they choose. It is saved to their activity history and the presentation moves on to the assumptions.'
    }),
    render(ctx) {
      const w = 1440, d = 112, gap = (w - d) / 9;
      ctx.el.innerHTML = `
        <div class="b13-head" style="top:192px">${ctx.t('eyebrow', { cls: 'st-eyebrow' })}${ctx.t('head', { tag: 'h1', cls: 'st-h1', attrs: 'style="max-width:1180px"' })}<hr class="st-rule"></div>
        <div class="b13-s1-row"><div class="b13-s1-track"></div>
          ${Array.from({ length: 10 }, (_, i) => `<button type="button" class="b13-score" data-n="${i + 1}" style="left:${Math.round(i * gap)}px">${i + 1}</button>`).join('')}
        </div>
        <div class="b13-s1-end" style="left:${80}px;text-align:left">${ctx.t('lo')}</div>
        <div class="b13-s1-end" style="left:${80 + w - 300}px;text-align:right">${ctx.t('hi')}</div>`;
      ctx.$$('.b13-score').forEach((b) => b.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); }));
      ctx.on(ctx.$$('.b13-score'), 'click', (e, b) => {
        if (ctx._picked) return;
        ctx._picked = true;
        const n = +b.dataset.n;
        b.classList.add('picked');
        logActivity('RRON score = ' + n);
        cset('rron_score', n);
        ctx.timeout(() => ctx.next(), 260);
      });
    }
  });

  /* =====================================================================
     rmd1: required minimum distribution (three IRS tables)
     ===================================================================== */
  const RMD = {
    tbl(name) { const r = D().rmd; return r && r[name] ? r[name] : null; },
    single(age) { const t = RMD.tbl('single'); if (!t) return null; const a = Math.max(0, Math.min(120, Math.round(age))); const v = t[a]; return v == null ? null : +v; },
    uniformStart() { const t = RMD.tbl('uniform'); if (!t) return null; const ks = Object.keys(t).map(Number).filter(isFinite); return ks.length ? Math.min(...ks) : null; },
    uniform(age) {
      const t = RMD.tbl('uniform'); if (!t) return null;
      const ks = Object.keys(t).map(Number).filter(isFinite); if (!ks.length) return null;
      const lo = Math.min(...ks), hi = Math.max(...ks), a = Math.round(age);
      if (a < lo) return 0;
      const v = t[Math.min(a, hi)];
      return v == null ? null : +v;
    },
    joint(o, s) {
      const t = RMD.tbl('joint'); if (!t) return null;
      const a = Math.max(0, Math.min(120, Math.round(o))), b = Math.max(0, Math.min(120, Math.round(s)));
      const hi = Math.max(a, b), lo = Math.min(a, b);
      const row = t[hi]; const v = row ? row[lo] : null;
      return v == null ? null : +v;
    }
  };
  EFA.screen('rmd1', {
    title: 'Required minimum distribution calculator',
    copy: Object.assign({}, LIB_COPY, {
      eyebrow: 'Required Minimum Distribution',
      head: 'Choose the table that fits your situation',
      segSingle: 'Single Life', segUniform: 'Uniform Life', segJoint: 'Joint Life',
      descNone: 'Each IRS table fits a different situation. Pick one to begin.',
      descSingle: 'For a beneficiary who has inherited the account.',
      descUniform: 'For an owner who is single, or whose spouse is no more than 10 years younger.',
      descJoint: 'For an owner whose spouse is more than 10 years younger and is the sole beneficiary.',
      lbBalance: 'Account Balance', lbBen: "Beneficiary's Age", lbOwner: "Owner's Age", lbSpouse: "Spouse's Age",
      calc: 'Calculate',
      resLabel: 'Required Minimum Distribution',
      resHow: 'Balance divided by a life expectancy factor of',
      errYoungA: 'This owner is too young for the Uniform Lifetime table. It begins at age', errYoungB: '.',
      errJoint: 'The Joint Life table does not apply here. Use it only when the spouse is more than 10 years younger; otherwise use the Uniform Life table.',
      wait: 'The IRS life expectancy figures for this table are being verified. The calculator will work as soon as they load.',
      irs: 'IRS Publication 590-B',
      note: 'For illustration only. The age RMDs begin depends on your birth year, and inherited accounts follow their own rules, including how the factor is set each year. Please confirm your figures with your tax professional.',
      _notes: 'The IRS sets a minimum you must take out of most retirement accounts each year once distributions begin. The rule is simple division: the balance over a life expectancy factor from the right table.\n\n- Ask: Have you planned for the tax on money the IRS will require you to take out, whether you need it or not?\nPAUSE\n\n- Pick the table, enter the balance and age, then Calculate.'
    }),
    render(ctx) {
      const st = ctx._rmd = { table: null, shown: false };
      const T = [['single', 'segSingle'], ['uniform', 'segUniform'], ['joint', 'segJoint']];
      ctx.el.innerHTML = `
        <div class="b13-card b13-tint b13-rmd-top">
          ${ctx.t('eyebrow', { cls: 'st-eyebrow' })}
          ${ctx.t('head', { tag: 'h2', cls: 'st-h2' })}
          <div class="st-seg" role="radiogroup">${T.map(([v, k]) => `<button type="button" role="radio" class="st-seg-b" data-t="${v}" aria-checked="false">${ctx.t(k)}</button>`).join('')}</div>
          <div class="b13-rmd-desc">${ctx.t('descNone', { attrs: 'data-d="none"' })}${ctx.t('descSingle', { attrs: 'data-d="single" hidden' })}${ctx.t('descUniform', { attrs: 'data-d="uniform" hidden' })}${ctx.t('descJoint', { attrs: 'data-d="joint" hidden' })}</div>
        </div>
        <div class="b13-card b13-rmd-data is-off">
          <div class="row">${ctx.t('lbBalance')}${caseField(ctx, { id: 'bal', key: 'rmd1_account_balance', type: 'money' })}</div>
          <div class="row">${ctx.t('lbOwner', { attrs: 'data-age="owner"' })}${ctx.t('lbBen', { attrs: 'data-age="ben" hidden' })}${caseField(ctx, { id: 'age', key: 'case_file_current_age', type: 'int', min: 0, max: 120 })}</div>
          <div class="row" data-sp hidden>${ctx.t('lbSpouse')}${caseField(ctx, { id: 'sp', key: 'case_file_spouse_age', type: 'int', min: 0, max: 120 })}</div>
        </div>
        <div class="b13-rmd-go is-off"><button type="button" class="st-pill b13-gold" data-calc style="min-width:220px;font-size:20px;min-height:54px">${ctx.t('calc')}</button></div>
        <div class="b13-card b13-rmd-res is-off">
          <div data-donut></div>
          <div><div class="k">${ctx.t('resLabel')}</div><div class="v" data-v></div><div class="f">${ctx.t('resHow')} <span class="num" data-f></span></div></div>
        </div>
        <div class="b13-card b13-rmd-res is-off" data-wait style="grid-template-columns:1fr"><div class="b13-wait" style="padding:6px">${ctx.t('wait')}</div></div>
        <div class="b13-rmd-foot">
          <a href="https://www.irs.gov/pub/irs-pdf/p590b.pdf" target="_blank" rel="noopener">${ctx.t('irs')}</a>
          <p class="st-disclaimer" style="margin:0;max-width:1180px">${ctx.t('note')}</p>
        </div>`;
      ctx.$$('.b13-rmd-data .st-field > label').forEach((l) => l.remove());
      const show = (sel, on) => ctx.show(ctx.$(sel), on);
      const hideResult = () => { st.shown = false; show('.b13-rmd-res:not([data-wait])', false); show('[data-wait]', false); show('.b13-rmd-go', !!st.table); };
      ctx.on(ctx.$$('[data-t]'), 'click', (e, b) => {
        st.table = b.dataset.t;
        ctx.$$('[data-t]').forEach((x) => x.setAttribute('aria-checked', x === b));
        ctx.$$('[data-d]').forEach((x) => { x.hidden = x.dataset.d !== st.table; });
        ctx.$('[data-age="owner"]').hidden = st.table === 'single';
        ctx.$('[data-age="ben"]').hidden = st.table !== 'single';
        ctx.$('[data-sp]').hidden = st.table !== 'joint';
        show('.b13-rmd-data', true);
        ctx.$('.b13-rmd-data').style.top = '318px';
        hideResult();
      });
      let last = null;
      ctx.onFields((v) => {
        const sig = JSON.stringify([v.bal, v.age, v.sp]);
        if (last !== null && sig !== last) hideResult();
        last = sig;
        cset('rmd1_account_balance', v.bal); cset('case_file_current_age', v.age); cset('case_file_spouse_age', v.sp);
      });
      ctx.on(ctx.$('[data-calc]'), 'click', () => {
        const v = ctx.values();
        let factor = null;
        if (st.table === 'single') factor = RMD.single(v.age);
        else if (st.table === 'uniform') {
          const start = RMD.uniformStart();
          if (start != null && Math.round(v.age) < start) { ctx.toast(ctx.text('errYoungA') + ' ' + start + ctx.text('errYoungB')); return; }
          factor = RMD.uniform(v.age);
        } else if (st.table === 'joint') {
          factor = RMD.joint(v.age, v.sp);
          if (RMD.tbl('joint') && v.sp + 10 > v.age) { ctx.toast(ctx.text('errJoint')); return; }
        }
        if (factor == null) { show('.b13-rmd-go', false); show('[data-wait]', true); return; }
        if (!(factor > 0)) return;
        const rmd = v.bal / factor;
        ctx.$('[data-v]').textContent = fmt.money(rmd, { dp: 2 });
        ctx.$('[data-f]').textContent = nf(factor, 1);
        const share = Math.max(0, Math.min(1, 1 / factor));
        const cx = 70, cy = 70, r = 60;
        ctx.$('[data-donut]').innerHTML = `<svg viewBox="0 0 140 140" width="140" height="140"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#1d3863"/>
          <path d="${A.wedge(cx, cy, r, 0, Math.max(share * 360, 2))}" fill="#b8972e"/><circle cx="${cx}" cy="${cy}" r="34" fill="#fffdf8"/>
          <text x="${cx}" y="${cy + 7}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="20" fill="#0d1e3a">${nf(share * 100, 1)}%</text></svg>`;
        st.shown = true;
        show('.b13-rmd-go', false); show('.b13-rmd-res:not([data-wait])', true);
      });
    }
  });

  /* =====================================================================
     rab1: risk (market) account considerations and the 12 standard benefits
     ===================================================================== */
  const BEN = ['tdg', 'tfd', 'cr', 'hc', 'ab', 'co', 'sh', 'nlp', 'glo', 'ulp', 'luac', 'dc'];
  const RAB_TYPES = [
    { k: 'etf', ben: ['cr', 'hc', 'luac'], cons: 'fund' },
    { k: 'ire', ben: ['tdg', 'cr', 'hc', 'ab', 'co'], cons: 'ire' },
    { k: 'mf', ben: ['cr', 'hc', 'luac'], cons: 'fund' },
    { k: 'pm', ben: ['tdg', 'cr', 'hc', 'luac'], cons: 'pm' },
    { k: 'va', ben: ['tdg', 'cr', 'hc', 'ab'], cons: 'va' }
  ];
  const RAB_CONS = { fund: 5, ire: 6, pm: 4, va: 7 };
  EFA.screen('rab1', {
    title: 'Risk account benefits',
    copy: Object.assign({}, LIB_COPY, {
      pick: 'Choose an account type',
      't.etf': 'Exchange-Traded Funds', 't.ire': 'Investment Real Estate', 't.mf': 'Mutual Funds', 't.pm': 'Precious Metals', 't.va': 'Variable Annuities',
      consTitle: 'Important Considerations', benTitle: 'Benefits',
      empty: 'Choose a market account above to see what to weigh before you own it, and which of the twelve benefits it offers.',
      'b.tdg': 'Tax Deferred Growth', 'b.tfd': 'Tax Free Distribution', 'b.cr': 'Competitive Return', 'b.hc': 'High Contributions',
      'b.ab': 'Additional Benefits', 'b.co': 'Collateral Opportunities', 'b.sh': 'Safe', 'b.nlp': 'No-Loss Provisions',
      'b.glo': 'Guaranteed Loan Option', 'b.ulp': 'Unstructured Loan Payments', 'b.luac': 'Liquidity, Use and Control', 'b.dc': 'Deductible Contributions',
      'c.fund.1': 'The focus is growth potential.',
      'c.fund.2': 'The value is driven by the market.',
      'c.fund.3': 'Prices can swing widely, in both directions.',
      'c.fund.4': 'Every purchase has to be suitable for your situation.',
      'c.fund.5': 'Tax deferral, tax-free withdrawals, use as collateral or deductible contributions may apply, depending on the account that holds the fund.',
      'c.ire.1': 'The focus is growth potential.',
      'c.ire.2': 'The value is driven by the market.',
      'c.ire.3': 'Getting to your money is usually limited.',
      'c.ire.4': 'The property may call for more of your cash over time.',
      'c.ire.5': 'Financing lets you use leverage, which works in both directions.',
      'c.ire.6': 'Some REITs pay quarterly income, which is taxable unless held inside an IRA.',
      'c.pm.1': 'Storage takes planning, space and cost.',
      'c.pm.2': 'Theft is a real risk.',
      'c.pm.3': 'Prices can swing widely.',
      'c.pm.4': 'Currency and exchange-rate moves can change what it is worth.',
      'c.va.1': 'The value moves with the market, so your principal is at risk.',
      'c.va.2': 'Often used to create a steady stream of retirement income.',
      'c.va.3': 'Optional riders can add benefits such as long-term care or life insurance protection, backed by the claims-paying ability of the issuing insurer.',
      'c.va.4': 'Taxes are generally deferred until you withdraw.',
      'c.va.5': 'Early withdrawals can bring a tax penalty plus surrender charges.',
      'c.va.6': 'Gains are generally taxed as ordinary income when withdrawn.',
      'c.va.7': 'In some arrangements, distributions may be income-tax-free or contributions deductible, subject to applicable requirements.',
      _notes: 'Every account in the risk tank trades safety for growth potential. Seeing the benefits side by side shows what you give up for that growth.\n\n- Pick the account the client owns or is considering.\n- Ask: Of these twelve benefits, which three matter most to you?\nPAUSE'
    }),
    render(ctx) {
      const st = ctx._rab = { type: null, page: 0 };
      ctx.el.innerHTML = `
        <div class="b13-rab-dd"><button type="button" data-dd aria-haspopup="listbox"><span data-cur>${ctx.t('pick', { cls: 'ph' })}</span>${ICON.down}</button>
          <div class="b13-rab-menu" role="listbox" hidden>${RAB_TYPES.map((t, i) => `<button type="button" role="option" data-i="${i}" aria-selected="false">${ctx.t('t.' + t.k)}</button>`).join('')}</div></div>
        ${ctx.t('consTitle', { tag: 'div', cls: 'b13-rab-title' })}
        <div class="b13-card b13-tint b13-rab-panel"><div class="b13-rab-rows"></div>
          <div class="b13-rab-empty"><div>${rabArt()}${ctx.t('empty', { tag: 'p' })}</div></div>
          <div class="b13-rab-pg" hidden><button type="button" class="b13-chip" data-pg="-1" aria-label="Previous">${ICON.chevL}</button><button type="button" class="b13-chip" data-pg="1" aria-label="Next">${ICON.chevR}</button></div></div>
        <div class="b13-rab-ben"><h3>${ctx.t('benTitle')}</h3>${BEN.map((b) => `<div class="b13-rab-b" data-b="${b}"><span class="dot"></span>${ctx.t('b.' + b)}</div>`).join('')}</div>`;
      const menu = ctx.$('.b13-rab-menu');
      ctx.on(ctx.$('[data-dd]'), 'click', (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; });
      ctx.on(ctx.el, 'click', (e) => { if (!e.target.closest('.b13-rab-dd')) menu.hidden = true; });
      ctx.on(ctx.$$('.b13-rab-menu [data-i]'), 'click', (e, b) => { st.type = +b.dataset.i; st.page = 0; menu.hidden = true; draw(); });
      ctx.on(ctx.$$('[data-pg]'), 'click', (e, b) => { st.page = Math.max(0, st.page + +b.dataset.pg); draw(); });
      const draw = () => {
        const t = st.type == null ? null : RAB_TYPES[st.type];
        ctx.$$('.b13-rab-menu [data-i]').forEach((b) => b.setAttribute('aria-selected', t != null && +b.dataset.i === st.type));
        ctx.$('[data-cur]').innerHTML = t ? ctx.t('t.' + t.k) : ctx.t('pick', { cls: 'ph' });
        ctx.$$('.b13-rab-b').forEach((n) => n.classList.toggle('on', !!t && t.ben.includes(n.dataset.b)));
        ctx.$('.b13-rab-empty').hidden = !!t;
        const rows = ctx.$('.b13-rab-rows');
        if (!t) { rows.innerHTML = ''; ctx.$('.b13-rab-pg').hidden = true; return; }
        const n = RAB_CONS[t.cons], per = 7, pages = Math.ceil(n / per);
        st.page = Math.min(st.page, pages - 1);
        const keys = Array.from({ length: n }, (_, i) => `c.${t.cons}.${i + 1}`).slice(st.page * per, st.page * per + per);
        const B = LIB('bullets');
        const dart = B && B.dart ? B.dart({ size: 46 }) : '';
        rows.innerHTML = keys.map((k) => `<div class="b13-rab-row"><span class="bl">${dart}</span>${ctx.t(k, { cls: 'tx' })}</div>`).join('');
        ctx.$('.b13-rab-pg').hidden = pages <= 1;
        ctx.$('[data-pg="-1"]').hidden = st.page === 0; ctx.$('[data-pg="1"]').hidden = st.page >= pages - 1;
        if (EFA.numify) EFA.numify(ctx.el);
        if (editing() && EFA.edit.arm) EFA.edit.arm(ctx.el);
      };
      draw();
    }
  });
  /** empty-state drawing for rab1: a market line swinging above and below its starting level */
  function rabArt() {
    const pts = [[0, 120], [60, 90], [110, 132], [170, 64], [230, 118], [290, 40], [350, 98], [410, 70], [470, 140], [540, 52]];
    const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x + 30},${y + 20}`).join('');
    return `<svg viewBox="0 0 600 200" width="520" height="173" aria-hidden="true">
      <ellipse cx="300" cy="186" rx="250" ry="9" fill="rgba(13,30,58,.08)"/>
      <path d="M30 140H570" stroke="#cbd5e3" stroke-width="3" stroke-dasharray="6 9"/>
      <path d="${d}" fill="none" stroke="#1d3863" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
      ${pts.map(([x, y], i) => (i % 3 === 0 ? `<circle cx="${x + 30}" cy="${y + 20}" r="9" fill="#b8972e" stroke="#fffdf8" stroke-width="3"/>` : '')).join('')}</svg>`;
  }

  /* =====================================================================
     rconv1: the two deciding factors
     ===================================================================== */
  EFA.screen('rconv1', {
    title: 'Roth conversion: the two deciding factors',
    steps: 4,
    copy: Object.assign({}, LIB_COPY, {
      head: 'Should I move my Traditional IRA into a Roth IRA?',
      sub: 'Two factors decide it.',
      p1: 'Factor one: how your tax rate in retirement compares with the rate you pay today.',
      p2: 'Factor two: converting means paying the tax now. Those dollars could be invested instead, and a well-invested sum may grow larger than the tax the Roth saves you.',
      p3: 'Let’s work through your numbers together and see which route fits you best.',
      note: 'A Roth conversion is generally taxable as ordinary income in the year you convert. This is for education only and is not tax advice. Please consult your tax professional before you act.',
      _notes: 'The Roth question is really two questions. Will your tax rate be higher or lower later, and what could the tax money do if you kept it working?\n\n- Ask: Do you expect to pay more tax in retirement than you pay today, or less?\nPAUSE\n\n- Click through the three points, then open the calculator.'
    }),
    render(ctx) {
      const B = LIB('bullets');
      const row = (k, at) => {
        const box = `<div class="b13-rc1-box">${ctx.t(k)}</div>`;
        if (B && B.row) return B.row(box, { at, size: 70, text: '' });
        return `<div class="b13-rc1-row fade" data-at="${at}" style="display:grid;grid-template-columns:70px 1fr;gap:22px;align-items:center"><span></span>${box}</div>`;
      };
      ctx.el.innerHTML = `
        <div class="b13-head" style="top:70px">${ctx.t('head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule">${ctx.t('sub', { tag: 'h2', cls: 'st-h2', attrs: 'style="font-size:40px;margin-top:4px"' })}</div>
        <div class="b13-rc1">${row('p1', 1)}${row('p2', 2)}${row('p3', 3)}</div>
        <p class="st-disclaimer" style="position:absolute;left:224px;width:1152px;top:800px;margin:0;text-align:center">${ctx.t('note')}</p>`;
    },
    step(ctx, n) {
      const B = LIB('bullets');
      if (B && B.reveal) B.reveal(ctx, n, ctx.$('.b13-rc1'));
      else ctx.$$('.b13-rc1-row').forEach((r) => ctx.show(r, n >= +r.dataset.at));
    }
  });

  /* =====================================================================
     rconv2: Roth conversion calculator (Traditional + side account vs Roth)
     Engine exposed as EFA.engines.rconv.run(inputs)
     ===================================================================== */
  function rconvRun(o) {
    const t = Math.round(o.t), e = Math.round(o.e), n = Math.round(o.n), a = o.a, s = o.s, c = o.c, l = o.l, p = o.p;
    const m = n - t + 1, D = n - e + 1;
    if (!(m > 0) || !(D > 0)) return null;
    const roth = [], trad = [], conv = [];
    const G = a * Math.pow(1 + l, e - t);
    const Mr = PMT(p, D, -G, 0, 1);
    let prev = 0, cum = 0;
    for (let k = 0; k < m; k++) {
      const age = t + k, contribution = k === 0 ? a : 0, wd = age < e ? 0 : Mr;
      const boy = prev + contribution - wd, interest = boy * (age < e ? l : p), eoy = boy + interest; cum += wd;
      roth.push({ age, contribution, wd, tax: 0, net: wd, boy, interest, eoy, cum, year: k + 1 }); prev = eoy;
    }
    const tG = a * Math.pow(1 + l, e - t);
    const Mt = PMT(p, D, -tG, 0, 1);
    prev = 0; cum = 0;
    for (let k = 0; k < m; k++) {
      const age = t + k, contribution = k === 0 ? a : 0, wd = age < e ? 0 : Mt, tax = wd * c, net = wd - tax;
      const boy = prev + contribution - wd, interest = boy * (age < e ? l : p), eoy = boy + interest; cum += net;
      trad.push({ age, contribution, wd, tax, net, boy, interest, eoy, cum, year: k + 1 }); prev = eoy;
    }
    let cG = 0, Mc = 0;
    if (t === e) { cG = a * s; Mc = PMT(p * (1 - c), D, -a * s, 0, 1); }
    prev = 0; cum = 0;
    for (let k = 0; k < m; k++) {
      const age = t + k, contribution = k === 0 ? a * s : 0, wd = age < e ? 0 : Mc;
      const boy = prev + contribution - wd, interest = boy * (age < e ? l : p), itax = interest * (age < e ? s : c), eoy = boy + interest - itax; cum += wd;
      conv.push({ age, contribution, wd, tax: 0, net: wd, boy, interest, itax, eoy, cum, year: k + 1 }); prev = eoy;
      if (age === e - 1) { cG = eoy; Mc = PMT(p * (1 - c), D, -eoy, 0, 1); }
    }
    const tTaxDue = tG * c, tNet = tG - tTaxDue, tcNet = tNet + cG, rG = G;
    const verdict = (x, y) => (x - y > 1 ? { win: 'trad', by: x - y } : y - x > 1 ? { win: 'roth', by: y - x } : { win: 'even', by: 0 });
    const tIncome = trad[m - 1].cum, cIncome = conv[m - 1].cum, rIncome = roth[m - 1].cum, tcIncome = tIncome + cIncome;
    const out = { roth, trad, conv, tG, tTaxDue, tNet, cG, tcNet, rG, tIncome, cIncome, rIncome, tcIncome, values: verdict(tcNet, rG), income: verdict(tcIncome, rIncome) };
    const bad = [tG, cG, rG, tIncome, cIncome, rIncome].some((v) => !isFinite(v));
    return bad ? null : out;
  }
  EFA.engines.rconv = { run: rconvRun };
  EFA.screen('rconv2', {
    title: 'Roth IRA conversion calculator',
    copy: Object.assign({}, LIB_COPY, {
      head: 'Roth IRA Conversion Calculator',
      lbT: 'Current Age', lbE: 'Retirement Age', lbN: 'Project to Age', lbA: 'Traditional IRA Balance',
      lbL: 'Accumulation Growth Rate', lbS: 'Accumulation Tax Rate', lbP: 'Distribution Growth Rate', lbC: 'Distribution Tax Rate',
      calc: 'Calculate', modify: 'Modify Assumptions', showValues: 'Show Account Values', showIncome: 'Show Retirement Income',
      artTrad: 'Keep the Traditional IRA and invest the tax', artRoth: 'Convert to the Roth IRA and pay the tax from other money',
      incTitle: 'Spendable retirement income, after tax',
      i1: 'Traditional IRA income after tax', i2: 'Conversion tax account income after tax', i3: 'Traditional IRA plus the tax account', i4: 'Roth IRA income',
      valTitle: 'What each path is worth after tax at retirement',
      v1: 'Traditional IRA balance', v2: 'Tax due on the Traditional IRA', v3: 'Traditional IRA after tax', v4: 'Conversion tax account balance',
      v5: 'Tax due on the tax account', v6: 'Tax account after tax', v7: 'Traditional IRA plus the tax account', v8: 'Roth IRA value',
      winTradInc: 'Keeping the Traditional IRA and investing the tax delivers more after-tax income, by',
      winRothInc: 'Converting to the Roth IRA delivers more after-tax income, by',
      evenInc: 'Both paths deliver the same after-tax income.',
      winTradVal: 'Keeping the Traditional IRA and investing the tax leaves more after-tax value, by',
      winRothVal: 'Converting to the Roth IRA leaves more after-tax value, by',
      evenVal: 'Both paths leave the same after-tax value.',
      barTrad: 'Traditional + Tax Account', barRoth: 'Roth IRA',
      docs: 'Documentation', choose: 'Choose a worksheet', wTrad: 'Traditional IRA', wConv: 'Conversion Tax Account', wRoth: 'Roth IRA',
      cAge: 'Age', cContrib: 'Annual Contribution', cWd: 'Annual Withdrawal', cTax: 'Tax On Withdrawal', cNet: 'Net Spendable Withdrawal',
      cBoy: 'Beginning-of-Year Balance', cInt: 'Interest Earned', cITax: 'Tax On Interest Earned', cEoy: 'End-of-Year Balance', cCum: 'Cumulative Retirement Income', cYear: 'Year',
      bad: 'These numbers do not work together. Please check the ages and rates.',
      note: 'Assumes the conversion tax is paid from money outside the IRA. Roth IRA withdrawals are shown as generally income-tax-free under current tax law, subject to applicable requirements. The five-year rule, early-withdrawal rules, required minimum distributions and state taxes are not modeled. This is not tax advice; please consult your tax professional.',
      _notes: 'We run both paths side by side: keep the Traditional IRA and invest the tax you would have paid, or convert and pay the tax from other money. Then we compare what you can spend.\n\n- Ask: If both paths gave you the same income, which would you rather have, more flexibility or fewer taxes later?\nPAUSE\n\n- Calculate, then toggle between income and account values.'
    }),
    render(ctx) {
      const st = ctx._rc = { state: 'in', view: 'income', res: null };
      // each visit starts with equal tax rates (reproduced)
      if (num(cget('qp_withdrawal_tax_bracket')) !== num(cget('case_file_ror_taxes'))) cset('qp_withdrawal_tax_bracket', num(cget('case_file_ror_taxes')));
      const F = [
        ['t', 'lbT', 'case_file_current_age', 'int'], ['e', 'lbE', 'case_file_retirement_age', 'int'], ['n', 'lbN', 'case_file_life_expectancy', 'int'],
        ['a', 'lbA', 'qp_account_balance', 'money'], ['l', 'lbL', 'taxable_return', 'pct', 0.12], ['s', 'lbS', 'case_file_ror_taxes', 'pct'],
        ['p', 'lbP', 'qp_withdrawal_taxable_return', 'pct', 0.12], ['c', 'lbC', 'qp_withdrawal_tax_bracket', 'pct']
      ];
      ctx.el.innerHTML = `
        <div class="b13-head" style="top:44px">${ctx.t('head', { tag: 'h1', cls: 'st-h2', attrs: 'style="font-size:54px"' })}<hr class="st-rule"></div>
        <div class="b13-in-state">
          <div class="b13-card b13-tint b13-rc2-in">${F.map(([id, lb, key, type, max]) => `<div class="row">${ctx.t(lb, { tag: 'label', attrs: `for="f-rconv2-${id}"` })}${caseField(ctx, { id, key, type, max, min: type === 'money' ? 0 : undefined, dp: type === 'pct' ? 2 : 0 })}</div>`).join('')}</div>
          <div class="b13-rc2-go"><button type="button" class="st-pill b13-gold" data-calc style="min-width:240px;min-height:56px;font-size:20px">${ctx.t('calc')}</button></div>
          <div class="b13-rc2-art">${rconvArt(ctx)}</div>
        </div>
        <div class="b13-res-state" hidden>
          <div class="b13-card b13-rc2-res" data-res></div>
          <div class="b13-rc2-bars" data-bars></div>
          <div class="b13-rc2-bb">
            <button type="button" class="st-pill b13-ghost" data-mod>${ctx.t('modify')}</button>
            <button type="button" class="st-pill" data-tog>${ctx.t('showValues', { attrs: 'data-l="values"' })}${ctx.t('showIncome', { attrs: 'data-l="income" hidden' })}</button>
            <button type="button" class="st-pill b13-ghost" data-docs>${ICON.print}<span style="margin-left:8px">${ctx.t('docs')}</span></button>
          </div>
        </div>
        ${EFA.lib && EFA.lib.disclosure ? EFA.lib.disclosure.line(['hypothetical'], { style: 'position:absolute;left:110px;width:1380px;top:806px;margin:0;text-align:center' }) : ''}
        <p class="st-disclaimer" style="position:absolute;left:110px;width:1380px;top:${EFA.lib && EFA.lib.disclosure ? 830 : 812}px;margin:0;text-align:center">${ctx.t('note')}</p>`;
      ctx.$$('.b13-rc2-in .st-field > label').forEach((l) => l.remove());
      ctx.onFields((v) => {
        F.forEach(([id, , key]) => cset(key, v[id]));
        if (st.state === 'res') compute(true);
      });
      if (EFA.lib && EFA.lib.disclosure) {
        EFA.lib.disclosure.guard(ctx, 'l', { flag: 'ror' }); EFA.lib.disclosure.guard(ctx, 'p', { flag: 'ror' });
      }
      const inputs = () => {
        const v = ctx.values();
        return { t: v.t, e: v.e, n: v.n, a: v.a, s: v.s, c: v.c, l: v.l, p: v.p };
      };
      const compute = (quiet) => {
        const o = inputs();
        const ok = o.e >= o.t && o.n >= o.e;
        const r = ok ? rconvRun(o) : null;
        if (!r) { if (!quiet) ctx.toast(ctx.text('bad')); return false; }
        st.res = r; drawRes(); return true;
      };
      const line = (k, v, cls) => `<div class="ln ${cls || ''}"><span class="t">${ctx.t(k)}</span><span class="v num">${fmt.money(v)}</span></div>`;
      const drawRes = () => {
        const r = st.res, inc = st.view === 'income';
        const ver = inc ? r.income : r.values;
        const vk = ver.win === 'even' ? (inc ? 'evenInc' : 'evenVal') : ver.win === 'trad' ? (inc ? 'winTradInc' : 'winTradVal') : (inc ? 'winRothInc' : 'winRothVal');
        ctx.$('[data-res]').innerHTML = inc
          ? `${ctx.t('incTitle', { tag: 'h2', cls: 'st-h3', attrs: 'style="margin:0 0 10px"' })}
             ${line('i1', r.tIncome)}${line('i2', r.cIncome, 'u')}${line('i3', r.tcIncome, 'tot')}${line('i4', r.rIncome, 'tot u')}
             <div class="verdict">${ctx.t(vk)}${ver.win === 'even' ? '' : ` <span class="v num">${fmt.money(ver.by)}</span>`}</div>`
          : `${ctx.t('valTitle', { tag: 'h2', cls: 'st-h3', attrs: 'style="margin:0 0 6px"' })}
             ${line('v1', r.tG)}${line('v2', -r.tTaxDue, 'u')}${line('v3', r.tNet)}${line('v4', r.cG)}${line('v5', 0, 'u')}${line('v6', r.cG, 'u')}${line('v7', r.tcNet, 'tot')}${line('v8', r.rG, 'tot u')}
             <div class="verdict">${ctx.t(vk)}${ver.win === 'even' ? '' : ` <span class="v num">${fmt.money(ver.by)}</span>`}</div>`;
        const a = inc ? r.tcIncome : r.tcNet, b = inc ? r.rIncome : r.rG, mx = Math.max(a, b, 1), H = 360;
        const bar = (x, v, win, k) => `<div class="b13-rc2-bar" style="left:${x}px;height:${Math.max(4, H * Math.max(0, v) / mx)}px;background:${win ? 'linear-gradient(180deg,#d5bd68,#b8972e)' : 'linear-gradient(180deg,#2b4c80,#0d1e3a)'}"></div>
          <div class="b13-rc2-bv num" style="left:${x - 30}px;bottom:${84 + H * Math.max(0, v) / mx}px">${fmt.money(v, { compact: true })}</div>
          <div class="b13-rc2-bl" style="left:${x - 30}px">${ctx.t(k)}</div>`;
        ctx.$('[data-bars]').innerHTML = `<div class="b13-rc2-bar-base"></div>${bar(50, a, ver.win === 'trad', 'barTrad')}${bar(240, b, ver.win === 'roth', 'barRoth')}`;
        ctx.$$('[data-tog] [data-l]').forEach((x) => { x.hidden = x.dataset.l === st.view; });
        const card = ctx.$('[data-res]');
        ctx.timeout(() => { const h = card.offsetHeight; card.style.top = Math.round(196 + Math.max(0, (520 - h) / 2)) + 'px'; }, 0);
        if (EFA.numify) EFA.numify(ctx.el);
        if (editing() && EFA.edit.arm) EFA.edit.arm(ctx.el);
      };
      const setState = (s) => { st.state = s; ctx.$('.b13-in-state').hidden = s !== 'in'; ctx.$('.b13-res-state').hidden = s !== 'res'; };
      ctx.on(ctx.$('[data-calc]'), 'click', () => { if (compute()) { st.view = 'income'; drawRes(); setState('res'); const rc = ctx.$('[data-res]'); rc.classList.add('is-off'); ctx.timeout(() => rc.classList.remove('is-off'), 30); } });
      ctx.on(ctx.$('[data-mod]'), 'click', () => setState('in'));
      ctx.on(ctx.$('[data-tog]'), 'click', () => { st.view = st.view === 'income' ? 'values' : 'income'; drawRes(); });
      ctx.on(ctx.$('[data-docs]'), 'click', () => {
        if (!compute()) return;
        const ov = ctx.overlay({
          title: ctx.t('choose'), cls: 'b13-ov-sm',
          html: `<div class="b13-dlg" style="justify-items:stretch">${['wTrad', 'wConv', 'wRoth'].map((k) => `<button type="button" class="st-pill b13-ghost" data-w="${k}" style="justify-content:flex-start;min-height:56px;font-size:20px">${ctx.t(k)}</button>`).join('')}</div>`
        });
        ov.querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => { if (editing()) return; ov.close(); openSheet(b.dataset.w); }));
      });
      const openSheet = (k) => {
        const W = LIB('worksheet'); if (!W || !W.open) { notReady(ctx); return; }
        compute(true);
        const r = st.res, rows = k === 'wTrad' ? r.trad : k === 'wRoth' ? r.roth : r.conv;
        const cols = [
          { field: 'age', header: ctx.t('cAge'), type: 'age' }, { field: 'contribution', header: ctx.t('cContrib'), type: 'money', dp: 2 },
          { field: 'wd', header: ctx.t('cWd'), type: 'money', dp: 2 }, { field: 'tax', header: ctx.t('cTax'), type: 'money', dp: 2 },
          { field: 'net', header: ctx.t('cNet'), type: 'money', dp: 2 }, { field: 'boy', header: ctx.t('cBoy'), type: 'money', dp: 2 },
          { field: 'interest', header: ctx.t('cInt'), type: 'money', dp: 2 }
        ];
        if (k === 'wConv') cols.push({ field: 'itax', header: ctx.t('cITax'), type: 'money', dp: 2 });
        cols.push({ field: 'eoy', header: ctx.t('cEoy'), type: 'money', dp: 2 }, { field: 'cum', header: ctx.t('cCum'), type: 'money', dp: 2 }, { field: 'year', header: ctx.t('cYear'), type: 'int' });
        W.open(ctx, { heading: ctx.t(k), size: 'full', columns: cols, rows, disclosures: ['hypothetical', 'notAdvice', 'license'] });
      };
    }
  });
  /** state-1 drawing for rconv2: the two paths as two jars */
  function rconvArt(ctx) {
    const jar = (x, top, fill, gold) => `<g transform="translate(${x},0)">
      <ellipse cx="90" cy="452" rx="92" ry="12" fill="rgba(13,30,58,.10)"/>
      <path d="M20 ${top}h140v${430 - top}a18 18 0 0 1-18 18H38a18 18 0 0 1-18-18z" fill="#fffdf8" stroke="#0d1e3a" stroke-width="5"/>
      <path d="M26 ${fill}h128v${426 - fill}a14 14 0 0 1-14 14H40a14 14 0 0 1-14-14z" fill="${gold ? 'url(#b13rcG)' : 'url(#b13rcN)'}"/>
      <rect x="10" y="${top - 18}" width="160" height="22" rx="8" fill="#0d1e3a"/></g>`;
    return `<svg viewBox="0 0 480 470" width="480" height="470" aria-hidden="true"><defs>
        <linearGradient id="b13rcG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d5bd68"/><stop offset="1" stop-color="#b8972e"/></linearGradient>
        <linearGradient id="b13rcN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4c80"/><stop offset="1" stop-color="#0d1e3a"/></linearGradient></defs>
        ${jar(20, 120, 230, false)}<path d="M66 228h88v24H66z" fill="#d5bd68" opacity=".9"/>${jar(270, 120, 210, true)}
      </svg>
      <div style="position:absolute;left:0;top:478px;width:230px;text-align:center" class="b13-lb">${ctx.t('artTrad')}</div>
      <div style="position:absolute;left:250px;top:478px;width:230px;text-align:center" class="b13-lb">${ctx.t('artRoth')}</div>`;
  }

  /* =====================================================================
     roi1: return on investment (IRR) from a deposits and receipts schedule
     Engine exposed as EFA.engines.roi.irr(flows) / .annualize(r, type)
     ===================================================================== */
  function roiIRR(cf) {
    if (!cf || cf.length < 2 || cf[0] > 0) return 0;
    try {
      let r = 0;
      const npv = (x) => { if (x === -1) return 0; let s = 0; for (let k = 0; k < cf.length; k++) s += cf[k] / Math.pow(1 + x, k); return s; };
      const d1 = (x) => { if (x === -1) return 0; let s = 0; for (let k = 1; k < cf.length; k++) s -= k * cf[k] / Math.pow(1 + x, k + 1); return s; };
      for (let it = 0; it < 50000; it++) {
        const v = npv(r); if (Math.abs(v) <= 1e-5) break;
        const dv = d1(r); if (!dv || !isFinite(dv)) return 0;
        r = r - v / dv;
        if (!isFinite(r)) return 0;
      }
      if (!isFinite(r) || r > 1) return 0;
      return r;
    } catch (e) { return 0; }
  }
  const ROI_K = [1, 4, 12, 52, 365];
  EFA.engines.roi = { irr: roiIRR, annualize: (r, type) => Math.pow(1 + r, ROI_K[type] || 1) - 1 };
  EFA.screen('roi1', {
    title: 'Return on investment',
    copy: Object.assign({}, LIB_COPY, {
      head: 'Return on Investment',
      sub: 'Lay out what goes in and what comes out. The true return follows from the cash flows, not the brochure.',
      lbType: 'Time Period', lbN: 'Number of Periods', calc: 'Calculate', inputs: 'Inputs',
      'p.0': 'Years', 'p.1': 'Quarters', 'p.2': 'Months', 'p.3': 'Weeks', 'p.4': 'Days',
      's.0': 'Year', 's.1': 'Quarter', 's.2': 'Month', 's.3': 'Week', 's.4': 'Day',
      'r.0': 'Yearly Return', 'r.1': 'Quarterly Return', 'r.2': 'Monthly Return', 'r.3': 'Weekly Return', 'r.4': 'Daily Return',
      hDep: 'Deposits', hRec: 'Receipts', hCf: 'Cash Flow',
      rAnn: 'Annualized Return', rNeg: 'Sum of Negative Periods', rPos: 'Sum of Positive Periods',
      hint: 'Click any Deposits or Receipts cell to fill it, and the periods after it, in one step.',
      chart: 'Cash flow by period',
      fillDep: 'Fill Deposits', fillRec: 'Fill Receipts', fAmt: 'Amount', fN: '# of Periods', fRate: 'Inflate Rate', cancel: 'Cancel', enter: 'Enter',
      errTitle: 'This cash flow cannot be measured',
      errBody: 'An internal rate of return needs at least one period with money going in and one period with money coming out. Please adjust the deposits and receipts.',
      ok: 'Ok', docs: 'Documentation', wsHead: 'Return on Investment Results', wsCf: 'Cash Flows', wsPeriod: 'Period',
      note: 'For illustration only. The return reflects only the cash flows entered. For an insurance policy or annuity, use the values in the carrier’s illustration.',
      _notes: 'Every arrangement has a true return hiding in its cash flows: what you put in, when, and what comes back. This screen finds it.\n\n- Ask: When you were shown a rate on something you bought, did anyone show you the return on your actual dollars?\nPAUSE\n\n- Set the period type and count, fill deposits and receipts, then Calculate.'
    }),
    render(ctx) {
      const S = ctx._roi = visit(ctx, () => ({ state: 'in', rows: [], fill: { amount: 500, periods: 99, rate: 0 }, res: null }));
      const type = () => Math.round(num(ctx.mem('f.type', 0)));
      ctx.el.innerHTML = `
        <div class="b13-head" style="top:44px">${ctx.t('head', { tag: 'h1', cls: 'st-h2', attrs: 'style="font-size:54px"' })}<hr class="st-rule"></div>
        <div data-st="in">
          ${ctx.t('sub', { tag: 'p', cls: 'st-small', attrs: 'style="position:absolute;left:200px;width:1200px;top:156px;margin:0;text-align:center;font-size:21px"' })}
          <div class="b13-card b13-tint b13-roi-in">
            <div class="row">${ctx.t('lbType')}${ctx.choice({ id: 'type', options: ROI_K.map((_, i) => ({ value: i, key: 'p.' + i })), value: 0 })}</div>
            <div class="row">${ctx.t('lbN')}<div style="width:200px">${ctx.field({ id: 'n', type: 'int', value: 30, min: 1, max: 5000 })}</div></div>
            <div style="display:flex;justify-content:center"><button type="button" class="st-pill b13-gold" data-go style="min-width:220px;min-height:54px;font-size:20px">${ctx.t('calc')}</button></div>
          </div>
          <div class="b13-roi-art">${roiArt()}</div>
        </div>
        <div data-st="grid" hidden>
          <div class="b13-roi-gridwrap">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <button type="button" class="st-pill b13-ghost" data-back>${ICON.chevL}<span style="margin-left:6px">${ctx.t('inputs')}</span></button>
              <button type="button" class="st-pill b13-gold" data-irr style="min-width:200px">${ctx.t('calc')}</button>
            </div>
            <div class="b13-roi-scroll"><table class="st-table"><thead><tr><th style="text-align:center;width:120px" data-ph></th><th>${ctx.t('hDep')}</th><th>${ctx.t('hRec')}</th><th>${ctx.t('hCf')}</th></tr></thead><tbody></tbody></table></div>
          </div>
          <div class="b13-roi-side">
            <div class="b13-card b13-roi-res" data-res hidden></div>
            <div class="b13-card b13-roi-hint" data-hint>${ctx.t('hint')}</div>
            <div class="b13-card b13-roi-chart"><div class="b13-lb" style="margin-bottom:6px">${ctx.t('chart')}</div><div data-chart></div></div>
            <div data-docwrap hidden style="display:flex;justify-content:center"></div>
          </div>
        </div>
        <p class="st-disclaimer" style="position:absolute;left:110px;width:1380px;top:806px;margin:0;text-align:center">${ctx.t('note')}</p>`;
      ctx.$$('.b13-roi-in .st-field > label').forEach((l) => l.remove());
      ctx.$('[data-ph]').innerHTML = ctx.t('s.' + type());
      ctx.onFields((v) => { if (ctx.$('[data-ph]')) ctx.$('[data-ph]').innerHTML = ctx.t('s.' + Math.round(num(v.type))); if (EFA.numify) EFA.numify(ctx.el); });
      const setState = (s) => { S.state = s; ctx.$('[data-st="in"]').hidden = s !== 'in'; ctx.$('[data-st="grid"]').hidden = s === 'in'; ctx.$('[data-res]').hidden = s !== 'res'; ctx.$('[data-hint]').hidden = s === 'res'; ctx.$('[data-docwrap]').hidden = s !== 'res'; };
      const drawGrid = () => {
        const tb = ctx.$('.b13-roi-scroll tbody');
        tb.innerHTML = S.rows.map((r, i) => `<tr><td style="text-align:center">${i + 1}</td><td class="cell" data-c="dep" data-i="${i}">${fmt.money(r.dep)}</td><td class="cell" data-c="rec" data-i="${i}">${fmt.money(r.rec)}</td><td class="${r.cf < 0 ? 'neg' : ''}">${fmt.money(r.cf)}</td></tr>`).join('');
        tb.querySelectorAll('.cell').forEach((td) => td.addEventListener('click', () => { if (!editing()) openFill(td.dataset.c, +td.dataset.i); }));
        drawChart();
      };
      const drawChart = () => {
        const n = S.rows.length, W = 470, H = 230, mid = H / 2, mx = Math.max(1, ...S.rows.map((r) => Math.max(r.dep, r.rec)));
        const bw = Math.max(1, (W - 20) / Math.max(n, 1));
        let g = `<line x1="0" x2="${W}" y1="${mid}" y2="${mid}" stroke="#d6cfc4" stroke-width="2"/>`;
        S.rows.forEach((r, i) => {
          const x = 10 + i * bw, w = Math.max(1, bw * 0.7);
          if (r.rec > 0) { const h = (mid - 8) * r.rec / mx; g += `<rect x="${x}" y="${mid - h}" width="${w}" height="${h}" rx="${Math.min(3, w / 2)}" fill="#b8972e"/>`; }
          if (r.dep > 0) { const h = (mid - 8) * r.dep / mx; g += `<rect x="${x}" y="${mid}" width="${w}" height="${h}" rx="${Math.min(3, w / 2)}" fill="#1d3863"/>`; }
        });
        ctx.$('[data-chart]').innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${g}</svg>
          <div style="display:flex;gap:22px;justify-content:center;margin-top:6px" class="b13-note"><span><i style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#b8972e;margin-right:6px"></i>${ctx.t('hRec')}</span><span><i style="display:inline-block;width:12px;height:12px;border-radius:3px;background:#1d3863;margin-right:6px"></i>${ctx.t('hDep')}</span></div>`;
      };
      const resize = () => {
        const n = Math.round(num(ctx.values().n));
        if (!(n > 0)) return false;
        while (S.rows.length < n) S.rows.push({ dep: 0, rec: 0, cf: 0 });
        S.rows.length = n;
        return true;
      };
      const openFill = (c, j) => {
        const f = S.fill;
        const ov = ctx.overlay({
          title: ctx.t(c === 'dep' ? 'fillDep' : 'fillRec'), cls: 'b13-ov-sm b13-ov-noclose',
          html: `<div class="b13-dlg">
            <div class="row">${ctx.t('fAmt', { cls: 'b13-lb' })}<input class="b13-in" data-k="amount"></div>
            <div class="row">${ctx.t('fN', { cls: 'b13-lb' })}<input class="b13-in" data-k="periods"></div>
            <div class="row"><span style="display:flex;align-items:center;gap:10px">${ctx.t('fRate', { cls: 'b13-lb' })}<span data-inf></span></span><input class="b13-in" data-k="rate"></div>
            <div class="foot"><button type="button" class="st-pill b13-ghost" data-x>${ctx.t('cancel')}</button><button type="button" class="st-pill b13-gold" data-ok>${ctx.t('enter')}</button></div></div>`
        });
        const tmp = Object.assign({}, f);
        bindNum(ov.querySelector('[data-k="amount"]'), { type: 'money', get: () => tmp.amount, set: (v) => { tmp.amount = v; }, fmt: fmtBy('money') });
        bindNum(ov.querySelector('[data-k="periods"]'), { type: 'int', min: 0, get: () => tmp.periods, set: (v) => { tmp.periods = v; }, fmt: fmtBy('int') });
        const rateIn = ov.querySelector('[data-k="rate"]');
        bindNum(rateIn, { type: 'pct', get: () => tmp.rate, set: (v) => { tmp.rate = v; }, fmt: fmtBy('pct') });
        const INF = LIB('inflation');
        if (INF && INF.link) {
          ov.querySelector('[data-inf]').innerHTML = INF.link(ctx, { onUse: (r) => { tmp.rate = num(r); rateIn.value = pctTxt(tmp.rate); } });
        }
        ov.querySelector('[data-x]').addEventListener('click', () => { if (!editing()) ov.close(); });
        ov.querySelector('[data-ok]').addEventListener('click', () => {
          if (editing()) return;
          if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
          Object.assign(f, tmp);
          const last = Math.min(j + Math.round(num(f.periods)), S.rows.length);
          for (let k = 0; j + k < last; k++) S.rows[j + k][c] = num(f.amount) * Math.pow(1 + num(f.rate), k);
          S.rows.forEach((r) => { r.cf = r.rec - r.dep; });
          ov.close(); S.res = null; setState('grid'); drawGrid();
        });
        if (EFA.numify) EFA.numify(ov);
      };
      const runIRR = () => {
        const cf = S.rows.map((r) => r.cf);
        if (!(cf.some((x) => x < 0) && cf.some((x) => x > 0))) {
          const ov = ctx.overlay({ title: ctx.t('errTitle'), cls: 'b13-ov-sm b13-ov-noclose', html: `<div class="b13-dlg">${ctx.t('errBody', { tag: 'p' })}<div class="foot"><button type="button" class="st-pill b13-gold" data-ok>${ctx.t('ok')}</button></div></div>` });
          ov.querySelector('[data-ok]').addEventListener('click', () => { if (!editing()) ov.close(); });
          return;
        }
        const pos = cf.filter((x) => x > 0).reduce((s, x) => s + x, 0), neg = cf.filter((x) => x < 0).reduce((s, x) => s + x, 0);
        const ty = type();
        const per = Math.abs(pos - Math.abs(neg)) < 1e-9 ? 0 : roiIRR(cf);
        const ann = per === 0 ? 0 : Math.pow(1 + per, ROI_K[ty]) - 1;
        S.res = { per, ann, pos, neg, ty };
        drawRes(); setState('res');
      };
      const drawRes = () => {
        const r = S.res; if (!r) return;
        ctx.$('[data-res]').innerHTML = `
          <div class="ln big"><span>${ctx.t('rAnn')}</span><b class="num">${fmt.pct(r.ann, 3)}</b></div>
          <div class="ln"><span>${ctx.t('r.' + r.ty)}</span><b class="num">${fmt.pct(r.per, 3)}</b></div>
          <div class="ln"><span>${ctx.t('rNeg')}</span><b class="num">${fmt.money(r.neg)}</b></div>
          <div class="ln"><span>${ctx.t('rPos')}</span><b class="num">${fmt.money(r.pos)}</b></div>`;
        const W = LIB('worksheet');
        ctx.$('[data-docwrap]').innerHTML = W && W.button ? W.button(ctx, { data: sheet, look: 'link' }) : '';
        if (EFA.numify) EFA.numify(ctx.el);
        if (editing() && EFA.edit.arm) EFA.edit.arm(ctx.el);
      };
      const sheet = () => {
        const r = S.res || { per: 0, ann: 0, pos: 0, neg: 0, ty: type() };
        return {
          heading: ctx.t('wsHead'), size: 'medium',
          assumptions: [{ label: ctx.t('r.' + r.ty), value: fmt.pct(r.per, 3) }, { label: ctx.t('rAnn'), value: fmt.pct(r.ann, 3) }, { label: ctx.t('rNeg'), value: fmt.money(r.neg) }, { label: ctx.t('rPos'), value: fmt.money(r.pos) }],
          columns: [{ field: 'p', header: ctx.t('wsPeriod'), type: 'int' }, { field: 'd', header: ctx.t('hDep'), type: 'money' }, { field: 'r', header: ctx.t('hRec'), type: 'money' }, { field: 'c', header: ctx.t('wsCf'), type: 'money' }],
          rows: S.rows.map((x, i) => ({ p: i + 1, d: x.dep, r: x.rec, c: x.cf })), filter: 'p'
        };
      };
      ctx.on(ctx.$('[data-go]'), 'click', () => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); if (!resize()) return; S.res = null; setState('grid'); drawGrid(); });
      ctx.on(ctx.$('[data-back]'), 'click', () => setState('in'));
      ctx.on(ctx.$('[data-irr]'), 'click', runIRR);
      if (S.state !== 'in') { drawGrid(); if (S.res) drawRes(); }
      setState(S.state);
    },
    leave(ctx) { leaveVisit(ctx); }
  });
  /** inputs-state drawing for roi1: money going in below the line, coming back above it */
  function roiArt() {
    const xs = [70, 150, 230, 310, 390, 470, 550, 630, 710];
    const dn = [56, 56, 56, 56, 56, 0, 0, 0, 0], up = [0, 0, 0, 0, 0, 30, 48, 68, 92];
    return `<svg viewBox="0 0 800 190" width="800" height="190" aria-hidden="true">
      <ellipse cx="400" cy="176" rx="330" ry="8" fill="rgba(13,30,58,.07)"/>
      <path d="M40 104H760" stroke="#d6cfc4" stroke-width="3" stroke-linecap="round"/>
      ${xs.map((x) => `<path d="M${x + 23} 98v12" stroke="#cbd5e3" stroke-width="2"/>`).join('')}
      ${xs.map((x, i) => (dn[i] ? `<rect x="${x}" y="108" width="46" height="${dn[i]}" rx="6" fill="#1d3863"/>` : '') + (up[i] ? `<rect x="${x}" y="${100 - up[i]}" width="46" height="${up[i]}" rx="6" fill="#b8972e"/>` : '')).join('')}
      <path d="M640 40C690 22 730 18 762 20" fill="none" stroke="#8a6e22" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 10"/>
      <path d="M748 10l16 10-14 12" fill="none" stroke="#8a6e22" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  /* =====================================================================
     RRON list editors (income, savings, accounts, defined benefits, future assets and expenses),
     the legacy dialog and the home-equity income estimator. Used by rron2, rron2b, rron4 and rron4b.
     ===================================================================== */
  const OPTS = { tax: ['Taxable', 'Tax Def.', 'Tax Adv.'], risk: ['High', 'Low', 'Medium'], yn: ['Yes', 'No'] };
  const LISTS = {
    income: { key: 'case_file_current_income_list', title: 'edIncome', total: 'case_file_current_income', amt: 'amount', cls: 'b13-ov-sm',
      cols: [['description', 'cDesc', 'text', '72%'], ['amount', 'cAmount', 'money', '22%']], blank: { description: '', amount: 0 } },
    annual: { key: 'case_file_annual_saving_list', title: 'edAnnual', total: 'case_file_annual_savings', amt: 'amount', cls: 'b13-ov-lg',
      cols: [['description', 'cDesc', 'text', '40%'], ['amount', 'cAmount', 'money', '18%'], ['taxation', 'cTaxation', 'tax'], ['risk', 'cRisk', 'risk'], ['accessible', 'cAccess', 'yn']],
      blank: { description: '', amount: 0, taxation: 'Taxable', risk: 'High', accessible: 'No' } },
    acc: { key: 'case_file_accumulated_saving_list', title: 'edAcc', total: 'case_file_accumulated_savings', amt: 'current_balance', cls: 'b13-ov-lg',
      cols: [['account_name', 'cAccount', 'text', '38%'], ['current_balance', 'cBalance', 'money', '18%'], ['taxation', 'cTaxation', 'tax'], ['risk', 'cRisk', 'risk'], ['accessible', 'cAccess', 'yn']],
      blank: { account_name: '', current_balance: 0, taxation: 'Taxable', risk: 'High', accessible: 'No' } },
    db: { key: 'case_file_defined_benefit_list', title: 'edDB', amt: 'amount', cls: 'b13-ov-lg',
      cols: [['description', 'cDesc', 'text', '28%'], ['amount', 'cAmount', 'money', '15%'], ['cola', 'cCola', 'pct'], ['start_age', 'cStart', 'age'], ['end_age', 'cEnd', 'age'], ['taxable', 'cTaxable', 'pct100'], ['hide', 'cHide', 'sw'], ['exclude', 'cExcl', 'sw']],
      blank: { description: '', amount: 0, cola: 0, start_age: 0, end_age: 0, taxable: 0, hide: false, exclude: false } },
    fa: { key: 'case_file_future_asset_list', title: 'edFA', amt: 'amount', cls: 'b13-ov-md',
      cols: [['description', 'cDesc', 'text', '50%'], ['amount', 'cAmount', 'money', '20%'], ['age', 'cAge', 'age'], ['taxable', 'cTaxable', 'pct100']],
      blank: { description: '', amount: 0, age: 0, taxable: 0 } },
    fe: { key: 'case_file_future_expense_list', title: 'edFE', amt: 'amount', cls: 'b13-ov-md',
      cols: [['description', 'cDesc', 'text', '42%'], ['amount', 'cAmount', 'money', '18%'], ['inflate', 'cInflate', 'pct'], ['age', 'cAge', 'age'], ['years', 'cYears', 'age']],
      blank: { description: '', amount: 0, inflate: 0, age: 0, years: 0 } }
  };
  /** wording for the editors and dialogs; merged into each screen that opens them */
  const RRON_EDIT_COPY = {
    edIncome: 'Current Incomes', edAnnual: 'Annual Savings', edAcc: 'Accumulated Savings', edDB: 'Defined Benefits', edFA: 'Future Assets', edFE: 'Future Expenses',
    edLegacy: 'Desired Legacy', lbLegacyAmt: 'Legacy amount',
    cDesc: 'Description', cAmount: 'Amount', cAccount: 'Account Name', cBalance: 'Current Balance', cTaxation: 'Taxation', cRisk: 'Risk', cAccess: 'Accessible',
    cCola: 'COLA', cStart: 'Age', cEnd: 'End', cTaxable: '% Taxable', cHide: 'Hide', cExcl: 'Excl', cAge: 'Age', cInflate: 'Inflate', cYears: 'Years',
    'o.tax.0': 'Taxable', 'o.tax.1': 'Tax Def.', 'o.tax.2': 'Tax Adv.', 'o.risk.0': 'High', 'o.risk.1': 'Low', 'o.risk.2': 'Medium', 'o.yn.0': 'Yes', 'o.yn.1': 'No',
    edEmpty: 'Nothing listed yet. Press the plus button to add the first item.', edTotal: 'Total', edSave: 'Save & Return', edAdd: 'Add an item', edDel: 'Remove this item',
    estTitle: 'Income Estimator', estHead: 'Application Assumptions', estPV: 'Property Value', estMtg: 'Existing Mortgage', estState: 'State of Residence',
    estClosing: 'Closing Costs', estThird: 'Third-Party Fees', estAge: 'Your Age', estSpouse: 'Spouse’s Age', estStruct: 'Payment Structure',
    estTerm: 'Term', estTenure: 'Tenure', estYears: 'Term (in Years)', estCalc: 'Calculate', estSource: 'Source', estHide: 'Hide Source', estUse: 'Use Result',
    estMonthly: 'Monthly Income Estimate:', estCredit: 'Credit Line Available:', estTap: 'Click the estimate to switch between monthly income and the credit line.',
    estWait: 'The HUD principal limit factors and fee limits this estimate relies on are being verified. The estimator will calculate as soon as they load.',
    estSrc: 'Method: HUD’s Home Equity Conversion Mortgage principal limit factors at a 6% expected rate, HUD’s maximum claim amount and its origination fee limits, an upfront and annual mortgage insurance premium, and payments made at the start of each month. Closing costs and third-party fees are the estimates you enter from a lender’s fee worksheet. Rates are model assumptions, not quotes.',
    rmTitle: 'Before You Rely on This Estimate',
    rmBody: 'Edwards Financial & Associates does not make loans, and this figure is not an offer of credit. It rests on today’s rate assumptions and the home value, ages and existing debt you entered. Actual figures will differ. A borrower must apply and be approved, attend HUD-approved counseling, live in the home as a principal residence and keep paying property taxes, insurance and upkeep.',
    rmOk: 'I Understand'
  };
  function sumList(list, amt) { return (Array.isArray(list) ? list : []).reduce((s, r) => s + num(r[amt]), 0); }
  /** modal list editor. onSaved(rows, total) runs after "Save & Return" when something changed */
  function openListEditor(ctx, kind, onSaved) {
    const L = LISTS[kind];
    const rows = clone(Array.isArray(cget(L.key)) ? cget(L.key) : []);
    let changed = false;
    const ov = ctx.overlay({
      title: ctx.t(L.title), cls: L.cls,
      html: `<div class="b13-led"><div class="b13-led-scroll"><table class="b13-led-t"><thead><tr>${L.cols.map((c) => `<th style="${c[3] ? `width:${c[3]}` : ''}">${ctx.t(c[1])}</th>`).join('')}<th style="width:48px"></th></tr></thead><tbody></tbody></table>
          <div class="b13-led-empty" hidden>${ctx.t('edEmpty')}</div></div>
        <div class="b13-led-foot"><button type="button" class="b13-led-add" data-add aria-label="${esc(ctx.text('edAdd'))}">${ICON.plus}</button>
          ${L.total ? `<span class="b13-led-tot">${ctx.t('edTotal')}<b class="num" data-tot></b></span>` : '<span class="b13-led-tot"></span>'}
          <button type="button" class="st-pill b13-gold" data-save style="min-height:52px;min-width:200px">${ctx.t('edSave')}</button></div></div>`
    });
    const tb = ov.querySelector('tbody');
    const tot = () => { const t = ov.querySelector('[data-tot]'); if (t) t.textContent = fmt.money(sumList(rows, L.amt)); };
    const draw = (focusRow) => {
      tb.innerHTML = rows.map((r, i) => `<tr data-r="${i}">${L.cols.map((c) => {
        const [f, , type] = c;
        if (type === 'text') return `<td><input class="b13-in sm txt" data-f="${f}" value="${esc(r[f] == null ? '' : r[f])}"></td>`;
        if (type === 'tax' || type === 'risk' || type === 'yn') { const ix = Math.max(0, OPTS[type].indexOf(r[f])); return `<td><button type="button" class="b13-led-cyc" data-cyc="${f}" data-o="${type}">${ctx.t('o.' + type + '.' + ix)}</button></td>`; }
        if (type === 'sw') return `<td style="text-align:center"><button type="button" class="b13-sw" data-sw="${f}" aria-pressed="${r[f] === true}"></button></td>`;
        return `<td><input class="b13-in sm" data-n="${f}" data-t="${type}"></td>`;
      }).join('')}<td><button type="button" class="b13-led-del" data-del aria-label="${esc(ctx.text('edDel'))}">${ICON.trash}</button></td></tr>`).join('');
      ov.querySelector('.b13-led-empty').hidden = rows.length > 0;
      tb.querySelectorAll('tr').forEach((tr) => {
        const r = rows[+tr.dataset.r];
        tr.querySelectorAll('input[data-f]').forEach((inp) => {
          inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
          inp.addEventListener('input', () => { r[inp.dataset.f] = inp.value; changed = true; });
        });
        tr.querySelectorAll('input[data-n]').forEach((inp) => {
          const f = inp.dataset.n, t = inp.dataset.t;
          const type = t === 'age' ? 'int' : t === 'pct100' ? 'pct' : t;
          bindNum(inp, { type, min: t === 'age' ? 0 : undefined, max: t === 'age' ? 100 : t === 'pct100' ? 1 : undefined,
            get: () => r[f], set: (v) => { if (num(r[f]) !== v) changed = true; r[f] = v; tot(); }, fmt: fmtBy(type) });
        });
        tr.querySelectorAll('[data-cyc]').forEach((b) => b.addEventListener('click', () => {
          if (editing()) return;
          const f = b.dataset.cyc, o = OPTS[b.dataset.o], ix = (Math.max(0, o.indexOf(r[f])) + 1) % o.length;
          r[f] = o[ix]; changed = true; b.innerHTML = ctx.t('o.' + b.dataset.o + '.' + ix);
        }));
        tr.querySelectorAll('[data-sw]').forEach((b) => b.addEventListener('click', () => {
          if (editing()) return;
          const f = b.dataset.sw; r[f] = !(r[f] === true); changed = true; b.setAttribute('aria-pressed', r[f]);
        }));
        tr.querySelector('[data-del]').addEventListener('click', () => { if (editing()) return; rows.splice(+tr.dataset.r, 1); changed = true; draw(); tot(); });
      });
      if (focusRow != null) { const first = tb.querySelector(`tr[data-r="${focusRow}"] input`); if (first) first.focus(); }
      if (EFA.numify) EFA.numify(tb);
      if (editing() && EFA.edit.arm) EFA.edit.arm(ov);
    };
    draw(); tot();
    ov.querySelector('[data-add]').addEventListener('click', () => { if (editing()) return; rows.push(clone(L.blank)); changed = true; draw(rows.length - 1); tot(); });
    ov.querySelector('[data-save]').addEventListener('click', () => {
      if (editing()) return;
      if (document.activeElement && ov.contains(document.activeElement)) document.activeElement.blur();
      if (changed) {
        cset(L.key, rows);
        if (L.total) cset(L.total, sumList(rows, L.amt));
      }
      ov.close();
      if (changed && onSaved) onSaved(rows, L.total ? sumList(rows, L.amt) : null);
    });
    return ov;
  }
  /** small "Desired Legacy" dialog: one money field and Save & Return; closing without saving reverts */
  function openLegacy(ctx, onSaved) {
    let v = num(cget('desired_legacy'));
    const ov = ctx.overlay({
      title: ctx.t('edLegacy'), cls: 'b13-ov-sm',
      html: `<div class="b13-dlg"><div class="row">${ctx.t('lbLegacyAmt', { cls: 'b13-lb' })}<input class="b13-in" data-k></div>
        <div class="foot"><button type="button" class="st-pill b13-gold" data-save style="min-width:200px">${ctx.t('edSave')}</button></div></div>`
    });
    bindNum(ov.querySelector('[data-k]'), { type: 'money', min: 0, get: () => v, set: (x) => { v = x; }, fmt: fmtBy('money') });
    ov.querySelector('[data-save]').addEventListener('click', () => {
      if (editing()) return;
      if (document.activeElement && ov.contains(document.activeElement)) document.activeElement.blur();
      cset('desired_legacy', v); ov.close(); if (onSaved) onSaved(v);
    });
  }

  /* ---------- home-equity (reverse mortgage) income estimator, rron2.md "exact model" ---------- */
  const HECM = {
    data() { return D().hecm || null; },
    /** principal limit factor for the youngest age at the model's 6% expected rate (flexible about the table's shape) */
    plf(age) {
      const H = HECM.data(); if (!H || !H.plf) return null;
      const t = H.plf, a = Math.round(age);
      const col = t.rate0600 || t['0.06'] || t['0.060'] || t['6.000'] || t['6'] || null;
      let v = null;
      if (col) v = Array.isArray(col) ? col[a - 62] : col[a];
      else if (Array.isArray(t)) v = t[a - 62];
      else if (t[a] != null) v = typeof t[a] === 'object' ? (t[a]['0.06'] != null ? t[a]['0.06'] : t[a].rate0600) : t[a];
      return v == null || !isFinite(+v) ? null : +v;
    },
    /** origination fee from HUD's limits (floor, share of the first tier, share above it, cap) */
    origFee(mca) {
      const H = HECM.data(); const o = H && (H.originationFee || H.origination);
      if (!o) return null;
      const floor = num(o.floor != null ? o.floor : o.min), pct1 = num(o.firstTierPct != null ? o.firstTierPct : o.pctFirst), tier = num(o.firstTier != null ? o.firstTier : o.tier);
      const pct2 = num(o.overPct != null ? o.overPct : o.pctOver), cap = num(o.cap != null ? o.cap : o.max);
      if (!(cap > 0) || !(tier > 0)) return null;
      return Math.min(cap, Math.min(Math.max(floor, pct1 * mca), pct1 * tier) + pct2 * Math.max(0, mca - tier));
    },
    minAge() { const H = HECM.data(); const m = H && (H.minAge != null ? H.minAge : H.minBorrowerAge); return m == null ? null : +m; },
    ready() { const H = HECM.data(); return !!(H && H.maxClaimAmount > 0 && H.mipAnnual != null && HECM.plf(80) != null && HECM.origFee(H.maxClaimAmount) != null && HECM.minAge() != null); },
    /** the exact model; returns { monthly, credit } or null when figures are missing */
    run(o) {
      if (!HECM.ready()) return null;
      const H = HECM.data(), START = HECM.minAge(), MAX_AGE = 100, EXPECTED = 0.06, MONTHLY = (EXPECTED + num(H.mipAnnual)) / 12;
      if (o.borrowerAge < START || o.spouseAge < START) return { monthly: 0, credit: 0 };
      const MCA = Math.min(o.propertyValue, H.maxClaimAmount);
      const youngest = o.borrowerAge < o.spouseAge ? o.borrowerAge : o.spouseAge;
      const plf = HECM.plf(Math.min(youngest, MAX_AGE));
      if (plf == null) return null;
      const PL = youngest < START ? 0 : MCA * plf;
      const origFee = HECM.origFee(MCA);
      let costs = origFee + num(o.closingFee) + num(o.thirdParty) + 0.005 * MCA;
      if (costs + o.existing < 0.6 * PL) costs = costs - 0.02 * MCA; // reproduced exactly from the original (see build notes)
      const credit = PL - costs - o.existing;
      const months = o.structure === 'Tenure' ? (youngest <= 95 ? 12 * (MAX_AGE - youngest) : 60) : 12 * o.termYears;
      const monthly = PMT(MONTHLY, months, -credit, 0, 1);
      return { monthly, credit };
    }
  };
  EFA.engines.hecmEstimate = HECM;
  function openEstimator(ctx, onUsed) {
    const S = {
      propertyValue: num(cget('rev_mortg_property_value')), existing: num(cget('rev_mortg_existing_mortgage_balance')),
      closingFee: num(cget('rev_mortg_closing_fee')), thirdParty: num(cget('rev_mortg_third_party_fees')),
      borrowerAge: Math.round(num(cget('rev_mortg_borrower_age'))), spouseAge: Math.round(num(cget('rev_mortg_spouse_age'))),
      structure: cget('rev_mortg_payment_structure') === 'Term' ? 'Term' : 'Tenure', termYears: Math.round(num(cget('rev_mortg_payment_term_in_year')))
    };
    const ui = { result: null, credit: false, source: false };
    const ready = HECM.ready();
    const ov = ctx.overlay({ title: ctx.t('estTitle'), cls: 'b13-ov-sm', html: '<div class="b13-est"></div>' });
    const body = ov.querySelector('.b13-est');
    const row = (k, inner) => `<div class="row">${ctx.t(k)}${inner}</div>`;
    const draw = () => {
      body.innerHTML = `
        ${ui.source ? `<div class="box">${ctx.t('estSrc', { tag: 'p', cls: 'src', attrs: 'style="margin:0"' })}</div>` : `
        ${ctx.t('estHead', { tag: 'div', cls: 'b13-lb' })}
        <div class="box">
          ${row('estPV', '<input class="b13-in sm" data-k="propertyValue" data-t="money">')}
          ${row('estMtg', '<input class="b13-in sm" data-k="existing" data-t="money">')}
          ${row('estClosing', '<input class="b13-in sm" data-k="closingFee" data-t="money">')}
          ${row('estThird', '<input class="b13-in sm" data-k="thirdParty" data-t="money">')}
          ${row('estAge', '<input class="b13-in sm" data-k="borrowerAge" data-t="int">')}
          ${row('estSpouse', '<input class="b13-in sm" data-k="spouseAge" data-t="int">')}
          ${row('estStruct', `<div class="st-seg" role="radiogroup" style="justify-self:end">${['Term', 'Tenure'].map((v) => `<button type="button" role="radio" class="st-seg-b" data-s="${v}" aria-checked="${S.structure === v}">${ctx.t(v === 'Term' ? 'estTerm' : 'estTenure')}</button>`).join('')}</div>`)}
          ${S.structure === 'Term' ? row('estYears', '<input class="b13-in sm" data-k="termYears" data-t="int">') : ''}
        </div>
        ${ui.result ? `<div class="res" data-flip>${ui.credit ? ctx.t('estCredit') : ctx.t('estMonthly')} <b class="num">${fmt.money(ui.credit ? ui.result.credit : ui.result.monthly, { dp: 2 })}</b></div>${ctx.t('estTap', { tag: 'div', cls: 'b13-note', attrs: 'style="text-align:center"' })}` : ''}
        ${!ready ? `<div class="b13-note" style="font-size:16px">${ctx.t('estWait')}</div>` : ''}`}
        <div class="foot" style="display:flex;justify-content:flex-end;gap:12px;flex-wrap:wrap">
          <button type="button" class="st-pill b13-ghost" data-src>${ctx.t(ui.source ? 'estHide' : 'estSource')}</button>
          ${!ui.result && !ui.source ? `<button type="button" class="st-pill b13-gold" data-calc ${ready ? '' : 'disabled style="opacity:.45;cursor:not-allowed"'}>${ctx.t('estCalc')}</button>` : ''}
          ${ui.result && !ui.source ? `<button type="button" class="st-pill b13-gold" data-use>${ctx.t('estUse')}</button>` : ''}
        </div>`;
      body.querySelectorAll('input[data-k]').forEach((inp) => {
        const k = inp.dataset.k, t = inp.dataset.t;
        bindNum(inp, { type: t, min: 0, get: () => S[k], set: (v) => { if (S[k] !== v) { S[k] = v; if (ui.result) { ui.result = null; draw(); } } }, fmt: fmtBy(t) });
      });
      body.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => { if (editing()) return; S.structure = b.dataset.s; ui.result = null; draw(); }));
      const flip = body.querySelector('[data-flip]'); if (flip) flip.addEventListener('click', () => { if (editing()) return; ui.credit = !ui.credit; draw(); });
      body.querySelector('[data-src]').addEventListener('click', () => { if (editing()) return; ui.source = !ui.source; draw(); });
      const calc = body.querySelector('[data-calc]');
      if (calc) calc.addEventListener('click', () => {
        if (editing() || !ready) return;
        if (document.activeElement && ov.contains(document.activeElement)) document.activeElement.blur();
        const r = HECM.run(S); if (!r) return;
        ui.result = r; ui.credit = false; draw();
      });
      const use = body.querySelector('[data-use]');
      if (use) use.addEventListener('click', () => {
        if (editing() || !ui.result) return;
        cset('rev_mortg_property_value', S.propertyValue); cset('rev_mortg_existing_mortgage_balance', S.existing);
        cset('rev_mortg_closing_fee', S.closingFee); cset('rev_mortg_third_party_fees', S.thirdParty);
        cset('rev_mortg_borrower_age', S.borrowerAge); cset('rev_mortg_spouse_age', S.spouseAge);
        cset('rev_mortg_payment_structure', S.structure); cset('rev_mortg_payment_term_in_year', S.termYears);
        const list = clone(Array.isArray(cget('case_file_defined_benefit_list')) ? cget('case_file_defined_benefit_list') : []);
        const amount = 12 * ui.result.monthly, end = S.structure === 'Tenure' ? 100 : S.borrowerAge + S.termYears;
        const hit = list.find((r) => r.description === RM_NAME);
        if (hit) Object.assign(hit, { amount, start_age: S.borrowerAge, end_age: end });
        else list.push({ description: RM_NAME, amount, start_age: S.borrowerAge, end_age: end, cola: 0, hide: false, exclude: true, taxable: 0 });
        cset('case_file_defined_benefit_list', list);
        ov.close();
        if (onUsed) onUsed(list);
        ctx.timeout(() => openRMDisclosure(ctx), 200);
      });
      if (EFA.numify) EFA.numify(body);
      if (editing() && EFA.edit.arm) EFA.edit.arm(ov);
    };
    draw();
  }
  function openRMDisclosure(ctx) {
    const ov = ctx.overlay({ title: ctx.t('rmTitle'), cls: 'b13-ov-sm b13-ov-noclose', html: `<div class="b13-dlg">${ctx.t('rmBody', { tag: 'p' })}<div class="foot"><button type="button" class="st-pill b13-gold" data-ok>${ctx.t('rmOk')}</button></div></div>` });
    ov.querySelector('[data-ok]').addEventListener('click', () => { if (!editing()) ov.close(); });
  }

  /* =====================================================================
     rron2 / rron2b: the assumptions sheet (personal and business-owner)
     ===================================================================== */
  const ASSUME_COPY = Object.assign({}, LIB_COPY, RRON_EDIT_COPY, {
    head: 'Assumptions',
    lbAge: 'Current Age', lbRA: 'Retirement Age', lbLE: 'Life Expectancy', lbInc: 'Current Income', lbSave: 'Annual Saving', lbAcc: 'Accumulated $',
    lbRA2: 'Accumulation', lbRD: 'Distribution', lbInfl: 'Inflation', lbTax: 'Tax',
    lbDB: 'Defined Benefits', lbFA: 'Future Assets', lbFE: 'Future Expenses', lbLeg: 'Legacy',
    lbCL: 'Current Lifestyle', lbRL: 'Retirement Lifestyle', lbInflate: 'Inflate', lbCola: 'COLA', pv: 'Today’s $', fv: 'Future $',
    eqInc: 'Current Income', eqTax: 'Tax', eqSave: 'Annual Savings',
    emptyIncome: 'The income list is empty. Open the income editor and add an item first.',
    emptySave: 'The savings list is empty. Open the savings editor and add an item first.',
    emptyAcc: 'The accounts list is empty. Open the accounts editor and add an item first.',
    leTip: 'Open the life expectancy calculator', taxTip: 'Open the income tax calculator'
  });
  const ASSUME_COPY_B = Object.assign({}, ASSUME_COPY, {
    lbBL: 'Business Lifestyle', lbBLnote: '(paid by the business)', lbBV: 'Business Value', lbBG: 'Growth Rate',
    lbAcc: 'Other Investments', lbSave: 'O.I. Contribution', eqSave: 'O.I. Cont.', eqBL: 'Bus. Lifestyle',
    emptyAcc: 'The other investments list is empty. Open its editor and add an item first.',
    emptySave: 'The contributions list is empty. Open its editor and add an item first.'
  });
  /** current lifestyle: rron2 excludes employer match; rron2b counts every item, uses the stored total and adds business lifestyle */
  function currentLifestyle(biz) {
    const T = num(cget('rron_taxes')), list = Array.isArray(cget('case_file_annual_saving_list')) ? cget('case_file_annual_saving_list') : [];
    const income = num(cget('case_file_current_income'));
    if (biz) {
      const S = num(cget('case_file_annual_savings')), BL = num(cget('case_file_business_supported_lifestyle'));
      const Dd = list.reduce((s, r) => s + (r.taxation === 'Tax Def.' ? num(r.amount) * T : 0), 0);
      return { cl: income - (income * T - Dd) - S + BL, income, T, save: S, BL };
    }
    let sOwn = 0, matchAmt = 0, relief = 0;
    list.forEach((r) => { const a = num(r.amount); if (isMatch(r.description)) { matchAmt += a; return; } sOwn += a; if (r.taxation === 'Tax Def.') relief += a * T; });
    return { cl: income - (income * T - relief) - sOwn, income, T, save: sumList(list, 'amount') - matchAmt };
  }
  function renderAssumptions(ctx, biz) {
    // a tax rate handed back by the Income Tax calculator counts as a later recomputation
    const handed = takeTaxHandoff();
    if (handed != null) cset('rron_taxes', handed);
    const life = (k) => `<span class="b13-link" data-link="${k}">${ctx.t(k === 'le' ? 'lbLE' : k === 'infl' ? 'lbInfl' : 'lbTax')}</span>`;
    const inp = (key, type, extra) => `<input class="b13-in" data-key="${key}" data-type="${type}" ${extra || ''}>`;
    const chip = (act, icon, n) => `<button type="button" class="b13-chip" data-act="${act}">${icon}${n ? `<span class="b13-badge" data-badge="${act}"></span>` : ''}</button>`;
    const f = (span, lb, inner) => `<div class="b13-as-f" style="grid-column:span ${span}"><div class="lb">${lb}</div><div class="in">${inner}</div></div>`;
    const ro = (act) => `<div class="ro num" data-ro="${act}"></div>`;
    const bands = [
      `${f(4, ctx.t('lbAge'), inp('case_file_current_age', 'int', 'data-min="1" data-max="100"'))}${f(4, ctx.t('lbRA'), inp('case_file_retirement_age', 'int', 'data-min="1" data-max="100"'))}${f(4, life('le'), inp('case_file_life_expectancy', 'int', 'data-min="1" data-max="100"'))}`,
      biz
        ? `${f(3, ctx.t('lbInc'), inp('case_file_current_income', 'money', 'data-total="income"') + chip('income', ICON.pen, 1))}${f(4, ctx.t('lbBL') + ctx.t('lbBLnote', { tag: 'small' }), inp('case_file_business_supported_lifestyle', 'money'))}${f(3, ctx.t('lbBV'), inp('case_file_business_value', 'money'))}${f(2, ctx.t('lbBG'), inp('case_file_ror_business_value', 'pct'))}`
        : `${f(4, ctx.t('lbInc'), inp('case_file_current_income', 'money', 'data-total="income"') + chip('income', ICON.pen, 1))}${f(4, ctx.t('lbSave'), inp('case_file_annual_savings', 'money', 'data-total="annual"') + chip('annual', ICON.pen, 1) + checkBox('data-flag="inflate_annual_savings"', cget('inflate_annual_savings'), ctx.t('lbInflate')))}${f(4, ctx.t('lbAcc'), inp('case_file_accumulated_savings', 'money', 'data-total="acc"') + chip('acc', ICON.pen, 1) + chip('estimator', ICON.house))}`,
      biz ? `${f(6, ctx.t('lbAcc'), inp('case_file_accumulated_savings', 'money', 'data-total="acc"') + chip('acc', ICON.pen, 1))}${f(6, ctx.t('lbSave'), inp('case_file_annual_savings', 'money', 'data-total="annual"') + chip('annual', ICON.pen, 1) + checkBox('data-flag="inflate_annual_savings"', cget('inflate_annual_savings'), ctx.t('lbInflate')))}` : '',
      `${f(3, ctx.t('lbRA2'), inp('case_file_ror_accumulation', 'pct', 'data-max="0.12" data-ror="1"'))}${f(3, ctx.t('lbRD'), inp('case_file_ror_distribution', 'pct', 'data-max="0.12" data-ror="1"'))}${f(3, life('infl'), inp('case_file_ror_inflation', 'pct'))}${f(3, life('tax'), inp('rron_taxes', 'pct', 'data-min="0" data-max="1"'))}`,
      `${f(3, ctx.t('lbDB'), ro('db') + chip('db', ICON.pen, 1))}${f(3, ctx.t('lbFA'), ro('fa') + chip('fa', ICON.pen, 1))}${f(3, ctx.t('lbFE'), ro('fe') + chip('fe', ICON.pen, 1))}${f(3, ctx.t('lbLeg'), ro('legacy') + chip('legacy', ICON.pen))}`
    ].filter(Boolean);
    const eq = biz
      ? `= <span class="t" data-eq="inc">${ctx.t('eqInc')}</span> − <span class="t" data-eq="tax">${ctx.t('eqTax')}</span> − <span class="t" data-eq="save">${ctx.t('eqSave')}</span> + <span class="t" data-eq="bl">${ctx.t('eqBL')}</span>`
      : `= <span class="t" data-eq="inc">${ctx.t('eqInc')}</span> − <span class="t" data-eq="tax">${ctx.t('eqTax')}</span> − <span class="t" data-eq="save">${ctx.t('eqSave')}</span>`;
    ctx.el.innerHTML = `
      <div class="b13-head" style="top:36px">${ctx.t('head', { tag: 'h1', cls: 'st-h2', attrs: 'style="font-size:52px"' })}</div>
      <div class="b13-card b13-as" ${biz ? 'style="top:108px"' : ''}>
        ${bands.map((b) => `<div class="b13-as-band" ${biz ? 'style="padding:13px 0 15px"' : ''}>${b}</div>`).join('')}
        <div class="b13-as-life" ${biz ? 'style="padding:16px 40px 20px;margin-top:12px"' : ''}>
          <div><div class="k">${ctx.t('lbCL')}</div><div class="v num" data-cl></div><div class="eq">${eq}</div></div>
          <div><div class="k">${ctx.t('lbRL')}</div><div class="in">${inp('retirement_income_desired', 'money')}<button type="button" class="b13-pvfv" data-pvfv>${ctx.t('pv', { attrs: 'data-m="pv"' })}${ctx.t('fv', { attrs: 'data-m="fv"' })}</button>${checkBox('data-flag="inflate_withdrawals"', cget('inflate_withdrawals'), ctx.t('lbCola'))}</div></div>
        </div>
      </div>`;
    // ---- inputs bound to the shared case values ----
    const inputs = {};
    ctx.$$('input[data-key]').forEach((el) => {
      const key = el.dataset.key, type = el.dataset.type; inputs[key] = el;
      bindNum(el, {
        type, min: el.dataset.min != null ? +el.dataset.min : (type === 'money' ? undefined : undefined), max: el.dataset.max != null ? +el.dataset.max : undefined,
        get: () => cget(key), fmt: fmtBy(type),
        set: (v) => {
          const old = num(cget(key));
          if (el.dataset.total) {
            const kind = el.dataset.total, L = LISTS[kind], list = Array.isArray(cget(L.key)) ? clone(cget(L.key)) : [];
            if (v === old) return;
            if (!list.length) { ctx.toast(ctx.text(kind === 'income' ? 'emptyIncome' : kind === 'annual' ? 'emptySave' : 'emptyAcc')); return; }
            list[0][L.amt] = num(list[0][L.amt]) + (v - sumList(list, L.amt));
            cset(L.key, list); cset(key, v);
            if (kind !== 'acc') recompute(true);
            refresh(); return;
          }
          cset(key, v);
          if (key === 'rron_taxes' || (biz && key === 'case_file_business_supported_lifestyle')) recompute(true);
          refresh();
        }
      });
    });
    // ---- the current lifestyle ----
    const recompute = (later) => {
      const r = currentLifestyle(biz);
      if (biz || r.cl !== num(cget('current_lifestyle'))) cset('current_lifestyle', r.cl);
      if (later && (biz || r.cl !== num(cget('retirement_income_desired')))) { cset('retirement_income_desired', r.cl); if (inputs.retirement_income_desired) inputs.retirement_income_desired.value = fmt.money(r.cl); }
      return r;
    };
    const refresh = () => {
      const r = currentLifestyle(biz);
      ctx.$('[data-cl]').textContent = money02(num(cget('current_lifestyle')));
      const tip = { inc: fmt.money(r.income), tax: pctTxt(r.T), save: fmt.money(r.save), bl: fmt.money(r.BL || 0) };
      ctx.$$('[data-eq]').forEach((n) => { n.title = tip[n.dataset.eq]; });
      ['db', 'fa', 'fe'].forEach((k) => {
        const list = cget(LISTS[k].key) || [];
        const ro = ctx.$(`[data-ro="${k}"]`); if (ro) ro.textContent = fmt.money(sumList(list, 'amount'));
        const b = ctx.$(`[data-badge="${k}"]`); if (b) { b.textContent = list.length; b.hidden = !list.length; }
      });
      ['income', 'annual', 'acc'].forEach((k) => { const b = ctx.$(`[data-badge="${k}"]`); if (b) { const n = (cget(LISTS[k].key) || []).length; b.textContent = n; b.hidden = !n; } });
      ctx.$('[data-ro="legacy"]').textContent = fmt.money(num(cget('desired_legacy')));
      const pv = !!cget('retirement_income_is_pv');
      ctx.$('[data-m="pv"]').hidden = !pv; ctx.$('[data-m="fv"]').hidden = pv;
      Object.keys(inputs).forEach((k) => { if (document.activeElement !== inputs[k]) inputs[k].value = fmtBy(inputs[k].dataset.type)(cget(k)); });
    };
    recompute(handed != null); refresh();
    // ---- links, toggles and editors ----
    ctx.on(ctx.$$('[data-link]'), 'click', (e, n) => {
      const k = n.dataset.link;
      if (k === 'tax') { ctx.jump('INCTAXC', 'incTax1'); return; }
      if (k === 'le') {
        const LE = LIB('lifeExpectancy'); if (!LE || !LE.open) { notReady(ctx); return; }
        LE.open(ctx, { age: () => num(cget('case_file_current_age')), spouseAge: () => num(cget('case_file_spouse_age')), onUse: (age) => { cset('case_file_life_expectancy', Math.round(num(age))); refresh(); } });
        return;
      }
      const INF = LIB('inflation'); if (!INF || !INF.open) { notReady(ctx); return; }
      INF.open(ctx, { onUse: (r) => { cset('case_file_ror_inflation', num(r)); refresh(); } });
    });
    ctx.on(ctx.$$('[data-flag]'), 'click', (e, n) => { const k = n.dataset.flag, v = !cget(k); cset(k, v); n.setAttribute('aria-checked', v); });
    ctx.on(ctx.$('[data-pvfv]'), 'click', () => { cset('retirement_income_is_pv', !cget('retirement_income_is_pv')); refresh(); });
    ctx.on(ctx.$$('[data-act]'), 'click', (e, n) => {
      const a = n.dataset.act;
      if (a === 'estimator') { openEstimator(ctx, () => refresh()); return; }
      if (a === 'legacy') { openLegacy(ctx, () => refresh()); return; }
      openListEditor(ctx, a, () => { if (a === 'income' || a === 'annual') recompute(true); refresh(); });
    });
    const DS = LIB('disclosure');
    if (DS && DS.guard) DS.guard(ctx, 'input[data-ror]', { flag: 'ror' });
  }
  EFA.screen('rron2', {
    title: 'Retirement assumptions',
    copy: Object.assign({}, ASSUME_COPY, {
      _notes: 'Every projection is only as good as its assumptions. We capture them together, in your words and numbers.\n\n- Ask: If you retired today, how much would you want to spend each year to feel comfortable?\nPAUSE\n\n- Pencil icons open the detail lists; the house icon estimates home-equity income. Tax opens the income tax calculator and brings the rate back.'
    }),
    render(ctx) { renderAssumptions(ctx, false); }
  });
  EFA.screen('rron2b', {
    title: 'Business owner retirement assumptions',
    copy: Object.assign({}, ASSUME_COPY_B, {
      _notes: 'For a business owner, the business is part of the retirement plan: what it pays for today, and what it could be worth when you step away.\n\n- Ask: If you sold the business on the day you retire, what do you believe it would bring?\nPAUSE\n\n- Business lifestyle is the personal spending the business covers today.'
    }),
    render(ctx) { renderAssumptions(ctx, true); }
  });

  /* =====================================================================
     rron4 / rron4b: present vs revised projection with the close-the-gap levers
     ===================================================================== */
  const PROJ_COPY = Object.assign({}, LIB_COPY, RRON_EDIT_COPY, {
    lvROR: 'Increase ROR', lvSave: 'Save More', lvWork: 'Work Longer', lvSpend: 'Spend Less', lvInfl: 'Change Inflation', lvBiz: 'Grow Business',
    perMo: '/mo', perYr: '/yr', agePre: 'Age',
    rorPtsA: 'Return raised by', rorPtsB: 'percentage points', rorPctA: 'The required return is', rorPctB: 'higher than your original assumption',
    lsRed: 'Lifestyle Reduction', lsInc: 'Lifestyle Increase',
    gPresent: 'Present Projection', gRevised: 'Revised Projection', gBal: 'Account Balance', gLife: 'Annual Lifestyle Plus DBs', gLifePV: 'PV of Lifestyle Plus DBs', gAge: 'Age',
    tkBal: 'Balance at Retirement', tkInc: 'First Year Retirement Income', tkBegins: 'Begins at', tkEnds: 'Ends at', tkFund: 'Future Lifestyle Funding',
    tkGoalA: 'of the', tkGoalB: 'retirement goal', tipAge: 'Age', tipNeed: 'Income needed', tipAct: 'Income actual', tipPV: 'Today’s dollars',
    tkHint: 'Point to any year on the bar to see what it needs and what it gets.',
    btnDB: 'Defined Benefits', vGrid: 'Grid', vTank: 'Tank', vPEM: 'Model', btnReset: 'Reset', pemStep: 'Step', pemScale: 'Scale', pemAge: 'Age',
    toTank: 'Tank View', toGrid: 'Grid View', pemWait: 'The money model is still loading. The grid and tank views are ready now.',
    dROR: 'Increase Rate of Return', dSave: 'Save More', dWork: 'Work Longer', dSpend: 'Spend Less', dInfl: 'Change Inflation', dBiz: 'Grow Business',
    oSpecROR: 'Enter a new rate', oCalcROR: 'Find the rate needed', oSpecSave: 'Enter new savings', oCalcSave: 'Find the savings needed',
    oSpecWork: 'Enter a retirement age', oCalcWork: 'Find the age needed', oSpecSpend: 'Enter a new lifestyle', oCalcSpend: 'Find the lifestyle that lasts',
    oSpecBiz: 'Enter a growth rate', oCalcBiz: 'Find the growth needed',
    prROR: 'Enter the revised rate of return.', prUni: 'Check the box to apply the new rate in the retirement years too.',
    prSave: 'Enter the revised annual savings.', prWork: 'Enter the revised retirement age.', prSpend: 'Enter the revised retirement lifestyle in today’s dollars.',
    prBiz: 'Enter the yearly growth rate for the business value.', prLast: 'Enter the last age that should still receive a withdrawal.', prInfl: 'Enter the revised inflation rate.',
    unify: 'Include Distribution Years', calc: 'Calculate', histInfl: 'Historic Inflation',
    msgNoGoal: 'No retirement income goal has been entered yet. Please set one on the assumptions screen first.',
    msgNoSol: 'No solution was found. Are the assumptions realistic? Try entering a value with the first option instead.',
    chTitle: 'Please choose', chReport: 'Report', chSummary: 'Summary of Results', chFour: '4 Questions Report', chWs: 'Worksheets', chProj: 'Projections',
    chPresent: 'Present', chRevised: 'Revised', chSumm: 'Summary Comparison', chSrc: 'Source of Funds',
    chInc: 'Current Income', chAcc: 'Accumulated $', chSave: 'Annual Saving', chDB: 'Defined Benefits', chFA: 'Future Assets', chFE: 'Future Expenses',
    wAge: 'Age', wCur: 'Current Savings', wEarn: 'Earned Income', wContrib: 'Annual Contributions', wFA: 'Future Asset', wFE: 'Future Expense',
    wReq: 'Required Lifestyle', wDB: 'Sum of Annual DBs', wReqAft: 'Required Lifestyle After DBs', wAct: 'Actual Lifestyle From Tanks',
    wBoy: 'Beginning-of-Year Balance', wGrowth: 'Annual Growth', wEoy: 'End-of-Year Balance', wLD: 'Lifestyle Dollars', wTax: 'Taxes Paid', wYears: 'Years',
    sPB: 'Present Account Balance', sPL: 'Present Annual Lifestyle', sRB: 'Revised Account Balance', sRL: 'Revised Annual Lifestyle',
    aAge: 'Current Age', aRA: 'Retirement Age', aInc: 'Current Income', aRID: 'Retirement Income Desired', aRA2: 'Accumulation Return', aRD: 'Retirement Return',
    aInfl: 'Inflation', aLE: 'Life Expectancy', aAcc: 'Accumulated Savings', aSave: 'Future Annual Savings', aLeg: 'Legacy', aTax: 'Tax Rate',
    aBL: 'Business Lifestyle', aBV: 'Business Value', aBG: 'Business Growth Rate', aOI: 'Other Investments', aOIC: 'O.I. Annual Contribution',
    rpTitle: 'Summary of Results', rpFor: 'Prepared for', rpAssume: 'Your starting assumptions', rpEvery: 'What every option assumes',
    rpE1: 'Your savings grow each year by', rpE2: 'Your retirement withdrawals grow each year by', rpE3: 'Your money earns this rate in retirement:',
    rpE4: 'The defined benefits you listed are included unless marked excluded.',
    rpIllus: 'This is a hypothetical illustration. It is not guaranteed and does not represent any specific investment or product. Prepared on',
    rpGoal: 'Each option below is a single change, on its own, that keeps today’s lifestyle going through your life expectancy.',
    rpO1: 'Earn a higher return', rpO2: 'Save more', rpO3: 'Work longer', rpO4: 'Spend less', rpB1: 'Grow your business',
    rpO1a: 'Your money would need to earn about', rpO1b: 'a year.',
    rpO2a: 'Saving', rpO2b: 'in the first year, rising with inflation, builds about', rpO2c: 'by age',
    rpO3a: 'Working until age', rpO3b: 'lets your money last through age',
    rpO4a: 'You could afford about', rpO4b: 'a year at retirement, about', rpO4c: 'in today’s dollars.',
    rpB1a: 'Your business would need to grow about', rpB1b: 'a year until you sell it at retirement, for a sale value of about',
    rpNone: 'No solution was found for this option with these assumptions.',
    rpNoGoal: 'Set a retirement income goal on the assumptions screen to see these options.',
    pvLbl: 'PV', fvLbl: 'FV', colaOn: 'COLA on', colaOff: 'COLA off', yes: 'Yes', no: 'No',
    fqTitle: 'The Four Questions', fqIntro: 'When the plan you have today falls short, four levers change the outcome: earn more on your money, work longer, spend less, or save more. Each question shows what one lever would have to do on its own.',
    fqDetail: 'Your assumptions in detail', fqRates: 'Rates', fqLists: 'Sources of income and savings',
    fq1: 'Question 1: What return would you need?', fq2: 'Question 2: How long would you need to work?', fq3: 'Question 3: How much less would you need to spend?', fq4: 'Question 4: How much more would you need to save?',
    fq1a: 'You would need to earn', fq1b: 'a year. That is', fq1c: 'percentage points above your assumption, a', fq1d: 'higher return, which usually means taking on more risk.',
    fq2a: 'You would need to work until age', fq2b: 'That is', fq2c: 'more years of work, leaving about', fq2d: 'years of retirement through your life expectancy.',
    fq3a: 'Your retirement lifestyle would need to start at', fq3b: 'a year, a cut of about', fq3c: 'from your goal.',
    fq4a: 'You would need to save', fq4b: 'a year to start, which is', fq4c: 'more than you save today.',
    fqCap: 'Columns: the balance that keeps your lifestyle to life expectancy. Navy line: your present plan. Gold line: this option.',
    fqSum: 'Summing up',
    fqPhil: 'We believe a plan should give you protection and peace of mind first, and growth second. Every number here is a starting point for a conversation about what matters most: your security, your freedom to choose, and the legacy you want to create. Our role is to help you see the whole picture and choose your path with confidence.',
    disc: 'Hypothetical illustration using constant rates of return and a single flat tax rate. It is not a guarantee or a projection of any specific product, and actual results will vary.'
  });
  const LEVER_KEY = { ror: 'lvROR', save: 'lvSave', work: 'lvWork', spend: 'lvSpend', infl: 'lvInfl', biz: 'lvBiz' };
  const yesNo = (ctx, v) => ctx.text(v ? 'yes' : 'no');
  /** worksheet data for the projections and source lists (shared by rron4 and rron4b) */
  function rronSheet(ctx, E, kind, biz) {
    const c = E.c;
    const proj = (arr, rev) => ({
      heading: ctx.t(rev ? 'gRevised' : 'gPresent'), size: 'full', filter: biz ? false : 'age',
      columns: [
        { field: 'age', header: ctx.t('wAge'), type: 'age' }, { field: 'cur', header: ctx.t('wCur'), type: 'money' }, { field: 'earn', header: ctx.t('wEarn'), type: 'money' },
        { field: 'con', header: ctx.t('wContrib'), type: 'money' }, { field: 'fa', header: ctx.t('wFA'), type: 'money' }, { field: 'fe', header: ctx.t('wFE'), type: 'money' },
        { field: 'req', header: ctx.t('wReq'), type: 'money' }, { field: 'db', header: ctx.t('wDB'), type: 'money' }, { field: 'reqa', header: ctx.t('wReqAft'), type: 'money' },
        { field: 'act', header: ctx.t('wAct'), type: 'money' }, { field: 'boy', header: ctx.t('wBoy'), type: 'money' }, { field: 'gr', header: ctx.t('wGrowth'), type: 'money' },
        { field: 'eoy', header: ctx.t('wEoy'), type: 'money' }, { field: 'ld', header: ctx.t('wLD'), type: 'money' }, { field: 'tax', header: ctx.t('wTax'), type: 'money' },
        { field: 'yr', header: ctx.t('wYears'), type: 'int' }
      ],
      rows: arr.map((r) => ({ age: r.Age, cur: r.StartSavings, earn: r.Earned, con: r.Contrib, fa: r.FutAss, fe: r.FutExp, req: r.ReqLS, db: r.SumDB, reqa: r.ReqLSAft, act: r.ActLS, boy: r.BalBeg, gr: r.AnnGrowth, eoy: r.BalanceEOY + r.PotBV, ld: r.LSPlusDB, tax: r.TaxesPaid, yr: r.YrRev })),
      assumptions: biz ? undefined : [
        { label: ctx.t('aAge'), value: String(c.A0) }, { label: ctx.t('aRA'), value: String(rev ? E.rev.RA : c.RA) },
        { label: ctx.t('aInc'), value: fmt.money(c.INC) }, { label: ctx.t('aRID'), value: fmt.money(rev ? E.rev.LS / Math.pow(1 + c.i, Math.max(c.RA - c.A0, 0)) : c.RID) + ' ' + ctx.text(rev || c.isPV ? 'pvLbl' : 'fvLbl') },
        { label: ctx.t('aRA2'), value: fmt.pct(rev ? E.rev.A : c.rA) }, { label: ctx.t('aRD'), value: fmt.pct(rev ? E.rev.D : c.rD) },
        { label: ctx.t('aInfl'), value: fmt.pct(rev ? E.rev.I : c.i) }, { label: ctx.t('aLE'), value: String(c.LE) },
        { label: ctx.t('aAcc'), value: fmt.money(c.ACC) }, { label: ctx.t('aSave'), value: fmt.money(rev ? E.rev.X : c.AS) }, { label: ctx.t('aLeg'), value: fmt.money(c.LEG) }
      ]
    });
    if (kind === 'present') return proj(E.present, false);
    if (kind === 'revised') return proj(E.revised, true);
    if (kind === 'summary') {
      return {
        heading: ctx.t('chSumm'), size: 'medium', filter: biz ? false : 'age',
        columns: [{ field: 'pb', header: ctx.t('sPB'), type: 'money' }, { field: 'pl', header: ctx.t('sPL'), type: 'money' }, { field: 'age', header: ctx.t('wAge'), type: 'age' }, { field: 'rb', header: ctx.t('sRB'), type: 'money' }, { field: 'rl', header: ctx.t('sRL'), type: 'money' }],
        rows: E.summary.map((s) => ({ pb: s.PresentBalance, pl: s.PresentLifestyle, age: s.Age, rb: s.RevisedBalance, rl: s.RevisedLifestyle }))
      };
    }
    const L = c.lists, tx = (v) => ctx.text('o.tax.' + Math.max(0, OPTS.tax.indexOf(v))), rk = (v) => ctx.text('o.risk.' + Math.max(0, OPTS.risk.indexOf(v))), yn = (v) => ctx.text('o.yn.' + Math.max(0, OPTS.yn.indexOf(v)));
    const off = { filter: false };
    if (kind === 'inc') return Object.assign({ heading: ctx.t('chInc'), size: 'small', columns: [{ field: 'd', header: ctx.t('cDesc'), type: 'text' }, { field: 'a', header: ctx.t('cAmount'), type: 'money' }], rows: L.income.map((r) => ({ d: r.description, a: num(r.amount) })) }, off);
    if (kind === 'acc') return Object.assign({ heading: ctx.t('chAcc'), size: 'medium', columns: [{ field: 'd', header: ctx.t('cAccount'), type: 'text' }, { field: 'a', header: ctx.t('cBalance'), type: 'money' }, { field: 't', header: ctx.t('cTaxation'), type: 'text' }, { field: 'r', header: ctx.t('cRisk'), type: 'text' }, { field: 'x', header: ctx.t('cAccess'), type: 'text' }], rows: L.acc.map((r) => ({ d: r.account_name, a: num(r.current_balance), t: tx(r.taxation), r: rk(r.risk), x: yn(r.accessible) })) }, off);
    if (kind === 'save') return Object.assign({ heading: ctx.t('chSave'), size: 'medium', columns: [{ field: 'd', header: ctx.t('cDesc'), type: 'text' }, { field: 'a', header: ctx.t('cAmount'), type: 'money' }, { field: 't', header: ctx.t('cTaxation'), type: 'text' }, { field: 'r', header: ctx.t('cRisk'), type: 'text' }, { field: 'x', header: ctx.t('cAccess'), type: 'text' }], rows: L.annual.map((r) => ({ d: r.description, a: num(r.amount), t: tx(r.taxation), r: rk(r.risk), x: yn(r.accessible) })) }, off);
    if (kind === 'db') return Object.assign({ heading: ctx.t('chDB'), size: 'medium', columns: [{ field: 'd', header: ctx.t('cDesc'), type: 'text' }, { field: 'a', header: ctx.t('cAmount'), type: 'money' }, { field: 'c', header: ctx.t('cCola'), type: 'pct' }, { field: 's', header: ctx.t('cStart'), type: 'age' }, { field: 'e', header: ctx.t('cEnd'), type: 'age' }, { field: 't', header: ctx.t('cTaxable'), type: 'pct', dp: 0 }, { field: 'h', header: ctx.t('cHide'), type: 'text' }, { field: 'x', header: ctx.t('cExcl'), type: 'text' }], rows: E.dbList.map((r) => ({ d: r.description, a: num(r.amount), c: num(r.cola), s: num(r.start_age), e: num(r.end_age), t: num(r.taxable), h: yesNo(ctx, r.hide === true), x: yesNo(ctx, r.exclude === true) })) }, off);
    if (kind === 'fa') return Object.assign({ heading: ctx.t('chFA'), size: 'small', columns: [{ field: 'd', header: ctx.t('cDesc'), type: 'text' }, { field: 'a', header: ctx.t('cAmount'), type: 'money' }, { field: 'g', header: ctx.t('cAge'), type: 'age' }, { field: 't', header: ctx.t('cTaxable'), type: 'pct', dp: 0 }], rows: L.fa.map((r) => ({ d: r.description, a: num(r.amount), g: num(r.age), t: num(r.taxable) })) }, off);
    if (kind === 'fe') return Object.assign({ heading: ctx.t('chFE'), size: 'small', columns: [{ field: 'd', header: ctx.t('cDesc'), type: 'text' }, { field: 'a', header: ctx.t('cAmount'), type: 'money' }, { field: 'i', header: ctx.t('cInflate'), type: 'pct' }, { field: 'g', header: ctx.t('cAge'), type: 'age' }, { field: 'y', header: ctx.t('cYears'), type: 'int' }], rows: L.fe.map((r) => ({ d: r.description, a: num(r.amount), i: num(r.inflate), g: num(r.age), y: num(r.years) })) }, off);
    return null;
  }
  /** glass cylinder with a gold fill (fill 0..1) */
  function tankSVG(fill, id) {
    const w = 250, h = 320, x0 = 30, x1 = 220, top = 26, bot = 296, ry = 18;
    const lvl = bot - (bot - top) * Math.max(0, Math.min(1, fill));
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><defs>
        <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#b8972e"/><stop offset=".45" stop-color="#e2cc7e"/><stop offset="1" stop-color="#a8861f"/></linearGradient>
        <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#cbd5e3" stop-opacity=".55"/><stop offset=".4" stop-color="#ffffff" stop-opacity=".15"/><stop offset="1" stop-color="#cbd5e3" stop-opacity=".6"/></linearGradient></defs>
      <ellipse cx="${w / 2}" cy="${bot + 14}" rx="112" ry="10" fill="rgba(13,30,58,.12)"/>
      <path d="M${x0},${top} V${bot} A${(x1 - x0) / 2},${ry} 0 0 0 ${x1},${bot} V${top}" fill="#f4f6fa" stroke="#1d3863" stroke-width="4"/>
      ${fill > 0.002 ? `<path d="M${x0 + 3},${lvl} V${bot} A${(x1 - x0) / 2 - 3},${ry - 2} 0 0 0 ${x1 - 3},${bot} V${lvl} Z" fill="url(#${id}g)"/>
      <ellipse cx="${w / 2}" cy="${lvl}" rx="${(x1 - x0) / 2 - 3}" ry="${ry - 3}" fill="#e9d690" stroke="#b8972e" stroke-width="2"/>` : ''}
      <path d="M${x0},${top} V${bot} A${(x1 - x0) / 2},${ry} 0 0 0 ${x1},${bot} V${top}" fill="url(#${id}s)"/>
      <ellipse cx="${w / 2}" cy="${top}" rx="${(x1 - x0) / 2}" ry="${ry}" fill="#fffdf8" fill-opacity=".85" stroke="#1d3863" stroke-width="4"/>
      <path d="M${x0 + 22},${top + 40} V${bot - 30}" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/></svg>`;
  }
  function renderProjection(ctx, biz) {
    const V = ctx._pj = visit(ctx, () => {
      const E = rronEngine({ business: biz }).init();
      return { E, used: {}, rorMode: 'pts', view: 'grid', pv: false, age: E.c.RA, auto: false, factor: 100, ripA: true, ripB: true };
    });
    const levers = biz ? ['ror', 'save', 'work', 'spend', 'biz'] : ['ror', 'save', 'work', 'spend', 'infl'];
    const hasPEM = !biz;
    ctx.el.innerHTML = `
      <div class="b13-pj-note ror" data-rorn hidden></div>
      <div class="b13-pj-note" data-lsn style="left:976px" hidden></div>
      <div class="b13-pj-levers">${levers.map((k) => `<div class="b13-pj-lev"><div class="val" data-val="${k}"></div><button type="button" class="b13-pj-lb" data-lev="${k}">${ctx.t(LEVER_KEY[k])}</button></div>`).join('')}</div>
      <div class="b13-pj-main">
        <div class="b13-card b13-pj-grid" data-view="grid">
          <div class="b13-pj-scroll"><table class="b13-pj-t"><colgroup><col style="width:22.4%"><col style="width:22.4%"><col style="width:10.4%"><col style="width:22.4%"><col style="width:22.4%"></colgroup>
            <thead>
              <tr><th colspan="2" class="g1">${ctx.t('gPresent')}</th><th class="g0"></th><th colspan="2" class="g1">${ctx.t('gRevised')}</th></tr>
              <tr><th class="s">${ctx.t('gBal')}</th><th class="s">${ctx.t('gLife')}</th><th class="s ag">${ctx.t('gAge')}</th><th class="s">${ctx.t('gBal')}</th><th class="s lnk" data-pvh>${ctx.t('gLife', { attrs: 'data-m="fv"' })}${ctx.t('gLifePV', { attrs: 'data-m="pv" hidden' })}</th></tr>
            </thead><tbody></tbody></table></div>
        </div>
        <div data-view="tank" hidden>
          <div class="b13-card b13-tint b13-pj-tank" style="left:40px" data-tank="p"></div>
          <div class="b13-card b13-tint b13-pj-tank" style="left:820px" data-tank="r"></div>
        </div>
        ${hasPEM ? `<div data-view="pem" hidden>
          <div class="b13-pj-pem" style="left:0" data-pem="a"><div class="b13-pj-pemh">${ctx.t('gPresent')}</div><div class="b13-abs" data-host style="inset:40px 26px 8px 26px"></div></div>
          <div class="b13-pj-div"></div>
          <div class="b13-pj-pem" style="left:810px" data-pem="b"><div class="b13-pj-pemh">${ctx.t('gRevised')}</div><div class="b13-abs" data-host style="inset:40px 26px 8px 26px"></div></div>
        </div>` : ''}
      </div>
      <div class="b13-pj-bot">
        <button type="button" class="st-pill b13-ghost" data-db>${ctx.t('btnDB')}</button>
        ${hasPEM ? `<div class="st-seg" role="radiogroup">${[['grid', 'vGrid'], ['tank', 'vTank'], ['pem', 'vPEM']].map(([v, k]) => `<button type="button" role="radio" class="st-seg-b" data-vw="${v}" aria-checked="false">${ctx.t(k)}</button>`).join('')}</div>`
          : `<button type="button" class="st-pill" data-vt>${ctx.t('toTank', { attrs: 'data-m="grid"' })}${ctx.t('toGrid', { attrs: 'data-m="tank" hidden' })}</button>`}
        <button type="button" class="st-pill b13-ghost" data-reset>${ctx.t('btnReset')}</button>
        ${hasPEM ? `<div class="b13-pj-pc" data-pc hidden>
          <button type="button" class="b13-chip" data-ag="first" aria-label="First">${ICON.chevLL}</button>
          <button type="button" class="b13-chip" data-ag="-1" aria-label="Back">${ICON.chevL}</button>
          <input class="b13-in" data-agein inputmode="numeric">
          <button type="button" class="b13-chip" data-ag="1" aria-label="Forward">${ICON.chevR}</button>
          <button type="button" class="b13-chip" data-ag="last" aria-label="Last">${ICON.chevRR}</button>
          ${checkBox('data-auto', V.auto, ctx.t('pemStep'))}
          <span class="b13-lb">${ctx.t('pemScale')}</span><input type="range" min="1" max="200" step="1" data-scale value="${V.factor}">
        </div>` : ''}
        <span class="sp"></span>
        <button type="button" class="b13-pj-house" data-house hidden>${ICON.house}<span class="no" data-no hidden>${ICON.no}</span></button>
        <button type="button" class="b13-pj-docs" data-docs aria-label="${esc(ctx.text('chTitle'))}">${ICON.print}</button>
      </div>
      <p class="st-disclaimer b13-pj-disc">${ctx.t('disc')}</p>`;
    // header styling (inline so it stays with the table)
    ctx.$$('.b13-pj-t thead th').forEach((th) => {
      th.style.position = 'sticky'; th.style.zIndex = 2;
      if (th.classList.contains('g1')) Object.assign(th.style, { top: '0', background: '#0d1e3a', color: '#f7f5f1', font: '600 27px/1.1 "Cormorant Garamond", Georgia, serif', padding: '12px', textAlign: 'center', borderRadius: '12px 12px 0 0' });
      if (th.classList.contains('g0')) Object.assign(th.style, { top: '0', background: '#fffdf8' });
      if (th.classList.contains('s')) Object.assign(th.style, { top: '50px', background: '#1d3863', color: '#e3e8f0', font: '700 12.5px/1.25 "DM Sans", sans-serif', letterSpacing: '.12em', textTransform: 'uppercase', padding: '10px 18px', textAlign: 'right' });
      if (th.classList.contains('ag')) Object.assign(th.style, { background: '#8a6e22', color: '#fffdf8', textAlign: 'center' });
      if (th.classList.contains('lnk')) Object.assign(th.style, { cursor: 'pointer', textDecoration: 'underline dotted', textUnderlineOffset: '3px' });
    });
    const scroller = ctx.$('.b13-pj-scroll');
    scroller.style.height = '576px'; scroller.style.margin = '14px'; scroller.style.borderRadius = '10px';
    const fixHead = () => { const h1 = ctx.$('.b13-pj-t thead tr'); if (h1 && h1.offsetHeight) ctx.$$('.b13-pj-t thead th.s').forEach((th) => { th.style.top = h1.offsetHeight + 'px'; }); };

    /* ---------- drawing ---------- */
    const E = () => V.E;
    const pvFactor = (s, i) => Math.pow(1 + i, s);
    const drawLevers = () => {
      const e = E(), r = e.rev, c = e.c;
      const set = (k, html) => { const n = ctx.$(`[data-val="${k}"]`); if (n) n.innerHTML = html; };
      set('ror', `<span class="num">${fmt.pct(r.A)} / ${fmt.pct(r.D)}</span>`);
      set('save', `<span><span class="num">${fmt.money(r.X / 12)}</span>${ctx.t('perMo')}</span><small><span class="num">${fmt.money(r.X)}</span>${ctx.t('perYr')}</small>`);
      set('work', `<span>${ctx.t('agePre')} <span class="num">${r.RA}</span></span>`);
      set('spend', `<span><span class="num">${fmt.money(r.LS / 12)}</span>${ctx.t('perMo')}</span><small><span class="num">${fmt.money(r.LS)}</span>${ctx.t('perYr')}</small>`);
      set('infl', `<span class="num">${fmt.pct(r.I)}</span>`);
      set('biz', `<span><span class="num">${fmt.pct(r.B)}</span>${ctx.t('perYr')}</span><small class="num">${fmt.money(e.saleValue())}</small>`);
      ctx.$$('[data-lev]').forEach((b) => b.classList.toggle('used', !!V.used[b.dataset.lev]));
      // return notice
      const rn = ctx.$('[data-rorn]');
      rn.hidden = !V.used.ror;
      if (V.used.ror) {
        const pts = e.rorPoints(), pct = e.rorPercent();
        if (V.rorMode === 'pct' && pct != null) rn.innerHTML = `${ctx.t('rorPctA')} <span class="num">${nf(pct, 0)}%</span> ${ctx.t('rorPctB')}`;
        else { const p2 = Math.round(pts * 100) / 100; rn.innerHTML = `${ctx.t('rorPtsA')} <span class="num">${nf(p2, Math.abs(p2 - Math.round(p2)) > 1e-9 ? 2 : 0)}</span> ${ctx.t('rorPtsB')}`; }
      }
      // lifestyle notice
      const ln = ctx.$('[data-lsn]');
      ln.hidden = !V.used.spend;
      if (V.used.spend) {
        const rowP = e.ybyP[e.caseRow()];
        const first = V.pv ? rowP.PVLifestyle : rowP.LifestyleTarget;
        let t;
        if (biz) t = rowP.LifestyleTarget;
        else t = V.used.work ? e.ybyP[e.revRow()].RequiredLifestyle : rowP.RequiredLifestyle;
        const W = r.LS;
        if ((biz ? t : first) <= 0 || !(t > 0)) ln.innerHTML = '';
        else if (t >= W) ln.innerHTML = `<span class="num">${nf(100 * (1 - W / t), 2)}%</span> ${ctx.t('lsRed')}`;
        else ln.innerHTML = `<span class="num">${nf(100 * (W / t - 1), 2)}%</span> ${ctx.t('lsInc')}`;
      }
    };
    const drawGrid = () => {
      const e = E(), c = e.c, ra = c.RA;
      const tb = ctx.$('.b13-pj-t tbody');
      ctx.$$('[data-pvh] [data-m]').forEach((n) => { n.hidden = (n.dataset.m === 'pv') !== V.pv; });
      tb.innerHTML = e.summary.map((s, i) => {
        const hb = s.Age === ra - 1 ? ' hl' : '', hl = s.Age === ra ? ' hl' : '', ha = s.Age === e.lastsP ? ' hl' : '';
        return `<tr class="${s.Age === e.rev.RA ? 'rret' : ''}"><td class="${hb}">${fmt.money(s.PresentBalance)}</td><td class="${hl}">${fmt.money(s.PresentLifestyle)}</td><td class="age${ha}">${s.Age}</td><td class="rv">${fmt.money(s.RevisedBalance)}</td><td class="rv">${fmt.money(V.pv ? s.RevisedPVLifestyle : s.RevisedLifestyle)}</td></tr>`;
      }).join('');
    };
    const scrollGrid = () => {
      const e = E(), r = Math.max(0, e.rev.RA - e.c.A0 - 2);
      const tr = ctx.$(`.b13-pj-t tbody tr:nth-child(${r + 1})`);
      if (tr) scroller.scrollTop = tr.offsetTop - ctx.$('.b13-pj-t thead').offsetHeight;
    };
    const tankCard = (rev) => {
      const e = E(), c = e.c, y = rev ? e.ybyR : e.ybyP, row = rev ? e.revRow() : e.caseRow();
      const bal = y[row].TankBalanceBOY, fill = e.TRS > 0 ? Math.min(bal / e.TRS, 1) : 0;
      const inc = V.pv ? y[row].PVLifestyle : y[row].LifestyleTarget;
      const startAge = rev ? e.rev.RA : c.RA;
      const lasts = rev ? e.lastsR : e.lastsP;
      const pta = Math.max(c.PTAcase, c.RA + 1);
      const ages = []; for (let a = c.RA; a <= pta; a++) ages.push(a);
      const BW = 640, BH = 60, sw = BW / Math.max(ages.length, 1);
      const sliceFill = (a) => { const s = a - c.A0; if (s < 0 || s >= y.length) return 0; return Math.max(0, Math.min(1, y[s].SlicePercentFill)); };
      let g = '';
      ages.forEach((a, i) => { const f = sliceFill(a), h = (BH - 6) * f; g += `<rect class="sl" data-a="${a}" x="${(i * sw).toFixed(2)}" y="3" width="${Math.max(sw - 1, 0.6).toFixed(2)}" height="${BH - 6}" fill="transparent"/>${f > 0 ? `<rect x="${(i * sw).toFixed(2)}" y="${(BH - 3 - h).toFixed(2)}" width="${Math.max(sw - 1, 0.6).toFixed(2)}" height="${h.toFixed(2)}" fill="#1d3863" opacity=".85" pointer-events="none"/>` : ''}`; });
      const sepAt = (a) => { const i = ages.indexOf(a); return i < 0 ? null : i * sw; };
      const runOut = lasts > 0 ? lasts + 1 : null;
      const xs = runOut == null ? null : sepAt(runOut);
      const xr = rev && e.rev.RA > c.RA ? sepAt(e.rev.RA) : null;
      const axis = [[0, c.RA, 'start']];
      if (xs != null && runOut <= pta) axis.push([xs, runOut, 'middle']);
      if (xr != null) axis.push([xr, e.rev.RA, 'middle']);
      axis.push([BW, pta, 'end']);
      const bar = `<svg viewBox="-4 0 ${BW + 40} ${BH + 34}" width="${BW + 44}" height="${BH + 34}" data-bar>
          <defs><linearGradient id="b13fb${rev ? 'r' : 'p'}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1f6"/><stop offset="1" stop-color="#cbd5e3"/></linearGradient></defs>
          <rect x="0" y="3" width="${BW}" height="${BH - 6}" rx="6" fill="url(#b13fb${rev ? 'r' : 'p'})"/>
          ${g}
          <path d="M${BW},3 h18 a${(BH - 6) / 2},${(BH - 6) / 2} 0 0 1 0,${BH - 6} h-18 z" fill="#0d1e3a"/>
          ${xs != null && runOut <= pta ? `<rect x="${(xs - 2).toFixed(1)}" y="0" width="4" height="${BH}" fill="#b8972e"/>` : ''}
          ${xr != null ? `<rect x="${(xr - 1.5).toFixed(1)}" y="0" width="3" height="${BH}" fill="#0d1e3a"/>` : ''}
          ${axis.map(([x, a, anc]) => `<text x="${x.toFixed(1)}" y="${BH + 26}" text-anchor="${anc}" font-family="DM Sans, sans-serif" font-weight="700" font-size="18" fill="#0d1e3a">${a}</text>`).join('')}
        </svg>`;
      return `<h3 class="st-h3">${ctx.t(rev ? 'gRevised' : 'gPresent')}</h3>
        <div class="b13-pj-tk">
          <div><div class="b13-pj-tkv">${tankSVG(fill, 'b13tk' + (rev ? 'r' : 'p'))}<div class="lab"><b class="num">${fmt.money(bal)}</b>${ctx.t('tkBal', { tag: 'span' })}</div></div>
            <div class="b13-pj-tkc"><span class="num">${nf(fill * 100, 2)}%</span> ${ctx.t('tkGoalA')} <span class="num">${fmt.money(e.res.RequiredBalanceAtRetirement)}</span> ${ctx.t('tkGoalB')}</div></div>
          <div class="b13-pj-inc">
            <div class="a">${rev ? `<button type="button" class="b13-pvfv" data-pvt>${ctx.t(V.pv ? 'pvLbl' : 'fvLbl')}</button>` : ''}<span class="num">${fmt.money(inc)}</span></div>
            ${ctx.t('tkInc', { tag: 'div', cls: 'k' })}
            <div class="r">${ctx.t('tkBegins')} <span class="num">${startAge}</span></div>
            <div class="r">${ctx.t('tkEnds')} <span class="num">${lasts > 0 ? lasts : startAge}</span></div>
          </div>
        </div>
        <div class="b13-pj-fund">${ctx.t('tkFund', { tag: 'div', cls: 'k' })}${bar}<div class="b13-pj-ro" data-ro>${ctx.t('tkHint', { cls: 'b13-note' })}</div></div>`;
    };
    const drawTanks = () => {
      ['p', 'r'].forEach((k) => {
        const host = ctx.$(`[data-tank="${k}"]`), rev = k === 'r';
        host.innerHTML = tankCard(rev);
        const e = E(), y = rev ? e.ybyR : e.ybyP, ro = host.querySelector('[data-ro]');
        host.querySelectorAll('.sl').forEach((sl) => sl.addEventListener('mouseenter', () => {
          const a = +sl.dataset.a, s = a - e.c.A0, r = y[s]; if (!r) return;
          ro.innerHTML = `${ctx.t('tipAge')} <b class="num">${a}</b> &middot; ${ctx.t('tipNeed')} <b class="num">${fmt.money(r.LifestyleTarget, { dp: 2 })}</b> &middot; ${ctx.t('tipAct')} <b class="num">${fmt.money(r.Lifestyle, { dp: 2 })}</b> &middot; ${ctx.t('tipPV')} <b class="num">${fmt.money(r.PVLifestyle, { dp: 2 })}</b>`;
        }));
        const pvt = host.querySelector('[data-pvt]'); if (pvt) pvt.addEventListener('click', () => { if (!editing()) togglePV(); });
      });
    };
    /* ---------- the two money models (PEM view) ---------- */
    const pemData = (rev) => {
      const e = E(), c = e.c, y = rev ? e.ybyR : e.ybyP, s = Math.min(Math.max(V.age - c.A0, 0), e.N - 1), r = y[s];
      const lip = r.LifetimeIncomePotential, goal = e.res.RequiredBalanceAtRetirement;
      const riskFill = e.TRS > 0 ? 100 * Math.min(r.RiskTankBalance / e.TRS * V.factor / 100, 1) : 0;
      const safeRef = rev ? e.TRS : goal;
      const safeFill = safeRef > 0 ? 100 * Math.min(r.SafeTankBalance / safeRef * V.factor / 100, 1) : 0;
      const fillTip = (f) => `${nf(f, 1)}% ${ctx.text('tkGoalA')} ${fmt.money(goal)}\n${ctx.text('rgoal')}`;
      return {
        TaxesPaid: r.TaxesPaidThisYear, LSRegulatorValue: r.LSRegulator, DiverterValveHandleAngle: r.DiverterValve, ExpensesPaid: r.ExpensesPaidThisYear,
        Lifestyle: V.pv ? r.PVLifestyle : r.Lifestyle, Outflow: V.pv ? r.PVOutflow : r.Outflow, RemainingIncome: r.RemainingIncome,
        RiskTankBalance: r.RiskTankBalance, SafeTankBalance: r.SafeTankBalance, Contribution: r.FutureLSContributions, Withdrawal: r.WithdrawalsThisYear,
        TDContributions: r.TDContributionsThisYear, GrossIncome: r.IncomeThisYear + r.TDContributionsThisYear, Inflow: r.IncomeThisYear,
        IncomeValue: lip > 0 ? 100 * Math.min((r.IncomeThisYear + r.TDContributionsThisYear) / lip, 1) : 0,
        InvestmentRedValue: riskFill, InvestmentRedTitle: fillTip(riskFill),
        InvestmentTaxValue: r.RiskTankBalance > 0 ? 100 - 100 * r.RiskTankPotTaxes / r.RiskTankBalance : 0, InvestmentTaxTitle: `${fmt.money(r.RiskTankPotTaxes)} ${ctx.text('potTax')}`,
        SavingsRedValue: safeFill, SavingsRedTitle: fillTip(safeFill),
        SavingsTaxValue: r.SafeTankBalance > 0 ? 100 * r.SafeTankPotTaxes / r.SafeTankBalance : 0, SavingsTaxTitle: `${fmt.money(r.SafeTankPotTaxes)} ${ctx.text('potTax')}`,
        IsPVLifestyle: V.pv
      };
    };
    const mountPEMs = () => {
      const PM = LIB('pem');
      ['a', 'b'].forEach((k) => {
        const host = ctx.$(`[data-pem="${k}"] [data-host]`);
        if (!PM || !PM.mount) { host.innerHTML = `<div class="b13-wait" style="height:100%"><div><div class="b13-spin"></div>${ctx.t('pemWait')}</div></div>`; return; }
        if (ctx['_pem' + k]) return;
        ctx['_pem' + k] = PM.mount(ctx, host, {
          IsShowText: false, IsShowScenario: false, LinksActive: false, IsRIPMode: true, IsShowRIP: k === 'a' ? V.ripA : V.ripB,
          IsShowLifestyleExpenses: false, IsShowBF: false, IsShowHouse: false, IsInvestments: true, sliders: false, chevrons: false, align: 'center',
          on: { ripclick: () => { const key = k === 'a' ? 'ripA' : 'ripB'; V[key] = !V[key]; ctx['_pem' + k].set({ IsShowRIP: V[key] }); }, pvclick: () => togglePV() }
        });
      });
    };
    const drawPEM = (ms) => {
      const PM = LIB('pem'); if (!PM || !ctx._pema) return;
      ctx._pema.set(pemData(false), { ms: ms == null ? 400 : ms });
      ctx._pemb.set(pemData(true), { ms: ms == null ? 400 : ms });
    };
    const drawPC = () => {
      const inp = ctx.$('[data-agein]'); if (inp && document.activeElement !== inp) inp.value = V.age;
      const ch = ctx.$('[data-auto]'); if (ch) ch.setAttribute('aria-checked', V.auto);
    };
    const drawAll = () => {
      drawLevers();
      const e = E();
      const hb = ctx.$('[data-house]'); hb.hidden = !e.hasRM; ctx.$('[data-no]').hidden = !e.rmExcluded;
      if (V.view === 'grid') { drawGrid(); }
      if (V.view === 'tank') drawTanks();
      if (V.view === 'pem') { mountPEMs(); drawPEM(); drawPC(); }
      if (EFA.numify) EFA.numify(ctx.el);
      if (editing() && EFA.edit.arm) EFA.edit.arm(ctx.el);
    };
    const setView = (v) => {
      V.view = v;
      ctx.$$('[data-view]').forEach((n) => { n.hidden = n.dataset.view !== v; });
      ctx.$$('[data-vw]').forEach((b) => b.setAttribute('aria-checked', b.dataset.vw === v));
      ctx.$$('[data-vt] [data-m]').forEach((n) => { n.hidden = n.dataset.m !== v; });
      const pc = ctx.$('[data-pc]'); if (pc) pc.hidden = v !== 'pem';
      if (v !== 'pem') stopAuto();
      drawAll();
      if (v === 'grid') ctx.timeout(scrollGrid, biz ? 100 : 30);
    };
    const togglePV = () => { V.pv = !V.pv; drawAll(); };
    const afterLever = () => { drawAll(); if (V.view === 'grid') ctx.timeout(scrollGrid, 30); };
    const result = (r) => { if (r && !r.ok) ctx.toast(ctx.text(r.msg === 'noGoal' ? 'msgNoGoal' : 'msgNoSol')); };
    /* ---------- age stepper and auto-step ---------- */
    const setAge = (a) => { const e = E(); V.age = Math.max(e.c.A0, Math.min(100, Math.round(a))); drawPC(); drawPEM(); };
    const stopAuto = () => { V.auto = false; if (V.timer) { clearInterval(V.timer); V.timer = null; } drawPC(); };
    const startAuto = () => {
      V.auto = true; drawPC();
      if (V.timer) clearInterval(V.timer);
      V.timer = setInterval(() => { if (!ctx.el.isConnected) { stopAuto(); return; } if (V.age >= 100) { stopAuto(); return; } setAge(V.age + 1); }, 500);
    };
    ctx._stopAuto = stopAuto;
    /* ---------- lever dialogs ---------- */
    const openLever = (k) => {
      const e = E(), c = e.c, r = e.rev;
      const T = { ror: 'dROR', save: 'dSave', work: 'dWork', spend: 'dSpend', infl: 'dInfl', biz: 'dBiz' }[k];
      const opt = { ror: ['oSpecROR', 'oCalcROR'], save: ['oSpecSave', 'oCalcSave'], work: ['oSpecWork', 'oCalcWork'], spend: ['oSpecSpend', 'oCalcSpend'], biz: ['oSpecBiz', 'oCalcBiz'] }[k];
      const st = { opt: null, val: 0, last: Math.round(num(cget('case_file_project_to_age'))), uni: !!cget('rron_unify_ror') };
      const ov = ctx.overlay({ title: ctx.t(T), cls: 'b13-ov-sm', html: '<div class="b13-lv"></div>' });
      const body = ov.querySelector('.b13-lv');
      const seed = () => {
        if (k === 'ror') st.val = r.A; if (k === 'save') st.val = r.X; if (k === 'work') st.val = r.RA;
        if (k === 'spend') st.val = r.LS / Math.pow(1 + c.i, Math.max(c.RA - c.A0, 0));
        if (k === 'biz') st.val = c.rB; if (k === 'infl') st.val = r.I;
        st.last = Math.round(num(cget('case_file_project_to_age')));
      };
      const type = { ror: 'pct', save: 'money', work: 'int', spend: 'money', biz: 'pct', infl: 'pct' }[k];
      const draw = () => {
        const spec = st.opt === 0 || k === 'infl', calcOpt = st.opt === 1;
        body.innerHTML = `
          ${k === 'infl' ? '' : `<div class="opts">${opt.map((o, i) => `<button type="button" class="opt" data-o="${i}" aria-pressed="${st.opt === i}">${ctx.t(o)}</button>`).join('')}</div>`}
          ${spec ? `<p class="pr">${ctx.t({ ror: 'prROR', save: 'prSave', work: 'prWork', spend: 'prSpend', biz: 'prBiz', infl: 'prInfl' }[k])}${k === 'ror' ? ' ' + ctx.t('prUni') : ''}</p>
            <div class="row"><input class="b13-in" data-v>${k === 'ror' ? checkBox('data-uni', st.uni, ctx.t('unify')) : ''}${k === 'infl' ? `<span data-infl></span>` : ''}</div>` : ''}
          ${calcOpt ? `<p class="pr">${ctx.t('prLast')}${k === 'ror' ? ' ' + ctx.t('prUni') : ''}</p>
            <div class="row"><input class="b13-in" data-l>${k === 'ror' ? checkBox('data-uni', st.uni, ctx.t('unify')) : ''}</div>` : ''}
          ${spec || calcOpt ? `<div class="foot" style="display:flex;justify-content:flex-end"><button type="button" class="st-pill b13-gold" data-go style="min-width:200px;min-height:52px">${ctx.t('calc')}</button></div>` : ''}`;
        body.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', () => { if (editing()) return; st.opt = +b.dataset.o; seed(); draw(); }));
        const vin = body.querySelector('[data-v]'); if (vin) bindNum(vin, { type, min: type === 'money' ? 0 : undefined, get: () => st.val, set: (x) => { st.val = x; }, fmt: fmtBy(type) });
        const lin = body.querySelector('[data-l]'); if (lin) bindNum(lin, { type: 'int', min: c.A0, max: 120, get: () => st.last, set: (x) => { st.last = x; }, fmt: fmtBy('int') });
        const u = body.querySelector('[data-uni]'); if (u) u.addEventListener('click', () => { if (editing()) return; st.uni = !st.uni; u.setAttribute('aria-checked', st.uni); });
        const inf = body.querySelector('[data-infl]');
        if (inf) { const INF = LIB('inflation'); inf.innerHTML = INF && INF.link ? INF.link(ctx, { look: 'text', label: ctx.t('histInfl'), onUse: (x) => { st.val = num(x); if (vin) vin.value = pctTxt(st.val); } }) : ''; }
        const go = body.querySelector('[data-go]');
        if (go) go.addEventListener('click', () => {
          if (editing()) return;
          if (document.activeElement && ov.contains(document.activeElement)) document.activeElement.blur();
          let res;
          const isCalc = st.opt === 1;
          if (k === 'ror') cset('rron_unify_ror', st.uni);
          if (isCalc || (k === 'biz' && isCalc)) cset('case_file_project_to_age', st.last);
          if (k === 'ror') res = isCalc ? e.calcROR(st.last, st.uni) : e.specifyROR(st.val, st.uni);
          if (k === 'save') res = isCalc ? e.calcSave(st.last) : e.specifySave(st.val);
          if (k === 'work') res = isCalc ? e.calcWork(st.last) : e.specifyWork(st.val);
          if (k === 'spend') res = isCalc ? e.calcSpend(st.last) : e.specifySpend(st.val);
          if (k === 'biz') res = isCalc ? e.calcBusiness(st.last) : e.specifyBusiness(st.val);
          if (k === 'infl') res = e.setInflation(st.val);
          e.c.PTAcase = Math.round(num(cget('case_file_project_to_age')));
          if (!(res && res.msg === 'noGoal')) V.used[k] = true;
          ov.close(); afterLever(); result(res);
        });
        if (EFA.numify) EFA.numify(body);
        if (editing() && EFA.edit.arm) EFA.edit.arm(ov);
      };
      if (k === 'infl') seed();
      draw();
    };
    /* ---------- documentation chooser, worksheets and reports ---------- */
    const openSheet = (kind, chooser) => {
      const W = LIB('worksheet'); if (!W || !W.open) { notReady(ctx); return; }
      const data = rronSheet(ctx, E(), kind, biz); if (!data) return;
      if (chooser && !biz) chooser.close();
      W.open(ctx, data);
    };
    const openChooser = () => {
      const lk = (k, kind) => `<button type="button" class="lk" data-sh="${kind}">${ctx.t(k)}</button>`;
      const ov = ctx.overlay({
        title: ctx.t('chTitle'), cls: 'b13-ov-md',
        html: `<div class="b13-ch">
          <div><h4>${ctx.t('chReport')}</h4>${lk('chSummary', 'rep:summary')}${biz ? '' : lk('chFour', 'rep:four')}</div>
          <div><h4>${ctx.t('chWs')}</h4><div class="cols">
            <div><h5>${ctx.t('chProj')}</h5>${lk('chPresent', 'present')}${lk('chRevised', 'revised')}${lk('chSumm', 'summary')}</div>
            <div><h5>${ctx.t('chSrc')}</h5>${lk('chInc', 'inc')}${lk('chAcc', 'acc')}${lk('chSave', 'save')}${lk('chDB', 'db')}${lk('chFA', 'fa')}${lk('chFE', 'fe')}</div>
          </div></div></div>`
      });
      ov.querySelectorAll('[data-sh]').forEach((b) => b.addEventListener('click', () => {
        if (editing()) return;
        const kind = b.dataset.sh;
        if (kind.startsWith('rep:')) { ov.close(); openReport(ctx, E(), kind.slice(4), biz); return; }
        openSheet(kind, ov);
      }));
    };
    /* ---------- wiring ---------- */
    ctx.on(ctx.$$('[data-lev]'), 'click', (e, b) => openLever(b.dataset.lev));
    ctx.on(ctx.$('[data-rorn]'), 'click', () => { V.rorMode = V.rorMode === 'pts' ? 'pct' : 'pts'; drawLevers(); if (EFA.numify) EFA.numify(ctx.el); });
    ctx.on(ctx.$('[data-pvh]'), 'click', () => togglePV());
    ctx.on(ctx.$$('[data-vw]'), 'click', (e, b) => setView(b.dataset.vw));
    const vt = ctx.$('[data-vt]'); if (vt) ctx.on(vt, 'click', () => setView(V.view === 'grid' ? 'tank' : 'grid'));
    ctx.on(ctx.$('[data-reset]'), 'click', () => { V.used = {}; V.rorMode = 'pts'; V.E = rronEngine({ business: biz }).init(); V.age = V.E.c.RA; afterLever(); });
    ctx.on(ctx.$('[data-db]'), 'click', () => openListEditor(ctx, 'db', () => { V.used = {}; V.rorMode = 'pts'; V.E = rronEngine({ business: biz }).init(); afterLever(); }));
    ctx.on(ctx.$('[data-house]'), 'click', () => { E().toggleRM(); afterLever(); });
    ctx.on(ctx.$('[data-docs]'), 'click', openChooser);
    ctx.on(ctx.$$('[data-ag]'), 'click', (e, b) => { const v = b.dataset.ag; setAge(v === 'first' ? E().c.A0 : v === 'last' ? 100 : V.age + +v); });
    const agein = ctx.$('[data-agein]');
    if (agein) bindNum(agein, { type: 'int', get: () => V.age, set: (v) => setAge(v), fmt: (v) => String(v) });
    const auto = ctx.$('[data-auto]'); if (auto) ctx.on(auto, 'click', () => (V.auto ? stopAuto() : startAuto()));
    const sc = ctx.$('[data-scale]'); if (sc) sc.addEventListener('input', () => { V.factor = +sc.value; drawPEM(0); });
    setView(V.view);
    fixHead(); ctx.timeout(fixHead, 60);
    if (V.view === 'grid') ctx.timeout(scrollGrid, biz ? 500 : 80);
  }
  /** combined chart for the Four Questions report: ideal balance columns, present line (navy), option line (gold) */
  function fqChart(ideal, present, option, RA, LE) {
    const W = 1000, H = 420, pl = 96, pr = 20, pt = 18, pb = 44;
    const pick = (rows) => rows.filter(([a]) => a <= LE);
    const I = pick(ideal), Pp = pick(present), O = option ? pick(option) : [];
    const ages = I.map(([a]) => a), n = ages.length || 1;
    const raw = Math.max(1, ...I.map(([, v]) => v), ...Pp.map(([, v]) => v), ...O.map(([, v]) => v));
    const p10 = Math.pow(10, Math.floor(Math.log10(raw / 4))), stp = [1, 2, 2.5, 5, 10].map((m) => m * p10).find((x) => x * 4 >= raw) || p10 * 10;
    const mx = stp * 4;
    const X = (i) => pl + (i + 0.5) * (W - pl - pr) / n, Y = (v) => pt + (H - pt - pb) * (1 - Math.max(0, v) / mx), bw = Math.max(2, (W - pl - pr) / n * 0.7);
    let g = '';
    for (let t = 0; t <= 4; t++) { const v = mx * t / 4, y = Y(v); g += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="#d6cfc4"/><text x="${pl - 10}" y="${y + 5}" text-anchor="end" font-family="DM Sans, sans-serif" font-size="14" fill="#667389">${fmt.money(v, { compact: true })}</text>`; }
    I.forEach(([a, v], i) => { g += `<rect x="${X(i) - bw / 2}" y="${Y(v)}" width="${bw}" height="${Math.max(0, H - pb - Y(v))}" fill="${a < RA ? '#8aa3c7' : '#e9d690'}"/>`; });
    const line = (rows, col, w) => { const d = rows.map(([a, v]) => { const i = ages.indexOf(a); return i < 0 ? '' : `${'L'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`; }).join('').replace(/^L/, 'M'); return d ? `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round"/>` : ''; };
    g += line(Pp, '#0d1e3a', 4) + line(O, '#b8972e', 4);
    ages.forEach((a, i) => { if (i % 5 === 0 || i === n - 1) g += `<text x="${X(i)}" y="${H - pb + 24}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="14" fill="#667389">${a}</text>`; });
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" aria-hidden="true">${g}</svg>`;
  }
  /** the Summary of Results and Four Questions reports, shown in-stage */
  function openReport(ctx, E, kind, biz) {
    const c = E.c, F = E.reportFigures();
    const who = EFA.clients && EFA.clients.active && EFA.clients.list[EFA.clients.active] ? EFA.clients.list[EFA.clients.active].name : '';
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const kv = (k, v) => `<div><span>${ctx.t(k)}</span><b class="num">${v}</b></div>`;
    const assume = biz
      ? [['aAge', c.A0], ['aRA', c.RA], ['aLE', c.LE], ['aInc', fmt.money(c.INC)], ['aBL', fmt.money(c.BSL)], ['aBV', fmt.money(c.BV)], ['aOI', fmt.money(c.ACC)], ['aOIC', fmt.money(c.AS)], ['aBG', fmt.pct(c.rB, 3)], ['aRA2', fmt.pct(c.rA, 3)], ['aRD', fmt.pct(c.rD, 3)], ['aInfl', fmt.pct(c.i, 3)], ['aLeg', fmt.money(c.LEG)], ['aRID', fmt.money(c.RID)]]
      : [['aAge', c.A0], ['aRA', c.RA], ['aLE', c.LE], ['aInc', fmt.money(c.INC)], ['aAcc', fmt.money(c.ACC)], ['aSave', fmt.money(c.AS)], ['aRA2', fmt.pct(c.rA, 3)], ['aRD', fmt.pct(c.rD, 3)], ['aInfl', fmt.pct(c.i, 3)], ['aTax', fmt.pct(c.T, 3)], ['aLeg', fmt.money(c.LEG)], ['aRID', fmt.money(c.RID)]];
    const head = (t) => `<div class="cover"><h2>${ctx.t(t)}</h2>${who ? `<div class="who">${ctx.t('rpFor')} <span>${esc(who)}</span></div>` : ''}<div class="cap" style="color:#cbd5e3">${esc(today)}</div></div>`;
    const assumeSec = `<div class="sec"><h3>${ctx.t('rpAssume')}</h3><div class="kv">${assume.map(([k, v]) => kv(k, v)).join('')}</div></div>`;
    const every = `<div class="sec"><h3>${ctx.t('rpEvery')}</h3><ul>
        <li>${ctx.t('rpE1')} <span class="num">${fmt.pct(c.inflS ? c.i : 0, 3)}</span>.</li>
        <li>${ctx.t('rpE2')} <span class="num">${fmt.pct(c.inflW ? c.i : 0, 3)}</span>.</li>
        <li>${ctx.t('rpE3')} <span class="num">${fmt.pct(c.rD, 3)}</span>.</li>
        <li>${ctx.t('rpE4')}</li></ul>
        <p style="font-style:italic">${ctx.t('rpIllus')} <span>${esc(today)}</span>.</p></div>`;
    const none = ctx.t('rpNone', { tag: 'p' });
    const ret = (x) => fmt.pct(x, 3);
    const disc = (EFA.lib && EFA.lib.disclosure) ? EFA.lib.disclosure.line(['hypothetical', 'notAdvice', 'license']) : `<p class="st-disclaimer">${ctx.t('disc')}</p>`;
    let html;
    if (kind === 'summary') {
      const opts = [];
      if (!F.goal) opts.push(`<div class="sec">${ctx.t('rpNoGoal', { tag: 'p' })}</div>`);
      else {
        if (biz && c.BV > 0) opts.push(`<div class="sec"><h3>${ctx.t('rpB1')}</h3>${F.bizOk ? `<p>${ctx.t('rpB1a')} <span class="fig num">${ret(F.biz)}</span> ${ctx.t('rpB1b')} <span class="fig num">${fmt.money(F.bizSale)}</span>.</p>` : none}</div>`);
        opts.push(`<div class="sec"><h3>${ctx.t('rpO1')}</h3>${F.rorOk ? `<p>${ctx.t('rpO1a')} <span class="fig num">${ret(F.ror)}</span> ${ctx.t('rpO1b')}</p>` : none}</div>`);
        opts.push(`<div class="sec"><h3>${ctx.t('rpO2')}</h3>${F.saveOk ? `<p>${ctx.t('rpO2a')} <span class="fig num">${fmt.money(F.save)}</span> ${ctx.t('rpO2b')} <span class="fig num">${fmt.money(F.saveBal)}</span> ${ctx.t('rpO2c')} <span class="num">${c.RA}</span>.</p>` : none}</div>`);
        opts.push(`<div class="sec"><h3>${ctx.t('rpO3')}</h3>${F.workOk ? `<p>${ctx.t('rpO3a')} <span class="fig num">${F.work}</span> ${ctx.t('rpO3b')} <span class="num">${c.LE}</span>.</p>` : none}</div>`);
        opts.push(`<div class="sec"><h3>${ctx.t('rpO4')}</h3>${F.spendOk ? `<p>${ctx.t('rpO4a')} <span class="fig num">${fmt.money(F.spend)}</span> ${ctx.t('rpO4b')} <span class="fig num">${fmt.money(F.spendPV)}</span> ${ctx.t('rpO4c')}</p>` : none}</div>`);
      }
      html = `<div class="b13-rep">${head('rpTitle')}${assumeSec}${every}${F.goal ? ctx.t('rpGoal', { tag: 'p' }) : ''}${opts.join('')}${disc}</div>`;
    } else {
      const ideal = F.saveRows || F.present, LE = c.LE;
      const q = (t, body, rows) => `<div class="sec"><h3>${ctx.t(t)}</h3>${body}${fqChart(ideal, F.present, rows, c.RA, LE)}${ctx.t('fqCap', { tag: 'p', cls: 'cap' })}</div>`;
      const listLines = [];
      c.lists.income.forEach((r) => listLines.push(`<li>${esc(r.description)}: <span class="num">${fmt.money(num(r.amount))}</span></li>`));
      c.lists.acc.forEach((r) => listLines.push(`<li>${esc(r.account_name)}: <span class="num">${fmt.money(num(r.current_balance))}</span> &middot; ${ctx.t('o.tax.' + Math.max(0, OPTS.tax.indexOf(r.taxation)))} &middot; ${ctx.t('o.risk.' + Math.max(0, OPTS.risk.indexOf(r.risk)))}</li>`));
      c.lists.annual.forEach((r) => listLines.push(`<li>${esc(r.description)}: <span class="num">${fmt.money(num(r.amount))}</span>${ctx.t('perYr')} &middot; ${ctx.t('o.tax.' + Math.max(0, OPTS.tax.indexOf(r.taxation)))}</li>`));
      E.dbList.forEach((r) => listLines.push(`<li>${esc(r.description)}: <span class="num">${fmt.money(num(r.amount))}</span>${ctx.t('perYr')} &middot; ${ctx.t('cCola')} <span class="num">${fmt.pct(num(r.cola))}</span> &middot; ${ctx.t('cStart')} <span class="num">${num(r.start_age)}</span> &middot; ${ctx.t('cEnd')} <span class="num">${num(r.end_age)}</span></li>`));
      c.lists.fa.forEach((r) => listLines.push(`<li>${esc(r.description)}: <span class="num">${fmt.money(num(r.amount))}</span> &middot; ${ctx.t('cAge')} <span class="num">${num(r.age)}</span></li>`));
      c.lists.fe.forEach((r) => listLines.push(`<li>${esc(r.description)}: <span class="num">${fmt.money(num(r.amount))}</span> &middot; ${ctx.t('cAge')} <span class="num">${num(r.age)}</span> &middot; ${ctx.t('cYears')} <span class="num">${num(r.years)}</span></li>`));
      const detail = `<div class="sec"><h3>${ctx.t('fqDetail')}</h3><div class="kv">${assume.map(([k, v]) => kv(k, v)).join('')}${kv('lbCL', fmt.money(c.CL))}</div>${listLines.length ? `<h3 style="font-size:22px">${ctx.t('fqLists')}</h3><ul>${listLines.join('')}</ul>` : ''}</div>`;
      let qs = '';
      if (!F.goal) qs = `<div class="sec">${ctx.t('rpNoGoal', { tag: 'p' })}</div>`;
      else {
        qs += q('fq1', F.rorOk ? `<p>${ctx.t('fq1a')} <span class="fig num">${ret(F.ror)}</span> ${ctx.t('fq1b')} <span class="fig num">${nf(F.rorPoints, 2)}</span> ${ctx.t('fq1c')} <span class="fig num">${F.rorPercent == null ? '' : nf(F.rorPercent, 0) + '%'}</span> ${ctx.t('fq1d')}</p>` : none, F.rorRows);
        qs += q('fq2', F.workOk ? `<p>${ctx.t('fq2a')} <span class="fig num">${F.work}</span>. ${ctx.t('fq2b')} <span class="fig num">${F.work - c.RA}</span> ${ctx.t('fq2c')} <span class="fig num">${LE - F.work}</span> ${ctx.t('fq2d')}</p>` : none, F.workRows);
        const red = c.RID > 0 && E.W0(c.RA) > 0 ? 100 * (1 - F.spend / E.W0(c.RA)) : 0;
        qs += q('fq3', F.spendOk ? `<p>${ctx.t('fq3a')} <span class="fig num">${fmt.money(F.spend)}</span> ${ctx.t('fq3b')} <span class="fig num">${nf(red, 0)}%</span> ${ctx.t('fq3c')}</p>` : none, F.spendRows);
        qs += q('fq4', F.saveOk ? `<p>${ctx.t('fq4a')} <span class="fig num">${fmt.money(F.save)}</span> ${ctx.t('fq4b')} <span class="fig num">${fmt.money(F.save - c.AS)}</span> ${ctx.t('fq4c')}</p>` : none, F.saveRows);
      }
      const sum = F.goal ? `<div class="sec"><h3>${ctx.t('fqSum')}</h3><ul>
          <li>${ctx.t('rpO1')}: <span class="num">${F.rorOk ? ret(F.ror) : ''}</span></li>
          <li>${ctx.t('rpO3')}: <span class="num">${F.workOk ? F.work : ''}</span></li>
          <li>${ctx.t('rpO4')}: <span class="num">${F.spendOk ? fmt.money(F.spend) : ''}</span></li>
          <li>${ctx.t('rpO2')}: <span class="num">${F.saveOk ? fmt.money(F.save) : ''}</span></li></ul></div>` : '';
      html = `<div class="b13-rep">${head('fqTitle')}${ctx.t('fqIntro', { tag: 'p' })}${detail}${qs}${sum}${ctx.t('fqPhil', { tag: 'p', attrs: 'style="font-style:italic"' })}${disc}</div>`;
    }
    ctx.overlay({ title: ctx.t(kind === 'summary' ? 'rpTitle' : 'fqTitle'), cls: 'b13-ov-lg', html });
  }
  EFA.screen('rron4', {
    title: 'Present vs revised retirement projection',
    copy: Object.assign({}, PROJ_COPY, {
      rgoal: 'Retirement Goal', potTax: 'Potential Taxes', lbCL: 'Current Lifestyle',
      _notes: 'Here is your plan as it stands, beside a revised plan we can change together. There are only a handful of levers: earn more, save more, work longer, spend less.\n\n- Ask: Which of these levers would you be most willing to pull, and which would you rather not touch?\nPAUSE\n\n- Each lever can take a number you choose, or find the number that makes the money last. Reset starts over.'
    }),
    render(ctx) { renderProjection(ctx, false); },
    leave(ctx) { if (ctx._stopAuto) ctx._stopAuto(); leaveVisit(ctx); }
  });
  EFA.screen('rron4b', {
    title: 'Business owner projection and levers',
    copy: Object.assign({}, PROJ_COPY, {
      rgoal: 'Retirement Goal', potTax: 'Potential Taxes', lbCL: 'Current Lifestyle',
      _notes: 'For a business owner, the business itself is one of the levers. Growing its value before a sale can do the work that extra savings would otherwise have to do.\n\n- Ask: What would it take for the business to be worth more on the day you step away?\nPAUSE\n\n- Grow Business finds the growth rate the plan needs, or takes the rate you believe is realistic.'
    }),
    render(ctx) { renderProjection(ctx, true); },
    leave(ctx) { if (ctx._stopAuto) ctx._stopAuto(); leaveVisit(ctx); }
  });

  /* =====================================================================
     rron3: the present projection on the money model, year by year
     ===================================================================== */
  EFA.screen('rron3', {
    title: 'Present projection on the money model',
    copy: Object.assign({}, LIB_COPY, {
      head: 'Present Projection', lbYear: 'Year', lbAge: 'Age', lbStep: 'Step', lbScale: 'Scale',
      rgoal: 'Retirement Goal', potTax: 'Potential Taxes', fillOf: 'of',
      pemWait: 'The money model is still loading. It will appear here as soon as it is ready.',
      disc: 'Hypothetical illustration using constant rates of return and a single flat tax rate. Not a guarantee or a projection of any specific product; actual results will vary.',
      _notes: 'This is your plan exactly as it stands today, running year by year: income coming in, taxes taken out, savings filling the tanks, and retirement drawing them down.\n\n- Ask: As we step through the years, watch the tanks. At what age do you think they run dry?\nPAUSE\n\n- Type a year, or check Step to play the years. Scale magnifies the tank levels.'
    }),
    render(ctx) {
      const biz = ctx.variant === 'business';
      const V = ctx._r3 = visit(ctx, () => ({ E: rronEngine({ business: biz }).init(), year: 1, auto: false, factor: 100, rip: true, pv: false }));
      const E = V.E, Nn = E.N;
      ctx.el.innerHTML = `
        <div class="b13-head" style="top:16px">${ctx.t('head', { tag: 'h1', cls: 'st-h2', attrs: 'style="font-size:44px"' })}</div>
        <div class="b13-r3-ctl">
          <div>${ctx.t('lbYear', { cls: 'b13-lb' })}<div style="margin-top:8px"><input class="b13-in" data-year inputmode="numeric"></div></div>
          <div>${ctx.t('lbAge', { cls: 'b13-lb' })}<div class="age num" data-age style="margin-top:6px"></div></div>
          <div>${ctx.t('lbStep', { cls: 'b13-lb' })}<div style="margin-top:8px">${checkBox('data-auto', V.auto, '')}</div></div>
          <div>${ctx.t('lbScale', { cls: 'b13-lb' })}<div style="margin-top:8px"><input type="range" min="1" max="200" step="1" data-scale value="${V.factor}"></div></div>
        </div>
        <div class="b13-r3-win" data-win></div>
        <p class="st-disclaimer" style="position:absolute;left:196px;width:1100px;top:850px;margin:0">${ctx.t('disc')}</p>`;
      const PM = LIB('pem');
      const win = ctx.$('[data-win]');
      let pem = null;
      if (PM && PM.mount) {
        pem = ctx._pem = PM.mount(ctx, win, {
          IsShowText: false, IsShowScenario: false, LinksActive: false, IsRIPMode: true, IsShowRIP: V.rip, IsPVLifestyle: V.pv,
          IsInvestments: !biz, IsShowBF: false, IsShowHouse: false, sliders: false, align: 'center',
          on: { ripclick: () => { V.rip = !V.rip; pem.set({ IsShowRIP: V.rip }); }, pvclick: () => { V.pv = !V.pv; draw(); } }
        });
      } else {
        win.innerHTML = `<div class="b13-card b13-tint b13-wait" style="position:absolute;inset:40px 60px 60px 20px"><div><div class="b13-spin"></div>${ctx.t('pemWait')}</div></div>`;
      }
      const goal = E.res.RequiredBalanceAtRetirement;
      const data = () => {
        const r = E.ybyP[Math.min(Math.max(V.year - 1, 0), Nn - 1)];
        const lip = r.LifetimeIncomePotential;
        const rf = E.TRS > 0 ? 100 * Math.min(r.RiskTankBalance / E.TRS * V.factor * 0.01, 1) : 0;
        const sf = E.TRS > 0 ? 100 * Math.min(r.SafeTankBalance / E.TRS * V.factor * 0.01, 1) : 0;
        const tip = (f) => `${nf(f, 2)}% ${ctx.text('fillOf')} ${fmt.money(goal, { dp: 2 })}\n${ctx.text('rgoal')}`;
        return {
          TaxesPaid: r.TaxesPaidThisYear, LSRegulatorValue: r.LSRegulator, DiverterValveHandleAngle: r.DiverterValve, ExpensesPaid: r.ExpensesPaidThisYear,
          Lifestyle: V.pv ? r.PVLifestyle : r.Lifestyle, Outflow: V.pv ? r.PVOutflow : r.Outflow, RemainingIncome: r.RemainingIncome,
          RiskTankBalance: r.RiskTankBalance, SafeTankBalance: r.SafeTankBalance, Contribution: r.FutureLSContributions, Withdrawal: r.WithdrawalsThisYear,
          TDContributions: r.TDContributionsThisYear, GrossIncome: r.IncomeThisYear + r.TDContributionsThisYear, Inflow: r.IncomeThisYear,
          IncomeValue: lip > 0 ? 100 * Math.min((r.IncomeThisYear + r.TDContributionsThisYear) / lip, 1) : 0,
          InvestmentRedValue: rf, InvestmentRedTitle: tip(rf),
          InvestmentTaxValue: r.RiskTankBalance > 0 ? 100 - 100 * r.RiskTankPotTaxes / r.RiskTankBalance : 0, InvestmentTaxTitle: `${fmt.money(r.RiskTankPotTaxes, { dp: 2 })} ${ctx.text('potTax')}`,
          SavingsRedValue: sf, SavingsRedTitle: tip(sf),
          SavingsTaxValue: r.SafeTankBalance > 0 ? 100 * r.SafeTankPotTaxes / r.SafeTankBalance : 0, SavingsTaxTitle: `${fmt.money(r.SafeTankPotTaxes, { dp: 2 })} ${ctx.text('potTax')}`,
          IsPVLifestyle: V.pv
        };
      };
      const yin = ctx.$('[data-year]');
      const draw = (ms) => {
        V.year = Math.max(1, Math.min(Nn, Math.round(V.year)));
        if (document.activeElement !== yin) yin.value = V.year;
        ctx.$('[data-age]').textContent = E.ybyP[V.year - 1].Age;
        ctx.$('[data-auto]').setAttribute('aria-checked', V.auto);
        if (pem) pem.set(data(), { ms: ms == null ? 400 : ms });
      };
      bindNum(yin, { type: 'int', min: 1, max: Nn, get: () => V.year, set: (v) => { V.year = v; draw(); }, fmt: (v) => String(v) });
      const stop = () => { V.auto = false; if (V.timer) { clearInterval(V.timer); V.timer = null; } };
      ctx._stopAuto = () => { stop(); };
      ctx.on(ctx.$('[data-auto]'), 'click', () => {
        if (V.auto) { stop(); draw(); return; }
        V.auto = true; draw();
        V.timer = setInterval(() => { if (!ctx.el.isConnected) { stop(); return; } if (V.year >= Nn) { stop(); draw(); return; } V.year += 1; draw(); }, 500);
      });
      const sc = ctx.$('[data-scale]'); sc.addEventListener('input', () => { V.factor = +sc.value; draw(0); });
      draw(0);
    },
    leave(ctx) { if (ctx._stopAuto) ctx._stopAuto(); leaveVisit(ctx); }
  });

  /* public UI for screens that embed these (rm6 mounts rron2, rm7 mounts rron4) */
  EFA.engines.rron.ui = { assumptions: renderAssumptions, projection: renderProjection, listEditor: openListEditor, copy: { assumptions: ASSUME_COPY, projection: PROJ_COPY } };
})();
