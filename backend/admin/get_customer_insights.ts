import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface CustomerInsight {
  phone: string;
  email: string | null;
  name: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate: Date;
  lastOrderDate: Date;
  daysSinceLastOrder: number;
  isRepeatCustomer: boolean;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  totalRevenue: number;
}

interface GetCustomerInsightsResponse {
  topCustomers: CustomerInsight[];
  repeatCustomers: number;
  newCustomers: number;
  totalCustomers: number;
  segments: CustomerSegment[];
}

export const getCustomerInsights = api<void, GetCustomerInsightsResponse>(
  { expose: true, method: "GET", path: "/admin/analytics/customer-insights", auth: true },
  async () => {
    const authData = getAuthData()!;
    if (authData.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const topCustomersRows = await db.queryAll<{
      phone: string;
      email: string | null;
      customer_name: string;
      total_orders: number;
      total_spent: number | null;
      first_order_date: Date;
      last_order_date: Date;
    }>`
      SELECT 
        phone,
        customer_email as email,
        customer_name,
        COUNT(*)::int as total_orders,
        SUM(total) FILTER (WHERE payment_status = 'success') as total_spent,
        MIN(created_at) as first_order_date,
        MAX(created_at) as last_order_date
      FROM orders
      GROUP BY phone, customer_email, customer_name
      HAVING COUNT(*) > 0 AND SUM(total) FILTER (WHERE payment_status = 'success') > 0
      ORDER BY total_spent DESC
      LIMIT 50
    `;

    const now = new Date();
    const topCustomers = topCustomersRows.map((row) => {
      const totalSpent = row.total_spent || 0;
      const daysSinceLastOrder = Math.floor(
        (now.getTime() - row.last_order_date.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        phone: row.phone,
        email: row.email,
        name: row.customer_name,
        totalOrders: row.total_orders,
        totalSpent,
        averageOrderValue: totalSpent / row.total_orders,
        firstOrderDate: row.first_order_date,
        lastOrderDate: row.last_order_date,
        daysSinceLastOrder,
        isRepeatCustomer: row.total_orders > 1,
      };
    });

    const statsRow = await db.queryRow<{
      repeat_customers: number;
      total_customers: number;
    }>`
      SELECT 
        COUNT(*) FILTER (WHERE order_count > 1)::int as repeat_customers,
        COUNT(*)::int as total_customers
      FROM (
        SELECT phone, COUNT(*) as order_count
        FROM orders
        WHERE payment_status = 'success'
        GROUP BY phone
      ) customer_stats
    `;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newCustomersRow = await db.queryRow<{ count: number }>`
      SELECT COUNT(DISTINCT phone)::int as count
      FROM orders
      WHERE created_at >= ${thirtyDaysAgo}
        AND phone NOT IN (
          SELECT DISTINCT phone 
          FROM orders 
          WHERE created_at < ${thirtyDaysAgo}
        )
    `;

    const segmentRows = await db.queryAll<{
      segment: string;
      count: number;
      total_revenue: number | null;
    }>`
      SELECT 
        CASE 
          WHEN total_spent >= 10000 THEN 'VIP'
          WHEN total_spent >= 5000 THEN 'High Value'
          WHEN total_spent >= 2000 THEN 'Regular'
          ELSE 'New'
        END as segment,
        COUNT(*)::int as count,
        SUM(total_spent) as total_revenue
      FROM (
        SELECT 
          phone,
          SUM(total) as total_spent
        FROM orders
        WHERE payment_status = 'success'
        GROUP BY phone
      ) customer_totals
      GROUP BY segment
      ORDER BY 
        CASE segment
          WHEN 'VIP' THEN 1
          WHEN 'High Value' THEN 2
          WHEN 'Regular' THEN 3
          ELSE 4
        END
    `;

    const segments = segmentRows.map((row) => ({
      segment: row.segment,
      count: row.count,
      totalRevenue: row.total_revenue || 0,
    }));

    return {
      topCustomers,
      repeatCustomers: statsRow?.repeat_customers || 0,
      newCustomers: newCustomersRow?.count || 0,
      totalCustomers: statsRow?.total_customers || 0,
      segments,
    };
  }
);
