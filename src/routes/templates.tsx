import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LibraryBig, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TEMPLATES } from "@/lib/templates";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
  head: () => ({ meta: [{ title: "AI Templates Library — Workplace AI" }] }),
});

function TemplatesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const navigate = useNavigate();

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))],
    [],
  );
  const filtered = TEMPLATES.filter(
    (t) =>
      (cat === "All" || t.category === cat) &&
      (q.trim() === "" ||
        (t.title + " " + t.description + " " + t.body).toLowerCase().includes(q.toLowerCase())),
  );

  function use(t: (typeof TEMPLATES)[number]) {
    sessionStorage.setItem(
      "template.prefill",
      JSON.stringify({ key: t.prefillKey, value: t.body, tool: t.tool }),
    );
    navigate({ to: t.tool });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LibraryBig}
        title="AI Templates Library"
        description="Ready-made workplace templates. Pick one and the right tool opens, pre-filled."
      />

      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search templates…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={
                    "rounded-full border px-3 py-1 text-xs transition " +
                    (c === cat
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background hover:bg-muted")
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <Card key={t.id} className="shadow-sm card-lift flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{t.category}</Badge>
              </div>
              <CardTitle className="text-base mt-2">{t.title}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{t.body}</p>
              <Button size="sm" onClick={() => use(t)}>
                Use template
              </Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">
            No templates match your search.
          </p>
        )}
      </div>
    </div>
  );
}
