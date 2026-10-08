# chieflyos.com

The waitlist page for **Jarvis by Chiefly**. Plain HTML, CSS and JavaScript: no framework, no build step, no trackers, no third-party requests. GitHub Pages serves it from `main`.

## Files

- `index.html`: all the copy.
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

## At launch

Change the two "Join the waitlist" buttons and the nav pill to "Download", and point them at the installer.

## Check it locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.
