// Throttled mobile measurement: LCP, CLS, transfer size, request count. node tests/perf.mjs <baseUrl> [path...]
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');
const base = process.argv[2];
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ['/', '/guides/how-to-find-cheap-flights'];
const browser = await chromium.launch();
for (const path of paths) {
  const runs = [];
  for (let i = 0; i < 3; i++) {
    const ctx = await browser.newContext({ ...devices['Pixel 5'], serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    let bytes = 0, reqs = 0;
    cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; });
    cdp.on('Network.requestWillBeSent', () => { reqs++; });
    await page.addInitScript(() => {
      window.__lcp = 0; window.__cls = 0;
      new PerformanceObserver((l) => { const e = l.getEntries().at(-1); window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(base + path, { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForTimeout(800);
    const m = await page.evaluate(() => ({ lcp: window.__lcp, cls: window.__cls }));
    runs.push({ ...m, kb: bytes / 1024, reqs });
    await ctx.close();
  }
  const med = (k) => runs.map((r) => r[k]).sort((a, b) => a - b)[1];
  console.log(`${base.replace('http://localhost:', ':')}${path}  LCP ${Math.round(med('lcp'))} ms | CLS ${med('cls').toFixed(3)} | transfer ${Math.round(med('kb'))} KB | requests ${med('reqs')}`);
}
await browser.close();
