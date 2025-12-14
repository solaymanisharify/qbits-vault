const Checkbox = ({ label, checked, onChange, ...props }) => {
  return (
    <div className="flex items-center">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 text-secondary focus:ring-secondary border-gray-600 rounded" {...props} />
      {label && <label className="ml-2 text-sm text-textDark">{label}</label>}
    </div>
  );
};

export default Checkbox;
