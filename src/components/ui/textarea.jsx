import * as React from "react";

const Textarea = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={
        "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none " +
        className
      }
      rows="4"
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
export { Textarea };