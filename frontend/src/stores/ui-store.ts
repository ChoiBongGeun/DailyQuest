import { create } from 'zustand';

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

  // Theme (Optional)
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
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
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  // Theme
  theme: 'light',
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
}));
