// The intake wizard.
//
// A household has to be filled in before a dashboard means anything. This walks the six
// steps in the order the conversation actually goes, and every step writes straight into
// the plan, so the dashboard behind it is already correct by the time the last step is done.
//
// The add and edit drawers are the same ones the rest of the platform uses. There is one
// place a record is defined, so a field added there appears here without being written twice.

const esc = s => String(s ?? '').replace(/[&<>"]/g, c =>
  ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

// Each step names the record kinds it collects and how to describe one in a row.
export const STEPS = [
  { id:'family', label:'Family', icon:'&#128100;',
    blurb:'Who is in the household, when they were born, and when they expect to stop working. Every age driven figure in the plan hangs off this.',
    kinds:[{ kind:'person', add:'Add a person', list:'people',
      line:(r,p,y)=>[r.name, (y && r.birthYear) ? 'Age ' + (y - r.birthYear) : '',
                     r.retirementAge ? 'Retires at ' + r.retirementAge : ''] }] },

  { id:'income', label:'Income', icon:'&#128181;',
    blurb:'Salary, pension, Social Security, annuity, anything else coming in. A public pension belongs here, and so does the benefit at full retirement age if you have the statement.',
    kinds:[{ kind:'income', add:'Add income', list:'incomes',
      line:(r,p,y,m)=>[r.name, KINDNAME[r.kind] ?? r.kind, m(r.amount ?? 0) + ' a year'] }] },

  { id:'savings', label:'Savings', icon:'&#128184;',
    blurb:'What is being put away each year while they are still working, and into which account.',
    kinds:[{ kind:'savings', add:'Add a contribution', list:'savings',
      line:(r,p,y,m)=>[r.name,
        (p.household.accounts ?? []).find(a => a.id === r.accountId)?.name ?? '',
        r.kind === 'percentOfPay' ? (r.amount*100).toFixed(1) + '% of pay' : m(r.amount ?? 0) + ' a year'] }] },

  { id:'networth', label:'Net Worth', icon:'&#127974;',
    blurb:'Accounts, property and what is owed. The account type matters more than the balance: it decides how every dollar coming out is taxed.',
    kinds:[
      { kind:'account', add:'Add an account', list:'accounts',
        line:(r,p,y,m)=>[r.name, ACCTNAME[r.type] ?? r.type, m(r.balance ?? 0)] },
      { kind:'property', add:'Add property', list:'property',
        line:(r,p,y,m)=>[r.name, 'Property', m(r.value ?? 0)] },
      { kind:'liability', add:'Add a debt', list:'liabilities',
        line:(r,p,y,m)=>[r.name, 'Owed', m(r.balance ?? 0)] }] },

  { id:'expenses', label:'Expenses', icon:'&#128666;',
    blurb:'What the household actually spends. Health care in retirement is worth its own line, because it does not inflate at the same rate as everything else.',
    kinds:[{ kind:'expense', add:'Add an expense', list:'expenses',
      line:(r,p,y,m)=>[r.name, CATNAME[r.category] ?? r.category ?? 'Living', m(r.amount ?? 0) + ' a year'] }] },

  { id:'goals', label:'Goals', icon:'&#127919;',
    blurb:'What the money is actually for. Give a goal an end year if it happens once, or it repeats every year from the year it starts.',
    kinds:[{ kind:'goal', add:'Add a goal', list:'goals',
      line:(r,p,y,m)=>[r.name, GOALNAME[r.kind] ?? r.kind ?? 'Goal',
        m(r.amount ?? 0) + (r.end ? '' : ' a year')] }] },
];

const KINDNAME = { salary:'Salary', pension:'Pension', socialSecurity:'Social Security',
  annuity:'Annuity', other:'Other income' };
const CATNAME  = { living:'Living expenses', health:'Health care', other:'Other' };
const GOALNAME = { property:'Property', vacation:'Vacation', wedding:'Wedding',
  gift:'Gift', other:'Other' };
const ACCTNAME = { taxable:'Taxable brokerage', bank:'Bank', traditionalIRA:'Traditional IRA',
  traditional401k:'401(k)', four03b:'403(b)', four57b:'457(b)', rothIRA:'Roth IRA',
  roth401k:'Roth 401(k)', hsa:'HSA', sep:'SEP', simple:'SIMPLE', fiveTwoNine:'529',
  annuityQualified:'Annuity, qualified', annuityNonQualified:'Annuity, non-qualified' };

// A step is done once it holds at least one record. Savings and Goals are allowed to be
// empty, because plenty of households genuinely have neither.
const OPTIONAL = new Set(['savings','goals']);

export function stepState(plan) {
  return STEPS.map(s => {
    const n = s.kinds.reduce((t,k) => t + ((plan.household[k.list] ?? []).length), 0);
    return { id:s.id, count:n, done: n > 0 || OPTIONAL.has(s.id) };
  });
}

export function render({ plan, stepId, money, label }) {
  const i = Math.max(0, STEPS.findIndex(s => s.id === stepId));
  const step = STEPS[i];
  const st = stepState(plan);
  const year = plan.household.asOfYear ?? new Date().getFullYear();
  const last = i === STEPS.length - 1;

  const rail = STEPS.map((s, j) => {
    const cls = j === i ? 'on' : (st[j].count > 0 ? 'done' : '');
    return `<button type="button" class="ik-s ${cls}" data-step="${s.id}">
      <span class="ik-n">${st[j].count > 0 && j !== i ? '&#10003;' : (j+1)}</span>
      <span class="ik-l">${s.label}</span></button>`;
  }).join('<span class="ik-sep"></span>');

  const groups = step.kinds.map(k => {
    const rows = (plan.household[k.list] ?? []).map(r => {
      const [a, b, c] = k.line(r, plan, year, money);
      return `<button type="button" class="ik-r" data-edit="${k.kind}:${esc(r.id)}">
        <span class="ik-ra">${esc(a ?? '')}</span>
        <span class="ik-rb">${esc(b ?? '')}</span>
        <span class="ik-rc">${esc(c ?? '')}</span>
        <span class="ik-re">Edit</span></button>`;
    }).join('');
    return `<div class="ik-g">
      ${rows || `<p class="ik-empty">Nothing added yet.</p>`}
      <button type="button" class="btn ghost ik-add" data-edit="${k.kind}:">${k.add} &rsaquo;</button>
    </div>`;
  }).join('');

  return `
    <div class="ik-head">
      <div><h1>Set up ${esc(label || 'the household')}</h1>
        <p class="pg-intro">Six steps. Everything entered here goes straight into the plan, so the
          dashboard is right the moment you finish. You can stop part way and pick it up later.</p></div>
      <button type="button" class="btn ghost" id="ikExit">Save and close</button>
    </div>

    <div class="ik-rail">${rail}</div>

    <section class="card">
      <div class="card-top left"><span class="ct">${step.icon} ${step.label}</span></div>
      <p class="ik-blurb">${step.blurb}</p>
      ${groups}
    </section>

    <div class="ik-foot">
      ${i > 0 ? `<button type="button" class="btn ghost" data-step="${STEPS[i-1].id}">&lsaquo; ${STEPS[i-1].label}</button>` : '<span></span>'}
      <span class="ik-prog">${st.filter(x => x.count > 0).length} of ${STEPS.length} steps have something in them</span>
      ${last
        ? `<button type="button" class="btn" id="ikDone">Open the plan &rsaquo;</button>`
        : `<button type="button" class="btn" data-step="${STEPS[i+1].id}">${STEPS[i+1].label} &rsaquo;</button>`}
    </div>
  `;
}

export const CSS = `
.ik-head{display:flex;align-items:flex-start;gap:16px;margin:0 0 14px}
.ik-head>div{flex:1 1 auto}
.ik-head h1{font-size:19px;font-weight:600;margin:0 0 3px;color:#202124}
.ik-head .pg-intro{margin:0;max-width:660px}
.ik-rail{display:flex;align-items:center;gap:0;margin:0 0 14px;flex-wrap:wrap}
.ik-s{display:flex;align-items:center;gap:7px;background:none;border:0;font:inherit;cursor:pointer;
  padding:6px 10px;border-radius:4px;color:#6b6b6b}
.ik-s:hover{background:#f5f5f5}
.ik-s.on{background:var(--active);color:#202124}
.ik-n{width:20px;height:20px;border-radius:50%;background:#e4e4e4;color:#5f6368;font-size:11px;
  display:flex;align-items:center;justify-content:center;font-weight:600;flex:0 0 auto}
.ik-s.on .ik-n{background:var(--blue);color:#fff}
.ik-s.done .ik-n{background:#3f8f5f;color:#fff}
.ik-l{font-size:12.5px;white-space:nowrap}
.ik-sep{width:14px;height:1px;background:var(--line);flex:0 0 auto}
.ik-blurb{font-size:12px;color:#5f6368;margin:0 0 14px;max-width:700px;line-height:1.6}
.ik-g{margin:0 0 6px}
.ik-r{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:none;
  border:0;border-bottom:1px solid var(--line);padding:10px 2px;cursor:pointer;font:inherit}
.ik-r:hover{background:#fafafa}
.ik-ra{flex:1 1 auto;min-width:0;font-weight:600;color:#202124;font-size:12.5px}
.ik-rb{flex:0 0 auto;width:150px;color:#6b6b6b;font-size:11.5px}
.ik-rc{flex:0 0 auto;width:140px;text-align:right;color:#3c4043;font-size:12.5px}
.ik-re{flex:0 0 auto;color:var(--blue);font-size:11px;width:30px;text-align:right}
.ik-empty{font-size:12px;color:var(--muted);margin:2px 0 10px}
.ik-add{margin-top:10px}
.ik-foot{display:flex;align-items:center;gap:12px;margin-top:16px}
.ik-prog{flex:1 1 auto;text-align:center;font-size:11.5px;color:var(--muted)}
@media (max-width:640px){
  .ik-head{flex-direction:column;gap:10px}
  .ik-rail{gap:2px}
  .ik-sep{display:none}
  .ik-s{padding:6px 8px}
  .ik-l{font-size:11.5px}
  .ik-r{flex-wrap:wrap;gap:3px 10px;padding:11px 2px}
  .ik-ra{flex:1 1 100%}
  .ik-rb,.ik-rc{width:auto;text-align:left;flex:0 0 auto}
  .ik-re{margin-left:auto}
  .ik-foot{flex-wrap:wrap}
  .ik-prog{order:3;flex:1 1 100%;text-align:left}
}
`;
