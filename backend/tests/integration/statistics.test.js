const request = require('supertest');
const app = require('../../src/app');
const statisticsService = require('../../src/shared/services/statistics.service');
const jwt = require('jsonwebtoken');

jest.mock('../../src/shared/services/statistics.service');
jest.mock('../../src/shared/configuration/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

process.env.ACCESS_TOKEN_SECRET = 'test_secret';

describe('Statistics Integration Tests', () => {
    let token;
    const userId = 'u1';

    beforeAll(() => {
        token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/statistics/general', () => {
        it('should return general stats', async () => {
            statisticsService.getGeneralStats.mockResolvedValue({ totalBooks: 5 });

            const response = await request(app)
                .get('/api/statistics/general')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.totalBooks).toBe(5);
        });
    });

    describe('GET /api/statistics/streak', () => {
        it('should return reading streak', async () => {
            statisticsService.getReadingStreak.mockResolvedValue({ currentStreak: 3 });

            const response = await request(app)
                .get('/api/statistics/streak')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.currentStreak).toBe(3);
        });
    });
});
