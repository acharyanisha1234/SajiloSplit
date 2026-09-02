const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const User = require('../models/User');
const mongoose = require('mongoose');
const { generateTransactionId } = require('../utils/generateId');

// getWallet
// addMoney
// माथिको code जस्ताको तस्तै राख्ने

// @desc    Send money to another user
// @route   POST /api/wallet/send
// @access  Private
const sendMoney = async (req, res) => {
  try {
    const { receiverId, amount, purpose } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send money to yourself'
      });
    }

    const senderWallet = await Wallet.findOne({
      user: req.user.id
    });

    const receiverWallet = await Wallet.findOne({
      user: receiverId
    });

    if (!senderWallet || !receiverWallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (senderWallet.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const senderBalanceBefore = senderWallet.balance;

      senderWallet.balance -= amount;
      senderWallet.availableBalance -= amount;

      await senderWallet.save({ session });

      receiverWallet.balance += amount;
      receiverWallet.availableBalance += amount;

      await receiverWallet.save({ session });

      const transactionId = generateTransactionId();

      await WalletTransaction.create([{
        transactionId,
        sender: req.user.id,
        receiver: receiverId,
        amount,
        type: 'transfer',
        status: 'completed',
        purpose: purpose || 'Money transfer',
        balanceBefore: senderBalanceBefore,
        balanceAfter: senderWallet.balance
      }], { session });

      await session.commitTransaction();
      session.endSession();

      const io = global.io;

      io.to(`user-${receiverId}`).emit('notification', {
        type: 'money_received',
        title: 'Money Received',
        message: `You received Rs. ${amount} from ${req.user.name}`
      });

      io.to(`user-${req.user.id}`).emit('notification', {
        type: 'money_sent',
        title: 'Money Sent',
        message: `You sent Rs. ${amount} to ${receiver.name}`
      });

      res.status(200).json({
        success: true,
        message: 'Money sent successfully',
        data: {
          transactionId,
          amount,
          receiver: receiver.name
        }
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getWallet,
  addMoney,
  sendMoney
};