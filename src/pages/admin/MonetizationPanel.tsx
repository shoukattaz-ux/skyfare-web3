import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { AdPlacementConfig, MonetizationSettings } from '../../types/flight';

interface Props {
  monetization: MonetizationSettings;
  placements: AdPlacementConfig[];
  role: 'admin' | 'editor' | 'analyst';
  gscConfigured: boolean;
  authedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  notify: (ok: boolean, text: string) => void;
  onSaved: () => Promise<void> | void;
  inputCls: string;
  labelCls: string;
}

export const MonetizationPanel: React.FC<Props> = ({
  monetization, placements, role, gscConfigured, authedFetch, notify, onSaved, inputCls, labelCls,
}) => {
  const [mon, setMon] = useState<MonetizationSettings>({ ...monetization, adsEnabled: Boolean(monetization.adsEnabled) });
  const [slots, setSlots] = useState<AdPlacementConfig[]>(placements);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const readOnly = role !== 'admin';

  const save = async () => {
    setSaving(true);
    setErrors([]);
    try {
      const res = await authedFetch('/api/admin/ads', {
        method: 'PUT',
        body: JSON.stringify({ monetization: mon, placements: slots }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors || [data.error || 'Could not save.']);
        notify(false, 'Some values were rejected; see the list below.');
        return;
      }
      notify(true, 'Advertising settings saved. /ads.txt and the page head update immediately.');
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  const adsenseOk = /^(ca-)?pub-\d{10,20}$/.test(mon.adsensePublisherId || '');
  const mnetOk = /^[A-Za-z0-9]{4,30}$/.test(mon.medianetCustomerId || '');
  const activeSlots = slots.filter((s) => s.enabled && s.ad_unit_code);

  const Check: React.FC<{ ok: boolean; children: React.ReactNode }> = ({ ok, children }) => (
    <li className="flex items-start gap-2">
      <span aria-hidden="true" className={ok ? 'text-emerald-600' : 'text-slate-400'}>{ok ? '✓' : '○'}</span>
      <span className={ok ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}>{children}</span>
    </li>
  );

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D32] p-6 space-y-6">
      <div>
        <h2 className="text-base font-bold text-[#0B1F3A] dark:text-white">Advertising (Google AdSense &amp; Media.net)</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Nothing is shown and no ad script is loaded until <strong>all</strong> of the following are true: the master switch
          is on, a slot is active with an ad unit, the network ID is set, the visitor accepted advertising cookies, and the
          page is an article page (the guides index and individual guides; never the home page, fare lists, destination or
          airline pages, search, contact, legal, admin or 404 pages). Saving settings does not mean either network has approved your site.
        </p>
      </div>

      <fieldset disabled={readOnly} className="space-y-6">
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <input type="checkbox" checked={Boolean(mon.adsEnabled)} onChange={(e) => setMon({ ...mon, adsEnabled: e.target.checked })} className="mt-0.5 h-5 w-5 accent-sky-600" />
          <span>
            <span className="block text-sm font-semibold text-[#0B1F3A] dark:text-white">Master switch: show ads</span>
            <span className="block text-xs text-slate-600 dark:text-slate-400">
              Turn this on only after the network has approved the site and given you the IDs and ad units. Leave it off while applying.
            </span>
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="m-ads" className={labelCls}>AdSense publisher ID</label>
            <input id="m-ads" placeholder="pub-1234567890123456" value={mon.adsensePublisherId} onChange={(e) => setMon({ ...mon, adsensePublisherId: e.target.value })} className={`${inputCls} font-mono-tabular`} />
            <p className="mt-1 text-[11px] text-slate-500">Also adds the <code>google-adsense-account</code> meta tag (the official ownership check). It loads no ads.</p>
          </div>
          <div>
            <label htmlFor="m-mn" className={labelCls}>Media.net customer ID (cid)</label>
            <input id="m-mn" value={mon.medianetCustomerId} onChange={(e) => setMon({ ...mon, medianetCustomerId: e.target.value })} className={`${inputCls} font-mono-tabular`} />
          </div>
          <div>
            <label htmlFor="m-mns" className={labelCls}>Media.net site ID (optional)</label>
            <input id="m-mns" value={mon.medianetSiteId} onChange={(e) => setMon({ ...mon, medianetSiteId: e.target.value })} className={`${inputCls} font-mono-tabular`} />
          </div>
        </div>

        <div>
          <label htmlFor="m-extra" className={labelCls}>
            Extra <a href="/ads.txt" target="_blank" rel="noopener noreferrer" className="text-sky-700 dark:text-sky-400 underline">/ads.txt</a> lines (one per line, only sellers you have a contract with)
          </label>
          <textarea id="m-extra" rows={3} value={mon.adsTxtExtra || ''} onChange={(e) => setMon({ ...mon, adsTxtExtra: e.target.value })} className={`${inputCls} font-mono-tabular`} />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#0B1F3A] dark:text-white">Placements (fixed heights so the page never jumps)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slots.map((p, idx) => (
              <div key={p.slot_id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-[#0B1F3A] dark:text-white">{p.name}</div>
                    <div className="font-mono-tabular text-[11px] text-slate-500">{p.slot_id} · {p.ad_size || 'auto'} · min {p.min_height}px</div>
                  </div>
                  <label className="inline-flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={Boolean(p.enabled)} onChange={(e) => setSlots(slots.map((s, i) => i === idx ? { ...s, enabled: e.target.checked ? 1 : 0 } : s))} className="h-4 w-4 accent-sky-600" />
                    <span>Active</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor={`n-${idx}`} className={labelCls}>Network</label>
                    <select id={`n-${idx}`} value={p.network} onChange={(e) => setSlots(slots.map((s, i) => i === idx ? { ...s, network: e.target.value } : s))} className={inputCls}>
                      <option value="AdSense">Google AdSense</option>
                      <option value="Media.net">Media.net</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`u-${idx}`} className={labelCls}>{p.network === 'Media.net' ? 'Media.net crid' : 'AdSense slot ID'}</label>
                    <input id={`u-${idx}`} value={p.ad_unit_code} onChange={(e) => setSlots(slots.map((s, i) => i === idx ? { ...s, ad_unit_code: e.target.value } : s))} className={`${inputCls} font-mono-tabular`} />
                  </div>
                </div>
                {p.network === 'Media.net' && (
                  <div>
                    <label htmlFor={`z-${idx}`} className={labelCls}>Media.net size (e.g. 300x250)</label>
                    <input id={`z-${idx}`} value={p.ad_size || ''} onChange={(e) => setSlots(slots.map((s, i) => i === idx ? { ...s, ad_size: e.target.value } : s))} className={`${inputCls} font-mono-tabular`} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Media.net tags are issued per account after approval. Compare the loader this site uses with the code in your Media.net dashboard before enabling it.
          </p>
        </div>
      </fieldset>

      <div className="rounded-xl bg-slate-50 dark:bg-[#0B1526] p-4">
        <h3 className="text-sm font-semibold text-[#0B1F3A] dark:text-white">Readiness at a glance</h3>
        <ul className="mt-2 space-y-1.5 text-xs">
          <Check ok={adsenseOk}>AdSense publisher ID entered and valid</Check>
          <Check ok={mnetOk}>Media.net customer ID entered</Check>
          <Check ok={gscConfigured}>Google Search Console verification code entered (SEO &amp; Legal tab)</Check>
          <Check ok={activeSlots.length > 0}>At least one placement is active and has an ad unit</Check>
          <Check ok={Boolean(mon.adsEnabled)}>Master switch on (only after approval)</Check>
        </ul>
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-900 dark:text-red-200 space-y-1">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      {readOnly ? (
        <p className="text-xs text-slate-500">Only administrators can change advertising settings.</p>
      ) : (
        <button type="button" disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-orange-700 hover:bg-orange-800 disabled:opacity-60 px-5 py-2.5 text-sm font-semibold text-white">
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>{saving ? 'Saving…' : 'Save advertising settings'}</span>
        </button>
      )}
    </div>
  );
};
