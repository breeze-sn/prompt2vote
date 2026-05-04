/**
 * Rate Limiter Service
 * 
 * Prevents API abuse by limiting requests per user per time window.
 * Uses sliding window algorithm for fair rate limiting.
 * 
 * Configuration:
 * - 20 requests per minute (default)
 * - 5 requests per 10 seconds (burst protection)
 * - Stored in memory (resets on page refresh)
 */

interface RequestRecord {
  timestamp: number;
  endpoint: string;
}

class RateLimiter {
  private requests: Map<string, RequestRecord[]> = new Map();
  private readonly requestsPerMinute = 20;
  private readonly requestsPerBurst = 5;
  private readonly burstWindowMs = 10000; // 10 seconds
  private readonly minuteWindowMs = 60000; // 1 minute

  /**
   * Check if request is allowed
   * Returns: { allowed: boolean, remainingRequests: number, resetInMs: number }
   */
  isAllowed(userId: string, endpoint: string): {
    allowed: boolean;
    remainingRequests: number;
    resetInMs: number;
  } {
    const now = Date.now();
    const key = `${userId}`;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const userRequests = this.requests.get(key)!;

    // Clean old requests
    const recentRequests = userRequests.filter(
      (req) => now - req.timestamp < this.minuteWindowMs
    );

    // Check burst limit (last 10 seconds)
    const burstRequests = recentRequests.filter(
      (req) => now - req.timestamp < this.burstWindowMs
    );

    if (burstRequests.length >= this.requestsPerBurst) {
      const oldestBurst = Math.min(...burstRequests.map((r) => r.timestamp));
      const resetInMs = this.burstWindowMs - (now - oldestBurst);

      return {
        allowed: false,
        remainingRequests: 0,
        resetInMs: Math.max(0, resetInMs),
      };
    }

    // Check minute limit
    if (recentRequests.length >= this.requestsPerMinute) {
      const oldestRequest = Math.min(...recentRequests.map((r) => r.timestamp));
      const resetInMs = this.minuteWindowMs - (now - oldestRequest);

      return {
        allowed: false,
        remainingRequests: 0,
        resetInMs: Math.max(0, resetInMs),
      };
    }

    // Record this request
    recentRequests.push({ timestamp: now, endpoint });
    this.requests.set(key, recentRequests);

    const remainingRequests = this.requestsPerMinute - recentRequests.length;

    return {
      allowed: true,
      remainingRequests,
      resetInMs: 0,
    };
  }

  /**
   * Get current usage stats
   */
  getStats(userId: string): {
    minuteUsage: number;
    burstUsage: number;
    minuteLimit: number;
    burstLimit: number;
  } {
    const now = Date.now();
    const key = `${userId}`;
    const userRequests = this.requests.get(key) || [];

    const recentRequests = userRequests.filter(
      (req) => now - req.timestamp < this.minuteWindowMs
    );

    const burstRequests = recentRequests.filter(
      (req) => now - req.timestamp < this.burstWindowMs
    );

    return {
      minuteUsage: recentRequests.length,
      burstUsage: burstRequests.length,
      minuteLimit: this.requestsPerMinute,
      burstLimit: this.requestsPerBurst,
    };
  }

  /**
   * Reset all limits (useful for testing)
   */
  reset(): void {
    this.requests.clear();
  }

  /**
   * Reset for specific user
   */
  resetUser(userId: string): void {
    this.requests.delete(userId);
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Helper to check if request is allowed with error handling
 */
export function checkRateLimit(
  userId: string,
  endpoint: string
): { allowed: boolean; message?: string } {
  const result = rateLimiter.isAllowed(userId, endpoint);

  if (!result.allowed) {
    const secondsUntilReset = Math.ceil(result.resetInMs / 1000);
    return {
      allowed: false,
      message: `Rate limited. Please try again in ${secondsUntilReset} seconds.`,
    };
  }

  if (result.remainingRequests < 5) {
    console.warn(
      `Warning: Only ${result.remainingRequests} requests remaining this minute`
    );
  }

  return { allowed: true };
}
