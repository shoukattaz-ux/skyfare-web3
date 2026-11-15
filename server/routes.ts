import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import {
  DEFAULT_BYLINE,
  buildBootstrap,
  db,
  getPublishedDeals,
  getPublishedGuides,
  getSetting,
  setSetting,
} from './db.ts';
import {
  checkRateLimit,
  cleanText,
  clearSessionCookie,
  hashPassword,
  parseCookies,
  safeUrl,
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

/** admin + editor may change content; analysts are read-only. */
function requireContentRole(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const user = (req as express.Request & { authUser?: SessionUser }).authUser;
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    res.status(403).json({ error: 'Your role is read-only.' });
    return;
  }
  next();
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const CHECKLIST_KEYS = [
  'accuracy',
  'originality',
  'readability',
  'usefulness',
  'formatting',
  'sources',
  'images',
  'noRepetition',
  'notMisleading',
] as const;
const REVIEW_STATUSES = ['draft', 'pending_review', 'needs_revision', 'reviewed'] as const;
type ReviewStatus = (typeof REVIEW_STATUSES)[number];

function currentUser(req: express.Request): SessionUser {
  return (req as express.Request & { authUser?: SessionUser }).authUser as SessionUser;
}

function countWords(sections: { heading: string; paragraphs: string[]; bullets?: string[] }[]): number {
  const text = sections
    .map((s) => [s.heading, ...(s.paragraphs || []), ...(s.bullets || [])].join(' '))
    .join(' ');
  return text.split(/\s+/).filter(Boolean).length;
}

function cleanSections(input: unknown): {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
}[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 40).map((raw) => {
    const sec = (raw ?? {}) as Record<string, unknown>;
    const out: {
      heading: string;
      paragraphs: string[];
      bullets?: string[];
      table?: { headers: string[]; rows: string[][] };
    } = {
      heading: cleanText(sec.heading, 200),
      paragraphs: (Array.isArray(sec.paragraphs) ? sec.paragraphs : [])
        .slice(0, 40)
        .map((p) => cleanText(p, 4000))
        .filter(Boolean),
    };
    if (Array.isArray(sec.bullets)) {
      out.bullets = sec.bullets.slice(0, 40).map((b) => cleanText(b, 600)).filter(Boolean);
    }
    const t = sec.table as { headers?: unknown; rows?: unknown } | undefined;
    if (t && Array.isArray(t.headers) && Array.isArray(t.rows)) {
      out.table = {
        headers: t.headers.slice(0, 8).map((h) => cleanText(h, 80)),
        rows: t.rows
          .slice(0, 60)
          .map((r) => (Array.isArray(r) ? r.slice(0, 8).map((c) => cleanText(c, 200)) : [])),
      };
    }
    return out;
  });
}

function cleanFaqs(input: unknown): { question: string; answer: string }[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 20)
    .map((f) => ({
      question: cleanText((f as Record<string, unknown>)?.question, 200),
      answer: cleanText((f as Record<string, unknown>)?.answer, 1500),
    }))
    .filter((f) => f.question && f.answer);
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
    res.json(buildBootstrap());
  });

  router.get('/deals', (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=120');
    res.json({
      // No live fare provider is integrated: fares are entries maintained by hand in the CMS.
      provider: 'editor-curated-snapshots',
      disclaimer: 'Fares are dated snapshots, not live quotes. Prices may change without notice.',
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
    if (!checkRateLimit(`analytics:${req.ip || 'unknown'}`, 120, 10 * 60 * 1000)) {
      res.status(204).end();
      return;
    }
    const rawPath = typeof req.body?.path === 'string' ? req.body.path : '/';
    const pathVal = /^\/[A-Za-z0-9\-_/.]*$/.test(rawPath) ? rawPath.slice(0, 200) : '/';
    const eventType = req.body?.eventType === 'pageview' ? 'pageview' : 'event';
    db.prepare('INSERT INTO analytics_events (path, event_type, created_at) VALUES (?, ?, ?)').run(
      pathVal,
      eventType,
      new Date().toISOString()
    );
    res.status(204).end();
  });

  router.post('/price-alerts', (req, res) => {
    if (!getSetting<{ emailAlertsEnabled?: boolean }>('general', {}).emailAlertsEnabled) {
      res.status(503).json({ error: 'Email sign-ups are not available right now.' });
      return;
    }
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
    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
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
      message: 'Price alert saved. We will email you if a matching fare is recorded.',
    });
  });

  router.post('/newsletter', (req, res) => {
    if (!getSetting<{ emailAlertsEnabled?: boolean }>('general', {}).emailAlertsEnabled) {
      res.status(503).json({ error: 'Email sign-ups are not available right now.' });
      return;
    }
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(`news:${ip}`, 15)) {
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }
    const { email } = req.body ?? {};
    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    db.prepare(
      'INSERT INTO newsletter_subscribers (email, created_at) VALUES (?, ?) ON CONFLICT(email) DO NOTHING'
    ).run(email.trim().toLowerCase(), new Date().toISOString());
    res.status(201).json({
      message: 'You are on the list. You can unsubscribe at any time by writing to the support address.',
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
      !EMAIL_RE.test(email) ||
      typeof message !== 'string' ||
      message.trim().length < 10
    ) {
      res.status(400).json({
        error: 'Please enter your name, a valid email, and a message of at least 10 characters.',
      });
      return;
    }
    const ticketId = `SF-${crypto.randomInt(10000, 99999)}`;
    db.prepare(
      'INSERT INTO contact_messages (id, name, email, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      ticketId,
      cleanText(name, 120),
      email.trim().toLowerCase(),
      cleanText(subject || 'General Inquiry', 120),
      cleanText(message, 2500),
      'new',
      new Date().toISOString()
    );
    res.status(201).json({
      message: `Message received (reference ${ticketId}). We read every message and reply when a reply is needed.`,
    });
  });

  // --- Reader feedback (public, rate-limited) ---
  router.post('/guides/:slug/feedback', (req, res) => {
    const slug = sanitizeSlug(req.params.slug);
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(`fb:${ip}:${slug}`, 3, 60 * 60 * 1000) || !checkRateLimit(`fb:${ip}`, 40, 60 * 60 * 1000)) {
      res.status(429).json({ error: 'Thanks - you have already sent feedback for this page.' });
      return;
    }
    const exists = db.prepare("SELECT 1 FROM guides WHERE slug = ? AND status = 'published'").get(slug);
    if (!exists || typeof req.body?.helpful !== 'boolean') {
      res.status(400).json({ error: 'Invalid feedback.' });
      return;
    }
    db.prepare('INSERT INTO article_feedback (slug, helpful, created_at) VALUES (?, ?, ?)').run(
      slug,
      req.body.helpful ? 1 : 0,
      new Date().toISOString()
    );
    res.status(201).json({ message: 'Thanks for the feedback.' });
  });

  // --- Authentication ---
  router.post('/auth/login', (req, res) => {
    const ip = req.ip || 'unknown';
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const normalised = email.trim().toLowerCase().slice(0, 254);
    if (!checkRateLimit(`login:${ip}`, 12) || !checkRateLimit(`login-acct:${normalised}`, 8)) {
      res.status(429).json({ error: 'Too many login attempts. Try again in 10 minutes.' });
      return;
    }

    const user = db
      .prepare('SELECT id, email, name, role, password_hash, active FROM users WHERE email = ?')
      .get(normalised) as
      | {
          id: number;
          email: string;
          name: string;
          role: 'admin' | 'editor' | 'analyst';
          password_hash: string;
          active: number;
        }
      | undefined;

    // Always run a hash comparison so response time does not reveal whether the account exists.
    const ok = verifyPassword(password.slice(0, 200), user?.password_hash ?? DUMMY_HASH);
    if (!user || !user.active || !ok) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString());
    const sessionId = crypto.randomBytes(32).toString('hex');
    const csrfToken = crypto.randomBytes(24).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(
      'INSERT INTO sessions (id, user_id, csrf_token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(sessionId, user.id, csrfToken, expiresAt, now.toISOString());

    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    setSessionCookie(res, sessionId, Boolean(isHttps));

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
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
    res.setHeader('Cache-Control', 'no-store');
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      csrfToken: user.csrfToken,
    });
  });

  router.post('/auth/change-password', requireAuth, (req, res) => {
    const user = currentUser(req);
    const { currentPassword, newPassword } = req.body ?? {};
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 12) {
      res.status(400).json({ error: 'Provide your current password and a new one of at least 12 characters.' });
      return;
    }
    const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id) as { password_hash: string };
    if (!verifyPassword(currentPassword, row.password_hash)) {
      res.status(403).json({ error: 'Current password is incorrect.' });
      return;
    }
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), user.id);
    db.prepare('DELETE FROM sessions WHERE user_id = ? AND id != ?').run(user.id, user.sessionId);
    res.json({ ok: true });
  });

  // --- Protected Admin Endpoints ---
  router.use('/admin', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  router.get('/admin/dashboard', requireAuth, (_req, res) => {
    const dealsRows = db.prepare('SELECT id, payload_json, status, updated_at FROM deals ORDER BY updated_at DESC').all() as {
      id: string;
      payload_json: string;
      status: string;
      updated_at: string;
    }[];
    const guidesRows = db
      .prepare(
        `SELECT slug, tags, status, payload_json, review_status, reviewed_by, reviewed_at, publish_at, checklist_json, updated_at
         FROM guides ORDER BY updated_at DESC`
      )
      .all() as {
      slug: string;
      tags: string;
      status: string;
      payload_json: string;
      review_status: string;
      reviewed_by: string;
      reviewed_at: string;
      publish_at: string;
      checklist_json: string;
      updated_at: string;
    }[];

    const feedback = db
      .prepare(
        `SELECT slug, SUM(helpful) AS helpful, SUM(1 - helpful) AS not_helpful
         FROM article_feedback GROUP BY slug`
      )
      .all() as { slug: string; helpful: number; not_helpful: number }[];

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
    const authors = db.prepare('SELECT * FROM authors ORDER BY name ASC').all();

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
        reviewStatus: r.review_status,
        reviewedBy: r.reviewed_by,
        reviewedAt: r.reviewed_at,
        publishAt: r.publish_at,
        checklist: JSON.parse(r.checklist_json || '{}'),
      })),
      feedback,
      authors,
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
  router.post('/admin/deals', requireAuth, requireContentRole, (req, res) => {
    const body = req.body ?? {};
    const originCode = sanitizeText(body.originCode || 'JFK', 5).toUpperCase();
    const destinationCode = sanitizeText(body.destinationCode || 'CUN', 5).toUpperCase();
    const airlineSlug = sanitizeSlug(body.airlineSlug || 'delta');
    const id = sanitizeSlug(body.id) || `deal-${originCode.toLowerCase()}-${destinationCode.toLowerCase()}-${Date.now()}`;
    const price = Math.max(20, Number(body.price) || 199);
    const originalPrice = Math.max(price + 10, Number(body.originalPrice) || price * 2);
    const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
    const now = new Date().toISOString();
    const partner = ['Travelpayouts', 'Expedia', 'Skyscanner', 'Amadeus Partner'].includes(body.partnerName)
      ? body.partnerName
      : 'Travelpayouts';
    const affiliateUrl = safeUrl(body.affiliateUrl, { maxLen: 600 });
    if (!affiliateUrl) {
      res.status(400).json({ error: 'The booking link must be a valid http(s) URL.' });
      return;
    }

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
      partnerName: partner,
      affiliateUrl,
      imageKey: ['hero', 'nyc', 'cancun', 'tokyo', 'paris', 'terminal'].includes(body.imageKey)
        ? body.imageKey
        : 'terminal',
      customImageUrl: safeUrl(body.customImageUrl, { allowRelative: true, maxLen: 300 }) || undefined,
      highlights: Array.isArray(body.highlights)
        ? body.highlights.slice(0, 4).map((h: unknown) => sanitizeText(h, 80)).filter(Boolean)
        : [],
    };

    db.prepare(
      'INSERT INTO deals (id, payload_json, status, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload_json = excluded.payload_json, status = excluded.status, updated_at = excluded.updated_at'
    ).run(id, JSON.stringify(dealObj), body.status === 'draft' ? 'draft' : 'published', now);

    res.status(201).json({ deal: dealObj });
  });

  router.delete('/admin/deals/:id', requireAuth, requireContentRole, (req, res) => {
    db.prepare('DELETE FROM deals WHERE id = ?').run(sanitizeSlug(req.params.id));
    res.json({ ok: true });
  });

  // Guides / Posts CRUD with editorial workflow
  router.post('/admin/guides', requireAuth, requireContentRole, (req, res) => {
    const user = currentUser(req);
    const body = req.body ?? {};
    const title = cleanText(body.title, 180);
    if (title.length < 4) {
      res.status(400).json({ error: 'Post title must be at least 4 characters.' });
      return;
    }
    const slug = sanitizeSlug(body.slug || title) || `guide-${Date.now()}`;
    const sections = cleanSections(body.sections);
    if (sections.length === 0) {
      res.status(400).json({ error: 'Add at least one section with text before saving.' });
      return;
    }
    const wordCount = countWords(sections);
    const wantsPublish = body.status === 'published';
    const requestedReview: ReviewStatus = REVIEW_STATUSES.includes(body.reviewStatus)
      ? body.reviewStatus
      : 'draft';

    const existing = db
      .prepare('SELECT status, review_status, reviewed_by, reviewed_at, payload_json FROM guides WHERE slug = ?')
      .get(slug) as
      | { status: string; review_status: string; reviewed_by: string; reviewed_at: string; payload_json: string }
      | undefined;

    // Checklist: every item must be ticked to mark a guide as Reviewed.
    const rawChecklist = (body.checklist ?? {}) as Record<string, unknown>;
    const checklist: Record<string, boolean> = {};
    for (const k of CHECKLIST_KEYS) checklist[k] = rawChecklist[k] === true;
    const allChecked = CHECKLIST_KEYS.every((k) => checklist[k]);

    let reviewStatus: ReviewStatus = requestedReview;
    let reviewedBy = existing?.reviewed_by || '';
    let reviewedAt = existing?.reviewed_at || '';
    if (reviewStatus === 'reviewed') {
      if (!allChecked) {
        res.status(400).json({ error: 'Tick every item of the quality checklist before marking a guide as Reviewed.' });
        return;
      }
      if (existing?.review_status !== 'reviewed') {
        reviewedBy = user.email;
        reviewedAt = new Date().toISOString();
      }
    } else {
      reviewedBy = '';
      reviewedAt = '';
    }

    const grandfathered = existing?.status === 'published' && existing.review_status !== 'reviewed';
    if (wantsPublish && reviewStatus !== 'reviewed' && !grandfathered) {
      res.status(400).json({
        error: 'A guide can only be published after it has been marked Reviewed (tick the checklist first).',
      });
      return;
    }
    if (wordCount < 300 && wantsPublish) {
      res.status(400).json({ error: `Only ${wordCount} words: publish guides of at least 300 words of real content.` });
      return;
    }

    let publishAt = '';
    if (body.publishAt) {
      const t = new Date(String(body.publishAt));
      if (!Number.isNaN(t.getTime())) publishAt = t.toISOString();
    }

    const metaTitle = cleanText(body.metaTitle || title, 70);
    const metaDescription = cleanText(body.metaDescription || body.excerpt || title, 165);
    const category = sanitizeText(body.category || 'Booking Strategy', 60);
    const tags = sanitizeText(body.tags || '', 200);
    const authorRow = db
      .prepare('SELECT name, role FROM authors WHERE name = ? AND active = 1')
      .get(cleanText(body.author, 80)) as { name: string; role: string } | undefined;
    const author = authorRow?.name || DEFAULT_BYLINE;
    const today = new Date().toISOString().slice(0, 10);
    const prior = existing ? (JSON.parse(existing.payload_json) as { publishedAt?: string }) : undefined;

    const guideObj = {
      slug,
      title,
      metaTitle,
      metaDescription,
      category,
      tags,
      author,
      authorRole: authorRow?.role || 'Editorial',
      publishedAt: sanitizeText(body.publishedAt || prior?.publishedAt || today, 20),
      updatedAt: body.keepUpdatedDate && prior ? (body.updatedAt || today) : today,
      readTimeMinutes: Math.max(1, Math.round(wordCount / 220)),
      wordCount,
      imageKey: ['hero', 'nyc', 'cancun', 'tokyo', 'paris', 'terminal'].includes(body.imageKey)
        ? body.imageKey
        : 'terminal',
      customImageUrl: safeUrl(body.customImageUrl, { allowRelative: true, maxLen: 300 }) || undefined,
      imageAlt: cleanText(body.imageAlt, 200) || undefined,
      excerpt: cleanText(body.excerpt || metaDescription, 300),
      sections,
      faqs: cleanFaqs(body.faqs),
    };

    const status = wantsPublish ? 'published' : 'draft';
    db.exec('BEGIN;');
    try {
      if (existing) {
        db.prepare(
          'INSERT INTO guide_revisions (slug, saved_by, note, payload_json, saved_at) VALUES (?, ?, ?, ?, ?)'
        ).run(slug, user.email, cleanText(body.revisionNote, 200), existing.payload_json, new Date().toISOString());
        db.prepare(
          'DELETE FROM guide_revisions WHERE slug = ? AND id NOT IN (SELECT id FROM guide_revisions WHERE slug = ? ORDER BY id DESC LIMIT 30)'
        ).run(slug, slug);
      }
      db.prepare(
        `INSERT INTO guides (slug, title, meta_title, meta_description, category, tags, author, status, payload_json, updated_at,
                             review_status, reviewed_by, reviewed_at, publish_at, checklist_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET
           title = excluded.title, meta_title = excluded.meta_title, meta_description = excluded.meta_description,
           category = excluded.category, tags = excluded.tags, author = excluded.author, status = excluded.status,
           payload_json = excluded.payload_json, updated_at = excluded.updated_at, review_status = excluded.review_status,
           reviewed_by = excluded.reviewed_by, reviewed_at = excluded.reviewed_at, publish_at = excluded.publish_at,
           checklist_json = excluded.checklist_json`
      ).run(
        slug, title, metaTitle, metaDescription, category, tags, author, status, JSON.stringify(guideObj), today,
        reviewStatus, reviewedBy, reviewedAt, publishAt, JSON.stringify(checklist)
      );
      db.exec('COMMIT;');
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }

    res.status(201).json({ guide: { ...guideObj, status, reviewStatus, reviewedBy, reviewedAt, publishAt, checklist } });
  });

  router.get('/admin/guides/:slug/revisions', requireAuth, (req, res) => {
    const rows = db
      .prepare('SELECT id, saved_by, note, saved_at FROM guide_revisions WHERE slug = ? ORDER BY id DESC LIMIT 30')
      .all(sanitizeSlug(req.params.slug));
    res.json({ revisions: rows });
  });

  router.post('/admin/guides/:slug/revisions/:id/restore', requireAuth, requireContentRole, (req, res) => {
    const user = currentUser(req);
    const slug = sanitizeSlug(req.params.slug);
    const rev = db
      .prepare('SELECT payload_json FROM guide_revisions WHERE id = ? AND slug = ?')
      .get(Number(req.params.id), slug) as { payload_json: string } | undefined;
    const cur = db.prepare('SELECT payload_json FROM guides WHERE slug = ?').get(slug) as
      | { payload_json: string }
      | undefined;
    if (!rev || !cur) {
      res.status(404).json({ error: 'Revision not found.' });
      return;
    }
    const restored = JSON.parse(rev.payload_json);
    const today = new Date().toISOString().slice(0, 10);
    restored.updatedAt = today;
    db.exec('BEGIN;');
    db.prepare('INSERT INTO guide_revisions (slug, saved_by, note, payload_json, saved_at) VALUES (?, ?, ?, ?, ?)').run(
      slug, user.email, 'Before restoring an earlier revision', cur.payload_json, new Date().toISOString()
    );
    // A restored text has not been reviewed again.
    db.prepare(
      `UPDATE guides SET title = ?, meta_title = ?, meta_description = ?, category = ?, author = ?, payload_json = ?,
         updated_at = ?, review_status = 'pending_review', reviewed_by = '', reviewed_at = '' WHERE slug = ?`
    ).run(restored.title, restored.metaTitle, restored.metaDescription, restored.category, restored.author, JSON.stringify(restored), today, slug);
    db.exec('COMMIT;');
    res.json({ ok: true });
  });

  router.delete('/admin/guides/:slug', requireAuth, requireContentRole, (req, res) => {
    const slug = sanitizeSlug(req.params.slug);
    const row = db.prepare('SELECT payload_json FROM guides WHERE slug = ?').get(slug) as
      | { payload_json: string }
      | undefined;
    if (row) {
      // Deleting removes the guide; keep a recoverable copy in the revision log.
      db.prepare('INSERT INTO guide_revisions (slug, saved_by, note, payload_json, saved_at) VALUES (?, ?, ?, ?, ?)').run(
        slug, currentUser(req).email, 'Deleted guide (final copy)', row.payload_json, new Date().toISOString()
      );
    }
    db.prepare('DELETE FROM guides WHERE slug = ?').run(slug);
    res.json({ ok: true });
  });

  // Authors (real people only - nothing is seeded)
  router.post('/admin/authors', requireAuth, requireAdminRole, (req, res) => {
    const name = cleanText(req.body?.name, 80);
    if (name.length < 2) {
      res.status(400).json({ error: 'Author name is required.' });
      return;
    }
    db.prepare(
      `INSERT INTO authors (name, role, bio, active, created_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(name) DO UPDATE SET role = excluded.role, bio = excluded.bio, active = excluded.active`
    ).run(name, cleanText(req.body?.role, 80), cleanText(req.body?.bio, 600), req.body?.active === false ? 0 : 1, new Date().toISOString());
    res.status(201).json({ authors: db.prepare('SELECT * FROM authors ORDER BY name ASC').all() });
  });

  router.delete('/admin/authors/:id', requireAuth, requireAdminRole, (req, res) => {
    db.prepare('DELETE FROM authors WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  // Categories CRUD
  router.post('/admin/categories', requireAuth, requireContentRole, (req, res) => {
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

  router.delete('/admin/categories/:id', requireAuth, requireContentRole, (req, res) => {
    db.prepare('DELETE FROM categories WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  // Media Upload & Management (raster images only; SVG is rejected because it can carry scripts)
  const IMAGE_SIGNATURES: Record<string, (b: Buffer) => boolean> = {
    'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
    'image/webp': (b) => b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  };
  router.post('/admin/media', requireAuth, requireContentRole, (req, res) => {
    const { filename, mimeType, base64Data, altText } = req.body ?? {};
    if (!Object.hasOwn(IMAGE_SIGNATURES, String(mimeType)) || typeof base64Data !== 'string') {
      res.status(400).json({ error: 'Invalid image format. Allowed: PNG, JPEG, WebP.' });
      return;
    }
    const cleanAlt = cleanText(altText, 140);
    if (cleanAlt.length < 5) {
      res.status(400).json({ error: 'Write a short description of the image (alt text, at least 5 characters).' });
      return;
    }
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    if (buffer.length > 2 * 1024 * 1024) {
      res.status(400).json({ error: 'Image size must be under 2 MB.' });
      return;
    }
    if (!IMAGE_SIGNATURES[mimeType](buffer)) {
      res.status(400).json({ error: 'File content does not match the declared image type.' });
      return;
    }
    const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
    const safeName = `${sanitizeSlug(String(filename || 'upload').replace(/\.[^.]+$/, '')) || 'asset'}-${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(uploadsDir, safeName), buffer);

    const id = `media-${Date.now()}`;
    const url = `/uploads/${safeName}`;
    db.prepare(
      'INSERT INTO media_assets (id, filename, mime_type, size_bytes, alt_text, url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, safeName, mimeType, buffer.length, cleanAlt, url, new Date().toISOString());

    res.status(201).json({
      media: db.prepare('SELECT * FROM media_assets ORDER BY created_at DESC').all(),
    });
  });

  router.delete('/admin/media/:id', requireAuth, requireContentRole, (req, res) => {
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
    const errors: string[] = [];
    if (monetization) {
      let pub = cleanText(monetization.adsensePublisherId, 40).replace(/^ca-/, '');
      if (pub && !/^pub-\d{10,20}$/.test(pub)) {
        errors.push('AdSense publisher ID must look like pub-1234567890123456.');
        pub = '';
      }
      let mnet = cleanText(monetization.medianetCustomerId, 40);
      if (mnet && !/^[A-Za-z0-9]{4,30}$/.test(mnet)) {
        errors.push('Media.net customer ID may contain letters and digits only.');
        mnet = '';
      }
      const extra = cleanText(monetization.adsTxtExtra, 2000)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && /^[A-Za-z0-9.,#_\-=: \/]+$/.test(l))
        .join('\n');
      setSetting('monetization', {
        adsEnabled: Boolean(monetization.adsEnabled),
        adsensePublisherId: pub,
        medianetCustomerId: mnet,
        medianetSiteId: cleanText(monetization.medianetSiteId, 60).replace(/[^A-Za-z0-9_-]/g, ''),
        adsTxtExtra: extra,
      });
    }
    if (Array.isArray(placements)) {
      const stmt = db.prepare(
        'UPDATE ad_placements SET enabled = ?, ad_unit_code = ?, network = ?, ad_size = ? WHERE slot_id = ?'
      );
      for (const p of placements) {
        const network = p.network === 'Media.net' ? 'Media.net' : 'AdSense';
        const unit = cleanText(p.ad_unit_code, 40);
        if (unit && !/^[A-Za-z0-9_-]{3,40}$/.test(unit)) {
          errors.push(`Ad unit "${unit.slice(0, 20)}" may contain letters, digits, "-" and "_" only.`);
          continue;
        }
        const size = cleanText(p.ad_size, 12);
        stmt.run(p.enabled ? 1 : 0, unit, network, /^\d{2,4}x\d{2,4}$/.test(size) ? size : '', String(p.slot_id));
      }
    }
    res.status(errors.length ? 400 : 200).json({
      errors,
      monetization: getSetting('monetization', {}),
      adPlacements: db.prepare('SELECT * FROM ad_placements').all(),
    });
  });

  // General Site Settings, SEO, Menus, Homepage
  router.put('/admin/settings', requireAuth, requireAdminRole, (req, res) => {
    const { general, menus, homepage } = req.body ?? {};
    if (general) {
      const ga = cleanText(general.ga4MeasurementId, 40);
      setSetting('general', {
        siteName: sanitizeText(general.siteName || 'SkyFare', 60),
        tagline: sanitizeText(general.tagline || 'Fly more. Pay less.', 120),
        supportEmail: EMAIL_RE.test(String(general.supportEmail || '')) ? String(general.supportEmail).trim() : '',
        publisherName: cleanText(general.publisherName, 120),
        companyAddress: cleanText(general.companyAddress, 200),
        emailAlertsEnabled: Boolean(general.emailAlertsEnabled),
        defaultTitle: cleanText(general.defaultTitle, 80),
        defaultDescription: cleanText(general.defaultDescription, 170),
        gscVerificationCode: cleanText(general.gscVerificationCode, 120).replace(/[^A-Za-z0-9_-]/g, ''),
        ga4MeasurementId: /^G-[A-Z0-9]{4,20}$/i.test(ga) ? ga.toUpperCase() : '',
      });
    }
    if (Array.isArray(menus)) {
      const cleanMenus = menus
        .slice(0, 6)
        .map((m) => ({
          label: cleanText(m?.label, 30),
          path: cleanText(m?.path, 80),
        }))
        .filter((m) => m.label && /^\/(?!\/)[A-Za-z0-9\-_/]*$/.test(m.path));
      setSetting('menus', cleanMenus);
    }
    if (homepage) {
      setSetting('homepage', {
        heroTitle: cleanText(homepage.heroTitle, 140),
        heroSubtitle: cleanText(homepage.heroSubtitle, 300),
        showTopWeekly: Boolean(homepage.showTopWeekly),
        showDestinations: Boolean(homepage.showDestinations),
        showHowItWorks: Boolean(homepage.showHowItWorks),
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

  // Legal Pages CMS (previous text is backed up on every save)
  router.put('/admin/legal/:slug', requireAuth, requireAdminRole, (req, res) => {
    const slug = sanitizeSlug(req.params.slug);
    const title = cleanText(req.body?.title, 120);
    const content = cleanText(req.body?.content_markdown, 20000);
    if (!slug || !title || content.length < 40) {
      res.status(400).json({ error: 'A title and at least a short body of text are required.' });
      return;
    }
    const metaTitle = cleanText(req.body?.meta_title || title, 80);
    const metaDescription = cleanText(req.body?.meta_description, 170);
    const now = new Date().toISOString();

    const prev = db.prepare('SELECT title, content_markdown FROM legal_pages WHERE slug = ?').get(slug) as
      | { title: string; content_markdown: string }
      | undefined;
    if (prev) {
      db.prepare(
        'INSERT INTO legal_pages_backup (slug, title, content_markdown, backed_up_at, reason) VALUES (?, ?, ?, ?, ?)'
      ).run(slug, prev.title, prev.content_markdown, now, `edited by ${currentUser(req).email}`);
    }
    db.prepare(
      `INSERT INTO legal_pages (slug, title, meta_title, meta_description, content_markdown, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         title = excluded.title, meta_title = excluded.meta_title, meta_description = excluded.meta_description,
         content_markdown = excluded.content_markdown, updated_at = excluded.updated_at`
    ).run(slug, title, metaTitle, metaDescription, content, now);

    res.json({ legalPages: db.prepare('SELECT * FROM legal_pages').all() });
  });

  // Users & Roles Management (Admin-only)
  const publicUsers = () =>
    db.prepare('SELECT id, email, name, role, active, created_at FROM users ORDER BY id ASC').all();

  router.get('/admin/users', requireAuth, requireAdminRole, (_req, res) => {
    res.json({ users: publicUsers() });
  });

  router.post('/admin/users', requireAuth, requireAdminRole, (req, res) => {
    const { email, name, role, password } = req.body ?? {};
    if (typeof email !== 'string' || !EMAIL_RE.test(email) || typeof password !== 'string' || password.length < 12) {
      res.status(400).json({ error: 'A valid email and a password of at least 12 characters are required.' });
      return;
    }
    const cleanRole = ['admin', 'editor', 'analyst'].includes(role) ? role : 'editor';
    try {
      db.prepare(
        'INSERT INTO users (email, name, role, password_hash, active, created_at) VALUES (?, ?, ?, ?, 1, ?)'
      ).run(
        email.trim().toLowerCase(),
        cleanText(name || email.split('@')[0], 80),
        cleanRole,
        hashPassword(password),
        new Date().toISOString()
      );
      res.status(201).json({ users: publicUsers() });
    } catch {
      res.status(409).json({ error: 'A user with that email already exists.' });
    }
  });

  const activeAdminCount = () =>
    (db.prepare("SELECT COUNT(*) AS cnt FROM users WHERE role = 'admin' AND active = 1").get() as { cnt: number }).cnt;

  router.patch('/admin/users/:id', requireAuth, requireAdminRole, (req, res) => {
    const targetId = Number(req.params.id);
    const target = db.prepare('SELECT id, role, active FROM users WHERE id = ?').get(targetId) as
      | { id: number; role: string; active: number }
      | undefined;
    if (!target) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const role = ['admin', 'editor', 'analyst'].includes(req.body?.role) ? req.body.role : target.role;
    const active = req.body?.active === undefined ? target.active : req.body.active ? 1 : 0;
    const losesAdmin = target.role === 'admin' && target.active === 1 && (role !== 'admin' || active === 0);
    if (losesAdmin && activeAdminCount() <= 1) {
      res.status(400).json({ error: 'At least one active administrator must remain.' });
      return;
    }
    db.prepare('UPDATE users SET role = ?, active = ? WHERE id = ?').run(role, active, targetId);
    if (typeof req.body?.password === 'string') {
      if (req.body.password.length < 12) {
        res.status(400).json({ error: 'Password must be at least 12 characters.' });
        return;
      }
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(req.body.password), targetId);
    }
    if (!active || req.body?.password) db.prepare('DELETE FROM sessions WHERE user_id = ?').run(targetId);
    res.json({ users: publicUsers() });
  });

  router.delete('/admin/users/:id', requireAuth, requireAdminRole, (req, res) => {
    const targetId = Number(req.params.id);
    if (currentUser(req).id === targetId) {
      res.status(400).json({ error: 'You cannot delete your own active admin account.' });
      return;
    }
    const target = db.prepare('SELECT role, active FROM users WHERE id = ?').get(targetId) as
      | { role: string; active: number }
      | undefined;
    if (target?.role === 'admin' && target.active && activeAdminCount() <= 1) {
      res.status(400).json({ error: 'At least one active administrator must remain.' });
      return;
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
    res.json({ ok: true });
  });

  // Database Backup & Restore (Admin-only)
  router.get('/admin/backup', requireAuth, requireAdminRole, (_req, res) => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      version: 2,
      categories: db.prepare('SELECT * FROM categories').all(),
      deals: db.prepare('SELECT * FROM deals').all(),
      guides: db.prepare('SELECT * FROM guides').all(),
      authors: db.prepare('SELECT * FROM authors').all(),
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
    const now = new Date().toISOString();
    try {
      db.exec('BEGIN TRANSACTION;');
      const upsertDeal = db.prepare(
        'INSERT INTO deals (id, payload_json, status, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload_json = excluded.payload_json, status = excluded.status, updated_at = excluded.updated_at'
      );
      for (const d of snap.deals) {
        upsertDeal.run(String(d.id), String(d.payload_json), d.status === 'draft' ? 'draft' : 'published', d.updated_at || now);
      }
      const upsertGuide = db.prepare(
        `INSERT INTO guides (slug, title, meta_title, meta_description, category, tags, author, status, payload_json, updated_at,
                             review_status, reviewed_by, reviewed_at, publish_at, checklist_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET title = excluded.title, meta_title = excluded.meta_title,
           meta_description = excluded.meta_description, category = excluded.category, tags = excluded.tags,
           author = excluded.author, status = excluded.status, payload_json = excluded.payload_json,
           updated_at = excluded.updated_at, review_status = excluded.review_status, reviewed_by = excluded.reviewed_by,
           reviewed_at = excluded.reviewed_at, publish_at = excluded.publish_at, checklist_json = excluded.checklist_json`
      );
      for (const g of snap.guides) {
        upsertGuide.run(
          String(g.slug), String(g.title), String(g.meta_title ?? g.title), String(g.meta_description ?? ''),
          String(g.category ?? ''), String(g.tags ?? ''), String(g.author ?? DEFAULT_BYLINE),
          g.status === 'draft' ? 'draft' : 'published', String(g.payload_json), g.updated_at || now,
          REVIEW_STATUSES.includes(g.review_status) ? g.review_status : 'pending_review',
          String(g.reviewed_by ?? ''), String(g.reviewed_at ?? ''), String(g.publish_at ?? ''), String(g.checklist_json ?? '{}')
        );
      }
      if (Array.isArray(snap.categories)) {
        const up = db.prepare(
          'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?) ON CONFLICT(slug) DO UPDATE SET name = excluded.name, description = excluded.description'
        );
        for (const c of snap.categories) up.run(String(c.name), String(c.slug), String(c.description ?? ''));
      }
      if (Array.isArray(snap.legal_pages)) {
        const up = db.prepare(
          `INSERT INTO legal_pages (slug, title, meta_title, meta_description, content_markdown, updated_at)
           VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET title = excluded.title, meta_title = excluded.meta_title,
           meta_description = excluded.meta_description, content_markdown = excluded.content_markdown, updated_at = excluded.updated_at`
        );
        for (const l of snap.legal_pages) {
          up.run(String(l.slug), String(l.title), String(l.meta_title ?? l.title), String(l.meta_description ?? ''), String(l.content_markdown), l.updated_at || now);
        }
      }
      if (Array.isArray(snap.authors)) {
        const up = db.prepare(
          `INSERT INTO authors (name, role, bio, active, created_at) VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(name) DO UPDATE SET role = excluded.role, bio = excluded.bio, active = excluded.active`
        );
        for (const a of snap.authors) up.run(String(a.name), String(a.role ?? ''), String(a.bio ?? ''), a.active ? 1 : 0, a.created_at || now);
      }
      if (Array.isArray(snap.site_settings)) {
        const up = db.prepare(
          'INSERT INTO site_settings (key, value_json) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json'
        );
        for (const s of snap.site_settings) up.run(String(s.key), String(s.value_json));
      }
      db.exec('COMMIT;');
      res.json({ message: 'Backup restored successfully.' });
    } catch {
      db.exec('ROLLBACK;');
      res.status(500).json({ error: 'Failed to restore backup. No changes were applied.' });
    }
  });

  return router;
}

// Pre-computed hash used to equalise login timing for unknown accounts.
const DUMMY_HASH = hashPassword('not-a-real-password');
