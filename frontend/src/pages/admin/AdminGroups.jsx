import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar, Eye, Group, Search, Trash2, TrendingUp, Users, Wallet, X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const filters = ['all', 'active', 'inactive', 'archived'];

const statusStyles = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
};

const AdminGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/admin/groups');
      setGroups(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      toast.error('Failed to load groups');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      await axios.delete(`/api/admin/groups/${id}`);
      setGroups((currentGroups) => currentGroups.filter((group) => group._id !== id));
      toast.success('Group deleted successfully');
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  const formatCurrency = (amount) => `NPR ${Number(amount || 0).toLocaleString('en-IN')}`;

  const stats = useMemo(() => ({
    total: groups.length,
    active: groups.filter((group) => group.status === 'active').length,
    members: groups.reduce((total, group) => total + (group.members?.length || 0), 0),
    balance: groups.reduce((total, group) => total + Number(group.balance || 0), 0)
  }), [groups]);

  const filteredGroups = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return groups.filter((group) => {
      const matchesFilter = filter === 'all' || group.status === filter;
      const matchesSearch = !query || [group.name, group.description, group.category]
        .some((value) => value?.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [filter, groups, searchTerm]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#0EA5A5]/20 border-t-[#0EA5A5]" />
          <p className="mt-4 text-secondary font-medium">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-primary">Group Management</h1>
            <span className="rounded-full bg-[#0EA5A5]/10 px-2.5 py-1 text-xs font-semibold text-[#0EA5A5]">
              {stats.total} Total
            </span>
          </div>
          <p className="mt-1 text-sm text-secondary">Manage all platform groups</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Group statistics">
        {[
          { label: 'Total Groups', value: stats.total, icon: Group, color: 'text-[#1A2E4A]', bg: 'bg-[#1A2E4A]/10' },
          { label: 'Active Groups', value: stats.active, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Total Members', value: stats.members, icon: Users, color: 'text-[#0EA5A5]', bg: 'bg-[#0EA5A5]/10' },
          { label: 'Total Balance', value: formatCurrency(stats.balance), icon: Wallet, color: 'text-[#D4A373]', bg: 'bg-[#D4A373]/10' }
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card-premium">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-secondary">{label}</p>
                <p className={`mt-1 truncate ${label === 'Total Balance' ? 'text-lg' : 'text-2xl'} font-bold text-primary`}>{value}</p>
              </div>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="card-premium">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">
            {filters.map((option) => {
              const count = option === 'all' ? groups.length : groups.filter((group) => group.status === option).length;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all ${filter === option
                    ? 'bg-[#0EA5A5] text-white shadow-lg shadow-[#0EA5A5]/25'
                    : 'border border-border bg-surface text-secondary hover:bg-surface-hover'}`}
                >
                  {option} ({count})
                </button>
              );
            })}
          </div>
          <div className="relative w-full md:ml-auto md:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search groups..."
              aria-label="Search groups"
              className="input-field pl-10 pr-10"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-surface-hover">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {filteredGroups.length === 0 ? (
        <div className="card-premium py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0EA5A5]/10">
            <Group className="h-10 w-10 text-[#0EA5A5]" />
          </div>
          <h2 className="text-lg font-semibold text-primary">No groups found</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-secondary">
            {searchTerm ? 'Try adjusting your search or clear the current filter.' : 'Groups created by users will appear here.'}
          </p>
          {searchTerm && <button type="button" onClick={() => setSearchTerm('')} className="btn-primary mt-4">Clear Search</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => {
            const progress = group.targetAmount > 0 ? Math.min(100, (Number(group.balance || 0) / group.targetAmount) * 100) : 0;
            const status = group.status || 'active';
            return (
              <article key={group._id} className="card-premium group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] text-lg font-bold text-white shadow-lg shadow-[#0EA5A5]/25">
                      {group.name?.charAt(0)?.toUpperCase() || 'G'}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-primary">{group.name}</h2>
                      <p className="truncate text-xs text-secondary">{group.category || 'General'}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${statusStyles[status] || statusStyles.active}`}>{status}</span>
                </div>

                <p className="mt-3 line-clamp-2 min-h-10 text-sm text-secondary">{group.description || 'No description provided.'}</p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-surface-hover p-3">
                    <div className="mb-0.5 flex items-center gap-1.5 text-xs text-secondary"><Users className="h-3.5 w-3.5" /> Members</div>
                    <p className="text-sm font-bold text-primary">{group.members?.length || 0}</p>
                  </div>
                  <div className="rounded-xl bg-surface-hover p-3">
                    <div className="mb-0.5 flex items-center gap-1.5 text-xs text-secondary"><Wallet className="h-3.5 w-3.5" /> Balance</div>
                    <p className="truncate text-sm font-bold text-primary">{formatCurrency(group.balance)}</p>
                  </div>
                </div>

                {group.targetAmount > 0 && (
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-secondary"><span>Progress</span><span className="font-semibold text-primary">{progress.toFixed(0)}%</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A]" style={{ width: `${progress}%` }} /></div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-border-light pt-4">
                  <div className="flex min-w-0 items-center gap-1 text-xs text-secondary">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>{group.createdAt ? new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => toast(`Group: ${group.name}`)} title="View group" aria-label={`View ${group.name}`} className="rounded-lg p-2 text-secondary transition hover:bg-[#0EA5A5]/10 hover:text-[#0EA5A5]"><Eye className="h-4 w-4" /></button>
                    <button type="button" onClick={() => handleDelete(group._id)} title="Delete group" aria-label={`Delete ${group.name}`} className="rounded-lg p-2 text-secondary transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 border-t border-border-light pt-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A373] to-[#C49263] text-[10px] font-bold text-white">{group.owner?.name?.charAt(0)?.toUpperCase() || 'O'}</div>
                  <span className="truncate text-xs text-secondary">Owner: <strong className="text-primary">{group.owner?.name || 'Unknown'}</strong></span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminGroups;