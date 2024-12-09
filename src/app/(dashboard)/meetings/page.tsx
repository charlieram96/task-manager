'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { MeetingDialog } from '@/components/meetings/meeting-dialog';
import { useToast } from '@/hooks/use-toast';
import { getAuthStatus } from '@/lib/auth';

interface Department {
  id: string;
  name: string;
  fullName: string;
}

interface ActionItem {
  id: string;
  description: string;
  dueDate: string;
  departments: Department[];
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  notes: string;
  actionItems: ActionItem[];
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isGuest } = getAuthStatus();
  const isAdmin = isAuthenticated && !isGuest;

  useEffect(() => {
    setMounted(true);
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings');
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch meetings',
        variant: 'destructive',
      });
    }
  };

  const handleCreateMeeting = async (data: Partial<Meeting>) => {
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create meeting');

      await fetchMeetings();
      setIsCreateOpen(false);
      toast({
        title: 'Success',
        description: 'Meeting created successfully',
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to create meeting',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateMeeting = async (data: Partial<Meeting>) => {
    if (!selectedMeeting) return;

    try {
      const response = await fetch(`/api/meetings/${selectedMeeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update meeting');

      await fetchMeetings();
      setSelectedMeeting(null);
      toast({
        title: 'Success',
        description: 'Meeting updated successfully',
      });
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update meeting',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      const response = await fetch(`/api/meetings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete meeting');

      await fetchMeetings();
      toast({
        title: 'Success',
        description: 'Meeting deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete meeting',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="h-full p-4 space-y-4">
      {mounted && (
        <>
          <div className="flex justify-between items-center p-4">
            <h1 className="text-2xl font-bold">Meetings</h1>
            {isAdmin && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Meeting
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4" style={{ marginTop: '-.5rem' }}>
            {meetings.map((meeting) => (
              <Card 
                key={meeting.id} 
                className={isAdmin ? "cursor-pointer hover:bg-accent/50 transition-colors" : "cursor-default"}
                onClick={() => isAdmin && setSelectedMeeting(meeting)}
              >
                <CardHeader>
                  <CardTitle>{meeting.title}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(meeting.date), 'PPP')}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Notes:</strong>
                      <div className="whitespace-pre-wrap">{meeting.notes}</div>
                    </div>
                    <div className='text-sm'>
                      <strong>Action Items:</strong>
                      <ul className="list-disc list-inside space-y-1">
                        {meeting.actionItems.map((item) => (
                          <li key={item.id} className="text-sm" style={{ marginTop: '0.2rem' }}>
                            {item.description}
                            <div className="text-xs text-muted-foreground ml-5">
                              Due: {format(new Date(item.dueDate), 'PPP')}
                            </div>
                            <div className="text-xs text-muted-foreground ml-5">
                              Departments: {item.departments.map(d => d.name).join(', ')}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isAdmin && (
            <>
              <MeetingDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSubmit={handleCreateMeeting}
              />

              {selectedMeeting && (
                <MeetingDialog
                  open={true}
                  onOpenChange={() => setSelectedMeeting(null)}
                  onSubmit={handleUpdateMeeting}
                  onDelete={() => handleDeleteMeeting(selectedMeeting.id)}
                  meeting={selectedMeeting}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
