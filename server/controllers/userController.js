const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'نام، ایمیل و رمز عبور الزامی است' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'این ایمیل قبلاً ثبت شده' });
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (error) {
    res.status(400).json({ message: 'خطا در ثبت‌نام', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'ایمیل و رمز عبور الزامی است' });
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'ایمیل یا رمز عبور اشتباه است' });
    }
    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('favorites');
    if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.propertyId;
    if (!propertyId) return res.status(400).json({ message: 'شناسه ملک الزامی است' });
    const index = user.favorites.indexOf(propertyId);
    if (index > -1) user.favorites.splice(index, 1);
    else user.favorites.push(propertyId);
    await user.save();
    res.json({
      favorites: user.favorites,
      isFavorited: index === -1,
      message: index > -1 ? 'حذف شد' : 'اضافه شد'
    });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) return res.status(404).json({ message: 'کاربر یافت نشد' });
    res.json({ count: user.favorites.length, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

module.exports = { register, login, getProfile, toggleFavorite, getFavorites };