/* EFA Prospect Search V3 - Phase 1 application.
 * Drives the approved sidebar/dense-row UI from the live partner-gated RPC adapter
 * (EFASearchV3Adapter -> tc_search_v3 / tc_search_facets_v3). No sample data.
 * Server-side filtering + cursor pagination; KPIs computed from the visible page. */
(function (root) {
  'use strict';
  const $ = id => document.getElementById(id);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = v => v == null ? '—' : '$' + Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const numf = v => v == null ? '—' : Number(v).toLocaleString('en-US', { maximumFractionDigits: 1 });
  const split = q => String(q || '').split(',').map(x => x.trim()).filter(Boolean);
  const csvCell = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';

  // Map the RPC/DB status strings to the approved status color classes.
  function statusClass(s) {
    if (s === 'Working') return 'working';
    if (s === 'Left payroll') return 'left';
    if (s === 'Confirmed Retired') return 'retired';
    return 'pension'; // Pension Retiree and anything else
  }
  // Sidebar sort value -> RPC sort token.
  const SORT_MAP = { priority: 'priority_desc', evidence: 'evidence_desc', retirement: 'retirement_desc', separation: 'separation_desc', service: 'service_desc', amount: 'amount_desc', name: 'name_asc' };

  const state = {
    facets: {}, rows: [], result: null, cursor: null, back: [],
    view: 'cards', mode: 'unknown', titleMode: 'any', page: 1, pageSize: 25
  };

  function toast(msg) { const t = $('toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1700); }

  /* ---------- facets -> populate sidebar controls ---------- */
  function fillSelect(id, values, placeholder) {
    const el = $(id); if (!el) return;
    const cur = el.value;
    el.innerHTML = `<option value="">${esc(placeholder)}</option>` + (values || []).map(v => `<option${v === cur ? ' selected' : ''}>${esc(v)}</option>`).join('');
  }
  function fillPills(id, values) {
    const box = $(id); if (!box) return;
    box.innerHTML = (values || []).map(v => `<button class="pillbtn" data-val="${esc(v)}">${esc(v)}<span class="count"></span></button>`).join('');
  }
  function fillChecks(id, values) {
    const box = $(id); if (!box) return;
    box.innerHTML = (values || []).map(v => `<label class="check"><input type="checkbox" value="${esc(v)}">${esc(v)}</label>`).join('');
  }
  function countFor(facetName, value) {
    const c = state.facets.counts && state.facets.counts[facetName];
    if (!c) return null;
    return c[value] ?? null;
  }
  function loadFacets(f) {
    state.facets = f || {};
    // State pills default ON (both states in scope), like the approved UI.
    const states = f.states && f.states.length ? f.states : ['CA', 'WA'];
    $('statePills').innerHTML = states.map(v => `<button class="pillbtn on" data-val="${esc(v)}">${esc(v)}<span class="count"></span></button>`).join('');
    fillChecks('statusChecks', f.statuses || ['Working', 'Left payroll', 'Confirmed Retired', 'Pension Retiree']);
    fillPills('rolePills', f.role_families || []);
    fillSelect('metroSel', f.metros || [], 'All regions');
    fillSelect('countySel', f.counties || [], 'All counties');
    fillSelect('employerSel', f.employers || [], 'All employers');
    fillSelect('subRoleSel', f.role_subfamilies || [], 'All sub-families');
    fillSelect('levelSel', f.role_levels || [], 'All levels');
    fillSelect('systemSel', f.pension_systems || [], 'All systems');
    fillSelect('matchSel', f.match_confidences || [], 'Any confidence');
    fillSelect('amtType', f.amount_types || [], 'Any amount');
    fillSelect('svcQualSel', f.service_qualities || [], 'Any quality');
    fillSelect('roleMapSel', f.role_map_statuses || [], 'Any');
    updateFacetCounts();
    bindFacetControls();
  }
  function updateFacetCounts() {
    $$('#statePills .pillbtn').forEach(b => { const n = countFor('state', b.dataset.val); b.querySelector('.count').textContent = n == null ? '' : ' ' + Number(n).toLocaleString(); });
    $$('#rolePills .pillbtn').forEach(b => { const n = countFor('role_family', b.dataset.val); b.querySelector('.count').textContent = n == null ? '' : ' ' + Number(n).toLocaleString(); });
  }

  /* ---------- read controls -> RPC filter object ---------- */
  function pillVals(id) { return $$(`#${id} .pillbtn.on`).map(b => b.dataset.val); }
  function checkVals(id) { return $$(`#${id} input:checked`).map(x => x.value); }
  function v(id) { return $(id)?.value?.trim() || ''; }
  function nv(id) { const x = v(id); return x === '' ? null : Number(x); }
  function toggleOn(name) { const b = document.querySelector(`[data-toggle="${name}"]`); return !!(b && b.classList.contains('on')); }

  function readFilters() {
    const states = pillVals('statePills');
    return {
      master: v('nameQ'),
      states: states,
      statuses: checkVals('statusChecks'),
      metros: v('metroSel') ? [v('metroSel')] : [],
      counties: v('countySel') ? [v('countySel')] : [],
      employers: v('employerSel') ? [v('employerSel')] : [],
      department: v('deptQ'),
      role_families: pillVals('rolePills'),
      role_subfamilies: v('subRoleSel') ? [v('subRoleSel')] : [],
      role_levels: v('levelSel') ? [v('levelSel')] : [],
      title_any: state.titleMode === 'any' ? split(v('titleQ')) : [],
      title_all: state.titleMode === 'all' ? split(v('titleQ')) : [],
      title_exact: state.titleMode === 'exact' ? v('titleQ') : '',
      title_excludes: split(v('titleEx')),
      service_min: nv('svcMin'), service_max: nv('svcMax'),
      observed_min: nv('obsMin'), observed_max: nv('obsMax'),
      service_qualities: v('svcQualSel') ? [v('svcQualSel')] : [],
      role_map_statuses: v('roleMapSel') ? [v('roleMapSel')] : [],
      pension_systems: v('systemSel') ? [v('systemSel')] : [],
      retirement_min: nv('retMin'), retirement_max: nv('retMax'),
      separation_min: nv('sepMin'), separation_max: nv('sepMax'),
      match_confidences: v('matchSel') ? [v('matchSel')] : [],
      amount_types: v('amtType') ? [v('amtType')] : [],
      amount_min: nv('amtMin'), amount_max: nv('amtMax'),
      priority_min: nv('priorityMin'), coverage_min: nv('coverageMin'),
      name_query: '', name_mode: 'contains'
    };
  }

  /* ---------- active-filter chips ---------- */
  function activeChips() {
    const f = readFilters(); const out = [];
    const push = (label) => out.push(label);
    if (f.states.length && f.states.length < 2) push('State: ' + f.states.join(', '));
    if (f.statuses.length) push('Status: ' + f.statuses.join(' / '));
    if (f.metros.length) push('Metro: ' + f.metros.join(', '));
    if (f.counties.length) push('County: ' + f.counties.join(', '));
    if (f.employers.length) push('Employer: ' + f.employers.join(', '));
    if (f.role_families.length) push('Role: ' + f.role_families.join(', '));
    if (f.role_subfamilies.length) push('Sub-family: ' + f.role_subfamilies.join(', '));
    if (f.role_levels.length) push('Level: ' + f.role_levels.join(', '));
    if (f.department) push('Dept: ' + f.department);
    const t = split(v('titleQ')); if (t.length) push('Title ' + state.titleMode.toUpperCase() + ': ' + t.join(', '));
    if (f.title_excludes.length) push('Exclude: ' + f.title_excludes.join(', '));
    if (f.service_min != null || f.service_max != null) push('Service ' + (f.service_min ?? '…') + '–' + (f.service_max ?? '…'));
    if (f.observed_min != null || f.observed_max != null) push('Observed ' + (f.observed_min ?? '…') + '–' + (f.observed_max ?? '…'));
    if (f.pension_systems.length) push('System: ' + f.pension_systems.join(', '));
    if (f.retirement_min != null || f.retirement_max != null) push('Retired ' + (f.retirement_min ?? '…') + '–' + (f.retirement_max ?? '…'));
    if (f.separation_min != null || f.separation_max != null) push('Separated ' + (f.separation_min ?? '…') + '–' + (f.separation_max ?? '…'));
    if (f.match_confidences.length) push('Match: ' + f.match_confidences.join(', '));
    if (f.amount_types.length) push('Amount type: ' + f.amount_types.join(', '));
    if (f.amount_min != null || f.amount_max != null) push('Amount ' + (f.amount_min ?? '…') + '–' + (f.amount_max ?? '…'));
    if (f.priority_min != null) push('Priority ≥ ' + f.priority_min);
    if (f.coverage_min != null) push('Evidence ≥ ' + f.coverage_min + '%');
    if (f.service_qualities.length) push('Quality: ' + f.service_qualities.join(', '));
    if (f.role_map_statuses.length) push('Role map: ' + f.role_map_statuses.join(', '));
    if (f.master) push('Search: ' + f.master);
    return out;
  }
  function renderActive() {
    const chips = activeChips();
    $('activeFilters').innerHTML = chips.length
      ? chips.map(x => `<span class="af">${esc(x)}</span>`).join('')
      : '<span class="af" style="opacity:.6">No additional filters — showing all eligible prospects</span>';
  }

  /* ---------- row rendering (approved dense card) ---------- */
  function serviceTag(r) {
    if (r.service_years != null) return `<span class="tag green">${numf(r.service_years)} yrs service</span>`;
    if (r.years_observed != null) return `<span class="tag">${numf(r.years_observed)} yrs observed</span>`;
    return `<span class="tag">Service unknown</span>`;
  }
  function timingText(r) { return r.retirement_year ? 'Ret. ' + r.retirement_year : r.separation_year ? 'Left ' + r.separation_year : 'Active'; }
  function systemText(r) { return r.pension_system || r.confirmed_pension_system || r.expected_pension_system || '—'; }

  function cardHtml(r) {
    const p = r.priority || {};
    const score = p.priority_score;
    const pct = Math.max(12, Math.min(100, Number(score) || 12));
    const employer = r.employer || systemText(r) || 'Pension source';
    return `<article class="prospect" data-id="${esc(r.source_id)}">`
      + `<div class="scorebox"><div class="score" style="--clip:${pct}%"><span>${score ?? '—'}</span></div><div class="scorelab">Priority</div></div>`
      + `<div class="pros-main">`
        + `<div class="name-row"><span class="pname">${esc(r.canonical_name)}</span><span class="status ${statusClass(r.status)}">${esc(r.status)}</span></div>`
        + `<div class="role">${esc(r.job_title || 'Title unavailable')}</div>`
        + `<div class="employer">${esc(employer)}${r.department ? ' · ' + esc(r.department) : ''}</div>`
        + `<div class="tags"><span class="tag gold">${esc(r.role_family || r.role_map_status || 'Unclassified')}</span>`
          + `${r.role_subfamily ? `<span class="tag">${esc(r.role_subfamily)}</span>` : ''}`
          + `${serviceTag(r)}`
          + `${r.match_confidence ? `<span class="tag">${esc(r.match_confidence)}</span>` : ''}`
          + `<span class="tag">${p.evidence_coverage ?? 0}% evidence</span></div>`
      + `</div>`
      + `<div class="facts">`
        + `<div class="fact"><label>${esc(r.amount_type || 'Amount')}</label><b>${money(r.amount)}</b></div>`
        + `<div class="fact"><label>Pension System</label><b>${esc(systemText(r))}</b><small>${esc(r.system_confidence || '')}</small></div>`
        + `<div class="fact"><label>Retirement / Separation</label><b>${esc(timingText(r))}</b></div>`
        + `<div class="fact"><label>Evidence</label><b>${p.evidence_coverage ?? 0}%</b><small>${esc(p.evidence_band || '')}</small></div>`
      + `</div>`
      + `<div class="actions">`
        + `<button class="action openDetail" data-id="${esc(r.source_id)}">Open Prospect</button>`
        + `<a class="action" target="_blank" rel="noopener" href="https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(r.canonical_name + ' ' + (r.employer || ''))}">Find LinkedIn</a>`
        + `<div class="contact-dots"><span class="cd" title="LinkedIn — Phase 2">in</span><span class="cd phone" title="Phone — Phase 2">☎</span><span class="cd email" title="Email — Phase 2">@</span></div>`
      + `</div>`
      + `</article>`;
  }
  function tableRow(r) {
    const p = r.priority || {};
    return `<tr data-id="${esc(r.source_id)}"><td class="tname">${esc(r.canonical_name)}</td><td>${esc(r.status)}</td><td>${esc(r.employer || '—')}</td><td>${esc(r.job_title || '—')}</td><td>${r.service_years != null ? numf(r.service_years) : (r.years_observed != null ? numf(r.years_observed) + ' obs.' : '—')}</td><td>${esc(timingText(r))}</td><td>${money(r.amount)}</td><td>${esc(systemText(r))}</td><td><b>${p.priority_score ?? '—'}</b></td><td>${p.evidence_coverage ?? 0}%</td></tr>`;
  }

  function renderKpis() {
    const rows = state.rows;
    const total = state.result?.total;
    $('kpiMatch').textContent = total == null ? rows.length.toLocaleString() + (state.result?.next_cursor ? '+' : '') : Number(total).toLocaleString();
    $('kpiRetire').textContent = rows.filter(r => ['Confirmed Retired', 'Pension Retiree', 'Left payroll'].includes(r.status)).length;
    $('kpiHigh').textContent = rows.filter(r => (r.priority?.priority_score || 0) >= 75).length;
    const avg = rows.length ? Math.round(rows.reduce((s, r) => s + (r.priority?.evidence_coverage || 0), 0) / rows.length) : 0;
    $('kpiEvidence').textContent = avg + '%';
  }
  function renderMeta() {
    const total = state.result?.total;
    const shown = state.rows.length;
    $('resultSub').textContent = total == null ? `${shown.toLocaleString()} on this page · page ${state.back.length + 1}` : `${Number(total).toLocaleString()} matching`;
  }
  function renderResults() {
    if (!state.rows.length) {
      $('cards').innerHTML = '<div class="empty"><strong>No prospects match the current criteria.</strong><br>Remove a filter or choose another template.</div>';
      $('tableBody').innerHTML = ''; $('pager').innerHTML = ''; return;
    }
    $('cards').innerHTML = state.rows.map(cardHtml).join('');
    $('tableBody').innerHTML = state.rows.map(tableRow).join('');
    renderPager();
    bindRows();
  }
  function renderPager() {
    const hasPrev = state.back.length > 0, hasNext = !!state.result?.next_cursor;
    if (!hasPrev && !hasNext) { $('pager').innerHTML = ''; return; }
    $('pager').innerHTML = `<button id="pgPrev" ${hasPrev ? '' : 'disabled'}>Previous</button><button class="on" style="pointer-events:none">Page ${state.back.length + 1}</button><button id="pgNext" ${hasNext ? '' : 'disabled'}>Next</button>`;
    if (hasPrev) $('pgPrev').onclick = goPrev;
    if (hasNext) $('pgNext').onclick = goNext;
  }
  function bindRows() {
    $$('.openDetail').forEach(b => b.onclick = e => { e.stopPropagation(); openDetail(b.dataset.id); });
    $$('.prospect').forEach(r => r.onclick = () => openDetail(r.dataset.id));
    $$('.tbl tbody tr').forEach(r => r.onclick = () => openDetail(r.dataset.id));
  }

  /* ---------- run search via adapter (real RPC) ---------- */
  async function runSearch(resetCursor = true) {
    try {
      if (resetCursor) { state.cursor = null; state.back = []; }
      renderActive();
      $('cards').innerHTML = '<div class="empty">Searching prospect intelligence…</div>';
      const sort = SORT_MAP[$('sortSel').value] || 'priority_desc';
      const res = await root.EFASearchV3Adapter.search(readFilters(), { cursor: state.cursor, sort, limit: state.pageSize });
      state.result = res;
      state.rows = res.rows || [];
      renderResults(); renderMeta(); renderKpis();
    } catch (e) {
      console.error(e);
      $('cards').innerHTML = `<div class="empty"><strong>Search error.</strong><br>${esc(e.message || e)}</div>`;
    }
  }
  async function goNext() { if (!state.result?.next_cursor) return; state.back.push(state.cursor); state.cursor = state.result.next_cursor; await runSearch(false); window.scrollTo({ top: 300, behavior: 'smooth' }); }
  async function goPrev() { if (!state.back.length) return; state.cursor = state.back.pop(); await runSearch(false); window.scrollTo({ top: 300, behavior: 'smooth' }); }

  /* ---------- detail drawer ---------- */
  function dcard(label, val) { return `<div class="dcard"><label>${esc(label)}</label><b>${esc(val)}</b></div>`; }
  function componentRow(name, c) {
    if (!c) return `<div class="event"><b>${esc(name)}</b><p>Not available</p></div>`;
    const available = c.available !== false;
    const pct = available && c.max ? Math.max(0, Math.min(100, (c.points / c.max) * 100)) : 0;
    return `<div class="event"><b>${esc(name)} — ${available ? `${c.points}/${c.max} pts` : 'Not researched'}</b>`
      + `<div class="bar" style="height:8px;border-radius:99px;background:#eee9df;overflow:hidden;margin:5px 0"><i style="display:block;height:100%;background:var(--gold);width:${pct}%"></i></div></div>`;
  }
  function whyText(r) {
    const p = r.priority || {};
    if (p.explanation) return esc(p.explanation);
    const a = [];
    if (r.status === 'Confirmed Retired') a.push('confirmed retirement match');
    else if (r.status === 'Pension Retiree') a.push('pension-source retiree');
    else if (r.status === 'Left payroll') a.push('recent payroll separation');
    if (r.service_years >= 25) a.push(`${numf(r.service_years)} verified service years`);
    if (r.amount >= 150000) a.push('strong economic signal');
    return a.length ? 'High-level rationale: ' + a.join('; ') + '.' : 'Source-backed prospect criteria.';
  }
  function openDetail(id) {
    const r = state.rows.find(x => String(x.source_id) === String(id));
    if (!r) return;
    const p = r.priority || {}, c = p.components || {};
    $('dName').textContent = r.canonical_name;
    $('dSubtitle').textContent = `${r.status} · ${r.employer || systemText(r)}`;

    $('pane-snapshot').innerHTML =
      `<div class="dgrid">${dcard('Priority', (p.priority_score ?? '—') + '/100')}${dcard('Evidence', (p.evidence_coverage ?? 0) + '%')}${dcard('Status', r.status)}${dcard('System', systemText(r))}${dcard('Service', r.service_years != null ? numf(r.service_years) + ' yrs' : 'Not verified')}${dcard('Years observed', r.years_observed ?? '—')}${dcard(r.amount_type || 'Amount', money(r.amount))}${dcard('Metro / County', [r.metro, r.county].filter(Boolean).join(' / ') || '—')}${dcard('Match', r.match_confidence || '—')}</div>`
      + `<div class="section-title">Why this prospect surfaced</div><div class="quality">${whyText(r)}</div>`
      + `<div class="section-title">Contactability &amp; activity</div><div class="quality">Contactability and activity are reserved for Phase 2 enrichment and are intentionally not scored as zero. The schema holds phone, email, LinkedIn, recent activity, and Direct Message prioritization for later.</div>`;

    $('pane-research').innerHTML =
      `<div class="dgrid">${dcard('Role', r.job_title || 'Unknown')}${dcard('Role classification', [r.role_family, r.role_subfamily].filter(Boolean).join(' / ') || r.role_map_status || 'Unknown')}${dcard('Role level', r.role_level || 'Unknown')}${dcard('Employer', r.employer || 'Unknown')}${dcard('Department', r.department || 'Unknown')}${dcard('Worksite', r.worksite || 'Unknown')}</div>`
      + `<div class="section-title">Data semantics</div>`
      + `<div class="quality"><b>Service quality:</b> ${esc(r.service_years_quality || 'Unknown')} &nbsp;·&nbsp; <b>Source:</b> ${esc(r.source_dataset || 'Unknown')} (${esc(r.source_year ?? '—')}) &nbsp;·&nbsp; <b>System confidence:</b> ${esc(r.system_confidence || 'Unknown')}</div>`
      + `<div class="section-title">Search launchers</div><div class="research-links">`
        + `<a target="_blank" rel="noopener" href="https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(r.canonical_name + ' ' + (r.employer || ''))}">Search LinkedIn</a>`
        + `<a target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent('"' + r.canonical_name + '" ' + (r.employer || systemText(r) || ''))}">Google exact name</a>`
        + `<a target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent('"' + r.canonical_name + '" retirement')}">Retirement signals</a></div>`;

    $('pane-priority').innerHTML =
      `<div class="section-title">Priority Score V1 components</div>`
      + `${componentRow('Retirement / transition', c.retirement_timing)}${componentRow('Career maturity', c.career_maturity)}${componentRow('Economic signal', c.economic_signal)}${componentRow('Data confidence', c.data_confidence)}${componentRow('Contactability', c.contactability)}${componentRow('Activity / timing', c.activity_timing)}`
      + `<div class="quality" style="margin-top:12px">V1 score: ${p.measured_points ?? '—'} measured points of ${p.measured_max ?? '—'} available, normalized to ${p.priority_score ?? '—'}/100. Evidence coverage: ${p.evidence_coverage ?? '—'}% of the Phase 1 measurable points. Missing source data is not scored as zero.</div>`;

    $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === 'snapshot'));
    $$('.tabpane').forEach(pn => pn.classList.toggle('on', pn.id === 'pane-snapshot'));
    $('detail').classList.add('on'); $('drawerBg').classList.add('on');
  }
  function closeDetail() { $('detail').classList.remove('on'); $('drawerBg').classList.remove('on'); }

  /* ---------- templates ---------- */
  function setStatePills(vals) { $$('#statePills .pillbtn').forEach(b => b.classList.toggle('on', vals.includes(b.dataset.val))); }
  function setRolePills(vals) { $$('#rolePills .pillbtn').forEach(b => b.classList.toggle('on', vals.includes(b.dataset.val))); }
  function setStatusChecks(vals) { $$('#statusChecks input').forEach(x => x.checked = vals.includes(x.value)); }
  function applyTemplate(key) {
    reset(false);
    if (key === 'laRetire') { setStatePills(['CA']); setStatusChecks(['Left payroll', 'Confirmed Retired', 'Pension Retiree']); if ([...$('metroSel').options].some(o => o.value === 'Los Angeles')) $('metroSel').value = 'Los Angeles'; $('retMin').value = '2023'; $('sepMin').value = '2024'; }
    if (key === 'safety') { setRolePills(['Public Safety']); $('svcMin').value = '20'; }
    if (key === 'educators') { setRolePills(['Education']); $('svcMin').value = '25'; }
    if (key === 'highComp') { $('amtMin').value = '150000'; $('priorityMin').value = '55'; $('sortSel').value = 'amount'; }
    if (key === 'waLong') { setStatePills(['WA']); setRolePills(['Education']); $('svcMin').value = '25'; $('sortSel').value = 'service'; }
    if (key === 'uncontacted') { $('priorityMin').value = '80'; $('coverageMin').value = '75'; }
    runSearch(true);
  }

  /* ---------- reset / clear ---------- */
  function reset(run = true) {
    setStatePills(state.facets.states && state.facets.states.length ? state.facets.states : ['CA', 'WA']);
    setRolePills([]);
    $$('#statusChecks input').forEach(x => x.checked = false);
    ['metroSel', 'countySel', 'employerSel', 'subRoleSel', 'levelSel', 'systemSel', 'matchSel', 'amtType', 'svcQualSel', 'roleMapSel'].forEach(id => { if ($(id)) $(id).value = ''; });
    ['deptQ', 'titleQ', 'titleEx', 'svcMin', 'svcMax', 'obsMin', 'obsMax', 'retMin', 'retMax', 'sepMin', 'sepMax', 'amtMin', 'amtMax', 'priorityMin', 'coverageMin', 'nameQ'].forEach(id => { if ($(id)) $(id).value = ''; });
    $$('.logic button').forEach(b => b.classList.toggle('on', b.dataset.mode === 'any'));
    state.titleMode = 'any';
    $('sortSel').value = 'priority';
    renderActive();
    if (run) runSearch(true);
  }

  /* ---------- saved searches (localStorage) ---------- */
  const SKEY = 'efa_search_v3_phase1_saved';
  function currentFilterObject() { return { filters: readFilters(), titleMode: state.titleMode, sort: $('sortSel').value, titleQ: v('titleQ') }; }
  function renderSaved() {
    const list = JSON.parse(localStorage.getItem(SKEY) || '[]');
    $('savedList').innerHTML = list.length
      ? list.map((x, i) => `<div class="saveditem"><span><b>${esc(x.name)}</b><br><small>${new Date(x.saved).toLocaleString()}</small></span><span><button data-load="${i}">Load</button> · <button data-del="${i}">Delete</button></span></div>`).join('')
      : '<div class="helpbox">No saved searches yet.</div>';
    $$('[data-del]').forEach(b => b.onclick = () => { list.splice(+b.dataset.del, 1); localStorage.setItem(SKEY, JSON.stringify(list)); renderSaved(); });
    $$('[data-load]').forEach(b => b.onclick = () => { loadFilterObject(list[+b.dataset.load].obj); $('savedModal').classList.remove('on'); toast('Saved search loaded'); });
  }
  function saveSearch(name) {
    if (!name.trim()) return toast('Enter a search name');
    const list = JSON.parse(localStorage.getItem(SKEY) || '[]').filter(x => x.name !== name.trim());
    list.unshift({ name: name.trim(), obj: currentFilterObject(), saved: new Date().toISOString() });
    localStorage.setItem(SKEY, JSON.stringify(list.slice(0, 15)));
    $('saveName').value = ''; renderSaved(); toast('Search saved in this browser');
  }
  function loadFilterObject(o) {
    if (!o) return;
    reset(false);
    const f = o.filters || {};
    setStatePills(f.states && f.states.length ? f.states : ['CA', 'WA']);
    setStatusChecks(f.statuses || []);
    setRolePills(f.role_families || []);
    const one = (arr) => (arr && arr.length ? arr[0] : '');
    if ($('metroSel')) $('metroSel').value = one(f.metros);
    if ($('countySel')) $('countySel').value = one(f.counties);
    if ($('employerSel')) $('employerSel').value = one(f.employers);
    if ($('subRoleSel')) $('subRoleSel').value = one(f.role_subfamilies);
    if ($('levelSel')) $('levelSel').value = one(f.role_levels);
    if ($('systemSel')) $('systemSel').value = one(f.pension_systems);
    if ($('matchSel')) $('matchSel').value = one(f.match_confidences);
    if ($('amtType')) $('amtType').value = one(f.amount_types);
    if ($('svcQualSel')) $('svcQualSel').value = one(f.service_qualities);
    if ($('roleMapSel')) $('roleMapSel').value = one(f.role_map_statuses);
    $('deptQ').value = f.department || '';
    $('titleQ').value = o.titleQ || '';
    $('titleEx').value = (f.title_excludes || []).join(', ');
    const setn = (id, val) => { if ($(id)) $(id).value = val == null ? '' : val; };
    setn('svcMin', f.service_min); setn('svcMax', f.service_max); setn('obsMin', f.observed_min); setn('obsMax', f.observed_max);
    setn('retMin', f.retirement_min); setn('retMax', f.retirement_max); setn('sepMin', f.separation_min); setn('sepMax', f.separation_max);
    setn('amtMin', f.amount_min); setn('amtMax', f.amount_max); setn('priorityMin', f.priority_min); setn('coverageMin', f.coverage_min);
    $('nameQ').value = f.master || '';
    state.titleMode = o.titleMode || 'any';
    $$('.logic button').forEach(b => b.classList.toggle('on', b.dataset.mode === state.titleMode));
    $('sortSel').value = o.sort || 'priority';
    runSearch(true);
  }

  /* ---------- CSV of current page ---------- */
  function exportCsv() {
    if (!state.rows.length) return toast('Nothing to export');
    const cols = ['canonical_name', 'status', 'state', 'metro', 'county', 'employer', 'department', 'job_title', 'role_family', 'role_subfamily', 'service_years', 'years_observed', 'service_years_quality', 'pension_system', 'separation_year', 'retirement_year', 'amount', 'amount_type', 'match_confidence', 'source_dataset', 'source_year'];
    const lines = [cols.join(',').concat(',priority_score,evidence_coverage')];
    state.rows.forEach(r => {
      const base = cols.map(k => csvCell(r[k]));
      base.push(csvCell(r.priority?.priority_score), csvCell(r.priority?.evidence_coverage));
      lines.push(base.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'efa-prospect-search-v3-page.csv'; a.click(); URL.revokeObjectURL(a.href);
    toast('CSV of this page exported');
  }

  /* ---------- bindings ---------- */
  function bindFacetControls() {
    $$('#statePills .pillbtn').forEach(b => b.onclick = () => { b.classList.toggle('on'); runSearch(true); });
    $$('#rolePills .pillbtn').forEach(b => b.onclick = () => { b.classList.toggle('on'); runSearch(true); });
    $$('#statusChecks input').forEach(x => x.onchange = () => runSearch(true));
    ['metroSel', 'countySel', 'employerSel', 'subRoleSel', 'levelSel', 'systemSel', 'matchSel', 'amtType', 'svcQualSel', 'roleMapSel'].forEach(id => { if ($(id)) $(id).onchange = () => runSearch(true); });
  }
  function bindStatic() {
    $$('.logic button').forEach(b => b.onclick = () => { $$('.logic button').forEach(x => x.classList.remove('on')); b.classList.add('on'); state.titleMode = b.dataset.mode; renderActive(); });
    $$('.template').forEach(b => b.onclick = () => applyTemplate(b.dataset.template));
    ['deptQ', 'titleQ', 'titleEx', 'svcMin', 'svcMax', 'obsMin', 'obsMax', 'retMin', 'retMax', 'sepMin', 'sepMax', 'amtMin', 'amtMax', 'priorityMin', 'coverageMin'].forEach(id => {
      if (!$(id)) return;
      $(id).addEventListener('input', () => { renderActive(); clearTimeout(root._efaRt); root._efaRt = setTimeout(() => runSearch(true), 350); });
    });
    $('nameQ').addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(true); });
    $('sortSel').onchange = () => runSearch(true);
    $('runBtn').onclick = () => runSearch(true);
    $('clearBtn').onclick = () => reset(true);
    $('resetBtn').onclick = () => reset(true);
    $('cardView').onclick = () => { $('cardView').classList.add('on'); $('tableView').classList.remove('on'); $('cards').classList.remove('off'); $('tableWrap').classList.remove('on'); };
    $('tableView').onclick = () => { $('tableView').classList.add('on'); $('cardView').classList.remove('on'); $('cards').classList.add('off'); $('tableWrap').classList.add('on'); };
    $('detailClose').onclick = closeDetail; $('drawerBg').onclick = closeDetail;
    $$('.tab').forEach(t => t.onclick = () => { $$('.tab').forEach(x => x.classList.toggle('on', x === t)); $$('.tabpane').forEach(pn => pn.classList.toggle('on', pn.id === 'pane-' + t.dataset.tab)); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDetail(); $('savedModal').classList.remove('on'); } });
    $('saveBtn').onclick = () => { $('savedModal').classList.add('on'); renderSaved(); $('saveName').focus(); };
    $('savedBtn').onclick = () => { $('savedModal').classList.add('on'); renderSaved(); };
    $('closeSaved').onclick = () => $('savedModal').classList.remove('on');
    $('savedModal').onclick = e => { if (e.target === $('savedModal')) $('savedModal').classList.remove('on'); };
    $('saveCurrent').onclick = () => saveSearch($('saveName').value);
    $('exportBtn').onclick = exportCsv;
  }

  /* ---------- init ---------- */
  async function init() {
    try {
      state.pageSize = root.EFA_SEARCH_V3_CONFIG?.pageSize || 25;
      state.mode = root.EFASearchV3Adapter?.mode || 'unknown';
      const initRes = await root.EFASearchV3Adapter.init();
      if (initRes?.redirecting) return;
      if (state.mode === 'sample') $('previewBar').classList.remove('hidden');
      const facets = await root.EFASearchV3Adapter.facets();
      loadFacets(facets);
      bindStatic();
      renderActive();
      await runSearch(true);
    } catch (e) {
      console.error(e);
      $('cards').innerHTML = `<div class="empty"><strong>Could not load Prospect Search.</strong><br>${esc(e.message || e)}</div>`;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof globalThis !== 'undefined' ? globalThis : this);
