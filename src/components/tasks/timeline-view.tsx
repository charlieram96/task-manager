import { Task, Department } from "@/lib/types";
import { eachMonthOfInterval, format, parseISO, isWithinInterval, isSameMonth, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { TaskDetailsDialog } from "@/components/tasks/task-details-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TimelineViewProps {
  tasks: Task[];
}

export function TimelineView({ tasks }: TimelineViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const startDate = new Date(2024, 11, 1);
  const endDate = new Date(2025, 8, 1);
  
  const monthRange = eachMonthOfInterval({
    start: startDate,
    end: endDate,
  });

  const getTaskStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'in_progress':
        return 'bg-amber-400/90 hover:bg-amber-400';
      case 'completed':
        return 'bg-emerald-400/90 hover:bg-emerald-400';
      case 'blocked':
        return 'bg-rose-400/90 hover:bg-rose-400';
      default: // not started
        return 'bg-blue-400/90 hover:bg-blue-400';
    }
  };

  const getDepartments = (departments: string | string[] | null | undefined): string[] => {
    if (!departments) return [];
    if (typeof departments === 'string') {
      try {
        return JSON.parse(departments);
      } catch {
        return [];
      }
    }
    return departments;
  };

  const calculateTaskEnd = (date: Date, monthIndex: number): number => {
    const month = monthRange[monthIndex];
    const daysInMonth = getDaysInMonth(month);
    const dayOfMonth = date.getDate();
    
    // Calculate the percentage through the month
    const percentage = dayOfMonth / daysInMonth;
    
    // Calculate how many months from the end this is
    const monthsFromEnd = monthRange.length - monthIndex - 1;
    
    // Calculate the final percentage for the right position
    // This adjusts the end position based on both the month and day
    return (monthsFromEnd + (1 - percentage)) / monthRange.length * 100;
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        const data = await response.json();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <div className="relative w-full h-full rounded-[10px] bg-background">
      {/* Timeline container */}
      <div className="relative w-full h-full">
        {/* Today marker */}
        <div 
          className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10"
          style={{ 
            left: `${((new Date().getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100}%`,
            height: "calc(100% - 18px)",
            top: "53px"
          }}
        >
          <div className="absolute -bottom-0 bg-red-500 text-white px-2 py-1 rounded text-sm" style={{ left: "-1.8rem" }}>
            Today
          </div>
        </div>

        {/* Timeline header - Fixed */}
        <div className="w-full absolute top-0 left-0 right-0 bg-background z-20">
          <div className="flex w-full border-b overflow-x-auto">
            <div className="flex w-full min-w-[800px]">
              {monthRange.map((date) => (
                <div
                  key={date.toISOString()}
                  className="flex-1 p-2 sm:p-4 text-center text-xs sm:text-sm font-medium border-l first:border-l-0"
                >
                  {format(date, "MMM yyyy")}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto overflow-x-auto h-full pt-[56px]">
          <div className="space-y-0 py-2 min-w-[800px]">
            {tasks.map((task) => {
              let dueDate: Date;
              
              try {
                dueDate = parseISO(task.dueDate);
                
                if (isNaN(dueDate.getTime())) {
                  console.warn(`Invalid date for task: ${task.description}`);
                  return null;
                }
              } catch (error) {
                console.warn(`Error parsing date for task: ${task.description}`, error);
                return null;
              }

              const taskMonths = monthRange.map((month) => {
                const monthStart = startOfMonth(month);
                const monthEnd = endOfMonth(month);
                
                const isInMonth = isWithinInterval(month, { start: startDate, end: dueDate }) ||
                                isSameMonth(month, dueDate);
                
                return {
                  date: month,
                  isInMonth,
                };
              });

              const lastTaskMonth = taskMonths.findLastIndex(m => m.isInMonth);
              const departments = getDepartments(task.departments);

              if (lastTaskMonth === -1) return null;

              const rightPosition = calculateTaskEnd(dueDate, lastTaskMonth);

              return (
                <div key={task.id} className="flex relative min-h-[4.5rem] group">
                  <div 
                    className="absolute inset-y-1 left-0 flex items-center px-0"
                    style={{
                      right: `${rightPosition}%`,
                    }}
                  >
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setDialogOpen(true);
                      }}
                      className={cn(
                        "w-full h-[3.5rem] rounded-[5px] flex flex-col justify-between py-2 px-3 sm:px-4 group-hover:h-16 transition-all cursor-pointer shadow-none",
                        getTaskStyle(task.status)
                      )}
                    >
                      <span className="text-[10px] sm:text-[11px] font-semibold truncate text-white pr-2 sm:pr-3">
                        {task.description}
                      </span>
                      {departments.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-1">
                          {departments.map((dept, index) => (
                            <span 
                              key={index}
                              className="px-1 sm:px-1.5 py-0.5 bg-white/20 rounded-full text-[8px] sm:text-[9px] font-medium text-white whitespace-nowrap"
                            >
                              {dept}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                  {monthRange.map((date) => (
                    <div
                      key={date.toISOString()}
                      className="flex-1 border-l first:border-l-0 h-full"
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <TaskDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={selectedTask}
        departments={departments}
      />
    </div>
  );
}
