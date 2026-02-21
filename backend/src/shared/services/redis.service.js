const { createClient } = require('redis');

let client = null;

const connectRedis = async () => {
    const url = process.env.REDIS_URL;

    client = createClient({ url });
    client.on('error', (err) => console.warn('Redis Client Error:', err.message));
    client.on('connect', () => console.log('Redis connected'));
    try {
        await client.connect();
    } catch (err) {
        console.warn('Redis connection failed, caching disabled:', err.message);
        client = null;
    }
};

const getCache = async (key) => {
    if (!client) return null;

    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.warn('Redis GET error:', err.message);
        return null;
    }
};

const setCache = async (key, value, ttlSeconds = 600) => {
    if (!client) return;

    try {
        await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (err) {
        console.warn('Redis SET error:', err.message);
    }
};

module.exports = { connectRedis, getCache, setCache };
