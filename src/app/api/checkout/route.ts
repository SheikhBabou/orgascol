import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe, PLANS } from "@/lib/stripe";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { plan, annual_payment } = await request.json();

  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let customerId = user.user_metadata?.stripe_customer_id;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase.auth.updateUser({
      data: { stripe_customer_id: customerId },
    });
  }

  const planData = PLANS[plan as keyof typeof PLANS];
  const origin = request.headers.get("origin") || "http://localhost:3000";

  if (plan === "annuel" && annual_payment === "once") {
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Orga'Scol — Annuel (année scolaire)" },
            unit_amount: 9990,
          },
          quantity: 1,
        },
      ],
      metadata: { plan: "annuel", payment_type: "once", user_id: user.id },
      success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade`,
    });

    return NextResponse.json({ url: session.url });
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Orga'Scol — ${planData.name}`,
          },
          unit_amount: planData.price,
          recurring: {
            interval: planData.interval,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { plan, payment_type: "recurring", user_id: user.id },
    success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/upgrade`,
  });

  return NextResponse.json({ url: session.url });
}
