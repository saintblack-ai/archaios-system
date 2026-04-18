import { NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";
import { persistRevenueEvent, REVENUE_WEBHOOK_EVENT_TYPES } from "../../../lib/revenueSignals";

export const runtime = "nodejs";

const supportedRevenueEventTypes = new Set<string>(REVENUE_WEBHOOK_EVENT_TYPES);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing Stripe webhook configuration." }, { status: 400 });
  }

  const rawBody = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    if (!supportedRevenueEventTypes.has(event.type)) {
      return NextResponse.json({
        received: true,
        handled: false,
        ignored: true,
        eventType: event.type
      });
    }

    const result = await persistRevenueEvent(event);
    return NextResponse.json({
      received: true,
      handled: Boolean(result.normalized),
      eventType: event.type,
      summary: result.summary
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
