import { useState } from 'react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { Navigation } from '@/components/Navigation';
import { TaskList } from '@/components/TaskList';
import { FocusTracker } from '@/components/FocusTracker';
import { PhoneUsageTracker } from '@/components/PhoneUsageTracker';
import { HealthTracker } from '@/components/HealthTracker';
import { SummaryCard } from '@/components/SummaryCard';
import { CalendarView } from '@/components/CalendarView';
import { ChartsView } from '@/components/ChartsView';
import { 
  useLocalTasks, 
  useLocalFocusLogs, 
  useLocalPhoneUsage, 
  useLocalHealthLogs 
} from '@/hooks/useLocalStorage';

type View = 'today' | 'calendar' | 'analytics';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('today');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { tasks, addTask, toggleTask, getTasksForDate, getTodayTasks } = useLocalTasks();
  const { logs: focusLogs, setFocusTime, getLogsForDate: getFocusLogsForDate, getTodayLogs, getTotalMinutesForDate } = useLocalFocusLogs();
  const { logs: phoneLogs, setPhoneUsage, getUsageForDate, getTodayUsage } = useLocalPhoneUsage();
  const { logs: healthLogs, setHealthData, getHealthForDate, getTodayHealth } = useLocalHealthLogs();

  const todayString = format(new Date(), 'yyyy-MM-dd');
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const isSelectedToday = isToday(selectedDate);
  const isPastDate = isBefore(startOfDay(selectedDate), startOfDay(new Date()));

  const todayTasks = getTodayTasks();
  const selectedDateTasks = getTasksForDate(selectedDateString);
  const todayFocusLogs = getTodayLogs();
  const selectedDateFocusLogs = getFocusLogsForDate(selectedDateString);
  const todayPhoneUsage = getTodayUsage();
  const selectedDatePhoneUsage = getUsageForDate(selectedDateString);
  const todayHealth = getTodayHealth();
  const selectedDateHealth = getHealthForDate(selectedDateString);

  const hasDataForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return (
      tasks.some(t => t.active_date === dateStr) ||
      focusLogs.some(l => l.date === dateStr) ||
      phoneLogs.some(l => l.date === dateStr) ||
      healthLogs.some(l => l.date === dateStr)
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {currentView === 'today' && 'Today'}
                {currentView === 'calendar' && 'Calendar'}
                {currentView === 'analytics' && 'Analytics'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentView === 'today' 
                  ? format(new Date(), 'EEEE, MMMM d, yyyy')
                  : currentView === 'calendar'
                  ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                  : 'Your behavioral trends'
                }
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {currentView === 'today' && (
          <>
            {/* Summary Card */}
            <SummaryCard
              focusMinutes={getTotalMinutesForDate(todayString)}
              tasksCompleted={todayTasks.filter(t => t.status === 'completed').length}
              totalTasks={todayTasks.length}
              phoneMinutes={todayPhoneUsage}
              sleepHours={todayHealth?.sleep_hours ?? 0}
            />

            {/* Two column layout on desktop */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <TaskList
                  tasks={todayTasks}
                  date={todayString}
                  onAddTask={(title) => addTask(title, todayString)}
                  onToggleTask={toggleTask}
                />
                <HealthTracker
                  healthData={todayHealth}
                  onSetHealth={(data) => setHealthData(data, todayString)}
                />
              </div>
              <div className="space-y-6">
                <FocusTracker
                  logs={todayFocusLogs}
                  onSetFocusTime={(category, minutes) => setFocusTime(category, minutes, todayString)}
                />
                <PhoneUsageTracker
                  minutes={todayPhoneUsage}
                  onSetUsage={(minutes) => setPhoneUsage(minutes, todayString)}
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
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-semibold text-lg">
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
                focusMinutes={getTotalMinutesForDate(selectedDateString)}
                tasksCompleted={selectedDateTasks.filter(t => t.status === 'completed').length}
                totalTasks={selectedDateTasks.length}
                phoneMinutes={selectedDatePhoneUsage}
                sleepHours={selectedDateHealth?.sleep_hours ?? 0}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <TaskList
                    tasks={selectedDateTasks}
                    date={selectedDateString}
                    onAddTask={(title) => addTask(title, selectedDateString)}
                    onToggleTask={toggleTask}
                    isReadOnly={isPastDate && !isSelectedToday}
                  />
                  <HealthTracker
                    healthData={selectedDateHealth}
                    onSetHealth={(data) => setHealthData(data, selectedDateString)}
                    isReadOnly={isPastDate && !isSelectedToday}
                  />
                </div>
                <div className="space-y-6">
                  <FocusTracker
                    logs={selectedDateFocusLogs}
                    onSetFocusTime={(category, minutes) => setFocusTime(category, minutes, selectedDateString)}
                    isReadOnly={isPastDate && !isSelectedToday}
                  />
                  <PhoneUsageTracker
                    minutes={selectedDatePhoneUsage}
                    onSetUsage={(minutes) => setPhoneUsage(minutes, selectedDateString)}
                    isReadOnly={isPastDate && !isSelectedToday}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === 'analytics' && (
          <ChartsView
            focusLogs={focusLogs}
            phoneLogs={phoneLogs}
            healthLogs={healthLogs}
            tasks={tasks}
          />
        )}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </div>
  );
};

export default Index;
