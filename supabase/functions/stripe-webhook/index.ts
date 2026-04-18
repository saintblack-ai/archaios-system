import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@18.4.0";

type RevenueEventRow = {
  stripe_event_id: string;
  event_type: string;
  amount: number | null;
  revenue_delta: number;
  currency: string;
  customer_id: string | null;
  customer_email: string | null;
  subscription_id: string | null;
  payment_intent_id: string | null;
  invoice_id: string | null;
  status: string;
  occurred_at: string;
  metadata: Record<string, unknown>;
  user_id?: string | null;
};

type RevenueSummaryRow = {
  scope: "global";
  total_revenue: number;
  mrr: number;
  active_subscriptions: number;
  failed_payments: number;
  last_payment_at: string | null;
  revenue_status: string;
  updated_at: string;
  source_event_id: string | null;
};

const supportedEventTypes = new Set([
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "invoice.paid",
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getEnv(name: string) {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getWebhookSecrets() {
  const value = getEnv("STRIPE_WEBHOOK_SECRET");
  return value
    .split(/[,\n]/)
    .map((secret) => secret.trim())
    .filter(Boolean);
}

function safeString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function centsToDollars(value: number | null | undefined) {
  return typeof value === "number" ? Number((value / 100).toFixed(2)) : null;
}

function readMetadata(metadata: Stripe.Metadata | null | undefined) {
  return Object.fromEntries(
    Object.entries(metadata ?? {}).filter(([, value]) => typeof value === "string"),
  );
}

function logInfo(message: string, details?: Record<string, unknown>) {
  console.log(`[stripe-webhook] ${message}`, details ?? {});
}

function logError(message: string, details?: Record<string, unknown>) {
  console.error(`[stripe-webhook] ${message}`, details ?? {});
}

function createStripeClient() {
  return new Stripe(getEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2025-02-24.acacia",
  });
}

function createSupabaseAdmin() {
  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function constructStripeEvent(
  stripe: Stripe,
  rawBody: string,
  signature: string,
) {
  const secrets = getWebhookSecrets();
  let lastError: unknown = null;

  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to validate Stripe webhook signature.");
}

function normalizeEvent(event: Stripe.Event): RevenueEventRow | null {
  const occurredAt = new Date(event.created * 1000).toISOString();

  switch (event.type) {
    case "invoice.payment_succeeded":
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const metadata = readMetadata(invoice.metadata);
      const amount = centsToDollars(invoice.amount_paid ?? invoice.amount_due ?? invoice.total);

      return {
        stripe_event_id: event.id,
        event_type: event.type,
        amount,
        revenue_delta: amount ?? 0,
        currency: (invoice.currency ?? "usd").toUpperCase(),
        customer_id: safeString(invoice.customer),
        customer_email: safeString(invoice.customer_email),
        subscription_id: safeString(invoice.subscription),
        payment_intent_id: safeString(invoice.payment_intent),
        invoice_id: safeString(invoice.id),
        status: "paid",
        occurred_at: occurredAt,
        metadata,
        user_id: safeString(metadata.user_id),
      };
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const metadata = readMetadata(invoice.metadata);
      const amount = centsToDollars(invoice.amount_due ?? invoice.total ?? invoice.amount_remaining);

      return {
        stripe_event_id: event.id,
        event_type: event.type,
        amount,
        revenue_delta: 0,
        currency: (invoice.currency ?? "usd").toUpperCase(),
        customer_id: safeString(invoice.customer),
        customer_email: safeString(invoice.customer_email),
        subscription_id: safeString(invoice.subscription),
        payment_intent_id: safeString(invoice.payment_intent),
        invoice_id: safeString(invoice.id),
        status: "failed",
        occurred_at: occurredAt,
        metadata: {
          ...metadata,
          attempt_count: invoice.attempt_count ?? 0,
        },
        user_id: safeString(metadata.user_id),
      };
    }
    default:
      return null;
  }
}

async function insertRevenueEvent(
  supabase: SupabaseClient,
  row: RevenueEventRow,
) {
  const { error } = await supabase
    .from("revenue_events")
    .upsert(row, { onConflict: "stripe_event_id" });

  if (!error) {
    return;
  }

  logError("Failed to persist revenue event", {
    stripe_event_id: row.stripe_event_id,
    event_type: row.event_type,
    message: error.message,
    code: error.code,
    details: error.details,
  });

  throw new Error(`Unable to persist revenue event: ${error.message}`);
}

async function loadSubscriptionStatuses(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status");

  if (!error) {
    return data ?? [];
  }

  logInfo("Subscriptions table unavailable while rebuilding revenue summary", {
    message: error.message,
    code: error.code,
    details: error.details,
  });

  return [];
}

async function upsertRevenueSummary(
  supabase: SupabaseClient,
  sourceEventId: string | null,
) {
  const { data: events, error: eventsError } = await supabase
    .from("revenue_events")
    .select("event_type, revenue_delta, subscription_id, status, occurred_at");

  if (eventsError) {
    logError("Failed to load revenue events for summary rebuild", {
      message: eventsError.message,
      code: eventsError.code,
      details: eventsError.details,
    });
    throw new Error(`Unable to load revenue events: ${eventsError.message}`);
  }

  const subscriptions = await loadSubscriptionStatuses(supabase);
  const revenueEvents = events ?? [];
  const totalRevenue = Number(
    revenueEvents.reduce((sum, item) => sum + Number(item.revenue_delta ?? 0), 0).toFixed(2),
  );
  const last30Days = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const mrr = Number(
    revenueEvents
      .filter((item) =>
        item.subscription_id &&
        Number(item.revenue_delta ?? 0) > 0 &&
        Date.parse(item.occurred_at) >= last30Days
      )
      .reduce((sum, item) => sum + Number(item.revenue_delta ?? 0), 0)
      .toFixed(2),
  );
  const failedPayments = revenueEvents.filter((item) =>
    item.event_type === "invoice.payment_failed" || item.status === "failed"
  ).length;
  const lastPayment = revenueEvents
    .filter((item) => Number(item.revenue_delta ?? 0) > 0)
    .sort((left, right) => right.occurred_at.localeCompare(left.occurred_at))[0];
  const activeSubscriptions = subscriptions.filter((item) =>
    item.status === "active" || item.status === "trialing"
  ).length;

  const summary: RevenueSummaryRow = {
    scope: "global",
    total_revenue: totalRevenue,
    mrr,
    active_subscriptions: activeSubscriptions,
    failed_payments: failedPayments,
    last_payment_at: lastPayment?.occurred_at ?? null,
    revenue_status: failedPayments > 0
      ? "Attention Required"
      : totalRevenue > 0
      ? "Healthy"
      : "Standby",
    updated_at: new Date().toISOString(),
    source_event_id: sourceEventId,
  };

  const { error } = await supabase
    .from("revenue_summary")
    .upsert(summary, { onConflict: "scope" });

  if (error) {
    logError("Failed to upsert revenue summary", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    throw new Error(`Unable to persist revenue summary: ${error.message}`);
  }

  return summary;
}

async function insertAgentLog(
  supabase: SupabaseClient,
  row: RevenueEventRow,
  summary: RevenueSummaryRow,
) {
  const { error } = await supabase
    .from("agent_logs")
    .insert({
      user_id: row.user_id ?? null,
      agent_name: "stripe_webhook",
      status: row.status === "failed" ? "error" : "success",
      trigger: "stripe_webhook",
      result: {
        event_type: row.event_type,
        stripe_event_id: row.stripe_event_id,
        amount: row.amount,
        revenue_status: summary.revenue_status,
        source_event_id: summary.source_event_id,
      },
    });

  if (error) {
    logInfo("Agent log insert skipped", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    logError("Missing Stripe-Signature header");
    return json({ error: "Missing Stripe-Signature header" }, 400);
  }

  let rawBody = "";

  try {
    rawBody = await request.text();
    const stripe = createStripeClient();
    const supabase = createSupabaseAdmin();
    const event = constructStripeEvent(stripe, rawBody, signature);

    logInfo("Received Stripe webhook", {
      event_id: event.id,
      event_type: event.type,
    });

    if (!supportedEventTypes.has(event.type)) {
      return json({
        received: true,
        handled: false,
        message: "Ignored event",
        event_type: event.type,
      });
    }

    const normalized = normalizeEvent(event);
    if (!normalized) {
      return json({
        received: true,
        handled: false,
        message: "Ignored event",
        event_type: event.type,
      });
    }

    await insertRevenueEvent(supabase, normalized);
    const summary = await upsertRevenueSummary(supabase, normalized.stripe_event_id);
    await insertAgentLog(supabase, normalized, summary);

    logInfo("Stripe webhook processed successfully", {
      event_id: event.id,
      event_type: event.type,
      total_revenue: summary.total_revenue,
      mrr: summary.mrr,
      failed_payments: summary.failed_payments,
    });

    return json({
      received: true,
      handled: true,
      message: "Processed event",
      event_type: event.type,
      summary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook error";
    const status = message.toLowerCase().includes("signature") ? 400 : 500;

    logError("Stripe webhook processing failed", {
      message,
      signature_present: Boolean(signature),
      body_length: rawBody.length,
    });

    return json({ error: message }, status);
  }
});
