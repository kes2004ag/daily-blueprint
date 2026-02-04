import { CalendarDays, BarChart3, Home, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type View = 'today' | 'calendar' | 'analytics' | 'goals';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'today' as View, label: 'Today', icon: Home },
    { id: 'goals' as View, label: 'Goals', icon: Target },
    { id: 'calendar' as View, label: 'Calendar', icon: CalendarDays },
    { id: 'analytics' as View, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:static md:bottom-auto z-50">
      <div className="bg-card/95 backdrop-blur-xl border-t md:border-t-0 md:border-b border-border/50 shadow-xl md:shadow-none">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-around md:justify-start md:gap-1 py-2 sm:py-3">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={cn(
                  "relative flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2",
                  "h-auto py-2.5 px-4 md:px-5 min-w-[72px] md:min-w-0",
                  "rounded-xl md:rounded-lg",
                  "transition-all duration-200 ease-out",
                  "touch-manipulation select-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  currentView === id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:scale-95"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 md:h-4 md:w-4 transition-transform",
                  currentView === id && "scale-110"
                )} />
                <span className={cn(
                  "text-[11px] md:text-sm font-medium",
                  currentView === id && "font-semibold"
                )}>
                  {label}
                </span>
                {/* Active indicator dot for mobile */}
                {currentView === id && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-foreground md:hidden" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
