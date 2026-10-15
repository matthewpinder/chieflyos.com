# chieflyos.com

The waitlist site for **Chiefly**. Plain HTML, CSS and JavaScript: no framework, no build step, no trackers, no third-party requests. GitHub Pages serves it from `main`.

## Files

- `index.html`: the homepage copy, including founder’s pricing and the refusal-demo slot.
- `paper/index.html`: placeholder for the philosophy paper (`/paper`).
- `llms.txt`: a short description for answer engines. Outcomes only.
- `styles.css`: the look (colours and easing at the top).
- `app.js`: the mark, the scroll effects and the sign-up form.
- `boot.js`: decides whether to play the start-up screen (first visit per browser session, never with reduced motion).
- `img/`: the C mark (`chiefly-mark.svg`) and favicons. The share image is `og-card.png` (1200×630) at the site root.
- `sitemap.xml`: the public pages. `robots.txt` points at it.
- `fonts/`: Inter (SIL Open Font License, `OFL.txt`), served from this site.
- `CNAME`: the custom domain.
- `supabase/migrations/20261015180300_waitlist_attribution.sql`: columns Matt runs by hand. See below.

## Sign-ups

The form posts `{ email, source }` to the `waitlist` table in the Supabase project `lvypvstiaqwjtprhjmdo`. `source` is `hero` or `final` on the homepage, and `paper` on `/paper`.

When the page URL has them, the same row also gets `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content`. Each is trimmed to 200 characters. Empty values are left off. The `/paper` form always sends `utm_content` as `paper`, so a link with a different `utm_content` does not replace that tag. The other three still come from the URL.

`referrer` is the site that linked here: origin and path only, trimmed to 500 characters. The query string is dropped, so a token in the referring URL is not stored.

All of those fields are optional. The key in `app.js` is the publishable key. It can only add an email: row-level security allows insert only, so nobody can read, change or delete the list from the browser. The database itself rejects bad emails and duplicates.

If `utm_medium`, `utm_campaign`, or `referrer` are not columns yet, PostgREST answers `PGRST204` (or Postgres `42703`). The form drops the missing column and tries again, so the email still saves. `utm_source` and `utm_content` are not dropped; those columns are already there.

To see sign-ups, open that project in the Supabase dashboard, then Table Editor → `waitlist`.

The headline is “All clear.”

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

Existing insert policies cover the new columns. Nothing else has to change in the dashboard.

## Homepage slots

Founder’s pricing is the section “Launch prices won’t go back down.” Early access is Regular $199 / Student $69. At launch it is Regular $299 / Student $99. There is no buy button.

The refusal demo is `#boundary`, “It asks before it acts.” The slot is a still of a refused invite. A video or GIF can replace `.refusal`. The comment above that slot shows where.

`/rename` is “Codename Jarvis is now Chiefly.” The footer links to it. It is not in the hero.

`/paper` is a coming-soon page for the philosophy paper, which is with a professor for review. Its form is tagged `utm_content=paper`.

## At launch

Change the "Join the waitlist" buttons and the nav pill to "Download", and point them at the installer.

## Check it locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.
