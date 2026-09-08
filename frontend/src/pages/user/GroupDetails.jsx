import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeft, Users, Wallet, Calendar, Plus, UserPlus, 
  Edit, Settings, Trash2, TrendingUp, TrendingDown
} from 'lucide-react';
import { getGroupDetails } from '../../store/slices/groupSlice';
import { getTransactions } from '../../store/slices/walletSlice';
import toast from 'react-hot-toast';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentGroup, isLoading } = useSelector((state) => state.groups);
  const { transactions } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => {
    dispatch(getGroupDetails(id));
    dispatch(getTransactions({ group: id }));
  }, [dispatch, id]);

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    // API call will be implemented
    toast.success('Member added successfully!');
    setShowAddMember(false);
    setMemberEmail('');
  };

  if (isLoading || !currentGroup) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isOwner = currentGroup.owner === user?.id;
  const groupTransactions = transactions?.filter(t => t.group?._id === id) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/groups')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentGroup.name}</h1>
            <p className="text-gray-500">{currentGroup.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/groups/${id}/add-expense`}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Expense
          </Link>
          {isOwner && (
            <button className="btn-outline py-2 px-4">
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Group Balance</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentGroup.balance || 0)}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Members</p>
          <p className="text-2xl font-bold text-gray-900">{currentGroup.members?.length || 0}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">Target</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentGroup.targetAmount || 0)}</p>
        </div>
      </div>

      {/* Progress */}
      {currentGroup.targetAmount > 0 && (
        <div className="dashboard-card">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">
              {Math.min(100, ((currentGroup.balance || 0) / currentGroup.targetAmount) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-primary-600 rounded-full h-2.5 transition-all"
              style={{ width: `${Math.min(100, ((currentGroup.balance || 0) / currentGroup.targetAmount) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members */}
        <div className="lg:col-span-1 dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Members</h2>
            <button
              onClick={() => setShowAddMember(true)}
              className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
            >
              <UserPlus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {currentGroup.members?.map((member) => (
              <div key={member._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">
                    {member.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
                {member._id === currentGroup.owner && (
                  <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                    Owner
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="lg:col-span-2 dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
            <Link
              to={`/groups/${id}/add-expense`}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </Link>
          </div>
          {groupTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No expenses yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {groupTransactions.slice(0, 5).map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{tx.purpose || 'Expense'}</p>
                    <p className="text-sm text-gray-500">
                      Paid by {tx.sender?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{formatCurrency(tx.amount)}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Member</h2>
              <button onClick={() => setShowAddMember(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">Email or Phone</label>
                <input
                  type="text"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter email or phone"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full btn-primary py-3 text-lg font-semibold"
              >
                Add Member
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;