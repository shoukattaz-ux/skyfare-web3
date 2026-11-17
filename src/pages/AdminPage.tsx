import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Database,
  DollarSign,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Layout,
  LogOut,
  Plane,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import type {
  AdPlacementConfig,
  AdminUser,
  CategoryRecord,
  FlightDeal,
  HomepageConfig,
  ImageKey,
  LegalPageRecord,
  MediaAssetRecord,
  MenuItem,
  MonetizationSettings,
  SiteGeneralSettings,
  TravelGuide,
} from '../types/flight';
import { getImageSrc } from '../lib/images';

interface AdminPageProps {
  onNavigate: (path: string) => void;
  onDataChanged: () => void;
}

type AdminTab =
  | 'overview'
  | 'guides'
  | 'deals'
  | 'categories-media'
  | 'menus-homepage'
  | 'monetization'
  | 'seo-legal'
  | 'users-backup';

interface AuthSession {
  user: { id: number; email: string; name: string; role: 'admin' | 'editor' | 'analyst' };
  csrfToken: string;
}

interface DashboardPayload {
  stats: {
    totalDeals: number;
    totalGuides: number;
    totalAlerts: number;
    totalSubscribers: number;
    totalMessages: number;
    totalPageviews: number;
  };
  deals: (FlightDeal & { status?: string })[];
  guides: TravelGuide[];
  authors?: { id: number; name: string; role: string; bio: string; active: number }[];
  feedback?: { slug: string; helpful: number; not_helpful: number }[];
  categories: CategoryRecord[];
  media: MediaAssetRecord[];
  adPlacements: AdPlacementConfig[];
  legalPages: LegalPageRecord[];
  alerts: { id: number; email: string; origin: string; destination: string; max_price: number; created_at: string }[];
  subscribers: { email: string; created_at: string }[];
  messages: { id: string; name: string; email: string; subject: string; message: string; status: string; created_at: string }[];
  topRoutes: { path: string; views: number }[];
  general: SiteGeneralSettings;
  monetization: MonetizationSettings;
  menus: MenuItem[];
  homepage: HomepageConfig;
}

import { GuideEditor, type AdminGuide } from './admin/GuideEditor';
import { MonetizationPanel } from './admin/MonetizationPanel';
import { AuthorsPanel } from './admin/AuthorsPanel';

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, onDataChanged }) => {
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<AdminTab>('overview');
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bannerMsg, setBannerMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // --- Deal editor state ---
  const [dealForm, setDealForm] = useState({
    id: '',
    airlineSlug: 'delta',
    airlineName: 'Delta Air Lines',
    airlineCode: 'DL',
    originCode: 'JFK',
    originCity: 'New York',
    destinationCode: 'CUN',
    destinationCity: 'Cancun',
    destinationSlug: 'cancun',
    country: 'Mexico',
    category: 'international' as 'domestic' | 'international',
    price: 238,
    originalPrice: 520,
    departureDate: '2026-12-10',
    returnDate: '2026-12-16',
    durationLabel: '4h 15m',
    durationMinutes: 255,
    stops: 0,
    baggagePolicy: '1 carry-on + 1 personal item included',
    affiliateUrl: 'https://www.expedia.com/Flights',
    imageKey: 'cancun' as ImageKey,
    status: 'published',
  });

  // --- Category & User forms ---
  const [uploadAlt, setUploadAlt] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'editor', password: '' });

  // --- Editable copies of settings/ads/legal ---
  const [generalForm, setGeneralForm] = useState<SiteGeneralSettings | null>(null);
  const [homepageForm, setHomepageForm] = useState<HomepageConfig | null>(null);
  const [menusForm, setMenusForm] = useState<MenuItem[]>([]);
  const [selectedLegalSlug, setSelectedLegalSlug] = useState('privacy');
  const [legalDraft, setLegalDraft] = useState<LegalPageRecord | null>(null);

  const loadDashboard = useCallback(async (role?: string) => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) return;
      const data = (await res.json()) as DashboardPayload;
      setDashboard(data);
      setGeneralForm(data.general);
      setHomepageForm(data.homepage);
      setMenusForm(data.menus || []);
      const firstLegal =
        data.legalPages.find((p) => p.slug === selectedLegalSlug) || data.legalPages[0] || null;
      setLegalDraft(firstLegal);

      if (role === 'admin') {
        const uRes = await fetch('/api/admin/users');
        if (uRes.ok) {
          const uData = await uRes.json();
          setUsers(uData.users || []);
        }
      }
    } catch {
      // handled silently
    }
  }, [selectedLegalSlug]);

  useEffect(() => {
    fetch('/api/auth/me')
      // Always read the body, even for a 401, so the request completes cleanly.
      .then((r) => r.json().then((d) => (r.ok ? d : null)).catch(() => null))
      .then((data) => {
        if (data?.user) {
          setAuth(data);
          loadDashboard(data.user.role);
        }
      })
      .finally(() => setCheckingAuth(false));
  }, [loadDashboard]);

  const notify = (ok: boolean, text: string) => {
    setBannerMsg({ ok, text });
    setTimeout(() => setBannerMsg(null), 5000);
  };

  const authedFetch = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (auth?.csrfToken) {
      headers['X-CSRF-Token'] = auth.csrfToken;
    }
    return fetch(url, { ...options, headers });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Sign-in failed.');
      } else {
        setAuth(data);
        setLoginPassword('');
        await loadDashboard(data.user.role);
      }
    } catch {
      setLoginError('Network error signing in.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuth(null);
    setDashboard(null);
  };

  // --- CRUD Handlers ---
  const saveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await authedFetch('/api/admin/deals', {
        method: 'POST',
        body: JSON.stringify(dealForm),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(false, data.error || 'Failed to save deal.');
      } else {
        notify(true, `Saved fare ${data.deal.originCode} → ${data.deal.destinationCode}.`);
        setDealForm((prev) => ({ ...prev, id: '' }));
        await loadDashboard(auth?.user.role);
        onDataChanged();
      }
    } finally {
      setBusy(false);
    }
  };

  const deleteDeal = async (id: string) => {
    const res = await authedFetch(`/api/admin/deals/${id}`, { method: 'DELETE' });
    if (res.ok) {
      notify(true, `Removed deal "${id}".`);
      await loadDashboard(auth?.user.role);
      onDataChanged();
    }
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authedFetch('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name: catName, description: catDesc }),
    });
    if (res.ok) {
      setCatName('');
      setCatDesc('');
      notify(true, 'Category saved.');
      await loadDashboard(auth?.user.role);
      onDataChanged();
    }
  };

  const deleteCategory = async (id: number) => {
    const res = await authedFetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await loadDashboard(auth?.user.role);
      onDataChanged();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const input = e.target;
    if (!file) return;
    if (uploadAlt.trim().length < 5) {
      notify(false, 'Describe the image first (alt text, at least 5 characters), then choose the file.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = String(reader.result || '');
      const res = await authedFetch('/api/admin/media', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || 'image/jpeg',
          base64Data,
          altText: uploadAlt.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(false, data.error || 'Upload failed.');
      } else {
        notify(true, `Uploaded ${file.name} to Media Library.`);
        setUploadAlt('');
        input.value = '';
        await loadDashboard(auth?.user.role);
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteMedia = async (id: string) => {
    const res = await authedFetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    if (res.ok) {
      notify(true, 'Media asset deleted.');
      await loadDashboard(auth?.user.role);
    }
  };

  const saveSettingsAndHomepage = async () => {
    setBusy(true);
    try {
      const res = await authedFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          general: generalForm,
          menus: menusForm,
          homepage: homepageForm,
        }),
      });
      if (res.ok) {
        notify(true, 'Site settings, menus & homepage saved.');
        await loadDashboard(auth?.user.role);
        onDataChanged();
      } else {
        const d = await res.json();
        notify(false, d.error || 'Save failed.');
      }
    } finally {
      setBusy(false);
    }
  };

  const saveLegalPage = async () => {
    if (!legalDraft) return;
    setBusy(true);
    try {
      const res = await authedFetch(`/api/admin/legal/${legalDraft.slug}`, {
        method: 'PUT',
        body: JSON.stringify(legalDraft),
      });
      if (res.ok) {
        notify(true, `Updated legal page "/${legalDraft.slug}".`);
        await loadDashboard(auth?.user.role);
        onDataChanged();
      }
    } finally {
      setBusy(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authedFetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    if (!res.ok) {
      notify(false, data.error || 'Failed to add user.');
    } else {
      setUsers(data.users || []);
      setNewUser({ email: '', name: '', role: 'editor', password: '' });
      notify(true, 'Staff user created.');
    }
  };

  const updateUser = async (id: number, patch: Record<string, unknown>) => {
    const res = await authedFetch(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    const data = await res.json();
    if (!res.ok) notify(false, data.error || 'Could not update user.');
    else {
      setUsers(data.users || []);
      notify(true, 'User updated.');
    }
  };

  const changeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authedFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify(pwForm) });
    const data = await res.json();
    if (!res.ok) notify(false, data.error || 'Could not change password.');
    else {
      setPwForm({ currentPassword: '', newPassword: '' });
      notify(true, 'Password changed. Other sessions were signed out.');
    }
  };

  const removeUser = async (id: number) => {
    const res = await authedFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      notify(false, data.error || 'Unable to delete user.');
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      notify(true, 'User removed.');
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const res = await authedFetch('/api/admin/restore', {
          method: 'POST',
          body: JSON.stringify(parsed),
        });
        const data = await res.json();
        if (!res.ok) {
          notify(false, data.error || 'Restore failed.');
        } else {
          notify(true, 'Database snapshot restored cleanly.');
          await loadDashboard(auth?.user.role);
          onDataChanged();
        }
      } catch {
        notify(false, 'Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const inputCls =
    'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none';
  const labelCls = 'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1';

  if (checkingAuth) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-sm text-slate-500 dark:text-slate-400">
        Verifying session...
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 sm:p-8 shadow-lg space-y-5">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <h1 className="text-xl font-bold text-[#0B1F3A] dark:text-white">
              SkyFare Staff Console
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Sign in to manage flight deals, editorial travel guides, advertising settings, SEO meta tags, and backups.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className={labelCls}>
                Staff Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                autoComplete="username"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="admin-password" className={labelCls}>
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={inputCls}
              />
            </div>

            {loginError && (
              <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-orange-700 hover:bg-orange-800 disabled:opacity-60 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
            >
              {busy ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-3">
            Protected by scrypt password hashing, HTTP-only session cookies, and CSRF validation. Staff credentials are configured via server environment secrets.
          </p>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: 'guides', label: 'Posts & Guides', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: 'deals', label: 'Flight Deals', icon: <Plane className="h-3.5 w-3.5" /> },
    { id: 'categories-media', label: 'Categories & Media', icon: <ImageIcon className="h-3.5 w-3.5" /> },
    { id: 'menus-homepage', label: 'Menus & Homepage', icon: <Layout className="h-3.5 w-3.5" /> },
    { id: 'monetization', label: 'Monetization & Ads', icon: <DollarSign className="h-3.5 w-3.5" /> },
    { id: 'seo-legal', label: 'SEO & Legal Pages', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'users-backup', label: 'Users & Backups', icon: <Users className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Top Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            CMS &amp; Monetization Operations · Role: {auth.user.role}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white">
            SkyFare Admin Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="text-slate-600 dark:text-slate-300">
            Signed in as <strong>{auth.user.name}</strong> ({auth.user.email})
          </span>
          <button
            type="button"
            onClick={() => loadDashboard(auth.user.role)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            View Live Site
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 dark:bg-slate-800 px-3 py-1.5 font-semibold text-white hover:opacity-90 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {bannerMsg && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-xs font-medium ${
            bannerMsg.ok
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
              : 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200'
          }`}
        >
          {bannerMsg.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
              tab === t.id
                ? 'bg-[#0B1F3A] dark:bg-sky-700 text-white'
                : 'bg-white dark:bg-[#0F1D32] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-500/50'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {!dashboard ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading workspace data...</div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {(() => {
                const gs = dashboard.guides as (TravelGuide & { reviewStatus?: string })[];
                const published = gs.filter((g) => g.status === 'published');
                const unreviewed = published.filter((g) => g.reviewStatus !== 'reviewed');
                const avg = published.length ? Math.round(published.reduce((n, g) => n + g.wordCount, 0) / published.length) : 0;
                const expired = dashboard.deals.filter((d) => d.status !== 'draft' && new Date(d.expiresAt).getTime() < Date.now());
                const items: [string, string, boolean][] = [
                  ['Published guides', `${published.length} (aim for 10-15 or more)`, published.length >= 10],
                  ['Average length', `${avg} words (aim for 800+ on your best guides)`, avg >= 800],
                  ['Published without a recorded human review', `${unreviewed.length}: open each guide, check it, tick the checklist`, unreviewed.length === 0],
                  ['Fares past their listed window', `${expired.length}: remove or update them under Flight Deals`, expired.length === 0],
                  ['Publisher name and contact email set', dashboard.general.publisherName && dashboard.general.supportEmail ? 'Yes' : 'Missing: add under SEO & Legal', Boolean(dashboard.general.publisherName && dashboard.general.supportEmail)],
                  ['Search Console verification code', dashboard.general.gscVerificationCode ? 'Entered' : 'Not entered yet', Boolean(dashboard.general.gscVerificationCode)],
                ];
                return (
                  <section aria-label="Content health" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5">
                    <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">Content health (approval readiness)</h2>
                    <ul className="mt-3 space-y-1.5 text-xs">
                      {items.map(([label, detail, ok]) => (
                        <li key={label} className="flex items-start gap-2">
                          <span aria-hidden="true" className={ok ? 'text-emerald-600' : 'text-amber-600'}>{ok ? '✓' : '!'}</span>
                          <span className="text-slate-800 dark:text-slate-200"><strong>{label}:</strong> {detail}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })()}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  ['Flight Deals', dashboard.stats.totalDeals],
                  ['Published Guides', dashboard.stats.totalGuides],
                  ['Price Alerts', dashboard.stats.totalAlerts],
                  ['Subscribers', dashboard.stats.totalSubscribers],
                  ['Inbox Messages', dashboard.stats.totalMessages],
                  ['Pageviews', dashboard.stats.totalPageviews],
                ].map(([label, val]) => (
                  <div
                    key={String(label)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-4"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
                    <div className="mt-1 text-2xl font-bold font-mono-tabular text-[#0B1F3A] dark:text-white">
                      {val}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-3">
                  <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                    Top Visited Routes
                  </h2>
                  {dashboard.topRoutes.length === 0 ? (
                    <p className="text-xs text-slate-500">No route pageviews recorded yet.</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <tr>
                          <th className="py-2 text-left">Path</th>
                          <th className="py-2 text-right">Views</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {dashboard.topRoutes.map((r) => (
                          <tr key={r.path}>
                            <td className="py-2 font-mono-tabular">{r.path}</td>
                            <td className="py-2 text-right font-mono-tabular font-semibold">{r.views}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-3">
                  <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                    Recent Contact Messages ({dashboard.messages.length})
                  </h2>
                  {dashboard.messages.length === 0 ? (
                    <p className="text-xs text-slate-500">No contact inquiries submitted yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {dashboard.messages.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-xs space-y-1"
                        >
                          <div className="flex justify-between font-semibold text-[#0B1F3A] dark:text-white">
                            <span>{m.subject}</span>
                            <span className="font-mono-tabular text-sky-600">{m.id}</span>
                          </div>
                          <div className="text-slate-500">
                            {m.name} ({m.email})
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{m.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-3">
                  <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                    Recent Price Alerts ({dashboard.alerts.length})
                  </h2>
                  {dashboard.alerts.length === 0 ? (
                    <p className="text-xs text-slate-500">No price alerts registered yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                      {dashboard.alerts.map((a) => (
                        <div key={a.id} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                          <span>
                            <strong>{a.email}</strong> · {a.origin} → {a.destination}
                          </span>
                          <span className="font-mono-tabular font-semibold text-emerald-700 dark:text-emerald-400">
                            Max ${a.max_price}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-3">
                  <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                    Newsletter Subscribers ({dashboard.subscribers.length})
                  </h2>
                  {dashboard.subscribers.length === 0 ? (
                    <p className="text-xs text-slate-500">No newsletter signups yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                      {dashboard.subscribers.map((s) => (
                        <div key={s.email} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                          <span>{s.email}</span>
                          <span className="font-mono-tabular text-slate-400">{s.created_at.slice(0, 10)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POSTS & GUIDES CMS (editorial workflow) */}
          {tab === 'guides' && (
            <GuideEditor
              guides={dashboard.guides as AdminGuide[]}
              authors={dashboard.authors || []}
              categories={dashboard.categories}
              feedback={dashboard.feedback || []}
              role={auth.user.role}
              authedFetch={authedFetch}
              notify={notify}
              onSaved={async () => {
                await loadDashboard(auth.user.role);
                onDataChanged();
              }}
              inputCls={inputCls}
              labelCls={labelCls}
            />
          )}

          {/* TAB 3: FLIGHT DEALS */}
          {tab === 'deals' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <form
                onSubmit={saveDeal}
                className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 space-y-4"
              >
                <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                  {dealForm.id ? `Edit Deal (${dealForm.id})` : 'Create Flight Deal'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Origin Code</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={dealForm.originCode}
                      onChange={(e) => setDealForm({ ...dealForm, originCode: e.target.value.toUpperCase() })}
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Origin City</label>
                    <input
                      type="text"
                      required
                      value={dealForm.originCity}
                      onChange={(e) => setDealForm({ ...dealForm, originCity: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Dest Code</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={dealForm.destinationCode}
                      onChange={(e) =>
                        setDealForm({ ...dealForm, destinationCode: e.target.value.toUpperCase() })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Destination City</label>
                    <input
                      type="text"
                      required
                      value={dealForm.destinationCity}
                      onChange={(e) => setDealForm({ ...dealForm, destinationCity: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Airline Name</label>
                    <input
                      type="text"
                      required
                      value={dealForm.airlineName}
                      onChange={(e) => setDealForm({ ...dealForm, airlineName: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Airline Code</label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      value={dealForm.airlineCode}
                      onChange={(e) => setDealForm({ ...dealForm, airlineCode: e.target.value.toUpperCase() })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Region</label>
                    <select
                      value={dealForm.category}
                      onChange={(e) =>
                        setDealForm({ ...dealForm, category: e.target.value as 'domestic' | 'international' })
                      }
                      className={inputCls}
                    >
                      <option value="domestic">Domestic USA</option>
                      <option value="international">International</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Sale Price ($)</label>
                    <input
                      type="number"
                      required
                      value={dealForm.price}
                      onChange={(e) => setDealForm({ ...dealForm, price: Number(e.target.value) })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Original Price ($)</label>
                    <input
                      type="number"
                      required
                      value={dealForm.originalPrice}
                      onChange={(e) =>
                        setDealForm({ ...dealForm, originalPrice: Number(e.target.value) })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Stops</label>
                    <input
                      type="number"
                      min={0}
                      max={2}
                      value={dealForm.stops}
                      onChange={(e) => setDealForm({ ...dealForm, stops: Number(e.target.value) })}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Baggage Policy</label>
                  <input
                    type="text"
                    value={dealForm.baggagePolicy}
                    onChange={(e) => setDealForm({ ...dealForm, baggagePolicy: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Partner Affiliate URL</label>
                  <input
                    type="url"
                    required
                    value={dealForm.affiliateUrl}
                    onChange={(e) => setDealForm({ ...dealForm, affiliateUrl: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-700 hover:bg-orange-800 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>{busy ? 'Saving...' : 'Save Flight Deal'}</span>
                </button>
              </form>

              <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-3">
                <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                  Active Deals Inventory ({dashboard.deals.length})
                </h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {dashboard.deals.map((d) => (
                    <div
                      key={d.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[#0B1F3A] dark:text-white">
                          {d.originCode} → {d.destinationCode} ({d.destinationCity}) ·{' '}
                          <span className="font-mono-tabular text-emerald-700 dark:text-emerald-400">
                            ${d.price}
                          </span>
                        </div>
                        <div className="text-slate-500 truncate">
                          {d.airlineName} · {d.departureDate} to {d.returnDate}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setDealForm({
                              id: d.id,
                              airlineSlug: d.airlineSlug,
                              airlineName: d.airlineName,
                              airlineCode: d.airlineCode,
                              originCode: d.originCode,
                              originCity: d.originCity,
                              destinationCode: d.destinationCode,
                              destinationCity: d.destinationCity,
                              destinationSlug: d.destinationSlug,
                              country: d.country,
                              category: d.category,
                              price: d.price,
                              originalPrice: d.originalPrice,
                              departureDate: d.departureDate,
                              returnDate: d.returnDate,
                              durationLabel: d.durationLabel,
                              durationMinutes: d.durationMinutes,
                              stops: d.stops,
                              baggagePolicy: d.baggagePolicy,
                              affiliateUrl: d.affiliateUrl,
                              imageKey: d.imageKey,
                              status: d.status || 'published',
                            })
                          }
                          className="rounded border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDeal(d.id)}
                          aria-label={`Delete ${d.id}`}
                          className="rounded border border-red-200 dark:border-red-900/50 p-1 text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES & MEDIA */}
          {tab === 'categories-media' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-4">
                <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-sky-600" />
                  <span>Guide Categories ({dashboard.categories.length})</span>
                </h2>
                <form onSubmit={saveCategory} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="New Category Name"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Short SEO description"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className={inputCls}
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-orange-700 hover:bg-orange-800 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                  >
                    Add Category
                  </button>
                </form>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  {dashboard.categories.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs py-1">
                      <div>
                        <span className="font-semibold text-[#0B1F3A] dark:text-white">{c.name}</span>
                        <span className="ml-2 text-slate-400">/{c.slug}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteCategory(c.id)}
                        className="text-red-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                    Media Library ({dashboard.media.length})
                  </h2>
                  <div className="flex flex-wrap items-end gap-2">
                    <div>
                      <label htmlFor="upload-alt" className={labelCls}>Image description (alt text, required)</label>
                      <input id="upload-alt" value={uploadAlt} onChange={(e) => setUploadAlt(e.target.value)} className={inputCls} />
                    </div>
                  <label className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] dark:bg-sky-700 px-3.5 py-2 text-xs font-semibold text-white cursor-pointer hover:opacity-90">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload image (PNG/JPG/WebP, max 2 MB)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dashboard.media.map((m) => {
                    const src = m.url.startsWith('/uploads/')
                      ? m.url
                      : getImageSrc(m.url as ImageKey);
                    return (
                      <div
                        key={m.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
                      >
                        <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-900 overflow-hidden">
                          <img src={src} alt={m.alt_text} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-3 text-xs flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{m.filename}</div>
                            <div className="font-mono-tabular text-[11px] text-slate-500 truncate">
                              {m.url}
                            </div>
                          </div>
                          {m.url.startsWith('/uploads/') && (
                            <button
                              type="button"
                              onClick={() => deleteMedia(m.id)}
                              className="text-red-600 hover:underline shrink-0 cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MENUS & HOMEPAGE */}
          {tab === 'menus-homepage' && homepageForm && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                    Homepage Hero &amp; Section Visibility
                  </h2>
                  <div>
                    <label className={labelCls}>Hero Headline</label>
                    <input
                      type="text"
                      value={homepageForm.heroTitle}
                      onChange={(e) =>
                        setHomepageForm({ ...homepageForm, heroTitle: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Hero Subtitle</label>
                    <textarea
                      rows={3}
                      value={homepageForm.heroSubtitle}
                      onChange={(e) =>
                        setHomepageForm({ ...homepageForm, heroSubtitle: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    {(
                      [
                        ['showTopWeekly', 'Show Top Deals This Week'],
                        ['showDestinations', 'Show Destination Hub Grid'],
                        ['showHowItWorks', 'Show "How to read the fares" section'],
                        ['showNewsletter', 'Show Newsletter Signup Band'],
                        ['showFaqs', 'Show Frequently Asked Questions'],
                      ] as [keyof HomepageConfig, string][]
                    ).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2.5 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(homepageForm[key])}
                          onChange={(e) =>
                            setHomepageForm({ ...homepageForm, [key]: e.target.checked })
                          }
                          className="h-4 w-4 accent-sky-600"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                      Header Menu Items (Max 6 Single-Line)
                    </h2>
                    <button
                      type="button"
                      onClick={() =>
                        menusForm.length < 6 &&
                        setMenusForm([...menusForm, { label: 'Search', path: '/search' }])
                      }
                      className="text-xs text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      + Add Link
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {menusForm.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={m.label}
                          onChange={(e) => {
                            const next = [...menusForm];
                            next[idx] = { ...m, label: e.target.value };
                            setMenusForm(next);
                          }}
                          placeholder="Label"
                          className={inputCls}
                        />
                        <input
                          type="text"
                          value={m.path}
                          onChange={(e) => {
                            const next = [...menusForm];
                            next[idx] = { ...m, path: e.target.value };
                            setMenusForm(next);
                          }}
                          placeholder="/path"
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() => setMenusForm(menusForm.filter((_, i) => i !== idx))}
                          className="text-red-600 p-1.5 cursor-pointer"
                          aria-label="Remove menu item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={saveSettingsAndHomepage}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-700 hover:bg-orange-800 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Menus &amp; Homepage</span>
              </button>
            </div>
          )}

          {/* TAB 6: MONETIZATION & ADS */}
          {tab === 'monetization' && (
            <MonetizationPanel
              key={JSON.stringify(dashboard.adPlacements) + JSON.stringify(dashboard.monetization)}
              monetization={dashboard.monetization}
              placements={dashboard.adPlacements}
              role={auth.user.role}
              gscConfigured={Boolean(dashboard.general.gscVerificationCode)}
              authedFetch={authedFetch}
              notify={notify}
              onSaved={async () => {
                await loadDashboard(auth.user.role);
                onDataChanged();
              }}
              inputCls={inputCls}
              labelCls={labelCls}
            />
          )}

          {/* TAB 7: SEO & LEGAL PAGES */}
          {tab === 'seo-legal' && generalForm && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-4">
                <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                  Site Identity, GSC &amp; GA4 Tracking
                </h2>
                <div>
                  <label className={labelCls}>Site Name</label>
                  <input
                    type="text"
                    value={generalForm.siteName}
                    onChange={(e) => setGeneralForm({ ...generalForm, siteName: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="gen-publisher" className={labelCls}>Publisher / operator name (shown in About, Privacy and footer)</label>
                  <input
                    id="gen-publisher"
                    type="text"
                    placeholder="Your real name or registered business name"
                    value={generalForm.publisherName || ''}
                    onChange={(e) => setGeneralForm({ ...generalForm, publisherName: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="gen-email" className={labelCls}>Public contact email (must be a mailbox you read)</label>
                  <input
                    id="gen-email"
                    type="email"
                    value={generalForm.supportEmail}
                    onChange={(e) => setGeneralForm({ ...generalForm, supportEmail: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="gen-address" className={labelCls}>Postal address (optional; shown only if you fill it in)</label>
                  <input
                    id="gen-address"
                    type="text"
                    value={generalForm.companyAddress}
                    onChange={(e) => setGeneralForm({ ...generalForm, companyAddress: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <label className="flex items-start gap-2.5 text-xs cursor-pointer rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <input
                    type="checkbox"
                    checked={Boolean(generalForm.emailAlertsEnabled)}
                    onChange={(e) => setGeneralForm({ ...generalForm, emailAlertsEnabled: e.target.checked })}
                    className="mt-0.5 h-4 w-4 accent-sky-600"
                  />
                  <span>
                    <strong>Enable email sign-ups (newsletter and price alerts).</strong> Turn on only once you have a
                    way to actually send those emails. While off, the forms are hidden and the server refuses sign-ups.
                  </span>
                </label>
                <div>
                  <label className={labelCls}>Default SEO Title</label>
                  <input
                    type="text"
                    value={generalForm.defaultTitle}
                    onChange={(e) => setGeneralForm({ ...generalForm, defaultTitle: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Default Meta Description</label>
                  <textarea
                    rows={2}
                    value={generalForm.defaultDescription}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, defaultDescription: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Google Search Console Verification Code</label>
                  <input
                    type="text"
                    placeholder="google-site-verification token"
                    value={generalForm.gscVerificationCode}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, gscVerificationCode: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Google Analytics 4 (GA4) Measurement ID</label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={generalForm.ga4MeasurementId}
                    onChange={(e) =>
                      setGeneralForm({ ...generalForm, ga4MeasurementId: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={saveSettingsAndHomepage}
                  className="rounded-xl bg-orange-700 hover:bg-orange-800 px-5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Save SEO &amp; Analytics Settings
                </button>
              </div>

              <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                    Legal &amp; Compliance Pages Editor
                  </h2>
                  <select
                    value={selectedLegalSlug}
                    onChange={(e) => {
                      const nextSlug = e.target.value;
                      setSelectedLegalSlug(nextSlug);
                      const found = dashboard.legalPages.find((p) => p.slug === nextSlug) || null;
                      setLegalDraft(found);
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-3 py-1.5 text-xs"
                  >
                    {dashboard.legalPages.map((lp) => (
                      <option key={lp.slug} value={lp.slug}>
                        /{lp.slug} — {lp.title}
                      </option>
                    ))}
                  </select>
                </div>

                {legalDraft && (
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Page Title</label>
                      <input
                        type="text"
                        value={legalDraft.title}
                        onChange={(e) => setLegalDraft({ ...legalDraft, title: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Page Body (Blank lines create paragraphs)</label>
                      <textarea
                        rows={10}
                        value={legalDraft.content_markdown}
                        onChange={(e) =>
                          setLegalDraft({ ...legalDraft, content_markdown: e.target.value })
                        }
                        className={inputCls}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={saveLegalPage}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0B1F3A] dark:bg-sky-700 px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Update /{legalDraft.slug}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: USERS & BACKUPS */}
          {tab === 'users-backup' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-4">
                <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
                  Staff Accounts &amp; Roles
                </h2>

                {auth.user.role !== 'admin' ? (
                  <p className="text-xs text-slate-500">
                    Only users with the <strong>admin</strong> role can manage staff accounts and backups.
                  </p>
                ) : (
                  <>
                    <form onSubmit={createUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className={inputCls}
                      />
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className={inputCls}
                      />
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className={inputCls}
                      >
                        <option value="editor">Editor</option>
                        <option value="analyst">Analyst</option>
                        <option value="admin">Admin</option>
                      </select>
                      <input
                        type="password"
                        required
                        minLength={12}
                        autoComplete="new-password"
                        placeholder="Password (12+ chars)"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className={inputCls}
                      />
                      <button
                        type="submit"
                        className="sm:col-span-2 rounded-lg bg-orange-700 hover:bg-orange-800 py-2 text-xs font-semibold text-white cursor-pointer"
                      >
                        Create Staff User
                      </button>
                    </form>

                    <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      {users.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800"
                        >
                          <div>
                            <span className="font-semibold text-[#0B1F3A] dark:text-white">{u.name}</span>
                            <span className="ml-2 text-slate-500">{u.email}</span>
                            <span className="ml-2 uppercase font-mono-tabular text-sky-700 dark:text-sky-400">
                              {u.role}
                            </span>
                          </div>
                          {u.id !== auth.user.id && (
                            <div className="flex items-center gap-2">
                              <select
                                aria-label={`Role for ${u.email}`}
                                value={u.role}
                                onChange={(e) => updateUser(u.id, { role: e.target.value })}
                                className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-1.5 py-1 text-[11px]"
                              >
                                <option value="admin">admin</option>
                                <option value="editor">editor</option>
                                <option value="analyst">analyst</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => updateUser(u.id, { active: !u.active })}
                                className="text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
                              >
                                {u.active ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeUser(u.id)}
                                className="text-red-700 hover:underline cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="lg:col-span-5 space-y-6">
              <form onSubmit={changeOwnPassword} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-3">
                <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">Change my password</h2>
                <div>
                  <label htmlFor="pw-cur" className={labelCls}>Current password</label>
                  <input id="pw-cur" type="password" required autoComplete="current-password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="pw-new" className={labelCls}>New password (12+ characters)</label>
                  <input id="pw-new" type="password" required minLength={12} autoComplete="new-password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} className={inputCls} />
                </div>
                <button type="submit" className="rounded-lg bg-[#0B1F3A] dark:bg-sky-700 px-4 py-2 text-xs font-semibold text-white">Change password</button>
              </form>

              <AuthorsPanel
                authors={dashboard.authors || []}
                isAdmin={auth.user.role === 'admin'}
                authedFetch={authedFetch}
                notify={notify}
                onSaved={async () => {
                  await loadDashboard(auth.user.role);
                  onDataChanged();
                }}
                inputCls={inputCls}
                labelCls={labelCls}
              />

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-4">
                <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-sky-600" />
                  <span>Database Backup &amp; Restore</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Download a complete JSON snapshot of all SQLite tables (deals, guides, categories, ad placements, legal pages, subscribers, and settings) or restore an existing backup file.
                </p>

                {auth.user.role === 'admin' && (
                  <div className="space-y-3">
                    <a
                      href="/api/admin/backup"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] dark:bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Download JSON Database Backup
                    </a>

                    <label className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Restore from Backup JSON</span>
                      <input
                        type="file"
                        accept="application/json"
                        onChange={handleRestoreFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
