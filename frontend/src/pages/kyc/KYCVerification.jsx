import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, Camera, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { submitKYC, getKYCStatus } from '../../store/slices/kycSlice';
import toast from 'react-hot-toast';

const KYCVerification = () => {
  const { user } = useSelector((state) => state.auth);
  const { kycStatus, isLoading } = useSelector((state) => state.kyc);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    documentType: 'citizenship',
    documentNumber: '',
    documentFront: null,
    documentBack: null,
    selfie: null,
    address: '',
    addressProof: null,
  });

  const [step, setStep] = useState(1);

  const handleFileUpload = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(submitKYC(formData)).unwrap();
      toast.success('KYC submitted successfully!');
      setStep(4);
    } catch (error) {
      toast.error(error.message || 'KYC submission failed');
    }
  };

  const getStatusUI = () => {
    switch (kycStatus) {
      case 'approved':
        return (
          <div className="text-center p-8 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-emerald-700">KYC Verified</h3>
            <p className="text-emerald-600 mt-2">Your identity has been verified</p>
          </div>
        );
      case 'pending':
        return (
          <div className="text-center p-8 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-amber-700">KYC Pending</h3>
            <p className="text-amber-600 mt-2">Your documents are being reviewed</p>
          </div>
        );
      case 'rejected':
        return (
          <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-200">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-700">KYC Rejected</h3>
            <p className="text-red-600 mt-2">Please resubmit your documents</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (kycStatus === 'approved' || kycStatus === 'pending') {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-[#0EA5A5]/10 p-8 border border-white/50">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#0EA5A5]" />
            <h1 className="text-2xl font-bold text-slate-800">KYC Verification</h1>
          </div>
          {getStatusUI()}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-[#0EA5A5]/10 p-8 border border-white/50">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-[#0EA5A5]" />
          <h1 className="text-2xl font-bold text-slate-800">KYC Verification</h1>
          <span className="ml-auto text-sm text-slate-400">Step {step} of 3</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200 rounded-full mb-8">
          <div 
            className="h-full bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-700">Personal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Type</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FDF6F0]/50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5] transition-all duration-300"
                >
                  <option value="citizenship">Citizenship</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Number</label>
                <input
                  type="text"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FDF6F0]/50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5] transition-all duration-300"
                  placeholder="Enter your document number"
                  required
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-[#1A2E4A] text-white py-3 rounded-xl font-semibold hover:bg-[#15253B] transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-700">Document Upload</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Front</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#0EA5A5] transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('documentFront', e.target.files[0])}
                      className="hidden"
                      id="front"
                    />
                    <label htmlFor="front" className="cursor-pointer block">
                      {formData.documentFront ? (
                        <img src={formData.documentFront} alt="Front" className="max-h-40 mx-auto rounded-lg" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Upload front side</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Back</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#0EA5A5] transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('documentBack', e.target.files[0])}
                      className="hidden"
                      id="back"
                    />
                    <label htmlFor="back" className="cursor-pointer block">
                      {formData.documentBack ? (
                        <img src={formData.documentBack} alt="Back" className="max-h-40 mx-auto rounded-lg" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Upload back side</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[#0EA5A5] text-white py-3 rounded-xl font-semibold hover:bg-[#0B8A8A] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-700">Selfie Verification</h2>
              
              <div className="text-center">
                <div className="w-48 h-48 mx-auto border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden hover:border-[#0EA5A5] transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileUpload('selfie', e.target.files[0])}
                    className="hidden"
                    id="selfie"
                  />
                  <label htmlFor="selfie" className="cursor-pointer block w-full h-full">
                    {formData.selfie ? (
                      <img src={formData.selfie} alt="Selfie" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Camera className="w-12 h-12 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">Take a selfie</p>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-sm text-slate-500 mt-2">Take a clear photo of your face</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white py-3 rounded-xl font-semibold hover:shadow-[0_20px_60px_-15px_rgba(14,165,165,0.4)] transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit KYC'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default KYCVerification;