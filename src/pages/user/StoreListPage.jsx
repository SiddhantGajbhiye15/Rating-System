import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { DataTable } from '../../components/common/DataTable'
import { StarRating } from '../../components/common/StarRating'

export const StoreListPage = () => {
  const { user } = useAuth()
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ name: '', address: '' })
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [ratingStoreId, setRatingStoreId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchStores()
  }, [filters, sortConfig, user])

  const fetchStores = async () => {
    if (!user) return
    setLoading(true)

    let query = supabase
      .from('stores')
      .select(`
        *,
        ratings(rating_value, user_id)
      `)

    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`)
    }
    if (filters.address) {
      query = query.ilike('address', `%${filters.address}%`)
    }

    query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' })

    const { data, error } = await query

    if (!error && data) {
      const storesWithRatings = data.map(store => {
        const ratings = store.ratings || []
        const userRating = ratings.find(r => r.user_id === user.id)
        const otherRatings = ratings.filter(r => r.user_id !== user.id)
        const allRatings = ratings.length > 0 ? ratings : []

        const avgRating = allRatings.length > 0
          ? allRatings.reduce((sum, r) => sum + r.rating_value, 0) / allRatings.length
          : null

        return {
          ...store,
          avgRating,
          ratingCount: allRatings.length,
          userRating: userRating?.rating_value || null
        }
      })
      setStores(storesWithRatings)
    }
    setLoading(false)
  }

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction })
  }

  const handleRate = async (storeId, value) => {
    setSubmitting(true)

    const existingRating = await supabase
      .from('ratings')
      .select('id')
      .eq('user_id', user.id)
      .eq('store_id', storeId)
      .single()

    if (existingRating.data) {
      await supabase
        .from('ratings')
        .update({ rating_value: value })
        .eq('id', existingRating.data.id)
    } else {
      await supabase
        .from('ratings')
        .insert({
          user_id: user.id,
          store_id: storeId,
          rating_value: value
        })
    }

    setSubmitting(false)
    setRatingStoreId(null)
    fetchStores()
  }

  const columns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'avgRating',
      label: 'Overall Rating',
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
      key: 'userRating',
      label: 'Your Rating',
      sortable: false,
      render: (val, row) => (
        <div className="relative">
          {submitting && ratingStoreId === row.id ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <StarRating
              rating={val || 0}
              onRate={(value) => handleRate(row.id, value)}
              readonly={false}
              size="sm"
            />
          )}
        </div>
      )
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Browse Stores</h1>

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by store name..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
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
    </div>
  )
}
