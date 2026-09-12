import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, CreditCard, DollarSign, Group, AlertTriangle,
  TrendingUp, ArrowUpRight, ArrowDownRight, Activity,
  Shield, RefreshCw, ChevronRight, UserCheck, UserX,
  BarChart3, Sparkles, Clock, CheckCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    newUsersToday: 0,
    totalGroups: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingDisputes: 0,
    transactionsToday: 0,
    volumeToday: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, txRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users?limit=5'),
        axios.get('/api/admin/transactions?limit=5')
      ]);

      setStats(statsRes.data?.data || {});
      setRecentUsers((usersRes.data?.data || []).slice(0, 5));
      setRecentTransactions((txRes.data?.data || []).slice(0, 5));
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const primaryStats = [
    {
      label: 'Total Users',
      value: formatNumber(stats.totalUsers),
      icon: Users,
      gradient: 'from-[#0EA5A5] to-[#0B8A8A]',
      trend: stats.newUsersToday > 0 ? `+${stats.newUsersToday} today` : null,
      trendColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Transactions',
      value: formatNumber(stats.totalTransactions),
      icon: CreditCard,
      gradient: 'from-[#D4A373] to-[#C49263]',
      trend: stats.transactionsToday > 0 ? `+${stats.transactionsToday} today` : null,
      trendColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Total Volume',
      value: formatCurrency(stats.totalVolume),
      icon: DollarSign,
      gradient: 'from-[#1A2E4A] to-[#14243B]',
      trend: stats.volumeToday > 0 ? `+${formatCurrency(stats.volumeToday)}` : null,
      trendColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Total Groups',
      value: formatNumber(stats.totalGroups),
      icon: Group,
      gradient: 'from-purple-500 to-purple-600',
      trend: 'Active platform',
      trendColor: 'text-slate-500',
    },
  ];

  const secondaryStats = [
    {
      label: 'Active Users',
      value: formatNumber(stats.activeUsers),
      icon: UserCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: 'Suspended Users',
      value: formatNumber(stats.suspendedUsers),
      icon: UserX,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      label: 'Pending Disputes',
      value: formatNumber(stats.pendingDisputes),
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ];

  const quickActions = [
    { label: 'Users', icon: Users, path: '/admin/users', color: 'text-[#0EA5A5]', bg: 'bg-[#0EA5A5]/10', hover: 'hover:bg-[#0EA5A5]/20' },
    { label: 'Transactions', icon: CreditCard, path: '/admin/transactions', color: 'text-[#D4A373]', bg: 'bg-[#D4A373]/10', hover: 'hover:bg-[#D4A373]/20' },
    { label: 'Groups', icon: Group, path: '/admin/groups', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', hover: 'hover:bg-purple-200' },
    { label: 'Disputes', icon: AlertTriangle, path: '/admin/disputes', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', hover: 'hover:bg-amber-200' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0EA5A5]/20 border-t-[#0EA5A5] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-[#0EA5A5]" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {getGreeting()}, Admin
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Overview of platform statistics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#0EA5A5] hover:border-[#0EA5A5] shadow-sm transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link
            to="/admin/users"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white font-semibold shadow-lg shadow-[#0EA5A5]/25 hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Manage Users</span>
          </Link>
        </div>
      </div>

      {/* ===== PRIMARY STATS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2 truncate">
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${stat.trendColor}`}>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{stat.trend}</span>
                    </div>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== SECONDARY STATS + QUICK ACTIONS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Secondary Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#0EA5A5]/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#0EA5A5]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Platform Metrics
            </h3>
          </div>

          <div className="space-y-3">
            {secondaryStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {stat.label}
                    </p>
                  </div>
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center shadow-lg shadow-[#0EA5A5]/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Quick Actions
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  to={action.path}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.bg} ${action.hover} transition-all duration-200 group`}
                >
                  <Icon className={`w-6 h-6 ${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== RECENT ACTIVITY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Users */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0EA5A5]/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-[#0EA5A5]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Users</h3>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-[#0EA5A5] hover:text-[#0B8A8A] flex items-center gap-1 transition"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentUsers.length > 0 ? (
            <div className="space-y-2">
              {recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#0EA5A5]/25 shrink-0">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    user.isSuspended
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}>
                    {user.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No users yet</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D4A373]/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-[#D4A373]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            </div>
            <Link
              to="/admin/transactions"
              className="text-xs font-semibold text-[#0EA5A5] hover:text-[#0B8A8A] flex items-center gap-1 transition"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'deposit'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {tx.type === 'deposit'
                        ? <ArrowDownRight className="w-5 h-5" />
                        : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {tx.purpose || tx.type}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {tx.sender?.name || 'Unknown'} → {tx.receiver?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${
                      tx.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No transactions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== SYSTEM STATUS ===== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">System Status</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse"></div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Server</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Online</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse"></div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Database</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Connected</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Last Updated</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;