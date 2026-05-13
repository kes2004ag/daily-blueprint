import { useState } from 'react';
import { Trash2, Check, Plus, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { MonthlyTarget } from '@/types/database';

interface MonthlyTargetsProps {
  targets: MonthlyTarget[];
  onAddTarget: (data: { title: string; description?: string }) => void;
  onEditTarget: (id: string, title: string, description?: string) => void;
  onToggleTarget: (id: string) => void;
  onDeleteTarget: (id: string) => void;
  currentMonth: string; // YYYY-MM format
  selectedMonth: string; // YYYY-MM format
  onMonthChange: (month: string) => void;
}

export function MonthlyTargets({
  targets,
  onAddTarget,
  onEditTarget,
  onToggleTarget,
  onDeleteTarget,
  currentMonth,
  selectedMonth,
  onMonthChange,
}: MonthlyTargetsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');

  const handleAddTarget = () => {
    if (titleInput.trim()) {
      onAddTarget({
        title: titleInput,
        description: descriptionInput || undefined,
      });
      setTitleInput('');
      setDescriptionInput('');
      setIsAdding(false);
    }
  };

  const handleEditTarget = (id: string) => {
    const target = targets.find(t => t.id === id);
    if (target) {
      setEditingId(id);
      setTitleInput(target.title);
      setDescriptionInput(target.description || '');
    }
  };

  const handleSaveEdit = () => {
    if (editingId && titleInput.trim()) {
      onEditTarget(editingId, titleInput, descriptionInput || undefined);
      setEditingId(null);
      setTitleInput('');
      setDescriptionInput('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitleInput('');
    setDescriptionInput('');
  };

  const completedCount = targets.filter(t => t.status === 'completed').length;
  
  const handlePreviousMonth = () => {
    const [year, month] = selectedMonth.split('-');
    let newMonth = parseInt(month) - 1;
    let newYear = parseInt(year);
    
    if (newMonth === 0) {
      newMonth = 12;
      newYear--;
    }
    
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-');
    let newMonth = parseInt(month) + 1;
    let newYear = parseInt(year);
    
    if (newMonth === 13) {
      newMonth = 1;
      newYear++;
    }
    
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const monthName = new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  
  const isCurrentMonth = selectedMonth === currentMonth;

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <CardTitle className="font-display">Monthly Goals</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {monthName}
              {!isCurrentMonth && ' (Past)'}
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[88px] text-center text-muted-foreground">
              {completedCount}/{targets.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Completed targets */}
        {targets.filter(t => t.status === 'completed').length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-success uppercase">Completed</p>
            {targets
              .filter(t => t.status === 'completed')
              .map(target => (
                <div
                  key={target.id}
                  className="flex items-start gap-3 p-2 rounded-lg bg-success/5 border border-success/20"
                >
                  {isCurrentMonth ? (
                    <button
                      onClick={() => onToggleTarget(target.id)}
                      className="mt-1 text-success"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="mt-1 text-success">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-through text-muted-foreground">
                      {target.title}
                    </p>
                    {target.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {target.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteTarget(target.id)}
                    className="text-destructive hover:text-destructive/80 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* Pending targets */}
        {targets.filter(t => t.status === 'pending').length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-primary uppercase">In Progress</p>
            {targets
              .filter(t => t.status === 'pending')
              .map(target => (
                editingId === target.id ? (
                  <div key={target.id} className="space-y-3 p-3 border border-primary rounded-lg bg-card">
                    <div>
                      <Label className="text-sm">Goal Title</Label>
                      <Input
                        placeholder="Goal title"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && titleInput.trim()) handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Description (optional)</Label>
                      <Textarea
                        placeholder="Add details..."
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                        className="mt-1 resize-none h-20"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit} disabled={!titleInput.trim()}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={target.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors"
                  >
                    {isCurrentMonth ? (
                      <button
                        onClick={() => onToggleTarget(target.id)}
                        className="mt-1 text-muted-foreground hover:text-primary p-1"
                      >
                        <div className="h-4 w-4 border rounded border-primary" />
                      </button>
                    ) : (
                      <div className="mt-1 text-muted-foreground p-1">
                        <div className="h-4 w-4 border rounded border-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{target.title}</p>
                      {target.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {target.description}
                        </p>
                      )}
                    </div>
                    {isCurrentMonth && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleEditTarget(target.id)}
                          className="text-muted-foreground hover:text-primary p-1"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTarget(target.id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              ))}
          </div>
        )}

        {/* Add new target */}
        {isAdding ? (
          <div className="space-y-3 p-3 border border-dashed border-border rounded-lg">
            <div>
              <Label className="text-sm">Goal Title</Label>
              <Input
                placeholder="e.g., Complete project, Read 2 books..."
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && titleInput.trim()) handleAddTarget();
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setTitleInput('');
                    setDescriptionInput('');
                  }
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Description (optional)</Label>
              <Textarea
                placeholder="Add details about your goal..."
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                className="mt-1 resize-none h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddTarget}
                disabled={!titleInput.trim()}
              >
                Add Goal
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setTitleInput('');
                  setDescriptionInput('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : isCurrentMonth ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Monthly Goal
          </Button>
        ) : null}

        {/* Empty state */}
        {targets.length === 0 && !isAdding && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No monthly goals yet</p>
            <p className="text-xs mt-1">Set goals for {monthName}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
