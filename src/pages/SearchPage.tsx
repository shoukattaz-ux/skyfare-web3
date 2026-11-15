import React, { useEffect, useState } from 'react';
import { ArrowLeft, Search, Plane, BookOpen, MapPin, Building2 } from 'lucide-react';
import type {
  AdPlacementConfig,
  AirlineInfo,
  DestinationInfo,
  FlightDeal,
  MonetizationSettings,
  TravelGuide,
} from '../types/flight';
import { DealCard } from '../components/DealCard';
import { LeaderboardAd } from '../components/AdSlots';

interface SearchPageProps {
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onNavigate: (path: string) => void;
  adPlacements?: AdPlacementConfig[];
  monetization?: MonetizationSettings;
}

type SearchTab = 'all' | 'deals' | 'guides' | 'destinations' | 'airlines';

export const SearchPage: React.FC<SearchPageProps> = ({
  savedIds,
  onToggleSave,
  onNavigate,
  adPlacements,
  monetization,
}) => {
  const initialQuery =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('q') || ''
      : '';

  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [tab, setTab] = useState<SearchTab>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    deals: FlightDeal[];
    guides: TravelGuide[];
    destinations: DestinationInfo[];
    airlines: AirlineInfo[];
  }>({
    deals: [],
    guides: [],
    destinations: [],
    airlines: [],
  });

  useEffect(() => {
    const q = activeQuery.trim();
    if (!q) {
      setResults({ deals: [], guides: [], destinations: [], airlines: [] });
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setResults({
            deals: Array.isArray(data.deals) ? data.deals : [],
            guides: Array.isArray(data.guides) ? data.guides : [],
            destinations: Array.isArray(data.destinations) ? data.destinations : [],
            airlines: Array.isArray(data.airlines) ? data.airlines : [],
          });
        }
      })
      .catch(() => {
        // leave empty on failure
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeQuery]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim();
    setActiveQuery(clean);
    if (typeof window !== 'undefined') {
      const nextUrl = clean ? `/search?q=${encodeURIComponent(clean)}` : '/search';
      window.history.replaceState({}, '', nextUrl);
    }
  };

  const quickTerm = (term: string) => {
    setInputValue(term);
    setActiveQuery(term);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `/search?q=${encodeURIComponent(term)}`);
    }
  };

  const totalCount =
    results.deals.length +
    results.guides.length +
    results.destinations.length +
    results.airlines.length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-[#0B1F3A] dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Home</span>
        </button>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-slate-800 dark:text-slate-200">Site Search</span>
      </nav>

      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 sm:p-8 space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
            Search Deals, Destinations, Airlines &amp; Guides
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
            Search verified US flight routes, airport codes, carrier baggage rules, and airfare strategy guides.
          </p>
        </div>

        <form onSubmit={submitSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search e.g. Cancun, JFK, Delta, Tokyo, baggage, EU261..."
              aria-label="Search SkyFare content"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#081222] pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-orange-600 hover:bg-orange-700 px-6 py-3 text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Search SkyFare
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Popular searches:</span>
          {['Cancun', 'Tokyo', 'Delta', 'Paris', 'Miami', 'Baggage', 'Error Fares'].map(
            (term) => (
              <button
                key={term}
                type="button"
                onClick={() => quickTerm(term)}
                className="text-sky-700 dark:text-sky-400 hover:underline font-medium cursor-pointer"
              >
                {term}
              </button>
            )
          )}
        </div>
      </header>

      <LeaderboardAd
        slotId="skyfare-top-leaderboard"
        adPlacements={adPlacements}
        monetization={monetization}
      />

      {activeQuery && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {loading ? (
                <span>Searching for "{activeQuery}"...</span>
              ) : (
                <span>
                  Found <strong className="font-mono-tabular text-[#0B1F3A] dark:text-white">{totalCount}</strong>{' '}
                  results for "<strong>{activeQuery}</strong>"
                </span>
              )}
            </p>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['all', `All (${totalCount})`],
                  ['deals', `Deals (${results.deals.length})`],
                  ['guides', `Guides (${results.guides.length})`],
                  ['destinations', `Destinations (${results.destinations.length})`],
                  ['airlines', `Airlines (${results.airlines.length})`],
                ] as [SearchTab, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    tab === key
                      ? 'bg-[#0B1F3A] dark:bg-sky-600 text-white'
                      : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {!loading && totalCount === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F1D32] p-10 text-center space-y-2">
              <h2 className="text-base font-semibold text-[#0B1F3A] dark:text-white">
                No matching flight deals or guides found
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Try searching by a major airport code (JFK, LAX, ORD, MIA), city name, or airline carrier.
              </p>
            </div>
          )}

          {(tab === 'all' || tab === 'deals') && results.deals.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                <Plane className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span>Flight Deals ({results.deals.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.deals.map((deal) => (
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
          )}

          {(tab === 'all' || tab === 'destinations') && results.destinations.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span>Destinations ({results.destinations.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.destinations.map((dest) => (
                  <button
                    key={dest.slug}
                    type="button"
                    onClick={() => onNavigate(`/destinations/${dest.slug}`)}
                    className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-4 hover:border-sky-500/50 transition-colors cursor-pointer"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {dest.country} · {dest.airportCodes.join(', ')}
                    </div>
                    <div className="mt-1 text-base font-bold text-[#0B1F3A] dark:text-white">
                      Cheap Flights to {dest.city}
                    </div>
                    <div className="mt-2 text-xs font-mono-tabular font-semibold text-emerald-700 dark:text-emerald-400">
                      Starting from ${dest.startingPrice}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {(tab === 'all' || tab === 'airlines') && results.airlines.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span>Airlines &amp; Policies ({results.airlines.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.airlines.map((airline) => (
                  <button
                    key={airline.slug}
                    type="button"
                    onClick={() => onNavigate(`/airlines/${airline.slug}`)}
                    className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-4 hover:border-sky-500/50 transition-colors cursor-pointer"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {airline.code} · {airline.type}
                    </div>
                    <div className="mt-1 text-base font-bold text-[#0B1F3A] dark:text-white">
                      {airline.name}
                    </div>
                    <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {airline.carryOnPolicy}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {(tab === 'all' || tab === 'guides') && results.guides.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span>Travel Guides ({results.guides.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.guides.map((guide) => (
                  <button
                    key={guide.slug}
                    type="button"
                    onClick={() => onNavigate(`/guides/${guide.slug}`)}
                    className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 hover:border-sky-500/50 transition-colors cursor-pointer"
                  >
                    <div className="text-xs text-sky-700 dark:text-sky-400 font-medium">
                      {guide.category} · {guide.readTimeMinutes} min read
                    </div>
                    <h3 className="mt-1 text-base font-bold text-[#0B1F3A] dark:text-white">
                      {guide.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {guide.excerpt}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
