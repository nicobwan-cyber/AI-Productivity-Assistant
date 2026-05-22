import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2, Eraser } from "lucide-react";
import { AiThinking } from "@/components/ai-loading";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { runAi } from "@/lib/ai-client";
import { logActivity } from "@/lib/workspace";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/research")({
  component: ResearchPage,
  head: () => ({ meta: [{ title: "AI Research Assistant — Workplace AI" }] }),
});

const SYSTEM =
  "You are an AI research assistant. Provide a clear and useful research response based on the topic, goal, audience, and output type. Organize the response using these exact markdown headings in this order: '## Executive Summary', '## Key Insights', '## Important Points', '## Opportunities', '## Risks or Limitations', '## Recommendations'. Use bullet points where appropriate. Keep the language professional and easy to understand.";

const SECTIONS = [
  "Executive Summary",
  "Key Insights",
  "Important Points",
  "Opportunities",
  "Risks or Limitations",
  "Recommendations",
];

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

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [output, setOutput] = useState("Report");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState<string | null>(null);

  useEffect(() => {
    try {
      const r = sessionStorage.getItem("template.prefill");
      if (r) {
        const { value, tool } = JSON.parse(r);
        if (tool === "/research") setTopic(value);
        sessionStorage.removeItem("template.prefill");
      }
    } catch {}
  }, []);

  async function go() {
    if (!topic.trim()) {
      toast.error("Add a research topic.");
      return;
    }
    setLoading(true);
    try {
      const prompt = `Topic: ${topic}\nGoal: ${goal || "general understanding"}\nAudience: ${audience || "internal team"}\nDesired output type: ${output}\nAdditional context: ${context || "none"}`;
      const text = await runAi(SYSTEM, prompt);
      setRaw(text);
      logActivity("Research", topic);
      toast.success("Research ready");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setTopic("");
    setGoal("");
    setAudience("");
    setOutput("Report");
    setContext("");
    setRaw(null);
  }

  const sections = raw ? splitSections(raw) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Search}
        title="AI Research Assistant"
        description="Get structured briefs, insights, opportunities, and risks on any topic."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Research brief</CardTitle>
            <CardDescription>Describe what you want to learn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Research topic</Label>
              <Input
                placeholder="e.g. AI adoption trends in mid-market SaaS"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Research goal</Label>
              <Input
                placeholder="e.g. Inform our 2026 GTM strategy"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Target audience</Label>
              <Input
                placeholder="e.g. Executive leadership team"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Output type</Label>
              <Select value={output} onValueChange={setOutput}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Summary", "Report", "Bullet Points", "Pros and Cons", "Strategy Brief"].map(
                    (o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional context</Label>
              <Textarea
                rows={4}
                placeholder="Any company specifics, prior findings, constraints…"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={go} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Researching…
                  </>
                ) : (
                  "Run research"
                )}
              </Button>
              <Button variant="outline" onClick={reset} disabled={loading}>
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {loading && !sections && (
            <Card className="shadow-sm">
              <CardContent className="py-8">
                <AiThinking label="Synthesizing findings…" lines={7} />
              </CardContent>
            </Card>
          )}
          {!loading && !sections && (
            <Card className="shadow-sm border-dashed">
              <CardContent className="p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border bg-background text-muted-foreground">
                  <Search className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-medium">Nothing researched yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a topic like “AI adoption trends in mid-market SaaS”.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {[
                    "AI adoption in healthcare",
                    "Remote work productivity trends",
                    "Sustainable supply chain practices",
                  ].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setTopic(ex)}
                      className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground hover:border-foreground/30"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {sections && (
            <>
              <div className="flex justify-end">
                <CopyButton text={raw!} label="Copy report" />
              </div>
              <div className="space-y-4">
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
              <AiDisclaimer />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
