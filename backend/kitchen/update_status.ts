import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { kitchenStatusChangedTopic } from "../events/topics";

export interface UpdateKitchenStatusRequest {
  orderId: number;
  kitchenStatus: "pending" | "preparing" | "ready" | "completed";
}

export interface UpdateKitchenStatusResponse {
  success: boolean;
}

export const updateStatus = api(
  { expose: true, method: "POST", path: "/kitchen/orders/:orderId/status", auth: true },
  async (req: UpdateKitchenStatusRequest): Promise<UpdateKitchenStatusResponse> => {
    const authData = getAuthData()!;
    if (authData.role !== "kitchen" && authData.role !== "admin") {
      throw new Error("Unauthorized: Kitchen or admin access required");
    }
    const now = new Date();
    let preparationStartedAt: Date | null = null;
    let preparationCompletedAt: Date | null = null;

    if (req.kitchenStatus === "preparing") {
      preparationStartedAt = now;
    } else if (req.kitchenStatus === "ready") {
      preparationCompletedAt = now;
    }

    const orderRow = await db.queryRow<{ tracking_id: string }>`
      UPDATE orders
      SET 
        kitchen_status = ${req.kitchenStatus},
        preparation_started_at = COALESCE(preparation_started_at, ${preparationStartedAt}),
        preparation_completed_at = COALESCE(preparation_completed_at, ${preparationCompletedAt})
      WHERE id = ${req.orderId}
      RETURNING tracking_id
    `;

    if (!orderRow) {
      throw new Error("Order not found");
    }

    await kitchenStatusChangedTopic.publish({
      orderId: req.orderId,
      trackingId: orderRow.tracking_id,
      kitchenStatus: req.kitchenStatus,
      timestamp: now,
    });

    return { success: true };
  }
);
