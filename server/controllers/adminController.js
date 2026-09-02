const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Property = require('../models/Property');
const Customer = require('../models/Customer');

const normalizeRole = (role) => ['owner', 'admin', 'agent'].includes(role) ? role : 'admin';

const getEffectiveRole = (admin) => admin.role || 'owner';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'نام کاربری و رمز عبور الزامی است' });
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
    }

    const role = getEffectiveRole(admin);

    res.json({
      message: 'ورود موفق',
      token: generateToken(admin._id, role),
      redirectTo: '/admin/dashboard.html',
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role,
        permissions: {
          canManageAdmins: role === 'owner',
          canManageSettings: role === 'owner',
          canViewGlobalAnalytics: role === 'owner'
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { username, password, name, role: requestedRole } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'نام کاربری و رمز عبور الزامی است' });
    }

    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      return res.status(400).json({ message: 'این نام کاربری قبلاً ثبت شده است' });
    }

    const role = normalizeRole(requestedRole);
    const admin = await Admin.create({ username, password, name, role });

    res.status(201).json({
      message: 'ادمین جدید با موفقیت ایجاد شد',
      admin: { id: admin._id, username: admin.username, name: admin.name, role: admin.role }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ message: 'خطا در ثبت‌نام', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json(req.admin);
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id);

    if (name) admin.name = name;

    if (currentPassword && newPassword) {
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'رمز عبور فعلی اشتباه است' });
      }
      admin.password = newPassword;
    }

    await admin.save();

    res.json({
      message: 'پروفایل با موفقیت بروزرسانی شد',
      admin: { id: admin._id, username: admin.username, name: admin.name, role: getEffectiveRole(admin) }
    });
  } catch (error) {
    res.status(400).json({ message: 'خطا در بروزرسانی', error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ isActive: true });
    const totalCustomers = await Customer.countDocuments();
    const unreadMessages = await Customer.countDocuments({ isRead: false });

    const featuredProperties = await Property.countDocuments({ isFeatured: true, isActive: true });
    const exclusiveProperties = await Property.countDocuments({ isExclusive: true, isActive: true });
    const newLeads = await Customer.countDocuments({ status: 'new' });
    const followUpLeads = await Customer.countDocuments({ status: 'follow_up' });

    const totalViewsResult = await Property.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalViews = totalViewsResult[0]?.total || 0;

    const recentProperties = await Property.find().sort({ createdAt: -1 }).limit(5);
    const recentCustomers = await Customer.find().sort({ createdAt: -1 }).limit(5);

    const propertiesByType = await Property.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const topProperties = await Property.find({ isActive: true })
      .sort({ views: -1 }).limit(5)
      .select('title type views price');

    const lowProperties = await Property.find({ isActive: true })
      .sort({ views: 1 }).limit(5)
      .select('title type views price');

    res.json({
      stats: {
        totalProperties,
        activeProperties,
        featuredProperties,
        exclusiveProperties,
        totalCustomers,
        unreadMessages,
        newLeads,
        followUpLeads,
        totalViews
      },
      propertiesByType,
      recentProperties,
      recentCustomers,
      topProperties,
      lowProperties
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  getDashboardStats
};