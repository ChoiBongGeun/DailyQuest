import React from 'react';
import { cn, calculateDDay, getPriorityLabel, getPriorityColor } from '@/lib/utils';
import { Checkbox } from '../atoms/Checkbox';
import { Badge } from '../atoms/Badge';
import { Calendar, MoreVertical, Repeat } from 'lucide-react';
import type { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const priorityColor = getPriorityColor(task.priority);
  const priorityLabel = getPriorityLabel(task.priority);

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 transition-all duration-200',
        'hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700',
        task.isCompleted && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-0.5">
          <Checkbox
            checked={task.isCompleted}
            onChange={() => onToggle(task)}
          />
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
                    <span>반복</span>
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
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 min-w-[120px]">
                    <button
                      onClick={() => {
                        onEdit(task);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => {
                        onDelete(task.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error-light dark:hover:bg-error/20 transition-colors"
                    >
                      삭제
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
