import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

let toastCounter = 0;
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Modals
  isTaskModalOpen: boolean;
  isProjectModalOpen: boolean;
  openTaskModal: () => void;
  closeTaskModal: () => void;
  openProjectModal: () => void;
  closeProjectModal: () => void;

  // Toast Notifications
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Language
  language: 'ko' | 'en';
  setLanguage: (lang: 'ko' | 'en') => void;

  // Reminder settings (minutes before due time)
  reminderOffsets: number[];
  setReminderOffsets: (offsets: number[]) => void;
  addReminderOffset: (offset: number) => void;
  removeReminderOffset: (offset: number) => void;

  // Browser notification permission
  notificationPermission: NotificationPermission | 'default';
  setNotificationPermission: (permission: NotificationPermission) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Sidebar
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      // Modals
      isTaskModalOpen: false,
      isProjectModalOpen: false,
      openTaskModal: () => set({ isTaskModalOpen: true }),
      closeTaskModal: () => set({ isTaskModalOpen: false }),
      openProjectModal: () => set({ isProjectModalOpen: true }),
      closeProjectModal: () => set({ isProjectModalOpen: false }),

      // Toast Notifications
      toasts: [],
      addToast: (message, type = 'info') => {
        const id = `toast-${++toastCounter}-${Date.now()}`;
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }));

        // Auto remove after 3 seconds
        const timer = setTimeout(() => {
          get().removeToast(id);
        }, 3000);
        toastTimers.set(id, timer);
      },
      removeToast: (id) => {
        const timer = toastTimers.get(id);
        if (timer) {
          clearTimeout(timer);
          toastTimers.delete(id);
        }
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      },

      // Theme
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      // Language
      language: 'ko',
      setLanguage: (lang) => set({ language: lang }),

      // Reminder settings (default: 60 min, 10 min before)
      reminderOffsets: [60, 10],
      setReminderOffsets: (offsets) => set({ reminderOffsets: offsets }),
      addReminderOffset: (offset) =>
        set((state) => ({
          reminderOffsets: [...new Set([...state.reminderOffsets, offset])].sort((a, b) => b - a),
        })),
      removeReminderOffset: (offset) =>
        set((state) => ({
          reminderOffsets: state.reminderOffsets.filter((o) => o !== offset),
        })),

      // Browser notification permission
      notificationPermission: 'default',
      setNotificationPermission: (permission) => set({ notificationPermission: permission }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        reminderOffsets: state.reminderOffsets,
      }),
    }
  )
);
