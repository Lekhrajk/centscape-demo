import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/validation';

export interface AppError extends Error {
  statusCode?: number;
  field?: string;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle validation errors
  if (error instanceof ValidationError) {
    res.status(error.statusCode || 400).json({
      error: error.message,
      field: error.field,
    });
    return;
  }

  // Handle specific error types
  if (error.name === 'SyntaxError' && 'body' in error) {
    res.status(400).json({
      error: 'Invalid JSON in request body',
      field: 'body',
    });
    return;
  }

  if (error.name === 'TypeError' && error.message.includes('Cannot read property')) {
    res.status(400).json({
      error: 'Invalid request format',
    });
    return;
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 
    ? 'Internal server error' 
    : error.message || 'An error occurred';

  res.status(statusCode).json({
    error: message,
    ...(process.env['NODE_ENV'] === 'development' && {
      stack: error.stack,
    }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
  });
};
