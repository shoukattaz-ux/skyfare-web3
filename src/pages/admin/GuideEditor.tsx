import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { CategoryRecord, GuideSection, ImageKey, TravelGuide } from '../../types/flight';

export interface AdminGuide extends TravelGuide {
  reviewStatus?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  publishAt?: string;
  checklist?: Record<string, boolean>;
}

interface AuthorRow {
  id: number;
  name: string;
  role: string;
  bio: string;
  active: number;
}

interface Props {
  guides: AdminGuide[];
  authors: AuthorRow[];
  categories: CategoryRecord[];
  feedback: { slug: string; helpful: number; not_helpful: number }[];
  role: 'admin' | 'editor' | 'analyst';
  authedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  notify: (ok: boolean, text: string) => void;
  onSaved: () => Promise<void> | void;
  inputCls: string;
  labelCls: string;
}

const IMAGE_KEYS: ImageKey[] = ['hero', 'nyc', 'cancun', 'tokyo', 'paris', 'terminal'];
const REVIEW_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending review',
  needs_revision: 'Needs revision',
  reviewed: 'Reviewed',
};
const CHECKLIST: [string, string][] = [
  ['accuracy', 'Facts and figures were checked against a primary source (airline, DOT, TSA…)'],
  ['originality', 'The text is original and not copied from another site'],
  ['readability', 'Clear, natural writing; grammar and spelling checked'],
  ['usefulness', 'Genuinely useful, complete and on topic'],
  ['formatting', 'Headings, lists and tables are properly formatted'],
  ['sources', 'Anything that changes quickly is dated or tells readers where to check'],
  ['images', 'Images are relevant and we have the right to use them'],
  ['noRepetition', 'No padding, repeated sections or keyword stuffing'],
  ['notMisleading', 'Nothing is misleading; commercial links are disclosed'],
];

interface SectionDraft {
  heading: string;
  paragraphs: string;
  bullets: string;
  table?: GuideSection['table'];
}

interface FormState {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  tags: string;
  author: string;
  imageKey: ImageKey;
  customImageUrl: string;
  imageAlt: string;
  excerpt: string;
  sections: SectionDraft[];
  faqs: { question: string; answer: string }[];
  status: 'published' | 'draft';
  reviewStatus: string;
  checklist: Record<string, boolean>;
  publishAt: string;
  revisionNote: string;
  publishedAt: string;
}

const blank = (category = 'Booking Strategy'): FormState => ({
  slug: '',
  title: '',
  metaTitle: '',
  metaDescription: '',
  category,
  tags: '',
  author: '',
  imageKey: 'terminal',
  customImageUrl: '',
  imageAlt: '',
  excerpt: '',
  sections: [{ heading: '', paragraphs: '', bullets: '' }],
  faqs: [],
  status: 'draft',
  reviewStatus: 'draft',
  checklist: {},
  publishAt: '',
  revisionNote: '',
  publishedAt: '',
});

const toLocalInput = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const GuideEditor: React.FC<Props> = ({
  guides, authors, categories, feedback, role, authedFetch, notify, onSaved, inputCls, labelCls,
}) => {
  const readOnly = role === 'analyst';
  const [form, setForm] = useState<FormState>(blank(categories[0]?.name));
  const [saving, setSaving] = useState(false);
  const [revisions, setRevisions] = useState<{ id: number; saved_by: string; note: string; saved_at: string }[]>([]);
  const [filter, setFilter] = useState<'all' | 'needs-review' | 'scheduled'>('all');

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const wordCount = useMemo(
    () =>
      form.sections
        .map((s) => `${s.heading} ${s.paragraphs} ${s.bullets}`)
        .join(' ')
        .split(/\s+/)
        .filter(Boolean).length,
    [form.sections]
  );
  const allChecked = CHECKLIST.every(([k]) => form.checklist[k]);

  const loadRevisions = useCallback(
    async (slug: string) => {
      if (!slug) return setRevisions([]);
      const res = await authedFetch(`/api/admin/guides/${slug}/revisions`);
      if (res.ok) setRevisions((await res.json()).revisions || []);
    },
    [authedFetch]
  );

  const edit = (g: AdminGuide) => {
    setForm({
      slug: g.slug,
      title: g.title,
      metaTitle: g.metaTitle,
      metaDescription: g.metaDescription,
      category: g.category,
      tags: g.tags || '',
      author: authors.some((a) => a.name === g.author) ? g.author : '',
      imageKey: g.imageKey,
      customImageUrl: g.customImageUrl || '',
      imageAlt: g.imageAlt || '',
      excerpt: g.excerpt,
      sections: g.sections.map((s) => ({
        heading: s.heading,
        paragraphs: s.paragraphs.join('\n\n'),
        bullets: (s.bullets || []).join('\n'),
        table: s.table,
      })),
      faqs: g.faqs || [],
      status: g.status === 'published' ? 'published' : 'draft',
      reviewStatus: g.reviewStatus || 'pending_review',
      checklist: g.checklist || {},
      publishAt: toLocalInput(g.publishAt),
      revisionNote: '',
      publishedAt: g.publishedAt,
    });
    loadRevisions(g.slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setRevisions([]);
  }, [guides.length]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authedFetch('/api/admin/guides', {
        method: 'POST',
        body: JSON.stringify({
          slug: form.slug || undefined,
          title: form.title,
          metaTitle: form.metaTitle || form.title,
          metaDescription: form.metaDescription || form.excerpt,
          category: form.category,
          tags: form.tags,
          author: form.author,
          imageKey: form.imageKey,
          customImageUrl: form.customImageUrl || undefined,
          imageAlt: form.imageAlt || undefined,
          excerpt: form.excerpt,
          status: form.status,
          reviewStatus: form.reviewStatus,
          checklist: form.checklist,
          publishAt: form.publishAt ? new Date(form.publishAt).toISOString() : '',
          revisionNote: form.revisionNote,
          publishedAt: form.publishedAt || undefined,
          faqs: form.faqs,
          sections: form.sections.map((s) => ({
            heading: s.heading,
            paragraphs: s.paragraphs.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
            bullets: s.bullets.split('\n').map((b) => b.trim()).filter(Boolean),
            table: s.table,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(false, data.error || 'Could not save.');
        return;
      }
      notify(true, `Saved "${data.guide.title}" (${data.guide.status}, ${REVIEW_LABELS[data.guide.reviewStatus] || data.guide.reviewStatus}).`);
      setForm((f) => ({ ...f, slug: data.guide.slug, revisionNote: '' }));
      await onSaved();
      loadRevisions(data.guide.slug);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (g: AdminGuide) => {
    if (!window.confirm(`Delete "${g.title}"? A final copy is kept in the revision log.`)) return;
    const res = await authedFetch(`/api/admin/guides/${g.slug}`, { method: 'DELETE' });
    if (res.ok) {
      notify(true, `Deleted "${g.slug}".`);
      if (form.slug === g.slug) setForm(blank(categories[0]?.name));
      await onSaved();
    } else notify(false, 'Delete failed.');
  };

  const restore = async (id: number) => {
    if (!window.confirm('Restore this earlier revision? The current text is saved as a revision first, and the guide goes back to "Pending review".')) return;
    const res = await authedFetch(`/api/admin/guides/${form.slug}/revisions/${id}/restore`, { method: 'POST' });
    if (res.ok) {
      notify(true, 'Revision restored; review it again before publishing.');
      await onSaved();
    } else notify(false, 'Restore failed.');
  };

  const fbFor = (slug: string) => feedback.find((f) => f.slug === slug);
  const now = Date.now();
  const shown = guides.filter((g) =>
    filter === 'needs-review'
      ? g.reviewStatus !== 'reviewed'
      : filter === 'scheduled'
      ? !!g.publishAt && new Date(g.publishAt).getTime() > now
      : true
  );
  const small = 'rounded border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-medium hover:bg-slate-100 dark:hover:bg-slate-800';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <form onSubmit={save} className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">
            {form.slug ? `Edit guide (${form.slug})` : 'New guide'}
          </h2>
          <button type="button" onClick={() => { setForm(blank(categories[0]?.name)); setRevisions([]); }} className="text-xs text-sky-700 dark:text-sky-400 hover:underline">
            + New blank guide
          </button>
        </div>

        <fieldset disabled={readOnly} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="g-title" className={labelCls}>Title</label>
              <input id="g-title" required minLength={4} value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="g-slug" className={labelCls}>URL slug (auto from title if blank; fixed once saved)</label>
              <input id="g-slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="g-cat" className={labelCls}>Category</label>
              <select id="g-cat" value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                {categories.map((c) => <option key={c.id}>{c.name}</option>)}
                {!categories.some((c) => c.name === form.category) && <option>{form.category}</option>}
              </select>
            </div>
            <div>
              <label htmlFor="g-author" className={labelCls}>Author (real people only, added under Authors)</label>
              <select id="g-author" value={form.author} onChange={(e) => set('author', e.target.value)} className={inputCls}>
                <option value="">SkyFare Editorial Team</option>
                {authors.filter((a) => a.active).map((a) => <option key={a.id} value={a.name}>{a.name}{a.role ? `, ${a.role}` : ''}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="g-tags" className={labelCls}>Topics (comma separated)</label>
              <input id="g-tags" value={form.tags} onChange={(e) => set('tags', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label htmlFor="g-excerpt" className={labelCls}>Excerpt / summary (shown on cards)</label>
            <textarea id="g-excerpt" rows={2} maxLength={300} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} className={inputCls} />
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[#0B1F3A] dark:text-white">Search preview</h3>
            <div className="rounded-lg bg-slate-50 dark:bg-[#0B1526] p-3">
              <div className="text-sm text-sky-700 dark:text-sky-400 truncate">{form.metaTitle || form.title || 'Page title'}</div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 truncate">/guides/{form.slug || 'your-slug'}</div>
              <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{form.metaDescription || form.excerpt || 'Meta description appears here.'}</div>
            </div>
            <div>
              <label htmlFor="g-mt" className={labelCls}>Meta title ({(form.metaTitle || form.title).length}/60)</label>
              <input id="g-mt" maxLength={70} value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="g-md" className={labelCls}>Meta description ({(form.metaDescription || form.excerpt).length}/155)</label>
              <textarea id="g-md" rows={2} maxLength={165} value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="g-img" className={labelCls}>Featured image</label>
              <select id="g-img" value={form.imageKey} onChange={(e) => set('imageKey', e.target.value as ImageKey)} className={inputCls}>
                {IMAGE_KEYS.map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="g-custom" className={labelCls}>Or uploaded image URL (/uploads/…)</label>
              <input id="g-custom" value={form.customImageUrl} onChange={(e) => set('customImageUrl', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label htmlFor="g-alt" className={labelCls}>Image description (alt text)</label>
              <input id="g-alt" value={form.imageAlt} onChange={(e) => set('imageAlt', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0B1F3A] dark:text-white">Body, {wordCount} words</h3>
              <button type="button" onClick={() => set('sections', [...form.sections, { heading: '', paragraphs: '', bullets: '' }])} className="text-xs text-sky-700 dark:text-sky-400 hover:underline">
                + Add section
              </button>
            </div>
            {form.sections.map((s, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label htmlFor={`s-h-${i}`} className={labelCls}>Section {i + 1} heading</label>
                    <input id={`s-h-${i}`} value={s.heading} onChange={(e) => set('sections', form.sections.map((x, j) => j === i ? { ...x, heading: e.target.value } : x))} className={inputCls} />
                  </div>
                  <button type="button" disabled={i === 0} onClick={() => { const a = [...form.sections]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; set('sections', a); }} className={small} aria-label={`Move section ${i + 1} up`}>↑</button>
                  <button type="button" disabled={i === form.sections.length - 1} onClick={() => { const a = [...form.sections]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; set('sections', a); }} className={small} aria-label={`Move section ${i + 1} down`}>↓</button>
                  <button type="button" disabled={form.sections.length === 1} onClick={() => set('sections', form.sections.filter((_, j) => j !== i))} className="rounded border border-red-200 dark:border-red-900/50 p-1.5 text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40" aria-label={`Remove section ${i + 1}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <label htmlFor={`s-p-${i}`} className={labelCls}>Paragraphs (blank line between paragraphs)</label>
                  <textarea id={`s-p-${i}`} rows={6} value={s.paragraphs} onChange={(e) => set('sections', form.sections.map((x, j) => j === i ? { ...x, paragraphs: e.target.value } : x))} className={inputCls} />
                </div>
                <div>
                  <label htmlFor={`s-b-${i}`} className={labelCls}>Bullet points (one per line, optional)</label>
                  <textarea id={`s-b-${i}`} rows={3} value={s.bullets} onChange={(e) => set('sections', form.sections.map((x, j) => j === i ? { ...x, bullets: e.target.value } : x))} className={inputCls} />
                </div>
                {s.table && <p className="text-[11px] text-slate-500">This section has a {s.table.rows.length}-row table. It is kept as it is when you save.</p>}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0B1F3A] dark:text-white">FAQs (optional)</h3>
              <button type="button" onClick={() => set('faqs', [...form.faqs, { question: '', answer: '' }])} className="text-xs text-sky-700 dark:text-sky-400 hover:underline">+ Add FAQ</button>
            </div>
            {form.faqs.map((f, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <input aria-label={`FAQ ${i + 1} question`} placeholder="Question" value={f.question} onChange={(e) => set('faqs', form.faqs.map((x, j) => j === i ? { ...x, question: e.target.value } : x))} className={inputCls} />
                <textarea aria-label={`FAQ ${i + 1} answer`} placeholder="Answer" rows={2} value={f.answer} onChange={(e) => set('faqs', form.faqs.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))} className={inputCls} />
                <button type="button" onClick={() => set('faqs', form.faqs.filter((_, j) => j !== i))} className="justify-self-start text-xs text-red-700 hover:underline">Remove</button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-[#0B1F3A] dark:text-white">Editorial review</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Only mark a guide <strong>Reviewed</strong> after a person has actually checked it. Reviewed guides show a
              "reviewed by a person on &lt;date&gt;" note to readers. A guide cannot be published until it is Reviewed.
            </p>
            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Quality checklist</legend>
              {CHECKLIST.map(([k, label]) => (
                <label key={k} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={!!form.checklist[k]} onChange={(e) => set('checklist', { ...form.checklist, [k]: e.target.checked })} className="mt-0.5 h-4 w-4 accent-sky-600" />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="g-rs" className={labelCls}>Review status</label>
                <select id="g-rs" value={form.reviewStatus} onChange={(e) => set('reviewStatus', e.target.value)} className={inputCls}>
                  {Object.entries(REVIEW_LABELS).map(([v, l]) => (
                    <option key={v} value={v} disabled={v === 'reviewed' && !allChecked}>{l}{v === 'reviewed' && !allChecked ? ' (tick the whole checklist first)' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="g-st" className={labelCls}>Visibility</label>
                <select id="g-st" value={form.status} onChange={(e) => set('status', e.target.value as 'published' | 'draft')} className={inputCls}>
                  <option value="draft">Draft (not public)</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label htmlFor="g-sch" className={labelCls}>Publish at (optional schedule)</label>
                <input id="g-sch" type="datetime-local" value={form.publishAt} onChange={(e) => set('publishAt', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label htmlFor="g-note" className={labelCls}>What changed? (saved with the revision)</label>
              <input id="g-note" value={form.revisionNote} onChange={(e) => set('revisionNote', e.target.value)} className={inputCls} />
            </div>
          </div>
        </fieldset>

        {readOnly ? (
          <p className="text-xs text-slate-500">Your role is read-only.</p>
        ) : (
          <button type="submit" disabled={saving} className="rounded-xl bg-orange-700 hover:bg-orange-800 disabled:opacity-60 px-6 py-2.5 text-sm font-semibold text-white">
            {saving ? 'Saving…' : 'Save guide'}
          </button>
        )}

        {revisions.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-[#0B1F3A] dark:text-white">Revision history</h3>
            <ul className="mt-2 space-y-1.5 text-xs">
              {revisions.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3">
                  <span className="text-slate-600 dark:text-slate-300">{r.saved_at.slice(0, 16).replace('T', ' ')} · {r.saved_by}{r.note ? ` · ${r.note}` : ''}</span>
                  {!readOnly && <button type="button" onClick={() => restore(r.id)} className={small}>Restore</button>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>

      <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">All guides ({guides.length})</h2>
          <select aria-label="Filter guides" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081222] px-2 py-1 text-xs">
            <option value="all">All</option>
            <option value="needs-review">Not yet reviewed</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {shown.map((g) => {
            const fb = fbFor(g.slug);
            const scheduled = g.publishAt && new Date(g.publishAt).getTime() > now;
            return (
              <li key={g.slug} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[#0B1F3A] dark:text-white truncate">{g.title}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
                    <span className={`rounded px-1.5 py-0.5 ${g.status === 'published' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>{scheduled ? `Scheduled ${g.publishAt?.slice(0, 10)}` : g.status === 'published' ? 'Published' : 'Draft'}</span>
                    <span className={`rounded px-1.5 py-0.5 ${g.reviewStatus === 'reviewed' ? 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200' : 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'}`}>{REVIEW_LABELS[g.reviewStatus || 'pending_review']}</span>
                    <span className="text-slate-500">{g.wordCount} words · updated {g.updatedAt}</span>
                    {fb && <span className="text-slate-500">👍 {fb.helpful} · 👎 {fb.not_helpful}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" onClick={() => edit(g)} className={small}>{readOnly ? 'View' : 'Edit'}</button>
                  {g.status === 'published' && !scheduled && <a href={`/guides/${g.slug}`} target="_blank" rel="noopener noreferrer" className={small}>Open</a>}
                  {!readOnly && (
                    <button type="button" onClick={() => remove(g)} aria-label={`Delete ${g.title}`} className="rounded border border-red-200 dark:border-red-900/50 p-1 text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
