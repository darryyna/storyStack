const userGoalRepo = require('../repositories/userGoal.repository');
const userBookRepo = require('../repositories/userBook.repository');
const readingLogRepo = require('../repositories/readingLog.repository');
const geminiService = require('./gemini.service');

class GoalsService {
  async createGoal(userId, data) {
    return userGoalRepo.create({ userId, ...data });
  }

  async getGoalsWithProgress(userId) {
    const goals = await userGoalRepo.findByUser(userId); // only isActive: true

    const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
      const currentCount = await this._calculateCurrentCount(userId, goal);

      const goalObj = goal.toJSON();
      goalObj.currentCount = currentCount;
      goalObj.progressPercent = Math.min(100, Math.round((currentCount / goal.targetCount) * 100));

      if (currentCount >= goal.targetCount && !goal.isAchieved) {
        await userGoalRepo.markAchieved(goal._id);
        goalObj.isAchieved = true;
      }

      return goalObj;
    }));

    // active goals first, achieved goals last
    return goalsWithProgress.sort((a, b) => {
      if (a.isAchieved === b.isAchieved) return 0;
      return a.isAchieved ? 1 : -1;
    });
  }

  async getArchivedGoals(userId) {
    const goals = await userGoalRepo.findDeactivatedByUser(userId);
    return goals.map(g => g.toJSON());
  }

  async deleteGoal(userId, id) {
    return userGoalRepo.deleteByUserAndId(userId, id);
  }

  // toggles isActive. if currently active → deactivate, if deactivated → reactivate
  async toggleGoalActive(userId, id) {
    const goal = await userGoalRepo.findByUserAndId(userId, id);
    if (!goal) return null;

    return goal.isActive
      ? userGoalRepo.deactivateByUserAndId(userId, id)
      : userGoalRepo.reactivateByUserAndId(userId, id);
  }

  async getGoalPrediction(userId, id) {
    const goal = await userGoalRepo.findByUserAndId(userId, id);
    if (!goal) return null;

    const currentCount = await this._calculateCurrentCount(userId, goal);

    const now = new Date();
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
    const ninetyDaysAgo = new Date(now); ninetyDaysAgo.setDate(now.getDate() - 90);

    const [logsLast30, booksLast90, achievedGoalsCount] = await Promise.all([
      readingLogRepo.findByUserSince(userId, thirtyDaysAgo),
      userBookRepo.countCompletedSince(userId, ninetyDaysAgo),
      userGoalRepo.countAchieved(userId)
    ]);

    const uniqueDaysLast30 = new Set(
      logsLast30.map(l => l.date.toISOString().split('T')[0])
    ).size;

    const totalPagesLast30 = logsLast30.reduce((s, l) => s + l.pagesRead, 0);
    const avgPagesPerDay = uniqueDaysLast30 > 0
      ? Math.round(totalPagesLast30 / uniqueDaysLast30)
      : 0;
    const activeDaysPerWeek = Math.round((uniqueDaysLast30 / 30) * 7 * 10) / 10;
    const avgBooksPerMonth = Math.round((booksLast90 / 3) * 10) / 10;
    const daysUntilEnd = Math.max(0, Math.ceil((new Date(goal.endDate) - now) / (1000 * 60 * 60 * 24)));

    const prediction = await geminiService.getGoalPrediction({
      goal,
      readingStats: {
        avgPagesPerDay,
        avgBooksPerMonth,
        activeDaysPerWeek,
        totalPagesLast30Days: totalPagesLast30,
        totalBooksLast90Days: booksLast90,
        achievedGoalsCount,
        daysUntilEnd,
        currentCount,
        targetCount: goal.targetCount,
        goalType: goal.goalType,
        goalPeriod: goal.type,
        goalName: goal.name,
      }
    });

    return {
      prediction,
      stats: { avgPagesPerDay, avgBooksPerMonth, activeDaysPerWeek, currentCount, daysUntilEnd }
    };
  }

  // calculates current count for any goal type
  async _calculateCurrentCount(userId, goal) {
    if (goal.goalType === 'BOOKS_COUNT') {
      return goal.category
        ? userBookRepo.countCompletedByCategory(userId, goal.startDate, goal.endDate, goal.category)
        : userBookRepo.countCompleted(userId, goal.startDate, goal.endDate);
    }

    return goal.category
      ? readingLogRepo.sumPagesByCategory(userId, goal.startDate, goal.endDate, goal.category)
      : readingLogRepo.findByUserInRange(userId, goal.startDate, goal.endDate)
        .then(logs => logs.reduce((sum, l) => sum + l.pagesRead, 0));
  }
}

module.exports = new GoalsService();