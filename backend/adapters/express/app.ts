import express from 'express';
// Import types via type-only import to avoid ESM runtime resolution
import type { CreateOrderRequest } from '../../core/order/create_service';
import { validate } from './middlewares/validate.middleware';
import { createOrderSchema } from './validators/createOrder.schema';
import { loginSchema } from './validators/login.schema';
import { authMiddleware } from './middlewares/auth.middleware';

const app: any = express();
app.use(express.json());

// Auth parity: protect previously-authenticated route groups
app.use('/admin', authMiddleware);
app.use('/kitchen', authMiddleware);
app.use('/delivery', authMiddleware);

app.post('/orders', validate(createOrderSchema), async (req: any, res: any, next: any) => {
  try {
    const body: CreateOrderRequest = req.body;

    // TEMP: Adapter stub mode to boot without Encore/db runtime during migration.
    if (process.env.ADAPTER_STUB_DB === 'true') {
      return res.status(503).json({ error: 'Adapter stub mode: core/db not available' });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || '';
    if (!paystackSecret) {
      return res.status(500).json({ error: 'Missing PAYSTACK_SECRET_KEY' });
    }

    // Lazy import to avoid resolving core/db when stub mode is enabled
    const { default: db } = await import('../../infra/db/index');
    const { createOrderService } = await import('../../core/order/create_service');
    const result = await createOrderService(body, paystackSecret, db);
    res.json(result);
  } catch (err: any) {
    return next(err);
  }
});

// Auth endpoints (login/register) are proxied via existing business services behind the adapter.
app.post('/auth/login', validate(loginSchema), async (req: any, res: any, next: any) => {
  try {
    const { login } = await import('../../auth/login');
    const result = await login(req.body);
    res.json(result);
  } catch (err) {
    return next(err);
  }
});

app.post('/auth/register', validate((await import('./validators/register.schema')).registerSchema), async (req: any, res: any, next: any) => {
  try {
    const { register } = await import('../../auth/register');
    const result = await register(req.body);
    res.json(result);
  } catch (err) {
    return next(err);
  }
});

app.get('/menu', async (req: any, res: any, next: any) => {
  try {
    const { listAvailableMenuItems } = await import('../../core/menu/service');
    const items = await listAvailableMenuItems();
    res.json({ items });
  } catch (err: any) {
    return next(err);
  }
});


app.get('/auth/me', authMiddleware, async (req: any, res: any, next: any) => {
  try {
    const { authService, AuthServiceError } = await import('../../core/auth/auth_service');
    const authorization = req.headers['authorization'] as string | undefined;
    const cookieHeader = req.headers['cookie'] as string | undefined;
    let session: string | undefined = undefined;
    if (cookieHeader) {
      const parts = cookieHeader.split(';').map(p => p.trim());
      for (const part of parts) {
        if (part.startsWith('session=')) {
          session = part.substring('session='.length);
          break;
        }
      }
    }
    const data = await authService({ authorization, session });
    res.json({ id: data.userID, username: data.username, role: data.role });
  } catch (err: any) {
    if (err?.name === 'AuthServiceError') {
      // Preserve existing 401 handling for auth errors; let middleware standardize payload
      (err as any).status = 401;
    }
    return next(err);
  }
});

// Global error middleware must be registered last
import { errorMiddleware } from './middlewares/error.middleware';
app.use(errorMiddleware);

export default app;
