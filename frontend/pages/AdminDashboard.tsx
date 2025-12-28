import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Package, Menu, BarChart3, LogOut, BoxIcon, Users } from "lucide-react";
import OrdersTab from "../components/admin/OrdersTab";
import MenuManagementTab from "../components/admin/MenuManagementTab";
import ReportsTab from "../components/admin/ReportsTab";
import InventoryTab from "../components/admin/InventoryTab";
import CustomersTab from "../components/admin/CustomersTab";

type Tab = "orders" | "menu" | "reports" | "inventory" | "customers";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const tabs = [
    { id: "orders" as Tab, label: "Orders", icon: Package },
    { id: "menu" as Tab, label: "Menu", icon: Menu },
    { id: "inventory" as Tab, label: "Inventory", icon: BoxIcon },
    { id: "customers" as Tab, label: "Customers", icon: Users },
    { id: "reports" as Tab, label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F4]">
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#2E2E2E]">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="p-2 text-[#6B6B6B] hover:text-[#D4A574] transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-t border-[#E5E5E5]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-[#D4A574] border-b-2 border-[#D4A574]"
                    : "text-[#6B6B6B]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "menu" && <MenuManagementTab />}
        {activeTab === "inventory" && <InventoryTab />}
        {activeTab === "customers" && <CustomersTab />}
        {activeTab === "reports" && <ReportsTab />}
      </main>
    </div>
  );
}
