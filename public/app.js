/* ==============================================
   ASTORIA ELITE ESTATES — Pro App v4.0
   Self-contained — Features embedded
   ============================================== */

import { createIcons, Menu, Search, Bed, Bath, Maximize2, Crown, UserCheck, TrendingUp, ShieldCheck, MapPin, Phone, Mail, ArrowUp, Heart, X, ChevronDown, Eye, Calendar, Share2, Car, Warehouse, Thermometer, Wind, Waves, Camera, Dumbbell, Building, Palette, Users, Gamepad, Film, Video, ArrowUpDown } from 'lucide';

const API_BASE = 'http://localhost:5000/api';

// ===== FEATURES =====
const FEATURE_CATEGORIES = { common: 'ویژگی‌های عمومی', specific: 'ویژگی‌های اختصاصی', luxury: 'ویژگی‌های لوکس' };
const COMMON_FEATURES = [
  { key: 'parking', label_fa: 'پارکینگ', field_type: 'number', icon: 'car', min: 0 },
  { key: 'storage', label_fa: 'انباری', field_type: 'boolean', icon: 'warehouse' },
  { key: 'elevator', label_fa: 'آسانسور', field_type: 'boolean', icon: 'arrow-up' },
  { key: 'security', label_fa: 'نگهبانی', field_type: 'boolean', icon: 'shield-check' },
  { key: 'cctv', label_fa: 'دوربین مداربسته', field_type: 'boolean', icon: 'camera' },
  { key: 'video_intercom', label_fa: 'آیفون تصویری', field_type: 'boolean', icon: 'video' },
  { key: 'heating', label_fa: 'سیستم گرمایش', field_type: 'select', options: ['پکیج', 'شوفاژ', 'گرمایش از کف', 'مرکزی', 'سایر'] },
  { key: 'cooling', label_fa: 'سیستم سرمایش', field_type: 'select', options: ['اسپلیت', 'داکت اسپلیت', 'کولر آبی', 'کولر گازی', 'چیلر', 'سایر'] },
  { key: 'flooring', label_fa: 'کف‌پوش', field_type: 'select', options: ['سرامیک', 'پارکت', 'لمینت', 'سنگ', 'موزاییک', 'سایر'] },
  { key: 'cabinet', label_fa: 'کابینت', field_type: 'select', options: ['MDF', 'هایگلاس', 'ممبران', 'چوب طبیعی', 'سایر'] },
  { key: 'double_glazed', label_fa: 'پنجره دوجداره', field_type: 'boolean' },
  { key: 'security_door', label_fa: 'درب ضد سرقت', field_type: 'boolean' },
  { key: 'smart_home', label_fa: 'خانه هوشمند', field_type: 'boolean' },
];
const LUXURY_FEATURES = [
  { key: 'pool', label_fa: 'استخر', field_type: 'boolean', icon: 'waves' },
  { key: 'sauna', label_fa: 'سونا / جکوزی', field_type: 'boolean', icon: 'thermometer' },
  { key: 'gym', label_fa: 'سالن ورزشی', field_type: 'boolean', icon: 'dumbbell' },
  { key: 'roof_garden', label_fa: 'روف‌گاردن', field_type: 'boolean', icon: 'palette' },
  { key: 'meeting_room', label_fa: 'سالن اجتماعات', field_type: 'boolean', icon: 'users' },
  { key: 'home_cinema', label_fa: 'سینمای خانگی', field_type: 'boolean', icon: 'film' },
  { key: 'luxury_lobby', label_fa: 'لابی لوکس', field_type: 'boolean', icon: 'building' },
];
const SPECIFIC_FEATURES = {
  'آپارتمان': [{ key: 'floor', label_fa: 'طبقه', field_type: 'number', min: 0 },{ key: 'total_floors', label_fa: 'کل طبقات', field_type: 'number', min: 1 },{ key: 'balcony', label_fa: 'بالکن / تراس', field_type: 'boolean' },{ key: 'open_kitchen', label_fa: 'آشپزخانه اپن', field_type: 'boolean' },{ key: 'master_bedroom', label_fa: 'خواب مستر', field_type: 'boolean' },{ key: 'closet', label_fa: 'کمد دیواری', field_type: 'boolean' },{ key: 'false_ceiling', label_fa: 'سقف کاذب', field_type: 'boolean' },{ key: 'lobby', label_fa: 'لابی', field_type: 'boolean' }],
  'ویلا': [{ key: 'yard_area', label_fa: 'متراژ حیاط', field_type: 'number', min: 0 },{ key: 'pool_private', label_fa: 'استخر اختصاصی', field_type: 'boolean' },{ key: 'garden', label_fa: 'باغچه', field_type: 'boolean' },{ key: 'bbq', label_fa: 'باربیکیو', field_type: 'boolean' },{ key: 'gazebo', label_fa: 'آلاچیق', field_type: 'boolean' },{ key: 'generator', label_fa: 'ژنراتور', field_type: 'boolean' },{ key: 'irrigation', label_fa: 'آبیاری اتوماتیک', field_type: 'boolean' }],
  'پنت‌هاوس': [{ key: 'private_elevator', label_fa: 'آسانسور اختصاصی', field_type: 'boolean' },{ key: 'private_entrance', label_fa: 'ورودی خصوصی', field_type: 'boolean' },{ key: 'private_pool', label_fa: 'استخر خصوصی', field_type: 'boolean' },{ key: 'panoramic_view', label_fa: 'ویو پانوراما', field_type: 'boolean' },{ key: 'high_ceiling', label_fa: 'سقف بلند', field_type: 'boolean' },{ key: 'luxury_materials', label_fa: 'مصالح لوکس', field_type: 'boolean' }],
  'زمین': [{ key: 'usage_type', label_fa: 'کاربری', field_type: 'select', options: ['مسکونی','تجاری','کشاورزی','صنعتی','سایر'] },{ key: 'deed_type', label_fa: 'نوع سند', field_type: 'select', options: ['تک‌برگ','منگوله‌دار','قولنامه‌ای','مشاعی'] },{ key: 'width', label_fa: 'عرض (متر)', field_type: 'number', min: 0 },{ key: 'length', label_fa: 'طول (متر)', field_type: 'number', min: 0 },{ key: 'fenced', label_fa: 'حصارکشی', field_type: 'boolean' },{ key: 'build_permit', label_fa: 'پروانه ساخت', field_type: 'boolean' }],
  'دفتر کار': [{ key: 'office_usage', label_fa: 'کاربری اداری', field_type: 'boolean' },{ key: 'reception', label_fa: 'لابی و پذیرش', field_type: 'boolean' },{ key: 'conference_room', label_fa: 'اتاق کنفرانس', field_type: 'boolean' },{ key: 'kitchenette', label_fa: 'آبدارخانه', field_type: 'boolean' },{ key: 'fire_alarm', label_fa: 'اعلام حریق', field_type: 'boolean' },{ key: 'network_infra', label_fa: 'زیرساخت شبکه', field_type: 'boolean' }],
  'باغ': [{ key: 'building_area', label_fa: 'متراژ بنا', field_type: 'number', min: 0 },{ key: 'fruit_trees', label_fa: 'درختان میوه', field_type: 'boolean' },{ key: 'tree_age', label_fa: 'سن درختان', field_type: 'number', min: 0 },{ key: 'swimming_pool', label_fa: 'استخر شنا', field_type: 'boolean' },{ key: 'guard_room', label_fa: 'اتاق نگهبان', field_type: 'boolean' },{ key: 'road_access', label_fa: 'دسترسی جاده', field_type: 'boolean' },{ key: 'landscaping', label_fa: 'محوطه‌سازی', field_type: 'boolean' }],
};
function getFeaturesForType(t){return{common:COMMON_FEATURES,specific:SPECIFIC_FEATURES[t]||[],luxury:LUXURY_FEATURES}}

// ===== HELPERS =====
function formatPrice(price) {
  if (!price && price !== 0) return null;
  const num = Number(price);
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace('.0','') + ' میلیارد';
  if (num >= 1000000) return Math.floor(num / 1000000) + ' میلیون';
  if (num >= 1000) return Math.floor(num / 1000) + ' هزار';
  return num.toLocaleString('fa-IR');
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

// ===== CONFIG =====
const CONFIG = { icons:{Menu,Search,Bed,Bath,Maximize2,Crown,UserCheck,TrendingUp,ShieldCheck,MapPin,Phone,Mail,ArrowUp,Heart,X,ChevronDown,Eye,Calendar,Share2,Car,Warehouse,Thermometer,Wind,Waves,Camera,Dumbbell,Building,Palette,Users,Gamepad,Film,Video,ArrowUpDown}, iconDefaults:{'stroke-width':1.5,width:20,height:20}, storageKey:'astoria_favorites', scrollThreshold:60, backToTopThreshold:500, revealOptions:{threshold:0.15,rootMargin:'0px 0px -40px 0px'} };

// ===== ASTORIA APP =====
const Astoria = {
  init(){
    this.cacheDOM();this.initIcons();this.bindEvents();this.setActiveLink();
    this.loadProperties();this.loadSettings();this.initShareButtons();this.initFavoriteButtons();
    this.createRequestModal();
    console.log('%c🏛️ ASTORIA %cPro فارسی','color:#c9a227;font-weight:bold;','color:#888;');
  },
  cacheDOM(){
    this.navbar=document.querySelector('.astoria-nav');this.mobileToggle=document.querySelector('.mobile-menu-toggle');
    this.navLinksContainer=document.querySelector('.nav-links');this.navLinks=document.querySelectorAll('.nav-links a');
    this.backToTop=document.getElementById('back-to-top');this.notification=document.getElementById('notification');
    this.sections=document.querySelectorAll('section[id]');this.filterBtns=document.querySelectorAll('.filter-btn');
    this.propertiesContainer=document.getElementById('propertiesContainer');this.searchBtn=document.querySelector('.btn-search-gold');
    this.contactForm=document.querySelector('.contact-form');this.bookTourBtn=document.querySelector('.btn-gold-outline');
    this.revealElements=document.querySelectorAll('.reveal');this.favorites=JSON.parse(localStorage.getItem(CONFIG.storageKey)||'[]');
  },
  initIcons(){createIcons({icons:CONFIG.icons,attrs:CONFIG.iconDefaults})},
  bindEvents(){
    window.addEventListener('scroll',()=>{this.navbar.classList.toggle('scrolled',scrollY>CONFIG.scrollThreshold);this.backToTop?.classList.toggle('visible',scrollY>CONFIG.backToTopThreshold);this.setActiveLink()},{passive:true});
    this.mobileToggle?.addEventListener('click',()=>this.toggleMobileMenu());
    this.navLinks.forEach(l=>l.addEventListener('click',e=>{if(e.target.getAttribute('href')?.startsWith('#')){e.preventDefault();document.querySelector(e.target.getAttribute('href'))?.scrollIntoView({behavior:'smooth'})}this.toggleMobileMenu(true)}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')this.toggleMobileMenu(true)});
    this.backToTop?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
    this.filterBtns.forEach(b=>b.addEventListener('click',()=>this.filter(b)));
    this.searchBtn?.addEventListener('click',()=>this.search());
    this.contactForm?.addEventListener('submit',e=>this.submitForm(e));
    this.bookTourBtn?.addEventListener('click',()=>document.querySelector('#contact')?.scrollIntoView({behavior:'smooth'}));
    this.propertiesContainer?.addEventListener('click',e=>this.handlePropertyCardClick(e));
    this.initRevealObserver();
  },
  async loadProperties(){
    if(!this.propertiesContainer)return;
    try{
      const r=await fetch(`${API_BASE}/properties`);const d=await r.json();
      if(!d.properties?.length){this.propertiesContainer.innerHTML='<p style="color:var(--gray-300);text-align:center;grid-column:1/-1;padding:40px;">هیچ ملکی یافت نشد.</p>';return}
      this.propertiesContainer.innerHTML=d.properties.map(p=>this.renderCard(p)).join('');
      this.propertyCards=document.querySelectorAll('.property-card');createIcons({icons:CONFIG.icons,attrs:CONFIG.iconDefaults});
      this.initShareButtons();this.initFavoriteButtons();this.revealElements=document.querySelectorAll('.reveal');this.initRevealObserver();
    }catch(e){this.propertiesContainer.innerHTML='<p style="color:#f44336;text-align:center;grid-column:1/-1;padding:40px;">خطا در بارگذاری</p>'}
  },
  renderCard(p){
    const propertyId=escapeHTML(p._id||'');
    const propertyType=escapeHTML(p.type||'');
    const propertyTitle=escapeHTML(p.title||'');
    const listingType=escapeHTML(p.listingType||'آگهی ویژه');
    const f=p.features||{};const all={...(f.common||{}),...(f.specific||{}),...(f.luxury||{})};
    const cfg=getFeaturesForType(p.type);const allCfg=[...(cfg.common||[]),...(cfg.specific||[]),...(cfg.luxury||[])];
    const feats=[];allCfg.forEach(c=>{const v=all[c.key];if(v===true||(typeof v==='number'&&v>0)||(typeof v==='string'&&v.length>0)){const valueText=typeof v==='number'&&c.field_type==='number'?`${escapeHTML(v)} `:'';feats.push(`<span class="feature-item"><i data-lucide="${escapeHTML(c.icon||'car')}"></i> ${valueText}${escapeHTML(c.label_fa)}</span>`)}});
    const pf=formatPrice(p.price);const price=pf?`${escapeHTML(pf)} تومان`:'<button type="button" class="contact-price-link" data-scroll-target="contact">تماس بگیرید</button>';
    const img=escapeHTML(p.image||(p.images&&p.images[0])||'');
    return`<article class="property-card reveal" data-type="${propertyType}" data-price="${escapeHTML(p.price||0)}" data-id="${propertyId}">
      <div class="card-image" data-property-link="true">
        ${img?`<img src="${img}" alt="${propertyTitle}" loading="lazy">`:''}
        <div class="card-image-badge">${p.isExclusive?'<span class="badge badge-exclusive">اختصاصی</span>':''}</div>
        <div class="card-actions-top"><button type="button" class="card-action-icon favorite-btn" aria-label="افزودن به علاقه‌مندی"><i data-lucide="heart"></i></button><button type="button" class="card-action-icon share-btn" aria-label="اشتراک‌گذاری"><i data-lucide="share-2"></i></button></div>
        ${p.images&&p.images.length>1?`<span class="badge badge-image-count">${escapeHTML(p.images.length)} عکس</span>`:''}
      </div>
      <div class="card-details">
        <h3 class="card-title" data-property-link="true">${propertyTitle}</h3>
        <p class="card-price">${price}</p>
        <p class="card-listing-type">${listingType}</p>
        <div class="card-features">
          ${p.beds>0?`<span class="feature-item"><i data-lucide="bed"></i> ${escapeHTML(p.beds)} خواب</span>`:''}
          ${p.baths>0?`<span class="feature-item"><i data-lucide="bath"></i> ${escapeHTML(p.baths)} حمام</span>`:''}
          ${p.area>0?`<span class="feature-item"><i data-lucide="maximize-2"></i> ${escapeHTML(p.area)} متر</span>`:''}
          ${feats.slice(0,4).join('')}
        </div>
        <div class="card-buttons">
          <a href="/property/?id=${propertyId}" class="btn-card-primary"><i data-lucide="eye"></i> جزئیات</a>
          <button type="button" class="btn-card-secondary" data-request-property="true"><i data-lucide="calendar"></i> بازدید</button>
        </div>
      </div></article>`;
  },
  handlePropertyCardClick(e){
    const card=e.target.closest('.property-card');
    if(!card)return;
    if(e.target.closest('.favorite-btn,.share-btn,.btn-card-primary'))return;
    if(e.target.closest('[data-scroll-target="contact"]')){document.getElementById('contact')?.scrollIntoView({behavior:'smooth'});return;}
    if(e.target.closest('[data-request-property="true"]')){this.openRequestModal(card.getAttribute('data-id'),card.querySelector('.card-title')?.textContent||'');return;}
    if(e.target.closest('[data-property-link="true"]')){window.location.href=`/property/?id=${encodeURIComponent(card.getAttribute('data-id')||'')}`;}
  },
  async loadSettings(){try{const r=await fetch(`${API_BASE}/settings`);const s=await r.json();if(s.heroBackground){const h=document.querySelector('.hero-bg');if(h){h.style.backgroundImage=`url(${s.heroBackground})`;h.style.backgroundSize='cover'}}}catch(e){}},
  initShareButtons(){document.querySelectorAll('.share-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const id=b.closest('.property-card')?.getAttribute('data-id');const title=b.closest('.property-card')?.querySelector('.card-title')?.textContent||'ملک';const url=`${location.origin}/property/?id=${id}`;navigator.share?navigator.share({title,url}):navigator.clipboard.writeText(url).then(()=>this.toast('لینک کپی شد'))}))},
  initFavoriteButtons(){document.querySelectorAll('.favorite-btn').forEach(b=>{const id=b.closest('.property-card')?.getAttribute('data-id');if(this.favorites.includes(id))b.setAttribute('data-liked','true');b.addEventListener('click',e=>{e.stopPropagation();if(this.favorites.includes(id)){this.favorites=this.favorites.filter(x=>x!==id);b.setAttribute('data-liked','false');this.toast('حذف از علاقه‌مندی')}else{this.favorites.push(id);b.setAttribute('data-liked','true');this.toast('اضافه به علاقه‌مندی')}localStorage.setItem(CONFIG.storageKey,JSON.stringify(this.favorites))})})},
  toggleMobileMenu(force=false){const o=force?false:!this.navLinksContainer.classList.contains('active');this.navLinksContainer.classList.toggle('active',o);this.mobileToggle.setAttribute('aria-expanded',o);document.body.classList.toggle('no-scroll',o)},
  setActiveLink(){const pos=scrollY+120;this.sections.forEach(s=>{if(pos>=s.offsetTop&&pos<s.offsetTop+s.offsetHeight)this.navLinks.forEach(l=>l.classList.toggle('active',l.getAttribute('href')===`#${s.id}`))})},
  initRevealObserver(){if(this._obs)this._obs.disconnect();this._obs=new IntersectionObserver(e=>e.forEach(en=>{if(en.isIntersecting){en.target.classList.add('revealed');this._obs.unobserve(en.target)}}),CONFIG.revealOptions);this.revealElements.forEach(el=>this._obs.observe(el))},
  filter(btn){this.filterBtns.forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.textContent.trim();this.propertyCards.forEach(c=>{const m=f==='همه'||c.getAttribute('data-type')===f;c.style.opacity=m?'1':'0';c.style.transform=m?'translateY(0)':'translateY(20px)';setTimeout(()=>{if(!m)c.style.display='none'},300);if(m)c.style.display=''})},
  search(){const t=document.querySelectorAll('.search-value')[1]?.textContent.trim()||'';this.propertyCards.forEach(c=>{const m=t==='همه انواع'||!t||c.getAttribute('data-type')===t;c.style.opacity=m?'1':'0';c.style.transform=m?'translateY(0)':'translateY(20px)';setTimeout(()=>{if(!m)c.style.display='none'},300);if(m)c.style.display=''})},
  submitForm(e){e.preventDefault();const n=document.getElementById('name').value.trim(),em=document.getElementById('email').value.trim(),msg=document.getElementById('message').value.trim();if(!n||!em||!msg)return this.toast('فیلدهای ضروری را پر کنید','error');const btn=this.contactForm.querySelector('button');const t=btn.textContent;btn.textContent='...';btn.disabled=true;fetch(`${API_BASE}/customers`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n,email:em,message:msg})}).then(()=>{this.toast('پیام ارسال شد','success');this.contactForm.reset()}).catch(()=>this.toast('خطا','error')).finally(()=>{btn.textContent=t;btn.disabled=false})},
  toast(msg,type='info'){if(!this.notification)return;if(this._t)clearTimeout(this._t);this.notification.textContent=msg;this.notification.className=`notification notification-${type} visible`;this._t=setTimeout(()=>this.notification.classList.remove('visible'),3000)},

  // ===== REQUEST MODAL =====
  createRequestModal(){
    const modal=document.createElement('div');modal.className='request-modal-overlay';modal.id='requestModal';
    modal.innerHTML=`<div class="request-modal-card"><button type="button" class="request-modal-close" data-close-request-modal="true">✕</button><h3 class="request-modal-title">درخواست اطلاعات بیشتر</h3><p class="request-modal-subtitle" id="requestModalProperty">برای این ملک درخواست خود را ثبت کنید</p><form id="requestForm" class="request-modal-form"><input type="hidden" id="requestPropertyId"><input type="text" id="requestName" placeholder="نام و نام خانوادگی *" required><input type="tel" id="requestPhone" placeholder="شماره تماس *" required><textarea id="requestMessage" rows="3" placeholder="توضیحات (اختیاری)"></textarea><button type="submit" class="btn-gold-solid" style="width:100%">ارسال درخواست</button></form><div id="requestMessage" class="admin-message" style="margin-top:12px"></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('[data-close-request-modal="true"]')?.addEventListener('click',()=>modal.classList.remove('active'));
    modal.querySelector('#requestForm')?.addEventListener('submit',e=>this.submitRequest(e));
  },
  openRequestModal(id,title){
    document.getElementById('requestPropertyId').value=id;
    document.getElementById('requestModalProperty').textContent=title;
    document.getElementById('requestModal').classList.add('active');
  },
  submitRequest(e){
    e.preventDefault();const btn=e.target.querySelector('button');const orig=btn.textContent;btn.textContent='در حال ارسال...';btn.disabled=true;
    fetch(`${API_BASE}/customers`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:document.getElementById('requestName').value,email:document.getElementById('requestPhone').value+'@request.astoria',phone:document.getElementById('requestPhone').value,message:`درخواست برای: ${document.getElementById('requestModalProperty').textContent}\n${document.getElementById('requestMessage').value}`})}).then(r=>r.json()).then(()=>{document.getElementById('requestMessage').className='admin-message success';document.getElementById('requestMessage').textContent='✅ درخواست ارسال شد';document.getElementById('requestForm').reset();setTimeout(()=>{document.getElementById('requestModal').classList.remove('active');document.getElementById('requestMessage').textContent=''},2000)}).catch(()=>{document.getElementById('requestMessage').className='admin-message error';document.getElementById('requestMessage').textContent='❌ خطا'}).finally(()=>{btn.textContent=orig;btn.disabled=false});
  }
};

Astoria.init();