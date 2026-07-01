import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Briefcase, Bookmark, FileCheck, User } from 'lucide-react';

const BottomNav = () => {
  const { user } = useAuth();

  const getProfilePath = () => {
    if (!user) return '/login';
    return user.role === 'employer' ? '/employer/profile' : '/candidate/profile';
  };

  const tabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Saved', path: '/saved-jobs', icon: Bookmark, roles: ['candidate'] },
    { name: 'Applied', path: '/applications', icon: FileCheck, roles: ['candidate'] },
    { name: 'Profile', path: getProfilePath(), icon: User }
  ];

  const visibleTabs = tabs.filter(tab => {
    if (!tab.roles) return true;
    if (!user) return false;
    return tab.roles.includes(user.role);
  });

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] transition-colors duration-200">
      {/* 8px grid bottom padding support for iPhone notch safe areas */}
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2 pb-safe">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 text-center select-none transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon size={20} className="mb-0.5 transition-transform active:scale-90" />
              <span className="text-[10px] tracking-tight">{tab.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
