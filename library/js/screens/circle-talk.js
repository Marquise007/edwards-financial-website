/* Circle Talk: General (CT), Retirees (CT2), Business Owners (CT3).
   Screen structure and sequence follow the original; drawings and wording are new. */
(function () {
  'use strict';
  const EFA = window.EFA;
  const A = EFA.art, P = A.P;

  EFA.css('ct', `
  .ct-full { position: absolute; inset: 0; width: 1600px; height: 900px; overflow: visible; }
  .ct-emb { position: absolute; display: grid; place-items: center; }
  .ct-emb svg { width: 100%; height: 100%; }
  .ct-emb-t { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; pointer-events: none; }
  .ct-emb-t > span { pointer-events: auto; font: 600 46px/1.18 "Cormorant Garamond", Georgia, serif; letter-spacing: .1em; text-transform: uppercase; color: #f7f5f1; }
  .ct-spin { transition: transform 1.8s cubic-bezier(.45,.05,.2,1); }
  .ct-spin.go { transform: rotate(360deg) scale(1.5); }
  .ct-grow { transition: transform 1.8s cubic-bezier(.45,.05,.2,1); }
  .ct-grow.go { transform: scale(1.5); }
  .ct-w { transition: transform .35s ease, opacity .8s ease; }
  .ct-w.link { cursor: pointer; }
  .ct-w.link:hover { filter: brightness(1.06); }
  .ct-lab { position: absolute; transform: translate(-50%, -50%); text-align: center; font: 700 25px/1.18 "DM Sans", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #f7f5f1; white-space: nowrap; transition: opacity .8s ease, left 1.2s ease, top 1.2s ease, transform 1.2s ease; }
  .ct-lab.dark { color: #0d1e3a; }
  .ct-lab.link { cursor: pointer; }
  .ct-lab.sm { font-size: 19px; letter-spacing: .08em; }
  .ct-lab.out { color: #0d1e3a; }
  .ct-hint { position: absolute; left: 50%; bottom: 46px; transform: translateX(-50%); font: 600 15px/1 "DM Sans", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #8a6e22; opacity: .85; white-space: nowrap; }
  .ct-head { position: absolute; left: 0; right: 0; top: 54px; display: grid; justify-items: center; gap: 14px; text-align: center; padding: 0 120px; }
  .ct-med { position: absolute; border-radius: 50%; background: #fffdf8; border: 1px solid #d6cfc4; box-shadow: 0 18px 40px rgba(13,30,58,.10); display: grid; place-items: center; overflow: hidden; }
  .ct-med svg { width: 72%; height: 72%; }
  .ct-arch { position: absolute; border-radius: 220px 220px 18px 18px; background: #fffdf8; border: 1px solid #d6cfc4; box-shadow: 0 18px 40px rgba(13,30,58,.10); display: grid; place-items: center; overflow: hidden; }
  .ct-arch svg { width: 78%; height: 78%; }
  .ct-cap { position: absolute; transform: translateX(-50%); font: 700 16px/1 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6e22; white-space: nowrap; }
  .ct-cols { position: absolute; left: 110px; right: 110px; top: 236px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 34px 46px; align-items: start; }
  .ct-col { display: grid; gap: 30px; align-content: start; }
  .ct-grp { display: grid; gap: 10px; }
  .ct-grp h3 { margin: 0 0 4px; font: 700 15px/1.2 "DM Sans", sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6e22; border-bottom: 2px solid #b8972e; padding-bottom: 8px; }
  .ct-grp .st-pill { width: 100%; justify-content: flex-start; padding-left: 20px; font-size: 18px; min-height: 42px; }
  .ct-toggle { cursor: pointer; }
  .ct-toggle:hover { color: #8a6e22; }
  .ct-x { position: absolute; }
  .ct-close { position: absolute; right: 110px; top: 230px; width: 520px; display: grid; gap: 26px; padding: 44px 46px; transition: opacity .9s ease .3s, transform .9s ease .3s; }
  .ct-close p { margin: 0; }
  .ct-close .q { font: 600 38px/1.2 "Cormorant Garamond", Georgia, serif; color: #0d1e3a; }
  .ct-close .lead { font: 400 25px/1.5 "DM Sans", sans-serif; color: #0d1e3a; }
  .ct-close.is-off { transform: translateY(14px); }
  .ct-bucket { position: absolute; transition: opacity .9s ease; }
  .ct-sport { cursor: pointer; transition: transform .25s ease, box-shadow .25s ease; }
  .ct-sport:hover { transform: translateY(-3px); box-shadow: 0 22px 46px rgba(13,30,58,.16); }
  .ct-ring { transition: opacity .8s ease, transform .8s ease; transform-origin: 620px 450px; }
  .ct-ring.is-off { transform: scale(.94); }
  .ct10-g { transition: transform 1.6s cubic-bezier(.45,.05,.2,1); transform-box: view-box; transform-origin: 720px 450px; }
  `);

  /* ---------- shared pieces ---------- */
  const C = { navy: P.navy, n2: P.navy2, n3: P.navy3, n4: P.navy4, gold: P.gold, goldLt: P.goldLt, goldDeep: P.goldDeep, mist: P.mist, mist2: P.mist2, cream: P.cream };
  const goldGrad = (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldLt}"/><stop offset="1" stop-color="${P.gold}"/></linearGradient>`;
  const navyGrad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a || P.navy4}"/><stop offset="1" stop-color="${b || P.navy2}"/></linearGradient>`;

  /** the circle emblem with editable center text */
  function emblem(ctx, o) {
    const key = ctx.variant === 'business' && o.bizKey ? o.bizKey : o.key;
    return `<div class="ct-emb ${o.cls || ''}" style="left:${o.x - o.size / 2}px;top:${o.y - o.size / 2}px;width:${o.size}px;height:${o.size}px">
      ${A.emblem({ size: o.size })}
      <div class="ct-emb-t ${o.textCls || ''}" style="font-size:${o.font || 46}px">${ctx.t(key, { attrs: `style="font-size:${o.font || 46}px"` })}</div>
    </div>`;
  }

  /** the three kinds of money: accumulated (top), transferred (right), lifestyle (left) */
  function moneyScreen(ctx, active) {
    const cx = 800, cy = 452, r = 330;
    const sl = [
      { key: 'acc', a0: -60, a1: 60 },
      { key: 'xfer', a0: 60, a1: 180 },
      { key: 'life', a0: 180, a1: 300 }
    ];
    const fills = { acc: 'url(#ctNa)', xfer: 'url(#ctNb)', life: 'url(#ctNc)' };
    fills[active] = 'url(#ctG)';
    const ex = 14;
    let paths = '', labs = '';
    sl.forEach((s) => {
      const mid = (s.a0 + s.a1) / 2, e = s.key === active ? ex : 4;
      const [dx, dy] = [e * Math.sin(mid * Math.PI / 180), -e * Math.cos(mid * Math.PI / 180)];
      paths += `<path class="ct-w ${s.key === active ? 'link' : ''}" data-k="${s.key}" d="${A.wedge(cx + dx, cy + dy, r, s.a0 + 0.6, s.a1 - 0.6)}" fill="${fills[s.key]}"/>`;
      const [lx, ly] = A.pt(cx + dx, cy + dy, r * 0.56, mid);
      labs += `<div class="ct-lab ${s.key === active ? 'dark link' : ''}" data-k="${s.key}" style="left:${lx}px;top:${ly}px">${ctx.t(s.key)}</div>`;
    });
    return `<svg class="ct-full" viewBox="0 0 1600 900"><defs>${goldGrad('ctG')}${navyGrad('ctNa', P.navy4, P.navy3)}${navyGrad('ctNb', P.navy3, P.navy2)}${navyGrad('ctNc', P.navy3, P.navy)}</defs>
      <circle cx="${cx}" cy="${cy + 10}" r="${r + 6}" fill="rgba(13,30,58,.08)"/>${paths}</svg>${labs}`;
  }

  /* ---------- 1. the circle ---------- */
  EFA.screen('ct1', {
    title: 'Your Circle of Wealth',
    copy: {
      center: 'Your Circle\nof Wealth',
      centerBiz: 'Your\nBusiness',
      _notes: 'Everything you will ever earn, save, spend and pass on moves through one circle. Today we look at the whole circle, not a single product.\n\n- Ask: When you picture all the money that will pass through your hands in your lifetime, what comes to mind?\nPAUSE\n\n- Set the expectation: today is about awareness. Recommendations come after we have your full picture.'
    },
    render(ctx) {
      ctx.el.innerHTML = emblem(ctx, { key: 'center', bizKey: 'centerBiz', x: 800, y: 450, size: 470, font: 44 });
    }
  });

  /* ---------- 2. the circle in motion ---------- */
  EFA.screen('ct2', {
    title: 'The circle in motion',
    copy: {
      center: 'Your Circle\nof Wealth',
      centerBiz: 'Your\nBusiness',
      _notes: 'The circle is always in motion. Money comes in, moves around, and leaves. Our work is to keep more of it moving in your favor.\n\n- Ask: How much of everything that has come into your circle over the years is still there today?\nPAUSE'
    },
    render(ctx) {
      ctx.el.innerHTML = `<div class="ct-emb" style="left:565px;top:215px;width:470px;height:470px">
          <div class="ct-spin" style="position:absolute;inset:0">${A.emblem({ size: 470 })}</div>
          <div class="ct-emb-t ct-grow">${ctx.t(ctx.variant === 'business' ? 'centerBiz' : 'center', { attrs: 'style="font-size:44px"' })}</div>
        </div>`;
      ctx.timeout(() => ctx.$$('.ct-spin, .ct-grow').forEach((n) => n.classList.add('go')), 100);
    }
  });

  /* ---------- 3. three kinds of money, accumulated in focus ---------- */
  EFA.screen('ct3', {
    title: 'Three kinds of money: accumulated',
    copy: {
      acc: 'Accumulated\nMoney', life: 'Lifestyle\nMoney', xfer: 'Transferred\nMoney',
      _notes: 'Every dollar lands in one of three places. Accumulated money is what you keep and grow. Lifestyle money is what you enjoy. Transferred money is what leaves, often without anyone noticing.\n\n- Ask: Which of the three gets most of the attention from most people? Which gets the least?\nPAUSE\n\n- Click Accumulated Money to open Retirement Ready or Not? when it fits the conversation.'
    },
    render(ctx) {
      ctx.el.innerHTML = moneyScreen(ctx, 'acc');
      ctx.on(ctx.$$('[data-k="acc"]'), 'click', () => ctx.jump('RRON', 'rron1'));
    }
  });

  /* ---------- 3b. the business owner's circle ---------- */
  const BIZ = [
    { s0: [[310, 20], [20, 180], [180, 284.7], [284.7, 300], [300, 310]], s1: [[335, 50], [50, 180], [180, 300], [300, 320], [320, 335]] }
  ][0];
  const BIZ_KEYS = ['phb', 'oe', 'life', 'bsl', 'oi'];
  EFA.screen('ct3b', {
    title: "The business owner's circle",
    steps: 2,
    copy: {
      phb: 'Privately Held\nBusiness', oe: 'Operating\nExpense', life: 'Lifestyle', bsl: 'Business-Supported\nLifestyle', oi: 'Other Investments',
      _notes: 'For a business owner, the circle includes the company itself. The largest slice is usually operating expense, and that is where efficiency shows up first.\n\n- Click forward to show what happens when operating expense runs more efficiently: every other slice grows.\n- Ask: If the business ran a few points leaner, where would you want that money to go?\nPAUSE'
    },
    render(ctx) {
      const cx = 800, cy = 452, r = 320;
      const fills = { phb: 'url(#bzA)', oe: 'url(#ctG)', life: 'url(#bzB)', bsl: 'url(#bzC)', oi: 'url(#bzD)' };
      const pieAt = (set, cls) => set.map(([a0, a1], i) => {
        const k = BIZ_KEYS[i];
        return `<path class="ct-w ${k === 'oe' ? 'link' : ''} ${cls}" data-k="${k}" d="${A.wedge(cx, cy, r, a0 + 0.5, a1 - 0.5)}" fill="${fills[k]}"/>`;
      }).join('');
      const labsAt = (set, cls) => set.map(([a0, a1], i) => {
        const k = BIZ_KEYS[i], mid = (a0 + a1) / 2, small = (a1 - a0 + 360) % 360 < 30;
        if (small) {
          const [x, y] = A.pt(cx, cy, r + 26, mid);
          return `<div class="ct-lab sm out ${cls}" data-k="${k}" style="left:${x - 14}px;top:${y}px;transform:translate(-100%,-50%);text-align:right">${ctx.t(k)}</div>`;
        }
        const [x, y] = A.pt(cx, cy, r * 0.58, mid);
        return `<div class="ct-lab ${k === 'oe' ? 'dark link' : ''} ${cls}" data-k="${k}" style="left:${x}px;top:${y}px">${ctx.t(k)}</div>`;
      }).join('');
      const fix = (set) => set.map(([a0, a1]) => [a0, a1 < a0 ? a1 + 360 : a1]);
      ctx.el.innerHTML = `<svg class="ct-full" viewBox="0 0 1600 900"><defs>${goldGrad('ctG')}${navyGrad('bzA', P.navy4, P.navy3)}${navyGrad('bzB', P.navy3, P.navy)}${navyGrad('bzC', '#3c5d92', P.navy4)}${navyGrad('bzD', '#5a77a6', '#3c5d92')}</defs>
          <circle cx="${cx}" cy="${cy + 10}" r="${r + 6}" fill="rgba(13,30,58,.08)"/>
          <g class="s0 fade">${pieAt(fix(BIZ.s0), '')}</g><g class="s1 fade">${pieAt(fix(BIZ.s1), '')}</g></svg>
        <div class="s0 fade">${labsAt(fix(BIZ.s0), '')}</div><div class="s1 fade">${labsAt(fix(BIZ.s1), '')}</div>`;
      ctx.on(ctx.$$('[data-k="oe"]'), 'click', () => {
        if (ctx.variant === 'rron') ctx.jump('RRON3', 'rron2b'); else ctx.jump('OE', 'oe1');
      });
    },
    step(ctx, n) { ctx.show('.s0', n === 0); ctx.show('.s1', n === 1); }
  });

  /* ---------- 4. wealth transfers and opportunity cost ---------- */
  EFA.screen('ct4', {
    title: 'Wealth transfers and opportunity cost',
    steps: 2,
    copy: {
      circle: 'Your Circle\nof Wealth', circleBiz: 'Your\nBusiness', xfer: 'Wealth\nTransfers', opp: 'Opportunity Costs',
      _notes: 'Wealth transfers are dollars that leave the circle, many of them avoidable: interest, taxes, fees and inefficiency.\n\n- Click Wealth Transfers to reveal the part most people never see, opportunity cost. A dollar that leaves takes everything it could have earned with it.\nPAUSE\n\n- Ask: If a dollar leaves today, what is it really costing you by the time you retire?\n- Click Opportunity Costs to open the Opportunity Cost presentation.'
    },
    render(ctx) {
      const cx = 760, cy = 450, r = 238, r1 = 262, r2 = 336;
      const biz = ctx.variant === 'business';
      ctx.el.innerHTML = `<svg class="ct-full" viewBox="0 0 1600 900"><defs>${goldGrad('ctG')}${navyGrad('c4a', P.navy3, P.navy)}${navyGrad('c4b', P.navy4, P.navy3)}
          <path id="c4arc" d="${A.arc(cx + 20, cy, (r1 + r2) / 2 - 10, 50, 130)}"/></defs>
          <circle cx="${cx}" cy="${cy + 10}" r="${r2 + 4}" fill="rgba(13,30,58,.07)"/>
          <path d="${A.wedge(cx, cy, r2, 135, 405, r1)}" fill="url(#c4b)"/>
          <g class="ct-w link" data-opp="1"><path class="oppband" d="${A.wedge(cx + 20, cy, r2, 45.5, 134.5, r1)}" fill="url(#c4b)" style="transition:fill .6s ease"/>
            <text class="opptext fade" font-family="DM Sans, sans-serif" font-weight="700" font-size="25" letter-spacing="4" fill="${P.navy}"><textPath href="#c4arc" startOffset="50%" text-anchor="middle">${ctx.t('opp', { tag: 'tspan' })}</textPath></text></g>
          <path d="${A.wedge(cx, cy, r, 135.5, 404.5)}" fill="url(#c4a)"/>
          <path class="ct-w link" data-x="1" d="${A.wedge(cx + 20, cy, r, 45.5, 134.5)}" fill="url(#ctG)"/>
        </svg>
        <div class="ct-lab" style="left:${cx - 92}px;top:${cy}px;font-size:${biz ? 30 : 27}px">${ctx.t(biz ? 'circleBiz' : 'circle')}</div>
        <div class="ct-lab dark link" data-x="1" style="left:${cx + 150}px;top:${cy}px">${ctx.t('xfer')}</div>`;
      ctx.on(ctx.$$('[data-x]'), 'click', () => (ctx.step === 0 ? ctx.next() : ctx.prev()));
      ctx.on(ctx.$('[data-opp]'), 'click', () => { if (ctx.step === 1) ctx.jump('OPPCOST', 'oppcost1'); });
    },
    step(ctx, n) {
      const band = ctx.$('.oppband');
      band.setAttribute('fill', n === 1 ? 'url(#ctG)' : 'url(#c4b)');
      ctx.show('.opptext', n === 1);
      ctx.$('[data-opp]').classList.toggle('link', n === 1);
    }
  });

  /* ---------- 5. where wealth transfers hide ---------- */
  const T = (label, key, target) => ({ label, key, target });
  const PERSONAL = [
    [['Mortgage', [T('Mortgages', 'mtg', ['MTG', 'mtg1']), T('Mortgage Insurance', 'mtgins')]],
     ['Taxes', [T('Compound Interest', 'ci', ['CI', 'ci1']), T('Estate Tax', 'esttax', ['FAMEST', 'estates1']), T('Income Tax', 'inctax', ['INCTAX', 'incTax1']), T('Property Tax', 'proptax'), T('Tax on Social Security', 'taxss', ['TAXSS', 'taxonss1']), T('Estate Planning', 'estplan', ['ESTPLN', 'estplan1'])]]],
    [['Qualified Plans', [T('Do 2 Things', 'qp2', ['QPD2T', 'qpdo2t1']), T('Tax History', 'taxhist', ['TAXHIST', 'taxhist1'])]],
     ['Protection', [T('Auto Insurance', 'auto', ['AUTOINS', 'autoIns1']), T('Disability Protection', 'dis', ['DISPROT', 'disprot1']), T('Homeowners', 'home', ['PH', 'ph1']), T('Major Medical Coverage', 'med', ['MAJMED', 'majmed1']), T('Umbrella', 'umb', ['UMBINS', 'umbins1']), T('Wills and Trusts', 'wills', ['WILLS', 'wills1']), T('Long-Term Care', 'ltc', ['LTC', 'ltc1']), T('Term Insurance', 'term', ['TERMINS', 'termins1'])]]],
    [['College Funding', [T('Education', 'educ', ['EDUC', 'educ1']), T('College Expense', 'ce', ['CE', 'ce1'])]],
     ['Major Purchases', [T('Credit Cards', 'cc', ['CC', 'cc1']), T('Financing a Car', 'fincar', ['FINCARS', 'fincars1']), T('Trading Cars', 'tradecar', ['TradeCar', 'tradecar1']), T('Income vs. Expenses', 'wip', ['WIP', 'wip2']), T('Amortizing vs. Compounding', 'evac', ['EVAC', 'evac1']), T('Major Capital Purchases', 'mcp', ['MCPF101', 'mcpf1'])]]]
  ];
  const BUSINESS = [
    [['Protection', [T('Fleet Insurance', 'b.fleet'), T('Business Overhead', 'b.overhead'), T('Liability Insurance', 'b.liab'), T('Business Continuation', 'b.cont'), T('Buy/Sell Agreements', 'b.buysell'), T('Disability Protection', 'b.dis', ['DISPROT', 'disprot1']), T('Major Medical Coverage', 'b.med', ['MAJMED', 'majmed1'])]]],
    [['Expenses', [T('Credit', 'b.credit'), T('Mortgages', 'b.mtg'), T('Financing', 'b.fin'), T('Employee Benefits', 'b.benefits')]]],
    [['Taxes', [T('Corporate Income Tax', 'b.corptax'), T('Corporate vs. Personal Tax', 'b.corpvs'), T('Deductible Opportunities', 'b.deduct'), T('Income Tax', 'b.inctax', ['INCTAX', 'incTax1']), T('Tax on Social Security', 'b.taxss', ['TAXSS', 'taxonss1']), T('Tax History', 'b.taxhist', ['TAXHIST', 'taxhist1']), T('Qualified Plans', 'b.qp', ['QP', 'qp1'])]]]
  ];
  const ct5copy = {
    head: 'Where Wealth Quietly Leaves', sub: 'Find each transfer. Shrink it. Stop it where you can.',
    headBiz: 'Business Wealth Transfers', subBiz: 'When capital moves, wealth moves with it.',
    _notes: 'This is the map of where money leaves. Let the client point to the categories that feel familiar.\n\n- Ask: Which of these has anyone ever sat down and explained to you?\nPAUSE\n\n- Any topic opens its own presentation; the Back button returns here.\n- Click the heading to switch between personal and business transfers.'
  };
  [PERSONAL, BUSINESS].forEach((cols, bi) => cols.forEach((col) => col.forEach(([g, items]) => {
    ct5copy[(bi ? 'bg.' : 'g.') + g] = g;
    items.forEach((it) => { ct5copy['i.' + it.key] = it.label; });
  })));
  EFA.screen('ct5', {
    title: 'Where wealth transfers hide',
    copy: ct5copy,
    render(ctx) {
      const biz = ctx.mem('biz', ctx.variant === 'business');
      const cols = biz ? BUSINESS : PERSONAL;
      const pill = (it) => it.target
        ? `<button class="st-pill" type="button" data-go="${it.target.join('|')}">${ctx.t('i.' + it.key)}</button>`
        : `<span class="st-pill is-static">${ctx.t('i.' + it.key)}</span>`;
      ctx.el.innerHTML = `
        <div class="ct-head">
          <h1 class="st-h1 ct-toggle" data-tog="1" title="Switch personal or business">${ctx.t(biz ? 'headBiz' : 'head')}</h1>
          <hr class="st-rule">
          <p class="st-small" style="margin:0;font-size:22px">${ctx.t(biz ? 'subBiz' : 'sub')}</p>
        </div>
        <div class="ct-cols">${cols.map((col) => `<div class="ct-col">${col.map(([g, items]) => `<div class="ct-grp"><h3>${ctx.t((biz ? 'bg.' : 'g.') + g)}</h3>${items.map(pill).join('')}</div>`).join('')}</div>`).join('')}</div>`;
      ctx.on(ctx.$('[data-tog]'), 'click', () => { ctx.remember('biz', !biz); EFA.player.renderScreen({ noFade: true }); });
      ctx.on(ctx.$$('[data-go]'), 'click', (e, n) => { const [k, s] = n.dataset.go.split('|'); ctx.jump(k, s); });
    }
  });

  /* ---------- 6. who controls your money ---------- */
  EFA.screen('ct6', {
    title: 'Who controls your money',
    copy: {
      head: 'Who Controls Your Money Today?',
      _notes: 'Every institution in this picture has a plan for your money: the lender, the card company, the bank, the tax system, the dealership. Most families have never been shown a plan of their own.\n\n- Ask: Of the dollars you earned last year, how many went where you decided, and how many were decided for you?\nPAUSE'
    },
    render(ctx) {
      const biz = ctx.variant === 'business';
      const L = A.ill;
      const left = biz ? [L.office(), L.loan()] : [L.house(), L.creditCards()];
      const right = biz ? [L.taxes(), L.equipment()] : [L.taxes(), L.car()];
      const med = (svg, x, y, d) => `<div class="ct-med" style="left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px">${svg}</div>`;
      ctx.el.innerHTML = `
        <div class="ct-head" style="top:58px"><h1 class="st-h1">${ctx.t('head')}</h1><hr class="st-rule"></div>
        ${med(left[0], 330, 360, 250)}${med(left[1], 330, 660, 250)}
        <div class="ct-arch" style="left:610px;top:230px;width:380px;height:560px">${L.bank()}</div>
        ${med(right[0], 1270, 360, 250)}${med(right[1], 1270, 660, 250)}`;
    }
  });

  /* ---------- 7. learning the rules (tic-tac-toe) ---------- */
  EFA.screen('ct7', {
    title: 'Learning the rules of the game',
    copy: {
      center: 'Your Circle\nof Wealth',
      _notes: 'Remember tic-tac-toe? Once you learn the rules, you stop losing. The institutions know the rules of money. Most families were never taught them.\n\n- Ask: Have you ever felt like you were playing a game where the other side knew rules you did not?\nPAUSE\n\n- Our role is to teach you the rules so the game is played from your side of the board.'
    },
    render(ctx) {
      const x0 = 420, x1 = 1180, y0 = 70, y1 = 830, cw = (x1 - x0) / 3, ch = (y1 - y0) / 3;
      const lines = [x0 + cw, x0 + 2 * cw].map((x) => `<path d="M${x},${y0} V${y1}"/>`).join('') + [y0 + ch, y0 + 2 * ch].map((y) => `<path d="M${x0},${y} H${x1}"/>`).join('');
      const xc = x0 + cw / 2, yc = y0 + ch / 2, s = 62;
      ctx.el.innerHTML = `<svg class="ct-full" viewBox="0 0 1600 900">
          <g stroke="${P.navy}" stroke-width="12" stroke-linecap="round" opacity=".9">${lines}</g>
          <g stroke="${P.gold}" stroke-width="16" stroke-linecap="round"><path d="M${xc - s},${yc - s} L${xc + s},${yc + s}"/><path d="M${xc + s},${yc - s} L${xc - s},${yc + s}"/></g>
        </svg>
        ${emblem(ctx, { key: 'center', x: 800, y: 450, size: 236, font: 23 })}`;
    }
  });

  /* ---------- shared: club or bat ---------- */
  const sport = () => EFA.clients.get('circle-talk', 'sport', 0);
  const setSport = (v) => EFA.clients.set('circle-talk', 'sport', v);
  const swingArt = (i) => (i === 1 ? A.ill.batSwing() : A.ill.golfSwing());
  const gearArt = (i) => (i === 1 ? A.ill.bats() : A.ill.golfBag());

  /* ---------- 8. the savings slice and risk ---------- */
  EFA.screen('ct8', {
    title: 'The savings slice and risk',
    steps: 2,
    copy: {
      life: 'Lifestyle', opp: 'Opportunity\nCost', tax: 'Taxes', int: 'Interest\non Debt', save: 'Savings &\nInvestment', risk: 'Risk',
      _notes: 'This is where most of the financial industry spends its time: the savings and investment slice. It matters, and it is one slice of the circle.\n\n- Click Savings & Investment to wrap risk around the whole circle. Market risk does not stay in one slice; it touches everything.\nPAUSE\n\n- Click the picture to switch between golf and baseball, whichever fits the client.'
    },
    render(ctx) {
      const cx = 620, cy = 450, r = 300;
      const sl = [
        { k: 'opp', a0: 0, a1: 60, f: 'url(#p8a)' }, { k: 'tax', a0: 60, a1: 120, f: 'url(#p8b)' }, { k: 'int', a0: 120, a1: 180, f: 'url(#p8a)' },
        { k: 'save', a0: 180, a1: 240, f: 'url(#ctG)' }, { k: 'life', a0: 240, a1: 360, f: 'url(#p8c)' }
      ];
      let paths = '', labs = '';
      sl.forEach((s) => {
        const mid = (s.a0 + s.a1) / 2, e = 6, dx = e * Math.sin(mid * Math.PI / 180), dy = -e * Math.cos(mid * Math.PI / 180);
        paths += `<path class="ct-w ${s.k === 'save' ? 'link' : ''}" data-k="${s.k}" d="${A.wedge(cx + dx, cy + dy, r, s.a0 + 0.6, s.a1 - 0.6)}" fill="${s.f}"/>`;
        const [lx, ly] = A.pt(cx + dx, cy + dy, s.k === 'life' ? r * 0.5 : r * 0.62, mid);
        labs += `<div class="ct-lab ${s.k === 'save' ? 'dark link' : ''} ${s.k === 'life' ? '' : 'sm'}" data-k="${s.k}" style="left:${lx}px;top:${ly}px;${s.k === 'life' ? '' : 'font-size:21px'}">${ctx.t(s.k)}</div>`;
      });
      const rr0 = r + 22, rr1 = r + 84;
      const chevron = (a, dir) => { const [x, y] = A.pt(cx, cy, (rr0 + rr1) / 2, a); return `<path d="M${x - 16 * dir},${y - 22} L${x + 12 * dir},${y} L${x - 16 * dir},${y + 22}" fill="none" stroke="${P.gold}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`; };
      const i = sport();
      ctx.el.innerHTML = `<svg class="ct-full" viewBox="0 0 1600 900"><defs>${goldGrad('ctG')}${navyGrad('p8a', P.navy4, P.navy3)}${navyGrad('p8b', P.navy3, P.navy2)}${navyGrad('p8c', P.navy3, P.navy)}</defs>
          <g class="ct-ring fade"><path d="${A.wedge(cx, cy, rr1, 0, 360, rr0)}" fill="${P.navy}" fill-rule="evenodd"/>${chevron(90, 1)}${chevron(270, -1)}</g>
          <circle cx="${cx}" cy="${cy + 10}" r="${r + 4}" fill="rgba(13,30,58,.07)"/>${paths}</svg>
        ${labs}
        <div class="ct-lab ring-lab fade" style="left:${cx}px;top:${cy - (rr0 + rr1) / 2}px;font-size:22px;letter-spacing:.3em">${ctx.t('risk')}</div>
        <div class="ct-lab ring-lab fade" style="left:${cx}px;top:${cy + (rr0 + rr1) / 2}px;font-size:22px;letter-spacing:.3em">${ctx.t('risk')}</div>
        <div class="ct-med ct-sport" data-sport="1" style="left:1110px;top:250px;width:400px;height:400px" title="Click to switch the picture">${swingArt(i)}</div>`;
      ctx.on(ctx.$$('[data-k="save"]'), 'click', () => (ctx.step === 0 ? ctx.next() : ctx.prev()));
      ctx.on(ctx.$('[data-sport]'), 'click', () => { const v = (sport() + 1) % 2; setSport(v); ctx.$('[data-sport]').innerHTML = swingArt(v); });
    },
    step(ctx, n) { ctx.show('.ct-ring', n === 1); ctx.show('.ring-lab', n === 1); }
  });

  /* ---------- 9. the club versus the swing ---------- */
  EFA.screen('ct9', {
    title: 'Products versus process',
    copy: {
      titleGolf: 'Club vs. Swing', titleBat: 'Bat vs. Swing', sub: 'Products vs. Process', capProduct: 'Product', capProcess: 'Process',
      _notes: 'A new set of clubs will not fix a golf swing. Products are the clubs; the process is the swing. Most people keep buying clubs.\n\n- Ask: When something has not worked financially, did you change the product or the process?\nPAUSE\n\n- The process is what we build together. Products come last, and only where they serve the plan.'
    },
    render(ctx) {
      const i = sport();
      ctx.el.innerHTML = `
        <div class="ct-head" style="top:46px;gap:10px"><h1 class="st-h1 ttl">${ctx.t(i === 1 ? 'titleBat' : 'titleGolf')}</h1><span class="st-eyebrow">${ctx.t('sub')}</span></div>
        <div class="ct-med ct-sport" data-sport="1" style="left:150px;top:300px;width:360px;height:360px">${gearArt(i)}</div>
        <div class="ct-cap" style="left:330px;top:690px">${ctx.t('capProduct')}</div>
        <div class="ct-arch" style="left:620px;top:250px;width:360px;height:540px">${A.ill.bank()}</div>
        <div class="ct-med ct-sport" data-sport="1" style="left:1090px;top:300px;width:360px;height:360px">${swingArt(i)}</div>
        <div class="ct-cap" style="left:1270px;top:690px">${ctx.t('capProcess')}</div>`;
      ctx.on(ctx.$$('[data-sport]'), 'click', () => { setSport((sport() + 1) % 2); EFA.player.renderScreen({ noFade: true }); });
    }
  });

  /* ---------- 10. shrink the transfers, grow the circle ---------- */
  EFA.screen('ct10', {
    title: 'Shrink transfers, grow the circle',
    steps: 3,
    copy: {
      circle: 'Your Circle\nof Wealth', circleBiz: 'Your\nBusiness', opp: 'Opportunity\nCost', tax: 'Taxes', int: 'Interest\non Debt',
      _notes: 'When transfers shrink, the circle grows, without asking you to save another dollar or give up anything you enjoy today.\n\n- First click: the circle grows as transfers are recaptured.\n- Second click: the recaptured dollars come home and the circle is whole again, and larger.\nPAUSE\n\n- Ask: If we could recapture money you are already spending, would an hour of your time be worth it to look?'
    },
    render(ctx) {
      const cx = 720, cy = 450, r = 280;
      const sl = [{ k: 'opp', a0: 0, a1: 60, f: 'url(#t10a)' }, { k: 'tax', a0: 60, a1: 120, f: 'url(#ctG)' }, { k: 'int', a0: 120, a1: 180, f: 'url(#t10b)' }];
      const out = (mid, d) => [d * Math.sin(mid * Math.PI / 180), -d * Math.cos(mid * Math.PI / 180)];
      ctx._ct10 = { cx, cy, r, sl };
      ctx.el.innerHTML = `<svg class="ct-full" viewBox="0 0 1600 900"><defs>${goldGrad('ctG')}<linearGradient id="t10a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.goldPale}"/><stop offset="1" stop-color="${P.goldLt}"/></linearGradient><linearGradient id="t10b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.gold}"/><stop offset="1" stop-color="${P.goldDeep}"/></linearGradient>${navyGrad('t10n', P.navy3, P.navy)}</defs>
          <g class="ct10-g" data-g="circle"><path d="${A.wedge(cx, cy, r, 180.5, 359.5)}" fill="url(#t10n)"/></g>
          ${sl.map((s) => { const mid = (s.a0 + s.a1) / 2; const [dx, dy] = out(mid, 36); return `<g class="ct10-g" data-g="${s.k}" data-dx="${dx}" data-dy="${dy}"><path d="${A.wedge(cx, cy, r, s.a0 + 0.6, s.a1 - 0.6)}" fill="${s.f}"/></g>`; }).join('')}
        </svg>
        <div class="ct-lab" data-l="circle" style="left:${cx - r * 0.5}px;top:${cy}px;font-size:30px">${ctx.t(ctx.variant === 'business' ? 'circleBiz' : 'circle')}</div>
        ${sl.map((s) => `<div class="ct-lab dark sm" data-l="${s.k}" style="font-size:21px">${ctx.t(s.k)}</div>`).join('')}`;
    },
    step(ctx, n) {
      const { cx, cy, r, sl } = ctx._ct10;
      const S = n >= 1 ? 1.18 : 1;
      const g = (k) => ctx.$(`[data-g="${k}"]`);
      g('circle').style.transform = `scale(${S})`;
      ctx.$('[data-l="circle"]').style.left = `${cx - r * 0.5 * S}px`;
      sl.forEach((s, i) => {
        const el = g(s.k), dx = +el.dataset.dx, dy = +el.dataset.dy;
        const k = n === 2 ? 0 : (n === 1 ? 1.7 : 1);
        const sc = n === 2 ? S : 1;
        el.style.transitionDelay = n === 2 ? `${[0, 0.45, 0.8][i]}s` : '0s';
        el.style.transform = `translate(${dx * k}px, ${dy * k}px) scale(${sc})`;
        const mid = (s.a0 + s.a1) / 2;
        const [lx, ly] = A.pt(cx + dx * k, cy + dy * k, r * 0.66 * sc, mid);
        const lab = ctx.$(`[data-l="${s.k}"]`);
        lab.style.transitionDelay = el.style.transitionDelay;
        lab.style.left = lx + 'px'; lab.style.top = ly + 'px';
      });
    }
  });

  /* ---------- 11. three kinds of money, transferred in focus ---------- */
  EFA.screen('ct11', {
    title: 'Three kinds of money: transferred',
    copy: {
      acc: 'Accumulated\nMoney', life: 'Lifestyle\nMoney', xfer: 'Transferred\nMoney',
      _notes: 'Of the three kinds of money, transferred money is where we start, because plugging those leaks enlarges the circle by definition.\n\n- Ask: Would you rather find new money to save, or keep more of the money you already have?\nPAUSE\n\n- Click Transferred Money to open Savings Efficiency when it fits.'
    },
    render(ctx) {
      ctx.el.innerHTML = moneyScreen(ctx, 'xfer');
      ctx.on(ctx.$$('[data-k="xfer"]'), 'click', () => ctx.jump('SAVEEFF', 'saveEff1'));
    }
  });

  /* ---------- 12. the leaking bucket ---------- */
  EFA.screen('ct12', {
    title: 'Plug the leaks first',
    steps: 2,
    copy: {
      debt: 'Debt', tax: 'Taxes', opp: 'Opportunity Costs', int: 'Interest',
      lead: 'Our first step is to look for places your money can work more efficiently, without asking you to give up the lifestyle you enjoy today.',
      q: 'On a scale of 1 to 10, how well does this way of working fit what you are looking for?',
      _notes: 'Pouring more water into a leaking bucket is how most people try to save. We plug the holes first.\n\n- Click to show the repaired bucket and the close.\nPAUSE after the scale question. Let the client answer fully.\n\n- Anything below a 7: ask what would make it a 10.'
    },
    render(ctx) {
      const lab = (k, x, y, extra) => `<div class="ct-lab dark leak-lab fade" style="left:${x}px;top:${y}px;font-size:23px;${extra || ''}">${ctx.t(k)}</div>`;
      ctx.el.innerHTML = `
        <div class="ct-bucket b-leak fade" style="left:250px;top:120px;width:760px">${A.ill.bucket({ state: 'leak', w: 760 })}</div>
        <div class="ct-bucket b-fix fade" style="left:250px;top:120px;width:760px">${A.ill.bucket({ state: 'fixed', w: 760 })}</div>
        ${lab('debt', 330, 668)}${lab('opp', 530, 720)}${lab('int', 850, 690)}${lab('tax', 920, 612)}
        <div class="ct-close st-card fade"><p class="lead">${ctx.t('lead')}</p><hr class="st-rule"><p class="q">${ctx.t('q')}</p></div>`;
    },
    step(ctx, n) {
      ctx.show('.b-leak', n === 0); ctx.show('.leak-lab', n === 0);
      ctx.show('.b-fix', n === 1);
      ctx.show('.ct-close', n === 1);
      ctx.$('.ct-close').classList.toggle('is-off', n !== 1);
    }
  });
  // Apply the presentation's visual layer after its original render; all financial
  // geometry, wording, steps and branch destinations above stay authoritative.
  for (let i = 1; i <= 12; i++) {
    const def = EFA.screens['ct' + i];
    const original = def.render;
    def.render = function (ctx) {
      original(ctx);
      if (EFA.ctDesign) EFA.ctDesign.apply(ctx);
    };
  }
})();
