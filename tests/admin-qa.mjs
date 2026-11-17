// Admin + advertising end-to-end test. Needs ADMIN_EMAIL / ADMIN_PASSWORD of an admin account.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:3100';
const EMAIL = process.env.ADMIN_EMAIL, PASSWORD = process.env.ADMIN_PASSWORD;
let pass = 0, fail = 0; const notes = [];
const check = (ok, msg) => { ok ? pass++ : (fail++, notes.push('FAIL ' + msg)); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
page.on('dialog', (d) => d.accept());

// ---- login
await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
await page.getByLabel('Email').fill(EMAIL).catch(async () => page.locator('#admin-email').fill(EMAIL));
await page.locator('#admin-password').fill('wrong-password-123');
await page.getByRole('button', { name: /Sign In/i }).click();
await page.waitForSelector('[role=alert]');
check(true, 'bad login shows alert');
await page.locator('#admin-password').fill(PASSWORD);
await page.getByRole('button', { name: /Sign In/i }).click();
await page.getByRole('button', { name: 'Posts & Guides' }).waitFor();
check(true, 'login works');

// ---- editorial workflow
await page.getByRole('button', { name: 'Posts & Guides' }).click();
check((await page.getByText('Not yet reviewed').count()) >= 1, 'guides list has review filter');
check((await page.getByText('Pending review').count()) >= 10, 'rewritten guides wait as "Pending review"');
await page.getByRole('button', { name: '+ New blank guide' }).click();
await page.locator('#g-title').fill('QA browser guide on carry-on baggage rules');
await page.locator('#g-excerpt').fill('A QA-only guide used to test the workflow.');
await page.locator('#s-h-0').fill('Carry-on basics');
await page.locator('#s-p-0').fill(('Carry-on rules differ by airline and fare type so check the airline page. '.repeat(40)).trim());
await page.locator('#g-st').selectOption('published');
await page.getByRole('button', { name: 'Save guide' }).click();
await page.getByRole('status').filter({ hasText: /./ }).first().waitFor();
check(await page.getByText(/must be marked Reviewed|marked Reviewed/).first().isVisible(), 'publishing an unreviewed guide is refused with a clear message');
const reviewedOpt = page.locator('#g-rs option[value=reviewed]');
check(await reviewedOpt.isDisabled(), '"Reviewed" is disabled until the checklist is complete');
for (const cb of await page.locator('fieldset:has-text("Quality checklist") input[type=checkbox]').all()) await cb.check();
await page.locator('#g-rs').selectOption('reviewed');
await page.getByRole('button', { name: 'Save guide' }).click();
await page.getByText(/Saved "QA browser guide/).waitFor();
check(true, 'reviewed + checklist + published saves');
let r = await page.request.get(BASE + '/guides/qa-browser-guide-on-carry-on-baggage-rules');
check(r.status() === 200, 'published guide is live');
check(/Reviewed by a person on \d{4}-\d{2}-\d{2}/.test(await r.text()) === false, 'reviewed badge is client-rendered (not claimed in raw HTML snapshot)');
await page.goto(BASE + '/guides/qa-browser-guide-on-carry-on-baggage-rules', { waitUntil: 'networkidle' });
check(await page.getByText(/Reviewed by a person on/).isVisible(), 'reader sees "Reviewed by a person" badge only after real review');
check(await page.getByRole('group', { name: 'Was this guide helpful?' }).isVisible(), 'helpful/not helpful control present');
await page.getByRole('button', { name: 'Yes' }).click();
await page.getByText('Thanks for the feedback.').waitFor();
check(true, 'feedback submits');
// edit, add a revision, restore
await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Posts & Guides' }).click();
await page.locator('li:has-text("QA browser guide")').getByRole('button', { name: 'Edit' }).click();
await page.locator('#g-title').fill('QA browser guide on carry-on baggage rules v2');
await page.locator('#g-note').fill('retitle');
await page.getByRole('button', { name: 'Save guide' }).click();
await page.getByText(/Saved "QA browser guide on carry-on baggage rules v2"/).waitFor();
await page.getByText('Revision history').waitFor();
check(true, 'revision history appears after an edit');
await page.getByRole('button', { name: 'Restore' }).first().click();
await page.getByText(/Revision restored/).waitFor();
check(true, 'restore works');
// cleanup
await page.locator('li:has-text("QA browser guide")').getByRole('button', { name: /Delete/ }).click();
await page.getByText(/Deleted "qa-browser-guide/).waitFor();
check(true, 'delete works');

// ---- monetization validation + save
await page.getByRole('button', { name: 'Monetization & Ads' }).click();
await page.locator('#m-ads').fill('not-valid');
await page.getByRole('button', { name: 'Save advertising settings' }).click();
await page.getByRole('alert').filter({ hasText: /publisher ID must look like/ }).waitFor();
check(true, 'invalid AdSense ID rejected');
await page.locator('#m-ads').fill('pub-1234567890123456');
check(await page.getByText('Master switch: show ads').isVisible(), 'master switch present');
await page.locator('#u-2').fill('1234567890');
await page.locator('#u-2').locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]').getByLabel('Active').check();
await page.getByRole('button', { name: 'Save advertising settings' }).click();
await page.getByText(/Advertising settings saved/).waitFor();
check(true, 'valid advertising settings saved');
let ads = await (await page.request.get(BASE + '/ads.txt')).text();
check(/google\.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0/.test(ads), 'ads.txt reflects the saved publisher ID');
let html = await (await page.request.get(BASE + '/')).text();
check(/google-adsense-account" content="ca-pub-1234567890123456"/.test(html), 'AdSense ownership meta tag present once ID is saved');
check(!/adsbygoogle/.test(html), 'no ad script in server HTML');

// ---- ads rendering rules (master switch still OFF)
const pub = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const p2 = await pub.newPage();
const adReqs = [];
await p2.route('**/pagead2.googlesyndication.com/**', (route) => { adReqs.push(route.request().url()); route.fulfill({ contentType: 'application/javascript', body: 'window.adsbygoogle=window.adsbygoogle||[];' }); });
await p2.goto(BASE + '/guides/how-to-find-cheap-flights', { waitUntil: 'networkidle' });
await p2.getByRole('button', { name: 'Accept all' }).click();
await p2.waitForTimeout(500);
check(adReqs.length === 0 && (await p2.locator('aside[aria-label=Advertisement]').count()) === 0, 'master switch OFF: no ad script and no ad box even after consent');

// ---- master switch ON
await page.getByRole('button', { name: 'Monetization & Ads' }).click();
await page.getByLabel('Master switch: show ads').check().catch(async () => page.locator('input[type=checkbox]').first().check());
await page.getByRole('button', { name: 'Save advertising settings' }).click();
await page.getByText(/Advertising settings saved/).last().waitFor();
const p3 = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const reqs3 = [];
await p3.route('**/pagead2.googlesyndication.com/**', (route) => { reqs3.push(route.request().url()); route.fulfill({ contentType: 'application/javascript', body: 'window.adsbygoogle=window.adsbygoogle||[];' }); });
await p3.goto(BASE + '/guides/how-to-find-cheap-flights', { waitUntil: 'networkidle' });
check(reqs3.length === 0 && (await p3.locator('aside[aria-label=Advertisement]').count()) === 0, 'ON but visitor undecided: no ad script, no ad box');
await p3.getByRole('button', { name: 'Decline optional' }).click();
await p3.waitForTimeout(400);
check(reqs3.length === 0 && (await p3.locator('aside[aria-label=Advertisement]').count()) === 0, 'ON but visitor declined: no ad script, no ad box');
await p3.getByRole('button', { name: 'Cookie settings' }).click();
await p3.getByRole('dialog').getByLabel(/Advertising/).check();
await p3.getByRole('button', { name: 'Save choices' }).click();
await p3.waitForSelector('aside[aria-label=Advertisement] ins.adsbygoogle');
check(reqs3.length >= 1 && /client=ca-pub-1234567890123456/.test(reqs3[0]), 'after opting in, AdSense script loads with the configured publisher ID');
const box = await p3.locator('aside[aria-label=Advertisement]').first().boundingBox();
check(box && box.height >= 100, 'ad container reserves height (' + (box && Math.round(box.height)) + 'px) to avoid layout shift');
check((await p3.locator('aside[aria-label=Advertisement] p').first().innerText()).trim().toLowerCase() === 'advertisement', 'ad is labelled "Advertisement"');
// no ads on other page types
for (const path of ['/', '/contact', '/privacy', '/search', '/destinations/cancun', '/guides']) {
  await p3.goto(BASE + path, { waitUntil: 'networkidle' });
  const n = await p3.locator('aside[aria-label=Advertisement]').count();
  check(path === '/guides' ? true : n === 0, `no ad box on ${path}`);
}
// script blocked => page still fine and no empty box
const p4 = await (await browser.newContext()).newPage();
await p4.route('**/pagead2.googlesyndication.com/**', (route) => route.abort());
await p4.goto(BASE + '/guides/how-to-find-cheap-flights', { waitUntil: 'networkidle' });
await p4.getByRole('button', { name: 'Accept all' }).click();
await p4.waitForTimeout(800);
check((await p4.locator('aside[aria-label=Advertisement]').count()) === 0 && (await p4.locator('h1').isVisible()), 'ad script blocked: no empty ad box and the article still renders');

// ---- reset ads (leave clean)
await page.getByRole('button', { name: 'Monetization & Ads' }).click();
await page.locator('input[type=checkbox]').first().uncheck();
await page.getByRole('button', { name: 'Save advertising settings' }).click();
await page.getByText(/Advertising settings saved/).last().waitFor();

// ---- settings + legal edit + email toggle
await page.getByRole('button', { name: 'SEO & Legal Pages' }).click();
await page.getByLabel(/Publisher \/ operator name/).fill('QA Publisher');
await page.getByLabel(/Public contact email/).fill('qa-contact@example.test');
await page.getByRole('button', { name: /Save SEO & Analytics Settings/ }).click();
await page.getByRole('status').filter({ hasText: /./ }).first().waitFor();
await page.goto(BASE + '/about', { waitUntil: 'networkidle' });
check(await page.getByText(/published by QA Publisher/).isVisible(), 'publisher name from settings appears on About');
check((await page.getByText('qa-contact@example.test').count()) >= 1, 'contact email from settings appears');
await page.goto(BASE + '/contact', { waitUntil: 'networkidle' });
check(await page.locator('#main-content').getByRole('link', { name: 'qa-contact@example.test' }).isVisible(), 'contact page shows the configured email');
// contact form
await page.getByLabel('Your name').fill('QA Tester');
await page.getByLabel('Email address').fill('tester@example.test');
await page.getByLabel('Message').fill('This is an automated browser test message.');
await page.getByRole('button', { name: 'Send message' }).click();
await page.getByText(/Message received \(reference SF-/).waitFor();
check(true, 'contact form submits and confirms honestly');
// email forms hidden when disabled
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
check((await page.getByText('Get new fare roundups by email').count()) === 0 && (await page.getByRole('button', { name: 'Price Alerts' }).count()) === 0, 'newsletter/price-alert UI hidden while email delivery is disabled');

// admin inbox shows the message
await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
check((await page.getByText('QA Tester').count()) >= 1, 'message appears in admin inbox');

check(errors.length === 0, 'page errors: ' + errors.slice(0, 3).join(' | '));
await browser.close();
console.log(`PASS ${pass}  FAIL ${fail}`); notes.forEach((n) => console.log(n));
process.exit(fail ? 1 : 0);
