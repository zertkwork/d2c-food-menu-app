import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
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

const paystackSecretKey = secret("PaystackSecretKey");

export const create = api(
  { method: "POST", path: "/orders", expose: true },
  async (req: CreateOrderRequest): Promise<CreateOrderResponse> => {
    return await createOrderService(req, paystackSecretKey());
  }
);
