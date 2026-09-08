import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, User, Send, ArrowLeft } from 'lucide-react';
import { sendMoney, getWallet } from '../../store/slices/walletSlice';
import { getUsers } from '../../services/api';
import toast from 'react-hot-toast';

const SendMoney = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wallet, isLoading } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    dispatch(getWallet());
  }, [dispatch]);

  const handleSearch = async () => {
    if (searchTerm.length < 2) return;
    try {
      const response = await getUsers(searchTerm);
      setUsers(response.data.filter(u => u._id !== user?.id));
      setShowResults(true);
    } catch (error) {
      toast.error('Failed to search users');
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        handleSearch();
      } else {
        setUsers([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSelectUser = (selected) => {
    setSelectedUser(selected);
    setSearchTerm(selected.name);
    setShowResults(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!selectedUser) {
      toast.error('Please select a receiver');
      return;
    }
    if (numAmount > wallet?.availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(sendMoney({
        receiverId: selectedUser._id,
        amount: numAmount,
        purpose: purpose || 'Money transfer'
      })).unwrap();
      navigate('/transactions');
    } catch (error) {
      // Error handled in slice
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
          <p className="text-gray-500">Transfer money to another user</p>
        </div>
      </div>

      {/* Balance Info */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-6">
        <p className="text-primary-100">Available Balance</p>
        <p className="text-3xl font-bold mt-2">{formatCurrency(wallet?.availableBalance || 0)}</p>
      </div>

      <div className="dashboard-card">
        <form onSubmit={handleSubmit}>
          {/* Search Receiver */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Receiver
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Search by name or email"
              />
            </div>
            {showResults && users.length > 0 && (
              <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {users.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleSelectUser(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected User */}
          {selectedUser && (
            <div className="mb-4 p-4 bg-primary-50 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedUser.name}</p>
                <p className="text-sm text-primary-600">{selectedUser.email}</p>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Amount (NPR)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              placeholder="Enter amount"
              min="1"
              step="1"
              required
            />
          </div>

          {/* Purpose */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Purpose / Note (Optional)
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="input-field"
              placeholder="What's this for?"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              'Processing...'
            ) : (
              <>
                <Send className="w-5 h-5" /> Send Money
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendMoney;