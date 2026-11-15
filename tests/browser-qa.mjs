// Browser QA: console errors, failed requests, third-party calls before consent, CLS, link integrity, a11y basics.
//   BASE_URL=http://localhost:3100 SHOTS=/some/dir node tests/browser-qa.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:3100';
const SHOTS = process.env.SHOTS || '';
const VIEWPORTS = { desktop: { width: 1280, height: 900 }, tablet: { width: 820, height: 1100 }, mobile: { width: 390, height: 844 } };
const PAGES = ['/', '/domestic', '/international', '/guides', '/guides/how-to-find-cheap-flights', '/destinations/cancun', '/airlines/delta', '/search?q=cancun', '/about', '/editorial-policy', '/corrections-policy', '/contact', '/privacy', '/cookie-policy', '/terms', '/affiliate-disclosure', '/disclaimer', '/sitemap', '/does-not-exist'];
const THIRD = /googlesyndication|doubleclick|googletagmanager|google-analytics|media\.net|adservice/i;

const results = { pass: 0, fail: 0, notes: [] };
const check = (ok, msg) => { ok ? results.pass++ : (results.fail++, results.notes.push('FAIL ' + msg)); };

const browser = await chromium.launch();
const internalLinks = new Set();

for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = []; const failed = []; const third = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => failed.push(r.url() + ' ' + (r.failure()?.errorText || '')));
  page.on('request', (r) => { if (THIRD.test(r.url())) third.push(r.url()); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('/does-not-exist') && !r.url().includes('/api/auth/me')) failed.push(r.status() + ' ' + r.url()); });

  for (const p of PAGES) {
    const is404 = p === '/does-not-exist';
    const resp = await page.goto(BASE + p, { waitUntil: 'networkidle' });
    check(resp.status() === (is404 ? 404 : 200), `${vpName} ${p} status ${resp.status()}`);
    // exactly one h1, main landmark, no horizontal overflow
    const info = await page.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      title: document.title,
      canon: document.querySelector('link[rel=canonical]')?.href || '',
      jsonld: document.querySelectorAll('script[type="application/ld+json"]').length,
      imgNoAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
      unlabeled: [...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]),textarea,select')].filter((e) => !e.labels?.length && !e.getAttribute('aria-label') && !e.closest('[aria-hidden=true]')).length,
      text: document.body.innerText.slice(0, 20000),
    }));
    check(info.h1 === 1, `${vpName} ${p} has ${info.h1} <h1>`);
    check(info.main === 1, `${vpName} ${p} has ${info.main} <main>`);
    check(info.overflow <= 1, `${vpName} ${p} horizontal overflow ${info.overflow}px`);
    check(info.imgNoAlt === 0, `${vpName} ${p} ${info.imgNoAlt} images without alt attribute`);
    check(info.unlabeled === 0, `${vpName} ${p} ${info.unlabeled} unlabeled form controls`);
    check(info.jsonld <= 1, `${vpName} ${p} has ${info.jsonld} JSON-LD tags (expect <=1)`);
    if (!is404) check(info.canon.endsWith(p.split('?')[0]) || p === '/', `${vpName} ${p} canonical ${info.canon}`);
    check(!/Elena Vance|Marcus Thorne|Claire Lindqvist|Media LLC|548 Market|42,000|Hannah Morales|Devon Brooks|Patel|hand-verified|Verified US|Revcontent|Sponsored & Native/i.test(info.text), `${vpName} ${p} contains removed fake/unverified claims`);
    check(!/Reserved|CLS-safe|Advertisement ·/i.test(info.text), `${vpName} ${p} shows an ad placeholder`);
    if (vpName === 'desktop') {
      const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
      hrefs.filter((h) => h.startsWith('/') && !h.startsWith('//')).forEach((h) => internalLinks.add(h.split('#')[0].split('?')[0]));
    }
    if (SHOTS && ['/', '/guides/how-to-find-cheap-flights', '/privacy', '/contact', '/about'].includes(p)) {
      await page.screenshot({ path: `${SHOTS}/${vpName}${p === '/' ? '-home' : p.replace(/\//g, '-')}.png`, fullPage: false });
    }
  }

  check(third.length === 0, `${vpName}: third-party ad/analytics requests before any consent: ${third.slice(0, 3).join(', ')}`);
  const realErrors = errors.filter((e) => !/Failed to load resource.*(404)/.test(e));
  check(realErrors.length === 0, `${vpName}: console errors: ${[...new Set(realErrors)].slice(0, 4).join(' | ')}`);
  check(failed.length === 0, `${vpName}: failed requests: ${[...new Set(failed)].slice(0, 4).join(' | ')}`);
  await ctx.close();
}

// Consent flow + CLS (desktop)
{
  const ctx = await browser.newContext({ viewport: VIEWPORTS.desktop });
  const page = await ctx.newPage();
  const third = [];
  page.on('request', (r) => THIRD.test(r.url()) && third.push(r.url()));
  await page.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  await page.goto(BASE + '/guides/how-to-find-cheap-flights', { waitUntil: 'networkidle' });
  const banner = page.getByRole('region', { name: 'Cookie choices' });
  check(await banner.isVisible(), 'cookie banner visible on first visit');
  check((await page.locator('input[type=checkbox]:checked').count()) === 0, 'no pre-ticked consent boxes');
  await page.getByRole('button', { name: 'Choose' }).click();
  const dlg = page.getByRole('dialog');
  await dlg.waitFor({ timeout: 3000 }).catch(() => {});
  check(await dlg.isVisible(), 'preferences dialog opens');
  const boxes = dlg.locator('input[type=checkbox]');
  check((await boxes.count()) === 2 && (await dlg.locator('input:checked').count()) === 0, 'both optional toggles default OFF');
  await page.keyboard.press('Escape');
  check(!(await dlg.isVisible()), 'Escape closes dialog');
  await page.getByRole('button', { name: 'Decline optional' }).click();
  check(!(await banner.isVisible()), 'banner hides after choice');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('skyfare_consent_v2')));
  check(stored && stored.decided && !stored.analytics && !stored.ads, 'decline stored as analytics=false ads=false');
  await page.reload({ waitUntil: 'networkidle' });
  check(!(await page.getByRole('region', { name: 'Cookie choices' }).isVisible()), 'choice remembered after reload');
  await page.getByRole('button', { name: 'Cookie settings' }).click();
  await page.getByRole('dialog').waitFor({ timeout: 3000 }).catch(() => {});
  check(await page.getByRole('dialog').isVisible(), 'footer "Cookie settings" reopens preferences');
  await page.getByRole('button', { name: 'Decline optional' }).click();
  check(third.length === 0, 'no third-party requests after declining: ' + third.join(','));
  // analytics counter only after opt-in
  let analyticsPosts = 0; page.on('request', (r) => r.url().includes('/api/analytics') && analyticsPosts++);
  await page.goto(BASE + '/guides', { waitUntil: 'networkidle' });
  check(analyticsPosts === 0, 'no analytics ping while declined');
  await page.getByRole('button', { name: 'Cookie settings' }).click();
  await page.getByRole('dialog').getByLabel(/Analytics/).check();
  await page.getByRole('button', { name: 'Save choices' }).click();
  await page.goto(BASE + '/about', { waitUntil: 'networkidle' });
  check(analyticsPosts >= 1, 'analytics ping after opting in');
  const cls = await page.evaluate(() => window.__cls);
  check(cls < 0.1, 'CLS on guide page = ' + cls.toFixed(3));
  await ctx.close();
}

// Internal link integrity
{
  const ctx = await browser.newContext();
  const bad = [];
  for (const h of internalLinks) {
    if (h.startsWith('/api') || h === '' ) continue;
    const r = await ctx.request.get(BASE + h);
    if (r.status() !== 200) bad.push(`${h} -> ${r.status()}`);
  }
  check(bad.length === 0, `broken internal links: ${bad.join(', ')}`);
  results.notes.push(`checked ${internalLinks.size} unique internal links`);
  await ctx.close();
}

// SPA navigation uses real anchors and does not full-reload
{
  const ctx = await browser.newContext({ viewport: VIEWPORTS.desktop });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => { window.__marker = 1; });
  await page.getByRole('navigation').first().getByRole('link', { name: /Guides/ }).first().click();
  await page.waitForURL('**/guides');
  check(await page.evaluate(() => window.__marker === 1), 'in-app link navigates without a full reload');
  check((await page.locator('a[href^="/guides/"]').count()) > 0, 'guide cards are real <a href> links');
  await ctx.close();
}

await browser.close();
console.log(`PASS ${results.pass}  FAIL ${results.fail}`);
results.notes.forEach((n) => console.log(n));
process.exit(results.fail ? 1 : 0);
