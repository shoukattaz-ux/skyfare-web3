import { AIRLINES, getAirlineBySlug } from '../src/data/airlines.ts';
import { DESTINATIONS, getDestinationBySlug } from '../src/data/destinations.ts';
import { escapeHtml, fillTokens, markdownToHtml, type SiteTokens } from '../src/lib/markdown.ts';
import { LEGAL_SLUGS } from '../src/lib/seo.ts';
import type { FlightDeal, TravelGuide } from '../src/types/flight.ts';

export interface SnapshotContext {
  guides: TravelGuide[];
  deals: FlightDeal[];
  legal: { slug: string; title: string; content_markdown: string; updated_at: string }[];
  tokens: SiteTokens;
  menus: { label: string; path: string }[];
  homepage: { heroTitle?: string; heroSubtitle?: string };
}

const a = (href: string, text: string) => `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;

function nav(ctx: SnapshotContext): string {
  const items = ctx.menus.length
    ? ctx.menus
    : [
        { label: 'Deals', path: '/' },
        { label: 'Domestic', path: '/domestic' },
        { label: 'International', path: '/international' },
        { label: 'Guides', path: '/guides' },
      ];
  return `<nav aria-label="Main">${items.map((i) => a(i.path, i.label)).join(' · ')}</nav>`;
}

function footerLinks(): string {
  const links: [string, string][] = [
    ['/about', 'About'],
    ['/contact', 'Contact'],
    ['/editorial-policy', 'Editorial Policy'],
    ['/corrections-policy', 'Corrections Policy'],
    ['/privacy', 'Privacy Policy'],
    ['/cookie-policy', 'Cookie Policy'],
    ['/terms', 'Terms of Use'],
    ['/affiliate-disclosure', 'Advertising and Affiliate Disclosure'],
    ['/disclaimer', 'Disclaimer'],
    ['/sitemap', 'Site Map'],
  ];
  return `<footer><nav aria-label="Footer">${links.map(([h, t]) => a(h, t)).join(' · ')}</nav></footer>`;
}

function guideBody(g: TravelGuide): string {
  const sections = g.sections
    .map((s) => {
      const bullets = s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : '';
      const table = s.table
        ? `<table><thead><tr>${s.table.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows
            .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
            .join('')}</tbody></table>`
        : '';
      return `<h2>${escapeHtml(s.heading)}</h2>${s.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}${bullets}${table}`;
    })
    .join('');
  const faqs = g.faqs.length
    ? `<h2>Frequently asked questions</h2>${g.faqs.map((f) => `<h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p>`).join('')}`
    : '';
  return `<article><h1>${escapeHtml(g.title)}</h1><p>By ${escapeHtml(g.author)} · Published ${escapeHtml(g.publishedAt)} · Updated ${escapeHtml(g.updatedAt)}</p><p>${escapeHtml(g.excerpt)}</p>${sections}${faqs}</article>`;
}

/**
 * Plain, semantic HTML placed inside #root so crawlers (and users without JavaScript)
 * receive the real content in the first response. React replaces it on load.
 */
export function buildSnapshot(path: string, ctx: SnapshotContext): string {
  const head = `${nav(ctx)}`;
  const foot = footerLinks();

  if (path === '/') {
    const deals = ctx.deals.slice(0, 10)
      .map(
        (d) =>
          `<li>${escapeHtml(d.airlineName)}: ${escapeHtml(d.originCity)} (${escapeHtml(d.originCode)}) to ${escapeHtml(d.destinationCity)} (${escapeHtml(d.destinationCode)}), $${d.price} ${escapeHtml(d.tripType.toLowerCase())}, ${escapeHtml(d.baggagePolicy)}. Recorded ${escapeHtml(d.lastUpdated.slice(0, 10))}.</li>`
      )
      .join('');
    const guides = ctx.guides.slice(0, 8).map((g) => `<li>${a(`/guides/${g.slug}`, g.title)}</li>`).join('');
    return `${head}<main><h1>${escapeHtml(ctx.homepage.heroTitle || 'Airfare guides and dated fare examples from US airports')}</h1><p>${escapeHtml(ctx.homepage.heroSubtitle || '')}</p><h2>Example fares</h2><ul>${deals}</ul><p>Fares are dated snapshots, not live quotes. See the ${a('/disclaimer', 'disclaimer')}.</p><h2>Latest guides</h2><ul>${guides}</ul></main>${foot}`;
  }

  if (path === '/guides') {
    return `${head}<main><h1>Airfare and travel guides</h1><ul>${ctx.guides
      .map((g) => `<li>${a(`/guides/${g.slug}`, g.title)} – ${escapeHtml(g.excerpt)}</li>`)
      .join('')}</ul></main>${foot}`;
  }

  if (path.startsWith('/guides/')) {
    const g = ctx.guides.find((x) => x.slug === path.slice('/guides/'.length));
    if (g) return `${head}<main>${guideBody(g)}</main>${foot}`;
  }

  if (path.startsWith('/destinations/')) {
    const d = getDestinationBySlug(path.slice('/destinations/'.length));
    if (d) {
      return `${head}<main><h1>Flights to ${escapeHtml(d.city)}</h1><p>${escapeHtml(d.summary)}</p><p>Cheapest months: ${escapeHtml(d.cheapestMonths)}. Best days to fly: ${escapeHtml(d.bestDaysToFly)}.</p><h2>Airport tips</h2><p>${escapeHtml(d.airportTips)}</p>${d.faqs
        .map((f) => `<h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p>`)
        .join('')}</main>${foot}`;
    }
  }

  if (path.startsWith('/airlines/')) {
    const al = getAirlineBySlug(path.slice('/airlines/'.length));
    if (al) {
      return `${head}<main><h1>${escapeHtml(al.name)}</h1><p>${escapeHtml(al.summary)}</p><h2>Baggage and changes</h2><p>Carry-on: ${escapeHtml(al.carryOnPolicy)}</p><p>Checked bags: ${escapeHtml(al.checkedBagFee)}</p><p>Changes: ${escapeHtml(al.changePolicy)}</p><p>${escapeHtml(al.bookingTip)}</p></main>${foot}`;
    }
  }

  const slug = path.slice(1);
  if ((LEGAL_SLUGS as readonly string[]).includes(slug)) {
    const row = ctx.legal.find((l) => l.slug === slug);
    if (row) {
      return `${head}<main><h1>${escapeHtml(fillTokens(row.title, ctx.tokens))}</h1><p>Last updated ${escapeHtml(row.updated_at.slice(0, 10))}</p>${markdownToHtml(fillTokens(row.content_markdown, ctx.tokens))}</main>${foot}`;
    }
  }

  if (path === '/sitemap') {
    return `${head}<main><h1>Site map</h1><h2>Guides</h2><ul>${ctx.guides.map((g) => `<li>${a(`/guides/${g.slug}`, g.title)}</li>`).join('')}</ul><h2>Destinations</h2><ul>${DESTINATIONS.map((d) => `<li>${a(`/destinations/${d.slug}`, `Flights to ${d.city}`)}</li>`).join('')}</ul><h2>Airlines</h2><ul>${AIRLINES.map((x) => `<li>${a(`/airlines/${x.slug}`, x.name)}</li>`).join('')}</ul></main>${foot}`;
  }

  if (path === '/domestic' || path === '/international') {
    const cat = path.slice(1);
    return `${head}<main><h1>Example ${cat} flight fares</h1><ul>${ctx.deals
      .filter((d) => d.category === cat)
      .map((d) => `<li>${escapeHtml(d.airlineName)}: ${escapeHtml(d.originCity)} to ${escapeHtml(d.destinationCity)}, $${d.price} ${escapeHtml(d.tripType.toLowerCase())}, recorded ${escapeHtml(d.lastUpdated.slice(0, 10))}.</li>`)
      .join('')}</ul></main>${foot}`;
  }

  if (path === '/contact') {
    return `${head}<main><h1>Contact</h1><p>Write to ${escapeHtml(ctx.tokens.supportEmail || 'us')} or use the contact form on this page.</p></main>${foot}`;
  }

  return `${head}${foot}`;
}
