import { Clock, CheckCircle, Smartphone, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  focusMinutes: number;
  tasksCompleted: number;
  totalTasks: number;
  phoneMinutes: number;
  sleepHours: number;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function SummaryCard({ 
  focusMinutes, 
  tasksCompleted, 
  totalTasks, 
  phoneMinutes, 
  sleepHours 
}: SummaryCardProps) {
  const stats = [
    {
      label: 'Focus Time',
      value: formatTime(focusMinutes),
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Tasks Done',
      value: `${tasksCompleted}/${totalTasks}`,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Screen Time',
      value: formatTime(phoneMinutes),
      icon: Smartphone,
      color: phoneMinutes > 180 ? 'text-destructive' : 'text-muted-foreground',
      bgColor: phoneMinutes > 180 ? 'bg-destructive/10' : 'bg-muted',
    },
    {
      label: 'Sleep',
      value: `${sleepHours}h`,
      icon: Moon,
      color: sleepHours >= 7 ? 'text-primary' : 'text-warning-foreground',
      bgColor: sleepHours >= 7 ? 'bg-primary/10' : 'bg-warning/10',
    },
  ];

  return (
    <Card className="glass">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bgColor }) => (
            <div key={label} className="text-center">
              <div className={cn("inline-flex items-center justify-center w-10 h-10 rounded-full mb-2", bgColor)}>
                <Icon className={cn("h-5 w-5", color)} />
              </div>
              <p className="text-xl font-semibold font-display">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
