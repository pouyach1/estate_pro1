import { formatPriceDisplay, formatArea, formatBedrooms } from './format.js';

let siteConfigCache = null;

export async function getSiteConfig() {
  if (siteConfigCache) return siteConfigCache;
  try {
    const res = await fetch('/api/site');
    if (res.ok) {
      siteConfigCache = await res.json();
      return siteConfigCache;
    }
  } catch (_) { /* offline */ }
  siteConfigCache = {
    origin: window.location.origin,
    name: 'آستوریا الیت استیتس',
    nameEn: 'ASTORIA ELITE ESTATES',
    defaultOgImage: null,
  };
  return siteConfigCache;
}

export function propertyPath(id) {
  return `/property/?id=${encodeURIComponent(String(id))}`;
}

export function propertyUrl(origin, id) {
  const base = String(origin || window.location.origin).replace(/\/$/, '');
  return `${base}${propertyPath(id)}`;
}

export function absoluteAssetUrl(origin, assetPath) {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  const base = String(origin || window.location.origin).replace(/\/$/, '');
  const path = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${base}${path}`;
}

export function setMetaName(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

export function setMetaProperty(property, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
}

export function setLinkRel(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function pruneStructuredData(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) {
    const items = value.map(pruneStructuredData).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }
  if (typeof value === 'object') {
    const out = {};
    Object.entries(value).forEach(([key, val]) => {
      const cleaned = pruneStructuredData(val);
      if (cleaned !== undefined) out[key] = cleaned;
    });
    return Object.keys(out).length ? out : undefined;
  }
  return value;
}

export function setJsonLd(id, data) {
  const cleaned = pruneStructuredData(data);
  if (!cleaned) return;
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(cleaned);
}

export function buildPropertyTitle(property) {
  const title = property?.title || 'ملک';
  const location = property?.location ? ` — ${property.location}` : '';
  return `${title}${location} | آستوریا الیت استیتس`;
}

export function buildPropertyDescription(property) {
  if (!property) return 'جزئیات ملک در آستوریا الیت استیتس';

  if (property.description?.trim()) {
    const lead = `${property.title}${property.location ? ` در ${property.location}` : ''}`;
    const snippet = property.description.trim().replace(/\s+/g, ' ');
    return `${lead}. ${snippet}`.slice(0, 160);
  }

  const parts = [];
  if (property.type) parts.push(property.type);
  if (property.location) parts.push(property.location);
  const area = formatArea(property.area);
  const beds = formatBedrooms(property.beds);
  if (area) parts.push(area);
  if (beds) parts.push(beds);
  const price = formatPriceDisplay(property.price);
  if (price && price !== 'تماس برای اطلاع از قیمت') parts.push(price);

  return `${property.title} — ${parts.join(' · ')} | آستوریا الیت استیتس`.slice(0, 160);
}

export function applyPropertySeo(property, site, propertyId) {
  if (!property) return;

  const origin = site?.origin || window.location.origin;
  const url = propertyUrl(origin, propertyId);
  const title = buildPropertyTitle(property);
  const description = buildPropertyDescription(property);
  const image = absoluteAssetUrl(origin, property.image || property.images?.[0] || site?.defaultOgImage);

  document.title = title;
  setMetaName('description', description);
  setMetaName('robots', 'index, follow');
  setLinkRel('canonical', url);

  setMetaProperty('og:type', 'website');
  setMetaProperty('og:site_name', site?.name || 'آستوریا الیت استیتس');
  setMetaProperty('og:locale', 'fa_IR');
  setMetaProperty('og:title', title);
  setMetaProperty('og:description', description);
  setMetaProperty('og:url', url);
  if (image) setMetaProperty('og:image', image);

  setMetaName('twitter:card', image ? 'summary_large_image' : 'summary');
  setMetaName('twitter:title', title);
  setMetaName('twitter:description', description);
  if (image) setMetaName('twitter:image', image);

  const listing = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || undefined,
    url,
    image: image ? [image] : undefined,
    offers: property.price ? {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'IRR',
      availability: property.status === 'reserved'
        ? 'https://schema.org/LimitedAvailability'
        : 'https://schema.org/InStock',
    } : undefined,
    address: property.location ? {
      '@type': 'PostalAddress',
      addressLocality: property.location,
      addressCountry: 'IR',
    } : undefined,
    floorSize: property.area ? {
      '@type': 'QuantitativeValue',
      value: property.area,
      unitCode: 'MTK',
    } : undefined,
    numberOfRooms: property.beds ? property.beds : undefined,
  };

  setJsonLd('propertyJsonLd', listing);
}

export async function applyHomepageSeo(site) {
  const origin = site?.origin || window.location.origin;
  const title = 'آستوریا الیت استیتس | املاک لوکس و مشاوره اختصاصی';
  const description = 'مجموعه املاک منتخب آستوریا — ویلا، پنت‌هاوس و اقامتگاه‌های استثنایی با مشاوره خصوصی و بازدید اختصاصی.';
  const image = absoluteAssetUrl(origin, site?.defaultOgImage);

  document.title = title;
  setMetaName('description', description);
  setMetaName('robots', 'index, follow');
  setLinkRel('canonical', `${origin}/`);

  setMetaProperty('og:type', 'website');
  setMetaProperty('og:site_name', site?.name || 'آستوریا الیت استیتس');
  setMetaProperty('og:locale', 'fa_IR');
  setMetaProperty('og:title', title);
  setMetaProperty('og:description', description);
  setMetaProperty('og:url', `${origin}/`);
  if (image) setMetaProperty('og:image', image);

  setMetaName('twitter:card', image ? 'summary_large_image' : 'summary');
  setMetaName('twitter:title', title);
  setMetaName('twitter:description', description);
  if (image) setMetaName('twitter:image', image);

  const org = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: site?.name || 'آستوریا الیت استیتس',
    alternateName: site?.nameEn || 'ASTORIA ELITE ESTATES',
    url: origin,
    logo: image || undefined,
    telephone: site?.contactPhone || undefined,
    email: site?.contactEmail || undefined,
    address: site?.contactAddress ? {
      '@type': 'PostalAddress',
      streetAddress: site.contactAddress,
      addressCountry: 'IR',
    } : undefined,
  };

  setJsonLd('organizationJsonLd', org);
}

export function applyNoIndex() {
  setMetaName('robots', 'noindex, nofollow');
}
