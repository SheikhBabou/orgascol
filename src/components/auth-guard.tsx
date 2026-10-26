"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthGuard() {
  useEffect(() => {
    const supabase = createClient();

    function checkSession() {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) {
          window.location.href = "/auth";
        }
      });
    }

    // bfcache restore: browser back/forward restores page from memory
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) {
        checkSession();
      }
    }

    // tab visibility change: user switches back to tab
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    }

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
