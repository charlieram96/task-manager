'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Users, Plus, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface Department {
  id: string;
  name: string;
  fullName: string;
  overseers: string[];
}

const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  fullName: z.string().min(1, 'Full department name is required'),
  overseers: z.string().min(1, 'At least one overseer is required'),
});

interface DepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Department) => void;
  departments: Department[];
}

export function DepartmentDialog({
  open,
  onClose,
  onSubmit,
  departments,
}: DepartmentDialogProps) {
  const form = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      fullName: '',
      overseers: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof departmentSchema>) => {
    onSubmit({
      id: '',
      name: values.name,
      fullName: values.fullName,
      overseers: values.overseers.split(',').map((s) => s.trim()),
    });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
          <DialogDescription>
            Add a new department and assign overseers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name (Abbreviation)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. IT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Information Technology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overseers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overseers</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter overseer names separated by commas"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter multiple overseers separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Department</Button>
            </div>
          </form>
        </Form>

        <Separator className="my-4" />

        <div className="flex-1 overflow-y-auto">
          <h4 className="mb-4 text-sm font-medium">Existing Departments</h4>
          <div className="space-y-4">
            {departments.map((dept) => (
              <Card key={dept.id}>
                <CardHeader className="py-4">
                  <div className="flex items-start gap-4">
                    <Building2 className="h-4 w-4 mt-1" />
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{dept.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {dept.fullName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">
                          {dept.overseers.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
