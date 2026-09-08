import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Copy, Check, Share2, ArrowLeft, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ReceiveMoney = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { wallet } = useSelector((state) => state.wallet);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef();

  // Generate QR code data (simulated)
  const qrData = {
    userId: user?.id,
    name: user?.name,
    email: user?.email,
    type: 'payment'
  };

  const handleCopy = () => {
    const text = `SajiloSplit Payment\nUser: ${user?.name}\nID: ${user?.id}\nEmail: ${user?.email}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Payment details copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receive Money</h1>
          <p className="text-gray-500">Share your payment details</p>
        </div>
      </div>

      <div className="dashboard-card max-w-md mx-auto">
        {/* QR Code */}
        <div className="text-center">
          <div className="inline-block bg-white p-4 rounded-xl border border-gray-200">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-24 h-24 text-primary-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Scan to pay</p>
        </div>

        {/* User Info */}
        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Name</span>
            <span className="font-medium text-gray-900">{user?.name}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">User ID</span>
            <span className="font-mono text-sm text-gray-900">{user?.id?.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="btn-outline py-3 flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Copy Details'}
          </button>
          <button
            onClick={handleCopy}
            className="btn-outline py-3 flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" /> Share
          </button>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Share your QR code or payment details with the sender.
            They can scan the QR code or use your ID to send money.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiveMoney;