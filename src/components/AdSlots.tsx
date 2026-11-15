import React from 'react';
import type {
  AdPlacementConfig,
  MonetizationSettings,
  TravelGuide,
} from '../types/flight';

interface AdSlotProps {
  label?: string;
  slotId: string;
  className?: string;
  adPlacements?: AdPlacementConfig[];
  monetization?: MonetizationSettings;
}

function resolvePlacement(
  slotId: string,
  adPlacements?: AdPlacementConfig[],
  fallbackId?: string
): AdPlacementConfig | undefined {
  if (!adPlacements || adPlacements.length === 0) return undefined;
  return (
    adPlacements.find((p) => p.slot_id === slotId) ||
    (fallbackId ? adPlacements.find((p) => p.slot_id === fallbackId) : undefined)
  );
}

function networkTag(
  placement: AdPlacementConfig | undefined,
  monetization?: MonetizationSettings
): string {
  const network = placement?.network || 'AdSense';
  if (network === 'AdSense' && monetization?.adsensePublisherId) {
    return `Google AdSense (${monetization.adsensePublisherId})`;
  }
  if (network === 'Media.net' && monetization?.medianetCustomerId) {
    return `Media.net (${monetization.medianetCustomerId})`;
  }
  if (network === 'Revcontent' && monetization?.revcontentWidgetId) {
    return `Revcontent (${monetization.revcontentWidgetId})`;
  }
  return network;
}

export const LeaderboardAd: React.FC<AdSlotProps> = ({
  slotId,
  className = '',
  adPlacements,
  monetization,
}) => {
  const placement = resolvePlacement(slotId, adPlacements, 'skyfare-top-leaderboard');
  if (placement && !placement.enabled) return null;

  const minHeight = placement?.min_height || 96;
  const activeUnit = placement?.ad_unit_code?.trim();

  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot={slotId}
      data-ad-network={placement?.network || 'AdSense'}
      style={{ minHeight: `${minHeight}px` }}
      className={`w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-[#0D1A2E] px-4 py-3 flex flex-col items-center justify-center ${className}`}
    >
      <span className="text-[11px] font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400">
        Advertisement · {networkTag(placement, monetization)} · {slotId}
      </span>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-center">
        {activeUnit
          ? `Configured Ad Unit: ${activeUnit}`
          : 'Reserved 728×90 / 320×100 CLS-safe Google AdSense & Media.net display container'}
      </p>
    </aside>
  );
};

export const InFeedAd: React.FC<AdSlotProps> = ({
  slotId,
  className = '',
  adPlacements,
  monetization,
}) => {
  const placement = resolvePlacement(slotId, adPlacements, 'skyfare-infeed-1');
  if (placement && !placement.enabled) return null;

  const minHeight = placement?.min_height || 120;
  const activeUnit = placement?.ad_unit_code?.trim();

  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot={slotId}
      data-ad-network={placement?.network || 'Media.net'}
      style={{ minHeight: `${minHeight}px` }}
      className={`w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-[#0D1A2E] p-5 flex flex-col items-center justify-center ${className}`}
    >
      <span className="text-[11px] font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400">
        Sponsored Placement · {networkTag(placement, monetization)} · {slotId}
      </span>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-center max-w-md">
        {activeUnit
          ? `Configured Ad Unit: ${activeUnit}`
          : 'Fixed-height container prevents cumulative layout shift (CLS < 0.1) when AdSense or Media.net units render.'}
      </p>
    </aside>
  );
};

export const SidebarAd: React.FC<AdSlotProps> = ({
  slotId,
  className = '',
  adPlacements,
  monetization,
}) => {
  const placement = resolvePlacement(slotId, adPlacements, 'guide-sidebar-300x250');
  if (placement && !placement.enabled) return null;

  const minHeight = placement?.min_height || 260;
  const activeUnit = placement?.ad_unit_code?.trim();

  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot={slotId}
      data-ad-network={placement?.network || 'AdSense'}
      style={{ minHeight: `${minHeight}px` }}
      className={`w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-[#0D1A2E] p-5 flex flex-col items-center justify-center ${className}`}
    >
      <span className="text-[11px] font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400 text-center">
        Advertisement · 300×250 ({networkTag(placement, monetization)})
      </span>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
        {activeUnit ? `Configured Unit: ${activeUnit}` : 'Reserved Sidebar Rectangle Placement'}
      </p>
    </aside>
  );
};

interface RevcontentWidgetProps {
  onNavigate: (path: string) => void;
  adPlacements?: AdPlacementConfig[];
  monetization?: MonetizationSettings;
  guides?: TravelGuide[];
}

export const RevcontentWidget: React.FC<RevcontentWidgetProps> = ({
  onNavigate,
  adPlacements,
  monetization,
  guides,
}) => {
  const placement = resolvePlacement('rc-skyfare-native', adPlacements);
  if (placement && !placement.enabled) return null;

  const widgetId =
    monetization?.revcontentWidgetId ||
    import.meta.env.VITE_REVCONTENT_WIDGET_ID ||
    'rc-skyfare-native';

  const fallbackItems = [
    {
      title: 'How to Fly to Europe Under $450 Round-Trip This Winter',
      source: 'SkyFare Editorial',
      path: '/guides/europe-on-a-budget-from-usa',
      kicker: 'Transatlantic Guide',
    },
    {
      title: 'US Budget Airlines Compared: True Total Cost With Bags',
      source: 'SkyFare Consumer Desk',
      path: '/guides/budget-airlines-comparison',
      kicker: 'Fee Breakdown',
    },
    {
      title: 'TSA PreCheck vs. Global Entry: Which One Pays Off Fastest?',
      source: 'SkyFare Airport Lab',
      path: '/guides/tsa-precheck-global-entry-worth-it',
      kicker: 'Traveler Perks',
    },
    {
      title: 'Flight Delay Rights: When US & EU Airlines Owe Cash Refunds',
      source: 'SkyFare Legal Desk',
      path: '/guides/flight-delay-compensation-us-eu',
      kicker: 'Passenger Rights',
    },
  ];

  const nativeItems =
    guides && guides.length >= 4
      ? guides.slice(0, 4).map((g) => ({
          title: g.title,
          source: g.author,
          path: `/guides/${g.slug}`,
          kicker: g.category,
        }))
      : fallbackItems;

  return (
    <section
      aria-label="Recommended Travel Stories"
      data-revcontent-widget={widgetId}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-semibold text-[#0B1F3A] dark:text-slate-100">
          Recommended Travel &amp; Fare Guides
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Sponsored &amp; Native Content · Revcontent Ready ({widgetId})
        </span>
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {nativeItems.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => onNavigate(item.path)}
            className="text-left group flex flex-col justify-between p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1526] hover:border-sky-500/50 transition-colors cursor-pointer"
          >
            <div>
              <div className="text-xs text-sky-700 dark:text-sky-400 font-medium">
                {item.kicker}
              </div>
              <h4 className="mt-1.5 text-sm font-semibold text-[#0B1F3A] dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                {item.title}
              </h4>
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {item.source}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
