import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListChecks, Loader2, Plus, Trash2, Eraser } from "lucide-react";
import { AiThinking } from "@/components/ai-loading";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OutputToolbar } from "@/components/output-toolbar";
import { QualityScore } from "@/components/quality-score";
import { CalendarPlanner, buildDayPlan } from "@/components/calendar-planner";
import { runAi } from "@/lib/ai-client";
import { logActivity } from "@/lib/workspace";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
  head: () => ({ meta: [{ title: "AI Task Planner — Workplace AI" }] }),
});

const SYSTEM =
  "You are an AI productivity planner. Analyze the user's tasks, deadlines, time estimates, and priority levels. Create a practical plan using these exact markdown headings in order: '## Prioritized Task List', '## Suggested Schedule', '## Urgent Tasks', '## Tasks to Delegate or Delay', '## Productivity Tips'. Use bullet points under each. Keep advice concrete and respect the user's working hours.";

const SECTIONS = [
  "Prioritized Task List",
  "Suggested Schedule",
  "Urgent Tasks",
  "Tasks to Delegate or Delay",
  "Productivity Tips",
];

type Task = { name: string; deadline: string; estimate: string; priority: string };

function splitSections(text: string) {
  const map: Record<string, string> = {};
  const re = /##\s*(.+)/g;
  const matches = [...text.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const name = matches[i][1].trim();
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    map[name.toLowerCase()] = text.slice(start, end).trim();
  }
  return SECTIONS.map((s) => ({ title: s, body: map[s.toLowerCase()] || "" }));
}

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { name: "Draft Q3 OKRs", deadline: "Friday", estimate: "2h", priority: "High" },
    { name: "Review design mocks", deadline: "Today", estimate: "45m", priority: "Urgent" },
    { name: "1:1 prep notes", deadline: "Tomorrow", estimate: "30m", priority: "Medium" },
  ]);
  const [hours, setHours] = useState("9:00 – 17:00, deep work in mornings");
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState<string | null>(null);

  function update(i: number, key: keyof Task, value: string) {
    setTasks((t) => t.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));
  }
  function remove(i: number) {
    setTasks((t) => t.filter((_, idx) => idx !== i));
  }
  function add() {
    setTasks((t) => [...t, { name: "", deadline: "", estimate: "", priority: "Medium" }]);
  }

  async function plan() {
    const filled = tasks.filter((t) => t.name.trim());
    if (!filled.length) {
      toast.error("Add at least one task.");
      return;
    }
    setLoading(true);
    try {
      const taskList = filled
        .map(
          (t, i) =>
            `${i + 1}. ${t.name} — deadline: ${t.deadline || "n/a"}, estimate: ${t.estimate || "n/a"}, priority: ${t.priority}`,
        )
        .join("\n");
      const prompt = `Working hours preference: ${hours}\n\nTasks:\n${taskList}`;
      const text = await runAi(SYSTEM, prompt);
      setRaw(text);
      logActivity("Tasks", `Planned ${filled.length} task(s)`);
      toast.success("Task plan created");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setTasks([{ name: "", deadline: "", estimate: "", priority: "Medium" }]);
    setRaw(null);
  }

  const sections = raw ? splitSections(raw) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ListChecks}
        title="AI Task Planner"
        description="Prioritize what matters today and get a realistic schedule built around your hours."
      />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Your tasks</CardTitle>
          <CardDescription>Add tasks with deadlines, estimates, and priority.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="hidden md:grid grid-cols-12 gap-2 text-xs uppercase tracking-wide text-muted-foreground px-1">
            <div className="col-span-5">Task</div>
            <div className="col-span-2">Deadline</div>
            <div className="col-span-2">Estimate</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-1" />
          </div>
          {tasks.map((t, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <Input
                className="md:col-span-5"
                placeholder="Task name"
                value={t.name}
                onChange={(e) => update(i, "name", e.target.value)}
              />
              <Input
                className="md:col-span-2"
                placeholder="e.g. Friday"
                value={t.deadline}
                onChange={(e) => update(i, "deadline", e.target.value)}
              />
              <Input
                className="md:col-span-2"
                placeholder="e.g. 1h"
                value={t.estimate}
                onChange={(e) => update(i, "estimate", e.target.value)}
              />
              <Select value={t.priority} onValueChange={(v) => update(i, "priority", v)}>
                <SelectTrigger className="md:col-span-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Low", "Medium", "High", "Urgent"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="md:col-span-1 justify-self-end"
                onClick={() => remove(i)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={add}>
            <Plus className="h-4 w-4" /> Add task
          </Button>
          <div className="grid gap-2 pt-2">
            <Label>Working hours preference</Label>
            <Input value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={plan} disabled={loading} className="min-w-[160px]">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Planning…
                </>
              ) : (
                "Generate plan"
              )}
            </Button>
            <Button variant="outline" onClick={reset} disabled={loading}>
              <Eraser className="h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && !sections && (
        <Card className="shadow-sm">
          <CardContent className="py-8">
            <AiThinking label="Building your task plan…" lines={6} />
          </CardContent>
        </Card>
      )}

      {sections && (
        <>
          <div className="flex justify-end">
            <OutputToolbar text={raw!} tool="Tasks" defaultTitle="Task plan" />
          </div>
          <CalendarPlanner plan={buildDayPlan(tasks.filter((t) => t.name.trim()))} />
          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((s) => (
              <Card key={s.title} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                    {s.body || "—"}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
          <QualityScore text={raw!} />
          <AiDisclaimer />
        </>
      )}
    </div>
  );
}
