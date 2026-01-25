import { useSearchParams } from "react-router-dom";
import DataTable from "../../components/global/dataTable/DataTable";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ReconcileModel from "../../components/reconcile/ReconcileModel";
import { GetReconciles } from "../../services/Reconcile";
import dayjs from "dayjs";
import VerifierAvatars from "../../components/global/verifierAvatars.jsx/VerifierAvatars";

const Reconcile = () => {
  const [reconcileData, setReconcileData] = useState([]);
  const [openReconcileModel, setOpenReconcileModel] = useState();
  const [searchParams, setSearchParams] = useSearchParams();
  const step = parseInt(searchParams.get("step") || "0");

  const FetchReconcileData = () => {
    GetReconciles().then((res) => setReconcileData(res?.data?.data || []));
  };

  useEffect(() => {
    FetchReconcileData();
  }, []);
  console.log({ reconcileData });

  const refetch = () => {
    FetchReconcileData();
  };

  const columns = [
    {
      title: "Vault",
      key: "reconcile_tran_id",
      className: "w-30",
      render: (row) => (
        <span className="font-mono">
          {row.vault?.vault_id} <span className="text-cyan-400">({row.vault?.name})</span>
        </span>
      ),
    },
    {
      title: "Reconcile Id",
      key: "reconcile_tran_id",
      className: "w-34",
      render: (row) => <span className="font-mono text-cyan-400">{row.reconcile_tran_id}</span>,
    },
    {
      title: "Amount",
      key: "cash_in_amount",
      className: "w-20",
      render: (row) => <span className="">{row?.cash_in_amount}</span>,
    },

    {
      title: "From Date",
      key: "from_date",
      className: "w-34",
      render: (row) => <span className="">{dayjs(row.from_date).format("DD MMM, YYYY")}</span>,
    },
    {
      title: "To Date",
      key: "to_date",
      className: "w-34",
      render: (row) => <span className="">{dayjs(row.to_date).format("DD MMM, YYYY")}</span>,
    },
    {
      title: "Verifiers",
      key: "created_at",
      className: "w-20",
      render: (row) => {
        const requiredVerifiers = row.required_verifiers || [];

        return <VerifierAvatars requiredVerifiers={requiredVerifiers} />;
      },
    },
    {
      title: "Approvers",
      key: "status",
      className: "w-32",
      render: (row) => {
        const requiredVerifiers = row.required_approvers || [];

        return <VerifierAvatars requiredVerifiers={requiredVerifiers} />;
      },
    },
    {
      title: "Status",
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

  return (
    <div className="px-6 py-4">
      <div className="flex items-center  justify-between p-2">
        <h1 className="text-lg font-semibold text-gray-600">
          {step === 0 && "Reconcile List"}
          {step === 1 && "Orders List"}
          {step === 2 && "Enter Deposit Amounts"}
          {step === 3 && "Enter Denominations"}
          {step === 4 && "Transaction Complete"}
        </h1>
        <div className="flex items-center gap-4">
          {step === 1 && (
            <div
              //   onClick={handleBack}
              className="cursor-pointer transition-all duration-300 ease-in-out px-4 py-1 hover:bg-gray-50 backdrop-blur-xl rounded-lg overflow-hidden hover:text-black bg-transparent text-zinc-500 border border-zinc-100"
            >
              <p>Back</p>
            </div>
          )}

          {step === 0 && (
            <div
              onClick={() => setOpenReconcileModel(true)}
              className="cursor-pointer transition-all duration-300 ease-in-out px-4 py-1 hover:bg-cyan-100 backdrop-blur-xl rounded-lg overflow-hidden hover:text-cyan-600 bg-cyan-50 text-cyan-500 border border-cyan-300"
            >
              <p>Start Reconcile</p>
            </div>
          )}
          {step > 1 && (
            <div
              //   onClick={handleBack}
              className="cursor-pointer transition-all duration-300 ease-in-out px-4 py-1 hover:bg-gray-100 backdrop-blur-xl rounded-lg overflow-hidden  bg-transparent text-zinc-300 border hover:text-zinc-500 border-zinc-200"
            >
              <p>Back</p>
            </div>
          )}

          {step === 2 && (
            <div
              //   onClick={handleNext}
              className="cursor-pointer transition-all duration-300 ease-in-out px-4 py-1 hover:bg-white/10 backdrop-blur-xl rounded-lg overflow-hidden hover:text-gray-600 bg-cyan-500 text-white border border-cyan-500/50"
            >
              <p>Next</p>
            </div>
          )}
        </div>
      </div>
      {step === 0 && (
        <DataTable
          columns={columns}
          data={reconcileData}
          //   changePage={handlePageChange}
          //   onSearch={handleSearch}
          //   paginationData={paginationData}
          //   selectedRows={selectedRows}
          //   loading={loading}
          //   setSelectedRows={setSelectedRows}
          className="h-[calc(100vh-120px)]"
        />
      )}

      {openReconcileModel && <ReconcileModel isClose={() => setOpenReconcileModel(false)} refetch={refetch} />}
    </div>
  );
};

export default Reconcile;
