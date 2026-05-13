const request = require('supertest');
const app = require('../../src/app');
const goalsService = require('../../src/shared/services/goals.service');
const jwt = require('jsonwebtoken');

jest.mock('../../src/shared/services/goals.service');
jest.mock('../../src/shared/configuration/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

process.env.ACCESS_TOKEN_SECRET = 'test_secret';

describe('Goal Integration Tests', () => {
    let token;
    const userId = 'u1';

    beforeAll(() => {
        token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/goals', () => {
        it('should create a goal', async () => {
            goalsService.createGoal.mockResolvedValue({ _id: 'g1', name: 'Goal' });

            const response = await request(app)
                .post('/api/goals')
                .set('Authorization', `Bearer ${token}`)
                .send({ 
                    name: 'Goal', 
                    targetCount: 10, 
                    startDate: '2023-01-01', 
                    endDate: '2023-12-31',
                    type: 'YEAR',
                    goalType: 'BOOKS_COUNT'
                });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('Goal');
        });
    });

    describe('GET /api/goals', () => {
        it('should return goals', async () => {
            goalsService.getGoalsWithProgress.mockResolvedValue([{ name: 'G1' }]);

            const response = await request(app)
                .get('/api/goals')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
        });
    });
});
