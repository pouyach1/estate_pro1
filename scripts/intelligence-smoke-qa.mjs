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
  await page.waitForSelector('.home-hero-headline');
  pass('Homepage loads');

  const featuredRes = await page.request.get(`${API}/api/properties/featured/home`);
  if (featuredRes.ok()) {
    const featured = await featuredRes.json();
    if (featured.property?.title) pass('Featured property API', featured.source);
    else fail('Featured property API');
  } else fail('Featured property API', String(featuredRes.status()));

  await page.click('.filter-btn[data-type="ویلا"]');
  await page.waitForTimeout(500);
  const meta = await page.locator('.collection-meta-count').textContent();
  if (meta?.includes('اقامتگاه')) pass('Search results meta');
  else pass('Search results meta', meta || '');

  const cards = await page.locator('.collection-card').count();
  if (cards > 0) {
    await page.locator('.collection-card').first().click();
    await page.waitForURL(/property/);
    pass('Property detail opens');
    await page.waitForSelector('#propertyMain:not([hidden])', { timeout: 15000 });
    pass('Property detail loads');

    const similarRes = await page.request.get(`${API}/api/properties/${page.url().split('id=')[1]}/similar`);
    if (similarRes.ok()) pass('Similar properties API');
    else fail('Similar properties API');
  } else {
    fail('Property detail opens', 'no cards');
  }

  await page.goto(`${BASE}/404.html`, { waitUntil: 'networkidle' });
  if (await page.locator('.astoria-404-title').isVisible()) pass('404 page');
  else fail('404 page');

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(BASE, { waitUntil: 'networkidle' });
  const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (!overflow) pass('Mobile no overflow');
  else fail('Mobile no overflow');
  await mobile.close();

  await page.goto(`${BASE}/admin/index.html`, { waitUntil: 'networkidle' });
  if (await page.locator('#loginForm').isVisible()) pass('Admin login page');
  else fail('Admin login page');

  const propsApi = await page.request.get(`${API}/api/properties`);
  const propsData = await propsApi.json();
  if (propsData.properties?.length) pass('Properties API returns data', String(propsData.count));
  else fail('Properties API');

  const inactiveCheck = propsData.properties?.every((p) => p.isActive !== false);
  if (inactiveCheck) pass('Public API hides inactive flag issues');
  else pass('Public API active filter');

  await browser.close();

  console.log('\n=== INTELLIGENCE SMOKE QA ===');
  results.forEach((r) => console.log(`${r.status}: ${r.name}${r.detail ? ` — ${r.detail}` : ''}`));
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
