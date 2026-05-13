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

const CATEGORIES: { id: FocusCategory; label: string; icon: React.ReactNode; colorClass: string; bgClass: string }[] = [
  { id: 'GATE', label: 'GATE', icon: <BookOpen className="h-4 w-4" />, colorClass: 'text-violet-600 dark:text-violet-400', bgClass: 'bg-violet-500/10 border-violet-500/20' },
  { id: 'DSA', label: 'DSA', icon: <BookOpen className="h-4 w-4" />, colorClass: 'text-blue-600 dark:text-blue-400', bgClass: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'DEVELOPMENT', label: 'Development', icon: <Code className="h-4 w-4" />, colorClass: 'text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/20' },
  { id: 'RESEARCH', label: 'Research', icon: <FlaskConical className="h-4 w-4" />, colorClass: 'text-purple-600 dark:text-purple-400', bgClass: 'bg-purple-500/10 border-purple-500/20' },
  { id: 'COLLEGE', label: 'College', icon: <GraduationCap className="h-4 w-4" />, colorClass: 'text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-500/10 border-amber-500/20' },
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
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 shadow-xl">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="flex items-center justify-between">
          <span className="font-display text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Focus Time
          </span>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border border-primary/20 font-bold text-sm px-3 py-0.5 rounded-full">
              {formatTime(totalMinutes)}
            </Badge>
            {!isReadOnly && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="h-8 px-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Add Focus Time</DialogTitle>
                    <DialogDescription>
                      Select a category and enter how many minutes you focused.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-5 pt-2">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Category</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map(({ id, label, icon, colorClass, bgClass }) => (
                          <Button
                            key={id}
                            variant="outline"
                            onClick={() => setSelectedCategory(id)}
                            className={cn(
                              "justify-start h-12 border-2 transition-all",
                              selectedCategory === id 
                                ? cn("border-primary bg-primary/5", colorClass)
                                : "border-border hover:border-border/80"
                            )}
                          >
                            <span className={colorClass}>{icon}</span>
                            <span className="ml-2 text-sm font-medium">{label}</span>
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
                        className="h-12 text-lg"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setDialogOpen(false)}
                        className="flex-1 h-11"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddFocusTime} 
                        disabled={!focusMinutes.trim()}
                        className="flex-1 h-11 shadow-md"
                      >
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
      <CardContent className="p-4">
        <div className="grid gap-2.5">
          {CATEGORIES.map(({ id, label, icon, colorClass, bgClass }) => {
            const minutes = getMinutesForCategory(id);
            const isEditing = editingCategory === id;

            return (
              <div
                key={id}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border transition-all",
                  bgClass,
                  "hover:shadow-sm"
                )}
              >
                <div className={cn("flex items-center gap-2.5", colorClass)}>
                  {icon}
                  <span className="font-medium text-sm text-foreground">{label}</span>
                </div>
                
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-20 h-8 text-right text-sm"
                      placeholder="min"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(id);
                        if (e.key === 'Escape') setEditingCategory(null);
                      }}
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleSave(id)}
                      className="h-8 px-2 text-xs"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => !isReadOnly && handleEdit(id)}
                    disabled={isReadOnly}
                    className={cn(
                      "font-mono font-semibold text-sm h-8 px-3 rounded-lg",
                      minutes > 0 ? colorClass : "text-muted-foreground"
                    )}
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
