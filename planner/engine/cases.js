// Six sample households, built to exercise every part of the platform.
//
// All invented. No figure here belongs to a real person. Each case is shaped to put
// pressure on a different part of the engine, so that walking the six touches every module.
//
// The premium finance cases follow the carrier's own stated client profile: age 18 to 60
// and net worth of five million or higher (Allianz ASI-466, R-10/2024). A case outside that
// profile would not be accepted, so modelling one would teach nothing.

const Y = 2026;

export const CASES = [
  /* ---------------------------------------------------------------- 1 */
  {
    id:'single-teacher', estateExtras:{}, label:'Dana Whitfield',
    silo:'Tenured teacher', segment:'Regular, single',
    note:'CalSTRS 2% at 60, hired before 2013. Modest balances, a pension that does most of the work, and no Social Security on covered service. The pension gap case in its plainest form.',
    household:{
      asOfYear:Y, filingStatus:'single', residenceState:'CA',
      people:[{id:'d', name:'Dana Whitfield', birthYear:1969, retirementAge:62, planningHorizonAge:92}],
      accounts:[
        {id:'d403b', name:"Dana's 403(b)", owner:'d', type:'four03b', balance:214000},
        {id:'droth', name:"Dana's Roth IRA", owner:'d', type:'rothIRA', balance:38000},
        {id:'dbank', name:'Checking', owner:'d', type:'bank', balance:22000, basis:22000, excludeFromInvested:true}
      ],
      property:[{id:'home', name:'Primary Home', value:520000}],
      liabilities:[{id:'mtg', name:'Mortgage', balance:188000}],
      incomes:[
        {id:'sal', name:"Dana's salary", owner:'d', kind:'salary', amount:96500,
          inflationIndex:'general', end:{type:'retirement', person:'d'}},
        {id:'pen', name:'CalSTRS pension', owner:'d', kind:'pension', amount:62000,
          inflationIndex:'general', start:{type:'retirement', person:'d'}}
      ],
      expenses:[{id:'liv', name:'Living expenses', category:'living', amount:58000},
                {id:'hea', name:'Retirement health care', category:'health', amount:7200}],
      goals:[],
    },
    settings:{ allocation:{usLargeCap:.38, intlDeveloped:.12, usCoreBond:.42, cash:.08},
      withdrawalSequence:'taxable-deferred-free', portfolioTurnover:.10,
      qualifiedDividendShare:.85, longTermGainShare:.90, advisoryFee:0,
      sweepAccountId:'dbank', includeMedicare:true },
  },

  /* ---------------------------------------------------------------- 2 */
  {
    id:'married-classified', estateExtras:{}, label:'Marcus and Renata Oyelaran',
    silo:'School classified staff', segment:'Regular, married',
    note:'One CalPERS schools pension and one private salary with a 401(k). Two retirement dates two years apart, a survivor question, and both on Social Security. The ordinary working couple.',
    household:{
      asOfYear:Y, filingStatus:'marriedFilingJointly', residenceState:'CA',
      people:[{id:'m', name:'Marcus Oyelaran', birthYear:1966, retirementAge:65, planningHorizonAge:91},
              {id:'r', name:'Renata Oyelaran', birthYear:1968, retirementAge:67, planningHorizonAge:94}],
      accounts:[
        {id:'m457', name:"Marcus's 457(b)", owner:'m', type:'four57b', balance:186000},
        {id:'r401', name:"Renata's 401(k)", owner:'r', type:'traditional401k', balance:412000},
        {id:'rroth', name:"Renata's Roth IRA", owner:'r', type:'rothIRA', balance:74000},
        {id:'brk', name:'Joint brokerage', owner:'m', type:'taxable', balance:96000, basis:71000},
        {id:'bank', name:'Checking', owner:'m', type:'bank', balance:31000, basis:31000, excludeFromInvested:true}
      ],
      property:[{id:'home', name:'Primary Home', value:690000}],
      liabilities:[{id:'mtg', name:'Mortgage', balance:214000}],
      incomes:[
        {id:'msal', name:"Marcus's salary", owner:'m', kind:'salary', amount:72000,
          inflationIndex:'general', end:{type:'retirement', person:'m'}},
        {id:'rsal', name:"Renata's salary", owner:'r', kind:'salary', amount:108000,
          inflationIndex:'general', end:{type:'retirement', person:'r'}},
        {id:'mpen', name:'CalPERS pension', owner:'m', kind:'pension', amount:34000,
          inflationIndex:'general', start:{type:'retirement', person:'m'}},
        {id:'mss', name:"Marcus's Social Security", owner:'m', kind:'socialSecurity',
          benefitAtFRA:21600, amount:21600, inflationIndex:'socialSecurity',
          start:{type:'age', person:'m', value:67}},
        {id:'rss', name:"Renata's Social Security", owner:'r', kind:'socialSecurity',
          benefitAtFRA:38400, amount:38400, inflationIndex:'socialSecurity',
          start:{type:'age', person:'r', value:70}}
      ],
      expenses:[{id:'liv', name:'Living expenses', category:'living', amount:84000},
                {id:'hea', name:'Retirement health care', category:'health', amount:13000}],
      goals:[{id:'trip', name:'Annual travel', kind:'vacation', amount:9000,
              start:{type:'firstRetirement'}}],
    },
    settings:{ allocation:{usLargeCap:.42, intlDeveloped:.14, emergingMarkets:.04, usCoreBond:.33, cash:.07},
      withdrawalSequence:'taxable-deferred-free', portfolioTurnover:.10,
      qualifiedDividendShare:.85, longTermGainShare:.90, advisoryFee:0,
      sweepAccountId:'bank', includeMedicare:true },
  },

  /* ---------------------------------------------------------------- 3 */
  {
    id:'whale-single', estateExtras:{charitableBequests:500000}, legacyIntent:500000, label:'Dr. Priya Raghunathan',
    silo:'University faculty, retired', segment:'Whale, single',
    note:'A retired department chair sitting on a large 403(b) and a 457(b) she has not touched. Already drawing a pension. The case is the rollover decision and the tax drag of required distributions she does not need.',
    household:{
      asOfYear:Y, filingStatus:'single', residenceState:'CA',
      people:[{id:'p', name:'Priya Raghunathan', birthYear:1958, retirementAge:67, planningHorizonAge:96}],
      accounts:[
        {id:'p403', name:"Priya's 403(b)", owner:'p', type:'four03b', balance:1480000},
        {id:'p457', name:"Priya's 457(b)", owner:'p', type:'four57b', balance:612000},
        {id:'pira', name:"Priya's Rollover IRA", owner:'p', type:'traditionalIRA', balance:340000},
        {id:'proth', name:"Priya's Roth IRA", owner:'p', type:'rothIRA', balance:185000},
        {id:'pbrk', name:'Brokerage', owner:'p', type:'taxable', balance:425000, basis:248000},
        {id:'pbank', name:'Checking', owner:'p', type:'bank', balance:68000, basis:68000, excludeFromInvested:true}
      ],
      property:[{id:'home', name:'Primary Home', value:1250000},
                {id:'rental', name:'Rental Property', value:580000}],
      liabilities:[],
      incomes:[
        {id:'pen', name:'University pension', owner:'p', kind:'pension', amount:118000,
          inflationIndex:'general', start:{type:'immediate'}},
        {id:'pss', name:"Priya's Social Security", owner:'p', kind:'socialSecurity',
          benefitAtFRA:39600, amount:39600, inflationIndex:'socialSecurity',
          start:{type:'age', person:'p', value:70}},
        {id:'rent', name:'Rental income', owner:'p', kind:'other', amount:34000,
          inflationIndex:'general', start:{type:'immediate'}}
      ],
      expenses:[{id:'liv', name:'Living expenses', category:'living', amount:112000},
                {id:'hea', name:'Retirement health care', category:'health', amount:16800}],
      goals:[{id:'gift', name:'Annual family gifting', kind:'gift', amount:36000, start:{type:'immediate'}}
      ],
    },
    settings:{ allocation:{usLargeCap:.34, intlDeveloped:.12, emergingMarkets:.04, realEstate:.05,
        usCoreBond:.33, tips:.06, cash:.06},
      withdrawalSequence:'taxable-deferred-free', portfolioTurnover:.08,
      qualifiedDividendShare:.88, longTermGainShare:.92, advisoryFee:0,
      sweepAccountId:'pbank', includeMedicare:true },
  },

  /* ---------------------------------------------------------------- 4 */
  {
    id:'whale-married', estateExtras:{lifeInsuranceInEstate:250000}, legacyIntent:1500000, label:'Captain Ray and Lourdes Mendiola',
    silo:'Police and fire, post-DROP', segment:'Whale, married',
    note:'A fire captain who took the DROP lump sum, plus a spouse with her own county pension. Two safety pensions, a large rollover sitting in cash, and an estate that is already near the exclusion. Touches estate, tax and the whole withdrawal sequence.',
    household:{
      asOfYear:Y, filingStatus:'marriedFilingJointly', residenceState:'CA',
      people:[{id:'ray', name:'Ray Mendiola', birthYear:1965, retirementAge:55, planningHorizonAge:90},
              {id:'lou', name:'Lourdes Mendiola', birthYear:1967, retirementAge:60, planningHorizonAge:95}],
      accounts:[
        {id:'drop', name:'DROP rollover IRA', owner:'ray', type:'traditionalIRA', balance:1950000},
        {id:'r457', name:"Ray's 457(b)", owner:'ray', type:'four57b', balance:488000},
        {id:'l457', name:"Lourdes's 457(b)", owner:'lou', type:'four57b', balance:362000},
        {id:'lroth', name:"Lourdes's Roth IRA", owner:'lou', type:'rothIRA', balance:142000},
        {id:'brk', name:'Joint brokerage', owner:'ray', type:'taxable', balance:760000, basis:402000},
        {id:'bank', name:'Checking and savings', owner:'ray', type:'bank', balance:185000, basis:185000, excludeFromInvested:true}
      ],
      property:[{id:'home', name:'Primary Home', value:1480000},
                {id:'cabin', name:'Mountain Cabin', value:465000}],
      liabilities:[{id:'mtg', name:'Mortgage', balance:296000}],
      incomes:[
        {id:'rpen', name:'Safety pension, Ray', owner:'ray', kind:'pension', amount:142000,
          inflationIndex:'general', start:{type:'immediate'}},
        {id:'lpen', name:'County pension, Lourdes', owner:'lou', kind:'pension', amount:78000,
          inflationIndex:'general', start:{type:'retirement', person:'lou'}},
        {id:'lsal', name:"Lourdes's salary", owner:'lou', kind:'salary', amount:124000,
          inflationIndex:'general', end:{type:'retirement', person:'lou'}},
        {id:'lss', name:"Lourdes's Social Security", owner:'lou', kind:'socialSecurity',
          benefitAtFRA:32400, amount:32400, inflationIndex:'socialSecurity',
          start:{type:'age', person:'lou', value:67}}
      ],
      expenses:[{id:'liv', name:'Living expenses', category:'living', amount:156000},
                {id:'hea', name:'Retirement health care', category:'health', amount:19000}],
      goals:[{id:'wed', name:"Daughter's wedding", kind:'wedding', amount:60000,
              start:{type:'afterYears', value:3}, end:{type:'afterYears', value:3}}
      ],
    },
    settings:{ allocation:{usLargeCap:.40, usSmallMidCap:.06, intlDeveloped:.14, emergingMarkets:.04,
        usCoreBond:.26, highYield:.04, cash:.06},
      withdrawalSequence:'taxable-deferred-free', portfolioTurnover:.10,
      qualifiedDividendShare:.85, longTermGainShare:.90, advisoryFee:0,
      sweepAccountId:'bank', includeMedicare:true },
  },

  /* ---------------------------------------------------------------- 5 */
  {
    id:'pf-single', estateExtras:{lifeInsuranceOutOfEstate:4000000, _designTarget:true}, legacyIntent:5000000, label:'Tomás Ferreira',
    silo:'Business owner', segment:'Premium finance, single',
    note:'Sole owner of a logistics company, age 54, net worth above the carrier threshold. The case is whether financing the premium beats paying it from the balance sheet, and what the loan does to the estate. Carrier profile: age 18 to 60, net worth five million or higher.',
    household:{
      asOfYear:Y, filingStatus:'single', residenceState:'CA',
      people:[{id:'t', name:'Tomás Ferreira', birthYear:1972, retirementAge:65, planningHorizonAge:92}],
      accounts:[
        {id:'tsep', name:'SEP IRA', owner:'t', type:'sep', balance:1240000},
        {id:'tbrk', name:'Brokerage', owner:'t', type:'taxable', balance:2850000, basis:1640000},
        {id:'troth', name:'Roth IRA', owner:'t', type:'rothIRA', balance:210000},
        {id:'tbank', name:'Operating and personal cash', owner:'t', type:'bank', balance:640000, basis:640000, excludeFromInvested:true}
      ],
      property:[{id:'home', name:'Primary Home', value:2150000},
                {id:'biz', name:'Business real estate', value:1850000}],
      liabilities:[{id:'mtg', name:'Mortgage', balance:740000}],
      incomes:[
        {id:'k1', name:'Business income', owner:'t', kind:'salary', amount:720000,
          inflationIndex:'general', end:{type:'retirement', person:'t'}},
        {id:'tss', name:"Tomás's Social Security", owner:'t', kind:'socialSecurity',
          benefitAtFRA:45600, amount:45600, inflationIndex:'socialSecurity',
          start:{type:'age', person:'t', value:70}}
      ],
      expenses:[{id:'liv', name:'Living expenses', category:'living', amount:260000},
                {id:'hea', name:'Retirement health care', category:'health', amount:18000}],
      goals:[],
    },
    settings:{ allocation:{usLargeCap:.46, usSmallMidCap:.08, intlDeveloped:.14, emergingMarkets:.05,
        usCoreBond:.18, cash:.09},
      withdrawalSequence:'taxable-deferred-free', portfolioTurnover:.12,
      qualifiedDividendShare:.85, longTermGainShare:.90, advisoryFee:0,
      sweepAccountId:'tbank', includeMedicare:true },
  },

  /* ---------------------------------------------------------------- 6 */
  {
    id:'pf-married', estateExtras:{lifeInsuranceOutOfEstate:8000000, _designTarget:true}, legacyIntent:10000000, label:'Everett and Simone Baptiste',
    silo:'Business owners', segment:'Premium finance, married',
    note:'A married pair of owners holding the policy inside an irrevocable trust, so the death benefit sits outside the estate while the loan sits inside it. The largest estate of the six and the one where the exclusion actually bites. Carrier profile: age 18 to 60, net worth five million or higher.',
    household:{
      asOfYear:Y, filingStatus:'marriedFilingJointly', residenceState:'CA',
      people:[{id:'e', name:'Everett Baptiste', birthYear:1970, retirementAge:67, planningHorizonAge:93},
              {id:'s', name:'Simone Baptiste', birthYear:1973, retirementAge:65, planningHorizonAge:96}],
      accounts:[
        {id:'e401', name:"Everett's 401(k)", owner:'e', type:'traditional401k', balance:2380000},
        {id:'s401', name:"Simone's 401(k)", owner:'s', type:'traditional401k', balance:1140000},
        {id:'eroth', name:"Everett's Roth IRA", owner:'e', type:'rothIRA', balance:420000},
        {id:'sroth', name:"Simone's Roth IRA", owner:'s', type:'rothIRA', balance:310000},
        {id:'brk', name:'Joint brokerage', owner:'e', type:'taxable', balance:4600000, basis:2480000},
        {id:'bank', name:'Cash and treasuries', owner:'e', type:'bank', balance:980000, basis:980000, excludeFromInvested:true}
      ],
      property:[{id:'home', name:'Primary Home', value:3400000},
                {id:'second', name:'Second Home', value:1250000},
                {id:'biz', name:'Business interest', value:6500000}],
      liabilities:[{id:'mtg', name:'Mortgage', balance:1150000}],
      incomes:[
        {id:'esal', name:"Everett's compensation", owner:'e', kind:'salary', amount:890000,
          inflationIndex:'general', end:{type:'retirement', person:'e'}},
        {id:'ssal', name:"Simone's compensation", owner:'s', kind:'salary', amount:540000,
          inflationIndex:'general', end:{type:'retirement', person:'s'}},
        {id:'ess', name:"Everett's Social Security", owner:'e', kind:'socialSecurity',
          benefitAtFRA:48000, amount:48000, inflationIndex:'socialSecurity',
          start:{type:'age', person:'e', value:70}},
        {id:'sss', name:"Simone's Social Security", owner:'s', kind:'socialSecurity',
          benefitAtFRA:44400, amount:44400, inflationIndex:'socialSecurity',
          start:{type:'age', person:'s', value:70}}
      ],
      expenses:[{id:'liv', name:'Living expenses', category:'living', amount:420000},
                {id:'hea', name:'Retirement health care', category:'health', amount:24000}],
      goals:[{id:'edu', name:'Grandchildren education fund', kind:'other', amount:40000,
              start:{type:'afterYears', value:2}, end:{type:'afterYears', value:11}}
      ],
    },
    settings:{ allocation:{usLargeCap:.44, usSmallMidCap:.08, intlDeveloped:.15, emergingMarkets:.05,
        realEstate:.04, usCoreBond:.16, cash:.08},
      withdrawalSequence:'taxable-deferred-free', portfolioTurnover:.12,
      qualifiedDividendShare:.85, longTermGainShare:.90, advisoryFee:0,
      sweepAccountId:'bank', includeMedicare:true },
  }
      ];

// A case as the engine wants it: household plus settings on one object.
export function planOf(c) {
  return { household: structuredClone(c.household), settings: structuredClone(c.settings) };
}
