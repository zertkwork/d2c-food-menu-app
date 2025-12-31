import type { Request, Response, NextFunction } from 'express';
import { ApiError, isApiError } from '../types/api-error';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Normalize defaults
  let status = 500;
  let code: string | undefined = undefined;
  let message = 'Internal server error';

  if (isApiError(err)) {
    status = Number.isInteger((err as any).status) ? (err as any).status : 500;
    code = (err as any).code;
    message = typeof (err as any).message === 'string' && (err as any).message.trim().length > 0
      ? (err as any).message
      : 'Internal server error';
  }

  // Always log full error server-side
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  } else {
    console.error('Error:', err);
  }

  res.status(status).json({ error: { message, code, status } });
}
