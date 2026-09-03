import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border bg-white px-3 text-sm text-brand-900 placeholder:text-brand-400",
          "focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400",
          "disabled:bg-brand-50 disabled:text-brand-400",
          error ? "border-rose-400 focus:ring-rose-200" : "border-brand-200",
          className,
        )}
        aria-invalid={!!error}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
