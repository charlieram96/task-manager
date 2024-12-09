'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { TimelineView } from '@/components/tasks/timeline-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { addDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TimelinePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 14)); // Default to 2 weeks view

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksResponse, departmentsResponse] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/departments')
        ]);
        
        const tasksData = await tasksResponse.json();
        const departmentsData = await departmentsResponse.json();
        
        setTasks(tasksData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTasks = selectedDepartment === 'all' 
    ? tasks 
    : tasks.filter(task => task.departments && task.departments.includes(selectedDepartment));

  return (
    <div className="h-full p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Timeline</h2>
        <div className="flex items-center gap-4">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-none">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <p>Loading timeline...</p>
            </div>
          ) : (
            <div className="h-[calc(100vh-16rem)]">
              <TimelineView 
                tasks={filteredTasks}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
