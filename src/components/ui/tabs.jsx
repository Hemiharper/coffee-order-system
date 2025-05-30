export function Tab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-center ${active ? 'bg-gray-100 font-medium' : 'bg-white'} cursor-pointer`}
    >{children}</button>
  );
}
