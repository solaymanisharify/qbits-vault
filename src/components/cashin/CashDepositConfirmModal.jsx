import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineSearch, AiOutlineDown, AiOutlineCheck } from "react-icons/ai";
import { GetVaults } from "../../services/Vault";
import { CreateCashIn } from "../../services/Cash";

export default function CashDepositConfirmModal({ amounts,selectedRows, showConfirmModal, setShowConfirmModal, totalEnteredAmount, denominations, onConfirm }) {
  const [selectedVault, setSelectedVault] = useState(null);
  const [selectedBag, setSelectedBag] = useState(null);
  const [availableBags, setAvailableBags] = useState([]);
  const [vaults, setVaults] = useState([]);

  // Search states
  const [vaultSearch, setVaultSearch] = useState("");
  const [bagSearch, setBagSearch] = useState("");

  // Dropdown open states
  const [vaultOpen, setVaultOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);

  const vaultRef = useRef(null);
  const bagRef = useRef(null);

  // fetch all vaults
  const fetchVaultData = async () => {
    try {
      await GetVaults().then((res) => {
        setVaults(res?.data);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchVaultData();
  }, []);

  console.log({ vaults });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (vaultRef.current && !vaultRef.current.contains(e.target)) setVaultOpen(false);
      if (bagRef.current && !bagRef.current.contains(e.target)) setBagOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load bags when vault selected
  useEffect(() => {
    if (selectedVault) {
      const bags = selectedVault.total_bags || [];
      setAvailableBags(bags);
      setSelectedBag(null);
    } else {
      setAvailableBags([]);
    }
  }, [selectedVault]);

  // Filter vaults
  const filteredVaults = vaults.filter(
    (v) => v.name.toLowerCase().includes(vaultSearch.toLowerCase()) || v.vault_id.toLowerCase().includes(vaultSearch.toLowerCase())
  );

  // Filter bags
  const filteredBags = availableBags.filter((bag) => {
    const search = bagSearch.toLowerCase();
    return bag.barcode?.toLowerCase().includes(search) || bag.rack_number?.toString().includes(search);
  });

  const handleConfirm = async () => {
    if (!selectedVault || !selectedBag) {
      alert("Please select both vault and bag");
      return;
    }

    console.log({ selectedBag, selectedVault });
    console.log({ totalEnteredAmount, denominations, selectedRows });

    // make a array for orders there map from selected rows there field will be order_id,total_cash_to_deposit,total_cash_in_amount
    const orders = selectedRows.map((row) => ({
      id: row.id,
      order_id: row.order_id,
      total_cash_to_deposit: row?.total_cash_to_deposit,
      total_cash_in_amount: amounts[row.id] || 0,
    }));

    console.log({orders})

    try {
      const res = await CreateCashIn({
        vault_id: selectedVault.id,
        bag_barcode: selectedBag.barcode,
        total_amount: totalEnteredAmount,
        denominations: denominations,
        orders: orders,
      });

      console.log({ res });
    } catch (error) {}
    // onConfirm({ vault: selectedVault, bag: selectedBag });
    // setShowConfirmModal(false);
  };

  if (!showConfirmModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowConfirmModal(false)}
        className="absolute inset-0"
      />

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative bg-[#1b1e3a] border border-[#353857] rounded-2xl p-10 max-w-2xl w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-3xl font-bold text-white mb-8 text-center">Confirm Cash In</h3>

        {/* Vault Select */}
        <div className="mb-6" ref={vaultRef}>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Vault <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div
              onClick={() => setVaultOpen(!vaultOpen)}
              className="w-full px-5 py-2 bg-[#24283f] border border-[#353857] rounded-lg flex items-center justify-between cursor-pointer hover:border-cyan-500 transition"
            >
              {selectedVault ? (
                <div className="flex items-center gap-2">
                  <p className="text-zinc-300">{selectedVault.name}</p>
                  <p className="text-cyan-400 text-sm font-mono">{selectedVault.vault_id}</p>
                </div>
              ) : (
                <span className="text-gray-500">Choose a vault...</span>
              )}
              <AiOutlineDown className={`w-4 h-3 text-gray-400 transition-transform ${vaultOpen ? "rotate-180" : ""}`} />
            </div>

            <AnimatePresence>
              {vaultOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full bg-[#1b1e3a] border border-[#353857] rounded-lg shadow-2xl z-10 overflow-hidden"
                >
                  <div className="p-3 border-b border-[#353857]">
                    <div className="flex items-center gap-3 bg-[#24283f] rounded-lg px-4 py-2">
                      <AiOutlineSearch className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search vault..."
                        value={vaultSearch}
                        onChange={(e) => setVaultSearch(e.target.value)}
                        className="w-full bg-transparent text-white outline-none"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto">
                    {filteredVaults.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No vaults found</p>
                    ) : (
                      filteredVaults.map((vault) => (
                        <div
                          key={vault.id}
                          onClick={() => {
                            setSelectedVault(vault);
                            setVaultOpen(false);
                            setVaultSearch("");
                          }}
                          className="px-5 py-4 hover:bg-[#1f2139] cursor-pointer transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-zinc-300">{vault.name}</p>
                            <p className="text-cyan-400 text-sm font-mono">{vault.vault_id}</p>
                          </div>
                          {selectedVault?.id === vault.id && <AiOutlineCheck className="w-5 h-5 text-cyan-400" />}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bag Select */}
        <div className="mb-8" ref={bagRef}>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Bag <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div
              onClick={() => selectedVault && setBagOpen(!bagOpen)}
              className={`w-full px-5 py-2 bg-[#24283f] border rounded-lg flex items-center justify-between transition ${
                !selectedVault ? "opacity-50 cursor-not-allowed border-[#353857]" : "cursor-pointer hover:border-cyan-500 border-[#353857]"
              }`}
            >
              {selectedBag ? (
                <div className="flex items-center gap-2">
                  <p className="text-white font-mono">{selectedBag.barcode}</p>
                  <p className="text-gray-400 text-sm">Rack: {selectedBag.rack_number}</p>
                </div>
              ) : (
                <span className="text-gray-500">{selectedVault ? "Choose a bag..." : "First select a vault"}</span>
              )}
              <AiOutlineDown className={`w-4 h-3 text-gray-400 transition-transform ${bagOpen ? "rotate-180" : ""}`} />
            </div>

            <AnimatePresence>
              {bagOpen && selectedVault && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full bg-[#1b1e3a] border border-[#353857] rounded-lg shadow-2xl z-10 overflow-hidden"
                >
                  <div className="p-3 border-b border-[#353857]">
                    <div className="flex items-center gap-3 bg-[#24283f] rounded-lg px-4 py-2">
                      <AiOutlineSearch className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by code or rack..."
                        value={bagSearch}
                        onChange={(e) => setBagSearch(e.target.value)}
                        className="w-full bg-transparent text-white outline-none"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto">
                    {filteredBags.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No bags available</p>
                    ) : (
                      filteredBags.map((bag) => (
                        <div
                          key={bag.id}
                          onClick={() => {
                            setSelectedBag(bag);
                            setBagOpen(false);
                            setBagSearch("");
                          }}
                          className="px-5 py-4 hover:bg-[#1f2139] cursor-pointer transition flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-cyan-400 font-mono">{bag.barcode}</p>
                            <p className="text-gray-400 text-sm">Rack: {bag.rack_number}</p>
                          </div>
                          {selectedBag?.id === bag.id && <AiOutlineCheck className="w-5 h-5 text-cyan-400" />}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="bg-[#24283f] rounded-xl p-6 mb-8 border border-[#353857]">
          <div className="flex justify-between text-lg">
            <span className="text-gray-300">Total Amount</span>
            <strong className="text-cyan-400">৳{totalEnteredAmount.toFixed(2)}</strong>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="px-8 py-3 text-red-400 border border-red-400/50 rounded-xl hover:bg-red-400/10 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedVault || !selectedBag}
            className="px-10 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Confirm Deposit
          </button>
        </div>
      </motion.div>
    </div>
  );
}
