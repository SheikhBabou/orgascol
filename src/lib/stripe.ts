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
    price: 599,
    interval: "month" as const,
    description: "5,99€/mois - résiliable à tout moment",
  },
  annuel: {
    name: "Annuel",
    price: 4999,
    interval: "year" as const,
    description: "49,99€/an - paiement en une fois",
  },
};
