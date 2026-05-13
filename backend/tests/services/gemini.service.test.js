jest.mock('../../src/shared/configuration/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

describe('GeminiService', () => {
    let geminiService;
    let mockGenerateContent;

    beforeEach(() => {
        jest.resetModules();
        mockGenerateContent = jest.fn();
        
        jest.doMock('@google/generative-ai', () => ({
            GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: mockGenerateContent
                })
            }))
        }));
        
        geminiService = require('../../src/shared/services/gemini.service');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getBookRecommendations', () => {
        it('should return parsed recommendations when AI returns valid JSON', async () => {
            const mockRecommendations = [
                { id: 'rec1', title: 'Rec Book', authors: ['Author'], description: 'Desc', thumbnail: '', sourceId: 'rec1' }
            ];
            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => JSON.stringify(mockRecommendations)
                }
            });

            const userPrefs = { authors: ['A'], titles: ['T'], descriptions: ['D'], tags: ['Tag'] };
            const result = await geminiService.getBookRecommendations(userPrefs);

            expect(result).toEqual(mockRecommendations);
        });

        it('should throw error if AI returns invalid JSON', async () => {
            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => 'invalid json'
                }
            });

            const userPrefs = { authors: [], titles: [], descriptions: [], tags: [] };
            await expect(geminiService.getBookRecommendations(userPrefs)).rejects.toThrow('Failed to parse recommendations from AI');
        });
    });

    describe('getGoalPrediction', () => {
        it('should return parsed prediction when AI returns valid JSON', async () => {
            const mockPrediction = {
                isAchievable: true,
                dailyPagesNeeded: 10,
                shortMessage: 'Great job!',
                tip: 'Keep reading'
            };
            mockGenerateContent.mockResolvedValue({
                response: {
                    text: () => JSON.stringify(mockPrediction)
                }
            });

            const goal = { startDate: '2023-01-01', endDate: '2023-12-31' };
            const readingStats = {
                goalName: 'My Goal',
                targetCount: 100,
                currentCount: 50,
                daysUntilEnd: 30,
                avgPagesPerDay: 5
            };
            
            const result = await geminiService.getGoalPrediction({ goal, readingStats });

            expect(result).toEqual(mockPrediction);
        });
    });
});
