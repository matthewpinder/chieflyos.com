# chieflyos.com

The waitlist site for **Chiefly**. Plain HTML, CSS and JavaScript: no framework, no build step, no trackers, no third-party requests. GitHub Pages serves it from `main`.

## Files

- `index.html`: the homepage copy, including the price section, the Receipts section, the ask-before demo, and a note from Matthew, signed Matthew.
- `paper/index.html`: placeholder for the philosophy paper (`/paper`).
- `llms.txt`: a short description for answer engines. Outcomes only.
- `styles.css`: the look (colours and easing at the top).
- `app.js`: the mark, the scroll effects and the sign-up form.
- `boot.js`: decides whether to play the start-up screen (first visit per browser session, never with reduced motion).
- `img/`: the C mark (`chiefly-mark.svg`) and favicons. The share image is `og-card.png` (1200×630) at the site root.
- `sitemap.xml`: the public pages. `robots.txt` points at it.
- `fonts/`: Inter (SIL Open Font License, `OFL.txt`), served from this site.
- `CNAME`: the custom domain.
- `supabase/migrations/`: columns Matt runs by hand. See below.

## Sign-ups

The form posts `{ email, source }` to the `waitlist` table in the Supabase project `lvypvstiaqwjtprhjmdo`. `source` is `hero` or `final` on the homepage, `paper` on `/paper`, and `vision` on `/vision`. The migrations in this repo do not put a check constraint on `source`. `/rename` redirects home and has no form.

Mac, Windows, or Both is optional and starts with nothing selected. When someone picks one, the row also gets `platform` as `mac`, `windows`, or `both`.

When the page URL has them, the same row also gets `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content`. Each is trimmed to 200 characters. Empty values are left off. The `/paper` form always sends `utm_content` as `paper`, and the `/vision` form always sends `vision`, so a link with a different `utm_content` does not replace that tag. The other three still come from the URL.

`referrer` is the site that linked here: origin and path only, trimmed to 500 characters. The query string is dropped, so a token in the referring URL is not stored.

All of those fields are optional. The key in `app.js` is the publishable key. It can only add an email: row-level security allows insert only, so nobody can read, change or delete the list from the browser. The database itself rejects bad emails and duplicates.

If `utm_medium`, `utm_campaign`, `referrer`, `platform`, or `build_with_me` are not columns yet, PostgREST answers `PGRST204` (or Postgres `42703`). The form drops the missing column and tries again, so the email still saves. `utm_source` and `utm_content` are not dropped; those columns are already there.

`build_with_me` is the optional “Build with me” box. It is sent only when ticked, as boolean `true`. Unticked sends nothing for that field.

To see sign-ups, open that project in the Supabase dashboard, then Table Editor → `waitlist`.

The headline is “All clear.” After a sign-up the page says “You’re on the list. We’ll tell you when it opens.” and offers a button that copies `https://chieflyos.com/?utm_source=referral`. Joining the waitlist does not lock a price.

## SQL to run before the new fields will store

The site accepts sign-ups either way. Run this once in the Supabase dashboard so `utm_medium`, `utm_campaign`, and `referrer` are kept. Dashboard → SQL Editor → New query → paste → Run. The same statement is in `supabase/migrations/20261015180300_waitlist_attribution.sql`. It is safe to run more than once.

```sql
alter table public.waitlist
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists referrer text;

comment on column public.waitlist.utm_medium is 'utm_medium from the signup page URL. Optional.';
comment on column public.waitlist.utm_campaign is 'utm_campaign from the signup page URL. Optional.';
comment on column public.waitlist.referrer is 'Referring origin and path at signup. Optional. Query strings are not stored.';

notify pgrst, 'reload schema';
```

`platform` is the same kind of optional column. Run this once so a Mac, Windows, or Both choice is kept. The same statement is in `supabase/migrations/20261015213000_waitlist_platform.sql`.

```sql
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

notify pgrst, 'reload schema';
```

`build_with_me` is the same kind of optional column. Run this once so a ticked box is kept. The same statement is in `supabase/migrations/20261015233000_waitlist_build_with_me.sql`. Do not run it from here. Paste it in the Supabase SQL editor.

```sql
alter table public.waitlist
  add column if not exists build_with_me boolean;

comment on column public.waitlist.build_with_me is
  'Optional. True when they opt in to vote on what is next and join early tests. Null if they left the box unticked.';

notify pgrst, 'reload schema';
```

Existing insert policies cover the new columns. Sign-ups are a direct insert. There is no signup RPC. Nothing else has to change in the dashboard unless a policy or grant lists columns by name. In that case, add `platform` and `build_with_me` and leave the policy insert-only.

## Homepage slots

The price section is “Launch prices won’t go back down.” First 100 buyers: Regular $199 / Student $69. After that: Regular $299 / Student $99. The same line appears wherever a price appears. There is no buy button. The waitlist does not reserve the first-100 price.

The ask-before demo is `#boundary`. It is a sample request, “Send the follow-up email to Sam?”, with Approve, Refuse, and Reset. Nothing is sent. It does not use the network.

“How install works” is the four steps under the hero. It describes the path. It is not a download button, and it does not link to `/download` while that page is hidden.

Timing on the page is “Coming this December”. The line sits above each waitlist form. There is no date and no countdown. `launchWhen()` in `app.js` leaves any countdown node blank.

After someone joins, the thank-you says “You’re on the list. We’ll tell you when it opens.” It does not show how many spots are left, and it does not say the first 100 keep a price.

`testimonials.js` is the only place quotes go. The list is empty. The homepage section stays hidden until an item has both a `quote` and a `name` from a real person. Do not invent either.

`/rename` is a meta refresh to the homepage, so an old link does not 404. It is not in the menu or the footer. `/local-chatgpt-alternative` is the same kind of refresh, to `/on-your-computer` (“Your AI, on your computer”). The old share images for those two URLs are gone.

`/paper` is a coming-soon page for the philosophy paper, which is with a professor for review. Its form is tagged `utm_content=paper`.

`/vision` is where Chiefly is going. No dates. It is public. The logo menu includes Vision. `/leave` is the right to leave: export, then uninstall. It stays off the menu until launch.

## The LAUNCH flag

`launch.js` holds one switch: `LAUNCH`. It is `false`.

`/privacy` is already public. The waitlist collects emails, so the page is linked in the footer and under each form, listed in the sitemap, and allowed to be indexed. Legal review is still recommended before those words are treated as final. The page says last updated October 15, 2026. Removal is `matt@chieflyos.com`.

While `LAUNCH` is false, Download, Welcome, Terms, and Support are built and are not linked from the site. Leave is the same: unlinked, `noindex`, and not in the sitemap. Footer and menu links marked `data-launch-link` (Download, Welcome, Terms, Support, Leave) stay hidden until `launch.js` adds `launched` on the `html` element.

`/welcome`, `/download`, `/terms`, and `/leave` also redirect home while `LAUNCH` is false. `launch.js` is loaded without `defer` on those four pages and calls `location.replace("/")`. Each page has `noindex` and a `<noscript>` refresh for browsers with JavaScript off. The pages are not deleted. On launch day, remove `noindex` and the noscript refresh, then set `LAUNCH` to true. Until then, a visitor with JavaScript never sees the unfinished copy.

The homepage does not show a film until the video file exists. There is no “Not up yet” slot.

- `/download`: the button for this computer, the warning steps, system requirements as TBD
- `/welcome`: after purchase
- `/terms`: plain language. Legal review needed before it is public.
- `/support`: contact and bug reports both go to `matt@chieflyos.com`

`/leave` is hidden with the other unfinished pages until `LAUNCH` is true. Contact there is `matt@chieflyos.com`. The vision page still says you can export and uninstall. Its link to `/leave` is a `data-launch-link`, so it appears when the page is public.

Set `LAUNCH` to `true` on launch day. Every link whose text is exactly “Join the waitlist” becomes “Get Chiefly”. Paste the Gumroad link into `GET_URL`. Until that link exists, Get Chiefly opens `/download`. The email form button stays “Join the waitlist”, because it still saves an email. A “Privacy” link is not switched.

The same switch shows the footer links Download, Welcome, Terms, Support, and Leave. They are in the HTML with `hidden` until then. Privacy is already shown.

Also, before you call the remaining pages public: remove `noindex` on each one, add them to `sitemap.xml`, and replace `[date of merge]` on `/terms`. Contact and bug reports already go to `matt@chieflyos.com`.

The email form is unchanged by the flag.

## Check it locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.
