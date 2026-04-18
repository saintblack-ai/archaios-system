import type Stripe from "stripe";
import { supabaseAdmin } from "./supabaseAdmin";

export const REVENUE_WEBHOOK_EVENT_TYPES = [
  "checkout.session.completed",
  "invoice.paid",
  "payment_intent.succeeded",
  "payment_intent.payment_failed"
] as const;

export type RevenueSummary = {
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

export type RevenueEventFeedItem = {
  stripe_event_id: string | null;
  event_type: string;
  amount: number | null;
  revenue_delta: number;
  status: string;
  occurred_at: string;
  customer_email: string | null;
};

type NormalizedRevenueEvent = {
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
  user_id: string | null;
};

type SupabaseResult<T> = {
  data?: T | null;
  error?: { message?: string | null } | null;
};

function centsToDollars(value: number | null | undefined) {
  return typeof value === "number" ? Number((value / 100).toFixed(2)) : null;
}

function assertSupabaseSuccess<T>(result: SupabaseResult<T>, context: string) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message || "Unknown Supabase error"}`);
  }

  return result.data ?? null;
}

export function normalizeStripeRevenueEvent(event: Stripe.Event): NormalizedRevenueEvent | null {
  const occurred_at = new Date(event.created * 1000).toISOString();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        stripe_event_id: event.id,
        event_type: event.type,
        amount: centsToDollars(session.amount_total),
        revenue_delta: 0,
        currency: (session.currency || "usd").toUpperCase(),
        customer_id: typeof session.customer === "string" ? session.customer : null,
        customer_email: session.customer_details?.email || session.customer_email || null,
        subscription_id: typeof session.subscription === "string" ? session.subscription : null,
        payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        invoice_id: null,
        status: "completed",
        occurred_at,
        metadata: session.metadata || {},
        user_id: session.metadata?.user_id || null
      };
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceSubscription = (invoice as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null;
      }).subscription;
      const invoicePaymentIntent = (invoice as Stripe.Invoice & {
        payment_intent?: string | Stripe.PaymentIntent | null;
      }).payment_intent;

      return {
        stripe_event_id: event.id,
        event_type: event.type,
        amount: centsToDollars(invoice.amount_paid),
        revenue_delta: centsToDollars(invoice.amount_paid) || 0,
        currency: (invoice.currency || "usd").toUpperCase(),
        customer_id: typeof invoice.customer === "string" ? invoice.customer : null,
        customer_email: invoice.customer_email || null,
        subscription_id: typeof invoiceSubscription === "string" ? invoiceSubscription : null,
        payment_intent_id: typeof invoicePaymentIntent === "string" ? invoicePaymentIntent : null,
        invoice_id: invoice.id || null,
        status: "paid",
        occurred_at,
        metadata: invoice.metadata || {},
        user_id: invoice.metadata?.user_id || null
      };
    }
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const intentInvoice = (intent as Stripe.PaymentIntent & {
        invoice?: string | Stripe.Invoice | null;
      }).invoice;
      const hasInvoice = Boolean(intentInvoice);

      return {
        stripe_event_id: event.id,
        event_type: event.type,
        amount: centsToDollars(intent.amount_received || intent.amount),
        revenue_delta: hasInvoice ? 0 : centsToDollars(intent.amount_received || intent.amount) || 0,
        currency: (intent.currency || "usd").toUpperCase(),
        customer_id: typeof intent.customer === "string" ? intent.customer : null,
        customer_email: null,
        subscription_id: null,
        payment_intent_id: intent.id,
        invoice_id: typeof intentInvoice === "string" ? intentInvoice : null,
        status: "succeeded",
        occurred_at,
        metadata: intent.metadata || {},
        user_id: intent.metadata?.user_id || null
      };
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const intentInvoice = (intent as Stripe.PaymentIntent & {
        invoice?: string | Stripe.Invoice | null;
      }).invoice;

      return {
        stripe_event_id: event.id,
        event_type: event.type,
        amount: centsToDollars(intent.amount),
        revenue_delta: 0,
        currency: (intent.currency || "usd").toUpperCase(),
        customer_id: typeof intent.customer === "string" ? intent.customer : null,
        customer_email: null,
        subscription_id: null,
        payment_intent_id: intent.id,
        invoice_id: typeof intentInvoice === "string" ? intentInvoice : null,
        status: "failed",
        occurred_at,
        metadata: {
          ...(intent.metadata || {}),
          last_payment_error: intent.last_payment_error?.message || null
        },
        user_id: intent.metadata?.user_id || null
      };
    }
    default:
      return null;
  }
}

export async function persistRevenueEvent(event: Stripe.Event) {
  const normalized = normalizeStripeRevenueEvent(event);
  if (!normalized) {
    return { normalized: null, summary: null };
  }

  assertSupabaseSuccess(
    await supabaseAdmin
    .from("revenue_events")
    .upsert(normalized, { onConflict: "stripe_event_id" }),
    "Unable to persist revenue event"
  );

  if (normalized.user_id && normalized.subscription_id && (normalized.event_type === "checkout.session.completed" || normalized.event_type === "invoice.paid")) {
    assertSupabaseSuccess(
      await supabaseAdmin
      .from("subscriptions")
      .upsert({
        user_id: normalized.user_id,
        tier: typeof normalized.metadata.tier === "string" ? normalized.metadata.tier : "pro",
        status: "active",
        stripe_customer_id: normalized.customer_id,
        stripe_subscription_id: normalized.subscription_id,
        updated_at: normalized.occurred_at
      }, { onConflict: "user_id" }),
      "Unable to sync subscription revenue state"
    );
  }

  const summary = await rebuildRevenueSummary(normalized.stripe_event_id);

  try {
    assertSupabaseSuccess(
      await supabaseAdmin.from("agent_logs").insert({
        user_id: normalized.user_id,
        agent_name: "stripe_webhook",
        status: normalized.status === "failed" ? "error" : "success",
        trigger: "stripe_webhook",
        result: {
          event_type: normalized.event_type,
          amount: normalized.amount,
          revenue_status: summary.revenue_status,
          last_payment_at: summary.last_payment_at
        }
      }),
      "Unable to log Stripe webhook result"
    );
  } catch (error) {
    console.warn(error);
  }

  return { normalized, summary };
}

async function persistRevenueSummary(summary: RevenueSummary) {
  const upsertResult = await supabaseAdmin
    .from("revenue_summary")
    .upsert(summary, { onConflict: "scope" });

  if (!upsertResult.error) {
    return;
  }

  const fallbackResult = await supabaseAdmin
    .from("revenue_summary")
    .update({
      total_revenue: summary.total_revenue,
      mrr: summary.mrr,
      active_subscriptions: summary.active_subscriptions,
      failed_payments: summary.failed_payments,
      last_payment_at: summary.last_payment_at,
      revenue_status: summary.revenue_status,
      updated_at: summary.updated_at,
      source_event_id: summary.source_event_id
    })
    .eq("id", 1);

  assertSupabaseSuccess(fallbackResult, "Unable to persist revenue summary");
}

export async function rebuildRevenueSummary(sourceEventId: string | null = null): Promise<RevenueSummary> {
  const [eventsResult, subscriptionsResult] = await Promise.all([
    supabaseAdmin
      .from("revenue_events")
      .select("event_type, revenue_delta, subscription_id, status, occurred_at"),
    supabaseAdmin
      .from("subscriptions")
      .select("status")
  ]);

  const events = assertSupabaseSuccess(eventsResult, "Unable to load revenue events");
  const subscriptions = assertSupabaseSuccess(subscriptionsResult, "Unable to load subscriptions");

  const revenueEvents = events || [];
  const total_revenue = Number(
    revenueEvents.reduce((sum, event) => sum + Number(event.revenue_delta || 0), 0).toFixed(2)
  );
  const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const mrr = Number(
    revenueEvents
      .filter((event) => event.subscription_id && Date.parse(event.occurred_at) >= last30Days && Number(event.revenue_delta || 0) > 0)
      .reduce((sum, event) => sum + Number(event.revenue_delta || 0), 0)
      .toFixed(2)
  );
  const failed_payments = revenueEvents.filter((event) => event.event_type === "payment_intent.payment_failed" || event.status === "failed").length;
  const lastPayment = revenueEvents
    .filter((event) => Number(event.revenue_delta || 0) > 0)
    .sort((left, right) => right.occurred_at.localeCompare(left.occurred_at))[0];
  const active_subscriptions = (subscriptions || []).filter((item) => item.status === "active" || item.status === "trialing").length;
  const revenue_status = failed_payments > 0 ? "Attention Required" : total_revenue > 0 ? "Healthy" : "Standby";

  const summary: RevenueSummary = {
    scope: "global",
    total_revenue,
    mrr,
    active_subscriptions,
    failed_payments,
    last_payment_at: lastPayment?.occurred_at || null,
    revenue_status,
    updated_at: new Date().toISOString(),
    source_event_id: sourceEventId
  };

  await persistRevenueSummary(summary);

  return summary;
}

export async function fetchRevenueSummary(): Promise<RevenueSummary> {
  const scopedResult = await supabaseAdmin
    .from("revenue_summary")
    .select("*")
    .eq("scope", "global")
    .maybeSingle();

  if (!scopedResult.error && scopedResult.data) {
    return scopedResult.data as RevenueSummary;
  }

  const legacyResult = await supabaseAdmin
    .from("revenue_summary")
    .select("scope, total_revenue, mrr, active_subscriptions, failed_payments, last_payment_at, revenue_status, updated_at, source_event_id")
    .eq("id", 1)
    .maybeSingle();

  if (!legacyResult.error && legacyResult.data) {
    return {
      scope: "global",
      ...(legacyResult.data as Omit<RevenueSummary, "scope">)
    };
  }

  return rebuildRevenueSummary(null);
}

export async function fetchRecentRevenueEvents(limit = 10): Promise<RevenueEventFeedItem[]> {
  const result = await supabaseAdmin
    .from("revenue_events")
    .select("stripe_event_id, event_type, amount, revenue_delta, status, occurred_at, customer_email")
    .order("occurred_at", { ascending: false })
    .limit(limit);

  return (assertSupabaseSuccess(result, "Unable to load recent revenue events") || []) as RevenueEventFeedItem[];
}
