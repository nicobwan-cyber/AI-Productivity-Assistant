import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles } from "lucide-react";
import { getOnboarding, setOnboarding } from "@/lib/workspace";
import { TEMPLATES } from "@/lib/templates";
import { toast } from "sonner";

const ROLES = ["Manager", "Engineer", "Founder", "Marketing", "Sales", "Operations", "Other"];
const TONES = ["Professional", "Friendly", "Direct", "Persuasive"];
const TOOLS = [
  { id: "/email", label: "Smart Email Generator" },
  { id: "/meetings", label: "Meeting Notes Summarizer" },
  { id: "/tasks", label: "AI Task Planner" },
  { id: "/research", label: "AI Research Assistant" },
  { id: "/chat", label: "AI Chatbot" },
  { id: "/improve", label: "Improve My Writing" },
];

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("Manager");
  const [tone, setTone] = useState("Professional");
  const [tools, setTools] = useState<string[]>(["/email", "/tasks"]);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!getOnboarding()) {
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  function finish(templateId?: string) {
    setOnboarding({ role, tone, tools, template: templateId });
    setOpen(false);
    toast.success("Welcome aboard");
    if (templateId) {
      const t = TEMPLATES.find((x) => x.id === templateId);
      if (t) {
        sessionStorage.setItem(
          "template.prefill",
          JSON.stringify({ key: t.prefillKey, value: t.body, tool: t.tool }),
        );
        navigate({ to: t.tool });
      }
    }
  }

  const recommended = TEMPLATES.slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Welcome to Workplace AI
          </DialogTitle>
          <DialogDescription>
            A 30-second setup so we can tailor recommendations to your work.
          </DialogDescription>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-3">
            <Label>What best describes your role?</Label>
            <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                >
                  <RadioGroupItem value={r} />
                  {r}
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <Label>Preferred tone for AI outputs</Label>
            <RadioGroup value={tone} onValueChange={setTone} className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <label
                  key={t}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                >
                  <RadioGroupItem value={t} />
                  {t}
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Label>Which tools will you use most?</Label>
            <div className="grid gap-2">
              {TOOLS.map((t) => {
                const checked = tools.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) =>
                        setTools((prev) =>
                          v ? [...prev, t.id] : prev.filter((x) => x !== t.id),
                        )
                      }
                    />
                    {t.label}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <Label>Start with a recommended template</Label>
            <div className="grid gap-2">
              {recommended.map((t) => (
                <button
                  key={t.id}
                  onClick={() => finish(t.id)}
                  className="flex flex-col items-start rounded-lg border p-3 text-left hover:bg-muted"
                >
                  <span className="text-sm font-medium">{t.title}</span>
                  <span className="text-xs text-muted-foreground">{t.description}</span>
                </button>
              ))}
              <button
                onClick={() => finish()}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline self-start"
              >
                Skip — I'll explore on my own
              </button>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <span className="text-xs text-muted-foreground">Step {step + 1} of 4</span>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < 3 && <Button onClick={() => setStep(step + 1)}>Continue</Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
