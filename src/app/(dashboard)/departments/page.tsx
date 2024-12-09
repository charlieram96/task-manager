'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Department, Overseer, Document } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Upload, FileText, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { getAuthStatus } from '@/lib/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { DocumentUploadDialog } from '@/components/departments/document-upload-dialog';
import { DepartmentSearch } from "@/components/departments/department-search";

const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  fullName: z.string().min(1, 'Department full name is required'),
  overseers: z.array(z.object({
    name: z.string().min(1, 'Overseer name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
  })),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

const defaultFormValues: DepartmentFormValues = {
  name: '',
  fullName: '',
  overseers: [{ name: '', email: '', phone: '' }],
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDepartmentForUpload, setSelectedDepartmentForUpload] = useState<string | null>(null);
  const [departmentDocuments, setDepartmentDocuments] = useState<Record<string, Document[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { isAuthenticated, isGuest } = getAuthStatus();
  const isAdmin = isAuthenticated && !isGuest;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange',
  });

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch departments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchDepartmentDocuments = useCallback(async (departmentId: string) => {
    try {
      const response = await fetch(`/api/departments/${departmentId}/documents`);
      const data = await response.json();
      setDepartmentDocuments(prev => ({
        ...prev,
        [departmentId]: data
      }));
    } catch (error) {
      console.error('Error fetching department documents:', error);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    if (departments.length > 0) {
      departments.forEach(dept => {
        fetchDepartmentDocuments(dept.id);
      });
    }
  }, [departments, fetchDepartmentDocuments]);

  const openDialog = useCallback((department?: Department) => {
    if (department) {
      form.reset({
        name: department.name || '',
        fullName: department.fullName || '',
        overseers: department.overseers,
      });
      setSelectedDepartment(department);
    } else {
      form.reset(defaultFormValues);
      setSelectedDepartment(null);
    }
    setDialogOpen(true);
  }, [form]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedDepartment(null);
    form.reset(defaultFormValues);
  }, [form]);

  const handleSubmit = async (data: DepartmentFormValues) => {
    try {
      const method = selectedDepartment ? 'PUT' : 'POST';
      const url = selectedDepartment 
        ? `/api/departments/${selectedDepartment.id}` 
        : '/api/departments';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          fullName: data.fullName,
          overseers: data.overseers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save department');
      }

      await fetchDepartments();
      setDialogOpen(false);
      setSelectedDepartment(null);
      form.reset(defaultFormValues);
      
      toast({
        title: 'Success',
        description: `Department ${selectedDepartment ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save department',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (departmentToDelete: Department) => {
    if (!departmentToDelete) return;

    try {
      const response = await fetch(`/api/departments/${departmentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete department');
      }

      // Refresh departments list
      fetchDepartments();
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete department',
        variant: 'destructive',
      });
    }
  };

  const handleUploadClick = useCallback((departmentId: string) => {
    setSelectedDepartmentForUpload(departmentId);
    setUploadDialogOpen(true);
  }, []);

  const handleDocumentClick = async (doc: Document) => {
    try {
      // Open document in a new tab
      window.open(`/api/departments/${selectedDepartment?.id}/documents/${doc.id}`, '_blank');
    } catch (error) {
      console.error('Error opening document:', error);
      toast({
        title: 'Error',
        description: 'Failed to open document',
        variant: 'destructive',
      });
    }
  };

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    
    const query = searchQuery.toLowerCase();
    return departments.filter((dept) => {
      // Check department name and full name
      if (dept.name.toLowerCase().includes(query)) return true;
      if (dept.fullName.toLowerCase().includes(query)) return true;
      
      // Check overseers
      const overseers = dept.overseers || [];
      const overseerMatch = overseers.some((overseer) => {
        return (
          overseer.name.toLowerCase().includes(query) ||
          overseer.email.toLowerCase().includes(query) ||
          overseer.phone.toLowerCase().includes(query)
        );
      });
      if (overseerMatch) return true;
      
      // Check documents
      const documents = departmentDocuments[dept.id] || [];
      return documents.some((doc) => 
        doc.name.toLowerCase().includes(query)
      );
    });
  }, [departments, searchQuery, departmentDocuments]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
        {isAdmin && (
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        )}
      </div>

      <div className="max-w-md">
        <DepartmentSearch 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDepartments.map((department) => (
          <Card key={department.id}>
            <CardHeader className="relative">
              <div className="flex flex-col gap-1">
                <div className="text-lg font-semibold">{department.name}</div>
                <div className="text-sm text-muted-foreground">{department.fullName}</div>
              </div>
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUploadClick(department.id)}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDialog(department)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setDepartmentToDelete(department);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {department.overseers?.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Overseers:</div>
                    <div className="grid gap-2">
                      {department.overseers.map((overseer, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-1 p-3 rounded-lg bg-muted"
                        >
                          <div className="font-medium">{overseer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <a
                                href={`mailto:${overseer.email}`}
                                className="hover:underline"
                              >
                                {overseer.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <a
                                href={`tel:${overseer.phone}`}
                                className="hover:underline"
                              >
                                {overseer.phone}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {departmentDocuments[department.id]?.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Documents:</div>
                    <div className="grid gap-2">
                      {departmentDocuments[department.id].map((doc: Document) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted hover:bg-muted/80 cursor-pointer transition-colors"
                          onClick={() => handleDocumentClick(doc)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleDocumentClick(doc);
                            }
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="flex-1">{doc.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({Math.round(doc.size / 1024)}KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDepartment ? 'Edit Department' : 'Add Department'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Overseers</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentOverseers = form.getValues('overseers');
                      form.setValue('overseers', [
                        ...currentOverseers,
                        { name: '', email: '', phone: '' },
                      ]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Overseer
                  </Button>
                </div>

                {form.watch('overseers').map((_, index) => (
                  <div key={index} className="space-y-4 p-4 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Overseer {index + 1}</h4>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentOverseers = form.getValues('overseers');
                            form.setValue(
                              'overseers',
                              currentOverseers.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`overseers.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`overseers.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`overseers.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="(555) 123-4567"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setSelectedDepartment(null);
                    form.reset(defaultFormValues);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedDepartment ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete the department "{departmentToDelete?.name}"?</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDepartmentToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => departmentToDelete && handleDelete(departmentToDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedDepartmentForUpload && (
        <DocumentUploadDialog
          open={uploadDialogOpen}
          onClose={() => {
            setUploadDialogOpen(false);
            setSelectedDepartmentForUpload(null);
          }}
          departmentId={selectedDepartmentForUpload}
          onUploadComplete={() => {
            fetchDepartmentDocuments(selectedDepartmentForUpload);
          }}
        />
      )}
    </div>
  );
}
