import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Shield, Plus, AlertTriangle, Check, X, Clock, 
  Users, Wallet, FileText, Edit, Trash2, Eye,
  TrendingUp, TrendingDown, Calendar, UserPlus,
  Send, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const EmergencyFunds = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [funds, setFunds] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    description: '',
    groupId: ''
  });
  const [requestData, setRequestData] = useState({
    amount: '',
    reason: '',
    description: '',
    fundId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fundsRes, requestsRes] = await Promise.all([
        axios.get('/api/emergency-funds'),
        axios.get('/api/emergency-funds/requests')
      ]);
      setFunds(fundsRes.data.data || []);
      setRequests(requestsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load emergency funds');
    } finally {
      setLoading(false);
    }
  };

  const handleFundSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(formData.targetAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/emergency-funds', formData);
      toast.success('Emergency fund created!');
      setShowFundModal(false);
      setFormData({ name: '', targetAmount: '', description: '', groupId: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create fund');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(requestData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/emergency-funds/requests', requestData);
      toast.success('Emergency request submitted!');
      setShowRequestModal(false);
      setRequestData({ amount: '', reason: '', description: '', fundId: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await axios.put(`/api/emergency-funds/requests/${requestId}`, { status: action });
      toast.success(`Request ${action}!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to process request');
    }
  };

  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <Check className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStats = () => {
    const total = funds.length;
    const active = funds.filter(f => f.status === 'active').length;
    const totalTarget = funds.reduce((sum, f) => sum + f.targetAmount, 0);
    const totalCurrent = funds.reduce((sum, f) => sum + f.currentAmount, 0);
    const pendingRequests = requests.filter(r => r.status === 'pending').length;

    return { total, active, totalTarget, totalCurrent, pendingRequests };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0EA5A5]/20 border-t-[#0EA5A5] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-secondary font-medium">Loading emergency funds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t('emergencyFunds') || 'Emergency Funds'}</h1>
          <p className="text-sm text-secondary mt-0.5">{t('manageEmergencyFunds') || 'Create and manage emergency funds for groups'}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" /> {t('requestFunds') || 'Request Funds'}
          </button>
          <button
            onClick={() => setShowFundModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> {t('createFund') || 'Create Fund'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-premium text-center">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('totalFunds') || 'Total Funds'}</p>
          <p className="text-2xl font-bold text-primary mt-1">{stats.total}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-[#0EA5A5]">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('active') || 'Active'}</p>
          <p className="text-2xl font-bold text-[#0EA5A5] mt-1">{stats.active}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-amber-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('pendingRequests') || 'Pending Requests'}</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pendingRequests}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-emerald-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('collected') || 'Collected'}</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(stats.totalCurrent)}</p>
          <p className="text-xs text-secondary">of {formatCurrency(stats.totalTarget)}</p>
        </div>
      </div>

      {/* Pending Requests Alert */}
      {stats.pendingRequests > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-400">
              {stats.pendingRequests} pending request(s)
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-500">
              Need your review and approval
            </p>
          </div>
        </div>
      )}

      {/* Funds List */}
      {funds.length === 0 ? (
        <div className="card-premium text-center py-12">
          <div className="w-20 h-20 bg-[#0EA5A5]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-[#0EA5A5]" />
          </div>
          <h3 className="text-lg font-semibold text-primary">{t('noEmergencyFunds') || 'No emergency funds'}</h3>
          <p className="text-sm text-secondary mt-1 max-w-sm mx-auto">
            {t('createEmergencyFund') || 'Create an emergency fund for your group'}
          </p>
          <button
            onClick={() => setShowFundModal(true)}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {t('createFund') || 'Create Fund'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funds.map((fund) => {
            const progress = fund.targetAmount > 0 ? Math.min(100, (fund.currentAmount / fund.targetAmount) * 100) : 0;
            return (
              <div key={fund._id} className="card-premium">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center dark:bg-red-900/30">
                      <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{fund.name}</h3>
                      <p className="text-sm text-secondary">{fund.description || 'No description'}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${
                    fund.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {fund.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-surface-hover rounded-xl">
                    <p className="text-xs text-secondary">{t('target') || 'Target'}</p>
                    <p className="font-semibold text-primary">{formatCurrency(fund.targetAmount)}</p>
                  </div>
                  <div className="p-3 bg-surface-hover rounded-xl">
                    <p className="text-xs text-secondary">{t('current') || 'Current'}</p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(fund.currentAmount || 0)}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-secondary">
                    <span>{t('progress') || 'Progress'}</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 mt-1 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] rounded-full h-2 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-secondary">
                  <span>{t('created') || 'Created'}: {new Date(fund.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => {
                      setSelectedFund(fund);
                      setRequestData({ ...requestData, fundId: fund._id });
                      setShowRequestModal(true);
                    }}
                    className="text-[#0EA5A5] hover:text-[#0B8A8A] font-medium"
                  >
                    {t('request') || 'Request'} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Requests List */}
      {requests.length > 0 && (
        <div className="card-premium">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0EA5A5]" />
            {t('emergencyRequests') || 'Emergency Requests'}
          </h2>
          <div className="space-y-3">
            {requests.slice(0, 10).map((request) => (
              <div key={request._id} className="flex items-center justify-between p-4 bg-surface-hover rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                  </div>
                  <div>
                    <p className="font-medium text-primary">{request.reason}</p>
                    <p className="text-sm text-secondary">{request.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-secondary">
                      <span>From: {request.user?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(request.amount)}</p>
                  <div className="flex gap-1 mt-1 justify-end">
                    {request.status === 'pending' && user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleRequestAction(request._id, 'approved')}
                          className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition dark:bg-emerald-900/30 dark:text-emerald-400"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRequestAction(request._id, 'rejected')}
                          className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition dark:bg-red-900/30 dark:text-red-400"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <span className={`text-xs px-2.5 py-0.5 rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0EA5A5]" />
                <h2 className="text-xl font-bold text-primary">{t('createEmergencyFund') || 'Create Emergency Fund'}</h2>
              </div>
              <button onClick={() => setShowFundModal(false)} className="p-2 hover:bg-surface-hover rounded-xl transition">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <form onSubmit={handleFundSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('fundName') || 'Fund Name'} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Family Emergency Fund"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('targetAmount') || 'Target Amount (NPR)'} *</label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="input-field"
                  placeholder="Enter target amount"
                  min="1"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('description') || 'Description'}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="Describe the purpose..."
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3.5 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Creating...
                  </span>
                ) : (
                  'Create Fund'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#0EA5A5]" />
                <h2 className="text-xl font-bold text-primary">{t('requestEmergencyFund') || 'Request Emergency Fund'}</h2>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-surface-hover rounded-xl transition">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('selectFund') || 'Select Fund'} *</label>
                <select
                  value={requestData.fundId}
                  onChange={(e) => setRequestData({ ...requestData, fundId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select a fund</option>
                  {funds.map(f => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('amount') || 'Amount (NPR)'} *</label>
                <input
                  type="number"
                  value={requestData.amount}
                  onChange={(e) => setRequestData({ ...requestData, amount: e.target.value })}
                  className="input-field"
                  placeholder="Enter amount"
                  min="1"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('reason') || 'Reason'} *</label>
                <select
                  value={requestData.reason}
                  onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select reason</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Accident">Accident</option>
                  <option value="Family Emergency">Family Emergency</option>
                  <option value="Natural Disaster">Natural Disaster</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('description') || 'Description'}</label>
                <textarea
                  value={requestData.description}
                  onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
                  className="input-field"
                  placeholder="Provide more details..."
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3.5 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Submitting...
                  </span>
                ) : (
                  'Submit Request'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyFunds;