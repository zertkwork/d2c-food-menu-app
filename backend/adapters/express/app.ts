import express from 'express';
// Import types via type-only import to avoid ESM runtime resolution
import type { CreateOrderRequest } from '../../core/order/create_service.ts';

const app = express();
app.use(express.json());

app.post('/orders', async (req, res) => {
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
    const { createOrderService } = await import('../../core/order/create_service.ts');
    const result = await createOrderService(body, paystackSecret);
    res.json(result);
  } catch (err: any) {
    console.error('Error handling /orders:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

export default app;
