import { useSyncExternalStore } from 'react';

/**
 * Visitor consent. Nothing optional (analytics, advertising) is switched on until the visitor
 * makes an explicit choice. The v2 key means anyone who saw the original pre-ticked banner
 * is asked again.
 */
export interface ConsentState {
  decided: boolean;
  analytics: boolean;
  ads: boolean;
  updatedAt: string;
}

const KEY = 'skyfare_consent_v2';
const EVENT = 'skyfare:consent';
const DEFAULT: ConsentState = { decided: false, analytics: false, ads: false, updatedAt: '' };

let cache: ConsentState | null = null;

function read(): ConsentState {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<ConsentState>;
      cache = {
        decided: p.decided === true,
        analytics: p.analytics === true,
        ads: p.ads === true,
        updatedAt: String(p.updatedAt || ''),
      };
      return cache;
    }
  } catch {
    // storage unavailable: treated as "not decided, nothing allowed"
  }
  cache = DEFAULT;
  return cache;
}

export function getConsent(): ConsentState {
  return read();
}

export function saveConsent(next: { analytics: boolean; ads: boolean }): void {
  cache = { decided: true, analytics: next.analytics, ads: next.ads, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // keep the in-memory choice for this page view
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  });
  return () => window.removeEventListener(EVENT, cb);
}

export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribe, read, () => DEFAULT);
}
