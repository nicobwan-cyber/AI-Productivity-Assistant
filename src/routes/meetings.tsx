import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Loader2, Eraser } from "lucide-react";
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
import { VoiceInputButton } from "@/components/voice-input-button";
import { runAi } from "@/lib/ai-client";
import { logActivity } from "@/lib/workspace";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/meetings")({
  component: MeetingsPage,
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer — Workplace AI" }] }),
});

const SYSTEM =
  "You are a meeting productivity assistant. Summarize the meeting notes into clear sections using these exact markdown headings, in this order: '## Key Discussion Points', '## Decisions Made', '## Action Items', '## Owners', '## Deadlines', '## Follow-Up Questions'. Use bullet points under each heading. Keep the output professional, concise, and easy to scan.";

const SECTIONS = [
  "Key Discussion Points",
  "Decisions Made",
  "Action Items",
  "Owners",
  "Deadlines",
  "Follow-Up Questions",
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

function MeetingsPage() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [style, setStyle] = useState("Detailed");
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState<string | null>(null);

  async function summarize() {
    if (!notes.trim()) {
      toast.error("Paste meeting notes or a transcript first.");
      return;
    }
    setLoading(true);
    try {
      const prompt = `Meeting title: ${title || "Untitled meeting"}\nSummary style: ${style}\n\nMeeting notes / transcript:\n${notes}`;
      const text = await runAi(SYSTEM, prompt);
      setRaw(text);
      toast.success("Summary generated");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setTitle("");
    setNotes("");
    setStyle("Detailed");
    setRaw(null);
  }

  const sections = raw ? splitSections(raw) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Meeting Notes Summarizer"
        description="Paste raw notes or a transcript and get a structured summary with action items."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Meeting input</CardTitle>
            <CardDescription>The more detail, the sharper the summary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Meeting title</Label>
              <Input
                placeholder="e.g. Q3 Roadmap Sync"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Summary style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Brief", "Detailed", "Executive Summary"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes / transcript</Label>
              <Textarea
                rows={12}
                placeholder="Paste your meeting notes or transcript here…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={summarize} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Summarizing…
                  </>
                ) : (
                  "Summarize meeting"
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
                <AiThinking label="Reading and structuring your meeting…" lines={6} />
              </CardContent>
            </Card>
          )}
          {!loading && !sections && (
            <Card className="shadow-sm border-dashed">
              <CardContent className="p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border bg-background text-muted-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-medium">No summary yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Paste a transcript or rough notes to get a structured recap.
                </p>
              </CardContent>
            </Card>
          )}
          {sections && (
            <>
              <div className="flex justify-end">
                <CopyButton text={raw!} label="Copy summary" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
