import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1366', width: 1366, height: 768 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '430', width: 430, height: 932 },
  { name: '390', width: 390, height: 844 },
  { name: '360', width: 360, height: 800 },
  { name: '320', width: 320, height: 568 },
];

const results = [];
const pass = (n, d = '') => results.push({ status: 'PASS', name: n, detail: d });
const fail = (n, d = '') => results.push({ status: 'FAIL', name: n, detail: d });

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('.collection-card, .featured-property', { timeout: 15000 });

    const headline = await page.locator('.home-hero-headline').textContent();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

    if (headline?.includes('معماری')) pass(`${vp.name}: hero loads`);
    else fail(`${vp.name}: hero loads`, headline || 'missing');

    if (!overflow) pass(`${vp.name}: no overflow`);
    else fail(`${vp.name}: no overflow`);

    if (errors.length === 0) pass(`${vp.name}: no console errors`);
    else fail(`${vp.name}: console errors`, errors.slice(0, 2).join(' | '));

    if (vp.name === '1440' || vp.name === '390') {
      await page.screenshot({ path: `/opt/cursor/artifacts/screenshots/home-${vp.name}.png`, fullPage: false });
    }
    await ctx.close();
  }

  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.collection-card');

  await page.click('.filter-btn[data-type="ویلا"]');
  await page.waitForTimeout(600);
  const villaCards = await page.locator('.collection-card[data-type="ویلا"]').count();
  if (villaCards > 0) pass('filter: villa type', String(villaCards));
  else fail('filter: villa type');

  await page.click('.filter-btn[data-type="همه"]');
  await page.waitForTimeout(400);

  const firstCard = page.locator('.collection-card').first();
  await firstCard.click();
  await page.waitForURL(/property\/\?id=/, { timeout: 10000 });
  if (page.url().includes('property')) pass('nav: homepage to property detail');
  else fail('nav: homepage to property detail');

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.fill('#desktopLocationSearch', 'تهران');
  await page.click('.home-concierge-submit');
  await page.waitForTimeout(600);
  const meta = await page.locator('#propertiesResultsMeta').textContent();
  if (meta) pass('search: desktop location', meta.trim());
  else fail('search: desktop location');

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('.nav-cta-desktop.home-nav-cta');
  await page.waitForFunction(() => {
    const el = document.getElementById('consultation');
    if (!el) return false;
    return el.getBoundingClientRect().top < window.innerHeight * 0.6;
  }, { timeout: 6000 });
  if (consultInView) pass('CTA: nav scroll to consultation');
  else fail('CTA: nav scroll to consultation');

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('.mobile-menu-toggle');
  await page.waitForTimeout(300);
  const menuOpen = await page.locator('.nav-links.active').isVisible();
  if (menuOpen) pass('mobile: menu opens');
  else fail('mobile: menu opens');

  await browser.close();

  console.log('\n=== HOMEPAGE QA ===');
  results.forEach((r) => console.log(`${r.status}: ${r.name}${r.detail ? ` — ${r.detail}` : ''}`));
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
