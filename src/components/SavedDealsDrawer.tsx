import React from 'react';
import { X, Trash2, ExternalLink } from 'lucide-react';
import type { FlightDeal } from '../types/flight';

interface SavedDealsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDeals: FlightDeal[];
  onRemove: (id: string) => void;
}

export const SavedDealsDrawer: React.FC<SavedDealsDrawerProps> = ({
  isOpen,
  onClose,
  savedDeals,
  onRemove,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-deals-title"
    >
      <div className="w-full max-w-md h-full bg-white dark:bg-[#0F1D32] border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2
              id="saved-deals-title"
              className="text-lg font-bold text-[#0B1F3A] dark:text-white"
            >
              Saved Flight Deals ({savedDeals.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stored locally in your browser for quick comparison.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close saved deals drawer"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {savedDeals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                No saved deals yet
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tap the bookmark icon on any flight card to shortlist fares here.
              </p>
            </div>
          ) : (
            savedDeals.map((deal) => (
              <div
                key={deal.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1526] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono-tabular text-sm font-bold text-[#0B1F3A] dark:text-white">
                      {deal.originCode} → {deal.destinationCode}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      {deal.originCity} to {deal.destinationCity} · {deal.airlineName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-tabular text-lg font-bold text-[#0B1F3A] dark:text-white">
                      ${deal.price}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {deal.tripType.toLowerCase()}
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                  {deal.departureDate} – {deal.returnDate} · {deal.durationLabel}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onRemove(deal.id)}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                  <a
                    href={deal.affiliateUrl}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-orange-700 hover:bg-orange-800 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <span>View Deal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
