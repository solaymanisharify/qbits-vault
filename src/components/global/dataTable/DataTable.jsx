import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";

const DataTable = ({ columns, data, paginationData, changePage, onSearch, className }) => {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      // Call parent's search handler
      if (onSearch) {
        onSearch(search.trim());
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [search]);

  const generatePageNumbers = () => {
    if (!paginationData?.last_page) return [];

    const current = paginationData.current_page || 1;
    const last = paginationData.last_page;
    const delta = 2;
    const pages = [];
    const result = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
      pages.push(i);
    }

    if (current - delta > 2) pages.unshift("...");
    if (current + delta < last - 1) pages.push("...");

    result.push(1);
    pages.forEach((p) => result.push(p));
    if (last > 1) result.push(last);

    return [...new Set(result)]; // remove duplicates
  };

  const handlePageClick = (page) => {
    if (typeof page !== "number") return;

    // Find the correct link from pagination.links
    const link = paginationData.links?.find((l) => l.page === page);
    if (link?.url) {
      // Extract query params and pass via changePage
      const url = new URL(link.url);
      const params = Object.fromEntries(url.searchParams);
      changePage(params.page ? Number(params.page) : page);
    } else {
      changePage(page);
    }
  };

  //   console.log({ paginationData });

  return (
    <div className={`relative ${className} flex flex-col  backdrop-blur-xl rounded-2xl overflow-hidden`}>
      <div className="p-6 border-b border-white/10 bg-white shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-semibold text-white"></h3>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-white">
        <div className="h-full overflow-y-auto scrollbar-custom ">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="text-left text-gray-800 border-b border-white/10">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`px-6 py-3 text-left text-xs font-semibold text-gray-800 sticky top-0 z-20 bg-gray-100 ${column?.className}`}
                    onClick={() => (column.iconClickAction ? column.iconClickAction() : null)}
                  >
                    <div
                    >
                      <span>{column.title}</span>
                      {column.icon && (
                        <span>
                          <column.icon />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={`px-6 py-4 text-gray-600 border-b border-gray-100  text-start text-[14px] ${column?.className}`}>
                      {column.render ? column.render(row, row, data.length) : row[column.key] || <span className="">-</span>}
                    </td>
                  ))}
                  {/* <td className="px-6 py-4 text-gray-300">{tx.date}</td> */}
                  {/* <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tx.type === "Received" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">{tx.from || tx.to}</td>
                <td className={`px-6 py-4 font-semibold ${tx.amount.startsWith("+") ? "text-green-400" : "text-red-400"}`}>{tx.amount}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tx.status === "Completed" ? "bg-cyan-500/20 text-cyan-300" : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {tx.status}
                  </span>
                </td> */}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-6 py-2 border-t border-gray-50 bg-gray-50 shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          {/* Showing X to Y of Z */}
          <div>
            Showing {(paginationData?.current_page - 1) * paginationData?.per_page + 1} to{" "}
            {Math.min(paginationData?.current_page * paginationData?.per_page, paginationData?.total)} of {paginationData?.total} entries
          </div>

          {/* Page Numbers */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => changePage(paginationData?.current_page - 1)}
              disabled={!paginationData?.prev_page_url}
              className="px-3 py-2 rounded-lg hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              <FiChevronLeft size={16} /> Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {generatePageNumbers(paginationData).map((page, index) => (
                <button
                  key={index}
                  onClick={() => handlePageClick(page)}
                  disabled={page === "..."}
                  className={`
              w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all
              ${page === paginationData?.current_page ? "bg-cyan-50 text-cyan-500 border border-cyan-200" : "hover:bg-white/10 text-gray-500"}
              ${page === "..." ? "cursor-default text-gray-500" : "cursor-pointer"}
            `}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => changePage(paginationData?.current_page + 1)}
              disabled={!paginationData?.next_page_url}
              className="px-3 py-2 rounded-lg hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              Next <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
