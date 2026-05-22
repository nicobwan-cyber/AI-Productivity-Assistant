import { Button } from "@/components/ui/button";
import { Copy, Download, FileDown, Save, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { saveItem } from "@/lib/workspace";

export function OutputToolbar({
  text,
  tool,
  defaultTitle,
}: {
  text: string;
  tool: string;
  defaultTitle: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  function downloadTxt() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(defaultTitle)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded .txt");
  }

  function downloadPdf() {
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Pop-up blocked");
      return;
    }
    const safe = text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
    win.document.write(`<!doctype html><html><head><title>${defaultTitle}</title>
      <style>body{font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.55;color:#111;padding:48px;max-width:780px;margin:auto;}
      h1{font-size:18px;margin:0 0 16px;font-weight:600;}
      pre{white-space:pre-wrap;font-family:inherit;font-size:14px;}</style></head>
      <body><h1>${defaultTitle}</h1><pre>${safe}</pre>
      <script>window.onload=()=>{setTimeout(()=>window.print(),200);}</script>
      </body></html>`);
    win.document.close();
    toast.success("Opening print dialog");
  }

  function save() {
    saveItem({ title: defaultTitle, tool, content: text });
    toast.success("Saved to Workspace");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={copy}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={downloadTxt}>
        <Download className="h-3.5 w-3.5" /> TXT
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={downloadPdf}>
        <FileDown className="h-3.5 w-3.5" /> PDF
      </Button>
      <Button type="button" variant="default" size="sm" onClick={save}>
        <Save className="h-3.5 w-3.5" /> Save
      </Button>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || "output";
}
