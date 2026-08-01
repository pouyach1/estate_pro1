const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // تشخیص نوع فایل از پسوند
  const ext = path.extname(file.originalname).toLowerCase();
  
  // عکس‌های مجاز
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  // ویدیوهای مجاز
  const videoExts = ['.mp4', '.mov', '.avi', '.webm'];
  const imageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const videoMimes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  
  const isImage = imageExts.includes(ext) && imageMimes.includes(file.mimetype);
  const isVideo = videoExts.includes(ext) && videoMimes.includes(file.mimetype);

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('فقط فایل‌های تصویری (jpg, png, webp, gif) و ویدیویی (mp4, mov, avi, webm) مجاز هستند'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
    files: 10, // حداکثر ۱۰ فایل همزمان
  }
});

module.exports = upload;