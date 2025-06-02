import React from 'react';

export function Tabs({ value, onValueChange, children }) {
  return <div>{React.Children.map(children, child => React.cloneElement(child, { value, onValueChange }))}</div>;
}

export function TabsList({ children, className='' }) {
  return <div className={`flex space-x-2 mb-4 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, children, value: triggerValue, onValueChange }) {
  const isActive = value === triggerValue;
  const base = 'px-4 py-2 rounded-md cursor-pointer';
  const style = isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700';
  return (
    <button onClick={()=>onValueChange(triggerValue)} className={`${base} ${style}`}>
      {children}
    </button>
  );
}

export function TabsContent({ value, children, value: contentValue }) {
  return value === contentValue ? <div>{children}</div> : null;
}
