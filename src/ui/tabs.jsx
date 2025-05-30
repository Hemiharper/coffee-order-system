import * as React from "react";

export const Tabs = ({ value, onValueChange, children }) => {
  return <div>{React.Children.map(children, child => React.cloneElement(child, { value, onValueChange }))}</div>;
};

export const TabsList = ({ children, className = "" }) => {
  return <div className={"flex border rounded-md overflow-hidden mb-4 " + className}>{children}</div>;
};

export const TabsTrigger = ({ value, onValueChange, children }) => {
  const isActive = typeof window !== "undefined" && window.location.hash.includes(value);
  return (
    <button
      onClick={() => onValueChange(value)}
      className={`flex-1 text-sm font-medium py-2 px-4 ${isActive ? "bg-white text-black" : "bg-gray-200 text-gray-500"}`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children }) => {
  const [active, setActive] = React.useState("order");
  React.useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) setActive(hash);
  }, []);
  return active === value ? <div>{children}</div> : null;
};