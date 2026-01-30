import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FocusLog, PhoneUsageLog, HealthLog, Task } from '@/types/database';

interface ChartsViewProps {
  focusLogs: FocusLog[];
  phoneLogs: PhoneUsageLog[];
  healthLogs: HealthLog[];
  tasks: Task[];
}

const FOCUS_COLORS = {
  GATE: 'hsl(220, 70%, 50%)',
  DEVELOPMENT: 'hsl(150, 50%, 40%)',
  RESEARCH: 'hsl(280, 50%, 50%)',
  COLLEGE: 'hsl(35, 80%, 50%)',
};

export function ChartsView({ focusLogs, phoneLogs, healthLogs, tasks }: ChartsViewProps) {
  // State for month/year selection
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Get month range for selected month
  const getMonthRange = (month: number, year: number) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { monthStart, monthEnd };
  };

  const { monthStart, monthEnd } = getMonthRange(selectedMonth, selectedYear);

  // Navigation handlers
  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Format month display
  const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Filter data by selected month
  const isSelectedMonth = (dateStr: string) => {
    const date = dateStr.split('T')[0];
    return date >= monthStart && date <= monthEnd;
  };

  // Prepare focus data by date
  const focusByDate = focusLogs
    .filter(log => isSelectedMonth(log.date))
    .reduce((acc, log) => {
      if (!acc[log.date]) {
        acc[log.date] = { date: log.date, GATE: 0, DEVELOPMENT: 0, RESEARCH: 0, COLLEGE: 0, total: 0 };
      }
      acc[log.date][log.category] = log.minutes;
      acc[log.date].total += log.minutes;
      return acc;
    }, {} as Record<string, any>);

  const focusChartData = Object.values(focusByDate)
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .map((d: any) => ({
      ...d,
      date: d.date.slice(5), // MM-DD format
    }));

  // Phone usage trend
  const phoneChartData = phoneLogs
    .filter(log => isSelectedMonth(log.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(log => ({
      date: log.date.slice(5),
      minutes: log.minutes,
      hours: Math.round(log.minutes / 60 * 10) / 10,
    }));

  // Sleep trend
  const sleepChartData = healthLogs
    .filter(l => l.sleep_hours !== undefined && isSelectedMonth(l.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(log => ({
      date: log.date.slice(5),
      hours: log.sleep_hours,
    }));

  // Running trend
  const runningChartData = healthLogs
    .filter(l => l.running_km !== undefined && l.running_km > 0 && isSelectedMonth(l.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(log => ({
      date: log.date.slice(5),
      km: log.running_km,
    }));

  // Weight trend
  const weightChartData = healthLogs
    .filter(l => l.weight_kg !== undefined && l.weight_kg > 0 && isSelectedMonth(l.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(log => ({
      date: log.date.slice(5),
      kg: log.weight_kg,
    }));

  // Task completion data
  const tasksByDate = tasks
    .filter(task => isSelectedMonth(task.active_date))
    .reduce((acc, task) => {
      const date = task.active_date;
      if (!acc[date]) {
        acc[date] = { date, completed: 0, pending: 0 };
      }
      if (task.status === 'completed') {
        acc[date].completed++;
      } else {
        acc[date].pending++;
      }
      return acc;
    }, {} as Record<string, any>);

  const taskChartData = Object.values(tasksByDate)
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .map((d: any) => ({
      ...d,
      date: d.date.slice(5),
    }));

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">Analytics</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">{monthName}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="focus" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="focus">Focus</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          <TabsContent value="focus" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={focusChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}m`, '']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="GATE" stroke={FOCUS_COLORS.GATE} strokeWidth={2} name="GATE" dot={{ fill: FOCUS_COLORS.GATE }} />
                  <Line type="monotone" dataKey="DEVELOPMENT" stroke={FOCUS_COLORS.DEVELOPMENT} strokeWidth={2} name="Dev" dot={{ fill: FOCUS_COLORS.DEVELOPMENT }} />
                  <Line type="monotone" dataKey="RESEARCH" stroke={FOCUS_COLORS.RESEARCH} strokeWidth={2} name="Research" dot={{ fill: FOCUS_COLORS.RESEARCH }} />
                  <Line type="monotone" dataKey="COLLEGE" stroke={FOCUS_COLORS.COLLEGE} strokeWidth={2} name="College" dot={{ fill: FOCUS_COLORS.COLLEGE }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={taskChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="hsl(var(--success))" strokeWidth={2} name="Completed" dot={{ fill: 'hsl(var(--success))' }} />
                  <Line type="monotone" dataKey="pending" stroke="hsl(var(--warning))" strokeWidth={2} name="Pending" dot={{ fill: 'hsl(var(--warning))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={phoneChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} hrs`, 'Screen Time']}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 12]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} hrs`, 'Sleep']}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name="Sleep Hours"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {runningChartData.length > 0 && (
              <div className="h-48">
                <p className="text-sm text-muted-foreground mb-2">Running Distance</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={runningChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value} km`, 'Distance']}
                    />
                    <Line type="monotone" dataKey="km" stroke="hsl(var(--success))" strokeWidth={2} name="Distance" dot={{ fill: 'hsl(var(--success))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {weightChartData.length > 0 && (
              <div className="h-48">
                <p className="text-sm text-muted-foreground mb-2">Body Weight</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value} kg`, 'Weight']}
                    />
                    <Line type="monotone" dataKey="kg" stroke="hsl(var(--primary))" strokeWidth={2} name="Weight" dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
