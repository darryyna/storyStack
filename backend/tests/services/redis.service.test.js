jest.mock('../../src/shared/configuration/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));

describe('RedisService', () => {
    let redisService;
    let mockClient;

    beforeEach(() => {
        jest.resetModules();
        mockClient = {
            connect: jest.fn().mockResolvedValue(),
            on: jest.fn(),
            get: jest.fn(),
            set: jest.fn().mockResolvedValue('OK'),
            del: jest.fn().mockResolvedValue(1),
        };
        
        jest.doMock('redis', () => ({
            createClient: jest.fn().mockReturnValue(mockClient)
        }));
        
        redisService = require('../../src/shared/services/redis.service');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should connect to redis', async () => {
        await redisService.connectRedis();
        expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should set cache if client is connected', async () => {
        await redisService.connectRedis();
        await redisService.setCache('key', { a: 1 }, 100);
        expect(mockClient.set).toHaveBeenCalledWith('key', JSON.stringify({ a: 1 }), { EX: 100 });
    });

    it('should get cache if client is connected', async () => {
        await redisService.connectRedis();
        mockClient.get.mockResolvedValue(JSON.stringify({ a: 1 }));
        const result = await redisService.getCache('key');
        expect(result).toEqual({ a: 1 });
    });

    it('should return null on get if client error occurs', async () => {
        await redisService.connectRedis();
        mockClient.get.mockRejectedValue(new Error('Redis Error'));
        const result = await redisService.getCache('key');
        expect(result).toBeNull();
    });
});
