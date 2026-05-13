const request = require('supertest');
const app = require('../../src/app');
const booksService = require('../../src/shared/services/books.service');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

jest.mock('../../src/shared/services/books.service');
jest.mock('../../src/shared/configuration/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

process.env.ACCESS_TOKEN_SECRET = 'test_secret';

describe('Books Integration Tests', () => {
    let token;
    const userId = new mongoose.Types.ObjectId().toString();
    const validExternalId = new mongoose.Types.ObjectId().toString();

    beforeAll(() => {
        token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/books/search', () => {
        it('should return books for a search query', async () => {
            booksService.searchBooks.mockResolvedValue([{ title: 'Book 1' }]);

            const response = await request(app)
                .get('/api/books/search?q=test')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([{ title: 'Book 1' }]);
        });

        it('should return 401 if not authenticated', async () => {
            const response = await request(app).get('/api/books/search?q=test');
            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/books/user-books', () => {
        it('should add a book to user library', async () => {
            booksService.addUserBook.mockResolvedValue({ userBook: { _id: 'ub1' } });

            const response = await request(app)
                .post('/api/books/user-books')
                .set('Authorization', `Bearer ${token}`)
                .send({ externalBookId: validExternalId });

            expect(response.status).toBe(201);
            // The controller returns JSON(result.userBook)
            expect(response.body._id).toBe('ub1');
        });

        it('should return 409 if book already exists', async () => {
            booksService.addUserBook.mockResolvedValue({ conflict: true });

            const response = await request(app)
                .post('/api/books/user-books')
                .set('Authorization', `Bearer ${token}`)
                .send({ externalBookId: validExternalId });

            expect(response.status).toBe(409);
        });
    });
});
