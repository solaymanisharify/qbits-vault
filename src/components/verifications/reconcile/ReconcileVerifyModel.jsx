import { motion, AnimatePresence } from "framer-motion";
import CustomModal from "../../global/modal/CustomModal";

const ReconcileVerifyModel = ({ setOpenReconcileVerifyModel, selectedReconcile, verifyAction, note, setNote,handleReconcileVerifySubmit }) => {
  console.log({ selectedReconcile });


  return (
    <>
      <AnimatePresence>
        <CustomModal isCloseModal={() => setOpenReconcileVerifyModel(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <h2 className="text-xl font-bold text-center mb-8 text-gray-800">Verify Reconcile</h2>

            <div className="space-y-2 text-gray-600 mb-8">
              <p className="text-sm">
                <span className="">Reconcile ID:</span>{" "}
                <span className="font-mono font-medium text-cyan-600 text-md">{selectedReconcile?.reconcile_tran_id}</span>
              </p>
              <p className="text-sm">
                <span className="">Vault ID:</span> <span className="font-mono font-medium text-cyan-600 text-md">{selectedReconcile?.vault?.vault_id}</span>
              </p>
              <p className="text-sm  text-gray-800">
                Requested By: <span className=" font-medium">{selectedReconcile?.started_by?.name}</span>
              </p>
              <p className="text-sm">
                Current Status: <span className="capitalize font-medium text-green-600 ">{selectedReconcile?.verifier_status}</span>
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-3">Note (Optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about your decision..."
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 outline-none resize-none"
                rows="4"
              />
            </div>

            <div className="flex gap-6 justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenReconcileVerifyModel(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReconcileVerifySubmit}
                className={`px-6 py-2 rounded-xl font-bold text-white shadow-lg flex items-center gap-3 ${
                  verifyAction === "verify"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600"
                    : verifyAction === "approve"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600"
                      : "bg-gradient-to-r from-red-600 to-pink-600"
                }`}
              >
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </CustomModal>
      </AnimatePresence>
    </>
  );
};

export default ReconcileVerifyModel;
