export interface Goal {
  id?: string;
  name: string;
  type: 'MONTH' | 'QUARTER' | 'HALF_YEAR' | 'YEAR' | 'CUSTOM';
  goalType: 'BOOKS_COUNT' | 'PAGES_COUNT';
  startDate: string | Date;
  endDate: string | Date;
  targetCount: number;
  currentCount?: number;
  progressPercent?: number;
  isAchieved?: boolean;
  category?: string;
}
