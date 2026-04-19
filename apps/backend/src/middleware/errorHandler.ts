import { Request, Response, NextFunction } from 'express';


export class AppError extends Error {
    constructor(public statusCode: number, public message: string) {
        super(message);
        this.name = 'AppError';
    }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  //handle unexpected errors
  console.error('[Unhandled]', err.stack);
  return res.status(500).json({ error: 'Internal server error' });
}
