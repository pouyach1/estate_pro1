const Property = require('../models/Property');
const fs = require('fs');
const path = require('path');

const getProperties = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, beds, search, sort } = req.query;
    let query = { isActive: true };
    if (type && type !== 'همه') query.type = type;
    if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
    if (beds) query.beds = { $gte: Number(beds) };
    if (search) query.title = { $regex: search, $options: 'i' };
    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'views') sortOption = { views: -1 };
    const properties = await Property.find(query).sort(sortOption);
    res.json({ count: properties.length, properties });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const getProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!property) return res.status(404).json({ message: 'ملک یافت نشد' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    const propertyData = { ...req.body };
    
    // Handle single image
    if (req.file) {
      propertyData.image = `/uploads/${req.file.filename}`;
    }
    
    // Handle multiple images
    if (req.files && req.files.length > 0) {
      propertyData.images = req.files.map(f => `/uploads/${f.filename}`);
      if (!propertyData.image) propertyData.image = propertyData.images[0];
    }
    
    if (req.body.features && typeof req.body.features === 'string') {
      propertyData.features = JSON.parse(req.body.features);
    }
    
    const property = await Property.create(propertyData);
    res.status(201).json({ message: 'ملک افزوده شد', property });
  } catch (error) {
    res.status(400).json({ message: 'خطا', error: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'ملک یافت نشد' });
    const updateData = { ...req.body, updatedAt: Date.now() };
    if (req.file) {
      if (property.image) { const oldPath = path.join(__dirname, '..', property.image); if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); }
      updateData.image = `/uploads/${req.file.filename}`;
    }
    if (req.body.features && typeof req.body.features === 'string') {
      updateData.features = JSON.parse(req.body.features);
    }
    const updated = await Property.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ message: 'بروزرسانی شد', property: updated });
  } catch (error) {
    res.status(400).json({ message: 'خطا', error: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'ملک یافت نشد' });
    if (property.image) { const imgPath = path.join(__dirname, '..', property.image); if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); }
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'حذف شد' });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const uploadPropertyImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'تصویر انتخاب کنید' });
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'ملک یافت نشد' });
    property.image = `/uploads/${req.file.filename}`;
    property.updatedAt = Date.now();
    await property.save();
    res.json({ message: 'آپلود شد', image: property.image });
  } catch (error) {
    res.status(500).json({ message: 'خطا', error: error.message });
  }
};

module.exports = { getProperties, getProperty, createProperty, updateProperty, deleteProperty, uploadPropertyImage };