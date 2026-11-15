import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { FLIGHT_DEALS } from '../src/data/deals.ts';
import { TRAVEL_GUIDES } from '../src/data/guides.ts';
import crypto from 'node:crypto';
import { hashPassword, verifyPassword } from './security.ts';
import { LEGAL_SEED, LEGAL_SEED_VERSION } from './legalSeed.ts';
import { MIN_PUBLISH_WORDS, countGuideWords, readMinutes } from '../src/lib/guideStats.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'skyfare.db');
export const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'editor', 'analyst')),
      password_hash TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      csrf_token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY,
      payload_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS guides (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      meta_title TEXT NOT NULL,
      meta_description TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      alt_text TEXT NOT NULL,
      url TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ad_placements (
      slot_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      network TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      ad_unit_code TEXT NOT NULL DEFAULT '',
      min_height INTEGER NOT NULL DEFAULT 100
    );

    CREATE TABLE IF NOT EXISTS legal_pages (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      meta_title TEXT NOT NULL,
      meta_description TEXT NOT NULL,
      content_markdown TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS price_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      max_price INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      email TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS guide_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      saved_by TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      payload_json TEXT NOT NULL,
      saved_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_guide_revisions_slug ON guide_revisions(slug, id DESC);

    CREATE TABLE IF NOT EXISTS article_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      helpful INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_article_feedback_slug ON article_feedback(slug);

    CREATE TABLE IF NOT EXISTS legal_pages_backup (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      content_markdown TEXT NOT NULL,
      backed_up_at TEXT NOT NULL,
      reason TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      event_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  addColumnIfMissing('guides', 'review_status', "TEXT NOT NULL DEFAULT 'pending_review'");
  addColumnIfMissing('guides', 'reviewed_by', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('guides', 'reviewed_at', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('guides', 'publish_at', "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing('guides', 'checklist_json', "TEXT NOT NULL DEFAULT '{}'");
  addColumnIfMissing('ad_placements', 'ad_size', "TEXT NOT NULL DEFAULT ''");
  db.exec('CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);');

  seedInitialData();
  migrateLegacyContent();
}

function addColumnIfMissing(table: string, column: string, ddl: string): void {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  }
}

export const DEFAULT_BYLINE = 'SkyFare Editorial Team';

/**
 * One-time, non-destructive content migration for databases created by the original
 * build. Anything replaced is first copied into a backup table (legal pages) or the
 * guide revision history (guides), so nothing is lost.
 */
function migrateLegacyContent(): void {
  const version = getSetting<number>('content_version', 0);
  if (version >= LEGAL_SEED_VERSION) return;
  const now = new Date().toISOString();

  db.exec('BEGIN;');
  try {
    // 1. Legal/trust pages: back up whatever is stored, then install the accurate texts.
    const existing = db.prepare('SELECT slug, title, content_markdown FROM legal_pages').all() as {
      slug: string;
      title: string;
      content_markdown: string;
    }[];
    const backup = db.prepare(
      'INSERT INTO legal_pages_backup (slug, title, content_markdown, backed_up_at, reason) VALUES (?, ?, ?, ?, ?)'
    );
    for (const row of existing) {
      backup.run(row.slug, row.title, row.content_markdown, now, `pre-v${LEGAL_SEED_VERSION} content audit`);
    }
    const upsert = db.prepare(
      `INSERT INTO legal_pages (slug, title, meta_title, meta_description, content_markdown, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET title = excluded.title, meta_title = excluded.meta_title,
         meta_description = excluded.meta_description, content_markdown = excluded.content_markdown,
         updated_at = excluded.updated_at`
    );
    for (const p of LEGAL_SEED) {
      upsert.run(p.slug, p.title, p.metaTitle, p.metaDescription, p.content, now);
    }

    // 2. Replace invented author personas with a neutral byline (revision kept).
    const fakeNames = ['Elena Vance', 'Marcus Thorne', 'Claire Lindqvist'];
    const guides = db.prepare('SELECT slug, payload_json FROM guides').all() as {
      slug: string;
      payload_json: string;
    }[];
    const snap = db.prepare(
      'INSERT INTO guide_revisions (slug, saved_by, note, payload_json, saved_at) VALUES (?, ?, ?, ?, ?)'
    );
    const upd = db.prepare('UPDATE guides SET author = ?, payload_json = ?, status = ?, review_status = ? WHERE slug = ?');
    for (const g of guides) {
      const payload = JSON.parse(g.payload_json);
      const row = db.prepare('SELECT status, review_status FROM guides WHERE slug = ?').get(g.slug) as {
        status: string;
        review_status: string;
      };
      let changed = false;
      if (fakeNames.includes(payload.author)) {
        payload.author = DEFAULT_BYLINE;
        payload.authorRole = 'Editorial';
        changed = true;
      }
      for (const key of ['excerpt', 'metaDescription'] as const) {
        const before = payload[key];
        if (typeof before === 'string') {
          const after = before
            .replace('and how you can consistently pay 40% to 60% less.', 'and the practical habits that tend to bring fares down.')
            .replace('safer ways to capture 60%+ airfare discounts.', 'safer ways to find lower fares.')
            .replace('Find verified student airfare discounts on', 'Find student airfare discounts on');
          if (after !== before) {
            payload[key] = after;
            changed = true;
          }
        }
      }
      // The seed data declared word counts of 740-1,280 for guides of 60-150 words. Use the real figure.
      const words = countGuideWords(payload);
      if (payload.wordCount !== words) {
        payload.wordCount = words;
        payload.readTimeMinutes = readMinutes(words);
        changed = true;
      }
      let status = row.status;
      let review = row.review_status;
      if (words < MIN_PUBLISH_WORDS && status === 'published') {
        // Too thin to be public. Kept intact as a draft so it can be expanded and re-published.
        status = 'draft';
        review = 'needs_revision';
        changed = true;
      }
      if (changed) {
        snap.run(g.slug, 'system', 'Before content audit (byline, real word count, thin-content gate)', g.payload_json, now);
        upd.run(payload.author, JSON.stringify(payload), status, review, g.slug);
      }
    }

    // 3. Remove the Revcontent placeholder slot (native "sponsored" widget is no longer offered).
    db.prepare("DELETE FROM ad_placements WHERE network = 'Revcontent' AND ad_unit_code = ''").run();

    // 4. Settings: drop the invented company address and make new flags explicit.
    const general = getSetting<Record<string, unknown>>('general', {});
    if (typeof general.companyAddress === 'string' && general.companyAddress.includes('548 Market St')) {
      general.companyAddress = '';
    }
    if (typeof general.defaultTitle === 'string' && general.defaultTitle.startsWith('SkyFare — Cheap Flights')) {
      general.defaultTitle = 'SkyFare | Airfare Guides and Dated Fare Examples from US Airports';
    }
    if (typeof general.defaultDescription === 'string' && /verified cheap/i.test(general.defaultDescription)) {
      general.defaultDescription =
        'Plain-English airfare guides and a hand-kept list of example flight prices from US airports, each with its date, baggage allowance and booking link.';
    }
    if (general.emailAlertsEnabled === undefined) general.emailAlertsEnabled = false;
    if (general.publisherName === undefined) general.publisherName = '';
    setSetting('general', general);

    const mon = getSetting<Record<string, unknown>>('monetization', {});
    delete mon.revcontentWidgetId;
    if (mon.adsEnabled === undefined) mon.adsEnabled = false;
    setSetting('monetization', mon);

    const homepage = getSetting<Record<string, unknown>>('homepage', {});
    delete homepage.showTestimonials;
    if (typeof homepage.heroSubtitle === 'string' && /verified/i.test(homepage.heroSubtitle)) {
      homepage.heroSubtitle =
        'Plain-English airfare guides, plus a hand-kept list of example fares from US airports with the date, baggage allowance and booking link for each.';
    }
    if (homepage.showHowItWorks === undefined) homepage.showHowItWorks = true;
    setSetting('homepage', homepage);

    // 5. Known public default credentials must never stay usable.
    for (const [email, pw] of [
      ['admin@skyfareusa.com', 'SkyFareAdmin2026!'],
      ['editor@skyfareusa.com', 'SkyFareEditor2026!'],
    ]) {
      const u = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email) as
        | { id: number; password_hash: string }
        | undefined;
      if (u && verifyPassword(pw, u.password_hash)) {
        db.prepare('UPDATE users SET active = 0 WHERE id = ?').run(u.id);
        db.prepare('DELETE FROM sessions WHERE user_id = ?').run(u.id);
        console.warn(`[security] Disabled account ${email}: it still used the publicly documented default password.`);
      }
    }
    ensureActiveAdmin();

    setSetting('content_version', LEGAL_SEED_VERSION);
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

function ensureActiveAdmin(): void {
  const row = db.prepare("SELECT COUNT(*) AS cnt FROM users WHERE role = 'admin' AND active = 1").get() as {
    cnt: number;
  };
  if (row.cnt > 0) return;
  const email = (process.env.ADMIN_EMAIL || 'admin@skyfare.local').trim().toLowerCase();
  let password = process.env.ADMIN_INITIAL_PASSWORD;
  let generated = false;
  if (!password || password.length < 12) {
    password = crypto.randomBytes(15).toString('base64url');
    generated = true;
  }
  db.prepare('DELETE FROM users WHERE email = ?').run(email);
  db.prepare(
    "INSERT INTO users (email, name, role, password_hash, active, created_at) VALUES (?, 'Site Administrator', 'admin', ?, 1, ?)"
  ).run(email, hashPassword(password), new Date().toISOString());
  console.warn('[security] Created the initial administrator account.');
  console.warn(`[security]   email:    ${email}`);
  if (generated) {
    console.warn(`[security]   password: ${password}   (generated, shown once - change it after signing in)`);
  } else {
    console.warn('[security]   password: taken from ADMIN_INITIAL_PASSWORD');
  }
}

function seedInitialData(): void {
  const now = new Date().toISOString();

  // 1. Administrator account is created by ensureActiveAdmin() (no default passwords).

  // 2. Seed categories
  const catCount = (db.prepare('SELECT COUNT(*) as cnt FROM categories').get() as { cnt: number }).cnt;
  if (catCount === 0) {
    const defaultCats = [
      ['Booking Strategy', 'booking-strategy', 'Actionable timing and routing tactics for lower airfare.'],
      ['Timing & Seasons', 'timing-seasons', 'Data-backed booking windows across domestic and global seasons.'],
      ['Airline Guides', 'airline-guides', 'Carrier baggage fees, cabin rules, and fare tiers compared.'],
      ['International Deals', 'international-deals', 'Transatlantic, Mexico, and transpacific fare guides.'],
      ['Travel Rules', 'travel-rules', 'Airline contracts of carriage, error fares, and dot rules.'],
      ['Airport Hacks', 'airport-hacks', 'Security clearance, lounge access, and transit tips.'],
      ['Packing & Fees', 'packing-fees', 'Carry-on dimensions and avoiding surprise gate fees.'],
      ['Family Travel', 'family-travel', 'Adjacent seating rules and stroller policies.'],
      ['Student Travel', 'student-travel', 'Young adult discounts and .edu fare portals.'],
      ['Traveler Rights', 'traveler-rights', 'US DOT cash refunds and EU261 compensation guides.'],
      ['Beach & Mexico', 'beach-mexico', 'Cancun, Riviera Maya, and Caribbean airfare tips.'],
    ];
    const insertCat = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
    for (const [name, slug, desc] of defaultCats) {
      insertCat.run(name, slug, desc);
    }
  }

  // 3. Seed 32 deals
  const dealCount = (db.prepare('SELECT COUNT(*) as cnt FROM deals').get() as { cnt: number }).cnt;
  if (dealCount === 0) {
    const insertDeal = db.prepare(
      'INSERT INTO deals (id, payload_json, status, updated_at) VALUES (?, ?, ?, ?)'
    );
    for (const deal of FLIGHT_DEALS) {
      insertDeal.run(deal.id, JSON.stringify(deal), 'published', deal.lastUpdated);
    }
  }

  // 4. Seed 15 guides
  const guideCount = (db.prepare('SELECT COUNT(*) as cnt FROM guides').get() as { cnt: number }).cnt;
  if (guideCount === 0) {
    const insertGuide = db.prepare(
      'INSERT INTO guides (slug, title, meta_title, meta_description, category, tags, author, status, payload_json, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const g of TRAVEL_GUIDES) {
      insertGuide.run(
        g.slug,
        g.title,
        g.metaTitle,
        g.metaDescription,
        g.category,
        `${g.category.toLowerCase()}, cheap flights, usa travel`,
        g.author,
        'published',
        JSON.stringify(g),
        g.updatedAt
      );
    }
  }

  // 5. Seed ad placements (inactive until a publisher ID, a unit and the master switch are set)
  const adCount = (db.prepare('SELECT COUNT(*) as cnt FROM ad_placements').get() as { cnt: number }).cnt;
  if (adCount === 0) {
    const slots = [
      ['skyfare-top-leaderboard', 'Top of page banner (list pages)', 'AdSense', 0, '', 100, '728x90'],
      ['skyfare-infeed-1', 'In-feed banner between deal rows', 'Media.net', 0, '', 120, '728x90'],
      ['guide-sidebar-300x250', 'Guide page sidebar rectangle', 'AdSense', 0, '', 260, '300x250'],
    ];
    const insertSlot = db.prepare(
      'INSERT INTO ad_placements (slot_id, name, network, enabled, ad_unit_code, min_height, ad_size) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const [id, name, net, enabled, code, mh, size] of slots) {
      insertSlot.run(id, name, net, enabled, code, mh, size);
    }
  }

  // 6. Seed media assets metadata
  const mediaCount = (db.prepare('SELECT COUNT(*) as cnt FROM media_assets').get() as { cnt: number }).cnt;
  if (mediaCount === 0) {
    const seedMedia = [
      ['media-hero', 'hero_aviation_golden.jpg', 'image/jpeg', 620240, 'Commercial airliner wingtip above sunlit clouds at golden hour', 'hero', now],
      ['media-nyc', 'dest_nyc_skyline.jpg', 'image/jpeg', 976710, 'Manhattan skyline and Brooklyn Bridge at twilight', 'nyc', now],
      ['media-cancun', 'dest_cancun_turquoise.jpg', 'image/jpeg', 989060, 'Turquoise Caribbean beach in Cancun Mexico', 'cancun', now],
      ['media-tokyo', 'dest_tokyo_twilight.jpg', 'image/jpeg', 1032430, 'Tokyo skyline with Tokyo Tower and Mount Fuji silhouette', 'tokyo', now],
      ['media-paris', 'dest_paris_morning.jpg', 'image/jpeg', 932680, 'Paris rooftops and Eiffel Tower over the Seine', 'paris', now],
      ['media-terminal', 'guide_terminal_sunrise.jpg', 'image/jpeg', 858000, 'Modern airport departure concourse at sunrise', 'terminal', now],
    ];
    const insertMedia = db.prepare(
      'INSERT INTO media_assets (id, filename, mime_type, size_bytes, alt_text, url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const row of seedMedia) {
      insertMedia.run(...row);
    }
  }

  // 7. Seed site settings (Menus, Homepage sections, SEO/Ad networks config)
  const settingsCount = (db.prepare('SELECT COUNT(*) as cnt FROM site_settings').get() as { cnt: number }).cnt;
  if (settingsCount === 0) {
    const insertSetting = db.prepare('INSERT INTO site_settings (key, value_json) VALUES (?, ?)');
    insertSetting.run(
      'general',
      JSON.stringify({
        siteName: 'SkyFare',
        tagline: 'Fly more. Pay less.',
        supportEmail: process.env.SUPPORT_EMAIL || '',
        publisherName: '',
        companyAddress: '',
        emailAlertsEnabled: false,
        defaultTitle: 'SkyFare | Airfare Guides and Dated Fare Examples from US Airports',
        defaultDescription:
          'Plain-English airfare guides and a hand-kept list of example flight prices from US airports, each with its date, baggage allowance and booking link.',
        gscVerificationCode: '',
        ga4MeasurementId: process.env.VITE_GA4_MEASUREMENT_ID || '',
      })
    );
    insertSetting.run(
      'monetization',
      JSON.stringify({
        adsensePublisherId: process.env.VITE_ADSENSE_PUBLISHER_ID || '',
        medianetCustomerId: '',
        medianetSiteId: '',
        adsEnabled: false,
        adsTxtExtra: '',
      })
    );
    insertSetting.run(
      'menus',
      JSON.stringify([
        { label: 'Deals', path: '/' },
        { label: 'Domestic', path: '/domestic' },
        { label: 'International', path: '/international' },
        { label: 'Guides', path: '/guides' },
      ])
    );
    insertSetting.run(
      'homepage',
      JSON.stringify({
        heroTitle: 'Fly more. Pay less on US & international flights.',
        heroSubtitle:
          'Plain-English airfare guides, plus a hand-kept list of example fares from US airports with the date, baggage allowance and booking link for each.',
        showTopWeekly: true,
        showDestinations: true,
        showHowItWorks: true,
        showNewsletter: true,
        showFaqs: true,
      })
    );
  }

  // 8. Legal pages are installed by migrateLegacyContent() from server/legalSeed.ts
}

export function getSetting<T>(key: string, fallback: T): T {
  const row = db.prepare('SELECT value_json FROM site_settings WHERE key = ?').get(key) as
    | { value_json: string }
    | undefined;
  if (!row) return fallback;
  try {
    return JSON.parse(row.value_json) as T;
  } catch {
    return fallback;
  }
}

export function setSetting(key: string, value: unknown): void {
  db.prepare(
    'INSERT INTO site_settings (key, value_json) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json'
  ).run(key, JSON.stringify(value));
}

export function getPublishedDeals() {
  const rows = db
    .prepare("SELECT payload_json FROM deals WHERE status = 'published'")
    .all() as { payload_json: string }[];
  return rows.map((r) => JSON.parse(r.payload_json));
}

export function getPublishedGuides() {
  const nowIso = new Date().toISOString();
  const rows = db
    .prepare(
      `SELECT payload_json, tags, review_status, reviewed_at, publish_at
       FROM guides
       WHERE status = 'published' AND (publish_at = '' OR publish_at <= ?)`
    )
    .all(nowIso) as {
    payload_json: string;
    tags: string;
    review_status: string;
    reviewed_at: string;
    publish_at: string;
  }[];
  return rows.map((r) => ({
    ...JSON.parse(r.payload_json),
    tags: r.tags,
    reviewStatus: r.review_status,
    reviewedAt: r.reviewed_at || undefined,
  }));
}

export function getActiveAuthors() {
  return db
    .prepare('SELECT id, name, role, bio FROM authors WHERE active = 1 ORDER BY name ASC')
    .all() as { id: number; name: string; role: string; bio: string }[];
}

/** Everything the public site needs on first load. Used by /api/bootstrap and embedded in the page HTML. */
export function buildBootstrap() {
  const { adsTxtExtra: _omit, ...monetization } = getSetting<Record<string, unknown>>('monetization', {});
  return {
    deals: getPublishedDeals(),
    guides: getPublishedGuides(),
    categories: db.prepare('SELECT id, name, slug, description FROM categories ORDER BY name ASC').all(),
    adPlacements: db
      .prepare('SELECT slot_id, name, network, enabled, ad_unit_code, min_height, ad_size FROM ad_placements')
      .all(),
    legalPages: db
      .prepare('SELECT slug, title, meta_title, meta_description, content_markdown, updated_at FROM legal_pages')
      .all(),
    general: getSetting('general', {}),
    monetization,
    menus: getSetting('menus', []),
    homepage: getSetting('homepage', {}),
    authors: getActiveAuthors(),
  };
}
