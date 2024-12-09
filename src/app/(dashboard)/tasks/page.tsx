'use client';

import { useEffect, useState } from 'react';
import { TaskTable } from '@/components/tasks/task-table';
import { Task, Department } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getAuthStatus } from '@/lib/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskForm } from '@/components/tasks/task-form';
import { DepartmentDialog } from '@/components/tasks/department-dialog';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

interface TaskFilters {
  department: string;
  status: string;
  month: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({
    department: 'all',
    status: 'all',
    month: 'all',
  });
  const { toast } = useToast();
  const { isAuthenticated, isGuest } = getAuthStatus();
  const isAdmin = isAuthenticated && !isGuest;

  useEffect(() => {
    fetchTasks();
    fetchDepartments();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      console.log('Fetched departments:', data);
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!isAdmin) return;
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));

      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== taskId));

      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesDepartment = 
      filters.department === 'all' || 
      (task.departments && task.departments.includes(filters.department));
    
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    
    let matchesMonth = true;
    if (filters.month !== 'all' && task.dueDate) {
      try {
        const taskDate = new Date(task.dueDate);
        const taskMonth = format(taskDate, 'yyyy-MM');
        matchesMonth = taskMonth === filters.month;
      } catch (error) {
        console.error('Error parsing date:', error);
        matchesMonth = false;
      }
    }
    
    return matchesDepartment && matchesStatus && matchesMonth;
  });

  const months = Array.from(
    new Set(
      tasks
        .filter(task => task.dueDate)
        .map(task => {
          try {
            const date = new Date(task.dueDate);
            return format(date, 'yyyy-MM');
          } catch (error) {
            console.error('Error parsing date for months list:', error);
            return null;
          }
        })
        .filter((month): month is string => month !== null)
    )
  ).sort();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
      </div>

      {isAdmin && (
        <>
          <div className="space-y-6">
            <TaskForm departments={departments} onTaskAdded={fetchTasks} />
            
            <div className="bg-card p-6 rounded-lg border space-y-4">
              <h3 className="font-semibold">Filter Tasks</h3>
              <div className="flex flex-wrap gap-4">
                <Select
                  value={filters.department}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {Array.isArray(departments) ? departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    )) : null}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.month}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, month: value }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map((month) => {
                      try {
                        const [year, monthStr] = month.split('-');
                        const date = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
                        return (
                          <SelectItem key={month} value={month}>
                            {format(date, 'MMMM yyyy')}
                          </SelectItem>
                        );
                      } catch (error) {
                        console.error('Error parsing month:', error);
                        return null;
                      }
                    }).filter(Boolean)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </>
      )}

      <TaskTable
        tasks={filteredTasks}
        departments={departments}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        isReadOnly={!isAdmin}
      />

      {isAdmin && (
        <DepartmentDialog
          open={showDepartmentDialog}
          onOpenChange={setShowDepartmentDialog}
          departments={departments}
          onDepartmentsChange={setDepartments}
        />
      )}
    </div>
  );
}
