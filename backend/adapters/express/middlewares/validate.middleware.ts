import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';
import { ApiError } from '../types/api-error';

export function validate(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = { body: req.body, query: req.query, params: req.params };
      const parsed: any = schema.parse(data);
      // Overwrite with parsed to ensure types downstream if desired (but we won't rely on it here)
      (req as any).body = parsed.body;
      (req as any).query = parsed.query;
      (req as any).params = parsed.params;
      return next();
    } catch (err: any) {
      if (err?.issues && Array.isArray(err.issues) && err.issues.length > 0) {
        const first = err.issues[0];
        return next(new ApiError(first.message || 'Invalid request', 400, 'INVALID_REQUEST'));
      }
      return next(new ApiError('Invalid request', 400, 'INVALID_REQUEST'));
    }
  };
}
