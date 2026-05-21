import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Workplace AI" }] }),
});

function SettingsPage() {
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [dark, setDark] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Configure default preferences for your AI tools."
      />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>AI defaults</CardTitle>
          <CardDescription>Used as starting values across your tools.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Preferred tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Professional", "Friendly", "Persuasive", "Apologetic", "Formal", "Short"].map(
                  (t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default output length</Label>
            <Select value={length} onValueChange={setLength}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Short", "Medium", "Detailed"].map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Helps the AI personalize responses.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Company</Label>
            <Input
              placeholder="e.g. Acme Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input
              placeholder="e.g. Product Manager"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Theme preferences (placeholder).</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-xs text-muted-foreground">Coming soon.</p>
          </div>
          <Switch checked={dark} onCheckedChange={setDark} />
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">AI disclaimer reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            AI-generated content may require human review. Verify facts and sensitive details before
            sharing externally.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Settings saved")}>
          <Save className="h-4 w-4" /> Save changes
        </Button>
      </div>

      <AiDisclaimer />
    </div>
  );
}
