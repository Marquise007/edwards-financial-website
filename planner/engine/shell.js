// The application shell: the three levels of navigation a planning platform needs.
//
//   1. modules   across the top          Dashboard, Investment, Retirement, ...
//   2. sections  in a band beneath       Analysis, Stress Test, Social Security, ...
//   3. views     as tabs on the card     Probability, Confidence, Comparisons, ...
//
// Three levels is not decoration. One engine produces every number in the product, and
// these levels are how a consultant walks a household through it without ever leaving the
// projection: the module is the subject, the section is the question, the view is the way
// of looking at the answer. Everything is a view of the same ledger.

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// MAP: [{ id, label, sections: [{ id, label, title, intro, views?: [{id,label}] }] }]
export function shell({ brand, client, map, active, activeSection }) {
  const mod = map.find(m => m.id === active) ?? map[0];
  const sections = mod.sections ?? [];
  const sec = sections.find(s => s.id === activeSection) ?? sections[0];

  const modTabs = map.map(m => `
    <button type="button" class="nv-m${m.id === mod.id ? ' on' : ''}" data-module="${esc(m.id)}">
      ${esc(m.label)}
    </button>`).join('');

  const secTabs = sections.map(s => `
    <button type="button" class="nv-s${s.id === sec?.id ? ' on' : ''}" data-section="${esc(s.id)}">
      ${esc(s.label)}
    </button>`).join('');

  return `<header class="nv">
    <div class="nv-top">
      <div class="nv-brand">
        <span class="nv-mark" aria-hidden="true">
          <svg viewBox="0 0 28 28" width="24" height="24">
            <path d="M3 21 L10 12 L15 16 L25 5" fill="none" stroke="currentColor"
              stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="25" cy="5" r="2.6" fill="currentColor"/>
          </svg>
        </span>
        <span class="nv-name">${esc(brand ?? 'Edwards Financial')}</span>
      </div>
      ${client ? `<div class="nv-client">${(Array.isArray(client) ? client : [client])
        .map(c => `<span>${esc(c)}</span>`).join('')}</div>` : ''}
      <nav class="nv-mods" aria-label="Modules">${modTabs}</nav>
    </div>
    ${sections.length >= 1 ? `<nav class="nv-secs" aria-label="Sections">${secTabs}</nav>` : ''}
  </header>`;
}

// The page head: a plain title and a sentence saying what the page is for. Theirs does this
// and it is worth copying, because a consultant presenting is reading the room, not the UI.
export function pageHead({ title, intro }) {
  return `<div class="pg-head">
    <h1 class="pg-t">${esc(title)}</h1>
    ${intro ? `<p class="pg-i">${intro}</p>` : ''}
  </div>`;
}

// A card with its own tabs in the top right, which is where theirs puts Summary / Detail.
export function card({ id, views, active, body, actions = true, actionLabel = 'Action items' }) {
  const tabs = (views ?? []).length > 1 ? `<div class="cd-tabs" data-card="${esc(id)}">${
    views.map(v => `<button type="button" class="cd-t${v.id === active ? ' on' : ''}"
      data-view="${esc(v.id)}">${esc(v.label)}</button>`).join('')}</div>` : '';
  return `<section class="cd" id="card-${esc(id)}">
    ${tabs}
    <div class="cd-body">${body ?? ''}</div>
    ${actions ? `<div class="cd-act"><button type="button" class="cd-a" data-actions="${esc(id)}">${
      esc(actionLabel)}</button></div>` : ''}
  </section>`;
}

// Wiring. Returns nothing; calls back with {module, section} and {card, view}.
export function onShell(root, fn) {
  root.addEventListener('click', e => {
    const m = e.target.closest('[data-module]');
    if (m) { fn({ module: m.dataset.module }); return; }
    const s = e.target.closest('[data-section]');
    if (s) { fn({ section: s.dataset.section }); return; }
  });
}

export function onCardTabs(root, fn) {
  root.addEventListener('click', e => {
    const t = e.target.closest('[data-view]');
    if (!t) return;
    const holder = t.closest('[data-card]');
    fn({ card: holder?.dataset.card, view: t.dataset.view });
  });
}

export function onActions(root, fn) {
  root.addEventListener('click', e => {
    const a = e.target.closest('[data-actions]');
    if (a) fn(a.dataset.actions);
  });
}

export { slug };

export const CSS = `
/* --- the shell ----------------------------------------------------------- */
.nv{position:sticky;top:0;z-index:40;background:var(--panel,#fff);
  border-bottom:1px solid var(--line,rgba(13,30,58,.14))}
.nv-top{display:flex;align-items:center;gap:20px;padding:11px 22px}
.nv-brand{display:flex;align-items:center;gap:9px;color:var(--navy,#0d1e3a);flex:0 0 auto}
.nv-mark{display:inline-flex;color:var(--gold,#b8972e)}
.nv-name{font-family:"Cormorant Garamond",Georgia,serif;font-size:21px;font-weight:600;
  letter-spacing:.01em;color:var(--ink,#101827);white-space:nowrap}
.nv-client{display:flex;flex-direction:column;line-height:1.25;flex:0 0 auto;
  padding-left:16px;border-left:1px solid var(--line,rgba(13,30,58,.14))}
.nv-client span{font-size:12px;color:var(--muted,#5c6880)}
.nv-client span:first-child{color:var(--ink,#101827);font-weight:500}
.nv-mods{display:flex;gap:2px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end}
.nv-m{background:none;border:0;font:inherit;font-size:14px;color:var(--muted,#5c6880);
  padding:9px 13px;border-radius:7px 7px 0 0;cursor:pointer;white-space:nowrap;
  transition:color .12s,background .12s}
.nv-m:hover{color:var(--ink,#101827);background:rgba(184,151,46,.07)}
.nv-m.on{color:var(--ink,#101827);font-weight:600;background:var(--page,#eceae5)}
.nv-secs{display:flex;gap:4px;padding:0 22px;background:var(--page,#eceae5);
  overflow-x:auto;scrollbar-width:thin}
.nv-s{background:none;border:0;font:inherit;font-size:13.5px;color:var(--muted,#5c6880);
  padding:10px 12px 9px;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;
  transition:color .12s,border-color .12s}
.nv-s:hover{color:var(--ink,#101827)}
.nv-s.on{color:var(--ink,#101827);font-weight:600;border-bottom-color:var(--gold,#b8972e)}

/* --- page head and card -------------------------------------------------- */
.pg-head{margin:26px 0 16px}
.pg-t{font-family:"Cormorant Garamond",Georgia,serif;font-size:30px;font-weight:600;margin:0}
.pg-i{margin:7px 0 0;color:var(--muted,#5c6880);font-size:14px;max-width:72ch;line-height:1.55}
.cd{background:var(--panel,#fff);border:1px solid var(--line,rgba(13,30,58,.14));
  border-radius:12px;padding:22px;position:relative;margin-bottom:22px}
.cd-tabs{display:flex;gap:3px;justify-content:flex-end;margin:-10px -8px 14px 0;flex-wrap:wrap}
.cd-t{background:none;border:1px solid transparent;border-radius:7px 7px 0 0;font:inherit;
  font-size:13px;color:var(--muted,#5c6880);padding:7px 13px;cursor:pointer;
  transition:color .12s,background .12s,border-color .12s}
.cd-t:hover{color:var(--ink,#101827);background:rgba(184,151,46,.07)}
.cd-t.on{color:var(--ink,#101827);font-weight:600;background:var(--page,#eceae5);
  border-color:var(--line,rgba(13,30,58,.14));border-bottom-color:transparent}
.cd-act{display:flex;justify-content:center;margin:20px 0 -34px}
.cd-a{background:var(--panel,#fff);border:1px solid var(--gold,#b8972e);color:var(--gold,#b8972e);
  border-radius:7px;font:inherit;font-size:12px;font-weight:600;letter-spacing:.07em;
  text-transform:uppercase;padding:8px 20px;cursor:pointer;transition:background .12s,color .12s}
.cd-a:hover{background:var(--gold,#b8972e);color:#fff}
.pg{max-width:1180px;margin:0 auto;padding:0 22px 64px}
@media (max-width:860px){
  .nv-top{flex-wrap:wrap;gap:12px;padding:11px 16px}
  .nv-mods{margin-left:0;width:100%;justify-content:flex-start;overflow-x:auto}
  .nv-client{padding-left:0;border-left:0}
  .nv-secs{padding:0 16px}
  .pg{padding:0 16px 48px}
  .pg-t{font-size:25px}
  .cd{padding:16px}
}
`;
