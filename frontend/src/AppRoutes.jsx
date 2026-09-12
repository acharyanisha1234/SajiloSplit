import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// User Pages
import UserLayout from './layouts/UserLayout';
import Dashboard from './pages/user/Dashboard';
import Wallet from './pages/user/Wallet';
import SendMoney from './pages/user/SendMoney';
import ReceiveMoney from './pages/user/ReceiveMoney';
import QRScanner from './pages/user/QRScanner';
import Transactions from './pages/user/Transactions';
import TransactionDetails from './pages/user/TransactionDetails';
import Groups from './pages/user/Groups';
import GroupDetails from './pages/user/GroupDetails';
import AddExpense from './pages/user/AddExpense';
import Settlements from './pages/user/Settlements';
import Budgets from './pages/user/Budgets';
import Bills from './pages/user/Bills';
import LockedFunds from './pages/user/LockedFunds';
import EmergencyFunds from './pages/user/EmergencyFunds';
import Notifications from './pages/user/Notifications';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';
import KYC from './pages/user/KYC';


// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminGroups from './pages/admin/AdminGroups';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = ['user', 'admin'] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user, authChecked } = useSelector((state) => state.auth);
  const authenticatedPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  if (!authChecked) {
    return null;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={authenticatedPath} />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={authenticatedPath} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* User Routes */}
      <Route element={
        <ProtectedRoute allowedRoles={['user', 'admin']}>
          <UserLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/send-money" element={<SendMoney />} />
        <Route path="/receive-money" element={<ReceiveMoney />} />
        <Route path="/qr-scanner" element={<QRScanner />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transactions/:id" element={<TransactionDetails />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetails />} />
        <Route path="/groups/:id/add-expense" element={<AddExpense />} />
        <Route path="/settlements" element={<Settlements />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/locked-funds" element={<LockedFunds />} />
        <Route path="/emergency-funds" element={<EmergencyFunds />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/kyc" element={<KYC />} />
        
      </Route>

      {/* Admin Routes */}
      <Route element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        <Route path="/admin/groups" element={<AdminGroups />} />
        <Route path="/admin/disputes" element={<AdminDisputes />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/notifications" element={<Notifications />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;