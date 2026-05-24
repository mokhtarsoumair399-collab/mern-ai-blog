import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-primary/35",
        className
      )}
      {...props}
    />
  );
}
