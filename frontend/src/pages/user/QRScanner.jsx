import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, X, QrCode, Upload } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';

const QRScanner = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const startScan = async () => {
    setScanning(true);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback
          try {
            const data = JSON.parse(decodedText);
            setScannedData(data);
            stopScan();
            toast.success('QR Code scanned!');
          } catch (e) {
            toast.error('Invalid QR Code');
          }
        },
        () => {
          // Error callback - ignore
        }
      );
    } catch (err) {
      toast.error('Camera access denied');
      setScanning(false);
    }
  };

  const stopScan = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.log(err);
      }
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  const handleSendPayment = () => {
    navigate('/send-money', { state: { receiver: scannedData } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">QR Scanner</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Scan QR code to pay</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-6 max-w-md mx-auto">
        {/* Scanner Area */}
        <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-square mb-4">
          <div id="qr-reader" className="w-full h-full" ref={scannerRef} />
          
          {!scanning && !scannedData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white cursor-pointer" onClick={startScan}>
              <Camera className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-semibold">Tap to scan QR Code</p>
              <p className="text-sm text-slate-400 mt-2">Position QR code within frame</p>
            </div>
          )}

          {scannedData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/95 p-6">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-semibold">{scannedData.name}</p>
              <p className="text-sm text-slate-400">{scannedData.email}</p>
              <button
                onClick={handleSendPayment}
                className="mt-4 px-6 py-2 bg-[#0EA5A5] rounded-lg font-semibold hover:bg-[#0B8A8A] transition"
              >
                Send Money
              </button>
            </div>
          )}
        </div>

        {scanning && (
          <button
            onClick={stopScan}
            className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" /> Stop Scanning
          </button>
        )}

        {!scanning && !scannedData && (
          <button
            onClick={startScan}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white font-semibold hover:shadow-xl transition flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" /> Start Camera
          </button>
        )}

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-400">
            <strong>How to scan:</strong> Tap "Start Camera" and point at any SajiloSplit user's QR code to send them money.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;