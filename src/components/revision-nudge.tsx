"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";

interface UpcomingSession {
  id: string;
  start_time: string;
  scheduled_date: string;
  chapter?: { title: string; exam?: { subject?: { name: string } } };
}

const MESSAGES = [
  (subject: string) => `Allez, dans 10 min c'est ${subject} ! Tu vas gérer 💪`,
  (subject: string) => `C'est bientôt l'heure de ${subject} ! On s'y met, let's go 🚀`,
  (subject: string) => `${subject} dans 10 min ! Tiens bon, tu vas y arriver 🔥`,
  (subject: string) => `Petite session de ${subject} qui arrive ! Tu es prêt(e), on y va 💫`,
  (subject: string) => `Hey ! ${subject} commence bientôt. Courage, chaque session compte 🎯`,
  (subject: string) => `10 min avant ${subject} ! Prépare-toi, tu assures 😎`,
  (subject: string) => `Bientôt ${subject} ! Rappelle-toi pourquoi tu bosses, on lâche rien 💥`,
  (subject: string) => `${subject} arrive ! Une session de plus vers la réussite ✨`,
  (subject: string) => `C'est presque l'heure ! ${subject} t'attend, tu vas tout déchirer 🏆`,
  (subject: string) => `Allez on se motive ! ${subject} dans quelques minutes, go go go 🙌`,
];

const DISMISSED_KEY = "orgascol_nudge_dismissed";

export default function RevisionNudge() {
  const [nudge, setNudge] = useState<{ message: string; time: string } | null>(null);
  const supabase = createClient();

  const checkUpcoming = useCallback(async () => {
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const targetMin = nowMin + 10;
    const targetTime = `${String(Math.floor(targetMin / 60)).padStart(2, "0")}:${String(targetMin % 60).padStart(2, "0")}`;

    const { data } = await supabase
      .from("revision_sessions")
      .select("id, start_time, scheduled_date, chapter:chapters(title, exam:exams(subject:subjects(name)))")
      .eq("scheduled_date", todayStr)
      .eq("status", "pending")
      .gte("start_time", `${String(Math.floor(nowMin / 60)).padStart(2, "0")}:${String(nowMin % 60).padStart(2, "0")}`)
      .lte("start_time", targetTime)
      .order("start_time")
      .limit(1);

    if (!data || data.length === 0) {
      setNudge(null);
      return;
    }

    const session = data[0] as unknown as UpcomingSession;
    const dismissed = getDismissed();
    if (dismissed.has(session.id)) return;

    const subject = session.chapter?.exam?.subject?.name ?? "ta révision";
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)](subject);
    const [h, m] = session.start_time.split(":");
    setNudge({ message: msg, time: `${h}h${m}` });
  }, [supabase]);

  useEffect(() => {
    checkUpcoming();
    const interval = setInterval(checkUpcoming, 60_000);
    return () => clearInterval(interval);
  }, [checkUpcoming]);

  function getDismissed(): Set<string> {
    try {
      const raw = localStorage.getItem(DISMISSED_KEY);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (parsed.date !== format(new Date(), "yyyy-MM-dd")) return new Set();
      return new Set(parsed.ids ?? []);
    } catch {
      return new Set();
    }
  }

  function dismiss() {
    if (!nudge) return;
    setNudge(null);
  }

  if (!nudge) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-fade-in">
      <div className="bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 p-5 relative">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 bg-white/20 rounded-full p-2 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-sm leading-relaxed">{nudge.message}</p>
            <p className="text-xs opacity-80 mt-1.5">Session prévue à {nudge.time}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
