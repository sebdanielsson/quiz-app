/**
 * Cache configuration for the quiz app.
 *
 * This module defines TTL (Time To Live) values for different cache keys
 * and provides utilities to check if caching is enabled.
 *
 * @see /docs/caching.md for full documentation
 */

/**
 * Cache TTL values in seconds.
 * Adjust these based on your data freshness requirements vs performance needs.
 */
export const CACHE_TTL = {
  /**
   * Quiz list cache TTL (5 minutes).
   * Lower value since new quizzes may be created frequently.
   */
  QUIZ_LIST: 5 * 60,

  /**
   * Individual quiz details cache TTL (10 minutes).
   * Quiz content rarely changes after creation.
   */
  QUIZ_DETAIL: 10 * 60,

  /**
   * Leaderboard cache TTL (1 minute).
   * Lower value to keep leaderboards relatively fresh after attempts.
   */
  LEADERBOARD: 1 * 60,

  /**
   * Global leaderboard cache TTL (2 minutes).
   * Aggregated across all quizzes, more expensive to compute.
   */
  GLOBAL_LEADERBOARD: 2 * 60,
} as const;

/**
 * Cache key prefixes for different data types.
 * Using prefixes allows selective invalidation.
 */
export const CACHE_KEYS = {
  QUIZ_LIST: "quizzes:list",
  QUIZ_DETAIL: "quizzes:detail",
  LEADERBOARD: "leaderboard:quiz",
  GLOBAL_LEADERBOARD: "leaderboard:global",
} as const;

/**
 * Check if caching is enabled via environment variable.
 * Caching is opt-in: set REDIS_URL or VALKEY_URL to enable.
 *
 * @returns true if a Redis/Valkey URL is configured
 */
export function isCachingEnabled(): boolean {
  return Boolean(process.env.REDIS_URL || process.env.VALKEY_URL);
}

/**
 * Get the Redis connection URL from environment.
 * Bun's Redis client checks REDIS_URL, then VALKEY_URL, then defaults to localhost.
 *
 * @returns The configured Redis URL or undefined for default
 */
export function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL || process.env.VALKEY_URL;
}
