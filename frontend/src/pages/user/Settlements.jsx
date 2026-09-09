import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Check, X, Clock, ArrowRight, Wallet } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Settlements = () => {
  const { user } = useSelector((state) => state.auth);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      const response = await axios.get('/api/settlements');
      setSettlements(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load settlements');
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async (settlementId) => {
    try {
      await axios.put(`/api/settlements/${settlementId}/settle`);
      toast.success('Settlement completed!');
      fetchSettlements();
    } catch (error) {
      toast.error('Failed to settle');
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-600',
      paid: 'bg-green-100 text-green-600',
      cancelled: 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'paid': return <Check className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const pendingSettlements = settlements.filter(s => s.status === 'pending');
  const paidSettlements = settlements.filter(s => s.status === 'paid');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settlements</h1>
        <p className="text-gray-500">Manage your pending and completed settlements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Pending Settlements</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingSettlements.length}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Total Amount Due</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(pendingSettlements.reduce((sum, s) => sum + s.amount, 0))}
          </p>
        </div>
      </div>

      {/* Pending Settlements */}
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Settlements</h2>
        {pendingSettlements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p>All settled up! No pending settlements.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSettlements.map((settlement) => (
              <div key={settlement._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(settlement.status)}`}>
                    {getStatusIcon(settlement.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {settlement.from?.name} owes {settlement.to?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Group: {settlement.group?.name || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-red-600">{formatCurrency(settlement.amount)}</p>
                  <button
                    onClick={() => handleSettle(settlement._id)}
                    className="btn-primary py-1.5 px-4 text-sm"
                  >
                    Settle Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Settlements */}
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Settlements</h2>
        {paidSettlements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No completed settlements yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paidSettlements.slice(0, 10).map((settlement) => (
              <div key={settlement._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {settlement.from?.name} → {settlement.to?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Settled on {new Date(settlement.settledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-green-600">{formatCurrency(settlement.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settlements;