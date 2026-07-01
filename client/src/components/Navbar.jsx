import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, Menu, X, User, LogOut, LayoutDashboard, Terminal } from 'lucide-react';

import Logo from './Logo';

const Navbar = () => {
  const { user, logout, unreadNotificationsCount } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(localStorage.getItem('th_demo_mode') === 'true');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      setIsDemoMode(localStorage.getItem('th_demo_mode') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const toggleDemoMode = () => {
    if (isDemoMode) {
      localStorage.removeItem('th_demo_mode');
    } else {
      localStorage.setItem('th_demo_mode', 'true');
    }
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;

  const links = [
    { name: 'Find Jobs', path: '/jobs', roles: ['all', 'candidate'] },
    { name: 'AI Career Tools', path: '/ai-tools', roles: ['candidate'] },
    { name: 'Post a Job', path: '/employer/dashboard', roles: ['employer'] },
    { name: 'Admin Control', path: '/admin/dashboard', roles: ['admin'] },
    { name: 'About Us', path: '/about', roles: ['all'] },
    { name: 'Contact', path: '/contact', roles: ['all'] },
  ];

  const visibleLinks = links.filter((link) => {
    if (link.roles.includes('all')) return true;
    if (!user) return false;
    return link.roles.includes(user.role);
  });

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
      {/* Top micro brand accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#00BE9B] via-emerald-400 to-[#FF5E5B]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            
            {/* Demo Mode Badge */}
            {isDemoMode && (
              <button
                onClick={toggleDemoMode}
                title="Click to attempt database reconnect"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 text-[10px] font-bold hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-all cursor-pointer"
              >
                <Terminal size={10} />
                Sandbox Mode
              </button>
            )}
          </div>


          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {visibleLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                {/* Notifications Link */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <Bell size={18} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 min-w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center px-1 animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  >
                    <img
                      src={user.profileImage ? `http://localhost:5000/${user.profileImage}` : '/default-profile.png'}
                      alt={user.name}
                      onError={(e) => {
                        e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name;
                      }}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <span className="hidden lg:block text-xs font-semibold text-slate-700 dark:text-slate-200 px-1">
                      {user.name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl ring-1 ring-black/5 animate-fade-in">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to={
                          user.role === 'admin'
                            ? '/admin/dashboard'
                            : user.role === 'employer'
                            ? '/employer/dashboard'
                            : '/candidate/dashboard'
                        }
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <Link
                        to={user.role === 'employer' ? '/employer/profile' : '/candidate/profile'}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User size={15} /> Edit Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-700 hover:shadow-blue-500/10 transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bell size={18} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center px-1">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        {/* Drawer Panel */}
        <div
          className={`fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col gap-6 transform transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <Logo size="md" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-2 flex-grow overflow-y-auto">
            {visibleLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 font-semibold shadow-sm'
                    : 'text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-150 dark:border-slate-800 pt-4 mt-auto">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-3">
                  <img
                    src={user.profileImage ? `http://localhost:5000/${user.profileImage}` : '/default-profile.png'}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                    <p className="text-[10px] uppercase font-bold text-[#00BE9B]">{user.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Link
                    to={
                      user.role === 'admin'
                        ? '/admin/dashboard'
                        : user.role === 'employer'
                        ? '/employer/dashboard'
                        : '/candidate/dashboard'
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link
                    to={user.role === 'employer' ? '/employer/profile' : '/candidate/profile'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User size={16} /> Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors font-medium"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 px-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center rounded-xl border border-slate-250 dark:border-slate-700 py-3 text-sm font-semibold text-slate-700 dark:text-slate-305 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-h-[48px]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 active:scale-97 transition-all min-h-[48px]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
