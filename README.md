# chieflyos.com

The waitlist page for **Chiefly**. Plain HTML, CSS and JavaScript: no framework, no build step, no trackers, no third-party requests. GitHub Pages serves it from `main`.

## Files

- `index.html`: all the copy.
- `llms.txt`: a short description for answer engines. Outcomes only.
- `styles.css`: the look (colours and easing at the top).
- `app.js`: the mark, the scroll effects and the sign-up form.
- `boot.js`: decides whether to play the start-up screen (first visit per browser session, never with reduced motion).
- `img/`: the C mark (`chiefly-mark.svg`) and favicons. The share image is `og-card.png` (1200×630) at the site root.
- `sitemap.xml`: the public page. `robots.txt` points at it.
- `fonts/`: Inter (SIL Open Font License, `OFL.txt`), served from this site.
- `CNAME`: the custom domain.

## Sign-ups

The form posts `{ email, source }` to the `waitlist` table in the Supabase project `lvypvstiaqwjtprhjmdo`. `source` is `hero` or `final`, for which form they used. If the page URL has `utm_source` or `utm_content`, those are saved on the same row. They are optional. The key in `app.js` is the publishable key. It can only add an email: row-level security allows insert only, so nobody can read, change or delete the list from the browser. The database itself rejects bad emails and duplicates.

To see sign-ups, open that project in the Supabase dashboard, then Table Editor → `waitlist`.

The headline is “All clear.”

## At launch

Change the two "Join the waitlist" buttons and the nav pill to "Download", and point them at the installer.

## Check it locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.
