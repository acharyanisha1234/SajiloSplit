import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Check, X, Eye } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await axios.get('/api/admin/disputes');
      setDisputes(response.data.data);
    } catch (error) {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/api/admin/disputes/${id}`, { status });
      toast.success(`Dispute ${status}!`);
      fetchDisputes();
    } catch (error) {
      toast.error('Failed to update dispute');
    }
  };

  const filteredDisputes = filter === 'all' 
    ? disputes 
    : disputes.filter(d => d.status === filter);

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-red-100 text-red-600',
      'under-review': 'bg-yellow-100 text-yellow-600',
      resolved: 'bg-green-100 text-green-600',
      rejected: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
        <p className="text-gray-500">Review and resolve disputes</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({disputes.length})
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'open' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Open ({disputes.filter(d => d.status === 'open').length})
        </button>
        <button
          onClick={() => setFilter('under-review')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'under-review' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Under Review ({disputes.filter(d => d.status === 'under-review').length})
        </button>
      </div>

      {/* Disputes List */}
      {filteredDisputes.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No disputes</h3>
          <p className="text-gray-500 mt-2">All disputes have been resolved</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDisputes.map((dispute) => (
            <div key={dispute._id} className="dashboard-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(dispute.status)}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dispute #{dispute._id.slice(-6)}</h3>
                    <p className="text-sm text-gray-500">{dispute.reason}</p>
                    <p className="text-sm text-gray-600 mt-1">{dispute.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">Transaction: {dispute.transactionId}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(dispute.status)}`}>
                        {dispute.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {dispute.status === 'open' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(dispute._id, 'under-review')}
                        className="btn-secondary py-1 px-3 text-sm"
                      >
                        Review
                      </button>
                    </>
                  )}
                  {dispute.status === 'under-review' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(dispute._id, 'resolved')}
                        className="btn-primary py-1 px-3 text-sm flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Resolve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(dispute._id, 'rejected')}
                        className="btn-danger py-1 px-3 text-sm flex items-center gap-1"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;