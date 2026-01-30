import { CalendarDays, BarChart3, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type View = 'today' | 'calendar' | 'analytics';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'today' as View, label: 'Today', icon: Home },
    { id: 'calendar' as View, label: 'Calendar', icon: CalendarDays },
    { id: 'analytics' as View, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:static md:bottom-auto z-50">
      <div className="bg-card/95 backdrop-blur-lg border-t md:border-t-0 md:border-b border-border shadow-lg md:shadow-none">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-around md:justify-start md:gap-2 py-2 sm:py-3">
            {navItems.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={currentView === id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange(id)}
                className={cn(
                  "flex-col md:flex-row gap-1 h-auto py-3 px-4 md:px-6 min-w-[80px] md:min-w-0",
                  "touch-manipulation", // Better touch response
                  currentView === id && "shadow-lg"
                )}
              >
                <Icon className="h-5 w-5 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm font-medium">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
