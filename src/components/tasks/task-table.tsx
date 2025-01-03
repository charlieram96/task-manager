'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { TaskDetailsDialog } from './task-details-dialog';
import { TaskEditDialog } from './task-edit-dialog';
import { Task as TaskType, Department } from '@/lib/types';

interface Task extends Omit<TaskType, 'departments'> {
  departments?: string[];
  department?: string;
}

interface TaskTableProps {
  tasks: Task[];
  departments: Department[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  isReadOnly?: boolean;
}

const statusColors = {
  not_started: 'bg-blue-400/90 hover:bg-blue-400',
  in_progress: 'bg-green-500/90 hover:bg-green-500',
  completed: 'bg-red-500/90 hover:bg-red-500',
  blocked: 'bg-gray-900/90 hover:bg-gray-900',
};

const statusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
};

export function TaskTable({
  tasks,
  departments,
  onUpdateTask,
  onDeleteTask,
  isReadOnly = false,
}: TaskTableProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-blue-400/90 hover:bg-blue-400';
      case 'in_progress':
        return 'bg-green-500/90 hover:bg-green-500';
      case 'completed':
        return 'bg-red-500/90 hover:bg-red-500';
      case 'blocked':
        return 'bg-gray-900/90 hover:bg-gray-900';
      default:
        return 'bg-slate-500';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleRowClick = (task: Task, e: React.MouseEvent) => {
    // Don't open details if clicking on a button, dropdown, or form element
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest('button') || 
       e.target.closest('[role="menuitem"]') ||
       e.target.closest('input') ||
       e.target.closest('select') ||
       e.target.closest('[role="dialog"]') ||
       e.target.closest('[role="combobox"]'))
    ) {
      return;
    }
    setSelectedTask(task);
    setDetailsOpen(true);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Departments</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            {!isReadOnly && <TableHead className="w-[70px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={(e) => handleRowClick(task, e)}
            >
              <TableCell className="max-w-[300px]">
                <span className="block truncate">{task.description}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {task.departments ? (
                    task.departments.map((dept) => (
                      <Badge key={dept} variant="outline">
                        {dept}
                      </Badge>
                    ))
                  ) : task.department ? (
                    <Badge variant="outline">{task.department}</Badge>
                  ) : (
                    <span className="text-muted-foreground">No departments</span>
                  )}
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {isReadOnly ? (
                  <Badge className={statusColors[task.status]}>
                    {statusLabels[task.status]}
                  </Badge>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <Badge className={statusColors[task.status]}>
                          {statusLabels[task.status]}
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onUpdateTask(task.id, { status: 'not_started' })}>
                        Not Started
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateTask(task.id, { status: 'in_progress' })}>
                        In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateTask(task.id, { status: 'completed' })}>
                        Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateTask(task.id, { status: 'blocked' })}>
                        Blocked
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
              <TableCell>{format(new Date(task.dueDate), "PPP")}</TableCell>
              {!isReadOnly && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTask(task);
                          setEditOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeleteTask(task.id)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <p className="text-muted-foreground">No tasks found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a new task to get started
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TaskDetailsDialog
        task={selectedTask}
        departments={departments}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      <TaskEditDialog
        task={selectedTask}
        departments={departments}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={onUpdateTask}
      />
    </div>
  );
}
