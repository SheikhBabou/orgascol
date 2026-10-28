"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TrialGuard() {
  useEffect(() => {
    const supabase = createClient();

    async function checkTrialStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const status = user.user_metadata?.subscription_status;
      if (status === "active") return;

      const createdAt = new Date(user.created_at);
      const trialEnd = new Date(createdAt);
      trialEnd.setDate(trialEnd.getDate() + 15);

      const now = new Date();
      if (now >= trialEnd && status !== "active") {
        const pathname = window.location.pathname;
        if (!pathname.startsWith("/upgrade")) {
          window.location.href = "/upgrade";
        }
      }
    }

    checkTrialStatus();
  }, []);

  return null;
}
