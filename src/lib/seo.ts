import { AIRLINES, getAirlineBySlug } from '../data/airlines.ts';
import { FLIGHT_DEALS } from '../data/deals.ts';
import { DESTINATIONS, getDestinationBySlug } from '../data/destinations.ts';
import { TRAVEL_GUIDES, getGuideBySlug } from '../data/guides.ts';

export interface RouteSEO {
  title: string;
  description: string;
  canonicalPath: string;
  ogType: 'website' | 'article';
  jsonLd: Record<string, unknown>[];
}

export function getRouteSEO(pathname: string, baseUrl: string): RouteSEO {
  const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const canonicalUrl = `${baseUrl}${cleanPath}`;

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SkyFare',
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    slogan: 'Fly more. Pay less.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@skyfareusa.com',
      areaServed: 'US',
      availableLanguage: 'English',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SkyFare',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  if (cleanPath === '/') {
    return {
      title: 'SkyFare — Cheap Flights & Airfare Deals from the USA',
      description:
        'Fly more, pay less. Compare verified cheap domestic and international flights from US airports with baggage rules and price alerts.',
      canonicalPath: '/',
      ogType: 'website',
      jsonLd: [
        orgSchema,
        websiteSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How does SkyFare find cheap flights from US airports?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'SkyFare monitors accredited airline feeds and travel partners including Amadeus, Travelpayouts, Skyscanner, and Expedia to surface verified 40% to 65% fare drops.',
              },
            },
            {
              '@type': 'Question',
              name: 'Are baggage fees and cabin policies shown before booking?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Every flight deal lists carry-on and personal item inclusions, cabin class, stops, and exact travel dates before sending you to book.',
              },
            },
            {
              '@type': 'Question',
              name: 'Do flight prices on SkyFare change?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Airline seat inventory updates dynamically. Each deal shows a last-updated timestamp and a realistic offer window, and prices may change at partner checkout.',
              },
            },
          ],
        },
      ],
    };
  }

  if (cleanPath === '/domestic') {
    return {
      title: 'Cheapest Domestic Flights in the USA | SkyFare',
      description:
        'Browse verified cheap US domestic flight deals across New York, Miami, Los Angeles, Seattle, and Honolulu with transparent bag policies.',
      canonicalPath: '/domestic',
      ogType: 'website',
      jsonLd: [
        orgSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
            { '@type': 'ListItem', position: 2, name: 'Domestic Flights', item: canonicalUrl },
          ],
        },
      ],
    };
  }

  if (cleanPath === '/international') {
    return {
      title: 'Cheap International Flights from the USA | SkyFare',
      description:
        'Save up to 60% on international flights from US hubs to Cancun, Paris, London, Tokyo, Rome, Dublin, and Lisbon.',
      canonicalPath: '/international',
      ogType: 'website',
      jsonLd: [
        orgSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
            { '@type': 'ListItem', position: 2, name: 'International Flights', item: canonicalUrl },
          ],
        },
      ],
    };
  }

  if (cleanPath.startsWith('/destinations/')) {
    const slug = cleanPath.replace('/destinations/', '');
    const dest = getDestinationBySlug(slug);
    if (dest) {
      const destDeals = FLIGHT_DEALS.filter((d) => d.destinationSlug === dest.slug);
      return {
        title: `Cheap Flights to ${dest.city} from $${dest.startingPrice} | SkyFare`,
        description: `Find cheap flights to ${dest.city} (${dest.airportCodes.join(', ')}) starting at $${dest.startingPrice} round-trip. Compare airlines, cheapest months, and baggage rules.`,
        canonicalPath: `/destinations/${dest.slug}`,
        ogType: 'website',
        jsonLd: [
          orgSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
              {
                '@type': 'ListItem',
                position: 2,
                name: dest.category === 'domestic' ? 'Domestic Flights' : 'International Flights',
                item: `${baseUrl}/${dest.category}`,
              },
              { '@type': 'ListItem', position: 3, name: `Flights to ${dest.city}`, item: canonicalUrl },
            ],
          },
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
          ...destDeals.slice(0, 3).map((deal) => ({
            '@context': 'https://schema.org',
            '@type': 'Offer',
            name: `${deal.originCity} (${deal.originCode}) to ${deal.destinationCity} (${deal.destinationCode}) on ${deal.airlineName}`,
            price: String(deal.price),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            validThrough: deal.expiresAt,
            url: canonicalUrl,
          })),
        ],
      };
    }
  }

  if (cleanPath.startsWith('/airlines/')) {
    const slug = cleanPath.replace('/airlines/', '');
    const airline = getAirlineBySlug(slug);
    if (airline) {
      return {
        title: `${airline.name} Flight Deals & Baggage Guide | SkyFare`,
        description: `Compare verified ${airline.name} (${airline.code}) flight deals, carry-on policies, checked bag fees, and booking tips from US hubs.`,
        canonicalPath: `/airlines/${airline.slug}`,
        ogType: 'website',
        jsonLd: [
          orgSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
              { '@type': 'ListItem', position: 2, name: `${airline.name} Deals`, item: canonicalUrl },
            ],
          },
        ],
      };
    }
  }

  if (cleanPath === '/guides') {
    return {
      title: 'Airfare & Travel Guides for US Flyers | SkyFare',
      description:
        'Read 15 original airfare guides on finding cheap flights, best booking windows, budget airline fees, and traveler refund rights.',
      canonicalPath: '/guides',
      ogType: 'website',
      jsonLd: [
        orgSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
            { '@type': 'ListItem', position: 2, name: 'Travel Guides', item: canonicalUrl },
          ],
        },
      ],
    };
  }

  if (cleanPath.startsWith('/guides/')) {
    const slug = cleanPath.replace('/guides/', '');
    const guide = getGuideBySlug(slug);
    if (guide) {
      return {
        title: guide.metaTitle,
        description: guide.metaDescription,
        canonicalPath: `/guides/${guide.slug}`,
        ogType: 'article',
        jsonLd: [
          orgSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title,
            description: guide.metaDescription,
            datePublished: guide.publishedAt,
            dateModified: guide.updatedAt,
            author: { '@type': 'Person', name: guide.author },
            publisher: { '@type': 'Organization', name: 'SkyFare' },
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
      };
    }
  }

  const staticPages: Record<string, { title: string; description: string }> = {
    '/search': {
      title: 'Search Flights, Destinations & Guides | SkyFare',
      description:
        'Search across verified US flight deals, destination guides, airline baggage rules, and airfare tutorials.',
    },
    '/about': {
      title: 'About SkyFare — Our Airfare Mission & Team',
      description:
        'Meet the analysts behind SkyFare. Learn how we verify US domestic and international flight deals without deceptive markups.',
    },
    '/contact': {
      title: 'Contact SkyFare — Support & Editorial Inquiries',
      description:
        'Get in touch with the SkyFare team in San Francisco for flight deal feedback, partnerships, or privacy requests.',
    },
    '/privacy': {
      title: 'Privacy Policy (GDPR & CCPA) | SkyFare',
      description:
        'Read how SkyFare handles cookies, price alert emails, Google AdSense, Media.net, and Revcontent advertising preferences.',
    },
    '/cookie-policy': {
      title: 'Cookie Policy & Ad Consent Controls | SkyFare',
      description:
        'Learn how essential, analytics, Google AdSense, Media.net, and Revcontent cookies operate on SkyFare.',
    },
    '/terms': {
      title: 'Terms & Conditions | SkyFare',
      description:
        'Review SkyFare terms of use, fare verification scope, and third-party airline booking responsibilities.',
    },
    '/affiliate-disclosure': {
      title: 'Affiliate & Advertising Disclosure | SkyFare',
      description:
        'Full FTC-compliant disclosure of SkyFare affiliate partnerships with Travelpayouts, Expedia, Skyscanner, and display advertising.',
    },
    '/disclaimer': {
      title: 'Airfare Pricing Disclaimer | SkyFare',
      description:
        'Important notice regarding dynamic airline fare changes, taxes, baggage policies, and visa requirements.',
    },
    '/sitemap': {
      title: 'HTML Sitemap — All Pages & Guides | SkyFare',
      description:
        'Browse every SkyFare destination page, airline deal hub, travel guide, and legal policy in one organized index.',
    },
    '/admin': {
      title: 'Admin CMS & Monetization Console | SkyFare',
      description:
        'Secure content, SEO, ad placement, user role, and database administration console for SkyFare.',
    },
  };

  if (staticPages[cleanPath]) {
    return {
      title: staticPages[cleanPath].title,
      description: staticPages[cleanPath].description,
      canonicalPath: cleanPath,
      ogType: 'website',
      jsonLd: [orgSchema],
    };
  }

  return {
    title: 'Page Not Found (404) | SkyFare',
    description: 'The requested flight deal or travel page could not be found on SkyFare.',
    canonicalPath: cleanPath,
    ogType: 'website',
    jsonLd: [orgSchema],
  };
}

export function getAllSitemapUrls(): { path: string; priority: string; changefreq: string }[] {
  return [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/domestic', priority: '0.9', changefreq: 'daily' },
    { path: '/international', priority: '0.9', changefreq: 'daily' },
    { path: '/guides', priority: '0.9', changefreq: 'weekly' },
    { path: '/search', priority: '0.7', changefreq: 'weekly' },
    ...DESTINATIONS.map((d) => ({
      path: `/destinations/${d.slug}`,
      priority: '0.8',
      changefreq: 'daily',
    })),
    ...AIRLINES.map((a) => ({
      path: `/airlines/${a.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
    ...TRAVEL_GUIDES.map((g) => ({
      path: `/guides/${g.slug}`,
      priority: '0.8',
      changefreq: 'monthly',
    })),
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact', priority: '0.6', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.4', changefreq: 'yearly' },
    { path: '/cookie-policy', priority: '0.4', changefreq: 'yearly' },
    { path: '/terms', priority: '0.4', changefreq: 'yearly' },
    { path: '/affiliate-disclosure', priority: '0.4', changefreq: 'yearly' },
    { path: '/disclaimer', priority: '0.4', changefreq: 'yearly' },
    { path: '/sitemap', priority: '0.5', changefreq: 'weekly' },
  ];
}
