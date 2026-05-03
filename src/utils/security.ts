/**
 * Security utilities for the client app.
 *
 * These helpers focus on actual browser-side hardening we can control:
 * - avoid injecting unsafe protocols into links
 * - reduce sensitive information leakage from browser referrers
 * - normalize and limit user input before it reaches the assistant
 */

const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

export const ALLOWED_LINK_HOSTS = new Set([
  'eci.gov.in',
  'voters.eci.gov.in',
  'nvsp.in',
]);

export const initSecurity = () => {
  const referrer = document.querySelector('meta[name="referrer"]') ?? document.createElement('meta');
  referrer.setAttribute('name', 'referrer');
  referrer.setAttribute('content', 'no-referrer');
  if (!referrer.parentElement) {
    document.head.appendChild(referrer);
  }

  const permissions = document.querySelector('meta[http-equiv="Permissions-Policy"]') ?? document.createElement('meta');
  permissions.setAttribute('http-equiv', 'Permissions-Policy');
  permissions.setAttribute('content', 'camera=(), microphone=(), geolocation=()');
  if (!permissions.parentElement) {
    document.head.appendChild(permissions);
  }
};

export const sanitizeUserInput = (value: string, maxLength = 1000): string => {
  const normalized = value
    .replace(/\u0000/g, '')
    .replace(/[\u2028\u2029]/g, ' ')
    .trim();

  return normalized.slice(0, maxLength);
};

export const isSafeLinkUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return SAFE_PROTOCOLS.has(url.protocol) && ALLOWED_LINK_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};
