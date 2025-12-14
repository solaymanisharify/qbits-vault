const Button = ({ children, onClick, variant = "primary", ...props }) => {
  const base = "px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2";
  const variants = {
    primary: `${base} bg-secondary text-bgDark hover:bg-green-600 focus:ring-secondary`,
    secondary: `${base} bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-bgDark`,
  };

  return (
    <button onClick={onClick} className={variants[variant]} {...props}>
      {children}
    </button>
  );
};

export default Button;
