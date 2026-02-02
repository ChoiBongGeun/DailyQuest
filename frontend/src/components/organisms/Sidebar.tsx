'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, CheckSquare, Calendar, FolderKanban, Plus } from 'lucide-react';
import { Button } from '../atoms/Button';
import type { Project } from '@/types';
import { useTranslation } from 'react-i18next';

export type DashboardView = 'dashboard' | 'today' | 'week' | 'all' | 'projects';

interface SidebarProps {
  currentView: DashboardView;
  selectedProjectId?: number;
  projects?: Project[];
  onViewChange: (view: DashboardView) => void;
  onSelectProject: (projectId: number) => void;
  onNewTask: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  selectedProjectId,
  projects = [],
  onViewChange,
  onSelectProject,
  onNewTask,
}) => {
  const { t } = useTranslation();
  const menuItems: Array<{ id: DashboardView; label: string; icon: React.ElementType }> = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'today', label: t('nav.today'), icon: CheckSquare },
    { id: 'week', label: t('nav.week'), icon: Calendar },
    { id: 'all', label: t('nav.all'), icon: FolderKanban },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto transition-colors">
      <div className="p-4 space-y-4">
        <Button variant="primary" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={onNewTask}>
          {t('task.newTask')}
        </Button>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {t('nav.projects')}
            </h3>
          </div>

          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm',
                  selectedProjectId === project.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                )}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color || '#3B82F6' }}
                />
                <span className="truncate">{project.name}</span>
              </button>
            ))}
            {projects.length === 0 && (
              <p className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                {t('project.noProjects')}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
