/* Shared components: the life expectancy popup (app-life-expectancy, IRS tables from EFA.data.lifeTable),
   and two complete calculator screens that thin host screens register with one line:
   "how long will the money last" (app-how-long) and "how much coverage is enough" (app-how-much).
   Needs js/lib/overlays.js and js/lib/worksheet.js (loaded before this file). API: docs/components.md */
(function () {
  'use strict';
  const EFA = window.EFA = window.EFA || {};
  const L = EFA.lib = EFA.lib || {};
  const U = L._;
  if (!U) { console.error('EFA.lib.life needs js/lib/overlays.js loaded first.'); return; }
  const { esc, cp, refresh, copyScreen, visitState, panel, applyField, ICON, opener, editing } = U;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  EFA.css('lib-life', `
  .stage .lib-le .st-overlay-in { width: 780px; }
  .stage .lib-le .st-overlay-b { display: grid; gap: 16px; }
  .stage .lib-box .lib-le-prompt { margin: 0 0 14px; font: 400 20px/1.5 var(--f-body); color: var(--navy); text-align: center; }
  .stage .lib-le-status { display: flex; justify-content: center; }
  .stage .lib-le-status .st-seg-b { min-width: 120px; }
  .stage .lib-le-ages { display: grid; gap: 12px; }
  .stage .lib-le-age { display: grid; grid-template-columns: 1fr 150px; align-items: center; gap: 16px; }
  .stage .lib-le-age label { font: 600 20px/1.2 var(--f-body); color: var(--navy); }
  .stage .lib-le-age .st-input { text-align: right; font-size: 24px; }
  .stage .lib-le-res p { margin: 0; font: 400 21px/1.55 var(--f-body); color: var(--navy); }
  .stage .lib-le-res p + p { margin-top: 14px; }
  .stage .lib-le-res b { font-weight: 700; }
  .stage .lib-le-res .lib-le-note { font-size: 16px; color: var(--muted); }
  .stage .lib-le-acts { display: grid; justify-items: center; gap: 8px; margin-top: 4px; }

  .stage .lib-calc-head { position: absolute; left: 0; right: 0; top: 52px; display: grid; justify-items: center; gap: 16px; text-align: center; padding: 0 120px; }
  .stage .lib-calc-card { position: absolute; left: 400px; width: 800px; top: 168px; box-sizing: border-box; padding: 12px 40px; }
  .stage .lib-calc-row { display: grid; grid-template-columns: 1fr 250px; align-items: center; gap: 20px; min-height: 58px; border-bottom: 1px solid var(--line); }
  .stage .lib-calc-row:last-child { border-bottom: 0; }
  .stage .lib-calc-lb { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .stage .lib-calc-lb label { font: 600 22px/1.2 var(--f-body); color: var(--navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stage .lib-calc-row .st-field { gap: 0; }
  .stage .lib-calc-row .st-input { text-align: right; font-size: 24px; font-weight: 700; height: 46px; }
  .stage .lib-calc-go { position: absolute; left: 0; right: 0; display: flex; justify-content: center; transition: opacity .5s ease; }
  .stage .lib-calc-go .st-pill { min-width: 220px; min-height: 54px; font-size: 20px; }
  .stage .lib-calc-res { position: absolute; left: 160px; width: 1280px; box-sizing: border-box; padding: 24px 40px 16px; display: grid; justify-items: center; gap: 14px; text-align: center; transition: opacity .6s ease, transform .6s ease; }
  .stage .lib-calc-res.is-off { transform: translateY(10px); }
  .stage .lib-calc-box { margin: 0; width: 94%; box-sizing: border-box; border: 3px solid var(--gold); border-radius: 12px; padding: 14px 24px; font: 500 26px/1.38 var(--f-body); color: var(--navy); background: rgba(240,230,196,.28); }
  .stage .lib-calc-box .num { font-weight: 700; }
  .stage .lib-calc-q { margin: 0; font: italic 500 34px/1.2 var(--f-display); color: var(--navy); max-width: 1000px; }
  .stage .lib-calc-doc { justify-self: end; margin-top: -8px; }
  .stage .lib-calc-hi { margin: 0; width: 70%; box-sizing: border-box; border: 3px solid var(--gold); border-radius: 14px; padding: 16px 26px 20px; display: grid; gap: 6px; background: rgba(240,230,196,.28); }
  .stage .lib-calc-hi .k { font: 700 16px/1.2 var(--f-body); letter-spacing: .18em; text-transform: uppercase; color: var(--gold-deep); }
  .stage .lib-calc-hi .v { font: 700 60px/1.05 var(--f-body); color: var(--navy); }
  .stage .lib-calc-p { margin: 0; font: 400 24px/1.55 var(--f-body); color: var(--navy); max-width: 1020px; }
  .stage .lib-calc-p .num { font-weight: 700; }
  .stage .lib-calc-cav { margin: 0; font: 400 19px/1.5 var(--f-body); color: var(--muted); max-width: 1080px; }
  .stage .lib-calc-err { margin: 0; font: 500 24px/1.5 var(--f-body); color: var(--navy); max-width: 900px; padding: 10px 0; }
  .stage .lib-calc-foot { position: absolute; left: 160px; width: 1040px; top: 792px; margin: 0; }
  `);

  /* =====================================================================================
     EFA.lib.lifeExpectancy
     ===================================================================================== */
  const LE = '_lib_life';
  copyScreen(LE, 'Shared wording: life expectancy', {
    link: 'Life Expectancy',
    title: 'Life Expectancy Calculator',
    prompt: 'Would you like to see a single life expectancy, a joint one for the two of you, or both?',
    'st.single': 'Single',
    'st.joint': 'Joint',
    'st.both': 'Both',
    age: 'Your Age',
    spouse: "Spouse's Age",
    calc: 'Calculate',
    use: 'Use Result',
    source: 'Source',
    back: 'Return',
    'joint.a': 'As a couple, your joint life expectancy is',
    'joint.b': 'years, which takes you to age',
    'single.a': 'Your own life expectancy is',
    'single.b': 'years, which takes you to age',
    note: 'These are averages from IRS tables: a planning estimate, not a prediction. Plan for the chance of living longer.',
    'source.text': 'Source: IRS Publication 590-B, Appendix B. Table I (Single Life Expectancy) and Table II (Joint and Last Survivor Expectancy), as updated by the final Treasury regulations published in November 2020 and used from 2022 onward. Published by the Internal Revenue Service at irs.gov.',
    pending: 'The IRS life expectancy tables are being verified. Results will appear here as soon as the figures are confirmed.'
  });

  /* table lookups tolerate the shapes a data file may use: arrays indexed by age, [[age, years]],
     [{age, years}], {age: years}, or functions; joint tables are read as joint[older][younger] (either order) */
  function at1(t, a) {
    if (t == null) return NaN;
    if (typeof t === 'function') return +t(a);
    if (Array.isArray(t)) {
      if (t.length && Array.isArray(t[0])) { const r = t.find((x) => +x[0] === a); return r ? +r[1] : NaN; }
      if (t.length && t[0] && typeof t[0] === 'object') { const r = t.find((x) => +x.age === a); return r ? +(r.years != null ? r.years : r.le != null ? r.le : r.value) : NaN; }
      return t[a] == null ? NaN : +t[a];
    }
    if (typeof t === 'object') {
      const v = t[a] != null ? t[a] : t[String(a)];
      if (v != null && typeof v === 'object') return +(v.years != null ? v.years : v.le != null ? v.le : v.value);
      return v == null ? NaN : +v;
    }
    return NaN;
  }
  function at2(t, a, b) {
    if (t == null) return NaN;
    if (typeof t === 'function') return +t(a, b);
    const rowOf = (x) => (Array.isArray(t) ? t[x] : (t[x] != null ? t[x] : t[String(x)]));
    let v = at1(rowOf(a), b);
    if (!isFinite(v)) v = at1(rowOf(b), a);
    if (!isFinite(v) && typeof t === 'object' && !Array.isArray(t)) { const k = t[`${a},${b}`] != null ? t[`${a},${b}`] : t[`${b},${a}`]; v = k == null ? NaN : +k; }
    return v;
  }
  function tables() {
    const D = EFA.data || {};
    const T = D.lifeTable;
    const places = [];
    if (T && typeof T === 'object') places.push(T.irs, T.IRS, T.pub590b, T);
    if (D.rmd && typeof D.rmd === 'object') places.push(D.rmd);
    if (D.irsLifeTables && typeof D.irsLifeTables === 'object') places.push(D.irsLifeTables);
    let single = null, joint = null;
    places.forEach((p) => {
      if (!p || typeof p !== 'object') return;
      single = single || p.irsSingle || p.singleLife || p.singleLifeExpectancy || p.tableI || p.table1 || p.single || null;
      joint = joint || p.irsJoint || p.jointLastSurvivor || p.jointAndLastSurvivor || p.jointLife || p.tableII || p.table2 || p.joint || null;
    });
    return { single, joint };
  }
  function lookupSingle(a) { const v = at1(tables().single, a); return isFinite(v) && v > 0 ? v : NaN; }
  function lookupJoint(a, b) { const v = at2(tables().joint, Math.max(a, b), Math.min(a, b)); return isFinite(v) && v > 0 ? v : NaN; }
  const ready = () => isFinite(lookupSingle(65)) && isFinite(lookupJoint(65, 62));

  function compute(o) {
    o = o || {};
    const status = o.status === 'joint' || o.status === 'both' ? o.status : 'single';
    const age = +o.age, sp = +o.spouseAge;
    if (!isFinite(age)) return null;
    const a = clamp(Math.round(age), 0, 120);
    const res = {};
    if (status !== 'joint') {
      const y = lookupSingle(a); if (!isFinite(y)) return null;
      res.single = { years: y, age: Math.round(y + age) };
    }
    if (status !== 'single') {
      if (!isFinite(sp)) return null;
      const b = clamp(Math.round(sp), 0, 120);
      const y = lookupJoint(a, b); if (!isFinite(y)) return null;
      res.joint = { years: y, age: Math.round(y + age) }; // measured on the client's age, as in the original
    }
    res.use = status === 'single' ? res.single.age : res.joint.age;
    return res;
  }
  const val = (v, d) => { const x = typeof v === 'function' ? v() : v; return x == null || x === '' || !isFinite(+x) ? d : +x; };
  const yrs = (y) => (Math.round(y * 10) / 10).toFixed(1).replace(/\.0$/, '');

  function openLE(ctx, o) {
    o = o || {};
    const canUse = o.canUseResult !== false;
    const hA = val(o.age, val(L.caseData.get('case_file_current_age'), 42));
    const hS = val(o.spouseAge, val(L.caseData.get('case_file_spouse_age'), 40));
    const S = visitState('le:' + (o.instance || o.field || 'default'), () => ({ age: null, spouse: null, hA: null, hS: null }));
    if (o.freshAges || S.age == null || S.hA !== hA || S.hS !== hS) { S.age = hA; S.spouse = hS; S.hA = hA; S.hS = hS; }
    let status = null, result = null, source = false;
    if (!ready()) {
      return panel(ctx, { title: cp(LE, 'title'), cls: 'lib-le lib-le-none', onClose: o.onClose,
        html: `<div class="lib-pending"><span class="lib-pend-mark">${ICON.glass}</span>${cp(LE, 'pending', { tag: 'p' })}</div>` });
    }
    const ov = panel(ctx, { title: cp(LE, 'title'), cls: 'lib-le', html: '<div class="lib-le-body" style="display:grid;gap:16px"></div>', onClose: o.onClose });
    const body = ov.querySelector('.lib-le-body');
    const seg = (k) => `<button type="button" role="radio" class="st-seg-b" data-le-status="${k}" aria-checked="${status === k}">${cp(LE, 'st.' + k)}</button>`;
    const sentence = (k, r) => `<p>${cp(LE, k + '.a')} <b class="num">${yrs(r.years)}</b> ${cp(LE, k + '.b')} <b class="num">${r.age}</b>.</p>`;
    const draw = () => {
      if (source) {
        const S2 = (EFA.data && EFA.data.sources) || {}, rec = S2.ecfr1_401a9_9 || S2.fr2020_24723 || null;
        body.innerHTML = `<div class="lib-box lib-src">${cp(LE, 'source.text')}${rec && rec.url ? `<span class="url">${esc(rec.url)}</span>` : ''}</div>
          <div class="lib-le-acts"><button type="button" class="st-pill lib-pill lib-ghost" data-le="back">${cp(LE, 'back')}</button></div>`;
      } else {
        const ages = status ? `<div class="lib-box lib-le-ages">
            <div class="lib-le-age">${cp(LE, 'age', { tag: 'label', attrs: 'for="lib-le-a"' })}<input class="st-input" id="lib-le-a" data-le-age="age" inputmode="numeric" autocomplete="off" maxlength="3" value="${esc(S.age)}"></div>
            ${status !== 'single' ? `<div class="lib-le-age">${cp(LE, 'spouse', { tag: 'label', attrs: 'for="lib-le-s"' })}<input class="st-input" id="lib-le-s" data-le-age="spouse" inputmode="numeric" autocomplete="off" maxlength="3" value="${esc(S.spouse)}"></div>` : ''}
          </div>` : '';
        const res = !result ? '' : (result.pending
          ? `<div class="lib-box lib-pending">${cp(LE, 'pending', { tag: 'p' })}</div>`
          : `<div class="lib-box lib-le-res">${result.joint ? sentence('joint', result.joint) : ''}${result.single ? sentence('single', result.single) : ''}${cp(LE, 'note', { tag: 'p', cls: 'lib-le-note' })}</div>`);
        const btn = !status ? '' : (!result ? `<button type="button" class="st-pill lib-pill" data-le="calc">${cp(LE, 'calc')}</button>`
          : (canUse && !result.pending ? `<button type="button" class="st-pill lib-pill" data-le="use">${ICON.check}${cp(LE, 'use')}</button>` : ''));
        body.innerHTML = `<div class="lib-box">${cp(LE, 'prompt', { tag: 'p', cls: 'lib-le-prompt' })}<div class="lib-le-status"><div class="st-seg" role="radiogroup">${seg('single')}${seg('joint')}${seg('both')}</div></div></div>
          ${ages}${res}
          ${btn || result ? `<div class="lib-le-acts">${btn}${result ? `<button type="button" class="lib-link" data-le="source">${cp(LE, 'source')}</button>` : ''}</div>` : ''}`;
      }
      refresh(body);
    };
    body.addEventListener('click', (e) => {
      if (editing()) return;
      const sb = e.target.closest('[data-le-status]');
      if (sb) { status = sb.getAttribute('data-le-status'); result = null; draw(); return; }
      const b = e.target.closest('[data-le]'); if (!b) return;
      const a = b.getAttribute('data-le');
      if (a === 'calc') {
        const empty = S.age === '' ? 'age' : (status !== 'single' && S.spouse === '' ? 'spouse' : null);
        if (empty) { const inp = body.querySelector(`[data-le-age="${empty}"]`); if (inp) inp.focus(); return; }
        result = compute({ status, age: S.age, spouseAge: S.spouse }) || { pending: true };
        draw();
      } else if (a === 'use' && result && !result.pending) {
        applyField(ctx, o.field, result.use);
        if (o.onUse) { try { o.onUse(result.use); } catch (err) { console.error(err); } }
        ov.close();
      } else if (a === 'source') { source = true; draw(); }
      else if (a === 'back') { source = false; draw(); }
    });
    body.addEventListener('input', (e) => {
      const inp = e.target.closest('[data-le-age]'); if (!inp) return;
      const clean = inp.value.replace(/\D/g, '').slice(0, 3);
      if (clean !== inp.value) inp.value = clean;
      S[inp.getAttribute('data-le-age') === 'age' ? 'age' : 'spouse'] = clean === '' ? '' : +clean;
      if (result) { result = null; const keep = inp.getAttribute('data-le-age'); draw(); const again = body.querySelector(`[data-le-age="${keep}"]`); if (again) { again.focus(); const n = again.value.length; again.setSelectionRange(n, n); } }
    });
    body.addEventListener('keydown', (e) => {
      if (e.target.closest('[data-le-age]') && e.key === 'Enter') { e.preventDefault(); const c = body.querySelector('[data-le="calc"]'); if (c) c.click(); }
    });
    body.addEventListener('focusin', (e) => { const inp = e.target.closest('[data-le-age]'); if (inp) inp.select(); });
    draw();
    return ov;
  }

  L.lifeExpectancy = {
    link(ctx, o) { return opener(ctx, o, { sid: LE, key: 'link', icon: ICON.glass }, () => openLE(ctx, o)); },
    open(ctx, o) { return openLE(ctx, o); },
    compute,
    ready
  };

  /* =====================================================================================
     shared calculator screen pieces (how long / how much)
     ===================================================================================== */
  const KEYS = { proceeds: 'policy_proceeds', savings: 'case_file_accumulated_savings', ror: 'case_file_ror_distribution', income: 'case_file_current_income', infl: 'case_file_ror_inflation' };
  const DEF = { proceeds: 500000, savings: 88000, ror: 0.05, income: 102000, infl: 0.03 };
  const TYPE = { proceeds: 'money', savings: 'money', ror: 'pct', income: 'money', infl: 'pct' };
  function calcRow(ctx, sid, id, extraLabel) {
    const field = L.caseData.field(ctx, { id, key: KEYS[id], type: TYPE[id], value: DEF[id], max: id === 'ror' ? 0.12 : undefined });
    return `<div class="lib-calc-row"><div class="lib-calc-lb">${cp(sid, 'lb.' + id, { tag: 'label', attrs: `for="f-${esc(ctx.id)}-${id}"` })}${extraLabel || ''}</div>${field}</div>`;
  }
  const money0 = (v) => EFA.fmt.money(v);

  /* ---------- how long will the money last ---------- */
  const HL = '_lib_howlong';
  copyScreen(HL, 'Shared wording: how long will the money last', {
    head: 'How Long Will the Money Last?',
    'lb.proceeds': 'Policy Proceeds',
    'lb.savings': 'Accumulated Savings',
    'lb.ror': 'Investment Return',
    'lb.income': 'Annual Income Required',
    'lb.infl': 'Inflation Rate',
    calc: 'Calculate',
    'res.a': 'An income of',
    'res.b': 'a year, rising with inflation, would use up every dollar in year',
    'res.q': 'Is that the future you want for the people who count on you?',
    note: 'Policy proceeds are treated as generally income-tax-free under current tax law, subject to applicable requirements, and savings as money that has already been taxed.',
    'ws.head': 'How Long Will the Money Last?',
    'ws.year': 'Year',
    'ws.begin': 'Balance Before Withdrawal',
    'ws.wd': 'Annual Withdrawal',
    'ws.after': 'Balance After Withdrawal',
    'ws.earn': 'Annual Earnings',
    'ws.end': 'End of Year Balance'
  });

  /** the spec's loop: withdraw at the start of the year, grow what is left, raise next year's income */
  function howLongRun(o) {
    o = o || {};
    const r = +o.ror || 0, i = +o.inflation || 0;
    let w = +o.income || 0, end = (+o.savings || 0) + (+o.proceeds || 0), years = 0;
    const rows = [];
    do {
      const begin = end, after = begin - w, earnings = after * r;
      end = after + earnings;
      rows.push({ year: years + 1, begin, withdrawal: w, after, earnings, end });
      w = w * (1 + i);
      years++;
    } while (!(end <= 0) && years < 100);
    return { years, rows };
  }
  const hlVals = (ctx) => { const v = ctx.values(); return { proceeds: v.proceeds, savings: v.savings, ror: v.ror, income: v.income, inflation: v.infl }; };
  function hlSheet(ctx) {
    const C = (k) => cp(HL, k);
    return {
      heading: C('ws.head'), size: 'medium',
      columns: [
        { field: 'year', header: C('ws.year'), type: 'year', width: 80 },
        { field: 'begin', header: C('ws.begin'), type: 'money', dp: 2 },
        { field: 'withdrawal', header: C('ws.wd'), type: 'money', dp: 2 },
        { field: 'after', header: C('ws.after'), type: 'money', dp: 2 },
        { field: 'earnings', header: C('ws.earn'), type: 'money', dp: 2 },
        { field: 'end', header: C('ws.end'), type: 'money', dp: 2 }
      ],
      rows: howLongRun(hlVals(ctx)).rows
    };
  }
  function hlDraw(ctx) {
    const box = ctx.$('.lib-calc-box'); if (!box) return;
    const v = hlVals(ctx), out = howLongRun(v);
    box.innerHTML = `${cp(HL, 'res.a')} <span class="num">${money0(v.income)}</span> ${cp(HL, 'res.b')} <span class="num">${out.years}</span>.`;
    refresh(box);
  }
  const HL_NOTES = 'This shows how long the money your family would have could carry the income they need, with that income rising every year with inflation.\n\n- Enter the coverage in force today and the savings set aside, then click Calculate.\n- Ask: If the money ran out in that year, what would that mean for the people who depend on you?\nPAUSE';
  function howLongDef(opts) {
    opts = opts || {};
    return {
      title: opts.title || 'How long will the money last',
      steps: 2,
      copy: {},
      notes: opts.notes != null ? opts.notes : HL_NOTES,
      render(ctx) {
        ctx.el.innerHTML = `
          <div class="lib-calc-head">${cp(HL, 'head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule"></div>
          <div class="lib-calc-card st-card">
            ${calcRow(ctx, HL, 'proceeds')}${calcRow(ctx, HL, 'savings')}${calcRow(ctx, HL, 'ror')}${calcRow(ctx, HL, 'income')}
            ${calcRow(ctx, HL, 'infl', L.inflation.link(ctx, { field: 'infl' }))}
          </div>
          <div class="lib-calc-go" style="top:516px"><button type="button" class="st-pill" data-go="1">${cp(HL, 'calc')}</button></div>
          <div class="lib-calc-res st-card is-off" style="top:508px">
            <p class="lib-calc-box"></p>
            ${cp(HL, 'res.q', { tag: 'p', cls: 'lib-calc-q' })}
            <div class="lib-calc-doc">${L.worksheet.button(ctx, { data: () => hlSheet(ctx) })}</div>
          </div>
          <p class="st-disclaimer lib-calc-foot">${cp(HL, 'note')} ${L.disclosure.html('hypothetical')}</p>`;
        L.disclosure.guard(ctx, 'ror');
        ctx.on(ctx.$('[data-go]'), 'click', () => ctx.next());
        ctx.onFields(() => { if (ctx.step >= 1) hlDraw(ctx); });
      },
      step(ctx, n) {
        if (n >= 1) hlDraw(ctx);
        ctx.show('.lib-calc-res', n >= 1);
        ctx.show('.lib-calc-go', n < 1);
      }
    };
  }
  L.howLong = {
    def: howLongDef,
    screen(id, opts) { EFA.screen(id, howLongDef(opts)); },
    run: howLongRun
  };

  /* ---------- how much coverage is enough ---------- */
  const HM = '_lib_howmuch';
  copyScreen(HM, 'Shared wording: how much is enough', {
    head: 'How Much Is Enough?',
    'lb.income': 'Annual Income Required',
    'lb.savings': 'Accumulated Savings',
    'lb.ror': 'Investment Return',
    calc: 'Calculate',
    'res.k': 'Minimum Coverage Required',
    'res.a': 'It would take',
    'res.b': 'of life insurance, on top of your current savings of',
    'res.c': ', to produce an annual income of',
    'res.d': 'from the earnings alone.',
    caveat: 'This estimate leaves out taxes and inflation. Either one could shrink what that income buys over the years.',
    err: 'This calculation could not be completed. Please check that the assumptions are reasonable, starting with a return above zero.'
  });
  /** coverage = W / r - S + W: capital whose earnings pay W every year, plus one year of income, less savings */
  function howMuchRun(o) {
    o = o || {};
    const W = +o.income || 0, S = +o.savings || 0, r = +o.ror || 0;
    if (r === 0) return { error: true };
    return { coverage: W / r - S + W };
  }
  function hmDraw(ctx) {
    const res = ctx.$('.lib-calc-res'); if (!res) return;
    const v = ctx.values(), out = howMuchRun({ income: v.income, savings: v.savings, ror: v.ror });
    if (out.error) {
      res.innerHTML = cp(HM, 'err', { tag: 'p', cls: 'lib-calc-err' });
    } else {
      const cov = Math.round(out.coverage);
      L.caseData.set('policy_proceeds', cov); // read by app-how-long and hmc6, as in the original
      res.innerHTML = `<div class="lib-calc-hi"><span class="k">${cp(HM, 'res.k')}</span><span class="v num">${money0(cov)}</span></div>
        <p class="lib-calc-p">${cp(HM, 'res.a')} <span class="num">${money0(cov)}</span> ${cp(HM, 'res.b')} <span class="num">${money0(v.savings)}</span>${cp(HM, 'res.c')} <span class="num">${money0(v.income)}</span> ${cp(HM, 'res.d')}</p>
        ${cp(HM, 'caveat', { tag: 'p', cls: 'lib-calc-cav' })}`;
    }
    refresh(res);
  }
  const HM_NOTES = 'Most families have never put a number on enough. This finds the coverage that, added to what is already saved, could pay the income your family needs from the earnings alone.\n\n- Enter the yearly income your family would need and the savings in place, then click Calculate.\n- Ask: How does that number compare with the coverage you have today?\nPAUSE';
  function howMuchDef(opts) {
    opts = opts || {};
    return {
      title: opts.title || 'How much is enough',
      steps: 2,
      copy: {},
      notes: opts.notes != null ? opts.notes : HM_NOTES,
      render(ctx) {
        ctx.el.innerHTML = `
          <div class="lib-calc-head">${cp(HM, 'head', { tag: 'h1', cls: 'st-h1' })}<hr class="st-rule"></div>
          <div class="lib-calc-card st-card">${calcRow(ctx, HM, 'income')}${calcRow(ctx, HM, 'savings')}${calcRow(ctx, HM, 'ror')}</div>
          <div class="lib-calc-go" style="top:400px"><button type="button" class="st-pill" data-go="1">${cp(HM, 'calc')}</button></div>
          <div class="lib-calc-res st-card is-off" style="top:394px;left:200px;width:1200px"></div>
          <p class="st-disclaimer lib-calc-foot">${L.disclosure.html('hypothetical')}</p>`;
        L.disclosure.guard(ctx, 'ror');
        ctx.on(ctx.$('[data-go]'), 'click', () => ctx.next());
        ctx.onFields(() => { if (ctx.step >= 1) hmDraw(ctx); });
      },
      step(ctx, n) {
        if (n >= 1) hmDraw(ctx);
        ctx.show('.lib-calc-res', n >= 1);
        ctx.show('.lib-calc-go', n < 1);
      }
    };
  }
  L.howMuch = {
    def: howMuchDef,
    screen(id, opts) { EFA.screen(id, howMuchDef(opts)); },
    run: howMuchRun
  };
})();
