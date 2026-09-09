import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Lock, Unlock, Plus, Edit, Trash2, Calendar, 
  Clock, AlertCircle, CheckCircle, X, Target,
  Wallet, TrendingUp, TrendingDown, Shield
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const LockedFunds = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFund, setEditingFund] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    amount: '',
    unlockDate: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const purposes = [
    'College Project', 'Rent', 'Travel', 'Emergency', 
    'Education', 'Savings', 'Investment', 'House', 
    'Vehicle', 'Wedding', 'Business', 'Other'
  ];

  useEffect(() => {
    fetchLockedFunds();
  }, []);

  const fetchLockedFunds = async () => {
    try {
      const response = await axios.get('/api/locked-funds');
      setFunds(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load locked funds');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      if (editingFund) {
        await axios.put(`/api/locked-funds/${editingFund._id}`, formData);
        toast.success('Fund updated!');
      } else {
        await axios.post('/api/locked-funds', formData);
        toast.success('Fund locked successfully!');
      }
      setShowModal(false);
      setEditingFund(null);
      setFormData({ name: '', purpose: '', amount: '', unlockDate: '', description: '' });
      fetchLockedFunds();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save fund');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlock = async (id) => {
    if (!confirm('Are you sure you want to unlock this fund?')) return;
    try {
      await axios.put(`/api/locked-funds/${id}/unlock`);
      toast.success('Fund unlocked successfully!');
      fetchLockedFunds();
    } catch (error) {
      toast.error('Failed to unlock fund');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this locked fund?')) return;
    try {
      await axios.delete(`/api/locked-funds/${id}`);
      toast.success('Fund deleted!');
      fetchLockedFunds();
    } catch (error) {
      toast.error('Failed to delete fund');
    }
  };

  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      locked: 'bg-[#0EA5A5]/10 text-[#0EA5A5] dark:bg-[#0EA5A5]/20',
      unlocked: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'locked': return <Lock className="w-4 h-4" />;
      case 'unlocked': return <Unlock className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStats = () => {
    const total = funds.length;
    const locked = funds.filter(f => f.status === 'locked').length;
    const unlocked = funds.filter(f => f.status === 'unlocked').length;
    const totalAmount = funds.reduce((sum, f) => sum + f.amount, 0);
    const lockedAmount = funds.filter(f => f.status === 'locked').reduce((sum, f) => sum + f.amount, 0);

    return { total, locked, unlocked, totalAmount, lockedAmount };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0EA5A5]/20 border-t-[#0EA5A5] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-secondary font-medium">Loading locked funds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t('lockedFunds') || 'Locked Funds'}</h1>
          <p className="text-sm text-secondary mt-0.5">{t('lockMoneyForPurpose') || 'Lock money for specific purposes'}</p>
        </div>
        <button
          onClick={() => {
            setEditingFund(null);
            setFormData({ name: '', purpose: '', amount: '', unlockDate: '', description: '' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Lock className="w-5 h-5" /> {t('lockFunds') || 'Lock Funds'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-premium text-center">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('totalFunds') || 'Total Funds'}</p>
          <p className="text-2xl font-bold text-primary mt-1">{stats.total}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-[#0EA5A5]">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('locked') || 'Locked'}</p>
          <p className="text-2xl font-bold text-[#0EA5A5] mt-1">{stats.locked}</p>
          <p className="text-xs text-secondary mt-1">{formatCurrency(stats.lockedAmount)}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-emerald-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('unlocked') || 'Unlocked'}</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.unlocked}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-amber-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('totalAmount') || 'Total Amount'}</p>
          <p className="text-lg font-bold text-primary mt-1">{formatCurrency(stats.totalAmount)}</p>
        </div>
      </div>

      {/* Funds List */}
      {funds.length === 0 ? (
        <div className="card-premium text-center py-12">
          <div className="w-20 h-20 bg-[#0EA5A5]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-[#0EA5A5]" />
          </div>
          <h3 className="text-lg font-semibold text-primary">{t('noLockedFunds') || 'No locked funds'}</h3>
          <p className="text-sm text-secondary mt-1 max-w-sm mx-auto">
            {t('lockMoneyForGoals') || 'Lock money for future goals and purposes'}
          </p>
          <button
            onClick={() => {
              setEditingFund(null);
              setFormData({ name: '', purpose: '', amount: '', unlockDate: '', description: '' });
              setShowModal(true);
            }}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <Lock className="w-4 h-4" /> {t('lockFunds') || 'Lock Funds'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funds.map((fund) => {
            const isExpired = fund.unlockDate && new Date(fund.unlockDate) < new Date() && fund.status !== 'unlocked';
            const status = isExpired ? 'expired' : fund.status;
            const canUnlock = fund.status === 'locked' && (!fund.unlockDate || new Date(fund.unlockDate) <= new Date());

            return (
              <div key={fund._id} className="card-premium">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{fund.name}</h3>
                      <p className="text-sm text-secondary">{fund.purpose}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {canUnlock && (
                      <button
                        onClick={() => handleUnlock(fund._id)}
                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition dark:bg-emerald-900/30 dark:text-emerald-400"
                        title="Unlock"
                      >
                        <Unlock className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingFund(fund);
                        setFormData({
                          name: fund.name,
                          purpose: fund.purpose,
                          amount: fund.amount,
                          unlockDate: fund.unlockDate?.split('T')[0] || '',
                          description: fund.description || ''
                        });
                        setShowModal(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-surface-hover transition text-secondary hover:text-primary"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fund._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition text-secondary hover:text-red-500 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-surface-hover rounded-xl">
                    <p className="text-xs text-secondary">{t('amount') || 'Amount'}</p>
                    <p className="font-semibold text-primary">{formatCurrency(fund.amount)}</p>
                  </div>
                  <div className="p-3 bg-surface-hover rounded-xl">
                    <p className="text-xs text-secondary">{t('unlockDate') || 'Unlock Date'}</p>
                    <p className="font-medium text-primary">
                      {fund.unlockDate ? new Date(fund.unlockDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>

                {fund.description && (
                  <p className="mt-2 text-sm text-secondary">{fund.description}</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  <span className="text-xs text-secondary">
                    {t('created') || 'Created'}: {new Date(fund.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {isExpired && (
                  <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    This fund has expired. Please unlock it to access the money.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#0EA5A5]" />
                <h2 className="text-xl font-bold text-primary">
                  {editingFund ? 'Edit Locked Fund' : 'Lock Funds'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-hover rounded-xl transition">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('fundName') || 'Fund Name'} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., College Project Fund"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('purpose') || 'Purpose'} *</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select purpose</option>
                  {purposes.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('amount') || 'Amount (NPR)'} *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="Enter amount"
                  min="1"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('unlockDate') || 'Unlock Date'}</label>
                <input
                  type="date"
                  value={formData.unlockDate}
                  onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('description') || 'Description'}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="Add any additional details..."
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
                    Processing...
                  </span>
                ) : (
                  editingFund ? 'Update Fund' : 'Lock Funds'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LockedFunds;