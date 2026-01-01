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
import { env } from "../adapters/express/config/env";

export async function create(req: CreateOrderRequest): Promise<CreateOrderResponse> {
  const paystackSecret = env.PAYSTACK_SECRET_KEY;
  const frontendUrl = env.FRONTEND_URL;
  const paymentMode = env.PAYMENT_MODE;

  return await createOrderService(req, paystackSecret, frontendUrl, paymentMode, db);
}

