import React from 'react';

const Input = ({ label, placeholder, value, onChange, type = "text", className = "", ...props }) => {
  return (
    <div className={`space-y-1.5 flex-1 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-slate-gray ml-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2.5 
                   focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all
                   placeholder:text-slate-gray/40"
        {...props}
      />
    </div>
  );
};

export default Input;
