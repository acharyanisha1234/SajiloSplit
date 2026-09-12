import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`,
        { email }
      );
      setSent(true);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-[#1A2E4A]/5 border border-slate-100 p-8">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center shadow-lg shadow-[#0EA5A5]/30">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0EA5A5]">SajiloSplit</h1>
          </div>
          <p className="text-slate-500 text-sm">Reset your password</p>
        </div>

        {/* Success State */}
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Check your email
            </h2>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
              We've sent a password reset link to <strong className="text-slate-700">{email}</strong>
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[#0EA5A5] hover:text-[#0B8A8A] font-medium text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-slate-700 text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5] focus:bg-white hover:border-slate-300 transition-all"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#0EA5A5]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Reset Link
                </>
              )}
            </button>

            {/* Back Link */}
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[#0EA5A5] hover:text-[#0B8A8A] font-medium text-sm transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;