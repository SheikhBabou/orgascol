import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;

      if (userId) {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            plan,
            subscription_status: "active",
            stripe_subscription_id: session.subscription,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      const { data } = await supabaseAdmin.auth.admin.listUsers();
      const user = data.users.find(
        (u) => u.user_metadata?.stripe_customer_id === customerId
      );

      if (user) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            subscription_status: "expired",
            stripe_subscription_id: null,
          },
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;

      const { data } = await supabaseAdmin.auth.admin.listUsers();
      const user = data.users.find(
        (u) => u.user_metadata?.stripe_customer_id === customerId
      );

      if (user) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: { subscription_status: "past_due" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
