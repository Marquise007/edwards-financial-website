/* Edwards Financial & Associates — branded scheduling popup
 *
 * One script, included on every page that links to Calendly. Any click on a
 * calendly.com link opens the calendar in a popup styled to the practice:
 * navy overlay, cream card, gold accents, Cormorant heading. Nobody leaves
 * the site to book a meeting.
 *
 * - The calendar itself is themed through Calendly's supported URL
 *   parameters (background, text, and button colors match the brand).
 * - Esc, the close button, or a click outside the card closes it.
 * - Cmd/Ctrl/Shift-click and middle-click keep their browser meaning.
 * - Without JavaScript the links still work: they open Calendly in a new
 *   tab, so no visitor is ever stranded.
 * - Works for every current and future Calendly link on the site, any
 *   event type, with no per-link setup.
 */
(function () {
  'use strict';

  if (window.__efaCalendlyPopup) return;
  window.__efaCalendlyPopup = true;

  var BRAND = {
    background: '#f7f5f1',
    text: '#0d1e3a',
    accent: '#b8972e'
  };

  function isCalendly(href) {
    try {
      var u = new URL(href, window.location.href);
      return u.hostname === 'calendly.com' || u.hostname.endsWith('.calendly.com');
    } catch (e) { return false; }
  }

  function themedUrl(href) {
    var u = new URL(href, window.location.href);
    u.searchParams.set('hide_gdpr_banner', '1');
    u.searchParams.set('background_color', BRAND.background);
    u.searchParams.set('text_color', BRAND.text);
    u.searchParams.set('primary_color', BRAND.accent);
    u.searchParams.set('embed_domain', window.location.hostname);
    u.searchParams.set('embed_type', 'Popup');
    return u.toString();
  }

  var CSS = [
    '.efa-cal-overlay{position:fixed;inset:0;z-index:2147483647;background:rgba(13,30,58,.78);',
    '-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);display:flex;align-items:center;',
    'justify-content:center;padding:24px;opacity:0;transition:opacity .18s ease;}',
    '.efa-cal-overlay.on{opacity:1;}',
    '.efa-cal-card{background:#f7f5f1;border-radius:16px;border-top:3px solid #b8972e;width:min(1000px,94vw);',
    'height:min(760px,92vh);display:flex;flex-direction:column;overflow:hidden;',
    'box-shadow:0 30px 80px rgba(7,15,30,.5);transform:translateY(10px) scale(.985);transition:transform .18s ease;}',
    '.efa-cal-overlay.on .efa-cal-card{transform:none;}',
    '.efa-cal-head{display:flex;align-items:center;justify-content:space-between;gap:16px;',
    'padding:16px 22px 14px;border-bottom:1px solid rgba(184,151,46,.35);background:#f7f5f1;flex:none;}',
    '.efa-cal-title{font-family:"Cormorant Garamond",Georgia,serif;font-size:22px;font-weight:600;',
    'color:#0d1e3a;line-height:1;letter-spacing:.01em;}',
    '.efa-cal-title small{display:block;font-family:"DM Sans",Montserrat,system-ui,sans-serif;font-size:11px;',
    'font-weight:500;color:#b8972e;letter-spacing:.14em;text-transform:uppercase;margin-top:5px;}',
    '.efa-cal-close{flex:none;width:36px;height:36px;border:1px solid rgba(13,30,58,.18);border-radius:999px;',
    'background:transparent;color:#0d1e3a;font-size:16px;line-height:1;cursor:pointer;',
    'display:inline-flex;align-items:center;justify-content:center;transition:color .15s ease,border-color .15s ease;}',
    '.efa-cal-close:hover{color:#b8972e;border-color:#b8972e;}',
    '.efa-cal-close:focus-visible{outline:2px solid #b8972e;outline-offset:2px;}',
    '.efa-cal-body{position:relative;flex:1;background:#f7f5f1;}',
    '.efa-cal-body iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}',
    '.efa-cal-loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'font-family:"DM Sans",Montserrat,system-ui,sans-serif;font-size:14px;color:#0d1e3a;',
    'letter-spacing:.04em;background:#f7f5f1;}',
    '@media (max-width:640px){.efa-cal-overlay{padding:0;}',
    '.efa-cal-card{width:100vw;height:100dvh;border-radius:0;border-top-width:4px;}}',
    '@media (prefers-reduced-motion:reduce){.efa-cal-overlay,.efa-cal-card{transition:none;}}',
    '@media print{.efa-cal-overlay{display:none !important;}}'
  ].join('');

  var styleInjected = false;
  function ensureStyle() {
    if (styleInjected) return;
    var s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
    styleInjected = true;
  }

  var opener = null;

  function open(href) {
    ensureStyle();
    if (document.querySelector('.efa-cal-overlay')) return;

    var ov = document.createElement('div');
    ov.className = 'efa-cal-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Schedule a conversation with Edwards Financial and Associates');
    ov.innerHTML =
      '<div class="efa-cal-card">' +
        '<div class="efa-cal-head">' +
          '<div class="efa-cal-title">Schedule a Conversation' +
            '<small>Edwards Financial &amp; Associates</small></div>' +
          '<button type="button" class="efa-cal-close" aria-label="Close the calendar">&#x2715;</button>' +
        '</div>' +
        '<div class="efa-cal-body">' +
          '<div class="efa-cal-loading">Opening the calendar&hellip;</div>' +
          '<iframe title="Scheduling calendar" src="' + themedUrl(href).replace(/"/g, '&quot;') + '"></iframe>' +
        '</div>' +
      '</div>';

    function close() {
      document.removeEventListener('keydown', onKey, true);
      ov.remove();
      document.documentElement.style.overflow = '';
      if (opener && opener.focus) opener.focus();
      opener = null;
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
    }

    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('.efa-cal-close').addEventListener('click', close);
    ov.querySelector('iframe').addEventListener('load', function () {
      var l = ov.querySelector('.efa-cal-loading');
      if (l) l.remove();
    });
    document.addEventListener('keydown', onKey, true);

    document.body.appendChild(ov);
    document.documentElement.style.overflow = 'hidden';
    ov.querySelector('.efa-cal-close').focus();
    /* next frame, so the entrance transition runs */
    requestAnimationFrame(function () { ov.classList.add('on'); });
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !isCalendly(a.href)) return;
    e.preventDefault();
    opener = a;
    open(a.href);
  }, true);
})();
