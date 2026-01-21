import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import { useEffect, useState } from "react";

const Layout = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On mobile/tablet, start minimized
      if (mobile) {
        setIsMinimized(true);
      } else {
        setIsMinimized(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isMinimized ? "w-16" : "w-[220px]";

  return (
    <div>
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarWidth={sidebarWidth} isMinimized={isMinimized} setIsMinimized={setIsMinimized}  isMobile={isMobile} />
        <div className={`relative flex flex-col ${isMinimized ? "ml-16" : "ml-[220px]"} flex-1 w-screen overflow-y-auto`}>
          <main className="text-white700 ">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
