import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface KitchenOrder {
  id: number;
  trackingId: string;
  customerName: string;
  items: Array<{
    menuItemName: string;
    quantity: number;
  }>;
  kitchenStatus: string;
  orderStatus: string;
  createdAt: Date;
  preparationStartedAt?: Date;
  estimatedDeliveryMinutes: number;
}

export interface ListKitchenOrdersResponse {
  orders: KitchenOrder[];
}

export const listOrders = api(
  { expose: true, method: "GET", path: "/kitchen/orders", auth: true },
  async (): Promise<ListKitchenOrdersResponse> => {
    const authData = getAuthData()!;
    if (authData.role !== "kitchen" && authData.role !== "admin") {
      throw new Error("Unauthorized: Kitchen or admin access required");
    }
    const ordersResult = [];
    for await (const order of db.query<{
      id: number;
      tracking_id: string;
      customer_name: string;
      kitchen_status: string;
      order_status: string;
      created_at: Date;
      preparation_started_at: Date | null;
      estimated_delivery_minutes: number;
    }>`
      SELECT 
        id, 
        tracking_id, 
        customer_name, 
        kitchen_status, 
        order_status, 
        created_at, 
        preparation_started_at,
        estimated_delivery_minutes
      FROM orders
      WHERE payment_status = 'paid'
        AND kitchen_status IN ('pending', 'preparing', 'ready')
      ORDER BY created_at ASC
    `) {
      ordersResult.push(order);
    }

    const kitchenOrders: KitchenOrder[] = [];

    for (const order of ordersResult) {
      const itemsResult = [];
      for await (const item of db.query<{
        menu_item_name: string;
        quantity: number;
      }>`
        SELECT menu_item_name, quantity
        FROM order_items
        WHERE order_id = ${order.id}
      `) {
        itemsResult.push(item);
      }

      kitchenOrders.push({
        id: order.id,
        trackingId: order.tracking_id,
        customerName: order.customer_name,
        items: itemsResult.map(item => ({
          menuItemName: item.menu_item_name,
          quantity: item.quantity,
        })),
        kitchenStatus: order.kitchen_status,
        orderStatus: order.order_status,
        createdAt: order.created_at,
        preparationStartedAt: order.preparation_started_at || undefined,
        estimatedDeliveryMinutes: order.estimated_delivery_minutes,
      });
    }

    return { orders: kitchenOrders };
  }
);
