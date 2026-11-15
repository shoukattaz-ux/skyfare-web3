/**
 * Loads third-party ad scripts on demand. Callers must only call these after the visitor
 * has consented to advertising and after a publisher ID has been configured by an admin.
 * A failed/blocked load rejects, so the UI can remove the empty ad container.
 */

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    _mNHandle?: { queue?: (() => void)[] };
    _mNDetails?: { loadTag: (id: string, size: string, id2: string) => void };
  }
}

const loading = new Map<string, Promise<void>>();

function loadScript(id: string, src: string, attrs: Record<string, string> = {}): Promise<void> {
  const existing = loading.get(id);
  if (existing) return existing;
  const p = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.id = id;
    el.async = true;
    el.src = src;
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.onload = () => resolve();
    el.onerror = () => {
      loading.delete(id);
      el.remove();
      reject(new Error(`Could not load ${id}`));
    };
    document.head.appendChild(el);
  });
  loading.set(id, p);
  return p;
}

export const ADSENSE_ID_RE = /^pub-\d{10,20}$/;

export function loadAdSense(publisherId: string): Promise<void> {
  if (!ADSENSE_ID_RE.test(publisherId)) return Promise.reject(new Error('Invalid AdSense publisher ID'));
  return loadScript(
    'skyfare-adsense',
    `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${encodeURIComponent(publisherId)}`,
    { crossorigin: 'anonymous' }
  );
}

export function loadMediaNet(customerId: string): Promise<void> {
  if (!/^[A-Za-z0-9]{4,30}$/.test(customerId)) return Promise.reject(new Error('Invalid Media.net customer ID'));
  window._mNHandle = window._mNHandle || {};
  window._mNHandle.queue = window._mNHandle.queue || [];
  return loadScript('skyfare-medianet', `https://contextual.media.net/dmedianet.js?cid=${encodeURIComponent(customerId)}`);
}

/**
 * Ads appear only where there is real article content: the guides index and individual guides.
 * Never on the home page, fare lists, destination/airline pages, search, contact, legal, admin or 404.
 */
export function adsAllowedOnPath(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, '') || '/';
  return p === '/guides' || /^\/guides\/[a-z0-9-]+$/.test(p);
}
