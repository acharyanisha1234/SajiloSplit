import React, { useEffect, useState } from 'react';
import { 
  Search, CreditCard, TrendingUp, Clock, CheckCircle, X,
  ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/admin/transactions');
      setTransactions(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    };
    return colors[status] || colors.pending;
  };

  const getFiltered = () => {
    let filtered = transactions;
    if (typeFilter !== 'all') filtered = filtered.filter(t => t.type === typeFilter);
    if (statusFilter !== 'all') filtered = filtered.filter(t => t.status === statusFilter);
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const stats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    volume: transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0)
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: CreditCard, gradient: 'from-[#0EA5A5] to-[#0B8A8A]' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-amber-600' },
    { label: 'Volume', value: formatCurrency(stats.volume), icon: TrendingUp, gradient: 'from-[#D4A373] to-[#C49263]' }
  ];

  const filtered = getFiltered();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#0EA5A5]/20 border-t-[#0EA5A5] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transaction Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View all platform transactions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2 truncate">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex flex-wrap gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0EA5A5]"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="transfer">Transfer</option>
              <option value="withdrawal">Withdrawal</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0EA5A5]"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex-1 relative md:max-w-sm md:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="w-20 h-20 bg-[#0EA5A5]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-10 h-10 text-[#0EA5A5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No transactions found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting filters</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">From → To</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.slice(0, 50).map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                        {tx.transactionId?.slice(-8).toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {tx.sender?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4A373] to-[#C49263] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {tx.receiver?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
                          {tx.sender?.name?.split(' ')[0] || 'Unknown'} → {tx.receiver?.name?.split(' ')[0] || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(tx.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">{tx.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;