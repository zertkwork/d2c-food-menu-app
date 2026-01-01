import express from 'express';
// Import types via type-only import to avoid ESM runtime resolution
import type { CreateOrderRequest } from '../../core/order/create_service.ts';

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

    // Secrets are enforced at the adapter boundary
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      throw new Error('Missing PAYSTACK_SECRET_KEY');
    }

    // If we're running in adapter-stub mode, avoid importing DB and return a lightweight stub
    if (process.env.ADAPTER_STUB_DB === 'true') {
      return res.status(200).json({
        orderId: 0,
        trackingId: 'stub',
        paystackAuthUrl: 'http://localhost/stub-pay',
        paystackReference: `stub_ref_${Date.now()}`,
      });
    }

    // Lazy import core service and DB adapter to avoid creating a DB connection at module import time
    const { createOrderService } = await import('../../core/order/create_service.ts');
    const db = (await import('../../db/index.ts')).default;

    // Pass adapter-level runtime values (frontend URL and payment mode) into core
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:8080';
    const paymentMode = process.env.PAYMENT_MODE;

    const result = await createOrderService(body, paystackSecret, db, frontendUrl, paymentMode);
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

app.post(
  '/auth/register',
  validate((await import('./validators/register.schema')).registerSchema),
  async (req: any, res: any, next: any) => {
    try {
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