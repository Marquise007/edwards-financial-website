// The editable layer.
//
// Every figure in this platform comes from one plan object. Editing is therefore a single
// idea: open a drawer over the page, change fields on one record, save it back into that
// plan, and re-run the ledger. Nothing is stored anywhere but this browser.

const el = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const KEY = 'efa.planner.plan.v1';

// ---- persistence ----------------------------------------------------------
// localStorage is per browser and per device. It is never a system of record, so the page
// says so and offers an export that is.
export function load(fallback) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const p = JSON.parse(raw); if (p?.household) return p; }
  } catch (e) { /* private window, blocked storage, or corrupt value: fall through */ }
  return structuredClone(fallback);
}
export function save(plan) {
  try { localStorage.setItem(KEY, JSON.stringify(plan)); return true; }
  catch (e) { return false; }
}
export function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }

// ---- the field types a record can carry -----------------------------------
const FIELD = {
  text:   (f,v) => `<input type="text" name="${f.key}" value="${esc(v ?? '')}">`,
  money:  (f,v) => `<input type="number" name="${f.key}" value="${v ?? 0}" step="1000" min="0">`,
  number: (f,v) => `<input type="number" name="${f.key}" value="${v ?? 0}" step="${f.step ?? 1}">`,
  pct:    (f,v) => `<input type="number" name="${f.key}" value="${v != null ? (v*100).toFixed(2) : 0}" step="0.01">`,
  year:   (f,v) => `<input type="number" name="${f.key}" value="${v ?? 1960}" step="1" min="1900" max="2030">`,
  select: (f,v) => `<select name="${f.key}">${f.options.map(o => {
    const [val,label] = Array.isArray(o) ? o : [o,o];
    return `<option value="${esc(val)}"${String(val)===String(v)?' selected':''}>${esc(label)}</option>`;
  }).join('')}</select>`,
};

// ---- the record kinds, and what each one can edit -------------------------
// Each entry says where the record lives in the plan, what its fields are, and what a new
// one starts as. Adding a kind here is the only thing needed to make it editable.
export const KINDS = {
  person: { list:'people', title:'Participant', icon:'&#128100;',
    fields:[
      {key:'name',label:'Name',type:'text'},
      {key:'birthYear',label:'Birth year',type:'year'},
      {key:'retirementAge',label:'Retirement age',type:'number'},
      {key:'planningHorizonAge',label:'Planning horizon',type:'number'},
    ],
    blank:()=>({id:'p'+Date.now().toString(36), name:'New person', birthYear:1965,
      retirementAge:67, planningHorizonAge:92}) },

  account: { list:'accounts', title:'Account', icon:'&#128176;',
    fields:[
      {key:'name',label:'Account name',type:'text'},
      {key:'owner',label:'Owner',type:'select',options:p=>p.household.people.map(x=>[x.id,x.name])},
      {key:'type',label:'Type',type:'select',options:[
        ['taxable','Taxable brokerage'],['bank','Bank'],['traditionalIRA','Traditional IRA'],
        ['traditional401k','401(k)'],['rothIRA','Roth IRA'],['roth401k','Roth 401(k)'],
        ['hsa','HSA'],['sep','SEP'],['simple','SIMPLE']]},
      {key:'balance',label:'Balance',type:'money'},
      {key:'basis',label:'Cost basis',type:'money'},
    ],
    blank:p=>({id:'a'+Date.now().toString(36), name:'New account',
      owner:p.household.people[0]?.id, type:'taxable', balance:0, basis:0}) },

  income: { list:'incomes', title:'Income', icon:'&#128181;',
    fields:[
      {key:'name',label:'Income name',type:'text'},
      {key:'owner',label:'Owner',type:'select',options:p=>p.household.people.map(x=>[x.id,x.name])},
      {key:'kind',label:'Kind',type:'select',options:[
        ['salary','Salary'],['socialSecurity','Social Security'],['pension','Pension'],
        ['annuity','Annuity'],['other','Other income']]},
      {key:'amount',label:'Annual amount',type:'money'},
      {key:'benefitAtFRA',label:'Benefit at full retirement age',type:'money',
        only:r=>r.kind==='socialSecurity'},
      {key:'startAge',label:'Starts at age',type:'number'},
    ],
    blank:p=>({id:'i'+Date.now().toString(36), name:'New income',
      owner:p.household.people[0]?.id, kind:'salary', amount:0}) },

  expense: { list:'expenses', title:'Expense', icon:'&#128666;',
    fields:[
      {key:'name',label:'Expense name',type:'text'},
      {key:'category',label:'Category',type:'select',options:[
        ['living','Living expenses'],['health','Health care'],['other','Other']]},
      {key:'amount',label:'Annual amount',type:'money'},
    ],
    blank:()=>({id:'e'+Date.now().toString(36), name:'New expense', category:'living', amount:0}) },

  goal: { list:'goals', title:'Goal', icon:'&#127919;',
    fields:[
      {key:'name',label:'Goal name',type:'text'},
      {key:'kind',label:'Kind',type:'select',options:[
        ['property','Property'],['vacation','Vacation'],['wedding','Wedding'],
        ['gift','Gift'],['legacy','Legacy'],['other','Other']]},
      {key:'amount',label:'Amount',type:'money'},
      {key:'startAge',label:'Starts at age',type:'number'},
    ],
    blank:()=>({id:'g'+Date.now().toString(36), name:'New goal', kind:'other', amount:0}) },

  property: { list:'property', title:'Property', icon:'&#127968;',
    fields:[{key:'name',label:'Name',type:'text'},{key:'value',label:'Value',type:'money'}],
    blank:()=>({id:'pr'+Date.now().toString(36), name:'Property', value:0}) },

  liability: { list:'liabilities', title:'Liability', icon:'&#128179;',
    fields:[{key:'name',label:'Name',type:'text'},{key:'balance',label:'Balance owed',type:'money'}],
    blank:()=>({id:'l'+Date.now().toString(36), name:'Loan', balance:0}) },

  settings: { single:true, title:'Plan settings', icon:'&#9881;',
    fields:[
      {key:'filingStatus',label:'Filing status',type:'select',options:[
        ['marriedFilingJointly','Married filing jointly'],['single','Single'],
        ['marriedFilingSeparately','Married filing separately'],['headOfHousehold','Head of household']]},
      {key:'residenceState',label:'Residence state',type:'select',options:[
        ['CA','California'],['TX','Texas'],['FL','Florida'],['NY','New York'],['WA','Washington'],['NV','Nevada']]},
      {key:'asOfYear',label:'Plan starts in',type:'year'},
    ] },
};

// ---- the drawer -----------------------------------------------------------
let OPEN = null;

export function openDrawer({ kind, id, plan, onSave }) {
  const K = KINDS[kind];
  if (!K) return;
  const host = K.single ? plan.household : null;
  const list = K.single ? null : (plan.household[K.list] ??= []);
  let rec = K.single ? plan.household : (id ? list.find(r => r.id === id) : null);
  const isNew = !K.single && !rec;
  if (isNew) rec = typeof K.blank === 'function' ? K.blank(plan) : { ...K.blank };

  const fields = K.fields.filter(f => !f.only || f.only(rec));
  const body = fields.map(f => {
    const opts = typeof f.options === 'function' ? f.options(plan) : f.options;
    const v = f.key === 'startAge' ? rec.start?.value : rec[f.key];
    return `<label class="dw-f"><span>${esc(f.label)}</span>
      ${FIELD[f.type]({ ...f, options: opts }, v)}</label>`;
  }).join('');

  el('drawer').innerHTML = `
    <div class="dw-h"><i>${K.icon}</i><span>${esc(K.title)}</span>
      <button type="button" class="dw-x" data-dw="close">&times;</button></div>
    <form class="dw-b" id="dwForm">${body}</form>
    <div class="dw-foot">
      ${!K.single && !isNew ? '<button type="button" class="dw-del" data-dw="delete">Delete</button>' : '<span></span>'}
      <span>
        <button type="button" class="dw-cancel" data-dw="close">Cancel</button>
        <button type="button" class="dw-save" data-dw="save">Save</button>
      </span>
    </div>`;
  document.body.classList.add('dw-open');
  OPEN = { kind, rec, isNew, list, plan, onSave, fields };
}

export function closeDrawer() {
  document.body.classList.remove('dw-open');
  el('drawer').innerHTML = '';
  OPEN = null;
}

function commit() {
  if (!OPEN) return;
  const { rec, isNew, list, plan, onSave, fields } = OPEN;
  const form = el('dwForm');
  for (const f of fields) {
    const node = form.elements[f.key];
    if (!node) continue;
    let v = node.value;
    if (f.type === 'money' || f.type === 'number' || f.type === 'year') v = Number(v) || 0;
    if (f.type === 'pct') v = (Number(v) || 0) / 100;
    if (f.key === 'startAge') {
      if (v) rec.start = { type:'age', person: rec.owner, value: Number(v) };
      continue;
    }
    rec[f.key] = v;
  }
  // A Social Security income that carries benefitAtFRA is recomputed by the ledger from
  // that figure, so the stated amount is kept in step rather than left to drift.
  if (rec.kind === 'socialSecurity' && typeof rec.benefitAtFRA === 'number' && rec.benefitAtFRA > 0)
    rec.amount = rec.benefitAtFRA;
  if (isNew && list) list.push(rec);
  save(plan);
  closeDrawer();
  onSave?.();
}

function remove() {
  if (!OPEN || !OPEN.list) return;
  const { rec, list, plan, onSave } = OPEN;
  const i = list.indexOf(rec);
  if (i >= 0) list.splice(i, 1);
  save(plan);
  closeDrawer();
  onSave?.();
}

// ---- wiring ---------------------------------------------------------------
export function wire({ getPlan, onSave }) {
  document.body.addEventListener('click', e => {
    const d = e.target.closest('[data-dw]');
    if (d) {
      if (d.dataset.dw === 'close') closeDrawer();
      if (d.dataset.dw === 'save') commit();
      if (d.dataset.dw === 'delete') remove();
      return;
    }
    const edit = e.target.closest('[data-edit]');
    if (edit) {
      const [kind, id] = edit.dataset.edit.split(':');
      openDrawer({ kind, id: id || null, plan: getPlan(), onSave });
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
}

export const CSS = `
#drawer{position:fixed;top:0;right:0;bottom:0;width:380px;max-width:92vw;background:#fff;
  box-shadow:-2px 0 18px rgba(0,0,0,.14);transform:translateX(100%);transition:transform .18s;
  z-index:60;display:flex;flex-direction:column}
body.dw-open #drawer{transform:none}
#dw-scrim{position:fixed;inset:0;background:rgba(40,40,50,.42);opacity:0;pointer-events:none;
  transition:opacity .18s;z-index:55}
body.dw-open #dw-scrim{opacity:1;pointer-events:auto}
.dw-h{display:flex;align-items:center;gap:9px;background:#5a4a63;color:#fff;padding:11px 14px;font-size:13px}
.dw-h i{font-style:normal}
.dw-h span{flex:1}
.dw-x{background:none;border:0;color:#fff;font-size:19px;line-height:1;cursor:pointer;padding:0 2px}
.dw-b{flex:1;overflow-y:auto;padding:16px 16px 8px;display:grid;gap:12px;align-content:start}
.dw-f{display:grid;gap:4px}
.dw-f span{font-size:11px;color:#5f6368}
.dw-f input,.dw-f select{font:inherit;font-size:12.5px;padding:6px 8px;border:1px solid #ccc;
  border-radius:3px;background:#fff;color:#3c4043;width:100%}
.dw-f input:focus,.dw-f select:focus{outline:2px solid #c5cbe8;outline-offset:-1px;border-color:#4e5fd4}
.dw-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;
  padding:11px 14px;border-top:1px solid var(--line);background:#fafafa}
.dw-foot button{font:inherit;font-size:12px;padding:6px 13px;border-radius:3px;cursor:pointer}
.dw-save{background:#4e5fd4;color:#fff;border:0}
.dw-save:hover{background:#3d4cb8}
.dw-cancel{background:#fff;border:1px solid #ccc;color:#5f6368;margin-right:6px}
.dw-del{background:#d64e4e;color:#fff;border:0}
[data-edit]{cursor:pointer}
.rc-rec[data-edit]:hover,.nw-r[data-edit]:hover{outline:2px solid #c5cbe8;outline-offset:-1px}
.editbar{display:flex;align-items:center;gap:10px;font-size:11px;color:#9aa0a6;
  margin:14px 0 0;padding-top:10px;border-top:1px solid var(--line)}
.editbar button{font:inherit;font-size:11px;background:none;border:1px solid #ccc;border-radius:3px;
  padding:4px 9px;color:#5f6368;cursor:pointer}
.editbar button:hover{border-color:#4e5fd4;color:#4e5fd4}
.editbar .grow{flex:1}
`;
