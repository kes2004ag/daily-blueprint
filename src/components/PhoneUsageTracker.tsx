import { useState } from 'react';
import { Smartphone } from 'lucide-react';
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

function getUsageLevel(minutes: number): { label: string; color: string } {
  if (minutes <= 60) return { label: 'Great', color: 'bg-success/10 text-success border-success/20' };
  if (minutes <= 120) return { label: 'Okay', color: 'bg-primary/10 text-primary border-primary/20' };
  if (minutes <= 180) return { label: 'High', color: 'bg-warning/10 text-warning-foreground border-warning/20' };
  return { label: 'Excessive', color: 'bg-destructive/10 text-destructive border-destructive/20' };
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
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="font-display flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            Phone Usage
          </span>
          {minutes > 0 && (
            <Badge className={cn("font-normal", usageLevel.color)}>
              {usageLevel.label}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1"
              placeholder="Minutes"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
            <Button onClick={handleSave}>Save</Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-between h-12"
            onClick={() => {
              if (!isReadOnly) {
                setInputValue(minutes.toString());
                setIsEditing(true);
              }
            }}
            disabled={isReadOnly}
          >
            <span className="text-muted-foreground">Screen time today</span>
            <span className="font-mono font-medium">{formatTime(minutes)}</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
