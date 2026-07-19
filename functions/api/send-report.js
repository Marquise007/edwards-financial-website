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

export async function onRequestPost(context) {
  const { request, env } = context;
  const key = env.RESEND_API_KEY;
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

  if (!key) return json({ ok: false, error: 'RESEND_API_KEY is not configured.' }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }

  const mode = body.mode === 'client' ? 'client' : 'self';
  const clientName = String(body.clientName || '').slice(0, 120).trim();
  const summary = String(body.summary || '').slice(0, 400);
  const note = String(body.note || '').slice(0, 2000).trim();
  const items = Array.isArray(body.items) ? body.items.map((x) => String(x).slice(0, 160)).slice(0, 25) : [];
  const reportHtml = String(body.reportHtml || '');
  const reportPdf = String(body.reportPdf || '');            // base64 PDF from the calculator (preferred)
  const fileName = (String(body.fileName || 'Pension_Review.html').replace(/[^A-Za-z0-9._-]/g, '_')).slice(0, 120);
  const pdfFileName = (String(body.pdfFileName || fileName.replace(/\.html?$/i, '.pdf')).replace(/[^A-Za-z0-9._-]/g, '_')).slice(0, 120);

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
    payload = {
      from: FROM,
      to: [HQ, STOREFRONT],
      subject: `Client File Saved: ${clientName} | Pension Review ${today}`,
      html: wrap(`
        <p style="margin:0 0 12px;">Client file saved from the California Pension Calculator.</p>
        <p style="margin:0 0 6px;"><b style="color:#0d1e3a;">Client:</b> ${esc(clientName)}</p>
        ${summary ? `<p style="margin:0 0 6px;"><b style="color:#0d1e3a;">Session:</b> ${esc(summary)}</p>` : ''}
        <p style="margin:0 0 6px;"><b style="color:#0d1e3a;">Saved:</b> ${today}</p>
        <p style="margin:14px 0 0;color:#6b6b6b;font-size:13px;">The full report is attached. Open it in a browser to review or rebuild this pension analysis later.</p>`),
      attachments: [attachment],
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
    payload = {
      from: FROM,
      to: [to],
      bcc: [HQ],
      reply_to: STOREFRONT,
      subject: `Thank You, ${firstName} | Your Pension Review and Next Steps`,
      html: wrap(`
        <p style="margin:0 0 12px;">Hi ${firstName},</p>
        <p style="margin:0 0 12px;">Thank you for meeting with me today. It was a pleasure walking through your pension and retirement picture together.</p>
        <p style="margin:0 0 12px;">Your personalized pension review is attached for your records. Feel free to open it any time; it captures everything we covered.</p>
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
