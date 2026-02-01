import { describe, it, expect, vi } from 'vitest';
import {
  debounce,
  throttle,
  memoize,
  prefersReducedMotion,
  isSlowConnection,
} from '@/lib/performance';

describe('Performance Utilities', () => {
  describe('debounce', () => {
    it('delays function execution', async () => {
      let callCount = 0;
      const fn = debounce(() => callCount++, 100);

      fn();
      fn();
      fn();

      expect(callCount).toBe(0);

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(callCount).toBe(1);
    });
  });

  describe('throttle', () => {
    it('limits function calls', async () => {
      let callCount = 0;
      const fn = throttle(() => callCount++, 100);

      fn();
      fn();
      fn();

      expect(callCount).toBe(1);

      await new Promise(resolve => setTimeout(resolve, 150));
      fn();
      expect(callCount).toBe(2);
    });
  });

  describe('memoize', () => {
    it('caches function results', () => {
      let callCount = 0;
      const fn = memoize((x: number) => {
        callCount++;
        return x * 2;
      });

      expect(fn(5)).toBe(10);
      expect(fn(5)).toBe(10);
      expect(callCount).toBe(1); // Should only call once

      expect(fn(10)).toBe(20);
      expect(callCount).toBe(2); // New argument, new call
    });
  });

  describe('prefersReducedMotion', () => {
    it('returns boolean', () => {
      const result = prefersReducedMotion();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isSlowConnection', () => {
    it('returns boolean', () => {
      const result = isSlowConnection();
      expect(typeof result).toBe('boolean');
    });
  });
});
