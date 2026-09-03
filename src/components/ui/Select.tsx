import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-10 w-full rounded-lg border border-brand-200 bg-white px-3 text-sm text-brand-900",
      "focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400",
      "disabled:bg-brand-50 disabled:text-brand-400",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
