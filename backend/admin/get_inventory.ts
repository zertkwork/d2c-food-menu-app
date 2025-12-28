import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface InventoryItem {
  id: number;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  isLowStock: boolean;
}

interface GetInventoryResponse {
  items: InventoryItem[];
  lowStockItems: InventoryItem[];
}

export const getInventory = api<void, GetInventoryResponse>(
  { expose: true, method: "GET", path: "/admin/inventory", auth: true },
  async () => {
    const authData = getAuthData()!;
    if (authData.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const rows = await db.queryAll<{
      id: number;
      name: string;
      stock_quantity: number;
      low_stock_threshold: number;
      track_inventory: boolean;
    }>`
      SELECT id, name, stock_quantity, low_stock_threshold, track_inventory
      FROM menu_items
      WHERE track_inventory = true
      ORDER BY name ASC
    `;

    const items = rows.map((row) => ({
      id: row.id,
      name: row.name,
      stockQuantity: row.stock_quantity,
      lowStockThreshold: row.low_stock_threshold,
      trackInventory: row.track_inventory,
      isLowStock: row.stock_quantity <= row.low_stock_threshold,
    }));

    const lowStockItems = items.filter(item => item.isLowStock);

    return { items, lowStockItems };
  }
);
