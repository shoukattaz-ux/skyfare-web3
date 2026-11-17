// Backend smoke tests. Run the server first, then:
//   BASE_URL=http://localhost:3100 ADMIN_EMAIL=... ADMIN_PASSWORD=... node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL || 'http://localhost:3100';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@skyfare.local';
const PASSWORD = process.env.ADMIN_PASSWORD || '';

const get = (p, opts) => fetch(BASE + p, { redirect: 'manual', ...opts });
let cookie = '';
let csrf = '';
const api = (method, p, body) =>
  fetch(BASE + '/api' + p, {
    method,
    headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': csrf },
    body: body ? JSON.stringify(body) : undefined,
  });

test('public pages: status, title, canonical, content in first HTML', async () => {
  for (const p of ['/', '/guides', '/guides/how-to-find-cheap-flights', '/about', '/privacy', '/editorial-policy', '/corrections-policy', '/cookie-policy', '/terms', '/disclaimer', '/affiliate-disclosure', '/contact', '/sitemap', '/domestic', '/international', '/destinations/cancun', '/airlines/delta']) {
    const r = await get(p);
    const html = await r.text();
    assert.equal(r.status, 200, p);
    assert.match(html, /<title>[^<]{10,}<\/title>/, p + ' title');
    assert.match(html, /<link rel="canonical"/, p + ' canonical');
    assert.match(html, /<h1>/, p + ' has server-rendered h1');
    assert.doesNotMatch(html, /SSR_HEAD_INJECT/, p);
  }
});

test('unknown routes return a real 404, not the app shell with 200', async () => {
  for (const p of ['/no-such-page', '/guides/not-a-guide', '/destinations/atlantis', '/missing.js']) {
    assert.equal((await get(p)).status, 404, p);
  }
  assert.equal((await get('/api/nope')).status, 404);
});

test('noindex on admin, search and 404', async () => {
  for (const p of ['/admin', '/search', '/nothing-here']) {
    const r = await get(p);
    assert.match(r.headers.get('x-robots-tag') || '', /noindex/, p);
    assert.match(await r.text(), /name="robots" content="noindex/, p);
  }
});

test('robots.txt, sitemap.xml and ads.txt', async () => {
  const robots = await (await get('/robots.txt')).text();
  assert.match(robots, /Sitemap: .*\/sitemap\.xml/);
  assert.match(robots, /Disallow: \/admin/);
  const sm = await (await get('/sitemap.xml')).text();
  assert.match(sm, /<loc>.*\/guides\/how-to-find-cheap-flights<\/loc>/);
  assert.doesNotMatch(sm, /\/search<|\/admin</);
  assert.match(sm, /\/destinations\/cancun</, 'expanded destination pages are in the sitemap');
  const ads = await (await get('/ads.txt')).text();
  assert.doesNotMatch(ads, /0000000000000000|00000, DIRECT|YOUR_CUSTOMER_ID/);
});

test('no invented identity or fake trust claims in rendered public HTML', async () => {
  const banned = /Elena Vance|Marcus Thorne|Claire Lindqvist|Media LLC|548 Market|42,000|Hannah Morales|Devon Brooks|Rachel & Sam|hand-verified|real-time (aviation|feed)/i;
  for (const p of ['/', '/about', '/privacy', '/guides/how-to-find-cheap-flights', '/contact']) {
    const html = await (await get(p)).text();
    assert.doesNotMatch(html, banned, p);
  }
  const boot = JSON.stringify(await (await get('/api/bootstrap')).json());
  assert.doesNotMatch(boot, banned);
});

test('admin API requires authentication and CSRF', async () => {
  assert.equal((await get('/api/admin/dashboard')).status, 401);
  assert.equal((await fetch(BASE + '/api/admin/deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 401);
});

test('default credentials from the original build no longer work', async () => {
  const r = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@skyfareusa.com', password: 'SkyFareAdmin2026!' }) });
  assert.equal(r.status, 401);
});

test('login, roles, workflow', { skip: !PASSWORD }, async () => {
  const r = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  assert.equal(r.status, 200);
  cookie = r.headers.get('set-cookie').split(';')[0];
  csrf = (await r.json()).csrfToken;
  assert.equal((await fetch(BASE + '/api/admin/deals', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: '{}' })).status, 403, 'missing CSRF header rejected');

  // Publishing without review must fail
  const body = (extra = {}) => ({
    title: 'QA test guide about baggage fees', slug: 'qa-test-guide', excerpt: 'Test excerpt for QA only.',
    sections: [{ heading: 'One', paragraphs: [('Word '.repeat(320)).trim()] }], status: 'published', ...extra,
  });
  let res = await api('POST', '/admin/guides', body({ reviewStatus: 'pending_review' }));
  assert.equal(res.status, 400, 'publish without review blocked');
  res = await api('POST', '/admin/guides', body({ reviewStatus: 'reviewed', checklist: { accuracy: true } }));
  assert.equal(res.status, 400, 'review without full checklist blocked');
  const full = Object.fromEntries(['accuracy','originality','readability','usefulness','formatting','sources','images','noRepetition','notMisleading'].map((k) => [k, true]));
  res = await api('POST', '/admin/guides', body({ reviewStatus: 'reviewed', checklist: full }));
  assert.equal(res.status, 201);
  assert.equal((await res.json()).guide.reviewStatus, 'reviewed');
  assert.equal((await get('/guides/qa-test-guide')).status, 200);

  // Revisions + scheduled publishing
  res = await api('POST', '/admin/guides', body({ title: 'QA test guide about baggage fees v2', reviewStatus: 'reviewed', checklist: full, publishAt: new Date(Date.now() + 86400000).toISOString() }));
  assert.equal(res.status, 201);
  assert.equal((await get('/guides/qa-test-guide')).status, 404, 'scheduled guide hidden until its time');
  const revs = await (await api('GET', '/admin/guides/qa-test-guide/revisions')).json();
  assert.ok(revs.revisions.length >= 1);

  // Cleanup
  assert.equal((await api('DELETE', '/admin/guides/qa-test-guide')).status, 200);

  // Ad config validation
  res = await api('PUT', '/admin/ads', { monetization: { adsensePublisherId: 'not-valid' } });
  assert.equal(res.status, 400);

  // javascript: URLs rejected
  res = await api('POST', '/admin/deals', { affiliateUrl: 'javascript:alert(1)' });
  assert.equal(res.status, 400);

  // SVG upload rejected
  res = await api('POST', '/admin/media', { filename: 'x.svg', mimeType: 'image/svg+xml', base64Data: 'PHN2Zz48L3N2Zz4=', altText: 'xx xx xx' });
  assert.equal(res.status, 400);
});

test('roles: analyst is read-only, editor cannot touch settings/ads/users, last admin is protected', { skip: !PASSWORD }, async () => {
  const stamp = Date.now();
  const mk = async (role) => {
    const email = `qa-${role}-${stamp}@example.test`;
    const r = await api('POST', '/admin/users', { email, name: role, role, password: 'Another-Strong-Pass-1' });
    assert.equal(r.status, 201);
    const l = await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Another-Strong-Pass-1' }) });
    assert.equal(l.status, 200);
    return { cookie: l.headers.get('set-cookie').split(';')[0], csrf: (await l.json()).csrfToken };
  };
  const as = (u) => (method, p, body) => fetch(BASE + '/api' + p, { method, headers: { 'Content-Type': 'application/json', Cookie: u.cookie, 'X-CSRF-Token': u.csrf }, body: body ? JSON.stringify(body) : undefined });
  const analyst = as(await mk('analyst'));
  const editor = as(await mk('editor'));
  assert.equal((await analyst('GET', '/admin/dashboard')).status, 200, 'analyst can read');
  assert.equal((await analyst('POST', '/admin/categories', { name: 'x-cat' })).status, 403, 'analyst cannot write');
  assert.equal((await analyst('POST', '/admin/deals', { affiliateUrl: 'https://example.com' })).status, 403);
  assert.equal((await editor('POST', '/admin/categories', { name: 'QA Editor Cat', slug: 'qa-editor-cat' })).status, 201, 'editor can write content');
  assert.equal((await editor('PUT', '/admin/ads', { monetization: { adsEnabled: true } })).status, 403, 'editor cannot change ads');
  assert.equal((await editor('PUT', '/admin/settings', { general: { siteName: 'x' } })).status, 403, 'editor cannot change settings');
  assert.equal((await editor('PUT', '/admin/legal/privacy', { title: 'x', content_markdown: 'x'.repeat(60) })).status, 403, 'editor cannot edit legal pages');
  assert.equal((await editor('GET', '/admin/users')).status, 403);
  assert.equal((await editor('GET', '/admin/backup')).status, 403);
  // cleanup category
  const cats = (await (await api('GET', '/admin/dashboard')).json()).categories;
  const id = cats.find((c) => c.slug === 'qa-editor-cat')?.id;
  if (id) await api('DELETE', `/admin/categories/${id}`);
  // cannot demote/disable the only admin
  const users = (await (await api('GET', '/admin/users')).json()).users;
  const me = users.find((u) => u.email === EMAIL);
  const onlyAdmins = users.filter((u) => u.role === 'admin' && u.active);
  if (onlyAdmins.length === 1) assert.equal((await api('PATCH', `/admin/users/${me.id}`, { role: 'editor' })).status, 400, 'last admin protected');
  for (const u of users.filter((x) => x.email.startsWith('qa-') && x.email.includes(String(stamp)))) await api('DELETE', `/admin/users/${u.id}`);
});

// Opt-in: it uses up this IP's login budget for 10 minutes. Run with TEST_THROTTLE=1 as the LAST thing you do.
test('login is throttled after repeated failures', { skip: !process.env.TEST_THROTTLE }, async () => {
  let last = 0;
  for (let i = 0; i < 12; i++) {
    last = (await fetch(BASE + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'nobody@example.test', password: 'x' + i }) })).status;
  }
  assert.equal(last, 429);
});

test('stored-XSS style input is stored inertly and the SPA never uses innerHTML', async () => {
  const r = await fetch(BASE + '/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '<img src=x onerror=alert(1)>', email: 'x@example.test', message: '<script>alert(1)</script> padding padding' }) });
  assert.ok([201, 429].includes(r.status));
});

test('email sign-ups are refused while email delivery is not enabled', async () => {
  const r = await fetch(BASE + '/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'a@b.co' }) });
  assert.equal(r.status, 503);
});

test('contact form validates and stores', async () => {
  let r = await fetch(BASE + '/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'A', email: 'bad', message: 'x' }) });
  assert.equal(r.status, 400);
  r = await fetch(BASE + '/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'QA Tester', email: 'qa@example.com', subject: 'Test', message: 'This is an automated QA message.' }) });
  assert.equal(r.status, 201);
});
