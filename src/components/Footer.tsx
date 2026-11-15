import React from 'react';
import { DESTINATIONS } from '../data/destinations';
import { AIRLINES } from '../data/airlines';
import { Link } from './Link';
import { useSiteConfig } from '../lib/siteConfig';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenCookieSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenCookieSettings,
}) => {
  const { general } = useSiteConfig();
  const owner = general?.publisherName?.trim();
  const linkCls =
    'text-sm text-slate-600 dark:text-slate-400 hover:text-[#0B1F3A] dark:hover:text-white transition-colors text-left';

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071120] mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href={'/'} onNavigate={onNavigate} className="inline-flex items-center gap-2 text-lg font-bold text-[#0B1F3A] dark:text-white font-display">
              <span>SkyFare</span>
            </Link>
            <p className="mt-2 text-sm font-medium text-sky-700 dark:text-sky-400">
              Fly more. Pay less.
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              An independent publication about flying from US airports: plain-English guides and a hand-kept list of dated example fares.
            </p>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fares are snapshots, not live quotes. We do not sell tickets; booking links lead to third-party sites and may be affiliate links.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Destinations
            </h3>
            <ul className="mt-3 space-y-2">
              {DESTINATIONS.slice(0, 6).map((dest) => (
                <li key={dest.slug}>
                  <Link href={`/destinations/${dest.slug}`} onNavigate={onNavigate} className={linkCls}>
                    Flights to {dest.city}
                  </Link>
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
                  <Link href={`/airlines/${airline.slug}`} onNavigate={onNavigate} className={linkCls}>
                    {airline.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={'/guides'} onNavigate={onNavigate} className={linkCls}>
                  All guides
                </Link>
              </li>
              <li>
                <Link href={'/search'} onNavigate={onNavigate} className={linkCls}>
                  Site Search
                </Link>
              </li>
              <li>
                <Link href={'/sitemap'} onNavigate={onNavigate} className={linkCls}>
                  HTML Sitemap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Company &amp; Legal
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href={'/about'} onNavigate={onNavigate} className={linkCls}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href={'/contact'} onNavigate={onNavigate} className={linkCls}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href={'/privacy'} onNavigate={onNavigate} className={linkCls}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={'/editorial-policy'} onNavigate={onNavigate} className={linkCls}>
                  Editorial Policy
                </Link>
              </li>
              <li>
                <Link href={'/corrections-policy'} onNavigate={onNavigate} className={linkCls}>
                  Corrections Policy
                </Link>
              </li>
              <li>
                <Link href={'/cookie-policy'} onNavigate={onNavigate} className={linkCls}>
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href={'/terms'} onNavigate={onNavigate} className={linkCls}>
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href={'/affiliate-disclosure'} onNavigate={onNavigate} className={linkCls}>
                  Advertising &amp; Affiliate Disclosure
                </Link>
              </li>
              <li>
                <Link href={'/disclaimer'} onNavigate={onNavigate} className={linkCls}>
                  Disclaimer
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCookieSettings}
                  className={linkCls}
                >
                  Cookie settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} {owner || general?.siteName || 'SkyFare'}
            {general?.supportEmail && (
              <>
                {' · '}
                <a href={`mailto:${general.supportEmail}`} className="underline">{general.supportEmail}</a>
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={'/admin'} onNavigate={onNavigate} className="text-slate-500 dark:text-slate-400 hover:text-[#0B1F3A] dark:hover:text-white underline cursor-pointer">
              Staff sign-in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
