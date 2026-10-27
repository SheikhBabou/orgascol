import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-09-30.endive",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  mensuel: {
    name: "Mensuel",
    price: 1199,
    interval: "month" as const,
    description: "11,99€/mois - résiliable à tout moment",
  },
  annuel: {
    name: "Annuel (année scolaire)",
    price: 999,
    interval: "month" as const,
    intervalCount: 10,
    description: "9,99€/mois - 99,90€ sur 10 mois",
  },
};
