import * as React from "react";
import { cn } from "@/lib/utils";

const toneClass = {
  slate: "bg-slate-100 text-slate-700",
  emerald: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  sky: "bg-sky-100 text-sky-800",
  rose: "bg-rose-100 text-rose-800",
  violet: "bg-violet-100 text-violet-800"
} as const;

export function Badge({
  className,
  tone = "slate",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof toneClass;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium leading-5",
        toneClass[tone],
        className
      )}
      {...props}
    />
  );
}
