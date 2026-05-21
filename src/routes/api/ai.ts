import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

type Body = { system?: string; prompt?: string };

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const { system, prompt } = ((await request.json()) ?? {}) as Body;
        if (!prompt) return new Response("prompt required", { status: 400 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");
        try {
          const { text } = await generateText({ model, system, prompt });
          return Response.json({ text });
        } catch (e: unknown) {
          const err = e as { statusCode?: number; status?: number; message?: string };
          const status = err.statusCode || err.status || 500;
          if (status === 429)
            return Response.json({ error: "Rate limit. Try again shortly." }, { status });
          if (status === 402)
            return Response.json(
              { error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." },
              { status },
            );
          return Response.json({ error: err.message || "AI request failed" }, { status });
        }
      },
    },
  },
});
