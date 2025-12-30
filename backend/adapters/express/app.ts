import express from 'express';
import { createOrderService } from '../../core/order/create_service';

// Types must match backend/order/create.ts shapes
interface OrderItem {
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  total: number;
}

interface CreateOrderRequest {
  customerName: string;
  phone: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  items: OrderItem[];
  total: number;
}

const app = express();
app.use(express.json());

app.post('/orders', async (req, res) => {
  try {
    const body = req.body as CreateOrderRequest;

    const result = await createOrderService(body as any);
    res.json(result);
  } catch (err: any) {
    console.error('Error handling /orders:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

export default app;
