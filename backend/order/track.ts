import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface OrderItem {
  menuItemName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: number;
  trackingId: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: Date;
  estimatedDeliveryMinutes: number;
  items: OrderItem[];
}

export const track = api(
  { method: "GET", path: "/orders/:trackingId", expose: true, auth: false },
  async ({ trackingId }: { trackingId: string }): Promise<Order> => {
    const orderRow = await db.queryRow<{
      id: number;
      tracking_id: string;
      customer_name: string;
      phone: string;
      delivery_address: string;
      delivery_instructions: string | null;
      total: number;
      payment_status: string;
      order_status: string;
      created_at: Date;
      estimated_delivery_minutes: number;
    }>`
      SELECT * FROM orders WHERE tracking_id = ${trackingId}
    `;

    if (!orderRow) {
      throw APIError.notFound("Order not found");
    }

    const items = await db.queryAll<{
      menu_item_name: string;
      quantity: number;
      price: number;
      total: number;
    }>`
      SELECT menu_item_name, quantity, price, total
      FROM order_items
      WHERE order_id = ${orderRow.id}
    `;

    return {
      id: orderRow.id,
      trackingId: orderRow.tracking_id,
      customerName: orderRow.customer_name,
      phone: orderRow.phone,
      deliveryAddress: orderRow.delivery_address,
      deliveryInstructions: orderRow.delivery_instructions || undefined,
      total: orderRow.total,
      paymentStatus: orderRow.payment_status,
      orderStatus: orderRow.order_status,
      createdAt: orderRow.created_at,
      estimatedDeliveryMinutes: orderRow.estimated_delivery_minutes,
      items: items.map((item) => ({
        menuItemName: item.menu_item_name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
    };
  }
);
