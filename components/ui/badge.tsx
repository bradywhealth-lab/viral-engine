import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#1e2d45] bg-[#1a2540] text-[#f0f4ff]",
        secondary: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        warning: "border-[#4f8ef7]/30 bg-[#4f8ef7]/10 text-[#38bdf8]",
        destructive: "border-red-500/30 bg-red-500/10 text-red-300",
        outline: "border-[#1e2d45] text-[#f0f4ff]/90",
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
