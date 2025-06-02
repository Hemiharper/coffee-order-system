import React from 'react';

export function Button({ children, variant = 'primary', ...props }) {
  const base = 'px-4 py-2 rounded-md font-medium focus:outline-none transition';
  let variantClass = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : variant === 'secondary'
    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  return (
    <button className={`${base} ${variantClass}`} {...props}>
      {children}
    </button>
  );
}
