# chieflyos.com

The waitlist page for **Jarvis by Chiefly**. Plain HTML, CSS and JavaScript: no framework, no build step, no trackers, no third-party requests. GitHub Pages serves it from `main`.

## Files

- `index.html`: all the copy.
- `llms.txt`: a short description for answer engines. Outcomes only.
- `styles.css`: the look (colours and easing at the top).
- `app.js`: the mark, the scroll effects and the sign-up form.
- `boot.js`: decides whether to play the start-up screen (first visit per browser session, never with reduced motion).
- `img/`: logo, favicon and the share image (`og.png`, 1200×630).
- `fonts/`: Inter (SIL Open Font License, `OFL.txt`), served from this site.
- `CNAME`: the custom domain.

## Sign-ups

The form posts to the `waitlist` table in the Supabase project `lvypvstiaqwjtprhjmdo`. The key in `app.js` is the publishable key. It can only add an email: row-level security allows insert only, so nobody can read, change or delete the list from the browser. The database itself rejects bad emails and duplicates.

To see sign-ups, open that project in the Supabase dashboard, then Table Editor → `waitlist`.

The page tries two headlines, half and half, and remembers the choice in this browser (`jarvis-headline`). Add `?headline=1` or `?headline=2` to preview one without saving it. The form still posts `{ email, source }` to the same table. `source` is `hero-1`, `hero-2`, `final-1`, or `final-2`: where they signed up, and which headline they saw.

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

Change the two "Join the waitlist" buttons and the nav pill to "Download", and point them at the installer.

## Check it locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.
