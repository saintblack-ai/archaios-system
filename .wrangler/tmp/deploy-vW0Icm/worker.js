var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var DEFAULT_MODEL = "gpt-4o-mini";
var MAX_MESSAGE_CHARS = 4e3;
var OPENAI_TIMEOUT_MS = 15e3;
var DEFAULT_RATE_LIMIT_PER_MINUTE = 30;
var worker_default = {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = buildCorsHeaders(origin, env.ALLOWED_ORIGINS || "");
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, corsHeaders);
    }
    const authError = validateAuth(request, env.AUTH_TOKEN);
    if (authError) {
      return json({ error: authError }, 401, corsHeaders);
    }
    try {
      const body = await safeJson(request);
      const message = String(body?.message ?? "").trim();
      if (!message) {
        return json({ error: "Missing 'message'." }, 400, corsHeaders);
      }
      if (message.length > MAX_MESSAGE_CHARS) {
        return json(
          { error: `Message too long (max ${MAX_MESSAGE_CHARS} chars).` },
          413,
          corsHeaders
        );
      }
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const rateLimitPerMinute = parsePositiveInt(
        env.RATE_LIMIT_PER_MINUTE,
        DEFAULT_RATE_LIMIT_PER_MINUTE
      );
      const rate = await checkRateLimit(env.RATE_LIMIT_KV, ip, rateLimitPerMinute, 60);
      if (!rate.allowed) {
        return json(
          {
            error: "Rate limit exceeded",
            limit: rateLimitPerMinute,
            window_seconds: 60,
            retry_after_seconds: rate.retryAfterSeconds
          },
          429,
          { ...corsHeaders, "Retry-After": String(rate.retryAfterSeconds) }
        );
      }
      const apiKey = env.OPENAI_API_KEY;
      const protocol = String(env.ARCHAIOS_PROTOCOL || "").trim();
      const model = env.OPENAI_MODEL || DEFAULT_MODEL;
      if (!apiKey) {
        return json({ error: "OPENAI_API_KEY is not set." }, 500, corsHeaders);
      }
      if (!protocol) {
        return json({ error: "ARCHAIOS_PROTOCOL is not set." }, 500, corsHeaders);
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort("timeout"), OPENAI_TIMEOUT_MS);
      const openaiRes = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          instructions: `${protocol}

You are ARCHAIOS Worker Node.`,
          input: [
            {
              role: "system",
              content: [
                {
                  type: "input_text",
                  text: `${protocol}

You are ARCHAIOS Worker Node.`
                }
              ]
            },
            {
              role: "user",
              content: [{ type: "input_text", text: message }]
            }
          ]
        })
      }).finally(() => clearTimeout(timeout));
      if (!openaiRes.ok) {
        const detail = await openaiRes.text().catch(() => "");
        return json(
          {
            error: "OpenAI upstream error",
            status: openaiRes.status,
            detail: detail.slice(0, 800)
          },
          502,
          corsHeaders
        );
      }
      const data = await openaiRes.json();
      const reply = extractResponseText(data);
      return json({ reply, model }, 200, corsHeaders);
    } catch (e) {
      const msg = String(e?.message || e);
      const status = msg.includes("timeout") ? 504 : 500;
      return json({ error: msg }, status, corsHeaders);
    }
  }
};
function validateAuth(request, authToken) {
  if (!authToken) return "AUTH_TOKEN is not configured.";
  const bearer = request.headers.get("Authorization") || "";
  const token = bearer.startsWith("Bearer ") ? bearer.slice(7).trim() : (request.headers.get("X-Auth-Token") || "").trim();
  if (!token) return "Missing bearer token.";
  if (token !== authToken) return "Invalid token.";
  return null;
}
__name(validateAuth, "validateAuth");
async function checkRateLimit(kv, ip, limit, windowSeconds) {
  if (!kv || typeof kv.get !== "function" || typeof kv.put !== "function") {
    return { allowed: true, retryAfterSeconds: 0 };
  }
  const nowSec = Math.floor(Date.now() / 1e3);
  const bucket = Math.floor(nowSec / windowSeconds);
  const key = `rl:${ip}:${bucket}`;
  const raw = await kv.get(key);
  const count = raw ? Number(raw) : 0;
  if (count >= limit) {
    const nextWindowStart = (bucket + 1) * windowSeconds;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, nextWindowStart - nowSec)
    };
  }
  await kv.put(key, String(count + 1), { expirationTtl: windowSeconds + 5 });
  return { allowed: true, retryAfterSeconds: 0 };
}
__name(checkRateLimit, "checkRateLimit");
function extractResponseText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const output = Array.isArray(data?.output) ? data.output : [];
  const texts = [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === "output_text" && typeof part?.text === "string") {
        texts.push(part.text);
      }
    }
  }
  const combined = texts.join("\n").trim();
  return combined || "(No content returned from OpenAI)";
}
__name(extractResponseText, "extractResponseText");
function parsePositiveInt(raw, fallback) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}
__name(parsePositiveInt, "parsePositiveInt");
function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...headers
    }
  });
}
__name(json, "json");
function buildCorsHeaders(origin, allowedOriginsCsv) {
  const allowed = allowedOriginsCsv.split(",").map((s) => s.trim()).filter(Boolean);
  const allowOrigin = allowed.length === 0 ? "*" : allowed.includes(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Auth-Token",
    Vary: "Origin"
  };
}
__name(buildCorsHeaders, "buildCorsHeaders");
async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
__name(safeJson, "safeJson");
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
