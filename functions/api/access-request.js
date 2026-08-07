// ============================================================================
// Cloudflare Pages Function  —  POST /api/access-request
//
// Receives a partner access request from portal-partner-login.html, emails it
// to Joshua via Resend, and stores a copy in Supabase (best-effort) so there is
// a request history without anyone having to read the database.
//
// Repo location:  /functions/api/access-request.js  ->  route /api/access-request
//
// Uses the SAME secret the partner-inquiry function already uses. Nothing new
// to configure in Cloudflare:
//     RESEND_API_KEY     required, already set
//     MAIL_TO            optional override, comma-separate for multiple
//     MAIL_FROM          optional override, must be a verified Resend sender
// ============================================================================

const SUPABASE_URL = 'https://rybnzvlogmbjlgdziswj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HfmpHTebHafZwIOJGmFang__PEaiC85';

const DEFAULT_MAIL_TO = 'joshua@edwardsfinancialassociates.com, jedwards.finance@gmail.com';
const DEFAULT_MAIL_FROM = 'Edwards Financial & Associates <notifications@edwardsfinancialassociates.com>';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const company = (body.company || '').trim();
  const license = (body.license || '').trim();

  if (!name || !email || !company) {
    return json({ error: 'Name, email, and company are required.' }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'That email address does not look right.' }, 400);
  }

  // 1) Store the request in Supabase. Best-effort: if the table is missing or
  //    RLS blocks the insert, the email below is still the record of the request.
  let stored = false;
  let storeDetail = '';
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/access_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        name,
        email,
        company,
        license,
        status: 'pending',
        requested_at: new Date().toISOString(),
      }),
    });
    stored = r.ok;
    if (!r.ok) storeDetail = await r.text();
  } catch (e) {
    stored = false;
    storeDetail = String(e);
  }

  // 2) Email the request to Joshua via Resend. This is the primary record.
  const RESEND_API_KEY = env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return json({ error: 'Email is not configured yet.' }, 500);
  }
  const mailTo = (env.MAIL_TO || DEFAULT_MAIL_TO)
    .split(',')
    .map((addr) => addr.trim())
    .filter(Boolean);
  const mailFrom = env.MAIL_FROM || DEFAULT_MAIL_FROM;

  const row = (label, value) =>
    `<tr><td style="color:#667389;padding:3px 18px 3px 0;white-space:nowrap;vertical-align:top">${label}</td><td style="color:#0d1e3a">${esc(value) || 'Not given'}</td></tr>`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #d6cfc4;border-top:3px solid #b8972e">
    <div style="padding:28px 30px 8px">
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b8972e;margin:0 0 6px">Partner Access Request</p>
      <h2 style="font-size:21px;color:#0d1e3a;margin:0 0 18px">${esc(name)}</h2>
      <table style="font-size:14px;line-height:1.6;border-collapse:collapse;width:100%">
        <tr><td style="color:#667389;padding:3px 18px 3px 0">Email</td><td><a href="mailto:${esc(email)}" style="color:#8a6e22">${esc(email)}</a></td></tr>
        ${row('Company', company)}
        ${row('License / role', license)}
      </table>
      <p style="font-size:13px;line-height:1.7;color:#0d1e3a;margin:22px 0 0">
        To approve, create the user in Supabase Authentication and send them their credentials.
      </p>
    </div>
    <div style="padding:14px 30px;background:#f7f5f1;border-top:1px solid #d6cfc4">
      <p style="font-size:11px;color:#667389;margin:0">
        ${stored
          ? 'Saved to your access_requests table. Reply directly to reach the sender.'
          : 'The database copy did not confirm, so this email is your record. Reply directly to reach the sender.'}
      </p>
    </div>
  </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: mailFrom,
        to: mailTo,
        reply_to: email,
        subject: `Partner access request from ${name}`,
        html: html,
      }),
    });
    if (!r.ok) {
      const detail = await r.text();
      return json({ error: 'Could not send the request.', detail }, 502);
    }
  } catch (e) {
    return json({ error: 'Could not send the request.' }, 502);
  }

  return json({ ok: true, stored, storeDetail });
}
