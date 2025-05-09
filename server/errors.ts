/**
 * Custom API error class that extends Error with status code and optional cause
 */
export class ApiError extends Error {
  status: number;
  cause?: any;

  constructor(message: string, status: number = 500, cause?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.cause = cause;
  }
}