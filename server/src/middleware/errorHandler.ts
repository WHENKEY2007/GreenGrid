import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // Handle Custom Application Errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        details: err.details,
      },
    });
  }

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A resource with this identifier already exists.',
      error: {
        code: 'CONFLICT',
      },
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Requested record was not found.',
      error: {
        code: 'NOT_FOUND',
      },
    });
  }

  // Handle Prisma Database Connection / Initialization Errors
  if (err.name === 'PrismaClientInitializationError' || err.code === 'P1001') {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Ensure PostgreSQL service is running on port 5432.',
      error: {
        code: 'DATABASE_UNAVAILABLE',
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      },
    });
  }

  console.error('Unhandled Server Error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    },
  });
};
