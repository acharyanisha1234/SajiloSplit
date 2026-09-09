import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Shield, AlertTriangle, Check, X, Clock, Users, Wallet, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EmergencyFunds = () => {
  const { user } = useSelector((state) => state.auth);
  const [funds, setFunds] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    description: ''
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
      setFunds(fundsRes.data.data);
      setRequests(requestsRes.data.data);
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
      setFormData({ name: '', targetAmount: '', description: '' });
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

  const handleContribute = async (fundId, amount) => {
    try {
      await axios.post(`/api/emergency-funds/${fundId}/contribute`, { amount });
      toast.success('Contribution added!');
      fetchData();
    } catch (error) {
      toast.error('Failed to contribute');
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Funds</h1>
          <p className="text-gray-500">Create and manage emergency funds for groups</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setRequestData({ ...requestData, fundId: funds[0]?._id || '' });
              setShowRequestModal(true);
            }}
            className="btn-secondary py-2 px-4 flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" /> Request Funds
          </button>
          <button
            onClick={() => setShowFundModal(true)}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create Fund
          </button>
        </div>
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">{pendingRequests.length} pending request(s)</p>
            <p className="text-sm text-amber-600">Need your review and approval</p>
          </div>
        </div>
      )}

      {/* Funds List */}
      {funds.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No emergency funds</h3>
          <p className="text-gray-500 mt-2">Create an emergency fund for your group</p>
          <button onClick={() => setShowFundModal(true)} className="btn-primary mt-4">
            Create Emergency Fund
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funds.map((fund) => {
            const progress = fund.targetAmount > 0 ? Math.min(100, (fund.currentAmount / fund.targetAmount) * 100) : 0;
            return (
              <div key={fund._id} className="dashboard-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{fund.name}</h3>
                      <p className="text-sm text-gray-500">{fund.description || 'No description'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Target</span>
                    <p className="font-semibold text-gray-900">{formatCurrency(fund.targetAmount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Current</span>
                    <p className="font-semibold text-green-600">{formatCurrency(fund.currentAmount || 0)}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-red-600 rounded-full h-2 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    fund.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {fund.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    Created {new Date(fund.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Requests List */}
      {requests.length > 0 && (
        <div className="dashboard-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Requests</h2>
          <div className="space-y-3">
            {requests.slice(0, 5).map((request) => (
              <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{request.reason}</p>
                  <p className="text-sm text-gray-500">{request.description}</p>
                  <p className="text-xs text-gray-400">From: {request.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{formatCurrency(request.amount)}</p>
                  <div className="flex gap-1 mt-1">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRequestAction(request._id, 'approved')}
                          className="text-green-600 hover:text-green-700 text-xs px-2 py-0.5 bg-green-50 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequestAction(request._id, 'rejected')}
                          className="text-red-600 hover:text-red-700 text-xs px-2 py-0.5 bg-red-50 rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      request.status === 'approved' ? 'bg-green-100 text-green-600' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create Emergency Fund</h2>
              <button onClick={() => setShowFundModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleFundSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Fund Name *</label>
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Target Amount (NPR) *</label>
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
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
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Fund'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Request Emergency Fund</h2>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleRequestSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Select Fund *</label>
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Amount (NPR) *</label>
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Reason *</label>
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
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
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyFunds;