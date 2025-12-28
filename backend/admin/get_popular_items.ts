import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface PopularItemData {
  menuItemId: number;
  menuItemName: string;
  quantitySold: number;
  revenue: number;
  orderCount: number;
}

export interface DailyPopularityData {
  date: string;
  items: PopularItemData[];
}

interface GetPopularItemsRequest {
  days?: number;
  topN?: number;
}

interface GetPopularItemsResponse {
  overall: PopularItemData[];
  daily: DailyPopularityData[];
}

export const getPopularItems = api<GetPopularItemsRequest, GetPopularItemsResponse>(
  { expose: true, method: "GET", path: "/admin/analytics/popular-items", auth: true },
  async (req) => {
    const authData = getAuthData()!;
    if (authData.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const days = req.days || 30;
    const topN = req.topN || 10;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const overallRows = await db.queryAll<{
      menu_item_id: number;
      menu_item_name: string;
      quantity_sold: number;
      revenue: number | null;
      order_count: number;
    }>`
      SELECT 
        oi.menu_item_id,
        oi.menu_item_name,
        SUM(oi.quantity)::int as quantity_sold,
        SUM(oi.total) as revenue,
        COUNT(DISTINCT oi.order_id)::int as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= ${startDate}
        AND o.payment_status = 'success'
      GROUP BY oi.menu_item_id, oi.menu_item_name
      ORDER BY quantity_sold DESC
      LIMIT ${topN}
    `;

    const overall = overallRows.map((row) => ({
      menuItemId: row.menu_item_id,
      menuItemName: row.menu_item_name,
      quantitySold: row.quantity_sold,
      revenue: row.revenue || 0,
      orderCount: row.order_count,
    }));

    const dailyRows = await db.queryAll<{
      date: Date;
      menu_item_id: number;
      menu_item_name: string;
      quantity_sold: number;
      revenue: number | null;
      order_count: number;
    }>`
      SELECT 
        DATE(o.created_at) as date,
        oi.menu_item_id,
        oi.menu_item_name,
        SUM(oi.quantity)::int as quantity_sold,
        SUM(oi.total) as revenue,
        COUNT(DISTINCT oi.order_id)::int as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= ${startDate}
        AND o.payment_status = 'success'
      GROUP BY DATE(o.created_at), oi.menu_item_id, oi.menu_item_name
      ORDER BY date ASC, quantity_sold DESC
    `;

    const dailyMap = new Map<string, PopularItemData[]>();
    dailyRows.forEach((row) => {
      const dateKey = row.date.toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, []);
      }
      dailyMap.get(dateKey)!.push({
        menuItemId: row.menu_item_id,
        menuItemName: row.menu_item_name,
        quantitySold: row.quantity_sold,
        revenue: row.revenue || 0,
        orderCount: row.order_count,
      });
    });

    const daily: DailyPopularityData[] = Array.from(dailyMap.entries()).map(([date, items]) => ({
      date,
      items: items.slice(0, 5),
    }));

    return { overall, daily };
  }
);
