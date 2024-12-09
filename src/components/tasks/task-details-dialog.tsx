'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Department, Task as TaskType } from "@/lib/types";

interface Task extends Omit<TaskType, 'departments'> {
  departments?: string[];
  department?: string;
}

interface TaskDetailsDialogProps {
  task: Task | null;
  departments: Department[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors = {
  not_started: 'bg-blue-400/90',
  in_progress: 'bg-amber-400/90',
  completed: 'bg-emerald-400/90',
  blocked: 'bg-rose-400/90',
};

const statusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
};

export function TaskDetailsDialog({ task, departments, open, onOpenChange }: TaskDetailsDialogProps) {
  if (!task) return null;

  const getDepartmentOverseers = (deptName: string): TaskType['overseers'] => {
    const dept = departments.find(d => d.name === deptName);
    if (!dept) return [];
    
    try {
      // Handle both string and object cases
      if (typeof dept.overseers === 'string') {
        return dept.overseers ? JSON.parse(dept.overseers) : [];
      } else if (Array.isArray(dept.overseers)) {
        return dept.overseers;
      } else if (typeof dept.overseers === 'object' && dept.overseers !== null) {
        return [dept.overseers];
      }
      return [];
    } catch (e) {
      console.error('Error parsing overseers:', e);
      return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Status</h4>
            <Badge className={statusColors[task.status]}>
              {statusLabels[task.status]}
            </Badge>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Due Date</h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(task.dueDate), "PPP")}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Departments & Overseers</h4>
            <div className="space-y-3">
              {task.departments ? (
                task.departments.map((dept) => (
                  <div key={dept} className="space-y-1">
                    <Badge variant="outline" className="mb-1">{dept}</Badge>
                    <div className="pl-4">
                      <p className="text-sm text-muted-foreground">Overseers:</p>
                      {getDepartmentOverseers(dept).length > 0 ? (
                        <ul className="list-disc pl-4">
                          {getDepartmentOverseers(dept).map((overseer, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {overseer.name} - {overseer.email} - {overseer.phone}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground pl-4">No overseers assigned</p>
                      )}
                    </div>
                  </div>
                ))
              ) : task.department ? (
                <div className="space-y-1">
                  <Badge variant="outline" className="mb-1">{task.department}</Badge>
                  <div className="pl-4">
                    <p className="text-sm text-muted-foreground">Overseers:</p>
                    {getDepartmentOverseers(task.department).length > 0 ? (
                      <ul className="list-disc pl-4">
                        {getDepartmentOverseers(task.department).map((overseer, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {overseer.name} - {overseer.email} - {overseer.phone}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground pl-4">No overseers assigned</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No departments assigned</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Notes</h4>
            {task.notes ? (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.notes}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No notes available</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
