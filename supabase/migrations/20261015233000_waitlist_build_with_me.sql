-- Optional founder opt-in: vote on what is next, and join early tests.
-- Run this in the Supabase SQL editor for project lvypvstiaqwjtprhjmdo
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- Safe to run more than once. Sign-ups still save if you have not run it
-- yet. The form sends build_with_me only when the box is ticked, and it
-- drops the field and tries again if the column is missing.

alter table public.waitlist
  add column if not exists build_with_me boolean;

comment on column public.waitlist.build_with_me is
  'Optional. True when they opt in to vote on what is next and join early tests. Null if they left the box unticked.';

notify pgrst, 'reload schema';
