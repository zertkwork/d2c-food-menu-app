import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, MapPin, Phone, User, Loader2, CheckCircle } from "lucide-react";
import { useCart, useCartActions } from "../contexts/CartContext";
import backend from "~backend/client";
import { usePaystackPayment } from "react-paystack";
import { formatNaira } from "../lib/currency";
import { cn } from "../lib/utils";

const PAYSTACK_PUBLIC_KEY = "pk_test_8af30f06a083c9af4ba345e917e9dc78112ad70d";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal } = useCart();
  const { clearCart } = useCartActions();

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    deliveryAddress: "",
    deliveryInstructions: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [orderTrackingId, setOrderTrackingId] = useState<string | null>(null);

  const validateNigerianPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\s+/g, "");
    return /^(\+234|0)[789][01]\d{8}$/.test(cleaned);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validateNigerianPhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Nigerian phone number";
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Delivery address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setPaymentError("");
  };

  const config = {
    reference: "",
    email: "customer@example.com",
    amount: Math.round(subtotal * 100),
    publicKey: PAYSTACK_PUBLIC_KEY,
  };



  const onPaymentClose = () => {
    setIsProcessing(false);
    setPaymentError("Payment was cancelled. Please try again.");
  };

  const initializePayment = usePaystackPayment(config);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    try {
      const orderItems = items.map((item) => ({
        menuItemId: item.id,
        menuItemName: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      }));

      const response = await backend.order.create({
        customerName: formData.customerName,
        phone: formData.phone,
        deliveryAddress: formData.deliveryAddress,
        deliveryInstructions: formData.deliveryInstructions || undefined,
        items: orderItems,
        total: subtotal,
      });

      config.reference = response.paystackReference;

      try {
        initializePayment({
          ...config,
          onSuccess: (reference: any) => {
            console.log("Paystack onSuccess triggered. Reference:", reference);
            clearCart();
            // Directly use response.trackingId from the closure
            if (response.trackingId) {
              console.log("Navigating to order confirmation page with ID:", response.trackingId);
              navigate(`/order-confirmation?trackingId=${response.trackingId}`);
            } else {
              console.error("Order tracking ID not available after successful payment. Navigating to /order-confirmation.");
              navigate("/order-confirmation");
            }
          },
          onClose: onPaymentClose,
          metadata: {
            trackingId: response.trackingId, // Still pass for completeness, though not used by onSuccess directly
            customerName: formData.customerName,
            phone: formData.phone,
          },
        } as any);
      } catch (paymentInitError: any) {
        console.error("Paystack initialization failed:", paymentInitError);
        setPaymentError(paymentInitError.message || "Failed to initialize payment. Please try again.");
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("Order creation failed:", error);
      setPaymentError(error.message || "Failed to create order. Please try again.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center p-6">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add items to get started</p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#FF8C42] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#ff7a2e] transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F4]">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#2C2C2C] mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Menu</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-lg"
        >
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Step 3 of 3</p>
            <h1 className="text-3xl font-bold text-[#2C2C2C]">Checkout</h1>
          </div>

          <details className="mb-6 bg-gray-50 rounded-2xl p-4 cursor-pointer group">
            <summary className="font-semibold text-[#2C2C2C] flex items-center justify-between">
              <span>Order Summary ({items.length} items)</span>
              <span className="text-[#FF8C42]">{formatNaira(subtotal)}</span>
            </summary>
            <div className="mt-4 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">{formatNaira(item.total)}</span>
                </div>
              ))}
            </div>
          </details>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#2C2C2C] mb-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="e.g. Tunde Okafor"
                className={`w-full px-4 py-4 rounded-xl border-2 ${
                  errors.customerName ? "border-red-400" : "border-gray-200"
                } focus:border-[#FF8C42] focus:outline-none transition-colors text-[#2C2C2C] placeholder-gray-400`}
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#2C2C2C] mb-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+234 801 234 5678"
                className={`w-full px-4 py-4 rounded-xl border-2 ${
                  errors.phone ? "border-red-400" : "border-gray-200"
                } focus:border-[#FF8C42] focus:outline-none transition-colors text-[#2C2C2C] placeholder-gray-400`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              <p className="text-xs text-gray-500 mt-1">We'll text you delivery updates ✨</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#2C2C2C] mb-2">
                <MapPin className="w-4 h-4" />
                Delivery Address
              </label>
              <input
                type="text"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                placeholder="Enter your full address"
                className={`w-full px-4 py-4 rounded-xl border-2 ${
                  errors.deliveryAddress ? "border-red-400" : "border-gray-200"
                } focus:border-[#FF8C42] focus:outline-none transition-colors text-[#2C2C2C] placeholder-gray-400`}
              />
              {errors.deliveryAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#2C2C2C] mb-2">
                Delivery Instructions (optional)
              </label>
              <textarea
                name="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={handleInputChange}
                placeholder="e.g. Ring doorbell, leave at gate..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FF8C42] focus:outline-none transition-colors text-[#2C2C2C] placeholder-gray-400 resize-none"
              />
            </div>

            <AnimatePresence>
              {paymentError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                >
                  {paymentError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
              <span className="font-semibold text-gray-600">Total</span>
              <span className="font-bold text-2xl text-[#2C2C2C]">{formatNaira(subtotal)}</span>
            </div>
          </form>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-[#2C2C2C]">{formatNaira(subtotal)}</p>
          </div>
          <motion.button
            onClick={handleSubmit}
            disabled={isProcessing}
            whileHover={!isProcessing ? { scale: 1.02 } : {}}
            whileTap={!isProcessing ? { scale: 0.98 } : {}}
            className="flex items-center gap-2 bg-[#FF8C42] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#ff7a2e] transition-colors shadow-lg shadow-[#FF8C42]/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Confirm & Pay
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
