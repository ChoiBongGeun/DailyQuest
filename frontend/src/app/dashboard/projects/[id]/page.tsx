'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock3, ListChecks, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { PROJECT_KEYS, useProject, useProjectStats } from '@/hooks/use-projects';
import { useDeleteTask, useSetTaskComplete, useTasksByProject } from '@/hooks/use-tasks';
import { useQueryClient } from '@tanstack/react-query';
import { TaskModal } from '@/components/organisms/TaskModal';
import { ConfirmModal } from '@/components/molecules/ConfirmModal';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { extractErrorMessage } from '@/lib/api/response';
import { getPriorityLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

type StatusFilter = 'ALL' | 'ACTIVE' | 'COMPLETED';

export default function ProjectDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = Number(params?.id);

  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('ALL');
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<Set<number>>(new Set());
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = React.useState(false);
  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    taskId: number | null;
  }>({ isOpen: false, taskId: null });

  const queryClient = useQueryClient();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: stats } = useProjectStats(projectId);
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useTasksByProject(projectId);
  const setTaskComplete = useSetTaskComplete();
  const deleteTask = useDeleteTask();
  const addToast = useUIStore((s) => s.addToast);

  const refreshStats = () =>
    queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.stats(projectId) });

  const safeTasks = tasks || [];

  const filteredTasks = React.useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return safeTasks.filter((task) => {
      const matchesKeyword =
        !keyword ||
        task.title.toLowerCase().includes(keyword) ||
        (task.description || '').toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' ? !task.isCompleted : task.isCompleted);
      return matchesKeyword && matchesStatus;
    });
  }, [safeTasks, searchKeyword, statusFilter]);

  const allVisibleSelected =
    filteredTasks.length > 0 &&
    filteredTasks.every((task) => selectedTaskIds.has(task.id));

  const toggleTaskSelection = (taskId: number, checked: boolean) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(taskId);
      else next.delete(taskId);
      return next;
    });
  };

  const toggleSelectAllVisible = (checked: boolean) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        filteredTasks.forEach((task) => next.add(task.id));
      } else {
        filteredTasks.forEach((task) => next.delete(task.id));
      }
      return next;
    });
  };

  const selectedTasks = safeTasks.filter((task) => selectedTaskIds.has(task.id));

  const handleBulkComplete = async () => {
    const target = selectedTasks.filter((task) => !task.isCompleted);
    if (!target.length) return;

    try {
      await Promise.all(
        target.map((task) =>
          setTaskComplete.mutateAsync({ id: task.id, isCompleted: true })
        )
      );
      addToast(t('task.bulkCompleteSuccess', { count: target.length }), 'success');
      setSelectedTaskIds(new Set());
      refreshStats();
    } catch (error) {
      addToast(extractErrorMessage(error, t('error.generic')), 'error');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask.mutateAsync(taskId);
      addToast(t('success.taskDeleted'), 'success');
      refreshStats();
    } catch (error) {
      addToast(extractErrorMessage(error, t('error.generic')), 'error');
    } finally {
      setConfirmModal({ isOpen: false, taskId: null });
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedTasks.length) return;
    if (!confirm(t('task.bulkDeleteConfirm', { count: selectedTasks.length }))) return;

    try {
      await Promise.all(selectedTasks.map((task) => deleteTask.mutateAsync(task.id)));
      addToast(t('task.bulkDeleteSuccess', { count: selectedTasks.length }), 'success');
      setSelectedTaskIds(new Set());
      refreshStats();
    } catch (error) {
      addToast(extractErrorMessage(error, t('error.generic')), 'error');
    }
  };

  const trendData = React.useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - i));
      return {
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
        created: 0,
        completed: 0,
      };
    });

    const dayMap = new Map(days.map((d) => [d.key, d]));

    for (const task of safeTasks) {
      if (task.createdAt) {
        const key = new Date(task.createdAt).toISOString().slice(0, 10);
        const day = dayMap.get(key);
        if (day) day.created += 1;
      }
      if (task.completedAt) {
        const key = new Date(task.completedAt).toISOString().slice(0, 10);
        const day = dayMap.get(key);
        if (day) day.completed += 1;
      }
    }

    return days;
  }, [safeTasks]);

  const maxTrendValue = Math.max(
    1,
    ...trendData.flatMap((d) => [d.created, d.completed])
  );

  const statusOptions = [
    { value: 'ALL', label: t('task.filterStatusAll') },
    { value: 'ACTIVE', label: t('task.filterStatusActive') },
    { value: 'COMPLETED', label: t('task.filterStatusCompleted') },
  ];

  if (!projectId || Number.isNaN(projectId)) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Header />
        <main className="p-6">
          <Card>
            <p className="text-neutral-700 dark:text-neutral-300">{t('error.notFound')}</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <Header />
      <main className="p-4 sm:p-6">
        <div className="container-custom max-w-7xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                {t('common.back')}
              </Button>
              <h1 className="heading-3 text-neutral-900 dark:text-neutral-100">
                {projectLoading ? t('common.loading') : `${project?.name || t('project.title')} · ${t('project.detailTitle')}`}
              </h1>
            </div>
            {project?.color && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                <span>{project.color}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('dashboard.totalTasks')}</p>
                <ListChecks className="w-5 h-5 text-primary-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats?.totalTasks ?? 0}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('dashboard.completed')}</p>
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats?.completedTasks ?? 0}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('dashboard.completionRate')}</p>
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats?.completionRate ?? 0}%</p>
            </Card>
          </div>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Clock3 className="w-4 h-4 text-neutral-500" />
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{t('task.trend7days')}</h2>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {trendData.map((day) => (
                <div key={day.key} className="text-center">
                  <div className="h-28 flex items-end justify-center gap-1 mb-2">
                    <div
                      className="w-2.5 rounded bg-primary-400/80"
                      style={{ height: `${(day.created / maxTrendValue) * 100}%` }}
                      title={`${t('task.created')}: ${day.created}`}
                    />
                    <div
                      className="w-2.5 rounded bg-success/80"
                      style={{ height: `${(day.completed / maxTrendValue) * 100}%` }}
                      title={`${t('task.completed')}: ${day.completed}`}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{day.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder={t('task.searchPlaceholder')}
                  fullWidth
                  className="md:col-span-2"
                />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  options={statusOptions}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-300">
                  {t('task.selectedCount', { count: selectedTaskIds.size })}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkComplete}
                  disabled={!selectedTaskIds.size}
                >
                  {t('task.bulkComplete')}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleBulkDelete}
                  disabled={!selectedTaskIds.size}
                >
                  {t('task.bulkDelete')}
                </Button>
              </div>
            </div>

            {tasksLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-14 rounded-lg" />
                ))}
              </div>
            ) : tasksError ? (
              <div className="text-sm text-error">{t('error.generic')}</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-sm text-neutral-600 dark:text-neutral-400">{t('task.noneInProject')}</div>
            ) : (
              <div className="space-y-2">
                <div className="px-2 py-1 border-b border-neutral-200 dark:border-neutral-800">
                  <Checkbox checked={allVisibleSelected} onChange={(e) => toggleSelectAllVisible(e.target.checked)} label={t('common.all')} />
                </div>
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
                  >
                    <Checkbox
                      checked={selectedTaskIds.has(task.id)}
                      onChange={(e) => toggleTaskSelection(task.id, e.target.checked)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium text-neutral-900 dark:text-neutral-100', task.isCompleted && 'line-through opacity-60')}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{task.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{getPriorityLabel(task.priority)}</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">{task.dueDate || '-'}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingTask(task); setShowTaskModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        aria-label={t('common.edit')}
                      >
                        <Pencil className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-300" />
                      </button>
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, taskId: task.id })}
                        className="p-1.5 rounded-lg hover:bg-error/10 transition-colors"
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-error" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        editingTask={editingTask}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, taskId: null })}
        onConfirm={() => confirmModal.taskId !== null && handleDeleteTask(confirmModal.taskId)}
        title={t('task.deleteTask')}
        message={t('task.deleteConfirm')}
      />
    </div>
  );
}
