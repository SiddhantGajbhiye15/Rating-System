import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    usersByRole: { admin: 0, normal_user: 0, store_owner: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)

    const [usersResult, storesResult, ratingsResult] = await Promise.all([
      supabase.from('profiles').select('role'),
      supabase.from('stores').select('id'),
      supabase.from('ratings').select('id')
    ])

    const usersByRole = { admin: 0, normal_user: 0, store_owner: 0 }
    if (usersResult.data) {
      usersResult.data.forEach(user => {
        usersByRole[user.role] = (usersByRole[user.role] || 0) + 1
      })
    }

    setStats({
      totalUsers: usersResult.data?.length || 0,
      totalStores: storesResult.data?.length || 0,
      totalRatings: ratingsResult.data?.length || 0,
      usersByRole
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalUsers}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Stores</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalStores}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Ratings</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalRatings}</dd>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Users by Role</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.usersByRole.admin}</div>
              <div className="text-sm text-gray-600">Admins</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.usersByRole.normal_user}</div>
              <div className="text-sm text-gray-600">Normal Users</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.usersByRole.store_owner}</div>
              <div className="text-sm text-gray-600">Store Owners</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
