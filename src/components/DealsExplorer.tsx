import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import type {
  AdPlacementConfig,
  DepartureWindow,
  FlightDeal,
  MonetizationSettings,
} from '../types/flight';
import { AIRLINES } from '../data/airlines';
import { DealCard } from './DealCard';
import type { SearchQueryState } from './FlightSearchBar';

export type SortOption = 'cheapest' | 'fastest' | 'best-value';

interface DealsExplorerProps {
  deals: FlightDeal[];
  searchQuery: SearchQueryState;
  selectedCalendarDate: string;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onNavigate: (path: string) => void;
  lockedCategory?: 'domestic' | 'international';
  adPlacements?: AdPlacementConfig[];
  monetization?: MonetizationSettings;
}

export const DealsExplorer: React.FC<DealsExplorerProps> = ({
  deals,
  searchQuery,
  selectedCalendarDate,
  savedIds,
  onToggleSave,
  onNavigate,
  lockedCategory,
  adPlacements,
  monetization,
}) => {
  const [maxPrice, setMaxPrice] = useState<number>(1800);
  const [airlineFilter, setAirlineFilter] = useState<string>('all');
  const [stopsFilter, setStopsFilter] = useState<'any' | 'nonstop' | '1-stop'>('any');
  const [timeFilter, setTimeFilter] = useState<'any' | DepartureWindow>('any');
  const [maxHours, setMaxHours] = useState<number>(15);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'domestic' | 'international'>(
    lockedCategory || 'all'
  );
  const [sortBy, setSortBy] = useState<SortOption>('cheapest');

  const activeCategory = lockedCategory || (
    searchQuery.quickMode === 'domestic'
      ? 'domestic'
      : searchQuery.quickMode === 'international'
      ? 'international'
      : categoryFilter
  );

  const filteredDeals = useMemo(() => {
    const originNeedle = searchQuery.origin.trim().toLowerCase();
    const destNeedle = searchQuery.destination.trim().toLowerCase();

    const matched = deals.filter((deal) => {
      if (activeCategory !== 'all' && deal.category !== activeCategory) return false;
      if (searchQuery.quickMode === 'weekend' && !deal.isWeekendGetaway) return false;
      if (searchQuery.quickMode === 'last-minute' && !deal.isLastMinute) return false;

      if (originNeedle) {
        const originHaystack = `${deal.originCity} ${deal.originCode}`.toLowerCase();
        if (!originHaystack.includes(originNeedle.replace(/[()]/g, ''))) {
          // match either city or 3-letter code inside parens
          const codeMatch = originNeedle.match(/\(([a-z]{3})\)/);
          if (!codeMatch || deal.originCode.toLowerCase() !== codeMatch[1]) {
            return false;
          }
        }
      }

      if (destNeedle) {
        const destHaystack = `${deal.destinationCity} ${deal.destinationCode} ${deal.country}`.toLowerCase();
        if (!destHaystack.includes(destNeedle.replace(/[()]/g, ''))) {
          const codeMatch = destNeedle.match(/\(([a-z]{3})\)/);
          if (!codeMatch || deal.destinationCode.toLowerCase() !== codeMatch[1]) {
            return false;
          }
        }
      }

      if (selectedCalendarDate && deal.departureDate < selectedCalendarDate) {
        // show deals around or after chosen calendar date when selected
        const diffDays = Math.abs(
          (new Date(deal.departureDate).getTime() - new Date(selectedCalendarDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (diffDays > 45) return false;
      }

      if (deal.price > maxPrice) return false;
      if (airlineFilter !== 'all' && deal.airlineSlug !== airlineFilter) return false;
      if (stopsFilter === 'nonstop' && deal.stops !== 0) return false;
      if (stopsFilter === '1-stop' && deal.stops > 1) return false;
      if (timeFilter !== 'any' && deal.departureWindow !== timeFilter) return false;
      if (deal.durationMinutes > maxHours * 60) return false;

      return true;
    });

    return [...matched].sort((a, b) => {
      if (sortBy === 'cheapest') return a.price - b.price;
      if (sortBy === 'fastest') return a.durationMinutes - b.durationMinutes;
      // best-value: discount % weighted minus stop penalty
      const scoreA = -a.stops * 15 - a.price * 0.03 - a.durationMinutes * 0.02;
      const scoreB = -b.stops * 15 - b.price * 0.03 - b.durationMinutes * 0.02;
      return scoreB - scoreA;
    });
  }, [
    deals,
    activeCategory,
    searchQuery,
    selectedCalendarDate,
    maxPrice,
    airlineFilter,
    stopsFilter,
    timeFilter,
    maxHours,
    sortBy,
  ]);

  const resetFilters = () => {
    setMaxPrice(1800);
    setAirlineFilter('all');
    setStopsFilter('any');
    setTimeFilter('any');
    setMaxHours(15);
    if (!lockedCategory) setCategoryFilter('all');
    setSortBy('cheapest');
  };

  return (
    <section id="deals-feed" aria-label="Filterable Flight Deals" className="space-y-6">
      {/* Filter & Sort Controls Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
              Filter &amp; Compare Fares ({filteredDeals.length} routes)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="cheapest">Cheapest First</option>
                <option value="fastest">Fastest Flight</option>
                <option value="best-value">Best Value</option>
              </select>
            </label>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          {/* Price Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="filter-max-price" className="font-medium text-slate-700 dark:text-slate-300">
                Max Price
              </label>
              <span className="font-mono-tabular font-semibold text-[#0B1F3A] dark:text-sky-400">
                ${maxPrice}
              </span>
            </div>
            <input
              id="filter-max-price"
              type="range"
              min={80}
              max={1800}
              step={20}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>

          {/* Max Duration Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="filter-max-hours" className="font-medium text-slate-700 dark:text-slate-300">
                Max Duration
              </label>
              <span className="font-mono-tabular font-semibold text-[#0B1F3A] dark:text-sky-400">
                {maxHours}h
              </span>
            </div>
            <input
              id="filter-max-hours"
              type="range"
              min={2}
              max={15}
              step={1}
              value={maxHours}
              onChange={(e) => setMaxHours(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

          {/* Airline Select */}
          <div>
            <label
              htmlFor="filter-airline"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Airline
            </label>
            <select
              id="filter-airline"
              value={airlineFilter}
              onChange={(e) => setAirlineFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="all">All Airlines</option>
              {AIRLINES.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name} ({a.code})
                </option>
              ))}
            </select>
          </div>

          {/* Stops Select */}
          <div>
            <label
              htmlFor="filter-stops"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Stops
            </label>
            <select
              id="filter-stops"
              value={stopsFilter}
              onChange={(e) => setStopsFilter(e.target.value as 'any' | 'nonstop' | '1-stop')}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="any">Any Stops</option>
              <option value="nonstop">Nonstop Only</option>
              <option value="1-stop">1 Stop or Fewer</option>
            </select>
          </div>

          {/* Departure Window */}
          <div>
            <label
              htmlFor="filter-time"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Departure Time
            </label>
            <select
              id="filter-time"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as 'any' | DepartureWindow)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="any">Any Time</option>
              <option value="Morning">Morning (5am–12pm)</option>
              <option value="Afternoon">Afternoon (12pm–5pm)</option>
              <option value="Evening">Evening / Red-eye</option>
            </select>
          </div>

          {/* Domestic vs International */}
          <div>
            <label
              htmlFor="filter-region"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Region
            </label>
            <select
              id="filter-region"
              disabled={!!lockedCategory}
              value={activeCategory}
              onChange={(e) =>
                setCategoryFilter(e.target.value as 'all' | 'domestic' | 'international')
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] disabled:opacity-60 px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="all">Domestic &amp; International</option>
              <option value="domestic">Domestic USA Only</option>
              <option value="international">International Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transparency Disclaimer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Fares are dated snapshots, not live quotes, and may have changed or sold out. Booking links open
          partner sites and may be affiliate links.
        </span>
        <span>Each card shows when its price was recorded.</span>
      </div>

      {/* Results Grid */}
      {filteredDeals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F1D32] p-10 text-center">
          <h3 className="text-base font-semibold text-[#0B1F3A] dark:text-white">
            No flight deals match your current filters
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Try widening your maximum price, allowing 1-stop itineraries, or clearing the departure airport text.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-lg bg-orange-700 hover:bg-orange-800 px-4 py-2 text-xs font-semibold text-white"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.slice(0, 6).map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                isSaved={savedIds.includes(deal.id)}
                onToggleSave={onToggleSave}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {filteredDeals.length > 6 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDeals.slice(6).map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    isSaved={savedIds.includes(deal.id)}
                    onToggleSave={onToggleSave}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
};
