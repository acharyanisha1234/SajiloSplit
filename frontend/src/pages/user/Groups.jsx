import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Users, Wallet, Calendar, UserPlus, Search } from 'lucide-react';
import { getGroups, createGroup } from '../../store/slices/groupSlice';
import toast from 'react-hot-toast';

const Groups = () => {
  const dispatch = useDispatch();
  const { groups, isLoading } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    category: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getGroups());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(createGroup({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount) || 0
      })).unwrap();
      setShowCreateModal(false);
      setFormData({ name: '', description: '', targetAmount: '', category: '' });
      dispatch(getGroups());
    } catch (error) {
      // Error handled in slice
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGroups = groups?.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-500">Manage your groups and shared expenses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary py-2 px-4 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Group
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading groups...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No groups yet</h3>
          <p className="text-gray-500 mt-2">Create your first group to start sharing expenses</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary mt-4"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <Link
              key={group._id}
              to={`/groups/${group._id}`}
              className="dashboard-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500">{group.description || 'No description'}</p>
                </div>
                {group.owner === user?.id && (
                  <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                    Owner
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{group.members?.length || 0} members</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Wallet className="w-4 h-4" />
                  <span>{formatCurrency(group.balance || 0)}</span>
                </div>
              </div>

              {group.targetAmount > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{Math.min(100, ((group.balance || 0) / group.targetAmount) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-primary-600 rounded-full h-1.5 transition-all"
                      style={{ width: `${Math.min(100, ((group.balance || 0) / group.targetAmount) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                <span className={`px-2 py-0.5 rounded-full ${
                  group.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {group.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create Group</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Group Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter group name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="What's this group about?"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Target Amount (NPR)</label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 50000"
                  min="0"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  <option value="Trip">Trip</option>
                  <option value="Roommates">Roommates</option>
                  <option value="Friends">Friends</option>
                  <option value="Family">Family</option>
                  <option value="College">College Project</option>
                  <option value="Event">Event</option>
                  <option value="Office">Office Team</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
};

export default Groups;