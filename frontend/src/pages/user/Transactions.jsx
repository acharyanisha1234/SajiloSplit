import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { getTransactions } from '../../store/slices/walletSlice';

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, isLoading, pagination } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);
  
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    dispatch(getTransactions(filters));
  }, [dispatch, filters]);

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  const getTypeColor = (type) => {
    const colors = {
      deposit: 'text-green-600 bg-green-100',
      transfer: 'text-blue-600 bg-blue-100',
      withdrawal: 'text-red-600 bg-red-100',
      group_contribution: 'text-purple-600 bg-purple-100',
      group_expense: 'text-orange-600 bg-orange-100',
      settlement: 'text-teal-600 bg-teal-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const getTypeLabel = (type) => {
    const labels = {
      deposit: 'Deposit',
      transfer: 'Transfer',
      withdrawal: 'Withdrawal',
      group_contribution: 'Group Contribution',
      group_expense: 'Group Expense',
      settlement: 'Settlement'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500">View all your transactions</p>
      </div>

      {/* Filters */}
      <div className="dashboard-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="input-field w-full md:w-48"
          >
            <option value="">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="transfer">Transfer</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="group_contribution">Group Contribution</option>
            <option value="group_expense">Group Expense</option>
            <option value="settlement">Settlement</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading transactions...</p>
        </div>
      ) : transactions?.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <p className="text-gray-500">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions?.map((tx) => (
            <Link
              key={tx._id}
              to={`/transactions/${tx.transactionId}`}
              className="block p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(tx.type)}`}>
                    {tx.type === 'deposit' || tx.receiver?._id === user?.id ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : (
                      <TrendingDown className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.purpose || getTypeLabel(tx.type)}</p>
                    <p className="text-sm text-gray-500">
                      {tx.sender?._id === user?.id ? 'Sent to' : 'Received from'}{' '}
                      {tx.sender?._id === user?.id ? tx.receiver?.name : tx.sender?.name}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.sender?._id === user?.id ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {tx.sender?._id === user?.id ? '-' : '+'}{formatCurrency(tx.amount)}
                  </p>
                  <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${tx.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {filters.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page === pagination.pages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Transactions;