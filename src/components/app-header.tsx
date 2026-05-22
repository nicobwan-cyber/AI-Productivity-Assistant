import { Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPod|iPad/i.test(navigator.platform));
  }, []);

  function openPalette() {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: !isMac, metaKey: isMac }),
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/40 bg-background/60 px-3 backdrop-blur-xl md:px-6">
      <SidebarTrigger />
      <div className="hidden md:block">
        <h1 className="text-sm font-semibold tracking-tight">AI Workplace Productivity Assistant</h1>
      </div>
      <button
        type="button"
        onClick={openPalette}
        className="group ml-auto flex-1 max-w-md flex items-center gap-2 rounded-lg border border-border/70 bg-white/40 px-3 py-1.5 text-left text-sm text-muted-foreground backdrop-blur hover:bg-white/60 hover:border-foreground/20"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 truncate">Search tools, prompts, notes…</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background/70 px-1.5 font-mono text-[10px] text-muted-foreground">
          {isMac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white/60 backdrop-blur">
        <User className="h-4 w-4 text-foreground/70" />
      </div>
    </header>
  );
}
