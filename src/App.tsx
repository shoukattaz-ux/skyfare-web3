import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { SiteConfigContext } from './lib/siteConfig';
import { getConsent, useConsent } from './lib/consent';
import type {
  AdPlacementConfig,
  FlightDeal,
  HomepageConfig,
  LegalPageRecord,
  MenuItem,
  MonetizationSettings,
  SiteBootstrap,
  SiteGeneralSettings,
  TravelGuide,
} from './types/flight';
import { FLIGHT_DEALS } from './data/deals';
import { TRAVEL_GUIDES } from './data/guides';
import { getRouteSEO } from './lib/seo';
import { MIN_PUBLISH_WORDS, countGuideWords } from './lib/guideStats';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PriceAlertModal } from './components/PriceAlertModal';
import { SavedDealsDrawer } from './components/SavedDealsDrawer';
import { CookieConsent } from './components/CookieConsent';
import { OfflineIndicator } from './components/PWAControls';
import { HomePage } from './pages/HomePage';
import { DestinationPage } from './pages/DestinationPage';
import { AirlinePage } from './pages/AirlinePage';
import { GuidesIndexPage, GuideDetailPage } from './pages/GuidesPage';
import { SearchPage } from './pages/SearchPage';
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
import { ContactPage, HtmlSitemapPage, LegalDocPage, NotFoundPage } from './pages/LegalPages';
import { LEGAL_SLUGS } from './lib/seo';

function readBoot(): SiteBootstrap | null {
  try {
    const el = typeof document !== 'undefined' ? document.getElementById('skyfare-boot') : null;
    return el?.textContent ? (JSON.parse(el.textContent) as SiteBootstrap) : null;
  } catch {
    return null;
  }
}
const BOOT = readBoot();
// Offline / no-server fallback: only the seed guides that pass the publishing word-count floor.
const FALLBACK_GUIDES = TRAVEL_GUIDES.filter((g) => countGuideWords(g) >= MIN_PUBLISH_WORDS);

const SAVED_KEY = 'skyfare_saved_deals_v1';
const THEME_KEY = 'skyfare_theme_v1';

export default function App() {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );
  const [deals, setDeals] = useState<FlightDeal[]>(BOOT?.deals?.length ? BOOT.deals : FLIGHT_DEALS);
  const [guides, setGuides] = useState<TravelGuide[]>(BOOT ? BOOT.guides : FALLBACK_GUIDES);
  const [adPlacements, setAdPlacements] = useState<AdPlacementConfig[]>(BOOT?.adPlacements ?? []);
  const [legalPages, setLegalPages] = useState<LegalPageRecord[]>(BOOT?.legalPages ?? []);
  const [general, setGeneral] = useState<SiteGeneralSettings | undefined>(BOOT?.general);
  const [monetization, setMonetization] = useState<MonetizationSettings | undefined>(BOOT?.monetization);
  const [menus, setMenus] = useState<MenuItem[]>(BOOT?.menus ?? []);
  const [homepage, setHomepage] = useState<HomepageConfig | undefined>(BOOT?.homepage);

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  const [alertsOpen, setAlertsOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [cookiePrefsOpen, setCookiePrefsOpen] = useState(false);
  const consent = useConsent();

  const refreshBootstrap = useCallback(() => {
    fetch('/api/bootstrap')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SiteBootstrap | null) => {
        if (!data) return;
        if (Array.isArray(data.deals) && data.deals.length > 0) setDeals(data.deals);
        if (Array.isArray(data.guides)) setGuides(data.guides);
        if (Array.isArray(data.adPlacements)) setAdPlacements(data.adPlacements);
        if (Array.isArray(data.legalPages)) setLegalPages(data.legalPages);
        if (data.general) setGeneral(data.general);
        if (data.monetization) setMonetization(data.monetization);
        if (Array.isArray(data.menus)) setMenus(data.menus);
        if (data.homepage) setHomepage(data.homepage);
      })
      .catch(() => {
        // Offline / fallback keeps preloaded static datasets
      });
  }, []);

  useEffect(() => {
    refreshBootstrap();
  }, [refreshBootstrap]);

  // Sync theme class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  // Persist saved deals
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  // Browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname || '/');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Google Analytics 4 loads only if an admin configured an ID AND the visitor opted in to analytics.
  useEffect(() => {
    const gaId = general?.ga4MeasurementId?.trim();
    if (!gaId || !/^G-[A-Z0-9]+$/i.test(gaId) || !consent.analytics) return;
    if (document.getElementById('skyfare-ga4-src')) return;
    const s = document.createElement('script');
    s.id = 'skyfare-ga4-src';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(s);
    const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', gaId);
  }, [general, consent.analytics]);

  // Dynamic Document Title, Canonical, OpenGraph, JSON-LD, and lightweight Analytics per route
  useEffect(() => {
    const origin = window.location.origin;
    const seo = getRouteSEO(pathname, origin, {
      guides,
      legal: legalPages,
      siteName: general?.siteName,
      supportEmail: general?.supportEmail,
    });
    document.title = seo.title;

    const setMeta = (selector: string, attr: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (attr === 'name') el.setAttribute('name', selector.match(/"([^"]+)"/)?.[1] || '');
        if (attr === 'property') el.setAttribute('property', selector.match(/"([^"]+)"/)?.[1] || '');
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', seo.description);
    setMeta('meta[property="og:title"]', 'property', seo.title);
    setMeta('meta[property="og:description"]', 'property', seo.description);
    setMeta('meta[property="og:type"]', 'property', seo.ogType);
    setMeta('meta[property="og:url"]', 'property', `${origin}${seo.canonicalPath}`);
    setMeta('meta[name="twitter:title"]', 'name', seo.title);
    setMeta('meta[name="twitter:description"]', 'name', seo.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${origin}${seo.canonicalPath}`);

    // Reuse the server-rendered tag so a page never carries two copies of its structured data.
    const scriptId = 'skyfare-jsonld-ssr';
    let jsonLdScript = document.getElementById(scriptId);
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = scriptId;
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c');

    let robots = document.querySelector('meta[name="robots"]');
    if (seo.noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex, nofollow');
    } else if (robots) {
      robots.remove();
    }

    // First-party page counter (no cookie, no IP stored) - only with analytics consent.
    if (!pathname.startsWith('/admin') && getConsent().analytics) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname.split('?')[0], eventType: 'pageview' }),
      }).catch(() => {});
    }
  }, [pathname, guides, legalPages, general, consent.analytics]);

  const navigate = (nextPath: string) => {
    const clean = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
    if (clean !== pathname) {
      window.history.pushState({}, '', clean);
      setPathname(clean);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveDeal = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const savedDealsList = deals.filter((d) => savedIds.includes(d.id));

  const renderRoute = () => {
    const rawClean = pathname.split('?')[0];
    const clean = rawClean === '/' ? '/' : rawClean.replace(/\/+$/, '');

    if (clean === '/') {
      return (
        <HomePage
          deals={deals}
          guides={guides}
          savedIds={savedIds}
          onToggleSave={toggleSaveDeal}
          onOpenSaved={() => setSavedOpen(true)}
          onOpenAlerts={() => setAlertsOpen(true)}
          onNavigate={navigate}
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
          adPlacements={adPlacements}
          monetization={monetization}
          homepage={homepage}
        />
      );
    }

    if (clean === '/domestic') {
      return (
        <HomePage
          deals={deals}
          guides={guides}
          savedIds={savedIds}
          onToggleSave={toggleSaveDeal}
          onOpenSaved={() => setSavedOpen(true)}
          onOpenAlerts={() => setAlertsOpen(true)}
          onNavigate={navigate}
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
          lockedCategory="domestic"
          adPlacements={adPlacements}
          monetization={monetization}
          homepage={homepage}
        />
      );
    }

    if (clean === '/international') {
      return (
        <HomePage
          deals={deals}
          guides={guides}
          savedIds={savedIds}
          onToggleSave={toggleSaveDeal}
          onOpenSaved={() => setSavedOpen(true)}
          onOpenAlerts={() => setAlertsOpen(true)}
          onNavigate={navigate}
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
          lockedCategory="international"
          adPlacements={adPlacements}
          monetization={monetization}
          homepage={homepage}
        />
      );
    }

    if (clean === '/search') {
      return (
        <SearchPage
          savedIds={savedIds}
          onToggleSave={toggleSaveDeal}
          onNavigate={navigate}
          adPlacements={adPlacements}
          monetization={monetization}
        />
      );
    }

    if (clean === '/admin') {
      return (
        <Suspense fallback={<div className="p-8 text-sm text-slate-500" aria-busy="true">Loading…</div>}>
          <AdminPage onNavigate={navigate} onDataChanged={refreshBootstrap} />
        </Suspense>
      );
    }

    if (clean.startsWith('/destinations/')) {
      const slug = clean.replace('/destinations/', '');
      return (
        <DestinationPage
          slug={slug}
          deals={deals}
          guides={guides}
          savedIds={savedIds}
          onToggleSave={toggleSaveDeal}
          onNavigate={navigate}
          onOpenAlerts={() => setAlertsOpen(true)}
          adPlacements={adPlacements}
          monetization={monetization}
        />
      );
    }

    if (clean.startsWith('/airlines/')) {
      const slug = clean.replace('/airlines/', '');
      return (
        <AirlinePage
          slug={slug}
          deals={deals}
          savedIds={savedIds}
          onToggleSave={toggleSaveDeal}
          onNavigate={navigate}
        />
      );
    }

    if (clean === '/guides') {
      return (
        <GuidesIndexPage
          guides={guides}
          onNavigate={navigate}
          adPlacements={adPlacements}
          monetization={monetization}
        />
      );
    }

    if (clean.startsWith('/guides/')) {
      const slug = clean.replace('/guides/', '');
      return (
        <GuideDetailPage
          slug={slug}
          guides={guides}
          onNavigate={navigate}
          onOpenAlerts={() => setAlertsOpen(true)}
          adPlacements={adPlacements}
          monetization={monetization}
        />
      );
    }

    if (clean === '/contact') return <ContactPage general={general} />;
    if (clean === '/sitemap') return <HtmlSitemapPage onNavigate={navigate} guides={guides} />;
    if ((LEGAL_SLUGS as readonly string[]).includes(clean.slice(1))) {
      return (
        <LegalDocPage
          slug={clean.slice(1)}
          legalPages={legalPages}
          general={general}
          onNavigate={navigate}
          onOpenCookieSettings={() => setCookiePrefsOpen(true)}
        />
      );
    }

    return <NotFoundPage onNavigate={navigate} />;
  };

  const alertsEnabled = general?.emailAlertsEnabled === true;

  return (
    <SiteConfigContext.Provider value={{ general, monetization, adPlacements }}>
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#071120] text-slate-900 dark:text-slate-100 pb-14 lg:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#0B1F3A] focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Header
        currentPath={pathname}
        onNavigate={navigate}
        onOpenAlerts={() => setAlertsOpen(true)}
        alertsEnabled={alertsEnabled}
        menus={menus}
      />

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{renderRoute()}</main>

      <Footer
        onNavigate={navigate}
        onOpenCookieSettings={() => setCookiePrefsOpen(true)}
      />

      {/* Slim Mobile Bottom Action Bar (<= 48px) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-12 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#071120]/95 backdrop-blur-md px-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0B1F3A] dark:bg-sky-700 py-2 text-xs font-semibold text-white"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Search Site</span>
        </button>
        {alertsEnabled && (
          <button
            type="button"
            onClick={() => setAlertsOpen(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-700 py-2 text-xs font-semibold text-white"
          >
            <Bell className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Price Alerts</span>
          </button>
        )}
      </div>

      {alertsEnabled && (
        <PriceAlertModal isOpen={alertsOpen} onClose={() => setAlertsOpen(false)} />
      )}

      <SavedDealsDrawer
        isOpen={savedOpen}
        onClose={() => setSavedOpen(false)}
        savedDeals={savedDealsList}
        onRemove={toggleSaveDeal}
      />

      <CookieConsent
        forceOpenPreferences={cookiePrefsOpen}
        onClosePreferences={() => setCookiePrefsOpen(false)}
        onNavigate={navigate}
      />

      <OfflineIndicator />
    </div>
    </SiteConfigContext.Provider>
  );
}
