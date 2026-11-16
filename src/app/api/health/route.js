import { getModels, isAiConfigured } from "@/server/config";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { aiConfigured: isAiConfigured(), ...getModels() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
