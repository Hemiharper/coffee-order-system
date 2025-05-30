export default function Textarea({ placeholder, value, onChange }) {
  return (
    <textarea
      className="w-full border rounded p-3 h-24 text-base"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}
