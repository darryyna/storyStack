export interface GoalPrediction {
  isAchievable: boolean;
  dailyPagesNeeded: number | null;
  booksPerMonthNeeded: number | null;
  estimatedCompletionDays: number | null;
  shortMessage: string;
  tip: string;
}

export interface GoalPredictionResponse {
  prediction: GoalPrediction;
  stats: {
    avgPagesPerDay: number;
    avgBooksPerMonth: number;
    activeDaysPerWeek: number;
    currentCount: number;
    daysUntilEnd: number;
  };
}
