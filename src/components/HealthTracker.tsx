import { useState } from 'react';
import { Moon, Activity, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { HealthLog } from '@/types/database';

interface HealthTrackerProps {
  healthData: HealthLog | undefined;
  onSetHealth: (data: { sleep_hours?: number; running_km?: number; running_minutes?: number; weight_kg?: number }) => void;
  isReadOnly?: boolean;
}

export function HealthTracker({ healthData, onSetHealth, isReadOnly = false }: HealthTrackerProps) {
  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [isEditingRunning, setIsEditingRunning] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [sleepInput, setSleepInput] = useState(healthData?.sleep_hours?.toString() ?? '');
  const [runningKmInput, setRunningKmInput] = useState(healthData?.running_km?.toString() ?? '');
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

  const handleSaveWeight = () => {
    const kg = parseFloat(weightInput) || 0;
    onSetHealth({ ...healthData, weight_kg: kg });
    setIsEditingWeight(false);
  };

  const getSleepQuality = (hours: number) => {
    if (hours >= 7 && hours <= 9) return { label: 'Optimal', color: 'text-success font-semibold' };
    if (hours >= 6 && hours < 7) return { label: 'Okay', color: 'text-primary font-semibold' };
    if (hours < 6) return { label: 'Low', color: 'text-destructive font-semibold' };
    return { label: 'Too much', color: 'text-warning font-semibold' };
  };

  const sleepHours = healthData?.sleep_hours ?? 0;
  const runningKm = healthData?.running_km ?? 0;
  const sleepQuality = getSleepQuality(sleepHours);

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="font-display">Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sleep tracking */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-muted-foreground">
            <Moon className="h-4 w-4" />
            Sleep
          </Label>
          {isEditingSleep ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.5"
                value={sleepInput}
                onChange={(e) => setSleepInput(e.target.value)}
                className="flex-1"
                placeholder="Hours"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveSleep();
                  if (e.key === 'Escape') setIsEditingSleep(false);
                }}
              />
              <Button size="sm" onClick={handleSaveSleep}>Save</Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => {
                if (!isReadOnly) {
                  setSleepInput(sleepHours.toString());
                  setIsEditingSleep(true);
                }
              }}
              disabled={isReadOnly}
            >
              <span>Hours slept</span>
              <span className="flex items-center gap-2">
                <span className="font-mono">{sleepHours}h</span>
                {sleepHours > 0 && sleepQuality.label !== 'Low' && (
                  <span className={`text-xs ${sleepQuality.color}`}>({sleepQuality.label})</span>
                )}
              </span>
            </Button>
          )}
        </div>

        {/* Running tracking */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            Running
          </Label>
          {isEditingRunning ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                value={runningKmInput}
                onChange={(e) => setRunningKmInput(e.target.value)}
                className="flex-1"
                placeholder="Kilometers"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRunning();
                  if (e.key === 'Escape') setIsEditingRunning(false);
                }}
              />
              <Button size="sm" onClick={handleSaveRunning}>Save</Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => {
                if (!isReadOnly) {
                  setRunningKmInput(runningKm.toString());
                  setIsEditingRunning(true);
                }
              }}
              disabled={isReadOnly}
            >
              <span>Distance</span>
              <span className="font-mono">{runningKm} km</span>
            </Button>
          )}
        </div>

        {/* Weight tracking */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-muted-foreground">
            <Scale className="h-4 w-4" />
            Weight
          </Label>
          {isEditingWeight ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="flex-1"
                placeholder="Kilograms"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveWeight();
                  if (e.key === 'Escape') setIsEditingWeight(false);
                }}
              />
              <Button size="sm" onClick={handleSaveWeight}>Save</Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => {
                if (!isReadOnly) {
                  setWeightInput((healthData?.weight_kg ?? '').toString());
                  setIsEditingWeight(true);
                }
              }}
              disabled={isReadOnly}
            >
              <span>Body Weight</span>
              <span className="font-mono">{healthData?.weight_kg ? `${healthData.weight_kg} kg` : 'Not set'}</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
