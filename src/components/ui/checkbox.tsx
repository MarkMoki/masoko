"use client";

import * as React from "react";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    type="checkbox"
    className="h-4 w-4 rounded border border-primary text-primary focus:ring-2 focus:ring-ring"
    ref={ref}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";

export { Checkbox };