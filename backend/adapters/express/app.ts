import express from 'express';
import { createOrderService, CreateOrderRequest } from '../../core/order/create_service.ts';

const app = express();
app.use(express.json());

app.post('/orders', async (req, res) => {
  try {
    const body: CreateOrderRequest = req.body;

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || '';
    if (!paystackSecret) {
      return res.status(500).json({ error: 'Missing PAYSTACK_SECRET_KEY' });
    }

    const result = await createOrderService(body, paystackSecret);
    res.json(result);
  } catch (err: any) {
    console.error('Error handling /orders:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

export default app;
