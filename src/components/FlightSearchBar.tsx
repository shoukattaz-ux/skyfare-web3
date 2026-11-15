import React, { useState } from 'react';
import { ArrowRightLeft, Search, Plus } from 'lucide-react';
import type { CabinClass } from '../types/flight';

export interface SearchQueryState {
  tripType: 'Round-trip' | 'One-way' | 'Multi-city';
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  cabinClass: CabinClass;
  quickMode: 'all' | 'domestic' | 'international' | 'weekend' | 'last-minute';
}

interface FlightSearchBarProps {
  query: SearchQueryState;
  onChange: (next: SearchQueryState) => void;
  onSubmitSearch: () => void;
}

const US_AIRPORT_SUGGESTIONS = [
  'New York (JFK)',
  'Los Angeles (LAX)',
  'Chicago (ORD)',
  'Atlanta (ATL)',
  'Dallas (DFW)',
  'San Francisco (SFO)',
  'Miami (MIA)',
  'Seattle (SEA)',
  'Boston (BOS)',
  'Denver (DEN)',
  'Washington DC (IAD)',
  'Austin (AUS)',
];

const DEST_SUGGESTIONS = [
  'Cancun (CUN)',
  'New York (NYC)',
  'Tokyo (HND)',
  'Paris (CDG)',
  'London (LHR)',
  'Miami (MIA)',
  'Rome (FCO)',
  'Honolulu (HNL)',
  'Dublin (DUB)',
  'Lisbon (LIS)',
  'Los Angeles (LAX)',
  'Seattle (SEA)',
];

export const FlightSearchBar: React.FC<FlightSearchBarProps> = ({
  query,
  onChange,
  onSubmitSearch,
}) => {
  const [secondLegTo, setSecondLegTo] = useState('Rome (FCO)');
  const [secondLegDate, setSecondLegDate] = useState('2027-02-12');

  const swapLocations = () => {
    onChange({
      ...query,
      origin: query.destination,
      destination: query.origin,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSearch();
  };

  const quickTabs: { id: SearchQueryState['quickMode']; label: string }[] = [
    { id: 'all', label: 'All Deals' },
    { id: 'domestic', label: 'Domestic' },
    { id: 'international', label: 'International' },
    { id: 'weekend', label: 'Weekend Getaways' },
    { id: 'last-minute', label: 'Last-Minute' },
  ];

  return (
    <div className="w-full rounded-2xl border border-white/15 bg-white/95 dark:bg-[#0F1D32]/95 backdrop-blur-md p-4 sm:p-6 shadow-2xl text-slate-900 dark:text-slate-100">
      {/* Top Row: Trip type + Passengers + Class */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#081222]">
          {(['Round-trip', 'One-way', 'Multi-city'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ ...query, tripType: type })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                query.tripType === type
                  ? 'bg-white dark:bg-[#162844] text-[#0B1F3A] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#0B1F3A] dark:hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span>Travelers</span>
            <select
              aria-label="Number of passengers"
              value={query.passengers}
              onChange={(e) =>
                onChange({ ...query, passengers: Number(e.target.value) })
              }
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Adult' : 'Adults'}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span>Cabin</span>
            <select
              aria-label="Cabin class"
              value={query.cabinClass}
              onChange={(e) =>
                onChange({ ...query, cabinClass: e.target.value as CabinClass })
              }
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white"
            >
              <option value="Economy">Economy</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>
          </label>
        </div>
      </div>

      {/* Main Search Inputs */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3">
            <label
              htmlFor="search-from"
              className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
            >
              From (US Airport or City)
            </label>
            <input
              id="search-from"
              list="us-origin-list"
              type="text"
              value={query.origin}
              onChange={(e) => onChange({ ...query, origin: e.target.value })}
              placeholder="Any US hub (e.g. JFK)"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
            />
            <datalist id="us-origin-list">
              {US_AIRPORT_SUGGESTIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className="hidden md:flex md:col-span-1 justify-center pb-1">
            <button
              type="button"
              onClick={swapLocations}
              aria-label="Swap origin and destination"
              className="rounded-full border border-slate-300 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="md:col-span-3">
            <label
              htmlFor="search-to"
              className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
            >
              To (City or Airport)
            </label>
            <input
              id="search-to"
              list="dest-list"
              type="text"
              value={query.destination}
              onChange={(e) =>
                onChange({ ...query, destination: e.target.value })
              }
              placeholder="Anywhere (e.g. Cancun, Tokyo)"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
            />
            <datalist id="dest-list">
              {DEST_SUGGESTIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="search-depart"
                className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
              >
                Departure
              </label>
              <input
                id="search-depart"
                type="date"
                value={query.departureDate}
                onChange={(e) =>
                  onChange({ ...query, departureDate: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-2.5 py-2.5 text-xs font-mono-tabular text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="search-return"
                className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
              >
                Return
              </label>
              <input
                id="search-return"
                type="date"
                disabled={query.tripType === 'One-way'}
                value={query.tripType === 'One-way' ? '' : query.returnDate}
                onChange={(e) =>
                  onChange({ ...query, returnDate: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] disabled:opacity-50 px-2.5 py-2.5 text-xs font-mono-tabular text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-700 hover:bg-orange-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer min-h-[42px]"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Find Deals</span>
            </button>
          </div>
        </div>

        {query.tripType === 'Multi-city' && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-sky-600" />
              <span>Leg 2 (Open-Jaw Connection)</span>
            </div>
            <input
              type="text"
              value={secondLegTo}
              onChange={(e) => setSecondLegTo(e.target.value)}
              aria-label="Second city destination"
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-3 py-2 text-xs text-slate-900 dark:text-white"
            />
            <input
              type="date"
              value={secondLegDate}
              onChange={(e) => setSecondLegDate(e.target.value)}
              aria-label="Second leg departure date"
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-3 py-2 text-xs font-mono-tabular text-slate-900 dark:text-white"
            />
          </div>
        )}
      </form>

      {/* Quick Toggles */}
      <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/70 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">
          Quick filters:
        </span>
        {quickTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange({ ...query, quickMode: tab.id })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              query.quickMode === tab.id
                ? 'bg-[#0B1F3A] dark:bg-sky-700 text-white'
                : 'bg-slate-100 dark:bg-[#081222] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
