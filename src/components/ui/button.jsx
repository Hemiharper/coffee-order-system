export default function Button({ children, onClick, disabled, variant }) {
  const base = 'inline-flex items-center justify-center h-12 px-4 rounded text-white font-medium';
  const styles = variant==='outline'
    ? 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50'
    : 'bg-blue-600 hover:bg-blue-700';
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles} ${disabled?'opacity-50 cursor-not-allowed':''}`}>{children}</button>
  );
}
