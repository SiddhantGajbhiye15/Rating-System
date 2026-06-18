import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { StarRating } from '../../components/common/StarRating'

export const StoreOwnerDashboard = () => {
  const { user, profile } = useAuth()
  const [store, setStore] = useState(null)
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [avgRating, setAvgRating] = useState(null)

  useEffect(() => {
    if (user && profile) {
      fetchStoreData()
    }
  }, [user, profile])

  const fetchStoreData = async () => {
    setLoading(true)

    const { data: storeData } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (storeData) {
      setStore(storeData)

      const { data: ratingsData } = await supabase
        .from('ratings')
        .select(`
          *,
          profiles(name, email)
        `)
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false })

      if (ratingsData) {
        setRatings(ratingsData)
        if (ratingsData.length > 0) {
          const total = ratingsData.reduce((sum, r) => sum + r.rating_value, 0)
          setAvgRating(total / ratingsData.length)
        }
      }
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          You don't have a store assigned yet. Please contact an administrator to link your store.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Store Owner Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Your Store</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">{store.name}</dd>
            <dd className="mt-1 text-sm text-gray-500">{store.address}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
            <dd className="mt-2">
              {avgRating ? (
                <div className="flex items-center space-x-2">
                  <StarRating rating={avgRating} readonly size="lg" />
                  <span className="text-2xl font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
                </div>
              ) : (
                <span className="text-gray-400">No ratings yet</span>
              )}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Ratings</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{ratings.length}</dd>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Users Who Rated Your Store</h2>
        </div>
        {ratings.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No one has rated your store yet
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {ratings.map((rating) => (
              <div key={rating.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {rating.profiles?.name || 'Unknown User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {rating.profiles?.email || ''}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <StarRating rating={rating.rating_value} readonly size="sm" />
                  <div className="text-sm text-gray-500">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
