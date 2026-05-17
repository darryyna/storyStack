const statisticsService = require('../../src/shared/services/statistics.service');
const userBookRepo = require('../../src/shared/repositories/userBook.repository');
const readingLogRepo = require('../../src/shared/repositories/readingLog.repository');
const userGoalRepo = require('../../src/shared/repositories/userGoal.repository');
const ReadingLog = require('../../src/shared/models/ReadingLog.model');
const mongoose = require('mongoose');

jest.mock('../../src/shared/repositories/userBook.repository');
jest.mock('../../src/shared/repositories/readingLog.repository');
jest.mock('../../src/shared/repositories/userGoal.repository');
jest.mock('../../src/shared/models/ReadingLog.model');

describe('StatisticsService', () => {
    const userId = new mongoose.Types.ObjectId().toString();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getGeneralStats', () => {
        it('should return aggregated stats', async () => {
            userBookRepo.aggregateByUser.mockResolvedValueOnce([{ totalBooks: 5, booksRead: 2, avgRating: 4, totalCurrentPages: 500 }]);
            userGoalRepo.countAchieved.mockResolvedValue(1);
            userBookRepo.aggregateByUser.mockResolvedValueOnce([{ _id: 'Tag1', count: 3 }]);

            const result = await statisticsService.getGeneralStats(userId);

            expect(result.totalBooks).toBe(5);
            expect(result.achievedGoals).toBe(1);
            expect(result.topTags).toHaveLength(1);
        });
    });

    describe('getGenreStats', () => {
        it('should call aggregateByUser with genre pipeline', async () => {
            userBookRepo.aggregateByUser.mockResolvedValue([{ _id: 'Genre', count: 1 }]);
            const result = await statisticsService.getGenreStats(userId);
            expect(result[0]._id).toBe('Genre');
        });
    });

    describe('getReadingStreak', () => {
        it('should return 0 streak if no logs', async () => {
            ReadingLog.aggregate.mockResolvedValue([]);
            const result = await statisticsService.getReadingStreak(userId);
            expect(result.currentStreak).toBe(0);
        });

        it('should calculate current streak correctly', async () => {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            ReadingLog.aggregate.mockResolvedValue([{ _id: today }, { _id: yesterday }]);

            const result = await statisticsService.getReadingStreak(userId);
            expect(result.currentStreak).toBe(2);
        });
    });
});
