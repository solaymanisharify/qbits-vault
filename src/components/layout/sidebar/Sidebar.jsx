import { FiHome, FiSettings, FiLogOut, FiSend, FiDownload, FiRefreshCw, FiX, FiMenu } from "react-icons/fi";
import { motion } from "framer-motion";
import { AiOutlineUser } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";
import { CiInboxOut, CiVault } from "react-icons/ci";
import { Logout } from "../../../services/Auth";
import { Shield } from "lucide-react";

const Sidebar = ({ sidebarWidth, isMinimized, setIsMinimized, isMobile }) => {
  const { pathname } = useLocation();

  const user = JSON.parse(localStorage.getItem("auth"))?.user;

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  const menuItems = [
    { icon: FiHome, label: "Overview", path: "/" },
    { icon: AiOutlineUser, label: "Users", path: "/users" },
    { icon: CiVault, label: "Vaults", path: "/vault" },
    { icon: FiSend, label: "Cash In", path: "/cashin" },
    { icon: CiInboxOut, label: "Cash Out", path: "/cashout" },
    { icon: FiDownload, label: "Reconcile", path: "/reconcile" },
    { icon: Shield, label: "Verifications", path: "/verifications" },
    { icon: FiRefreshCw, label: "History" },
    { icon: FiSettings, label: "Role & Permissions", path: "/role-and-permissions" },
    { icon: FiSettings, label: "Settings" },
  ];

  const handleLogout = () => {
    Logout().then(() => {
      localStorage.clear();
      window.location.href = "/login";
    });
  };

  return (
    <>
      <motion.aside
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-full ${sidebarWidth} bg-white/10 backdrop-blur-3xl border-r border-gray-100 z-50 flex flex-col transition-all duration-300 ease-in-out`}
      >
        <div className="p-1 py-6 overflow-hidden">
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center gap-3">
              <h1 className={`text-xl! font-semibold text-zinc-500 ${isMinimized ? "hidden" : "flex"}`}>{isMinimized ? "QBV" : "QBits Vault"}</h1>
            </div>
            {isMobile && (
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
                {isMinimized ? <FiMenu size={20} /> : <FiX size={20} />}
              </button>
            )}
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <>
                <Link to={item?.path}>
                  <motion.a
                    key={item.label}
                    whileHover={{ x: 8 }}
                    className={`flex items-center gap-4 px-4 py-3 transition-all ${
                      isActive(item.path) ? "  text-cyan-500! border-l-3 border-cyan-400/50" : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <item.icon size={18} className={`${isActive(item.path) ? "text-cyan-500!" : "text-gray-600"}`} />
                    <span className={`text-sm ${isMinimized ? "hidden" : "flex"} ${isActive(item.path) ? "text-cyan-500!" : "text-gray-600"}`}>
                      {item.label}
                    </span>
                  </motion.a>
                </Link>
              </>
            ))}
          </nav>

          <div className="absolute bottom-6">
            <Link to="/profile" className={`w-full bg-transparent! flex items-center gap-3 ${isMinimized ? "px-2" : "px-4"} py-3 text-gray-600 transition`}>
              <div className="border-2 border-gray-300 w-9 h-9 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`${isMinimized ? "hidden" : "flex"}`}>{user?.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className={`w-full bg-transparent! cursor-pointer hover:text-cyan-300 ${
                isMinimized ? "" : "ml-2"
              } flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-500/10 rounded-xl transition`}
            >
              <FiLogOut size={20} />
              <span className={`${isMinimized ? "hidden" : "flex"}`}>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
