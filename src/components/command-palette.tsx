import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageSquare,
  Settings,
  LibraryBig,
  FolderOpen,
  Wand2,
} from "lucide-react";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Smart Email Generator", url: "/email", icon: Mail },
  { title: "Meeting Notes Summarizer", url: "/meetings", icon: FileText },
  { title: "AI Task Planner", url: "/tasks", icon: ListChecks },
  { title: "AI Research Assistant", url: "/research", icon: Search },
  { title: "Improve My Writing", url: "/improve", icon: Wand2 },
  { title: "AI Chatbot", url: "/chat", icon: MessageSquare },
  { title: "Templates", url: "/templates", icon: LibraryBig },
  { title: "Workspace", url: "/workspace", icon: FolderOpen },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search tools and pages…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {items.map((it) => (
            <CommandItem
              key={it.url}
              value={it.title}
              onSelect={() => {
                setOpen(false);
                navigate({ to: it.url });
              }}
            >
              <it.icon className="mr-2 h-4 w-4" />
              <span>{it.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
