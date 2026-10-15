-- Optional computer on the waitlist: mac, windows, or both.
-- Run this in the Supabase SQL editor for project lvypvstiaqwjtprhjmdo
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- Safe to run more than once. Sign-ups still save if you have not run it
-- yet; platform is stored only after the column exists. The form retries
-- without platform when PostgREST says the column is missing.

alter table public.waitlist
  add column if not exists platform text;

comment on column public.waitlist.platform is
  'Optional computer choice at signup: mac, windows, or both. Null if they skipped it.';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'waitlist_platform_check'
      and conrelid = 'public.waitlist'::regclass
  ) then
    alter table public.waitlist
      add constraint waitlist_platform_check
      check (platform is null or platform in ('mac', 'windows', 'both'));
  end if;
end
$$;

-- Sign-ups are a direct insert into public.waitlist. There is no signup RPC.
-- The existing insert-only RLS policy is on the table, not a column list,
-- and a table-level INSERT grant already covers columns added later.
-- No policy change is required. If a policy or grant on this project lists
-- columns by name, add platform to that list and keep it insert-only.

notify pgrst, 'reload schema';
