import { useState, useEffect } from "react";
import backend from "~backend/client";
import type { Analytics } from "~backend/admin/get_analytics";
import type { DailySalesData } from "~backend/admin/get_sales_trends";
import type { HourlyOrderData } from "~backend/admin/get_peak_hours";
import type { PopularItemData } from "~backend/admin/get_popular_items";
import { ShoppingBag, CheckCircle, TrendingUp, Award, Clock, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatNaira } from "../../lib/currency";

export default function ReportsTab() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [salesTrends, setSalesTrends] = useState<DailySalesData[]>([]);
  const [peakHours, setPeakHours] = useState<HourlyOrderData[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(7);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      const data = await backend.admin.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics",
        variant: "destructive",
      });
    }
  };

  const fetchTrends = async () => {
    try {
      const data = await backend.admin.getSalesTrends({ days: trendDays });
      setSalesTrends(data.trends);
    } catch (error) {
      console.error("Failed to fetch sales trends:", error);
    }
  };

  const fetchPeakHours = async () => {
    try {
      const data = await backend.admin.getPeakHours({ days: 30 });
      setPeakHours(data.hourlyData);
    } catch (error) {
      console.error("Failed to fetch peak hours:", error);
    }
  };

  const fetchPopularItems = async () => {
    try {
      const data = await backend.admin.getPopularItems({ days: 30, topN: 10 });
      setPopularItems(data.overall);
    } catch (error) {
      console.error("Failed to fetch popular items:", error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAnalytics(),
      fetchTrends(),
      fetchPeakHours(),
      fetchPopularItems(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchTrends();
  }, [trendDays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#6B6B6B]">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#6B6B6B]">No analytics data available</div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Orders",
      value: analytics.totalOrdersToday,
      icon: ShoppingBag,
      color: "text-[#D4A574]",
      bgColor: "bg-[#D4A574] bg-opacity-10",
    },
    {
      label: "Completed Orders",
      value: analytics.completedOrdersToday,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Total Sales",
      value: formatNaira(analytics.totalSalesToday),
      icon: TrendingUp,
      color: "text-[#D4A574]",
      bgColor: "bg-[#D4A574] bg-opacity-10",
    },
    {
      label: "Avg Order Value",
      value: formatNaira(analytics.averageOrderValue),
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  const maxRevenue = Math.max(...salesTrends.map(d => d.totalRevenue), 1);
  const maxOrders = Math.max(...peakHours.map(d => d.orderCount), 1);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4">
        <h2 className="text-lg font-semibold text-[#2E2E2E] mb-1">Today's Performance</h2>
        <p className="text-sm text-[#6B6B6B]">{new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#6B6B6B] mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[#2E2E2E]">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#2E2E2E] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#D4A574]" />
            Sales Trends
          </h3>
          <select
            value={trendDays}
            onChange={(e) => setTrendDays(Number(e.target.value))}
            className="px-3 py-1 border border-[#E5E5E5] rounded-lg text-sm"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
        </div>
        <div className="space-y-2">
          {salesTrends.length === 0 ? (
            <p className="text-sm text-[#6B6B6B] text-center py-4">No sales data available</p>
          ) : (
            salesTrends.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-xs text-[#6B6B6B] w-20">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 bg-[#F5F5F5] rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#D4A574] to-[#C9945D] h-full rounded-full flex items-center px-3 transition-all"
                    style={{ width: `${(day.totalRevenue / maxRevenue) * 100}%` }}
                  >
                    {day.totalRevenue > 0 && (
                      <span className="text-xs font-medium text-white">{formatNaira(day.totalRevenue)}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-[#6B6B6B] w-16 text-right">{day.totalOrders} orders</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-[#2E2E2E] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#D4A574]" />
          Peak Hours (Last 30 Days)
        </h3>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {Array.from({ length: 24 }, (_, i) => {
            const hourData = peakHours.find(h => h.hour === i);
            const orderCount = hourData?.orderCount || 0;
            const intensity = orderCount > 0 ? (orderCount / maxOrders) : 0;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full aspect-square relative group">
                  <div
                    className="w-full h-full rounded transition-all"
                    style={{
                      backgroundColor: `rgba(212, 165, 116, ${intensity * 0.8 + 0.1})`,
                    }}
                  />
                  {orderCount > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 rounded text-white text-xs font-medium">
                      {orderCount}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#6B6B6B]">{i}:00</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-[#2E2E2E] mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#D4A574]" />
          Top 10 Popular Items (Last 30 Days)
        </h3>
        <div className="space-y-3">
          {popularItems.length === 0 ? (
            <p className="text-sm text-[#6B6B6B] text-center py-4">No sales data available</p>
          ) : (
            popularItems.map((item, idx) => (
              <div key={item.menuItemId} className="flex items-center gap-3 p-3 bg-[#FFF9F4] rounded-lg">
                <div className="w-8 h-8 bg-[#D4A574] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#2E2E2E]">{item.menuItemName}</p>
                  <p className="text-xs text-[#6B6B6B]">
                    {item.quantitySold} sold • {item.orderCount} orders
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#D4A574]">{formatNaira(item.revenue)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
            <Award className="w-7 h-7 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#6B6B6B] mb-1">Most Ordered Item Today</p>
            <p className="text-lg font-bold text-[#2E2E2E]">{analytics.mostOrderedItem}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
