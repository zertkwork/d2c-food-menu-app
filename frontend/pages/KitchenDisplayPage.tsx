import { useEffect, useState } from "react";
import backend from "~backend/client";
import { ChefHat, Clock, CheckCircle2, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface KitchenOrder {
  orderId: number;
  trackingId: string;
  customerName: string;
  items?: Array<{
    menuItemName: string;
    quantity: number;
  }>;
  kitchenStatus: string;
  orderStatus: string;
  createdAt: Date;
  estimatedDeliveryMinutes: number;
}

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<Map<number, KitchenOrder>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    let stream: any;
    let isConnected = true;

    const connectToStream = async () => {
      try {
        stream = await backend.kitchen.streamOrders();

        for await (const update of stream) {
          if (!isConnected) break;

          const orderData: KitchenOrder = {
            orderId: update.orderId,
            trackingId: update.trackingId,
            customerName: update.customerName,
            items: update.items,
            kitchenStatus: update.kitchenStatus,
            orderStatus: update.orderStatus,
            createdAt: new Date(update.createdAt),
            estimatedDeliveryMinutes: update.estimatedDeliveryMinutes,
          };

          setOrders((prev) => {
            const newOrders = new Map(prev);
            if (update.kitchenStatus === "completed" || update.kitchenStatus === "ready") {
              setTimeout(() => {
                setOrders((current) => {
                  const updated = new Map(current);
                  updated.delete(update.orderId);
                  return updated;
                });
              }, 5000);
            }
            newOrders.set(update.orderId, orderData);
            return newOrders;
          });

          if (update.type === "new_order") {
            toast({
              title: "New Order!",
              description: `Order ${update.trackingId} from ${update.customerName}`,
            });
          }
        }
      } catch (error) {
        console.error("Stream error:", error);
        if (isConnected) {
          setTimeout(connectToStream, 3000);
        }
      }
    };

    connectToStream();

    return () => {
      isConnected = false;
      if (stream?.close) {
        stream.close();
      }
    };
  }, [toast]);

  const updateKitchenStatus = async (orderId: number, kitchenStatus: "pending" | "preparing" | "ready" | "completed") => {
    try {
      await backend.kitchen.updateStatus({ orderId, kitchenStatus });
    } catch (error) {
      console.error("Failed to update kitchen status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const pendingOrders = Array.from(orders.values()).filter(o => o.kitchenStatus === "pending");
  const preparingOrders = Array.from(orders.values()).filter(o => o.kitchenStatus === "preparing");
  const readyOrders = Array.from(orders.values()).filter(o => o.kitchenStatus === "ready");

  const KitchenCard = ({ order }: { order: KitchenOrder }) => {
    const statusColors = {
      pending: "bg-yellow-100 border-yellow-300",
      preparing: "bg-blue-100 border-blue-300",
      ready: "bg-green-100 border-green-300",
    };

    return (
      <div className={`p-4 rounded-lg border-2 ${statusColors[order.kitchenStatus as keyof typeof statusColors]}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg">{order.trackingId}</h3>
            <p className="text-sm text-foreground/70">{order.customerName}</p>
          </div>
          <div className="flex items-center gap-1 text-sm text-foreground/70">
            <Clock className="w-4 h-4" />
            <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="mb-3 space-y-1">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.menuItemName}</span>
              <span className="font-medium">x{item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {order.kitchenStatus === "pending" && (
            <button
              onClick={() => updateKitchenStatus(order.orderId, "preparing")}
              className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Start Preparing
            </button>
          )}
          {order.kitchenStatus === "preparing" && (
            <button
              onClick={() => updateKitchenStatus(order.orderId, "ready")}
              className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Mark Ready
            </button>
          )}
          {order.kitchenStatus === "ready" && (
            <div className="flex-1 py-2 bg-green-600 text-white rounded-md flex items-center justify-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Ready for Pickup
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex items-center gap-3">
        <ChefHat className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Kitchen Display System</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-semibold">Pending ({pendingOrders.length})</h2>
          </div>
          <div className="space-y-3">
            {pendingOrders.map(order => (
              <KitchenCard key={order.orderId} order={order} />
            ))}
            {pendingOrders.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No pending orders</p>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Preparing ({preparingOrders.length})</h2>
          </div>
          <div className="space-y-3">
            {preparingOrders.map(order => (
              <KitchenCard key={order.orderId} order={order} />
            ))}
            {preparingOrders.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No orders in preparation</p>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold">Ready ({readyOrders.length})</h2>
          </div>
          <div className="space-y-3">
            {readyOrders.map(order => (
              <KitchenCard key={order.orderId} order={order} />
            ))}
            {readyOrders.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No orders ready</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
