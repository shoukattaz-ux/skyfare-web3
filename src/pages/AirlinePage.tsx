import React from 'react';
import { ArrowLeft, Briefcase, RefreshCw, Map } from 'lucide-react';
import type { FlightDeal } from '../types/flight';
import { AIRLINES, getAirlineBySlug } from '../data/airlines';
import { AirlineLogo } from '../components/AirlineLogo';
import { DealCard } from '../components/DealCard';
import { Link } from '../components/Link';

interface AirlinePageProps {
  slug: string;
  deals: FlightDeal[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onNavigate: (path: string) => void;
}

export const AirlinePage: React.FC<AirlinePageProps> = ({
  slug,
  deals,
  savedIds,
  onToggleSave,
  onNavigate,
}) => {
  const airline = getAirlineBySlug(slug);

  if (!airline) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#0B1F3A] dark:text-white">
          Airline Not Found
        </h1>
        <Link href={'/'} onNavigate={onNavigate} className="mt-6 rounded-lg bg-orange-700 px-5 py-2.5 text-sm font-semibold text-white">
          Back to All Deals
        </Link>
      </div>
    );
  }

  const airlineDeals = deals.filter((d) => d.airlineSlug === airline.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href={'/'} onNavigate={onNavigate} className="hover:text-[#0B1F3A] dark:hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Home</span>
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {airline.name} Deals
        </span>
      </nav>

      {/* Airline Header Card */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <AirlineLogo airlineSlug={airline.slug} airlineCode={airline.code} />
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {airline.type} · IATA Code {airline.code}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1F3A] dark:text-white">
              {airline.name} Flight Deals &amp; Baggage Policy
            </h1>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {airline.summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-xl bg-slate-50 dark:bg-[#0B1526] p-4 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] dark:text-white">
              <Briefcase className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Carry-On &amp; Checked Bags</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {airline.carryOnPolicy}
            </p>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Checked: {airline.checkedBagFee}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-[#0B1526] p-4 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] dark:text-white">
              <RefreshCw className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Change &amp; Cancellation Rules</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {airline.changePolicy}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-[#0B1526] p-4 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] dark:text-white">
              <Map className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Primary Hubs &amp; Analyst Tip</span>
            </div>
            <p className="mt-2 text-xs font-mono-tabular text-slate-700 dark:text-slate-200">
              Hubs: {airline.hubs.join(', ')}
            </p>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {airline.bookingTip}
            </p>
          </div>
        </div>
      </section>

      {/* Airline Deals */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#0B1F3A] dark:text-white">
          Example {airline.name} fares ({airlineDeals.length})
        </h2>
        {airlineDeals.length === 0 && (
          <p className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 text-sm text-slate-600 dark:text-slate-300">
            We have no example fares recorded for {airline.name} right now. The baggage and policy notes above still apply.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {airlineDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isSaved={savedIds.includes(deal.id)}
              onToggleSave={onToggleSave}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>

      {/* Other Airlines */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#0B1F3A] dark:text-white">
          Compare Other Airlines
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {AIRLINES.filter((a) => a.slug !== airline.slug).map((other) => (
            <Link href={`/airlines/${other.slug}`} onNavigate={onNavigate} key={other.slug} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-sky-500/50 transition-colors">
              {other.name} ({other.code})
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
