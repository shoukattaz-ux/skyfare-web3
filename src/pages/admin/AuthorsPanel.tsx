import React, { useState } from 'react';

interface AuthorRow { id: number; name: string; role: string; bio: string; active: number }

interface Props {
  authors: AuthorRow[];
  isAdmin: boolean;
  authedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  notify: (ok: boolean, text: string) => void;
  onSaved: () => Promise<void> | void;
  inputCls: string;
  labelCls: string;
}

/** Bylines. Add only real people who have agreed to be named; nothing is pre-filled. */
export const AuthorsPanel: React.FC<Props> = ({ authors, isAdmin, authedFetch, notify, onSaved, inputCls, labelCls }) => {
  const [form, setForm] = useState({ name: '', role: '', bio: '' });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authedFetch('/api/admin/authors', { method: 'POST', body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return notify(false, data.error || 'Could not save author.');
    setForm({ name: '', role: '', bio: '' });
    notify(true, 'Author saved. Assign them to a guide in the guide editor.');
    await onSaved();
  };
  const remove = async (a: AuthorRow) => {
    if (!window.confirm(`Remove ${a.name}? Existing guides keep the name printed on them.`)) return;
    const res = await authedFetch(`/api/admin/authors/${a.id}`, { method: 'DELETE' });
    if (res.ok) {
      notify(true, 'Author removed.');
      await onSaved();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-5 space-y-4">
      <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">Authors (bylines)</h2>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Add real people only, with their consent, and only describe qualifications they actually have. Until you add an
        author, guides carry the neutral byline "SkyFare Editorial Team".
      </p>
      {isAdmin ? (
        <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="a-name" className={labelCls}>Name</label>
            <input id="a-name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="a-role" className={labelCls}>Role (optional)</label>
            <input id="a-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="a-bio" className={labelCls}>Short bio (optional, factual)</label>
            <textarea id="a-bio" rows={2} maxLength={600} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={inputCls} />
          </div>
          <button type="submit" className="sm:col-span-2 rounded-lg bg-orange-700 hover:bg-orange-800 py-2 text-xs font-semibold text-white">Save author</button>
        </form>
      ) : (
        <p className="text-xs text-slate-500">Only administrators can manage authors.</p>
      )}
      <ul className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
        {authors.length === 0 && <li className="py-2 text-slate-500">No authors added yet.</li>}
        {authors.map((a) => (
          <li key={a.id} className="py-2 flex items-center justify-between gap-3">
            <span><strong className="text-[#0B1F3A] dark:text-white">{a.name}</strong>{a.role ? `, ${a.role}` : ''}</span>
            {isAdmin && <button type="button" onClick={() => remove(a)} className="text-red-700 hover:underline">Remove</button>}
          </li>
        ))}
      </ul>
    </div>
  );
};
