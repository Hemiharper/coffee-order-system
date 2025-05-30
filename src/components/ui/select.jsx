import { useState } from 'react';
export default function Select({ label, options, value, onChange }) {
  return (
    <div className="relative">
      <button className="w-full h-12 border rounded px-3 text-base text-left flex justify-between items-center">
        {value || label} <span>▼</span>
      </button>
      <ul className="absolute z-50 w-full bg-white border rounded mt-1 max-h-48 overflow-auto">
        {options.map(opt => (
          <li
            key={opt}
            onClick={() => onChange(opt)}
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          >{opt}</li>
        ))}
      </ul>
    </div>
  );
}
