import compression from 'compression';
import express from 'express';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { buildBootstrap, db, getPublishedDeals, getPublishedGuides, getSetting, initDatabase } from './server/db.ts';
import { createApiRouter, uploadsDir } from './server/routes.ts';
import { buildSnapshot } from './server/snapshot.ts';
import { getRouteSEO, getStaticSitemapUrls, LEGAL_SLUGS, type SitemapEntry } from './src/lib/seo.ts';
import { escapeHtml } from './src/lib/markdown.ts';
import type { FlightDeal, TravelGuide } from './src/types/flight.ts';

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

interface General {
  siteName?: string;
  supportEmail?: string;
  publisherName?: string;
  companyAddress?: string;
  gscVerificationCode?: string;
}

function loadContext() {
  const general = getSetting<General>('general', {});
  const legal = db
    .prepare('SELECT slug, title, meta_title, meta_description, content_markdown, updated_at FROM legal_pages')
    .all() as {
    slug: string;
    title: string;
    meta_title: string;
    meta_description: string;
    content_markdown: string;
    updated_at: string;
  }[];
  return {
    general,
    legal,
    guides: getPublishedGuides() as TravelGuide[],
    deals: getPublishedDeals() as FlightDeal[],
    menus: getSetting<{ label: string; path: string }[]>('menus', []),
    homepage: getSetting<{ heroTitle?: string; heroSubtitle?: string }>('homepage', {}),
    monetization: getSetting<{ adsensePublisherId?: string; medianetCustomerId?: string; adsTxtExtra?: string }>(
      'monetization',
      {}
    ),
  };
}

/** Builds the full HTML response for a page route. Returns the status to send as well. */
function renderPage(html: string, reqPath: string, baseUrl: string): { html: string; status: number } {
  const ctx = loadContext();
  const { general } = ctx;
  const seo = getRouteSEO(reqPath, baseUrl, {
    guides: ctx.guides,
    legal: ctx.legal,
    siteName: general.siteName,
    supportEmail: general.supportEmail,
  });
  const canonicalUrl = `${baseUrl}${seo.canonicalPath}`;
  const ogImage = `${baseUrl}/og-default.jpg`;
  const pubId = ctx.monetization.adsensePublisherId;

  const jsonLd = JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c');
  const headTags = [
    seo.found && !seo.noindex ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />` : '',
    seo.noindex ? '<meta name="robots" content="noindex, nofollow" />' : '',
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:type" content="${seo.ogType}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
    general.gscVerificationCode
      ? `<meta name="google-site-verification" content="${escapeHtml(general.gscVerificationCode)}" />`
      : '',
    // Official AdSense site-ownership method: a meta tag that does not load any ad code.
    pubId ? `<meta name="google-adsense-account" content="ca-${escapeHtml(pubId)}" />` : '',
    // The snapshot is real, crawlable content; it is not painted before React mounts (that swap caused layout shift).
    '<style>.ssr-snapshot{visibility:hidden}</style><noscript><style>.ssr-snapshot{visibility:visible}</style></noscript>',
    `<script id="skyfare-boot" type="application/json">${JSON.stringify(buildBootstrap()).replace(/</g, '\\u003c')}</script>`,
    seo.jsonLd.length ? `<script id="skyfare-jsonld-ssr" type="application/ld+json">${jsonLd}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  const snapshot = seo.found
    ? buildSnapshot(seo.canonicalPath, {
        guides: ctx.guides,
        deals: ctx.deals,
        legal: ctx.legal,
        menus: ctx.menus,
        homepage: ctx.homepage,
        tokens: { ...general },
      })
    : `<main><h1>Page not found</h1><p>This page does not exist. Go to the <a href="/">home page</a> or the <a href="/guides">guides</a>.</p></main>`;

  const out = html
    .replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapeHtml(seo.title)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, () => `<meta name="description" content="${escapeHtml(seo.description)}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, () => `<meta property="og:title" content="${escapeHtml(seo.title)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, () => `<meta property="og:description" content="${escapeHtml(seo.description)}" />`)
    .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, '')
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, () => `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, () => `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`)
    .replace('<!--SSR_HEAD_INJECT-->', () => headTags)
    .replace('<div id="root"></div>', () => `<div id="root"><div class="ssr-snapshot">${snapshot}</div></div>`);

  return { html: out, status: seo.found ? 200 : 404 };
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  // Set TRUST_PROXY=1 when running behind one reverse proxy / load balancer so that
  // rate limits and the secure-cookie check see the real client address.
  if (process.env.TRUST_PROXY) {
    app.set('trust proxy', /^\d+$/.test(process.env.TRUST_PROXY) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY);
  }
  app.disable('x-powered-by');
  app.use(compression());
  app.use(express.json({ limit: '4mb' }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=15552000');
    }
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

  // Uploaded media: images only, never executable in this origin.
  app.use(
    '/uploads',
    express.static(uploadsDir, {
      maxAge: '30d',
      setHeaders: (res) => {
        res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'");
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    })
  );

  app.use('/api', createApiRouter());
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // XML sitemap: only published pages, with real last-modified dates where we have them.
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    const ctx = loadContext();
    const urls: SitemapEntry[] = [
      ...getStaticSitemapUrls(),
      ...ctx.guides.map((g) => ({
        path: `/guides/${g.slug}`,
        priority: '0.8',
        changefreq: 'monthly',
        lastmod: g.updatedAt,
      })),
      ...ctx.legal
        .filter((l) => (LEGAL_SLUGS as readonly string[]).includes(l.slug))
        .map((l) => ({
          path: `/${l.slug}`,
          priority: l.slug === 'about' || l.slug === 'editorial-policy' ? '0.5' : '0.3',
          changefreq: 'yearly',
          lastmod: l.updated_at.slice(0, 10),
        })),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeHtml(baseUrl + u.path)}</loc>${u.lastmod ? `\n    <lastmod>${escapeHtml(u.lastmod)}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  });

  app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nDisallow: /search\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  // ads.txt lists only the sellers the operator has actually configured: no placeholder IDs.
  app.get('/ads.txt', (_req, res) => {
    const { monetization: mon } = loadContext();
    const lines: string[] = [];
    if (mon.adsensePublisherId) lines.push(`google.com, ${mon.adsensePublisherId}, DIRECT, f08c47fec0942fa0`);
    if (mon.medianetCustomerId) lines.push(`media.net, ${mon.medianetCustomerId}, DIRECT`);
    if (mon.adsTxtExtra) lines.push(...mon.adsTxtExtra.split('\n'));
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=600');
    res.send(lines.length ? `${lines.join('\n')}\n` : '# No authorised ad sellers are configured for this site.\n');
  });

  app.get('/healthz', (_req, res) => {
    const row = db.prepare('SELECT 1 as ok').get() as { ok: number };
    res.json({ status: 'ok', db: row.ok === 1 });
  });

  const sendPage = (template: string, req: express.Request, res: express.Response) => {
    const cleanPath = (req.originalUrl.split('?')[0] || '/').replace(/(?<=.)\/+$/, '');
    const { html, status } = renderPage(template, cleanPath, resolveBaseUrl(req));
    res.status(status).set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    if (/^\/(admin|search)$/.test(cleanPath) || status === 404) res.setHeader('X-Robots-Tag', 'noindex');
    res.end(html);
  };

  // Anything that looks like a file but was not served above is a real 404, not the app shell.
  const FILE_LIKE = /\.[a-zA-Z0-9]{1,6}$/;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, ws: { server: httpServer }, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        if (FILE_LIKE.test(req.originalUrl.split('?')[0])) return res.status(404).type('text').send('Not found');
        const templatePath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        sendPage(template, req, res);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        index: false,
        maxAge: '1h',
        setHeaders: (res, filePath) => {
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else if (/sw\.js$|workbox-.*\.js$|manifest\.webmanifest$/.test(filePath)) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');

    app.use('*', (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      if (FILE_LIKE.test(req.originalUrl.split('?')[0])) return res.status(404).type('text').send('Not found');
      sendPage(template, req, res);
    });
  }

  // Last-resort error handler: no stack traces to the client.
  app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 500;
    if (status === 500) console.error(err);
    res.status(status).json({ error: status === 500 ? 'Something went wrong on our side.' : 'Invalid request.' });
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`SkyFare server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
