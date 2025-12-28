import { Subscription } from "encore.dev/pubsub";
import { orderCreatedTopic, kitchenStatusChangedTopic } from "../events/topics";
import db from "../db";

new Subscription(orderCreatedTopic, "route-to-kitchen", {
  handler: async (event) => {
    const orderItems = await db.queryAll<{
      menu_item_id: number;
      quantity: number;
    }>`
      SELECT menu_item_id, quantity
      FROM order_items
      WHERE order_id = ${event.orderId}
    `;

    for (const item of orderItems) {
      await db.exec`
        UPDATE menu_items
        SET stock_quantity = GREATEST(0, stock_quantity - ${item.quantity})
        WHERE id = ${item.menu_item_id} AND track_inventory = true
      `;
    }

    await db.exec`
      UPDATE orders
      SET kitchen_status = 'pending', order_status = 'preparing'
      WHERE id = ${event.orderId}
    `;
    
    console.log(`Order ${event.trackingId} routed to kitchen and inventory updated`);
  },
});

new Subscription(kitchenStatusChangedTopic, "handle-kitchen-ready", {
  handler: async (event) => {
    if (event.kitchenStatus === "ready") {
      await db.exec`
        UPDATE orders
        SET order_status = 'preparing'
        WHERE id = ${event.orderId}
      `;
      
      console.log(`Order ${event.trackingId} ready for delivery`);
    }
  },
});
