import { describe, expect, it } from 'vitest';
import { isSafeLinkUrl, sanitizeUserInput } from './security';

describe('security utils', () => {
  it('sanitizes unsafe control characters and trims input', () => {
    expect(sanitizeUserInput('  hello\u0000 world  ')).toBe('hello world');
  });

  it('limits input length', () => {
    expect(sanitizeUserInput('a'.repeat(1100))).toHaveLength(1000);
  });

  it('allows only approved election domains', () => {
    expect(isSafeLinkUrl('https://voters.eci.gov.in')).toBe(true);
    expect(isSafeLinkUrl('https://eci.gov.in')).toBe(true);
    expect(isSafeLinkUrl('https://example.com')).toBe(false);
  });
});