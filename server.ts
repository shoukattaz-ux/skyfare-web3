import express from 'express';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { db, getPublishedGuides, getSetting, initDatabase } from './server/db.ts';
import { createApiRouter, uploadsDir } from './server/routes.ts';
import { getAllSitemapUrls, getRouteSEO } from './src/lib/seo.ts';

dotenv.config();
initDatabase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isDevCommand =
  process.env.npm_lifecycle_event === 'dev' ||
  process.execArgv.some((arg) => arg.includes('tsx')) ||
  process.argv.some((arg) => arg.includes('tsx'));
const isProd =
  process.env.NODE_ENV === 'production' ||
  (!isDevCommand && fs.existsSync(path.resolve(__dirname, 'dist', 'index.html')));

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function injectRouteSEO(html: string, reqPath: string, baseUrl: string): string {
  const seo = getRouteSEO(reqPath, baseUrl);
  const canonicalUrl = `${baseUrl}${seo.canonicalPath}`;
  const general = getSetting<{
    gscVerificationCode?: string;
    ga4MeasurementId?: string;
  }>('general', {});

  const gscMeta = general.gscVerificationCode
    ? `<meta name="google-site-verification" content="${escapeHtml(general.gscVerificationCode)}" />`
    : '';

  const headTags = `
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    ${gscMeta}
    <script id="skyfare-jsonld-ssr" type="application/ld+json">${JSON.stringify(seo.jsonLd)}</script>
  `;

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(seo.description)}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(seo.title)}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(seo.description)}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`
    )
    .replace('<!--SSR_HEAD_INJECT-->', headTags);
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '4mb' }));

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  const resolveBaseUrl = (req: express.Request): string => {
    if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
      return process.env.APP_URL.replace(/\/+$/, '');
    }
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
    return `${proto}://${host}`;
  };

  // Serve uploaded media files
  app.use('/uploads', express.static(uploadsDir, { maxAge: '30d' }));

  // Mount full SQLite-backed API router
  app.use('/api', createApiRouter());

  // Dynamic XML Sitemap (includes CMS-published guides)
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    const staticAndSeeded = getAllSitemapUrls();
    const seen = new Set(staticAndSeeded.map((u) => u.path));
    const cmsGuides = getPublishedGuides();
    const dynamicGuides = cmsGuides
      .filter((g) => !seen.has(`/guides/${g.slug}`))
      .map((g) => ({
        path: `/guides/${g.slug}`,
        priority: '0.8',
        changefreq: 'monthly',
      }));

    const allUrls = [...staticAndSeeded, ...dynamicGuides];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${escapeHtml(baseUrl + u.path)}</loc>
    <lastmod>2026-11-15</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  });

  // robots.txt
  app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(
      `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  // Dynamic ads.txt configured from Admin Monetization settings
  app.get('/ads.txt', (_req, res) => {
    const mon = getSetting<{
      adsensePublisherId?: string;
      medianetCustomerId?: string;
      adsTxtExtra?: string;
    }>('monetization', {});
    const pubId = mon.adsensePublisherId || process.env.VITE_ADSENSE_PUBLISHER_ID || 'pub-0000000000000000';
    const mediaNetLine = mon.medianetCustomerId
      ? `media.net, ${mon.medianetCustomerId}, DIRECT`
      : '# media.net, YOUR_CUSTOMER_ID, DIRECT';
    const extra = mon.adsTxtExtra ? `\n${mon.adsTxtExtra}` : '';
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(
      `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n${mediaNetLine}\nrevcontent.com, 00000, DIRECT${extra}\n`
    );
  });

  // Ensure DB stays referenced cleanly on health check
  app.get('/healthz', (_req, res) => {
    const row = db.prepare('SELECT 1 as ok').get() as { ok: number };
    res.json({ status: 'ok', db: row.ok === 1 });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const cleanPath = url.split('?')[0] || '/';
        const templatePath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const injected = injectRouteSEO(template, cleanPath, resolveBaseUrl(req));
        res.status(200).set({ 'Content-Type': 'text/html' }).end(injected);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { index: false, maxAge: '7d' }));

    app.use('*', (req, res) => {
      const cleanPath = req.originalUrl.split('?')[0] || '/';
      const indexPath = path.join(distPath, 'index.html');
      const template = fs.readFileSync(indexPath, 'utf-8');
      const injected = injectRouteSEO(template, cleanPath, resolveBaseUrl(req));
      res.status(200).set({ 'Content-Type': 'text/html' }).end(injected);
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`SkyFare server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
