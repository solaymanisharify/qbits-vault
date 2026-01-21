// components/global/toast/Toast.jsx
import { motion } from "framer-motion";
import { useEffect } from "react";
import { HiCheckCircle, HiExclamation, HiInformationCircle, HiXCircle } from "react-icons/hi";
import { IoClose } from "react-icons/io5";

const icons = {
  success: <HiCheckCircle className="w-7 h-7" />,
  error: <HiXCircle className="w-7 h-7" />,
  warning: <HiExclamation className="w-7 h-7" />,
  info: <HiInformationCircle className="w-7 h-7" />,
};

// Gradient backgrounds (Tailwind + custom classes)
const gradients = {
  success: "bg-gradient-to-r from-emerald-500 to-teal-600",
  error: "bg-gradient-to-r from-rose-500 to-pink-600",
  warning: "bg-gradient-to-r from-amber-500 to-orange-500",
  info: "bg-gradient-to-r from-indigo-500 to-purple-600",
};

export const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: 300 }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className={`
        flex items-center gap-4 max-w-sm w-full p-2 rounded-2xl 
        shadow-2xl text-white font-medium
        border border-white/20 backdrop-blur-xl
        ${gradients[toast.type]}
        hover:shadow-3xl transition-shadow duration-300
      `}
    >
      <div className="flex-shrink-0 drop-shadow-lg">{icons[toast.type]}</div>

      <div className="flex-1">
        {toast.title && <p className="font-bold text-lg drop-shadow-md">{toast.title}</p>}
        <p className={toast.title ? "text-sm opacity-95" : "text-base"}>{toast.message}</p>
      </div>

      <button onClick={() => onRemove(toast.id)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur transition">
        <IoClose className="w-5 h-5" />
      </button>
    </motion.div>
  );
};
