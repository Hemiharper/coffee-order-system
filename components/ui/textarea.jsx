import React from 'react';

export function Textarea({ placeholder, value, onChange }) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full border rounded-md p-2 text-sm"
      rows={4}
    />
  );
}