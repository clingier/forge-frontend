import "server-only";
import Stripe from "stripe";
import { keys } from "./keys";

let _stripe: Stripe | undefined;

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!_stripe) {
      const stripeKey = keys().STRIPE_SECRET_KEY;
      if (!stripeKey) {
        throw new Error("STRIPE_SECRET_KEY environment variable is not set");
      }
      _stripe = new Stripe(stripeKey, {
        apiVersion: "2025-11-17.clover",
      });
    }
    return (_stripe as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type { Stripe } from "stripe";
