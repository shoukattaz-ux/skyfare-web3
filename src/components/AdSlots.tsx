import React, { useEffect, useRef, useState } from 'react';
import { Link } from './Link';
import { adsAllowedOnPath, loadAdSense, loadMediaNet } from '../lib/ads';
import { useConsent } from '../lib/consent';
import { useSiteConfig } from '../lib/siteConfig';
import type { AdPlacementConfig, MonetizationSettings, TravelGuide } from '../types/flight';

/**
 * A slot renders NOTHING (no box, no label, no placeholder) unless all of these hold:
 *  - the master "ads enabled" switch is on,
 *  - the placement is enabled and has an ad unit,
 *  - a publisher/customer ID for its network is configured,
 *  - the visitor has accepted advertising cookies,
 *  - the current page type is one where we allow ads.
 * If the network script is blocked or fails, the slot removes itself again.
 */

interface AdSlotProps {
  slotId: string;
  className?: string;
  /** Kept for backwards compatibility with existing call sites; configuration comes from context. */
  label?: string;
  adPlacements?: AdPlacementConfig[];
  monetization?: MonetizationSettings;
}

function useActivePlacement(slotId: string, fallbackId: string) {
  const { monetization, adPlacements } = useSiteConfig();
  const consent = useConsent();
  const placement =
    adPlacements.find((p) => p.slot_id === slotId) || adPlacements.find((p) => p.slot_id === fallbackId);
  if (!monetization?.adsEnabled || !placement || !placement.enabled || !placement.ad_unit_code) return null;
  if (!consent.ads) return null;
  if (typeof window !== 'undefined' && !adsAllowedOnPath(window.location.pathname)) return null;
  const network = placement.network === 'Media.net' ? 'Media.net' : 'AdSense';
  if (network === 'AdSense' && !monetization.adsensePublisherId) return null;
  if (network === 'Media.net' && !monetization.medianetCustomerId) return null;
  return { placement, network, monetization } as const;
}

const AdBox: React.FC<{ slotId: string; fallbackId: string; defaultHeight: number; className?: string }> = ({
  slotId,
  fallbackId,
  defaultHeight,
  className = '',
}) => {
  const active = useActivePlacement(slotId, fallbackId);
  const [failed, setFailed] = useState(false);
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const network = active?.network;
  const unit = active?.placement.ad_unit_code;
  const size = active?.placement.ad_size || '';
  const pubId = active?.monetization.adsensePublisherId;
  const mnetId = active?.monetization.medianetCustomerId;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    if (network === 'AdSense' && pubId) {
      loadAdSense(pubId)
        .then(() => {
          if (cancelled || pushed.current) return;
          pushed.current = true;
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch {
            setFailed(true);
          }
        })
        .catch(() => !cancelled && setFailed(true));
    } else if (network === 'Media.net' && mnetId && unit) {
      loadMediaNet(mnetId)
        .then(() => {
          if (cancelled) return;
          window._mNHandle?.queue?.push(() => {
            try {
              window._mNDetails?.loadTag(unit, size || '300x250', unit);
            } catch {
              /* a failing ad tag must never break the page */
            }
          });
        })
        .catch(() => !cancelled && setFailed(true));
    }
    return () => {
      cancelled = true;
    };
  }, [active, network, pubId, mnetId, unit, size]);

  if (!active || failed) return null;
  const minHeight = active.placement.min_height || defaultHeight;

  return (
    <aside
      aria-label="Advertisement"
      data-ad-slot={slotId}
      data-ad-network={network}
      style={{ minHeight: `${minHeight + 20}px` }}
      className={`w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0D1A2E] px-3 py-2 ${className}`}
    >
      <p className="text-[10px] font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400 text-center">
        Advertisement
      </p>
      <div style={{ minHeight: `${minHeight}px` }} className="flex items-center justify-center overflow-hidden">
        {network === 'AdSense' ? (
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: `${minHeight}px` }}
            data-ad-client={`ca-${pubId}`}
            data-ad-slot={unit}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div id={unit} />
        )}
      </div>
    </aside>
  );
};

export const LeaderboardAd: React.FC<AdSlotProps> = ({ slotId, className }) => (
  <AdBox slotId={slotId} fallbackId="skyfare-top-leaderboard" defaultHeight={100} className={className} />
);

export const InFeedAd: React.FC<AdSlotProps> = ({ slotId, className }) => (
  <AdBox slotId={slotId} fallbackId="skyfare-infeed-1" defaultHeight={120} className={className} />
);

export const SidebarAd: React.FC<AdSlotProps> = ({ slotId, className }) => (
  <AdBox slotId={slotId} fallbackId="guide-sidebar-300x250" defaultHeight={260} className={className} />
);

/** Editorial "keep reading" block. It is our own content, never labelled or styled as an ad. */
export const RelatedGuides: React.FC<{
  guides?: TravelGuide[];
  currentSlug?: string;
  onNavigate: (path: string) => void;
  title?: string;
}> = ({ guides, currentSlug, onNavigate, title = 'Keep reading' }) => {
  const items = (guides || []).filter((g) => g.slug !== currentSlug).slice(0, 4);
  if (items.length === 0) return null;
  return (
    <section
      aria-label={title}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6"
    >
      <h2 className="text-base font-semibold text-[#0B1F3A] dark:text-slate-100 pb-4 border-b border-slate-200 dark:border-slate-800">
        {title}
      </h2>
      <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guides/${g.slug}`}
              onNavigate={onNavigate}
              className="group block h-full p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1526] hover:border-sky-500/50 transition-colors"
            >
              <span className="text-xs text-sky-700 dark:text-sky-400 font-medium">{g.category}</span>
              <span className="mt-1.5 block text-sm font-semibold text-[#0B1F3A] dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 leading-snug">
                {g.title}
              </span>
              <span className="mt-3 block text-xs text-slate-500 dark:text-slate-400">
                {g.readTimeMinutes} min read
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
