import React, { useEffect, useState } from 'react';
import { 
  Search, FileText, Clock, AlertTriangle, Shield,
  User, Activity, X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('/api/admin/audit-logs');
      setLogs(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      security: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[severity] || colors.info;
  };

  const getActionColor = (action) => {
    const colors = {
      login: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      logout: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      create: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      update: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      suspend: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      activate: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    };
    return colors[action] || colors.logout;
  };

  const getFiltered = () => {
    let filtered = logs;
    if (actionFilter !== 'all') filtered = filtered.filter(l => l.action === actionFilter);
    if (severityFilter !== 'all') filtered = filtered.filter(l => l.severity === severityFilter);
    if (searchTerm) {
      filtered = filtered.filter(l =>
        l.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const stats = {
    total: logs.length,
    today: logs.filter(l => {
      const d = new Date(l.createdAt);
      const t = new Date();
      return d.toDateString() === t.toDateString();
    }).length,
    week: logs.filter(l => {
      const d = new Date(l.createdAt);
      const t = new Date();
      t.setDate(t.getDate() - 7);
      return d >= t;
    }).length,
    critical: logs.filter(l => l.severity === 'critical' || l.severity === 'security').length
  };

  const statCards = [
    { label: 'Total Logs', value: stats.total, icon: FileText, gradient: 'from-[#1A2E4A] to-[#14243B]' },
    { label: 'Today', value: stats.today, icon: Clock, gradient: 'from-[#0EA5A5] to-[#0B8A8A]' },
    { label: 'This Week', value: stats.week, icon: Activity, gradient: 'from-[#D4A373] to-[#C49263]' },
    { label: 'Critical', value: stats.critical, icon: AlertTriangle, gradient: 'from-red-500 to-red-600' }
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track all platform activities</p>
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
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0EA5A5]"
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0EA5A5]"
            >
              <option value="all">All Severity</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
              <option value="security">Security</option>
            </select>
          </div>

          <div className="flex-1 relative md:max-w-sm md:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search logs..."
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
            <FileText className="w-10 h-10 text-[#0EA5A5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No logs found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting filters</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">IP</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.slice(0, 100).map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {log.user?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <span className="text-sm text-slate-900 dark:text-white truncate">
                          {log.user?.name || 'System'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                        {log.details || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {log.ip || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity || 'info'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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

export default AdminAuditLogs;