export interface Task {
  id: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  startDate: string;
  endDate: string;
  departments: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Overseer {
  name: string;
  email: string;
  phone: string;
}

export interface Document {
  id: string;
  name: string;
  fileName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export interface Department {
  id: string;
  name: string;
  fullName: string;
  overseers: Overseer[];
  documents?: Document[];
  createdAt?: string;
  updatedAt?: string;
}
