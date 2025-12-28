import { useState, useEffect } from "react";
import backend from "~backend/client";
import type { CustomerInsight, CustomerSegment } from "~backend/admin/get_customer_insights";
import { Users, TrendingUp, UserCheck, UserPlus, Crown, Award, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatNaira } from "../../lib/currency";

export default function CustomersTab() {
  const [topCustomers, setTopCustomers] = useState<CustomerInsight[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [stats, setStats] = useState({
    repeatCustomers: 0,
    newCustomers: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomerInsights = async () => {
    try {
      const data = await backend.admin.getCustomerInsights();
      setTopCustomers(data.topCustomers);
      setSegments(data.segments);
      setStats({
        repeatCustomers: data.repeatCustomers,
        newCustomers: data.newCustomers,
        totalCustomers: data.totalCustomers,
      });
    } catch (error) {
      console.error("Failed to fetch customer insights:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customer insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerInsights();
    const interval = setInterval(fetchCustomerInsights, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#6B6B6B]">Loading customer insights...</div>
      </div>
    );
  }

  const repeatRate = stats.totalCustomers > 0 
    ? ((stats.repeatCustomers / stats.totalCustomers) * 100).toFixed(1)
    : "0";

  const segmentIcons: Record<string, any> = {
    VIP: Crown,
    "High Value": Award,
    Regular: Star,
    New: UserPlus,
  };

  const segmentColors: Record<string, { bg: string; text: string }> = {
    VIP: { bg: "bg-purple-100", text: "text-purple-600" },
    "High Value": { bg: "bg-[#D4A574] bg-opacity-20", text: "text-[#D4A574]" },
    Regular: { bg: "bg-blue-100", text: "text-blue-600" },
    New: { bg: "bg-green-100", text: "text-green-600" },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#D4A574] bg-opacity-20 rounded-full flex items-center justify-center">
              <Users className="w-7 h-7 text-[#D4A574]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#6B6B6B] mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-[#2E2E2E]">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#6B6B6B] mb-1">New (30 Days)</p>
              <p className="text-2xl font-bold text-[#2E2E2E]">{stats.newCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#6B6B6B] mb-1">Repeat Rate</p>
              <p className="text-2xl font-bold text-[#2E2E2E]">{repeatRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-[#2E2E2E] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#D4A574]" />
          Customer Segments
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {segments.map((segment) => {
            const Icon = segmentIcons[segment.segment] || Users;
            const colors = segmentColors[segment.segment] || { bg: "bg-gray-100", text: "text-gray-600" };
            return (
              <div key={segment.segment} className="bg-[#FFF9F4] rounded-lg p-4">
                <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <h4 className="font-semibold text-[#2E2E2E] mb-1">{segment.segment}</h4>
                <p className="text-sm text-[#6B6B6B] mb-2">{segment.count} customers</p>
                <p className="text-lg font-bold text-[#D4A574]">{formatNaira(segment.totalRevenue)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-[#2E2E2E] mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-[#D4A574]" />
          Top Customers
        </h3>
        <div className="space-y-3">
          {topCustomers.length === 0 ? (
            <p className="text-sm text-[#6B6B6B] text-center py-4">No customer data available</p>
          ) : (
            topCustomers.slice(0, 20).map((customer, idx) => {
              const isVIP = customer.totalSpent >= 10000;
              const isHighValue = customer.totalSpent >= 5000;
              
              return (
                <div
                  key={customer.phone}
                  className={`p-4 rounded-lg ${
                    isVIP
                      ? "bg-purple-50 border-2 border-purple-200"
                      : isHighValue
                      ? "bg-[#FFF9F4] border-2 border-[#D4A574]"
                      : "bg-[#FFF9F4]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          isVIP
                            ? "bg-purple-600 text-white"
                            : isHighValue
                            ? "bg-[#D4A574] text-white"
                            : "bg-gray-200 text-[#2E2E2E]"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-[#2E2E2E]">{customer.name}</h4>
                          {isVIP && <Crown className="w-4 h-4 text-purple-600" />}
                          {customer.isRepeatCustomer && <UserCheck className="w-4 h-4 text-green-600" />}
                        </div>
                        <p className="text-sm text-[#6B6B6B]">{customer.phone}</p>
                        {customer.email && (
                          <p className="text-xs text-[#6B6B6B]">{customer.email}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-[#6B6B6B]">
                          <span>{customer.totalOrders} orders</span>
                          <span>Avg: {formatNaira(customer.averageOrderValue)}</span>
                          <span>
                            Last order: {customer.daysSinceLastOrder === 0 
                              ? "today" 
                              : `${customer.daysSinceLastOrder} days ago`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-[#D4A574]">
                        {formatNaira(customer.totalSpent)}
                      </p>
                      <p className="text-xs text-[#6B6B6B]">lifetime value</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
