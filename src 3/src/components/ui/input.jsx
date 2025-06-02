import React from 'react';

export function Input({ ...props }) {
  return (
    <input
      className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:ring focus:border-blue-300"
      {...props}
    />
  );
}
