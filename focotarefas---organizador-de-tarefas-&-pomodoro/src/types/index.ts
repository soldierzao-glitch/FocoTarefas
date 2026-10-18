export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  sectionId: string;
  title: string;
  completed: boolean;
  notes: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface Section {
  id: string;
  title: string;
  createdAt: string;
  isCollapsed?: boolean;
  isArchived?: boolean;
  archivedAt?: string;
}

export type PomodoroMode = 'focus' | 'short_break' | 'long_break';

export interface PomodoroSettings {
  focusDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  longBreakInterval: number; // number of cycles
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  soundType: 'alarm' | 'bell' | 'chime' | 'digital';
}

export type TaskFilter = 'all' | 'pending' | 'in_progress' | 'completed';
