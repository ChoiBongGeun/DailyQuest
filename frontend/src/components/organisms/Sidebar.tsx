'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, CheckSquare, Calendar, FolderKanban, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../atoms/Button';
import type { Project } from '@/types';
import { useTranslation } from 'react-i18next';

export type DashboardView = 'dashboard' | 'today' | 'week' | 'all' | 'projects';

interface SidebarProps {
  currentView: DashboardView;
  selectedProjectId?: number;
  projects?: Project[];
  stats?: { todayTasks: number; weekTasks: number };
  onViewChange: (view: DashboardView) => void;
  onSelectProject: (projectId: number) => void;
  onNewTask: () => void;
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  isMobile?: boolean;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  selectedProjectId,
  projects = [],
  stats,
  onViewChange,
  onSelectProject,
  onNewTask,
  onNewProject,
  onEditProject,
  onDeleteProject,
  isMobile = false,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const menuItems: Array<{ id: DashboardView; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'today', label: t('nav.today'), icon: CheckSquare, badge: stats?.todayTasks },
    { id: 'week', label: t('nav.week'), icon: Calendar, badge: stats?.weekTasks },
    { id: 'all', label: t('nav.all'), icon: FolderKanban },
  ];

  const handleNavigate = () => {
    onNavigate?.();
  };

  return (
    <aside
      className={cn(
        'bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto transition-colors',
        isMobile ? 'w-72 h-full' : 'w-64 h-[calc(100vh-4rem)] sticky top-16'
      )}
    >
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
                onClick={() => {
                  onViewChange(item.id);
                  handleNavigate();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={cn(
                    'min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-semibold flex items-center justify-center',
                    isActive
                      ? 'bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                  )}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {t('nav.projects')}
            </h3>
            <button
              onClick={() => {
                onNewProject();
                handleNavigate();
              }}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
              aria-label={t('project.newProject')}
            >
              <Plus className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>

          <div className="space-y-1">
            {projects.map((project) => {
              const isActive = selectedProjectId === project.id;
              return (
                <div
                  key={project.id}
                  className={cn(
                    'group flex items-center gap-1 rounded-lg transition-colors text-sm',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  )}
                >
                  <button
                    onClick={() => {
                      onSelectProject(project.id);
                      handleNavigate();
                    }}
                    className={cn(
                      'flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-left',
                      isActive
                        ? 'text-primary-700 dark:text-primary-400'
                        : 'text-neutral-700 dark:text-neutral-300'
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color || '#3B82F6' }}
                    />
                    <span className="truncate">{project.name}</span>
                  </button>
                  <div
                    className={cn(
                      'pr-1 flex items-center gap-0.5 transition-opacity',
                      isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
                    )}
                  >
                    <button
                      onClick={() => onEditProject(project)}
                      className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:opacity-100"
                      aria-label={`${t('project.editProject')}: ${project.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-300" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(project)}
                      className="p-1 rounded hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-1 focus-visible:opacity-100"
                      aria-label={`${t('project.deleteProject')}: ${project.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-error" />
                    </button>
                  </div>
                </div>
              );
            })}
            {projects.length === 0 && (
              <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400 space-y-2">
                <p>{t('project.noProjects')}</p>
                <button
                  onClick={() => {
                    onNewProject();
                    handleNavigate();
                  }}
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {t('project.addProject')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
