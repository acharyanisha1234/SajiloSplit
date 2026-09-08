import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Upload } from 'lucide-react';
import { getGroupDetails } from '../../store/slices/groupSlice';
import toast from 'react-hot-toast';
import axios from 'axios';

const AddExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentGroup } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    paidBy: user?.id || '',
    splitType: 'equal',
    members: [],
    receipt: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [memberShares, setMemberShares] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(getGroupDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentGroup?.members) {
      const memberIds = currentGroup.members.map(m => m._id);
      setFormData(prev => ({
        ...prev,
        members: memberIds
      }));
      // Initialize shares
      const shares = {};
      memberIds.forEach(mId => {
        shares[mId] = '';
      });
      setMemberShares(shares);
    }
  }, [currentGroup]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMemberToggle = (memberId) => {
    setFormData(prev => {
      const members = prev.members.includes(memberId)
        ? prev.members.filter(m => m !== memberId)
        : [...prev.members, memberId];
      return { ...prev, members };
    });
  };

  const handleShareChange = (memberId, value) => {
    setMemberShares(prev => ({
      ...prev,
      [memberId]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        receipt: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (formData.members.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    setSubmitting(true);
    try {
      // Prepare data
      const expenseData = new FormData();
      expenseData.append('title', formData.title);
      expenseData.append('amount', numAmount);
      expenseData.append('category', formData.category);
      expenseData.append('description', formData.description);
      expenseData.append('paidBy', formData.paidBy);
      expenseData.append('group', id);
      expenseData.append('splitType', formData.splitType);
      expenseData.append('members', JSON.stringify(formData.members));
      
      if (formData.splitType === 'percentage') {
        expenseData.append('splitDetails', JSON.stringify(memberShares));
      }
      if (formData.receipt) {
        expenseData.append('receipt', formData.receipt);
      }

      await axios.post(`/api/expenses`, expenseData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Expense added successfully!');
      navigate(`/groups/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const totalMembers = formData.members.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
          <p className="text-gray-500">Add a new expense to {currentGroup?.name}</p>
        </div>
      </div>

      <div className="dashboard-card max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="What was this expense for?"
              required
            />
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Amount (NPR) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter amount"
              min="1"
              step="1"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select category</option>
              <option value="Food">🍔 Food</option>
              <option value="Transport">🚗 Transport</option>
              <option value="Rent">🏠 Rent</option>
              <option value="Education">📚 Education</option>
              <option value="Shopping">🛍️ Shopping</option>
              <option value="Entertainment">🎬 Entertainment</option>
              <option value="Utilities">⚡ Utilities</option>
              <option value="Travel">✈️ Travel</option>
              <option value="Technology">💻 Technology</option>
              <option value="Other">📌 Other</option>
            </select>
          </div>

          {/* Paid By */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Paid By *</label>
            <select
              name="paidBy"
              value={formData.paidBy}
              onChange={handleChange}
              className="input-field"
              required
            >
              {currentGroup?.members?.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Split Type */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Split Method</label>
            <select
              name="splitType"
              value={formData.splitType}
              onChange={handleChange}
              className="input-field"
            >
              <option value="equal">Equal Split</option>
              <option value="percentage">Percentage Split</option>
              <option value="exact">Exact Amount</option>
              <option value="shares">Shares</option>
            </select>
          </div>

          {/* Members Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Split Between (Selected: {totalMembers})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {currentGroup?.members?.map((member) => (
                <div key={member._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.members.includes(member._id)}
                    onChange={() => handleMemberToggle(member._id)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="flex-1 text-sm text-gray-900">{member.name}</span>
                  
                  {formData.splitType !== 'equal' && formData.members.includes(member._id) && (
                    <input
                      type="number"
                      placeholder={formData.splitType === 'percentage' ? '%' : 'Amount'}
                      value={memberShares[member._id] || ''}
                      onChange={(e) => handleShareChange(member._id, e.target.value)}
                      className="w-20 px-2 py-1 border rounded text-sm"
                      min="0"
                      step={formData.splitType === 'percentage' ? '1' : '1'}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Add any additional details..."
              rows="3"
            />
          </div>

          {/* Receipt Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Receipt (Optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {formData.receipt ? formData.receipt.name : 'Click to upload receipt image'}
                </p>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
          >
            {submitting ? 'Adding Expense...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;