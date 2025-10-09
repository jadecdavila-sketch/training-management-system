import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation middleware factory
 * Creates middleware to validate request body, query, or params against a Zod schema
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validated = await schema.parseAsync(data);

      // Replace the original data with validated/sanitized data
      req[source] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into user-friendly messages
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }

      // Unexpected error
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Validate query parameters
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');

/**
 * Validate URL parameters
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
