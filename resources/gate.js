/* Edwards Financial & Associates — Resource Access Gate
   Add to any tool page with a script tag in <head> pointing to /resources/gate.js
   Email can be anything; the password is case-sensitive. Unlocks all tools for the browser session. */
(function () {
  'use strict';
  var KEY = 'efa_gate_ok';
  var PW_B64 = 'QnJ1aW4kMTk4NQ=='; // case-sensitive
  try { if (sessionStorage.getItem(KEY) === '1') return; } catch (e) { return; }

  // hide the page until unlocked (script runs in <head>, before first paint)
  document.documentElement.style.visibility = 'hidden';

  function build() {
    document.documentElement.style.visibility = '';
    var ov = document.createElement('div');
    ov.id = 'efaGate';
    ov.innerHTML =
      '<style>' +
      '#efaGate{position:fixed;inset:0;z-index:2147483647;background:#f7f5f1;display:flex;align-items:center;justify-content:center;padding:20px;}' +
      '#efaGate .gcard{background:#ffffff;border-radius:14px;box-shadow:0 20px 60px rgba(10,31,60,.18);max-width:400px;width:100%;overflow:hidden;border-bottom:4px solid #b8972e;}' +
      '#efaGate .ghead{background:#0d1e3a;padding:22px 28px;text-align:center;}' +
      '#efaGate .ghead .gb{color:#fff;font-family:Georgia,\'Times New Roman\',serif;font-size:1.25rem;font-weight:700;}' +
      '#efaGate .ghead .gb em{color:#d4af5a;font-style:normal;}' +
      '#efaGate .ghead .gs{color:#d4af5a;font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;margin-top:5px;}' +
      '#efaGate .gbody{padding:24px 28px 26px;font-family:Montserrat,Arial,sans-serif;}' +
      '#efaGate .gt{font-size:.92rem;font-weight:700;color:#0d1e3a;margin-bottom:4px;}' +
      '#efaGate .gsub{font-size:.72rem;color:#9a9590;line-height:1.55;margin-bottom:16px;}' +
      '#efaGate label{display:block;font-size:.6rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#9a9590;margin:0 0 5px;}' +
      '#efaGate input{width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid #e0dbd2;border-radius:6px;font-family:Montserrat,Arial,sans-serif;font-size:.86rem;background:#f5f2ec;color:#0d1e3a;margin-bottom:13px;}' +
      '#efaGate input:focus{outline:none;border-color:#b8972e;background:#fff;}' +
      '#efaGate .gbtn{width:100%;padding:12px;background:#b8972e;color:#0d1e3a;border:none;border-radius:7px;border-bottom:3px solid #8a6012;font-family:Montserrat,Arial,sans-serif;font-size:.8rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;}' +
      '#efaGate form{margin:0;}' +
      '#efaGate .gerr{color:#c0392b;font-size:.72rem;font-weight:600;margin-top:10px;text-align:center;min-height:16px;}' +
      '#efaGate .gnote{color:#9a9590;font-size:.62rem;text-align:center;margin-top:12px;line-height:1.5;}' +
      '#efaGate .gcard.shake{animation:efaShake .35s;}' +
      '@keyframes efaShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}' +
      '</style>' +
      '<div class="gcard">' +
      '<div class="ghead"><div class="gb">Edwards Financial <em>&amp; Associates</em></div>' +
      '<div class="gs">Protect &middot; Grow &middot; Legacy</div></div>' +
      '<div class="gbody">' +
      '<div class="gt">Client &amp; Partner Access</div>' +
      '<div class="gsub">These planning tools are provided for clients and partners of Edwards Financial &amp; Associates. Sign in to continue.</div>' +
      '<form id="efaGateForm" method="post" action="#" autocomplete="on">' +
      '<label for="efaGateEmail">Email</label><input type="email" id="efaGateEmail" name="username" placeholder="you@email.com" autocomplete="username email">' +
      '<label for="efaGatePw">Access Password</label><input type="password" id="efaGatePw" name="password" placeholder="Enter access password" autocomplete="current-password">' +
      '<button class="gbtn" id="efaGateGo" type="submit">Unlock Tools</button>' +
      '</form>' +
      '<div class="gerr" id="efaGateErr"></div>' +
      '<div class="gnote">Access is provided by Edwards Financial &amp; Associates.<br>Need the password? Email joshua@edwardsfinancialassociates.com</div>' +
      '</div></div>';
    document.body.appendChild(ov);

    var pw = document.getElementById('efaGatePw');
    var email = document.getElementById('efaGateEmail');
    var form = document.getElementById('efaGateForm');

    function unlock() {
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
      /* Chromium: explicitly ask the password manager to save/update this login */
      try {
        if (window.PasswordCredential && navigator.credentials && navigator.credentials.store) {
          navigator.credentials.store(new PasswordCredential({
            id: email.value || 'client', name: 'EFA Resource Access', password: pw.value
          })).catch(function () {});
        }
      } catch (e) {}
      ov.remove();
    }
    function fail() {
      document.getElementById('efaGateErr').textContent = 'That password is not correct. Passwords are case sensitive.';
      var card = ov.querySelector('.gcard');
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      pw.select();
    }
    /* real form submission is what makes browsers offer to save the login */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = false;
      try { ok = btoa(pw.value) === PW_B64; } catch (er) { ok = false; } // case-sensitive exact match
      ok ? unlock() : fail();
    });

    /* return visits: if a login is saved, ask the browser for it and unlock without typing */
    try {
      if (navigator.credentials && navigator.credentials.get && window.PasswordCredential) {
        navigator.credentials.get({ password: true, mediation: 'optional' }).then(function (cred) {
          if (cred && cred.password && btoa(cred.password) === PW_B64) {
            email.value = cred.id || ''; pw.value = cred.password;
            unlock();
          }
        }).catch(function () {});
      }
    } catch (e) {}
    setTimeout(function () { email.focus(); }, 60);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
