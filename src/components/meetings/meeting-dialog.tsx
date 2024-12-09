'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash, X } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Department {
  id: string;
  name: string;
  fullName: string;
}

interface ActionItem {
  description: string;
  dueDate: Date;
  departmentIds: string[];
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  notes: string;
  actionItems: any[];
}

interface MeetingDialogProps {
  meeting?: Meeting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  onDelete?: () => void;
}

export function MeetingDialog({
  meeting,
  open,
  onOpenChange,
  onSubmit,
  onDelete
}: MeetingDialogProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title);
      setDate(new Date(meeting.date));
      setNotes(meeting.notes);
      setActionItems(
        meeting.actionItems.map((item: any) => ({
          description: item.description,
          dueDate: new Date(item.dueDate),
          departmentIds: item.departments.map((d: Department) => d.id)
        }))
      );
    } else {
      resetForm();
    }
  }, [meeting]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    if (mounted) {
      fetchDepartments();
    }
  }, [mounted]);

  const resetForm = () => {
    setTitle('');
    setDate(new Date());
    setNotes('');
    setActionItems([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      date: date.toISOString(),
      notes,
      actionItems
    });
    if (!meeting) {
      resetForm();
    }
  };

  const addActionItem = () => {
    setActionItems([
      ...actionItems,
      {
        description: '',
        dueDate: new Date(),
        departmentIds: []
      }
    ]);
  };

  const removeActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const updateActionItem = (index: number, field: keyof ActionItem, value: any) => {
    const newActionItems = [...actionItems];
    if (field === 'departmentIds' && typeof value === 'string') {
      // Toggle department selection
      const currentIds = newActionItems[index].departmentIds;
      if (currentIds.includes(value)) {
        newActionItems[index].departmentIds = currentIds.filter(id => id !== value);
      } else {
        newActionItems[index].departmentIds = [...currentIds, value];
      }
    } else {
      newActionItems[index] = {
        ...newActionItems[index],
        [field]: value
      };
    }
    setActionItems(newActionItems);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{meeting ? 'Edit Meeting' : 'Create Meeting'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting title"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" style={{ zIndex: 100 }}>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Meeting notes"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Action Items</label>
              <Button type="button" variant="outline" size="sm" onClick={addActionItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Action Item
              </Button>
            </div>
            <div className="space-y-4">
              {actionItems.map((item, index) => (
                <div key={index} className="space-y-2 p-6 border rounded-lg relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 h-6 w-6 p-0"
                    onClick={() => removeActionItem(index)}
                    style={{ top: ".25rem", }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateActionItem(index, 'description', e.target.value)}
                    placeholder="Action item description"
                    className="min-h-[60px]"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="text-sm font-medium">Due Date</label>
                      {mounted && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1",
                                !item.dueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {item.dueDate ? format(item.dueDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start" style={{ zIndex: 100 }}>
                            <Calendar
                              mode="single"
                              selected={item.dueDate}
                              onSelect={(date) => date && updateActionItem(index, 'dueDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Departments</label>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-2">
                        {departments.map((department) => (
                          <div key={department.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${index}-${department.id}`}
                              checked={item.departmentIds.includes(department.id)}
                              onCheckedChange={() => updateActionItem(index, 'departmentIds', department.id)}
                            />
                            <label
                              htmlFor={`${index}-${department.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {department.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {meeting && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <Button type="submit">
              {meeting ? 'Update' : 'Create'} Meeting
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
