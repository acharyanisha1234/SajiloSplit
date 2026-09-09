import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Plus, TrendingUp, TrendingDown, Edit, Trash2, 
  Search, Filter, Calendar, AlertCircle, CheckCircle,
  PieChart, DollarSign, Target, Clock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Budgets = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [filter, setFilter] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Food', 'Transport', 'Rent', 'Education', 'Shopping',
    'Entertainment', 'Utilities', 'Travel', 'Technology', 'Health',
    'Insurance', 'Groceries', 'Dining', 'Clothing', 'Other'
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('/api/budgets');
      setBudgets(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBudget) {
        await axios.put(`/api/budgets/${editingBudget._id}`, formData);
        toast.success('Budget updated!');
      } else {
        await axios.post('/api/budgets', formData);
        toast.success('Budget created!');
      }
      setShowModal(false);
      setEditingBudget(null);
      setFormData({ category: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      fetchBudgets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      year: budget.year
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await axios.delete(`/api/budgets/${id}`);
      toast.success('Budget deleted!');
      fetchBudgets();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount).toLocaleString('en-IN')}`;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getFilteredBudgets = () => {
    let filtered = budgets;
    
    if (filter === 'active') {
      filtered = filtered.filter(b => b.status === 'active');
    } else if (filter === 'completed') {
      filtered = filtered.filter(b => b.status === 'completed');
    } else if (filter === 'cancelled') {
      filtered = filtered.filter(b => b.status === 'cancelled');
    }
    
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getStats = () => {
    const total = budgets.length;
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    const active = budgets.filter(b => b.status === 'active').length;

    return { total, totalBudget, totalSpent, totalRemaining, active };
  };

  const stats = getStats();
  const filteredBudgets = getFilteredBudgets();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t('budgets') || 'Budgets'}</h1>
          <p className="text-sm text-secondary mt-0.5">{t('trackSpending') || 'Track your monthly spending'}</p>
        </div>
        <button
          onClick={() => {
            setEditingBudget(null);
            setFormData({ category: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> {t('newBudget') || 'New Budget'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-premium text-center">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('totalBudget') || 'Total Budget'}</p>
          <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(stats.totalBudget)}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-emerald-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('spent') || 'Spent'}</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(stats.totalSpent)}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-amber-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('remaining') || 'Remaining'}</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(stats.totalRemaining)}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-[#0EA5A5]">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('activeBudgets') || 'Active'}</p>
          <p className="text-2xl font-bold text-[#0EA5A5] mt-1">{stats.active}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'active' 
                ? 'bg-[#0EA5A5] text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            {t('active') || 'Active'} ({budgets.filter(b => b.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'completed' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            {t('completed') || 'Completed'} ({budgets.filter(b => b.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'cancelled' 
                ? 'bg-red-500 text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            {t('cancelled') || 'Cancelled'} ({budgets.filter(b => b.status === 'cancelled').length})
          </button>
        </div>

        <div className="flex-1 relative sm:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
          />
        </div>
      </div>

      {/* Budgets Grid */}
      {filteredBudgets.length === 0 ? (
        <div className="card-premium text-center py-12">
          <div className="w-20 h-20 bg-[#0EA5A5]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-10 h-10 text-[#0EA5A5]" />
          </div>
          <h3 className="text-lg font-semibold text-primary">{t('noBudgets') || 'No budgets found'}</h3>
          <p className="text-sm text-secondary mt-1 max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search' : t('createFirstBudget') || 'Create your first budget to start tracking'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingBudget(null);
                setFormData({ category: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
                setShowModal(true);
              }}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> {t('newBudget') || 'New Budget'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBudgets.map((budget) => {
            const percentage = budget.amount > 0 ? Math.min(100, ((budget.spent || 0) / budget.amount) * 100) : 0;
            const remaining = budget.amount - (budget.spent || 0);
            const isWarning = percentage >= 80;
            
            return (
              <div key={budget._id} className="card-premium">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getProgressColor(percentage)}`}></div>
                    <h3 className="font-semibold text-primary">{budget.category}</h3>
                    <span className="text-xs text-secondary">
                      {months[budget.month - 1]} {budget.year}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(budget)} className="p-1.5 rounded-lg hover:bg-surface-hover transition text-secondary hover:text-primary">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(budget._id)} className="p-1.5 rounded-lg hover:bg-red-50 transition text-secondary hover:text-red-500 dark:hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-secondary">{t('budget') || 'Budget'}: <span className="font-semibold text-primary">{formatCurrency(budget.amount)}</span></span>
                  <span className="text-secondary">{t('spent') || 'Spent'}: <span className="font-semibold text-primary">{formatCurrency(budget.spent || 0)}</span></span>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary">{percentage.toFixed(0)}% {t('used') || 'used'}</span>
                    <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-secondary'}`}>
                      {remaining < 0 ? t('overBudget') || 'Over budget' : `${t('remaining') || 'Remaining'}: ${formatCurrency(remaining)}`}
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2.5 mt-1.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>

                {isWarning && (
                  <div className={`mt-3 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    percentage >= 100 
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    {percentage >= 100 
                      ? t('budgetExceeded') || 'Budget exceeded!'
                      : `${percentage.toFixed(0)}% ${t('budgetUsed') || 'of budget used'}`}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {budget.status === 'active' ? t('active') || 'Active' : budget.status}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {formatCurrency(budget.amount - (budget.spent || 0))} {t('left') || 'left'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#0EA5A5]" />
                <h2 className="text-xl font-bold text-primary">
                  {editingBudget ? 'Edit Budget' : 'Create Budget'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-hover rounded-xl transition">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">Monthly Budget (NPR) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="Enter amount"
                  min="1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Month</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{months[m - 1]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="input-field"
                    min="2020"
                    max="2030"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3.5 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : (
                  editingBudget ? 'Update Budget' : 'Create Budget'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;