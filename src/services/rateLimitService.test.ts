import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimiter, checkRateLimit } from '../services/rateLimitService';

describe('Rate Limiter Service', () => {
  beforeEach(() => {
    rateLimiter.reset();
  });

  it('should allow requests within limits', () => {
    const result = rateLimiter.isAllowed('user1', '/api/gemini');
    expect(result.allowed).toBe(true);
    expect(result.remainingRequests).toBeGreaterThan(0);
  });

  it('should block requests after burst limit exceeded', () => {
    const userId = 'user1';
    
    // Make 5 rapid requests (burst limit)
    for (let i = 0; i < 5; i++) {
      const result = rateLimiter.isAllowed(userId, '/api/gemini');
      expect(result.allowed).toBe(true);
    }

    // 6th request should be blocked
    const blocked = rateLimiter.isAllowed(userId, '/api/gemini');
    expect(blocked.allowed).toBe(false);
    expect(blocked.resetInMs).toBeGreaterThan(0);
  });

  it('should allow burst limit resets after window passes', () => {
    const userId = 'user3';
    
    // Verify burst blocking works
    for (let i = 0; i < 5; i++) {
      rateLimiter.isAllowed(userId, '/api/gemini');
    }
    const blocked = rateLimiter.isAllowed(userId, '/api/gemini');
    expect(blocked.allowed).toBe(false);
  });

  it('should isolate rate limits per user', () => {
    const user1Result = rateLimiter.isAllowed('user1', '/api/gemini');
    const user2Result = rateLimiter.isAllowed('user2', '/api/gemini');

    expect(user1Result.allowed).toBe(true);
    expect(user2Result.allowed).toBe(true);
  });

  it('should provide stats', () => {
    rateLimiter.isAllowed('user1', '/api/gemini');
    rateLimiter.isAllowed('user1', '/api/gemini');

    const stats = rateLimiter.getStats('user1');
    expect(stats.minuteUsage).toBe(2);
    expect(stats.burstUsage).toBe(2);
    expect(stats.minuteLimit).toBe(20);
    expect(stats.burstLimit).toBe(5);
  });

  it('should reset user limits', () => {
    rateLimiter.isAllowed('user1', '/api/gemini');
    rateLimiter.resetUser('user1');

    const stats = rateLimiter.getStats('user1');
    expect(stats.minuteUsage).toBe(0);
  });

  describe('checkRateLimit helper', () => {
    it('should return allowed when within limits', () => {
      const result = checkRateLimit('user1', '/api/gemini');
      expect(result.allowed).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should return error message when rate limited', () => {
      for (let i = 0; i < 5; i++) {
        rateLimiter.isAllowed('user1', '/api/gemini');
      }

      const result = checkRateLimit('user1', '/api/gemini');
      expect(result.allowed).toBe(false);
      expect(result.message).toContain('Rate limited');
      expect(result.message).toContain('seconds');
    });

    it('should record request with correct endpoint', () => {
      const result = checkRateLimit('testuser', '/api/gemini');
      expect(result.allowed).toBe(true);
      
      const stats = rateLimiter.getStats('testuser');
      expect(stats.minuteUsage).toBe(1);
    });
  });
});
