import { useState, useEffect } from "react";
import backend from "~backend/client";
import type { Analytics } from "~backend/admin/get_analytics";
import { ShoppingBag, CheckCircle, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatNaira } from "../../lib/currency";

export default function ReportsTab() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

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
    {
      label: "Most Ordered",
      value: analytics.mostOrderedItem,
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      isText: true,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-4 mb-4">
        <h2 className="text-lg font-semibold text-[#2E2E2E] mb-1">Today's Performance</h2>
        <p className="text-sm text-[#6B6B6B]">{new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</p>
      </div>

      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${stat.bgColor} rounded-full flex items-center justify-center`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#6B6B6B] mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold text-[#2E2E2E] ${stat.isText ? "text-lg" : ""}`}>
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
