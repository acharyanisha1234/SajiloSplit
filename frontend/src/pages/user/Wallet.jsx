import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, Lock, Eye, EyeOff, Plus, Send } from 'lucide-react';
import { getWallet, addMoney } from '../../store/slices/walletSlice';
import toast from 'react-hot-toast';

const Wallet = () => {
  const dispatch = useDispatch();
  const { wallet, isLoading } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getWallet());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(addMoney({ amount: numAmount, description })).unwrap();
      setShowAddMoney(false);
      setAmount('');
      setDescription('');
      dispatch(getWallet());
    } catch (error) {
      // Error handled in slice
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-500">Manage your money securely</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dashboard-card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <p className="text-primary-100">Total Balance</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(wallet?.balance || 0)}</p>
        </div>
        <div className="dashboard-card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <p className="text-green-100">Available Balance</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(wallet?.availableBalance || 0)}</p>
        </div>
        <div className="dashboard-card bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <p className="text-amber-100">Locked Balance</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(wallet?.lockedBalance || 0)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setShowAddMoney(true)}
          className="btn-primary py-3 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Money
        </button>
        <button className="btn-secondary py-3 flex items-center justify-center gap-2">
          <Send className="w-5 h-5" /> Send
        </button>
        <button className="btn-outline py-3 flex items-center justify-center gap-2">
          <TrendingUp className="w-5 h-5" /> Receive
        </button>
        <button className="btn-outline py-3 flex items-center justify-center gap-2">
          <Lock className="w-5 h-5" /> Lock Funds
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dashboard-card">
          <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Currency</span>
              <span className="font-medium">NPR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account Holder</span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
          </div>
        </div>
        <div className="dashboard-card">
          <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <WalletIcon className="w-4 h-4 text-primary-600" />
              View Transaction History
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <TrendingDown className="w-4 h-4 text-red-600" />
              Download Statement
            </button>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Money</h2>
              <button onClick={() => setShowAddMoney(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddMoney}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Amount (NPR)</label>
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
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
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
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Add Money'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;