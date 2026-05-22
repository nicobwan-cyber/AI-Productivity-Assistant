import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderOpen, Search, Trash2, Pencil, Check, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listItems, renameItem, deleteItem, type WorkspaceItem } from "@/lib/workspace";
import { toast } from "sonner";

export const Route = createFileRoute("/workspace")({
  component: WorkspacePage,
  head: () => ({ meta: [{ title: "Saved Workspace — Workplace AI" }] }),
});

function WorkspacePage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [q, setQ] = useState("");
  const [viewing, setViewing] = useState<WorkspaceItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function refresh() {
    setItems(listItems());
  }
  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("workspace:change", h);
    return () => window.removeEventListener("workspace:change", h);
  }, []);

  const filtered = items.filter(
    (i) =>
      q.trim() === "" ||
      (i.title + " " + i.content + " " + i.tool).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FolderOpen}
        title="Saved Workspace"
        description="All your saved AI outputs in one place. Search, rename, view, or remove."
      />

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search saved items…"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            <FolderOpen className="mx-auto mb-3 h-10 w-10 opacity-50" />
            Nothing saved yet. Generate an output, then click <b>Save</b>.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((it) => (
            <Card key={it.id} className="shadow-sm card-lift">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {editingId === it.id ? (
                      <div className="flex gap-2">
                        <Input
                          autoFocus
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              renameItem(it.id, draft.trim() || it.title);
                              setEditingId(null);
                              toast.success("Renamed");
                            }
                          }}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            renameItem(it.id, draft.trim() || it.title);
                            setEditingId(null);
                            toast.success("Renamed");
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <CardTitle className="text-base truncate">{it.title}</CardTitle>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{it.tool}</Badge>
                      <span>{new Date(it.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setViewing(it)}>
                      View
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(it.id);
                        setDraft(it.title);
                      }}
                      title="Rename"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        deleteItem(it.id);
                        toast("Deleted");
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{it.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed max-h-[60vh] overflow-auto rounded-lg border bg-muted/30 p-4">
                {viewing.content}
              </pre>
              <div className="flex justify-end">
                <CopyButton text={viewing.content} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
