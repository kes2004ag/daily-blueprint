import { useState } from 'react';
import { Clock, BookOpen, Code, FlaskConical, GraduationCap, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { FocusCategory, FocusLog } from '@/types/database';

interface FocusTrackerProps {
  logs: FocusLog[];
  onSetFocusTime: (category: FocusCategory, minutes: number) => void;
  isReadOnly?: boolean;
}

const CATEGORIES: { id: FocusCategory; label: string; icon: React.ReactNode; colorClass: string }[] = [
  { id: 'GATE', label: 'GATE', icon: <BookOpen className="h-4 w-4" />, colorClass: 'focus-category-gate' },
  { id: 'DEVELOPMENT', label: 'Development', icon: <Code className="h-4 w-4" />, colorClass: 'focus-category-development' },
  { id: 'RESEARCH', label: 'Research', icon: <FlaskConical className="h-4 w-4" />, colorClass: 'focus-category-research' },
  { id: 'COLLEGE', label: 'College', icon: <GraduationCap className="h-4 w-4" />, colorClass: 'focus-category-college' },
];

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function FocusTracker({ logs, onSetFocusTime, isReadOnly = false }: FocusTrackerProps) {
  const [editingCategory, setEditingCategory] = useState<FocusCategory | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FocusCategory>('GATE');
  const [focusMinutes, setFocusMinutes] = useState('');

  const getMinutesForCategory = (category: FocusCategory) => {
    return logs.find(l => l.category === category)?.minutes ?? 0;
  };

  const totalMinutes = logs.reduce((sum, l) => sum + l.minutes, 0);

  const handleSave = (category: FocusCategory) => {
    const minutes = parseInt(inputValue) || 0;
    onSetFocusTime(category, minutes);
    setEditingCategory(null);
    setInputValue('');
  };

  const handleEdit = (category: FocusCategory) => {
    setEditingCategory(category);
    setInputValue(getMinutesForCategory(category).toString());
  };

  const handleAddFocusTime = () => {
    const minutes = parseInt(focusMinutes) || 0;
    if (minutes > 0) {
      onSetFocusTime(selectedCategory, minutes);
      setFocusMinutes('');
      setSelectedCategory('GATE');
      setDialogOpen(false);
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="font-display flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Focus Time
          </span>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-medium">
              {formatTime(totalMinutes)}
            </Badge>
            {!isReadOnly && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Time
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Focus Time</DialogTitle>
                    <DialogDescription>
                      Select a category and add how many minutes you spent focusing.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map(({ id, label, icon }) => (
                          <Button
                            key={id}
                            variant={selectedCategory === id ? "default" : "outline"}
                            onClick={() => setSelectedCategory(id)}
                            className="justify-start"
                          >
                            {icon}
                            <span className="ml-2 text-xs">{label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="minutes" className="text-sm font-medium">Minutes</label>
                      <Input
                        id="minutes"
                        type="number"
                        value={focusMinutes}
                        onChange={(e) => setFocusMinutes(e.target.value)}
                        placeholder="e.g., 45"
                        min="0"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddFocusTime} disabled={!focusMinutes.trim()}>
                        Add Time
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {CATEGORIES.map(({ id, label, icon, colorClass }) => {
            const minutes = getMinutesForCategory(id);
            const isEditing = editingCategory === id;

            return (
              <div
                key={id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  colorClass
                )}
              >
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="font-medium text-sm">{label}</span>
                </div>
                
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-20 h-8 text-right"
                      placeholder="min"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(id);
                        if (e.key === 'Escape') setEditingCategory(null);
                      }}
                    />
                    <Button size="sm" variant="ghost" onClick={() => handleSave(id)}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => !isReadOnly && handleEdit(id)}
                    disabled={isReadOnly}
                    className="font-mono"
                  >
                    {formatTime(minutes)}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
