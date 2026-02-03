'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTodayTasks, useWeekTasks } from './use-tasks';
import { useUIStore } from '@/stores/ui-store';
import type { Task } from '@/types';

const REMINDER_CHECK_INTERVAL = 30 * 1000; // 30 seconds

/**
 * Hook to schedule and send reminders for tasks with dueTime
 * - Checks tasks every 30 seconds
 * - Sends browser notification (if permission granted) + in-app toast
 * - Uses sessionStorage to prevent duplicate reminders
 */
export function useTaskReminder() {
  const { t } = useTranslation();
  const { data: todayTasks } = useTodayTasks();
  const { data: weekTasks } = useWeekTasks();
  const reminderOffsets = useUIStore((s) => s.reminderOffsets);
  const addToast = useUIStore((s) => s.addToast);
  const sentRemindersRef = useRef<Set<string>>(new Set());

  // Store tasks in refs to avoid interval recreation on data changes
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

  // Load sent reminders from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('sent-task-reminders');
      if (stored) {
        try {
          sentRemindersRef.current = new Set(JSON.parse(stored));
        } catch {
          // ignore parse errors
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
      const reminderKey = `${task.id}-${minutesLeft}`;

      // Already sent this reminder
      if (sentRemindersRef.current.has(reminderKey)) {
        return;
      }

      sentRemindersRef.current.add(reminderKey);
      saveSentReminders();

      // Format time remaining
      const timeStr =
        minutesLeft >= 60 && minutesLeft % 60 === 0
          ? `${Math.floor(minutesLeft / 60)}${t('task.hourBefore')}`
          : `${minutesLeft}${t('task.minutesBefore')}`;

      const title = t('notifications.reminderTitle');
      const body = t('notifications.reminderBody', {
        title: task.title,
        time: timeStr,
      });

      // In-app toast (always)
      addToast(body, 'warning');

      // Browser notification (if permission granted)
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: reminderKey, // prevents duplicate system notifications
            requireInteraction: false,
          });
        } catch {
          // Notification might fail in some contexts (e.g., service worker not available)
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
      // Skip duplicates, completed tasks, or tasks without dueDate/dueTime
      if (seen.has(task.id) || task.isCompleted || !task.dueDate || !task.dueTime) {
        continue;
      }
      seen.add(task.id);

      // Parse due datetime safely
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

      // Skip if invalid date or due time is in the past
      if (Number.isNaN(dueDateTime.getTime()) || dueDateTime <= now) {
        continue;
      }

      // Calculate minutes until due
      const diffMs = dueDateTime.getTime() - now.getTime();
      const minutesUntilDue = Math.floor(diffMs / (1000 * 60));

      // Task-level reminder settings take precedence over global settings
      const effectiveOffsets =
        task.reminderOffsets && task.reminderOffsets.length > 0
          ? task.reminderOffsets
          : reminderOffsetsRef.current;

      if (!effectiveOffsets.length) {
        continue;
      }

      // Check each reminder offset
      for (const offset of effectiveOffsets) {
        // Trigger if we're within a 1-minute window of the offset
        // e.g., if offset is 60, trigger when minutesUntilDue is between 59 and 61
        if (minutesUntilDue >= offset - 1 && minutesUntilDue <= offset + 1) {
          sendNotification(task, offset);
        }
      }
    }
  }, [sendNotification]);

  // Set up interval to check reminders
  useEffect(() => {
    // Initial check
    checkReminders();

    // Set interval
    const intervalId = setInterval(checkReminders, REMINDER_CHECK_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [checkReminders]);

  // Clear old reminders at midnight (for a new day)
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
