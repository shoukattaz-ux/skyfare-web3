import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import {
  db,
  getPublishedDeals,
  getPublishedGuides,
  getSetting,
  setSetting,
} from './db.ts';
import {
  checkRateLimit,
  clearSessionCookie,
  hashPassword,
  parseCookies,
  sanitizeSlug,
  sanitizeText,
  setSessionCookie,
  verifyPassword,
} from './security.ts';
import { DESTINATIONS } from '../src/data/destinations.ts';
import { AIRLINES } from '../src/data/airlines.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const uploadsDir = path.resolve(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'analyst';
  csrfToken: string;
  sessionId: string;
}

function getAuthenticatedUser(req: express.Request): SessionUser | null {
  const cookies = parseCookies(req.headers.cookie);
  const sid = cookies.skyfare_sid;
  if (!sid) return null;

  const row = db
    .prepare(
      `SELECT s.id as session_id, s.csrf_token, s.expires_at, u.id, u.email, u.name, u.role, u.active
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .get(sid) as
    | {
        session_id: string;
        csrf_token: string;
        expires_at: string;
        id: number;
        email: string;
        name: string;
        role: 'admin' | 'editor' | 'analyst';
        active: number;
      }
    | undefined;

  if (!row || !row.active) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sid);
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    csrfToken: row.csrf_token,
    sessionId: row.session_id,
  };
}

function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const headerToken = req.headers['x-csrf-token'];
    if (typeof headerToken !== 'string' || headerToken !== user.csrfToken) {
      res.status(403).json({ error: 'Invalid or missing CSRF token.' });
      return;
    }
  }
  (req as express.Request & { authUser?: SessionUser }).authUser = user;
  next();
}

function requireAdminRole(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const user = (req as express.Request & { authUser?: SessionUser }).authUser;
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator privileges required.' });
    return;
  }
  next();
}

export function createApiRouter(): express.Router {
  const router = express.Router();

  // --- Public Bootstrap & Search ---
  router.get('/bootstrap', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    const deals = getPublishedDeals();
    const guides = getPublishedGuides();
    const categories = db.prepare('SELECT id, name, slug, description FROM categories ORDER BY name ASC').all();
    const adPlacements = db.prepare('SELECT slot_id, name, network, enabled, ad_unit_code, min_height FROM ad_placements').all();
    const legalPages = db.prepare('SELECT slug, title, meta_title, meta_description, content_markdown, updated_at FROM legal_pages').all();
    const general = getSetting('general', {});
    const monetization = getSetting('monetization', {});
    const menus = getSetting('menus', []);
    const homepage = getSetting('homepage', {});

    res.json({
      deals,
      guides,
      categories,
      adPlacements,
      legalPages,
      general,
      monetization,
      menus,
      homepage,
    });
  });

  router.get('/deals', (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=120');
    res.json({
      provider: process.env.AMADEUS_CLIENT_ID
        ? 'amadeus-live-hybrid'
        : process.env.TRAVELPAYOUTS_API_TOKEN
        ? 'travelpayouts-hybrid'
        : 'curated-sqlite-feed',
      lastUpdated: '2026-11-14T09:00:00Z',
      disclaimer: 'Prices may change without notice based on airline inventory.',
      deals: getPublishedDeals(),
    });
  });

  router.get('/search', (req, res) => {
    const q = sanitizeText(req.query.q, 120).toLowerCase();
    if (!q) {
      res.json({ query: '', deals: [], guides: [], destinations: [], airlines: [] });
      return;
    }

    const deals = getPublishedDeals().filter((d) =>
      `${d.originCity} ${d.originCode} ${d.destinationCity} ${d.destinationCode} ${d.airlineName} ${d.country}`
        .toLowerCase()
        .includes(q)
    );
    const guides = getPublishedGuides().filter((g) =>
      `${g.title} ${g.excerpt} ${g.category} ${g.tags || ''}`.toLowerCase().includes(q)
    );
    const destinations = DESTINATIONS.filter((d) =>
      `${d.city} ${d.country} ${d.airportCodes.join(' ')} ${d.summary}`.toLowerCase().includes(q)
    );
    const airlines = AIRLINES.filter((a) =>
      `${a.name} ${a.code} ${a.hubs.join(' ')} ${a.summary}`.toLowerCase().includes(q)
    );

    res.json({ query: q, deals, guides, destinations, airlines });
  });

  router.post('/analytics', (req, res) => {
    const pathVal = sanitizeText(req.body?.path || '/', 200);
    const eventType = sanitizeText(req.body?.eventType || 'pageview', 40);
    db.prepare('INSERT INTO analytics_events (path, event_type, created_at) VALUES (?, ?, ?)').run(
      pathVal,
      eventType,
      new Date().toISOString()
    );
    res.status(204).end();
  });

  router.post('/price-alerts', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(`alert:${ip}`, 15)) {
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }
    const { email, origin, destination, maxPrice, company } = req.body ?? {};
    if (company) {
      res.status(200).json({ message: 'Price alert activated.' });
      return;
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    db.prepare(
      'INSERT INTO price_alerts (email, origin, destination, max_price, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(
      email.trim().toLowerCase(),
      sanitizeText(origin || 'Any US Hub', 60),
      sanitizeText(destination || 'Anywhere', 80),
      Math.max(50, Math.min(10000, Number(maxPrice) || 400)),
      new Date().toISOString()
    );
    res.status(201).json({
      message: 'Price alert activated! We will notify you on matching drops.',
    });
  });

  router.post('/newsletter', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(`news:${ip}`, 15)) {
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }
    const { email } = req.body ?? {};
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    db.prepare(
      'INSERT INTO newsletter_subscribers (email, created_at) VALUES (?, ?) ON CONFLICT(email) DO NOTHING'
    ).run(email.trim().toLowerCase(), new Date().toISOString());
    res.status(201).json({
      message: 'Subscribed! Watch your inbox every Tuesday and Friday for verified US fare drops.',
    });
  });

  router.post('/contact', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(`contact:${ip}`, 10)) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again shortly.' });
      return;
    }
    const { name, email, subject, message, website } = req.body ?? {};
    if (website) {
      res.status(200).json({ message: 'Thank you for contacting SkyFare.' });
      return;
    }
    if (
      typeof name !== 'string' ||
      name.trim().length < 2 ||
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof message !== 'string' ||
      message.trim().length < 10
    ) {
      res.status(400).json({
        error: 'Please enter your name, a valid email, and a message of at least 10 characters.',
      });
      return;
    }
    const ticketId = `SF-${Math.floor(10000 + Math.random() * 90000)}`;
    db.prepare(
      'INSERT INTO contact_messages (id, name, email, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      ticketId,
      sanitizeText(name, 120),
      email.trim().toLowerCase(),
      sanitizeText(subject || 'General Inquiry', 120),
      sanitizeText(message, 2500),
      'new',
      new Date().toISOString()
    );
    res.status(201).json({
      message: `Message received (Reference ${ticketId}). Our San Francisco desk typically responds within 1 business day.`,
    });
  });

  // --- Authentication ---
  router.post('/auth/login', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(`login:${ip}`, 12)) {
      res.status(429).json({ error: 'Too many login attempts. Try again in 10 minutes.' });
      return;
    }
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db
      .prepare('SELECT id, email, name, role, password_hash, active FROM users WHERE email = ?')
      .get(email.trim().toLowerCase()) as
      | {
          id: number;
          email: string;
          name: string;
          role: 'admin' | 'editor' | 'analyst';
          password_hash: string;
          active: number;
        }
      | undefined;

    if (!user || !user.active || !verifyPassword(password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const sessionId = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(24).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(
      'INSERT INTO sessions (id, user_id, csrf_token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(sessionId, user.id, csrfToken, expiresAt, now.toISOString());

    const isHttps =
      req.secure || req.headers['x-forwarded-proto'] === 'https';
    setSessionCookie(res, sessionId, Boolean(isHttps));

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      csrfToken,
    });
  });

  router.post('/auth/logout', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies.skyfare_sid) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(cookies.skyfare_sid);
    }
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  router.get('/auth/me', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      csrfToken: user.csrfToken,
    });
  });

  // --- Protected Admin Endpoints ---
  router.get('/admin/dashboard', requireAuth, (_req, res) => {
    const dealsRows = db.prepare('SELECT id, payload_json, status, updated_at FROM deals ORDER BY updated_at DESC').all() as {
      id: string;
      payload_json: string;
      status: string;
      updated_at: string;
    }[];
    const guidesRows = db
      .prepare('SELECT slug, title, meta_title, meta_description, category, tags, author, status, payload_json, updated_at FROM guides ORDER BY updated_at DESC')
      .all() as {
      slug: string;
      title: string;
      meta_title: string;
      meta_description: string;
      category: string;
      tags: string;
      author: string;
      status: string;
      payload_json: string;
      updated_at: string;
    }[];

    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    const media = db.prepare('SELECT * FROM media_assets ORDER BY created_at DESC').all();
    const adPlacements = db.prepare('SELECT * FROM ad_placements').all();
    const legalPages = db.prepare('SELECT * FROM legal_pages').all();
    const alerts = db.prepare('SELECT * FROM price_alerts ORDER BY created_at DESC LIMIT 50').all();
    const subscribers = db.prepare('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 50').all();
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 50').all();
    const topRoutes = db
      .prepare('SELECT path, COUNT(*) as views FROM analytics_events GROUP BY path ORDER BY views DESC LIMIT 10')
      .all();

    const totalViews = (
      db.prepare('SELECT COUNT(*) as cnt FROM analytics_events').get() as { cnt: number }
    ).cnt;

    res.json({
      stats: {
        totalDeals: dealsRows.length,
        totalGuides: guidesRows.length,
        totalAlerts: (db.prepare('SELECT COUNT(*) as cnt FROM price_alerts').get() as { cnt: number }).cnt,
        totalSubscribers: (db.prepare('SELECT COUNT(*) as cnt FROM newsletter_subscribers').get() as { cnt: number }).cnt,
        totalMessages: (db.prepare('SELECT COUNT(*) as cnt FROM contact_messages').get() as { cnt: number }).cnt,
        totalPageviews: totalViews,
      },
      deals: dealsRows.map((r) => ({ ...JSON.parse(r.payload_json), status: r.status })),
      guides: guidesRows.map((r) => ({
        ...JSON.parse(r.payload_json),
        tags: r.tags,
        status: r.status,
      })),
      categories,
      media,
      adPlacements,
      legalPages,
      alerts,
      subscribers,
      messages,
      topRoutes,
      general: getSetting('general', {}),
      monetization: getSetting('monetization', {}),
      menus: getSetting('menus', []),
      homepage: getSetting('homepage', {}),
    });
  });

  // Deals CRUD
  router.post('/admin/deals', requireAuth, (req, res) => {
    const body = req.body ?? {};
    const originCode = sanitizeText(body.originCode || 'JFK', 5).toUpperCase();
    const destinationCode = sanitizeText(body.destinationCode || 'CUN', 5).toUpperCase();
    const airlineSlug = sanitizeSlug(body.airlineSlug || 'delta');
    const id = sanitizeSlug(body.id) || `deal-${originCode.toLowerCase()}-${destinationCode.toLowerCase()}-${Date.now()}`;
    const price = Math.max(20, Number(body.price) || 199);
    const originalPrice = Math.max(price + 10, Number(body.originalPrice) || price * 2);
    const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
    const now = new Date().toISOString();

    const dealObj = {
      id,
      airlineSlug,
      airlineName: sanitizeText(body.airlineName || 'Delta Air Lines', 80),
      airlineCode: sanitizeText(body.airlineCode || 'DL', 4).toUpperCase(),
      originCode,
      originCity: sanitizeText(body.originCity || 'New York', 60),
      destinationCode,
      destinationCity: sanitizeText(body.destinationCity || 'Cancun', 60),
      destinationSlug: sanitizeSlug(body.destinationSlug || body.destinationCity || 'cancun'),
      country: sanitizeText(body.country || 'United States', 60),
      category: body.category === 'international' ? 'international' : 'domestic',
      price,
      originalPrice,
      discountPercent,
      departureDate: sanitizeText(body.departureDate || '2026-12-10', 20),
      returnDate: sanitizeText(body.returnDate || '2026-12-16', 20),
      tripType: body.tripType === 'One-way' ? 'One-way' : 'Round-trip',
      durationMinutes: Math.max(30, Number(body.durationMinutes) || 240),
      durationLabel: sanitizeText(body.durationLabel || '4h 00m', 20),
      stops: Math.max(0, Number(body.stops) || 0),
      departureTime: sanitizeText(body.departureTime || '09:00 AM', 20),
      departureWindow: ['Morning', 'Afternoon', 'Evening'].includes(body.departureWindow)
        ? body.departureWindow
        : 'Morning',
      baggagePolicy: sanitizeText(body.baggagePolicy || '1 carry-on + 1 personal item included', 120),
      cabinClass: ['Economy', 'Premium Economy', 'Business', 'First'].includes(body.cabinClass)
        ? body.cabinClass
        : 'Economy',
      expiresAt: sanitizeText(body.expiresAt || '2026-12-01T23:59:00Z', 40),
      lastUpdated: now,
      isWeekendGetaway: Boolean(body.isWeekendGetaway),
      isLastMinute: Boolean(body.isLastMinute),
      isTopWeekly: Boolean(body.isTopWeekly),
      partnerName: body.partnerName || 'Travelpayouts',
      affiliateUrl: sanitizeText(body.affiliateUrl || 'https://www.expedia.com/Flights', 300),
      imageKey: ['hero', 'nyc', 'cancun', 'tokyo', 'paris', 'terminal'].includes(body.imageKey)
        ? body.imageKey
        : 'terminal',
      customImageUrl: body.customImageUrl ? sanitizeText(body.customImageUrl, 300) : undefined,
      highlights: Array.isArray(body.highlights)
        ? body.highlights.slice(0, 4).map((h: unknown) => sanitizeText(h, 80))
        : ['Verified fare drop'],
    };

    db.prepare(
      'INSERT INTO deals (id, payload_json, status, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload_json = excluded.payload_json, status = excluded.status, updated_at = excluded.updated_at'
    ).run(id, JSON.stringify(dealObj), body.status === 'draft' ? 'draft' : 'published', now);

    res.status(201).json({ deal: dealObj });
  });

  router.delete('/admin/deals/:id', requireAuth, (req, res) => {
    db.prepare('DELETE FROM deals WHERE id = ?').run(sanitizeSlug(req.params.id));
    res.json({ ok: true });
  });

  // Guides / Posts CRUD
  router.post('/admin/guides', requireAuth, (req, res) => {
    const body = req.body ?? {};
    const title = sanitizeText(body.title, 180);
    if (title.length < 4) {
      res.status(400).json({ error: 'Post title must be at least 4 characters.' });
      return;
    }
    const slug = sanitizeSlug(body.slug || title) || `guide-${Date.now()}`;
    const metaTitle = sanitizeText(body.metaTitle || title, 70);
    const metaDescription = sanitizeText(body.metaDescription || body.excerpt || title, 165);
    const category = sanitizeText(body.category || 'Booking Strategy', 60);
    const tags = sanitizeText(body.tags || '', 200);
    const author = sanitizeText(body.author || 'Elena Vance', 80);
    const status = body.status === 'draft' ? 'draft' : 'published';
    const now = new Date().toISOString().slice(0, 10);

    const sections = Array.isArray(body.sections) && body.sections.length > 0
      ? body.sections
      : [
          {
            heading: 'Overview',
            paragraphs: [sanitizeText(body.content || body.excerpt || title, 6000)],
          },
        ];

    const guideObj = {
      slug,
      title,
      metaTitle,
      metaDescription,
      category,
      tags,
      status,
      author,
      authorRole: sanitizeText(body.authorRole || 'Editorial Analyst', 60),
      publishedAt: sanitizeText(body.publishedAt || now, 20),
      updatedAt: now,
      readTimeMinutes: Math.max(1, Number(body.readTimeMinutes) || 5),
      wordCount: Math.max(150, Number(body.wordCount) || 650),
      imageKey: ['hero', 'nyc', 'cancun', 'tokyo', 'paris', 'terminal'].includes(body.imageKey)
        ? body.imageKey
        : 'terminal',
      customImageUrl: body.customImageUrl ? sanitizeText(body.customImageUrl, 300) : undefined,
      excerpt: sanitizeText(body.excerpt || metaDescription, 300),
      sections,
      faqs: Array.isArray(body.faqs) ? body.faqs : [],
    };

    db.prepare(
      `INSERT INTO guides (slug, title, meta_title, meta_description, category, tags, author, status, payload_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         title = excluded.title,
         meta_title = excluded.meta_title,
         meta_description = excluded.meta_description,
         category = excluded.category,
         tags = excluded.tags,
         author = excluded.author,
         status = excluded.status,
         payload_json = excluded.payload_json,
         updated_at = excluded.updated_at`
    ).run(slug, title, metaTitle, metaDescription, category, tags, author, status, JSON.stringify(guideObj), now);

    res.status(201).json({ guide: guideObj });
  });

  router.delete('/admin/guides/:slug', requireAuth, (req, res) => {
    db.prepare('DELETE FROM guides WHERE slug = ?').run(sanitizeSlug(req.params.slug));
    res.json({ ok: true });
  });

  // Categories CRUD
  router.post('/admin/categories', requireAuth, (req, res) => {
    const name = sanitizeText(req.body?.name, 60);
    if (!name) {
      res.status(400).json({ error: 'Category name is required.' });
      return;
    }
    const slug = sanitizeSlug(req.body?.slug || name);
    const description = sanitizeText(req.body?.description || '', 200);
    db.prepare(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?) ON CONFLICT(slug) DO UPDATE SET name = excluded.name, description = excluded.description'
    ).run(name, slug, description);
    res.status(201).json({ categories: db.prepare('SELECT * FROM categories ORDER BY name ASC').all() });
  });

  router.delete('/admin/categories/:id', requireAuth, (req, res) => {
    db.prepare('DELETE FROM categories WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  // Media Upload & Management
  router.post('/admin/media', requireAuth, (req, res) => {
    const { filename, mimeType, base64Data, altText } = req.body ?? {};
    const allowedMimes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedMimes.includes(mimeType) || typeof base64Data !== 'string') {
      res.status(400).json({ error: 'Invalid image format. Allowed: PNG, JPEG, WebP, SVG.' });
      return;
    }
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    if (buffer.length > 2 * 1024 * 1024) {
      res.status(400).json({ error: 'Image size must be under 2 MB.' });
      return;
    }
    const ext =
      mimeType === 'image/png'
        ? 'png'
        : mimeType === 'image/webp'
        ? 'webp'
        : mimeType === 'image/svg+xml'
        ? 'svg'
        : 'jpg';
    const safeName = `${sanitizeSlug(String(filename || 'upload').replace(/\.[^.]+$/, '')) || 'asset'}-${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(uploadsDir, safeName), buffer);

    const id = `media-${Date.now()}`;
    const url = `/uploads/${safeName}`;
    db.prepare(
      'INSERT INTO media_assets (id, filename, mime_type, size_bytes, alt_text, url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      safeName,
      mimeType,
      buffer.length,
      sanitizeText(altText || safeName, 140),
      url,
      new Date().toISOString()
    );

    res.status(201).json({
      media: db.prepare('SELECT * FROM media_assets ORDER BY created_at DESC').all(),
    });
  });

  router.delete('/admin/media/:id', requireAuth, (req, res) => {
    const row = db.prepare('SELECT url FROM media_assets WHERE id = ?').get(String(req.params.id)) as
      | { url: string }
      | undefined;
    if (row && row.url.startsWith('/uploads/')) {
      const target = path.join(uploadsDir, path.basename(row.url));
      if (fs.existsSync(target)) fs.unlinkSync(target);
    }
    db.prepare('DELETE FROM media_assets WHERE id = ?').run(String(req.params.id));
    res.json({ ok: true });
  });

  // Ad Monetization Settings & Placements
  router.put('/admin/ads', requireAuth, requireAdminRole, (req, res) => {
    const { monetization, placements } = req.body ?? {};
    if (monetization) {
      setSetting('monetization', {
        adsensePublisherId: sanitizeText(monetization.adsensePublisherId || '', 60),
        medianetCustomerId: sanitizeText(monetization.medianetCustomerId || '', 60),
        medianetSiteId: sanitizeText(monetization.medianetSiteId || '', 60),
        revcontentWidgetId: sanitizeText(monetization.revcontentWidgetId || '', 60),
        adsTxtExtra: sanitizeText(monetization.adsTxtExtra || '', 2000),
      });
    }
    if (Array.isArray(placements)) {
      const stmt = db.prepare(
        'UPDATE ad_placements SET enabled = ?, ad_unit_code = ?, network = ? WHERE slot_id = ?'
      );
      for (const p of placements) {
        stmt.run(
          p.enabled ? 1 : 0,
          sanitizeText(p.ad_unit_code || '', 300),
          sanitizeText(p.network || 'AdSense', 40),
          String(p.slot_id)
        );
      }
    }
    res.json({
      monetization: getSetting('monetization', {}),
      adPlacements: db.prepare('SELECT * FROM ad_placements').all(),
    });
  });

  // General Site Settings, SEO, Menus, Homepage
  router.put('/admin/settings', requireAuth, (req, res) => {
    const { general, menus, homepage } = req.body ?? {};
    if (general) {
      setSetting('general', {
        siteName: sanitizeText(general.siteName || 'SkyFare', 60),
        tagline: sanitizeText(general.tagline || 'Fly more. Pay less.', 120),
        supportEmail: sanitizeText(general.supportEmail || 'support@skyfareusa.com', 120),
        companyAddress: sanitizeText(general.companyAddress || '', 200),
        defaultTitle: sanitizeText(general.defaultTitle || '', 80),
        defaultDescription: sanitizeText(general.defaultDescription || '', 170),
        gscVerificationCode: sanitizeText(general.gscVerificationCode || '', 120),
        ga4MeasurementId: sanitizeText(general.ga4MeasurementId || '', 40),
      });
    }
    if (Array.isArray(menus)) {
      const cleanMenus = menus
        .slice(0, 6)
        .map((m) => ({
          label: sanitizeText(m.label, 30),
          path: sanitizeText(m.path, 80),
        }))
        .filter((m) => m.label && m.path.startsWith('/'));
      setSetting('menus', cleanMenus);
    }
    if (homepage) {
      setSetting('homepage', {
        heroTitle: sanitizeText(homepage.heroTitle || '', 140),
        heroSubtitle: sanitizeText(homepage.heroSubtitle || '', 300),
        showTopWeekly: Boolean(homepage.showTopWeekly),
        showDestinations: Boolean(homepage.showDestinations),
        showTestimonials: Boolean(homepage.showTestimonials),
        showNewsletter: Boolean(homepage.showNewsletter),
        showFaqs: Boolean(homepage.showFaqs),
      });
    }
    res.json({
      general: getSetting('general', {}),
      menus: getSetting('menus', []),
      homepage: getSetting('homepage', {}),
    });
  });

  // Legal Pages CMS
  router.put('/admin/legal/:slug', requireAuth, (req, res) => {
    const slug = sanitizeSlug(req.params.slug);
    const title = sanitizeText(req.body?.title, 120);
    const metaTitle = sanitizeText(req.body?.meta_title || title, 80);
    const metaDescription = sanitizeText(req.body?.meta_description || '', 170);
    const content = sanitizeText(req.body?.content_markdown || '', 12000);
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO legal_pages (slug, title, meta_title, meta_description, content_markdown, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         title = excluded.title,
         meta_title = excluded.meta_title,
         meta_description = excluded.meta_description,
         content_markdown = excluded.content_markdown,
         updated_at = excluded.updated_at`
    ).run(slug, title, metaTitle, metaDescription, content, now);

    res.json({ legalPages: db.prepare('SELECT * FROM legal_pages').all() });
  });

  // Users & Roles Management (Admin-only)
  router.get('/admin/users', requireAuth, requireAdminRole, (_req, res) => {
    const users = db
      .prepare('SELECT id, email, name, role, active, created_at FROM users ORDER BY id ASC')
      .all();
    res.json({ users });
  });

  router.post('/admin/users', requireAuth, requireAdminRole, (req, res) => {
    const { email, name, role, password } = req.body ?? {};
    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      res.status(400).json({ error: 'Valid email and password (8+ chars) are required.' });
      return;
    }
    const cleanRole = ['admin', 'editor', 'analyst'].includes(role) ? role : 'editor';
    try {
      db.prepare(
        'INSERT INTO users (email, name, role, password_hash, active, created_at) VALUES (?, ?, ?, ?, 1, ?)'
      ).run(
        email.trim().toLowerCase(),
        sanitizeText(name || email.split('@')[0], 80),
        cleanRole,
        hashPassword(password),
        new Date().toISOString()
      );
      res.status(201).json({
        users: db.prepare('SELECT id, email, name, role, active, created_at FROM users ORDER BY id ASC').all(),
      });
    } catch {
      res.status(409).json({ error: 'A user with that email already exists.' });
    }
  });

  router.delete('/admin/users/:id', requireAuth, requireAdminRole, (req, res) => {
    const targetId = Number(req.params.id);
    const currentUser = (req as express.Request & { authUser?: SessionUser }).authUser;
    if (currentUser && currentUser.id === targetId) {
      res.status(400).json({ error: 'You cannot delete your own active admin account.' });
      return;
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
    res.json({ ok: true });
  });

  // Database Backup & Restore (Admin-only)
  router.get('/admin/backup', requireAuth, requireAdminRole, (_req, res) => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      version: 1,
      categories: db.prepare('SELECT * FROM categories').all(),
      deals: db.prepare('SELECT * FROM deals').all(),
      guides: db.prepare('SELECT * FROM guides').all(),
      ad_placements: db.prepare('SELECT * FROM ad_placements').all(),
      legal_pages: db.prepare('SELECT * FROM legal_pages').all(),
      site_settings: db.prepare('SELECT * FROM site_settings').all(),
      price_alerts: db.prepare('SELECT * FROM price_alerts').all(),
      newsletter_subscribers: db.prepare('SELECT * FROM newsletter_subscribers').all(),
      contact_messages: db.prepare('SELECT * FROM contact_messages').all(),
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="skyfare-backup-${new Date().toISOString().slice(0, 10)}.json"`);
    res.send(JSON.stringify(snapshot, null, 2));
  });

  router.post('/admin/restore', requireAuth, requireAdminRole, (req, res) => {
    const snap = req.body;
    if (!snap || typeof snap !== 'object' || !Array.isArray(snap.deals) || !Array.isArray(snap.guides)) {
      res.status(400).json({ error: 'Invalid backup snapshot format.' });
      return;
    }
    try {
      db.exec('BEGIN TRANSACTION;');
      const upsertDeal = db.prepare(
        'INSERT INTO deals (id, payload_json, status, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload_json = excluded.payload_json, status = excluded.status, updated_at = excluded.updated_at'
      );
      for (const d of snap.deals) {
        upsertDeal.run(d.id, d.payload_json, d.status || 'published', d.updated_at || new Date().toISOString());
      }
      const upsertSetting = db.prepare(
        'INSERT INTO site_settings (key, value_json) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json'
      );
      if (Array.isArray(snap.site_settings)) {
        for (const s of snap.site_settings) {
          upsertSetting.run(s.key, s.value_json);
        }
      }
      db.exec('COMMIT;');
      res.json({ message: 'Backup restored successfully.' });
    } catch {
      db.exec('ROLLBACK;');
      res.status(500).json({ error: 'Failed to restore backup.' });
    }
  });

  return router;
}
