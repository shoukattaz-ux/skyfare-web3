import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { saveConsent, useConsent } from '../lib/consent';

interface CookieConsentProps {
  forceOpenPreferences: boolean;
  onClosePreferences: () => void;
  /** Link targets are real anchors so the policy pages stay reachable without JS. */
  onNavigate: (path: string) => void;
}

const btn =
  'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

export const CookieConsent: React.FC<CookieConsentProps> = ({
  forceOpenPreferences,
  onClosePreferences,
  onNavigate,
}) => {
  const consent = useConsent();
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Preferences start from what the visitor chose before; the very first time everything is OFF.
  useEffect(() => {
    setAnalytics(consent.analytics);
    setAds(consent.ads);
  }, [consent.analytics, consent.ads]);

  useEffect(() => {
    if (forceOpenPreferences) setShowModal(true);
  }, [forceOpenPreferences]);

  useEffect(() => {
    if (!showModal) return;
    dialogRef.current?.querySelector<HTMLElement>('button, input')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  const close = () => {
    setShowModal(false);
    onClosePreferences();
  };
  const choose = (a: boolean, d: boolean) => {
    saveConsent({ analytics: a, ads: d });
    close();
  };

  const link = (href: string, text: string) => (
    <a
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        close();
        onNavigate(href);
      }}
      className="underline text-sky-700 dark:text-sky-400"
    >
      {text}
    </a>
  );

  return (
    <>
      {!consent.decided && !showModal && (
        <div
          role="region"
          aria-label="Cookie choices"
          className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1D32] p-4 shadow-xl"
        >
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            Optional analytics and advertising cookies stay off unless you agree. See our{' '}
            {link('/cookie-policy', 'Cookie Policy')} and {link('/privacy', 'Privacy Policy')}.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => choose(true, true)} className={`${btn} bg-[#0B1F3A] dark:bg-sky-700 text-white hover:opacity-90`}>
              Accept all
            </button>
            <button type="button" onClick={() => choose(false, false)} className={`${btn} bg-[#0B1F3A] dark:bg-sky-700 text-white hover:opacity-90`}>
              Decline optional
            </button>
            <button type="button" onClick={() => setShowModal(true)} className={`${btn} border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800`}>
              Choose
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cmp-modal-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 id="cmp-modal-title" className="text-lg font-bold text-[#0B1F3A] dark:text-white">
                Cookie choices
              </h2>
              <button type="button" aria-label="Close cookie choices" onClick={close} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Change or withdraw your choice at any time from "Cookie settings" in the footer.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div>
                  <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">Essential storage</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Theme, saved deals and this choice. Needed for the site to work.</div>
                </div>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 shrink-0">Always on</span>
              </div>

              <label className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">Analytics</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Counts page views to show which pages are useful. Google Analytics only if the site owner has set it up.</div>
                </div>
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1 h-5 w-5 accent-sky-600 shrink-0" />
              </label>

              <label className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">Advertising</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Allows ads from Google AdSense / Media.net, which may use cookies to show and measure ads. If off, no ads are requested.</div>
                </div>
                <input type="checkbox" checked={ads} onChange={(e) => setAds(e.target.checked)} className="mt-1 h-5 w-5 accent-sky-600 shrink-0" />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => choose(analytics, ads)} className={`${btn} bg-[#0B1F3A] dark:bg-sky-700 text-white hover:opacity-90`}>
                Save choices
              </button>
              <button type="button" onClick={() => choose(false, false)} className={`${btn} border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800`}>
                Decline optional
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
