import { useEffect, useState } from "react";
import DataTable from "../../components/global/dataTable/DataTable";
import { CreateVault, GetVaults } from "../../services/Vault";
import dayjs from "dayjs";
import CustomModal from "../../components/global/modal/CustomModal";
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { AnimatePresence, motion } from "framer-motion";
// import JsBarcode from "jsbarcode";
import { useForm } from "react-hook-form";
import { ArrowDownCircle, ArrowUpCircle, ChevronDown, ChevronRight, DollarSign, History, Package, X } from "lucide-react";
import JsBarcode from "jsbarcode";

const Vault = () => {
  const [vaults, setVaults] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [totalRacks, setTotalRacks] = useState("");
  const [rackErrors, setRackErrors] = useState({});
  const [bags, setBags] = useState([]);
  const [bagCounter, setBagCounter] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [vaultBagsDetails, setVaultBagsDetails] = useState([]);
  const [loadingBags, setLoadingBags] = useState(false);
  const [expandedBag, setExpandedBag] = useState(null); // for accordion

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const watchedTotalRacks = watch("total_racks");

  console.log({ selectedVault });

  useEffect(() => {
    setTotalRacks(watchedTotalRacks || "");
  }, [watchedTotalRacks]);

  // const generateBarcode = () => {
  //   const paddedNumber = String(bagCounter).padStart(2, "0");
  //   const barcode = `BAG${paddedNumber}`;
  //   setBagCounter((prev) => prev + 1); // Increment for next bag
  //   return barcode;
  // };
  const generateBagCodes = () => {
    const year = new Date().getFullYear();
    const paddedNumber = String(bagCounter).padStart(4, "0"); // 0001, 0002, etc.

    const humanBarcode = `BAG${String(bagCounter).padStart(2, "0")}`; // BAG01
    const scannableBarcode = `QBV-${year}-${paddedNumber}`; // QBV-2026-0001

    setBagCounter((prev) => prev + 1);

    return { humanBarcode, scannableBarcode };
  };

  // const addBag = () => {
  //   const newBag = {
  //     id: Date.now(),
  //     barcode: generateBarcode(),
  //     rack_number: "",
  //     current_amount: "",
  //   };
  //   setBags([...bags, newBag]);
  // };
  const addBag = () => {
    const { humanBarcode, scannableBarcode } = generateBagCodes();

    const newBag = {
      id: Date.now(),
      barcode: humanBarcode, // BAG01 (displayed)
      bag_identifier_barcode: scannableBarcode, // QBV-2026-0001 (for scanning)
      rack_number: "",
      current_amount: "",
    };
    setBags([...bags, newBag]);
  };
  const removeBag = (id) => {
    setBags(bags.filter((bag) => bag.id !== id));
  };

  const updateRack = (id, value) => {
    const cleaned = value.replace(/[^0-9]/g, ""); // Only numbers
    const num = cleaned ? parseInt(cleaned, 10) : 0;

    setBags((prev) => prev.map((bag) => (bag.id === id ? { ...bag, rack_number: cleaned } : bag)));

    // Validate against total_racks
    if (totalRacks && num > parseInt(totalRacks)) {
      setRackErrors((prev) => ({
        ...prev,
        [id]: `Rack cannot exceed ${totalRacks} (entered ${num})`,
      }));
    } else {
      setRackErrors((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  const fetchVaultData = async () => {
    const res = await GetVaults();
    setVaults(res?.data);
  };

  useEffect(() => {
    fetchVaultData();
  }, []);

  const updateBagAmount = (id, value) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    setBags((prev) => prev.map((bag) => (bag.id === id ? { ...bag, current_amount: cleaned } : bag)));
  };

  const openVaultDrawer = async (vault) => {
    setSelectedVault(vault);
    setDrawerOpen(true);
    setLoadingBags(true);
    setExpandedBag(null);

    // First, check if bags are already loaded with the vault
    if (vault.bags && vault.bags.length > 0) {
      setVaultBagsDetails(vault.bags);
      setLoadingBags(false);
      return;
    }

    // Otherwise, fetch from dedicated endpoint
    try {
      const res = await GetVaultBagDetails(vault.vault_id);
      // Adjust this based on your actual API response structure
      // Common patterns: res.data, res.data.bags, res.bags, etc.
      const bags = res?.data?.bags || res?.bags || [];
      setVaultBagsDetails(bags);
    } catch (err) {
      console.error("Failed to fetch bag details:", err);
      setVaultBagsDetails([]); // fallback to empty
    } finally {
      setLoadingBags(false);
    }
  };

  useEffect(() => {
    if (isOpenModal) {
      setBagCounter(1);
      setBags([]);
    }
  }, [isOpenModal]);

  const columns = [
    {
      title: "Vault ID",
      key: "vault_id",
      className: "w-24",
      render: (row) => <span className=" text-cyan-500">{row.vault_id}</span>,
    },
    {
      title: "Name",
      key: "name",
      className: "w-40",
      render: (row) => <span className=" ">{row.name}</span>,
    },
    {
      title: "Address",
      key: "address",
      className: "w-32",
      render: (row) => <span className=" ">{row.address}</span>,
    },
    {
      title: "Balance (৳)",
      key: "balance",
      className: "w-32",
      render: (row) => (
        <span className=" ">
          {row?.bags?.reduce((sum, bag) => sum + parseFloat(bag.current_amount || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: "Racks",
      key: "total_racks",
      className: "w-20",
      render: (row) => <span className=" ">{row.total_racks}</span>,
    },
    {
      title: "Bags",
      key: "total_bags",
      className: "w-36",
      render: (row) => {
        const bagCount = row.bags?.length || 0;

        return (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openVaultDrawer(row)}
            className="px-3 py-2 bg-cyan-50 border border-cyan-200 cursor-pointer  text-cyan-500 text-xs rounded-full flex items-center gap-2 "
          >
            <span>
              {bagCount} Bag{bagCount !== 1 ? "s" : ""}
            </span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        );
      },
    },
    {
      title: "Last Cash In",
      key: "last_cash_in",
      className: "w-34",
      render: (row) => (
        <div className="flex flex-col ">
          <span className="font-mono">{row.last_cash_in?.amount}</span>
          <span>{dayjs(row.last_cash_in?.created_at).format("DD MMM, YYYY")}</span>
        </div>
      ),
    },
    {
      title: "Last Cash Out",
      key: "last_cash_out",
      className: "w-34",
      render: (row) => (
        <div className="flex flex-col ">
          <span className="font-mono">{row.last_cash_out?.amount}</span>
          <span>{dayjs(row.last_cash_out?.created_at).format("DD MMM, YYYY")}</span>
        </div>
      ),
    },
    {
      title: "Status",
      key: "order_id",
      className: "w-32",
      render: (row) => <span className=" bg-cyan-50 text-xs text-cyan-500 border border-cyan-200 py-1 px-2 rounded-full ">{"Active"}</span>,
    },
    {
      title: "Action",
      key: "actions",
      className: "w-28",
      render: (row) => {
        const handleEdit = (e) => {
          e.stopPropagation();
          // Your edit logic here
          console.log("Edit vault:", row);
          // e.g., open edit modal with row data
          // setEditData(row);
          // setIsEditModalOpen(true);
        };

        const handleDelete = (e) => {
          e.stopPropagation();
          // Your delete logic here
          console.log("Delete vault:", row);
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

  // Add this inside your component
  const printBagBarcodes = (bags, vaultName) => {
    const printWindow = window.open("", "_blank", "width=900,height=800");

    if (!printWindow) {
      alert("Please allow popups for printing barcode labels.");
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bag Barcodes - ${vaultName}</title>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 30px;
      background: #f5f5f5;
      margin: 0;
    }
    h2 {
      text-align: center;
      margin-bottom: 40px;
      color: #1e293b;
    }
    .label-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .barcode-label {
      background: white;
      padding: 30px;
      text-align: center;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .barcode-label svg {
      width: 100%;
      height: 120px; /* Bigger height = easier to scan */
      margin: 15px 0;
    }
    .barcode-info {
      margin-top: 15px;
      font-size: 16px;
      font-weight: bold;
      color: #1e293b;
    }
    @media print {
      body { background: white; padding: 20px; }
      .label-container { gap: 30px; }
      .barcode-label { border: none; box-shadow: none; padding: 20px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <h2>Bag Barcode Labels - ${vaultName}</h2>
  <div class="label-container">
    ${bags
      .map(
        (bag) => `
      <div class="barcode-label">
        <svg class="barcode" data-code="${bag.bag_identifier_barcode}"></svg>
        <div class="barcode-info">${bag.barcode} - Rack #${bag.rack_number || "N/A"}</div>
      </div>
    `,
      )
      .join("")}
  </div>

  <script>
    document.addEventListener("DOMContentLoaded", function() {
      document.querySelectorAll(".barcode").forEach(function(svg) {
        const code = svg.getAttribute("data-code");
        JsBarcode(svg, code, {
          format: "CODE128",
          width: 3,              // Thicker bars = much easier to scan
          height: 100,           // Taller barcode = better readability
          displayValue: true,
          fontSize: 18,
          margin: 15,            // More quiet zone (white space) around barcode
          flat: true,
          background: "#ffffff",
          lineColor: "#000000",  // Pure black for max contrast
        });
      });

      // Auto open print dialog after rendering
      setTimeout(() => {
        window.print();
        // window.close(); // Uncomment if you want auto-close after print
      }, 1200); // Slightly longer delay to ensure all barcodes render
    });
  </script>
</body>
</html>
  `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
  };

  const onSubmit = async (data) => {
    if (Object.keys(rackErrors).length > 0) {
      alert("Please fix rack number errors before submitting.");
      return;
    }

    // Build bags array (only include if rack is filled)
    const validBags = bags
      .filter((bag) => bag.rack_number.trim() !== "")
      .map((bag) => ({
        barcode: bag.barcode,
        bag_identifier_barcode: bag.bag_identifier_barcode,
        rack_number: bag.rack_number.trim(),
        current_amount: parseFloat(bag.current_amount || 0).toFixed(2),
      }));

    const payload = {
      name: data.name.trim(),
      address: data.address?.trim() || null,
      current_amount: validBags.reduce((total, bag) => total + parseFloat(bag.current_amount || 0), 0),
      total_bags: validBags.length || null,
      bags: validBags.length > 0 ? validBags : null,
      total_racks: data.total_racks || null,
    };

    try {
      await CreateVault(payload);
      fetchVaultData();
      handleCloseModal();

      if (validBags.length > 0) {
        printBagBarcodes(validBags, data.name); // vault name for header
      }
    } catch (error) {
      console.error("Create failed:", error);
      //   alert("Failed to create vault");
    }
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setBags([]);
    reset();
  };
  const toggleBagExpand = (barcode) => {
    setExpandedBag(expandedBag === barcode ? null : barcode);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsOpenModal(true)}
          className="px-6 py-2 bg-cyan-50 text-cyan-400 border border-cyan-200  rounded-full transition flex items-center gap-2"
        >
          Create Vault
        </button>
      </div>

      <DataTable columns={columns} data={vaults} paginationData={{}} className="h-[calc(100vh-180px)]" />

      {/* Create Vault Modal */}
      {isOpenModal && (
        <CustomModal isCloseModal={handleCloseModal}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Vault Name *</label>
                  <input
                    {...register("name", { required: true })}
                    required
                    className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:border-cyan-500 transition"
                    placeholder="e.g. Main Downtown Vault"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Address</label>
                  <input
                    {...register("address")}
                    className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:border-cyan-500"
                    placeholder="123 Bank Street..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Total Racks</label>
                  <input
                    type="number"
                    {...register("total_racks")}
                    className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:border-cyan-500"
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              {/* Dynamic Bags */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm text-gray-600">Cash Bags</label>
                  <button
                    type="button"
                    onClick={addBag}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-sm text-zinc-400 hover:text-cyan-300 transition"
                  >
                    <AiOutlinePlus className="w-4 h-4" />
                    Add Bag
                  </button>
                </div>

                <div className="overflow-y-auto max-h-96 space-y-3 pr-2">
                  {bags.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No bags added yet. Click "Add Bag" to start.</p>}

                  {bags.map((bag) => (
                    <motion.div
                      key={bag.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="px-5 py-4 bg-gray-50 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-cyan-500 font-medium">{bag.barcode}</p>
                        </div>

                        <input
                          type="text"
                          placeholder="Rack Number"
                          value={bag.rack_number}
                          onChange={(e) => updateRack(bag.id, e.target.value)}
                          className={`w-32 px-4 py-2 rounded-lg border text-sm ${
                            rackErrors[bag.id] ? "border-red-400" : "border-gray-200 focus:border-cyan-500"
                          } focus:outline-none`}
                        />
                        {rackErrors[bag.id] && <p className="text-red-400 text-xs">{rackErrors[bag.id]}</p>}

                        <div className="relative">
                          <input
                            type="text"
                            placeholder="0.00"
                            value={bag.current_amount}
                            onChange={(e) => updateBagAmount(bag.id, e.target.value)}
                            className="w-40 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:outline-none text-sm"
                          />
                        </div>

                        <button type="button" onClick={() => removeBag(bag.id)} className="p-2 hover:bg-red-500/20 rounded-lg transition">
                          <AiOutlineDelete className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="flex-1 py-3 border border-gray-100 text-gray-300 rounded-xl hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition"
              >
                Create Vault
              </button>
            </div>
          </form>
        </CustomModal>
      )}

      {/* Vault Bags Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedVault && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-6xl bg-white shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedVault.name}</h2>
                    <p className="text-2xl text-cyan-600 font-mono mt-2">{selectedVault.vault_id}</p>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-4 hover:bg-gray-100 rounded-full transition">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Bags Content */}
              <div className="p-8 pt-0">
                <div className="mb-8 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Cash Bags</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {vaultBagsDetails.length} bag{vaultBagsDetails.length !== 1 ? "s" : ""} in this vault
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Bag Balance</p>
                      <p className="text-xl font-bold text-green-600">
                        ৳
                        {vaultBagsDetails
                          .reduce((sum, bag) => sum + parseFloat(bag.current_amount || 0), 0)
                          .toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                {loadingBags ? (
                  <div className="flex items-center justify-center py-32">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-500"></div>
                  </div>
                ) : vaultBagsDetails.length === 0 ? (
                  <div className="text-center py-32">
                    <Package className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                    <p className="text-xl text-gray-500">No bags found in this vault.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {vaultBagsDetails.map((bag) => {
                      const denominations = bag.denominations ? JSON.parse(bag.denominations) : null;
                      const totalNotes = denominations ? Object.values(denominations).reduce((a, b) => a + b, 0) : 0;

                      return (
                        <motion.div
                          key={bag.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                        >
                          {/* Accordion Header */}
                          <button
                            onClick={() => toggleBagExpand(bag.barcode)}
                            className="w-full px-8 py-7 flex items-center justify-between hover:bg-gray-50 transition"
                          >
                            <div className="flex items-center gap-6">
                              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                                <Package className="w-6 h-6 text-white" />
                              </div>

                              <div className="text-left">
                                <div className="flex items-center gap-4">
                                  <h4 className="text-lg font-bold text-gray-800">{bag.barcode}</h4>
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-700">Rack #{bag.rack_number}</span>
                                </div>

                                <div className="flex items-center gap-8 mt-4">
                                  <span className="text-xl font-bold text-green-600">
                                    ৳
                                    {parseFloat(bag.current_amount || 0).toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>

                                  <div className="flex items-center gap-4">
                                    {bag.is_sealed && (
                                      <span className="px-4 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">Sealed</span>
                                    )}
                                    {!bag.is_active && <span className="px-4 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Inactive</span>}
                                    {bag.last_cash_in_at && (
                                      <span className="text-sm text-gray-600 flex items-center gap-2">
                                        <ArrowDownCircle className="w-5 h-5 text-green-600" />
                                        Last Cash In: {dayjs(bag.last_cash_in_at).format("DD MMM, YYYY")}
                                      </span>
                                    )}
                                    {bag.last_cash_out_at && (
                                      <span className="text-sm text-gray-600 flex items-center gap-2">
                                        <ArrowUpCircle className="w-5 h-5 text-red-600" />
                                        Last Cash Out: {dayjs(bag.last_cash_out_at).format("DD MMM, YYYY")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <motion.div animate={{ rotate: expandedBag === bag.barcode ? 180 : 0 }} transition={{ duration: 0.3 }}>
                              <ChevronDown className="w-7 h-7 text-gray-500" />
                            </motion.div>
                          </button>

                          {/* Accordion Body */}
                          <AnimatePresence>
                            {expandedBag === bag.barcode && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="border-t border-gray-200 bg-gray-50/70"
                              >
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                  {/* Denominations */}
                                  <div className="lg:col-span-2">
                                    <h5 className="text-sm text-gray-600 mb-5 flex items-center gap-3">Denomination Breakdown</h5>

                                    {denominations ? (
                                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                                        {Object.entries(denominations)
                                          .filter(([_, count]) => count > 0)
                                          .map(([note, count]) => (
                                            <div
                                              key={note}
                                              className="bg-white p-6 rounded-xl border border-gray-200 text-center shadow-md hover:shadow-lg transition"
                                            >
                                              <p className="text-xl font-bold text-gray-800">৳{note}</p>
                                              <p className="text-sm text-gray-600 mt-2">
                                                {count} note{count !== 1 ? "s" : ""}
                                              </p>
                                              <p className="text-xl font-bold text-green-600 mt-3">৳{(parseInt(note) * count).toLocaleString()}</p>
                                            </div>
                                          ))}

                                        {totalNotes === 0 && <p className="col-span-full text-center text-gray-500 py-10">No notes recorded yet.</p>}
                                      </div>
                                    ) : (
                                      <p className="text-gray-400 text-xs">No denomination data available.</p>
                                    )}
                                  </div>

                                  {/* Activity Summary */}
                                  <div>
                                    <h5 className="text-sm text-gray-600 mb-5 flex items-center gap-3">
                                      <History className="w-4 h-4 text-gray-600" />
                                      Activity Summary
                                    </h5>

                                    <div className="bg-white p-7 rounded-xl border border-gray-200 shadow-md space-y-6">
                                      <div className="flex justify-between">
                                        <div>
                                          <p className="text-xs text-gray-600">Successful Deposits</p>
                                          <p className="text-lg font-bold text-green-600">{bag.total_successful_deposits}</p>
                                        </div>

                                        <div>
                                          <p className="text-xs text-gray-600">Total Attempts</p>
                                          <p className="text-lg font-semibold text-gray-800">{bag.total_cash_in_attempts}</p>
                                        </div>
                                      </div>

                                      {bag.last_cash_in_amount && (
                                        <>
                                          <div className="pt-5 border-t border-gray-200">
                                            <p className="text-sm text-gray-600">Last Cash In (৳)</p>
                                            <p className="text-2xl font-bold text-green-600">+ {parseFloat(bag.last_cash_in_amount).toLocaleString()}</p>
                                            <p className="text-sm text-gray-500 mt-1">{dayjs(bag.last_cash_in_at).format("DD MMM YYYY, h:mm A")}</p>
                                          </div>
                                        </>
                                      )}

                                      {bag.notes && (
                                        <div className="pt-5 border-t border-gray-200">
                                          <p className="text-sm text-gray-600">Notes</p>
                                          <p className="text-gray-700 mt-2">{bag.notes}</p>
                                        </div>
                                      )}
                                    </div>
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
        )}
      </AnimatePresence>
    </div>
  );
};

// const BarcodeDisplay = ({ value }) => {
//   const svgRef = useRef();

//   useEffect(() => {
//     if (svgRef.current && value) {
//       JsBarcode(svgRef.current, value, {
//         format: "CODE128",
//         width: 2,
//         height: 60,
//         displayValue: true,
//         fontSize: 14,
//         margin: 10,
//         background: "transparent",
//         lineColor: "#60a5fa",
//       });
//     }
//   }, [value]);

//   return <svg ref={svgRef}></svg>;
// };

export default Vault;
