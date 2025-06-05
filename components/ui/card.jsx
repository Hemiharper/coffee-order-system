
import * as React from "react";

const Card = ({ className = "", children }) => {
  return (
    <div className={"rounded-lg border bg-white text-card-foreground shadow-sm " + className}>
      {children}
    </div>
  );
};

const CardHeader = ({ children }) => <div className="p-4 border-b">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>;
const CardContent = ({ children }) => <div className="p-4">{children}</div>;

export { Card, CardHeader, CardTitle, CardContent };
