// Database types for the life tracking app

export interface Day {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD format
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  day_id: string;
  title: string;
  status: 'pending' | 'completed';
  origin_date: string; // When task was first created
  active_date: string; // Which day this task belongs to
  created_at: string;
  completed_at?: string;
}

export type FocusCategory = 'GATE' | 'DEVELOPMENT' | 'RESEARCH' | 'COLLEGE';

export interface FocusLog {
  id: string;
  user_id: string;
  day_id: string;
  date: string;
  category: FocusCategory;
  minutes: number;
  created_at: string;
}

export interface PhoneUsageLog {
  id: string;
  user_id: string;
  day_id: string;
  date: string;
  minutes: number;
  created_at: string;
}

export interface HealthLog {
  id: string;
  user_id: string;
  day_id: string;
  date: string;
  sleep_hours?: number;
  running_km?: number;
  running_minutes?: number;
  created_at: string;
}

export interface DailySummary {
  date: string;
  totalFocusMinutes: number;
  focusByCategory: Record<FocusCategory, number>;
  tasksCompleted: number;
  tasksCarriedForward: number;
  phoneUsageMinutes: number;
  sleepHours: number;
  runningKm: number;
}
