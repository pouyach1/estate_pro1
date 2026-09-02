/* ==============================================
   PROPERTY DETAIL — Flagship Experience
   ============================================== */

import { formatPrice, formatPriceDisplay, escapeHTML } from '../js/shared/format.js';
import { getSiteConfig, applyPropertySeo, applyNoIndex } from '../js/shared/seo.js';

const API = '/api';
const FAVORITES_KEY = 'astoria_favorites';
const refreshIcons = () => window.refreshLucideIcons?.();
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

function renderProperty(site) {
  const p = propertyData;
  if (!p) return;

  updatePropertySeo(p, site);

  const breadcrumb = document.getElementById('breadcrumbTitle');
  if (breadcrumb) breadcrumb.textContent = p.title || 'جزئیات ملک';

  const typeBadge = document.getElementById('propertyTypeBadge');
  if (typeBadge) typeBadge.textContent = p.type || '';

  document.getElementById('propertyTitle').textContent = p.title || 'ملک';

  const locText = document.getElementById('propertyLocationText');
  const location = p.location || 'موقعیت نامشخص';
  if (locText) locText.textContent = location;

  const priceDisplay = formatPriceDisplay(p.price);
  document.getElementById('propertyPrice').textContent = priceDisplay;
  document.getElementById('sidebarPrice').textContent = priceDisplay;
  document.getElementById('propertyDescription').textContent = p.description || 'توضیحات بیشتری برای این ملک ثبت نشده است.';

  const tourSubtitle = document.getElementById('tourModalProperty');
  if (tourSubtitle) tourSubtitle.textContent = p.title || '';

  setStatValue('area', (p.area || 0).toLocaleString('fa-IR'), (p.area || 0) > 0);
  setStatValue('beds', (p.beds || 0).toLocaleString('fa-IR'), p.beds > 0);
  setStatValue('baths', (p.baths || 0).toLocaleString('fa-IR'), p.baths > 0);
  setStatValue('type', p.type || '—', !!p.type);
  const parking = p.features?.common?.parking;
  setStatValue('parking', parking > 0 ? parking.toLocaleString('fa-IR') : '—', parking > 0);

  const hasMultiple = propertyImages.length > 1;
  document.querySelector('.property-hero-nav')?.classList.toggle('is-hidden', !hasMultiple);
  document.getElementById('imageDots')?.classList.toggle('is-hidden', !hasMultiple);
  document.getElementById('btnFullscreen')?.toggleAttribute('hidden', !hasMultiple);
  document.getElementById('filmstripWrap')?.toggleAttribute('hidden', !hasMultiple);

  updateHeroImage(0, false);
  renderFilmstrip();
  renderDots();
  renderFeatures(p);
  updateMobileCta();
  initDescriptionToggle();

  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  setFavoriteUI(propertyId && favorites.includes(propertyId));

  refreshIcons();
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
  const bio = escapeHTML(agent.bio || '');
  const phone = escapeHTML(agent.phone || '');
  const email = escapeHTML(agent.email || '');

  container.innerHTML = `
    <div class="agent-showcase">
      ${photo ? `<img src="${photo}" alt="${name}" class="agent-showcase-photo" loading="lazy">` : `<div class="agent-showcase-photo" style="background:rgba(200,200,194,0.08);display:flex;align-items:center;justify-content:center;"><i data-lucide="user"></i></div>`}
      <div class="agent-showcase-body">
        <h3 class="agent-showcase-name">${name}</h3>
        <p class="agent-showcase-role">${title}</p>
        ${bio ? `<p class="agent-showcase-bio">${bio}</p>` : ''}
        <div class="agent-showcase-contacts">
          ${phone ? `<a href="tel:${phone}" class="agent-contact-btn"><i data-lucide="phone"></i> ${phone}</a>` : ''}
          ${email ? `<a href="mailto:${email}" class="agent-contact-btn"><i data-lucide="mail"></i> تماس</a>` : ''}
        </div>
      </div>
    </div>`;
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

    container.innerHTML = shown.map((p) => {
      const id = escapeHTML(p._id || '');
      const image = escapeHTML(p.image || (p.images && p.images[0]) || PLACEHOLDER_IMAGE);
      const title = escapeHTML(p.title || '');
      const type = escapeHTML(p.type || '');
      const location = escapeHTML(p.location || '');
      const price = escapeHTML(formatPriceDisplay(p.price));
      const metricParts = [];
      if (p.area) metricParts.push(`${Number(p.area).toLocaleString('fa-IR')} متر`);
      if (p.beds) metricParts.push(`${Number(p.beds).toLocaleString('fa-IR')} خواب`);
      const metric = metricParts.length ? `<p class="similar-card-metric">${metricParts.join(' · ')}</p>` : '';

      return `
      <a href="/property/?id=${id}" class="similar-card" data-similar-property-id="${id}">
        <div class="similar-card-image">
          <img src="${image}" alt="${title}" loading="lazy" width="400" height="250">
        </div>
        <div class="similar-card-body">
          ${type ? `<div class="similar-card-type">${type}</div>` : ''}
          <h3 class="similar-card-title">${title}</h3>
          ${location ? `<p class="similar-card-location"><i data-lucide="map-pin"></i> ${location}</p>` : ''}
          ${metric}
          <p class="similar-card-price">${price}</p>
        </div>
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
  if (e.target.id === 'propertyLightbox') setLightboxOpen(false);
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

loadProperty();
initMobileNav();
