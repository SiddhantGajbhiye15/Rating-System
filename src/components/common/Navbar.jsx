import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const Navbar = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const getNavLinks = () => {
    if (!profile) return []

    switch (profile.role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard' },
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/stores', label: 'Stores' },
        ]
      case 'store_owner':
        return [
          { to: '/store-owner', label: 'Dashboard' },
        ]
      default:
        return [
          { to: '/stores', label: 'Browse Stores' },
        ]
    }
  }

  if (!user) return null

  const navLinks = getNavLinks()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Store Ratings
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/account"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Account
            </Link>
            <span className="text-sm text-gray-500">
              {profile?.name} ({profile?.role?.replace('_', ' ')})
            </span>
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
