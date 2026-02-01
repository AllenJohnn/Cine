/**
 * Error Handling Utilities
 * 
 * Centralized error handling for consistent error management
 * across the application.
 */

/**
 * Custom error types for better error categorization
 */
export enum ErrorType {
  NETWORK = "NETWORK_ERROR",
  API = "API_ERROR",
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

/**
 * Custom Application Error class
 */
export class AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  details?: unknown;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode?: number,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Handle API errors from fetch requests
 */
export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new AppError(
      "Network error. Please check your internet connection.",
      ErrorType.NETWORK
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message, ErrorType.API);
  }

  return new AppError(
    "An unexpected error occurred",
    ErrorType.UNKNOWN,
    undefined,
    error
  );
}

/**
 * Handle HTTP response errors
 */
export function handleHttpError(response: Response): AppError {
  const statusCode = response.status;

  switch (statusCode) {
    case 400:
      return new AppError(
        "Invalid request. Please check your input.",
        ErrorType.VALIDATION,
        400
      );
    case 401:
      return new AppError(
        "Authentication required. Please log in.",
        ErrorType.AUTHENTICATION,
        401
      );
    case 403:
      return new AppError(
        "You don't have permission to access this resource.",
        ErrorType.AUTHORIZATION,
        403
      );
    case 404:
      return new AppError(
        "The requested resource was not found.",
        ErrorType.NOT_FOUND,
        404
      );
    case 429:
      return new AppError(
        "Too many requests. Please try again later.",
        ErrorType.API,
        429
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return new AppError(
        "Server error. Please try again later.",
        ErrorType.API,
        statusCode
      );
    default:
      return new AppError(
        `Request failed with status ${statusCode}`,
        ErrorType.API,
        statusCode
      );
  }
}

/**
 * Log errors to console (and optionally to external service)
 */
export function logError(error: Error | AppError, context?: string): void {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    context,
    message: error.message,
    stack: error.stack,
    ...(error instanceof AppError && {
      type: error.type,
      statusCode: error.statusCode,
      details: error.details,
    }),
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error Log:", errorLog);
  }

  // In production, you would send this to an error tracking service
  // Example: Sentry, LogRocket, etc.
  // if (process.env.NODE_ENV === "production") {
  //   sendToErrorTrackingService(errorLog);
  // }
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logError(error as Error, "JSON Parse Error");
    return fallback;
  }
}

/**
 * Async error wrapper for try-catch elimination
 */
export async function asyncTryCatch<T>(
  promise: Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
