import React from 'react';

const Card = ({ children, title, className = "", headerAction, ...props }) => {
  return (
    <div className={`glass-card p-6 overflow-hidden ${className}`} {...props}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-6 px-1">
          {title && <h3 className="text-xl font-bold tracking-tight">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default Card;
