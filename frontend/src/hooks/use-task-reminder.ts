'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTodayTasks, useWeekTasks } from './use-tasks';
import { useUIStore } from '@/stores/ui-store';
import type { Task } from '@/types';

const REMINDER_CHECK_INTERVAL = 30 * 1000;

function buildReminderKey(task: Task, offset: number): string {
  return `${task.id}-${offset}-${task.dueDate}-${task.dueTime}`;
}

export function useTaskReminder() {
  const { t } = useTranslation();
  const { data: todayTasks } = useTodayTasks();
  const { data: weekTasks } = useWeekTasks();
  const reminderOffsets = useUIStore((s) => s.reminderOffsets);
  const addToast = useUIStore((s) => s.addToast);
  const sentRemindersRef = useRef<Set<string>>(new Set());

  const todayTasksRef = useRef(todayTasks);
  const weekTasksRef = useRef(weekTasks);
  const reminderOffsetsRef = useRef(reminderOffsets);

  useEffect(() => {
    todayTasksRef.current = todayTasks;
  }, [todayTasks]);
  useEffect(() => {
    weekTasksRef.current = weekTasks;
  }, [weekTasks]);
  useEffect(() => {
    reminderOffsetsRef.current = reminderOffsets;
  }, [reminderOffsets]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('sent-task-reminders');
      if (stored) {
        try {
          sentRemindersRef.current = new Set(JSON.parse(stored));
        } catch {
          sentRemindersRef.current = new Set();
        }
      }
    }
  }, []);

  const saveSentReminders = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sent-task-reminders', JSON.stringify([...sentRemindersRef.current]));
    }
  }, []);

  const sendNotification = useCallback(
    (task: Task, minutesLeft: number) => {
      const reminderKey = buildReminderKey(task, minutesLeft);

      if (sentRemindersRef.current.has(reminderKey)) {
        return;
      }

      sentRemindersRef.current.add(reminderKey);
      saveSentReminders();

      const timeStr =
        minutesLeft >= 60 && minutesLeft % 60 === 0
          ? `${Math.floor(minutesLeft / 60)}${t('task.hourBefore')}`
          : `${minutesLeft}${t('task.minutesBefore')}`;

      const title = t('notifications.reminderTitle');
      const body = t('notifications.reminderBody', {
        title: task.title,
        time: timeStr,
      });

      addToast(body, 'warning');

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: reminderKey,
            requireInteraction: false,
          });
        } catch {
          console.warn('Failed to show browser notification');
        }
      }
    },
    [addToast, saveSentReminders, t]
  );

  const checkReminders = useCallback(() => {
    const now = new Date();
    const allTasks = [...(todayTasksRef.current || []), ...(weekTasksRef.current || [])];
    const seen = new Set<number>();

    for (const task of allTasks) {
      if (seen.has(task.id) || task.isCompleted || !task.dueDate || !task.dueTime) {
        continue;
      }
      seen.add(task.id);

      const dateParts = task.dueDate.split('-');
      const timeParts = task.dueTime.split(':');
      if (dateParts.length < 3 || timeParts.length < 2) {
        continue;
      }
      const [year, month, day] = dateParts.map(Number);
      const [hour, minute] = timeParts.map(Number);
      if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(hour) || Number.isNaN(minute)) {
        continue;
      }
      const dueDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);

      if (Number.isNaN(dueDateTime.getTime()) || dueDateTime <= now) {
        continue;
      }

      const diffMs = dueDateTime.getTime() - now.getTime();
      const minutesUntilDue = Math.floor(diffMs / (1000 * 60));

      const effectiveOffsets =
        task.reminderOffsets && task.reminderOffsets.length > 0
          ? task.reminderOffsets
          : reminderOffsetsRef.current;

      if (!effectiveOffsets.length) {
        continue;
      }

      for (const offset of effectiveOffsets) {
        if (minutesUntilDue >= offset - 1 && minutesUntilDue <= offset + 1) {
          sendNotification(task, offset);
        }
      }
    }
  }, [sendNotification]);

  useEffect(() => {
    checkReminders();

    const intervalId = setInterval(checkReminders, REMINDER_CHECK_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [checkReminders]);

  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        sentRemindersRef.current.clear();
        saveSentReminders();
      }
    };

    const midnightInterval = setInterval(checkMidnight, 60 * 1000);
    return () => clearInterval(midnightInterval);
  }, [saveSentReminders]);
}
