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
  // Prepare focus data by date
  const focusByDate = focusLogs.reduce((acc, log) => {
    if (!acc[log.date]) {
      acc[log.date] = { date: log.date, GATE: 0, DEVELOPMENT: 0, RESEARCH: 0, COLLEGE: 0, total: 0 };
    }
    acc[log.date][log.category] = log.minutes;
    acc[log.date].total += log.minutes;
    return acc;
  }, {} as Record<string, any>);

  const focusChartData = Object.values(focusByDate)
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .slice(-14) // Last 14 days
    .map((d: any) => ({
      ...d,
      date: d.date.slice(5), // MM-DD format
    }));

  // Phone usage trend
  const phoneChartData = phoneLogs
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map(log => ({
      date: log.date.slice(5),
      minutes: log.minutes,
      hours: Math.round(log.minutes / 60 * 10) / 10,
    }));

  // Sleep trend
  const sleepChartData = healthLogs
    .filter(l => l.sleep_hours !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map(log => ({
      date: log.date.slice(5),
      hours: log.sleep_hours,
    }));

  // Running trend
  const runningChartData = healthLogs
    .filter(l => l.running_km !== undefined && l.running_km > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map(log => ({
      date: log.date.slice(5),
      km: log.running_km,
    }));

  // Weight trend
  const weightChartData = healthLogs
    .filter(l => l.weight_kg !== undefined && l.weight_kg > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map(log => ({
      date: log.date.slice(5),
      kg: log.weight_kg,
    }));

  // Task completion data
  const tasksByDate = tasks.reduce((acc, task) => {
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
    .slice(-14)
    .map((d: any) => ({
      ...d,
      date: d.date.slice(5),
    }));

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="font-display">Analytics</CardTitle>
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
