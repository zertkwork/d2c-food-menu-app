import { api } from "encore.dev/api";
import db from "../db";

export interface OrderHistoryItem {
  orderId: number;
  trackingId: string;
  customerName: string;
  deliveryAddress: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: Date;
  items: OrderItemHistory[];
}

export interface OrderItemHistory {
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface GetOrderHistoryRequest {
  phone: string;
}

export interface GetOrderHistoryResponse {
  orders: OrderHistoryItem[];
  totalOrders: number;
  totalSpent: number;
}

export const getOrderHistory = api(
  { method: "GET", path: "/customer/order-history/:phone", expose: true },
  async ({ phone }: GetOrderHistoryRequest): Promise<GetOrderHistoryResponse> => {
    const orders = await db.queryAll<{
      id: number;
      tracking_id: string;
      customer_name: string;
      delivery_address: string;
      total: number;
      order_status: string;
      payment_status: string;
      created_at: Date;
    }>`
      SELECT 
        id,
        tracking_id,
        customer_name,
        delivery_address,
        total,
        order_status,
        payment_status,
        created_at
      FROM orders
      WHERE phone = ${phone}
      AND payment_status = 'completed'
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const orderHistory: OrderHistoryItem[] = [];
    let totalSpent = 0;

    for (const order of orders) {
      const items = await db.queryAll<{
        menu_item_id: number;
        menu_item_name: string;
        quantity: number;
        price: number;
        total: number;
      }>`
        SELECT 
          menu_item_id,
          menu_item_name,
          quantity,
          price,
          total
        FROM order_items
        WHERE order_id = ${order.id}
      `;

      orderHistory.push({
        orderId: order.id,
        trackingId: order.tracking_id,
        customerName: order.customer_name,
        deliveryAddress: order.delivery_address,
        total: order.total,
        orderStatus: order.order_status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        items: items.map((item: { menu_item_id: number; menu_item_name: string; quantity: number; price: number; total: number }) => ({
          menuItemId: item.menu_item_id,
          menuItemName: item.menu_item_name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
      });

      totalSpent += order.total;
    }

    return {
      orders: orderHistory,
      totalOrders: orders.length,
      totalSpent,
    };
  }
);
