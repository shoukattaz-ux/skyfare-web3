import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  personalizedAds: boolean;
  updatedAt: string;
}

const STORAGE_KEY = 'skyfare_cookie_consent_v1';

interface CookieConsentProps {
  forceOpenPreferences: boolean;
  onClosePreferences: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({
  forceOpenPreferences,
  onClosePreferences,
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [personalizedAds, setPersonalizedAds] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setShowBanner(true);
      } else {
        const parsed = JSON.parse(saved) as CookiePreferences;
        setAnalytics(parsed.analytics);
        setPersonalizedAds(parsed.personalizedAds);
      }
    } catch {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    if (forceOpenPreferences) {
      setShowModal(true);
    }
  }, [forceOpenPreferences]);

  const savePrefs = (nextAnalytics: boolean, nextAds: boolean) => {
    const payload: CookiePreferences = {
      essential: true,
      analytics: nextAnalytics,
      personalizedAds: nextAds,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
    setAnalytics(nextAnalytics);
    setPersonalizedAds(nextAds);
    setShowBanner(false);
    setShowModal(false);
    onClosePreferences();
  };

  return (
    <>
      {showBanner && !showModal && (
        <div
          role="region"
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-lg z-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-[#0F1D32]/95 backdrop-blur-md p-3.5 sm:p-4 shadow-xl"
        >
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            SkyFare uses essential cookies for saved deals and optional cookies for analytics and AdSense/Revcontent ad personalization (GDPR &amp; CCPA).
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => savePrefs(true, true)}
              className="rounded-lg bg-[#0B1F3A] dark:bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={() => savePrefs(false, false)}
              className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-2 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline"
            >
              Preferences
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cmp-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="cmp-modal-title"
                className="text-lg font-bold text-[#0B1F3A] dark:text-white"
              >
                Privacy &amp; Cookie Preferences
              </h2>
              <button
                type="button"
                aria-label="Close privacy preferences"
                onClick={() => {
                  setShowModal(false);
                  onClosePreferences();
                }}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Manage consent choices under EU GDPR and California CCPA/CPRA. Essential storage keeps your theme and saved flight deals working.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <div>
                  <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                    Essential Storage
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Required for saved deals &amp; security
                  </div>
                </div>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Always Active
                </span>
              </div>

              <label className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                    GA4 Analytics
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Helps improve route coverage &amp; load speed
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-4 w-4 accent-sky-600"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                    Personalized Ads (AdSense &amp; Revcontent)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Toggle off to receive non-personalized ads
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={personalizedAds}
                  onChange={(e) => setPersonalizedAds(e.target.checked)}
                  className="h-4 w-4 accent-sky-600"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => savePrefs(false, false)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={() => savePrefs(analytics, personalizedAds)}
                className="rounded-lg bg-orange-600 hover:bg-orange-700 px-4 py-2 text-xs font-semibold text-white"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
