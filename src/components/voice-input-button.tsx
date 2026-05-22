import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function VoiceInputButton({ onResult }: { onResult?: (t: string) => void }) {
  function handle() {
    // Prototype only — try Web Speech API if available, otherwise show a toast.
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast("Voice input is a prototype", {
        description: "Your browser doesn't support speech recognition yet.",
      });
      return;
    }
    try {
      const r = new SR();
      r.lang = "en-US";
      r.interimResults = false;
      r.maxAlternatives = 1;
      toast("Listening… speak now");
      r.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        onResult?.(text);
        toast.success("Captured");
      };
      r.onerror = () => toast.error("Could not capture voice");
      r.start();
    } catch {
      toast.error("Voice input unavailable");
    }
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handle}
      title="Voice input (prototype)"
      aria-label="Voice input"
    >
      <Mic className="h-4 w-4" />
    </Button>
  );
}
