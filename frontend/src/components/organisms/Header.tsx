import React from 'react';
import { Button } from '../atoms/Button';
import { DarkModeToggle } from '../atoms/DarkModeToggle';
import { Bell, Settings, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">DailyQuest</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative">
              <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <Settings className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 ml-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {user?.nickname}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                leftIcon={<LogOut className="w-4 h-4" />}
                onClick={logout}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
