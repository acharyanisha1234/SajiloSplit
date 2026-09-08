import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Calendar, Clock, Check, X, AlertCircle, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Bills = () => {
  const { user } = useSelector((state) => state.auth);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    dueDate: '',
    recurring: 'one-time',
    reminder: false
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Internet', 'Electricity', 'Water', 'Rent', 'Subscription', 'Insurance', 'Other'];

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get('/api/bills');
      setBills(response.data.data);
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
      setFormData({ name: '', amount: '', category: '', dueDate: '', recurring: 'one-time', reminder: false });
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
      dueDate: bill.dueDate.split('T')[0],
      recurring: bill.recurring || 'one-time',
      reminder: bill.reminder || false
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
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-600',
      paid: 'bg-green-100 text-green-600',
      overdue: 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'paid': return <Check className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const getUpcomingBills = () => {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 7);
    return bills.filter(b => 
      b.status !== 'paid' && 
      new Date(b.dueDate) >= now && 
      new Date(b.dueDate) <= future
    );
  };

  const getOverdueBills = () => {
    return bills.filter(b => b.status !== 'paid' && isOverdue(b.dueDate));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const upcomingBills = getUpcomingBills();
  const overdueBills = getOverdueBills();
  const paidBills = bills.filter(b => b.status === 'paid');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
          <p className="text-gray-500">Manage your bills and payments</p>
        </div>
        <button
          onClick={() => {
            setEditingBill(null);
            setFormData({ name: '', amount: '', category: '', dueDate: '', recurring: 'one-time', reminder: false });
            setShowModal(true);
          }}
          className="btn-primary py-2 px-4 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Bill
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Total Bills</p>
          <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
        </div>
        <div className="dashboard-card border-red-200 bg-red-50">
          <p className="text-sm text-red-600">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{overdueBills.length}</p>
        </div>
        <div className="dashboard-card border-yellow-200 bg-yellow-50">
          <p className="text-sm text-yellow-600">Upcoming (7 days)</p>
          <p className="text-2xl font-bold text-yellow-600">{upcomingBills.length}</p>
        </div>
      </div>

      {/* Overdue Bills Alert */}
      {overdueBills.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-medium text-red-800">You have {overdueBills.length} overdue bill(s)!</p>
            <p className="text-sm text-red-600">Please pay them as soon as possible.</p>
          </div>
        </div>
      )}

      {/* Bills List */}
      <div className="space-y-3">
        {bills.length === 0 ? (
          <div className="dashboard-card text-center py-12">
            <p className="text-gray-500">No bills added yet</p>
          </div>
        ) : (
          bills.map((bill) => {
            const isBillOverdue = bill.status !== 'paid' && isOverdue(bill.dueDate);
            return (
              <div key={bill._id} className="dashboard-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(isBillOverdue ? 'overdue' : bill.status)}`}>
                      {getStatusIcon(isBillOverdue ? 'overdue' : bill.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{bill.name}</h3>
                      <p className="text-sm text-gray-500">{bill.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(isBillOverdue ? 'overdue' : bill.status)}`}>
                          {isBillOverdue ? 'Overdue' : bill.status}
                        </span>
                        {bill.recurring !== 'one-time' && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                            {bill.recurring}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(bill.amount)}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      {new Date(bill.dueDate).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {bill.status !== 'paid' && (
                        <button
                          onClick={() => handleStatusToggle(bill._id, 'paid')}
                          className="text-green-600 hover:text-green-700 text-xs px-2 py-0.5 bg-green-50 rounded"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button onClick={() => handleEdit(bill)} className="text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(bill._id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBill ? 'Edit Bill' : 'Add Bill'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Bill Name</label>
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Amount (NPR)</label>
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
                <label className="block text-gray-700 text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Recurring</label>
                <select
                  value={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.value })}
                  className="input-field"
                >
                  <option value="one-time">One Time</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 text-gray-700 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.reminder}
                    onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  Set Reminder
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingBill ? 'Update Bill' : 'Add Bill'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;