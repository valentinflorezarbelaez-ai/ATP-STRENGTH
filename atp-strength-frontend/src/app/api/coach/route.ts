import { APICallError, generateText } from "ai";
import { finalizeLiveCoach, prepareLiveCoach } from "@/lib/coachKnowledgeBase.mjs";

export const runtime = "nodejs";
export const maxDuration = 30;

const DEFAULT_MODEL = "google/gemini-2.5-flash";

type LiveTurn =
  | { kind: "empty" }
  | { kind: "pain"; answer: unknown }
  | { kind: "model"; system: string; messages: Array<{ role: "user" | "assistant"; content: string }> };

function modelId(): string {
  const configured = process.env.AI_GATEWAY_MODEL;
  if (typeof configured === "string" && configured.includes("/")) return configured.trim();
  return DEFAULT_MODEL;
}

function asTurn(value: unknown): LiveTurn {
  if (!value || typeof value !== "object" || !("kind" in value)) return { kind: "empty" };
  const kind = (value as { kind?: unknown }).kind;
  if (kind === "empty") return { kind: "empty" };
  if (kind === "pain" && "answer" in value) return { kind: "pain", answer: (value as { answer: unknown }).answer };
  if (kind === "model" && "system" in value && "messages" in value) {
    const record = value as { system?: unknown; messages?: unknown };
    const messages = Array.isArray(record.messages)
      ? record.messages.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const turn = item as { role?: unknown; content?: unknown };
        if ((turn.role !== "user" && turn.role !== "assistant") || typeof turn.content !== "string") return [];
        const role: "user" | "assistant" = turn.role;
        return [{ role, content: turn.content }];
      })
      : [];
    if (typeof record.system !== "string" || messages.length === 0) return { kind: "empty" };
    return { kind: "model", system: record.system, messages };
  }
  return { kind: "empty" };
}

function gatewayFailure(error: unknown): { status: number; body: string } {
  if (APICallError.isInstance(error)) {
    const status = typeof error.statusCode === "number" ? error.statusCode : 502;
    const body = typeof error.responseBody === "string" && error.responseBody.trim()
      ? error.responseBody
      : error.message;
    return { status, body: body.slice(0, 4000) };
  }
  if (error instanceof Error) return { status: 502, body: error.message.slice(0, 4000) };
  return { status: 502, body: "unknown" };
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid-json" }, { status: 400 });
  }

  const prepared = prepareLiveCoach(
    (payload && typeof payload === "object" ? payload : {}) as Parameters<typeof prepareLiveCoach>[0],
  );
  const turn = asTurn(prepared);
  switch (turn.kind) {
    case "empty":
      return Response.json({ error: "empty" }, { status: 400 });
    case "pain":
      return Response.json(turn.answer);
    case "model":
      try {
        const result = await generateText({
          model: modelId(),
          system: turn.system,
          messages: turn.messages,
        });
        return Response.json(finalizeLiveCoach(prepared, result.text));
      } catch (error) {
        const failure = gatewayFailure(error);
        const status = failure.status >= 400 && failure.status < 600 ? failure.status : 502;
        return Response.json(
          { error: "gateway", gatewayStatus: failure.status, gatewayBody: failure.body },
          { status },
        );
      }
    default: {
      const exhaustive: never = turn;
      return exhaustive;
    }
  }
}
