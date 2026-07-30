import type { Category } from '@/constants/categories';

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  category: Category;
  created_at: string;
  updated_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  recurrence: 'daily';
  reminder_time: string | null;
  is_active: boolean;
  category: Category;
  created_at: string;
  updated_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  created_at: string;
};

export type Page = {
  id: string;
  user_id: string;
  parent_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};
