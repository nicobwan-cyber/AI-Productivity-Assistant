import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Focus, Calendar as CalIcon } from "lucide-react";

export type Block = {
  start: string; // "09:00"
  end: string;
  label: string;
  type: "focus" | "task" | "break" | "meeting";
  priority?: "Low" | "Medium" | "High" | "Urgent";
};

export type DayPlan = { blocks: Block[] };

// Build a default visual day from a list of tasks
export function buildDayPlan(
  tasks: { name: string; estimate: string; priority: string }[],
  startHour = 9,
  endHour = 17,
): DayPlan {
  const blocks: Block[] = [];
  let cursor = startHour * 60;
  const end = endHour * 60;

  blocks.push({ start: fmt(cursor), end: fmt(cursor + 90), label: "Deep Focus Block", type: "focus" });
  cursor += 90;

  const sorted = [...tasks].sort((a, b) => prio(b.priority) - prio(a.priority));
  for (const t of sorted) {
    if (cursor >= end) break;
    const dur = Math.max(30, parseEstimate(t.estimate));
    if (cursor + dur > end) break;
    blocks.push({
      start: fmt(cursor),
      end: fmt(cursor + dur),
      label: t.name,
      type: "task",
      priority: (t.priority as Block["priority"]) || "Medium",
    });
    cursor += dur;
    // insert short break every ~2h
    if (cursor - startHour * 60 > 0 && (cursor - startHour * 60) % 120 < dur) {
      if (cursor + 15 < end) {
        blocks.push({ start: fmt(cursor), end: fmt(cursor + 15), label: "Short break", type: "break" });
        cursor += 15;
      }
    }
  }
  if (cursor < end) {
    blocks.push({
      start: fmt(cursor),
      end: fmt(Math.min(end, cursor + 60)),
      label: "Buffer / catch-up",
      type: "break",
    });
  }
  return { blocks };
}

function fmt(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function parseEstimate(s: string) {
  if (!s) return 45;
  const m = s.match(/(\d+(?:\.\d+)?)\s*(h|hr|hour|m|min)?/i);
  if (!m) return 45;
  const n = parseFloat(m[1]);
  const unit = (m[2] || "h").toLowerCase();
  return unit.startsWith("h") ? Math.round(n * 60) : Math.round(n);
}
function prio(p: string) {
  return { Urgent: 4, High: 3, Medium: 2, Low: 1 }[p as "Urgent"] ?? 2;
}

const TYPE_STYLES: Record<Block["type"], string> = {
  focus: "bg-foreground text-background",
  task: "bg-card border border-foreground/20",
  break: "bg-muted text-muted-foreground border border-dashed",
  meeting: "bg-card border border-foreground/40",
};
const PRIORITY_BADGE: Record<NonNullable<Block["priority"]>, string> = {
  Urgent: "bg-foreground text-background",
  High: "bg-foreground/80 text-background",
  Medium: "bg-muted text-foreground",
  Low: "bg-muted text-muted-foreground",
};

export function CalendarPlanner({ plan }: { plan: DayPlan }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalIcon className="h-4 w-4" /> Today's visual schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative ml-4 border-l border-dashed">
          {plan.blocks.map((b, i) => (
            <li key={i} className="relative pl-4 pb-3 last:pb-0">
              <span className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-foreground" />
              <div className="flex items-center gap-3">
                <span className="tabular-nums text-xs text-muted-foreground w-24 shrink-0">
                  {b.start} – {b.end}
                </span>
                <div
                  className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm ${TYPE_STYLES[b.type]}`}
                >
                  {b.type === "focus" && <Focus className="h-3.5 w-3.5" />}
                  {b.type === "break" && <Coffee className="h-3.5 w-3.5" />}
                  <span className="flex-1 truncate">{b.label}</span>
                  {b.priority && b.type === "task" && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${PRIORITY_BADGE[b.priority]}`}>
                      {b.priority}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
