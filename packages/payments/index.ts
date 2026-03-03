import "server-only";
import Stripe from "stripe";
import { keys } from "./keys";

const stripeKey = keys().STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-11-17.clover",
});

export type { Stripe } from "stripe";
