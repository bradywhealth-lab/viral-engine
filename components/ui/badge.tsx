import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#decfb7] bg-[#fffaf2] text-[#4c4033]",
        secondary: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
        warning: "border-amber-300/40 bg-amber-50 text-amber-700",
        destructive: "border-red-300/40 bg-red-50 text-red-700",
        outline: "border-[#decfb7] bg-transparent text-[#6f6254]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
