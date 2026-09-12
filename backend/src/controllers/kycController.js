const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const path = require('path');
const fs = require('fs');

// ===== Helper: Create audit log (non-blocking) =====
const createAuditLog = async (data) => {
  try {
    await AuditLog.create(data);
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

// ===== Helper: Create notification (non-blocking) =====
const createNotification = async (data) => {
  try {
    await Notification.create(data);
    
    // Emit via Socket.io if available
    const io = global.io;
    if (io && data.user) {
      io.to(`user-${data.user}`).emit('notification', data);
    }
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

// @desc    Submit KYC documents
// @route   POST /api/kyc/submit
// @access  Private
const submitKYC = async (req, res) => {
  try {
    const {
      documentType,
      documentNumber,
      fullName,
      dateOfBirth,
      address
    } = req.body;

    // Validation
    if (!documentType || !documentNumber) {
      return res.status(400).json({
        success: false,
        message: 'Document type and number are required'
      });
    }

    if (!req.files?.documentFront || !req.files?.documentBack || !req.files?.selfie) {
      return res.status(400).json({
        success: false,
        message: 'Please upload document front, back and selfie'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already approved
    if (user.kyc?.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'KYC already approved'
      });
    }

    // Check if pending
    if (user.kyc?.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'KYC already submitted and pending review'
      });
    }

    // Update KYC
    user.kyc = {
      status: 'pending',
      documentType,
      documentNumber,
      documentFront: req.files.documentFront[0].path,
      documentBack: req.files.documentBack[0].path,
      selfie: req.files.selfie[0].path,
      addressProof: req.files.addressProof?.[0]?.path || null,
      fullName: fullName || user.name,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      address: address || user.address,
      submittedAt: new Date()
    };

    await user.save();

    // Audit log
    await createAuditLog({
      user: req.user.id,
      action: 'kyc_submitted',
      details: `KYC submitted with ${documentType} document`,
      ip: req.ip,
      severity: 'info'
    });

    // Notification
    await createNotification({
      user: req.user.id,
      type: 'system',
      title: 'KYC Submitted',
      message: 'Your KYC documents have been submitted for verification',
      link: '/kyc'
    });

    res.status(200).json({
      success: true,
      message: 'KYC submitted successfully. You will be notified once verified.',
      data: {
        status: user.kyc.status,
        submittedAt: user.kyc.submittedAt
      }
    });
  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get KYC status
// @route   GET /api/kyc/status
// @access  Private
const getKYCStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('kyc name email phone');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: user.kyc?.status || 'not_submitted',
        documentType: user.kyc?.documentType,
        documentNumber: user.kyc?.documentNumber ? '****' + user.kyc.documentNumber.slice(-4) : null,
        submittedAt: user.kyc?.submittedAt,
        verifiedAt: user.kyc?.verifiedAt,
        rejectionReason: user.kyc?.rejectionReason
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all KYC requests (Admin)
// @route   GET /api/kyc/all
// @access  Private/Admin
const getAllKYC = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    
    const query = {};
    if (status !== 'all') {
      query['kyc.status'] = status;
    }

    const users = await User.find(query)
      .select('name email phone kyc profileImage createdAt')
      .sort({ 'kyc.submittedAt': -1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve KYC (Admin)
// @route   PUT /api/kyc/:userId/approve
// @access  Private/Admin
const approveKYC = async (req, res) => {
  try {
    const { userId } = req.params;
    const { notes } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.kyc?.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'KYC already approved'
      });
    }

    user.kyc.status = 'approved';
    user.kyc.verifiedBy = req.user.id;
    user.kyc.verifiedAt = new Date();
    user.kyc.rejectionReason = null;
    await user.save();

    // Audit log
    await createAuditLog({
      user: req.user.id,
      action: 'kyc_approved',
      details: `KYC approved for ${user.email}`,
      ip: req.ip,
      severity: 'info'
    });

    // Notification
    await createNotification({
      user: user._id,
      type: 'system',
      title: 'KYC Approved',
      message: 'Your KYC verification has been approved. You can now transact!',
      link: '/kyc'
    });

    res.status(200).json({
      success: true,
      message: 'KYC approved successfully',
      data: { status: 'approved' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject KYC (Admin)
// @route   PUT /api/kyc/:userId/reject
// @access  Private/Admin
const rejectKYC = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.kyc.status = 'rejected';
    user.kyc.verifiedBy = req.user.id;
    user.kyc.verifiedAt = new Date();
    user.kyc.rejectionReason = reason;
    await user.save();

    // Audit log
    await createAuditLog({
      user: req.user.id,
      action: 'kyc_rejected',
      details: `KYC rejected for ${user.email}: ${reason}`,
      ip: req.ip,
      severity: 'warning'
    });

    // Notification
    await createNotification({
      user: user._id,
      type: 'system',
      title: 'KYC Rejected',
      message: `Your KYC was rejected. Reason: ${reason}. Please resubmit.`,
      link: '/kyc'
    });

    res.status(200).json({
      success: true,
      message: 'KYC rejected',
      data: { status: 'rejected', reason }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get KYC details (Admin)
// @route   GET /api/kyc/:userId
// @access  Private/Admin
const getKYCDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('name email phone kyc profileImage createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  submitKYC,
  getKYCStatus,
  getAllKYC,
  approveKYC,
  rejectKYC,
  getKYCDetails
};