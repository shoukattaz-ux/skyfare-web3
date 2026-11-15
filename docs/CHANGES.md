# Change list (relative to baseline commit `8210aaa`)

Generated groups below; run `git diff --name-status 8210aaa` for the exact list.

## Server
| File | Change |
|---|---|
| `server.ts` | Rewritten: server-rendered content snapshot, real 404 + noindex, DB-driven sitemap, honest `ads.txt`, `robots.txt`, AdSense meta tag, embedded bootstrap, compression, security/cache headers, `TRUST_PROXY`, upload CSP, JSON error handler. |
| `server/db.ts` | New tables (`authors`, `guide_revisions`, `article_feedback`, `legal_pages_backup`), new columns (review/schedule/checklist, ad size), one-time non-destructive content migration, no default passwords, scheduled-publish filtering, `buildBootstrap()`. |
| `server/routes.ts` | Role enforcement; editorial workflow + revisions + restore; authors; feedback endpoint; validated ads/settings/legal; media upload hardening (no SVG, magic bytes, alt text); URL validation; user PATCH/last-admin protection; change-password; login throttling; fuller backup/restore; email sign-ups gated by setting. |
| `server/security.ts` | `cleanText`, `safeUrl`, safe cookie parsing, rate-bucket cleanup. |
| `server/legalSeed.ts` (new) | Truthful default texts for About, Editorial, Corrections, Privacy, Cookie, Terms, Disclosure, Disclaimer. |
| `server/snapshot.ts` (new) | Semantic HTML snapshot for crawlers/no-JS. |

## Front end
| File | Change |
|---|---|
| `src/App.tsx` | Consent-gated GA4 and analytics, boot data, lazy admin, new routes, skip link, config context, single JSON-LD tag. |
| `src/lib/consent.ts`, `ads.ts`, `siteConfig.tsx`, `markdown.ts`, `guideStats.ts` (new) | Consent store; ad script loaders + page rules; shared config; safe markdown; real word counts. |
| `src/lib/seo.ts` | DB-aware SEO, `found`/`noindex`, no `Offer` markup, new pages, breadcrumbs. |
| `src/lib/images.ts` | WebP renditions + honest alt text. |
| `src/components/AdSlots.tsx` | Replaced placeholders with a gated, labelled, CLS-safe slot; `RelatedGuides`. |
| `src/components/Link.tsx` (new) | Real `<a href>` with SPA navigation. |
| `src/components/CookieConsent.tsx` | Rebuilt: all optional OFF, equal buttons, accessible dialog. |
| `src/components/DealCard.tsx`, `DealsExplorer.tsx`, `SavedDealsDrawer.tsx` | Dated snapshots; removed countdown, strike-through, "% off", sort by discount. |
| `src/components/Header.tsx`, `Footer.tsx` | Real links; policies in footer; no invented company info; alerts hidden when disabled. |
| `src/pages/HomePage.tsx` | Removed testimonials / subscriber claim / feed claims; honest copy; WebP hero. |
| `src/pages/LegalPages.tsx` | Replaced six hard-coded pages with one CMS-driven page; honest Contact; Sitemap; 404. |
| `src/pages/GuidesPage.tsx`, `DestinationPage.tsx`, `AirlinePage.tsx`, `SearchPage.tsx` | Byline/review badge, feedback control, no sponsored widget, alt text, contrast, accessible tables. |
| `src/pages/AdminPage.tsx` | Wired new panels; alt-text uploads; role/disable controls; change-password; identity & email settings; removed dead code. |
| `src/pages/admin/GuideEditor.tsx`, `MonetizationPanel.tsx`, `AuthorsPanel.tsx` (new) | Editorial workflow; ad settings with readiness; real authors only. |
| `src/types/flight.ts`, `src/data/guides.ts` | Types; neutral bylines, removed unsupported claims. |

## Build / config / docs / tests
`package.json` (+`package-lock.json`, `bun.lock` removed), `vite.config.ts` (service worker), `index.html`, `.gitignore`, `.env.example`, `README.md`, `public/og-default.jpg`, `src/assets/images/*.webp` (new), `design-assets/original/*.jpg` (moved originals), `dev-dist/` (removed), `docs/`, `tests/smoke.test.mjs`, `tests/browser-qa.mjs`, `tests/admin-qa.mjs`, `tests/a11y.mjs`, `tests/perf.mjs`.

## Raw list
```
M  .env.example
M  .gitignore
M  README.md
D  bun.lock
R100  src/assets/images/dest_cancun_turquoise_1794654948466.jpg	design-assets/original/dest_cancun_turquoise_1794654948466.jpg
R100  src/assets/images/dest_nyc_skyline_1794654946629.jpg	design-assets/original/dest_nyc_skyline_1794654946629.jpg
R100  src/assets/images/dest_paris_morning_1794654949801.jpg	design-assets/original/dest_paris_morning_1794654949801.jpg
R100  src/assets/images/dest_tokyo_twilight_1794654947914.jpg	design-assets/original/dest_tokyo_twilight_1794654947914.jpg
R100  src/assets/images/guide_terminal_sunrise_1794654949193.jpg	design-assets/original/guide_terminal_sunrise_1794654949193.jpg
R100  src/assets/images/hero_aviation_golden_1794654946988.jpg	design-assets/original/hero_aviation_golden_1794654946988.jpg
D  dev-dist/sw.js
D  dev-dist/workbox-afac4cd2.js
A  docs/AUDIT_REPORT.md
M  index.html
A  package-lock.json
M  package.json
A  public/og-default.jpg
M  server.ts
M  server/db.ts
A  server/legalSeed.ts
M  server/routes.ts
M  server/security.ts
A  server/snapshot.ts
M  src/App.tsx
A  src/assets/images/cancun-1280.webp
A  src/assets/images/cancun-720.webp
A  src/assets/images/hero-1280.webp
A  src/assets/images/hero-720.webp
A  src/assets/images/nyc-1280.webp
A  src/assets/images/nyc-720.webp
A  src/assets/images/paris-1280.webp
A  src/assets/images/paris-720.webp
A  src/assets/images/terminal-1280.webp
A  src/assets/images/terminal-720.webp
A  src/assets/images/tokyo-1280.webp
A  src/assets/images/tokyo-720.webp
M  src/components/AdSlots.tsx
M  src/components/CookieConsent.tsx
M  src/components/DealCard.tsx
M  src/components/DealsExplorer.tsx
M  src/components/FlightSearchBar.tsx
M  src/components/Footer.tsx
M  src/components/Header.tsx
A  src/components/Link.tsx
M  src/components/PWAControls.tsx
M  src/components/PriceAlertModal.tsx
M  src/components/SavedDealsDrawer.tsx
M  src/data/guides.ts
A  src/lib/ads.ts
A  src/lib/consent.ts
A  src/lib/guideStats.ts
M  src/lib/images.ts
A  src/lib/markdown.ts
M  src/lib/seo.ts
A  src/lib/siteConfig.tsx
M  src/pages/AdminPage.tsx
M  src/pages/AirlinePage.tsx
M  src/pages/DestinationPage.tsx
M  src/pages/GuidesPage.tsx
M  src/pages/HomePage.tsx
M  src/pages/LegalPages.tsx
M  src/pages/SearchPage.tsx
A  src/pages/admin/AuthorsPanel.tsx
A  src/pages/admin/GuideEditor.tsx
A  src/pages/admin/MonetizationPanel.tsx
M  src/types/flight.ts
A  tests/a11y.mjs
A  tests/admin-qa.mjs
A  tests/browser-qa.mjs
A  tests/perf.mjs
A  tests/smoke.test.mjs
M  vite.config.ts
```
