import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-brand-900 placeholder:text-brand-400",
          "focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400",
          "disabled:bg-brand-50 disabled:text-brand-400 resize-y",
          error ? "border-rose-400 focus:ring-rose-200" : "border-brand-200",
          className,
        )}
        aria-invalid={!!error}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
