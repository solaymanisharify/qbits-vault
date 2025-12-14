const Select = ({ label, options, value, onChange, ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-textDark mb-1">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 bg-bgDark border border-gray-600 rounded-md text-textDark focus:outline-none focus:ring-2 focus:ring-secondary"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
