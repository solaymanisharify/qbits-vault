import { motion } from "framer-motion";
import { X } from "lucide-react";

const CustomModal = ({ isCloseModal, children }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-[#353857] rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-visible flex flex-col"
        >
          <div className="flex justify-end p-4 pb-0">
            <X onClick={isCloseModal} className="text-2xl text-gray-500 hover:text-red-400 cursor-pointer" />
          </div>
          <div className="px-10 pb-10 text-gray-600 overflow-visible">{children}</div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomModal;
