import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { StarRating } from '../../components/common/StarRating'

export const UserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserDetails()
  }, [id])

  const fetchUserDetails = async () => {
    setLoading(true)

    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (userError || !userData) {
      setLoading(false)
      return
    }

    setUser(userData)

    if (userData.role === 'store_owner') {
      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', id)
        .single()

      if (storeData) {
        const { data: ratingsData } = await supabase
          .from('ratings')
          .select(`
            *,
            profiles(name, email)
          `)
          .eq('store_id', storeData.id)

        setRatings(ratingsData || [])
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

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-500">User not found</div>
        <button
          onClick={() => navigate('/admin/users')}
          className="mt-4 text-blue-600 hover:text-blue-900"
        >
          Back to Users
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/admin/users')}
        className="mb-6 text-blue-600 hover:text-blue-900 flex items-center"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Users
      </button>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{user.role?.replace('_', ' ')}</p>
        </div>
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.address || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.updated_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {user.role === 'store_owner' && (
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Store Ratings</h2>
          </div>
          {ratings.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No ratings received yet
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
      )}
    </div>
  )
}
