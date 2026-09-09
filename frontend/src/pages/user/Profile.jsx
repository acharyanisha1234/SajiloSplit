import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Phone, Calendar, Edit2, Save, X, Camera, QrCode } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../../store/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    dob: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        dob: user.dob ? user.dob.split('T')[0] : ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/users/profile', formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      dispatch(getCurrentUser());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('profileImage', file);
    
    try {
      const response = await axios.post('/api/users/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile image updated!');
      dispatch(getCurrentUser());
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleDownloadQR = () => {
    // Simulate QR download
    toast.success('QR code downloaded!');
  };

  const InfoField = ({ label, value }) => (
    <div className="flex flex-col p-3 bg-gray-50 rounded-lg">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value || 'Not set'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 dashboard-card">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center mx-auto overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary-600">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-4">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className={`text-sm mt-1 ${user?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
              {user?.isVerified ? '✓ Verified' : '⚠️ Not verified'}
            </p>
            <div className="mt-4 flex gap-2 justify-center">
              <button
                onClick={handleDownloadQR}
                className="btn-outline py-1 px-3 text-sm flex items-center gap-1"
              >
                <QrCode className="w-4 h-4" /> QR Code
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-primary py-1 px-3 text-sm flex items-center gap-1"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>

          <div className="mt-4 border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Account Info</h3>
            <div className="space-y-1 text-sm">
              <InfoField label="User ID" value={user?.id} />
              <InfoField label="Role" value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} />
              <InfoField label="Joined" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} />
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isEditing ? 'Edit Profile' : 'Profile Information'}
          </h3>

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your address"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoField label="Full Name" value={user?.name} />
              <InfoField label="Email" value={user?.email} />
              <InfoField label="Phone" value={user?.phone || 'Not set'} />
              <InfoField label="Address" value={user?.address || 'Not set'} />
              <InfoField label="Date of Birth" value={user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not set'} />
              <InfoField label="Account Status" value={user?.isActive ? 'Active' : 'Inactive'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;