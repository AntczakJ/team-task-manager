export interface User {
  id: number;
  name: string;
  email: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  projectId: number;
  assigneeId?: number | null;
  assignee?: User | null;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  ownerId?: number;
  tasks?: Task[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
