import { useEffect, useState } from "react";
import DataTable from "../../components/global/dataTable/DataTable";
import { CreateVault, GetVaults } from "../../services/Vault";
import dayjs from "dayjs";
import CustomModal from "../../components/global/modal/CustomModal";
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { motion } from "framer-motion";
import JsBarcode from "jsbarcode";
import { useForm } from "react-hook-form";

const Vault = () => {
  const [vaults, setVaults] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [totalRacks, setTotalRacks] = useState("");
  const [rackErrors, setRackErrors] = useState({});
  const [bags, setBags] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const watchedTotalRacks = watch("total_racks");

  useEffect(() => {
    setTotalRacks(watchedTotalRacks || "");
  }, [watchedTotalRacks]);

  const generateBarcode = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(100 + Math.random() * 900);
    return `BAG${date}${random}`;
  };

  const addBag = () => {
    const newBag = {
      id: Date.now(),
      barcode: generateBarcode(),
      rack_number: "",
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

  const columns = [
    {
      title: "Vault ID",
      key: "vault_id",
      className: "w-32",
      render: (row) => <span className=" text-cyan-400">{row.vault_id}</span>,
    },
    {
      title: "Name",
      key: "name",
      className: "w-64",
      render: (row) => <span className=" text-zinc-300">{row.name}</span>,
    },
    {
      title: "Address",
      key: "address",
      className: "w-64",
      render: (row) => <span className=" text-zinc-300">{row.address}</span>,
    },
    {
      title: "Balance",
      key: "balance",
      className: "w-32",
      render: (row) => <span className=" text-zinc-300">{row.balance}</span>,
    },
    {
      title: "Racks",
      key: "total_racks",
      className: "w-20",
      render: (row) => <span className=" text-zinc-300">{row.total_racks}</span>,
    },
    {
      title: "Bags",
      key: "order_id",
      className: "w-20",
      render: (row) => <span className=" text-zinc-300">{row.order_id}</span>,
    },
    {
      title: "Last Cash In",
      key: "last_cash_in",
      className: "w-34",
      render: (row) => (
        <div className="flex flex-col text-zinc-300">
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
        <div className="flex flex-col text-zinc-300">
          <span className="font-mono">{row.last_cash_out?.amount}</span>
          <span>{dayjs(row.last_cash_out?.created_at).format("DD MMM, YYYY")}</span>
        </div>
      ),
    },
    {
      title: "Vault Status",
      key: "order_id",
      className: "w-32",
      render: (row) => <span className=" bg-cyan-500/20 text-cyan-300 py-1 px-2 rounded-full ">{"Active"}</span>,
    },
    {
      title: "Verifiers",
      key: "order_id",
      className: "w-32",
      render: (row) => <span className="font-mono text-cyan-400">{row.order_id}</span>,
    },
    {
      title: "Actions",
      key: "order_id",
      className: "w-32",
      render: (row) => <span className="font-mono text-cyan-400">{row.order_id}</span>,
    },
  ];

  const onSubmit = async (data) => {
    if (Object.keys(rackErrors).length > 0) {
      alert("Please fix rack number errors before submitting.");
      return;
    }

    // Build bags array (only include if rack is filled)
    const validBags = bags
      .filter((bag) => bag.rack_number.trim() !== "")
      .map((bag) => ({
        barcode: bag.barcode || null,
        rack_number: bag.rack_number.trim(),
      }));

    const payload = {
      name: data.name.trim(),
      address: data.address?.trim() || null,
      balance: parseFloat(data.balance || 0).toFixed(2),
      total_bags: validBags.length > 0 ? validBags : null,
      total_racks: data.total_racks || null,
    };

    try {
      await CreateVault(payload);
      fetchVaultData();
      handleCloseModal();
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

  return (
    <div>
      <div>
        <div className="mb-4 text-cyan-400 flex justify-end">
          <div
            onClick={() => setIsOpenModal(true)}
            className="cursor-pointer transition-all duration-300 ease-in-out px-4 py-1 bg-white/10 backdrop-blur-xl rounded-lg overflow-hidden hover:text-white text-zinc-300 border border-white/20"
          >
            <p>Create</p>
          </div>
        </div>
        <DataTable columns={columns} data={vaults} paginationData={{}} className="h-[calc(100vh-150px)]" />
      </div>

      {isOpenModal && (
        <CustomModal isCloseModal={() => setIsOpenModal(false)}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Form Fields */}
            <div className="space-y-5 ">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm  text-gray-300 mb-2">Vault Name *</label>
                  <input
                    name="name"
                    {...register("name", { required: true })}
                    //   defaultValue={initialData.name}
                    required
                    className="w-full px-4 py-2 bg-[#24283f] border border-[#353857] rounded-lg text-white focus:outline-none focus:border-cyan-500 transition"
                    placeholder="e.g. Main Downtown Vault"
                  />
                </div>

                <div>
                  <label className="block text-sm  text-gray-300 mb-2">Address</label>
                  <input
                    name="address"
                    {...register("address")}
                    //   defaultValue={initialData.address}
                    className="w-full px-4 py-2 bg-[#24283f] border border-[#353857] rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="123 Bank Street..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm  text-gray-300 mb-2">Initial Balance</label>
                  <input
                    name="balance"
                    type="number"
                    step="0.01"
                    {...register("balance")}
                    //   defaultValue={initialData.balance || "0"}
                    className="w-full px-4 py-2 bg-[#24283f] border border-[#353857] rounded-lg text-white focus:border-cyan-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm  text-gray-300 mb-2">Total Racks</label>
                  <input
                    name="total_racks"
                    type="number"
                    step="0.01"
                    {...register("total_racks")}
                    //   defaultValue={initialData.balance || "0"}
                    className="w-full px-4 py-2 bg-[#24283f] border border-[#353857] rounded-lg text-white focus:border-cyan-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Dynamic Bags Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm  text-gray-300">Cash Bags</label>
                  <button
                    type="button"
                    onClick={addBag}
                    className="flex text-zinc-400 hover:text-zinc-300 cursor-pointer focus:border-cyan-500 items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-sm transition"
                  >
                    <AiOutlinePlus className="w-4 h-4" />
                    Add Bag
                  </button>
                </div>

                <div className="overflow-y-auto space-y-1 max-h-96 pr-2 scrollbar-thin scrollbar-thumb-[#353857] scrollbar-track-[#1b1e3a] scrollbar-thumb-rounded-full">
                  {bags.length === 0 && <p className="text-gray-500 text-center py-8">No bags added yet. Click "Add Bag" to start.</p>}

                  {bags.map((bag) => (
                    <motion.div
                      key={bag.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="px-5 py-2 bg-[#24283f] border border-[#353857] rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-cyan-300">{bag.barcode}</p>
                          <input type="hidden" name="bags_barcode[]" value={bag.barcode} />
                        </div>
                        <div className="">
                          <input
                            type="text"
                            placeholder="Rack Number (e.g. 5)"
                            value={bag.rack_number}
                            onChange={(e) => updateRack(bag.id, e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border text-white text-sm focus:outline-none ${
                              rackErrors[bag.id] ? "border-red-400 " : "border-[#353857] bg-[#1b1e3a] focus:border-cyan-500"
                            }`}
                          />
                          {rackErrors[bag.id] && <p className="text-red-400 text-xs mt-1">{rackErrors[bag.id]}</p>}
                        </div>
                        <button type="button" onClick={() => removeBag(bag.id)} className="p-2 hover:bg-red-500/20 cursor-pointer rounded-lg transition">
                          <AiOutlineDelete className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-4 mt-10 pt-6 border-t border-[#353857]">
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="flex-1 py-3 hover:text-red-400 cursor-pointer border border-gray-600 text-gray-300 rounded-xl hover:bg-white/5 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r cursor-pointer from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-medium shadow-lg"
              >
                {/* {initialData.id ? "Save Changes" : "Create Vault"} */}
                Create Vault
              </button>
            </div>
          </form>
        </CustomModal>
      )}
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
