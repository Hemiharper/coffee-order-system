
import * as React from "react";

const Tabs = ({ value, onValueChange, children }) => (
  <div>
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { value, onValueChange })
    )}
  </div>
);

const TabsList = ({ children, className = "" }) => (
  <div className={"flex " + className}>{children}</div>
);

const TabsTrigger = ({ value, children, onValueChange }) => (
  <button onClick={() => onValueChange(value)} className="flex-1 p-2 text-center border">
    {children}
  </button>
);

const TabsContent = ({ value, children }) => <div>{children}</div>;

export { Tabs, TabsList, TabsTrigger, TabsContent };
