import React from 'react';

export function Tabs({ children }) {
  return <div className="border-b mb-4">{children}</div>;
}

export function TabsList({ children }) {
  return <div className="flex">{children}</div>;
}

export function TabsTrigger({ isActive, onClick, children }) {
  const base = 'px-4 py-2 cursor-pointer';
  const activeClass = isActive ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800';
  return (
    <div className={`${base} ${activeClass}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function TabsContent({ isActive, children }) {
  if (!isActive) return null;
  return <div>{children}</div>;
}
