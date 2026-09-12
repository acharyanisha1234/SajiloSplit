import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Shield, Upload, CheckCircle, XCircle, Clock, 
  AlertCircle, FileText, Camera, User, ArrowRight,
  ChevronRight, Info, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const KYC = () => {
  const { user } = useSelector((state) => state.auth);
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    documentType: 'citizenship',
    documentNumber: '',
    fullName: user?.name || '',
    dateOfBirth: '',
    address: '',
    documentFront: null,
    documentBack: null,
    selfie: null
  });

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await axios.get('/api/kyc/status');
      setKycStatus(response.data.data.status);
      setKycData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch KYC status');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (field, file) => {
    if (!file) return;
    
    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be less than 5MB');
      return;
    }

    setFormData({ ...formData, [field]: file });
    toast.success(`${field} uploaded`);
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.documentNumber) {
      toast.error('Please enter document number');
      return;
    }
    if (!formData.documentFront || !formData.documentBack || !formData.selfie) {
      toast.error('Please upload all required documents');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('documentType', formData.documentType);
      data.append('documentNumber', formData.documentNumber);
      data.append('fullName', formData.fullName);
      data.append('dateOfBirth', formData.dateOfBirth);
      data.append('address', formData.address);
      data.append('documentFront', formData.documentFront);
      data.append('documentBack', formData.documentBack);
      data.append('selfie', formData.selfie);

      const response = await axios.post('/api/kyc/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('KYC submitted successfully!');
      setKycStatus('pending');
      fetchKYCStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#0EA5A5]/20 border-t-[#0EA5A5] rounded-full animate-spin"></div>
      </div>
    );
  }

  // ===== APPROVED STATE =====
  if (kycStatus === 'approved') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            KYC Verified 
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Your identity has been verified. You can now make payments and use all features.
          </p>
          
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-left mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <p className="font-semibold text-emerald-800 dark:text-emerald-400">
                Verification Complete
              </p>
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-500">
              Verified on {new Date(kycData?.verifiedAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/send-money"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white font-semibold hover:shadow-xl transition"
            >
              <ArrowRight className="w-5 h-5" /> Send Money
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===== PENDING STATE =====
  if (kycStatus === 'pending') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            KYC Under Review
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Your documents are being reviewed. This usually takes 24-48 hours.
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="font-semibold text-amber-800 dark:text-amber-400">
                What happens next?
              </p>
            </div>
            <ul className="text-sm text-amber-700 dark:text-amber-500 space-y-1 ml-7 list-disc">
              <li>Our team will verify your documents</li>
              <li>You will receive a notification once approved</li>
              <li>You can then make payments and transactions</li>
            </ul>
          </div>

          <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Submitted on {new Date(kycData?.submittedAt).toLocaleString()}
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ===== REJECTED STATE =====
  if (kycStatus === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            KYC Rejected
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Your KYC was rejected. Please review and resubmit.
          </p>

          {kycData?.rejectionReason && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-left mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="font-semibold text-red-800 dark:text-red-400">
                  Rejection Reason
                </p>
              </div>
              <p className="text-sm text-red-700 dark:text-red-500">
                {kycData.rejectionReason}
              </p>
            </div>
          )}

          <button
            onClick={() => { setKycStatus('not_submitted'); setStep(1); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white font-semibold hover:shadow-xl transition"
          >
            <Upload className="w-5 h-5" /> Resubmit KYC
          </button>
        </div>
      </div>
    );
  }

  // ===== NOT SUBMITTED - SHOW FORM =====
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          KYC Verification
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Verify your identity to unlock all features
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Step {step} of 3
          </span>
          <span className="text-sm font-semibold text-[#0EA5A5]">
            {Math.round((step / 3) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#0EA5A5]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#0EA5A5]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Personal Information</h2>
              <p className="text-xs text-slate-500">Enter your details as per document</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Document Type *
              </label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
              >
                <option value="citizenship">Citizenship</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Document Number *
              </label>
              <input
                type="text"
                value={formData.documentNumber}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                placeholder="e.g., 123-456-789"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name (as per document)
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (!formData.documentNumber) {
                toast.error('Please enter document number');
                return;
              }
              setStep(2);
            }}
            className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white font-semibold hover:shadow-xl transition"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step 2: Document Upload */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#0EA5A5]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#0EA5A5]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Upload Documents</h2>
              <p className="text-xs text-slate-500">Clear photos, max 5MB each</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Front */}
            <UploadCard
              label="Document Front Side"
              field="documentFront"
              file={formData.documentFront}
              onChange={handleFileChange}
            />

            {/* Back */}
            <UploadCard
              label="Document Back Side"
              field="documentBack"
              file={formData.documentBack}
              onChange={handleFileChange}
            />

            {/* Selfie */}
            <UploadCard
              label="Selfie with Document"
              field="selfie"
              file={formData.selfie}
              onChange={handleFileChange}
              icon={Camera}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!formData.documentFront || !formData.documentBack || !formData.selfie) {
                  toast.error('Please upload all documents');
                  return;
                }
                setStep(3);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white font-semibold hover:shadow-xl transition"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Review & Submit</h2>
              <p className="text-xs text-slate-500">Verify all information is correct</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <ReviewRow label="Document Type" value={formData.documentType} />
            <ReviewRow label="Document Number" value={formData.documentNumber} />
            <ReviewRow label="Full Name" value={formData.fullName || user?.name} />
            <ReviewRow label="Date of Birth" value={formData.dateOfBirth || 'Not provided'} />
            <ReviewRow 
              label="Documents" 
              value={`${formData.documentFront ? '✓ Front' : '✗ Front'}, ${formData.documentBack ? '✓ Back' : '✗ Back'}, ${formData.selfie ? '✓ Selfie' : '✗ Selfie'}`}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">
                  Important
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-500">
                  Make sure all documents are clear and readable. Verification usually takes 24-48 hours.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 px-6 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white font-semibold hover:shadow-xl transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" /> Submit KYC
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Helper Components =====
const UploadCard = ({ label, field, file, onChange, icon: Icon = FileText }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
      {label} *
    </label>
    <label className="block cursor-pointer">
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => onChange(field, e.target.files[0])}
        className="hidden"
      />
      <div className={`p-6 rounded-xl border-2 border-dashed transition-all ${
        file
          ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
          : 'border-slate-300 dark:border-slate-700 hover:border-[#0EA5A5] hover:bg-[#0EA5A5]/5'
      }`}>
        {file ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 truncate">
                {file.name}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <Icon className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Click to upload
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              JPG, PNG or PDF (Max 5MB)
            </p>
          </div>
        )}
      </div>
    </label>
  </div>
);

const ReviewRow = ({ label, value }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
      {value || 'N/A'}
    </span>
  </div>
);

export default KYC;