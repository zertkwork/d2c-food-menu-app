import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { MenuItem } from "~backend/menu/list";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  subtotal: number;
  totalItems: number;
  addItem: (item: MenuItem) => void;
  updateQuantity: (id: number, delta: number) => void;
  removeItem: (id: number) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "food-order-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (menuItem: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === menuItem.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                total: (i.quantity + 1) * i.price,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          imageUrl: menuItem.imageUrl,
          total: menuItem.price,
        },
      ];
    });
    setIsOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + delta);
            return {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.price,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        subtotal,
        totalItems,
        addItem,
        updateQuantity,
        removeItem,
        openCart,
        closeCart,
        clearCart,
        setItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

export function useCartActions() {
  const { addItem, updateQuantity, removeItem, openCart, closeCart, clearCart } =
    useCart();
  return { addItem, updateQuantity, removeItem, openCart, closeCart, clearCart };
}
