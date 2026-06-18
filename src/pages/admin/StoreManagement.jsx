import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { DataTable } from '../../components/common/DataTable'
import { StarRating } from '../../components/common/StarRating'
import { AddStoreModal } from '../../components/modals/AddStoreModal'

export const StoreManagement = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: ''
  })
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })

  useEffect(() => {
    fetchStores()
  }, [filters, sortConfig])

  const fetchStores = async () => {
    setLoading(true)
    let query = supabase
      .from('stores')
      .select(`
        *,
        ratings(rating_value)
      `)

    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters.email) {
      query = query.ilike('email', `%${filters.email}%`)
    }
    if (filters.address) {
      query = query.ilike('address', `%${filters.address}%`)
    }

    query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' })

    const { data, error } = await query

    if (!error && data) {
      const storesWithRatings = data.map(store => {
        const ratings = store.ratings || []
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating_value, 0) / ratings.length
          : null
        return { ...store, avgRating, ratingCount: ratings.length }
      })
      setStores(storesWithRatings)
    }
    setLoading(false)
  }

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction })
  }

  const handleStoreAdded = () => {
    setShowModal(false)
    fetchStores()
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'avgRating',
      label: 'Rating',
      sortable: false,
      render: (val, row) => val ? (
        <div className="flex items-center space-x-2">
          <StarRating rating={val} readonly size="sm" />
          <span className="text-sm text-gray-500">({row.ratingCount})</span>
        </div>
      ) : (
        <span className="text-gray-400">No ratings</span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString()
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Add New Store
        </button>
      </div>

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={stores}
            onSort={handleSort}
            sortConfig={sortConfig}
            emptyMessage="No stores found"
          />
        )}
      </div>

      {showModal && (
        <AddStoreModal
          onClose={() => setShowModal(false)}
          onSuccess={handleStoreAdded}
        />
      )}
    </div>
  )
}
