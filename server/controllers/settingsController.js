const Settings = require('../models/Settings');
const fs = require('fs');
const path = require('path');
const { isValidObjectId } = require('../utils/validate');
const { clientErrorMessage, serverPayload } = require('../utils/httpErrors');

const ALLOWED_SETTINGS_KEYS = new Set([
  'heroBackground',
  'featuredPropertyId',
  'contactPhone',
  'contactEmail',
  'contactAddress',
  'heroHeadline',
  'heroSubheadline',
  'siteTitle',
]);

const getSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    const result = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    res.json(result);
  } catch (error) {
    res.status(500).json(serverPayload(error));
  }
};

const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({ message: 'داده‌های تنظیمات نامعتبر است' });
    }

    for (const [key, value] of Object.entries(updates)) {
      if (!ALLOWED_SETTINGS_KEYS.has(key)) {
        return res.status(400).json({ message: `کلید تنظیمات مجاز نیست: ${key}` });
      }
      if (key === 'featuredPropertyId' && value && !isValidObjectId(value)) {
        return res.status(400).json({ message: 'شناسه ملک ویژه نامعتبر است' });
      }
      await Settings.findOneAndUpdate(
        { key },
        { key, value, updatedAt: Date.now() },
        { upsert: true, new: true }
      );
    }

    const settings = await Settings.find();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });

    res.json({ message: 'تنظیمات با موفقیت بروزرسانی شد', settings: result });
  } catch (error) {
    res.status(400).json({ message: clientErrorMessage(error, 'خطا در بروزرسانی تنظیمات') });
  }
};

// @desc    Upload background image
// @route   POST /api/settings/background
// @access  Private/Admin
const uploadBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لطفاً یک تصویر انتخاب کنید' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    await Settings.findOneAndUpdate(
      { key: 'heroBackground' },
      { key: 'heroBackground', value: imageUrl, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json({ message: 'تصویر پس‌زمینه با موفقیت آپلود شد', image: imageUrl });
  } catch (error) {
    res.status(500).json(serverPayload(error, 'خطا در آپلود تصویر'));
  }
};

module.exports = { getSettings, updateSettings, uploadBackground };