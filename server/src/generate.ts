import Anthropic from "@anthropic-ai/sdk";
import {
  GenerateResult,
  SYSTEM_PROMPT,
  buildUserPrompt,
  resultJsonSchema,
  type GenerateRequest,
} from "./prompt.js";

const MODEL = process.env.AI_MODEL ?? "claude-opus-5-5";
// Lời chúc là việc nhẹ: effort thấp cho nhanh và rẻ. Đổi qua biến môi trường nếu muốn.
const EFFORT = (process.env.AI_EFFORT ?? "low") as "low" | "medium" | "high";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export class AiRefusal extends Error {}

export async function generateWithClaude(req: GenerateRequest): Promise<GenerateResult> {
  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    // Nếu model chính từ chối, API tự chạy lại trên model dự phòng.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    output_config: {
      effort: EFFORT,
      format: { type: "json_schema", schema: resultJsonSchema },
    },
    messages: [{ role: "user", content: buildUserPrompt(req) }],
  });

  if (response.stop_reason === "refusal") throw new AiRefusal("Claude declined this request");

  const text = response.content
    .flatMap((b) => (b.type === "text" ? [b.text] : []))
    .join("");
  return GenerateResult.parse(JSON.parse(text));
}
