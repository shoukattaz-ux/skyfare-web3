import React, { useState } from 'react';
import {
  Bookmark,
  Calendar,
  ChevronDown,
  Moon,
  Search,
  Sun,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import type {
  AdPlacementConfig,
  FlightDeal,
  HomepageConfig,
  MonetizationSettings,
  TravelGuide,
} from '../types/flight';
import { DESTINATIONS } from '../data/destinations';
import { TRAVEL_GUIDES } from '../data/guides';
import { getImageAlt, getImageSrc, getLargeImageSrc } from '../lib/images';
import { FlightSearchBar, type SearchQueryState } from '../components/FlightSearchBar';
import { DealsExplorer } from '../components/DealsExplorer';
import { FlexibleCalendar } from '../components/FlexibleCalendar';
import { RelatedGuides } from '../components/AdSlots';
import { useSiteConfig } from '../lib/siteConfig';
import { PWAInstallButton } from '../components/PWAControls';
import { Link } from '../components/Link';

interface HomePageProps {
  deals: FlightDeal[];
  guides?: TravelGuide[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpenSaved: () => void;
  onOpenAlerts: () => void;
  onNavigate: (path: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  lockedCategory?: 'domestic' | 'international';
  adPlacements?: AdPlacementConfig[];
  monetization?: MonetizationSettings;
  homepage?: HomepageConfig;
}

export const HomePage: React.FC<HomePageProps> = ({
  deals,
  guides,
  savedIds,
  onToggleSave,
  onOpenSaved,
  onOpenAlerts,
  onNavigate,
  isDark,
  onToggleTheme,
  lockedCategory,
  adPlacements,
  monetization,
  homepage,
}) => {
  const [searchQuery, setSearchQuery] = useState<SearchQueryState>({
    tripType: 'Round-trip',
    origin: '',
    destination: '',
    departureDate: '2026-12-03',
    returnDate: '2026-12-08',
    passengers: 1,
    cabinClass: 'Economy',
    quickMode: lockedCategory || 'all',
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCalDate, setSelectedCalDate] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroTitle =
    lockedCategory === 'domestic'
      ? 'Cheapest domestic flight deals across the USA.'
      : lockedCategory === 'international'
      ? 'Cheap international flights from US hubs.'
      : homepage?.heroTitle || 'Fly more. Pay less on US & international flights.';

  const heroSubtitle =
    lockedCategory === 'domestic'
      ? 'Example fares on US domestic routes, each showing the date it was recorded, the baggage allowance and the number of stops.'
      : lockedCategory === 'international'
      ? 'Example fares from US airports to Mexico, Europe and Asia, each showing the date it was recorded, the baggage allowance and the number of stops.'
      : homepage?.heroSubtitle ||
        'Plain-English airfare guides, plus a hand-kept list of example fares from US airports with the date, baggage allowance and booking link for each.';

  const { general } = useSiteConfig();
  const alertsEnabled = general?.emailAlertsEnabled === true;
  const activeGuides = guides && guides.length > 0 ? guides : TRAVEL_GUIDES;
  const topWeeklyDeals = deals.filter((d) => d.isTopWeekly).slice(0, 3);

  const handleSearchSubmit = () => {
    const el = document.getElementById('deals-feed');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes('@')) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNewsletterStatus(data.error || 'Unable to subscribe right now. Please try again.');
        return;
      }
      setNewsletterStatus(
        data.message || 'Thanks, you are on the list.'
      );
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('Unable to subscribe right now. Please try again.');
    }
  };

  const faqs = [
    {
      q: 'Where do the fares on this site come from?',
      a: 'An editor records each fare by hand from a public booking page and notes the date. There is no live feed behind the list, which is why every card shows when the price was seen and why the price at checkout may differ.',
    },
    {
      q: 'Why does every fare card show baggage rules?',
      a: 'A low base fare can rise sharply once a carry-on or checked bag is added. Showing the allowance next to the price makes it easier to compare the real total.',
    },
    {
      q: 'Can the price change after I click through?',
      a: 'Yes, and it often does. Airlines change prices constantly and seats sell out. The booking site shows the only price that counts.',
    },
    {
      q: 'Do you charge anything, and how do you make money?',
      a: 'Using the site is free and we add no markup. Some booking links are affiliate links, so we may earn a commission if you buy; the site may also show advertising. See the Advertising and Affiliate Disclosure.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#071120] text-white">
        <div className="absolute inset-0">
          <img
            src={getLargeImageSrc('hero')}
            alt=""
            width={1280}
            height={714}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#071120]/85 via-[#071120]/65 to-[#071120]/95" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="max-w-3xl">
            <p className="text-xs font-medium tracking-wide text-sky-300">
              Airfare guides and dated fare examples · US airports
            </p>
            <h1
              className="mt-2 font-display font-bold tracking-tight text-white leading-[1.12]"
              style={{
                fontSize: 'clamp(2.15rem, 4vw, 3.5rem)',
                textWrap: 'balance',
              }}
            >
              {heroTitle}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>
          </div>

          <div className="mt-7">
            <FlightSearchBar
              query={searchQuery}
              onChange={setSearchQuery}
              onSubmitSearch={handleSearchSubmit}
            />
          </div>
        </div>
      </section>

      {/* Utility Toolbar (Theme, Saved, Flexible Calendar, PWA Install) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-[#0B1F3A] dark:text-white">
              {deals.length} example fares
            </span>
            <span aria-hidden="true">·</span>
            <span>Dated snapshots, not live quotes</span>
            <span aria-hidden="true">·</span>
            <span>Confirm the price at checkout</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={'/search'} onNavigate={onNavigate} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer">
              <Search className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Site Search</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowCalendar((prev) => !prev)}
              aria-expanded={showCalendar}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showCalendar
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300'
                  : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Flexible Dates</span>
            </button>

            <button
              type="button"
              onClick={onOpenSaved}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Bookmark className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
              <span>Saved ({savedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-slate-700" aria-hidden="true" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <PWAInstallButton variant="compact" />
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {showCalendar && (
          <FlexibleCalendar
            selectedDate={selectedCalDate}
            onSelectDate={setSelectedCalDate}
          />
        )}

        {/* Top Deals This Week (only on main home page) */}
        {!lockedCategory && (homepage ? homepage.showTopWeekly : true) && (
          <section aria-label="Top Deals This Week" className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white">
                  Top Deals This Week
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Fares our editors flagged as notable, each with the date it was recorded.
                </p>
              </div>
              {alertsEnabled && (
                <button
                  type="button"
                  onClick={onOpenAlerts}
                  className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Get alerts for deals like these</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {topWeeklyDeals.map((deal) => (
                <Link href={`/destinations/${deal.destinationSlug}`} onNavigate={onNavigate} key={deal.id} className="group text-left rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] hover:border-sky-500/50 transition-all">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img
                      src={getImageSrc(deal.imageKey)}
                      alt={getImageAlt(deal.imageKey)}
                      width={720}
                      height={538}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                      <div>
                        <div className="text-xs text-sky-300 font-medium">
                          {deal.originCode} → {deal.destinationCode} · {deal.airlineName}
                        </div>
                        <div className="text-lg font-bold">{deal.destinationCity}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold font-mono-tabular">
                          ${deal.price}
                        </div>
                        <div className="text-[11px] text-slate-200">
                          {deal.tripType.toLowerCase()} · recorded {deal.lastUpdated.slice(5, 10).replace('-', '/')}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Filterable All Deals Grid */}
        <DealsExplorer
          deals={deals}
          searchQuery={searchQuery}
          selectedCalendarDate={selectedCalDate}
          savedIds={savedIds}
          onToggleSave={onToggleSave}
          onNavigate={onNavigate}
          lockedCategory={lockedCategory}
          adPlacements={adPlacements}
          monetization={monetization}
        />

        {/* Destination Hubs Grid */}
        {(homepage ? homepage.showDestinations : true) && (
        <section aria-label="Popular Destination Guides" className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white">
                Explore Cheap Flights by Destination
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                City pages with airport tips, typical cheapest months and flight times.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {DESTINATIONS.map((dest) => (
              <Link href={`/destinations/${dest.slug}`} onNavigate={onNavigate} key={dest.slug} className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-3.5 hover:border-sky-500/50 transition-colors cursor-pointer">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {dest.country}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-[#0B1F3A] dark:text-white truncate">
                  {dest.city}
                </div>
                <div className="mt-2 text-xs font-mono-tabular font-semibold text-sky-700 dark:text-sky-400">
                  Typical from ${dest.startingPrice}
                </div>
              </Link>
            ))}
          </div>
        </section>
        )}

        {/* How the site works */}
        {(homepage ? homepage.showHowItWorks !== false : true) && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <h2 className="text-xl font-bold text-[#0B1F3A] dark:text-white">How to read the fares here</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                We are a publication, not an airline or a booking engine. Fares are example prices that an editor
                recorded by hand, so every card carries its date.
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Read our{' '}
                <Link href="/editorial-policy" onNavigate={onNavigate} className="underline">Editorial Policy</Link>{' '}
                and{' '}
                <Link href="/disclaimer" onNavigate={onNavigate} className="underline">Disclaimer</Link>.
              </p>
            </div>

            <ol className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                ['01', 'Check the date', 'Each fare shows when it was recorded. Airline prices change many times a day, so treat a fare as a pointer, not a promise.'],
                ['02', 'Read the baggage line', 'Every card states the carry-on and checked-bag allowance so you can compare the total cost, not just the base fare.'],
                ['03', 'Confirm at checkout', 'The booking link opens a third-party site. Its price at checkout is the only price that counts. Some links are affiliate links.'],
              ].map(([n, title, text]) => (
                <li key={n} className="rounded-xl bg-slate-50 dark:bg-[#0B1526] p-4 border border-slate-200/70 dark:border-slate-800">
                  <div className="text-xs font-mono-tabular font-semibold text-sky-700 dark:text-sky-400">{n}</div>
                  <h3 className="mt-1.5 text-sm font-semibold text-[#0B1F3A] dark:text-white">{title}</h3>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        )}

        {/* Newsletter & Price Alert Split */}
        {alertsEnabled && (homepage ? homepage.showNewsletter : true) && (
        <section className="rounded-2xl bg-[#0B1F3A] text-white p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Get new fare roundups by email
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Occasional emails with new guides and notable fares. Unsubscribe at any time.
            </p>
          </div>
          <div>
            {newsletterStatus ? (
              <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-4 flex items-center gap-2.5 text-sm text-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0" />
                <span>{newsletterStatus}</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email address for weekly flight deals"
                  className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-sky-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-orange-700 hover:bg-orange-800 px-5 py-3 text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Subscribe Free
                </button>
              </form>
            )}
          </div>
        </section>
        )}

        {/* Featured Editorial Guides */}
        <section aria-label="Travel Guides Preview" className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white">
                Airfare Playbooks &amp; Travel Guides
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {activeGuides.length} guides on booking timing, baggage fees, airline policies and passenger rights.
              </p>
            </div>
            <Link href={'/guides'} onNavigate={onNavigate} className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer">
              View all {activeGuides.length} guides →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeGuides.slice(0, 3).map((guide) => (
              <article
                key={guide.slug}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img
                      src={guide.customImageUrl || getImageSrc(guide.imageKey)}
                      alt={guide.imageAlt || getImageAlt(guide.imageKey)}
                      width={720}
                      height={538}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {guide.category} · {guide.readTimeMinutes} min read
                    </div>
                    <h3 className="mt-1.5 text-base font-bold text-[#0B1F3A] dark:text-white leading-snug">
                      <Link href={`/guides/${guide.slug}`} onNavigate={onNavigate} className="text-left hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                        {guide.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {guide.excerpt}
                    </p>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <Link href={`/guides/${guide.slug}`} onNavigate={onNavigate} className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline">
                    Read full guide →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        {(homepage ? homepage.showFaqs : true) && (
        <section aria-label="Frequently Asked Questions" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#0B1F3A] dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {faqs.map((item, idx) => (
              <div key={item.q} className="py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-[#0B1F3A] dark:text-white cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
        )}

        <RelatedGuides guides={activeGuides.slice(3)} onNavigate={onNavigate} title="More guides" />
      </div>
    </div>
  );
};
