// Database types for the life tracking app
// Aligned with Supabase schema

export interface Database {
  public: {
    Tables: {
      days: {
        Row: Day;
        Insert: Omit<Day, 'id' | 'created_at'>;
        Update: Partial<Omit<Day, 'id' | 'user_id' | 'created_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at'>;
        Update: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>;
      };
      focus_logs: {
        Row: FocusLog;
        Insert: Omit<FocusLog, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FocusLog, 'id' | 'user_id' | 'created_at'>>;
      };
      phone_usage_logs: {
        Row: PhoneUsageLog;
        Insert: Omit<PhoneUsageLog, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PhoneUsageLog, 'id' | 'user_id' | 'created_at'>>;
      };
      health_logs: {
        Row: HealthLog;
        Insert: Omit<HealthLog, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<HealthLog, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}

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
  completed_at?: string | null;
}

export type FocusCategory = 'GATE' | 'DSA' | 'DEVELOPMENT' | 'RESEARCH' | 'COLLEGE';

export interface FocusLog {
  id: string;
  user_id: string;
  day_id: string;
  date: string;
  category: FocusCategory;
  minutes: number;
  created_at: string;
  updated_at: string;
}

export interface PhoneUsageLog {
  id: string;
  user_id: string;
  day_id: string;
  date: string;
  minutes: number;
  created_at: string;
  updated_at: string;
}

export interface HealthLog {
  id: string;
  user_id: string;
  day_id: string;
  date: string;
  sleep_hours?: number | null;
  running_km?: number | null;
  running_minutes?: number | null;
  steps?: number | null;
  weight_kg?: number | null;
  created_at: string;
  updated_at: string;
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

export interface MonthlyTarget {
  id: string;
  user_id: string;
  month: string; // YYYY-MM format
  title: string;
  description?: string | null;
  status: 'pending' | 'completed';
  created_at: string;
  completed_at?: string | null;
}
