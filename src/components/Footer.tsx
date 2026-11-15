import React from 'react';
import { DESTINATIONS } from '../data/destinations';
import { AIRLINES } from '../data/airlines';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenCookieSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenCookieSettings,
}) => {
  const linkCls =
    'text-sm text-slate-600 dark:text-slate-400 hover:text-[#0B1F3A] dark:hover:text-white transition-colors text-left';

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071120] mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2 text-lg font-bold text-[#0B1F3A] dark:text-white font-display"
            >
              <span>SkyFare</span>
            </button>
            <p className="mt-2 text-sm font-medium text-sky-700 dark:text-sky-400">
              Fly more. Pay less.
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Independent US airfare discovery helping travelers compare verified domestic and international flight deals, baggage policies, and flexible fare calendars.
            </p>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
              Prices may change without notice based on airline seat inventory. All deals link to accredited booking partners.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Destinations
            </h3>
            <ul className="mt-3 space-y-2">
              {DESTINATIONS.slice(0, 6).map((dest) => (
                <li key={dest.slug}>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/destinations/${dest.slug}`)}
                    className={linkCls}
                  >
                    Flights to {dest.city}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Airlines &amp; Guides
            </h3>
            <ul className="mt-3 space-y-2">
              {AIRLINES.slice(0, 4).map((airline) => (
                <li key={airline.slug}>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/airlines/${airline.slug}`)}
                    className={linkCls}
                  >
                    {airline.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/guides')}
                  className={linkCls}
                >
                  All 15 Travel Guides
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/search')}
                  className={linkCls}
                >
                  Site Search
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/sitemap')}
                  className={linkCls}
                >
                  HTML Sitemap
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Company &amp; Legal
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <button type="button" onClick={() => onNavigate('/about')} className={linkCls}>
                  About Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/contact')} className={linkCls}>
                  Contact Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/privacy')} className={linkCls}>
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/cookie-policy')} className={linkCls}>
                  Cookie Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/terms')} className={linkCls}>
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/affiliate-disclosure')}
                  className={linkCls}
                >
                  Affiliate Disclosure
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/disclaimer')} className={linkCls}>
                  Disclaimer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCookieSettings}
                  className={linkCls}
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} SkyFare Media LLC · 548 Market St, San Francisco, CA 94104
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span>
              Data partners: Amadeus, Travelpayouts, Skyscanner &amp; Expedia Affiliate Network
            </span>
            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className="text-slate-500 dark:text-slate-400 hover:text-[#0B1F3A] dark:hover:text-white underline cursor-pointer"
            >
              Staff Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
