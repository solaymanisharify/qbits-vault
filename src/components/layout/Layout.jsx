import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";

const Layout = () => {
  return (
    <div>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col lg:ml-[200px] p-6 flex-1 w-screen overflow-y-auto">
          <main className="text-white700 px-2">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
