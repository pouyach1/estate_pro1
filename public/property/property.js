/* ==============================================
   PROPERTY DETAIL PAGE — Logic
   ============================================== */

const API = 'http://localhost:5000/api';
const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get('id');

// Sample images (replace with real API data)
const sampleImages = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18f6b0050?w=1200&q=80'
];

let currentImageIndex = 0;
let propertyData = null;

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}


// ========== LOAD PROPERTY ==========
async function loadProperty() {
  try {
    if (propertyId) {
      const res = await fetch(`${API}/properties/${propertyId}`);
      propertyData = await res.json();
    } else {
      // Demo mode — no ID in URL
      propertyData = {
        title: 'ویلای ساحلی لوکس',
        type: 'ویلا',
        price: 350000,
        beds: 4,
        baths: 3,
        area: 240,
        location: 'تهران، ولنجک',
        description: 'این ویلای فوق‌العاده با چشم‌انداز بی‌نظیر به دریا، ترکیبی از معماری مدرن و طبیعت بکر است. با استخر بی‌نهایت، پنجره‌های سرتاسری و فضای باز رویایی، این ملک تجربه‌ای فراموش‌نشدنی از زندگی لوکس را برای شما رقم خواهد زد. محوطه‌سازی حرفه‌ای، پارکینگ اختصاصی و سیستم هوشمند خانه از دیگر ویژگی‌های این ملک منحصر به فرد است.',
        listingType: 'آگهی ویژه',
        isExclusive: true,
        image: sampleImages[0]
      };
    }

    renderProperty();
    loadSimilarProperties();
  } catch (error) {
    console.error('Error loading property:', error);
    // Fallback to demo
    propertyData = {
      title: 'ویلای ساحلی لوکس',
      type: 'ویلا',
      price: 350000,
      beds: 4,
      baths: 3,
      area: 240,
      location: 'تهران، ولنجک',
      description: 'این ویلای فوق‌العاده با چشم‌انداز بی‌نظیر...',
      listingType: 'آگهی ویژه',
      isExclusive: true,
      image: sampleImages[0]
    };
    renderProperty();
    loadSimilarProperties();
  }
}

// ========== RENDER PROPERTY ==========
function renderProperty() {
  const p = propertyData;

  document.getElementById('propertyTitle').textContent = p.title;
  document.getElementById('propertyLocation').textContent = p.location || 'موقعیت نامشخص';
  document.getElementById('propertyPrice').textContent = Number(p.price).toLocaleString('fa-IR') + ' دلار';
  document.getElementById('listingType').textContent = p.listingType || 'آگهی ویژه';
  document.getElementById('propertyDescription').textContent = p.description || 'توضیحات بیشتری ثبت نشده است.';
  
  document.getElementById('statBeds').textContent = p.beds || 0;
  document.getElementById('statBaths').textContent = p.baths || 0;
  document.getElementById('statArea').textContent = (p.area || 0).toLocaleString('fa-IR');
  document.getElementById('statType').textContent = p.type || '-';
  document.getElementById('sidebarPrice').textContent = Number(p.price).toLocaleString('fa-IR') + ' دلار';

  // Hero background
  updateHeroImage(0);

  // Gallery
  renderGallery();

  // Image dots
  renderDots();
}

// ========== HERO IMAGE SLIDER ==========
function updateHeroImage(index) {
  currentImageIndex = index;
  const hero = document.getElementById('propertyHero');
  hero.style.backgroundImage = `url(${sampleImages[index]})`;
  
  // Update dots
  document.querySelectorAll('.hero-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

function renderDots() {
  const dotsContainer = document.getElementById('imageDots');
  dotsContainer.innerHTML = sampleImages.map((_, i) => `
    <button type="button" class="hero-dot ${i === 0 ? 'active' : ''}" data-image-index="${i}" aria-label="مشاهده تصویر ${i + 1}"></button>
  `).join('');
}

document.getElementById('prevImage').addEventListener('click', () => {
  currentImageIndex = (currentImageIndex - 1 + sampleImages.length) % sampleImages.length;
  updateHeroImage(currentImageIndex);
});

document.getElementById('nextImage').addEventListener('click', () => {
  currentImageIndex = (currentImageIndex + 1) % sampleImages.length;
  updateHeroImage(currentImageIndex);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') document.getElementById('nextImage').click();
  if (e.key === 'ArrowLeft') document.getElementById('prevImage').click();
});

document.addEventListener('click', (e) => {
  const imageButton = e.target.closest('[data-image-index]');
  if (!imageButton) return;
  updateHeroImage(Number(imageButton.getAttribute('data-image-index')) || 0);
});

// ========== GALLERY ==========
function renderGallery() {
  const gallery = document.getElementById('propertyGallery');
  gallery.innerHTML = sampleImages.map((img, i) => `
    <button type="button" class="gallery-thumb" style="background-image:url(${img})" data-image-index="${i}" title="مشاهده تصویر ${i + 1}"></button>
  `).join('');
}

// ========== SIMILAR PROPERTIES ==========
async function loadSimilarProperties() {
  try {
    const res = await fetch(`${API}/properties?type=${propertyData.type}&limit=4`);
    const data = await res.json();
    
    const filtered = data.properties
      .filter(p => p._id !== propertyId)
      .slice(0, 4);

    const container = document.getElementById('similarProperties');
    
    if (filtered.length === 0) {
      container.innerHTML = '<p style="color:var(--gray-300);">ملک مشابهی یافت نشد.</p>';
      return;
    }

    container.innerHTML = filtered.map(p => {
      const propertyId = escapeHTML(p._id || '');
      const image = escapeHTML(p.image || sampleImages[0]);
      const title = escapeHTML(p.title || '');
      const listingType = escapeHTML(p.listingType || 'ویژه');
      const price = Number(p.price || 0).toLocaleString('fa-IR');
      const beds = escapeHTML(p.beds || 0);
      const baths = escapeHTML(p.baths || 0);
      const area = escapeHTML(p.area || 0);

      return `
      <article class="property-card" data-similar-property-id="${propertyId}">
        <div class="card-image">
          <img src="${image}" alt="${title}" loading="lazy" width="300" height="200">
          <span class="badge badge-exclusive">${listingType}</span>
        </div>
        <div class="card-details">
          <h3 class="card-title">${title}</h3>
          <p class="card-price">${price} دلار</p>
          <div class="card-features">
            <span class="feature-item"><i data-lucide="bed"></i> ${beds} خواب</span>
            <span class="feature-item"><i data-lucide="bath"></i> ${baths} حمام</span>
            <span class="feature-item"><i data-lucide="maximize-2"></i> ${area} متر</span>
          </div>
        </div>
      </article>`;
    }).join('');
  } catch (error) {
    console.error('Error loading similar:', error);
  }
}

// ========== FAVORITE ==========
document.getElementById('btnFavorite').addEventListener('click', function() {
  const btn = this;
  btn.classList.toggle('liked');
  
  if (btn.classList.contains('liked')) {
    btn.querySelector('[data-lucide]').setAttribute('data-lucide', 'heart');
    btn.innerHTML = '<i data-lucide="heart"></i> حذف از علاقه‌مندی‌ها';
    showNotification('به علاقه‌مندی‌ها اضافه شد.');
  } else {
    btn.innerHTML = '<i data-lucide="heart"></i> افزودن به علاقه‌مندی‌ها';
    showNotification('از علاقه‌مندی‌ها حذف شد.');
  }
});

// ========== TOUR MODAL ==========
document.getElementById('btnRequestTour').addEventListener('click', () => {
  document.getElementById('tourModal').classList.add('active');
});

document.getElementById('closeTourModal').addEventListener('click', () => {
  document.getElementById('tourModal').classList.remove('active');
});

document.getElementById('tourModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById('tourModal').classList.remove('active');
  }
});

document.getElementById('tourForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('tourName').value;
  const phone = document.getElementById('tourPhone').value;
  const date = document.getElementById('tourDate').value;
  
  try {
    await fetch(`${API}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email: phone + '@tour.astoria',
        phone,
        message: `درخواست بازدید برای تاریخ ${date} - ملک: ${propertyData.title}`
      })
    });
    
    document.getElementById('tourFormMessage').className = 'admin-message success';
    document.getElementById('tourFormMessage').textContent = 'درخواست شما با موفقیت ثبت شد.';
    document.getElementById('tourForm').reset();
    
    setTimeout(() => {
      document.getElementById('tourModal').classList.remove('active');
    }, 2000);
  } catch (error) {
    document.getElementById('tourFormMessage').className = 'admin-message error';
    document.getElementById('tourFormMessage').textContent = 'خطا در ثبت درخواست';
  }
});

// ========== QUICK CONTACT ==========
document.getElementById('quickContactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('quickName').value;
  const phone = document.getElementById('quickPhone').value;
  const message = document.getElementById('quickMessage').value;
  
  try {
    await fetch(`${API}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email: phone + '@quick.astoria',
        phone,
        message: `${message}\n\n(در مورد ملک: ${propertyData.title})`
      })
    });
    
    document.getElementById('quickFormMessage').className = 'admin-message success';
    document.getElementById('quickFormMessage').textContent = 'پیام شما ارسال شد.';
    document.getElementById('quickContactForm').reset();
  } catch (error) {
    document.getElementById('quickFormMessage').className = 'admin-message error';
    document.getElementById('quickFormMessage').textContent = 'خطا در ارسال پیام';
  }
});

// ========== NOTIFICATION ==========
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = 'notification notification-info visible';
  setTimeout(() => notification.classList.remove('visible'), 3000);
}

// ========== BACK TO TOP ==========
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.getElementById('similarProperties')?.addEventListener('click', (e) => {
  const card = e.target.closest('[data-similar-property-id]');
  if (!card) return;
  window.location.href = `?id=${encodeURIComponent(card.getAttribute('data-similar-property-id') || '')}`;
});

// ========== NAVBAR SCROLL ==========
const navbar = document.querySelector('.astoria-nav');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ========== INIT ==========
loadProperty();