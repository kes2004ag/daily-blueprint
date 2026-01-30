import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  hasDataForDate?: (date: Date) => boolean;
}

export function CalendarView({ selectedDate, onSelectDate, hasDataForDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display font-semibold text-lg">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2 border-r last:border-r-0 border-border/50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 border border-border rounded-lg overflow-hidden">
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const hasData = hasDataForDate?.(day);
            const isNewWeek = index % 7 === 0 && index !== 0;

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                className={cn(
                  "relative aspect-square flex items-center justify-center text-sm transition-all",
                  "hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:z-10",
                  "border-r border-b last:border-r-0",
                  "border-border/50",
                  index >= days.length - 7 && "border-b-0", // Remove bottom border for last row
                  !isCurrentMonth && "text-muted-foreground/40 bg-secondary/20",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary font-semibold",
                  isTodayDate && !isSelected && "ring-2 ring-primary/50 ring-inset font-semibold",
                )}
              >
                {format(day, 'd')}
                {hasData && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
