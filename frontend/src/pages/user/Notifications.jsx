import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Bell, Clock, Wallet, Users, AlertCircle, X, CheckCircle } from 'lucide-react';
import { getNotifications, markAsRead } from '../../store/slices/notificationSlice';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, isLoading } = useSelector((state) => state.notifications);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.isRead) {
        dispatch(markAsRead(n._id));
      }
    });
  };

  const getNotificationIcon = (type) => {
    const icons = {
      money_received: <Wallet className="w-5 h-5 text-green-600" />,
      money_sent: <Wallet className="w-5 h-5 text-blue-600" />,
      group_invitation: <Users className="w-5 h-5 text-purple-600" />,
      group_contribution: <Users className="w-5 h-5 text-indigo-600" />,
      new_expense: <AlertCircle className="w-5 h-5 text-orange-600" />,
      expense_approval: <CheckCircle className="w-5 h-5 text-green-600" />,
      expense_rejection: <X className="w-5 h-5 text-red-600" />,
      settlement_reminder: <Bell className="w-5 h-5 text-yellow-600" />,
      bill_reminder: <Bell className="w-5 h-5 text-red-600" />,
      budget_warning: <AlertCircle className="w-5 h-5 text-orange-600" />,
      emergency_request: <AlertCircle className="w-5 h-5 text-red-600" />,
      system: <Bell className="w-5 h-5 text-gray-600" />
    };
    return icons[type] || <Bell className="w-5 h-5 text-gray-600" />;
  };

  const getNotificationBg = (type) => {
    const colors = {
      money_received: 'bg-green-50',
      money_sent: 'bg-blue-50',
      group_invitation: 'bg-purple-50',
      group_contribution: 'bg-indigo-50',
      new_expense: 'bg-orange-50',
      expense_approval: 'bg-green-50',
      expense_rejection: 'bg-red-50',
      settlement_reminder: 'bg-yellow-50',
      bill_reminder: 'bg-red-50',
      budget_warning: 'bg-orange-50',
      emergency_request: 'bg-red-50',
      system: 'bg-gray-50'
    };
    return colors[type] || 'bg-gray-50';
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.isRead)
      : notifications;

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Stay updated with your activity</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({notifications?.length || 0})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'unread' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading notifications...</p>
        </div>
      ) : filteredNotifications?.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
          <p className="text-gray-500 mt-2">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-xl transition-colors ${
                notification.isRead ? 'bg-white' : 'bg-primary-50 border border-primary-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getNotificationBg(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{notification.title}</