import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Sparkles, User, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { runAi } from "@/lib/ai-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  head: () => ({ meta: [{ title: "AI Chatbot — Workplace AI" }] }),
});

const SYSTEM =
  "You are a helpful AI workplace productivity assistant. Help the user with professional writing, task planning, meeting summaries, research, and workplace communication. Give clear, practical, and professional responses. Use markdown formatting when helpful.";

const STARTERS = [
  "Help me write a professional email",
  "Summarize this meeting",
  "Plan my tasks for today",
  "Research this topic",
];

type Msg = { role: "user" | "assistant"; content: string };

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const history = next
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");
      const reply = await runAi(SYSTEM, history);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={MessageSquare}
        title="AI Chatbot"
        description="Your always-on assistant for emails, planning, research, and workplace communication."
      />

      <Card className="shadow-sm flex flex-col h-[calc(100vh-16rem)] min-h-[480px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold">How can I help you today?</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Try one of these to get started, or ask anything.
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2 max-w-xl w-full">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left rounded-xl border bg-card px-4 py-3 text-sm hover:border-primary/40 hover:shadow-sm transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  {m.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 max-w-[80%] text-sm whitespace-pre-wrap leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm",
                    )}
                  >
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:120ms]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="border-t p-3 md:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 max-w-3xl mx-auto"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask anything — emails, planning, research…"
              rows={1}
              className="min-h-[44px] max-h-40 resize-none"
            />
            <Button type="submit" disabled={loading || !input.trim()} size="icon" className="h-11 w-11">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>

      <AiDisclaimer />
    </div>
  );
}
