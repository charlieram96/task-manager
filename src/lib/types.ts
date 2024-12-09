export interface Task {
  id: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  startDate: string;
  endDate: string;
  departments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  overseers: string[];
  createdAt: string;
  updatedAt: string;
}
