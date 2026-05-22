import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";
import { scoreOutput } from "@/lib/quality";

export function QualityScore({ text }: { text: string }) {
  const s = useMemo(() => scoreOutput(text), [text]);
  const rows = [
    { label: "Clarity", v: s.clarity },
    { label: "Tone", v: s.tone },
    { label: "Completeness", v: s.completeness },
    { label: "Actionability", v: s.actionability },
  ];
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> AI Quality Score
          </span>
          <span className="text-2xl font-semibold tabular-nums">{s.overall}/100</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="tabular-nums font-medium">{r.v}</span>
              </div>
              <Progress value={r.v} className="h-1.5" />
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Improvement suggestions
          </p>
          <ul className="space-y-1.5 text-sm">
            {s.suggestions.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
