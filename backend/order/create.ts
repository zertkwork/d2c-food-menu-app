// Encore runtime removed
import { createOrderService } from "../core/order/create_service";

export interface OrderItem {
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface CreateOrderRequest {
  customerName: string;
  phone: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  items: OrderItem[];
  total: number;
}

export interface CreateOrderResponse {
  orderId: number;
  trackingId: string;
  paystackAuthUrl: string;
  paystackReference: string;
}

// Secrets via env only; Encore config removed

import db from "../db";

export async function create(req: CreateOrderRequest): Promise<CreateOrderResponse> {
  const paystackSecret = (() => { const v = process.env.PAYSTACK_SECRET_KEY; if (!v) throw new Error("Missing PAYSTACK_SECRET_KEY"); return v; })();
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:8080';
  const paymentMode = process.env.PAYMENT_MODE;
  return await createOrderService(req, paystackSecret, db, frontendUrl, paymentMode);
}

