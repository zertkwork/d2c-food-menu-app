// Removed Encore pubsub runtime; provide minimal topic shim for publish() calls

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

type TopicShim<T> = { publish: (event: T) => Promise<void> };

export const orderCreatedTopic: TopicShim<OrderEvent> = { async publish(_e) {} };
export const orderStatusChangedTopic: TopicShim<OrderEvent> = { async publish(_e) {} };
export const kitchenStatusChangedTopic: TopicShim<KitchenStatusEvent> = { async publish(_e) {} };
export const deliveryStatusChangedTopic: TopicShim<DeliveryEvent> = { async publish(_e) {} };
