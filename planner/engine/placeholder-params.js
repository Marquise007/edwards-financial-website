// PLACEHOLDER PARAMETERS - NOT FOR ANY CLIENT OUTPUT.
// These exist only so the engine plumbing can be exercised before the verified
// params/federal-tax.json, params/social-security.json and params/medicare.json land.
// Every number below is a round stand-in, deliberately not a real statutory figure,
// so that nobody can mistake this file for the law.
export const PLACEHOLDER = {
  _status: 'PENDING VERIFICATION',
  inflation: { general: 0.025, health: 0.05, education: 0.05, socialSecurity: 0.025, tax: 0.025 },
  federal: {
    _status: 'PENDING VERIFICATION',
    brackets: {
      single: [ {upTo:12000,rate:0.10},{upTo:48000,rate:0.12},{upTo:103000,rate:0.22},
                {upTo:197000,rate:0.24},{upTo:250000,rate:0.32},{upTo:626000,rate:0.35},
                {upTo:null,rate:0.37} ],
      marriedFilingJointly: [ {upTo:24000,rate:0.10},{upTo:96000,rate:0.12},{upTo:206000,rate:0.22},
                {upTo:394000,rate:0.24},{upTo:500000,rate:0.32},{upTo:751000,rate:0.35},
                {upTo:null,rate:0.37} ]
    },
    capitalGains: {
      single: [ {upTo:49000,rate:0},{upTo:534000,rate:0.15},{upTo:null,rate:0.20} ],
      marriedFilingJointly: [ {upTo:98000,rate:0},{upTo:600000,rate:0.15},{upTo:null,rate:0.20} ]
    },
    deduction: {
      standard: { single: 15000, marriedFilingJointly: 30000 },
      additionalOver65: { single: 2000, marriedFilingJointly: 1600 }
    },
    socialSecurityTaxation: {
      single: { base1: 25000, base2: 34000 },
      marriedFilingJointly: { base1: 32000, base2: 44000 }
    },
    niit: { rate: 0.038, threshold: { single: 200000, marriedFilingJointly: 250000 } },
    fica: {
      wageBase: 180000, oasdiRateEmployee: 0.062, oasdiRateSelfEmployed: 0.124,
      medicareRateEmployee: 0.0145, medicareRateSelfEmployed: 0.029,
      additionalMedicareThreshold: 200000, additionalMedicareRate: 0.009
    },
    estate: { _status: 'PENDING VERIFICATION', basicExclusionAmount: 14000000,
              topRate: 0.40, rateSchedule: [ { upTo: null, rate: 0.40 } ],
              annualGiftExclusion: 19000 }
  },
  rmd: {
    _status: 'PENDING VERIFICATION',
    beginAge: [ { birthYearThrough: 1950, age: 72 }, { birthYearThrough: 1959, age: 73 },
                { birthYearThrough: 9999, age: 75 } ],
    uniformLifetime: Object.fromEntries(
      Array.from({ length: 51 }, (_, i) => [String(72 + i), Math.max(2, 27.4 - i * 0.55)])
    )
  },
  capitalMarket: {
    usLargeCap:   { interest: 0,     dividend: 0.018, capitalGain: 0.010, total: 0.070, volatility: 0.16 },
    intlDeveloped: { interest: 0,     dividend: 0.025, capitalGain: 0.008, total: 0.065, volatility: 0.17 },
    usCoreBond:     { interest: 0.040, dividend: 0,     capitalGain: 0,     total: 0.040, volatility: 0.06 },
    cash:       { interest: 0.025, dividend: 0,     capitalGain: 0,     total: 0.025, volatility: 0.01 }
  },
  correlation: {
    usLargeCap:   { usLargeCap: 1, intlDeveloped: 0.85, usCoreBond: 0.10, cash: 0 },
    intlDeveloped: { usLargeCap: 0.85, intlDeveloped: 1, usCoreBond: 0.05, cash: 0 },
    usCoreBond:     { usLargeCap: 0.10, intlDeveloped: 0.05, usCoreBond: 1, cash: 0.20 },
    cash:       { usLargeCap: 0, intlDeveloped: 0, usCoreBond: 0.20, cash: 1 }
  },
  stateTax: {
    CA: {
      name: 'California', _status: 'PLACEHOLDER SHAPE ONLY',
      brackets: {
        single: [ {upTo:11000,rate:0.01},{upTo:26000,rate:0.02},{upTo:41000,rate:0.04},
                  {upTo:57000,rate:0.06},{upTo:72000,rate:0.08},{upTo:369000,rate:0.093},
                  {upTo:443000,rate:0.103},{upTo:738000,rate:0.113},{upTo:null,rate:0.123} ],
        marriedFilingJointly: [ {upTo:22000,rate:0.01},{upTo:52000,rate:0.02},{upTo:82000,rate:0.04},
                  {upTo:114000,rate:0.06},{upTo:144000,rate:0.08},{upTo:738000,rate:0.093},
                  {upTo:886000,rate:0.103},{upTo:1476000,rate:0.113},{upTo:null,rate:0.123} ]
      },
      standardDeduction: { single: 5500, marriedFilingJointly: 11000 },
      exemptionCredit: { single: 150, marriedFilingJointly: 300, perDependent: 450 },
      surcharges: [ { label: 'Mental Health Services Tax', rate: 0.01, threshold: 1000000 } ],
      treatment: {
        socialSecurity: 'exempt',
        pension: 'ordinary',
        retirementDistributions: 'ordinary',
        capitalGains: 'ordinary',
        municipalInterest: 'exemptInState'
      }
    },
    TX: { name: 'Texas', noIncomeTax: true },
    NY: { name: 'New York', noIncomeTax: false,
          brackets: { single: [ {upTo:null,rate:0.06} ], marriedFilingJointly: [ {upTo:null,rate:0.06} ] },
          standardDeduction: { single: 8000, marriedFilingJointly: 16000 },
          treatment: { socialSecurity: 'exempt', pension: 'ordinary', retirementDistributions: 'ordinary' },
          estate: { _status: 'PENDING VERIFICATION', exclusionAmount: 7000000, topRate: 0.16,
                    rateSchedule: [ { upTo: null, rate: 0.16 } ] } },
    FL: { name: 'Florida', noIncomeTax: true }
  },
  medicare: {
    _status: 'PENDING VERIFICATION',
    eligibilityAge: 65,
    partD: { baseBeneficiaryPremium: 36 },
    irmaa: {
      single: [ {label:'standard',upTo:109000,partB:185,partDSurcharge:0},
                {label:'tier 1',upTo:137000,partB:259,partDSurcharge:14},
                {label:'tier 2',upTo:171000,partB:370,partDSurcharge:36},
                {label:'tier 3',upTo:205000,partB:480,partDSurcharge:57},
                {label:'tier 4',upTo:500000,partB:591,partDSurcharge:79},
                {label:'tier 5',upTo:null,partB:628,partDSurcharge:86} ],
      marriedFilingJointly: [ {label:'standard',upTo:218000,partB:185,partDSurcharge:0},
                {label:'tier 1',upTo:274000,partB:259,partDSurcharge:14},
                {label:'tier 2',upTo:342000,partB:370,partDSurcharge:36},
                {label:'tier 3',upTo:410000,partB:480,partDSurcharge:57},
                {label:'tier 4',upTo:750000,partB:591,partDSurcharge:79},
                {label:'tier 5',upTo:null,partB:628,partDSurcharge:86} ]
    }
  },
  socialSecurity: {
    _status: 'PENDING VERIFICATION',
    earliestClaimAgeMonths: 62 * 12,
    delayedCreditStopsAgeMonths: 70 * 12,
    fullRetirementAge: [ { birthYearThrough: 1954, months: 66 * 12 },
                         { birthYearThrough: 1959, months: 66 * 12 + 10 },
                         { birthYearThrough: 9999, months: 67 * 12 } ],
    earlyReduction: { firstMonthsCount: 36, firstMonthsRate: 5/900, laterMonthsRate: 5/1200 },
    delayedRetirementCredit: [ { birthYearThrough: 9999, annualRate: 0.08 } ],
    spousal: { shareOfWorkerPIA: 0.5,
      earlyReduction: { firstMonthsCount: 36, firstMonthsRate: 25/3600, laterMonthsRate: 5/1200 } },
    survivor: { earliestAgeMonths: 60 * 12, floorShareOfPIA: 0, minimumShareAtEarliest: 0.715 },
    earningsTest: { underFRAExempt: 22000, underFRAWithholdRatio: 0.5,
                    yearOfFRAExempt: 59000, yearOfFRAWithholdRatio: 1/3 }
  },
  monteCarlo: { runs: 400, compounding: 'geometric' }
};
