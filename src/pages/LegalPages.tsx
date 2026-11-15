import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, ShieldCheck } from 'lucide-react';
import type { LegalPageRecord, TravelGuide } from '../types/flight';
import { DESTINATIONS } from '../data/destinations';
import { AIRLINES } from '../data/airlines';
import { TRAVEL_GUIDES } from '../data/guides';

interface LegalNavProps {
  onNavigate: (path: string) => void;
  legalPages?: LegalPageRecord[];
  guides?: TravelGuide[];
}

function getCmsLegal(legalPages: LegalPageRecord[] | undefined, slug: string): LegalPageRecord | undefined {
  return legalPages?.find((p) => p.slug === slug);
}

const CmsParagraphs: React.FC<{ markdown: string }> = ({ markdown }) => (
  <div className="space-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
    {markdown
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((para, idx) => (
        <p key={idx}>{para}</p>
      ))}
  </div>
);

export const AboutPage: React.FC<LegalNavProps> = ({ onNavigate, legalPages }) => {
  const cms = getCmsLegal(legalPages, 'about');
  return (
  <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
    <header className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
        About SkyFare
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
        {cms?.title || 'Making Transparent Airfare Accessible to Every US Traveler'}
      </h1>
      <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
        SkyFare Media LLC was founded in San Francisco with one plain goal: help budget-conscious US travelers fly more and pay less without falling for hidden bag fees or deceptive countdown gimmicks.
      </p>
    </header>
    {cms?.content_markdown && (
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 sm:p-8">
        <CmsParagraphs markdown={cms.content_markdown} />
      </section>
    )}

    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 sm:p-8 space-y-4">
      <h2 className="text-xl font-bold text-[#0B1F3A] dark:text-white">Our Editorial &amp; Data Standards</h2>
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
        Unlike automated scraping bots that publish broken ghost fares, SkyFare monitors accredited aviation data partners including Amadeus, Travelpayouts, Skyscanner, and Expedia Partner Solutions. Every deal card highlights carry-on eligibility, cabin class, layover airports, and verified update timestamps.
      </p>
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
        Our revenue comes from clearly labeled display advertisements and affiliate booking commissions—never ticket markups. Clicking any outbound deal link costs you zero extra dollars.
      </p>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-bold text-[#0B1F3A] dark:text-white">Editorial &amp; Pricing Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5">
          <h3 className="font-semibold text-[#0B1F3A] dark:text-white">Elena Vance</h3>
          <p className="text-xs text-sky-700 dark:text-sky-400 mt-0.5">Senior Airfare Analyst</p>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Former airline revenue analyst specializing in transatlantic fare buckets and alliance stopover rules.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5">
          <h3 className="font-semibold text-[#0B1F3A] dark:text-white">Marcus Thorne</h3>
          <p className="text-xs text-sky-700 dark:text-sky-400 mt-0.5">Route Pricing Editor</p>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Tracks Pacific Northwest, Midwest, and transpacific fare calendars across 35+ US departure hubs.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5">
          <h3 className="font-semibold text-[#0B1F3A] dark:text-white">Claire Lindqvist</h3>
          <p className="text-xs text-sky-700 dark:text-sky-400 mt-0.5">Consumer Aviation Writer</p>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Audits domestic carrier baggage dimensions, family seating rules, and US DOT / EU261 refund protections.
          </p>
        </div>
      </div>
    </section>

    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => onNavigate('/contact')}
        className="rounded-xl bg-orange-600 hover:bg-orange-700 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
      >
        Contact Our Team
      </button>
      <button
        type="button"
        onClick={() => onNavigate('/affiliate-disclosure')}
        className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
      >
        Read Affiliate Disclosure
      </button>
    </div>
  </article>
  );
};

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Flight Deal Question');
  const [message, setMessage] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (captchaAnswer.trim() !== '7') {
      setStatus({ ok: false, text: 'Please answer the human verification question (3 + 4 = 7).' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ ok: false, text: data.error || 'Submission failed.' });
      } else {
        setStatus({ ok: true, text: data.message });
        setName('');
        setEmail('');
        setMessage('');
        setCaptchaAnswer('');
      }
    } catch {
      setStatus({ ok: false, text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-5">
        <h1 className="text-3xl font-bold text-[#0B1F3A] dark:text-white tracking-tight">
          Contact SkyFare
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Have a route request, press inquiry, ad partnership question, or privacy request? Reach our editorial desk directly.
        </p>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-[#0B1F3A] dark:text-white">Support &amp; Editorial</div>
              <div className="text-slate-600 dark:text-slate-300">support@skyfareusa.com</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-[#0B1F3A] dark:text-white">US Mailing Address</div>
              <div className="text-slate-600 dark:text-slate-300">
                SkyFare Media LLC<br />
                548 Market St, Suite 41290<br />
                San Francisco, CA 94104
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Typical response time: 1 business day (Monday–Friday, 9am–5pm PT).
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 sm:p-8">
        <h2 className="text-xl font-bold text-[#0B1F3A] dark:text-white">Send a Message</h2>
        {status?.ok ? (
          <div className="mt-5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-900 dark:text-emerald-200">{status.text}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              aria-hidden="true"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1526] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1526] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Topic
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1526] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
              >
                <option>Flight Deal Question</option>
                <option>Report an Expired Fare</option>
                <option>Advertising &amp; Partnerships</option>
                <option>GDPR / CCPA Privacy Request</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1526] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Spam Protection: What is 3 + 4?
              </label>
              <input
                type="text"
                required
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Enter number"
                className="w-40 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1526] px-3.5 py-2 text-sm font-mono-tabular text-slate-900 dark:text-white"
              />
            </div>

            {status && !status.ok && (
              <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                {status.text}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 px-6 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC<{
  onOpenCookieSettings: () => void;
  legalPages?: LegalPageRecord[];
}> = ({ onOpenCookieSettings, legalPages }) => {
  const cms = getCmsLegal(legalPages, 'privacy');
  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
      <h1 className="text-3xl font-bold text-[#0B1F3A] dark:text-white">
        {cms?.title || 'Privacy Policy'}
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Last Updated: {cms?.updated_at?.slice(0, 10) || '2026-11-14'} · SkyFare Media LLC
      </p>

      {cms?.content_markdown && <CmsParagraphs markdown={cms.content_markdown} />}

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#0B1F3A] dark:text-white">1. Information We Collect</h2>
        <p>
          We collect information you voluntarily submit when subscribing to price alerts, joining our newsletter, or submitting our contact form (such as email address, origin airport preference, and message content). Saved deals and theme preferences are stored locally in your browser.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#0B1F3A] dark:text-white">
          2. Cookies, Google AdSense, Media.net &amp; Revcontent Advertising
        </h2>
        <p>
          Third-party vendors, including Google AdSense, Media.net, and Revcontent, use cookies to serve ads based on a user’s prior visits to SkyFare or other websites. Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.
        </p>
        <button
          type="button"
          onClick={onOpenCookieSettings}
          className="mt-2 rounded-lg bg-[#0B1F3A] dark:bg-sky-600 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
        >
          Manage Cookie &amp; Ad Preferences
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold text-[#0B1F3A] dark:text-white">3. GDPR &amp; CCPA / CPRA Rights</h2>
        <p>
          European Economic Area (GDPR) and California (CCPA/CPRA) residents have the right to request access to, correction of, or deletion of personal information, and to opt out of personalized ad targeting. Contact support@skyfareusa.com to exercise any privacy right within 30 days.
        </p>
      </section>
    </article>
  );
};

export const CookiePolicyPage: React.FC<{
  onOpenCookieSettings: () => void;
  legalPages?: LegalPageRecord[];
}> = ({ onOpenCookieSettings, legalPages }) => {
  const cms = getCmsLegal(legalPages, 'cookie-policy');
  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
      <h1 className="text-3xl font-bold text-[#0B1F3A] dark:text-white">
        {cms?.title || 'Cookie Policy'}
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Last Updated: {cms?.updated_at?.slice(0, 10) || '2026-11-14'} · SkyFare Media LLC
      </p>

      {cms?.content_markdown && <CmsParagraphs markdown={cms.content_markdown} />}

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-[#0B1526] text-slate-700 dark:text-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Purpose</th>
              <th className="px-4 py-3 font-semibold">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            <tr>
              <td className="px-4 py-3 font-semibold">Essential Storage</td>
              <td className="px-4 py-3">Saved deals, dark/light theme, staff CSRF/session security</td>
              <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-medium">Always Active</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">Analytics (GA4)</td>
              <td className="px-4 py-3">Measures route popularity, page load speed, and readership</td>
              <td className="px-4 py-3">Consent Banner Toggle</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold">Advertising (AdSense, Media.net, Revcontent)</td>
              <td className="px-4 py-3">Delivers contextual or personalized travel advertisements</td>
              <td className="px-4 py-3">Consent Banner Toggle</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={onOpenCookieSettings}
        className="rounded-lg bg-orange-600 hover:bg-orange-700 px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
      >
        Update Cookie Consent Choices
      </button>
    </article>
  );
};

export const TermsPage: React.FC<{ legalPages?: LegalPageRecord[] }> = ({ legalPages }) => {
  const cms = getCmsLegal(legalPages, 'terms');
  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
      <h1 className="text-3xl font-bold text-[#0B1F3A] dark:text-white">
        {cms?.title || 'Terms & Conditions'}
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Last Updated: {cms?.updated_at?.slice(0, 10) || '2026-11-14'}
      </p>
      {cms?.content_markdown && <CmsParagraphs markdown={cms.content_markdown} />}
      <p>
        SkyFare is an independent airfare discovery and travel editorial publisher. We do not directly sell airline tickets, process ticket payments, or operate aircraft. When you click "View Deal", you are redirected to an accredited airline or travel booking partner whose own terms, fare rules, and privacy policies govern your reservation.
      </p>
      <p>
        While we verify published fares prior to listing, airfare inventory changes dynamically by the minute. You agree to review total pricing, baggage fees, layovers, and cancellation conditions on the partner’s checkout page before completing any purchase.
      </p>
    </article>
  );
};

export const AffiliateDisclosurePage: React.FC<{ legalPages?: LegalPageRecord[] }> = ({
  legalPages,
}) => {
  const cms = getCmsLegal(legalPages, 'affiliate-disclosure');
  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
      <h1 className="text-3xl font-bold text-[#0B1F3A] dark:text-white">
        {cms?.title || 'Affiliate & Advertising Disclosure'}
      </h1>
      {cms?.content_markdown && <CmsParagraphs markdown={cms.content_markdown} />}
      <p>
        In accordance with Federal Trade Commission (FTC) guidelines, SkyFare Media LLC discloses that outbound flight deal buttons on this website are affiliate links (tagged with <code className="font-mono-tabular">rel="sponsored nofollow"</code>) to partners including Travelpayouts, Expedia Affiliate Network, Skyscanner, and Amadeus partner platforms.
      </p>
      <p>
        If you click a deal link and book a flight, SkyFare may earn a referral commission at zero additional cost to you. Compensation never influences which fare drops we publish—deals are selected strictly on price value, routing quality, and baggage transparency.
      </p>
      <p>
        Display advertising slots on SkyFare are reserved for Google AdSense, Media.net, and Revcontent native recommendations, clearly labeled "Advertisement" or "Sponsored Placement".
      </p>
    </article>
  );
};

export const DisclaimerPage: React.FC<{ legalPages?: LegalPageRecord[] }> = ({ legalPages }) => {
  const cms = getCmsLegal(legalPages, 'disclaimer');
  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
      <h1 className="text-3xl font-bold text-[#0B1F3A] dark:text-white">
        {cms?.title || 'Airfare Pricing Disclaimer'}
      </h1>
      {cms?.content_markdown && <CmsParagraphs markdown={cms.content_markdown} />}
      <p>
        <strong>Prices may change without notice.</strong> All airfares displayed on SkyFare reflect verified round-trip or one-way base quotes observed at the listed "Last updated" timestamp for a single adult traveler in USD, including mandatory taxes and carrier surcharges unless otherwise noted.
      </p>
      <p>
        Optional airline ancillaries—including checked luggage, advance seat selection, priority boarding, or basic economy carry-on upgrades—may incur additional airline charges. Travelers are solely responsible for verifying passport validity, transit visas, and entry requirements before departure.
      </p>
    </article>
  );
};

export const HtmlSitemapPage: React.FC<LegalNavProps> = ({ onNavigate, guides }) => {
  const activeGuides = guides && guides.length > 0 ? guides : TRAVEL_GUIDES;
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A] dark:text-white">HTML Sitemap</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Complete directory of all SkyFare deal hubs, destination guides, airline policies, editorial articles, search, and legal disclosures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div>
          <h2 className="font-bold text-[#0B1F3A] dark:text-white mb-3">Core &amp; Legal Pages</h2>
          <ul className="space-y-2 text-sky-700 dark:text-sky-400">
            <li><button type="button" onClick={() => onNavigate('/')}>Home / All Flight Deals</button></li>
            <li><button type="button" onClick={() => onNavigate('/domestic')}>Domestic USA Flights</button></li>
            <li><button type="button" onClick={() => onNavigate('/international')}>International Flights</button></li>
            <li><button type="button" onClick={() => onNavigate('/search')}>Site Search</button></li>
            <li><button type="button" onClick={() => onNavigate('/guides')}>Travel Guides Index</button></li>
            <li><button type="button" onClick={() => onNavigate('/about')}>About Us</button></li>
            <li><button type="button" onClick={() => onNavigate('/contact')}>Contact Us</button></li>
            <li><button type="button" onClick={() => onNavigate('/privacy')}>Privacy Policy</button></li>
            <li><button type="button" onClick={() => onNavigate('/cookie-policy')}>Cookie Policy</button></li>
            <li><button type="button" onClick={() => onNavigate('/terms')}>Terms &amp; Conditions</button></li>
            <li><button type="button" onClick={() => onNavigate('/affiliate-disclosure')}>Affiliate Disclosure</button></li>
            <li><button type="button" onClick={() => onNavigate('/disclaimer')}>Disclaimer</button></li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-[#0B1F3A] dark:text-white mb-3">Destinations ({DESTINATIONS.length})</h2>
          <ul className="space-y-2 text-sky-700 dark:text-sky-400">
            {DESTINATIONS.map((d) => (
              <li key={d.slug}>
                <button type="button" onClick={() => onNavigate(`/destinations/${d.slug}`)}>
                  Cheap Flights to {d.city}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-[#0B1F3A] dark:text-white mb-3">Airlines ({AIRLINES.length})</h2>
          <ul className="space-y-2 text-sky-700 dark:text-sky-400">
            {AIRLINES.map((a) => (
              <li key={a.slug}>
                <button type="button" onClick={() => onNavigate(`/airlines/${a.slug}`)}>
                  {a.name} Deals
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-[#0B1F3A] dark:text-white mb-3">Travel Guides ({activeGuides.length})</h2>
          <ul className="space-y-2 text-sky-700 dark:text-sky-400">
            {activeGuides.map((g) => (
              <li key={g.slug}>
                <button type="button" onClick={() => onNavigate(`/guides/${g.slug}`)} className="text-left">
                  {g.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC<LegalNavProps> = ({ onNavigate }) => (
  <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-5">
    <div className="font-mono-tabular text-5xl font-bold text-sky-600 dark:text-sky-400">
      404
    </div>
    <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1F3A] dark:text-white">
      Flight Route or Page Not Found
    </h1>
    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
      The page or flight fare you requested may have expired or moved. Explore active domestic and international flight deals below.
    </p>
    <div className="flex flex-wrap justify-center gap-3 pt-2">
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="rounded-xl bg-orange-600 hover:bg-orange-700 px-5 py-2.5 text-sm font-semibold text-white"
      >
        View All Deals
      </button>
      <button
        type="button"
        onClick={() => onNavigate('/sitemap')}
        className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        Open Sitemap
      </button>
    </div>
  </div>
);
