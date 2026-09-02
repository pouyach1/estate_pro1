/* ==============================================
   ASTORIA ELITE ESTATES — Pro App v4.0
   Self-contained — Features embedded
   ============================================== */

import { createIcons, Menu, Search, Bed, Bath, Maximize2, Crown, UserCheck, TrendingUp, ShieldCheck, MapPin, Phone, Mail, ArrowUp, Heart, X, ChevronDown, ChevronLeft, Eye, Calendar, Share2, Car, Warehouse, Thermometer, Wind, Waves, Camera, Dumbbell, Building, Palette, Users, Gamepad, Film, Video, ArrowUpDown, Home } from 'lucide';
import { formatPrice, formatPriceDisplay, getPropertyMetric, getStatusLabel, escapeHTML } from './js/shared/format.js';
import { getSiteConfig, applyHomepageSeo } from './js/shared/seo.js';

const API_BASE = '/api';
const PROPERTY_FILTER_ALL = 'همه';
const PROPERTY_TYPES = ['ویلا', 'آپارتمان', 'پنت‌هاوس', 'باغ', 'زمین', 'دفتر کار'];
const SUGGESTED_SEARCHES = ['ویلا', 'آپارتمان', 'تهران', 'زعفرانیه', 'پنت‌هاوس'];
const BUDGET_RANGES = {
  all: { label: 'همه بودجه‌ها', min: 0, max: Infinity },
  under20: { label: 'تا ۲۰ میلیارد', min: 0, max: 20_000_000_000 },
  '20to50': { label: '۲۰ تا ۵۰ میلیارد', min: 20_000_000_000, max: 50_000_000_000 },
  over50: { label: 'بالای ۵۰ میلیارد', min: 50_000_000_000, max: Infinity },
};
const AGENT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23121822'/%3E%3Ccircle cx='50' cy='36' r='18' fill='%23c8c8c2'/%3E%3Cpath d='M20 88c4-18 18-28 30-28s26 10 30 28' fill='%23c8c8c2'/%3E%3C/svg%3E";

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
function renderLoadingSkeleton() {
  return `<div class="properties-skeleton" aria-busy="true" aria-label="در حال بارگذاری املاک">${[1, 2, 3].map(() => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-image"></div>
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line skeleton-line--long"></div>
        <div class="skeleton-line skeleton-line--medium"></div>
      </div>
    </div>`).join('')}</div>`;
}

// ===== CONFIG =====
const CONFIG = { icons:{Menu,Search,Bed,Bath,Maximize2,Crown,UserCheck,TrendingUp,ShieldCheck,MapPin,Phone,Mail,ArrowUp,Heart,X,ChevronDown,ChevronLeft,Eye,Calendar,Share2,Car,Warehouse,Thermometer,Wind,Waves,Camera,Dumbbell,Building,Palette,Users,Gamepad,Film,Video,ArrowUpDown,Home}, iconDefaults:{'stroke-width':1.5,width:20,height:20}, storageKey:'astoria_favorites', scrollThreshold:60, backToTopThreshold:500, revealOptions:{threshold:0.15,rootMargin:'0px 0px -40px 0px'}, navScrollOffset:110 };

// ===== ASTORIA APP =====
const Astoria = {
  async init(){
    this.allProperties=[];
    this.featuredProperty=null;
    this.currentFilter=PROPERTY_FILTER_ALL;
    this.currentBudget='all';
    this.searchQuery='';
    try {
      const site = await getSiteConfig();
      await applyHomepageSeo(site);
    } catch (_) { /* SEO bootstrap optional */ }
    this.heroImages=[];
    this.heroSlideIndex=0;
    this.heroActiveLayer='a';
    this.cacheDOM();this.initIcons();this.bindEvents();this.setActiveLink();
    this.initSearchDropdown();
    this.initBudgetDropdown();
    this.initDesktopLocationSearch();
    this.initMobileSearch();
    this.loadProperties();this.loadFeaturedProperty();this.loadAgents();this.loadSettings();
    this.createRequestModal();
    requestAnimationFrame(()=>{
      document.body.classList.add('is-ready');
    });
    console.log('%cASTORIA %cElite Estates','color:#2D5A4C;font-weight:bold;','color:#5C5F5E;');
  },
  cacheDOM(){
    this.navbar=document.querySelector('.astoria-nav');
    this.mobileToggle=document.querySelector('.mobile-menu-toggle');
    this.mobileMenuClose=document.querySelector('.mobile-menu-close');
    this.navLinksContainer=document.querySelector('.nav-links');this.navLinks=document.querySelectorAll('.nav-links a');
    this.backToTop=document.getElementById('back-to-top');this.notification=document.getElementById('notification');
    this.sections=document.querySelectorAll('section[id]');this.filterBtns=document.querySelectorAll('.filter-btn');
    this.propertiesContainer=document.getElementById('propertiesContainer');this.searchBtn=document.querySelector('.btn-search-primary');
    this.searchTypeField=document.getElementById('searchTypeField');this.searchTypeValue=document.getElementById('searchTypeValue');
    this.searchTypeDropdown=document.getElementById('searchTypeDropdown');
    this.searchBudgetField=document.getElementById('searchBudgetField');
    this.searchBudgetValue=document.getElementById('searchBudgetValue');
    this.searchBudgetDropdown=document.getElementById('searchBudgetDropdown');
    this.desktopLocationSearch=document.getElementById('desktopLocationSearch');
    this.propertiesResultsMeta=document.getElementById('propertiesResultsMeta');
    this.featuredContainer=document.getElementById('featuredProperty');
    this.featuredSection=document.getElementById('featured');
    this.philosophyImage=document.getElementById('philosophyImage');
    this.agentsContainer=document.getElementById('agentsContainer');
    this.mobileSearchInput=document.getElementById('mobilePropertySearch');
    this.mobileSearchClear=document.getElementById('mobileSearchClear');
    this.mobileSearchSuggestions=document.getElementById('mobileSearchSuggestions');
    this.mobileSearchWrap=document.getElementById('mobileSearchWrap');
    this.mobileTypeSuggestions=document.getElementById('mobileTypeSuggestions');
    this.mobileQuerySuggestions=document.getElementById('mobileQuerySuggestions');
    this.contactForm=document.querySelector('.contact-form');
    this.revealElements=document.querySelectorAll('.reveal');this.favorites=JSON.parse(localStorage.getItem(CONFIG.storageKey)||'[]');
  },
  initIcons(){createIcons({icons:CONFIG.icons,attrs:CONFIG.iconDefaults})},
  bindEvents(){
.window.addEventListener('scroll',()=>{
      const y=scrollY;
      this.navbar.classList.toggle('scrolled',y>CONFIG.scrollThreshold);
      this.backToTop?.classList.toggle('visible',y>CONFIG.backToTopThreshold);
      this.setActiveLink();
      this.updateHeroParallax(y);
    },{passive:true});
    this.mobileToggle?.addEventListener('click',()=>this.toggleMobileMenu());
    this.mobileMenuClose?.addEventListener('click',()=>this.toggleMobileMenu(true));
    this.navLinks.forEach(l=>l.addEventListener('click',e=>{const href=e.target.getAttribute('href');if(href?.startsWith('#')){e.preventDefault();this.scrollToSection(href)}this.toggleMobileMenu(true)}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){this.toggleMobileMenu(true);this.closeSearchDropdown();this.closeBudgetDropdown();this.closeMobileSearchSuggestions()}});
    document.addEventListener('click',e=>{if(!e.target.closest('#searchTypeField'))this.closeSearchDropdown();if(!e.target.closest('#searchBudgetField'))this.closeBudgetDropdown();if(!e.target.closest('#mobileSearchWrap'))this.closeMobileSearchSuggestions()});
    this.backToTop?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
    this.filterBtns.forEach(b=>b.addEventListener('click',()=>this.applyFilter(b.dataset.type||b.textContent.trim(),{scroll:false})));
    this.searchBtn?.addEventListener('click',()=>this.search());
    this.contactForm?.addEventListener('submit',e=>this.submitForm(e));
    document.querySelectorAll('.home-nav-cta').forEach(b=>b.addEventListener('click',()=>{this.scrollToSection('#consultation');this.toggleMobileMenu(true)}));
    document.querySelectorAll('.concierge-btn').forEach(b=>b.addEventListener('click',()=>this.scrollToSection('#contact')));
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
  initBudgetDropdown(){
    this.searchBudgetField?.addEventListener('click',e=>{e.stopPropagation();this.toggleBudgetDropdown()});
    this.searchBudgetField?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.toggleBudgetDropdown()}});
    this.searchBudgetDropdown?.querySelectorAll('.search-dropdown-item').forEach(item=>{
      item.addEventListener('click',e=>{
        e.stopPropagation();
        const budget=item.dataset.budget||'all';
        this.setBudget(budget);
        this.closeBudgetDropdown();
      });
    });
  },
  toggleBudgetDropdown(){
    const open=this.searchBudgetDropdown?.hasAttribute('hidden');
    if(open){this.searchBudgetDropdown.removeAttribute('hidden');this.searchBudgetField?.setAttribute('aria-expanded','true')}
    else this.closeBudgetDropdown();
  },
  closeBudgetDropdown(){
    this.searchBudgetDropdown?.setAttribute('hidden','');
    this.searchBudgetField?.setAttribute('aria-expanded','false');
  },
  setBudget(budget){
    this.currentBudget=budget||'all';
    this.searchBudgetDropdown?.querySelectorAll('.search-dropdown-item').forEach(item=>{
      item.classList.toggle('active',item.dataset.budget===this.currentBudget);
    });
    const label=BUDGET_RANGES[this.currentBudget]?.label||'همه بودجه‌ها';
    if(this.searchBudgetValue)this.searchBudgetValue.innerHTML=`${escapeHTML(label)} <i data-lucide="chevron-down" class="dropdown-arrow"></i>`;
    createIcons({icons:CONFIG.icons,attrs:CONFIG.iconDefaults});
  },
  initDesktopLocationSearch(){
    if(!this.desktopLocationSearch)return;
    let debounce;
    this.desktopLocationSearch.addEventListener('input',()=>{
      clearTimeout(debounce);
      debounce=setTimeout(()=>{
        this.searchQuery=this.desktopLocationSearch.value.trim();
        if(this.mobileSearchInput)this.mobileSearchInput.value=this.searchQuery;
        this.mobileSearchClear?.toggleAttribute('hidden',!this.searchQuery);
        this.applyFiltersAndSearch({scroll:false});
      },280);
    });
    this.desktopLocationSearch.addEventListener('keydown',e=>{
      if(e.key==='Enter'){e.preventDefault();this.search()}
    });
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
    if(this.desktopLocationSearch)this.desktopLocationSearch.value='';
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
    const range=BUDGET_RANGES[this.currentBudget]||BUDGET_RANGES.all;
    if(this.currentBudget!=='all'){
      results=results.filter(p=>{
        const price=Number(p.price)||0;
        return price>=range.min&&price<range.max;
      });
    }
    return results;
  },
  async loadFeaturedProperty(){
    try{
      const r=await fetch(`${API_BASE}/properties/featured/home`);
      if(!r.ok)return;
      const d=await r.json();
      this.featuredProperty=d.property||null;
    }catch(e){}
  },
  async loadProperties(){
    if(!this.propertiesContainer)return;
    this.propertiesContainer.innerHTML=renderLoadingSkeleton();
    try{
      const r=await fetch(`${API_BASE}/properties`);
      if(!r.ok)throw new Error('failed');
      const d=await r.json();
      this.allProperties=d.properties||[];
      if(!this.allProperties.length){
        this.propertiesContainer.innerHTML='<p class="properties-error">هیچ ملکی یافت نشد.</p>';
        this.featuredSection?.setAttribute('hidden','');
        this.updateResultsMeta(0);
        return;
      }
      this.initHeroSlideshow();
      this.setPhilosophyImage();
      this.applyFiltersAndSearch({scroll:false});
    }catch(e){
      this.propertiesContainer.innerHTML=`<div class="properties-empty-state"><h3>دریافت اطلاعات با مشکل مواجه شد</h3><p>لطفاً دوباره تلاش کنید.</p><button type="button" class="btn-secondary" id="retryPropertiesLoad">تلاش مجدد</button></div>`;
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
      this.propertiesContainer.innerHTML=`<div class="properties-empty-state astoria-empty-state">
        <p class="astoria-empty-eyebrow">انتخاب فعلی</p>
        <h3>نتیجه‌ای یافت نشد</h3>
        <p>انتخاب فعلی نتیجه‌ای نداشت. مشاوران آستوریا می‌توانند گزینه‌های مشابه یا اختصاصی را برای شما پیدا کنند.</p>
        <div class="astoria-empty-actions">
          <button type="button" class="btn-primary" id="emptyConsultationCta">درخواست مشاوره اختصاصی</button>
          <button type="button" class="btn-secondary" id="resetPropertiesFilter">مشاهده همه املاک</button>
        </div>
      </div>`;
      this.featuredSection?.setAttribute('hidden','');
      if(this.featuredContainer)this.featuredContainer.innerHTML='';
      document.getElementById('emptyConsultationCta')?.addEventListener('click',()=>this.scrollToSection('#consultation'));
      document.getElementById('resetPropertiesFilter')?.addEventListener('click',()=>{
        this.currentFilter=PROPERTY_FILTER_ALL;
        this.currentBudget='all';
        this.setBudget('all');
        this.clearSearch();
        this.applyFilter(PROPERTY_FILTER_ALL,{scroll:true});
      });
      this.updateResultsMeta(0);
      return;
    }

    const sorted=[...properties].sort((a,b)=>(Number(b.sortOrder)||0)-(Number(a.sortOrder)||0)||(Number(b.price)||0)-(Number(a.price)||0));
    let featured=this.featuredProperty&&properties.some(p=>p._id===this.featuredProperty._id)?this.featuredProperty:sorted.find(p=>p.isFeatured)||sorted[0];
    if(featured&&!properties.some(p=>p._id===featured._id))featured=sorted[0];
    const collection=sorted.filter(p=>featured&&p._id!==featured._id);

    this.renderFeatured(featured);
    this.propertiesContainer.innerHTML=collection.length
      ?collection.map((p,i)=>this.renderCard(p,i)).join('')
      :'<p class="properties-empty-note section-empty-note">سایر املاک این مجموعه در حال حاضر در دسترس نیست.</p>';
    this.propertyCards=document.querySelectorAll('.property-card');
    createIcons({icons:CONFIG.icons,attrs:CONFIG.iconDefaults});
    this.initShareButtons();this.initFavoriteButtons();
    this.revealElements=document.querySelectorAll('.reveal');this.initRevealObserver();
    this.updateResultsMeta(properties.length);
  },
  renderFeatured(p){
    if(!this.featuredContainer||!this.featuredSection||!p){
      this.featuredSection?.setAttribute('hidden','');
      return;
    }
    const id=escapeHTML(p._id||'');
    const type=escapeHTML(p.type||'');
    const title=escapeHTML(p.title||'');
    const location=escapeHTML(p.location||'');
    const img=escapeHTML(p.image||(p.images&&p.images[0])||'');
    const pf=formatPrice(p.price);
    const price=pf?`${escapeHTML(pf)} تومان`:'تماس برای اطلاع از قیمت';
    const metric=getPropertyMetric(p);
    const beds=p.bedrooms!=null?`<span class="featured-metric"><i data-lucide="bed"></i> ${escapeHTML(String(p.bedrooms))} خواب</span>`:'';
    const baths=p.bathrooms!=null?`<span class="featured-metric"><i data-lucide="bath"></i> ${escapeHTML(String(p.bathrooms))} حمام</span>`:'';
    const area=metric?`<span class="featured-metric"><i data-lucide="maximize-2"></i> ${escapeHTML(metric)}</span>`:'';
    this.featuredContainer.innerHTML=`
      <a href="/property/?id=${id}" class="featured-property-link">
        <div class="featured-property-image" style="background-image:url('${img}')" role="img" aria-label="${title}"></div>
        <div class="featured-property-body">
          <span class="featured-property-type">${type}</span>
          <h3 class="featured-property-title">${title}</h3>
          ${location?`<p class="featured-property-location"><i data-lucide="map-pin"></i> ${location}</p>`:''}
          <div class="featured-property-metrics">${beds}${baths}${area}</div>
          <p class="featured-property-price">${price}</p>
          <span class="featured-property-cta">مشاهده پروندهٔ کامل <i data-lucide="chevron-left"></i></span>
        </div>
      </a>`;
    this.featuredSection.removeAttribute('hidden');
    createIcons({icons:CONFIG.icons,attrs:CONFIG.iconDefaults});
  },
  updateResultsMeta(count){
    if(!this.propertiesResultsMeta)return;
    const n=count.toLocaleString('fa-IR');
    let label='نتایج انتخاب‌شده برای شما';
    if(this.searchQuery)label=`نتایج جستجو برای «${escapeHTML(this.searchQuery)}»`;
    else if(this.currentFilter!==PROPERTY_FILTER_ALL)label=`${escapeHTML(this.currentFilter)} منتخب`;
  else if(this.currentBudget!=='all')label='نتایج بر اساس بودجه شما';
    const countLabel=count===0?'بدون نتیجه':`${n} اقامتگاه مطابق انتخاب شما`;
    this.propertiesResultsMeta.innerHTML=`<span class="collection-meta-label">${label}</span><span class="collection-meta-count">${countLabel}</span>`;
  },
  renderCard(p,layoutIndex=0){
    const variant=layoutIndex%5===0?'collection-card--wide':layoutIndex%5===2?'collection-card--tall':'';
    const propertyId=escapeHTML(p._id||'');
    const propertyType=escapeHTML(p.type||'');
    const propertyTitle=escapeHTML(p.title||'');
    const propertyLocation=escapeHTML(p.location||'');
    const pf=formatPrice(p.price);const price=pf?`${escapeHTML(pf)} تومان`:'<span class="card-price-contact">تماس برای اطلاع از قیمت</span>';
    const img=escapeHTML(p.image||(p.images&&p.images[0])||'');
    const locationRow=propertyLocation?`<p class="m-card-location"><i data-lucide="map-pin"></i> ${propertyLocation}</p>`:'';
    const metric=getPropertyMetric(p);
    const metricRow=metric?`<p class="m-card-metric"><i data-lucide="maximize-2"></i> ${escapeHTML(metric)}</p>`:'';
    const statusLabel=getStatusLabel(p.status);
    const statusBadge=p.isExclusive?'<span class="m-card-status m-card-status--exclusive">اختصاصی آستوریا</span>':statusLabel&&p.status==='reserved'?`<span class="m-card-status m-card-status--reserved">${escapeHTML(statusLabel)}</span>`:'';
    const indexLabel=String(layoutIndex+1).padStart(2,'0');
    return`<article class="property-card collection-card reveal ${variant}" data-type="${propertyType}" data-price="${escapeHTML(p.price||0)}" data-id="${propertyId}">
      <div class="card-image" data-property-link="true">
        ${img?`<img src="${img}" alt="${propertyTitle}${propertyLocation ? ` — ${propertyLocation}` : ''}" loading="lazy">`:''}
        <span class="m-card-type">${propertyType}</span>
        <span class="card-index" aria-hidden="true">${indexLabel}</span>
        ${statusBadge}
        <div class="card-actions-top"><button type="button" class="card-action-icon favorite-btn" aria-label="افزودن به علاقه‌مندی"><i data-lucide="heart"></i></button><button type="button" class="card-action-icon share-btn" aria-label="اشتراک‌گذاری"><i data-lucide="share-2"></i></button></div>
      </div>
      <div class="card-details">
        <h3 class="card-title" data-property-link="true">${propertyTitle}</h3>
        ${locationRow}
        ${metricRow}
        <p class="card-price">${price}</p>
        <div class="card-buttons">
          <a href="/property/?id=${propertyId}" class="btn-card-primary"><i data-lucide="eye"></i> مشاهده</a>
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
      this.agentsContainer.innerHTML='<div class="section-empty-note"><p>دریافت اطلاعات مشاوران با مشکل مواجه شد.</p><button type="button" class="btn-secondary" onclick="Astoria.loadAgents()">تلاش مجدد</button></div>';
    }
  },
  renderAgentCard(agent){
    const name=escapeHTML(agent.name||'');
    const title=escapeHTML(agent.title||'');
    const bio=escapeHTML(agent.bio||'');
    const phone=escapeHTML(agent.phone||'');
    const email=escapeHTML(agent.email||'');
    const photo=escapeHTML(agent.photo||AGENT_PLACEHOLDER);
    const phoneLink=agent.phone?`<a href="tel:${phone}" class="advisor-contact-link agent-contact-link"><i data-lucide="phone"></i> ${phone}</a>`:'';
    const emailLink=agent.email?`<a href="mailto:${email}" class="advisor-contact-link agent-contact-link"><i data-lucide="mail"></i> ${email}</a>`:'';
    return`<article class="agent-card advisor-card reveal"><div class="agent-card-photo advisor-card-photo" style="background-image:url('${photo}')" role="img" aria-label="${name}"></div><div class="agent-card-body advisor-card-body"><h3 class="agent-card-name advisor-card-name">${name}</h3>${title?`<p class="agent-card-title advisor-card-title">${title}</p>`:''}${bio?`<p class="agent-card-bio advisor-card-bio">${bio}</p>`:''}<div class="agent-card-contacts advisor-card-contacts">${phoneLink}${emailLink}</div></div></article>`;
  },
  initHeroSlideshow(){
    const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sorted=[...this.allProperties].sort((a,b)=>(Number(b.price)||0)-(Number(a.price)||0));
    this.heroImages=sorted.map(p=>p.image||(p.images&&p.images[0])).filter(Boolean).slice(0,5);
    if(!this.heroImages.length)return;
    const layerA=document.getElementById('homeHeroA');
    const layerB=document.getElementById('homeHeroB');
    if(!layerA||!layerB)return;
    const setBg=(el,src)=>{if(el&&src)el.style.backgroundImage=`url("${src}")`};
    setBg(layerA,this.heroImages[0]);
    setBg(layerB,this.heroImages[1]||this.heroImages[0]);
    if(this.heroImages.length<2||prefersReduced)return;
    if(this._heroTimer)clearInterval(this._heroTimer);
    this._heroTimer=setInterval(()=>{
      this.heroSlideIndex=(this.heroSlideIndex+1)%this.heroImages.length;
      const next=this.heroImages[this.heroSlideIndex];
      const showB=this.heroActiveLayer==='a';
      const fadeIn=showB?layerB:layerA;
      const fadeOut=showB?layerA:layerB;
      setBg(fadeIn,next);
      fadeIn.style.opacity='1';
      fadeOut.style.opacity='0';
      this.heroActiveLayer=showB?'b':'a';
    },8000);
  },
  setPhilosophyImage(){
    if(!this.philosophyImage)return;
    const sorted=[...this.allProperties].sort((a,b)=>(Number(b.price)||0)-(Number(a.price)||0));
    const img=sorted[1]?.image||(sorted[1]?.images&&sorted[1].images[0])||sorted[0]?.image;
    if(img)this.philosophyImage.style.backgroundImage=`url("${img}")`;
  },
  handlePropertyCardClick(e){
    const card=e.target.closest('.property-card');
    if(!card)return;
    if(e.target.closest('.favorite-btn,.share-btn,.btn-card-primary'))return;
    if(e.target.closest('[data-request-property="true"]')){this.openRequestModal(card.getAttribute('data-id'),card.querySelector('.card-title')?.textContent||'');return;}
    if(e.target.closest('[data-property-link="true"]')){window.location.href=`/property/?id=${encodeURIComponent(card.getAttribute('data-id')||'')}`;}
  },
  async loadSettings(){
    try{
      const r=await fetch(`${API_BASE}/settings`);
      const s=await r.json();
      if(s.heroBackground){
        const a=document.getElementById('homeHeroA');
        const b=document.getElementById('homeHeroB');
        if(a){a.style.backgroundImage=`url(${s.heroBackground})`;a.style.backgroundSize='cover'}
        if(b&&!this.heroImages?.length)b.style.backgroundImage=`url(${s.heroBackground})`;
      }
      if(s.contactPhone){
        document.querySelectorAll('.home-contact-link[href^="tel:"], .footer-contact-phone').forEach(el=>{
          el.href=`tel:${s.contactPhone.replace(/\D/g,'')}`;
          const icon=el.querySelector('i');
          el.textContent='';
          if(icon)el.appendChild(icon);
          el.append(' '+s.contactPhone);
        });
      }
      if(s.contactEmail){
        document.querySelectorAll('.home-contact-link[href^="mailto:"], .footer-contact-email').forEach(el=>{
          el.href=`mailto:${s.contactEmail}`;
          const icon=el.querySelector('i');
          el.textContent='';
          if(icon)el.appendChild(icon);
          el.append(' '+s.contactEmail);
        });
      }
      if(s.contactAddress){
        const addr=document.querySelector('.home-contact-address');
        if(addr){
          const icon=addr.querySelector('i');
          addr.textContent='';
          if(icon)addr.appendChild(icon);
          addr.append(' '+s.contactAddress);
        }
      }
    }catch(e){}
  },
  initShareButtons(){document.querySelectorAll('.share-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const id=b.closest('.property-card')?.getAttribute('data-id');const title=b.closest('.property-card')?.querySelector('.card-title')?.textContent||'ملک';const url=`${location.origin}/property/?id=${id}`;if(navigator.share){navigator.share({title,url}).catch(()=>{});return;}navigator.clipboard.writeText(url).then(()=>this.toast('لینک کپی شد')).catch(()=>this.toast('کپی لینک انجام نشد','error'))}))},
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
  updateHeroParallax(y){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const layerA=document.getElementById('homeHeroA');
    const layerB=document.getElementById('homeHeroB');
    if(!layerA)return;
    const offset=`${Math.min(y*0.12,48)}px`;
    layerA.style.setProperty('--hero-parallax',offset);
    if(layerB)layerB.style.setProperty('--hero-parallax',offset);
  },
  search(){
    if(this.desktopLocationSearch)this.searchQuery=this.desktopLocationSearch.value.trim();
    const active=this.searchTypeDropdown?.querySelector('.search-dropdown-item.active');
    const type=active?.dataset.type||PROPERTY_FILTER_ALL;
    this.applyFilter(type,{scroll:true});
  },
  async submitForm(e){
    e.preventDefault();
    const n=document.getElementById('name').value.trim();
    const ph=document.getElementById('phone')?.value.trim()||'';
    const em=document.getElementById('email').value.trim();
    const msg=document.getElementById('message').value.trim();
    if(!n||!em||!msg)return this.toast('فیلدهای ضروری را پر کنید','error');
    const btn=this.contactForm.querySelector('button');
    const t=btn.textContent;
    btn.textContent='در حال ارسال...';
    btn.disabled=true;
    try{
      const res=await fetch(`${API_BASE}/customers`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n,email:em,phone:ph,message:msg,source:'فرم تماس'})});
      if(!res.ok)throw new Error('failed');
      this.toast('درخواست شما با موفقیت ثبت شد. تیم آستوریا به زودی با شما تماس خواهد گرفت.','success');
      this.contactForm.reset();
    }catch{
      this.toast('ارسال پیام انجام نشد. لطفاً دوباره تلاش کنید','error');
    }finally{
      btn.textContent=t;
      btn.disabled=false;
    }
  },
  toast(msg,type='info'){if(!this.notification)return;if(this._t)clearTimeout(this._t);this.notification.textContent=msg;this.notification.className=`notification notification-${type} visible`;this._t=setTimeout(()=>this.notification.classList.remove('visible'),3000)},

  // ===== REQUEST MODAL =====
  createRequestModal(){
    const modal=document.createElement('div');modal.className='request-modal-overlay';modal.id='requestModal';
    modal.innerHTML=`<div class="request-modal-card"><button type="button" class="request-modal-close" data-close-request-modal="true" aria-label="بستن">×</button>
      <div class="request-modal-body" id="requestModalBody">
        <h3 class="request-modal-title">درخواست بازدید اختصاصی</h3>
        <p class="request-modal-intro">برای هماهنگی بازدید خصوصی، اطلاعات تماس خود را وارد کنید. تیم آستوریا درخواست شما را بررسی می‌کند.</p>
        <div class="request-modal-property-context" id="requestModalPropertyWrap"><i data-lucide="home"></i><span id="requestModalProperty">ملک انتخاب‌شده</span></div>
        <form id="requestForm" class="request-modal-form">
          <input type="hidden" id="requestPropertyId">
          <label for="requestName">نام و نام خانوادگی</label>
          <input type="text" id="requestName" placeholder="نام کامل" required>
          <label for="requestPhone">شماره تماس</label>
          <input type="tel" id="requestPhone" placeholder="شماره موبایل" required>
          <label for="requestNote">توضیحات (اختیاری)</label>
          <textarea id="requestNote" rows="3" placeholder="زمان یا سوال خاص خود را بنویسید"></textarea>
          <button type="submit" class="btn-primary" style="width:100%">ارسال درخواست بازدید</button>
        </form>
        <p class="request-modal-afternote">پس از ثبت، اطلاعات شما برای تیم مشاوره ارسال می‌شود.</p>
        <div id="requestStatus" class="form-message" role="status" aria-live="polite"></div>
      </div>
      <div class="astoria-success-panel" id="requestModalSuccess" hidden>
        <div class="astoria-success-icon" aria-hidden="true">✓</div>
        <h3 class="astoria-success-title">درخواست شما ثبت شد</h3>
        <p class="astoria-success-text">اطلاعات ملک و درخواست شما برای تیم آستوریا ارسال شد.</p>
        <p class="astoria-success-thanks">از اعتماد شما سپاسگزاریم.</p>
        <div class="astoria-success-actions">
          <button type="button" class="btn-secondary" data-close-request-modal="true">بستن</button>
          <a href="#residences" class="btn-primary" data-close-and-scroll="residences">مشاهده سایر املاک</a>
        </div>
      </div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-close-request-modal="true"]').forEach(btn=>btn.addEventListener('click',()=>this.closeRequestModal()));
    modal.querySelector('[data-close-and-scroll="residences"]')?.addEventListener('click',e=>{e.preventDefault();this.closeRequestModal();this.scrollToSection('#residences')});
    modal.querySelector('#requestForm')?.addEventListener('submit',e=>this.submitRequest(e));
  },
  openRequestModal(id,title){
    this.resetRequestModal();
    document.getElementById('requestPropertyId').value=id;
    document.getElementById('requestModalProperty').textContent=title;
    document.getElementById('requestModal').classList.add('active');
    document.body.classList.add('no-scroll');
    createIcons({icons:CONFIG.icons,attrs:CONFIG.iconDefaults});
  },
  closeRequestModal(){
    document.getElementById('requestModal')?.classList.remove('active');
    document.body.classList.remove('no-scroll');
    setTimeout(()=>this.resetRequestModal(),320);
  },
  resetRequestModal(){
    const body=document.getElementById('requestModalBody');
    const success=document.getElementById('requestModalSuccess');
    const status=document.getElementById('requestStatus');
    if(body)body.hidden=false;
    if(success)success.hidden=true;
    if(status){status.textContent='';status.className='form-message';}
    document.getElementById('requestForm')?.reset();
  },
  async submitRequest(e){
    e.preventDefault();
    const btn=e.target.querySelector('button[type="submit"]');
    const statusEl=document.getElementById('requestStatus');
    const orig=btn.textContent;
    btn.textContent='در حال ارسال...';
    btn.disabled=true;
    statusEl.textContent='';
    statusEl.className='form-message';
    try{
      const res=await fetch(`${API_BASE}/customers`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        name:document.getElementById('requestName').value,
        email:document.getElementById('requestPhone').value+'@request.astoria',
        phone:document.getElementById('requestPhone').value,
        message:`درخواست بازدید اختصاصی\n${document.getElementById('requestNote').value}`.trim(),
        propertyId:document.getElementById('requestPropertyId').value,
        propertyTitle:document.getElementById('requestModalProperty').textContent,
        source:'درخواست ملک'
      })});
      if(!res.ok)throw new Error('failed');
      document.getElementById('requestModalBody').hidden=true;
      document.getElementById('requestModalSuccess').hidden=false;
    }catch{
      statusEl.className='form-message error';
      statusEl.textContent='ارسال درخواست انجام نشد. لطفاً دوباره تلاش کنید.';
    }finally{
      btn.textContent=orig;
      btn.disabled=false;
    }
  }
};

Astoria.init();