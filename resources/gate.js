/* Edwards Financial & Associates — Resource Access Gate (single sign-on)
   Add to any tool page with a script tag in <head> pointing to /resources/gate.js

   One login for the whole site. The gate uses the same Supabase account and the
   same stored session as the Partner Portal, so:
     - signing in to the Partner Portal unlocks every gated resource page, and
     - signing in here unlocks the Partner Portal,
   on this browser, until that person signs out. Each partner has their own
   email and password; there is no shared site password any more.
   Accounts are managed in Supabase (Authentication → Users). A session is not
   enough on its own: the account must also be an approved partner
   (partner_profiles.approved, checked through crm_is_operator()). */
(function () {
  'use strict';

  var SUPA_URL = 'https://rybnzvlogmbjlgdziswj.supabase.co';
  /* public anon key, the same one every portal page ships; row security does the protecting */
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Ym56dmxvZ21iamxnZHppc3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NjE3MjgsImV4cCI6MjA5NjAzNzcyOH0.m7oH-z4yI1AbchocncJU2TB7SawyijiXsTbcz3slwn0';
  var STORE = 'sb-rybnzvlogmbjlgdziswj-auth-token'; /* where supabase-js keeps the portal session */
  var LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

  var root = document.documentElement;
  var revealed = false;
  var shown = false;

  /* retire the old shared-password unlock flag so it cannot linger in an open tab */
  try { sessionStorage.removeItem('efa_gate_ok'); } catch (e) {}

  /* hide the page until access is confirmed (script runs in <head>, before first paint) */
  root.style.visibility = 'hidden';

  function reveal() {
    if (revealed) return;
    revealed = true;
    var ov = document.getElementById('efaGate');
    if (ov) ov.remove();
    root.style.visibility = '';
  }

  /* one Supabase client for the gate; reuse the library if the page already loaded it */
  var clientP = new Promise(function (resolve, reject) {
    function make() {
      try { resolve(window.supabase.createClient(SUPA_URL, SUPA_KEY)); }
      catch (e) { reject(e); }
    }
    if (window.supabase && window.supabase.createClient) { make(); return; }
    var s = document.createElement('script');
    s.src = LIB;
    s.async = true;
    s.onload = make;
    s.onerror = function () { reject(new Error('library')); };
    (document.head || root).appendChild(s);
  });
  clientP.catch(function () {}); /* failures are handled where the client is used */

  /* An approved partner, not merely a signed-in account. Sign-up is possible on the
     auth service, so a session alone proves nothing; crm_is_operator() is the same
     test row security applies to the CRM tables (approved row in partner_profiles).
     Resolves 'ok', 'none' (no session), 'denied' (signed in, not approved) or 'error'. */
  function partnerCheck(sb) {
    return sb.rpc('crm_is_operator').then(function (r) {
      if (r && !r.error && r.data === true) return 'ok';
      if (r && !r.error && r.data === false) return 'denied';
      return 'error';
    }, function () { return 'error'; });
  }
  function access() {
    return clientP.then(function (sb) {
      return sb.auth.getSession().then(function (r) {
        if (!(r && r.data && r.data.session)) return 'none';
        return partnerCheck(sb);
      });
    }).catch(function () { return 'error'; });
  }
  var NOTE = {
    denied: 'This account is not approved for partner access. Request access below, or sign in with your partner account.',
    error: 'We could not confirm your access. Check your connection and refresh the page.'
  };

  function storedSession() {
    try {
      var raw = localStorage.getItem(STORE);
      return !!(raw && JSON.parse(raw));
    } catch (e) { return false; }
  }

  function whenReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function showGate(note) {
    if (revealed) return;
    if (shown) { setNote(note); return; }
    shown = true;
    whenReady(function () { build(); setNote(note); });
  }
  function setNote(note) {
    var m = document.getElementById('efaGateMsg');
    if (m && note) { m.className = 'gmsg err'; m.textContent = note; }
  }

  function build() {
    if (revealed) return;
    root.style.visibility = '';
    var ov = document.createElement('div');
    ov.id = 'efaGate';
    ov.innerHTML =
      '<style>' +
      '#efaGate{position:fixed;inset:0;z-index:2147483647;background:#f7f5f1;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;}' +
      '#efaGate .gcard{background:#ffffff;border-radius:14px;box-shadow:0 20px 60px rgba(10,31,60,.18);max-width:400px;width:100%;overflow:hidden;border-bottom:4px solid #b8972e;margin:auto;}' +
      '#efaGate .ghead{background:#0d1e3a;padding:22px 28px;text-align:center;}' +
      '#efaGate .ghead .gb{color:#fff;font-family:\'Cormorant Garamond\',Georgia,\'Times New Roman\',serif;font-size:1.35rem;font-weight:600;}' +
      '#efaGate .ghead .gb em{color:#d4af5a;font-style:normal;}' +
      '#efaGate .ghead .gs{color:#d4af5a;font-family:Montserrat,Arial,sans-serif;font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;margin-top:5px;}' +
      '#efaGate .gbody{padding:24px 28px 26px;font-family:Montserrat,Arial,sans-serif;}' +
      '#efaGate .gt{font-size:.92rem;font-weight:700;color:#0d1e3a;margin-bottom:4px;}' +
      '#efaGate .gsub{font-size:.72rem;color:#9a9590;line-height:1.55;margin-bottom:16px;}' +
      '#efaGate label{display:block;font-size:.6rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#9a9590;margin:0 0 5px;}' +
      '#efaGate input{width:100%;box-sizing:border-box;padding:10px 12px;border:1.5px solid #e0dbd2;border-radius:6px;font-family:Montserrat,Arial,sans-serif;font-size:.86rem;background:#f5f2ec;color:#0d1e3a;margin-bottom:13px;}' +
      '#efaGate input:focus{outline:none;border-color:#b8972e;background:#fff;}' +
      '#efaGate .gbtn{width:100%;padding:12px;background:#b8972e;color:#0d1e3a;border:none;border-radius:7px;border-bottom:3px solid #8a6012;font-family:Montserrat,Arial,sans-serif;font-size:.8rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;}' +
      '#efaGate .gbtn[disabled]{opacity:.7;cursor:default;}' +
      '#efaGate form{margin:0;}' +
      '#efaGate .gmsg{font-size:.72rem;font-weight:600;margin-top:10px;text-align:center;min-height:16px;line-height:1.5;}' +
      '#efaGate .gmsg.err{color:#c0392b;}' +
      '#efaGate .gmsg.ok{color:#2e7d4f;}' +
      '#efaGate .glinks{display:flex;justify-content:space-between;gap:10px;margin-top:12px;}' +
      '#efaGate .glinks a,#efaGate .glinks button{background:none;border:none;padding:0;font-family:Montserrat,Arial,sans-serif;font-size:.68rem;font-weight:600;color:#0d1e3a;text-decoration:none;cursor:pointer;}' +
      '#efaGate .glinks a:hover,#efaGate .glinks button:hover{color:#b8972e;}' +
      '#efaGate .gnote{color:#9a9590;font-size:.62rem;text-align:center;margin-top:14px;line-height:1.5;}' +
      '#efaGate .gback{display:block;text-align:center;margin-top:14px;font-family:Montserrat,Arial,sans-serif;font-size:.72rem;font-weight:600;color:#9a9590;text-decoration:none;}' +
      '#efaGate .gback:hover{color:#b8972e;}' +
      '#efaGate a:focus-visible,#efaGate button:focus-visible{outline:2px solid #b8972e;outline-offset:2px;}' +
      '#efaGate .gcard.shake{animation:efaShake .35s;}' +
      '@keyframes efaShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}' +
      '</style>' +
      '<div class="gcard">' +
      '<div class="ghead"><div class="gb">Edwards Financial <em>&amp; Associates</em></div>' +
      '<div class="gs">Protect &middot; Grow &middot; Legacy</div></div>' +
      '<div class="gbody">' +
      '<div class="gt">Partner Sign In</div>' +
      '<div class="gsub">Sign in with your Edwards Financial partner account. One login opens every tool on the site and the Partner Portal.</div>' +
      '<form id="efaGateForm" method="post" action="#" autocomplete="on">' +
      '<label for="efaGateEmail">Email</label><input type="email" id="efaGateEmail" name="username" placeholder="you@email.com" autocomplete="username email" required>' +
      '<label for="efaGatePw">Password</label><input type="password" id="efaGatePw" name="password" placeholder="Your portal password" autocomplete="current-password" required>' +
      '<button class="gbtn" id="efaGateGo" type="submit">Sign In</button>' +
      '</form>' +
      '<div class="gmsg" id="efaGateMsg" role="status" aria-live="polite"></div>' +
      '<div class="glinks"><button type="button" id="efaGateReset">Forgot password?</button>' +
      '<a href="/portal-partner-login" id="efaGateRequest">Request access</a></div>' +
      '<div class="gnote">Questions about access? Email joshua@edwardsfinancialassociates.com</div>' +
      '<a class="gback" href="/" id="efaGateBack">&#8592; Back to the main site</a>' +
      '</div></div>';
    document.body.appendChild(ov);

    /* the locked state must never be a dead end: go back to the page the visitor
       came from when it was one of ours, otherwise to the home page */
    document.getElementById('efaGateBack').addEventListener('click', function (e) {
      if (document.referrer && document.referrer.indexOf(location.origin + '/') === 0 && history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });

    var form = document.getElementById('efaGateForm');
    var email = document.getElementById('efaGateEmail');
    var pw = document.getElementById('efaGatePw');
    var btn = document.getElementById('efaGateGo');
    var msg = document.getElementById('efaGateMsg');

    function remember(em, p) {
      /* Chromium: ask the password manager to save this login (same one the portal uses) */
      try {
        if (window.PasswordCredential && navigator.credentials && navigator.credentials.store) {
          navigator.credentials.store(new PasswordCredential({
            id: em, name: 'Edwards Financial Partner', password: p
          })).catch(function () {});
        }
      } catch (er) {}
    }
    function say(kind, text) { msg.className = 'gmsg ' + kind; msg.textContent = text; }
    function shake() {
      var card = ov.querySelector('.gcard');
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    }
    function busy(on) { btn.disabled = on; btn.textContent = on ? 'Signing in...' : 'Sign In'; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var em = email.value.trim(), p = pw.value;
      if (!em || !p) { say('err', 'Enter your email and password.'); shake(); return; }
      busy(true); say('', '');
      clientP.then(function (sb) {
        return sb.auth.signInWithPassword({ email: em, password: p });
      }).then(function (r) {
        if (r && r.error) {
          busy(false);
          var m = /invalid login/i.test(r.error.message || '')
            ? 'That email and password do not match a partner account. Passwords are case sensitive.'
            : (r.error.message || 'Sign in did not work. Please try again.');
          say('err', m); shake(); pw.select();
          return;
        }
        return clientP.then(partnerCheck).then(function (st) {
          if (st !== 'ok') {
            busy(false);
            if (st === 'denied') {
              clientP.then(function (sb) { sb.auth.signOut(); });
              say('err', NOTE.denied);
            } else {
              say('err', NOTE.error);
            }
            shake();
            return;
          }
          remember(em, p);
          reveal();
        });
      }).catch(function () {
        busy(false);
        say('err', 'Could not reach the sign-in service. Check your connection and try again.');
      });
    });

    document.getElementById('efaGateReset').addEventListener('click', function () {
      var em = email.value.trim();
      if (!em) { say('err', 'Enter your email above first, then tap Forgot password.'); email.focus(); return; }
      clientP.then(function (sb) {
        return sb.auth.resetPasswordForEmail(em, {
          redirectTo: location.origin + '/portal-reset-password?aud=partner'
        });
      }).then(function (r) {
        if (r && r.error) { say('err', r.error.message); return; }
        say('ok', 'Reset link sent. Open it on this device to set a new password.');
      }).catch(function () {
        say('err', 'Could not reach the sign-in service. Check your connection and try again.');
      });
    });

    setTimeout(function () { email.focus(); }, 60);
  }

  /* signing in from another tab (the portal, or another gated page) unlocks this one too */
  window.addEventListener('storage', function (e) {
    if (e.key === STORE && e.newValue && !revealed) {
      access().then(function (st) { if (st === 'ok') reveal(); });
    }
  });

  if (storedSession()) {
    /* a saved portal session exists: confirm it (refreshing if stale) before showing anything */
    var fallback = setTimeout(function () { showGate(); }, 6000);
    access().then(function (st) {
      clearTimeout(fallback);
      if (st === 'ok') reveal();
      else showGate(NOTE[st]);
    });
  } else {
    showGate();
  }
})();
