// Cloudflare Pages Function: /api/annuity-intake-submit
// Receives the completed annuity intake from /resources/annuity-intake (the generated
// application entry sheet PDF, or a JSON answer dump if pdf-lib fails to load) and
// emails it to the practice via Resend.
//
// Hardening, sender identity and env var names are deliberately identical to
// /functions/api/send-report.js — that file is the source of truth. If you change the
// origin allowlist, the app header, the rate limiter or the Turnstile handling here,
// change it there and in /functions/api/intake-submit.js too.
//
// Env vars (Cloudflare Pages > Settings > Variables and Secrets):
//   RESEND_API_KEY        required, secret — same key the calculator and contact form use
//   INTAKE_TO             optional — where intakes land (default HQ below; comma-separate for several)
//                         shared with intake-submit.js; no new variable is needed
//   INTAKE_FROM           optional — verified Resend sender (default FROM below)
//   ALLOW_PREVIEW         optional — "1" also allows *.pages.dev preview deploys
//   TURNSTILE_SECRET_KEY  optional — DO NOT SET: neither this page nor the calculator
//                         ships a site key, so setting the secret rejects every submission

const FROM = 'Joshua Edwards | Edwards Financial & Associates <joshua@edwardsfinancialassociates.com>';
const HQ = 'jedwards.finance@gmail.com';
const STOREFRONT = 'joshua@edwardsfinancialassociates.com';
const APP_HEADER = 'annuity-intake';                // X-EFA-App value sent by annuity-intake.html
const MAX_BODY_BYTES = 8 * 1024 * 1024;             // entry sheet plus filled packet, roughly 2 MB

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function wrap(bodyHtml) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f7f5f1;">
  <div style="max-width:620px;margin:0 auto;padding:28px 20px;font-family:Georgia,'Times New Roman',serif;">
    <div style="background:#0d1e3a;border-radius:10px 10px 0 0;padding:18px 26px;">
      <div style="color:#ffffff;font-size:19px;font-weight:700;">Edwards Financial <span style="color:#d4af5a;">&amp; Associates</span></div>
      <div style="color:#d4af5a;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:3px;">Protect &middot; Grow &middot; Legacy</div>
    </div>
    <div style="background:#ffffff;border-radius:0 0 10px 10px;padding:26px;font-size:15px;line-height:1.7;color:#333;border-bottom:4px solid #b8972e;">
      ${bodyHtml}
    </div>
    <div style="text-align:center;color:#9a9590;font-size:11px;margin-top:14px;line-height:1.6;">
      Client-supplied information. Review before any application is submitted.
    </div>
  </div></body></html>`;
}

// ── Endpoint hardening (mirrors /api/send-report) ─────────────────────────────
//   1. Origin/Referer allowlist — browser calls must come from the firm's site.
//   2. Required custom header (X-EFA-App) — forces a CORS preflight, blocking
//      simple cross-site POSTs and casual scripts.
//   3. Optional Cloudflare Turnstile — only if TURNSTILE_SECRET_KEY is set AND the
//      page ships a site key. Today neither does; leave the secret unset.
//   4. Soft per-IP rate limit (per isolate) — backstop; configure a Cloudflare WAF
//      rate rule on /api/intake-submit for real enforcement.
const ALLOWED_ORIGINS = [
  'https://edwardsfinancialassociates.com',
  'https://www.edwardsfinancialassociates.com',
];
const RATE = { max: 6, windowMs: 10 * 60 * 1000, map: new Map() };
function rateLimited(ip) {
  const now = Date.now();
  const arr = (RATE.map.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  if (arr.length >= RATE.max) { RATE.map.set(ip, arr); return true; }
  arr.push(now); RATE.map.set(ip, arr);
  if (RATE.map.size > 5000) RATE.map.clear(); // memory backstop
  return false;
}
function okOrigin(value, env) {
  const allowPreview = env.ALLOW_PREVIEW === '1';
  return ALLOWED_ORIGINS.some((o) => value === o || value.startsWith(o + '/'))
    || (allowPreview && /^https:\/\/[a-z0-9-]+\.edwards-financial-website(-[a-z0-9]+)?\.pages\.dev(\/|$)/.test(value));
}
function originAllowed(request, env) {
  const origin = request.headers.get('Origin') || '';
  const referer = request.headers.get('Referer') || '';
  if (origin) return okOrigin(origin, env);
  if (referer) return okOrigin(referer, env);
  return false; // no origin/referer at all → not a browser call from our site
}
function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  if (!origin || !okOrigin(origin, env)) return { Vary: 'Origin' };
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-EFA-App',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export async function onRequestOptions(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const ok = origin && okOrigin(origin, env);
  return new Response(null, { status: ok ? 204 : 403, headers: corsHeaders(request, env) });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const key = env.RESEND_API_KEY;
  const cors = corsHeaders(request, env);
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors },
    });

  if (!key) return json({ ok: false, error: 'RESEND_API_KEY is not configured.' }, 500);

  // ── security gate ──
  if (!originAllowed(request, env)) return json({ ok: false, error: 'Forbidden.' }, 403);
  if (request.headers.get('X-EFA-App') !== APP_HEADER) return json({ ok: false, error: 'Forbidden.' }, 403);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (rateLimited(ip)) return json({ ok: false, error: 'Too many submissions — try again shortly.' }, 429);
  const len = Number(request.headers.get('Content-Length') || 0);
  if (len && len > MAX_BODY_BYTES) return json({ ok: false, error: 'Submission too large.' }, 413);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }

  // Optional Turnstile human-check: enforced whenever the secret is configured.
  if (env.TURNSTILE_SECRET_KEY) {
    const token = String(body.turnstileToken || '');
    if (!token) return json({ ok: false, error: 'Verification required.' }, 403);
    try {
      const vr = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
      });
      const vj = await vr.json();
      if (!vj.success) return json({ ok: false, error: 'Verification failed.' }, 403);
    } catch { return json({ ok: false, error: 'Verification unavailable.' }, 403); }
  }

  // ── payload ──
  // A partial intake is still worth having, so a missing name is labelled rather than
  // rejected (client-intake.html already requires first + last before it will submit).
  const meta = body.meta || {};
  const who = String(meta.name || '').slice(0, 120).trim() || 'Unnamed client';
  const fileBase = (String(body.filename || 'EFA_Annuity_Intake').replace(/[^A-Za-z0-9._-]/g, '_')).slice(0, 120)
    .replace(/\.(pdf|json)$/i, '') || 'EFA_Annuity_Intake';
  const attachments = [];

  // The filled Athene packet leads, because that is what gets keyed or signed.
  if (body.appBase64) {
    const appPdf = String(body.appBase64);
    if (appPdf.length > MAX_BODY_BYTES) return json({ ok: false, error: 'Attachment too large.' }, 413);
    const appBase = (String(body.appFilename || 'Athene_Application').replace(/[^A-Za-z0-9._-]/g, '_'))
      .slice(0, 120).replace(/\.pdf$/i, '') || 'Athene_Application';
    attachments.push({ filename: `${appBase}.pdf`, content: appPdf });
  }

  if (body.pdfBase64) {
    const pdf = String(body.pdfBase64);
    if (pdf.length > MAX_BODY_BYTES) return json({ ok: false, error: 'Attachment too large.' }, 413);
    attachments.push({ filename: `${fileBase}.pdf`, content: pdf });
  } else if (body.answers) {
    attachments.push({ filename: `${fileBase}.json`, content: b64utf8(JSON.stringify(body.answers, null, 2)) });
  } else if (!attachments.length) {
    return json({ ok: false, error: 'Nothing submitted.' }, 400);
  }

  const clientEmail = String(meta.email || '').trim();
  const out = Array.isArray(meta.outstanding) ? meta.outstanding : [];
  const outCount = out.reduce((n, s) => n + ((s && s.items && s.items.length) || 0), 0);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const rows = [
    ['Client', who],
    ['Email', clientEmail || 'not provided'],
    ['Phone', meta.phone || 'not provided'],
    ['Anticipated premium', meta.premium || 'not provided'],
    ['Product', meta.product || 'not selected on this form'],
    ['Replacement', meta.replacement ? 'YES — 19725 comparison and CA 10932 notice required' : 'no'],
    ['Answers captured', meta.fields || 0],
    ['Athene application', meta.appFields ? `attached, ${meta.appFields} fields written` : 'not attached'],
    ['Completed in', meta.mode === 'agent' ? 'agent view' : 'client view'],
    ['Submitted', today],
    ['Still outstanding', outCount ? `${outCount} item${outCount > 1 ? 's' : ''}` : 'nothing, complete'],
  ];
  const outHtml = outCount
    ? `<div style="background:#fdf7e6;border:1px solid #dfc477;border-left:3px solid #b8972e;border-radius:6px;padding:10px 16px;margin-top:18px;">
         <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a6a1f;font-weight:700;">Client still owes you</p>
         ${out.map((sec) => `<p style="margin:8px 0 2px;font-size:14px;font-weight:700;color:#0d1e3a;">${esc(sec && sec.section)}</p>
            <ul style="margin:0 0 0 20px;padding:0;">${((sec && sec.items) || []).map((i) => `<li style="margin:3px 0;font-size:13.5px;color:#4a4636;">${esc(i)}</li>`).join('')}</ul>`).join('')}
       </div>`
    : '';

  const mailTo = String(env.INTAKE_TO || HQ).split(',').map((a) => a.trim()).filter(Boolean);
  const isJson = attachments[0].filename.endsWith('.json');
  const payload = {
    from: env.INTAKE_FROM || FROM,
    to: mailTo.length ? mailTo : [HQ],
    subject: `New annuity intake: ${who}`,
    html: wrap(`
      <p style="margin:0 0 14px;">An annuity intake was just submitted from the website. The attached entry sheet follows the Athene packet order: 18383 application, 25698 California suitability worksheet, ACORD 951e transfer, 19725 comparison, 16541 trust.</p>
      <table style="border-collapse:collapse;font-size:14px;line-height:1.6;">
        ${rows.map(([k, v]) => `<tr><td style="color:#6b6b6b;padding:3px 18px 3px 0;white-space:nowrap;vertical-align:top;">${esc(k)}</td><td style="color:#0d1e3a;font-weight:600;">${esc(v)}</td></tr>`).join('')}
      </table>
      ${outHtml}
      <p style="margin:18px 0 0;color:#6b6b6b;font-size:13px;">The entry sheet is attached${isJson ? ' as a JSON answer file, because the PDF engine did not load in the client\'s browser' : ''}${meta.appFields ? ', along with the Athene packet filled from these answers. Identifiers and signatures are still needed on it' : ''}. Review before any application is submitted.</p>`),
    attachments,
  };
  // Reply goes straight to the client when they gave a usable address; otherwise to the storefront.
  payload.reply_to = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clientEmail) ? clientEmail : STOREFRONT;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    return json({ ok: false, error: `Resend rejected the send (${res.status}). ${err.slice(0, 200)}` }, 502);
  }
  const rj = await res.json().catch(() => ({}));
  return json({ ok: true, id: rj.id || null });
}
