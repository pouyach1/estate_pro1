const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protectUser = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'کاربر یافت نشد' });
      }

      next();
    } catch (error) {
      console.error('User auth error:', error.message);
      return res.status(401).json({ message: 'توکن نامعتبر' });
    }
  } else {
    return res.status(401).json({ message: 'دسترسی غیرمجاز' });
  }
};

module.exports = { protectUser };
