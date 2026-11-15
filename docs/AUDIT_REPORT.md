# SkyFare: Monetization-Readiness Audit and Remediation Report

Scope: the existing project in `skyfare.zip` (React/Vite front end, Express + SQLite back end, built-in CMS). It was **not** rebuilt:
design, routes, data model and admin were kept and corrected in place. The untouched original is preserved three ways:
`skyfare.zip`, git commit `8210aaa` ("Baseline"), and `design-assets/original/` (the original JPEGs).

Status labels: **PASS** verified by a test I ran · **FIXED** found and corrected, then verified · **NEEDS ATTENTION** needs more work
(often by a human) · **NOT APPLICABLE** · **NOT VERIFIED** could not be confirmed here.

> Nothing here guarantees approval by Google AdSense or Media.net. Both decide on their own review, using content quality,
> originality and real traffic, which no code change can supply. See Section 6.

---

## 1. Overall result

The site is technically sound and policy-ready **as infrastructure**, but **not yet ready to apply**, for two reasons that only a person can fix:
(1) 13 of 15 guides were far too thin to publish, and (2) the identity/ownership details a reviewer expects are not yet filled in.
Everything that code can do is done and tested.

| Area | Before | After |
|---|---|---|
| Invented trust claims (LLC, address, 3 staff personas, 3 testimonials, "42,000+ travelers", "hand-verified", "real-time feeds") | present on home, About, Footer, Contact, Privacy, SEO data | removed everywhere (**FIXED**, tested) |
| Fake ad placeholders shown to every visitor | yes | none: nothing renders unless fully configured (**FIXED**) |
| Consent | pre-ticked, GA4 loaded before any choice | explicit opt-in, nothing loads first (**FIXED**) |
| Public default admin passwords | `SkyFareAdmin2026!` in source | none; legacy defaults auto-disabled (**FIXED**) |
| Unknown URL | HTTP 200 shell | real 404 + `noindex` (**FIXED**) |
| Mobile LCP (throttled), home | 12.4 s | 2.5 s |
| Transfer, home / guide | 3,316 KB / 1,602 KB | 513 KB / 390 KB |
| WCAG A/AA violations (axe-core) | not measured | 0 (12 pages × desktop/mobile × light/dark) |

---

## 2. Findings and what was done

### CRITICAL (must fix before applying)

| # | Finding | Status |
|---|---|---|
| C1 | **Fabricated identity and trust signals**: "SkyFare Media LLC", a San Francisco street address, three named staff with job histories (Elena Vance, Marcus Thorne, Claire Lindqvist), three named testimonials, "42,000+ US travelers", "hand-verified", "accredited data partners Amadeus/Skyscanner/Expedia", "our San Francisco desk responds in 1 business day". None could be substantiated by the code. | **FIXED.** Removed from UI, seed data, SEO/JSON-LD and the database (migration). Owner name/address/email are now settings and show only if filled in. Old text is backed up (`legal_pages_backup`, `guide_revisions`). |
| C2 | **Thin content presented as long-form**: 12 of 15 guides contain 60-150 words (declared 740-1,280). Destination pages hold 50-90 words of prose. | **FIXED (gate) / NEEDS ATTENTION (content).** Real word counts now computed. Guides under 300 words moved to *Draft / Needs revision* (nothing deleted; snapshot kept). 2 guides remain public (545 and 303 words). The 13 need human research and expansion; **I did not pad them.** |
| C3 | **Fake urgency and pricing**: countdown computed from a hard-coded "now" (`2026-11-14T11:15Z`), "% off usual fare" and struck-through prices with no source, "Last verified: Nov 14, 2026 9:00 AM" hard-coded, `provider: 'amadeus-live-hybrid'` reported just because an env var existed. | **FIXED.** Cards show *"Recorded <date>"* and flag when the listed window has passed. Strike-through/discount badges and "biggest discount" sort removed. No live feed is claimed anywhere. |
| C4 | **Fake ad boxes** ("Advertisement · Google AdSense · Reserved 728×90 container") rendered to all visitors, no real ad code existed; Revcontent "Sponsored & Native" widget that was really internal links. | **FIXED.** Single `AdSlot` implementation; see Section 5. Revcontent removed. |
| C5 | **Newsletter / price alerts collected emails and promised "every Tuesday and Friday"** but nothing sends email. | **FIXED.** Behind an admin switch (`emailAlertsEnabled`, default OFF). While off, the UI is hidden and the API returns 503. |
| C6 | **Consent defects**: analytics and ad boxes pre-ticked, GA4 loaded when no choice was stored, "Accept" more prominent than reject. | **FIXED.** v2 consent store, all optional items OFF, equal-weight Accept/Decline, nothing loads before a choice, withdraw any time. |
| C7 | **Public default admin credentials** committed in source (`admin@skyfareusa.com / SkyFareAdmin2026!`, editor equivalent). | **FIXED.** No defaults. First admin from env or a one-time random password. On existing DBs, accounts still using the public defaults are disabled automatically. |
| C8 | **Legal pages**: contradictory (hard-coded JSX *plus* CMS text), claimed things that were false, missing Editorial and Corrections policies. | **FIXED.** Truthful rewrites; fully CMS-driven; Editorial Policy and Corrections Policy added. Needs legal review (M-list). |

### HIGH

| # | Finding | Status |
|---|---|---|
| H1 | Guide editor **destroyed section structure on edit** (flattened all sections, dropped bullets/tables). | **FIXED.** New editor preserves sections/bullets/tables. |
| H2 | **No role enforcement**: any logged-in user (including read-only analyst) could change deals, guides, ads, legal pages, settings. | **FIXED + tested.** analyst = read-only; editor = content only; admin = settings/ads/legal/users/backup. |
| H3 | Navigation was `<button onClick>` (69 places): no `href`, not crawlable, no open-in-new-tab. | **FIXED.** Real `<a href>` that still navigates without reload. |
| H4 | HTML shell was empty (`<div id=root>`): crawlers saw no content without running JS. | **FIXED.** Guides, policies, lists get server-rendered content. |
| H5 | Stored XSS paths: SVG uploads served from the site origin; `javascript:` accepted in booking/image URLs. | **FIXED + tested.** SVG rejected, magic-byte check, uploads served with a locked-down CSP; only http(s) URLs. |
| H6 | `sitemap.xml` listed deleted/draft guides and used a hard-coded `lastmod`; `ads.txt` emitted fake IDs (`pub-0000000000000000`, `revcontent.com, 00000`). | **FIXED + tested.** DB-driven sitemap with real dates; ads.txt lists only configured sellers. |
| H7 | Misleading structured data: `Offer` (InStock, validThrough) for static fares, SearchAction pointing at a non-search URL, duplicate JSON-LD (server + client). | **FIXED.** Offer markup removed, one JSON-LD tag per page. |
| H8 | Service worker served a cached shell for every navigation (including `/sitemap.xml`, `/ads.txt`), causing layout shift (CLS 0.5) and hiding 404s. | **FIXED.** Network-first navigation, exclusions added; CLS 0.000. |
| H9 | Images 0.6-1.0 MB each, hero not optimised. | **FIXED.** WebP 720/1280 (5.4 MB → 1.0 MB total), dimensions set, lazy loading. |
| H10 | Rate limiting trusted nothing/everything (no `trust proxy` control), unbounded analytics inserts. | **FIXED.** `TRUST_PROXY` env, analytics rate-limited and path-validated. |

### MEDIUM

| # | Finding | Status |
|---|---|---|
| M1 | White text on `orange-600` and `sky-600` below WCAG AA contrast; `dl` markup invalid; table scroller not keyboard-reachable; form labels not linked. | **FIXED**, axe-core 0 violations. |
| M2 | Math "3 + 4" captcha checked only in the browser. | **FIXED** (removed; honeypot + server rate limit remain). |
| M3 | No `og:image`, `og:type` duplicated, no noindex for admin/search/404. | **FIXED.** |
| M4 | `npm install` failed (`esbuild` peer conflict); unused `@google/genai`; `start` script could not run TS on older Node. | **FIXED.** |
| M5 | `devOptions.enabled: true` registered a service worker in dev; `dev-dist/` committed. | **FIXED.** |
| M6 | Backup "restore" only restored deals + settings. | **FIXED.** Also guides, categories, legal pages, authors. |
| M7 | Password minimum 8; no change-password; no way to disable/change role. | **FIXED.** 12+ chars, change-password, role/disable, last-admin protected. |

### LOW / not changed
- Dev-only audit findings in `vite-plugin-pwa → workbox-build` (deepmerge/glob/minimatch). Not shipped; `npm audit --omit=dev` = 0. **NEEDS ATTENTION (optional).**
- No Content-Security-Policy header (it must be tuned once real ad networks are enabled). **NEEDS ATTENTION.**
- Custom illustrations, animated sections, calculators and reader **comments** were **not** added: the existing identity was kept, and comments would need ongoing moderation. Helpful/Not-helpful feedback, share buttons and a working contact form exist.

---

## 3. Elements removed
Testimonials block; "42,000+" claim; staff bios; LLC/address; "Data partners: Amadeus, Travelpayouts…" strapline; fake ad placeholders; Revcontent widget, slot, setting and ads.txt line; countdown timers; strike-through prices and "% off"; "Last verified" stamp; SVG uploads; math captcha; pre-ticked consent; default admin/editor accounts; `@google/genai` dependency; `dev-dist/`; the original 1 MB JPEGs from the bundle (kept in `design-assets/original/`).
Preserved/backed up rather than deleted: old legal text → `legal_pages_backup`; edited/demoted guides and every deleted guide → `guide_revisions`.

## 4. Features added
Editorial workflow (Draft → Pending review → Needs revision → Reviewed → Published) with a 9-point quality checklist that must be fully ticked to mark *Reviewed*; publishing requires Reviewed and ≥300 words; scheduled publishing; revision history with restore; section-preserving editor; SEO preview; author management (nothing pre-filled); "Reviewed by a person on <date>" shown to readers only after a real review; helpful/not-helpful feedback with admin counts; Editorial Policy and Corrections Policy pages; CMS-driven legal pages with automatic backups; real `404`; noindex rules; server-rendered content snapshot; embedded bootstrap data; AdSense ownership meta tag; DB-driven sitemap/robots/ads.txt; master ad switch + readiness checklist; role management, change-password; media alt-text required; skip link; keyboard-operable consent dialog (Esc to close, focus handling).

## 5. Advertising infrastructure (AdSense + Media.net)
Off by default. An ad box appears **only if all hold**: master switch on · placement active with an ad unit · network ID configured · visitor accepted advertising cookies · page is the guides index or an article. Never on home, fare lists, destination/airline pages, search, contact, legal, admin, 404. Boxes are labelled "Advertisement", reserve their height (no layout shift), and disappear if the script is blocked or fails (tested with the request aborted: article still renders, no empty box). Verified at the browser level: no ad request before consent, none after decline, script loads with the configured publisher ID after opt-in. Admin fields are validated (`pub-` + digits etc.).

## 6. AdSense / Media.net readiness checklists

| Item | Status |
|---|---|
| Privacy, Cookie, Terms, Disclaimer, Affiliate/Ad disclosure, About, Contact, Editorial, Corrections reachable from footer | **PASS** (browser-tested) |
| Working contact method | **PASS** (form stores to admin inbox; email shown once you enter a mailbox you read). **NEEDS ATTENTION:** enter and verify that mailbox. |
| Consent before ads/analytics | **PASS** |
| Google-certified CMP (TCF) for EEA/UK/Swiss traffic | **NEEDS ATTENTION**: AdSense requires one for those visitors; this built-in banner is not certified. Add Google's Privacy & messaging or another certified CMP before enabling ads. |
| ads.txt | **PASS** (reflects saved IDs). Becomes meaningful only after you enter real IDs. |
| AdSense site verification | **PASS** (meta tag emitted when the publisher ID is saved) |
| Original, substantial content | **NEEDS ATTENTION** (C2): 2 guides live; ~13 to expand. Destination/airline pages also thin. |
| Real traffic, domain age, ownership info | **NEEDS ATTENTION / NOT VERIFIED**: outside the code. |
| No pop-ups, forced redirects, deceptive buttons | **PASS** (none present; buttons relabelled "View fare on partner site") |
| Layout stable with ads | **PASS** (CLS 0.000 on guide page with fixed-height container; **NOT VERIFIED** with a live ad creative) |
| Media.net loader/tag format | **NOT VERIFIED**: implemented from the public tag pattern; Media.net issues the account-specific code only after approval. Compare before enabling. Check its current eligibility rules (traffic geography, content). |
| Live ads rendering | **NOT VERIFIED**: no publisher account here; tested with the script stubbed. |

## 7. Remaining manual tasks (owner)
1. **Identity** (Admin → SEO & Legal): publisher/operator name, optional postal address, a contact mailbox you actually read. The seeded `support@skyfareusa.com` was written by the original build; confirm it exists or replace it.
2. **Guides**: research, expand (aim well beyond 300 words), source and fact-check the 13 drafts, then run them through the checklist. Also fact-check the 2 live ones: the seed text contains unsourced figures (e.g. "$55-$180" savings table, "$350+ per traveler", baggage rules that change often).
3. **Fares**: there is no live feed. Either integrate a real data source or keep curating by hand with dates. Remove expired ones. `partnerName` values don't always match the link domain (several "Amadeus Partner" entries link to Skyscanner). Confirm you are enrolled in each affiliate programme; only the Aviasales links carry a tracking marker.
4. **Destination (12) and airline pages**: ~50-90 words of unique text each; expand or consolidate.
5. **Images**: confirm you have the rights to the six images (provenance isn't recorded) and add credits if required.
6. **Legal review** of the policy texts for your jurisdiction (e.g. governing law, children's data, retention periods were deliberately not invented).
7. **Deploy**: HTTPS, `APP_URL`, `TRUST_PROXY=1` behind a proxy, backups of `data/` and `uploads/`, change the generated admin password. Consider a CSP once ad networks are chosen.
8. **Search Console**: enter the verification code in Admin, submit `/sitemap.xml`.
9. **Email**: if you want the newsletter/price alerts, connect a real sender with double opt-in and unsubscribe, then flip the admin switch.
10. Apply to AdSense/Media.net only after 1-5 are done; then enter IDs, ad units, and switch ads on.

## 8. Testing performed (all against a production build, Chromium)
| Suite | Result |
|---|---|
| `npm run lint` (tsc) | clean |
| `tests/smoke.test.mjs` (API, SEO, roles, CSRF, workflow, throttle, uploads, XSS inputs) | 13/13 pass |
| `tests/browser-qa.mjs` (19 URLs × desktop/tablet/mobile: status, h1/main, overflow, alt/labels, JSON-LD, canonical, removed-claims, no ad placeholders, console errors, failed requests, consent flow, CLS, 40 internal links, SPA nav) | 592/592 pass |
| `tests/admin-qa.mjs` (login, editorial workflow, revisions, ad validation, ads rendering rules, blocked script, settings, contact form, email-toggle) | 41/41 pass |
| `tests/a11y.mjs` (axe-core, WCAG 2.0/2.1 A+AA) | 0 violations |
| `tests/perf.mjs` (Pixel 5, 1.6 Mbps/150 ms, 4× CPU, median of 3) | table in Section 1 |
| `npm audit --omit=dev` | 0 vulnerabilities |
| Migration from a database created by the original code | verified: defaults disabled, legal text backed up, 13 guides demoted with snapshots, Revcontent slot removed, settings migrated |

**Not tested:** Safari/Firefox/real devices; Lighthouse; a live deployment's headers; a live AdSense/Media.net account; real email delivery; outbound affiliate links.

## 9. Known limitations
Server-rendered snapshot covers the main routes (not every dynamic view). Rate limits are in-memory and per process; SQLite suits a single instance. Destination/airline copy lives in code, not the CMS. The consent banner is not a certified CMP. One lockfile (`package-lock.json`) replaces the stale `bun.lock`.

## 10. Files changed
See `docs/CHANGES.md` (generated from git).
