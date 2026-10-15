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

## Friend download

Invited friends get the test build at `/get/caeb84fe6ae6b7770dd364de7bdfa645/`. Nothing else on the site links there. `robots.txt` skips the whole `/get/` folder, so the full address is not published in that file. The page also asks crawlers not to index it.

Each friend gets a different code. `get/caeb84fe6ae6b7770dd364de7bdfa645/gate.js` stores only the SHA-256 of a code, never the code itself. The page drops capital letters, spaces, and hyphens, then hashes what is left.

### Add a friend

1. Make a 16-character code from `abcdefghjkmnpqrstuvwxyz23456789` (no `i`, `l`, `o`, `0`, or `1`). Keep it that long: the hash is in this public repo, and a short code can be guessed from it. You can send the code in groups of four, with hyphens.
2. Hash the 16 characters only, lowercase, UTF-8, with no extra newline.
3. Add that hash as one new line in `CODE_HASHES`.
4. Push to `main`.
5. Send that friend the page address and their code. Do not commit the code.

PowerShell, to make a code and its hash:

```powershell
$alphabet = "abcdefghjkmnpqrstuvwxyz23456789".ToCharArray()
$bytes = New-Object byte[] 16
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$code = -join ($bytes | ForEach-Object { $alphabet[$_ % $alphabet.Length] })
$sha = [Security.Cryptography.SHA256]::Create()
$hash = -join ($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($code)) | ForEach-Object { $_.ToString("x2") })
$grouped = $code -replace '(.{4})(?!$)', '$1-'
"$grouped"
$hash
```

Mac or Linux, if you already have the 16 characters:

```sh
printf '%s' 'abcdefghjkmnpqrs' | shasum -a 256
```

That string is a stand-in. Hash the real 16 characters the same way.

### Revoke one friend

1. Open `get/caeb84fe6ae6b7770dd364de7bdfa645/gate.js`.
2. Delete that friend's hash line. Leave every other line as it is.
3. Push to `main`.

That code stops working when GitHub Pages finishes updating. Everyone else's code still works. A copy they already saved stays on their computer. To take the file itself down, change the storage address below and push.

### Where the file lives

The installer is not in this repo. Upload it to object storage at a long random address, then set `DOWNLOAD_URL` in `gate.js` to that address. Cloudflare R2 fits: listing turned off, object key a long random string. This page is the only place that links to it.

Uploading a new build to the same address does not need a site change. To cut off an old link, upload to a new key, change `DOWNLOAD_URL`, and push.

Pulling a release into the site at deploy time would add a build this repo does not have, and would publish the installer on chieflyos.com. Storage keeps the file off the site. The tradeoff is that `DOWNLOAD_URL` sits in `gate.js`, so anyone who can read this repository can see it.

The three hashes already in the file are samples. Replace them before you invite people. The check runs in the browser. It keeps someone who only opens the page from downloading. It does not stop someone who reads the page source or this repository. If you later need a real check, a small server can take the code and hand back a short-lived download link, and the page would no longer contain the file address.

## At launch

Change the "Join the waitlist" buttons and the nav pill to "Download", and point them at the installer.

## Check it locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.
