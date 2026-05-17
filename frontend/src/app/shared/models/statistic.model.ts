export interface GeneralStats {
  totalBooks: number;
  booksRead: number;
  avgRating: number;
  totalCurrentPages: number;
  achievedGoals: number;
  topTags: { _id: string; count: number }[];
}

export interface ReadingRecord {
  maxPagesInDay: number;
  maxPagesDate: string;
  bookTitle: string | null;
  avgPagesPerDay: number;
  activeDaysLast30: number;
  totalPagesLast30: number;
}

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  recentDays: { date: string; active: boolean; isToday: boolean }[];
}

export interface ReadingInsights {
  bestMonth: string | null;
  bestMonthPages: number;
  mostActiveDayOfWeek: string | null;
  avgBookLength: number;
  topAuthor: string | null;
  topAuthorBooks: number;
}
