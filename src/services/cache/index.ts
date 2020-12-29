export interface CacheService {
  /**
   * Get value from cache.
   * @param key Cached item key
   */
  get(key: string): Promise<string | null>;

  /**
   * Persist a value in the cache.
   * @param key Cache key
   * @param value Value to store
   */
  set(key: string, value: string): void;
}
