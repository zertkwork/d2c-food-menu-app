import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import MenuPage from "./components/MenuPage";
import MagicCart from "./components/MagicCart";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import KitchenDisplayPage from "./pages/KitchenDisplayPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-[#FFF9F4]">
            <Routes>
              <Route path="/" element={<MenuPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/track-order/:trackingId" element={<OrderTrackingPage />} />
              <Route path="/order-history" element={<OrderHistoryPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kitchen"
                element={
                  <ProtectedRoute requiredRole="kitchen">
                    <KitchenDisplayPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <MagicCart />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
