import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useCart, useCartActions } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { formatNaira } from "../lib/currency";

export default function MagicCart() {
  const { items, isOpen, subtotal } = useCart();
  const { updateQuantity, closeCart } = useCartActions();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) return;
    closeCart();
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={closeCart}
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 md:right-0 md:left-auto md:top-0 md:bottom-0 md:w-[400px] bg-[rgba(255,249,244,0.98)] backdrop-blur-md z-50 rounded-t-3xl md:rounded-l-3xl md:rounded-r-none shadow-2xl md:shadow-[-4px_0_20px_rgba(0,0,0,0.1)]"
            style={{
              maxHeight: "85vh",
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-[#2C2C2C]">Your Order</h2>
                <button
                  onClick={closeCart}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close cart"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <p className="text-gray-400 text-center">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#2C2C2C] mb-1 truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {formatNaira(item.price)}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5 text-gray-700" />
                            </button>
                            <span className="font-semibold text-[#2C2C2C] min-w-[28px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5 text-gray-700" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-[#2C2C2C]">
                            {formatNaira(item.total)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 p-6 space-y-4 bg-white/50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-600">Subtotal</span>
                      <span className="font-bold text-2xl text-[#2C2C2C]">
                        {formatNaira(subtotal)}
                      </span>
                    </div>
                    <motion.button
                      onClick={handleCheckout}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-[#FF8C42] text-white py-4 rounded-full font-bold text-lg hover:bg-[#ff7a2e] transition-colors shadow-lg shadow-[#FF8C42]/20 min-h-[56px]"
                    >
                      Proceed to Checkout
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
