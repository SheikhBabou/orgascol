"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, CheckCircle2, SkipForward } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { generatePlanning } from "@/utils/planning";
import type { Exam, ScheduleSlot, RevisionSession, SessionStatus } from "@/types/database";

const METHOD_LABELS: Record<string, string> = {
  first_read: "1re lecture",
  active_review: "Révision active",
  spaced_repetition: "Répétition espacée",
  final_review: "Relecture finale",
};

const METHOD_COLORS: Record<string, string> = {
  first_read: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  active_review: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  spaced_repetition: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  final_review: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

export default function PlanningPage() {
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const { data } = await supabase
      .from("revision_sessions")
      .select("*, chapter:chapters(*, exam:exams(*, subject:subjects(*)))")
      .order("scheduled_date")
      .order("start_time");
    if (data) setSessions(data);
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);

    const [examsRes, slotsRes] = await Promise.all([
      supabase
        .from("exams")
        .select("*, subject:subjects(*), chapters(*)"),
      supabase.from("schedule_slots").select("*"),
    ]);

    const exams: Exam[] = examsRes.data ?? [];
    const slots: ScheduleSlot[] = slotsRes.data ?? [];

    const newSessions = generatePlanning(exams, slots);

    if (newSessions.length > 0) {
      // Clear old pending sessions
      await supabase
        .from("revision_sessions")
        .delete()
        .eq("status", "pending");

      await supabase.from("revision_sessions").insert(newSessions);
    }

    await loadSessions();
    setGenerating(false);
  }

  async function updateSessionStatus(id: string, status: SessionStatus) {
    await supabase
      .from("revision_sessions")
      .update({ status })
      .eq("id", id);

    if (status === "completed") {
      const session = sessions.find((s) => s.id === id);
      if (session?.chapter_id) {
        const chapterSessions = sessions.filter(
          (s) => s.chapter_id === session.chapter_id && s.id !== id
        );
        const allDone =
          chapterSessions.every(
            (s) => s.status === "completed" || s.status === "skipped"
          );
        if (allDone) {
          await supabase
            .from("chapters")
            .update({ status: "completed" })
            .eq("id", session.chapter_id);
        } else {
          await supabase
            .from("chapters")
            .update({ status: "in_progress" })
            .eq("id", session.chapter_id);
        }
      }
    }

    loadSessions();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const sessionsByDate = sessions.reduce(
    (acc, s) => {
      const date = s.scheduled_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(s);
      return acc;
    },
    {} as Record<string, RevisionSession[]>
  );

  const dates = Object.keys(sessionsByDate).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planning de révisions</h1>
          <p className="text-muted text-sm mt-1">
            {sessions.filter((s) => s.status === "pending").length} session
            {sessions.filter((s) => s.status === "pending").length !== 1
              ? "s"
              : ""}{" "}
            restante
            {sessions.filter((s) => s.status === "pending").length !== 1
              ? "s"
              : ""}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-sm disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${generating ? "animate-spin" : ""}`}
          />
          {generating ? "Génération..." : "Générer le planning"}
        </button>
      </div>

      {dates.length === 0 ? (
        <div className="bg-card-bg border border-border rounded-xl p-12 text-center space-y-4">
          <p className="text-muted">
            Aucune session de révision planifiée.
          </p>
          <p className="text-sm text-muted">
            Ajoute des examens avec des chapitres, renseigne ton emploi du
            temps, puis clique sur &quot;Générer le planning&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date}>
              <h2 className="font-semibold text-sm text-muted mb-3 uppercase tracking-wide">
                {format(parseISO(date), "EEEE d MMMM", { locale: fr })}
              </h2>
              <div className="space-y-2">
                {sessionsByDate[date].map((session) => (
                  <div
                    key={session.id}
                    className={`bg-card-bg border border-border rounded-xl p-4 flex items-center gap-4 ${
                      session.status === "completed"
                        ? "opacity-60"
                        : session.status === "skipped"
                          ? "opacity-40"
                          : ""
                    }`}
                  >
                    <div
                      className="w-2 h-full min-h-[40px] rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          session.chapter?.exam?.subject?.color ?? "#6366f1",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm ${
                          session.status === "completed"
                            ? "line-through"
                            : ""
                        }`}
                      >
                        {session.chapter?.title}
                      </p>
                      <p className="text-xs text-muted">
                        {session.chapter?.exam?.subject?.name} &middot;{" "}
                        {session.chapter?.exam?.title} &middot;{" "}
                        {session.start_time.slice(0, 5)} -{" "}
                        {session.end_time.slice(0, 5)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                        METHOD_COLORS[session.method] ?? ""
                      }`}
                    >
                      {METHOD_LABELS[session.method]}
                    </span>
                    {session.status === "pending" && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() =>
                            updateSessionStatus(session.id, "completed")
                          }
                          className="p-1.5 rounded-lg hover:bg-success/10 text-success transition-colors"
                          title="Terminé"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            updateSessionStatus(session.id, "skipped")
                          }
                          className="p-1.5 rounded-lg hover:bg-warning/10 text-warning transition-colors"
                          title="Passer"
                        >
                          <SkipForward className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {session.status === "completed" && (
                      <span className="text-xs text-success font-medium">
                        Fait
                      </span>
                    )}
                    {session.status === "skipped" && (
                      <span className="text-xs text-warning font-medium">
                        Passé
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
