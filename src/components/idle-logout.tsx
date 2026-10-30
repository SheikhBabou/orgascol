"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const IDLE_TIMEOUT = 20 * 60 * 1000; // 20 minutes

export default function IdleLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }, [supabase]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, IDLE_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [resetTimer]);

  return null;
}
