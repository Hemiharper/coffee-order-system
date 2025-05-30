export const Alert = ({ children, className = "" }) => (
  <div className={"bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded relative " + className}>
    {children}
  </div>
);

export const AlertDescription = ({ children }) => (
  <p className="text-sm mt-1">{children}</p>
);