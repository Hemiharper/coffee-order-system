import React from 'react';

export function Alert({ children, type = 'error' }) {
  const base = 'p-4 rounded-md';
  const typeClass = type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  return (
    <div className={`${base} ${typeClass} mb-4`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children }) {
  return <p className="text-sm">{children}</p>;
}
