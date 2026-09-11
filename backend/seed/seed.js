const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Wallet = require('../src/models/Wallet');
const Category = require('../src/models/Category');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // DELETE EXISTING ADMIN
    await User.deleteOne({ email: 'admin@sajilosplit.com' });
    console.log('Deleted existing admin (if any)');

    // CREATE ADMIN USER
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@sajilosplit.com',
      phone: '9800000000',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      isActive: true,
      isSuspended: false,
      settings: {
        theme: 'light',
        language: 'en',
        currency: 'NPR'
      }
    });

    // Create wallet for admin
    await Wallet.create({
      user: admin._id,
      balance: 100000,
      availableBalance: 100000,
      lockedBalance: 0
    });

    console.log('Admin created successfully!');
    console.log('');
    console.log('========================================');
    console.log('ADMIN LOGIN CREDENTIALS');
    console.log('========================================');
    console.log('Email:    admin@sajilosplit.com');
    console.log('Password: admin123');
    console.log('========================================');
    console.log('');

    // CREATE DEMO USERS
    const demoUsers = [
      { name: 'Nisha Sharma', email: 'nisha@sajilosplit.com', phone: '9800000001' },
      { name: 'Binoj Thapa', email: 'binoj@sajilosplit.com', phone: '9800000002' },
      { name: 'Aayush Gurung', email: 'aayush@sajilosplit.com', phone: '9800000003' },
      { name: 'Suman Rai', email: 'suman@sajilosplit.com', phone: '9800000004' },
      { name: 'Riya Maharjan', email: 'riya@sajilosplit.com', phone: '9800000005' }
    ];

    const userPassword = await bcrypt.hash('password123', 10);

    for (const userData of demoUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        const user = await User.create({
          ...userData,
          password: userPassword,
          role: 'user',
          isVerified: true,
          settings: {
            theme: 'light',
            language: 'en',
            currency: 'NPR'
          }
        });

        await Wallet.create({
          user: user._id,
          balance: Math.floor(Math.random() * 50000) + 10000,
          availableBalance: Math.floor(Math.random() * 50000) + 10000,
          lockedBalance: 0
        });

        console.log(`Created user: ${userData.email}`);
      }
    }

    // CREATE CATEGORIES
    const categories = [
      { name: 'Food', icon: 'restaurant', color: '#FF6B6B' },
      { name: 'Transport', icon: 'directions_car', color: '#4ECDC4' },
      { name: 'Rent', icon: 'home', color: '#45B7D1' },
      { name: 'Education', icon: 'school', color: '#96CEB4' },
      { name: 'Shopping', icon: 'shopping_bag', color: '#FFEAA7' },
      { name: 'Entertainment', icon: 'movie', color: '#DDA0DD' },
      { name: 'Utilities', icon: 'bolt', color: '#FF8C00' },
      { name: 'Travel', icon: 'flight', color: '#00CED1' },
      { name: 'Technology', icon: 'devices', color: '#6C5CE7' },
      { name: 'Health', icon: 'health_and_safety', color: '#4ADE80' },
      { name: 'Insurance', icon: 'verified_user', color: '#60A5FA' },
      { name: 'Groceries', icon: 'local_grocery_store', color: '#F472B6' },
      { name: 'Dining', icon: 'restaurant_menu', color: '#FB923C' },
      { name: 'Clothing', icon: 'checkroom', color: '#A78BFA' },
      { name: 'Other', icon: 'category', color: '#95A5A6' }
    ];

    await Category.deleteMany({});
    for (const cat of categories) {
      await Category.create(cat);
    }
    console.log('Categories created');

    console.log('');
    console.log('========================================');
    console.log('DEMO USER CREDENTIALS');
    console.log('========================================');
    console.log('Password for all users: password123');
    console.log('');
    console.log('nisha@sajilosplit.com');
    console.log('binoj@sajilosplit.com');
    console.log('aayush@sajilosplit.com');
    console.log('suman@sajilosplit.com');
    console.log('riya@sajilosplit.com');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();