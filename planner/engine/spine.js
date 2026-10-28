// The question spine.
//
// RightCapital's navigation is module-first: Investment, Retirement, Insurance, Tax. That
// is how the software is organised, not how the conversation goes. No household has ever
// said "take me to Investment, then Tax Allocation." They say "will the money last", then
// "what if I live to ninety-five", then "so what should we actually do."
//
// This lays the plan out in that order, as one continuous read. The spine on the left is
// the list of questions, and it tracks where you are rather than asking you to navigate.
// A consultant presenting never clicks anything: they scroll, and the plan argues itself
// in sequence. Each section opens with the answer in a sentence, and the chart underneath
// it is evidence for that sentence rather than a thing to be interpreted.

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function spine(questions) {
  return `<nav class="sp" aria-label="The questions, in order">
    <ol>${questions.map((q, i) => `
      <li><a href="#q${i}" data-spine="${i}">
        <span class="sp-n">${String(i + 1).padStart(2, '0')}</span>
        <span class="sp-q">${esc(q.short)}</span>
      </a></li>`).join('')}
    </ol>
  </nav>`;
}

// Each section leads with the answer. The verdict is written by the engine from the
// numbers, never fixed text, so it cannot drift away from what the charts show.
export function question({ i, ask, verdict, note }) {
  return `<section class="qs" id="q${i}">
    <p class="qs-k">Question ${String(i + 1).padStart(2, '0')}</p>
    <h2 class="qs-a">${esc(ask)}</h2>
    <p class="qs-v" id="verdict-${i}">${verdict ?? ''}</p>
    ${note ? `<p class="qs-n">${note}</p>` : ''}
    <div class="qs-body" id="body-${i}"></div>
  </section>`;
}

// Scroll-spy: the spine follows the reader rather than the reader working the spine.
export function followScroll(onChange) {
  const sections = [...document.querySelectorAll('.qs')];
  if (!sections.length) return;
  const io = new IntersectionObserver(entries => {
    // the topmost section currently crossing the upper third of the viewport wins
    const visible = entries.filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) onChange(visible[0].target.id);
  }, { rootMargin: '-12% 0px -62% 0px', threshold: 0 });
  sections.forEach(s => io.observe(s));
  return io;
}

export const CSS = `
.sv{display:grid;grid-template-columns:252px minmax(0,1fr);gap:48px;
  max-width:1240px;margin:0 auto;padding:0 28px 120px}
@media (max-width:1000px){.sv{grid-template-columns:1fr;gap:0;padding:0 18px 72px}}

/* --- the spine ----------------------------------------------------------- */
.sp{position:sticky;top:34px;align-self:start;padding-top:8px}
@media (max-width:1000px){.sp{position:static;margin:0 -18px 28px;padding:14px 18px;
  overflow-x:auto;border-bottom:1px solid var(--line,rgba(13,30,58,.14))}}
.sp ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:1px}
@media (max-width:1000px){.sp ol{flex-direction:row;gap:6px}}
.sp a{display:grid;grid-template-columns:26px 1fr;gap:10px;align-items:baseline;
  padding:7px 10px;border-radius:7px;text-decoration:none;color:var(--muted,#5c6880);
  border-left:2px solid transparent;transition:color .14s,background .14s,border-color .14s}
@media (max-width:1000px){.sp a{grid-template-columns:auto;white-space:nowrap;
  border-left:0;border-bottom:2px solid transparent;border-radius:0}
  .sp .sp-n{display:none}}
.sp a:hover{color:var(--ink,#101827);background:rgba(184,151,46,.07)}
.sp a.on{color:var(--ink,#101827);border-left-color:var(--gold,#b8972e);font-weight:600}
@media (max-width:1000px){.sp a.on{border-bottom-color:var(--gold,#b8972e);border-left-color:transparent}}
.sp-n{font-size:10.5px;letter-spacing:.09em;color:var(--gold,#b8972e);
  font-variant-numeric:lining-nums}
.sp-q{font-size:13.5px;line-height:1.35}

/* --- a question ---------------------------------------------------------- */
.qs{padding:76px 0 0;scroll-margin-top:28px}
.qs:first-child{padding-top:34px}
.qs-k{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--gold,#b8972e);margin:0 0 10px;font-weight:600;font-variant-numeric:lining-nums}
.qs-a{font-family:"Cormorant Garamond",Georgia,serif;font-size:36px;font-weight:600;
  line-height:1.15;margin:0;letter-spacing:.005em}
@media (max-width:1000px){.qs-a{font-size:28px}}
/* The answer, set large enough to be the thing you read, because it is. */
.qs-v{font-size:19px;line-height:1.55;margin:18px 0 0;max-width:62ch;color:var(--ink,#101827)}
.qs-v b{font-weight:600;color:var(--gold-deep,#8a6d1f)}
.qs-n{font-size:13.5px;line-height:1.6;color:var(--muted,#5c6880);margin:12px 0 0;max-width:68ch}
.qs-body{margin-top:26px}
.qs-body > .panel{background:transparent;border:0;padding:0;margin:0}
.qs-body > .panel > h2{display:none}
.qs + .qs{border-top:1px solid var(--line,rgba(13,30,58,.14))}

/* the levers sit where they are relevant, not in a panel of their own */
.inline-levers{background:var(--panel,#fff);border:1px solid var(--line,rgba(13,30,58,.14));
  border-radius:12px;padding:18px 20px;margin-top:26px}
.inline-levers > h3{font-family:"Cormorant Garamond",Georgia,serif;font-size:20px;
  font-weight:600;margin:0 0 4px}
`;
