import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import backend from "~backend/client";
import type { OrderHistoryItem } from "~backend/customer/get_order_history";
import { useCart } from "../contexts/CartContext";
import { toast } from "@/components/ui/use-toast";
import { formatNaira } from "../lib/currency";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, ShoppingCart } from "lucide-react";

export default function OrderHistoryPage() {
  const [searchParams] = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const navigate = useNavigate();
  const { clearCart, addItem } = useCart();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (!phone) {
      navigate("/");
      return;
    }
    fetchOrderHistory();
  }, [phone]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const response = await backend.customer.getOrderHistory({ phone });
      setOrders(response.orders);
      setTotalOrders(response.totalOrders);
      setTotalSpent(response.totalSpent);
    } catch (error) {
      console.error("Failed to fetch order history:", error);
      toast({
        title: "Error",
        description: "Failed to load order history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (order: OrderHistoryItem) => {
    try {
      clearCart();
      
      const menuResponse = await backend.menu.list();
      const availableItems = new Map(menuResponse.items.map(item => [item.id, item]));

      let itemsAdded = 0;
      let itemsUnavailable = 0;

      for (const orderItem of order.items) {
        const menuItem = availableItems.get(orderItem.menuItemId);
        if (menuItem && menuItem.available) {
          for (let i = 0; i < orderItem.quantity; i++) {
            addItem(menuItem);
          }
          itemsAdded++;
        } else {
          itemsUnavailable++;
        }
      }

      if (itemsAdded > 0) {
        toast({
          title: "Items added to cart",
          description: itemsUnavailable > 0 
            ? `${itemsAdded} items added. ${itemsUnavailable} items are no longer available.`
            : `${itemsAdded} items added to your cart`,
        });
        navigate("/");
      } else {
        toast({
          title: "Items unavailable",
          description: "None of the items from this order are currently available.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to reorder:", error);
      toast({
        title: "Error",
        description: "Failed to add items to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
      case "in_transit":
        return "text-blue-600";
      case "preparing":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Menu
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600 mb-4">Phone: {phone}</p>
          
          {!loading && orders.length > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-orange-600">{formatNaira(totalSpent)}</p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start ordering to see your history here</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.orderId} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">#{order.trackingId}</h3>
                      <div className={`flex items-center gap-1 ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="text-sm font-medium capitalize">
                          {order.orderStatus.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">{formatNaira(order.total)}</p>
                    <p className="text-sm text-gray-600">{order.items.length} items</p>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Items</h4>
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.menuItemName}
                        </span>
                        <span className="text-gray-900 font-medium">{formatNaira(item.total)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleReorder(order)}
                    className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Reorder
                  </button>
                  <button
                    onClick={() => navigate(`/track-order/${order.trackingId}`)}
                    className="px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-colors font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
