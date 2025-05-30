import React from 'react';

export function Select({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function SelectTrigger({ children, className = '' }) {
  return <div className={className + ' cursor-pointer'}>{children}</div>;
}

export function SelectContent({ children, className = '' }) {
  return <div className={className + ' absolute bg-white border rounded shadow-lg z-50'}>{children}</div>;
}

export function SelectItem({ value, children, className = '' }) {
  return (
    <div
      onClick={() => {}}
      className={className + ' px-2 py-1 hover:bg-gray-100 cursor-pointer'}
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder, className = '' }) {
  return <span className={className + ' text-gray-700'}>{placeholder}</span>;
}

export default Select;