const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov', '.avi', '.webm'];
    const safeExt = allowed.includes(ext) ? ext : '.bin';
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base || 'file'}-${uniqueSuffix}${safeExt}`);
  },
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
    fileSize: 25 * 1024 * 1024,
    files: 10,
  },
});

module.exports = upload;