import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface UpdateOrderStatusRequest {
  orderId: number;
  status: string;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
}

export const updateOrderStatus = api(
  { expose: true, method: "POST", path: "/admin/orders/:orderId/status", auth: true },
  async (req: UpdateOrderStatusRequest): Promise<UpdateOrderStatusResponse> => {
    const authData = getAuthData()!;
    if (authData.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    await db.exec`
      UPDATE orders
      SET order_status = ${req.status}
      WHERE id = ${req.orderId}
    `;

    return { success: true };
  }
);
