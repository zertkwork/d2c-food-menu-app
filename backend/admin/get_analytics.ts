import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface Analytics {
  totalOrdersToday: number;
  completedOrdersToday: number;
  totalSalesToday: number;
  averageOrderValue: number;
  mostOrderedItem: string;
}

export const getAnalytics = api<void, Analytics>(
  { expose: true, method: "GET", path: "/admin/analytics", auth: true },
  async () => {
    const authData = getAuthData()!;
    if (authData.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const totalOrdersResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*)::int as count
      FROM orders
      WHERE created_at >= ${todayStart}
    `;

    const completedOrdersResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*)::int as count
      FROM orders
      WHERE created_at >= ${todayStart}
        AND order_status IN ('delivered', 'ready')
    `;

    const totalSalesResult = await db.queryRow<{ total: number | null }>`
      SELECT SUM(total) as total
      FROM orders
      WHERE created_at >= ${todayStart}
        AND payment_status = 'success'
    `;

    const avgOrderResult = await db.queryRow<{ avg: number | null }>`
      SELECT AVG(total) as avg
      FROM orders
      WHERE created_at >= ${todayStart}
        AND payment_status = 'success'
    `;

    const mostOrderedResult = await db.queryRow<{ menu_item_name: string | null }>`
      SELECT oi.menu_item_name
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= ${todayStart}
      GROUP BY oi.menu_item_name
      ORDER BY SUM(oi.quantity) DESC
      LIMIT 1
    `;

    return {
      totalOrdersToday: totalOrdersResult?.count || 0,
      completedOrdersToday: completedOrdersResult?.count || 0,
      totalSalesToday: totalSalesResult?.total || 0,
      averageOrderValue: avgOrderResult?.avg || 0,
      mostOrderedItem: mostOrderedResult?.menu_item_name || "N/A",
    };
  }
);
