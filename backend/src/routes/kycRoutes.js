const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Multer for KYC uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/kyc/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `kyc-${req.user.id}-${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const valid = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    if (valid) return cb(null, true);
    cb(new Error('Only images and PDFs allowed'));
  }
});

// Submit KYC
router.post('/submit', protect, upload.fields([
  { name: 'documentFront', maxCount: 1 },
  { name: 'documentBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { documentType, documentNumber } = req.body;

    user.kyc = {
      status: 'pending',
      documentType,
      documentNumber,
      documentFront: req.files?.documentFront?.[0]?.path,
      documentBack: req.files?.documentBack?.[0]?.path,
      selfie: req.files?.selfie?.[0]?.path,
      submittedAt: new Date()
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'KYC submitted for verification',
      data: { status: user.kyc.status }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get KYC status
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        status: user?.kyc?.status || 'not_submitted',
        submittedAt: user?.kyc?.submittedAt,
        rejectionReason: user?.kyc?.rejectionReason
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;