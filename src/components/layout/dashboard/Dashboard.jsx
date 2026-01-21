// Dashboard.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiHome,
  FiSend,
  FiDownload,
  FiSettings,
  FiLogOut,
  FiBell,
  FiSearch,
  FiChevronDown,
  FiTrendingUp,
  FiTrendingDown,
  FiCopy,
  FiEye,
  FiRefreshCw,
} from "react-icons/fi";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GetDashboardReports } from "../../../services/Dashboard";

// Mock Data
// const transactions = [
//   { id: "TXN001", date: "Dec 03, 2025", type: "Received", from: "Alice Johnson", amount: "+2.45 BTC", status: "Completed" },
//   { id: "TXN002", date: "Dec 02, 2025", type: "Sent", to: "Bob Smith", amount: "-0.85 BTC", status: "Completed" },
//   { id: "TXN003", date: "Dec 01, 2025", type: "Received", from: "Exchange Deposit", amount: "+5.20 BTC", status: "Pending" },
//   { id: "TXN004", date: "Nov 30, 2025", type: "Sent", to: "Savings Vault", amount: "-3.00 BTC", status: "Completed" },
// ];

const chartData = [
  { name: "Jan", value: 24000 },
  { name: "Feb", value: 32000 },
  { name: "Mar", value: 28000 },
  { name: "Apr", value: 45000 },
  { name: "May", value: 68000 },
  { name: "Jun", value: 82000 },
  { name: "Jul", value: 98000 },
];

export default function Dashboard() {
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({});

  useEffect(() => {
    GetDashboardReports().then((res) => {
      setDashboardData(res.data);
    });
  }, []);

  console.log({ dashboardData });

  return (
    <div className=" h-screen bg-gray-50 px-4">
      {/* Mobile Sidebar Overlay */}

      {/* Main Content */}
      <div className=" w-full!  p-4 ">
        {/* Top Bar */}

        {/* Dashboard Content */}
        <main className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { label: "Remaining Balance", value: dashboardData?.totalVaultBalance, change: "+12.5%", trend: "up" },
              { label: "Total CashIn", value: dashboardData?.totalCashIn, change: "+5.2%", trend: "up" },
              { label: "Total Cashout", value: dashboardData?.totalCashOut, change: "-2.1%", trend: "down" },
              { label: "Total Vaults", value: "6", change: "+1", trend: "up" },
              { label: "Total Bags", value: "6", change: "+1", trend: "up" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl p-6 hover:bg-white/15 transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400">{stat.label}</p>
                  {stat.trend === "up" ? <FiTrendingUp className="text-green-400" /> : <FiTrendingDown className="text-red-400" />}
                </div>
                <h3 className="text-3xl font-bold text-gray-600 mb-2">{stat.value}</h3>
                <p className={`text-sm ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>{stat.change} from last month</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Portfolio Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#ffffff50" />
                  <YAxis stroke="#ffffff50" />
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none" }} />
                  <Area type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#colorGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              {/* <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3> */}
              {/* <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: FiSend, label: "Cash In", color: "from-purple-500 to-pink-500" },
                  { icon: FiDownload, label: "Cash Out", color: "from-cyan-500 to-blue-500" },
                  { icon: FiCopy, label: "Reconciliation", color: "from-green-500 to-emerald-500" },
                  { icon: FiEye, label: "View Seed", color: "from-red-500 to-rose-500" },
                ].map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-6 bg-gradient-to-br ${action.color} rounded-2xl text-white font-medium flex flex-col items-center gap-3 shadow-lg`}
                  >
                    <action.icon size={28} />
                    <span>{action.label}</span>
                  </motion.button>
                ))}
              </div> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
