import { api, StreamOut } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { Subscription } from "encore.dev/pubsub";
import { orderCreatedTopic, kitchenStatusChangedTopic } from "../events/topics";
import db from "../db";

interface KitchenOrderUpdate {
  type: "new_order" | "status_change";
  orderId: number;
  trackingId: string;
  customerName: string;
  items?: Array<{
    menuItemName: string;
    quantity: number;
  }>;
  kitchenStatus: string;
  orderStatus: string;
  createdAt: Date;
  estimatedDeliveryMinutes: number;
}

const connectedStreams: Set<StreamOut<KitchenOrderUpdate>> = new Set();

new Subscription(orderCreatedTopic, "notify-kitchen-new-order", {
  handler: async (event) => {
    const itemsResult = [];
    for await (const item of db.query<{
      menu_item_name: string;
      quantity: number;
    }>`
      SELECT menu_item_name, quantity
      FROM order_items
      WHERE order_id = ${event.orderId}
    `) {
      itemsResult.push(item);
    }

    const update: KitchenOrderUpdate = {
      type: "new_order",
      orderId: event.orderId,
      trackingId: event.trackingId,
      customerName: event.customerName,
      items: itemsResult.map(item => ({
        menuItemName: item.menu_item_name,
        quantity: item.quantity,
      })),
      kitchenStatus: "pending",
      orderStatus: event.status,
      createdAt: event.timestamp,
      estimatedDeliveryMinutes: 45,
    };

    for (const stream of connectedStreams) {
      try {
        await stream.send(update);
      } catch (err) {
        connectedStreams.delete(stream);
      }
    }
  },
});

new Subscription(kitchenStatusChangedTopic, "notify-kitchen-status-change", {
  handler: async (event) => {
    const orderRow = await db.queryRow<{
      customer_name: string;
      order_status: string;
      created_at: Date;
      estimated_delivery_minutes: number;
    }>`
      SELECT customer_name, order_status, created_at, estimated_delivery_minutes
      FROM orders
      WHERE id = ${event.orderId}
    `;

    if (!orderRow) return;

    const update: KitchenOrderUpdate = {
      type: "status_change",
      orderId: event.orderId,
      trackingId: event.trackingId,
      customerName: orderRow.customer_name,
      kitchenStatus: event.kitchenStatus,
      orderStatus: orderRow.order_status,
      createdAt: orderRow.created_at,
      estimatedDeliveryMinutes: orderRow.estimated_delivery_minutes,
    };

    for (const stream of connectedStreams) {
      try {
        await stream.send(update);
      } catch (err) {
        connectedStreams.delete(stream);
      }
    }
  },
});

export const streamOrders = api.streamOut<KitchenOrderUpdate>(
  { expose: true, path: "/kitchen/stream", auth: true },
  async (stream) => {
    const authData = getAuthData()!;
    if (authData.role !== "kitchen" && authData.role !== "admin") {
      throw new Error("Unauthorized: Kitchen or admin access required");
    }
    connectedStreams.add(stream);

    const existingOrdersResult = [];
    for await (const order of db.query<{
      id: number;
      tracking_id: string;
      customer_name: string;
      kitchen_status: string;
      order_status: string;
      created_at: Date;
      estimated_delivery_minutes: number;
    }>`
      SELECT 
        id, 
        tracking_id, 
        customer_name, 
        kitchen_status, 
        order_status, 
        created_at,
        estimated_delivery_minutes
      FROM orders
      WHERE payment_status = 'paid'
        AND kitchen_status IN ('pending', 'preparing', 'ready')
      ORDER BY created_at ASC
    `) {
      existingOrdersResult.push(order);
    }

    for (const order of existingOrdersResult) {
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

      await stream.send({
        type: "new_order",
        orderId: order.id,
        trackingId: order.tracking_id,
        customerName: order.customer_name,
        items: itemsResult.map(item => ({
          menuItemName: item.menu_item_name,
          quantity: item.quantity,
        })),
        kitchenStatus: order.kitchen_status,
        orderStatus: order.order_status,
        createdAt: order.created_at,
        estimatedDeliveryMinutes: order.estimated_delivery_minutes,
      });
    }

    try {
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!connectedStreams.has(stream)) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 1000);
      });
    } finally {
      connectedStreams.delete(stream);
    }
  }
);
