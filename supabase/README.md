# Supabase side of the site

Everything in this folder is deployed to **Supabase**, not to Cloudflare.

It deliberately does **not** live in the repo-root `functions/` directory. That
directory belongs to Cloudflare Pages, and any file placed there becomes a
public route on edwardsfinancialassociates.com.

## functions/daily-push

Sends the Daily Desk reminder as a Web Push notification. Called two ways:

- **Scheduled** — `pg_cron` job `crm-daily-push`, weekdays at 13:31 UTC
  (06:31 America/Los_Angeles), one minute after the existing email digest. It
  posts through `pg_net` with the public anon JWT plus an `x-cron-secret`
  header read from Vault at call time, so no secret is written into the job
  definition and the service role key is never needed.
- **Test** — any signed-in approved partner can call it with their own session.
  That mode only ever pushes to that caller's own devices, and it ignores the
  "has work due" filter so a test still arrives on an empty queue.

### Secrets

All of them live in the Postgres Vault. The function reads them through
`public.crm_push_config()`, a `SECURITY DEFINER` accessor executable by
`service_role` alone.

It does **not** read `vault.decrypted_secrets` over PostgREST. That returns
`PGRST106 Invalid schema: vault`, because only `public` and `graphql_public`
are exposed schemas. The accessor exists so the vault never has to be put on
the HTTP API to work around that.

| Vault secret | Used for |
|---|---|
| `VAPID_PUBLIC_KEY` | Application server key. Also shipped in the page, which is safe. |
| `VAPID_PRIVATE_KEY` | Signs the push. Never leaves the database or the function. |
| `PUSH_CRON_SECRET` | Lets `pg_cron` prove a call is the scheduled one. |

### Dead endpoints

A `404` or `410` from a push service means the browser threw the subscription
away. Those rows are set `is_active = false` immediately. Any other failure
increments `fail_count`, and `crm_push_targets()` already skips anything at 5
or more. Expired Android endpoints are routine and must never be retried
forever.

### Redeploying

The deployed copy is the source of truth for what is running; this file is the
version-controlled copy of it. Redeploy with the Supabase CLI:

```bash
supabase functions deploy daily-push --project-ref rybnzvlogmbjlgdziswj
```
