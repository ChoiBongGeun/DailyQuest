'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Plus, Search, X, Trash2, ListChecks } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { Sidebar, type DashboardView } from '@/components/organisms/Sidebar';
import { StatsCard } from '@/components/molecules/StatsCard';
import { TaskItem } from '@/components/molecules/TaskItem';
import { TaskModal } from '@/components/organisms/TaskModal';
import { ProjectModal } from '@/components/organisms/ProjectModal';
import { ConfirmModal } from '@/components/molecules/ConfirmModal';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { useTaskSearch, useSetTaskComplete, useDeleteTask } from '@/hooks/use-tasks';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useDeleteProject, useProjects } from '@/hooks/use-projects';
import { useTaskReminder } from '@/hooks/use-task-reminder';
import { extractErrorMessage } from '@/lib/api/response';
import type { Project, Task, TaskSearchScope } from '@/types';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

type TaskStatusFilter = 'ALL' | 'ACTIVE' | 'COMPLETED';
type TaskPriorityFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
type TaskSortOption = 'createdDesc' | 'dueDateAsc' | 'dueDateDesc' | 'priorityDesc' | 'titleAsc';

export default function Page() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentView, setCurrentView] = React.useState<DashboardView>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = React.useState<number>();
  const [showTaskModal, setShowTaskModal] = React.useState(false);
  const [showProjectModal, setShowProjectModal] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<TaskStatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = React.useState<TaskPriorityFilter>('ALL');
  const [sortOption, setSortOption] = React.useState<TaskSortOption>('createdDesc');
  const [page, setPage] = React.useState(0);
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<Set<number>>(new Set());
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const pageSize = 20;

  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: projects } = useProjects();

  useTaskReminder();

  const setTaskComplete = useSetTaskComplete();
  const deleteTask = useDeleteTask();
  const deleteProject = useDeleteProject();
  const addToast = useUIStore((state) => state.addToast);

  const scope: TaskSearchScope = React.useMemo(() => {
    if (currentView === 'today') return 'today';
    if (currentView === 'week') return 'week';
    if (currentView === 'projects') return selectedProjectId ? 'projects' : 'all';
    return 'all';
  }, [currentView, selectedProjectId]);

  const searchParams = React.useMemo(() => {
    const isCompleted =
      statusFilter === 'ALL' ? undefined : statusFilter === 'COMPLETED';

    const sortMapping: Record<TaskSortOption, { sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title'; sortDir: 'asc' | 'desc' }> = {
      createdDesc: { sortBy: 'createdAt', sortDir: 'desc' },
      dueDateAsc: { sortBy: 'dueDate', sortDir: 'asc' },
      dueDateDesc: { sortBy: 'dueDate', sortDir: 'desc' },
      priorityDesc: { sortBy: 'priority', sortDir: 'desc' },
      titleAsc: { sortBy: 'title', sortDir: 'asc' },
    };

    return {
      scope,
      keyword: searchKeyword.trim() || undefined,
      projectId: scope === 'projects' ? selectedProjectId : undefined,
      priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
      isCompleted,
      sortBy: sortMapping[sortOption].sortBy,
      sortDir: sortMapping[sortOption].sortDir,
      page,
      size: pageSize,
    };
  }, [scope, searchKeyword, selectedProjectId, priorityFilter, statusFilter, sortOption, page]);

  const searchQuery = useTaskSearch(searchParams);

  React.useEffect(() => {
    setPage(0);
  }, [scope, selectedProjectId, searchKeyword, statusFilter, priorityFilter, sortOption]);

  const handleToggle = async (task: Task) => {
    try {
      await setTaskComplete.mutateAsync({
        id: task.id,
        isCompleted: !task.isCompleted,
      });
    } catch (error) {
      addToast(extractErrorMessage(error, t('error.generic')), 'error');
    }
  };

  const handleDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: t('task.deleteTask'),
      message: t('task.deleteConfirm'),
      onConfirm: async () => {
        try {
          await deleteTask.mutateAsync(id);
          addToast(t('success.taskDeleted'), 'success');
        } catch (error) {
          addToast(extractErrorMessage(error, t('error.generic')), 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const openCreateProjectModal = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const openEditProjectModal = (project: Project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProject = (project: Project) => {
    setConfirmModal({
      isOpen: true,
      title: t('project.deleteProject'),
      message: t('project.deleteProjectConfirm', { name: project.name }),
      onConfirm: async () => {
        try {
          await deleteProject.mutateAsync(project.id);
          addToast(t('success.projectDeleted'), 'success');
          if (selectedProjectId === project.id) {
            setSelectedProjectId(undefined);
            setCurrentView('all');
          }
        } catch (error) {
          addToast(extractErrorMessage(error, t('error.generic')), 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
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

  const tasks = searchQuery.data?.content || [];
  const totalElements = searchQuery.data?.totalElements || 0;
  const totalPages = searchQuery.data?.totalPages || 0;
  const visibleTaskIds = React.useMemo(() => tasks.map((task) => task.id), [tasks]);
  const selectedTasks = React.useMemo(
    () => tasks.filter((task) => selectedTaskIds.has(task.id)),
    [tasks, selectedTaskIds]
  );
  const selectedCount = selectedTaskIds.size;
  const allVisibleSelected =
    visibleTaskIds.length > 0 && visibleTaskIds.every((taskId) => selectedTaskIds.has(taskId));

  React.useEffect(() => {
    setSelectedTaskIds((prev) => {
      const visible = new Set(visibleTaskIds);
      const next = new Set([...prev].filter((taskId) => visible.has(taskId)));
      return next.size === prev.size ? prev : next;
    });
  }, [visibleTaskIds]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key.toLowerCase() === 'n' && !isTyping) {
        event.preventDefault();
        openCreateModal();
      }

      if (event.key === 'Escape') {
        setIsSelectionMode(false);
        setSelectedTaskIds(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTask = (taskId: number, selected: boolean) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  };

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedTaskIds(new Set());
  };

  const handleSelectAllVisible = () => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleTaskIds.forEach((taskId) => next.delete(taskId));
      } else {
        visibleTaskIds.forEach((taskId) => next.add(taskId));
      }
      return next;
    });
  };

  const handleBulkComplete = async () => {
    const targets = selectedTasks.filter((task) => !task.isCompleted);
    if (!targets.length) return;

    try {
      await Promise.all(
        targets.map((task) =>
          setTaskComplete.mutateAsync({
            id: task.id,
            isCompleted: true,
          })
        )
      );
      addToast(t('task.bulkCompleteSuccess', { count: targets.length }), 'success');
      exitSelectionMode();
    } catch (error) {
      addToast(extractErrorMessage(error, t('error.generic')), 'error');
    }
  };

  const handleBulkDelete = () => {
    if (!selectedCount) return;

    setConfirmModal({
      isOpen: true,
      title: t('task.bulkDelete'),
      message: t('task.bulkDeleteConfirm', { count: selectedCount }),
      onConfirm: async () => {
        try {
          await Promise.all([...selectedTaskIds].map((id) => deleteTask.mutateAsync(id)));
          addToast(t('task.bulkDeleteSuccess', { count: selectedCount }), 'success');
          exitSelectionMode();
        } catch (error) {
          addToast(extractErrorMessage(error, t('error.generic')), 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const statusFilterOptions = [
    { value: 'ALL', label: t('task.filterStatusAll') },
    { value: 'ACTIVE', label: t('task.filterStatusActive') },
    { value: 'COMPLETED', label: t('task.filterStatusCompleted') },
  ];

  const priorityFilterOptions = [
    { value: 'ALL', label: t('common.all') },
    { value: 'HIGH', label: t('task.high') },
    { value: 'MEDIUM', label: t('task.medium') },
    { value: 'LOW', label: t('task.low') },
  ];

  const sortOptions = [
    { value: 'createdDesc', label: t('task.sortCreatedDesc') },
    { value: 'dueDateAsc', label: t('task.sortDueDateAsc') },
    { value: 'dueDateDesc', label: t('task.sortDueDateDesc') },
    { value: 'priorityDesc', label: t('task.sortPriorityDesc') },
    { value: 'titleAsc', label: t('task.sortTitleAsc') },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <Header />
      <div className="flex">
        <div
          className={cn(
            'fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity',
            isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
        <div
          className={cn(
            'fixed left-0 top-16 bottom-0 z-40 lg:hidden transition-transform',
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar
            currentView={currentView}
            selectedProjectId={selectedProjectId}
            projects={projects}
            stats={stats ? { todayTasks: stats.todayTasks, weekTasks: stats.weekTasks } : undefined}
            onViewChange={setCurrentView}
            onSelectProject={handleSelectProject}
            onNewTask={openCreateModal}
            onNewProject={openCreateProjectModal}
            onEditProject={openEditProjectModal}
            onDeleteProject={handleDeleteProject}
            isMobile
            onNavigate={() => setIsMobileSidebarOpen(false)}
          />
        </div>

        <div className="hidden lg:block">
          <Sidebar
            currentView={currentView}
            selectedProjectId={selectedProjectId}
            projects={projects}
            stats={stats ? { todayTasks: stats.todayTasks, weekTasks: stats.weekTasks } : undefined}
            onViewChange={setCurrentView}
            onSelectProject={handleSelectProject}
            onNewTask={openCreateModal}
            onNewProject={openCreateProjectModal}
            onEditProject={openEditProjectModal}
            onDeleteProject={handleDeleteProject}
          />
        </div>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="container-custom max-w-7xl">
            <div className="mb-8">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h1 className="heading-2 text-neutral-900 dark:text-neutral-100">{t('dashboard.title')}</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden"
                >
                  {t('common.menu')}
                </Button>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">{t('dashboard.welcome')} 🚀</p>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-32 rounded-xl" />
                ))}
              </div>
            ) : statsError ? (
              <Card padding="lg" className="border-error/20 mb-8">
                <div className="text-center py-4">
                  <AlertCircle className="w-10 h-10 text-error mx-auto mb-3" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('error.generic')}</p>
                </div>
              </Card>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title={t('dashboard.completed')} value={stats.completedTasks} icon={CheckCircle2} color="success" />
                <StatsCard title={t('dashboard.pending')} value={stats.pendingTasks} icon={Clock} color="primary" />
                <StatsCard title={t('dashboard.overdue')} value={stats.overdueTasks} icon={AlertCircle} color="danger" />
                <StatsCard title={t('dashboard.completionRate')} value={`${stats.completionRate}%`} icon={TrendingUp} color="warning" />
              </div>
            ) : null}

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="heading-3 text-neutral-900 dark:text-neutral-100">{getTaskTitle()}</h2>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {currentView === 'projects' && selectedProjectId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/projects/${selectedProjectId}`)}
                    >
                      {t('project.viewDetail')}
                    </Button>
                  )}
                  {tasks.length > 0 && (
                    <Button
                      variant={isSelectionMode ? 'secondary' : 'outline'}
                      size="sm"
                      leftIcon={<ListChecks className="w-4 h-4" />}
                      onClick={isSelectionMode ? exitSelectionMode : enterSelectionMode}
                    >
                      {isSelectionMode ? t('common.cancel') : t('task.selectTask')}
                    </Button>
                  )}
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

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                <Input
                  ref={searchInputRef}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder={t('task.searchPlaceholder')}
                  leftIcon={<Search className="w-4 h-4" />}
                  rightIcon={
                    searchKeyword ? (
                      <button
                        onClick={() => setSearchKeyword('')}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                        aria-label={t('common.clear')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : undefined
                  }
                  fullWidth
                  className="lg:col-span-2"
                />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TaskStatusFilter)}
                  options={statusFilterOptions}
                />
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
                  <Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as TaskPriorityFilter)}
                    options={priorityFilterOptions}
                  />
                  <Select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as TaskSortOption)}
                    options={sortOptions}
                  />
                </div>
              </div>

              {tasks.length > 0 && isSelectionMode && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2">
                  <label className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={handleSelectAllVisible}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    {selectedCount > 0
                      ? t('task.selectedCount', { count: selectedCount })
                      : t('task.selectVisible')}
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkComplete}
                      disabled={selectedTasks.every((task) => task.isCompleted)}
                    >
                      {t('task.bulkComplete')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={handleBulkDelete}
                      disabled={selectedCount === 0}
                    >
                      {t('task.bulkDelete')}
                    </Button>
                  </div>
                </div>
              )}

              {searchQuery.isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-24 rounded-lg" />
                  ))}
                </div>
              ) : searchQuery.error ? (
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
                      isSelected={selectedTaskIds.has(task.id)}
                      onSelect={isSelectionMode ? handleSelectTask : undefined}
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
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      {(searchKeyword || statusFilter !== 'ALL' || priorityFilter !== 'ALL') ? t('task.noFilteredTasks') : t('task.noTasksDesc')}
                    </p>
                    <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
                      {t('task.addTask')}
                    </Button>
                  </div>
                </Card>
              )}

              {totalElements > 0 && totalPages > 1 && (() => {
                const getPageNumbers = (current: number, total: number): (number | '...')[] => {
                  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
                  const pages: (number | '...')[] = [];
                  const left = Math.max(1, current - 1);
                  const right = Math.min(total - 2, current + 1);
                  pages.push(0);
                  if (left > 1) pages.push('...');
                  for (let i = left; i <= right; i++) pages.push(i);
                  if (right < total - 2) pages.push('...');
                  pages.push(total - 1);
                  return pages;
                };
                const pageNumbers = getPageNumbers(page, totalPages);
                return (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t('task.paginationSummary', {
                        current: page + 1,
                        total: Math.max(totalPages, 1),
                        totalElements,
                      })}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                        disabled={!searchQuery.data?.hasPrevious}
                      >
                        {t('common.previous')}
                      </Button>
                      {pageNumbers.map((p, idx) =>
                        p === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-neutral-400 dark:text-neutral-500 text-sm select-none">
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            aria-current={p === page ? 'page' : undefined}
                            className={cn(
                              'min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors',
                              p === page
                                ? 'bg-primary-600 text-white'
                                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            )}
                          >
                            {p + 1}
                          </button>
                        )
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={!searchQuery.data?.hasNext}
                      >
                        {t('common.next')}
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {stats && (() => {
                const weekCompletionRate = stats.weekTasks > 0
                  ? Math.round((stats.weekCompleted / stats.weekTasks) * 100)
                  : 0;
                return (
                  <Card>
                    <h3 className="heading-4 text-neutral-900 dark:text-neutral-100 mb-4">{t('dashboard.weekSummary')}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-700 dark:text-neutral-300">{t('dashboard.totalTasks')}</span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">{t('dashboard.weekTaskCount', { count: stats.weekTasks })}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-700 dark:text-neutral-300">{t('dashboard.completionRate')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className="h-full gradient-primary rounded-full transition-all"
                              style={{ width: `${weekCompletionRate}%` }}
                            />
                          </div>
                          <span className="font-semibold text-primary-600 dark:text-primary-400">
                            {weekCompletionRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })()}
            </div>
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        editingTask={editingTask}
      />
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProject(null);
        }}
        editingProject={editingProject}
        onCreated={() => setCurrentView('projects')}
        onUpdated={() => setCurrentView('projects')}
      />
    </div>
  );
}
