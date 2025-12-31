import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../types/api-error';

function getTokenFromHeadersOrCookie(req: Request): string | null {
  const auth = req.headers['authorization'];
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  const cookieHeader = req.headers['cookie'];
  if (typeof cookieHeader === 'string') {
    const parts = cookieHeader.split(';').map(p => p.trim());
    for (const part of parts) {
      if (part.startsWith('session=')) return decodeURIComponent(part.substring('session='.length));
      if (part.startsWith('token=')) return decodeURIComponent(part.substring('token='.length));
    }
  }
  return null;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = getTokenFromHeadersOrCookie(req);
    if (!token) {
      return next(new ApiError('Unauthorized', 401, 'UNAUTHORIZED'));
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new ApiError('Unauthorized', 401, 'UNAUTHORIZED'));
    }
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    return next();
  } catch {
    return next(new ApiError('Unauthorized', 401, 'UNAUTHORIZED'));
  }
}
