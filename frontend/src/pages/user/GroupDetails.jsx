import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeft, Users, Wallet, Calendar, Plus, UserPlus, 
  Edit, Settings, Trash2, TrendingUp, TrendingDown,
  Clock, Check, X, AlertCircle, ChevronRight,
  DollarSign, Target, PieChart, BarChart3
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getGroupDetails } from '../../store/slices/groupSlice';
import { getTransactions } from '../../store/slices/walletSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentGroup, isLoading } = useSelector((state) => state.groups);
  const { transactions } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberSubmitting, setMemberSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getGroupDetails(id));
    dispatch(getTransactions({ group: id }));
  }, [dispatch, id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) {
      toast.error('Please enter email or phone');
      return;
    }
    setMemberSubmitting(true);
    try {
      await axios.post(`/api/groups/${id}/members`, { email: memberEmail });
      toast.success('Member added successfully!');
      setShowAddMember(false);
      setMemberEmail('');
      dispatch(getGroupDetails(id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await axios.delete(`/api/groups/${id}/members/${userId}`);
      toast.success('Member removed!');
      dispatch(getGroupDetails(id));
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount).toLocaleString('en-IN')}`;
  };

  if (isLoading || !currentGroup) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0EA5A5]/20 border-t-[#0EA5A5] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-secondary font-medium">Loading group...</p>
        </div>
      </div>
    );
  }

  const isOwner = currentGroup.owner === user?.id;
  const groupTransactions = transactions?.filter(t => t.group?._id === id) || [];
  const totalMembers = currentGroup.members?.length || 0;
  const progress = currentGroup.targetAmount > 0 ? Math.min(100, ((currentGroup.balance || 0) / currentGroup.targetAmount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/groups')} className="p-2.5 rounded-xl bg-surface border border-border text-secondary hover:text-primary hover:bg-surface-hover transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">{currentGroup.name}</h1>
            <p className="text-sm text-secondary">{currentGroup.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/groups/${id}/add-expense`}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> {t('addExpense') || 'Add Expense'}
          </Link>
          {isOwner && (
            <button
              onClick={() => setShowAddMember(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" /> {t('addMember') || 'Add Member'}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-premium text-center">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('balance') || 'Balance'}</p>
          <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(currentGroup.balance || 0)}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-[#0EA5A5]">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('members') || 'Members'}</p>
          <p className="text-2xl font-bold text-[#0EA5A5] mt-1">{totalMembers}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-amber-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('target') || 'Target'}</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(currentGroup.targetAmount || 0)}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-emerald-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('expenses') || 'Expenses'}</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{groupTransactions.length}</p>
        </div>
      </div>

      {/* Progress */}
      {currentGroup.targetAmount > 0 && (
        <div className="card-premium">
          <div className="flex justify-between text-sm">
            <span className="text-secondary">{t('progress') || 'Progress'}</span>
            <span className="font-semibold text-primary">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-2.5 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] rounded-full h-2.5 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-secondary mt-1">
            <span>Collected: {formatCurrency(currentGroup.balance || 0)}</span>
            <span>Remaining: {formatCurrency((currentGroup.targetAmount || 0) - (currentGroup.balance || 0))}</span>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members */}
        <div className="lg:col-span-1 card-premium">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0EA5A5]" />
              {t('members') || 'Members'} ({totalMembers})
            </h2>
            {isOwner && (
              <button
                onClick={() => setShowAddMember(true)}
                className="text-sm text-[#0EA5A5] hover:text-[#0B8A8A] flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" /> {t('add') || 'Add'}
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {currentGroup.members?.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-[#0EA5A5]/25">
                    {member.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">{member.name}</p>
                    <p className="text-xs text-secondary">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member._id === currentGroup.owner && (
                    <span className="text-xs bg-[#0EA5A5]/10 text-[#0EA5A5] px-2 py-0.5 rounded-full">
                      {t('owner') || 'Owner'}
                    </span>
                  )}
                  {isOwner && member._id !== currentGroup.owner && member._id !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="text-secondary hover:text-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="lg:col-span-2 card-premium">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#0EA5A5]" />
              {t('recentExpenses') || 'Recent Expenses'}
            </h2>
            <Link
              to={`/groups/${id}/add-expense`}
              className="text-sm text-[#0EA5A5] hover:text-[#0B8A8A] flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> {t('add') || 'Add'}
            </Link>
          </div>
          {groupTransactions.length === 0 ? (
            <div className="text-center py-8 text-secondary">
              <AlertCircle className="w-12 h-12 text-muted mx-auto mb-3" />
              <p>{t('noExpenses') || 'No expenses yet'}</p>
              <p className="text-sm text-muted mt-1">{t('addFirstExpense') || 'Add your first expense to get started'}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {groupTransactions.slice(0, 10).map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-4 bg-surface-hover rounded-xl hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {tx.type === 'deposit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{tx.purpose || tx.type}</p>
                      <p className="text-xs text-secondary flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {tx.sender?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{formatCurrency(tx.amount)}</p>
                    <p className="text-xs text-secondary flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0EA5A5]" />
                <h2 className="text-xl font-bold text-primary">{t('addMember') || 'Add Member'}</h2>
              </div>
              <button onClick={() => setShowAddMember(false)} className="p-2 hover:bg-surface-hover rounded-xl transition">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('emailOrPhone') || 'Email or Phone'}</label>
                <input
                  type="text"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter email or phone"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={memberSubmitting}
                className="w-full btn-primary py-3.5 text-lg font-semibold disabled:opacity-50"
              >
                {memberSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Adding...
                  </span>
                ) : (
                  t('addMember') || 'Add Member'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;