/**
 * Redis cache client for the quiz app.
 *
 * Uses Bun's native Redis client with graceful degradation:
 * - If Redis is unavailable, operations silently fail and queries hit the database
 * - Implements cache-aside pattern via cachedFetch()
 * - Supports selective cache invalidation via invalidateCache()
 *
 * @see docs/caching.md for full documentation
 */

import { RedisClient } from "bun";
import { isCachingEnabled, getRedisUrl } from "./config";

/** Singleton Redis client instance */
let redisClient: RedisClient | null = null;

/** Track if we've already logged a connection failure */
let connectionWarningLogged = false;

/**
 * Get or create the Redis client singleton.
 * Returns null if caching is disabled or connection fails.
 *
 * @returns RedisClient instance or null
 */
export async function getRedis(): Promise<RedisClient | null> {
  if (!isCachingEnabled()) {
    return null;
  }

  if (redisClient !== null) {
    return redisClient;
  }

  try {
    const url = getRedisUrl();
    redisClient = url ? new RedisClient(url) : new RedisClient();

    // Test connection with a ping
    await redisClient.send("PING", []);

    // Only log once on first connection
    return redisClient;
  } catch (error) {
    if (!connectionWarningLogged) {
      console.warn("[cache] Redis connection failed, caching disabled:", error);
      connectionWarningLogged = true;
    }
    redisClient = null;
    return null;
  }
}

/**
 * Cache-aside pattern: fetch from cache or execute fetcher and cache result.
 *
 * @param key - Cache key
 * @param ttlSeconds - Time to live in seconds
 * @param fetcher - Async function to fetch data if cache miss
 * @returns Cached or freshly fetched data
 */
export async function cachedFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const redis = await getRedis();

  // If Redis unavailable, skip caching
  if (!redis) {
    return fetcher();
  }

  try {
    // Try to get from cache
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch {
    // Silently continue to fetcher on cache read error
  }

  // Cache miss: fetch fresh data
  const data = await fetcher();

  // Don't cache undefined/null results to avoid caching negative lookups
  if (data === undefined || data === null) {
    return data;
  }

  // Store in cache (fire-and-forget) - SETEX is atomic SET + EXPIRE
  try {
    await redis.send("SETEX", [key, ttlSeconds.toString(), JSON.stringify(data)]);
  } catch {
    // Silently fail - caching is best-effort
  }

  return data;
}

/**
 * Invalidate cache keys matching a pattern.
 * Uses SCAN command for production-safe, non-blocking iteration.
 *
 * @param pattern - Redis key pattern (e.g., "leaderboard:*")
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;

  try {
    let cursor = "0";
    do {
      // SCAN returns [cursor, keys[]]
      const result = (await redis.send("SCAN", [cursor, "MATCH", pattern, "COUNT", "100"])) as [
        string,
        string[],
      ];
      cursor = result[0];
      const keys = result[1];

      if (keys && keys.length > 0) {
        await redis.send("DEL", keys);
      }
    } while (cursor !== "0");
  } catch {
    // Silently fail - cache invalidation is best-effort
  }
}

/**
 * Delete a specific cache key.
 *
 * @param key - Exact cache key to delete
 */
export async function deleteCache(key: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.warn("[cache] Delete error for key", key, error);
  }
}

/**
 * Close the Redis connection.
 * Call this during graceful shutdown.
 */
export function closeRedis(): void {
  if (redisClient) {
    redisClient.close();
    redisClient = null;
  }
}
