/* Personal Economic Model (PEM): the money-flow diagram shared by 79 screens (tanks, pipes, valves,
   tax filter, lifestyle pipe, animated money routes). API and copy keys: docs/pem.md.
   Builder notes: docs/build/pem.md. Geometry keeps the original's 67em x 36.5em model box so spec
   positions carry over; every drawing is new, computed in code, in the Edwards palette. */
(function () {
  'use strict';
  const EFA = window.EFA = window.EFA || {};
  const L = EFA.lib = EFA.lib || {};
  const P = EFA.art.P;
  const SID = '_lib_pem';
  const U = 10;            // svg user units per model em
  const MH = 36.5;         // model box height (em)
  const HF = 15.7;         // usable tank height (em), spec "maxTankHeight"
  let SEQ = 0;

  /* ---------- palette (PEM roles mapped to the brand; sage and brick are PEM-only role colors) ---------- */
  const C = {
    ink: P.navy, n2: P.navy2, n3: P.navy3, n4: P.navy4, mist: P.mist, mist2: P.mist2, paper: P.paper, cream: P.cream,
    rule: P.rule, gold: P.gold, goldLt: P.goldLt, goldPale: P.goldPale, goldDeep: P.goldDeep, steel: P.steel,
    water: P.water, waterDeep: P.waterDeep, sage: '#7c9e85', sageLt: '#b4cbb8', sageDeep: '#4e7058',
    brick: '#b3402e', brickLt: '#de9c8e', muted: '#667389', lend: '#6f8fbd', ndb: '#c5d3e6'
  };

  /* ---------- wording (every visible word; Joshua edits these in edit mode) ---------- */
  const COPY = {
    income: 'Income',
    incomeTank: 'Lifetime\nEarning Power',
    ripTank: 'Remaining\nEarning Power',
    legacyTank: 'Legacy\nGifting Pool',
    protection: 'income protection',
    protectionTip: 'Life insurance in force compared with the future income your family would lose if your paycheck stopped. Under 80% deserves a closer look.',
    fio: 'Owed From\nFuture Income',
    qp: 'Qualified Plan Contributions',
    qpAlt: 'Deferred Compensation',
    business: 'Business Income',
    diverter: 'Allocation Valve',
    column: 'Future Lifestyle',
    columnAlt: 'Extra Cash Flow',
    riskTitle: 'Investments',
    riskTitleBiz: 'Your Business',
    riskMark: 'Risk',
    safeTitle: 'Savings',
    safeTitlePli: 'Cash Value\nInsurance',
    safeMark: 'Safe',
    emergency: 'Emergency Fund',
    bfTitle: 'Borrowed Funds',
    lenderOther: 'Outside Lender',
    lenderInsurer: 'Insurance Company',
    liability: 'Liability',
    debt: 'Debt',
    locLabel: 'Line of Credit',
    collateral: 'Collateral',
    deathBenefit: 'Death Benefit',
    houseTitle: 'House',
    houseTitleMcp: 'Major Purchase\nFund',
    mcpName: 'College',
    liquidity: 'Liquidity',
    creditLine: 'Line of Credit',
    equity: 'Equity',
    taxFilter: 'Tax Filter',
    regulator: 'Lifestyle\nRegulator',
    inflowLabel: 'Inflow',
    afterTax: 'After-Tax Cash Flow',
    afterTax2: 'After-Tax\nCash Flow',
    lifestyleEnd: 'Current\nLifestyle',
    standardLiving: 'Standard of Living',
    protectionStrip: 'Protection',
    rank: 'Rank',
    shield: 'Shield',
    rankTip: 'Number each protection in the order that matters most to you.',
    shieldTip: 'Mark each protection you already have in place.',
    cQP: 'Qualified Plan Contribution',
    cRisk: 'Risk Contribution',
    cSafe: 'Safe Contribution',
    cHouse: 'Major Purchase Contribution',
    contribution: 'Contribution',
    withdrawal: 'Withdrawal',
    proceeds: 'Proceeds',
    loanPmt: 'Loan Payment',
    loanDraw: 'Loan Draw',
    inflow: 'Inflow',
    netInflow: 'Net Inflow',
    inflowTotal: 'Total Inflow',
    taxesPaid: 'Taxes Paid',
    outflowTotal: 'Total Outflow',
    oppCost: 'Opportunity Cost',
    expenses: 'Expenses',
    lifestyle: 'Lifestyle',
    spendable: 'Spendable',
    paidCash: 'Paid Cash',
    paidFull: 'Paid in Full',
    tPrincipal: 'Principal',
    tIntPaid: 'Interest Paid',
    tIntLost: 'Interest Lost',
    tNet: 'Net Cost',
    tTotal: 'Total',
    mcpBox: 'Major Capital Purchase',
    mcpBoxAlt: 'Major Lifestyle Expense',
    forExpense: 'For Expense',
    forOpportunity: 'For Opportunity',
    ccNone: 'No Collateral',
    ccRisk: 'Risk Tank',
    ccSafe: 'Safe Tank',
    ccHouse: 'House',
    ssPool: 'Social Security',
    fica: 'FICA & Medicare',
    pv: "Today's $",
    fv: 'Future $',
    sc0: 'Choose a scenario',
    sc1: 'Spender',
    sc2: 'Saver',
    sc3: 'Wealth Builder',
    sc4: 'Legacy Builder',
    sc5: 'Lifestyle Ceiling',
    sc6: 'Mortgage: Finance',
    sc7: 'Mortgage: Cash',
    sc8: 'Social Security',
    showLabels: 'Show Labels',
    giving: 'Generosity Comes First',
    tipOpen: 'Open',
    tipQP: 'Show or hide the qualified plan pipe',
    tipRisk: 'Show or hide the investments tank',
    tipSafe: 'Show or hide the savings tank',
    tipRealloc: 'Move money from this tank into the other one',
    tipPli: 'Switch the savings tank to cash value insurance and back',
    tipSection: 'Show or hide this part of the model',
    tipRip: 'Show or hide the amount',
    tipPv: "Switch between today's dollars and future dollars",
    tipLender: 'Choose who lends the money',
    tipStrip: 'Switch between standard of living and protection',
    tipColumn: 'Switch the column wording',
    tipRiskTitle: 'Switch between investments and your business',
    tipHouseTitle: 'Switch between house and major purchase fund',
    tipMcpClose: 'Close the purchase box',
    tipMcpTitle: 'Switch between a purchase and a lifestyle expense',
    tipQPWord: 'Right-click to switch the wording',
    tipSs: 'Turn Social Security income on or off'
  };
  EFA.screen(SID, { title: 'Personal Economic Model', copy: COPY });

  /* ---------- state defaults (docs/pem.md section 2) ---------- */
  const DEF = {
    labels: true, scenarioPicker: true, links: true, tankLinks: true, showIncome: true, showFuture: true, futureFill: true,
    showRisk: true, showSafe: true, showQP: true, showBorrowed: true, borrowSource: true, showHouse: true, lifestyleStrip: true,
    liabilityLabel: true, debtService: true, lock: false, noBorrow: false, investments: true, standardLiving: true,
    mcpFunds: false, mcpName: null, altBalance: false, gps: false, gpsButtons: false, narrow: false, sliders: true,
    chevrons: true, giving: false,
    rip: false, showRip: false, remainingIncome: 0, incomeProtection: false, lowProtection: false, protectionPct: 0,
    pv: false, pli: false, collateral: 'none', ceiling: false, purchase: null, legacy: false, loc: false,
    socialSecurity: false, ssIncome: false, opportunity: false, lender: null, stacked: false,
    income: 0, riskPreTax: 0, risk: 0, riskKeep: 60, safeTaxable: 0, safe: 0, safeTax: 40, borrow: 0, otherDebt: 0,
    creditLine: 0, house: 0, houseRef: 0, regulator: 80, remaining: 100, mcpRemaining: 100, diverter: 0, dbRisk: 0,
    dbSafe: 0, disabilityBand: 0, ceilingTank: 0, ceilingCredit: 0,
    riskPreTaxTip: '', riskTaxTip: '', safeTaxTip: '', safeTaxableTip: '', dbRiskTip: '', dbSafeTip: '', bfRiskTip: '', bfSafeTip: '',
    riskBalance: 0, safeBalance: 0, bfBalance: 0, houseBalance: 0, houseEquity: 0, liquidity: 0, creditBalance: 0,
    contribution: 0, contributionQP: 0, contributionRisk: 0, contributionSafe: 0, contributionHouse: 0, tdContributions: 0,
    withdrawal: 0, withdrawalRisk: 0, withdrawalSafe: 0, proceeds: 0, loanPmt: 0, grossIncome: 0, inflow: 0, inflowTotal: 0,
    taxesPaid: 0, outflow: 0, outflowTotal: 0, oppCost: 0, expenses: 0, lifestyle: 0,
    summaryCash: false, summaryBorrow: false, summaryPrincipal: 0, summaryInterestPaid: 0, summaryInterestLost: 0, summaryTotal: 0,
    stacks: null, tankSize: 2500000, accounts: null, chartIndex: 0, includeNdb: true,
    // presenter-driven UI state (saved across jumps)
    qpAlt: false, columnAlt: false, purchaseAlt: false, realloc: null, rankOn: false, shieldOn: false, protect: [],
    scenario: 0, freeMoney: false, debtStart: 0, borrowStart: 0, regulatorSaved: null
  };
  const BOOL_KEYS = Object.keys(DEF).filter((k) => typeof DEF[k] === 'boolean');

  /* original input names -> keys (docs/pem.md: every original name is accepted) */
  const ORIG = {
    IsShowText: 'labels', IsShowScenario: 'scenarioPicker', LinksActive: 'links', IsTankLinks: 'tankLinks', IsShowLCP: 'showIncome',
    IsShowFL: 'showFuture', IsShowFLFill: 'futureFill', IsShowRiskTank: 'showRisk', IsShowSafeTank: 'showSafe', IsShowQP: 'showQP',
    IsShowBF: 'showBorrowed', IsShowBFSource: 'borrowSource', IsShowHouse: 'showHouse', IsShowLifestyleExpenses: 'lifestyleStrip',
    IsShowLiability: 'liabilityLabel', IsShowDebtService: 'debtService', IsShowLock: 'lock', IsShowRedXOverBF: 'noBorrow',
    IsInvestments: 'investments', StandardLiving: 'standardLiving', IsMCPFunds: 'mcpFunds', MCPName: 'mcpName',
    IsAltBalanceLocation: 'altBalance', IsGPS: 'gps', HasGPSButtons: 'gpsButtons', ForceNarrowAspectRatio: 'narrow',
    IsRIPMode: 'rip', IsShowRIP: 'showRip', RemainingIncome: 'remainingIncome', IsShowIncomeProtection: 'incomeProtection',
    LowIncomeProtection: 'lowProtection', PercentIncomeProtection: 'protectionPct', IsPVLifestyle: 'pv', IsSG: 'stacked',
    AccountList: 'accounts', ChartIndex: 'chartIndex', IncludeNDBInTank: 'includeNdb', TankReferenceSize: 'tankSize',
    IsPLIMode: 'pli', CollateralChoice: 'collateral', SetLifestyleCeilingMode: 'ceiling', ShowMCP: 'purchase',
    IsShowLegacyProvider: 'legacy', IsShowLOC: 'loc', IncomeValue: 'income', InvestmentRedValue: 'riskPreTax',
    InvestmentValue: 'risk', InvestmentTaxValue: 'riskKeep', SavingsRedValue: 'safeTaxable', SavingsValue: 'safe',
    SavingsTaxValue: 'safeTax', BorrowValue: 'borrow', UnsecuredDebtValue: 'otherDebt', LineOfCreditValue: 'creditLine',
    HouseValue: 'house', HouseRefValue: 'houseRef', LSRegulatorValue: 'regulator', LSRemainingValue: 'remaining',
    MCPLSRemainingValue: 'mcpRemaining', DiverterValveHandleAngle: 'diverter', DBValueR: 'dbRisk', DBValueS: 'dbSafe',
    BCFDIValue: 'disabilityBand', LSTankValue: 'ceilingTank', InvestmentRedTitle: 'riskPreTaxTip', InvestmentTaxTitle: 'riskTaxTip',
    SavingsTaxTitle: 'safeTaxTip', SavingsRedTitle: 'safeTaxableTip', DBTitleR: 'dbRiskTip', DBTitleS: 'dbSafeTip',
    BFTitleR: 'bfRiskTip', BFTitleS: 'bfSafeTip', RiskTankBalance: 'riskBalance', SafeTankBalance: 'safeBalance',
    BFTankBalance: 'bfBalance', HouseTankBalance: 'houseBalance', HouseTankEquityBalance: 'houseEquity',
    LiquidityBalance: 'liquidity', LineOfCreditBalance: 'creditBalance', Contribution: 'contribution',
    ContributionQP: 'contributionQP', ContributionR: 'contributionRisk', ContributionS: 'contributionSafe',
    ContributionH: 'contributionHouse', TDContributions: 'tdContributions', Withdrawal: 'withdrawal',
    WithdrawalR: 'withdrawalRisk', WithdrawalS: 'withdrawalSafe', WithdrawalH: 'proceeds', LoanPmt: 'loanPmt',
    GrossIncome: 'grossIncome', Inflow: 'inflow', InflowC: 'inflowTotal', TaxesPaid: 'taxesPaid', Outflow: 'outflow',
    OutflowC: 'outflowTotal', OutflowLOC: 'oppCost', ExpensesPaid: 'expenses', Lifestyle: 'lifestyle',
    IsShowSummaryPayCash: 'summaryCash', IsShowSummaryBorrowedFunds: 'summaryBorrow', SummaryPrincipalPaid: 'summaryPrincipal',
    SummaryInterestPaid: 'summaryInterestPaid', SummaryInterestLost: 'summaryInterestLost', SummaryTotalCost: 'summaryTotal'
  };
  const IGNORED = { OverrideAspectRatio: 1, LSSpendingPercent: 1, IsShowHouseMinDownPmtText: 1, IsShowSummaryPayCashTitle: 1 };
  const COLL = { ccNC: 'none', ccRT: 'risk', ccST: 'safe', ccHT: 'house', none: 'none', risk: 'risk', safe: 'safe', house: 'house' };

  /* flows: [name, original switch, stroke (em), tax?] */
  const FLOW_DEF = [
    ['incomeToQP', 'IncomeToQPTube', 0.26], ['incomeToFilter', 'IncomeToTaxFilter', 0.8], ['filterToOutflow', 'InflowTaxFilterToOutflow', 0.6],
    ['filterToMCP', 'InflowTaxFilterToMCP', 0.6], ['riskToFilter', 'RiskTankTaxableToTaxFilter', 0.6], ['safeToFilter', 'SafeTankTaxableToTaxFilter', 0.6],
    ['futureToOutflow', 'FLTankAfterTaxOutflow', 0.6], ['futureToMCP', 'FLTankAfterTaxToMCP', 0.6], ['filterToRisk', 'TaxFilterToInvestments', 0.6],
    ['filterToRiskThin', 'TaxFilterToInvestmentsThin', 0.22], ['filterToSafe', 'TaxFilterToSavings', 0.6], ['filterToSafeThin', 'TaxFilterToSavingsThin', 0.22],
    ['filterToBorrowed', 'InflowTaxFilterToBorrowedFunds', 0.6], ['borrowedIn', 'BorrowedFundsIn', 0.6], ['borrowedOut', 'BorrowedFundsOut', 0.6],
    ['mcpIn', 'MCPFundsIn', 0.6], ['mcpOut', 'MCPFundsOut', 0.6], ['futureToHouse', 'TankTaxFilterToHouse', 0.6],
    ['borrowedToHouse', 'BorrowedFundsToHouse', 0.6], ['borrowedToOutflow', 'BorrowedFundsToOutflow', 0.6], ['borrowedToMCP', 'BorrowedFundsToMCP', 0.6],
    ['tankTaxOut', 'TankTaxOut', 0.6, true], ['incomeTaxOut', 'IncomeTaxOut', 0.6, true]
  ];
  const FLOW_NAMES = FLOW_DEF.map((f) => f[0]);
  const FLOW_ORIG = {};
  FLOW_DEF.forEach(([nm, o]) => { FLOW_ORIG[o] = nm; FLOW_ORIG['IsShow' + o] = nm; });

  const PART_KEYS = {
    labels: 'labels', scenario: 'scenarioPicker', income: 'showIncome', future: 'showFuture', futureFill: 'futureFill',
    risk: 'showRisk', safe: 'showSafe', qp: 'showQP', borrowed: 'showBorrowed', borrowSource: 'borrowSource', house: 'showHouse',
    lifestyle: 'lifestyleStrip', liability: 'liabilityLabel', lock: 'lock', noBorrow: 'noBorrow', sliders: 'sliders', chevrons: 'chevrons'
  };
  const GEO_PARTS = ['income', 'inlet', 'qp', 'risk', 'riskFill', 'riskTax', 'riskOutlet', 'safe', 'safeFill', 'safeTax', 'diverter',
    'column', 'realloc', 'filter', 'regulator', 'pipe', 'endCap', 'borrowed', 'house', 'purchase', 'strip', 'remaining', 'scenario'];

  /* scenario presets: sections I/FL/BF/H/QP, InvRed, Inv, SavRed, Sav, Borrow, House, Reg, Rem, collateral, extras */
  const PRESETS = [
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 80, 100, 'none'],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 100, 100, 'none'],
    [1, 1, 0, 0, 1, 0, 0, 0, 33, 0, 0, 80, 100, 'none'],
    [1, 1, 1, 0, 1, 33, 0, 0, 33, 16, 0, 90, 90, 'safe'],
    [1, 1, 1, 1, 0, 100, 0, 0, 100, 0, 100, 100, 100, 'house', { legacy: true, income: 25 }],
    [1, 1, 1, 0, 1, 30, 0, 0, 30, 0, 0, 90, 100, 'none', { ceiling: true, ceilingTank: 90 }],
    [1, 1, 1, 1, 1, 0, 0, 0, 40, 40, 50, 90, 70, 'house'],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 50, 80, 100, 'none'],
    [1, 1, 1, 0, 1, 30, 0, 0, 30, 0, 0, 90, 100, 'safe', { socialSecurity: true, ssIncome: false }]
  ];

  /* click-through links (spec "Jumps"); protection icons in order */
  const PROTECT = [['PH', 'ph1', 'house'], ['AUTOINS', 'autoIns1', 'car'], ['UMBINS', 'umbins1', 'umbrella'], ['MAJMED', 'majMed1', 'aid'],
    ['DI101', 'dif1', 'wheelchair'], ['LTC', 'ltc1', 'walker'], ['PTI', 'pti1', 'family'], ['ESTPLN', 'estplan1', 'doc']];
  const LIFE_ICONS = ['house', 'car', 'cap', 'dining', 'hanger', 'music', 'phone'];

  /* ---------- small helpers ---------- */
  const r2 = (v) => Math.round(v * 100) / 100;
  const n = (v) => r2(v * U);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const num = (v) => (isFinite(+v) ? +v : 0);
  const lv = (v) => clamp(num(v), 0, 100);
  const LV = (v) => HF * lv(v) / 100;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (v) => EFA.fmt.money(Math.round(num(v)));
  const reduced = () => (EFA.util && EFA.util.reduced ? EFA.util.reduced() : false);
  const editing = () => !!(EFA.edit && EFA.edit.on);

  /* line icons in a 24 box (stroke = currentColor) */
  const IC = {
    house: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5.5h4V20"/>',
    car: '<path d="M3.5 16.5v-3.5l2.2-4.7c.4-.8 1.2-1.3 2-1.3h8.6c.8 0 1.6.5 2 1.3l2.2 4.7v3.5z"/><path d="M3.5 13h17"/><circle cx="7.5" cy="17.4" r="1.9"/><circle cx="16.5" cy="17.4" r="1.9"/>',
    cap: '<path d="M2 9.5 12 5l10 4.5L12 14z"/><path d="M6.5 11.8V16c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.2"/><path d="M20.5 10.2V15"/>',
    dining: '<path d="M7 3v18"/><path d="M4.5 3v4.5c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5V3"/><path d="M17 21V3c-2.2 1.2-3.5 3.8-3.5 7.2 0 1.6.9 2.6 3.5 2.6"/>',
    hanger: '<path d="M10 5.2a2 2 0 1 1 2 2v1.6"/><path d="M12 8.8 3.2 15.4c-.8.6-.4 1.6.6 1.6h16.4c1 0 1.4-1 .6-1.6z"/>',
    music: '<path d="M9 17.5V6l10-2v11.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2"/><path d="M10.5 18h3"/>',
    umbrella: '<path d="M3 12c.4-4.6 4.1-8 9-8s8.6 3.4 9 8z"/><path d="M12 12v6.5a2.3 2.3 0 0 1-4.6 0"/><path d="M12 2.5V4"/>',
    aid: '<rect x="3.5" y="7.5" width="17" height="12" rx="1.5"/><path d="M9 7.5V5h6v2.5"/><path d="M12 10.5v6M9 13.5h6"/>',
    wheelchair: '<circle cx="10" cy="4.5" r="1.6"/><path d="M10 7.5v5.5h5.5l2.5 5.5"/><path d="M10 10h4.5"/><path d="M7.6 10.8a5.2 5.2 0 1 0 7 6.7"/>',
    walker: '<circle cx="8.5" cy="4.2" r="1.6"/><path d="M8.5 7.5v6l-2.6 6.8"/><path d="M8.5 13.5l2.6 6.8"/><path d="M8.5 9.5l4.5 2.2"/><path d="M13 8.5h5.5"/><path d="M14 8.5l-1.2 12M18 8.5l1.2 12"/>',
    family: '<circle cx="7" cy="6" r="2"/><circle cx="17" cy="6" r="2"/><circle cx="12" cy="10.2" r="1.6"/><path d="M3.5 19.5V14c0-1.6 1.6-2.8 3.5-2.8s3.5 1.2 3.5 2.8"/><path d="M13.5 14c0-1.6 1.6-2.8 3.5-2.8s3.5 1.2 3.5 2.8v5.5"/><path d="M9.6 19.5v-2.8c0-1.1 1.1-1.9 2.4-1.9s2.4.8 2.4 1.9v2.8"/>',
    doc: '<path d="M6 2.8h8.2l3.8 3.8v14.6H6z"/><path d="M14 2.8v4h4"/><path d="M8.8 11h6.4M8.8 14h6.4M8.8 17h4.2"/>',
    calc: '<rect x="5.5" y="2.5" width="13" height="19" rx="1.8"/><rect x="8" y="5" width="8" height="3.6" rx=".6"/><path d="M8.6 12h.01M12 12h.01M15.4 12h.01M8.6 15h.01M12 15h.01M15.4 15h.01M8.6 18h.01M12 18h.01M15.4 18h.01"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    hand: '<path d="M9.2 11.2V4.8a1.5 1.5 0 0 1 3 0v5.4"/><path d="M12.2 10V8.6a1.5 1.5 0 0 1 3 0V11"/><path d="M15.2 10.6a1.5 1.5 0 0 1 3 0v3.9c0 3.9-2.5 6.7-6 6.7-2.6 0-4.1-1.3-5.4-3.4l-2.1-3.5c-.7-1.2.7-2.6 1.9-1.7l2.6 2V11.2"/>',
    expand: '<path d="M4 9.5V4h5.5M20 9.5V4h-5.5M4 14.5V20h5.5M20 14.5V20h-5.5"/>',
    contract: '<path d="M9.5 4v5.5H4M14.5 4v5.5H20M9.5 20v-5.5H4M14.5 20v-5.5H20"/>',
    up: '<path d="M6 14.5l6-6 6 6"/>',
    down: '<path d="M6 9.5l6 6 6-6"/>',
    warn: '<path d="M12 3.5 2.5 20.5h19z"/><path d="M12 10v4.6M12 17.4h.01"/>',
    arrowR: '<path d="M4 12h14M13 6.5l5.5 5.5L13 17.5"/>',
    arrowUp: '<path d="M12 20V5M6.5 10.5 12 5l5.5 5.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  const SHIELD = 'M12 2.4 20.2 5.5v6.1c0 5.1-3.5 8.9-8.2 10.6-4.7-1.7-8.2-5.5-8.2-10.6V5.5z';
  const htmlIcon = (name, cls, sw) => `<svg viewBox="0 0 24 24" class="${cls || ''}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="${sw || 2}" stroke-linecap="round" stroke-linejoin="round">${IC[name] || ''}</svg>`;
  /** an icon placed inside the main svg (em coordinates, size in em) */
  const svgIcon = (name, x, y, size, color, sw) => `<g transform="translate(${n(x)} ${n(y)}) scale(${r2(size * U / 24)})" fill="none" stroke="${color}" stroke-width="${sw || 2}" stroke-linecap="round" stroke-linejoin="round">${IC[name] || ''}</g>`;

  /** brand shield for hosts (ph1, pti1): pem.place(EFA.lib.pem.art.shield(), 'borrowed') */
  function shieldArt(o) {
    o = o || {};
    const id = 'lps' + (++SEQ);
    return `<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;overflow:visible" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.light || C.n4}"/><stop offset="1" stop-color="${o.dark || C.ink}"/></linearGradient></defs>
      <path d="${SHIELD}" fill="url(#${id})" fill-opacity="${o.opacity == null ? 0.82 : o.opacity}" stroke="${C.gold}" stroke-width="${o.stroke || 0.9}" stroke-linejoin="round"/>
      <path d="M12 4.6 18.2 7v4.7c0 3.9-2.6 6.9-6.2 8.3-3.6-1.4-6.2-4.4-6.2-8.3V7z" fill="none" stroke="${C.goldLt}" stroke-opacity=".55" stroke-width=".45"/>
      ${o.check === false ? '' : `<path d="M8.4 12.2l2.5 2.5 4.9-5.1" fill="none" stroke="${C.goldLt}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`}
    </svg>`;
  }

  /** college illustration for the major-purchase box (house and car come from EFA.art.ill) */
  function collegeArt() {
    return `<svg viewBox="0 0 260 210" aria-hidden="true" class="ill">
      <ellipse cx="130" cy="194" rx="104" ry="9" fill="${P.shadow}"/>
      <g transform="rotate(-8 130 150)"><rect x="46" y="128" width="170" height="44" rx="22" fill="${P.paper}" stroke="${P.navy}" stroke-width="4"/>
        <ellipse cx="68" cy="150" rx="12" ry="22" fill="${P.mist}" stroke="${P.navy}" stroke-width="4"/>
        <path d="M150 128v44" stroke="${P.gold}" stroke-width="12"/><path d="M144 172l6 16 6-16" fill="${P.gold}"/></g>
      <path d="M130 30 236 70 130 110 24 70z" fill="${P.navy}" stroke="${P.navy}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M130 42 206 70 130 98 54 70z" fill="none" stroke="${P.navy4}" stroke-width="3"/>
      <path d="M78 88v28c0 12 24 22 52 22s52-10 52-22V88l-52 22z" fill="${P.navy3}"/>
      <path d="M130 70h84v42" fill="none" stroke="${P.gold}" stroke-width="5" stroke-linecap="round"/>
      <path d="M206 112h16l-4 26h-8z" fill="${P.gold}"/>
      <circle cx="130" cy="70" r="7" fill="${P.gold}"/></svg>`;
  }

  /* ---------- geometry (model em; wide box 67 x 36.5, narrow 50 x 36.5) ---------- */
  function geo(narrow) {
    const Wm = narrow ? 50 : 67;
    const y = (p) => p * MH / 100;
    const KX = [[0, 0], [15.5, 11.5], [17.956, 12.4], [25.956, 19.4], [28.522, 21.55], [31.088, 23.7], [39.088, 30.7], [41.54, 31.5], [49.54, 38.5], [52.26, 39.3], [60.26, 46.3], [67, 50]];
    const mx = (xw) => {
      if (!narrow) return xw;
      for (let i = 1; i < KX.length; i++) {
        const a = KX[i - 1], b = KX[i];
        if (xw <= b[0] || i === KX.length - 1) return a[1] + (xw - a[0]) * (b[1] - a[1]) / (b[0] - a[0]);
      }
      return xw;
    };
    const x = (p) => mx(p * 0.67);
    const tw = narrow ? 7 : 8;
    const tank = (x0, w, top, base, lid, h) => ({ x: x0, w, top, base, bot: base + 0.12, feet: top + h, lid, cx: x0 + w / 2, ix0: x0 + 0.14, iw: w - 0.28 });
    const g = { narrow, Wm, tw, mx, x, y };
    g.inc = tank(0, narrow ? 11.5 : 15.5, y(19.5), y(70.7), false, 19.4);
    g.risk = tank(narrow ? 12.4 : 17.956, tw, y(20.3), y(65), false, 17);
    g.safe = tank(narrow ? 23.7 : 31.088, tw, y(20.3), y(65), true, 17);
    g.bf = tank(narrow ? 31.5 : 41.54, tw, y(20.3), y(65), true, 17);
    g.house = tank(narrow ? 39.3 : 52.26, tw, y(20.3), y(65), false, 17);
    const cc = g.colC = (g.risk.x + tw + g.safe.x) / 2;
    g.col = { x: cc - 1, w: 2, y0: 6.55, y1: 27.5 };
    g.man = { x0: g.risk.x + tw - 1.45, x1: g.safe.x + 1.5, y: 5.95, w: 1.45 };
    g.dial = { cx: cc, cy: 5.95, r: 1.2 };
    g.realloc = { x0: g.risk.x + tw - 0.6, x1: g.safe.x + 0.5, y: 18.25, h: 1.3, wl: cc - 1.85, wr: cc + 1.9 };
    g.dist = { y: 22.45, l: cc - 1.85, r: cc + 1.85 };
    g.filter = { x: cc - 4.27, y: y(74.4), w: 3.85, h: 6.9 };
    g.reg = { x: g.filter.x + 3.6, y: 27.3, w: 3.8, h: 4.15 };
    g.regTrack = { x: g.reg.x + g.reg.w - 1.05, y0: 28.0, y1: 31.1 };
    g.pipe = { y: 27.64, h: 3.4 };
    g.pipe.c = g.pipe.y + g.pipe.h / 2;
    g.end = { x: narrow ? 44.75 : 60.97 };
    g.life = { x0: g.filter.x + 7.24, x1: g.end.x + 0.55 };
    g.outlet = { cx: g.inc.x + g.inc.w * 0.47 };
    g.incPipe = { x0: g.outlet.cx + 1.4, x1: g.filter.x + 0.45 };
    g.inlet = { cx: g.inc.x + g.inc.w * 0.29, w: 2.3, y0: y(12.2) };
    g.qp = { y: 6.55, x0: g.inlet.cx + 0.9, x1: g.risk.x + 1.35, h: 1.45 };
    g.debtBand = { x0: x(47.4), x1: g.bf.cx - 1.2 };
    g.bcf = { x0: x(70), x1: Math.min(x(70) + 14.5, g.life.x1) };
    g.remTrack = { x: g.bf.cx + 1.75, y0: 28.2, y1: 30.6 };
    g.chev = { y: 25.35, inc: g.outlet.cx + 2.6, col: cc + 1.55, bf: g.bf.cx + 1.6, house: g.house.cx + 1.6 };
    g.strip = { x: narrow ? 29.05 : 40.2, xp: narrow ? 26.3 : 40.2, y: 33.25, h: 2.9, wl: 21, wp: narrow ? 23.8 : 24 };
    g.stripLabel = { x: x(70.6) + 4.5, y: y(86.3) };
    g.purchase = { x: x(70), y: y(66.8), w: 14.4, h: 10 };
    g.ceil = { x: x(77.5), y: y(38.3), w: 8, h: 12.5, cy: y(27.2), ch: 4 };
    g.ss = { x: x(22.3), y: MH - 0.05 - 1.5, w: 11, h: 1.5, x2: x(38.8) };
    return g;
  }

  /* ---------- svg art helpers ---------- */
  const tube = (d, w, body) => `<path d="${d}" fill="none" stroke="${C.n3}" stroke-width="${n(w + 0.22)}" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${body || '#dde4ee'}" stroke-width="${n(w)}" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="#ffffff" stroke-opacity=".8" stroke-width="${n(w * 0.36)}" stroke-linejoin="round"/>`;
  const M = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + n(p[0]) + ',' + n(p[1])).join('');
  /** polyline with rounded corners (radius r em) */
  function roundPath(pts, r) {
    let d = `M${n(pts[0][0])},${n(pts[0][1])}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      if (i === pts.length - 1) { d += `L${n(p[0])},${n(p[1])}`; break; }
      const a = pts[i - 1], b = pts[i + 1];
      const la = Math.hypot(p[0] - a[0], p[1] - a[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
      const rr = Math.min(r, la / 2, lb / 2);
      const p1 = [p[0] - (p[0] - a[0]) / la * rr, p[1] - (p[1] - a[1]) / la * rr];
      const p2 = [p[0] + (b[0] - p[0]) / lb * rr, p[1] + (b[1] - p[1]) / lb * rr];
      d += `L${n(p1[0])},${n(p1[1])}Q${n(p[0])},${n(p[1])} ${n(p2[0])},${n(p2[1])}`;
    }
    return d;
  }
  function wheel(cx, cy, r, color, hub) {
    let spokes = '';
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      spokes += `M${n(cx)},${n(cy)}L${n(cx + Math.cos(a) * r * 0.86)},${n(cy + Math.sin(a) * r * 0.86)}`;
    }
    return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="none" stroke="${color}" stroke-width="${n(r * 0.26)}"/>` +
      `<path d="${spokes}" stroke="${color}" stroke-width="${n(r * 0.14)}" stroke-linecap="round"/>` +
      `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r * 0.3)}" fill="${hub || C.gold}" stroke="${color}" stroke-width="${n(0.05)}"/>`;
  }
  const tankBody = (t) => {
    const r = 0.8, x0 = t.x, x1 = t.x + t.w, y0 = t.top + 0.3, y1 = t.bot;
    return `M${n(x0)},${n(y0)}H${n(x1)}V${n(y1 - r)}Q${n(x1)},${n(y1)} ${n(x1 - r)},${n(y1)}H${n(x0 + r)}Q${n(x0)},${n(y1)} ${n(x0)},${n(y1 - r)}Z`;
  };
  const tankInner = (t) => {
    const r = 0.66, x0 = t.ix0, x1 = t.ix0 + t.iw, y0 = t.top + 0.5, y1 = t.base + 0.02;
    return `M${n(x0)},${n(y0)}H${n(x1)}V${n(y1 - r)}Q${n(x1)},${n(y1)} ${n(x1 - r)},${n(y1)}H${n(x0 + r)}Q${n(x0)},${n(y1)} ${n(x0)},${n(y1 - r)}Z`;
  };
  function tankBack(t, id) {
    const sh = `<ellipse cx="${n(t.cx)}" cy="${n(t.feet + 0.02)}" rx="${n(t.w * 0.64)}" ry="${n(0.42)}" fill="rgba(13,30,58,.11)"/>`;
    const fw = Math.min(1.1, t.w * 0.14);
    const feet = `<rect x="${n(t.x + 0.6)}" y="${n(t.bot - 0.2)}" width="${n(fw)}" height="${n(t.feet - t.bot + 0.2)}" rx="${n(0.14)}" fill="${C.n3}"/>` +
      `<rect x="${n(t.x + t.w - 0.6 - fw)}" y="${n(t.bot - 0.2)}" width="${n(fw)}" height="${n(t.feet - t.bot + 0.2)}" rx="${n(0.14)}" fill="${C.n3}"/>`;
    return sh + feet + `<path d="${tankBody(t)}" fill="url(#${id}body)"/>`;
  }
  function tankFront(t, id) {
    const hl = `<rect x="${n(t.x + t.w * 0.13)}" y="${n(t.top + 0.9)}" width="${n(Math.max(0.5, t.w * 0.08))}" height="${n(t.bot - t.top - 2)}" rx="${n(0.25)}" fill="#ffffff" fill-opacity=".38"/>`;
    let ticks = '';
    [25, 50, 75].forEach((k) => { const yy = t.base - HF * k / 100; ticks += `M${n(t.ix0 + t.iw - 0.55)},${n(yy)}H${n(t.ix0 + t.iw - 0.05)}`; });
    const out = `<path d="${tankBody(t)}" fill="none" stroke="${C.n3}" stroke-width="${n(0.11)}"/>`;
    const rim = `<rect x="${n(t.x - 0.2)}" y="${n(t.top)}" width="${n(t.w + 0.4)}" height="${n(0.56)}" rx="${n(0.2)}" fill="url(#${id}rim)"/>`;
    const lid = t.lid ? `<path d="M${n(t.x - 0.12)},${n(t.top + 0.12)}Q${n(t.cx)},${n(t.top - 1.35)} ${n(t.x + t.w + 0.12)},${n(t.top + 0.12)}Z" fill="url(#${id}rim)"/>` +
      `<rect x="${n(t.cx - 0.45)}" y="${n(t.top - 1.02)}" width="${n(0.9)}" height="${n(0.42)}" rx="${n(0.12)}" fill="${C.n3}"/>` : `<rect x="${n(t.x + 0.05)}" y="${n(t.top + 0.5)}" width="${n(t.w - 0.1)}" height="${n(0.2)}" fill="${C.n2}" fill-opacity=".18"/>`;
    return hl + `<path d="${ticks}" stroke="${C.ink}" stroke-opacity=".22" stroke-width="${n(0.07)}"/>` + out + rim + lid;
  }
  /** a fill: full-height rect inside the tank, moved by transform (bottom-anchored at t.base) */
  const fillRect = (t, k, fill, extra) => `<rect data-k="${k}" class="lib-pem-f" x="${n(t.ix0)}" y="${n(t.base - HF - 0.6)}" width="${n(t.iw)}" height="${n(HF + 3)}" fill="${fill}" ${extra || ''}/>`;

  /* ---------- storyboards (spec table "Storyboard animations"; b = timeline builder) ---------- */
  const INC = ['incomeToFilter', 'incomeTaxOut'];
  const STORIES = {
    AF2FillTanks: (b) => { b.on(INC.concat(['filterToSafeThin', 'filterToRiskThin', 'incomeToQP'])); b.tw('safe', 0, 33, 3000).off(INC.concat(['filterToSafeThin', 'filterToRiskThin'])); b.tw('risk', 0, 33, 3000).off(['incomeToQP']); },
    AF2GrowTanks: (b) => { b.tw('safe', 33, 67, 3000); b.tw('risk', 33, 67, 3000); },
    AF2FundOutflow: (b) => { b.on(['safeToFilter', 'riskToFilter', 'futureToOutflow']); b.tw('safe', 67, 0, 5000); b.tw('risk', 67, 0, 5000); },
    DIF1HaveJob: (b) => { b.on(['incomeToFilter']); },
    DIF1HaveJobPayTaxes: (b) => { b.on(INC); },
    DIF1SaveForRetirement: (b) => { b.on(INC.concat(['filterToSafeThin', 'incomeToQP'])); b.tw('safe', 0, 8, 5000); b.tw('riskPreTax', 0, 50, 5000); },
    DIFSpendTheRest: (b) => { b.on(INC.concat(['filterToOutflow', 'filterToSafeThin', 'incomeToQP'])); },
    DIF2ExhaustSavings: (b) => {
      b.on(['futureToOutflow', 'safeToFilter']);
      b.tw('safe', 8, 0, 2000).off(['safeToFilter']).wait(2000).on(['riskToFilter', 'tankTaxOut'])
        .tw('riskPreTax', 50, 0, 5000).off(['riskToFilter', 'tankTaxOut', 'futureToOutflow']).set('regulator', 0);
    },
    DIF2BorrowToLimit: (b) => { b.on(['borrowedToOutflow']); b.set('disabilityBand', 100); b.tw('borrow', 0, 33, 4000).set('disabilityBand', 0).off(['borrowedToOutflow']); },
    DIF3RestoreIncome: (b) => { b.on(INC.concat(['filterToOutflow', 'filterToSafeThin'])); },
    DIF3SavingContinues: (b) => { b.on(INC.concat(['filterToOutflow', 'filterToSafeThin'])); b.tw('safe', 8, 70, 10000); b.tw('riskPreTax', 50, 60, 10000); },
    DIF4FinalState: (b) => { b.on(INC.concat(['filterToOutflow', 'filterToSafeThin'])); },
    CPFreeMoney: (b) => { b.set('freeMoney', true); b.at(2000).do((x) => x.shrinkPicture(true)); b.onStop((x) => { x.shrinkPicture(false); x.state.freeMoney = false; }); },
    CPFoundMoney: (b) => { b.on(INC.concat(['filterToMCP'])); },
    CPStudentLoan: (b) => { b.on(['borrowedToMCP']); b.tw('borrow', 0, 60, 5000); },
    CPPayCash: (b) => { b.on(['safeToFilter', 'futureToMCP']); b.tw('safe', 30, 0, 2000); },
    Debt1Income: (b) => { b.on(['incomeToFilter']); },
    Debt1PayTax: (b) => { b.on(INC); },
    Debt1SpendAll: (b) => { b.on(INC.concat(['filterToOutflow'])); },
    Debt1ExtraCashflow: (b) => { b.on(INC.concat(['filterToOutflow'])); b.tw('borrow', 33.3, 0, 5000).set('remaining', 100); },
    Debt1DebtSpiral: (b) => {
      b.on(INC.concat(['filterToOutflow']));
      b.tw('borrow', 0, 33.3, 2000).wait(2000).tw('borrow', null, 66.6, 1000).wait(2000).tw('borrow', null, 100, 1000);
      b.at(4000).tw('remaining', 75, 50, 1000).wait(2000).tw('remaining', null, 0, 1000);
      b.at(8000).off(['filterToOutflow']).on(['filterToBorrowed']);
    },
    F101PayCash: (b) => { b.tw('safe', 50, 0, 1000); },
    F101RepayLoanCashflow: (b) => { b.on(['incomeToFilter', 'filterToBorrowed', 'incomeTaxOut']); },
    F101RepayTankCashflow: (b) => { b.on(['incomeToFilter', 'filterToSafe', 'incomeTaxOut']); },
    MCPLoan: (b) => { b.on(['borrowedToMCP']); b.tw('borrow', 0, 30, 2000).set('remaining', 90); },
    MCPPayCash: (b) => { b.on(['safeToFilter', 'futureToMCP']); b.tw('safe', 30, 0, 2000); },
    MCPPayCashPayback: (b) => { b.on(INC.concat(['filterToSafe'])); b.tw('safe', 0, 30, 5000).off(INC.concat(['filterToSafe'])); },
    MCPPayCashOppCost: (b) => { b.on(INC.concat(['filterToSafe'])); b.tw('safe', 30, 40, 3000).off(INC.concat(['filterToSafe'])); },
    MTGSaveForDownPayment: (b) => { b.on(INC.concat(['filterToSafe'])); b.tw('safe', 0, 10, 5000); },
    MTGSaveForPayCash: (b) => { b.on(INC.concat(['filterToSafe'])); b.tw('safe', 0, 50, 15000); },
    MTGBuyHouse: (b) => { b.tw('house', 0, 50, 1000); },
    MTGDownPayment: (b) => { b.on(['safeToFilter', 'futureToHouse']); b.tw('safe', 10, 0, 4000); },
    MTGGetMortgage: (b) => { b.on(['borrowedToHouse']); b.tw('borrow', 0, 40, 4000); },
    MTGMaxDown: (b) => { b.on(['safeToFilter', 'futureToHouse']); b.tw('safe', 50, 0, 4000); b.tw('house', 0, 50, 4000); },
    PRS2DemoStrategy: (b) => {
      const F = INC.concat(['filterToSafe', 'filterToOutflow']);
      b.on(F); b.tw('safe', 0, 100, 20000);
      let c = b.at(10000);
      for (let i = 0; i < 3; i++) {
        c = c.on(['borrowedOut']).tw('borrow', 0, 30, 4000).off(['borrowedOut']).on(['borrowedIn']).set('remaining', 90)
          .tw('borrow', 30, 0, 4000).off(['borrowedIn']).set('remaining', 100);
      }
      c.off(F);
    },
    PLFFundPolicy: (b) => { b.on(INC.concat(['filterToSafe'])); b.tw('safe', 0, 50, 5000); },
    PLFTakeLoan: (b) => { b.tw('borrow', 0, 25, 1000); },
    PLFTakeLoanInv: (b) => { b.tw('borrow', 0, 25, 1000); b.tw('risk', 0, 25, 1000); },
    PLFRepayLoan: (b) => { b.on(INC.concat(['filterToSafe', 'filterToBorrowed'])); b.tw('safe', 50, 80, 10000); b.tw('borrow', 25, 0, 5000).off(['filterToBorrowed']); },
    PLFFundPolicyToMaturity: (b) => { b.on(INC.concat(['filterToSafe'])); b.tw('safe', 80, 100, 5000).off(INC.concat(['filterToSafe'])); },
    PLFGrowInvestment: (b) => { b.tw('risk', 25, 50, 2000); },
    PLForInvTakeLoan: (b) => { b.tw('borrow', 0, 20, 1000); b.tw('risk', 0, 20, 1000); b.onStop((x) => x.setNow({ borrow: 0, risk: 0 })); },
    MEPExtraToLoan: (b) => { b.on(INC.concat(['filterToBorrowed'])); },
    MEPExtraToRiskTank: (b) => { b.on(INC.concat(['filterToBorrowed', 'filterToRisk'])); },
    MEPExtraToSafeTank: (b) => { b.on(INC.concat(['filterToBorrowed', 'filterToSafe'])); },
    MEPLifestyleOnly: (b) => { b.on(INC.concat(['filterToOutflow'])); },
    MEPLifestylePlusLoan: (b) => { b.on(INC.concat(['filterToOutflow', 'filterToBorrowed'])); },
    MEPExtraToLoanRun: () => {}, MEPExtraToRiskTankRun: () => {}, MEPExtraToSafeTankRun: () => {},
    QPContribution: (b) => { b.on(['incomeToQP']); b.tw('riskPreTax', 0, 60, 10000); },
    QPTaxes0to40: (b) => { b.tw('riskKeep', 100, 60, 2000); },
    QPTaxes40to20: (b) => { b.tw('riskKeep', 60, 80, 3000); },
    QPTaxes20to60: (b) => { b.tw('riskKeep', 80, 40, 3000); },
    QPTaxableDistribution: (b) => { b.on(['riskToFilter', 'futureToOutflow', 'tankTaxOut']); b.tw('riskPreTax', 60, 10, 10000); },
    QPCompanyMatch: (b) => { b.on(['incomeToQP']); b.tw('riskPreTax', 60, 70, 2000).off(['incomeToQP']); },
    RMSoLShortfall: (b) => { b.on(['borrowedToOutflow']); b.tw('borrow', 0, 10, 2000); },
    RMHomeImprovement: (b) => { b.on(['borrowedToHouse']); b.tw('borrow', 10, 20, 2000); },
    RMSpend: (b) => { b.on(['borrowedToOutflow']); b.tw('borrow', 20, 30, 2000); },
    RMIncreasingLoan: (b) => { b.on(['borrowedToOutflow']); b.tw('borrow', 10, 20, 5000); },
    RMAppreciation: (b) => { b.on(['borrowedToOutflow']); b.tw('house', 60, 80, 3000); b.tw('creditLine', 30, 40, 3000); },
    RMSellHouse: (b) => {
      b.on(['incomeToFilter', 'filterToSafe', 'filterToBorrowed']);
      b.tw('house', 80, 0, 3000).off(['incomeToFilter', 'filterToSafe']);
      b.tw('borrow', 20, 0, 1000).off(['filterToBorrowed']).tw('safe', 0, 60, 2000);
    },
    RMUpsideDown: (b) => { b.tw('house', 0, 33, 50); b.tw('borrow', 0, 50, 50); b.tw('safe', 60, 0, 50); },
    RMLoanReplacement: (b) => { b.tw('borrow', 10, 0, 1000).tw('borrow', 0, 10, 1000); },
    RMAccess: (b) => { b.on(['borrowedToOutflow']); b.tw('borrow', 10, 30, 5000); },
    RMEquityLine: (b) => { b.on(['borrowedToOutflow']); b.tw('borrow', 0, 5, 500).off(['borrowedToOutflow']).wait(1500).on(['borrowedToOutflow']).tw('borrow', null, 10, 500).off(['borrowedToOutflow']); },
    RMMonthlyIncome: (b) => { b.set('safe', 0); b.on(['borrowedToOutflow']); b.tw('borrow', 0, 20, 10000); },
    RMLumpSum: (b) => { b.on(['incomeToFilter', 'filterToSafe']); b.tw('borrow', 0, 30, 2000).off(['incomeToFilter', 'filterToSafe']); b.tw('safe', 0, 30, 2000); },
    RMGrowLOC: (b) => {
      b.tw('creditLine', 35, 50, 3000).tw('creditLine', null, 70, 2000);
      b.tw('house', 70, 85, 5000);
      b.set('borrow', 17.5); b.at(3000).on(['incomeToFilter', 'filterToBorrowed']).tw('borrow', 17.5, 10, 2000).off(['incomeToFilter', 'filterToBorrowed']);
    },
    RMHeirsProtected: (b) => { b.tw('borrow', 10, 70, 500); b.tw('house', 85, 40, 2000); },
    SSWCDebtorBorrow: (b) => {
      let c = b.at(0);
      for (let i = 0; i < 2; i++) {
        c = c.on(['borrowedOut']).tw('borrow', 0, 30, 1000).off(['borrowedOut']).on(['borrowedIn']).set('remaining', 80)
          .tw('borrow', 30, 0, 4000).off(['borrowedIn']).set('remaining', 100);
      }
      c.on(['borrowedOut']).tw('borrow', 0, 60, 1000).off(['borrowedOut']).on(['borrowedIn']).set('remaining', 70)
        .tw('borrow', 60, 0, 15000).off(['borrowedIn']).set('remaining', 100);
    },
    SSWCSaverEmergencyFund: (b) => { b.on(['mcpIn']); b.set('mcpRemaining', 80); b.tw('house', 0, 30, 4000).off(['mcpIn']).set('mcpRemaining', 100); },
    SSWCSaverPayCash: (b) => { b.on(['mcpOut']); b.tw('house', 30, 0, 1000).off(['mcpOut']); },
    SSWCWCBorrow: (b) => { b.on(['borrowedOut']); b.tw('borrow', 0, 30, 1000).off(['borrowedOut']); },
    SSWCWCPayLoan: (b) => { b.on(['borrowedIn']); b.set('remaining', 80); b.tw('borrow', 30, 0, 4000).off(['borrowedIn']).set('remaining', 100); b.tw('safe', 50, 60, 4000); },
    TAIncome: (b) => { b.on(INC); },
    TASavingInTanks: (b) => { b.on(INC.concat(['filterToSafe'])); b.tw('safe', 10, 40, 3000); },
    TATaxableGrowth: (b) => { b.tw('safe', 40, 60, 2000); b.tw('safeTaxable', 40, 70, 2000); },
    TATaxableGrowthFromAccount: (b) => {
      let c = b.at(0); const st = [10, 20, 16, 36, 28, 58, 46, 86, 70];
      for (let i = 1; i < st.length; i++) c = c.tw('safeTaxable', st[i - 1], st[i], 2000);
      b.tw('safe', 10, 16, 2000).wait(2000).tw('safe', 16, 28, 2000).wait(2000).tw('safe', 28, 46, 2000).wait(2000).tw('safe', 46, 70, 2000);
      [2000, 6000, 10000, 14000].forEach((t) => { b.at(t).on(['safeToFilter', 'tankTaxOut']); b.at(t + 2000).off(['safeToFilter', 'tankTaxOut']); });
    },
    TATaxableGrowthFromLifestyle: (b) => {
      b.tw('safeTaxable', 10, 20, 2000).wait(2000).tw('safeTaxable', 20, 40, 2000).wait(2000).tw('safeTaxable', 40, 70, 2000);
      const sv = [10, 16, 20, 32, 40, 52, 70]; let c = b.at(0);
      for (let i = 1; i < sv.length; i++) c = c.tw('safe', sv[i - 1], sv[i], 2000);
      [2000, 6000, 10000].forEach((t) => { b.at(t).set('regulator', 70).on(INC); b.at(t + 2000).set('regulator', 80).off(INC); });
    }
  };
  const STORY_NAMES = Object.keys(STORIES);

  /* ---------- jump return memory: the PEM saves its state before a link jump and restores it on return ---------- */
  const RETURNS = [];

  /* ---------- styles ---------- */
  EFA.css('lib-pem', `
  .lib-pem { position: absolute; inset: 0; overflow: hidden; color: ${C.ink}; font-family: "DM Sans", system-ui, sans-serif; -webkit-user-select: none; user-select: none; }
  .lib-pem-win { position: absolute; left: 0; top: 0; overflow: hidden; }
  .lib-pem-model { position: absolute; left: 0; top: 0; transform-origin: 0 0; transition: transform .6s cubic-bezier(.45,.05,.2,1); }
  .lib-pem-svg { position: absolute; left: 0; top: 0; width: 100%; height: 100%; overflow: visible; }
  .lib-pem-f, .lib-pem-tr { transition-property: transform; transition-duration: .8s; transition-timing-function: ease; }
  .lib-pem-sx { transform-box: fill-box; transform-origin: 50% 50%; transition: transform .8s ease; }
  .lib-pem-g { transition: opacity .5s ease; }
  .lib-pem-off { opacity: 0 !important; }
  .lib-pem .lib-pem-off, .lib-pem .lib-pem-off * { pointer-events: none !important; }
  .lib-pem-h { position: absolute; inset: 0; pointer-events: none; }
  .lib-pem-l { position: absolute; left: 0; top: 0; white-space: nowrap; pointer-events: none; font-weight: 700; line-height: 1.2; color: ${C.ink}; transition: opacity .5s ease, transform .8s ease; }
  .lib-pem-at { position: absolute; left: 0; top: 0; }
  .lib-pem-c { width: 0; display: flex; justify-content: center; text-align: center; }
  .lib-pem-r { width: 0; display: flex; justify-content: flex-end; text-align: right; }
  .lib-pem-l > span { white-space: nowrap; }
  .lib-pem-ttl { font: 600 1.12em/1.05 "Cormorant Garamond", Georgia, serif; letter-spacing: .01em; color: ${C.ink}; }
  .lib-pem-mark { font: 700 1.5em/1 "DM Sans", sans-serif; letter-spacing: .24em; text-transform: uppercase; color: ${C.ink}; opacity: .13; }
  .lib-pem.is-sg .lib-pem-mark { opacity: .07; }
  .lib-pem-cap { font: 700 .5em/1.15 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: ${C.muted}; }
  .lib-pem-sm { font: 700 .72em/1.2 "DM Sans", sans-serif; letter-spacing: .02em; }
  .lib-pem-xs { font: 700 .54em/1.25 "DM Sans", sans-serif; letter-spacing: .09em; text-transform: uppercase; }
  .lib-pem-in { color: ${C.cream}; text-shadow: 0 1px 1px rgba(8,20,42,.35); }
  .lib-pem-pill { display: inline-flex; align-items: center; gap: .3em; padding: .12em .45em; background: ${C.paper}; border: .04em solid ${C.rule}; border-radius: .32em; box-shadow: 0 .06em .2em rgba(13,30,58,.12); font: 700 .7em/1.15 "DM Sans", sans-serif; color: ${C.ink}; font-variant-numeric: lining-nums tabular-nums; white-space: nowrap; }
  .lib-pem-pill.box { border-color: ${C.n4}; }
  .lib-pem-pill .lib-pem-cap { font-size: .72em; }
  .lib-pem-stack { display: grid; justify-items: center; gap: .12em; }
  .lib-pem-link { pointer-events: auto; cursor: pointer; }
  .lib-pem-link:hover { color: ${C.goldDeep}; }
  .lib-pem-lender { color: ${C.goldDeep}; text-decoration: underline; text-decoration-thickness: .06em; text-underline-offset: .12em; font-size: .62em; }
  .lib-pem-hot { position: absolute; pointer-events: auto; cursor: pointer; border-radius: .5em; }
  .lib-pem-hot:hover { background: rgba(184,151,46,.12); box-shadow: 0 0 0 .08em rgba(184,151,46,.45) inset; }
  .lib-pem-hint { position: absolute; width: 1em; height: 1em; color: ${C.ink}; opacity: .22; pointer-events: auto; cursor: pointer; transition: opacity .3s ease; }
  .lib-pem-hint:hover { opacity: .6; }
  .lib-pem-hint.deco { pointer-events: none; }
  .lib-pem-hint svg, .lib-pem-chev svg, .lib-pem-btn svg { width: 100%; height: 100%; display: block; }
  .lib-pem-chev { position: absolute; width: 1.05em; height: 1.05em; padding: .1em; border-radius: 50%; color: ${C.n4}; opacity: .45; pointer-events: auto; cursor: pointer; transition: opacity .3s ease, background .3s ease; }
  .lib-pem-chev:hover { opacity: 1; background: ${C.goldPale}; }
  .lib-pem-knob { position: absolute; left: 0; top: 0; width: 1.1em; height: 1.1em; margin: -.55em 0 0 -.55em; pointer-events: auto; cursor: ns-resize; touch-action: none; transition: transform .8s ease, opacity .5s ease; }
  .lib-pem-knob::after { content: ""; position: absolute; inset: .07em; border-radius: 50%; background: ${C.gold}; border: .1em solid ${C.paper}; box-shadow: 0 .08em .25em rgba(13,30,58,.35); transform: scale(.7); transition: transform .15s ease; }
  .lib-pem-knob.h { cursor: ew-resize; }
  .lib-pem-knob:hover::after, .lib-pem-knob.is-drag::after { transform: scale(1); }
  .lib-pem-knob.is-drag { transition: none; }
  .lib-pem-flow { fill: none; stroke-linecap: round; stroke-linejoin: round; transition: opacity .45s ease; animation: lib-pem-march 1s linear infinite; }
  @keyframes lib-pem-march { from { stroke-dashoffset: 56; } to { stroke-dashoffset: 0; } }
  .lib-pem-ring { position: absolute; border: .16em solid ${C.gold}; border-radius: .7em; box-shadow: 0 0 0 .32em rgba(184,151,46,.18), 0 0 1.4em rgba(184,151,46,.4); pointer-events: none; transition: opacity .3s ease; }
  .lib-pem-ring.wink { animation: lib-pem-wink 1.5s linear both; }
  @keyframes lib-pem-wink { 0%, 16% { opacity: 0; } 17%, 33% { opacity: 1; } 34%, 50% { opacity: 0; } 51%, 66% { opacity: 1; } 67%, 83% { opacity: 0; } 84%, 100% { opacity: 1; } }
  .lib-pem-placed { position: absolute; pointer-events: none; }
  .lib-pem-tip { position: absolute; z-index: 20; max-width: 22em; padding: .5em .75em; background: ${C.ink}; color: ${C.cream}; border: 1px solid rgba(213,189,104,.45); border-radius: .5em; font: 500 15px/1.4 "DM Sans", sans-serif; box-shadow: 0 10px 26px rgba(8,20,42,.3); pointer-events: auto; white-space: pre-line; opacity: 0; transition: opacity .2s ease; }
  .lib-pem-tip.show { opacity: 1; }
  .lib-pem-tip [data-cp] { color: inherit; }
  .lib-pem-sc { display: grid; gap: .3em; pointer-events: auto; font-size: .64em; }
  .lib-pem-sc-b { display: inline-flex; align-items: center; justify-content: space-between; gap: .4em; width: 15.6em; padding: .32em .6em; background: ${C.paper}; border: .06em solid ${C.mist2}; border-radius: .45em; font: 600 1em/1.15 "DM Sans", sans-serif; color: ${C.ink}; cursor: pointer; box-shadow: 0 .1em .3em rgba(13,30,58,.08); }
  .lib-pem-sc-b svg { width: 1.1em; height: 1.1em; flex: none; }
  .lib-pem-sc-list { position: absolute; left: 0; bottom: calc(100% + .3em); width: 15.6em; display: none; padding: .3em; background: ${C.paper}; border: .06em solid ${C.mist2}; border-radius: .5em; box-shadow: 0 .6em 1.6em rgba(13,30,58,.18); z-index: 6; }
  .open .lib-pem-sc-list, body.editing .lib-pem-sc-list { display: grid; }
  .lib-pem-sc-i { display: block; text-align: left; padding: .3em .5em; border: 0; border-radius: .35em; background: transparent; font: 600 1em/1.2 "DM Sans", sans-serif; color: ${C.ink}; cursor: pointer; }
  .lib-pem-sc-i:hover, .lib-pem-sc-i[aria-current="true"] { background: ${C.goldPale}; }
  .lib-pem-ck { display: inline-flex; align-items: center; gap: .45em; cursor: pointer; font: 600 1em/1.2 "DM Sans", sans-serif; color: ${C.ink}; pointer-events: auto; background: none; border: 0; padding: 0; }
  .lib-pem-ck i { width: 1.05em; height: 1.05em; border: .1em solid ${C.n4}; border-radius: .22em; display: grid; place-items: center; background: ${C.paper}; flex: none; }
  .lib-pem-ck i svg { width: .85em; height: .85em; color: ${C.paper}; opacity: 0; }
  .lib-pem-ck[aria-checked="true"] i { background: ${C.n4}; }
  .lib-pem-ck[aria-checked="true"] i svg { opacity: 1; }
  .lib-pem-src { display: grid; gap: .25em; pointer-events: auto; font-size: .58em; }
  .lib-pem-src-b { padding: .3em .7em; border-radius: 999px; border: .08em solid ${C.n4}; background: ${C.paper}; font: 700 1em/1.1 "DM Sans", sans-serif; color: ${C.ink}; cursor: pointer; }
  .lib-pem-src-b[aria-pressed="true"] { background: ${C.gold}; border-color: ${C.gold}; }
  .lib-pem-src-g { display: grid; grid-template-columns: auto auto; gap: .2em .7em; }
  .lib-pem-rad { display: inline-flex; align-items: center; gap: .35em; cursor: pointer; background: none; border: 0; padding: 0; font: 600 1em/1.2 "DM Sans", sans-serif; color: ${C.ink}; }
  .lib-pem-rad i { width: .9em; height: .9em; border-radius: 50%; border: .1em solid ${C.n4}; background: ${C.paper}; flex: none; }
  .lib-pem-rad[aria-checked="true"] i { background: radial-gradient(circle, ${C.n4} 0 42%, ${C.paper} 46%); }
  .lib-pem-box { position: absolute; background: ${C.paper}; border: .07em solid ${C.mist2}; border-radius: .7em; box-shadow: 0 .5em 1.4em rgba(13,30,58,.16); pointer-events: auto; display: grid; grid-template-rows: auto 1fr; overflow: hidden; }
  .lib-pem-box-h { display: flex; align-items: center; justify-content: space-between; gap: .4em; padding: .35em .5em .3em .7em; background: ${C.ink}; color: ${C.cream}; font: 600 .78em/1.15 "Cormorant Garamond", Georgia, serif; }
  .lib-pem-box-h [data-cp] { cursor: pointer; }
  .lib-pem-btn { width: 1.15em; height: 1.15em; padding: .1em; border: 0; border-radius: 50%; background: transparent; color: inherit; cursor: pointer; flex: none; }
  .lib-pem-btn:hover { background: rgba(247,245,241,.15); }
  .lib-pem-box-b { position: relative; display: grid; place-items: center; padding: .4em; }
  .lib-pem-box-b .ill { width: 100%; height: 7.4em; transition: height 2s ease; }
  .lib-pem-box.shrink .lib-pem-box-b .ill { height: 4.6em; }
  .lib-pem-calc { position: absolute; right: .45em; bottom: .4em; width: 1.6em; height: 1.6em; padding: .2em; border-radius: .35em; border: .06em solid ${C.mist2}; background: ${C.paper}; color: ${C.n4}; cursor: pointer; }
  .lib-pem-calc:hover { border-color: ${C.gold}; color: ${C.goldDeep}; }
  .lib-pem-tbl { padding: .45em .6em .5em; background: ${C.paper}; border: .06em solid ${C.mist2}; border-radius: .55em; box-shadow: 0 .4em 1.1em rgba(13,30,58,.14); font-size: .56em; line-height: 1.25; display: grid; gap: .12em; min-width: 13.4em; }
  .lib-pem-tbl h4 { margin: 0 0 .15em; font: 700 .9em/1.2 "DM Sans", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${C.goldDeep}; text-align: center; }
  .lib-pem-tbl .row { display: flex; justify-content: space-between; gap: .9em; font-weight: 600; }
  .lib-pem-tbl .row.tot { border-top: .08em solid ${C.rule}; padding-top: .15em; font-weight: 700; }
  .lib-pem-mcpin { width: 10.6em; padding: .15em .3em; border: .06em solid ${C.mist2}; border-radius: .3em; background: ${C.paper}; font: 600 .62em/1.2 "DM Sans", sans-serif; color: ${C.ink}; text-align: center; pointer-events: auto; }
  .lib-pem-mcpin:focus { outline: none; border-color: ${C.gold}; }
  .lib-pem-bars { position: absolute; pointer-events: auto; }
  .lib-pem-bar { position: absolute; left: 0; right: 0; display: flex; border: .04em solid rgba(13,30,58,.18); box-sizing: border-box; transition: bottom .5s ease, height .5s ease; overflow: hidden; }
  .lib-pem-bar i { display: block; height: 100%; }
  .lib-pem-bar span { position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%); text-align: center; font: 700 .52em/1.1 "DM Sans", sans-serif; color: ${C.ink}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 .2em; }
  .lib-pem-bar.rmd span { color: ${C.brick}; }
  .lib-pem-badge { width: 1.5em; height: 1.5em; border-radius: 50%; background: ${C.ink}; color: ${C.cream}; display: grid; place-items: center; font: 700 .8em/1 "DM Sans", sans-serif; border: .1em solid ${C.gold}; }
  .lib-pem-tog { position: absolute; width: 30px; height: 30px; padding: 5px; border-radius: 8px; border: 1px solid ${C.rule}; background: rgba(255,253,248,.9); color: ${C.muted}; cursor: pointer; z-index: 8; transition: color .2s ease, border-color .2s ease; }
  .lib-pem-tog:hover { color: ${C.ink}; border-color: ${C.gold}; }
  .lib-pem-tog svg { width: 100%; height: 100%; display: block; }
  .lib-pem-bounce { animation: lib-pem-bounce 1s ease-in-out infinite alternate; }
  @keyframes lib-pem-bounce { from { transform: translateY(0); } to { transform: translateY(2.55em); } }
  body.editing .lib-pem [data-cp] { pointer-events: auto; }
  @media (prefers-reduced-motion: reduce) { .lib-pem-flow, .lib-pem-bounce, .lib-pem-ring.wink { animation: none !important; } }
  `);

  /* =====================================================================================
     mount
     ===================================================================================== */
  function mount(ctx, host, cfg) {
    cfg = Object.assign({}, cfg || {});
    if (host == null) host = ctx.el;
    else if (typeof host === 'string') host = ctx.el.querySelector(host);
    if (!host) throw new Error('EFA.lib.pem.mount: host element not found');
    const id = 'lp' + (++SEQ);
    const S = JSON.parse(JSON.stringify(DEF));
    const flows = {};
    FLOW_NAMES.forEach((f) => { flows[f] = false; });
    const handlers = {};
    const runs = {};             // storyboard runs by name
    const rings = {};            // highlight rings
    let ringSeq = 0, animSeq = 0, dead = false;
    const copyMap = Object.assign({}, cfg.copy || {});
    const reviewed = ctx.variant === 'reviewed';
    let E = {};                  // dynamic elements by data-k
    let root, win, model, svg, hl, ui, tipEl, g;
    let DUR = 800, EASE = 'ease';
    let frame = null, expandedView = false, camera = null;
    const dims = {};

    /* ----- copy ----- */
    const t = (key, o) => {
      o = o || {};
      const hk = copyMap[key];
      if (hk) return EFA.cp(ctx.id, hk, o);
      return EFA.cp(SID, key, o);
    };
    const txt = (key) => {
      const hk = copyMap[key];
      if (hk) { const d = EFA.screens[ctx.id]; return EFA.wording.get(ctx.id, hk, d && d.copy[hk] != null ? d.copy[hk] : ''); }
      return EFA.wording.get(SID, key, COPY[key] != null ? COPY[key] : '');
    };

    /* ----- input normalisation ----- */
    function normalize(src) {
      const out = {}, fl = {}, sb = {};
      Object.keys(src || {}).forEach((k0) => {
        let k = k0, v = src[k0];
        if (IGNORED[k]) return;
        if (FLOW_ORIG[k]) { fl[FLOW_ORIG[k]] = !!v; return; }
        if (FLOW_NAMES.indexOf(k) >= 0 && !(k in DEF)) { fl[k] = !!v; return; }
        if (/^SB[A-Z]/.test(k) && STORIES[k.slice(2)]) { sb[k.slice(2)] = v; return; }
        if (ORIG[k]) k = ORIG[k];
        if (k === 'flows' && v && typeof v === 'object') { Object.assign(fl, v); return; }
        if (!(k in DEF)) return;
        if (k === 'collateral') v = COLL[v] || 'none';
        if (k === 'purchase') v = v ? String(v).toLowerCase() : null;
        if (k === 'narrow' && v !== 'auto') v = !!v;
        out[k] = v;
      });
      return { out, fl, sb };
    }

    /* ----- derived values (spec "Calculations"; the side effects on remaining/regulator apply here) ----- */
    function derive() {
      const D = {};
      const cap = (S.collateral === 'safe' && S.pli && S.lender !== 'other') ? Math.max(num(S.safe), num(S.safeTaxable)) : 100;
      const d = Math.min(cap, Math.max(num(S.borrow), num(S.otherDebt)));
      D.d = d; D.debt = LV(d);
      if (S.ceiling) S.remaining = 100 - d;
      else if (!S.loc && S.debtService) {
        let a = 0;
        if (num(S.borrow) > 0) a += 20;
        if (num(S.otherDebt) > 0 && num(S.otherDebt) > num(S.borrow)) a += 20;
        S.remaining = 100 - a;
      }
      const c = S.collateral === 'safe' ? Math.max(num(S.safe), num(S.safeTaxable)) : S.collateral === 'risk' ? Math.max(num(S.risk), num(S.riskPreTax)) : S.collateral === 'house' ? num(S.house) : 0;
      const b = Math.min(num(S.borrow), c);
      D.b = b; D.borrow = LV(b);
      D.fio = Math.max(0, D.debt - D.borrow);
      const inv = LV(S.risk), invRed = LV(S.riskPreTax), sav = LV(S.safe), savRed = LV(S.safeTaxable);
      const netRisk = inv + invRed * lv(S.riskKeep) / 100, netSafe = sav + savRed * (100 - lv(S.safeTax)) / 100;
      const other = S.collateral === 'safe' ? netRisk : S.collateral === 'risk' ? netSafe : netRisk + netSafe;
      D.debtWord = D.fio > other + 0.01 ? 'debt' : 'liability';
      if (S.opportunity) {
        const oppStart = Math.max(inv, invRed);
        D.opp = (S.lender == null || S.lender === 'other') ? clamp(oppStart + D.debt - num(S.debtStart), 0, 14) : clamp(oppStart + D.borrow - num(S.borrowStart), 0, 14);
      } else D.opp = 0;
      const s = num(S.safe);
      D.db = !S.pli || s < 0.1 ? 0 : s < 33.3 ? LV(s + 33.3) : LV(s + (100 - s) / 2);
      D.dd = 100 - num(S.remaining);
      if (S.ceiling) {
        if (num(S.ceilingTank) < 100) S.ceilingCredit = 0;
        const tk = lv(S.ceilingTank);
        S.regulator = Math.max(0, num(S.regulator) - D.dd) > tk ? Math.max(D.dd, tk + D.dd) : Math.min(100, tk + D.dd);
      }
      const reg = lv(S.regulator);
      D.reg = reg;
      D.fl = 1 - reg / 100;
      D.colFill = (S.rip && num(S.contribution) < 0.01) ? 0 : clamp(2 * D.fl, 0, 2);
      D.life = 0.034 * Math.max(0, reg - D.dd);
      D.mcp2 = 0.034 * Math.max(0, reg - D.dd - (100 - lv(S.mcpRemaining)));
      D.debtBand = Math.max(0, 0.034 * Math.min(reg, D.dd));
      D.bcf1 = S.ceiling ? 0.034 * lv(S.ceilingTank) : 0;
      D.bcf2 = 0.034 * lv(S.disabilityBand);
      D.ceilGreen = 0.125 * Math.max(0, reg - D.dd);
      D.ceilRed = 0.125 * lv(S.ceilingTank);
      D.ceilCredit = 0.04 * lv(S.ceilingCredit);
      const ang = clamp(num(S.diverter), -90, 90);
      D.toRisk = 0.5 - 0.5 * ang / 90; D.toSafe = 0.5 + 0.5 * ang / 90;
      return D;
    }

    /* ----- visibility ----- */
    function vis() {
      const v = {};
      v.income = !!S.showIncome;
      v.future = !!S.showFuture;
      v.risk = v.future && !!S.showRisk;
      v.safe = v.future && !!S.showSafe;
      v.col = v.future && !S.legacy;
      v.qp = v.income && !!S.showQP && !S.legacy && v.risk;
      v.bf = !!S.showBorrowed;
      v.house = !!S.showHouse && !S.ceiling;
      v.incPipe = v.income && !S.legacy;
      v.labels = !!S.labels;
      v.strip = !!S.lifestyleStrip;
      v.sg = !!S.stacked;
      return v;
    }

    /* ----- layout box ----- */
    function measure() {
      const bw = (cfg.box && cfg.box.w) || host.offsetWidth || (host === ctx.el ? ctx.W : 1600) || 1600;
      const bh = (cfg.box && cfg.box.h) || host.offsetHeight || (host === ctx.el ? ctx.H : 900) || 900;
      let narrow = S.narrow;
      if (narrow === 'auto') narrow = bw / bh < 1.6;
      const Wm = narrow ? 50 : 67;
      const pad = cfg.pad || (host === ctx.el ? [18, 40, 52, 40] : [0, 0, 0, 0]);
      const aw = Math.max(10, bw - pad[1] - pad[3]), ah = Math.max(10, bh - pad[0] - pad[2]);
      const em = cfg.em || Math.min(aw / Wm, ah / MH);
      Object.assign(dims, { bw, bh, narrow: !!narrow, Wm, em, pad });
      dims.ox = pad[3] + (aw - Wm * em) / 2;
      dims.oy = cfg.align === 'center' ? pad[0] + (ah - MH * em) / 2 : pad[0];
    }

    /* =================================================================================
       build the DOM (static art + every dynamic element, toggled later)
       ================================================================================= */
    function buildSVG() {
      const Wm = g.Wm, P2 = id;
      const T = { inc: g.inc, risk: g.risk, safe: g.safe, bf: g.bf, house: g.house };
      let defs = `<linearGradient id="${P2}body" x1="0" x2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dde3ec"/></linearGradient>
        <linearGradient id="${P2}rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.n4}"/><stop offset="1" stop-color="${C.n3}"/></linearGradient>
        <linearGradient id="${P2}navy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.n4}"/><stop offset="1" stop-color="${C.ink}"/></linearGradient>
        <linearGradient id="${P2}water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.water}"/><stop offset="1" stop-color="#86a5cf"/></linearGradient>
        <pattern id="${P2}hg" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="9" height="9" fill="${C.gold}"/><rect width="3.6" height="9" fill="${C.goldLt}" fill-opacity=".75"/></pattern>
        <pattern id="${P2}hs" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="9" height="9" fill="${C.sage}"/><rect width="3.6" height="9" fill="${C.sageLt}" fill-opacity=".7"/></pattern>
        <pattern id="${P2}ho" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><rect width="7" height="7" fill="${C.goldPale}"/><rect width="2" height="7" fill="${C.goldLt}"/></pattern>
        <pattern id="${P2}mesh" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${C.mist}"/><path d="M0 0V6M0 0H6" stroke="${C.n4}" stroke-opacity=".35" stroke-width="1.1"/></pattern>`;
      Object.keys(T).forEach((k) => { defs += `<clipPath id="${P2}c${k}"><path d="${tankInner(T[k])}"/></clipPath>`; });
      const lp = g.life, py = g.pipe.y, ph = g.pipe.h;
      defs += `<clipPath id="${P2}cpipe"><rect x="${n(lp.x0)}" y="${n(py + 0.12)}" width="${n(lp.x1 - lp.x0)}" height="${n(ph - 0.24)}"/></clipPath>`;
      defs += `<clipPath id="${P2}ccol"><rect x="${n(g.col.x + 0.12)}" y="${n(g.col.y0)}" width="${n(g.col.w - 0.24)}" height="${n(g.col.y1 - g.col.y0)}"/></clipPath>`;
      defs += `<clipPath id="${P2}cceil"><rect x="${n(g.ceil.x + 0.14)}" y="${n(g.ceil.y)}" width="${n(g.ceil.w - 0.28)}" height="${n(g.ceil.h - 0.1)}" rx="${n(0.5)}"/></clipPath>`;
      defs += `<clipPath id="${P2}ccred"><rect x="${n(g.ceil.x + 0.14)}" y="${n(g.ceil.cy)}" width="${n(g.ceil.w - 0.28)}" height="${n(g.ceil.ch - 0.1)}" rx="${n(0.5)}"/></clipPath>`;

      const grp = (k, body, extra) => `<g data-k="${k}" class="lib-pem-g" ${extra || ''}>${body}</g>`;
      const cc = g.colC, man = g.man, pc = g.pipe.c;
      let s = '';

      /* --- pipes behind the tanks --- */
      // qualified plan pipe (inlet -> top of RISK)
      s += grp('gQP', tube(roundPath([[g.inlet.cx, g.qp.y], [g.qp.x1, g.qp.y], [g.qp.x1, g.risk.top + 0.9]], 0.9), g.qp.h) +
        `<rect x="${n(g.inlet.cx + 1.25)}" y="${n(g.qp.y - 0.92)}" width="${n(0.32)}" height="${n(1.84)}" rx="${n(0.08)}" fill="${C.n3}"/>`);
      // manifold over the two reserve tanks, with its T into the column
      s += grp('gMan', tube(roundPath([[man.x0, g.risk.top + 0.9], [man.x0, man.y], [man.x1, man.y], [man.x1, g.safe.top - 0.2]], 0.9), man.w));
      // reallocation pipe between the reserve tanks (behind the column)
      const ra = g.realloc;
      s += grp('gRealloc', `<rect x="${n(ra.x0)}" y="${n(ra.y)}" width="${n(ra.x1 - ra.x0)}" height="${n(ra.h)}" rx="${n(0.25)}" fill="#e4e9f1" stroke="${C.n3}" stroke-width="${n(0.1)}"/>` +
        `<rect data-k="fRealloc" x="${n(ra.x0 + 0.1)}" y="${n(ra.y + 0.14)}" width="${n(ra.x1 - ra.x0 - 0.2)}" height="${n(ra.h - 0.28)}" rx="${n(0.18)}" fill="${C.gold}" class="lib-pem-g lib-pem-off"/>` +
        `<rect x="${n(ra.x0)}" y="${n(ra.y + 0.25)}" width="${n(ra.x1 - ra.x0)}" height="${n(0.3)}" fill="#fff" fill-opacity=".55"/>`);
      // legacy tube (legacy mode): from the income tank top to the column
      const legY = g.y(23.3) + 0.6;
      s += grp('gLegacy', tube(M([[g.inc.x + g.inc.w - 1.4, g.inc.top + 1.6], [g.inc.x + g.inc.w - 1.4, legY], [cc, legY]]), 1.1) +
        tube(M([[cc, legY], [cc, g.dist.y]]), 1.1) + wheel(g.x(24.6) + 0.6, legY, 0.62, C.n3) + wheel(g.x(44.3) + 0.2, legY, 0.62, C.n3));
      // income outlet elbow and income pipe
      const op = g.outlet.cx;
      s += grp('gIncPipe', tube(roundPath([[op, g.inc.bot - 0.4], [op, pc], [g.incPipe.x0 + 0.2, pc]], 1.6), ph) +
        `<rect x="${n(g.incPipe.x0)}" y="${n(g.pipe.y)}" width="${n(g.incPipe.x1 - g.incPipe.x0)}" height="${n(ph)}" fill="#dde4ee" stroke="${C.n3}" stroke-width="${n(0.11)}"/>` +
        `<rect x="${n(g.incPipe.x0)}" y="${n(g.pipe.y + 0.55)}" width="${n(g.incPipe.x1 - g.incPipe.x0)}" height="${n(ph * 0.3)}" fill="#fff" fill-opacity=".78"/>` +
        `<rect x="${n(g.incPipe.x0 - 0.1)}" y="${n(g.pipe.y - 0.28)}" width="${n(0.42)}" height="${n(ph + 0.56)}" rx="${n(0.1)}" fill="${C.n3}"/>`);
      // inlet stub into the income tank top
      const il = g.inlet;
      s += grp('gInlet', tube(M([[il.cx, il.y0 + 0.2], [il.cx, g.inc.top + 0.6]]), il.w - 0.3) +
        `<rect x="${n(il.cx - il.w / 2 - 0.2)}" y="${n(il.y0)}" width="${n(il.w + 0.4)}" height="${n(0.5)}" rx="${n(0.14)}" fill="url(#${P2}rim)"/>`);
      // borrowed and house down tubes into the lifestyle pipe
      const downTube = (cx, k) => grp(k, `<rect x="${n(cx - 1.1)}" y="${n(g.bf.bot - 0.3)}" width="${n(2.2)}" height="${n(g.pipe.y - g.bf.bot + 0.5)}" fill="#dde4ee" stroke="${C.n3}" stroke-width="${n(0.11)}"/>` +
        `<rect x="${n(cx - 0.55)}" y="${n(g.bf.bot - 0.3)}" width="${n(0.6)}" height="${n(g.pipe.y - g.bf.bot + 0.5)}" fill="#fff" fill-opacity=".75"/>` +
        `<rect x="${n(cx - 1.45)}" y="${n(g.pipe.y - 0.62)}" width="${n(2.9)}" height="${n(0.4)}" rx="${n(0.1)}" fill="${C.n3}"/>`);
      s += downTube(g.bf.cx, 'gBFTube') + downTube(g.house.cx, 'gHouseTube');

      /* --- lifestyle pipe with its bands --- */
      s += `<rect x="${n(lp.x0)}" y="${n(py)}" width="${n(lp.x1 - lp.x0)}" height="${n(ph)}" fill="#e2e8f1" stroke="${C.n3}" stroke-width="${n(0.11)}"/>`;
      const band = (k, x0, x1, fill, op2) => `<rect data-k="${k}" class="lib-pem-f" x="${n(x0)}" y="${n(py)}" width="${n(Math.max(0, x1 - x0))}" height="${n(ph + 0.4)}" fill="${fill}" fill-opacity="${op2 == null ? 1 : op2}"/>`;
      const hx = g.house.cx;
      s += `<g clip-path="url(#${P2}cpipe)">` +
        band('bDebt', g.debtBand.x0, g.debtBand.x1, C.brick, 0.62) +
        band('bLife', lp.x0, lp.x1, `url(#${P2}water)`) +
        band('bLifeMcp', lp.x0, hx, `url(#${P2}water)`) +
        band('bMcp2', hx, lp.x1, `url(#${P2}water)`) +
        band('bBcf1', g.bcf.x0, g.bcf.x1, C.brick, 0.72) +
        band('bBcf2', g.bcf.x0, g.bcf.x1, C.brick, 0.72) + `</g>`;
      s += `<rect x="${n(lp.x0)}" y="${n(py + 0.5)}" width="${n(lp.x1 - lp.x0)}" height="${n(ph * 0.26)}" fill="#fff" fill-opacity=".5"/>`;
      [g.bf.cx, hx].forEach((cx, i) => {
        s += grp(i ? 'gHouseFl' : 'gBFFl', [-1.25, 1.25].map((dx) => `<rect x="${n(cx + dx - 0.2)}" y="${n(py - 0.28)}" width="${n(0.4)}" height="${n(ph + 0.56)}" rx="${n(0.1)}" fill="${C.n3}"/>`).join(''));
      });
      // end cap: elbow turning down, with a drop
      const ex = g.end.x, ecx = ex + 3.35;
      s += tube(roundPath([[lp.x1 - 0.4, pc], [ecx, pc], [ecx, 32.5]], 1.7), ph);
      s += `<rect x="${n(lp.x1 - 0.55)}" y="${n(py - 0.28)}" width="${n(0.42)}" height="${n(ph + 0.56)}" rx="${n(0.1)}" fill="${C.n3}"/>`;
      s += `<rect x="${n(ecx - 1.95)}" y="${n(32.3)}" width="${n(3.9)}" height="${n(0.42)}" rx="${n(0.1)}" fill="${C.n3}"/>`;
      s += `<path d="M${n(ecx)},${n(32.95)}C${n(ecx + 0.5)},${n(33.6)} ${n(ecx + 0.48)},${n(34.05)} ${n(ecx)},${n(34.05)}C${n(ecx - 0.48)},${n(34.05)} ${n(ecx - 0.5)},${n(33.6)} ${n(ecx)},${n(32.95)}Z" fill="${C.water}" stroke="${C.waterDeep}" stroke-width="${n(0.06)}"/>`;

      /* --- tanks with fills --- */
      const tankGroup = (k, tk, fills, extraFront) => grp(k, tankBack(tk, P2) + `<g clip-path="url(#${P2}c${k.slice(1).toLowerCase()})">${fills}</g>` + tankFront(tk, P2) + (extraFront || ''));
      const sliv = (tk, k, fill) => fillRect(tk, k, fill);
      s += tankGroup('gInc', g.inc, fillRect(g.inc, 'fInc', C.sage) + fillRect(g.inc, 'fFio', C.brick));
      s += tankGroup('gRisk', g.risk,
        fillRect(g.risk, 'fDbR', C.steel, 'fill-opacity=".85"') + fillRect(g.risk, 'fOpp', `url(#${P2}ho)`) +
        fillRect(g.risk, 'fRiskPre', C.goldLt) + sliv(g.risk, 'fRiskTax', C.brick) + fillRect(g.risk, 'fRisk', `url(#${P2}hg)`) +
        fillRect(g.risk, 'fCollR', C.n4, 'fill-opacity=".9"'));
      s += tankGroup('gSafe', g.safe,
        fillRect(g.safe, 'fPliDb', C.steel, 'fill-opacity=".42"') + fillRect(g.safe, 'fDbS', C.steel, 'fill-opacity=".85"') +
        fillRect(g.safe, 'fSafeTx', C.sageLt) + sliv(g.safe, 'fSafeTax', C.brick) + fillRect(g.safe, 'fSafe', `url(#${P2}hs)`) +
        fillRect(g.safe, 'fCollS', C.n4, 'fill-opacity=".9"') +
        `<rect data-k="gEmerg" class="lib-pem-g" x="${n(g.safe.ix0)}" y="${n(g.y(61.8))}" width="${n(g.safe.iw)}" height="${n(1.05)}" fill="${C.ink}" fill-opacity=".07"/>`);
      s += tankGroup('gBF', g.bf,
        fillRect(g.bf, 'fDebt', C.brick) + fillRect(g.bf, 'fLoc', C.sageLt, 'fill-opacity=".7"') + fillRect(g.bf, 'fBorrow', C.n4) + fillRect(g.bf, 'fOppIns', C.goldLt));
      s += tankGroup('gHouse', g.house, fillRect(g.house, 'fHouse', C.goldLt) + fillRect(g.house, 'fCollH', C.n4, 'fill-opacity=".9"') +
        `<rect data-k="fHouseRef" class="lib-pem-f" x="${n(g.house.ix0)}" y="${n(g.house.base)}" width="${n(g.house.iw)}" height="${n(0.3)}" fill="${C.goldDeep}"/>`);

      /* --- diverter column, dial, handle, distribution valves --- */
      const col = g.col;
      s += grp('gCol', `<rect x="${n(col.x)}" y="${n(col.y0)}" width="${n(col.w)}" height="${n(col.y1 - col.y0)}" fill="#e2e8f1" stroke="${C.n3}" stroke-width="${n(0.11)}"/>` +
        `<g clip-path="url(#${P2}ccol)"><rect data-k="fCol" class="lib-pem-sx" x="${n(col.x)}" y="${n(col.y0)}" width="${n(col.w)}" height="${n(col.y1 - col.y0)}" fill="url(#${P2}water)"/></g>` +
        `<rect x="${n(col.x + 0.3)}" y="${n(col.y0)}" width="${n(0.42)}" height="${n(col.y1 - col.y0)}" fill="#fff" fill-opacity=".55"/>` +
        // distribution stubs from each tank into the column foot, and their wheels
        `<rect x="${n(g.risk.x + g.tw - 0.1)}" y="${n(g.dist.y - 0.55)}" width="${n(col.x - g.risk.x - g.tw + 0.2)}" height="${n(1.1)}" fill="#dde4ee" stroke="${C.n3}" stroke-width="${n(0.1)}"/>` +
        `<rect x="${n(col.x + col.w - 0.1)}" y="${n(g.dist.y - 0.55)}" width="${n(g.safe.x - col.x - col.w + 0.2)}" height="${n(1.1)}" fill="#dde4ee" stroke="${C.n3}" stroke-width="${n(0.1)}"/>` +
        `<g data-k="gDistL">${wheel(g.dist.l, g.dist.y - 0.05, 0.86, C.n3, C.goldLt)}</g>${wheel(g.dist.r, g.dist.y - 0.05, 0.86, C.n3, C.goldLt)}` +
        // dial with four quarters at the T, and the handle
        `<circle cx="${n(cc)}" cy="${n(g.dial.cy)}" r="${n(g.dial.r + 0.16)}" fill="${C.n3}"/>` +
        [[C.goldLt, -90, 0], [C.sageLt, 0, 90], [C.sage, 90, 180], [C.gold, 180, 270]].map(([f, a0, a1]) => {
          const ra2 = g.dial.r, p0 = [cc + ra2 * Math.cos(a0 * Math.PI / 180), g.dial.cy + ra2 * Math.sin(a0 * Math.PI / 180)], p1 = [cc + ra2 * Math.cos(a1 * Math.PI / 180), g.dial.cy + ra2 * Math.sin(a1 * Math.PI / 180)];
          return `<path d="M${n(cc)},${n(g.dial.cy)}L${n(p0[0])},${n(p0[1])}A${n(ra2)},${n(ra2)} 0 0 1 ${n(p1[0])},${n(p1[1])}Z" fill="${f}"/>`;
        }).join('') +
        `<g data-k="gHandle" class="lib-pem-tr" style="transform-box: view-box; transform-origin: ${n(cc)}px ${n(g.dial.cy)}px">` +
        `<path d="M${n(cc - 0.3)},${n(g.dial.cy)}L${n(cc - 0.16)},${n(g.dial.cy - 2.15)}Q${n(cc)},${n(g.dial.cy - 2.45)} ${n(cc + 0.16)},${n(g.dial.cy - 2.15)}L${n(cc + 0.3)},${n(g.dial.cy)}Z" fill="${C.gold}" stroke="${C.goldDeep}" stroke-width="${n(0.06)}"/></g>` +
        `<circle cx="${n(cc)}" cy="${n(g.dial.cy)}" r="${n(0.42)}" fill="${C.ink}" stroke="${C.gold}" stroke-width="${n(0.08)}"/>` +
        // realloc valve wheels sit on the realloc pipe, drawn here so they sit in front of the column
        `<g data-k="gReallocW">${wheel(ra.wl, ra.y + ra.h / 2, 0.72, C.n3, C.gold)}${wheel(ra.wr, ra.y + ra.h / 2, 0.72, C.n3, C.sage)}</g>`);

      /* --- tax filter and lifestyle regulator --- */
      const f = g.filter, rg = g.reg;
      s += `<rect x="${n(rg.x)}" y="${n(rg.y)}" width="${n(rg.w)}" height="${n(rg.h)}" rx="${n(0.5)}" fill="url(#${P2}navy)"/>` +
        `<rect x="${n(g.regTrack.x - 0.17)}" y="${n(g.regTrack.y0 - 0.1)}" width="${n(0.34)}" height="${n(g.regTrack.y1 - g.regTrack.y0 + 0.2)}" rx="${n(0.17)}" fill="${C.ink}" stroke="${C.goldLt}" stroke-opacity=".5" stroke-width="${n(0.05)}"/>` +
        [0, 0.5, 1].map((k) => `<path d="M${n(g.regTrack.x - 0.55)},${n(g.regTrack.y1 - k * (g.regTrack.y1 - g.regTrack.y0))}H${n(g.regTrack.x - 0.3)}" stroke="${C.goldLt}" stroke-opacity=".6" stroke-width="${n(0.07)}"/>`).join('');
      s += `<rect x="${n(f.x)}" y="${n(f.y + 0.35)}" width="${n(f.w)}" height="${n(f.h - 0.35)}" rx="${n(0.55)}" fill="url(#${P2}navy)"/>` +
        `<rect x="${n(f.x + 0.45)}" y="${n(f.y + 1.25)}" width="${n(f.w - 0.9)}" height="${n(f.h - 2.35)}" rx="${n(0.35)}" fill="url(#${P2}mesh)" stroke="${C.goldLt}" stroke-opacity=".55" stroke-width="${n(0.06)}"/>` +
        `<rect x="${n(f.x - 0.18)}" y="${n(f.y)}" width="${n(f.w + 0.36)}" height="${n(0.62)}" rx="${n(0.2)}" fill="${C.ink}"/>` +
        `<rect x="${n(f.x - 0.18)}" y="${n(f.y + f.h - 0.55)}" width="${n(f.w + 0.36)}" height="${n(0.55)}" rx="${n(0.2)}" fill="${C.ink}"/>` +
        `<rect x="${n(f.x + 1.45)}" y="${n(f.y - 0.85)}" width="${n(0.28)}" height="${n(0.95)}" fill="${C.n3}"/>` + wheel(f.x + 1.59, f.y - 1.0, 0.78, C.brick, C.goldLt) +
        `<rect x="${n(f.x + f.w - 0.2)}" y="${n(g.pipe.y - 0.1)}" width="${n(0.5)}" height="${n(g.pipe.h + 0.2)}" rx="${n(0.1)}" fill="${C.ink}"/>`;

      /* --- special-mode art --- */
      // business: arrow from the business tank into the earning tank
      const bx0 = g.risk.x + 0.4, bx1 = g.inc.x + g.inc.w - 1.2;
      s += grp('gBiz', `<path d="M${n(bx0)},${n(20.8)}C${n(bx0 - 2.6)},${n(20.2)} ${n(bx1 + 2.4)},${n(13.4)} ${n(bx1 + 0.9)},${n(12.4)}" fill="none" stroke="${C.sage}" stroke-width="${n(0.62)}" stroke-linecap="round"/>` +
        `<path d="M${n(bx1 - 0.25)},${n(11.7)}L${n(bx1 + 1.75)},${n(11.55)}L${n(bx1 + 0.95)},${n(13.4)}Z" fill="${C.sage}"/>`);
      // lifestyle ceiling: side tube, credit tube, arrow down into the pipe
      const ce = g.ceil;
      let ceilIcons = '';
      ['house', 'car', 'dining', 'hanger', 'music', 'phone'].forEach((ic, i) => { ceilIcons += svgIcon(ic, ce.x + ce.w / 2 - 0.9, ce.y + 0.6 + i * 1.95, 1.8, C.ink, 1.6); });
      s += grp('gCeil', `<rect x="${n(ce.x)}" y="${n(ce.y)}" width="${n(ce.w)}" height="${n(ce.h)}" rx="${n(0.6)}" fill="#eef1f6" stroke="${C.n3}" stroke-width="${n(0.11)}"/>` +
        `<g clip-path="url(#${P2}cceil)"><rect data-k="fCeilRed" class="lib-pem-f" x="${n(ce.x)}" y="${n(ce.y)}" width="${n(ce.w)}" height="${n(ce.h + 1)}" fill="${C.brick}" fill-opacity=".75"/>` +
        `<rect data-k="fCeilGreen" class="lib-pem-f" x="${n(ce.x)}" y="${n(ce.y)}" width="${n(ce.w)}" height="${n(ce.h + 1)}" fill="${C.sage}"/></g>` +
        `<g opacity=".28">${ceilIcons}</g>` +
        `<path d="M${n(ce.x + ce.w / 2)},${n(ce.y + ce.h + 0.1)}V${n(g.pipe.y - 0.5)}" stroke="${C.ink}" stroke-width="${n(0.32)}"/><path d="M${n(ce.x + ce.w / 2 - 0.65)},${n(g.pipe.y - 1.1)}L${n(ce.x + ce.w / 2)},${n(g.pipe.y - 0.2)}L${n(ce.x + ce.w / 2 + 0.65)},${n(g.pipe.y - 1.1)}Z" fill="${C.ink}"/>` +
        `<g data-k="gCredit" class="lib-pem-g"><rect x="${n(ce.x)}" y="${n(ce.cy)}" width="${n(ce.w)}" height="${n(ce.ch)}" rx="${n(0.5)}" fill="#eef1f6" stroke="${C.n3}" stroke-width="${n(0.11)}"/>` +
        `<g clip-path="url(#${P2}ccred)"><rect data-k="fCredit" class="lib-pem-f" x="${n(ce.x)}" y="${n(ce.cy)}" width="${n(ce.w)}" height="${n(ce.ch + 1)}" fill="${C.brick}"/></g></g>`);
      // Social Security pools (bottom left)
      const ss = g.ss;
      s += grp('gSS', `<rect x="${n(ss.x)}" y="${n(ss.y)}" width="${n(ss.w)}" height="${n(ss.h)}" rx="${n(0.4)}" fill="url(#${P2}water)" stroke="${C.ink}" stroke-width="${n(0.14)}"/>` +
        `<rect x="${n(ss.x2)}" y="${n(ss.y)}" width="${n(8.4)}" height="${n(ss.h)}" rx="${n(0.4)}" fill="#e2e8f1" stroke="${C.ink}" stroke-width="${n(0.14)}"/>` +
        `<path d="M${n(ss.x2 + 0.2)},${n(ss.y + ss.h / 2)}H${n(ss.x + ss.w + 0.1)}" stroke="${C.brick}" stroke-width="${n(0.24)}" stroke-dasharray="${n(0.5)} ${n(0.4)}"/>` +
        `<g data-k="gSSUp" class="lib-pem-g">${tube(M([[g.x(23.5) + 0.9, ss.y], [g.x(23.5) + 0.9, g.pipe.y + g.pipe.h - 0.1]]), 1.5, C.water)}${svgIcon('arrowUp', g.x(23.5) + 0.25, ss.y - 2.6, 1.3, C.ink, 2.6)}</g>`);
      // padlock on the RISK outlet (qualified plan access)
      const lk = [g.x(37.6), g.y(61.5)];
      s += grp('gLock', `<path d="M${n(lk[0] + 0.45)},${n(lk[1] + 1.2)}V${n(lk[1] + 0.75)}A${n(0.55)},${n(0.55)} 0 0 1 ${n(lk[0] + 1.55)},${n(lk[1] + 0.75)}V${n(lk[1] + 1.2)}" fill="none" stroke="${C.gold}" stroke-width="${n(0.24)}"/>` +
        `<rect x="${n(lk[0] + 0.1)}" y="${n(lk[1] + 1.15)}" width="${n(1.8)}" height="${n(1.45)}" rx="${n(0.22)}" fill="${C.ink}" stroke="${C.gold}" stroke-width="${n(0.08)}"/>` +
        `<circle cx="${n(lk[0] + 1)}" cy="${n(lk[1] + 1.75)}" r="${n(0.18)}" fill="${C.gold}"/>`);
      // "no" symbol over the borrowed tank
      const nb = [g.bf.cx, g.y(36) + 2.5];
      s += grp('gNoBorrow', `<circle cx="${n(nb[0])}" cy="${n(nb[1])}" r="${n(2.4)}" fill="none" stroke="${C.brick}" stroke-width="${n(0.42)}"/><path d="M${n(nb[0] - 1.7)},${n(nb[1] + 1.7)}L${n(nb[0] + 1.7)},${n(nb[1] - 1.7)}" stroke="${C.brick}" stroke-width="${n(0.42)}"/>`);
      // death benefit badge above SAFE (PLI mode)
      const dbx = g.safe.x + g.tw - 1.5, dby = g.safe.top - 3.6;
      s += grp('gDbBadge', `<g transform="translate(${n(dbx)} ${n(dby)}) scale(${r2(2.9 * U / 24)})"><path d="${SHIELD}" fill="${C.n4}" stroke="${C.gold}" stroke-width="1"/>` +
        `<g fill="none" stroke="${C.goldLt}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(5.2 5.6) scale(.57)">${IC.family}</g></g>`);
      // umbrella over the whole model (protection shield on the umbrella item)
      let scal = '';
      const ux0 = 2.2, ux1 = Math.min(g.Wm - 3, 63.2), uy = 3.6, segs = 7, sw2 = (ux1 - ux0) / segs;
      for (let i = 0; i < segs; i++) scal += `Q${n(ux0 + sw2 * (i + 0.5))},${n(uy - 1.1)} ${n(ux0 + sw2 * (i + 1))},${n(uy)}`;
      s += grp('gUmbrella', `<path d="M${n(ux0)},${n(uy)}Q${n((ux0 + ux1) / 2)},${n(-2.6)} ${n(ux1)},${n(uy)}` + reverseScallops(ux0, ux1, uy, segs) + `Z" fill="${C.n4}" fill-opacity=".86" stroke="${C.gold}" stroke-width="${n(0.12)}"/>` +
        `<path d="M${n((ux0 + ux1) / 2)},${n(-0.6)}V${n(0.6)}" stroke="${C.gold}" stroke-width="${n(0.3)}" stroke-linecap="round"/>`);
      // giving valve (faith edition): small valve on a stub above the column
      s += grp('gGiving', `<rect x="${n(cc - 0.2)}" y="${n(2.7)}" width="${n(0.4)}" height="${n(2.0)}" fill="${C.n3}"/>` + wheel(cc, 2.5, 0.7, C.n3, C.gold));
      // free-money arrow (bouncing, above the house column)
      s += grp('gFreeMoney', `<g class="lib-pem-bounce"><path d="M${n(g.x(78.4) + 1.4)},${n(g.y(46) - 0.6)}V${n(g.y(46) + 1.6)}" stroke="${C.sage}" stroke-width="${n(0.6)}" stroke-linecap="round"/>` +
        `<path d="M${n(g.x(78.4) + 0.3)},${n(g.y(46) + 1.2)}L${n(g.x(78.4) + 1.4)},${n(g.y(46) + 2.6)}L${n(g.x(78.4) + 2.5)},${n(g.y(46) + 1.2)}Z" fill="${C.sage}"/></g>`);

      /* --- bottom icon strips --- */
      let life = '', prot = '';
      LIFE_ICONS.forEach((ic, i) => {
        const cx2 = g.strip.x + 1.5 + i * 3;
        life += `<circle cx="${n(cx2)}" cy="${n(g.strip.y + 1.45)}" r="${n(1.3)}" fill="${C.paper}" stroke="${C.mist2}" stroke-width="${n(0.1)}"/>${svgIcon(ic, cx2 - 0.8, g.strip.y + 0.65, 1.6, C.n4, 1.8)}`;
      });
      PROTECT.forEach((pr, i) => {
        const cx2 = g.strip.xp + 1.5 + i * (g.strip.wp / 8);
        prot += `<g transform="translate(${n(cx2 - 1.3)} ${n(g.strip.y + 0.1)}) scale(${r2(2.6 * U / 24)})"><path d="${SHIELD}" fill="${C.n4}" stroke="${C.n3}" stroke-width=".6"/></g>${svgIcon(pr[2], cx2 - 0.68, g.strip.y + 0.72, 1.36, C.cream, 1.9)}` +
          `<g data-k="pShield${i}" class="lib-pem-g lib-pem-off" transform="translate(${n(cx2 + 0.25)} ${n(g.strip.y - 0.35)}) scale(${r2(1.3 * U / 24)})"><path d="${SHIELD}" fill="${C.gold}" stroke="${C.goldDeep}" stroke-width="1"/><path d="M8 12.2l2.6 2.6 5.2-5.4" fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      });
      s += grp('gStripLife', life) + grp('gStripProt', prot);

      /* --- money flows (on top) --- */
      let fl = '';
      const routes = flowRoutes();
      FLOW_DEF.forEach(([nm, , w, tax]) => {
        fl += `<path data-k="flow_${nm}" class="lib-pem-flow lib-pem-off" d="${routes[nm]}" stroke="${tax ? C.brick : C.n4}" stroke-width="${n(w)}" stroke-dasharray="14 14" stroke-opacity="${tax ? 0.9 : 0.88}"/>`;
      });
      s += `<g class="lib-pem-flows">${fl}</g>`;
      return `<svg class="lib-pem-svg" viewBox="0 0 ${n(Wm)} ${n(MH)}" preserveAspectRatio="none" aria-hidden="true"><defs>${defs}</defs>${s}</svg>`;
    }
    function reverseScallops(x0, x1, y0, segs) {
      const w = (x1 - x0) / segs;
      let d = '';
      for (let i = segs - 1; i >= 0; i--) d += `Q${n(x0 + w * (i + 0.5))},${n(y0 - 1.15)} ${n(x0 + w * i)},${n(y0)}`;
      return d;
    }

    /* the animated routes, in model em (spec "Flow paths") */
    function flowRoutes() {
      const cc = g.colC, pc = g.pipe.c, f = g.filter, ecx = g.end.x + 3.35, il = g.inlet;
      const fIn = f.x + 1.5, fOut = cc;               // into the filter / out at the regulator
      const riskIn = g.man.x0, safeIn = g.man.x1, topY = g.man.y;
      const bfx = g.bf.cx, hx = g.house.cx, tankBot = g.bf.bot - 0.6;
      const R = 0.9, rp = (pts) => roundPath(pts, R);
      const mcpX = g.purchase.x + 0.5;
      return {
        incomeToQP: rp([[il.cx, il.y0 - 0.6], [il.cx, g.qp.y], [g.qp.x1, g.qp.y], [g.qp.x1, g.risk.top + 2.2]]),
        incomeToFilter: rp([[il.cx, il.y0 - 0.6], [il.cx, g.inc.base - 1.4], [g.outlet.cx, g.inc.base - 1.4], [g.outlet.cx, pc], [fIn, pc]]),
        filterToOutflow: rp([[fIn, pc], [ecx, pc], [ecx, 34.4]]),
        filterToMCP: rp([[fIn, pc], [mcpX, pc]]),
        riskToFilter: rp([[g.risk.x + g.tw - 1.2, g.dist.y], [cc, g.dist.y], [cc, pc]]),
        safeToFilter: rp([[g.safe.x + 1.2, g.dist.y], [cc, g.dist.y], [cc, pc]]),
        futureToOutflow: rp([[cc, g.dist.y + 0.8], [cc, pc], [ecx, pc], [ecx, 34.4]]),
        futureToMCP: rp([[cc, g.dist.y + 0.8], [cc, pc], [mcpX, pc]]),
        filterToRisk: rp([[fIn, pc], [cc, pc], [cc, topY], [riskIn, topY], [riskIn, g.risk.top + 2.2]]),
        filterToRiskThin: rp([[fIn, pc], [cc - 0.35, pc], [cc - 0.35, topY], [riskIn, topY], [riskIn, g.risk.top + 2.2]]),
        filterToSafe: rp([[fIn, pc], [cc, pc], [cc, topY], [safeIn, topY], [safeIn, g.safe.top + 2.2]]),
        filterToSafeThin: rp([[fIn, pc], [cc + 0.35, pc], [cc + 0.35, topY], [safeIn, topY], [safeIn, g.safe.top + 2.2]]),
        filterToBorrowed: rp([[fIn, pc], [bfx, pc], [bfx, tankBot]]),
        borrowedIn: rp([[bfx - 0.45, pc + 0.4], [bfx - 0.45, tankBot]]),
        borrowedOut: rp([[bfx + 0.45, tankBot], [bfx + 0.45, pc + 0.4]]),
        mcpIn: rp([[hx - 0.45, pc + 0.4], [hx - 0.45, tankBot]]),
        mcpOut: rp([[hx + 0.45, tankBot], [hx + 0.45, pc + 0.4]]),
        futureToHouse: rp([[cc, g.dist.y + 0.8], [cc, pc], [hx, pc], [hx, tankBot]]),
        borrowedToHouse: rp([[bfx, tankBot], [bfx, pc], [hx, pc], [hx, tankBot]]),
        borrowedToOutflow: rp([[bfx, tankBot], [bfx, pc], [ecx, pc], [ecx, 34.4]]),
        borrowedToMCP: rp([[bfx, tankBot], [bfx, pc], [bfx + 2.3, pc]]),
        tankTaxOut: rp([[cc - 0.4, g.dist.y + 1.4], [cc - 0.4, f.y + 0.9], [f.x + 1.0, f.y + 0.9], [f.x + 1.0, MH + 0.3]]),
        incomeTaxOut: rp([[f.x + 2.2, pc + 0.6], [f.x + 2.2, MH + 0.3]])
      };
    }

    /* --- HTML layer: labels, pills, hotspots, knobs, controls --- */
    function buildHTML() {
      const ex = (v) => r2(v) + 'em';
      const pos = (x, y) => `left:${ex(x)};top:${ex(y)}`;
      const lab = (k, x, y, inner, cls, extra) => `<div data-k="${k}" class="lib-pem-l lib-pem-g ${cls || 'lib-pem-c'}" style="${pos(x, y)};${extra || ''}">${inner}</div>`;
      const dyn = (k, x, inner, cls) => `<div data-k="${k}" class="lib-pem-l lib-pem-g ${cls || 'lib-pem-c'}" style="left:${ex(x)};top:0">${inner}</div>`;
      const val = (k) => `<span class="num" data-v="${k}"></span>`;
      const pill = (k, cap, cls) => `<span class="lib-pem-pill ${cls || ''}">${cap ? t(cap, { cls: 'lib-pem-cap' }) : ''}${val(k)}</span>`;
      const hot = (k, x, y, w, h, tip) => `<div data-k="${k}" class="lib-pem-hot" style="${pos(x, y)};width:${ex(w)};height:${ex(h)}" ${tip ? `data-tip="${tip}"` : ''}></div>`;
      const hint = (k, x, y, deco) => `<div data-k="${k}" class="lib-pem-hint lib-pem-g ${deco ? 'deco' : ''}" style="${pos(x, y)}">${htmlIcon('hand', '', 1.7)}</div>`;
      const X = g.x, Y = g.y, cc = g.colC;
      let h = '';
      const tankTitle = (tk) => tk.top + 1.0;

      /* titles and watermarks */
      h += lab('lIncTitle', g.inc.cx, g.inc.top + 0.85, `<div class="lib-pem-stack">${t('incomeTank', { cls: 'lib-pem-ttl', attrs: 'data-serif' })}${t('ripTank', { cls: 'lib-pem-ttl', attrs: 'data-serif' })}${t('legacyTank', { cls: 'lib-pem-ttl', attrs: 'data-serif' })}` +
        `<span data-k="ripAmt" class="lib-pem-pill box lib-pem-link" data-tip="tipRip">${val('remainingIncome')}</span>` +
        `<span data-k="ripProt" class="lib-pem-sm" style="display:inline-flex;align-items:center;gap:.3em;pointer-events:auto" data-tip="protectionTip"><span data-k="ripWarn" style="width:1.1em;height:1.1em;color:${C.gold};display:inline-block">${htmlIcon('warn', '', 2.2)}</span><span class="num" data-v="protectionPct"></span>${t('protection')}</span></div>`);
      h += lab('lRiskTitle', g.risk.cx, tankTitle(g.risk), `<div class="lib-pem-stack lib-pem-link">${t('riskTitle', { cls: 'lib-pem-ttl', attrs: 'data-serif' })}${t('riskTitleBiz', { cls: 'lib-pem-ttl', attrs: 'data-serif' })}</div>`);
      h += lab('lRiskMark', g.risk.cx, Y(43), t('riskMark', { cls: 'lib-pem-mark' }));
      h += lab('lSafeTitle', g.safe.cx, tankTitle(g.safe), `<div class="lib-pem-stack">${t('safeTitle', { cls: 'lib-pem-ttl', attrs: 'data-serif' })}${t('safeTitlePli', { cls: 'lib-pem-ttl', attrs: 'data-serif' })}</div>`);
      h += lab('lSafeMark', g.safe.cx, Y(43), t('safeMark', { cls: 'lib-pem-mark' }));
      h += lab('lEmerg', g.safe.cx, Y(61.8) + 0.12, t('emergency', { cls: 'lib-pem-xs' }));
      h += lab('lBFTitle', g.bf.cx, tankTitle(g.bf), `<div class="lib-pem-stack lib-pem-link">${t('bfTitle', { cls: 'lib-pem-ttl', attrs: 'data-serif' })}<span data-k="lLender" class="lib-pem-link" style="pointer-events:auto">${t('lenderOther', { cls: 'lib-pem-lender' })}${t('lenderInsurer', { cls: 'lib-pem-lender' })}</span></div>`);
      h += lab('lHouseTitle', g.house.cx, tankTitle(g.house), `<div class="lib-pem-stack lib-pem-link">${t('houseTitle', { cls: 'lib-pem-ttl', attrs: 'data-serif' })}${t('houseTitleMcp', { cls: 'lib-pem-ttl', attrs: 'data-serif' })}</div>`);
      h += lab('lHouseEmerg', g.house.cx, Y(61.8) + 0.12, t('emergency', { cls: 'lib-pem-xs' }));
      /* level-following labels */
      h += dyn('lFio', g.inc.cx, t('fio', { cls: 'lib-pem-sm lib-pem-in' }));
      h += dyn('lDebt', g.bf.cx, `<span>${t('liability', { cls: 'lib-pem-sm lib-pem-in' })}${t('debt', { cls: 'lib-pem-sm lib-pem-in' })}</span>`);
      h += dyn('lLoc', g.bf.cx, t('locLabel', { cls: 'lib-pem-xs' }));
      h += dyn('lCollR', g.risk.cx, t('collateral', { cls: 'lib-pem-xs lib-pem-in' }));
      h += dyn('lCollS', g.safe.cx, t('collateral', { cls: 'lib-pem-xs lib-pem-in' }));
      h += dyn('lCollH', g.house.cx, t('collateral', { cls: 'lib-pem-xs lib-pem-in' }));
      h += dyn('lDb', g.safe.cx, t('deathBenefit', { cls: 'lib-pem-xs' }));
      /* descriptive labels (labels on) */
      h += lab('lIncome', g.inlet.cx, Y(6) - 0.2, `<span class="lib-pem-link" data-k="lIncomeLink" style="pointer-events:auto">${t('income', { cls: 'lib-pem-sm' })}</span>`);
      h += lab('lQP', (g.inlet.cx + g.qp.x1) / 2 + 0.6, g.qp.y - 1.95, `<span class="lib-pem-link" data-k="lQPLink" style="pointer-events:auto" data-tip="tipQPWord">${t('qp', { cls: 'lib-pem-xs' })}${t('qpAlt', { cls: 'lib-pem-xs' })}</span>`);
      h += lab('lBiz', g.inc.x + g.inc.w + 1.1, Y(41), t('business', { cls: 'lib-pem-xs' }), 'lib-pem-c', 'transform:rotate(-62deg)');
      h += lab('lDiverter', cc, 2.1, t('diverter', { cls: 'lib-pem-sm' }));
      h += lab('lGiving', cc + 1.2, 1.9, t('giving', { cls: 'lib-pem-xs' }), 'lib-pem-l', 'margin-left:.2em');
      h += `<div data-k="lColumn" class="lib-pem-l lib-pem-g" style="left:${ex(cc - 0.42)};top:${ex(g.col.y0 + 1.6)};writing-mode:vertical-rl;text-orientation:upright;pointer-events:auto;cursor:pointer" data-tip="tipColumn">${t('column', { cls: 'lib-pem-xs', attrs: 'style="letter-spacing:-.06em;font-size:.56em"' })}${t('columnAlt', { cls: 'lib-pem-xs', attrs: 'style="letter-spacing:-.06em;font-size:.56em"' })}</div>`;
      h += lab('lTaxFilter', g.filter.x + g.filter.w / 2, Y(95.5) - 0.3, t('taxFilter', { cls: 'lib-pem-sm' }));
      h += lab('lRegulator', g.reg.x + g.reg.w / 2 + 0.2, g.reg.y + g.reg.h + 0.12, t('regulator', { cls: 'lib-pem-xs' }));
      h += lab('lInflow', g.incPipe.x0 + 0.5, g.pipe.c - 0.48, `<span style="display:inline-flex;align-items:center;gap:.25em">${t('inflowLabel', { cls: 'lib-pem-sm' })}<span style="width:.9em;height:.9em;display:inline-block">${htmlIcon('arrowR', '', 2.6)}</span></span>`, 'lib-pem-l');
      h += lab('lAfterTax', g.life.x0 + 0.6, g.pipe.c - 0.48, `<span style="display:inline-flex;align-items:center;gap:.25em">${t('afterTax', { cls: 'lib-pem-sm' })}<span style="width:.9em;height:.9em;display:inline-block">${htmlIcon('arrowR', '', 2.6)}</span></span>`, 'lib-pem-l');
      h += lab('lAfterTax2', g.life.x0 + 0.5, g.pipe.y + 0.55, t('afterTax2', { cls: 'lib-pem-xs' }), 'lib-pem-l', 'text-align:left');
      h += lab('lLifeEnd', X(73.7) + 2.6, g.pipe.y + 0.5, t('lifestyleEnd', { cls: 'lib-pem-sm' }));
      h += lab('lStrip', g.stripLabel.x, g.stripLabel.y - 0.05, `<span class="lib-pem-link" data-k="lStripLink" style="pointer-events:auto" data-tip="tipStrip">${t('standardLiving', { cls: 'lib-pem-sm' })}${t('protectionStrip', { cls: 'lib-pem-sm' })}</span>`);
      h += lab('lSSPool', g.ss.x + g.ss.w / 2, g.ss.y - 1.05, `<span class="lib-pem-link" data-k="lSSLink" style="pointer-events:auto" data-tip="tipSs">${t('ssPool', { cls: 'lib-pem-xs' })}</span>`);
      h += lab('lFica', g.ss.x2 + 4.2, g.ss.y + 0.28, t('fica', { cls: 'lib-pem-xs' }));
      h += lab('lPctFL', cc, 20.15, `<span class="lib-pem-pill" style="font-size:.6em">${val('pctFL')}</span>`);
      h += lab('lPctLS', g.reg.x + 1.25, g.pipe.c - 0.48, `<span class="lib-pem-pill" style="font-size:.56em">${val('pctLS')}</span>`);

      /* amount pills (spec "Number callouts") */
      const pc = (k, x, y, cap, cls, anchor) => lab(k, x, y, pill(k.slice(1), cap, cls), anchor || 'lib-pem-c');
      h += pc('pcontributionQP', X(13.4) + 1.6, Y(3), 'cQP');
      h += pc('pcontributionRisk', g.risk.cx, Y(3), 'cRisk');
      h += pc('pcontributionSafe', g.safe.cx, Y(3), 'cSafe');
      h += pc('pcontributionHouse', g.house.cx, Y(3), 'cHouse');
      h += pc('ptdContributions', X(15) + 1.5, Y(11.5) - 0.2, null);
      h += pc('pcontribution', cc, g.dial.cy + g.dial.r + 0.35, 'contribution', 'box');
      h += lab('lWdSplit', cc, g.dist.y + 1.0, `<div data-k="wdBar" style="width:6.4em;height:.62em;display:flex;border-radius:.3em;overflow:hidden;border:.05em solid ${C.n3};pointer-events:auto"><i data-k="wdR" style="display:block;height:100%;background:${C.goldLt}"></i><i data-k="wdS" style="display:block;height:100%;background:${C.sageLt};flex:1"></i></div>`);
      h += pc('pwithdrawal', cc, g.dist.y + 1.72, 'withdrawal');
      h += lab('ploanPmt', g.bf.cx - 3.6, g.pipe.y - 2.3, `<span class="lib-pem-pill box">${t('loanPmt', { cls: 'lib-pem-cap' })}${t('loanDraw', { cls: 'lib-pem-cap' })}${val('loanPmt')}</span>`);
      h += pc('pproceeds', g.house.cx, Y(62.7) - 0.4, 'proceeds');
      ['risk', 'safe', 'bf', 'house'].forEach((tk) => {
        h += `<div data-k="pb_${tk}" class="lib-pem-l lib-pem-g lib-pem-c" style="left:${ex(g[tk].cx)};top:0">${pill(tk + 'Balance', null)}</div>`;
      });
      h += lab('pliquidity', g.safe.cx, Y(10.5) - 0.3, `<div class="lib-pem-stack">${t('liquidity', { cls: 'lib-pem-cap' })}${pill('liquidity', null)}</div>`);
      h += lab('pcreditBalance', g.bf.cx, Y(10.5) - 0.3, `<div class="lib-pem-stack">${t('creditLine', { cls: 'lib-pem-cap' })}${pill('creditBalance', null)}</div>`);
      h += lab('phouseEquity', g.house.cx, Y(10.5) - 0.3, `<div class="lib-pem-stack">${t('equity', { cls: 'lib-pem-cap' })}${pill('houseEquity', null)}</div>`);
      h += lab('pinflow', X(28.5) + 1.8, g.pipe.c - 0.55, pill('inflow', null));
      h += lab('pgrossIncome', 0.3, Y(6.3), pill('grossIncome', 'inflow'), 'lib-pem-l');
      h += lab('pnetInflow', g.incPipe.x1 - 0.6, g.pipe.c - 0.55, pill('inflow', 'netInflow'), 'lib-pem-r');
      h += lab('pinflowTotal', X(23.2) + 2.4, g.pipe.y + g.pipe.h + 0.3, pill('inflowTotal', 'inflowTotal'));
      h += lab('ptaxesPaid', g.filter.x - 0.35, g.pipe.y + g.pipe.h + 0.55, pill('taxesPaid', 'taxesPaid'), 'lib-pem-r');
      h += lab('poutflow', X(54.8) + 2.4, g.pipe.c - 0.55, `<span style="display:inline-flex;align-items:center;gap:.3em">${pill('outflow', null)}<span data-k="pvOut" class="lib-pem-pill lib-pem-link" style="font-size:.5em" data-tip="tipPv">${t('pv', { cls: 'lib-pem-cap' })}${t('fv', { cls: 'lib-pem-cap' })}</span></span>`);
      h += lab('poutflowTotal', X(48.4) + 3.4, g.pipe.y + g.pipe.h + 0.3, `<div class="lib-pem-stack" style="justify-items:start">${pill('outflowTotal', 'outflowTotal')}<span data-k="poppCost">${pill('oppCost', 'oppCost')}</span></div>`);
      h += lab('pexplife', X(68) + 6.75, g.pipe.y + 0.15, `<div class="lib-pem-stack">${`<span data-k="pexpLine">${pill('expenses', 'expenses')}</span>`}<span data-k="plifeLine" style="display:inline-flex;align-items:center;gap:.3em">${pill('lifestyle', 'lifestyle')}<span data-k="pvLife" class="lib-pem-pill lib-pem-link" style="font-size:.5em" data-tip="tipPv">${t('pv', { cls: 'lib-pem-cap' })}${t('fv', { cls: 'lib-pem-cap' })}</span></span></div>`);
      h += lab('pexplifeSG', g.Wm - 0.4, Y(92), `<div class="lib-pem-stack" style="justify-items:end">${`<span data-k="pexpLineSG">${pill('expenses', 'expenses')}</span>`}<span data-k="plifeLineSG" style="display:inline-flex;align-items:center;gap:.3em">${pill('lifestyle', 'lifestyle')}<span data-k="pvLifeSG" class="lib-pem-pill lib-pem-link" style="font-size:.5em" data-tip="tipPv">${t('pv', { cls: 'lib-pem-cap' })}${t('fv', { cls: 'lib-pem-cap' })}</span></span></div>`, 'lib-pem-r');
      h += lab('pspendable', X(46) - 0.2, Y(79) - 0.1, `<span class="lib-pem-pill" style="background:${C.mist}">${t('spendable', { cls: 'lib-pem-cap' })}${val('spendable')}</span>`, 'lib-pem-r');
      /* comparison tables */
      const tbl = (k, x, head, last) => `<div data-k="${k}" class="lib-pem-at lib-pem-g" style="${pos(x, Y(35) - (g.narrow ? 1.0 : 1.6))}"><div class="lib-pem-tbl">${t(head, { tag: 'h4' })}` +
        `<div class="row">${t('tPrincipal')}${val('summaryPrincipal')}</div><div class="row">${t('tIntPaid')}${val('summaryInterestPaid')}</div>` +
        `<div class="row">${t('tIntLost')}${val('summaryInterestLost')}</div><div class="row tot">${t(last)}${val('summaryTotal')}</div></div></div>`;
      h += tbl('tCash', g.safe.x - 0.4, 'paidCash', 'tNet') + tbl('tBorrow', g.bf.x - 0.4, 'paidFull', 'tTotal');

      /* account stacks (stacked mode) */
      h += `<div data-k="bars_income" class="lib-pem-bars lib-pem-g" style="${pos(g.inc.ix0, Y(21.6))};width:${ex(g.inc.iw)};height:${ex(g.inc.base - Y(21.6))}"></div>`;
      ['risk', 'safe', 'bf', 'house'].forEach((tk) => {
        h += `<div data-k="bars_${tk}" class="lib-pem-bars lib-pem-g" style="${pos(g[tk].ix0, Y(22.1))};width:${ex(g[tk].iw)};height:${ex(g[tk].base - Y(22.1))}"></div>`;
      });

      /* hotspots (toggles and links) */
      h += hot('hQP', (g.inlet.cx + g.qp.x1) / 2 - 1.2, g.qp.y - 0.9, 3.4, 1.8, 'tipQP');
      h += hot('hAM', cc - 1.8, g.dial.cy - 1.5, 3.6, 3);
      h += hot('hTax', g.filter.x + 0.3, g.filter.y + 1.0, 2.6, 5);
      h += hot('hReg', g.reg.x + 0.1, g.reg.y + 0.1, g.reg.w - 1.6, g.reg.h - 0.2);
      h += hot('hCvss', g.risk.ix0 + 0.6, Y(51), g.risk.iw - 1.2, 3.2);
      h += hot('hRab', g.risk.ix0 + 0.6, Y(31.5), g.risk.iw - 1.2, 3);
      h += hot('hSab', g.safe.ix0 + 0.6, Y(31.5), g.safe.iw - 1.2, 3);
      h += hot('hPli', g.safe.ix0 + 0.6, Y(50), g.safe.iw - 1.2, 3.6, 'tipPli');
      h += hot('hAccdist', g.dist.l - 0.9, g.dist.y - 0.95, 1.8, 1.9);
      h += hot('hRia', g.dist.r - 0.9, g.dist.y - 0.95, 1.8, 1.9);
      h += hot('hReallocL', g.realloc.wl - 0.75, g.realloc.y - 0.1, 1.5, 1.5, 'tipRealloc');
      h += hot('hReallocR', g.realloc.wr - 0.75, g.realloc.y - 0.1, 1.5, 1.5, 'tipRealloc');
      h += hot('hDbBadge', g.safe.x + g.tw - 1.5, g.safe.top - 3.6, 2.9, 2.9);
      h += hot('hInlet', g.inlet.cx - 1.3, g.inlet.y0 - 0.2, 2.6, 2.8);
      h += hot('hIncTitle', g.inc.cx - 4.5, g.inc.top + 0.7, 9, 2.6);
      h += hot('hSSPool', g.ss.x, g.ss.y, g.ss.w, g.ss.h, 'tipSs');
      h += hot('hGiving', cc - 0.9, 1.6, 1.8, 1.8);
      LIFE_ICONS.forEach((ic, i) => { if (i < 3) h += hot('hLife' + i, g.strip.x + 0.2 + i * 3, g.strip.y + 0.15, 2.6, 2.6); });
      PROTECT.forEach((pr, i) => { h += hot('hProt' + i, g.strip.xp + 0.2 + i * (g.strip.wp / 8), g.strip.y + 0.15, 2.6, 2.6); });
      /* protection ranking badges */
      PROTECT.forEach((pr, i) => { h += `<div data-k="pRank${i}" class="lib-pem-at lib-pem-g lib-pem-off" style="left:${ex(g.strip.xp + 0.15 + i * (g.strip.wp / 8))};top:${ex(g.strip.y - 0.65)}"><div class="lib-pem-badge"><span class="num" data-v="rank${i}"></span></div></div>`; });

      /* click hints (labels on) */
      h += hint('iQP', X(27.5), Y(17)) + hint('iRisk', g.risk.x + g.tw - 1.9, Y(17)) + hint('iSafe', g.safe.x + 0.9, Y(17));
      h += hint('iRiskTitle', g.risk.x + g.tw - 1.25, tankTitle(g.risk) + 1.25) + hint('iHouseTitle', g.house.x + g.tw - 1.25, tankTitle(g.house) + 1.25);
      h += hint('iColumn', cc + 1.15, Y(46.5)) + hint('iReallocL', g.realloc.wl - 0.5, g.realloc.y + 1.5) + hint('iReallocR', g.realloc.wr - 0.5, g.realloc.y + 1.5);
      h += hint('iPli', g.safe.x + g.tw - 1.6, Y(54)) + hint('iSource', g.bf.x + g.tw + 0.5, Y(2.6)) + hint('iStrip', g.stripLabel.x + 4.9, g.stripLabel.y + 0.1);
      h += hint('iSS', g.ss.x + g.ss.w + 0.3, g.ss.y + 0.2);
      LIFE_ICONS.forEach((ic, i) => { if (i < 3) h += hint('iLife' + i, g.strip.x + 1.0 + i * 3, MH - 1.0, true); });
      PROTECT.forEach((pr, i) => { h += hint('iProt' + i, g.strip.xp + 1.0 + i * (g.strip.wp / 8), MH - 1.0, true); });

      /* section chevrons */
      const chev = (k, x) => `<div data-k="${k}" class="lib-pem-chev lib-pem-g" style="${pos(x, g.chev.y)}" data-tip="tipSection"><span data-k="${k}Up">${htmlIcon('up', '', 2.4)}</span><span data-k="${k}Dn">${htmlIcon('down', '', 2.4)}</span></div>`;
      h += chev('cIncome', g.chev.inc) + chev('cFuture', g.chev.col) + chev('cBF', g.chev.bf) + chev('cHouse', g.chev.house);

      /* MCP purpose box and the major purchase card */
      h += `<div data-k="mcpWrap" class="lib-pem-at lib-pem-g" style="${pos(g.house.cx - 3.3, Y(45))}"><input data-k="mcpIn" class="lib-pem-mcpin" maxlength="24" aria-label="${esc(txt('houseTitleMcp').replace(/\n/g, ' '))}"></div>`;
      const pb = g.purchase;
      h += `<div data-k="box" class="lib-pem-box lib-pem-g lib-pem-off" style="${pos(pb.x, pb.y)};width:${ex(pb.w)};height:${ex(pb.h)}">
        <div class="lib-pem-box-h"><span data-k="boxTitle" data-tip="tipMcpTitle">${t('mcpBox')}${t('mcpBoxAlt')}</span><button type="button" class="lib-pem-btn" data-k="boxClose" data-tip="tipMcpClose">${htmlIcon('close', '', 2.4)}</button></div>
        <div class="lib-pem-box-b"><div data-k="boxPic" style="width:100%;display:grid;place-items:center"></div><button type="button" class="lib-pem-calc" data-k="boxCalc">${htmlIcon('calc', '', 1.8)}</button></div></div>`;

      /* borrow source controls (For Expense / For Opportunity + collateral) */
      h += `<div data-k="src" class="lib-pem-at lib-pem-g" style="${pos(X(62.4), 0.15)}"><div class="lib-pem-src"><button type="button" class="lib-pem-src-b" data-k="srcBtn" aria-pressed="false">${t('forExpense')}${t('forOpportunity')}</button>
        <div class="lib-pem-src-g">${[['none', 'ccNone'], ['risk', 'ccRisk'], ['safe', 'ccSafe'], ['house', 'ccHouse']].map(([v2, key]) => `<button type="button" class="lib-pem-rad" data-cc="${v2}" aria-checked="false"><i></i>${t(key)}</button>`).join('')}</div></div></div>`;

      /* knobs (hidden-track sliders on tank edges and the two visible lifestyle sliders) */
      ['kIncome', 'kRiskPre', 'kRisk', 'kSafeTx', 'kSafe', 'kBfL', 'kBorrow', 'kHouseRef', 'kHouse', 'kReg', 'kRem', 'kCeilCredit', 'kCeil'].forEach((k) => { h += `<div data-k="${k}" class="lib-pem-knob lib-pem-g"></div>`; });
      ['kRiskKeep', 'kSafeTax'].forEach((k) => { h += `<div data-k="${k}" class="lib-pem-knob h lib-pem-g"></div>`; });
      h += `<div data-k="remTrack" class="lib-pem-g" style="position:absolute;${pos(g.remTrack.x - 0.12, g.remTrack.y0)};width:.24em;height:${ex(g.remTrack.y1 - g.remTrack.y0)};border-radius:.12em;background:${C.n3};opacity:.75"></div>`;

      /* scenario picker + show labels (bottom left) */
      h += `<div data-k="sc" class="lib-pem-at lib-pem-g" style="${pos(0.25, Y(93) - 0.85)}"><div class="lib-pem-sc">
        <div style="position:relative"><button type="button" class="lib-pem-sc-b" data-k="scBtn" aria-haspopup="listbox"><span data-k="scCur"></span>${htmlIcon('up', '', 2.4)}</button>
        <div class="lib-pem-sc-list" role="listbox">${PRESETS.map((p, i) => `<button type="button" class="lib-pem-sc-i" data-sc="${i}" role="option">${t('sc' + i)}</button>`).join('')}</div></div>
        <button type="button" class="lib-pem-ck" data-k="ckLabels" role="checkbox" aria-checked="true"><i>${htmlIcon('check', '', 3)}</i>${t('showLabels')}</button></div></div>`;
      /* protection ranking / shield checkboxes */
      h += `<div data-k="protCk" class="lib-pem-at lib-pem-g" style="${pos(g.strip.xp - 4.6, g.strip.y + 0.25)}"><div class="lib-pem-sc" style="gap:.45em">
        <button type="button" class="lib-pem-ck" data-k="ckRank" role="checkbox" aria-checked="false" data-tip="rankTip"><i>${htmlIcon('check', '', 3)}</i>${t('rank')}</button>
        <button type="button" class="lib-pem-ck" data-k="ckShield" role="checkbox" aria-checked="false" data-tip="shieldTip"><i>${htmlIcon('check', '', 3)}</i>${t('shield')}</button></div></div>`;
      return `<div class="lib-pem-h">${h}</div>`;
    }

    function build() {
      measure();
      g = geo(dims.narrow);
      if (root) root.remove();
      root = document.createElement('div');
      root.className = 'lib-pem' + (dims.narrow ? ' is-narrow' : '');
      root.innerHTML = `<div class="lib-pem-win"><div class="lib-pem-model" style="font-size:${r2(dims.em * 1000) / 1000}px;width:${g.Wm}em;height:${MH}em">${buildSVG()}${buildHTML()}<div class="lib-pem-hl"></div></div></div><div class="lib-pem-ui"></div><div class="lib-pem-tip" role="tooltip"></div>`;
      host.appendChild(root);
      win = root.querySelector('.lib-pem-win');
      model = root.querySelector('.lib-pem-model');
      svg = root.querySelector('.lib-pem-svg');
      hl = root.querySelector('.lib-pem-hl');
      ui = root.querySelector('.lib-pem-ui');
      tipEl = root.querySelector('.lib-pem-tip');
      E = {};
      root.querySelectorAll('[data-k]').forEach((el) => { E[el.dataset.k] = el; });
      E.values = {};
      root.querySelectorAll('[data-v]').forEach((el) => { (E.values[el.dataset.v] = E.values[el.dataset.v] || []).push(el); });
      bind();
      buildFrameUI();
      applyCamera(0);
      if (EFA.edit && EFA.edit.on) EFA.edit.arm(root);
    }

    /* =================================================================================
       render: apply state to the DOM (only changed values touch the DOM)
       ================================================================================= */
    const show = (el, on, delayHide) => {
      if (!el) return;
      const off = !on;
      if (el._off === off) return;
      el._off = off;
      el.style.transitionDelay = off && delayHide ? delayHide + 'ms' : '';
      el.classList.toggle('lib-pem-off', off);
    };
    const hide = (el, on) => { if (el) el.hidden = !on; };
    function tf(el, x, y) {          // svg translate (em)
      if (!el) return;
      const v = `translate(${n(x)}px,${n(y)}px)`;
      if (el._tf === v) return;
      el._tf = v;
      el.style.transitionDuration = DUR + 'ms';
      el.style.transitionTimingFunction = EASE;
      el.style.transform = v;
    }
    function lvl(el, hEm) { tf(el, 0, HF + 0.6 - Math.max(0, hEm)); }
    function sliver(el, hEm, wEm, iw, right) { tf(el, right ? iw - wEm : wEm - iw, HF + 0.6 - Math.max(0, hEm)); }
    function at(el, x, y) {          // html translate (em)
      if (!el) return;
      const v = `translate(${r2(x)}em,${r2(y)}em)`;
      if (el._tf === v) return;
      el._tf = v;
      el.style.transitionDuration = DUR + 'ms, ' + DUR + 'ms';
      el.style.transitionProperty = 'transform, opacity';
      el.style.transitionTimingFunction = EASE;
      el.style.transform = v;
    }
    function setVal(k, text) {
      (E.values[k] || []).forEach((el) => { if (el._t !== text) { el._t = text; el.textContent = text; } });
    }
    const fillTop = (tk, hEm) => tk.base - Math.max(0, hEm);
    /** y for a label riding a level: just inside the top of the fill, kept above the floor */
    const rideY = (tk, hEm, lh) => clamp(fillTop(tk, hEm) + 0.18, tk.top + 1.2, tk.base - (lh || 1.0));

    function render(ms, ease) {
      if (dead || !root) return;
      DUR = ms == null ? 800 : ms; EASE = ease || 'ease';
      const D = derive(), v = vis();
      const sg = v.sg;
      root.classList.toggle('is-sg', sg);
      const lab = v.labels;

      /* sections */
      show(E.gInc, v.income); show(E.lIncTitle, v.income);
      show(E.gInlet, v.income); show(E.gIncPipe, v.incPipe); show(E.gQP, v.qp); show(E.lQP, v.qp);
      show(E.gRisk, v.risk); show(E.lRiskTitle, v.risk); show(E.lRiskMark, v.risk);
      show(E.gSafe, v.safe); show(E.lSafeTitle, v.safe); show(E.lSafeMark, v.safe);
      show(E.gMan, v.col); show(E.gCol, v.col); show(E.gRealloc, v.col && v.risk && v.safe);
      show(E.gReallocW, v.col && v.risk && v.safe);
      show(E.gLegacy, v.future && !!S.legacy);
      show(E.gBF, v.bf); show(E.lBFTitle, v.bf); show(E.gBFTube, v.bf); show(E.gBFFl, v.bf);
      show(E.gHouse, v.house); show(E.lHouseTitle, v.house); show(E.gHouseTube, v.house); show(E.gHouseFl, v.house);
      show(E.gStripLife, v.strip && S.standardLiving); show(E.gStripProt, v.strip && !S.standardLiving);
      show(E.lStrip, v.strip); show(E.protCk, v.strip && !S.standardLiving);
      show(E.gBiz, v.risk && v.income && !S.investments); show(E.lBiz, v.risk && v.income && !S.investments);
      show(E.gCeil, !!S.ceiling); show(E.gCredit, !!S.ceiling && num(S.ceilingTank) > 98);
      show(E.gSS, !!S.socialSecurity); show(E.gSSUp, !!S.socialSecurity && !!S.ssIncome); show(E.lSSPool, !!S.socialSecurity); show(E.lFica, !!S.socialSecurity);
      show(E.gLock, v.risk && !!S.lock); show(E.gDistL, !(v.risk && S.lock));
      show(E.gNoBorrow, v.bf && !!S.noBorrow);
      show(E.gDbBadge, v.safe && !!S.pli);
      show(E.gGiving, v.col && !!S.giving); show(E.lGiving, v.col && !!S.giving);
      show(E.gFreeMoney, !!S.freeMoney);
      const umb = S.protect.some((p) => p.i === 2 && p.sh);
      show(E.gUmbrella, v.strip && !S.standardLiving && umb);

      /* titles and their alternates */
      hideKey(E.lIncTitle, 'incomeTank', !S.rip && !S.legacy); hideKey(E.lIncTitle, 'ripTank', !!S.rip && !S.legacy); hideKey(E.lIncTitle, 'legacyTank', !!S.legacy);
      hide(E.ripAmt, !!S.rip && !!S.showRip && num(S.remainingIncome) > 0);
      setVal('remainingIncome', money(S.remainingIncome));
      hide(E.ripProt, !!S.rip && !!S.incomeProtection); hide(E.ripWarn, !!S.lowProtection);
      setVal('protectionPct', Math.round(num(S.protectionPct)) + '%');
      hideKey(E.lRiskTitle, 'riskTitle', !!S.investments); hideKey(E.lRiskTitle, 'riskTitleBiz', !S.investments);
      hideKey(E.lSafeTitle, 'safeTitle', !S.pli); hideKey(E.lSafeTitle, 'safeTitlePli', !!S.pli);
      hideKey(E.lHouseTitle, 'houseTitle', !S.mcpFunds); hideKey(E.lHouseTitle, 'houseTitleMcp', !!S.mcpFunds);
      hide(E.lLender, S.lender != null); hideKey(E.lLender, 'lenderOther', S.lender === 'other'); hideKey(E.lLender, 'lenderInsurer', S.lender === 'insurer');
      hideKey(E.lQP, 'qp', !S.qpAlt); hideKey(E.lQP, 'qpAlt', !!S.qpAlt);
      hideKey(E.lColumn, 'column', !S.columnAlt); hideKey(E.lColumn, 'columnAlt', !!S.columnAlt);
      hideKey(E.lStrip, 'standardLiving', !!S.standardLiving); hideKey(E.lStrip, 'protectionStrip', !S.standardLiving);
      show(E.lColumn, v.col);

      /* descriptive labels */
      show(E.lIncome, lab && v.income); show(E.lDiverter, lab && v.col); show(E.lTaxFilter, lab && !S.socialSecurity);
      show(E.lRegulator, lab); show(E.lEmerg, lab && v.safe && !S.pli && !S.mcpFunds);
      show(E.gEmerg, lab && v.safe && !S.pli && !S.mcpFunds);
      show(E.lHouseEmerg, lab && v.house && !!S.mcpFunds);
      const showOut = !sg && num(S.outflow) > 0;
      show(E.lInflow, (lab || num(S.inflow) > 0) && v.incPipe && !S.rip);
      show(E.lAfterTax, lab && !showOut); show(E.lAfterTax2, showOut);
      show(E.lPctFL, lab && v.col);
      show(E.lPctLS, (lab || S.rip) && v.col && !sg);
      setVal('pctFL', Math.round(D.fl * 100) + '%');
      setVal('pctLS', Math.round(D.reg) + '%');

      /* ---- fills ---- */
      const inc = LV(S.income);
      lvl(E.fInc, v.income ? inc : 0);
      lvl(E.fFio, D.fio);
      at(E.lFio, 0, rideY(g.inc, D.fio, 2.0)); show(E.lFio, v.income && D.fio > 0.5 && !sg);
      const riskPre = LV(S.riskPreTax), risk = LV(S.risk);
      lvl(E.fDbR, LV(S.dbRisk));
      lvl(E.fOpp, D.opp); show(E.fOpp, !!S.opportunity);
      lvl(E.fRiskPre, riskPre);
      sliver(E.fRiskTax, riskPre, g.risk.iw * (100 - lv(S.riskKeep)) / 100, g.risk.iw, true);
      lvl(E.fRisk, risk);
      const collR = S.collateral === 'risk' && (S.lender == null || S.lender === 'other');
      lvl(E.fCollR, collR ? D.borrow : 0);
      at(E.lCollR, 0, rideY(g.risk, D.borrow)); show(E.lCollR, collR && D.borrow > 0.8 && !sg);
      const safe = LV(S.safe), safeTx = LV(S.safeTaxable);
      lvl(E.fPliDb, D.db);
      lvl(E.fDbS, LV(S.dbSafe));
      lvl(E.fSafeTx, safeTx);
      sliver(E.fSafeTax, safeTx, g.safe.iw * lv(S.safeTax) / 100, g.safe.iw, false);
      lvl(E.fSafe, safe);
      const collS = S.collateral === 'safe' && (S.lender == null || S.lender === 'insurer');
      lvl(E.fCollS, collS ? D.borrow : 0);
      at(E.lCollS, 0, rideY(g.safe, D.borrow)); show(E.lCollS, collS && D.borrow > 0.8 && !sg);
      at(E.lDb, 0, rideY(g.safe, D.db)); show(E.lDb, !!S.pli && D.db > 0 && D.db < 15.3 && !sg && v.safe);
      lvl(E.fDebt, D.debt);
      lvl(E.fLoc, S.loc ? LV(S.creditLine) : 0);
      lvl(E.fBorrow, D.borrow);
      lvl(E.fOppIns, S.opportunity && S.lender === 'insurer' ? D.borrow : 0);
      at(E.lDebt, 0, rideY(g.bf, D.debt)); show(E.lDebt, !!S.liabilityLabel && D.debt > 0 && v.bf && !sg);
      hideKey(E.lDebt, 'liability', D.debtWord === 'liability'); hideKey(E.lDebt, 'debt', D.debtWord === 'debt');
      at(E.lLoc, 0, rideY(g.bf, LV(S.creditLine)) - 1.05); show(E.lLoc, !!S.loc && LV(S.creditLine) > 0 && num(S.borrow) !== num(S.creditLine) && v.bf && !sg);
      lvl(E.fHouse, LV(S.house));
      const collH = S.collateral === 'house';
      lvl(E.fCollH, collH ? D.borrow : 0);
      at(E.lCollH, 0, rideY(g.house, D.borrow)); show(E.lCollH, collH && D.borrow > 0.8 && v.house && !sg);
      tf(E.fHouseRef, 0, (g.y(65 - lv(S.houseRef) / 100 * 43)) - g.house.base); show(E.fHouseRef, num(S.houseRef) !== 0);
      // simple fills hide in stacked mode
      ['fInc', 'fFio', 'fDbR', 'fOpp', 'fRiskPre', 'fRiskTax', 'fRisk', 'fCollR', 'fPliDb', 'fDbS', 'fSafeTx', 'fSafeTax', 'fSafe', 'fCollS', 'fDebt', 'fLoc', 'fBorrow', 'fOppIns', 'fHouse', 'fCollH'].forEach((k) => {
        if (sg) show(E[k], false); else if (k !== 'fOpp') show(E[k], true);
      });
      if (!sg) show(E.fOpp, !!S.opportunity);

      /* column, bands, ceiling */
      const cf = (v.col && S.futureFill && !S.legacy) ? D.colFill / 2 : 0;
      const sx = `scaleX(${r2(Math.max(0.0001, cf))})`;
      if (E.fCol && E.fCol._sx !== sx) { E.fCol._sx = sx; E.fCol.style.transitionDuration = DUR + 'ms'; E.fCol.style.transform = sx; }
      const ph = g.pipe.h - 0.12;
      const mcp = !!S.mcpFunds && v.house;
      const lifeH = Math.min(3.4, D.life);
      tf(E.bLife, 0, ph - (mcp ? 0 : lifeH)); show(E.bLife, !mcp);
      tf(E.bLifeMcp, 0, ph - (mcp ? lifeH : 0)); show(E.bLifeMcp, mcp);
      tf(E.bMcp2, 0, ph - (mcp ? Math.min(3.4, D.mcp2) : 0)); show(E.bMcp2, mcp);
      tf(E.bDebt, 0, ph - Math.min(3.4, lifeH + D.debtBand));
      tf(E.bBcf1, 0, ph - Math.min(3.4, D.bcf1));
      tf(E.bBcf2, 0, ph - Math.min(3.4, D.bcf2));
      tf(E.fCeilGreen, 0, g.ceil.h + 0.0 - Math.min(g.ceil.h, D.ceilGreen));
      tf(E.fCeilRed, 0, g.ceil.h - Math.min(g.ceil.h, D.ceilRed));
      tf(E.fCredit, 0, g.ceil.ch - Math.min(g.ceil.ch, D.ceilCredit));
      // diverter handle
      const ang = clamp(num(S.diverter), -90, 90);
      const rot = `rotate(${r2(ang)}deg)`;
      if (E.gHandle && E.gHandle._r !== rot) { E.gHandle._r = rot; E.gHandle.style.transitionDuration = DUR + 'ms'; E.gHandle.style.transform = rot; }
      // reallocation fill
      if (E.fRealloc) { E.fRealloc.setAttribute('fill', S.realloc === 'safe' ? C.sage : C.gold); show(E.fRealloc, !!S.realloc); }

      /* ---- pills ---- */
      const amt = (k) => num(S[k]);
      const pillOn = (k, on) => { show(E['p' + k], on); if (on) setVal(k, money(S[k])); };
      pillOn('contributionQP', v.col && amt('contributionQP') > 0);
      pillOn('contributionRisk', v.col && amt('contributionRisk') > 0);
      pillOn('contributionSafe', v.col && amt('contributionSafe') > 0);
      pillOn('contributionHouse', v.house && amt('contributionHouse') > 0);
      if (E.pcontributionHouse) E.pcontributionHouse.style.top = (S.gps ? g.y(5) : g.y(3)) + 'em';
      pillOn('tdContributions', v.income && v.future && v.qp && !!S.rip && amt('tdContributions') > 0);
      if (E.ptdContributions) (E.values.tdContributions || []).forEach((el) => { el.style.visibility = S.showRip ? '' : 'hidden'; });
      pillOn('contribution', amt('contribution') > 0);
      const wdOn = v.future && (amt('withdrawalRisk') > 0 || amt('withdrawalSafe') > 0);
      show(E.lWdSplit, wdOn);
      if (wdOn) {
        const tot = amt('withdrawal') || (amt('withdrawalRisk') + amt('withdrawalSafe')) || 1;
        const share = clamp(amt('withdrawalRisk') / tot, 0, 1);
        E.wdR.style.width = r2(share * 100) + '%';
        E.wdBar.dataset.tipText = `${money(S.withdrawalRisk)} (${r2(share * 100)}%)\n${money(S.withdrawalSafe)} (${r2((amt('withdrawalSafe') / tot) * 100)}%)`;
      }
      pillOn('withdrawal', v.future && amt('withdrawal') > 0);
      show(E.ploanPmt, amt('loanPmt') !== 0);
      if (amt('loanPmt') !== 0) setVal('loanPmt', money(Math.abs(amt('loanPmt'))));
      hideKey(E.ploanPmt, 'loanPmt', amt('loanPmt') > 0, true); hideKey(E.ploanPmt, 'loanDraw', amt('loanPmt') < 0, true);
      pillOn('proceeds', v.house && amt('proceeds') > 0);
      const balY = () => (S.altBalance ? g.y(49.5) + 0.5 : g.y(27) + 0.35);
      [['risk', v.risk], ['safe', v.safe], ['bf', v.bf], ['house', v.house]].forEach(([tk, on]) => {
        const k = tk + 'Balance', el = E['pb_' + tk];
        const vis2 = on && amt(k) > 0 && (!sg || !!S.showRip);
        show(el, vis2); if (vis2) setVal(k, money(S[k]));
        at(el, 0, balY(tk));
      });
      pillOn('liquidity', v.safe && amt('liquidity') > 0);
      pillOn('creditBalance', v.bf && amt('creditBalance') > 0);
      pillOn('houseEquity', v.house && amt('houseEquity') > 0);
      pillOn('inflow', v.incPipe && amt('inflow') > 0 && !S.rip);
      show(E.pgrossIncome, v.income && amt('grossIncome') > 0 && !!S.rip);
      if (E.pgrossIncome) { E.pgrossIncome.style.left = (S.gpsButtons ? 0 : 0.3) + 'em'; E.pgrossIncome.style.top = (S.gpsButtons ? g.y(12) : g.y(6.3)) + 'em'; }
      setVal('grossIncome', money(S.grossIncome));
      show(E.pnetInflow, !!S.rip && amt('grossIncome') > 0 && amt('inflow') > 0);
      if (S.rip) setVal('inflow', money(S.inflow));
      pillOn('inflowTotal', amt('inflowTotal') > 0);
      pillOn('taxesPaid', amt('taxesPaid') > 0);
      pillOn('outflow', showOut);
      hide(E.pvOut, !!S.rip); hideKey(E.pvOut, 'pv', !!S.pv, true); hideKey(E.pvOut, 'fv', !S.pv, true);
      show(E.poutflowTotal, amt('outflowTotal') > 0 || amt('oppCost') > 0);
      setVal('outflowTotal', money(S.outflowTotal)); setVal('oppCost', money(S.oppCost));
      hide(E.poutflowTotal && E.poutflowTotal.querySelector('.lib-pem-pill'), amt('outflowTotal') > 0);
      hide(E.poppCost, amt('oppCost') > 0);
      const el2 = !sg && amt('lifestyle') !== amt('outflow') && (amt('expenses') > 0 || amt('lifestyle') > 0);
      show(E.pexplife, el2);
      show(E.lLifeEnd, lab && !el2);
      hide(E.pexpLine, amt('expenses') > 0); hide(E.plifeLine, amt('lifestyle') > 0);
      show(E.pexplifeSG, sg && (amt('expenses') > 0 || amt('lifestyle') > 0));
      hide(E.pexpLineSG, amt('expenses') > 0); hide(E.plifeLineSG, amt('lifestyle') > 0);
      setVal('expenses', money(S.expenses)); setVal('lifestyle', money(S.lifestyle));
      [E.pvLife, E.pvLifeSG].forEach((el) => { hide(el, !!S.rip); hideKey(el, 'pv', !!S.pv, true); hideKey(el, 'fv', !S.pv, true); });
      const si = amt('outflow') - amt('contributionQP');
      show(E.pspendable, sg && si > 0); setVal('spendable', money(si));
      show(E.tCash, !!S.summaryCash); show(E.tBorrow, !!S.summaryBorrow);
      ['summaryPrincipal', 'summaryInterestPaid', 'summaryInterestLost', 'summaryTotal'].forEach((k) => setVal(k, money(S[k])));

      /* ---- stacked tanks ---- */
      renderStacks(v);

      /* ---- controls ---- */
      show(E.sc, !!S.scenarioPicker);
      const cur = E.scCur;
      if (cur && cur._i !== S.scenario) { cur._i = S.scenario; cur.innerHTML = t('sc' + (S.scenario || 0)); if (editing()) EFA.edit.arm(cur); }
      root.querySelectorAll('[data-sc]').forEach((b) => b.setAttribute('aria-current', String(+b.dataset.sc === (S.scenario || 0))));
      if (E.ckLabels) E.ckLabels.setAttribute('aria-checked', String(!!S.labels));
      if (E.ckRank) E.ckRank.setAttribute('aria-checked', String(!!S.rankOn));
      if (E.ckShield) E.ckShield.setAttribute('aria-checked', String(!!S.shieldOn));
      show(E.src, v.bf && !!S.borrowSource);
      if (E.srcBtn) E.srcBtn.setAttribute('aria-pressed', String(!!S.opportunity));
      hideKey(E.srcBtn, 'forExpense', !S.opportunity); hideKey(E.srcBtn, 'forOpportunity', !!S.opportunity);
      root.querySelectorAll('[data-cc]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.cc === S.collateral)));
      // protection badges and shields
      PROTECT.forEach((pr, i) => {
        const it = S.protect.find((p) => p.i === i);
        show(E['pRank' + i], v.strip && !S.standardLiving && !!it && !!S.rankOn);
        if (it) setVal('rank' + i, String(it.n));
        show(E['pShield' + i], v.strip && !S.standardLiving && !!it && !!it.sh);
      });
      // purchase box
      const pbOn = !!S.purchase;
      show(E.box, pbOn);
      if (pbOn && E.boxPic && E.boxPic._p !== S.purchase) {
        E.boxPic._p = S.purchase;
        E.boxPic.innerHTML = S.purchase === 'car' ? EFA.art.ill.car() : S.purchase === 'college' ? collegeArt() : EFA.art.ill.house();
      }
      hideKey(E.boxTitle, 'mcpBox', !S.purchaseAlt, true); hideKey(E.boxTitle, 'mcpBoxAlt', !!S.purchaseAlt, true);
      // MCP purpose input
      show(E.mcpWrap, mcp);
      if (E.mcpIn && document.activeElement !== E.mcpIn) {
        const nm = S.mcpName == null ? txt('mcpName') : String(S.mcpName);
        if (E.mcpIn.value !== nm) E.mcpIn.value = nm;
      }

      /* ---- knobs, hints, chevrons, hotspots ---- */
      const kOn = !!S.sliders && !sg;
      const knob = (k, on, x, y) => { show(E[k], on); if (on) at(E[k], x, y); };
      knob('kIncome', kOn && v.income && !!S.legacy, g.inc.x + g.inc.w - 0.05, fillTop(g.inc, inc));
      knob('kRiskPre', kOn && v.risk, g.risk.x + 0.05, fillTop(g.risk, riskPre));
      knob('kRisk', kOn && v.risk, g.risk.x + g.tw - 0.05, fillTop(g.risk, risk));
      knob('kRiskKeep', kOn && v.risk, g.risk.ix0 + g.risk.iw * lv(S.riskKeep) / 100, g.risk.feet + 0.35);
      knob('kSafeTx', kOn && v.safe, g.safe.x + 0.05, fillTop(g.safe, safeTx));
      knob('kSafe', kOn && v.safe, g.safe.x + g.tw - 0.05, fillTop(g.safe, safe));
      knob('kSafeTax', kOn && v.safe, g.safe.ix0 + g.safe.iw * lv(S.safeTax) / 100, g.safe.feet + 0.35);
      knob('kBfL', kOn && v.bf, g.bf.x + 0.05, fillTop(g.bf, LV(S.loc ? S.creditLine : S.otherDebt)));
      knob('kBorrow', kOn && v.bf, g.bf.x + g.tw - 0.05, fillTop(g.bf, LV(S.borrow)));
      knob('kHouseRef', kOn && v.house, g.house.x + 0.05, g.y(65 - lv(S.houseRef) / 100 * 43) + 0.15);
      knob('kHouse', kOn && v.house, g.house.x + g.tw - 0.05, fillTop(g.house, LV(S.house)));
      knob('kReg', !!S.sliders && !sg, g.regTrack.x, g.regTrack.y1 - (g.regTrack.y1 - g.regTrack.y0) * D.reg / 100);
      knob('kRem', !!S.sliders && !sg && v.bf, g.remTrack.x, g.remTrack.y1 - (g.remTrack.y1 - g.remTrack.y0) * lv(S.remaining) / 100);
      show(E.remTrack, !!S.sliders && !sg && v.bf);
      knob('kCeil', kOn && !!S.ceiling, g.ceil.x + g.ceil.w + 0.05, g.ceil.y + g.ceil.h - Math.min(g.ceil.h, 0.125 * lv(S.ceilingTank)));
      knob('kCeilCredit', kOn && !!S.ceiling && num(S.ceilingTank) > 98, g.ceil.x + g.ceil.w + 0.05, g.ceil.cy + g.ceil.ch - Math.min(g.ceil.ch, D.ceilCredit));
      const hints = lab;
      show(E.iQP, hints && v.income && !S.legacy); show(E.iRisk, hints && v.future && !S.legacy); show(E.iSafe, hints && v.future && !S.legacy);
      show(E.iRiskTitle, hints && v.risk && !!S.tankLinks); show(E.iHouseTitle, hints && v.house);
      show(E.iColumn, hints && v.col && !!S.tankLinks); show(E.iReallocL, hints && v.col && v.risk && v.safe); show(E.iReallocR, hints && v.col && v.risk && v.safe);
      show(E.iPli, hints && v.safe && !!S.tankLinks); show(E.iSource, hints && v.bf && !!S.borrowSource); show(E.iStrip, hints && v.strip);
      show(E.iSS, hints && !!S.socialSecurity);
      LIFE_ICONS.forEach((ic, i) => { if (i < 3) show(E['iLife' + i], hints && v.strip && S.standardLiving); });
      PROTECT.forEach((pr, i) => show(E['iProt' + i], hints && v.strip && !S.standardLiving));
      const chev = (k, on, visible) => { show(E[k], !!S.chevrons && on); hide(E[k + 'Up'], !visible); hide(E[k + 'Dn'], !!visible); };
      chev('cIncome', true, v.income); chev('cFuture', true, v.future); chev('cBF', true, v.bf); chev('cHouse', !S.ceiling, !!S.showHouse);
      const links = linksOn();
      showHot('hQP', v.income && !S.legacy); showHot('hAM', links && v.col); showHot('hTax', links); showHot('hReg', links);
      showHot('hCvss', links && v.risk); showHot('hRab', links && v.risk); showHot('hSab', links && v.safe);
      showHot('hPli', v.safe && !!S.tankLinks); showHot('hAccdist', links && v.col); showHot('hRia', links && v.col);
      showHot('hReallocL', v.col && v.risk && v.safe); showHot('hReallocR', v.col && v.risk && v.safe);
      showHot('hDbBadge', links && v.safe && !!S.pli); showHot('hInlet', links && v.income); showHot('hIncTitle', links && v.income && !S.rip);
      showHot('hSSPool', !!S.socialSecurity); showHot('hGiving', v.col && !!S.giving);
      LIFE_ICONS.forEach((ic, i) => { if (i < 3) showHot('hLife' + i, v.strip && S.standardLiving); });
      PROTECT.forEach((pr, i) => showHot('hProt' + i, v.strip && !S.standardLiving && (links || S.rankOn || S.shieldOn)));
      if (E.lIncomeLink) E.lIncomeLink.classList.toggle('lib-pem-link', links);
      if (E.ripAmt) E.ripAmt.classList.toggle('lib-pem-link', true);
      if (E.boxCalc) E.boxCalc.hidden = !links;
      refreshRings();
    }
    function hideKey(container, key, on, both) {
      if (!container) return;
      const sel = `[data-cp$="|${copyMap[key] || key}"]`;
      container.querySelectorAll(sel).forEach((el) => { if (el.hidden === on) el.hidden = !on; });
      if (both) return;
    }
    function showHot(k, on) { const el = E[k]; if (el) { el.hidden = !on; } }
    function linksOn() { return !!S.links && !reviewed; }

    /* ---------- account-stacked tanks ---------- */
    function renderStacks(v) {
      const sg = !!S.stacked;
      const stacks = sg ? (S.stacks || (S.accounts ? stacksFromAccounts(S.accounts, num(S.chartIndex), { includeNdb: S.includeNdb }) : null)) : null;
      const tanks = { income: [g.inc, 'remainingIncome', v.income], risk: [g.risk, 'riskBalance', v.risk], safe: [g.safe, 'safeBalance', v.safe], bf: [g.bf, 'bfBalance', v.bf], house: [g.house, 'houseBalance', v.house] };
      Object.keys(tanks).forEach((tk) => {
        const el = E['bars_' + tk]; if (!el) return;
        const [tank, balKey, on] = tanks[tk];
        show(el, sg && on);
        if (!sg) { if (el._sig) { el._sig = ''; el.innerHTML = ''; } return; }
        const list = (stacks && (stacks[tk === 'bf' ? 'debt' : tk] || stacks[tk])) || [];
        const ref = Math.max(num(S.tankSize) || 2500000, num(S[balKey]), 1);
        const H = tk === 'income' ? tank.base - g.y(21.6) : tank.base - g.y(22.1);
        const TH = Math.min(HF, H);
        const main = list.filter((b) => !b.ndb && b.kind !== 'ndb'), ndb = S.includeNdb === false ? [] : list.filter((b) => b.ndb || b.kind === 'ndb');
        let y0 = 0, html = '';
        const right = tk === 'risk' || tk === 'house';
        main.concat(ndb).forEach((b) => {
          const isN = b.ndb || b.kind === 'ndb';
          let hh = Math.min(TH, Math.max(0, num(b.value)) / ref * TH);
          if (isN && tk === 'income') hh = Math.min(hh, TH * 0.2);
          if (hh <= 0) return;
          const val2 = Math.max(0, num(b.value)), tax = Math.max(0, num(b.tax));
          let taxPct = val2 > 0 ? clamp(tax / val2 * 100, 0, 100) : (tax > 0 ? 100 : 0);
          const col = barColor(b, tk);
          const bal = `<i style="width:${r2(100 - taxPct)}%;background:${col}"></i>`, tx = `<i style="width:${r2(taxPct)}%;background:${C.brickLt}"></i>`;
          const tip = b.tip || `${b.name || ''}\n${money(val2)}${tax ? '\n' + money(tax) : ''}`;
          html += `<div class="lib-pem-bar ${b.rmd ? 'rmd' : ''}" style="bottom:${r2(y0)}em;height:${r2(hh)}em" data-tip-text="${esc(tip)}">${right ? bal + tx : tx + bal}${hh > 0.8 ? `<span>${esc(b.name || '')}</span>` : ''}</div>`;
          y0 += hh;
        });
        const sig = html + '|' + H;
        if (el._sig !== sig) { el._sig = sig; el.innerHTML = html; }
      });
    }

    /* =================================================================================
       state changes
       ================================================================================= */
    function applyValues(out, by) {
      const prevPli = S.pli, prevOpp = S.opportunity, prevColl = S.collateral, prevCeil = S.ceiling, prevNarrow = S.narrow;
      const D0 = derive();
      Object.keys(out).forEach((k) => { S[k] = out[k]; });
      if ('pli' in out && !!out.pli !== !!prevPli) {
        if (S.pli) { S.lender = S.collateral !== 'safe' ? 'other' : 'insurer'; const m = Math.max(num(S.safe), num(S.safeTaxable)); S.safe = m; S.safeTaxable = m; }
        else S.lender = null;
      } else if (S.pli) {
        if ('safe' in out && !('safeTaxable' in out)) S.safeTaxable = S.safe;
        if ('safeTaxable' in out && !('safe' in out)) S.safe = S.safeTaxable;
      }
      if ('collateral' in out && out.collateral !== prevColl && S.pli) S.lender = S.collateral !== 'safe' ? 'other' : 'insurer';
      if ('opportunity' in out && !!out.opportunity !== !!prevOpp && S.opportunity) { S.debtStart = D0.debt; S.borrowStart = D0.borrow; }
      if ('ceiling' in out && !!out.ceiling !== !!prevCeil && S.ceiling) S.ceilingCredit = 0;
      if ('narrow' in out && out.narrow !== prevNarrow) return 'rebuild';
      if ('stacks' in out || 'accounts' in out) { /* re-read in renderStacks */ }
      return by;
    }
    function set(src, opts) {
      if (dead) return api;
      opts = opts || {};
      const { out, fl, sb } = normalize(src);
      if ('showFuture' in out && out.showFuture !== S.showFuture && opts.chevron) {
        if (!out.showFuture) { S.regulatorSaved = S.regulator; out.regulator = 100; } else if (S.regulatorSaved != null) { out.regulator = S.regulatorSaved; S.regulatorSaved = null; }
      }
      const r = applyValues(out);
      if (r === 'rebuild') { build(); render(0); } else render(opts.ms == null ? 800 : opts.ms, opts.ease);
      if (Object.keys(fl).length) flow(Object.keys(fl).filter((k) => fl[k]), true), flow(Object.keys(fl).filter((k) => !fl[k]), false);
      Object.keys(sb).forEach((k) => {
        const v = sb[k];
        if (v === true) { if (!runs[k]) play(k); } else if (v === false) stop(k);
      });
      return api;
    }
    function setNow(obj) { set(obj, { ms: 0 }); }

    /* =================================================================================
       flows
       ================================================================================= */
    function flow(names, on) {
      if (dead) return api;
      if (on === undefined) on = true;
      (Array.isArray(names) ? names : [names]).forEach((nm) => {
        if (FLOW_ORIG[nm]) nm = FLOW_ORIG[nm];
        if (!(nm in flows)) return;
        flows[nm] = !!on;
        show(E['flow_' + nm], !!on);
      });
      return api;
    }

    /* =================================================================================
       storyboards: a precomputed timeline per run; stop() finishes the running tweens,
       cancels everything queued and switches the run's flows off (original leaks fixed)
       ================================================================================= */
    function timeline(def) {
      const ev = [];
      let tw = 0;
      const cursor = (t0, after) => ({
        t: t0,
        tw(key, from, to, ms) { const e = { t: t0, k: 'tw', key, from, to, ms: ms || 0, id: ++tw }; ev.push(e); return cursor(t0 + (ms || 0), e.id); },
        wait(ms) { return cursor(t0 + ms, null); },
        set(key, v) { ev.push({ t: t0, k: 'set', key, v, after }); return cursor(t0, after); },
        on(names) { ev.push({ t: t0, k: 'flow', names, v: true, after }); return cursor(t0, after); },
        off(names) { ev.push({ t: t0, k: 'flow', names, v: false, after }); return cursor(t0, after); },
        do(fn) { ev.push({ t: t0, k: 'fn', fn, after }); return cursor(t0, after); }
      });
      const b = cursor(0, null);
      b.at = (t0) => cursor(t0, null);
      const stops = [];
      b.onStop = (fn) => stops.push(fn);
      def(b);
      return { ev, stops };
    }
    const helper = {
      get state() { return S; },
      setNow: (o) => setNow(o),
      shrinkPicture: (on) => { if (E.box) E.box.classList.toggle('shrink', !!on); }
    };
    function startRun(name, def, opts) {
      opts = opts || {};
      const tl = timeline(def);
      const run = { name, timers: [], active: {}, flowsOn: new Set(), stops: tl.stops, done: false, finished: false, opts };
      runs[name] = run;
      const scale = reduced() ? 0 : 1;
      const end = tl.ev.reduce((m, e) => Math.max(m, e.t + (e.ms || 0)), 0);
      const exec = (e) => {
        if (run.done) return;
        if (e.k === 'tw') {
          const from = (e.from == null || opts.from === false) ? num(S[e.key]) : e.from;
          if (scale === 0) { setNow({ [e.key]: e.to }); return; }
          setNow({ [e.key]: from });
          void root.offsetWidth;
          run.active[e.id] = e;
          set({ [e.key]: e.to }, { ms: e.ms, ease: 'linear' });
          run.timers.push(ctx.timeout(() => { delete run.active[e.id]; }, e.ms));
        } else if (e.k === 'set') setNow({ [e.key]: e.v });
        else if (e.k === 'flow') { flow(e.names, e.v); e.names.forEach((f) => { if (e.v) run.flowsOn.add(f); }); }
        else if (e.k === 'fn') e.fn(helper);
      };
      const sorted = tl.ev.slice().sort((a, b) => a.t - b.t);
      if (scale === 0) { sorted.forEach(exec); }
      else sorted.forEach((e) => { if (e.t === 0) exec(e); else run.timers.push(ctx.timeout(() => exec(e), e.t)); });
      run.finishT = ctx.timeout(() => { run.finished = true; emit('end', { name, finished: true }); if (opts.done) opts.done(name); }, end * scale + 5);
      run.timers.push(run.finishT);
      run.tl = tl;
      return run;
    }
    function play(name, opts) {
      if (dead) return api;
      name = String(name || '').replace(/^SB/, '');
      const def = STORIES[name];
      if (!def) { console.warn('EFA.lib.pem: unknown storyboard "' + name + '"'); return api; }
      if (runs[name]) return api;
      startRun(name, def, opts);
      return api;
    }
    function stop(name) {
      name = String(name || '').replace(/^SB/, '');
      const run = runs[name];
      if (!run) return api;
      run.done = true;
      run.timers.forEach((tm) => clearTimeout(tm));
      // the running tween jumps to its end value and its completion actions run
      if (Object.keys(run.active).length) finishMotion();
      Object.keys(run.active).forEach((id) => {
        const e = run.active[id];
        setNow({ [e.key]: e.to });
        run.tl.ev.filter((x) => x.after === e.id && x.k !== 'tw').forEach((x) => {
          if (x.k === 'set') setNow({ [x.key]: x.v });
          else if (x.k === 'flow') flow(x.names, x.v);
          else if (x.k === 'fn') x.fn(helper);
        });
      });
      run.flowsOn.forEach((f) => flow(f, false));
      run.stops.forEach((fn) => { try { fn(helper); } catch (e) { console.error(e); } });
      delete runs[name];
      if (!run.finished) emit('end', { name, finished: false });
      render(0);
      return api;
    }
    function stopAll() { Object.keys(runs).forEach((k) => stop(k)); return api; }
    /** jump every running level transition inside the model to its end (CSS transitions keep running otherwise) */
    function finishMotion() {
      if (!model || !model.getAnimations) return;
      try {
        model.getAnimations({ subtree: true }).forEach((a) => {
          if (a.transitionProperty && a.effect && a.effect.target !== model && a.playState === 'running') a.finish();
        });
      } catch (e) { /* older engines: the transition simply completes */ }
    }
    function animate(to, ms, opts) {
      opts = opts || {};
      const name = '_anim' + (++animSeq);
      const def = (b) => {
        if (opts.flows) b.on(opts.flows);
        let maxT = 0;
        Object.keys(to).forEach((k0) => {
          const k = ORIG[k0] || k0;
          const v = to[k0];
          const from = Array.isArray(v) ? v[0] : null, end = Array.isArray(v) ? v[1] : v;
          b.tw(k, from, end, ms || 0); maxT = Math.max(maxT, ms || 0);
        });
        if (opts.flows && !opts.keep) b.at(maxT).off(opts.flows);
      };
      startRun(name, def, { done: () => { if (!opts.keep) delete runs[name]; if (opts.done) opts.done(); }, ease: opts.ease });
      return { stop: () => stop(name), name };
    }

    /* =================================================================================
       camera, lesson frame
       ================================================================================= */
    function winBox() {
      if (frame && !expandedView) return { x: 0, y: 0, w: dims.bw * (frame.width || 0.55), h: dims.bh };
      return { x: 0, y: 0, w: dims.bw, h: dims.bh };
    }
    function partRect(name) {
      if (name && typeof name === 'object') {
        const r = name;
        const xx = r.left != null ? parseFloat(r.left) / 100 * g.Wm : (r.x != null ? r.x : 0);
        const yy = r.top != null ? parseFloat(r.top) / 100 * MH : (r.y != null ? r.y : 0);
        return { x: xx, y: yy, w: num(r.w) || 1, h: num(r.h) || 1 };
      }
      const tk = (t2) => ({ x: t2.x - 0.25, y: t2.top - (t2.lid ? 1.35 : 0.15), w: t2.w + 0.5, h: t2.feet - t2.top + (t2.lid ? 1.4 : 0.2) });
      const D = derive();
      const fillR = (t2, h2) => ({ x: t2.ix0, y: fillTop(t2, h2), w: t2.iw, h: Math.max(0.4, h2) });
      switch (name) {
        case 'income': return tk(g.inc);
        case 'inlet': return { x: g.inlet.cx - 1.6, y: g.inlet.y0 - 1.6, w: 3.2, h: g.inc.top - g.inlet.y0 + 2.2 };
        case 'qp': return { x: g.inlet.cx, y: g.qp.y - 1.0, w: g.qp.x1 - g.inlet.cx + 0.8, h: 2.4 };
        case 'risk': return tk(g.risk);
        case 'safe': return tk(g.safe);
        case 'borrowed': return tk(g.bf);
        case 'house': return tk(g.house);
        case 'riskFill': return fillR(g.risk, Math.max(LV(S.risk), LV(S.riskPreTax)));
        case 'safeFill': return fillR(g.safe, Math.max(LV(S.safe), LV(S.safeTaxable)));
        case 'riskTax': { const w = g.risk.iw * (100 - lv(S.riskKeep)) / 100, h2 = LV(S.riskPreTax); return { x: g.risk.ix0 + g.risk.iw - w, y: fillTop(g.risk, h2), w: Math.max(0.4, w), h: Math.max(0.4, h2) }; }
        case 'safeTax': { const w = g.safe.iw * lv(S.safeTax) / 100, h2 = LV(S.safeTaxable); return { x: g.safe.ix0, y: fillTop(g.safe, h2), w: Math.max(0.4, w), h: Math.max(0.4, h2) }; }
        case 'riskOutlet': return { x: g.risk.x + g.tw - 1.2, y: g.dist.y - 1.9, w: g.colC - g.risk.x - g.tw + 1.6, h: 3.6 };
        case 'diverter': return { x: g.man.x0 - 0.8, y: g.dial.cy - 2.6, w: g.man.x1 - g.man.x0 + 1.6, h: 4.4 };
        case 'column': return { x: g.col.x - 0.4, y: g.col.y0, w: g.col.w + 0.8, h: g.col.y1 - g.col.y0 };
        case 'realloc': return { x: g.realloc.x0 - 0.3, y: g.realloc.y - 0.5, w: g.realloc.x1 - g.realloc.x0 + 0.6, h: g.realloc.h + 1.0 };
        case 'filter': return { x: g.filter.x - 0.4, y: g.filter.y - 1.9, w: g.filter.w + 0.8, h: g.filter.h + 2.3 };
        case 'regulator': return { x: g.reg.x - 0.2, y: g.reg.y - 0.2, w: g.reg.w + 0.4, h: g.reg.h + 1.6 };
        case 'pipe': return { x: g.life.x0, y: g.pipe.y - 0.3, w: g.life.x1 - g.life.x0, h: g.pipe.h + 0.6 };
        case 'endCap': return { x: g.end.x, y: g.pipe.y - 0.4, w: 5.2, h: 34.3 - g.pipe.y };
        case 'purchase': return { x: g.purchase.x, y: g.purchase.y, w: g.purchase.w, h: g.purchase.h };
        case 'strip': return { x: S.standardLiving ? g.strip.x : g.strip.xp, y: g.strip.y, w: S.standardLiving ? g.strip.wl : g.strip.wp, h: g.strip.h };
        case 'remaining': return { x: g.remTrack.x - 0.8, y: g.remTrack.y0 - 0.5, w: 1.6, h: g.remTrack.y1 - g.remTrack.y0 + 1.0 };
        case 'scenario': return { x: 0, y: g.y(93) - 0.9, w: 10.5, h: 2.6 };
        default: return null;
      }
    }
    function camFor(v) {
      const wb = winBox(), em = dims.em, Wm = g.Wm;
      if (!v || v === 'full') return { s: 1, tx: dims.ox, ty: dims.oy };
      if (typeof v === 'string') v = { fit: [v] };
      if (v.fit) {
        const rs = (Array.isArray(v.fit) ? v.fit : [v.fit]).map(partRect).filter(Boolean);
        if (!rs.length) return { s: 1, tx: dims.ox, ty: dims.oy };
        const pad = v.pad == null ? 1 : num(v.pad);
        const x0 = Math.min(...rs.map((r) => r.x)) - pad, y0 = Math.min(...rs.map((r) => r.y)) - pad;
        const x1 = Math.max(...rs.map((r) => r.x + r.w)) + pad, y1 = Math.max(...rs.map((r) => r.y + r.h)) + pad;
        const s = v.scale || clamp(Math.min(wb.w / ((x1 - x0) * em), wb.h / ((y1 - y0) * em)), 0.3, 4);
        const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
        return { s, tx: wb.x + wb.w / 2 - s * em * cx, ty: wb.y + wb.h / 2 - s * em * cy };
      }
      if (v.shift) {
        const s = num(v.scale) || 1, L2 = num(v.shift[0]), T2 = num(v.shift[1]);
        return { s, tx: dims.ox + em * (L2 / 100 * Wm + Wm / 2 * (1 - s)), ty: dims.oy + em * (T2 / 100 * MH + MH / 2 * (1 - s)) };
      }
      const s = num(v.scale) || 1;
      const cx = (v.x == null ? 50 : num(v.x)) / 100 * Wm, cy = (v.y == null ? 50 : num(v.y)) / 100 * MH;
      return { s, tx: wb.x + wb.w / 2 - s * em * cx, ty: wb.y + wb.h / 2 - s * em * cy };
    }
    function applyCamera(ms, from) {
      const wb = winBox();
      win.style.width = r2(wb.w) + 'px'; win.style.height = r2(wb.h) + 'px';
      const c = camera = camFor(currentView);
      const v = `translate(${r2(c.tx)}px,${r2(c.ty)}px) scale(${r2(c.s * 10000) / 10000})`;
      if (from) {
        model.style.transitionDuration = '0ms';
        model.style.transform = `translate(${r2(from.tx)}px,${r2(from.ty)}px) scale(${r2(from.s * 10000) / 10000})`;
        void model.offsetWidth;
      }
      model.style.transitionDuration = (ms == null ? 600 : ms) + 'ms';
      model.style.transform = v;
    }
    let currentView = cfg.view || 'full';
    function view(v, opts) {
      opts = opts || {};
      currentView = v || 'full';
      applyCamera(opts.ms == null ? 600 : opts.ms);
      return api;
    }
    function buildFrameUI() {
      if (!frame || frame.toggle === false) { ui.innerHTML = ''; return; }
      ui.innerHTML = `<button type="button" class="lib-pem-tog" data-k="togExpand" aria-label="Show the whole model">${htmlIcon('expand', '', 2)}</button><button type="button" class="lib-pem-tog" data-k="togContract" aria-label="Zoom back in">${htmlIcon('contract', '', 2)}</button>`;
      E.togExpand = ui.querySelector('[data-k="togExpand"]'); E.togContract = ui.querySelector('[data-k="togContract"]');
      E.togExpand.addEventListener('click', () => { if (!editing()) expand(true); });
      E.togContract.addEventListener('click', () => { if (!editing()) expand(false); });
      placeToggles();
    }
    function placeToggles() {
      if (!E.togExpand) return;
      const w = dims.bw * (frame.width || 0.55);
      Object.assign(E.togExpand.style, { left: Math.round(w - 44) + 'px', top: Math.round(dims.bh - 104) + 'px' });
      Object.assign(E.togContract.style, { left: Math.round(dims.bw - 52) + 'px', top: Math.round(dims.bh - 104) + 'px' });
      E.togExpand.hidden = expandedView; E.togContract.hidden = !expandedView;
    }
    function expand(on) {
      if (!frame) return api;
      on = !!on;
      const was = expandedView;
      expandedView = on;
      const shows = frame.expandShows || ['labels', 'lifestyle'];
      const vals = {};
      shows.forEach((p) => { if (PART_KEYS[p]) vals[PART_KEYS[p]] = on; });
      if (Object.keys(vals).length) set(vals, { ms: 0 });
      const panels = frame.panel ? (typeof frame.panel === 'string' ? ctx.$$(frame.panel) : (Array.isArray(frame.panel) ? frame.panel : [frame.panel])) : [];
      panels.forEach((p) => ctx.show(p, !on));
      currentView = on ? 'full' : (frame.zoom || 'full');
      if (on && !was) {
        const full = { s: 1, tx: dims.ox, ty: dims.oy };
        applyCamera(reduced() ? 0 : 500, { s: 1, tx: full.tx - 0.23 * g.Wm * dims.em, ty: full.ty });
      } else applyCamera(0);
      placeToggles();
      if (was !== on) emit('view', { expanded: on });
      return api;
    }

    /* =================================================================================
       highlight, place, rect
       ================================================================================= */
    function highlight(target, opts) {
      opts = opts || {};
      const r = partRect(target);
      if (!r) { console.warn('EFA.lib.pem.highlight: unknown target', target); return null; }
      const hid = opts.id || ('h' + (++ringSeq));
      if (rings[hid]) rings[hid].el.remove();
      const el = document.createElement('div');
      el.className = 'lib-pem-ring' + (opts.wink ? ' lib-pem-off' : '');
      const pad = opts.pad == null ? 0.25 : num(opts.pad);
      Object.assign(el.style, { left: r2(r.x - pad) + 'em', top: r2(r.y - pad) + 'em', width: r2(r.w + pad * 2) + 'em', height: r2(r.h + pad * 2) + 'em' });
      if (opts.round != null) el.style.borderRadius = num(opts.round) + 'em';
      hl.appendChild(el);
      rings[hid] = { el, target, opts };
      const go = () => { if (!el.isConnected) return; el.classList.remove('lib-pem-off'); if (opts.wink && !reduced()) el.classList.add('wink'); };
      if (opts.delay) ctx.timeout(go, opts.delay); else if (opts.wink) { void el.offsetWidth; go(); } else go();
      return hid;
    }
    function refreshRings() {
      Object.keys(rings).forEach((k) => {
        const rg = rings[k];
        if (typeof rg.target === 'string' && /Fill|Tax$/.test(rg.target)) {
          const r = partRect(rg.target), pad = rg.opts.pad == null ? 0.25 : num(rg.opts.pad);
          Object.assign(rg.el.style, { left: r2(r.x - pad) + 'em', top: r2(r.y - pad) + 'em', width: r2(r.w + pad * 2) + 'em', height: r2(r.h + pad * 2) + 'em' });
        }
      });
    }
    function unhighlight(hid) {
      if (hid == null) { Object.keys(rings).forEach((k) => { rings[k].el.remove(); delete rings[k]; }); }
      else if (rings[hid]) { rings[hid].el.remove(); delete rings[hid]; }
      return api;
    }
    function place(html, target, opts) {
      opts = opts || {};
      const r = partRect(target) || { x: 0, y: 0, w: 4, h: 4 };
      const el = document.createElement('div');
      el.className = 'lib-pem-placed' + (opts.cls ? ' ' + opts.cls : '');
      const w = opts.w != null ? num(opts.w) : r.w, h = opts.h != null ? num(opts.h) : r.h;
      Object.assign(el.style, { left: r2(r.x + r.w / 2 - w / 2 + num(opts.dx)) + 'em', top: r2(r.y + r.h / 2 - h / 2 + num(opts.dy)) + 'em', width: r2(w) + 'em', height: r2(h) + 'em' });
      if (typeof html === 'string') el.innerHTML = html; else if (html) el.appendChild(html);
      hl.appendChild(el);
      if (editing()) EFA.edit.arm(el);
      return el;
    }
    function rect(target) {
      const r = partRect(target);
      if (!r) return null;
      const c = camera || camFor(currentView), s = c.s * dims.em;
      let ox = 0, oy = 0, node = host;
      while (node && node !== ctx.el) { ox += node.offsetLeft || 0; oy += node.offsetTop || 0; node = node.offsetParent; }
      return { x: ox + c.tx + r.x * s, y: oy + c.ty + r.y * s, w: r.w * s, h: r.h * s };
    }

    /* =================================================================================
       interactions
       ================================================================================= */
    function emit(ev, payload) {
      (handlers[ev] || []).slice().forEach((fn) => { try { fn(payload, api); } catch (e) { console.error(e); } });
    }
    function on(ev, fn) {
      const map = { RIPClickEvent: 'ripclick', PVLifestyleClickEvent: 'pvclick', GEClickEvent: 'economy' };
      ev = map[ev] || ev;
      (handlers[ev] = handlers[ev] || []).push(fn);
      return api;
    }
    const change = (key, value, by) => emit('change', { key, value, by: by || 'click' });
    function toggle(key, by) { set({ [key]: !S[key] }, { ms: 500 }); change(key, S[key], by); }
    function doJump(key, screen) {
      if (!linksOn()) return;
      const depth = EFA.player && EFA.player.stack ? EFA.player.stack.length : 0;
      const rec = { sid: ctx.id, pres: ctx.pres, idx: EFA.player ? EFA.player.idx : 0, depth, state: snapshot() };
      emit('jump', { key, screen });
      RETURNS.push(rec);
      ctx.jump(key, screen);
      if (!EFA.player || !EFA.player.stack || EFA.player.stack.length <= depth) { const i = RETURNS.indexOf(rec); if (i >= 0) RETURNS.splice(i, 1); }
    }
    function snapshot() {
      const st = JSON.parse(JSON.stringify(S));
      return { state: st, flows: Object.assign({}, flows), expanded: expandedView, view: currentView };
    }
    function restoreIfReturning() {
      if (!EFA.player || !EFA.player.stack) return null;
      const depth = EFA.player.stack.length;
      for (let i = RETURNS.length - 1; i >= 0; i--) if (RETURNS[i].depth > depth) RETURNS.splice(i, 1);
      const i = RETURNS.findIndex((r) => r.sid === ctx.id && r.pres === ctx.pres && r.depth === depth && r.idx === EFA.player.idx);
      if (i < 0) return null;
      const rec = RETURNS[i]; RETURNS.splice(i, 1);
      return rec.state;
    }
    function preset(i) {
      i = clamp(Math.round(num(i)), 0, PRESETS.length - 1);
      const p = PRESETS[i];
      const out = { ceiling: false, legacy: false, socialSecurity: false, ssIncome: false, income: 0, ceilingTank: 0, ceilingCredit: 0,
        showIncome: !!p[0], showFuture: !!p[1], showBorrowed: !!p[2], showHouse: !!p[3], showQP: !!p[4],
        riskPreTax: p[5], risk: p[6], safeTaxable: p[7], safe: p[8], borrow: p[9], house: p[10], regulator: p[11], remaining: p[12], collateral: p[13], scenario: i, regulatorSaved: null };
      Object.assign(out, p[14] || {});
      set(out, { ms: 700 });
      emit('scenario', { index: i });
      change('scenario', i, 'preset');
      return api;
    }
    function cycleLender() {
      if (!S.showBorrowed) return;
      const nx = S.lender == null ? 'other' : S.lender === 'other' ? 'insurer' : 'other';
      const out = { lender: nx };
      if (S.collateral === 'safe' && S.pli && nx === 'other') out.collateral = 'none';
      else if ((S.collateral === 'none' || S.collateral === 'risk') && S.pli && nx !== 'other') out.collateral = 'safe';
      set(out, { ms: 500 }); change('lender', nx);
    }
    function protectClick(i) {
      const list = S.protect.map((p) => Object.assign({}, p));
      const it = list.find((p) => p.i === i);
      const nextN = () => list.reduce((m, p) => Math.max(m, p.n || 0), 0) + 1;
      if (S.rankOn && S.shieldOn) {
        if (!it) list.push({ i, n: nextN(), sh: false });
        else if (list.length >= PROTECT.length) it.sh = !it.sh;
        else { list.splice(list.indexOf(it), 1); list.forEach((p) => { if (p.n > it.n) p.n -= 1; }); }
      } else if (S.rankOn) {
        if (!it) list.push({ i, n: nextN(), sh: false });
        else { list.splice(list.indexOf(it), 1); list.forEach((p) => { if (p.n > it.n) p.n -= 1; }); }
      } else if (S.shieldOn) {
        if (!it) list.push({ i, n: nextN(), sh: true }); else it.sh = !it.sh;
      }
      S.protect = list; render(300); change('protect', list);
    }
    function bind() {
      const q = (k) => E[k];
      const click = (k, fn) => { const el = q(k); if (el) el.addEventListener('click', (e) => { if (editing() || dead) return; e.stopPropagation(); fn(e); }); };
      // section chevrons
      click('cIncome', () => { set({ showIncome: !S.showIncome }, { ms: 500 }); change('showIncome', S.showIncome); });
      click('cFuture', () => { set({ showFuture: !S.showFuture }, { ms: 500, chevron: true }); change('showFuture', S.showFuture); });
      click('cBF', () => { set({ showBorrowed: !S.showBorrowed }, { ms: 500 }); change('showBorrowed', S.showBorrowed); });
      click('cHouse', () => { set({ showHouse: !S.showHouse }, { ms: 500 }); change('showHouse', S.showHouse); });
      // toggles
      click('hQP', () => toggle('showQP'));
      click('iQP', () => toggle('showQP'));
      click('iRisk', () => toggle('showRisk'));
      click('iSafe', () => toggle('showSafe'));
      const lq = q('lQPLink');
      if (lq) lq.addEventListener('contextmenu', (e) => { if (editing()) return; e.preventDefault(); toggle('qpAlt'); });
      if (q('hQP')) q('hQP').addEventListener('contextmenu', (e) => { if (editing()) return; e.preventDefault(); toggle('qpAlt'); });
      click('lQPLink', () => doJump('QPD2T', 'qpdo2t1'));
      click('lRiskTitle', () => { if (S.tankLinks) toggle('investments'); });
      click('iRiskTitle', () => { if (S.tankLinks) toggle('investments'); });
      click('lColumn', () => { if (S.tankLinks) toggle('columnAlt'); });
      click('iColumn', () => { if (S.tankLinks) toggle('columnAlt'); });
      click('hPli', () => { if (S.tankLinks) toggle('pli'); });
      click('iPli', () => { if (S.tankLinks) toggle('pli'); });
      click('lHouseTitle', () => toggle('mcpFunds'));
      click('iHouseTitle', () => toggle('mcpFunds'));
      click('lBFTitle', () => cycleLender());
      click('lStripLink', () => toggle('standardLiving'));
      click('iStrip', () => toggle('standardLiving'));
      click('hReallocL', () => { set({ realloc: S.realloc === 'risk' ? null : 'risk' }, { ms: 300 }); change('realloc', S.realloc); });
      click('hReallocR', () => { set({ realloc: S.realloc === 'safe' ? null : 'safe' }, { ms: 300 }); change('realloc', S.realloc); });
      click('iReallocL', () => { set({ realloc: S.realloc === 'risk' ? null : 'risk' }, { ms: 300 }); });
      click('iReallocR', () => { set({ realloc: S.realloc === 'safe' ? null : 'safe' }, { ms: 300 }); });
      click('hSSPool', () => toggle('ssIncome'));
      click('lSSLink', () => toggle('ssIncome'));
      click('iSS', () => toggle('ssIncome'));
      click('hGiving', () => emit('economy'));
      click('ripAmt', () => emit('ripclick'));
      ['pvOut', 'pvLife', 'pvLifeSG'].forEach((k) => click(k, () => emit('pvclick')));
      // links
      click('hInlet', () => doJump('HLEV', 'hlev1'));
      click('lIncomeLink', () => doJump('HLEV', 'hlev1'));
      click('hIncTitle', () => doJump('WIP', 'wip1'));
      click('hAM', () => doJump('AM', 'am1'));
      click('hTax', () => doJump('TAXHIST', 'taxhist1'));
      click('hReg', () => doJump(cfg.regulatorLink === 'FGPS' ? 'FGPS' : 'RRON', cfg.regulatorLink === 'FGPS' ? 'fgps1' : 'rron1'));
      click('hCvss', () => doJump('CVSS', 'cvss1'));
      click('hRab', () => doJump('RAB', 'rab1'));
      click('hSab', () => doJump('SAB', 'sab1'));
      click('hAccdist', () => doJump('ACCDIST', 'accdist1'));
      click('hRia', () => doJump('RIA', 'ria1'));
      click('hDbBadge', () => doJump('PLI101', 'plif1'));
      click('boxCalc', () => doJump('F101', 'f1'));
      // lifestyle strip opens the purchase box; protection strip jumps or ranks
      ['house', 'car', 'college'].forEach((p, i) => click('hLife' + i, () => { set({ purchase: p }, { ms: 300 }); change('purchase', p); }));
      click('boxClose', () => { set({ purchase: null }, { ms: 300 }); change('purchase', null); });
      click('boxTitle', () => toggle('purchaseAlt'));
      PROTECT.forEach((pr, i) => click('hProt' + i, () => { if (S.rankOn || S.shieldOn) protectClick(i); else doJump(pr[0], pr[1]); }));
      click('ckRank', () => toggle('rankOn'));
      click('ckShield', () => toggle('shieldOn'));
      // borrow source controls
      click('srcBtn', () => toggle('opportunity'));
      root.querySelectorAll('[data-cc]').forEach((b) => b.addEventListener('click', (e) => { if (editing()) return; e.stopPropagation(); set({ collateral: b.dataset.cc }, { ms: 500 }); change('collateral', b.dataset.cc); }));
      // scenario picker
      const sc = q('sc');
      click('scBtn', () => sc.classList.toggle('open'));
      root.querySelectorAll('[data-sc]').forEach((b) => b.addEventListener('click', (e) => { if (editing()) return; e.stopPropagation(); sc.classList.remove('open'); preset(+b.dataset.sc); }));
      click('ckLabels', () => toggle('labels'));
      root.addEventListener('click', (e) => { if (sc && !sc.contains(e.target)) sc.classList.remove('open'); });
      // MCP purpose box (typing stays in the field)
      const mi = q('mcpIn');
      if (mi) {
        mi.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') mi.blur(); });
        mi.addEventListener('input', () => { S.mcpName = mi.value; change('mcpName', mi.value, 'type'); });
      }
      // house reference: double-click the house slider area aligns the reference line with the house level
      if (q('kHouse')) q('kHouse').addEventListener('dblclick', () => { if (!editing()) { set({ houseRef: S.house }, { ms: 300 }); change('houseRef', S.house); } });
      bindKnobs();
      bindTips();
    }
    function bindKnobs() {
      const vk = {
        kIncome: { key: 'income', tk: () => g.inc }, kRiskPre: { key: 'riskPreTax', tk: () => g.risk }, kRisk: { key: 'risk', tk: () => g.risk },
        kSafeTx: { key: 'safeTaxable', tk: () => g.safe }, kSafe: { key: 'safe', tk: () => g.safe },
        kBfL: { key: () => (S.loc ? 'creditLine' : 'otherDebt'), tk: () => g.bf }, kBorrow: { key: 'borrow', tk: () => g.bf },
        kHouse: { key: 'house', tk: () => g.house },
        kHouseRef: { key: 'houseRef', y: (yy) => (65 - yy / 0.365) / 43 * 100 },
        kReg: { key: 'regulator', y: (yy) => (g.regTrack.y1 - yy) / (g.regTrack.y1 - g.regTrack.y0) * 100 },
        kRem: { key: 'remaining', y: (yy) => (g.remTrack.y1 - yy) / (g.remTrack.y1 - g.remTrack.y0) * 100 },
        kCeil: { key: 'ceilingTank', y: (yy) => (g.ceil.y + g.ceil.h - yy) / 0.125 },
        kCeilCredit: { key: 'ceilingCredit', y: (yy) => (g.ceil.cy + g.ceil.ch - yy) / 0.04 },
        kRiskKeep: { key: 'riskKeep', x: (xx) => (xx - g.risk.ix0) / g.risk.iw * 100 },
        kSafeTax: { key: 'safeTax', x: (xx) => (xx - g.safe.ix0) / g.safe.iw * 100 }
      };
      Object.keys(vk).forEach((k) => {
        const el = E[k]; if (!el) return;
        const d = vk[k];
        let dragging = false;
        const val = (e) => {
          const r = model.getBoundingClientRect();
          const per = r.height / MH;
          const xx = (e.clientX - r.left) / per, yy = (e.clientY - r.top) / per;
          if (d.x) return d.x(xx);
          if (d.y) return d.y(yy);
          const tk = d.tk();
          return (tk.base - yy) / HF * 100;
        };
        el.addEventListener('pointerdown', (e) => {
          if (editing() || dead) return;
          e.preventDefault(); e.stopPropagation();
          dragging = true; el.classList.add('is-drag');
          try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        });
        el.addEventListener('pointermove', (e) => {
          if (!dragging) return;
          const key = typeof d.key === 'function' ? d.key() : d.key;
          let v = clamp(r2(val(e)), 0, 100);
          if (key === 'ceilingCredit') {
            const delta = v - num(S.ceilingCredit);
            if (delta > 0) S.borrow = Math.min(100, num(S.borrow) + Math.max(1, delta / 10));
          }
          set({ [key]: v }, { ms: 0 });
        });
        const end = (e) => {
          if (!dragging) return;
          dragging = false; el.classList.remove('is-drag');
          try { el.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          const key = typeof d.key === 'function' ? d.key() : d.key;
          change(key, S[key], 'drag');
        };
        el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
      });
    }
    /* tooltips: copy-key tips are editable (they stay open while the pointer is over them) */
    function bindTips() {
      let hideT = null, cur = null;
      const placeTip = (target) => {
        const rr = root.getBoundingClientRect(), tr = target.getBoundingClientRect();
        const sc = rr.width / (root.offsetWidth || 1);
        tipEl.style.left = '0px'; tipEl.style.top = '0px';
        const tw2 = tipEl.offsetWidth, th = tipEl.offsetHeight;
        let x = (tr.left - rr.left) / sc + (tr.width / sc) / 2 - tw2 / 2;
        let y = (tr.top - rr.top) / sc - th - 10;
        if (y < 6) y = (tr.bottom - rr.top) / sc + 10;
        x = clamp(x, 6, root.offsetWidth - tw2 - 6);
        tipEl.style.left = Math.round(x) + 'px'; tipEl.style.top = Math.round(y) + 'px';
      };
      const showTip = (target) => {
        const key = target.dataset.tip, raw = target.dataset.tipText;
        let html = '';
        if (raw) html = esc(raw);
        else if (key) {
          if (/Tip$/.test(key) && key in DEF) { const s2 = S[key] || (key === 'safeTaxableTip' ? S.safeTaxTip : ''); if (!s2) return; html = esc(s2); }
          else html = t(key);
        } else if (target.dataset.jump) html = `${t('tipOpen')} ${esc(EFA.presName ? EFA.presName(target.dataset.jump) : target.dataset.jump)}`;
        if (!html) return;
        clearTimeout(hideT); cur = target;
        tipEl.innerHTML = html;
        if (editing()) EFA.edit.arm(tipEl);
        tipEl.classList.add('show');
        placeTip(target);
      };
      const hideTip = (fast) => { clearTimeout(hideT); hideT = setTimeout(() => { if (!tipEl.matches(':hover') && !(tipEl.contains(document.activeElement))) { tipEl.classList.remove('show'); cur = null; } }, fast ? 60 : 260); };
      root.addEventListener('mouseover', (e) => {
        const t2 = e.target.closest('[data-tip],[data-tip-text],[data-jump]');
        if (!t2 || !root.contains(t2) || t2 === cur) return;
        showTip(t2);
      });
      root.addEventListener('mouseout', (e) => {
        const t2 = e.target.closest('[data-tip],[data-tip-text],[data-jump]');
        if (t2 && !t2.contains(e.relatedTarget)) hideTip();
      });
      tipEl.addEventListener('mouseleave', () => hideTip(true));
      // link hotspots name their target
      const J = { hInlet: 'HLEV', lIncomeLink: 'HLEV', hIncTitle: 'WIP', hAM: 'AM', hTax: 'TAXHIST', hReg: cfg.regulatorLink === 'FGPS' ? 'FGPS' : 'RRON', hCvss: 'CVSS', hRab: 'RAB', hSab: 'SAB', hAccdist: 'ACCDIST', hRia: 'RIA', hDbBadge: 'PLI101', boxCalc: 'F101' };
      Object.keys(J).forEach((k) => { if (E[k]) E[k].dataset.jump = J[k]; });
      PROTECT.forEach((pr, i) => { if (E['hProt' + i]) E['hProt' + i].dataset.jump = pr[0]; });
      if (E.lBFTitle) E.lBFTitle.dataset.tip = 'tipLender';
      if (E.lRiskTitle) E.lRiskTitle.dataset.tip = 'tipRiskTitle';
      if (E.lHouseTitle) E.lHouseTitle.dataset.tip = 'tipHouseTitle';
      ['iQP', 'iRisk', 'iSafe'].forEach((k, i) => { if (E[k]) E[k].dataset.tip = ['tipQP', 'tipRisk', 'tipSafe'][i]; });
      if (E.iPli) E.iPli.dataset.tip = 'tipPli';
      if (E.iColumn) E.iColumn.dataset.tip = 'tipColumn';
      ['iReallocL', 'iReallocR'].forEach((k) => { if (E[k]) E[k].dataset.tip = 'tipRealloc'; });
      // fill notes from the host
      const fillTip = { fRiskPre: 'riskPreTaxTip', fRiskTax: 'riskTaxTip', fSafeTx: 'safeTaxableTip', fSafeTax: 'safeTaxTip', fDbR: 'dbRiskTip', fDbS: 'dbSafeTip', fCollR: 'bfRiskTip', fCollS: 'bfSafeTip' };
      Object.keys(fillTip).forEach((k) => { if (E[k]) { E[k].dataset.tip = fillTip[k]; E[k].style.pointerEvents = 'auto'; } });
      if (E.fSafeTx) E.fSafeTx.dataset.tip = 'safeTaxableTip';
    }

    /* =================================================================================
       public instance
       ================================================================================= */
    const api = {
      set, setNow,
      get: (k) => { k = ORIG[k] || k; return S[k]; },
      state: () => JSON.parse(JSON.stringify(Object.assign({}, S, { flows: Object.assign({}, flows) }))),
      show(parts, onv) {
        if (onv === undefined) onv = true;
        const out = {};
        (Array.isArray(parts) ? parts : [parts]).forEach((p) => { if (PART_KEYS[p]) out[PART_KEYS[p]] = !!onv; });
        return set(out, { ms: 500 });
      },
      hide(parts) { return api.show(parts, false); },
      flow, flowsOff: () => flow(FLOW_NAMES, false),
      play, stop, stopAll, playing: (nm) => !!runs[String(nm || '').replace(/^SB/, '')] && !runs[String(nm || '').replace(/^SB/, '')].finished,
      animate, highlight, unhighlight, place, rect, view,
      expand, expanded: () => expandedView,
      on, preset,
      destroy() { stopAll(); dead = true; if (root) root.remove(); root = null; },
      get el() { return root; },
      get model() { return model; }
    };

    /* ----- start ----- */
    const restored = restoreIfReturning();
    const first = normalize(cfg);
    Object.keys(first.out).forEach((k) => { S[k] = first.out[k]; });
    if (S.pli) { S.lender = S.lender == null ? (S.collateral !== 'safe' ? 'other' : 'insurer') : S.lender; }
    if (reviewed) S.links = false;
    if (cfg.frame) { frame = Object.assign({ width: 0.55, expanded: false, toggle: true }, cfg.frame); expandedView = !!frame.expanded; }
    if (restored) {
      Object.assign(S, restored.state);
      if (frame) expandedView = !!restored.expanded;
      if (restored.view) currentView = restored.view;
    }
    if (frame) {
      const vals = {};
      (frame.expandShows || ['labels', 'lifestyle']).forEach((p) => { if (PART_KEYS[p]) vals[PART_KEYS[p]] = expandedView; });
      Object.assign(S, vals);
      currentView = expandedView ? 'full' : (frame.zoom || 'full');
    }
    Object.keys(cfg.on || {}).forEach((ev) => on(ev, cfg.on[ev]));
    build();
    render(0);
    if (frame && frame.panel) {
      const panels = typeof frame.panel === 'string' ? ctx.$$(frame.panel) : (Array.isArray(frame.panel) ? frame.panel : [frame.panel]);
      panels.forEach((p) => ctx.show(p, !expandedView));
    }
    Object.keys(first.fl).forEach((k) => flow(k, first.fl[k]));
    if (restored) Object.keys(restored.flows || {}).forEach((k) => flow(k, restored.flows[k]));
    Object.keys(first.sb).forEach((k) => { if (first.sb[k] === true) play(k); });
    return api;
  }

  /* ---------- account bars from account records (spec "Tank fill mode"), for stacked mode ---------- */
  function barColor(b, tk) {
    const k = b.kind;
    if (b.ndb || k === 'ndb') return C.ndb;
    if (k === 'invest') return C.goldLt;
    if (k === 'saving' || k === 'income') return C.sageLt;
    if (k === 'debt') return C.brick;
    if (k === 'lifestyleLoan') return C.lend;
    if (b.color) return b.color;
    if (tk === 'safe') return C.sageLt;
    if (tk === 'risk') return C.goldLt;
    return (b.riskLevel || '').toLowerCase() === 'low' ? C.sageLt : C.goldLt;
  }
  function stacksFromAccounts(accounts, k, opts) {
    opts = opts || {};
    const out = { income: [], risk: [], safe: [], debt: [], house: [] };
    const row = (a) => (a.rows && a.rows.length ? a.rows[Math.min(k, a.rows.length - 1)] : (a.row || a)) || {};
    (accounts || []).forEach((a) => {
      if (!a || a.excluded) return;
      const r = row(a), type = String(a.type || '').toLowerCase(), tank = String(a.tank || '').toLowerCase();
      const isPli = type === 'pli' || type === 'cashvaluelife', isTerm = type === 'term', isAnn = type === 'annuity';
      const isLoan = type === 'loan' || type === 'installmentloan', isCredit = type === 'credit' || type === 'creditcard';
      const lowRisk = String(a.riskLevel || '').toLowerCase() === 'low';
      const push = (t2, bar) => { if (out[t2]) out[t2].push(Object.assign({ name: a.name, rmd: !!r.rmd }, bar)); };
      // main bars
      if (tank && out[tank] && !isTerm) {
        if (tank === 'income') {
          if (type === 'inflow' || type === 'income') push('income', { value: r.income, tax: r.taxes, kind: 'income' });
          else if (isAnn || isLoan) push('income', { value: r.income, tax: r.taxes, kind: 'income' });
        } else if (tank === 'debt') {
          if (isLoan) push('debt', { value: r.loanBalance, kind: a.purpose === 'lifestyle' ? 'lifestyleLoan' : 'debt' });
          else if (isCredit) push('debt', { value: r.loanBalance != null ? r.loanBalance : r.balance, kind: 'debt' });
          else if (type === 'outflow' || type === 'expense') push('debt', { value: r.expense, kind: 'debt' });
        } else if (isPli) {
          push(tank, { value: num(r.surrender) + num(r.loanBalance), tax: r.potentialTax, kind: tank === 'safe' ? 'saving' : 'invest' });
        } else if (type === 'property') {
          push(tank, { value: r.balance, tax: r.potentialTax, kind: tank === 'safe' || lowRisk ? 'saving' : 'invest' });
        } else if (type === 'outflow' || type === 'expense') {
          push(tank, { value: r.expense, kind: 'debt' });
        } else {
          const kind = tank === 'safe' ? 'saving' : tank === 'risk' ? 'invest' : (lowRisk ? 'saving' : 'invest');
          push(tank, { value: isAnn ? (r.surrender != null ? r.surrender : r.balance) : r.balance, tax: r.potentialTax, kind });
        }
      }
      if (isPli) push('debt', { value: r.loanBalance, kind: 'debt' });
      if (isAnn && r.asInflow && tank !== 'income') push('income', { value: r.income, tax: r.taxes, kind: 'income' });
      // net death benefit bars
      if (opts.includeNdb !== false) {
        if (isPli && out[tank]) push(tank, { value: Math.max(num(r.deathBenefit) - num(r.surrender), 0), kind: 'ndb', ndb: true });
        if (isTerm || isAnn) push('income', { value: isTerm ? r.deathBenefit : Math.max(num(r.deathBenefit) - num(r.surrender != null ? r.surrender : r.balance), 0), kind: 'ndb', ndb: true });
        if (isLoan && r.creditRemaining) push('debt', { value: r.creditRemaining, kind: 'ndb', ndb: true });
      }
    });
    Object.keys(out).forEach((t2) => { out[t2] = out[t2].filter((b) => num(b.value) > 0); });
    return out;
  }

  L.pem = {
    mount,
    defaults: JSON.parse(JSON.stringify(DEF)),
    FLOWS: FLOW_NAMES.slice(),
    STORIES: STORY_NAMES.filter((s) => !/Run$/.test(s)),
    PARTS: { show: Object.keys(PART_KEYS), geometry: GEO_PARTS.slice() },
    art: { shield: shieldArt, college: collegeArt },
    stacksFromAccounts,
    copy: COPY,
    SID
  };
})();
