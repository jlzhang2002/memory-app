export interface Memory {
  id: string;
  title: string;
  content: string;
  mainCategory: string;
  subCategory: string;
  date: string;
  importance: number;
  tags: string[];
  emotions: string[];
  createdAt: string;
  lastModified: string;
}

export interface Thought {
  id: string;
  title: string;
  content: string;
  context: string;
  process: string[];
  conclusion: string;
  relatedMemories: string[];
  date: string;
  createdAt: string;
}

export interface Observation {
  id: string;
  subject: string;
  description: string;
  status: 'ongoing' | 'resolved' | 'monitoring' | 'critical';
  category: 'health' | 'work' | 'environment' | 'relationships' | 'habits' | 'other';
  changes: string[];
  date: string;
  nextCheck?: string;
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
  relationship: string;
  closeness: 1 | 2 | 3 | 4 | 5;
  traits: string[];
  notes: string;
  lastContact: string;
  avatar?: string;
  createdAt: string;
}

export interface SocialRecord {
  id: string;
  personId: string;
  personName: string;
  type: 'meeting' | 'call' | 'message' | 'email' | 'event' | 'other';
  description: string;
  context: string;
  mood: 'positive' | 'neutral' | 'negative';
  insights: string[];
  date: string;
  duration?: string;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  title: string;
  subject: string;
  criteria: string[];
  rating: number;
  notes: string;
  improvements: string[];
  date: string;
  category: 'self' | 'relationship' | 'situation' | 'decision' | 'other';
  createdAt: string;
}

export interface DailyPlan {
  id: string;
  date: string;
  tasks: Task[];
  reflections: string;
  tomorrowPlans: string[];
  tomorrowReminders: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  purpose: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  stages: ProjectStage[];
  folderId?: string;
  createdAt: string;
}

export interface ProjectStage {
  id: string;
  title: string;
  description: string;
  challenges: Challenge[];
  status: 'pending' | 'active' | 'completed';
  archived: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  problem: string;
  solution: string;
  practiceEffect: string;
  status: 'unsolved' | 'solved';
  createdAt: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  subcategories: string[];
}

export interface ProjectFolder {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}