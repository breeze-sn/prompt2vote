/**
 * Response Cache Persistence
 * 
 * Manages caching of Gemini responses with localStorage persistence.
 * Reduces API calls and improves performance on repeat visits.
 * 
 * Cache strategy:
 * - Max 50 responses per session
 * - Auto-expire after 7 days
 * - Hash-based keys for consistency
 * - Graceful fallback if storage unavailable
 */

export interface CachedResponse {
  query: string;
  response: string;
  timestamp: number;
  ttl: number; // milliseconds
}

const CACHE_KEY = 'prompt2vote.responseCache';
const MAX_CACHE_SIZE = 50;
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Simple hash function for cache keys
 */
function hashQuery(query: string): string {
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    const char = query.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `cache_${Math.abs(hash)}`;
}

/**
 * Get cached response if available and not expired
 */
export function getCachedResponse(query: string): string | null {
  try {
    const cacheKey = hashQuery(query);
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cache: Record<string, CachedResponse> = JSON.parse(cached);
    const entry = cache[cacheKey];

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      delete cache[cacheKey];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return entry.response;
  } catch {
    // Graceful fallback if storage fails
    return null;
  }
}

/**
 * Set cached response
 */
export function setCachedResponse(query: string, response: string, ttl: number = DEFAULT_TTL): void {
  try {
    const cacheKey = hashQuery(query);
    let cache: Record<string, CachedResponse> = {};

    const existing = localStorage.getItem(CACHE_KEY);
    if (existing) {
      cache = JSON.parse(existing);
    }

    cache[cacheKey] = {
      query,
      response,
      timestamp: Date.now(),
      ttl,
    };

    // Prune if over limit (keep 10 most recent)
    const entries = Object.entries(cache).sort(
      ([, a], [, b]) => b.timestamp - a.timestamp
    );
    if (entries.length > MAX_CACHE_SIZE) {
      cache = Object.fromEntries(entries.slice(0, MAX_CACHE_SIZE));
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Gracefully fail if storage is full or unavailable
    console.warn('Failed to cache response');
  }
}

/**
 * Clear all cached responses
 */
export function clearResponseCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Graceful failure
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  entries: string[];
} {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return { size: 0, entries: [] };

    const cache: Record<string, CachedResponse> = JSON.parse(cached);
    return {
      size: Object.keys(cache).length,
      entries: Object.values(cache).map((e) => e.query),
    };
  } catch {
    return { size: 0, entries: [] };
  }
}
