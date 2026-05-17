const request = require('supertest');
const app = require('../../src/app');
const folderRepo = require('../../src/shared/repositories/folder.repository');
const userBookRepo = require('../../src/shared/repositories/userBook.repository');
const jwt = require('jsonwebtoken');

jest.mock('../../src/shared/repositories/folder.repository');
jest.mock('../../src/shared/repositories/userBook.repository');
jest.mock('../../src/shared/configuration/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

process.env.ACCESS_TOKEN_SECRET = 'test_secret';

describe('Folder Integration Tests', () => {
    let token;
    const userId = 'u1';

    beforeAll(() => {
        token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/folders', () => {
        it('should create a folder', async () => {
            folderRepo.create.mockResolvedValue({ _id: 'f1', name: 'My Folder' });

            const response = await request(app)
                .post('/api/folders')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'My Folder' });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('My Folder');
        });
    });

    describe('GET /api/folders', () => {
        it('should return folders for user', async () => {
            folderRepo.findByUser.mockResolvedValue([{ name: 'F1' }]);

            const response = await request(app)
                .get('/api/folders')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
        });
    });

    describe('DELETE /api/folders/:id', () => {
        it('should delete folder', async () => {
            folderRepo.deleteByUserAndId.mockResolvedValue({ _id: 'f1' });

            const response = await request(app)
                .delete('/api/folders/f1')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(userBookRepo.clearFolderFromBooks).toHaveBeenCalled();
        });

        it('should return 404 if folder not found', async () => {
            folderRepo.deleteByUserAndId.mockResolvedValue(null);

            const response = await request(app)
                .delete('/api/folders/f1')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    });
});
