import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  isValidUrl,
  isInternalUrl,
  generateRandomString,
  RateLimiter,
  SecureStorage,
} from '@/lib/security';

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('escapes HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('handles ampersands', () => {
      expect(sanitizeInput('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('handles quotes', () => {
      expect(sanitizeInput("It's a test")).toContain('&#x27;');
    });
  });

  describe('isValidUrl', () => {
    it('accepts valid HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('accepts valid HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('rejects javascript: protocol', () => {
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('rejects data: protocol', () => {
      expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('rejects invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
    });
  });

  describe('generateRandomString', () => {
    it('generates string of correct length', () => {
      const str = generateRandomString(32);
      expect(str).toHaveLength(64); // Each byte becomes 2 hex chars
    });

    it('generates different strings', () => {
      const str1 = generateRandomString();
      const str2 = generateRandomString();
      expect(str1).not.toBe(str2);
    });

    it('generates hex characters only', () => {
      const str = generateRandomString(16);
      expect(str).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('RateLimiter', () => {
    it('allows requests within limit', () => {
      const limiter = new RateLimiter(5, 60000);
      
      expect(limiter.canMakeRequest()).toBe(true);
      expect(limiter.canMakeRequest()).toBe(true);
      expect(limiter.canMakeRequest()).toBe(true);
    });

    it('blocks requests over limit', () => {
      const limiter = new RateLimiter(2, 60000);
      
      limiter.canMakeRequest();
      limiter.canMakeRequest();
      
      expect(limiter.canMakeRequest()).toBe(false);
    });

    it('tracks remaining requests', () => {
      const limiter = new RateLimiter(5, 60000);
      
      limiter.canMakeRequest();
      expect(limiter.getRemainingRequests()).toBe(4);
      
      limiter.canMakeRequest();
      expect(limiter.getRemainingRequests()).toBe(3);
    });
  });

  describe('SecureStorage', () => {
    it('stores and retrieves values', () => {
      const storage = new SecureStorage('test_');
      
      storage.setItem('key', { value: 'test' });
      const retrieved = storage.getItem('key');
      
      expect(retrieved).toEqual({ value: 'test' });
    });

    it('returns default value for missing keys', () => {
      const storage = new SecureStorage('test_');
      
      const result = storage.getItem('nonexistent', { default: true });
      expect(result).toEqual({ default: true });
    });

    it('removes items', () => {
      const storage = new SecureStorage('test_');
      
      storage.setItem('key', 'value');
      storage.removeItem('key');
      
      expect(storage.getItem('key')).toBe(null);
    });
  });
});
