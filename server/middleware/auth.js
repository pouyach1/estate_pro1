const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET = 'astoria_elite_pro_secret_key_2024';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({ message: 'ادمین یافت نشد' });
      }

      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ message: 'توکن نامعتبر است' });
    }
  } else {
    return res.status(401).json({ message: 'دسترسی غیرمجاز — توکن ارسال نشده' });
  }
};

module.exports = { protect };