# chieflyos.com

The waitlist page for **Jarvis by Chiefly**. Plain HTML, CSS and JavaScript: no framework, no build step, no trackers, no third-party requests. GitHub Pages serves it from `main`.

## Files

- `index.html`: all the copy.
- `styles.css`: the look (colours and easing at the top).
- `app.js`: the reactor, the scroll effects and the sign-up form.
- `boot.js`: decides whether to play the start-up screen (first visit per browser session, never with reduced motion).
- `img/`: logo, favicon and the share image (`og.png`, 1200×630).
- `fonts/`: Inter (SIL Open Font License, `OFL.txt`), served from this site.
- `CNAME`: the custom domain.

## Sign-ups

The form posts to the `waitlist` table in the Lovable Cloud project "Chiefly Waitlist". The key in `app.js` is the publishable key. It can only add an email: row-level security allows insert only, so nobody can read, change or delete the list from the browser. The database itself rejects bad emails and duplicates.

To see sign-ups, open the Lovable project, then Cloud → Database → `waitlist`.

## At launch

Change the two "Join the waitlist" buttons and the nav pill to "Download", and point them at the installer.

## Check it locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.
