import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface WelcomeBannerProps {
  userName?: string;
  hasTasksToday: boolean;
  carriedForwardCount: number;
}

export function WelcomeBanner({ userName, hasTasksToday, carriedForwardCount }: WelcomeBannerProps) {
  if (carriedForwardCount > 0) {
    return (
      <Alert className="bg-gradient-to-r from-warning/15 to-warning/5 border-warning/30 shadow-sm">
        <AlertCircle className="h-4 w-4 text-warning-foreground flex-shrink-0" />
        <AlertDescription className="text-warning-foreground text-sm font-medium">
          <span className="font-bold">{carriedForwardCount}</span> task{carriedForwardCount > 1 ? 's' : ''} carried forward from previous days. 
          <span className="hidden sm:inline"> Time to complete them!</span>
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasTasksToday) {
    return (
      <Alert className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-sm">
        <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
        <AlertDescription className="text-sm">
          <span className="font-semibold">Good morning!</span> Start your day by adding your first task.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
