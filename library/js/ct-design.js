/* Circle Talk visual direction. Supporting artwork only; the original Circle of Wealth
   emblem, financial diagrams, copy, reveal steps and destinations remain in circle-talk.js.
   Scoped to CT so the retiree and business-owner editions retain their current design. */
(function () {
  'use strict';
  const EFA = window.EFA = window.EFA || {};
  let serial = 0;
  const navy = '#0d1e3a', ink = '#203b60', gold = '#b8972e', pale = '#e9ddb8';

  function drawing(label, body, viewBox) {
    const id = 'ctd-' + (++serial);
    const out = `<svg viewBox="${viewBox || '0 0 600 500'}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ID-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f0e4ba"/><stop offset=".3" stop-color="#c8ad60"/><stop offset=".64" stop-color="#a88a36"/><stop offset="1" stop-color="#e2cd8a"/></linearGradient>
        <linearGradient id="ID-blue" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#34547a"/><stop offset=".42" stop-color="#1b3454"/><stop offset="1" stop-color="#091b32"/></linearGradient>
        <linearGradient id="ID-stone" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="#fffdf8"/><stop offset=".55" stop-color="#e9e5dc"/><stop offset="1" stop-color="#c4c2bb"/></linearGradient>
        <linearGradient id="ID-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b4c7d7"/><stop offset=".55" stop-color="#526e8c"/><stop offset="1" stop-color="#203b60"/></linearGradient>
        <radialGradient id="ID-shadow"><stop stop-color="#0d1e3a" stop-opacity=".20"/><stop offset="1" stop-color="#0d1e3a" stop-opacity="0"/></radialGradient>
        <pattern id="ID-grain" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0h1M3 3h1" stroke="#fff" stroke-opacity=".12" stroke-width=".6"/></pattern>
      </defs>${body}
    </svg>`;
    return out.replace(/ID-/g, id + '-');
  }
  const ground = (y, rx) => `<ellipse cx="300" cy="${y}" rx="${rx || 240}" ry="26" fill="url(#ID-shadow)"/>`;

  const art = {
    bank() {
      const columns = [143, 218, 293, 368].map(x => `<g><path d="M${x} 204h40v159h-40z" fill="url(#ID-stone)"/>
        <path d="M${x + 31} 204h9v159h-9z" fill="#aeb2b4" opacity=".5"/>
        <path d="M${x + 9} 217v133m8-133v133m8-133v133" stroke="#b1b8bc" stroke-width="1.8"/>
        <path d="M${x - 6} 195h52v13h-52zM${x - 6} 358h52v14h-52z" fill="url(#ID-stone)" stroke="#b7b8b2" stroke-width="1"/>
        <path d="M${x - 6} 195h52" stroke="#fffdf8" stroke-width="3"/></g>`).join('');
      return drawing('Architectural illustration of a bank', `${ground(438, 250)}
        <path d="M105 182 300 77 505 177l-28 17-177-88-174 92z" fill="url(#ID-metal)"/>
        <path d="M111 182 300 87l190 95z" fill="url(#ID-blue)"/>
        <path d="M144 173 300 101l156 72z" fill="none" stroke="#d5bd68" stroke-width="2"/>
        <circle cx="300" cy="148" r="22" fill="none" stroke="#cfb66d" stroke-width="2"/>
        <path d="M300 133v30m9-23c-14-8-22 5-9 9s5 17-9 8" fill="none" stroke="#d5bd68" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M111 182h379v17H111z" fill="url(#ID-metal)"/><path d="M122 199h355v178H122z" fill="#11253d"/>
        <path d="M161 210h274v145H161z" fill="#1c3551"/>
        <path d="M265 265q20-24 40 0v91h-40z" fill="#091a2c" stroke="#b8972e" stroke-width="2"/>
        ${columns}
        <path d="M115 375h372v15H115z" fill="url(#ID-stone)"/><path d="M98 390h406v17H98z" fill="url(#ID-blue)"/>
        <path d="M79 407h444v18H79z" fill="url(#ID-stone)"/><path d="M66 425h470v9H66z" fill="#203b60"/>
        <path d="M79 407h444M98 390h406" stroke="#d6c8a3" stroke-width="2"/>
        <path d="M111 182h379v17H111z" fill="url(#ID-grain)"/>`);
    },
    house() {
      return drawing('Architectural illustration of a home', `${ground(431, 242)}
        <path d="m104 245 215-119 178 110-215 128z" fill="#dcd9d0"/>
        <path d="m125 239 157-104v253L125 335z" fill="url(#ID-stone)"/>
        <path d="m282 135 182 105v99L282 388z" fill="#b9bec0"/>
        <path d="m95 242 187-139 213 122-32 24-180-102-160 114z" fill="url(#ID-blue)"/>
        <path d="m99 241 183-131 206 117" fill="none" stroke="#c1a653" stroke-width="3"/>
        <path d="m178 206 68-44v102l-68 41z" fill="url(#ID-glass)" stroke="#203b60" stroke-width="5"/>
        <path d="m212 184v100m-34-28 68-43" stroke="#e9e5dc" stroke-width="3"/>
        <path d="m317 235 51 28v73l-51 16zm76 44 45-25v63l-45 13z" fill="url(#ID-glass)" stroke="#203b60" stroke-width="4"/>
        <path d="m244 281 38-23v130l-38-14z" fill="url(#ID-metal)"/><circle cx="270" cy="325" r="3" fill="${navy}"/>
        <path d="m251 382 39 11-35 25-42-13z" fill="#e1ded5"/><path d="m215 405 40 13v8l-40-13z" fill="#b4b8b9"/>
        <path d="m405 204 20 10v-58l-20-11z" fill="${navy}"/><path d="m393 150 22-12 22 13-22 12z" fill="#42607d"/>
        <path d="m147 341 67 24" stroke="#aeb1ad" stroke-width="2"/>`);
    },
    cards() {
      return drawing('Two payment cards with a metallic finish', `${ground(422, 230)}
        <g transform="rotate(-11 290 235)"><rect x="102" y="99" width="376" height="239" rx="19" fill="url(#ID-blue)"/>
          <rect x="102" y="146" width="376" height="36" fill="#071325"/><path d="M137 205h305" stroke="#c3cbd4" stroke-width="24"/>
          <path d="M137 248h107" stroke="#8597ad" stroke-width="6"/></g>
        <g transform="rotate(7 310 285)"><rect x="120" y="181" width="376" height="239" rx="19" fill="#7f692c"/>
          <rect x="118" y="176" width="376" height="239" rx="19" fill="url(#ID-metal)"/>
          <rect x="118" y="176" width="376" height="239" rx="19" fill="url(#ID-grain)"/>
          <rect x="120" y="178" width="372" height="235" rx="17" fill="none" stroke="#f4e7bd" stroke-opacity=".6"/>
          <rect x="153" y="225" width="59" height="44" rx="7" fill="#e8d69a" stroke="#8b712f" stroke-width="1.5"/>
          <path d="M153 239h59m-59 15h59m-39-29v44m20-44v44" stroke="#987d35" stroke-width="1.2"/>
          <path d="M235 233q12 14 0 28m8-34q18 21 0 41m8-48q25 28 0 55" fill="none" stroke="#705c2c" stroke-width="2"/>
          <g fill="#24354c">${Array.from({length:16},(_,i)=>`<rect x="${156 + i*18 + Math.floor(i/4)*7}" y="319" width="8" height="8" rx="4"/>`).join('')}</g>
          <path d="M155 365h132m-132 13h83" stroke="#6d5a2b" stroke-width="4" stroke-linecap="round"/>
          <circle cx="431" cy="368" r="17" fill="${navy}"/><circle cx="452" cy="368" r="17" fill="#f2e4b7" fill-opacity=".7"/>
        </g>`);
    },
    taxes() {
      return drawing('Tax document, pen and brass reading lens', `${ground(441, 228)}
        <g transform="rotate(-7 293 245)"><path d="M146 66h231l53 54v295H146z" fill="#d4d2c9"/>
          <path d="M139 59h231l53 54v295H139z" fill="url(#ID-stone)" stroke="#d3cfc3" stroke-width="1.5"/>
          <path d="M370 59v54h53" fill="#c1c5c5"/><path d="M177 118h128" stroke="${navy}" stroke-width="10"/>
          <path d="M177 143h82" stroke="#b8972e" stroke-width="3"/>
          ${[185,212,239,266,293,320,347].map((y,i)=>`<path d="M177 ${y}h${i%2?157:204}" stroke="#aab5bf" stroke-width="4"/>`).join('')}
          <path d="M177 376h104" stroke="#1b3454" stroke-width="2"/></g>
        <g transform="rotate(-37 387 332)"><path d="M387 336v126" stroke="#1b3454" stroke-width="17" stroke-linecap="round"/>
          <path d="M387 348v55" stroke="#4d6581" stroke-width="4"/><circle cx="387" cy="278" r="64" fill="#e9eff0" fill-opacity=".35" stroke="#866c2b" stroke-width="13"/>
          <circle cx="387" cy="276" r="64" fill="none" stroke="url(#ID-metal)" stroke-width="8"/>
          <path d="M348 265a42 42 0 0 1 47-32" stroke="#fffdf8" stroke-width="4" fill="none"/></g>
        <path d="m137 352 84-178 11 5-84 178-13 12z" fill="url(#ID-blue)"/><path d="m137 352 11 5-13 12z" fill="${gold}"/>`);
    },
    car() {
      return drawing('Detailed side profile of a car', `${ground(380, 252)}
        <path d="M69 304q12-40 62-50l74-73q15-15 46-15h99q29 0 49 23l65 68q43 5 65 33l9 46q1 14-18 16H83q-18 0-18-18z" fill="url(#ID-blue)"/>
        <path d="m162 252 63-66h49v66zm126-66h62q16 0 28 14l48 52H288z" fill="url(#ID-glass)" stroke="#a6b5c3" stroke-width="2"/>
        <path d="m164 257 270-1M92 285q157-13 370-8" stroke="#8b9bad" stroke-width="2" fill="none"/>
        <path d="M252 266v75m115-76 16 70" stroke="#08182d" stroke-width="2"/>
        <path d="M93 325h411" stroke="#bf9f45" stroke-width="3"/>
        <path d="M76 300h29m382-7h31" stroke="#e3d5aa" stroke-width="8" stroke-linecap="round"/>
        <path d="M315 279h25" stroke="#c9cdd0" stroke-width="3" stroke-linecap="round"/>
        ${[159,438].map(x=>`<circle cx="${x}" cy="344" r="43" fill="#081629"/><circle cx="${x}" cy="344" r="30" fill="url(#ID-stone)"/><circle cx="${x}" cy="344" r="23" fill="#26394e"/>
          ${Array.from({length:8},(_,i)=>`<path d="M${x} 322v44" stroke="#c3c8ca" stroke-width="3" transform="rotate(${i*22.5} ${x} 344)"/>`).join('')}<circle cx="${x}" cy="344" r="7" fill="url(#ID-metal)"/>`).join('')}`);
    },
    gear(baseball) {
      if (baseball) return drawing('Baseball equipment', `${ground(445,208)}
        <g transform="rotate(25 300 270)"><path d="M260 91q0-42 26-45t29 45l-13 231-4 101q-5 18-18 1l-4-99z" fill="url(#ID-metal)"/>
        <path d="M276 326h27m-27 8h26m-25 8h25m-25 8h24m-24 8h24m-24 8h23m-22 8h21m-20 8h19" stroke="#695831" stroke-width="4"/></g>
        <circle cx="388" cy="394" r="49" fill="url(#ID-stone)" stroke="#babbb6" stroke-width="1"/>
        <path d="M356 357q52 17 35 83m21-78q-47 18-37 74" fill="none" stroke="#a68438" stroke-width="2" stroke-dasharray="3 4"/>`);
      return drawing('A bag of golf clubs with detailed metal heads', `${ground(454,210)}
        <g stroke="#7d8b97" stroke-width="6"><path d="m249 280-45-198m74 189-5-205m20 204 45-186m-83 211-89-160m125 159 96-168"/></g>
        <g fill="url(#ID-stone)" stroke="#607487" stroke-width="2"><path d="m180 63 36-8 20 28-7 17-47-5z"/><path d="M253 44h39l6 33-17 14-37-16z"/>
        <path d="m331 64 34 14-3 34-18 8-29-28z"/><path d="m140 113 31-17 31 26-5 18-44 9z"/><path d="m384 112 36 16-8 35-18 7-26-28z"/></g>
        <path d="m190 250 129-14 45 191q-68 40-149 4z" fill="url(#ID-blue)" stroke="#152b45" stroke-width="3"/>
        <path d="m204 260 95-11 33 170q-42 16-102 8z" fill="none" stroke="#bc9c4a" stroke-width="3"/>
        <path d="m221 298 67-4 20 85-75 7z" fill="#284361" stroke="#4c6480" stroke-width="2"/>
        <path d="M309 272q86 20 56 137" fill="none" stroke="#233c56" stroke-width="17"/>
        <path d="m232 334 58-3" stroke="#bca45e" stroke-width="2"/>
        <path d="m200 252 122-14" stroke="#e4d09a" stroke-width="6"/>`);
    },
    swing(baseball) {
      const bat = baseball ? `<path d="m268 168 128-96" stroke="#b8972e" stroke-width="13" stroke-linecap="round"/><path d="m391 75 48-37" stroke="#d2ba74" stroke-width="23" stroke-linecap="round"/>` : `<path d="m259 163 113-113" stroke="#697f96" stroke-width="5"/><path d="m368 52 30-13 13 13-31 16z" fill="url(#ID-metal)"/>`;
      return drawing(baseball ? 'Baseball player following through on a swing' : 'Golfer following through on a swing', `${ground(453,195)}
        <path d="M128 353q-57-166 91-255M113 318q-21-116 65-178" fill="none" stroke="#d8c48c" stroke-width="2"/>
        <path d="M414 162q51 112-10 216" fill="none" stroke="#c4cbd0" stroke-width="1.5"/>
        ${bat}
        <path d="m280 269-39 66-64 84 34 14 74-83 37-54z" fill="url(#ID-blue)"/>
        <path d="m306 280 31 63 17 93h32l-8-104-30-82z" fill="#172f4c"/>
        <path d="m208 421-39-7-22 21q-6 7 4 9h57l8-12zm148 10-5 17q-1 10 10 10h58q10-2 1-8l-35-20z" fill="#0c1d32"/>
        <path d="m278 174-34 39 24 61 69 12 28-47-32-58z" fill="url(#ID-stone)" stroke="#bbc0bf" stroke-width="1.4"/>
        <path d="m268 209 39 29 38-42 13-23-15-12-39 40-28-24z" fill="#c5af89"/>
        <path d="m273 182-30-14 20-32 20 4-11 22 31 14z" fill="#d0b994"/>
        <path d="m243 166 17-19 18 14-12 25z" fill="#f7f4eb" stroke="#bbc0bf" stroke-width="1"/>
        <path d="m281 179 11-17 20 4-1 23z" fill="#bca47f"/>
        <ellipse cx="306" cy="141" rx="23" ry="29" fill="#c9b28e" transform="rotate(19 306 141)"/>
        <path d="M281 133q1-31 27-27 27 2 30 32l-16-8-41 4z" fill="${navy}"/>
        <path d="m319 128 31 16-35-1z" fill="#26405f"/>
        <path d="m281 250 54 19M293 278l-34 55-42 61m114-97 21 41 13 73" stroke="#60758b" stroke-width="2" fill="none"/>
        <path d="m274 268 63 12" stroke="#a48a48" stroke-width="4"/>
        ${baseball ? '' : '<circle cx="441" cy="423" r="6" fill="#fffdf8" stroke="#a4adb3" stroke-width="1.5"/>'}`);
    },
    bucket(fixed) {
      const drops = fixed ? '' : `<g fill="#7298ba"><path d="M170 344q-25 34-4 44 22 8 4-44zm56 47q-21 30-3 39 20 8 3-39zm168-44q-19 30-1 38 19 6 1-38z"/>
        <path d="M174 321q-42 30-52 87m116-58q-5 40-34 91m173-111q42 28 54 76" fill="none" stroke="#8daec7" stroke-width="5" stroke-linecap="round"/></g>`;
      return drawing(fixed ? 'A repaired bucket holding water' : 'A bucket losing water through several holes', `${ground(450,234)}
        <path d="M172 177q-12-128 128-128t128 128" fill="none" stroke="#263e58" stroke-width="12"/>
        <path d="M176 175q-7-120 124-120t124 120" fill="none" stroke="#9aa7af" stroke-width="3"/>
        <path d="m137 173 38 229q125 69 250 0l38-229z" fill="url(#ID-blue)"/>
        <path d="m149 179 36 213q115 61 230 0l36-213" fill="none" stroke="#6f8293" stroke-opacity=".4" stroke-width="2"/>
        <path d="m167 212 27 172q29 22 54 22l-9-176z" fill="#4e6c86" fill-opacity=".4"/>
        <ellipse cx="300" cy="173" rx="163" ry="51" fill="url(#ID-stone)" stroke="#93a0aa" stroke-width="2"/>
        <ellipse cx="300" cy="177" rx="149" ry="39" fill="#172f4a"/>
        <ellipse cx="300" cy="185" rx="142" ry="28" fill="#8aaec7"/><path d="M191 184q92-29 205-1" fill="none" stroke="#d5e2e8" stroke-width="3"/>
        <path d="M184 393q115 57 231 0" fill="none" stroke="#c5ac66" stroke-width="3"/>
        <circle cx="169" cy="320" r="${fixed?13:8}" fill="${fixed?'url(#ID-metal)':'#071528'}"/><circle cx="238" cy="350" r="${fixed?13:8}" fill="${fixed?'url(#ID-metal)':'#071528'}"/>
        <circle cx="378" cy="331" r="${fixed?13:8}" fill="${fixed?'url(#ID-metal)':'#071528'}"/>
        ${drops}`);
    }
  };

  const chapters = ['The whole picture', 'Money in motion', 'Three kinds of money', 'Wealth transfers', 'The transfer map', 'Who has control?', 'Learn the rules', 'The savings slice', 'Products & process', 'A larger circle', 'Transferred money', 'Start with efficiency'];
  const styles = `
    .ct-editorial { background: radial-gradient(ellipse at 52% 45%,#fffdf9 0%,#f7f5f1 68%); }
    .ct-editorial::before { content:"";position:absolute;inset:26px;border:1px solid rgba(13,30,58,.085);pointer-events:none; }
    .ct-ed-top { position:absolute;left:80px;right:80px;top:52px;display:flex;align-items:center;gap:20px;pointer-events:none;color:#57687b;font:600 13px/1 "DM Sans",sans-serif;letter-spacing:.18em;text-transform:uppercase; }
    .ct-ed-top b { color:#8a6e22;font-weight:700; }.ct-ed-top i { height:1px;flex:1;background:#d9d7ce; }.ct-ed-top span { color:#667389; }
    .ct-ed-foot { position:absolute;left:80px;bottom:39px;display:flex;align-items:center;gap:16px;color:#607086;font:500 13px/1 "DM Sans",sans-serif;letter-spacing:.14em;pointer-events:none; }
    .ct-ed-foot i { width:100px;height:2px;background:#ddd8cb; }.ct-ed-foot i::after { content:"";display:block;width:var(--ct-progress);height:2px;background:#b8972e; }
    .ct-editorial .ct-head { top:115px!important;gap:16px!important; }.ct-editorial .ct-head .st-h1 { font-size:65px;font-weight:500;line-height:1.03;letter-spacing:-.025em; }.ct-editorial .ct-head .st-rule { width:56px;height:2px; }
    .ct-editorial .ct-med,.ct-editorial .ct-arch { background:linear-gradient(145deg,#fffdf8,#eeeae1);border:1px solid #ded8ca;box-shadow:0 16px 35px #0d1e3a0a; }
    .ct-editorial .ct-med { border-radius:12px; }.ct-editorial .ct-arch { border-radius:160px 160px 12px 12px; }
    .ct-editorial .ct-med svg { width:94%;height:86%; }.ct-editorial .ct-arch svg { width:100%;height:90%; }
    .ct-editorial .ct-asset-name { position:absolute;left:24px;bottom:17px;color:#647080;font:600 12px/1 "DM Sans",sans-serif;letter-spacing:.17em;text-transform:uppercase; }
    .ct-editorial[data-screen="ct6"] .ct-head { left:80px;right:80px;justify-items:start;text-align:left;top:112px!important;padding:0; }.ct-editorial[data-screen="ct6"] .ct-head .st-h1 { max-width:1200px;font-size:67px; }.ct-editorial[data-screen="ct6"] .ct-head .st-rule { margin:0; }
    .ct-editorial[data-screen="ct6"] .ct-med { width:330px!important;height:246px!important;left:120px!important;top:254px!important; }
    .ct-editorial[data-screen="ct6"] .ct-arch { left:505px!important;top:254px!important;width:590px!important;height:516px!important;background:linear-gradient(135deg,#eae5d8,#fffdf8 48%,#e5e1d6); }
    .ct-editorial[data-screen="ct6"] .ct-med svg { height:94%;width:92%;margin-bottom:20px; }.ct-editorial[data-screen="ct6"] .ct-arch svg { margin-top:10px; }
    .ct-editorial[data-screen="ct5"] .ct-head { top:112px!important; }.ct-editorial[data-screen="ct5"] .ct-cols { top:258px;left:80px;right:80px;gap:30px; }.ct-editorial[data-screen="ct5"] .ct-col { gap:24px; }
    .ct-editorial[data-screen="ct5"] .ct-grp { background:#fffdf9;border:1px solid #ddd7c9;border-radius:8px;padding:18px 20px;gap:3px; }
    .ct-editorial[data-screen="ct5"] .ct-grp h3 { border:0;font-size:13px;letter-spacing:.15em;color:#8a6e22;padding:0 0 10px;margin:0; }
    .ct-editorial[data-screen="ct5"] .ct-grp .st-pill { background:transparent;border:0;border-top:1px solid #eae6dc;box-shadow:none;border-radius:0;color:#203b60;min-height:38px;padding:7px 0;font-size:19px;font-weight:400; }
    .ct-editorial[data-screen="ct5"] .ct-ed-arrow { margin-left:auto;color:#9b813b;font-size:19px; }.ct-editorial[data-screen="ct5"] button.st-pill:hover { color:#8a6e22;background:#f7f4ec; }.ct-editorial[data-screen="ct5"] .ct-grp .is-static { opacity:.72; }
    .ct-editorial[data-screen="ct7"] .ct-full>g:first-child { stroke-width:4;stroke:#778695;opacity:.55; }
    .ct-editorial[data-screen="ct8"] .ct-sport { left:1080px!important;top:216px!important;width:430px!important;height:482px!important; }
    .ct-editorial .ct-sport { box-shadow:0 16px 38px #0d1e3a0a; }.ct-editorial .ct-sport:hover { transform:translateY(-3px);box-shadow:0 20px 42px #0d1e3a16; }
    .ct-ed-switch { position:absolute;left:20px;bottom:17px;color:#8a6e22;font:600 11px/1 "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;display:flex;gap:8px;align-items:center;pointer-events:none; }.ct-ed-switch::before { content:"↔";font-size:20px; }
    .ct-editorial[data-screen="ct9"] .ct-sport { top:274px!important;width:410px!important;height:425px!important;left:100px!important; }.ct-editorial[data-screen="ct9"] .ct-arch { top:274px!important;left:570px!important;width:460px!important;height:425px!important; }
    .ct-editorial[data-screen="ct9"] .ct-cap { top:732px!important;font-size:14px;letter-spacing:.18em; }
    .ct-editorial[data-screen="ct12"] .ct-bucket { left:65px!important;top:176px!important;width:810px!important; }.ct-editorial[data-screen="ct12"] .ct-close { left:900px;right:auto;top:230px;width:530px;padding:48px;background:#fffdf9;border:1px solid #ddd7c9;border-left:3px solid #b8972e;box-shadow:0 16px 42px #0d1e3a08;border-radius:6px;gap:30px; }
    .ct-editorial[data-screen="ct12"] .ct-close .lead { font-size:26px;line-height:1.5;color:#4e5e71; }.ct-editorial[data-screen="ct12"] .ct-close .q { font-size:39px;font-weight:500;line-height:1.18; }.ct-editorial[data-screen="ct12"] .leak-lab { width:420px;text-align:left;padding:16px 0 16px 26px;border-left:2px solid #b8972e;font-size:25px!important;letter-spacing:.12em;color:#203b60; }
    @media(prefers-reduced-motion:reduce) { .ct-editorial * { transition:none!important;animation:none!important; } }
  `;

  function apply(ctx) {
    if (ctx.pres !== 'CT') return;
    EFA.css('ct-editorial', styles);
    const n = Number(ctx.id.replace('ct', ''));
    ctx.el.classList.add('ct-editorial');
    ctx.el.insertAdjacentHTML('beforeend', `<div class="ct-ed-top" aria-hidden="true"><b>Circle Talk</b><i></i><span>${chapters[n - 1]}</span></div><div class="ct-ed-foot" aria-hidden="true"><span>${String(n).padStart(2,'0')} / 12</span><i style="--ct-progress:${n/12*100}%"></i></div>`);

    if (ctx.id === 'ct5') {
      ctx.$$('button.st-pill').forEach(el=>el.insertAdjacentHTML('beforeend','<span class="ct-ed-arrow" aria-hidden="true">↗</span>'));
    }

    if (ctx.id === 'ct6') {
      const med = ctx.$$('.ct-med');
      const items = [[art.house,'Home'],[art.cards,'Credit'],[art.taxes,'Taxes'],[art.car,'Car']];
      med.forEach((el,i)=>{el.classList.add('ct-control-'+i);el.innerHTML=items[i][0]()+`<span class="ct-asset-name">${items[i][1]}</span>`;});
      const bank = ctx.$('.ct-arch');bank.innerHTML=art.bank()+'<span class="ct-asset-name">Bank</span>';
      // Explicit positions avoid coupling the layout to the number of decorative siblings.
      med.forEach((el,i)=>{el.style.setProperty('left',i<2?'120px':'1150px','important');el.style.setProperty('top',i%2?'524px':'254px','important');});
    }
    if (ctx.id === 'ct8' || ctx.id === 'ct9') {
      const refresh = () => {
        const baseball = EFA.clients.get('circle-talk','sport',0) === 1;
        ctx.$$('.ct-sport').forEach((el,i)=>{
          el.innerHTML=(ctx.id==='ct9'&&i===0?art.gear(baseball):art.swing(baseball))+'<span class="ct-ed-switch">Golf / baseball</span>';
          el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label','Switch between golf and baseball');
          el.title='Switch between golf and baseball';
        });
      };
      refresh();
      ctx.$$('.ct-sport').forEach(el=>{ctx.on(el,'click',refresh);ctx.on(el,'keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();el.click();}});});
      if(ctx.id==='ct9') {
        ctx.$('.ct-arch').innerHTML=art.bank();
        const panels=ctx.$$('.ct-sport');panels[0].style.setProperty('left','100px','important');panels[1].style.setProperty('left','1090px','important');
        const captions=ctx.$$('.ct-cap');captions[0].style.setProperty('left','305px','important');captions[1].style.setProperty('left','1295px','important');
      }
    }
    if (ctx.id === 'ct12') {
      ctx.$('.b-leak').innerHTML=art.bucket(false);ctx.$('.b-fix').innerHTML=art.bucket(true);
      const places=[[1160,300],[1160,420],[1160,540],[1160,660]];
      ctx.$$('.leak-lab').forEach((el,i)=>{el.style.left=places[i][0]+'px';el.style.top=places[i][1]+'px';});
    }
  }
  EFA.ctDesign = { apply };
})();
