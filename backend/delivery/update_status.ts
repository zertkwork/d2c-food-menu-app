import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { deliveryStatusChangedTopic } from "../events/topics";

export interface UpdateDeliveryStatusRequest {
  orderId: number;
  deliveryStatus: "out_for_delivery" | "delivered";
  estimatedDeliveryMinutes?: number;
}

export interface UpdateDeliveryStatusResponse {
  success: boolean;
}

export const updateStatus = api(
  { expose: true, method: "POST", path: "/delivery/orders/:orderId/status", auth: true },
  async (req: UpdateDeliveryStatusRequest): Promise<UpdateDeliveryStatusResponse> => {
    const authData = getAuthData()!;
    if (authData.role !== "delivery" && authData.role !== "admin") {
      throw new Error("Unauthorized: Delivery or admin access required");
    }
    const now = new Date();
    let assignedToDeliveryAt: Date | null = null;
    let deliveredAt: Date | null = null;
    let orderStatus = req.deliveryStatus;

    if (req.deliveryStatus === "out_for_delivery") {
      assignedToDeliveryAt = now;
    } else if (req.deliveryStatus === "delivered") {
      deliveredAt = now;
      orderStatus = "delivered";
    }

    const orderRow = await db.queryRow<{ 
      tracking_id: string; 
      estimated_delivery_minutes: number;
    }>`
      UPDATE orders
      SET 
        order_status = ${orderStatus},
        assigned_to_delivery_at = COALESCE(assigned_to_delivery_at, ${assignedToDeliveryAt}),
        delivered_at = ${deliveredAt},
        estimated_delivery_minutes = ${req.estimatedDeliveryMinutes || null}
      WHERE id = ${req.orderId}
      RETURNING tracking_id, estimated_delivery_minutes
    `;

    if (!orderRow) {
      throw new Error("Order not found");
    }

    await deliveryStatusChangedTopic.publish({
      orderId: req.orderId,
      trackingId: orderRow.tracking_id,
      deliveryStatus: req.deliveryStatus,
      estimatedDeliveryMinutes: orderRow.estimated_delivery_minutes,
      timestamp: now,
    });

    return { success: true };
  }
);
