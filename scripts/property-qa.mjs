import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const PROPERTY_ID = process.env.PROPERTY_ID || '6a97631082434bb768f406bd';
const URL = `${BASE}/property/?id=${PROPERTY_ID}`;
const VIEWPORTS = [
  { name: 'desktop-1366', width: 1366, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-320', width: 320, height: 568 },
  { name: 'mobile-430', width: 430, height: 932 },
];

const results = [];
const pass = (name, detail = '') => results.push({ status: 'PASS', name, detail });
const fail = (name, detail = '') => results.push({ status: 'FAIL', name, detail });

async function runViewport(browser, vp) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#propertyMain:not([hidden])', { timeout: 15000 });

  const title = await page.locator('#propertyTitle').textContent();
  const price = await page.locator('#propertyPrice').textContent();
  const hasToman = price?.includes('تومان') || price?.includes('تماس');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

  if (title && title !== 'در حال بارگذاری...') pass(`${vp.name}: property loads`, title.trim());
  else fail(`${vp.name}: property loads`, title || 'empty');

  if (hasToman) pass(`${vp.name}: price visible`, price?.trim());
  else fail(`${vp.name}: price visible`, price || 'missing');

  if (!overflow) pass(`${vp.name}: no horizontal overflow`);
  else fail(`${vp.name}: no horizontal overflow`);

  if (errors.length === 0) pass(`${vp.name}: no console errors`);
  else fail(`${vp.name}: no console errors`, errors.slice(0, 3).join(' | '));

  await mkdir('/opt/cursor/artifacts/screenshots', { recursive: true });
  await page.screenshot({ path: `/opt/cursor/artifacts/screenshots/property-${vp.name}.png`, fullPage: false });

  await context.close();
}

async function runInteractions(browser) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('#propertyMain:not([hidden])');

  const counterBefore = await page.locator('#imageCounter').textContent();
  await page.click('#nextImage');
  await page.waitForTimeout(500);
  const counterAfter = await page.locator('#imageCounter').textContent();
  if (counterBefore !== counterAfter) pass('gallery: next image');
  else fail('gallery: next image', `${counterBefore} -> ${counterAfter}`);

  await page.click('#btnFullscreen');
  await page.waitForSelector('#propertyLightbox:not([hidden])', { timeout: 3000 });
  pass('gallery: lightbox opens');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const lbHidden = await page.locator('#propertyLightbox').getAttribute('hidden');
  if (lbHidden !== null) pass('gallery: lightbox closes on Escape');
  else fail('gallery: lightbox closes on Escape');

  const features = await page.locator('.feature-tag').count();
  if (features > 0) pass('features: rendered', String(features));
  else fail('features: rendered');

  const agentName = await page.locator('.agent-showcase-name').first().textContent();
  if (agentName?.trim()) pass('agent: loaded', agentName.trim());
  else fail('agent: loaded');

  const similar = await page.locator('.similar-card').count();
  if (similar > 0) pass('similar: rendered', String(similar));
  else fail('similar: rendered');

  await page.click('#btnRequestTourPrimary');
  await page.waitForSelector('#tourModal.active', { timeout: 3000 });
  pass('CTA: tour modal opens');
  await page.click('#closeTourModal');
  await page.waitForTimeout(200);

  await context.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const mpage = await mobile.newPage();
  await mpage.goto(URL, { waitUntil: 'networkidle' });
  await mpage.waitForSelector('#propertyMain:not([hidden])');

  const ctaVisible = await mpage.locator('#propertyMobileCta.visible').isVisible();
  if (ctaVisible) pass('mobile: sticky CTA visible');
  else fail('mobile: sticky CTA visible');

  const inlineCta = await mpage.locator('#btnRequestTourInline').isVisible();
  if (inlineCta) pass('mobile: inline CTA visible');
  else fail('mobile: inline CTA visible');

  const agentMobile = await mpage.locator('#agentMobileSection:not([hidden])').isVisible();
  if (agentMobile) pass('mobile: agent section visible');
  else fail('mobile: agent section visible');

  await mobile.close();

  const home = await browser.newPage();
  await home.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const hero = await home.locator('.hero-section, .hero, #hero, .luxury-hero').first().isVisible().catch(() => false);
  const cards = await home.locator('.property-card, .m-property-card, [data-property-id]').count();
  if (hero || cards > 0) pass('regression: homepage loads', `cards=${cards}`);
  else fail('regression: homepage loads');
  await home.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const vp of VIEWPORTS) await runViewport(browser, vp);
    await runInteractions(browser);
  } finally {
    await browser.close();
  }

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log('\n=== PROPERTY QA RESULTS ===');
  results.forEach((r) => console.log(`${r.status}: ${r.name}${r.detail ? ` — ${r.detail}` : ''}`));
  console.log(`\nTotal: ${passed}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
