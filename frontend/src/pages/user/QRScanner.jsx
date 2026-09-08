import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';

const QRScanner = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  // Simulated QR scan
  const handleScan = () => {
    setScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      const mockData = {
        userId: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        amount: 0
      };
      setScannedData(mockData);
      setScanning(false);
      toast.success('QR Code scanned successfully!');
    }, 2000);
  };

  const handleSendPayment = () => {
    navigate('/send-money', { state: { receiver: scannedData } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
          <p className="text-gray-500">Scan QR code to pay</p>
        </div>
      </div>

      <div className="dashboard-card max-w-md mx-auto">
        {/* Scanner Area */}
        <div 
          className="relative bg-gray-900 rounded-xl overflow-hidden aspect-square flex items-center justify-center cursor-pointer"
          onClick={handleScan}
        >
          {scanning ? (
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4">Scanning...</p>
            </div>
          ) : scannedData ? (
            <div className="text-center text-white p-8">
              <div className="bg-green-500 rounded-full p-4 inline-block mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold">{scannedData.name}</p>
              <p className="text-sm text-gray-400">{scannedData.email}</p>
              <button
                onClick={handleSendPayment}
                className="mt-4 btn-primary px-6 py-2"
              >
                Send Money
              </button>
            </div>
          ) : (
            <div className="text-center text-white">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Tap to scan QR Code</p>
              <p className="text-sm text-gray-400 mt-2">Position QR code within the frame</p>
            </div>
          )}
        </div>

        {/* Scan Info */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>How to scan:</strong> Tap the scanner area above and point your camera at
            any SajiloSplit user's QR code to send them money instantly.
          </p>
        </div>

        {/* Scanned History (Simulated) */}
        <div className="mt-4">
          <h3 className="font-medium text-gray-900 mb-2">Recent Scans</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">S</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Suman Rai</p>
                  <p className="text-sm text-gray-500">suman@example.com</p>
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700 text-sm">
                Pay
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">R</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Riya Maharjan</p>
                  <p className="text-sm text-gray-500">riya@example.com</p>
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700 text-sm">
                Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;