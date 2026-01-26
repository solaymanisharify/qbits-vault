import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const VaultBagsDrawer = ({
  selectedReconcile,
  setDrawerOpen,
  loadingBags,
  expandedBag,
}) => {
  // Sort: negative differences first, then most negative → least negative
  const sortedBags = [...(selectedReconcile?.variance_bags || [])].sort((a, b) => {
    const diffA = parseFloat(a.pivot?.difference || 0);
    const diffB = parseFloat(b.pivot?.difference || 0);

    if (diffA < 0 && diffB >= 0) return -1;
    if (diffB < 0 && diffA >= 0) return 1;
    return diffA - diffB; // most negative first
  });


  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 bg-black/50 z-50"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 overflow-y-auto"
        >
          {/* Header - minimal */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white font-medium">
                {/* {selectedVault?.vault_id?.slice(-4) || "?"} */}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedReconcile?.vault?.name}</h2>
                <p className="text-sm text-gray-500 font-mono">{selectedReconcile?.reconcile_tran_id}</p>
              </div>
            </div>
            <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Summary row */}
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Bags</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {sortedBags.length} bag{sortedBags.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-xl font-semibold text-gray-900">
                  ৳{sortedBags.reduce((sum, bag) => sum + parseFloat(bag.current_amount || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {loadingBags ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-gray-400"></div>
              </div>
            ) : sortedBags.length === 0 ? (
              <div className="text-center py-20 text-gray-500">No bags found in this vault.</div>
            ) : (
              <div className="space-y-2">
                {sortedBags.map((bag) => {
                  const isNegative = parseFloat(bag.pivot?.difference || 0) < 0;
                  const diffValue = parseFloat(bag.pivot?.difference || 0);
                  const denominations = bag.denominations ? JSON.parse(bag.denominations) : {};

                  return (
                    <motion.div
                      key={bag.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`
                        border rounded-lg overflow-hidden
                        ${isNegative ? "border-red-300 bg-red-50/60" : "border-gray-200 bg-white"}
                      `}
                    >
                      {/* Bag row (clickable header) */}
                      <button
                        // onClick={() => toggleBagExpand(bag.barcode)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-10 h-10 rounded-md flex items-center justify-center text-white text-sm font-medium ${
                              isNegative ? "bg-red-500" : "bg-gray-700"
                            }`}
                          >
                            {bag.barcode.slice(-4)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <h4 className="font-medium text-gray-900 truncate">{bag.barcode}</h4>
                              <span className="text-xs text-gray-500 whitespace-nowrap">Rack {bag.rack_number}</span>
                            </div>

                            <div className="mt-1 flex items-center gap-5 text-sm flex-wrap">
                              <span className="font-medium text-gray-900">
                                ৳{parseFloat(bag.current_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </span>

                              {bag.pivot?.difference !== undefined && (
                                <span className={`font-medium ${isNegative ? "text-red-600" : "text-emerald-600"}`}>
                                  {diffValue >= 0 ? "+" : ""}
                                  {diffValue.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              )}

                              {bag.is_sealed && <span className="text-xs text-purple-600 font-medium">sealed</span>}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Note</p>
                            <p className="text-xs text-gray-900">{bag.pivot?.note}</p>
                          </div>
                        </div>

                        {/* <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-3" /> */}
                      </button>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {expandedBag === bag.barcode && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-gray-50/80 border-t border-gray-200/70"
                          >
                            <div className="p-5 text-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Denominations - very compact */}
                              {Object.keys(denominations).length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Denominations</p>
                                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-x-4 gap-y-2">
                                    {Object.entries(denominations)
                                      .filter(([_, count]) => count > 0)
                                      .map(([note, count]) => (
                                        <div key={note} className="text-center">
                                          <div className="font-medium text-gray-800">৳{note}</div>
                                          <div className="text-xs text-gray-600">{count}×</div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Reconciliation / extra info */}
                              <div>
                                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Reconciliation</p>
                                {bag.pivot?.difference !== undefined ? (
                                  <div className={`font-medium text-base ${isNegative ? "text-red-600" : "text-emerald-600"}`}>
                                    Variance: {diffValue >= 0 ? "+" : ""}
                                    {diffValue.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-gray-500 text-sm">No variance recorded</div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
};

export default VaultBagsDrawer;
