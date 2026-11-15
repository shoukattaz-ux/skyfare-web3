# SkyFare

An independent publication about flying from US airports: plain-English guides plus a hand-kept list of
**dated example fares**. React + Vite front end, Express + SQLite (`node:sqlite`) back end, with a built-in CMS.

> SkyFare is not a booking engine. Fares are entries an editor records by hand; there is no live fare feed.

## Run

```bash
npm install
cp .env.example .env      # set APP_URL, ADMIN_EMAIL, SUPPORT_EMAIL
npm run dev               # http://localhost:3000   (admin: /admin)
```

On first start the server creates one administrator and prints the password **once** in the log (unless you set
`ADMIN_INITIAL_PASSWORD`, 12+ characters). Change it under Admin > Users & Backups.

Production: `npm run build && npm start` (set `NODE_ENV=production`, `APP_URL`, and `TRUST_PROXY=1` behind one proxy).
Requires Node 22.5+. Data lives in `data/skyfare.db`, uploads in `uploads/` (both git-ignored; back them up).

## Test

```bash
npm run lint
npm run dev &                                   # or start any running instance
ADMIN_EMAIL=... ADMIN_PASSWORD=... BASE_URL=http://localhost:3000 npm test
```

## How things work

- **Pages** are server-rendered into `#root` (guides, policies, lists) so crawlers get real content, then React takes over.
  Unknown URLs return a real `404`; `/admin`, `/search` and 404s are `noindex`.
- **Editorial workflow** (Admin > Posts & Guides): Draft -> Pending review -> Needs revision -> **Reviewed** -> Published.
  Reviewed requires the full quality checklist; publishing requires Reviewed and at least 300 words. Revisions are kept.
- **Advertising** (Admin > Monetization): off by default. Needs master switch + network ID + active unit + visitor consent,
  and only renders on article pages. `/ads.txt` lists only sellers you configured.
- **Legal/trust pages** are stored in the database and editable (Admin > SEO & Legal). Edits are backed up automatically.
- Original upload and the pre-audit images are preserved in `skyfare.zip` and `design-assets/original/`.

See `docs/AUDIT_REPORT.md` for the full audit, what changed, and what still needs a human.
