import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Settings, HelpCircle, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SearchBar } from './SearchBar';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const path = location.pathname;

  // Customize placeholder based on page
  let searchPlaceholder = 'Search inventory...';
  if (path === '/products') {
    searchPlaceholder = 'Global Search...';
  } else if (path === '/sales') {
    searchPlaceholder = 'Search transactions...';
  } else if (path === '/reports') {
    searchPlaceholder = 'Search reports...';
  }

  // Customize profile text based on page
  let profileName = 'Administrator';
  let profileRole = 'Main Warehouse';
  const showProfile = path !== '/reports';

  if (path === '/products') {
    profileName = 'Admin';
    profileRole = 'Administrator';
  } else if (path === '/sales') {
    profileName = 'Administrator';
    profileRole = 'MASTER ACCESS';
  }

  return (
    <header className="h-20 border-b border-brand-border bg-brand-bg px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Menu icon and Search */}
      <div className="flex items-center gap-3 flex-1 mr-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-border/30 hover:text-brand-primary rounded-md lg:hidden transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5 stroke-[1.8]" />
        </button>

        <SearchBar
          placeholder={searchPlaceholder}
          className="max-w-[200px] sm:max-w-xs md:max-w-md"
        />
      </div>

      {/* Utility Actions & User Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 sm:gap-4 text-brand-secondary">
          <button className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-border/30 hover:text-brand-primary rounded-md transition-colors cursor-pointer" title="Notifications">
            <Bell className="h-5 w-5 stroke-[1.8]" />
          </button>
          <button className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-border/30 hover:text-brand-primary rounded-md transition-colors cursor-pointer" title="Settings">
            <Settings className="h-5 w-5 stroke-[1.8]" />
          </button>
          <button className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-border/30 hover:text-brand-primary rounded-md transition-colors cursor-pointer" title="Help">
            <HelpCircle className="h-5 w-5 stroke-[1.8]" />
          </button>
          <button 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-border/30 hover:text-brand-primary rounded-md transition-colors cursor-pointer"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 stroke-[1.8]" />
            ) : (
              <Sun className="h-5 w-5 stroke-[1.8]" />
            )}
          </button>
        </div>

        {showProfile && (
          <div className="flex items-center gap-3 border-l border-brand-border pl-4 sm:pl-6">
            <div className="hidden sm:flex text-right flex flex-col">
              <span className="text-xs font-bold text-brand-primary leading-none uppercase tracking-wide">
                {profileName}
              </span>
              <span className="text-[10px] text-brand-secondary font-medium mt-0.5">
                {profileRole}
              </span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
              alt="Admin Avatar"
              className="h-9 w-9 rounded-full object-cover border border-brand-border"
            />
          </div>
        )}
      </div>
    </header>
  );
};
