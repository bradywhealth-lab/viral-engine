import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-[#1e2d45] bg-[#1a2540] px-3 py-2 text-sm text-[#f0f4ff] placeholder:text-[#8899bb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f8ef7]/70 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
