import { supabase } from './supabase';
import { format, subDays, addDays, parseISO, isToday, isBefore, startOfDay } from 'date-fns';
import { getTasksForDate, createTask, getOrCreateDay } from './database';
import type { Task } from '@/types/database';

/**
 * Carries forward incomplete tasks from previous days to today
 * This should be called when:
 * 1. User opens the app for the first time today
 * 2. User navigates to today's view
 */
export async function carryForwardPendingTasks(targetDate: Date = new Date()): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const today = startOfDay(targetDate);
  const todayStr = format(today, 'yyyy-MM-dd');

  // Get all dates from the user's first task until yesterday
  const { data: oldestTask } = await supabase
    .from('tasks')
    .select('active_date')
    .eq('user_id', user.id)
    .order('active_date', { ascending: true })
    .limit(1)
    .single();

  if (!oldestTask) return; // No tasks to carry forward

  const startDate = parseISO(oldestTask.active_date);
  
  // Only process dates before today
  if (!isBefore(startDate, today)) return;

  // Get all pending tasks from all previous days
  const { data: pendingTasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .lt('active_date', todayStr)
    .order('active_date', { ascending: true });

  if (error) throw error;
  if (!pendingTasks || pendingTasks.length === 0) return;

  // Get today's day record
  const todayDay = await getOrCreateDay(today);

  // Group tasks by title and origin_date to avoid duplicates
  const tasksByKey = new Map<string, Task>();
  
  for (const task of pendingTasks) {
    const key = `${task.title}|${task.origin_date}`;
    // Keep the oldest active_date for each unique task
    if (!tasksByKey.has(key) || task.active_date < tasksByKey.get(key)!.active_date) {
      tasksByKey.set(key, task);
    }
  }

  // Check which tasks already exist for today
  const todaysTasks = await getTasksForDate(today);
  const existingTaskKeys = new Set(
    todaysTasks.map(t => `${t.title}|${t.origin_date}`)
  );

  // Create carried-forward tasks for today
  const tasksToCarry = Array.from(tasksByKey.values()).filter(
    task => !existingTaskKeys.has(`${task.title}|${task.origin_date}`)
  );

  if (tasksToCarry.length === 0) return;

  const newTasks = tasksToCarry.map(task => ({
    user_id: user.id,
    day_id: todayDay.id,
    title: task.title,
    status: 'pending' as const,
    origin_date: task.origin_date, // Keep original date
    active_date: todayStr,
  }));

  const { error: insertError } = await supabase
    .from('tasks')
    .insert(newTasks);

  if (insertError) throw insertError;
}

/**
 * Carries forward tasks from a specific date to the next day
 * Useful for manual carry-forward or batch processing
 */
export async function carryForwardFromDate(fromDate: Date, toDate: Date): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const fromDateStr = format(fromDate, 'yyyy-MM-dd');
  const toDateStr = format(toDate, 'yyyy-MM-dd');

  // Get pending tasks from source date
  const { data: pendingTasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('active_date', fromDateStr)
    .eq('status', 'pending');

  if (error) throw error;
  if (!pendingTasks || pendingTasks.length === 0) return;

  // Get or create target day
  const targetDay = await getOrCreateDay(toDate);

  // Get existing tasks for target date to avoid duplicates
  const existingTasks = await getTasksForDate(toDate);
  const existingTaskKeys = new Set(
    existingTasks.map(t => `${t.title}|${t.origin_date}`)
  );

  // Filter out tasks that already exist
  const tasksToCarry = pendingTasks.filter(
    task => !existingTaskKeys.has(`${task.title}|${task.origin_date}`)
  );

  if (tasksToCarry.length === 0) return;

  const newTasks = tasksToCarry.map(task => ({
    user_id: user.id,
    day_id: targetDay.id,
    title: task.title,
    status: 'pending' as const,
    origin_date: task.origin_date,
    active_date: toDateStr,
  }));

  const { error: insertError } = await supabase
    .from('tasks')
    .insert(newTasks);

  if (insertError) throw insertError;
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
