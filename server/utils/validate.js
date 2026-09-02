const PUBLIC_STATUSES = ['available', 'reserved'];

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test(String(id || ''));
}

function isPublicProperty(doc) {
  if (!doc || doc.isActive === false) return false;
  if (!doc.status) return true;
  return PUBLIC_STATUSES.includes(doc.status);
}

function publicStatusClause() {
  return {
    $or: [
      { status: { $in: PUBLIC_STATUSES } },
      { status: { $exists: false } },
      { status: null },
    ],
  };
}

function buildPublicPropertyQuery(filters = {}) {
  const clauses = [{ isActive: true }, publicStatusClause()];

  if (filters.type && filters.type !== 'همه') clauses.push({ type: filters.type });
  if (filters.featured) clauses.push({ isFeatured: true });
  if (filters.exclusive) clauses.push({ isExclusive: true });
  if (filters.status && PUBLIC_STATUSES.includes(filters.status)) clauses.push({ status: filters.status });

  if (filters.minPrice || filters.maxPrice) {
    const price = {};
    if (filters.minPrice) price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) price.$lte = Number(filters.maxPrice);
    clauses.push({ price });
  }

  if (filters.beds) clauses.push({ beds: { $gte: Number(filters.beds) } });

  if (filters.search) {
    const regex = { $regex: escapeRegex(filters.search), $options: 'i' };
    clauses.push({
      $or: [
        { title: regex },
        { location: regex },
        { description: regex },
        { type: regex },
      ],
    });
  }

  return { $and: clauses };
}

function stripUnsafeKeys(obj = {}) {
  const clean = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (key.startsWith('$') || key.includes('.')) return;
    clean[key] = value;
  });
  return clean;
}

const PROPERTY_WRITABLE_FIELDS = new Set([
  'title', 'type', 'price', 'priceUnit', 'beds', 'baths', 'area', 'age',
  'description', 'location', 'image', 'images', 'video', 'listingType',
  'status', 'isExclusive', 'isFeatured', 'isActive', 'sortOrder', 'features',
]);

function pickPropertyFields(body = {}) {
  const safe = stripUnsafeKeys(body);
  const picked = {};
  PROPERTY_WRITABLE_FIELDS.forEach((key) => {
    if (safe[key] !== undefined) picked[key] = safe[key];
  });
  return picked;
}

module.exports = {
  PUBLIC_STATUSES,
  escapeRegex,
  isValidObjectId,
  isPublicProperty,
  publicStatusClause,
  buildPublicPropertyQuery,
  stripUnsafeKeys,
  pickPropertyFields,
};
