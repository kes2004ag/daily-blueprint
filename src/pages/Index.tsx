import { useState, useEffect } from 'react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { WallpaperContext } from '@/hooks/useWallpaperView';
import { Navigation } from '@/components/Navigation';
import { TaskList } from '@/components/TaskList';
import { FocusTracker } from '@/components/FocusTracker';
import { PhoneUsageTracker } from '@/components/PhoneUsageTracker';
import { HealthTracker } from '@/components/HealthTracker';
import { SummaryCard } from '@/components/SummaryCard';
import { CalendarView } from '@/components/CalendarView';
import { ChartsView } from '@/components/ChartsView';
import { MonthlyTargets } from '@/components/MonthlyTargets';
import { WelcomeBanner } from '@/components/WelcomeBanner';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import {
  getTasksForDate,
  createTask,
  updateTaskStatus,
  deleteTask,
  getFocusLogsForDate,
  upsertFocusLog,
  getPhoneUsageForDate,
  upsertPhoneUsage,
  getHealthLogForDate,
  upsertHealthLog,
  getFocusLogsByDateRange,
  getPhoneUsageByDateRange,
  getHealthLogsByDateRange,
  getMonthlyTargets,
  addMonthlyTarget,
  editMonthlyTarget,
  toggleMonthlyTarget,
  deleteMonthlyTarget,
  carryForwardMonthlyTargets,
} from '@/lib/database';
import { getCarriedForwardTasks } from '@/lib/carryForward';
import type { Task, FocusLog, FocusCategory, PhoneUsageLog, HealthLog, MonthlyTarget } from '@/types/database';

type View = 'today' | 'calendar' | 'analytics' | 'goals';

interface IndexProps {
  user: User;
  onSignOut: () => Promise<void>;
}

const Index = ({ user, onSignOut }: IndexProps) => {
  const [currentView, setCurrentView] = useState<View>('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Today's data
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [todayFocusLogs, setTodayFocusLogs] = useState<FocusLog[]>([]);
  const [todayPhoneUsage, setTodayPhoneUsage] = useState(0);
  const [todayHealth, setTodayHealth] = useState<HealthLog | null>(null);

  // Selected date data
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [selectedFocusLogs, setSelectedFocusLogs] = useState<FocusLog[]>([]);
  const [selectedPhoneUsage, setSelectedPhoneUsage] = useState(0);
  const [selectedHealth, setSelectedHealth] = useState<HealthLog | null>(null);

  // Analytics data
  const [allFocusLogs, setAllFocusLogs] = useState<FocusLog[]>([]);
  const [allPhoneLogs, setAllPhoneLogs] = useState<PhoneUsageLog[]>([]);
  const [allHealthLogs, setAllHealthLogs] = useState<HealthLog[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  // Monthly targets
  const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>([]);
  const [selectedGoalsMonth, setSelectedGoalsMonth] = useState(format(new Date(), 'yyyy-MM'));
  const currentMonth = format(new Date(), 'yyyy-MM');

  const todayString = format(new Date(), 'yyyy-MM-dd');
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const isSelectedToday = isToday(selectedDate);
  const isPastDate = isBefore(startOfDay(selectedDate), startOfDay(new Date()));

  // Load today's data
  const loadTodayData = async () => {
    try {
      const [tasks, focusLogs, phoneUsage, health, targets] = await Promise.all([
        getTasksForDate(new Date()),
        getFocusLogsForDate(new Date()),
        getPhoneUsageForDate(new Date()),
        getHealthLogForDate(new Date()),
        getMonthlyTargets(currentMonth),
      ]);
      setTodayTasks(tasks);
      setTodayFocusLogs(focusLogs);
      setTodayPhoneUsage(phoneUsage?.minutes ?? 0);
      setTodayHealth(health);
      setMonthlyTargets(targets);
    } catch (error: any) {
      console.error('Error loading today data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load today\'s data.',
        variant: 'destructive',
      });
    }
  };

  // Load selected date data
  const loadSelectedDateData = async () => {
    if (isSelectedToday) {
      setSelectedTasks(todayTasks);
      setSelectedFocusLogs(todayFocusLogs);
      setSelectedPhoneUsage(todayPhoneUsage);
      setSelectedHealth(todayHealth);
      return;
    }

    try {
      const [tasks, focusLogs, phoneUsage, health] = await Promise.all([
        getTasksForDate(selectedDate),
        getFocusLogsForDate(selectedDate),
        getPhoneUsageForDate(selectedDate),
        getHealthLogForDate(selectedDate),
      ]);
      setSelectedTasks(tasks);
      setSelectedFocusLogs(focusLogs);
      setSelectedPhoneUsage(phoneUsage?.minutes ?? 0);
      setSelectedHealth(health);
    } catch (error: any) {
      console.error('Error loading selected date data:', error);
    }
  };

  // Load analytics data (last 30 days)
  const loadAnalyticsData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const [focusLogs, phoneLogs, healthLogs, tasks] = await Promise.all([
        getFocusLogsByDateRange(startDate, endDate),
        getPhoneUsageByDateRange(startDate, endDate),
        getHealthLogsByDateRange(startDate, endDate),
        getTasksForDate(new Date()), // We'll need to update this to get all tasks
      ]);

      setAllFocusLogs(focusLogs);
      setAllPhoneLogs(phoneLogs);
      setAllHealthLogs(healthLogs);
      setAllTasks(tasks);
    } catch (error: any) {
      console.error('Error loading analytics data:', error);
    }
  };

  // Load goals data
  const loadGoalsData = async () => {
    try {
      // Load targets for selected month
      const targets = await getMonthlyTargets(selectedGoalsMonth);
      
      // If viewing current month and no targets exist, try to carry forward from last month
      if (selectedGoalsMonth === currentMonth && targets.length === 0) {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthStr = format(lastMonth, 'yyyy-MM');
        
        // Only attempt carry-forward in first 3 days of new month
        if (now.getDate() <= 3) {
          try {
            const carriedForward = await carryForwardMonthlyTargets(lastMonthStr, currentMonth);
            if (carriedForward.length > 0) {
              toast({
                title: 'Goals carried forward',
                description: `${carriedForward.length} pending goal(s) from last month`,
              });
              setMonthlyTargets(carriedForward);
              return;
            }
          } catch (error) {
            console.log('No targets to carry forward or error:', error);
          }
        }
      }
      
      setMonthlyTargets(targets);
    } catch (error: any) {
      console.error('Error loading goals data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goals.',
        variant: 'destructive',
      });
    }
  };

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await loadTodayData();
      setLoading(false);
    };
    initialize();
  }, []);

  // Load data when view changes
  useEffect(() => {
    if (currentView === 'calendar') {
      loadSelectedDateData();
    } else if (currentView === 'analytics') {
      loadAnalyticsData();
    } else if (currentView === 'goals') {
      loadGoalsData();
    }
  }, [currentView, selectedDate, selectedGoalsMonth]);

  // Calculate carried forward tasks
  const carriedForwardTasks = todayTasks.filter(
    task => task.origin_date !== todayString && task.status === 'pending'
  );

  // Task handlers
  const handleAddTask = async (title: string) => {
    try {
      const newTask = await createTask(title, isSelectedToday ? new Date() : selectedDate);
      if (isSelectedToday) {
        setTodayTasks([...todayTasks, newTask]);
      }
      setSelectedTasks([...selectedTasks, newTask]);
      toast({
        title: 'Task added',
        description: 'Your task has been created.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to add task.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const task = [...todayTasks, ...selectedTasks].find(t => t.id === taskId);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const updatedTask = await updateTaskStatus(taskId, newStatus);

      const updateTasks = (tasks: Task[]) =>
        tasks.map(t => (t.id === taskId ? updatedTask : t));

      setTodayTasks(updateTasks(todayTasks));
      setSelectedTasks(updateTasks(selectedTasks));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update task.',
        variant: 'destructive',
      });
    }
  };

  const handleEditTask = async (taskId: string, newTitle: string) => {
    try {
      // For now, we'll update the task status (we need to add an update function in database.ts)
      // Since we don't have a direct update function, we'll need to delete and recreate
      // OR add a new function to the database
      // For now, let's just show a toast - in production, add a proper update function
      
      // Create a temporary solution by deleting and recreating
      const task = [...todayTasks, ...selectedTasks].find(t => t.id === taskId);
      if (!task) return;

      await deleteTask(taskId);
      const newTask = await createTask(newTitle, isSelectedToday ? new Date() : selectedDate);

      const updateTasks = (tasks: Task[]) =>
        tasks.filter(t => t.id !== taskId).concat([newTask]);

      setTodayTasks(updateTasks(todayTasks));
      setSelectedTasks(updateTasks(selectedTasks));

      toast({
        title: 'Task updated',
        description: 'Your task has been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update task.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);

      const updateTasks = (tasks: Task[]) =>
        tasks.filter(t => t.id !== taskId);

      setTodayTasks(updateTasks(todayTasks));
      setSelectedTasks(updateTasks(selectedTasks));

      toast({
        title: 'Task deleted',
        description: 'Your task has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete task.',
        variant: 'destructive',
      });
    }
  };

  // Focus handlers
  const handleSetFocusTime = async (category: FocusCategory, minutes: number) => {
    try {
      const log = await upsertFocusLog(isSelectedToday ? new Date() : selectedDate, category, minutes);
      
      const updateLogs = (logs: FocusLog[]) => {
        const existingIndex = logs.findIndex(l => l.category === category);
        if (existingIndex >= 0) {
          const newLogs = [...logs];
          newLogs[existingIndex] = log;
          return newLogs;
        }
        return [...logs, log];
      };

      if (isSelectedToday) {
        setTodayFocusLogs(updateLogs(todayFocusLogs));
      }
      setSelectedFocusLogs(updateLogs(selectedFocusLogs));
      
      toast({
        title: 'Focus time saved',
        description: `${category}: ${minutes} minutes`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save focus time.',
        variant: 'destructive',
      });
    }
  };

  // Phone usage handler
  const handleSetPhoneUsage = async (minutes: number) => {
    try {
      await upsertPhoneUsage(isSelectedToday ? new Date() : selectedDate, minutes);
      if (isSelectedToday) {
        setTodayPhoneUsage(minutes);
      }
      setSelectedPhoneUsage(minutes);
      
      toast({
        title: 'Phone usage saved',
        description: `${minutes} minutes`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save phone usage.',
        variant: 'destructive',
      });
    }
  };

  // Health handler
  const handleSetHealth = async (data: { sleep_hours?: number; running_km?: number; running_minutes?: number; weight_kg?: number }) => {
    try {
      const health = await upsertHealthLog(isSelectedToday ? new Date() : selectedDate, data);
      if (isSelectedToday) {
        setTodayHealth(health);
      }
      setSelectedHealth(health);
      
      toast({
        title: 'Health data saved',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save health data.',
        variant: 'destructive',
      });
    }
  };

  // Monthly targets handlers
  const handleAddMonthlyTarget = async (data: { title: string; description?: string }) => {
    try {
      const newTarget = await addMonthlyTarget(selectedGoalsMonth, data.title, data.description);
      setMonthlyTargets([...monthlyTargets, newTarget]);
      toast({
        title: 'Goal added',
        description: data.title,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to add goal.',
        variant: 'destructive',
      });
    }
  };

  const handleEditMonthlyTarget = async (id: string, title: string, description?: string) => {
    try {
      const updated = await editMonthlyTarget(id, title, description);
      setMonthlyTargets(monthlyTargets.map(t => (t.id === id ? updated : t)));
      toast({
        title: 'Goal updated',
        description: title,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update goal.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleMonthlyTarget = async (id: string) => {
    try {
      const updated = await toggleMonthlyTarget(id);
      setMonthlyTargets(monthlyTargets.map(t => (t.id === id ? updated : t)));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update goal.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMonthlyTarget = async (id: string) => {
    try {
      await deleteMonthlyTarget(id);
      setMonthlyTargets(monthlyTargets.filter(t => t.id !== id));
      toast({
        title: 'Goal removed',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete goal.',
        variant: 'destructive',
      });
    }
  };

  const hasDataForDate = (date: Date) => {
    // This is a placeholder - in a real app, you'd query the database
    return true;
  };

  const handleSignOut = async () => {
    try {
      await onSignOut();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to sign out.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-24 md:pb-6"
      style={{
        backgroundImage: currentView === 'today' 
          ? 'url(/today.jpg)'
          : currentView === 'goals'
          ? 'url(/goals.jpg)'
          : undefined,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: 'hsl(var(--background))',
      }}
    >
      {/* Background overlay for 'today' and 'goals' views */}
      {(currentView === 'today' || currentView === 'goals') && (
        <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 pointer-events-none z-0" />
      )}
      
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
                  {currentView === 'today' && 'Today'}
                  {currentView === 'goals' && 'Monthly Goals'}
                  {currentView === 'calendar' && 'Calendar'}
                  {currentView === 'analytics' && 'Analytics'}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {currentView === 'today'
                    ? format(new Date(), 'EEEE, MMMM d')
                    : currentView === 'goals'
                    ? 'Set and track your monthly objectives'
                    : currentView === 'calendar'
                    ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                    : 'Your behavioral trends'
                  }
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 h-9 rounded-lg border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </header>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-8">
        <WallpaperContext.Provider value={currentView === 'today' || currentView === 'goals'}>
        {currentView === 'today' && (
          <>
            {/* Welcome Banner */}
            <WelcomeBanner
              userName={user.email?.split('@')[0]}
              hasTasksToday={todayTasks.length > 0}
              carriedForwardCount={carriedForwardTasks.length}
            />

            {/* Summary Card */}
            <SummaryCard
              focusMinutes={todayFocusLogs.reduce((sum, l) => sum + l.minutes, 0)}
              tasksCompleted={todayTasks.filter(t => t.status === 'completed').length}
              totalTasks={todayTasks.length}
              phoneMinutes={todayPhoneUsage}
              sleepHours={todayHealth?.sleep_hours ?? 0}
            />

            {/* Two column layout on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6">
                <TaskList
                  tasks={todayTasks}
                  date={todayString}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
                <HealthTracker
                  healthData={todayHealth ?? undefined}
                  onSetHealth={handleSetHealth}
                />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <FocusTracker
                  logs={todayFocusLogs}
                  onSetFocusTime={handleSetFocusTime}
                />
                <PhoneUsageTracker
                  minutes={todayPhoneUsage}
                  onSetUsage={handleSetPhoneUsage}
                />
              </div>
            </div>
          </>
        )}

        {currentView === 'calendar' && (
          <>
            <CalendarView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              hasDataForDate={hasDataForDate}
            />

            {/* Selected day detail */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-semibold text-base sm:text-lg">
                  {isSelectedToday ? "Today's Log" : format(selectedDate, 'MMMM d, yyyy')}
                </h2>
                {isPastDate && !isSelectedToday && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Read-only
                  </span>
                )}
              </div>

              {/* Summary for selected date */}
              <SummaryCard
                focusMinutes={selectedFocusLogs.reduce((sum, l) => sum + l.minutes, 0)}
                tasksCompleted={selectedTasks.filter(t => t.status === 'completed').length}
                totalTasks={selectedTasks.length}
                phoneMinutes={selectedPhoneUsage}
                sleepHours={selectedHealth?.sleep_hours ?? 0}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6">
                  <TaskList
                    tasks={selectedTasks}
                    date={selectedDateString}
                    onAddTask={handleAddTask}
                    onToggleTask={handleToggleTask}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    isReadOnly={isPastDate && !isSelectedToday}
                  />
                  <HealthTracker
                    healthData={selectedHealth ?? undefined}
                    onSetHealth={handleSetHealth}
                    isReadOnly={isPastDate && !isSelectedToday}
                  />
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <FocusTracker
                    logs={selectedFocusLogs}
                    onSetFocusTime={handleSetFocusTime}
                    isReadOnly={isPastDate && !isSelectedToday}
                  />
                  <PhoneUsageTracker
                    minutes={selectedPhoneUsage}
                    onSetUsage={handleSetPhoneUsage}
                    isReadOnly={isPastDate && !isSelectedToday}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === 'analytics' && (
          <ChartsView
            focusLogs={allFocusLogs}
            phoneLogs={allPhoneLogs}
            healthLogs={allHealthLogs}
            tasks={allTasks}
          />
        )}

        {currentView === 'goals' && (
          <MonthlyTargets
            targets={monthlyTargets}
            onAddTarget={handleAddMonthlyTarget}
            onEditTarget={handleEditMonthlyTarget}
            onToggleTarget={handleToggleMonthlyTarget}
            onDeleteTarget={handleDeleteMonthlyTarget}
            currentMonth={currentMonth}
            selectedMonth={selectedGoalsMonth}
            onMonthChange={setSelectedGoalsMonth}
          />
        )}
        </WallpaperContext.Provider>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </div>
      </div>
    </div>
  );
};

export default Index;
