const Property = require('../models/Property');
const { buildPublicPropertyQuery } = require('../utils/validate');
const { getSiteOrigin, getPropertyUrl } = require('../config/site');

const SITEMAP_CACHE_MS = 60 * 60 * 1000;
let sitemapCache = { xml: null, expiresAt: 0 };

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatLastmod(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

async function buildSitemapXml(origin) {
  const properties = await Property.find(buildPublicPropertyQuery())
    .select('_id updatedAt')
    .sort({ sortOrder: -1, updatedAt: -1 })
    .limit(5000)
    .lean();

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${escapeXml(origin)}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  ];

  properties.forEach((property) => {
    const loc = escapeXml(getPropertyUrl(origin, property._id));
    const lastmod = formatLastmod(property.updatedAt);
    lines.push(`  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.8</priority></url>`);
  });

  lines.push('</urlset>');
  return lines.join('\n');
}

function fallbackSitemap(origin) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${escapeXml(origin)}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    '</urlset>',
  ].join('\n');
}

const getSitemap = async (req, res) => {
  const origin = getSiteOrigin(req);
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');

  try {
    const now = Date.now();
    if (sitemapCache.xml && sitemapCache.expiresAt > now) {
      return res.send(sitemapCache.xml);
    }

    const xml = await buildSitemapXml(origin);
    sitemapCache = { xml, expiresAt: now + SITEMAP_CACHE_MS };
    return res.send(xml);
  } catch (error) {
    console.error('[sitemap]', error.message);
    return res.status(200).send(fallbackSitemap(origin));
  }
};

const getRobots = (req, res) => {
  const origin = getSiteOrigin(req);
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');

  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(body);
};

module.exports = { getSitemap, getRobots };
