import React from 'react';

const Button = ({ children, onClick, type = "button", variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-gradient-premium text-white hover:shadow-lg hover:scale-[1.02]",
    secondary: "bg-white/10 text-slate-dark hover:bg-white/20",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-slate-200 text-slate-gray hover:bg-slate-50"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none active:scale-95 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
