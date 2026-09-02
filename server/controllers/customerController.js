const Customer = require('../models/Customer');
const { isValidObjectId, escapeRegex } = require('../utils/validate');
const { clientErrorMessage, serverPayload } = require('../utils/httpErrors');

const LEAD_STATUSES = ['new', 'contacted', 'follow_up', 'closed'];
const MAX_SEARCH_LENGTH = 120;

function sanitizePublicLead(customer) {
  if (!customer) return { message: 'درخواست شما ثبت شد' };
  const doc = customer.toObject ? customer.toObject() : customer;
  return {
    message: 'درخواست شما ثبت شد',
    id: doc._id,
  };
}

const getCustomers = async (req, res) => {
  try {
    const { search, unread, status, propertyId } = req.query;
    const query = {};
    if (unread === 'true') query.isRead = false;
    if (status && LEAD_STATUSES.includes(status)) query.status = status;
    if (propertyId) {
      if (!isValidObjectId(propertyId)) {
        return res.status(400).json({ message: 'شناسه ملک نامعتبر است' });
      }
      query.propertyId = propertyId;
    }
    if (search) {
      const term = String(search).slice(0, MAX_SEARCH_LENGTH);
      const regex = { $regex: escapeRegex(term), $options: 'i' };
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { propertyTitle: regex },
        { message: regex },
      ];
    }
    const customers = await Customer.find(query)
      .populate('propertyId', 'title type location image')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ count: customers.length, customers });
  } catch (error) {
    res.status(500).json(serverPayload(error));
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

    res.status(201).json(sanitizePublicLead(customer));
  } catch (error) {
    res.status(400).json({ message: clientErrorMessage(error, 'خطا در ثبت درخواست') });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'message', 'source', 'propertyId', 'propertyTitle', 'status', 'isRead', 'notes'];
    const update = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    });

    if (propertyId && !isValidObjectId(update.propertyId)) {
      return res.status(400).json({ message: 'شناسه ملک نامعتبر است' });
    }
    if (update.status && !LEAD_STATUSES.includes(update.status)) {
      return res.status(400).json({ message: 'وضعیت نامعتبر است' });
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
