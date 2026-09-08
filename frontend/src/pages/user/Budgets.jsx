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
     