import crypto from 'node:crypto';
import type express from 'express';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

export function sanitizeText(value: unknown, maxLen = 500): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[<>]/g, (ch) => (ch === '<' ? '&lt;' : '&gt;'))
    .trim()
    .slice(0, maxLen);
}

/** Strips control characters and trims, without HTML-escaping (React escapes on render). */
export function cleanText(value: unknown, maxLen = 500): string {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

/** Returns the URL only if it is http(s) (or a same-site absolute path when allowed). */
export function safeUrl(value: unknown, opts: { allowRelative?: boolean; maxLen?: number } = {}): string {
  if (typeof value !== 'string') return '';
  const v = value.trim().slice(0, opts.maxLen ?? 500);
  if (!v) return '';
  if (opts.allowRelative && /^\/(?!\/)[^\s]*$/.test(v)) return v;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : '';
  } catch {
    return '';
  }
}

export function sanitizeSlug(value: unknown, maxLen = 100): string {
  if (typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen);
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    let val = pair.slice(idx + 1).trim();
    try {
      val = decodeURIComponent(val);
    } catch {
      continue; // malformed cookie value: ignore instead of throwing a 500
    }
    out[key] = val;
  }
  return out;
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

// Keep the in-memory bucket map from growing forever.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateBuckets) if (now > v.resetAt) rateBuckets.delete(k);
}, 5 * 60 * 1000).unref();

export function checkRateLimit(
  key: string,
  limit = 20,
  windowMs = 10 * 60 * 1000
): boolean {
  const now = Date.now();
  const existing = rateBuckets.get(key);
  if (!existing || now > existing.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

export function setSessionCookie(
  res: express.Response,
  sessionId: string,
  isHttps: boolean
): void {
  const flags = [
    `skyfare_sid=${encodeURIComponent(sessionId)}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${60 * 60 * 24}`,
  ];
  if (isHttps) flags.push('Secure');
  res.setHeader('Set-Cookie', flags.join('; '));
}

export function clearSessionCookie(res: express.Response): void {
  res.setHeader(
    'Set-Cookie',
    'skyfare_sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
  );
}
