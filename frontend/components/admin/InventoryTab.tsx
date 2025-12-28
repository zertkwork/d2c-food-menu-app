import { useState, useEffect } from "react";
import backend from "~backend/client";
import type { InventoryItem } from "~backend/admin/get_inventory";
import { Package, AlertTriangle, Plus, Minus, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function InventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    stockQuantity: number;
    lowStockThreshold: number;
  }>({ stockQuantity: 0, lowStockThreshold: 0 });
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      const data = await backend.admin.getInventory();
      setItems(data.items);
      setLowStockItems(data.lowStockItems);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAdjustStock = async (menuItemId: number, adjustment: number) => {
    try {
      await backend.admin.adjustStock({ menuItemId, adjustment });
      toast({
        title: "Success",
        description: `Stock ${adjustment > 0 ? 'increased' : 'decreased'} successfully`,
      });
      await fetchInventory();
    } catch (error) {
      console.error("Failed to adjust stock:", error);
      toast({
        title: "Error",
        description: "Failed to adjust stock",
        variant: "destructive",
      });
    }
  };

  const startEditing = (item: InventoryItem) => {
    setEditingItem(item.id);
    setEditValues({
      stockQuantity: item.stockQuantity,
      lowStockThreshold: item.lowStockThreshold,
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  const saveEditing = async (menuItemId: number) => {
    try {
      await backend.admin.updateInventory({
        menuItemId,
        stockQuantity: editValues.stockQuantity,
        lowStockThreshold: editValues.lowStockThreshold,
      });
      toast({
        title: "Success",
        description: "Inventory settings updated",
      });
      setEditingItem(null);
      await fetchInventory();
    } catch (error) {
      console.error("Failed to update inventory:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#6B6B6B]">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Low Stock Alerts ({lowStockItems.length})</h3>
          </div>
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <p className="font-medium text-[#2E2E2E]">{item.name}</p>
                  <p className="text-sm text-red-600">
                    Only {item.stockQuantity} left (threshold: {item.lowStockThreshold})
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAdjustStock(item.id, 10)}
                    className="px-4 py-2 bg-[#D4A574] text-white rounded-lg hover:bg-[#C9945D] transition-colors text-sm"
                  >
                    Add 10
                  </button>
                  <button
                    onClick={() => handleAdjustStock(item.id, 50)}
                    className="px-4 py-2 bg-[#D4A574] text-white rounded-lg hover:bg-[#C9945D] transition-colors text-sm"
                  >
                    Add 50
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-[#2E2E2E] mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#D4A574]" />
          Inventory Management
        </h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border-2 transition-colors ${
                item.isLowStock
                  ? "bg-red-50 border-red-200"
                  : "bg-[#FFF9F4] border-[#E5E5E5]"
              }`}
            >
              {editingItem === item.id ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-[#2E2E2E]">{item.name}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#6B6B6B] block mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        value={editValues.stockQuantity}
                        onChange={(e) =>
                          setEditValues({ ...editValues, stockQuantity: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#6B6B6B] block mb-1">Low Stock Alert</label>
                      <input
                        type="number"
                        value={editValues.lowStockThreshold}
                        onChange={(e) =>
                          setEditValues({ ...editValues, lowStockThreshold: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEditing(item.id)}
                      className="px-4 py-2 bg-[#D4A574] text-white rounded-lg hover:bg-[#C9945D] transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 bg-gray-200 text-[#2E2E2E] rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#2E2E2E]">{item.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-[#6B6B6B]">
                        Stock: <span className="font-semibold text-[#2E2E2E]">{item.stockQuantity}</span>
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        Alert at: <span className="font-semibold text-[#2E2E2E]">{item.lowStockThreshold}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdjustStock(item.id, -1)}
                      className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                      title="Decrease by 1"
                    >
                      <Minus className="w-4 h-4 text-[#2E2E2E]" />
                    </button>
                    <button
                      onClick={() => handleAdjustStock(item.id, 1)}
                      className="w-10 h-10 bg-[#D4A574] rounded-lg hover:bg-[#C9945D] transition-colors flex items-center justify-center"
                      title="Increase by 1"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => startEditing(item)}
                      className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                      title="Edit settings"
                    >
                      <Settings className="w-4 h-4 text-[#2E2E2E]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
