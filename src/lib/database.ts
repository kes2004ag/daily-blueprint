import { supabase } from './supabase';
import type { Day, Task, FocusLog, PhoneUsageLog, HealthLog, FocusCategory, MonthlyTarget } from '@/types/database';
import { format } from 'date-fns';

// ============= DAYS =============

export async function getOrCreateDay(date: Date): Promise<Day> {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Try to get existing day
  const { data: existingDay, error: fetchError } = await supabase
    .from('days')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', dateStr)
    .single();

  if (existingDay) return existingDay;

  // Create new day if not exists
  const { data: newDay, error: insertError } = await supabase
    .from('days')
    .insert({ user_id: user.id, date: dateStr })
    .select()
    .single();

  if (insertError) throw insertError;
  if (!newDay) throw new Error('Failed to create day');

  return newDay;
}

export async function getDaysByDateRange(startDate: Date, endDate: Date): Promise<Day[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('days')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ============= TASKS =============

export async function getTasksForDate(date: Date): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const dateStr = format(date, 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('active_date', dateStr)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTasksByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .gte('active_date', format(startDate, 'yyyy-MM-dd'))
    .lte('active_date', format(endDate, 'yyyy-MM-dd'))
    .order('active_date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createTask(
  title: string,
  date: Date
): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const day = await getOrCreateDay(date);
  const dateStr = format(date, 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      day_id: day.id,
      title,
      status: 'pending',
      origin_date: dateStr,
      active_date: dateStr,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create task');

  return data;
}

export async function updateTaskStatus(
  taskId: string,
  status: 'pending' | 'completed'
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update task');

  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}

// ============= FOCUS LOGS =============

export async function getFocusLogsForDate(date: Date): Promise<FocusLog[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const dateStr = format(date, 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('focus_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', dateStr);

  if (error) throw error;
  return data || [];
}

export async function getFocusLogsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<FocusLog[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('focus_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function upsertFocusLog(
  date: Date,
  category: FocusCategory,
  minutes: number
): Promise<FocusLog> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const day = await getOrCreateDay(date);
  const dateStr = format(date, 'yyyy-MM-dd');

  // First check if a record exists
  const { data: existing } = await supabase
    .from('focus_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', dateStr)
    .eq('category', category)
    .maybeSingle();

  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('focus_logs')
      .update({ minutes, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update focus log');
    return data;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('focus_logs')
      .insert({
        user_id: user.id,
        day_id: day.id,
        date: dateStr,
        category,
        minutes,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create focus log');
    return data;
  }
}

// ============= PHONE USAGE LOGS =============

export async function getPhoneUsageForDate(date: Date): Promise<PhoneUsageLog | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const dateStr = format(date, 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('phone_usage_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', dateStr)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPhoneUsageByDateRange(
  startDate: Date,
  endDate: Date
): Promise<PhoneUsageLog[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('phone_usage_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function upsertPhoneUsage(
  date: Date,
  minutes: number
): Promise<PhoneUsageLog> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const day = await getOrCreateDay(date);
  const dateStr = format(date, 'yyyy-MM-dd');

  // Check if record exists
  const { data: existing } = await supabase
    .from('phone_usage_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', dateStr)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('phone_usage_logs')
      .update({ minutes, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update phone usage');
    return data;
  } else {
    const { data, error } = await supabase
      .from('phone_usage_logs')
      .insert({
        user_id: user.id,
        day_id: day.id,
        date: dateStr,
        minutes,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create phone usage');
    return data;
  }
}

// ============= HEALTH LOGS =============

export async function getHealthLogForDate(date: Date): Promise<HealthLog | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const dateStr = format(date, 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', dateStr)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getHealthLogsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<HealthLog[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function upsertHealthLog(
  date: Date,
  healthData: {
    sleep_hours?: number;
    running_km?: number;
    running_minutes?: number;
    steps?: number;
    weight_kg?: number;
  }
): Promise<HealthLog> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const day = await getOrCreateDay(date);
  const dateStr = format(date, 'yyyy-MM-dd');

  // Check if record exists
  const { data: existing } = await supabase
    .from('health_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', dateStr)
    .maybeSingle();

  if (existing) {
    const { data: result, error } = await supabase
      .from('health_logs')
      .update({ ...healthData, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    if (!result) throw new Error('Failed to update health log');
    return result;
  } else {
    const { data: result, error } = await supabase
      .from('health_logs')
      .insert({
        user_id: user.id,
        day_id: day.id,
        date: dateStr,
        ...healthData,
      })
      .select()
      .single();

    if (error) throw error;
    if (!result) throw new Error('Failed to create health log');
    return result;
  }
}

// ============= MONTHLY TARGETS =============

export async function getMonthlyTargets(month: string): Promise<MonthlyTarget[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('monthly_targets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', month)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addMonthlyTarget(
  month: string,
  title: string,
  description?: string
): Promise<MonthlyTarget> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: result, error } = await supabase
    .from('monthly_targets')
    .insert({
      user_id: user.id,
      month,
      title,
      description: description || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  if (!result) throw new Error('Failed to create monthly target');
  return result;
}

export async function toggleMonthlyTarget(id: string): Promise<MonthlyTarget> {
  const { data: current } = await supabase
    .from('monthly_targets')
    .select('status')
    .eq('id', id)
    .single();

  const newStatus = current?.status === 'completed' ? 'pending' : 'completed';

  const { data: result, error } = await supabase
    .from('monthly_targets')
    .update({
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!result) throw new Error('Failed to update monthly target');
  return result;
}

export async function editMonthlyTarget(
  id: string,
  title: string,
  description?: string
): Promise<MonthlyTarget> {
  const { data: result, error } = await supabase
    .from('monthly_targets')
    .update({
      title,
      description: description || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!result) throw new Error('Failed to edit monthly target');
  return result;
}

export async function deleteMonthlyTarget(id: string): Promise<void> {
  const { error } = await supabase
    .from('monthly_targets')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function carryForwardMonthlyTargets(fromMonth: string, toMonth: string): Promise<MonthlyTarget[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get pending targets from previous month
  const { data: pendingTargets, error: fetchError } = await supabase
    .from('monthly_targets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', fromMonth)
    .eq('status', 'pending');

  if (fetchError) throw fetchError;
  if (!pendingTargets || pendingTargets.length === 0) return [];

  // Check if targets already exist in the new month to avoid duplicates
  const { data: existingTargets } = await supabase
    .from('monthly_targets')
    .select('title')
    .eq('user_id', user.id)
    .eq('month', toMonth);

  const existingTitles = new Set(existingTargets?.map(t => t.title) || []);

  // Only create targets that don't already exist
  const newTargets = pendingTargets
    .filter(target => !existingTitles.has(target.title))
    .map(target => ({
      user_id: user.id,
      month: toMonth,
      title: target.title,
      description: target.description,
      status: 'pending' as const,
    }));

  if (newTargets.length === 0) return [];

  const { data: result, error: insertError } = await supabase
    .from('monthly_targets')
    .insert(newTargets)
    .select();

  if (insertError) throw insertError;
  return result || [];
}
