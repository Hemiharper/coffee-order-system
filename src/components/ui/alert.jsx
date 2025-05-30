
import * as React from "react";

const Alert = ({ children, className = "" }) => {
  return (
    <div className={"relative w-full rounded-lg border border-red-500 bg-red-100 p-4 text-sm text-red-800 " + className}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children }) => <p className="mt-1">{children}</p>;

export { Alert, AlertDescription };
