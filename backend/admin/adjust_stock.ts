// Encore runtime removed
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

export async function adjustStock(req: AdjustStockRequest): Promise<AdjustStockResponse> {
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

