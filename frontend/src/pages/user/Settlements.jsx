import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Check, X, Clock, ArrowRight, Wallet, Users,
  TrendingUp, TrendingDown, Filter, Search,
  Calendar, User, DollarSign, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Settlements = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleCancel = async (settlementId) => {
    if (!confirm('Are you sure you want to cancel this settlement?')) return;
    try {
      await axios.put(`/api/settlements/${settlementId}/cancel`);
      toast.success('Settlement cancelled');
      fetchSettlements();
    } catch (error) {
      toast.error('Failed to cancel settlement');
    }
  };

  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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

  const getStats = () => {
    const total = settlements.length;
    const pending = settlements.filter(s => s.status === 'pending').length;
    const paid = settlements.filter(s => s.status === 'paid').length;
    const totalAmount = settlements.reduce((sum, s) => sum + s.amount, 0);
    const pendingAmount = settlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0);

    return { total, pending, paid, totalAmount, pendingAmount };
  };

  const getFilteredSettlements = () => {
    let filtered = settlements;
    
    if (filter === 'pending') {
      filtered = filtered.filter(s => s.status === 'pending');
    } else if (filter === 'paid') {
      filtered = filtered.filter(s => s.status === 'paid');
    } else if (filter === 'cancelled') {
      filtered = filtered.filter(s => s.status === 'cancelled');
    }
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.from?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.to?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.group?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const stats = getStats();
  const filteredSettlements = getFilteredSettlements();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0EA5A5]/20 border-t-[#0EA5A5] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-secondary font-medium">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">{t('settlements') || 'Settlements'}</h1>
        <p className="text-sm text-secondary mt-0.5">{t('manageSettlements') || 'Manage your pending and completed settlements'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-premium text-center">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('total') || 'Total'}</p>
          <p className="text-2xl font-bold text-primary mt-1">{stats.total}</p>
          <p className="text-xs text-secondary mt-1">{formatCurrency(stats.totalAmount)}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-amber-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('pending') || 'Pending'}</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</p>
          <p className="text-xs text-secondary mt-1">{formatCurrency(stats.pendingAmount)}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-emerald-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('paid') || 'Paid'}</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.paid}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-[#0EA5A5]">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('settled') || 'Settled'}</p>
          <p className="text-2xl font-bold text-[#0EA5A5] mt-1">
            {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'all' 
                ? 'bg-[#0EA5A5] text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            {t('all') || 'All'} ({settlements.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'pending' 
                ? 'bg-amber-500 text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            {t('pending') || 'Pending'} ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'paid' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            {t('paid') || 'Paid'} ({stats.paid})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'cancelled' 
                ? 'bg-red-500 text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            {t('cancelled') || 'Cancelled'} ({settlements.filter(s => s.status === 'cancelled').length})
          </button>
        </div>

        <div className="flex-1 relative sm:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name or group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
          />
        </div>
      </div>

      {/* Settlements List */}
      {filteredSettlements.length === 0 ? (
        <div className="card-premium text-center py-12">
          <div className="w-20 h-20 bg-[#0EA5A5]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-[#0EA5A5]" />
          </div>
          <h3 className="text-lg font-semibold text-primary">{t('noSettlements') || 'No settlements found'}</h3>
          <p className="text-sm text-secondary mt-1 max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search' : t('allSettled') || 'All settled up! You have no pending settlements.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSettlements.map((settlement) => (
            <div key={settlement._id} className="card-premium">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(settlement.status)}`}>
                    {getStatusIcon(settlement.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-primary">
                        {settlement.from?.name} → {settlement.to?.name}
                      </p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${getStatusColor(settlement.status)}`}>
                        {settlement.status.charAt(0).toUpperCase() + settlement.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-secondary flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5" />
                      Group: {settlement.group?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-secondary flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(settlement.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(settlement.amount)}
                  </p>
                  <div className="flex gap-1 mt-1 justify-end">
                    {settlement.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleSettle(settlement._id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 text-xs font-medium transition dark:bg-emerald-900/30 dark:text-emerald-400"
                        >
                          {t('settleNow') || 'Settle Now'}
                        </button>
                        <button
                          onClick={() => handleCancel(settlement._id)}
                          className="px-3 py-1.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 text-xs font-medium transition dark:bg-red-900/30 dark:text-red-400"
                        >
                          {t('cancel') || 'Cancel'}
                        </button>
                      </>
                    )}
                    {settlement.status === 'paid' && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <Check className="w-4 h-4" />
                        {t('settled') || 'Settled'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {settlement.status === 'paid' && settlement.settledAt && (
                <div className="mt-2 pt-2 border-t border-border-light text-xs text-secondary flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Settled on: {new Date(settlement.settledAt).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Settlements;