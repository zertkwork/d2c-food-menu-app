import { Topic } from "encore.dev/pubsub";

export interface OrderEvent {
  orderId: number;
  trackingId: string;
  status: string;
  kitchenStatus?: string;
  timestamp: Date;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  total: number;
  items: Array<{
    menuItemName: string;
    quantity: number;
    price: number;
  }>;
}

export interface KitchenStatusEvent {
  orderId: number;
  trackingId: string;
  kitchenStatus: string;
  timestamp: Date;
}

export interface DeliveryEvent {
  orderId: number;
  trackingId: string;
  deliveryStatus: string;
  estimatedDeliveryMinutes?: number;
  timestamp: Date;
}

export const orderCreatedTopic = new Topic<OrderEvent>("order-created", {
  deliveryGuarantee: "at-least-once",
});

export const orderStatusChangedTopic = new Topic<OrderEvent>("order-status-changed", {
  deliveryGuarantee: "at-least-once",
});

export const kitchenStatusChangedTopic = new Topic<KitchenStatusEvent>("kitchen-status-changed", {
  deliveryGuarantee: "at-least-once",
});

export const deliveryStatusChangedTopic = new Topic<DeliveryEvent>("delivery-status-changed", {
  deliveryGuarantee: "at-least-once",
});
