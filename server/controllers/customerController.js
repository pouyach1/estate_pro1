const Customer = require('../models/Customer');
const { isValidObjectId } = require('../utils/validate');

const LEAD_STATUSES = ['new', 'contacted', 'follow_up', 'closed'];

const getCustomers = async (req, res) => {
  try {
    const { search, unread, status, propertyId } = req.query;
    let query = {};
    if (unread === 'true') query.isRead = false;
    if (status && LEAD_STATUSES.includes(status)) query.status = status;
    if (propertyId) query.propertyId = propertyId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { propertyTitle: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await Customer.find(query)
      .populate('propertyId', 'title type location image')
      .sort({ createdAt: -1 });
    res.json({ count: customers.length, customers });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('propertyId', 'title type location image');
    if (!customer) return res.status(404).json({ message: 'مشتری یافت نشد' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, message, source, propertyId, propertyTitle } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'نام و ایمیل الزامی است' });
    if (propertyId && !isValidObjectId(propertyId)) {
      return res.status(400).json({ message: 'شناسه ملک نامعتبر است' });
    }

    const customer = await Customer.create({
      name,
      email,
      phone: phone || '',
      message: message || '',
      source: source || 'ثبت دستی',
      propertyId: propertyId || null,
      propertyTitle: propertyTitle || '',
      status: 'new',
      isRead: false,
    });

    res.status(201).json({ message: 'درخواست شما ثبت شد', customer });
  } catch (error) {
    res.status(400).json({ message: 'خطا', error: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'message', 'source', 'propertyId', 'propertyTitle', 'status', 'isRead', 'notes'];
    const update = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    });

    if (update.status && !LEAD_STATUSES.includes(update.status)) {
      return res.status(400).json({ message: 'وضعیت نامعتبر است' });
    }

    if (update.isRead === true && !update.status) {
      update.status = update.status || undefined;
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .populate('propertyId', 'title type location image');
    if (!customer) return res.status(404).json({ message: 'مشتری یافت نشد' });
    res.json({ message: 'بروزرسانی شد', customer });
  } catch (error) {
    res.status(400).json({ message: 'خطا', error: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'مشتری یافت نشد' });
    res.json({ message: 'حذف شد' });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور' });
  }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
