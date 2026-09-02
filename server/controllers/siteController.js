const Settings = require('../models/Settings');
const { getSiteOrigin, absoluteAssetUrl } = require('../config/site');
const { serverPayload } = require('../utils/httpErrors');

const SITE_NAME = 'آستوریا الیت استیتس';
const SITE_NAME_EN = 'ASTORIA ELITE ESTATES';

async function loadPublicSettings() {
  const keys = ['contactPhone', 'contactEmail', 'contactAddress', 'heroBackground', 'heroHeadline'];
  const rows = await Settings.find({ key: { $in: keys } }).lean();
  const map = {};
  rows.forEach((row) => { map[row.key] = row.value; });
  return map;
}

const getSiteMeta = async (req, res) => {
  try {
    const origin = getSiteOrigin(req);
    const settings = await loadPublicSettings();
    const defaultOgImage = absoluteAssetUrl(origin, settings.heroBackground || '/uploads/1785353493680-196846943.jpg');

    res.json({
      origin,
      name: SITE_NAME,
      nameEn: SITE_NAME_EN,
      contactPhone: settings.contactPhone || '',
      contactEmail: settings.contactEmail || '',
      contactAddress: settings.contactAddress || '',
      defaultOgImage,
      heroHeadline: settings.heroHeadline || '',
    });
  } catch (error) {
    res.status(500).json(serverPayload(error));
  }
};

module.exports = { getSiteMeta, SITE_NAME, SITE_NAME_EN, loadPublicSettings };
