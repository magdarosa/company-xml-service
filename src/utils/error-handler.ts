import { HttpException, HttpStatus } from '@nestjs/common';

interface ErrorResponseBody {
  error: string;
  error_description: string;
}

/**
 * Creates HTTP exception with error response format
 * 
 * @param error - Error type (example: 'Not Found', 'Service Unavailable')
 * @param description - Detailed error description
 * @param status - HTTP status code from NestJS HttpStatus enum
 * @returns HttpException with error response body
 */
export function createHttpException(
  error: string,
  description: string,
  status: HttpStatus,
): HttpException {
  const body: ErrorResponseBody = {
    error,
    error_description: description,
  };
  return new HttpException(body, status);
}

/**
 * Centralizes error handling logic for the companies service
 * 
 * Converts error types into HTTP exceptions with response format and status codes.
 * 
 * @param error - The original error from HTTP request, parsing or validation
 * @param id - Company ID for error messages
 * @returns HttpException with appropriate status code and error details
 */
export function handleServiceError(error: unknown, id: number): HttpException {
  // If it's already an HttpException, preserve it
  if (error instanceof HttpException) {
    return error;
  }

  // Handle Axios errors (network issues, HTTP errors)
  if (isAxiosError(error)) {
    if (error.response?.status === 404) {
      return createHttpException(
        'Not Found',
        `Company with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (error.response?.status && error.response.status >= 500) {
      return createHttpException(
        'Service Unavailable',
        'External XML service is experiencing issues',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // Handle parsing or validation errors
  if (error instanceof Error) {
    if (error.message.includes('XML') || error.message.includes('parsing')) {
      return createHttpException(
        'Service Unavailable',
        'Unable to process data from XML service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // Generic service error
  return createHttpException(
    'Service Unavailable',
    'Unable to retrieve company data from XML service',
    HttpStatus.SERVICE_UNAVAILABLE,
  );
}

function isAxiosError(
  error: unknown,
): error is { response?: { status: number } } {
  return typeof error === 'object' && error !== null && 'response' in error;
}