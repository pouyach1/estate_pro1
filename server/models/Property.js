const mongoose = require('mongoose');
const { getDefaultFeatures } = require('../features');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true, enum: ['آپارتمان', 'ویلا', 'پنت‌هاوس', 'زمین', 'دفتر کار', 'باغ'] },
  price: { type: Number, default: null },
  priceUnit: { type: String, default: 'تومان' },
  beds: { type: Number, default: 0 },
  baths: { type: Number, default: 0 },
  area: { type: Number, default: 0 },
  age: { type: Number, default: 0 },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  image: { type: String, default: '' },
  listingType: { type: String, enum: ['آگهی ویژه', 'آگهی ارتقا یافته', 'آگهی خصوصی'], default: 'آگهی ویژه' },
  isExclusive: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  features: { type: mongoose.Schema.Types.Mixed, default: function () { return getDefaultFeatures(this.type || 'آپارتمان'); } },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  images: [{ type: String }],  // آرایه‌ای از آدرس عکس‌ها
  video: { type: String, default: '' },  // آدرس ویدیو
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
});

propertySchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('Property', propertySchema);