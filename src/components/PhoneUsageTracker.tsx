import { useState } from 'react';
import { Smartphone, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PhoneUsageTrackerProps {
  minutes: number;
  onSetUsage: (minutes: number) => void;
  isReadOnly?: boolean;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getUsageLevel(minutes: number): { label: string; color: string; icon: React.ReactNode } {
  if (minutes <= 60) return { 
    label: 'Great', 
    color: 'bg-success/10 text-success border-success/25',
    icon: <TrendingDown className="h-3.5 w-3.5" />
  };
  if (minutes <= 120) return { 
    label: 'Good', 
    color: 'bg-primary/10 text-primary border-primary/25',
    icon: <Minus className="h-3.5 w-3.5" />
  };
  if (minutes <= 180) return { 
    label: 'High', 
    color: 'bg-warning/10 text-warning-foreground border-warning/25',
    icon: <TrendingUp className="h-3.5 w-3.5" />
  };
  return { 
    label: 'Excessive', 
    color: 'bg-destructive/10 text-destructive border-destructive/25',
    icon: <TrendingUp className="h-3.5 w-3.5" />
  };
}

export function PhoneUsageTracker({ minutes, onSetUsage, isReadOnly = false }: PhoneUsageTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(minutes.toString());

  const handleSave = () => {
    const newMinutes = parseInt(inputValue) || 0;
    onSetUsage(newMinutes);
    setIsEditing(false);
  };

  const usageLevel = getUsageLevel(minutes);

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 shadow-xl">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="flex items-center justify-between">
          <span className="font-display text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            Phone Usage
          </span>
          {minutes > 0 && (
            <Badge className={cn("font-semibold text-xs flex items-center gap-1 border px-2.5 py-0.5 rounded-full", usageLevel.color)}>
              {usageLevel.icon}
              {usageLevel.label}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 h-12 text-lg"
              placeholder="Minutes"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
            <Button 
              onClick={handleSave}
              className="h-12 px-6 shadow-md"
            >
              Save
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-between h-14 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all group"
            onClick={() => {
              if (!isReadOnly) {
                setInputValue(minutes.toString());
                setIsEditing(true);
              }
            }}
            disabled={isReadOnly}
          >
            <span className="text-muted-foreground font-medium">Screen time today</span>
            <span className={cn(
              "font-mono font-bold text-lg transition-colors",
              minutes > 180 ? "text-destructive" : "text-foreground group-hover:text-primary"
            )}>
              {formatTime(minutes)}
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
