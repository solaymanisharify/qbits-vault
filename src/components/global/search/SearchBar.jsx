import { FiSearch } from "react-icons/fi";

const SearchBar = ({ placeholder = "Search...", value, onChange, ...props }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 bg-bgDark border border-gray-600 rounded-md text-textDark focus:outline-none focus:ring-2 focus:ring-secondary pl-10"
        {...props}
      />
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );
};

export default SearchBar;
