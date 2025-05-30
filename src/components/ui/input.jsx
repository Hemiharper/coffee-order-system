import * as React from "react";

const Input = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={
        "w-full h-12 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 " +
        className
      }
      {...props}
    />
  );
});
Input.displayName = "Input";
export { Input };