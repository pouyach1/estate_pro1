/* ==============================================
   PROPERTY DETAIL PAGE — Logic
   ============================================== */

const API = '/api';
const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get('id');

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23070912'/%3E%3Cpath d='M160 210h480L400 90 160 210Zm64 32h64v192h-64V242Zm128 0h64v192h-64V242Zm128 0h64v192h-64V242ZM176 456h448v-48H176v48Z' fill='%23c9a227'/%3E%3Ctext x='400' y='430' text-anchor='middle' fill='%23888' font-family='sans-serif' font-size='20'%3EASTORIA ELITE ESTATES%3C/text%3E%3C/svg%3E";

let currentImageIndex = 0;
let propertyImages = [];
let propertyData = null;

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function formatPrice(price) {
  if (!price && price !== 0) return null;
  const num = Number(price);
  if (Number.isNaN(num)) return null;
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace('.0', '') + ' میلیارد';
  if (num >= 1000000) return Math.floor(num / 1000000).toLocaleString('fa-IR') + ' میلیون';
  if (num >= 1000) return Math.floor(num / 1000).toLocaleString('fa-IR') + ' هزار';
  return num.toLocaleString('fa-IR');
}

function formatPriceDisplay(price) {
  const formatted = formatPrice(price);
  return formatted ? `${formatted} تومان` : 'تماس بگیرید';
}

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

function refreshIcons() {
  if (typeof window.refreshLucideIcons === 'function') {
    window.refreshLucideIcons();
  }
}

function setPageMode(mode) {
  const hero = document.getElementById('propertyHero');
  const main = document.getElementById('propertyMain');
  const error = document.getElementById('propertyErrorState');
  if (hero) hero.hidden = mode === 'error';
  if (main) main.hidden = mode === 'error' || mode === 'loading';
  if (error) error.hidden = mode !== 'error';
}

function showErrorState(message) {
  setPageMode('error');
  const errorTitle = document.getElementById('propertyErrorTitle');
  const errorMessage = document.getElementById('propertyErrorMessage');
  if (errorTitle) errorTitle.textContent = message || 'ملک موردنظر یافت نشد';
  if (errorMessage) {
    errorMessage.textContent = message === 'ملک موردنظر یافت نشد'
      ? 'ممکن است این ملک حذف شده یا آدرس آن اشتباه باشد.'
      : 'لطفاً چند لحظه دیگر دوباره تلاش کنید.';
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

    setPageMode('content');
    renderProperty();
    loadSimilarProperties();
  } catch (error) {
    console.error('Error loading property:', error);
    showErrorState('بارگذاری اطلاعات ملک با مشکل مواجه شد.');
  }
}

function renderProperty() {
  const p = propertyData;
  if (!p) return;

  document.title = `${p.title || 'جزئیات ملک'} | آستوریا الیت استیتس`;

  document.getElementById('propertyTitle').textContent = p.title || 'ملک';
  document.getElementById('propertyLocation').textContent = p.location || 'موقعیت نامشخص';
  document.getElementById('propertyPrice').textContent = formatPriceDisplay(p.price);
  document.getElementById('listingType').textContent = p.listingType || 'آگهی ویژه';
  document.getElementById('propertyDescription').textContent = p.description || 'توضیحات بیشتری برای این ملک ثبت نشده است.';

  const bedsStat = document.getElementById('statBeds')?.closest('.quick-stat');
  const bathsStat = document.getElementById('statBaths')?.closest('.quick-stat');
  if (bedsStat) bedsStat.style.display = p.beds > 0 ? '' : 'none';
  if (bathsStat) bathsStat.style.display = p.baths > 0 ? '' : 'none';

  if (p.beds > 0) document.getElementById('statBeds').textContent = p.beds.toLocaleString('fa-IR');
  if (p.baths > 0) document.getElementById('statBaths').textContent = p.baths.toLocaleString('fa-IR');
  document.getElementById('statArea').textContent = (p.area || 0).toLocaleString('fa-IR');
  document.getElementById('statType').textContent = p.type || '-';
  document.getElementById('sidebarPrice').textContent = formatPriceDisplay(p.price);

  const locationMeta = document.getElementById('propertyLocationMeta');
  if (locationMeta) {
    const parts = [p.type, p.location].filter(Boolean);
    locationMeta.textContent = parts.join(' · ');
  }

  const hasMultiple = propertyImages.length > 1;
  document.querySelector('.property-hero-nav')?.classList.toggle('is-hidden', !hasMultiple);
  document.getElementById('imageDots')?.classList.toggle('is-hidden', !hasMultiple);

  updateHeroImage(0);
  renderGallery();
  renderDots();
  renderFeatures(p);
  refreshIcons();
}

function updateHeroImage(index) {
  if (!propertyImages.length) return;

  currentImageIndex = ((index % propertyImages.length) + propertyImages.length) % propertyImages.length;
  const hero = document.getElementById('propertyHero');
  const src = propertyImages[currentImageIndex];
  hero.style.backgroundImage = `url("${src}")`;

  document.querySelectorAll('.hero-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentImageIndex);
  });

  document.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === currentImageIndex);
  });

  const counter = document.getElementById('imageCounter');
  if (counter) {
    counter.textContent = propertyImages.length > 1
      ? `تصویر ${(currentImageIndex + 1).toLocaleString('fa-IR')} از ${propertyImages.length.toLocaleString('fa-IR')}`
      : '';
  }
}

function renderDots() {
  const dotsContainer = document.getElementById('imageDots');
  if (!dotsContainer) return;

  dotsContainer.innerHTML = propertyImages.map((_, i) => `
    <button type="button" class="hero-dot ${i === currentImageIndex ? 'active' : ''}" data-image-index="${i}" aria-label="مشاهده تصویر ${i + 1}"></button>
  `).join('');
}

function renderGallery() {
  const gallery = document.getElementById('propertyGallery');
  if (!gallery) return;

  if (propertyImages.length <= 1) {
    gallery.innerHTML = '<p class="property-gallery-note">تصویر دیگری برای این ملک ثبت نشده است.</p>';
    return;
  }

  gallery.innerHTML = propertyImages.map((img, i) => `
    <button type="button" class="gallery-thumb ${i === currentImageIndex ? 'active' : ''}" style="background-image:url('${escapeHTML(img)}')" data-image-index="${i}" title="مشاهده تصویر ${i + 1}" aria-label="مشاهده تصویر ${i + 1}"></button>
  `).join('');
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
}

async function loadSimilarProperties() {
  const container = document.getElementById('similarProperties');
  if (!container || !propertyData?.type) return;

  try {
    const res = await fetch(`${API}/properties?type=${encodeURIComponent(propertyData.type)}&limit=5`);
    const data = await res.json();

    const filtered = (data.properties || [])
      .filter((p) => p._id !== propertyId)
      .slice(0, 4);

    if (!filtered.length) {
      container.innerHTML = '<p class="property-empty-note">ملک مشابهی یافت نشد.</p>';
      return;
    }

    container.innerHTML = filtered.map((p) => {
      const id = escapeHTML(p._id || '');
      const image = escapeHTML(p.image || (p.images && p.images[0]) || PLACEHOLDER_IMAGE);
      const title = escapeHTML(p.title || '');
      const listingType = escapeHTML(p.listingType || 'ویژه');
      const price = escapeHTML(formatPriceDisplay(p.price));
      const beds = p.beds > 0 ? `<span class="feature-item"><i data-lucide="bed"></i> ${escapeHTML(p.beds)} خواب</span>` : '';
      const baths = p.baths > 0 ? `<span class="feature-item"><i data-lucide="bath"></i> ${escapeHTML(p.baths)} حمام</span>` : '';
      const area = p.area > 0 ? `<span class="feature-item"><i data-lucide="maximize-2"></i> ${escapeHTML(p.area)} متر</span>` : '';

      return `
      <article class="property-card" data-similar-property-id="${id}">
        <div class="card-image">
          <img src="${image}" alt="${title}" loading="lazy" width="300" height="200">
          <span class="badge badge-exclusive">${listingType}</span>
        </div>
        <div class="card-details">
          <h3 class="card-title">${title}</h3>
          <p class="card-price">${price}</p>
          <div class="card-features">${beds}${baths}${area}</div>
        </div>
      </article>`;
    }).join('');

    refreshIcons();
  } catch (error) {
    console.error('Error loading similar:', error);
    container.innerHTML = '<p class="property-empty-note">بارگذاری املاک مشابه با مشکل مواجه شد.</p>';
  }
}

document.getElementById('prevImage')?.addEventListener('click', () => {
  updateHeroImage(currentImageIndex - 1);
});

document.getElementById('nextImage')?.addEventListener('click', () => {
  updateHeroImage(currentImageIndex + 1);
});

document.addEventListener('keydown', (e) => {
  if (!propertyData || propertyImages.length <= 1) return;
  if (e.key === 'ArrowRight') updateHeroImage(currentImageIndex - 1);
  if (e.key === 'ArrowLeft') updateHeroImage(currentImageIndex + 1);
});

document.addEventListener('click', (e) => {
  const imageButton = e.target.closest('[data-image-index]');
  if (!imageButton) return;
  updateHeroImage(Number(imageButton.getAttribute('data-image-index')) || 0);
});

document.getElementById('btnFavorite')?.addEventListener('click', function () {
  const btn = this;
  btn.classList.toggle('liked');

  if (btn.classList.contains('liked')) {
    btn.innerHTML = '<i data-lucide="heart"></i> حذف از علاقه‌مندی‌ها';
    showNotification('به علاقه‌مندی‌ها اضافه شد.');
  } else {
    btn.innerHTML = '<i data-lucide="heart"></i> افزودن به علاقه‌مندی‌ها';
    showNotification('از علاقه‌مندی‌ها حذف شد.');
  }
  refreshIcons();
});

document.getElementById('btnRequestTour')?.addEventListener('click', () => {
  document.getElementById('tourModal')?.classList.add('active');
});

document.getElementById('closeTourModal')?.addEventListener('click', () => {
  document.getElementById('tourModal')?.classList.remove('active');
});

document.getElementById('tourModal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById('tourModal').classList.remove('active');
  }
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
  messageEl.className = 'admin-message';

  try {
    const res = await fetch(`${API}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email: `${phone}@tour.astoria`,
        phone,
        message: `درخواست بازدید برای تاریخ ${date} - ملک: ${propertyData.title}${note ? `\n${note}` : ''}`,
        source: 'فرم سایت',
      }),
    });

    if (!res.ok) throw new Error('request failed');

    messageEl.className = 'admin-message success';
    messageEl.textContent = 'درخواست شما با موفقیت ثبت شد.';
    document.getElementById('tourForm').reset();

    setTimeout(() => {
      document.getElementById('tourModal').classList.remove('active');
      messageEl.textContent = '';
    }, 2000);
  } catch (error) {
    messageEl.className = 'admin-message error';
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
  messageEl.className = 'admin-message';

  try {
    const res = await fetch(`${API}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email: `${phone}@quick.astoria`,
        phone,
        message: `${message}\n\n(در مورد ملک: ${propertyData.title})`,
        source: 'فرم سایت',
      }),
    });

    if (!res.ok) throw new Error('request failed');

    messageEl.className = 'admin-message success';
    messageEl.textContent = 'پیام شما ارسال شد.';
    document.getElementById('quickContactForm').reset();
  } catch (error) {
    messageEl.className = 'admin-message error';
    messageEl.textContent = 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید.';
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

function showNotification(message) {
  const notification = document.getElementById('notification');
  if (!notification) return;
  notification.textContent = message;
  notification.className = 'notification notification-info visible';
  setTimeout(() => notification.classList.remove('visible'), 3000);
}

const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  backToTop?.classList.toggle('visible', window.scrollY > 500);
});
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.getElementById('similarProperties')?.addEventListener('click', (e) => {
  const card = e.target.closest('[data-similar-property-id]');
  if (!card) return;
  window.location.href = `?id=${encodeURIComponent(card.getAttribute('data-similar-property-id') || '')}`;
});

const navbar = document.querySelector('.astoria-nav');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 60);
});

loadProperty();
