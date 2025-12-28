import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface HourlyOrderData {
  hour: number;
  orderCount: number;
  totalRevenue: number;
}

interface GetPeakHoursRequest {
  days?: number;
}

interface GetPeakHoursResponse {
  hourlyData: HourlyOrderData[];
}

export const getPeakHours = api<GetPeakHoursRequest, GetPeakHoursResponse>(
  { expose: true, method: "GET", path: "/admin/analytics/peak-hours", auth: true },
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
      hour: number;
      order_count: number;
      total_revenue: number | null;
    }>`
      SELECT 
        EXTRACT(HOUR FROM created_at)::int as hour,
        COUNT(*)::int as order_count,
        SUM(total) FILTER (WHERE payment_status = 'success') as total_revenue
      FROM orders
      WHERE created_at >= ${startDate}
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `;

    const hourlyData = rows.map((row) => ({
      hour: row.hour,
      orderCount: row.order_count,
      totalRevenue: row.total_revenue || 0,
    }));

    return { hourlyData };
  }
);
