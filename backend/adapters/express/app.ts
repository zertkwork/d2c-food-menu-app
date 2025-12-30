import express from 'express';
// Import types via type-only import to avoid ESM runtime resolution
import type { CreateOrderRequest } from '../../core/order/create_service';

import { validate } from './middlewares/validate.middleware';
import { createOrderSchema } from './validators/createOrder.schema';
import { loginSchema } from './validators/login.schema';
import { authMiddleware } from './middlewares/auth.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

const app: any = express();
app.use(express.json());

// Auth parity: protect previously-authenticated route groups
app.use('/admin', authMiddleware);
app.use('/kitchen', authMiddleware);
app.use('/delivery', authMiddleware);

// Orders
app.post('/orders', validate(createOrderSchema), async (req: any, res: any, next: any) => {
  try {
    const body: CreateOrderRequest = req.body;

    // Lazy import to avoid resolving core/db at import time
    const { createOrderService } = await import('../../core/order/create_service');
    // Secrets are enforced via env at boundary
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      throw new Error('Missing PAYSTACK_SECRET_KEY');
    }
    const result = await createOrderService(body, paystackSecret);
    res.json(result);
  } catch (err) {
    return next(err);
  }
});

// Auth endpoints
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

// Authenticated me endpoint
app.get('/auth/me', authMiddleware, async (req: any, res: any, next: any) => {
  try {
    const { me } = await import('../../auth/me');
    const result = await me();
    res.json(result);
  } catch (err: any) {
    if ((err as any)?.name === 'AuthServiceError') {
      (err as any).status = 401;
    }
    return next(err);
  }
});

// Public menu
app.get('/menu', async (req: any, res: any, next: any) => {
  try {
    const { list } = await import('../../menu/list');
    const result = await list();
    res.json(result);
  } catch (err) {
    return next(err);
  }
});

// Global error middleware must be registered last
app.use(errorMiddleware);

export default app;
