import { useState } from 'react';
import { Plus, Check, Clock, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { parseISO, differenceInDays } from 'date-fns';
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
  onEditTask?: (taskId: string, newTitle: string) => void;
  onDeleteTask?: (taskId: string) => void;
  isReadOnly?: boolean;
}

export function TaskList({ tasks, date, onAddTask, onToggleTask, onEditTask, onDeleteTask, isReadOnly = false }: TaskListProps) {
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask('');
    }
  };

  const handleSaveEdit = (taskId: string) => {
    if (editingTaskTitle.trim() && onEditTask) {
      onEditTask(taskId, editingTaskTitle.trim());
      setEditingTaskId(null);
      setEditingTaskTitle('');
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
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 shadow-xl">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="flex items-center justify-between">
          <span className="font-display text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Tasks
          </span>
          <Badge 
            variant="secondary" 
            className={cn(
              "font-semibold text-xs px-2.5 py-0.5 rounded-full",
              completedTasks.length === tasks.length && tasks.length > 0 
                ? "bg-success/15 text-success border border-success/20"
                : "bg-muted"
            )}
          >
            {completedTasks.length}/{tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {!isReadOnly && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 h-11 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!newTask.trim()}
              className="h-11 w-11 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </form>
        )}

        <div className="space-y-2">
          {pendingTasks.map((task) => {
            const age = getTaskAge(task);
            const isEditing = editingTaskId === task.id;
            
            return (
              <div
                key={task.id}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                  age 
                    ? "bg-warning/10 border border-warning/25 hover:border-warning/40" 
                    : "bg-muted/30 border border-transparent hover:border-border/50 hover:bg-muted/50"
                )}
              >
                <Checkbox
                  checked={false}
                  onCheckedChange={() => !isReadOnly && onToggleTask(task.id)}
                  disabled={isReadOnly}
                  className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                
                {isEditing ? (
                  <Input
                    value={editingTaskTitle}
                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                    className="flex-1 h-8 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(task.id);
                      if (e.key === 'Escape') setEditingTaskId(null);
                    }}
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium">{task.title}</span>
                )}
                
                {age && (
                  <Badge 
                    variant="outline" 
                    className="text-[10px] bg-warning/15 border-warning/30 text-warning-foreground font-semibold px-2"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {age}d
                  </Badge>
                )}
                
                {!isReadOnly && (
                  <div className={cn(
                    "flex gap-0.5 transition-opacity",
                    !isEditing && "opacity-0 group-hover:opacity-100"
                  )}>
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveEdit(task.id)}
                          className="h-7 px-2 text-xs rounded-lg"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTaskId(null)}
                          className="h-7 px-2 text-xs rounded-lg"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTaskId(task.id);
                            setEditingTaskTitle(task.title);
                          }}
                          className="h-7 w-7 p-0 rounded-lg hover:bg-muted"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteTask && onDeleteTask(task.id)}
                          className="h-7 w-7 p-0 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {completedTasks.length > 0 && (
            <div className="pt-3 mt-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5 font-medium uppercase tracking-wide">
                <Check className="h-3.5 w-3.5 text-success" /> 
                Completed
              </p>
              <div className="space-y-1.5">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 p-2.5 rounded-lg bg-success/5 hover:bg-success/10 transition-colors"
                  >
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => !isReadOnly && onToggleTask(task.id)}
                      disabled={isReadOnly}
                      className="h-5 w-5 rounded-md border-success/50 data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <span className="flex-1 text-sm text-muted-foreground line-through">
                      {task.title}
                    </span>
                    {!isReadOnly && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteTask && onDeleteTask(task.id)}
                        className="h-7 w-7 p-0 rounded-lg opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium">
                {isReadOnly ? 'No tasks recorded' : 'No tasks yet'}
              </p>
              <p className="text-xs mt-1">
                {isReadOnly ? 'for this day' : 'Add your first task above'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
