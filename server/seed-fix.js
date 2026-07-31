require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const isBcryptHash = (value) => typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);

const fixAdminPasswords = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const admins = await Admin.find().select('+password');
    let fixedCount = 0;

    for (const admin of admins) {
      if (!isBcryptHash(admin.password)) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password, salt);
        await Admin.updateOne({ _id: admin._id }, { $set: { password: hashedPassword } });
        fixedCount += 1;
        console.log(`🔐 Re-hashed plaintext password for admin: ${admin.username}`);
      }
    }

    console.log(`✅ Completed. Re-hashed ${fixedCount} admin password(s).`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ seed-fix error:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

fixAdminPasswords();
