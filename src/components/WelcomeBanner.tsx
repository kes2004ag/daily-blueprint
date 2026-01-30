import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WelcomeBannerProps {
  userName?: string;
  hasTasksToday: boolean;
  carriedForwardCount: number;
}

export function WelcomeBanner({ userName, hasTasksToday, carriedForwardCount }: WelcomeBannerProps) {
  if (carriedForwardCount > 0) {
    return (
      <Alert className="bg-warning/10 border-warning/30">
        <AlertCircle className="h-4 w-4 text-warning-foreground flex-shrink-0" />
        <AlertDescription className="text-warning-foreground text-xs sm:text-sm">
          {carriedForwardCount} task{carriedForwardCount > 1 ? 's' : ''} carried forward from previous days. 
          Time to complete them!
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasTasksToday) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        <AlertDescription className="text-xs sm:text-sm">
          Good morning, Keshav Agarwal! Start your day by adding your first task.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
