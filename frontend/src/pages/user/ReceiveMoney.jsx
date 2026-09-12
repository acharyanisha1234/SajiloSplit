import React from 'react';
import { useSelector } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Share2, ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ReceiveMoney = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [copied, setCopied] = React.useState(false);

  // Generate QR data
  const qrData = JSON.stringify({
    userId: user?.id,
    name: user?.name,
    email: user?.email,
    type: 'sajilosplit_payment'
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(user?.email || '');
    setCopied(true);
    toast.success('Email copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector('#user-qr-code svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `sajilosplit-qr-${user?.name}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('QR downloaded!');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Receive Money</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Share your QR code</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-6 max-w-md mx-auto">
        {/* QR Code */}
        <div className="text-center mb-6">
          <div id="user-qr-code" className="inline-block bg-white p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
            <QRCodeSVG
              value={qrData}
              size={220}
              level="H"
              includeMargin={true}
              fgColor="#1A2E4A"
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Scan to pay me</p>
        </div>

        {/* User Info */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="text-sm text-slate-500 dark:text-slate-400">Name</span>
            <span className="font-semibold text-slate-900 dark:text-white">{user?.name}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">{user?.email}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#0EA5A5] text-[#0EA5A5] font-semibold hover:bg-[#0EA5A5]/10 transition"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Copy Email'}
          </button>
          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white font-semibold hover:shadow-xl transition"
          >
            <Download className="w-5 h-5" /> Download QR
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveMoney;