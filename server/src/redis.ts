import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  if (redis) return redis

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    console.warn('REDIS_URL not set, running without Redis persistence')
    return null
  }

  redis = new Redis(redisUrl, {
    retryStrategy: (times) => {
      const delay = Math.min(times * 100, 3000)
      return delay
    },
    maxRetriesPerRequest: 3,
  })

  redis.on('error', (err) => {
    console.error('Redis error:', err)
  })

  redis.on('connect', () => {
    console.log('Redis connected')
  })

  return redis
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
  }
}
