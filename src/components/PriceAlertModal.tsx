import React, { useState } from 'react';
import { Bell, CheckCircle2, X } from 'lucide-react';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrigin?: string;
  defaultDestination?: string;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  defaultOrigin = 'JFK',
  defaultDestination = 'Cancun (CUN)',
}) => {
  const [email, setEmail] = useState('');
  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDestination);
  const [maxPrice, setMaxPrice] = useState('350');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          origin,
          destination,
          maxPrice: Number(maxPrice) || 400,
          company: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save alert right now.');
      } else {
        setSuccessMsg(data.message || 'Price alert activated.');
      }
    } catch {
      setError('Network error while creating alert. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-alert-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-orange-100 dark:bg-orange-500/15 p-2 text-orange-600 dark:text-orange-400">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="price-alert-title"
                className="text-lg font-bold text-[#0B1F3A] dark:text-white"
              >
                Create Free Price Alert
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get emailed immediately when fares drop below your target.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close price alert modal"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="mt-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  {successMsg}
                </p>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                  Monitoring {origin} → {destination} under ${maxPrice}. You can unsubscribe anytime in one click.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSuccessMsg('');
                onClose();
              }}
              className="mt-4 w-full rounded-lg bg-[#0B1F3A] dark:bg-sky-600 py-2.5 text-xs font-semibold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              aria-hidden="true"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Departure Airport
                </label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. JFK, ORD, LAX"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1526] px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Cancun, Paris"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1526] px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Alert Me Under (USD Round-Trip)
              </label>
              <input
                type="number"
                min={50}
                max={5000}
                required
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1526] px-3 py-2 text-sm font-mono-tabular text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1526] px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-60 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
            >
              {submitting ? 'Saving Alert...' : 'Activate Price Alert'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
