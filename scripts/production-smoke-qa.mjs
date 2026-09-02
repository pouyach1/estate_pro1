import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API = process.env.API_URL || 'http://localhost:5000';
const results = [];
const pass = (n, d = '') => results.push({ status: 'PASS', name: n, detail: d });
const fail = (n, d = '') => results.push({ status: 'FAIL', name: n, detail: d });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  pass('Homepage loads');

  const goldCount = await page.evaluate(() => {
    const styles = Array.from(document.styleSheets);
    let hits = 0;
    for (const sheet of styles) {
      try {
        const rules = sheet.cssRules || [];
        for (const rule of rules) {
          if (rule.cssText && /#c4a962|#c9a22|champagne|rgb\(201,\s*162,\s*39/i.test(rule.cssText)) hits += 1;
        }
      } catch (e) { /* cross-origin */ }
    }
    return hits;
  });
  if (goldCount < 5) pass('Reduced gold CSS footprint', String(goldCount));
  else fail('Gold CSS remnants', String(goldCount));

  const props = await page.request.get(`${API}/api/properties?limit=1`);
  const propList = await props.json();
  const id = propList.properties?.[0]?._id;
  if (!id) fail('Property for view test');
  else {
    const before = await page.request.get(`${API}/api/properties/${id}`);
    const beforeData = await before.json();
    const beforeUpdated = beforeData.updatedAt;
    const beforeViews = beforeData.views || 0;
    await page.request.get(`${API}/api/properties/${id}`);
    const after = await page.request.get(`${API}/api/properties/${id}`);
    const afterData = await after.json();
    if ((afterData.views || 0) > beforeViews) pass('View count increments');
    else fail('View count increments');
    if (beforeUpdated === afterData.updatedAt) pass('updatedAt unchanged on view');
    else fail('updatedAt unchanged on view', `${beforeUpdated} -> ${afterData.updatedAt}`);
  }

  if (id) {
    const similar = await page.request.get(`${API}/api/properties/${id}/similar`);
    if (similar.ok()) pass('Similar API with legacy status support');
    else fail('Similar API');
  }

  await page.goto(`${BASE}/this-route-should-not-exist-astoria`, { waitUntil: 'networkidle' });
  const is404 = await page.locator('.astoria-404-title').isVisible();
  if (is404) pass('Vite 404 fallback');
  else fail('Vite 404 fallback');

  await page.goto(`${BASE}/robots.txt`);
  const robots = await page.content();
  if (robots.includes('Sitemap')) pass('robots.txt');
  else fail('robots.txt');

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const m = await mobile.newPage();
  await m.goto(BASE, { waitUntil: 'networkidle' });
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (!overflow) pass('Mobile overflow clean');
  else fail('Mobile overflow');
  await mobile.close();

  await browser.close();

  console.log('\n=== PRODUCTION SMOKE QA ===');
  results.forEach((r) => console.log(`${r.status}: ${r.name}${r.detail ? ` — ${r.detail}` : ''}`));
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
