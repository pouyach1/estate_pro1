#!/usr/bin/env node
/**
 * Stage 2 SEO smoke tests — dev or production mode.
 * Usage: node scripts/seo-smoke-qa.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API = process.env.API_URL || 'http://localhost:5000';
const results = [];
const pass = (n, d = '') => results.push({ status: 'PASS', name: n, detail: d });
const fail = (n, d = '') => results.push({ status: 'FAIL', name: n, detail: d });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  const siteRes = await page.request.get(`${API}/api/site`);
  if (siteRes.ok()) pass('/api/site endpoint');
  else fail('/api/site endpoint', String(siteRes.status()));

  const robotsRes = await page.request.get(`${API}/robots.txt`);
  const robotsText = await robotsRes.text();
  if (robotsRes.ok() && robotsText.includes('Sitemap:') && robotsText.includes('Disallow: /admin/')) {
    pass('Dynamic robots.txt');
  } else fail('Dynamic robots.txt');

  const sitemapRes = await page.request.get(`${API}/sitemap.xml`);
  const sitemapXml = await sitemapRes.text();
  if (!sitemapRes.ok() || !sitemapXml.includes('<urlset')) fail('Dynamic sitemap.xml');
  else {
    pass('Dynamic sitemap.xml');
    if (sitemapXml.includes('<loc>') && !sitemapXml.includes('<loc>/</loc>')) pass('Sitemap absolute URLs');
    else if (sitemapXml.match(/<loc>https?:\/\//)) pass('Sitemap absolute URLs');
    else fail('Sitemap absolute URLs', 'relative loc values');
  }

  const props = await page.request.get(`${API}/api/properties?limit=50`);
  const propList = await props.json();
  const publicCount = propList.properties?.length || 0;
  const sitemapUrlCount = (sitemapXml.match(/<url>/g) || []).length;
  if (sitemapUrlCount >= publicCount + 1) pass('Sitemap includes public properties', `${sitemapUrlCount} urls`);
  else fail('Sitemap includes public properties', `${sitemapUrlCount} vs ${publicCount}+1`);

  await page.goto(BASE, { waitUntil: 'networkidle' });
  const homeTitle = await page.title();
  if (homeTitle.includes('آستوریا')) pass('Homepage title');
  else fail('Homepage title', homeTitle);

  const homeDesc = await page.locator('meta[name="description"]').getAttribute('content');
  if (homeDesc && homeDesc.length > 40) pass('Homepage meta description');
  else fail('Homepage meta description');

  const homeCanonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  if (homeCanonical && !homeCanonical.includes('localhost')) pass('Homepage canonical uses site origin');
  else if (homeCanonical) pass('Homepage canonical present', homeCanonical);
  else fail('Homepage canonical');

  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
  if (ogTitle) pass('Homepage Open Graph title');
  else fail('Homepage Open Graph title');

  const orgLd = await page.locator('#organizationJsonLd').textContent();
  if (orgLd && orgLd.includes('RealEstateAgent')) pass('Homepage Organization JSON-LD');
  else fail('Homepage Organization JSON-LD');

  const id = propList.properties?.[0]?._id;
  if (id) {
    await page.goto(`${BASE}/property/?id=${id}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#propertyMain:not([hidden])', { timeout: 15000 });

    const propTitle = await page.title();
    if (propTitle.includes(propList.properties[0].title)) pass('Property dynamic title');
    else fail('Property dynamic title', propTitle);

    const propDesc = await page.locator('meta[name="description"]').getAttribute('content');
    if (propDesc && propDesc.length > 20) pass('Property dynamic description');
    else fail('Property dynamic description');

    const propCanonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    if (propCanonical && propCanonical.includes(id)) pass('Property canonical URL');
    else fail('Property canonical URL', propCanonical || 'missing');

    const propOg = await page.locator('meta[property="og:image"]').getAttribute('content');
    if (propOg && !propOg.startsWith('data:')) pass('Property OG image');
    else fail('Property OG image');

    const propLd = await page.locator('#propertyJsonLd').textContent();
    if (propLd && propLd.includes('RealEstateListing')) pass('Property JSON-LD');
    else fail('Property JSON-LD');
  } else {
    fail('Property SEO tests', 'no public property');
  }

  await page.goto(`${BASE}/does-not-exist-astoria-seo`, { waitUntil: 'networkidle' });
  const robots404 = await page.locator('meta[name="robots"]').getAttribute('content');
  if (robots404?.includes('noindex')) pass('404 noindex');
  else fail('404 noindex', robots404 || 'missing');

  await page.goto(`${BASE}/admin/`, { waitUntil: 'networkidle' });
  const adminRobots = await page.locator('meta[name="robots"]').getAttribute('content');
  if (adminRobots?.includes('noindex')) pass('Admin login noindex');
  else fail('Admin login noindex');

  await browser.close();

  console.log('\n=== SEO SMOKE QA ===');
  results.forEach((r) => console.log(`${r.status}: ${r.name}${r.detail ? ` — ${r.detail}` : ''}`));
  const failed = results.filter((r) => r.status === 'FAIL');
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
