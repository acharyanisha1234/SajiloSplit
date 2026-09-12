import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, User, Send, ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import { sendMoney, getWallet } from '../../store/slices/walletSlice';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const SendMoney = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wallet } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    dispatch(getWallet());
  }, [dispatch]);

  // Search users with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setSearching(true);
        try {
          const response = await axios.get(`/api/users?search=${searchTerm}`);
          const filtered = (response.data.data || []).filter(u => u._id !== user?.id);
          setUsers(filtered);
          setShowResults(true);
        } catch (error) {
          console.error('Search failed');
        } finally {
          setSearching(false);
        }
      } else {
        setUsers([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, user?.id]);

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

    if (numAmount > (wallet?.availableBalance || 0)) {
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
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const clearSelection = () => {
    setSelectedUser(null);
    setSearchTerm('');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('sendMoney') || 'Send Money'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Transfer money to another user
          </p>
        </div>
      </div>

      {/* ===== BALANCE CARD ===== */}
      <div className="bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] rounded-2xl p-6 text-white shadow-lg shadow-[#0EA5A5]/25">
        <p className="text-sm text-white/80">Available Balance</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(wallet?.availableBalance)}</p>
      </div>

      {/* ===== FORM ===== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* ===== RECEIVER SEARCH ===== */}
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Receiver
            </label>
            
            <div className="relative">
              {/* Search Icon */}
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              
              {/* Input */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedUser) setSelectedUser(null);
                }}
                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5] transition-all"
                placeholder="Search by name or email"
                autoComplete="off"
              />
              
              {/* Clear Button */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
              
              {/* Searching indicator */}
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-[#0EA5A5]/20 border-t-[#0EA5A5] rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* ===== SEARCH RESULTS DROPDOWN ===== */}
            {showResults && users.length > 0 && (
              <div className="absolute z-20 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                {users.map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-left border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                      {u.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {u.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ===== NO RESULTS ===== */}
            {showResults && searchTerm.length >= 2 && users.length === 0 && !searching && (
              <div className="absolute z-20 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No users found
                </p>
              </div>
            )}
          </div>

          {/* ===== SELECTED USER ===== */}
          {selectedUser && (
            <div className="p-4 bg-[#0EA5A5]/5 border-2 border-[#0EA5A5]/20 rounded-xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#0EA5A5]/25 shrink-0">
                {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {selectedUser.name}
                </p>
                <p className="text-sm text-[#0EA5A5] truncate">
                  {selectedUser.email}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          )}

          {/* ===== AMOUNT ===== */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Amount ({localStorage.getItem('currency') || 'NPR'})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5] transition-all text-lg font-semibold"
              placeholder="Enter amount"
              min="1"
              step="1"
              required
            />
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > (wallet?.availableBalance || 0) && (
              <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Amount exceeds available balance</span>
              </div>
            )}
          </div>

          {/* ===== PURPOSE ===== */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Purpose / Note (Optional)
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5] transition-all"
              placeholder="What's this for?"
              maxLength={100}
            />
          </div>

          {/* ===== SUBMIT BUTTON ===== */}
          <button
            type="submit"
            disabled={submitting || !selectedUser || !amount}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white font-bold shadow-lg shadow-[#0EA5A5]/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Money
              </>
            )}
          </button>
        </form>
      </div>

      {/* ===== INFO NOTE ===== */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-400">
            Important
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
            Make sure you enter the correct receiver details. Money transfers cannot be reversed once completed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;