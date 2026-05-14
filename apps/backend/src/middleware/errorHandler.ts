import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod'; // Add this import

export class AppError extends Error {
    constructor(public statusCode: number, public message: string) {
        super(message);
        this.name = 'AppError';
    }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // 1. Handle Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({ 
      error: err.issues[0]?.message || 'Validation error'
    });
  }

  // 2. Handle Custom App Errors (like password length or duplicate email)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Handle unexpected errors
  console.error('[Unhandled]', err.stack);
  return res.status(500).json({ error: 'Internal server error' });
}