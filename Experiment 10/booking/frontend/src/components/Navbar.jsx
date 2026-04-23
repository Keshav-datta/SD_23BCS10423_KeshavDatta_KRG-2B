import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const path = location.pathname;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/my-bookings', label: 'My Bookings' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight flex items-center gap-1">
            🎬 TicketFlow
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => {
              const isActive = path === to || (to !== '/' && path.startsWith(to));
              return (
                <Link
                  key={label}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-indigo-700 max-w-[100px] truncate">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="text-sm font-semibold text-slate-400 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-sm font-semibold text-indigo-600 px-4 py-2 hover:bg-indigo-50 rounded-lg transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="bg-indigo-600 text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
