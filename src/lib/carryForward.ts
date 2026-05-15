import { supabase } from './supabase';
import { format, subDays, addDays, parseISO, isToday, isBefore, startOfDay } from 'date-fns';
import { getTasksForDate, createTask, getOrCreateDay } from './database';
import type { Task } from '@/types/database';

/**
 * Task carry-forward is disabled.
 * One-day tasks remain on their original day and are not copied to the next day.
 */
export async function carryForwardPendingTasks(targetDate: Date = new Date()): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Intentionally no-op.
  // Pending tasks stay on their original date until completed or manually managed.
  return;
}

/**
 * Carries forward tasks from a specific date to the next day
 * Useful for manual carry-forward or batch processing
 */
export async function carryForwardFromDate(fromDate: Date, toDate: Date): Promise<void> {
  // Intentionally no-op.
  // This app no longer copies unfinished daily tasks into the next day.
  return;
}

/**
 * Gets tasks that were carried forward (origin_date != active_date)
 */
export async function getCarriedForwardTasks(date: Date): Promise<Task[]> {
  const tasks = await getTasksForDate(date);
  const dateStr = format(date, 'yyyy-MM-dd');
  
  return tasks.filter(task => task.origin_date !== dateStr);
}

/**
 * Gets the age of a task in days (how long it's been pending)
 */
export function getTaskAge(task: Task): number {
  const origin = parseISO(task.origin_date);
  const active = parseISO(task.active_date);
  return Math.floor((active.getTime() - origin.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Checks if tasks need to be carried forward and does it automatically
 * Should be called on app initialization
 */
export async function autoCarryForwardCheck(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    await carryForwardPendingTasks();
    return true;
  } catch (error) {
    console.error('Error carrying forward tasks:', error);
    return false;
  }
}
