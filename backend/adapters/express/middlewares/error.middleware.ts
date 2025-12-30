import type { Request, Response, NextFunction } from 'express';
import { ApiError, isApiError } from '../types/api-error';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let code: string | undefined = undefined;
  let message = 'Internal server error';

  if (isApiError(err)) {
    const anyErr: any = err;
    status = Number.isInteger(anyErr.status) ? anyErr.status : 500;
    code = anyErr.code;
    if (typeof anyErr.message === 'string' && anyErr.message.trim()) {
      message = anyErr.message;
    }
  }

  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  } else {
    console.error('Error:', err);
  }

  res.status(status).json({ error: { message, code, status } });
}
