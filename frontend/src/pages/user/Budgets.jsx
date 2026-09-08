import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Budgets = () => {
  const { user } = useSelector((state) => state.auth);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Food', 'Transport', 'Rent', 'Education', 'Shopping',
    'Entertainment', 'Utilities', 'Travel', 'Technology', 'Other'
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('/api/budgets');
      setBudgets(response.data.data);
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
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-500">Track your monthly spending</p>
        </div>
        <button
          onClick={() => {
            setEditingBudget(null);
            setFormData({ category: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
            setShowModal(true);
          }}
          className="btn-primary py-2 px-4 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Budget
        </button>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0))}
          </p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(budgets.reduce((sum, b) => sum + (b.spent || 0), 0))}
          </p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Remaining</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(budgets.reduce((sum, b) => sum + (b.amount - (b.spent || 0)), 0))}
          </p>
        </div>
      </div>

      {/* Budget List */}
      {budgets.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <p className="text-gray-500">No budgets created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const percentage = budget.amount > 0 ? Math.min(100, ((budget.spent || 0) / budget.amount) * 100) : 0;
            const remaining = budget.amount - (budget.spent || 0);
            
            return (
              <div key={budget._id} className="dashboard-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                    <span className="text-xs text-gray-400">
                      {budget.month}/{budget.year}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(budget)} className="text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(budget._id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget: {formatCurrency(budget.amount)}</span>
                  <span className="text-gray-600">Spent: {formatCurrency(budget.spent || 0)}</span>
                </div>

                <div className="mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{percentage.toFixed(0)}% used</span>
                    <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {remaining < 0 ? 'Over budget' : `${formatCurrency(remaining)} remaining`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(percentage)}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>

                {percentage >= 80 && (
                  <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                    {percentage >= 100 ? (
                      '⚠️ Budget exceeded!'
                    ) : percentage >= 90 ? (
                      '⚠️ 90% of budget used!'
                    ) : (
                      '⚠️ 80% of budget used!'
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBudget ? 'Edit Budget' : 'Create Budget'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Monthly Budget (NPR)</label>
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
                  <label className="block text-gray-700 text-sm font-medium mb-2">Month</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Year</label>
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
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Create Budget'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;