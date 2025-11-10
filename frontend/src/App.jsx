import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Layouts
import MainLayout from './components/common/MainLayout'

// Pages
import Landing from './pages/shared/Landing'
import Login from './pages/auth/Login'
import NeumorphismLogin from './pages/auth/NeumorphismLogin'
import Register from './pages/auth/Register'
import NeumorphismRegister from './pages/auth/NeumorphismRegister'
import Dashboard from './pages/student/Dashboard'
import Wallet from './pages/student/Wallet'
import TransactionHistory from './pages/student/TransactionHistory'
import Profile from './pages/student/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import TransactionManagement from './pages/admin/TransactionManagement'
import TopupRequestManagement from './pages/admin/TopupRequestManagement'
import CardManagement from './pages/admin/CardManagement'
import NotFound from './pages/shared/NotFound'

function App() {
  const { user, loading } = useAuth()

  const isStudent = user && ['student', 'user'].includes(user.role)
  const hasAdminAccess = user && ['admin', 'manager'].includes(user.role)

  const getFallbackPath = () => {
    if (isStudent) {
      return '/student/dashboard'
    }

    if (hasAdminAccess) {
      return '/admin/dashboard'
    }

    return '/login'
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />

      {/* Auth Routes */}
      <Route path="/login" element={<NeumorphismLogin />} />
      <Route path="/login-old" element={<Login />} />
      <Route path="/register" element={<NeumorphismRegister />} />
      <Route path="/register-old" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          isStudent ? <Dashboard /> : <Navigate to={getFallbackPath()} replace />
        } />
        <Route path="/student/wallet" element={
          isStudent ? <Wallet /> : <Navigate to={getFallbackPath()} replace />
        } />
        <Route path="/student/transactions" element={
          isStudent ? <TransactionHistory /> : <Navigate to={getFallbackPath()} replace />
        } />
        <Route path="/student/profile" element={
          isStudent ? <Profile /> : <Navigate to={getFallbackPath()} replace />
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          hasAdminAccess ? <AdminDashboard /> : <Navigate to={getFallbackPath()} replace />
        } />
        <Route path="/admin/users" element={
          hasAdminAccess ? <UserManagement /> : <Navigate to={getFallbackPath()} replace />
        } />
        <Route path="/admin/transactions" element={
          hasAdminAccess ? <TransactionManagement /> : <Navigate to={getFallbackPath()} replace />
        } />
        <Route path="/admin/topup-requests" element={
          hasAdminAccess ? <TopupRequestManagement /> : <Navigate to={getFallbackPath()} replace />
        } />
        <Route path="/admin/cards" element={
          hasAdminAccess ? <CardManagement /> : <Navigate to={getFallbackPath()} replace />
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App