// ReconcileStart.jsx
import { useState, useEffect } from "react";
import CustomModal from "../../global/modal/CustomModal";
import { CompleteReconciliation, StartReconciliation } from "../../../services/Reconcile";
import { GetBagByBagId } from "../../../services/Vault";
import { BarcodeScannerModal } from "../../../pages/verifications/BarcodeScannerModal";
import dayjs from "dayjs";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, totalVariance, totalCounted, totalExpected }) => {
  const [resolutionReason, setResolutionReason] = useState("");
  const [requiresEscalation, setRequiresEscalation] = useState(false);
  const [varianceType, setVarianceType] = useState("unknown");
  const [error, setError] = useState("");

  const isVariance = totalVariance !== 0;
  const varianceText = isVariance ? (totalVariance < 0 ? "Shortage" : "Surplus") : "Matched";
  const varianceColor = totalVariance === 0 ? "text-green-600" : totalVariance < 0 ? "text-red-600" : "text-amber-600";

  const handleSubmit = () => {
    if (isVariance && !resolutionReason.trim()) {
      setError("Resolution reason is required when there is overall variance.");
      return;
    }
    setError("");

    onConfirm({
      resolution_reason: resolutionReason.trim() || null,
      requires_escalation: requiresEscalation,
      variance_type: varianceType,
    });
  };

  if (!isOpen) return null;

  return (
    <CustomModal isCloseModal={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Confirm Reconciliation Completion</h2>

        <div className="space-y-5 mb-6 text-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Expected</p>
              <p className="text-lg font-semibold">{totalExpected.toLocaleString()} BDT</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Counted</p>
              <p className="text-lg font-semibold">{totalCounted.toLocaleString()} BDT</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Variance</p>
              <p className={`text-lg font-bold ${varianceColor}`}>
                {totalVariance >= 0 ? "+" : ""}
                {totalVariance.toLocaleString()} BDT
              </p>
            </div>
          </div>

          <p className={`text-center text-2xl font-bold ${varianceColor}`}>{varianceText}</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Overall Resolution Reason {isVariance ? <span className="text-red-600">*</span> : <span className="text-gray-400">(optional)</span>}
            </label>
            <textarea
              rows={3}
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              value={resolutionReason}
              onChange={(e) => {
                setResolutionReason(e.target.value);
                setError("");
              }}
              placeholder="Final notes or explanation for the overall result..."
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-xl transition">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 rounded-xl transition">
            Confirm & Proceed
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

const BagNoteModal = ({ isOpen, onClose, bagBarcode, onNoteSaved }) => {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!note.trim()) {
      setError("A reason is required when there is a variance on this bag.");
      return;
    }
    setError("");
    onNoteSaved(note.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <CustomModal isCloseModal={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md mx-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Variance Detected</h3>
        <p className="text-gray-600 mb-5">
          Bag <strong>{bagBarcode}</strong> has a difference. Please explain why.
        </p>

        <textarea
          rows={4}
          autoFocus
          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setError("");
          }}
          placeholder="Enter reason for shortage or surplus (required)..."
        />

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        <div className="mt-6 flex gap-4">
          <button onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl transition">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition">
            Save & Continue
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

const OtpModal = ({ isOpen, onClose, onVerify, errorMessage }) => {
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = () => {
    if (otp.trim().length < 4) {
      setLocalError("Please enter a valid OTP");
      return;
    }
    setLocalError("");
    onVerify(otp.trim());
  };

  if (!isOpen) return null;

  return (
    <CustomModal isCloseModal={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Security Verification</h3>
        <p className="text-gray-600 mb-6">Enter the OTP sent to your phone/email</p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          pattern="\d*"
          className="w-full text-center text-3xl tracking-[0.5em] border border-gray-400 rounded-lg py-5 mb-5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="------"
        />

        {(errorMessage || localError) && <p className="text-red-600 mb-5 text-sm">{errorMessage || localError}</p>}

        <button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition mb-4">
          Verify & Complete
        </button>

        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm underline">
          Cancel
        </button>
      </div>
    </CustomModal>
  );
};

const ReconcileStart = ({ isCloseModal, selectedReconcile,refech }) => {
  const [step, setStep] = useState("start");
  const [currentBagIndex, setCurrentBagIndex] = useState(0);
  const [scanned, setScanned] = useState(false);
  const [expectedDenoms, setExpectedDenoms] = useState({});
  const [expectedAmount, setExpectedAmount] = useState(0);
  const [countedDenoms, setCountedDenoms] = useState({});
  const [variances, setVariances] = useState([]); // { bag_id, difference, note?, counted_amount, counted_denominations }
  const [pendingDifference, setPendingDifference] = useState(null);
  const [message, setMessage] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showBagNoteModal, setShowBagNoteModal] = useState(false);
  const [finishResolutionData, setFinishResolutionData] = useState(null);
  const [otpError, setOtpError] = useState("");

  const bags = selectedReconcile.vault.bags.sort((a, b) => a.id - b.id);
  const currentBag = bags[currentBagIndex] || {};

  const expectedBarcodes = [currentBag.barcode?.trim(), currentBag.bag_identifier_barcode?.trim()].filter(Boolean);

  const startReconciliation = async () => {
    try {
      await StartReconciliation(selectedReconcile.id);
      setStep("process");
      setMessage("Reconciliation started. Vault and bags are now locked.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to start reconciliation.");
    }
  };

  const fetchBagDetails = async () => {
    try {
      const res = await GetBagByBagId(currentBag.id);
      const bag = res.data || res;

      let denoms = {};
      try {
        denoms = JSON.parse(bag.denominations || "{}");
      } catch {}

      setExpectedDenoms(denoms);
      setExpectedAmount(parseFloat(bag.current_amount) || 0);
      setScanned(false);
      setShowScanner(false);
      setCountedDenoms({});
      setMessage("");
    } catch (err) {
      setMessage("Could not load bag details. Please try again.");
    }
  };

  useEffect(() => {
    if (step === "process" && currentBag?.id) {
      fetchBagDetails();
    }
  }, [step, currentBagIndex]);

  const handleScanSuccess = (scannedCode) => {
    const code = scannedCode.trim();
    if (expectedBarcodes.includes(code)) {
      setScanned(true);
      setMessage("Bag scanned successfully ✓");
    } else {
      setMessage(`Scanned barcode does not match.\nExpected: ${expectedBarcodes.join(" or ")}`);
    }
    setShowScanner(false);
  };

  const handleDenomChange = (denom, value) => {
    setCountedDenoms((prev) => ({
      ...prev,
      [denom]: value === "" ? "" : Number(value),
    }));
  };

  const getInputBgClass = (denom) => {
    const expectedQty = expectedDenoms[denom] || 0;
    const actualQty = countedDenoms[denom];
    if (actualQty === undefined || actualQty === "") return "bg-gray-50 border-gray-300";
    return actualQty === expectedQty ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400";
  };

  const calculateCountedAmount = () => Object.entries(countedDenoms).reduce((sum, [d, q]) => sum + Number(d) * (Number(q) || 0), 0);

  const submitCount = () => {
    const countedAmount = calculateCountedAmount();
    const difference = countedAmount - expectedAmount;

    const existingEntry = variances.find((v) => v.bag_id === currentBag.id);
    const existingNote = existingEntry?.note || "";

    if (difference !== 0 && !existingNote.trim()) {
      if (pendingDifference === null) {
        setPendingDifference(difference);
        setShowBagNoteModal(true);
      }
      return;
    }

    // Save full data for this bag
    setVariances((prev) => {
      const filtered = prev.filter((v) => v.bag_id !== currentBag.id);
      return [
        ...filtered,
        {
          bag_id: currentBag.id,
          difference,
          note: existingNote || null,
          counted_amount: countedAmount,
          counted_denominations: { ...countedDenoms }, // copy current input
        },
      ];
    });

    setMessage(difference === 0 ? "Perfect match!" : `Variance: ${difference > 0 ? "+" : ""}${difference.toLocaleString()} BDT`);

    setPendingDifference(null);

    if (currentBagIndex < bags.length - 1) {
      setCurrentBagIndex((prev) => prev + 1);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleNoteSaved = (note) => {
    // Save note temporarily (difference will be updated in next submitCount)
    setVariances((prev) => {
      const filtered = prev.filter((v) => v.bag_id !== currentBag.id);
      return [
        ...filtered,
        {
          bag_id: currentBag.id,
          difference: pendingDifference || 0,
          note,
          counted_amount: 0, // temporary
          counted_denominations: {},
        },
      ];
    });

    setShowBagNoteModal(false);

    // Auto trigger submitCount — now note exists → will save full data
    setTimeout(() => {
      submitCount();
    }, 120);
  };

  const handleConfirmFinish = (resolutionData) => {
    setFinishResolutionData(resolutionData);
    setShowConfirmModal(false);
    setShowOtpModal(true);
    setOtpError("");
  };

  const handleVerifyOtp = async (otp) => {
    try {
      // Replace with real OTP check in production
      const isValid = otp === "123456";

      if (!isValid) {
        setOtpError("Invalid OTP. Please try again.");
        return;
      }

      const totalExpected = bags.reduce((sum, b) => sum + parseFloat(b.current_amount || 0), 0);

      const totalCounted = variances.reduce((sum, v) => sum + (v.counted_amount || 0), 0);

      const totalVariance = totalCounted - totalExpected;

      await CompleteReconciliation(selectedReconcile.id, {
        ...finishResolutionData,
        counted_balance: totalCounted,
        variances_bags: variances,
        total_variance: totalVariance,
      });

      setMessage("Reconciliation completed successfully.");
      setStep("finished");
      setShowOtpModal(false);
      isCloseModal();
      refech();
    } catch (err) {
      setOtpError(err?.response?.data?.message || "Failed to complete reconciliation.");
    }
  };

  return (
    <CustomModal isCloseModal={isCloseModal}>
      {step === "start" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Reconciliation Details</h2>

          <div className="space-y-3 text-gray-700">
            <p>
              <strong>ID:</strong> {selectedReconcile.reconcile_tran_id}
            </p>
            <p>
              <strong>Period:</strong> {dayjs(selectedReconcile.from_date).format("DD MMM, YYYY")} → {dayjs(selectedReconcile.to_date).format("DD MMM, YYYY")}
            </p>
            <p>
              <strong>Vault:</strong> {selectedReconcile.vault?.name}
            </p>
            <p>
              <strong>Bags to reconcile:</strong> {bags.length}
            </p>
          </div>

          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <strong>Warning:</strong> Starting this process will lock the CashIn/CashOut of the vault and all bags until completion.
          </div>

          <button
            onClick={startReconciliation}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Start Reconciliation
          </button>
        </div>
      )}

      {step === "process" && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Bag {currentBagIndex + 1} of {bags.length}
          </h2>

          <div className={`${scanned ? "bg-green-50 border-green-200" : "bg-gray-50 border-red-200"} p-4 rounded-xl mb-6 border space-y-1`}>
            <p>
              <strong>Barcode:</strong> {currentBag.barcode}
            </p>
            <p>
              <strong>Identifier:</strong> {currentBag.bag_identifier_barcode || "—"}
            </p>
            <div className="flex items-center justify-between">
              <p>
                <strong>Expected Amount:</strong> {expectedAmount.toLocaleString()} BDT
              </p>
              <p>
                <strong>Counted Amount:</strong>
                {calculateCountedAmount().toLocaleString()} BDT
              </p>
            </div>
          </div>

          {Object.keys(expectedDenoms).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Expected Denominations</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(expectedDenoms)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([denom, qty]) => (
                    <div key={denom} className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                      {denom}৳ × {qty} = <strong>{(Number(denom) * qty).toLocaleString()}</strong>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {!scanned ? (
            <div className="text-center py-10">
              <button
                onClick={() => setShowScanner(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-16 rounded-xl shadow transition text-lg"
              >
                Scan Bag
              </button>
              {message && <p className="mt-6 text-red-600 whitespace-pre-line">{message}</p>}
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-lg text-gray-800 mb-3">Enter Actual Count</h3>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {Object.keys(expectedDenoms)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((denom) => {
                    const expectedQty = expectedDenoms[denom] || 0;
                    const actualQty = countedDenoms[denom] ?? "";
                    const totalValue = Number(denom) * (Number(actualQty) || 0);

                    return (
                      <div key={denom} className={`grid grid-cols-3 items-center gap-3 p-3 rounded-lg border ${getInputBgClass(denom)}`}>
                        <div className="font-medium text-gray-800">{denom}৳</div>
                        <input
                          type="number"
                          min="0"
                          className="border border-gray-400 rounded py-2 px-3 text-center bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          value={actualQty}
                          onChange={(e) => handleDenomChange(denom, e.target.value)}
                        />
                        <div className="text-right font-medium">{totalValue.toLocaleString()}</div>
                      </div>
                    );
                  })}

                {Object.keys(expectedDenoms).length === 0 && (
                  <p className="col-span-2 text-center text-gray-500 py-6">No denomination data → enter total manually if needed</p>
                )}
              </div>

              <button
                onClick={submitCount}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition"
              >
                Submit & Continue
              </button>
            </>
          )}

          <BarcodeScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onScanned={handleScanSuccess} />
        </div>
      )}

      {step === "finished" && (
        <div className="bg-white rounded-2xl p-10 max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-green-700 mb-4">Reconciliation Completed</h2>
          <p className="text-gray-600">All bags have been successfully processed.</p>
          {message && <p className="mt-4 text-blue-600">{message}</p>}
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmFinish}
        totalVariance={variances.reduce((sum, v) => sum + v.difference, 0)}
        totalCounted={variances.reduce((sum, v) => sum + (v.counted_amount || 0), 0)}
        totalExpected={bags.reduce((sum, b) => sum + parseFloat(b.current_amount || 0), 0)}
      />

      <OtpModal isOpen={showOtpModal} onClose={() => setShowOtpModal(false)} onVerify={handleVerifyOtp} errorMessage={otpError} />

      <BagNoteModal
        isOpen={showBagNoteModal}
        onClose={() => {
          setShowBagNoteModal(false);
          setPendingDifference(null);
        }}
        bagBarcode={currentBag?.barcode || "—"}
        onNoteSaved={handleNoteSaved}
      />
    </CustomModal>
  );
};

export default ReconcileStart;
