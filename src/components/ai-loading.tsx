import { cn } from "@/lib/utils";

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer h-3 rounded-md", className)} />;
}

export function AiThinking({
  label = "AI is thinking…",
  lines = 5,
}: {
  label?: string;
  lines?: number;
}) {
  const widths = ["w-11/12", "w-10/12", "w-9/12", "w-11/12", "w-8/12", "w-7/12", "w-10/12"];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground" />
        </span>
        {label}
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine key={i} className={widths[i % widths.length]} />
        ))}
      </div>
    </div>
  );
}
