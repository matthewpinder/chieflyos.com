-- Waitlist attribution: utm_medium, utm_campaign, and referrer.
-- Run this in the Supabase SQL editor for project lvypvstiaqwjtprhjmdo
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- Safe to run more than once. Sign-ups still save if you have not run it
-- yet; these three fields are stored only after the columns exist.
-- utm_source and utm_content are already on the table.

alter table public.waitlist
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists referrer text;

comment on column public.waitlist.utm_medium is 'utm_medium from the signup page URL. Optional.';
comment on column public.waitlist.utm_campaign is 'utm_campaign from the signup page URL. Optional.';
comment on column public.waitlist.referrer is 'Referring origin and path at signup. Optional. Query strings are not stored.';

notify pgrst, 'reload schema';
