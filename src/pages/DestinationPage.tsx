import React from 'react';
import { ArrowLeft, MapPin, Plane, Info } from 'lucide-react';
import type {
  AdPlacementConfig,
  FlightDeal,
  MonetizationSettings,
  TravelGuide,
} from '../types/flight';
import { DESTINATIONS, getDestinationBySlug } from '../data/destinations';
import { getImageAlt, getLargeImageSrc } from '../lib/images';
import { DealCard } from '../components/DealCard';
import { RelatedGuides } from '../components/AdSlots';
import { useSiteConfig } from '../lib/siteConfig';
import { SocialShare } from '../components/SocialShare';
import { Link } from '../components/Link';

interface DestinationPageProps {
  slug: string;
  deals: FlightDeal[];
  guides?: TravelGuide[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onNavigate: (path: string) => void;
  onOpenAlerts: () => void;
  adPlacements?: AdPlacementConfig[];
  monetization?: MonetizationSettings;
}

export const DestinationPage: React.FC<DestinationPageProps> = ({
  slug,
  deals,
  guides,
  savedIds,
  onToggleSave,
  onNavigate,
  onOpenAlerts,
  adPlacements,
  monetization,
}) => {
  const { general } = useSiteConfig();
  const alertsEnabled = general?.emailAlertsEnabled === true;
  const dest = getDestinationBySlug(slug);

  if (!dest) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#0B1F3A] dark:text-white">
          Destination Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          We couldn't find a destination guide for "{slug}".
        </p>
        <Link href={'/'} onNavigate={onNavigate} className="mt-6 rounded-lg bg-orange-700 px-5 py-2.5 text-sm font-semibold text-white">
          Browse All Flight Deals
        </Link>
      </div>
    );
  }

  const cityDeals = deals.filter((d) => d.destinationSlug === dest.slug);
  const relatedDestinations = DESTINATIONS.filter(
    (d) => d.slug !== dest.slug && d.category === dest.category
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href={'/'} onNavigate={onNavigate} className="hover:text-[#0B1F3A] dark:hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Home</span>
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${dest.category}`} onNavigate={onNavigate} className="hover:text-[#0B1F3A] dark:hover:text-white capitalize">
          {dest.category} Flights
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-slate-800 dark:text-slate-200">
          Cheap Flights to {dest.city}
        </span>
      </nav>

      {/* Destination Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] overflow-hidden">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-sky-700 dark:text-sky-400">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {dest.country} · Airports: {dest.airportCodes.join(', ')}
              </span>
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
              Flying to {dest.city}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {dest.summary}
            </p>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Main airports</dt>
              <dd className="mt-0.5 text-xl font-bold font-mono-tabular text-[#0B1F3A] dark:text-white">
                {dest.airportCodes.join(' · ')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Type</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {dest.category === 'domestic' ? 'Domestic (US)' : 'International'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">East Coast Flight</dt>
              <dd className="mt-0.5 text-sm font-semibold font-mono-tabular text-slate-800 dark:text-slate-200">
                {dest.flightTimeFromEast}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">West Coast Flight</dt>
              <dd className="mt-0.5 text-sm font-semibold font-mono-tabular text-slate-800 dark:text-slate-200">
                {dest.flightTimeFromWest}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-3">
            {alertsEnabled && (
              <button
                type="button"
                onClick={onOpenAlerts}
                className="rounded-xl bg-orange-700 hover:bg-orange-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                Track {dest.city} price drops
              </button>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Cheapest months: {dest.cheapestMonths}
            </span>
          </div>

          <SocialShare
            title={`Flying to ${dest.city}: airports, seasons and tips`}
            description={dest.summary}
          />
        </div>

        <div className="lg:col-span-5 relative min-h-[260px] bg-slate-200 dark:bg-slate-800">
          <img
            src={getLargeImageSrc(dest.imageKey)}
            alt={getImageAlt(dest.imageKey)}
            width={1280}
            height={956}
            fetchPriority="high"
            className="h-full w-full object-cover lg:absolute lg:inset-0"
          />
        </div>
      </section>

      {/* Active Deals to This Destination */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
            <Plane className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <span>Example fares to {dest.city} ({cityDeals.length})</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Dated snapshots, not live quotes · Best days to fly: {dest.bestDaysToFly}
          </span>
        </div>

        {cityDeals.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 text-sm text-slate-600 dark:text-slate-300">
            We have no example fares recorded for {dest.city} right now. The typical prices and tips on this page still apply.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                isSaved={savedIds.includes(deal.id)}
                onToggleSave={onToggleSave}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </section>

      {/* Overview */}
      {dest.overview && dest.overview.length > 0 && (
        <section aria-label={`About flying to ${dest.city}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-[#0B1F3A] dark:text-white">Planning a trip to {dest.city}</h2>
          {dest.overview.map((p, i) => (
            <p key={i} className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-7">{p}</p>
          ))}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            General information only: schedules, entry rules and prices change. Confirm details with the airline and the official government source.
          </p>
        </section>
      )}

      {/* Airport Tips & Destination FAQs */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6">
          <h2 className="text-lg font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
            <Info className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <span>{dest.city} Airport &amp; Transit Tips</span>
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {dest.airportTips}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div>
              <strong>Cheapest months:</strong> {dest.cheapestMonths}
            </div>
            <div>
              <strong>Best departure days:</strong> {dest.bestDaysToFly}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#0B1F3A] dark:text-white">
            {dest.city} Flight FAQs
          </h2>
          <div className="space-y-4">
            {dest.faqs.map((faq) => (
              <div key={faq.question} className="pb-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 last:pb-0">
                <h3 className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                  {faq.question}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Linking to Related Destinations */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#0B1F3A] dark:text-white">
          More {dest.category === 'domestic' ? 'US Domestic' : 'International'} Destinations
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {relatedDestinations.map((rel) => (
            <Link href={`/destinations/${rel.slug}`} onNavigate={onNavigate} key={rel.slug} className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-4 hover:border-sky-500/50 transition-colors">
              <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                Flights to {rel.city}
              </div>
              <div className="mt-1 text-xs font-mono-tabular text-sky-700 dark:text-sky-400">
                {rel.airportCodes.join(' · ')}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <RelatedGuides guides={guides} onNavigate={onNavigate} title="Guides to read before you book" />
    </div>
  );
};
