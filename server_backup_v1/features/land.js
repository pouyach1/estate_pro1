// land 
module.exports = [
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
];