import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import type { MenuItem } from '../types/flight';
import { DESTINATIONS } from '../data/destinations';
import { AIRLINES } from '../data/airlines';
import { Link } from './Link';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenAlerts: () => void;
  alertsEnabled?: boolean;
  menus?: MenuItem[];
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  onOpenAlerts,
  alertsEnabled = false,
  menus,
}) => {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const primaryLinks =
    menus && menus.length > 0
      ? menus
      : [
          { label: 'Deals', path: '/' },
          { label: 'Domestic', path: '/domestic' },
          { label: 'International', path: '/international' },
          { label: 'Guides', path: '/guides' },
        ];

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLink = (path: string) => {
    setMegaOpen(false);
    setMobileOpen(false);
    onNavigate(path);
  };

  const navLinkClass = (active: boolean) =>
    `whitespace-nowrap shrink-0 text-sm font-medium transition-colors py-1 border-b-2 ${
      active
        ? 'text-[#0B1F3A] dark:text-white border-orange-500'
        : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-[#0B1F3A] dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#071120]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLink('/');
          }}
          className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#0B1F3A] dark:text-white whitespace-nowrap shrink-0 font-display focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 rounded"
        >
          <svg
            viewBox="0 0 32 32"
            className="h-7 w-7 shrink-0"
            fill="none"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="8" fill="#0B1F3A" className="dark:fill-sky-600" />
            <path d="M7 18L25 9L19.5 23L16 18.5L7 18Z" fill="#38BDF8" />
            <path d="M16 18.5L25 9L13.5 17L16 18.5Z" fill="#F97316" />
          </svg>
          <span>SkyFare</span>
        </a>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7"
        >
          {primaryLinks
            .filter((item) => item.path !== '/guides')
            .slice(0, 4)
            .map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleLink(item.path);
                }}
                className={navLinkClass(
                  item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path)
                )}
              >
                {item.label}
              </a>
            ))}

          <div className="relative" ref={megaRef}>
            <button
              type="button"
              onClick={() => setMegaOpen((prev) => !prev)}
              aria-expanded={megaOpen}
              className={`inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-sm font-medium transition-colors py-1 border-b-2 cursor-pointer ${
                currentPath.startsWith('/destinations') ||
                currentPath.startsWith('/airlines') ||
                currentPath.startsWith('/search')
                  ? 'text-[#0B1F3A] dark:text-white border-orange-500'
                  : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-[#0B1F3A] dark:hover:text-white'
              }`}
            >
              <span>Explore</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  megaOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {megaOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[640px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 shadow-xl z-50">
                <div className="mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <Link href={'/search'} onNavigate={handleLink} className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer">
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Search All Flight Deals, Airlines &amp; Guides →</span>
                  </Link>
                  <Link href={'/sitemap'} onNavigate={handleLink} className="text-xs text-slate-500 dark:text-slate-400 hover:underline cursor-pointer">
                    HTML Sitemap
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      Top Destinations
                    </h3>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                      {DESTINATIONS.map((dest) => (
                        <Link href={`/destinations/${dest.slug}`} onNavigate={handleLink} key={dest.slug} className="text-left text-sm text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-0.5 truncate cursor-pointer">
                          {dest.city}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="border-l border-slate-200 dark:border-slate-800 pl-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      Airlines &amp; Policies
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-y-2">
                      {AIRLINES.slice(0, 8).map((airline) => (
                        <Link href={`/airlines/${airline.slug}`} onNavigate={handleLink} key={airline.slug} className="text-left text-sm text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-0.5 flex items-center justify-between cursor-pointer">
                          <span className="truncate">{airline.name}</span>
                          <span className="font-mono-tabular text-xs text-slate-400">
                            {airline.code}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <a
            href="/guides"
            onClick={(e) => {
              e.preventDefault();
              handleLink('/guides');
            }}
            className={navLinkClass(currentPath.startsWith('/guides'))}
          >
            {primaryLinks.find((m) => m.path === '/guides')?.label || 'Guides'}
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {alertsEnabled && (
            <button
              type="button"
              onClick={onOpenAlerts}
              className="hidden sm:inline-flex items-center justify-center rounded-lg bg-orange-700 hover:bg-orange-800 px-4 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              Price Alerts
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 min-h-[44px] min-w-[44px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071120] px-4 py-4 space-y-2">
          <Link href={'/'} onNavigate={handleLink} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
            All Flight Deals
          </Link>
          <Link href={'/domestic'} onNavigate={handleLink} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
            Domestic Flights
          </Link>
          <Link href={'/international'} onNavigate={handleLink} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
            International Flights
          </Link>
          <Link href={'/search'} onNavigate={handleLink} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
            Site Search
          </Link>
          <Link href={'/guides'} onNavigate={handleLink} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
            Travel Guides
          </Link>
          <Link href={'/destinations/cancun'} onNavigate={handleLink} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
            Popular Destinations
          </Link>
          <Link href={'/about'} onNavigate={handleLink} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
            About &amp; Contact
          </Link>
          {alertsEnabled && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAlerts();
                }}
                className="w-full rounded-lg bg-orange-700 py-3 text-sm font-semibold text-white hover:bg-orange-800"
              >
                Get Free Price Alerts
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
