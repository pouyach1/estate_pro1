const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

(async () => {
  await mongoose.connect('mongodb://localhost:27017/astoria_elite');
  
  const admin = await Admin.findOne({ username: 'admin' });
  console.log('Admin exists:', !!admin);
  
  if (admin) {
    const match = await bcrypt.compare('admin123', admin.password);
    console.log('Password match:', match);
  } else {
    console.log('No admin found. Creating one...');
    const hash = await bcrypt.hash('admin123', 10);
    await Admin.create({ username: 'admin', password: hash, name: 'مدیر' });
    console.log('Admin created. Username: admin, Password: admin123');
  }
  
  await mongoose.disconnect();
  process.exit();
})();