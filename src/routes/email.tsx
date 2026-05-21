import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { CopyButton } from "@/components/copy-button";
import { runAi } from "@/lib/ai-client";
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

  async function generate() {
    if (!purpose.trim()) {
      toast.error("Please describe the email's purpose.");
      return;
    }
    setLoading(true);
    try {
      const prompt = `Purpose: ${purpose}\nAudience/Recipient: ${audience || "general professional contact"}\nTone: ${tone}\nKey points to include:\n${points || "(none specified)"}\nDesired length: ${length}`;
      const text = await runAi(SYSTEM, prompt);
      setResult(parseEmail(text));
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
  }

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
              <Label>Email purpose</Label>
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generate} disabled={loading}>
                  <RotateCw className="h-3.5 w-3.5" /> Regenerate
                </Button>
                <CopyButton text={`Subject: ${result.subject}\n\n${result.body}`} />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading && !result && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm mt-3">Drafting your email…</p>
              </div>
            )}
            {!loading && !result && (
              <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                Your generated email will appear here.
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
                <AiDisclaimer />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
