// ReconcileStart.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import CustomModal from "../../global/modal/CustomModal";
import { StartReconciliation } from "../../../services/Reconcile";
import { GetBagByBagId } from "../../../services/Vault";
import { BarcodeScannerModal } from "../../../pages/verifications/BarcodeScannerModal";


const ReconcileStart = ({ isCloseModal, selectedReconcile }) => {
  const [step, setStep] = useState("start");
  const [currentBagIndex, setCurrentBagIndex] = useState(0);
  const [scanned, setScanned] = useState(false);
  const [expectedDenoms, setExpectedDenoms] = useState({});
  const [expectedAmount, setExpectedAmount] = useState(0);
  const [countedDenoms, setCountedDenoms] = useState({});
  const [variances, setVariances] = useState([]);
  const [message, setMessage] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const bags = selectedReconcile.vault.bags.sort((a, b) => a.id - b.id);
  const currentBag = bags[currentBagIndex];

  const expectedBarcodes = [currentBag.barcode?.trim(), currentBag.bag_identifier_barcode?.trim()].filter(Boolean);

  const startReconciliation = async () => {
    setStep("process");

    // try {
    //   await StartReconciliation(selectedReconcile.id);
    //   setStep("process");
    //   setMessage("Reconciliation started. Vault and bags are now locked.");
    // } catch (err) {
    //   setMessage(err?.response?.data?.message || "Failed to start reconciliation.");
    // }
  };

  const fetchBagDetails = async () => {
    try {
      const res = await GetBagByBagId(currentBag.id);
      const bag = res.data || res; // adjust depending on your service response shape

      let denoms = {};
      try {
        denoms = JSON.parse(bag.denominations || "{}");
      } catch (parseErr) {
        console.warn("Failed to parse denominations", parseErr);
      }

      setExpectedDenoms(denoms);
      setExpectedAmount(parseFloat(bag.current_amount) || 0);
      setScanned(false);
      setShowScanner(false);
      setCountedDenoms({});
      setMessage("");
    } catch (err) {
      console.error("Fetch bag error:", err);
      setMessage("Could not load bag details. Please try again.");
    }
  };

  useEffect(() => {
    if (step === "process") {
      fetchBagDetails();
    }
  }, [step, currentBagIndex]);

  const handleScanSuccess = (scannedCode) => {
    const code = scannedCode.trim();
    if (expectedBarcodes.includes(code)) {
      setScanned(true);
      setMessage("Bag scanned successfully ✓");
    } else {
      setMessage(`Scanned barcode "${code}" does not match expected bag.\nExpected: ${expectedBarcodes.join(" or ")}`);
    }
    setShowScanner(false);
  };

  const handleDenomChange = (denom, value) => {
    setCountedDenoms((prev) => ({
      ...prev,
      [denom]: value === "" ? "" : Number(value),
    }));
  };

  const submitCount = async () => {
    const countedAmount = Object.entries(countedDenoms).reduce((sum, [denom, qty]) => sum + Number(denom) * (Number(qty) || 0), 0);

    const difference = countedAmount - expectedAmount;

    try {
      await axios.post(`/api/reconciles/${selectedReconcile.id}/bags/${currentBag.id}/count`, {
        counted_amount: countedAmount,
        counted_denoms: countedDenoms,
        difference,
      });

      setVariances((prev) => [...prev, { bag_id: currentBag.id, difference }]);
      setCountedDenoms({});
      setMessage(difference === 0 ? "Perfect match!" : `Difference: ${difference > 0 ? "+" : ""}${difference.toLocaleString()} BDT`);

      if (currentBagIndex < bags.length - 1) {
        setCurrentBagIndex((prev) => prev + 1);
      } else {
        await finishReconciliation();
      }
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to submit count. Try again.");
    }
  };

  const finishReconciliation = async () => {
    const totalExpected = bags.reduce((sum, b) => sum + parseFloat(b.current_amount || 0), 0);

    const totalCounted = variances.reduce(
      (sum, v) => sum + (parseFloat(v.difference) + parseFloat(bags.find((b) => b.id === v.bag_id)?.current_amount || 0)),
      0,
    );

    const totalVariance = totalCounted - totalExpected;

    try {
      await axios.post(`/api/reconciles/${selectedReconcile.id}/finish`, {
        counted_balance: totalCounted,
        variance: totalVariance,
      });

      setMessage("Reconciliation completed successfully.");
      setStep("finished");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Error finalizing reconciliation.");
    }
  };

  return (
    <CustomModal isCloseModal={isCloseModal}>
      {step === "start" && (
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Reconciliation Details</h2>

          <div className="space-y-3 text-gray-700">
            <p>
              <strong>ID:</strong> {selectedReconcile.reconcile_tran_id}
            </p>
            <p>
              <strong>Period:</strong> {selectedReconcile.from_date} → {selectedReconcile.to_date}
            </p>
            <p>
              <strong>Vault:</strong> {selectedReconcile.vault?.name} – {selectedReconcile.vault?.address}
            </p>
            <p>
              <strong>Bags:</strong> {bags.length}
            </p>
          </div>

          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <strong>Warning:</strong> Starting this process will <strong>lock</strong> the vault and all bags (no cash-in/out allowed) until finished.
          </div>

          <button
            onClick={startReconciliation}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow transition"
          >
            Start Reconciliation
          </button>
        </div>
      )}

      {step === "process" && (
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Bag {currentBagIndex + 1} of {bags.length}
          </h2>

          <div className="bg-gray-50 p-4 rounded-xl mb-5 space-y-1 text-gray-700">
            <p>
              <strong>Barcode:</strong> {currentBag.barcode}
            </p>
            <p>
              <strong>Identifier:</strong> {currentBag.bag_identifier_barcode}
            </p>
            <p>
              <strong>Rack:</strong> {currentBag.rack_number}
            </p>
            <p className="font-semibold text-lg mt-2">Expected: {expectedAmount.toLocaleString()} BDT</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Expected Denominations:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(expectedDenoms)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([denom, qty]) => (
                  <div key={denom} className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{denom}</div>
                    <div>
                      × {qty} = <strong>{(Number(denom) * qty).toLocaleString()}</strong>
                    </div>
                  </div>
                ))}

              {Object.keys(expectedDenoms).length === 0 && <p className="text-gray-500 col-span-3 text-center py-4">No denomination breakdown available</p>}
            </div>
          </div>

          {!scanned ? (
            <div className="text-center py-8">
              <button
                onClick={() => setShowScanner(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-12 rounded-xl shadow-lg transition text-lg"
              >
                Scan Bag
              </button>

              {message && <p className="mt-6 text-red-600 whitespace-pre-line">{message}</p>}
            </div>
          ) : (
            <div>
              <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-xl mb-6 font-medium text-center">Bag verified successfully ✓</div>

              <h3 className="font-semibold text-lg mb-4 text-gray-800">Enter Actual Count</h3>

              <div className="space-y-4">
                {Object.keys(expectedDenoms)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((denom) => (
                    <div key={denom} className="flex items-center gap-4">
                      <label className="w-32 font-medium text-gray-700">{denom} BDT</label>
                      <input
                        type="number"
                        min="0"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                        value={countedDenoms[denom] ?? ""}
                        onChange={(e) => handleDenomChange(denom, e.target.value)}
                      />
                      <span className="text-right text-gray-600 min-w-[90px]">{(Number(denom) * (countedDenoms[denom] || 0)).toLocaleString()}</span>
                    </div>
                  ))}

                {Object.keys(expectedDenoms).length === 0 && (
                  <p className="text-gray-500 text-center py-6">No denominations → enter total manually if needed</p>
                )}
              </div>

              <button
                onClick={submitCount}
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow transition"
              >
                Submit & Continue
              </button>
            </div>
          )}

          {/* Scanner Modal */}
          <BarcodeScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onScanned={handleScanSuccess} />
        </div>
      )}

      {step === "finished" && (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-green-700 mb-4">Reconciliation Completed</h2>
          <p className="text-gray-600">All bags have been processed.</p>
        </div>
      )}

      {message && step !== "process" && step !== "finished" && (
        <p className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center text-blue-700">{message}</p>
      )}
    </CustomModal>
  );
};

export default ReconcileStart;
