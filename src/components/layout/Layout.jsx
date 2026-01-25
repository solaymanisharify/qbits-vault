// Layout.jsx
import { Outlet } from "react-router-dom";

import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import Sidebar from "./sidebar/Sidebar";

const Layout = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setIsDrawerOpen(false);
        setIsMinimized(true); // mobile always starts in minimized style (but hidden)
      } else {
        setIsMinimized(false); // desktop starts full
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sidebarWidthClass = isMinimized ? "w-16" : "w-[220px]";

  // Margin only on desktop - mobile gets full width
  const contentMargin = isMobile ? "ml-0" : (isMinimized ? "ml-16" : "");

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Mobile Top Bar with Menu Button */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 lg:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="text-lg font-medium text-gray-400">QBits Vault</div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Open menu"
            >
              <FiMenu size={24} className="text-gray-500" />
            </button>
          </div>
        </header>
      )}

      <div className="flex h-screen pt-[64px] lg:pt-0">
        {/* Sidebar */}
        <Sidebar
          isMobile={isMobile}
          isMinimized={isMinimized}
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          sidebarWidthClass={sidebarWidthClass}
        />

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col ${contentMargin} transition-all duration-300 ease-in-out overflow-hidden`}
        >
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>

        {/* Mobile overlay backdrop */}
        {isMobile && isDrawerOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;