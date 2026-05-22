import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wand2, Loader2, Eraser } from "lucide-react";
import { AiThinking } from "@/components/ai-loading";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/improve")({
  component: ImprovePage,
  head: () => ({ meta: [{ title: "Improve My Writing — Workplace AI" }] }),
});

const STYLES = ["Professional", "Clearer", "More polite", "More persuasive", "More concise"];

function ImprovePage() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("template.prefill");
      if (raw) {
        const { value, tool } = JSON.parse(raw);
        if (tool === "/improve") setText(value);
        sessionStorage.removeItem("template.prefill");
      }
    } catch {}
  }, []);

  async function improve() {
    if (!text.trim()) return toast.error("Paste some text first.");
    setLoading(true);
    try {
      const system = `You are a professional writing coach. Rewrite the user's text to be ${style.toLowerCase()}. Keep the meaning and any specific facts. Return only the rewritten text, no preamble.`;
      const out = await runAi(system, text);
      setResult(out);
      logActivity("Improve Writing", `Rewrote text (${style})`);
      toast.success("Rewritten");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Wand2}
        title="Improve My Writing"
        description="Paste rough text and rewrite it for professionalism, clarity, politeness, persuasion, or conciseness."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Your text</CardTitle>
            <CardDescription>Drop a rough draft. We'll polish it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Improvement style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Original text</Label>
                <VoiceInputButton onResult={(t) => setText((p) => (p ? p + " " + t : t))} />
              </div>
              <Textarea
                rows={10}
                placeholder="Paste your draft here…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={improve} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Improving…
                  </>
                ) : (
                  "Improve text"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setText("");
                  setResult(null);
                }}
              >
                <Eraser className="h-4 w-4" /> Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Improved version</CardTitle>
                <CardDescription>Polished output — review before sending.</CardDescription>
              </div>
              {result && <OutputToolbar text={result} tool="Improve Writing" defaultTitle={`Improved (${style})`} />}
            </CardHeader>
            <CardContent>
              {loading && !result && <AiThinking label="Improving your text…" lines={6} />}
              {!loading && !result && (
                <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                  Your improved text will appear here.
                </div>
              )}
              {result && (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {result}
                </pre>
              )}
            </CardContent>
          </Card>
          {result && <QualityScore text={result} />}
          {result && <AiDisclaimer />}
        </div>
      </div>
    </div>
  );
}
