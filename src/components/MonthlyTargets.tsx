import { useState } from 'react';
import { Trash2, Check, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { MonthlyTarget } from '@/types/database';

interface MonthlyTargetsProps {
  targets: MonthlyTarget[];
  onAddTarget: (data: { title: string; description?: string }) => void;
  onToggleTarget: (id: string) => void;
  onDeleteTarget: (id: string) => void;
  currentMonth: string; // YYYY-MM format
}

export function MonthlyTargets({
  targets,
  onAddTarget,
  onToggleTarget,
  onDeleteTarget,
  currentMonth,
}: MonthlyTargetsProps) {
  const [isAdding, setIsAdding] = useState(false);
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

  const completedCount = targets.filter(t => t.status === 'completed').length;
  const monthName = new Date(`${currentMonth}-01`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display">Monthly Goals</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {monthName}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {completedCount}/{targets.length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
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
                  <button
                    onClick={() => onToggleTarget(target.id)}
                    className="mt-1 text-success"
                  >
                    <Check className="h-4 w-4" />
                  </button>
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
                <div
                  key={target.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors"
                >
                  <button
                    onClick={() => onToggleTarget(target.id)}
                    className="mt-1 text-muted-foreground hover:text-primary p-1"
                  >
                    <div className="h-4 w-4 border rounded border-primary" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{target.title}</p>
                    {target.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {target.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteTarget(target.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Monthly Goal
          </Button>
        )}

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
