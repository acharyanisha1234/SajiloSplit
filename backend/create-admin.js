require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Wallet = require('./src/models/Wallet');

const admin = {
  name: 'SajiloSplit Admin',
  email: 'admin@sajilosplit.com',
  phone: '+9779800000000',
  password: 'admin123',
  role: 'admin',
  isActive: true,
  isSuspended: false,
  isVerified: true
};

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  let user = await User.findOne({ email: admin.email });
  if (user) {
    user.name = admin.name;
    user.phone = user.phone || admin.phone;
    user.password = admin.password;
    user.role = admin.role;
    user.isActive = admin.isActive;
    user.isSuspended = admin.isSuspended;
    user.isVerified = admin.isVerified;
    await user.save();
  } else {
    user = await User.create(admin);
  }

  await Wallet.findOneAndUpdate(
    { user: user._id },
    { $setOnInsert: { user: user._id, balance: 0, availableBalance: 0, lockedBalance: 0 } },
    { upsert: true, new: true }
  );

  console.log(`Admin ready: ${admin.email}`);
};

createAdmin()
  .catch((error) => {
    console.error('Failed to create admin:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
