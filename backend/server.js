const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io setup
global.io = io;
require('./src/sockets')(io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/wallet', require('./src/routes/walletRoutes'));
app.use('/api/transactions', require('./src/routes/transactionRoutes'));
app.use('/api/groups', require('./src/routes/groupRoutes'));
app.use('/api/expenses', require('./src/routes/expenseRoutes'));
app.use('/api/settlements', require('./src/routes/settlementRoutes'));
app.use('/api/budgets', require('./src/routes/budgetRoutes'));
app.use('/api/bills', require('./src/routes/billRoutes'));
app.use('/api/locked-funds', require('./src/routes/lockedFundRoutes'));
app.use('/api/emergency-funds', require('./src/routes/emergencyFundRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/disputes', require('./src/routes/disputeRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Error handling middleware
app.use(require('./src/middleware/error').errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});