import { api, StreamOut } from "encore.dev/api";
import { Subscription } from "encore.dev/pubsub";
import { orderStatusChangedTopic, kitchenStatusChangedTopic, deliveryStatusChangedTopic } from "../events/topics";

interface OrderStatusUpdate {
  trackingId: string;
  orderStatus: string;
  kitchenStatus?: string;
  estimatedDeliveryMinutes?: number;
  timestamp: Date;
}

interface StreamStatusRequest {
  trackingId: string;
}

const streamsByTrackingId: Map<string, Set<StreamOut<OrderStatusUpdate>>> = new Map();

new Subscription(orderStatusChangedTopic, "notify-customer-status", {
  handler: async (event) => {
    const streams = streamsByTrackingId.get(event.trackingId);
    if (!streams) return;

    const update: OrderStatusUpdate = {
      trackingId: event.trackingId,
      orderStatus: event.status,
      timestamp: event.timestamp,
    };

    for (const stream of streams) {
      try {
        await stream.send(update);
      } catch (err) {
        streams.delete(stream);
      }
    }
  },
});

new Subscription(kitchenStatusChangedTopic, "notify-customer-kitchen", {
  handler: async (event) => {
    const streams = streamsByTrackingId.get(event.trackingId);
    if (!streams) return;

    const update: OrderStatusUpdate = {
      trackingId: event.trackingId,
      orderStatus: "preparing",
      kitchenStatus: event.kitchenStatus,
      timestamp: event.timestamp,
    };

    for (const stream of streams) {
      try {
        await stream.send(update);
      } catch (err) {
        streams.delete(stream);
      }
    }
  },
});

new Subscription(deliveryStatusChangedTopic, "notify-customer-delivery", {
  handler: async (event) => {
    const streams = streamsByTrackingId.get(event.trackingId);
    if (!streams) return;

    const update: OrderStatusUpdate = {
      trackingId: event.trackingId,
      orderStatus: event.deliveryStatus,
      estimatedDeliveryMinutes: event.estimatedDeliveryMinutes,
      timestamp: event.timestamp,
    };

    for (const stream of streams) {
      try {
        await stream.send(update);
      } catch (err) {
        streams.delete(stream);
      }
    }
  },
});

export const streamStatus = api.streamOut<StreamStatusRequest, OrderStatusUpdate>(
  { expose: true, path: "/orders/:trackingId/stream" },
  async (handshake, stream) => {
    const trackingId = handshake.trackingId;
    
    if (!streamsByTrackingId.has(trackingId)) {
      streamsByTrackingId.set(trackingId, new Set());
    }
    
    const streams = streamsByTrackingId.get(trackingId)!;
    streams.add(stream);

    try {
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!streams.has(stream)) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 1000);
      });
    } finally {
      streams.delete(stream);
      if (streams.size === 0) {
        streamsByTrackingId.delete(trackingId);
      }
    }
  }
);
