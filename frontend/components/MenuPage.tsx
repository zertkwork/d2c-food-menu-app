import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import backend from "~backend/client";
import type { MenuItem } from "~backend/menu/list";
import MenuItemCard from "./MenuItemCard";
import { useCart, useCartActions } from "../contexts/CartContext";
import { History } from "lucide-react";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const { totalItems, isOpen } = useCart();
  const { openCart } = useCartActions();
  const navigate = useNavigate();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await backend.menu.list();
      setMenuItems(response.items);
    } catch (error) {
      console.error("Failed to load menu:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#2C2C2C] text-lg">Loading menu...</div>
      </div>
    );
  }

  const handleViewHistory = () => {
    if (phoneNumber.trim()) {
      navigate(`/order-history?phone=${encodeURIComponent(phoneNumber)}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">Menu</h1>
        <p className="text-gray-500">Simple, fresh, delicious</p>
        
        <div className="mt-4">
          {!showPhoneInput ? (
            <button
              onClick={() => setShowPhoneInput(true)}
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <History className="w-4 h-4" />
              View Order History
            </button>
          ) : (
            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleViewHistory();
                }}
              />
              <button
                onClick={handleViewHistory}
                disabled={!phoneNumber.trim()}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Go
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {menuItems.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>

      {totalItems > 0 && !isOpen && (
        <motion.button
          onClick={openCart}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#FF8C42] text-white px-8 py-4 rounded-full shadow-2xl shadow-[#FF8C42]/30 flex items-center gap-3 hover:bg-[#ff7a2e] transition-all z-40 min-h-[56px]"
        >
          <span className="font-semibold">View Cart</span>
          <span className="bg-white text-[#FF8C42] px-3 py-1 rounded-full text-sm font-bold">
            {totalItems}
          </span>
        </motion.button>
      )}
    </div>
  );
}
