import React from 'react';
import { cn, calculateDDay, getPriorityLabel, getPriorityColor } from '@/lib/utils';
import { Checkbox } from '../atoms/Checkbox';
import { Badge } from '../atoms/Badge';
import { Calendar, CheckCircle2, Circle, MoreVertical, Repeat } from 'lucide-react';
import type { Task } from '@/types';
import { useTranslation } from 'react-i18next';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  isSelected?: boolean;
  onSelect?: (taskId: number, selected: boolean) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect,
}) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = React.useState(false);

  React.useEffect(() => {
    if (!showMenu) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMenu(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMenu]);

  const priorityColor = getPriorityColor(task.priority);
  const priorityLabel = getPriorityLabel(task.priority);

  const priorityBorderClass = {
    HIGH: 'border-l-red-500 dark:border-l-red-500',
    MEDIUM: 'border-l-orange-400 dark:border-l-orange-400',
    LOW: 'border-l-green-500 dark:border-l-green-500',
  }[task.priority] ?? 'border-l-neutral-200 dark:border-l-neutral-800';

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 transition-all duration-200',
        'hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700',
        'border-l-4',
        priorityBorderClass,
        isSelected && 'bg-primary-50/60 ring-2 ring-primary-500/20 dark:bg-primary-900/10',
        task.isCompleted && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* 완료 상태 버튼: 선택 체크박스와 구분되도록 원형 아이콘 사용 */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => onToggle(task)}
            aria-pressed={task.isCompleted}
            aria-label={task.isCompleted ? t('task.markIncomplete') : t('task.completeTask')}
            title={task.isCompleted ? t('task.markIncomplete') : t('task.completeTask')}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900',
              task.isCompleted
                ? 'bg-success text-white hover:bg-success/90 focus:ring-success'
                : 'border-2 border-neutral-300 bg-white text-neutral-400 hover:border-success hover:text-success focus:ring-success dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-500'
            )}
          >
            {task.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={cn(
                  'text-base font-medium text-neutral-900 dark:text-neutral-100 mb-1',
                  task.isCompleted && 'line-through text-neutral-500 dark:text-neutral-500'
                )}
              >
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Priority Badge */}
                <Badge variant={priorityColor as any} size="sm">
                  {priorityLabel}
                </Badge>

                {/* Due Date */}
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{calculateDDay(task.dueDate)}</span>
                  </div>
                )}

                {/* Recurring Icon */}
                {task.isRecurring && (
                  <div className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                    <Repeat className="w-3.5 h-3.5" />
                    <span>{t('task.recurring')}</span>
                  </div>
                )}

                {/* Project */}
                {task.projectName && (
                  <Badge variant="default" size="sm">
                    {task.projectName}
                  </Badge>
                )}
              </div>
            </div>

            {/* Menu Button */}
            <div className="relative flex items-start gap-2">
              {onSelect && (
                <div className="pt-1">
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => onSelect(task.id, e.target.checked)}
                    aria-label={`${task.title} ${t('task.selectTask')}`}
                    className="h-4 w-4 rounded border-neutral-400 dark:border-neutral-500 peer-checked:bg-primary-600 peer-checked:border-primary-600 group-hover:border-primary-500"
                  />
                </div>
              )}
              <button
                onClick={() => setShowMenu(!showMenu)}
                aria-label={t('common.more')}
                aria-expanded={showMenu}
                aria-haspopup="true"
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <MoreVertical className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-50 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 min-w-[120px]">
                    <button
                      onClick={() => {
                        onEdit(task);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => {
                        onDelete(task.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error-light dark:hover:bg-error/20 transition-colors"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
