import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChefHat,
  Bike,
  PartyPopper,
  Clock,
  Share2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Copy,
  Check,
} from "lucide-react";
import backend from "~backend/client";
import type { Order } from "~backend/order/track";

type OrderStatus = "received" | "preparing" | "out_for_delivery" | "delivered";

interface ProgressStep {
  id: OrderStatus;
  label: string;
  message: string;
  icon: typeof CheckCircle2;
}

const PROGRESS_STEPS: ProgressStep[] = [
  {
    id: "received",
    label: "Order Received",
    message: "We got your order 🎉",
    icon: CheckCircle2,
  },
  {
    id: "preparing",
    label: "In Kitchen",
    message: "Our chef is preparing your meal 🍳",
    icon: ChefHat,
  },
  {
    id: "out_for_delivery",
    label: "Out for Delivery",
    message: "Your rider is on the way 🚴‍♂️",
    icon: Bike,
  },
  {
    id: "delivered",
    label: "Delivered",
    message: "Enjoy your meal 😋",
    icon: PartyPopper,
  },
];

export default function OrderTrackingPage() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartRef = useRef<number>(0);
  const scrollTopRef = useRef<number>(0);

  useEffect(() => {
    if (trackingId) {
      loadOrder();
      
      let stream: any;
      let isConnected = true;

      const connectToStream = async () => {
        try {
          stream = await backend.order.streamStatus({ trackingId });

          for await (const update of stream) {
            if (!isConnected) break;

            setOrder((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                orderStatus: update.orderStatus,
                estimatedDeliveryMinutes: update.estimatedDeliveryMinutes ?? prev.estimatedDeliveryMinutes,
              };
            });
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
    }
  }, [trackingId]);

  const loadOrder = async (silent = false) => {
    if (!trackingId) return;

    if (!silent) setLoading(true);
    try {
      const orderData = await backend.order.track({ trackingId });
      setOrder(orderData);
      setError("");
    } catch (err: any) {
      console.error("Failed to load order:", err);
      setError(err.message || "Order not found");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrder(true);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getCurrentStepIndex = (status: string): number => {
    const index = PROGRESS_STEPS.findIndex((step) => step.id === status);
    return index >= 0 ? index : 0;
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartRef.current = e.touches[0].clientY;
      scrollTopRef.current = window.scrollY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartRef.current === 0) return;
    
    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartRef.current;
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance * 0.5, 80));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60) {
      handleRefresh();
    }
    touchStartRef.current = 0;
    setPullDistance(0);
  }, [pullDistance]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#FF8C42] animate-spin mx-auto mb-4" />
          <p className="text-[#2C2C2C]/60">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-[#2C2C2C]/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">
            Order Not Found
          </h2>
          <p className="text-[#2C2C2C]/60 mb-6">
            {error || "We couldn't find this order."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#FF8C42] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#ff7a2e] transition-all"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex(order.orderStatus);
  const firstName = order.customerName.split(" ")[0];

  return (
    <div
      className="min-h-screen bg-[#FFF9F4]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 flex items-center justify-center z-50 transition-opacity"
          style={{
            height: `${pullDistance}px`,
            opacity: pullDistance / 80,
          }}
        >
          <Loader2
            className="w-6 h-6 text-[#FF8C42]"
            style={{
              transform: `rotate(${pullDistance * 4}deg)`,
            }}
          />
        </div>
      )}
      <div className="max-w-lg mx-auto px-4 py-6 pb-20" style={{ transform: `translateY(${pullDistance}px)` }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FF8C42] rounded-full mx-auto mb-4 flex items-center justify-center">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-[#2C2C2C] mb-1">
            Track Your Order
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-xs text-[#2C2C2C]/50">Tracking ID:</span>
              <span className="font-mono font-semibold text-[#2C2C2C] text-sm">
                {order.trackingId}
              </span>
            </div>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-sm text-[#FF8C42] hover:text-[#ff7a2e] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Link copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share tracking link</span>
                </>
              )}
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">
              Hey {firstName} 👋
            </h2>
            <p className="text-[#2C2C2C]/70 text-lg">
              {currentStepIndex === 3
                ? "Your order has been delivered!"
                : "Your order is on its way!"}
            </p>
          </div>
        </motion.div>

        <div className="space-y-6 mb-8">
          {PROGRESS_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < PROGRESS_STEPS.length - 1 && (
                  <div
                    className={`absolute left-6 top-14 w-0.5 h-12 transition-colors duration-500 ${
                      isCompleted || isCurrent
                        ? "bg-[#FF8C42]"
                        : "bg-[#2C2C2C]/10"
                    }`}
                  />
                )}

                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCurrent
                        ? "bg-[#FF8C42] shadow-lg shadow-[#FF8C42]/30"
                        : isCompleted
                        ? "bg-[#FF8C42]"
                        : "bg-[#2C2C2C]/5"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 transition-colors duration-500 ${
                        isCurrent || isCompleted
                          ? "text-white"
                          : "text-[#2C2C2C]/30"
                      }`}
                    />
                  </div>

                  <div className="flex-1 pt-1">
                    <h3
                      className={`font-semibold mb-1 transition-colors duration-500 ${
                        isCurrent || isCompleted
                          ? "text-[#2C2C2C]"
                          : "text-[#2C2C2C]/30"
                      }`}
                    >
                      {step.label}
                    </h3>
                    <p
                      className={`text-sm transition-colors duration-500 ${
                        isCurrent || isCompleted
                          ? "text-[#2C2C2C]/70"
                          : "text-[#2C2C2C]/30"
                      }`}
                    >
                      {step.message}
                    </p>

                    {isCurrent && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2"
                      >
                        <div className="inline-flex items-center gap-2 bg-[#FF8C42]/10 text-[#FF8C42] px-3 py-1 rounded-full text-xs font-medium">
                          <div className="w-2 h-2 bg-[#FF8C42] rounded-full animate-pulse" />
                          In Progress
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-[#FF8C42]/10 to-[#FF8C42]/5 border border-[#FF8C42]/20 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[#2C2C2C]">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Estimated Delivery</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-[#FF8C42] hover:text-[#ff7a2e] transition-colors disabled:opacity-50"
            >
              <Loader2
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <p className="text-2xl font-bold text-[#2C2C2C]">
            {order.estimatedDeliveryMinutes} mins
          </p>
          <div className="mt-3 h-2 bg-white/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStepIndex + 1) / PROGRESS_STEPS.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-[#FF8C42] rounded-full"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-6 hover:bg-[#2C2C2C]/[0.02] transition-colors"
          >
            <h3 className="font-semibold text-[#2C2C2C]">Order Summary</h3>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-[#2C2C2C]/50" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#2C2C2C]/50" />
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 space-y-3 border-t border-[#2C2C2C]/5">
                  <div className="pt-4 space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-[#2C2C2C]">
                            {item.menuItemName}
                          </p>
                          <p className="text-sm text-[#2C2C2C]/50">
                            ₦{item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-[#2C2C2C]">
                          ₦{item.total.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t-2 border-[#2C2C2C]/10 flex items-center justify-between">
                    <span className="font-semibold text-[#2C2C2C]">Total</span>
                    <span className="font-bold text-xl text-[#FF8C42]">
                      ₦{order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#2C2C2C]/5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#2C2C2C]/50">Delivery to:</span>
                      <span className="text-[#2C2C2C] font-medium max-w-[60%] text-right">
                        {order.deliveryAddress}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#2C2C2C]/50">Phone:</span>
                      <span className="text-[#2C2C2C] font-medium">
                        {order.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 text-center">
          <a
            href={`https://wa.me/2348012345678?text=Hello, I need help with order ${order.trackingId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#FF8C42] hover:text-[#ff7a2e] transition-colors underline"
          >
            Need help? Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
