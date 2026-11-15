import React, { useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import type {
  AdPlacementConfig,
  MonetizationSettings,
  TravelGuide,
} from '../types/flight';
import { TRAVEL_GUIDES } from '../data/guides';
import { getImageSrc } from '../lib/images';
import { InFeedAd, LeaderboardAd, RevcontentWidget, SidebarAd } from '../components/AdSlots';
import { SocialShare } from '../components/SocialShare';

interface GuidesIndexPageProps {
  guides?: TravelGuide[];
  onNavigate: (path: string) => void;
  adPlacements?: AdPlacementConfig[];
  monetization?: MonetizationSettings;
}

export const GuidesIndexPage: React.FC<GuidesIndexPageProps> = ({
  guides,
  onNavigate,
  adPlacements,
  monetization,
}) => {
  const activeGuides = guides && guides.length > 0 ? guides : TRAVEL_GUIDES;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = [
    'All',
    ...Array.from(new Set(activeGuides.map((g) => g.category))),
  ];

  const visibleGuides =
    selectedCategory === 'All'
      ? activeGuides
      : activeGuides.filter((g) => g.category === selectedCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
          SkyFare Editorial Desk
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
          Airfare Playbooks &amp; Travel Guides
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {activeGuides.length} original, analyst-written guides covering booking timing, baggage math, budget airlines, international gateways, and US/EU passenger refund rights.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#0B1F3A] dark:bg-sky-600 text-white'
                : 'bg-white dark:bg-[#0F1D32] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-500/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <LeaderboardAd
        slotId="skyfare-top-leaderboard"
        adPlacements={adPlacements}
        monetization={monetization}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleGuides.map((guide) => (
          <article
            key={guide.slug}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                <img
                  src={guide.customImageUrl || getImageSrc(guide.imageKey)}
                  alt={guide.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {guide.category} · {guide.readTimeMinutes} min read · Updated {guide.updatedAt}
                </div>
                <h2 className="mt-2 text-lg font-bold text-[#0B1F3A] dark:text-white leading-snug">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/guides/${guide.slug}`)}
                    className="text-left hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                  >
                    {guide.title}
                  </button>
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {guide.excerpt}
                </p>
              </div>
            </div>
            <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                By {guide.author}
              </span>
              <button
                type="button"
                onClick={() => onNavigate(`/guides/${guide.slug}`)}
                className="font-semibold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
              >
                Read Guide →
              </button>
            </div>
          </article>
        ))}
      </div>

      <RevcontentWidget
        onNavigate={onNavigate}
        adPlacements={adPlacements}
        monetization={monetization}
        guides={activeGuides}
      />
    </div>
  );
};

interface GuideDetailPageProps {
  slug: string;
  guides?: TravelGuide[];
  onNavigate: (path: string) => void;
  onOpenAlerts: () => void;
  adPlacements?: AdPlacementConfig[];
  monetization?: MonetizationSettings;
}

export const GuideDetailPage: React.FC<GuideDetailPageProps> = ({
  slug,
  guides,
  onNavigate,
  onOpenAlerts,
  adPlacements,
  monetization,
}) => {
  const activeGuides = guides && guides.length > 0 ? guides : TRAVEL_GUIDES;
  const guide = activeGuides.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#0B1F3A] dark:text-white">
          Guide Not Found
        </h1>
        <button
          type="button"
          onClick={() => onNavigate('/guides')}
          className="mt-5 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Browse All Guides
        </button>
      </div>
    );
  }

  const related = activeGuides.filter((g) => g.slug !== guide.slug).slice(0, 4);
  const tagItems = guide.tags
    ? guide.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <button
          type="button"
          onClick={() => onNavigate('/guides')}
          className="hover:text-[#0B1F3A] dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Travel Guides</span>
        </button>
        <span aria-hidden="true">/</span>
        <span className="truncate font-medium text-slate-800 dark:text-slate-200">
          {guide.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Article Column */}
        <article className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 sm:p-10 space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                {guide.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>{guide.readTimeMinutes} min read</span>
              <span aria-hidden="true">·</span>
              <span>Published {guide.publishedAt}</span>
              <span aria-hidden="true">·</span>
              <span>Updated {guide.updatedAt}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-[#0B1F3A] dark:text-white tracking-tight leading-tight">
              {guide.title}
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {guide.excerpt}
            </p>

            <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 flex flex-wrap items-center justify-between gap-2">
              <span>
                Written by <strong className="text-slate-800 dark:text-slate-200">{guide.author}</strong> ({guide.authorRole})
              </span>
              {tagItems.length > 0 && (
                <span className="text-slate-500 dark:text-slate-400">
                  Topics: {tagItems.join(' · ')}
                </span>
              )}
            </div>

            <SocialShare title={guide.title} description={guide.excerpt} />
          </header>

          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
            <img
              src={guide.customImageUrl || getImageSrc(guide.imageKey)}
              alt={guide.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>

          {guide.sections.map((section, idx) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, pIdx) => (
                <p
                  key={pIdx}
                  className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-[1.75]"
                >
                  {p}
                </p>
              ))}

              {section.bullets && (
                <ul className="space-y-2 pl-5 list-disc text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}

              {section.table && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-[#0B1526] text-slate-700 dark:text-slate-200">
                      <tr>
                        {section.table.headers.map((h) => (
                          <th key={h} className="px-4 py-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {section.table.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="px-4 py-3 text-slate-700 dark:text-slate-300 font-mono-tabular"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {idx === 0 && (
                <InFeedAd
                  slotId="skyfare-infeed-1"
                  adPlacements={adPlacements}
                  monetization={monetization}
                />
              )}
            </section>
          ))}

          {guide.faqs.length > 0 && (
            <section className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-[#0B1F3A] dark:text-white">
                Frequently Asked Questions
              </h2>
              {guide.faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="text-sm sm:text-base font-semibold text-[#0B1F3A] dark:text-white">
                    {faq.question}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </section>
          )}
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <SidebarAd
            slotId="guide-sidebar-300x250"
            adPlacements={adPlacements}
            monetization={monetization}
          />

          <div className="rounded-2xl bg-[#0B1F3A] text-white p-6 space-y-3">
            <h3 className="text-lg font-bold">Get Instant Fare Alerts</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We monitor nonstop and 1-stop drops from 35+ US airports so you book first.
            </p>
            <button
              type="button"
              onClick={onOpenAlerts}
              className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Set Up Price Alert
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Related Guides</span>
            </h3>
            <ul className="space-y-2.5">
              {related.map((rel) => (
                <li key={rel.slug}>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/guides/${rel.slug}`)}
                    className="text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 leading-snug cursor-pointer"
                  >
                    {rel.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <RevcontentWidget
        onNavigate={onNavigate}
        adPlacements={adPlacements}
        monetization={monetization}
        guides={activeGuides}
      />
    </div>
  );
};
