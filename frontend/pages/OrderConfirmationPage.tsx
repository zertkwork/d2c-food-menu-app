import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Home, Package, Sparkles, CheckCircle } from "lucide-react";

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trackingId = searchParams.get("trackingId");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Simulate confetti for a celebratory feel
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleTrackOrder = () => {
    if (trackingId) {
      navigate(`/track-order/${trackingId}`);
    } else {
      navigate("/"); // Fallback to menu if trackingId is missing
    }
  };

  const handleGoToMenu = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center p-6 relative overflow-hidden">
      {showConfetti && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Simple confetti animation - can be replaced with a library */}
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                y: "100vh",
                x: `${Math.random() * 100}vw`,
                rotate: Math.random() * 360,
                scale: Math.random() * 0.5 + 0.5,
                opacity: 0,
              }}
              animate={{
                y: `-${Math.random() * 50}vh`,
                opacity: 1,
                transition: {
                  duration: Math.random() * 2 + 1,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeOut",
                },
              }}
              style={{
                position: "absolute",
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 70%)`,
                borderRadius: "50%",
              }}
            />
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
        className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md w-full relative z-10"
      >
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-[#2C2C2C] mb-3">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your payment was successful and your order has been placed.
        </p>

        {trackingId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Your Tracking ID:</p>
            <p className="font-mono text-xl font-semibold text-[#2C2C2C] break-all">
              {trackingId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <motion.button
            onClick={handleTrackOrder}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-[#FF8C42] text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-[#ff7a2e] transition-colors shadow-lg shadow-[#FF8C42]/20"
          >
            <Package className="w-5 h-5" />
            Track Your Order
          </motion.button>
          <motion.button
            onClick={handleGoToMenu}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-[#2C2C2C] px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Menu
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}