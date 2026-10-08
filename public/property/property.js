/* ==============================================
   PROPERTY DETAIL — Flagship Experience
   ============================================== */

import { createIcons, Bed, Bath, Maximize2, Home, Check, Heart, Phone, Mail, Calendar, User, ChevronRight, ChevronLeft, ArrowUp, ArrowRight, X, Menu, Car, Warehouse, ShieldCheck, Camera, Video, Waves, Thermometer, Dumbbell, Palette, Users, Film, Building, ArrowUpDown, MapPin, Share2, Eye } from 'lucide';
import { formatPrice, formatPriceDisplay, escapeHTML } from '../js/shared/format.js';
import { getSiteConfig, applyPropertySeo, applyNoIndex } from '../js/shared/seo.js';

const API = '/api';
const FAVORITES_KEY = 'astoria_favorites';
const iconSet = {
  Bed, Bath, Maximize2, Home, Check, Heart, Phone, Mail, Calendar, User, ChevronRight, ChevronLeft,
  ArrowUp, ArrowRight, X, Menu, Car, Warehouse, ShieldCheck, Camera, Video, Waves, Thermometer,
  Dumbbell, Palette, Users, Film, Building, ArrowUpDown, MapPin, Share2, Eye,
};
window.refreshLucideIcons = () => {
  createIcons({ icons: iconSet, attrs: { 'stroke-width': 1.5, width: 20, height: 20 } });
};
const refreshIcons = () => window.refreshLucideIcons();
const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get('id');

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23070707'/%3E%3Cpath d='M160 210h480L400 90 160 210Zm64 32h64v192h-64V242Zm128 0h64v192h-64V242Zm128 0h64v192h-64V242ZM176 456h448v-48H176v48Z' fill='%23c8c8c2'/%3E%3Ctext x='400' y='430' text-anchor='middle' fill='%2370706c' font-family='sans-serif' font-size='20'%3EASTORIA ELITE ESTATES%3C/text%3E%3C/svg%3E";

let currentImageIndex = 0;
let propertyImages = [];
let propertyData = null;
let activeBgLayer = 'a';
let assignedAgent = null;

function getPropertyImages(property) {
  const images = [];
  if (Array.isArray(property.images)) {
    property.images.forEach((img) => {
      if (img && !images.includes(img)) images.push(img);
    });
  }
  if (property.image && !images.includes(property.image)) {
    images.unshift(property.image);
  }
  return images.length ? images : [PLACEHOLDER_IMAGE];
}

function featureIsVisible(field, value) {
  if (value === true) return true;
  if (typeof value === 'number' && value > 0) return true;
  if (typeof value === 'string' && value.trim().length > 0) return true;
  return false;
}

function featureLabel(field, value) {
  if (typeof value === 'number' && field.field_type === 'number') {
    return `${value.toLocaleString('fa-IR')} ${field.label_fa}`;
  }
  if (typeof value === 'string' && field.field_type === 'select') {
    return `${field.label_fa}: ${value}`;
  }
  return field.label_fa;
}

function setStatValue(key, value, visible = true) {
  document.querySelectorAll(`[data-stat="${key}"]`).forEach((el) => {
    el.textContent = value;
  });
  document.querySelectorAll(`[data-stat-wrap="${key}"]`).forEach((el) => {
    el.style.display = visible ? '' : 'none';
  });
}

function initDescriptionToggle() {
  const description = document.getElementById('propertyDescription');
  const toggle = document.getElementById('propertyDescriptionToggle');
  if (!description || !toggle) return;

  const checkLength = () => {
    description.classList.remove('is-expanded');
    const lineHeight = parseFloat(getComputedStyle(description).lineHeight) || 22;
    const needsToggle = description.scrollHeight > lineHeight * 4 + 4;
    toggle.hidden = !needsToggle;
    toggle.textContent = 'ادامه توضیحات';
  };

  toggle.addEventListener('click', () => {
    const expanded = description.classList.toggle('is-expanded');
    toggle.textContent = expanded ? 'بستن توضیحات' : 'ادامه توضیحات';
  });

  checkLength();
  window.addEventListener('resize', checkLength);
}

function setPageMode(mode) {
  const heroWrap = document.getElementById('propertyHeroWrap');
  const breadcrumb = document.querySelector('.property-breadcrumb');
  const identity = document.getElementById('propertySummary');
  const mobilePanel = document.getElementById('propertyMobilePanel');
  const main = document.getElementById('propertyMain');
  const error = document.getElementById('propertyErrorState');

  const hideContent = mode === 'error' || mode === 'loading';
  if (heroWrap) heroWrap.hidden = mode === 'error';
  if (breadcrumb) breadcrumb.hidden = mode === 'error';
  if (identity) identity.hidden = hideContent;
  if (mobilePanel) mobilePanel.hidden = hideContent;
  if (main) main.hidden = hideContent;
  if (error) error.hidden = mode !== 'error';
}

function showErrorState(message) {
  setPageMode('error');
  applyNoIndex();
  const errorTitle = document.getElementById('propertyErrorTitle');
  const errorMessage = document.getElementById('propertyErrorMessage');
  if (errorTitle) errorTitle.textContent = message || 'ملک موردنظر یافت نشد';
  if (errorMessage) {
    errorMessage.textContent = message === 'ملک موردنظر یافت نشد'
      ? 'ممکن است این ملک حذف شده یا آدرس آن اشتباه باشد.'
      : 'لطفاً چند لحظه دیگر دوباره تلاش کنید.';
  }
}

function setFavoriteUI(liked) {
  document.querySelectorAll('#btnFavorite, #btnFavoriteTop').forEach((btn) => {
    if (!btn) return;
    btn.classList.toggle('liked', liked);
    if (btn.id === 'btnFavorite') {
      btn.innerHTML = liked
        ? '<i data-lucide="heart"></i> حذف از علاقه‌مندی‌ها'
        : '<i data-lucide="heart"></i> افزودن به علاقه‌مندی‌ها';
    }
  });
  refreshIcons();
}

function toggleFavorite() {
  if (!propertyId) return;
  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  const isLiked = favorites.includes(propertyId);

  if (isLiked) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.filter((id) => id !== propertyId)));
    setFavoriteUI(false);
    showNotification('از علاقه‌مندی‌ها حذف شد.');
  } else {
    favorites.push(propertyId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    setFavoriteUI(true);
    showNotification('به علاقه‌مندی‌ها اضافه شد.');
  }
}

async function loadProperty() {
  setPageMode('loading');

  if (!propertyId) {
    showErrorState('ملک موردنظر یافت نشد');
    return;
  }

  try {
    const res = await fetch(`${API}/properties/${encodeURIComponent(propertyId)}`);
    const data = await res.json();

    if (!res.ok || !data || data.message === 'ملک یافت نشد') {
      showErrorState('ملک موردنظر یافت نشد');
      return;
    }

    propertyData = data;
    propertyImages = getPropertyImages(propertyData);
    currentImageIndex = 0;
    activeBgLayer = 'a';

    const site = await getSiteConfig();
    setPageMode('content');
    renderProperty(site);
    loadSimilarProperties();
    loadAgent();
    initHeroSwipe();
  } catch (error) {
    console.error('Error loading property:', error);
    showErrorState('بارگذاری اطلاعات ملک با مشکل مواجه شد.');
  }
}

async function updatePropertySeo(p, site) {
  applyPropertySeo(p, site, propertyId);
}

function yearBuiltFromAge(age) {
  if (age == null || age === '' || Number(age) < 0) return null;
  return new Date().getFullYear() - Number(age);
}

function statusLabel(status) {
  const map = {
    available: 'مجموعه خصوصی',
    reserved: 'رزرو شده',
    sold: 'فروخته شده',
    rented: 'اجاره داده شده',
  };
  return map[status] || 'مجموعه خصوصی';
}

function renderProperty(site) {
  const p = propertyData;
  if (!p) return;

  updatePropertySeo(p, site);

  const typeBadge = document.getElementById('propertyTypeBadge');
  if (typeBadge) typeBadge.textContent = p.type || 'اقامتگاه';

  document.getElementById('propertyTitle').textContent = p.title || 'ملک';

  const locText = document.getElementById('propertyLocationText');
  const location = p.location || 'موقعیت نامشخص';
  if (locText) locText.textContent = location;

  const priceDisplay = formatPriceDisplay(p.price);
  const priceEl = document.getElementById('propertyPrice');
  if (priceEl) priceEl.textContent = priceDisplay;
  const sidebarPrice = document.getElementById('sidebarPrice');
  if (sidebarPrice) sidebarPrice.textContent = priceDisplay;
  document.getElementById('propertyDescription').textContent = p.description || 'توضیحات بیشتری برای این ملک ثبت نشده است.';

  const tourSubtitle = document.getElementById('tourModalProperty');
  if (tourSubtitle) tourSubtitle.textContent = p.title || '';

  const parking = p.features?.common?.parking;
  const metaParts = [];
  if (p.beds > 0) metaParts.push(`${Number(p.beds).toLocaleString('fa-IR')} خواب`);
  if (p.baths > 0) metaParts.push(`${Number(p.baths).toLocaleString('fa-IR')} سرویس`);
  if (p.area > 0) metaParts.push(`${Number(p.area).toLocaleString('fa-IR')} متر مربع`);
  if (parking > 0) metaParts.push(`${Number(parking).toLocaleString('fa-IR')} پارکینگ`);
  const heroMeta = document.getElementById('propertyHeroMeta');
  if (heroMeta) heroMeta.textContent = metaParts.join(' · ');

  setStatValue('area', (p.area || 0).toLocaleString('fa-IR'), (p.area || 0) > 0);
  setStatValue('beds', (p.beds || 0).toLocaleString('fa-IR'), p.beds > 0);
  setStatValue('baths', (p.baths || 0).toLocaleString('fa-IR'), p.baths > 0);
  setStatValue('type', p.type || '—', !!p.type);
  setStatValue('parking', parking > 0 ? parking.toLocaleString('fa-IR') : '—', parking > 0);

  const hasMultiple = propertyImages.length > 1;
  document.querySelector('.property-hero-nav')?.classList.toggle('is-hidden', !hasMultiple);
  document.getElementById('imageDots')?.classList.toggle('is-hidden', !hasMultiple);
  document.getElementById('filmstripWrap')?.toggleAttribute('hidden', !hasMultiple);

  const firstImg = propertyImages[0];
  if (firstImg && !String(firstImg).startsWith('data:')) {
    let preload = document.querySelector('link[data-property-hero-preload]');
    if (!preload) {
      preload = document.createElement('link');
      preload.rel = 'preload';
      preload.as = 'image';
      preload.setAttribute('data-property-hero-preload', 'true');
      document.head.appendChild(preload);
    }
    preload.href = firstImg;
  }

  updateHeroImage(0, false);
  renderFilmstrip();
  renderDots();
  renderOverview(p);
  renderNumbers(p);
  renderDossier(p);
  renderFeatures(p);
  renderPhotoStory(p);
  renderLocationBlock(p);
  updateMobileCta();
  initDescriptionToggle();
  initDossierInteractions();

  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  setFavoriteUI(propertyId && favorites.includes(propertyId));

  refreshIcons();
}

function renderOverview(p) {
  const el = document.getElementById('propertyOverview');
  if (!el) return;
  const parking = p.features?.common?.parking;
  const land = p.features?.specific?.yard_area || p.features?.specific?.building_area;
  const year = yearBuiltFromAge(p.age);
  const rows = [
    { label: 'نوع ملک', value: p.type || '—' },
    { label: 'خواب', value: p.beds > 0 ? Number(p.beds).toLocaleString('fa-IR') : '—' },
    { label: 'سرویس', value: p.baths > 0 ? Number(p.baths).toLocaleString('fa-IR') : '—' },
    { label: 'زیربنا', value: p.area > 0 ? `${Number(p.area).toLocaleString('fa-IR')} متر` : '—' },
    { label: 'زمین / حیاط', value: land > 0 ? `${Number(land).toLocaleString('fa-IR')} متر` : '—' },
    { label: 'سال ساخت', value: year ? year.toLocaleString('fa-IR') : '—' },
    { label: 'پارکینگ', value: parking > 0 ? `${Number(parking).toLocaleString('fa-IR')} خودرو` : '—' },
    { label: 'وضعیت', value: statusLabel(p.status) },
  ].filter((row) => row.value !== '—');

  el.innerHTML = rows.map((row) => `
    <div class="pd-overview-row">
      <span class="pd-overview-label">${escapeHTML(row.label)}</span>
      <span class="pd-overview-value">${escapeHTML(String(row.value))}</span>
    </div>`).join('');
}

function renderNumbers(p) {
  const el = document.getElementById('propertyNumbers');
  if (!el) return;
  const parking = p.features?.common?.parking;
  const land = p.features?.specific?.yard_area || p.features?.specific?.building_area;
  const year = yearBuiltFromAge(p.age);
  const items = [
    p.area > 0 && { num: Number(p.area).toLocaleString('fa-IR'), label: 'متر مربع زیربنا' },
    land > 0 && { num: Number(land).toLocaleString('fa-IR'), label: 'متر مربع زمین' },
    p.beds > 0 && { num: Number(p.beds).toLocaleString('fa-IR'), label: 'خواب' },
    p.baths > 0 && { num: Number(p.baths).toLocaleString('fa-IR'), label: 'سرویس' },
    year && { num: year.toLocaleString('fa-IR'), label: 'سال ساخت' },
    parking > 0 && { num: Number(parking).toLocaleString('fa-IR'), label: 'پارکینگ خصوصی' },
  ].filter(Boolean);

  el.innerHTML = items.map((item) => `
    <div class="pd-number-item reveal">
      <strong class="pd-number-value">${escapeHTML(item.num)}</strong>
      <span class="pd-number-label">${escapeHTML(item.label)}</span>
    </div>`).join('') || '<p class="property-empty-note">شاخص عددی ثبت نشده است.</p>';
}

function dossierGroups(property) {
  const f = property.features || {};
  const c = f.common || {};
  const s = f.specific || {};
  const l = f.luxury || {};
  const year = yearBuiltFromAge(property.age);

  const push = (arr, label, value) => {
    if (value === true) arr.push({ label, value: 'دارد' });
    else if (typeof value === 'number' && value > 0) arr.push({ label, value: value.toLocaleString('fa-IR') });
    else if (typeof value === 'string' && value.trim()) arr.push({ label, value: value.trim() });
  };

  const architecture = [];
  push(architecture, 'سبک / نوع', property.type);
  if (year) push(architecture, 'سال ساخت', year);
  push(architecture, 'طبقه', s.floor);
  push(architecture, 'کل طبقات', s.total_floors);
  push(architecture, 'سقف بلند', s.high_ceiling);
  push(architecture, 'مصالح لوکس', s.luxury_materials);

  const interior = [];
  push(interior, 'زیربنا (متر)', property.area);
  push(interior, 'خواب', property.beds);
  push(interior, 'سرویس', property.baths);
  push(interior, 'کف‌پوش', c.flooring);
  push(interior, 'کابینت', c.cabinet);
  push(interior, 'آشپزخانه اپن', s.open_kitchen);
  push(interior, 'خواب مستر', s.master_bedroom);
  push(interior, 'سقف کاذب', s.false_ceiling);

  const exterior = [];
  push(exterior, 'متراژ حیاط', s.yard_area);
  push(exterior, 'باغچه / باغ', s.garden || s.landscaping || s.fruit_trees);
  push(exterior, 'استخر', l.pool || s.pool_private || s.swimming_pool);
  push(exterior, 'تراس / بالکن', s.balcony || s.roof_garden || l.roof_garden);
  push(exterior, 'باربیکیو', s.bbq);
  push(exterior, 'پارکینگ', c.parking);

  const views = [];
  push(views, 'ویو پانوراما', s.panoramic_view);
  if (String(property.location || '').includes('ساحل') || String(property.location || '').includes('کیش') || String(property.location || '').includes('رامسر')) {
    views.push({ label: 'نزدیکی به دریا', value: 'موقعیت ساحلی' });
  }
  if (String(property.location || '').includes('نیاوران') || String(property.location || '').includes('الهیه') || String(property.location || '').includes('فرمانیه')) {
    views.push({ label: 'چشم‌انداز شهری', value: 'شمال تهران' });
  }

  const technology = [];
  push(technology, 'خانه هوشمند', c.smart_home);
  push(technology, 'نگهبانی', c.security);
  push(technology, 'دوربین', c.cctv);
  push(technology, 'گرمایش', c.heating);
  push(technology, 'سرمایش', c.cooling);
  push(technology, 'آیفون تصویری', c.video_intercom);
  push(technology, 'آسانسور', c.elevator || s.private_elevator);

  const lifestyle = [];
  push(lifestyle, 'سالن ورزشی', l.gym);
  push(lifestyle, 'سینمای خانگی', l.home_cinema);
  push(lifestyle, 'سونا / جکوزی', l.sauna);
  push(lifestyle, 'لابی لوکس', l.luxury_lobby);
  push(lifestyle, 'اتاق جلسه', l.meeting_room);
  push(lifestyle, 'روف‌گاردن', l.roof_garden || s.roof_garden);

  return [
    { id: 'architecture', title: 'معماری', items: architecture },
    { id: 'interior', title: 'فضای داخلی', items: interior },
    { id: 'exterior', title: 'فضای بیرونی', items: exterior },
    { id: 'views', title: 'چشم‌انداز', items: views },
    { id: 'technology', title: 'فناوری', items: technology },
    { id: 'lifestyle', title: 'سبک زندگی', items: lifestyle },
  ].filter((g) => g.items.length);
}

function renderDossier(property) {
  const el = document.getElementById('propertyDossier');
  if (!el) return;
  const groups = dossierGroups(property);
  if (!groups.length) {
    el.innerHTML = '<p class="property-empty-note">جزئیات بیشتری برای این ملک ثبت نشده است.</p>';
    return;
  }
  el.innerHTML = groups.map((group, index) => `
    <details class="pd-dossier-group" ${index === 0 ? 'open' : ''}>
      <summary class="pd-dossier-summary">
        <span>${escapeHTML(group.title)}</span>
        <span class="pd-dossier-count">${group.items.length.toLocaleString('fa-IR')}</span>
      </summary>
      <div class="pd-dossier-body">
        ${group.items.map((item) => `
          <div class="pd-spec-row">
            <span class="pd-spec-label">${escapeHTML(item.label)}</span>
            <span class="pd-spec-value">${escapeHTML(String(item.value))}</span>
          </div>`).join('')}
      </div>
    </details>`).join('');
}

function initDossierInteractions() {
  document.querySelectorAll('.pd-dossier-group').forEach((group) => {
    group.addEventListener('toggle', () => {
      if (!group.open) return;
      document.querySelectorAll('.pd-dossier-group').forEach((other) => {
        if (other !== group) other.open = false;
      });
    });
  });
}

const STORY_LABELS = [
  { num: '۰۱', title: 'ورود' },
  { num: '۰۲', title: 'زندگی' },
  { num: '۰۳', title: 'جزئیات' },
  { num: '۰۴', title: 'بیرون' },
  { num: '۰۵', title: 'شب' },
];

function renderPhotoStory(p) {
  const el = document.getElementById('propertyPhotoStory');
  if (!el) return;
  const images = propertyImages.filter((src) => src && !String(src).startsWith('data:'));
  if (!images.length) {
    el.innerHTML = '<p class="property-empty-note">گالری تصویری برای این ملک موجود نیست.</p>';
    return;
  }
  el.innerHTML = images.map((src, i) => {
    const label = STORY_LABELS[i] || { num: String(i + 1).padStart(2, '0'), title: 'نما' };
    const size = i === 0 || i === 3 ? 'pd-story-item--wide' : i === 2 ? 'pd-story-item--tall' : '';
    return `
      <button type="button" class="pd-story-item ${size}" data-image-index="${i}" aria-label="${escapeHTML(label.title)}">
        <span class="pd-story-media" style="background-image:url('${escapeHTML(src)}')"></span>
        <span class="pd-story-caption"><em>${escapeHTML(label.num)}</em> ${escapeHTML(label.title)}</span>
      </button>`;
  }).join('');
}

function renderLocationBlock(p) {
  const el = document.getElementById('propertyLocationBlock');
  if (!el) return;
  const location = p.location || 'موقعیت نامشخص';
  const parts = String(location).split('،').map((s) => s.trim()).filter(Boolean);
  const primary = parts[0] || location;
  const secondary = parts.slice(1).join('، ') || 'ایران';

  const hints = [];
  if (/تهران|نیاوران|الهیه|فرمانیه|ولنجک|زعفرانیه|آجودانیه/.test(location)) {
    hints.push({ label: 'مرکز شهر', note: 'دسترسی شهری' });
    hints.push({ label: 'فرودگاه', note: 'دسترسی بین‌المللی' });
    hints.push({ label: 'مدارس بین‌المللی', note: 'نزدیکی نسبی' });
  } else if (/لواسان|کردان|چالوس/.test(location)) {
    hints.push({ label: 'طبیعت', note: 'فضای سبز پیرامونی' });
    hints.push({ label: 'تهران', note: 'فاصله مناسب آخر هفته' });
    hints.push({ label: 'آرامش', note: 'حریم خصوصی' });
  } else if (/رامسر|کیش|ساحل/.test(location)) {
    hints.push({ label: 'ساحل', note: 'نزدیکی به دریا' });
    hints.push({ label: 'تفریح', note: 'مراکز اقامتی' });
    hints.push({ label: 'آب‌وهوا', note: 'اقامت فصلی' });
  } else {
    hints.push({ label: 'موقعیت', note: 'منطقه منتخب' });
    hints.push({ label: 'دسترسی', note: 'بر اساس موقعیت ملک' });
  }

  el.innerHTML = `
    <div class="pd-location-main">
      <p class="pd-location-primary">${escapeHTML(primary)}</p>
      <p class="pd-location-secondary">${escapeHTML(secondary)}</p>
      <p class="pd-location-full">${escapeHTML(location)}</p>
    </div>
    <div class="pd-location-hints">
      ${hints.map((h) => `
        <div class="pd-location-hint">
          <strong>${escapeHTML(h.label)}</strong>
          <span>${escapeHTML(h.note)}</span>
        </div>`).join('')}
    </div>
    <p class="pd-location-note">فاصله‌ها تقریبی و بر اساس موقعیت کلی ملک هستند — نه زمان سفر دقیق.</p>`;
}

function updateMobileCta() {
  const bar = document.getElementById('propertyMobileCta');
  const priceEl = document.getElementById('mobileCtaPrice');
  if (!bar || !priceEl || !propertyData) return;
  priceEl.textContent = formatPriceDisplay(propertyData.price);
  bar.classList.add('visible');
  bar.setAttribute('aria-hidden', 'false');
  document.body.classList.add('has-mobile-cta');
}

function getBgEl(layer) {
  return document.getElementById(layer === 'a' ? 'heroBgA' : 'heroBgB');
}

function updateHeroImage(index, animate = true) {
  if (!propertyImages.length) return;

  currentImageIndex = ((index % propertyImages.length) + propertyImages.length) % propertyImages.length;
  const src = propertyImages[currentImageIndex];
  const nextLayer = activeBgLayer === 'a' ? 'b' : 'a';
  const currentEl = getBgEl(activeBgLayer);
  const nextEl = getBgEl(nextLayer);

  if (nextEl) {
    nextEl.style.backgroundImage = `url("${src}")`;
    if (animate) {
      nextEl.style.opacity = '1';
      if (currentEl) currentEl.style.opacity = '0';
      setTimeout(() => { activeBgLayer = nextLayer; }, 450);
    } else {
      if (currentEl) currentEl.style.opacity = '0';
      nextEl.style.opacity = '1';
      activeBgLayer = nextLayer;
    }
  }

  document.querySelectorAll('.hero-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentImageIndex);
  });

  document.querySelectorAll('.filmstrip-thumb').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === currentImageIndex);
    if (i === currentImageIndex) thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });

  const counter = document.getElementById('imageCounter');
  if (counter) {
    counter.textContent = propertyImages.length > 1
      ? `${(currentImageIndex + 1).toLocaleString('fa-IR')} / ${propertyImages.length.toLocaleString('fa-IR')}`
      : '';
  }

  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxCounter = document.getElementById('lightboxCounter');
  if (lightboxImg && !document.getElementById('propertyLightbox')?.hidden) {
    lightboxImg.style.backgroundImage = `url("${src}")`;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${(currentImageIndex + 1).toLocaleString('fa-IR')} / ${propertyImages.length.toLocaleString('fa-IR')}`;
    }
  }
}

function renderDots() {
  const dotsContainer = document.getElementById('imageDots');
  if (!dotsContainer || propertyImages.length <= 1) return;

  dotsContainer.innerHTML = propertyImages.map((_, i) => `
    <button type="button" class="hero-dot ${i === currentImageIndex ? 'active' : ''}" data-image-index="${i}" aria-label="مشاهده تصویر ${i + 1}"></button>
  `).join('');
}

function renderFilmstrip() {
  const filmstrip = document.getElementById('propertyFilmstrip');
  if (!filmstrip || propertyImages.length <= 1) return;

  filmstrip.innerHTML = propertyImages.map((img, i) => `
    <button type="button" class="filmstrip-thumb ${i === currentImageIndex ? 'active' : ''}" style="background-image:url('${escapeHTML(img)}')" data-image-index="${i}" aria-label="مشاهده تصویر ${i + 1}" role="tab" aria-selected="${i === currentImageIndex}"></button>
  `).join('');
}

function renderAgentCard(agent, container) {
  if (!container || !agent) return;
  const photo = escapeHTML(agent.photo || '');
  const name = escapeHTML(agent.name || 'مشاور آستوریا');
  const title = escapeHTML(agent.title || 'مشاور املاک');
  const bio = escapeHTML(agent.bio || 'مشاور اختصاصی آستوریا برای معرفی دقیق و بازدید خصوصی.');
  const phone = escapeHTML(agent.phone || '');
  const email = escapeHTML(agent.email || '');
  const wa = phone ? phone.replace(/\D/g, '') : '';

  container.innerHTML = `
    <article class="pd-advisor">
      <div class="pd-advisor-portrait" ${photo ? `style="background-image:url('${photo}')"` : ''} role="img" aria-label="${name}">
        ${photo ? '' : '<i data-lucide="user"></i>'}
      </div>
      <div class="pd-advisor-body">
        <p class="pd-advisor-kicker">مشاور اختصاصی</p>
        <h3 class="pd-advisor-name">${name}</h3>
        <p class="pd-advisor-role">${title}</p>
        <p class="pd-advisor-bio">${bio}</p>
        <div class="pd-advisor-actions">
          ${phone ? `<a href="tel:${phone}" class="pd-advisor-link"><i data-lucide="phone"></i> تماس</a>` : ''}
          ${wa ? `<a href="https://wa.me/${wa}" class="pd-advisor-link" target="_blank" rel="noopener">WhatsApp</a>` : ''}
          ${email ? `<a href="mailto:${email}" class="pd-advisor-link"><i data-lucide="mail"></i> ایمیل</a>` : ''}
          <button type="button" class="btn-primary" id="btnAdvisorTour">درخواست بازدید خصوصی</button>
        </div>
      </div>
    </article>`;
  document.getElementById('btnAdvisorTour')?.addEventListener('click', openTourModal);
  refreshIcons();
}

async function loadAgent() {
  const sidebar = document.getElementById('agentSidebarCard');
  const mobile = document.getElementById('agentMobileCard');
  const mobileSection = document.getElementById('agentMobileSection');

  try {
    const res = await fetch(`${API}/agents`);
    const data = await res.json();
    const agents = (data.agents || []).filter((a) => a.isActive !== false);

    if (!agents.length) {
      const fallback = '<p class="property-empty-note">اطلاعات مشاور به زودی در دسترس خواهد بود.</p>';
      if (sidebar) sidebar.innerHTML = fallback;
      return;
    }

    const idx = propertyId
      ? [...propertyId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % agents.length
      : 0;
    assignedAgent = agents[idx];

    if (sidebar) renderAgentCard(assignedAgent, sidebar);
    if (mobile) {
      renderAgentCard(assignedAgent, mobile);
      mobileSection?.removeAttribute('hidden');
    }
  } catch (e) {
    if (sidebar) sidebar.innerHTML = '<p class="property-empty-note">بارگذاری اطلاعات مشاور انجام نشد.</p>';
  }
}

function renderFeatures(property) {
  const container = document.getElementById('propertyFeatures');
  if (!container) return;

  if (!property.features || typeof getFeaturesForType !== 'function') {
    container.innerHTML = '<p class="property-features-empty">امکانات ثبت‌شده‌ای برای این ملک موجود نیست.</p>';
    return;
  }

  const config = getFeaturesForType(property.type);
  const data = property.features;
  const categories = [
    { key: 'common', title: FEATURE_CATEGORIES.common, fields: config.common },
    { key: 'specific', title: FEATURE_CATEGORIES.specific, fields: config.specific },
    { key: 'luxury', title: FEATURE_CATEGORIES.luxury, fields: config.luxury },
  ];

  const html = categories.map(({ key, title, fields }) => {
    const tags = (fields || [])
      .filter((field) => featureIsVisible(field, data[key]?.[field.key]))
      .map((field) => {
        const icon = escapeHTML(field.icon || 'check');
        const label = escapeHTML(featureLabel(field, data[key][field.key]));
        return `<div class="feature-tag"><i data-lucide="${icon}" class="feature-check"></i><span>${label}</span></div>`;
      });

    if (!tags.length) return '';
    return `
      <div class="feature-category">
        <h3 class="feature-category-title">${escapeHTML(title)}</h3>
        <div class="property-features-grid">${tags.join('')}</div>
      </div>`;
  }).filter(Boolean).join('');

  container.innerHTML = html || '<p class="property-features-empty">امکانات ثبت‌شده‌ای برای این ملک موجود نیست.</p>';
  refreshIcons();
}

async function loadSimilarProperties() {
  const container = document.getElementById('similarProperties');
  if (!container || !propertyData || !propertyId) return;

  try {
    const res = await fetch(`${API}/properties/${encodeURIComponent(propertyId)}/similar?limit=4`);
    if (!res.ok) throw new Error('similar failed');
    const data = await res.json();
    const shown = data.properties || [];

    if (!shown.length) {
      container.innerHTML = '<p class="property-empty-note">ملک مشابهی یافت نشد.</p>';
      return;
    }

    container.innerHTML = shown.slice(0, 4).map((p) => {
      const id = escapeHTML(p._id || '');
      const image = escapeHTML(p.image || (p.images && p.images[0]) || PLACEHOLDER_IMAGE);
      const title = escapeHTML(p.title || '');
      const type = escapeHTML(p.type || '');
      const location = escapeHTML(p.location || '');
      const price = escapeHTML(formatPriceDisplay(p.price));
      const meta = [];
      if (p.beds) meta.push(`${Number(p.beds).toLocaleString('fa-IR')} خواب`);
      if (p.area) meta.push(`${Number(p.area).toLocaleString('fa-IR')} متر`);

      return `
      <a href="/property/?id=${id}" class="pd-related-card" data-similar-property-id="${id}">
        <span class="pd-related-media" style="background-image:url('${image}')" role="img" aria-label="${title}"></span>
        <span class="pd-related-body">
          ${type ? `<span class="pd-related-type">${type}</span>` : ''}
          <span class="pd-related-title">${title}</span>
          ${location ? `<span class="pd-related-location">${location}</span>` : ''}
          ${meta.length ? `<span class="pd-related-meta">${meta.join(' · ')}</span>` : ''}
          <span class="pd-related-price">${price}</span>
        </span>
      </a>`;
    }).join('');

    refreshIcons();
  } catch (error) {
    console.error('Error loading similar:', error);
    container.innerHTML = '<p class="property-empty-note">بارگذاری املاک مشابه با مشکل مواجه شد.</p>';
  }
}

function initHeroSwipe() {
  const hero = document.getElementById('propertyHero');
  if (!hero || propertyImages.length <= 1) return;

  let startX = 0;
  let startY = 0;

  hero.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].screenX;
    startY = e.changedTouches[0].screenY;
  }, { passive: true });

  hero.addEventListener('touchend', (e) => {
    const diffX = e.changedTouches[0].screenX - startX;
    const diffY = e.changedTouches[0].screenY - startY;
    if (Math.abs(diffX) < 50 || Math.abs(diffX) < Math.abs(diffY)) return;
    if (diffX > 0) updateHeroImage(currentImageIndex - 1);
    else updateHeroImage(currentImageIndex + 1);
  }, { passive: true });
}

function setModalOpen(modal, open) {
  if (!modal) return;
  modal.classList.toggle('active', open);
  document.body.classList.toggle('no-scroll', open);
  if (!open) setTimeout(resetTourModal, 320);
}

function resetTourModal() {
  const body = document.getElementById('tourModalBody');
  const success = document.getElementById('tourModalSuccess');
  const messageEl = document.getElementById('tourFormMessage');
  if (body) body.hidden = false;
  if (success) success.hidden = true;
  if (messageEl) {
    messageEl.textContent = '';
    messageEl.className = 'form-message';
  }
  document.getElementById('tourForm')?.reset();
}

function showTourSuccess() {
  const body = document.getElementById('tourModalBody');
  const success = document.getElementById('tourModalSuccess');
  if (body) body.hidden = true;
  if (success) success.hidden = false;
}

function setLightboxOpen(open) {
  const lb = document.getElementById('propertyLightbox');
  if (!lb) return;
  lb.hidden = !open;
  lb.setAttribute('aria-hidden', open ? 'false' : 'true');
  document.body.classList.toggle('no-scroll', open);
  if (open) updateHeroImage(currentImageIndex, false);
}

function initMobileNav() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const closeBtn = document.querySelector('.mobile-menu-close');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  const setOpen = (open) => {
    navLinks.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open);
    closeBtn?.toggleAttribute('hidden', !open);
    document.body.classList.toggle('no-scroll', open);
    const icon = toggle.querySelector('[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', open ? 'x' : 'menu');
      refreshIcons();
    }
  };

  toggle.addEventListener('click', () => setOpen(!navLinks.classList.contains('active')));
  closeBtn?.addEventListener('click', () => setOpen(false));
  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
}

function openTourModal() {
  resetTourModal();
  setModalOpen(document.getElementById('tourModal'), true);
  const dateInput = document.getElementById('tourDate');
  if (dateInput && !dateInput.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }
}

async function shareProperty() {
  const url = `${location.origin}/property/?id=${encodeURIComponent(propertyId || '')}`;
  const title = propertyData?.title || 'ملک آستوریا';
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      showNotification('لینک ملک کپی شد');
    }
  } catch (e) {
    if (e.name !== 'AbortError') showNotification('اشتراک‌گذاری انجام نشد', 'error');
  }
}

function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  if (!notification) return;
  notification.textContent = message;
  notification.className = `notification notification-${type} visible`;
  setTimeout(() => notification.classList.remove('visible'), 3000);
}

// ── Event listeners ──
document.getElementById('prevImage')?.addEventListener('click', () => updateHeroImage(currentImageIndex - 1));
document.getElementById('nextImage')?.addEventListener('click', () => updateHeroImage(currentImageIndex + 1));
document.getElementById('lightboxPrev')?.addEventListener('click', () => updateHeroImage(currentImageIndex - 1));
document.getElementById('lightboxNext')?.addEventListener('click', () => updateHeroImage(currentImageIndex + 1));

document.addEventListener('keydown', (e) => {
  if (!propertyData || propertyImages.length <= 1) return;
  const lightboxOpen = !document.getElementById('propertyLightbox')?.hidden;
  const modalOpen = document.getElementById('tourModal')?.classList.contains('active');

  if (e.key === 'Escape') {
    if (lightboxOpen) setLightboxOpen(false);
    else if (modalOpen) setModalOpen(document.getElementById('tourModal'), false);
    return;
  }

  if (lightboxOpen || (!modalOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
    if (e.key === 'ArrowRight') updateHeroImage(currentImageIndex - 1);
    if (e.key === 'ArrowLeft') updateHeroImage(currentImageIndex + 1);
  }
});

document.addEventListener('click', (e) => {
  const imageButton = e.target.closest('[data-image-index]');
  if (imageButton) updateHeroImage(Number(imageButton.getAttribute('data-image-index')) || 0);
});

document.getElementById('btnFavorite')?.addEventListener('click', toggleFavorite);
document.getElementById('btnFavoriteTop')?.addEventListener('click', toggleFavorite);
document.getElementById('btnShare')?.addEventListener('click', shareProperty);

['btnRequestTour', 'btnRequestTourInline', 'btnRequestTourPrimary', 'mobileCtaTour'].forEach((id) => {
  document.getElementById(id)?.addEventListener('click', openTourModal);
});

document.getElementById('tourSuccessClose')?.addEventListener('click', () => {
  setModalOpen(document.getElementById('tourModal'), false);
});

document.getElementById('closeTourModal')?.addEventListener('click', () => {
  setModalOpen(document.getElementById('tourModal'), false);
});

document.getElementById('tourModal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) setModalOpen(document.getElementById('tourModal'), false);
});

document.getElementById('btnFullscreen')?.addEventListener('click', () => setLightboxOpen(true));
document.getElementById('closeLightbox')?.addEventListener('click', () => setLightboxOpen(false));
document.getElementById('propertyLightbox')?.addEventListener('click', (e) => {
  if (e.target.id === 'propertyLightbox' || e.target.id === 'lightboxImage') setLightboxOpen(false);
});
document.getElementById('propertyHero')?.addEventListener('click', (e) => {
  if (e.target.closest('button, a, .property-hero-nav, .property-hero-actions, .property-hero-dots')) return;
  if (propertyImages.length) setLightboxOpen(true);
});
document.addEventListener('click', (e) => {
  const story = e.target.closest('.pd-story-item[data-image-index]');
  if (!story) return;
  updateHeroImage(Number(story.getAttribute('data-image-index')) || 0, false);
  setLightboxOpen(true);
});

document.getElementById('tourForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!propertyData) return;

  const name = document.getElementById('tourName').value.trim();
  const phone = document.getElementById('tourPhone').value.trim();
  const date = document.getElementById('tourDate').value;
  const note = document.getElementById('tourNote').value.trim();
  const messageEl = document.getElementById('tourFormMessage');
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'در حال ارسال...';
  btn.disabled = true;
  messageEl.textContent = '';
  messageEl.className = 'form-message';

  try {
    const res = await fetch(`${API}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email: `${phone}@tour.astoria`,
        phone,
        message: `درخواست بازدید اختصاصی برای تاریخ ${date}${note ? `\n${note}` : ''}`,
        propertyId: propertyId,
        propertyTitle: propertyData.title,
        source: 'درخواست بازدید',
      }),
    });

    if (!res.ok) throw new Error('request failed');

    showTourSuccess();
  } catch (error) {
    messageEl.className = 'form-message error';
    messageEl.textContent = 'خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.';
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

document.getElementById('quickContactForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!propertyData) return;

  const name = document.getElementById('quickName').value.trim();
  const phone = document.getElementById('quickPhone').value.trim();
  const message = document.getElementById('quickMessage').value.trim();
  const messageEl = document.getElementById('quickFormMessage');
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'در حال ارسال...';
  btn.disabled = true;
  messageEl.textContent = '';
  messageEl.className = 'form-message';

  try {
    const res = await fetch(`${API}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email: `${phone}@quick.astoria`,
        phone,
        message: message,
        propertyId: propertyId,
        propertyTitle: propertyData.title,
        source: 'فرم سایت',
      }),
    });

    if (!res.ok) throw new Error('request failed');

    messageEl.className = 'form-message success';
    messageEl.textContent = 'پیام شما ثبت شد. تیم آستوریا به زودی با شما تماس خواهد گرفت.';
    document.getElementById('quickContactForm').reset();
  } catch (error) {
    messageEl.className = 'form-message error';
    messageEl.textContent = 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید.';
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  backToTop?.classList.toggle('visible', window.scrollY > 500);
  document.querySelector('.astoria-nav')?.classList.toggle('scrolled', window.scrollY > 60);
});
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

refreshIcons();
loadProperty();
initMobileNav();
