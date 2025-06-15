const { createClient } = require('redis')

let redisClient = null
let isRedisConnected = false

// Create Redis client
const initRedis = async () => {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL })
    
    redisClient.on('error', (err) => {
      console.warn('⚠️  Redis connection error:', err.message)
      isRedisConnected = false
    })
    
    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully')
      isRedisConnected = true
    })
    
    redisClient.on('disconnect', () => {
      console.warn('⚠️  Redis disconnected')
      isRedisConnected = false
    })
    
    await redisClient.connect()
    isRedisConnected = true
    return redisClient
  } catch (error) {
    console.warn('⚠️  Redis unavailable - caching disabled:', error.message)
    isRedisConnected = false
    return null
  }
}

// Wrapper object that handles Redis operations gracefully
const redisWrapper = {
  async get(key) {
    if (!redisClient || !isRedisConnected) return null
    try {
      return await redisClient.get(key)
    } catch (error) {
      console.warn('Redis GET error:', error.message)
      return null
    }
  },
  
  async set(key, value) {
    if (!redisClient || !isRedisConnected) return 'OK'
    try {
      return await redisClient.set(key, value)
    } catch (error) {
      console.warn('Redis SET error:', error.message)
      return 'OK'
    }
  },
  
  async setex(key, seconds, value) {
    if (!redisClient || !isRedisConnected) return 'OK'
    try {
      return await redisClient.setEx(key, seconds, value)
    } catch (error) {
      console.warn('Redis SETEX error:', error.message)
      return 'OK'
    }
  },
  
  async del(key) {
    if (!redisClient || !isRedisConnected) return 1
    try {
      return await redisClient.del(key)
    } catch (error) {
      console.warn('Redis DEL error:', error.message)
      return 1
    }
  },
  
  async exists(key) {
    if (!redisClient || !isRedisConnected) return 0
    try {
      return await redisClient.exists(key)
    } catch (error) {
      console.warn('Redis EXISTS error:', error.message)
      return 0
    }
  },
  
  async expire(key, seconds) {
    if (!redisClient || !isRedisConnected) return 1
    try {
      return await redisClient.expire(key, seconds)
    } catch (error) {
      console.warn('Redis EXPIRE error:', error.message)
      return 1
    }
  },
  
  async hget(key, field) {
    if (!redisClient || !isRedisConnected) return null
    try {
      return await redisClient.hGet(key, field)
    } catch (error) {
      console.warn('Redis HGET error:', error.message)
      return null
    }
  },
  
  async hgetall(key) {
    if (!redisClient || !isRedisConnected) return {}
    try {
      return await redisClient.hGetAll(key)
    } catch (error) {
      console.warn('Redis HGETALL error:', error.message)
      return {}
    }
  },
  
  async hset(key, field, value) {
    if (!redisClient || !isRedisConnected) return 1
    try {
      return await redisClient.hSet(key, field, value)
    } catch (error) {
      console.warn('Redis HSET error:', error.message)
      return 1
    }
  },
  
  async hdel(key, field) {
    if (!redisClient || !isRedisConnected) return 1
    try {
      return await redisClient.hDel(key, field)
    } catch (error) {
      console.warn('Redis HDEL error:', error.message)
      return 1
    }
  },
  
  async ping() {
    if (!redisClient || !isRedisConnected) throw new Error('Redis not available')
    try {
      return await redisClient.ping()
    } catch (error) {
      throw new Error('Redis not available')
    }
  }
}

// Initialize Redis connection
initRedis()

module.exports = redisWrapper