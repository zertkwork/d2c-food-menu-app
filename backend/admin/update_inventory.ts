import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface UpdateInventoryRequest {
  menuItemId: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
}

interface UpdateInventoryResponse {
  success: boolean;
}

export const updateInventory = api<UpdateInventoryRequest, UpdateInventoryResponse>(
  { expose: true, method: "PUT", path: "/admin/inventory/:menuItemId", auth: true },
  async (req) => {
    const authData = getAuthData()!;
    if (authData.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.stockQuantity !== undefined) {
      updates.push(`stock_quantity = $${paramIndex++}`);
      values.push(req.stockQuantity);
    }

    if (req.lowStockThreshold !== undefined) {
      updates.push(`low_stock_threshold = $${paramIndex++}`);
      values.push(req.lowStockThreshold);
    }

    if (req.trackInventory !== undefined) {
      updates.push(`track_inventory = $${paramIndex++}`);
      values.push(req.trackInventory);
    }

    if (updates.length === 0) {
      return { success: true };
    }

    values.push(req.menuItemId);
    const query = `
      UPDATE menu_items 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await db.exec(query as any, ...values);

    return { success: true };
  }
);
