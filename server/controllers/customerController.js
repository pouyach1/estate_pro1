const Customer = require('../models/Customer');

const getCustomers = async (req, res) => {
  try {
    const { search, unread } = req.query;
    let query = {};
    if (unread === 'true') query.isRead = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json({ count: customers.length, customers });
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
};

const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'مشتری یافت نشد' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'خطای سرور' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, message, source } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'نام و ایمیل الزامی است' });
    const customer = await Customer.create({ name, email, phone: phone || '', message: message || '', source: source || 'ثبت دستی' });
    res.status(201).json({ message: 'مشتری افزوده شد', customer });
  } catch (error) {
    res.status(400).json({ message: 'خطا', error: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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