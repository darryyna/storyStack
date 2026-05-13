const booksService = require('../../src/shared/services/books.service');
const userBookRepo = require('../../src/shared/repositories/userBook.repository');
const externalBookRepo = require('../../src/shared/repositories/externalBook.repository');
const readingLogRepo = require('../../src/shared/repositories/readingLog.repository');
const googleBooksService = require('../../src/shared/services/googleBooks.service');
const openLibraryService = require('../../src/shared/services/openLibrary.service');
const redisService = require('../../src/shared/services/redis.service');
const mongoose = require('mongoose');

jest.mock('../../src/shared/repositories/userBook.repository');
jest.mock('../../src/shared/repositories/externalBook.repository');
jest.mock('../../src/shared/repositories/readingLog.repository');
jest.mock('../../src/shared/services/googleBooks.service');
jest.mock('../../src/shared/services/openLibrary.service');
jest.mock('../../src/shared/services/redis.service');
jest.mock('../../src/shared/configuration/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));

describe('BooksService', () => {
    const validId = new mongoose.Types.ObjectId().toString();
    const validUserId = new mongoose.Types.ObjectId().toString();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('searchBooks', () => {
        it('should return cached results if available', async () => {
            redisService.getCache.mockResolvedValue([{ title: 'Cached' }]);
            const result = await booksService.searchBooks('test');
            expect(result).toEqual([{ title: 'Cached' }]);
            expect(googleBooksService.search).not.toHaveBeenCalled();
        });

        it('should search Google Books if not in cache', async () => {
            redisService.getCache.mockResolvedValue(null);
            googleBooksService.search.mockResolvedValue([{ title: 'Google' }]);
            const result = await booksService.searchBooks('test');
            expect(result).toEqual([{ title: 'Google' }]);
            expect(redisService.setCache).toHaveBeenCalled();
        });
    });

    describe('addUserBook', () => {
        it('should return conflict if book already exists for user', async () => {
            externalBookRepo.findById.mockResolvedValue({ _id: validId });
            userBookRepo.findByUserAndBookId.mockResolvedValue({ _id: 'ub1' });

            const result = await booksService.addUserBook(validUserId, { externalBookId: validId });
            expect(result.conflict).toBe(true);
        });

        it('should create new user book if it does not exist', async () => {
            externalBookRepo.findById.mockResolvedValue({ _id: validId });
            userBookRepo.findByUserAndBookId.mockResolvedValue(null);
            userBookRepo.create.mockResolvedValue({ _id: 'ub1' });

            const result = await booksService.addUserBook(validUserId, { externalBookId: validId });
            expect(result.userBook).toBeDefined();
            expect(userBookRepo.create).toHaveBeenCalled();
        });
    });

    describe('updateReadingProgress', () => {
        it('should return notFound if userBook not found', async () => {
            userBookRepo.findByUserAndId.mockResolvedValue(null);
            const result = await booksService.updateReadingProgress(validUserId, validId, 10);
            expect(result.notFound).toBe(true);
        });

        it('should update progress and mark completed if pagesRead >= totalPages', async () => {
            const mockUserBook = {
                _id: validId,
                bookId: { pageCount: 100 },
                currentPage: 95,
                status: 'reading'
            };
            userBookRepo.findByUserAndId.mockResolvedValue(mockUserBook);
            userBookRepo.updateProgressAtomic.mockResolvedValue({ ...mockUserBook, status: 'completed' });
            readingLogRepo.upsertForToday.mockResolvedValue({});

            const result = await booksService.updateReadingProgress(validUserId, validId, 10);
            expect(result.userBook.status).toBe('completed');
        });
    });
});
