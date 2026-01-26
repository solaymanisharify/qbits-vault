// Sidebar.jsx
import { motion } from "framer-motion";
import { FiHome, FiSettings, FiLogOut, FiSend, FiDownload, FiRefreshCw, FiX, FiMenu } from "react-icons/fi";
import { AiOutlineAudit, AiOutlineUser } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";
import { CiInboxOut, CiVault } from "react-icons/ci";
import { Logout } from "../../../services/Auth";
import { Shield } from "lucide-react";

const Sidebar = ({ isMobile, isMinimized, isDrawerOpen, setIsDrawerOpen, sidebarWidthClass }) => {
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem("auth"))?.user || {};

  const isActive = (path) => path && (pathname === path || pathname.startsWith(path + "/"));

  const menuItems = [
    { icon: FiHome, label: "Overview", path: "/" },
    { icon: AiOutlineUser, label: "Users", path: "/users" },
    { icon: CiVault, label: "Vaults", path: "/vault" },
    { icon: FiSend, label: "Cash In", path: "/cashin" },
    { icon: CiInboxOut, label: "Cash Out", path: "/cashout" },
    { icon: AiOutlineAudit, label: "Reconcile", path: "/reconcile" },
    { icon: Shield, label: "Verifications", path: "/verifications" },
    { icon: FiRefreshCw, label: "History" },
    { icon: FiSettings, label: "Permissions", path: "/role-and-permissions" },
    { icon: FiSettings, label: "Settings" },
  ];

  const handleLogout = () => {
    Logout().then(() => {
      localStorage.clear();
      window.location.href = "/login";
    });
  };

  const positionClasses = isMobile
    ? `fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:hidden
       ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`
    : `relative z-30 ${sidebarWidthClass}`;

  return (
    <motion.aside
      className={`
        h-full bg-white/10 backdrop-blur-3xl border-r border-gray-100
        flex flex-col overflow-y-auto ${positionClasses}
      `}
      animate={isMobile ? undefined : { width: isMinimized ? 64 : 220 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="p-4 py-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 px-2">
          <h1 className={`text-xl font-semibold text-gray-500 ${isMinimized && !isMobile ? "hidden" : "block"}`}>
            {isMinimized && !isMobile ? "QBV" : "QBits Vault"}
          </h1>

          {isMobile ? (
            <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-lg hover:bg-white/10 text-gray-300 -mr-2" aria-label="Close menu">
              <FiX size={24} />
            </button>
          ) : (
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
              aria-label={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
            >
              {isMinimized && <FiMenu size={20} />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 flex-1">
          {menuItems.map((item) => (
            <Link key={item.label} to={item.path ?? "#"} onClick={isMobile ? () => setIsDrawerOpen(false) : undefined} className="block">
              <motion.div
                whileHover={{ x: 6 }}
                className={`
                  flex items-center gap-4 px-4 py-3  transition-colors
                  ${isActive(item.path) ? "text-cyan-400 border-l-2 border-cyan-500/70" : "text-gray-600 hover:bg-white/10"}
                `}
              >
                <item.icon size={20} className={isActive(item.path) ? "text-cyan-400" : "text-gray-500"} />
                <span className={`text-sm ${isMinimized && !isMobile ? "hidden" : "block"}`}>{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* Bottom - Profile + Logout */}
        <div className="mt-auto pt-6 border-t border-gray-100">
          <Link
            to="/profile"
            onClick={isMobile ? () => setIsDrawerOpen(false) : undefined}
            className={`
              flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-white/10 
              rounded-lg transition mb-2
              ${isMinimized && !isMobile ? "justify-center px-2" : ""}
            `}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=880&q=80"
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`${isMinimized && !isMobile ? "hidden" : "block"}`}>{user.name || "User"}</span>
          </Link>

          <button
            onClick={() => {
              handleLogout();
              if (isMobile) setIsDrawerOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-3 text-gray-600 
               hover:text-red-500 cursor-pointer rounded-lg transition
              ${isMinimized && !isMobile ? "justify-center px-2" : ""}
            `}
          >
            <FiLogOut size={20} />
            <span className={`${isMinimized && !isMobile ? "hidden" : "block"}`}>Logout</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
