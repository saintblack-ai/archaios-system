import { createClient } from "npm:@supabase/supabase-js@2";

type EnvName =
  | "SUPABASE_URL"
  | "SUPABASE_SERVICE_ROLE_KEY";

type AgentRecord = {
  id: string;
  name: string;
  agent_type: string;
  description: string;
  enabled: boolean;
  status: string;
  schedule_cron: string | null;
  config: Record<string, unknown>;
};

type AgentJobRecord = {
  id: string;
  agent_id: string;
  agent_name: string;
  job_type: string;
  trigger: string;
  status: string;
  priority: number;
  attempts: number;
  max_attempts: number;
  scheduled_for: string;
  input: Record<string, unknown>;
  context: Record<string, unknown>;
};

const AGENT_SEED: Array<Omit<AgentRecord, "id">> = [
  {
    name: "revenue_sentinel",
    agent_type: "revenue",
    description: "Monitors revenue anomalies and payment recovery actions.",
    enabled: true,
    status: "idle",
    schedule_cron: "*/15 * * * *",
    config: { channel: "finance", mode: "analysis" },
  },
  {
    name: "brief_generator",
    agent_type: "briefing",
    description: "Builds executive summaries and next-step briefs.",
    enabled: true,
    status: "idle",
    schedule_cron: "0 * * * *",
    config: { audience: "leadership", mode: "summary" },
  },
  {
    name: "system_monitor",
    agent_type: "ops",
    description: "Tracks health, incidents, and remediation posture.",
    enabled: true,
    status: "idle",
    schedule_cron: "*/30 * * * *",
    config: { channel: "ops", mode: "health" },
  },
  {
    name: "user_intelligence",
    agent_type: "research",
    description: "Extracts user patterns and product priorities.",
    enabled: true,
    status: "idle",
    schedule_cron: "0 */2 * * *",
    config: { channel: "product", mode: "insight" },
  },
  {
    name: "marketing_agent",
    agent_type: "growth",
    description: "Prepares campaign and offer optimization outputs.",
    enabled: true,
    status: "idle",
    schedule_cron: "15 */3 * * *",
    config: { channel: "marketing", mode: "experiment" },
  },
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getEnv(name: EnvName) {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function logInfo(message: string, details?: Record<string, unknown>) {
  console.log(`[agent-orchestrator] ${message}`, details ?? {});
}

function logError(message: string, details?: Record<string, unknown>) {
  console.error(`[agent-orchestrator] ${message}`, details ?? {});
}

function getSupabase() {
  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function seedAgents() {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("agents")
    .upsert(AGENT_SEED, { onConflict: "name" });

  if (error) {
    throw new Error(`Unable to seed agents: ${error.message}`);
  }

  const { data, error: loadError } = await supabase
    .from("agents")
    .select("id, name, agent_type, description, enabled, status, schedule_cron, config")
    .in("name", AGENT_SEED.map((agent) => agent.name))
    .order("name", { ascending: true });

  if (loadError) {
    throw new Error(`Unable to load seeded agents: ${loadError.message}`);
  }

  return (data ?? []) as AgentRecord[];
}

function buildSampleJobs(agentByName: Map<string, AgentRecord>) {
  const jobs = [
    ["revenue_sentinel", "daily_scan", 10, { window: "24h" }],
    ["revenue_sentinel", "invoice_audit", 20, { window: "7d" }],
    ["brief_generator", "exec_summary", 30, { scope: "global" }],
    ["brief_generator", "board_brief", 40, { scope: "board" }],
    ["system_monitor", "health_check", 15, { region: "global" }],
    ["system_monitor", "incident_digest", 35, { severity: "all" }],
    ["user_intelligence", "persona_refresh", 25, { segment: "all" }],
    ["user_intelligence", "retention_scan", 45, { window: "30d" }],
    ["marketing_agent", "campaign_review", 18, { channel: "email" }],
    ["marketing_agent", "offer_test_queue", 28, { channel: "landing-page" }],
  ] as const;

  return jobs.map(([agentName, jobType, priority, input]) => {
    const agent = agentByName.get(agentName);
    if (!agent) {
      throw new Error(`Missing seeded agent: ${agentName}`);
    }

    return {
      agent_id: agent.id,
      agent_name: agent.name,
      job_type: jobType,
      priority,
      trigger: "seed",
      scheduled_for: new Date().toISOString(),
      input,
      context: { source: "edge-function-seed" },
    };
  });
}

async function seedTenJobs() {
  const supabase = getSupabase();
  const agents = await seedAgents();
  const jobs = buildSampleJobs(new Map(agents.map((agent) => [agent.name, agent])));
  const { data, error } = await supabase
    .from("agent_jobs")
    .insert(jobs)
    .select("id, agent_name, job_type, status, priority, scheduled_for");

  if (error) {
    throw new Error(`Unable to seed jobs: ${error.message}`);
  }

  return data ?? [];
}

function buildOutput(job: AgentJobRecord) {
  const finishedAt = new Date().toISOString();
  const summary = `${job.agent_name} completed ${job.job_type}`;
  const content = {
    finished_at: finishedAt,
    agent_name: job.agent_name,
    job_type: job.job_type,
    trigger: job.trigger,
    input: job.input,
    context: job.context,
    outcome: "processed",
    recommended_next_step: `Review ${job.job_type} output from ${job.agent_name}.`,
  };

  return {
    summary,
    content,
    token_usage: JSON.stringify(content).length,
  };
}

async function runOnce(limit = 5, workerName = "supabase-edge-orchestrator") {
  const supabase = getSupabase();
  await seedAgents();

  const { data: claimed, error: claimError } = await supabase.rpc("claim_agent_jobs", {
    p_worker_name: workerName,
    p_limit: limit,
  });

  if (claimError) {
    throw new Error(`Unable to claim jobs: ${claimError.message}`);
  }

  const jobs = (claimed ?? []) as AgentJobRecord[];
  const results: Array<Record<string, unknown>> = [];

  for (const job of jobs) {
    try {
      logInfo("Processing job", {
        job_id: job.id,
        agent_name: job.agent_name,
        job_type: job.job_type,
      });

      const output = buildOutput(job);
      const { data, error } = await supabase.rpc("complete_agent_job", {
        p_job_id: job.id,
        p_job_status: "completed",
        p_output_type: "result",
        p_output_status: "success",
        p_summary: output.summary,
        p_content: output.content,
        p_error_message: null,
        p_token_usage: output.token_usage,
      });

      if (error) {
        throw new Error(error.message);
      }

      results.push({
        job_id: job.id,
        agent_name: job.agent_name,
        status: "completed",
        summary: output.summary,
        lifecycle_row: data,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logError("Job processing failed", {
        job_id: job.id,
        agent_name: job.agent_name,
        message,
      });

      await supabase.rpc("complete_agent_job", {
        p_job_id: job.id,
        p_job_status: "failed",
        p_output_type: "error",
        p_output_status: "error",
        p_summary: `${job.agent_name} failed ${job.job_type}`,
        p_content: {
          job_id: job.id,
          agent_name: job.agent_name,
          error: message,
        },
        p_error_message: message,
        p_token_usage: null,
      });

      results.push({
        job_id: job.id,
        agent_name: job.agent_name,
        status: "failed",
        error: message,
      });
    }
  }

  return {
    claimed: jobs.length,
    processed: results.length,
    results,
  };
}

async function getStatus() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("agent_lifecycle_overview")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load lifecycle overview: ${error.message}`);
  }

  return data ?? [];
}

Deno.serve(async (request) => {
  try {
    if (request.method === "GET") {
      return json({
        ok: true,
        lifecycle: await getStatus(),
      });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, 405);
    }

    const body = await request.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action : "run_once";

    if (action === "seed_agents") {
      return json({ ok: true, agents: await seedAgents() });
    }

    if (action === "seed_test_run") {
      return json({ ok: true, jobs: await seedTenJobs() });
    }

    if (action === "run_once") {
      return json({
        ok: true,
        ...(await runOnce(
          typeof body.limit === "number" ? body.limit : 5,
          typeof body.worker_name === "string" ? body.worker_name : "supabase-edge-orchestrator",
        )),
      });
    }

    if (action === "status") {
      return json({ ok: true, lifecycle: await getStatus() });
    }

    return json({ ok: false, error: `Unsupported action: ${action}` }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logError("Request failed", { message });
    return json({ ok: false, error: message }, 500);
  }
});
