const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const kycUploadDir = path.join(__dirname, '../../uploads/kyc');
if (!fs.existsSync(kycUploadDir)) {
  fs.mkdirSync(kycUploadDir, { recursive: true });
}

// ===== Multer Configuration =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, kycUploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `kyc-${req.user.id}-${file.fieldname}-${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images (JPG, PNG, WEBP) and PDF files are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

// ===== Import Controller =====
const {
  submitKYC,
  getKYCStatus,
  getAllKYC,
  approveKYC,
  rejectKYC,
  getKYCDetails
} = require('../controllers/kycController');

// ===== USER ROUTES =====
router.post(
  '/submit',
  protect,
  upload.fields([
    { name: 'documentFront', maxCount: 1 },
    { name: 'documentBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 }
  ]),
  submitKYC
);

router.get('/status', protect, getKYCStatus);

// ===== ADMIN ROUTES =====
router.get('/all', protect, authorize('admin'), getAllKYC);
router.get('/:userId', protect, authorize('admin'), getKYCDetails);
router.put('/:userId/approve', protect, authorize('admin'), approveKYC);
router.put('/:userId/reject', protect, authorize('admin'), rejectKYC);

module.exports = router;