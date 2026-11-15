import React from 'react';
import { Bookmark, ExternalLink, Clock, Briefcase } from 'lucide-react';
import type { FlightDeal } from '../types/flight';
import { AirlineLogo } from './AirlineLogo';
import { Link } from './Link';

interface DealCardProps {
  deal: FlightDeal;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onNavigate: (path: string) => void;
}

/** Honest status line: when the fare was recorded and whether its listed window has passed. */
function getStatusLabel(deal: FlightDeal): { text: string; ended: boolean } {
  const recorded = new Date(deal.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const ended = new Date(deal.expiresAt).getTime() < Date.now();
  return {
    text: ended ? `Recorded ${recorded}. Listed window has passed: check the current price.` : `Recorded ${recorded}`,
    ended,
  };
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  isSaved,
  onToggleSave,
  onNavigate,
}) => {
  const status = getStatusLabel(deal);
  const formattedUpdated = new Date(deal.lastUpdated).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:border-sky-500/40 dark:hover:border-sky-500/40">
      <div>
        {/* Top Row: Airline + Metadata + Save */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <AirlineLogo airlineSlug={deal.airlineSlug} airlineCode={deal.airlineCode} />
            <div className="min-w-0">
              <Link href={`/airlines/${deal.airlineSlug}`} onNavigate={onNavigate} className="text-sm font-semibold text-[#0B1F3A] dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate block text-left">
                {deal.airlineName}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                <span>{deal.tripType}</span>
                <span aria-hidden="true">·</span>
                <span>{deal.cabinClass}</span>
                <span aria-hidden="true">·</span>
                <span>Updated {formattedUpdated}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleSave(deal.id)}
            aria-label={isSaved ? `Remove ${deal.originCity} to ${deal.destinationCity} from saved deals` : `Save ${deal.originCity} to ${deal.destinationCity} deal`}
            aria-pressed={isSaved}
            className={`shrink-0 rounded-lg p-2 min-h-[40px] min-w-[40px] flex items-center justify-center border transition-colors ${
              isSaved
                ? 'border-orange-500/40 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-[#0B1F3A] dark:hover:text-white'
            }`}
          >
            <Bookmark
              className="h-4 w-4"
              fill={isSaved ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Route & Price Row */}
        <div className="mt-5 flex items-baseline justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono-tabular text-lg font-bold text-[#0B1F3A] dark:text-white">
              <span>{deal.originCode}</span>
              <span className="text-slate-400 dark:text-slate-400 font-sans text-sm" aria-hidden="true">
                →
              </span>
              <span>{deal.destinationCode}</span>
            </div>
            <Link href={`/destinations/${deal.destinationSlug}`} onNavigate={onNavigate} className="mt-0.5 text-sm text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-left truncate block">
              {deal.originCity} to {deal.destinationCity}
            </Link>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-baseline justify-end gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                from
              </span>
              <span className="text-2xl font-bold text-[#0B1F3A] dark:text-white font-mono-tabular">
                ${deal.price}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {deal.tripType.toLowerCase()}, per adult
            </div>
          </div>
        </div>

        {/* Flight Specs */}
        <dl className="mt-4 grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Travel dates</dt>
            <dd className="mt-0.5 font-medium text-slate-800 dark:text-slate-200 font-mono-tabular">
              {deal.departureDate.slice(5)} – {deal.returnDate.slice(5)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Duration &amp; stops</dt>
            <dd className="mt-0.5 font-medium text-slate-800 dark:text-slate-200 font-mono-tabular">
              {deal.durationLabel} ·{' '}
              {deal.stops === 0
                ? 'Nonstop'
                : `${deal.stops} stop${deal.stopoverAirport ? ` (${deal.stopoverAirport})` : ''}`}
            </dd>
          </div>
        </dl>
        <div className="mt-2.5 flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Briefcase className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span>{deal.baggagePolicy}</span>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 ">
          <Clock className={`h-3.5 w-3.5 shrink-0 ${status.ended ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`} aria-hidden="true" />
          <span className={status.ended ? 'text-red-700 dark:text-red-400' : ''}>{status.text}</span>
        </div>

        <a
          href={deal.affiliateUrl}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-700 hover:bg-orange-800 px-4 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          <span>View fare on partner site</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
};
