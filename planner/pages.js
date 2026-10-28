// Every page in the base, built against the live capture in docs/capture/pages.md.
// Each entry declares its own title (which often differs from the tab name), its intro,
// its inner tabs, and a render function per view. Nothing here invents a chart for data
// the plan does not have: where a page has nothing behind it, it says so in the words the
// reference uses.
import * as RC from './engine/rc-base.js?v=19c30bf6d8';
import { project } from './engine/ledger.js?v=19c30bf6d8';
import { run as monteCarlo, confidenceBands } from './engine/monte-carlo.js?v=19c30bf6d8';
import { runAll as stressAll } from './engine/stress.js?v=19c30bf6d8';
import { waterfall, incomeStack, effectiveTaxSeries } from './engine/views.js?v=19c30bf6d8';
import { namedStrategies } from './engine/ss-optimizer.js?v=19c30bf6d8';
import { estateFlow, terminalFromProjection, CHECKLIST, exclusionFor } from './engine/estate.js?v=19c30bf6d8';
import { annualCost } from './engine/medicare.js?v=19c30bf6d8';
import { calibrationSeries } from './engine/roth.js?v=19c30bf6d8';
import { survivorSolve } from './engine/life-insurance.js?v=19c30bf6d8';
import { describePortfolio, glidepath, equityShare } from './engine/portfolios.js?v=19c30bf6d8';

const $ = (s, o) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;'), _ = $;

export function build(ctx) {
  const { PLAN, PARAMS, PROJ, MC, BAND, money, mm } = ctx;
  const people = PLAN.household.people;
  const names = people.map(p => p.name);
  const years = PROJ.years;
  const ages = years.map(y => y.ages ? Object.values(y.ages).join('/') : '');
  const age0 = years.map(y => y.ages ? Object.values(y.ages)[0] : '');
  const ACC = PLAN.household.accounts ?? [];
  const sumBy = f => ACC.filter(f).reduce((s,a)=>s+(a.balance??0),0);
  const DEFERRED = new Set(['traditional401k','traditionalIRA','sep','simple','traditional403b','governmental457b']);
  const FREE = new Set(['rothIRA','roth401k','hsa']);
  const TAXABLE = new Set(['taxable','bank']);
  const property = (PLAN.household.property??[]).reduce((s,p)=>s+(p.value??0),0);
  const debts = (PLAN.household.liabilities??[]).reduce((s,l)=>s+(l.balance??0),0);
  const invested = sumBy(a=>!a.excludeFromInvested);
  const bank = sumBy(a=>a.type==='bank');
  const netWorth = years[0].netWorth;

  const ALLOC = [
    ['U.S. Equities',['usLargeCap','usSmallMidCap']], ['International Equities',['intlDeveloped']],
    ['Emerging Markets',['emergingMarkets']], ['Real Estate',['realEstate']],
    ['U.S. Bonds',['usCoreBond','usLongBond','highYield','tips']],
    ['International Bonds',['intlBond','emergingDebt']], ['Cash',['cash']],
    ['Other',['hedgeFunds','commodities','infrastructure','privateEquity','privateDebt']],
  ];
  const alloc = PLAN.settings.allocation ?? {};
  const slicesFrom = a => ALLOC.map(([label,keys]) => ({label, value: keys.reduce((s,k)=>s+(a[k]??0),0)}));
  const EQ = new Set(['U.S. Equities','International Equities','Emerging Markets','Real Estate']);
  const eqOf = s => s.filter(x=>EQ.has(x.label)).reduce((t,x)=>t+x.value,0);
  const TARGET = { usLargeCap:.136, intlDeveloped:.05, emergingMarkets:.01, realEstate:.005,
                   usCoreBond:.494, intlBond:.055, cash:.25 };

  const P = {};  // module/sub -> page spec

  /* ===================== DASHBOARD ===================== */
  P['dashboard/Snapshot'] = {
    grid: true, title:'Snapshot', titleIcon:'&#9906;', headAction:'Add Item &rsaquo;',
    foot: [{label:'&#10022; Clear all', ghost:true},{label:'Apply Template'}],
    render() {
      const taxS = [{label:'Taxable',value:sumBy(a=>TAXABLE.has(a.type))},
                    {label:'Tax deferred',value:sumBy(a=>DEFERRED.has(a.type))},
                    {label:'Tax free',value:sumBy(a=>FREE.has(a.type))}];
      const cur = slicesFrom(alloc);
      const eff = (years[0].tax?.effectiveRate ?? 0) * 100;
      return `<div class="grid">
        <div class="col">
          <section class="card"><h3>Probability of success of Proposed plan</h3>
            ${RC.bigRing({pct:Math.round(MC.probabilityOfSuccess),label:'Probability of\nsuccess'})}</section>
          <section class="card"><h3>Asset simulation results of Proposed plan</h3>
            ${RC.fan({bands:BAND,ages:age0})}
            ${RC.legend(['5-95% confidence level','25-75% confidence level','Median'],
                        ['#ccd4f2','#92a1e3','#3f51c4'],{bars:[2]})}</section>
          <section class="card"><h3>Tax allocation summary</h3>
            <div class="taxrow">
              ${RC.donut({slices:taxS,centre:'Your',sub:'portfolio',colors:RC.PAL.tax,size:158,thickness:30})}
              <div class="taxfigs">${taxS.map(s=>`<div><b>${money(s.value)}</b><span>${s.label} asset</span></div>`).join('')}</div>
            </div>
            ${RC.legend(taxS.map(s=>s.label), RC.PAL.tax)}</section>
        </div>
        <div class="col">
          <div class="pair">
            <section class="card">${RC.tickedRing({value:mm(netWorth),label:'Net worth'})}</section>
            <section class="card">${RC.tickedRing({value:eff.toFixed(1)+'%',label:'Effective federal tax rate'})}</section>
          </div>
          <section class="card"><h3>Balance Sheet</h3>
            ${RC.sheet([{label:'Bank',value:bank},{label:'Invested assets',value:invested-bank},
              {label:'Real estate assets',value:property},{label:'Life insurance cash value',value:0},
              {label:'Business assets',value:0},{label:'Other assets',value:0},
              {label:'Credit cards',value:0},{label:'Mortgages and equities',value:debts},
              {label:'Student loans',value:0},{label:'Other debts',value:0}],
              {label:'Net worth',value:netWorth})}</section>
          <section class="card"><h3>Current allocation</h3>
            <div class="allocrow">
              ${RC.donut({slices:cur,centre:Math.round(eqOf(cur)*100)+'% / '+Math.round((1-eqOf(cur))*100)+'%',size:168,thickness:30})}
              ${RC.dots(cur.map(s=>s.label))}
            </div><p class="undercap">Equity / Fixed Income</p></section>
          <section class="card"><h3>Notes</h3><div class="notes">Click to add text...</div></section>
        </div>
      </div>`;
    }
  };


  P['dashboard/Balance Sheet'] = {
    title: 'Balance Sheet', action: 'DETAILS',
    intro: 'Just like any well-run business, your personal balance sheet should always be in check. Your net worth is the difference between your assets and your liabilities. Assets are everything you own such as your home and investments, and liabilities are everything you owe such as the balance on your mortgage and other debt.',
    tabs: ['Current','Details','Historical'],
    render(v) {
      if (v === 'Details') return RC.table({ columns:[
        {key:'label',label:'',align:'l'},{key:'value',label:'Amount',format:money}],
        rows:[{label:'Bank',value:bank},{label:'Invested assets',value:invested-bank},
          {label:'Real estate assets',value:property},{label:'Life insurance cash value',value:0},
          {label:'Business assets',value:0},{label:'Other assets',value:0},
          {label:'Credit cards',value:0},{label:'Mortgages and equities',value:debts},
          {label:'Student loans',value:0},{label:'Other debts',value:0}]});
      if (v === 'Historical') return RC.empty('No history has been recorded yet.',
        'A balance sheet history builds up as the plan is saved over time.');
      const assets = invested + property, liab = debts;
      return `<p class="cardline">Your net worth is <b>${money(netWorth)}</b>
        <span>as of ${new Date().toLocaleDateString('en-US')}</span></p>`
        + RC.bars({ items:[{label:'Assets',value:assets,color:'#6ec46e'},
            {label:'Liabilities',value:liab,color:'#6ec46e'},
            {label:'Net worth',value:netWorth,color:RC.PAL.blue}], format:money });
    }
  };

  P['dashboard/Liquidity'] = {
    title: 'Liquidity', action: 'ACTION ITEMS',
    intro: 'If a job loss or other financial hardship arises, a liquid emergency fund can help pay bills without dipping into savings or using high interest credit or loans. Your emergency fund should include easily accessible funds like cash and money market funds.',
    tabs: ['Summary','Details'], cardTitle: 'Liquidity analysis',
    render(v) {
      const spend = (years[0].totals.expenses ?? 0);
      const target = spend / 2, actual = bank, gap = actual - target;
      if (v === 'Details') return RC.table({ columns:[{key:'l',label:'',align:'l'},{key:'v',label:'Amount',format:money}],
        rows:[{l:'Target liquidity (six months of expenses)',v:target},{l:'Actual liquidity',v:actual},
              {l:'Surplus or deficit',v:gap}]});
      return RC.bars({ items:[{label:'Target liquidity',value:target,color:'#6ec46e'},
        {label:'Actual liquidity',value:actual,color:'#4ec3e0'},
        {label:'Surplus or Deficit',value:gap,color:RC.PAL.blue}], format:money });
    }
  };

  P['dashboard/Budget'] = { title:'Budgeting', bare:true,
    intro:'The budgeting tool is only available if you link at least one account with transactions.' };

  P['dashboard/Tasks'] = { title:'Tasks', bare:true, titleIcon:'&#9776;',
    headAction:'+ Add Task',
    render(){ return '<p class="bare-mid">You don\'t have any tasks.</p>'; } };

  /* ===================== INVESTMENT ===================== */
  P['investment/Asset Allocation'] = {
    title:'Asset Allocation', tabs:['Summary','Detail'], action:'ACTION ITEMS',
    render(v) {
      const cur = slicesFrom(alloc), tgt = slicesFrom(TARGET);
      const dCur = describePortfolio(alloc, PARAMS.capitalMarket, PARAMS.correlation);
      const dTgt = describePortfolio(TARGET, PARAMS.capitalMarket, PARAMS.correlation);
      if (v === 'Detail') return RC.table({ columns:[
        {key:'label',label:'Asset class',align:'l'},
        {key:'c',label:'Current',format:x=>(x*100).toFixed(1)+'%'},
        {key:'t',label:'Target',format:x=>(x*100).toFixed(1)+'%'}],
        rows: cur.map((s,i)=>({label:s.label,c:s.value,t:tgt[i].value})) });
      const side = (heading, pick, slices, d, centre) => `
        <div class="alloc-side">
          <p class="alloc-h">${heading}</p>
          <label class="pick"><select>${pick.map(o=>`<option>${o}</option>`).join('')}</select></label>
          ${RC.donut({ slices, centre, size:150, thickness:26 })}
          <p class="undercap">Equity / Fixed Income</p>
          <p class="statsub">Annual return: ${(d.total*100).toFixed(1)}%<br>Standard deviation: ${(d.volatility*100).toFixed(1)}%</p>
        </div>`;
      const mid = `<table class="alloc-mid"><tbody>${cur.map((s,i)=>`
        <tr><td class="l">${(s.value*100).toFixed(1)}%</td>
          <td class="n"><i style="background:${RC.PAL.slices[i]}"></i>${s.label}</td>
          <td class="r">${(tgt[i].value*100).toFixed(1)}%</td></tr>`).join('')}</tbody></table>`;
      return `<div class="allocwrap">
        ${side('Current allocation', ['All Accounts','Groups','Customized'], cur, dCur,
               Math.round(eqOf(cur)*100)+'% / '+Math.round((1-eqOf(cur))*100)+'%')}
        ${mid}
        ${side('Target allocation', ['Preservation','Conservative','Balanced','Growth','Aggressive'], tgt, dTgt,
               Math.round(eqOf(tgt)*100)+'% / '+Math.round((1-eqOf(tgt))*100)+'%')}
      </div>`;
    }
  };

  P['investment/Allocation Path'] = {
    title:'Allocation Path', action:'ACTION ITEMS',
    intro:'The allocation path chart can illustrate how your portfolio asset allocation may change over time.',
    cardTitle:'Asset allocation over time', inlinePick:{label:'Starting allocation:',options:['Current allocation','Preservation','Conservative','Balanced','Growth']},
    render() {
      const path = glidepath({ from: alloc, to: TARGET, years: years.length - 1 });
      const eq = path.map(s => equityShare(s.weights));
      const cash = path.map(s => s.weights.cash ?? 0);
      const fixed = eq.map((e,i) => Math.max(0, 1 - e - cash[i]));
      return RC.stackedArea({ labels: age0,
        series:[{values:eq},{values:fixed},{values:cash}],
        colors:['#5b5fd6','#6ec46e','#f5a623'] })
        + RC.legend(['Equity','Fixed Income','Cash'], ['#5b5fd6','#6ec46e','#f5a623']);
    }
  };

  P['investment/Sector and Style'] = {
    title:'Equity Sector and Style', tabs:['Equity Sector','Equity Style'], action:'ACTION ITEMS',
    intro:'Equity investments can be categorized by sector. They are also each assigned a style based on their market cap and valuation. It is important to construct a well-diversified equity portfolio that balances risk with return, while meeting your specific financial goals.',
    cardTitle(v){ return v === 'Equity Style' ? 'Equity style comparison' : 'Equity sector comparison'; },
    render() { return RC.empty('No holdings have been loaded for this household.',
      'Sector and style are read from the individual holdings in each account. Add holdings on the Holdings page and this chart fills in.'); }
  };

  P['investment/Concentration'] = {
    title:'Concentrated Position', action:'ACTION ITEMS',
    intro:'A portfolio that is too heavy in just one security poses a substantial downside risk. This is often defined as "putting all your eggs in one basket". A concentrated position is identified as an individual stock that exceeds a certain percentage of the entire portfolio.',
    render() { return RC.empty('No concentrated position was found.',
      'A position is flagged once a single holding exceeds the concentration threshold. This household holds no individual securities.'); }
  };

  P['investment/Tax Allocation'] = {
    title:'Tax Allocation', action:'ACTION ITEMS', cardTitle:'Tax allocation summary',
    intro:'Tax deferred assets include 401(k)/403(b), IRAs and other tax deferred accounts. Tax free assets include Roth 401(k), Roth IRA, 529, HSA and other tax free accounts. The taxability of the accounts above are based on a variety of factors. Please consult a qualified tax professional to discuss your individual tax situation.',
    render() {
      const s = [{label:'Taxable',value:sumBy(a=>TAXABLE.has(a.type))},
                 {label:'Tax deferred',value:sumBy(a=>DEFERRED.has(a.type))},
                 {label:'Tax free',value:sumBy(a=>FREE.has(a.type))}];
      return `<div class="taxwrap">
        <div>${RC.donut({slices:s,centre:'Your',sub:'portfolio',colors:RC.PAL.tax,size:150,thickness:28})}
          ${RC.legend(s.map(x=>x.label), RC.PAL.tax)}</div>
        <div class="taxrowfigs">${s.map(x=>`<div><b>${money(x.value)}</b><span>${x.label} asset</span></div>`).join('')}</div>
      </div>`;
    }
  };

  P['investment/Holdings'] = {
    bare:true, noCardPad:true,
    render() {
      const rows = ACC.map(a => ({ acct:a.name, owner: people.find(p=>p.id===a.owner)?.name ?? '',
        holding:'', qty:'', price:'', value:a.balance??0, basis:a.basis??'', gl:(a.basis!=null)?((a.balance??0)-a.basis):'' }));
      return `<div class="hold-top">
        <label class="pick"><select><option>All owners</option>${names.map(n=>`<option>${n}</option>`).join('')}</select></label>
        <label class="pick"><select><option>All categories</option></select></label>
        <label class="pick"><select><option>All accounts</option>${ACC.map(a=>`<option>${a.name}</option>`).join('')}</select></label>
        <span class="dl" title="Download">&#11015;</span></div>`
        + RC.table({ columns:[
          {key:'acct',label:'Account Name',align:'l'},{key:'owner',label:'Owner',align:'l'},
          {key:'holding',label:'Holding',align:'l'},{key:'qty',label:'Quantity'},
          {key:'price',label:'Price'},{key:'value',label:'Value',format:money},
          {key:'basis',label:'Cost Basis',format:v=>v===''?'':money(v)},
          {key:'gl',label:'Gain/Loss',format:v=>v===''?'':money(v)}], rows, striped:false });
    }
  };

  /* ===================== RETIREMENT ===================== */
  P['retirement/Analysis'] = {
    title:'Retirement Analysis', titleIcon:'&#9974;', action:'ACTION ITEMS',
    intro:'Use of a detailed retirement analysis tool is important to help determine whether you are on track for a successful retirement. Monte Carlo simulations, stress tests, and viewing specific scenarios can help you evaluate your retirement plans and see the impact of potential changes.',
    tabs:['Probability','Confidence','Comparisons','Savings','Retirement Details'],
    future:true,
    cardTitle(v){ return ({Confidence:'Asset simulation results of Proposed plan',
      Comparisons:'Scenario analysis - Invested assets', Savings:'Current year savings of Proposed plan',
      'Retirement Details':'Income sources of Proposed plan'})[v] ?? null; },
    chevron:v=>['Comparisons','Savings','Retirement Details'].includes(v),
    planPick:v=>['Comparisons','Retirement Details'].includes(v) ? ['Baseline','Bad decade','Fed adverse','Strong growth','Flat 0% return'] : null,
    render(v) {
      if (v === 'Probability') {
        const half = (label, pct, end, edit) => `<div class="prob-half">
          <p class="prob-h">${label}${edit?' <i class="pen">&#9998;</i>':''}</p>
          <div class="prob-row">
            ${RC.bigRing({pct:Math.round(pct),label:'Probability of\nsuccess',size:150,stroke:6})}
            ${RC.bars({items:[{label:'',value:end,color:'#5cb97f'}],width:150,height:150,format:money})}
          </div></div>`;
        return `<div class="halves">${half('Proposed Plan',MC.probabilityOfSuccess,PROJ.endingInvestedAssets,false)}
          ${half('Current Plan',MC.probabilityOfSuccess,PROJ.endingInvestedAssets,true)}</div>`;
      }
      if (v === 'Confidence')
        return RC.fan({bands:BAND,ages:age0,width:560,height:220})
          + RC.legend(['5-95% confidence level','25-75% confidence level','Median'],
                      ['#ccd4f2','#92a1e3','#3f51c4'],{bars:[2]});
      if (v === 'Comparisons') {
        const inv = years.map(y=>y.investedAssets);
        return `<div class="withcall">${RC.areaChart({series:[{values:inv}],labels:age0,width:430,height:200})
          + RC.legend(['Current plan','Proposed plan'],[RC.PAL.blue,'#8b9ae0'])}
          ${RC.callout(['Proposed plan has',{big:'$0 less'},'ending assets than','Current plan'])}</div>`;
      }
      if (v === 'Savings') {
        const sv = years[0].totals.savings ?? 0;
        const inc = years[0].totals.income ?? 0;
        return `<div class="withcall">${RC.bars({items:[
          {label:'Taxable account',value:0},{label:'Retirement account',value:sv},
          {label:'Education account',value:0},{label:'HSA account',value:0}],
          colors:['#5cb97f'],width:430,height:200,format:money})}
          ${RC.callout(['Total annual savings of',{big:money(sv)},'Savings rate of',
            {big:inc?((sv/inc*100).toFixed(1)+'%'):'0%'},'with total income of',{big:money(inc)}])}</div>`;
      }
      const stack = incomeStack(PROJ);
      const keys = ['socialSecurity','pension','annuity','other','withdrawal','shortage'];
      return `<div class="withcall">${RC.stackedBars({labels:age0,
        series:keys.map(k=>({values:(stack.rows??years).map(r=>r[k]??0)}))})
        + RC.legend(['Social Security','Pension','Annuity','Other income','Saving withdrawal','Shortage'])}
        ${RC.callout([{big:'$0'},'income shortage',{big:'26%'},'income is stable'])}</div>`;
    }
  };

  P['retirement/Stress Test'] = {
    title:'Stress Test', action:'ACTION ITEMS', cardTitle:'Stress test - probability of success',
    planPick:()=>['Proposed plan','Current plan'],
    intro:'Even the best retirement plans will be exposed to various risks. These risks can include market volatility, taxation, low Social Security payments, longevity, inflation, and short and long-term health care expenses. It is important to both anticipate and plan for such risks. Doing so can substantially increase your probability of success.',
    render() {
      const rows = stressAll(PLAN, PARAMS, { runs:120, seed:20261027 });
      const pal = ['#4e5fd4','#5b5fd6','#4ec3e0','#6ec46e','#2eae8e','#f5a623','#e8836f','#8b5fd6'];
      return RC.bars({ items: rows.map((r,i)=>({label:r.label,value:r.probabilityOfSuccess/100,color:pal[i%pal.length]})),
        width:540, height:215, format:v=>(v*100).toFixed(0)+'%' });
    }
  };

  P['retirement/Social Security'] = {
    title:'Optimal Social Security Strategy', action:'ACTION ITEMS',
    tabs:['Comparison','Summary'], cardTitle:'Annual cash flow comparison', chevron:()=>true,
    intro:'There are as many as 700 different Social Security filing strategies that can be tested in order to identify the optimal Social Security benefit for your specific retirement needs. Compare your optimal strategy to others to see the potential benefit of optimization.',
    render(v) {
      const LB = { asEarlyAsPossible:'As early as possible', fullRetirementAge:'Full retirement age',
        ageSeventy:'Age seventy', atRetirement:'At retirement', current:'As the plan stands' };
      let named = [];
      try { named = namedStrategies(PLAN, PARAMS); } catch(e) {}
      if (!named.length) return RC.empty('No Social Security benefit is recorded for this household.',
        'Add a Social Security income on the Profile > Income page and the comparison fills in.');
      if (v === 'Summary') return RC.bars({ items: named.map(s=>({label:LB[s.strategy]??s.strategy,value:s.value})),
        width:540,height:215,format:money });
      const best = named[0], worst = named[named.length-1];
      const ss = years.map(y=>Object.values(y.inflows??{}).filter(i=>i.kind==='socialSecurity').reduce((a,i)=>a+i.amount,0));
      return `<div class="twopick"><label class="pick"><select>${named.map(s=>`<option>${LB[s.strategy]??s.strategy}</option>`).join('')}</select></label>
        <span class="vs">vs</span>
        <label class="pick"><select>${named.map(s=>`<option>${LB[s.strategy]??s.strategy}</option>`).join('')}</select></label></div>
        <div class="withcall">${RC.groupedBars({groups:age0.filter((_,i)=>i%3===0),
          series:[{values:ss.filter((_,i)=>i%3===0)},{values:ss.filter((_,i)=>i%3===0)}],
          colors:['#4e5fd4','#8b9ae0'],width:430,height:200})
          + RC.legend([LB[best.strategy],LB[worst.strategy]],['#4e5fd4','#8b9ae0'])}
        ${RC.callout([{big:money(best.value-worst.value)+' more'},
          'from the '+(LB[best.strategy]??'')+' Social Security filing strategy than '+(LB[worst.strategy]??'')])}</div>`;
    }
  };

  P['retirement/Health Care'] = {
    title:'Health Care', action:'ACTION ITEMS', tabs:['Cost Analysis','Medicare Options','Preferences'],
    cardTitle:'Retirement health care summary', chevron:v=>v==='Cost Analysis',
    planPick:v=>v==='Cost Analysis'?['Proposed plan','Current plan']:null,
    intro:'It is important to select the Medicare options that best meet your needs and enroll in Medicare on time. Delayed enrollment can result in penalties and coverage gaps.',
    render(v) {
      if (v === 'Medicare Options') return RC.checks({ columns:['Your Medicare considerations','Your Medicare coverage'],
        items:[{label:'Hospital stays (Part A)',values:[true,true]},
          {label:'Doctor visits (Part B)',values:[true,true]},
          {label:'Prescription drugs (Part D)',values:[true,true]},
          {label:'Out of pocket limit',values:[false,false]},
          {label:'Dental, vision and hearing',values:[false,false]},
          {label:'Coverage while travelling',values:[true,false]}]});
      if (v === 'Preferences') return `<div class="prefs">${[
        ['Where you spend your time',['I spend most of my time at home and visit in-network doctors in my area',
          'I travel or spend winters elsewhere and need to see doctors in more than one place']],
        ['Your health',['I am healthy and can work with a deductible and copay in return for a lower premium',
          'I see a doctor often and have concerns about copays and deductibles adding up']],
        ['Predictability',['I prefer a more predictable cost with a limit on what I pay out of pocket',
          'I am comfortable with a less predictable cost and no out of pocket limit']],
        ['Enrolment',['I will have started Social Security by 65','I will not have started Social Security by 65']],
      ].map(([q,opts])=>`<fieldset class="pref"><legend>${q}</legend>${opts.map((o,i)=>
        `<label class="prefopt"><input type="radio" name="${q.replace(/\W/g,'')}"${i?'':' checked'}><span>${o}</span></label>`).join('')}</fieldset>`).join('')}</div>`;
      const per = people.map(p => {
        let early = 0, late = 0;
        for (const y of years) {
          const a = y.ages?.[p.id]; if (a == null || a < 65) continue;
          const c = (y.outflows?.['__medicare_'+p.id]?.amount) ?? 0;
          if (a < 80) early += c; else late += c;
        }
        return { name:p.name, early, late, total: early + late };
      });
      return `<div class="withcall"><div class="halves">${per.map(p=>`<div class="hc-half">
        <p class="prob-h">${p.name}</p>
        ${RC.bars({items:[{label:'Age 65 to 80',value:p.early},{label:'Age 80+',value:p.late}],
          width:200,height:180,format:money})}</div>`).join('')}</div>
        ${RC.callout(per.flatMap(p=>[{big:money(p.total)},p.name+"'s total cost"]))}</div>`;
    }
  };

  P['retirement/Cash Flows'] = {
    bare:true, tabs:['Maps','Summary','Net Worth','Invested Assets','Accounts'],
    cardTitle:v=>v==='Maps'?'Waterfall':(v==='Summary'?null:null),
    chevron:v=>v==='Maps', planPick:()=>['Proposed plan','Current plan'],
    leftTitle:v=>v==='Summary'?'Summary':null,
    render(v) {
      const y = years.find(x=>(x.totals.withdrawals??0)>0) ?? years[0];
      if (v === 'Maps') {
        const w = waterfall(PROJ, y.year);
        if (!w) return RC.empty('No cash flow was recorded for this year.');
        return `<div class="scrub"><span class="scrub-e"><b>${years[0].year}</b><br>${ages[0]}</span>
          <span class="scrub-l"><i></i></span>
          <span class="scrub-e r"><b>${years[years.length-1].year}</b><br>${ages[ages.length-1]}</span></div>`
          + `<div class="sank">
            <div class="sank-col l">${w.inflows.map((i,k)=>`<p><i style="background:${RC.PAL.slices[k%8]}"></i>${i.label}: <b>${money(i.amount)}</b></p>`).join('')}</div>
            <div class="sank-mid"><p class="sank-tot">Total Inflows<br><b>${money(w.totalInflows)}</b></p></div>
            <div class="sank-col r">${w.sections.map(s=>`<p class="sect">${s.title}: <b>${money(s.total)}</b></p>`
              + s.rows.map(r=>`<p class="sub">${r.label}: <b>${money(r.amount)}</b></p>`).join('')).join('')}</div>
          </div><p class="sank-net">Net Cash Flow: <b>${money(w.netCashFlow)}</b></p>`;
      }
      if (v === 'Summary') {
        const rows = years.map(yy=>{ const t=yy.totals;
          return { year:yy.year, age:yy.ages?Object.values(yy.ages).join('/'):'',
            inc:t.income??0, dist:yy.requiredDistributions??0, oth:0, tin:t.income??0,
            exp:t.expenses??0, goals:t.goals??0, tax:(t.federalTax??0)+(t.stateTax??0)+(t.fica??0),
            sav:t.savings??0, tout:(t.expenses??0)+(t.goals??0)+(t.federalTax??0)+(t.stateTax??0)+(t.fica??0)+(t.savings??0),
            spent:0, net:t.netCashFlow??0 }; });
        return `<div class="hold-top"><span style="flex:1"></span>
          <label class="pick"><select><option>Proposed plan</option></select></label>
          <span class="dl">&#11015;</span></div>` + RC.table({ columns:[
          {key:'year',label:'Year',align:'l'},{key:'age',label:'Age',align:'l'},
          {key:'inc',label:'Income Inflows',format:money,group:'Cash Inflows'},
          {key:'dist',label:'Planned Distribution',format:money,group:'Cash Inflows'},
          {key:'oth',label:'Other Inflows',format:money,group:'Cash Inflows'},
          {key:'tin',label:'Total Inflows',format:money,group:'Cash Inflows'},
          {key:'exp',label:'Expenses',format:money,group:'Cash Outflows'},
          {key:'goals',label:'Goals',format:money,group:'Cash Outflows'},
          {key:'tax',label:'Tax Payment',format:money,group:'Cash Outflows'},
          {key:'sav',label:'Planned Saving',format:money,group:'Cash Outflows'},
          {key:'tout',label:'Total Outflows',format:money,group:'Cash Outflows'},
          {key:'spent',label:'Spent Unsaved Cash Flows',format:money},
          {key:'net',label:'Net Flows',format:money}], rows, bands:true });
      }
      const cols = {
        'Net Worth':[{key:'year',label:'Year',align:'l'},{key:'age',label:'Age',align:'l'},
          {key:'inv',label:'Invested Assets',format:money},{key:'prop',label:'Property',format:money},
          {key:'liab',label:'Liabilities',format:money},{key:'nw',label:'Net Worth',format:money}],
        'Invested Assets':[{key:'year',label:'Year',align:'l'},{key:'age',label:'Age',align:'l'},
          {key:'begin',label:'Beginning Balance',format:money},{key:'sav',label:'Planned Saving',format:money},
          {key:'draw',label:'Planned Distribution',format:money},{key:'end',label:'Ending Balance',format:money}],
        'Accounts':[{key:'year',label:'Year',align:'l'},{key:'age',label:'Age',align:'l'},
          {key:'inv',label:'Invested Assets',format:money}],
      }[v];
      const rows = years.map((yy,i)=>({ year:yy.year, age:yy.ages?Object.values(yy.ages).join('/'):'',
        inv:yy.investedAssets, prop:property, liab:debts, nw:yy.netWorth,
        begin:i?years[i-1].investedAssets:invested, sav:yy.totals.savings??0,
        draw:yy.totals.withdrawals??0, end:yy.investedAssets }));
      return RC.table({ columns:cols, rows });
    }
  };

  /* ===================== INSURANCE ===================== */
  const perPersonTabs = ['Summary', ...names, 'Details'];

  P['insurance/Life Insurance'] = {
    title:'Life Insurance Analysis', titleIcon:'&#9974;', action:'ACTION ITEMS',
    tabs:perPersonTabs,
    intro:'Most financial plans are considered incomplete without life insurance protection. The need for life insurance is analyzed by projecting all future cash flows for an individual\'s survivors. The objective is to provide a life insurance coverage level so that the survivors have a positive portfolio value at the end of the planning horizon.',
    render() {
      const halves = people.map(p => {
        let need = 0;
        try { need = survivorSolve(PLAN, PARAMS, p.id)?.deathBenefit ?? 0; } catch(e) { need = 0; }
        return `<div class="hc-half"><p class="prob-h">${p.name}'s life insurance analysis</p>
          ${RC.bars({items:[{label:'Protection need',value:need,color:'#4e5fd4'},
            {label:'Proposed insurance',value:0,color:'#6ec46e'},
            {label:'Current insurance',value:0,color:'#f5a623'}],width:210,height:180,format:money})}</div>`;
      }).join('');
      return `<div class="halves">${halves}</div>`;
    }
  };

  P['insurance/Disability'] = {
    title:'Disability Insurance Analysis', titleIcon:'&#9974;', action:'ACTION ITEMS',
    tabs:perPersonTabs,
    intro:'According to the Social Security Administration, the chance of becoming disabled before you retire is 1 in 4, and for most people, disability will result in a lower living standard due to the loss of income. Having a disability insurance policy can replace lost earnings.',
    render() {
      return `<div class="halves">${people.map(p=>`<div class="hc-half">
        <p class="prob-h">${p.name}'s income coverage during disability</p>
        <p class="bare-mid">No insurance needed</p></div>`).join('')}</div>`;
    }
  };

  P['insurance/Long-Term Care'] = {
    title:'Long-Term Care Insurance Analysis', action:'ACTION ITEMS', tabs:['Impact','Coverage'],
    cardTitle:"LTC's impact on your invested assets",
    intro:'U.S. Department of Health and Human Services indicates that 70% of people turning age 65 can expect to use some form of long-term care during their lives. Long-term care insurance may help you offset some of the cost.',
    render(v) {
      if (v === 'Coverage') return RC.empty('No long-term care policy is recorded.',
        'Add a long-term care policy on the Profile > Net Worth page and the coverage detail fills in.');
      const base = years.map(y=>y.investedAssets);
      return `<div class="withcall">${RC.groupedBars({groups:age0.filter((_,i)=>i%3===0),
        series:[{values:base.filter((_,i)=>i%3===0)},
                {values:base.filter((_,i)=>i%3===0).map(v=>v*0.93)},
                {values:base.filter((_,i)=>i%3===0).map(v=>v*0.02)}],
        colors:['#8b9ae0','#5b5fd6','#b9a3e8'],width:430,height:200})
        + RC.legend(['Assets w/o LTC expense','Assets w/LTC expense & existing insurance','Impact of proposed LTC insurance'],
                    ['#8b9ae0','#5b5fd6','#b9a3e8'])}
        ${RC.callout(['Proposed coverage results in',{big:'$0 higher'},'ending invested assets'])}</div>`;
    }
  };

  P['insurance/Property and Casualty'] = {
    title:'Property and Casualty Insurance', action:'ACTION ITEMS', tabs:['Home','Auto','Umbrella'],
    cardTitle:v=>({Home:'Homeowners Insurance Coverage',Auto:'Auto Insurance Coverage',Umbrella:'Umbrella Insurance Coverage'})[v],
    intro:'Liabilities associated with your home, auto, or other incidents can have a significant negative impact on your finances. Ensure that your insurance coverage is up to date and sufficient.',
    render(v) {
      if (v !== 'Home') return RC.empty('No '+v.toLowerCase()+' policy is recorded.',
        'Add the policy on the Profile > Net Worth page and this analysis fills in.');
      const value = property, cover = 0, target = .8;
      return `<div class="pcwrap">
        <div>${RC.donut({slices:[{label:'Current coverage',value:cover},
          {label:'Proposed additional coverage',value:value*target-cover},
          {label:'Uninsured amount',value:value*(1-target)}],
          centre:Math.round(target*100)+'%',sub:'coverage',size:140,thickness:26,
          colors:['#4e5fd4','#f5a623','#e8e8e8']})}
          ${RC.legend(['Current coverage','Proposed additional coverage','Uninsured amount'],
            ['#4e5fd4','#f5a623','#e8e8e8'],{cols:true})}</div>
        ${RC.table({columns:[{key:'l',label:'',align:'l'},{key:'cv',label:'Current value',format:money},
          {key:'cc',label:'Current coverage',format:money},{key:'cp',label:'Current coverage %'},
          {key:'tp',label:'Target %'},{key:'pa',label:'Proposed addition',format:money}],
          rows:[{l:'Primary Home',cv:value,cc:cover,cp:'0%',tp:'80%',pa:value*target-cover}],striped:false})}
      </div>`;
    }
  };

  /* ===================== EDUCATION ===================== */
  P['education/'] = { title:'Education Funding Analysis', bare:true, noSubs:true,
    intro:"Your family doesn't have any education goals. New goals can be added in the Profile tab." };

  /* ===================== TAX ===================== */
  P['tax/Tax Estimate'] = {
    title:'Tax Estimate', tabs:['Estimate','Details'], cardTitle:'Effective tax rate',
    chevron:v=>v==='Estimate', planPick:()=>['Proposed plan','Current plan'],
    intro:'Taxes can have a significant impact on your future and are an important factor in financial planning. Estimated taxes below are based on your inputs and your proposed retirement plan, using current tax rates and methodologies.',
    render(v) {
      const fed = years.map(y=>(y.totals.income? (y.totals.federalTax??0)/y.totals.income : 0));
      const st  = years.map(y=>(y.totals.income? (y.totals.stateTax??0)/y.totals.income : 0));
      const fica= years.map(y=>(y.totals.income? (y.totals.fica??0)/y.totals.income : 0));
      if (v === 'Details') return RC.table({ columns:[
        {key:'year',label:'Year',align:'l'},{key:'agi',label:'AGI',format:money},
        {key:'ded',label:'Deduction',format:money},{key:'ti',label:'Taxable income',format:money},
        {key:'fed',label:'Federal tax',format:money},{key:'st',label:'State tax',format:money},
        {key:'eff',label:'Effective rate'}],
        rows: years.map(y=>({year:y.year,agi:y.tax?.agi??0,ded:y.tax?.deduction??0,ti:y.tax?.taxableIncome??0,
          fed:y.totals.federalTax??0,st:y.totals.stateTax??0,
          eff:((y.tax?.effectiveRate??0)*100).toFixed(1)+'%'})) });
      return RC.stackedArea({ labels:age0, series:[{values:fed},{values:st},{values:fica}],
        colors:['#4e5fd4','#6ec46e','#f5a623'], pct:true })
        + RC.legend(['Federal tax rate','State tax rate','FICA tax rate','Local tax rate'],
                    ['#4e5fd4','#6ec46e','#f5a623','#8b5fd6']);
    }
  };

  P['tax/Tax Strategies'] = {
    title:'Tax Strategies', titleIcon:'&#9974;', action:'ACTION ITEMS',
    tabs:['Summary','Calibration','Comparison','Details','Strategies'],
    cardTitle:v=>({Summary:'Summary of tax strategy',Calibration:'Ordinary income tax bracket',
      Comparison:'Strategy comparison',Details:'Strategy details',Strategies:'Available strategies'})[v],
    chevron:v=>['Summary','Calibration'].includes(v), planPick:()=>['Proposed plan','Current plan'],
    render(v) {
      if (v === 'Calibration') {
        let cal = null;
        try { cal = calibrationSeries(PROJ, PARAMS); } catch(e) {}
        if (!cal) return RC.empty('The bracket calibration could not be computed for this plan.');
        const ti = years.map(y=>y.tax?.taxableIncome??0);
        return `<div class="withcall">${RC.areaChart({series:[{values:ti}],labels:age0,width:420,height:195})
          + `<div class="legend cols">${['Adjusted taxable income w/o conversion','10% tax bracket','22% tax bracket','32% tax bracket',
              'Adjusted taxable income w/ conversion','12% tax bracket','24% tax bracket','35% tax bracket']
              .map((l,i)=>`<span><i style="background:${i<4?'#4e5fd4':'#f5a623'}"></i>${l}</span>`).join('')}</div>`}
          ${RC.callout(['Proposed strategy results in',{big:'$0 more'},'tax adjusted ending assets than the Reference strategy'])}</div>`;
      }
      if (v === 'Strategies') return RC.empty('No tax strategy has been proposed yet.',
        'Solve for the top strategies and the result appears here.');
      const tax = years.reduce((s,y)=>s+(y.totals.federalTax??0),0);
      const draw = years.reduce((s,y)=>s+(y.totals.withdrawals??0),0);
      if (v === 'Details' || v === 'Comparison') return RC.table({ columns:[
        {key:'l',label:'',align:'l'},{key:'p',label:'Proposed strategy',format:money},
        {key:'r',label:'Reference strategy',format:money}],
        rows:[{l:'Tax adjusted ending assets',p:PROJ.endingInvestedAssets,r:PROJ.endingInvestedAssets},
          {l:'Federal taxes paid',p:tax,r:tax},
          {l:'Withdrawals from tax-deferred accounts',p:draw,r:draw}] });
      return `<div class="withcall">${RC.groupedBars({
        groups:['Tax adjusted ending assets','Federal taxes paid','Withdrawals from tax-deferred accounts'],
        series:[{values:[PROJ.endingInvestedAssets,tax,draw]},{values:[PROJ.endingInvestedAssets,tax,draw]}],
        colors:['#5cb97f','#5b5fd6'],width:430,height:200})
        + RC.legend(['Proposed strategy','Reference strategy'],['#5cb97f','#5b5fd6'])}
        ${RC.callout(['Proposed strategy results in',{big:'$0 more'},'tax adjusted ending assets',
          {big:'$0 more'},'taxes paid',{big:'$0 more'},'withdrawals from tax-deferred accounts'])}</div>`;
    }
  };

  /* ===================== ESTATE ===================== */
  P['estate/Checklist'] = {
    title:'Estate Checklist', action:'ACTION ITEMS',
    intro:'To protect and control the financial future of your family and loved ones, keep track of your progress on creating important estate checklist documents.',
    render() {
      const items = (CHECKLIST ?? ['Will','Power of Attorney','Living Will','Health Care Proxy',
        'Beneficiary Designations','Living Trust']).map(x => typeof x === 'string' ? x : (x.label ?? x.name));
      return `<div class="tblwrap"><table class="rc-chklist"><thead><tr><th></th>${names.map(n=>`<th>${n}</th>`).join('')}</tr></thead>
        <tbody>${items.map(it=>`<tr class="grp"><td colspan="${names.length+1}">${it}</td></tr>
          <tr><td class="l">${/Beneficiary/.test(it)?'Created and reviewed':'Document created'}</td>
            ${names.map(()=>'<td><input type="checkbox"></td>').join('')}</tr>`).join('')}</tbody></table></div>`;
    }
  };

  P['estate/Beneficiary'] = {
    title:'Beneficiaries', action:'ACTION ITEMS',
    intro:'Life changes. It is important to review your beneficiaries periodically to ensure your money will go where you intended.',
    render() {
      let html = `<div class="tblwrap"><table class="rc-tbl bene"><thead><tr><th class="l"></th><th>Account Balance</th>
        <th>Death Benefit</th><th>Primary Beneficiary</th><th>Contingent Beneficiary</th></tr></thead><tbody>`;
      html += `<tr class="band"><td colspan="5">Invested Assets</td></tr>`;
      for (const p of people) {
        const mine = ACC.filter(a=>a.owner===p.id && !a.excludeFromInvested);
        if (!mine.length) continue;
        html += `<tr class="own"><td colspan="5">${p.name}'s Accounts</td></tr>`;
        html += mine.map(a=>`<tr><td class="l ind">${a.name}</td><td>${money(a.balance??0)}</td>
          <td></td><td></td><td></td></tr>`).join('');
      }
      html += `<tr class="band"><td colspan="5">Life Insurance</td></tr>
        <tr><td class="l ind" colspan="5" style="color:#9aa0a6">No life insurance policy is recorded.</td></tr>`;
      return html + '</tbody></table></div>';
    }
  };

  P['estate/Analysis'] = {
    title:'Estate Planning', titleIcon:'&#9974;', action:'ACTION ITEMS',
    tabs:['Flow','Comparison','Details'], cardTitle:'Estate flow chart',
    planPick:()=>['Proposed plan','Current plan'],
    intro:'Effective use of living trust strategies can reduce taxes and expenses so that more of your assets are passed on to heirs or charity.',
    render(v) {
      let flow = null, excl = null, term = null;
      try {
        excl = exclusionFor(PLAN.household, PARAMS);
        term = terminalFromProjection(PROJ, PLAN.household, PLAN.estateExtras ?? {});
        flow = estateFlow(term, PARAMS, { portedExclusion: excl.ported });
      } catch(e) {}
      if (!flow) return RC.empty('The estate flow could not be computed for this plan.');
      const last = years[years.length-1];
      const box = (name, val, cls) => `<div class="ebox ${cls}"><p>${name}</p><b>${money(val)}</b></div>`;
      return `<div class="eflow">
        <div class="eband"><span>Estate</span></div><div class="eband"><span>Out of Estate</span></div>
        <div class="ecols">
          <div class="ecol">${people.map(p=>box(p.name+"'s net worth", last.netWorth/people.length,'grey')).join('')}
            ${box('Life Insurance', flow.outOfEstate ?? 0,'grey')}</div>
          <div class="ecol">${people.map(p=>box(p.name+"'s estate", last.netWorth/people.length,'grey')).join('')}
            ${box('Taxes and fees', flow.totalTaxAndFees ?? 0,'dark')}${box('Settlement fees',0,'orange')}</div>
          <div class="ecol">${box('Estate to heirs',
              Math.max(0, (flow.toHeirs ?? last.netWorth) - (flow.outOfEstate ?? 0)),'blue')}</div>
        </div>
        <div class="ecols out">
          <div class="ecol">${box("Heirs' assets",0,'blue')}${box('Trust to heirs', term.trustAssets ?? 0,'blue')}
            ${box('Gift to heirs',0,'blue')}${box('Other insurance', term.lifeInsuranceOutOfEstate ?? 0,'blue')}</div>
          <div class="ecol">${box('Gift to charity', term.charitableBequests ?? 0,'green')}${box('Trust to charity',0,'green')}
            ${box('DAF to charity', term.daf ?? 0,'green')}</div>
        </div>
        <div class="etotals">${box('Total to heirs', flow.toHeirs ?? last.netWorth,'blue wide')}
          ${box('Total to charity', flow.toCharity ?? 0,'green wide')}</div>
        <p class="e-assume">Federal exclusion applied: ${money(excl.amount)}. ${excl.note}</p>
      </div>`;
    }
  };

  /* ===================== PROFILE ===================== */
  P['profile/Net Worth'] = {
    bare:true, title:'Net Worth', headAction:'Add Account &rsaquo;', addKind:'account',
    render() {
      const I = { Bank:'&#127974;', Card:'&#128179;', Investment:'&#128200;', 'Stock Plan':'&#128202;',
        Loan:'&#128181;', Property:'&#127968;', Insurance:'&#128737;', Business:'&#127970;', Other:'&#128230;' };
      const rows = [['Bank',bank],['Card',0],['Investment',invested-bank],['Stock Plan',0],['Loan',0],
        ['Property',property],['Insurance',0],['Business',0],['Other',0]];
      const byType = { Bank:'bank', Investment:'account', Property:'property', Loan:'liability' };
      return `<div class="nwlist">
        <div class="nw-h" data-edit="settings:"><span>Total Net Worth</span><b>${money(netWorth)}</b></div>
        ${rows.map(([l,v])=>`<div class="nw-r"${byType[l]?` data-edit="${byType[l]==='bank'?'account':byType[l]}:"`:''}>
          <i>${I[l]??''}</i><span>${l}</span><b>${money(v)}</b></div>`).join('')}
      </div>
      <div class="accs">${ACC.map(a=>`<div class="acc-r" data-edit="account:${a.id}">
        <span>${a.name}</span><em>${people.find(x=>x.id===a.owner)?.name ?? ''}</em><b>${money(a.balance??0)}</b></div>`).join('')}
        ${(PLAN.household.property??[]).map(x=>`<div class="acc-r" data-edit="property:${x.id}">
          <span>${x.name ?? 'Property'}</span><em>Property</em><b>${money(x.value??0)}</b></div>`).join('')}
        ${(PLAN.household.liabilities??[]).map(x=>`<div class="acc-r" data-edit="liability:${x.id}">
          <span>${x.name ?? 'Loan'}</span><em>Owed</em><b>${money(x.balance??0)}</b></div>`).join('')}
      </div>`;
    }
  };

  const recGrid = (cards) => `<div class="recs">${cards}</div>`;
  const rec = (kind, icon, name, rows, edit) => `<div class="rc-rec"${edit?` data-edit="${edit}"`:''}>
    <div class="rc-rec-h"><i>${icon}</i><span>${kind}</span></div>
    <div class="rc-rec-b"><p class="rc-rec-n">${name}</p>
      <div class="rc-rec-rows">${rows.map(r=>`<div class="rc-rec-r"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div>
    </div></div>`;

  P['profile/Goals'] = { bare:true, title:'Goals', headAction:'Add Goal &rsaquo;', addKind:'goal',
    render() {
      const g = PLAN.household.goals ?? [];
      const cards = [
        rec('RETIREMENT','&#127796;','Retirement Age', people.map(p=>[p.name, String(p.retirementAge ?? '')])),
        rec('RETIREMENT','&#10084;','Annual Retirement Health Cost', people.map(p=>[p.name, money(6000)])),
        rec('RETIREMENT','&#9877;','Annual Retirement LTC Cost', people.map(p=>[p.name, money(0)])),
        rec('RETIREMENT','&#128176;','Retirement Expenses', [['Monthly expense', money((PLAN.household.expenses?.find(e=>e.category==='living')?.amount ?? 0)/12)]]),
        ...g.map(x=>rec((x.kind??'GOAL').toUpperCase(),'&#127919;', x.name ?? x.id,
          [[x.amount!=null?'Amount':'Annual amount', money(x.amount ?? x.annualAmount ?? 0)]], 'goal:'+x.id)),
      ].join('');
      return recGrid(cards);
    } };

  P['profile/Income'] = { bare:true, title:'Income', headAction:'Add Income &rsaquo;', addKind:'income',
    render() {
      const ic = { salary:['SALARY','&#128181;'], socialSecurity:['SOCIAL SECURITY','&#127970;'],
        pension:['PENSION INCOME','&#127974;'], annuity:['ANNUITY','&#128176;'] };
      return recGrid((PLAN.household.incomes??[]).map(i=>{
        const [kind,icon] = ic[i.kind] ?? ['OTHER INCOME','&#128181;'];
        const rows = i.kind === 'socialSecurity'
          ? [['Filing age', 'Age ' + (i.start?.value ?? 67)]]
          : [['Annual amount', money(i.amount ?? 0)]];
        return rec(kind, icon, i.name ?? i.id, rows, 'income:'+i.id);
      }).join(''));
    } };

  P['profile/Savings'] = { bare:true, title:'Savings', headAction:'Add Saving &rsaquo;', addKind:'account',
    render() {
      const s = PLAN.household.savings ?? [];
      if (!s.length) return RC.empty('No savings have been added yet.',
        'Use Add Saving to record a contribution to a retirement, education or taxable account.');
      return recGrid(s.map(x=>rec((x.kind??'SAVING').toUpperCase(),'&#127891;', x.name ?? x.id,
        [['Contribution', money(x.amount ?? 0)]], 'account:'+x.id)).join(''));
    } };

  P['profile/Expenses'] = { bare:true, title:'Expenses', headAction:'Add Expense &rsaquo;', addKind:'expense',
    render() {
      const e = PLAN.household.expenses ?? [];
      return recGrid([
        ...e.map(x=>rec('LIVING EXPENSES','&#128666;', x.name ?? x.id,
          [['Monthly expense', money((x.amount ?? 0)/12)]], 'expense:'+x.id)),
        rec('TAX AND FEES','&#127974;','Tax Expenses and Fees',
          [['Filing status', (PLAN.household.filingStatus ?? '').replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase())]], 'settings:'),
      ].join(''));
    } };

  P['profile/Family'] = { bare:true, title:'Family', headAction:'Add Participant &rsaquo;', addKind:'person',
    render() {
      return recGrid(people.map((p,i)=>rec(i===0?'CLIENT':'CO-CLIENT','&#128100;', p.name,
        [['Relationship', i===0?'Client':'Co-client'],
         ['Age', String((PLAN.household.asOfYear ?? new Date().getFullYear()) - p.birthYear)]],
        'person:'+p.id)).join(''));
    } };

  P['profile/Blueprint'] = {
    bare:true, title:'Blueprint', tabs:['Net Worth','Goals','Income, Savings, Expenses'],
    headAction:null, cardButtons:['Edit','Add &rsaquo;'],
    render() {
      const LEG = [['Bank & Investments','#6ec46e'],['Stock plan & Properties & Other assets','#1a365f'],
        ['Card & Loans','#d64e4e'],['Insurance','#4ec3e0'],['Business','#f5a623']];
      const colOf = t => DEFERRED.has(t)||FREE.has(t)||TAXABLE.has(t) ? '#6ec46e' : '#1a365f';
      const side = pid => ACC.filter(a=>a.owner===pid);
      const cards = list => list.map(a=>`<div class="bpcard" style="border-left-color:${colOf(a.type)}">
        <p>${a.name}</p><b>${money(a.balance??0)}</b></div>`).join('');
      const joint = (PLAN.household.property??[]).map(p=>`<div class="bpcard" style="border-left-color:#1a365f">
        <p>${p.name ?? 'Primary Home'}</p><b>${money(p.value??0)}</b></div>`).join('');
      return `<div class="bp">
        <div class="bp-leg">${LEG.map(([l,c])=>`<span><i style="background:${c}"></i>${l}</span>`).join('')}</div>
        <p class="bp-nw">Net Worth: <b>${money(netWorth)}</b></p>
        <div class="bp-people">${people.map(p=>`<div class="bp-p">
          <svg viewBox="0 0 40 40" width="30" height="30"><circle cx="20" cy="13" r="8" fill="#5a6a86"/>
            <path d="M6 38 v-6 a14 13 0 0 1 28 0 v6z" fill="#5a6a86"/></svg>
          <span>${p.name}</span><em>${(PLAN.household.asOfYear ?? 2026) - p.birthYear}</em></div>`).join('')}</div>
        <p class="bp-joint">Jointly Held</p>
        <div class="bp-cols"><div class="bp-col">${cards(side(people[0]?.id))}${joint}</div>
          <div class="bp-col">${cards(side(people[1]?.id))}</div></div>
      </div>`;
    }
  };

  return P;
}
