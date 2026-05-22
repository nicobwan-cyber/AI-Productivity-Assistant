import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Sparkles, Lightbulb } from "lucide-react";
import { getStreak, recentActivity, type ActivityEvent } from "@/lib/workspace";

export function StreakCard() {
  const [s, setS] = useState(() => getStreak());
  useEffect(() => {
    const h = () => setS(getStreak());
    window.addEventListener("workspace:activity", h);
    window.addEventListener("workspace:change", h);
    return () => {
      window.removeEventListener("workspace:activity", h);
      window.removeEventListener("workspace:change", h);
    };
  }, []);
  return (
    <Card className="shadow-sm card-lift">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4" /> Productivity streak
        </CardTitle>
        <CardDescription>Keep the momentum going.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Day streak" value={s.current} />
          <Stat label="Tools today" value={s.toolsToday} />
          <Stat label="This week" value={s.tasksThisWeek} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Weekly progress</span>
            <span>{s.weekProgress}%</span>
          </div>
          <Progress value={s.weekProgress} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2">
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

export function InsightsCard() {
  const [acts, setActs] = useState<ActivityEvent[]>([]);
  useEffect(() => {
    const refresh = () => setActs(recentActivity(20));
    refresh();
    window.addEventListener("workspace:activity", refresh);
    return () => window.removeEventListener("workspace:activity", refresh);
  }, []);
  const insights = buildInsights(acts);
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" /> Smart insights
        </CardTitle>
        <CardDescription>Suggestions based on your recent activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {insights.map((t, i) => (
            <li key={i} className="flex gap-2">
              <Lightbulb className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function buildInsights(acts: ActivityEvent[]) {
  if (!acts.length)
    return [
      "Try the Templates Library to start with a ready-made workflow.",
      "Generate your first task plan to unlock daily streaks.",
      "Save useful outputs to your Workspace for easy reuse.",
    ];
  const counts: Record<string, number> = {};
  acts.forEach((a) => (counts[a.tool] = (counts[a.tool] || 0) + 1));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const tips: string[] = [];
  if (top) tips.push(`You use ${top[0]} the most — try saving favorites as templates.`);
  if (!counts["Tasks"]) tips.push("Plan your day with the AI Task Planner for a visual schedule.");
  if (!counts["Improve Writing"])
    tips.push("Run important messages through Improve My Writing before sending.");
  if (acts.length >= 5) tips.push("You're on a roll — consider blocking deep-focus time this afternoon.");
  return tips.slice(0, 4);
}
