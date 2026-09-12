import React, { useEffect, useState } from 'react';
import { 
  Plus, Edit, Trash2, Tag, X, Search, Palette
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', icon: 'category', color: '#0EA5A5' });
  const [submitting, setSubmitting] = useState(false);

  const iconOptions = [
    'category', 'restaurant', 'directions_car', 'home', 'school',
    'shopping_bag', 'movie', 'bolt', 'flight', 'devices',
    'health_and_safety', 'verified_user', 'local_grocery_store',
    'restaurant_menu', 'checkroom', 'sports', 'pets', 'work'
  ];

  const colorOptions = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF8C00', '#00CED1', '#6C5CE7', '#95A5A6',
    '#0EA5A5', '#D4A373', '#1A2E4A', '#10B981', '#EF4444'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/admin/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingCategory) {
        await axios.put(`/api/admin/categories/${editingCategory._id}`, formData);
        toast.success('Category updated');
      } else {
        await axios.post('/api/admin/categories', formData);
        toast.success('Category created');
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', icon: 'category', color: '#0EA5A5' });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const getFiltered = () => {
    if (!searchTerm) return categories;
    return categories.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const filtered = getFiltered();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#0EA5A5]/20 border-t-[#0EA5A5] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Category Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage expense categories</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', icon: 'category', color: '#0EA5A5' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white font-semibold shadow-lg shadow-[#0EA5A5]/25 hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="w-20 h-20 bg-[#0EA5A5]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Tag className="w-10 h-10 text-[#0EA5A5]" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No categories</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add your first category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((cat) => (
            <div key={cat._id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group text-center">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                style={{ backgroundColor: cat.color + '20' }}
              >
                <Palette className="w-7 h-7" style={{ color: cat.color }} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 truncate">{cat.name}</h3>
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => {
                    setEditingCategory(cat);
                    setFormData({ name: cat.name, icon: cat.icon || 'category', color: cat.color || '#0EA5A5' });
                    setShowModal(true);
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-[#0EA5A5] transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#0EA5A5]" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5A5]/20 focus:border-[#0EA5A5]"
                  placeholder="e.g., Food"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${
                        formData.color === color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        formData.icon === icon
                          ? 'border-[#0EA5A5] bg-[#0EA5A5]/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-6 h-6 rounded bg-slate-300 dark:bg-slate-600 mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0EA5A5] to-[#0B8A8A] text-white font-semibold shadow-lg shadow-[#0EA5A5]/25 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;