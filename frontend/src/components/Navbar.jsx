import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isConsumer = hasRole('consumer');
  const isProvider = hasRole('provider');

  return (
    <nav className="bg-[#003366] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white font-montserrat tracking-tight">BidServe</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {isConsumer && (
                  <Link to="/consumer/requests/new" className="text-sm font-semibold text-[#00BFA5] hover:text-white transition-colors">
                    + Request
                  </Link>
                )}
                {isConsumer && (
                  <Link to="/consumer/requests" className="text-sm text-white/80 hover:text-white transition-colors">
                    My Requests
                  </Link>
                )}
                {isProvider && (
                  <Link to="/provider/browse" className="text-sm text-white/80 hover:text-white transition-colors">
                    Browse
                  </Link>
                )}
                {isProvider && (
                  <Link to="/provider/offers" className="text-sm text-white/80 hover:text-white transition-colors">
                    My Offers
                  </Link>
                )}
                <Link to="/chat" className="text-sm text-white/80 hover:text-white transition-colors">
                  Messages
                </Link>
                <span className="text-sm text-white/60 ml-2">{user.name}</span>
                <button onClick={handleLogout} className="text-sm text-white/60 hover:text-red-300 transition-colors ml-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/80 hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="text-sm bg-[#00BFA5] text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}