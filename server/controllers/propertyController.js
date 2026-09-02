const Property = require('../models/Property');
const Settings = require('../models/Settings');
const { serializePublicProperty, serializePublicProperties } = require('../utils/propertySerializer');
const { rankSimilarProperties } = require('../utils/similarProperties');

const canManageProperty = (req, property) => {
  const role = req.adminRole || req.admin?.role || 'owner';
  if (role === 'owner') return true;
  if (!property.createdBy) return true;
  return String(property.createdBy) === String(req.admin?._id);
};

const fs = require('fs');
const path = require('path');

const PUBLIC_STATUSES = ['available', 'reserved'];

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1' || value === 'on';
}

function parsePropertyBody(body = {}) {
  const data = { ...body };
  if (data.price !== undefined && data.price !== '') data.price = Number(data.price);
  if (data.area !== undefined) data.area = Number(data.area) || 0;
  if (data.beds !== undefined) data.beds = Number(data.beds) || 0;
  if (data.baths !== undefined) data.baths = Number(data.baths) || 0;
  if (data.age !== undefined) data.age = Number(data.age) || 0;
  if (data.sortOrder !== undefined) data.sortOrder = Number(data.sortOrder) || 0;
  if (data.isActive !== undefined) data.isActive = parseBoolean(data.isActive, true);
  if (data.isExclusive !== undefined) data.isExclusive = parseBoolean(data.isExclusive, false);
  if (data.isFeatured !== undefined) data.isFeatured = parseBoolean(data.isFeatured, false);
  return data;
}

function applyMultipartFiles(propertyData, req) {
  if (req.file) {
    propertyData.image = `/uploads/${req.file.filename}`;
  }
  if (req.files) {
    const singleImage = req.files.image?.[0];
    const multiImages = req.files.images || [];
    if (singleImage) propertyData.image = `/uploads/${singleImage.filename}`;
    if (multiImages.length) {
      propertyData.images = multiImages.map((f) => `/uploads/${f.filename}`);
      if (!propertyData.image) propertyData.image = propertyData.images[0];
    }
  }
}

const getProperties = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, beds, search, sort, featured, exclusive, status } = req.query;
    let query = {
      isActive: true,
      $or: [
        { status: { $in: PUBLIC_STATUSES } },
        { status: { $exists: false } },
      ],
    };

    if (type && type !== 'همه') query.type = type;
    if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
    if (beds) query.beds = { $gte: Number(beds) };
    if (featured === 'true') query.isFeatured = true;
    if (exclusive === 'true') query.isExclusive = true;
    if (status && PUBLIC_STATUSES.includes(status)) query.status = status;

    if (search) {
      const regex = { $regex: search, $options: 'i' };
      query.$or = [{ title: regex }, { location: regex }, { description: regex }, { type: regex }];
    }

    let sortOption = { sortOrder: -1, createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'views') sortOption = { views: -1 };
    if (sort === 'featured') sortOption = { isFeatured: -1, sortOrder: -1, createdAt: -1 };

    let queryBuilder = Property.find(query).sort(sortOption);
    if (req.query.limit) {
      const limit = Math.min(Math.max(Number(req.query.limit) || 0, 1), 50);
      if (limit) queryBuilder = queryBuilder.limit(limit);
    }

    const properties = await queryBuilder;
    res.json({ count: properties.length, properties: serializePublicProperties(properties) });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property || !property.isActive) {
      return res.status(404).json({ message: 'ملک یافت نشد' });
    }
    if (property.status && !PUBLIC_STATUSES.includes(property.status)) {
      return res.status(404).json({ message: 'ملک یافت نشد' });
    }

    property.views = (property.views || 0) + 1;
    property.updatedAt = new Date();
    await property.save();

    res.json(serializePublicProperty(property));
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const getSimilarProperties = async (req, res) => {
  try {
    const current = await Property.findById(req.params.id);
    if (!current || !current.isActive || !PUBLIC_STATUSES.includes(current.status)) {
      return res.status(404).json({ message: 'ملک یافت نشد' });
    }

    const candidates = await Property.find({
      _id: { $ne: current._id },
      isActive: true,
      $or: [
        { status: { $in: PUBLIC_STATUSES } },
        { status: { $exists: false } },
      ],
    }).limit(40);

    const limit = Math.min(Math.max(Number(req.query.limit) || 4, 1), 8);
    const similar = rankSimilarProperties(current, candidates, limit);
    res.json({ count: similar.length, properties: serializePublicProperties(similar) });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const getFeaturedProperty = async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: 'featuredPropertyId' });
    if (settings?.value) {
      const featured = await Property.findOne({
        _id: settings.value,
        isActive: true,
        $or: [
          { status: { $in: PUBLIC_STATUSES } },
          { status: { $exists: false } },
        ],
      });
      if (featured) return res.json({ property: serializePublicProperty(featured), source: 'settings' });
    }

    const flagged = await Property.findOne({
      isActive: true,
      isFeatured: true,
      $or: [
        { status: { $in: PUBLIC_STATUSES } },
        { status: { $exists: false } },
      ],
    }).sort({ sortOrder: -1, createdAt: -1 });

    if (flagged) return res.json({ property: serializePublicProperty(flagged), source: 'featured' });

    const fallback = await Property.findOne({
      isActive: true,
      $or: [
        { status: { $in: PUBLIC_STATUSES } },
        { status: { $exists: false } },
      ],
    }).sort({ sortOrder: -1, price: -1, createdAt: -1 });

    if (!fallback) return res.json({ property: null, source: 'none' });
    res.json({ property: serializePublicProperty(fallback), source: 'fallback' });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const getAdminProperties = async (req, res) => {
  try {
    const role = req.adminRole || req.admin?.role || 'owner';
    const query = role === 'owner' ? {} : { createdBy: req.admin?._id };
    const properties = await Property.find(query).sort({ sortOrder: -1, updatedAt: -1 });
    res.json({ count: properties.length, properties });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const getAdminProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'ملک یافت نشد' });
    const role = req.adminRole || req.admin?.role || 'owner';
    if (role !== 'owner' && property.createdBy && String(property.createdBy) !== String(req.admin?._id)) {
      return res.status(403).json({ message: 'شما مجاز به مشاهده این ملک نیستید' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    const propertyData = parsePropertyBody({ ...req.body, createdBy: req.admin?._id || null });
    applyMultipartFiles(propertyData, req);

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
    if (!canManageProperty(req, property)) {
      return res.status(403).json({ message: 'شما فقط مجاز به ویرایش املاک خود هستید' });
    }

    const updateData = parsePropertyBody({ ...req.body, updatedAt: Date.now() });
    applyMultipartFiles(updateData, req);

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
    if (!canManageProperty(req, property)) {
      return res.status(403).json({ message: 'شما فقط مجاز به حذف املاک خود هستید' });
    }

    if (property.image) {
      const imgPath = path.join(__dirname, '..', property.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
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
    if (!canManageProperty(req, property)) {
      return res.status(403).json({ message: 'شما فقط مجاز به مدیریت رسانه املاک خود هستید' });
    }

    property.image = `/uploads/${req.file.filename}`;
    property.updatedAt = Date.now();
    await property.save();
    res.json({ message: 'آپلود شد', image: property.image });
  } catch (error) {
    res.status(500).json({ message: 'خطا', error: error.message });
  }
};

module.exports = {
  getProperties,
  getProperty,
  getSimilarProperties,
  getFeaturedProperty,
  getAdminProperties,
  getAdminProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
};
