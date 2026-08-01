const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({ message: 'ادمین یافت نشد' });
      }

      req.adminRole = req.admin.role || 'owner';
      next();
    } catch (error) {
      console.error('Admin auth error:', error.message);
      return res.status(401).json({ message: 'توکن نامعتبر است' });
    }
  } else {
    return res.status(401).json({ message: 'دسترسی غیرمجاز — توکن ارسال نشده' });
  }
};


const requireOwner = (req, res, next) => {
  const role = req.adminRole || req.admin?.role || 'owner';
  if (role !== 'owner') {
    return res.status(403).json({ message: 'این بخش فقط برای مالک سامانه قابل دسترسی است' });
  }
  next();
};

module.exports = { protectAdmin, requireOwner };
