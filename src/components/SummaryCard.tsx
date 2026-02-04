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
      ringColor: 'ring-primary/20',
    },
    {
      label: 'Tasks Done',
      value: `${tasksCompleted}/${totalTasks}`,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      ringColor: 'ring-success/20',
    },
    {
      label: 'Screen Time',
      value: formatTime(phoneMinutes),
      icon: Smartphone,
      color: phoneMinutes > 180 ? 'text-destructive' : 'text-muted-foreground',
      bgColor: phoneMinutes > 180 ? 'bg-destructive/10' : 'bg-muted/50',
      ringColor: phoneMinutes > 180 ? 'ring-destructive/20' : 'ring-border',
    },
    {
      label: 'Sleep',
      value: `${sleepHours}h`,
      icon: Moon,
      color: sleepHours >= 7 ? 'text-primary' : 'text-warning-foreground',
      bgColor: sleepHours >= 7 ? 'bg-primary/10' : 'bg-warning/10',
      ringColor: sleepHours >= 7 ? 'ring-primary/20' : 'ring-warning/20',
    },
  ];

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card shadow-xl backdrop-blur-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map(({ label, value, icon: Icon, color, bgColor, ringColor }) => (
            <div 
              key={label} 
              className="flex flex-col items-center text-center group"
            >
              <div className={cn(
                "relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-2 sm:mb-3",
                "ring-1 transition-all duration-300",
                bgColor,
                ringColor,
                "group-hover:scale-105 group-hover:shadow-md"
              )}>
                <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", color)} />
              </div>
              <p className="text-xl sm:text-2xl font-bold font-display tracking-tight">{value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
