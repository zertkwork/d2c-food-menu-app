import { useState, useEffect } from "react";
import backend from "~backend/client";
import type { AdminOrder } from "~backend/admin/list_orders";
import { Phone, MapPin, Clock, CheckCircle2, ChefHat, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useOrderNotifications } from "../../hooks/useOrderNotifications";

type OrderStatus = "new" | "in_progress" | "ready" | "delivered";

export default function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus>("new");
  const { toast } = useToast();

  const newOrdersCount = orders.filter((order) =>
    ["pending_payment", "received", "paid"].includes(order.orderStatus)
  ).length;

  useOrderNotifications(newOrdersCount);

  const fetchOrders = async () => {
    try {
      const response = await backend.admin.listOrders();
      setOrders(response.orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await backend.admin.updateOrderStatus({ orderId, status: newStatus });
      await fetchOrders();
      toast({
        title: "Success",
        description: "Order status updated",
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getFilteredOrders = () => {
    const statusMap: Record<OrderStatus, string[]> = {
      new: ["pending_payment", "received", "paid"],
      in_progress: ["preparing", "in_progress"],
      ready: ["ready"],
      delivered: ["delivered"],
    };

    return orders.filter((order) =>
      statusMap[filter].includes(order.orderStatus)
    );
  };

  const filteredOrders = getFilteredOrders();

  const filters: { id: OrderStatus; label: string }[] = [
    { id: "new", label: "New Orders" },
    { id: "in_progress", label: "In Progress" },
    { id: "ready", label: "Ready" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#6B6B6B]">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? "bg-[#D4A574] text-white"
                : "bg-white text-[#6B6B6B] border border-[#E5E5E5]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Package className="w-12 h-12 text-[#E5E5E5] mx-auto mb-3" />
          <p className="text-[#6B6B6B]">No orders in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[#2E2E2E]">{order.trackingId}</h3>
                  <p className="text-sm text-[#6B6B6B] flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-lg font-semibold text-[#D4A574]">
                  ₦{order.total.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-[#6B6B6B]" />
                  <span className="text-[#2E2E2E] font-medium">{order.customerName}</span>
                  <a
                    href={`https://wa.me/${order.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D4A574] hover:underline ml-auto"
                  >
                    {order.phone}
                  </a>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[#6B6B6B] mt-0.5" />
                  <span className="text-[#6B6B6B] flex-1">{order.deliveryAddress}</span>
                </div>
              </div>

              <div className="border-t border-[#E5E5E5] pt-3 mb-3">
                <p className="text-sm font-medium text-[#2E2E2E] mb-2">Items:</p>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-[#6B6B6B]">
                        {item.quantity}x {item.menuItemName}
                      </span>
                      <span className="text-[#2E2E2E] font-medium">
                        ₦{item.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                {filter === "new" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "in_progress")}
                    className="flex-1 bg-[#D4A574] text-white py-2 rounded-lg font-medium hover:bg-[#C49563] transition-colors flex items-center justify-center gap-2"
                  >
                    <ChefHat className="w-4 h-4" />
                    Accept
                  </button>
                )}
                {filter === "in_progress" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "ready")}
                    className="flex-1 bg-[#D4A574] text-white py-2 rounded-lg font-medium hover:bg-[#C49563] transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Ready
                  </button>
                )}
                {filter === "ready" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "delivered")}
                    className="flex-1 bg-[#D4A574] text-white py-2 rounded-lg font-medium hover:bg-[#C49563] transition-colors flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
