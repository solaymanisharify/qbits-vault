import { motion } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";

const CustomModal = ({ isCloseModal, children }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-[#1b1e3a] border border-[#353857] rounded-2xl p-10 max-w-[600px] mx-4 lg:mx-auto w-full"
      >
        <div onClick={isCloseModal} className="text-gray-500 hover:text-red-400 cursor-pointer flex justify-end">
          <AiOutlineClose />
        </div>
        {children}
      </motion.div>
    </div>
  );
};

export default CustomModal;
