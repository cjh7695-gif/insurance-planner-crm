import { cn } from "@/lib/utils";

export function Progress({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-2 overflow-hidden rounded bg-slate-100", className)}>
      <div className="h-full rounded bg-emerald-500 transition-all" style={{ width: `${width}%` }} />
    </div>
  );
}
