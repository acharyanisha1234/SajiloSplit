import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Lock, Unlock, Clock, Calendar, Edit, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LockedFunds = () => {
  const { user } = useSelector((state) => state.auth);
  const [lockedFunds, setLockedFunds] = useState([]);
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

  useEffect(() => {
    fetchLockedFunds();
  }, []);

  const fetchLockedFunds = async () => {
    try {
      const response = await axios.get('/api/locked-funds');
      setLockedFunds(response.data.data);
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
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-600',
      locked: 'bg-blue-100 text-blue-600',
      unlocked: 'bg-gray-100 text-gray-600',
      expired: 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'locked': return <Lock className="w-4 h-4" />;
      case 'unlocked': return <Unlock className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const purposes = ['College Project', 'Rent', 'Travel', 'Emergency', 'Education', 'Savings', 'Investment', 'Other'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalLocked = lockedFunds.reduce((sum, f) => sum + (f.status === 'locked' || f.status === 'active' ? f.amount : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locked Funds</h1>
          <p className="text-gray-500">Lock money for specific purposes</p>
        </div>
        <button
          onClick={() => {
            setEditingFund(null);
            setFormData({ name: '', purpose: '', amount: '', unlockDate: '', description: '' });
            setShowModal(true);
          }}
          className="btn-primary py-2 px-4 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Lock Funds
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Total Locked</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalLocked)}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Active Funds</p>
          <p className="text-2xl font-bold text-gray-900">{lockedFunds.filter(f => f.status === 'active' || f.status === 'locked').length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Unlocked</p>
          <p className="text-2xl font-bold text-green-600">{lockedFunds.filter(f => f.status === 'unlocked').length}</p>
        </div>
      </div>

      {/* Funds List */}
      {lockedFunds.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No locked funds</h3>
          <p className="text-gray-500 mt-2">Lock money for future goals and purposes</p>
          <button
            onClick={() => {
              setEditingFund(null);
              setFormData({ name: '', purpose: '', amount: '', unlockDate: '', description: '' });
              setShowModal(true);
            }}
            className="btn-primary mt-4"
          >
            Lock Funds
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lockedFunds.map((fund) => {
            const isExpired = fund.unlockDate && new Date(fund.unlockDate) < new Date() && fund.status !== 'unlocked';
            const status = isExpired ? 'expired' : fund.status;
            
            return (
              <div key={fund._id} className="dashboard-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{fund.name}</h3>
                      <p className="text-sm text-gray-500">{fund.purpose}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {fund.status !== 'unlocked' && !isExpired && (
                      <button onClick={() => handleUnlock(fund._id)} className="text-green-600 hover:text-green-700">
                        <Unlock className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleEdit(fund)} className="text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(fund._id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Amount</span>
                    <p className="font-semibold text-gray-900">{formatCurrency(fund.amount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Unlock Date</span>
                    <p className="font-medium text-gray-900">
                      {fund.unlockDate ? new Date(fund.unlockDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>

                {fund.description && (
                  <p className="mt-2 text-sm text-gray-600">{fund.description}</p>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    Created {new Date(fund.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {isExpired && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                    ⚠️ This fund has expired. Please unlock it to access the money.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingFund ? 'Edit Locked Fund' : 'Lock Funds'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Fund Name *</label>
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Purpose *</label>
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Amount (NPR) *</label>
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Unlock Date</label>
                <input
                  type="date"
                  value={formData.unlockDate}
                  onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
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
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? 'Processing...' : editingFund ? 'Update Fund' : 'Lock Funds'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LockedFunds;