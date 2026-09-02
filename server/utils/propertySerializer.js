const PUBLIC_PROPERTY_FIELDS = [
  '_id', 'title', 'type', 'price', 'priceUnit', 'beds', 'baths', 'area', 'age',
  'description', 'location', 'image', 'images', 'listingType', 'isExclusive',
  'isFeatured', 'status', 'sortOrder', 'features', 'views', 'createdAt', 'updatedAt', 'video',
];

function serializePublicProperty(property) {
  if (!property) return null;
  const doc = property.toObject ? property.toObject() : { ...property };
  const out = {};
  PUBLIC_PROPERTY_FIELDS.forEach((key) => {
    if (doc[key] !== undefined) out[key] = doc[key];
  });
  return out;
}

function serializePublicProperties(properties) {
  return properties.map(serializePublicProperty);
}

module.exports = { serializePublicProperty, serializePublicProperties };
