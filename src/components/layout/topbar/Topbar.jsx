import { FiBell, FiUser, FiMenu } from 'react-icons/fi';

const Topbar = ({ toggleSidebar }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-800 h-16 flex items-center justify-between px-4 md:px-6 z-10">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="md:hidden text-textDark mr-4">
          <FiMenu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-textDark">Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-textDark hover:text-secondary">
          <FiBell size={20} />
        </button>
        <button className="text-textDark hover:text-secondary">
          <FiUser size={20} />
        </button>
      </div>
    </div>
  );
};

export default Topbar;