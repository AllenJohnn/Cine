import { describe, it, expect } from 'vitest';
import {
  handleApiError,
  handleHttpError,
  AppError,
  ErrorType,
  formatErrorMessage,
  asyncTryCatch,
} from '@/lib/errorHandler';

describe('Error Handler Utilities', () => {
  describe('AppError', () => {
    it('creates error with correct properties', () => {
      const error = new AppError(
        'Test error',
        ErrorType.API,
        404,
        { extra: 'data' }
      );

      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.API);
      expect(error.statusCode).toBe(404);
      expect(error.details).toEqual({ extra: 'data' });
    });

    it('has default error type', () => {
      const error = new AppError('Test');
      expect(error.type).toBe(ErrorType.UNKNOWN);
    });
  });

  describe('handleApiError', () => {
    it('returns AppError for Error instances', () => {
      const error = new Error('API failed');
      const result = handleApiError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('API failed');
      expect(result.type).toBe(ErrorType.API);
    });

    it('detects network errors', () => {
      const error = new TypeError('fetch failed');
      const result = handleApiError(error);

      expect(result.type).toBe(ErrorType.NETWORK);
    });

    it('returns existing AppError unchanged', () => {
      const appError = new AppError('Test', ErrorType.VALIDATION);
      const result = handleApiError(appError);

      expect(result).toBe(appError);
    });
  });

  describe('handleHttpError', () => {
    it('handles 404 errors', () => {
      const response = new Response(null, { status: 404 });
      const error = handleHttpError(response);

      expect(error.statusCode).toBe(404);
      expect(error.type).toBe(ErrorType.NOT_FOUND);
    });

    it('handles 401 errors', () => {
      const response = new Response(null, { status: 401 });
      const error = handleHttpError(response);

      expect(error.statusCode).toBe(401);
      expect(error.type).toBe(ErrorType.AUTHENTICATION);
    });

    it('handles 500 errors', () => {
      const response = new Response(null, { status: 500 });
      const error = handleHttpError(response);

      expect(error.statusCode).toBe(500);
      expect(error.type).toBe(ErrorType.API);
    });
  });

  describe('formatErrorMessage', () => {
    it('formats AppError messages', () => {
      const error = new AppError('Custom error');
      expect(formatErrorMessage(error)).toBe('Custom error');
    });

    it('formats Error messages', () => {
      const error = new Error('Standard error');
      expect(formatErrorMessage(error)).toBe('Standard error');
    });

    it('formats string errors', () => {
      expect(formatErrorMessage('String error')).toBe('String error');
    });

    it('provides default message for unknown errors', () => {
      const message = formatErrorMessage({ unknown: 'object' });
      expect(message).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('asyncTryCatch', () => {
    it('returns data on success', async () => {
      const promise = Promise.resolve('success');
      const [data, error] = await asyncTryCatch(promise);

      expect(data).toBe('success');
      expect(error).toBe(null);
    });

    it('returns error on failure', async () => {
      const promise = Promise.reject(new Error('failed'));
      const [data, error] = await asyncTryCatch(promise);

      expect(data).toBe(null);
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('failed');
    });
  });
});
