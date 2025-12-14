import { motion } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";

const Drawer = ({ isOpen, onClose, children, title = "Drawer" }) => {
  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/70 z-40"
        />
      )}

      {/* Drawer Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#1b1e3a] border-l border-[#353857] shadow-2xl z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#353857]">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <AiOutlineClose className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </motion.div>
    </>
  );
};

export default Drawer;
