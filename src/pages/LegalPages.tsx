import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from '../components/Link';
import type { LegalPageRecord, SiteGeneralSettings, TravelGuide } from '../types/flight';
import { DESTINATIONS } from '../data/destinations';
import { AIRLINES } from '../data/airlines';
import { TRAVEL_GUIDES } from '../data/guides';
import { fillTokens, parseMarkdown, type Inline } from '../lib/markdown';

interface LegalNavProps {
  onNavigate: (path: string) => void;
  guides?: TravelGuide[];
}

const inlineNodes = (parts: Inline[], onNavigate: (p: string) => void): React.ReactNode[] =>
  parts.map((p, i) => {
    if (p.t === 'bold') return <strong key={i}>{p.v}</strong>;
    if (p.t === 'code') return <code key={i} className="font-mono text-[0.9em] rounded bg-slate-100 dark:bg-slate-800 px-1">{p.v}</code>;
    if (p.t === 'link') {
      const internal = p.href.startsWith('/') && !p.href.startsWith('//');
      return internal ? (
        <Link key={i} href={p.href} onNavigate={onNavigate} className="text-sky-700 dark:text-sky-400 underline underline-offset-2">
          {p.v}
        </Link>
      ) : (
        <a
          key={i}
          href={p.href}
          className="text-sky-700 dark:text-sky-400 underline underline-offset-2"
          {...(p.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {p.v}
        </a>
      );
    }
    return <React.Fragment key={i}>{p.v}</React.Fragment>;
  });

/** Renders any CMS-managed policy/about page (Admin -> SEO & Legal). */
export const LegalDocPage: React.FC<{
  slug: string;
  legalPages?: LegalPageRecord[];
  general?: SiteGeneralSettings;
  onNavigate: (path: string) => void;
  onOpenCookieSettings?: () => void;
}> = ({ slug, legalPages, general, onNavigate, onOpenCookieSettings }) => {
  const page = legalPages?.find((p) => p.slug === slug);
  if (!page) {
    // CMS data not loaded yet (first paint) — the server already sent the full text in the HTML.
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 text-sm text-slate-500" aria-busy="true">
        Loading…
      </div>
    );
  }
  const tokens = {
    siteName: general?.siteName,
    supportEmail: general?.supportEmail,
    publisherName: general?.publisherName,
    companyAddress: general?.companyAddress,
  };
  const blocks = parseMarkdown(fillTokens(page.content_markdown, tokens));
  const showCookieButton = slug === 'cookie-policy' || slug === 'privacy';

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        <Link href="/" onNavigate={onNavigate} className="hover:underline">Home</Link>
        <span aria-hidden="true"> / </span>
        <span>{fillTokens(page.title, tokens)}</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
        {fillTokens(page.title, tokens)}
      </h1>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Last updated {page.updated_at.slice(0, 10)}</p>

      <div className="mt-8 text-[15px] sm:text-base text-slate-700 dark:text-slate-300 leading-7 space-y-4 [overflow-wrap:anywhere]">
        {blocks.map((b, i) => {
          if (b.t === 'h2')
            return (
              <h2 key={i} className="pt-4 text-xl font-bold text-[#0B1F3A] dark:text-white">
                {inlineNodes(b.inline, onNavigate)}
              </h2>
            );
          if (b.t === 'h3')
            return (
              <h3 key={i} className="pt-2 text-base font-semibold text-[#0B1F3A] dark:text-white">
                {inlineNodes(b.inline, onNavigate)}
              </h3>
            );
          if (b.t === 'ul')
            return (
              <ul key={i} className="list-disc pl-5 space-y-2">
                {b.items.map((it, j) => (
                  <li key={j}>{inlineNodes(it, onNavigate)}</li>
                ))}
              </ul>
            );
          return <p key={i}>{inlineNodes(b.inline, onNavigate)}</p>;
        })}
      </div>

      {showCookieButton && onOpenCookieSettings && (
        <button
          type="button"
          onClick={onOpenCookieSettings}
          className="mt-8 rounded-lg bg-[#0B1F3A] dark:bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Change cookie choices
        </button>
      )}
    </article>
  );
};

export const ContactPage: React.FC<{ general?: SiteGeneralSettings }> = ({ general }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Question about a guide or fare');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, website: honeypot }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ ok: false, text: data.error || 'Submission failed. Please try again.' });
      } else {
        setStatus({ ok: true, text: data.message });
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch {
      setStatus({ ok: false, text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const field =
    'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1526] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';
  const label = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-5">
        <h1 className="text-3xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">Contact {general?.siteName || 'SkyFare'}</h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Spotted a mistake or an outdated fare? Have a question about a guide, a privacy request, or a partnership
          idea? Write to us. We read every message; we reply when a reply is needed.
        </p>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-4 text-sm">
          {general?.supportEmail && (
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <div className="font-semibold text-[#0B1F3A] dark:text-white">Email</div>
                <a href={`mailto:${general.supportEmail}`} className="text-sky-700 dark:text-sky-400 underline break-all">
                  {general.supportEmail}
                </a>
              </div>
            </div>
          )}
          {general?.companyAddress && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <div className="font-semibold text-[#0B1F3A] dark:text-white">{general.publisherName || 'Postal address'}</div>
                <div className="text-slate-600 dark:text-slate-300">{general.companyAddress}</div>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              For a correction, please include the page address. We cannot change airline fares, issue refunds or
              help with an existing booking; contact the airline or the site you booked with.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 sm:p-8">
        <h2 className="text-xl font-bold text-[#0B1F3A] dark:text-white">Send a message</h2>
        {status?.ok ? (
          <div role="status" className="mt-5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-emerald-900 dark:text-emerald-200">{status.text}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Honeypot: real visitors never see or fill this field. */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
              <label>
                Leave this empty
                <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="c-name" className={label}>Your name</label>
                <input id="c-name" type="text" required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
              </div>
              <div>
                <label htmlFor="c-email" className={label}>Email address</label>
                <input id="c-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
              </div>
            </div>
            <div>
              <label htmlFor="c-topic" className={label}>Topic</label>
              <select id="c-topic" value={subject} onChange={(e) => setSubject(e.target.value)} className={field}>
                <option>Question about a guide or fare</option>
                <option>Report an error or an expired fare</option>
                <option>Privacy or data request</option>
                <option>Advertising or partnerships</option>
                <option>Something else</option>
              </select>
            </div>
            <div>
              <label htmlFor="c-msg" className={label}>Message</label>
              <textarea id="c-msg" rows={5} required minLength={10} maxLength={2500} value={message} onChange={(e) => setMessage(e.target.value)} className={field} />
            </div>
            {status && !status.ok && (
              <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">{status.text}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-700 hover:bg-orange-800 disabled:opacity-60 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {submitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const HtmlSitemapPage: React.FC<LegalNavProps> = ({ onNavigate, guides }) => {
  const activeGuides = guides && guides.length > 0 ? guides : TRAVEL_GUIDES;
  const li = 'text-sky-700 dark:text-sky-400 hover:underline';
  const core: [string, string][] = [
    ['/', 'Home: example fares'],
    ['/domestic', 'Domestic fares'],
    ['/international', 'International fares'],
    ['/guides', 'All guides'],
    ['/search', 'Site search'],
    ['/about', 'About'],
    ['/editorial-policy', 'Editorial Policy'],
    ['/corrections-policy', 'Corrections Policy'],
    ['/contact', 'Contact'],
    ['/privacy', 'Privacy Policy'],
    ['/cookie-policy', 'Cookie Policy'],
    ['/terms', 'Terms of Use'],
    ['/affiliate-disclosure', 'Advertising and Affiliate Disclosure'],
    ['/disclaimer', 'Disclaimer'],
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A] dark:text-white">Site map</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Every guide, destination, airline page and policy in one list.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div>
          <h2 className="font-bold text-[#0B1F3A] dark:text-white mb-3">Main pages and policies</h2>
          <ul className="space-y-2">
            {core.map(([href, text]) => (
              <li key={href}><Link href={href} onNavigate={onNavigate} className={li}>{text}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-[#0B1F3A] dark:text-white mb-3">Destinations ({DESTINATIONS.length})</h2>
          <ul className="space-y-2">
            {DESTINATIONS.map((d) => (
              <li key={d.slug}><Link href={`/destinations/${d.slug}`} onNavigate={onNavigate} className={li}>Flights to {d.city}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-[#0B1F3A] dark:text-white mb-3">Airlines ({AIRLINES.length})</h2>
          <ul className="space-y-2">
            {AIRLINES.map((a) => (
              <li key={a.slug}><Link href={`/airlines/${a.slug}`} onNavigate={onNavigate} className={li}>{a.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-[#0B1F3A] dark:text-white mb-3">Guides ({activeGuides.length})</h2>
          <ul className="space-y-2">
            {activeGuides.map((g) => (
              <li key={g.slug}><Link href={`/guides/${g.slug}`} onNavigate={onNavigate} className={li}>{g.title}</Link></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC<LegalNavProps> = ({ onNavigate }) => (
  <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-5">
    <div className="font-mono-tabular text-5xl font-bold text-sky-700 dark:text-sky-400" aria-hidden="true">404</div>
    <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1F3A] dark:text-white">Page not found</h1>
    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
      This page does not exist or has moved. A fare entry may also have been removed once it ended.
    </p>
    <div className="flex flex-wrap justify-center gap-3 pt-2">
      <Link href="/" onNavigate={onNavigate} className="rounded-xl bg-orange-700 hover:bg-orange-800 px-5 py-2.5 text-sm font-semibold text-white">
        Go to the home page
      </Link>
      <Link href="/guides" onNavigate={onNavigate} className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200">
        Browse guides
      </Link>
      <Link href="/sitemap" onNavigate={onNavigate} className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200">
        Site map
      </Link>
    </div>
  </div>
);
