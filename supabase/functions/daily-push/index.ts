// ============================================================================
// Edge Function: daily-push
//
// Deployed to Supabase, NOT to Cloudflare. It lives under supabase/functions/
// on purpose: the repo-root functions/ directory belongs to Cloudflare Pages,
// and anything placed there becomes a public route on the website.
//
// Sends the Daily Desk reminder as a Web Push notification.
//
// Secrets: the VAPID keys and the cron shared secret come from the Postgres
// Vault, read through public.crm_push_config() with the service role client.
// Reading vault.decrypted_secrets directly over PostgREST is NOT possible -- it
// answers PGRST106 "Invalid schema: vault", because only public and
// graphql_public are exposed. The accessor keeps the vault off the HTTP API
// entirely. No key is ever returned to a caller. SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are injected into every Edge Function
// automatically, so nothing here reads a dashboard environment variable.
//
// Three ways in:
//   x-cron-secret matches Vault -> scheduled run. Every row from
//                                  crm_push_targets(), already filtered to
//                                  approved partners who have work due.
//   service_role JWT            -> same scheduled run.
//   authenticated partner JWT   -> test run against only that caller's own
//                                  devices, ignoring the "has work due" filter
//                                  so a test still arrives on an empty queue.
//
// web-push builds the encrypted request; Deno's fetch delivers it. That keeps
// Node's https stack out of the edge runtime and hands back the real status
// code, which is what the 404/410 retirement logic below depends on.
// ============================================================================

import { createClient } from 'jsr:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const DESK_PATH = '/portal-partner-daily-desk';
const SITE = 'https://edwardsfinancialassociates.com';
const CONTACT = 'mailto:joshua@edwardsfinancialassociates.com';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

// The platform has already verified this JWT (verify_jwt is on). We only read
// it to find out who is calling.
function readClaims(authHeader: string | null): { role?: string; sub?: string } {
  if (!authHeader) return {};
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const parts = token.split('.');
  if (parts.length !== 3) return {};
  try {
    const pad = '='.repeat((4 - (parts[1].length % 4)) % 4);
    const raw = atob((parts[1] + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Length-independent comparison, so a wrong secret cannot be narrowed down by
// timing the response.
function constantTimeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const enc = new TextEncoder();
  const x = enc.encode(a), y = enc.encode(b);
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

interface Target {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  overdue?: number;
  due_today?: number;
  body?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only.' }, 405);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // ---- Keys and secrets from Vault ----------------------------------------
  const { data: cfgRows, error: vaultErr } = await admin.rpc('crm_push_config');
  const cfg = Array.isArray(cfgRows) ? cfgRows[0] : cfgRows;
  if (vaultErr || !cfg || !cfg.public_key || !cfg.private_key) {
    console.error('Vault read failed:', vaultErr);
    return json({ error: 'Could not read the signing keys.' }, 500);
  }
  webpush.setVapidDetails(CONTACT, cfg.public_key as string, cfg.private_key as string);

  // ---- Who is calling, and what may they push? -----------------------------
  const claims = readClaims(req.headers.get('Authorization'));
  const body = await req.json().catch(() => ({}));
  const cronHeader = req.headers.get('x-cron-secret');
  const isCron = !!cronHeader && !!cfg.cron_secret &&
                 constantTimeEqual(cronHeader, cfg.cron_secret as string);
  const isService = claims.role === 'service_role';
  const scheduled = (isCron || isService) && !body.test;

  let targets: Target[] = [];
  let mode: string;

  if (scheduled) {
    mode = 'scheduled';
    const { data, error } = await admin.rpc('crm_push_targets');
    if (error) {
      console.error('crm_push_targets failed:', error);
      return json({ error: 'Could not read push targets.', detail: error.message }, 500);
    }
    targets = (data || []) as Target[];
  } else {
    // Test run. Only ever the caller's own devices.
    const userId = (isService || isCron) ? body.user_id : claims.sub;
    if (!userId) return json({ error: 'No user to send to.' }, 400);

    const { data: profile } = await admin
      .from('partner_profiles')
      .select('id, approved')
      .eq('id', userId)
      .maybeSingle();
    if (!profile || !profile.approved) return json({ error: 'Not an approved partner.' }, 403);

    const { data, error } = await admin
      .from('crm_push_subscriptions')
      .select('user_id, endpoint, p256dh, auth_key')
      .eq('user_id', userId)
      .eq('is_active', true);
    if (error) {
      console.error('subscription read failed:', error);
      return json({ error: 'Could not read your devices.' }, 500);
    }
    mode = 'test';
    targets = (data || []) as Target[];
  }

  if (!targets.length) {
    return json({ ok: true, mode, sent: 0, deactivated: 0, failed: 0, note: 'No devices to notify.' });
  }

  // ---- Send ---------------------------------------------------------------
  let sent = 0, deactivated = 0, failed = 0;
  const results: Array<Record<string, unknown>> = [];

  const bumpFailCount = async (endpoint: string) => {
    // PostgREST cannot express col = col + 1, so read then write.
    const { data: row } = await admin.from('crm_push_subscriptions')
      .select('fail_count').eq('endpoint', endpoint).maybeSingle();
    await admin.from('crm_push_subscriptions')
      .update({ fail_count: ((row?.fail_count ?? 0) as number) + 1 })
      .eq('endpoint', endpoint);
  };

  for (const t of targets) {
    const overdue = t.overdue ?? 0;
    const dueToday = t.due_today ?? 0;

    const title = mode === 'test'
      ? 'Daily Desk test'
      : overdue > 0
        ? `${overdue} overdue, ${dueToday} due today`
        : `${dueToday} due today`;

    const text = mode === 'test'
      ? 'Reminders are working on this device. Tap to open the Daily Desk.'
      : (t.body || 'Open the Daily Desk to work your queue.');

    const payload = JSON.stringify({
      title,
      body: text,
      url: `${SITE}${DESK_PATH}`,
      tag: 'daily-desk',
    });

    const subscription = {
      endpoint: t.endpoint,
      keys: { p256dh: t.p256dh, auth: t.auth_key },
    };

    try {
      const details = webpush.generateRequestDetails(subscription as any, payload, { TTL: 3600 });
      const res = await fetch(details.endpoint, {
        method: details.method,
        headers: details.headers as Record<string, string>,
        body: details.body as unknown as BodyInit,
      });

      if (res.ok) {
        sent++;
        await admin.from('crm_push_subscriptions')
          .update({ last_sent_at: new Date().toISOString(), fail_count: 0 })
          .eq('endpoint', t.endpoint);
        results.push({ endpoint: t.endpoint.slice(0, 48) + '...', status: res.status, outcome: 'sent' });
      } else if (res.status === 404 || res.status === 410) {
        // The device is gone for good. Expired Android endpoints are routine
        // and must never be retried forever.
        deactivated++;
        await admin.from('crm_push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', t.endpoint);
        results.push({ endpoint: t.endpoint.slice(0, 48) + '...', status: res.status, outcome: 'deactivated' });
      } else {
        failed++;
        const detail = await res.text().catch(() => '');
        console.error('push failed', res.status, detail.slice(0, 300));
        await bumpFailCount(t.endpoint);
        results.push({ endpoint: t.endpoint.slice(0, 48) + '...', status: res.status, outcome: 'failed' });
      }
    } catch (e) {
      failed++;
      console.error('push threw', String(e));
      await bumpFailCount(t.endpoint);
      results.push({ endpoint: t.endpoint.slice(0, 48) + '...', outcome: 'threw', error: String(e).slice(0, 200) });
    }
  }

  return json({ ok: true, mode, sent, deactivated, failed, results });
});
