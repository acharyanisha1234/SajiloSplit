import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Wallet as WalletIcon, TrendingUp, TrendingDown, Lock, Plus, Send, 
  Eye, Download, CreditCard, Shield, Clock, ArrowUpRight,
  ArrowDownLeft, Copy, Check, Gift, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWallet, addMoney, getTransactions } from '../../store/slices/walletSlice';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const Wallet = () => {
  const dispatch = useDispatch();
  const { wallet, isLoading, transactions } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(getWallet());
    dispatch(getTransactions({ limit: 5 }));
  }, [dispatch]);

  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount).toLocaleString('en-IN')}`;
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error(t('enterValidAmount') || 'Please enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(addMoney({ amount: numAmount, description })).unwrap();
      setShowAddMoney(false);
      setAmount('');
      setDescription('');
      dispatch(getWallet());
      toast.success(t('moneyAdded') || 'Money added successfully!');
    } catch (error) {
      // Error handled in slice
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(user?.id || '');
    setCopied(true);
    toast.success(t('copied') || 'Copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t('wallet') || 'Wallet'}</h1>
          <p className="text-sm text-secondary mt-0.5">{t('manageMoney') || 'Manage your money securely'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-2xl bg-surface border border-border text-secondary hover:text-primary shadow-sm transition">
            <Clock className="w-5 h-5" />
          </button>
          <Link to="/transactions" className="p-2.5 rounded-2xl bg-surface border border-border text-secondary hover:text-primary shadow-sm transition">
            <Eye className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0EA5A5] via-[#0B8A8A] to-[#1A2E4A] rounded-3xl p-8 text-white shadow-2xl shadow-[#0EA5A5]/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-white/20">
              <WalletIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-white/80">{t('totalBalance') || 'Total Balance'}</span>
          </div>
          <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {formatCurrency(wallet?.balance || 0)}
          </p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-emerald-400/30">
                <TrendingUp className="w-3 h-3 text-emerald-300" />
              </div>
              <span className="text-sm text-white/80">{t('availableBalance') || 'Available'}: {formatCurrency(wallet?.availableBalance || 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-amber-400/30">
                <Lock className="w-3 h-3 text-amber-300" />
              </div>
              <span className="text-sm text-white/80">{t('lockedBalance') || 'Locked'}: {formatCurrency(wallet?.lockedBalance || 0)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <button 
              onClick={() => setShowAddMoney(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-semibold hover:bg-white/30 transition-all"
            >
              <Plus className="w-4 h-4" /> {t('addMoney') || 'Add Money'}
            </button>
            <Link to="/send-money" className="flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-semibold hover:bg-white/30 transition-all">
              <Send className="w-4 h-4" /> {t('send') || 'Send'}
            </Link>
            <Link to="/receive-money" className="flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-semibold hover:bg-white/30 transition-all">
              <ArrowDownLeft className="w-4 h-4" /> {t('receive') || 'Receive'}
            </Link>
            <Link to="/locked-funds" className="flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-semibold hover:bg-white/30 transition-all">
              <Lock className="w-4 h-4" /> {t('lockFunds') || 'Lock Funds'}
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-2xl p-1 border border-border shadow-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'overview' 
              ? 'bg-[#0EA5A5] text-white shadow-lg shadow-[#0EA5A5]/25' 
              : 'text-secondary hover:text-primary hover:bg-surface-hover'
          }`}
        >
          {t('overview') || 'Overview'}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'stats' 
              ? 'bg-[#0EA5A5] text-white shadow-lg shadow-[#0EA5A5]/25' 
              : 'text-secondary hover:text-primary hover:bg-surface-hover'
          }`}
        >
          {t('statistics') || 'Statistics'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'history' 
              ? 'bg-[#0EA5A5] text-white shadow-lg shadow-[#0EA5A5]/25' 
              : 'text-secondary hover:text-primary hover:bg-surface-hover'
          }`}
        >
          {t('history') || 'History'}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card-premium">
            <h3 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4">{t('quickStats') || 'Quick Stats'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-hover rounded-2xl">
                <p className="text-xs text-secondary font-medium">{t('currency') || 'Currency'}</p>
                <p className="text-lg font-bold text-primary">NPR</p>
              </div>
              <div className="p-4 bg-surface-hover rounded-2xl">
                <p className="text-xs text-secondary font-medium">{t('accountHolder') || 'Account Holder'}</p>
                <p className="text-lg font-bold text-primary truncate">{user?.name || 'N/A'}</p>
              </div>
              <div className="col-span-2 p-4 bg-surface-hover rounded-2xl">
                <p className="text-xs text-secondary font-medium">{t('email') || 'Email'}</p>
                <p className="text-lg font-bold text-primary truncate">{user?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="card-premium">
            <h3 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4">{t('quickActions') || 'Quick Actions'}</h3>
            <div className="space-y-2">
              <Link to="/transactions" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-all group">
                <div className="p-2 rounded-xl bg-[#0EA5A5]/10 text-[#0EA5A5] group-hover:scale-110 transition">
                  <Eye className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">{t('viewHistory') || 'View Transaction History'}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted" />
              </Link>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-all group">
                <div className="p-2 rounded-xl bg-[#D4A373]/10 text-[#D4A373] group-hover:scale-110 transition">
                  <Download className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-primary">{t('downloadStatement') || 'Download Statement'}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted" />
              </button>
              <button 
                onClick={handleCopyId}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-all group"
              >
                <div className="p-2 rounded-xl bg-[#10B981]/10 text-[#10B981] group-hover:scale-110 transition">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-primary">
                    {copied ? t('copied') || 'Copied!' : t('copyUserId') || 'Copy User ID'}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="card-premium">
          <h3 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4">{t('balanceBreakdown') || 'Balance Breakdown'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0EA5A5]/10 to-[#0B8A8A]/10 border border-[#0EA5A5]/20 text-center">
              <p className="text-xs text-secondary font-medium">{t('total') || 'Total'}</p>
              <p className="text-2xl font-bold text-[#0EA5A5]">{formatCurrency(wallet?.balance || 0)}</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 text-center">
              <p className="text-xs text-secondary font-medium">{t('available') || 'Available'}</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(wallet?.availableBalance || 0)}</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 text-center">
              <p className="text-xs text-secondary font-medium">{t('locked') || 'Locked'}</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(wallet?.lockedBalance || 0)}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card-premium overflow-hidden">
          <div className="p-4 border-b border-border-light flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-secondary">{t('recentTransactions') || 'Recent Transactions'}</h3>
            <Link to="/transactions" className="text-xs text-[#0EA5A5] font-semibold hover:text-[#0B8A8A] transition">
              {t('viewAll') || 'View All'} →
            </Link>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-border-light">
              {recentTransactions.map((tx) => (
                <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-surface-hover transition">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">{tx.purpose || tx.type}</p>
                      <p className="text-xs text-secondary">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      tx.type === 'deposit' ? 'text-emerald-600' : 'text-primary'
                    }`}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-[#0EA5A5]/10 rounded-3xl flex items-center justify-center mx-auto">
                <Gift className="w-8 h-8 text-[#0EA5A5]" />
              </div>
              <p className="text-secondary font-medium mt-4">{t('noTransactions') || 'No transactions yet'}</p>
              <p className="text-xs text-muted mt-1">{t('addMoneyToStart') || 'Add money to get started'}</p>
            </div>
          )}
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">{t('addMoney') || 'Add Money'}</h2>
              <button onClick={() => setShowAddMoney(false)} className="p-2 hover:bg-surface-hover rounded-xl transition">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-[#0EA5A5]/5 rounded-2xl border border-[#0EA5A5]/10">
              <p className="text-sm text-secondary">{t('availableBalance') || 'Available Balance'}</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(wallet?.availableBalance || 0)}</p>
            </div>

            <form onSubmit={handleAddMoney}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('amount') || 'Amount (NPR)'}</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field text-lg font-semibold"
                  placeholder="Enter amount"
                  min="1"
                  step="1"
                  required
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('description') || 'Description (Optional)'}</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  placeholder="Add money to wallet"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3.5 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {t('processing') || 'Processing...'}
                  </span>
                ) : (
                  t('addMoney') || 'Add Money'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;