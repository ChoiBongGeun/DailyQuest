'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

export const DarkModeToggle: React.FC = () => {
  const { theme, toggleTheme } = useUIStore();

  React.useEffect(() => {
    // 다크모드 클래스 적용
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-neutral-600" />
      )}
    </button>
  );
};
