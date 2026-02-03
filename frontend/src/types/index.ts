// ========================================
// User Types
// ========================================
export interface User {
  id: number;
  email: string;
  nickname: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ========================================
// Task Types
// ========================================
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Task {
  id: number;
  projectId?: number;
  projectName?: string;
  projectColor?: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  isRecurring: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  parentTaskId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskCreateRequest {
  projectId?: number;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
}

export interface TaskUpdateRequest {
  projectId?: number;
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  isCompleted?: boolean;
}

// ========================================
// Project Types
// ========================================
export interface Project {
  id: number;
  name: string;
  color: string;
  taskCount?: number;
  completedTaskCount?: number;
  createdAt: string;
}

export interface ProjectCreateRequest {
  name: string;
  color?: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  color?: string;
}

// ========================================
// Dashboard Types
// ========================================
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  todayTasks: number;
  weekTasks: number;
  todayCompleted: number;
  weekCompleted: number;
}

// ========================================
// API Response Types
// ========================================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

// ========================================
// UI Types
// ========================================
export interface FilterOptions {
  projectId?: number;
  priority?: Priority;
  isCompleted?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface SortOptions {
  field: 'dueDate' | 'priority' | 'createdAt' | 'title';
  order: 'asc' | 'desc';
}
