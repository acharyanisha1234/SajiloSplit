import React, { useEffect, useState } from 'react';
import { Search, Users, Wallet, Calendar, Trash2, Eye, Group } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/admin/groups');
      setGroups(response.data.data);
    } catch (error) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      await axios.delete(`/api/admin/groups/${id}`);
      toast.success('Group deleted!');
      fetchGroups();
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  };

  const filteredGroups = groups.filter(g =>
    g.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
        <p className="text-gray-500">Manage all platform groups</p>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => (
          <div key={group._id} className="dashboard-card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-500">{group.description || 'No description'}</p>
              </div>
              <div className="flex gap-1">
                <button className="text-gray-400 hover:text-gray-600">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(group._id)} className="text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="w-4 h-4" />
                <span>{group.members?.length || 0} members</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Wallet className="w-4 h-4" />
                <span>{formatCurrency(group.balance || 0)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gray-400">
                <Calendar className="w-3 h-3 inline mr-1" />
                {new Date(group.createdAt).toLocaleDateString()}
              </span>
              <span className={`px-2 py-0.5 rounded-full ${
                group.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {group.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGroups;