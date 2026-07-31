const Settings = require('../models/Settings');
const fs = require('fs');
const path = require('path');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    for (const [key, value] of Object.entries(updates)) {
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
    res.status(400).json({ message: 'خطا در بروزرسانی تنظیمات', error: error.message });
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
    res.status(500).json({ message: 'خطا در آپلود تصویر', error: error.message });
  }
};

module.exports = { getSettings, updateSettings, uploadBackground };