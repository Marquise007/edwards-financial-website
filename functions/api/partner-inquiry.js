// ============================================================================
// Cloudflare Pages Function  —  POST /api/partner-inquiry
//
// Receives a partnership inquiry from professional-partners.html, emails it to
// Joshua via Resend, and stores a copy in Supabase (best-effort) so there is a
// lead history without anyone having to read the database.
//
// Repo location:  /functions/api/partner-inquiry.js   ->  route /api/partner-inquiry
//
// REQUIRED secret (Cloudflare Pages -> Settings -> Variables and Secrets -> Add,
//                  type = Secret):
//     RESEND_API_KEY     your Resend API key (starts with re_...)
//
// OPTIONAL overrides (plain Variables, not secrets):
//     MAIL_TO            where inquiries are sent   (default below)
//     MAIL_FROM          verified Resend sender     (default below)
// ============================================================================

const SUPABASE_URL = 'https://rybnzvlogmbjlgdziswj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HfmpHTebHafZwIOJGmFang__PEaiC85';

const DEFAULT_MAIL_TO = 'joshua@edwardsfinancialandassociates.com';
// IMPORTANT: the FROM address must be on a domain you have verified in Resend.
// Before verifying your domain, you can temporarily set MAIL_FROM to
// 'onboarding@resend.dev' (Resend's test sender) to confirm the flow works.
const DEFAULT_MAIL_FROM = 'Edwards Financial & Associates <notifications@edwardsfinancialandassociates.com>';

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

  const firm = (body.firm_name || '').trim();
  const name = (body.contact_name || '').trim();
  const email = (body.email || '').trim();
  if (!firm || !name || !email) {
    return json({ error: 'Firm, name, and email are required.' }, 400);
  }

  const record = {
    firm_name: firm,
    contact_name: name,
    email: email,
    phone: (body.phone || '').trim(),
    profession: (body.profession || '').trim(),
    clients_served: (body.clients_served || '').trim(),
    focus_areas: (body.focus_areas || '').trim(),
    message: (body.message || '').trim(),
  };

  // 1) Store the inquiry in Supabase (RLS allows anonymous insert).
  //    Best-effort: if it fails, the email below is still the primary copy.
  let stored = false;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/partner_inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(record),
    });
    stored = r.ok;
  } catch (e) {
    stored = false;
  }

  // 2) Email the inquiry to Joshua via Resend.
  const RESEND_API_KEY = env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return json({ error: 'Email is not configured yet.' }, 500);
  }
  const mailTo = env.MAIL_TO || DEFAULT_MAIL_TO;
  const mailFrom = env.MAIL_FROM || DEFAULT_MAIL_FROM;

  const row = (label, value) =>
    `<tr><td style="color:#6b6560;padding:3px 18px 3px 0;white-space:nowrap;vertical-align:top">${label}</td><td style="color:#0d1e3a">${esc(value) || '&mdash;'}</td></tr>`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #d6cfc4;border-top:3px solid #b8972e">
    <div style="padding:28px 30px 8px">
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b8972e;margin:0 0 6px">New Partnership Inquiry</p>
      <h2 style="font-size:21px;color:#0d1e3a;margin:0 0 18px">${esc(firm)}</h2>
      <table style="font-size:14px;line-height:1.6;border-collapse:collapse;width:100%">
        ${row('Name', name)}
        <tr><td style="color:#6b6560;padding:3px 18px 3px 0">Email</td><td><a href="mailto:${esc(email)}" style="color:#8a6e22">${esc(email)}</a></td></tr>
        ${row('Phone', record.phone)}
        ${row('Profession', record.profession)}
        ${row('Clients', record.clients_served)}
        ${row('Focus', record.focus_areas)}
      </table>
      ${record.message
        ? `<p style="font-size:14px;line-height:1.7;color:#0d1e3a;margin:18px 0 0"><span style="color:#6b6560">Message</span><br>${esc(record.message)}</p>`
        : ''}
    </div>
    <div style="padding:14px 30px;background:#f7f4ef;border-top:1px solid #d6cfc4">
      <p style="font-size:11px;color:#6b6560;margin:0">
        ${stored
          ? 'Saved to your partner_inquiries table. Reply directly to reach the sender.'
          : 'Note: the database copy did not confirm \u2014 this email is your record. Reply directly to reach the sender.'}
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
        to: [mailTo],
        reply_to: email,
        subject: `New partnership inquiry \u2014 ${firm}`,
        html: html,
      }),
    });
    if (!r.ok) {
      const detail = await r.text();
      return json({ error: 'Could not send email.', detail }, 502);
    }
  } catch (e) {
    return json({ error: 'Could not send email.' }, 502);
  }

  return json({ ok: true, stored });
}
