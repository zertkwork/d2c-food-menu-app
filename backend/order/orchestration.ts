import { Subscription } from "encore.dev/pubsub";
import { orderCreatedTopic, kitchenStatusChangedTopic } from "../events/topics";
import db from "../db";

new Subscription(orderCreatedTopic, "route-to-kitchen", {
  handler: async (event) => {
    await db.exec`
      UPDATE orders
      SET kitchen_status = 'pending', order_status = 'preparing'
      WHERE id = ${event.orderId}
    `;
    
    console.log(`Order ${event.trackingId} routed to kitchen`);
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
