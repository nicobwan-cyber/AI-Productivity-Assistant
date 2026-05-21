import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard — AI Workplace Productivity Assistant" }],
  }),
});

const stats = [
  { label: "Emails Generated", value: 128, delta: "+12 this week", icon: Mail },
  { label: "Meetings Summarized", value: 34, delta: "+5 this week", icon: FileText },
  { label: "Tasks Planned", value: 212, delta: "+24 this week", icon: ListChecks },
  { label: "Research Reports", value: 18, delta: "+3 this week", icon: Search },
];

const tools = [
  {
    title: "Smart Email Generator",
    desc: "Draft polished emails in any tone.",
    to: "/email",
    icon: Mail,
  },
  {
    title: "Meeting Notes Summarizer",
    desc: "Turn raw notes into action items.",
    to: "/meetings",
    icon: FileText,
  },
  {
    title: "AI Task Planner",
    desc: "Prioritize and schedule your day.",
    to: "/tasks",
    icon: ListChecks,
  },
  {
    title: "AI Research Assistant",
    desc: "Get briefs, insights, and risks.",
    to: "/research",
    icon: Search,
  },
  {
    title: "AI Chatbot",
    desc: "Ask anything productivity-related.",
    to: "/chat",
    icon: MessageSquare,
  },
];

const activity = [
  { tool: "Email Generator", text: "Drafted a follow-up to Acme Corp", time: "2h ago" },
  { tool: "Meetings", text: "Summarized Q3 planning sync", time: "5h ago" },
  { tool: "Task Planner", text: "Reorganized this week's sprint", time: "Yesterday" },
  { tool: "Research", text: "Brief on EU AI Act compliance", time: "2d ago" },
];

function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit gap-1">
          <Sparkles className="h-3 w-3" />
          Welcome back
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Good to see you, Jordan 👋</h1>
        <p className="text-muted-foreground max-w-2xl">
          Your AI workplace co-pilot is ready. Draft an email, plan your tasks, or summarize a meeting
          in seconds.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <s.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{s.value}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {s.delta}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump directly into one of your AI tools.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {tools.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <t.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{t.title}</p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Your latest AI-generated work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.tool} · {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-generated content may require human review. Always verify facts, tone, and
                sensitive details before sending or publishing.
              </p>
              <Button asChild variant="link" className="px-0 mt-2">
                <Link to="/settings">Adjust AI preferences →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AiDisclaimer />
    </div>
  );
}
