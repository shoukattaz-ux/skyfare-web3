import { AIRLINES, getAirlineBySlug } from '../data/airlines.ts';
import { DESTINATIONS, getDestinationBySlug } from '../data/destinations.ts';
import { TRAVEL_GUIDES } from '../data/guides.ts';
import type { TravelGuide } from '../types/flight.ts';

/** Pages with less unique prose than this stay out of search results (and the sitemap) until expanded. */
export const MIN_INDEXABLE_WORDS = 150;
const words = (...t: string[]) => t.join(' ').split(/\s+/).filter(Boolean).length;
export const destinationWords = (d: (typeof DESTINATIONS)[number]) =>
  words(d.summary, d.airportTips, d.cheapestMonths, d.bestDaysToFly, ...(d.overview || []), ...d.faqs.flatMap((f) => [f.question, f.answer]));
export const airlineWords = (a: (typeof AIRLINES)[number]) =>
  words(a.summary, a.bookingTip, a.carryOnPolicy, a.checkedBagFee, a.changePolicy, ...(a.overview || []));

export interface RouteSEO {
  title: string;
  description: string;
  canonicalPath: string;
  ogType: 'website' | 'article';
  jsonLd: Record<string, unknown>[];
  /** false when the path matches no page (server answers 404). */
  found: boolean;
  /** true for pages that should not appear in search results. */
  noindex: boolean;
}

export interface LegalSeoRow {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  updated_at: string;
}

/** Data the server passes in so SEO reflects the CMS (database) rather than the static seed. */
export interface SeoContext {
  guides?: TravelGuide[];
  legal?: LegalSeoRow[];
  siteName?: string;
  supportEmail?: string;
  defaultImage?: string;
}

/** Slugs rendered from the legal_pages table. */
export const LEGAL_SLUGS = [
  'about',
  'editorial-policy',
  'corrections-policy',
  'privacy',
  'cookie-policy',
  'terms',
  'affiliate-disclosure',
  'disclaimer',
] as const;

const STATIC_FALLBACK: Record<string, { title: string; description: string }> = {
  '/about': {
    title: 'About SkyFare | Independent Airfare Guides and Deal Roundups',
    description: 'What SkyFare is, what it publishes, how it earns money and what it does not do.',
  },
  '/editorial-policy': {
    title: 'Editorial Policy | SkyFare',
    description: 'How SkyFare guides and fare entries are researched, reviewed, dated and updated.',
  },
  '/corrections-policy': {
    title: 'Corrections Policy | SkyFare',
    description: 'How to report an error or outdated fare on SkyFare and how corrections are handled.',
  },
  '/privacy': { title: 'Privacy Policy | SkyFare', description: 'What data SkyFare collects, why, and your choices.' },
  '/cookie-policy': { title: 'Cookie Policy | SkyFare', description: 'Cookies and browser storage used by SkyFare, and how to change your choices.' },
  '/terms': { title: 'Terms of Use | SkyFare', description: 'Terms for using SkyFare.' },
  '/affiliate-disclosure': { title: 'Advertising and Affiliate Disclosure | SkyFare', description: 'How SkyFare earns money and keeps it separate from editorial content.' },
  '/disclaimer': { title: 'Disclaimer | SkyFare', description: 'Fares on SkyFare are dated snapshots, not live quotes.' },
};

export function getRouteSEO(pathname: string, baseUrl: string, ctx: SeoContext = {}): RouteSEO {
  const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const canonicalUrl = `${baseUrl}${cleanPath}`;
  const guides = ctx.guides ?? TRAVEL_GUIDES;
  const siteName = ctx.siteName || 'SkyFare';

  const orgSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: baseUrl,
    logo: `${baseUrl}/pwa-512x512.png`,
    ...(ctx.supportEmail
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: ctx.supportEmail,
            availableLanguage: 'English',
          },
        }
      : {}),
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const crumbs = (items: { name: string; path: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      ...items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: it.name,
        item: `${baseUrl}${it.path}`,
      })),
    ],
  });

  const make = (
    seo: Pick<RouteSEO, 'title' | 'description' | 'canonicalPath'> &
      Partial<Pick<RouteSEO, 'ogType' | 'noindex'>> & { jsonLd?: Record<string, unknown>[] }
  ): RouteSEO => ({
    ogType: 'website',
    noindex: false,
    jsonLd: [orgSchema],
    found: true,
    ...seo,
  });

  if (cleanPath === '/') {
    return make({
      title: `${siteName} | Airfare Guides and Dated Fare Examples from US Airports`,
      description:
        'Plain-English airfare guides and a hand-kept list of example flight prices from US airports, each with its date, baggage allowance and booking link.',
      canonicalPath: '/',
      jsonLd: [orgSchema, websiteSchema],
    });
  }

  if (cleanPath === '/domestic') {
    return make({
      title: `Example Domestic Flight Fares from US Airports | ${siteName}`,
      description:
        'Dated example fares on US domestic routes, with the baggage allowance, stops and travel dates for each. Prices change fast: confirm at checkout.',
      canonicalPath: '/domestic',
      jsonLd: [orgSchema, crumbs([{ name: 'Domestic Flights', path: '/domestic' }])],
    });
  }

  if (cleanPath === '/international') {
    return make({
      title: `Example International Flight Fares from the USA | ${siteName}`,
      description:
        'Dated example fares from US airports to Mexico, Europe and Asia, with baggage allowance and stops shown for each. Prices change fast: confirm at checkout.',
      canonicalPath: '/international',
      jsonLd: [orgSchema, crumbs([{ name: 'International Flights', path: '/international' }])],
    });
  }

  if (cleanPath.startsWith('/destinations/')) {
    const dest = getDestinationBySlug(cleanPath.replace('/destinations/', ''));
    if (dest) {
      return make({
        title: `Flights to ${dest.city}: Cheapest Months, Airports and Tips | ${siteName}`,
        description: `Planning a trip to ${dest.city} (${dest.airportCodes.join(', ')})? Typical fares, cheapest months, flight times from the US and airport tips.`,
        canonicalPath: `/destinations/${dest.slug}`,
        noindex: destinationWords(dest) < MIN_INDEXABLE_WORDS,
        jsonLd: [
          orgSchema,
          crumbs([
            { name: dest.category === 'domestic' ? 'Domestic Flights' : 'International Flights', path: `/${dest.category}` },
            { name: `Flights to ${dest.city}`, path: `/destinations/${dest.slug}` },
          ]),
          ...(dest.faqs.length > 0
            ? [
                {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: dest.faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.question,
                    acceptedAnswer: { '@type': 'Answer', text: f.answer },
                  })),
                },
              ]
            : []),
        ],
      });
    }
  }

  if (cleanPath.startsWith('/airlines/')) {
    const airline = getAirlineBySlug(cleanPath.replace('/airlines/', ''));
    if (airline) {
      return make({
        title: `${airline.name}: Baggage Fees, Fare Rules and Example Fares | ${siteName}`,
        description: `What to know about flying ${airline.name} (${airline.code}) from US hubs: carry-on and checked-bag rules, change policy and booking tips. Confirm current rules with the airline.`,
        canonicalPath: `/airlines/${airline.slug}`,
        noindex: airlineWords(airline) < MIN_INDEXABLE_WORDS,
        jsonLd: [orgSchema, crumbs([{ name: `${airline.name}`, path: `/airlines/${airline.slug}` }])],
      });
    }
  }

  if (cleanPath === '/guides') {
    return make({
      title: `Airfare and Travel Guides for US Flyers | ${siteName}`,
      description: `Read ${guides.length} guides on booking timing, baggage fees, airline policies, airport programs and passenger rights.`,
      canonicalPath: '/guides',
      jsonLd: [orgSchema, crumbs([{ name: 'Travel Guides', path: '/guides' }])],
    });
  }

  if (cleanPath.startsWith('/guides/')) {
    const guide = guides.find((g) => g.slug === cleanPath.replace('/guides/', ''));
    if (guide) {
      const isTeam = /editorial team$/i.test(guide.author);
      return make({
        title: guide.metaTitle,
        description: guide.metaDescription,
        canonicalPath: `/guides/${guide.slug}`,
        ogType: 'article',
        jsonLd: [
          orgSchema,
          crumbs([
            { name: 'Travel Guides', path: '/guides' },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title.slice(0, 110),
            description: guide.metaDescription,
            datePublished: guide.publishedAt,
            dateModified: guide.updatedAt,
            author: isTeam
              ? { '@type': 'Organization', name: siteName, url: baseUrl }
              : { '@type': 'Person', name: guide.author },
            publisher: { '@type': 'Organization', name: siteName },
            mainEntityOfPage: canonicalUrl,
          },
          ...(guide.faqs.length > 0
            ? [
                {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: guide.faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.question,
                    acceptedAnswer: { '@type': 'Answer', text: f.answer },
                  })),
                },
              ]
            : []),
        ],
      });
    }
  }

  const legalSlug = cleanPath.slice(1);
  if ((LEGAL_SLUGS as readonly string[]).includes(legalSlug)) {
    const row = ctx.legal?.find((l) => l.slug === legalSlug);
    const fb = STATIC_FALLBACK[cleanPath];
    return make({
      title: row?.meta_title || fb.title,
      description: row?.meta_description || fb.description,
      canonicalPath: cleanPath,
      jsonLd: [orgSchema, crumbs([{ name: row?.title || fb.title.split('|')[0].trim(), path: cleanPath }])],
    });
  }

  if (cleanPath === '/contact') {
    return make({
      title: `Contact ${siteName} | Questions, Corrections and Privacy Requests`,
      description: `Send a question, correction or privacy request to ${siteName}. Use the form or write to the support address.`,
      canonicalPath: '/contact',
      jsonLd: [orgSchema, crumbs([{ name: 'Contact', path: '/contact' }])],
    });
  }

  if (cleanPath === '/sitemap') {
    return make({
      title: `Site Map | ${siteName}`,
      description: 'Every guide, destination, airline page and policy on the site in one list.',
      canonicalPath: '/sitemap',
    });
  }

  if (cleanPath === '/search') {
    return make({
      title: `Search | ${siteName}`,
      description: 'Search guides, destinations, airlines and example fares.',
      canonicalPath: '/search',
      noindex: true,
    });
  }

  if (cleanPath === '/admin') {
    return make({
      title: `Admin | ${siteName}`,
      description: 'Restricted area.',
      canonicalPath: '/admin',
      noindex: true,
      jsonLd: [],
    });
  }

  return {
    title: `Page not found | ${siteName}`,
    description: 'The page you asked for does not exist or has moved.',
    canonicalPath: cleanPath,
    ogType: 'website',
    jsonLd: [],
    found: false,
    noindex: true,
  };
}

export interface SitemapEntry {
  path: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
}

/** Static (code-defined) pages. Guides and legal pages are added by the server from the database. */
export function getStaticSitemapUrls(): SitemapEntry[] {
  return [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/domestic', priority: '0.8', changefreq: 'daily' },
    { path: '/international', priority: '0.8', changefreq: 'daily' },
    { path: '/guides', priority: '0.9', changefreq: 'weekly' },
    ...DESTINATIONS.filter((d) => destinationWords(d) >= MIN_INDEXABLE_WORDS).map((d) => ({ path: `/destinations/${d.slug}`, priority: '0.7', changefreq: 'weekly' })),
    ...AIRLINES.filter((a) => airlineWords(a) >= MIN_INDEXABLE_WORDS).map((a) => ({ path: `/airlines/${a.slug}`, priority: '0.7', changefreq: 'monthly' })),
    { path: '/contact', priority: '0.4', changefreq: 'yearly' },
    { path: '/sitemap', priority: '0.3', changefreq: 'weekly' },
  ];
}
