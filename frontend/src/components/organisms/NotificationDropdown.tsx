'use client';

import React from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTodayTasks, useWeekTasks } from '@/hooks/use-tasks';
import type { Task } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'overdue' | 'dueSoon' | 'completed';
  task: Task;
  message: string;
}

export const NotificationDropdown: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const { data: todayTasks } = useTodayTasks();
  const { data: weekTasks } = useWeekTasks();

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = React.useMemo(() => {
    const items: Notification[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const allTasks = [...(todayTasks || []), ...(weekTasks || [])];
    const seen = new Set<number>();

    for (const task of allTasks) {
      if (seen.has(task.id)) continue;
      seen.add(task.id);

      if (task.isCompleted && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const hoursDiff = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60);
        if (hoursDiff < 24) {
          items.push({
            id: `completed-${task.id}`,
            type: 'completed',
            task,
            message: `"${task.title}" ${t('notifications.taskCompleted')}`,
          });
        }
        continue;
      }

      if (!task.dueDate || task.isCompleted) continue;

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < now) {
        items.push({
          id: `overdue-${task.id}`,
          type: 'overdue',
          task,
          message: `"${task.title}" ${t('notifications.taskOverdue')}`,
        });
      } else {
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 1) {
          items.push({
            id: `dueSoon-${task.id}`,
            type: 'dueSoon',
            task,
            message: `"${task.title}" ${t('notifications.taskDueSoon')}`,
          });
        }
      }
    }

    return items
      .filter((n) => !dismissed.has(n.id))
      .sort((a, b) => {
        const priority = { overdue: 0, dueSoon: 1, completed: 2 };
        return priority[a.type] - priority[b.type];
      });
  }, [todayTasks, weekTasks, dismissed, t]);

  const unreadCount = notifications.length;

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  const handleClearAll = () => {
    setDismissed(new Set(notifications.map((n) => n.id)));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'dueSoon':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'overdue':
        return 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30';
      case 'dueSoon':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30';
      case 'completed':
        return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
        aria-label={t('nav.notifications')}
      >
        <Bell className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              {t('notifications.title')}
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                {t('notifications.clearAll')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {t('notifications.empty')}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1.5">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${getBgColor(notification.type)}`}
                  >
                    <div className="mt-0.5 shrink-0">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-snug">
                        {notification.message}
                      </p>
                      {notification.task.dueDate && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {notification.task.dueDate}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDismiss(notification.id)}
                      className="shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"
                    >
                      <X className="w-3.5 h-3.5 text-neutral-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
