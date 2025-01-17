import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-purple-600 py-1 bg-transparent px-3 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-700 focus:border-purple-700 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
        onInput={(e) => {
          const target = e.target as HTMLInputElement;
          target.style.borderColor = "rgb(147 51 234)";
        }}
        onBlur={(e) => {
          const target = e.target as HTMLInputElement;
          target.style.borderColor = "";
        }}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
