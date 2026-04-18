import "server-only";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const missingStripeEnvMessage = "Missing Stripe env var: STRIPE_SECRET_KEY";

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil"
    })
  : new Proxy(
      {},
      {
        get() {
          throw new Error(missingStripeEnvMessage);
        }
      }
    ) as Stripe;
