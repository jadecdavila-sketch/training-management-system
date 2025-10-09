import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import { AppError } from '../lib/errors.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Default to 500 Internal Server Error
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Handle custom AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log error with appropriate level
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('HTTP Error', {
    statusCode,
    message: err.message,
    stack: isOperational ? undefined : err.stack, // Only log stack for unexpected errors
    method: req.method,
    path: req.path,
    ip: req.ip,
    isOperational,
  });

  // Send response
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? message :
           (isOperational ? message : 'Internal server error'),
    ...(process.env.NODE_ENV === 'development' && !isOperational && { stack: err.stack }),
  });
};