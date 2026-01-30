import { useState } from 'react';
import { Plus, Check, Clock } from 'lucide-react';
import { format, parseISO, isToday, differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/database';

interface TaskListProps {
  tasks: Task[];
  date: string;
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  isReadOnly?: boolean;
}

export function TaskList({ tasks, date, onAddTask, onToggleTask, isReadOnly = false }: TaskListProps) {
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask('');
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const getTaskAge = (task: Task) => {
    if (task.origin_date === task.active_date) return null;
    const days = differenceInDays(parseISO(task.active_date), parseISO(task.origin_date));
    return days;
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="font-display">Tasks</span>
          <Badge variant="secondary" className="font-normal">
            {completedTasks.length}/{tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isReadOnly && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newTask.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="space-y-2">
          {pendingTasks.map((task) => {
            const age = getTaskAge(task);
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  age ? "bg-warning/10 border border-warning/20" : "bg-secondary/50"
                )}
              >
                <Checkbox
                  checked={false}
                  onCheckedChange={() => !isReadOnly && onToggleTask(task.id)}
                  disabled={isReadOnly}
                />
                <span className="flex-1 text-sm">{task.title}</span>
                {age && (
                  <Badge variant="outline" className="text-xs bg-warning/20 border-warning/30 text-warning-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {age}d old
                  </Badge>
                )}
              </div>
            );
          })}

          {completedTasks.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Check className="h-3 w-3" /> Completed
              </p>
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-success/5"
                >
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => !isReadOnly && onToggleTask(task.id)}
                    disabled={isReadOnly}
                  />
                  <span className="flex-1 text-sm text-muted-foreground line-through">
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tasks.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              {isReadOnly ? 'No tasks recorded for this day' : 'No tasks yet. Add your first task above.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
