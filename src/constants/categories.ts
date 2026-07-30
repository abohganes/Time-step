export const CATEGORIES = ['general', 'work', 'student', 'fitness'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CategoryColors: Record<Category, string> = {
  general: '#9CA3AF',
  work: '#3B82F6',
  student: '#A855F7',
  fitness: '#F97316',
};
