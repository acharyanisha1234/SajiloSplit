import React, { useEffect, useState } from 'react';
import { 
  Search, Users, Wallet, Calendar, Trash2, Eye, Group,
  TrendingUp, X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/admin/groups');
      setGroups(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this group?')) return;
    try {
      await axios.delete(`/api/admin/groups/${id}`);
      toast.success('Group deleted');
      fetchGroups();
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    };
    return colors[status] || colors.active;
  };

  const getFiltered = () => {
    let filtered = groups;
    if (filter === 'active') filtered = filtered.filter(g => g.status === 'active');
    if (filter === 'inactive') filtered = filtered.filter(g => g.status === 'inactive');
    if (filter === 'archived') filtered = filtered.filter(g => g.status === 'archived');
    if (searchTerm) {
      filtered = filtered.filter(g =>
        g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const stats = {
    total: groups.length,
    active: groups.filter(g => g.status === 'active').length,
    members: groups.reduce((s, g) => s + (g.members?.length || 0), 0),
    balance: groups.reduce((s, g) => s + (g.balance || 0), 0)
  };

  const statCards = [
    { label: 'Total Groups', value: stats.total, icon: Group, gradient: 'from-[#1A2E4A] to-[#14243B]' },
    { label: 'Active', value: stats.active, icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Members', value: stats.members, icon: Users, gradient: 'from-[#0EA5A5] to-[#0B8A8A]' },
    { label: 'Total Balance', value: formatCurrency(stats.balance), icon: Wallet, gradient: 'from-[#D4A373] to-[#C49263]' }
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Group Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all platform groups</p>
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
            {['all', 'active', 'inactive', 'archived'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-[#0EA5A5] text-white shadow-lg shadow-[#0EA5A5]/25'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {f} ({f === 'all' ? groups.length : groups.filter(g => g.status === f).length})
              </button>
            ))}
          </div>

          <div className="flex-1 relative md:max-w-sm md:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="w-20 h-20 bg-[#0EA5A5]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Group className="w-10 h-10 text-[#0EA5A5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No groups found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((group) => {
            const progress = group.targetAmount > 0 ? Math.min(100, ((group.balance || 0) / group.targetAmount) * 100) : 0;
            return (
              <div key={group._id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#0EA5A5]/25 shrink-0">
                      {group.name?.charAt(0)?.toUpperCase() || 'G'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">{group.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{group.category || 'General'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${getStatusColor(group.status)}`}>
                    {group.status || 'active'}
                  </span>
                </div>

                {group.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {group.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Members</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{group.members?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Balance</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{formatCurrency(group.balance || 0)}</p>
                  </div>
                </div>

                {group.targetAmount > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => window.location.href = `/groups/${group._id}`}
                      className="p-2 rounded-lg hover:bg-[#0EA5A5]/10 text-slate-500 hover:text-[#0EA5A5] transition"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(group._id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminGroups;