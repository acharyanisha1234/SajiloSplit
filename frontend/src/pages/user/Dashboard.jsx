import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Wallet, TrendingUp, TrendingDown, Users, 
  ArrowRight, Eye, PlusCircle, Zap, CreditCard, 
  Lock, Send, History, ChevronRight, 
  ArrowUpRight, ArrowDownLeft, ShieldCheck,
  Bell, Search
} from 'lucide-react';
import { getWallet, getTransactions } from '../../store/slices/walletSlice';
import { getGroups } from '../../store/slices/groupSlice';
import { getNotifications } from '../../store/slices/notificationSlice';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { wallet, transactions, isLoading: walletLoading } = useSelector((state) => state.wallet);
  const { groups, isLoading: groupLoading } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(getWallet());
    dispatch(getTransactions({ limit: 10 }));
    dispatch(getGroups());
    dispatch(getNotifications());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount).toLocaleString('en-IN')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning') || 'Good Morning';
    if (hour < 17) return t('goodAfternoon') || 'Good Afternoon';
    return t('goodEvening') || 'Good Evening';
  };

  const totalBalance = wallet?.balance || 0;
  const availableBalance = wallet?.availableBalance || 0;
  const lockedBalance = wallet?.lockedBalance || 0;
  const activeGroups = groups?.filter(g => g.status === 'active').length || 0;
  const pendingSettlements = groups?.filter(g => g.status === 'pending').length || 0;
  const recentTransactions = transactions?.slice(0, 5) || [];

  if (walletLoading || groupLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0EA5A5]/20 border-t-[#0EA5A5] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-secondary font-medium">{t('loading') || 'Loading your dashboard...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
          </h2>
          <p className="text-sm text-secondary mt-0.5">{t('financialOverview') || 'Here is your financial overview for today.'}</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center bg-surface border border-border rounded-2xl px-3.5 py-2 shadow-sm focus-within:border-[#0EA5A5] focus-within:ring-2 focus-within:ring-[#0EA5A5]/20 transition">
            <Search className="w-4 h-4 text-muted mr-2" />
            <input 
              type="text" 
              placeholder={t('search') || 'Search splits, groups...'} 
              className="bg-transparent text-sm focus:outline-none w-48 text-primary placeholder-muted"
            />
          </div>

          <Link to="/notifications" className="relative p-2.5 rounded-2xl bg-surface border border-border text-secondary hover:text-primary shadow-sm transition">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-surface"></span>
            )}
          </Link>
        </div>
      </header>

      {/* STATS CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="card-premium">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">{t('totalBalance') || 'Total Balance'}</span>
            <div className="p-2.5 rounded-2xl bg-[#0EA5A5]/10 text-[#0EA5A5]">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              {formatCurrency(totalBalance)}
            </span>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">{t('availableBalance') || 'Available Balance'}</span>
            <div className="p-2.5 rounded-2xl bg-[#10B981]/10 text-[#10B981]">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              {formatCurrency(availableBalance)}
            </span>
            <p className="mt-2 text-xs font-medium text-secondary">{t('readyForTransactions') || 'Ready for instant transactions'}</p>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">{t('lockedBalance') || 'Locked Balance'}</span>
            <div className="p-2.5 rounded-2xl bg-[#D4A373]/10 text-[#D4A373]">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              {formatCurrency(lockedBalance)}
            </span>
            <p className="mt-2 text-xs font-medium text-secondary">{t('reservedForSplits') || 'Reserved for pending splits'}</p>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">{t('activeGroups') || 'Active Groups'}</span>
            <div className="p-2.5 rounded-2xl bg-[#1A2E4A]/10 text-[#1A2E4A]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              {activeGroups} {t('groups') || 'Groups'}
            </span>
            {pendingSettlements > 0 && (
              <div className="flex items-center space-x-1 mt-2 text-xs font-semibold text-[#D4A373]">
                <ShieldCheck className="w-4 h-4" />
                <span>{pendingSettlements} {t('pendingSettlements') || 'pending settlements'}</span>
              </div>
            )}
          </div>
        </div>

      </section>

      {/* QUICK ACTIONS */}
      <section className="card-premium">
        <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-4">{t('quickActions') || 'Quick Actions'}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          
          <Link to="/send-money" className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white p-3.5 rounded-2xl font-semibold shadow-lg shadow-[#0EA5A5]/25 hover:opacity-95 hover:shadow-xl transition active:scale-[0.98]">
            <Send className="w-4 h-4" />
            <span className="text-sm">{t('sendMoney') || 'Send Money'}</span>
          </Link>

          <Link to="/groups" className="flex items-center justify-center space-x-2 bg-[#1A2E4A] text-white p-3.5 rounded-2xl font-semibold shadow-lg shadow-[#1A2E4A]/25 hover:bg-[#14243B] hover:shadow-xl transition active:scale-[0.98]">
            <PlusCircle className="w-4 h-4" />
            <span className="text-sm">{t('newGroup') || 'New Group'}</span>
          </Link>

          <Link to="/groups" className="flex items-center justify-center space-x-2 bg-surface text-[#0EA5A5] border-2 border-[#0EA5A5]/30 p-3.5 rounded-2xl font-semibold hover:bg-[#0EA5A5]/5 transition active:scale-[0.98]">
            <Users className="w-4 h-4" />
            <span className="text-sm">{t('myGroups') || 'My Groups'}</span>
          </Link>

          <Link to="/wallet" className="flex items-center justify-center space-x-2 bg-surface text-secondary border-2 border-border p-3.5 rounded-2xl font-semibold hover:bg-surface-hover transition active:scale-[0.98]">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">{t('viewWallet') || 'View Wallet'}</span>
          </Link>

        </div>
      </section>

      {/* TRANSACTIONS */}
      <section className="card-premium overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border-light flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary">{t('recentTransactions') || 'Recent Transactions'}</h3>
            <p className="text-xs text-secondary mt-0.5">{t('latestSplits') || 'Your latest splits and direct transfers'}</p>
          </div>
          <Link to="/transactions" className="text-xs font-bold text-[#0EA5A5] hover:text-[#0B8A8A] transition flex items-center space-x-1">
            <span>{t('viewAll') || 'View All'}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-border-light">
            {recentTransactions.map((txn) => (
              <Link 
                key={txn._id} 
                to={`/transactions/${txn.transactionId}`}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-surface-hover transition cursor-pointer"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className={`p-3 rounded-2xl ${
                    txn.type === 'deposit' || txn.type === 'credit' 
                      ? 'bg-[#10B981]/10 text-[#10B981]' 
                      : 'bg-red-50 text-[#EF4444] dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {txn.type === 'deposit' || txn.type === 'credit' 
                      ? <ArrowDownLeft className="w-5 h-5" /> 
                      : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">{txn.purpose || txn.type}</h4>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs text-secondary">
                        {txn.sender?._id === user?.id ? 'Sent to' : 'Received from'} {txn.sender?.name || txn.receiver?.name || 'User'}
                      </span>
                      <span className="text-muted">•</span>
                      <span className="text-xs font-medium text-secondary">
                        {new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-sm font-extrabold ${
                    txn.sender?._id === user?.id ? 'text-[#1A2E4A] dark:text-white' : 'text-[#10B981]'
                  }`}>
                    {txn.sender?._id === user?.id ? '-' : '+'}{formatCurrency(txn.amount)}
                  </p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                    txn.status === 'completed' 
                      ? 'bg-[#10B981]/10 text-[#10B981]' 
                      : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                  }`}>
                    {txn.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-[#0EA5A5]/10 text-[#0EA5A5] rounded-3xl flex items-center justify-center mx-auto">
              <History className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-primary">{t('noTransactions') || 'No Transactions Yet'}</h4>
              <p className="text-xs text-secondary max-w-xs mx-auto mt-1">
                {t('startSplitting') || 'Start splitting expenses with your friends and family to see your record here.'}
              </p>
            </div>
            <Link to="/send-money" className="btn-primary inline-block text-xs font-bold px-5 py-2.5 rounded-xl shadow-md">
              {t('createFirstSplit') || 'Create First Split'}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;