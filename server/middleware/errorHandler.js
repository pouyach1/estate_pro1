module.exports = (err, req, res, next) => {
  console.error('[API Error]', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'داده‌های ارسالی نامعتبر است' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'شناسه نامعتبر است' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'حجم فایل بیش از حد مجاز است' });
  }

  const status = err.status || 500;
  const payload = { message: status >= 500 ? 'خطای سرور' : (err.message || 'درخواست نامعتبر است') };

  if (process.env.NODE_ENV !== 'production' && status >= 500) {
    payload.detail = err.message;
  }

  res.status(status).json(payload);
};
