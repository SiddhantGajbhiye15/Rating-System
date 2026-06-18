import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { DataTable } from '../../components/common/DataTable'
import { AddUserModal } from '../../components/modals/AddUserModal'

export const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
  })
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [filters, sortConfig])

  const fetchUsers = async () => {
    setLoading(true)
    let query = supabase.from('profiles').select('*')

    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters.email) {
      query = query.ilike('email', `%${filters.email}%`)
    }
    if (filters.address) {
      query = query.ilike('address', `%${filters.address}%`)
    }
    if (filters.role) {
      query = query.eq('role', filters.role)
    }

    query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' })

    const { data, error } = await query

    if (!error && data) {
      setUsers(data)
    }
    setLoading(false)
  }

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction })
  }

  const handleUserAdded = () => {
    setShowModal(false)
    fetchUsers()
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true, render: (val) => val || '-' },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          val === 'admin' ? 'bg-blue-100 text-blue-800' :
          val === 'store_owner' ? 'bg-purple-100 text-purple-800' :
          'bg-green-100 text-green-800'
        }`}>
          {val?.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/admin/users/${row.id}`)}
          className="text-blue-600 hover:text-blue-900"
        >
          View Details
        </button>
      )
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Add New User
        </button>
      </div>

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Search by email..."
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, email: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Search by address..."
              value={filters.address}
              onChange={(e) => setFilters({ ...filters, address: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="normal_user">Normal User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            onSort={handleSort}
            sortConfig={sortConfig}
            emptyMessage="No users found"
          />
        )}
      </div>

      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onSuccess={handleUserAdded}
        />
      )}
    </div>
  )
}
