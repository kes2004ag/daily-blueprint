import { useState, useEffect, useCallback } from 'react';
import { format, parseISO, isToday, isBefore, startOfDay } from 'date-fns';
import type { Task, FocusLog, PhoneUsageLog, HealthLog, FocusCategory, DailySummary } from '@/types/database';

// Generate a simple UUID
const generateId = () => crypto.randomUUID();

// Get today's date string
const getTodayString = () => format(new Date(), 'yyyy-MM-dd');

// Local storage hook for demo mode (before Supabase is connected)
export function useLocalTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem('lifetrack-tasks');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('lifetrack-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Carry forward incomplete tasks from previous days
  const carryForwardTasks = useCallback(() => {
    const today = getTodayString();
    const updatedTasks = [...tasks];
    let hasChanges = false;

    tasks.forEach(task => {
      if (
        task.status === 'pending' &&
        task.active_date !== today &&
        isBefore(parseISO(task.active_date), startOfDay(new Date()))
      ) {
        // Check if already carried forward to today
        const alreadyCarried = tasks.some(
          t => t.origin_date === task.origin_date && t.active_date === today && t.title === task.title
        );
        
        if (!alreadyCarried) {
          updatedTasks.push({
            ...task,
            id: generateId(),
            active_date: today,
            created_at: new Date().toISOString(),
          });
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setTasks(updatedTasks);
    }
  }, [tasks]);

  useEffect(() => {
    carryForwardTasks();
  }, []);

  const addTask = useCallback((title: string, date: string = getTodayString()) => {
    const newTask: Task = {
      id: generateId(),
      user_id: 'local',
      day_id: date,
      title,
      status: 'pending',
      origin_date: date,
      active_date: date,
      created_at: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'pending' ? 'completed' : 'pending',
              completed_at: task.status === 'pending' ? new Date().toISOString() : undefined,
            }
          : task
      )
    );
  }, []);

  const getTasksForDate = useCallback((date: string) => {
    return tasks.filter(task => task.active_date === date);
  }, [tasks]);

  const getTodayTasks = useCallback(() => {
    return getTasksForDate(getTodayString());
  }, [getTasksForDate]);

  return { tasks, addTask, toggleTask, getTasksForDate, getTodayTasks };
}

export function useLocalFocusLogs() {
  const [logs, setLogs] = useState<FocusLog[]>(() => {
    const stored = localStorage.getItem('lifetrack-focus');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('lifetrack-focus', JSON.stringify(logs));
  }, [logs]);

  const addFocusLog = useCallback((category: FocusCategory, minutes: number, date: string = getTodayString()) => {
    // Check if entry exists for this date and category
    const existing = logs.find(l => l.date === date && l.category === category);
    
    if (existing) {
      setLogs(prev =>
        prev.map(l =>
          l.id === existing.id ? { ...l, minutes: l.minutes + minutes } : l
        )
      );
    } else {
      const newLog: FocusLog = {
        id: generateId(),
        user_id: 'local',
        day_id: date,
        date,
        category,
        minutes,
        created_at: new Date().toISOString(),
      };
      setLogs(prev => [...prev, newLog]);
    }
  }, [logs]);

  const setFocusTime = useCallback((category: FocusCategory, minutes: number, date: string = getTodayString()) => {
    const existing = logs.find(l => l.date === date && l.category === category);
    
    if (existing) {
      setLogs(prev =>
        prev.map(l =>
          l.id === existing.id ? { ...l, minutes } : l
        )
      );
    } else {
      const newLog: FocusLog = {
        id: generateId(),
        user_id: 'local',
        day_id: date,
        date,
        category,
        minutes,
        created_at: new Date().toISOString(),
      };
      setLogs(prev => [...prev, newLog]);
    }
  }, [logs]);

  const getLogsForDate = useCallback((date: string) => {
    return logs.filter(log => log.date === date);
  }, [logs]);

  const getTodayLogs = useCallback(() => {
    return getLogsForDate(getTodayString());
  }, [getLogsForDate]);

  const getTotalMinutesForDate = useCallback((date: string) => {
    return logs.filter(l => l.date === date).reduce((sum, l) => sum + l.minutes, 0);
  }, [logs]);

  return { logs, addFocusLog, setFocusTime, getLogsForDate, getTodayLogs, getTotalMinutesForDate };
}

export function useLocalPhoneUsage() {
  const [logs, setLogs] = useState<PhoneUsageLog[]>(() => {
    const stored = localStorage.getItem('lifetrack-phone');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('lifetrack-phone', JSON.stringify(logs));
  }, [logs]);

  const setPhoneUsage = useCallback((minutes: number, date: string = getTodayString()) => {
    const existing = logs.find(l => l.date === date);
    
    if (existing) {
      setLogs(prev =>
        prev.map(l => (l.id === existing.id ? { ...l, minutes } : l))
      );
    } else {
      const newLog: PhoneUsageLog = {
        id: generateId(),
        user_id: 'local',
        day_id: date,
        date,
        minutes,
        created_at: new Date().toISOString(),
      };
      setLogs(prev => [...prev, newLog]);
    }
  }, [logs]);

  const getUsageForDate = useCallback((date: string) => {
    return logs.find(l => l.date === date)?.minutes ?? 0;
  }, [logs]);

  const getTodayUsage = useCallback(() => {
    return getUsageForDate(getTodayString());
  }, [getUsageForDate]);

  return { logs, setPhoneUsage, getUsageForDate, getTodayUsage };
}

export function useLocalHealthLogs() {
  const [logs, setLogs] = useState<HealthLog[]>(() => {
    const stored = localStorage.getItem('lifetrack-health');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('lifetrack-health', JSON.stringify(logs));
  }, [logs]);

  const setHealthData = useCallback((
    data: { sleep_hours?: number; running_km?: number; running_minutes?: number },
    date: string = getTodayString()
  ) => {
    const existing = logs.find(l => l.date === date);
    
    if (existing) {
      setLogs(prev =>
        prev.map(l =>
          l.id === existing.id ? { ...l, ...data } : l
        )
      );
    } else {
      const newLog: HealthLog = {
        id: generateId(),
        user_id: 'local',
        day_id: date,
        date,
        ...data,
        created_at: new Date().toISOString(),
      };
      setLogs(prev => [...prev, newLog]);
    }
  }, [logs]);

  const getHealthForDate = useCallback((date: string) => {
    return logs.find(l => l.date === date);
  }, [logs]);

  const getTodayHealth = useCallback(() => {
    return getHealthForDate(getTodayString());
  }, [getHealthForDate]);

  return { logs, setHealthData, getHealthForDate, getTodayHealth };
}
