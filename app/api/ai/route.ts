import { NextResponse } from "next/server";
import { getDashboardUserState } from "../../lib/dashboardAuth";

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const MAX_PROMPT_LENGTH = 4000;

function safeError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: Request) {
  const auth = await getDashboardUserState();

  if ("error" in auth) {
    return safeError("Unauthorized", 401);
  }

  if (auth.entitlement.tier === "free") {
    return safeError("Upgrade to Pro or Elite to use AI.", 403);
  }

  const body = await request.json().catch(() => null);
  const prompt = String(body?.prompt || "").trim();

  if (!prompt) {
    return safeError("Prompt is required.");
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return safeError(`Prompt must be ${MAX_PROMPT_LENGTH} characters or less.`);
  }

  if (!process.env.OPENAI_API_KEY) {
    return safeError("AI is not configured yet. Add OPENAI_API_KEY.", 503);
  }

  console.info("[api/ai] request", {
    userId: auth.user.id,
    tier: auth.entitlement.tier,
    promptLength: prompt.length
  });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_OPENAI_MODEL,
        input: prompt
      })
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("[api/ai] upstream_error", {
        status: response.status,
        error: payload?.error?.message || "unknown_openai_error"
      });

      return safeError("AI request failed. Please try again.", 502);
    }

    const output =
      String(payload?.output_text || "").trim() ||
      String(
        payload?.output?.[0]?.content?.find?.(
          (item: { type?: string; text?: string }) => item?.type === "output_text"
        )?.text || ""
      ).trim();

    if (!output) {
      return safeError("AI returned an empty response.", 502);
    }

    return NextResponse.json({ ok: true, output });
  } catch (error) {
    console.error("[api/ai] unexpected_error", {
      message: error instanceof Error ? error.message : String(error)
    });

    return safeError("AI is temporarily unavailable.", 500);
  }
}
