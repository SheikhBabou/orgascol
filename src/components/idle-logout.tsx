"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const IDLE_TIMEOUT = 20 * 60 * 1000; // 20 min sans activité sur la page
const ABSENCE_TIMEOUT = 60 * 60 * 1000; // 1h d'absence (onglet fermé / navigateur quitté)
const STORAGE_KEY = "orgascol_last_activity";

export default function IdleLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  const logout = useCallback(async () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }, [supabase]);

  const saveActivity = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
  }, []);

  const checkAbsence = useCallback(() => {
    try {
      const last = localStorage.getItem(STORAGE_KEY);
      if (last && Date.now() - Number(last) > ABSENCE_TIMEOUT) {
        logout();
        return true;
      }
    } catch {}
    return false;
  }, [logout]);

  const resetTimer = useCallback(() => {
    saveActivity();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, IDLE_TIMEOUT);
  }, [logout, saveActivity]);

  useEffect(() => {
    if (checkAbsence()) return;

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        checkAbsence();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [resetTimer, checkAbsence]);

  return null;
}
