import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface AdjustStockRequest {
  menuItemId: number;
  adjustment: number;
  reason?: string;
}

interface AdjustStockResponse {
  success: boolean;
  newStockQuantity: number;
}

export const adjustStock = api<AdjustStockRequest, AdjustStockResponse>(
  { expose: true, method: "POST", path: "/admin/inventory/:menuItemId/adjust", auth: true },
  async (req) => {
    const authData = getAuthData()!;
    if (authData.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const result = await db.queryRow<{ stock_quantity: number }>`
      UPDATE menu_items 
      SET stock_quantity = GREATEST(0, stock_quantity + ${req.adjustment})
      WHERE id = ${req.menuItemId}
      RETURNING stock_quantity
    `;

    if (!result) {
      throw new Error("Menu item not found");
    }

    return {
      success: true,
      newStockQuantity: result.stock_quantity,
    };
  }
);
