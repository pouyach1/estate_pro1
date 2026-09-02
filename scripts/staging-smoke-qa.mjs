#!/usr/bin/env node
/**
 * Staging / production-mode smoke test.
 * Builds dist, starts Express with SERVE_STATIC=true, runs critical checks.
 *
 * Usage: node scripts/staging-smoke-qa.mjs
 */
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.STAGING_PORT || 5050);
const BASE = `http://127.0.0.1:${PORT}`;
const results = [];
const pass = (n, d = '') => results.push({ status: 'PASS', name: n, detail: d });
const fail = (n, d = '') => results.push({ status: 'FAIL', name: n, detail: d });

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { ...opts, stdio: opts.stdio || 'pipe' });
    let out = '';
    child.stdout?.on('data', (d) => { out += d; });
    child.stderr?.on('data', (d) => { out += d; });
    child.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(out || `exit ${code}`))));
  });
}

async function waitForHealth(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return await res.json();
    } catch (_) { /* retry */ }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error('Server health check timed out');
}

async function main() {
  console.log('Building production assets...');
  await run('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit' });

  const serverEnv = {
    ...process.env,
    NODE_ENV: 'production',
    SERVE_STATIC: 'true',
    PORT: String(PORT),
  };

  console.log(`Starting production server on ${BASE}...`);
  const server = spawn('node', ['server.js'], {
    cwd: path.join(ROOT, 'server'),
    env: serverEnv,
    stdio: 'pipe',
  });

  let serverLog = '';
  server.stdout.on('data', (d) => { serverLog += d; });
  server.stderr.on('data', (d) => { serverLog += d; });

  const shutdown = () => {
    if (!server.killed) server.kill('SIGTERM');
  };
  process.on('exit', shutdown);
  process.on('SIGINT', () => { shutdown(); process.exit(1); });

  try {
    const health = await waitForHealth();
    if (health.status === 'ok') pass('Health endpoint', JSON.stringify(health));
    else fail('Health endpoint', JSON.stringify(health));

    const unauth = await fetch(`${BASE}/api/customers`);
    if (unauth.status === 401) pass('Admin customers API protected');
    else fail('Admin customers API protected', String(unauth.status));

    const unauthAdmin = await fetch(`${BASE}/api/admin/dashboard`);
    if (unauthAdmin.status === 401) pass('Admin dashboard API protected');
    else fail('Admin dashboard API protected', String(unauthAdmin.status));

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

    await page.goto(BASE, { waitUntil: 'networkidle' });
    if (await page.locator('.home-hero-headline').isVisible()) pass('Static homepage');
    else fail('Static homepage');

    const props = await page.request.get(`${BASE}/api/properties?limit=1`);
    const propList = await props.json();
    const id = propList.properties?.[0]?._id;
    if (!id) fail('Property available for tests');
    else {
      const before = await page.request.get(`${BASE}/api/properties/${id}`);
      const beforeData = await before.json();
      const beforeUpdated = beforeData.updatedAt;
      const beforeViews = beforeData.views || 0;
      await page.request.get(`${BASE}/api/properties/${id}`);
      const after = await page.request.get(`${BASE}/api/properties/${id}`);
      const afterData = await after.json();
      if ((afterData.views || 0) > beforeViews) pass('View count increments');
      else fail('View count increments');
      if (beforeUpdated === afterData.updatedAt) pass('updatedAt unchanged on view');
      else fail('updatedAt unchanged on view');
    }

    await page.goto(`${BASE}/property/?id=${id}`, { waitUntil: 'networkidle' });
    if (await page.locator('#propertyMain:not([hidden])').isVisible({ timeout: 15000 })) {
      pass('Static property route');
    } else fail('Static property route');

    await page.goto(`${BASE}/does-not-exist-astoria-route`, { waitUntil: 'networkidle' });
    if (await page.locator('.astoria-404-title').isVisible()) pass('Production 404');
    else fail('Production 404');

    await page.goto(`${BASE}/admin/`, { waitUntil: 'networkidle' });
    if (await page.locator('.admin-login-card').isVisible()) pass('Static admin login');
    else fail('Static admin login');

    const goldCount = await page.evaluate(() => {
      let hits = 0;
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.cssText && /#c4a962|#c9a22|rgb\(201,\s*162,\s*39/i.test(rule.cssText)) hits += 1;
          }
        } catch (_) { /* cross-origin */ }
      }
      return hits;
    });
    if (goldCount < 5) pass('Gold CSS footprint (production)', String(goldCount));
    else fail('Gold CSS footprint', String(goldCount));

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const m = await mobile.newPage();
    await m.goto(BASE, { waitUntil: 'networkidle' });
    const overflow = await m.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (!overflow) pass('Mobile overflow clean (production)');
    else fail('Mobile overflow (production)');
    await mobile.close();
    await browser.close();

    const loginRes = await fetch(`${BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin@astoria.local', password: 'AstoriaDemo2026!' }),
    });
    if (loginRes.ok) {
      pass('Admin login API');
      const { token } = await loginRes.json();
      const leads = await fetch(`${BASE}/api/customers`, { headers: { Authorization: `Bearer ${token}` } });
      if (leads.ok) pass('Authenticated leads API');
      else fail('Authenticated leads API', String(leads.status));
    } else {
      fail('Admin login API', 'seed may be required');
    }

    const publicLead = await fetch(`${BASE}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Staging QA',
        email: 'staging-qa@astoria.test',
        phone: '09120000000',
        message: 'Staging smoke test lead',
        source: 'staging-qa',
      }),
    });
    if (publicLead.status === 201) {
      const body = await publicLead.json();
      if (body.message && !body.notes && !body.status) pass('Public lead response sanitized');
      else fail('Public lead response sanitized', JSON.stringify(body));
    } else fail('Public lead creation', String(publicLead.status));

  } finally {
    shutdown();
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('\n=== STAGING SMOKE QA (PRODUCTION MODE) ===');
  results.forEach((r) => console.log(`${r.status}: ${r.name}${r.detail ? ` — ${r.detail}` : ''}`));
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
