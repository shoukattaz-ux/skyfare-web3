// WCAG 2.x A/AA automated check with axe-core. AXE=/path/to/axe.min.js BASE_URL=... node tests/a11y.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:3100';
const axeSrc = fs.readFileSync(process.env.AXE, 'utf8');
const pages = ['/', '/guides', '/guides/how-to-find-cheap-flights', '/destinations/cancun', '/airlines/delta', '/about', '/contact', '/privacy', '/sitemap', '/search?q=cancun', '/does-not-exist', '/admin'];
const browser = await chromium.launch();
let total = 0;
for (const [name, vp] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  for (const dark of [false, true]) {
    const ctx = await browser.newContext({ viewport: vp, colorScheme: dark ? 'dark' : 'light' });
    const page = await ctx.newPage();
    await page.addInitScript((d) => { try { localStorage.setItem('skyfare_theme_v1', d ? 'dark' : 'light'); localStorage.setItem('skyfare_consent_v2', JSON.stringify({ decided: true, analytics: false, ads: false, updatedAt: 'x' })); } catch {} }, dark);
    for (const p of pages) {
      await page.goto(BASE + p, { waitUntil: 'networkidle' });
      await page.addScriptTag({ content: axeSrc });
      const res = await page.evaluate(async () => await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
      for (const v of res.violations) {
        total++;
        console.log(`[${name}${dark ? '/dark' : ''}] ${p}  ${v.impact}  ${v.id}: ${v.help}  (${v.nodes.length} nodes)  e.g. ${v.nodes[0].target.join(' ')}  ${(v.nodes[0].failureSummary || '').split('\n')[1] || ''}`);
      }
    }
    await ctx.close();
  }
}
await browser.close();
console.log('violations:', total);
