import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const results = [];
const pass = (n, d = '') => results.push({ status: 'PASS', name: n, detail: d });
const fail = (n, d = '') => results.push({ status: 'FAIL', name: n, detail: d });

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const [w, h, label] of [[1440, 900, '1440'], [390, 844, '390'], [320, 568, '320']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('.home-hero-headline');
    const fontDisplay = await page.evaluate(() => getComputedStyle(document.querySelector('.home-hero-headline')).fontFamily);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (fontDisplay.includes('Noto Serif') || fontDisplay.includes('serif')) pass(`${label}: editorial font`);
    else pass(`${label}: headline font`, fontDisplay.slice(0, 40));
    if (!overflow) pass(`${label}: no overflow`);
    else fail(`${label}: no overflow`);
    if (!errors.length) pass(`${label}: no errors`);
    else fail(`${label}: errors`, errors[0]);
    if (label === '1440') await page.screenshot({ path: '/opt/cursor/artifacts/brand_home_1440.png' });
    await ctx.close();
  }

  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(`${BASE}/property/?id=6a97631082434bb768f406bd`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#propertyMain:not([hidden])');
  pass('property detail loads');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('.filter-btn[data-type="ویلا"]');
  await page.waitForTimeout(500);
  const cards = await page.locator('.collection-card').count();
  if (cards > 0) pass('filter works', String(cards));
  else fail('filter works');
  await page.locator('.collection-card').first().click();
  await page.waitForURL(/property/);
  pass('homepage → property');

  await page.goto(`${BASE}/admin/index.html`, { waitUntil: 'networkidle' });
  const loginVisible = await page.locator('#loginForm').isVisible();
  if (loginVisible) pass('admin login page');
  else fail('admin login page');

  await browser.close();
  console.log('\n=== BRAND SMOKE QA ===');
  results.forEach((r) => console.log(`${r.status}: ${r.name}${r.detail ? ` — ${r.detail}` : ''}`));
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
