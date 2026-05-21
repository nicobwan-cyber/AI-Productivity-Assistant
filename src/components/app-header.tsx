import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur md:px-6">
      <SidebarTrigger />
      <div className="hidden md:block">
        <h1 className="text-sm font-semibold tracking-tight">AI Workplace Productivity Assistant</h1>
      </div>
      <div className="relative ml-auto flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tools, prompts, notes…"
          className="pl-9 bg-muted/40 border-transparent focus-visible:bg-background"
        />
      </div>
      <Avatar className="h-8 w-8 border">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
      </Avatar>
    </header>
  );
}
