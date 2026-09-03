import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, children, required, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-brand-800", className)}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-rose-600">*</span>}
    </label>
  );
});

Label.displayName = "Label";
