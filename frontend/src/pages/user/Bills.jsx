import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Plus, Calendar, Clock, Check, X, AlertCircle, 
  Edit, Trash2, Filter, Search, ChevronRight,
  CreditCard, Receipt, Bell, BellOff, Download,
  TrendingUp, TrendingDown, Eye
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Bills = () => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    dueDate: '',
    recurring: 'one-time',
    reminder: false,
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Internet', 'Electricity', 'Water', 'Rent', 
    'Subscription', 'Insurance', 'Mobile', 'Gas',
    'Education', 'Transport', 'Groceries', 'Other'
  ];

  const recurringOptions = [
    { value: 'one-time', label: 'One Time' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    paid: <Check className="w-4 h-4" />,
    overdue: <AlertCircle className="w-4 h-4" />
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get('/api/bills');
      setBills(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load bills');
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
      if (editingBill) {
        await axios.put(`/api/bills/${editingBill._id}`, formData);
        toast.success('Bill updated!');
      } else {
        await axios.post('/api/bills', formData);
        toast.success('Bill created!');
      }
      setShowModal(false);
      setEditingBill(null);
      setFormData({ name: '', amount: '', category: '', dueDate: '', recurring: 'one-time', reminder: false, description: '' });
      fetchBills();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save bill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      name: bill.name,
      amount: bill.amount,
      category: bill.category,
      dueDate: bill.dueDate?.split('T')[0] || '',
      recurring: bill.recurring || 'one-time',
      reminder: bill.reminder || false,
      description: bill.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    try {
      await axios.delete(`/api/bills/${id}`);
      toast.success('Bill deleted!');
      fetchBills();
    } catch (error) {
      toast.error('Failed to delete bill');
    }
  };

  const handleStatusToggle = async (id, status) => {
    try {
      await axios.put(`/api/bills/${id}/status`, { status });
      toast.success(`Bill marked as ${status}`);
      fetchBills();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount).toLocaleString('en-IN')}`;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const getFilteredBills = () => {
    let filtered = bills;
    
    if (filter === 'pending') {
      filtered = filtered.filter(b => b.status === 'pending');
    } else if (filter === 'paid') {
      filtered = filtered.filter(b => b.status === 'paid');
    } else if (filter === 'overdue') {
      filtered = filtered.filter(b => b.status === 'overdue' || (b.status === 'pending' && isOverdue(b.dueDate)));
    }
    
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getStats = () => {
    const total = bills.length;
    const overdue = bills.filter(b => b.status === 'overdue' || (b.status === 'pending' && isOverdue(b.dueDate))).length;
    const upcoming = bills.filter(b => {
      if (b.status === 'paid') return false;
      const due = new Date(b.dueDate);
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + 7);
      return due >= now && due <= future;
    }).length;
    const paid = bills.filter(b => b.status === 'paid').length;
    const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
    const pendingAmount = bills
      .filter(b => b.status === 'pending' || b.status === 'overdue')
      .reduce((sum, b) => sum + b.amount, 0);

    return { total, overdue, upcoming, paid, totalAmount, pendingAmount };
  };

  const stats = getStats();
  const filteredBills = getFilteredBills();

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
          <h1 className="text-2xl font-bold text-primary">{t('bills') || 'Bills'}</h1>
          <p className="text-sm text-secondary mt-0.5">{t('manageBills') || 'Manage your bills and payments'}</p>
        </div>
        <button
          onClick={() => {
            setEditingBill(null);
            setFormData({ name: '', amount: '', category: '', dueDate: '', recurring: 'one-time', reminder: false, description: '' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Bill
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-premium text-center">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">Total Bills</p>
          <p className="text-3xl font-bold text-primary mt-1">{stats.total}</p>
          <p className="text-xs text-secondary mt-1">Rs. {stats.totalAmount.toLocaleString()}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-amber-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">Pending</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {bills.filter(b => b.status === 'pending').length}
          </p>
          <p className="text-xs text-secondary mt-1">Rs. {stats.pendingAmount.toLocaleString()}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-red-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">Overdue</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.overdue}</p>
          <p className="text-xs text-secondary mt-1">Pay immediately</p>
        </div>
        <div className="card-premium text-center border-l-4 border-emerald-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">Paid</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.paid}</p>
          <p className="text-xs text-secondary mt-1">Completed</p>
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
            All ({bills.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'pending' 
                ? 'bg-amber-500 text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            Pending ({bills.filter(b => b.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'overdue' 
                ? 'bg-red-500 text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            Overdue ({stats.overdue})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'paid' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            Paid ({stats.paid})
          </button>
        </div>

        <div className="flex-1 relative sm:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
          />
        </div>
      </div>

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <div className="card-premium text-center py-12">
          <div className="w-20 h-20 bg-[#0EA5A5]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-10 h-10 text-[#0EA5A5]" />
          </div>
          <h3 className="text-lg font-semibold text-primary">No bills found</h3>
          <p className="text-sm text-secondary mt-1 max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search or filter' : 'Add your first bill to start tracking payments'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingBill(null);
                setFormData({ name: '', amount: '', category: '', dueDate: '', recurring: 'one-time', reminder: false, description: '' });
                setShowModal(true);
              }}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Bill
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBills.map((bill) => {
            const isBillOverdue = bill.status === 'overdue' || (bill.status === 'pending' && isOverdue(bill.dueDate));
            const status = isBillOverdue ? 'overdue' : bill.status;
            
            return (
              <div key={bill._id} className="card-premium hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusColors[status]}`}>
                      {statusIcons[status]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-primary">{bill.name}</h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full ${statusColors[status]}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        {bill.recurring !== 'one-time' && (
                          <span className="text-xs bg-[#0EA5A5]/10 text-[#0EA5A5] px-2.5 py-0.5 rounded-full">
                            {bill.recurring}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-secondary">
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          {bill.category}
                        </span>
                        <span className="text-muted">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Due: {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {bill.reminder && (
                          <span className="flex items-center gap-1 text-[#0EA5A5]">
                            <Bell className="w-3.5 h-3.5" />
                            Reminder
                          </span>
                        )}
                      </div>
                      {bill.description && (
                        <p className="text-sm text-secondary mt-1">{bill.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{formatCurrency(bill.amount)}</p>
                    <div className="flex items-center gap-1 mt-2 justify-end">
                      {status !== 'paid' && (
                        <button
                          onClick={() => handleStatusToggle(bill._id, 'paid')}
                          className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                          title="Mark as paid"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(bill)}
                        className="p-1.5 rounded-lg bg-surface-hover text-secondary hover:text-primary transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bill._id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#0EA5A5]" />
                <h2 className="text-xl font-bold text-primary">
                  {editingBill ? 'Edit Bill' : 'Add Bill'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-hover rounded-xl transition">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">Bill Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Internet Bill"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">Amount (NPR) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="Enter amount"
                  min="1"
                  step="1"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">Category</label>
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
                <label className="block text-sm font-medium text-secondary mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-secondary mb-1.5">Recurring</label>
                  <select
                    value={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.value })}
                    className="input-field"
                  >
                    {recurringOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4 flex items-end">
                  <label className="flex items-center gap-2 text-sm font-medium text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reminder}
                      onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-[#0EA5A5] focus:ring-[#0EA5A5] focus:ring-offset-0"
                    />
                    <Bell className="w-4 h-4" />
                    Set Reminder
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-1.5">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="Add any additional details..."
                  rows="2"
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
                    Saving...
                  </span>
                ) : (
                  editingBill ? 'Update Bill' : 'Add Bill'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;