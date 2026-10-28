"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, SkipForward, CalendarDays, BookOpen, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { generatePlanning } from "@/utils/planning";
import type { Exam, ScheduleSlot, RevisionSession, SessionStatus } from "@/types/database";
import Link from "next/link";

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
  const [hasExams, setHasExams] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(false);
  const supabase = createClient();

  const autoGenerate = useCallback(async () => {
    const [examsRes, slotsRes] = await Promise.all([
      supabase
        .from("exams")
        .select("*, subject:subjects(*), chapters(*)"),
      supabase.from("schedule_slots").select("*"),
    ]);

    const exams: Exam[] = examsRes.data ?? [];
    const slots: ScheduleSlot[] = slotsRes.data ?? [];

    setHasExams(exams.length > 0);
    setHasSchedule(slots.length > 0);

    const hasUpcomingChapters = exams.some(
      (e) =>
        new Date(e.exam_date) >= new Date() &&
        (e.chapters ?? []).some((c) => c.status !== "completed")
    );

    if (hasUpcomingChapters && slots.length > 0) {
      const newSessions = generatePlanning(exams, slots);

      if (newSessions.length > 0) {
        await supabase
          .from("revision_sessions")
          .delete()
          .eq("status", "pending");

        await supabase.from("revision_sessions").insert(newSessions);
      }
    }

    const { data } = await supabase
      .from("revision_sessions")
      .select("*, chapter:chapters(*, exam:exams(*, subject:subjects(*)))")
      .order("scheduled_date")
      .order("start_time");
    if (data) setSessions(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    autoGenerate();
  }, [autoGenerate]);

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

    const { data } = await supabase
      .from("revision_sessions")
      .select("*, chapter:chapters(*, exam:exams(*, subject:subjects(*)))")
      .order("scheduled_date")
      .order("start_time");
    if (data) setSessions(data);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const pending = sessions.filter((s) => s.status === "pending");
  const completed = sessions.filter((s) => s.status === "completed");

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

  if (!hasExams && !hasSchedule) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Planning de révisions</h1>
          <p className="text-muted text-sm mt-1">
            Ton planning se génère automatiquement
          </p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-8 text-center space-y-4">
          <CalendarDays className="w-12 h-12 text-muted mx-auto" />
          <h2 className="text-lg font-semibold">Pour commencer</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Renseigne tes matières, tes examens avec leurs chapitres, et ton emploi du temps.
            Le planning de révisions se créera automatiquement.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/subjects"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Ajouter des matières
            </Link>
            <Link
              href="/schedule"
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-background transition-colors"
            >
              Saisir l&apos;emploi du temps
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasExams) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Planning de révisions</h1>
          <p className="text-muted text-sm mt-1">
            Ton planning se génère automatiquement
          </p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-8 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-muted mx-auto" />
          <h2 className="text-lg font-semibold">Ajoute tes examens</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Ton emploi du temps est renseigné. Ajoute maintenant tes examens avec leurs chapitres
            pour que le planning de révisions se génère.
          </p>
          <Link
            href="/exams"
            className="inline-flex px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Ajouter des examens
          </Link>
        </div>
      </div>
    );
  }

  if (!hasSchedule) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Planning de révisions</h1>
          <p className="text-muted text-sm mt-1">
            Ton planning se génère automatiquement
          </p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-8 text-center space-y-4">
          <Clock className="w-12 h-12 text-muted mx-auto" />
          <h2 className="text-lg font-semibold">Saisis ton emploi du temps</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Tes examens sont enregistrés. Renseigne maintenant tes heures de cours
            pour que le planning utilise tes créneaux libres.
          </p>
          <Link
            href="/schedule"
            className="inline-flex px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Saisir l&apos;emploi du temps
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planning de révisions</h1>
        <p className="text-muted text-sm mt-1">
          Généré automatiquement selon tes examens et ton emploi du temps
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card-bg border border-border rounded-xl p-4">
          <p className="text-xs text-muted">Sessions restantes</p>
          <p className="text-2xl font-bold mt-1">{pending.length}</p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-4">
          <p className="text-xs text-muted">Terminées</p>
          <p className="text-2xl font-bold mt-1 text-success">{completed.length}</p>
        </div>
        <div className="bg-card-bg border border-border rounded-xl p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-muted">Progression</p>
          <p className="text-2xl font-bold mt-1 text-primary">
            {sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="bg-card-bg border border-border rounded-xl p-8 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
          <h2 className="text-lg font-semibold">Tout est à jour !</h2>
          <p className="text-sm text-muted">
            Aucune session de révision à planifier. Ajoute de nouveaux examens ou chapitres pour générer de nouvelles sessions.
          </p>
        </div>
      ) : (
        <div className="space-y-6 stagger-children">
          {dates.map((date) => (
            <div key={date}>
              <h2 className="font-semibold text-sm text-muted mb-3 uppercase tracking-wide">
                {format(parseISO(date), "EEEE d MMMM", { locale: fr })}
              </h2>
              <div className="space-y-2 stagger-children">
                {sessionsByDate[date].map((session) => (
                  <div
                    key={session.id}
                    className={`bg-card-bg border border-border rounded-xl p-4 flex items-center gap-4 card-interactive ${
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
