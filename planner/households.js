// The household roster.
//
// The platform opens here, not on a dashboard. A dashboard with no household named is a
// dashboard about nobody, so the first question the screen answers is which client this is.
// Picking one loads that plan and every module becomes a view of it.

import { CASES, planOf } from './engine/cases.js?v=29308b88c5';
import * as RC from './engine/rc-base.js?v=29308b88c5';

const KEY = 'efa.planner.roster.v1';
const OPEN = 'efa.planner.openId.v1';

// ---------------------------------------------------------------- the store
// The six sample households seed the roster. Anything added or edited afterwards lives
// in this browser alongside them.

function seed() {
  return CASES.map(c => ({
    id: c.id, label: c.label, silo: c.silo, segment: c.segment, note: c.note,
    legacyIntent: c.legacyIntent ?? null, estateExtras: c.estateExtras ?? {},
    sample: true, lastOpened: null,
    plan: { ...planOf(c), estateExtras: c.estateExtras ?? {} },
  }));
}

export function loadRoster() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!Array.isArray(saved) || !saved.length) return seed();
  // A sample household that gained a field since it was saved still gets it, without
  // losing whatever was edited on top.
  const bySaved = new Map(saved.map(h => [h.id, h]));
  const merged = seed().map(s => {
    const was = bySaved.get(s.id);
    if (!was) return s;
    bySaved.delete(s.id);
    return { ...s, ...was, plan: was.plan ?? s.plan };
  });
  return merged.concat([...bySaved.values()]);
}

export function saveRoster(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
}

export function openId() {
  try { return localStorage.getItem(OPEN) || null; } catch (e) { return null; }
}
export function setOpenId(id) {
  try { id ? localStorage.setItem(OPEN, id) : localStorage.removeItem(OPEN); } catch (e) {}
}

export function blankHousehold(name) {
  const year = new Date().getFullYear();
  return {
    id: 'h' + Date.now().toString(36), label: name || 'New household',
    silo: '', segment: '', note: '', legacyIntent: null, estateExtras: {},
    sample: false, lastOpened: null,
    plan: {
      household: {
        asOfYear: year, filingStatus: 'single', residenceState: 'CA',
        people: [{ id:'p1', name: name || 'Client', birthYear: year - 55,
                   retirementAge: 65, planningHorizonAge: 92 }],
        accounts: [{ id:'a1', name:'Checking', owner:'p1', type:'bank', balance: 10000,
                     basis: 10000, excludeFromInvested: true }],
        property: [], liabilities: [], incomes: [], expenses: [], goals: [],
      },
      estateExtras: {},
      settings: {
        allocation: { usLargeCap:.40, intlDeveloped:.12, usCoreBond:.40, cash:.08 },
        withdrawalSequence: 'taxable-deferred-free', portfolioTurnover: .10,
        qualifiedDividendShare: .85, longTermGainShare: .90, advisoryFee: 0,
        sweepAccountId: 'a1', includeMedicare: true,
      },
    },
  };
}

// ---------------------------------------------------------------- the screen

const esc = s => String(s ?? '').replace(/[&<>"]/g, c =>
  ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

function ages(h) {
  const hh = h.plan?.household; if (!hh) return '';
  const y = hh.asOfYear ?? new Date().getFullYear();
  return (hh.people ?? []).map(p => y - p.birthYear).join(' and ');
}

function initials(label) {
  return String(label || '?').replace(/^(Dr\.|Captain|Mr\.|Mrs\.|Ms\.)\s+/i, '')
    .split(/\s+and\s+|\s+/).filter(Boolean).slice(0, 2)
    .map(w => w[0]).join('').toUpperCase();
}

// Each tile needs a headline figure, and the figures come from the engine rather than
// from anything stored, so an edited household shows what it is now.
export function measure(h, { project, monteCarlo, params }) {
  try {
    const pr = project(h.plan, params);
    const mc = monteCarlo(h.plan, params, { runs: 150, seed: 20261027 });
    return { netWorth: pr.years[0].netWorth, probability: mc.probabilityOfSuccess,
             years: pr.years.length, ok: true };
  } catch (e) {
    return { ok: false, why: e.message };
  }
}

function band(p) {
  if (p == null) return '';
  if (p >= 90) return 'good';
  if (p >= 70) return 'fair';
  return 'poor';
}

export function render(ctx) {
  const { roster, measures, money } = ctx;
  const n = roster.length;
  const samples = roster.filter(h => h.sample).length;

  const tile = h => {
    const m = measures[h.id] ?? {};
    const prob = m.ok ? m.probability : null;
    return `<div class="hh-w"><button type="button" class="hh" data-open="${esc(h.id)}">
      <span class="hh-av">${esc(initials(h.label))}</span>
      <span class="hh-main">
        <b>${esc(h.label)}</b>
        <em>${esc(h.segment || 'Household')}${h.silo ? ' &middot; ' + esc(h.silo) : ''}</em>
        <i>${ages(h) ? 'Age ' + esc(ages(h)) : ''}${h.plan?.household?.residenceState
            ? ' &middot; ' + esc(h.plan.household.residenceState) : ''}</i>
      </span>
      <span class="hh-fig">
        <b>${m.ok ? money(m.netWorth) : '--'}</b>
        <em>net worth</em>
      </span>
      <span class="hh-fig">
        ${prob != null
          ? `<b class="pb ${band(prob)}">${prob.toFixed(0)}%</b><em>probability</em>`
          : `<b class="pb">--</b><em>${m.ok ? '' : 'will not run'}</em>`}
      </span>
      <span class="hh-go">&#8250;</span>
    </button>
    <button type="button" class="hh-set" data-setup="${esc(h.id)}" title="Open the setup wizard">Set up</button>
    </div>`;
  };

  return `
    <div class="ro-head">
      <div>
        <h1>Households</h1>
        <p class="pg-intro">Pick a household to open its plan. Every module from the dashboard
          onwards is a view of the household selected here.</p>
      </div>
      <button type="button" class="btn" id="newHH">ADD HOUSEHOLD</button>
    </div>

    <div class="ro-tiles">
      <div class="ro-t"><b>${n}</b><em>household${n===1?'':'s'}</em></div>
      <div class="ro-t"><b>${samples}</b><em>sample case${samples===1?'':'s'}</em></div>
      <div class="ro-t"><b>${n - samples}</b><em>added here</em></div>
    </div>

    <section class="card flush">
      <div class="card-top left"><span class="ct">All households</span></div>
      <div class="hh-list">${roster.map(tile).join('')}</div>
    </section>

    ${samples ? `<p class="ro-note">The sample households are hypothetical. They carry no real
      client information and exist so every part of the platform can be walked end to end.</p>` : ''}
  `;
}

export const CSS = `
.ro-head{display:flex;align-items:flex-start;gap:16px;margin:0 0 14px}
.ro-head>div{flex:1 1 auto}
.ro-head h1{font-size:19px;font-weight:600;margin:0 0 3px;color:#202124}
.ro-head .pg-intro{margin:0;max-width:640px}
.ro-tiles{display:flex;gap:10px;margin:0 0 16px;flex-wrap:wrap}
.ro-t{flex:0 0 auto;min-width:118px;border:1px solid var(--line);border-radius:4px;
  padding:10px 14px;background:#fff}
.ro-t b{display:block;font-size:21px;font-weight:600;color:#202124;line-height:1.1}
.ro-t em{font-style:normal;font-size:10.5px;color:var(--muted);text-transform:uppercase;
  letter-spacing:.4px}
.hh-list{display:flex;flex-direction:column}
.hh-w{position:relative;border-bottom:1px solid var(--line)}
.hh-w:last-child{border-bottom:0}
.hh-w .hh{border-bottom:0}
.hh-set{position:absolute;right:38px;top:50%;transform:translateY(-50%);background:none;
  border:1px solid var(--line);border-radius:3px;font:inherit;font-size:11px;color:#5f6368;
  padding:3px 9px;cursor:pointer;opacity:0;transition:opacity .12s}
.hh-w:hover .hh-set,.hh-set:focus{opacity:1}
.hh-set:hover{color:var(--blue);border-color:var(--blue)}
.hh{display:flex;align-items:center;gap:14px;width:100%;text-align:left;background:none;
  border:0;border-bottom:1px solid var(--line);padding:13px 16px;cursor:pointer;font:inherit}
.hh:last-child{border-bottom:0}
.hh:hover{background:#fafafa}
.hh-av{flex:0 0 auto;width:34px;height:34px;border-radius:50%;background:var(--blue);color:#fff;
  display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;
  letter-spacing:.3px}
.hh-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}
.hh-main b{font-size:13.5px;font-weight:600;color:#202124}
.hh-main em,.hh-main i{font-style:normal;font-size:11.5px;color:#6b6b6b}
.hh-main i{color:var(--muted)}
.hh-fig{flex:0 0 auto;width:108px;text-align:right;display:flex;flex-direction:column;gap:1px}
.hh-fig b{font-size:14px;font-weight:600;color:#202124}
.hh-fig em{font-style:normal;font-size:10px;color:var(--muted);text-transform:uppercase;
  letter-spacing:.4px}
.pb.good{color:#3f8f5f}.pb.fair{color:#b8862e}.pb.poor{color:#b5483c}
.hh-go{flex:0 0 auto;color:var(--muted);font-size:19px;line-height:1}
.ro-note{font-size:11.5px;color:var(--muted);margin:12px 0 0;max-width:720px}
`;
