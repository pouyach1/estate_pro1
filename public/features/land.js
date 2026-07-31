// land 
// ============================================================
// FEATURE CONFIG — Browser Version
// ============================================================

const COMMON_FEATURES = [
  { key: 'parking', label_fa: 'پارکینگ', field_type: 'number', category: 'common', icon: 'car', min: 0 },
  { key: 'storage', label_fa: 'انباری', field_type: 'boolean', category: 'common', icon: 'warehouse' },
  { key: 'elevator', label_fa: 'آسانسور', field_type: 'boolean', category: 'common', icon: 'arrow-up' },
  { key: 'security', label_fa: 'نگهبانی', field_type: 'boolean', category: 'common', icon: 'shield-check' },
  { key: 'cctv', label_fa: 'دوربین مداربسته', field_type: 'boolean', category: 'common', icon: 'camera' },
  { key: 'video_intercom', label_fa: 'آیفون تصویری', field_type: 'boolean', category: 'common', icon: 'video' },
  { key: 'heating', label_fa: 'سیستم گرمایش', field_type: 'select', category: 'common', options: ['پکیج', 'شوفاژ', 'گرمایش از کف', 'مرکزی', 'سایر'] },
  { key: 'cooling', label_fa: 'سیستم سرمایش', field_type: 'select', category: 'common', options: ['اسپلیت', 'داکت اسپلیت', 'کولر آبی', 'کولر گازی', 'چیلر', 'سایر'] },
  { key: 'flooring', label_fa: 'کف‌پوش', field_type: 'select', category: 'common', options: ['سرامیک', 'پارکت', 'لمینت', 'سنگ', 'موزاییک', 'سایر'] },
  { key: 'cabinet', label_fa: 'کابینت', field_type: 'select', category: 'common', options: ['MDF', 'هایگلاس', 'ممبران', 'چوب طبیعی', 'سایر'] },
  { key: 'double_glazed', label_fa: 'پنجره دوجداره', field_type: 'boolean', category: 'common' },
  { key: 'security_door', label_fa: 'درب ضد سرقت', field_type: 'boolean', category: 'common' },
  { key: 'smart_home', label_fa: 'خانه هوشمند', field_type: 'boolean', category: 'common' },
];

const LUXURY_FEATURES = [
  { key: 'pool', label_fa: 'استخر', field_type: 'boolean', category: 'luxury', icon: 'waves' },
  { key: 'sauna', label_fa: 'سونا / جکوزی', field_type: 'boolean', category: 'luxury', icon: 'thermometer' },
  { key: 'gym', label_fa: 'سالن ورزشی', field_type: 'boolean', category: 'luxury', icon: 'dumbbell' },
  { key: 'roof_garden', label_fa: 'روف‌گاردن', field_type: 'boolean', category: 'luxury', icon: 'palette' },
  { key: 'meeting_room', label_fa: 'سالن اجتماعات', field_type: 'boolean', category: 'luxury', icon: 'users' },
  { key: 'home_cinema', label_fa: 'سینمای خانگی', field_type: 'boolean', category: 'luxury', icon: 'film' },
  { key: 'luxury_lobby', label_fa: 'لابی لوکس', field_type: 'boolean', category: 'luxury', icon: 'building' },
];

const SPECIFIC_FEATURES = {
  'آپارتمان': [
    { key: 'floor', label_fa: 'طبقه', field_type: 'number', min: 0, max: 100 },
    { key: 'total_floors', label_fa: 'کل طبقات ساختمان', field_type: 'number', min: 1, max: 100 },
    { key: 'balcony', label_fa: 'بالکن / تراس', field_type: 'boolean' },
    { key: 'open_kitchen', label_fa: 'آشپزخانه اپن', field_type: 'boolean' },
    { key: 'master_bedroom', label_fa: 'خواب مستر', field_type: 'boolean' },
    { key: 'closet', label_fa: 'کمد دیواری', field_type: 'boolean' },
    { key: 'false_ceiling', label_fa: 'سقف کاذب', field_type: 'boolean' },
    { key: 'lobby', label_fa: 'لابی', field_type: 'boolean' },
  ],
  'ویلا': [
    { key: 'yard_area', label_fa: 'متراژ حیاط', field_type: 'number', min: 0 },
    { key: 'pool_private', label_fa: 'استخر اختصاصی', field_type: 'boolean' },
    { key: 'garden', label_fa: 'باغچه اختصاصی', field_type: 'boolean' },
    { key: 'bbq', label_fa: 'باربیکیو', field_type: 'boolean' },
    { key: 'gazebo', label_fa: 'آلاچیق', field_type: 'boolean' },
    { key: 'water_well', label_fa: 'چاه آب', field_type: 'boolean' },
    { key: 'gas_cylinder', label_fa: 'مخزن گاز', field_type: 'boolean' },
    { key: 'generator', label_fa: 'ژنراتور', field_type: 'boolean' },
    { key: 'irrigation', label_fa: 'آبیاری اتوماتیک', field_type: 'boolean' },
  ],
  'پنت‌هاوس': [
    { key: 'private_elevator', label_fa: 'آسانسور اختصاصی', field_type: 'boolean' },
    { key: 'private_entrance', label_fa: 'ورودی خصوصی', field_type: 'boolean' },
    { key: 'roof_garden', label_fa: 'روف‌گاردن اختصاصی', field_type: 'boolean' },
    { key: 'private_pool', label_fa: 'استخر خصوصی', field_type: 'boolean' },
    { key: 'panoramic_view', label_fa: 'ویو پانوراما', field_type: 'boolean' },
    { key: 'high_ceiling', label_fa: 'سقف بلند', field_type: 'boolean' },
    { key: 'skylight', label_fa: 'نورگیر سقفی', field_type: 'boolean' },
    { key: 'guest_room', label_fa: 'اتاق مهمان', field_type: 'boolean' },
    { key: 'luxury_materials', label_fa: 'مصالح لوکس', field_type: 'boolean' },
  ],
  'زمین': [
    { key: 'usage_type', label_fa: 'کاربری', field_type: 'select', options: ['مسکونی', 'تجاری', 'اداری', 'مختلط', 'کشاورزی', 'صنعتی', 'سایر'] },
    { key: 'deed_type', label_fa: 'نوع سند', field_type: 'select', options: ['تک‌برگ', 'منگوله‌دار', 'قولنامه‌ای', 'مشاعی', 'سایر'] },
    { key: 'width', label_fa: 'عرض زمین (متر)', field_type: 'number', min: 0 },
    { key: 'length', label_fa: 'طول زمین (متر)', field_type: 'number', min: 0 },
    { key: 'on_street', label_fa: 'بر خیابان', field_type: 'boolean' },
    { key: 'street_count', label_fa: 'تعداد بر', field_type: 'select', options: ['یک بر', 'دو بر', 'سه بر', 'چهار بر'] },
    { key: 'road_width', label_fa: 'عرض گذر (متر)', field_type: 'number', min: 0 },
    { key: 'slope', label_fa: 'شیب زمین', field_type: 'select', options: ['مسطح', 'کم‌شیب', 'شیب‌دار', 'تند'] },
    { key: 'electricity', label_fa: 'برق', field_type: 'boolean' },
    { key: 'water', label_fa: 'آب', field_type: 'boolean' },
    { key: 'gas', label_fa: 'گاز', field_type: 'boolean' },
    { key: 'fiber_optic', label_fa: 'فیبر نوری', field_type: 'boolean' },
    { key: 'fenced', label_fa: 'حصارکشی', field_type: 'boolean' },
    { key: 'build_permit', label_fa: 'پروانه ساخت', field_type: 'boolean' },
    { key: 'max_density', label_fa: 'تراکم مجاز (طبقه)', field_type: 'number', min: 0 },
  ],
  'دفتر کار': [
    { key: 'office_usage', label_fa: 'کاربری اداری', field_type: 'boolean' },
    { key: 'reception', label_fa: 'لابی و پذیرش', field_type: 'boolean' },
    { key: 'conference_room', label_fa: 'اتاق کنفرانس', field_type: 'boolean' },
    { key: 'kitchenette', label_fa: 'آبدارخانه', field_type: 'boolean' },
    { key: 'fire_alarm', label_fa: 'اعلام حریق', field_type: 'boolean' },
    { key: 'ups', label_fa: 'برق اضطراری', field_type: 'boolean' },
    { key: 'network_infra', label_fa: 'زیرساخت شبکه', field_type: 'boolean' },
    { key: 'separate_entrance', label_fa: 'ورودی مجزا', field_type: 'boolean' },
    { key: 'sign_board', label_fa: 'امکان نصب تابلو', field_type: 'boolean' },
    { key: 'access_control', label_fa: 'کنترل دسترسی', field_type: 'boolean' },
  ],
  'باغ': [
    { key: 'building_area', label_fa: 'متراژ بنا', field_type: 'number', min: 0 },
    { key: 'water_well', label_fa: 'چاه آب', field_type: 'boolean' },
    { key: 'water_share', label_fa: 'سهمیه آب', field_type: 'boolean' },
    { key: 'irrigation_system', label_fa: 'سیستم آبیاری', field_type: 'boolean' },
    { key: 'fruit_trees', label_fa: 'درختان میوه', field_type: 'boolean' },
    { key: 'tree_age', label_fa: 'سن درختان (سال)', field_type: 'number', min: 0 },
    { key: 'water_pool', label_fa: 'استخر ذخیره آب', field_type: 'boolean' },
    { key: 'swimming_pool', label_fa: 'استخر شنا', field_type: 'boolean' },
    { key: 'guard_room', label_fa: 'اتاق نگهبان', field_type: 'boolean' },
    { key: 'road_access', label_fa: 'دسترسی جاده', field_type: 'boolean' },
    { key: 'villa_permit', label_fa: 'امکان ساخت ویلا', field_type: 'boolean' },
    { key: 'landscaping', label_fa: 'محوطه‌سازی', field_type: 'boolean' },
  ],
};

const FEATURE_CATEGORIES = {
  common: 'ویژگی‌های عمومی',
  specific: 'ویژگی‌های اختصاصی',
  luxury: 'ویژگی‌های لوکس',
};

function getFeaturesForType(propertyType) {
  return {
    common: COMMON_FEATURES,
    specific: SPECIFIC_FEATURES[propertyType] || [],
    luxury: LUXURY_FEATURES,
  };
}

function getFeatureByKey(key) {
  for (const f of [...COMMON_FEATURES, ...Object.values(SPECIFIC_FEATURES).flat(), ...LUXURY_FEATURES]) {
    if (f.key === key) return f;
  }
  return null;
}

function getDefaultFeatures(propertyType) {
  const defaults = { common: {}, specific: {}, luxury: {} };
  COMMON_FEATURES.forEach(f => {
    defaults.common[f.key] = f.field_type === 'boolean' ? false : (f.field_type === 'number' ? (f.min || 0) : '');
  });
  (SPECIFIC_FEATURES[propertyType] || []).forEach(f => {
    defaults.specific[f.key] = f.field_type === 'boolean' ? false : (f.field_type === 'number' ? (f.min || 0) : '');
  });
  LUXURY_FEATURES.forEach(f => {
    defaults.luxury[f.key] = false;
  });
  return defaults;
}

export {
  FEATURE_CATEGORIES,
  COMMON_FEATURES,
  SPECIFIC_FEATURES,
  LUXURY_FEATURES,
  getFeaturesForType,
  getFeatureByKey,
  getDefaultFeatures,
};