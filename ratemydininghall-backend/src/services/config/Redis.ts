import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

let redisClient: Redis | null = null;

if (redisUrl) {
    const isProd = redisUrl.startsWith('rediss://');

    redisClient = new Redis(redisUrl, {
        family: 6,
        tls: isProd ? { rejectUnauthorized: false } : undefined,
    });
} else {
    console.log('Local dev: caching disabled');
}

export default redisClient;