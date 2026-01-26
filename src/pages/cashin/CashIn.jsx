import { useCallback, useEffect, useState } from "react";
import DataTable from "../../components/global/dataTable/DataTable";
import { GetOrders } from "../../services/Orders";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import JsBarcode from "jsbarcode";
import CashDepositConfirmModal from "../../components/cashin/CashDepositConfirmModal";
import { GetCashIn } from "../../services/Cash";
import VerifierAvatars from "../../components/global/verifierAvatars.jsx/VerifierAvatars";
import { selectIsLockedForOperations } from "../../store/checkReconcile";
import { useSelector } from "react-redux";

/*******  1a95057d-95d6-49d7-bca0-0934b457d050  *******/
const CashIn = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const step = parseInt(searchParams.get("step") || "0");
  const [isCashIn, setIsCashIn] = useState(step >= 1);
  const [cashIns, setCashIns] = useState([]);
  const [cashInsLoaded, setCashInsLoaded] = useState(false);

  const [selectedRows, setSelectedRows] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchTerm = searchParams.get("search") || "";
  const perPage = parseInt(searchParams.get("per_page") || "10");
  const [loading, setLoading] = useState(false);

  // Step 2: Amounts entered per order
  const [amounts, setAmounts] = useState({}); // { orderId: amount }
  const isLocked = useSelector(selectIsLockedForOperations);


  // Step 3: Denominations
  const [denominations, setDenominations] = useState({
    1000: 0,
    500: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
  });

  // Final transaction
  const [transactionId, setTransactionId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    const saved = localStorage.getItem("cashInWizard");
    if (saved) {
      const data = JSON.parse(saved);
      setSelectedRows(data.selectedRows || []);
      setAmounts(data.amounts || {});
      setDenominations(data.denominations || denominations);
    }
  }, []);

  // Save data on change
  useEffect(() => {
    if (step > 1) {
      localStorage.setItem(
        "cashInWizard",
        JSON.stringify({
          selectedRows,
          amounts,
          denominations,
        }),
      );
    }
  }, [selectedRows, amounts, denominations, step]);

  // Sync URL step
  useEffect(() => {
    setSearchParams({ step: step.toString() });
    setIsCashIn(step >= 1);
  }, [step]);

  useEffect(() => {
    if (step === 2) {
      const newAmounts = {};
      selectedRows.forEach((row) => {
        // Use total_cash_to_deposit as the vault amount (auto-filled)
        newAmounts[row.id] = row.total_cash_to_deposit || 0;
      });
      setAmounts(newAmounts);
    }
  }, [step, selectedRows]);

  const fetchCashInsData = () => {
    setLoading(true);
    GetCashIn()
      .then((res) => {
        setCashIns(res?.data?.data || []);
        setCashInsLoaded(true);
        setPaginationData(res?.data?.data || {});
      })
      .catch((error) => {
        console.error("Error fetching cash-ins:", error);
        setCashIns([]);
        setCashInsLoaded(true);
        setPaginationData({});
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchOrders = useCallback(async () => {
    if (step !== 1 || !cashInsLoaded) return;

    setLoading(true);
    try {
      // Get all order_ids already in any cash-in
      const excludedOrderIds = cashIns
        .flatMap((cashIn) => cashIn.orders || [])
        .map((order) => order.order_id)
        .filter(Boolean);

      const res = await GetOrders({
        page: currentPage,
        search: searchTerm || undefined,
        per_page: perPage,
        exclude_order_ids: excludedOrderIds.length > 0 ? excludedOrderIds : undefined,
      });

      const orders = res?.data?.orders || [];
      const pagination = res?.data?.pagination || {};

      setOrders(orders);
      setPaginationData(pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setPaginationData({});
    } finally {
      setLoading(false);
    }
  }, [step, cashInsLoaded, cashIns, currentPage, searchTerm, perPage]);

  useEffect(() => {
    fetchCashInsData();
  }, [step]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", page.toString());
      return newParams;
    });
  };

  const handleSearch = (term) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (term.trim()) {
        newParams.set("search", term.trim());
        newParams.set("page", "1"); // reset to page 1
      } else {
        newParams.delete("search");
      }
      return newParams;
    });
  };

  const totalEnteredAmount = selectedRows.reduce((sum, row) => {
    return sum + (parseFloat(amounts[row.id]) || 0);
  }, 0);

  const totalDenominationAmount = Object.entries(denominations).reduce((sum, [value, count]) => {
    return sum + parseInt(value) * parseInt(count || 0);
  }, 0);

  const generateTransactionId = () => {
    return `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0")}`;
  };

  const handleNext = () => {
    if (step === 1 && selectedRows.length === 0) {
      alert("Please select at least one order");
      return;
    }
    if (step === 2) {
      const hasAmount = selectedRows.some((row) => parseFloat(amounts[row.id]) > 0);
      if (!hasAmount) {
        alert("Please enter amount for at least one order");
        return;
      }
    }
    setSearchParams({ step: step + 1 });
  };

  const handleBack = () => {
    if (step > 1) {
      setSearchParams({ step: step - 1 });
    } else if (step === 1) {
      setSearchParams({ step: step - 1 });
    } else {
      localStorage.removeItem("cashInWizard");
      setSelectedRows([]);
      setAmounts({});
      setDenominations({
        1000: 0,
        500: 0,
        100: 0,
        50: 0,
        20: 0,
        10: 0,
        5: 0,
        2: 0,
        1: 0,
      });
      setTransactionId(null);
    }
  };

  const handleFinish = () => {
    if (Math.abs(totalDenominationAmount - totalEnteredAmount) > 0.01) {
      alert(`Denomination total (৳${totalDenominationAmount}) must match entered amount (৳${totalEnteredAmount})`);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmAndComplete = () => {
    setTransactionId(generateTransactionId());
    setShowConfirmModal(false);
    setSearchParams({ step: 4 });
  };

  const handlePrint = () => {
    window.print();
  };

  const columnsStep0 = [
    {
      title: "Vault",
      key: "vault_id",
      className: "w-20",
      render: (row) => <span className="font-mono text-cyan-400">{row.vault?.vault_id}</span>,
    },
    {
      title: "Bag",
      key: "customer.name",
      className: "w-32",
      render: (row) => (
        <span className="">
          {row?.bags?.barcode}-RN{row?.bags?.rack_number}
        </span>
      ),
    },
    {
      title: "Tran Id",
      key: "tran_id",
      className: "w-32",
      render: (row) => <span className="">{row?.tran_id}</span>,
    },
    {
      title: "Order Ids",
      key: "orders.order_id",
      className: "w-[250px]",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row?.orders?.map((order, index) => (
            <span key={index} className="text-sm">
              {order?.order_id},
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Amount",
      key: "cash_in_amount",
      className: "w-20",
      render: (row) => <span className="">{row?.cash_in_amount}</span>,
    },

    {
      title: "Requested at",
      key: "created_at",
      className: "w-34",
      render: (row) => <span className="">{dayjs(row.created_at).format("DD MMM, YYYY")}</span>,
    },
    {
      title: "Vault Verifier",
      key: "required_verifiers",
      className: "w-40",
      render: (row) => {
        const requiredVerifiers = row.required_verifiers || [];

        return <VerifierAvatars requiredVerifiers={requiredVerifiers} />;
      },
    },
    {
      title: "Verifier Approver",
      key: "required_verifiers",
      className: "w-40",
      render: (row) => {
        const requiredApprovers = row.required_approvers || [];

        return <VerifierAvatars requiredVerifiers={requiredApprovers} />;
      },
    },
    {
      title: "Verifiers",
      key: "created_at",
      className: "w-20",
      render: (row) => (
        <span
          className={`capitalize text-xs ${
            row?.verifier_status === "pending" ? "bg-yellow-50 border border-yellow-200 text-yellow-600" : "bg-green-50 border border-green-200 text-green-500"
          } px-2.5 py-1  rounded-full`}
        >
          {row?.verifier_status}
        </span>
      ),
    },
    {
      title: "Approvers",
      key: "status",
      className: "w-32",
      render: (row) => (
        <span
          className={`capitalize text-xs ${
            row?.status === "pending" ? "bg-yellow-50 border border-yellow-200 text-yellow-600" : "bg-green-50 border border-green-200 text-green-500"
          } px-2.5 py-1  rounded-full`}
        >
          {row?.status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "actions",
      className: "w-24 ",
      render: (row) => {
        const handleEdit = (e) => {
          e.stopPropagation();
          // Your edit logic her
          // e.g., open edit modal with row data
          // setEditData(row);
          // setIsEditModalOpen(true);
        };

        const handleDelete = (e) => {
          e.stopPropagation();
          // Your delete logic here
          // e.g., show confirm dialog then call API
          if (window.confirm(`Delete vault "${row.name}"?`)) {
            // DeleteVault(row.id).then(() => fetchVaultData());
          }
        };

        return (
          <div className="flex items-center justify-center gap-3 py-2">
            {/* Edit Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="p-2 rounded-lg bg-blue-500/10 cursor-pointer hover:bg-blue-500/20 text-blue-600 border border-blue-400/20 transition-all "
              aria-label="Edit vault"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </motion.button>

            {/* Delete Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="p-2 rounded-lg bg-red-500/10 cursor-pointer hover:bg-red-500/20 text-red-600 border border-red-400/20 transition-all "
              aria-label="Delete vault"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </motion.button>
          </div>
        );
      },
    },
  ];
  const columnsStep1 = [
    {
      title: "Order ID",
      key: "order_id",
      className: "w-32",
      render: (row) => <span className="font-mono text-cyan-400">{row.order_id}</span>,
    },
    {
      title: "Customer",
      key: "customer.name",
      className: "w-40",
      render: (row) => <span className="">{row?.customer?.name}</span>,
    },
    {
      title: "Total",
      key: "payable_amount",
      className: "w-40",
      render: (row) => <span className="">{row?.payable_amount}</span>,
    },
    {
      title: "Paid",
      key: "paid_amount",
      className: "w-40",
      render: (row) => <span className="">{row?.paid_amount}</span>,
    },
    {
      title: "Online Pay",
      key: "paid_amount",
      className: "w-40",
      render: (row) => <span className="">{row?.paid_amount - row?.total_cash_to_deposit}</span>,
    },
    {
      title: "Received ST",
      key: "paid_amount",
      className: "w-40",
      render: (row) => <span className="">{row?.total_cash_to_deposit}</span>,
    },

    {
      title: "Received Date",
      key: "created_at",
      className: "w-40",
      render: (row) => <span className="">{dayjs(row.created_at).format("DD MMM, YYYY")}</span>,
    },
    {
      title: "Select",
      key: "selection",
      className: "w-40 ",
      render: (row) => {
        const isSelected = selectedRows.some((selected) => selected.id === row.id);

        const toggleSelection = (e) => {
          e.stopPropagation();
          setSelectedRows((prev) => {
            const exists = prev.some((item) => item.id === row.id);
            if (exists) {
              return prev.filter((item) => item.id !== row.id);
            } else {
              return [...prev, row];
            }
          });
        };

        return (
          <div className="flex items-center justify-center ">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleSelection}
              className={`
                relative w-7 h-7 rounded-full flex items-center justify-center border  overflow-hidden
                transition-all duration-300 ease-out
                ${isSelected ? "bg-cyan-50 border-cyan-500" : "bg-transparent border border-gray-200 hover:border-sky-500 hover:shadow-md"}
              `}
              aria-label={isSelected ? "Deselect row" : "Select row"}
            >
              <motion.div
                className="absolute inset-0 bg-cyan-500/20"
                initial={false}
                animate={{ scale: isSelected ? 1 : 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
              <motion.svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 relative z-10 pointer-events-none" initial={false}>
                <motion.path
                  d="M4 12L9 17L20 6"
                  stroke="blue"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: isSelected ? 1 : 0,
                    opacity: isSelected ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: "easeOut",
                    opacity: { duration: 0.15 },
                    pathLength: { delay: isSelected ? 0.1 : 0 },
                  }}
                />
              </motion.svg>
              <motion.div
                className="absolute inset-0 rounded-xl"
                whileTap={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.3) 10%, transparent 70%)",
                }}
              />
            </motion.button>
          </div>
        );
      },
    },
  ];

  const columnsStep2 = [
    {
      title: "Order ID",
      key: "order_id",
      className: "w-32",
      render: (row) => <span className="font-mono text-cyan-400">{row.order_id}</span>,
    },
    {
      title: "Cash To Deposit",
      key: "payable_amount",
      className: "w-40",
      render: (row) => <span className="">{row?.total_cash_to_deposit}</span>,
    },
    {
      title: "Cash To Vault",
      key: "amount",
      className: "w-40",
      render: (row) => (
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          className=" px-4 py-2 bg-transparent rounded-lg text-gray-600 focus:outline-none "
          value={amounts[row.id] ?? row.total_cash_to_deposit ?? 0}
          // onChange={(e) => setAmounts({ ...amounts, [row.id]: e.target.value })}
        />
      ),
    },
  ];

  

  return (
    <div>
      <div className="flex items-center  justify-between p-2">
        <h1 className="text-lg font-semibold text-gray-600">
          {step === 0 && "Cash In List"}
          {step === 1 && "Orders List"}
          {step === 2 && "Enter Deposit Amounts"}
          {step === 3 && "Enter Denominations"}
          {step === 4 && "Transaction Complete"}
        </h1>
        <div className="flex items-center gap-4">
          {step === 1 && (
            <div
              onClick={handleBack}
              className="cursor-pointer transition-all duration-300 ease-in-out px-4 py-1 hover:bg-gray-50 backdrop-blur-xl rounded-lg overflow-hidden hover:text-black bg-transparent text-zinc-500 border border-zinc-100"
            >
              <p>Back</p>
            </div>
          )}

          {step === 0 && (
            <div
              onClick={handleNext}
              className={`cursor-pointer ${isLocked ? "hidden" : "flex"} transition-all duration-300 ease-in-out px-4 py-1 hover:bg-cyan-100 backdrop-blur-xl rounded-lg overflow-hidden hover:text-cyan-600 bg-cyan-50 text-cyan-500 border border-cyan-300`}
            >
              <p>Cash In</p>
            </div>
          )}
          {step > 1 && (
            <div
              onClick={handleBack}
              className="cursor-pointer transition-all duration-300 ease-in-out px-4 py-1 hover:bg-gray-100 backdrop-blur-xl rounded-lg overflow-hidden  bg-transparent text-zinc-300 border hover:text-zinc-500 border-zinc-200"
            >
              <p>Back</p>
            </div>
          )}

          {step === 1 && selectedRows.length > 0 && (
            <div
              onClick={handleNext}
              className="cursor-pointer transition-all duration-300 ease-in-out px-4 py-1 hover:bg-white/10 backdrop-blur-xl rounded-lg overflow-hidden hover:text-cyan-600 bg-cyan-50 text-cyan-300 border border-cyan-300"
            >
              <p>Next</p>
            </div>
          )}

          {step === 2 && (
            <div
              onClick={handleNext}
              className="cursor-pointer transition-all duration-300 ease-in-out px-4 py-1 hover:bg-white/10 backdrop-blur-xl rounded-lg overflow-hidden hover:text-gray-600 bg-cyan-500 text-white border border-cyan-500/50"
            >
              <p>Next</p>
            </div>
          )}

          {step === 3 && totalDenominationAmount === totalEnteredAmount && (
            <div
              onClick={handleFinish}
              className="cursor-pointer transition-all duration-300 ease-in-out px-4 py-1 hover:bg-cyan-500 backdrop-blur-xl rounded-lg overflow-hidden text-cyan-300 bg-cyan-50 border border-cyan-500/50 font-semibold"
            >
              <p>Finish</p>
            </div>
          )}
        </div>
      </div>

      {/* Step 0: All Cash In*/}
      {step === 0 && (
        <DataTable
          columns={columnsStep0}
          data={cashIns}
          changePage={handlePageChange}
          onSearch={handleSearch}
          paginationData={paginationData}
          selectedRows={selectedRows}
          loading={loading}
          setSelectedRows={setSelectedRows}
          className="h-[calc(100vh-120px)]"
        />
      )}
      {/* Step 1: Select Orders */}
      {step === 1 && (
        <DataTable
          columns={columnsStep1}
          data={orders}
          changePage={handlePageChange}
          onSearch={handleSearch}
          paginationData={paginationData}
          selectedRows={selectedRows}
          loading={loading}
          setSelectedRows={setSelectedRows}
          className="h-[calc(100vh-100px)]"
        />
      )}

      {/* Step 2: Enter Amounts */}
      {step === 2 && (
        <div>
          <div className="mb-4 text-cyan-400 font-medium">
            Total Selected: {selectedRows.length} orders | Total Amount: ৳{totalEnteredAmount.toFixed(2)}
          </div>
          <DataTable columns={columnsStep2} data={selectedRows} paginationData={{}} className="h-[calc(100vh-150px)]" />
        </div>
      )}

      {/* Step 3: Denominations */}
      {step === 3 && (
        <div className="bg-white p-4">
          <div className="max-w-4xl  mx-auto">
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[1000, 500, 100, 50, 20, 10].map((note) => (
                <div key={note} className="bg-cyan-50/20 border border-cyan-100 backdrop-blur-xl rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-gray-600 mb-3">৳{note}</div>

                  {/* Clean number input – no spinner, no default 0 */}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full text-gray-600 px-4 py-3 text-xl text-center bg-transparent border border-cyan-500/40 rounded-lg focus:border-cyan-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={denominations[note] > 0 ? denominations[note] : ""}
                    placeholder="0"
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = val === "" ? 0 : parseInt(val) || 0;
                      setDenominations({ ...denominations, [note]: num });
                    }}
                    onFocus={(e) => e.target.select()}
                  />

                  <div className="mt-2 text-zinc-400">= ৳{(note * (denominations[note] || 0)).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="text-center text-lg">
              <span className="text-zinc-400">Total Denomination: </span>
              <span className={totalDenominationAmount === totalEnteredAmount ? "text-cyan-600 font-medium" : "text-red-400"}>
                ৳{totalDenominationAmount.toFixed(2)}
              </span>
              {totalDenominationAmount !== totalEnteredAmount && <p className="text-red-400 text-sm mt-2">Must match ৳{totalEnteredAmount.toFixed(2)}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && transactionId && (
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-800/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-10"
          >
            <h2 className="text-4xl font-bold text-green-400 mb-6">Cash In Successful!</h2>
            <p className="text-xl text-zinc-300 mb-4">Transaction ID</p>
            <p className="text-3xl font-mono text-cyan-400 mb-10 tracking-wider">{transactionId}</p>

            {/* Code 128 Barcode */}
            <div className="flex justify-center mb-10">
              <canvas
                ref={(canvas) => {
                  if (canvas && transactionId) {
                    JsBarcode(canvas, transactionId, {
                      format: "CODE128",
                      width: 2.5,
                      height: 100,
                      displayValue: true,
                      fontSize: 20,
                      textMargin: 10,
                      font: "monospace",
                      background: "#18181b",
                      lineColor: "#67e8f9",
                      margin: 20,
                    });
                  }
                }}
              />
            </div>

            <div className="text-left bg-zinc-900/80 rounded-xl p-6 mb-8">
              <p className="text-lg">
                Orders: <strong>{selectedRows.length}</strong>
              </p>
              <p className="text-lg">
                Total Amount: <strong className="text-cyan-400">৳{totalEnteredAmount.toFixed(2)}</strong>
              </p>
              <p className="text-sm text-zinc-400 mt-4">Denominations:</p>
              {Object.entries(denominations)
                .filter(([_, count]) => count > 0)
                .map(([note, count]) => (
                  <p key={note} className="text-sm">
                    {note} TK × {count} = ৳{(note * count).toLocaleString()}
                  </p>
                ))}
            </div>

            <button onClick={handlePrint} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold text-lg transition">
              Print Receipt
            </button>
          </motion.div>
        </div>
      )}

      <CashDepositConfirmModal
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
        totalEnteredAmount={totalEnteredAmount}
        denominations={denominations}
        selectedRows={selectedRows}
        amounts={amounts}
      />
    </div>
  );
};

export default CashIn;
