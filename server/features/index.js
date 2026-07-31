// index 
const common = require('./common');
const luxury = require('./luxury');
const apartment = require('./apartment');
const villa = require('./villa');
const penthouse = require('./penthouse');
const land = require('./land');
const office = require('./office');
const garden = require('./garden');

const SPECIFIC_FEATURES = {
  'آپارتمان': apartment,
  'ویلا': villa,
  'پنت‌هاوس': penthouse,
  'زمین': land,
  'دفتر کار': office,
  'باغ': garden,
};

const FEATURE_CATEGORIES = {
  common: 'ویژگی‌های عمومی',
  specific: 'ویژگی‌های اختصاصی',
  luxury: 'ویژگی‌های لوکس',
};

function getFeaturesForType(propertyType) {
  return {
    common,
    specific: SPECIFIC_FEATURES[propertyType] || [],
    luxury,
  };
}

function getAllFeatureKeys() {
  const keys = new Set();
  common.forEach(f => keys.add(f.key));
  Object.values(SPECIFIC_FEATURES).flat().forEach(f => keys.add(f.key));
  luxury.forEach(f => keys.add(f.key));
  return [...keys];
}

function getFeatureByKey(key) {
  for (const f of [...common, ...Object.values(SPECIFIC_FEATURES).flat(), ...luxury]) {
    if (f.key === key) return f;
  }
  return null;
}

function getDefaultFeatures(propertyType) {
  const defaults = { common: {}, specific: {}, luxury: {} };

  common.forEach(f => {
    defaults.common[f.key] = f.field_type === 'boolean' ? false : (f.field_type === 'number' ? (f.min || 0) : '');
  });

  (SPECIFIC_FEATURES[propertyType] || []).forEach(f => {
    defaults.specific[f.key] = f.field_type === 'boolean' ? false : (f.field_type === 'number' ? (f.min || 0) : '');
  });

  luxury.forEach(f => {
    defaults.luxury[f.key] = false;
  });

  return defaults;
}

module.exports = {
  FEATURE_CATEGORIES,
  COMMON_FEATURES: common,
  SPECIFIC_FEATURES,
  LUXURY_FEATURES: luxury,
  getFeaturesForType,
  getAllFeatureKeys,
  getFeatureByKey,
  getDefaultFeatures,
};