import express from 'express';
// Import types via type-only import to avoid ESM runtime resolution
import type { CreateOrderRequest } from '../../core/order/create_service.ts';
import { registerSchema } from './validators/register.schema';
import { env } from './config/env';

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

    // Use adapter env loader when available; fall back to process.env for safety
    const adapterStub = (typeof env !== 'undefined' && env.ADAPTER_STUB_DB) || process.env.ADAPTER_STUB_DB === 'true';
    if (adapterStub) {
      return res.json({
        orderId: 1,
        trackingId: 'ORD-STUB',
        paystackAuthUrl: 'http://localhost/stub-pay',
        paystackReference: `stub_ref_${Date.now()}`,
      });
    }

    const paystackSecret = (typeof env !== 'undefined' && env.PAYSTACK_SECRET_KEY) || process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) throw new Error('Missing PAYSTACK_SECRET_KEY');

    const frontendUrl = (typeof env !== 'undefined' && env.FRONTEND_URL) || process.env.FRONTEND_URL || 'http://localhost:8080';
    const paymentMode = (typeof env !== 'undefined' && env.PAYMENT_MODE) || process.env.PAYMENT_MODE;

    // Lazy import core service and DB adapter to avoid creating DB connections at module import time
    const { createOrderService } = await import('../../core/order/create_service.ts');
    const db = (await import('../../db/index.ts')).default;

    const result = await createOrderService(body, paystackSecret, db, frontendUrl, paymentMode);
    res.json(result);
  } catch (err) {
    return next(err);
  }
});

// Auth endpoints
app.post('/auth/login', validate(loginSchema), async (req: any, res: any, next: any) => {
  try {
    // Adapter stub mode: return a fake successful login
  if (env.ADAPTER_STUB_DB || process.env.ADAPTER_STUB_DB === 'true') {
      return res.json({ session: { name: 'session', value: 'stub' }, user: { id: 1, username: req.body.username || 'stub', role: 'admin' } });
    }

    const { login } = await import('../../auth/login');
    const result = await login(req.body);
    res.json(result);
  } catch (err) {
    return next(err);
  }
});

app.post(
  '/auth/register',
  validate(registerSchema),
  async (req: any, res: any, next: any) => {
    try {
  if (env.ADAPTER_STUB_DB || process.env.ADAPTER_STUB_DB === 'true') {
        return res.status(201).json({ id: 1, username: req.body.username || 'stub', role: req.body.role || 'admin' });
      }

      const { register } = await import('../../auth/register');
      const result = await register(req.body);
      res.json(result);
    } catch (err) {
      return next(err);
    }
  }
);

// Authenticated me endpoint
app.get('/auth/me', authMiddleware, async (req: any, res: any, next: any) => {
  try {
    if (env.ADAPTER_STUB_DB || process.env.ADAPTER_STUB_DB === 'true') {
      return res.json({ id: '1', username: 'stub', role: 'admin' });
    }

    const { me } = await import('../../auth/me');
    const result = await me();
    res.json(result);
  } catch (err: any) {
    if (err?.name === 'AuthServiceError') {
      err.status = 401;
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