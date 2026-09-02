function normalizeOrigin(value = '') {
  return String(value).trim().replace(/\/$/, '');
}

function getSiteOrigin(req) {
  if (process.env.SITE_ORIGIN) {
    return normalizeOrigin(process.env.SITE_ORIGIN);
  }
  if (req) {
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
    const host = req.get('x-forwarded-host') || req.get('host');
    if (host) return normalizeOrigin(`${protocol}://${host}`);
  }
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

function getPropertyPath(id) {
  return `/property/?id=${encodeURIComponent(String(id))}`;
}

function getPropertyUrl(origin, id) {
  return `${normalizeOrigin(origin)}${getPropertyPath(id)}`;
}

function absoluteAssetUrl(origin, assetPath) {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  const path = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${normalizeOrigin(origin)}${path}`;
}

module.exports = {
  normalizeOrigin,
  getSiteOrigin,
  getPropertyPath,
  getPropertyUrl,
  absoluteAssetUrl,
};
