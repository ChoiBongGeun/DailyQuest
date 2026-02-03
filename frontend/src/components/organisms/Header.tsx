// src/components/organisms/Header.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../atoms/Button';
import { DarkModeToggle } from '../atoms/DarkModeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import { SettingsModal } from './SettingsModal';
import { Settings, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslation } from 'react-i18next';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showSettings, setShowSettings] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
              <NotificationDropdown />

              {/* Settings */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label={t('nav.settings')}
              >
                <Settings className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
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
                    onClick={handleLogout}
                >
                  {t('auth.logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </header>
  );
};
