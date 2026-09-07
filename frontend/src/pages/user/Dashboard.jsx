import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Users, ArrowRight, Eye, PlusCircle } from 'lucide-react';
import { getWallet, getTransactions } from '../../store/slices/walletSlice';
import { getGroups } from '../../store/slices/groupSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { wallet, transactions } = useSelector((state) => state.wallet);
  const { groups } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getWallet());
    dispatch(getTransactions({ limit: 5 }));
    dispatch(getGroups());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-500">Here's your financial overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(wallet?.balance || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(wallet?.availableBalance || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Locked</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(wallet?.lockedBalance || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Groups</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups?.filter(g => g.status === 'active').length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/send-money" className="btn-primary text-center py-3 flex items-center justify-center gap-2">
          <ArrowRight className="w-4 h-4" /> Send Money
        </Link>
        <Link to="/groups" className="btn-secondary text-center py-3 flex items-center justify-center gap-2">
          <Users className="w-4 h-4" /> Groups
        </Link>
        <Link to="/wallet" className="btn-outline text-center py-3 flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" /> View Wallet
        </Link>
        <Link to="/groups" className="btn-outline text-center py-3 flex items-center justify-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Group
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'deposit' ? 'bg-green-100' : 
                    tx.type === 'transfer' || tx.type === 'group_expense' ? 'bg-blue-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'deposit' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : tx.type === 'transfer' || tx.type === 'group_expense' ? (
                      <ArrowRight className="w-5 h-5 text-blue-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.purpose || tx.type}</p>
                    <p className="text-sm text-gray-500">
                      {tx.sender?._id === user?.id ? 'Sent' : 'Received'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.sender?._id === user?.id ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {tx.sender?._id === user?.id ? '-' : '+'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;