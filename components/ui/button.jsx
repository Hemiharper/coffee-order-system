import React from 'react';

export function Button({ children, onClick, disabled, variant }) {
  const base = 'inline-flex items-center justify-center h-10 px-4 rounded-md font-medium';
  const style = variant==='destructive'
    ? 'bg-red-600 text-white hover:bg-red-700'
    : 'bg-blue-600 text-white hover:bg-blue-700';
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${style} ${disabled?'opacity-50 cursor-not-allowed':''}`}>
      {children}
    </button>
  );
}