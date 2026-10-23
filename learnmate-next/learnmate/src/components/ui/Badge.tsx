import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "violet" | "mint" | "amber" | "rose" | "sky" | "slate";
}

export function Badge({ className, variant = "violet", children, ...props }: BadgeProps) {
  const variants = {
    violet: "badge-violet",
    mint: "badge-mint",
    amber: "badge-amber",
    rose: "badge-rose",
    sky: "badge-sky",
    slate: "badge-slate",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium tracking-tight",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
