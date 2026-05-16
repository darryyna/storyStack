const request = require('supertest');
const app = require('../../src/app');
const userRepo = require('../../src/shared/repositories/user.repository');
const bcrypt = require('bcryptjs');

jest.mock('../../src/shared/repositories/user.repository');
jest.mock('../../src/shared/services/email.service');
jest.mock('../../src/shared/configuration/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

// Mock env vars for tests
process.env.ACCESS_TOKEN_SECRET = 'test_secret';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
process.env.ACCESS_TOKEN_EXPIRE = '1h';
process.env.REFRESH_TOKEN_EXPIRE = '7d';

describe('Auth Integration Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user (happy path)', async () => {
            userRepo.findByUsername.mockResolvedValue(null);
            userRepo.findByEmail.mockResolvedValue(null);
            userRepo.create.mockResolvedValue({ _id: 'u1', username: 'testuser', email: 'test@example.com' });

            const response = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.header['set-cookie']).toBeDefined();
        });

        it('should return 409 if user already exists', async () => {
            userRepo.findByUsername.mockResolvedValue({ _id: 'u1' });

            const response = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(409);
        });

        it('should return 400 for invalid input (zod validation)', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ username: '', email: 'invalid-email', password: '1' });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            userRepo.findByUsername.mockResolvedValue({ _id: 'u1', username: 'test', password: hashedPassword });

            const response = await request(app)
                .post('/api/auth/login')
                .send({ username: 'test', password: 'password123' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
        });

        it('should return 401 for wrong credentials', async () => {
            userRepo.findByUsername.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/auth/login')
                .send({ username: 'wrong', password: 'wrong' });

            expect(response.status).toBe(401);
        });
    });
});
