import { AppConfig } from "config";
import RedisClient, { Redis } from "ioredis";
import { CacheService } from "./cache.service";

class RedisService implements CacheService {
  client: Redis;

  constructor(config: AppConfig) {
    this.client = new RedisClient(config.redis.connectionString);
  }

  /**
   * Get value from cache.
   * @param key Cached item key
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Persist a value in the cache.
   * @param key Cache key
   * @param value Value to store
   */
  async set(key: string, value: string) {
    await this.client.set(key, value);
  }
}

export default RedisService;
