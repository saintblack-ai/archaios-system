import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

type TriggerType = "cron" | "manual";

type AgentSpec = {
  name:
    | "revenue_sentinel"
    | "brief_generator"
    | "system_monitor"
    | "user_intelligence"
    | "marketing_agent"
    | "enterprise_lead_hunter"
    | "growth_optimizer";
  cron: string;
  prompt: string;
};

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OPENAI_API_KEY: string;
};

type AgentLogInsert = {
  user_id?: string | null;
  agent_name: AgentSpec["name"];
  status: "success" | "error";
  trigger: TriggerType;
  result: Record<string, unknown>;
};

const AGENTS: AgentSpec[] = [
  {
    name: "revenue_sentinel",
    cron: "*/15 * * * *",
    prompt: "Analyze revenue signals, anomalies, and near-term opportunities."
  },
  {
    name: "brief_generator",
    cron: "0 * * * *",
    prompt: "Generate an executive brief with key wins, risks, and next actions."
  },
  {
    name: "system_monitor",
    cron: "30 * * * *",
    prompt: "Summarize system health, incidents, and required remediation work."
  },
  {
    name: "user_intelligence",
    cron: "0 */2 * * *",
    prompt: "Extract user behavior insights and prioritized product actions."
  },
  {
    name: "marketing_agent",
    cron: "15 */3 * * *",
    prompt: "Produce campaign optimization findings and top experiments to run next."
  },
  {
    name: "enterprise_lead_hunter",
    cron: "0 */4 * * *",
    prompt: "Identify enterprise lead opportunities and suggested outreach angles."
  },
  {
    name: "growth_optimizer",
    cron: "45 */6 * * *",
    prompt: "Recommend growth levers with expected impact and confidence rationale."
  }
];

function assertRequiredEnv(env: Partial<Env>): asserts env is Env {
  const required: Array<keyof Env> = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY"];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

function getSupabase(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}

function getOpenAI(env: Env) {
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

function getAgentByCron(cron: string): AgentSpec | null {
  return AGENTS.find((agent) => agent.cron === cron) ?? null;
}

async function insertAgentLog(env: Env, payload: AgentLogInsert): Promise<void> {
  const supabase = getSupabase(env);
  const { error } = await supabase.from("agent_logs").insert(payload);

  if (error) {
    throw new Error(`Failed to write agent log: ${error.message}`);
  }
}

async function runAgent(env: Env, agent: AgentSpec, trigger: TriggerType): Promise<void> {
  const startedAt = new Date().toISOString();

  try {
    const openai = getOpenAI(env);
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: `${agent.prompt} Return strict JSON with keys: summary, actions, confidence.`
    });

    const result = {
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      response_id: response.id,
      summary: response.output_text ?? ""
    };

    await insertAgentLog(env, {
      agent_name: agent.name,
      status: "success",
      trigger,
      result
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);

    await insertAgentLog(env, {
      agent_name: agent.name,
      status: "error",
      trigger,
      result: {
        started_at: startedAt,
        finished_at: new Date().toISOString(),
        error: err
      }
    });
  }
}

async function getStatus(env: Env): Promise<Response> {
  const supabase = getSupabase(env);
  const results: Array<Record<string, unknown>> = [];

  for (const agent of AGENTS) {
    const { data, error } = await supabase
      .from("agent_logs")
      .select("agent_name,status,trigger,result,created_at")
      .eq("agent_name", agent.name)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      results.push({
        agent: agent.name,
        cron: agent.cron,
        status: "unknown",
        error: error.message
      });
      continue;
    }

    const latest = data?.[0] ?? null;
    results.push({
      agent: agent.name,
      cron: agent.cron,
      status: latest?.status ?? "never_run",
      trigger: latest?.trigger ?? null,
      last_run_at: latest?.created_at ?? null,
      result: latest?.result ?? null
    });
  }

  return Response.json({ ok: true, agents: results });
}

async function runScheduled(event: ScheduledEvent, env: Env): Promise<void> {
  const agent = getAgentByCron(event.cron);

  if (!agent) {
    throw new Error(`No agent mapped for cron expression: ${event.cron}`);
  }

  await runAgent(env, agent, "cron");
}

export default {
  async fetch(request: Request, env: Partial<Env>): Promise<Response> {
    try {
      assertRequiredEnv(env);
      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/api/agents/status") {
        return getStatus(env);
      }

      return Response.json({ ok: false, error: "Not found" }, { status: 404 });
    } catch (error) {
      return Response.json(
        { ok: false, error: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  },

  async scheduled(event: ScheduledEvent, env: Partial<Env>, ctx: ExecutionContext): Promise<void> {
    assertRequiredEnv(env);
    ctx.waitUntil(runScheduled(event, env));
  }
};
