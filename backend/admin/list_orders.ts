import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface OrderItem {
  menuItemName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface AdminOrder {
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
  items: OrderItem[];
}

export interface ListOrdersResponse {
  orders: AdminOrder[];
}

export const listOrders = api<void, ListOrdersResponse>(
  { expose: true, method: "GET", path: "/admin/orders", auth: true },
  async () => {
    const authData = getAuthData()!;
    if (authData.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    const orders = await db.queryAll<{
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
    }>`
      SELECT id, tracking_id, customer_name, phone, delivery_address,
             delivery_instructions, total, payment_status, order_status, created_at
      FROM orders
      ORDER BY created_at DESC
    `;

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db.queryAll<{
          menu_item_name: string;
          quantity: number;
          price: number;
          total: number;
        }>`
          SELECT menu_item_name, quantity, price, total
          FROM order_items
          WHERE order_id = ${order.id}
        `;

        return {
          id: order.id,
          trackingId: order.tracking_id,
          customerName: order.customer_name,
          phone: order.phone,
          deliveryAddress: order.delivery_address,
          deliveryInstructions: order.delivery_instructions || undefined,
          total: order.total,
          paymentStatus: order.payment_status,
          orderStatus: order.order_status,
          createdAt: order.created_at,
          items: items.map((item) => ({
            menuItemName: item.menu_item_name,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        };
      })
    );

    return { orders: ordersWithItems };
  }
);
