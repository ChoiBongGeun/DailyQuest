'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useCreateProject, useUpdateProject } from '@/hooks/use-projects';
import { useUIStore } from '@/stores/ui-store';
import { extractErrorMessage } from '@/lib/api/response';
import { useTranslation } from 'react-i18next';
import type { Project } from '@/types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject?: Project | null;
  onCreated?: () => void;
  onUpdated?: () => void;
}

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  editingProject,
  onCreated,
  onUpdated,
}) => {
  const { t } = useTranslation();
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState(DEFAULT_COLORS[0]);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const addToast = useUIStore((state) => state.addToast);
  const isEditMode = !!editingProject;

  React.useEffect(() => {
    if (!isOpen) return;
    if (editingProject) {
      setName(editingProject.name);
      setColor(editingProject.color || DEFAULT_COLORS[0]);
      return;
    }
    setName('');
    setColor(DEFAULT_COLORS[0]);
  }, [isOpen, editingProject]);

  const handleClose = () => {
    if (createProject.isPending || updateProject.isPending) return;
    setName('');
    setColor(DEFAULT_COLORS[0]);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (isEditMode && editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id,
          data: {
            name: name.trim(),
            color,
          },
        });
        addToast(t('success.projectUpdated'), 'success');
        onUpdated?.();
      } else {
        await createProject.mutateAsync({
          name: name.trim(),
          color,
        });
        addToast(t('success.projectCreated'), 'success');
        onCreated?.();
      }
      handleClose();
    } catch (error) {
      addToast(extractErrorMessage(error, t('error.generic')), 'error');
    }
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={handleClose} />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <div className="w-full max-w-md max-h-[92vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
            <h2 id="project-modal-title" className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {isEditMode ? t('project.editProject') : t('project.addProject')}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500 dark:text-neutral-300" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-76px)]">
            <Input
              label={t('project.projectName')}
              placeholder={`${t('common.optional')}: ${t('project.personal')}, ${t('project.work')}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />

            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{t('project.projectColor')}</p>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      color === c
                        ? 'border-neutral-900 dark:border-neutral-100 scale-110'
                        : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`color-${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button type="button" variant="outline" fullWidth onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={createProject.isPending || updateProject.isPending}
              >
                {isEditMode ? t('common.save') : t('common.submit')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
