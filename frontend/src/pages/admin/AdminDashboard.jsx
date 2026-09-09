import React, { useEffect, useState } from 'react';
import { Users, Wallet, Group, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalGroups: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingDisputes: 0,
    activeEmergencyFunds: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  const statsCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'bg-green-500' },
    { label: 'Total Groups', value: stats.totalGroups, icon: Group, color: 'bg-purple-500' },
    { label: 'Total Transactions', value: stats.totalTransactions, icon: Wallet, color: 'bg-indigo-500' },
    { label: 'Transaction Volume', value: formatCurrency(stats.totalVolume), icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Pending Disputes', value: stats.pendingDisputes, icon: AlertTriangle, color: 'bg-red-500' },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Overview of platform statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((card, index) => (
          <div key={index} className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.color} text-white p-3 rounded-lg`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;