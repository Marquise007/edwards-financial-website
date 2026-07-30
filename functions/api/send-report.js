// Cloudflare Pages Function: /api/send-report
// Sends the pension calculator's client report by email via Resend.
//   mode "self"   -> report to Joshua's inboxes (Save as Client)
//   mode "client" -> thank-you email + report + follow-up checklist to the client,
//                    copy to headquarters inbox
// Requires env var RESEND_API_KEY (same Resend account as the contact form;
// domain edwardsfinancialassociates.com is already verified there).

const FROM = 'Joshua Edwards | Edwards Financial & Associates <joshua@edwardsfinancialassociates.com>';
const HQ = 'jedwards.finance@gmail.com';
const STOREFRONT = 'joshua@edwardsfinancialassociates.com';

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function signature() {
  return `
    <p style="margin:26px 0 0;color:#0d1e3a;font-weight:600;">Warm regards,</p>
    <p style="margin:4px 0 0;color:#0d1e3a;font-weight:700;">Joshua Edwards</p>
    <p style="margin:2px 0 0;color:#6b6b6b;font-size:13px;">Retirement, Pension and Legacy Consultant<br>
    Edwards Financial &amp; Associates<br>
    CA Insurance License #0G52544 &middot; NPN #13411537<br>
    <a href="mailto:${STOREFRONT}" style="color:#b8972e;">${STOREFRONT}</a> &middot;
    <a href="https://edwardsfinancialassociates.com" style="color:#b8972e;">edwardsfinancialassociates.com</a></p>`;
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
      For educational purposes only. Not tax or legal advice.
    </div>
  </div></body></html>`;
}

// Crisp vector PDF via Cloudflare Browser Rendering REST API (works on the Workers Free plan:
// 10 browser-minutes/day, 6 requests/min). Needs env vars CF_ACCOUNT_ID + CF_BROWSER_TOKEN
// (custom API token with "Browser Rendering - Edit" permission). Returns base64 or null.
async function renderVectorPdf(env, html) {
  if (!env.CF_ACCOUNT_ID || !env.CF_BROWSER_TOKEN) return null;
  // charts must be painted before print: disable Chart.js animation so networkidle0 = fully drawn
  const noAnim = '<script>window.addEventListener("DOMContentLoaded",function(){if(window.Chart){Chart.defaults.animation=false;}});</scr' + 'ipt>';
  const doc = html.includes('</body>') ? html.replace('</body>', noAnim + '</body>') : html + noAnim;
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/browser-rendering/pdf`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.CF_BROWSER_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: doc,
        addStyleTag: [{ content: '.no-print{display:none !important;}' }],
        gotoOptions: { waitUntil: 'networkidle0', timeout: 30000 },
        pdfOptions: {
          format: 'letter',
          printBackground: true,
          margin: { top: '10mm', right: '8mm', bottom: '12mm', left: '8mm' },
        },
      }),
    }
  );
  if (!res.ok) return null; // 429 daily cap / rate limit / auth issue → raster fallback
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.length < 2000) return null;
  // sanity: real PDFs start with %PDF
  if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) return null;
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

// ── Endpoint hardening ───────────────────────────────────────────────────────
// This endpoint sends email through the firm's Resend account and renders submitted
// HTML to PDF, so it must not be an open relay. Defenses (in order):
//   1. Origin/Referer allowlist — browser calls must come from the firm's site.
//   2. Required custom header (X-EFA-App) — forces a CORS preflight, blocking
//      simple cross-site POSTs and casual scripts.
//   3. Optional Cloudflare Turnstile — set TURNSTILE_SECRET_KEY (and add the widget
//      client-side) to require a human token per send.
//   4. Soft per-IP rate limit (per isolate) — backstop; configure a Cloudflare WAF
//      rate rule on /api/send-report for real enforcement.
// Residual risk: non-browser clients can forge headers. For full protection, move
// the calculator behind the authenticated partner portal and check its session here.
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
function originAllowed(request, env) {
  const origin = request.headers.get('Origin') || '';
  const referer = request.headers.get('Referer') || '';
  const allowPreview = env.ALLOW_PREVIEW === '1';
  const okList = (v) => ALLOWED_ORIGINS.some((o) => v === o || v.startsWith(o + '/'))
    || (allowPreview && /^https:\/\/[a-z0-9-]+\.edwards-financial-website(-[a-z0-9]+)?\.pages\.dev(\/|$)/.test(v));
  if (origin) return okList(origin);
  if (referer) return okList(referer);
  return false; // no origin/referer at all → not a browser call from our site
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '';
  const ok = ALLOWED_ORIGINS.includes(origin);
  return new Response(null, { status: ok ? 204 : 403, headers: ok ? {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-EFA-App',
    'Access-Control-Max-Age': '86400',
  } : {} });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const key = env.RESEND_API_KEY;
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

  if (!key) return json({ ok: false, error: 'RESEND_API_KEY is not configured.' }, 500);

  // ── security gate ──
  if (!originAllowed(request, env)) return json({ ok: false, error: 'Forbidden.' }, 403);
  if (request.headers.get('X-EFA-App') !== 'pension-calculator') return json({ ok: false, error: 'Forbidden.' }, 403);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (rateLimited(ip)) return json({ ok: false, error: 'Too many requests — try again shortly.' }, 429);

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

  const mode = body.mode === 'client' ? 'client' : 'self';
  const clientName = String(body.clientName || '').slice(0, 120).trim();
  const summary = String(body.summary || '').slice(0, 400);
  const note = String(body.note || '').slice(0, 2000).trim();
  const items = Array.isArray(body.items) ? body.items.map((x) => String(x).slice(0, 160)).slice(0, 25) : [];
  const reportHtml = String(body.reportHtml || '');
  const reportPdf = String(body.reportPdf || '');            // base64 PDF from the calculator (preferred)
  const fileName = (String(body.fileName || 'Pension_Review.html').replace(/[^A-Za-z0-9._-]/g, '_')).slice(0, 120);
  const pdfFileName = (String(body.pdfFileName || fileName.replace(/\.html?$/i, '.pdf')).replace(/[^A-Za-z0-9._-]/g, '_')).slice(0, 120);
  // Strategy Impact (before & after) support
  const reportKind = body.reportKind === 'impact' ? 'impact' : 'standard';
  const preliminary = body.preliminary === true;
  const kindLabel = reportKind === 'impact'
    ? `Strategy Impact Report (${preliminary ? 'Preliminary' : 'Final Recommendations'})`
    : 'Pension Review';
  // Session file (self sends only): full calculator state for the follow-up appointment
  const sessionJson = typeof body.sessionJson === 'string' ? body.sessionJson.slice(0, 2_000_000) : '';
  const sessionFileName = (String(body.sessionFileName || 'Session.efa-session.json').replace(/[^A-Za-z0-9._-]/g, '_')).slice(0, 140);

  if (!clientName) return json({ ok: false, error: 'Client name is required.' }, 400);
  if (!reportPdf && !reportHtml) return json({ ok: false, error: 'Report payload missing.' }, 400);
  if (reportPdf.length > 12_000_000 || reportHtml.length > 4_000_000) return json({ ok: false, error: 'Report payload too large.' }, 400);

  // Attachment preference: (1) crisp vector PDF rendered server-side by headless Chrome,
  // (2) the calculator's raster PDF, (3) HTML as last resort. A send never fails on rendering.
  let attachment = null;
  let renderPath = 'html';
  if (env.CF_ACCOUNT_ID && env.CF_BROWSER_TOKEN && reportHtml) {
    try {
      const vectorB64 = await renderVectorPdf(env, reportHtml);
      if (vectorB64) { attachment = { filename: pdfFileName, content: vectorB64 }; renderPath = 'vector'; }
    } catch (e) { /* daily cap (429) or launch failure: fall through to raster */ }
  }
  if (!attachment && reportPdf) { attachment = { filename: pdfFileName, content: reportPdf }; renderPath = 'raster'; }
  if (!attachment) attachment = { filename: fileName, content: b64utf8(reportHtml) };
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  let payload;

  if (mode === 'self') {
    const attachments = [attachment];
    if (sessionJson) attachments.push({ filename: sessionFileName, content: b64utf8(sessionJson) });
    payload = {
      from: FROM,
      to: [HQ, STOREFRONT],
      subject: `Client File Saved: ${clientName} | ${kindLabel} ${today}`,
      html: wrap(`
        <p style="margin:0 0 12px;">Client file saved from the California Pension Calculator.</p>
        <p style="margin:0 0 6px;"><b style="color:#0d1e3a;">Client:</b> ${esc(clientName)}</p>
        <p style="margin:0 0 6px;"><b style="color:#0d1e3a;">Report type:</b> ${esc(kindLabel)}</p>
        ${summary ? `<p style="margin:0 0 6px;"><b style="color:#0d1e3a;">Session:</b> ${esc(summary)}</p>` : ''}
        <p style="margin:0 0 6px;"><b style="color:#0d1e3a;">Saved:</b> ${today}</p>
        <p style="margin:14px 0 0;color:#6b6b6b;font-size:13px;">The full report is attached.${sessionJson ? ' The <b>session file</b> is attached too — at the follow-up appointment, use “Resume a Saved Session → Import file” on the calculator to bring back every number from this meeting.' : ''}</p>`),
      attachments,
    };
  } else {
    const to = String(body.to || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return json({ ok: false, error: 'Valid client email is required.' }, 400);
    const firstName = esc(clientName.split(/\s+/)[0] || clientName);
    const list = items.length
      ? `<p style="margin:16px 0 6px;">To make the most of our follow-up appointment, please gather the following:</p>
         <ul style="margin:0 0 4px;padding-left:22px;color:#333;">
           ${items.map((i) => `<li style="margin:4px 0;">${esc(i)}</li>`).join('')}
         </ul>
         <p style="margin:12px 0 0;">If possible, please try to send these back at least 48 hours before our follow-up appointment. You can simply reply to this email and attach them.</p>`
      : '';
    const subjectLine = reportKind === 'impact'
      ? `Thank You, ${firstName} | Your Strategy Impact Report${preliminary ? ' (Preliminary)' : ''} and Next Steps`
      : `Thank You, ${firstName} | Your Pension Review and Next Steps`;
    const reportPara = reportKind === 'impact'
      ? `<p style="margin:0 0 12px;">Your <b style="color:#0d1e3a;">Strategy Impact Report</b> is attached. It shows where things stood when we started, the plan we've designed, and the difference between the two — side by side, year by year.</p>
         ${preliminary
           ? `<p style="margin:0 0 12px;">The recommendations inside are <b style="color:#0d1e3a;">preliminary</b> — a working picture for our discussion. We'll refine and finalize them together at our next appointment.</p>`
           : `<p style="margin:0 0 12px;">These are the <b style="color:#0d1e3a;">final recommendations</b> from our planning work together. Keep this report with your records — it's the blueprint we'll measure against going forward.</p>`}`
      : `<p style="margin:0 0 12px;">Your personalized pension review is attached for your records. Feel free to open it any time; it captures everything we covered.</p>`;
    payload = {
      from: FROM,
      to: [to],
      bcc: [HQ],
      reply_to: STOREFRONT,
      subject: subjectLine,
      html: wrap(`
        <p style="margin:0 0 12px;">Hi ${firstName},</p>
        <p style="margin:0 0 12px;">Thank you for meeting with me today. It was a pleasure walking through your pension and retirement picture together.</p>
        ${reportPara}
        ${list}
        ${note ? `<p style="margin:16px 0 0;">${esc(note)}</p>` : ''}
        <p style="margin:16px 0 0;">If anything comes up before we talk again, just reply to this email.</p>
        ${signature()}`),
      attachments: [attachment],
    };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    return json({ ok: false, error: `Resend rejected the send (${res.status}). ${err.slice(0, 200)}` }, 502);
  }
  return json({ ok: true, render: renderPath });
}
