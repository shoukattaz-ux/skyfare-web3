import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { FLIGHT_DEALS } from '../src/data/deals.ts';
import { TRAVEL_GUIDES } from '../src/data/guides.ts';
import { hashPassword } from './security.ts';

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

    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      event_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  seedInitialData();
}

function seedInitialData(): void {
  const now = new Date().toISOString();

  // 1. Seed default Admin & Editor accounts if none exist
  const userCount = (db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number }).cnt;
  if (userCount === 0) {
    const initialAdminPass = process.env.ADMIN_INITIAL_PASSWORD || 'SkyFareAdmin2026!';
    const initialEditorPass = process.env.EDITOR_INITIAL_PASSWORD || 'SkyFareEditor2026!';
    const insertUser = db.prepare(
      'INSERT INTO users (email, name, role, password_hash, active, created_at) VALUES (?, ?, ?, ?, 1, ?)'
    );
    insertUser.run('admin@skyfareusa.com', 'Elena Vance', 'admin', hashPassword(initialAdminPass), now);
    insertUser.run('editor@skyfareusa.com', 'Marcus Thorne', 'editor', hashPassword(initialEditorPass), now);
  }

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

  // 5. Seed ad placements (AdSense, Media.net, Revcontent)
  const adCount = (db.prepare('SELECT COUNT(*) as cnt FROM ad_placements').get() as { cnt: number }).cnt;
  if (adCount === 0) {
    const slots = [
      ['skyfare-top-leaderboard', 'Homepage & Category Top Leaderboard (728x90)', 'AdSense', 1, '', 96],
      ['skyfare-infeed-1', 'Deals Feed Mid-Stream Responsive Banner', 'Media.net', 1, '', 120],
      ['guide-sidebar-300x250', 'Travel Guide Sticky Sidebar (300x250)', 'AdSense', 1, '', 260],
      ['rc-skyfare-native', 'Below-Content Native Recommendations Grid', 'Revcontent', 1, '', 200],
    ];
    const insertSlot = db.prepare(
      'INSERT INTO ad_placements (slot_id, name, network, enabled, ad_unit_code, min_height) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const [id, name, net, enabled, code, mh] of slots) {
      insertSlot.run(id, name, net, enabled, code, mh);
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
        supportEmail: 'support@skyfareusa.com',
        companyAddress: '548 Market St, Suite 41290, San Francisco, CA 94104',
        defaultTitle: 'SkyFare — Cheap Flights & Airfare Deals from the USA',
        defaultDescription:
          'Fly more, pay less. Discover verified cheap domestic and international flight deals from US airports with transparent baggage policies and price alerts.',
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
        revcontentWidgetId: process.env.VITE_REVCONTENT_WIDGET_ID || 'rc-skyfare-native',
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
          'Verified domestic and international airfare drops from major US airports, complete with carry-on rules, stops, and real booking windows.',
        showTopWeekly: true,
        showDestinations: true,
        showTestimonials: true,
        showNewsletter: true,
        showFaqs: true,
      })
    );
  }

  // 8. Seed editable legal pages
  const legalCount = (db.prepare('SELECT COUNT(*) as cnt FROM legal_pages').get() as { cnt: number }).cnt;
  if (legalCount === 0) {
    const insertLegal = db.prepare(
      'INSERT INTO legal_pages (slug, title, meta_title, meta_description, content_markdown, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const defaultLegal: [string, string, string, string, string][] = [
      [
        'about',
        'About SkyFare',
        'About SkyFare — Our Airfare Mission & Team',
        'Meet the analysts behind SkyFare and learn how we verify US domestic and international flight deals without hidden markups.',
        'SkyFare Media LLC was founded in San Francisco to help US travelers find verified domestic and international flight deals with full baggage and cabin transparency.\n\nWe partner with accredited aviation feeds (Amadeus, Travelpayouts, Skyscanner, and Expedia Partner Solutions) and never charge booking markups.',
      ],
      [
        'privacy',
        'Privacy Policy',
        'Privacy Policy (GDPR, CCPA & AdSense) | SkyFare',
        'Read how SkyFare handles cookies, price alerts, Google AdSense, Media.net, and Revcontent advertising preferences.',
        'SkyFare Media LLC collects only the information you voluntarily submit via price alerts, newsletters, and our contact form. Saved deals and theme preferences remain locally in your browser.\n\nThird-party advertising partners including Google AdSense, Media.net, and Revcontent may use cookies or device identifiers to deliver relevant advertisements subject to your consent preferences under GDPR and CCPA/CPRA.',
      ],
      [
        'cookie-policy',
        'Cookie Policy',
        'Cookie Policy & Consent Controls | SkyFare',
        'Detailed breakdown of essential, analytics, and advertising cookies used on SkyFare.',
        'SkyFare uses three categories of cookies and local storage:\n\n1. Essential Storage: Keeps your theme preference, saved deals shortlist, and admin session security intact.\n2. Analytics Cookies: Measures page speed and route demand when enabled.\n3. Advertising & Native Recommendation Cookies: Supports Google AdSense, Media.net, and Revcontent ad delivery and frequency capping.',
      ],
      [
        'terms',
        'Terms & Conditions',
        'Terms & Conditions | SkyFare',
        'Review SkyFare terms of service, fare accuracy scope, and third-party airline booking responsibilities.',
        'SkyFare is an independent airfare discovery and travel editorial publisher. We do not directly sell tickets or operate aircraft. Outbound deal links direct you to accredited partner booking platforms whose terms govern final checkout.',
      ],
      [
        'affiliate-disclosure',
        'Affiliate & Advertising Disclosure',
        'Affiliate & Advertising Disclosure | SkyFare',
        'Full FTC-compliant disclosure of SkyFare affiliate partnerships and display advertising.',
        'In accordance with FTC guidelines, outbound deal buttons carry rel="sponsored nofollow" to partners including Travelpayouts, Expedia Affiliate Network, Skyscanner, and Amadeus partner platforms. SkyFare may earn a referral commission at zero additional cost to travelers.',
      ],
      [
        'disclaimer',
        'Airfare Pricing Disclaimer',
        'Airfare Pricing Disclaimer | SkyFare',
        'Important notice regarding dynamic airline fare changes, taxes, baggage fees, and travel documents.',
        'Prices may change without notice. Fares reflect observed quotes at the listed update timestamp for one adult traveler in USD. Optional checked bags, seat assignments, and visa eligibility remain the traveler responsibility.',
      ],
    ];
    for (const [slug, title, mt, md, body] of defaultLegal) {
      insertLegal.run(slug, title, mt, md, body, now);
    }
  }
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
  const rows = db
    .prepare("SELECT payload_json, tags FROM guides WHERE status = 'published'")
    .all() as { payload_json: string; tags: string }[];
  return rows.map((r) => ({ ...JSON.parse(r.payload_json), tags: r.tags }));
}
