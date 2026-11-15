import React from 'react';
import { ArrowLeft, MapPin, Plane, Info } from 'lucide-react';
import type {
  AdPlacementConfig,
  FlightDeal,
  MonetizationSettings,
  TravelGuide,
} from '../types/flight';
import { DESTINATIONS, getDestinationBySlug } from '../data/destinations';
import { getImageSrc } from '../lib/images';
import { DealCard } from '../components/DealCard';
import { LeaderboardAd, RevcontentWidget } from '../components/AdSlots';
import { SocialShare } from '../components/SocialShare';

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
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="mt-6 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Browse All Flight Deals
        </button>
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
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-[#0B1F3A] dark:hover:text-white inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Home</span>
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => onNavigate(`/${dest.category}`)}
          className="hover:text-[#0B1F3A] dark:hover:text-white capitalize"
        >
          {dest.category} Flights
        </button>
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
              Cheap Flights to {dest.city}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {dest.summary}
            </p>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Current Low</dt>
              <dd className="mt-0.5 text-xl font-bold font-mono-tabular text-emerald-700 dark:text-emerald-400">
                ${dest.startingPrice}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Typical Fare</dt>
              <dd className="mt-0.5 text-xl font-bold font-mono-tabular text-[#0B1F3A] dark:text-white">
                ${dest.averagePrice}
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
            <button
              type="button"
              onClick={onOpenAlerts}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
            >
              Track {dest.city} Price Drops
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Cheapest months: {dest.cheapestMonths}
            </span>
          </div>

          <SocialShare
            title={`Cheap Flights to ${dest.city} from $${dest.startingPrice}`}
            description={dest.summary}
          />
        </div>

        <div className="lg:col-span-5 relative min-h-[260px] bg-slate-200 dark:bg-slate-800">
          <img
            src={getImageSrc(dest.imageKey)}
            alt={`Travel skyline view of ${dest.city}, ${dest.country}`}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover lg:absolute lg:inset-0"
          />
        </div>
      </section>

      <LeaderboardAd
        slotId="skyfare-top-leaderboard"
        adPlacements={adPlacements}
        monetization={monetization}
      />

      {/* Active Deals to This Destination */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
            <Plane className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <span>Active Flight Deals to {dest.city} ({cityDeals.length})</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Prices may change · Best days to fly: {dest.bestDaysToFly}
          </span>
        </div>

        {cityDeals.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 text-sm text-slate-600 dark:text-slate-300">
            No flash fares are currently active for {dest.city}. Set a free price alert above to get notified on the next fare drop.
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
            <button
              key={rel.slug}
              type="button"
              onClick={() => onNavigate(`/destinations/${rel.slug}`)}
              className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-4 hover:border-sky-500/50 transition-colors"
            >
              <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                Flights to {rel.city}
              </div>
              <div className="mt-1 text-xs font-mono-tabular text-sky-700 dark:text-sky-400">
                From ${rel.startingPrice}
              </div>
            </button>
          ))}
        </div>
      </section>

      <RevcontentWidget
        onNavigate={onNavigate}
        adPlacements={adPlacements}
        monetization={monetization}
        guides={guides}
      />
    </div>
  );
};
