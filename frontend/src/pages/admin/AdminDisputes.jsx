import React, { useEffect, useState } from 'react';
import { 
  Search, AlertTriangle, Clock, CheckCircle, XCircle, X,
  User, CreditCard, Calendar
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await axios.get('/api/admin/disputes');
      setDisputes(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/api/admin/disputes/${id}`, { status });
      toast.success(`Dispute ${status}`);
      fetchDisputes();
    } catch (error) {
      toast.error('Failed to update dispute');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'under-review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      rejected: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    };
    return colors[status] || colors.open;
  };

  const getFiltered = () => {
    let filtered = disputes;
    if (filter !== 'all') filtered = filtered.filter(d => d.status === filter);
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    review: disputes.filter(d => d.status === 'under-review').length,
    resolved: disputes.filter(d => d.status === 'resolved').length
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: AlertTriangle, gradient: 'from-[#1A2E4A] to-[#14243B]' },
    { label: 'Open', value: stats.open, icon: AlertTriangle, gradient: 'from-red-500 to-red-600' },
    { label: 'Under Review', value: stats.review, icon: Clock, gradient: 'from-amber-500 to-amber-600' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600' }
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dispute Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and resolve user disputes</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
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
            {['all', 'open', 'under-review', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-[#0EA5A5] text-white shadow-lg shadow-[#0EA5A5]/25'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex-1 relative md:max-w-sm md:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search disputes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No disputes found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All clear!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((dispute) => (
            <div key={dispute._id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <div className={`p-2 rounded-xl ${getStatusColor(dispute.status)}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Dispute #{dispute._id?.slice(-6)?.toUpperCase()}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {dispute.reason}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${getStatusColor(dispute.status)}`}>
                      {dispute.status?.replace('-', ' ')}
                    </span>
                  </div>

                  {dispute.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {dispute.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{dispute.user?.name || 'Unknown'}</span>
                    </div>
                    {dispute.transactionId && (
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="font-mono">{dispute.transactionId?.slice(-8)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {dispute.status === 'open' && (
                    <button
                      onClick={() => handleStatusUpdate(dispute._id, 'under-review')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition"
                    >
                      Review
                    </button>
                  )}
                  {dispute.status === 'under-review' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(dispute._id, 'resolved')}
                        className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 transition"
                        title="Resolve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(dispute._id, 'rejected')}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
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