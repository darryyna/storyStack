const goalsService = require('../../src/shared/services/goals.service');
const userGoalRepo = require('../../src/shared/repositories/userGoal.repository');
const userBookRepo = require('../../src/shared/repositories/userBook.repository');
const readingLogRepo = require('../../src/shared/repositories/readingLog.repository');
const geminiService = require('../../src/shared/services/gemini.service');

jest.mock('../../src/shared/repositories/userGoal.repository');
jest.mock('../../src/shared/repositories/userBook.repository');
jest.mock('../../src/shared/repositories/readingLog.repository');
jest.mock('../../src/shared/services/gemini.service');

describe('GoalsService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createGoal', () => {
        it('should call repo to create goal', async () => {
            const data = { name: 'Test Goal', targetCount: 10 };
            userGoalRepo.create.mockResolvedValue({ id: '1', ...data });

            const result = await goalsService.createGoal('user1', data);

            expect(userGoalRepo.create).toHaveBeenCalledWith({ userId: 'user1', ...data });
            expect(result.id).toBe('1');
        });
    });

    describe('getGoalsWithProgress', () => {
        it('should return goals with progress info', async () => {
            const mockGoal = {
                toJSON: () => ({ _id: 'g1', targetCount: 10, goalType: 'BOOKS_COUNT' }),
                targetCount: 10,
                goalType: 'BOOKS_COUNT',
                startDate: new Date(),
                endDate: new Date()
            };
            userGoalRepo.findByUser.mockResolvedValue([mockGoal]);
            userBookRepo.countCompleted.mockResolvedValue(5);

            const result = await goalsService.getGoalsWithProgress('user1');

            expect(result[0].currentCount).toBe(5);
            expect(result[0].progressPercent).toBe(50);
        });
    });

    describe('getGoalPrediction', () => {
        it('should return null if goal not found', async () => {
            userGoalRepo.findByUserAndId.mockResolvedValue(null);
            const result = await goalsService.getGoalPrediction('user1', 'g1');
            expect(result).toBeNull();
        });

        it('should return prediction and stats', async () => {
            const mockGoal = {
                _id: 'g1',
                name: 'Goal',
                targetCount: 10,
                goalType: 'BOOKS_COUNT',
                startDate: new Date(),
                endDate: new Date()
            };
            userGoalRepo.findByUserAndId.mockResolvedValue(mockGoal);
            userBookRepo.countCompleted.mockResolvedValue(5);
            readingLogRepo.findByUserSince.mockResolvedValue([]);
            userBookRepo.countCompletedSince.mockResolvedValue(0);
            userGoalRepo.countAchieved.mockResolvedValue(0);
            geminiService.getGoalPrediction.mockResolvedValue({ shortMessage: 'Predict' });

            const result = await goalsService.getGoalPrediction('user1', 'g1');

            expect(result.prediction.shortMessage).toBe('Predict');
            expect(result.stats.currentCount).toBe(5);
        });
    });
});
