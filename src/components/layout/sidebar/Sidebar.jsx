import { useState } from "react";
import { FiHome, FiSettings, FiLogOut, FiSend, FiDownload, FiRefreshCw, FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import { AiOutlineUser } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";
import { CiVault } from "react-icons/ci";
import { Logout } from "../../../services/Auth";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  const menuItems = [
    { icon: FiHome, label: "Overview", path: "/" },
    { icon: AiOutlineUser, label: "Users", path: "/users" },
    { icon: CiVault, label: "Vaults", path: "/vault" },
    { icon: FiSend, label: "Cash In", path: "/cashin" },
    { icon: FiSend, label: "Send" },
    { icon: FiDownload, label: "Receive" },
    { icon: FiRefreshCw, label: "History" },
    { icon: FiSettings, label: "Settings" },
  ];

  const handleLogout = () => {
    Logout().then(() => {
      localStorage.removeItem("auth");
      window.location.href = "/login";
    });
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : typeof window !== "undefined" && window.innerWidth >= 1024 ? 0 : -300,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-[200px] bg-white/10 backdrop-blur-3xl border-r border-white/20 z-50 shadow-2xl"
        style={{
          // Force visibility on desktop, only slide on mobile
          transform: typeof window !== "undefined" && window.innerWidth >= 1024 ? "translateX(0)" : undefined,
        }}
      >
        <div className="p-1 py-6 overflow-hidden">
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center gap-3">
              <h1 className="text-xl! font-bold text-white">QBits Vault</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <FiX size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <>
                <Link to={item?.path}>
                  <motion.a
                    key={item.label}
                    whileHover={{ x: 8 }}
                    className={`flex items-center gap-4 px-4 py-3 transition-all ${
                      isActive(item.path) ? "  text-cyan-400! border-l-3 border-cyan-400/50" : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <item.icon size={18} className={`${isActive(item.path) ? "text-cyan-400!" : "text-gray-400"}`} />
                    <span className={`text-sm ${isActive(item.path) ? "text-cyan-400!" : "text-gray-400"}`}>{item.label}</span>
                  </motion.a>
                </Link>
              </>
            ))}
          </nav>

          <div className="absolute bottom-6">
            <Link to="/profile" className="w-full bg-transparent! flex items-center gap-3 px-4 py-3 text-gray-400 transition">
              <div className="border border-white/20 w-9 h-9 rounded-full overflow-hidden ">
                <img
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span>Solayman</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full bg-transparent! ml-2 flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-red-500/10 rounded-xl transition"
            >
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
