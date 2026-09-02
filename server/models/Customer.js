const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  message: { type: String, default: '' },
  source: { type: String, default: 'فرم سایت' },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
  propertyTitle: { type: String, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'follow_up', 'closed'], default: 'new' },
  isRead: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

customerSchema.index({ status: 1, createdAt: -1 });
customerSchema.index({ propertyId: 1, createdAt: -1 });
customerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Customer', customerSchema);