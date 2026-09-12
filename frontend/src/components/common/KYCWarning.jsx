import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const KYCWarning = () => {
  const { user } = useSelector((state) => state.auth);
  const kycStatus = user?.kyc?.status || 'not_submitted';

  if (kycStatus === 'approved') return null;

  const messages = {
    not_submitted: {
      title: 'KYC Verification Required',
      text: 'Complete your KYC to start sending money and making payments.',
      color: 'amber'
    },
    pending: {
      title: 'KYC Under Review',
      text: 'Your documents are being reviewed. You will be notified once approved.',
      color: 'blue'
    },
    rejected: {
      title: 'KYC Rejected',
      text: 'Your KYC was rejected. Please resubmit with correct documents.',
      color: 'red'
    }
  };

  const config = messages[kycStatus] || messages.not_submitted;
  const colors = {
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400'
  };

  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${colors[config.color]}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold text-sm">{config.title}</p>
          <p className="text-xs opacity-90">{config.text}</p>
        </div>
      </div>
      {kycStatus !== 'pending' && (
        <Link
          to="/kyc"
          className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-sm font-semibold hover:shadow transition"
        >
          Verify <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
};

export default KYCWarning;