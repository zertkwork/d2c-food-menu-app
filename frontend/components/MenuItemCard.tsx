import { motion } from "framer-motion";
import type { MenuItem } from "~backend/menu/list";
import { useCartActions } from "../contexts/CartContext";
import { formatNaira } from "../lib/currency";
import { cn } from "../lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem } = useCartActions();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">{item.name}</h3>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[#2C2C2C]">
            {formatNaira(item.price)}
          </span>
          <motion.button
            onClick={() => addItem(item)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#FF8C42] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#ff7a2e] transition-colors min-h-[44px] shadow-md shadow-[#FF8C42]/20"
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
