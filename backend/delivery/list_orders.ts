import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface DeliveryOrder {
  id: number;
  trackingId: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  total: number;
  orderStatus: string;
  kitchenStatus: string;
  createdAt: Date;
  preparationCompletedAt?: Date;
  assignedToDeliveryAt?: Date;
  estimatedDeliveryMinutes: number;
}

export interface ListDeliveryOrdersResponse {
  orders: DeliveryOrder[];
}

export const listOrders = api(
  { expose: true, method: "GET", path: "/delivery/orders", auth: true },
  async (): Promise<ListDeliveryOrdersResponse> => {
    const authData = getAuthData()!;
    if (authData.role !== "delivery" && authData.role !== "admin") {
      throw new Error("Unauthorized: Delivery or admin access required");
    }
    const ordersResult = [];
    for await (const order of db.query<{
      id: number;
      tracking_id: string;
      customer_name: string;
      phone: string;
      delivery_address: string;
      delivery_instructions: string | null;
      total: number;
      order_status: string;
      kitchen_status: string;
      created_at: Date;
      preparation_completed_at: Date | null;
      assigned_to_delivery_at: Date | null;
      estimated_delivery_minutes: number;
    }>`
      SELECT 
        id, 
        tracking_id, 
        customer_name,
        phone,
        delivery_address,
        delivery_instructions,
        total,
        order_status, 
        kitchen_status, 
        created_at, 
        preparation_completed_at,
        assigned_to_delivery_at,
        estimated_delivery_minutes
      FROM orders
      WHERE payment_status = 'paid'
        AND kitchen_status = 'ready'
        AND order_status IN ('preparing', 'out_for_delivery')
      ORDER BY preparation_completed_at ASC
    `) {
      ordersResult.push(order);
    }

    return {
      orders: ordersResult.map(order => ({
        id: order.id,
        trackingId: order.tracking_id,
        customerName: order.customer_name,
        phone: order.phone,
        deliveryAddress: order.delivery_address,
        deliveryInstructions: order.delivery_instructions || undefined,
        total: order.total,
        orderStatus: order.order_status,
        kitchenStatus: order.kitchen_status,
        createdAt: order.created_at,
        preparationCompletedAt: order.preparation_completed_at || undefined,
        assignedToDeliveryAt: order.assigned_to_delivery_at || undefined,
        estimatedDeliveryMinutes: order.estimated_delivery_minutes,
      })),
    };
  }
);
