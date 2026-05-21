import { logger } from "./logger";

const API_URL  = "https://api.anthropic.com/v1/messages";
const API_KEY  = process.env.ANTHROPIC_API_KEY ?? "";
export const AI_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929";

export interface ChiamataClaudeResult {
  testo: string;
  tokenInput: number;
  tokenOutput: number;
  tokenTotale: number;
}

export async function chiamataClaude({
  systemPrompt,
  userPrompt,
  maxTokens,
}: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
}): Promise<ChiamataClaudeResult> {
  if (!API_KEY) {
    throw { code: "api_key_invalid", detail: "ANTHROPIC_API_KEY non configurata" };
  }

  let resp: Response;
  try {
    resp = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
  } catch (e: any) {
    throw { code: "ai_error", detail: `Rete: ${e?.message ?? "fetch failed"}` };
  }

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    if (resp.status === 429) throw { code: "rate_limit",       detail: body.slice(0, 200) };
    if (resp.status === 401) throw { code: "api_key_invalid",  detail: body.slice(0, 200) };
    throw { code: "ai_error", detail: `HTTP ${resp.status}: ${body.slice(0, 200)}` };
  }

  let data: any;
  try {
    data = await resp.json();
  } catch {
    throw { code: "ai_error", detail: "Risposta non JSON da Anthropic" };
  }

  const testo        = (data.content?.[0]?.text as string) ?? "";
  const tokenInput   = (data.usage?.input_tokens  as number) ?? 0;
  const tokenOutput  = (data.usage?.output_tokens as number) ?? 0;

  logger.info({ model: AI_MODEL, tokenInput, tokenOutput }, "ai-claude: chiamata completata");
  return { testo, tokenInput, tokenOutput, tokenTotale: tokenInput + tokenOutput };
}
