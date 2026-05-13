import { useState } from 'react';
import { Moon, Activity, Scale, Heart, Footprints } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { HealthLog } from '@/types/database';

interface HealthTrackerProps {
  healthData: HealthLog | undefined;
  onSetHealth: (data: { sleep_hours?: number; running_km?: number; running_minutes?: number; steps?: number; weight_kg?: number }) => void;
  isReadOnly?: boolean;
}

export function HealthTracker({ healthData, onSetHealth, isReadOnly = false }: HealthTrackerProps) {
  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [isEditingRunning, setIsEditingRunning] = useState(false);
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [sleepInput, setSleepInput] = useState(healthData?.sleep_hours?.toString() ?? '');
  const [runningKmInput, setRunningKmInput] = useState(healthData?.running_km?.toString() ?? '');
  const [stepsInput, setStepsInput] = useState(healthData?.steps?.toString() ?? '');
  const [weightInput, setWeightInput] = useState(healthData?.weight_kg?.toString() ?? '');

  const handleSaveSleep = () => {
    const hours = parseFloat(sleepInput) || 0;
    onSetHealth({ ...healthData, sleep_hours: hours });
    setIsEditingSleep(false);
  };

  const handleSaveRunning = () => {
    const km = parseFloat(runningKmInput) || 0;
    onSetHealth({ ...healthData, running_km: km });
    setIsEditingRunning(false);
  };

  const handleSaveSteps = () => {
    const steps = parseInt(stepsInput) || 0;
    onSetHealth({ ...healthData, steps });
    setIsEditingSteps(false);
  };

  const handleSaveWeight = () => {
    const kg = parseFloat(weightInput) || 0;
    onSetHealth({ ...healthData, weight_kg: kg });
    setIsEditingWeight(false);
  };

  const getSleepQuality = (hours: number) => {
    if (hours >= 7 && hours <= 9) return { label: 'Optimal', color: 'text-success bg-success/10 border-success/25' };
    if (hours >= 6 && hours < 7) return { label: 'Okay', color: 'text-primary bg-primary/10 border-primary/25' };
    if (hours < 6) return { label: 'Low', color: 'text-destructive bg-destructive/10 border-destructive/25' };
    return { label: 'High', color: 'text-warning-foreground bg-warning/10 border-warning/25' };
  };

  const sleepHours = healthData?.sleep_hours ?? 0;
  const runningKm = healthData?.running_km ?? 0;
  const steps = healthData?.steps ?? 0;
  const sleepQuality = getSleepQuality(sleepHours);

  const healthItems = [
    {
      id: 'sleep',
      label: 'Sleep',
      icon: Moon,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
      value: sleepHours,
      displayValue: `${sleepHours}h`,
      badge: sleepHours > 0 ? sleepQuality : null,
      isEditing: isEditingSleep,
      setIsEditing: setIsEditingSleep,
      inputValue: sleepInput,
      setInputValue: setSleepInput,
      onSave: handleSaveSleep,
      placeholder: 'Hours',
      step: '0.5',
    },
    {
      id: 'running',
      label: 'Running',
      icon: Activity,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      value: runningKm,
      displayValue: `${runningKm} km`,
      badge: runningKm >= 5 ? { label: 'Great', color: 'text-success bg-success/10 border-success/25' } : null,
      isEditing: isEditingRunning,
      setIsEditing: setIsEditingRunning,
      inputValue: runningKmInput,
      setInputValue: setRunningKmInput,
      onSave: handleSaveRunning,
      placeholder: 'Kilometers',
      step: '0.1',
    },
    {
      id: 'weight',
      label: 'Weight',
      icon: Scale,
      iconColor: 'text-teal-500',
      bgColor: 'bg-teal-500/10 border-teal-500/20',
      value: healthData?.weight_kg ?? 0,
      displayValue: healthData?.weight_kg ? `${healthData.weight_kg} kg` : 'Not set',
      badge: null,
      isEditing: isEditingWeight,
      setIsEditing: setIsEditingWeight,
      inputValue: weightInput,
      setInputValue: setWeightInput,
      onSave: handleSaveWeight,
      placeholder: 'Kilograms',
      step: '0.1',
    },
    {
      id: 'steps',
      label: 'Steps',
      icon: Footprints,
      iconColor: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      value: steps,
      displayValue: steps > 0 ? `${steps.toLocaleString()}` : 'Not set',
      badge: steps >= 10000 ? { label: '10k+', color: 'text-success bg-success/10 border-success/25' } : null,
      isEditing: isEditingSteps,
      setIsEditing: setIsEditingSteps,
      inputValue: stepsInput,
      setInputValue: setStepsInput,
      onSave: handleSaveSteps,
      placeholder: 'Steps',
      step: '1',
    },
  ];

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 shadow-xl">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" />
          Health
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {healthItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <div key={item.id} className={cn(
              "p-3.5 rounded-xl border transition-all",
              item.bgColor
            )}>
              {item.isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", item.iconColor)} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step={item.step}
                      value={item.inputValue}
                      onChange={(e) => item.setInputValue(e.target.value)}
                      className="flex-1 h-10"
                      placeholder={item.placeholder}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') item.onSave();
                        if (e.key === 'Escape') item.setIsEditing(false);
                      }}
                    />
                    <Button 
                      size="sm" 
                      onClick={item.onSave}
                      className="h-10 px-4"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  className="w-full flex items-center justify-between group"
                  onClick={() => {
                    if (!isReadOnly) {
                      item.setInputValue(item.value.toString());
                      item.setIsEditing(true);
                    }
                  }}
                  disabled={isReadOnly}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("h-4 w-4", item.iconColor)} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge className={cn("text-[10px] font-semibold border px-2 py-0", item.badge.color)}>
                        {item.badge.label}
                      </Badge>
                    )}
                    <span className={cn(
                      "font-mono font-semibold text-sm transition-colors",
                      !isReadOnly && "group-hover:text-primary"
                    )}>
                      {item.displayValue}
                    </span>
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
