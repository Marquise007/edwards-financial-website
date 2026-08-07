-- Run once in the Supabase SQL editor.
-- Project: edwards-financial-portal (rybnzvlogmbjlgdziswj)
--
-- Creates the table the Request Access form writes to, and locks it down so the
-- public key can insert a request but cannot read anyone else's.

create table if not exists public.access_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  email         text        not null,
  company       text        not null,
  license       text,
  status        text        not null default 'pending',
  requested_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

alter table public.access_requests enable row level security;

-- Insert only. Note the WITH CHECK is not (true): it constrains what may be
-- written, so the public key cannot post arbitrary rows or pre-approve itself.
drop policy if exists "anon can submit an access request" on public.access_requests;
create policy "anon can submit an access request"
  on public.access_requests
  for insert
  to anon
  with check (
    status = 'pending'
    and length(name) between 1 and 200
    and length(company) between 1 and 200
    and length(coalesce(license, '')) <= 200
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and length(email) <= 320
  );

-- No select, update, or delete policy for anon. With RLS on and no policy,
-- those are denied by default. Read them in the Supabase dashboard, or with
-- the service role key from a server, never from a browser.

create index if not exists access_requests_status_requested_idx
  on public.access_requests (status, requested_at desc);

-- Verify:
--   select tablename, policyname, cmd, roles
--   from pg_policies where tablename = 'access_requests';
