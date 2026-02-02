'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Plus, Filter } from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { Sidebar, type DashboardView } from '@/components/organisms/Sidebar';
import { StatsCard } from '@/components/molecules/StatsCard';
import { TaskItem } from '@/components/molecules/TaskItem';
import { TaskModal } from '@/components/organisms/TaskModal';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import {
  useTasks,
  useTodayTasks,
  useWeekTasks,
  useTasksByProject,
  useSetTaskComplete,
  useDeleteTask,
} from '@/hooks/use-tasks';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useProjects } from '@/hooks/use-projects';
import { extractErrorMessage } from '@/lib/api/response';
import type { Task } from '@/types';
import { useTranslation } from 'react-i18next';

type TaskQueryResult = {
  data: Task[] | undefined;
  isLoading: boolean;
  error: unknown;
};

export default function Page() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = React.useState<DashboardView>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = React.useState<number>();
  const [showTaskModal, setShowTaskModal] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: projects } = useProjects();

  const allTasksQuery = useTasks();
  const todayTasksQuery = useTodayTasks();
  const weekTasksQuery = useWeekTasks();
  const projectTasksQuery = useTasksByProject(selectedProjectId);

  const setTaskComplete = useSetTaskComplete();
  const deleteTask = useDeleteTask();

  const activeTaskQuery: TaskQueryResult = React.useMemo(() => {
    if (currentView === 'all' || currentView === 'dashboard') return allTasksQuery;
    if (currentView === 'today') return todayTasksQuery;
    if (currentView === 'week') return weekTasksQuery;
    if (currentView === 'projects') return projectTasksQuery;
    return allTasksQuery;
  }, [currentView, allTasksQuery, todayTasksQuery, weekTasksQuery, projectTasksQuery]);

  const handleToggle = async (task: Task) => {
    try {
      await setTaskComplete.mutateAsync({
        id: task.id,
        isCompleted: !task.isCompleted,
      });
    } catch (error) {
      alert(extractErrorMessage(error, '할 일 상태 변경에 실패했습니다.'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteTask.mutateAsync(id);
    } catch (error) {
      alert(extractErrorMessage(error, '할 일 삭제에 실패했습니다.'));
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleSelectProject = (projectId: number) => {
    setSelectedProjectId(projectId);
    setCurrentView('projects');
  };

  const getTaskTitle = () => {
    switch (currentView) {
      case 'today':
        return t('task.todayTasks');
      case 'week':
        return t('task.weekTasks');
      case 'projects':
        return selectedProjectId
          ? `${projects?.find((p) => p.id === selectedProjectId)?.name || t('task.project')} ${t('task.title')}`
          : `${t('task.project')} ${t('task.title')}`;
      default:
        return t('nav.all');
    }
  };

  const tasks = activeTaskQuery.data || [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <Header />
      <div className="flex">
        <Sidebar
          currentView={currentView}
          selectedProjectId={selectedProjectId}
          projects={projects}
          onViewChange={setCurrentView}
          onSelectProject={handleSelectProject}
          onNewTask={openCreateModal}
        />

        <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="container-custom max-w-7xl">
            <div className="mb-8">
              <h1 className="heading-2 text-neutral-900 dark:text-neutral-100 mb-2">{t('dashboard.title')}</h1>
              <p className="text-neutral-600 dark:text-neutral-400">{t('dashboard.welcome')} 🚀</p>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-32 rounded-xl" />
                ))}
              </div>
            ) : statsError ? (
              <div className="bg-error-light dark:bg-error/20 border border-error/20 text-error dark:text-error-light p-4 rounded-lg mb-8">
                {t('error.generic')}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title={t('dashboard.completed')} value={stats.completedTasks} icon={CheckCircle2} color="success" />
                <StatsCard title={t('dashboard.pending')} value={stats.pendingTasks} icon={Clock} color="primary" />
                <StatsCard title={t('dashboard.overdue')} value={stats.overdueTasks} icon={AlertCircle} color="danger" />
                <StatsCard title={t('dashboard.completionRate')} value={`${stats.completionRate}%`} icon={TrendingUp} color="warning" />
              </div>
            ) : null}

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="heading-3 text-neutral-900 dark:text-neutral-100">{getTaskTitle()}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />} disabled>
                    {t('common.filter')}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={openCreateModal}
                  >
                    {t('task.newTask')}
                  </Button>
                </div>
              </div>

              {activeTaskQuery.isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-24 rounded-lg" />
                  ))}
                </div>
              ) : activeTaskQuery.error ? (
                <Card padding="lg" className="border-error/20">
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
                    <h3 className="heading-4 text-neutral-900 dark:text-neutral-100 mb-2">
                      {t('error.generic')}
                    </h3>
                  </div>
                </Card>
              ) : tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <Card padding="lg">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="heading-4 text-neutral-900 dark:text-neutral-100 mb-2">{t('task.noTasks')}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">{t('task.noTasksDesc')}</p>
                    <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
                      {t('task.addTask')}
                    </Button>
                  </div>
                </Card>
              )}

              {stats && (
                <Card>
                  <h3 className="heading-4 text-neutral-900 dark:text-neutral-100 mb-4">{t('dashboard.weekSummary')}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-700 dark:text-neutral-300">{t('dashboard.totalTasks')}</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">{stats.weekTasks}개</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-700 dark:text-neutral-300">{t('dashboard.completionRate')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-primary rounded-full transition-all"
                            style={{ width: `${stats.completionRate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                          {stats.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        editingTask={editingTask}
      />
    </div>
  );
}
