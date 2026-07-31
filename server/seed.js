const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const MONGODB_URI = 'mongodb://localhost:27017/astoria_elite';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Delete old admin
    await Admin.deleteMany({});
    console.log('🗑️ Old admins deleted');

    // Create admin manually with hash
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await Admin.create({
      username: 'admin',
      password: hashedPassword,
      name: 'مدیر سایت'
    });

    console.log('✅ Admin created:');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();