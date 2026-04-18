import Stripe from "stripe";
import { config, getCancelUrl, getSuccessUrl } from "./config.js";
import { supabaseAdmin } from "./supabase.js";
import { PAID_TIER_IDS } from "../../shared/pricing.js";
import { appendStripeEventLog } from "./stripeEventLog.js";

export const stripe = config.stripeSecretKey
  ? new Stripe(config.stripeSecretKey, { apiVersion: "2025-01-27.acacia" })
  : null;

export const STRIPE_PRODUCTS = {
  pro: {
    priceId: config.priceIds.pro
  },
  elite: {
    priceId: config.priceIds.elite
  }
};

function normalizeTier(tier) {
  return tier === "elite" ? "elite" : tier === "pro" ? "pro" : "free";
}

export function requirePriceId(tier) {
  if (!PAID_TIER_IDS.includes(tier)) {
    return null;
  }

  return STRIPE_PRODUCTS[tier]?.priceId || null;
}

export async function createCheckoutForUser(user, tier) {
  if (!stripe) {
    throw new Error("Missing Stripe configuration");
  }

  const priceId = requirePriceId(tier);
  if (!priceId) {
    throw new Error(`Missing Stripe price id for ${tier}`);
  }

  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: getSuccessUrl(),
    cancel_url: getCancelUrl(),
    customer_email: user.email || undefined,
    metadata: {
      user_id: user.id,
      tier
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        tier
      }
    }
  });
}

async function getStripeCustomerIdForUser(userId) {
  if (!supabaseAdmin || !userId) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.stripe_customer_id || null;
}

export async function createCustomerPortalSessionForUser(userId, returnUrl) {
  if (!stripe) {
    throw new Error("Missing Stripe configuration");
  }

  const stripeCustomerId = await getStripeCustomerIdForUser(userId);
  if (!stripeCustomerId) {
    throw new Error("No Stripe customer found for this account");
  }

  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl || config.frontendUrl || getCancelUrl()
  });
}

function toIsoOrNull(unixSeconds) {
  if (!unixSeconds) {
    return null;
  }

  return new Date(unixSeconds * 1000).toISOString();
}

export async function upsertSubscriptionRecord({
  userId,
  tier,
  status,
  stripeCustomerId,
  stripeSubscriptionId,
  currentPeriodEnd
}) {
  if (!supabaseAdmin || !userId) {
    return;
  }

  const payload = {
    user_id: userId,
    tier: normalizeTier(tier),
    status: status || "active",
    stripe_customer_id: stripeCustomerId || null,
    stripe_subscription_id: stripeSubscriptionId || null,
    current_period_end: currentPeriodEnd || null
  };

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(payload, {
      onConflict: "user_id"
    });

  if (error) {
    throw new Error(error.message);
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      tier: payload.tier,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "id"
    }
  );

  if (profileError) {
    throw new Error(profileError.message);
  }
}

export async function handleStripeWebhookEvent(rawBody, signature) {
  if (!stripe) {
    throw new Error("Missing Stripe configuration");
  }

  if (!config.stripeWebhookSecret) {
    throw new Error("Missing Stripe webhook secret");
  }

  const event = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret);
  await appendStripeEventLog({
    source: "webhook",
    eventType: event.type,
    status: "received"
  }).catch(() => null);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.mode === "subscription") {
      await upsertSubscriptionRecord({
        userId: session.metadata?.user_id,
        tier: session.metadata?.tier,
        status: "active",
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        currentPeriodEnd: null
      });
    }
    await appendStripeEventLog({
      source: "webhook",
      eventType: event.type,
      status: "processed",
      userId: session?.metadata?.user_id || null,
      tier: normalizeTier(session?.metadata?.tier)
    }).catch(() => null);
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    await upsertSubscriptionRecord({
      userId: subscription.metadata?.user_id,
      tier: subscription.metadata?.tier,
      status: subscription.status,
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: toIsoOrNull(subscription.current_period_end)
    });
    await appendStripeEventLog({
      source: "webhook",
      eventType: event.type,
      normalizedEventType: event.type === "customer.subscription.updated" ? "subscription.updated" : null,
      status: "processed",
      userId: subscription?.metadata?.user_id || null,
      tier: normalizeTier(subscription?.metadata?.tier)
    }).catch(() => null);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    await upsertSubscriptionRecord({
      userId: subscription.metadata?.user_id,
      tier: "free",
      status: "canceled",
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: toIsoOrNull(subscription.current_period_end)
    });
    await appendStripeEventLog({
      source: "webhook",
      eventType: event.type,
      status: "processed",
      userId: subscription?.metadata?.user_id || null,
      tier: "free"
    }).catch(() => null);
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    const userId =
      invoice.subscription_details?.metadata?.user_id ||
      invoice.lines?.data?.[0]?.metadata?.user_id ||
      null;
    const tier =
      invoice.subscription_details?.metadata?.tier ||
      invoice.lines?.data?.[0]?.metadata?.tier ||
      "free";
    await upsertSubscriptionRecord({
      userId,
      tier,
      status: "active",
      stripeCustomerId: invoice.customer,
      stripeSubscriptionId: invoice.subscription,
      currentPeriodEnd: null
    });
    await appendStripeEventLog({
      source: "webhook",
      eventType: event.type,
      status: "processed",
      userId,
      tier: normalizeTier(tier)
    }).catch(() => null);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    const userId =
      invoice.subscription_details?.metadata?.user_id ||
      invoice.lines?.data?.[0]?.metadata?.user_id ||
      null;
    const tier =
      invoice.subscription_details?.metadata?.tier ||
      invoice.lines?.data?.[0]?.metadata?.tier ||
      "free";

    await upsertSubscriptionRecord({
      userId,
      tier,
      status: "past_due",
      stripeCustomerId: invoice.customer,
      stripeSubscriptionId: invoice.subscription,
      currentPeriodEnd: null
    });
    await appendStripeEventLog({
      source: "webhook",
      eventType: event.type,
      status: "processed",
      userId,
      tier: normalizeTier(tier)
    }).catch(() => null);
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "customer.subscription.created" &&
    event.type !== "customer.subscription.updated" &&
    event.type !== "customer.subscription.deleted" &&
    event.type !== "invoice.paid" &&
    event.type !== "invoice.payment_failed"
  ) {
    await appendStripeEventLog({
      source: "webhook",
      eventType: event.type,
      status: "ignored"
    }).catch(() => null);
  }

  return event;
}
