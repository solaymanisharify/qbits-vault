import { useEffect, useState } from "react";
import CustomModal from "../global/modal/CustomModal";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { GetVaults } from "../../services/Vault";
import { StartReconcile } from "../../services/Reconcile";

const ReconcileModal = ({ isClose, refetch }) => {
  const [selectedVaultId, setSelectedVaultId] = useState(null);
  const [vaults, setVaults] = useState([]);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ─── Dates ───────────────────────────────────────────────
  // Current date = today (always)
  const today = new Date().toISOString().split("T")[0];

  const previousReconcileDate = "2025-12-15";

  useEffect(() => {
    GetVaults().then((res) => setVaults(res.data || []));
  }, []);

  const handleVaultSelect = (vaultId) => {
    setSelectedVaultId(vaultId);
    setDropdownOpen(false);
  };

  const handleSubmitRequest = () => {
    try {
      StartReconcile({
        vault_id: selectedVaultId,
        from_date: previousReconcileDate,
        to_date: today,
      });
    } catch (error) {
      console.error(error);
    } finally {
      refetch();
    }
    isClose();
  };

  // const renderStepContent = () => {
  //       return (
  //         <>
  //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-1">
  //                 Previous Reconcile Date
  //               </label>
  //               <input
  //                 type="date"
  //                 value={previousReconcileDate}
  //                 readOnly
  //                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
  //               />
  //             </div>

  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-1">
  //                 Current Reconcile Date
  //               </label>
  //               <input
  //                 type="date"
  //                 value={today}
  //                 readOnly
  //                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
  //               />
  //             </div>
  //           </div>

  //           <p className="mb-3 font-medium text-gray-800">Select Vault</p>

  //           <div className="relative overflow-visible">
  //             <button
  //               onClick={() => setDropdownOpen(!dropdownOpen)}
  //               className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg flex justify-between items-center text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
  //             >
  //               {selectedVaultId
  //                 ? vaults.find((v) => v.id === selectedVaultId)?.name || "Unknown Vault"
  //                 : "Choose a Vault"}
  //               <ChevronDown className={`w-5 h-5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
  //             </button>

  //             <AnimatePresence>
  //               {dropdownOpen && (
  //                 <motion.ul
  //                   initial={{ opacity: 0, y: -10 }}
  //                   animate={{ opacity: 1, y: 0 }}
  //                   exit={{ opacity: 0, y: -10 }}
  //                   className="absolute z-[100] w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-64 overflow-y-auto shadow-xl divide-y divide-gray-100"
  //                 >
  //                   {vaults.map((vault) => (
  //                     <li
  //                       key={vault.id}
  //                       onClick={() => handleVaultSelect(vault.id)}
  //                       className="px-4 py-2.5 hover:bg-cyan-50 cursor-pointer transition-colors flex justify-between items-center"
  //                     >
  //                       <span>{vault.name}</span>
  //                       <span className="text-gray-500 text-sm">({vault.vault_id})</span>
  //                     </li>
  //                   ))}
  //                 </motion.ul>
  //               )}
  //             </AnimatePresence>
  //           </div>
  //         </>
  //       );

  //     // case 2:
  //     //   return (
  //     //     <>
  //     //       <p className="font-medium text-gray-800 mb-4">Select Reconciliation Scope</p>

  //     //       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-3">
  //     //         {scopes.map((scope) => (
  //     //           <button
  //     //             key={scope.id}
  //     //             onClick={() => setSelectedScope(scope.id)}
  //     //             className={`
  //     //               py-5 px-4 rounded-xl border cursor-pointer transition-all text-center font-medium
  //     //               ${
  //     //                 selectedScope === scope.id
  //     //                   ? `border-${scope.color}-500 bg-${scope.color}-50 text-${scope.color}-700 shadow-sm`
  //     //                   : `border-gray-200 hover:border-${scope.color}-300 bg-white hover:bg-${scope.color}-50/30`
  //     //               }
  //     //             `}
  //     //           >
  //     //             {scope.label}
  //     //           </button>
  //     //         ))}
  //     //       </div>
  //     //     </>
  //     //   );

  //     // case 3:
  //     //   return (
  //     //     <div className="py-6 text-center">
  //     //       <h3 className="text-xl font-bold mb-6 text-gray-800">Ready to Reconcile</h3>

  //     //       <div className="bg-gray-50 p-6 rounded-xl mb-8 text-left max-w-lg mx-auto border border-gray-100">
  //     //         <div className="space-y-3">
  //     //           <p>
  //     //             <span className="font-semibold">Vault:</span>{" "}
  //     //             {vaults.find((v) => v.id === selectedVaultId)?.name || "—"}
  //     //           </p>
  //     //           <p>
  //     //             <span className="font-semibold">Scope:</span>{" "}
  //     //             {scopes.find((s) => s.id === selectedScope)?.label || "—"}
  //     //           </p>
  //     //           <p>
  //     //             <span className="font-semibold">Previous Date:</span> {previousReconcileDate}
  //     //           </p>
  //     //           <p>
  //     //             <span className="font-semibold">Current Date:</span> {today}
  //     //           </p>
  //     //         </div>
  //     //       </div>

  //     //       <p className="text-red-600 font-medium mb-2">
  //     //         This action will start the reconciliation process and lock the vault until completion.
  //     //       </p>
  //     //       <p className="text-gray-700">Are you sure you want to proceed?</p>
  //     //     </div>
  //     //   );
  //   }

  return (
    <CustomModal isCloseModal={isClose}>
      <div className="flex flex-col ">
        {/* Header */}
        <div className="mb-6">
          <p className="text-center text-2xl font-bold text-gray-800">Setup Reconciliation</p>
        </div>

        {/* Content */}
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Previous Reconcile Date</label>
              <input
                type="date"
                value={previousReconcileDate}
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Reconcile Date</label>
              <input
                type="date"
                value={today}
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          <p className="mb-3 font-medium text-gray-800">Select Vault</p>

          <div className="relative overflow-visible">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg flex justify-between items-center text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            >
              {selectedVaultId ? vaults.find((v) => v.id === selectedVaultId)?.name || "Unknown Vault" : "Choose a Vault"}
              <ChevronDown className={`w-5 h-5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-[100] w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-64 overflow-y-auto shadow-xl divide-y divide-gray-100"
                >
                  {vaults.map((vault) => (
                    <li
                      key={vault.id}
                      onClick={() => handleVaultSelect(vault.id)}
                      className="px-4 py-2.5 hover:bg-cyan-50 cursor-pointer transition-colors flex justify-between items-center"
                    >
                      <span>{vault.name}</span>
                      <span className="text-gray-500 text-sm">({vault.vault_id})</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </>

        {/* Footer */}
        <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-gray-100">
          <button onClick={isClose} className="px-6 py-2.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition font-medium">
            Cancel
          </button>

          <button
            onClick={handleSubmitRequest}
            // disabled={!canGoNext()}
            className="min-w-[160px] px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Save
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ReconcileModal;
