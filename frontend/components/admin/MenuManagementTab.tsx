import { useState, useEffect } from "react";
import backend from "~backend/client";
import type { MenuItem } from "~backend/admin/list_all_menu";
import { useToast } from "@/components/ui/use-toast";

export default function MenuManagementTab() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMenu = async () => {
    try {
      const response = await backend.admin.listAllMenu();
      setMenuItems(response.items);
    } catch (error) {
      console.error("Failed to fetch menu:", error);
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const toggleAvailability = async (menuItemId: number, currentAvailable: boolean) => {
    try {
      await backend.admin.toggleAvailability({
        menuItemId,
        available: !currentAvailable,
      });

      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === menuItemId ? { ...item, available: !currentAvailable } : item
        )
      );

      toast({
        title: "Success",
        description: `Item ${!currentAvailable ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      console.error("Failed to toggle availability:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#6B6B6B]">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {menuItems.map((item) => (
        <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex gap-4">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#2E2E2E]">{item.name}</h3>
              <p className="text-sm text-[#6B6B6B] line-clamp-2">{item.description}</p>
              <p className="text-lg font-semibold text-[#D4A574] mt-1">
                ₦{item.price.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => toggleAvailability(item.id, item.available)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  item.available ? "bg-[#D4A574]" : "bg-[#E5E5E5]"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    item.available ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                item.available
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {item.available ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
