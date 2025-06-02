import React from 'react';

export function Select({ children, value, onValueChange }) {
  return <div className="relative">{children}</div>;
}

export function SelectTrigger({ children }) {
  return <div className="w-full border rounded-md px-3 py-2 bg-white flex justify-between cursor-pointer">{children}</div>;
}

export function SelectContent({ children }) {
  return <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">{children}</div>;
}

export function SelectItem({ value, children }) {
  return (
    <div onClick={()=>{}} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }) {
  return <span className="text-gray-700">{placeholder}</span>;
}
