import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Navbar } from './components/common/Navbar'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { UserManagement } from './pages/admin/UserManagement'
import { StoreManagement } from './pages/admin/StoreManagement'
import { UserDetail } from './pages/admin/UserDetail'
import { StoreListPage } from './pages/user/StoreListPage'
import { StoreOwnerDashboard } from './pages/storeOwner/StoreOwnerDashboard'
import { ChangePasswordModal } from './components/modals/ChangePasswordModal'
import { useState } from 'react'

const AppContent = () => {
  const { user, profile, loading } = useAuth()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  const getDefaultRoute = () => {
    if (!user) return '/login'
    if (!profile) return '/login'

    switch (profile.role) {
      case 'admin':
        return '/admin'
      case 'store_owner':
        return '/store-owner'
      default:
        return '/stores'
    }
  }

  return (
    <>
      {user && <Navbar />}

      <Routes>
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to={getDefaultRoute()} replace />}
        />

        <Route
          path="/signup"
          element={!user ? <SignupPage /> : <Navigate to={getDefaultRoute()} replace />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StoreManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stores"
          element={
            <ProtectedRoute allowedRoles={['normal_user', 'store_owner']}>
              <StoreListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/store-owner"
          element={
            <ProtectedRoute allowedRoles={['store_owner']}>
              <StoreOwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>

      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => setShowPasswordModal(false)}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}