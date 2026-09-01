/* ==============================================
   ASTORIA ELITE ESTATES — Pro App v4.0
   Self-contained — Features embedded
   ============================================== */

import { createIcons, Menu, Search, Bed, Bath, Maximize2, Crown, UserCheck, TrendingUp, ShieldCheck, MapPin, Phone, Mail, ArrowUp, Heart, X, ChevronDown, Eye, Calendar, Share2, Car, Warehouse, Thermometer, Wind, Waves, Camera, Dumbbell, Building, Palette, Users, Gamepad, Film, Video, ArrowUpDown } from 'lucide';

const API_BASE = '/api';
const PROPERTY_FILTER_ALL = 'همه';
const PROPERTY_TYPES = ['ویلا', 'آپارتمان', 'پنت‌هاوس', 'باغ', 'زمین', 'دفتر کار'];
const SUGGESTED_SEARCHES = ['ویلا', 'آپارتمان', 'تهران', 'زعفرانیه', 'پنت‌هاوس'];
const AGENT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23121822'/%3E%3Ccircle cx='50' cy='36' r='18' fill='%23c9a227'/%3E%3Cpath d='M20 88c4-18 18-28 30-28s26 10 30 28' fill='%23c9a227'/%3E%3C/svg%3E";

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
const CONFIG = { icons:{Menu,Search,Bed,Bath,Maximize2,Crown,UserCheck,TrendingUp,ShieldCheck,MapPin,Phone,Mail,ArrowUp,Heart,X,ChevronDown,Eye,Calendar,Share2,Car,Warehouse,Thermometer,Wind,Waves,Camera,Dumbbell,Building,Palette,Users,Gamepad,Film,Video,ArrowUpDown}, iconDefaults:{'stroke-width':1.5,width:20,height:20}, storageKey:'astoria_favorites', scrollThreshold:60, backToTopThreshold:500, revealOptions:{threshold:0.15,rootMargin:'0px 0px -40px 0px'}, navScrollOffset:110 };

// ===== ASTORIA APP =====
const Astoria = {
  init(){
    this.allProperties=[];
    this.currentFilter=PROPERTY_FILTER_ALL;
    this.searchQuery='';
    this.cacheDOM();this.initIcons();this.bindEvents();this.setActiveLink();
    this.initSearchDropdown();
    this.initMobileSearch();
    this.loadProperties();this.loadAgents();this.loadSettings();
    this.createRequestModal();
    console.log('%cASTORIA %cPro فارسی','color:#c9a227;font-weight:bold;','color:#888;');
  },
  cacheDOM(){
    this.navbar=document.querySelector('.astoria-nav');
    this.mobileToggle=document.querySelector('.mobile-menu-toggle');
    this.mobileMenuClose=document.querySelector('.mobile-menu-close');
    this.navLinksContainer=document.querySelector('.nav-links');this.navLinks=document.querySelectorAll('.nav-links a');
    this.backToTop=document.getElementById('back-to-top');this.notification=document.getElementById('notification');
    this.sections=document.querySelectorAll('section[id]');this.filterBtns=document.querySelectorAll('.filter-btn');
    this.propertiesContainer=document.getElementById('propertiesContainer');this.searchBtn=document.querySelector('.btn-search-gold');
    this.searchTypeField=document.getElementById('searchTypeField');this.searchTypeValue=document.getElementById('searchTypeValue');
    this.searchTypeDropdown=document.getElementById('searchTypeDropdown');this.propertiesResultsMeta=document.getElementById('propertiesResultsMeta');
    this.agentsContainer=document.getElementById('agentsContainer');
    this.mobileSearchInput=document.getElementById('mobilePropertySearch');
    this.mobileSearchClear=document.getElementById('mobileSearchClear');
    this.mobileSearchSuggestions=document.getElementById('mobileSearchSuggestions');
    this.mobileSearchWrap=document.getElementById('mobileSearchWrap');
    this.mobileTypeSuggestions=document.getElementById('mobileTypeSuggestions');
    this.mobileQuerySuggestions=document.getElementById('mobileQuerySuggestions');
    this.contactForm=document.querySelector('.contact-form');this.bookTourBtns=document.querySelectorAll('.btn-gold-outline');
    this.ctaBookBtn=document.querySelector('.cta-banner .btn-gold-solid');
    this.revealElements=document.querySelectorAll('.reveal');this.favorites=JSON.parse(localStorage.getItem(CONFIG.storageKey)||'[]');
  },
  initIcons(){createIcons({icons:CONFIG.icons,attrs:CONFIG.iconDefaults})},
  bindEvents(){
    window.addEventListener('scroll',()=>{this.navbar.classList.toggle('scrolled',scrollY>CONFIG.scrollThreshold);this.backToTop?.classList.toggle('visible',scrollY>CONFIG.backToTopThreshold);this.setActiveLink()},{passive:true});
    this.mobileToggle?.addEventListener('click',()=>this.toggleMobileMenu());
    this.mobileMenuClose?.addEventListener('click',()=>this.toggleMobileMenu(true));
    this.navLinks.forEach(l=>l.addEventListener('click',e=>{const href=e.target.getAttribute('href');if(href?.startsWith('#')){e.preventDefault();this.scrollToSection(href)}this.toggleMobileMenu(true)}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){this.toggleMobileMenu(true);this.closeSearchDropdown();this.closeMobileSearchSuggestions()}});
    document.addEventListener('click',e=>{if(!e.target.closest('#searchTypeField'))this.closeSearchDropdown();if(!e.target.closest('#mobileSearchWrap'))this.closeMobileSearchSuggestions()});
    this.backToTop?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
    this.filterBtns.forEach(b=>b.addEventListener('click',()=>this.applyFilter(b.dataset.type||b.textContent.trim(),{scroll:false})));
    this.searchBtn?.addEventListener('click',()=>this.search());
    this.contactForm?.addEventListener('submit',e=>this.submitForm(e));
    this.bookTourBtns.forEach(b=>b.addEventListener('click',()=>{this.scrollToSection('#contact');this.toggleMobileMenu(true)}));
    this.ctaBookBtn?.addEventListener('click',()=>this.scrollToSection('#contact'));
    this.propertiesContainer?.addEventListener('click',e=>this.handlePropertyCardClick(e));
    this.initRevealObserver();
  },
  scrollToSection(selector){
    const el=document.querySelector(selector);
    if(!el)return;
    const top=el.getBoundingClientRect().top+window.scrollY-CONFIG.navScrollOffset;
    window.scrollTo({top,behavior:'smooth'});
  },
  initSearchDropdown(){
    this.searchTypeField?.addEventListener('click',e=>{e.stopPropagation();this.toggleSearchDropdown()});
    this.searchTypeField?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.toggleSearchDropdown()}});
    this.searchTypeDropdown?.querySelectorAll('.search-dropdown-item').forEach(item=>{
      item.addEventListener('click',e=>{
        e.stopPropagation();
        const type=item.dataset.type||PROPERTY_FILTER_ALL;
        this.setSearchType(type);
        this.closeSearchDropdown();
      });
    });
  },
  toggleSearchDropdown(){
    const open=this.searchTypeDropdown?.hasAttribute('hidden');
    if(open){this.searchTypeDropdown.removeAttribute('hidden');this.searchTypeField?.setAttribute('aria-expanded','true')}
    else this.closeSearchDropdown();
  },
  closeSearchDropdown(){
    this.searchTypeDropdown?.setAttribute('hidden','');
    this.searchTypeField?.setAttribute('aria-expanded','false');
  },
  setSearchType(type){
    this.searchTypeDropdown?.querySelectorAll('.search-dropdown-item').forEach(item=>{
      item.classList.toggle('active',item.dataset.type===type);
    });
    const label=type===PROPERTY_FILTER_ALL?'همه انواع':type;
    if(this.searchTypeValue)this.searchTypeValue.innerHTML=`${escapeHTML(label)} <i data-lucide="chevron-down" class="dropdown-arrow"></i>`;
    createIcons({icons:CONFIG.icons,attrs:CONFIG.iconDefaults});
  },
  initMobileSearch(){
    if(!this.mobileSearchInput)return;
    this.renderMobileSuggestions();
    this.mobileSearchInput.addEventListener('input',()=>{
      this.searchQuery=this.mobileSearchInput.value.trim();
      this.mobileSearchClear?.toggleAttribute('hidden',!this.searchQuery);
      this.applyFiltersAndSearch({scroll:false});
    });
    this.mobileSearchInput.addEventListener('focus',()=>{
      this.mobileSearchWrap?.classList.add('is-focused');
      this.openMobileSearchSuggestions();
    });
    this.mobileSearchInput.addEventListener('keydown',e=>{
      if(e.key==='Enter'){
        e.preventDefault();
        this.closeMobileSearchSuggestions();
        this.mobileSearchInput.blur();
        this.scrollToSection('#residences');
      }
    });
    this.mobileSearchClear?.addEventListener('click',e=>{
      e.preventDefault();
      this.clearSearch();
    });
    this.mobileTypeSuggestions?.addEventListener('click',e=>{
      const chip=e.target.closest('[data-suggest-type]');
      if(!chip)return;
      this.applyFilter(chip.dataset.suggestType,{scroll:true});
      this.closeMobileSearchSuggestions();
      this.mobileSearchInput.blur();
    });
    this.mobileQuerySuggestions?.addEventListener('click',e=>{
      const chip=e.target.closest('[data-suggest-query]');
      if(!chip)return;
      this.searchQuery=chip.dataset.suggestQuery||'';
      this.mobileSearchInput.value=this.searchQuery;
      this.mobileSearchClear?.toggleAttribute('hidden',!this.searchQuery);
      this.applyFiltersAndSearch({scroll:true});
      this.closeMobileSearchSuggestions();
      this.mobileSearchInput.blur();
    });
  },
  renderMobileSuggestions(){
    if(this.mobileTypeSuggestions){
      this.mobileTypeSuggestions.innerHTML=PROPERTY_TYPES.map(type=>`<button type="button" class="m-suggest-chip" data-suggest-type="${escapeHTML(type)}">${escapeHTML(type)}</button>`).join('');
    }
    if(this.mobileQuerySuggestions){
      this.mobileQuerySuggestions.innerHTML=SUGGESTED_SEARCHES.map(q=>`<button type="button" class="m-suggest-chip" data-suggest-query="${escapeHTML(q)}">${escapeHTML(q)}</button>`).join('');
    }
  },
  openMobileSearchSuggestions(){
    if(!this.mobileSearchSuggestions)return;
    this.mobileSearchSuggestions.removeAttribute('hidden');
    this.mobileSearchInput?.setAttribute('aria-expanded','true');
    this.mobileSearchWrap?.classList.add('has-suggestions');
  },
  closeMobileSearchSuggestions(){
    this.mobileSearchSuggestions?.setAttribute('hidden','');
    this.mobileSearchInput?.setAttribute('aria-expanded','false');
    this.mobileSearchWrap?.classList.remove('has-suggestions','is-focused');
  },
  clearSearch(){
    this.searchQuery='';
    if(this.mobileSearchInput)this.mobileSearchInput.value='';
    this.mobileSearchClear?.setAttribute('hidden','');
    this.applyFiltersAndSearch({scroll:false});
  },
  propertyMatchesQuery(property,query){
    if(!query)return true;
    const q=query.toLowerCase();
    const haystack=[property.title,property.location,property.type,property.description].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(q);
  },
  getFilteredProperties(){
    let results=this.allProperties;
    if(this.currentFilter!==PROPERTY_FILTER_ALL){
      results=results.filter(p=>p.type===this.currentFilter);
    }
    if(this.searchQuery){
      results=results.filter(p=>this.propertyMatchesQuery(p,this.searchQuery));
    }
    return results;
  },
  async loadProperties(){
    if(!this.propertiesContainer)return;
    this.propertiesContainer.innerHTML='<p class="properties-loading">در حال بارگذاری املاک...</p>';
    try{
      const r=await fetch(`${API_BASE}/properties`);
      if(!r.ok)throw new Error('failed');
      const d=await r.json();
      this.allProperties=d.properties||[];
      if(!this.allProperties.length){
        this.propertiesContainer.innerHTML='<p class="properties-error">هیچ ملکی یافت نشد.</p>';
        this.updateResultsMeta(0);
        return;
      }
      this.applyFiltersAndSearch({scroll:false});
    }catch(e){
      this.propertiesContainer.innerHTML=`<div class="properties-empty-state"><h3>دریافت اطلاعات با مشکل مواجه شد</h3><p>لطفاً دوباره تلاش کنید.</p><button type="button" class="btn-gold-outline" id="retryPropertiesLoad">تلاش مجدد</button></div>`;
      document.getElementById('retryPropertiesLoad')?.addEventListener('click',()=>this.loadProperties());
    }
  },
  applyFilter(type,{scroll=false}={}){
    this.currentFilter=type||PROPERTY_FILTER_ALL;
    this.filterBtns.forEach(b=>b.classList.toggle('active',(b.dataset.type||b.textContent.trim())===this.currentFilter));
    this.setSearchType(this.currentFilter);
    this.applyFiltersAndSearch({scroll});
  },
  applyFiltersAndSearch({scroll=false}={}){
    const filtered=this.getFilteredProperties();
    this.renderPropertyResults(filtered);
    if(scroll)this.scrollToSection('#residences');
  },
  renderPropertyResults(properties){
    if(!this.propertiesContainer)return;
    if(!properties.length){
      const hasSearch=!!this.searchQuery;
      const hasFilter=this.currentFilter!==PROPERTY_FILTER_ALL;
      let message='در حال حاضر گزینه‌ای در این دسته موجود نیست.';
      if(hasSearch&&hasFilter)message=`ملکی با عبارت «${escapeHTML(this.searchQuery)}» در ${escapeHTML(this.currentFilter)} پیدا نشد.`;
      else if(hasSearch)message='ملکی با این مشخصات پیدا نشد';
      this.propertiesContainer.innerHTML=`<div class="properties-empty-state"><h3>${hasSearch?'ملکی با این مشخصات پیدا نشد':'ملکی یافت نشد'}</h3><p>${message}</p><button type="button" class="btn-gold-outline" id="resetPropertiesFilter">مشاهده همه املاک</button></div>`;
      document.getElementById('resetPropertiesFilter')?.addEventListener('click',()=>{
        this.currentFilter=PROPERTY_FILTER_ALL;
        this.clearSearch();
        this.applyFilter(PROPERTY_FILTER_ALL,{scroll:true});
      });
      this.updateResultsMeta(0);
      return;
    }
    this.propertiesContainer.innerHTML=properties.map(p=>this.renderCard(p)).join('');
    this.propertyCards=document.querySelectorAll('.property-card');
    createIcons({icons:CONFIG.icons,attrs:CONFIG.iconDefaults});
    this.initShareButtons();this.initFavoriteButtons();
    this.revealElements=document.querySelectorAll('.reveal');this.initRevealObserver();
    this.updateResultsMeta(properties.length);
  },
  updateResultsMeta(count){
    if(!this.propertiesResultsMeta)return;
    const n=count.toLocaleString('fa-IR');
    if(this.searchQuery){
      this.propertiesResultsMeta.textContent=`${n} ملک پیدا شد`;
      return;
    }
    if(this.currentFilter===PROPERTY_FILTER_ALL){
      this.propertiesResultsMeta.textContent=`${n} ملک`;
      return;
    }
    this.propertiesResultsMeta.textContent=`${n} ${this.currentFilter} منتخب`;
  },
  renderCard(p){
    const propertyId=escapeHTML(p._id||'');
    const propertyType=escapeHTML(p.type||'');
    const propertyTitle=escapeHTML(p.title||'');
    const propertyLocation=escapeHTML(p.location||'');
    const listingType=escapeHTML(p.listingType||'آگهی ویژه');
    const f=p.features||{};const all={...(f.common||{}),...(f.specific||{}),...(f.luxury||{})};
    const cfg=getFeaturesForType(p.type);const allCfg=[...(cfg.common||[]),...(cfg.specific||[]),...(cfg.luxury||[])];
    const feats=[];allCfg.forEach(c=>{const v=all[c.key];if(v===true||(typeof v==='number'&&v>0)||(typeof v==='string'&&v.length>0)){const valueText=typeof v==='number'&&c.field_type==='number'?`${escapeHTML(v)} `:'';feats.push(`<span class="feature-item"><i data-lucide="${escapeHTML(c.icon||'car')}"></i> ${valueText}${escapeHTML(c.label_fa)}</span>`)}});
    const pf=formatPrice(p.price);const price=pf?`${escapeHTML(pf)} تومان`:'<button type="button" class="contact-price-link" data-scroll-target="contact">تماس بگیرید</button>';
    const img=escapeHTML(p.image||(p.images&&p.images[0])||'');
    const locationRow=propertyLocation?`<p class="m-card-location"><i data-lucide="map-pin"></i> ${propertyLocation}</p>`:'';
    return`<article class="property-card reveal" data-type="${propertyType}" data-price="${escapeHTML(p.price||0)}" data-id="${propertyId}">
      <div class="card-image" data-property-link="true">
        ${img?`<img src="${img}" alt="${propertyTitle}" loading="lazy">`:''}
        <span class="m-card-type">${propertyType}</span>
        <div class="card-image-badge">${p.isExclusive?'<span class="badge badge-exclusive">اختصاصی</span>':''}</div>
        <div class="card-actions-top"><button type="button" class="card-action-icon favorite-btn" aria-label="افزودن به علاقه‌مندی"><i data-lucide="heart"></i></button><button type="button" class="card-action-icon share-btn" aria-label="اشتراک‌گذاری"><i data-lucide="share-2"></i></button></div>
        ${p.images&&p.images.length>1?`<span class="badge badge-image-count">${escapeHTML(p.images.length)} عکس</span>`:''}
      </div>
      <div class="card-details">
        <h3 class="card-title" data-property-link="true">${propertyTitle}</h3>
        ${locationRow}
        <p class="card-price">${price}</p>
        <p class="card-listing-type">${listingType}</p>
        <div class="card-features">
          ${p.beds>0?`<span class="feature-item"><i data-lucide="bed"></i> ${escapeHTML(p.beds)} خواب</span>`:''}
          ${p.baths>0?`<span class="feature-item"><i data-lucide="bath"></i> ${escapeHTML(p.baths)} حمام</span>`:''}
          ${p.area>0?`<span class="feature-item"><i data-lucide="maximize-2"></i> ${escapeHTML(p.area)} متر</span>`:''}
          ${feats.slice(0,2).join('')}
        </div>
        <div class="card-buttons">
          <a href="/property/?id=${propertyId}" class="btn-card-primary"><i data-lucide="eye"></i> مشاهده ملک</a>
          <button type="button" class="btn-card-secondary" data-request-property="true"><i data-lucide="calendar"></i> بازدید</button>
        </div>
      </div></article>`;
  },
  async loadAgents(){
    if(!this.agentsContainer)return;
    try{
      const r=await fetch(`${API_BASE}/agents`);
      if(!r.ok)throw new Error('failed');
      const d=await r.json();
      if(!d.agents?.length){
        this.agentsContainer.innerHTML='<p class="section-empty-note">اطلاعات مشاوران به زودی در دسترس خواهد بود.</p>';
        return;
      }
      this.agentsContainer.innerHTML=d.agents.map(a=>this.renderAgentCard(a)).join('');
      createIcons({icons:CONFIG.icons,attrs:CONFIG.iconDefaults});
    }catch(e){
      this.agentsContainer.innerHTML='<p class="section-empty-note">دریافت اطلاعات مشاوران با مشکل مواجه شد. لطفاً دوباره تلاش کنید.</p>';
    }
  },
  renderAgentCard(agent){
    const name=escapeHTML(agent.name||'');
    const title=escapeHTML(agent.title||'');
    const bio=escapeHTML(agent.bio||'');
    const phone=escapeHTML(agent.phone||'');
    const email=escapeHTML(agent.email||'');
    const photo=escapeHTML(agent.photo||AGENT_PLACEHOLDER);
    const phoneLink=agent.phone?`<a href="tel:${phone}" class="agent-contact-link"><i data-lucide="phone"></i> ${phone}</a>`:'';
    const emailLink=agent.email?`<a href="mailto:${email}" class="agent-contact-link"><i data-lucide="mail"></i> ${email}</a>`:'';
    return`<article class="agent-card reveal"><div class="agent-card-photo" style="background-image:url('${photo}')" role="img" aria-label="${name}"></div><div class="agent-card-body"><h3 class="agent-card-name">${name}</h3>${title?`<p class="agent-card-title">${title}</p>`:''}${bio?`<p class="agent-card-bio">${bio}</p>`:''}<div class="agent-card-contacts">${phoneLink}${emailLink}</div></div></article>`;
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
  toggleMobileMenu(force=false){
    const o=force?false:!this.navLinksContainer.classList.contains('active');
    this.navLinksContainer.classList.toggle('active',o);
    this.mobileToggle?.setAttribute('aria-expanded',o);
    this.mobileMenuClose?.toggleAttribute('hidden',!o);
    document.body.classList.toggle('no-scroll',o);
    const icon=this.mobileToggle?.querySelector('[data-lucide]');
    if(icon){icon.setAttribute('data-lucide',o?'x':'menu');createIcons({icons:CONFIG.icons,attrs:CONFIG.iconDefaults})}
  },
  setActiveLink(){const pos=scrollY+120;this.sections.forEach(s=>{if(pos>=s.offsetTop&&pos<s.offsetTop+s.offsetHeight)this.navLinks.forEach(l=>l.classList.toggle('active',l.getAttribute('href')===`#${s.id}`))})},
  initRevealObserver(){if(this._obs)this._obs.disconnect();this._obs=new IntersectionObserver(e=>e.forEach(en=>{if(en.isIntersecting){en.target.classList.add('revealed');this._obs.unobserve(en.target)}}),CONFIG.revealOptions);this.revealElements.forEach(el=>this._obs.observe(el))},
  search(){
    const active=this.searchTypeDropdown?.querySelector('.search-dropdown-item.active');
    const type=active?.dataset.type||PROPERTY_FILTER_ALL;
    this.applyFilter(type,{scroll:true});
  },
  submitForm(e){e.preventDefault();const n=document.getElementById('name').value.trim(),em=document.getElementById('email').value.trim(),msg=document.getElementById('message').value.trim();if(!n||!em||!msg)return this.toast('فیلدهای ضروری را پر کنید','error');const btn=this.contactForm.querySelector('button');const t=btn.textContent;btn.textContent='...';btn.disabled=true;fetch(`${API_BASE}/customers`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n,email:em,message:msg})}).then(()=>{this.toast('پیام ارسال شد','success');this.contactForm.reset()}).catch(()=>this.toast('خطا','error')).finally(()=>{btn.textContent=t;btn.disabled=false})},
  toast(msg,type='info'){if(!this.notification)return;if(this._t)clearTimeout(this._t);this.notification.textContent=msg;this.notification.className=`notification notification-${type} visible`;this._t=setTimeout(()=>this.notification.classList.remove('visible'),3000)},

  // ===== REQUEST MODAL =====
  createRequestModal(){
    const modal=document.createElement('div');modal.className='request-modal-overlay';modal.id='requestModal';
    modal.innerHTML=`<div class="request-modal-card"><button type="button" class="request-modal-close" data-close-request-modal="true">×</button><h3 class="request-modal-title">درخواست اطلاعات بیشتر</h3><p class="request-modal-subtitle" id="requestModalProperty">برای این ملک درخواست خود را ثبت کنید</p><form id="requestForm" class="request-modal-form"><input type="hidden" id="requestPropertyId"><input type="text" id="requestName" placeholder="نام و نام خانوادگی *" required><input type="tel" id="requestPhone" placeholder="شماره تماس *" required><textarea id="requestMessage" rows="3" placeholder="توضیحات (اختیاری)"></textarea><button type="submit" class="btn-gold-solid" style="width:100%">ارسال درخواست</button></form><div id="requestMessage" class="admin-message" style="margin-top:12px"></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('[data-close-request-modal="true"]')?.addEventListener('click',()=>{modal.classList.remove('active');document.body.classList.remove('no-scroll')});
    modal.querySelector('#requestForm')?.addEventListener('submit',e=>this.submitRequest(e));
  },
  openRequestModal(id,title){
    document.getElementById('requestPropertyId').value=id;
    document.getElementById('requestModalProperty').textContent=title;
    document.getElementById('requestModal').classList.add('active');
    document.body.classList.add('no-scroll');
  },
  submitRequest(e){
    e.preventDefault();const btn=e.target.querySelector('button');const orig=btn.textContent;btn.textContent='در حال ارسال...';btn.disabled=true;
    fetch(`${API_BASE}/customers`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:document.getElementById('requestName').value,email:document.getElementById('requestPhone').value+'@request.astoria',phone:document.getElementById('requestPhone').value,message:`درخواست برای: ${document.getElementById('requestModalProperty').textContent}\n${document.getElementById('requestMessage').value}`})}).then(r=>r.json()).then(()=>{document.getElementById('requestMessage').className='admin-message success';document.getElementById('requestMessage').textContent='درخواست با موفقیت ارسال شد';document.getElementById('requestForm').reset();setTimeout(()=>{document.getElementById('requestModal').classList.remove('active');document.getElementById('requestMessage').textContent='';document.body.classList.remove('no-scroll')},2000)}).catch(()=>{document.getElementById('requestMessage').className='admin-message error';document.getElementById('requestMessage').textContent='خطا رخ داد'}).finally(()=>{btn.textContent=orig;btn.disabled=false});
  }
};

Astoria.init();