import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Loader2, RotateCw, Eraser, Sparkles } from "lucide-react";
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

export const Route = createFileRoute("/email")({
  component: EmailPage,
  head: () => ({ meta: [{ title: "Smart Email Generator — Workplace AI" }] }),
});

const SYSTEM =
  "You are a professional workplace communication assistant. Write a clear, polished email based on the user's purpose, audience, tone, key points, and desired length. Make the email natural, professional, and easy to understand. Always start with a single line in the exact format: 'Subject: <subject line>'. Then a blank line, then the email body with greeting, paragraphs, and sign-off. Avoid overly robotic language.";

function parseEmail(text: string) {
  const m = text.match(/^\s*subject\s*[:\-]\s*(.+)$/im);
  const subject = m?.[1]?.trim() ?? "";
  const body = subject ? text.replace(m![0], "").trim() : text.trim();
  return { subject, body };
}

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [points, setPoints] = useState("");
  const [length, setLength] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("template.prefill");
      if (raw) {
        const { value, tool } = JSON.parse(raw);
        if (tool === "/email") setPurpose(value);
        sessionStorage.removeItem("template.prefill");
      }
    } catch {}
  }, []);

  async function generate() {
    if (!purpose.trim()) {
      toast.error("Please describe the email's purpose.");
      return;
    }
    setLoading(true);
    try {
      const prompt = `Purpose: ${purpose}\nAudience/Recipient: ${audience || "general professional contact"}\nTone: ${tone}\nKey points to include:\n${points || "(none specified)"}\nDesired length: ${length}`;
      const text = await runAi(SYSTEM, prompt);
      const parsed = parseEmail(text);
      setResult(parsed);
      logActivity("Email", parsed.subject || "Drafted email");
      toast.success("Email generated");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPurpose("");
    setAudience("");
    setTone("Professional");
    setPoints("");
    setLength("Medium");
    setResult(null);
    toast("Output cleared");
  }

  const EXAMPLES = [
    "Follow up with a prospect after a demo",
    "Politely decline a meeting request",
    "Request a deadline extension on a project",
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Draft polished, on-brand emails in seconds. Just describe what you need."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Email details</CardTitle>
            <CardDescription>Tell the AI what you want to send.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Email purpose</Label>
                <VoiceInputButton onResult={(t) => setPurpose((p) => (p ? p + " " + t : t))} />
              </div>
              <Input
                placeholder="e.g. Follow up with a prospect after a demo"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Recipient / audience</Label>
              <Input
                placeholder="e.g. Marketing director at a mid-market SaaS company"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Professional", "Friendly", "Persuasive", "Apologetic", "Formal", "Short"].map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Short", "Medium", "Detailed"].map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Key points to include</Label>
              <Textarea
                rows={5}
                placeholder={"- Thank them for their time\n- Mention next steps\n- Suggest a meeting next week"}
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={generate} disabled={loading} className="flex-1 min-w-[140px]">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>Generate email</>
                )}
              </Button>
              <Button variant="outline" onClick={reset} disabled={loading}>
                <Eraser className="h-4 w-4" /> Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Generated email</CardTitle>
              <CardDescription>Review, copy, or regenerate as needed.</CardDescription>
            </div>
            {result && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={generate} disabled={loading}>
                  <RotateCw className="h-3.5 w-3.5" /> Regenerate
                </Button>
                <OutputToolbar
                  text={`Subject: ${result.subject}\n\n${result.body}`}
                  tool="Email"
                  defaultTitle={result.subject || "Generated email"}
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading && !result && <AiThinking label="Drafting your email…" lines={6} />}
            {!loading && !result && (
              <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border bg-background text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-medium">No email yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Describe your purpose, or try an example:
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setPurpose(ex)}
                      className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground hover:border-foreground/30"
                    >
                      <Sparkles className="mr-1 inline h-3 w-3" />
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {result && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Subject</p>
                  <p className="font-medium mt-1">{result.subject || "(no subject)"}</p>
                </div>
                <div className="rounded-lg border bg-card px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Body</p>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {result.body}
                  </pre>
                </div>
                <QualityScore text={`${result.subject}\n\n${result.body}`} />
                <AiDisclaimer />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
