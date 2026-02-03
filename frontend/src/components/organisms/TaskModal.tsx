'use client';

import React from 'react';
import { Bell, Minus, Plus, X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { useCreateTask, useUpdateTask } from '@/hooks/use-tasks';
import { useCreateProject, useProjects } from '@/hooks/use-projects';
import type { Priority, Task } from '@/types';
import { extractErrorMessage } from '@/lib/api/response';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask?: Task | null;
}

interface TaskFormData {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  dueTime?: string;
  reminderOffsets: number[];
  useDefaultReminder: boolean;
  projectId?: number;
}

const EMPTY_FORM: TaskFormData = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
  dueTime: '',
  reminderOffsets: [],
  useDefaultReminder: true,
  projectId: undefined,
};

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, editingTask }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = React.useState<TaskFormData>(EMPTY_FORM);
  const [isCreatingProject, setIsCreatingProject] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState('');
  const [newProjectColor, setNewProjectColor] = React.useState('#3B82F6');
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const createProject = useCreateProject();
  const { data: projects } = useProjects();
  const defaultReminderOffsets = useUIStore((state) => state.reminderOffsets);
  const addToast = useUIStore((state) => state.addToast);
  const [newReminderMinutes, setNewReminderMinutes] = React.useState('');

  React.useEffect(() => {
    if (!editingTask) {
      setFormData(EMPTY_FORM);
      setNewReminderMinutes('');
      setIsCreatingProject(false);
      setNewProjectName('');
      setNewProjectColor('#3B82F6');
      return;
    }

    const customReminderOffsets = editingTask.reminderOffsets ?? [];
    setFormData({
      title: editingTask.title,
      description: editingTask.description || '',
      priority: editingTask.priority,
      dueDate: editingTask.dueDate || '',
      dueTime: editingTask.dueTime || '',
      reminderOffsets: customReminderOffsets,
      useDefaultReminder: editingTask.reminderOffsets == null,
      projectId: editingTask.projectId,
    });
    setNewReminderMinutes('');
  }, [editingTask]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const created = await createProject.mutateAsync({
        name: newProjectName.trim(),
        color: newProjectColor,
      });

      setFormData((prev) => ({ ...prev, projectId: created.id }));
      setNewProjectName('');
      setNewProjectColor('#3B82F6');
      setIsCreatingProject(false);
    } catch (error) {
      addToast(extractErrorMessage(error, t('error.generic')), 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      dueTime: formData.dueTime || undefined,
      reminderOffsets: editingTask
        ? formData.useDefaultReminder
          ? []
          : formData.reminderOffsets
        : formData.useDefaultReminder
          ? null
          : formData.reminderOffsets,
      projectId: formData.projectId,
    };

    try {
      if (editingTask) {
        await updateTask.mutateAsync({ id: editingTask.id, data: payload });
        addToast(t('success.taskUpdated'), 'success');
      } else {
        await createTask.mutateAsync(payload);
        addToast(t('success.taskCreated'), 'success');
      }

      setFormData(EMPTY_FORM);
      onClose();
    } catch (error) {
      addToast(extractErrorMessage(error, t('error.generic')), 'error');
    }
  };

  if (!isOpen) return null;

  const formatReminderOffset = (minutes: number) => {
    if (minutes >= 60 && minutes % 60 === 0) {
      return `${minutes / 60}${t('task.hourBefore')}`;
    }
    return `${minutes}${t('task.minutesBefore')}`;
  };

  const addReminderOffset = () => {
    const minutes = Number.parseInt(newReminderMinutes, 10);
    if (Number.isNaN(minutes) || minutes <= 0 || minutes > 1440) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      reminderOffsets: [...new Set([...prev.reminderOffsets, minutes])].sort((a, b) => b - a),
    }));
    setNewReminderMinutes('');
  };

  const removeReminderOffset = (offset: number) => {
    setFormData((prev) => ({
      ...prev,
      reminderOffsets: prev.reminderOffsets.filter((value) => value !== offset),
    }));
  };

  const priorityOptions: Array<{ value: Priority; label: string }> = [
    { value: 'HIGH', label: t('task.high') },
    { value: 'MEDIUM', label: t('task.medium') },
    { value: 'LOW', label: t('task.low') },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-lg max-h-[92vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {editingTask ? t('task.editTask') : t('task.newTask')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-76px)]">
            <Input
              label={t('task.taskTitle')}
              placeholder={t('task.title')}
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
              fullWidth
            />

            <Textarea
              label={t('task.taskDescription')}
              placeholder={t('common.optional')}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              fullWidth
            />

            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{t('task.priority')}</p>
              <div className="grid grid-cols-3 gap-2">
                {priorityOptions.map((option) => {
                  const isActive = formData.priority === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, priority: option.value }))}
                      className={`px-2.5 sm:px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition ${
                        isActive
                          ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{t('task.project')}</p>
                <button
                  type="button"
                  onClick={() => setIsCreatingProject((prev) => !prev)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {t('project.addProject')}
                </button>
              </div>

              {isCreatingProject && (
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 space-y-2 bg-neutral-50 dark:bg-neutral-800/60">
                  <Input
                    placeholder={t('project.projectName')}
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    fullWidth
                  />
                  <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newProjectColor}
                        onChange={(e) => setNewProjectColor(e.target.value)}
                        className="w-10 h-9 p-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                      />
                      <Input
                        value={newProjectColor}
                        onChange={(e) => setNewProjectColor(e.target.value)}
                        placeholder="#3B82F6"
                        className="text-sm"
                        fullWidth
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="w-full sm:w-auto sm:min-w-[72px] whitespace-nowrap text-sm"
                      onClick={handleCreateProject}
                      isLoading={createProject.isPending}
                    >
                      {t('common.save')}
                    </Button>
                  </div>
                </div>
              )}

              <div className="max-h-36 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700 p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, projectId: undefined }))}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                    !formData.projectId
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  {t('common.all')}
                </button>
                {(projects || []).map((project) => {
                  const isActive = formData.projectId === project.id;
                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          projectId: project.id,
                        }))
                      }
                      className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color || '#3B82F6' }}
                      />
                      <span className="truncate">{project.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('task.dueDate')}
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                fullWidth
              />
              <Input
                label={t('task.dueTime')}
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueTime: e.target.value }))}
                fullWidth
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{t('task.reminderTitle')}</p>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      useDefaultReminder: !prev.useDefaultReminder,
                      reminderOffsets:
                        !prev.useDefaultReminder || prev.reminderOffsets.length
                          ? prev.reminderOffsets
                          : [...defaultReminderOffsets],
                    }))
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    formData.useDefaultReminder
                      ? 'border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300'
                      : 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  {formData.useDefaultReminder ? t('task.useDefaultReminder') : t('task.customReminder')}
                </button>
              </div>

              {!formData.useDefaultReminder && (
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 space-y-3 bg-neutral-50 dark:bg-neutral-800/60">
                  <div className="flex flex-wrap gap-2">
                    {formData.reminderOffsets.map((offset) => (
                      <div
                        key={offset}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                      >
                        <span>{formatReminderOffset(offset)}</span>
                        <button
                          type="button"
                          onClick={() => removeReminderOffset(offset)}
                          className="p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="30"
                      value={newReminderMinutes}
                      onChange={(e) => setNewReminderMinutes(e.target.value)}
                      className="w-24"
                      min={1}
                      max={1440}
                    />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t('task.minutesBefore')}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addReminderOffset}
                      disabled={!newReminderMinutes}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {t('task.addReminder')}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button type="button" variant="outline" fullWidth onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={createTask.isPending || updateTask.isPending}
              >
                {editingTask ? t('common.edit') : t('common.submit')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
