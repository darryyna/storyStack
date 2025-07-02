export interface Goal {
  userId: string;
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}
