import { createIcons, Menu, X, MapPin, Maximize2 } from 'lucide';
import { formatPriceDisplay, getPropertyMetric, escapeHTML } from '../js/shared/format.js';
import { initSiteChrome, markActiveNav } from '../js/shared/site-chrome.js';
import { getSiteConfig, setMetaName, setLinkRel, setMetaProperty } from '../js/shared/seo.js';

const API = '/api';
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23151517'/%3E%3Cpath d='M160 210h480L400 90 160 210Zm64 32h64v192h-64V242Zm128 0h64v192h-64V242Zm128 0h64v192h-64V242ZM176 456h448v-48H176v48Z' fill='%23c8c8c2'/%3E%3C/svg%3E";

const grid = document.getElementById('propertiesGrid');
const meta = document.getElementById('resultsMeta');
const form = document.getElementById('propertiesFilterForm');

/** Price bounds from homepage discovery URL (minPrice / maxPrice). */
let filterMinPrice = '';
let filterMaxPrice = '';

function icons() {
  createIcons({ icons: { Menu, X, MapPin, Maximize2 }, attrs: { 'stroke-width': 1.5, width: 18, height: 18 } });
}

function buildQuery() {
  const params = new URLSearchParams();
  const type = document.getElementById('filterType')?.value;
  const search = document.getElementById('filterSearch')?.value?.trim();
  const beds = document.getElementById('filterBeds')?.value;
  const sort = document.getElementById('filterSort')?.value;
  if (type) params.set('type', type);
  if (search) params.set('search', search);
  if (beds) params.set('beds', beds);
  if (filterMinPrice) params.set('minPrice', filterMinPrice);
  if (filterMaxPrice) params.set('maxPrice', filterMaxPrice);
  if (sort) params.set('sort', sort);
  return params;
}

function renderCard(p) {
  const id = escapeHTML(p._id || '');
  const title = escapeHTML(p.title || 'ملک');
  const type = escapeHTML(p.type || '');
  const location = escapeHTML(p.location || '');
  const img = escapeHTML(p.image || p.images?.[0] || PLACEHOLDER);
  const price = escapeHTML(formatPriceDisplay(p.price));
  const metric = escapeHTML(getPropertyMetric(p));
  return `
    <a class="editorial-card reveal" href="/property/?id=${id}">
      <div class="editorial-card-media">
        <img src="${img}" alt="${title}${location ? ` — ${location}` : ''}" loading="lazy" width="800" height="600">
        ${type ? `<span class="editorial-card-type">${type}</span>` : ''}
      </div>
      <div class="editorial-card-body">
        <h2 class="editorial-card-title">${title}</h2>
        ${location ? `<p class="editorial-card-location"><i data-lucide="map-pin"></i> ${location}</p>` : ''}
        ${metric ? `<p class="editorial-card-metric"><i data-lucide="maximize-2"></i> ${metric}</p>` : ''}
        <p class="editorial-card-price">${price}</p>
        <span class="editorial-card-cta">مشاهده جزئیات ←</span>
      </div>
    </a>`;
}

async function loadProperties() {
  if (!grid) return;
  grid.setAttribute('aria-busy', 'true');
  grid.innerHTML = `<div class="skeleton-grid" aria-hidden="true"><div class="skeleton-tile"></div><div class="skeleton-tile"></div><div class="skeleton-tile"></div></div>`;

  try {
    const params = buildQuery();
    const res = await fetch(`${API}/properties?${params.toString()}`);
    if (!res.ok) throw new Error('failed');
    const data = await res.json();
    const list = data.properties || [];

    if (meta) {
      const n = list.length.toLocaleString('fa-IR');
      meta.innerHTML = `<span>${list.length ? `${n} اقامتگاه` : 'بدون نتیجه'}</span><span>مجموعه منتخب آستوریا</span>`;
    }

    if (!list.length) {
      grid.innerHTML = `<div class="page-state"><h3>نتیجه‌ای یافت نشد</h3><p>فیلتر فعلی ملکی نشان نداد. مشاوران آستوریا می‌توانند گزینه‌های نزدیک را پیشنهاد دهند.</p><a class="btn-primary" href="/contact/">درخواست مشاوره</a></div>`;
      return;
    }

    grid.innerHTML = list.map(renderCard).join('');
    icons();
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.remove('revealed');
    });
    const { initReveal } = await import('../js/shared/site-chrome.js');
    initReveal();
  } catch {
    grid.innerHTML = `<div class="page-state"><h3>بارگذاری املاک انجام نشد</h3><p>لطفاً دوباره تلاش کنید.</p><button type="button" class="btn-secondary" id="retryProps">تلاش مجدد</button></div>`;
    document.getElementById('retryProps')?.addEventListener('click', loadProperties);
  } finally {
    grid.removeAttribute('aria-busy');
  }
}

async function bootstrapSeo() {
  try {
    const site = await getSiteConfig();
    const origin = site.origin || window.location.origin;
    const title = 'املاک | آستوریا الیت استیتس';
    const desc = 'کشف مجموعه املاک منتخب آستوریا — ویلا، پنت‌هاوس و اقامتگاه‌های استثنایی.';
    document.title = title;
    setMetaName('description', desc);
    setLinkRel('canonical', `${origin}/properties/`);
    setMetaProperty('og:title', title);
    setMetaProperty('og:description', desc);
    setMetaProperty('og:url', `${origin}/properties/`);
  } catch (_) { /* optional */ }
}

initSiteChrome();
markActiveNav();
icons();
bootstrapSeo();

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('type') && document.getElementById('filterType')) {
  document.getElementById('filterType').value = urlParams.get('type');
}
if (urlParams.get('search') && document.getElementById('filterSearch')) {
  document.getElementById('filterSearch').value = urlParams.get('search');
}
if (urlParams.get('beds') && document.getElementById('filterBeds')) {
  document.getElementById('filterBeds').value = urlParams.get('beds');
}
if (urlParams.get('sort') && document.getElementById('filterSort')) {
  document.getElementById('filterSort').value = urlParams.get('sort');
}
filterMinPrice = urlParams.get('minPrice') || '';
filterMaxPrice = urlParams.get('maxPrice') || '';

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  loadProperties();
});

['filterType', 'filterBeds', 'filterSort'].forEach((id) => {
  document.getElementById(id)?.addEventListener('change', loadProperties);
});

let searchTimer;
document.getElementById('filterSearch')?.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadProperties, 320);
});

loadProperties();
