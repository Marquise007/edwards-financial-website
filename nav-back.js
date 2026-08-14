/* Edwards Financial & Associates — universal back control
 *
 * One script, included on pages that historically had no way back.
 * Renders a small fixed pill, bottom left:
 *   - If the visitor arrived from another page on this site, it goes back
 *     to exactly where they were.
 *   - If they landed directly (new tab, shared link, search), it offers
 *     the most useful destination instead: the Resources hub for pages
 *     under /resources, the home page everywhere else.
 *   - Inside an iframe overlay it renders nothing; the host page already
 *     provides its own close control.
 *
 * Per-page overrides on the script tag:
 *   <script src="/nav-back.js" defer data-back="/resources" data-back-label="All Resources"></script>
 */
(function () {
  'use strict';

  /* Never compete with a host overlay's own close control. */
  if (window.self !== window.top) return;
  if (document.getElementById('efa-nav-back')) return;

  var script = document.currentScript;
  var ds = (script && script.dataset) || {};
  var path = window.location.pathname || '/';

  var fallbackHref = ds.back || (path.indexOf('/resources/') === 0 ? '/resources' : '/');
  var fallbackLabel = ds.backLabel || (fallbackHref === '/resources' ? 'All Resources' : 'Home');

  var sameOrigin = document.referrer && document.referrer.indexOf(window.location.origin + '/') === 0;
  var canGoBack = sameOrigin && window.history.length > 1;

  var css = [
    /* z-index matches the resource gate's own layer; being appended later, the
       pill paints above it, so even the locked state keeps a way out */
    '#efa-nav-back{position:fixed;left:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:2147483647;',
    'display:inline-flex;align-items:center;gap:8px;padding:10px 18px 10px 13px;border-radius:999px;',
    'background:rgba(13,30,58,.94);color:#f7f5f1;border:1px solid rgba(184,151,46,.55);',
    'font-family:inherit;font-size:14px;font-weight:500;letter-spacing:.02em;line-height:1;',
    'text-decoration:none;cursor:pointer;box-shadow:0 6px 22px rgba(13,30,58,.28);',
    '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);',
    'transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;}',
    '#efa-nav-back:hover{border-color:#b8972e;transform:translateY(-1px);box-shadow:0 9px 26px rgba(13,30,58,.34);}',
    '#efa-nav-back:focus-visible{outline:2px solid #b8972e;outline-offset:2px;}',
    '#efa-nav-back svg{width:15px;height:15px;fill:#b8972e;flex:none;}',
    '@media (max-width:640px){#efa-nav-back{left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));padding:9px 15px 9px 11px;font-size:13px;}}',
    '@media print{#efa-nav-back{display:none !important;}}',
    '@media (prefers-reduced-motion:reduce){#efa-nav-back{transition:none;}#efa-nav-back:hover{transform:none;}}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;

  var arrow = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
              '<path d="M15.4 18.6 8.8 12l6.6-6.6L13.6 3.6 5.2 12l8.4 8.4z"/></svg>';

  var el;
  if (canGoBack) {
    el = document.createElement('button');
    el.type = 'button';
    el.setAttribute('aria-label', 'Go back to the previous page');
    el.innerHTML = arrow + '<span>Back</span>';
    el.addEventListener('click', function () {
      /* If back has nowhere to go, fall through to the safe destination. */
      var timer = window.setTimeout(function () {
        window.location.href = fallbackHref;
      }, 450);
      window.addEventListener('pagehide', function () {
        window.clearTimeout(timer);
      }, { once: true });
      window.history.back();
    });
  } else {
    el = document.createElement('a');
    el.href = fallbackHref;
    el.setAttribute('aria-label', 'Go to ' + fallbackLabel);
    el.innerHTML = arrow + '<span>Back to ' + fallbackLabel + '</span>';
  }
  el.id = 'efa-nav-back';

  var mounted = false;
  function mount() {
    if (mounted || document.getElementById('efa-nav-back')) return;
    mounted = true;
    document.head.appendChild(style);
    document.body.appendChild(el);
    /* On pages that scroll normally, reserve room at the very bottom so the
       pill never sits on top of the footer's last lines. App-style pages
       (overflow hidden, inner panes scroll) are left exactly as they are. */
    var bs = window.getComputedStyle(document.body);
    if (bs.overflow !== 'hidden' && bs.overflowY !== 'hidden') {
      document.body.style.paddingBottom = 'calc(' + (bs.paddingBottom || '0px') + ' + 72px)';
    }
  }
  /* Mount one tick after DOMContentLoaded: overlays like the resource gate
     build during that event, and appending after them is what keeps the pill
     painted above the gate rather than underneath it. */
  function schedule() { window.setTimeout(mount, 0); }
  if (document.readyState === 'complete') {
    schedule();
  } else {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
    window.addEventListener('load', schedule, { once: true });
  }
})();
