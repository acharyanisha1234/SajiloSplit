import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Plus, Users, Wallet, Calendar, UserPlus, Search,
  Edit, Trash2, Eye, ChevronRight, Settings,
  User, Clock, Target, DollarSign, Shield,
  X, Check, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getGroups, createGroup, deleteGroup } from '../../store/slices/groupSlice';
import toast from 'react-hot-toast';
import axios from 'axios';

const Groups = () => {
  const dispatch = useDispatch();
  const { groups, isLoading } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    category: ''
  });
  const [memberEmail, setMemberEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [memberSubmitting, setMemberSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getGroups());
  }, [dispatch]);

  const handleCreateSubmit = async (e) => {
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
      toast.success('Group created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', targetAmount: '', category: '' });
      dispatch(getGroups());
    } catch (error) {
      toast.error(error.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) {
      toast.error('Please enter email or phone');
      return;
    }
    setMemberSubmitting(true);
    try {
      await axios.post(`/api/groups/${selectedGroup?._id}/members`, { email: memberEmail });
      toast.success('Member added successfully!');
      setShowAddMemberModal(false);
      setMemberEmail('');
      dispatch(getGroups());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      await dispatch(deleteGroup(groupId)).unwrap();
      toast.success('Group deleted!');
      dispatch(getGroups());
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  const formatCurrency = (amount) => {
    const currency = localStorage.getItem('currency') || 'NPR';
    return `${currency} ${Number(amount).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    };
    return colors[status] || colors.active;
  };

  const getStats = () => {
    const total = groups?.length || 0;
    const active = groups?.filter(g => g.status === 'active').length || 0;
    const totalBalance = groups?.reduce((sum, g) => sum + (g.balance || 0), 0) || 0;
    const totalMembers = groups?.reduce((sum, g) => sum + (g.members?.length || 0), 0) || 0;

    return { total, active, totalBalance, totalMembers };
  };

  const stats = getStats();

  const getFilteredGroups = () => {
    let filtered = groups || [];
    
    if (filter === 'active') {
      filtered = filtered.filter(g => g.status === 'active');
    } else if (filter === 'inactive') {
      filtered = filtered.filter(g => g.status === 'inactive');
    } else if (filter === 'archived') {
      filtered = filtered.filter(g => g.status === 'archived');
    }
    
    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredGroups = getFilteredGroups();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0EA5A5]/20 border-t-[#0EA5A5] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-secondary font-medium">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t('groups') || 'Groups'}</h1>
          <p className="text-sm text-secondary mt-0.5">{t('manageGroups') || 'Manage your groups and shared expenses'}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> {t('newGroup') || 'New Group'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-premium text-center">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('totalGroups') || 'Total Groups'}</p>
          <p className="text-2xl font-bold text-primary mt-1">{stats.total}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-[#0EA5A5]">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('active') || 'Active'}</p>
          <p className="text-2xl font-bold text-[#0EA5A5] mt-1">{stats.active}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-amber-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('totalBalance') || 'Total Balance'}</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(stats.totalBalance)}</p>
        </div>
        <div className="card-premium text-center border-l-4 border-emerald-400">
          <p className="text-xs text-secondary uppercase tracking-wider font-medium">{t('totalMembers') || 'Total Members'}</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.totalMembers}</p>
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
            {t('all') || 'All'} ({groups?.length || 0})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'active' 
                ? 'bg-[#0EA5A5] text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            {t('active') || 'Active'} ({groups?.filter(g => g.status === 'active').length || 0})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'inactive' 
                ? 'bg-gray-500 text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            {t('inactive') || 'Inactive'} ({groups?.filter(g => g.status === 'inactive').length || 0})
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'archived' 
                ? 'bg-amber-500 text-white' 
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            {t('archived') || 'Archived'} ({groups?.filter(g => g.status === 'archived').length || 0})
          </button>
        </div>

        <div className="flex-1 relative sm:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
          />
        </div>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="card-premium text-center py-12">
          <div className="w-20 h-20 bg-[#0EA5A5]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-[#0EA5A5]" />
          </div>
          <h3 className="text-lg font-semibold text-primary">{t('noGroups') || 'No groups found'}</h3>
          <p className="text-sm text-secondary mt-1 max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search' : t('createFirstGroup') || 'Create your first group to start sharing expenses'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> {t('newGroup') || 'New Group'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => {
            const progress = group.targetAmount > 0 ? Math.min(100, ((group.balance || 0) / group.targetAmount) * 100) : 0;
            const isOwner = group.owner === user?.id;
            
            return (
              <Link
                key={group._id}
                to={`/groups/${group._id}`}
                className="card-premium hover:shadow-2xl transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0EA5A5] to-[#0B8A8A] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#0EA5A5]/25">
                      {group.name?.charAt(0)?.toUpperCase() || 'G'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{group.name}</h3>
                      <p className="text-sm text-secondary">{group.category || 'General'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {isOwner && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedGroup(group);
                            setShowAddMemberModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-surface-hover transition text-secondary hover:text-primary"
                          title="Add Member"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteGroup(group._id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition text-secondary hover:text-red-500 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-sm text-secondary line-clamp-2">
                  {group.description || 'No description'}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <Users className="w-4 h-4" />
                    <span>{group.members?.length || 0} {t('members') || 'members'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-secondary">
                    <Wallet className="w-4 h-4" />
                    <span>{formatCurrency(group.balance || 0)}</span>
                  </div>
                </div>

                {group.targetAmount > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-secondary">
                      <span>{t('target') || 'Target'}: {formatCurrency(group.targetAmount)}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] rounded-full h-1.5 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full ${getStatusColor(group.status)}`}>
                    {group.status || 'active'}
                  </span>
                  <span className="text-secondary flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {isOwner && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-[#0EA5A5]">
                    <Shield className="w-3 h-3" />
                    {t('owner') || 'Owner'}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-border-light flex items-center justify-between">
                  <span className="text-xs text-secondary">
                    {group.members?.length || 0} {t('members') || 'members'}
                  </span>
                  <span className="text-xs text-[#0EA5A5] flex items-center gap-1 group-hover:gap-2 transition-all">
                    {t('viewDetails') || 'View Details'} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0EA5A5]" />
                <h2 className="text-xl font-bold text-primary">{t('createGroup') || 'Create Group'}</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-surface-hover rounded-xl transition">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('groupName') || 'Group Name'} *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('description') || 'Description'}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="What's this group about?"
                  rows="3"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('targetAmount') || 'Target Amount (NPR)'}</label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 50000"
                  min="0"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('category') || 'Category'}</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                className="w-full btn-primary py-3.5 text-lg font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Creating...
                  </span>
                ) : (
                  t('createGroup') || 'Create Group'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedGroup && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
          <div className="modal-content max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0EA5A5]" />
                <h2 className="text-xl font-bold text-primary">{t('addMember') || 'Add Member'}</h2>
              </div>
              <button onClick={() => setShowAddMemberModal(false)} className="p-2 hover:bg-surface-hover rounded-xl transition">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <p className="text-sm text-secondary mb-4">
              {t('addMemberTo') || 'Add member to'}: <span className="font-semibold text-primary">{selectedGroup.name}</span>
            </p>

            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-1.5">{t('emailOrPhone') || 'Email or Phone'}</label>
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
                disabled={memberSubmitting}
                className="w-full btn-primary py-3.5 text-lg font-semibold disabled:opacity-50"
              >
                {memberSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Adding...
                  </span>
                ) : (
                  t('addMember') || 'Add Member'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;