import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface DailySalesData {
  date: string;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface GetSalesTrendsRequest {
  days?: number;
}

interface GetSalesTrendsResponse {
  trends: DailySalesData[];
}

export const getSalesTrends = api<GetSalesTrendsRequest, GetSalesTrendsResponse>(
  { expose: true, method: "GET", path: "/admin/analytics/sales-trends", auth: true },
  async (req) => {
    const authData = getAuthData()!;
    if (authData.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const days = req.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const rows = await db.queryAll<{
      date: Date;
      total_orders: number;
      completed_orders: number;
      total_revenue: number | null;
      avg_order_value: number | null;
    }>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as total_orders,
        COUNT(*) FILTER (WHERE order_status IN ('delivered', 'ready'))::int as completed_orders,
        SUM(total) FILTER (WHERE payment_status = 'success') as total_revenue,
        AVG(total) FILTER (WHERE payment_status = 'success') as avg_order_value
      FROM orders
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const trends = rows.map((row) => ({
      date: row.date.toISOString().split('T')[0],
      totalOrders: row.total_orders,
      completedOrders: row.completed_orders,
      totalRevenue: row.total_revenue || 0,
      averageOrderValue: row.avg_order_value || 0,
    }));

    return { trends };
  }
);
