import React from 'react';

export function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:ring focus:border-blue-300"
    >
      {children}
    </select>
  );
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
