// The base build. Same engine, laid out to match the reference so every later change is
// one we chose rather than a difference nobody can account for.
import { project } from './engine/ledger.js';
import { run as monteCarlo, confidenceBands } from './engine/monte-carlo.js';
import { apply as applyLevers } from './engine/levers.js';
import { assemble } from './engine/load-params.js';
import { PLACEHOLDER } from './engine/placeholder-params.js';
import { SAMPLE } from './engine/sample-plan.js';
import * as RC from './engine/rc-base.js';
import * as EDIT from './edit.js';
import * as HH from './households.js';
import * as INTAKE from './intake.js';

const FILES = ['medicare','social-security','federal-tax','rmd','state-tax','care-costs',
               'house-assumptions','capital-market'];
const loaded = {};
await Promise.all(FILES.map(async n => {
  try { const r = await fetch('./params/' + n + '.json'); if (r.ok) loaded[n] = await r.json(); }
  catch (e) {}
}));
const PARAMS = assemble({
  medicare: loaded['medicare'], socialSecurity: loaded['social-security'],
  federal: loaded['federal-tax'], rmd: loaded['rmd'], stateTax: loaded['state-tax'],
  careCosts: loaded['care-costs'], house: loaded['house-assumptions'],
  capitalMarket: loaded['capital-market'],
}, PLACEHOLDER);

const el = id => document.getElementById(id);
const money = RC.money, mm = RC.mm;

// The plan is editable and lives in this browser only. Every figure on every page is
// recomputed from it, so an edit anywhere changes everything downstream at once.
let ROSTER = HH.loadRoster();
let CURRENT = null;               // the open household record, or null on the roster
let MODE = 'roster';              // roster | intake | plan
let STEP = 'family';              // which intake step, when MODE is intake
let PLAN = EDIT.load(SAMPLE);
let PROJ, MC, BAND, PAGES;

// The roster's tiles are measured by the engine, so an edited household shows what it is
// now rather than what it was when it was saved.
let MEASURES = {};
function measureRoster() {
  MEASURES = {};
  for (const h of ROSTER) MEASURES[h.id] = HH.measure(h, { project, monteCarlo, params: PARAMS });
}

function openHousehold(id) {
  const h = ROSTER.find(x => x.id === id);
  if (!h) return;
  CURRENT = h;
  PLAN = h.plan;
  h.lastOpened = new Date().toISOString();
  HH.setOpenId(id); HH.saveRoster(ROSTER);
  MODE = 'plan';
  AT = { mod:'dashboard', sub:'Snapshot', view:{} };
  // nav() redraws the module band and the household name and then renders, which onEdited
  // does not: it only redraws the body.
  try { recompute(); }
  catch (e) {
    el('body').innerHTML = `<section class="card">${RC.empty(
      'This household is in a state the engine will not run.', e.message)}</section>`;
    return;
  }
  nav();
}

function closeHousehold() {
  CURRENT = null; HH.setOpenId(null);
  MODE = 'roster';
  measureRoster();
  nav();
}

// The wizard writes into the same plan the modules read, so entering it is just a change
// of view. Nothing is staged and nothing needs committing at the end.
function openIntake(id, step) {
  const h = ROSTER.find(x => x.id === id);
  if (!h) return;
  CURRENT = h; PLAN = h.plan; HH.setOpenId(id);
  MODE = 'intake'; STEP = step || 'family';
  try { recompute(); } catch (e) { /* a half-filled plan is expected here */ }
  nav();
}

function recompute() {
  PROJ = project(PLAN, PARAMS);
  MC   = monteCarlo(PLAN, PARAMS, { runs: 400, seed: 20261027 });
  const CB = confidenceBands(PLAN, PARAMS, { runs: 180, seed: 7 });
  BAND = { p5:CB.bands.map(b=>b.p5), p25:CB.bands.map(b=>b.p25), p50:CB.bands.map(b=>b.median),
           p75:CB.bands.map(b=>b.p75), p95:CB.bands.map(b=>b.p95) };
  PAGES = build({ PLAN, PARAMS, PROJ, MC, BAND, money, mm });
}

function onEdited() {
  if (CURRENT) { CURRENT.plan = PLAN; HH.saveRoster(ROSTER); }
  if (MODE === 'intake') {
    // A plan part way through intake will not run, and that is not an error worth
    // showing. The wizard redraws either way.
    try { recompute(); } catch (e) {}
    render();
    return;
  }
  try { recompute(); }
  catch (e) {
    // An edit can make a plan the engine refuses to run. Say which and leave the drawer's
    // change in place so it can be corrected rather than silently reverted.
    el('body').innerHTML = `<section class="card">${RC.empty(
      'That change left the plan in a state the engine will not run.', e.message)}</section>`;
    return;
  }
  render();
}


/* ---------------------------------------------------------------- navigation */
import { build } from './pages.js';

const MAP = [
  { id:'dashboard',  label:'Dashboard',  subs:['Snapshot','Balance Sheet','Liquidity','Budget','Tasks'] },
  { id:'investment', label:'Investment', subs:['Asset Allocation','Allocation Path','Sector and Style','Concentration','Tax Allocation','Holdings'] },
  { id:'retirement', label:'Retirement', subs:['Analysis','Stress Test','Social Security','Health Care','Cash Flows'] },
  { id:'insurance',  label:'Insurance',  subs:['Life Insurance','Disability','Long-Term Care','Property and Casualty'] },
  { id:'education',  label:'Education',  subs:[] },
  { id:'tax',        label:'Tax',        subs:['Tax Estimate','Tax Strategies'] },
  { id:'estate',     label:'Estate',     subs:['Checklist','Beneficiary','Analysis'] },
  { id:'profile',    label:'Profile',    subs:['Net Worth','Goals','Income','Savings','Expenses','Family','Blueprint'] },
];
let AT = { mod:'dashboard', sub:'Snapshot', view:{} };

function nav() {
  const w1 = el('who1'), w2 = el('who2');
  if (!CURRENT) {
    el('mods').innerHTML = '';
    document.querySelector('.subs').style.display = 'none';
    if (w1) w1.textContent = 'Households';
    if (w2) w2.textContent = ROSTER.length + ' on file';
    render();
    return;
  }
  if (w1) w1.textContent = CURRENT.label;
  if (w2) w2.textContent = MODE === 'intake' ? 'Setting up' : (CURRENT.segment || 'Household');
  // The wizard replaces the module bands rather than sitting inside one, so that nothing
  // invites a jump to a page the plan cannot fill in yet.
  if (MODE === 'intake') {
    el('mods').innerHTML = '';
    document.querySelector('.subs').style.display = 'none';
    render();
    return;
  }
  const m = MAP.find(x => x.id === AT.mod);
  el('mods').innerHTML = MAP.map(x =>
    `<button type="button" data-mod="${x.id}" class="${x.id===AT.mod?'on':''}">${x.label}</button>`).join('');
  // Education carries no sub-tabs, so its grey band is absent entirely.
  const band = document.querySelector('.subs');
  band.style.display = m.subs.length ? '' : 'none';
  el('subs').innerHTML = m.subs.map(s =>
    `<button type="button" data-sub="${s}" class="${s===AT.sub?'on':''}">${s}</button>`).join('');
  render();
}
document.body.addEventListener('click', e => {
  const su = e.target.closest('[data-setup]');
  if (su) { openIntake(su.dataset.setup); return; }
  const o = e.target.closest('[data-open]');
  if (o) { openHousehold(o.dataset.open); return; }
  const stp = e.target.closest('[data-step]');
  if (stp) { STEP = stp.dataset.step; render(); window.scrollTo(0,0); return; }
  if (e.target.closest('#ikExit')) { closeHousehold(); return; }
  if (e.target.closest('#ikDone')) { openHousehold(CURRENT.id); window.scrollTo(0,0); return; }
  if (e.target.closest('#whoBtn')) { closeHousehold(); return; }
  if (e.target.closest('#newHH')) {
    const name = prompt('Household name');
    if (!name) return;
    const h = HH.blankHousehold(name.trim());
    ROSTER = ROSTER.concat([h]); HH.saveRoster(ROSTER);
    // A new household has nothing in it, so it opens in the wizard rather than on a
    // dashboard that would have nothing to show.
    openIntake(h.id, 'family');
    return;
  }
  const m = e.target.closest('[data-mod]');
  if (m) { AT.mod = m.dataset.mod; AT.sub = MAP.find(x=>x.id===AT.mod).subs[0] ?? ''; nav(); return; }
  const s = e.target.closest('[data-sub]');
  if (s) { AT.sub = s.dataset.sub; nav(); return; }
  if (e.target.id === 'expPlan') {
    const blob = new Blob([JSON.stringify(PLAN, null, 2)], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'plan.json'; a.click(); URL.revokeObjectURL(a.href); return;
  }
  if (e.target.id === 'impPlan') {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json';
    inp.onchange = async () => {
      try {
        const parsed = JSON.parse(await inp.files[0].text());
        if (!parsed?.household) throw new Error('that file is not a plan');
        PLAN = parsed; EDIT.save(PLAN); onEdited();
      } catch (err) { alert('Could not read that plan: ' + err.message); }
    };
    inp.click(); return;
  }
  if (e.target.id === 'resPlan') {
    EDIT.reset(); PLAN = structuredClone(SAMPLE); onEdited(); return;
  }
  const t = e.target.closest('[data-view]');
  if (t) { AT.view[AT.mod+'/'+AT.sub] = t.dataset.view; render(); }
});

/* ------------------------------------------------------------------- render */
function editBar() {
  return `<div class="editbar">
    <span>Click any card to edit it. This plan is saved in this browser only, on this device.</span>
    <span class="grow"></span>
    <button type="button" id="expPlan">Export plan</button>
    <button type="button" id="impPlan">Import plan</button>
    <button type="button" id="resPlan">Back to the sample</button>
  </div>`;
}

function render() {
  if (CURRENT && MODE === 'intake') {
    el('pgHead').innerHTML = '';
    el('body').innerHTML = INTAKE.render({ plan: PLAN, stepId: STEP, money, label: CURRENT.label });
    return;
  }
  if (!CURRENT) {
    el('pgHead').innerHTML = '';
    el('body').innerHTML = HH.render({ roster: ROSTER, measures: MEASURES, money });
    return;
  }
  const key = AT.mod + '/' + AT.sub;
  const page = PAGES[key];
  const head = el('pgHead'), body = el('body');

  if (!page) {
    head.innerHTML = `<h1>${AT.sub || ''}</h1>`;
    body.innerHTML = `<section class="card">${RC.empty(AT.sub + ' is part of the base layout and is not built yet.')}</section>`;
    return;
  }

  const views = page.tabs ?? [];
  const view = AT.view[key] ?? views[0] ?? null;
  const pick = f => typeof f === 'function' ? f(view) : f;

  head.innerHTML = page.title
    ? `<h1>${page.title}${page.titleIcon ? ` <i>${page.titleIcon}</i>` : ''}</h1>`
      + (page.headAction ? `<button type="button" class="btn"${page.addKind ? ` data-edit="${page.addKind}:"` : ''}>${page.headAction}</button>` : '')
    : '';
  const intro = page.intro ? `<p class="pg-intro">${page.intro}</p>` : '';

  if (!page.render) { body.innerHTML = intro; return; }

  const tabs = views.length
    ? `<div class="tabs">${views.map(v =>
        `<button type="button" data-view="${v}" class="${v===view?'on':''}">${v}</button>`).join('')}</div>` : '';

  const cardTitle = pick(page.cardTitle);
  const leftTitle = pick(page.leftTitle);
  const planPick = pick(page.planPick);
  const chev = pick(page.chevron);
  const topRow = (cardTitle || leftTitle || planPick || page.inlinePick || page.cardButtons)
    ? `<div class="card-top${leftTitle ? ' left' : ''}">
        <span class="ct">${leftTitle ?? cardTitle ?? ''}${chev ? ' <b class="chev">&#8964;</b>' : ''}
          ${page.inlinePick ? `<em class="inline-pick">${page.inlinePick.label}
            <select>${page.inlinePick.options.map(o=>`<option>${o}</option>`).join('')}</select></em>` : ''}</span>
        ${planPick ? `<label class="pick"><select>${planPick.map(o=>`<option>${o}</option>`).join('')}</select></label>` : ''}
        ${page.cardButtons ? `<span class="cardbtns">${page.cardButtons.map((b,i)=>
          `<button type="button" class="btn${i?'':' ghost-o'}">${b}</button>`).join('')}</span>` : ''}
      </div>` : '';

  const inner = page.render(view);

  if (page.grid) {
    body.innerHTML = (inner ?? '') + (page.foot ? `<div class="foot">${page.foot.map(f =>
      `<button type="button" class="btn${f.ghost ? ' ghost' : ''}">${f.label}</button>`).join('')}</div>` : '');
    return;
  }
  const bar = AT.mod === 'profile' ? editBar() : '';
  if (page.bare && !page.tabs && !cardTitle) { body.innerHTML = intro + (inner ?? '') + bar; return; }
  if (page.bare && !inner) { body.innerHTML = intro; return; }

  body.innerHTML = intro + tabs + `<section class="card${page.noCardPad?' flush':''}">
    ${topRow}${inner ?? ''}
    ${page.action ? `<div class="cd-act"><button type="button" class="cd-a">${page.action}</button></div>` : ''}
    ${page.future ? '<p class="future">Future dollars <i>&#9881;</i></p>' : ''}
  </section>`;
}


(function start() {
  const s = document.createElement('style');
  s.textContent = EDIT.CSS + HH.CSS + INTAKE.CSS;
  document.head.appendChild(s);
  EDIT.wire({ getPlan: () => PLAN, onSave: onEdited });
  const was = HH.openId();
  if (was && ROSTER.some(h => h.id === was)) { openHousehold(was); return; }
  measureRoster();
  nav();
})();
