'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { Select } from '../atoms/Select';
import { useCreateTask, useUpdateTask } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import type { Priority, Task } from '@/types';
import { extractErrorMessage } from '@/lib/api/response';
import { useTranslation } from 'react-i18next';

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
  projectId?: number;
}

const EMPTY_FORM: TaskFormData = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
  projectId: undefined,
};

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, editingTask }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = React.useState<TaskFormData>(EMPTY_FORM);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: projects } = useProjects();

  React.useEffect(() => {
    if (!editingTask) {
      setFormData(EMPTY_FORM);
      return;
    }

    setFormData({
      title: editingTask.title,
      description: editingTask.description || '',
      priority: editingTask.priority,
      dueDate: editingTask.dueDate || '',
      projectId: editingTask.projectId,
    });
  }, [editingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      projectId: formData.projectId,
    };

    try {
      if (editingTask) {
        await updateTask.mutateAsync({ id: editingTask.id, data: payload });
      } else {
        await createTask.mutateAsync(payload);
      }

      setFormData(EMPTY_FORM);
      onClose();
    } catch (error) {
      alert(extractErrorMessage(error, t('error.generic')));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
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

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Select
              label={t('task.priority')}
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: e.target.value as Priority }))
              }
              options={[
                { value: 'HIGH', label: t('task.high') },
                { value: 'MEDIUM', label: t('task.medium') },
                { value: 'LOW', label: t('task.low') },
              ]}
              fullWidth
            />

            <Select
              label={t('task.project')}
              value={formData.projectId ? String(formData.projectId) : ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  projectId: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              options={[
                { value: '', label: t('common.all') },
                ...(projects || []).map((project) => ({
                  value: String(project.id),
                  label: project.name,
                })),
              ]}
              fullWidth
            />

            <Input
              label={t('task.dueDate')}
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              fullWidth
            />

            <div className="flex gap-3 pt-4">
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
